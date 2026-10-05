import { supabase } from "@/integrations/supabase/client";
import { IJSDS2_FINANCIALS, type Manuscript } from "@/types/ijsds2";

export interface InitializeGate1PaymentParams {
  manuscriptId: string;
  authorEmail: string;
  authorName: string;
  referralCode?: string;
}

export interface InitializeGate2PaymentParams {
  manuscriptId: string;
  authorEmail: string;
  authorName: string;
}

/**
 * Validates a reviewer's referral code.
 */
export async function validateReferralCode(referralCode: string): Promise<{ valid: boolean; reviewerId?: string }> {
  if (!referralCode || !referralCode.trim()) {
    return { valid: false };
  }
  const cleanCode = referralCode.trim().toUpperCase();
  const { data, error } = await supabase
    .from("reviewer_profiles" as any)
    .select("id, is_available")
    .eq("referral_code", cleanCode)
    .maybeSingle();

  if (error || !data) {
    return { valid: false };
  }

  return { valid: true, reviewerId: (data as any).id };
}

/**
 * Prepares Paystack payment configuration for Gate 1 (₦5,000 non-refundable evaluation fee).
 */
export function getGate1PaymentConfig({
  manuscriptId,
  authorEmail,
  authorName,
  referralCode,
}: InitializeGate1PaymentParams) {
  return {
    email: authorEmail,
    // Paystack amount is in kobo (100 kobo = ₦1)
    amount: IJSDS2_FINANCIALS.GATE_1_EVALUATION_FEE_NAIRA * 100,
    metadata: {
      custom_fields: [
        { display_name: "Manuscript ID", variable_name: "manuscript_id", value: manuscriptId },
        { display_name: "Payment Gate", variable_name: "gate", value: "GATE_1" },
        { display_name: "Payment Type", variable_name: "payment_type", value: "EVALUATION_FEE" },
        { display_name: "Author Name", variable_name: "author_name", value: authorName },
        { display_name: "Referral Code", variable_name: "referral_code", value: referralCode || "" },
      ],
    },
  };
}

/**
 * Prepares Paystack payment configuration for Gate 2 (₦25,500 APC).
 */
export function getGate2PaymentConfig({
  manuscriptId,
  authorEmail,
  authorName,
}: InitializeGate2PaymentParams) {
  return {
    email: authorEmail,
    amount: IJSDS2_FINANCIALS.GATE_2_APC_NAIRA * 100,
    metadata: {
      custom_fields: [
        { display_name: "Manuscript ID", variable_name: "manuscript_id", value: manuscriptId },
        { display_name: "Payment Gate", variable_name: "gate", value: "GATE_2" },
        { display_name: "Payment Type", variable_name: "payment_type", value: "APC" },
        { display_name: "Author Name", variable_name: "author_name", value: authorName },
      ],
    },
  };
}

/**
 * Records payment completion in the payment ledger and handles Gate 2 revenue splits & reviewer commission.
 */
export async function processPaymentSuccess({
  manuscriptId,
  gatewayReference,
  gate,
  rawPayload,
}: {
  manuscriptId: string;
  gatewayReference: string;
  gate: "GATE_1" | "GATE_2";
  rawPayload?: any;
}) {
  const isGate1 = gate === "GATE_1";
  const amountNaira = isGate1 
    ? IJSDS2_FINANCIALS.GATE_1_EVALUATION_FEE_NAIRA 
    : IJSDS2_FINANCIALS.GATE_2_APC_NAIRA;
  const paymentType = isGate1 ? "EVALUATION_FEE" : "APC";

  // 1. Record in payment_ledger
  const { data: paymentRecord, error: paymentError } = await supabase
    .from("payment_ledger" as any)
    .insert({
      manuscript_id: manuscriptId,
      gateway_reference: gatewayReference,
      payment_type: paymentType,
      amount_naira: amountNaira,
      status: "success",
      raw_webhook_payload: rawPayload || {},
    })
    .select("id")
    .single();

  if (paymentError) {
    console.error("Failed to insert payment record:", paymentError);
    throw new Error(`Failed to log payment ledger: ${paymentError.message}`);
  }

  const paymentLedgerId = (paymentRecord as any)?.id;

  if (isGate1) {
    // Transition manuscript to SUBMITTED and schedule 24-hour Stage 2 audit
    const scheduledAuditTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await supabase
      .from("manuscripts" as any)
      .update({
        current_state: "IN_AUDIT",
        audit_scheduled_for: scheduledAuditTime,
      })
      .eq("id", manuscriptId);

    return { success: true, gate: "GATE_1", scheduledAuditTime };
  } else {
    // Gate 2 settlement:
    // A. Record distribution split into gate2_distribution_ledger
    const split = IJSDS2_FINANCIALS.GATE_2_SPLIT;
    await supabase
      .from("gate2_distribution_ledger" as any)
      .insert({
        manuscript_id: manuscriptId,
        payment_ledger_id: paymentLedgerId,
        tech_support_naira: split.TECH_SUPPORT_NAIRA,
        designer_naira: split.DESIGNER_NAIRA,
        journal_account_naira: split.JOURNAL_ACCOUNT_NAIRA,
        journal_manager_naira: split.JOURNAL_MANAGER_NAIRA,
      });

    // B. Check if manuscript was referred by a reviewer; if so, credit ₦1,000
    const { data: manuscriptData } = await supabase
      .from("manuscripts" as any)
      .select("referred_by_reviewer_id")
      .eq("id", manuscriptId)
      .single();

    const referringReviewerId = (manuscriptData as any)?.referred_by_reviewer_id;
    if (referringReviewerId) {
      // Record referral payout ledger
      await supabase
        .from("referral_payout_ledger" as any)
        .insert({
          reviewer_id: referringReviewerId,
          manuscript_id: manuscriptId,
          amount_naira: IJSDS2_FINANCIALS.REFERRAL_COMMISSION_NAIRA,
          status: "CREDITED",
        });

      // Update reviewer wallet balance
      const { data: revProfile } = await supabase
        .from("reviewer_profiles" as any)
        .select("wallet_balance_naira")
        .eq("id", referringReviewerId)
        .single();

      const currentBal = Number((revProfile as any)?.wallet_balance_naira || 0);
      await supabase
        .from("reviewer_profiles" as any)
        .update({
          wallet_balance_naira: currentBal + IJSDS2_FINANCIALS.REFERRAL_COMMISSION_NAIRA,
        })
        .eq("id", referringReviewerId);
    }

    // C. Transition manuscript state to APC_PAID
    await supabase
      .from("manuscripts" as any)
      .update({
        current_state: "APC_PAID",
      })
      .eq("id", manuscriptId);

    return { success: true, gate: "GATE_2", referralCredited: !!referringReviewerId };
  }
}

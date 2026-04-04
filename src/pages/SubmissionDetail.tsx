import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getSubmission } from "@/lib/submissionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Calendar, User, Download } from "lucide-react";
import {
  ProcessinFeeDialog,
  VettingDialog,
} from "@/components/submission/paystackDialogBox";
import { SubmissionFileManager } from "@/components/submission/SubmissionFileManager";
import { EditorFileManager } from "@/components/editor/EditorFileManager";
import ReceiptDown from "@/components/receiptGeneration/receiptDownload";
import { SendRecieptMail } from "@/lib/emailService";
import { uploadPdf } from "@/lib/cloudinary";
import { api } from "@/lib/apiClient";
interface SubmissionDetails {
  id: string;
  status: string;
  submitted_at: string;
  submitter_id: string;
  article_id: string;
  article: {
    id: string;
    title: string;
    abstract: string;
    subject_area: string;
    authors: any;
    manuscript_file_url: string | null;
    vetting_fee: boolean;
    processing_fee: boolean;
  };
  submitter: {
    full_name: string;
    email: string;
  };
}

export const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [vet, setvet] = useState(false);
  const [processing, setprocessing] = useState(false);
  const isEditor = !!(profile?.is_editor || profile?.is_admin);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user && submissionId) {
      fetchSubmissionDetails();
    }
  }, [user, loading, submissionId, navigate]);

  const fetchSubmissionDetails = async () => {
    try {
      const data = await getSubmission(submissionId!);
      setSubmission(data as any);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch submission details",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "revision_requested":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  let userData = null;
  let userDataPro = null;
  {
    submission
      ? (userData = {
          email: submission.submitter.email,
          // amount: 512500, // ₦5,125 in kobo
          amount: 1000, // ₦5,125 in kobo
          metadata: {
            custom_fields: [
              {
                display_name: "Name",
                variable_name: "name",
                value: submission.submitter.full_name,
              },
            ],
          },
          onSuccess: (response: { reference: string }) => {
            setvet(false);
            onSuccess(response, "vetting", 512500);
          },
          onClose: () =>
            toast({
              title: "Payment Cancelled",
              description: "Vetting fee payment was not completed.",
              variant: "destructive",
            }),
        })
      : null;
  }

  {
    submission
      ? (userDataPro = {
          email: submission.submitter.email,
          amount: 2050000, // ₦20,500 in kobo
          metadata: {
            custom_fields: [
              {
                display_name: "Name",
                variable_name: "name",
                value: submission.submitter.full_name,
              },
            ],
          },
          onSuccess: (response: { reference: string }) => {
            setprocessing(false);
            onSuccess(response, "processing", 2050000);
          },
          onClose: () =>
            toast({
              title: "Payment Cancelled",
              description: "Processing fee payment was not completed.",
              variant: "destructive",
            }),
        })
      : null;
  }

  const onSuccess = async (
    pReponse: { reference: string },
    type: string,
    amount: number,
  ) => {
    try {
      const transactionReference = pReponse.reference;

      // 1. Verify payment with backend (backend also sends confirmation email to author + editors)
      const { success, data } = await api.post<{
        success: boolean;
        data: { status: boolean };
      }>("/api/verify-payment", {
        reference: transactionReference,
        amount,
        articleId: submission.article.id,
        type,
      });
      if (!success) throw new Error("Server error during payment verification");
      if (!data.status) throw new Error("Payment could not be verified");

      // 2. Generate and email a PDF receipt (separate from backend confirmation email)
      const isVetting = type === "vetting";
      const amountLabel = isVetting ? "5,125" : "20,500";
      const typeLabel = isVetting ? "vetting fee" : "processing fee";

      const blob = await ReceiptDown({
        name: submission.submitter.full_name,
        amount: amountLabel,
        type: typeLabel,
        reference: transactionReference,
      });
      const receiptUrl = await uploadPdf(blob);

      // Use the receipt email template (distinct from backend's payment-confirmed email)
      await SendRecieptMail(
        user.id,
        submission.submitter.full_name,
        submission.article.title,
        receiptUrl,
        typeLabel,
      );

      toast({
        title: "Payment Successful",
        description: `Your ${typeLabel} of ₦${amountLabel} has been verified. A receipt has been sent to your email.`,
      });

      // 3. Refresh submission so payment badges update immediately
      await fetchSubmissionDetails();
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Payment Failed",
        description:
          error?.message ?? "Please contact support or try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <LoadingSpinner size="lg" text="Loading submission details..." />
        </main>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
            <div className="relative py-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4 absolute top-1 left-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative py-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4 absolute top-1 left-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Submission Details
            </h1>
            <Badge className={getStatusColor(submission.status)}>
              {submission.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    {submission.article.title}
                  </h3>
                  {submission.article.subject_area && (
                    <Badge variant="secondary" className="mb-4">
                      {submission.article.subject_area}
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2">Abstract</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {submission.article.abstract}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2">Authors</h4>
                  {submission.article.authors &&
                  Array.isArray(submission.article.authors) ? (
                    <div className="space-y-2">
                      {submission.article.authors.map(
                        (author: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{author.name}</span>
                            {author.affiliation && (
                              <span className="text-muted-foreground">
                                ({author.affiliation})
                              </span>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No author information available
                    </p>
                  )}
                </div>

                {submission.article.manuscript_file_url && (
                  <div>
                    <h4 className="font-medium text-lg mb-2">Manuscript</h4>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          submission.article.manuscript_file_url,
                          "_blank",
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Manuscript
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Management */}
            <SubmissionFileManager
              submissionId={submissionId!}
              articleId={submission.article.id}
              isAuthor={user?.id === submission.submitter_id}
              vettingFee={submission.article.vetting_fee}
              processingFee={submission.article.processing_fee}
            />

            {/* Editor File Management */}
            {isEditor && (
              <EditorFileManager
                submissionId={submissionId!}
                articleId={submission.article.id}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Submission Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submitter</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.submitter.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {submission.submitter.email}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Current Status</p>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="py-3 mt-3">
              <CardHeader>
                <CardTitle>Publication Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vetting Fee */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Vetting Fee</p>
                    <p className="text-xs text-muted-foreground">₦5,125</p>
                  </div>
                  {submission.article.vetting_fee ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Paid ✓
                    </Badge>
                  ) : (
                    <button
                      className="rounded-sm bg-black text-white px-3 py-1 h-9 text-sm hover:bg-gray-800 transition-colors"
                      onClick={() => setvet(true)}
                    >
                      Pay
                    </button>
                  )}
                </div>
                {/* Processing Fee */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Processing Fee</p>
                    <p className="text-xs text-muted-foreground">₦20,500</p>
                  </div>
                  {submission.article.processing_fee ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Paid ✓
                    </Badge>
                  ) : (
                    <button
                      className="rounded-sm bg-black text-white px-3 py-1 h-9 text-sm hover:bg-gray-800 transition-colors"
                      onClick={() => setprocessing(true)}
                    >
                      Pay
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
            <VettingDialog userData={userData} vet={vet} setvet={setvet} />
            <ProcessinFeeDialog
              userData={userDataPro}
              processing={processing}
              setprocessing={setprocessing}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

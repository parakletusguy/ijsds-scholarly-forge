-- ==============================================================================
-- IJSDS 2.0 Core Architecture Migration (v2.4.0-PROD)
-- Includes:
-- 1. pgvector and uuid extensions
-- 2. Enums: manuscript_state, audit_run_status, citation_resolution_status
-- 3. Core Tables:
--    - reviewer_profiles (with HNSW vector index & referral engine)
--    - manuscripts (state machine, vector embedding, 28-day batch release target)
--    - manuscript_integrity_audits (versioned Stage 2 audit ledger)
--    - manuscript_citations (in-text & biblio resolution ledger with HNSW index)
--    - citation_recommendations (related-paper recommendation graph)
--    - referral_payout_ledger (₦1,000 reviewer referral incentive)
--    - payment_ledger (Gate 1 ₦5k & Gate 2 ₦25.5k payment tracking)
--    - gate2_distribution_ledger (₦25,500 split: Tech, Designer, Journal, Manager)
-- 4. Reviewer Vector Matching Function with COPE COI Firewall
-- 5. Row-Level Security (RLS) policies
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE public.manuscript_state AS ENUM (
        'DRAFT_PENDING_FEE1',
        'SUBMITTED',
        'IN_AUDIT',
        'AUDIT_REJECTED',
        'AUDIT_REVISION_REQUESTED',
        'AUDIT_PASSED_PENDING_APC',
        'APC_PAID',
        'REVIEWER_MATCHED',
        'IN_PEER_REVIEW',
        'AUTHOR_REVISION_REQUESTED',
        'ACCEPTED',
        'IN_PRODUCTION',
        'READY_FOR_RELEASE',
        'PUBLISHED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.audit_run_status AS ENUM (
        'QUEUED',
        'RUNNING',
        'COMPLETED',
        'FAILED',
        'MANUAL_REVIEW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.citation_resolution_status AS ENUM (
        'VALIDATED',
        'PARTIAL_MATCH',
        'UNRESOLVED',
        'METADATA_MISMATCH'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Core Tables

-- Table: reviewer_profiles
CREATE TABLE IF NOT EXISTS public.reviewer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    wallet_balance_naira NUMERIC(10, 2) DEFAULT 0.00,
    expertise_keywords TEXT[] DEFAULT '{}',
    expertise_vector vector(1536),
    is_available BOOLEAN DEFAULT TRUE,
    active_load INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast Cosine similarity on reviewer expertise
CREATE INDEX IF NOT EXISTS idx_reviewer_vector 
ON public.reviewer_profiles 
USING hnsw (expertise_vector vector_cosine_ops);

-- Table: manuscripts
CREATE TABLE IF NOT EXISTS public.manuscripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_by_reviewer_id UUID REFERENCES public.reviewer_profiles(id) ON DELETE SET NULL,
    current_state public.manuscript_state NOT NULL DEFAULT 'DRAFT_PENDING_FEE1',
    raw_file_r2_key TEXT NOT NULL,
    parsed_payload JSONB DEFAULT '{}'::jsonb,
    abstract_vector vector(1536),
    doi TEXT UNIQUE,
    audit_scheduled_for TIMESTAMPTZ,
    audit_completed_at TIMESTAMPTZ,
    target_publication_year INT,
    target_publication_month INT,
    published_at TIMESTAMPTZ,
    audit_revision_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manuscripts_state 
ON public.manuscripts(current_state);

CREATE INDEX IF NOT EXISTS idx_manuscripts_author 
ON public.manuscripts(author_id);

CREATE INDEX IF NOT EXISTS idx_manuscripts_batch 
ON public.manuscripts(target_publication_year, target_publication_month, current_state);

-- Table: manuscript_integrity_audits (Versioned Stage 2 Audit Ledger)
CREATE TABLE IF NOT EXISTS public.manuscript_integrity_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
    revision_no INT NOT NULL,
    status public.audit_run_status NOT NULL DEFAULT 'QUEUED',
    plagiarism_score NUMERIC(6,5),
    plagiarism_risk VARCHAR(20),
    plagiarism_provider VARCHAR(80),
    ai_risk_score NUMERIC(6,5),
    ai_risk_band VARCHAR(20),
    ai_detector_provider VARCHAR(80),
    ai_detector_model_version VARCHAR(120),
    citation_validation_score NUMERIC(6,5),
    unresolved_citation_count INT DEFAULT 0,
    citation_warning_count INT DEFAULT 0,
    requires_human_review BOOLEAN DEFAULT FALSE,
    policy_rules_hit JSONB DEFAULT '[]'::jsonb,
    evidence_payload JSONB DEFAULT '{}'::jsonb,
    author_report_r2_key TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(manuscript_id, revision_no)
);

CREATE INDEX IF NOT EXISTS idx_integrity_audits_manuscript 
ON public.manuscript_integrity_audits(manuscript_id, revision_no);

-- Table: manuscript_citations (Granular Citation Validation Ledger)
CREATE TABLE IF NOT EXISTS public.manuscript_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES public.manuscript_integrity_audits(id) ON DELETE CASCADE,
    bibliography_index INT,
    raw_reference TEXT NOT NULL,
    in_text_contexts JSONB DEFAULT '[]'::jsonb,
    normalized_title TEXT,
    normalized_authors JSONB DEFAULT '[]'::jsonb,
    publication_year INT,
    supplied_doi TEXT,
    resolved_doi TEXT,
    crossref_work_id TEXT,
    openalex_work_id TEXT,
    resolution_status public.citation_resolution_status NOT NULL,
    metadata_match_score NUMERIC(6,5),
    semantic_relevance_score NUMERIC(6,5),
    citation_context_vector vector(1536),
    warning_codes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast Cosine similarity on citation contexts
CREATE INDEX IF NOT EXISTS idx_citation_context_vector 
ON public.manuscript_citations 
USING hnsw (citation_context_vector vector_cosine_ops);

-- Table: citation_recommendations (Related & Cross-Referenced Articles)
CREATE TABLE IF NOT EXISTS public.citation_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES public.manuscript_integrity_audits(id) ON DELETE CASCADE,
    source VARCHAR(30) NOT NULL, -- CROSSREF | OPENALEX | LOCAL_INDEX
    external_work_id TEXT,
    doi TEXT,
    title TEXT NOT NULL,
    publication_year INT,
    relevance_score NUMERIC(6,5) NOT NULL,
    graph_proximity_score NUMERIC(6,5),
    recommendation_reason TEXT,
    rank_position INT NOT NULL,
    selected_by_author BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: payment_ledger
CREATE TABLE IF NOT EXISTS public.payment_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
    gateway_reference TEXT UNIQUE NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('EVALUATION_FEE', 'APC')),
    amount_naira NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    raw_webhook_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: referral_payout_ledger
CREATE TABLE IF NOT EXISTS public.referral_payout_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES public.reviewer_profiles(id) ON DELETE CASCADE,
    manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
    amount_naira NUMERIC(10, 2) DEFAULT 1000.00,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CREDITED', 'WITHDRAWN')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: gate2_distribution_ledger
CREATE TABLE IF NOT EXISTS public.gate2_distribution_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
    payment_ledger_id UUID REFERENCES public.payment_ledger(id) ON DELETE CASCADE,
    tech_support_naira NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
    designer_naira NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
    journal_account_naira NUMERIC(10, 2) NOT NULL DEFAULT 12000.00,
    journal_manager_naira NUMERIC(10, 2) NOT NULL DEFAULT 9500.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_gate2_split_totals_25500 CHECK (
        tech_support_naira + designer_naira + journal_account_naira + journal_manager_naira = 25500.00
    )
);

-- 4. Reviewer Vector Matching Function with COPE COI Firewall
CREATE OR REPLACE FUNCTION public.match_reviewers_for_manuscript(
    target_manuscript_id UUID, 
    match_limit INT DEFAULT 5
)
RETURNS TABLE (
    reviewer_id UUID,
    similarity_score FLOAT8
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        rp.id AS reviewer_id,
        (1 - (rp.expertise_vector <=> m.abstract_vector))::FLOAT8 AS similarity_score
    FROM public.reviewer_profiles rp
    JOIN public.manuscripts m ON m.id = target_manuscript_id
    WHERE rp.is_available = TRUE
      AND rp.active_load < 3
      AND rp.id != COALESCE(
          m.referred_by_reviewer_id,
          '00000000-0000-0000-0000-000000000000'::uuid
      )
      AND rp.expertise_vector IS NOT NULL
      AND m.abstract_vector IS NOT NULL
    ORDER BY rp.expertise_vector <=> m.abstract_vector
    LIMIT match_limit;
$$;

-- 5. Row-Level Security (RLS)
ALTER TABLE public.reviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscript_integrity_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscript_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_payout_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate2_distribution_ledger ENABLE ROW LEVEL SECURITY;

-- reviewer_profiles policies
CREATE POLICY "Reviewer profiles viewable by authenticated users"
ON public.reviewer_profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Reviewers can update own profile"
ON public.reviewer_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Reviewers can insert own profile"
ON public.reviewer_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- manuscripts policies
CREATE POLICY "Authors can view own manuscripts"
ON public.manuscripts FOR SELECT TO authenticated
USING (
    auth.uid() = author_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.is_editor = true OR profiles.is_reviewer = true))
);

CREATE POLICY "Public can view published manuscripts"
ON public.manuscripts FOR SELECT
USING (current_state = 'PUBLISHED');

CREATE POLICY "Authors can create manuscripts"
ON public.manuscripts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and editors can update manuscripts"
ON public.manuscripts FOR UPDATE TO authenticated
USING (
    auth.uid() = author_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_editor = true)
);

-- integrity audits policies
CREATE POLICY "Authors can view own audits"
ON public.manuscript_integrity_audits FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND m.author_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_editor = true)
);

-- citations policies
CREATE POLICY "Authors can view own citations"
ON public.manuscript_citations FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND m.author_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_editor = true)
);

-- recommendations policies
CREATE POLICY "Authors can view own recommendations"
ON public.citation_recommendations FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND m.author_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_editor = true)
);

CREATE POLICY "Authors can update recommendation selection"
ON public.citation_recommendations FOR UPDATE TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND m.author_id = auth.uid())
);

-- payment_ledger policies
CREATE POLICY "Authors can view own payments"
ON public.payment_ledger FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND m.author_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_editor = true)
);

-- referral_payout_ledger policies
CREATE POLICY "Reviewers can view own referral earnings"
ON public.referral_payout_ledger FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.reviewer_profiles rp WHERE rp.id = reviewer_id AND rp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_editor = true)
);

-- gate2_distribution_ledger policies
CREATE POLICY "Editors can view gate 2 distributions"
ON public.gate2_distribution_ledger FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_editor = true)
);

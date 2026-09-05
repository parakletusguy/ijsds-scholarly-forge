import type { Article, ArticleAuthor } from "./articleService";
import { buildArticleSlug } from "./articleSlug";

export const DOAJ_CONFIG = {
  journalTitle: "International Journal of Social Work and Development Studies",
  publisher: "International Journal of Social Work and Development Studies",
  issnPrint: "3115-6940",
  issnOnline: "3115-6932",
  country: "NG",
  language: "eng",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  licenseType: "CC BY",
  licenseVersion: "4.0",
  siteUrl: "https://ijsds.org",
} as const;

export interface DOAJValidationCheck {
  valid: boolean;
  message: string;
}

export interface DOAJValidationResult {
  isValid: boolean;
  canExport: boolean;
  checks: {
    coreData: DOAJValidationCheck;
    authors: DOAJValidationCheck;
    noEmails: DOAJValidationCheck;
    identifiers: DOAJValidationCheck;
    context: DOAJValidationCheck;
  };
  diagnostics: {
    hasHtmlInTitleOrAbstract: boolean;
    invalidOrcids: string[];
    emailsDetectedInAffiliations: string[];
  };
  errors: string[];
  warnings: string[];
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const HTML_TAG_REGEX = /<[^>]*>/;
const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-[\dX]{4}$/;

/**
 * Strips rich-text HTML tags and unescapes stray entities to prevent XML parser breakage.
 */
export function stripHtml(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Validates and normalizes an ORCID iD.
 * DOAJ requires canonical URI format (https://orcid.org/XXXX-XXXX-XXXX-XXXX) or clean 16 digits.
 * If invalid, returns null so the malformed string is omitted from the deposit rather than rejecting the article.
 */
export function validateAndNormalizeOrcid(orcid?: string | null): {
  isValid: boolean;
  normalized: string | null;
  error?: string;
} {
  if (!orcid || !orcid.trim()) {
    return { isValid: true, normalized: null };
  }

  const clean = orcid.trim().replace(/^https?:\/\/orcid\.org\//i, "").trim();

  if (ORCID_REGEX.test(clean)) {
    return { isValid: true, normalized: `https://orcid.org/${clean}` };
  }

  return {
    isValid: false,
    normalized: null,
    error: `Invalid ORCID: "${orcid}". Expected 16-digit format (e.g., 0000-0002-1825-0097).`,
  };
}

/**
 * Strips any emails from affiliation strings to prevent accidental privacy leakage.
 */
export function sanitizeAffiliation(affiliation?: string | null): string {
  if (!affiliation) return "";
  return affiliation.replace(EMAIL_REGEX, "").trim().replace(/\s{2,}/g, " ");
}

/**
 * Validates an article against the 5 mandatory DOAJ metadata requirements
 * and runs automated pre-flight diagnostics (ORCID format, HTML detection, email check).
 */
export function validateDoajMetadata(article: Article): DOAJValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const invalidOrcids: string[] = [];
  const emailsDetectedInAffiliations: string[] = [];

  // Diagnostic: HTML check in title / abstract
  const hasHtml = HTML_TAG_REGEX.test(article.title || "") || HTML_TAG_REGEX.test(article.abstract || "");

  // 1. Core Article Data: Title, abstract, full-text URL
  const cleanTitle = stripHtml(article.title);
  const cleanAbstract = stripHtml(article.abstract);
  const hasTitle = cleanTitle.length > 0;
  const hasAbstract = cleanAbstract.length > 0;
  const hasUrl = !!article.manuscript_file_url || !!article.id;

  if (!hasTitle) errors.push("Article title is missing");
  if (!hasAbstract) errors.push("Article abstract is missing (required by DOAJ)");
  if (!hasUrl) warnings.push("Direct full-text URL cannot be resolved");

  if (hasHtml) {
    warnings.push("Rich-text HTML tags detected in title or abstract; these will be automatically stripped for XML compliance.");
  }

  const coreDataValid = hasTitle && hasAbstract;

  // 2. Author Details: First/last names, institutional affiliations, ORCID
  const rawAuthors: ArticleAuthor[] = Array.isArray(article.authors)
    ? article.authors
    : typeof article.authors === "string"
    ? [{ name: article.authors, email: "" }]
    : [];

  const hasAuthors = rawAuthors.length > 0;
  const authorsHaveNames = hasAuthors && rawAuthors.every((a) => !!a.name && stripHtml(a.name).length > 0);
  const authorsMissingAffiliation = rawAuthors.filter(
    (a) => !a.affiliation || stripHtml(a.affiliation).length === 0
  );

  if (!hasAuthors) errors.push("At least one author is required");
  else if (!authorsHaveNames) errors.push("All authors must have complete names");
  if (authorsMissingAffiliation.length > 0) {
    warnings.push(`${authorsMissingAffiliation.length} author(s) lack institutional affiliations (recommended for DOAJ)`);
  }

  // Check each author's ORCID
  rawAuthors.forEach((a, i) => {
    if (a.orcid) {
      const orcidCheck = validateAndNormalizeOrcid(a.orcid);
      if (!orcidCheck.isValid && orcidCheck.error) {
        invalidOrcids.push(`Author ${i + 1} (${a.name || "Unnamed"}): ${orcidCheck.error}`);
        warnings.push(`Author ${i + 1} has an invalid ORCID ("${a.orcid}"); it will be omitted from the deposit to prevent DOAJ API rejection.`);
      }
    }
  });

  const authorsValid = hasAuthors && authorsHaveNames;

  // 3. No Author Emails: DOAJ strictly prohibits including author email addresses
  rawAuthors.forEach((a, i) => {
    if (a.affiliation && EMAIL_REGEX.test(a.affiliation)) {
      emailsDetectedInAffiliations.push(`Author ${i + 1} (${a.name || "Unnamed"}): Email address found in affiliation.`);
      errors.push(`Author ${i + 1} (${a.name || "Unnamed"}) has an email address in the affiliation field (DOAJ strictly prohibits author emails)`);
    }
  });

  const noEmailsValid = emailsDetectedInAffiliations.length === 0;

  // 4. Identifiers: ISSN and DOI
  const doi = article.doi || article.crossrefDoi;
  const hasDoi = !!doi && doi.trim().length > 0;

  if (!hasDoi) {
    warnings.push("Article has no assigned DOI (strongly recommended before depositing to DOAJ)");
  }

  const identifiersValid = !!DOAJ_CONFIG.issnPrint && !!DOAJ_CONFIG.issnOnline;

  // 5. Publication Context: Date, volume, issue, page numbers
  const hasVolume = article.volume !== undefined && article.volume !== null;
  const hasIssue = article.issue !== undefined && article.issue !== null;
  const hasDate = !!article.publication_date || !!article.submission_date;
  const hasPages =
    (article.page_start !== undefined && article.page_start !== null) ||
    (article.page_end !== undefined && article.page_end !== null);

  if (!hasVolume) warnings.push("Volume number is missing");
  if (!hasIssue) warnings.push("Issue number is missing");
  if (!hasDate) warnings.push("Publication date is missing");
  if (!hasPages) warnings.push("Page numbers are not specified");

  const contextValid = hasDate;
  const isValid = coreDataValid && authorsValid && noEmailsValid && identifiersValid;
  const canExport = hasTitle && hasAuthors;

  return {
    isValid,
    canExport,
    checks: {
      coreData: {
        valid: coreDataValid,
        message: coreDataValid
          ? "Title, abstract, and direct full-text URL are complete"
          : "Missing required title or abstract",
      },
      authors: {
        valid: authorsValid,
        message: authorsValid
          ? `${rawAuthors.length} author(s) with valid names${
              authorsMissingAffiliation.length === 0 ? " and affiliations" : ""
            }`
          : "Missing authors or incomplete author names",
      },
      noEmails: {
        valid: noEmailsValid,
        message: noEmailsValid
          ? "Compliant: Author emails are strictly excluded from metadata payload"
          : "Email address detected in author affiliation field",
      },
      identifiers: {
        valid: identifiersValid && hasDoi,
        message: hasDoi
          ? `Journal ISSNs (${DOAJ_CONFIG.issnPrint} / ${DOAJ_CONFIG.issnOnline}) and DOI (${doi}) present`
          : `Journal ISSNs present. DOI is not yet assigned.`,
      },
      context: {
        valid: hasVolume && hasIssue && hasDate,
        message:
          hasVolume && hasIssue
            ? `Volume ${article.volume}, Issue ${article.issue}${
                article.publication_date
                  ? ` (${new Date(article.publication_date).getFullYear()})`
                  : ""
              }`
            : "Volume or issue not fully assigned",
      },
    },
    diagnostics: {
      hasHtmlInTitleOrAbstract: hasHtml,
      invalidOrcids,
      emailsDetectedInAffiliations,
    },
    errors,
    warnings,
  };
}

function escapeXml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generates official DOAJ Native XML adhering to doajArticles.xsd.
 * - Auto-strips HTML tags from title, abstract, and keywords.
 * - Normalizes and validates ORCID iDs (omits malformed ORCIDs to prevent parser rejection).
 * - Strictly excludes author emails.
 */
export function generateDoajXml(articles: Article | Article[]): string {
  const articleList = Array.isArray(articles) ? articles : [articles];

  const recordsXml = articleList
    .map((article) => {
      const pubDate = article.publication_date
        ? new Date(article.publication_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const rawAuthors: ArticleAuthor[] = Array.isArray(article.authors)
        ? article.authors
        : typeof article.authors === "string"
        ? [{ name: article.authors, email: "" }]
        : [{ name: "Author", email: "" }];

      // Build unique affiliations map with IDs
      const affiliationMap = new Map<string, number>();
      let affCounter = 1;
      rawAuthors.forEach((a) => {
        const cleanAff = stripHtml(sanitizeAffiliation(a.affiliation));
        if (cleanAff && !affiliationMap.has(cleanAff)) {
          affiliationMap.set(cleanAff, affCounter++);
        }
      });

      const doi = article.doi || article.crossrefDoi;
      const slug = buildArticleSlug(article);
      const fullTextUrl = article.manuscript_file_url || `${DOAJ_CONFIG.siteUrl}/articles/${slug}`;

      // Authors block: DOAJ forbids emails! Only include normalized, valid ORCIDs
      const authorsXml = rawAuthors
        .map((a) => {
          const cleanName = stripHtml(a.name || "Author");
          const cleanAff = stripHtml(sanitizeAffiliation(a.affiliation));
          const affId = cleanAff ? affiliationMap.get(cleanAff) : undefined;
          
          const orcidCheck = validateAndNormalizeOrcid(a.orcid);
          const orcidFormatted = orcidCheck.isValid ? orcidCheck.normalized : null;

          return `        <author>
          <name>${escapeXml(cleanName)}</name>${
            affId !== undefined ? `\n          <affiliationId>${affId}</affiliationId>` : ""
          }${orcidFormatted ? `\n          <orcid_id>${escapeXml(orcidFormatted)}</orcid_id>` : ""}
        </author>`;
        })
        .join("\n");

      // Affiliations list
      const affiliationsXml = Array.from(affiliationMap.entries())
        .map(
          ([affName, affId]) =>
            `      <affiliationName affiliationId="${affId}">${escapeXml(affName)}</affiliationName>`
        )
        .join("\n");

      // Keywords (plain text, HTML stripped)
      const keywords = Array.isArray(article.keywords)
        ? article.keywords.map((k) => stripHtml(k)).filter(Boolean)
        : [];
      const keywordsXml =
        keywords.length > 0
          ? `    <keywords language="eng">\n` +
            keywords.map((k) => `      <keyword>${escapeXml(k)}</keyword>`).join("\n") +
            `\n    </keywords>`
          : "";

      const cleanTitle = stripHtml(article.title);
      const cleanAbstract = stripHtml(article.abstract);

      return `  <record>
    <language>eng</language>
    <publisher>${escapeXml(DOAJ_CONFIG.publisher)}</publisher>
    <journalTitle>${escapeXml(DOAJ_CONFIG.journalTitle)}</journalTitle>
    <issn>${DOAJ_CONFIG.issnPrint}</issn>
    <eissn>${DOAJ_CONFIG.issnOnline}</eissn>
    <publicationDate>${pubDate}</publicationDate>${
      article.volume !== undefined && article.volume !== null ? `\n    <volume>${article.volume}</volume>` : ""
    }${article.issue !== undefined && article.issue !== null ? `\n    <issue>${article.issue}</issue>` : ""}${
      article.page_start !== undefined && article.page_start !== null ? `\n    <startPage>${article.page_start}</startPage>` : ""
    }${article.page_end !== undefined && article.page_end !== null ? `\n    <endPage>${article.page_end}</endPage>` : ""}${
      doi ? `\n    <doi>${escapeXml(doi)}</doi>` : ""
    }
    <publisherRecordId>${escapeXml(article.id)}</publisherRecordId>
    <documentType>article</documentType>
    <title language="eng">${escapeXml(cleanTitle)}</title>
    <authors>
${authorsXml}
    </authors>${
      affiliationMap.size > 0
        ? `\n    <affiliationsList>\n${affiliationsXml}\n    </affiliationsList>`
        : ""
    }
    <abstract language="eng">${escapeXml(cleanAbstract)}</abstract>
    <fullTextUrl format="pdf">${escapeXml(fullTextUrl)}</fullTextUrl>${
      keywordsXml ? `\n${keywordsXml}` : ""
    }
  </record>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<records xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://doaj.org/schemas/doajArticles.xsd">
${recordsXml}
</records>`;
}

/**
 * Formats metadata for the DOAJ API v3 (/api/v3/articles).
 * Strictly strips all author emails, sanitizes HTML, and normalizes ORCIDs.
 */
export function formatDOAJv3Payload(article: Article) {
  const pubDate = article.publication_date ? new Date(article.publication_date) : new Date();
  const rawAuthors: ArticleAuthor[] = Array.isArray(article.authors)
    ? article.authors
    : typeof article.authors === "string"
    ? [{ name: article.authors, email: "" }]
    : [{ name: "Author", email: "" }];

  const authors = rawAuthors.map((a) => {
    const cleanName = stripHtml(a.name || "Author");
    const cleanAff = stripHtml(sanitizeAffiliation(a.affiliation));
    const orcidCheck = validateAndNormalizeOrcid(a.orcid);

    return {
      name: cleanName,
      affiliation: cleanAff || undefined,
      orcid_id: orcidCheck.isValid && orcidCheck.normalized ? orcidCheck.normalized : undefined,
      // NO EMAIL FIELD — strictly prohibited by DOAJ
    };
  });

  const doi = article.doi || article.crossrefDoi;
  const slug = buildArticleSlug(article);
  const fullTextUrl = article.manuscript_file_url || `${DOAJ_CONFIG.siteUrl}/articles/${slug}`;

  const identifiers: Array<{ type: string; id: string }> = [
    { type: "pissn", id: DOAJ_CONFIG.issnPrint },
    { type: "eissn", id: DOAJ_CONFIG.issnOnline },
  ];

  if (doi) {
    identifiers.unshift({ type: "doi", id: doi });
  }

  const keywords = Array.isArray(article.keywords)
    ? article.keywords.map((k) => stripHtml(k)).filter(Boolean)
    : [];

  return {
    admin: {
      in_doaj: true,
    },
    bibjson: {
      title: stripHtml(article.title),
      author: authors,
      abstract: stripHtml(article.abstract || ""),
      keywords,
      identifier: identifiers,
      link: [
        {
          type: "fulltext",
          url: fullTextUrl,
          content_type: "application/pdf",
        },
      ],
      year: pubDate.getFullYear().toString(),
      month: (pubDate.getMonth() + 1).toString(),
      start_page: article.page_start ? article.page_start.toString() : undefined,
      end_page: article.page_end ? article.page_end.toString() : undefined,
      journal: {
        title: DOAJ_CONFIG.journalTitle,
        publisher: DOAJ_CONFIG.publisher,
        country: DOAJ_CONFIG.country,
        volume: article.volume ? article.volume.toString() : undefined,
        number: article.issue ? article.issue.toString() : undefined,
        issns: [DOAJ_CONFIG.issnPrint, DOAJ_CONFIG.issnOnline],
        language: [DOAJ_CONFIG.language],
        license: [
          {
            type: DOAJ_CONFIG.licenseType,
            title: DOAJ_CONFIG.licenseType,
            url: DOAJ_CONFIG.licenseUrl,
            version: DOAJ_CONFIG.licenseVersion,
            open_access: true,
          },
        ],
      },
    },
  };
}

/**
 * Triggers browser download of DOAJ Native XML for manual upload via DOAJ dashboard.
 */
export function downloadDoajXml(articles: Article | Article[], filename?: string) {
  const xml = generateDoajXml(articles);
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const defaultName = Array.isArray(articles)
    ? `doaj-export-batch-${Date.now()}.xml`
    : `doaj-article-${articles.id}.xml`;

  a.download = filename || defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Test DOAJ API connection with a given API key.
 */
export async function testDoajApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("https://doaj.org/api/v3/applications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok || res.status === 200) {
      return { success: true, message: "Successfully authenticated with DOAJ API." };
    }
    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: "Invalid DOAJ API Key (Unauthorized). Check your API key in DOAJ Publisher Dashboard > Settings.",
      };
    }
    return { success: false, message: `DOAJ returned HTTP status: ${res.status} ${res.statusText}` };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to reach DOAJ API. Check network connection." };
  }
}

/**
 * Submits an article directly to the DOAJ API with comprehensive error parsing.
 */
export async function depositArticleToDoaj(
  article: Article,
  apiKey: string
): Promise<{
  success: boolean;
  message: string;
  statusCode?: number;
  diagnosticAdvice?: string;
  data?: any;
}> {
  const payload = formatDOAJv3Payload(article);

  try {
    const res = await fetch("https://doaj.org/api/v3/articles", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, message: "Article deposited successfully to DOAJ!", data, statusCode: res.status };
    }

    // Parse detailed DOAJ rejection
    let errMessage = `HTTP ${res.status} ${res.statusText}`;
    let diagnosticAdvice = "";

    try {
      const jsonErr = await res.json();
      if (jsonErr.error) {
        errMessage = jsonErr.error;
      } else if (jsonErr.message) {
        errMessage = jsonErr.message;
      }
      if (Array.isArray(jsonErr.details) && jsonErr.details.length > 0) {
        errMessage += ` Details: ${jsonErr.details.join("; ")}`;
      }
    } catch {
      const textErr = await res.text().catch(() => "");
      if (textErr) errMessage = textErr.slice(0, 300);
    }

    // Map common DOAJ error patterns to actionable troubleshooting steps
    const lowerErr = errMessage.toLowerCase();
    if (lowerErr.includes("orcid")) {
      diagnosticAdvice = "Check author ORCIDs. DOAJ requires 16-digit format (0000-0002-1825-0097).";
    } else if (lowerErr.includes("issn")) {
      diagnosticAdvice = "Check journal ISSNs. Registered records must match 3115-6940 (Print) or 3115-6932 (Online).";
    } else if (lowerErr.includes("email")) {
      diagnosticAdvice = "Author email address detected in payload. Emails must be stripped.";
    } else if (lowerErr.includes("license")) {
      diagnosticAdvice = "License mismatch. DOAJ requires standard open-access license URL (https://creativecommons.org/licenses/by/4.0/).";
    } else if (res.status === 401 || res.status === 403) {
      diagnosticAdvice = "Authentication failed. Verify that your DOAJ API Key is active in your publisher account settings.";
    }

    return {
      success: false,
      message: errMessage,
      statusCode: res.status,
      diagnosticAdvice,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Failed to send request to DOAJ API.",
      diagnosticAdvice: "Check your local internet connection or firewall blocking outbound HTTPS requests to doaj.org.",
    };
  }
}

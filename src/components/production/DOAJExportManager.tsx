import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  Send,
  FileCode,
  Key,
  ExternalLink,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  HelpCircle,
} from "lucide-react";
import type { Article } from "@/lib/articleService";
import {
  validateDoajMetadata,
  generateDoajXml,
  downloadDoajXml,
  formatDOAJv3Payload,
  depositArticleToDoaj,
  testDoajApiKey,
  DOAJ_CONFIG,
} from "@/lib/doajService";

interface DOAJExportManagerProps {
  article: Article;
  onUpdate?: () => void;
}

export const DOAJExportManager = ({ article, onUpdate }: DOAJExportManagerProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("doaj_api_key") || "");
  const [testingKey, setTestingKey] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"xml" | "json">("xml");
  const [copied, setCopied] = useState(false);
  const [lastDepositResult, setLastDepositResult] = useState<{
    success: boolean;
    message: string;
    statusCode?: number;
    diagnosticAdvice?: string;
  } | null>(null);

  // Validate the article against all 5 DOAJ requirements with diagnostics
  const validation = useMemo(() => validateDoajMetadata(article), [article]);

  const xmlPreview = useMemo(() => {
    try {
      return generateDoajXml(article);
    } catch {
      return "<!-- Error generating XML preview -->";
    }
  }, [article]);

  const jsonPreview = useMemo(() => {
    try {
      return JSON.stringify(formatDOAJv3Payload(article), null, 2);
    } catch {
      return "{}";
    }
  }, [article]);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("doaj_api_key", key);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your DOAJ API key from the DOAJ Publisher Settings.",
        variant: "destructive",
      });
      return;
    }

    setTestingKey(true);
    try {
      const res = await testDoajApiKey(apiKey);
      if (res.success) {
        toast({
          title: "Connection Successful",
          description: "Connected to DOAJ API successfully.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: res.message,
          variant: "destructive",
        });
      }
    } finally {
      setTestingKey(false);
    }
  };

  const handleDownloadXml = () => {
    try {
      downloadDoajXml(article);
      toast({
        title: "DOAJ XML Downloaded",
        description: "File generated adhering to doajArticles.xsd. Ready for manual upload to the DOAJ Dashboard.",
      });
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err?.message || "Failed to generate XML file",
        variant: "destructive",
      });
    }
  };

  const handleDeposit = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Enter your DOAJ API key to deposit directly via the API.",
        variant: "destructive",
      });
      return;
    }

    if (!validation.canExport) {
      toast({
        title: "Cannot Deposit",
        description: "Article is missing core metadata required by DOAJ.",
        variant: "destructive",
      });
      return;
    }

    setDepositing(true);
    setLastDepositResult(null);
    try {
      const res = await depositArticleToDoaj(article, apiKey);
      setLastDepositResult(res);
      if (res.success) {
        toast({
          title: "Deposit Successful",
          description: res.message,
        });
        onUpdate?.();
      } else {
        toast({
          title: "Deposit Rejected by DOAJ",
          description: res.message,
          variant: "destructive",
        });
      }
    } finally {
      setDepositing(false);
    }
  };

  const handleCopyPreview = () => {
    const text = previewMode === "xml" ? xmlPreview : jsonPreview;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const checksList = [
    {
      title: "1. Core Article Data",
      desc: "Title, abstract, and direct fulltext link",
      check: validation.checks.coreData,
    },
    {
      title: "2. Author Details & Affiliations",
      desc: "First & last names, institutional affiliations, ORCID",
      check: validation.checks.authors,
    },
    {
      title: "3. Privacy Compliance (No Emails)",
      desc: "Author emails strictly excluded from metadata payload",
      check: validation.checks.noEmails,
    },
    {
      title: "4. Identifiers",
      desc: `ISSN (${DOAJ_CONFIG.issnPrint} / ${DOAJ_CONFIG.issnOnline}) and CrossRef DOI`,
      check: validation.checks.identifiers,
    },
    {
      title: "5. Publication Context",
      desc: "Publication date, Volume, Issue, and page numbers",
      check: validation.checks.context,
    },
  ];

  return (
    <div className="space-y-6 divide-y divide-stone-100">
      {/* Header Info */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              DOAJ Metadata & Export Manager
            </h3>
            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 font-medium rounded">
              OJS Plugin Equivalent
            </span>
          </div>
          <a
            href="https://doaj.org/docs/xml/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            DOAJ XML Docs
            <ExternalLink size={12} />
          </a>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          Verify metadata against DOAJ's strict indexing criteria, download compliant Native XML (
          <code className="text-[11px] font-mono bg-stone-100 px-1 py-0.5">doajArticles.xsd</code>
          ) for manual dashboard upload, or deposit directly via the DOAJ API.
        </p>
      </div>

      {/* Pre-Flight Automated Sanitization Bar */}
      <div className="pt-4">
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Pre-Flight Automated Diagnostics & Protections
            </p>
            <span className="text-[10px] text-stone-400 font-mono">DOAJ Schema Guard</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-700">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>HTML auto-stripped from text</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-700">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>Author emails strictly excluded</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-700">
              {validation.diagnostics.invalidOrcids.length > 0 ? (
                <>
                  <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                  <span className="text-amber-800 font-medium">1+ invalid ORCID omitted</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>ORCIDs validated (16 digits)</span>
                </>
              )}
            </div>
          </div>

          {validation.diagnostics.invalidOrcids.length > 0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200 mt-2">
              <div className="flex items-center gap-1 font-semibold mb-1">
                <HelpCircle size={13} />
                <span>ORCID Safety Omission (Protects Against Deposit Rejection):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {validation.diagnostics.invalidOrcids.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-700 mt-1">
                To include these ORCIDs, edit the author in the <strong>Authors</strong> tab with the exact 16-digit format (e.g. <code>0000-0002-1825-0097</code>).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Requirements Checklist */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            DOAJ Metadata Compliance Checklist
          </p>
          {validation.isValid ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck size={13} />
              DOAJ Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <AlertTriangle size={13} />
              Review Warnings
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {checksList.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border transition-colors ${
                item.check.valid
                  ? "bg-white border-stone-200"
                  : "bg-amber-50/40 border-amber-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {item.check.valid ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-stone-800">{item.title}</p>
                    <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                      {item.desc}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">{item.check.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {validation.errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded space-y-1">
            <p className="text-xs font-bold text-red-800">Blocking Issues:</p>
            <ul className="list-disc list-inside text-xs text-red-700 space-y-0.5">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* DOAJ Deposit Error Diagnostic Card (if deposit rejected) */}
      {lastDepositResult && !lastDepositResult.success && (
        <div className="pt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-xs">
              <AlertCircle size={15} />
              <span>DOAJ Rejection Details ({lastDepositResult.statusCode ? `HTTP ${lastDepositResult.statusCode}` : "Error"})</span>
            </div>
            <p className="text-xs text-red-800 font-mono bg-white p-2.5 rounded border border-red-200 break-words">
              {lastDepositResult.message}
            </p>
            {lastDepositResult.diagnosticAdvice && (
              <div className="text-xs text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                <strong className="text-stone-900">Troubleshooting Recommendation:</strong>{" "}
                {lastDepositResult.diagnosticAdvice}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export & Deposit Actions */}
      <div className="pt-5 space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
          Export & Deposit Options
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Option 1: Download XML */}
          <button
            onClick={handleDownloadXml}
            className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 text-xs font-semibold hover:bg-primary transition-colors active:scale-[0.98] rounded"
          >
            <Download size={14} />
            Download DOAJ XML
          </button>

          {/* Option 2: Direct API Deposit */}
          <button
            onClick={handleDeposit}
            disabled={depositing || !validation.canExport}
            className="inline-flex items-center gap-2 border border-stone-800 text-stone-800 px-4 py-2.5 text-xs font-semibold hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] rounded"
          >
            {depositing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Deposit via API
          </button>

          {/* Option 3: Toggle Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 border border-stone-200 text-stone-600 px-4 py-2.5 text-xs font-semibold hover:border-stone-400 transition-colors rounded"
          >
            <FileCode size={14} />
            {showPreview ? "Hide Preview" : "Preview Payload"}
            {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <p className="text-[11px] text-stone-500 leading-relaxed">
          <strong>Manual upload flow:</strong> Click <em>Download DOAJ XML</em>, then log in to{" "}
          <a
            href="https://doaj.org/publisher/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            doaj.org/publisher
          </a>
          , navigate to <strong>Upload metadata</strong>, and select the downloaded XML file.
        </p>
      </div>

      {/* API Connection Configuration */}
      <div className="pt-5 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
          DOAJ API Key Configuration (Optional for Automated Deposit)
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="password"
              placeholder="Paste DOAJ API Key (from Publisher Dashboard > Settings)"
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded font-mono focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleTestConnection}
            disabled={testingKey || !apiKey.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-40 rounded shrink-0"
          >
            {testingKey ? <Loader2 size={13} className="animate-spin" /> : null}
            Test Connection
          </button>
        </div>
      </div>

      {/* Payload Preview */}
      {showPreview && (
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode("xml")}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                  previewMode === "xml"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                DOAJ Native XML (doajArticles.xsd)
              </button>
              <button
                onClick={() => setPreviewMode("json")}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                  previewMode === "json"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                API v3 JSON
              </button>
            </div>
            <button
              onClick={handleCopyPreview}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-primary transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="text-[11px] font-mono bg-stone-950 text-stone-300 p-4 rounded overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
            {previewMode === "xml" ? xmlPreview : jsonPreview}
          </pre>
        </div>
      )}
    </div>
  );
};

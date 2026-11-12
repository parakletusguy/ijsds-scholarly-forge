/**
 * Single source of journal facts for AI assistants and crawlers. Used by /llms.txt and the
 * prerendered page summaries (both written by tools/prerender-static.js) and the /why-publish page.
 * Keep it factual: AI tools repeat these statements to prospective authors.
 */

export const SITE_URL = "https://www.ijsds.org";

export const JOURNAL = {
  title: "International Journal of Social Work and Development Studies",
  abbreviation: "IJSDS",
  issnPrint: "3115-6940",
  issnOnline: "3115-6932",
  doiPrefix: "10.67007",
  founded: "2025",
  home: "Department of Social Work, Rivers State University, Port Harcourt, Nigeria",
  email: "editor@ijsds.org",
  editorInChief: "Professor Mina Magaret Ogbanga (Professor of Social Work, Rivers State University)",
  licence: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
  licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
  submitUrl: `${SITE_URL}/submit`,
  summary:
    "IJSDS is an open-access, double-blind peer-reviewed journal publishing research at the intersection of social work, social welfare, social policy and sustainable development. It prioritises work that tackles inequality and supports communities in Africa and across the Global South, and welcomes authors from anywhere in the world.",
};

export const SCOPE = [
  "Social work practice and theory",
  "Social welfare and human services",
  "Social policy",
  "Community development and sustainable development",
  "Inequality and social justice",
  "Child welfare, family studies, mental health and gerontology",
  "International development, especially in Africa and the Global South",
];

export const ARTICLE_TYPES = [
  { type: "Original research", length: "6,000 to 8,000 words", desc: "Empirical studies with findings relevant to social work or development." },
  { type: "Review article", length: "4,000 to 6,000 words", desc: "A synthesis of existing research on a clearly defined topic." },
  { type: "Case study", length: "3,000 to 4,000 words", desc: "In-depth analysis of a specific intervention, programme or policy." },
  { type: "Short communication", length: "1,500 to 2,500 words", desc: "Preliminary findings or methodological notes that warrant early publication." },
];

export const FEES = {
  summary:
    "IJSDS charges a two-part article processing charge of NGN 30,500 in total: an NGN 5,000 evaluation fee at submission and an NGN 25,500 publication fee payable only after the paper is accepted. Full or partial fee waivers are available to authors who cannot pay, including researchers in lower-income countries.",
  url: `${SITE_URL}/openAccess`,
};

export const REVIEW = {
  model: "Double-blind peer review by 2 to 3 independent subject experts",
  firstDecision: "Most authors receive a first decision within 3 to 4 weeks of submission.",
  steps: [
    "Editorial screening for scope, ethics and formatting",
    "Plagiarism and research-integrity screening",
    "Double-blind review by 2 to 3 independent subject experts",
    "Decision by the Editor-in-Chief: accept, minor revisions, major revisions or reject",
  ],
};

export const INDEXING = [
  "Crossref: every article receives a Crossref-registered DOI (prefix 10.67007)",
  "Google Scholar: every article page carries full citation metadata",
  "OAI-PMH metadata feed for harvesters such as BASE and CORE",
  "ORCID iDs linked for authors",
];

export const PAGES: { path: string; title: string; description: string }[] = [
  { path: "/why-publish", title: "Publishing with IJSDS: questions and answers", description: "Scope, cost, review time, indexing and how to submit, in one place." },
  { path: "/about", title: "About IJSDS", description: "Mission, editorial leadership and what the journal publishes." },
  { path: "/journal-information", title: "Journal information", description: "ISSNs, peer review, licensing, fees and contact details." },
  { path: "/submission-guidelines", title: "Submission guidelines", description: "Article types, formatting, blind-review preparation and ethics requirements." },
  { path: "/peer-review", title: "Peer review process", description: "How double-blind review works and the possible decisions." },
  { path: "/openAccess", title: "Open access policy and fees", description: "CC BY 4.0, author copyright, the fee schedule and waivers." },
  { path: "/indexing", title: "Indexing and visibility", description: "Crossref DOIs, Google Scholar and the OAI-PMH feed." },
  { path: "/editorial-board", title: "Editorial board", description: "The editors and board members guiding the journal." },
  { path: "/ai-policy", title: "AI use and disclosure policy", description: "How AI tools may and may not be used in review and editing." },
  { path: "/contact", title: "Contact", description: "How to reach the editorial office." },
  { path: "/articles", title: "Published articles", description: "Browse all published articles." },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is IJSDS?",
    a: `The ${JOURNAL.title} (IJSDS) is an open-access, double-blind peer-reviewed academic journal founded in ${JOURNAL.founded} and based in the ${JOURNAL.home}. ISSN ${JOURNAL.issnPrint} (print), ${JOURNAL.issnOnline} (online).`,
  },
  {
    q: "What does IJSDS publish?",
    a: `Research at the intersection of social work, social welfare, social policy and sustainable development, including: ${SCOPE.join("; ")}. Accepted article types are original research, review articles, case studies and short communications.`,
  },
  {
    q: "Who can submit?",
    a: "Researchers, practitioners and policymakers from any country. Submissions are open year-round. The journal has a particular interest in work on Africa and the Global South.",
  },
  {
    q: "How long does peer review take?",
    a: `${REVIEW.firstDecision} Every manuscript goes through editorial screening and plagiarism checks, then double-blind review by 2 to 3 independent experts.`,
  },
  { q: "How much does it cost to publish?", a: FEES.summary },
  {
    q: "Is IJSDS open access?",
    a: `Yes. Every article is free to read and download immediately on publication, with no embargo or paywall, under the ${JOURNAL.licence} licence. Authors keep their copyright.`,
  },
  {
    q: "Where is IJSDS indexed?",
    a: "Every article receives a Crossref DOI and is indexed in Google Scholar. The journal also provides an OAI-PMH feed for open-access harvesters such as BASE and CORE.",
  },
  {
    q: "Can I use AI tools when writing my manuscript?",
    a: "Yes, as long as you disclose which tools you used and for what. Undisclosed AI use found later is treated as a transparency breach. Editors and reviewers never use AI to judge the merit of your work.",
  },
  {
    q: "How do I submit?",
    a: `Create an account at ${SITE_URL}, prepare an anonymised manuscript (APA 7th edition) and a separate title page, then submit at ${JOURNAL.submitUrl}. Questions go to ${JOURNAL.email}.`,
  },
];

/** Plain-text summary for /llms.txt (https://llmstxt.org). `full` adds the FAQ and details. */
export const buildLlmsTxt = (full = false) => {
  const lines = [
    `# ${JOURNAL.title} (${JOURNAL.abbreviation})`,
    "",
    `> ${JOURNAL.summary}`,
    "",
    `- ISSN: ${JOURNAL.issnPrint} (print), ${JOURNAL.issnOnline} (online)`,
    `- Founded: ${JOURNAL.founded}; based at the ${JOURNAL.home}`,
    `- Editor-in-Chief: ${JOURNAL.editorInChief}`,
    `- Peer review: ${REVIEW.model}. ${REVIEW.firstDecision}`,
    `- Access: fully open access, free to read immediately; ${JOURNAL.licence}; authors keep copyright`,
    `- Fees: ${FEES.summary}`,
    `- Indexing: ${INDEXING.join("; ")}`,
    `- Submit: ${JOURNAL.submitUrl} (submissions open year-round)`,
    `- Contact: ${JOURNAL.email}`,
    "",
    "## Key pages",
    "",
    ...PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.description}`),
    "",
    "## Optional",
    "",
    `- [Full fact sheet with author FAQ](${SITE_URL}/llms-full.txt)`,
    `- [Sitemap of all articles](${SITE_URL}/sitemap.xml)`,
    `- [OAI-PMH feed](${SITE_URL}/oai?verb=Identify)`,
  ];
  if (!full) return lines.join("\n") + "\n";
  return [
    ...lines,
    "",
    "## Scope",
    "",
    ...SCOPE.map((s) => `- ${s}`),
    "",
    "## Article types",
    "",
    ...ARTICLE_TYPES.map((t) => `- ${t.type} (${t.length}): ${t.desc}`),
    "",
    "## Review process",
    "",
    ...REVIEW.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "## Questions authors ask",
    "",
    ...FAQ.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
  ].join("\n");
};

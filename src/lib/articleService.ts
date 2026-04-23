import { api } from "./apiClient";

export interface ArticleAuthor {
  name: string;
  email: string;
  affiliation?: string;
  orcid?: string;
}

export interface FileVersion {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  version_number: number;
  is_supplementary: boolean;
  is_archived: boolean;
  created_at?: string;
}

export interface Article {
  id: string;
  title: string;
  abstract?: string;
  keywords?: string[];
  authors?: ArticleAuthor[];
  corresponding_author_email?: string;
  doi?: string | null;
  status: string;
  volume?: number | null;
  issue?: number | null;
  page_start?: number | null;
  page_end?: number | null;
  subject_area?: string;
  publication_date?: string | null;
  submission_date?: string | null;
  vetting_fee?: boolean;
  processing_fee?: boolean;
  manuscript_file_url?: string | null;
  submissions?: {
    id: string;
    status: string;
    submitted_at: string;
    submitter_id: string;
  }[];
  file_versions?: FileVersion[];
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string | null;
  description?: string | null;
  is_active: boolean;
  display_order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  slug: string;
  category: string;
  tags: string[];
  status: string;
  published_at: string;
  featured_image_url?: string | null;
  author?: { id: string; full_name: string };
}

interface ListResponse<T> {
  success: true;
  data: T[];
}
interface SingleResponse<T> {
  success: true;
  data: T;
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: "mock-1",
    title:
      "Socio-spatial Transformations in Urban Displacement: A Longitudinal Study of Jakarta's Riverine Settlements",
    abstract:
      "This research examines the complex interplay between urban redevelopment and the displacement of riverine communities in Jakarta. Through a longitudinal analysis of three settlement clusters, it identifies the long-term socio-economic consequences for displaced households and the resulting shifts in urban spatial dynamics. The study highlights the inadequacy of current resettlement frameworks and proposes a more inclusive model for future interventions.",
    keywords: ["Urbanization", "Displacement", "SE Asia", "Spatial Justice"],
    authors: [
      {
        name: "Dr. Ananda Putri",
        email: "ananda@univ.id",
        affiliation: "University of Indonesia",
      },
      {
        name: "Prof. Marcus Thorne",
        email: "m.thorne@inst.org",
        affiliation: "London School of Economics",
      },
    ],
    doi: "10.1234/ijsds.2024.001",
    status: "published",
    volume: 5,
    issue: 2,
    subject_area: "Urban Sociology",
    publication_date: "2024-03-15T00:00:00Z",
  },
  {
    id: "mock-2",
    title:
      "The Digital Divide and Pedagogical Resilience: Evaluating Rural Educational Outreach during Global Disruptions",
    abstract:
      "The rapid transition to digital learning environments has exacerbated existing educational inequalities in rural sub-Saharan Africa. This paper evaluates the effectiveness of hybrid outreach models aimed at maintaining pedagogical continuity in resource-constrained settings. By analyzing student performance and teacher engagement across 12 rural districts, the research provides a roadmap for building resilient educational systems that can withstand future global disruptions.",
    keywords: [
      "Digital Divide",
      "Education",
      "Rural Development",
      "Resilience",
    ],
    authors: [
      {
        name: "Dr. Chioma Okeke",
        email: "c.okeke@edu.ng",
        affiliation: "University of Ibadan",
      },
    ],
    doi: "10.1234/ijsds.2024.002",
    status: "published",
    volume: 5,
    issue: 2,
    subject_area: "Education & Literacy",
    publication_date: "2024-03-20T00:00:00Z",
  },
  {
    id: "mock-3",
    title:
      "Algorithmic Bias in Social Welfare Allocation: A Critical Review of Automated Decision Support Systems",
    abstract:
      "As social welfare agencies increasingly adopt automated decision support systems (ADSS), concerns regarding algorithmic bias and transparency have moved to the forefront of development studies. This review critically assesses the impact of these systems on vulnerable populations, highlighting specific instances where opaque algorithms have led to systemic exclusion. It advocates for the implementation of 'Human-in-the-loop' auditing frameworks to ensure justice and accountability.",
    keywords: ["AI Ethics", "Social Welfare", "Algorithms", "Public Policy"],
    authors: [
      {
        name: "Siddharth Mehta",
        email: "s.mehta@tech.in",
        affiliation: "IIT Delhi",
      },
      {
        name: "Elena Rossi",
        email: "e.rossi@soc.it",
        affiliation: "University of Bologna",
      },
    ],
    doi: "10.1234/ijsds.2024.003",
    status: "published",
    volume: 5,
    issue: 1,
    subject_area: "Technology & Society",
    publication_date: "2024-01-10T00:00:00Z",
  },
];

export const getArticles = async (params?: {
  status?: string;
  subject_area?: string;
  volume?: number;
  issue?: number;
  doi?: string;
}): Promise<Article[]> => {
  try {
    const qs = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : "";
    const res = await api.get<ListResponse<Article>>(`/api/articles${qs}`);

    // If we have API data, use it; otherwise fallback to mocks for a rich demo experience
    return res.data.length > 0 ? res.data : MOCK_ARTICLES;
  } catch (error) {
    console.error("API fetch failed, falling back to mocks:", error);
    return MOCK_ARTICLES;
  }
};

export const getArticle = async (idOrSlug: string): Promise<Article> => {
  // 1. Check if it's a mock ID
  const mock = MOCK_ARTICLES.find(
    (a) => a.id === idOrSlug || idOrSlug.includes(a.id),
  );
  if (mock) return mock;

  try {
    // 2. Try the API
    const res = await api.get<SingleResponse<Article>>(
      `/api/articles/${idOrSlug}`,
    );
    return res.data;
  } catch (error: any) {
    console.warn(`Article detail fetch failed for ${idOrSlug}:`, error);

    // 3. Last resort fallback — search mocks by DOI or Title similarity
    const fuzzy = MOCK_ARTICLES.find(
      (a) =>
        (a.doi && idOrSlug.includes(a.doi.replace("/", "-"))) ||
        idOrSlug.toLowerCase().includes(a.id.toLowerCase()),
    );

    if (fuzzy) return fuzzy;
    throw error;
  }
};

export const getPartners = async (): Promise<Partner[]> => {
  try {
    const res = await api.get<ListResponse<Partner>>("/api/partners");
    return res.data
      .filter((p) => p.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  } catch {
    return [];
  }
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const res = await api.get<ListResponse<BlogPost>>("/api/blog");
    return res.data;
  } catch {
    return [];
  }
};

export const updateArticle = async (
  id: string,
  updates: Partial<{
    title: string;
    abstract: string;
    keywords: string[];
    doi: string;
    status: string;
    volume: number;
    issue: number;
    page_start: number;
    page_end: number;
    subject_area: string;
    publication_date: string;
    vetting_fee: boolean;
    processing_fee: boolean;
  }>,
): Promise<Article> => {
  const res = await api.patch<SingleResponse<Article>>(
    `/api/articles/${id}`,
    updates,
  );
  return res.data;
};

export const getVolumesIssues = async (): Promise<{ volumes: number[]; issues: number[] }> => {
  try {
    const articles = await getArticles({ status: 'published' });
    const volumes = Array.from(new Set(articles.map(a => a.volume).filter((v): v is number => !!v))).sort((a, b) => b - a);
    const issues = Array.from(new Set(articles.map(a => a.issue).filter((i): i is number => !!i))).sort((a, b) => b - a);
    return { volumes, issues };
  } catch {
    return { volumes: [5, 4, 3, 2, 1], issues: [4, 3, 2, 1] };
  }
};

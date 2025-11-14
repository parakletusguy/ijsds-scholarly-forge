import { useEffect } from 'react';

interface Author {
  name: string;
  email?: string;
  affiliation?: string;
}

interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[] | null;
  authors: Author[];
  publication_date: string | null;
  doi: string | null;
  volume: number | null;
  issue: number | null;
}

interface ArticleStructuredDataProps {
  articles: Article[];
}

export const ArticleStructuredData = ({ articles }: ArticleStructuredDataProps) => {
  useEffect(() => {
    if (!articles || articles.length === 0) return;

    // Create structured data for the article list
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "ScholarlyArticle",
          "@id": article.doi ? `https://doi.org/${article.doi}` : `https://ijsds.com/articles/${article.id}`,
          "headline": article.title,
          "abstract": article.abstract,
          "author": article.authors?.map(author => ({
            "@type": "Person",
            "name": author.name,
            "affiliation": author.affiliation ? {
              "@type": "Organization",
              "name": author.affiliation
            } : undefined
          })) || [],
          "datePublished": article.publication_date,
          "keywords": article.keywords?.join(", "),
          "publisher": {
            "@type": "Organization",
            "name": "International Journal On Social Work and Development Studies",
            "alternateName": "IJSDS"
          },
          "isPartOf": {
            "@type": "Periodical",
            "name": "International Journal On Social Work and Development Studies",
            "issn": ""
          },
          ...(article.volume && {
            "volumeNumber": article.volume.toString()
          }),
          ...(article.issue && {
            "issueNumber": article.issue.toString()
          }),
          ...(article.doi && {
            "identifier": [
              {
                "@type": "PropertyValue",
                "propertyID": "DOI",
                "value": article.doi
              }
            ]
          })
        }
      }))
    };

    // Create or update script tag
    let script = document.getElementById('article-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'article-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    return () => {
      const scriptToRemove = document.getElementById('article-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [articles]);

  return null;
};

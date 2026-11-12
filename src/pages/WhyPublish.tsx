import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FAQ, JOURNAL, SITE_URL } from '@/lib/journalFacts';

/** Answers to the questions authors (and AI assistants on their behalf) ask before submitting. */
export const WhyPublish = () => {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Publishing with IJSDS: questions and answers</title>
        <meta name="description" content="Scope, cost, peer review time, indexing and how to submit to the International Journal of Social Work and Development Studies." />
        <link rel="canonical" href={`${SITE_URL}/why-publish`} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">For authors</span>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            Publishing with <span className="italic text-primary">IJSDS</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">{JOURNAL.summary}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <dl className="space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-2">{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-16 pt-10 border-t border-stone-200 flex flex-wrap items-center gap-4">
          <Link
            to="/submit"
            className="bg-primary hover:bg-[#8f3514] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors"
          >
            Submit your manuscript
          </Link>
          <Link to="/submission-guidelines" className="text-sm text-primary hover:underline">
            Read the submission guidelines
          </Link>
        </div>
      </main>
    </div>
  );
};

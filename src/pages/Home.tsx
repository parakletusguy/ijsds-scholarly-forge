import { useState, useEffect } from 'react';
import { BookOpen, Users, Globe, ArrowRight, User, TrendingUp, MapPin, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getArticles, Article } from '@/lib/articleService';
import { buildArticleSlug } from '@/lib/articleSlug';
import { useAuth } from '@/hooks/useAuth';
import mina from "../images/editors/Mina.jpeg"
import logo from "/public/Logo_Black_Edited-removebg-preview.png"

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1512820666249-f14f70a277d3?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=900",
];

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const stats = { reach: 94, scholars: 12000, citations: 450, nations: 82 };

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const fetchRecentArticles = async () => {
    try {
      const data = await getArticles({ status: 'published' });
      setRecentArticles(data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching recent articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: any) => {
    if (!authors || !Array.isArray(authors) || authors.length === 0) return 'IJSDS Editorial';
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name} & ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  const estimateReadTime = (abstract: string) =>
    abstract ? `${Math.max(5, Math.ceil(abstract.split(' ').length / 200) * 5)} Min Read` : '8 Min Read';

  const [featured, ...rest] = recentArticles;

  return (
    <div className="min-h-screen bg-surface selection:bg-orange-100 selection:text-primary">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="relative min-h-[880px] flex items-center overflow-hidden bg-surface">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#8f3514 0.5px, transparent 0.5px)', backgroundSize: '24px 24px', opacity: 0.06 }}
        />
        <div className="container mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-primary tracking-[0.3em] font-bold text-[10px] mb-6 inline-block uppercase">
              Established 2025 · Open Access · Peer Reviewed
            </span>
            <h1 className="text-6xl md:text-8xl font-headline font-light leading-[1.05] tracking-tight text-on-surface mb-8">
              Amplifying African Voices through{' '}
              <span className="italic text-primary">Rigorous Research.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed border-l-4 border-primary/20 pl-6">
              The International Journal of Social Work and Development Studies (IJSDS) is an international peer-reviewed journal dedicated to publishing high-quality research in social work and development studies.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/articles')}
                className="bg-primary text-white px-10 py-4 font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Browse Articles
              </button>
              <button
                onClick={() => navigate(user ? '/submit' : '/auth')}
                className="border-2 border-on-surface/20 text-on-surface px-10 py-4 font-bold text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
              >
                Submit Research
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="aspect-[4/5] bg-surface-container-high overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-multiply" />
              <img
                className="w-full h-full object-cover brightness-95 grayscale-[15%] group-hover:scale-105 transition-transform duration-[2000ms]"
                alt="IJSDS scholarly heritage"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTh67ohBbQASGWUb0dJe3QQvce4Esh08n_58eIjGj2LwxbFFkLWnwtGgDhn8eSy0pYB37Enc0eM31Ot2bjQjacD7cyk4sW6dL-nri7wudjKUNAjGOp3KI1pTo0sW68vH--zbNer3rezix_TCrQ2zSgB8mHe7g7v9dPTanXsyKlAFQfxLff697SaSkX1nQQTMYFnfq8r0dbD3Ey8FMs9vHOBl3LK46akG-Py2cVHdZC5ZHsKvd7R3lSNLMNBEf04Tl4GqHjTmebLu0"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary p-8 text-white shadow-2xl max-w-xs">
              <p className="text-2xl font-headline italic leading-snug">
                "Knowledge is a collective heritage of humanity."
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Impact Stats ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-primary/5">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
            {[
              { icon: Globe, value: `${stats.reach}%`, label: 'International Reach' },
              { icon: Users, value: `${stats.scholars.toLocaleString()}+`, label: 'Readers Worldwide' },
              { icon: TrendingUp, value: `${stats.citations}+`, label: 'Citations' },
              { icon: MapPin, value: `${stats.nations}`, label: 'Countries Reached' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="group">
                <div className="text-5xl font-headline text-primary mb-3 flex items-center justify-center md:justify-start gap-3">
                  <Icon size={28} className="opacity-20 group-hover:opacity-60 transition-opacity" />
                  {value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface/40">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose IJSDS ─────────────────────────────────────────────── */}
      <section className="py-32 bg-surface-container-low">
        <div className="container mx-auto px-8">
          <div className="mb-20 max-w-2xl">
            <span className="font-label text-primary uppercase tracking-[0.25em] text-[10px] font-bold mb-4 block">
              Why Publish With Us
            </span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">Why Choose IJSDS?</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We are committed to supporting researchers in publishing impactful, high-quality work that makes a difference in social work and development.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                icon: Globe,
                stat: '94%',
                title: 'Global Reach',
                body: 'Our published articles are read and cited across 140+ countries and have informed policy decisions worldwide.',
              },
              {
                icon: Clock,
                stat: '28 Days',
                title: 'Fast Peer Review',
                body: 'We aim to complete the peer review process within 28 days so your research reaches readers quickly.',
              },
              {
                icon: BookOpen,
                stat: 'Open Access',
                title: 'Free for Everyone',
                body: 'Every article we publish is freely available to anyone — no subscription or payment required to read.',
              },
            ].map(({ icon: Icon, stat, title, body }) => (
              <div key={title} className="space-y-5 group">
                <div className="w-12 h-12 border-2 border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                  <Icon size={20} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="text-5xl font-headline text-primary">{stat}</div>
                <h3 className="font-bold text-lg tracking-tight">{title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Current Issues — Editorial Grid ──────────────────────────────── */}
      <section className="py-32 bg-surface">
        <div className="container mx-auto px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="font-label text-primary uppercase tracking-[0.25em] text-[10px] font-bold mb-4 block">
                Recent Publications
              </span>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">Current Issues</h2>
            </div>
            <button
              onClick={() => navigate('/articles')}
              className="group flex items-center gap-2 text-primary font-bold text-sm border-b border-primary/30 pb-1 hover:border-primary transition-colors"
            >
              View Full Archive
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-8 aspect-video bg-surface-container animate-pulse" />
              <div className="lg:col-span-4 space-y-4">
                <div className="h-6 bg-surface-container animate-pulse w-2/3" />
                <div className="h-32 bg-surface-container animate-pulse" />
              </div>
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-primary/10">
              <p className="text-on-surface/30 font-headline text-3xl italic">
                "No articles published yet. Be the first to contribute."
              </p>
              <button
                onClick={() => navigate(user ? '/submit' : '/auth')}
                className="mt-8 bg-primary text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-all"
              >
                Submit Research
              </button>
            </div>
          ) : (
            <>
              {/* Featured row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-12 mb-16">
                {/* Large featured article */}
                {featured && (
                  <div
                    className="lg:col-span-8 group cursor-pointer"
                    onClick={() => navigate(`/article/${buildArticleSlug(featured)}`)}
                  >
                    <div className="aspect-video overflow-hidden bg-surface-container-high mb-6">
                      <img
                        src={STOCK_IMAGES[0]}
                        alt={featured.title}
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      />
                    </div>
                    <div className="flex gap-4 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {featured.subject_area || 'Research Article'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
                        {estimateReadTime(featured.abstract || '')}
                      </span>
                    </div>
                    <h3 className="font-headline text-3xl mb-4 leading-snug group-hover:text-primary transition-colors">
                      {featured.title}
                    </h3>
                    <p className="text-on-surface-variant mb-6 line-clamp-3 leading-relaxed">
                      {featured.abstract}
                    </p>
                    <div className="flex items-center gap-6 mt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <User size={14} className="text-on-surface/40" />
                        </div>
                        <span className="text-sm font-medium">{formatAuthors(featured.authors)}</span>
                        {featured.publication_date && (
                          <span className="text-sm text-on-surface/40">
                            · {new Date(featured.publication_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {featured.doi && (
                        <a
                          href={`https://doi.org/${featured.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/70 transition-colors uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-none"
                        >
                          <ExternalLink size={12} />
                          DOI: {featured.doi}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Side text-only card */}
                {rest[0] && (
                  <div
                    className="lg:col-span-4 flex flex-col justify-end cursor-pointer group"
                    onClick={() => navigate(`/article/${buildArticleSlug(rest[0])}`)}
                  >
                    <div className="p-8 border-l-2 border-primary/20 bg-surface-container-lowest hover:border-primary transition-colors h-full flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">
                        {rest[0].subject_area || 'Field Report'}
                      </span>
                      <h3 className="font-headline text-2xl leading-snug mb-6 group-hover:text-primary transition-colors">
                        {rest[0].title}
                      </h3>
                      <p className="text-sm text-on-surface-variant mb-6 line-clamp-4 leading-relaxed">
                        {rest[0].abstract}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-primary font-bold text-xs uppercase tracking-widest underline underline-offset-4 group-hover:no-underline transition-all">
                          Read Abstract →
                        </span>
                        {rest[0].doi && (
                          <a
                            href={`https://doi.org/${rest[0].doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-[9px] font-bold text-on-surface/40 hover:text-primary transition-colors uppercase tracking-widest"
                          >
                            <ExternalLink size={10} />
                            DOI
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom 3-column grid */}
              {rest.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10 border-t border-outline-variant/20 pt-16">
                  {rest.slice(1, 4).map((article, i) => (
                    <div
                      key={article.id}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                    >
                      <div className="aspect-video overflow-hidden bg-surface-container-high mb-5">
                        <img
                          src={STOCK_IMAGES[(i + 2) % STOCK_IMAGES.length]}
                          alt={article.title}
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary block mb-3">
                        {article.subject_area || 'Research Article'}
                      </span>
                      <h3 className="font-headline text-xl leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                        {article.abstract}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-on-surface/50">
                          <User size={12} />
                          <span>{formatAuthors(article.authors)}</span>
                        </div>
                        {article.doi && (
                          <a
                            href={`https://doi.org/${article.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1"
                          >
                            <ExternalLink size={10} />
                            DOI
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Editorial Spotlight ──────────────────────────────────────────── */}
      <section className="py-32 bg-surface-container-highest relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#8f3514 0.5px, transparent 0.5px)', backgroundSize: '24px 24px', opacity: 0.05 }}
        />
        <div className="container mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-10 items-center gap-20">
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="aspect-[3/4] bg-surface-container overflow-hidden shadow-2xl relative group">
                <img
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                  alt="Editor in Chief"
                  src={mina}
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="bg-surface p-12 shadow-xl relative overflow-hidden group/card">
                <img 
                  src={logo} 
                  alt="IJSDS Logo" 
                  className="absolute -top-4 -right-4 w-32 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity duration-1000 -rotate-12 pointer-events-none" 
                />
                <span className="text-primary font-headline text-7xl leading-none italic font-black block mb-6">"</span>
                <blockquote className="font-headline text-3xl md:text-4xl leading-snug text-on-surface mb-10 font-light">
                  Research is not just an academic exercise — it is how we shape the future. Through our journal, we give African scholars the platform they deserve to lead global conversations.
                </blockquote>
                <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                  <div>
                    <p className="text-lg font-bold font-headline">Prof. Mina Magaret Ogbanga</p>
                    <p className="text-on-surface/40 uppercase tracking-[0.3em] text-[9px] font-bold mt-1">
                      Editor-in-Chief, IJSDS
                    </p>
                  </div>
                  <img src={logo} alt="Official Stamp" className="h-10 opacity-20 hidden sm:block grayscale" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Submission CTA ───────────────────────────────────────────────── */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-4xl md:text-5xl mb-6 font-light leading-tight">
                Ready to share your <span className="italic">research with the world?</span>
              </h2>
              <p className="text-white/70 leading-relaxed max-w-md">
                IJSDS welcomes original research articles, case studies, and reviews on social work and development studies from researchers worldwide.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              {[
                'Double-blind peer review within 28 days',
                'Free to read — no subscription required',
                'Permanent DOI link assigned to every article',
                'Listed across 140+ academic databases',
              ].map((point) => (
                <div key={point} className="flex items-start gap-4">
                  <CheckCircle size={18} className="text-white/60 mt-0.5 shrink-0" />
                  <span className="text-white/80 text-sm leading-relaxed">{point}</span>
                </div>
              ))}
              <button
                onClick={() => navigate(user ? '/submit' : '/auth')}
                className="mt-4 bg-white text-primary px-10 py-4 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all self-start"
              >
                Submit Your Research
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-outline-variant/10">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface/25">
              Global Institutional Partners
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-16 items-center justify-items-center opacity-20 hover:opacity-80 transition-opacity duration-700">
            {['OXFORD', 'UNESCO', 'The UN', 'LSE', 'AFRICA UNION'].map((partner) => (
              <div key={partner} className="font-headline text-xl font-bold tracking-tighter text-on-surface">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

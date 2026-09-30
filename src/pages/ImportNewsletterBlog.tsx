import { ChangeEvent, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileUp, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { createBlogPost } from '@/lib/blogService';
import { importNewsletterBlogHtml, NewsletterBlogDraft } from '@/lib/newsletterBlogImport';

const blankDraft: NewsletterBlogDraft = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Announcements',
  tags: ['newsletter'],
};

export const ImportNewsletterBlog = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [draft, setDraft] = useState<NewsletterBlogDraft>(blankDraft);
  const [prepared, setPrepared] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { navigate('/auth'); return; }
    if (!profile.is_admin && !profile.is_editor) {
      toast({ title: 'Access denied', description: 'You need editor access to import a newsletter.', variant: 'destructive' });
      navigate('/dashboard');
    }
  }, [authLoading, navigate, profile]);

  const prepareDraft = () => {
    try {
      setDraft(importNewsletterBlogHtml(source));
      setPrepared(true);
      toast({ title: 'Newsletter prepared', description: 'Review the website draft below before saving it.' });
    } catch (error: any) {
      toast({ title: 'Could not prepare newsletter', description: error.message, variant: 'destructive' });
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const html = await file.text();
      setSource(html);
      setPrepared(false);
      toast({ title: 'HTML loaded', description: 'Select “Prepare website draft” to extract the article.' });
    } catch {
      toast({ title: 'Could not read file', description: 'Please choose a valid .html file.', variant: 'destructive' });
    } finally {
      event.target.value = '';
    }
  };

  const setDraftField = (field: keyof NewsletterBlogDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveDraft = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast({ title: 'Title and content are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const post = await createBlogPost({
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim() || undefined,
        content: draft.content,
        category: draft.category || 'Announcements',
        tags: draft.tags.map((tag) => tag.trim()).filter(Boolean),
        status: 'draft',
      });
      toast({ title: 'Website draft saved', description: 'It is not public. Review it in the editor before publishing.' });
      navigate(`/admin/blogs/edit/${post.id}`);
    } catch (error: any) {
      toast({ title: 'Could not save draft', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-stone-50" />;

  return (
    <div className="min-h-screen bg-stone-50 pb-16 font-body text-stone-900">
      <header className="border-b border-stone-100 bg-white px-8 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <button onClick={() => navigate('/admin/blogs')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 transition-colors hover:text-primary">
            <ArrowLeft size={12} /> Blog posts
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Newsletter to website</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-8 py-10">
        <section className="border border-stone-100 bg-white p-6">
          <div className="mb-5 flex items-start gap-3">
            <FileUp className="mt-0.5 text-primary" size={20} />
            <div>
              <h1 className="font-headline text-2xl font-semibold">Import newsletter blog HTML</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-500">The importer keeps the article, links, and semantic formatting. It removes the email/page shell, styles, draft notice, and duplicated heading before creating a website draft.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer border border-stone-200 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-stone-600 transition-colors hover:border-primary hover:text-primary">
              Choose .html file
              <input className="hidden" type="file" accept="text/html,.html,.htm" onChange={handleFile} />
            </label>
            <span className="text-xs text-stone-400">or paste the HTML below</span>
          </div>
          <textarea value={source} onChange={(event) => { setSource(event.target.value); setPrepared(false); }} placeholder="Paste the matching newsletter blog HTML here…" rows={9} className="mt-4 w-full resize-y border border-stone-200 bg-stone-50 p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary" />
          <button onClick={prepareDraft} disabled={!source.trim()} className="mt-4 bg-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">Prepare website draft</button>
        </section>

        {prepared && (
          <section className="border border-stone-100 bg-white p-6">
            <div className="mb-6 flex items-start gap-3 border-b border-stone-100 pb-5">
              <CheckCircle2 className="mt-0.5 text-green-600" size={20} />
              <div>
                <h2 className="text-sm font-bold">Review before saving</h2>
                <p className="mt-1 text-sm text-stone-500">Saving creates a <strong>draft only</strong>; it will not appear on the public website.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Title</label>
                <input value={draft.title} onChange={(event) => setDraftField('title', event.target.value)} className="w-full border border-stone-200 p-3 text-lg font-semibold outline-none focus:border-primary" />
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Excerpt</label>
                <textarea value={draft.excerpt} onChange={(event) => setDraftField('excerpt', event.target.value)} rows={3} className="w-full resize-y border border-stone-200 p-3 text-sm outline-none focus:border-primary" />
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Website HTML</label>
                <textarea value={draft.content} onChange={(event) => setDraftField('content', event.target.value)} rows={18} className="w-full resize-y border border-stone-200 p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary" />
              </div>

              <aside className="space-y-4 border-l-0 border-stone-100 lg:border-l lg:pl-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Category</label>
                  <input value={draft.category} onChange={(event) => setDraftField('category', event.target.value)} className="mt-2 w-full border border-stone-200 p-3 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Tags</label>
                  <input value={draft.tags.join(', ')} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value.split(',') }))} className="mt-2 w-full border border-stone-200 p-3 text-sm outline-none focus:border-primary" />
                  <p className="mt-2 text-xs text-stone-400">Separate tags with commas.</p>
                </div>
                <div className="border-l-4 border-primary bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">Status is locked to <strong>Draft</strong> here. Publishing remains an explicit action in the post editor after review.</div>
                <button onClick={saveDraft} disabled={saving} className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
                  <Save size={13} /> {saving ? 'Saving draft…' : 'Save website draft'}
                </button>
              </aside>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ImportNewsletterBlog;

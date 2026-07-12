import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { updateArticle, type Article, type ArticleAuthor } from '@/lib/articleService';

interface ArticleAuthorsEditorProps {
  article: Article;
  onUpdate: () => void;
}

const emptyAuthor = (): ArticleAuthor => ({ name: '', email: '', affiliation: '', orcid: '' });

export const ArticleAuthorsEditor = ({ article, onUpdate }: ArticleAuthorsEditorProps) => {
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [saving, setSaving] = useState(false);

  // Reload the local copy whenever a different article is selected
  useEffect(() => {
    const existing = Array.isArray(article.authors) ? article.authors : [];
    setAuthors(existing.length > 0 ? existing.map(a => ({ ...a })) : [emptyAuthor()]);
  }, [article.id]);

  const updateField = (index: number, field: keyof ArticleAuthor, value: string) => {
    setAuthors(prev => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const addAuthor = () => setAuthors(prev => [...prev, emptyAuthor()]);

  const removeAuthor = (index: number) => {
    setAuthors(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= authors.length) return;
    setAuthors(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    const cleaned = authors
      .map(a => ({
        name: a.name?.trim() ?? '',
        email: a.email?.trim() ?? '',
        affiliation: a.affiliation?.trim() ?? '',
        orcid: a.orcid?.trim() ?? '',
      }))
      .filter(a => a.name || a.email || a.affiliation || a.orcid);

    if (cleaned.length === 0) {
      toast({ title: 'Add an author', description: 'An article needs at least one author.', variant: 'destructive' });
      return;
    }
    if (cleaned.some(a => !a.name)) {
      toast({ title: 'Name required', description: 'Every author needs a name.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await updateArticle(article.id, { authors: cleaned });
      toast({
        title: 'Authors saved',
        description: 'The author list has been updated. Redeposit the DOI to push this to CrossRef.',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Couldn't save authors",
        description: error?.message ?? 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Authors
        </CardTitle>
        <CardDescription>
          Order matters: authors appear in this order on the article page, in citations, and in the CrossRef deposit.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {authors.map((author, index) => (
          <div key={index} className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Author {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button" variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => move(index, -1)} disabled={index === 0}
                  aria-label={`Move author ${index + 1} up`}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button" variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => move(index, 1)} disabled={index === authors.length - 1}
                  aria-label={`Move author ${index + 1} down`}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button" variant="ghost" size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeAuthor(index)} disabled={authors.length === 1}
                  aria-label={`Remove author ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`author-name-${index}`}>Full name *</Label>
                <Input
                  id={`author-name-${index}`}
                  value={author.name ?? ''}
                  onChange={e => updateField(index, 'name', e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`author-email-${index}`}>Email</Label>
                <Input
                  id={`author-email-${index}`}
                  type="email"
                  value={author.email ?? ''}
                  onChange={e => updateField(index, 'email', e.target.value)}
                  placeholder="jane@university.edu"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`author-affiliation-${index}`}>Affiliation</Label>
                <Input
                  id={`author-affiliation-${index}`}
                  value={author.affiliation ?? ''}
                  onChange={e => updateField(index, 'affiliation', e.target.value)}
                  placeholder="University of Port Harcourt"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`author-orcid-${index}`}>ORCID iD</Label>
                <Input
                  id={`author-orcid-${index}`}
                  value={author.orcid ?? ''}
                  onChange={e => updateField(index, 'orcid', e.target.value)}
                  placeholder="0000-0000-0000-0000"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="button" variant="outline" onClick={addAuthor} className="gap-2">
            <Plus className="h-4 w-4" /> Add author
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="gap-2 sm:ml-auto">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save authors'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateArticle } from "@/lib/articleService";
import { PAPER_SECTIONS } from "@/lib/paperSections";

interface ArticleSectionEditorProps {
  article: { id: string; subject_area?: string | null };
  onUpdate: () => void;
}

/** Lets editors move an article (published or not) to another section. */
export const ArticleSectionEditor = ({ article, onUpdate }: ArticleSectionEditorProps) => {
  const { toast } = useToast();
  const current = article.subject_area ?? "";
  const [section, setSection] = useState(current);
  const [saving, setSaving] = useState(false);
  // Keep an older, free-text section selectable so saving never silently changes it.
  const options = current && !PAPER_SECTIONS.includes(current as (typeof PAPER_SECTIONS)[number])
    ? [current, ...PAPER_SECTIONS]
    : [...PAPER_SECTIONS];

  const save = async () => {
    setSaving(true);
    try {
      await updateArticle(article.id, { subject_area: section });
      toast({ title: "Section updated", description: `Now filed under ${section}.` });
      onUpdate();
    } catch (err) {
      toast({ title: "Couldn't update the section", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-1.5">
        <Label htmlFor={`section-${article.id}`}>Section</Label>
        <select
          id={`section-${article.id}`}
          className="w-full h-10 border border-input bg-background px-3 text-sm"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          {!current && <option value="">Choose a section</option>}
          {options.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Button onClick={save} disabled={saving || !section || section === current}>
        {saving ? "Saving…" : "Save section"}
      </Button>
    </div>
  );
};

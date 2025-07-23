import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Author {
  name: string;
  email: string;
  affiliation: string;
  orcid?: string;
}

export const Submit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [authors, setAuthors] = useState<Author[]>([
    { name: '', email: user?.email || '', affiliation: '', orcid: '' }
  ]);
  const [correspondingAuthorEmail, setCorrespondingAuthorEmail] = useState(user?.email || '');
  const [subjectArea, setSubjectArea] = useState('');
  const [fundingInfo, setFundingInfo] = useState('');
  const [conflictsOfInterest, setConflictsOfInterest] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', affiliation: '', orcid: '' }]);
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const updatedAuthors = authors.map((author, i) => 
      i === index ? { ...author, [field]: value } : author
    );
    setAuthors(updatedAuthors);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit an article.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create article
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .insert({
          title,
          abstract,
          keywords,
          authors: authors as any,
          corresponding_author_email: correspondingAuthorEmail,
          subject_area: subjectArea,
          funding_info: fundingInfo,
          conflicts_of_interest: conflictsOfInterest,
          status: 'draft'
        })
        .select()
        .single();

      if (articleError) throw articleError;

      // Create submission
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          article_id: articleData.id,
          submitter_id: user.id,
          cover_letter: coverLetter,
          status: 'submitted'
        });

      if (submissionError) throw submissionError;

      // Update article status to submitted
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'submitted' })
        .eq('id', articleData.id);

      if (updateError) throw updateError;

      toast({
        title: 'Article submitted successfully',
        description: 'Your article has been submitted for review. You will receive updates via email.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting article:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit article. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to submit an article to the journal.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Submit Article</h1>
          <p className="text-muted-foreground">
            Submit your research article for peer review and publication in IJSDS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Article Information */}
          <Card>
            <CardHeader>
              <CardTitle>Article Information</CardTitle>
              <CardDescription>Provide the basic information about your article</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Article Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter the full title of your article"
                />
              </div>

              <div>
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea
                  id="abstract"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                  rows={6}
                  placeholder="Provide a comprehensive abstract of your research (250-300 words)"
                />
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Enter a keyword"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="subjectArea">Subject Area</Label>
                <Input
                  id="subjectArea"
                  value={subjectArea}
                  onChange={(e) => setSubjectArea(e.target.value)}
                  placeholder="e.g., Development Economics, Social Policy, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Authors Information */}
          <Card>
            <CardHeader>
              <CardTitle>Authors Information</CardTitle>
              <CardDescription>Add all authors and their details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authors.map((author, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Author {index + 1}</h4>
                    {authors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAuthor(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={author.name}
                        onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                        required
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={author.email}
                        onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                        required
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <Label>Affiliation</Label>
                      <Input
                        value={author.affiliation}
                        onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
                        placeholder="Institution/University"
                      />
                    </div>
                    <div>
                      <Label>ORCID ID</Label>
                      <Input
                        value={author.orcid}
                        onChange={(e) => updateAuthor(index, 'orcid', e.target.value)}
                        placeholder="0000-0000-0000-0000"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addAuthor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Author
              </Button>

              <div>
                <Label htmlFor="correspondingEmail">Corresponding Author Email *</Label>
                <Input
                  id="correspondingEmail"
                  type="email"
                  value={correspondingAuthorEmail}
                  onChange={(e) => setCorrespondingAuthorEmail(e.target.value)}
                  required
                  placeholder="Email of the corresponding author"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="funding">Funding Information</Label>
                <Textarea
                  id="funding"
                  value={fundingInfo}
                  onChange={(e) => setFundingInfo(e.target.value)}
                  rows={3}
                  placeholder="Provide details about funding sources, grant numbers, etc."
                />
              </div>

              <div>
                <Label htmlFor="conflicts">Conflicts of Interest</Label>
                <Textarea
                  id="conflicts"
                  value={conflictsOfInterest}
                  onChange={(e) => setConflictsOfInterest(e.target.value)}
                  rows={3}
                  placeholder="Declare any conflicts of interest or state 'None'"
                />
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Brief cover letter explaining the significance of your work"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Article'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
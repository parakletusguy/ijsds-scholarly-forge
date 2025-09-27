import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/file-management/FileUpload';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DialogHeader } from '@/components/ui/dialog';
// import {PayDialog} from '@/components/submission/paystackDialogBox';

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
  const [manuscriptFileUrl, setManuscriptFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [submissionEnabled, setSubmissionEnabled] = useState(true)
  const [checkingSubmissionStatus, setCheckingSubmissionStatus] = useState(true)

  // Load saved draft and check submission status on mount
  useEffect(() => {
    if (user) {
      loadDraft();
    }
    checkSubmissionStatus();
  }, [user]);

  const checkSubmissionStatus = async () => {
    setCheckingSubmissionStatus(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'submission_enabled')
        .single();

      if (error) {
        console.error('Error checking submission status:', error);
        // Default to enabled if we can't check
        setSubmissionEnabled(true);
      } else {
        setSubmissionEnabled(data.setting_value === 'true');
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
      setSubmissionEnabled(true);
    } finally {
      setCheckingSubmissionStatus(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (user && (title || abstract || keywords.length > 0)) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [title, abstract, keywords, authors, correspondingAuthorEmail, subjectArea, fundingInfo, conflictsOfInterest, coverLetter, manuscriptFileUrl, user]);

  const loadDraft = async () => {
    try {
      const savedData = localStorage.getItem(`article_draft_${user?.id}`);
      if (savedData) {
        const draft = JSON.parse(savedData);
        setTitle(draft.title || '');
        setAbstract(draft.abstract || '');
        setKeywords(draft.keywords || []);
        setAuthors(draft.authors || [{ name: '', email: user?.email || '', affiliation: '', orcid: '' }]);
        setCorrespondingAuthorEmail(draft.correspondingAuthorEmail || user?.email || '');
        setSubjectArea(draft.subjectArea || '');
        setFundingInfo(draft.fundingInfo || '');
        setConflictsOfInterest(draft.conflictsOfInterest || '');
        setCoverLetter(draft.coverLetter || '');
        setManuscriptFileUrl(draft.manuscriptFileUrl || '');
        setDraftId(draft.draftId || null);
        setLastSaved(new Date(draft.lastSaved));
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    if (!user || autoSaving) return;
    
    setAutoSaving(true);
    try {
      const draftData = {
        title,
        abstract,
        keywords,
        authors,
        correspondingAuthorEmail,
        subjectArea,
        fundingInfo,
        conflictsOfInterest,
        coverLetter,
        manuscriptFileUrl,
        draftId,
        lastSaved: new Date().toISOString(),
        userId: user.id
      };

      // Save to localStorage first (immediate backup)
      localStorage.setItem(`article_draft_${user.id}`, JSON.stringify(draftData));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(`article_draft_${user?.id}`);
    setDraftId(null);
    setLastSaved(null);
  };

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

    // Validate required fields
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your article.',
        variant: 'destructive',
      });
      return;
    }

    if (!abstract.trim()) {
      toast({
        title: 'Abstract required',
        description: 'Please enter an abstract for your article.',
        variant: 'destructive',
      });
      return;
    }

    if (!manuscriptFileUrl) {
      toast({
        title: 'Manuscript file required',
        description: 'Please upload your manuscript file before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (authors.some(author => !author.name.trim() || !author.email.trim())) {
      toast({
        title: 'Author information incomplete',
        description: 'Please ensure all authors have names and email addresses.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Save a final backup before submission
      await saveDraft();

      // Create article
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .insert({
          title: title.trim(),
          abstract: abstract.trim(),
          keywords,
          authors: authors as any,
          corresponding_author_email: correspondingAuthorEmail,
          subject_area: subjectArea,
          funding_info: fundingInfo,
          conflicts_of_interest: conflictsOfInterest,
          manuscript_file_url: manuscriptFileUrl,
          status: 'draft',
          vetting_fee:false
        })
        .select()
        .single();

      if (articleError) throw articleError;

      // if(!vet){
      //   setopen(true)
      //   throw 'vetting fee not paid yet'
      // }

      // Create submission
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          article_id: articleData.id,
          submitter_id: user.id,
          cover_letter: coverLetter,
          status: 'submitted',
          vetting_fee:false
        });

      if (submissionError) throw submissionError;

      // Update article status to submitted
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'submitted' })
        .eq('id', articleData.id);

      if (updateError) throw updateError;

      // Clear the draft after successful submission
      clearDraft();

      // Send notifications
      try {
        // Get user profile for notifications
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const authorName = profile?.full_name || 'Author';

        // Get total submissions count for admin notification
        const { count: totalSubmissions } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .gte('submitted_at', new Date().toDateString());

        // Import notification functions
        const { notifyUserSubmissionReceived, notifyAdminsNewSubmission } = await import('@/lib/emailService');
        const { notifySubmissionAcceptance } = await import('@/lib/paymentNotificationService');
        
        // Notify user about successful submission
        await notifyUserSubmissionReceived(user.id, authorName, title.trim());
        
        // Notify about submission acceptance
        await notifySubmissionAcceptance(user.id, authorName, correspondingAuthorEmail, title.trim());
        
        // Notify admins about new submission with details
        await notifyAdminsNewSubmission(
          title.trim(), 
          authorName, 
          correspondingAuthorEmail, 
          (totalSubmissions || 0) + 1
        );
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Don't fail the submission if notifications fail
      }

      toast({
        title: 'Article submitted successfully',
        description: 'Your article has been submitted for review. You will receive updates via email.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting article:', error);
      
      // Provide more specific error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: 'Submission failed',
        description: `Failed to submit article: ${errorMessage}. Your work has been saved automatically.`,
        variant: 'destructive',
      });

      // Don't navigate away on error - keep the form data
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
                < div className="relative py-6">
                      <Button 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      className="mb-4 absolute top-1 left-3"
                        >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      </div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Submit Article</h1>
              <p className="text-muted-foreground">
                Submit your research article for peer review and publication in IJSDS
              </p>
            </div>
            {/* Auto-save status indicator */}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {autoSaving ? (
                <>
                  <Save className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Save className="h-4 w-4 text-green-600" />
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {checkingSubmissionStatus ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !submissionEnabled ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-2 text-destructive">Submissions Currently Closed</h2>
                <p className="text-muted-foreground mb-4">
                  New submissions are temporarily disabled. Please check back later or contact the editorial office for more information.
                </p>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
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

          {/* Manuscript Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Manuscript File</CardTitle>
              <CardDescription>Upload your manuscript file (DOC or DOCX only)</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                bucketName="journal-website-db1"
                folder="manuscripts"
                onFileUploaded={(url) => setManuscriptFileUrl(url)}
                acceptedTypes=".doc,.docx"
                maxSizeMB={10}
              />
              {manuscriptFileUrl && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✓ Manuscript file uploaded successfully
                  </p>
                </div>
              )}
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
        )}
      </div>
    </div>
  );
};
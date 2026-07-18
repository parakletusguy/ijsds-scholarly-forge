import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateArticle } from '@/lib/productionService';
import { uploadFile, resolveFileUrl } from '@/lib/fileService';
import type { Article } from '@/lib/articleService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit3, Save, FileText, Clock, User, CheckCircle, Eye, Download, Car, File, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextEditor } from '../editor/joditEditor';
import DownloadDocx from '@/lib/html-docx';
import { spellCheck } from '@/lib/languagetool';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet  } from '@react-pdf/renderer';
import { PdfFile } from './html-pdf';


interface CopyeditingToolsProps {
  article: Article;
  onUpdate: () => void;
}

export const CopyeditingTools = ({ article, onUpdate }: CopyeditingToolsProps) => {
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState('');
  const [editor, setEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content,setContent] = useState('')
  const [fileName, setfileName] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [suggestions, setSuggestions] = useState([
    { id: 1, type: 'grammar', text: 'Consider revising sentence structure in paragraph 3', status: 'pending' },
    { id: 2, type: 'style', text: 'Standardize citation format throughout', status: 'pending' },
    { id: 3, type: 'formatting', text: 'Update figure captions to match journal style', status: 'completed' },
  ]);

  const updateArticleStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateArticle(article.id, { status: newStatus });

      toast({
        title: "Status Updated",
        description: `Article status changed to ${newStatus.replace('_', ' ')}`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update article status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEditing = async () => {
    

    setLoading(true);
    try {

      // Convert the edited HTML to a .docx and save it through the backend,
      // which stores it in Supabase and records the new version in the database.
      const docFile = await DownloadDocx(content, fileName);
      const editedFile = new globalThis.File(
        [docFile.converted],
        docFile.fileName || `${article.id}_edited.docx`,
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      );
      await uploadFile(editedFile, article.id);

      toast({
        title: "Saved",
        description: "The edited document has been saved as a new version.",
      });
      setEditingNotes('');
      onUpdate();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save copyediting notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestionStatus = (suggestionId: number) => {
    setSuggestions(prev =>
      prev.map(suggestion =>
        suggestion.id === suggestionId
          ? { ...suggestion, status: suggestion.status === 'pending' ? 'completed' : 'pending' }
          : suggestion
      )
    );
  };

  const viewArticle = async (url) => {

    if(content == ''){  
      const fileNameUrl = url.split("/").pop(); 
      console.log(fileName); 
      const apiBase = import.meta.env.VITE_API_URL || "https://ijsdsbackend-429660256945.europe-southwest1.run.app";
      const normalizedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
      const getHtml = await fetch(`${normalizedBase}/supabase/getFile`, {
      method: 'POST',
      headers: {"Content-Type" : "application/json"},
      body:JSON.stringify({
        url:url
      })
    })
    const htmlValue = await getHtml.json()
    setfileName(fileNameUrl)
    setContent(htmlValue.data)
  }else{
    setContent(content)
  }

    setEditor(true)
  }

const Check = async (html) => {
  console.log('...running checks')
    const tempDiv =document.createElement('div')
    tempDiv.innerHTML = html
    const text = tempDiv.innerText || tempDiv.textContent
    const spellCheckMatches = await spellCheck(text)
    console.log(spellCheckMatches)
    console.log(spellCheckMatches.matches)
    spellCheckMatches.matches.forEach(element => {
      console.log(element)
    });
}

  const downloadOriginalDocument = async () => {
    if (!article.manuscript_file_url) {
      toast({
        title: "No Document",
        description: "No manuscript file available for download",
        variant: "destructive",
      });
      return;
    }

    try {
      // manuscript_file_url is already a full storage URL (or a backend path);
      // resolveFileUrl handles both.
      const fileUrl = resolveFileUrl(article.manuscript_file_url);

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${article.title.replace(/[^a-z0-9]/gi, '_')}_original.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Document download has started",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the document",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // The backend stores the file in Supabase storage and records its path
      // as a new version in the primary database.
      await uploadFile(uploadedFile, article.id);

      toast({
        title: "Document updated",
        description: "The edited document has been uploaded and saved as the latest version.",
      });

      setUploadedFile(null);
      onUpdate(); // Refresh the article data
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error?.message ?? "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

const DownloadButton = () => {
  const styles = StyleSheet.create({
  page: {
    padding: 30, // Adds a 30-point margin on all sides
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});
  return <PDFDownloadLink document={<PdfFile htmlContent={content}/>} fileName={`${fileName.split(".")[0]}`}>
    {({ blob, url, loading, error }) => (
      <Button disabled={loading}>
        {loading ? 'Generating PDF...' : 'Download PDF'}
      </Button>
    )}
  </PDFDownloadLink>
};

  return (
    <div className="space-y-6">
      {/* Article Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Article Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{article.abstract}</p>
            <div className="flex items-center gap-4">
              <Badge variant={article.status === 'accepted' ? 'default' : 'secondary'}>
                {article.status.replace('_', ' ')}
              </Badge>
              {article.manuscript_file_url && (
                <Button variant="outline" className='cursor-pointer' size="sm" asChild onClick={() => viewArticle(article.manuscript_file_url)}>
                   <p className='flex'> <FileText className="h-4 w-4 mr-2" />
                  View Manuscript</p>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download and Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Document Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Download for Editing</h4>
              <Button 
                onClick={downloadOriginalDocument}
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Original Document
              </Button>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Upload Edited Document</h4>
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select edited file</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".docx,.doc,.pdf"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                />
                <Button 
                  onClick={handleFileUpload}
                  disabled={!uploadedFile || uploading}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload & Replace Document'}
                </Button> 
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download PDF */}
      {/* <Card>
        <CardHeader>
          <CardTitle className='flex space-x-2'>
            <File className='h-5 w-5 mx-3'/>
            Download PDF
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <DownloadButton/>
        </CardContent>
      </Card> */}

      {/* Copyediting Tools */}
      {/* <Card> */}
        {/* <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Copyediting Tools
          </CardTitle>
        </CardHeader> */}
        {/* <CardContent className="space-y-4"> */}
          {/* <div className="grid md:grid-cols-3 gap-4">
                 <Button variant="outline" onClick={() => {Check(content)}} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Spell Check
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Grammar Check
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Style Guide
            </Button>
            
          </div> */}

          {/* <Separator /> */}

          {/* <div>
            <h4 className="font-semibold mb-3">Copyediting Notes</h4>
            <Textarea
              placeholder="Add copyediting notes and suggestions..."
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="min-h-[100px] mb-3"
            />
            <Button 
              onClick={saveEditing}
              // disabled={!editingNotes.trim() || loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Edited File
            </Button>
          </div> */}
        {/* </CardContent> */}
      {/* </Card> */}

      {/* Editing Suggestions */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Editing Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border ${
                  suggestion.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                      <Badge 
                        variant={suggestion.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {suggestion.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSuggestionStatus(suggestion.id)}
                    className="ml-2"
                  >
                    {suggestion.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Status Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Production Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {article.status === 'accepted' && (
              <Button
                onClick={() => updateArticleStatus('in_production')}
                disabled={loading}
                variant="outline"
              >
                Start Production
              </Button>
            )}
            {['accepted', 'in_production'].includes(article.status) && (
              <Button
                onClick={() => updateArticleStatus('processed')}
                disabled={loading}
                variant="default"
              >
                Mark as Processed
              </Button>
            )}
            {article.status === 'processed' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Ready for Publication</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}

      { editor && <TextEditor content={content} setContent={setContent} editor={editor} setEditor={setEditor}/>}

    </div>
  );
};
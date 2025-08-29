import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit3, Save, FileText, Clock, User, CheckCircle, Eye, Download, Car, File } from 'lucide-react';
import { TextEditor } from '../editor/joditEditor';
import DownloadDocx from '@/lib/html-docx';
import { spellCheck } from '@/lib/languagetool';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet  } from '@react-pdf/renderer';
import { PdfFile } from './html-pdf';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  abstract: string;
  manuscript_file_url: string;
}

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
  
  const [suggestions, setSuggestions] = useState([
    { id: 1, type: 'grammar', text: 'Consider revising sentence structure in paragraph 3', status: 'pending' },
    { id: 2, type: 'style', text: 'Standardize citation format throughout', status: 'pending' },
    { id: 3, type: 'formatting', text: 'Update figure captions to match journal style', status: 'completed' },
  ]);

  const updateArticleStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: newStatus })
        .eq('id', article.id);

      if (error) throw error;

      // Send notification if article is being marked as processed
      if (newStatus === 'processed') {
        try {
          // Get article and submission details for notification
          const { data: submission } = await supabase
            .from('submissions')
            .select(`
              submitter_id,
              profiles!inner(full_name)
            `)
            .eq('article_id', article.id)
            .single();

          if (submission) {
            const { notifyUserArticleProcessed } = await import('@/lib/emailService');
            await notifyUserArticleProcessed(
              submission.submitter_id,
              submission.profiles.full_name || 'Author',
              article.title
            );
          }
        } catch (notificationError) {
          console.error('Error sending processed notification:', notificationError);
          // Don't fail the status update if notification fails
        }
      }

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

      // In a real implementation, you'd save to a copyediting_notes table
       const docFile = await DownloadDocx(content,fileName)
       const {data,error} = await supabase.storage
       .from('journal-website-db1')
      .upload(docFile.fileName,docFile.converted, {
        upsert:true
      });
      if(error) throw error

      toast({
        title: "Notes Saved",
        description: "Edited file has been savedhave been saved",
      });
      setEditingNotes('');
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
      const getHtml = await fetch('https://ijsdsbackend-agewf0h8g5hfawax.switzerlandnorth-01.azurewebsites.net/supabase/getFile', {
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
//  const MyDocument = () => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <View style={styles.section}>
//         <PdfFile htmlContent={content}/>
//       </View>
//     </Page>
//   </Document>
// );
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
              <Badge variant={article.status === 'copyediting' ? 'default' : 'secondary'}>
                {article.status.replace('_', ' ')}
              </Badge>
              {article.manuscript_file_url && (
                <Button variant="outline" className='cursor-pointer' size="sm" asChild onClick={() => viewArticle(article.manuscript_file_url)}>
                   <p className='flex'> <FileText className="h-4 w-4 mr-2" />
                    Edit/View Manuscript</p>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* download pdf */}
      <Card>
        <CardHeader>
          <CardTitle className='flex space-x-2'>
            <File className='h-5 w-5 mx-3'/>
            Download Pdf
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
                      <DownloadButton/>
        </CardContent>
      </Card>

      {/* Copyediting Tools */}
      <Card>
        {/* <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Copyediting Tools
          </CardTitle>
        </CardHeader> */}
        <CardContent className="space-y-4">
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

          <Separator />

          <div>
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
          </div>
        </CardContent>
      </Card>

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
      <Card>
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
      </Card>

      { editor && <TextEditor content={content} setContent={setContent} editor={editor} setEditor={setEditor}/>}

    </div>
  );
};
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Calendar, User, Download } from 'lucide-react';
import Monnify from 'monnify-ts'
import { ProcessinFeeDialog, VettingDialog } from '@/components/submission/paystackDialogBox';
import { SubmissionFileManager } from '@/components/submission/SubmissionFileManager';

interface SubmissionDetails {
  id: string;
  status: string;
  submitted_at: string;
  submitter_id: string;
  articles: {
    id,
    title: string;
    abstract: string;
    subject_area: string;
    authors: any;
    manuscript_file_url: string | null;
    vetting_fee : boolean,
    Processing_fee : boolean
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

export const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [open,setopen] = useState(false)
  const [vet,setvet] = useState(false)
  const [processing,setprocessing] = useState(false)


  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && submissionId) {
      fetchSubmissionDetails();
    }
  }, [user, loading, submissionId, navigate]);

  const fetchSubmissionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          status,
          submitted_at,
          submitter_id,
          articles (
            id,
            title,
            abstract,
            subject_area,
            authors,
            manuscript_file_url,
            vetting_fee,
            Processing_fee
          ),
          profiles (
            full_name,
            email
          )
        `)
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      setSubmission(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch submission details',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

    let userData = null
    let userDataPro = null
   {submission ?  userData = {
      email:submission.profiles.email,
      // amount:500000,
      amount:10000,
      metadata:{
        name:submission.profiles.full_name
      },
      // onSuccess: (response) => onSuccess(response,"vetting",500000),
      onSuccess: (response) => onSuccess(response,"vetting",10000),
      onClose:() => {    toast({
          title: 'payment cancelled',
          description: `you cancelled payment for the processing fee`,
          variant: 'destructive',
        });}
    } : null}

       {submission ?  userDataPro = {
      email:submission.profiles.email,
      amount:2000000,
      metadata:{
        name:submission.profiles.full_name
      },
      onSuccess: (response) => onSuccess(response,"processing",2000000),
      onClose:() => {    toast({
          title: 'payment cancelled',
          description: `you cancelled payment for the processing fee`,
          variant: 'destructive',
        });}
    } : null}


    const onSuccess = async (pReponse, type:string, amount:number) => {
      try {
        const transactionReference = pReponse.reference
        // const confirm = await fetch("https://ijsdsbackend-agewf0h8g5hfawax.switzerlandnorth-01.azurewebsites.net/api/verify-payment",{
        //   method:"POST",
        //   headers:{ 'Content-Type':'application/json'},
        //   body:JSON.stringify({reference:transactionReference,amount:500000})
        // }) 
        const confirm = await fetch("https://ijsdsbackend-agewf0h8g5hfawax.switzerlandnorth-01.azurewebsites.net/api/verify-payment",{
          method:"POST",
          headers:{ 'Content-Type':'application/json'},
          body:JSON.stringify({reference:transactionReference,amount:amount,articleId:submission.articles.id,type:type})
        }) 
        const {success,message,data} = await confirm.json()
        console.log({success,message,data})
        if(!success) throw "server error"
        if(!data.status) throw "payment not verified"
        // if(data.amount != 500000) throw 'amount not equal'
        
        

        toast({
            title:'payment successful',
            description:`your payment has been successfully verified`
          })
      } catch (error) {
        if(error){
          console.log(error)
  
          toast({
            title:'payment failed',
            description:`payment failed due to ${error}, please contact support or try again later`,
            variant:'destructive'
          })
        }
      }
    }


  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <LoadingSpinner size="lg" text="Loading submission details..." />
        </main>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
                <div className="relative py-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="mb-4 absolute top-1 left-3"
                    >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
          <div className="relative py-3">   
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="mb-4 absolute top-1 left-3"
                    >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Submission Details
            </h1>
            <Badge className={getStatusColor(submission.status)}>
              {submission.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{submission.articles.title}</h3>
                  {submission.articles.subject_area && (
                    <Badge variant="secondary" className="mb-4">
                      {submission.articles.subject_area}
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2">Abstract</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {submission.articles.abstract}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2">Authors</h4>
                  {submission.articles.authors && Array.isArray(submission.articles.authors) ? (
                    <div className="space-y-2">
                      {submission.articles.authors.map((author: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{author.name}</span>
                          {author.affiliation && (
                            <span className="text-muted-foreground">
                              ({author.affiliation})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No author information available</p>
                  )}
                </div>

                {submission.articles.manuscript_file_url && (
                  <div>
                    <h4 className="font-medium text-lg mb-2">Manuscript</h4>
                    <Button 
                      variant="outline"
                      onClick={() => window.open(submission.articles.manuscript_file_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Manuscript
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Author File Management */}
            <SubmissionFileManager
              submissionId={submissionId!}
              articleId={submission.articles.id}
              isAuthor={user?.id === submission.submitter_id}
              vettingFee={submission.articles.vetting_fee}
              processingFee={submission.articles.Processing_fee}
            />
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Submission Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submitter</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.profiles.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {submission.profiles.email}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Current Status</p>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className=' py-3 mt-3'>
              <CardHeader>
                <CardTitle> Payment Info</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                 <div className='flex justify-between items-center'>
                <p>Click here to pay for vetting</p>
                <button className='rounded-sm bg-black text-white px-3 py-1 h-9' onClick={() => setvet(true)} >Pay</button>
            </div>
                  <div className='flex justify-between '>
                <p>Click here to pay for processing</p>
                <button className='rounded-sm bg-black text-white px-3 py-1 h-9' onClick={() => setprocessing(true)}>Pay</button>
            </div>
              </CardContent>
            </Card>
            <VettingDialog userData={userData} vet={vet} setvet={setvet}/>
            <ProcessinFeeDialog userData={userDataPro} processing={processing} setprocessing={setprocessing}/>
          </div>
        </div>
      </main>
    </div>
  );
};
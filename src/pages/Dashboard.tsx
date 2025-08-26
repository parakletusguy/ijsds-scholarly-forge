import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, User } from 'lucide-react';
import { RejectionMessages } from '@/components/messages/RejectionMessages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProcessinFeeDialog } from '@/components/submission/paystackDialogBox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';


interface Submission {
  id: string;
  article_id: string;
  status: string;
  submitted_at: string;
  articles: {
    title: string;
    abstract: string;
    status: string;
    authors: any;
  };
  vetting_fee:boolean,
  processing_fee:boolean
}

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open,setopen] = useState(false)
  const [userdat, setuserdat] = useState({})

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSubmissions();
  }, [user, navigate]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          article_id,
          status,
          submitted_at,
          articles (
            title,
            abstract,
            corresponding_author_email,
            status,
            authors
          ),
          vetting_fee,
          processing_fee
        `)
        .eq('submitter_id', user.id)
        .order('submitted_at', { ascending: false });
            console.log(data)
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (bool:Boolean) => {
    switch(bool){
      case true:
        return 'bg-green-100 text-green-800'
      case false:
        return 'bg-red-100 text-red-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!user) {
    return null;
  }

  const onSuccess = async (pReponse) => {
      try {
        console.log(pReponse.reference)
        const transactionReference = pReponse.reference
        const confirm = await fetch("http://localhost:4500/api/verify-payment",{
          method:"POST",
          headers:{ 'Content-Type':'application/json'},
          body:JSON.stringify({reference:transactionReference,amount:2000000})
        }) 
        const {success,message,data} = await confirm.json()
        console.log({success,message,data})
        if(!success) throw "server error"
        if(!data.status) throw "payment not verified"
        if(data.amount != 2000000) throw 'amount not equal'

        const {data : submisionData,error} = await supabase
        .from('submissions')
        .update({processing_fee:true})
        .eq('submitter_id', user.id)
        if(error){
          throw "couldn't process payment, try again later"
        }
  
        toast({
            title:'payment successful',
            description:`your payment has been successfully verified, kindly proceed to submit your article`
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

    const handleSubmit = (userData) => {
        setuserdat(userData)
        setopen(true)
    }
    

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
      <div className="space-y-6  mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your article submissions and track their progress
            </p>
          </div>
          <Button onClick={() => navigate('/submit')}>
            <Plus className="h-4 w-4 mr-2" />
            Submit New Article
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.status === 'under_review').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.status === 'accepted').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Submissions</h2>
          
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by submitting your first article to the journal.
                </p>
                <Button onClick={() => navigate('/submit')}>
                  Submit Your First Article
                </Button>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => {
                      const userData = {
                      email:submission.articles.corresponding_author_email,
                      amount:2000000,
                      metadata:{
                        name:name
                      },
                      onSuccess: (response) => onSuccess(response),
                      onClose:() => {    
                      toast({
                        title: 'payment cancelled',
                        description: `you cancelled payment for the vet fee`,
                        variant: 'destructive',
                      });
                        }
                      } 
              return <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">
                        {submission.articles.title}
                      </CardTitle>
                      <CardDescription>
                        Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(submission.status)}
                    >
                      {formatStatus(submission.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between'>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {submission.articles.abstract}
                    </p>
                    <div className='flex flex-col items-center'>
                          <Badge
                            variant='secondary'
                            className={getPaymentColor(submission.vetting_fee)}
                          >
                            <p>vetting fee: {submission.vetting_fee ? "paid" : "not paid"}</p>
                          </Badge>

                            {/* <Badge
                            variant='secondary'
                            className={getPaymentColor(submission.processing_fee)}
                            >
                            <p>processing fee: {submission.processing_fee ? "paid" : "not paid"}</p>
                          </Badge> */}
                          {
                            submission.processing_fee? <div>
                                <Badge
                            variant='secondary'
                            className={getPaymentColor(submission.processing_fee)}
                            >processing fee: paid</Badge>
                            </div>:
                            <button className='bg-black p-1 rounded-sm m-3' onClick={() => {handleSubmit(userData)}}>
                              <p className='text-[9px] text-white'>click to pay for processing fee</p>
                            </button>
                          }
                    </div>
                  </div>
                  
                  {submission.status === 'rejected' && (
                    <div className="mb-4">
                      <RejectionMessages submissionId={submission.id} />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Article Status: {formatStatus(submission.articles.status)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/submission/${submission.id}/details`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            })
          )}
        </div>
      </div>
      {/* <processinFeeDialog open={open} setopen={setopen} userData={userdat}/> */}
      <ProcessinFeeDialog  open={open} setopen={setopen} userData={userdat}/>
    </div>
  );
};
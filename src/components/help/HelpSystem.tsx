import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Search, BookOpen, Users, FileText, Settings, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Learn the basics of using our journal platform',
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Click on the "Sign In" button in the top navigation and select "Sign Up". Fill in your details and verify your email address.'
      },
      {
        question: 'How do I submit a manuscript?',
        answer: 'Navigate to the "Submit" page, fill in all required fields including title, abstract, authors, and upload your manuscript file.'
      },
      {
        question: 'What file formats are accepted?',
        answer: 'We accept PDF, DOC, DOCX, and LaTeX files. Please ensure your file is under 10MB.'
      }
    ]
  },
  {
    id: 'peer-review',
    title: 'Peer Review Process',
    icon: Users,
    description: 'Understanding the review process and reviewer guidelines',
    items: [
      {
        question: 'How long does the review process take?',
        answer: 'The initial review typically takes 6-8 weeks. We will notify you of any delays or updates.'
      },
      {
        question: 'Can I suggest reviewers?',
        answer: 'Yes, you can suggest up to 3 potential reviewers during submission. Please provide their contact information and expertise areas.'
      },
      {
        question: 'How do I respond to reviewer comments?',
        answer: 'Access your submission dashboard and click on "Respond to Reviews". Address each comment systematically and upload a revised manuscript.'
      }
    ]
  },
  {
    id: 'publishing',
    title: 'Publication & Copyright',
    icon: FileText,
    description: 'Information about publication policies and copyright',
    items: [
      {
        question: 'What are the publication fees?',
        answer: 'Our journal is open access with no publication fees for authors. All articles are freely available to readers worldwide.'
      },
      {
        question: 'What copyright license do you use?',
        answer: 'We use Creative Commons Attribution (CC BY) license, allowing others to distribute and build upon your work.'
      },
      {
        question: 'How do I get a DOI for my article?',
        answer: 'DOIs are automatically assigned to all published articles. You will receive your DOI notification upon publication.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Support',
    icon: Settings,
    description: 'Help with technical issues and platform features',
    items: [
      {
        question: 'I cannot upload my file',
        answer: 'Ensure your file is under 10MB and in an accepted format. Try clearing your browser cache or using a different browser.'
      },
      {
        question: 'How do I update my profile information?',
        answer: 'Go to your Profile page and click "Edit Profile". Update your information and click "Save Changes".'
      },
      {
        question: 'I forgot my password',
        answer: 'Click "Forgot Password" on the sign-in page and enter your email. You will receive reset instructions.'
      }
    ]
  }
];

interface HelpSystemProps {
  trigger?: React.ReactNode;
}

export const HelpSystem = ({ trigger }: HelpSystemProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const filteredItems = helpCategories.flatMap(category =>
    category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(item => ({ ...item, category: category.title }))
  );

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <HelpCircle className="h-4 w-4 mr-2" />
      Help
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Documentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <p>Need help with uploading on ORCID? check our  <Link className='text-blue-500' to={'/orcidGuide'}>Guide</Link> </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchQuery ? (
            /* Search Results */
            <div className="space-y-4">
              <h3 className="font-semibold">Search Results ({filteredItems.length})</h3>
              {filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No help articles found matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-left">{item.question}</span>
                          <Badge variant="outline" className="ml-2">
                            {item.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <p className="text-muted-foreground">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          ) : (
            /* Category Tabs */
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {helpCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{category.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {helpCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <category.icon className="h-5 w-5" />
                        {category.title}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>

                  <Accordion type="single" collapsible className="space-y-2">
                    {category.items.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Contact Support */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-semibold mb-1">Still need help?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <Button size="sm">Contact Support</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
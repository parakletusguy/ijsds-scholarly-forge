import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MessageSquare, MessageCircle } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch with the editorial team at the International Journal of Social Work and Development Studies.
          </p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <Card className="text-center hover:shadow-lg transition-shadow border-primary/10">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  For article submissions, editorial questions, and general inquiries.
                </p>
                <a 
                  href="mailto:editor.ijsds@gmail.com" 
                  className="text-lg font-medium text-primary hover:underline hover:text-blue-600 transition-colors"
                >
                  editor.ijsds@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-primary/10">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Call our editorial office for urgent matters during business hours.
                </p>
                <a 
                  href="tel:+2348080224405" 
                  className="text-lg font-medium text-primary hover:underline hover:text-blue-600 transition-colors"
                >
                  +234 808 022 4405
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-primary/10">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Experiencing technical issues with your dashboard or manuscript?
                </p>
                <a 
                  href="mailto:editor.ijsds@gmail.com?subject=Technical Support Request" 
                  className="text-lg font-medium text-primary hover:underline hover:text-blue-600 transition-colors"
                >
                  Request Technical Support
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-green-500/20">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Chat with our editorial team directly on WhatsApp for quick responses.
                </p>
                <a 
                  href="https://wa.me/2348080224405" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-green-600 hover:underline hover:text-green-700 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Embedded Support Info */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
            <Card className="bg-muted/30 border-none shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Response Times</h3>
                <p className="text-muted-foreground">
                  Our editorial staff typically responds to all inquiries within 24–48 business hours. 
                  If you are inquiring about the status of a manuscript under review, please ensure you check your author dashboard first.
                </p>
              </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
};

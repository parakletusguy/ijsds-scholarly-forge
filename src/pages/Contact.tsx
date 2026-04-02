import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MessageSquare, MessageCircle, Clock, Send, MapPin, Globe, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { Card, CardContent } from '@/components/ui/card';

export const Contact = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Contact Us — International Journal of Social Work and Development Studies</title>
        <meta name="description" content="Get in touch with the editorial team at the International Journal of Social Work and Development Studies." />
      </Helmet>

      <PageHeader 
        title="Contact Us" 
        accent="Global Inquiry Registry"
        description="Get in touch with the editorial team at the International Journal of Social Work and Development Studies."
      />

      {/* Communication Nodes — High Fidelity Connectivity Grid */}
      <ContentSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Email */}
          <div className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
             
             <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary mb-10 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all shadow-inner rounded-full">
                <Mail size={28} />
             </div>
             
             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">Email</h3>
             <p className="font-body text-foreground/60 text-sm mb-8 leading-relaxed max-w-[200px]">For article submissions, editorial questions, and general inquiries.</p>
             
             <a href="mailto:editor.ijsds@gmail.com" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.1em] text-secondary hover:text-primary transition-colors">
                editor.ijsds@gmail.com
             </a>
          </div>

          {/* Institutional Contact */}
          <div className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center">
             <div className="absolute top-0 left-0 w-24 h-24 bg-secondary/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
             
             <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center text-secondary mb-10 border border-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all shadow-inner rounded-full">
                <Phone size={28} />
             </div>

             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 group-hover:text-secondary transition-colors">Phone</h3>
             <p className="font-body text-foreground/60 text-sm mb-8 leading-relaxed max-w-[200px]">Call our editorial office for urgent matters during business hours.</p>
             
             <a href="tel:+2348080224405" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.1em] text-primary hover:text-secondary transition-colors">
                +234 808 022 4405
             </a>
          </div>

          {/* Technical Support */}
          <div className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center">
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'circle(50% at 100% 100%)' }}></div>
             
             <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary mb-10 border border-primary/10 group-hover:bg-foreground group-hover:text-white transition-all shadow-inner rounded-full">
                <MessageSquare size={28} />
             </div>

             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">Support</h3>
             <p className="font-body text-foreground/60 text-sm mb-8 leading-relaxed max-w-[max-content]">Experiencing technical issues with your dashboard or manuscript?</p>
             
             <a href="mailto:editor.ijsds@gmail.com?subject=Technical Support Request" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.1em] text-secondary hover:text-primary transition-colors">
                Request Technical Support
             </a>
          </div>

          {/* WhatsApp Direct */}
          <div className="group relative bg-white p-12 border border-border/10 shadow-xl hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center text-foreground">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
             
             <div className="w-16 h-16 bg-green-500/10 flex items-center justify-center text-green-600 mb-10 shadow-xl group-hover:rotate-12 transition-all rounded-full border border-green-500/20">
                <MessageCircle size={28} />
             </div>

             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 text-foreground">WhatsApp</h3>
             <p className="font-body text-foreground/60 text-sm mb-8 leading-relaxed max-w-[200px]">Chat with our editorial team directly on WhatsApp for quick responses.</p>
             
             <a href="https://wa.me/2348080224405" target="_blank" rel="noopener noreferrer" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.1em] text-green-600 hover:text-green-700 transition-all">
                Chat on WhatsApp
             </a>
          </div>
        </div>
      </ContentSection>

      {/* Response Times Section */}
      <ContentSection>
        <div className="mx-auto max-w-3xl text-center">
            <Card className="bg-muted/30 border-none shadow-sm rounded-none">
              <CardContent className="p-12 md:p-16">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tighter mb-6 text-foreground">Response Times</h3>
                <p className="text-muted-foreground font-body text-lg leading-relaxed">
                  Our editorial staff typically responds to all inquiries within 24–48 business hours. 
                  If you are inquiring about the status of a manuscript under review, please ensure you check your author dashboard first.
                </p>
              </CardContent>
            </Card>
        </div>
      </ContentSection>
    </div>
  );
};

export default Contact;

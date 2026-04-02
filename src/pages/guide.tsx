import one from "../images/orcidGuide/Screenshot from 2025-09-01 11-11-12.png"
import two from "../images/orcidGuide/Untitled design.png"
import three from "../images/orcidGuide/Untitled design (1).png"
import four from "../images/orcidGuide/Untitled design (2).png"
import five from "../images/orcidGuide/Untitled design (3).png"
import six from "../images/orcidGuide/Screenshot from 2025-09-01 13-34-34.png"
import seven from "../images/orcidGuide/Untitled design (4).png"
import eight from "../images/orcidGuide/Untitled design (5).png"
import nine from "../images/orcidGuide/Untitled design (6).png"
import ten from "../images/orcidGuide/Untitled design (7).png"
import eleven from "../images/orcidGuide/Screenshot from 2025-09-01 20-10-55.png"
import { useNavigate } from "react-router-dom"
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck, Zap, Layers, Globe, CheckCircle2 } from "lucide-react"
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface GuideStep {
    image: string;
    instruction: string;
}

export const Guide = () => {
    const navigate = useNavigate()
    const guideObject : GuideStep[] = [
        {image:one, instruction:'Sign in to your official ORCID investigator account.'},
        {image:two, instruction:'After authentication, navigate to the "Works" registry at the bottom of your dossier and select the "Add" protocol.'},
        {image:three, instruction:'From the operational dropdown, initiate the "Add Manually" sequence.'},
        {image:four, instruction:'Specify the manuscript domain by clicking on "Work Type".'},
        {image:five, instruction:'Select "Journal Article" as the primary categorization for the scholarly asset.'},
        {image:six, instruction:`Populate the registry with required technical metadata. Ensure the publication date corresponds exactly with the official IJSDS release.`},
        {image:seven, instruction:'To retrieve the unique URI for your article, navigate to the IJSDS global archive and access your specific publication record.'},
        {image:eight, instruction:'Extract the canonical URL from your browser address bar.'},
        {image:nine, instruction:'Insert the extracted URI into the "Link" field within the ORCID registry.'},
        {image:ten, instruction:'Finalize the synchronization by saving your changes to the institutional ledger.'},
        {image:eleven, instruction:'Verify that the scholarly asset is now successfully integrated into your global ORCID repository.'},
    ]

    return (
        <div className="pb-32 bg-secondary/5 min-h-screen font-body relative overflow-hidden">
            <Helmet>
                <title>Technical Protocols — ORCID Registry Integration | IJSDS</title>
                <meta name="description" content="Official institutional guide for synchronizing IJSDS publications with the global ORCID investigator registry." />
            </Helmet>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full -mr-24 -mt-24 blur-[100px] opacity-30"></div>

            <PageHeader 
                title="Technical" 
                subtitle="Protocols" 
                accent="Registry Sync"
                description="Institutional guide for external repository synchronization. Follow these procedural steps to integrate your IJSDS publications with the global ORCID investigator registry."
            />

            <ContentSection>
                {/* Protocol Control Bar */}
                <div className="flex justify-between items-center mb-16 relative">
                   <div className="absolute top-1/2 left-0 w-full h-px bg-border/20 -z-0"></div>
                   
                   <button 
                     onClick={() => navigate(-1)} 
                     className="relative z-10 flex items-center gap-6 font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/40 hover:text-primary transition-colors bg-secondary/5 px-8 py-6 border border-border/10"
                   >
                      <ArrowLeft size={16} /> Return to Previous Node
                   </button>
                   
                   <div className="relative z-10 flex items-center gap-6 p-6 bg-white border border-border/10 shadow-xl">
                      <ShieldCheck size={16} className="text-secondary opacity-50" />
                      <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 italic">Protocol v.04-ORCID</span>
                   </div>
                </div>

                {/* Guide Steps Ledger */}
                <div className="space-y-24 max-w-5xl mx-auto">
                   {guideObject.map((guide, index) => (
                     <div key={index} className="relative group/step">
                        {/* Connecting Line */}
                        {index < guideObject.length - 1 && (
                          <div className="absolute left-8 top-16 w-1 h-full bg-border/10 -z-0 hidden md:block"></div>
                        )}
                        
                        <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                           {/* Step Indicator */}
                           <div className="w-16 h-16 shrink-0 bg-foreground text-white flex items-center justify-center font-headline font-black text-xl shadow-2xl group-hover/step:bg-primary transition-colors">
                              {index + 1 < 10 ? `0${index + 1}` : index + 1}
                           </div>
                           
                           {/* Content Card */}
                           <div className="flex-1 bg-white border border-border/10 shadow-sm overflow-hidden group-hover/step:shadow-2xl transition-all">
                              <div className="p-8 border-b border-border/5 bg-secondary/5">
                                 <div className="flex items-center gap-4 mb-2">
                                    <Zap size={14} className="text-secondary opacity-40" />
                                    <span className="font-headline font-black text-[9px] uppercase tracking-[0.5em] text-foreground/20 italic">Instructional Node</span>
                                 </div>
                                 <p className="text-xl md:text-2xl font-body italic text-foreground/70 leading-relaxed border-l-4 border-primary/30 pl-6">
                                    {guide.instruction}
                                 </p>
                              </div>
                              
                              <div className="p-4 md:p-8 bg-white relative">
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
                                 <div className="border border-border/10 shadow-inner relative z-10">
                                    <img 
                                      src={guide.image} 
                                      alt={`Registry step indicator ${index + 1}`} 
                                      className="w-full h-auto grayscale-[0.5] group-hover/step:grayscale-0 transition-all duration-700" 
                                    />
                                    {/* Overlay Motif */}
                                    <div className="absolute bottom-4 right-4 text-primary opacity-0 group-hover/step:opacity-100 transition-opacity">
                                       <CheckCircle2 size={32} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Final Protocol Confirmation */}
                <div className="mt-32 p-16 md:p-24 bg-foreground text-white text-center relative overflow-hidden group shadow-2xl border-b-[16px] border-secondary">
                   <div className="absolute inset-0 bg-white opacity-5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
                   <div className="relative z-10 max-w-2xl mx-auto">
                      <Globe size={48} className="mx-auto mb-10 text-secondary opacity-40 animate-spin-slow" />
                      <h3 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter mb-8 leading-none">Global Sync <br/><span className="text-secondary italic">Complete</span></h3>
                      <p className="font-body text-xl italic text-white/40 leading-relaxed mb-12">
                        By integrating with ORCID, your intellectual contributions are accurately attributed and globally discoverable across institutional registries.
                      </p>
                      <button 
                        onClick={() => navigate('/')} 
                        className="bg-white text-foreground px-12 py-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-xl"
                      >
                         Return to Master Archive
                      </button>
                   </div>
                </div>
            </ContentSection>
            
            <div className="container mx-auto px-4 mt-16 text-center opacity-10 font-headline font-black text-[9px] uppercase tracking-[0.8em]">
               Institutional Technical Protocol — Permanent Record
            </div>
        </div>
    )
}
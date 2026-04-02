import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { Target, Search, Globe, ArrowLeft, Zap, ShieldAlert, Archive, Home } from "lucide-react";

export const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "Registry Anomaly Identified: Non-existent route access attempt:",
      location.pathname
    );
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5 font-body relative overflow-hidden">
      <Helmet>
        <title>Registry Anomaly 404 — IJSDS Archive</title>
        <meta name="description" content="The requested scholarly record or technical protocol could not be located within the IJSDS global registry." />
      </Helmet>

      {/* Atmospheric Background Accents */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary/5 rounded-full -mr-40 -mt-40 blur-[130px] opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary/5 rounded-full -ml-32 -mb-32 blur-[100px] opacity-30"></div>
      
      {/* Visual Motifs */}
      <div className="absolute top-[20%] left-[10%] w-32 h-32 text-foreground/5 animate-pulse">
         <Globe size={128} />
      </div>
      <div className="absolute bottom-[20%] right-[10%] w-32 h-32 text-primary/5">
         <Target size={128} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
           {/* Phase-A: Dramatic Anomaly Header */}
           <div className="bg-foreground text-white p-12 md:p-24 relative overflow-hidden group shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] border-t-[16px] border-secondary">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 -z-0" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
              
              <div className="relative z-10 text-center md:text-left">
                 <div className="flex items-center gap-6 mb-12 justify-center md:justify-start">
                    <ShieldAlert size={24} className="text-secondary animate-pulse" />
                    <span className="font-headline font-black text-xs uppercase tracking-[0.5em] text-white/30 italic">Technical Exception Logged</span>
                 </div>
                 
                 <h1 className="text-8xl md:text-[12rem] font-headline font-black uppercase tracking-tighter leading-none mb-10 text-white opacity-90 group-hover:text-primary transition-colors">
                    404
                 </h1>
                 
                 <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter mb-8 leading-none">
                    Registry <br/><span className="text-secondary italic">Anomaly Identified</span>
                 </h2>

                 <p className="text-xl md:text-2xl font-body italic text-white/40 leading-relaxed mb-16 border-l-4 border-primary/40 pl-8 max-w-2xl mx-auto md:mx-0">
                    The requested scholarly record or technical protocol [ {location.pathname} ] could not be located within the IJSDS global registry. This may indicate a legacy reference or a synchronization latency.
                 </p>

                 <div className="flex flex-col sm:flex-row items-center gap-8 justify-center md:justify-start">
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full sm:w-auto bg-white text-foreground px-12 py-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] hover:bg-secondary hover:text-white transition-all shadow-xl flex items-center justify-center gap-4 group"
                    >
                       <Home size={16} /> Return to Vanguard
                    </button>
                    <button 
                      onClick={() => navigate('/articles')}
                      className="w-full sm:w-auto bg-primary/10 border border-white/10 text-white px-12 py-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-foreground transition-all shadow-xl flex items-center justify-center gap-4"
                    >
                       <Archive size={16} /> Access Global Archive
                    </button>
                 </div>
              </div>
           </div>

           {/* Global Registry Statistics — Fake but cool */}
           <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-8 border border-border/10 shadow-sm text-center">
                 <p className="font-headline font-black text-[9px] uppercase tracking-[0.5em] text-foreground/20 italic mb-2">Protocol</p>
                 <p className="font-headline font-black text-lg uppercase tracking-widest text-foreground">HTTPS/TLS 1.3</p>
              </div>
              <div className="bg-white p-8 border border-border/10 shadow-sm text-center">
                 <p className="font-headline font-black text-[9px] uppercase tracking-[0.5em] text-foreground/20 italic mb-2">Registry Node</p>
                 <p className="font-headline font-black text-lg uppercase tracking-widest text-foreground">Cloud Node-AF-01</p>
              </div>
              <div className="bg-white p-8 border border-border/10 shadow-sm text-center">
                 <p className="font-headline font-black text-[9px] uppercase tracking-[0.5em] text-foreground/20 italic mb-2">Status</p>
                 <p className="font-headline font-black text-lg uppercase tracking-widest text-secondary">Synchronized</p>
              </div>
           </div>
           
           <p className="mt-16 font-headline font-black text-[9px] uppercase tracking-[1em] text-foreground/10 text-center italic">Institutional Knowledge Repository — V.04 Error Handling</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, ShieldCheck, Layers, Award, Clock } from "lucide-react";

export const Footer = () => {
  const today = new Date();
  
  return (
    <footer className="bg-[#f7f3ef] border-t-2 border-[#8f3514]/10 mt-32">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 w-full max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <div className="font-headline text-3xl italic text-[#795900] mb-6">IJSDS</div>
          <p className="font-body text-sm leading-relaxed text-[#1c1c19]/70 max-w-xs">
            Advancing the global discourse on social development through the lens of sovereign African scholarship and international collaboration.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-primary">Guidelines</h4>
          <ul className="space-y-4 font-body text-sm">
            <li><Link className="text-[#1c1c19]/70 hover:text-[#af4c2a] transition-colors" to="/ethical-guidelines">Ethical Guidelines</Link></li>
            <li><Link className="text-[#1c1c19]/70 hover:text-[#af4c2a] transition-colors" to="/peer-review">Peer Review Process</Link></li>
            <li><Link className="text-[#1c1c19]/70 hover:text-[#af4c2a] transition-colors" to="/openAccess">Open Access Policy</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-primary">Journal</h4>
          <ul className="space-y-4 font-body text-sm">
            <li><Link className="text-[#1c1c19]/70 hover:text-[#af4c2a] transition-colors" to="/about#editorial">Editorial Board</Link></li>
            <li><Link className="text-[#1c1c19]/70 hover:text-[#af4c2a] transition-colors" to="/archive">Archive</Link></li>
            <li><Link className="text-[#1c1c19]/70 hover:text-[#af4c2a] transition-colors" to="/blog">Newsletter</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-primary">Newsletter</h4>
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#1c1c19]/70">Subscribe for quarterly research digests.</p>
            <div className="flex">
              <input 
                className="bg-surface-container-high border-none px-4 py-2 w-full text-sm focus:ring-1 focus:ring-primary outline-none" 
                placeholder="email@university.edu" 
                type="email"
              />
              <button className="bg-primary text-on-primary px-4 py-2 hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-12 py-8 border-t border-[#8f3514]/5 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-[#1c1c19]/50">
            © {today.getFullYear()} International Journal of Social Work and Development Studies (IJSDS). All rights reserved.
          </p>
          <div className="flex items-center gap-6 opacity-30">
            <ShieldCheck size={20} />
            <Globe size={20} />
            <Layers size={20} />
          </div>
        </div>
      </div>
    </footer>
  );
};

import { ArrowRight } from 'lucide-react';
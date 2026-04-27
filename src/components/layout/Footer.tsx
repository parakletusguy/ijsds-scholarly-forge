import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Layers } from "lucide-react";

const linkClass = "text-[#1c1c19]/60 hover:text-[#af4c2a] transition-colors";
const headingClass = "font-bold text-xs uppercase tracking-widest mb-5 text-primary";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f7f3ef] border-t-2 border-[#8f3514]/10 mt-32">
      <div className="max-w-7xl mx-auto px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1 space-y-5">
            <img
              src="/Logo_Black_Edited-removebg-preview.png"
              alt="IJSDS Logo"
              className="h-20 w-auto object-contain max-w-[240px]"
            />
            <p className="font-body text-sm leading-relaxed text-[#1c1c19]/60 max-w-xs">
              International Journal of Social Work and Development Studies — open-access, peer-reviewed.
            </p>
            <div className="space-y-1 text-xs text-[#1c1c19]/50 font-body">
              <p>ISSN: 3115-6940</p>
              <p>eISSN: 3115-6932</p>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className={headingClass}>Explore</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link className={linkClass} to="/">Home</Link></li>
              <li><Link className={linkClass} to="/about">About</Link></li>
              <li><Link className={linkClass} to="/articles">Articles</Link></li>
              <li><Link className={linkClass} to="/blog">Blog</Link></li>
              <li><Link className={linkClass} to="/partners">Partners</Link></li>
              <li><Link className={linkClass} to="/indexing">Indexing</Link></li>
              <li><Link className={linkClass} to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className={headingClass}>Policies</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link className={linkClass} to="/openAccess">Open Access</Link></li>
              <li><Link className={linkClass} to="/ethical-guidelines">Ethical Guidelines</Link></li>
              <li><Link className={linkClass} to="/peer-review">Peer Review</Link></li>
              <li><Link className={linkClass} to="/plagiarism-policy">Plagiarism Policy</Link></li>
              <li><Link className={linkClass} to="/preservation-policy">Preservation Policy</Link></li>
              <li><Link className={linkClass} to="/copyright">Copyright</Link></li>
            </ul>
          </div>

          {/* For Authors */}
          <div>
            <h4 className={headingClass}>For Authors</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link className={linkClass} to="/submit">Submit Manuscript</Link></li>
              <li><Link className={linkClass} to="/submission-guidelines">Submission Guidelines</Link></li>
              <li><Link className={linkClass} to="/orcidGuide">ORCID Guide</Link></li>
              <li><Link className={linkClass} to="/auth">Sign In / Register</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#8f3514]/5 px-12 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-[#1c1c19]/40">
            © {year} International Journal of Social Work and Development Studies (IJSDS). All rights reserved.
          </p>
          <div className="flex items-center gap-6 opacity-30">
            <ShieldCheck size={18} />
            <Globe size={18} />
            <Layers size={18} />
          </div>
        </div>
      </div>
    </footer>
  );
};

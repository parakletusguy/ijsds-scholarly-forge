import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";

interface ProfileCardProps {
  profile: {
    id: number;
    full_name: string;
    email: string;
  };
  onApprove: (id: number, type: string) => void;
  onReject: (id: number, type: string) => void;
}

export function ProfileCard({ profile, onApprove, onReject }: ProfileCardProps) {
  return (
    <div className="bg-white p-8 border border-border/40 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all mb-6">
       <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-muted text-foreground/30 group-hover:bg-primary group-hover:text-white transition-colors">
                <User size={24} />
             </div>
             <div>
                <h3 className="text-xl font-headline font-black uppercase tracking-tight group-hover:text-primary transition-colors">{profile.full_name}</h3>
                <div className="flex items-center gap-2 text-foreground/40 font-body text-xs italic mt-1">
                   <Mail size={12} /> {profile.email}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
             <Button 
               onClick={() => onApprove(profile.id, "approve")} 
               className="flex-1 md:flex-none bg-primary hover:bg-secondary text-white rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-8 py-6 h-auto shadow-lg transition-all flex items-center gap-2"
             >
               Authorize <CheckCircle2 size={14} />
             </Button>
             <Button 
               variant="outline" 
               onClick={() => onReject(profile.id, "reject")} 
               className="flex-1 md:flex-none rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-8 py-6 h-auto border-border/40 hover:border-primary hover:text-primary transition-all flex items-center gap-2"
             >
               Deny <ShieldAlert size={14} />
             </Button>
          </div>
       </div>
       
       <div className="mt-8 pt-6 border-t border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <ShieldCheck size={14} className="text-secondary" />
             <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/30 italic">Credential Verification Required</span>
          </div>
          <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/20">Ref: {profile.id}</span>
       </div>
    </div>
  );
}
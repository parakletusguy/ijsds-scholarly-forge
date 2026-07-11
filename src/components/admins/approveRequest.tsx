import { Button } from "@/components/ui/button";
import { User, Mail, Check, X } from "lucide-react";

interface ProfileCardProps {
  profile: {
    id: string;
    full_name: string;
    email: string;
  };
  onApprove: (id: string, type: string) => void;
  onReject: (id: string, type: string) => void;
}

export function ProfileCard({ profile, onApprove, onReject }: ProfileCardProps) {
  return (
    <div className="bg-white border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
          <User size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-stone-800 truncate">{profile.full_name}</h3>
          <p className="text-sm text-stone-400 flex items-center gap-1.5 truncate">
            <Mail size={13} className="shrink-0" /> {profile.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={() => onApprove(profile.id, "approve")}
          className="bg-primary hover:bg-[#7a2d11] text-white rounded-none h-10 px-5 text-[10px] font-bold uppercase tracking-widest gap-1.5"
        >
          <Check size={14} /> Approve
        </Button>
        <Button
          variant="outline"
          onClick={() => onReject(profile.id, "reject")}
          className="rounded-none h-10 px-5 text-[10px] font-bold uppercase tracking-widest border-stone-200 hover:border-primary hover:text-primary gap-1.5"
        >
          <X size={14} /> Decline
        </Button>
      </div>
    </div>
  );
}

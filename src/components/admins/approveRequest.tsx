import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  profile: {
    id: number;
    full_name: string;
    email: string;
  };
  onApprove: (id: number,type:string) => void;
  onReject: (id: number,type:string) => void;
}

export function ProfileCard({ profile, onApprove, onReject }: ProfileCardProps) {
  return (
    <Card className="w-full mx-auto shadow-lg rounded-2xl border border-gray-200">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-semibold">{profile.full_name}</CardTitle>
    <CardDescription className="text-sm text-gray-500">{profile.email}</CardDescription>
  </CardHeader>

  <CardFooter className="flex items-center justify-end gap-3 pt-4">
    <Button 
      onClick={() => onApprove(profile.id, "approve")} 
      className="rounded-xl px-4 py-2"
    >
      Approve
    </Button>
    <Button 
      variant="destructive" 
      onClick={() => onReject(profile.id, "reject")} 
      className="rounded-xl px-4 py-2"
    >
      Reject
    </Button>
  </CardFooter>
</Card>

  );
}
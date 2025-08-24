import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  profile: {
    id: number;
    name: string;
    email: string;
  };
  onApprove: (id: number,type:string) => void;
  onReject: (id: number,type:string) => void;
}

export function ProfileCard({ profile, onApprove, onReject }: ProfileCardProps) {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{profile.name}</CardTitle>
        <CardDescription>{profile.email}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button onClick={() => onApprove(profile.id,'approve')}>Approve</Button>
        <Button variant="destructive" onClick={() => onReject(profile.id,'reject')}>Reject</Button>
      </CardFooter>
    </Card>
  );
}
import { ComprehensiveReports } from '@/components/reporting/ComprehensiveReports';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Reports = () => {
  const navigate = useNavigate()
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative py-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4 absolute top-1 left-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      <ComprehensiveReports />
    </div>
  );
};
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ComprehensiveReports } from '@/components/reporting/ComprehensiveReports';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Reports = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
      <main className="flex-1 container mx-auto px-4 py-8">
        <ComprehensiveReports />
      </main>
      <Footer />
    </div>
  );
};
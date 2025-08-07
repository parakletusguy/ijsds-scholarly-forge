import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ComprehensiveReports } from '@/components/reporting/ComprehensiveReports';

export const Reports = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ComprehensiveReports />
      </main>
      <Footer />
    </div>
  );
};
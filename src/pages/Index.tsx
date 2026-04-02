import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Home } from './Home';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body selection:bg-primary/20 selection:text-primary">
      {/* Sticky Header */}
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full bg-background relative overflow-hidden">
        {/* Subtle background texture globally applied to main */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
          style={{ 
            backgroundImage: 'url("/src/images/textures/pattern_motif.png")',
            backgroundSize: '400px',
            backgroundRepeat: 'repeat'
          }}
        />
        
        <div className="relative z-10 w-full animate-fade-in-up">
           <Home />
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default Index;

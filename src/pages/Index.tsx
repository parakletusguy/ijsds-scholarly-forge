import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Home } from './Home';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Home />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

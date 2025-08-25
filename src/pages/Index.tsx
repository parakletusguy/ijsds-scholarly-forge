import { Footer } from '@/components/layout/Footer';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Home } from './Home';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border bg-background p-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1">
            <Home />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

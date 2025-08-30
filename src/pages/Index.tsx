import { Footer } from '@/components/layout/Footer';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Home } from './Home';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import logo_2 from "/riversstate-removebg-preview.png"


const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
        <header className="md:h-24 h-20 flex items-center border-b border-border bg-[#ffffff9c] p-4">
          <SidebarTrigger className="fixed z-30" />
          <div className="md:w-20 w-14 fixed right-6">
            <img src={logo_2} alt="Rivers State University Logo" />
          </div>
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

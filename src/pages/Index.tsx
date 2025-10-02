import { Footer } from '@/components/layout/Footer';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Home } from './Home';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import logo_2 from "/riversstate-removebg-preview.png"
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="fixed w-[100%] md:h-24 h-20 flex items-center border-b border-border bg-[#ffffff9c] p-4">
            <SidebarTrigger className="fixed z-30" />
            <Link to={"/openAccess"}><Button className="ml-10">Open Access Notice</Button></Link>
            <div className="md:w-20 w-14 fixed right-6">
              <img src={logo_2} alt="Rivers State University Logo" />
            </div>
          </header>
          <main className="flex-1 mt-24">
            <Home />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

import { BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-[white] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">IJSDS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              International Journal of Social Work and Development Studies
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Authors</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/submission-guidelines" className="hover:text-foreground transition-colors">Submission Guidelines</a></li>
              <li><a href="/peer-review" className="hover:text-foreground transition-colors">Peer Review Process</a></li>
              <li><a href="/copyright" className="hover:text-foreground transition-colors">Copyright Notice</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Journal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="/editorial-board" className="hover:text-foreground transition-colors">Editorial Board</a></li>
              {/* <li><a href="/archives" className="hover:text-foreground transition-colors">Archives</a></li> */}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: editor.ijsds@gmail.com</li>
              <li>Phone: +234 808 022 4405</li>
              {/* <li>ISSN: 3027-3075</li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 International Journal of Social Work and Development Studies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
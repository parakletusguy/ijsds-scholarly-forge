import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "../../../public/Logo Symbol.png"

export const Footer = () => {
  const today = new Date();
  const getOrdinalNum = (n: number) => {
    return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
  };
  const formattedDate = `${getOrdinalNum(today.getDate())} of ${today.toLocaleDateString('en-US', { month: 'long' })}, ${today.getFullYear()}`;

  return (
    <footer className="border-t border-border bg-[white] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {/* <BookOpen className="h-6 w-6 text-primary" /> */}
            <img src={logo} alt="IJSDS logo" className="w-16 m-[-15px] text-primary " />
              <span className="text-lg font-semibold">IJSDS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              International Journal of Social Work and Development Studies
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Authors</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/submission-guidelines" className="hover:text-foreground transition-colors">Submission Guidelines</Link></li>
              <li><Link to="/peer-review" className="hover:text-foreground transition-colors">Peer Review Process</Link></li>
              <li><Link to="/plagiarism-policy" className="hover:text-foreground transition-colors">Plagiarism Policy</Link></li>
              <li><Link to="/preservation-policy" className="hover:text-foreground transition-colors">Preservation & Archiving</Link></li>
              <li><Link to="/copyright" className="hover:text-foreground transition-colors">Copyright Notice</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Journal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/editorial-board" className="hover:text-foreground transition-colors">Editorial Board</Link></li>
              {/* <li><Link to="/archives" className="hover:text-foreground transition-colors">Archives</Link></li> */}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              <Link to="/contact" className="hover:text-primary transition-colors cursor-pointer">
                Contact
              </Link>
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: editor.ijsds@gmail.com</li>
              <li>Phone: +234 808 022 4405</li><div className='mb-2'>
            <li>ISSN: <span className='font-semibold'>3115-6940</span></li>
            <li>eISSN: <span className='font-semibold'>3115-6932</span></li>
            <li>Date: <span className='font-semibold'>{formattedDate}</span></li>
          </div>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {today.getFullYear()} International Journal of Social Work and Development Studies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
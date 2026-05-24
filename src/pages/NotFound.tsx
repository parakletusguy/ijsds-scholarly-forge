import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Home, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-stone-50 font-body flex flex-col items-center justify-center px-8">
      <Helmet>
        <title>Page Not Found — IJSDS</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="max-w-xl w-full text-center space-y-8">
        {/* Number */}
        <div className="text-[10rem] font-headline font-light leading-none text-stone-200 select-none">
          404
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-headline font-light tracking-tight text-stone-900">
            Page <span className="italic text-primary">not found</span>
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
            The page at <code className="font-mono text-xs bg-white border border-stone-200 px-1.5 py-0.5 text-stone-600">{location.pathname}</code> doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 border border-stone-200 bg-white text-stone-700 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors active:scale-[0.98]"
          >
            <ArrowLeft size={12} />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors active:scale-[0.98]"
          >
            <Home size={12} />
            Home
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center justify-center gap-2 border border-stone-200 bg-white text-stone-700 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors active:scale-[0.98]"
          >
            <BookOpen size={12} />
            Browse Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-background/70 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <div className="h-6 w-6 text-primary-foreground flex items-center justify-center font-bold">
                CT
              </div>
            </div>
            <span className="hidden md:inline-block font-bold text-xl">
              CleanTrack
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isHomePage ? 'text-primary' : 'text-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/admin" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname.startsWith('/admin') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Admin Portal
          </Link>
          <Button asChild variant="default" className="ml-4">
            <Link to="/demo">Try Demo</Link>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="container md:hidden py-4 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md ${
                isHomePage ? 'bg-muted text-primary' : 'text-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md ${
                location.pathname.startsWith('/admin') ? 'bg-muted text-primary' : 'text-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Portal
            </Link>
            <div className="px-4 pt-2">
              <Button asChild variant="default" className="w-full">
                <Link to="/demo" onClick={() => setMobileMenuOpen(false)}>
                  Try Demo
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isMember, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
                S
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Skyline <span className="text-primary">SSA</span></span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Home</Link>
              <Link to="/events" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Events</Link>
              <Link to="/merch" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Merch</Link>
              <Link to="/projects" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Projects</Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors flex items-center gap-2">
                  <LogIn size={16} /> Login
                </Link>
                <Link to="/register" className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  Join Now
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">Hello, {user.name}</span>
                <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500 transition-colors">Logout</button>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors">
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={toggleMenu} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">Home</Link>
            <Link to="/events" onClick={toggleMenu} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">Events</Link>
            <Link to="/merch" onClick={toggleMenu} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">Merch</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, BookOpen, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold hidden sm:inline">Cognitive Canvas</span>
              <span className="text-xl font-bold sm:hidden">CC</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/root-cause"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Root Cause Analysis
              </Link>
              <Link
                to="/journal"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Journal
              </Link>
              <Link
                to="/insights"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Insights
              </Link>
              <Link
                to="/canvas"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Canvas
              </Link>
              <div className="border-l pl-6 ml-2 flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden xl:inline">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/root-cause"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Root Cause Analysis
                </Link>
                <Link
                  to="/journal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Journal
                </Link>
                <Link
                  to="/insights"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Insights
                </Link>
                <Link
                  to="/canvas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Canvas
                </Link>
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">{children}</main>
    </div>
  );
}

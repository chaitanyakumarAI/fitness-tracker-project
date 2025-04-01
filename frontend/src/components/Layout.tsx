import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Activity, History, PlusCircle, Moon, Sun } from 'lucide-react';

const Layout: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <nav className="bg-indigo-600 dark:bg-indigo-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8" />
              <span>FitTrack</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 hover:text-indigo-200 ${
                  location.pathname === '/' ? 'text-indigo-200' : ''
                }`}
              >
                <Activity className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-2 hover:text-indigo-200 ${
                  location.pathname === '/history' ? 'text-indigo-200' : ''
                }`}
              >
                <History className="h-5 w-5" />
                History
              </Link>
              <Link
                to="/add"
                className={`flex items-center gap-2 hover:text-indigo-200 ${
                  location.pathname === '/add' ? 'text-indigo-200' : ''
                }`}
              >
                <PlusCircle className="h-5 w-5" />
                Add Data
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
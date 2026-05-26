import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);

  // Afficher la barre de recherche uniquement pour admin et professeurs
  const showSearch = user && (user.role === 'admin' || user.role === 'teacher');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="header flex items-center justify-between px-8 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            {/* Page title area - pages render their own titles */}
          </div>
          {showSearch && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  className="input pl-10 w-72" 
                  placeholder="Rechercher un étudiant..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-muted)]" />
              </div>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

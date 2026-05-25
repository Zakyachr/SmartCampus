import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Search, Upload, Plus } from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="header flex items-center justify-between px-8 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            {/* Page title area - pages render their own titles */}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input className="input pl-10 w-72" placeholder="Rechercher un étudiant..." />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-muted)]" />
            </div>
            <button className="btn-outline flex items-center gap-2"><Upload className="w-4 h-4"/>Importer</button>
            <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/>+ Ajouter</button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

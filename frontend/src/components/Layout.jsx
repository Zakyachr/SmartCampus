import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="header flex items-center justify-between px-8 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            {/* Page title area - pages render their own titles */}
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

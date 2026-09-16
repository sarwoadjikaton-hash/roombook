import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex text-text-primary">
      {/* Sidebar Khusus Panel Admin (Fixed Desktop & Drawer Mobile) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Admin Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-200">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

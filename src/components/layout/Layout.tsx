import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex text-text-primary">
      {/* Sidebar (Fixed di kiri pada desktop, Drawer di mobile) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area (Mengisi sisa lebar layar secara penuh) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-200">
        {/* Top Header */}
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Dynamic Page Content: Full-width responsif mengikuti lebar device */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

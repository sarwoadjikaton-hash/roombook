import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-primary">
      {/* Floating Rounded Navbar */}
      <PublicNavbar />

      {/* Main Content: Full-width responsif mengikuti lebar device */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10 md:pt-12 pb-24 md:pb-20">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};


import React from 'react';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout = ({ children, className }: MainLayoutProps) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <div className={`min-h-screen flex flex-col bg-background ${className}`}>
      <main className="flex-1 w-full mx-auto max-w-7xl p-4 md:p-6">
        <div className="w-full h-full animate-fade-in">
          {children}
        </div>
      </main>
      
      {!isAdminPage && (
        <footer className="text-center py-4 text-sm text-muted-foreground">
          <p>© 2025 CleanTrack QR System</p>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;

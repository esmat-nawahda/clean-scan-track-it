
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminMainContent from './AdminMainContent';

interface AuthState {
  isLoggedIn: boolean;
  username: string;
  role: string;
  clientName: string;
  clientId?: number;
  clientType?: string;
}

const AdminLayout = () => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for authentication
    const storedAuth = localStorage.getItem('cleantrack-auth');
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      if (parsedAuth.isLoggedIn) {
        setAuth(parsedAuth);
        return;
      }
    }
    
    // If no valid auth, redirect to login
    navigate('/admin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cleantrack-auth');
    navigate('/admin');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar 
        onLogout={handleLogout} 
        clientName={auth?.clientName || 'Loading...'} 
        clientType={auth?.clientType || ''}
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      
      <AdminMainContent
        toggleSidebar={toggleSidebar}
        clientName={auth?.clientName}
        clientType={auth?.clientType}
        username={auth?.username}
      />
    </div>
  );
};

export default AdminLayout;

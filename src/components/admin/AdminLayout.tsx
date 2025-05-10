
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Check, Database, File as FileIcon, Settings, Users } from 'lucide-react';

interface AuthState {
  isLoggedIn: boolean;
  username: string;
  role: string;
  clientName: string;
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
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-col flex-1">
        <header className="h-14 flex items-center border-b px-4 lg:px-6">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium ml-4">
              {auth?.clientName || 'Admin Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              {auth?.username && (
                <span className="text-sm text-muted-foreground">
                  Logged in as <span className="font-medium text-foreground">{auth.username}</span>
                </span>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface AdminSidebarProps {
  onLogout: () => void;
  clientName: string;
  collapsed: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar = ({ onLogout, clientName, collapsed, toggleSidebar }: AdminSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "bg-accent/50 text-accent-foreground font-medium" : "hover:bg-accent/30";
  
  return (
    <aside
      className={`bg-background border-r transition-all duration-300 ${collapsed ? "w-14" : "w-64"}`}
    >
      <div className={`h-14 flex items-center border-b px-2 ${collapsed ? "justify-center" : "px-4"}`}>
        {!collapsed && (
          <Link to="/admin/dashboard" className="font-semibold text-lg">
            CleanTrack
          </Link>
        )}
        {collapsed && (
          <div className="rounded-md bg-primary p-1">
            <div className="h-6 w-6 text-primary-foreground flex items-center justify-center font-bold">
              CT
            </div>
          </div>
        )}
      </div>
      
      <div className={`py-2 ${collapsed ? "" : "px-4"}`}>
        <div className="space-y-1">
          {!collapsed && <p className="text-xs text-muted-foreground mb-2 mt-2">Management</p>}
          
          <div>
            <NavLink to="/admin/dashboard" className={getNavClass}>
              <div className={`flex items-center py-2 ${collapsed ? "justify-center px-2" : "px-3"}`}>
                <Database className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Dashboard</span>}
              </div>
            </NavLink>
            
            <NavLink to="/admin/locations" className={getNavClass}>
              <div className={`flex items-center py-2 ${collapsed ? "justify-center px-2" : "px-3"}`}>
                <Check className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Locations</span>}
              </div>
            </NavLink>
            
            <NavLink to="/admin/staff" className={getNavClass}>
              <div className={`flex items-center py-2 ${collapsed ? "justify-center px-2" : "px-3"}`}>
                <Users className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Staff</span>}
              </div>
            </NavLink>
            
            <NavLink to="/admin/reports" className={getNavClass}>
              <div className={`flex items-center py-2 ${collapsed ? "justify-center px-2" : "px-3"}`}>
                <FileIcon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Reports</span>}
              </div>
            </NavLink>
            
            <NavLink to="/admin/settings" className={getNavClass}>
              <div className={`flex items-center py-2 ${collapsed ? "justify-center px-2" : "px-3"}`}>
                <Settings className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Settings</span>}
              </div>
            </NavLink>
          </div>
        </div>
        
        <div className={`mt-auto pt-4 ${collapsed ? "px-2" : ""}`}>
          {!collapsed ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">{clientName}</p>
              <Button onClick={onLogout} variant="outline" className="w-full justify-start">
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={onLogout} variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminLayout;

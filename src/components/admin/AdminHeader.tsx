
import React from 'react';

interface AdminHeaderProps {
  toggleSidebar: () => void;
  clientName?: string;
  clientType?: string;
  username?: string;
}

const AdminHeader = ({ toggleSidebar, clientName, clientType, username }: AdminHeaderProps) => {
  return (
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
        <div className="flex flex-col ml-4">
          <h2 className="text-lg font-medium">
            {clientName || 'Admin Dashboard'}
          </h2>
          {clientType && (
            <span className="text-xs text-muted-foreground">{clientType}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {username && (
            <span className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{username}</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;


import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

interface AdminMainContentProps {
  toggleSidebar: () => void;
  clientName?: string;
  clientType?: string;
  username?: string;
}

const AdminMainContent = ({ toggleSidebar, clientName, clientType, username }: AdminMainContentProps) => {
  return (
    <div className="flex flex-col flex-1">
      <AdminHeader 
        toggleSidebar={toggleSidebar}
        clientName={clientName}
        clientType={clientType}
        username={username}
      />
      
      <main className="flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminMainContent;

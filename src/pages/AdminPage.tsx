
import React from 'react';
import AdminLogin from '@/components/admin/AdminLogin';

const AdminPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="max-w-lg w-full">
        <AdminLogin />
      </div>
    </div>
  );
};

export default AdminPage;

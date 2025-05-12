
import React from 'react';
import AdminLogin from '@/components/admin/AdminLogin';

const AdminPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">SpotlessQR</h1>
          <p className="text-muted-foreground mb-4">
            Multi-client cleaning management system
          </p>
          <div className="flex justify-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Hotels
            </span>
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
              Malls
            </span>
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
              Hospitals
            </span>
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-700/10">
              Offices
            </span>
          </div>
        </div>
        <AdminLogin />
      </div>
    </div>
  );
};

export default AdminPage;

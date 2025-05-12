
import React from 'react';
import Dashboard from '@/components/admin/Dashboard';
import { Toaster } from '@/components/ui/toaster';

const DashboardPage = () => {
  return (
    <div className="container mx-auto space-y-8 p-4 pb-12">
      <Dashboard />
      <Toaster />
    </div>
  );
};

export default DashboardPage;

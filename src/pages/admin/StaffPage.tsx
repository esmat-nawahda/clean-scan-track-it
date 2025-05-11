
import React from 'react';
import StaffManager from '@/components/admin/StaffManager';
import StaffSelector from '@/components/admin/StaffSelector';

const StaffPage = () => {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-2">Staff Management</h1>
      <StaffSelector />
      <StaffManager />
    </div>
  );
};

export default StaffPage;

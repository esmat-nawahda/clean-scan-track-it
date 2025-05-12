
import React, { useState } from 'react';
import StaffManager from '@/components/admin/StaffManager';
import StaffSelector from '@/components/admin/StaffSelector';
import UserManager from '@/components/admin/UserManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StaffPage = () => {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Management</h1>
      
      <Tabs defaultValue="staff">
        <TabsList className="mb-4">
          <TabsTrigger value="staff">Cleaning Staff</TabsTrigger>
          <TabsTrigger value="users">Admin Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff" className="space-y-6">
          <StaffSelector />
          <StaffManager />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffPage;

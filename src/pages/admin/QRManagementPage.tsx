
import React from 'react';
import QRRoomManager from '@/components/admin/QRRoomManager';

const QRManagementPage = () => {
  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">QR & Room Management</h1>
      <QRRoomManager />
    </div>
  );
};

export default QRManagementPage;

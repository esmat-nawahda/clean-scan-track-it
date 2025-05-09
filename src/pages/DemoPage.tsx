
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/navigation/Header';
import QRScanner from '@/components/qr/QRScanner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DemoPage = () => {
  return (
    <>
      <Header />
      <MainLayout className="pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">QR Code Scanner Demo</h1>
            <p className="text-muted-foreground">
              Try our QR scanning functionality below. For demo purposes, clicking "Start Scanning" will simulate finding a QR code.
            </p>
          </div>
          
          <QRScanner />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Want to try the admin dashboard?
            </p>
            <Button asChild variant="outline">
              <Link to="/admin">Go to Admin Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default DemoPage;

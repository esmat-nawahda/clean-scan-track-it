
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanQrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  
  // We'll simulate scanning here
  // In a real application, you'd integrate with a QR scanner library
  
  const startScan = () => {
    setScanning(true);
    
    // Simulate scanning process
    toast.info('Scanning for QR code...');
    
    // For demo purposes, we'll simulate finding a QR after 2 seconds
    setTimeout(() => {
      // Simulate finding a QR code with location ID
      const mockLocationId = 'bathroom-floor1';
      setScanning(false);
      navigate(`/check/${mockLocationId}`);
      toast.success('QR code detected!');
    }, 2000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Scan Location QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className={`relative border-2 ${scanning ? 'border-primary animate-pulse-light' : 'border-dashed border-muted-foreground'} rounded-lg w-64 h-64 mb-6 flex items-center justify-center`}>
          {scanning ? (
            <div className="text-center">
              <ScanQrCode className="w-16 h-16 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Point your camera at the QR code</p>
            </div>
          ) : (
            <div className="text-center">
              <ScanQrCode className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">QR scan preview will appear here</p>
            </div>
          )}
        </div>
        
        <Button 
          onClick={startScan} 
          className="w-full"
          disabled={scanning}
        >
          {scanning ? 'Scanning...' : 'Start Scanning'}
        </Button>
        
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Position the QR code within the frame to scan
        </p>
      </CardContent>
    </Card>
  );
};

export default QRScanner;

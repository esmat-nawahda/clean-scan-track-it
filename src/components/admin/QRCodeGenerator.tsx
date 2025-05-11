
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QRCode from 'qrcode.react';
import { Printer } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  locationName?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ value, size = 200, locationName }) => {
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${locationName || value}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  
  const printQRCode = () => {
    const printWindow = window.open('', '', 'height=500,width=500');
    if (printWindow) {
      const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      
      printWindow.document.write('<html><head><title>Print QR Code</title>');
      printWindow.document.write('<style>body { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; } img { max-width: 100%; } h2 { margin-top: 20px; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<img src="' + img.src + '"/>');
      if (locationName) {
        printWindow.document.write('<h2>' + locationName + '</h2>');
      }
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      // Wait for image to load before printing
      img.onload = function() {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }
  };

  return (
    <Card className="p-6 flex flex-col items-center gap-4">
      <QRCode 
        id="qr-code-canvas"
        value={value} 
        size={size} 
        renderAs="canvas"
        includeMargin
        level="H"
      />
      {locationName && (
        <p className="font-medium text-lg mt-2">{locationName}</p>
      )}
      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={downloadQRCode}>Download</Button>
        <Button onClick={printQRCode}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
    </Card>
  );
};

export default QRCodeGenerator;

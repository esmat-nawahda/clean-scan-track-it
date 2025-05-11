
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Room {
  id: string;
  name: string;
  location: string;
  templateId: string;
  lastCleaned?: string;
  nextCleaningDue?: string;
  status: 'clean' | 'needs-cleaning' | 'overdue';
  qrCodeUrl?: string;  // Add this property
}

interface RoomAlertsProps {
  rooms: Room[];
  onMarkAsCleaned: (roomId: string) => void;
}

const RoomAlerts: React.FC<RoomAlertsProps> = ({ rooms, onMarkAsCleaned }) => {
  const overdueRooms = rooms.filter(room => room.status === 'overdue');
  const needsCleaningRooms = rooms.filter(room => room.status === 'needs-cleaning');
  
  if (overdueRooms.length === 0 && needsCleaningRooms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {overdueRooms.length > 0 && (
        <Alert variant="destructive">
          <Bell className="h-4 w-4 mr-2" />
          <AlertTitle className="flex items-center">
            Cleaning Overdue!
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {overdueRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded-md">
                  <div>
                    <span className="font-semibold">{room.name}</span>
                    <span className="text-sm block opacity-80">{room.location}</span>
                  </div>
                  <Button size="sm" onClick={() => onMarkAsCleaned(room.id)}>
                    Mark as Cleaned
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {needsCleaningRooms.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4 mr-2" />
          <AlertTitle>Cleaning Needed</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {needsCleaningRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div>
                    <span className="font-semibold">{room.name}</span>
                    <span className="text-sm block opacity-80">{room.location}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onMarkAsCleaned(room.id)}>
                    Mark as Cleaned
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RoomAlerts;

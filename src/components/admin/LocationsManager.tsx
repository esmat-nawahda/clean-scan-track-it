
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';

// Mock location data
const initialLocations = [
  { id: 'bathroom-floor1', name: 'First Floor Bathroom', qrCode: 'bathroom-floor1' },
  { id: 'kitchen-main', name: 'Main Kitchen', qrCode: 'kitchen-main' },
  { id: 'lobby-entrance', name: 'Main Lobby', qrCode: 'lobby-entrance' },
  { id: 'office-exec', name: 'Executive Office Suite', qrCode: 'office-exec' },
];

const LocationsManager = () => {
  const [locations, setLocations] = useState(initialLocations);
  const [newLocation, setNewLocation] = useState({ name: '', id: '' });
  
  const handleNewLocationChange = (field: string, value: string) => {
    let id = newLocation.id;
    
    if (field === 'name' && newLocation.id === '') {
      // Auto-generate an ID from the name
      id = value.toLowerCase().replace(/\s+/g, '-');
    }
    
    setNewLocation({ 
      ...newLocation, 
      [field]: value,
      id: field === 'id' ? value : id
    });
  };
  
  const addLocation = () => {
    if (!newLocation.name) {
      toast.error('Location name is required');
      return;
    }
    
    if (!newLocation.id) {
      toast.error('Location ID is required');
      return;
    }
    
    // Check for duplicate IDs
    if (locations.some(location => location.id === newLocation.id)) {
      toast.error('Location ID already exists');
      return;
    }
    
    const newLocationObj = {
      id: newLocation.id,
      name: newLocation.name,
      qrCode: newLocation.id,
    };
    
    setLocations([...locations, newLocationObj]);
    setNewLocation({ name: '', id: '' });
    toast.success('Location added successfully');
  };

  // In a real app, this would generate an actual QR code using a library
  const downloadQRCode = (locationId: string) => {
    toast.info(`Generating QR code for ${locationId}`);
    
    // Simulate download delay
    setTimeout(() => {
      toast.success('QR code downloaded successfully');
    }, 1500);
  };

  return (
    <div>
      <Tabs defaultValue="manage">
        <TabsList>
          <TabsTrigger value="manage">Manage Locations</TabsTrigger>
          <TabsTrigger value="add">Add Location</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Card key={location.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{location.name}</CardTitle>
                  <CardDescription>ID: {location.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 flex items-center justify-center bg-muted/50">
                    <QrCode className="h-24 w-24 text-primary" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => downloadQRCode(location.id)}
                    className="w-full"
                    variant="outline"
                  >
                    Download QR Code
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Location</CardTitle>
              <CardDescription>
                Create a new location and generate its QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name</Label>
                <Input 
                  id="locationName" 
                  placeholder="e.g., Second Floor Bathroom"
                  value={newLocation.name}
                  onChange={(e) => handleNewLocationChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="locationId">Location ID</Label>
                <Input 
                  id="locationId" 
                  placeholder="e.g., bathroom-floor2"
                  value={newLocation.id}
                  onChange={(e) => handleNewLocationChange('id', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This ID will be used in the QR code and URLs
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={addLocation}
                className="w-full"
              >
                Add Location
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationsManager;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, QrCode, Printer } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';
import ChecklistTemplateManager, { ChecklistTemplate } from './ChecklistTemplateManager';

// Mock initial data
const initialTemplates: ChecklistTemplate[] = [
  {
    id: 'template-1',
    name: 'Bathroom Cleaning',
    items: [
      { id: 'item-1-1', text: 'Clean toilet', required: true },
      { id: 'item-1-2', text: 'Wipe mirrors', required: true },
      { id: 'item-1-3', text: 'Mop floors', required: true },
      { id: 'item-1-4', text: 'Refill soap dispensers', required: false },
      { id: 'item-1-5', text: 'Restock toilet paper', required: false },
    ]
  },
  {
    id: 'template-2',
    name: 'Office Cleaning',
    items: [
      { id: 'item-2-1', text: 'Empty trash', required: true },
      { id: 'item-2-2', text: 'Vacuum carpet', required: true },
      { id: 'item-2-3', text: 'Dust surfaces', required: false },
      { id: 'item-2-4', text: 'Clean windows', required: false },
    ]
  }
];

interface Room {
  id: string;
  name: string;
  location: string;
  templateId: string;
  qrCodeUrl: string;
}

const QRRoomManager: React.FC = () => {
  // State variables
  const [rooms, setRooms] = useState<Room[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(initialTemplates);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    location: '',
    templateId: '',
  });
  const [activeTabId, setActiveTabId] = useState<string>('rooms');
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedRooms = localStorage.getItem('cleantrack-rooms');
    const storedTemplates = localStorage.getItem('cleantrack-templates');
    
    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    }
    
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    }
  }, []);
  
  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('cleantrack-rooms', JSON.stringify(rooms));
  }, [rooms]);
  
  useEffect(() => {
    localStorage.setItem('cleantrack-templates', JSON.stringify(templates));
  }, [templates]);
  
  // Functions for template management
  const handleTemplateCreate = (template: ChecklistTemplate) => {
    setTemplates([...templates, template]);
  };
  
  const handleTemplateUpdate = (templateId: string, updatedTemplate: ChecklistTemplate) => {
    setTemplates(templates.map(t => t.id === templateId ? updatedTemplate : t));
  };
  
  const handleTemplateDelete = (templateId: string) => {
    // Check if template is in use
    const isTemplateInUse = rooms.some(room => room.templateId === templateId);
    
    if (isTemplateInUse) {
      toast.error('Cannot delete template that is assigned to rooms');
      return;
    }
    
    setTemplates(templates.filter(t => t.id !== templateId));
    toast.success('Template deleted');
  };
  
  const handleTemplateDuplicate = (templateId: string) => {
    const templateToDuplicate = templates.find(t => t.id === templateId);
    
    if (templateToDuplicate) {
      const duplicatedTemplate: ChecklistTemplate = {
        ...templateToDuplicate,
        id: `template-${Date.now()}`,
        name: `${templateToDuplicate.name} (Copy)`,
      };
      
      setTemplates([...templates, duplicatedTemplate]);
      toast.success('Template duplicated');
    }
  };
  
  // Functions for room management
  const handleCreateRoom = () => {
    if (!newRoom.name || !newRoom.location || !newRoom.templateId) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const roomId = `room-${Date.now()}`;
    const qrValue = `${window.location.origin}/check/${roomId}`;
    
    const createdRoom: Room = {
      id: roomId,
      name: newRoom.name,
      location: newRoom.location,
      templateId: newRoom.templateId,
      qrCodeUrl: qrValue,
    };
    
    setRooms([...rooms, createdRoom]);
    setNewRoom({ name: '', location: '', templateId: '' });
    setIsCreateRoomOpen(false);
    toast.success('Room created successfully');
  };
  
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setActiveTabId('qrcode');
  };
  
  const getTemplateNameById = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTabId} onValueChange={setActiveTabId}>
        <TabsList>
          <TabsTrigger value="rooms">Rooms & QR Codes</TabsTrigger>
          <TabsTrigger value="templates">Checklist Templates</TabsTrigger>
          {selectedRoom && <TabsTrigger value="qrcode">View QR Code</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="rooms" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Rooms</h2>
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Add details for the new room and assign a checklist template
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input 
                      id="roomName"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      placeholder="e.g., First Floor Bathroom"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roomLocation">Location/Description</Label>
                    <Input 
                      id="roomLocation"
                      value={newRoom.location}
                      onChange={(e) => setNewRoom({ ...newRoom, location: e.target.value })}
                      placeholder="e.g., Main Building, First Floor"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roomTemplate">Checklist Template</Label>
                    {templates.length > 0 ? (
                      <select
                        id="roomTemplate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newRoom.templateId || ''}
                        onChange={(e) => setNewRoom({ ...newRoom, templateId: e.target.value })}
                      >
                        <option value="" disabled>Select a template</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-md bg-muted p-4 text-center">
                        <p className="text-sm text-muted-foreground">No templates available.</p>
                        <p className="text-sm text-muted-foreground">Create a template first.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateRoomOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateRoom} disabled={templates.length === 0}>
                    Create Room
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {rooms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map(room => (
                <Card key={room.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>{room.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Template</p>
                        <p className="text-sm text-muted-foreground">{getTemplateNameById(room.templateId)}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleSelectRoom(room)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        View QR
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Rooms Created Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first room and assign a checklist template to it.
                </p>
                <Button onClick={() => setIsCreateRoomOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Room
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="templates">
          <ChecklistTemplateManager
            templates={templates}
            onTemplateCreate={handleTemplateCreate}
            onTemplateUpdate={handleTemplateUpdate}
            onTemplateDelete={handleTemplateDelete}
            onTemplateDuplicate={handleTemplateDuplicate}
            onSelectTemplate={setSelectedTemplateId}
            selectedTemplateId={selectedTemplateId}
          />
        </TabsContent>
        
        <TabsContent value="qrcode">
          {selectedRoom && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedRoom.name}</h2>
                  <p className="text-muted-foreground">{selectedRoom.location}</p>
                </div>
                <Button variant="outline" onClick={() => setActiveTabId('rooms')}>
                  Back to Rooms
                </Button>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8">
                <QRCodeGenerator 
                  value={selectedRoom.qrCodeUrl}
                  size={300}
                  locationName={selectedRoom.name}
                />
                
                <div className="mt-6 text-center space-y-2">
                  <p className="font-medium">QR Code for {selectedRoom.name}</p>
                  <p className="text-sm text-muted-foreground">
                    When scanned, this QR code will open the checklist for this room.
                  </p>
                  <p className="text-sm font-medium mt-4">Link:</p>
                  <code className="bg-muted p-2 rounded-md block max-w-full overflow-auto">
                    {selectedRoom.qrCodeUrl}
                  </code>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRRoomManager;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, QrCode, Printer, CalendarClock, MapPin, Check } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';
import ChecklistTemplateManager, { ChecklistTemplate } from './ChecklistTemplateManager';
import RoomAlerts, { Room } from './RoomAlerts';

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

// Mock location data
const initialLocations = [
  { id: 'bathroom-floor1', name: 'First Floor Bathroom', qrCode: 'bathroom-floor1' },
  { id: 'kitchen-main', name: 'Main Kitchen', qrCode: 'kitchen-main' },
  { id: 'lobby-entrance', name: 'Main Lobby', qrCode: 'lobby-entrance' },
  { id: 'office-exec', name: 'Executive Office Suite', qrCode: 'office-exec' },
];

interface CleaningSchedule {
  id: string;
  roomId: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'custom';
  interval?: number; // In hours for custom frequency
  lastCleaned?: string;
  nextCleaningDue?: string;
}

const QRRoomManager: React.FC = () => {
  // State variables
  const [rooms, setRooms] = useState<Room[]>([]);
  const [locations, setLocations] = useState(initialLocations);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(initialTemplates);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCreateLocationOpen, setIsCreateLocationOpen] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    location: '',
    templateId: '',
    status: 'clean'
  });
  const [newLocation, setNewLocation] = useState({ name: '', id: '' });
  const [activeTabId, setActiveTabId] = useState<string>('rooms');
  const [schedules, setSchedules] = useState<CleaningSchedule[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Partial<CleaningSchedule>>({
    frequency: 'hourly',
    interval: 1
  });
  const [selectedRoomForSchedule, setSelectedRoomForSchedule] = useState<Room | null>(null);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedRooms = localStorage.getItem('cleantrack-rooms');
    const storedTemplates = localStorage.getItem('cleantrack-templates');
    const storedLocations = localStorage.getItem('cleantrack-locations');
    const storedSchedules = localStorage.getItem('cleantrack-schedules');
    
    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    }
    
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    }

    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    }

    if (storedSchedules) {
      setSchedules(JSON.parse(storedSchedules));
    }
  }, []);
  
  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('cleantrack-rooms', JSON.stringify(rooms));
  }, [rooms]);
  
  useEffect(() => {
    localStorage.setItem('cleantrack-templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('cleantrack-locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('cleantrack-schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Check cleaning status based on schedules
  useEffect(() => {
    const checkCleaningStatus = () => {
      const now = new Date();
      const updatedRooms = rooms.map(room => {
        const roomSchedule = schedules.find(s => s.roomId === room.id);
        
        if (!roomSchedule || !roomSchedule.nextCleaningDue) {
          return room;
        }
        
        const nextDue = new Date(roomSchedule.nextCleaningDue);
        let status: 'clean' | 'needs-cleaning' | 'overdue' = 'clean';
        
        if (now > nextDue) {
          // Overdue if more than 30 minutes late
          const overdueThreshold = new Date(nextDue);
          overdueThreshold.setMinutes(overdueThreshold.getMinutes() + 30);
          status = now > overdueThreshold ? 'overdue' : 'needs-cleaning';
        }
        
        return {
          ...room,
          status,
          lastCleaned: roomSchedule.lastCleaned,
          nextCleaningDue: roomSchedule.nextCleaningDue
        };
      });
      
      setRooms(updatedRooms);
    };
    
    checkCleaningStatus();
    
    // Check every minute for status updates
    const interval = setInterval(checkCleaningStatus, 60000);
    return () => clearInterval(interval);
  }, [rooms, schedules]);

  // Location management
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
    setIsCreateLocationOpen(false);
    toast.success('Location added successfully');
  };
  
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
    if (!newRoom.name || !newRoom.templateId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const roomId = `room-${Date.now()}`;
    const qrValue = `${window.location.origin}/check/${roomId}`;
    
    const createdRoom: Room = {
      id: roomId,
      name: newRoom.name || '',
      location: newRoom.location || '',
      templateId: newRoom.templateId || '',
      status: 'clean',
      qrCodeUrl: qrValue,
    };
    
    setRooms([...rooms, createdRoom]);

    // Create default hourly schedule
    const newSchedule: CleaningSchedule = {
      id: `schedule-${Date.now()}`,
      roomId: roomId,
      frequency: 'hourly',
      interval: 1,
      lastCleaned: new Date().toISOString(),
      nextCleaningDue: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };
    
    setSchedules([...schedules, newSchedule]);
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

  const handleMarkAsCleaned = (roomId: string) => {
    // Update room status
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return { ...room, status: 'clean' as const };
      }
      return room;
    });
    
    // Update schedule with new cleaning time and next due time
    const updatedSchedules = schedules.map(schedule => {
      if (schedule.roomId === roomId) {
        const now = new Date();
        let nextDue = new Date(now);
        
        switch(schedule.frequency) {
          case 'hourly':
            nextDue.setHours(nextDue.getHours() + 1);
            break;
          case 'daily':
            nextDue.setDate(nextDue.getDate() + 1);
            break;
          case 'weekly':
            nextDue.setDate(nextDue.getDate() + 7);
            break;
          case 'custom':
            nextDue.setHours(nextDue.getHours() + (schedule.interval || 1));
            break;
        }
        
        return {
          ...schedule,
          lastCleaned: now.toISOString(),
          nextCleaningDue: nextDue.toISOString()
        };
      }
      return schedule;
    });
    
    setRooms(updatedRooms);
    setSchedules(updatedSchedules);
    toast.success('Room marked as cleaned');
  };

  const openScheduleDialog = (room: Room) => {
    const roomSchedule = schedules.find(s => s.roomId === room.id);
    
    setSelectedRoomForSchedule(room);
    if (roomSchedule) {
      setCurrentSchedule({
        ...roomSchedule
      });
    } else {
      setCurrentSchedule({
        frequency: 'hourly',
        interval: 1
      });
    }
    
    setIsScheduleDialogOpen(true);
  };

  const saveSchedule = () => {
    if (!selectedRoomForSchedule) return;
    
    const now = new Date();
    let nextDue = new Date(now);
    
    // Calculate next due date based on frequency
    switch(currentSchedule.frequency) {
      case 'hourly':
        nextDue.setHours(nextDue.getHours() + 1);
        break;
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'custom':
        nextDue.setHours(nextDue.getHours() + (currentSchedule.interval || 1));
        break;
    }
    
    const existingScheduleIndex = schedules.findIndex(
      s => s.roomId === selectedRoomForSchedule.id
    );
    
    if (existingScheduleIndex >= 0) {
      // Update existing schedule
      const updatedSchedules = [...schedules];
      updatedSchedules[existingScheduleIndex] = {
        ...updatedSchedules[existingScheduleIndex],
        ...currentSchedule,
        lastCleaned: now.toISOString(),
        nextCleaningDue: nextDue.toISOString()
      } as CleaningSchedule;
      
      setSchedules(updatedSchedules);
    } else {
      // Create new schedule
      const newSchedule: CleaningSchedule = {
        id: `schedule-${Date.now()}`,
        roomId: selectedRoomForSchedule.id,
        frequency: currentSchedule.frequency as 'hourly' | 'daily' | 'weekly' | 'custom',
        interval: currentSchedule.interval,
        lastCleaned: now.toISOString(),
        nextCleaningDue: nextDue.toISOString()
      };
      
      setSchedules([...schedules, newSchedule]);
    }
    
    setIsScheduleDialogOpen(false);
    toast.success('Cleaning schedule updated');
  };

  const getRoomScheduleText = (roomId: string) => {
    const schedule = schedules.find(s => s.roomId === roomId);
    if (!schedule) return 'No schedule set';
    
    switch(schedule.frequency) {
      case 'hourly':
        return 'Every hour';
      case 'daily':
        return 'Once a day';
      case 'weekly':
        return 'Once a week';
      case 'custom':
        return `Every ${schedule.interval} hour${schedule.interval !== 1 ? 's' : ''}`;
    }
  };

  // Filter rooms with alerts for quick access
  const roomsNeedingAttention = rooms.filter(room => 
    room.status === 'needs-cleaning' || room.status === 'overdue'
  );
  
  return (
    <div className="space-y-6">
      {/* Room Cleaning Alerts */}
      <RoomAlerts 
        rooms={roomsNeedingAttention}
        onMarkAsCleaned={handleMarkAsCleaned}
      />

      <Tabs defaultValue={activeTabId} onValueChange={setActiveTabId}>
        <TabsList>
          <TabsTrigger value="rooms">Rooms & QR Codes</TabsTrigger>
          <TabsTrigger value="templates">Checklist Templates</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
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
                    <Label htmlFor="roomLocation">Location</Label>
                    <select
                      id="roomLocation"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newRoom.location || ''}
                      onChange={(e) => setNewRoom({ ...newRoom, location: e.target.value })}
                    >
                      <option value="" disabled>Select a location</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
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
                <Card 
                  key={room.id} 
                  className={`overflow-hidden border-l-4 ${
                    room.status === 'overdue' ? 'border-l-destructive' : 
                    room.status === 'needs-cleaning' ? 'border-l-amber-500' :
                    'border-l-green-500'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {locations.find(l => l.id === room.location)?.name || room.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Template</p>
                      <p className="text-sm text-muted-foreground">{getTemplateNameById(room.templateId)}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium flex items-center">
                          <CalendarClock className="h-3 w-3 mr-1" />
                          Cleaning Schedule
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openScheduleDialog(room)}
                          className="h-6 text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{getRoomScheduleText(room.id)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          room.status === 'clean' ? 'bg-green-500' : 
                          room.status === 'needs-cleaning' ? 'bg-amber-500' : 
                          'bg-destructive'
                        }`} />
                        <span className="text-sm">
                          {room.status === 'clean' ? 'Clean' : 
                           room.status === 'needs-cleaning' ? 'Needs Cleaning' : 
                           'Overdue'}
                        </span>
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
        
        <TabsContent value="locations">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Locations</h2>
              <Dialog open={isCreateLocationOpen} onOpenChange={setIsCreateLocationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Location</DialogTitle>
                    <DialogDescription>
                      Add a new location for organizing your rooms
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
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
                        This ID will be used for internal reference
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateLocationOpen(false)}>Cancel</Button>
                    <Button onClick={addLocation}>
                      Add Location
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => {
                // Count rooms in this location
                const roomsInLocation = rooms.filter(r => r.location === location.id);
                
                return (
                  <Card key={location.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{location.name}</CardTitle>
                      <CardDescription>
                        {roomsInLocation.length} {roomsInLocation.length === 1 ? 'room' : 'rooms'} assigned
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {roomsInLocation.length > 0 ? (
                          <div className="space-y-2">
                            {roomsInLocation.map(room => (
                              <div key={room.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <span className="font-medium">{room.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7"
                                  onClick={() => handleSelectRoom(room)}
                                >
                                  <QrCode className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-2 text-sm text-muted-foreground">
                            No rooms assigned to this location
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="qrcode">
          {selectedRoom && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedRoom.name}</h2>
                  <p className="text-muted-foreground">
                    {locations.find(l => l.id === selectedRoom.location)?.name || selectedRoom.location}
                  </p>
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

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Cleaning Schedule</DialogTitle>
            <DialogDescription>
              {selectedRoomForSchedule?.name && (
                `Configure how often "${selectedRoomForSchedule.name}" needs to be cleaned`
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Cleaning Frequency</Label>
              <select
                id="frequency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={currentSchedule.frequency || 'hourly'}
                onChange={(e) => setCurrentSchedule({ 
                  ...currentSchedule, 
                  frequency: e.target.value as 'hourly' | 'daily' | 'weekly' | 'custom' 
                })}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Once a Day</option>
                <option value="weekly">Once a Week</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {currentSchedule.frequency === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="interval">Interval (hours)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={1}
                  value={currentSchedule.interval || 1}
                  onChange={(e) => setCurrentSchedule({
                    ...currentSchedule,
                    interval: Number(e.target.value)
                  })}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveSchedule}>Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRRoomManager;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, QrCode, Printer, CalendarClock, MapPin, Check, Loader2 } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';
import ChecklistTemplateManager, { ChecklistTemplate } from './ChecklistTemplateManager';
import RoomAlerts, { Room } from './RoomAlerts';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Types from Supabase database
interface Location {
  id: string;
  name: string;
  code: string;
}

interface CleaningSchedule {
  id: string;
  roomId: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'custom';
  interval_hours?: number; // In hours for custom frequency
  last_cleaned?: string;
  next_cleaning_due?: string;
}

const QRRoomManager: React.FC = () => {
  // State variables
  const [rooms, setRooms] = useState<Room[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCreateLocationOpen, setIsCreateLocationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    location: '',
    templateId: '',
    status: 'clean'
  });
  const [newLocation, setNewLocation] = useState({ name: '', id: '', code: '' });
  const [activeTabId, setActiveTabId] = useState<string>('rooms');
  const [schedules, setSchedules] = useState<CleaningSchedule[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Partial<CleaningSchedule>>({
    frequency: 'hourly',
    interval_hours: 1
  });
  const [selectedRoomForSchedule, setSelectedRoomForSchedule] = useState<Room | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  
  // Load authenticated user and organization data
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        // Get stored auth data
        const authDataStr = localStorage.getItem('cleantrack-auth');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          // For now, hardcoded for demo
          if (authData.clientName === 'Demo Company') {
            setOrgId('00000000-0000-0000-0000-000000000005');
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    };

    loadAuthData();
  }, []);

  // Load data from Supabase when orgId is available
  useEffect(() => {
    if (orgId) {
      loadDataFromSupabase();
    }
  }, [orgId]);

  const loadDataFromSupabase = async () => {
    setIsLoading(true);
    try {
      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('organization_id', orgId);
      
      if (locationsError) throw locationsError;
      
      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('organization_id', orgId);
      
      if (templatesError) throw templatesError;

      // Fetch template items
      const { data: itemsData, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .in('template_id', templatesData.map(t => t.id));
      
      if (itemsError) throw itemsError;

      // Combine templates with their items
      const templatesWithItems = templatesData.map(template => {
        const items = itemsData
          .filter(item => item.template_id === template.id)
          .map(item => ({
            id: item.id,
            text: item.text,
            required: item.required,
          }));
        
        return {
          id: template.id,
          name: template.name,
          items,
        };
      });

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .in('location_id', locationsData.map(l => l.id));
      
      if (roomsError) throw roomsError;

      // Fetch cleaning schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('cleaning_schedules')
        .select('*')
        .in('room_id', roomsData.map(r => r.id));
      
      if (schedulesError) throw schedulesError;

      // Map schedules to our internal format
      const mappedSchedules = schedulesData.map(schedule => ({
        id: schedule.id,
        roomId: schedule.room_id,
        frequency: schedule.frequency as 'hourly' | 'daily' | 'weekly' | 'custom',
        interval_hours: schedule.interval_hours,
        last_cleaned: schedule.last_cleaned,
        next_cleaning_due: schedule.next_cleaning_due,
      }));

      // Map rooms to our internal format
      const mappedRooms = roomsData.map(room => {
        const roomSchedule = mappedSchedules.find(s => s.roomId === room.id);
        let status: 'clean' | 'needs-cleaning' | 'overdue' = 'clean';
        
        if (roomSchedule && roomSchedule.next_cleaning_due) {
          const now = new Date();
          const nextDue = new Date(roomSchedule.next_cleaning_due);
          
          if (now > nextDue) {
            // Overdue if more than 30 minutes late
            const overdueThreshold = new Date(nextDue);
            overdueThreshold.setMinutes(overdueThreshold.getMinutes() + 30);
            status = now > overdueThreshold ? 'overdue' : 'needs-cleaning';
          }
        }
        
        return {
          id: room.id,
          name: room.name,
          location: room.location_id,
          templateId: room.template_id,
          status,
          qrCodeUrl: `${window.location.origin}/check/${room.qr_code}`, // Format for QR URL
        };
      });

      // Set state with data from Supabase
      setLocations(locationsData as Location[]);
      setTemplates(templatesWithItems);
      setRooms(mappedRooms);
      setSchedules(mappedSchedules);
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      toast.error('Failed to load data from database');
      
      // Fall back to localStorage for demo if needed
      const storedRooms = localStorage.getItem('cleantrack-rooms');
      const storedTemplates = localStorage.getItem('cleantrack-templates');
      const storedLocations = localStorage.getItem('cleantrack-locations');
      const storedSchedules = localStorage.getItem('cleantrack-schedules');
      
      if (storedRooms) setRooms(JSON.parse(storedRooms));
      if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
      if (storedLocations) setLocations(JSON.parse(storedLocations));
      if (storedSchedules) setSchedules(JSON.parse(storedSchedules));
    } finally {
      setIsLoading(false);
    }
  };
  
  // This will save new data both to Supabase and localStorage as backup
  const saveDataToSupabase = async (
    dataType: 'room' | 'location' | 'template' | 'schedule', 
    action: 'create' | 'update' | 'delete',
    data: any
  ) => {
    try {
      switch (dataType) {
        case 'room':
          if (action === 'create') {
            const { data: roomData, error: roomError } = await supabase
              .from('rooms')
              .insert({
                name: data.name,
                location_id: data.location,
                template_id: data.templateId,
                qr_code: data.qrCode,
                status: data.status || 'clean',
              })
              .select()
              .single();
            
            if (roomError) throw roomError;
            return roomData;
          } else if (action === 'update') {
            const { error: roomUpdateError } = await supabase
              .from('rooms')
              .update({
                status: data.status,
              })
              .eq('id', data.id);
            
            if (roomUpdateError) throw roomUpdateError;
          }
          break;
          
        case 'schedule':
          if (action === 'create') {
            const { data: scheduleData, error: scheduleError } = await supabase
              .from('cleaning_schedules')
              .insert({
                room_id: data.roomId,
                frequency: data.frequency,
                interval_hours: data.interval_hours,
                last_cleaned: data.last_cleaned,
                next_cleaning_due: data.next_cleaning_due,
              })
              .select()
              .single();
            
            if (scheduleError) throw scheduleError;
            return scheduleData;
          } else if (action === 'update') {
            const { error: scheduleUpdateError } = await supabase
              .from('cleaning_schedules')
              .update({
                frequency: data.frequency,
                interval_hours: data.interval_hours,
                last_cleaned: data.last_cleaned,
                next_cleaning_due: data.next_cleaning_due,
              })
              .eq('id', data.id);
            
            if (scheduleUpdateError) throw scheduleUpdateError;
          }
          break;
          
        case 'location':
          if (action === 'create') {
            const { data: locationData, error: locationError } = await supabase
              .from('locations')
              .insert({
                name: data.name,
                code: data.code,
                organization_id: orgId,
              })
              .select()
              .single();
            
            if (locationError) throw locationError;
            return locationData;
          }
          break;
          
        case 'template':
          // Template operations would be implemented here
          break;
      }
      
      // Success
      return true;
    } catch (error) {
      console.error(`Error saving ${dataType} to Supabase:`, error);
      toast.error(`Failed to save ${dataType} to database`);
      
      // Still save to localStorage as backup
      switch (dataType) {
        case 'room':
          localStorage.setItem('cleantrack-rooms', JSON.stringify(rooms));
          break;
        case 'location':
          localStorage.setItem('cleantrack-locations', JSON.stringify(locations));
          break;
        case 'template':
          localStorage.setItem('cleantrack-templates', JSON.stringify(templates));
          break;
        case 'schedule':
          localStorage.setItem('cleantrack-schedules', JSON.stringify(schedules));
          break;
      }
      
      return null;
    }
  };
  
  // Save to localStorage when data changes (as backup)
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
        
        if (!roomSchedule || !roomSchedule.next_cleaning_due) {
          return room;
        }
        
        const nextDue = new Date(roomSchedule.next_cleaning_due);
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
          lastCleaned: roomSchedule.last_cleaned,
          nextCleaningDue: roomSchedule.next_cleaning_due
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
    let code = newLocation.code;
    
    if (field === 'name' && newLocation.id === '') {
      // Auto-generate an ID and code from the name
      id = uuidv4();
      code = value.toLowerCase().replace(/\s+/g, '-');
    }
    
    setNewLocation({ 
      ...newLocation, 
      [field]: value,
      id: field === 'id' ? value : id,
      code: field === 'code' ? value : code
    });
  };
  
  const addLocation = async () => {
    if (!newLocation.name) {
      toast.error('Location name is required');
      return;
    }
    
    if (!newLocation.code) {
      toast.error('Location code is required');
      return;
    }
    
    // Check for duplicate codes
    if (locations.some(location => location.code === newLocation.code)) {
      toast.error('Location code already exists');
      return;
    }
    
    try {
      // Create new location in Supabase
      const locationData = await saveDataToSupabase('location', 'create', newLocation) as Location | null;
      
      if (locationData) {
        // Update local state
        const newLocationObj: Location = {
          id: locationData.id,
          name: locationData.name,
          code: locationData.code,
        };
        
        setLocations([...locations, newLocationObj]);
        setNewLocation({ name: '', id: '', code: '' });
        setIsCreateLocationOpen(false);
        toast.success('Location added successfully');
      }
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    }
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
        id: uuidv4(),
        name: `${templateToDuplicate.name} (Copy)`,
      };
      
      setTemplates([...templates, duplicatedTemplate]);
      toast.success('Template duplicated');
    }
  };
  
  // Functions for room management
  const handleCreateRoom = async () => {
    if (!newRoom.name || !newRoom.templateId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const roomId = uuidv4();
      const qrCode = `room-${Date.now()}`;
      const qrValue = `${window.location.origin}/check/${qrCode}`;
      
      const roomData = {
        id: roomId,
        name: newRoom.name || '',
        location: newRoom.location || '',
        templateId: newRoom.templateId || '',
        status: 'clean',
        qrCode: qrCode,
        qrCodeUrl: qrValue,
      };
      
      // Save room to database
      const savedRoom = await saveDataToSupabase('room', 'create', roomData);
      
      if (savedRoom) {
        // Format the room object for our state
        const createdRoom: Room = {
          id: savedRoom.id,
          name: savedRoom.name,
          location: savedRoom.location_id,
          templateId: savedRoom.template_id,
          status: 'clean',
          qrCodeUrl: qrValue,
        };
        
        setRooms([...rooms, createdRoom]);

        // Create default hourly schedule
        const now = new Date();
        const nextDue = new Date(now);
        nextDue.setHours(nextDue.getHours() + 1);
        
        const scheduleData = {
          roomId: createdRoom.id,
          frequency: 'hourly',
          interval_hours: 1,
          last_cleaned: now.toISOString(),
          next_cleaning_due: nextDue.toISOString(),
        };
        
        const savedSchedule = await saveDataToSupabase('schedule', 'create', scheduleData);
        
        if (savedSchedule) {
          const newSchedule: CleaningSchedule = {
            id: savedSchedule.id,
            roomId: savedSchedule.room_id,
            frequency: savedSchedule.frequency,
            interval_hours: savedSchedule.interval_hours,
            last_cleaned: savedSchedule.last_cleaned,
            next_cleaning_due: savedSchedule.next_cleaning_due,
          };
          
          setSchedules([...schedules, newSchedule]);
        }
        
        setNewRoom({ name: '', location: '', templateId: '' });
        setIsCreateRoomOpen(false);
        toast.success('Room created successfully');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };
  
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setActiveTabId('qrcode');
  };
  
  const getTemplateNameById = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  const handleMarkAsCleaned = async (roomId: string) => {
    try {
      // Update room status
      const roomToUpdate = rooms.find(r => r.id === roomId);
      if (!roomToUpdate) return;
      
      const updatedRoom = { ...roomToUpdate, status: 'clean' as const };
      await saveDataToSupabase('room', 'update', updatedRoom);
      
      // Update schedule with new cleaning time and next due time
      const scheduleToUpdate = schedules.find(s => s.roomId === roomId);
      if (!scheduleToUpdate) return;
      
      const now = new Date();
      let nextDue = new Date(now);
      
      switch(scheduleToUpdate.frequency) {
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
          nextDue.setHours(nextDue.getHours() + (scheduleToUpdate.interval_hours || 1));
          break;
      }
      
      const updatedSchedule = {
        ...scheduleToUpdate,
        last_cleaned: now.toISOString(),
        next_cleaning_due: nextDue.toISOString()
      };
      
      await saveDataToSupabase('schedule', 'update', updatedSchedule);
      
      // Update local state
      const updatedRooms = rooms.map(room => {
        if (room.id === roomId) {
          return { ...room, status: 'clean' as const };
        }
        return room;
      });
      
      const updatedSchedules = schedules.map(schedule => {
        if (schedule.roomId === roomId) {
          return {
            ...schedule,
            last_cleaned: now.toISOString(),
            next_cleaning_due: nextDue.toISOString()
          };
        }
        return schedule;
      });
      
      setRooms(updatedRooms);
      setSchedules(updatedSchedules);
      toast.success('Room marked as cleaned');
    } catch (error) {
      console.error('Error marking room as cleaned:', error);
      toast.error('Failed to update room status');
    }
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
        interval_hours: 1
      });
    }
    
    setIsScheduleDialogOpen(true);
  };

  const saveSchedule = async () => {
    if (!selectedRoomForSchedule) return;
    
    try {
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
          nextDue.setHours(nextDue.getHours() + (currentSchedule.interval_hours || 1));
          break;
      }
      
      const existingScheduleIndex = schedules.findIndex(
        s => s.roomId === selectedRoomForSchedule.id
      );
      
      if (existingScheduleIndex >= 0) {
        // Update existing schedule
        const scheduleToUpdate = {
          ...schedules[existingScheduleIndex],
          ...currentSchedule,
          last_cleaned: now.toISOString(),
          next_cleaning_due: nextDue.toISOString()
        };
        
        await saveDataToSupabase('schedule', 'update', scheduleToUpdate);
        
        const updatedSchedules = [...schedules];
        updatedSchedules[existingScheduleIndex] = {
          ...updatedSchedules[existingScheduleIndex],
          ...currentSchedule,
          last_cleaned: now.toISOString(),
          next_cleaning_due: nextDue.toISOString()
        } as CleaningSchedule;
        
        setSchedules(updatedSchedules);
      } else {
        // Create new schedule
        const newScheduleData = {
          roomId: selectedRoomForSchedule.id,
          frequency: currentSchedule.frequency as 'hourly' | 'daily' | 'weekly' | 'custom',
          interval_hours: currentSchedule.interval_hours,
          last_cleaned: now.toISOString(),
          next_cleaning_due: nextDue.toISOString()
        };
        
        const savedSchedule = await saveDataToSupabase('schedule', 'create', newScheduleData);
        
        if (savedSchedule && typeof savedSchedule !== 'boolean') {
          const newSchedule: CleaningSchedule = {
            id: savedSchedule.id,
            roomId: savedSchedule.room_id,
            frequency: savedSchedule.frequency,
            interval_hours: savedSchedule.interval_hours,
            last_cleaned: savedSchedule.last_cleaned,
            next_cleaning_due: savedSchedule.next_cleaning_due,
          };
          
          setSchedules([...schedules, newSchedule]);
        }
      }
      
      setIsScheduleDialogOpen(false);
      toast.success('Cleaning schedule updated');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to update schedule');
    }
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
        return `Every ${schedule.interval_hours} hour${schedule.interval_hours !== 1 ? 's' : ''}`;
    }
  };

  // Filter rooms with alerts for quick access
  const roomsNeedingAttention = rooms.filter(room => 
    room.status === 'needs-cleaning' || room.status === 'overdue'
  );
  
  // Get location name by id
  const getLocationNameById = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown Location';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading room data...</p>
        </div>
      </div>
    );
  }
  
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
                        {getLocationNameById(room.location)}
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
                      <Label htmlFor="locationCode">Location Code</Label>
                      <Input 
                        id="locationCode" 
                        placeholder="e.g., bathroom-floor2"
                        value={newLocation.code}
                        onChange={(e) => handleNewLocationChange('code', e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        This code will be used for internal reference
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
                    {getLocationNameById(selectedRoom.location)}
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
                  value={currentSchedule.interval_hours || 1}
                  onChange={(e) => setCurrentSchedule({
                    ...currentSchedule,
                    interval_hours: Number(e.target.value)
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

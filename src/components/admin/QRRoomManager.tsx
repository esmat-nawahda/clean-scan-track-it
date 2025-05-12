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

// Define return types for saveDataToSupabase function
type RoomData = {
  id: string;
  name: string;
  location_id: string;
  template_id: string;
  qr_code: string;
  status: string;
};

type LocationData = {
  id: string;
  name: string;
  code: string;
};

type ScheduleData = {
  id: string;
  room_id: string;
  frequency: string;
  interval_hours: number | null;
  last_cleaned: string | null;
  next_cleaning_due: string | null;
};

type SaveDataReturn = RoomData | LocationData | ScheduleData | boolean | null;

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
      if (!orgId) {
        throw new Error('Organization ID not available');
      }

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

      if (!locationsData || !templatesData) {
        throw new Error('Failed to fetch data');
      }

      // Fetch template items
      const { data: itemsData, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .in('template_id', templatesData.map(t => t.id));
      
      if (itemsError) throw itemsError;
      
      if (!itemsData) {
        throw new Error('Failed to fetch template items');
      }

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
      
      if (!roomsData) {
        throw new Error('Failed to fetch rooms data');
      }

      // Fetch cleaning schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('cleaning_schedules')
        .select('*')
        .in('room_id', roomsData.map(r => r.id));
      
      if (schedulesError) throw schedulesError;
      
      if (!schedulesData) {
        throw new Error('Failed to fetch schedules data');
      }

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
  ): Promise<SaveDataReturn> => {
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
            return roomData as RoomData;
          } else if (action === 'update') {
            const { error: roomUpdateError } = await supabase
              .from('rooms')
              .update({
                status: data.status,
              })
              .eq('id', data.id);
            
            if (roomUpdateError) throw roomUpdateError;
            return true;
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
            return scheduleData as ScheduleData;
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
            return true;
          }
          break;
          
        case 'location':
          if (action === 'create' && orgId) {
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
            return locationData as LocationData;
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
      const result = await saveDataToSupabase('location', 'create', newLocation);
      
      // Check if result is a location object (not boolean or null)
      if (result && typeof result !== 'boolean' && 'id' in result && 'name' in result && 'code' in result) {
        const locationData = result as LocationData;
        
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
      const result = await saveDataToSupabase('room', 'create', roomData);
      
      // Check if result is a room object (not boolean or null)
      if (result && typeof result !== 'boolean' && 'id' in result && 'name' in result) {
        const savedRoom = result as RoomData;
        
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
        
        const scheduleResult = await saveDataToSupabase('schedule', 'create', scheduleData);
        
        // Check if scheduleResult is a schedule object (not boolean or null)
        if (scheduleResult && typeof scheduleResult !== 'boolean' && 'id' in scheduleResult && 'room_id' in scheduleResult) {
          const savedSchedule = scheduleResult as ScheduleData;
          
          const newSchedule: CleaningSchedule = {
            id: savedSchedule.id,
            roomId: savedSchedule.room_id,
            frequency: savedSchedule.frequency as 'hourly' | 'daily' | 'weekly' | 'custom',
            interval_hours: savedSchedule.interval_hours || undefined,
            last_cleaned: savedSchedule.last_cleaned || undefined,
            next_cleaning_due: savedSchedule.next_cleaning_due || undefined,
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
        
        const scheduleResult = await saveDataToSupabase('schedule', 'create', newScheduleData);
        
        // Check if scheduleResult is a schedule object (not boolean or null)
        if (scheduleResult && typeof scheduleResult !== 'boolean' && 'id' in scheduleResult) {
          // We need to check the shape of the result to make TypeScript happy
          if ('room_id' in scheduleResult && 'frequency' in scheduleResult) {
            const savedSchedule = scheduleResult as ScheduleData;
            
            const newSchedule: CleaningSchedule = {
              id: savedSchedule.id,
              roomId: savedSchedule.room_id,
              frequency: savedSchedule.frequency as 'hourly' | 'daily' | 'weekly' | 'custom',
              interval_hours: savedSchedule.interval_hours || undefined,
              last_cleaned: savedSchedule.last_cleaned || undefined,
              next_cleaning_due: savedSchedule.next_cleaning_due || undefined,
            };
            
            setSchedules([...schedules, newSchedule]);
          }
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
                  <Button variant

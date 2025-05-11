
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Using the mock staff data from StaffManager for this example
const staffMembers = [
  { id: 1, name: 'John Doe', position: 'Janitor', cleanings: 145 },
  { id: 2, name: 'Sarah Johnson', position: 'Supervisor', cleanings: 98 },
  { id: 3, name: 'Michael Brown', position: 'Janitor', cleanings: 132 },
  { id: 4, name: 'Emma Wilson', position: 'Janitor', cleanings: 112 },
  { id: 5, name: 'Robert Garcia', position: 'Supervisor', cleanings: 76 },
  { id: 6, name: 'Jennifer Lopez', position: 'Janitor', cleanings: 88 },
  { id: 7, name: 'William Taylor', position: 'Janitor', cleanings: 103 },
  { id: 8, name: 'Olivia Martinez', position: 'Supervisor', cleanings: 67 },
  { id: 9, name: 'James Anderson', position: 'Janitor', cleanings: 91 },
  { id: 10, name: 'Sophia Thomas', position: 'Janitor', cleanings: 79 },
];

const StaffSelector = () => {
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{ id: number; name: string } | null>(null);

  // Load the previously selected staff from localStorage on component mount
  useEffect(() => {
    const savedStaffId = localStorage.getItem('selectedStaffId');
    const savedStaffName = localStorage.getItem('selectedStaffName');
    
    if (savedStaffId && savedStaffName) {
      setSelectedStaff({
        id: parseInt(savedStaffId),
        name: savedStaffName
      });
    }
  }, []);

  // Save the selected staff to localStorage when changed
  useEffect(() => {
    if (selectedStaff) {
      localStorage.setItem('selectedStaffId', selectedStaff.id.toString());
      localStorage.setItem('selectedStaffName', selectedStaff.name);
    }
  }, [selectedStaff]);

  const handleSelectStaff = (staff: { id: number; name: string }) => {
    setSelectedStaff(staff);
    setOpen(false);
    toast.success(`Selected staff: ${staff.name}`);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Staff Selection</CardTitle>
        <CardDescription>
          Select your name from the dropdown. Your selection will be remembered for future sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedStaff ? selectedStaff.name : "Select your name..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search staff..." />
              <CommandList>
                <CommandEmpty>No staff found.</CommandEmpty>
                <CommandGroup>
                  {staffMembers.map((staff) => (
                    <CommandItem
                      key={staff.id}
                      value={staff.name}
                      onSelect={() => handleSelectStaff({ id: staff.id, name: staff.name })}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{staff.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedStaff?.id === staff.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
      {selectedStaff && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            You are signed in as <span className="font-medium text-foreground">{selectedStaff.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedStaff(null);
              localStorage.removeItem('selectedStaffId');
              localStorage.removeItem('selectedStaffName');
              toast.info('Staff selection cleared');
            }}
          >
            Clear
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default StaffSelector;

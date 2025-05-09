
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock staff data
const staffMembers = [
  { id: 1, name: 'John Doe', position: 'Janitor', cleanings: 145 },
  { id: 2, name: 'Sarah Johnson', position: 'Supervisor', cleanings: 98 },
  { id: 3, name: 'Michael Brown', position: 'Janitor', cleanings: 132 },
  { id: 4, name: 'Emma Wilson', position: 'Janitor', cleanings: 112 },
  { id: 5, name: 'Robert Garcia', position: 'Supervisor', cleanings: 76 },
];

const StaffManager = () => {
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('In a real app, this would add a new staff member');
  };

  return (
    <div>
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Staff List</TabsTrigger>
          <TabsTrigger value="add">Add Staff</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                Manage your cleaning staff and track their activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm">
                      <th className="py-3 px-4 text-left font-medium">ID</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Position</th>
                      <th className="py-3 px-4 text-left font-medium">Total Cleanings</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map((staff) => (
                      <tr key={staff.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">{staff.id}</td>
                        <td className="py-3 px-4">{staff.name}</td>
                        <td className="py-3 px-4">{staff.position}</td>
                        <td className="py-3 px-4">{staff.cleanings}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-destructive">
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Staff Member</CardTitle>
              <CardDescription>
                Add a new staff member to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffName">Full Name</Label>
                  <Input id="staffName" placeholder="Enter staff name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" placeholder="e.g., Janitor, Supervisor" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="staff@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="(123) 456-7890" />
                </div>
                
                <Button type="submit" className="w-full">
                  Add Staff Member
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>
                View performance metrics for your cleaning staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-60 border rounded-md border-dashed text-muted-foreground">
                Staff performance charts and analytics coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffManager;

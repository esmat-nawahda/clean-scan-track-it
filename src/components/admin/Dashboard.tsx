
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart } from '@/components/ui/chart';

const Dashboard = () => {
  // For demo purposes, generate mock data
  const recentCleanings = [
    { id: 1, location: 'First Floor Bathroom', staff: 'John Doe', date: '2025-05-09 09:15 AM' },
    { id: 2, location: 'Main Kitchen', staff: 'Sarah Johnson', date: '2025-05-09 10:30 AM' },
    { id: 3, location: 'Main Lobby', staff: 'Michael Brown', date: '2025-05-09 11:45 AM' },
    { id: 4, location: 'Executive Office Suite', staff: 'Emma Wilson', date: '2025-05-09 01:20 PM' },
    { id: 5, location: 'First Floor Bathroom', staff: 'John Doe', date: '2025-05-09 03:05 PM' },
  ];

  // Mock chart data
  const weeklyData = [
    { name: 'Mon', total: 18 },
    { name: 'Tue', total: 25 },
    { name: 'Wed', total: 22 },
    { name: 'Thu', total: 30 },
    { name: 'Fri', total: 28 },
    { name: 'Sat', total: 15 },
    { name: 'Sun', total: 10 },
  ];

  const locationData = [
    { name: 'Bathrooms', total: 35 },
    { name: 'Kitchen', total: 22 },
    { name: 'Lobby', total: 18 },
    { name: 'Offices', total: 25 },
    { name: 'Meeting Rooms', total: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cleanings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,345</div>
            <div className="text-xs text-muted-foreground mt-1">+5.2% from last month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <div className="text-xs text-muted-foreground mt-1">+2 new this month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="text-xs text-muted-foreground mt-1">No change from last month</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Cleaning Activity</CardTitle>
                <CardDescription>
                  Total cleanings performed over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={weeklyData}
                  categories={['total']}
                  colors={['#8B5CF6']}
                  yAxisWidth={40}
                  className="aspect-[4/3]"
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Cleanings by Location</CardTitle>
                <CardDescription>
                  Distribution across different areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={locationData}
                  categories={['total']}
                  colors={['#8B5CF6']}
                  layout="vertical"
                  yAxisWidth={100}
                  className="aspect-[4/3]"
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Cleaning Activities</CardTitle>
              <CardDescription>
                A list of recent cleanings across all locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm">
                      <th className="py-3 px-2 text-left font-medium">ID</th>
                      <th className="py-3 px-2 text-left font-medium">Location</th>
                      <th className="py-3 px-2 text-left font-medium">Staff</th>
                      <th className="py-3 px-2 text-left font-medium">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCleanings.map((cleaning) => (
                      <tr key={cleaning.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">{cleaning.id}</td>
                        <td className="py-3 px-2">{cleaning.location}</td>
                        <td className="py-3 px-2">{cleaning.staff}</td>
                        <td className="py-3 px-2">{cleaning.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                More detailed analytics will be available here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 border rounded-md border-dashed text-muted-foreground">
                Advanced analytics charts and filters coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

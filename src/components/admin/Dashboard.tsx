import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  // Date filtering state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("last7Days");

  // For demo purposes, generate mock data
  const recentCleanings = [
    { id: 1, location: 'First Floor Bathroom', staff: 'John Doe', date: '2025-05-09 09:15 AM' },
    { id: 2, location: 'Main Kitchen', staff: 'Sarah Johnson', date: '2025-05-09 10:30 AM' },
    { id: 3, location: 'Main Lobby', staff: 'Michael Brown', date: '2025-05-09 11:45 AM' },
    { id: 4, location: 'Executive Office Suite', staff: 'Emma Wilson', date: '2025-05-09 01:20 PM' },
    { id: 5, location: 'First Floor Bathroom', staff: 'John Doe', date: '2025-05-09 03:05 PM' },
  ];

  // Mock chart data
  const allWeeklyData = [
    { name: 'Mon', total: 18, date: subDays(new Date(), 6) },
    { name: 'Tue', total: 25, date: subDays(new Date(), 5) },
    { name: 'Wed', total: 22, date: subDays(new Date(), 4) },
    { name: 'Thu', total: 30, date: subDays(new Date(), 3) },
    { name: 'Fri', total: 28, date: subDays(new Date(), 2) },
    { name: 'Sat', total: 15, date: subDays(new Date(), 1) },
    { name: 'Sun', total: 10, date: new Date() },
  ];

  const locationData = [
    { name: 'Bathrooms', total: 35 },
    { name: 'Kitchen', total: 22 },
    { name: 'Lobby', total: 18 },
    { name: 'Offices', total: 25 },
    { name: 'Meeting Rooms', total: 15 },
  ];

  // Filter data based on selected date range
  const filteredWeeklyData = allWeeklyData.filter(item => 
    isWithinInterval(item.date, { start: dateRange.from, end: dateRange.to })
  );

  // Date range presets
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    
    const today = new Date();
    let from = today;
    let to = today;
    
    switch(preset) {
      case "today":
        from = today;
        break;
      case "yesterday":
        from = subDays(today, 1);
        to = subDays(today, 1);
        break;
      case "last2Days":
        from = subDays(today, 2);
        break;
      case "last7Days":
        from = subDays(today, 7);
        break;
      case "last30Days":
        from = subDays(today, 30);
        break;
      case "thisWeek":
        from = startOfWeek(today);
        to = endOfWeek(today);
        break;
      case "lastMonth":
        from = startOfMonth(subDays(today, 30));
        to = endOfMonth(subDays(today, 30));
        break;
      case "custom":
        // Keep the current custom range
        return;
    }
    
    setDateRange({ from, to });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last2Days">Last 2 days</SelectItem>
              <SelectItem value="last7Days">Last 7 days</SelectItem>
              <SelectItem value="last30Days">Last 30 days</SelectItem>
              <SelectItem value="thisWeek">This week</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange(range);
                      setSelectedPreset("custom");
                    }
                  }}
                  numberOfMonths={2}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

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
                <CardTitle>Cleaning Activity</CardTitle>
                <CardDescription>
                  Total cleanings performed during the selected date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredWeeklyData.length > 0 ? filteredWeeklyData : allWeeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={locationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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

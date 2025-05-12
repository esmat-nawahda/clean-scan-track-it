
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  LineChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import RoomAlerts, { Room } from './RoomAlerts';

const Dashboard = () => {
  // Mock data for rooms with cleaning status
  const [rooms, setRooms] = useState<Room[]>([
    { 
      id: '1', 
      name: 'Executive Suite', 
      location: 'Floor 5', 
      templateId: 'template1',
      lastCleaned: '2025-05-08',
      nextCleaningDue: '2025-05-10',
      status: 'overdue'
    },
    { 
      id: '2', 
      name: 'Conference Room A', 
      location: 'Floor 3', 
      templateId: 'template2',
      lastCleaned: '2025-05-09',
      nextCleaningDue: '2025-05-11',
      status: 'needs-cleaning'
    },
    { 
      id: '3', 
      name: 'Main Lobby Bathroom', 
      location: 'Floor 1', 
      templateId: 'template3',
      lastCleaned: '2025-05-07',
      nextCleaningDue: '2025-05-09',
      status: 'overdue'
    },
    { 
      id: '4', 
      name: 'Employee Lounge', 
      location: 'Floor 2', 
      templateId: 'template1',
      lastCleaned: '2025-05-10',
      nextCleaningDue: '2025-05-13',
      status: 'needs-cleaning'
    }
  ]);

  // Handle marking a room as cleaned
  const handleMarkAsCleaned = (roomId: string) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              status: 'clean' as const, 
              lastCleaned: format(new Date(), 'yyyy-MM-dd'),
              nextCleaningDue: format(addDays(new Date(), 3), 'yyyy-MM-dd')
            } 
          : room
      )
    );
  };

  // Helper function to add days to a date
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  // Date filtering state
  const [dateRange, setDateRange] = useState<DateRange | { from: Date; to: Date }>({
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

  // New data for additional metrics
  const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981'];
  
  const staffPerformanceData = [
    { name: 'John Doe', completions: 42, onTime: 39, quality: 4.8 },
    { name: 'Sarah Johnson', completions: 38, onTime: 35, quality: 4.9 },
    { name: 'Michael Brown', completions: 29, onTime: 26, quality: 4.5 },
    { name: 'Emma Wilson', completions: 35, onTime: 33, quality: 4.7 },
    { name: 'Robert Taylor', completions: 25, onTime: 22, quality: 4.6 },
  ];
  
  const issueReportData = [
    { name: 'Supply Shortage', value: 12 },
    { name: 'Equipment Issues', value: 8 },
    { name: 'Area Inaccessible', value: 5 },
    { name: 'Maintenance Needed', value: 15 },
    { name: 'Other', value: 3 },
  ];
  
  const performanceTrendData = [
    { month: 'Jan', completions: 210, issues: 18 },
    { month: 'Feb', completions: 240, issues: 15 },
    { month: 'Mar', completions: 280, issues: 20 },
    { month: 'Apr', completions: 310, issues: 12 },
    { month: 'May', completions: 345, issues: 10 },
  ];

  const incompleteTasksData = [
    { name: 'Executive Suite', value: 3, priority: 'High' },
    { name: 'First Floor Bathroom', value: 2, priority: 'Medium' },
    { name: 'Cafeteria', value: 4, priority: 'High' },
    { name: 'Conference Rooms', value: 1, priority: 'Low' },
  ];

  // Filter data based on selected date range
  const filteredWeeklyData = allWeeklyData.filter(item => 
    dateRange.from && (dateRange.to 
      ? isWithinInterval(item.date, { start: dateRange.from, end: dateRange.to })
      : item.date >= dateRange.from)
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
                    if (range?.from) {
                      setDateRange(range.to ? range : { ...range, to: range.from });
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

      <RoomAlerts rooms={rooms} onMarkAsCleaned={handleMarkAsCleaned} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cleanings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,345</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+5.2%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+2</span>
              <span className="ml-1">new this month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>No change from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issue Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">43</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">-7.3%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
          
          {/* New section - Issues by category */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>
                  Distribution of reported issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={issueReportData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {issueReportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Incomplete Tasks</CardTitle>
                <CardDescription>
                  Tasks that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incompleteTasksData.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.value}</TableCell>
                          <TableCell>
                            <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${
                              item.priority === 'High' 
                                ? 'bg-red-100 text-red-800' 
                                : item.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {item.priority}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <AlertTriangle className="mr-1 h-4 w-4 text-amber-500" />
                              <span className="text-sm">Pending</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Monthly cleaning completions vs issues reported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="completions" 
                      stroke="#8B5CF6" 
                      strokeWidth={2} 
                      name="Cleanings Completed"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="issues" 
                      stroke="#F97316" 
                      strokeWidth={2}
                      name="Issues Reported" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>
                Cleaning metrics by staff member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>On-time %</TableHead>
                      <TableHead>Quality Rating</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffPerformanceData.map((staff) => (
                      <TableRow key={staff.name}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.completions}</TableCell>
                        <TableCell>{Math.round((staff.onTime / staff.completions) * 100)}%</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{staff.quality.toFixed(1)}</span>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full" 
                                style={{ width: `${(staff.quality / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                            <span className="text-sm">Good</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

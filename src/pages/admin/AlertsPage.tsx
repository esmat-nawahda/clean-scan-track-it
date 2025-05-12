
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

const AlertsPage = () => {
  const { toast } = useToast();
  
  // Mock data for alerts
  const alerts = [
    {
      id: 'alert-1',
      title: 'Executive Suite',
      location: 'Floor 5',
      description: 'Cleaning is overdue by 2 days',
      priority: 'high',
      type: 'overdue'
    },
    {
      id: 'alert-2',
      title: 'Conference Room A',
      location: 'Floor 3',
      description: 'Cleaning scheduled for today',
      priority: 'medium',
      type: 'due-soon'
    },
    {
      id: 'alert-3',
      title: 'Main Lobby Bathroom',
      location: 'Floor 1',
      description: 'Cleaning is overdue by 3 days',
      priority: 'high',
      type: 'overdue'
    },
    {
      id: 'alert-4',
      title: 'Employee Lounge',
      location: 'Floor 2',
      description: 'Cleaning scheduled for tomorrow',
      priority: 'low',
      type: 'due-soon'
    }
  ];

  const handleMarkAsCleaned = (alertId: string, title: string) => {
    toast({
      title: "Room marked as cleaned",
      description: `${title} has been marked as cleaned.`,
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alerts</h1>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Alert 
            key={alert.id} 
            variant={alert.type === 'overdue' ? 'destructive' : 'default'}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-l-4 border-l-orange-500"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {alert.type === 'overdue' ? 
                  <AlertTriangle className="h-5 w-5 text-destructive" /> : 
                  <Clock className="h-5 w-5 text-orange-500" />
                }
                <AlertTitle className="text-lg">{alert.title} - {alert.location}</AlertTitle>
                <div className="ml-2">{getPriorityBadge(alert.priority)}</div>
              </div>
              <AlertDescription>{alert.description}</AlertDescription>
            </div>
            <Button
              onClick={() => handleMarkAsCleaned(alert.id, alert.title)}
              className="mt-2 sm:mt-0"
              size="sm"
            >
              <CheckCircle className="mr-1 h-4 w-4" /> Mark as Cleaned
            </Button>
          </Alert>
        ))}
      </div>
      <Toaster />
    </div>
  );
};

export default AlertsPage;

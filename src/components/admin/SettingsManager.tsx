
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SettingsManager = () => {
  const [companyName, setCompanyName] = useState('Demo Company');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderEmails, setReminderEmails] = useState(false);
  const [reportFrequency, setReportFrequency] = useState('weekly');
  const [requirePhoto, setRequirePhoto] = useState(false);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
          <CardDescription>
            Manage your company information and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input 
                id="adminEmail" 
                type="email"
                defaultValue="admin@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input 
                id="supportPhone" 
                defaultValue="(555) 123-4567"
              />
            </div>
            
            <Button type="submit">Save Company Settings</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>
            Configure notifications and system behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for new cleaning submissions
              </p>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminderEmails">Cleaning Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic reminders for scheduled cleanings
              </p>
            </div>
            <Switch 
              id="reminderEmails" 
              checked={reminderEmails}
              onCheckedChange={setReminderEmails}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requirePhoto">Require Photo Proof</Label>
              <p className="text-sm text-muted-foreground">
                Require staff to submit a photo with cleaning records
              </p>
            </div>
            <Switch 
              id="requirePhoto" 
              checked={requirePhoto}
              onCheckedChange={setRequirePhoto}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reportFrequency">Automated Report Frequency</Label>
            <select 
              id="reportFrequency"
              value={reportFrequency}
              onChange={(e) => setReportFrequency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
          
          <Button 
            onClick={() => toast.success('System preferences saved')}
            className="w-full"
          >
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;

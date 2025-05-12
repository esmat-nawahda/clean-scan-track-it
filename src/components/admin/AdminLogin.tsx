
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock client organizations data
const clientOrganizations = [
  { id: 1, name: 'Luxury Grand Hotel', type: 'Hotel' },
  { id: 2, name: 'Westfield Shopping Center', type: 'Mall' },
  { id: 3, name: 'City General Hospital', type: 'Hospital' },
  { id: 4, name: 'Demo Company', type: 'Demo' },
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    if (!selectedClientId) {
      toast.error('Please select a client organization');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the selected client
      const selectedClient = clientOrganizations.find(client => client.id.toString() === selectedClientId);
      
      // Demo credentials for testing
      if (username === 'admin' && password === 'password' && selectedClient) {
        // Store some basic demo auth
        localStorage.setItem('cleantrack-auth', JSON.stringify({
          isLoggedIn: true,
          username: username,
          role: 'admin',
          clientName: selectedClient.name,
          clientId: selectedClient.id,
          clientType: selectedClient.type
        }));
        
        toast.success(`Logged in to ${selectedClient.name}!`);
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the admin dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientOrg">Organization</Label>
            <Select 
              value={selectedClientId} 
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger id="clientOrg" disabled={isLoading}>
                <SelectValue placeholder="Select a client organization" />
              </SelectTrigger>
              <SelectContent>
                {clientOrganizations.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name} ({client.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" size="sm" className="px-0 h-auto font-normal" type="button">
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !selectedClientId}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
      <div className="px-8 pb-6 pt-2 text-center text-sm text-muted-foreground">
        <p>
          For demo purposes, use:
          <br />
          Username: <span className="font-mono">admin</span>
          <br />
          Password: <span className="font-mono">password</span>
        </p>
      </div>
    </Card>
  );
};

export default AdminLogin;

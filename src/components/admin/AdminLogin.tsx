
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Hotel, Hospital, Store, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { ClientOrganization, ClientOrganizationType } from './ClientSelectionGrid';

// Mock client organizations data with their access codes
const clientOrganizations: ClientOrganization[] = [
  { id: 1, name: 'Luxury Grand Hotel', type: 'Hotel' },
  { id: 2, name: 'Westfield Shopping Center', type: 'Mall' },
  { id: 3, name: 'City General Hospital', type: 'Hospital' },
  { id: 4, name: 'Corporate Towers', type: 'Office' },
  { id: 5, name: 'Demo Company', type: 'Demo' },
];

// Client code to organization mapping
const clientCodes: Record<string, number> = {
  'HOTEL001': 1,
  'MALL002': 2,
  'HOSP003': 3,
  'OFFICE004': 4,
  'DEMO005': 5,
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  // Load saved client code from localStorage on component mount
  useEffect(() => {
    const savedClientCode = localStorage.getItem('spotlessqr-client-code');
    if (savedClientCode) {
      setClientCode(savedClientCode);
    }
  }, []);

  const getClientIcon = (type: ClientOrganizationType | undefined) => {
    if (!type) return <Building className="h-6 w-6 text-muted-foreground" />;
    
    switch (type) {
      case 'Hotel':
        return <Hotel className="h-6 w-6 text-blue-500" />;
      case 'Hospital':
        return <Hospital className="h-6 w-6 text-purple-500" />;
      case 'Mall':
        return <Store className="h-6 w-6 text-green-500" />;
      case 'Office':
        return <Building className="h-6 w-6 text-amber-500" />;
      case 'Demo':
        return <Landmark className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleVerifyCode = () => {
    if (!clientCode) {
      toast.error('Please enter a client code');
      return;
    }

    const normalizedCode = clientCode.trim().toUpperCase();
    const clientId = clientCodes[normalizedCode];

    if (clientId) {
      setSelectedClientId(clientId);
      setShowClientInfo(true);
      setIsCodeVerified(true);
      localStorage.setItem('spotlessqr-client-code', normalizedCode);
    } else {
      toast.error('Invalid client code');
      setIsCodeVerified(false);
    }
  };

  const handleChangeCode = () => {
    setShowClientInfo(false);
    setIsCodeVerified(false);
    setSelectedClientId(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    if (!selectedClientId) {
      toast.error('Please enter a valid client code first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the selected client
      const selectedClient = clientOrganizations.find(client => client.id === selectedClientId);
      
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

  const selectedClient = clientOrganizations.find(client => client.id === selectedClientId);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>
          {!showClientInfo 
            ? 'Enter your organization code to continue'
            : 'Enter your credentials to access the admin dashboard'}
        </CardDescription>
      </CardHeader>
      
      {!showClientInfo ? (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientCode">Organization Code</Label>
            <div className="flex gap-2">
              <Input
                id="clientCode"
                placeholder="Enter your organization code"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleVerifyCode}
                disabled={!clientCode}
              >
                Continue
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="text-center text-muted-foreground">
              For demo purposes, use any of these codes: <br/>
              <span className="font-mono">HOTEL001</span>, <span className="font-mono">MALL002</span>, <span className="font-mono">HOSP003</span>, <span className="font-mono">OFFICE004</span>, or <span className="font-mono">DEMO005</span>
            </p>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {selectedClient && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <div className="bg-background p-2 rounded">
                  {getClientIcon(selectedClient.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedClient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient.type}</p>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleChangeCode}
                >
                  Change
                </Button>
              </div>
            )}
            
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
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      )}
      
      {showClientInfo && (
        <div className="px-8 pb-6 pt-2 text-center text-sm text-muted-foreground">
          <p>
            For demo purposes, use:
            <br />
            Username: <span className="font-mono">admin</span>
            <br />
            Password: <span className="font-mono">password</span>
          </p>
        </div>
      )}
    </Card>
  );
};

export default AdminLogin;

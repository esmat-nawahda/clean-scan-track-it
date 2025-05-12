
import React from 'react';
import { Building, Hotel, Hospital, Landmark, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ClientOrganizationType = 'Hotel' | 'Mall' | 'Hospital' | 'Office' | 'Demo';

export interface ClientOrganization {
  id: number;
  name: string;
  type: ClientOrganizationType;
}

interface ClientSelectionGridProps {
  clients: ClientOrganization[];
  onSelect: (clientId: number) => void;
  selectedClientId: number | null;
}

const ClientSelectionGrid: React.FC<ClientSelectionGridProps> = ({
  clients,
  onSelect,
  selectedClientId,
}) => {
  // Function to get icon based on client type
  const getClientIcon = (type: ClientOrganizationType) => {
    switch (type) {
      case 'Hotel':
        return <Hotel className="h-8 w-8 mb-2 text-blue-500" />;
      case 'Hospital':
        return <Hospital className="h-8 w-8 mb-2 text-purple-500" />;
      case 'Mall':
        return <Store className="h-8 w-8 mb-2 text-green-500" />;
      case 'Office':
        return <Building className="h-8 w-8 mb-2 text-amber-500" />;
      case 'Demo':
        return <Landmark className="h-8 w-8 mb-2 text-gray-500" />;
    }
  };

  // Function to get background color based on client type
  const getCardStyle = (type: ClientOrganizationType, isSelected: boolean) => {
    const baseStyles = "p-4 rounded-lg transition-all duration-200 cursor-pointer";
    const selectedStyles = isSelected ? "ring-2 ring-primary transform translate-y-[-4px]" : "hover:translate-y-[-4px]";
    
    switch (type) {
      case 'Hotel':
        return `${baseStyles} ${selectedStyles} bg-blue-50 hover:bg-blue-100`;
      case 'Hospital':
        return `${baseStyles} ${selectedStyles} bg-purple-50 hover:bg-purple-100`;
      case 'Mall':
        return `${baseStyles} ${selectedStyles} bg-green-50 hover:bg-green-100`;
      case 'Office':
        return `${baseStyles} ${selectedStyles} bg-amber-50 hover:bg-amber-100`;
      case 'Demo':
        return `${baseStyles} ${selectedStyles} bg-gray-50 hover:bg-gray-100`;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-center">Select Your Organization</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className={getCardStyle(client.type, client.id === selectedClientId)}
            onClick={() => onSelect(client.id)}
          >
            <div className="flex flex-col items-center text-center">
              {getClientIcon(client.type)}
              <h3 className="font-medium">{client.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{client.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientSelectionGrid;

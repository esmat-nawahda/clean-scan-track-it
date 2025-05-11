
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import StaffSelector from '@/components/admin/StaffSelector';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const locationNameMap: Record<string, string> = {
  'bathroom-floor1': 'First Floor Bathroom',
  'kitchen-main': 'Main Kitchen',
  'lobby-entrance': 'Main Lobby',
  'office-exec': 'Executive Office Suite',
};

const CleaningChecklist = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const locationName = locationNameMap[locationId || ''] || 'Unknown Location';
  const currentDate = format(new Date(), 'PPP');
  const currentTime = format(new Date(), 'p');
  
  const [selectedStaff, setSelectedStaff] = useState<{ id: number; name: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'floors', label: 'Floors cleaned and mopped', checked: false },
    { id: 'surfaces', label: 'All surfaces wiped and sanitized', checked: false },
    { id: 'trash', label: 'Trash emptied and replaced', checked: false },
    { id: 'supplies', label: 'Supplies restocked', checked: false },
    { id: 'fixtures', label: 'Fixtures cleaned and polished', checked: false },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff) {
      toast.error('Please select your name');
      return;
    }
    
    if (checklist.some(item => !item.checked)) {
      toast.error('Please complete all checklist items');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Cleaning record submitted successfully!');
      navigate('/success');
    } catch (error) {
      toast.error('Failed to submit cleaning record');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{locationName}</CardTitle>
          <CardDescription>
            {currentDate} at {currentTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <StaffSelector 
              compact 
              onStaffSelect={setSelectedStaff} 
              className="w-full"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Cleaning Checklist</Label>
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={item.id} 
                  checked={item.checked}
                  onCheckedChange={() => toggleChecklistItem(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes or issues (optional)"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !selectedStaff}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Cleaning Record'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CleaningChecklist;

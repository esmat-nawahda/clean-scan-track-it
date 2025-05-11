
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import StaffSelector from '@/components/admin/StaffSelector';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  color: string;
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
    { id: 'floors', label: 'Floors cleaned and mopped', checked: false, color: 'bg-blue-100 border-blue-300' },
    { id: 'surfaces', label: 'All surfaces wiped and sanitized', checked: false, color: 'bg-green-100 border-green-300' },
    { id: 'trash', label: 'Trash emptied and replaced', checked: false, color: 'bg-amber-100 border-amber-300' },
    { id: 'supplies', label: 'Supplies restocked', checked: false, color: 'bg-purple-100 border-purple-300' },
    { id: 'fixtures', label: 'Fixtures cleaned and polished', checked: false, color: 'bg-pink-100 border-pink-300' },
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
          
          <div className="space-y-4">
            <Label className="text-lg font-medium">Cleaning Checklist</Label>
            <div className="space-y-4">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleChecklistItem(item.id)}
                  className={cn(
                    item.color,
                    "p-4 rounded-lg border-2 transition-all duration-200 shadow-sm",
                    item.checked ? "border-primary" : "",
                    "transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  )}
                >
                  <div className="flex items-center">
                    <div 
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300",
                        item.checked 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "bg-white border-gray-300"
                      )}
                    >
                      {item.checked && <CheckCheck className="h-6 w-6" strokeWidth={2.5} />}
                    </div>
                    <span className="text-lg font-medium">
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
            className="w-full text-lg py-6" 
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

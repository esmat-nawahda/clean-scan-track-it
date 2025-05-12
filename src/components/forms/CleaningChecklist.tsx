
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import StaffSelector from '@/components/admin/StaffSelector';
import { CheckCheck, Phone, AlertCircle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  color: string;
}

const locationNameMap: Record<string, Record<Language, string>> = {
  'bathroom-floor1': {
    en: 'First Floor Bathroom',
    es: 'Baño del Primer Piso',
    fr: 'Toilettes du Premier Étage'
  },
  'kitchen-main': {
    en: 'Main Kitchen',
    es: 'Cocina Principal',
    fr: 'Cuisine Principale'
  },
  'lobby-entrance': {
    en: 'Main Lobby',
    es: 'Vestíbulo Principal',
    fr: 'Hall Principal'
  },
  'office-exec': {
    en: 'Executive Office Suite',
    es: 'Suite de Oficinas Ejecutivas',
    fr: 'Suite de Bureau Exécutif'
  },
};

// Admin contact information
const adminContacts = {
  name: "Facility Manager",
  phone: "(555) 987-6543",
};

const CleaningChecklist = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLanguage();
  
  const locationName = locationId ? 
    (locationNameMap[locationId]?.[language] || locationNameMap[locationId]?.['en']) : 
    t('unknownLocation');
    
  const currentDate = format(new Date(), 'PPP');
  const currentTime = format(new Date(), 'p');
  
  const [selectedStaff, setSelectedStaff] = useState<{ id: number; name: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Initialize checklist based on current language
  useEffect(() => {
    setChecklist([
      { id: 'floors', label: t('floors'), checked: false, color: 'bg-blue-100 border-blue-300' },
      { id: 'surfaces', label: t('surfaces'), checked: false, color: 'bg-green-100 border-green-300' },
      { id: 'trash', label: t('trash'), checked: false, color: 'bg-amber-100 border-amber-300' },
      { id: 'supplies', label: t('supplies'), checked: false, color: 'bg-purple-100 border-purple-300' },
      { id: 'fixtures', label: t('fixtures'), checked: false, color: 'bg-pink-100 border-pink-300' },
    ]);
  }, [language, t]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff) {
      toast.error(t('selectName'));
      return;
    }
    
    if (checklist.some(item => !item.checked)) {
      toast.error(t('completeChecklist'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t('submitSuccess'));
      navigate('/success');
    } catch (error) {
      toast.error(t('submitError'));
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>{locationName}</CardTitle>
            <Select
              value={language}
              onValueChange={(value) => changeLanguage(value as Language)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t(language)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="es">{t('spanish')}</SelectItem>
                <SelectItem value="fr">{t('french')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            {currentDate} at {currentTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t('yourName')}</Label>
            <StaffSelector 
              compact 
              onStaffSelect={setSelectedStaff} 
              className="w-full"
            />
          </div>
          
          <div className="space-y-4">
            <Label className="text-lg font-medium">{t('cleaningChecklist')}</Label>
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
            <Label htmlFor="notes">{t('additionalNotes')}</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={3}
            />
          </div>

          {/* Emergency contact section */}
          <div className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setShowContactInfo(!showContactInfo)}
            >
              <AlertCircle className="h-4 w-4" />
              <span>{t('needAssistance')}</span>
            </Button>
            
            {showContactInfo && (
              <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="font-medium mb-1">
                  {t('facilityManager')}
                </div>
                <a 
                  href={`tel:${adminContacts.phone}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {adminContacts.phone}
                </a>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full text-lg py-6" 
            disabled={isSubmitting || !selectedStaff}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CleaningChecklist;

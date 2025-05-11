
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Copy, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistItem[];
}

interface ChecklistTemplateManagerProps {
  templates: ChecklistTemplate[];
  onTemplateCreate: (template: ChecklistTemplate) => void;
  onTemplateUpdate: (templateId: string, updatedTemplate: ChecklistTemplate) => void;
  onTemplateDelete: (templateId: string) => void;
  onTemplateDuplicate: (templateId: string) => void;
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateId?: string;
}

const ChecklistTemplateManager: React.FC<ChecklistTemplateManagerProps> = ({
  templates,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onTemplateDuplicate,
  onSelectTemplate,
  selectedTemplateId,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<ChecklistTemplate>({
    id: '',
    name: '',
    items: [],
  });
  const [newItemText, setNewItemText] = useState('');
  const [newItemRequired, setNewItemRequired] = useState(false);
  
  const handleCreateTemplate = () => {
    const newTemplate: ChecklistTemplate = {
      ...currentTemplate,
      id: `template-${Date.now()}`,
    };
    
    onTemplateCreate(newTemplate);
    setCurrentTemplate({ id: '', name: '', items: [] });
    setIsCreateDialogOpen(false);
    toast.success('Checklist template created');
  };
  
  const handleUpdateTemplate = () => {
    onTemplateUpdate(currentTemplate.id, currentTemplate);
    setIsEditDialogOpen(false);
    toast.success('Checklist template updated');
  };
  
  const handleAddItem = () => {
    if (!newItemText.trim()) {
      toast.error('Item text is required');
      return;
    }
    
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText,
      required: newItemRequired,
    };
    
    setCurrentTemplate({
      ...currentTemplate,
      items: [...currentTemplate.items, newItem],
    });
    
    setNewItemText('');
    setNewItemRequired(false);
  };
  
  const handleRemoveItem = (itemId: string) => {
    setCurrentTemplate({
      ...currentTemplate,
      items: currentTemplate.items.filter(item => item.id !== itemId),
    });
  };
  
  const handleEditTemplate = (template: ChecklistTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Checklist Templates</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Checklist Template</DialogTitle>
              <DialogDescription>
                Create a template with checklist items that can be assigned to locations
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={currentTemplate.name}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                  placeholder="e.g., Bathroom Cleaning Checklist"
                />
              </div>
              
              <div className="border rounded-md p-4 space-y-4">
                <h4 className="font-medium">Checklist Items</h4>
                {currentTemplate.items.length > 0 ? (
                  <ul className="space-y-2">
                    {currentTemplate.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={item.required} disabled />
                          <span className={item.required ? 'font-medium' : ''}>{item.text}</span>
                          {item.required && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Required</span>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-2">No items added yet</p>
                )}
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Label htmlFor="itemText">Add Item</Label>
                      <Input
                        id="itemText"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="e.g., Clean mirrors"
                      />
                    </div>
                    <div className="pt-6 flex items-center gap-2">
                      <Checkbox 
                        id="itemRequired" 
                        checked={newItemRequired} 
                        onCheckedChange={(checked) => setNewItemRequired(checked === true)}
                      />
                      <Label htmlFor="itemRequired">Required</Label>
                    </div>
                  </div>
                  <Button onClick={handleAddItem} variant="outline" className="w-full">Add Item</Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTemplate} disabled={!currentTemplate.name || currentTemplate.items.length === 0}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={selectedTemplateId === template.id ? 'border-primary' : ''}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{template.items.length} items</p>
              <ul className="mt-2 space-y-1">
                {template.items.slice(0, 3).map((item) => (
                  <li key={item.id} className="text-sm flex items-center gap-2">
                    <Checkbox checked={item.required} disabled />
                    <span>{item.text}</span>
                  </li>
                ))}
                {template.items.length > 3 && (
                  <li className="text-sm text-muted-foreground">+ {template.items.length - 3} more items</li>
                )}
              </ul>
            </CardContent>
            <CardFooter className="gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onSelectTemplate(template.id)}
              >
                {selectedTemplateId === template.id ? 'Selected' : 'Select'}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onTemplateDuplicate(template.id)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onTemplateDelete(template.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Checklist Template</DialogTitle>
            <DialogDescription>
              Update the template name and checklist items
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTemplateName">Template Name</Label>
              <Input
                id="editTemplateName"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
              />
            </div>
            
            <div className="border rounded-md p-4 space-y-4">
              <h4 className="font-medium">Checklist Items</h4>
              {currentTemplate.items.length > 0 ? (
                <ul className="space-y-2">
                  {currentTemplate.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={item.required} disabled />
                        <span className={item.required ? 'font-medium' : ''}>{item.text}</span>
                        {item.required && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Required</span>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-2">No items added yet</p>
              )}
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label htmlFor="editItemText">Add Item</Label>
                    <Input
                      id="editItemText"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="e.g., Clean mirrors"
                    />
                  </div>
                  <div className="pt-6 flex items-center gap-2">
                    <Checkbox 
                      id="editItemRequired" 
                      checked={newItemRequired} 
                      onCheckedChange={(checked) => setNewItemRequired(checked === true)}
                    />
                    <Label htmlFor="editItemRequired">Required</Label>
                  </div>
                </div>
                <Button onClick={handleAddItem} variant="outline" className="w-full">Add Item</Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTemplate} disabled={!currentTemplate.name || currentTemplate.items.length === 0}>
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecklistTemplateManager;

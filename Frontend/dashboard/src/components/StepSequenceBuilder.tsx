import { useState, useRef } from 'react';
import { 
  ArrowLeft,
  Mail, 
  Clock, 
  MessageSquare,
  Phone,
  AlertTriangle,
  CheckCircle,
  Zap,
  Plus,
  Trash2,
  Settings,
  Play,
  Save,
  Users,
  Search,
  Filter,
  Eye,
  Copy,
  Sparkles,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from './ui/drawer';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import type { Lead } from '../App';

interface SequenceStep {
  id: string;
  type: 'email' | 'wait' | 'linkedin' | 'phone' | 'condition' | 'task' | 'webhook';
  name: string;
  settings: any;
  order: number;
}

interface StepSequenceBuilderProps {
  onSave: (sequence: { name: string; description: string; steps: SequenceStep[]; leads: Lead[] }) => void;
  onCancel: () => void;
  leads: Lead[];
  preselectedLeads?: Lead[];
  existingSequence?: any;
}

const stepTypes = [
  {
    type: 'email',
    icon: Mail,
    title: 'Email',
    description: 'Send a personalized email',
    color: 'blue'
  },
  {
    type: 'wait',
    icon: Clock,
    title: 'Wait/Delay',
    description: 'Add a delay before next step',
    color: 'gray'
  },
  {
    type: 'linkedin',
    icon: MessageSquare,
    title: 'LinkedIn Message',
    description: 'Send LinkedIn connection/message',
    color: 'indigo'
  },
  {
    type: 'phone',
    icon: Phone,
    title: 'Schedule Call',
    description: 'Schedule a follow-up call',
    color: 'green'
  },
  {
    type: 'condition',
    icon: AlertTriangle,
    title: 'If/Then Logic',
    description: 'Branch based on conditions',
    color: 'yellow'
  },
  {
    type: 'task',
    icon: CheckCircle,
    title: 'Manual Task',
    description: 'Create a manual task',
    color: 'purple'
  },
  {
    type: 'webhook',
    icon: Zap,
    title: 'Webhook/API',
    description: 'Trigger external system',
    color: 'orange'
  }
];

// Personalization variables
const personalizationVariables = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'company', label: 'Company' },
  { key: 'title', label: 'Job Title' },
  { key: 'industry', label: 'Industry' },
  { key: 'location', label: 'Location' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'linkedinUrl', label: 'LinkedIn URL' },
  { key: 'senderName', label: 'Sender Name' },
  { key: 'senderTitle', label: 'Sender Title' },
  { key: 'senderCompany', label: 'Sender Company' },
  { key: 'currentDate', label: 'Current Date' },
  { key: 'currentTime', label: 'Current Time' }
];

// Condition options for If/Then logic
const conditionOptions = [
  { value: 'email_opened', label: 'Email Opened' },
  { value: 'email_clicked', label: 'Email Clicked' },
  { value: 'email_replied', label: 'Email Replied' },
  { value: 'linkedin_connected', label: 'LinkedIn Connected' },
  { value: 'linkedin_replied', label: 'LinkedIn Replied' },
  { value: 'phone_answered', label: 'Phone Answered' },
  { value: 'task_completed', label: 'Task Completed' },
  { value: 'score_above', label: 'Score Above' },
  { value: 'industry_is', label: 'Industry Is' },
  { value: 'title_contains', label: 'Title Contains' },
  { value: 'company_size', label: 'Company Size' },
  { value: 'days_elapsed', label: 'Days Elapsed' }
];

export function StepSequenceBuilder({ 
  onSave, 
  onCancel, 
  leads, 
  preselectedLeads = [],
  existingSequence 
}: StepSequenceBuilderProps) {
  const [sequenceName, setSequenceName] = useState(existingSequence?.name || '');
  const [sequenceDescription, setSequenceDescription] = useState(existingSequence?.description || '');
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>(preselectedLeads);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<SequenceStep | null>(null);
  const [showStepSettings, setShowStepSettings] = useState(false);
  const [nextStepId, setNextStepId] = useState(1);

  // Refs for settings inputs
  const emailContentRef = useRef<HTMLTextAreaElement>(null);
  const emailSubjectRef = useRef<HTMLInputElement>(null);
  const linkedinMessageRef = useRef<HTMLTextAreaElement>(null);

  // Lead filters state
  const [leadFilters, setLeadFilters] = useState({
    industries: [] as string[],
    locations: [] as string[],
    scoreRange: [0, 100] as [number, number],
    jobTitles: [] as string[],
    hasPhone: null as boolean | null,
    hasLinkedIn: null as boolean | null
  });

  // Extract unique values for filter options
  const filterOptions = {
    industries: Array.from(new Set(leads.map(lead => lead.industry))),
    locations: Array.from(new Set(leads.map(lead => lead.location))),
    jobTitles: Array.from(new Set(leads.map(lead => lead.title)))
  };

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = leadSearchQuery === '' || 
      lead.name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.title.toLowerCase().includes(leadSearchQuery.toLowerCase());
    
    const matchesIndustry = leadFilters.industries.length === 0 || leadFilters.industries.includes(lead.industry);
    const matchesLocation = leadFilters.locations.length === 0 || leadFilters.locations.includes(lead.location);
    const matchesScore = lead.score >= leadFilters.scoreRange[0] && lead.score <= leadFilters.scoreRange[1];
    const matchesJobTitle = leadFilters.jobTitles.length === 0 || leadFilters.jobTitles.some(title => lead.title.toLowerCase().includes(title.toLowerCase()));
    const matchesPhone = leadFilters.hasPhone === null || (leadFilters.hasPhone ? !!lead.phone : !lead.phone);
    const matchesLinkedIn = leadFilters.hasLinkedIn === null || (leadFilters.hasLinkedIn ? !!lead.linkedinUrl : !lead.linkedinUrl);
    
    return matchesSearch && matchesIndustry && matchesLocation && matchesScore && matchesJobTitle && matchesPhone && matchesLinkedIn;
  });

  const updateLeadFilter = (key: string, value: any) => {
    setLeadFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearLeadFilters = () => {
    setLeadFilters({
      industries: [],
      locations: [],
      scoreRange: [0, 100],
      jobTitles: [],
      hasPhone: null,
      hasLinkedIn: null
    });
  };

  const getDefaultSettings = (type: string) => {
    switch (type) {
      case 'email':
        return {
          subject: 'Follow up on our conversation',
          content: `Hi {{firstName}},\n\nI wanted to follow up on our previous conversation...\n\nBest regards,\n{{senderName}}`,
          delay: 0,
          delayUnit: 'days'
        };
      case 'wait':
        return {
          duration: 1,
          unit: 'days'
        };
      case 'linkedin':
        return {
          message: `Hi {{firstName}}, I'd love to connect with you!`,
          connectionRequest: true,
          delay: 0,
          delayUnit: 'days'
        };
      case 'phone':
        return {
          taskTitle: 'Call {{firstName}} at {{company}}',
          duration: 30,
          notes: '',
          delay: 0,
          delayUnit: 'days'
        };
      case 'condition':
        return {
          condition: 'email_opened',
          operator: 'is',
          value: 'true'
        };
      case 'task':
        return {
          taskTitle: 'Manual task for {{firstName}}',
          description: 'Complete this task manually',
          priority: 'medium',
          delay: 0,
          delayUnit: 'days'
        };
      case 'webhook':
        return {
          url: '',
          method: 'POST',
          headers: {},
          payload: {},
          delay: 0,
          delayUnit: 'days'
        };
      default:
        return {};
    }
  };

  const addStep = (type: string) => {
    const stepType = stepTypes.find(s => s.type === type);
    if (!stepType) return;

    const newStep: SequenceStep = {
      id: `step-${nextStepId}`,
      type: type as any,
      name: stepType.title,
      settings: getDefaultSettings(type),
      order: steps.length
    };

    setSteps(prev => [...prev, newStep]);
    setNextStepId(prev => prev + 1);
    setSelectedStep(newStep);
    setShowStepSettings(true);
  };

  const updateStep = (stepId: string, updates: Partial<SequenceStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
    if (selectedStep?.id === stepId) {
      setSelectedStep(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteStep = (stepId: string) => {
    setSteps(prev => {
      const filtered = prev.filter(step => step.id !== stepId);
      // Update order for remaining steps
      return filtered.map((step, index) => ({ ...step, order: index }));
    });
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
      setShowStepSettings(false);
    }
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    setSteps(prev => {
      const stepIndex = prev.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newSteps = [...prev];
      [newSteps[stepIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[stepIndex]];
      
      // Update order
      return newSteps.map((step, index) => ({ ...step, order: index }));
    });
  };

  const toggleLeadSelection = (lead: Lead) => {
    setSelectedLeads(prev => {
      const isSelected = prev.some(l => l.id === lead.id);
      if (isSelected) {
        return prev.filter(l => l.id !== lead.id);
      } else {
        return [...prev, lead];
      }
    });
  };

  const insertPersonalizationVariable = (variable: string, textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newText = before + `{{${variable}}}` + after;
    textarea.value = newText;
    
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Set cursor position after the inserted variable
    const newCursorPos = start + `{{${variable}}}`.length;
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const renderPersonalizationPanel = (textareaRef: React.RefObject<HTMLTextAreaElement>) => (
    <div className="bg-muted/30 rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="font-medium text-sm">Personalization Variables</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {personalizationVariables.map(variable => (
          <Button
            key={variable.key}
            variant="outline"
            size="sm"
            className="justify-start h-8 text-xs"
            onClick={() => insertPersonalizationVariable(variable.key, textareaRef)}
          >
            <span className="font-mono text-blue-600">{`{{${variable.key}}}`}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Click any variable to insert it at your cursor position.
      </p>
    </div>
  );

  const renderStepSettings = () => {
    if (!selectedStep) return null;

    return (
      <Drawer open={showStepSettings} onOpenChange={setShowStepSettings}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure {selectedStep.name}
            </DrawerTitle>
            <DrawerDescription>
              Customize the settings for this sequence step.
            </DrawerDescription>
          </DrawerHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-6">
              {/* Step Name */}
              <div>
                <Label htmlFor="step-name">Step Name</Label>
                <Input
                  id="step-name"
                  value={selectedStep.name}
                  onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                  placeholder="Enter step name..."
                />
              </div>

              {/* Email Step Settings */}
              {selectedStep.type === 'email' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      ref={emailSubjectRef}
                      value={selectedStep.settings?.subject || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, subject: e.target.value }
                      })}
                      placeholder="Enter email subject line..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-content">Email Content</Label>
                    <Textarea
                      id="email-content"
                      ref={emailContentRef}
                      value={selectedStep.settings?.content || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, content: e.target.value }
                      })}
                      placeholder="Enter your email message..."
                      rows={8}
                      className="resize-none"
                    />
                    {renderPersonalizationPanel(emailContentRef)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email-delay">Delay</Label>
                      <Input
                        id="email-delay"
                        type="number"
                        min="0"
                        value={selectedStep.settings?.delay || 0}
                        onChange={(e) => updateStep(selectedStep.id, {
                          settings: { ...selectedStep.settings, delay: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-delay-unit">Unit</Label>
                      <Select
                        value={selectedStep.settings?.delayUnit || 'days'}
                        onValueChange={(value) => updateStep(selectedStep.id, {
                          settings: { ...selectedStep.settings, delayUnit: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Wait Step Settings */}
              {selectedStep.type === 'wait' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wait-duration">Duration</Label>
                      <Input
                        id="wait-duration"
                        type="number"
                        min="1"
                        value={selectedStep.settings?.duration || 1}
                        onChange={(e) => updateStep(selectedStep.id, {
                          settings: { ...selectedStep.settings, duration: parseInt(e.target.value) || 1 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wait-unit">Unit</Label>
                      <Select
                        value={selectedStep.settings?.unit || 'days'}
                        onValueChange={(value) => updateStep(selectedStep.id, {
                          settings: { ...selectedStep.settings, unit: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Step Settings */}
              {selectedStep.type === 'linkedin' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="connection-request"
                      checked={selectedStep.settings?.connectionRequest || false}
                      onCheckedChange={(checked) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, connectionRequest: checked }
                      })}
                    />
                    <Label htmlFor="connection-request">Send connection request first</Label>
                  </div>

                  <div>
                    <Label htmlFor="linkedin-message">LinkedIn Message</Label>
                    <Textarea
                      id="linkedin-message"
                      ref={linkedinMessageRef}
                      value={selectedStep.settings?.message || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, message: e.target.value }
                      })}
                      placeholder="Enter your LinkedIn message..."
                      rows={4}
                      className="resize-none"
                    />
                    {renderPersonalizationPanel(linkedinMessageRef)}
                  </div>
                </div>
              )}

              {/* Condition Step Settings */}
              {selectedStep.type === 'condition' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="condition-type">Condition</Label>
                    <Select
                      value={selectedStep.settings?.condition || 'email_opened'}
                      onValueChange={(value) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, condition: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="condition-value">Value (if applicable)</Label>
                    <Input
                      id="condition-value"
                      value={selectedStep.settings?.value || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, value: e.target.value }
                      })}
                      placeholder="Enter condition value..."
                    />
                  </div>
                </div>
              )}

              {/* Phone Step Settings */}
              {selectedStep.type === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={selectedStep.settings?.taskTitle || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, taskTitle: e.target.value }
                      })}
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="call-duration">Duration (minutes)</Label>
                    <Input
                      id="call-duration"
                      type="number"
                      min="5"
                      value={selectedStep.settings?.duration || 30}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, duration: parseInt(e.target.value) || 30 }
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="call-notes">Notes</Label>
                    <Textarea
                      id="call-notes"
                      value={selectedStep.settings?.notes || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, notes: e.target.value }
                      })}
                      placeholder="Enter call notes or talking points..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Task Step Settings */}
              {selectedStep.type === 'task' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={selectedStep.settings?.taskTitle || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, taskTitle: e.target.value }
                      })}
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={selectedStep.settings?.description || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, description: e.target.value }
                      })}
                      placeholder="Enter task description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={selectedStep.settings?.priority || 'medium'}
                      onValueChange={(value) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, priority: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Webhook Step Settings */}
              {selectedStep.type === 'webhook' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={selectedStep.settings?.url || ''}
                      onChange={(e) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, url: e.target.value }
                      })}
                      placeholder="https://your-webhook-url.com/endpoint"
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhook-method">HTTP Method</Label>
                    <Select
                      value={selectedStep.settings?.method || 'POST'}
                      onValueChange={(value) => updateStep(selectedStep.id, {
                        settings: { ...selectedStep.settings, method: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  };

  const handleSave = () => {
    if (!sequenceName.trim() || steps.length === 0 || selectedLeads.length === 0) {
      return;
    }

    onSave({
      name: sequenceName,
      description: sequenceDescription,
      steps: steps.sort((a, b) => a.order - b.order),
      leads: selectedLeads
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={showLeadSelector ? () => setShowLeadSelector(false) : onCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {showLeadSelector ? 'Select Leads for Sequence' : 'Create Outreach Sequence'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {showLeadSelector 
                ? 'Choose which leads should receive this outreach sequence'
                : 'Build a step-by-step outreach sequence with fixed workflow'
              }
            </p>
          </div>
          {!showLeadSelector && (
            <Button onClick={handleSave} disabled={!sequenceName.trim() || steps.length === 0 || selectedLeads.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Save Sequence
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {showLeadSelector ? (
          /* Lead Selection View */
          <div className="grid grid-cols-12 h-full">
            {/* Left Panel - Filters */}
            <div className="col-span-3 border-r border-border p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Industries</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.industries.map(industry => (
                          <div key={industry} className="flex items-center space-x-2">
                            <Checkbox
                              checked={leadFilters.industries.includes(industry)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateLeadFilter('industries', [...leadFilters.industries, industry]);
                                } else {
                                  updateLeadFilter('industries', leadFilters.industries.filter(i => i !== industry));
                                }
                              }}
                            />
                            <Label className="text-sm">{industry}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Locations</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.locations.map(location => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              checked={leadFilters.locations.includes(location)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateLeadFilter('locations', [...leadFilters.locations, location]);
                                } else {
                                  updateLeadFilter('locations', leadFilters.locations.filter(l => l !== location));
                                }
                              }}
                            />
                            <Label className="text-sm">{location}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Lead Score Range</Label>
                      <Slider
                        value={leadFilters.scoreRange}
                        onValueChange={(value) => updateLeadFilter('scoreRange', value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{leadFilters.scoreRange[0]}</span>
                        <span>{leadFilters.scoreRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Job Titles</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.jobTitles.map(title => (
                          <div key={title} className="flex items-center space-x-2">
                            <Checkbox
                              checked={leadFilters.jobTitles.includes(title)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateLeadFilter('jobTitles', [...leadFilters.jobTitles, title]);
                                } else {
                                  updateLeadFilter('jobTitles', leadFilters.jobTitles.filter(t => t !== title));
                                }
                              }}
                            />
                            <Label className="text-sm">{title}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Contact Info</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={leadFilters.hasPhone === true}
                            onCheckedChange={(checked) => updateLeadFilter('hasPhone', checked ? true : null)}
                          />
                          <Label className="text-sm">Has Phone Number</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={leadFilters.hasLinkedIn === true}
                            onCheckedChange={(checked) => updateLeadFilter('hasLinkedIn', checked ? true : null)}
                          />
                          <Label className="text-sm">Has LinkedIn Profile</Label>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={clearLeadFilters}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Lead Results */}
            <div className="col-span-9 flex flex-col">
              <div className="p-6 border-b border-border">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {filteredLeads.length} leads found
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedLeads.length} selected
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLeads([])}
                      >
                        Clear Selection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLeads(filteredLeads)}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-4">
                  {filteredLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedLeads.some(l => l.id === lead.id) 
                          ? "bg-primary/5 border-primary/20" 
                          : "hover:bg-muted/30"
                      )}
                      onClick={() => toggleLeadSelection(lead)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedLeads.some(l => l.id === lead.id)}
                            onChange={() => toggleLeadSelection(lead)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{lead.name}</span>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {lead.score}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {lead.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {lead.company}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {lead.location}
                            </div>
                            <div className="flex gap-1 mt-2">
                              {lead.phone && (
                                <Badge variant="outline" className="text-xs">
                                  📞
                                </Badge>
                              )}
                              {lead.linkedinUrl && (
                                <Badge variant="outline" className="text-xs">
                                  💼
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {selectedLeads.length} leads selected for sequence
                  </span>
                  <Button onClick={() => setShowLeadSelector(false)}>
                    Apply Selection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Sequence Builder View */
          <div className="h-full flex flex-col">
            {/* Sequence Details */}
            <div className="p-6 border-b border-border">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sequence-name">Sequence Name *</Label>
                  <Input
                    id="sequence-name"
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    placeholder="e.g., Welcome Email Series"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sequence-description">Description</Label>
                  <Textarea
                    id="sequence-description"
                    value={sequenceDescription}
                    onChange={(e) => setSequenceDescription(e.target.value)}
                    placeholder="Describe the purpose of this sequence..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Selected Leads:</span>
                  <Badge variant="secondary">{selectedLeads.length} leads</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLeadSelector(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Select Leads
                  </Button>
                </div>
              </div>
            </div>

            {/* Step Builder */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sequence Steps</h3>
                  <Select onValueChange={addStep}>
                    <SelectTrigger className="w-48">
                      <Plus className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Add Step" />
                    </SelectTrigger>
                    <SelectContent>
                      {stepTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.type} value={type.type}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.title}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {steps.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No steps added yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your sequence by adding your first step
                    </p>
                    <Select onValueChange={addStep}>
                      <SelectTrigger className="w-48 mx-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Add First Step" />
                      </SelectTrigger>
                      <SelectContent>
                        {stepTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.type} value={type.type}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {type.title}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {steps.sort((a, b) => a.order - b.order).map((step, index) => {
                        const stepType = stepTypes.find(t => t.type === step.type);
                        const Icon = stepType?.icon || Play;
                        
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative"
                          >
                            <Card className={cn(
                              "cursor-pointer transition-all duration-200 hover:shadow-md",
                              selectedStep?.id === step.id && "ring-2 ring-primary"
                            )}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                      <span className="text-sm font-medium">{index + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-5 w-5 text-primary" />
                                      <div>
                                        <h4 className="font-medium">{step.name}</h4>
                                        <p className="text-sm text-muted-foreground">{stepType?.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveStep(step.id, 'up')}
                                      disabled={index === 0}
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveStep(step.id, 'down')}
                                      disabled={index === steps.length - 1}
                                    >
                                      ↓
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedStep(step);
                                        setShowStepSettings(true);
                                      }}
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteStep(step.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="pt-0">
                                <div className="text-sm text-muted-foreground">
                                  {step.type === 'email' && step.settings?.subject && (
                                    <div>Subject: {step.settings.subject}</div>
                                  )}
                                  {step.type === 'wait' && step.settings?.duration && (
                                    <div>Wait: {step.settings.duration} {step.settings.unit}</div>
                                  )}
                                  {step.type === 'linkedin' && step.settings?.connectionRequest && (
                                    <div>LinkedIn connection request</div>
                                  )}
                                  {step.type === 'phone' && step.settings?.taskTitle && (
                                    <div>Task: {step.settings.taskTitle}</div>
                                  )}
                                  {step.type === 'condition' && step.settings?.condition && (
                                    <div>Condition: {conditionOptions.find(c => c.value === step.settings.condition)?.label}</div>
                                  )}
                                  {step.type === 'task' && step.settings?.taskTitle && (
                                    <div>Task: {step.settings.taskTitle}</div>
                                  )}
                                  {step.type === 'webhook' && step.settings?.url && (
                                    <div>URL: {step.settings.url}</div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                            
                            {/* Connection Line */}
                            {index < steps.length - 1 && (
                              <div className="flex justify-center py-2">
                                <div className="w-px h-6 bg-border"></div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step Settings Drawer */}
      {renderStepSettings()}
    </div>
  );
}
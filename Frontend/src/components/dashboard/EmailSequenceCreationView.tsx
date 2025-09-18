import { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Users, 
  Calendar, 
  Sparkles, 
  FileText, 
  Edit3,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Bot,
  PenTool,
  Layout,
  Clock,
  Send,
  Eye,
  Play,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import type { Lead, OutreachSequence, OutreachEmail } from '../App';

interface EmailSequenceCreationViewProps {
  leads: Lead[];
  onBack: () => void;
  onCreateSequence: (sequence: Omit<OutreachSequence, 'id' | 'createdAt'>) => void;
  preselectedLeads?: Lead[];
}

type SequenceStep = 'setup' | 'emails' | 'leads' | 'settings' | 'review';
type EmailCreationMode = 'ai' | 'manual' | 'template';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

const sampleTemplates: EmailTemplate[] = [
  {
    id: 'intro-1',
    name: 'Professional Introduction',
    subject: 'Introduction from {{senderName}} at {{senderCompany}}',
    content: 'Hi {{firstName}},\n\nI hope this email finds you well. I\'m {{senderName}} from {{senderCompany}}, and I\'ve been following {{company}}\'s impressive work.\n\nI believe there might be some interesting synergies between our companies. Would you be open to a brief conversation?\n\nBest regards,\n{{senderName}}',
    category: 'introduction'
  },
  {
    id: 'follow-1',
    name: 'Gentle Follow-up',
    subject: 'Following up on our conversation - {{company}}',
    content: 'Hi {{firstName}},\n\nI wanted to follow up on my previous email about potential collaboration between {{company}} and {{senderCompany}}.\n\nWould you have 15 minutes this week to explore how this might benefit {{company}}?\n\nBest regards,\n{{senderName}}',
    category: 'follow-up'
  }
];

export function EmailSequenceCreationView({ 
  leads, 
  onBack, 
  onCreateSequence, 
  preselectedLeads = [] 
}: EmailSequenceCreationViewProps) {
  const [currentStep, setCurrentStep] = useState<SequenceStep>('setup');
  const [sequenceName, setSequenceName] = useState('');
  const [sequenceDescription, setSequenceDescription] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>(preselectedLeads.map(l => l.id));
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [showEmailCreator, setShowEmailCreator] = useState(false);
  const [emailCreationMode, setEmailCreationMode] = useState<EmailCreationMode>('manual');
  const [editingEmailIndex, setEditingEmailIndex] = useState<number | null>(null);
  
  // Email creation form
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailDelay, setEmailDelay] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const steps = [
    { id: 'setup', label: 'Sequence Setup', icon: Settings },
    { id: 'emails', label: 'Create Emails', icon: Mail },
    { id: 'leads', label: 'Select Leads', icon: Users },
    { id: 'settings', label: 'Final Settings', icon: Calendar },
    { id: 'review', label: 'Review & Launch', icon: Check }
  ] as const;

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const isLastStep = getCurrentStepIndex() === steps.length - 1;
  const isFirstStep = getCurrentStepIndex() === 0;

  const canProceed = () => {
    switch (currentStep) {
      case 'setup':
        return sequenceName.trim() && sequenceDescription.trim();
      case 'emails':
        return emails.length > 0;
      case 'leads':
        return selectedLeads.length > 0;
      case 'settings':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    if (isLastStep) {
      handleCreateSequence();
    } else {
      const nextIndex = getCurrentStepIndex() + 1;
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      onBack();
    } else {
      const prevIndex = getCurrentStepIndex() - 1;
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleCreateSequence = () => {
    const selectedLeadObjects = leads.filter(lead => selectedLeads.includes(lead.id));
    
    const sequence: Omit<OutreachSequence, 'id' | 'createdAt'> = {
      name: sequenceName,
      description: sequenceDescription,
      emails,
      leads: selectedLeadObjects,
      status: 'draft'
    };
    
    onCreateSequence(sequence);
  };

  const openEmailCreator = (mode: EmailCreationMode, editIndex?: number) => {
    setEmailCreationMode(mode);
    setEditingEmailIndex(editIndex ?? null);
    
    if (editIndex !== undefined && editIndex !== null) {
      const email = emails[editIndex];
      setEmailSubject(email.subject);
      setEmailContent(email.content);
      setEmailDelay(email.delay);
    } else {
      setEmailSubject('');
      setEmailContent('');
      setEmailDelay(emails.length === 0 ? 0 : 3);
    }
    
    setSelectedTemplate(null);
    setAiPrompt('');
    setShowEmailCreator(true);
  };

  const generateAIEmail = () => {
    // AI email generation simulation
    const aiGeneratedEmails = [
      {
        subject: 'Partnership opportunity with {{company}}',
        content: `Hi {{firstName}},\n\nI've been researching innovative companies in the {{industry}} space and {{company}} caught my attention.\n\nI believe there's a great opportunity for collaboration between our companies. Would you be interested in a brief 15-minute call to explore this?\n\nBest regards,\n{{senderName}}`
      },
      {
        subject: 'Quick question about {{company}}\'s growth',
        content: `Hi {{firstName}},\n\nI noticed {{company}}'s impressive growth trajectory and wanted to reach out.\n\nWe've helped similar companies in your industry streamline their operations and increase efficiency by 30-40%.\n\nWould you be open to a quick chat about how this might apply to {{company}}?\n\nBest,\n{{senderName}}`
      }
    ];
    
    const randomEmail = aiGeneratedEmails[Math.floor(Math.random() * aiGeneratedEmails.length)];
    setEmailSubject(randomEmail.subject);
    setEmailContent(randomEmail.content);
  };

  const useTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    setSelectedTemplate(template);
  };

  const saveEmail = () => {
    const newEmail: OutreachEmail = {
      id: editingEmailIndex !== null ? emails[editingEmailIndex].id : Date.now().toString(),
      subject: emailSubject,
      content: emailContent,
      delay: emailDelay,
      isFollowUp: emails.length > 0 || emailDelay > 0
    };

    if (editingEmailIndex !== null) {
      setEmails(prev => prev.map((email, index) => 
        index === editingEmailIndex ? newEmail : email
      ));
    } else {
      setEmails(prev => [...prev, newEmail]);
    }

    setShowEmailCreator(false);
    setEditingEmailIndex(null);
  };

  const deleteEmail = (index: number) => {
    setEmails(prev => prev.filter((_, i) => i !== index));
  };

  const duplicateEmail = (index: number) => {
    const emailToDuplicate = emails[index];
    const duplicatedEmail: OutreachEmail = {
      ...emailToDuplicate,
      id: Date.now().toString(),
      subject: `${emailToDuplicate.subject} (Copy)`,
      delay: emailToDuplicate.delay + 3
    };
    setEmails(prev => [...prev, duplicatedEmail]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sequence Setup</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sequenceName">Sequence Name *</Label>
                  <Input
                    id="sequenceName"
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    placeholder="e.g., Q4 Partnership Outreach"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sequenceDescription">Description *</Label>
                  <Textarea
                    id="sequenceDescription"
                    value={sequenceDescription}
                    onChange={(e) => setSequenceDescription(e.target.value)}
                    placeholder="Describe the purpose and goals of this email sequence..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'emails':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Email Sequence</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEmailCreator('ai')}
                  className="gap-2"
                >
                  <Bot className="h-4 w-4" />
                  AI Generate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openEmailCreator('template')}
                  className="gap-2"
                >
                  <Layout className="h-4 w-4" />
                  Use Template
                </Button>
                <Button
                  onClick={() => openEmailCreator('manual')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Email
                </Button>
              </div>
            </div>

            {emails.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No emails created yet</h4>
                <p className="text-muted-foreground mb-4">
                  Start building your email sequence using AI, templates, or manual creation
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => openEmailCreator('ai')}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </Button>
                  <Button
                    onClick={() => openEmailCreator('manual')}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Write Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {emails.map((email, index) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {email.isFollowUp ? 'Follow-up Email' : 'Initial Email'}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {email.delay === 0 ? 'Send immediately' : `Send after ${email.delay} days`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEmailCreator('manual', index)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateEmail(index)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEmail(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Subject</span>
                        <p className="text-sm font-medium">{email.subject}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Content Preview</span>
                        <p className="text-sm text-muted-foreground line-clamp-3">{email.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'leads':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Target Leads</h3>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {selectedLeads.length} of {leads.length} leads selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLeads([])}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLeads(leads.map(l => l.id))}
                  >
                    Select All
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-96 border border-border rounded-lg">
              <div className="p-4 space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedLeads.includes(lead.id) 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-card hover:bg-muted/30"
                    )}
                    onClick={() => {
                      setSelectedLeads(prev => 
                        prev.includes(lead.id) 
                          ? prev.filter(id => id !== lead.id)
                          : [...prev, lead.id]
                      );
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{lead.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Score: {lead.score}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lead.title} at {lead.company}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Final Settings</h3>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sequence Timeline</CardTitle>
                    <CardDescription>Review the timing of your email sequence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {emails.map((email, index) => (
                        <div key={email.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{email.subject}</div>
                            <div className="text-xs text-muted-foreground">
                              {email.delay === 0 ? 'Send immediately' : `Day ${email.delay}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review & Launch</h3>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sequence Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <p className="text-sm text-muted-foreground">{sequenceName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground">{sequenceDescription}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-semibold">{emails.length}</div>
                        <div className="text-xs text-muted-foreground">Emails</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-semibold">{selectedLeads.length}</div>
                        <div className="text-xs text-muted-foreground">Leads</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-semibold">
                          {Math.max(...emails.map(e => e.delay), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Days Total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Create Email Sequence</h1>
            <p className="text-sm text-muted-foreground">
              Build an automated email sequence to engage with your leads systematically
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between max-w-3xl">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < getCurrentStepIndex();
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-green-500 bg-green-500 text-white",
                      !isActive && !isCompleted && "border-muted-foreground/30"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive && "text-foreground",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            {isFirstStep ? 'Cancel' : 'Previous'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {isLastStep ? 'Create Sequence' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Email Creator Dialog */}
      <Dialog open={showEmailCreator} onOpenChange={setShowEmailCreator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmailIndex !== null ? 'Edit Email' : 'Create New Email'}
            </DialogTitle>
            <DialogDescription>
              {emailCreationMode === 'ai' && 'Generate email content using AI'}
              {emailCreationMode === 'template' && 'Choose from pre-built templates'}
              {emailCreationMode === 'manual' && 'Write your email manually'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={emailCreationMode} onValueChange={(value) => setEmailCreationMode(value as EmailCreationMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="h-4 w-4" />
                AI Generate
              </TabsTrigger>
              <TabsTrigger value="template" className="gap-2">
                <Layout className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <PenTool className="h-4 w-4" />
                Manual
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai" className="space-y-4">
              <div>
                <Label>AI Email Prompt</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the email you want to create (e.g., 'A professional introduction email for partnership opportunities in the tech industry')"
                  className="mt-1"
                />
                <Button
                  onClick={generateAIEmail}
                  className="mt-2 gap-2"
                  disabled={!aiPrompt.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Email
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedTemplate?.id === template.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => useTemplate(template)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {template.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.subject}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Write your email content manually using the form below.
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email Subject *</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Delay (days)</Label>
                <Input
                  type="number"
                  value={emailDelay}
                  onChange={(e) => setEmailDelay(Number(e.target.value))}
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Email Content *</Label>
              <Textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Write your email content here..."
                className="mt-1 min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use variables: {'{{firstName}}'}, {'{{company}}'}, {'{{title}}'}, {'{{senderName}}'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEmailCreator(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveEmail}
              disabled={!emailSubject.trim() || !emailContent.trim()}
            >
              {editingEmailIndex !== null ? 'Update Email' : 'Add Email'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Phone, Star, Sparkles, Save, Send, Calendar, Clock, Target, Wand2, Copy, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { motion } from 'motion/react';
import { cn } from './ui/utils';
import type { Lead, OutreachEmail } from '../App';

interface LeadOutreachViewProps {
  lead: Lead;
  onBack: () => void;
  onCreateSequence: (emails: OutreachEmail[], name: string, description: string) => void;
}

const emailTemplates = [
  {
    id: 'intro',
    name: 'Introduction',
    subject: 'Quick introduction from [Your Company]',
    content: `Hi {{firstName}},

I hope this email finds you well. I'm reaching out because I noticed your work at {{company}} in the {{industry}} space.

I believe there might be some interesting synergies between what you're doing and our solutions. Would you be open to a brief 15-minute conversation to explore potential collaboration opportunities?

Best regards,
{{senderName}}`
  },
  {
    id: 'value-prop',
    name: 'Value Proposition',
    subject: 'Helping {{company}} achieve [specific goal]',
    content: `Hi {{firstName}},

I've been following {{company}}'s growth in the {{industry}} sector, and I'm impressed by your recent achievements.

Based on your role as {{title}}, I thought you might be interested in learning how we've helped similar companies:
• Increase efficiency by 40%
• Reduce operational costs by 25%
• Streamline workflows

Would you have 15 minutes this week to discuss how this could benefit {{company}}?

Best regards,
{{senderName}}`
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    subject: 'Following up on our conversation opportunity',
    content: `Hi {{firstName}},

I wanted to follow up on my previous email about potential collaboration between {{company}} and our team.

I understand you're likely busy, but I believe this opportunity could provide significant value to {{company}}. Would you be available for a brief call this week?

If now isn't the right time, please let me know when might work better.

Best regards,
{{senderName}}`
  }
];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'consultative', label: 'Consultative' }
];

const lengthOptions = [
  { value: 'short', label: 'Short (50-100 words)' },
  { value: 'medium', label: 'Medium (100-200 words)' },
  { value: 'long', label: 'Long (200+ words)' }
];

export function LeadOutreachView({ lead, onBack, onCreateSequence }: LeadOutreachViewProps) {
  const [sequenceName, setSequenceName] = useState(`Outreach to ${lead.name}`);
  const [sequenceDescription, setSequenceDescription] = useState('');
  const [emails, setEmails] = useState<OutreachEmail[]>([
    {
      id: '1',
      subject: 'Introduction - Partnership Opportunity',
      content: `Hi ${lead.name.split(' ')[0]},\n\nI hope this email finds you well. I'm reaching out because I believe there might be a great partnership opportunity between ${lead.company} and our company.\n\nWould you be open to a brief conversation to explore this further?\n\nBest regards,\n[Your Name]`,
      delay: 0,
      isFollowUp: false
    }
  ]);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const currentEmail = emails[currentEmailIndex];

  const updateCurrentEmail = (field: keyof OutreachEmail, value: string | number) => {
    setEmails(prev => prev.map((email, index) => 
      index === currentEmailIndex ? { ...email, [field]: value } : email
    ));
  };

  const addNewEmail = () => {
    const newEmail: OutreachEmail = {
      id: Date.now().toString(),
      subject: 'Follow-up email',
      content: `Hi ${lead.name.split(' ')[0]},\n\n[Your message here]\n\nBest regards,\n[Your Name]`,
      delay: emails.length === 0 ? 0 : 3,
      isFollowUp: emails.length > 0
    };
    setEmails(prev => [...prev, newEmail]);
    setCurrentEmailIndex(emails.length);
  };

  const removeEmail = (index: number) => {
    if (emails.length === 1) return; // Don't remove the last email
    setEmails(prev => prev.filter((_, i) => i !== index));
    if (currentEmailIndex >= emails.length - 1) {
      setCurrentEmailIndex(Math.max(0, emails.length - 2));
    }
  };

  const generateAIEmail = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI-generated content based on inputs
    const toneAdjectives = {
      professional: 'professional and formal',
      friendly: 'warm and friendly', 
      casual: 'casual and conversational',
      urgent: 'urgent and time-sensitive',
      consultative: 'consultative and advisory'
    };

    const lengthGuide = {
      short: 'brief and concise',
      medium: 'detailed but not lengthy',
      long: 'comprehensive and thorough'
    };

    let generatedSubject = '';
    let generatedContent = '';

    if (aiPrompt.trim()) {
      // Custom prompt-based generation
      generatedSubject = `${aiPrompt.slice(0, 50)}${aiPrompt.length > 50 ? '...' : ''}`;
      generatedContent = `Hi ${lead.name.split(' ')[0]},

${aiPrompt}

I believe this could be valuable for ${lead.company} given your role as ${lead.title} in the ${lead.industry} industry.

Would you be interested in discussing this further?

Best regards,
[Your Name]`;
    } else {
      // Template-based generation
      const template = emailTemplates.find(t => t.id === selectedTemplate) || emailTemplates[0];
      generatedSubject = template.subject.replace(/\[.*?\]/g, 'our solution');
      generatedContent = template.content;
    }

    // Replace placeholders
    generatedContent = generatedContent
      .replace(/{{firstName}}/g, lead.name.split(' ')[0])
      .replace(/{{company}}/g, lead.company)
      .replace(/{{industry}}/g, lead.industry)
      .replace(/{{title}}/g, lead.title)
      .replace(/{{senderName}}/g, '[Your Name]');

    generatedSubject = generatedSubject
      .replace(/{{firstName}}/g, lead.name.split(' ')[0])
      .replace(/{{company}}/g, lead.company)
      .replace(/{{industry}}/g, lead.industry)
      .replace(/{{title}}/g, lead.title);

    updateCurrentEmail('subject', generatedSubject);
    updateCurrentEmail('content', generatedContent);
    
    setIsGenerating(false);
  };

  const useTemplate = (template: typeof emailTemplates[0]) => {
    let content = template.content
      .replace(/{{firstName}}/g, lead.name.split(' ')[0])
      .replace(/{{company}}/g, lead.company)
      .replace(/{{industry}}/g, lead.industry)
      .replace(/{{title}}/g, lead.title)
      .replace(/{{senderName}}/g, '[Your Name]');

    let subject = template.subject
      .replace(/{{firstName}}/g, lead.name.split(' ')[0])
      .replace(/{{company}}/g, lead.company)
      .replace(/{{industry}}/g, lead.industry)
      .replace(/{{title}}/g, lead.title);

    updateCurrentEmail('subject', subject);
    updateCurrentEmail('content', content);
  };

  const handleCreateSequence = () => {
    onCreateSequence(emails, sequenceName, sequenceDescription);
    onBack();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Email Outreach</h1>
            <p className="text-muted-foreground">Create personalized email sequence for {lead.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handleCreateSequence} className="gap-2">
              <Send className="h-4 w-4" />
              Create Sequence
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Lead Info */}
        <div className="w-80 border-r border-border bg-card/30 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Lead Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{lead.name}</CardTitle>
                    <CardDescription>{lead.title}</CardDescription>
                  </div>
                  <Badge variant={lead.score >= 90 ? "default" : "secondary"}>
                    {lead.score}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">{lead.company}</div>
                  <div className="text-muted-foreground">{lead.industry}</div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {lead.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sequence Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sequence Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sequenceName">Sequence Name</Label>
                  <Input
                    id="sequenceName"
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    placeholder="Enter sequence name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sequenceDescription">Description</Label>
                  <Textarea
                    id="sequenceDescription"
                    value={sequenceDescription}
                    onChange={(e) => setSequenceDescription(e.target.value)}
                    placeholder="Describe this sequence..."
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Sequence Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Sequence</CardTitle>
                <CardDescription>
                  {emails.length} email{emails.length !== 1 ? 's' : ''} planned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-3 rounded-md cursor-pointer transition-colors border",
                        currentEmailIndex === index 
                          ? "bg-primary/10 border-primary/20" 
                          : "bg-muted/30 border-transparent hover:bg-muted/50"
                      )}
                      onClick={() => setCurrentEmailIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            index === 0 ? "bg-green-500" : "bg-blue-500"
                          )} />
                          <span className="text-sm font-medium">
                            Email {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {email.delay > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{email.delay}d
                            </Badge>
                          )}
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(index);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {email.subject}
                      </div>
                    </motion.div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewEmail}
                    className="w-full mt-2"
                  >
                    Add Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content - Email Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Email {currentEmailIndex + 1}</CardTitle>
                      <div className="flex items-center gap-2">
                        {currentEmail.delay > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Send after {currentEmail.delay} days
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="delay">Delay (days)</Label>
                        <Input
                          id="delay"
                          type="number"
                          value={currentEmail.delay}
                          onChange={(e) => updateCurrentEmail('delay', parseInt(e.target.value) || 0)}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input
                        id="subject"
                        value={currentEmail.subject}
                        onChange={(e) => updateCurrentEmail('subject', e.target.value)}
                        placeholder="Enter email subject"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Email Content</Label>
                      <Textarea
                        id="content"
                        value={currentEmail.content}
                        onChange={(e) => updateCurrentEmail('content', e.target.value)}
                        placeholder="Write your email content here..."
                        className="min-h-[300px]"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Available variables: {'{firstName}'}, {'{company}'}, {'{title}'}, {'{industry}'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-generate" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Email Generator
                    </CardTitle>
                    <CardDescription>
                      Generate personalized emails using AI based on your requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="aiPrompt">What do you want to communicate?</Label>
                      <Textarea
                        id="aiPrompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., I want to introduce our new SaaS platform that helps companies automate their workflow processes..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tone</Label>
                        <Select value={selectedTone} onValueChange={setSelectedTone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {toneOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Length</Label>
                        <Select value={selectedLength} onValueChange={setSelectedLength}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {lengthOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={generateAIEmail} 
                      disabled={isGenerating}
                      className="w-full h-12"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating Email...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Email with AI
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6 mt-6">
                <div className="grid gap-4">
                  {emailTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader onClick={() => useTemplate(template)}>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Button variant="outline" size="sm">
                            Use Template
                          </Button>
                        </div>
                        <CardDescription>{template.subject}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {template.content.slice(0, 150)}...
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
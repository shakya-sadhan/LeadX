import { useState } from 'react';
import { Target, Send, Star, Users, Mail, Calendar, Clock, Sparkles, ArrowRight, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { motion } from 'motion/react';
import { cn } from './ui/utils';
import type { Lead, OutreachEmail } from '../App';

interface BulkActionsPanelProps {
  starredLeads: Lead[];
  selectedLeads: Lead[];
  onCreateCampaign: (name: string, description: string) => void;
  onCreateOutreach: (name: string, description: string, emails: OutreachEmail[], leads: Lead[]) => void;
  onNavigateToCampaignCreation?: () => void;
  onNavigateToSequenceCreation?: () => void;
}

const emailTemplates = [
  {
    id: 'intro',
    name: 'Introduction Sequence',
    description: 'A warm 3-email introduction sequence',
    emails: [
      {
        id: '1',
        subject: 'Introduction from [Your Company]',
        content: `Hi {{firstName}},\n\nI hope this email finds you well. I'm reaching out because I've been following {{company}}'s work in the {{industry}} space and I'm impressed by what you're doing.\n\nI believe there might be some interesting synergies between our companies. Would you be open to a brief 15-minute conversation?\n\nBest regards,\n[Your Name]`,
        delay: 0,
        isFollowUp: false
      },
      {
        id: '2',
        subject: 'Following up - {{company}} partnership opportunity',
        content: `Hi {{firstName}},\n\nI wanted to follow up on my previous email about potential collaboration between {{company}} and our team.\n\nI understand you're likely busy, but I thought you might be interested in seeing how we've helped similar companies in your industry achieve:\n\n• 40% increase in operational efficiency\n• 25% reduction in costs\n• Streamlined workflows\n\nWould you have 15 minutes this week to explore how this might benefit {{company}}?\n\nBest regards,\n[Your Name]`,
        delay: 3,
        isFollowUp: true
      },
      {
        id: '3',
        subject: 'Final follow-up regarding {{company}}',
        content: `Hi {{firstName}},\n\nThis will be my final follow-up regarding the partnership opportunity I mentioned.\n\nI completely understand if you're not interested or if the timing isn't right. If that's the case, please feel free to let me know.\n\nHowever, if you'd like to learn more about how we can help {{company}}, I'm still happy to chat.\n\nBest regards,\n[Your Name]`,
        delay: 7,
        isFollowUp: true
      }
    ]
  },
  {
    id: 'value-prop',
    name: 'Value Proposition Sequence',
    description: 'Focus on specific business value and benefits',
    emails: [
      {
        id: '1',
        subject: 'How {{company}} can save 30% on operational costs',
        content: `Hi {{firstName}},\n\nI've been researching companies in the {{industry}} sector and noticed that {{company}} has been growing rapidly.\n\nBased on your role as {{title}}, I thought you might be interested in learning how companies like yours have reduced operational costs by 30% while improving efficiency.\n\nWould you be interested in a quick 10-minute call to discuss how this might apply to {{company}}?\n\nBest regards,\n[Your Name]`,
        delay: 0,
        isFollowUp: false
      },
      {
        id: '2',
        subject: 'Case study: How [Similar Company] achieved 30% cost savings',
        content: `Hi {{firstName}},\n\nI wanted to share a quick case study that might be relevant to {{company}}.\n\nWe recently helped [Similar Company], also in the {{industry}} space, achieve:\n\n✓ 30% reduction in operational costs\n✓ 50% faster processing times\n✓ 95% accuracy improvement\n\nI'd be happy to share more details about how they achieved these results and how it might apply to {{company}}.\n\nWould you have 15 minutes for a brief call this week?\n\nBest regards,\n[Your Name]`,
        delay: 5,
        isFollowUp: true
      }
    ]
  }
];

export function BulkActionsPanel({ starredLeads, selectedLeads, onCreateCampaign, onCreateOutreach, onNavigateToCampaignCreation, onNavigateToSequenceCreation }: BulkActionsPanelProps) {
  const [showCampaignSheet, setShowCampaignSheet] = useState(false);
  const [showOutreachSheet, setShowOutreachSheet] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [outreachName, setOutreachName] = useState('');
  const [outreachDescription, setOutreachDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [customEmails, setCustomEmails] = useState<OutreachEmail[]>([]);
  const [activeTab, setActiveTab] = useState('template');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (campaignName.trim()) {
      onCreateCampaign(campaignName, campaignDescription);
      setCampaignName('');
      setCampaignDescription('');
      setShowCampaignSheet(false);
    }
  };

  const handleCreateOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (outreachName.trim() && selectedLeads.length > 0) {
      const emails = activeTab === 'template' ? selectedTemplate.emails : customEmails;
      onCreateOutreach(outreachName, outreachDescription, emails, selectedLeads.map(id => 
        [...starredLeads, ...selectedLeads].find(lead => typeof lead === 'string' ? lead === id : lead.id === id)
      ).filter(Boolean) as Lead[]);
      
      setOutreachName('');
      setOutreachDescription('');
      setShowOutreachSheet(false);
    }
  };

  const addCustomEmail = () => {
    const newEmail: OutreachEmail = {
      id: Date.now().toString(),
      subject: 'Follow-up email',
      content: 'Hi {{firstName}},\n\n[Your message here]\n\nBest regards,\n[Your Name]',
      delay: customEmails.length === 0 ? 0 : 3,
      isFollowUp: customEmails.length > 0
    };
    setCustomEmails(prev => [...prev, newEmail]);
  };

  const updateCustomEmail = (index: number, field: keyof OutreachEmail, value: string | number) => {
    setCustomEmails(prev => prev.map((email, i) => 
      i === index ? { ...email, [field]: value } : email
    ));
  };

  const removeCustomEmail = (index: number) => {
    setCustomEmails(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex gap-2">
      {/* Create Campaign Button */}
      {starredLeads.length > 0 && (
        <>
          <Button
            variant="outline"
            onClick={onNavigateToCampaignCreation || (() => setShowCampaignSheet(true))}
            className="gap-2 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800"
          >
            <Target className="h-4 w-4" />
            Create Campaign ({starredLeads.length})
          </Button>

          <Sheet open={showCampaignSheet} onOpenChange={setShowCampaignSheet}>
            <SheetContent className="w-96 sm:w-[500px]">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">Create Campaign</SheetTitle>
                    <SheetDescription>
                      Organize {starredLeads.length} starred leads into a focused campaign
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Campaign Preview */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Campaign Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Leads</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          {starredLeads.length} leads
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Industries</span>
                        <span className="text-sm font-medium">
                          {Array.from(new Set(starredLeads.map(lead => lead.industry))).length} industries
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Score</span>
                        <span className="text-sm font-medium">
                          {Math.round(starredLeads.reduce((sum, lead) => sum + lead.score, 0) / starredLeads.length)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Leads Preview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Selected Leads</CardTitle>
                    <CardDescription>Leads that will be added to this campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {starredLeads.slice(0, 5).map((lead, index) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{lead.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{lead.title} at {lead.company}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {lead.score}
                          </Badge>
                        </motion.div>
                      ))}
                      {starredLeads.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center py-2">
                          +{starredLeads.length - 5} more leads
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign Form */}
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <Label htmlFor="campaignName">Campaign Name *</Label>
                    <Input
                      id="campaignName"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g., Q4 Enterprise Outreach"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="campaignDescription">Campaign Description</Label>
                    <Textarea
                      id="campaignDescription"
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      placeholder="Describe your campaign goals and strategy..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCampaignSheet(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Create Campaign
                    </Button>
                  </div>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}

      {/* Create Outreach Button */}
      {selectedLeads.length > 0 && (
        <>
          <Button
            onClick={onNavigateToSequenceCreation || (() => setShowOutreachSheet(true))}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
          >
            <Send className="h-4 w-4" />
            Create Outreach ({selectedLeads.length})
          </Button>

          <Sheet open={showOutreachSheet} onOpenChange={setShowOutreachSheet}>
            <SheetContent className="w-[800px] sm:w-[900px] max-w-[90vw]">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">Create Outreach Sequence</SheetTitle>
                    <SheetDescription>
                      Set up automated email sequence for {selectedLeads.length} selected leads
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Outreach Settings */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Sequence Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="outreachName">Sequence Name *</Label>
                        <Input
                          id="outreachName"
                          value={outreachName}
                          onChange={(e) => setOutreachName(e.target.value)}
                          placeholder="e.g., Q4 Partnership Outreach"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="outreachDescription">Description</Label>
                        <Input
                          id="outreachDescription"
                          value={outreachDescription}
                          onChange={(e) => setOutreachDescription(e.target.value)}
                          placeholder="Brief description of this sequence"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Sequence Configuration */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Email Sequence</CardTitle>
                    <CardDescription>Choose how to create your email sequence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="template" className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          Use Template
                        </TabsTrigger>
                        <TabsTrigger value="custom" className="gap-2">
                          <Mail className="h-4 w-4" />
                          Custom Emails
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="template" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          {emailTemplates.map((template) => (
                            <motion.div
                              key={template.id}
                              className={cn(
                                "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                selectedTemplate.id === template.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                              onClick={() => setSelectedTemplate(template)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{template.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {template.emails.length} emails
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {template.description}
                                  </p>
                                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {template.emails.reduce((sum, email) => sum + email.delay, 0)} day sequence
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {template.emails.filter(email => !email.isFollowUp).length} initial + {template.emails.filter(email => email.isFollowUp).length} follow-ups
                                    </div>
                                  </div>
                                </div>
                                {selectedTemplate.id === template.id && (
                                  <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="custom" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          {customEmails.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">No custom emails yet</p>
                              <Button variant="outline" size="sm" onClick={addCustomEmail} className="mt-2">
                                Add First Email
                              </Button>
                            </div>
                          )}
                          
                          {customEmails.map((email, index) => (
                            <Card key={email.id} className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium">
                                    Email {index + 1} {email.isFollowUp && '(Follow-up)'}
                                  </h5>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomEmail(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>Subject Line</Label>
                                    <Input
                                      value={email.subject}
                                      onChange={(e) => updateCustomEmail(index, 'subject', e.target.value)}
                                      placeholder="Email subject"
                                    />
                                  </div>
                                  <div>
                                    <Label>Delay (days)</Label>
                                    <Input
                                      type="number"
                                      value={email.delay}
                                      onChange={(e) => updateCustomEmail(index, 'delay', parseInt(e.target.value) || 0)}
                                      min="0"
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Email Content</Label>
                                  <Textarea
                                    value={email.content}
                                    onChange={(e) => updateCustomEmail(index, 'content', e.target.value)}
                                    placeholder="Write your email content here..."
                                    className="min-h-[100px]"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Variables: {'{{firstName}}'}, {'{{company}}'}, {'{{title}}'}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                          
                          {customEmails.length > 0 && (
                            <Button variant="outline" onClick={addCustomEmail} className="w-full">
                              Add Another Email
                            </Button>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowOutreachSheet(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOutreach} className="flex-1">
                    Create Sequence
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
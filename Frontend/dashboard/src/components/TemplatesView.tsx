import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Star, 
  Search, 
  Filter,
  Mail,
  Sparkles,
  Clock,
  Users,
  Check,
  Download,
  Upload
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'introduction' | 'follow-up' | 'closing' | 'sales' | 'networking' | 'custom';
  industry?: string;
  isFavorite: boolean;
  usage: number;
  lastUsed?: Date;
  createdAt: Date;
  tags: string[];
}

interface TemplatesViewProps {
  onUseTemplate?: (template: EmailTemplate) => void;
}

// Predefined templates
const defaultTemplates: EmailTemplate[] = [
  {
    id: 'intro-1',
    name: 'Professional Introduction',
    subject: 'Introduction from {{senderName}} at {{senderCompany}}',
    content: `Hi {{firstName}},

I hope this email finds you well. I'm {{senderName}} from {{senderCompany}}, and I've been following {{company}}'s impressive work in the {{industry}} space.

I believe there might be some interesting synergies between our companies that could be mutually beneficial. Would you be open to a brief 15-minute conversation to explore potential collaboration opportunities?

I'd be happy to work around your schedule. Please let me know what works best for you.

Best regards,
{{senderName}}
{{senderTitle}}
{{senderCompany}}`,
    category: 'introduction',
    isFavorite: true,
    usage: 45,
    lastUsed: new Date(),
    createdAt: new Date(),
    tags: ['professional', 'collaboration', 'partnership']
  },
  {
    id: 'follow-1',
    name: 'Gentle Follow-up',
    subject: 'Following up on our conversation - {{company}}',
    content: `Hi {{firstName}},

I wanted to follow up on my previous email about potential collaboration between {{company}} and {{senderCompany}}.

I understand you're likely busy, but I thought you might be interested in seeing how we've helped similar companies in your industry achieve:

• 40% increase in operational efficiency
• 25% reduction in costs
• Streamlined workflows and processes

Would you have 15 minutes this week to explore how this might benefit {{company}}? I'm happy to share some relevant case studies.

Best regards,
{{senderName}}`,
    category: 'follow-up',
    isFavorite: false,
    usage: 32,
    lastUsed: new Date(Date.now() - 86400000),
    createdAt: new Date(),
    tags: ['follow-up', 'value-proposition', 'case-studies']
  },
  {
    id: 'sales-1',
    name: 'Value Proposition Focus',
    subject: 'How {{company}} can save 30% on operational costs',
    content: `Hi {{firstName}},

I've been researching companies in the {{industry}} sector and noticed that {{company}} has been growing rapidly. Congratulations on your success!

Based on your role as {{title}}, I thought you might be interested in learning how companies like yours have reduced operational costs by 30% while improving efficiency.

We recently helped [Similar Company] achieve:
✓ 30% reduction in operational costs
✓ 50% faster processing times  
✓ 95% accuracy improvement

Would you be interested in a quick 10-minute call to discuss how this might apply to {{company}}?

Best,
{{senderName}}`,
    category: 'sales',
    isFavorite: true,
    usage: 28,
    createdAt: new Date(),
    tags: ['sales', 'roi', 'case-study', 'cost-savings']
  },
  {
    id: 'network-1',
    name: 'Networking Outreach',
    subject: 'Connecting with fellow {{industry}} professionals',
    content: `Hi {{firstName}},

I came across your profile and was impressed by your work at {{company}}, particularly your experience in {{industry}}.

I'm {{senderName}}, {{senderTitle}} at {{senderCompany}}, and I'm always interested in connecting with fellow professionals who are driving innovation in our space.

I'd love to learn more about the interesting projects you're working on at {{company}}. Would you be open to a brief coffee chat or virtual meeting?

Looking forward to connecting!

Best,
{{senderName}}`,
    category: 'networking',
    isFavorite: false,
    usage: 15,
    createdAt: new Date(),
    tags: ['networking', 'relationship-building', 'industry']
  },
  {
    id: 'close-1',
    name: 'Final Follow-up',
    subject: 'Final follow-up regarding {{company}}',
    content: `Hi {{firstName}},

This will be my final follow-up regarding the opportunity I mentioned for {{company}}.

I completely understand if you're not interested or if the timing isn't right. If that's the case, please feel free to let me know, and I'll respect your decision.

However, if you'd like to learn more about how we can help {{company}} achieve [specific benefit], I'm still happy to chat.

Either way, I wish you and {{company}} continued success.

Best regards,
{{senderName}}`,
    category: 'closing',
    isFavorite: false,
    usage: 22,
    createdAt: new Date(),
    tags: ['final-follow-up', 'respectful', 'closing']
  }
];

export function TemplatesView({ onUseTemplate }: TemplatesViewProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Form states
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateCategory, setTemplateCategory] = useState<EmailTemplate['category']>('custom');
  const [templateTags, setTemplateTags] = useState('');

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    { value: 'introduction', label: 'Introduction', count: templates.filter(t => t.category === 'introduction').length },
    { value: 'follow-up', label: 'Follow-up', count: templates.filter(t => t.category === 'follow-up').length },
    { value: 'sales', label: 'Sales', count: templates.filter(t => t.category === 'sales').length },
    { value: 'networking', label: 'Networking', count: templates.filter(t => t.category === 'networking').length },
    { value: 'closing', label: 'Closing', count: templates.filter(t => t.category === 'closing').length },
    { value: 'custom', label: 'Custom', count: templates.filter(t => t.category === 'custom').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (templateName.trim() && templateSubject.trim() && templateContent.trim()) {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        name: templateName,
        subject: templateSubject,
        content: templateContent,
        category: templateCategory,
        isFavorite: false,
        usage: 0,
        createdAt: new Date(),
        tags: templateTags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      
      // Reset form
      setTemplateName('');
      setTemplateSubject('');
      setTemplateContent('');
      setTemplateCategory('custom');
      setTemplateTags('');
      setShowCreateDialog(false);
    }
  };

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usage: 0,
      createdAt: new Date()
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  const useTemplate = (template: EmailTemplate) => {
    // Update usage count
    setTemplates(prev => prev.map(t =>
      t.id === template.id
        ? { ...t, usage: t.usage + 1, lastUsed: new Date() }
        : t
    ));
    
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  const getCategoryColor = (category: EmailTemplate['category']) => {
    const colors = {
      introduction: 'bg-blue-100 text-blue-800 border-blue-200',
      'follow-up': 'bg-green-100 text-green-800 border-green-200',
      sales: 'bg-purple-100 text-purple-800 border-purple-200',
      networking: 'bg-orange-100 text-orange-800 border-orange-200',
      closing: 'bg-red-100 text-red-800 border-red-200',
      custom: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors.custom;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-card via-card to-card/95 border-b border-border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Email Templates</h1>
              <p className="text-muted-foreground mt-1">
                Create, manage, and use professional email templates for your outreach campaigns
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, subject, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="library" className="h-full flex flex-col">
          <div className="bg-card border-b border-border px-6 py-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="library" className="gap-2">
                <FileText className="h-4 w-4" />
                Template Library
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Star className="h-4 w-4" />
                Favorites ({templates.filter(t => t.isFavorite).length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                Recently Used
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 p-6 overflow-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all'
                    ? "Try adjusting your search or filter criteria."
                    : "Create your first email template to get started."
                  }
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {template.name}
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-1">
                              {template.subject}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(template.id)}
                              className="p-1"
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  template.isFavorite && "fill-yellow-400 text-yellow-400"
                                )}
                              />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={getCategoryColor(template.category)}
                          >
                            {template.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {template.usage} uses
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Preview */}
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-1">Preview:</div>
                          <div className="text-sm line-clamp-3">
                            {template.content}
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowTemplateDetails(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => useTemplate(template)}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                        
                        {/* Secondary Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1"
                            onClick={() => duplicateTemplate(template)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {templates.filter(t => t.isFavorite).map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="mt-1">{template.subject}</CardDescription>
                        </div>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {template.content}
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => useTemplate(template)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              {templates
                .filter(t => t.lastUsed)
                .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
                .slice(0, 10)
                .map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge className={getCategoryColor(template.category)}>
                                {template.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Used {template.usage} times</span>
                              <span>Last used: {template.lastUsed?.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowTemplateDetails(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => useTemplate(template)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Email Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template for your outreach campaigns
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateTemplate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Professional Introduction"
                  required
                />
              </div>
              <div>
                <Label htmlFor="templateCategory">Category</Label>
                <Select value={templateCategory} onValueChange={(value: EmailTemplate['category']) => setTemplateCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="introduction">Introduction</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="templateSubject">Subject Line *</Label>
              <Input
                id="templateSubject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="e.g., Introduction from {{senderName}} at {{senderCompany}}"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use variables: {'{{firstName}}'}, {'{{company}}'}, {'{{senderName}}'}, {'{{senderCompany}}'}
              </p>
            </div>
            
            <div>
              <Label htmlFor="templateContent">Email Content *</Label>
              <Textarea
                id="templateContent"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Write your email template here..."
                className="min-h-[200px]"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use personalization variables like {'{{firstName}}'}, {'{{company}}'}, {'{{title}}'}, etc.
              </p>
            </div>
            
            <div>
              <Label htmlFor="templateTags">Tags (optional)</Label>
              <Input
                id="templateTags"
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
                placeholder="e.g., professional, collaboration, partnership"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate tags with commas to make templates easier to find
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Template Details Sheet */}
      <Sheet open={showTemplateDetails} onOpenChange={setShowTemplateDetails}>
        <SheetContent className="w-96 sm:w-[600px]">
          {selectedTemplate && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedTemplate.name}
                  {selectedTemplate.isFavorite && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </SheetTitle>
                <SheetDescription>
                  {selectedTemplate.category} template • Used {selectedTemplate.usage} times
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Template Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Template Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">CATEGORY</Label>
                        <div className="mt-1">
                          <Badge className={getCategoryColor(selectedTemplate.category)}>
                            {selectedTemplate.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">SUBJECT LINE</Label>
                        <div className="mt-1 p-2 bg-muted/30 rounded text-sm">
                          {selectedTemplate.subject}
                        </div>
                      </div>
                      
                      {selectedTemplate.tags.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">TAGS</Label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedTemplate.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div>
                          <Label className="text-xs text-muted-foreground">USAGE COUNT</Label>
                          <div className="text-lg font-semibold">{selectedTemplate.usage}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">LAST USED</Label>
                          <div className="text-sm">
                            {selectedTemplate.lastUsed?.toLocaleDateString() || 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Template Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Email Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-60 w-full">
                      <div className="whitespace-pre-wrap text-sm p-3 bg-muted/20 rounded border">
                        {selectedTemplate.content}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => useTemplate(selectedTemplate)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => duplicateTemplate(selectedTemplate)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleFavorite(selectedTemplate.id)}
                  >
                    <Star className={cn(
                      "h-4 w-4",
                      selectedTemplate.isFavorite && "fill-yellow-400 text-yellow-400"
                    )} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
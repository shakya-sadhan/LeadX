import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Target, 
  Users, 
  Calendar, 
  Tag, 
  Sparkles, 
  Search, 
  Filter,
  Plus,
  Check,
  ChevronRight,
  Building,
  User,
  Mail,
  MapPin,
  BarChart3,
  Hash,
  Globe,
  Briefcase,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { cn } from './ui/utils';
import type { Lead, Campaign } from '../App';

interface CampaignCreationViewProps {
  leads: Lead[];
  campaignCategories: string[];
  onBack: () => void;
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
}

type CampaignStep = 'details' | 'leads' | 'settings' | 'review';

interface LeadFilters {
  industries: string[];
  locations: string[];
  scoreRange: [number, number];
  jobTitles: string[];
  companyTypes: string[];
  employeeCountRange: [number, number];
  yearFoundedRange: [number, number];
  hasPhone: boolean | null;
  hasLinkedIn: boolean | null;
}

export function CampaignCreationView({ leads, campaignCategories, onBack, onCreateCampaign }: CampaignCreationViewProps) {
  const [currentStep, setCurrentStep] = useState<CampaignStep>('details');
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [priorityLevel, setPriorityLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [campaignTags, setCampaignTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [campaignCategory, setCampaignCategory] = useState('');

  // Enhanced filters
  const [filters, setFilters] = useState<LeadFilters>({
    industries: [],
    locations: [],
    scoreRange: [0, 100],
    jobTitles: [],
    companyTypes: [],
    employeeCountRange: [1, 10000],
    yearFoundedRange: [1900, 2024],
    hasPhone: null,
    hasLinkedIn: null
  });

  // Extract unique values for filter options
  const filterOptions = {
    industries: Array.from(new Set(leads.map(lead => lead.industry))),
    locations: Array.from(new Set(leads.map(lead => lead.location))),
    jobTitles: Array.from(new Set(leads.map(lead => lead.title))),
    companyTypes: ['Startup', 'Enterprise', 'SMB', 'Corporation', 'Non-profit', 'Government'], // Mock data
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = filters.industries.length === 0 || filters.industries.includes(lead.industry);
    const matchesLocation = filters.locations.length === 0 || filters.locations.includes(lead.location);
    const matchesScore = lead.score >= filters.scoreRange[0] && lead.score <= filters.scoreRange[1];
    const matchesJobTitle = filters.jobTitles.length === 0 || filters.jobTitles.some(title => lead.title.toLowerCase().includes(title.toLowerCase()));
    const matchesPhone = filters.hasPhone === null || (filters.hasPhone ? !!lead.phone : !lead.phone);
    const matchesLinkedIn = filters.hasLinkedIn === null || (filters.hasLinkedIn ? !!lead.linkedinUrl : !lead.linkedinUrl);
    
    return matchesSearch && matchesIndustry && matchesLocation && matchesScore && matchesJobTitle && matchesPhone && matchesLinkedIn;
  });

  const selectedLeadObjects = leads.filter(lead => selectedLeads.includes(lead.id));

  const steps = [
    { id: 'details', label: 'Campaign Details', icon: Target },
    { id: 'leads', label: 'Select Leads', icon: Users },
    { id: 'settings', label: 'Campaign Settings', icon: Calendar },
    { id: 'review', label: 'Review & Create', icon: Check }
  ] as const;

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const isLastStep = getCurrentStepIndex() === steps.length - 1;
  const isFirstStep = getCurrentStepIndex() === 0;

  const canProceed = () => {
    switch (currentStep) {
      case 'details':
        return campaignName.trim() && campaignDescription.trim();
      case 'leads':
        return selectedLeads.length > 0;
      case 'settings':
        return campaignGoal.trim();
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    if (isLastStep) {
      handleCreateCampaign();
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

  const handleCreateCampaign = () => {
    const campaign: Omit<Campaign, 'id' | 'createdAt'> = {
      name: campaignName,
      description: campaignDescription,
      leads: selectedLeadObjects,
      goal: campaignGoal,
      priority: priorityLevel,
      tags: campaignTags,
      category: campaignCategory
    };
    
    onCreateCampaign(campaign);
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const addTag = () => {
    if (newTag.trim() && !campaignTags.includes(newTag.trim())) {
      setCampaignTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCampaignTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const clearFilters = () => {
    setFilters({
      industries: [],
      locations: [],
      scoreRange: [0, 100],
      jobTitles: [],
      companyTypes: [],
      employeeCountRange: [1, 10000],
      yearFoundedRange: [1900, 2024],
      hasPhone: null,
      hasLinkedIn: null
    });
  };

  const updateFilter = (key: keyof LeadFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const generateAISuggestions = () => {
    // AI-powered suggestions based on selected leads
    const suggestions = [
      'Q4 Technology Partnership Outreach',
      'Enterprise Software Decision Makers',
      'Fintech Innovation Leaders Campaign',
      'West Coast Startup Expansion'
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setCampaignName(randomSuggestion);
    setCampaignDescription(`AI-generated campaign targeting ${selectedLeadObjects.length} high-value prospects in ${filterOptions.industries.length} industries.`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Campaign Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAISuggestions}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Suggestions
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Q4 Enterprise Outreach Campaign"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="campaignDescription">Description *</Label>
                  <Textarea
                    id="campaignDescription"
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    placeholder="Describe the purpose and goals of this campaign..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'leads':
        return (
          <div className="h-full">
            <div className="grid grid-cols-12 h-full">
              {/* Left Panel - Filters */}
              <div className="col-span-3 border-r border-border p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Lead Filters</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Industries</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {filterOptions.industries.map(industry => (
                            <div key={industry} className="flex items-center space-x-2">
                              <Checkbox
                                checked={filters.industries.includes(industry)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('industries', [...filters.industries, industry]);
                                  } else {
                                    updateFilter('industries', filters.industries.filter(i => i !== industry));
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
                                checked={filters.locations.includes(location)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('locations', [...filters.locations, location]);
                                  } else {
                                    updateFilter('locations', filters.locations.filter(l => l !== location));
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
                          value={filters.scoreRange}
                          onValueChange={(value) => updateFilter('scoreRange', value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{filters.scoreRange[0]}</span>
                          <span>{filters.scoreRange[1]}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-3 block">Job Titles</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {filterOptions.jobTitles.map(title => (
                            <div key={title} className="flex items-center space-x-2">
                              <Checkbox
                                checked={filters.jobTitles.includes(title)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('jobTitles', [...filters.jobTitles, title]);
                                  } else {
                                    updateFilter('jobTitles', filters.jobTitles.filter(t => t !== title));
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
                              checked={filters.hasPhone === true}
                              onCheckedChange={(checked) => updateFilter('hasPhone', checked ? true : null)}
                            />
                            <Label className="text-sm">Has Phone Number</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={filters.hasLinkedIn === true}
                              onCheckedChange={(checked) => updateFilter('hasLinkedIn', checked ? true : null)}
                            />
                            <Label className="text-sm">Has LinkedIn Profile</Label>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Lead Selection */}
              <div className="col-span-9 flex flex-col">
                <div className="p-6 border-b border-border">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Target Leads</h3>
                    
                    {/* Basic Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads by name, company, title, or industry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Active Filters Display */}
                    {(filters.industries.length > 0 || filters.locations.length > 0 || filters.jobTitles.length > 0) && (
                      <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Active filters:</span>
                        {filters.industries.map(industry => (
                          <Badge key={industry} variant="secondary" className="gap-1">
                            {industry}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => updateFilter('industries', filters.industries.filter(i => i !== industry))}
                            />
                          </Badge>
                        ))}
                        {filters.locations.map(location => (
                          <Badge key={location} variant="secondary" className="gap-1">
                            {location}
                            <X 
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => updateFilter('locations', filters.locations.filter(l => l !== location))}
                            />
                          </Badge>
                        ))}
                        {filters.jobTitles.map(title => (
                          <Badge key={title} variant="secondary" className="gap-1">
                            {title}
                            <X 
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => updateFilter('jobTitles', filters.jobTitles.filter(t => t !== title))}
                            />
                          </Badge>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-6 px-2 text-xs"
                        >
                          Clear all
                        </Button>
                      </div>
                    )}

                    {/* Selected count and controls */}
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
                          Clear All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLeads(filteredLeads.map(l => l.id))}
                        >
                          Select All
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leads Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {filteredLeads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        layout
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedLeads.includes(lead.id) 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-card hover:bg-muted/30"
                        )}
                        onClick={() => toggleLeadSelection(lead.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
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
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Campaign Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaignGoal">Campaign Goal *</Label>
                  <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select campaign goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead-generation">Lead Generation</SelectItem>
                      <SelectItem value="partnership">Partnership Development</SelectItem>
                      <SelectItem value="sales">Sales Outreach</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="product-demo">Product Demo</SelectItem>
                      <SelectItem value="market-research">Market Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priorityLevel">Priority Level</Label>
                  <Select value={priorityLevel} onValueChange={(value: 'high' | 'medium' | 'low') => setPriorityLevel(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Campaign Tags</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {campaignTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {campaignTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="campaignCategory">Campaign Category</Label>
                  <Select value={campaignCategory} onValueChange={setCampaignCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select campaign category" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Campaign</h3>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <p className="text-sm text-muted-foreground">{campaignName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground">{campaignDescription}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Goal:</span>
                      <p className="text-sm text-muted-foreground">{campaignGoal}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Priority:</span>
                      <Badge variant={priorityLevel === 'high' ? 'destructive' : priorityLevel === 'medium' ? 'default' : 'secondary'}>
                        {priorityLevel}
                      </Badge>
                    </div>
                    {campaignTags.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {campaignTags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Selected Leads ({selectedLeadObjects.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-semibold">{selectedLeadObjects.length}</div>
                        <div className="text-xs text-muted-foreground">Total Leads</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-semibold">
                          {Math.round(selectedLeadObjects.reduce((sum, lead) => sum + lead.score, 0) / selectedLeadObjects.length) || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                    </div>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {selectedLeadObjects.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{lead.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{lead.company}</span>
                          </div>
                        ))}
                        {selectedLeadObjects.length > 5 && (
                          <div className="text-xs text-muted-foreground">
                            ...and {selectedLeadObjects.length - 5} more leads
                          </div>
                        )}
                      </div>
                    </ScrollArea>
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
            <h1 className="text-xl font-semibold">Create New Campaign</h1>
            <p className="text-sm text-muted-foreground">
              Set up a new outreach campaign to organize and target your leads
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between max-w-2xl">
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
      <div className="flex-1 overflow-hidden p-6">
        <div className={cn(
          "h-full",
          currentStep === 'leads' ? "max-w-none" : "max-w-2xl mx-auto"
        )}>
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
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
            {isLastStep ? 'Create Campaign' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
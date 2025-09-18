import { useState } from 'react';
import { Search, Filter, Star, Mail, Phone, ExternalLink, MessageSquare, Target, ArrowUpDown, ChevronLeft, ChevronRight, Plus, Folder, FolderOpen, Edit2, Trash2, Users, ChevronDown, ChevronRight as ChevronRightIcon, Eye, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { BulkActionsPanel } from './BulkActionsPanel';
import { Separator } from './ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import type { Lead, OutreachSequence, OutreachEmail } from '../App';

interface LeadDashboardProps {
  leads: Lead[];
  leadCategories: string[];
  onToggleStar: (leadId: string) => void;
  onCreateCampaign: (name: string, description: string) => void;
  onCreateOutreach: (preselectedLeads: Lead[]) => void;
  onStartOutreach: (lead: Lead) => void;
  onNavigateToCampaignCreation?: () => void;
  onNavigateToSequenceCreation?: () => void;
  onAddLead: (leadData: Omit<Lead, 'id' | 'isStarred' | 'generatedAt' | 'source'>) => Lead;
  onAddCategory: (categoryName: string) => void;
  onRemoveCategory: (categoryName: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
}

type SortField = 'name' | 'title' | 'company' | 'industry' | 'score' | 'generatedAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'all-leads' | 'categories' | 'chats' | 'table';

export function LeadDashboard({ 
  leads, 
  leadCategories, 
  onToggleStar, 
  onCreateCampaign, 
  onCreateOutreach, 
  onStartOutreach, 
  onNavigateToCampaignCreation, 
  onNavigateToSequenceCreation,
  onAddLead,
  onAddCategory,
  onRemoveCategory,
  onEditCategory
}: LeadDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all');
  
  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('all-leads');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);

  // Dialog states
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [showManageCategoriesDialog, setShowManageCategoriesDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Form states
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    industry: '',
    location: '',
    description: '',
    score: 50,
    tags: '',
    category: '',
    chatTitle: ''
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  const starredLeads = leads.filter(lead => lead.isStarred);
  const industries = Array.from(new Set(leads.map(lead => lead.industry)));

  // Create 3-level hierarchy: Category > Chat Title > Leads
  const createHierarchy = () => {
    const hierarchy: Record<string, Record<string, Lead[]>> = {};
    
    leads.forEach(lead => {
      const category = lead.category || 'Uncategorized';
      const chatTitle = lead.chatTitle || 'Other Leads';
      
      if (!hierarchy[category]) {
        hierarchy[category] = {};
      }
      if (!hierarchy[category][chatTitle]) {
        hierarchy[category][chatTitle] = [];
      }
      
      hierarchy[category][chatTitle].push(lead);
    });
    
    return hierarchy;
  };

  const leadHierarchy = createHierarchy();

  // Filter leads
  const getFilteredLeads = (leadsToFilter: Lead[]) => {
    return leadsToFilter.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIndustry = selectedIndustry === 'all' || lead.industry === selectedIndustry;
      const matchesTab = activeTab === 'all' || (activeTab === 'starred' && lead.isStarred);
      
      return matchesSearch && matchesIndustry && matchesTab;
    });
  };

  const handleSort = (field: SortField, leadsToSort: Lead[]) => {
    return leadsToSort.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleAddLead = () => {
    const tags = newLeadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const leadData = {
      ...newLeadForm,
      tags,
      score: Number(newLeadForm.score)
    };

    onAddLead(leadData);
    
    // Reset form
    setNewLeadForm({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      industry: '',
      location: '',
      description: '',
      score: 50,
      tags: '',
      category: '',
      chatTitle: ''
    });
    
    setShowAddLeadDialog(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  const handleSaveEditCategory = () => {
    if (editingCategory && editCategoryName.trim() !== editingCategory) {
      onEditCategory(editingCategory, editCategoryName.trim());
    }
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const navigateToCategories = () => {
    setViewMode('categories');
    setCurrentCategory(null);
    setCurrentChatTitle(null);
  };

  const navigateToAllLeads = () => {
    setViewMode('all-leads');
    setCurrentCategory(null);
    setCurrentChatTitle(null);
  };

  const navigateToChats = (category: string) => {
    setViewMode('chats');
    setCurrentCategory(category);
    setCurrentChatTitle(null);
  };

  const navigateToTable = (category: string, chatTitle: string) => {
    setViewMode('table');
    setCurrentCategory(category);
    setCurrentChatTitle(chatTitle);
  };

  const renderBreadcrumbs = () => {
    return (
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={navigateToAllLeads}
              className="cursor-pointer hover:text-primary flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              All Leads
            </BreadcrumbLink>
          </BreadcrumbItem>
          {viewMode !== 'all-leads' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {currentCategory ? (
                  <BreadcrumbLink 
                    onClick={navigateToCategories}
                    className="cursor-pointer hover:text-primary"
                  >
                    Folders
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>Folders</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          )}
          {currentCategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {currentChatTitle ? (
                  <BreadcrumbLink 
                    onClick={() => navigateToChats(currentCategory)}
                    className="cursor-pointer hover:text-primary"
                  >
                    {currentCategory}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{currentCategory}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          )}
          {currentChatTitle && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentChatTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  const renderLeadTable = (tableLeads: Lead[]) => {
    const filteredLeads = getFilteredLeads(tableLeads);
    const sortedLeads = handleSort(sortField, filteredLeads);

    if (sortedLeads.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No leads found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or add more leads.
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={sortedLeads.every(lead => selectedLeads.includes(lead.id))}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedLeads(prev => [
                      ...prev,
                      ...sortedLeads.map(lead => lead.id).filter(id => !prev.includes(id))
                    ]);
                  } else {
                    setSelectedLeads(prev => prev.filter(id => !sortedLeads.find(lead => lead.id === id)));
                  }
                }}
              />
            </TableHead>
            <TableHead className="w-8">
              <Star className="h-4 w-4" />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortField('name')}
                className="h-auto p-0"
              >
                Name
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map((lead) => (
            <TableRow
              key={lead.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={(e) => {
                if (e.target instanceof HTMLElement && 
                    (e.target.closest('button') || e.target.closest('input[type="checkbox"]'))) {
                  return;
                }
                setSelectedLead(lead);
                setShowLeadDetails(true);
              }}
            >
              <TableCell>
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={() => handleSelectLead(lead.id)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStar(lead.id)}
                  className={cn(
                    "p-1 h-auto hover:bg-transparent",
                    lead.isStarred && "text-amber-500"
                  )}
                >
                  <Star 
                    className={cn(
                      "h-4 w-4", 
                      lead.isStarred && "fill-current"
                    )} 
                  />
                </Button>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-xs text-muted-foreground">{lead.location}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{lead.title}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{lead.company}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {lead.industry}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={lead.score >= 90 ? "default" : lead.score >= 75 ? "secondary" : "outline"}
                  className="font-medium"
                >
                  {lead.score}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStartOutreach(lead)}
                    className="h-8 w-8 p-0"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  {lead.phone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  {lead.linkedinUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://${lead.linkedinUrl}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderCategoriesView = () => {
    return (
      <div className="space-y-4">
        {Object.entries(leadHierarchy).map(([category, chatTitles]) => {
          const totalCategoryLeads = Object.values(chatTitles).flat();
          const filteredCategoryLeads = getFilteredLeads(totalCategoryLeads);
          
          if (filteredCategoryLeads.length === 0) return null;

          return (
            <Card key={category} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigateToChats(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(chatTitles).length} search sessions • {filteredCategoryLeads.length} leads
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {category !== 'Uncategorized' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCategory(category);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderChatsView = () => {
    if (!currentCategory || !leadHierarchy[currentCategory]) return null;

    const chatTitles = leadHierarchy[currentCategory];

    return (
      <div className="space-y-4">
        {Object.entries(chatTitles).map(([chatTitle, chatLeads]) => {
          const filteredChatLeads = getFilteredLeads(chatLeads);
          if (filteredChatLeads.length === 0) return null;

          return (
            <Card key={chatTitle} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <div>
                      <CardTitle className="text-base">{chatTitle}</CardTitle>
                      <CardDescription className="text-sm">
                        {filteredChatLeads.length} leads
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigateToTable(currentCategory, chatTitle)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View All Leads
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderTableView = () => {
    if (!currentCategory || !currentChatTitle || !leadHierarchy[currentCategory]?.[currentChatTitle]) {
      return null;
    }

    const tableLeads = leadHierarchy[currentCategory][currentChatTitle];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{currentChatTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {tableLeads.length} leads in this chat session
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLeads(prev => [
                  ...prev,
                  ...tableLeads.map(lead => lead.id).filter(id => !prev.includes(id))
                ]);
              }}
            >
              Select All
            </Button>
            <BulkActionsPanel
              starredLeads={starredLeads}
              selectedLeads={leads.filter(lead => selectedLeads.includes(lead.id))}
              onCreateCampaign={onCreateCampaign}
              onCreateOutreach={(name, description, emails, selectedLeadObjects) => {
                onCreateOutreach(selectedLeadObjects);
                setSelectedLeads([]);
              }}
              onNavigateToCampaignCreation={onNavigateToCampaignCreation}
              onNavigateToSequenceCreation={() => {
                const selectedLeadObjects = leads.filter(lead => selectedLeads.includes(lead.id));
                onNavigateToSequenceCreation && onNavigateToSequenceCreation();
                onCreateOutreach(selectedLeadObjects);
                setSelectedLeads([]);
              }}
            />
          </div>
        </div>
        
        {renderLeadTable(tableLeads)}
      </div>
    );
  };

  const renderAllLeadsView = () => {
    const allLeads = getFilteredLeads(leads);
    
    return (
      <div className="space-y-6">
        {/* All Leads Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">All Leads</h3>
              <p className="text-sm text-muted-foreground">
                {allLeads.length} leads • {selectedLeads.length} selected
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLeads(
                    selectedLeads.length === allLeads.length 
                      ? [] 
                      : allLeads.map(lead => lead.id)
                  );
                }}
              >
                {selectedLeads.length === allLeads.length ? 'Deselect All' : 'Select All'}
              </Button>
              <BulkActionsPanel
                starredLeads={starredLeads}
                selectedLeads={leads.filter(lead => selectedLeads.includes(lead.id))}
                onCreateCampaign={onCreateCampaign}
                onCreateOutreach={(name, description, emails, selectedLeadObjects) => {
                  onCreateOutreach(selectedLeadObjects);
                  setSelectedLeads([]);
                }}
                onNavigateToCampaignCreation={onNavigateToCampaignCreation}
                onNavigateToSequenceCreation={() => {
                  const selectedLeadObjects = leads.filter(lead => selectedLeads.includes(lead.id));
                  onNavigateToSequenceCreation && onNavigateToSequenceCreation();
                  onCreateOutreach(selectedLeadObjects);
                  setSelectedLeads([]);
                }}
              />
            </div>
          </div>
          
          {renderLeadTable(allLeads)}
        </div>

        {/* Folder Organization Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Organize by Folders</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManageCategoriesDialog(true)}
              className="gap-2"
            >
              <Folder className="h-4 w-4" />
              Manage Folders
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(leadHierarchy).map(([category, chatTitles]) => {
              const totalCategoryLeads = Object.values(chatTitles).flat();
              
              if (totalCategoryLeads.length === 0) return null;

              return (
                <Card key={category} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigateToChats(category)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">{category}</CardTitle>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Total Leads:</span>
                        <span className="font-medium">{totalCategoryLeads.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Search Sessions:</span>
                        <span className="font-medium">{Object.keys(chatTitles).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Score:</span>
                        <span className="font-medium">
                          {totalCategoryLeads.length > 0 
                            ? Math.round(totalCategoryLeads.reduce((sum, lead) => sum + lead.score, 0) / totalCategoryLeads.length)
                            : 0
                          }/100
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with stats and actions */}
      <div className="p-6 bg-card/50 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Lead Database</h2>
            <p className="text-sm text-muted-foreground">
              {leads.length} total leads • {starredLeads.length} starred • {selectedLeads.length} selected
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddLeadDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManageCategoriesDialog(true)}
              className="gap-2"
            >
              <Folder className="h-4 w-4" />
              Manage Folders
            </Button>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        {viewMode !== 'categories' && renderBreadcrumbs()}
        
        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={activeTab} onValueChange={(value: 'all' | 'starred') => {
            setActiveTab(value);
            setSelectedLeads([]);
          }}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="gap-2">
                All Leads ({leads.length})
              </TabsTrigger>
              <TabsTrigger value="starred" className="gap-2">
                <Star className="h-4 w-4" />
                Starred Leads ({starredLeads.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Search and filters */}
        {(viewMode === 'table' || viewMode === 'all-leads') && (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 'starred' ? 'starred ' : ''}leads by name, company, title, or location...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'categories' && renderCategoriesView()}
        {viewMode === 'chats' && renderChatsView()}
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'all-leads' && renderAllLeadsView()}
      </div>

      {/* Lead detail drawer */}
      <Sheet open={showLeadDetails} onOpenChange={(open) => {
        setShowLeadDetails(open);
        if (!open) setSelectedLead(null);
      }}>
        <SheetContent side="right" className="w-96 sm:w-[500px] bg-card border-border overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader className="pb-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <SheetTitle className="text-xl font-medium">{selectedLead.name}</SheetTitle>
                    <SheetDescription className="text-base mt-1 text-muted-foreground">
                      {selectedLead.title} at {selectedLead.company}
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge 
                        variant={selectedLead.score >= 90 ? "default" : selectedLead.score >= 75 ? "secondary" : "outline"}
                        className="font-medium"
                      >
                        Score: {selectedLead.score}/100
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedLead.industry}
                      </Badge>
                      {selectedLead.category && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedLead.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStar(selectedLead.id)}
                    className={cn(
                      "p-2 h-auto hover:bg-accent rounded-md transition-colors",
                      selectedLead.isStarred && "text-amber-500 bg-amber-50 hover:bg-amber-100"
                    )}
                  >
                    <Star 
                      className={cn(
                        "h-5 w-5", 
                        selectedLead.isStarred && "fill-current"
                      )} 
                    />
                  </Button>
                </div>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Contact Actions */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/10">
                  <h4 className="font-medium mb-4 text-primary">Quick Actions</h4>
                  <div className="space-y-3">
                    <Button
                      className="w-full h-12 font-medium shadow-sm hover:shadow-md transition-all"
                      onClick={() => onStartOutreach(selectedLead)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Start Email Campaign
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLead.phone && (
                        <Button
                          variant="outline"
                          className="h-10 font-medium"
                          onClick={() => window.open(`tel:${selectedLead.phone}`, '_blank')}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      )}
                      
                      {selectedLead.linkedinUrl && (
                        <Button
                          variant="outline"
                          className="h-10 font-medium"
                          onClick={() => window.open(`https://${selectedLead.linkedinUrl}`, '_blank')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{selectedLead.email}</div>
                        <div className="text-xs text-muted-foreground">Primary Email</div>
                      </div>
                    </div>
                    
                    {selectedLead.phone && (
                      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                        <div className="h-8 w-8 bg-blue-500/10 rounded-md flex items-center justify-center">
                          <Phone className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{selectedLead.phone}</div>
                          <div className="text-xs text-muted-foreground">Phone Number</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="h-8 w-8 bg-orange-500/10 rounded-md flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{selectedLead.location}</div>
                        <div className="text-xs text-muted-foreground">Location</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    Company Details
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Company</div>
                        <div className="text-sm font-medium mt-1">{selectedLead.company}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Industry</div>
                        <div className="text-sm font-medium mt-1">{selectedLead.industry}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Position</div>
                      <div className="text-sm font-medium mt-1">{selectedLead.title}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Added on</div>
                      <div className="text-sm font-medium mt-1">{selectedLead.generatedAt.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                    </div>
                    {selectedLead.source && (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Source</div>
                        <div className="text-sm font-medium mt-1">{selectedLead.source}</div>
                      </div>
                    )}
                    {selectedLead.chatTitle && (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Chat Session</div>
                        <div className="text-sm font-medium mt-1">{selectedLead.chatTitle}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lead Profile */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                    Lead Profile
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedLead.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    Tags & Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new lead entry in your database
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter lead name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter job title"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newLeadForm.location}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={newLeadForm.industry}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Enter industry"
                />
              </div>
              <div>
                <Label htmlFor="category">Folder</Label>
                <Select 
                  value={newLeadForm.category} 
                  onValueChange={(value) => setNewLeadForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="chatTitle">Chat Title</Label>
              <Input
                id="chatTitle"
                value={newLeadForm.chatTitle}
                onChange={(e) => setNewLeadForm(prev => ({ ...prev, chatTitle: e.target.value }))}
                placeholder="Enter chat session title"
              />
            </div>
            
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={newLeadForm.linkedinUrl}
                onChange={(e) => setNewLeadForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                placeholder="Enter LinkedIn profile URL"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newLeadForm.description}
                onChange={(e) => setNewLeadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter lead description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newLeadForm.tags}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., CEO, Fintech, Hot Lead"
                />
              </div>
              <div>
                <Label htmlFor="score">Lead Score (1-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="1"
                  max="100"
                  value={newLeadForm.score}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, score: parseInt(e.target.value) || 50 }))}
                  placeholder="Enter lead score"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLeadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddLead}
              disabled={!newLeadForm.name || !newLeadForm.email}
            >
              Add Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={showManageCategoriesDialog} onOpenChange={setShowManageCategoriesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Lead Folders</DialogTitle>
            <DialogDescription>
              Add, edit, or remove lead folders to organize your database
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCategory">Add New Folder</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter folder name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label>Existing Folders</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {leadCategories.map(category => (
                  <div key={category} className="flex items-center justify-between p-2 border rounded-md">
                    {editingCategory === category ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEditCategory();
                            } else if (e.key === 'Escape') {
                              handleCancelEditCategory();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEditCategory}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-600"
                        >
                          ✓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEditCategory}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-600"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveCategory(category)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowManageCategoriesDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
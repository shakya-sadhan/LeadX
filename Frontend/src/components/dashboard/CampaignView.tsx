import { useState } from 'react';
import { Target, Calendar, Users, Mail, ExternalLink, MoreVertical, TrendingUp, FolderOpen, Plus, Folder, Edit2, Trash2, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import { CampaignDetailView } from './CampaignDetailView';
import type { Campaign } from '../App';

interface CampaignViewProps {
  campaigns: Campaign[];
  campaignCategories: string[];
  onCreateCampaign?: () => void;
  onAddCategory: (categoryName: string) => void;
  onRemoveCategory: (categoryName: string) => void;
  onViewCampaign?: (campaign: Campaign) => void;
  onBack?: () => void;
  isDetailView?: boolean;
}

type ViewMode = 'grouped' | 'status';

export function CampaignView({ campaigns, campaignCategories, onCreateCampaign, onAddCategory, onRemoveCategory, onViewCampaign, onBack, isDetailView }: CampaignViewProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(campaignCategories));
  
  // Dialog states
  const [showManageCategoriesDialog, setShowManageCategoriesDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAverageScore = (campaign: Campaign) => {
    if (campaign.leads.length === 0) return 0;
    const totalScore = campaign.leads.reduce((sum, lead) => sum + lead.score, 0);
    return Math.round(totalScore / campaign.leads.length);
  };

  // Group campaigns by purpose/goal instead of categories
  const groupedCampaigns = campaigns.reduce((acc, campaign) => {
    const purpose = campaign.goal || 'Other';
    const purposeLabel = purpose.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (!acc[purposeLabel]) {
      acc[purposeLabel] = [];
    }
    acc[purposeLabel].push(campaign);
    return acc;
  }, {} as Record<string, Campaign[]>);

  // Remove the uncategorized campaigns logic since we're grouping by goal
  // const uncategorizedCampaigns = campaigns.filter(campaign => !campaign.category);
  // if (uncategorizedCampaigns.length > 0) {
  //   groupedCampaigns['Uncategorized'] = uncategorizedCampaigns;
  // }

  // Categorize campaigns by status (original grouping)
  const statusCategorizedCampaigns = {
    active: campaigns.filter(c => c.priority === 'high' || (!c.priority && c.leads.length > 0)),
    planning: campaigns.filter(c => c.priority === 'medium' || c.leads.length === 0),
    completed: campaigns.filter(c => c.priority === 'low'),
    recent: campaigns.filter(c => {
      const daysSinceCreated = (new Date().getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 7;
    })
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const renderCampaignCard = (campaign: Campaign, index: number) => (
    <motion.div
      key={campaign.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200 group cursor-pointer"
            onClick={() => onViewCampaign && onViewCampaign(campaign)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base leading-tight">{campaign.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                Created {formatDate(campaign.createdAt)}
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onViewCampaign && onViewCampaign(campaign);
                }}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent onClick={(e) => e.stopPropagation()}>
          {campaign.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {campaign.description}
            </p>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{campaign.leads.length} leads</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Avg {getAverageScore(campaign)}/100
                </Badge>
                {campaign.priority && (
                  <Badge 
                    variant={campaign.priority === 'high' ? 'destructive' : campaign.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {campaign.priority}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Created {formatDate(campaign.createdAt)}
              </span>
            </div>

            {campaign.category && (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {campaign.category}
                </Badge>
              </div>
            )}

            {campaign.tags && campaign.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {campaign.tags.slice(0, 2).map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {campaign.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{campaign.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewCampaign && onViewCampaign(campaign);
              }}
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const emails = campaign.leads.map(lead => lead.email).join(',');
                window.open(`mailto:${emails}`, '_blank');
              }}
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCampaignGrid = (campaignList: Campaign[], emptyMessage: string) => {
    if (campaignList.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaignList.map((campaign, index) => renderCampaignCard(campaign, index))}
      </div>
    );
  };

  const renderGroupedView = () => {
    return (
      <div className="space-y-4">
        {Object.entries(groupedCampaigns).map(([category, categoryCampaigns]) => {
          const isExpanded = expandedCategories.has(category);

          if (categoryCampaigns.length === 0) return null;

          return (
            <Card key={category} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleCategoryExpansion(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <FolderOpen className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Folder className="h-5 w-5 text-blue-500" />
                      )}
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {categoryCampaigns.length} campaigns
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-0">
                      {renderCampaignGrid(categoryCampaigns, `No campaigns in ${category}.`)}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderStatusView = () => {
    return (
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Active ({statusCategorizedCampaigns.active.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent ({statusCategorizedCampaigns.recent.length})
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Planning ({statusCategorizedCampaigns.planning.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Completed ({statusCategorizedCampaigns.completed.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="active" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Active Campaigns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                High-priority campaigns and those with active leads
              </p>
              {renderCampaignGrid(statusCategorizedCampaigns.active, "No active campaigns. Create a high-priority campaign to get started.")}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Campaigns created in the last 7 days
              </p>
              {renderCampaignGrid(statusCategorizedCampaigns.recent, "No recent campaigns. Create a new campaign to see it here.")}
            </div>
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Planning Phase</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Campaigns in development or with medium priority
              </p>
              {renderCampaignGrid(statusCategorizedCampaigns.planning, "No campaigns in planning. Move campaigns here for future execution.")}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Completed Campaigns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Finished campaigns and archived projects
              </p>
              {renderCampaignGrid(statusCategorizedCampaigns.completed, "No completed campaigns yet. Mark campaigns as completed when done.")}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {isDetailView && campaigns.length === 1 ? (
        <CampaignDetailView
          campaign={campaigns[0]}
          onBack={onBack}
        />
      ) : (
        <>
          <div className="p-6 bg-card/50 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Campaigns</h2>
                <p className="text-sm text-muted-foreground">
                  {campaigns.length} campaigns • {campaigns.reduce((sum, c) => sum + c.leads.length, 0)} total leads
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onCreateCampaign && (
                  <Button onClick={onCreateCampaign} className="gap-2">
                    <Target className="h-4 w-4" />
                    Create Campaign
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManageCategoriesDialog(true)}
                  className="gap-2"
                >
                  <Folder className="h-4 w-4" />
                  Manage Categories
                </Button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grouped')}
              >
                <Folder className="h-4 w-4 mr-2" />
                By Purpose
              </Button>
              <Button
                variant={viewMode === 'status' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('status')}
              >
                <Target className="h-4 w-4 mr-2" />
                By Status
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign to organize and target your leads effectively.
                </p>
                {onCreateCampaign && (
                  <Button onClick={onCreateCampaign} className="gap-2">
                    <Target className="h-4 w-4" />
                    Create Your First Campaign
                  </Button>
                )}
              </div>
            ) : (
              viewMode === 'grouped' ? renderGroupedView() : renderStatusView()
            )}
          </div>
        </>
      )}

      {/* Manage Categories Dialog */}
      <Dialog open={showManageCategoriesDialog} onOpenChange={setShowManageCategoriesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Campaign Categories</DialogTitle>
            <DialogDescription>
              Add or remove campaign categories to organize your campaigns
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCategory">Add New Category</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
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
              <Label>Existing Categories</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {campaignCategories.map(category => (
                  <div key={category} className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-sm">{category}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveCategory(category)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
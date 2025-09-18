import { useState } from 'react';
import { ArrowLeft, Users, Calendar, Target, Mail, Phone, ExternalLink, MessageSquare, Edit2, Trash2, MoreVertical, Star, TrendingUp, Filter, Search, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import type { Campaign, Lead } from '../App';

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
  onToggleStar?: (leadId: string) => void;
  onStartOutreach?: (lead: Lead) => void;
}

type SortField = 'name' | 'title' | 'company' | 'industry' | 'score' | 'generatedAt';
type SortDirection = 'asc' | 'desc';

export function CampaignDetailView({ campaign, onBack, onToggleStar, onStartOutreach }: CampaignDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAverageScore = () => {
    if (campaign.leads.length === 0) return 0;
    const totalScore = campaign.leads.reduce((sum, lead) => sum + lead.score, 0);
    return Math.round(totalScore / campaign.leads.length);
  };

  const industries = Array.from(new Set(campaign.leads.map(lead => lead.industry)));

  // Filter and sort leads
  const getFilteredLeads = () => {
    return campaign.leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIndustry = selectedIndustry === 'all' || lead.industry === selectedIndustry;
      
      return matchesSearch && matchesIndustry;
    });
  };

  const getSortedLeads = () => {
    const filtered = getFilteredLeads();
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
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

  const sortedLeads = getSortedLeads();
  const averageScore = getAverageScore();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 bg-card/50 border-b border-border">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>

        <div className="space-y-4">
          {/* Campaign Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold mb-2">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-muted-foreground mb-4 max-w-3xl">
                  {campaign.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Target className="h-4 w-4 mr-2" />
                  Duplicate Campaign
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                    <p className="text-xl font-semibold">{campaign.leads.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-xl font-semibold">{averageScore}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-xl font-semibold">{formatDate(campaign.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge 
                      variant={campaign.priority === 'high' ? 'destructive' : campaign.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-sm font-medium"
                    >
                      {campaign.priority || 'Medium'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Metadata */}
          <div className="flex flex-wrap items-center gap-4">
            {campaign.goal && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Goal:</span>
                <Badge variant="outline">
                  {campaign.goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            )}
            
            {campaign.category && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge variant="secondary">{campaign.category}</Badge>
              </div>
            )}

            {campaign.tags && campaign.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tags:</span>
                <div className="flex gap-1">
                  {campaign.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button
              className="gap-2"
              onClick={() => {
                const emails = campaign.leads.map(lead => lead.email).join(',');
                window.open(`mailto:${emails}`, '_blank');
              }}
            >
              <Mail className="h-4 w-4" />
              Email All Leads
            </Button>
            
            <Button variant="outline" className="gap-2">
              <Target className="h-4 w-4" />
              Create Outreach Sequence
            </Button>
            
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Leads Section */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Campaign Leads</h2>
              <p className="text-sm text-muted-foreground">
                {sortedLeads.length} of {campaign.leads.length} leads • {selectedLeads.length} selected
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name, company, title, or location..."
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLeads(
                  selectedLeads.length === sortedLeads.length 
                    ? [] 
                    : sortedLeads.map(lead => lead.id)
                );
              }}
            >
              {selectedLeads.length === sortedLeads.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Leads Table */}
          <Card>
            <CardContent className="p-0">
              {sortedLeads.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria to find leads.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLeads.length === sortedLeads.length && sortedLeads.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeads(sortedLeads.map(lead => lead.id));
                            } else {
                              setSelectedLeads([]);
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
                          onClick={() => {
                            if (sortField === 'name') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('name');
                              setSortDirection('asc');
                            }
                          }}
                          className="h-auto p-0"
                        >
                          Name
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortField === 'title') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('title');
                              setSortDirection('asc');
                            }
                          }}
                          className="h-auto p-0"
                        >
                          Title
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortField === 'company') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('company');
                              setSortDirection('asc');
                            }
                          }}
                          className="h-auto p-0"
                        >
                          Company
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortField === 'score') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('score');
                              setSortDirection('desc');
                            }
                          }}
                          className="h-auto p-0"
                        >
                          Score
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={() => handleSelectLead(lead.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {onToggleStar && (
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
                          )}
                          {!onToggleStar && lead.isStarred && (
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-xs text-muted-foreground">{lead.email}</div>
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
                          <div className="text-sm text-muted-foreground">{lead.location}</div>
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
                            {onStartOutreach && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onStartOutreach(lead)}
                                className="h-8 w-8 p-0"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
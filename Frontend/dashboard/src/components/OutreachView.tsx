import { useState } from 'react';
import { 
  Send, 
  Mail, 
  Users, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause, 
  Calendar, 
  Eye, 
  Reply, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Settings,
  Download,
  GitBranch
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import type { OutreachSequence, OutreachActivity, Lead, OutreachEmail } from '../App';

interface OutreachViewProps {
  sequences: OutreachSequence[];
  activities: OutreachActivity[];
  leads: Lead[];
  onCreateSequence: (sequence: Omit<OutreachSequence, 'id' | 'createdAt'>) => void;
  onUpdateSequence?: (sequenceId: string, updates: Partial<OutreachSequence>) => void;
  onDeleteSequence?: (sequenceId: string) => void;
  onNavigateToSequenceCreation?: () => void;
  onNavigateToLegacyCreation?: () => void;
}

export function OutreachView({ 
  sequences, 
  activities, 
  leads, 
  onCreateSequence, 
  onUpdateSequence,
  onDeleteSequence,
  onNavigateToSequenceCreation,
  onNavigateToLegacyCreation
}: OutreachViewProps) {
  const [selectedSequence, setSelectedSequence] = useState<OutreachSequence | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSequenceDetails, setShowSequenceDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<OutreachActivity | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [sequenceName, setSequenceName] = useState('');
  const [sequenceDescription, setSequenceDescription] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [emails, setEmails] = useState<OutreachEmail[]>([
    {
      id: '1',
      subject: 'Introduction - Partnership Opportunity',
      content: 'Hi {{firstName}},\n\nI hope this email finds you well. I\'m reaching out because I believe there might be a great partnership opportunity between {{company}} and our company.\n\nWould you be open to a brief conversation to explore this further?\n\nBest regards,\n{{senderName}}',
      delay: 0,
      isFollowUp: false
    }
  ]);

  const getSequenceStats = (sequence: OutreachSequence) => {
    const sequenceActivities = activities.filter(a => a.sequenceId === sequence.id);
    const totalEmails = sequenceActivities.length;
    const sentEmails = sequenceActivities.filter(a => a.status === 'sent' || a.status === 'opened' || a.status === 'replied').length;
    const openedEmails = sequenceActivities.filter(a => a.status === 'opened' || a.status === 'replied').length;
    const repliedEmails = sequenceActivities.filter(a => a.status === 'replied').length;
    const scheduledEmails = sequenceActivities.filter(a => a.status === 'scheduled').length;

    return {
      totalEmails,
      sentEmails,
      openedEmails,
      repliedEmails,
      scheduledEmails,
      openRate: sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0,
      replyRate: sentEmails > 0 ? (repliedEmails / sentEmails) * 100 : 0,
      progress: totalEmails > 0 ? (sentEmails / totalEmails) * 100 : 0
    };
  };

  const getOverallStats = () => {
    const totalActivities = activities.length;
    const sentActivities = activities.filter(a => a.status === 'sent' || a.status === 'opened' || a.status === 'replied').length;
    const openedActivities = activities.filter(a => a.status === 'opened' || a.status === 'replied').length;
    const repliedActivities = activities.filter(a => a.status === 'replied').length;
    const scheduledActivities = activities.filter(a => a.status === 'scheduled').length;

    return {
      totalSequences: sequences.length,
      activeSequences: sequences.filter(s => s.status === 'active').length,
      pausedSequences: sequences.filter(s => s.status === 'paused').length,
      draftSequences: sequences.filter(s => s.status === 'draft').length,
      totalEmails: totalActivities,
      sentEmails: sentActivities,
      openedEmails: openedActivities,
      repliedEmails: repliedActivities,
      scheduledEmails: scheduledActivities,
      openRate: sentActivities > 0 ? (openedActivities / sentActivities) * 100 : 0,
      replyRate: sentActivities > 0 ? (repliedActivities / sentActivities) * 100 : 0
    };
  };

  const filteredSequences = sequences.filter(sequence => {
    const matchesStatus = filterStatus === 'all' || sequence.status === filterStatus;
    const matchesSearch = sequence.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sequence.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredActivities = activities.filter(activity => {
    const sequence = sequences.find(s => s.id === activity.sequenceId);
    const lead = leads.find(l => l.id === activity.leadId);
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesSearch = lead?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead?.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sequence?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateSequence = (e: React.FormEvent) => {
    e.preventDefault();
    if (sequenceName.trim() && selectedLeads.length > 0) {
      const selectedLeadObjects = leads.filter(lead => selectedLeads.includes(lead.id));
      onCreateSequence({
        name: sequenceName,
        description: sequenceDescription,
        emails,
        leads: selectedLeadObjects,
        status: 'draft'
      });
      
      // Reset form
      setSequenceName('');
      setSequenceDescription('');
      setSelectedLeads([]);
      setEmails([{
        id: '1',
        subject: 'Introduction - Partnership Opportunity',
        content: 'Hi {{firstName}},\n\nI hope this email finds you well. I\'m reaching out because I believe there might be a great partnership opportunity between {{company}} and our company.\n\nWould you be open to a brief conversation to explore this further?\n\nBest regards,\n{{senderName}}',
        delay: 0,
        isFollowUp: false
      }]);
      setShowCreateDialog(false);
    }
  };

  const updateEmail = (index: number, field: keyof OutreachEmail, value: string | number) => {
    setEmails(prev => prev.map((email, i) => 
      i === index ? { ...email, [field]: value } : email
    ));
  };

  const addEmail = () => {
    const newEmail: OutreachEmail = {
      id: Date.now().toString(),
      subject: 'Follow-up email',
      content: 'Hi {{firstName}},\n\n[Your message here]\n\nBest regards,\n{{senderName}}',
      delay: 5,
      isFollowUp: true
    };
    setEmails(prev => [...prev, newEmail]);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleSequenceStatus = (sequence: OutreachSequence) => {
    if (onUpdateSequence) {
      const newStatus = sequence.status === 'active' ? 'paused' : 'active';
      onUpdateSequence(sequence.id, { status: newStatus });
    }
  };

  const overallStats = getOverallStats();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-card via-card to-card/95 border-b border-border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Outreach Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage automated email sequences, track engagement, and optimize your outreach campaigns
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  onClick={onNavigateToLegacyCreation || (() => setShowCreateDialog(true))}
                >
                  <Plus className="h-4 w-4" />
                  Quick Sequence
                </Button>
                <Button 
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-sm" 
                  onClick={onNavigateToSequenceCreation}
                >
                  <GitBranch className="h-4 w-4" />
                  Visual Builder
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Sequences</p>
                    <p className="text-2xl font-bold text-blue-900">{overallStats.totalSequences}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active</p>
                    <p className="text-2xl font-bold text-green-900">{overallStats.activeSequences}</p>
                  </div>
                  <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Emails Sent</p>
                    <p className="text-2xl font-bold text-purple-900">{overallStats.sentEmails}</p>
                  </div>
                  <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Open Rate</p>
                    <p className="text-2xl font-bold text-orange-900">{overallStats.openRate.toFixed(1)}%</p>
                  </div>
                  <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-700">Reply Rate</p>
                    <p className="text-2xl font-bold text-pink-900">{overallStats.replyRate.toFixed(1)}%</p>
                  </div>
                  <div className="h-10 w-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                    <Reply className="h-5 w-5 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-700">Scheduled</p>
                    <p className="text-2xl font-bold text-teal-900">{overallStats.scheduledEmails}</p>
                  </div>
                  <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="sequences" className="gap-2">
                  <Send className="h-4 w-4" />
                  Sequences
                </TabsTrigger>
                <TabsTrigger value="activities" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Activities
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Search and Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sequences, leads, or activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest outreach activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => {
                      const lead = leads.find(l => l.id === activity.leadId);
                      const sequence = sequences.find(s => s.id === activity.sequenceId);
                      const statusIcon = {
                        scheduled: Clock,
                        sent: Mail,
                        opened: Eye,
                        replied: Reply
                      }[activity.status];
                      const StatusIcon = statusIcon || Clock;

                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            activity.status === 'scheduled' && "bg-blue-100 text-blue-600",
                            activity.status === 'sent' && "bg-green-100 text-green-600",
                            activity.status === 'opened' && "bg-orange-100 text-orange-600",
                            activity.status === 'replied' && "bg-purple-100 text-purple-600"
                          )}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{lead?.name}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{sequence?.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {activity.status === 'scheduled' && `Scheduled for ${activity.scheduledFor.toLocaleDateString()}`}
                              {activity.status === 'sent' && `Email sent ${activity.sentAt?.toLocaleDateString()}`}
                              {activity.status === 'opened' && `Email opened ${activity.openedAt?.toLocaleDateString()}`}
                              {activity.status === 'replied' && `Reply received ${activity.repliedAt?.toLocaleDateString()}`}
                            </div>
                          </div>
                          <Badge variant={
                            activity.status === 'scheduled' ? 'outline' :
                            activity.status === 'sent' ? 'secondary' :
                            activity.status === 'opened' ? 'default' : 'default'
                          }>
                            {activity.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Sequences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Best performing sequences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sequences
                      .map(seq => ({ sequence: seq, stats: getSequenceStats(seq) }))
                      .sort((a, b) => b.stats.replyRate - a.stats.replyRate)
                      .slice(0, 5)
                      .map(({ sequence, stats }) => (
                        <div key={sequence.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{sequence.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {stats.sentEmails} sent • {stats.replyRate.toFixed(1)}% reply rate
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-sm font-medium text-green-600">{stats.replyRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sequences" className="flex-1 p-6 overflow-auto">
            {filteredSequences.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No outreach sequences found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? "Try adjusting your search or filter criteria."
                    : "Create your first automated email sequence to start reaching out to leads."
                  }
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onNavigateToLegacyCreation || (() => setShowCreateDialog(true))}>
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Sequence
                  </Button>
                  <Button onClick={onNavigateToSequenceCreation}>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Visual Builder
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSequences.map((sequence, index) => {
                  const stats = getSequenceStats(sequence);
                  return (
                    <motion.div
                      key={sequence.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-200 group">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {sequence.name}
                              </CardTitle>
                              <CardDescription className="mt-1 line-clamp-2">
                                {sequence.description || 'No description provided'}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                sequence.status === 'active' ? 'default' :
                                sequence.status === 'paused' ? 'secondary' :
                                sequence.status === 'draft' ? 'outline' : 'secondary'
                              }
                              className={cn(
                                sequence.status === 'active' && "bg-green-100 text-green-800 border-green-200",
                                sequence.status === 'paused' && "bg-yellow-100 text-yellow-800 border-yellow-200"
                              )}
                            >
                              {sequence.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{stats.progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={stats.progress} className="h-2" />
                          </div>
                          
                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{sequence.leads.length}</span>
                                <span className="text-xs text-muted-foreground">leads</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{sequence.emails.length}</span>
                                <span className="text-xs text-muted-foreground">emails</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{stats.openRate.toFixed(0)}%</span>
                                <span className="text-xs text-muted-foreground">open</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Reply className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{stats.replyRate.toFixed(0)}%</span>
                                <span className="text-xs text-muted-foreground">reply</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Performance Stats */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">{stats.sentEmails}</div>
                              <div className="text-xs text-muted-foreground">Sent</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">{stats.openedEmails}</div>
                              <div className="text-xs text-muted-foreground">Opened</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-600">{stats.repliedEmails}</div>
                              <div className="text-xs text-muted-foreground">Replied</div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setSelectedSequence(sequence);
                                setShowSequenceDetails(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              variant={sequence.status === 'active' ? 'secondary' : 'default'}
                              className="flex-1"
                              onClick={() => toggleSequenceStatus(sequence)}
                            >
                              {sequence.status === 'active' ? (
                                <>
                                  <Pause className="h-3 w-3 mr-1" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities" className="flex-1 p-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Track all outreach activities and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Sequence</TableHead>
                        <TableHead>Email Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActivities.slice(0, 100).map((activity) => {
                        const lead = leads.find(l => l.id === activity.leadId);
                        const sequence = sequences.find(s => s.id === activity.sequenceId);
                        const email = sequence?.emails.find(e => e.id === activity.emailId);
                        
                        return (
                          <TableRow key={activity.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div>
                                <div className="font-medium">{lead?.name}</div>
                                <div className="text-sm text-muted-foreground">{lead?.company}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{sequence?.name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm max-w-48 truncate">{email?.subject}</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  activity.status === 'sent' ? 'default' :
                                  activity.status === 'opened' ? 'secondary' :
                                  activity.status === 'replied' ? 'default' :
                                  'outline'
                                }
                                className={cn(
                                  activity.status === 'opened' && 'bg-green-100 text-green-800 border-green-200',
                                  activity.status === 'replied' && 'bg-blue-100 text-blue-800 border-blue-200',
                                  activity.status === 'scheduled' && 'bg-gray-100 text-gray-800 border-gray-200'
                                )}
                              >
                                {activity.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {activity.scheduledFor.toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm">
                              {activity.sentAt?.toLocaleDateString() || '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedActivity(activity)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Overall outreach performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{overallStats.sentEmails}</div>
                        <div className="text-sm text-muted-foreground">Total Sent</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{overallStats.openedEmails}</div>
                        <div className="text-sm text-muted-foreground">Total Opened</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Overall Open Rate</span>
                        <span className="font-bold text-green-600">{overallStats.openRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={overallStats.openRate} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span>Overall Reply Rate</span>
                        <span className="font-bold text-blue-600">{overallStats.replyRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={overallStats.replyRate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sequence Performance</CardTitle>
                  <CardDescription>Individual sequence performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {sequences.map(sequence => {
                        const stats = getSequenceStats(sequence);
                        return (
                          <div key={sequence.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{sequence.name}</div>
                              <Badge variant={sequence.status === 'active' ? 'default' : 'secondary'}>
                                {sequence.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <div className="font-medium">{stats.sentEmails}</div>
                                <div className="text-xs text-muted-foreground">Sent</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{stats.openRate.toFixed(0)}%</div>
                                <div className="text-xs text-muted-foreground">Open Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{stats.replyRate.toFixed(0)}%</div>
                                <div className="text-xs text-muted-foreground">Reply Rate</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Sequence Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Outreach Sequence</DialogTitle>
            <DialogDescription>
              Set up an automated email sequence to engage with your leads systematically.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSequence} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sequenceName">Sequence Name *</Label>
                <Input
                  id="sequenceName"
                  value={sequenceName}
                  onChange={(e) => setSequenceName(e.target.value)}
                  placeholder="e.g., Q4 Partnership Outreach"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sequenceDescription">Description</Label>
                <Input
                  id="sequenceDescription"
                  value={sequenceDescription}
                  onChange={(e) => setSequenceDescription(e.target.value)}
                  placeholder="Brief description of this sequence"
                />
              </div>
            </div>
            
            <div>
              <Label>Select Leads ({selectedLeads.length} selected)</Label>
              <div className="mt-2 max-h-40 overflow-y-auto border border-border rounded-md p-3 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {leads.map(lead => (
                    <div key={lead.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`lead-${lead.id}`}
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads(prev => [...prev, lead.id]);
                          } else {
                            setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                          }
                        }}
                        className="rounded border-border"
                      />
                      <label htmlFor={`lead-${lead.id}`} className="text-sm cursor-pointer flex-1">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.company}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email Sequence ({emails.length} emails)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEmail}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Email
                </Button>
              </div>
              
              <div className="space-y-4">
                {emails.map((email, index) => (
                  <Card key={email.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Email {index + 1} {email.isFollowUp && '(Follow-up)'}
                        </h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmail(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Subject Line</Label>
                          <Input
                            value={email.subject}
                            onChange={(e) => updateEmail(index, 'subject', e.target.value)}
                            placeholder="Email subject"
                          />
                        </div>
                        <div>
                          <Label>Delay (days)</Label>
                          <Input
                            type="number"
                            value={email.delay}
                            onChange={(e) => updateEmail(index, 'delay', parseInt(e.target.value) || 0)}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Email Content</Label>
                        <Textarea
                          value={email.content}
                          onChange={(e) => updateEmail(index, 'content', e.target.value)}
                          placeholder="Write your email content here..."
                          className="min-h-[120px]"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use variables: {'{{firstName}}'}, {'{{company}}'}, {'{{title}}'}, {'{{senderName}}'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!sequenceName.trim() || selectedLeads.length === 0}>
                Create Sequence
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sequence Details Sheet */}
      <Sheet open={showSequenceDetails} onOpenChange={setShowSequenceDetails}>
        <SheetContent className="w-96 sm:w-[600px]">
          {selectedSequence && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedSequence.name}</SheetTitle>
                <SheetDescription>
                  {selectedSequence.description || 'Sequence details and performance metrics'}
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Sequence Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const stats = getSequenceStats(selectedSequence);
                        return (
                          <>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold">{stats.sentEmails}</div>
                              <div className="text-xs text-muted-foreground">Emails Sent</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold">{stats.openRate.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground">Open Rate</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold">{stats.repliedEmails}</div>
                              <div className="text-xs text-muted-foreground">Replies</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold">{stats.progress.toFixed(0)}%</div>
                              <div className="text-xs text-muted-foreground">Progress</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Email Sequence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Email Sequence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedSequence.emails.map((email, index) => (
                        <div key={email.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                              Email {index + 1} {email.isFollowUp && '(Follow-up)'}
                            </span>
                            <Badge variant="outline">
                              {email.delay === 0 ? 'Immediate' : `Day ${email.delay}`}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium mb-1">{email.subject}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {email.content.substring(0, 100)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Leads in Sequence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Leads ({selectedSequence.leads.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedSequence.leads.map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                          <div>
                            <div className="font-medium text-sm">{lead.name}</div>
                            <div className="text-xs text-muted-foreground">{lead.company}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activities.filter(a => a.leadId === lead.id && a.sequenceId === selectedSequence.id && a.status === 'sent').length} sent
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  Eye, 
  Reply, 
  Users, 
  Target, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import type { OutreachSequence, OutreachActivity, Lead, Campaign } from '../App';

interface AnalyticsViewProps {
  sequences: OutreachSequence[];
  activities: OutreachActivity[];
  leads: Lead[];
  campaigns: Campaign[];
}

export function AnalyticsView({ sequences, activities, leads, campaigns }: AnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Calculate analytics data
  const getAnalyticsData = () => {
    const totalActivities = activities.length;
    const sentActivities = activities.filter(a => a.status === 'sent' || a.status === 'opened' || a.status === 'replied').length;
    const openedActivities = activities.filter(a => a.status === 'opened' || a.status === 'replied').length;
    const repliedActivities = activities.filter(a => a.status === 'replied').length;
    const scheduledActivities = activities.filter(a => a.status === 'scheduled').length;

    const openRate = sentActivities > 0 ? (openedActivities / sentActivities) * 100 : 0;
    const replyRate = sentActivities > 0 ? (repliedActivities / sentActivities) * 100 : 0;
    const conversionRate = leads.length > 0 ? (repliedActivities / leads.length) * 100 : 0;

    return {
      totalLeads: leads.length,
      starredLeads: leads.filter(l => l.isStarred).length,
      totalCampaigns: campaigns.length,
      totalSequences: sequences.length,
      activeSequences: sequences.filter(s => s.status === 'active').length,
      totalEmails: totalActivities,
      sentEmails: sentActivities,
      openedEmails: openedActivities,
      repliedEmails: repliedActivities,
      scheduledEmails: scheduledActivities,
      openRate,
      replyRate,
      conversionRate,
      avgEmailsPerSequence: sequences.length > 0 ? sequences.reduce((sum, seq) => sum + seq.emails.length, 0) / sequences.length : 0,
      avgLeadsPerSequence: sequences.length > 0 ? sequences.reduce((sum, seq) => sum + seq.leads.length, 0) / sequences.length : 0
    };
  };

  const getSequencePerformance = () => {
    return sequences.map(sequence => {
      const sequenceActivities = activities.filter(a => a.sequenceId === sequence.id);
      const sent = sequenceActivities.filter(a => a.status === 'sent' || a.status === 'opened' || a.status === 'replied').length;
      const opened = sequenceActivities.filter(a => a.status === 'opened' || a.status === 'replied').length;
      const replied = sequenceActivities.filter(a => a.status === 'replied').length;

      return {
        id: sequence.id,
        name: sequence.name,
        status: sequence.status,
        totalEmails: sequenceActivities.length,
        sent,
        opened,
        replied,
        openRate: sent > 0 ? (opened / sent) * 100 : 0,
        replyRate: sent > 0 ? (replied / sent) * 100 : 0,
        leads: sequence.leads.length,
        emailCount: sequence.emails.length
      };
    }).sort((a, b) => b.replyRate - a.replyRate);
  };

  const getIndustryPerformance = () => {
    const industryStats = new Map();
    
    leads.forEach(lead => {
      const leadActivities = activities.filter(a => a.leadId === lead.id);
      const sent = leadActivities.filter(a => a.status === 'sent' || a.status === 'opened' || a.status === 'replied').length;
      const opened = leadActivities.filter(a => a.status === 'opened' || a.status === 'replied').length;
      const replied = leadActivities.filter(a => a.status === 'replied').length;

      if (!industryStats.has(lead.industry)) {
        industryStats.set(lead.industry, {
          industry: lead.industry,
          leads: 0,
          sent: 0,
          opened: 0,
          replied: 0
        });
      }

      const stats = industryStats.get(lead.industry);
      stats.leads += 1;
      stats.sent += sent;
      stats.opened += opened;
      stats.replied += replied;
    });

    return Array.from(industryStats.values()).map(stats => ({
      ...stats,
      openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
      replyRate: stats.sent > 0 ? (stats.replied / stats.sent) * 100 : 0
    })).sort((a, b) => b.replyRate - a.replyRate);
  };

  const analyticsData = getAnalyticsData();
  const sequencePerformance = getSequencePerformance();
  const industryPerformance = getIndustryPerformance();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-card via-card to-card/95 border-b border-border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Track performance, analyze trends, and optimize your outreach campaigns
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Leads</p>
                    <p className="text-2xl font-bold text-blue-900">{analyticsData.totalLeads}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+12%</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Emails Sent</p>
                    <p className="text-2xl font-bold text-green-900">{analyticsData.sentEmails}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+8%</span>
                    </div>
                  </div>
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Open Rate</p>
                    <p className="text-2xl font-bold text-orange-900">{analyticsData.openRate.toFixed(1)}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+3.2%</span>
                    </div>
                  </div>
                  <Eye className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Reply Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{analyticsData.replyRate.toFixed(1)}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-xs text-red-600">-1.1%</span>
                    </div>
                  </div>
                  <Reply className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-700">Active Sequences</p>
                    <p className="text-2xl font-bold text-teal-900">{analyticsData.activeSequences}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+2</span>
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-700">Conversion</p>
                    <p className="text-2xl font-bold text-pink-900">{analyticsData.conversionRate.toFixed(1)}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+0.8%</span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="bg-card border-b border-border px-6 py-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="sequences" className="gap-2">
                <Activity className="h-4 w-4" />
                Sequences
              </TabsTrigger>
              <TabsTrigger value="industries" className="gap-2">
                <PieChart className="h-4 w-4" />
                Industries
              </TabsTrigger>
              <TabsTrigger value="trends" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Trends
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>Key metrics overview for your outreach campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Email Open Rate</span>
                        <span className="text-sm font-bold">{analyticsData.openRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analyticsData.openRate} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Industry average: 21.3%
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Reply Rate</span>
                        <span className="text-sm font-bold">{analyticsData.replyRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analyticsData.replyRate} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Industry average: 8.5%
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Conversion Rate</span>
                        <span className="text-sm font-bold">{analyticsData.conversionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analyticsData.conversionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Industry average: 4.2%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Breakdown</CardTitle>
                  <CardDescription>Distribution of email activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.sentEmails}</div>
                        <div className="text-sm text-blue-700">Emails Sent</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.openedEmails}</div>
                        <div className="text-sm text-green-700">Emails Opened</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.repliedEmails}</div>
                        <div className="text-sm text-purple-700">Replies Received</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">{analyticsData.scheduledEmails}</div>
                        <div className="text-sm text-orange-700">Scheduled</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Health</CardTitle>
                  <CardDescription>Overall health metrics of your outreach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Active Sequences</span>
                      </div>
                      <span className="text-sm font-bold">{analyticsData.activeSequences}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Avg Emails per Sequence</span>
                      </div>
                      <span className="text-sm font-bold">{analyticsData.avgEmailsPerSequence.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Avg Leads per Sequence</span>
                      </div>
                      <span className="text-sm font-bold">{analyticsData.avgLeadsPerSequence.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Insights</CardTitle>
                  <CardDescription>AI-generated insights from your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Strong Performance</p>
                          <p className="text-xs text-green-700">Your open rate is 15% above industry average</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Optimization Opportunity</p>
                          <p className="text-xs text-blue-700">Consider A/B testing subject lines to improve reply rates</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Timing Insight</p>
                          <p className="text-xs text-orange-700">Tuesday and Thursday show higher engagement rates</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sequences" className="flex-1 p-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Sequence Performance Ranking</CardTitle>
                <CardDescription>All sequences ranked by reply rate performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sequencePerformance.map((sequence, index) => (
                    <motion.div
                      key={sequence.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-center h-8 w-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{sequence.name}</h4>
                          <Badge variant={sequence.status === 'active' ? 'default' : 'secondary'}>
                            {sequence.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {sequence.leads} leads • {sequence.emailCount} emails
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold">{sequence.sent}</div>
                          <div className="text-xs text-muted-foreground">Sent</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{sequence.openRate.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Open</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{sequence.replyRate.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Reply</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{sequence.replied}</div>
                          <div className="text-xs text-muted-foreground">Replies</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="industries" className="flex-1 p-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Industry Performance Analysis</CardTitle>
                <CardDescription>Compare outreach performance across different industries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {industryPerformance.map((industry, index) => (
                    <motion.div
                      key={industry.industry}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{industry.industry}</h4>
                        <Badge variant="outline">{industry.leads} leads</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Open Rate</span>
                            <span className="text-sm font-medium">{industry.openRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={industry.openRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Reply Rate</span>
                            <span className="text-sm font-medium">{industry.replyRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={industry.replyRate} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        <div>
                          <div className="font-medium">{industry.sent}</div>
                          <div className="text-xs text-muted-foreground">Sent</div>
                        </div>
                        <div>
                          <div className="font-medium">{industry.opened}</div>
                          <div className="text-xs text-muted-foreground">Opened</div>
                        </div>
                        <div>
                          <div className="font-medium">{industry.replied}</div>
                          <div className="text-xs text-muted-foreground">Replied</div>
                        </div>
                        <div>
                          <div className="font-medium">{industry.leads}</div>
                          <div className="text-xs text-muted-foreground">Leads</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>Track how your engagement rates have changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Engagement trend chart would appear here</p>
                      <p className="text-xs text-muted-foreground mt-1">Chart visualization coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Performing Days</CardTitle>
                  <CardDescription>Which days of the week get the best response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Tuesday', 'Thursday', 'Wednesday', 'Monday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                      const performance = Math.max(10, 100 - index * 12 - Math.random() * 20);
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <div className="w-20 text-sm font-medium">{day}</div>
                          <div className="flex-1">
                            <Progress value={performance} className="h-2" />
                          </div>
                          <div className="w-12 text-sm text-right">{performance.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
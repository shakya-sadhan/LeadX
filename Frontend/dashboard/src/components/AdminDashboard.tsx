import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Send, 
  BarChart3, 
  Activity, 
  Calendar,
  Mail,
  Database,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  DollarSign,
  Growth,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { User, Lead, Campaign, OutreachSequence, OutreachActivity, SystemActivity } from '../App';

interface AdminDashboardProps {
  users: User[];
  leads: Lead[];
  campaigns: Campaign[];
  sequences: OutreachSequence[];
  activities: OutreachActivity[];
  systemActivities: SystemActivity[];
  currentUser: User;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AdminDashboard({
  users,
  leads,
  campaigns,
  sequences,
  activities,
  systemActivities,
  currentUser
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  // Calculate system metrics
  const getSystemMetrics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalLeads = leads.length;
    const totalCampaigns = campaigns.length;
    const totalSequences = sequences.length;
    const totalEmailsSent = activities.filter(a => a.status === 'sent' || a.status === 'opened' || a.status === 'replied').length;
    const totalEmailsOpened = activities.filter(a => a.status === 'opened' || a.status === 'replied').length;
    const totalReplies = activities.filter(a => a.status === 'replied').length;
    
    const openRate = totalEmailsSent > 0 ? (totalEmailsOpened / totalEmailsSent) * 100 : 0;
    const replyRate = totalEmailsSent > 0 ? (totalReplies / totalEmailsSent) * 100 : 0;

    return {
      totalUsers,
      activeUsers,
      totalLeads,
      totalCampaigns,
      totalSequences,
      totalEmailsSent,
      totalEmailsOpened,
      totalReplies,
      openRate,
      replyRate
    };
  };

  const metrics = getSystemMetrics();

  // Generate usage data for charts
  const generateUsageData = () => {
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: Math.floor(Math.random() * 20) + 10,
        leads: Math.floor(Math.random() * 50) + 20,
        emails: Math.floor(Math.random() * 100) + 50,
        campaigns: Math.floor(Math.random() * 10) + 5
      });
    }
    
    return data;
  };

  const usageData = generateUsageData();

  // Department breakdown
  const getDepartmentBreakdown = () => {
    const departments = users.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(departments).map(([name, value]) => ({
      name,
      value,
      color: COLORS[Object.keys(departments).indexOf(name) % COLORS.length]
    }));
  };

  const departmentData = getDepartmentBreakdown();

  // Performance metrics by user
  const getTopPerformers = () => {
    return users
      .sort((a, b) => (b.stats.leadsGenerated + b.stats.emailsSent) - (a.stats.leadsGenerated + a.stats.emailsSent))
      .slice(0, 5);
  };

  const topPerformers = getTopPerformers();

  // System health metrics (simulated)
  const getSystemHealth = () => {
    return {
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      diskUsage: Math.floor(Math.random() * 50) + 25,
      networkUsage: Math.floor(Math.random() * 60) + 20,
      uptime: '99.9%',
      responseTime: '120ms',
      activeConnections: Math.floor(Math.random() * 100) + 50,
      errorRate: '0.01%'
    };
  };

  const systemHealth = getSystemHealth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderOverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold">{metrics.totalUsers}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12% this month
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-semibold">{metrics.totalLeads}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                +8% this month
              </p>
            </div>
            <Database className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emails Sent</p>
              <p className="text-2xl font-semibold">{metrics.totalEmailsSent}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                +15% this month
              </p>
            </div>
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reply Rate</p>
              <p className="text-2xl font-semibold">{metrics.replyRate.toFixed(1)}%</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <ArrowDown className="h-3 w-3 mr-1" />
                -2% this month
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsageCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="emails" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <span className="font-medium">CPU Usage</span>
            </div>
            <span className="text-sm font-semibold">{systemHealth.cpuUsage}%</span>
          </div>
          <Progress value={systemHealth.cpuUsage} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-green-600" />
              <span className="font-medium">Memory</span>
            </div>
            <span className="text-sm font-semibold">{systemHealth.memoryUsage}%</span>
          </div>
          <Progress value={systemHealth.memoryUsage} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Disk Usage</span>
            </div>
            <span className="text-sm font-semibold">{systemHealth.diskUsage}%</span>
          </div>
          <Progress value={systemHealth.diskUsage} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Network</span>
            </div>
            <span className="text-sm font-semibold">{systemHealth.networkUsage}%</span>
          </div>
          <Progress value={systemHealth.networkUsage} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );

  const renderTopPerformers = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((user, index) => (
            <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold">#{index + 1}</span>
                </div>
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.department}</p>
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-semibold">{user.stats.leadsGenerated} leads</p>
                <p className="text-xs text-muted-foreground">{user.stats.emailsSent} emails sent</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent System Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {systemActivities.slice(0, 15).map((activity) => {
              const user = users.find(u => u.id === activity.userId);
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} • {activity.target}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.action}
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderSystemMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-semibold text-green-600">{systemHealth.uptime}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Time</p>
              <p className="text-2xl font-semibold">{systemHealth.responseTime}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Connections</p>
              <p className="text-2xl font-semibold">{systemHealth.activeConnections}</p>
            </div>
            <Globe className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-semibold text-green-600">{systemHealth.errorRate}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="h-full bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">System overview and analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="system">System Health</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {renderOverviewStats()}
              {renderUsageCharts()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderTopPerformers()}
                {renderRecentActivity()}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Open Rate</p>
                        <p className="text-2xl font-semibold">{metrics.openRate.toFixed(1)}%</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Sequences</p>
                        <p className="text-2xl font-semibold">{sequences.filter(s => s.status === 'active').length}</p>
                      </div>
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Campaigns</p>
                        <p className="text-2xl font-semibold">{metrics.totalCampaigns}</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="leads" fill="#8884d8" />
                      <Bar dataKey="emails" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderTopPerformers()}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Leads</TableHead>
                          <TableHead>Emails</TableHead>
                          <TableHead>Sequences</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.slice(0, 5).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                {user.name}
                              </div>
                            </TableCell>
                            <TableCell>{user.stats.leadsGenerated}</TableCell>
                            <TableCell>{user.stats.emailsSent}</TableCell>
                            <TableCell>{user.stats.sequencesCreated}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              {renderSystemHealth()}
              {renderSystemMetrics()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
import { 
  Sparkles, 
  Users, 
  Target, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Send, 
  Bot,
  Database,
  Zap,
  Mail,
  Activity,
  Settings,
  Plus,
  FileText,
  MessageSquare,
  Calendar,
  Eye,
  Shield,
  UserCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { cn } from './ui/utils';

interface SidebarProps {
  isOpen: boolean;
  currentView: 'generate' | 'leads' | 'campaigns' | 'outreach' | 'lead-outreach' | 'analytics' | 'templates' | 'users' | 'admin' | 'settings';
  onViewChange: (view: 'generate' | 'leads' | 'campaigns' | 'outreach' | 'lead-outreach' | 'analytics' | 'templates' | 'users' | 'admin' | 'settings') => void;
  leadCount: number;
  starredCount: number;
  campaignCount: number;
  outreachCount: number;
  activeSequences?: number;
  totalSent?: number;
  totalOpened?: number;
  totalReplied?: number;
  userCount?: number;
  currentUserRole?: 'admin' | 'manager' | 'user';
}

export function Sidebar({ 
  isOpen, 
  currentView, 
  onViewChange, 
  leadCount, 
  starredCount, 
  campaignCount,
  outreachCount,
  activeSequences = 0,
  totalSent = 0,
  totalOpened = 0,
  totalReplied = 0,
  userCount = 0,
  currentUserRole = 'user'
}: SidebarProps) {
  const leadGenItems = [
    {
      id: 'generate' as const,
      label: 'AI Lead Gen',
      icon: Sparkles,
      count: null,
      description: 'Generate new leads'
    }
  ];

  const leadManagementItems = [
    {
      id: 'leads' as const,
      label: 'Lead Database',
      icon: Database,
      count: leadCount,
      description: 'Manage all leads'
    },
    {
      id: 'campaigns' as const,
      label: 'Campaigns',
      icon: Target,
      count: campaignCount,
      description: 'Organize lead campaigns'
    }
  ];

  const outreachItems = [
    {
      id: 'outreach' as const,
      label: 'Email Sequences',
      icon: Send,
      count: outreachCount,
      description: 'Automated sequences'
    },
    {
      id: 'templates' as const,
      label: 'Email Templates',
      icon: FileText,
      count: null,
      description: 'Reusable templates'
    }
  ];

  const analyticsItems = [
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      count: null,
      description: 'Performance insights'
    }
  ];

  const adminItems = [
    {
      id: 'users' as const,
      label: 'User Management',
      icon: UserCheck,
      count: userCount,
      description: 'Manage team members'
    },
    {
      id: 'admin' as const,
      label: 'Admin Dashboard',
      icon: Shield,
      count: null,
      description: 'System overview'
    }
  ];

  const renderNavSection = (title: string, items: any[], gradient?: string) => (
    <div className="space-y-2">
      <div className="px-2 py-1">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-12 px-3 rounded-lg transition-all",
              isActive && "bg-primary text-primary-foreground shadow-sm",
              !isActive && "hover:bg-accent/50"
            )}
            onClick={() => onViewChange(item.id)}
          >
            <div className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center transition-colors",
              isActive 
                ? "bg-primary-foreground/10" 
                : gradient || "bg-muted"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                isActive ? "text-primary-foreground" : "text-foreground"
              )} />
            </div>
            <div className="flex-1 text-left">
              <div className={cn(
                "text-sm font-medium",
                isActive ? "text-primary-foreground" : "text-foreground"
              )}>
                {item.label}
              </div>
              <div className={cn(
                "text-xs",
                isActive ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {item.description}
              </div>
            </div>
            {item.count !== null && item.count > 0 && (
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className={cn(
                  "ml-auto text-xs",
                  isActive && "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                )}
              >
                {item.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0';

  return (
    <aside 
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm",
        isOpen ? "w-72" : "w-0 opacity-0"
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">LeadGen Pro</h2>
            <p className="text-xs text-muted-foreground">AI-Powered Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-6">
          {renderNavSection("Lead Generation", leadGenItems, "bg-gradient-to-br from-blue-500/10 to-purple-500/10")}
          
          <Separator className="my-4" />
          
          {renderNavSection("Lead Management", leadManagementItems, "bg-gradient-to-br from-green-500/10 to-emerald-500/10")}
          
          <Separator className="my-4" />
          
          {renderNavSection("Outreach & Email", outreachItems, "bg-gradient-to-br from-orange-500/10 to-red-500/10")}
          
          <Separator className="my-4" />
          
          {renderNavSection("Analytics", analyticsItems, "bg-gradient-to-br from-purple-500/10 to-pink-500/10")}
          
          {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
            <>
              <Separator className="my-4" />
              {renderNavSection("Administration", adminItems, "bg-gradient-to-br from-red-500/10 to-pink-500/10")}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-3">
          {/* Active Starred Leads Alert */}
          {starredCount > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                <span className="text-sm font-medium text-amber-800">Ready for Campaign</span>
              </div>
              <p className="text-xs text-amber-700 mb-2">
                {starredCount} starred leads ready
              </p>
              <Button 
                size="sm" 
                className="w-full h-8 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => onViewChange('leads')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Campaign
              </Button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center p-2 bg-card rounded-md border">
                <div className="text-lg font-semibold text-primary">{totalSent}</div>
                <div className="text-xs text-muted-foreground">Emails Sent</div>
              </div>
              <div className="text-center p-2 bg-card rounded-md border">
                <div className="text-lg font-semibold text-green-600">{openRate}%</div>
                <div className="text-xs text-muted-foreground">Open Rate</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-card rounded-md border">
                <div className="text-lg font-semibold text-blue-600">{activeSequences}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-2 bg-card rounded-md border">
                <div className="text-lg font-semibold text-purple-600">{replyRate}%</div>
                <div className="text-xs text-muted-foreground">Reply Rate</div>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewChange('generate')}
            >
              <Zap className="h-3 w-3 mr-1" />
              Generate
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewChange('templates')}
            >
              <FileText className="h-3 w-3 mr-1" />
              Templates
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
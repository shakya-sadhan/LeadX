import { Menu, Sparkles, Users, Target, Send } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentView: 'generate' | 'leads' | 'campaigns' | 'campaign-creation' | 'outreach' | 'sequence-creation' | 'sequence-builder' | 'lead-outreach' | 'analytics' | 'templates' | 'settings';
}

export function Header({ onToggleSidebar, currentView }: HeaderProps) {
  const getViewTitle = () => {
    switch (currentView) {
      case 'generate':
        return 'AI Lead Generation';
      case 'leads':
        return 'Lead Management';
      case 'campaigns':
        return 'Campaigns';
      case 'outreach':
        return 'Outreach Management';
      default:
        return 'LeadGen Pro';
    }
  };

  const getViewIcon = () => {
    switch (currentView) {
      case 'generate':
        return <Sparkles className="h-5 w-5" />;
      case 'leads':
        return <Users className="h-5 w-5" />;
      case 'campaigns':
        return <Target className="h-5 w-5" />;
      case 'outreach':
        return <Send className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="hover:bg-accent"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          {getViewIcon()}
          <h1 className="font-semibold text-foreground">{getViewTitle()}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-sm text-primary font-medium">Pro</span>
        </div>
      </div>
    </header>
  );
}
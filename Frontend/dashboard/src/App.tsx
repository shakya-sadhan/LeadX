import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LeadGeneration } from './components/LeadGeneration';
import { LeadDashboard } from './components/LeadDashboard';
import { CampaignView } from './components/CampaignView';
import { CampaignCreationView } from './components/CampaignCreationView';
import { OutreachView } from './components/OutreachView';
import { EmailSequenceCreationView } from './components/EmailSequenceCreationView';
import { StepSequenceBuilder } from './components/StepSequenceBuilder';
import { LeadOutreachView } from './components/LeadOutreachView';
import { AnalyticsView } from './components/AnalyticsView';
import { TemplatesView } from './components/TemplatesView';
import { UserManagementView } from './components/UserManagementView';
import { AdminDashboard } from './components/AdminDashboard';

export type Lead = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  industry: string;
  location: string;
  description: string;
  score: number;
  isStarred: boolean;
  tags: string[];
  generatedAt: Date;
  category?: string; // New field for grouping leads
  source?: string; // Track where the lead came from (e.g., "AI Chat", "Manual Entry")
  chatTitle?: string; // Track which AI chat session generated this lead
};

export type Campaign = {
  id: string;
  name: string;
  description: string;
  leads: Lead[];
  createdAt: Date;
  goal?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  category?: string; // New field for grouping campaigns
};

export type OutreachSequence = {
  id: string;
  name: string;
  description: string;
  emails: OutreachEmail[];
  leads: Lead[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
};

export type OutreachEmail = {
  id: string;
  subject: string;
  content: string;
  delay: number; // Days after previous email
  isFollowUp: boolean;
};

export type OutreachActivity = {
  id: string;
  leadId: string;
  sequenceId: string;
  emailId: string;
  status: 'scheduled' | 'sent' | 'opened' | 'replied';
  scheduledFor: Date;
  sentAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  lastLoginAt?: Date;
  avatar?: string;
  permissions: string[];
  stats: {
    leadsGenerated: number;
    campaignsCreated: number;
    sequencesCreated: number;
    emailsSent: number;
  };
};

export type SystemActivity = {
  id: string;
  userId: string;
  action: string;
  target: string;
  details: string;
  timestamp: Date;
  ip?: string;
};

// Sample users for immediate testing
const sampleUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'admin',
    department: 'Sales',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date(),
    permissions: ['user_management', 'analytics', 'lead_generation', 'campaign_management'],
    stats: {
      leadsGenerated: 1250,
      campaignsCreated: 45,
      sequencesCreated: 23,
      emailsSent: 3200
    }
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'manager',
    department: 'Marketing',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    permissions: ['lead_generation', 'campaign_management', 'analytics'],
    stats: {
      leadsGenerated: 890,
      campaignsCreated: 32,
      sequencesCreated: 18,
      emailsSent: 2100
    }
  },
  {
    id: 'user-3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    role: 'user',
    department: 'Sales',
    status: 'active',
    createdAt: new Date('2024-03-10'),
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    permissions: ['lead_generation', 'campaign_management'],
    stats: {
      leadsGenerated: 456,
      campaignsCreated: 12,
      sequencesCreated: 8,
      emailsSent: 890
    }
  },
  {
    id: 'user-4',
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    role: 'user',
    department: 'Marketing',
    status: 'pending',
    createdAt: new Date('2024-09-01'),
    permissions: ['lead_generation'],
    stats: {
      leadsGenerated: 0,
      campaignsCreated: 0,
      sequencesCreated: 0,
      emailsSent: 0
    }
  }
];

const sampleActivities: SystemActivity[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    action: 'Created Campaign',
    target: 'Q4 Fintech Outreach',
    details: 'Campaign created with 25 leads',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ip: '192.168.1.101'
  },
  {
    id: 'activity-2',
    userId: 'user-2',
    action: 'Generated Leads',
    target: 'AI Lead Generation',
    details: '15 new leads generated for SaaS companies',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    ip: '192.168.1.102'
  },
  {
    id: 'activity-3',
    userId: 'user-3',
    action: 'Started Sequence',
    target: 'Follow-up Email Series',
    details: 'Email sequence started for 8 leads',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    ip: '192.168.1.103'
  }
];

// Sample leads for immediate testing
const sampleLeads: Lead[] = [
  {
    id: 'sample-1',
    name: "Sarah Chen",
    title: "Chief Technology Officer",
    company: "FinanceFlow",
    email: "sarah.chen@financeflow.com",
    phone: "+1 (555) 123-4567",
    linkedinUrl: "linkedin.com/in/sarahchen",
    industry: "Financial Technology",
    location: "San Francisco, CA",
    description: "Experienced CTO leading digital transformation at a fast-growing fintech startup. Focuses on scalable payment solutions and regulatory compliance technology.",
    score: 92,
    isStarred: false,
    tags: ["CTO", "Fintech", "Series B", "Payment Solutions"],
    generatedAt: new Date(),
    category: "High Value",
    source: "AI Chat",
    chatTitle: "Fintech Leaders in San Francisco"
  },
  {
    id: 'sample-2',
    name: "Michael Rodriguez",
    title: "VP of Engineering",
    company: "PayScale Pro",
    email: "m.rodriguez@payscalepro.com",
    phone: "+1 (555) 234-5678",
    linkedinUrl: "linkedin.com/in/mrodriguez",
    industry: "Financial Technology",
    location: "San Francisco, CA",
    description: "VP of Engineering with expertise in building secure financial platforms. Previously led teams at two successful fintech exits.",
    score: 88,
    isStarred: false,
    tags: ["VP Engineering", "Security", "Team Leadership"],
    generatedAt: new Date(),
    category: "High Value",
    source: "AI Chat",
    chatTitle: "Fintech Leaders in San Francisco"
  },
  {
    id: 'sample-3',
    name: "Jennifer Kim",
    title: "Head of Product",
    company: "CryptoLogic",
    email: "jennifer.kim@cryptologic.io",
    linkedinUrl: "linkedin.com/in/jenniferkim",
    industry: "Cryptocurrency",
    location: "San Francisco, CA", 
    description: "Product leader driving innovation in DeFi solutions. Strong background in user experience and regulatory compliance.",
    score: 85,
    isStarred: false,
    tags: ["Product Manager", "DeFi", "UX", "Compliance"],
    generatedAt: new Date(),
    category: "Medium Value",
    source: "AI Chat",
    chatTitle: "DeFi Product Managers"
  },
  {
    id: 'sample-4',
    name: "David Thompson",
    title: "Chief Marketing Officer",
    company: "TechFlow",
    email: "david.thompson@techflow.com",
    phone: "+1 (555) 345-6789",
    linkedinUrl: "linkedin.com/in/davidthompson",
    industry: "Software as a Service",
    location: "New York, NY",
    description: "CMO with proven track record in scaling B2B SaaS companies from startup to IPO. Expert in growth marketing and customer acquisition.",
    score: 90,
    isStarred: false,
    tags: ["CMO", "SaaS", "Growth Marketing", "B2B"],
    generatedAt: new Date(),
    category: "High Value",
    source: "Manual Entry"
  },
  {
    id: 'sample-5',
    name: "Alex Johnson",
    title: "Sales Director",
    company: "StartupHub",
    email: "alex.johnson@startuphub.com",
    phone: "+1 (555) 456-7890",
    industry: "Business Services",
    location: "Austin, TX",
    description: "Sales director specializing in B2B lead generation and conversion optimization for startup companies.",
    score: 76,
    isStarred: false,
    tags: ["Sales", "B2B", "Lead Generation", "Startups"],
    generatedAt: new Date(),
    category: "Medium Value",
    source: "AI Chat",
    chatTitle: "Small Business Sales Leaders"
  },
  {
    id: 'sample-6',
    name: "Maria Garcia",
    title: "Business Development Manager",
    company: "LocalTech",
    email: "maria.garcia@localtech.com",
    phone: "+1 (555) 567-8901",
    industry: "Business Services",
    location: "Miami, FL",
    description: "Business development expert helping local businesses adopt technology solutions for growth and efficiency.",
    score: 71,
    isStarred: false,
    tags: ["Business Development", "Local Business", "Tech Adoption"],
    generatedAt: new Date(),
    category: "Medium Value",
    source: "AI Chat",
    chatTitle: "Small Business Sales Leaders"
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'generate' | 'leads' | 'campaigns' | 'campaign-creation' | 'outreach' | 'sequence-creation' | 'sequence-builder' | 'lead-outreach' | 'analytics' | 'templates' | 'users' | 'admin' | 'settings' | 'campaign-detail'>('generate');
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'campaign-1',
      name: 'Q4 Fintech Outreach',
      description: 'Targeting fintech leaders for partnership opportunities',
      leads: sampleLeads.filter(l => l.industry === 'Financial Technology'),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      goal: 'partnership',
      priority: 'high',
      tags: ['Fintech', 'Partnership', 'Q4'],
      category: 'Partnerships'
    },
    {
      id: 'campaign-2',
      name: 'SaaS Lead Generation Campaign',
      description: 'Lead generation campaign for SaaS decision makers',
      leads: sampleLeads.filter(l => l.industry === 'Software as a Service'),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      goal: 'lead-generation',
      priority: 'medium',
      tags: ['SaaS', 'Lead Generation', 'B2B'],
      category: 'Customer Acquisition'
    },
    {
      id: 'campaign-3',
      name: 'Small Business Outreach',
      description: 'Outreach to small business owners for our business services',
      leads: sampleLeads.filter(l => l.chatTitle === 'Small Business Sales Leaders'),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      goal: 'sales',
      priority: 'medium',
      tags: ['Small Business', 'Sales', 'Local'],
      category: 'Customer Acquisition'
    }
  ]);
  const [outreachSequences, setOutreachSequences] = useState<OutreachSequence[]>([]);
  const [outreachActivities, setOutreachActivities] = useState<OutreachActivity[]>([]);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [systemActivities, setSystemActivities] = useState<SystemActivity[]>(sampleActivities);
  const [currentUser, setCurrentUser] = useState<User>(sampleUsers[0]); // Default to admin user
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLeadForOutreach, setSelectedLeadForOutreach] = useState<Lead | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [preselectedLeadsForSequence, setPreselectedLeadsForSequence] = useState<Lead[]>([]);
  
  // New state for managing categories
  const [leadCategories, setLeadCategories] = useState<string[]>(['High Value', 'Medium Value', 'Low Value', 'Prospects', 'Hot Leads']);
  const [campaignCategories, setCampaignCategories] = useState<string[]>(['Q4 2024', 'Partnerships', 'Product Launch', 'Customer Acquisition']);

  // New state for staged leads (leads generated but not yet saved to database)
  const [stagedLeads, setStagedLeads] = useState<Lead[]>([]);

  const toggleLeadStar = (leadId: string) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, isStarred: !lead.isStarred }
          : lead
      )
    );
  };

  const addLeads = (newLeads: Omit<Lead, 'id' | 'isStarred' | 'generatedAt'>[], chatTitle?: string) => {
    const defaultChatTitle = chatTitle || `Chat Session ${new Date().toLocaleDateString()}`;
    const leadsWithIds = newLeads.map(lead => ({
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      isStarred: false,
      generatedAt: new Date(),
      source: 'AI Chat', // Default source for AI-generated leads
      chatTitle: lead.chatTitle || defaultChatTitle
    }));
    setLeads(prev => [...prev, ...leadsWithIds]);
    
    // Auto-navigate to leads view after generation
    setTimeout(() => {
      setCurrentView('leads');
    }, 1000);
  };

  // New function to stage leads (for AI generation view)
  const stageLeads = (newLeads: Omit<Lead, 'id' | 'isStarred' | 'generatedAt'>[], chatTitle?: string) => {
    const defaultChatTitle = chatTitle || `Chat Session ${new Date().toLocaleDateString()}`;
    const leadsWithIds = newLeads.map(lead => ({
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      isStarred: false,
      generatedAt: new Date(),
      source: 'AI Chat', // Default source for AI-generated leads
      chatTitle: lead.chatTitle || defaultChatTitle
    }));
    setStagedLeads(leadsWithIds);
  };

  // Function to move staged leads to database
  const moveStagedLeadsToDatabase = () => {
    if (stagedLeads.length > 0) {
      setLeads(prev => [...prev, ...stagedLeads]);
      setStagedLeads([]); // Clear staged leads
      
      // Update user stats
      updateUserStats(currentUser.id, 'leadsGenerated', stagedLeads.length);
      
      // Auto-navigate to leads view
      setCurrentView('leads');
    }
  };

  // Function to start new chat (clear staged leads)
  const startNewChat = () => {
    setStagedLeads([]);
  };

  // New function to add a single lead manually
  const addSingleLead = (leadData: Omit<Lead, 'id' | 'isStarred' | 'generatedAt' | 'source'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      isStarred: false,
      generatedAt: new Date(),
      source: 'Manual Entry'
    };
    
    setLeads(prev => [...prev, newLead]);
    
    // Update user stats
    updateUserStats(currentUser.id, 'leadsGenerated');
    
    return newLead;
  };

  // Functions for managing lead categories
  const addLeadCategory = (categoryName: string) => {
    if (!leadCategories.includes(categoryName)) {
      setLeadCategories(prev => [...prev, categoryName]);
    }
  };

  const removeLeadCategory = (categoryName: string) => {
    setLeadCategories(prev => prev.filter(cat => cat !== categoryName));
    // Remove the category from existing leads
    setLeads(prev => prev.map(lead => 
      lead.category === categoryName ? { ...lead, category: undefined } : lead
    ));
  };

  const editLeadCategory = (oldName: string, newName: string) => {
    if (!leadCategories.includes(newName) && newName.trim()) {
      setLeadCategories(prev => prev.map(cat => cat === oldName ? newName : cat));
      // Update the category in existing leads
      setLeads(prev => prev.map(lead => 
        lead.category === oldName ? { ...lead, category: newName } : lead
      ));
    }
  };

  // Functions for managing campaign categories
  const addCampaignCategory = (categoryName: string) => {
    if (!campaignCategories.includes(categoryName)) {
      setCampaignCategories(prev => [...prev, categoryName]);
    }
  };

  const removeCampaignCategory = (categoryName: string) => {
    setCampaignCategories(prev => prev.filter(cat => cat !== categoryName));
    // Remove the category from existing campaigns
    setCampaigns(prev => prev.map(campaign => 
      campaign.category === categoryName ? { ...campaign, category: undefined } : campaign
    ));
  };

  const createCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setCurrentView('campaigns');
  };

  // Legacy function for backward compatibility
  const createCampaignLegacy = (name: string, description: string) => {
    const starredLeads = leads.filter(lead => lead.isStarred);
    if (starredLeads.length === 0) return;

    const newCampaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      leads: starredLeads,
      createdAt: new Date()
    };

    setCampaigns(prev => [...prev, newCampaign]);
    
    // Unstar leads after adding to campaign
    setLeads(prevLeads => 
      prevLeads.map(lead => ({ ...lead, isStarred: false }))
    );
  };

  const createOutreachSequence = (sequence: Omit<OutreachSequence, 'id' | 'createdAt'>) => {
    const newSequence: OutreachSequence = {
      ...sequence,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    setOutreachSequences(prev => [...prev, newSequence]);

    // Create outreach activities for each lead and email
    const activities: OutreachActivity[] = [];
    sequence.leads.forEach(lead => {
      let scheduledDate = new Date();
      sequence.emails.forEach(email => {
        const activity: OutreachActivity = {
          id: Math.random().toString(36).substr(2, 9),
          leadId: lead.id,
          sequenceId: newSequence.id,
          emailId: email.id,
          status: 'scheduled',
          scheduledFor: new Date(scheduledDate.getTime() + email.delay * 24 * 60 * 60 * 1000)
        };
        activities.push(activity);
        scheduledDate = activity.scheduledFor;
      });
    });

    setOutreachActivities(prev => [...prev, ...activities]);
  };

  const updateOutreachSequence = (sequenceId: string, updates: Partial<OutreachSequence>) => {
    setOutreachSequences(prev => prev.map(seq => 
      seq.id === sequenceId ? { ...seq, ...updates } : seq
    ));
  };

  const deleteOutreachSequence = (sequenceId: string) => {
    setOutreachSequences(prev => prev.filter(seq => seq.id !== sequenceId));
    setOutreachActivities(prev => prev.filter(activity => activity.sequenceId !== sequenceId));
  };

  // Simulate email activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOutreachActivities(prev => prev.map(activity => {
        if (activity.status === 'scheduled' && activity.scheduledFor <= new Date()) {
          // Simulate sending email
          const random = Math.random();
          if (random < 0.7) { // 70% chance of being sent
            return {
              ...activity,
              status: 'sent',
              sentAt: new Date()
            };
          }
        } else if (activity.status === 'sent' && activity.sentAt) {
          // Simulate opening email (30% chance after being sent for more than 1 hour)
          const hoursSinceSent = (new Date().getTime() - activity.sentAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceSent > 1 && Math.random() < 0.3) {
            return {
              ...activity,
              status: 'opened',
              openedAt: new Date()
            };
          }
        } else if (activity.status === 'opened' && activity.openedAt) {
          // Simulate replying (10% chance after being opened for more than 2 hours)
          const hoursSinceOpened = (new Date().getTime() - activity.openedAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceOpened > 2 && Math.random() < 0.1) {
            return {
              ...activity,
              status: 'replied',
              repliedAt: new Date()
            };
          }
        }
        return activity;
      }));
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate stats for sidebar
  const getOutreachStats = () => {
    const activeSequences = outreachSequences.filter(s => s.status === 'active').length;
    const totalSent = outreachActivities.filter(a => a.status === 'sent' || a.status === 'opened' || a.status === 'replied').length;
    const totalOpened = outreachActivities.filter(a => a.status === 'opened' || a.status === 'replied').length;
    const totalReplied = outreachActivities.filter(a => a.status === 'replied').length;

    return { activeSequences, totalSent, totalOpened, totalReplied };
  };

  const outreachStats = getOutreachStats();

  const startLeadOutreach = (lead: Lead) => {
    setSelectedLeadForOutreach(lead);
    setCurrentView('lead-outreach');
  };

  const createLeadOutreach = (emails: OutreachEmail[], name: string, description: string) => {
    if (!selectedLeadForOutreach) return;
    
    const sequence: Omit<OutreachSequence, 'id' | 'createdAt'> = {
      name,
      description,
      emails,
      leads: [selectedLeadForOutreach],
      status: 'draft'
    };
    
    createOutreachSequence(sequence);
    setCurrentView('outreach');
  };

  const startSequenceCreation = (preselectedLeads: Lead[] = []) => {
    setPreselectedLeadsForSequence(preselectedLeads);
    setCurrentView('sequence-builder');
  };

  const startSequenceCreationLegacy = (preselectedLeads: Lead[] = []) => {
    setPreselectedLeadsForSequence(preselectedLeads);
    setCurrentView('sequence-creation');
  };

  const viewCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCurrentView('campaign-detail');
  };

  // User management functions
  const createUser = (userData: Omit<User, 'id' | 'createdAt' | 'stats'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      stats: {
        leadsGenerated: 0,
        campaignsCreated: 0,
        sequencesCreated: 0,
        emailsSent: 0
      }
    };
    setUsers(prev => [...prev, newUser]);
    
    // Log activity
    const activity: SystemActivity = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      action: 'Created User',
      target: newUser.name,
      details: `New ${newUser.role} user created in ${newUser.department}`,
      timestamp: new Date()
    };
    setSystemActivities(prev => [activity, ...prev]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
    
    // Log activity
    const user = users.find(u => u.id === userId);
    if (user) {
      const activity: SystemActivity = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        action: 'Updated User',
        target: user.name,
        details: `User profile updated`,
        timestamp: new Date()
      };
      setSystemActivities(prev => [activity, ...prev]);
    }
  };

  const deleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    // Log activity
    if (user) {
      const activity: SystemActivity = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        action: 'Deleted User',
        target: user.name,
        details: `User account deleted`,
        timestamp: new Date()
      };
      setSystemActivities(prev => [activity, ...prev]);
    }
  };

  // Update user stats when actions are performed
  const updateUserStats = (userId: string, statType: keyof User['stats'], increment: number = 1) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            stats: { 
              ...user.stats, 
              [statType]: user.stats[statType] + increment 
            } 
          }
        : user
    ));
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentView={currentView}
        onViewChange={setCurrentView}
        leadCount={leads.length}
        starredCount={leads.filter(l => l.isStarred).length}
        campaignCount={campaigns.length}
        outreachCount={outreachSequences.length}
        activeSequences={outreachStats.activeSequences}
        totalSent={outreachStats.totalSent}
        totalOpened={outreachStats.totalOpened}
        totalReplied={outreachStats.totalReplied}
        userCount={users.length}
        currentUserRole={currentUser.role}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentView={currentView}
        />
        
        <main className="flex-1 overflow-hidden">
          {currentView === 'generate' && (
            <LeadGeneration 
              onLeadsGenerated={addLeads}
              stagedLeads={stagedLeads}
              onStageLeads={stageLeads}
              onMoveStagedLeadsToDatabase={moveStagedLeadsToDatabase}
              onStartNewChat={startNewChat}
            />
          )}
          {currentView === 'leads' && (
            <LeadDashboard 
              leads={leads}
              leadCategories={leadCategories}
              onToggleStar={toggleLeadStar}
              onCreateCampaign={createCampaignLegacy}
              onCreateOutreach={startSequenceCreation}
              onStartOutreach={startLeadOutreach}
              onNavigateToCampaignCreation={() => setCurrentView('campaign-creation')}
              onNavigateToSequenceCreation={() => setCurrentView('sequence-creation')}
              onAddLead={addSingleLead}
              onAddCategory={addLeadCategory}
              onRemoveCategory={removeLeadCategory}
              onEditCategory={editLeadCategory}
            />
          )}
          {currentView === 'lead-outreach' && selectedLeadForOutreach && (
            <LeadOutreachView 
              lead={selectedLeadForOutreach}
              onBack={() => setCurrentView('leads')}
              onCreateSequence={createLeadOutreach}
            />
          )}
          {currentView === 'campaigns' && (
            <CampaignView 
              campaigns={campaigns}
              campaignCategories={campaignCategories}
              onCreateCampaign={() => setCurrentView('campaign-creation')}
              onAddCategory={addCampaignCategory}
              onRemoveCategory={removeCampaignCategory}
              onViewCampaign={viewCampaignDetail}
              onBack={() => setCurrentView('campaigns')}
            />
          )}
          {currentView === 'campaign-creation' && (
            <CampaignCreationView 
              leads={leads}
              campaignCategories={campaignCategories}
              onBack={() => setCurrentView('campaigns')}
              onCreateCampaign={createCampaign}
            />
          )}
          {currentView === 'sequence-creation' && (
            <EmailSequenceCreationView 
              leads={leads}
              onBack={() => setCurrentView('outreach')}
              onCreateSequence={createOutreachSequence}
              preselectedLeads={preselectedLeadsForSequence}
            />
          )}
          {currentView === 'sequence-builder' && (
            <StepSequenceBuilder 
              leads={leads}
              onSave={(sequenceData) => {
                // Convert the step sequence to the existing format
                const emails = sequenceData.steps
                  .filter(step => step.type === 'email')
                  .map((step, index) => ({
                    id: step.id,
                    subject: step.settings?.subject || 'Email',
                    content: step.settings?.content || '',
                    delay: step.settings?.delay || 0,
                    isFollowUp: index > 0
                  }));

                const sequence: Omit<OutreachSequence, 'id' | 'createdAt'> = {
                  name: sequenceData.name,
                  description: sequenceData.description,
                  emails,
                  leads: sequenceData.leads,
                  status: 'draft' as const
                };

                createOutreachSequence(sequence);
                setCurrentView('outreach');
              }}
              onCancel={() => setCurrentView('outreach')}
              preselectedLeads={preselectedLeadsForSequence}
            />
          )}
          {currentView === 'outreach' && (
            <OutreachView 
              sequences={outreachSequences}
              activities={outreachActivities}
              leads={leads}
              onCreateSequence={createOutreachSequence}
              onUpdateSequence={updateOutreachSequence}
              onDeleteSequence={deleteOutreachSequence}
              onNavigateToSequenceCreation={() => setCurrentView('sequence-builder')}
              onNavigateToLegacyCreation={() => setCurrentView('sequence-creation')}
            />
          )}
          {currentView === 'analytics' && (
            <AnalyticsView 
              sequences={outreachSequences}
              activities={outreachActivities}
              leads={leads}
              campaigns={campaigns}
            />
          )}
          {currentView === 'templates' && (
            <TemplatesView />
          )}
          {currentView === 'users' && (
            <UserManagementView 
              users={users}
              currentUser={currentUser}
              onCreateUser={createUser}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
              systemActivities={systemActivities}
            />
          )}
          {currentView === 'admin' && (
            <AdminDashboard 
              users={users}
              leads={leads}
              campaigns={campaigns}
              sequences={outreachSequences}
              activities={outreachActivities}
              systemActivities={systemActivities}
              currentUser={currentUser}
            />
          )}
          {currentView === 'campaign-detail' && selectedCampaign && (
            <CampaignView 
              campaigns={[selectedCampaign]}
              campaignCategories={campaignCategories}
              onCreateCampaign={() => setCurrentView('campaign-creation')}
              onAddCategory={addCampaignCategory}
              onRemoveCategory={removeCampaignCategory}
              onViewCampaign={viewCampaignDetail}
              onBack={() => setCurrentView('campaigns')}
              isDetailView={true}
            />
          )}
        </main>
      </div>
    </div>
  );
}
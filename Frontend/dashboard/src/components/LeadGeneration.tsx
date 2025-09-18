import { useState } from 'react';
import { Send, Sparkles, Users, Building, MapPin, Lightbulb, CheckCircle, ArrowRight, Database, MessageSquare, Star, Mail, Phone, ExternalLink, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { motion } from 'motion/react';
import { cn } from './ui/utils';
import type { Lead } from '../App';

interface LeadGenerationProps {
  onLeadsGenerated: (leads: Omit<Lead, 'id' | 'isStarred' | 'generatedAt'>[], chatTitle?: string) => void;
  stagedLeads: Lead[];
  onStageLeads: (leads: Omit<Lead, 'id' | 'isStarred' | 'generatedAt'>[], chatTitle?: string) => void;
  onMoveStagedLeadsToDatabase: () => void;
  onStartNewChat: () => void;
}

export function LeadGeneration({ 
  onLeadsGenerated, 
  stagedLeads, 
  onStageLeads, 
  onMoveStagedLeadsToDatabase, 
  onStartNewChat 
}: LeadGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const examplePrompts = [
    "Find CTOs of fintech startups in San Francisco with 50-200 employees",
    "Generate leads for marketing managers at SaaS companies in New York", 
    "Find decision makers at healthcare tech companies in Boston",
    "Target retail executives at companies expanding internationally"
  ];

  const generateMockLeads = (userPrompt: string): Omit<Lead, 'id' | 'isStarred' | 'generatedAt'>[] => {
    const mockLeads = [
      {
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
        tags: ["CTO", "Fintech", "Series B", "Payment Solutions"],
        category: "High Value",
        chatTitle: userPrompt.slice(0, 50) + (userPrompt.length > 50 ? '...' : '')
      },
      {
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
        tags: ["VP Engineering", "Security", "Team Leadership"],
        category: "High Value",
        chatTitle: userPrompt.slice(0, 50) + (userPrompt.length > 50 ? '...' : '')
      },
      {
        name: "Jennifer Kim",
        title: "Head of Product",
        company: "CryptoLogic",
        email: "jennifer.kim@cryptologic.io",
        linkedinUrl: "linkedin.com/in/jenniferkim",
        industry: "Cryptocurrency",
        location: "San Francisco, CA", 
        description: "Product leader driving innovation in DeFi solutions. Strong background in user experience and regulatory compliance.",
        score: 85,
        tags: ["Product Manager", "DeFi", "UX", "Compliance"],
        category: "Medium Value",
        chatTitle: userPrompt.slice(0, 50) + (userPrompt.length > 50 ? '...' : '')
      }
    ];

    return mockLeads;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock leads
    const generatedLeads = generateMockLeads(prompt);
    const chatTitle = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
    
    // Stage the leads for display in table
    onStageLeads(generatedLeads, chatTitle);
    
    setPrompt('');
    setIsGenerating(false);
    setSelectedLeads(stagedLeads.map(lead => lead.id)); // Select all by default
  };

  const handleNewSearch = () => {
    onStartNewChat();
    setSelectedLeads([]);
    setPrompt('');
  };

  const handleSaveSelected = () => {
    if (selectedLeads.length > 0) {
      setShowSaveDialog(true);
    }
  };

  const handleSaveToDatabase = () => {
    if (searchTitle.trim()) {
      // Update the chat title for selected leads and save
      const leadsToSave = stagedLeads
        .filter(lead => selectedLeads.includes(lead.id))
        .map(lead => ({
          ...lead,
          chatTitle: searchTitle.trim()
        }));
      
      onLeadsGenerated(leadsToSave, searchTitle.trim());
      setSearchTitle('');
      setSelectedLeads([]);
      setShowSaveDialog(false);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    setSelectedLeads(
      selectedLeads.length === stagedLeads.length 
        ? [] 
        : stagedLeads.map(lead => lead.id)
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Results Header - only show when there are staged leads */}
      {stagedLeads.length > 0 && (
        <div className="p-4 bg-card border-b border-border">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Search Results</h3>
                <p className="text-sm text-muted-foreground">
                  Found {stagedLeads.length} leads • {selectedLeads.length} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleNewSearch}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                New Search
              </Button>
              <Button
                onClick={handleSaveSelected}
                disabled={selectedLeads.length === 0}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Selected ({selectedLeads.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {stagedLeads.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">AI Lead Generation</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Describe your ideal customer profile and let AI find the perfect leads for your business.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Example Prompts
                </CardTitle>
                <CardDescription>
                  Try these prompts to get started, or create your own
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {examplePrompts.map((example, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    onClick={() => setPrompt(example)}
                  >
                    <p className="text-sm">{example}</p>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Results table */}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Generated Leads</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllLeads}
                    >
                      {selectedLeads.length === stagedLeads.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLeads.length === stagedLeads.length && stagedLeads.length > 0}
                        onCheckedChange={selectAllLeads}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagedLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className={cn(
                        "hover:bg-muted/50 cursor-pointer",
                        selectedLeads.includes(lead.id) && "bg-muted/30"
                      )}
                      onClick={() => toggleLeadSelection(lead.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                        />
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
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`mailto:${lead.email}`, '_blank');
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {lead.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${lead.phone}`, '_blank');
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          {lead.linkedinUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://${lead.linkedinUrl}`, '_blank');
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="bg-muted p-6 rounded-lg flex items-center gap-3">
              <div className="animate-spin">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Generating leads...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Search input */}
      <div className="p-6 border-t border-border bg-card/50">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your ideal leads... (e.g., 'Find CTOs at Series A startups in fintech')"
              className="flex-1 min-h-[60px] resize-none"
              disabled={isGenerating}
            />
            <Button 
              type="submit" 
              disabled={!prompt.trim() || isGenerating}
              className="px-6"
            >
              {isGenerating ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg border shadow-lg max-w-md w-full mx-4"
          >
            <h3 className="font-semibold mb-4">Save Search Results</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Search Title</label>
                <Input
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Enter a title for this search..."
                  className="mt-1"
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedLeads.length} leads will be saved to your database.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveToDatabase}
                disabled={!searchTitle.trim()}
                className="flex-1"
              >
                Save to Database
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
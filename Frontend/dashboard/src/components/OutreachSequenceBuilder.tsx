import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Mail, 
  Clock, 
  RotateCcw,
  GitBranch,
  Play,
  Plus,
  Trash2,
  Edit3,
  Save,
  Settings,
  Target,
  Zap,
  MessageSquare,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Globe,
  FileText,
  Database,
  Timer,
  Star,
  Search,
  Filter,
  Eye,
  X,
  Move,
  ArrowRight,
  ChevronDown,
  Activity,
  Calendar as CalendarIcon,
  MapPin,
  Building,
  BarChart3,
  Type,
  Hash,
  AtSign,
  User,
  Copy,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerClose } from './ui/drawer';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import type { OutreachEmail, Lead } from '../App';

interface FlowNode {
  id: string;
  type: 'start' | 'email' | 'wait' | 'condition' | 'action' | 'end';
  position: { x: number; y: number };
  data: {
    title: string;
    description?: string;
    settings?: any;
  };
  connections: string[];
}

interface OutreachAction {
  id: string;
  type: 'email' | 'wait' | 'condition' | 'linkedin' | 'phone' | 'task' | 'webhook';
  icon: any;
  title: string;
  description: string;
  color: string;
}

interface Connection {
  from: string;
  to: string;
  fromNode: FlowNode;
  toNode: FlowNode;
}

// Personalization variables available for emails and messages
const personalizationVariables = [
  { key: 'firstName', label: 'First Name', description: 'Lead\'s first name' },
  { key: 'lastName', label: 'Last Name', description: 'Lead\'s last name' },
  { key: 'fullName', label: 'Full Name', description: 'Lead\'s full name' },
  { key: 'company', label: 'Company', description: 'Lead\'s company name' },
  { key: 'title', label: 'Job Title', description: 'Lead\'s job title' },
  { key: 'industry', label: 'Industry', description: 'Lead\'s industry' },
  { key: 'location', label: 'Location', description: 'Lead\'s location' },
  { key: 'email', label: 'Email', description: 'Lead\'s email address' },
  { key: 'phone', label: 'Phone', description: 'Lead\'s phone number' },
  { key: 'linkedinUrl', label: 'LinkedIn URL', description: 'Lead\'s LinkedIn profile' },
  { key: 'senderName', label: 'Sender Name', description: 'Your name' },
  { key: 'senderTitle', label: 'Sender Title', description: 'Your job title' },
  { key: 'senderCompany', label: 'Sender Company', description: 'Your company' },
  { key: 'currentDate', label: 'Current Date', description: 'Today\'s date' },
  { key: 'currentTime', label: 'Current Time', description: 'Current time' }
];

// Condition options for If/Then logic
const conditionOptions = [
  { value: 'email_opened', label: 'Email Opened', description: 'Lead opened the email' },
  { value: 'email_clicked', label: 'Email Clicked', description: 'Lead clicked a link in the email' },
  { value: 'email_replied', label: 'Email Replied', description: 'Lead replied to the email' },
  { value: 'linkedin_connected', label: 'LinkedIn Connected', description: 'Lead accepted LinkedIn connection' },
  { value: 'linkedin_replied', label: 'LinkedIn Replied', description: 'Lead replied on LinkedIn' },
  { value: 'phone_answered', label: 'Phone Answered', description: 'Lead answered the phone call' },
  { value: 'task_completed', label: 'Task Completed', description: 'Manual task was completed' },
  { value: 'score_above', label: 'Score Above', description: 'Lead score is above threshold' },
  { value: 'industry_is', label: 'Industry Is', description: 'Lead\'s industry matches' },
  { value: 'title_contains', label: 'Title Contains', description: 'Lead\'s title contains keyword' },
  { value: 'company_size', label: 'Company Size', description: 'Company size meets criteria' },
  { value: 'days_elapsed', label: 'Days Elapsed', description: 'Specific number of days have passed' }
];

const outreachActions: OutreachAction[] = [
  {
    id: 'email',
    type: 'email',
    icon: Mail,
    title: 'Send Email',
    description: 'Send a personalized email to the lead',
    color: 'blue'
  },
  {
    id: 'wait',
    type: 'wait',
    icon: Clock,
    title: 'Wait/Delay',
    description: 'Add a delay before the next action',
    color: 'gray'
  },
  {
    id: 'condition',
    type: 'condition',
    icon: AlertTriangle,
    title: 'If/Then Condition',
    description: 'Branch based on lead behavior or data',
    color: 'yellow'
  },
  {
    id: 'linkedin',
    type: 'linkedin',
    icon: MessageSquare,
    title: 'LinkedIn Message',
    description: 'Send a LinkedIn connection request or message',
    color: 'indigo'
  },
  {
    id: 'phone',
    type: 'phone',
    icon: Phone,
    title: 'Schedule Call',
    description: 'Schedule a follow-up call or meeting',
    color: 'green'
  },
  {
    id: 'task',
    type: 'task',
    icon: CheckCircle,
    title: 'Manual Task',
    description: 'Create a manual task or reminder',
    color: 'purple'
  },
  {
    id: 'webhook',
    type: 'webhook',
    icon: Zap,
    title: 'Webhook/API',
    description: 'Trigger external system or API call',
    color: 'orange'
  }
];

interface OutreachSequenceBuilderProps {
  onSave: (sequence: { name: string; description: string; nodes: FlowNode[]; leads: Lead[] }) => void;
  onCancel: () => void;
  leads: Lead[];
  preselectedLeads?: Lead[];
  existingSequence?: any;
}

export function OutreachSequenceBuilder({ 
  onSave, 
  onCancel, 
  leads, 
  preselectedLeads = [],
  existingSequence 
}: OutreachSequenceBuilderProps) {
  const [sequenceName, setSequenceName] = useState(existingSequence?.name || '');
  const [sequenceDescription, setSequenceDescription] = useState(existingSequence?.description || '');
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>(preselectedLeads);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadFilterTab, setLeadFilterTab] = useState<'all' | 'starred' | 'selected'>('all');
  
  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 200 },
      data: { title: 'Start' },
      connections: []
    }
  ]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [draggedAction, setDraggedAction] = useState<OutreachAction | null>(null);
  const [draggedNode, setDraggedNode] = useState<FlowNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNodeSettings, setShowNodeSettings] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nextNodeId, setNextNodeId] = useState(1);

  // Refs for node settings inputs (must be at component top level)
  const emailContentRef = useRef<HTMLTextAreaElement>(null);
  const emailSubjectRef = useRef<HTMLInputElement>(null);
  const linkedinMessageRef = useRef<HTMLTextAreaElement>(null);

  // Filter leads based on search and tabs
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = leadSearchQuery === '' || 
      lead.name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.title.toLowerCase().includes(leadSearchQuery.toLowerCase());
    
    const matchesFilter = leadFilterTab === 'all' || 
      (leadFilterTab === 'starred' && lead.isStarred) ||
      (leadFilterTab === 'selected' && selectedLeads.some(l => l.id === lead.id));
    
    return matchesSearch && matchesFilter;
  });

  // Auto-connect nodes when dropped near each other
  const findNearestNode = (x: number, y: number, excludeId: string) => {
    let nearest = null;
    let minDistance = 150; // Maximum connection distance
    
    nodes.forEach(node => {
      if (node.id === excludeId) return;
      
      const distance = Math.sqrt(
        Math.pow(node.position.x + 80 - x, 2) + 
        Math.pow(node.position.y + 40 - y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    });
    
    return nearest;
  };

  const handleDragStart = (action: OutreachAction) => {
    setDraggedAction(action);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowNode) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggedNode(node);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    setNodes(prev => prev.map(node => 
      node.id === draggedNode.id 
        ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : node
    ));
  }, [draggedNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedAction || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: FlowNode = {
      id: `node-${nextNodeId}`,
      type: draggedAction.type as any,
      position: { x: x - 80, y: y - 40 },
      data: {
        title: draggedAction.title,
        description: draggedAction.description,
        settings: getDefaultSettings(draggedAction.type)
      },
      connections: []
    };

    // Auto-connect to nearest node
    const nearestNode = findNearestNode(x, y, newNode.id);
    if (nearestNode && !nearestNode.connections.includes(newNode.id)) {
      nearestNode.connections.push(newNode.id);
    }

    setNodes(prev => [...prev, newNode]);
    setNextNodeId(prev => prev + 1);
    setDraggedAction(null);
  };

  const getDefaultSettings = (type: string) => {
    switch (type) {
      case 'email':
        return {
          subject: 'Follow up on our conversation',
          content: `Hi {{firstName}},

I wanted to follow up on our previous conversation...

Best regards,
{{senderName}}`,
          delay: 0,
          delayUnit: 'days'
        };
      case 'wait':
        return {
          duration: 1,
          unit: 'days'
        };
      case 'condition':
        return {
          condition: 'email_opened',
          operator: 'is',
          value: 'true',
          trueConnection: null,
          falseConnection: null
        };
      case 'linkedin':
        return {
          message: `Hi {{firstName}}, I'd love to connect with you!`,
          connectionRequest: true,
          delay: 0,
          delayUnit: 'days'
        };
      case 'phone':
        return {
          taskTitle: 'Call {{firstName}} at {{company}}',
          duration: 30,
          notes: '',
          delay: 0,
          delayUnit: 'days'
        };
      case 'task':
        return {
          taskTitle: 'Manual task for {{firstName}}',
          description: 'Complete this task manually',
          priority: 'medium',
          delay: 0,
          delayUnit: 'days'
        };
      case 'webhook':
        return {
          url: '',
          method: 'POST',
          headers: {},
          payload: {},
          delay: 0,
          delayUnit: 'days'
        };
      default:
        return {};
    }
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'start') return;
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    // Also remove connections to this node
    setNodes(prev => prev.map(node => ({
      ...node,
      connections: node.connections.filter(id => id !== nodeId)
    })));
  };

  const connectNodes = (fromId: string, toId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === fromId 
        ? { ...node, connections: [...node.connections.filter(id => id !== toId), toId] }
        : node
    ));
    setConnectingFrom(null);
  };

  const updateNodeData = (nodeId: string, data: any) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...data } }
        : node
    ));
  };

  // Generate connections for rendering lines
  const getConnections = (): Connection[] => {
    const connections: Connection[] = [];
    nodes.forEach(fromNode => {
      fromNode.connections.forEach(toNodeId => {
        const toNode = nodes.find(n => n.id === toNodeId);
        if (toNode) {
          connections.push({
            from: fromNode.id,
            to: toNodeId,
            fromNode,
            toNode
          });
        }
      });
    });
    return connections;
  };

  const renderConnectionLines = () => {
    const connections = getConnections();
    
    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {connections.map((connection, index) => {
          const fromX = connection.fromNode.position.x + 160; // Right side of node
          const fromY = connection.fromNode.position.y + 40; // Center of node
          const toX = connection.toNode.position.x; // Left side of node
          const toY = connection.toNode.position.y + 40; // Center of node
          
          // Create a curved path for better visuals
          const midX = (fromX + toX) / 2;
          const controlPointOffset = Math.abs(fromX - toX) * 0.3;
          
          const pathData = `M ${fromX} ${fromY} C ${fromX + controlPointOffset} ${fromY} ${toX - controlPointOffset} ${toY} ${toX} ${toY}`;
          
          return (
            <g key={`${connection.from}-${connection.to}`}>
              <path
                d={pathData}
                stroke="rgb(59 130 246)"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-sm"
              />
              {/* Arrow head */}
              <polygon
                points={`${toX},${toY} ${toX-8},${toY-4} ${toX-8},${toY+4}`}
                fill="rgb(59 130 246)"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderNode = (node: FlowNode) => {
    const nodeColors = {
      start: 'bg-green-100 border-green-400 text-green-800',
      email: 'bg-blue-100 border-blue-400 text-blue-800',
      wait: 'bg-gray-100 border-gray-400 text-gray-800',
      condition: 'bg-yellow-100 border-yellow-400 text-yellow-800',
      linkedin: 'bg-indigo-100 border-indigo-400 text-indigo-800',
      phone: 'bg-green-100 border-green-400 text-green-800',
      task: 'bg-purple-100 border-purple-400 text-purple-800',
      webhook: 'bg-orange-100 border-orange-400 text-orange-800',
      end: 'bg-red-100 border-red-400 text-red-800'
    };

    const nodeIcons = {
      start: Play,
      email: Mail,
      wait: Clock,
      condition: AlertTriangle,
      linkedin: MessageSquare,
      phone: Phone,
      task: CheckCircle,
      webhook: Zap,
      end: XCircle
    };

    const Icon = nodeIcons[node.type] || Play;

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'absolute w-40 h-20 rounded-lg border-2 cursor-move flex items-center justify-center p-2 shadow-md hover:shadow-lg transition-all bg-white',
          nodeColors[node.type],
          selectedNode?.id === node.id && 'ring-2 ring-blue-500 ring-offset-2',
          connectingFrom === node.id && 'ring-2 ring-orange-500 ring-offset-2 animate-pulse',
          draggedNode?.id === node.id && 'shadow-2xl scale-105'
        )}
        style={{ left: node.position.x, top: node.position.y, zIndex: draggedNode?.id === node.id ? 10 : 2 }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        onClick={() => {
          if (connectingFrom && connectingFrom !== node.id) {
            connectNodes(connectingFrom, node.id);
          } else {
            setSelectedNode(node);
            if (node.type !== 'start') {
              setShowNodeSettings(true);
            }
          }
        }}
      >
        <div className="text-center pointer-events-none">
          <Icon className="h-5 w-5 mx-auto mb-1" />
          <div className="text-xs font-medium truncate">{node.data.title}</div>
        </div>
        
        {/* Move handle */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="h-3 w-3 text-gray-600" />
        </div>
        
        {/* Connection button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute -bottom-2 -right-2 h-6 w-6 p-0 rounded-full",
            connectingFrom === node.id 
              ? "bg-orange-500 hover:bg-orange-600 text-white animate-pulse" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setConnectingFrom(connectingFrom === node.id ? null : node.id);
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
        
        {node.id !== 'start' && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  };

  const toggleLeadSelection = (lead: Lead) => {
    setSelectedLeads(prev => {
      const isSelected = prev.some(l => l.id === lead.id);
      if (isSelected) {
        return prev.filter(l => l.id !== lead.id);
      } else {
        return [...prev, lead];
      }
    });
  };

  const selectAllFilteredLeads = () => {
    const unselectedFiltered = filteredLeads.filter(lead => 
      !selectedLeads.some(l => l.id === lead.id)
    );
    setSelectedLeads(prev => [...prev, ...unselectedFiltered]);
  };

  const deselectAllFilteredLeads = () => {
    const filteredLeadIds = filteredLeads.map(l => l.id);
    setSelectedLeads(prev => prev.filter(lead => !filteredLeadIds.includes(lead.id)));
  };

  // Enhanced personalization helper
  const insertPersonalizationVariable = (variable: string, textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newText = before + `{{${variable}}}` + after;
    textarea.value = newText;
    
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Set cursor position after the inserted variable
    const newCursorPos = start + `{{${variable}}}`.length;
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const renderPersonalizationPanel = (textareaRef: React.RefObject<HTMLTextAreaElement>) => (
    <div className="bg-muted/30 rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="font-medium text-sm">Personalization Variables</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {personalizationVariables.map(variable => (
          <Button
            key={variable.key}
            variant="outline"
            size="sm"
            className="justify-start h-8 text-xs"
            onClick={() => insertPersonalizationVariable(variable.key, textareaRef)}
          >
            <span className="font-mono text-blue-600">{`{{${variable.key}}}`}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Click any variable to insert it at your cursor position.
      </p>
    </div>
  );

  // Enhanced node settings drawer
  const renderNodeSettings = () => {
    if (!selectedNode || !showNodeSettings) return null;

    return (
      <Drawer open={showNodeSettings} onOpenChange={setShowNodeSettings}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure {selectedNode.data.title}
            </DrawerTitle>
            <DrawerDescription>
              Customize the settings for this sequence step.
            </DrawerDescription>
          </DrawerHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-6">
              {/* Email Node Settings */}
              {selectedNode.type === 'email' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      ref={emailSubjectRef}
                      value={selectedNode.data.settings?.subject || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, subject: e.target.value }
                      })}
                      placeholder="Enter email subject line..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-content">Email Content</Label>
                    <Textarea
                      id="email-content"
                      ref={emailContentRef}
                      value={selectedNode.data.settings?.content || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, content: e.target.value }
                      })}
                      placeholder="Enter your email message..."
                      rows={8}
                      className="resize-none"
                    />
                    {renderPersonalizationPanel(emailContentRef)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email-delay">Delay</Label>
                      <Input
                        id="email-delay"
                        type="number"
                        min="0"
                        value={selectedNode.data.settings?.delay || 0}
                        onChange={(e) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, delay: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-delay-unit">Unit</Label>
                      <Select
                        value={selectedNode.data.settings?.delayUnit || 'days'}
                        onValueChange={(value) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, delayUnit: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Node Settings */}
              {selectedNode.type === 'linkedin' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="connection-request"
                      checked={selectedNode.data.settings?.connectionRequest || false}
                      onCheckedChange={(checked) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, connectionRequest: checked }
                      })}
                    />
                    <Label htmlFor="connection-request">Send connection request first</Label>
                  </div>

                  <div>
                    <Label htmlFor="linkedin-message">LinkedIn Message</Label>
                    <Textarea
                      id="linkedin-message"
                      ref={linkedinMessageRef}
                      value={selectedNode.data.settings?.message || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, message: e.target.value }
                      })}
                      placeholder="Enter your LinkedIn message..."
                      rows={6}
                      className="resize-none"
                    />
                    {renderPersonalizationPanel(linkedinMessageRef)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin-delay">Delay</Label>
                      <Input
                        id="linkedin-delay"
                        type="number"
                        min="0"
                        value={selectedNode.data.settings?.delay || 0}
                        onChange={(e) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, delay: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin-delay-unit">Unit</Label>
                      <Select
                        value={selectedNode.data.settings?.delayUnit || 'days'}
                        onValueChange={(value) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, delayUnit: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Wait Node Settings */}
              {selectedNode.type === 'wait' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wait-duration">Duration</Label>
                      <Input
                        id="wait-duration"
                        type="number"
                        min="1"
                        value={selectedNode.data.settings?.duration || 1}
                        onChange={(e) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, duration: parseInt(e.target.value) || 1 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wait-unit">Unit</Label>
                      <Select
                        value={selectedNode.data.settings?.unit || 'days'}
                        onValueChange={(value) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, unit: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition Node Settings */}
              {selectedNode.type === 'condition' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="condition-type">Condition Type</Label>
                    <Select
                      value={selectedNode.data.settings?.condition || 'email_opened'}
                      onValueChange={(value) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, condition: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div>{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedNode.data.settings?.condition === 'score_above' || 
                    selectedNode.data.settings?.condition === 'industry_is' ||
                    selectedNode.data.settings?.condition === 'title_contains' ||
                    selectedNode.data.settings?.condition === 'company_size' ||
                    selectedNode.data.settings?.condition === 'days_elapsed') && (
                    <div>
                      <Label htmlFor="condition-value">Value</Label>
                      <Input
                        id="condition-value"
                        value={selectedNode.data.settings?.value || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, value: e.target.value }
                        })}
                        placeholder="Enter condition value..."
                      />
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium mb-2">Condition Logic:</p>
                    <p>Connect nodes to this condition node. When the condition is met, the sequence will follow the "Yes" path. When not met, it follows the "No" path.</p>
                  </div>
                </div>
              )}

              {/* Phone Node Settings */}
              {selectedNode.type === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={selectedNode.data.settings?.taskTitle || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, taskTitle: e.target.value }
                      })}
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="call-duration">Call Duration (minutes)</Label>
                      <Input
                        id="call-duration"
                        type="number"
                        min="5"
                        value={selectedNode.data.settings?.duration || 30}
                        onChange={(e) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, duration: parseInt(e.target.value) || 30 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone-delay">Delay</Label>
                      <Input
                        id="phone-delay"
                        type="number"
                        min="0"
                        value={selectedNode.data.settings?.delay || 0}
                        onChange={(e) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, delay: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="call-notes">Call Notes</Label>
                    <Textarea
                      id="call-notes"
                      value={selectedNode.data.settings?.notes || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, notes: e.target.value }
                      })}
                      placeholder="Enter call notes or agenda..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Task Node Settings */}
              {selectedNode.type === 'task' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="manual-task-title">Task Title</Label>
                    <Input
                      id="manual-task-title"
                      value={selectedNode.data.settings?.taskTitle || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, taskTitle: e.target.value }
                      })}
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">Task Description</Label>
                    <Textarea
                      id="task-description"
                      value={selectedNode.data.settings?.description || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, description: e.target.value }
                      })}
                      placeholder="Enter task description..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select
                        value={selectedNode.data.settings?.priority || 'medium'}
                        onValueChange={(value) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, priority: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="task-delay">Delay (days)</Label>
                      <Input
                        id="task-delay"
                        type="number"
                        min="0"
                        value={selectedNode.data.settings?.delay || 0}
                        onChange={(e) => updateNodeData(selectedNode.id, {
                          settings: { ...selectedNode.data.settings, delay: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Webhook Node Settings */}
              {selectedNode.type === 'webhook' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={selectedNode.data.settings?.url || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, url: e.target.value }
                      })}
                      placeholder="https://your-webhook-url.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhook-method">HTTP Method</Label>
                    <Select
                      value={selectedNode.data.settings?.method || 'POST'}
                      onValueChange={(value) => updateNodeData(selectedNode.id, {
                        settings: { ...selectedNode.data.settings, method: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="GET">GET</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="webhook-payload">Payload (JSON)</Label>
                    <Textarea
                      id="webhook-payload"
                      value={JSON.stringify(selectedNode.data.settings?.payload || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const payload = JSON.parse(e.target.value);
                          updateNodeData(selectedNode.id, {
                            settings: { ...selectedNode.data.settings, payload }
                          });
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder='{"key": "value"}'
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowNodeSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowNodeSettings(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  };

  const renderLeadSelector = () => {
    return (
      <Dialog open={showLeadSelector} onOpenChange={setShowLeadSelector}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Leads for Sequence
            </DialogTitle>
            <DialogDescription>
              Choose the leads you want to include in this outreach sequence.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads by name, company, or title..."
                  value={leadSearchQuery}
                  onChange={(e) => setLeadSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllFilteredLeads}
                  disabled={filteredLeads.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllFilteredLeads}
                  disabled={selectedLeads.length === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <span>Showing {filteredLeads.length} of {leads.length} leads</span>
              <span>{selectedLeads.length} selected</span>
            </div>

            {/* Tabs */}
            <Tabs value={leadFilterTab} onValueChange={(value: any) => setLeadFilterTab(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All Leads ({leads.length})
                </TabsTrigger>
                <TabsTrigger value="starred">
                  Starred ({leads.filter(l => l.isStarred).length})
                </TabsTrigger>
                <TabsTrigger value="selected">
                  Selected ({selectedLeads.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={leadFilterTab} className="flex-1">
                <ScrollArea className="h-[500px] w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredLeads.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No leads found matching your criteria</p>
                      </div>
                    ) : (
                      filteredLeads.map(lead => {
                        const isSelected = selectedLeads.some(l => l.id === lead.id);
                        return (
                          <Card 
                            key={lead.id}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              isSelected && "border-blue-500 bg-blue-50/50"
                            )}
                            onClick={() => toggleLeadSelection(lead)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => toggleLeadSelection(lead)}
                                />
                                {lead.isStarred && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <h4 className="font-medium">{lead.name}</h4>
                                  <p className="text-sm text-muted-foreground">{lead.title}</p>
                                </div>
                                
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Building className="h-3 w-3" />
                                  <span>{lead.company}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{lead.location}</span>
                                </div>
                                
                                <Badge variant="secondary">{lead.score} score</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowLeadSelector(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowLeadSelector(false)}>
                Done ({selectedLeads.length} selected)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleSave = () => {
    if (!sequenceName.trim()) {
      alert('Please enter a sequence name');
      return;
    }

    if (selectedLeads.length === 0) {
      alert('Please select at least one lead');
      return;
    }

    onSave({
      name: sequenceName,
      description: sequenceDescription,
      nodes,
      leads: selectedLeads
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Sequence Builder</h1>
            <p className="text-muted-foreground">Create visual outreach sequences with drag-and-drop</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Sequence
            </Button>
          </div>
        </div>

        {/* Sequence basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sequence-name">Sequence Name</Label>
            <Input
              id="sequence-name"
              value={sequenceName}
              onChange={(e) => setSequenceName(e.target.value)}
              placeholder="Enter sequence name..."
            />
          </div>
          <div>
            <Label htmlFor="sequence-description">Description (Optional)</Label>
            <Input
              id="sequence-description"
              value={sequenceDescription}
              onChange={(e) => setSequenceDescription(e.target.value)}
              placeholder="Brief description..."
            />
          </div>
        </div>

        {/* Selected leads info */}
        <div className="flex items-center justify-between mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">
              {selectedLeads.length > 0 
                ? `${selectedLeads.length} lead${selectedLeads.length === 1 ? '' : 's'} selected`
                : 'No leads selected'
              }
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowLeadSelector(true)}>
            {selectedLeads.length > 0 ? 'Change Leads' : 'Select Leads'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Toolbox */}
        <div className="w-64 border-r bg-muted/30">
          <div className="p-4">
            <h3 className="font-medium mb-4">Drag & Drop Actions</h3>
            <div className="space-y-2">
              {outreachActions.map(action => (
                <motion.div
                  key={action.id}
                  draggable
                  onDragStart={() => handleDragStart(action)}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <action.icon className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-auto bg-gray-50">
          <div
            ref={canvasRef}
            className="relative w-full h-full min-h-[600px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ background: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            {renderConnectionLines()}
            {nodes.map(renderNode)}
            
            {connectingFrom && (
              <div className="absolute top-4 left-4 bg-orange-100 border border-orange-300 text-orange-800 px-3 py-2 rounded-lg">
                Click another node to connect
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs and Drawers */}
      {renderLeadSelector()}
      {renderNodeSettings()}
    </div>
  );
}
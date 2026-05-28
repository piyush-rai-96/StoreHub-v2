import React, { useState, useEffect, useMemo, useRef } from 'react';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import WbCloudyOutlined from '@mui/icons-material/WbCloudyOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import Check from '@mui/icons-material/Check';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import Remove from '@mui/icons-material/Remove';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import DirectionsWalkOutlined from '@mui/icons-material/DirectionsWalkOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import CompareArrowsOutlined from '@mui/icons-material/CompareArrowsOutlined';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import SyncOutlined from '@mui/icons-material/SyncOutlined';
import GridOnOutlined from '@mui/icons-material/GridOnOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import { Button, Card } from 'impact-ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AudioPlayer } from '../components/common/AudioPlayer';
import '../components/common/AudioPlayer.css';
import {
  SystemState,
  ActionItem,
  BroadcastMessage,
  Priority
} from '../types/storeOperations';
import './StoreOpsHome.css';
import womensWallPlanogram from '../assets/C&A_WOMENS_WALL_STANDARD.png';
import { HQHome } from './HQHome';
import { openAskAlan } from '../utils/openAskAlan';

// Detail Panel types
type PanelSubView = 
  | null 
  | { view: 'assign-task'; parentTitle: string }
  | { view: 'review-skus'; parentTitle: string; storeFilter?: string }
  | { view: 'acknowledged'; broadcastTitle: string }
  | { view: 'checklist-progress'; parentTitle: string }
  | { view: 'shipment-validate'; parentTitle: string }
  | { view: 'escalation-respond'; parentTitle: string; escalationId: string };

interface AlertPanelData {
  id: string;
  severity: 'critical' | 'warning' | 'risk';
  title: string;
  description: string;
  impactSummary: string;
  stores: { id: string; name: string; status: string; detail: string; manager?: string }[];
  ctas: { label: string; icon: string; action: string; kind: 'navigate' | 'panel-action' }[];
  source?: string;
  timestamp?: string;
}

interface BroadcastPanelData {
  id: string;
  priority: string;
  category: string;
  title: string;
  description: string;
  fullMessage: string;
  sender: string;
  senderRole: string;
  timestamp: string;
  requiresAcknowledgement: boolean;
  isAcknowledged: boolean;
  scope: string;
  keyDates: { label: string; date: string }[];
  actionItems: { text: string; done: boolean }[];
  attachments: { name: string; type: string }[];
}

type DetailPanelState =
  | { type: 'alert'; data: AlertPanelData }
  | { type: 'broadcast'; data: BroadcastPanelData }
  | { type: 'action'; data: ActionItemV2 }
  | null;

// Enhanced Insight type for headline-driven cards
interface InsightItem {
  id: string;
  type: 'risk' | 'positive' | 'watch' | 'info';
  headline: string;
  context: string;
  signal: string;
  trend?: 'up' | 'down' | 'neutral';
  actionHint?: string;
}

// Enhanced InsightItem with more actionable data
interface EnhancedInsightItem extends InsightItem {
  isHero?: boolean;
  actionCta?: string;
  impactDetail?: string;
  topStore?: string;
  overdueCount?: number;
}

// Mock data generators - headline-driven insights with hero card
const generateMockInsights = (): EnhancedInsightItem[] => [
  {
    id: '2',
    type: 'risk',
    headline: 'Inventory Risk',
    context: '12 SKUs below safety stock — immediate reorder needed',
    signal: '3 stores impacted',
    trend: 'down',
    actionHint: 'View Stores',
    actionCta: 'Review SKUs at Risk',
    isHero: true,
    impactDetail: 'Potential $24K revenue loss if unresolved',
    topStore: 'Store #1234 most critical',
    overdueCount: 2,
  },
  {
    id: '1',
    type: 'positive',
    headline: 'Strong Sales Performance',
    context: 'All stores exceeding targets — monitor sustainability',
    signal: '+8% vs target',
    trend: 'up',
    actionHint: 'View top performers',
    topStore: 'Store #1234 leading',
  },
  {
    id: '3',
    type: 'info',
    headline: 'Compliance On Track',
    context: 'All audits completed — no action needed',
    signal: '100% complete',
    trend: 'neutral',
  },
  {
    id: '4',
    type: 'positive',
    headline: 'Customer Satisfaction Up',
    context: 'VoC Score improved in North region — scale best practices',
    signal: '+12 points',
    trend: 'up',
    actionHint: 'View regional breakdown',
    topStore: 'Store #2156 top rated',
  },
];

// Enhanced Action Items with "why this matters"
interface EnhancedActionItem extends ActionItem {
  impact?: string;
}

// Planogram action item
interface PlanogramAction {
  id: string;
  description: string;
  section: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
}

// Inventory item for low stock alerts
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  minStock: number;
  reorderQty: number;
  supplier: string;
  priority: 'critical' | 'high' | 'medium';
}

// Safety checklist item
interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'completed' | 'failed';
}

// Shipment details
interface ShipmentDetails {
  shipmentId: string;
  carrier: string;
  expectedDate: string;
  totalItems: number;
  totalValue: number;
  poNumber: string;
}

// Shipment item
interface ShipmentItem {
  id: string;
  sku: string;
  name: string;
  ordered: number;
  received: number;
  status: 'complete' | 'short' | 'over';
  variance?: number;
}

// VoC Escalation
interface VoCEscalation {
  id: string;
  customerName: string;
  date: string;
  category: string;
  rating: number;
  summary: string;
  details: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'very_negative';
  responseRequired: boolean;
  storeId?: string;
  storeManager?: string;
  status?: 'pending' | 'in_progress' | 'resolved';
  slaDue?: string;
  escalationSeverity?: 'high' | 'medium' | 'low';
  isRepeated?: boolean;
}

// Enhanced action item with CTA and severity
interface ActionItemV2 extends EnhancedActionItem {
  severity: 'critical' | 'high' | 'medium' | 'low';
  cta: string;
  microContext?: string;
  planogramImage?: string;
  planogramActions?: PlanogramAction[];
  inventoryItems?: InventoryItem[];
  checklistItems?: ChecklistItem[];
  shipmentDetails?: ShipmentDetails;
  shipmentItems?: ShipmentItem[];
  escalations?: VoCEscalation[];
}

const generateMockActionItems = (): ActionItemV2[] => [
  {
    id: '2',
    title: "Approve Women's Wall planogram reset",
    type: 'ASSIGNED',
    source_module: 'Planogram',
    priority_score: 98,
    due_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'overdue',
    context: 'Store #5678',
    impact: 'Blocking SS26 floor reset across 3 stores',
    severity: 'critical',
    cta: 'Approve Now',
    microContext: '3 stores waiting',
    planogramImage: womensWallPlanogram,
    planogramActions: [
      { id: 'pa1', description: 'Move SS26 premium blouses to Top Rail — face-out, sized XS–XL', section: 'Top Rail', priority: 'high' },
      { id: 'pa2', description: 'Restock denim Mid Rail — Skinny, Mom, Straight, Wide (min 6 units/size)', section: 'Mid Rail', priority: 'high' },
      { id: 'pa3', description: 'Set core dresses on Shelf 2 — navy, white, olive, black at €27.99 / €29.89', section: 'Shelf 2', priority: 'medium' },
      { id: 'pa4', description: 'Remove discontinued FW25 tees from Base Table', section: 'Base Table', priority: 'low' },
      { id: 'pa5', description: 'Refresh price tags & size strips across 12ft wall section', section: 'Pricing', priority: 'medium' },
    ],
    deep_link: {
      target_module: 'planogram',
      context_payload: { store_id: '5678' },
    },
  },
  {
    id: '3',
    title: 'Complete safety checklist',
    type: 'ASSIGNED',
    source_module: 'Compliance',
    priority_score: 82,
    due_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    context: 'District 14',
    impact: 'Required for certification',
    severity: 'medium',
    cta: 'Complete Checklist',
    checklistItems: [
      { id: 'cl1', category: 'Fire Safety', item: 'Verify all fire extinguishers are charged and accessible', status: 'pending' },
      { id: 'cl2', category: 'Fire Safety', item: 'Check emergency exit signs are illuminated', status: 'pending' },
      { id: 'cl3', category: 'Electrical', item: 'Inspect electrical panels for damage or hazards', status: 'pending' },
      { id: 'cl4', category: 'Electrical', item: 'Verify no exposed wiring in customer areas', status: 'pending' },
      { id: 'cl5', category: 'Floor Safety', item: 'Check for wet floor signs availability', status: 'pending' },
      { id: 'cl6', category: 'Floor Safety', item: 'Inspect floor mats for trip hazards', status: 'pending' },
      { id: 'cl7', category: 'Emergency', item: 'Verify first aid kit is fully stocked', status: 'pending' },
      { id: 'cl8', category: 'Emergency', item: 'Confirm emergency contact list is posted', status: 'pending' },
    ],
    deep_link: {
      target_module: 'compliance',
      context_payload: { task_id: 'safety-001' },
    },
  },
  {
    id: '4',
    title: 'Validate shipment #SH-9012',
    type: 'AI',
    source_module: 'Receiving',
    priority_score: 78,
    due_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    context: 'Store #3456',
    severity: 'medium',
    cta: 'Validate',
    microContext: '120 units',
    shipmentDetails: {
      shipmentId: 'SH-9012',
      carrier: 'FastFreight Logistics',
      expectedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      totalItems: 120,
      totalValue: 4850.00,
      poNumber: 'PO-2024-0892',
    },
    shipmentItems: [
      { id: 'si1', sku: 'WOM-DRS-014', name: 'New Season Dresses — Navy',    ordered: 40, received: 40, status: 'complete' },
      { id: 'si2', sku: 'MEN-DNM-003', name: 'Denim Restock — Dark Wash',    ordered: 30, received: 28, status: 'short', variance: -2 },
      { id: 'si3', sku: 'KID-TSH-012', name: 'Kids Tees Summer Range',       ordered: 25, received: 25, status: 'complete' },
      { id: 'si4', sku: 'ACC-BAG-005', name: 'Canvas Tote Bags — New Colour',ordered: 15, received: 15, status: 'complete' },
      { id: 'si5', sku: 'SEA-JKT-004', name: 'Seasonal Jackets Restock',     ordered: 10, received: 12, status: 'over', variance: 2 },
    ],
    deep_link: {
      target_module: 'receiving',
      context_payload: { shipment_id: 'SH-9012' },
    },
  },
  {
    id: '5',
    title: 'Review VoC escalation',
    type: 'FOLLOW_UP',
    source_module: 'Customer',
    priority_score: 75,
    due_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    context: 'Store #7890',
    impact: 'Customer waiting',
    severity: 'low',
    cta: 'Review Feedback',
    microContext: '2 escalations',
    escalations: [
      { 
        id: 'esc1', 
        customerName: 'Jennifer M.', 
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: 'Product Quality',
        rating: 2,
        summary: 'Purchased expired dairy products',
        details: 'Customer found that the milk carton purchased yesterday was already past its expiration date. Requesting refund and concerned about quality control processes.',
        sentiment: 'negative',
        responseRequired: true,
        storeId: '7890',
        storeManager: 'Alex Rivera',
        status: 'pending' as const,
        slaDue: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        escalationSeverity: 'medium' as const,
        isRepeated: false,
      },
      { 
        id: 'esc2', 
        customerName: 'Robert K.', 
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        category: 'Staff Behavior',
        rating: 1,
        summary: 'Unhelpful staff at checkout',
        details: 'Customer reports that checkout staff was dismissive when asked about a price discrepancy. Customer felt ignored and disrespected. Wants acknowledgment and assurance of better service.',
        sentiment: 'very_negative',
        responseRequired: true,
        storeId: '7890',
        storeManager: 'Alex Rivera',
        status: 'pending' as const,
        slaDue: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        escalationSeverity: 'high' as const,
        isRepeated: true,
      },
    ],
    deep_link: {
      target_module: 'voc',
      context_payload: { store_id: '7890' },
    },
  },
];

// Broadcasts - all priorities including critical
const generateMockBroadcasts = (): BroadcastMessage[] => [
  {
    id: '1',
    priority: 'HIGH',
    title: 'Semi-Annual Sale — Signage Kit Confirmation',
    description: 'Reminder: "Semi Annual Sale" sets Friday Open Business. Please confirm you have received your in-store signage kits for Windows, Marquee, and sign toppers.',
    sender: 'Marketing Calendar',
    senderRole: 'HQ',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    category: 'Marketing',
    isRead: false,
    isAcknowledged: false,
    requiresAcknowledgement: true,
  },
  {
    id: '2',
    priority: 'HIGH',
    title: 'Summer 2 Floorset — Overnight Shift Scheduling',
    description: 'Reminder: Summer 2 floorset sets next Thursday overnight. Have you scheduled the overnight shifts required to complete the set?',
    sender: 'VM Planning',
    senderRole: 'HQ',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'Visual Merchandising',
    isRead: false,
    isAcknowledged: false,
    requiresAcknowledgement: true,
  },
  {
    id: '3',
    priority: 'HIGH',
    title: 'Test Store — Early Set Compliance by 6.7.2026',
    description: 'Heads up — your store has been selected for an upcoming early set test. Your info packet (linked) includes the items, pricing, and visual merchandising to participate. Please complete the set and confirm compliance by June 7, 2026.',
    sender: 'HQ Merchandising',
    senderRole: 'HQ',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'Operations',
    isRead: false,
    isAcknowledged: false,
    requiresAcknowledgement: true,
  },
  {
    id: '4',
    priority: 'MEDIUM',
    title: 'Store-to-Store Transfers — This Week\'s Schedule',
    description: 'Alert for this week\'s transfers in and transfers out. Labor estimates based upon inbound/outbound execution are included. Please ensure scheduling during non-selling hours.',
    sender: 'Operations Team',
    senderRole: 'HQ',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'Operations',
    isRead: true,
    isAcknowledged: false,
    requiresAcknowledgement: false,
  },
];

const getGreeting = (): { text: string; icon: React.ReactNode } => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: <WbSunnyOutlined sx={{ fontSize: 20 }}/> };
  if (hour < 17) return { text: 'Good afternoon', icon: <WbCloudyOutlined sx={{ fontSize: 20 }}/> };
  return { text: 'Good evening', icon: <DarkModeOutlined sx={{ fontSize: 20 }}/> };
};

const getPriorityColor = (priority: Priority | 'HIGH' | 'MEDIUM' | 'LOW') => {
  switch (priority) {
    case 'CRITICAL':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'MEDIUM':
      return 'medium';
    case 'LOW':
      return 'low';
    default:
      return 'medium';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatDueTime = (timestamp: string) => {
  const diff = new Date(timestamp).getTime() - Date.now();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (diff < 0) {
    const absMinutes = Math.abs(minutes);
    const absHours = Math.abs(hours);
    if (absMinutes < 60) return `${absMinutes}m overdue`;
    return `${absHours}h overdue`;
  }
  if (minutes < 60) return `Due in ${minutes}m`;
  if (hours < 24) return `Due in ${hours}h`;
  return `Due in ${days}d`;
};

// Premium custom dropdown for assignee selection (matches Planogram Intelligence module style)
interface AssigneeOption {
  value: string;
  label: string;
  sublabel?: string;
  avatar?: string;
}

interface AssigneeDropdownProps {
  value: string;
  options: AssigneeOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const AssigneeDropdown: React.FC<AssigneeDropdownProps> = ({ value, options, onChange, placeholder = 'Select assignee...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="assignee-dropdown" ref={ref}>
      <button
        type="button"
        className={`assignee-dropdown-trigger ${isOpen ? 'open' : ''} ${selected ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected ? (
          <div className="assignee-dropdown-selected">
            {selected.avatar && <span className="assignee-dropdown-avatar">{selected.avatar}</span>}
            <div className="assignee-dropdown-selected-text">
              <span className="assignee-dropdown-name">{selected.label}</span>
              {selected.sublabel && <span className="assignee-dropdown-role">{selected.sublabel}</span>}
            </div>
          </div>
        ) : (
          <span className="assignee-dropdown-placeholder">{placeholder}</span>
        )}
        <KeyboardArrowDown sx={{ fontSize: 16 }} className={`assignee-dropdown-chevron ${isOpen ? 'open' : ''}`}/>
      </button>
      {isOpen && (
        <div className="assignee-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`assignee-dropdown-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.avatar && <span className="assignee-dropdown-avatar">{opt.avatar}</span>}
              <div className="assignee-dropdown-option-text">
                <span className="assignee-dropdown-name">{opt.label}</span>
                {opt.sublabel && <span className="assignee-dropdown-role">{opt.sublabel}</span>}
              </div>
              {value === opt.value && <Check sx={{ fontSize: 16 }} className="assignee-dropdown-check"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


// ─── EAC v2 mock data ────────────────────────────────────────────────────────
const DM_EAC_GROUPS = [
  {
    id: 'boh-to-shelf', type: 'boh' as const,
    title: 'BOH-to-Shelf Sync',
    taskType: 'Shelf Replenishment',
    severity: 'High' as const, severityClass: 'high' as const,
    desc: 'Shelf gaps detected with available backroom inventory. Items are in BOH but not reaching the shelf.',
    storeCount: 5, skuCount: 23, riskValue: '$12.4K',
    taskTotal: 18, taskOpen: 8, taskProg: 7, taskSub: 3, taskOver: 2,
    lastDetected: '4 min ago',
    stores: [
      { name: 'Nashville Flagship #2034',    detail: "7 SKUs · Women's Apparel · 3 open tasks",        status: 'critical'  as const, tasks: 3, manager: 'Sarah Johnson' },
      { name: 'Memphis Central #1876',       detail: "5 SKUs · Men's Apparel · In progress",           status: 'progress'  as const, tasks: 4, manager: 'Marcus Reed' },
      { name: 'Franklin Town Center #1234',  detail: '4 SKUs · Kids Apparel · In progress',            status: 'progress'  as const, tasks: 3, manager: 'Lisa Chen' },
      { name: 'Murfreesboro Plaza #4532',    detail: '4 SKUs · Nutrition · 4 open tasks',              status: 'critical'  as const, tasks: 4, manager: 'Kevin Patel' },
      { name: 'Chattanooga Square #2198',    detail: '3 SKUs · Snacks · Submitted for review',         status: 'submitted' as const, tasks: 4, manager: 'Rachel Torres' },
    ],
  },
  {
    id: 'phantom-stock', type: 'phantom' as const,
    title: 'Phantom Stock',
    taskType: 'Inventory Check / Cycle Count',
    severity: 'Medium' as const, severityClass: 'medium' as const,
    desc: 'High-stock, zero-sales items detected. System inventory exists but no recent sales — possible count discrepancy.',
    storeCount: 3, skuCount: 34, riskValue: '$18.4K',
    taskTotal: 12, taskOpen: 6, taskProg: 4, taskSub: 2, taskOver: 1,
    lastDetected: '12 min ago',
    stores: [
      { name: 'Nashville Flagship #2034',  detail: '14 SKUs · $8.6K at risk · Cycle count in progress', status: 'progress' as const, tasks: 4, manager: 'Sarah Johnson' },
      { name: 'Memphis Central #1876',     detail: '12 SKUs · $5.8K at risk · 4 open tasks',            status: 'critical' as const, tasks: 4, manager: 'Marcus Reed' },
      { name: 'Murfreesboro Plaza #4532',  detail: '8 SKUs · $4.0K at risk · 4 open tasks',             status: 'critical' as const, tasks: 4, manager: 'Kevin Patel' },
    ],
  },
  {
    id: 'pog-compliance', type: 'pog' as const,
    title: 'POG Compliance Gap',
    taskType: 'POG Correction',
    severity: 'High' as const, severityClass: 'high' as const,
    desc: 'Shelf layout deviates from active planogram. Camera audit detected misplacements and missing facings.',
    storeCount: 4, skuCount: 8, riskValue: '$9.2K',
    taskTotal: 9, taskOpen: 4, taskProg: 3, taskSub: 2, taskOver: 1,
    lastDetected: '8 min ago',
    stores: [
      { name: 'Nashville Flagship #2034',   detail: "Women's Wall 3A · 3 POG deviations · 2 open tasks",  status: 'critical'  as const, tasks: 2, manager: 'Sarah Johnson' },
      { name: 'Memphis Central #1876',      detail: 'Snacks End Cap 7B · Correction in progress',           status: 'progress'  as const, tasks: 3, manager: 'Marcus Reed' },
      { name: 'Franklin Town Center #1234', detail: 'Kids Section 2C · 2 open tasks',                       status: 'critical'  as const, tasks: 2, manager: 'Lisa Chen' },
      { name: 'Knoxville Centre #3421',       detail: 'Accessories End Cap 4D · Submitted for review',         status: 'submitted' as const, tasks: 2, manager: 'David Park' },
    ],
  },
];

export const StoreOpsHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();

  // HQ users get the strategic command center view
  if (user?.role === 'HQ') {
    return <HQHome />;
  }

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setSystemState] = useState<SystemState>('HIGH_ACTIVITY');
  const [, setInsights] = useState<EnhancedInsightItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItemV2[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [, setLastRefresh] = useState<Date>(new Date());
  const [broadcastsExpanded, setBroadcastsExpanded] = useState(true);
  const [isBriefCollapsed, setIsBriefCollapsed] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showBriefAudio, setShowBriefAudio] = useState(false);
  // EAC v2 drawer state
  const [eacDrawer, setEacDrawer] = useState<null | typeof DM_EAC_GROUPS[0]>(null);

  // Detail Panel (right-side slide-in)
  const [detailPanel, setDetailPanel] = useState<DetailPanelState>(null);
  const [panelSubView, setPanelSubView] = useState<PanelSubView>(null);
  
  // (Next Best Action strip removed)
  
  // Approval Drawer States
  const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);
  const [approvalDrawerItem, setApprovalDrawerItem] = useState<ActionItemV2 | null>(null);
  const [approvalNote, setApprovalNote] = useState('');

  // Action Modal States
  const [showViewStoresModal, setShowViewStoresModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSkuReviewModal, setShowSkuReviewModal] = useState(false);
  const [showActionApprovalModal, setShowActionApprovalModal] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState<ActionItemV2 | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  
  // SKU Reorder States
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [showReorderSent, setShowReorderSent] = useState(false);
  const [reorderedSkus, setReorderedSkus] = useState<typeof atRiskSkus>([]);
  
  // Archived Actions
  const [archivedActions, setArchivedActions] = useState<{id: string; title: string; completedAt: Date; type: string}[]>([]);
  
  // Regional & Top Performers Modal States
  const [showRegionalModal, setShowRegionalModal] = useState(false);
  const [showTopPerformersModal, setShowTopPerformersModal] = useState(false);
  
  // Planogram Modal States
  const [showPlanogramModal, setShowPlanogramModal] = useState(false);
  const [selectedPlanogramItem, setSelectedPlanogramItem] = useState<ActionItemV2 | null>(null);
  const [planogramActionAssignments, setPlanogramActionAssignments] = useState<{[key: string]: string}>({});
  const [, setCreatedActionItems] = useState<{id: string; description: string; assignedTo: string; section: string; priority: string}[]>([]);
  
  // Inventory Modal States
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventoryItem] = useState<ActionItemV2 | null>(null);
  const [selectedSkusForReorder, setSelectedSkusForReorder] = useState<string[]>([]);
  
  // Checklist Modal States
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklistItem] = useState<ActionItemV2 | null>(null);
  const [checklistProgress, setChecklistProgress] = useState<{[key: string]: 'pending' | 'completed' | 'failed'}>({});
  const [selectedChecklistCategories, setSelectedChecklistCategories] = useState<string[]>([]);
  
  // Shipment Modal States
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [selectedShipmentItem] = useState<ActionItemV2 | null>(null);
  const [shipmentValidations, setShipmentValidations] = useState<{[key: string]: boolean}>({});
  
  // VoC Modal States
  const [showVoCModal, setShowVoCModal] = useState(false);
  const [selectedVoCItem] = useState<ActionItemV2 | null>(null);
  const [selectedEscalation, setSelectedEscalation] = useState<VoCEscalation | null>(null);
  const [escalationResponse, setEscalationResponse] = useState('');
  

  // Mock data for modals — aligned with StoreCenter broadcastActions bc-001 store breakdown
  const impactedStores = [
    { id: '1234', name: 'Franklin Town Center #1234', address: '88 Main Street, Franklin TN', status: 'critical', unitCount: 24, manager: 'Dan Kim', phone: '(615) 555-0123' },
    { id: '5678', name: 'Clarksville Crossing #5678', address: '220 Riverside Dr, Clarksville TN', status: 'warning', unitCount: 12, manager: 'Rachel Torres', phone: '(931) 555-0456' },
    { id: '9012', name: 'Johnson City Mall #9012', address: '45 State of Franklin Rd, Johnson City TN', status: 'warning', unitCount: 18, manager: 'Kevin Patel', phone: '(423) 555-0789' },
  ];

  const atRiskSkus = [
    // Franklin Town Center #1234 — 5 SKUs
    { sku: 'WOM-DRS-014', name: 'Floral Midi Dress — Navy',       currentStock: 2,  safetyStock: 15, reorderQty: 50, supplier: 'DC-Central', leadTime: '3 days', store: 'Franklin Town Center #1234' },
    { sku: 'WOM-TOP-014', name: "Women's V-Neck Basics",          currentStock: 5,  safetyStock: 20, reorderQty: 40, supplier: 'DC-Central', leadTime: '2 days', store: 'Franklin Town Center #1234' },
    { sku: 'WOM-DNM-005', name: 'High-Rise Skinny Jeans',         currentStock: 1,  safetyStock: 10, reorderQty: 25, supplier: 'DC-South',   leadTime: '4 days', store: 'Franklin Town Center #1234' },
    { sku: 'WOM-ACT-002', name: 'Athletic Leggings',              currentStock: 6,  safetyStock: 30, reorderQty: 80, supplier: 'DC-Central', leadTime: '2 days', store: 'Franklin Town Center #1234' },
    { sku: 'KID-DRS-008', name: 'Kids Party Dress',               currentStock: 3,  safetyStock: 18, reorderQty: 35, supplier: 'DC-Central', leadTime: '3 days', store: 'Franklin Town Center #1234' },
    // Clarksville Crossing #5678 — 4 SKUs
    { sku: 'MEN-DNM-003', name: 'Slim Fit Denim — Dark Wash',     currentStock: 3,  safetyStock: 12, reorderQty: 30, supplier: 'DC-South',   leadTime: '2 days', store: 'Clarksville Crossing #5678' },
    { sku: 'MEN-CHN-007', name: "Men's Stretch Chino",            currentStock: 8,  safetyStock: 25, reorderQty: 60, supplier: 'DC-Central', leadTime: '2 days', store: 'Clarksville Crossing #5678' },
    { sku: 'MEN-OUT-006', name: 'Puffer Jacket',                  currentStock: 2,  safetyStock: 14, reorderQty: 35, supplier: 'DC-Central', leadTime: '3 days', store: 'Clarksville Crossing #5678' },
    { sku: 'ACC-BAG-005', name: 'Canvas Tote Bag',                currentStock: 4,  safetyStock: 16, reorderQty: 20, supplier: 'DC-North',   leadTime: '5 days', store: 'Clarksville Crossing #5678' },
    // Johnson City Mall #9012 — 3 SKUs
    { sku: 'SEA-JKT-004', name: 'Seasonal Rain Jacket',           currentStock: 4,  safetyStock: 18, reorderQty: 45, supplier: 'DC-Central', leadTime: '3 days', store: 'Johnson City Mall #9012' },
    { sku: 'KID-TSH-012', name: 'Kids Color Block Tee',           currentStock: 1,  safetyStock: 12, reorderQty: 30, supplier: 'DC-Central', leadTime: '3 days', store: 'Johnson City Mall #9012' },
    { sku: 'ACC-SCF-009', name: 'Silk Blend Scarf',               currentStock: 3,  safetyStock: 15, reorderQty: 40, supplier: 'DC-North',   leadTime: '4 days', store: 'Johnson City Mall #9012' },
  ];

  const teamMembers = [
    { id: '1', name: 'Sarah Johnson', role: 'Store Manager', store: 'Store #1234', avatar: 'SJ' },
    { id: '2', name: 'Mike Chen', role: 'Assistant Manager', store: 'Store #2341', avatar: 'MC' },
    { id: '3', name: 'Lisa Park', role: 'Store Manager', store: 'Store #3892', avatar: 'LP' },
    { id: '4', name: 'James Wilson', role: 'District Supervisor', store: 'District 14', avatar: 'JW' },
    { id: '5', name: 'Emily Davis', role: 'Inventory Specialist', store: 'Regional', avatar: 'ED' },
  ];

  const regionalData = [
    { region: 'North', vocScore: 78, change: +12, stores: 8, topStore: 'Store #2156' },
    { region: 'South', vocScore: 72, change: +5, stores: 6, topStore: 'Store #3421' },
    { region: 'East', vocScore: 68, change: +3, stores: 5, topStore: 'Store #1892' },
    { region: 'West', vocScore: 65, change: -2, stores: 5, topStore: 'Store #4521' },
  ];

  const topPerformers = [
    { rank: 1, store: 'Store #1234', manager: 'Sarah Johnson', sales: '+12%', target: '108%', trend: 'up' },
    { rank: 2, store: 'Store #2156', manager: 'Mike Chen', sales: '+10%', target: '105%', trend: 'up' },
    { rank: 3, store: 'Store #3421', manager: 'Lisa Park', sales: '+8%', target: '103%', trend: 'up' },
    { rank: 4, store: 'Store #1892', manager: 'James Wilson', sales: '+6%', target: '101%', trend: 'up' },
    { rank: 5, store: 'Store #4521', manager: 'Emily Davis', sales: '+4%', target: '100%', trend: 'neutral' },
  ];

  // Toast notification helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setInsights(generateMockInsights());
      setActionItems(generateMockActionItems());
      setBroadcasts(generateMockBroadcasts());
      setSystemState('HIGH_ACTIVITY');
      setLastRefresh(new Date());
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const handleActionClick = (item: ActionItemV2) => {
    // Open right-side detail panel for all action types
    setPanelSubView(null);
    setDetailPanel({ type: 'action', data: item });
    // Reset relevant state
    if (item.checklistItems) { setChecklistProgress({}); setSelectedChecklistCategories([]); }
    if (item.shipmentItems) setShipmentValidations({});
    if (item.escalations) {
      setSelectedEscalation(null);
      setEscalationResponse('');
    }
    setApprovalNote('');
  };

  const handleApproveAction = () => {
    if (selectedActionItem) {
      // Archive the action
      setArchivedActions(prev => [...prev, {
        id: selectedActionItem.id,
        title: selectedActionItem.title,
        completedAt: new Date(),
        type: 'approved'
      }]);
      setActionItems(prev => prev.filter(a => a.id !== selectedActionItem.id));
      showToast(`✓ ${selectedActionItem.title} approved successfully`);
      setShowActionApprovalModal(false);
      setSelectedActionItem(null);
    }
  };

  const handleRejectAction = () => {
    if (selectedActionItem) {
      // Archive as rejected
      setArchivedActions(prev => [...prev, {
        id: selectedActionItem.id,
        title: selectedActionItem.title,
        completedAt: new Date(),
        type: 'rejected'
      }]);
      setActionItems(prev => prev.filter(a => a.id !== selectedActionItem.id));
      showToast(`Action "${selectedActionItem.title}" sent back for review`);
      setShowActionApprovalModal(false);
      setSelectedActionItem(null);
    }
  };

  const handleDrawerApprove = () => {
    if (approvalDrawerItem) {
      setArchivedActions(prev => [...prev, {
        id: approvalDrawerItem.id,
        title: approvalDrawerItem.title,
        completedAt: new Date(),
        type: 'approved'
      }]);
      setActionItems(prev => prev.filter(a => a.id !== approvalDrawerItem.id));
      showToast(`✓ ${approvalDrawerItem.title} approved — stores notified`);
      setShowApprovalDrawer(false);
      setApprovalDrawerItem(null);
      setApprovalNote('');
    }
  };

  const handleDrawerReject = () => {
    if (approvalDrawerItem) {
      setArchivedActions(prev => [...prev, {
        id: approvalDrawerItem.id,
        title: approvalDrawerItem.title,
        completedAt: new Date(),
        type: 'rejected'
      }]);
      setActionItems(prev => prev.filter(a => a.id !== approvalDrawerItem.id));
      showToast(`Planogram reset sent back for revision`);
      setShowApprovalDrawer(false);
      setApprovalDrawerItem(null);
      setApprovalNote('');
    }
  };

  const handleViewStores = () => {
    setShowViewStoresModal(true);
  };

  const handleAssignSubmit = () => {
    if (selectedAssignee) {
      const assignee = teamMembers.find(t => t.id === selectedAssignee);
      // Archive the assignment
      setArchivedActions(prev => [...prev, {
        id: `assign-${Date.now()}`,
        title: `Task assigned to ${assignee?.name}`,
        completedAt: new Date(),
        type: 'assigned'
      }]);
      showToast(`✓ Task assigned to ${assignee?.name}`);
      setShowAssignModal(false);
      setSelectedAssignee(null);
      setAssignSearchQuery('');
    }
  };

  const handleSendReorderAction = () => {
    const skus = atRiskSkus.filter(s => selectedSkus.includes(s.sku));
    setReorderedSkus(skus);
    setShowReorderSent(true);
  };

  const handleReorderAll = () => {
    setSelectedSkus(atRiskSkus.map(s => s.sku));
    setReorderedSkus(atRiskSkus);
    setShowReorderSent(true);
  };

  const handleBroadcastClick = (broadcast: BroadcastMessage) => {
    // Mark as read
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === broadcast.id ? { ...b, isRead: true } : b))
    );

    // Contextual enrichment per broadcast
    const enrichment: Record<string, { fullMessage: string; scope: string; keyDates: { label: string; date: string }[]; actionItems: { text: string; done: boolean }[]; attachments: { name: string; type: string }[] }> = {
      '1': {
        fullMessage: 'The "Semi Annual Sale" event sets this Friday as Open Business. Marketing has shipped in-store signage kits to all participating locations. Each kit includes three components: Window signage (large-format vinyl decals for front glass), Marquee signage (dimensional letterboard inserts), and Sign Toppers (price rail headers for all key fixtures).\n\nPlease inspect your shipment immediately upon receipt and confirm all three kit components are present and undamaged. If any component is missing or damaged, contact your District Manager and the Marketing Operations team by end of day Thursday so a replacement can be expedited before Friday open.\n\nInstallation guides for each component are attached. Window and Marquee signage should be installed Thursday evening after close. Sign Toppers are to be placed on fixtures first thing Friday morning before doors open.',
        scope: 'All stores — Semi Annual Sale participants',
        keyDates: [
          { label: 'Signage kit receipt confirmation due', date: 'Thu May 28, 2026 (EOD)' },
          { label: 'Window & Marquee signage installation', date: 'Thu May 28, 2026 (after close)' },
          { label: 'Sign Toppers installed — doors open', date: 'Fri May 29, 2026 (before open)' },
          { label: 'Semi Annual Sale — Open Business', date: 'Fri May 29, 2026' },
        ],
        actionItems: [
          { text: 'Confirm receipt of Window signage kit (large-format vinyl decals)', done: false },
          { text: 'Confirm receipt of Marquee signage kit (letterboard inserts)', done: false },
          { text: 'Confirm receipt of Sign Toppers kit (price rail headers)', done: false },
          { text: 'Report any missing or damaged kit components to DM by Thu EOD', done: false },
          { text: 'Install Window & Marquee signage Thursday evening after close', done: false },
          { text: 'Place Sign Toppers on all key fixtures Friday before open', done: false },
        ],
        attachments: [
          { name: 'SAS_Window_Signage_Install_Guide.pdf', type: 'pdf' },
          { name: 'SAS_Marquee_Insert_Guide.pdf', type: 'pdf' },
          { name: 'SAS_SignTopper_Placement_Map.pdf', type: 'pdf' },
          { name: 'SemiAnnualSale_Kit_Checklist.xlsx', type: 'xlsx' },
        ],
      },
      '2': {
        fullMessage: 'The Summer 2 floorset is scheduled to set next Thursday overnight. This is a full-floor visual merchandising reset covering Women\'s, Men\'s, Accessories, and Kids departments. All new fixture placements, wall configurations, and mannequin outfitting must follow the Summer 2 VM directive attached below.\n\nOvernight shift coverage is mandatory to complete the set before Friday open. Based on prior floorset execution, estimated labor is 6–8 associates for approximately 6 hours (10 PM – 4 AM). Store managers must confirm scheduled overnight staffing with the District Manager no later than Tuesday.\n\nKey VM standards for Summer 2 include updated color stories (Coastal Neutrals + Bold Accents), new denim wall configuration in Men\'s, and the launch of the Summer Capsule collection in the front of house.',
        scope: 'All apparel stores — full-floor floorset',
        keyDates: [
          { label: 'Overnight staffing confirmation due', date: 'Tue Jun 2, 2026 (to DM)' },
          { label: 'Summer 2 floorset overnight', date: 'Thu Jun 4 → Fri Jun 5, 2026 (10 PM – 4 AM)' },
          { label: 'Summer 2 live — store open', date: 'Fri Jun 5, 2026' },
          { label: 'VM compliance audit window', date: 'Mon Jun 8 – Wed Jun 10, 2026' },
        ],
        actionItems: [
          { text: 'Review Summer 2 VM directive and floorset guide', done: false },
          { text: 'Schedule overnight crew (min. 6 associates) for Thu night', done: false },
          { text: 'Confirm overnight staffing with District Manager by Tuesday', done: false },
          { text: 'Brief floor team on Summer 2 color stories and key changes', done: false },
          { text: 'Receive and organize Summer 2 shipment by Wednesday', done: false },
          { text: 'Submit floorset completion photos by Fri 8 AM', done: false },
        ],
        attachments: [
          { name: 'Summer2_VM_Directive.pdf', type: 'pdf' },
          { name: 'Summer2_Floorset_Guide_All_Departments.pdf', type: 'pdf' },
          { name: 'Summer2_Mannequin_Outfitting_Lookbook.pdf', type: 'pdf' },
          { name: 'Overnight_Labor_Estimate_Template.xlsx', type: 'xlsx' },
        ],
      },
      '3': {
        fullMessage: 'Your store has been selected to participate in an upcoming early set test for the new seasonal collection. This test program gives a select group of stores first access to set the new product assortment ahead of the broader network rollout.\n\nYour info packet (attached) contains: (1) the complete item list with SKUs and quantities, (2) the pricing schedule including any introductory price points, and (3) the visual merchandising standards specific to the early set.\n\nThe full set must be executed and compliance confirmed by June 7, 2026. Compliance confirmation requires submitting store photos of each set zone through the Compliance Portal. A VM field rep may visit your store for a live audit between June 5–7.\n\nThis is a high-visibility program — strong execution at your store can influence the network-wide rollout approach.',
        scope: 'Test store — selected location only',
        keyDates: [
          { label: 'Info packet available', date: 'Today, May 27, 2026' },
          { label: 'Product shipment expected', date: 'Mon Jun 1, 2026' },
          { label: 'Early set execution window', date: 'Jun 1 – Jun 6, 2026' },
          { label: 'Compliance confirmation deadline', date: 'Sat Jun 7, 2026' },
          { label: 'VM field audit window', date: 'Jun 5 – Jun 7, 2026' },
        ],
        actionItems: [
          { text: 'Download and review info packet (items, pricing, VM standards)', done: false },
          { text: 'Confirm inventory receipt matches item list upon delivery', done: false },
          { text: 'Execute early set per VM standards in the packet', done: false },
          { text: 'Submit compliance photos for each set zone via Compliance Portal', done: false },
          { text: 'Confirm compliance completion in this broadcast by Jun 7', done: false },
          { text: 'Prepare store for potential VM field audit (Jun 5–7)', done: false },
        ],
        attachments: [
          { name: 'EarlySet_InfoPacket_YourStore.pdf', type: 'pdf' },
          { name: 'EarlySet_ItemList_with_Pricing.xlsx', type: 'xlsx' },
          { name: 'EarlySet_VM_Standards.pdf', type: 'pdf' },
          { name: 'Compliance_Submission_Instructions.pdf', type: 'pdf' },
        ],
      },
      '4': {
        fullMessage: 'This week\'s store-to-store transfer schedule has been finalized. Transfers are to be executed during non-selling hours to minimize disruption to the sales floor and customer experience.\n\nInbound transfers: Review the attached inbound manifest for SKUs, quantities, and originating stores. Receiving associates should process inbound items within 24 hours of arrival and update inventory counts in the system immediately.\n\nOutbound transfers: Review the attached outbound manifest for items that need to be prepared and dispatched. Outbound preparation includes picking, packing, and labeling per the transfer SOP. Dispatch must occur during non-selling hours (before open or after close).\n\nLabor estimates for inbound and outbound execution are included in the attached schedule. Please ensure your staffing aligns with these estimates. Any scheduling conflicts or inventory discrepancies should be reported to Operations by Wednesday EOD.',
        scope: 'All stores with active transfers this week',
        keyDates: [
          { label: 'Inbound transfer arrival window', date: 'Mon May 27 – Wed May 29, 2026' },
          { label: 'Inbound processing deadline', date: 'Within 24h of arrival' },
          { label: 'Outbound dispatch window', date: 'Tue May 28 – Thu May 30, 2026' },
          { label: 'Scheduling conflicts / discrepancy report due', date: 'Wed May 28, 2026 (EOD)' },
        ],
        actionItems: [
          { text: 'Review inbound transfer manifest for your store', done: false },
          { text: 'Schedule non-selling hours labor for inbound receiving', done: false },
          { text: 'Process and system-receive all inbound items within 24h', done: false },
          { text: 'Review outbound manifest and pick/pack/label items', done: false },
          { text: 'Schedule non-selling hours labor for outbound dispatch', done: false },
          { text: 'Report any discrepancies or conflicts to Operations by Wed EOD', done: false },
        ],
        attachments: [
          { name: 'Transfer_Inbound_Manifest_W22_2026.pdf', type: 'pdf' },
          { name: 'Transfer_Outbound_Manifest_W22_2026.pdf', type: 'pdf' },
          { name: 'Transfer_Labor_Estimate_Schedule.xlsx', type: 'xlsx' },
          { name: 'Transfer_SOP_Packing_Labeling.pdf', type: 'pdf' },
        ],
      },
    };

    const defaults = {
      fullMessage: broadcast.description || '',
      scope: 'District-wide',
      keyDates: [] as { label: string; date: string }[],
      actionItems: [] as { text: string; done: boolean }[],
      attachments: [] as { name: string; type: string }[],
    };

    const extra = enrichment[broadcast.id] || defaults;

    // Open detail panel
    setDetailPanel({
      type: 'broadcast',
      data: {
        id: broadcast.id,
        priority: broadcast.priority,
        category: broadcast.category,
        title: broadcast.title,
        description: broadcast.description || '',
        fullMessage: extra.fullMessage,
        sender: broadcast.sender,
        senderRole: broadcast.senderRole || '',
        timestamp: broadcast.timestamp,
        requiresAcknowledgement: broadcast.requiresAcknowledgement,
        isAcknowledged: broadcast.isAcknowledged,
        scope: extra.scope,
        keyDates: extra.keyDates,
        actionItems: extra.actionItems,
        attachments: extra.attachments,
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _openAlertPanel = (alertType: 'product-recall' | 'voc-trending' | 'inventory-risk') => {
    switch (alertType) {
      case 'product-recall':
        setDetailPanel({
          type: 'alert',
          data: {
            id: 'alert-recall',
            severity: 'critical',
            title: "Product Recall — Children's Pajamas Drawstring Safety Batch #7742",
            description: "Children's Pajamas — Drawstring Safety Recall Batch #7742 must be removed immediately. Safety alert issued 2 hours ago.",
            impactSummary: '3 stores impacted · Immediate removal required',
            stores: impactedStores.map(s => ({
              id: s.id,
              name: s.name,
              status: s.status,
              detail: `${s.unitCount} units to pull`,
              manager: s.manager,
            })),
            ctas: [
              { label: 'Open in Operations Queue', icon: 'zap', action: 'operations', kind: 'navigate' as const },
            ],
            source: 'Regional Safety',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          }
        });
        break;
      case 'voc-trending':
        setDetailPanel({
          type: 'alert',
          data: {
            id: 'alert-voc',
            severity: 'warning',
            title: '"Messy Aisles" — Top Rising Theme',
            description: 'Mentions up +34% over last 2 weeks. Correlates with declining SEA Cleanliness scores and negative sales trajectory.',
            impactSummary: '3 stores affected · VoC Score impact risk',
            stores: [
              { id: '4532', name: 'Murfreesboro Plaza #4532', status: 'warning', detail: '+22% mentions · SEA Cleanliness score dropped 8pts', manager: 'Marcus Hill' },
              { id: '2198', name: 'Chattanooga Square #2198', status: 'warning', detail: '+18% mentions · 2 failed cleanliness audits', manager: 'Brandon Cole' },
              { id: '3421', name: 'Knoxville Centre #3421', status: 'info', detail: '+12% mentions · Cleaning hours reduced last month', manager: 'Megan Davis' },
            ],
            ctas: [
              { label: 'Ask Alan', icon: 'sparkles', action: 'copilot', kind: 'navigate' as const },
            ],
            source: 'VoC Analytics',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          }
        });
        break;
      case 'inventory-risk':
        setDetailPanel({
          type: 'alert',
          data: {
            id: 'alert-inventory',
            severity: 'risk',
            title: 'Inventory Risk — 12 SKUs Below Safety Stock',
            description: '12 SKUs below safety stock — immediate reorder needed. Potential $24K revenue loss if unresolved.',
            impactSummary: '3 stores impacted · 2 overdue actions · $24K at risk',
            stores: [
              { id: '1234', name: 'Franklin Town Center #1234', status: 'critical', detail: '5 SKUs below safety stock', manager: 'Sarah Johnson' },
              { id: '5678', name: 'Clarksville Crossing #5678', status: 'warning', detail: '4 SKUs below safety stock', manager: 'Rachel Torres' },
              { id: '9012', name: 'Johnson City Mall #9012', status: 'warning', detail: '3 SKUs below safety stock', manager: 'Kevin Patel' },
            ],
            ctas: [
              { label: 'Open in Operations Queue', icon: 'zap', action: 'operations', kind: 'navigate' as const },
            ],
            source: 'Inventory AI',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          }
        });
        break;
    }
  };
  void _openAlertPanel; // function retained for legacy panel wiring

  const handlePanelAction = (action: string) => {
    const parentTitle = detailPanel?.type === 'alert' ? detailPanel.data.title : '';
    switch (action) {
      case 'operations': {
        const alertData = detailPanel?.type === 'alert' ? detailPanel.data : null;
        closeDetailPanel();
        navigate('/command-center/operations-queue', {
          state: alertData ? {
            prefillFromAlert: {
              alertId: alertData.id,
              title: alertData.title,
              description: alertData.description,
              severity: alertData.severity,
              source: alertData.source,
              stores: (alertData.stores || []).map(s => ({ name: s.name, manager: s.manager, detail: s.detail })),
            },
          } : undefined,
        });
        break;
      }
      case 'assign':
        setPanelSubView({ view: 'assign-task', parentTitle });
        break;
      case 'copilot':
        closeDetailPanel();
        openAskAlan({ preset: 'voc-messy-aisles' });
        break;
      case 'review-skus':
        setSelectedSkus([]);
        setPanelSubView({ view: 'review-skus', parentTitle });
        break;
    }
  };

  const closeDetailPanel = () => {
    setDetailPanel(null);
    setPanelSubView(null);
  };

  const goBackToPanel = () => {
    setPanelSubView(null);
  };

  const handleOpenChat = (_contactId?: string) => {
    navigate('/communications');
  };


  const handleAssignPlanogramAction = (actionId: string, assignee: string) => {
    setPlanogramActionAssignments(prev => ({
      ...prev,
      [actionId]: assignee
    }));
  };

  const handleCreateActionItems = () => {
    if (!selectedPlanogramItem?.planogramActions) return;
    
    const newItems = selectedPlanogramItem.planogramActions
      .filter(action => planogramActionAssignments[action.id])
      .map(action => ({
        id: `created-${action.id}`,
        description: action.description,
        assignedTo: planogramActionAssignments[action.id],
        section: action.section,
        priority: action.priority
      }));
    
    setCreatedActionItems(prev => [...prev, ...newItems]);
    showToast(`✓ ${newItems.length} action items created and assigned`);
    setShowPlanogramModal(false);
    setSelectedPlanogramItem(null);
    setPlanogramActionAssignments({});
  };

  const overdueCount = actionItems.filter(a => a.status === 'overdue').length;
  const pendingCount = actionItems.filter(a => a.status === 'pending').length;
  
  const unreadBroadcastCount = broadcasts.filter((b) => !b.isRead).length;
  
  // Sort actions: overdue first, then by priority score
  const sortedActions = useMemo(() => {
    return [...actionItems].sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return b.priority_score - a.priority_score;
    });
  }, [actionItems]);
  
  const displayedActions = sortedActions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="store-ops-home">
        <div className="store-ops-loading">
          <div className="store-ops-loading-spinner" />
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-ops-home">
      {/* ZONE 1: Welcome Header with System State */}
      <div className="store-ops-welcome-bar">
        <div className="welcome-bar-left">
          <div className="welcome-greeting">
            <span className="greeting-icon">{greeting.icon}</span>
            <h1>
              {greeting.text}, <span className="user-name">{user?.name || 'User'}</span>
            </h1>
          </div>
          <div className="welcome-meta">
            <span className="role-badge">{user?.role || 'DM'}</span>
            <span className="scope-info">
              <StoreOutlined sx={{ fontSize: 14 }}/>
              {user?.store || user?.district || 'District 14'}
            </span>
            <span className="last-refresh-date">
              <CalendarTodayOutlined sx={{ fontSize: 14 }}/>
              Last refreshed: Apr 27, 2026 at 11:31 AM
            </span>
            <button
              className={`refresh-btn-inline ${isRefreshing ? 'refreshing' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshOutlined sx={{ fontSize: 14 }}/>
            </button>
          </div>
        </div>
      </div>

      {/* AI DAILY BRIEF - Full Width Top */}
      <div className="ai-daily-brief">
        <div className="ai-brief-header-bar" onClick={() => setIsBriefCollapsed(!isBriefCollapsed)}>
          <div className="ai-brief-header-left">
            <div className={`ai-brief-toggle ${isBriefCollapsed ? 'collapsed' : ''}`}>
              <KeyboardArrowDown sx={{ fontSize: 14 }}/>
            </div>
            <div className="ai-brief-header">
              <div className="ai-brief-badge-clean">
                <AutoAwesomeOutlined sx={{ fontSize: 18 }}/>
                <span>AI Daily Brief</span>
              </div>
            </div>
          </div>
          <button
            className={`aup-listen-btn${showBriefAudio ? ' aup-listen-btn--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowBriefAudio(v => !v); if (isBriefCollapsed) setIsBriefCollapsed(false); }}
            title="Listen to brief"
          >
            <span className="aup-listen-btn-icon">
              {showBriefAudio
                ? <span className="aup-soundwave aup-soundwave--sm"><span/><span/><span/><span/></span>
                : <HeadphonesOutlined sx={{ fontSize: 14 }} />
              }
            </span>
            {showBriefAudio ? 'Playing…' : 'Listen'}
          </button>
        </div>
        {showBriefAudio && (
          <div className="di-brief-audio-bar">
            <AudioPlayer
              text="Good morning, Clarke. District 14 Tennessee delivered 1.26 million in weekly revenue this week at plus 8 percent versus plan, plus 5.3 percent versus last year, and plus 6.2 percent on a net-comp basis — the number 2 ranked district nationally and the number 1 district in the Southeast. Gross margin at 34.2 percent, 0.9 points above plan. District conversion improved to 25.4 percent, up 1.3 points year over year. Warm weather across Tennessee added an estimated 42 thousand in uplift. Graduation weekends in Nashville and Memphis added a 28 percent Saturday spike in formal-adjacent purchases — this will repeat for 3 more weekends. Women's Division leads at plus 11.8 percent versus plan, with Summer Midi Dress the number 1 district SKU at 284 units. Accessories is the one district miss at minus 2.4 percent — an Endcap facing gap at 5 of 8 stores. A single district broadcast for the 6-facing reset would recover 6,200 to 8,400 per week. Nashville Flagship leads at SPI 94 and 224 thousand revenue. Johnson City Mall is in crisis at SPI 58, minus 12.4 percent versus plan, with a fire exit SEA violation unresolved. Critical actions today: one, call Johnson City Mall SM before noon on the fire exit. Two, approve the Clarksville Crossing OOS adaptation plan in your queue — 2,400 dollars at risk. Three, call Murfreesboro Plaza SM about fitting room staffing — VoC is up 19 percent, same early signal as Johnson City 6 weeks ago. Four, issue the Accessories Endcap broadcast today. District 14 is one Johnson City Mall recovery away from the national number 1 ranking."
              title="AI Daily Brief"
              variant="bar"
              onClose={() => setShowBriefAudio(false)}
            />
          </div>
        )}
        <div className="ai-brief-body-wrapper">
          <div className={`ai-brief-body ${isBriefCollapsed ? 'collapsed' : ''}`}>
            <div className="ai-brief-summary">
              <p className="ai-brief-paragraph">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name || 'Clarke'}. District 14 — Tennessee delivered <strong>$1.26M in weekly revenue at +8% vs plan</strong> — the #2 ranked district nationally. This brief covers what drove last week's results across your 8 stores, how you compare to the network, and what needs your action today.
              </p>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><BarChartOutlined sx={{ fontSize: 14 }}/> District Weekly Scorecard — vs Plan, LY, Forecast &amp; Comp Week</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>vs Plan:</strong> District net revenue <strong>$1.26M (+8.0% vs plan)</strong>. 6 of 8 stores beat plan. Gross margin <strong>34.2%</strong> (+0.9pp vs plan target of 33.3%). Units sold: +5.8% vs plan. Markdown rate at 11.4% — within the 12% cap.</li>
                  <li><strong>vs Last Year (LY):</strong> Net revenue <strong>+5.3% vs LY</strong>. Traffic up +2.8% YoY. Conversion improved from 24.1% → <strong>25.4%</strong> (+1.3pp). Average basket size up from $56.40 → $58.90 (+4.4% YoY).</li>
                  <li><strong>vs AI Forecast:</strong> +3.1% above district-level forecast. Model underestimated the weather + Semi Annual Sale combined effect on Dresses and summer apparel.</li>
                  <li><strong>vs Comparable Week (52-wk prior):</strong> <strong>+6.2% net-comp</strong>. District rank: <strong>#2 of 22 districts nationally</strong>, #1 in the Southeast region. Full-price sell-through on Summer 2 hero items at 88% — above the 85% national chain average.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><DirectionsWalkOutlined sx={{ fontSize: 14 }}/> Traffic &amp; Conversion — District View</h3>
                <ul className="ai-brief-bullets">
                  <li>District total transactions: <strong>14,280 this week</strong> (+2.8% YoY). Peak day was Saturday (+18% vs Monday baseline) — Semi Annual Sale and warm Tennessee weekend drove the spike.</li>
                  <li>District conversion rate: <strong>25.4%</strong> — above the national chain average (23.8%). The conversion range across your 8 stores is wide: Nashville Flagship at 28.4% vs Johnson City Mall at 17.4% — a <strong>11pp store-level gap</strong> that represents the single biggest district-level performance lever.</li>
                  <li>Fitting room conversion (try-on → purchase): district avg <strong>52%</strong> in stores with dedicated fitting room staff vs <strong>38%</strong> in stores without. Three of your stores are not staffing fitting rooms at peak — this is the direct driver of the conversion gap.</li>
                  <li>Checkout speed VoC: stable across 6 stores. Clarksville Crossing flagged for rising "Checkout Speed" mentions (+22% WoW) — single-register operation during 12–2 PM peak is the cause. Actionable today.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><WbSunnyOutlined sx={{ fontSize: 14 }}/> External Context — What Shaped the Week</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>Weather — Tennessee:</strong> Warm and sunny across the state this weekend (Nashville, Memphis, Clarksville 3–4°F above seasonal average). This drove a measurable lift in Dresses (+19% vs plan) and Summer 2 categories district-wide. Estimated weather uplift: <strong>+$42K above baseline weather scenario</strong>. Johnson City had a cooler weekend (–2°F) — a partial headwind, but execution failures account for 70%+ of that store's miss.</li>
                  <li><strong>Semi Annual Sale:</strong> Sale activation contributed an estimated <strong>+$118K incremental district revenue</strong> (AI attribution model). High-traffic stores with well-positioned clearance endcaps (Nashville Flagship, Memphis Central, Franklin Town Center) generated 14–16% of their transactions through clearance while maintaining full-price velocity.</li>
                  <li><strong>Local Events:</strong> Graduation weekends across Nashville and Memphis metro (Vanderbilt, UT, Rhodes College) drove premium-adjacent traffic Saturday AM. Formal-adjacent purchases (Blazer, Midi Dress, statement accessories) surged +28% Saturday vs Thursday average at the 4 metro stores. This was not in the AI forecast — it is an upside driver worth planning for next 3 weekends as graduation season continues.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><CategoryOutlined sx={{ fontSize: 14 }}/> Product Performance — District-Wide Division Breakdown</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>Women's Division (+11.8% vs plan — district leader):</strong> Dresses: +19% — Summer Midi Dress is the #1 SKU district-wide (284 units combined, $13,916). Basics: +7.4%. Blazer: +12% in stores with complete floorsets vs –8% in partial-set stores. The floorset completion directly controls this SKU's performance.</li>
                  <li><strong>Men's Division (+4.2% vs plan):</strong> Denim Slim Fit Dark Wash: +8%. Polo Classic: +6%. Compression Tee: +9% (gym-adjacent weekend traffic in metro stores). Men's Division is consistent across all 8 stores — minimal store-to-store variance.</li>
                  <li><strong>Kids (+2.8% vs plan):</strong> Color Block Tee and Cargo Shorts leading. Kids Party Dress is the consistent laggard — a district-wide size-run gap (XS, 4T) is limiting conversion. Submit a combined district assortment request to your regional merchant this week.</li>
                  <li><strong>Accessories (–2.4% vs plan — district-wide miss):</strong> AI shelf audit shows average Accessories Endcap at 4.2 facings vs the 6-facing POG spec at 5 of 8 stores. Facing correction district-wide is estimated to recover <strong>$6,200–$8,400/week</strong>. Issuing a district broadcast for this today is the highest-ROI 5-minute action available to you.</li>
                  <li><strong>Footwear (+8.6% vs plan):</strong> Running Shoes Elite and Canvas Sneakers strong across all 8 stores. Most consistent category district-wide.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><ShowChartOutlined sx={{ fontSize: 14 }}/> Seasonal vs. NOS / Core — District Performance</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>Seasonal (Summer 2): 58% of district revenue</strong> — exactly at plan mix. However, this masks wide variance: Nashville Flagship at 62% seasonal (above plan) vs Johnson City Mall at 29% (well below plan — a direct result of the incomplete floorset).</li>
                  <li><strong>NOS / Core: 42% of district revenue.</strong> Core items (V-Neck Basics, Classic Tee, Polo, Slim Fit Denim) performing strongly across all 8 stores. NOS provides the revenue floor even in stores with execution challenges.</li>
                  <li><strong>Full-price sell-through on Summer 2 hero items: 88% district average</strong> — ahead of the 85% national chain average. No early markdown pressure on Summer 2 for at least 3 more weeks. Johnson City Mall is the exception (29% seasonal mix) — the exception is execution, not demand.</li>
                  <li><strong>Clearance:</strong> District markdown rate 11.4% — within the 12% plan cap. No over-stocked clearance risk at 7 of 8 stores. Johnson City Mall at 24% of units clearance is compressing their GM below plan.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><StoreOutlined sx={{ fontSize: 14 }}/> Store-by-Store Performance Matrix</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>Nashville Flagship (SPI 94 — #1):</strong> $224K, +8.4% vs plan. Conv 28.4%. VoC 92%. Floorset 100%. District benchmark — 17.8% of district revenue from 1 store.</li>
                  <li><strong>Memphis Central (SPI 88 — #2):</strong> $198K, +6.2% vs plan. Conv 27.1%. VoC 88%. Strong. One minor OOS risk in Men's Denim (3 washes vs 4 plan).</li>
                  <li><strong>Franklin Town Center (SPI 82 — #3):</strong> $171K, +3.8% vs plan. Conv 24.8%. VoC 86%. 100% broadcast compliance — best in district. All 4 HQ broadcasts acknowledged.</li>
                  <li><strong>Murfreesboro Plaza (SPI 78 — #4):</strong> $158K, +1.4% vs plan. "Fitting Room Wait" VoC up +19% WoW — <strong>early warning signal</strong>. This is the same early-stage pattern that preceded the Johnson City Mall crisis. Intervene this week.</li>
                  <li><strong>Knoxville Centre (SPI 74 — #5):</strong> $146K, –0.6% vs plan. Accessories Endcap at 4 facings vs 6 spec — highest-priority correction at this store. VoC stable at 82%.</li>
                  <li><strong>Clarksville Crossing (SPI 68 — #6):</strong> $134K, –2.8% vs plan. OOS: 3 Summer 2 SKUs delayed 48h (adaptation plan awaiting your approval — $2,400 at risk). VoC "Messy Aisles" +38% WoW — cleaning hours need restoration (+2hrs/day).</li>
                  <li><strong>Chattanooga Square (SPI 62 — #7):</strong> $121K, –4.2% vs plan. Floorset at 74%. 2 HQ broadcasts unacknowledged. Needs DM check-in this week — trending toward At-Risk.</li>
                  <li><strong>Johnson City Mall (SPI 58 — #8, Crisis):</strong> $104K, –12.4% vs plan. Conv 17.4%. Floorset 34%. 14 OOS SKUs. Fire exit SEA auto-fail unresolved. On-site visit required today.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><CompareArrowsOutlined sx={{ fontSize: 14 }}/> What Drove the District — AI Business Analysis</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>Floorset execution is the primary performance driver:</strong> Stores with complete Summer 2 floorsets (Nashville Flagship, Memphis Central, Franklin Town Center) averaged $197K revenue and +6.1% vs plan. Stores with incomplete sets (Johnson City Mall, Chattanooga Square, Clarksville Crossing) averaged $120K and –6.5% vs plan. The <strong>$77K average weekly revenue gap is almost entirely attributable to floorset execution</strong> — same district, same promotion, same weather.</li>
                  <li><strong>Semi Annual Sale amplified the execution gap:</strong> All 8 stores got the same sale-driven traffic. Fully-set stores converted it at 27.1% avg; partially-set stores at 19.6% avg. The promotional amplification means execution quality has outsized impact during sale windows — the urgency of Johnson City Mall's floorset is proportional to the sale duration remaining.</li>
                  <li><strong>Fitting room staffing is the conversion lever:</strong> Stores with dedicated fitting room associates during 11am–3pm averaged 28.1% conversion in Dresses and Blazers. Stores without averaged 21.4%. The difference is $1,020/conversion point per week per store. Three stores in your district are not staffing fitting rooms at peak — this is the fastest available conversion recovery.</li>
                  <li><strong>Accessories Endcap facing is a systemic miss:</strong> The –2.4% vs plan in Accessories is not store-specific — it's a POG compliance gap at 5 of 8 stores. A single district broadcast would fix it this week. Estimated recovery: $6,200–$8,400/week.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><BusinessOutlined sx={{ fontSize: 14 }}/> Network Context — District 14 vs All Districts</h3>
                <ul className="ai-brief-bullets">
                  <li>District 14 ranked <strong>#2 of 22 districts nationally</strong> at DPI 87, behind only District 19 (Alabama, DPI 88). You are the top-ranked district in the Southeast region, ahead of District 8 (Georgia, DPI 84), District 22 (Carolina, DPI 82), and District 11 (Florida, DPI 79).</li>
                  <li>District 14 delivered the <strong>highest Semi Annual Sale incremental revenue in the Southeast</strong> ($118K attributed). HQ has flagged your district as a best-practice district for the sale rollout — the complete floorset execution was the multiplier.</li>
                  <li><strong>Network context on Kids Party Dress:</strong> The XS/4T size-run gap is a national supply chain issue affecting 14 of 22 districts. A district-level combined request will resolve faster than store-by-store escalations — submit to your regional merchant this week.</li>
                  <li>If Johnson City Mall is brought to Stable tier, your district conversion would reach ~26.1%, pushing toward the top 5 nationally. One store is holding the district from a #1 ranking.</li>
                </ul>
              </div>

              <div className="ai-brief-section">
                <h3 className="ai-brief-section-title"><WarningAmberOutlined sx={{ fontSize: 14 }}/> Critical Triage — Act on These Today</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>Johnson City Mall — Fire Exit [call before noon]:</strong> SEA auto-fail for blocked emergency Exit B. Call SM directly; confirm clearance before noon. Regional VP escalation if unresolved. Zero-tolerance item.</li>
                  <li><strong>Clarksville Crossing — OOS Adaptation Plan [5-min action in queue]:</strong> Approve the 3-SKU OOS adaptation plan. Protects an estimated $2,400 in at-risk Semi Annual Sale revenue.</li>
                  <li><strong>Murfreesboro Plaza — Early fitting room intervention:</strong> "Fitting Room Wait" VoC +19% WoW. Call the SM today and confirm fitting room staffing 11am–3pm. Early-stage signal — identical to the Johnson City Mall pattern 6 weeks ago.</li>
                  <li><strong>Clarksville Crossing — Restore cleaning hours:</strong> Add +2hrs/day cleaning. VoC model: "Messy Aisles" trend reverses within 10 days of restoring hours. Root cause was a cost-cutting decision made 4 weeks ago.</li>
                </ul>
              </div>

              <div className="ai-brief-section ai-brief-suggestions">
                <h3 className="ai-brief-section-title"><AutoAwesomeOutlined sx={{ fontSize: 14 }}/> Week Ahead — District Priorities</h3>
                <ul className="ai-brief-bullets">
                  <li><strong>Today — Accessories Endcap broadcast:</strong> Issue a district broadcast: "Accessories Endcap — 6-Facing Reset Required by EOD Wednesday." Estimated weekly revenue recovery: $6,200–$8,400. A 5-minute task with the highest district-wide ROI available this week.</li>
                  <li><strong>Today — Johnson City Mall on-site visit:</strong> Walk the floor, assess floorset, triage fitting room and OOS. This store needs leadership presence, not remote monitoring. Arrange overnight floorset reset for tonight.</li>
                  <li><strong>Monday — Kids Party Dress assortment request:</strong> Submit a combined district-level request to your regional merchant for XS and 4T sizes. Reference the district-wide demand data — combined request resolves 3× faster than store-by-store escalations.</li>
                  <li><strong>This week — Chattanooga Square check-in:</strong> 30-minute SM call. Focus on floorset completion (74% → 100%) and broadcast acknowledgement (2 of 4 outstanding). Will likely stabilize the store before it requires formal triage.</li>
                  <li><strong>Schedule — Nashville Flagship knowledge-share:</strong> Host a virtual SM session next week using Nashville Flagship as the execution template. Target: Johnson City Mall, Chattanooga Square, Clarksville Crossing.</li>
                </ul>
              </div>

              <p className="ai-brief-closing">
                District 14 is a genuine high-performer — #2 nationally and the Southeast leader. The headline is earned. Beneath it, Johnson City Mall and the district-wide Accessories gap are the two items to close this week. Fix Johnson City and issue the Accessories broadcast, and District 14 is on a credible path to #1 nationally within 3–4 weeks.
              </p>
            </div>
          </div>
          {!isBriefCollapsed && <div className="ai-brief-scroll-fade" />}
          {!isBriefCollapsed && (
            <button className="ai-brief-read-more" onClick={() => setShowBriefModal(true)}>
              <span>Read Full Brief</span>
              <KeyboardArrowRight sx={{ fontSize: 14 }}/>
            </button>
          )}
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="home-main-grid">
        {/* LEFT COLUMN: EAC → Action Queue */}
        <div className="home-col-left">
          {/* ── Execution Action Center ── */}
          <div className="eac2-section">
            {/* Header */}
            <div className="eac2-header">
              <div className="eac2-header-top">
                <div className="eac2-title-block">
                  <div className="eac2-icon-wrap">
                    <BoltOutlined sx={{ fontSize: 18 }}/>
                  </div>
                  <div className="eac2-title-text">
                    <h2 className="eac2-title">Alerts</h2>
                    <p className="eac2-subtitle">System-generated execution issues across your stores</p>
                  </div>
                </div>
                <div className="eac2-header-badges">
                  <div className="eac2-sys-badge">
                    <span className="eac2-sys-badge-dot"/>
                    System Monitored
                  </div>
                  <span className="eac2-refresh-time">Updated 4 min ago</span>
                </div>
              </div>
              {/* Summary KPI strip */}
              <div className="eac2-summary-strip">
                {[
                  { val: DM_EAC_GROUPS.reduce((s,g)=>s+g.taskTotal,0), lbl:'Auto Tasks', cls:'' },
                  { val: DM_EAC_GROUPS.reduce((s,g)=>s+g.taskOpen,0),  lbl:'Open',      cls:'eac2-summary-tile-val--open' },
                  { val: DM_EAC_GROUPS.reduce((s,g)=>s+g.taskProg,0),  lbl:'In Progress',cls:'eac2-summary-tile-val--prog' },
                  { val: DM_EAC_GROUPS.reduce((s,g)=>s+g.taskSub,0),   lbl:'Submitted', cls:'eac2-summary-tile-val--sub' },
                  { val: DM_EAC_GROUPS.reduce((s,g)=>s+g.taskOver,0),  lbl:'Overdue',   cls:'eac2-summary-tile-val--over' },
                ].map(t => (
                  <div key={t.lbl} className="eac2-summary-tile">
                    <span className={`eac2-summary-tile-val ${t.cls}`}>{t.val}</span>
                    <span className="eac2-summary-tile-lbl">{t.lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Three issue-group cards — stacked rows, horizontal layout */}
            <div className="eac2-cards-grid">
              {DM_EAC_GROUPS.map(g => {
                const pctOpen = Math.round((g.taskOpen / g.taskTotal) * 100);
                const pctProg = Math.round((g.taskProg / g.taskTotal) * 100);
                const pctSub  = Math.round((g.taskSub  / g.taskTotal) * 100);
                const pctOver = Math.round((g.taskOver / g.taskTotal) * 100);
                return (
                  <div key={g.id} className={`eac2-card eac2-card--${g.type}`} onClick={() => setEacDrawer(g)}>

                    {/* MAIN: icon + title + desc + metrics + CTAs */}
                    <div className="eac2-card-main">
                      <div className="eac2-card-heading">
                        <div className="eac2-card-icon">
                          {g.type === 'boh'     && <SyncOutlined sx={{ fontSize: 20 }}/>}
                          {g.type === 'phantom' && <InventoryOutlined sx={{ fontSize: 20 }}/>}
                          {g.type === 'pog'     && <GridOnOutlined sx={{ fontSize: 20 }}/>}
                        </div>
                        <div className="eac2-card-heading-text">
                          <h3 className="eac2-card-type">{g.title}</h3>
                          <p className="eac2-card-desc">{g.desc}</p>
                        </div>
                        <div className="eac2-card-badges-col">
                          <span className={`eac2-severity-badge eac2-severity-badge--${g.severityClass}`}>
                            <WarningAmberOutlined sx={{ fontSize: 10 }}/> {g.severity}
                          </span>
                          <span className="eac2-sysgen-pill">
                            <BoltOutlined sx={{ fontSize: 9 }}/> Auto-Tasked
                          </span>
                        </div>
                      </div>

                      {/* Impact metrics */}
                      <div className="eac2-impact-row">
                        <span className="eac2-metric">
                          <StoreOutlined sx={{ fontSize: 13 }}/> <strong>{g.storeCount}</strong> Stores
                        </span>
                        <span className="eac2-metric">
                          <InventoryOutlined sx={{ fontSize: 13 }}/> <strong>{g.skuCount}</strong> SKUs
                        </span>
                        <span className="eac2-metric eac2-metric--risk">
                          <ErrorOutlined sx={{ fontSize: 13 }}/> <strong>{g.riskValue}</strong> at risk
                        </span>
                      </div>

                    {/* CTAs */}
                    <div className="eac2-card-footer">
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<KeyboardArrowRight sx={{ fontSize: 14 }}/>}
                        onClick={e => { e.stopPropagation(); setEacDrawer(g); }}
                      >
                        View Stores
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={e => {
                          e.stopPropagation();
                          navigate('/command-center/operations-queue', {
                            state: {
                              prefillFromAlert: {
                                alertId: g.id,
                                title: g.title,
                                description: `${g.taskType}: ${g.desc}`,
                                severity: g.severity === 'High' ? 'critical' : 'warning',
                                source: 'Automated Execution Alert',
                                stores: g.stores.map(s => ({ name: s.name, manager: s.manager, detail: s.detail })),
                              },
                            },
                          });
                        }}
                      >
                        Open Queue
                      </Button>
                      <span className="eac2-last-detected">{g.lastDetected}</span>
                    </div>
                  </div>

                    {/* RIGHT: task panel — hero count + bar + 2×2 stat grid */}
                    <div className="eac2-card-task-panel">
                      <div className="eac2-task-panel-label">Auto-Created Tasks</div>
                      <div className="eac2-task-panel-total">{g.taskTotal}</div>
                      <div className="eac2-task-panel-type">{g.taskType}</div>
                      <div className="eac2-progress-track">
                        <div className="eac2-progress-seg eac2-progress-seg--over" style={{ width: `${pctOver}%` }}/>
                        <div className="eac2-progress-seg eac2-progress-seg--open" style={{ width: `${pctOpen}%` }}/>
                        <div className="eac2-progress-seg eac2-progress-seg--prog" style={{ width: `${pctProg}%` }}/>
                        <div className="eac2-progress-seg eac2-progress-seg--sub"  style={{ width: `${pctSub}%` }}/>
                      </div>
                      <div className="eac2-tasks-breakdown">
                        <div className="eac2-breakdown-item">
                          <span className="eac2-breakdown-count" style={{ color: '#3b82f6' }}>{g.taskOpen}</span>
                          <span className="eac2-breakdown-label">Open</span>
                        </div>
                        <div className="eac2-breakdown-item">
                          <span className="eac2-breakdown-count" style={{ color: '#f59e0b' }}>{g.taskProg}</span>
                          <span className="eac2-breakdown-label">In Progress</span>
                        </div>
                        <div className="eac2-breakdown-item">
                          <span className="eac2-breakdown-count" style={{ color: '#8b5cf6' }}>{g.taskSub}</span>
                          <span className="eac2-breakdown-label">Submitted</span>
                        </div>
                        {g.taskOver > 0 && (
                          <div className="eac2-breakdown-item">
                            <span className="eac2-breakdown-count" style={{ color: '#ef4444' }}>{g.taskOver}</span>
                            <span className="eac2-breakdown-label">Overdue</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Queue */}
          <div className="store-ops-section action-queue-v2">
            <div className="action-queue-header">
              <div className="queue-title-row">
                <BoltOutlined sx={{ fontSize: 18 }} className="queue-icon"/>
                <h2>Action Queue</h2>
              </div>
              <span className="queue-subtitle">{displayedActions.length} tasks requiring attention</span>
            </div>
            <div className="action-queue-content-v2">
              {displayedActions.length > 0 ? (
                <div className="action-cards-v2">
                  {displayedActions.map((item, index) => (
                    <Card
                      key={item.id}
                      size="extraSmall"
                      sx={{
                        maxWidth: '100%',
                        minHeight: 0,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        transition: 'box-shadow 0.2s ease',
                      }}
                    >
                      {/* Rank Badge */}
                      <div className="action-rank-v2">
                        <span>{index + 1}</span>
                      </div>

                      {/* Main Content */}
                      <div className="action-main">
                        {/* Title Row */}
                        <div className="action-title-row">
                          <h4 className="action-title-v2">{item.title}</h4>
                          {item.severity === 'critical' && (
                            <span className="severity-badge critical">BLOCKING</span>
                          )}
                        </div>

                        {/* Impact */}
                        {item.impact && (
                          <p className="action-impact-v2">{item.impact}</p>
                        )}

                        {/* Context Row */}
                        <div className="action-meta-row">
                          <span className="action-context-v2">{item.context}</span>
                          {item.microContext && (
                            <span className="action-micro">• {item.microContext}</span>
                          )}
                          <span className={`action-time-v2 ${item.status === 'overdue' ? 'overdue' : ''}`}>
                            {item.status === 'overdue' ? '️ ' : ''}
                            {formatDueTime(item.due_time)}
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        className={`action-cta severity-${item.severity}`}
                        onClick={() => handleActionClick(item)}
                      >
                        {item.cta}
                        <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                      </button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="action-queue-empty all-clear">
                  <TaskAltOutlined sx={{ fontSize: 32 }}/>
                  <h3>You're all caught up!</h3>
                  <p>No pending tasks. Here are some suggestions:</p>
                  <div className="empty-suggestions">
                    <button className="suggestion-btn">
                      <BarChartOutlined sx={{ fontSize: 16 }}/>
                      Review trends
                    </button>
                    <button className="suggestion-btn">
                      <GroupOutlined sx={{ fontSize: 16 }}/>
                      Check VoC
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Completed Actions - same structure as Action Queue */}
          {archivedActions.length > 0 && (
            <div className="store-ops-section action-queue-v2 completed-actions-section">
              <div className="action-queue-header">
                <div className="queue-title-row">
                  <TaskAltOutlined sx={{ fontSize: 18 }} className="queue-icon" style={{ color: 'var(--ia-color-success)' }}/>
                  <h2>Completed Actions</h2>
                </div>
                <span className="queue-subtitle" style={{ color: 'var(--ia-color-success)' }}>{archivedActions.length} done</span>
              </div>
              <div className="action-queue-content-v2 completed-actions-scroll">
                <div className="action-cards-v2">
                  {[...archivedActions].reverse().map((action) => (
                    <Card key={action.id} size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className={`action-rank-v2 completed-rank type-${action.type}`}>
                        <span>
                          {action.type === 'approved' && <Check sx={{ fontSize: 12 }}/>}
                          {action.type === 'rejected' && <CloseOutlined sx={{ fontSize: 12 }}/>}
                          {action.type === 'assigned' && <GroupOutlined sx={{ fontSize: 12 }}/>}
                          {action.type === 'reorder' && <InventoryOutlined sx={{ fontSize: 12 }}/>}
                        </span>
                      </div>
                      <div className="action-main">
                        <div className="action-title-row">
                          <h4 className="action-title-v2">{action.title}</h4>
                        </div>
                        <div className="action-meta-row">
                          <span className="action-context-v2">
                            {action.type === 'approved' ? 'Approved' : action.type === 'rejected' ? 'Sent Back' : action.type === 'assigned' ? 'Assigned' : 'Reordered'}
                          </span>
                          <span className="action-time-v2">
                            {action.completedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className={`completed-status-badge type-${action.type}`}>
                        {action.type === 'approved' ? 'Done' : action.type === 'rejected' ? 'Sent Back' : action.type === 'assigned' ? 'Assigned' : 'Reordered'}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HQ Broadcasts → KPI Snapshot */}
        <div className="home-col-right">
          {/* HQ Broadcasts */}
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
            <div 
              className="hq-broadcasts-header"
              onClick={() => setBroadcastsExpanded(!broadcastsExpanded)}
            >
              <div className="hq-broadcasts-title">
                <NotificationsOutlined sx={{ fontSize: 15 }}/>
                <span>HQ Broadcasts</span>
                {unreadBroadcastCount > 0 && (
                  <span className="hq-broadcast-count">{unreadBroadcastCount}</span>
                )}
              </div>
              <KeyboardArrowDown sx={{ fontSize: 14 }} className={`expand-icon ${broadcastsExpanded ? 'expanded' : ''}`}/>
            </div>
            {broadcastsExpanded && (
              <div className="hq-broadcasts-body">
                <div className="hq-broadcasts-list">
                  {broadcasts.map((broadcast) => (
                    <div
                      key={broadcast.id}
                      className={`hq-broadcast-item ${!broadcast.isRead ? 'unread' : ''} ${broadcast.priority === 'CRITICAL' ? 'critical' : ''}`}
                      onClick={() => handleBroadcastClick(broadcast)}
                    >
                      <div className="hq-broadcast-content">
                        <div className="hq-broadcast-title-row">
                          {broadcast.priority === 'CRITICAL' && (
                            <span className="hq-broadcast-priority-badge critical">
                              <WarningAmberOutlined sx={{ fontSize: 10 }}/>
                              CRITICAL
                            </span>
                          )}
                          <span className="hq-broadcast-title">{broadcast.title}</span>
                          {!broadcast.isRead && <span className="hq-unread-dot"></span>}
                        </div>
                        <p className="hq-broadcast-desc">{broadcast.description}</p>
                        <div className="hq-broadcast-meta">
                          <span className="hq-broadcast-sender">{broadcast.sender}</span>
                          <span className="hq-broadcast-time">{formatTimeAgo(broadcast.timestamp)}</span>
                        </div>
                        {broadcast.priority === 'CRITICAL' && broadcast.category === 'Safety' && (
                          <button 
                            className="hq-broadcast-view-stores-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBroadcasts((prev) =>
                                prev.map((b) => (b.id === broadcast.id ? { ...b, isRead: true } : b))
                              );
                              handleViewStores();
                            }}
                          >
                            <StoreOutlined sx={{ fontSize: 13 }}/>
                            View Impacted Stores
                            <KeyboardArrowRight sx={{ fontSize: 13 }}/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* KPI Snapshot */}
          <Card sx={{ maxWidth: '100%', minHeight: 'unset', padding: 0, width: '100%', borderRadius: '12px', border: '1px solid var(--ia-color-border)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
            <div className="kpi-snapshot-header">
              <div className="kpi-snapshot-title-row">
                <BarChartOutlined sx={{ fontSize: 16 }} className="kpi-snapshot-icon"/>
                <h2>Operational Pulse</h2>
              </div>
            </div>
            <div className="kpi-snapshot-grid">
              <div className="kpi-snapshot-item">
                <div className="kpi-snapshot-item-icon stores"><StoreOutlined sx={{ fontSize: 16 }}/></div>
                <div className="kpi-snapshot-item-data">
                  <span className="kpi-snapshot-value">8</span>
                  <span className="kpi-snapshot-label">Stores Managed</span>
                </div>
              </div>
              <div className="kpi-snapshot-item">
                <div className="kpi-snapshot-item-icon tasks"><BoltOutlined sx={{ fontSize: 16 }}/></div>
                <div className="kpi-snapshot-item-data">
                  <span className="kpi-snapshot-value">{pendingCount + overdueCount}</span>
                  <span className="kpi-snapshot-label">Tasks Today</span>
                </div>
                {overdueCount > 0 && <span className="kpi-snapshot-badge warning">{overdueCount} overdue</span>}
              </div>
              <div className="kpi-snapshot-item">
                <div className="kpi-snapshot-item-icon compliance"><TaskAltOutlined sx={{ fontSize: 16 }}/></div>
                <div className="kpi-snapshot-item-data">
                  <span className="kpi-snapshot-value">87%</span>
                  <span className="kpi-snapshot-label">On-Time Tasks</span>
                </div>
                <span className="kpi-snapshot-badge positive">+3% WoW</span>
              </div>
              <div className="kpi-snapshot-item">
                <div className="kpi-snapshot-item-icon voc"><StarBorderOutlined sx={{ fontSize: 16 }}/></div>
                <div className="kpi-snapshot-item-data">
                  <span className="kpi-snapshot-value">72</span>
                  <span className="kpi-snapshot-label">VoC Score</span>
                </div>
                <span className="kpi-snapshot-badge positive">+12 QoQ</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* EAC v2 Drawer */}
      {eacDrawer && (
        <>
          <div className="eac2-drawer-overlay" onClick={() => setEacDrawer(null)}/>
          <div className="eac2-drawer">
            {/* ── Hero header ── */}
            <div className="eac2-drawer-header">
              <div className="eac2-drawer-hero-top">
                <div className="eac2-drawer-hero-id">
                  <div className={`eac2-drawer-header-icon eac2-drawer-header-icon--${eacDrawer.type}`}>
                    {eacDrawer.type === 'boh'     && <SyncOutlined sx={{ fontSize: 16 }}/>}
                    {eacDrawer.type === 'phantom' && <InventoryOutlined sx={{ fontSize: 16 }}/>}
                    {eacDrawer.type === 'pog'     && <GridOnOutlined sx={{ fontSize: 16 }}/>}
                  </div>
                  <span className="eac2-drawer-type">{eacDrawer.taskType}</span>
                </div>
                <button className="eac2-drawer-close" onClick={() => setEacDrawer(null)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
              <h2 className="eac2-drawer-title">{eacDrawer.title}</h2>
              <div className="eac2-drawer-hero-pills">
                <span className={`eac2-drawer-pill eac2-drawer-pill--${eacDrawer.severityClass}`}>{eacDrawer.severity} Severity</span>
                <span className="eac2-drawer-pill eac2-drawer-pill--auto">⚡ Auto-Monitored</span>
                <span className="eac2-drawer-pill eac2-drawer-pill--stores">{eacDrawer.storeCount} stores impacted</span>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="eac2-drawer-body">
              {/* Issue Summary block */}
              <div className="eac2-drawer-block">
                <div className="eac2-drawer-block-label">
                  <WarningAmberOutlined sx={{ fontSize: 11 }}/> Issue Summary
                </div>
                <div className={`eac2-drawer-risk-banner eac2-drawer-risk-banner--${eacDrawer.severityClass}`}>
                  <WarningAmberOutlined sx={{ fontSize: 15 }} className="eac2-drawer-risk-banner-icon"/>
                  <div>
                    <p className="eac2-drawer-risk-title">{eacDrawer.skuCount} SKUs · {eacDrawer.riskValue} inventory at risk</p>
                    <p className="eac2-drawer-risk-desc">{eacDrawer.desc}</p>
                  </div>
                </div>
              </div>

              {/* Task Status block */}
              <div className="eac2-drawer-block">
                <div className="eac2-drawer-block-label">
                  <TaskAltOutlined sx={{ fontSize: 11 }}/> Auto-Created Task Status · {eacDrawer.taskTotal} total
                </div>
                <div className="eac2-drawer-stats">
                  {[
                    { val: eacDrawer.taskOpen, lbl: 'Open' },
                    { val: eacDrawer.taskProg, lbl: 'In Progress' },
                    { val: eacDrawer.taskSub,  lbl: 'Submitted' },
                    { val: eacDrawer.taskOver, lbl: 'Overdue' },
                  ].map(s => (
                    <div key={s.lbl} className="eac2-drawer-stat-tile">
                      <span className="eac2-drawer-stat-val">{s.val}</span>
                      <span className="eac2-drawer-stat-lbl">{s.lbl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impacted Stores block */}
              <div className="eac2-drawer-block">
                <div className="eac2-drawer-block-label">
                  <StoreOutlined sx={{ fontSize: 11 }}/> Impacted Stores ({eacDrawer.stores.length})
                </div>
                <div className="eac2-entity-list">
                  {eacDrawer.stores.map((s, i) => (
                    <div key={i} className={`eac2-entity-card eac2-entity-card--${s.status}`}>
                      <div className="eac2-entity-header">
                        <span className="eac2-entity-name">{s.name}</span>
                        <span className={`eac2-entity-status-badge eac2-entity-status-badge--${s.status}`}>
                          {s.status === 'critical' ? 'Open' : s.status === 'progress' ? 'In Progress' : 'Submitted'}
                        </span>
                      </div>
                      <div className="eac2-entity-detail">{s.detail}</div>
                      <div className="eac2-entity-manager">
                        <PersonOutlined sx={{ fontSize: 12 }}/> Assigned to <strong>{s.manager}</strong>
                      </div>
                      <div className="eac2-entity-task-row">
                        <span className="eac2-entity-task-info">
                          <TaskAltOutlined sx={{ fontSize: 12 }}/> {s.tasks} task{s.tasks > 1 ? 's' : ''}
                        </span>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          endIcon={<KeyboardArrowRight sx={{ fontSize: 12 }}/>}
                          onClick={() => {
                            setEacDrawer(null);
                            navigate('/command-center/operations-queue', {
                              state: {
                                prefillFromAlert: {
                                  alertId: `${eacDrawer.id}-${s.name.replace(/\s+/g, '-').toLowerCase()}`,
                                  title: `${eacDrawer.title} — ${s.name}`,
                                  description: s.detail,
                                  severity: eacDrawer.severity === 'High' ? 'critical' : 'warning',
                                  source: 'Automated Execution Alert',
                                  stores: [{ name: s.name, manager: s.manager, detail: s.detail }],
                                },
                              },
                            });
                          }}
                        >
                          Open Task
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="eac2-drawer-footer">
              <Button
                className="eac2-drawer-cta eac2-drawer-cta--primary"
                variant="contained"
                color="primary"
                startIcon={<BoltOutlined sx={{ fontSize: 14 }}/>}
                onClick={() => {
                  setEacDrawer(null);
                  navigate('/command-center/operations-queue', {
                    state: {
                      prefillFromAlert: {
                        alertId: eacDrawer.id,
                        title: eacDrawer.title,
                        description: `${eacDrawer.taskType}: ${eacDrawer.desc}`,
                        severity: eacDrawer.severity === 'High' ? 'critical' : 'warning',
                        source: 'Automated Execution Alert',
                        stores: eacDrawer.stores.map(s => ({ name: s.name, manager: s.manager, detail: s.detail })),
                      },
                    },
                  });
                }}
              >
                Open Queue
              </Button>
              <Button
                className="eac2-drawer-cta eac2-drawer-cta--secondary"
                variant="outlined"
                onClick={() => setEacDrawer(null)}
              >
                Close
              </Button>
            </div>
            <div className="eac2-drawer-timestamp">
              <AccessTimeOutlined sx={{ fontSize: 12 }}/> Last detected {eacDrawer.lastDetected} · Auto-assigned to store managers
            </div>
          </div>
        </>
      )}

      {/* AI Brief Full Modal */}
      {showBriefModal && (
        <div className="brief-modal-overlay" onClick={() => setShowBriefModal(false)}>
          <div className="brief-modal" onClick={(e) => e.stopPropagation()}>
            <div className="brief-modal-header">
              <div className="brief-modal-title">
                <AutoAwesomeOutlined sx={{ fontSize: 18 }}/>
                <h2>AI Daily Brief</h2>
              </div>
              <div className="di-brief-modal-header-actions">
                <button
                  className={`aup-listen-btn${showBriefAudio ? ' aup-listen-btn--active' : ''}`}
                  onClick={() => setShowBriefAudio(v => !v)}
                  title="Listen to brief"
                >
                  <span className="aup-listen-btn-icon">
                    {showBriefAudio
                      ? <span className="aup-soundwave aup-soundwave--sm"><span/><span/><span/><span/></span>
                      : <HeadphonesOutlined sx={{ fontSize: 14 }} />
                    }
                  </span>
                  {showBriefAudio ? 'Playing…' : 'Listen'}
                </button>
                <button className="brief-modal-close" onClick={() => setShowBriefModal(false)}>
                  <CloseOutlined sx={{ fontSize: 20 }}/>
                </button>
              </div>
            </div>
            {showBriefAudio && (
              <div className="di-brief-modal-audio">
                <AudioPlayer
                  text="Good morning, Clarke. District 14 Tennessee delivered 1.26 million in weekly revenue this week at plus 8 percent versus plan, plus 5.3 percent versus last year, and plus 6.2 percent on a net-comp basis — the number 2 ranked district nationally and the number 1 district in the Southeast. Gross margin at 34.2 percent, 0.9 points above plan. District conversion improved to 25.4 percent, up 1.3 points year over year. Warm weather across Tennessee added an estimated 42 thousand in uplift. Graduation weekends in Nashville and Memphis added a 28 percent Saturday spike in formal-adjacent purchases — this will repeat for 3 more weekends. Women's Division leads at plus 11.8 percent versus plan, with Summer Midi Dress the number 1 district SKU at 284 units. Accessories is the one district miss at minus 2.4 percent — an Endcap facing gap at 5 of 8 stores. A single district broadcast for the 6-facing reset would recover 6,200 to 8,400 per week. Nashville Flagship leads at SPI 94 and 224 thousand revenue. Johnson City Mall is in crisis at SPI 58, minus 12.4 percent versus plan, with a fire exit SEA violation unresolved. Critical actions today: one, call Johnson City Mall SM before noon on the fire exit. Two, approve the Clarksville Crossing OOS adaptation plan in your queue — 2,400 dollars at risk. Three, call Murfreesboro Plaza SM about fitting room staffing — VoC is up 19 percent, same early signal as Johnson City 6 weeks ago. Four, issue the Accessories Endcap broadcast today. District 14 is one Johnson City Mall recovery away from the national number 1 ranking."
                  title="AI Daily Brief"
                  variant="card"
                  onClose={() => setShowBriefAudio(false)}
                />
              </div>
            )}
            <div className="brief-modal-content">
              <div className="ai-brief-summary">
                <p className="ai-brief-paragraph">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name || 'Clarke'}. District 14 — Tennessee delivered <strong>$1.26M in weekly revenue at +8% vs plan</strong> — the #2 ranked district nationally. This brief covers what drove last week's results across your 8 stores, how you compare to the network, and what needs your action today.
                </p>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><BarChartOutlined sx={{ fontSize: 14 }}/> District Weekly Scorecard — vs Plan, LY, Forecast &amp; Comp Week</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>vs Plan:</strong> District net revenue <strong>$1.26M (+8.0% vs plan)</strong>. 6 of 8 stores beat plan. Gross margin <strong>34.2%</strong> (+0.9pp vs plan target of 33.3%). Units sold: +5.8% vs plan. Markdown rate at 11.4% — within the 12% cap.</li>
                    <li><strong>vs Last Year (LY):</strong> Net revenue <strong>+5.3% vs LY</strong>. Traffic up +2.8% YoY. Conversion improved from 24.1% → <strong>25.4%</strong> (+1.3pp). Average basket size up from $56.40 → $58.90 (+4.4% YoY).</li>
                    <li><strong>vs AI Forecast:</strong> +3.1% above district-level forecast. Model underestimated the weather + Semi Annual Sale combined effect on Dresses and summer apparel.</li>
                    <li><strong>vs Comparable Week (52-wk prior):</strong> <strong>+6.2% net-comp</strong>. District rank: <strong>#2 of 22 districts nationally</strong>, #1 in the Southeast region. Full-price sell-through on Summer 2 hero items at 88% — above the 85% national chain average.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><DirectionsWalkOutlined sx={{ fontSize: 14 }}/> Traffic &amp; Conversion — District View</h3>
                  <ul className="ai-brief-bullets">
                    <li>District total transactions: <strong>14,280 this week</strong> (+2.8% YoY). Peak day was Saturday (+18% vs Monday baseline) — Semi Annual Sale and warm Tennessee weekend drove the spike.</li>
                    <li>District conversion rate: <strong>25.4%</strong> — above the national chain average (23.8%). The conversion range across your 8 stores is wide: Nashville Flagship at 28.4% vs Johnson City Mall at 17.4% — a <strong>11pp store-level gap</strong> that represents the single biggest district-level performance lever.</li>
                    <li>Fitting room conversion (try-on → purchase): district avg <strong>52%</strong> in stores with dedicated fitting room staff vs <strong>38%</strong> in stores without. Three of your stores are not staffing fitting rooms at peak — this is the direct driver of the conversion gap.</li>
                    <li>Checkout speed VoC: stable across 6 stores. Clarksville Crossing flagged for rising "Checkout Speed" mentions (+22% WoW) — single-register operation during 12–2 PM peak is the cause. Actionable today.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><WbSunnyOutlined sx={{ fontSize: 14 }}/> External Context — What Shaped the Week</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>Weather — Tennessee:</strong> Warm and sunny across the state this weekend (Nashville, Memphis, Clarksville 3–4°F above seasonal average). This drove a measurable lift in Dresses (+19% vs plan) and Summer 2 categories district-wide. Estimated weather uplift: <strong>+$42K above baseline weather scenario</strong>. Johnson City had a cooler weekend (–2°F) — a partial headwind, but execution failures account for 70%+ of that store's miss.</li>
                    <li><strong>Semi Annual Sale:</strong> Sale activation contributed an estimated <strong>+$118K incremental district revenue</strong> (AI attribution model). High-traffic stores with well-positioned clearance endcaps generated 14–16% of their transactions through clearance while maintaining full-price velocity.</li>
                    <li><strong>Local Events:</strong> Graduation weekends across Nashville and Memphis metro (Vanderbilt, UT, Rhodes College) drove premium-adjacent traffic Saturday AM. Formal-adjacent purchases (Blazer, Midi Dress, accessories) surged +28% Saturday vs Thursday average at the 4 metro stores. This was not in the AI forecast — brief your metro SMs to staff fitting rooms more heavily on Saturday mornings for the next 3 weekends.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><CategoryOutlined sx={{ fontSize: 14 }}/> Product Performance — District-Wide Division Breakdown</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>Women's Division (+11.8% vs plan — district leader):</strong> Dresses: +19% — Summer Midi Dress is the #1 SKU district-wide (284 units, $13,916). Basics: +7.4%. Blazer: +12% in stores with complete floorsets vs –8% in partial-set stores. The floorset completion directly controls Blazer performance.</li>
                    <li><strong>Men's Division (+4.2% vs plan):</strong> Denim Slim Fit Dark Wash: +8%. Polo Classic: +6%. Compression Tee: +9% (gym-adjacent weekend traffic in metro stores). Most consistent division across all 8 stores.</li>
                    <li><strong>Kids (+2.8% vs plan):</strong> Color Block Tee and Cargo Shorts leading. Kids Party Dress is the consistent laggard — a district-wide size-run gap (XS, 4T). Submit a combined district assortment request to your regional merchant this week — resolves 3× faster than store-by-store escalations.</li>
                    <li><strong>Accessories (–2.4% vs plan — district-wide miss):</strong> Average Accessories Endcap at 4.2 facings vs the 6-facing POG spec at 5 of 8 stores. A district broadcast for this today is estimated to recover <strong>$6,200–$8,400/week</strong> — the highest-ROI 5-minute action available to you.</li>
                    <li><strong>Footwear (+8.6% vs plan):</strong> Running Shoes Elite and Canvas Sneakers strong across all 8 stores. Most consistent category district-wide — self-service format makes it resilient to staffing variance.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><ShowChartOutlined sx={{ fontSize: 14 }}/> Seasonal vs. NOS / Core — District Performance</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>Seasonal (Summer 2): 58% of district revenue</strong> — exactly at plan mix district-wide. However, this masks wide variance: Nashville Flagship at 62% seasonal (above plan) vs Johnson City Mall at 29% (well below plan — direct result of incomplete floorset).</li>
                    <li><strong>NOS / Core: 42% of district revenue.</strong> Core items (V-Neck Basics, Classic Tee, Polo, Slim Fit Denim) healthy and above plan across all 8 stores. The NOS base provides revenue floor stability even in stores with execution challenges.</li>
                    <li><strong>Full-price sell-through on Summer 2 hero items: 88% district average</strong> — above the 85% national chain average. No early markdown pressure on Summer 2 for at least 3 more weeks.</li>
                    <li><strong>Clearance:</strong> District markdown rate 11.4% — within the 12% plan cap. Johnson City Mall is the exception at 24% units clearance, compressing their GM below plan.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><StoreOutlined sx={{ fontSize: 14 }}/> Store-by-Store Performance Matrix</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>Nashville Flagship (SPI 94 — #1):</strong> $224K, +8.4% vs plan. Conv 28.4%. VoC 92%. Floorset 100%. The district benchmark — 17.8% of district revenue.</li>
                    <li><strong>Memphis Central (SPI 88 — #2):</strong> $198K, +6.2% vs plan. Conv 27.1%. VoC 88%. Strong. One minor OOS risk in Men's Denim.</li>
                    <li><strong>Franklin Town Center (SPI 82 — #3):</strong> $171K, +3.8% vs plan. Conv 24.8%. VoC 86%. Best broadcast compliance — all 4 of 4 acknowledged. <strong>Recognize this week.</strong></li>
                    <li><strong>Murfreesboro Plaza (SPI 78 — #4):</strong> $158K, +1.4% vs plan. "Fitting Room Wait" VoC +19% WoW. <strong>Early warning signal</strong> — intervene before this becomes the next Johnson City Mall. Call SM today.</li>
                    <li><strong>Knoxville Centre (SPI 74 — #5):</strong> $146K, –0.6% vs plan. Accessories Endcap at 4 facings vs 6 spec. VoC stable 82%.</li>
                    <li><strong>Clarksville Crossing (SPI 68 — #6):</strong> $134K, –2.8% vs plan. OOS 3 SKUs (adaptation plan in your queue). VoC "Messy Aisles" +38% — restore cleaning hours today.</li>
                    <li><strong>Chattanooga Square (SPI 62 — #7):</strong> $121K, –4.2% vs plan. Floorset 74%. 2 HQ broadcasts unacknowledged. Needs DM check-in this week — trending At-Risk.</li>
                    <li><strong>Johnson City Mall (SPI 58 — #8, Crisis):</strong> $104K, –12.4% vs plan. Conv 17.4%. Floorset 34%. 14 OOS SKUs. Fire exit violation. On-site visit today — non-negotiable.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><CompareArrowsOutlined sx={{ fontSize: 14 }}/> What Drove the District — AI Business Analysis</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>Floorset execution is the primary performance driver:</strong> Stores with complete Summer 2 floorsets averaged $197K revenue and +6.1% vs plan. Stores with incomplete sets averaged $120K and –6.5% vs plan. The <strong>$77K average weekly revenue gap is almost entirely attributable to floorset execution</strong> — same district, same promotion, same weather.</li>
                    <li><strong>Semi Annual Sale amplified the execution gap:</strong> All 8 stores got the same sale-driven traffic. Fully-set stores converted at 27.1%; partially-set stores at 19.6%. During a sale window, execution quality has outsized impact — the urgency of Johnson City Mall's floorset is proportional to the remaining sale duration.</li>
                    <li><strong>Fitting room staffing is the conversion lever:</strong> Stores with dedicated fitting room staff during 11am–3pm averaged 28.1% conversion in Dresses and Blazers vs 21.4% in stores without. The difference is $1,020/conversion point per week per store. Three of your 8 stores are leaving this on the table.</li>
                    <li><strong>Accessories Endcap facing is a systemic miss:</strong> The –2.4% vs plan across 5 of 8 stores is a POG compliance gap, not a demand problem. A single district broadcast would fix it this week without any inventory change or capital.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><BusinessOutlined sx={{ fontSize: 14 }}/> Network Context — District 14 vs All Districts</h3>
                  <ul className="ai-brief-bullets">
                    <li>District 14 ranked <strong>#2 of 22 districts nationally</strong> at DPI 87 — behind only District 19 (Alabama, DPI 88). You are the top district in the Southeast region, ahead of District 8 (Georgia, DPI 84), District 22 (Carolina, DPI 82), and District 11 (Florida, DPI 79).</li>
                    <li>District 14 delivered the <strong>highest Semi Annual Sale incremental revenue in the Southeast</strong> ($118K attributed). HQ has flagged District 14 as a best-practice district for the sale rollout — your complete floorset execution at 6 of 8 stores was the multiplier.</li>
                    <li>If Johnson City Mall is brought to Stable tier, District 14 conversion would reach ~26.1%, pushing toward the top 5 nationally. One store is the difference between #2 and #1.</li>
                  </ul>
                </div>

                <div className="ai-brief-section">
                  <h3 className="ai-brief-section-title"><WarningAmberOutlined sx={{ fontSize: 14 }}/> Critical Triage — Act on These Today</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>Johnson City Mall — Fire Exit [call before noon]:</strong> SEA auto-fail for blocked Exit B. Call SM directly; confirm clearance before noon. Regional VP escalation if unresolved.</li>
                    <li><strong>Clarksville Crossing — OOS Adaptation Plan [5-min approval]:</strong> In your queue. Protects $2,400 in at-risk Semi Annual Sale revenue.</li>
                    <li><strong>Murfreesboro Plaza — Fitting Room Intervention [call SM today]:</strong> VoC +19% WoW. Confirm fitting room staffing 11am–3pm before this becomes the next triage store.</li>
                    <li><strong>Clarksville Crossing — Restore cleaning hours:</strong> Add +2hrs/day. VoC model: "Messy Aisles" trend reverses within 10 days of restoration.</li>
                  </ul>
                </div>

                <div className="ai-brief-section ai-brief-suggestions">
                  <h3 className="ai-brief-section-title"><AutoAwesomeOutlined sx={{ fontSize: 14 }}/> Week Ahead — District Priorities</h3>
                  <ul className="ai-brief-bullets">
                    <li><strong>Today — Accessories Endcap broadcast:</strong> "6-Facing Reset Required by EOD Wednesday." Estimated weekly revenue recovery: $6,200–$8,400. 5-minute action, highest district ROI this week.</li>
                    <li><strong>Today — Johnson City Mall on-site visit:</strong> Walk the floor, assess floorset, triage fitting room and OOS. Arrange overnight floorset reset for tonight.</li>
                    <li><strong>This week — Kids Party Dress assortment request:</strong> Submit a combined district-level request to your regional merchant for XS and 4T sizes. Resolves 3× faster than store-by-store escalations.</li>
                    <li><strong>This week — Chattanooga Square SM call:</strong> Floorset completion (74% → 100%) and broadcast acknowledgements. Will stabilize the store before formal triage is required.</li>
                    <li><strong>Schedule — Nashville Flagship knowledge-share:</strong> Virtual SM session next week. Execution template for Johnson City Mall, Chattanooga Square, Clarksville Crossing.</li>
                  </ul>
                </div>

                <p className="ai-brief-closing">
                  District 14 is a genuine high-performer — #2 nationally and the Southeast leader. The Johnson City Mall crisis and the district-wide Accessories gap are the two items to close this week. Fix Johnson City and issue the Accessories broadcast, and District 14 is on a credible path to #1 nationally within 3–4 weeks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Stores Modal — Read-only awareness view */}
      {showViewStoresModal && (
        <div className="action-modal-overlay" onClick={() => setShowViewStoresModal(false)}>
          <div className="action-modal recall-stores-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <div className="recall-header-icon">
                  <WarningAmberOutlined sx={{ fontSize: 18 }}/>
                </div>
                <div>
                  <h2>Product Recall — Impacted Stores</h2>
                  <span className="recall-header-sub">Children's Pajamas Drawstring Recall Batch #7742 · Safety Alert</span>
                </div>
              </div>
              <button className="action-modal-close" onClick={() => setShowViewStoresModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>

            {/* Summary bar */}
            <div className="recall-select-bar">
              <div className="recall-select-meta">
                <span className="recall-stores-count"><StoreOutlined sx={{ fontSize: 13 }}/> {impactedStores.length} stores impacted</span>
                <span className="recall-sku-total">{impactedStores.reduce((sum, s) => sum + s.unitCount, 0)} units to pull</span>
              </div>
            </div>

            {/* Store Cards — info only */}
            <div className="action-modal-content">
              <div className="recall-stores-list">
                {impactedStores.map((store) => (
                  <div 
                    key={store.id} 
                    className={`recall-store-card severity-${store.status}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setShowViewStoresModal(false);
                      navigate(`/store-operations/store-deep-dive?store=${store.id}`);
                    }}
                  >
                    {/* Severity indicator */}
                    <div className="recall-card-left">
                      <div className={`recall-severity-bar severity-${store.status}`} />
                    </div>

                    {/* Main Content */}
                    <div className="recall-card-body">
                      <div className="recall-card-top">
                        <div className="recall-card-identity">
                          <h4>{store.name}</h4>
                          <span className={`recall-status-pill ${store.status}`}>
                            {store.status === 'critical' && <WarningAmberOutlined sx={{ fontSize: 10 }}/>}
                            {store.status === 'warning' && <ErrorOutlined sx={{ fontSize: 10 }}/>}
                            {store.status === 'critical' ? 'Critical' : 'Warning'}
                          </span>
                        </div>
                        <div className="recall-sku-badge">{store.unitCount} units</div>
                      </div>

                      <div className="recall-card-grid">
                        <div className="recall-card-detail">
                          <PlaceOutlined sx={{ fontSize: 13 }}/>
                          <span>{store.address}</span>
                        </div>
                        <div className="recall-card-detail">
                          <div className="recall-manager-avatar">{store.manager.split(' ').map(n => n[0]).join('')}</div>
                          <span>{store.manager}</span>
                        </div>
                        <div className="recall-card-detail">
                          <PhoneOutlined sx={{ fontSize: 13 }}/>
                          <span>{store.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer — single CTA to Operations Queue */}
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowViewStoresModal(false)}>
                Close
              </button>
              <button 
                className="modal-btn primary"
                onClick={() => {
                  setShowViewStoresModal(false);
                  navigate('/command-center/operations-queue?broadcast=bc-001');
                }}
              >
                <OpenInNewOutlined sx={{ fontSize: 16 }}/>
                Open in Operations Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="action-modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <PersonAddAlt1Outlined sx={{ fontSize: 20 }}/>
                <h2>Assign Task</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowAssignModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <span>Select a team member to handle this task</span>
            </div>
            <div className="action-modal-content">
              <div className="assign-search">
                <SearchOutlined sx={{ fontSize: 16 }}/>
                <input 
                  type="text" 
                  placeholder="Search team members..."
                  value={assignSearchQuery}
                  onChange={(e) => setAssignSearchQuery(e.target.value)}
                />
              </div>
              <div className="team-members-list">
                {teamMembers
                  .filter(m => m.name.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
                              m.role.toLowerCase().includes(assignSearchQuery.toLowerCase()))
                  .map((member) => (
                  <div 
                    key={member.id} 
                    className={`team-member-card ${selectedAssignee === member.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAssignee(member.id)}
                  >
                    <div className="member-avatar">{member.avatar}</div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <span className="member-role">{member.role}</span>
                      <span className="member-store">{member.store}</span>
                    </div>
                    {selectedAssignee === member.id && (
                      <div className="member-selected">
                        <Check sx={{ fontSize: 16 }}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => {
                setShowAssignModal(false);
                setSelectedAssignee(null);
                setAssignSearchQuery('');
              }}>
                Cancel
              </button>
              <button 
                className="modal-btn primary" 
                disabled={!selectedAssignee}
                onClick={handleAssignSubmit}
              >
                <SendOutlined sx={{ fontSize: 16 }}/>
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKU Review Modal */}
      {showSkuReviewModal && !showReorderSent && (
        <div className="action-modal-overlay" onClick={() => {
          setShowSkuReviewModal(false);
          setSelectedSkus([]);
        }}>
          <div className="action-modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <InventoryOutlined sx={{ fontSize: 20 }}/>
                <h2>SKUs at Risk</h2>
              </div>
              <button className="action-modal-close" onClick={() => {
                setShowSkuReviewModal(false);
                setSelectedSkus([]);
              }}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <div className="subtitle-row">
                <span>{atRiskSkus.length} SKUs below safety stock levels</span>
                <button 
                  className="select-all-btn"
                  onClick={() => {
                    if (selectedSkus.length === atRiskSkus.length) {
                      setSelectedSkus([]);
                    } else {
                      setSelectedSkus(atRiskSkus.map(s => s.sku));
                    }
                  }}
                >
                  {selectedSkus.length === atRiskSkus.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <div className="action-modal-content">
              <div className="sku-table">
                <div className="sku-table-header with-checkbox">
                  <span></span>
                  <span>SKU</span>
                  <span>Product</span>
                  <span>Current</span>
                  <span>Safety</span>
                  <span>Reorder Qty</span>
                  <span>Supplier</span>
                  <span>Lead Time</span>
                </div>
                {atRiskSkus.map((sku) => (
                  <div 
                    key={sku.sku} 
                    className={`sku-table-row with-checkbox ${selectedSkus.includes(sku.sku) ? 'selected' : ''}`}
                    onClick={() => {
                      if (selectedSkus.includes(sku.sku)) {
                        setSelectedSkus(prev => prev.filter(s => s !== sku.sku));
                      } else {
                        setSelectedSkus(prev => [...prev, sku.sku]);
                      }
                    }}
                  >
                    <div className="sku-checkbox">
                      <div className={`checkbox ${selectedSkus.includes(sku.sku) ? 'checked' : ''}`}>
                        {selectedSkus.includes(sku.sku) && <Check sx={{ fontSize: 12 }}/>}
                      </div>
                    </div>
                    <span className="sku-id">{sku.sku}</span>
                    <span className="sku-name">{sku.name}</span>
                    <span className={`sku-stock ${sku.currentStock < sku.safetyStock * 0.3 ? 'critical' : 'warning'}`}>
                      {sku.currentStock}
                    </span>
                    <span className="sku-safety">{sku.safetyStock}</span>
                    <span className="sku-reorder">{sku.reorderQty}</span>
                    <span className="sku-supplier">{sku.supplier}</span>
                    <span className="sku-lead">{sku.leadTime}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => {
                showToast('Report downloaded');
              }}>
                <FileDownloadOutlined sx={{ fontSize: 16 }}/>
                Export Report
              </button>
              <button 
                className="modal-btn primary" 
                disabled={selectedSkus.length === 0}
                onClick={selectedSkus.length === atRiskSkus.length ? handleReorderAll : handleSendReorderAction}
              >
                <SendOutlined sx={{ fontSize: 16 }}/>
                {selectedSkus.length === 0 
                  ? 'Select SKUs to Reorder' 
                  : selectedSkus.length === atRiskSkus.length 
                    ? `Send Reorder Action (All ${atRiskSkus.length})` 
                    : `Send Reorder Action (${selectedSkus.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Sent Confirmation */}
      {showReorderSent && (
        <div className="action-modal-overlay" onClick={() => {
          setShowReorderSent(false);
          setShowSkuReviewModal(false);
          setSelectedSkus([]);
          setReorderedSkus([]);
        }}>
          <div className="action-modal notification-sent" onClick={(e) => e.stopPropagation()}>
            <div className="notification-sent-content">
              <div className="notification-sent-icon">
                <TaskAltOutlined sx={{ fontSize: 48 }}/>
              </div>
              <h2>Reorder Action Sent!</h2>
              <p>Reorder requests have been sent to store owners for the following SKUs:</p>
              
              <div className="reordered-skus-list">
                {reorderedSkus.map((sku) => (
                  <div key={sku.sku} className="reordered-sku-item">
                    <div className="reordered-sku-icon">
                      <InventoryOutlined sx={{ fontSize: 16 }}/>
                    </div>
                    <div className="reordered-sku-info">
                      <span className="reordered-sku-name">{sku.name}</span>
                      <span className="reordered-sku-details">{sku.sku} • Qty: {sku.reorderQty} • {sku.supplier}</span>
                    </div>
                    <div className="reordered-sku-status">
                      <Check sx={{ fontSize: 14 }}/>
                      <span>Sent</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notification-message-preview">
                <div className="message-preview-header">
                  <NotificationsOutlined sx={{ fontSize: 14 }}/>
                  <span>Action Sent to Store Owners</span>
                </div>
                <div className="message-preview-content">
                  <strong>Inventory Reorder Required</strong>
                  <p>{reorderedSkus.length} SKU{reorderedSkus.length > 1 ? 's' : ''} below safety stock. Please review and confirm reorder quantities with suppliers. Expected lead time: 1-3 days.</p>
                </div>
              </div>

              <button 
                className="modal-btn primary full-width"
                onClick={() => {
                  // Archive the reorder action
                  setArchivedActions(prev => [...prev, {
                    id: `reorder-${Date.now()}`,
                    title: `Reorder action sent for ${reorderedSkus.length} SKUs`,
                    completedAt: new Date(),
                    type: 'reorder'
                  }]);
                  setShowReorderSent(false);
                  setShowSkuReviewModal(false);
                  setSelectedSkus([]);
                  setReorderedSkus([]);
                  showToast('✓ Reorder actions delivered to store owners');
                }}
              >
                <Check sx={{ fontSize: 16 }}/>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Approval Modal */}
      {showActionApprovalModal && selectedActionItem && (
        <div className="action-modal-overlay" onClick={() => setShowActionApprovalModal(false)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <AssignmentTurnedInOutlined sx={{ fontSize: 20 }}/>
                <h2>{selectedActionItem.cta}</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowActionApprovalModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-content">
              <div className="approval-details">
                <div className="approval-header">
                  <h3>{selectedActionItem.title}</h3>
                  <span className={`severity-tag ${selectedActionItem.severity}`}>
                    {selectedActionItem.severity.toUpperCase()}
                  </span>
                </div>
                {selectedActionItem.impact && (
                  <div className="approval-impact">
                    <ErrorOutlined sx={{ fontSize: 16 }}/>
                    <span>{selectedActionItem.impact}</span>
                  </div>
                )}
                <div className="approval-meta">
                  <div className="meta-row">
                    <span className="meta-label">Source</span>
                    <span className="meta-value">{selectedActionItem.source_module}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Context</span>
                    <span className="meta-value">{selectedActionItem.context}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Due</span>
                    <span className={`meta-value ${selectedActionItem.status === 'overdue' ? 'overdue' : ''}`}>
                      {formatDueTime(selectedActionItem.due_time)}
                    </span>
                  </div>
                </div>
                <div className="approval-note">
                  <label>Add a note (optional)</label>
                  <textarea placeholder="Enter any comments or instructions..."></textarea>
                </div>
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="modal-btn reject" onClick={handleRejectAction}>
                <CloseOutlined sx={{ fontSize: 16 }}/>
                Send Back
              </button>
              <button className="modal-btn primary" onClick={handleApproveAction}>
                <Check sx={{ fontSize: 16 }}/>
                {selectedActionItem.cta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers Modal */}
      {showTopPerformersModal && (
        <div className="action-modal-overlay" onClick={() => setShowTopPerformersModal(false)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <TrendingUpOutlined sx={{ fontSize: 20 }}/>
                <h2>Top Performers</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowTopPerformersModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <span>Stores exceeding sales targets this period</span>
            </div>
            <div className="action-modal-content">
              <div className="performers-list">
                {topPerformers.map((performer) => (
                  <div key={performer.rank} className="performer-card">
                    <div className={`performer-rank rank-${performer.rank}`}>
                      #{performer.rank}
                    </div>
                    <div className="performer-info">
                      <h4>{performer.store}</h4>
                      <span className="performer-manager">{performer.manager}</span>
                    </div>
                    <div className="performer-stats">
                      <div className="performer-stat">
                        <span className="stat-value positive">{performer.sales}</span>
                        <span className="stat-label">vs Target</span>
                      </div>
                      <div className="performer-stat">
                        <span className="stat-value">{performer.target}</span>
                        <span className="stat-label">Achievement</span>
                      </div>
                    </div>
                    <div className={`performer-trend ${performer.trend}`}>
                      {performer.trend === 'up' ? <TrendingUpOutlined sx={{ fontSize: 16 }}/> : <Remove sx={{ fontSize: 16 }}/>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowTopPerformersModal(false)}>
                Close
              </button>
              <button className="modal-btn primary" onClick={() => {
                showToast('✓ Performance report exported successfully');
                setShowTopPerformersModal(false);
              }}>
                <FileDownloadOutlined sx={{ fontSize: 16 }}/>
                Export Full Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regional Breakdown Modal */}
      {showRegionalModal && (
        <div className="action-modal-overlay" onClick={() => setShowRegionalModal(false)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <PlaceOutlined sx={{ fontSize: 20 }}/>
                <h2>Regional Breakdown</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowRegionalModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <span>Customer Satisfaction (VoC Score) by Region</span>
            </div>
            <div className="action-modal-content">
              <div className="regional-list">
                {regionalData.map((region) => (
                  <div key={region.region} className="regional-card">
                    <div className="regional-header">
                      <h4>{region.region} Region</h4>
                      <span className="regional-stores">{region.stores} stores</span>
                    </div>
                    <div className="regional-stats">
                      <div className="regional-voc">
                        <span className="voc-value">{region.vocScore}</span>
                        <span className="voc-label">VoC Score</span>
                      </div>
                      <div className={`regional-change ${region.change >= 0 ? 'positive' : 'negative'}`}>
                        {region.change >= 0 ? <TrendingUpOutlined sx={{ fontSize: 14 }}/> : <TrendingDownOutlined sx={{ fontSize: 14 }}/>}
                        <span>{region.change >= 0 ? '+' : ''}{region.change} pts</span>
                      </div>
                    </div>
                    <div className="regional-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${region.vocScore}%` }}></div>
                      </div>
                    </div>
                    <div className="regional-top">
                      <StoreOutlined sx={{ fontSize: 12 }}/>
                      <span>Top: {region.topStore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowRegionalModal(false)}>
                Close
              </button>
              <button className="modal-btn primary" onClick={() => {
                showToast('Opening regional analytics...');
                setShowRegionalModal(false);
              }}>
                <BarChartOutlined sx={{ fontSize: 16 }}/>
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Planogram Modal */}
      {showPlanogramModal && selectedPlanogramItem && (
        <div className="action-modal-overlay" onClick={() => setShowPlanogramModal(false)}>
          <div className="planogram-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <InventoryOutlined sx={{ fontSize: 20 }}/>
                <h2>{selectedPlanogramItem.title}</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowPlanogramModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <span>{selectedPlanogramItem.context} • {selectedPlanogramItem.microContext}</span>
            </div>
            
            <div className="planogram-modal-content">
              {/* Planogram Image */}
              <div className="planogram-image-section">
                <h4>Planogram Preview</h4>
                <div className="planogram-image-container">
                  <img 
                    src={selectedPlanogramItem.planogramImage} 
                    alt="Planogram" 
                    className="planogram-image"
                  />
                </div>
              </div>
              
              {/* Action Items from Planogram */}
              <div className="planogram-actions-section">
                <div className="planogram-actions-header">
                  <h4>Action Items</h4>
                  <span className="actions-count">{selectedPlanogramItem.planogramActions?.length || 0} tasks to assign</span>
                </div>
                <p className="planogram-actions-desc">Select assignee for each action item to create tasks</p>
                
                <div className="planogram-actions-list">
                  {selectedPlanogramItem.planogramActions?.map((action) => (
                    <div key={action.id} className={`planogram-action-item priority-${action.priority}`}>
                      <div className="planogram-action-content">
                        <div className="planogram-action-header">
                          <span className={`action-priority-badge ${action.priority}`}>
                            {action.priority.toUpperCase()}
                          </span>
                          <span className="action-section-badge">{action.section}</span>
                        </div>
                        <p className="planogram-action-desc">{action.description}</p>
                      </div>
                      <div className="planogram-action-assign">
                        <AssigneeDropdown
                          value={planogramActionAssignments[action.id] || ''}
                          onChange={(v) => handleAssignPlanogramAction(action.id, v)}
                          options={[
                            { value: 'self', label: 'Assign to myself', sublabel: 'You', avatar: 'ME' },
                            ...teamMembers.map(m => ({
                              value: m.id,
                              label: m.name,
                              sublabel: `${m.role} · ${m.store}`,
                              avatar: m.avatar,
                            })),
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowPlanogramModal(false)}>
                Cancel
              </button>
              <button 
                className="modal-btn primary"
                disabled={Object.keys(planogramActionAssignments).length === 0}
                onClick={handleCreateActionItems}
              >
                <Check sx={{ fontSize: 16 }}/>
                Create {Object.keys(planogramActionAssignments).length} Action Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && selectedInventoryItem && (
        <div className="action-modal-overlay" onClick={() => setShowInventoryModal(false)}>
          <div className="context-modal inventory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <InventoryOutlined sx={{ fontSize: 20 }}/>
                <h2>{selectedInventoryItem.title}</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowInventoryModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="context-modal-subtitle">
              <span>{selectedInventoryItem.context} • {selectedInventoryItem.microContext}</span>
            </div>
            
            <div className="context-modal-content">
              
              <div className="inventory-list">
                <div className="list-header">
                  <span>Select SKUs to reorder</span>
                  <button 
                    className="select-all-btn"
                    onClick={() => setSelectedSkusForReorder(
                      selectedSkusForReorder.length === selectedInventoryItem.inventoryItems?.length 
                        ? [] 
                        : selectedInventoryItem.inventoryItems?.map(i => i.id) || []
                    )}
                  >
                    {selectedSkusForReorder.length === selectedInventoryItem.inventoryItems?.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                {selectedInventoryItem.inventoryItems?.map((item) => (
                  <div key={item.id} className={`inventory-item priority-${item.priority}`}>
                    <label className="inventory-checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedSkusForReorder.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkusForReorder(prev => [...prev, item.id]);
                          } else {
                            setSelectedSkusForReorder(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <div className="inventory-item-info">
                      <div className="item-header">
                        <span className="item-sku">{item.sku}</span>
                        <span className={`priority-badge ${item.priority}`}>{item.priority.toUpperCase()}</span>
                      </div>
                      <span className="item-name">{item.name}</span>
                      <span className="item-supplier">Supplier: {item.supplier}</span>
                    </div>
                    <div className="inventory-item-stock">
                      <div className="stock-bar">
                        <div className="stock-fill" style={{ width: `${(item.currentStock / item.minStock) * 100}%` }}></div>
                      </div>
                      <span className="stock-text">{item.currentStock} / {item.minStock} min</span>
                    </div>
                    <div className="inventory-item-reorder">
                      <span className="reorder-qty">+{item.reorderQty} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowInventoryModal(false)}>
                Cancel
              </button>
              <button 
                className="modal-btn primary"
                disabled={selectedSkusForReorder.length === 0}
                onClick={() => {
                  showToast(`✓ Reorder placed for ${selectedSkusForReorder.length} SKUs`);
                  setShowInventoryModal(false);
                }}
              >
                <ShoppingCartOutlined sx={{ fontSize: 16 }}/>
                Reorder {selectedSkusForReorder.length} SKUs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && selectedChecklistItem && (
        <div className="action-modal-overlay" onClick={() => setShowChecklistModal(false)}>
          <div className="context-modal checklist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <AssignmentTurnedInOutlined sx={{ fontSize: 20 }}/>
                <h2>{selectedChecklistItem.title}</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowChecklistModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <span>{selectedChecklistItem.context} • {selectedChecklistItem.impact}</span>
            </div>
            
            <div className="context-modal-content">
              <div className="checklist-progress-bar">
                <div className="progress-fill" style={{ 
                  width: `${(Object.values(checklistProgress).filter(s => s === 'completed').length / (selectedChecklistItem.checklistItems?.length || 1)) * 100}%` 
                }}></div>
              </div>
              <div className="checklist-progress-text">
                {Object.values(checklistProgress).filter(s => s === 'completed').length} of {selectedChecklistItem.checklistItems?.length} completed
              </div>
              
              <div className="checklist-categories">
                {Array.from(new Set(selectedChecklistItem.checklistItems?.map(i => i.category))).map(category => (
                  <div key={category} className="checklist-category">
                    <h4 className="category-title">{category}</h4>
                    <div className="category-items">
                      {selectedChecklistItem.checklistItems?.filter(i => i.category === category).map(item => (
                        <div key={item.id} className={`checklist-item ${checklistProgress[item.id] || 'pending'}`}>
                          <div className="checklist-item-content">
                            <span className="item-text">{item.item}</span>
                          </div>
                          <div className="checklist-item-actions">
                            <button 
                              className={`check-btn pass ${checklistProgress[item.id] === 'completed' ? 'active' : ''}`}
                              onClick={() => setChecklistProgress(prev => ({ ...prev, [item.id]: 'completed' }))}
                            >
                              <Check sx={{ fontSize: 14 }}/>
                            </button>
                            <button 
                              className={`check-btn fail ${checklistProgress[item.id] === 'failed' ? 'active' : ''}`}
                              onClick={() => setChecklistProgress(prev => ({ ...prev, [item.id]: 'failed' }))}
                            >
                              <CloseOutlined sx={{ fontSize: 14 }}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowChecklistModal(false)}>
                Save Draft
              </button>
              <button 
                className="modal-btn primary"
                disabled={Object.keys(checklistProgress).length !== selectedChecklistItem.checklistItems?.length}
                onClick={() => {
                  const failed = Object.values(checklistProgress).filter(s => s === 'failed').length;
                  if (failed > 0) {
                    showToast(`️ Checklist submitted with ${failed} failed items`);
                  } else {
                    showToast('✓ Safety checklist completed successfully');
                  }
                  setShowChecklistModal(false);
                }}
              >
                <AssignmentTurnedInOutlined sx={{ fontSize: 16 }}/>
                Submit Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Modal */}
      {showShipmentModal && selectedShipmentItem && (
        <div className="action-modal-overlay" onClick={() => setShowShipmentModal(false)}>
          <div className="context-modal shipment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <LocalShippingOutlined sx={{ fontSize: 20 }}/>
                <h2>{selectedShipmentItem.title}</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowShipmentModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <span>{selectedShipmentItem.context} • {selectedShipmentItem.microContext}</span>
            </div>
            
            <div className="context-modal-content">
              <div className="shipment-details-card">
                <div className="shipment-detail">
                  <span className="detail-label">Shipment ID</span>
                  <span className="detail-value">{selectedShipmentItem.shipmentDetails?.shipmentId}</span>
                </div>
                <div className="shipment-detail">
                  <span className="detail-label">Carrier</span>
                  <span className="detail-value">{selectedShipmentItem.shipmentDetails?.carrier}</span>
                </div>
                <div className="shipment-detail">
                  <span className="detail-label">PO Number</span>
                  <span className="detail-value">{selectedShipmentItem.shipmentDetails?.poNumber}</span>
                </div>
                <div className="shipment-detail">
                  <span className="detail-label">Total Value</span>
                  <span className="detail-value">${selectedShipmentItem.shipmentDetails?.totalValue.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="shipment-items-list">
                <div className="list-header">
                  <span>Validate received items</span>
                  <span className="variance-legend">
                    <span className="legend-item complete">✓ Complete</span>
                    <span className="legend-item short">↓ Short</span>
                    <span className="legend-item over">↑ Over</span>
                  </span>
                </div>
                {selectedShipmentItem.shipmentItems?.map((item) => (
                  <div key={item.id} className={`shipment-item status-${item.status}`}>
                    <div className="shipment-item-info">
                      <span className="item-sku">{item.sku}</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <div className="shipment-item-qty">
                      <span className="qty-ordered">Ordered: {item.ordered}</span>
                      <span className="qty-received">Received: {item.received}</span>
                      {item.variance && (
                        <span className={`qty-variance ${item.variance > 0 ? 'over' : 'short'}`}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </span>
                      )}
                    </div>
                    <div className="shipment-item-validate">
                      <label className="validate-checkbox">
                        <input 
                          type="checkbox"
                          checked={shipmentValidations[item.id] || false}
                          onChange={(e) => setShipmentValidations(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        />
                        <span className="checkmark"></span>
                        <span>Verified</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowShipmentModal(false)}>
                Cancel
              </button>
              <button 
                className="modal-btn primary"
                disabled={Object.keys(shipmentValidations).length !== selectedShipmentItem.shipmentItems?.length}
                onClick={() => {
                  showToast('✓ Shipment validated and received');
                  setShowShipmentModal(false);
                }}
              >
                <Check sx={{ fontSize: 16 }}/>
                Validate Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VoC Escalation Modal */}
      {showVoCModal && selectedVoCItem && (
        <div className="action-modal-overlay" onClick={() => setShowVoCModal(false)}>
          <div className="context-modal voc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="action-modal-header">
              <div className="action-modal-title-row">
                <ChatBubbleOutlineOutlined sx={{ fontSize: 20 }}/>
                <h2>{selectedVoCItem.title}</h2>
              </div>
              <button className="action-modal-close" onClick={() => setShowVoCModal(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="action-modal-subtitle">
              <span>{selectedVoCItem.context} • {selectedVoCItem.microContext}</span>
            </div>
            
            <div className="context-modal-content voc-split">
              <div className="escalations-list">
                <h4>Customer Escalations</h4>
                {selectedVoCItem.escalations?.map((esc) => (
                  <div 
                    key={esc.id} 
                    className={`escalation-card ${selectedEscalation?.id === esc.id ? 'selected' : ''} sentiment-${esc.sentiment}`}
                    onClick={() => setSelectedEscalation(esc)}
                  >
                    <div className="escalation-header">
                      <span className="customer-name">{esc.customerName}</span>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <StarBorderOutlined key={star} sx={{ fontSize: 12 }} className={star <= esc.rating ? 'filled' : ''} />
                        ))}
                      </div>
                    </div>
                    <span className="escalation-category">{esc.category}</span>
                    <p className="escalation-summary">{esc.summary}</p>
                    <span className="escalation-time">{formatTimeAgo(esc.date)}</span>
                  </div>
                ))}
              </div>
              
              <div className="escalation-detail">
                {selectedEscalation ? (
                  <>
                    <div className="detail-header">
                      <h4>{selectedEscalation.customerName}</h4>
                      <span className={`sentiment-badge ${selectedEscalation.sentiment}`}>
                        {selectedEscalation.sentiment.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="detail-meta">
                      <span className="meta-item">{selectedEscalation.category}</span>
                      <span className="meta-item">{formatTimeAgo(selectedEscalation.date)}</span>
                    </div>
                    <div className="detail-content">
                      <h5>Customer Feedback</h5>
                      <p>{selectedEscalation.details}</p>
                    </div>
                    <div className="response-section">
                      <h5>Your Response</h5>
                      <textarea 
                        placeholder="Type your response to the customer..."
                        value={escalationResponse}
                        onChange={(e) => setEscalationResponse(e.target.value)}
                        rows={4}
                      />
                      <div className="response-actions">
                        <button 
                          className="modal-btn primary"
                          disabled={!escalationResponse.trim()}
                          onClick={() => {
                            showToast('✓ Response sent to customer');
                            setSelectedEscalation(null);
                            setEscalationResponse('');
                          }}
                        >
                          <SendOutlined sx={{ fontSize: 14 }}/>
                          Send Response
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-selection">
                    <ChatBubbleOutlineOutlined sx={{ fontSize: 32 }}/>
                    <p>Select an escalation to view details and respond</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="action-modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowVoCModal(false)}>
                Close
              </button>
              <button 
                className="modal-btn primary"
                onClick={() => {
                  showToast('✓ All escalations reviewed');
                  setShowVoCModal(false);
                }}
              >
                <Check sx={{ fontSize: 16 }}/>
                Mark All Reviewed
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Approval Drawer */}
      {showApprovalDrawer && approvalDrawerItem && (
        <>
          <div className="approval-drawer-overlay" onClick={() => {
            setShowApprovalDrawer(false);
            setApprovalDrawerItem(null);
            setApprovalNote('');
          }} />
          <div className="approval-drawer open">
            <div className="drawer-header">
              <div className="drawer-header-top">
                <div className="drawer-badge-row">
                  <span className="drawer-badge severity">BLOCKING</span>
                  <span className="drawer-badge overdue">
                    <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                    {formatDueTime(approvalDrawerItem.due_time)}
                  </span>
                </div>
                <button className="drawer-close" onClick={() => {
                  setShowApprovalDrawer(false);
                  setApprovalDrawerItem(null);
                  setApprovalNote('');
                }}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
              <h2 className="drawer-title">{approvalDrawerItem.title}</h2>
              <p className="drawer-subtitle">{approvalDrawerItem.impact}</p>
            </div>

            <div className="drawer-body">
              {/* Planogram Preview */}
              {approvalDrawerItem.planogramImage && (
                <div className="drawer-section">
                  <h3 className="drawer-section-title">Planogram Preview</h3>
                  <div className="drawer-planogram-preview">
                    <img src={approvalDrawerItem.planogramImage} alt="Planogram" />
                  </div>
                </div>
              )}

              {/* Impacted Stores */}
              <div className="drawer-section">
                <h3 className="drawer-section-title">
                  <StoreOutlined sx={{ fontSize: 14 }}/>
                  Impacted Stores
                  <span className="drawer-section-count">3</span>
                </h3>
                <div className="drawer-stores-grid">
                  {[
                    { id: 's1', name: 'Downtown Plaza #2034', manager: 'Sarah M.', status: 'waiting', waitTime: '3h 12m' },
                    { id: 's2', name: 'Riverside Mall #1876', manager: 'Marcus C.', status: 'waiting', waitTime: '2h 48m' },
                    { id: 's3', name: 'Central Station #3421', manager: 'Lisa W.', status: 'waiting', waitTime: '2h 30m' },
                  ].map(store => (
                    <div key={store.id} className="drawer-store-chip">
                      <div className="drawer-store-avatar">{store.manager.split(' ').map(n => n[0]).join('')}</div>
                      <div className="drawer-store-info">
                        <span className="drawer-store-name">{store.name}</span>
                        <span className="drawer-store-manager">{store.manager} · waiting {store.waitTime}</span>
                      </div>
                      <div className="drawer-store-status waiting">
                        <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Actions */}
              {approvalDrawerItem.planogramActions && (
                <div className="drawer-section">
                  <h3 className="drawer-section-title">
                    <AssignmentTurnedInOutlined sx={{ fontSize: 14 }}/>
                    Reset Actions
                    <span className="drawer-section-count">{approvalDrawerItem.planogramActions.length}</span>
                  </h3>
                  <div className="drawer-actions-list">
                    {approvalDrawerItem.planogramActions.map((action, idx) => (
                      <div key={action.id} className="drawer-action-row">
                        <span className="drawer-action-num">{idx + 1}</span>
                        <div className="drawer-action-content">
                          <span className="drawer-action-desc">{action.description}</span>
                          <div className="drawer-action-meta">
                            <span className="drawer-action-section">{action.section}</span>
                            <span className={`drawer-action-priority ${action.priority}`}>{action.priority}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Trail */}
              <div className="drawer-section">
                <h3 className="drawer-section-title">
                  <AccessTimeOutlined sx={{ fontSize: 14 }}/>
                  Audit Trail
                </h3>
                <div className="drawer-audit-trail">
                  <div className="audit-entry">
                    <div className="audit-dot current" />
                    <div className="audit-info">
                      <span className="audit-action">Awaiting your approval</span>
                      <span className="audit-time">Now</span>
                    </div>
                  </div>
                  <div className="audit-entry">
                    <div className="audit-dot" />
                    <div className="audit-info">
                      <span className="audit-action">Planogram submitted by Visual Merchandising</span>
                      <span className="audit-time">3h ago</span>
                    </div>
                  </div>
                  <div className="audit-entry">
                    <div className="audit-dot" />
                    <div className="audit-info">
                      <span className="audit-action">Store readiness confirmed (3/3 stores)</span>
                      <span className="audit-time">4h ago</span>
                    </div>
                  </div>
                  <div className="audit-entry">
                    <div className="audit-dot" />
                    <div className="audit-info">
                      <span className="audit-action">SS26 Women's Wall planogram finalized</span>
                      <span className="audit-time">Yesterday, 4:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="drawer-section">
                <h3 className="drawer-section-title">Add a note (optional)</h3>
                <textarea 
                  className="drawer-note-input"
                  placeholder="Enter comments or instructions for store teams..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                />
              </div>
            </div>

            <div className="drawer-footer">
              <button className="drawer-btn reject" onClick={handleDrawerReject}>
                <CloseOutlined sx={{ fontSize: 15 }}/>
                Send Back
              </button>
              <button className="drawer-btn approve" onClick={handleDrawerApprove}>
                <Check sx={{ fontSize: 15 }}/>
                Approve &amp; Notify Stores
              </button>
            </div>
          </div>
        </>
      )}

      {/* Right-Side Detail Panel */}
      {detailPanel && (
        <>
          <div className="detail-panel-overlay" onClick={closeDetailPanel} />
          <div className="detail-panel">
            {/* Hero header — shown for main action view */}
            {detailPanel.type === 'action' && !panelSubView ? (() => {
              const a = detailPanel.data;
              const srcIcon: Record<string, React.ReactNode> = {
                Planogram: <GridOnOutlined sx={{ fontSize: 16 }}/>,
                Compliance: <AssignmentTurnedInOutlined sx={{ fontSize: 16 }}/>,
                Receiving: <SyncOutlined sx={{ fontSize: 16 }}/>,
                Customer: <WarningAmberOutlined sx={{ fontSize: 16 }}/>,
              };
              const srcColor: Record<string, string> = {
                Planogram: '#6d28d9',
                Compliance: '#0e7490',
                Receiving: '#1d4ed8',
                Customer: '#b45309',
              };
              const srcBg: Record<string, string> = {
                Planogram: '#ede9fe',
                Compliance: '#cffafe',
                Receiving: '#dbeafe',
                Customer: '#fef3c7',
              };
              const sevColor: Record<string, string> = { critical: '#b91c1c', high: '#92400e', medium: '#1d4ed8', low: '#166534' };
              const sevBg: Record<string, string> = { critical: '#fee2e2', high: '#fef3c7', medium: '#dbeafe', low: '#dcfce7' };
              const sev = a.severity || 'medium';
              return (
                <div className="dp-hero-header">
                  <div className="dp-hero-top">
                    <div className="dp-hero-icon" style={{ background: srcBg[a.source_module] || '#f1f5f9', color: srcColor[a.source_module] || '#475569' }}>
                      {srcIcon[a.source_module] || <BoltOutlined sx={{ fontSize: 16 }}/>}
                    </div>
                    <span className="dp-hero-type">{a.source_module?.toUpperCase()}</span>
                    <button className="dp-hero-close" onClick={closeDetailPanel}>
                      <CloseOutlined sx={{ fontSize: 17 }}/>
                    </button>
                  </div>
                  <h2 className="dp-hero-title">{a.title}</h2>
                  <div className="dp-hero-pills">
                    <span className="dp-hero-pill" style={{ background: sevBg[sev], color: sevColor[sev] }}>
                      <WarningAmberOutlined sx={{ fontSize: 10 }}/> {sev.charAt(0).toUpperCase() + sev.slice(1)} Severity
                    </span>
                    {a.status === 'overdue' && (
                      <span className="dp-hero-pill" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                        <AccessTimeOutlined sx={{ fontSize: 10 }}/> Overdue
                      </span>
                    )}
                    {a.context && (
                      <span className="dp-hero-pill" style={{ background: '#f1f5f9', color: '#475569' }}>
                        {a.context}
                      </span>
                    )}
                  </div>
                </div>
              );
            })() : (
              /* Simple header for sub-views */
              <div className="detail-panel-header">
                {panelSubView && (
                  <button className="detail-panel-back" onClick={goBackToPanel}>
                    <ArrowForwardOutlined sx={{ fontSize: 16 }} style={{ transform: 'rotate(180deg)' }}/>
                    <span>Back</span>
                  </button>
                )}
                <button className="detail-panel-close" onClick={closeDetailPanel}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
            )}

            {/* ===== SUB-VIEW: Assign Task ===== */}
            {panelSubView?.view === 'assign-task' && (
              <div className="detail-panel-body">
                <div className="dp-subview-header">
                  <PersonAddAlt1Outlined sx={{ fontSize: 20 }} className="dp-subview-icon"/>
                  <div>
                    <h2 className="dp-title">Assign to Store Manager</h2>
                    <p className="dp-description">Select a store manager to handle this task</p>
                  </div>
                </div>

                {panelSubView.parentTitle && (
                  <div className="dp-subview-context">
                    <WarningAmberOutlined sx={{ fontSize: 12 }}/>
                    <span>{panelSubView.parentTitle}</span>
                  </div>
                )}

                <div className="dp-section">
                  <div className="dp-assign-search">
                    <SearchOutlined sx={{ fontSize: 15 }}/>
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={assignSearchQuery}
                      onChange={(e) => setAssignSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="dp-team-list">
                    {teamMembers
                      .filter(m => m.name.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
                                  m.role.toLowerCase().includes(assignSearchQuery.toLowerCase()))
                      .map((member) => (
                      <div
                        key={member.id}
                        className={`dp-team-card ${selectedAssignee === member.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAssignee(member.id)}
                      >
                        <div className="dp-team-avatar">{member.avatar}</div>
                        <div className="dp-team-info">
                          <span className="dp-team-name">{member.name}</span>
                          <span className="dp-team-role">{member.role} · {member.store}</span>
                        </div>
                        {selectedAssignee === member.id && (
                          <div className="dp-team-check"><Check sx={{ fontSize: 14 }}/></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dp-actions">
                  <button className="dp-action-btn outlined" onClick={goBackToPanel}>
                    <span>Cancel</span>
                  </button>
                  <button
                    className="dp-action-btn filled"
                    disabled={!selectedAssignee}
                    onClick={() => {
                      handleAssignSubmit();
                      goBackToPanel();
                    }}
                  >
                    <SendOutlined sx={{ fontSize: 15 }}/>
                    <span>Assign to Manager</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===== SUB-VIEW: Review SKUs ===== */}
            {panelSubView?.view === 'review-skus' && (() => {
              const filteredSkus = panelSubView.storeFilter
                ? atRiskSkus.filter(s => s.store === panelSubView.storeFilter)
                : atRiskSkus;
              const allFilteredSelected = filteredSkus.length > 0 && filteredSkus.every(s => selectedSkus.includes(s.sku));
              return (
              <div className="detail-panel-body">
                <div className="dp-subview-header">
                  <InventoryOutlined sx={{ fontSize: 20 }} className="dp-subview-icon"/>
                  <div>
                    <h2 className="dp-title">
                      {panelSubView.storeFilter ? `SKUs at Risk — ${panelSubView.storeFilter}` : 'SKUs at Risk'}
                    </h2>
                    <p className="dp-description">{filteredSkus.length} SKUs below safety stock levels</p>
                  </div>
                </div>

                {panelSubView.parentTitle && (
                  <div className="dp-subview-context">
                    <WarningAmberOutlined sx={{ fontSize: 12 }}/>
                    <span>{panelSubView.parentTitle}</span>
                  </div>
                )}

                <div className="dp-section">
                  <div className="dp-sku-controls">
                    <span className="dp-sku-selected-count">
                      {selectedSkus.filter(sk => filteredSkus.some(f => f.sku === sk)).length} of {filteredSkus.length} selected
                    </span>
                    <button
                      className="dp-select-all-btn"
                      onClick={() => {
                        if (allFilteredSelected) {
                          setSelectedSkus(prev => prev.filter(sk => !filteredSkus.some(f => f.sku === sk)));
                        } else {
                          setSelectedSkus(prev => [...new Set([...prev, ...filteredSkus.map(s => s.sku)])]);
                        }
                      }}
                    >
                      {allFilteredSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="dp-sku-list">
                    {panelSubView.storeFilter ? (
                      /* Single store — flat list, no grouping needed */
                      filteredSkus.map((sku) => (
                        <div
                          key={sku.sku}
                          className={`dp-sku-card ${sku.currentStock < sku.safetyStock * 0.3 ? 'stock-critical' : ''} ${selectedSkus.includes(sku.sku) ? 'selected' : ''}`}
                          onClick={() => {
                            if (selectedSkus.includes(sku.sku)) {
                              setSelectedSkus(prev => prev.filter(s => s !== sku.sku));
                            } else {
                              setSelectedSkus(prev => [...prev, sku.sku]);
                            }
                          }}
                        >
                          <div className="dp-sku-checkbox">
                            <div className={`dp-sku-check ${selectedSkus.includes(sku.sku) ? 'checked' : ''}`}>
                              {selectedSkus.includes(sku.sku) && <Check sx={{ fontSize: 10 }}/>}
                            </div>
                          </div>
                          <div className="dp-sku-info">
                            <div className="dp-sku-top">
                              <span className="dp-sku-id">{sku.sku}</span>
                              <span className={`dp-sku-stock ${sku.currentStock < sku.safetyStock * 0.3 ? 'critical' : 'warning'}`}>
                                {sku.currentStock}/{sku.safetyStock}
                              </span>
                            </div>
                            <span className="dp-sku-name">{sku.name}</span>
                            <div className="dp-sku-meta">
                              <span>Reorder: {sku.reorderQty}</span>
                              <span>·</span>
                              <span>{sku.supplier}</span>
                              <span>·</span>
                              <span>{sku.leadTime}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* All stores — grouped by store */
                      Object.entries(
                        filteredSkus.reduce<Record<string, typeof atRiskSkus>>((groups, sku) => {
                          const key = sku.store;
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(sku);
                          return groups;
                        }, {})
                      ).map(([storeName, storeSkus]) => (
                        <div key={storeName} className="dp-sku-store-group">
                          <div className="dp-sku-store-header">
                            <StoreOutlined sx={{ fontSize: 12 }}/>
                            <span>{storeName}</span>
                            <span className="dp-sku-store-count">{storeSkus.length} SKUs</span>
                          </div>
                          {storeSkus.map((sku) => (
                            <div
                              key={sku.sku}
                              className={`dp-sku-card ${sku.currentStock < sku.safetyStock * 0.3 ? 'stock-critical' : ''} ${selectedSkus.includes(sku.sku) ? 'selected' : ''}`}
                              onClick={() => {
                                if (selectedSkus.includes(sku.sku)) {
                                  setSelectedSkus(prev => prev.filter(s => s !== sku.sku));
                                } else {
                                  setSelectedSkus(prev => [...prev, sku.sku]);
                                }
                              }}
                            >
                              <div className="dp-sku-checkbox">
                                <div className={`dp-sku-check ${selectedSkus.includes(sku.sku) ? 'checked' : ''}`}>
                                  {selectedSkus.includes(sku.sku) && <Check sx={{ fontSize: 10 }}/>}
                                </div>
                              </div>
                              <div className="dp-sku-info">
                                <div className="dp-sku-top">
                                  <span className="dp-sku-id">{sku.sku}</span>
                                  <span className={`dp-sku-stock ${sku.currentStock < sku.safetyStock * 0.3 ? 'critical' : 'warning'}`}>
                                    {sku.currentStock}/{sku.safetyStock}
                                  </span>
                                </div>
                                <span className="dp-sku-name">{sku.name}</span>
                                <div className="dp-sku-meta">
                                  <span>Reorder: {sku.reorderQty}</span>
                                  <span>·</span>
                                  <span>{sku.supplier}</span>
                                  <span>·</span>
                                  <span>{sku.leadTime}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="dp-actions">
                  <button className="dp-action-btn outlined" onClick={() => {
                    showToast('Report downloaded');
                  }}>
                    <FileDownloadOutlined sx={{ fontSize: 15 }}/>
                    <span>Export</span>
                  </button>
                  <button
                    className="dp-action-btn filled"
                    disabled={selectedSkus.filter(sk => filteredSkus.some(f => f.sku === sk)).length === 0}
                    onClick={() => {
                      if (selectedSkus.length === atRiskSkus.length) {
                        handleReorderAll();
                      } else {
                        handleSendReorderAction();
                      }
                      goBackToPanel();
                    }}
                  >
                    <SendOutlined sx={{ fontSize: 15 }}/>
                    <span>
                      {selectedSkus.filter(sk => filteredSkus.some(f => f.sku === sk)).length === 0
                        ? 'Select SKUs'
                        : `Reorder (${selectedSkus.filter(sk => filteredSkus.some(f => f.sku === sk)).length})`}
                    </span>
                  </button>
                </div>
              </div>
              );
            })()}

            {/* ===== MAIN VIEW: Alert Details ===== */}
            {detailPanel.type === 'alert' && !panelSubView && (
              <div className="detail-panel-body">
                {/* Severity Badge */}
                <div className="dp-severity-row">
                  <span className={`dp-severity-badge ${detailPanel.data.severity}`}>
                    <WarningAmberOutlined sx={{ fontSize: 12 }}/>
                    {detailPanel.data.severity === 'critical' ? 'CRITICAL' : detailPanel.data.severity === 'warning' ? 'WARNING' : 'RISK'}
                  </span>
                  {detailPanel.data.source && (
                    <span className="dp-source">
                      <GroupOutlined sx={{ fontSize: 11 }}/>
                      {detailPanel.data.source}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="dp-title">{detailPanel.data.title}</h2>
                <p className="dp-description">{detailPanel.data.description}</p>

                {/* Impact Summary */}
                <div className="dp-impact-summary">
                  <ErrorOutlined sx={{ fontSize: 14 }}/>
                  <span>{detailPanel.data.impactSummary}</span>
                </div>

                {/* Impacted Stores List */}
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <StoreOutlined sx={{ fontSize: 14 }}/>
                    Impacted Stores ({detailPanel.data.stores.length})
                  </h3>
                  <div className="dp-stores-list">
                    {detailPanel.data.stores.map((store) => (
                      <div key={store.id} className={`dp-store-card ${store.status}`}>
                        <div className="dp-store-header">
                          <span className="dp-store-name">{store.name}</span>
                          <span className={`dp-store-status ${store.status}`}>
                            {store.status === 'critical' ? 'Critical' : store.status === 'warning' ? 'At Risk' : 'Monitor'}
                          </span>
                        </div>
                        <p className="dp-store-detail">
                          {store.detail}
                          {store.manager && <> · Manager: {store.manager}</>}
                        </p>
                        <div className="dp-store-actions">
                          <button className="dp-store-link" onClick={() => {
                            closeDetailPanel();
                            navigate(`/store-operations/store-deep-dive?store=${store.id}`);
                          }}>
                            View Store <OpenInNewOutlined sx={{ fontSize: 11 }}/>
                          </button>
                          {detailPanel.data.id === 'alert-inventory' && (
                            <button className="dp-store-sku-btn" onClick={() => {
                              setSelectedSkus([]);
                              setPanelSubView({ view: 'review-skus', parentTitle: detailPanel.data.title, storeFilter: store.name });
                            }}>
                              View Impacted SKUs <KeyboardArrowRight sx={{ fontSize: 12 }}/>
                            </button>
                          )}
                          {store.manager && (
                            <button className="dp-store-assign-btn" onClick={() => {
                              showToast(`✓ Added to Operations Queue — assigned to ${store.manager} (${store.name})`);
                            }}>
                              <PersonAddAlt1Outlined sx={{ fontSize: 11 }}/>
                              Assign to Manager
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="dp-actions">
                  {detailPanel.data.ctas.map((cta, idx) => (
                    <button
                      key={idx}
                      className={`dp-action-btn ${cta.kind === 'navigate' ? 'outlined navigate' : 'outlined'}`}
                      onClick={() => handlePanelAction(cta.action)}
                    >
                      <span>{cta.label}</span>
                      {cta.kind === 'navigate' ? <OpenInNewOutlined sx={{ fontSize: 14 }}/> : <KeyboardArrowRight sx={{ fontSize: 15 }}/>}
                    </button>
                  ))}
                </div>

                {/* Timestamp */}
                {detailPanel.data.timestamp && (
                  <div className="dp-timestamp">
                    <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                    <span>{formatTimeAgo(detailPanel.data.timestamp)}</span>
                  </div>
                )}
              </div>
            )}

            {/* ===== MAIN VIEW: Broadcast Details ===== */}
            {detailPanel.type === 'broadcast' && !panelSubView && (
              <div className="detail-panel-body">
                {/* Priority + Category Badges */}
                <div className="dp-severity-row">
                  <span className={`dp-priority-badge ${getPriorityColor(detailPanel.data.priority as Priority)}`}>
                    {detailPanel.data.priority}
                  </span>
                  <span className="dp-category-badge">{detailPanel.data.category}</span>
                </div>

                {/* Title */}
                <h2 className="dp-title">{detailPanel.data.title}</h2>

                {/* Full Message */}
                <div className="dp-broadcast-message">
                  {detailPanel.data.fullMessage.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Scope */}
                {detailPanel.data.scope && (
                  <div className="dp-scope-row">
                    <GroupOutlined sx={{ fontSize: 13 }}/>
                    <span>{detailPanel.data.scope}</span>
                  </div>
                )}

                {/* Key Dates */}
                {detailPanel.data.keyDates.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <CalendarTodayOutlined sx={{ fontSize: 14 }}/>
                      Key Dates
                    </h3>
                    <div className="dp-key-dates">
                      {detailPanel.data.keyDates.map((kd, i) => (
                        <div key={i} className="dp-key-date-item">
                          <span className="dp-kd-label">{kd.label}</span>
                          <span className="dp-kd-date">{kd.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {detailPanel.data.actionItems.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <TaskAltOutlined sx={{ fontSize: 14 }}/>
                      Required Actions ({detailPanel.data.actionItems.length})
                    </h3>
                    <div className="dp-action-checklist">
                      {detailPanel.data.actionItems.map((ai, i) => (
                        <div key={i} className={`dp-checklist-item ${ai.done ? 'done' : ''}`}>
                          <div className="dp-checklist-check">
                            {ai.done ? <TaskAltOutlined sx={{ fontSize: 14 }}/> : <div className="dp-checklist-empty" />}
                          </div>
                          <span>{ai.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {detailPanel.data.attachments.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <DescriptionOutlined sx={{ fontSize: 14 }}/>
                      Attachments ({detailPanel.data.attachments.length})
                    </h3>
                    <div className="dp-attachments">
                      {detailPanel.data.attachments.map((att, i) => (
                        <div key={i} className="dp-attachment-item">
                          <div className={`dp-attachment-icon ${att.type}`}>
                            {att.type === 'pdf' ? <DescriptionOutlined sx={{ fontSize: 14 }}/> : <VisibilityOutlined sx={{ fontSize: 14 }}/>}
                          </div>
                          <span className="dp-attachment-name">{att.name}</span>
                          <button className="dp-attachment-download">
                            <ArrowForwardOutlined sx={{ fontSize: 12 }}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Info */}
                <div className="dp-section">
                  <h3 className="dp-section-title">Source</h3>
                  <div className="dp-broadcast-source">
                    <div className="dp-source-avatar">
                      {detailPanel.data.sender.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className="dp-source-info">
                      <span className="dp-source-name">{detailPanel.data.sender}</span>
                      <span className="dp-source-role">{detailPanel.data.senderRole}</span>
                    </div>
                    <span className="dp-source-time">
                      <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                      {formatTimeAgo(detailPanel.data.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="dp-actions">
                  <button className="dp-action-btn outlined navigate" onClick={() => { closeDetailPanel(); handleOpenChat('1'); }}>
                    <span>Chat</span>
                    <OpenInNewOutlined sx={{ fontSize: 14 }}/>
                  </button>
                  {detailPanel.data.requiresAcknowledgement && !detailPanel.data.isAcknowledged ? (
                    <button className="dp-action-btn outlined" onClick={() => {
                      setBroadcasts(prev => prev.map(b => b.id === detailPanel.data.id ? { ...b, isAcknowledged: true } : b));
                      showToast('Broadcast acknowledged');
                      closeDetailPanel();
                    }}>
                      <span>Acknowledge</span>
                      <KeyboardArrowRight sx={{ fontSize: 15 }}/>
                    </button>
                  ) : (
                    <button className="dp-action-btn outlined" onClick={() => {
                      setBroadcasts(prev => prev.map(b => b.id === detailPanel.data.id ? { ...b, isRead: true } : b));
                      showToast('Marked as read');
                      closeDetailPanel();
                    }}>
                      <span>Mark as Read</span>
                      <KeyboardArrowRight sx={{ fontSize: 15 }}/>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ===== MAIN VIEW: Action Details ===== */}
            {detailPanel.type === 'action' && !panelSubView && (() => {
              const action = detailPanel.data;
              return (
              <div className="detail-panel-body">
                {/* Impact / description context */}
                {action.impact && (
                  <div className="dp-title-block">
                    <p className="dp-description">{action.impact}</p>
                  </div>
                )}

                {/* Impact Summary */}
                <div className="dp-impact-summary">
                  <ErrorOutlined sx={{ fontSize: 14 }}/>
                  <span>
                    {action.context}
                    {action.microContext && <> · {action.microContext}</>}
                    {action.status === 'overdue' && <> · <strong style={{color: 'var(--ia-color-error-strong)'}}>Overdue</strong></>}
                  </span>
                </div>

                {/* === Planogram Action: Show image + action list === */}
                {action.source_module === 'Planogram' && action.planogramActions && (
                  <div className="dp-section">
                    {action.planogramImage && (
                      <div className="dp-planogram-preview">
                        <img src={action.planogramImage} alt="Planogram" className="dp-planogram-img" />
                      </div>
                    )}
                    <h3 className="dp-section-title">
                      <AssignmentTurnedInOutlined sx={{ fontSize: 14 }}/>
                      Planogram Actions ({action.planogramActions.length})
                    </h3>
                    <div className="dp-stores-list">
                      {action.planogramActions.map((pa) => (
                        <div key={pa.id} className={`dp-store-card ${pa.priority === 'high' ? 'critical' : pa.priority === 'medium' ? 'warning' : 'info'}`}>
                          <div className="dp-store-header">
                            <span className="dp-store-name">{pa.section}</span>
                            <span className={`dp-store-status ${pa.priority === 'high' ? 'critical' : pa.priority === 'medium' ? 'warning' : 'info'}`}>
                              {pa.priority}
                            </span>
                          </div>
                          <p className="dp-store-detail">{pa.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* === Checklist Action (DM Supervisor View): Read-only items + store completion === */}
                {action.source_module === 'Compliance' && action.checklistItems && (() => {
                  const categories = [...new Set(action.checklistItems.map(cl => cl.category))];
                  return (
                  <div className="dp-section">
                    {/* Store completion summary */}
                    <div className="dp-esc-meta" style={{ marginBottom: '12px' }}>
                      <span className="dp-esc-meta-item">
                        <GroupOutlined sx={{ fontSize: 10 }}/>
                        Assigned: James Wilson
                      </span>
                      <span className="dp-esc-meta-item progress">In Progress</span>
                      <span className="dp-esc-meta-item sla">
                        <AccessTimeOutlined sx={{ fontSize: 10 }}/>
                        Due in 23h
                      </span>
                    </div>

                    <div className="dp-impact-summary" style={{ background: 'var(--ia-color-warning-bg)', borderColor: 'var(--ia-color-warning-bg)' }}>
                      <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                      <span>5 of 8 stores completed · <strong>3 stores pending</strong> · 2 overdue</span>
                    </div>

                    <h3 className="dp-section-title">
                      <AssignmentTurnedInOutlined sx={{ fontSize: 14 }}/>
                      Checklist Items ({action.checklistItems.length}) — <span style={{ fontWeight: 'var(--ia-font-weight-regular)', color: 'var(--ia-color-text-tertiary)', fontSize: 'var(--ia-text-2xs)' }}>Read-only for DM</span>
                    </h3>

                    {/* Group by category — selectable */}
                    <div className="dp-stores-list">
                      {categories.map(cat => {
                        const items = action.checklistItems!.filter(cl => cl.category === cat);
                        const isCritical = cat === 'Fire Safety' || cat === 'Emergency';
                        const isSelected = selectedChecklistCategories.includes(cat);
                        return (
                          <div
                            key={cat}
                            className={`dp-store-card ${isSelected ? 'selected' : ''} ${isCritical ? 'critical' : 'warning'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedChecklistCategories(prev =>
                                prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                              );
                            }}
                          >
                            <div className="dp-store-header">
                              <span className="dp-store-name">{cat}</span>
                              <span className={`dp-store-status ${isCritical ? 'critical' : 'warning'}`}>
                                {items.length} items
                              </span>
                            </div>
                            {items.map(cl => (
                              <p key={cl.id} className="dp-store-detail" style={{ marginBottom: '2px', paddingLeft: '8px', borderLeft: '2px solid #e2e8f0' }}>
                                {cl.item}
                              </p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })()}

                {/* === Shipment Action (DM Exception Review): Exceptions first, complete de-emphasized === */}
                {action.source_module === 'Receiving' && action.shipmentDetails && action.shipmentItems && (() => {
                  const exceptions = action.shipmentItems.filter(si => si.status !== 'complete');
                  const completed = action.shipmentItems.filter(si => si.status === 'complete');
                  return (
                  <div className="dp-section">
                    <div className="dp-impact-summary" style={{ background: 'var(--ia-color-success-bg)', borderColor: 'var(--ia-color-success-soft)' }}>
                      <InventoryOutlined sx={{ fontSize: 14 }}/>
                      <span>
                        {action.shipmentDetails.carrier} · PO {action.shipmentDetails.poNumber} · {action.shipmentDetails.totalItems} items · ${action.shipmentDetails.totalValue.toLocaleString()}
                      </span>
                    </div>

                    {/* Exceptions — highlighted */}
                    {exceptions.length > 0 && (
                      <>
                        <h3 className="dp-section-title">
                          <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                          Exceptions Requiring Review ({exceptions.length})
                        </h3>
                        <div className="dp-stores-list">
                          {exceptions.map((si) => (
                            <div key={si.id} className={`dp-store-card ${si.status === 'short' ? 'critical' : 'warning'}`} style={{ cursor: 'default' }}>
                              <div className="dp-store-header">
                                <span className="dp-store-name">{si.name}</span>
                                <span className={`dp-store-status ${si.status === 'short' ? 'critical' : 'warning'}`}>
                                  {si.status === 'short' ? `SHORT ${si.variance}` : `OVER +${si.variance}`}
                                </span>
                              </div>
                              <p className="dp-store-detail">
                                {si.sku} · Ordered: {si.ordered} · Received: {si.received}
                              </p>
                              <div className="dp-store-actions">
                                <button className="dp-store-assign-btn" onClick={() => {
                                  showToast(`Issue assigned to operations — ${si.name} (${si.status === 'short' ? 'shortage' : 'overage'})`);
                                }}>
                                  <PersonAddAlt1Outlined sx={{ fontSize: 11 }}/>
                                  Assign to Operations
                                </button>
                                <button className="dp-store-link" style={{ color: 'var(--ia-color-error-strong)' }} onClick={() => {
                                  showToast(`Escalated: ${si.name} — ${si.status === 'short' ? `${Math.abs(si.variance || 0)} units short` : `${si.variance} units over`}`);
                                }}>
                                  Escalate <OpenInNewOutlined sx={{ fontSize: 11 }}/>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Completed items — de-emphasized */}
                    {completed.length > 0 && (
                      <>
                        <h3 className="dp-section-title" style={{ color: 'var(--ia-color-text-tertiary)' }}>
                          <Check sx={{ fontSize: 14 }}/>
                          Verified Items ({completed.length}) — No Action Needed
                        </h3>
                        <div className="dp-stores-list">
                          {completed.map((si) => (
                            <div key={si.id} className="dp-store-card info" style={{ cursor: 'default', opacity: 0.7 }}>
                              <div className="dp-store-header">
                                <span className="dp-store-name">{si.name}</span>
                                <span className="dp-store-status info">Complete</span>
                              </div>
                              <p className="dp-store-detail">{si.sku} · Ordered: {si.ordered} · Received: {si.received}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  );
                })()}

                {/* === VoC Action: Show escalations (DM role-based) === */}
                {action.source_module === 'Customer' && action.escalations && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <ChatBubbleOutlineOutlined sx={{ fontSize: 14 }}/>
                      Escalations ({action.escalations.length})
                    </h3>
                    <div className="dp-stores-list">
                      {action.escalations.map((esc) => {
                        const isOverdue = esc.slaDue ? new Date(esc.slaDue) < new Date() : false;
                        const needsDMAttention = isOverdue || esc.escalationSeverity === 'high' || esc.isRepeated;
                        return (
                        <div key={esc.id} className="dp-esc-card-premium">
                          {needsDMAttention && (
                            <div className="dp-esc-attention">
                              <WarningAmberOutlined sx={{ fontSize: 11 }}/>
                              <span>Needs DM Attention</span>
                              {isOverdue && <span className="dp-esc-overdue">SLA Overdue</span>}
                              {esc.isRepeated && <span className="dp-esc-repeated">Repeated</span>}
                            </div>
                          )}
                          <div className="dp-esc-card-header">
                            <span className="dp-esc-card-name">{esc.customerName}</span>
                            <span className="dp-esc-card-stars">
                              {'★'.repeat(esc.rating)}{'☆'.repeat(5 - esc.rating)}
                            </span>
                          </div>
                          <p className="dp-esc-card-summary">{esc.summary}</p>
                          <div className="dp-esc-meta">
                            <span className="dp-esc-meta-item">
                              <GroupOutlined sx={{ fontSize: 10 }}/>
                              {esc.storeManager || 'Unassigned'}
                            </span>
                            <span className={`dp-esc-meta-item ${esc.status === 'pending' ? 'pending' : esc.status === 'in_progress' ? 'progress' : 'resolved'}`}>
                              {esc.status === 'pending' ? 'Pending' : esc.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                            </span>
                            <span className={`dp-esc-meta-item ${isOverdue ? 'overdue' : 'sla'}`}>
                              <AccessTimeOutlined sx={{ fontSize: 10 }}/>
                              {esc.slaDue ? (isOverdue ? `Overdue ${formatTimeAgo(esc.slaDue)}` : `Due ${formatTimeAgo(esc.slaDue)}`) : 'No SLA'}
                            </span>
                          </div>
                          <div className="dp-esc-card-actions">
                            <button className="dp-esc-action-primary" onClick={() => {
                              showToast(`✓ Assigned to ${esc.storeManager || 'Store Manager'} — ${esc.customerName}`);
                            }}>
                              <PersonAddAlt1Outlined sx={{ fontSize: 11 }}/>
                              Assign to {esc.storeManager?.split(' ')[0] || 'Manager'}
                            </button>
                            <button className="dp-esc-action-secondary" onClick={() => {
                              setSelectedEscalation(esc);
                              setEscalationResponse('');
                              setPanelSubView({ view: 'escalation-respond', parentTitle: action.title, escalationId: esc.id });
                            }}>
                              Review Details <KeyboardArrowRight sx={{ fontSize: 12 }}/>
                            </button>
                            {needsDMAttention && (
                              <button className="dp-esc-action-escalate" onClick={() => {
                                showToast(`Escalation intervened — ${esc.customerName} case flagged to regional`);
                              }}>
                                Escalate <OpenInNewOutlined sx={{ fontSize: 11 }}/>
                              </button>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action CTAs */}
                <div className="dp-actions">
                  {action.source_module === 'Planogram' && (
                    <>
                      <button className="dp-action-btn outlined" onClick={() => {
                        setArchivedActions(prev => [...prev, { id: action.id, title: action.title, completedAt: new Date(), type: 'rejected' }]);
                        setActionItems(prev => prev.filter(a => a.id !== action.id));
                        showToast(`Planogram reset sent back for revision`);
                        closeDetailPanel();
                      }}>
                        <CloseOutlined sx={{ fontSize: 14 }}/>
                        <span>Send Back</span>
                      </button>
                      <button className="dp-action-btn filled" onClick={() => {
                        setArchivedActions(prev => [...prev, { id: action.id, title: action.title, completedAt: new Date(), type: 'approved' }]);
                        setActionItems(prev => prev.filter(a => a.id !== action.id));
                        showToast(`✓ ${action.title} approved — stores notified`);
                        closeDetailPanel();
                      }}>
                        <Check sx={{ fontSize: 14 }}/>
                        <span>Approve Now</span>
                      </button>
                    </>
                  )}
                  {action.source_module === 'Compliance' && (
                    <>
                      <button
                        className="dp-action-btn filled"
                        disabled={selectedChecklistCategories.length === 0}
                        onClick={() => {
                          showToast(`✓ Follow-up sent for ${selectedChecklistCategories.length} area(s) — safety checklist reminder`);
                          setSelectedChecklistCategories([]);
                        }}
                      >
                        <SendOutlined sx={{ fontSize: 14 }}/>
                        <span>Follow Up{selectedChecklistCategories.length > 0 ? ` (${selectedChecklistCategories.length})` : ''}</span>
                      </button>
                      <button
                        className="dp-action-btn outlined"
                        disabled={selectedChecklistCategories.length === 0}
                        onClick={() => {
                          setSelectedAssignee(null);
                          setAssignSearchQuery('');
                          setPanelSubView({ view: 'assign-task', parentTitle: `${selectedChecklistCategories.join(', ')} — ${action.title}` });
                        }}
                      >
                        <PersonAddAlt1Outlined sx={{ fontSize: 14 }}/>
                        <span>Assign / Reassign</span>
                      </button>
                    </>
                  )}
                  {action.source_module === 'Receiving' && (
                    <>
                      <button className="dp-action-btn filled" onClick={() => {
                        setArchivedActions(prev => [...prev, { id: action.id, title: action.title, completedAt: new Date(), type: 'approved' }]);
                        setActionItems(prev => prev.filter(a => a.id !== action.id));
                        showToast(`✓ Shipment ${action.shipmentDetails?.shipmentId} acknowledged — exceptions flagged`);
                        closeDetailPanel();
                      }}>
                        <Check sx={{ fontSize: 14 }}/>
                        <span>Acknowledge Receipt</span>
                      </button>
                      <button className="dp-action-btn outlined" onClick={() => {
                        showToast(`✓ Shipment exceptions assigned to Store Manager (${action.context})`);
                      }}>
                        <PersonAddAlt1Outlined sx={{ fontSize: 14 }}/>
                        <span>Assign to Store Manager</span>
                      </button>
                    </>
                  )}
                  {action.source_module === 'Customer' && (
                    <button className="dp-action-btn filled" onClick={() => {
                      setArchivedActions(prev => [...prev, { id: action.id, title: action.title, completedAt: new Date(), type: 'approved' }]);
                      setActionItems(prev => prev.filter(a => a.id !== action.id));
                      showToast(`✓ VoC escalations reviewed and assigned`);
                      closeDetailPanel();
                    }}>
                      <Check sx={{ fontSize: 14 }}/>
                      <span>Mark All Reviewed</span>
                    </button>
                  )}
                </div>

                {/* Timestamp */}
                <div className="dp-timestamp">
                  <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                  <span>{action.status === 'overdue' ? `${formatTimeAgo(action.due_time)} overdue` : `Due ${formatTimeAgo(action.due_time)}`}</span>
                </div>
              </div>
              );
            })()}

            {/* ===== SUB-VIEW: Escalation Respond ===== */}
            {panelSubView?.view === 'escalation-respond' && selectedEscalation && (
              <div className="detail-panel-body">
                <div className="dp-subview-header">
                  <ChatBubbleOutlineOutlined sx={{ fontSize: 20 }} className="dp-subview-icon"/>
                  <div>
                    <h2 className="dp-title">Respond to {selectedEscalation.customerName}</h2>
                    <p className="dp-description">{selectedEscalation.category} · Rating: {'★'.repeat(selectedEscalation.rating)}{'☆'.repeat(5 - selectedEscalation.rating)}</p>
                  </div>
                </div>

                <div className="dp-subview-context">
                  <WarningAmberOutlined sx={{ fontSize: 12 }}/>
                  <span>{selectedEscalation.summary}</span>
                </div>

                <div className="dp-section">
                  <div className="dp-store-card warning" style={{ cursor: 'default' }}>
                    <p className="dp-store-detail" style={{ margin: 0, fontSize: 'var(--ia-text-xs)', lineHeight: '1.6', color: 'var(--ia-color-text-primary)' }}>
                      "{selectedEscalation.details}"
                    </p>
                  </div>
                </div>

                <div className="dp-section">
                  <h3 className="dp-section-title">Your Response</h3>
                  <textarea
                    className="dp-assign-search"
                    placeholder="Type your response to the customer..."
                    value={escalationResponse}
                    onChange={(e) => setEscalationResponse(e.target.value)}
                    style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'var(--ia-font-sans)', padding: '10px 12px' }}
                  />
                </div>

                <div className="dp-actions">
                  <button className="dp-action-btn outlined" onClick={goBackToPanel}>
                    <span>Cancel</span>
                  </button>
                  <button
                    className="dp-action-btn filled"
                    disabled={!escalationResponse.trim()}
                    onClick={() => {
                      showToast(`✓ Response sent to ${selectedEscalation.customerName}`);
                      goBackToPanel();
                    }}
                  >
                    <SendOutlined sx={{ fontSize: 15 }}/>
                    <span>Send Response</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default StoreOpsHome;

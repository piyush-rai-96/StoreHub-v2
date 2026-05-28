import React, { useState, useEffect } from 'react';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import Remove from '@mui/icons-material/Remove';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
// NotificationsOutlined removed — no longer used in brief
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import ChatOutlined from '@mui/icons-material/ChatOutlined';
import Check from '@mui/icons-material/Check';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import DirectionsWalkOutlined from '@mui/icons-material/DirectionsWalkOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import CompareArrowsOutlined from '@mui/icons-material/CompareArrowsOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import SyncOutlined from '@mui/icons-material/SyncOutlined';
import GridOnOutlined from '@mui/icons-material/GridOnOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import { Button, Card } from 'impact-ui';
import { ImFilterSelect } from '../components/common/ImFilterSelect';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AudioPlayer } from '../components/common/AudioPlayer';
import '../components/common/AudioPlayer.css';
import { openAskAlan } from '../utils/openAskAlan';
// Reuse DM Home styles to mirror the same layout/components on HQ Home
import './StoreOpsHome.css';
import './HQHome.css';
// Reuse Broadcast Analytics + Create Broadcast Wizard styles from District Intelligence
import './DistrictIntelligence.css';

// ─── Types ───
interface DistrictRow {
  id: string;
  name: string;
  dpi: number;
  compliance: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  trend: 'up' | 'down' | 'flat';
  dm: string;
  dmEmail: string;
}

interface BroadcastItem {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'info';
  category: string;
  sender: string;
  timeSent: string;
  isRead: boolean;
}

// ─── Mock Data ───
const MOCK_DISTRICTS: DistrictRow[] = [
  { id: 'd14', name: 'District 14 — Tennessee', dpi: 87, compliance: 96, riskLevel: 'low', trend: 'up', dm: 'John Doe', dmEmail: 'john.doe.dm@impactanalytics.co' },
  { id: 'd19', name: 'District 19 — Alabama', dpi: 88, compliance: 94, riskLevel: 'low', trend: 'up', dm: 'David Park', dmEmail: 'david.park@impactanalytics.co' },
  { id: 'd08', name: 'District 08 — Georgia', dpi: 84, compliance: 87, riskLevel: 'low', trend: 'up', dm: 'Sarah Kim', dmEmail: 'sarah.kim@impactanalytics.co' },
  { id: 'd22', name: 'District 22 — Carolina', dpi: 82, compliance: 83, riskLevel: 'medium', trend: 'down', dm: 'Marcus Reed', dmEmail: 'marcus.reed@impactanalytics.co' },
  { id: 'd11', name: 'District 11 — Florida', dpi: 79, compliance: 78, riskLevel: 'medium', trend: 'down', dm: 'Lisa Nguyen', dmEmail: 'lisa.nguyen@impactanalytics.co' },
];

// HQ Broadcast tracking — overview KPIs + effectiveness list of HQ broadcasts to track
interface HQBroadcastTrackRow {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  ackRate: number;
  avgAckTime: string;
  status: 'good' | 'at-risk';
  type: 'Action Required' | 'Informational';
  sentAt: string;
  districts: number;
  ackedDistricts: number;
}
const HQ_BROADCAST_OVERVIEW = {
  active: 4,
  sentThisWeek: 9,
  ackPct: 76,
  avgAckTime: '3h 22m',
  trendVsLast: -5,
};
interface HQDistrictComplianceRow { district: string; districtId: string; ackRate: number; avgTime: string; tier: 'top' | 'at-risk' | 'defaulter'; missedCount: number }
interface HQBroadcastInsight { pattern: string; recommendation: string }
// Network-level district compliance baseline (sorted high → low ack rate)
const HQ_DISTRICT_COMPLIANCE_BASE: HQDistrictComplianceRow[] = [
  { district: 'District 14 — Tennessee', districtId: 'd14', ackRate: 98, avgTime: '52m',    tier: 'top',        missedCount: 0 },
  { district: 'District 19 — Alabama',   districtId: 'd19', ackRate: 96, avgTime: '58m',    tier: 'top',        missedCount: 0 },
  { district: 'District 08 — Georgia',   districtId: 'd08', ackRate: 92, avgTime: '1h 18m', tier: 'top',        missedCount: 1 },
  { district: 'District 22 — Carolina',  districtId: 'd22', ackRate: 72, avgTime: '3h 45m', tier: 'at-risk',    missedCount: 4 },
  { district: 'District 11 — Florida',   districtId: 'd11', ackRate: 60, avgTime: '5h 20m', tier: 'defaulter',  missedCount: 6 },
];
const HQ_BROADCAST_INSIGHTS: HQBroadcastInsight[] = [
  { pattern: 'Action Required broadcasts (signage kits, floorset shifts, test store compliance) achieve 94%+ ack within 2h network-wide — significantly faster than informational sends (avg 4h 50m).', recommendation: 'Continue tagging time-sensitive merchandising and transfer broadcasts as "Action Required" to drive urgency and reduce compliance gaps.' },
  { pattern: 'Districts 11 and 22 are repeat late-ackowledgers — combined 9 delayed acknowledgements over the last 14 days, correlating with lower floorset compliance scores.', recommendation: 'Schedule a focused review with DMs of Districts 11 and 22 before the Summer 2 floorset; link ack-rate to district execution scorecard.' },
];

// HQ Alert right-side detail panel data shape (mirrors AlertPanelData on DM Home)
interface HQAlertEntity { id: string; name: string; status: 'critical' | 'warning' | 'info'; detail: string; manager?: string }
interface HQAlertCTA { label: string; action: 'district-intel' | 'ai-copilot' | 'communications' | 'message-dm' | 'share-best-practice' | 'scroll-bca' | 'send-reminder' }
interface HQAlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'risk' | 'success';
  signalLabel: string;
  title: string;
  description: string;
  impactSummary: string;
  source: string;
  timestamp: string;
  entityLabel: 'Districts' | 'Stores';
  entities: HQAlertEntity[];
  ctas: HQAlertCTA[];
}

const HQ_BROADCAST_EFFECTIVENESS: HQBroadcastTrackRow[] = [
  { id: 'hb1', name: 'Semi-Annual Sale — Signage Kit Confirmation', priority: 'high', ackRate: 72, avgAckTime: '2h 10m', status: 'at-risk', type: 'Action Required', sentAt: '30m ago', districts: 5, ackedDistricts: 4 },
  { id: 'hb2', name: 'Summer 2 Floorset — Overnight Shift Scheduling', priority: 'high', ackRate: 60, avgAckTime: '3h 45m', status: 'at-risk', type: 'Action Required', sentAt: '2h ago', districts: 5, ackedDistricts: 3 },
  { id: 'hb3', name: 'Test Store — Early Set Compliance Deadline 6.7', priority: 'high', ackRate: 100, avgAckTime: '1h 05m', status: 'good', type: 'Action Required', sentAt: '4h ago', districts: 5, ackedDistricts: 5 },
  { id: 'hb4', name: 'Store-to-Store Transfers — This Week\'s Labor Schedule', priority: 'medium', ackRate: 80, avgAckTime: '2h 50m', status: 'good', type: 'Action Required', sentAt: '6h ago', districts: 5, ackedDistricts: 4 },
  { id: 'hb5', name: 'SS26 Planogram Guidelines Rollout', priority: 'medium', ackRate: 80, avgAckTime: '3h 20m', status: 'good', type: 'Informational', sentAt: '2d ago', districts: 5, ackedDistricts: 4 },
  { id: 'hb6', name: 'Visual Merch Standards Update — Summer Windows', priority: 'medium', ackRate: 60, avgAckTime: '5h 05m', status: 'at-risk', type: 'Action Required', sentAt: '3d ago', districts: 5, ackedDistricts: 3 },
  { id: 'hb7', name: 'Monthly Network Performance Recap', priority: 'low', ackRate: 100, avgAckTime: '1h 30m', status: 'good', type: 'Informational', sentAt: '5d ago', districts: 5, ackedDistricts: 5 },
  { id: 'hb8', name: 'New Training Module — Seasonal Execution', priority: 'low', ackRate: 100, avgAckTime: '2h 15m', status: 'good', type: 'Informational', sentAt: '6d ago', districts: 5, ackedDistricts: 5 },
  { id: 'hb9', name: 'Q2 Compliance Reporting Deadline', priority: 'medium', ackRate: 100, avgAckTime: '1h 10m', status: 'good', type: 'Action Required', sentAt: '7d ago', districts: 5, ackedDistricts: 5 },
];

const MOCK_BROADCASTS: BroadcastItem[] = [
  { id: 'b1', title: 'Semi-Annual Sale — Signage Kit Confirmation', description: 'Reminder: "Semi Annual Sale" sets Friday Open Business. Please confirm you have received in-store signage kits for Windows, Marquee, and sign toppers.', type: 'critical', category: 'Marketing', sender: 'Marketing Calendar', timeSent: '30m ago', isRead: false },
  { id: 'b2', title: 'Summer 2 Floorset — Overnight Shift Scheduling', description: 'Reminder: Summer 2 floorset sets next Thursday overnight. Have you scheduled the overnight shifts required to complete the set?', type: 'critical', category: 'Visual Merchandising', sender: 'VM Planning', timeSent: '2h ago', isRead: false },
  { id: 'b3', title: 'Test Store — Early Set Compliance by 6.7.2026', description: 'Your store has been selected for an upcoming early set test. Your info packet (linked) includes items, pricing, and visual merchandising requirements. Please complete the set and confirm compliance by June 7, 2026.', type: 'critical', category: 'Operations', sender: 'HQ Merchandising', timeSent: '4h ago', isRead: false },
  { id: 'b4', title: 'Store-to-Store Transfers — This Week\'s Schedule', description: 'Alert for this week\'s transfers in and transfers out. Labor estimates based upon inbound/outbound execution are attached. Please ensure scheduling during non-selling hours.', type: 'info', category: 'Operations', sender: 'Operations Team', timeSent: '6h ago', isRead: true },
];

// ─── Helpers ───
const getGreeting = (): { text: string; icon: React.ReactNode } => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: <AutoAwesomeOutlined sx={{ fontSize: 20 }}/> };
  if (h < 17) return { text: 'Good afternoon', icon: <AutoAwesomeOutlined sx={{ fontSize: 20 }}/> };
  return { text: 'Good evening', icon: <DarkModeOutlined sx={{ fontSize: 20 }}/> };
};

// ─── HQ EAC mock data ────────────────────────────────────────────────────────
const HQ_EAC_GROUPS = [
  {
    id: 'boh-to-shelf', type: 'boh' as const,
    title: 'BOH-to-Shelf Sync',
    taskType: 'Shelf Replenishment',
    severity: 'High' as const, severityClass: 'high' as const,
    desc: 'Shelf gaps detected with available backroom inventory across multiple districts. Items in BOH not reaching shelves.',
    regionCount: 3, districtCount: 14, storeCount: 38, skuCount: 186, riskValue: '$94.2K',
    taskTotal: 72, taskOpen: 31, taskProg: 28, taskSub: 13, taskOver: 8,
    taskCompletion: 58,
    lastDetected: '6 min ago',
    entities: [
      { name: 'Southeast Region', detail: '7 districts · 18 stores · 82 SKUs · $42K at risk', status: 'critical' as const, tasks: 31, dm: 'Lisa Nguyen' },
      { name: 'Northeast Region', detail: '4 districts · 12 stores · 64 SKUs · $32K at risk', status: 'progress' as const, tasks: 26, dm: 'Marcus Reed' },
      { name: 'Central Region',   detail: '3 districts · 8 stores · 40 SKUs · $20K at risk',  status: 'progress' as const, tasks: 15, dm: 'David Park' },
    ],
  },
  {
    id: 'phantom-stock', type: 'phantom' as const,
    title: 'Phantom Stock',
    taskType: 'Inventory Check / Cycle Count',
    severity: 'High' as const, severityClass: 'high' as const,
    desc: 'High-stock, zero-sales inventory concentrated across key districts. Significant inventory value at risk.',
    regionCount: 4, districtCount: 22, storeCount: 42, skuCount: 410, riskValue: '$286K',
    taskTotal: 98, taskOpen: 44, taskProg: 32, taskSub: 22, taskOver: 11,
    taskCompletion: 76,
    lastDetected: '18 min ago',
    entities: [
      { name: 'Southeast Region', detail: '8 districts · 16 stores · 148 SKUs · $108K at risk', status: 'critical'  as const, tasks: 38, dm: 'Lisa Nguyen' },
      { name: 'Pacific Region',   detail: '6 districts · 12 stores · 112 SKUs · $82K at risk',  status: 'progress'  as const, tasks: 28, dm: 'Rachel Torres' },
      { name: 'Northeast Region', detail: '5 districts · 9 stores · 96 SKUs · $62K at risk',    status: 'progress'  as const, tasks: 21, dm: 'Marcus Reed' },
      { name: 'Central Region',   detail: '3 districts · 5 stores · 54 SKUs · $34K at risk',    status: 'submitted' as const, tasks: 11, dm: 'David Park' },
    ],
  },
  {
    id: 'pog-compliance', type: 'pog' as const,
    title: 'POG Compliance Gap',
    taskType: 'POG Correction',
    severity: 'Medium' as const, severityClass: 'medium' as const,
    desc: 'Shelf layout deviates from active planogram across multiple districts. Camera audits detected misplacements.',
    regionCount: 2, districtCount: 9, storeCount: 24, skuCount: 64, riskValue: '$41K',
    taskTotal: 48, taskOpen: 18, taskProg: 19, taskSub: 11, taskOver: 5,
    taskCompletion: 83,
    lastDetected: '22 min ago',
    entities: [
      { name: 'Southeast Region', detail: '5 districts · 14 stores · 38 fixtures deviating', status: 'critical' as const, tasks: 28, dm: 'Lisa Nguyen' },
      { name: 'Central Region',   detail: '4 districts · 10 stores · 26 fixtures deviating', status: 'progress' as const, tasks: 20, dm: 'David Park' },
    ],
  },
];

// ─── Component ───
export const HQHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();

  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBriefCollapsed, setIsBriefCollapsed] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showBriefAudio, setShowBriefAudio] = useState(false);
  const [neacDrawer, setNeacDrawer] = useState<null | typeof HQ_EAC_GROUPS[0]>(null);
  const [, setBroadcasts] = useState<BroadcastItem[]>(MOCK_BROADCASTS);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastItem | null>(null);
  // District Leaderboard state
  const [sortField] = useState<'dpi' | 'riskLevel'>('dpi');
  const [sortDir] = useState<'asc' | 'desc'>('desc');
  const [broadcastToast] = useState<string | null>(null);
  const [lbSelectedDistrict, setLbSelectedDistrict] = useState<DistrictRow | null>(null);
  // HQ Alerts right-side detail panel (mirrors StoreOpsHome alert panel pattern)
  const [hqAlertPanel, setHqAlertPanel] = useState<HQAlertItem | null>(null);
  const closeHqAlertPanel = () => setHqAlertPanel(null);
  // Broadcast Analytics + Create Broadcast Wizard state (mirrors District Intelligence)
  const [bcaSelectedBroadcast, setBcaSelectedBroadcast] = useState<HQBroadcastTrackRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBroadcastWizard, setShowBroadcastWizard] = useState(false);
  const [bwStep, setBwStep] = useState<1 | 2 | 3>(1);
  const [bwAudience, setBwAudience] = useState<'all-districts' | 'specific-districts' | 'managers'>('all-districts');
  const [bwSelectedDistrictIds, setBwSelectedDistrictIds] = useState<string[]>([]);
  const [bwSelectedManagerIds, setBwSelectedManagerIds] = useState<string[]>([]);
  const [bwPriority, setBwPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal');
  const [bwCategory, setBwCategory] = useState<'Operations' | 'Safety' | 'Compliance' | 'Announcement'>('Operations');
  const [bwSubject, setBwSubject] = useState('');
  const [bwMessage, setBwMessage] = useState('');
  const [bwSending, setBwSending] = useState(false);
  const [bwAttachments, setBwAttachments] = useState<{name: string; size: string; type: string}[]>([]);
  const [bwRequiredActions, setBwRequiredActions] = useState<string[]>(['']);
  const [bwKeyDates, setBwKeyDates] = useState<{label: string; date: string}[]>([{label: '', date: ''}]);

  const openBroadcastWizard = () => {
    setBwStep(1);
    setBwAudience('all-districts');
    setBwSelectedDistrictIds([]);
    setBwSelectedManagerIds([]);
    setBwPriority('Normal');
    setBwCategory('Operations');
    setBwSubject('');
    setBwMessage('');
    setBwSending(false);
    setBwAttachments([]);
    setBwRequiredActions(['']);
    setBwKeyDates([{label: '', date: ''}]);
    setShowBroadcastWizard(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Build per-broadcast district compliance: top `ackedDistricts` are Acknowledged, rest Pending
  const getBroadcastDistrictCompliance = (bc: HQBroadcastTrackRow) => {
    const districts = [...HQ_DISTRICT_COMPLIANCE_BASE].sort((a, b) => b.ackRate - a.ackRate);
    return districts.slice(0, bc.districts).map((d, i) => ({
      ...d,
      acknowledged: i < bc.ackedDistricts,
    }));
  };

  const closeBcaPanel = () => setBcaSelectedBroadcast(null);

  // Build the impacted-entity payload for each HQ alert and open the right-side panel
  const openHqAlertPanel = (id: 'compliance-risk' | 'district-trending' | 'communication-gap' | 'performance-win') => {
    let data: HQAlertItem;
    const nowIso = new Date().toISOString();
    if (id === 'compliance-risk') {
      data = {
        id, severity: 'critical', signalLabel: 'COMPLIANCE RISK', source: 'Compliance AI', timestamp: nowIso,
        title: 'Execution Compliance Dropped 6% — District 11',
        description: '3 stores missed Monday audit window. Estimated revenue impact $18K. DM Lisa Nguyen has been notified.',
        impactSummary: 'Compliance gap widening — escalation recommended within 24h',
        entityLabel: 'Stores',
        entities: [
          { id: '4501', name: 'Miami Central #4501', status: 'critical', detail: 'Audit overdue · Compliance dropped 9pts WoW', manager: 'Lisa Nguyen' },
          { id: '4512', name: 'Orlando Gateway #4512', status: 'warning', detail: 'Audit overdue · 3 missed checklists', manager: 'Lisa Nguyen' },
          { id: '4523', name: 'Tampa Bay Mall #4523', status: 'warning', detail: 'Compliance dropped 4pts · Cleanliness score down', manager: 'Lisa Nguyen' },
        ],
        ctas: [
          { label: 'Open District Intelligence', action: 'district-intel' },
          { label: 'Message DM', action: 'message-dm' },
        ],
      };
    } else if (id === 'district-trending') {
      data = {
        id, severity: 'warning', signalLabel: 'DISTRICT TRENDING', source: 'District Performance AI', timestamp: nowIso,
        title: 'Execution Gaps Widening in 2 Districts',
        description: 'Compliance scores declining in District 11 and District 22. Correlated with audit misses and late broadcast acknowledgements.',
        impactSummary: 'District 14 +4% · District 08 +2% · District 22 –3%',
        entityLabel: 'Districts',
        entities: [
          { id: 'd11', name: 'District 11 — Florida', status: 'critical', detail: 'DPI 79 · Compliance 78% · Trend declining', manager: 'Lisa Nguyen' },
          { id: 'd22', name: 'District 22 — Carolina', status: 'warning', detail: 'DPI 82 · Compliance 83% · Trend declining', manager: 'Marcus Reed' },
          { id: 'd14', name: 'District 14 — Tennessee', status: 'info', detail: 'DPI 87 · Compliance 96% · Trend improving (+4%)', manager: 'John Doe' },
        ],
        ctas: [
          { label: 'Ask Alan', action: 'ai-copilot' },
          { label: 'Open District Intelligence', action: 'district-intel' },
        ],
      };
    } else if (id === 'communication-gap') {
      data = {
        id, severity: 'warning', signalLabel: 'COMMUNICATION GAP', source: 'Broadcast Analytics', timestamp: nowIso,
        title: 'Broadcast Acknowledgement Rate Declining',
        description: 'Districts 11, 22, and 19 below the 85% threshold. "Summer 2 Floorset — Overnight Shift Scheduling" has a 13-store gap 2 hours after send.',
        impactSummary: '13-store ack gap on Summer 2 Floorset broadcast — floorset at risk',
        entityLabel: 'Districts',
        entities: [
          { id: 'd11', name: 'District 11 — Florida', status: 'critical', detail: '60% ack rate · 6 missed acks · Avg 5h 20m', manager: 'Lisa Nguyen' },
          { id: 'd22', name: 'District 22 — Carolina', status: 'warning', detail: '72% ack rate · 4 missed acks · Avg 3h 45m', manager: 'Marcus Reed' },
          { id: 'd19', name: 'District 19 — Alabama', status: 'warning', detail: '84% ack rate · 2 missed acks · Avg 2h 30m', manager: 'David Park' },
        ],
        ctas: [
          { label: 'View Broadcast Analytics', action: 'scroll-bca' },
          { label: 'Send Reminder', action: 'send-reminder' },
        ],
      };
    } else {
      data = {
        id, severity: 'success', signalLabel: 'PERFORMANCE WIN', source: 'Network Analytics', timestamp: nowIso,
        title: 'District 14 — Network-Leading Planogram Compliance, 2nd Week Running',
        description: 'Top 3 stores at 100% POG adherence; district-wide average 96%. Camera audit scores averaging 96.2. Top performer: Store #2034.',
        impactSummary: 'Replicable template for underperforming districts — share-out recommended',
        entityLabel: 'Stores',
        entities: [
          { id: '2034', name: 'Nashville Flagship #2034', status: 'info', detail: '100% POG · 98 audit score · Top performer', manager: 'John Doe' },
          { id: '1876', name: 'Memphis Central #1876', status: 'info', detail: '100% POG · 96 audit score', manager: 'John Doe' },
          { id: '3421', name: 'Knoxville East #3421', status: 'info', detail: '100% POG · 95 audit score', manager: 'John Doe' },
        ],
        ctas: [
          { label: 'Open District Intelligence', action: 'district-intel' },
          { label: 'Share Best Practices', action: 'share-best-practice' },
        ],
      };
    }
    setHqAlertPanel(data);
  };

  const handleHqAlertCTA = (cta: HQAlertCTA) => {
    if (!hqAlertPanel) return;
    const alert = hqAlertPanel;
    closeHqAlertPanel();
    switch (cta.action) {
      case 'district-intel': {
        // Pick the first impacted district id; for store-list alerts default to D11/D14 by alert id
        const districtId = alert.id === 'compliance-risk' ? 'd11' : alert.id === 'performance-win' ? 'd14' : (alert.entities.find(e => e.id.startsWith('d'))?.id || 'd14');
        navigate(`/store-operations/district-intelligence?district=${districtId}`);
        break;
      }
      case 'ai-copilot':
        openAskAlan({ preset: 'district-gaps' });
        break;
      case 'communications':
        navigate('/command-center/communications');
        break;
      case 'message-dm':
        navigate('/command-center/communications');
        break;
      case 'share-best-practice':
        showToast(`Best-practice playbook from "${alert.title}" shared with all DMs`);
        break;
      case 'scroll-bca':
        document.querySelector('.bca-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      case 'send-reminder':
        showToast('Reminder nudge sent to lagging districts');
        break;
    }
  };

  const sortedDistricts = [...MOCK_DISTRICTS].sort((a, b) => {
    if (sortField === 'dpi') {
      return sortDir === 'desc' ? b.dpi - a.dpi : a.dpi - b.dpi;
    }
    const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return sortDir === 'desc'
      ? riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
      : riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });


  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const closeBroadcastModal = () => setSelectedBroadcast(null);

  const handleMarkAsRead = () => {
    if (selectedBroadcast) {
      setBroadcasts(prev => prev.map(b => b.id === selectedBroadcast.id ? { ...b, isRead: true } : b));
    }
    closeBroadcastModal();
  };

  const greetingPart = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  if (isLoading) {
    return (
      <div className="store-ops-home">
        <div className="store-ops-loading">
          <div className="store-ops-loading-spinner" />
          <p>Loading command center...</p>
        </div>
      </div>
    );
  }

  // Reusable AI Daily Brief content (shared between inline view and modal)
  const aiBriefContent = (
    <div className="ai-brief-summary">
      <p className="ai-brief-paragraph">
        Good {greetingPart}, {user?.name || 'Elena'}. The network delivered <strong>$5.2M in weekly revenue</strong> at <strong>+3.1% vs plan</strong> this week. The enterprise headline is solid, but the underlying picture is deeply uneven — District 14 is the network benchmark while two districts are in structural decline. This brief covers the full picture: network scorecard vs all benchmarks, regional and district breakdown, product division performance, traffic and conversion trends, external context, what drove the week, and HQ strategic priorities.
      </p>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><BarChartOutlined sx={{ fontSize: 14 }}/> Network Weekly Scorecard — vs Plan, LY, Forecast &amp; Comp Week</h3>
        <ul className="ai-brief-bullets">
          <li><strong>vs Plan:</strong> Network revenue <strong>$5.2M (+3.1% vs plan)</strong>. 18 of 22 districts beat plan. Gross margin at <strong>34.1%</strong> — +0.6pp vs Q1 plan. Units sold: +2.8% vs plan. Markdown rate at 11.4% — within the 12% plan cap. Full-price sell-through strong in Apparel (+4.2pp vs plan).</li>
          <li><strong>vs Last Year (LY):</strong> Network revenue <strong>+2.4% vs LY</strong>. Total transactions up +1.8% YoY. Conversion improved from 23.2% → <strong>23.8%</strong> (+0.6pp YoY). Average basket size up from $55.80 → $57.90 (+3.8% YoY). Network-level basket growth is consistent with the apparel premiumization strategy — the mix shift toward full-price Blazers, Dresses, and premium Denim is working.</li>
          <li><strong>vs AI Forecast:</strong> +1.2% above AI network-level demand forecast. The model had flagged Semi Annual Sale upside at the top 10 revenue stores — this materialized. The model had also flagged execution risk at the bottom 4 stores — this also materialized. AI forecast accuracy improving: 87% of store-level predictions within ±5% this week.</li>
          <li><strong>vs Comparable Week (52-wk prior):</strong> <strong>+2.9% net-comp</strong> — consistent like-for-like growth for the 3rd consecutive week. The network has not had 3 consecutive positive net-comp weeks since Q3 last year.</li>
        </ul>
      </div>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><DirectionsWalkOutlined sx={{ fontSize: 14 }}/> Network Traffic &amp; Conversion Trends</h3>
        <ul className="ai-brief-bullets">
          <li>Network total transactions: <strong>92,400 this week</strong> (+1.8% YoY). Peak day was Saturday (+16% vs Monday baseline) — driven by warm weather in the Southeast/Central regions and Semi Annual Sale awareness.</li>
          <li>Network conversion rate: <strong>23.8%</strong> (+0.6pp YoY). However, the distribution is bifurcated: stores with complete Summer 2 floorsets averaged <strong>26.1% conversion</strong> vs <strong>19.4%</strong> in stores with partial sets. The <strong>6.7pp conversion gap</strong> between complete and incomplete floorsets is the single largest performance lever in the network this week.</li>
          <li>Fitting room conversion (try-on → purchase): <strong>46% network average</strong>. District 14 leads at 52%. District 11 lags at 38%. The fitting room service gap is the #1 conversion driver at the store level and it is manageable with scheduling changes alone.</li>
          <li>Checkout speed: <strong>VoC "Checkout Speed" complaints up +12% WoW</strong> across the network — concentrated in 8 stores in Districts 8 and 22. Root cause is consistent: single-register operation during 12–2 PM and 5–7 PM peak windows. This is a staffing instruction problem, not a structural one.</li>
        </ul>
      </div>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><WbSunnyOutlined sx={{ fontSize: 14 }}/> External Context — Weather, Events &amp; Macro Factors</h3>
        <ul className="ai-brief-bullets">
          <li><strong>Weather — Southeast (Tennessee, Georgia, Carolina, Florida):</strong> Warm and sunny weekend across the Southeast (3–4°F above seasonal average). This drove measurable lifts in Dresses (+18% vs national baseline), Swimwear-adjacent categories, and light Outerwear. Estimated weather uplift to network revenue: <strong>+$180K above baseline weather scenario</strong>. Southeast stores with complete Summer 2 floorsets captured this uplift; partial-set stores did not — amplifying the execution gap.</li>
          <li><strong>Weather — Pacific Northwest (Washington, Oregon):</strong> Cooler and wetter than seasonal average (–3°F). This suppressed Dress and summer category demand at 6 PNW stores. Estimated weather drag: –$42K vs baseline. Pacific Northwest is the only region where weather was a negative factor this week.</li>
          <li><strong>Semi Annual Sale:</strong> Sale activation contributed an estimated <strong>+$620K incremental network revenue</strong> (AI attribution model vs non-sale baseline). High-traffic stores with clearance endcaps in optimal positions (high-traffic junction, not mid-aisle) generated 14–16% of transactions through clearance while maintaining full-price velocity — exactly the intended balance.</li>
          <li><strong>Local Events — Graduation season:</strong> Graduation ceremonies across multiple metro markets (Vanderbilt, UT, Rhodes, Emory, UNC) drove premium-adjacent traffic Saturday AM in 14 cities. Formal-adjacent purchases (Blazer, Midi Dress, statement accessories) up +26% Saturday vs Tuesday average across the affected markets. This was not in the AI demand forecast — it is an upside driver that partially explains the +1.2% vs forecast beat.</li>
          <li><strong>Macro consumer sentiment:</strong> No significant macro shifts this week. Consumer confidence index stable. Credit card spend data (external feed) shows apparel spending up +2.1% vs the same week last year, consistent with the network's +2.4% LY performance.</li>
        </ul>
      </div>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><CategoryOutlined sx={{ fontSize: 14 }}/> Product Division Performance — Network View</h3>
        <ul className="ai-brief-bullets">
          <li><strong>Women's Division (+9.4% vs plan — network leader):</strong> Dresses: +17% driven by weather and Summer 2 execution at top stores. Basics: +8.2%. Blazers: +11% in stores with complete floorsets, –4% in partial-set stores. Accessories: –2.8% — an Endcap facing compliance issue at 5+ stores in 3 districts. Accessories facing correction is an estimated <strong>+$28K/week network revenue opportunity</strong>.</li>
          <li><strong>Men's Division (+3.8% vs plan):</strong> Polo Classic and Compression Tee strong across all regions. Denim: +4.2% nationally — the new Slim Fit washes are performing. Oxford Button-Down: flat. Men's is the most regionally consistent division — least variance district-to-district.</li>
          <li><strong>Kids (+2.1% vs plan):</strong> Color Block Tee and Cargo Shorts leading. Kids Party Dress is the consistent laggard — a supply chain-level size-run gap (XS, 4T) is limiting conversion in 14 of 22 districts. <strong>A national DC assortment correction for Kids Party Dress XS/4T is recommended as a priority supply chain action this week.</strong></li>
          <li><strong>Accessories (–2.8% vs plan — network miss):</strong> Endcap execution is inconsistent across 18 of 22 districts. Average Accessories Endcap at 4.3 facings vs the 6-facing POG spec — a systemic execution gap. A network-wide broadcast requiring Accessories Endcap facing correction to 6-spec would recover an estimated $28K/week immediately.</li>
          <li><strong>Footwear (+7.2% vs plan — consistent outperformer):</strong> Running Shoes Elite and Canvas Sneakers both strong in every region. The self-service format makes footwear resilient to staffing and fitting room variance — a structural advantage during execution challenges.</li>
        </ul>
      </div>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><ShowChartOutlined sx={{ fontSize: 14 }}/> Seasonal vs. NOS / Core — Network Performance</h3>
        <ul className="ai-brief-bullets">
          <li><strong>Seasonal (Summer 2): 56% of network revenue</strong> (vs 58% plan mix). Under-indexed because 20 of 32 stores have incomplete floorsets — the two-thirds of the network that is completely set is averaging 62% seasonal mix (above plan); the one-third that is partially set is at only 44%. The seasonal revenue gap is entirely execution-driven.</li>
          <li><strong>NOS / Core: 44% of network revenue.</strong> Core items (V-Neck Basics, Classic Tee, Polo, Slim Fit Denim) are healthy and above plan across all regions. The NOS base provides revenue floor stability — even in the worst-performing stores, core items are performing.</li>
          <li><strong>Full-price sell-through on Summer 2 hero items:</strong> Network average <strong>86%</strong> — above the 84% plan target. Strong full-price sell-through signals no early markdown pressure on Summer 2 for at least 3 more weeks. The exceptions are Johnson City Mall (29% seasonal mix) and 2 Pacific Northwest stores where weather has suppressed summer category demand.</li>
          <li><strong>Clearance:</strong> Network-wide markdown rate 11.4% — within the 12% plan cap. Semi Annual Sale clearance velocity is healthy. No network-wide over-stocked clearance risk. The 3 Crisis-tier stores have higher-than-planned clearance rates (18–24%) which is compressing their GMs below plan.</li>
        </ul>
      </div>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><BusinessOutlined sx={{ fontSize: 14 }}/> Regional &amp; District Performance Matrix</h3>
        <ul className="ai-brief-bullets">
          <li><strong>Southeast Region (Districts 8, 11, 14, 19, 22) — DPI 83 avg:</strong> District 14 (Tennessee, DPI 87) and District 19 (Alabama, DPI 88) are Excellence Tier — the two strongest districts in the network. District 11 (Florida) and District 22 (Carolina) are declining and require HQ-level structural intervention. Southeast is the highest-revenue region at <strong>$1.84M combined</strong> (+5.6% vs plan).</li>
          <li><strong>Central Region — DPI 81 avg:</strong> Stable. 6 of 7 districts at or above plan. No triage items this week. Revenue: <strong>$1.62M</strong> (+1.8% vs plan). The Central region is reliable but not growing — traffic is flat YoY across all 7 districts.</li>
          <li><strong>Northeast Region — DPI 79 avg:</strong> Revenue: <strong>$1.14M</strong> (+0.8% vs plan). Below-network conversion average (21.4% vs 23.8% network). Fitting room staffing gap is a consistent theme. 3 stores are below plan by more than 5%.</li>
          <li><strong>Pacific Northwest Region — DPI 76 avg:</strong> Revenue: <strong>$620K</strong> (–1.4% vs plan) — the only region below plan. Weather drag (–$42K) explains half the miss; execution gaps in 4 stores explain the other half. No triage items, but trend requires monitoring.</li>
          <li><strong>Top 5 performing stores nationally:</strong> (1) Nashville Flagship ($224K, SPI 94), (2) Miami Central ($308K, SPI 91), (3) Memphis Central ($198K, SPI 88), (4) Franklin Town Center ($171K, SPI 82), (5) Tampa Bay Mall ($264K, SPI 87). These 5 stores generated <strong>$1.165M — 22.4% of total network revenue</strong>.</li>
        </ul>
      </div>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><CompareArrowsOutlined sx={{ fontSize: 14 }}/> What Drove the Network — AI Business Analysis</h3>
        <ul className="ai-brief-bullets">
          <li><strong>The execution gap is the story:</strong> The single biggest driver of the performance distribution this week is Summer 2 floorset completion. Stores with complete floorsets averaged +$258K more revenue than stores with partial sets. There are 20 stores still with incomplete sets — this is the largest addressable revenue opportunity in the network right now, estimated at <strong>$5.1M in annualized incremental revenue</strong> if brought to completion status.</li>
          <li><strong>Semi Annual Sale amplified the execution gap:</strong> Sale-driven traffic gave every store the same opportunity. Fully-set stores converted it at 26.1%; partial-set stores at 19.4%. The promotional amplification means that each day of incomplete execution during the sale window costs more than a typical week. The urgency is proportional to the sale duration remaining.</li>
          <li><strong>Weather was a Southeast tailwind and PNW headwind:</strong> The Southeast weather uplift (+$180K estimated) is entirely captured by the Southeast stores with complete floorsets. The PNW weather drag (–$42K) is a real headwind but not the primary driver of PNW underperformance — execution gaps at 4 stores account for the larger portion of the miss.</li>
          <li><strong>Graduation season was an underforecasted upside driver:</strong> The +26% Saturday AM spike in formal-adjacent categories across 14 graduation-market cities was not in the AI forecast model. This +$64K estimated uplift is a recurring signal (graduation season runs through mid-June) — build this into the demand model and brief DMs in graduation markets to staff fitting rooms more heavily during Saturday mornings for the next 3 weeks.</li>
          <li><strong>Accessories is the systemic miss:</strong> The –2.8% vs plan in Accessories is not store-specific — 18 of 22 districts have the same Endcap facing compliance gap (4.3 vs 6-facing spec). This is a network execution failure that a single HQ broadcast can address. No inventory change required; no capital required. Estimated weekly revenue recovery: $28K/week.</li>
        </ul>
      </div>

      <div className="ai-brief-section">
        <h3 className="ai-brief-section-title"><TaskAltOutlined sx={{ fontSize: 14 }}/> Network Compliance &amp; Safety Escalations</h3>
        <ul className="ai-brief-bullets">
          <li>Network-wide POG adherence: <strong>84.8%</strong> (–0.4pp WoW). Decline concentrated in Districts 11 (78%) and 22 (83%). Districts 14 and 19 averaged 96.4% — demonstrating high adherence is achievable at scale.</li>
          <li><strong>Safety escalation — Johnson City Mall (District 14):</strong> Fire exit obstruction (Exit B) auto-flagged 2 hours ago. Zero-tolerance regulatory exposure. SM acknowledgement pending. Escalate to Regional if not resolved by noon. District DM Clarke Johnson has been notified.</li>
          <li><strong>Product recall:</strong> Children's Pajamas Drawstring Safety Recall (Batch #7742) — recall protocol compliance at 94% chain-wide. 6 stores still need confirmation of stock pull. These 6 stores need a direct call from HQ compliance today.</li>
          <li>Overdue action backlog: <strong>12%</strong> of total (vs 8% target). Primary contributors: Districts 11 and 22. Resolution time held at 4.2h avg — within SLA. Broadcast acknowledgement rate: 94.1% overall; Districts 11 and 22 below 70%.</li>
        </ul>
      </div>

      <div className="ai-brief-section ai-brief-suggestions">
        <h3 className="ai-brief-section-title"><AutoAwesomeOutlined sx={{ fontSize: 14 }}/> HQ Strategic Priorities This Week</h3>
        <ul className="ai-brief-bullets">
          <li><strong>Accessories Endcap broadcast (today — $28K/week recovery):</strong> Issue a network-wide broadcast: "Accessories Endcap — 6-Facing Reset Required by EOD Wednesday." This is a 20-minute fix at every store. No inventory change, no capital. Highest ROI action available at HQ level right now.</li>
          <li><strong>Kids Party Dress supply chain correction (this week):</strong> The XS and 4T size-run gap is suppressing conversion in 14 of 22 districts. Submit a national DC assortment request for these two sizes — store-by-store requests will take 3× longer to resolve than a coordinated national action.</li>
          <li><strong>District 22 retention policy (HQ-level intervention needed):</strong> Three consecutive weeks of declining DPI mapped to 18% quarterly staff turnover is a systemic pattern. Draft a retention incentive policy proposal for Regional review. District-level fixes have not reversed the trend — this requires an HQ policy change.</li>
          <li><strong>Codify District 14 execution playbook (this quarter):</strong> 6-week streak at DPI 87+, POG 96.4%, VoC 72+ is the clearest best-practice signal in the network. Document the playbook (floorset process, fitting room staffing, cleaning schedule, broadcast cadence) and assign one HQ lead to convert it into a deployable training asset for underperforming districts.</li>
          <li><strong>Graduation market fitting room brief (this week):</strong> Brief DMs in the 14 graduation-market cities to increase fitting room staffing on Saturday mornings for the next 3 weeks. The graduation customer has an above-average ATV ($72 vs $58 network avg). This is a short-window, high-ROI staffing instruction.</li>
          <li><strong>District 11 structural review (30-day action):</strong> The coastal-vs-inland bimodal performance (SPI 91 coastal vs SPI 57 inland average) cannot be resolved without structural changes to how the district is managed. Assign an HQ field operations lead to conduct a 30-day review and recommend a district management restructure proposal for the half-year review.</li>
        </ul>
      </div>

      <p className="ai-brief-closing">
        The network is financially healthy and on a positive net-comp trajectory for the 3rd consecutive week — a meaningful milestone. The execution opportunity is large: the 20 incomplete floorsets, the Accessories facing gap, and the Kids Party Dress size-run issue collectively represent an estimated <strong>$6.2M in annualized incremental revenue</strong> if resolved. The safety escalation at Johnson City Mall is the only zero-tolerance item. This week's highest-leverage HQ actions are the Accessories broadcast, the Kids DC correction, and the District 22 retention policy — all three are systemic actions that no individual DM can solve alone.
      </p>
    </div>
  );

  // Keep openHqAlertPanel ref alive for legacy HQ drawer (drawer still wires up hqAlertPanel state)
  void openHqAlertPanel;

  return (
    <div className="store-ops-home hq-home">
      {/* ZONE 1: Welcome Header */}
      <div className="store-ops-welcome-bar">
        <div className="welcome-bar-left">
          <div className="welcome-greeting">
            <span className="greeting-icon">{greeting.icon}</span>
            <h1>
              {greeting.text}, <span className="user-name">{user?.name || 'Elena Fischer'}</span>
            </h1>
          </div>
          <div className="welcome-meta">
            <span className="role-badge">{user?.role || 'HQ'}</span>
            <span className="scope-info">
              <LanguageOutlined sx={{ fontSize: 14 }}/>
              {user?.region || 'North America'} · Global View
            </span>
            <span className="last-refresh-date">
              <CalendarTodayOutlined sx={{ fontSize: 14 }}/>
              Last refreshed: {lastRefresh.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
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

      {/* AI DAILY BRIEF — Full Width Top */}
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
              text="Good morning, Elena. The network delivered 5.2 million in weekly revenue this week at plus 3.1 percent versus plan, plus 2.4 percent versus last year, and plus 2.9 percent on a net-comp basis — the third consecutive positive net-comp week, the best run since Q3 last year. Network gross margin at 34.1 percent, 0.6 points above the Q1 plan target. Network conversion improved to 23.8 percent, up 0.6 points year over year. Average basket size up 3.8 percent to 57.90. The Southeast drove the outperformance, led by District 14 Tennessee at DPI 87 national rank number 2, and District 19 Alabama at DPI 88 national number 1. Warm weather across the Southeast and graduation season in 14 metro markets contributed an estimated 180 thousand in weather uplift and 64 thousand from graduation traffic — the latter was not in the AI forecast model. Women's Division leads at plus 9.4 percent versus plan, driven by Dresses up 17 percent and Blazers up 11 percent in stores with complete floorsets. Accessories is the one network miss at minus 2.8 percent versus plan — an Endcap facing compliance issue at 18 of 22 districts. A single broadcast requiring the 6-facing reset would recover an estimated 28 thousand per week. Kids Party Dress has a national size-run gap in XS and 4T affecting 14 of 22 districts — a national DC assortment request is the right fix, not store-by-store escalations. Safety: fire exit obstruction at Johnson City Mall is a zero-tolerance regulatory exposure — escalate to Regional if not resolved by noon. Top HQ priorities this week: issue the Accessories Endcap broadcast today, submit the Kids DC assortment correction, draft the District 22 staff retention policy for Regional review, and begin codifying the District 14 execution playbook. The network is in the best financial position in 3 quarters — the execution gap is the only thing standing between here and a top-quartile result."
              title="AI Daily Brief"
              variant="bar"
              onClose={() => setShowBriefAudio(false)}
            />
          </div>
        )}
        <div className="ai-brief-body-wrapper">
          <div className={`ai-brief-body ${isBriefCollapsed ? 'collapsed' : ''}`}>
            {aiBriefContent}
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

      {/* ═══ BROADCAST ANALYTICS — placed directly below AI Daily Brief ═══ */}
      <div className="bca-section">
        <div className="bca-header">
          <div className="bca-header-left">
            <div className="bca-title-row">
              <CampaignOutlined sx={{ fontSize: 20 }}/>
              <h2>Broadcast Analytics</h2>
            </div>
            <p className="bca-subtitle">Track HQ broadcast effectiveness, district acknowledgement, and engagement</p>
          </div>
          <button className="bca-create-btn" onClick={openBroadcastWizard}>
            <CampaignOutlined sx={{ fontSize: 13 }}/> Create Broadcast
          </button>
        </div>

        {/* Performance Overview */}
        <div className="bca-overview-grid">
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Active Broadcasts</span>
            <span className="bca-kpi-value">{HQ_BROADCAST_OVERVIEW.active}</span>
            <span className="bca-kpi-context">currently live</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Sent This Week</span>
            <span className="bca-kpi-value">{HQ_BROADCAST_OVERVIEW.sentThisWeek}</span>
            <span className="bca-kpi-context">broadcasts</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Acknowledged</span>
            <span className="bca-kpi-value">{HQ_BROADCAST_OVERVIEW.ackPct}%</span>
            <span className="bca-kpi-context">of all districts</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Avg Ack Time</span>
            <span className="bca-kpi-value">{HQ_BROADCAST_OVERVIEW.avgAckTime}</span>
            <span className="bca-kpi-context">time to acknowledge</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Trend vs Last</span>
            <span className={`bca-kpi-value ${HQ_BROADCAST_OVERVIEW.trendVsLast >= 0 ? 'positive' : 'negative'}`}>
              {HQ_BROADCAST_OVERVIEW.trendVsLast >= 0 ? '+' : ''}{HQ_BROADCAST_OVERVIEW.trendVsLast}%
            </span>
            <span className="bca-kpi-context">vs last period</span>
          </div>
        </div>

        {/* Broadcast List */}
        <div className="bca-sub-section">
          <div className="bca-table-wrapper">
            <table className="bca-table wow-table">
              <thead>
                <tr>
                  <th>Broadcast</th>
                  <th>Priority</th>
                  <th>Ack Rate</th>
                  <th>Avg Ack Time</th>
                  <th>Pending</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {HQ_BROADCAST_EFFECTIVENESS.map(bc => {
                  const pending = bc.districts - bc.ackedDistricts;
                  return (
                    <tr key={bc.id} className="bca-table-row" onClick={() => setBcaSelectedBroadcast(bc)}>
                      <td>
                        <div className="bca-bc-name">{bc.name}</div>
                        <span className="bca-bc-sent">{bc.type} · Sent {bc.sentAt}</span>
                      </td>
                      <td>
                        <span className={`bca-priority-badge ${bc.priority}`}>{bc.priority}</span>
                      </td>
                      <td>
                        <span className={`bca-bc-metric-val ${bc.ackRate >= 90 ? 'high' : bc.ackRate >= 75 ? 'medium' : 'low'}`}>{bc.ackRate}%</span>
                      </td>
                      <td className="bca-td-time">{bc.avgAckTime}</td>
                      <td>
                        <span className={`bca-pending-count ${pending > 1 ? 'high' : pending > 0 ? 'medium' : 'zero'}`}>{pending}</span>
                      </td>
                      <td>
                        <span className={`bca-status-badge ${bc.status === 'good' ? 'good' : 'at-risk'}`}>
                          {bc.status === 'good' ? 'Good' : 'Needs Attention'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="home-main-grid">
        {/* LEFT COLUMN: NEAC */}
        <div className="home-col-left">
          {/* ── Network Execution Action Center ── */}
          <div className="eac2-section">
            <div className="eac2-header">
              <div className="eac2-header-top">
                <div className="eac2-title-block">
                  <div className="eac2-icon-wrap">
                    <BoltOutlined sx={{ fontSize: 18 }}/>
                  </div>
                  <div className="eac2-title-text">
                    <h2 className="eac2-title">Alerts</h2>
                    <p className="eac2-subtitle">System-generated execution risks across regions, districts, and categories</p>
                  </div>
                </div>
                <div className="eac2-header-badges">
                  <div className="eac2-sys-badge">
                    <span className="eac2-sys-badge-dot"/>
                    Network Monitored
                  </div>
                  <span className="eac2-refresh-time">Updated 6 min ago</span>
                </div>
              </div>
              <div className="eac2-summary-strip">
                {[
                  { val: HQ_EAC_GROUPS.reduce((s,g)=>s+g.taskTotal,0), lbl:'Network Tasks', cls:'' },
                  { val: HQ_EAC_GROUPS.reduce((s,g)=>s+g.taskOpen,0),  lbl:'Open',         cls:'eac2-summary-tile-val--open' },
                  { val: HQ_EAC_GROUPS.reduce((s,g)=>s+g.taskProg,0),  lbl:'In Progress',  cls:'eac2-summary-tile-val--prog' },
                  { val: HQ_EAC_GROUPS.reduce((s,g)=>s+g.taskSub,0),   lbl:'Submitted',    cls:'eac2-summary-tile-val--sub' },
                  { val: HQ_EAC_GROUPS.reduce((s,g)=>s+g.taskOver,0),  lbl:'Overdue',      cls:'eac2-summary-tile-val--over' },
                ].map(t => (
                  <div key={t.lbl} className="eac2-summary-tile">
                    <span className={`eac2-summary-tile-val ${t.cls}`}>{t.val}</span>
                    <span className="eac2-summary-tile-lbl">{t.lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="eac2-cards-grid">
              {HQ_EAC_GROUPS.map(g => {
                const pctOpen = Math.round((g.taskOpen / g.taskTotal) * 100);
                const pctProg = Math.round((g.taskProg / g.taskTotal) * 100);
                const pctSub  = Math.round((g.taskSub  / g.taskTotal) * 100);
                const pctOver = Math.round((g.taskOver / g.taskTotal) * 100);
                return (
                  <div key={g.id} className={`eac2-card eac2-card--${g.type} eac2-card--network`} onClick={() => setNeacDrawer(g)}>

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

                      <div className="eac2-impact-row">
                        <span className="eac2-metric">
                          <GroupOutlined sx={{ fontSize: 13 }}/> <strong>{g.regionCount}</strong> Regions
                        </span>
                        <span className="eac2-metric">
                          <BarChartOutlined sx={{ fontSize: 13 }}/> <strong>{g.districtCount}</strong> Districts
                        </span>
                        <span className="eac2-metric">
                          <StoreOutlined sx={{ fontSize: 13 }}/> <strong>{g.storeCount}</strong> Stores
                        </span>
                        <span className="eac2-metric eac2-metric--risk">
                          <ErrorOutlined sx={{ fontSize: 13 }}/> <strong>{g.riskValue}</strong> at risk
                        </span>
                      </div>

                      <div className="eac2-card-footer">
                        <Button
                          variant="contained"
                          color="primary"
                          endIcon={<KeyboardArrowRight sx={{ fontSize: 14 }}/>}
                          onClick={e => { e.stopPropagation(); setNeacDrawer(g); }}
                        >
                          View Districts
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
                                  title: `[HQ] ${g.title}`,
                                  description: `${g.taskType}: ${g.desc}`,
                                  severity: g.severity === 'High' ? 'critical' : 'warning',
                                  source: 'Automated Execution Alert',
                                  stores: g.entities.map(e => ({ name: e.name, manager: e.dm, detail: e.detail })),
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

                    {/* RIGHT: task panel — 2×2 stat grid */}
                    <div className="eac2-card-task-panel">
                      <div className="eac2-task-panel-label">Auto-Created Tasks</div>
                      <div className="eac2-task-panel-total">{g.taskTotal}</div>
                      <div className="eac2-task-panel-type">{g.taskType} · {g.taskCompletion}% complete</div>
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
        </div>

        {/* RIGHT COLUMN: Operational Pulse */}
        <div className="home-col-right">
          {/* Operational Pulse */}
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '20px' }}>
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
                  <span className="kpi-snapshot-value">5</span>
                  <span className="kpi-snapshot-label">Districts Managed</span>
                </div>
              </div>
              <div className="kpi-snapshot-item">
                <div className="kpi-snapshot-item-icon tasks"><BoltOutlined sx={{ fontSize: 16 }}/></div>
                <div className="kpi-snapshot-item-data">
                  <span className="kpi-snapshot-value">14</span>
                  <span className="kpi-snapshot-label">Critical Issues</span>
                </div>
                <span className="kpi-snapshot-badge warning">+3 WoW</span>
              </div>
              <div className="kpi-snapshot-item">
                <div className="kpi-snapshot-item-icon compliance"><TaskAltOutlined sx={{ fontSize: 16 }}/></div>
                <div className="kpi-snapshot-item-data">
                  <span className="kpi-snapshot-value">94.1%</span>
                  <span className="kpi-snapshot-label">Broadcast Reach</span>
                </div>
                <span className="kpi-snapshot-badge positive">+1.8% WoW</span>
              </div>
              <div className="kpi-snapshot-item">
                <div className="kpi-snapshot-item-icon voc"><StarBorderOutlined sx={{ fontSize: 16 }}/></div>
                <div className="kpi-snapshot-item-data">
                  <span className="kpi-snapshot-value">73</span>
                  <span className="kpi-snapshot-label">District Perf. Index</span>
                </div>
                <span className="kpi-snapshot-badge positive">+1 pt MoM</span>
              </div>
            </div>
          </Card>

          {/* DISTRICT LEADERBOARD — Operational-Pulse-style list, click for full detail panel */}
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '20px', overflow: 'hidden', marginTop: '16px' }}>
            <div className="kpi-snapshot-header">
              <div className="kpi-snapshot-title-row">
                <BarChartOutlined sx={{ fontSize: 16 }} className="kpi-snapshot-icon"/>
                <h2>District Leaderboard</h2>
              </div>
              <span style={{ fontSize: 'var(--ia-text-2xs)', color: 'var(--ia-color-text-tertiary)', fontWeight: 'var(--ia-font-weight-medium)' }}>{MOCK_DISTRICTS.length} Districts · click for details</span>
            </div>
            {broadcastToast && (
              <div className="hq-dt-toast">
                <TaskAltOutlined sx={{ fontSize: 14 }}/>
                <span>{broadcastToast}</span>
              </div>
            )}
            <div className="kpi-snapshot-grid">
              {sortedDistricts.map((d, i) => {
                const trendBadge = d.trend === 'up'
                  ? { cls: 'positive', label: <><TrendingUpOutlined sx={{ fontSize: 11 }}/> Up</> }
                  : d.trend === 'down'
                  ? { cls: 'negative', label: <><TrendingDownOutlined sx={{ fontSize: 11 }}/> Down</> }
                  : { cls: 'neutral', label: <><Remove sx={{ fontSize: 11 }}/> Flat</> };
                return (
                  <div
                    key={d.id}
                    className="kpi-snapshot-item hq-leaderboard-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setLbSelectedDistrict(d)}
                  >
                    <div
                      className="kpi-snapshot-item-icon"
                      style={{
                        background: i === 0 ? 'var(--ia-color-warning-bg)' : i < 3 ? '#e0e7ff' : 'var(--ia-color-bg-muted)',
                        color: i === 0 ? '#92400e' : i < 3 ? '#3730a3' : 'var(--ia-color-text-secondary)',
                        fontWeight: 'var(--ia-font-weight-bold)',
                        fontSize: 'var(--ia-text-13)',
                      }}
                    >#{i + 1}</div>
                    <div className="kpi-snapshot-item-data">
                      <span className="kpi-snapshot-value" style={{ fontSize: 'var(--ia-text-lg)' }}>{d.dpi}</span>
                      <span
                        className="kpi-snapshot-label"
                        style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 'var(--ia-font-weight-semibold)', color: 'var(--ia-color-text-primary)' }}
                      >{d.name}</span>
                    </div>
                    <span className={`kpi-snapshot-badge ${trendBadge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {trendBadge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* District Leaderboard Right-side Detail Drawer */}
      {lbSelectedDistrict && (
        <div
          className="hq-modal-overlay"
          onClick={() => setLbSelectedDistrict(null)}
          style={{ justifyContent: 'flex-end', alignItems: 'stretch', padding: 0 }}
        >
          <div
            className="hq-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 440, maxWidth: '95vw', height: '100vh', maxHeight: '100vh',
              borderRadius: 0, overflow: 'auto', padding: 24,
              animation: 'slideInRight 0.25s ease-out',
            }}
          >
            <button className="hq-modal-close" onClick={() => setLbSelectedDistrict(null)}>
              <CloseOutlined sx={{ fontSize: 18 }}/>
            </button>
            <div className="hq-modal-badges">
              <span className={`hq-modal-badge hq-modal-badge--${lbSelectedDistrict.riskLevel === 'low' ? 'info' : lbSelectedDistrict.riskLevel === 'high' || lbSelectedDistrict.riskLevel === 'critical' ? 'high' : 'info'}`}>
                {lbSelectedDistrict.riskLevel.toUpperCase()} RISK
              </span>
              <span className="hq-modal-badge hq-modal-badge--category">
                #{sortedDistricts.findIndex(x => x.id === lbSelectedDistrict.id) + 1} RANK
              </span>
            </div>
            <h2 className="hq-modal-title">{lbSelectedDistrict.name}</h2>
            <p className="hq-modal-desc">
              Led by {lbSelectedDistrict.dm}. DPI of {lbSelectedDistrict.dpi} with {lbSelectedDistrict.compliance}% compliance. Trend is {lbSelectedDistrict.trend === 'up' ? 'improving' : lbSelectedDistrict.trend === 'down' ? 'declining' : 'stable'}.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <div style={{ padding: 14, background: 'var(--ia-color-bg-subtle)', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div
                  style={{
                    fontSize: 'var(--ia-text-2xs)',
                    color: 'var(--ia-color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >DPI Score</div>
                <div
                  style={{
                    fontSize: 'var(--ia-text-4xl)',
                    fontWeight: 'var(--ia-font-weight-bold)',
                    color: lbSelectedDistrict.dpi >= 75 ? '#059669' : lbSelectedDistrict.dpi >= 65 ? 'var(--ia-color-warning-text)' : 'var(--ia-color-error-strong)',
                  }}
                >
                  {lbSelectedDistrict.dpi}
                </div>
                <div style={{ fontSize: 'var(--ia-text-2xs)', color: 'var(--ia-color-text-secondary)' }}>out of 100</div>
              </div>
              <div style={{ padding: 14, background: 'var(--ia-color-bg-subtle)', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div
                  style={{
                    fontSize: 'var(--ia-text-2xs)',
                    color: 'var(--ia-color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >Compliance</div>
                <div style={{ fontSize: 'var(--ia-text-4xl)', fontWeight: 'var(--ia-font-weight-bold)', color: 'var(--ia-color-text-primary)' }}>{lbSelectedDistrict.compliance}%</div>
                <div className="hq-compliance-bar" style={{ marginTop: 6 }}>
                  <div className="hq-compliance-fill" style={{ width: `${lbSelectedDistrict.compliance}%` }} />
                </div>
              </div>
              <div style={{ padding: 14, background: 'var(--ia-color-bg-subtle)', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div
                  style={{
                    fontSize: 'var(--ia-text-2xs)',
                    color: 'var(--ia-color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >Risk Level</div>
                <span className={`hq-risk-level hq-risk-level--${lbSelectedDistrict.riskLevel}`}>{lbSelectedDistrict.riskLevel}</span>
              </div>
              <div style={{ padding: 14, background: 'var(--ia-color-bg-subtle)', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div
                  style={{
                    fontSize: 'var(--ia-text-2xs)',
                    color: 'var(--ia-color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >Trend</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 'var(--ia-text-sm)',
                    fontWeight: 'var(--ia-font-weight-semibold)',
                    color: lbSelectedDistrict.trend === 'up' ? '#059669' : lbSelectedDistrict.trend === 'down' ? 'var(--ia-color-error-strong)' : 'var(--ia-color-text-secondary)',
                  }}
                >
                  {lbSelectedDistrict.trend === 'up' && <><TrendingUpOutlined sx={{ fontSize: 16 }}/> Improving</>}
                  {lbSelectedDistrict.trend === 'down' && <><TrendingDownOutlined sx={{ fontSize: 16 }}/> Declining</>}
                  {lbSelectedDistrict.trend === 'flat' && <><Remove sx={{ fontSize: 16 }}/> Stable</>}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 14, background: 'var(--ia-color-bg-subtle)', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div
                style={{
                  fontSize: 'var(--ia-text-2xs)',
                  color: 'var(--ia-color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 10,
                }}
              >District Manager</div>
              <div className="hq-dm-cell">
                <div className="hq-dm-avatar">{lbSelectedDistrict.dm.split(' ').map(n => n[0]).join('')}</div>
                <div className="hq-dm-info">
                  <span className="hq-dm-name" style={{ fontWeight: 'var(--ia-font-weight-semibold)' }}>{lbSelectedDistrict.dm}</span>
                  <span style={{ fontSize: 'var(--ia-text-xs)', color: 'var(--ia-color-text-secondary)' }}>{lbSelectedDistrict.dmEmail}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 'var(--ia-text-2xs)',
                  color: 'var(--ia-color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 10,
                }}
              >Key Highlights</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--ia-text-13)', color: 'var(--ia-color-text-primary)', lineHeight: 1.7 }}>
                <li>DPI {lbSelectedDistrict.dpi >= 75 ? 'exceeds' : lbSelectedDistrict.dpi >= 65 ? 'meets' : 'below'} the network average (72)</li>
                <li>Compliance {lbSelectedDistrict.compliance >= 85 ? 'on track' : 'requires attention'} ({lbSelectedDistrict.compliance}% vs 85% target)</li>
                <li>{lbSelectedDistrict.riskLevel === 'low' ? 'No critical risk flags' : lbSelectedDistrict.riskLevel === 'medium' ? '1–2 risk flags to review' : 'Multiple risk flags — escalate'}</li>
              </ul>
            </div>

            <div className="hq-modal-actions" style={{ marginTop: 24 }}>
              <Button
                variant="outlined"
                color="primary"
                className="hq-modal-btn hq-modal-btn--secondary"
                onClick={() => {
                  const d = lbSelectedDistrict;
                  setLbSelectedDistrict(null);
                  navigate(`/store-operations/district-intelligence?district=${d.id}`);
                }}
                startIcon={<BarChartOutlined sx={{ fontSize: 16 }}/>}
              >
                Open District Intelligence
              </Button>
              <Button
                variant="contained"
                color="primary"
                className="hq-modal-btn hq-modal-btn--primary"
                onClick={() => { setLbSelectedDistrict(null); navigate('/command-center/communications'); }}
                startIcon={<ChatOutlined sx={{ fontSize: 16 }}/>}
              >
                Message DM
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HQ Alerts — Right-Side Detail Panel (mirrors DM Home pattern) ═══ */}
      {hqAlertPanel && (
        <>
          <div className="detail-panel-overlay" onClick={closeHqAlertPanel} />
          <div className="detail-panel">
            <div className="dp-hero-header">
              <div className="dp-hero-top">
                <div className="dp-hero-icon" style={{ background: hqAlertPanel.severity === 'success' ? '#dcfce7' : hqAlertPanel.severity === 'critical' ? '#fee2e2' : '#fef3c7', color: hqAlertPanel.severity === 'success' ? '#166534' : hqAlertPanel.severity === 'critical' ? '#b91c1c' : '#92400e' }}>
                  {hqAlertPanel.severity === 'success' ? <TaskAltOutlined sx={{ fontSize: 16 }}/> : <WarningAmberOutlined sx={{ fontSize: 16 }}/>}
                </div>
                <span className="dp-hero-type">{hqAlertPanel.source?.toUpperCase() || 'NETWORK ALERT'}</span>
                <button className="dp-hero-close" onClick={closeHqAlertPanel}>
                  <CloseOutlined sx={{ fontSize: 17 }}/>
                </button>
              </div>
              <h2 className="dp-hero-title">{hqAlertPanel.title}</h2>
              <div className="dp-hero-pills">
                <span className="dp-hero-pill" style={hqAlertPanel.severity === 'success' ? { background: '#dcfce7', color: '#166534' } : hqAlertPanel.severity === 'critical' ? { background: '#fee2e2', color: '#b91c1c' } : { background: '#fef3c7', color: '#92400e' }}>
                  {hqAlertPanel.severity === 'success' ? <TaskAltOutlined sx={{ fontSize: 10 }}/> : <WarningAmberOutlined sx={{ fontSize: 10 }}/>}
                  {hqAlertPanel.signalLabel}
                </span>
                {hqAlertPanel.source && (
                  <span className="dp-hero-pill" style={{ background: '#f1f5f9', color: '#475569' }}>
                    {hqAlertPanel.source}
                  </span>
                )}
              </div>
            </div>
            <div className="detail-panel-body">
              {hqAlertPanel.description && (
                <div className="dp-title-block">
                  <p className="dp-description">{hqAlertPanel.description}</p>
                </div>
              )}

              {/* Impact Summary */}
              <div className="dp-impact-summary">
                {hqAlertPanel.severity === 'success' ? <AutoAwesomeOutlined sx={{ fontSize: 14 }}/> : <ErrorOutlined sx={{ fontSize: 14 }}/>}
                <span>{hqAlertPanel.impactSummary}</span>
              </div>

              {/* Impacted Districts/Stores */}
              <div className="dp-section">
                <h3 className="dp-section-title">
                  {hqAlertPanel.entityLabel === 'Districts' ? <BarChartOutlined sx={{ fontSize: 14 }}/> : <StoreOutlined sx={{ fontSize: 14 }}/>}
                  Impacted {hqAlertPanel.entityLabel} ({hqAlertPanel.entities.length})
                </h3>
                <div className="dp-stores-list">
                  {hqAlertPanel.entities.map((e) => (
                    <div key={e.id} className={`dp-store-card ${e.status}`}>
                      <div className="dp-store-header">
                        <span className="dp-store-name">{e.name}</span>
                        <span className={`dp-store-status ${e.status}`}>
                          {e.status === 'critical' ? 'Critical' : e.status === 'warning' ? 'At Risk' : hqAlertPanel.severity === 'success' ? 'Top Performer' : 'Monitor'}
                        </span>
                      </div>
                      <p className="dp-store-detail">
                        {e.detail}
                        {e.manager && <> · {hqAlertPanel.entityLabel === 'Districts' ? 'DM' : 'Manager'}: {e.manager}</>}
                      </p>
                      <div className="dp-store-actions">
                        <button
                          className="dp-store-link"
                          onClick={() => {
                            closeHqAlertPanel();
                            if (hqAlertPanel.entityLabel === 'Districts') {
                              navigate(`/store-operations/district-intelligence?district=${e.id}`);
                            } else {
                              navigate(`/store-operations/store-deep-dive?store=${e.id}`);
                            }
                          }}
                        >
                          {hqAlertPanel.entityLabel === 'Districts' ? 'Open District' : 'View Store'} <KeyboardArrowRight sx={{ fontSize: 11 }}/>
                        </button>
                        {e.manager && (
                          <button
                            className="dp-store-assign-btn"
                            onClick={() => showToast(`✓ Message sent to ${e.manager} (${e.name})`)}
                          >
                            <ChatOutlined sx={{ fontSize: 11 }}/>
                            Message {hqAlertPanel.entityLabel === 'Districts' ? 'DM' : 'Manager'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTAs */}
              <div className="dp-actions">
                {hqAlertPanel.ctas.map((cta, idx) => (
                  <button
                    key={idx}
                    className="dp-action-btn outlined"
                    onClick={() => handleHqAlertCTA(cta)}
                  >
                    <span>{cta.label}</span>
                    <KeyboardArrowRight sx={{ fontSize: 15 }}/>
                  </button>
                ))}
              </div>

              {/* Timestamp */}
              {hqAlertPanel.timestamp && (
                <div className="dp-timestamp">
                  <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                  <span>Just now</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══ Broadcast Analytics — Rich Right-Side Detail Panel (mirrors District Intelligence) ═══ */}
      {bcaSelectedBroadcast && (
        <>
          <div className="detail-panel-overlay" onClick={closeBcaPanel} />
          <div className="detail-panel">
            <div className="dp-hero-header">
              <div className="dp-hero-top">
                <div className="dp-hero-icon" style={{ background: '#fce7f3', color: '#9d174d' }}>
                  <CampaignOutlined sx={{ fontSize: 16 }}/>
                </div>
                <span className="dp-hero-type">{bcaSelectedBroadcast.type?.toUpperCase()}</span>
                <button className="dp-hero-close" onClick={closeBcaPanel}>
                  <CloseOutlined sx={{ fontSize: 17 }}/>
                </button>
              </div>
              <h2 className="dp-hero-title">{bcaSelectedBroadcast.name}</h2>
              <div className="dp-hero-pills">
                <span className="dp-hero-pill" style={bcaSelectedBroadcast.priority === 'high' ? { background: '#fee2e2', color: '#b91c1c' } : bcaSelectedBroadcast.priority === 'medium' ? { background: '#fef3c7', color: '#92400e' } : { background: '#dbeafe', color: '#1d4ed8' }}>
                  {bcaSelectedBroadcast.priority.charAt(0).toUpperCase() + bcaSelectedBroadcast.priority.slice(1)} Priority
                </span>
                <span className="dp-hero-pill" style={{ background: '#f1f5f9', color: '#475569' }}>
                  {bcaSelectedBroadcast.ackedDistricts}/{bcaSelectedBroadcast.districts} districts ack'd
                </span>
              </div>
            </div>
            <div className="detail-panel-body">
              <div className="dp-title-block">
                <p className="dp-description">
                  Sent {bcaSelectedBroadcast.sentAt} · Avg ack time: {bcaSelectedBroadcast.avgAckTime}
                </p>
              </div>

              {/* Impact Summary — only when at-risk */}
              {bcaSelectedBroadcast.status === 'at-risk' && (
                <div className="dp-impact-summary">
                  <ErrorOutlined sx={{ fontSize: 14 }}/>
                  <span>
                    {bcaSelectedBroadcast.districts - bcaSelectedBroadcast.ackedDistricts} districts still pending · {bcaSelectedBroadcast.ackRate}% ack rate — needs follow-up to meet compliance target
                  </span>
                </div>
              )}

              {/* District-Level Compliance Table */}
              <div className="dp-section">
                <h3 className="dp-section-title">
                  <StoreOutlined sx={{ fontSize: 14 }}/>
                  District-Level Compliance
                </h3>
                <div className="bca-panel-table-wrapper">
                  <table className="bca-panel-table wow-table">
                    <thead>
                      <tr>
                        <th>District</th>
                        <th>Status</th>
                        <th>Ack Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getBroadcastDistrictCompliance(bcaSelectedBroadcast).map(d => (
                        <tr
                          key={d.districtId}
                          className="bca-panel-table-row"
                          onClick={() => { closeBcaPanel(); navigate(`/store-operations/district-intelligence?district=${d.districtId}`); }}
                        >
                          <td>
                            <div className="bca-panel-store-name">{d.district}</div>
                            <span className="bca-panel-store-id">#{d.districtId}</span>
                          </td>
                          <td>
                            <span className={`bca-panel-ack-badge ${d.acknowledged ? 'acked' : 'pending'}`}>
                              {d.acknowledged ? 'Acknowledged' : 'Pending'}
                            </span>
                          </td>
                          <td className="bca-panel-td-time">{d.acknowledged ? d.avgTime : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Smart Insights */}
              <div className="dp-section">
                <h3 className="dp-section-title">
                  <AutoAwesomeOutlined sx={{ fontSize: 14 }}/>
                  Smart Insights
                </h3>
                <div className="dp-stores-list">
                  {HQ_BROADCAST_INSIGHTS.map((insight, idx) => (
                    <div key={idx} className="dp-store-card info">
                      <div className="dp-store-header">
                        <span className="dp-store-name" style={{ fontSize: 'var(--ia-text-xs)' }}>
                          <ShowChartOutlined sx={{ fontSize: 12 }} style={{ marginRight: 6, verticalAlign: 'middle' }}/>
                          Pattern
                        </span>
                      </div>
                      <p className="dp-store-detail">{insight.pattern}</p>
                      <div className="dp-store-header" style={{ marginTop: 8 }}>
                        <span className="dp-store-name" style={{ fontSize: 'var(--ia-text-xs)', color: 'var(--ia-color-primary-pressed)' }}>
                          <AutoAwesomeOutlined sx={{ fontSize: 12 }} style={{ marginRight: 6, verticalAlign: 'middle' }}/>
                          Recommendation
                        </span>
                      </div>
                      <p className="dp-store-detail" style={{ color: '#6d28d9', fontStyle: 'italic' }}>{insight.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTAs */}
              <div className="dp-actions">
                <button className="dp-action-btn outlined" onClick={() => { const bc = bcaSelectedBroadcast; closeBcaPanel(); showToast(`Nudge sent to ${bc.districts - bc.ackedDistricts} pending districts`); }}>
                  <SendOutlined sx={{ fontSize: 14 }}/>
                  <span>Send Nudge</span>
                </button>
                <button className="dp-action-btn outlined" onClick={() => { const bc = bcaSelectedBroadcast; closeBcaPanel(); showToast(`Follow-up assigned for "${bc.name}"`); }}>
                  <AssignmentTurnedInOutlined sx={{ fontSize: 14 }}/>
                  <span>Assign Follow-up</span>
                </button>
                <button className="dp-action-btn outlined" onClick={() => { const bc = bcaSelectedBroadcast; closeBcaPanel(); showToast(`Escalated "${bc.name}" to Regional`); }}>
                  <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                  <span>Escalate</span>
                </button>
              </div>

              {/* Timestamp */}
              <div className="dp-timestamp">
                <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                <span>Sent {bcaSelectedBroadcast.sentAt}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ Create Broadcast Wizard (mirrors District Intelligence) ═══ */}
      {showBroadcastWizard && (() => {
        const totalDistricts = MOCK_DISTRICTS.length;
        const recipientCount =
          bwAudience === 'all-districts' ? totalDistricts :
          bwAudience === 'specific-districts' ? bwSelectedDistrictIds.length :
          bwSelectedManagerIds.length;
        const canAdvanceStep1 =
          bwAudience === 'all-districts' ||
          (bwAudience === 'specific-districts' && bwSelectedDistrictIds.length > 0) ||
          (bwAudience === 'managers' && bwSelectedManagerIds.length > 0);
        const canSend = bwSubject.trim().length > 0 && bwMessage.trim().length > 0 && recipientCount > 0;
        const audienceLabel =
          bwAudience === 'all-districts' ? `All Districts (${totalDistricts})` :
          bwAudience === 'specific-districts' ? `${bwSelectedDistrictIds.length} Specific District${bwSelectedDistrictIds.length === 1 ? '' : 's'}` :
          `${bwSelectedManagerIds.length} District Manager${bwSelectedManagerIds.length === 1 ? '' : 's'}`;

        return (
          <div className="bw-overlay" onClick={() => !bwSending && setShowBroadcastWizard(false)}>
            <div className="bw-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bw-header">
                <div className="bw-header-icon">
                  <CampaignOutlined sx={{ fontSize: 18 }}/>
                </div>
                <div className="bw-header-text">
                  <h2>Create Broadcast</h2>
                  <p>Send a broadcast to selected districts or managers across the network</p>
                </div>
                <button className="bw-close" onClick={() => !bwSending && setShowBroadcastWizard(false)} aria-label="Close">
                  <CloseOutlined sx={{ fontSize: 16 }}/>
                </button>
              </div>

              <div className="bw-stepper">
                {[
                  { n: 1, label: 'Audience' },
                  { n: 2, label: 'Message' },
                  { n: 3, label: 'Review & Send' },
                ].map((s, i, arr) => (
                  <React.Fragment key={s.n}>
                    <div className={`bw-step ${bwStep === s.n ? 'active' : ''} ${bwStep > s.n ? 'done' : ''}`}>
                      <div className="bw-step-dot">{bwStep > s.n ? <Check sx={{ fontSize: 12 }}/> : s.n}</div>
                      <span className="bw-step-label">{s.label}</span>
                    </div>
                    {i < arr.length - 1 && <div className={`bw-step-connector ${bwStep > s.n ? 'done' : ''}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="bw-body">
                {/* Step 1: Audience */}
                {bwStep === 1 && (
                  <div className="bw-step-content">
                    <div className="bw-field-label bw-field-label--section">Who should receive this broadcast?</div>
                    <div className="bw-audience-options">
                      {([
                        { id: 'all-districts', icon: <LanguageOutlined sx={{ fontSize: 16 }}/>, title: `All Districts (${totalDistricts})`, desc: 'Reaches every district and all their stores' },
                        { id: 'specific-districts', icon: <FilterListOutlined sx={{ fontSize: 16 }}/>, title: 'Specific Districts', desc: 'Pick one or more districts from the network' },
                        { id: 'managers', icon: <GroupOutlined sx={{ fontSize: 16 }}/>, title: 'District Managers Only', desc: 'Send directly to selected District Managers' },
                      ] as const).map(opt => (
                        <div key={opt.id} className={`bw-audience-card ${bwAudience === opt.id ? 'selected' : ''}`} onClick={() => setBwAudience(opt.id)}>
                          <div className={`bw-audience-icon-wrap ${bwAudience === opt.id ? 'active' : ''}`}>{opt.icon}</div>
                          <div className="bw-audience-body">
                            <div className="bw-audience-title">{opt.title}</div>
                            <div className="bw-audience-desc">{opt.desc}</div>
                          </div>
                          <div className={`bw-audience-radio-outer ${bwAudience === opt.id ? 'active' : ''}`}>
                            {bwAudience === opt.id && <div className="bw-audience-dot" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    {bwAudience === 'specific-districts' && (
                      <div className="bw-selector">
                        <div className="bw-selector-header">
                          <span className="bw-selector-title">Select districts <span className="bw-selector-count">{bwSelectedDistrictIds.length}/{totalDistricts}</span></span>
                          <button className="bw-selector-toggle" onClick={() =>
                            setBwSelectedDistrictIds(bwSelectedDistrictIds.length === totalDistricts ? [] : MOCK_DISTRICTS.map(d => d.id))
                          }>{bwSelectedDistrictIds.length === totalDistricts ? 'Clear All' : 'Select All'}</button>
                        </div>
                        <div className="bw-selector-list">
                          {MOCK_DISTRICTS.map(d => {
                            const selected = bwSelectedDistrictIds.includes(d.id);
                            return (
                              <div key={d.id} className={`bw-selector-item ${selected ? 'selected' : ''}`} onClick={() =>
                                setBwSelectedDistrictIds(prev => selected ? prev.filter(id => id !== d.id) : [...prev, d.id])
                              }>
                                <div className="bw-selector-avatar bw-selector-avatar--store"><LanguageOutlined sx={{ fontSize: 13 }}/></div>
                                <div className="bw-selector-item-body">
                                  <span className="bw-selector-item-title">{d.name}</span>
                                  <div className="bw-selector-item-meta">
                                    <span className="bw-selector-tag">DPI {d.dpi}</span>
                                    <span className={`bw-selector-tag bw-selector-tag--risk-${d.riskLevel}`}>{d.riskLevel} risk</span>
                                  </div>
                                </div>
                                <div className={`bw-checkbox ${selected ? 'checked' : ''}`}>{selected && <Check sx={{ fontSize: 11 }}/>}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {bwAudience === 'managers' && (
                      <div className="bw-selector">
                        <div className="bw-selector-header">
                          <span className="bw-selector-title">Select managers <span className="bw-selector-count">{bwSelectedManagerIds.length}/{totalDistricts}</span></span>
                          <button className="bw-selector-toggle" onClick={() =>
                            setBwSelectedManagerIds(bwSelectedManagerIds.length === totalDistricts ? [] : MOCK_DISTRICTS.map(d => d.id))
                          }>{bwSelectedManagerIds.length === totalDistricts ? 'Clear All' : 'Select All'}</button>
                        </div>
                        <div className="bw-selector-list">
                          {MOCK_DISTRICTS.map(d => {
                            const selected = bwSelectedManagerIds.includes(d.id);
                            const initials = d.dm.split(' ').map((n: string) => n[0]).join('').slice(0,2);
                            return (
                              <div key={d.id} className={`bw-selector-item ${selected ? 'selected' : ''}`} onClick={() =>
                                setBwSelectedManagerIds(prev => selected ? prev.filter(id => id !== d.id) : [...prev, d.id])
                              }>
                                <div className="bw-selector-avatar bw-selector-avatar--person">{initials}</div>
                                <div className="bw-selector-item-body">
                                  <span className="bw-selector-item-title">{d.dm}</span>
                                  <div className="bw-selector-item-meta">
                                    <span className="bw-selector-tag">{d.name}</span>
                                  </div>
                                </div>
                                <div className={`bw-checkbox ${selected ? 'checked' : ''}`}>{selected && <Check sx={{ fontSize: 11 }}/>}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Message */}
                {bwStep === 2 && (
                  <div className="bw-step-content">

                    {/* ── Core message card ── */}
                    <div className="bw-form-card">
                      <div className="bw-form-card-label">Message Details</div>
                      <div className="bw-form-card-body">
                      <div className="bw-grid-2">
                        <div className="bw-field">
                          <label className="bw-field-label">Category</label>
                          <div className="bw-ia-select-wrap">
                            <ImFilterSelect
                              value={bwCategory}
                              options={[
                                { value: 'Operations', label: 'Operations' },
                                { value: 'Safety', label: 'Safety' },
                                { value: 'Compliance', label: 'Compliance' },
                                { value: 'Announcement', label: 'Announcement' },
                              ]}
                              onChange={v => v && setBwCategory(v as typeof bwCategory)}
                              isClearable={false}
                            />
                          </div>
                        </div>
                        <div className="bw-field">
                          <label className="bw-field-label">Priority</label>
                          <div className={`bw-ia-select-wrap bw-priority-wrap bw-priority-wrap--${bwPriority.toLowerCase()}`}>
                            <span className={`bw-priority-dot bw-priority-dot--${bwPriority.toLowerCase()}`} />
                            <ImFilterSelect
                              value={bwPriority}
                              options={[
                                { value: 'Normal', label: 'Normal' },
                                { value: 'Important', label: 'Important' },
                                { value: 'Urgent', label: 'Urgent' },
                              ]}
                              onChange={v => v && setBwPriority(v as typeof bwPriority)}
                              isClearable={false}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bw-field">
                        <label className="bw-field-label">Subject <span className="bw-required">*</span></label>
                        <input className="bw-input" type="text" placeholder="e.g., Holiday execution standards — action required" value={bwSubject} onChange={e => setBwSubject(e.target.value)} maxLength={120} />
                        <div className="bw-field-hint">{bwSubject.length}/120</div>
                      </div>

                      <div className="bw-field">
                        <label className="bw-field-label">Message <span className="bw-required">*</span></label>
                        <textarea className="bw-textarea" rows={5} placeholder="Type your broadcast message here…" value={bwMessage} onChange={(e) => setBwMessage(e.target.value)} maxLength={1000} />
                        <div className="bw-field-hint">{bwMessage.length}/1000</div>
                      </div>
                      </div>{/* /bw-form-card-body */}
                    </div>

                    {/* ── Optional extras card ── */}
                    <div className="bw-form-card bw-form-card--optional">
                      <div className="bw-form-card-label">Optional Extras</div>
                      <div className="bw-form-card-body">

                      <div className="bw-field">
                        <div className="bw-field-row-header">
                          <label className="bw-field-label">Key Dates</label>
                          <button type="button" className="bw-add-btn" onClick={() => setBwKeyDates(prev => [...prev, {label: '', date: ''}])}>+ Add Date</button>
                        </div>
                        <div className="bw-dates-list">
                          {bwKeyDates.map((kd, i) => (
                            <div key={i} className="bw-date-item-wrap">
                              <div className="bw-date-row">
                                <input className="bw-input bw-date-label-input" placeholder="Label (e.g. Deadline)" value={kd.label} onChange={e => setBwKeyDates(prev => prev.map((d, j) => j === i ? {...d, label: e.target.value} : d))} />
                                <div className="bw-date-sep" />
                                <input className="bw-input bw-date-input" type="date" value={kd.date} onChange={e => setBwKeyDates(prev => prev.map((d, j) => j === i ? {...d, date: e.target.value} : d))} />
                              </div>
                              {bwKeyDates.length > 1 && (
                                <button type="button" className="bw-remove-btn" onClick={() => setBwKeyDates(prev => prev.filter((_, j) => j !== i))}>
                                  <CloseOutlined sx={{ fontSize: 13 }}/>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bw-field">
                        <div className="bw-field-row-header">
                          <label className="bw-field-label">Required Actions</label>
                          <button type="button" className="bw-add-btn" onClick={() => setBwRequiredActions(prev => [...prev, ''])}>+ Add Action</button>
                        </div>
                        <div className="bw-actions-list">
                          {bwRequiredActions.map((action, i) => (
                            <div key={i} className="bw-action-row">
                              <div className="bw-action-bullet" />
                              <input className="bw-input bw-action-input" placeholder={`Action ${i + 1} (e.g. Confirm team availability)`} value={action} onChange={e => setBwRequiredActions(prev => prev.map((a, j) => j === i ? e.target.value : a))} />
                              {bwRequiredActions.length > 1 && (
                                <button type="button" className="bw-remove-btn" onClick={() => setBwRequiredActions(prev => prev.filter((_, j) => j !== i))}>
                                  <CloseOutlined sx={{ fontSize: 13 }}/>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bw-field">
                        <label className="bw-field-label">Attachments</label>
                        <label className="bw-attach-zone">
                          <input type="file" multiple style={{display:'none'}} onChange={e => {
                            const files = Array.from(e.target.files || []);
                            setBwAttachments(prev => [...prev, ...files.map(f => ({
                              name: f.name,
                              size: f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} MB` : `${Math.round(f.size/1024)} KB`,
                              type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
                            }))]);
                            e.target.value = '';
                          }} />
                          <div className="bw-attach-zone-icon"><AttachFileOutlined sx={{ fontSize: 20 }}/></div>
                          <span>Click to attach files</span>
                          <span className="bw-attach-hint">PDF, PNG, XLSX, DOCX · up to 25 MB each</span>
                        </label>
                        {bwAttachments.length > 0 && (
                          <div className="bw-attach-list">
                            {bwAttachments.map((a, i) => (
                              <div key={i} className="bw-attach-item">
                                <span className="bw-attach-type">{a.type}</span>
                                <div className="bw-attach-info">
                                  <span className="bw-attach-name">{a.name}</span>
                                  <span className="bw-attach-size">{a.size}</span>
                                </div>
                                <button type="button" className="bw-remove-btn" onClick={() => setBwAttachments(prev => prev.filter((_, j) => j !== i))}>
                                  <CloseOutlined sx={{ fontSize: 13 }}/>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      </div>{/* /bw-form-card-body */}
                    </div>

                  </div>
                )}

                {/* Step 3: Review */}
                {bwStep === 3 && (
                  <div className="bw-step-content">
                    <div className="bw-review">
                      <div className="bw-review-row">
                        <span className="bw-review-label">Audience</span>
                        <span className="bw-review-value">{audienceLabel}</span>
                      </div>
                      <div className="bw-review-row">
                        <span className="bw-review-label">Recipients</span>
                        <span className="bw-review-value"><strong>{recipientCount}</strong> {bwAudience === 'managers' ? 'manager(s)' : 'district(s)'}</span>
                      </div>
                      <div className="bw-review-row">
                        <span className="bw-review-label">Category</span>
                        <span className="bw-review-value">{bwCategory}</span>
                      </div>
                      <div className="bw-review-row">
                        <span className="bw-review-label">Priority</span>
                        <span className={`bw-review-priority bw-chip--${bwPriority.toLowerCase()}`}>{bwPriority}</span>
                      </div>
                      <div className="bw-review-row bw-review-row--stacked">
                        <span className="bw-review-label">Subject</span>
                        <span className="bw-review-value">{bwSubject || <em className="bw-review-empty">(not set)</em>}</span>
                      </div>
                      <div className="bw-review-row bw-review-row--stacked">
                        <span className="bw-review-label">Message</span>
                        <div className="bw-review-body">{bwMessage || <em className="bw-review-empty">(not set)</em>}</div>
                      </div>
                      {bwKeyDates.some(kd => kd.label || kd.date) && (
                        <div className="bw-review-row bw-review-row--stacked">
                          <span className="bw-review-label">Key Dates</span>
                          <div className="bw-review-dates">
                            {bwKeyDates.filter(kd => kd.label || kd.date).map((kd, i) => (
                              <div key={i} className="bw-review-date-row">
                                <span>{kd.label || '—'}</span>
                                <strong>{kd.date ? new Date(kd.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '—'}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {bwRequiredActions.some(a => a.trim()) && (
                        <div className="bw-review-row bw-review-row--stacked">
                          <span className="bw-review-label">Required Actions ({bwRequiredActions.filter(a => a.trim()).length})</span>
                          <div className="bw-review-actions">
                            {bwRequiredActions.filter(a => a.trim()).map((a, i) => (
                              <div key={i} className="bw-review-action-item">
                                <div className="bw-review-action-dot" />{a}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {bwAttachments.length > 0 && (
                        <div className="bw-review-row bw-review-row--stacked">
                          <span className="bw-review-label">Attachments ({bwAttachments.length})</span>
                          <div className="bw-review-attachments">
                            {bwAttachments.map((a, i) => (
                              <div key={i} className="bw-attach-item bw-attach-item--review">
                                <span className="bw-attach-type">{a.type}</span>
                                <span className="bw-attach-name">{a.name}</span>
                                <span className="bw-attach-size">{a.size}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bw-footer">
                <div className="bw-footer-meta">
                  {recipientCount > 0 && <><GroupOutlined sx={{ fontSize: 13 }}/> Will reach <strong>{recipientCount}</strong> recipient{recipientCount === 1 ? '' : 's'}</>}
                </div>
                <div className="bw-footer-actions">
                  {bwStep > 1 && (
                    <Button variant="outlined" color="primary" size="large" onClick={() => setBwStep((bwStep - 1) as 1 | 2 | 3)} disabled={bwSending}>Back</Button>
                  )}
                  {bwStep < 3 && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => setBwStep((bwStep + 1) as 1 | 2 | 3)}
                      disabled={bwStep === 1 ? !canAdvanceStep1 : !(bwSubject.trim() && bwMessage.trim())}
                      endIcon={<KeyboardArrowRight sx={{ fontSize: 14 }}/>}
                    >Continue</Button>
                  )}
                  {bwStep === 3 && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={!canSend || bwSending}
                      startIcon={bwSending ? undefined : <SendOutlined sx={{ fontSize: 14 }}/>}
                      onClick={() => {
                        setBwSending(true);
                        setTimeout(() => {
                          setShowBroadcastWizard(false);
                          setBwSending(false);
                          showToast(`✓ Broadcast sent to ${recipientCount} ${bwAudience === 'managers' ? 'manager(s)' : 'district(s)'}`);
                        }, 1000);
                      }}
                    >
                      {bwSending ? 'Sending…' : 'Send Broadcast'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast */}
      {toastMessage && (
        <div className="hq-toast hq-toast--broadcast">
          <SendOutlined sx={{ fontSize: 14 }}/>
          {toastMessage}
        </div>
      )}

      {/* NEAC Drawer */}
      {neacDrawer && (
        <>
          <div className="eac2-drawer-overlay" onClick={() => setNeacDrawer(null)}/>
          <div className="eac2-drawer">
            {/* ── Hero header ── */}
            <div className="eac2-drawer-header">
              <div className="eac2-drawer-hero-top">
                <div className="eac2-drawer-hero-id">
                  <div className={`eac2-drawer-header-icon eac2-drawer-header-icon--${neacDrawer.type}`}>
                    {neacDrawer.type === 'boh'     && <SyncOutlined sx={{ fontSize: 16 }}/>}
                    {neacDrawer.type === 'phantom' && <InventoryOutlined sx={{ fontSize: 16 }}/>}
                    {neacDrawer.type === 'pog'     && <GridOnOutlined sx={{ fontSize: 16 }}/>}
                  </div>
                  <span className="eac2-drawer-type">{neacDrawer.taskType} · Network</span>
                </div>
                <button className="eac2-drawer-close" onClick={() => setNeacDrawer(null)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
              <h2 className="eac2-drawer-title">{neacDrawer.title}</h2>
              <div className="eac2-drawer-hero-pills">
                <span className={`eac2-drawer-pill eac2-drawer-pill--${neacDrawer.severityClass}`}>{neacDrawer.severity} Severity</span>
                <span className="eac2-drawer-pill eac2-drawer-pill--auto">⚡ Auto-Monitored</span>
                <span className="eac2-drawer-pill eac2-drawer-pill--stores">{neacDrawer.regionCount}R · {neacDrawer.districtCount}D · {neacDrawer.storeCount} stores</span>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="eac2-drawer-body">
              {/* Issue Summary block */}
              <div className="eac2-drawer-block">
                <div className="eac2-drawer-block-label">
                  <WarningAmberOutlined sx={{ fontSize: 11 }}/> Network Summary
                </div>
                <div className={`eac2-drawer-risk-banner eac2-drawer-risk-banner--${neacDrawer.severityClass}`}>
                  <WarningAmberOutlined sx={{ fontSize: 15 }} className="eac2-drawer-risk-banner-icon"/>
                  <div>
                    <p className="eac2-drawer-risk-title">{neacDrawer.skuCount} SKUs · {neacDrawer.riskValue} at risk · {neacDrawer.taskCompletion}% completion</p>
                    <p className="eac2-drawer-risk-desc">{neacDrawer.desc}</p>
                  </div>
                </div>
              </div>

              {/* Task Status block */}
              <div className="eac2-drawer-block">
                <div className="eac2-drawer-block-label">
                  <TaskAltOutlined sx={{ fontSize: 11 }}/> Auto-Created Task Status · {neacDrawer.taskTotal} total
                </div>
                <div className="eac2-drawer-stats">
                  {[
                    { val: neacDrawer.taskOpen, lbl: 'Open' },
                    { val: neacDrawer.taskProg, lbl: 'In Progress' },
                    { val: neacDrawer.taskSub,  lbl: 'Submitted' },
                    { val: neacDrawer.taskOver, lbl: 'Overdue' },
                  ].map(s => (
                    <div key={s.lbl} className="eac2-drawer-stat-tile">
                      <span className="eac2-drawer-stat-val">{s.val}</span>
                      <span className="eac2-drawer-stat-lbl">{s.lbl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impacted Regions block */}
              <div className="eac2-drawer-block">
                <div className="eac2-drawer-block-label">
                  <GroupOutlined sx={{ fontSize: 11 }}/> Impacted Regions ({neacDrawer.entities.length})
                </div>
                <div className="eac2-entity-list">
                  {neacDrawer.entities.map((e, i) => (
                    <div key={i} className={`eac2-entity-card eac2-entity-card--${e.status}`}>
                      <div className="eac2-entity-header">
                        <span className="eac2-entity-name">{e.name}</span>
                        <span className={`eac2-entity-status-badge eac2-entity-status-badge--${e.status}`}>
                          {e.status === 'critical' ? 'At Risk' : e.status === 'progress' ? 'In Progress' : 'On Track'}
                        </span>
                      </div>
                      <div className="eac2-entity-detail">{e.detail}</div>
                      <div className="eac2-entity-manager">
                        <PersonOutlined sx={{ fontSize: 12 }}/> Regional DM: <strong>{e.dm}</strong>
                      </div>
                      <div className="eac2-entity-task-row">
                        <span className="eac2-entity-task-info">
                          <TaskAltOutlined sx={{ fontSize: 12 }}/> {e.tasks} task{e.tasks > 1 ? 's' : ''}
                        </span>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          endIcon={<KeyboardArrowRight sx={{ fontSize: 12 }}/>}
                          onClick={() => {
                            setNeacDrawer(null);
                            navigate('/command-center/operations-queue', {
                              state: {
                                prefillFromAlert: {
                                  alertId: `${neacDrawer.id}-${e.name.replace(/\s+/g, '-').toLowerCase()}`,
                                  title: `${neacDrawer.title} — ${e.name}`,
                                  description: e.detail,
                                  severity: neacDrawer.severity === 'High' ? 'critical' : 'warning',
                                  source: 'Automated Execution Alert',
                                  stores: [{ name: e.name, manager: e.dm, detail: e.detail }],
                                },
                              },
                            });
                          }}
                        >
                          View Districts
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
                  setNeacDrawer(null);
                  navigate('/command-center/operations-queue', {
                    state: {
                      prefillFromAlert: {
                        alertId: neacDrawer.id,
                        title: `[HQ] ${neacDrawer.title}`,
                        description: `${neacDrawer.taskType}: ${neacDrawer.desc}`,
                        severity: neacDrawer.severity === 'High' ? 'critical' : 'warning',
                        source: 'Automated Execution Alert',
                        stores: neacDrawer.entities.map(en => ({ name: en.name, manager: en.dm, detail: en.detail })),
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
                onClick={() => setNeacDrawer(null)}
              >
                Close
              </Button>
            </div>
            <div className="eac2-drawer-timestamp">
              <AccessTimeOutlined sx={{ fontSize: 12 }}/> Last detected {neacDrawer.lastDetected} · Auto-assigned to District Managers
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
                  text="Good morning, Elena. The network delivered 5.2 million in weekly revenue this week at plus 3.1 percent versus plan, plus 2.4 percent versus last year, and plus 2.9 percent on a net-comp basis — the third consecutive positive net-comp week, the best run since Q3 last year. Network gross margin at 34.1 percent, 0.6 points above the Q1 plan target. Network conversion improved to 23.8 percent, up 0.6 points year over year. Average basket size up 3.8 percent to 57.90. The Southeast drove the outperformance, led by District 14 Tennessee at DPI 87 national rank number 2, and District 19 Alabama at DPI 88 national number 1. Warm weather across the Southeast and graduation season in 14 metro markets contributed an estimated 180 thousand in weather uplift and 64 thousand from graduation traffic — the latter was not in the AI forecast model. Women's Division leads at plus 9.4 percent versus plan, driven by Dresses up 17 percent and Blazers up 11 percent in stores with complete floorsets. Accessories is the one network miss at minus 2.8 percent versus plan — an Endcap facing compliance issue at 18 of 22 districts. A single broadcast requiring the 6-facing reset would recover an estimated 28 thousand per week. Kids Party Dress has a national size-run gap in XS and 4T affecting 14 of 22 districts — a national DC assortment request is the right fix, not store-by-store escalations. Safety: fire exit obstruction at Johnson City Mall is a zero-tolerance regulatory exposure — escalate to Regional if not resolved by noon. Top HQ priorities this week: issue the Accessories Endcap broadcast today, submit the Kids DC assortment correction, draft the District 22 staff retention policy for Regional review, and begin codifying the District 14 execution playbook. The network is in the best financial position in 3 quarters — the execution gap is the only thing standing between here and a top-quartile result."
                  title="AI Daily Brief"
                  variant="card"
                  onClose={() => setShowBriefAudio(false)}
                />
              </div>
            )}
            <div className="brief-modal-content">
              {aiBriefContent}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Detail Modal */}
      {selectedBroadcast && (
        <div className="hq-modal-overlay" onClick={closeBroadcastModal}>
          <div className="hq-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="hq-modal-close" onClick={closeBroadcastModal}>
              <CloseOutlined sx={{ fontSize: 18 }}/>
            </button>

            <div className="hq-modal-badges">
              <span className={`hq-modal-badge hq-modal-badge--${selectedBroadcast.type === 'critical' ? 'high' : 'info'}`}>
                {selectedBroadcast.type === 'critical' ? 'HIGH' : 'INFO'}
              </span>
              <span className="hq-modal-badge hq-modal-badge--category">
                {selectedBroadcast.category.toUpperCase()}
              </span>
            </div>

            <h2 className="hq-modal-title">{selectedBroadcast.title}</h2>
            <p className="hq-modal-desc">{selectedBroadcast.description}</p>

            <div className="hq-modal-meta">
              <div className="hq-modal-meta-item">
                <GroupOutlined sx={{ fontSize: 14 }}/>
                <span>{selectedBroadcast.sender}</span>
              </div>
              <div className="hq-modal-meta-item">
                <AccessTimeOutlined sx={{ fontSize: 14 }}/>
                <span>{selectedBroadcast.timeSent}</span>
              </div>
            </div>

            <div className="hq-modal-actions">
              <Button variant="outlined" color="primary" className="hq-modal-btn hq-modal-btn--secondary" onClick={() => { closeBroadcastModal(); navigate('/command-center/communications'); }} startIcon={<ChatOutlined sx={{ fontSize: 16 }}/>}>
                Chat
              </Button>
              <Button variant="contained" color="primary" className="hq-modal-btn hq-modal-btn--primary" onClick={handleMarkAsRead} startIcon={<Check sx={{ fontSize: 16 }}/>}>
                Mark as Read
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

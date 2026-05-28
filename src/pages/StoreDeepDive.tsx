import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AIDailyBrief, AIDailyBriefData } from '../components/common/AIDailyBrief';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import Remove from '@mui/icons-material/Remove';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import ChatOutlined from '@mui/icons-material/ChatOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import NorthEast from '@mui/icons-material/NorthEast';
import SouthEast from '@mui/icons-material/SouthEast';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import GridOnOutlined from '@mui/icons-material/GridOnOutlined';
import ThumbUpOutlined from '@mui/icons-material/ThumbUpOutlined';
import SentimentSatisfiedOutlined from '@mui/icons-material/SentimentSatisfiedOutlined';
import SentimentNeutralOutlined from '@mui/icons-material/SentimentNeutralOutlined';
import SentimentVeryDissatisfiedOutlined from '@mui/icons-material/SentimentVeryDissatisfiedOutlined';
import CrisisAlert from '@mui/icons-material/CrisisAlert';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import Check from '@mui/icons-material/Check';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Card, Tabs } from 'impact-ui';
import './StoreDeepDive.css';

// Import localized planogram image
import LocalizedWomensWall from '../assets/localized_C&A_WOMENS_WALL_STANDARD.png';

// Custom Dropdown Component for premium styling
interface DropdownOption {
  value: string;
  label: string;
}

interface PremiumDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const PremiumDropdown: React.FC<PremiumDropdownProps> = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="premium-dropdown" ref={dropdownRef}>
      <button 
        className={`premium-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className={value ? 'has-value' : ''}>{selectedOption?.label || placeholder || options[0]?.label}</span>
        <KeyboardArrowDown sx={{ fontSize: 14 }} className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`}/>
      </button>
      {isOpen && (
        <div className="premium-dropdown-menu">
          {options.map((option) => (
            <button
              key={option.value}
              className={`premium-dropdown-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              <span>{option.label}</span>
              {value === option.value && <Check sx={{ fontSize: 16 }} className="check-icon"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Types
type SPITier = 'Excellence' | 'Stable' | 'AtRisk' | 'Crisis';
type MomentumType = 'Improving' | 'Slipping' | 'Flat';
type StreamSeverity = 'healthy' | 'warning' | 'critical';
type DiscrepancyClass = 'Silent Risk' | 'Leading Indicator' | 'Imminent Gap' | 'Ground Truth Confirmed' | 'Stable';

interface StoreAction {
  id: string;
  title: string;
  reason: string;
  impactType: 'revenue' | 'compliance' | 'customer' | 'safety' | 'inventory';
  location?: string;
  priority: 'urgent' | 'high' | 'medium';
  cta: string;
}

interface StreamDiagnostic {
  stream: string;
  icon: React.ReactNode;
  primaryIssue: string;
  finding: string;
  variance: string;
  varianceType: 'positive' | 'negative' | 'neutral';
  severity: StreamSeverity;
}

interface KPIData {
  id: string;
  label: string;
  value: string;
  variance: string;
  varianceType: 'positive' | 'negative' | 'neutral';
  secondaryVariance?: string;
  trend: number[];
  tier?: 'excellent' | 'stable' | 'atrisk' | 'critical' | 'warning';
}

// District Stores for Filter
interface DistrictStore {
  id: string;
  storeNumber: string;
  storeName: string;
  format: string;
  cluster: string;
  spi: number;
  spiTier: SPITier;
}

const districtStores: DistrictStore[] = [
  { id: '1', storeNumber: '2034', storeName: 'Downtown Plaza', format: 'Urban Flagship', cluster: 'Urban Flagship', spi: 94, spiTier: 'Excellence' },
  { id: '2', storeNumber: '1876', storeName: 'Riverside Mall', format: 'Mall Anchor', cluster: 'Mall Anchor', spi: 91, spiTier: 'Excellence' },
  { id: '3', storeNumber: '3421', storeName: 'Central Station', format: 'Family Center', cluster: 'Family Center', spi: 85, spiTier: 'Stable' },
  { id: '4', storeNumber: '2198', storeName: 'Westfield Center', format: 'Urban Flagship', cluster: 'Urban Flagship', spi: 82, spiTier: 'Stable' },
  { id: '5', storeNumber: '4532', storeName: 'Harbor View', format: 'Family Center', cluster: 'Family Center', spi: 78, spiTier: 'Stable' },
  { id: '6', storeNumber: '1234', storeName: 'Oak Street', format: 'Outlet Value', cluster: 'Outlet Value', spi: 72, spiTier: 'AtRisk' },
  { id: '7', storeNumber: '5678', storeName: 'Pine Grove', format: 'Family Center', cluster: 'Family Center', spi: 65, spiTier: 'AtRisk' },
  { id: '8', storeNumber: '9012', storeName: 'Maple Heights', format: 'Mall Anchor', cluster: 'Mall Anchor', spi: 58, spiTier: 'Crisis' },
];

// District-level context (shared)
const districtContext = {
  name: 'District 14 — Tennessee',
  totalStores: districtStores.length,
};

// ── Chain-wide comp benchmarking peers (same cluster, multiple districts) ──
// SPIs are set so each D14 store gets a different comp rank vs its district rank,
// making the callout meaningful for every selection.
const CLUSTER_PEERS: Record<string, { storeName: string; district: string; spi: number }[]> = {
  'Urban Flagship': [
    { storeName: 'King Street',      district: 'District 11 — Florida',   spi: 97 },
    { storeName: 'Downtown Plaza',   district: 'District 14 — Tennessee', spi: 94 }, // self
    { storeName: 'Brickell Center',  district: 'District 11 — Florida',   spi: 91 },
    { storeName: 'Peachtree Plaza',  district: 'District 08 — Georgia',   spi: 87 },
    { storeName: 'Westfield Center', district: 'District 14 — Tennessee', spi: 82 }, // self
    { storeName: 'Uptown Walk',      district: 'District 22 — Carolina',  spi: 76 },
  ],
  'Mall Anchor': [
    { storeName: 'Coral Gables',     district: 'District 11 — Florida',   spi: 93 },
    { storeName: 'Riverside Mall',   district: 'District 14 — Tennessee', spi: 91 }, // self
    { storeName: 'Savannah Square',  district: 'District 08 — Georgia',   spi: 86 },
    { storeName: 'Augusta Mall',     district: 'District 08 — Georgia',   spi: 80 },
    { storeName: 'Greensboro Lane',  district: 'District 22 — Carolina',  spi: 74 },
    { storeName: 'Maple Heights',    district: 'District 14 — Tennessee', spi: 58 }, // self
  ],
  'Family Center': [
    { storeName: 'Athens Center',    district: 'District 08 — Georgia',   spi: 90 },
    { storeName: 'Macon Point',      district: 'District 08 — Georgia',   spi: 87 },
    { storeName: 'Central Station',  district: 'District 14 — Tennessee', spi: 85 }, // self
    { storeName: 'Durham Heights',   district: 'District 22 — Carolina',  spi: 81 },
    { storeName: 'Harbor View',      district: 'District 14 — Tennessee', spi: 78 }, // self
    { storeName: 'Chapel Hill',      district: 'District 22 — Carolina',  spi: 71 },
    { storeName: 'Pine Grove',       district: 'District 14 — Tennessee', spi: 65 }, // self
  ],
  'Outlet Value': [
    { storeName: 'Wilmington Bay',   district: 'District 22 — Carolina',  spi: 80 },
    { storeName: 'Asheville Park',   district: 'District 22 — Carolina',  spi: 76 },
    { storeName: 'Oak Street',       district: 'District 14 — Tennessee', spi: 72 }, // self
    { storeName: 'Macon Center',     district: 'District 08 — Georgia',   spi: 68 },
  ],
};

const getCompMetrics = (store: DistrictStore) => {
  const peers = CLUSTER_PEERS[store.cluster] ?? [];
  const sorted = [...peers].sort((a, b) => b.spi - a.spi);
  const compRank = sorted.findIndex(p => p.storeName === store.storeName) + 1 || 1;
  const medianIdx = Math.floor(sorted.length / 2);
  const compMedianSpi = sorted[medianIdx]?.spi ?? store.spi;
  const topPeer = sorted[0] ?? { storeName: store.storeName, district: districtContext.name, spi: store.spi };
  const spiGapToTop = store.spi - topPeer.spi; // negative = behind top peer
  // comp movement: based on tier vs chain median
  const compMovement = store.spi > compMedianSpi + 6 ? 2 : store.spi > compMedianSpi ? 1 : store.spi === compMedianSpi ? 0 : store.spi > compMedianSpi - 6 ? -1 : -2;
  return { compRank, compTotal: sorted.length, clusterName: store.cluster, topPeer, compMedianSpi, spiGapToTop, compMovement };
};

// ── Per-store data getters — everything below is derived from the selected store ──

const getStoreMetrics = (store: DistrictStore) => {
  const tier = store.spiTier;
  const isPositive = tier === 'Excellence' || tier === 'Stable';
  const deltaBase = tier === 'Excellence' ? 2.8 : tier === 'Stable' ? 0.4 : tier === 'AtRisk' ? -2.4 : -5.6;
  const vsDistrict = store.spi - 79; // district avg ~79
  const districtRank = districtStores
    .slice()
    .sort((a, b) => b.spi - a.spi)
    .findIndex(s => s.id === store.id) + 1;
  const comp = getCompMetrics(store);
  return {
    spi: store.spi,
    spiTier: tier,
    momentum: (isPositive ? 'Improving' : tier === 'Crisis' ? 'Slipping' : 'Slipping') as MomentumType,
    momentumDelta: deltaBase,
    vsDistrictAvg: +vsDistrict.toFixed(1),
    districtRank,
    districtTotal: districtStores.length,
    compRank: comp.compRank,
    compTotal: comp.compTotal,
    clusterName: comp.clusterName,
    topPeer: comp.topPeer,
    compMedianSpi: comp.compMedianSpi,
    spiGapToTop: comp.spiGapToTop,
    compMovement: comp.compMovement,
    inboundRiskActive: !isPositive,
    delayedShipments: tier === 'Crisis' ? 4 : tier === 'AtRisk' ? 2 : 0,
    oosRiskSkus: tier === 'Crisis' ? 14 : tier === 'AtRisk' ? 8 : tier === 'Stable' ? 2 : 0,
  };
};

const getStoreActions = (store: DistrictStore): StoreAction[] => {
  const tier = store.spiTier;
  if (tier === 'Excellence') {
    return [
      { id: '1', title: `Share ${store.storeName} playbook with district peers`, reason: 'Top performer on VoC and SEA — codify winning practices', impactType: 'compliance', location: 'Back Office', priority: 'high', cta: 'Create Playbook' },
      { id: '2', title: 'Rotate premium mannequin displays for new drop', reason: 'Seasonal refresh to sustain trend momentum', impactType: 'revenue', location: 'Store Entrance', priority: 'medium', cta: 'View Style Guide' },
      { id: '3', title: 'Coach adjacent stores on staffing model', reason: 'Staff availability scores leading the district', impactType: 'customer', location: 'District-wide', priority: 'medium', cta: 'Schedule Coaching' },
    ];
  }
  if (tier === 'Stable') {
    return [
      { id: '1', title: 'Tighten endcap compliance on Summer Collection', reason: 'Minor POG deviations detected in 2 sections', impactType: 'compliance', location: 'Endcap 4 & 7', priority: 'high', cta: 'Open Visual Audit' },
      { id: '2', title: 'Refresh basics size-runs in Men\'s', reason: 'Size M and L running low on V-Neck Basics', impactType: 'inventory', location: "Men's Basics", priority: 'medium', cta: 'View Stock Levels' },
      { id: '3', title: 'Respond to recent VoC comments', reason: '3 neutral reviews on checkout speed this week', impactType: 'customer', location: 'Front Registers', priority: 'medium', cta: 'View Comments' },
    ];
  }
  if (tier === 'AtRisk') {
    return [
      { id: '1', title: "Fix planogram gap — Women's Wall Display", reason: 'Visual audit detected 8 missing facings in Dresses section, impacting trend items', impactType: 'revenue', location: "Section B, Women's Dresses", priority: 'urgent', cta: 'Open Visual Audit' },
      { id: '2', title: 'Address fitting room availability', reason: 'Customer complaints about fitting room wait times during peak hours', impactType: 'customer', location: 'Fitting Room Area', priority: 'urgent', cta: 'View VoC Details' },
      { id: '3', title: 'Restock size-run gaps in Basics', reason: 'Size M and L depleted in V-Neck Basics, high demand items', impactType: 'inventory', location: "Section D, Women's Basics", priority: 'high', cta: 'View Stock Levels' },
      { id: '4', title: 'Update mannequin styling for new arrivals', reason: 'Current season collection not featured on floor mannequins', impactType: 'revenue', location: 'Store Entrance', priority: 'high', cta: 'View Style Guide' },
      { id: '5', title: 'Review negative checkout experience comments', reason: '4 new comments about long queues during weekend peak', impactType: 'customer', location: 'Front Registers', priority: 'medium', cta: 'View Comments' },
    ];
  }
  // Crisis
  return [
    { id: '1', title: 'Clear fire exit blockage — Zone B', reason: 'Display merchandise obstructing emergency exit — regulatory risk', impactType: 'safety', location: 'Zone B, Rear Exit', priority: 'urgent', cta: 'Dispatch Now' },
    { id: '2', title: 'Expedite replenishment — 14 OOS-risk SKUs', reason: 'Availability at 84% with 4 delayed shipments incoming', impactType: 'inventory', location: 'Backroom', priority: 'urgent', cta: 'Open Inbound' },
    { id: '3', title: 'Deep-clean aisles before opening', reason: '"Messy aisles" VoC theme up 38% in 2 weeks', impactType: 'customer', location: 'All aisles', priority: 'urgent', cta: 'Assign Crew' },
    { id: '4', title: 'Reassign weekend staffing coverage', reason: 'Sat/Sun coverage 22% below optimal', impactType: 'customer', location: 'Front of House', priority: 'high', cta: 'Open Workforce' },
    { id: '5', title: 'Escalate to District Manager', reason: 'SPI decline for 4 consecutive weeks — triggers crisis protocol', impactType: 'compliance', location: 'HQ', priority: 'high', cta: 'Send Escalation' },
  ];
};

const getStoreKPIs = (store: DistrictStore): KPIData[] => {
  const tier = store.spiTier;
  const isGood = tier === 'Excellence' || tier === 'Stable';
  const tierKey = tier === 'Excellence' ? 'good' : tier === 'Stable' ? 'stable' : tier === 'AtRisk' ? 'atrisk' : 'warning';
  const netSales = Math.round(120 + store.spi * 1.8);
  const voc = Math.max(55, Math.min(95, store.spi - 2));
  const sea = Math.max(58, Math.min(97, store.spi + 1));
  const salesVar = +(((store.spi - 79) / 79) * 12).toFixed(1);
  const gm = Math.round((store.spi - 79) * 3);
  const pog = Math.max(60, Math.min(98, store.spi - 4));
  const mk = (base: number, trendDir: 'up' | 'down') => {
    const arr: number[] = [];
    for (let i = 0; i < 7; i++) arr.push(+(base + (trendDir === 'up' ? -6 + i : 6 - i)).toFixed(1));
    return arr;
  };
  return [
    { id: 'sales', label: 'Net Sales Comp', value: `$${netSales}K`, variance: `${isGood ? '+' : ''}${salesVar}%`, varianceType: isGood ? 'positive' : 'negative', secondaryVariance: 'YoY', trend: mk(netSales * 0.5, isGood ? 'up' : 'down'), tier: tierKey as KPIData['tier'] },
    { id: 'voc', label: 'VoC % Satisfied', value: `${voc}%`, variance: `${isGood ? '+' : '-'}${isGood ? 2.8 : 5.1} pts`, varianceType: isGood ? 'positive' : 'negative', secondaryVariance: 'YoY', trend: mk(voc, isGood ? 'up' : 'down'), tier: tierKey as KPIData['tier'] },
    { id: 'sea', label: 'SEA Score', value: `${sea}.4`, variance: `${isGood ? '+' : '-'}${isGood ? 1.6 : 2.8} pts`, varianceType: isGood ? 'positive' : 'negative', secondaryVariance: 'YoY', trend: mk(sea, isGood ? 'up' : 'down'), tier: tierKey as KPIData['tier'] },
    { id: 'salesVar', label: 'Sales $ % Var', value: `${isGood ? '+' : ''}${salesVar}%`, variance: `${isGood ? '+' : '-'}1.4 pp`, varianceType: isGood ? 'positive' : 'negative', secondaryVariance: 'YoY', trend: mk(salesVar, isGood ? 'up' : 'down'), tier: tierKey as KPIData['tier'] },
    { id: 'gm', label: 'GM% bps Var', value: `${gm >= 0 ? '+' : ''}${gm} bps`, variance: `${gm >= 0 ? '+' : ''}${Math.round(gm * 0.6)} bps`, varianceType: gm >= 0 ? 'positive' : 'negative', secondaryVariance: 'YoY', trend: mk(gm, gm >= 0 ? 'up' : 'down'), tier: tierKey as KPIData['tier'] },
    { id: 'pog', label: 'POG Compliance', value: `${pog}%`, variance: `${isGood ? '+' : '-'}${isGood ? 3 : 8}%`, varianceType: isGood ? 'positive' : 'negative', secondaryVariance: 'YoY', trend: mk(pog, isGood ? 'up' : 'down'), tier: tierKey as KPIData['tier'] },
  ];
};

const getStreamDiagnostics = (store: DistrictStore): StreamDiagnostic[] => {
  const tier = store.spiTier;
  if (tier === 'Excellence' || tier === 'Stable') {
    const sev = tier === 'Excellence' ? 'healthy' : 'healthy';
    return [
      { stream: 'Sales', icon: <AttachMoneyOutlined sx={{ fontSize: 16 }}/>, primaryIssue: tier === 'Excellence' ? 'Apparel outperforming' : 'On plan', finding: tier === 'Excellence' ? `${store.storeName} leading district in Women's and Men's` : 'Comp sales tracking plan with minor softness in accessories', variance: `${tier === 'Excellence' ? '+4.2' : '+0.4'}% vs district`, varianceType: 'positive', severity: sev },
      { stream: 'VoC', icon: <ChatOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Positive sentiment', finding: 'Staff helpfulness & cleanliness themes trending positive', variance: `+${tier === 'Excellence' ? 3.1 : 1.2}% vs district`, varianceType: 'positive', severity: sev },
      { stream: 'Visual', icon: <GppGoodOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Compliance on target', finding: 'Planogram and display standards consistently met', variance: `+${tier === 'Excellence' ? 2.4 : 0.8} vs district`, varianceType: 'positive', severity: sev },
      { stream: 'Inventory', icon: <LocalShippingOutlined sx={{ fontSize: 16 }}/>, primaryIssue: tier === 'Excellence' ? 'Availability strong' : 'Minor size-run gaps', finding: tier === 'Excellence' ? 'Availability at 97%, no size-run issues' : '2 SKUs below safety stock — replenishment in flight', variance: tier === 'Excellence' ? 'On track' : '2 styles impacted', varianceType: tier === 'Excellence' ? 'positive' : 'neutral', severity: sev },
      { stream: 'Field Intel', icon: <VisibilityOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'No Active Flags', finding: 'Last visual audit clean, no escalations', variance: 'On track', varianceType: 'neutral', severity: 'healthy' },
    ];
  }
  if (tier === 'AtRisk') {
    return [
      { stream: 'Sales', icon: <AttachMoneyOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Apparel Revenue Decline', finding: "Women's Dresses and Tops underperforming vs plan by 12%", variance: '-3.2% vs district', varianceType: 'negative', severity: 'critical' },
      { stream: 'VoC', icon: <ChatOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Fitting Room Wait', finding: 'Peak hour complaints up 28%, fitting room availability cited', variance: '-5.1% vs district', varianceType: 'negative', severity: 'critical' },
      { stream: 'Visual', icon: <GppGoodOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Display Compliance', finding: 'Mannequin styling outdated, color blocking needs refresh', variance: '-4.8 vs district', varianceType: 'negative', severity: 'warning' },
      { stream: 'Inventory', icon: <LocalShippingOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Size-Run Gaps', finding: '12 SKUs with broken size runs, Basics most affected', variance: '8 styles impacted', varianceType: 'negative', severity: 'warning' },
      { stream: 'Field Intel', icon: <VisibilityOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'No Active Flags', finding: 'Last visual audit 3 days ago, no escalations', variance: 'On track', varianceType: 'neutral', severity: 'healthy' },
    ];
  }
  // Crisis
  return [
    { stream: 'Sales', icon: <AttachMoneyOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Sustained Sales Miss', finding: 'Comp sales -12% for 4 straight weeks, Apparel leading the drop', variance: '-9.1% vs district', varianceType: 'negative', severity: 'critical' },
    { stream: 'VoC', icon: <ChatOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Negative Sentiment Spike', finding: '"Messy aisles" and "staff availability" complaints up 38%', variance: '-8.4% vs district', varianceType: 'negative', severity: 'critical' },
    { stream: 'Visual', icon: <GppGoodOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'SEA Auto-Fail', finding: 'Fire exit blocked in Zone B — regulatory risk', variance: 'Auto-fail triggered', varianceType: 'negative', severity: 'critical' },
    { stream: 'Inventory', icon: <LocalShippingOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'OOS Spike', finding: '14 SKUs out-of-stock, 4 shipments delayed', variance: 'Availability 84%', varianceType: 'negative', severity: 'critical' },
    { stream: 'Field Intel', icon: <VisibilityOutlined sx={{ fontSize: 16 }}/>, primaryIssue: 'Active Escalation', finding: 'DM visit scheduled — 2 open escalations unresolved', variance: '2 flags open', varianceType: 'negative', severity: 'warning' },
  ];
};

const getCrossStreamVerdict = (store: DistrictStore): { discrepancyClass: DiscrepancyClass; assessment: string; recommendedAction: string; urgency: 'low' | 'medium' | 'high' } => {
  const tier = store.spiTier;
  if (tier === 'Excellence') {
    return {
      discrepancyClass: 'Ground Truth Confirmed' as DiscrepancyClass,
      assessment: `${store.storeName} is firing on all cylinders — every diagnostic stream confirms sustained outperformance vs district benchmarks.`,
      recommendedAction: 'Codify the playbook and cascade best practices to peer stores. Protect momentum by pre-empting seasonal transitions.',
      urgency: 'low' as const,
    };
  }
  if (tier === 'Stable') {
    return {
      discrepancyClass: 'Stable' as DiscrepancyClass,
      assessment: `${store.storeName} is tracking plan with no systemic risks. Minor availability gaps are being managed in-flight.`,
      recommendedAction: 'Maintain execution cadence, close minor POG deviations, and monitor VoC for early warning signals.',
      urgency: 'low' as const,
    };
  }
  if (tier === 'AtRisk') {
    return {
      discrepancyClass: 'Leading Indicator' as DiscrepancyClass,
      assessment: "Fitting room wait times are preceding sales decline — customers abandoning purchase decisions due to inability to try on items, particularly in Women's Dresses.",
      recommendedAction: 'Increase fitting room staffing during 11am–3pm peak. Prioritize restocking size-run gaps in Basics to recover conversion rate.',
      urgency: 'high' as const,
    };
  }
  return {
    discrepancyClass: 'Imminent Gap' as DiscrepancyClass,
    assessment: `${store.storeName} is in crisis: SEA auto-fail, VoC spike, and OOS surge are compounding. Sales are already responding — 4-week comp miss accelerating.`,
    recommendedAction: 'Dispatch DM for on-site intervention today. Clear SEA auto-fail before close, expedite top-10 OOS SKUs, and restore baseline staffing.',
    urgency: 'high' as const,
  };
};

// Store-level AI Daily Brief — tier-aware narrative for SPI card companion
const getStoreBrief = (store: DistrictStore): AIDailyBriefData => {
  const tier = store.spiTier;

  if (tier === 'Excellence') {
    return {
      greeting: `${store.storeName} (#${store.storeNumber}) delivered a standout week — SPI ${store.spi}, #1 in the district. Net sales beat plan by $18.4K driven by Summer 2 Floorset execution and favorable weekend weather. Here is your full weekly business recap.`,
      sections: [
        {
          title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
          icon: 'scorecard',
          bullets: [
            '<strong>vs Plan:</strong> Net sales <strong>+8.4% ($18,420 above plan)</strong>. Units sold +6.1%. Gross margin <strong>38.2%</strong> (+0.8pp vs plan target of 37.4%). Markdown rate 10.8% — better than the 12% plan cap.',
            '<strong>vs Last Year (LY):</strong> Net sales <strong>+6.2%</strong>. Traffic up +4.2% YoY. Conversion improved from 26.6% → <strong>28.4%</strong> (+1.8pp). Average basket size up from $59.90 → $62.40 (+4.2% YoY).',
            '<strong>vs AI Forecast:</strong> +5.3% above demand forecast — model was conservative on Dresses given last year\'s weather miss; actual warm weekend delivered the upside.',
            '<strong>vs Comparable Week (52-wk prior):</strong> <strong>+7.8% net-comp</strong> — strong like-for-like performance. District rank: <strong>#1 of 8 stores</strong>. Revenue contribution: 17.8% of total district weekly revenue.',
          ],
        },
        {
          title: 'Traffic & Conversion Analysis',
          icon: 'traffic',
          bullets: [
            'Total transactions: <strong>3,820 this week</strong> (+4.2% YoY). Peak day was Saturday (+22% vs Monday baseline) driven by warm weather and Semi Annual Sale awareness.',
            'Conversion rate: <strong>28.4%</strong> — strongest in the district. Fitting room utilization 74% during 12–3pm with minimal wait times (VoC confirms near-zero queue complaints).',
            'Units per transaction (UPT): <strong>2.8</strong> (+0.3 vs LY). Multi-item basket attach rates improved — the Summer 2 Dress + Accessories cross-sell Endcap setup is working as designed.',
            'Average transaction value (ATV): <strong>$62.40</strong> (+4.2% YoY). Premium SKU attach (Blazer/Midi Dress) higher — items at eyeline per current planogram spec.',
          ],
        },
        {
          title: 'External Context — Weather, Events & Market Factors',
          icon: 'external',
          bullets: [
            '<strong>Weather:</strong> Saturday and Sunday were <strong>3°F above seasonal average</strong> — warm and sunny. Dresses lifted +22% Saturday vs Thursday baseline. Weather-sensitive categories outperformed forecast by 18%. Peer stores without completed floorsets still underperformed despite the same weather — execution was the differentiator.',
            '<strong>Semi Annual Sale:</strong> Estimated <strong>+$9,200 incremental revenue</strong> (AI attribution vs non-sale baseline). Clearance endcap generated 14% of transactions while occupying 8% of floor space.',
            '<strong>Local Events:</strong> High school graduation weekend added an estimated 8–12% Saturday AM foot traffic lift. Formal-adjacent purchases (Blazer, Midi Dress, statement accessories) spiked +31% Saturday vs Tuesday average.',
            'No negative external factors this week — no weather disruptions, no competitive promotions detected in the trade area.',
          ],
        },
        {
          title: 'Product Performance — Division & Department Breakdown',
          icon: 'product',
          bullets: [
            `<strong>Women's Division (+14.2% vs plan):</strong> Division leader. Dresses: +22% — Summer Midi Dress was #1 SKU (98 units, $4,802). Tops/Basics: +8.1%. Accessories: –4.1% — only division below plan (facing count gap on Endcap).`,
            `<strong>Men's Division (+6.8% vs plan):</strong> Denim Slim Fit Dark Wash: 47 units ($2,303). Polo Classic: 38 units. Compression Tee: 29 units (gym-adjacent Saturday traffic).`,
            '<strong>Kids (+3.2% vs plan):</strong> Color Block Tee and Cargo Shorts leading. Kids Party Dress lagging — size-run gaps in XS/4T limiting conversion.',
            '<strong>Footwear (+11.4% vs plan):</strong> Running Shoes Elite: 28 units (#2 overall SKU). Canvas Sneakers: 22 units. Strong category week.',
            '<strong>Accessories (–4.1% vs plan):</strong> Only miss. Endcap at 4 facings vs the 6-facing POG spec — 33% fewer impulse-grab opportunities. Estimated lost revenue: $320–$480 this week. A 20-minute fix.',
          ],
        },
        {
          title: 'Seasonal vs. NOS / Core Performance',
          icon: 'drivers',
          bullets: [
            '<strong>Seasonal (Summer 2): 62% of weekly revenue</strong> — above the 58% plan mix. Full-price sell-through on Summer 2 hero items at 94%. Markdown rate on seasonal items: 4% of seasonal revenue (plan: 8%). No markdown pressure for 2+ more weeks.',
            '<strong>NOS / Core Carry-Over: 38% of revenue.</strong> V-Neck Basics, Classic Tee, and Denim are the NOS engines. Polo Classic and Oxford Shirt above plan. Core items holding 78% sell-through despite the seasonal mix shift.',
            '<strong>Clearance / Sale items:</strong> 12% of units, 8.2% of revenue — below plan markdown rate. Clearance velocity healthy; no over-stacked clearance risk this week.',
          ],
        },
        {
          title: 'What Drove the Week — AI Business Analysis',
          icon: 'drivers',
          bullets: [
            '<strong>Primary driver — Floorset execution × weather:</strong> A fully set Summer 2 floorset + warm weekend weather compounded. Peer stores with partial floorsets averaged $82K lower revenue despite the same weather tailwind — the gap is directly attributable to execution quality.',
            '<strong>Secondary driver — Semi Annual Sale endcap positioning:</strong> Clearance endcap at the high-traffic aisle junction drove 14% transaction share from 8% floor space — maximized conversion without cannibalizing full-price.',
            '<strong>Tertiary driver — Fitting room staffing:</strong> 2× fitting room coverage at peak drove 31% conversion in Dresses and Blazers vs the district\'s 22% average for the same departments.',
            '<strong>One drag — Accessories Endcap facing gap:</strong> 4 facings vs 6 spec = 33% fewer touchpoints per customer pass. Estimated lost revenue: $320–$480. A 20-minute fix.',
          ],
        },
        {
          title: 'District Context — Your Store vs the District',
          icon: 'district',
          bullets: [
            `This store is <strong>#1 in District 14</strong> this week. SPI of ${store.spi} is <strong>8.4 pts above the district average</strong>. Revenue contribution: 17.8% of district weekly total while operating as 1 of 8 stores.`,
            'District DPI this week: <strong>87 (Excellence)</strong>. Your store anchors this ranking. Johnson City Mall at SPI 58 is the district laggard requiring collective support.',
            '<strong>Broadcast status:</strong> All 4 active HQ broadcasts acknowledged — ahead of 2 peer stores still outstanding on communication compliance.',
          ],
        },
        {
          title: "Today's Priorities & Week Ahead Focus",
          icon: 'recommendations',
          bullets: [
            '<strong>Monday — Accessories Endcap (20 min fix):</strong> Reset to 6-facing POG spec. Estimated weekly revenue recovery: $320–$480.',
            '<strong>Tuesday — Kids size-run audit:</strong> Resolve XS and 4T gaps in Party Dress. Request DC dispatch or inter-store transfer from a peer location.',
            '<strong>This week — Fall transition planning:</strong> Review incoming Fall assortment plan with your merch lead. Pre-stage clearance fixtures. Fall hero items arrive in 3 weeks.',
            '<strong>Schedule — Knowledge share:</strong> DM has flagged your store as a best-practice template. Suggest a 30-min SM peer session — Franklin Town Center and Clarksville Crossing would benefit most.',
          ],
        },
      ],
      closing: `${store.storeName} is the district benchmark this week and every metric earns it. The only open action is the Accessories facing correction — a 20-minute fix that converts a –4.1% miss into a potential +3% gain. Maintain execution, document the playbook, and start positioning for Fall.`,
    };
  }

  if (tier === 'Stable') {
    return {
      greeting: `${store.storeName} (#${store.storeNumber}) is tracking plan at SPI ${store.spi} — net sales +1.2% vs plan but 3 category misses and a conversion dip are leaving meaningful upside on the table. Here is the full weekly business recap with root causes and the fix list.`,
      sections: [
        {
          title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
          icon: 'scorecard',
          bullets: [
            '<strong>vs Plan:</strong> Net sales <strong>+1.2% vs plan</strong> ($2,640 above). Units: flat vs plan. Gross margin <strong>35.1%</strong> — slightly below the 35.8% plan target due to higher-than-planned markdowns in Men\'s Denim clearance.',
            '<strong>vs Last Year (LY):</strong> Net sales <strong>–0.8% vs LY</strong>. Traffic –2.1% YoY — 3rd consecutive week of softness worth monitoring. Conversion flat at 24.6%. Average basket size up from $54.20 → $56.10 (+3.5% YoY).',
            '<strong>vs AI Forecast:</strong> In line with forecast. Model flagged Men\'s Denim underperformance risk 2 weeks ago based on assortment gap data — the miss materialized as predicted.',
            '<strong>vs Comparable Week:</strong> <strong>+0.4% net-comp</strong> — essentially flat. District rank: <strong>#4 of 8 stores</strong>, 3.2 pts below district average SPI.',
          ],
        },
        {
          title: 'Traffic & Conversion Analysis',
          icon: 'traffic',
          bullets: [
            'Total transactions: <strong>2,810</strong> (–2.1% YoY). Traffic softness has persisted 3 consecutive weeks. Possible competitive factor — one competitor ran a parallel promotion in the same mall this weekend.',
            'Conversion rate: <strong>24.6%</strong> — below district average of 26.8%. Biggest drag: checkout queue during 12–2 PM and 5–7 PM peaks. VoC "Checkout Speed" mentions confirm the friction. Single-register operation during peak windows is the direct cause.',
            'Fitting room conversion: <strong>41%</strong> (try-on → purchase) vs 52% district average. Understaffed fitting rooms during peak — customers self-manage and a portion abandon without a staff assist.',
            'UPT: <strong>2.4</strong> (+0.1 vs LY). Basket building improving but limited by conversion drop-off at the register. Multi-item attach rates 18% below district benchmark.',
          ],
        },
        {
          title: 'External Context — Weather, Events & Market Factors',
          icon: 'external',
          bullets: [
            '<strong>Weather:</strong> Mixed week — warm Thu/Fri, overcast and cooler Saturday (–4°F vs seasonal norm). Saturday cooler weather suppressed Dress and swimwear-adjacent demand. Estimated weather drag on Dresses: –$1,200 vs a clear-weather Saturday.',
            '<strong>Semi Annual Sale:</strong> Estimated <strong>+$4,800 incremental revenue</strong>. However, the clearance endcap is mid-aisle rather than at the entrance zone — missed impulse capture opportunity from sale-driven traffic.',
            '<strong>Competitive activity:</strong> Trade area data suggests a competitor ran a parallel promotional event in the same mall — a possible contributing factor to the –2.1% traffic softness. Worth monitoring for a 3rd consecutive week.',
          ],
        },
        {
          title: 'Product Performance — Division & Department Breakdown',
          icon: 'product',
          bullets: [
            `<strong>Women's Division (+4.8% vs plan):</strong> Bright spot. Basics (V-Neck, Tee) strong at +9.2%. Dresses at +2.1% — held back by cool Saturday. Outerwear flat.`,
            `<strong>Men's Division (–6.2% vs plan):</strong> Biggest drag. Denim Slim Fit: only 18 units vs 32 plan (–44% miss). Assortment issue — only 3 washes available vs 5 in peer stores. Oxford and Polo above plan.`,
            '<strong>Kids (+2.1% vs plan):</strong> Cargo Shorts and Color Block Tee leading. Kids Party Dress lagging — size-run gaps.',
            '<strong>Accessories (–7.4% vs plan):</strong> Endcap still in Spring configuration. Summer 2 accessories not on the floor in optimal placement. Highest-priority execution action this week.',
            '<strong>Footwear (+1.8% vs plan):</strong> Running Shoes slightly above plan. Canvas Sneakers flat.',
          ],
        },
        {
          title: 'Seasonal vs. NOS / Core Performance',
          icon: 'drivers',
          bullets: [
            '<strong>Seasonal (Summer 2): 54% of revenue</strong> (vs 58% plan mix). Under-indexed because the Accessories Endcap — the primary Summer 2 showcase zone — has not been reset. Direct execution-to-sales linkage.',
            '<strong>NOS / Core: 46% of revenue</strong> — over-indexed vs plan. Core items are carrying more than their planned share because seasonal execution is incomplete.',
            '<strong>Clearance:</strong> 14% of units, 9.8% of revenue — slightly above plan. Men\'s Denim clearance moving at deeper markdowns than planned.',
          ],
        },
        {
          title: 'What Drove the Week — AI Business Analysis',
          icon: 'drivers',
          bullets: [
            `<strong>Root cause #1 — Men's Denim assortment gap:</strong> The –44% miss on Slim Fit Denim is a product problem, not traffic or service. Only 3 washes on floor vs 5 in top peer stores. An assortment expansion request to the buyer is the right call this week.`,
            '<strong>Root cause #2 — Accessories Endcap in Spring configuration:</strong> Every day the endcap remains in Spring configuration, Seasonal revenue runs at 46% of potential. A reset Accessories Endcap in Summer 2 adds an estimated $380–$520/week for this store\'s traffic volume.',
            '<strong>Root cause #3 — Checkout bottleneck:</strong> 24.6% vs 26.8% district conversion = ~$1,800/week in lost revenue. Cause: single register during 12–2 PM and 5–7 PM peaks. Opening a 2nd register is the highest-ROI staffing change available.',
            '<strong>Weather partially explains the miss but is not the primary story:</strong> Saturday weather drag (–$1,200 estimated) is real. The Denim and Accessories misses are execution-driven and persist on non-weather-sensitive days.',
          ],
        },
        {
          title: 'District Context — Your Store vs the District',
          icon: 'district',
          bullets: [
            `Ranked <strong>#4 of 8 in District 14</strong>. SPI ${store.spi} vs district average of ~80. The gap to top-3 is approximately 4–6 SPI points — achievable within 2 weeks with the Denim, Accessories, and checkout fixes.`,
            'Traffic (2,810) is <strong>below district median</strong> (3,100) for comparable store sizes. The –2.1% YoY trend warrants a trade area competitive review.',
            '<strong>Broadcast status:</strong> 3 of 4 HQ broadcasts acknowledged. "Visual Merchandising — Summer 2" is unread — it contains the Accessories Endcap reset spec, the #1 priority action. Acknowledge and complete today.',
          ],
        },
        {
          title: "Today's Priorities & Week Ahead Focus",
          icon: 'recommendations',
          bullets: [
            '<strong>Monday — Accessories Endcap reset (before AM open):</strong> Reset to Summer 2 POG. 45 min, 2 associates. Estimated weekly revenue uplift: $380–$520.',
            '<strong>Daily — Open 2 registers at peak hours (12–2 PM and 5–7 PM):</strong> The checkout VoC trend will reverse within 5–7 days.',
            `<strong>Wednesday — Men's Denim assortment request:</strong> Submit an assortment request to your buyer for the 2 missing wash options. Reference the –44% vs plan data and peer store comparison. 2-week lead time.`,
            '<strong>Fitting room staffing:</strong> Deploy 1 fitting room associate 11 AM–3 PM daily. District data shows this alone increases Dresses and Blazer conversion by 8–12 points.',
          ],
        },
      ],
      closing: `${store.storeName} is 3 execution corrections away from a top-3 district ranking: reset the Accessories Endcap, open the second register at peak, and escalate the Denim assortment gap. Each action is discrete, measurable, and reversible within 1 week. The traffic quality is there — conversion just needs the right support.`,
    };
  }

  if (tier === 'AtRisk') {
    return {
      greeting: `${store.storeName} (#${store.storeNumber}) had a difficult week — SPI ${store.spi}, At-Risk tier, net sales –3.8% vs plan and conversion declining for the 4th consecutive week. Here is the full business diagnostic and recovery plan.`,
      sections: [
        {
          title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
          icon: 'scorecard',
          bullets: [
            '<strong>vs Plan:</strong> Net sales <strong>–3.8% vs plan</strong> ($8,360 below). Units: –6.2%. Gross margin <strong>32.1%</strong> — 3.7pp below plan. Over-markdown on clearance compressing margin beyond recovery this week.',
            '<strong>vs Last Year (LY):</strong> Net sales <strong>–7.4% vs LY</strong>. Traffic –5.8% YoY — accelerating decline. Conversion dropped 23.2% → <strong>21.1%</strong> (–2.1pp). Average basket size flat at $52.40 — basket quality holding but the funnel is leaking at conversion.',
            '<strong>vs AI Forecast:</strong> –2.9% below even the pessimistic scenario. Compounding factors (OOS + fitting room + POG) created more drag than modeled.',
            '<strong>vs Comparable Week:</strong> <strong>–8.1% net-comp</strong> — meaningful YoY share loss. District rank: <strong>#7 of 8</strong>. Revenue contribution fell from 12.1% → 9.4% of district total over 4 weeks.',
          ],
        },
        {
          title: 'Traffic & Conversion Analysis',
          icon: 'traffic',
          bullets: [
            'Total transactions: <strong>1,940</strong> (–5.8% YoY, lowest week in 8 weeks). Traffic decline is partially external but conversion is the larger problem — traffic quality appears adequate based on VoC data.',
            'Conversion rate: <strong>21.1%</strong> — lowest in the district. Driven primarily by fitting room abandonment. Customers arrive and browse but do not complete purchases in Dresses and Blazers — the two highest-ATV categories.',
            'Fitting room wait time (estimated from VoC): <strong>12–18 minutes during 11am–3pm peak</strong>. Industry benchmark: above 10 minutes, abandon rate spikes to 61%.',
            'UPT: <strong>2.1</strong> (–0.4 vs LY). Basket shrinking. Fewer multi-item purchases indicate the cross-sell opportunity — typically created during the fitting room visit — is being lost.',
          ],
        },
        {
          title: 'External Context — Weather, Events & OOS Impact',
          icon: 'external',
          bullets: [
            '<strong>Weather was NOT a factor:</strong> Normal seasonal conditions. Peer stores in the same climate zone outperformed plan this week — this is an execution issue, not a weather story.',
            '<strong>OOS impact — estimated $3,200 in lost demand:</strong> 8 size-run gaps in Basics and 4 critical SKUs out-of-stock created floor voids visible to customers. Fitting room abandonment-without-purchase data correlates with the SKU gap locations.',
            '<strong>DC delay context:</strong> The 36-hour Basics replenishment delay is an external supply chain factor. However, failure to escalate proactively (size-run monitoring should have flagged this 72 hours earlier) is an internal process gap.',
          ],
        },
        {
          title: 'Product Performance — Division & Department Breakdown',
          icon: 'product',
          bullets: [
            `<strong>Women's Division (–8.2% vs plan):</strong> Biggest drag. Dresses: –18% (fitting room wait). Basics: –11% (OOS in V-Neck sizes S/M/XS). The division has demand — execution failures are suppressing conversion and purchase.`,
            `<strong>Men's Division (+2.1% vs plan):</strong> Bright spot. Polo Classic and Compression Tee above plan. Men's is less impacted by fitting room wait — most male shoppers size-grab without try-on.`,
            '<strong>Kids (–4.3% vs plan):</strong> Party Dress and Color Block Tee below plan — size gaps a factor (4T, XS in Dress).',
            '<strong>Accessories (–6.8% vs plan):</strong> Planogram compliance at 78%. Missing facing positions and misplaced hero items reduce impulse grab. The Leather Crossbody Bag (featured hero) is not at eyeline — buried behind a returns cart.',
            '<strong>Footwear (–1.2% vs plan):</strong> Essentially flat — minimal impact from the execution failures.',
          ],
        },
        {
          title: 'Seasonal vs. NOS / Core Performance',
          icon: 'drivers',
          bullets: [
            '<strong>Seasonal (Summer 2): 48% of revenue</strong> (vs 58% plan). Floorset at 61% completion — the 39% incomplete portion is concentrated in Dresses and Accessories, both underperforming.',
            '<strong>NOS / Core: 52% of revenue</strong> — over-indexed vs plan. Core items (Polo, Tee, Basics) are carrying the store despite OOS gaps.',
            '<strong>Clearance:</strong> 17% of units, 11.4% of revenue — above plan markdown rate. Margin compression is a direct consequence. Full-price sell-through restoration is the GM recovery path.',
          ],
        },
        {
          title: 'What Drove the Week — AI Business Analysis',
          icon: 'drivers',
          bullets: [
            '<strong>Root cause #1 — Fitting room service failure ($4,800 lost revenue):</strong> AI modeling attributes $4,800/week in revenue loss to the fitting room wait. Each conversion point is worth ~$1,020/week. Adding 1 fitting room associate 11am–3pm costs roughly $112/day — 6× ROI in week 1.',
            '<strong>Root cause #2 — OOS size-run gaps ($3,200 lost demand):</strong> Creates a reinforcing negative loop: customers can\'t find their size → they leave → conversion falls → OOS persists. Escalate DC priority today.',
            '<strong>Root cause #3 — POG drift on Women\'s Wall (78% compliance):</strong> 22% of the Wall displays the wrong items. POG drift costs an estimated 4–6% in Women\'s sales uplift. Full reset (90 min, 2 associates) is a one-time fix.',
            '<strong>Compounding effect:</strong> Each issue causes a –2 to –3% miss individually. Together they compound — a customer who can\'t find her size in Basics, waits 15 min in a fitting room, and abandons creates a negative VoC review that deters the next customer. The multi-failure environment amplifies each individual failure.',
          ],
        },
        {
          title: 'District Context — Your Store vs the District',
          icon: 'district',
          bullets: [
            `Ranked <strong>#7 of 8 in District 14</strong>. At current trajectory this store is pulling the district average down by approximately 1.2 SPI points.`,
            `<strong>Peer comparison:</strong> Franklin Town Center (Stable tier, similar traffic) ran 24.8% conversion vs this store's 21.1%. The difference is fitting room staffing — Franklin added a dedicated associate last month. The playbook is proven.`,
            'DM is monitoring daily. <strong>Broadcast status: 2 of 4 unacknowledged</strong> — both contain direct action items for this store\'s recovery. Acknowledge and action before EOD today.',
          ],
        },
        {
          title: 'Triage — Act on These Today',
          icon: 'triage',
          bullets: [
            '<strong>Today — Fitting room (highest ROI):</strong> 1 dedicated fitting room associate 11am–3pm. Estimated weekly revenue recovery: $1,800–$2,400. Proven at Franklin Town Center.',
            '<strong>Today — DC escalation:</strong> Submit priority DC dispatch for 4 critical Basics SKUs (V-Neck XS/S/M, Blazer Size 6). DM is co-signing. Reference OOS impact data.',
            '<strong>Tonight — Women\'s Wall POG reset:</strong> 90 min, 2 associates. Focus top-5 velocity SKUs at eyeline. Must be complete before tomorrow AM open.',
            '<strong>Daily this week — 10-min lead stand-up:</strong> OOS count, fitting room wait at noon, audit score. Report daily to DM via broadcast channel.',
          ],
        },
      ],
      closing: `${store.storeName} has the traffic, team, and assortment to recover. The current metrics are driven by 3 specific, solvable execution failures — not a structural business problem. Execute the fitting room fix today and the recovery begins immediately. DM support is co-signed — use it.`,
    };
  }

  // Crisis tier
  return {
    greeting: `${store.storeName} (#${store.storeNumber}) is in CRISIS at SPI ${store.spi} — the worst week in 12 months across every metric. Multiple compounding failures require District Manager on-site intervention today. Here is the complete diagnostic.`,
    sections: [
      {
        title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
        icon: 'scorecard',
        bullets: [
          '<strong>vs Plan:</strong> Net sales <strong>–12.4% vs plan</strong> ($27,280 below). Units: –14.1%. Gross margin <strong>28.6%</strong> — 9.2pp below plan. Emergency clearance markdowns compressing margin beyond weekly recovery.',
          '<strong>vs Last Year (LY):</strong> Net sales <strong>–16.8% vs LY</strong>. Traffic –9.1% YoY. Conversion <strong>17.4%</strong> — lowest in 12 months and 7.4pp below district average (24.8%). VoC Score dropped 14 pts in 2 weeks.',
          '<strong>vs AI Forecast:</strong> –9.4% below even the pessimistic scenario. Fire exit triage chaos and VoC deterioration compounded faster than modeled.',
          '<strong>vs Comparable Week:</strong> <strong>–18.2% net-comp</strong> — 2nd-worst comparable week in the district\'s 3-year history. District rank: <strong>#8 of 8</strong>. Revenue share collapsed from 10.8% → <strong>6.2%</strong> of district total in 4 weeks.',
        ],
      },
      {
        title: 'Traffic & Conversion — Critical Decline',
        icon: 'traffic',
        bullets: [
          'Total transactions: <strong>1,420</strong> (–9.1% YoY, lowest week in 12 months). The traffic decline includes a measurable deterrent effect — negative VoC and social reviews are beginning to suppress repeat visits.',
          'Conversion: <strong>17.4%</strong> — multiple barriers active simultaneously. Messy aisles reduce browse time; OOS gaps eliminate purchase options; fitting room delays deter try-on. Each alone causes –2 to –3pp; together they compound to a 7.4pp gap vs district.',
          'Average basket size: <strong>$48.20</strong> (–15.3% vs 4 weeks ago). Customer profile shifting from planned shoppers to opportunistic clearance buyers — a signal of brand trust erosion.',
          'Fitting room wait: <strong>estimated 18–22 minutes during peak</strong>. At 18+ minutes, the entire Dresses and Blazers conversion opportunity is effectively lost.',
        ],
      },
      {
        title: 'Critical Issues — Zero-Tolerance First',
        icon: 'triage',
        bullets: [
          '<strong>🚨 SEA Auto-Fail — Fire Exit Blocked:</strong> Display fixture obstructing emergency Exit B in Zone B. <strong>Zero-tolerance regulatory violation.</strong> Store must not open until cleared and photo-documented. DM confirmation required before 9 AM. Risk: mandatory closure and penalties up to $25K.',
          '<strong>⚠ VoC Emergency — "Messy Aisles" + "Staff Unavailable":</strong> Combined complaints up <strong>+38% in 2 weeks</strong>. VoC Score dropped 14 pts. 3 new 1-star Google Reviews in 7 days referencing store condition — each with an estimated 8× amplification on potential customers.',
          '<strong>📦 OOS Surge — 14 SKUs across Basics, Blazers, Denim, and Kids:</strong> 4 DC shipments delayed. Backroom not fully audited in 5 days — actual stock position unknown. A full backroom count is required today before any DC requests can be accurately submitted.',
          '<strong>🏗 Summer 2 Floorset — Only 34% Complete:</strong> Women\'s Tops zone is the only complete zone. Women\'s Wall (Dresses), Denim Wall, and Accessories Endcap all in Spring configuration. Estimated revenue suppression: <strong>$4,200/week</strong>.',
        ],
      },
      {
        title: 'External Context — What Shaped the Week',
        icon: 'external',
        bullets: [
          '<strong>Weather was NOT a factor:</strong> Seasonal conditions, no disruptions. Peer stores in the same trade area outperformed plan. The crisis is internal.',
          '<strong>Semi Annual Sale was a partial offset — but with poor conversion:</strong> Sale awareness drove 12% incremental weekend traffic. However, the execution environment (messy aisles, OOS, fitting room delays) converted this traffic at half the rate of peer stores during the same promotional window.',
          '<strong>Social media amplification:</strong> Two 1-star Google Reviews specifically reference the exact conditions flagged by last week\'s AI audit (messy fitting rooms, empty shelves). Estimated 2,400 impressions from these reviews — a new customer deterrent forming. Next week\'s traffic will be suppressed if not visibly addressed.',
          'No competitive event in trade area — the traffic decline is fully self-generated.',
        ],
      },
      {
        title: 'Product Performance — Division & Department Breakdown',
        icon: 'product',
        bullets: [
          `<strong>Women's Division (–18.4% vs plan):</strong> Catastrophic. Dresses: –29% (fitting room abandonment). Basics: –22% (OOS). Division mix shifted from 48% → 36% of store total in 4 weeks.`,
          `<strong>Men's Division (–6.2% vs plan):</strong> Better than Women's but still below plan. Polo and Tee holding. Denim miss (–14%) due to OOS in core washes.`,
          '<strong>Kids (–11.3% vs plan):</strong> Significant OOS in Party Dress and Cargo Shorts key sizes.',
          '<strong>Accessories (–21.8% vs plan):</strong> Endcap in Spring configuration. Hero items (Leather Crossbody, Silk Scarf) not featured. Revenue has essentially collapsed — the category yields nothing if product is not displayed at accessible positions.',
          '<strong>Footwear (–4.1% vs plan):</strong> Minor impact — self-service format is less affected by staffing and fitting room failures.',
        ],
      },
      {
        title: 'Seasonal vs. NOS / Core Performance',
        icon: 'drivers',
        bullets: [
          '<strong>Seasonal (Summer 2): Only 29% of revenue</strong> (vs 58% plan). Summer 2 is essentially unexecuted — the 34% floorset completion means the majority of Summer 2 product is in backroom, on Spring fixtures, or mixed onto clearance rails.',
          '<strong>NOS / Core: 71% of revenue</strong> — core is carrying everything, but even core items are being suppressed by OOS gaps.',
          '<strong>Clearance: 24% of units</strong> — well above plan. Emergency clearance marking is reactive. Clearance is competing with full-price space and further reducing full-price sell-through.',
        ],
      },
      {
        title: 'What Drove the Week — AI Business Analysis',
        icon: 'drivers',
        bullets: [
          '<strong>The compounding crisis pattern:</strong> This store is in a recognizable "performance death spiral": OOS → customers can\'t buy → conversion drops → revenue misses → morale drops → execution standards fall → VoC worsens → traffic declines → OOS worsens. Breaking this cycle requires external intervention — the team cannot self-correct at this velocity.',
          '<strong>The floorset miss is the origin point:</strong> AI attribution tracing back 4 weeks shows performance decline began precisely when the Summer 2 floorset deadline was missed. The store is competing against fully-set peers — a structural disadvantage every day it remains incomplete.',
          '<strong>Revenue recovery projection:</strong> If fire exit cleared (today), floorset completed (overnight), OOS addressed (48h), and fitting room staffed (tomorrow): AI projects recovery to –4 to –6% vs plan within 10 days. Not full recovery, but crisis → At-Risk. Full recovery to Stable: 3–4 weeks of sustained execution.',
        ],
      },
      {
        title: 'District Context — Critical Drag on District Metrics',
        icon: 'district',
        bullets: [
          'This store is <strong>last in District 14 (#8 of 8)</strong> and represents the single largest SPI drag on the district average. Without this store, the district DPI would be ~89 vs the current 87.',
          'DM Clarke Johnson has this store on daily monitoring. An on-site intervention is being arranged for today — this is not standard practice and reflects the severity of the situation.',
          'District support secured: Nashville Flagship SM has agreed to a 2-hour on-site coaching session this week. DM is co-signing the priority DC dispatch request for the top-10 OOS SKUs.',
          '<strong>All 4 district HQ broadcasts unacknowledged.</strong> These contain the Summer 2 floorset spec, signage requirements, and OOS adaptation protocol. Acknowledge and action all 4 today.',
        ],
      },
      {
        title: 'Immediate Recovery — Priority Order',
        icon: 'recommendations',
        bullets: [
          '<strong>Before opening (non-negotiable) — Fire exit:</strong> Clear Exit B obstruction. Photo document. Submit to Compliance via SEA portal. DM confirmation before 9 AM. Store does not open until complete.',
          '<strong>Before 10 AM — Full backroom count:</strong> Accurate inventory count is prerequisite to the DC dispatch request.',
          '<strong>Today — DM on-site visit:</strong> DM Clarke Johnson will be present. Prioritize Women\'s Wall reset and Accessories Endcap as the two highest-revenue-recovery zones.',
          '<strong>Tonight — Overnight floorset reset:</strong> Women\'s Wall and Accessories Endcap in Summer 2 POG. Minimum 3 associates, 3 hours. Focus the 5 hero SKUs at eyeline — do not attempt all zones in one night.',
          '<strong>Tomorrow AM — Fitting room staffing:</strong> 1 dedicated associate 11 AM–3 PM. Every day without this costs $680–$960 in Women\'s sales.',
          '<strong>48 hours — Deep clean:</strong> Professional-standard clean of all aisles, fitting rooms, and entrance zone before the weekend. The VoC cycle cannot break without a visible physical improvement that re-visiting customers can detect.',
        ],
      },
    ],
    closing: `${store.storeName} is in crisis but the data shows demand exists — traffic is down only 9%, the bigger problem is 17% conversion. What is needed is on-site leadership presence and a sequenced, non-negotiable action plan. Follow the priority order: safety → backroom count → floorset → fitting room → deep clean. DM intervention today is the catalyst.`,
  };
};


// Helper functions
const getSPIColor = (tier: SPITier) => {
  switch (tier) {
    case 'Excellence': return 'var(--ia-color-success)';
    case 'Stable': return '#0ea5e9';
    case 'AtRisk': return 'var(--ia-color-warning)';
    case 'Crisis': return 'var(--ia-color-error)';
    default: return 'var(--ia-color-text-secondary)';
  }
};

const getImpactIcon = (type: string) => {
  switch (type) {
    case 'revenue': return <AttachMoneyOutlined sx={{ fontSize: 14 }}/>;
    case 'compliance': return <GppGoodOutlined sx={{ fontSize: 14 }}/>;
    case 'customer': return <GroupOutlined sx={{ fontSize: 14 }}/>;
    case 'safety': return <CrisisAlert sx={{ fontSize: 14 }}/>;
    case 'inventory': return <InventoryOutlined sx={{ fontSize: 14 }}/>;
    default: return <ErrorOutlined sx={{ fontSize: 14 }}/>;
  }
};

const getDiscrepancyColor = (cls: DiscrepancyClass) => {
  switch (cls) {
    case 'Silent Risk': return '#8b5cf6';
    case 'Leading Indicator': return 'var(--ia-color-warning)';
    case 'Imminent Gap': return 'var(--ia-color-error)';
    case 'Ground Truth Confirmed': return 'var(--ia-color-success)';
    case 'Stable': return '#0ea5e9';
    default: return 'var(--ia-color-text-secondary)';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Phantom Stock Heatmap — Types & Mock Data
// ─────────────────────────────────────────────────────────────────────────────
type PhantomRisk = 'High' | 'Medium' | 'Low' | 'Minimal';
type PhantomStatus = 'Open' | 'In Progress' | 'Resolved' | 'Dismissed';

interface PhantomSkuRow {
  productName: string;
  sku: string;
  bohQty: number;
  shelfQty: number;
  lastSaleDate: string;
  zeroSalesDays: number;
  inventoryValue: number;
  riskLevel: 'High' | 'Medium' | 'Low';
}

interface PhantomRow {
  id: string;
  department: string;
  subDepartment: string;
  itemClass: string;
  phantomSkus: number;
  inventoryUnits: number;
  bohUnits: number;
  shelfQty: number;
  lastSaleDate: string;
  zeroSalesDays: number;
  inventoryValue: number;
  riskLevel: PhantomRisk;
  linkedTasks: number;
  status: PhantomStatus;
  whyFlagged: string;
  recommendedAction: string;
  skuBreakdown: PhantomSkuRow[];
}

const PHANTOM_ROWS: PhantomRow[] = [
  {
    id: 'ps-001',
    department: "Women's", subDepartment: 'Tops', itemClass: 'Basics',
    phantomSkus: 3, inventoryUnits: 144, bohUnits: 144, shelfQty: 0,
    lastSaleDate: 'Apr 28, 2026', zeroSalesDays: 27, inventoryValue: 8640,
    riskLevel: 'High', linkedTasks: 2, status: 'Open',
    whyFlagged: "System shows 144 units on-hand across 3 Women's Tops SKUs, but zero sales for 27 consecutive days. Shelf image audit confirms garments are not displayed on the floor rail.",
    recommendedAction: "Move all units from BOH Rail C to Women's Tops floor rail. Check for backroom blockage. Initiate Inventory Check / Cycle Count task.",
    skuBreakdown: [
      { productName: "Women's V-Neck Basics", sku: 'WOM-TOP-014', bohQty: 48, shelfQty: 0, lastSaleDate: 'Apr 28, 2026', zeroSalesDays: 27, inventoryValue: 2880, riskLevel: 'High' },
      { productName: "Women's Classic Blazer", sku: 'WOM-BLZ-001', bohQty: 60, shelfQty: 0, lastSaleDate: 'Apr 29, 2026', zeroSalesDays: 26, inventoryValue: 3600, riskLevel: 'High' },
      { productName: 'Athletic Leggings', sku: 'WOM-ACT-002', bohQty: 36, shelfQty: 0, lastSaleDate: 'Apr 30, 2026', zeroSalesDays: 25, inventoryValue: 2160, riskLevel: 'Medium' },
    ],
  },
  {
    id: 'ps-002',
    department: "Men's", subDepartment: 'Outerwear', itemClass: 'Jackets',
    phantomSkus: 2, inventoryUnits: 96, bohUnits: 96, shelfQty: 0,
    lastSaleDate: 'May 2, 2026', zeroSalesDays: 23, inventoryValue: 9600,
    riskLevel: 'High', linkedTasks: 1, status: 'In Progress',
    whyFlagged: "96 units of 2 Men's Outerwear SKUs confirmed in BOH with zero floor display. Sales velocity expected at 12–15 units/week based on cluster average.",
    recommendedAction: "Replenish floor display from BOH Rail M5. Assign cycle count task to stock associate.",
    skuBreakdown: [
      { productName: 'Puffer Jacket', sku: 'MEN-OUT-006', bohQty: 60, shelfQty: 0, lastSaleDate: 'May 2, 2026', zeroSalesDays: 23, inventoryValue: 5400, riskLevel: 'High' },
      { productName: 'Seasonal Rain Jacket', sku: 'SEA-JKT-004', bohQty: 36, shelfQty: 0, lastSaleDate: 'May 3, 2026', zeroSalesDays: 22, inventoryValue: 4200, riskLevel: 'High' },
    ],
  },
  {
    id: 'ps-003',
    department: 'Accessories', subDepartment: 'Bags', itemClass: 'Totes',
    phantomSkus: 2, inventoryUnits: 120, bohUnits: 80, shelfQty: 40,
    lastSaleDate: 'May 3, 2026', zeroSalesDays: 22, inventoryValue: 7200,
    riskLevel: 'High', linkedTasks: 1, status: 'Open',
    whyFlagged: 'System reports 120 units across 2 Bags SKUs. Hook display has 40 units but zero sales for 22 days despite typical velocity of 8 units/week. Possible planogram mismatch hiding product.',
    recommendedAction: 'Verify hook position matches active Accessories POG. Check if price tags are visible. Confirm product is accessible.',
    skuBreakdown: [
      { productName: 'Canvas Tote Bag', sku: 'ACC-BAG-005', bohQty: 48, shelfQty: 24, lastSaleDate: 'May 3, 2026', zeroSalesDays: 22, inventoryValue: 3360, riskLevel: 'High' },
      { productName: 'Leather Crossbody Bag', sku: 'ACC-BAG-011', bohQty: 32, shelfQty: 16, lastSaleDate: 'May 5, 2026', zeroSalesDays: 20, inventoryValue: 3840, riskLevel: 'Medium' },
    ],
  },
  {
    id: 'ps-004',
    department: 'Seasonal', subDepartment: 'Outerwear', itemClass: 'Jackets',
    phantomSkus: 1, inventoryUnits: 60, bohUnits: 60, shelfQty: 0,
    lastSaleDate: 'May 3, 2026', zeroSalesDays: 22, inventoryValue: 5100,
    riskLevel: 'High', linkedTasks: 1, status: 'Open',
    whyFlagged: '60 units confirmed in BOH with zero floor display presence. Product trapped in backroom since last delivery.',
    recommendedAction: 'Move 60 units from BOH Rail S3 to Seasonal Promo Table. Verify planogram position.',
    skuBreakdown: [
      { productName: 'Seasonal Rain Jacket', sku: 'SEA-JKT-004', bohQty: 60, shelfQty: 0, lastSaleDate: 'May 3, 2026', zeroSalesDays: 22, inventoryValue: 5100, riskLevel: 'High' },
    ],
  },
  {
    id: 'ps-005',
    department: "Women's", subDepartment: 'Dresses', itemClass: 'Casual Dresses',
    phantomSkus: 2, inventoryUnits: 48, bohUnits: 32, shelfQty: 16,
    lastSaleDate: 'May 7, 2026', zeroSalesDays: 18, inventoryValue: 5040,
    riskLevel: 'Medium', linkedTasks: 1, status: 'Open',
    whyFlagged: '48 units across 2 casual dress SKUs with 18 days of zero sales. Possible size-run imbalance — system may be miscounting available-to-sell units.',
    recommendedAction: 'Conduct physical size-run audit. Verify system inventory matches rail. Check for incorrect size tagging.',
    skuBreakdown: [
      { productName: 'Floral Midi Dress — Navy', sku: 'WOM-DRS-014', bohQty: 18, shelfQty: 10, lastSaleDate: 'May 7, 2026', zeroSalesDays: 18, inventoryValue: 2700, riskLevel: 'Medium' },
      { productName: 'Linen Wrap Dress — White', sku: 'WOM-DRS-021', bohQty: 14, shelfQty: 6, lastSaleDate: 'May 8, 2026', zeroSalesDays: 17, inventoryValue: 2340, riskLevel: 'Medium' },
    ],
  },
  {
    id: 'ps-006',
    department: "Men's", subDepartment: 'Bottoms', itemClass: 'Denim',
    phantomSkus: 2, inventoryUnits: 55, bohUnits: 30, shelfQty: 25,
    lastSaleDate: 'May 9, 2026', zeroSalesDays: 16, inventoryValue: 4125,
    riskLevel: 'Medium', linkedTasks: 1, status: 'In Progress',
    whyFlagged: "Denim inventory showing 16 days of zero sales despite 55 units on-hand. Cluster average for this class is 8 units/week. Possible display or placement issue.",
    recommendedAction: "Review Men's Denim rail display and ensure correct size runs are visible. Check fitting room returns are being re-railed promptly.",
    skuBreakdown: [
      { productName: 'Slim Fit Denim — Dark Wash', sku: 'MEN-DNM-003', bohQty: 18, shelfQty: 14, lastSaleDate: 'May 9, 2026', zeroSalesDays: 16, inventoryValue: 2250, riskLevel: 'Medium' },
      { productName: 'Straight Leg Jeans — Black', sku: 'MEN-DNM-011', bohQty: 12, shelfQty: 11, lastSaleDate: 'May 10, 2026', zeroSalesDays: 15, inventoryValue: 1875, riskLevel: 'Medium' },
    ],
  },
  {
    id: 'ps-007',
    department: 'Kids', subDepartment: 'Tops', itemClass: 'Tees',
    phantomSkus: 1, inventoryUnits: 36, bohUnits: 12, shelfQty: 24,
    lastSaleDate: 'May 12, 2026', zeroSalesDays: 13, inventoryValue: 1080,
    riskLevel: 'Low', linkedTasks: 0, status: 'Open',
    whyFlagged: '36 units on-hand with 13 zero-sales days. Slightly below normal velocity but within acceptable range. May be seasonal slowdown.',
    recommendedAction: 'Monitor for next 7 days. If sales remain zero, initiate cycle count to verify accuracy.',
    skuBreakdown: [
      { productName: 'Kids Color Block Tee', sku: 'KID-TSH-012', bohQty: 12, shelfQty: 24, lastSaleDate: 'May 12, 2026', zeroSalesDays: 13, inventoryValue: 1080, riskLevel: 'Low' },
    ],
  },
  {
    id: 'ps-008',
    department: 'Accessories', subDepartment: 'Scarves', itemClass: 'Scarves',
    phantomSkus: 1, inventoryUnits: 24, bohUnits: 12, shelfQty: 12,
    lastSaleDate: 'May 14, 2026', zeroSalesDays: 11, inventoryValue: 1200,
    riskLevel: 'Low', linkedTasks: 0, status: 'Open',
    whyFlagged: '24 units with 11 days zero sales. Monitor — may be slow-moving seasonal accessory.',
    recommendedAction: 'Monitor. Initiate cycle count if zero sales continue past 14 days.',
    skuBreakdown: [
      { productName: 'Silk Blend Scarf', sku: 'ACC-SCF-009', bohQty: 12, shelfQty: 12, lastSaleDate: 'May 14, 2026', zeroSalesDays: 11, inventoryValue: 1200, riskLevel: 'Low' },
    ],
  },
  {
    id: 'ps-009',
    department: 'Footwear', subDepartment: "Men's Formal", itemClass: 'Formal',
    phantomSkus: 1, inventoryUnits: 18, bohUnits: 10, shelfQty: 8,
    lastSaleDate: 'May 11, 2026', zeroSalesDays: 14, inventoryValue: 2700,
    riskLevel: 'Medium', linkedTasks: 1, status: 'Open',
    whyFlagged: 'Formal footwear SKU showing 14 days zero sales with 18 units on-hand. Higher-value inventory at risk. Velocity of zero is abnormal for this class.',
    recommendedAction: 'Verify product is on display shelf and correctly positioned. Check if size range available matches customer demand profile.',
    skuBreakdown: [
      { productName: 'Oxford Leather Shoes — Black', sku: 'FTW-FRM-002', bohQty: 10, shelfQty: 8, lastSaleDate: 'May 11, 2026', zeroSalesDays: 14, inventoryValue: 2700, riskLevel: 'Medium' },
    ],
  },
  {
    id: 'ps-010',
    department: 'Activewear', subDepartment: "Men's Activewear", itemClass: 'Tops',
    phantomSkus: 1, inventoryUnits: 30, bohUnits: 18, shelfQty: 12,
    lastSaleDate: 'May 15, 2026', zeroSalesDays: 10, inventoryValue: 1200,
    riskLevel: 'Low', linkedTasks: 0, status: 'Open',
    whyFlagged: '30 units, 10 days zero sales. Below threshold for automatic task creation but flagged for monitoring.',
    recommendedAction: 'Monitor. No action needed unless zero-sales period extends past 14 days.',
    skuBreakdown: [
      { productName: 'Athletic Compression Tee', sku: 'MEN-ACT-004', bohQty: 18, shelfQty: 12, lastSaleDate: 'May 15, 2026', zeroSalesDays: 10, inventoryValue: 1200, riskLevel: 'Low' },
    ],
  },
];

// Heatmap dimensions
const PS_HEATMAP_DEPTS = ["Women's", "Men's", 'Kids', 'Accessories', 'Seasonal', 'Footwear'];
const PS_HEATMAP_CLASSES = ['Basics', 'Denim', 'Dresses', 'Outerwear', 'Totes', 'Jackets', 'Tees', 'Formal', 'Scarves', 'Tops'];

const PS_HEATMAP_DATA: Record<string, Record<string, PhantomRisk | null>> = {
  "Women's": { 'Basics': 'High', 'Denim': null, 'Dresses': 'Medium', 'Outerwear': 'Low', 'Totes': null, 'Jackets': null, 'Tees': null, 'Formal': null, 'Scarves': null, 'Tops': 'Low' },
  "Men's": { 'Basics': null, 'Denim': 'Medium', 'Dresses': null, 'Outerwear': 'High', 'Totes': null, 'Jackets': null, 'Tees': null, 'Formal': null, 'Scarves': null, 'Tops': null },
  'Kids': { 'Basics': null, 'Denim': null, 'Dresses': null, 'Outerwear': null, 'Totes': null, 'Jackets': null, 'Tees': 'Low', 'Formal': null, 'Scarves': null, 'Tops': null },
  'Accessories': { 'Basics': null, 'Denim': null, 'Dresses': null, 'Outerwear': null, 'Totes': 'High', 'Jackets': null, 'Tees': null, 'Formal': null, 'Scarves': 'Low', 'Tops': null },
  'Seasonal': { 'Basics': null, 'Denim': null, 'Dresses': null, 'Outerwear': null, 'Totes': null, 'Jackets': 'High', 'Tees': null, 'Formal': null, 'Scarves': null, 'Tops': null },
  'Footwear': { 'Basics': null, 'Denim': null, 'Dresses': null, 'Outerwear': null, 'Totes': null, 'Jackets': null, 'Tees': null, 'Formal': 'Medium', 'Scarves': null, 'Tops': null },
};

export const StoreDeepDive: React.FC = () => {
  const { user } = useAuth();
  const isDMReadOnly = user?.role === 'DM';
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(null);
  const [selectedStore, setSelectedStore] = useState<DistrictStore>(districtStores[0]);
  const [isStoreFilterOpen, setIsStoreFilterOpen] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [pogSectionFilter, setPogSectionFilter] = useState('');
  const [pogCategoryFilter, setPogCategoryFilter] = useState('');

  // ── Phantom Stock Heatmap State ──
  const [psSearch, setPsSearch] = useState('');
  const [psDeptFilter, setPsDeptFilter] = useState('');
  const [psSubDeptFilter, setPsSubDeptFilter] = useState('');
  const [psClassFilter, setPsClassFilter] = useState('');
  const [psRiskFilter, setPsRiskFilter] = useState('');
  const [psStatusFilter, setPsStatusFilter] = useState('');
  const [psTimeWindow, setPsTimeWindow] = useState('30d');
  const [psPage, setPsPage] = useState(0);
  const [psDrawerRow, setPsDrawerRow] = useState<PhantomRow | null>(null);
  const PS_PAGE_SIZE = 6;

  // ── Calendar / Period Filter State ──
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'week' | 'month' | 'quarter'>('week');
  const [viewingMonth, setViewingMonth] = useState(new Date().getMonth());
  const [viewingYear, setViewingYear] = useState(new Date().getFullYear());

  const getLastAvailableWeekStart = () => {
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(startOfThisWeek);
    lastWeekStart.setDate(startOfThisWeek.getDate() - 7);
    return lastWeekStart;
  };
  const getLastAvailableMonth = () => {
    const today = new Date();
    const m = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const y = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    return new Date(y, m, 1);
  };
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(getLastAvailableWeekStart);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(getLastAvailableMonth);
  const [selectedQuarter, setSelectedQuarter] = useState<{ label: string; quarter: number; year: number } | null>(() => {
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3) + 1;
    const currentY = now.getFullYear();
    let q = currentQ - 1;
    let y = currentY;
    if (q <= 0) { q += 4; y -= 1; }
    const qMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startM = (q - 1) * 3;
    return { label: `Q${q} ${y} (${qMonths[startM]}–${qMonths[startM + 2]})`, quarter: q, year: y };
  });

  const isDateInCurrentWeek = (date: Date) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return date >= startOfWeek && date <= endOfWeek;
  };
  const isDateInFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days: { day: number; trailing: boolean }[] = [];
    if (startDayOfWeek > 0) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, trailing: true });
      }
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, trailing: false });
    }
    return days;
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const clickedDate = new Date(viewingYear, viewingMonth, day);
    if (isDateInFuture(clickedDate) || isDateInCurrentWeek(clickedDate)) return;
    if (calendarMode === 'week') {
      const weekStart = new Date(clickedDate);
      weekStart.setDate(clickedDate.getDate() - clickedDate.getDay());
      setSelectedWeekStart(weekStart);
      setShowCalendar(false);
    }
  };

  const isInSelectedWeek = (day: number | null) => {
    if (!day || !selectedWeekStart || calendarMode !== 'week') return false;
    const date = new Date(viewingYear, viewingMonth, day);
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(selectedWeekStart.getDate() + 6);
    return date >= selectedWeekStart && date <= weekEnd;
  };

  const getAvailableQuarters = () => {
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3) + 1;
    const currentY = now.getFullYear();
    const quarters: { label: string; quarter: number; year: number }[] = [];
    let q = currentQ - 1;
    let y = currentY;
    if (q <= 0) { q += 4; y -= 1; }
    for (let i = 0; i < 4; i++) {
      const qMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const startM = (q - 1) * 3;
      quarters.push({ label: `Q${q} ${y} (${qMonths[startM]}–${qMonths[startM + 2]})`, quarter: q, year: y });
      q -= 1;
      if (q <= 0) { q = 4; y -= 1; }
    }
    return quarters;
  };
  const availableQuarters = getAvailableQuarters();

  const getSelectedPeriodLabel = () => {
    if (calendarMode === 'week' && selectedWeekStart) {
      const weekEnd = new Date(selectedWeekStart);
      weekEnd.setDate(selectedWeekStart.getDate() + 6);
      return `${selectedWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (calendarMode === 'month' && selectedMonth) {
      return selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (calendarMode === 'quarter' && selectedQuarter) {
      return selectedQuarter.label;
    }
    return 'Select Period';
  };

  const navigateMonth = (dir: number) => {
    let nm = viewingMonth + dir;
    let ny = viewingYear;
    if (nm < 0) { nm = 11; ny -= 1; }
    if (nm > 11) { nm = 0; ny += 1; }
    setViewingMonth(nm);
    setViewingYear(ny);
  };

  const calendarDays = getCalendarDays(viewingYear, viewingMonth);
  const isDateFilterActive = true;

  const filteredStores = districtStores.filter(store => 
    store.storeName.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
    store.storeNumber.includes(storeSearchQuery)
  );

  // Per-store derived data — re-computes whenever selectedStore changes
  const storeMetrics = useMemo(() => getStoreMetrics(selectedStore), [selectedStore]);
  const mockActions = useMemo(() => getStoreActions(selectedStore), [selectedStore]);
  const baseKPIs = useMemo(() => getStoreKPIs(selectedStore), [selectedStore]);
  const mockStreamDiagnostics = useMemo(() => getStreamDiagnostics(selectedStore), [selectedStore]);
  const crossStreamVerdict = useMemo(() => getCrossStreamVerdict(selectedStore), [selectedStore]);
  const [lastRefreshTime] = useState(new Date());
  const storeInfo = { district: districtContext.name, lastRefresh: lastRefreshTime };

  // Period-adjusted KPIs
  // Default secondaryVariance is YoY; time filter swaps to WoW / MoM / QoQ
  const periodLabel = calendarMode === 'week' ? 'WoW' : calendarMode === 'month' ? 'MoM' : 'QoQ';
  const mockKPIs = useMemo(() => {
    const swapped = baseKPIs.map(kpi => ({
      ...kpi,
      secondaryVariance: kpi.secondaryVariance === 'YoY' ? periodLabel : kpi.secondaryVariance,
    }));
    if (calendarMode === 'week') return swapped;
    const factor = calendarMode === 'month' ? 4.2 : 13.1;
    return swapped.map(kpi => {
      if (kpi.id === 'sales') {
        const baseNum = parseFloat(kpi.value.replace(/[^0-9.]/g, ''));
        const newVal = Math.round(baseNum * factor);
        return { ...kpi, value: `$${newVal >= 1000 ? (newVal / 1000).toFixed(1) + 'M' : newVal + 'K'}` };
      }
      return kpi;
    });
  }, [baseKPIs, calendarMode, periodLabel]);

  // Period-adjusted SPI metrics
  const adjustedSPI = useMemo(() => {
    const base = storeMetrics.spi;
    if (calendarMode === 'week') return storeMetrics;
    const shift = calendarMode === 'month' ? -2 : -4;
    return {
      ...storeMetrics,
      spi: Math.max(40, base + shift),
      momentumDelta: +(storeMetrics.momentumDelta + (calendarMode === 'month' ? -0.4 : -0.8)).toFixed(1),
    };
  }, [storeMetrics, calendarMode]);

  const varianceContext = calendarMode === 'week' ? 'WoW' : calendarMode === 'month' ? 'MoM' : 'QoQ';

  // Read store from URL parameters and set selected store
  useEffect(() => {
    const storeParam = searchParams.get('store');
    if (storeParam) {
      const foundStore = districtStores.find(s => s.storeNumber === storeParam);
      if (foundStore) {
        setSelectedStore(foundStore);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.store-filter-container')) {
        setIsStoreFilterOpen(false);
      }
      if (!target.closest('.sdd-period-selector')) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="store-deep-dive">
        <div className="store-deep-dive-loading">
          <div className="sdd-loading-spinner" />
          <p>Loading Store Deep Dive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-deep-dive">
      {/* DM Read-Only Banner */}
      {isDMReadOnly && (
        <div className="sdd-readonly-banner">
          <VisibilityOutlined sx={{ fontSize: 14 }}/>
          <span>View-Only Mode — You have read-only access to Store Deep Dive</span>
        </div>
      )}
      {/* Store Health Header - Premium */}
      <div className="store-health-header">
        {/* Store Filter + Identity Block */}
        <div className="store-identity">
          {/* Store Filter Dropdown */}
          <div className="store-filter-container">
            <button 
              className="store-filter-trigger"
              onClick={() => setIsStoreFilterOpen(!isStoreFilterOpen)}
            >
              <div className="store-filter-icon">
                <StoreOutlined sx={{ fontSize: 16 }}/>
              </div>
              <div className="store-filter-info">
                <span className="store-filter-number">#{selectedStore.storeNumber}</span>
                <span className="store-filter-name">{selectedStore.storeName}</span>
              </div>
              <KeyboardArrowDown sx={{ fontSize: 14 }} className={`store-filter-chevron ${isStoreFilterOpen ? 'open' : ''}`}/>
            </button>

            {isStoreFilterOpen && (
              <div className="store-filter-dropdown">
                <div className="store-filter-search">
                  <SearchOutlined sx={{ fontSize: 14 }}/>
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="store-filter-list">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      className={`store-filter-option ${selectedStore.id === store.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedStore(store);
                        setIsStoreFilterOpen(false);
                        setStoreSearchQuery('');
                      }}
                    >
                      <div className="store-option-info">
                        <span className="store-option-number">#{store.storeNumber}</span>
                        <span className="store-option-name">{store.storeName}</span>
                        <span className="store-option-format">{store.format}</span>
                      </div>
                      <div className="store-option-metrics">
                        <span className={`store-option-spi tier-${store.spiTier.toLowerCase()}`}>
                          {store.spi}
                        </span>
                        {selectedStore.id === store.id && <Check sx={{ fontSize: 14 }} className="store-option-check"/>}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="store-filter-footer">
                  <span>{districtStores.length} stores in district</span>
                </div>
              </div>
            )}
          </div>

          <div className="store-meta-tags">
            <span className="meta-tag">
              <PlaceOutlined sx={{ fontSize: 11 }}/>
              {storeInfo.district}
            </span>
            <span className="meta-tag">{selectedStore.format}</span>
            <span className="meta-tag">{selectedStore.cluster}</span>
          </div>
          <div className="sdd-period-selector" style={{ position: 'relative' }}>
            <button className="sdd-period-btn" onClick={() => setShowCalendar(!showCalendar)}>
              <CalendarTodayOutlined sx={{ fontSize: 13 }}/>
              <span>{getSelectedPeriodLabel()}</span>
              <KeyboardArrowDown sx={{ fontSize: 13 }} className={showCalendar ? 'rotated' : ''}/>
            </button>
            {showCalendar && (
              <div className="sdd-calendar-dropdown">
                <div className="sdd-calendar-mode-toggle">
                  <button className={`sdd-mode-btn ${calendarMode === 'week' ? 'active' : ''}`} onClick={() => { setCalendarMode('week'); if (selectedWeekStart) { setViewingMonth(selectedWeekStart.getMonth()); setViewingYear(selectedWeekStart.getFullYear()); } }}>Week</button>
                  <button className={`sdd-mode-btn ${calendarMode === 'month' ? 'active' : ''}`} onClick={() => { setCalendarMode('month'); if (selectedMonth) { setViewingMonth(selectedMonth.getMonth()); setViewingYear(selectedMonth.getFullYear()); } }}>Month</button>
                  <button className={`sdd-mode-btn ${calendarMode === 'quarter' ? 'active' : ''}`} onClick={() => setCalendarMode('quarter')}>Quarter</button>
                </div>
                {calendarMode === 'quarter' ? (
                  <div className="sdd-quarter-list">
                    {availableQuarters.map((q, idx) => (
                      <button key={idx} className={`sdd-quarter-option ${selectedQuarter?.quarter === q.quarter && selectedQuarter?.year === q.year ? 'selected' : ''}`} onClick={() => { setSelectedQuarter(q); setShowCalendar(false); }}>
                        <span className="sdd-quarter-label">Q{q.quarter} {q.year}</span>
                        <span className="sdd-quarter-range">{q.label.match(/\((.+)\)/)?.[1]}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="sdd-calendar-nav">
                      <button onClick={() => navigateMonth(-1)}><KeyboardArrowUp sx={{ fontSize: 14 }} style={{ transform: 'rotate(-90deg)' }}/></button>
                      <span>{new Date(viewingYear, viewingMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={() => navigateMonth(1)}><KeyboardArrowUp sx={{ fontSize: 14 }} style={{ transform: 'rotate(90deg)' }}/></button>
                    </div>
                    <div className="sdd-calendar-grid">
                      <div className="sdd-calendar-weekdays">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                      </div>
                      <div className="sdd-calendar-days">
                        {calendarDays.map((entry, index) => {
                          if (entry.trailing) return <button key={index} className="sdd-cal-day trailing" disabled>{entry.day}</button>;
                          const day = entry.day;
                          const date = new Date(viewingYear, viewingMonth, day);
                          const isDisabledWeek = isDateInFuture(date) || isDateInCurrentWeek(date);
                          const isDisabledMonth = viewingYear > new Date().getFullYear() || (viewingYear === new Date().getFullYear() && viewingMonth >= new Date().getMonth());
                          const isDisabled = calendarMode === 'week' ? isDisabledWeek : isDisabledMonth;
                          const isSelectedWeek = isInSelectedWeek(day);
                          const isSelectedMonth = selectedMonth && viewingYear === selectedMonth.getFullYear() && viewingMonth === selectedMonth.getMonth();
                          const isSelected = calendarMode === 'week' ? isSelectedWeek : isSelectedMonth;
                          return (
                            <button key={index} className={`sdd-cal-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => { if (calendarMode === 'week') { handleDayClick(day); } else if (!isDisabledMonth) { setSelectedMonth(new Date(viewingYear, viewingMonth, 1)); setShowCalendar(false); } }} disabled={isDisabled}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="last-refresh">
            <AccessTimeOutlined sx={{ fontSize: 10 }}/>
            Updated {storeInfo.lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Executive Pulse — SPI Performance Card + AI Brief side-by-side (matches District Intelligence) */}
      <div className="sdd-executive-pulse">

        {/* Left: SPI Performance Card */}
        <div className="sdd-spi-card">

          {/* SPI Gauge */}
          <div className="spi-gauge-container">
            <div className="spi-gauge">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={getSPIColor(adjustedSPI.spiTier)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(adjustedSPI.spi / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                  className="spi-progress-ring"
                />
              </svg>
              <div className="spi-center">
                <span className="spi-value">{adjustedSPI.spi}</span>
                <span className="spi-label">SPI</span>
              </div>
            </div>
            <div className={`spi-tier-badge tier-${adjustedSPI.spiTier.toLowerCase()}`}>
              {adjustedSPI.spiTier === 'Excellence' && <EmojiEventsOutlined sx={{ fontSize: 12 }}/>}
              {adjustedSPI.spiTier === 'Stable' && <ThumbUpOutlined sx={{ fontSize: 12 }}/>}
              {adjustedSPI.spiTier === 'AtRisk' && <WarningAmberOutlined sx={{ fontSize: 12 }}/>}
              {adjustedSPI.spiTier === 'Crisis' && <ErrorOutlined sx={{ fontSize: 12 }}/>}
              {adjustedSPI.spiTier === 'AtRisk' ? 'At Risk' : adjustedSPI.spiTier}
            </div>
          </div>

          {/* Momentum & Comparison Strip */}
          <div className="momentum-strip">
            <div className="momentum-item">
              <span className="momentum-label">Momentum</span>
              <div className={`momentum-value ${adjustedSPI.momentum.toLowerCase()}`}>
                {adjustedSPI.momentum === 'Improving' && <TrendingUpOutlined sx={{ fontSize: 16 }}/>}
                {adjustedSPI.momentum === 'Slipping' && <TrendingDownOutlined sx={{ fontSize: 16 }}/>}
                {adjustedSPI.momentum === 'Flat' && <Remove sx={{ fontSize: 16 }}/>}
                <span>{adjustedSPI.momentumDelta >= 0 ? '+' : ''}{adjustedSPI.momentumDelta}%</span>
              </div>
              <span className="momentum-period">{varianceContext}</span>
            </div>
            <div className="momentum-item">
              <span className="momentum-label">vs District</span>
              <div className={`momentum-value ${adjustedSPI.vsDistrictAvg >= 0 ? 'improving' : 'slipping'}`}>
                {adjustedSPI.vsDistrictAvg >= 0 ? <NorthEast sx={{ fontSize: 16 }}/> : <SouthEast sx={{ fontSize: 16 }}/>}
                <span>{adjustedSPI.vsDistrictAvg >= 0 ? '+' : ''}{adjustedSPI.vsDistrictAvg}%</span>
              </div>
              <span className="momentum-period">avg SPI</span>
            </div>
          </div>

          {/* Comp Rank Badge */}
          <div className="comp-rank-container">
            <div className={`comp-rank-badge ${adjustedSPI.compRank === 1 ? 'top' : adjustedSPI.compRank <= Math.ceil(adjustedSPI.compTotal / 2) ? 'middle' : 'bottom'}`}>
              <span className="rank-number">#{adjustedSPI.compRank}</span>
              <span className="rank-total">of {adjustedSPI.compTotal}</span>
            </div>
            <div className="rank-movement">
              {adjustedSPI.compMovement < 0 ? (
                <span className="movement-down">
                  <SouthEast sx={{ fontSize: 12 }}/>
                  {Math.abs(adjustedSPI.compMovement)} spots
                </span>
              ) : adjustedSPI.compMovement > 0 ? (
                <span className="movement-up">
                  <NorthEast sx={{ fontSize: 12 }}/>
                  {adjustedSPI.compMovement} spots
                </span>
              ) : (
                <span className="movement-flat">No change</span>
              )}
            </div>
            <span className="comp-label">{adjustedSPI.clusterName} peers</span>
            {/* Callout: shown when chain-wide comp rank differs from district rank */}
            {adjustedSPI.compRank !== adjustedSPI.districtRank && (
              <div className={`comp-rank-callout ${adjustedSPI.compRank < adjustedSPI.districtRank ? 'callout-positive' : 'callout-amber'}`}>
                <InfoOutlined sx={{ fontSize: 11 }}/>
                <span>
                  {adjustedSPI.compRank < adjustedSPI.districtRank
                    ? `Leads ${adjustedSPI.clusterName} chain-wide · #${adjustedSPI.districtRank} in district`
                    : `#${adjustedSPI.districtRank} in district · #${adjustedSPI.compRank} among ${adjustedSPI.clusterName} peers`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Inbound Risk Banner */}
          {adjustedSPI.inboundRiskActive && (
            <div className="inbound-risk-banner">
              <div className="risk-icon">
                <LocalShippingOutlined sx={{ fontSize: 18 }}/>
              </div>
              <div className="risk-content">
                <span className="risk-title">Inbound Risk Active</span>
                <span className="risk-details">
                  {adjustedSPI.delayedShipments} delayed • {adjustedSPI.oosRiskSkus} OOS-risk SKUs
                </span>
              </div>
              {!isDMReadOnly && (
                <button className="risk-cta">
                  View Inbound
                  <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                </button>
              )}
            </div>
          )}

          {/* AI Store Narrative */}
          <div className="ai-narrative">
            <div className="narrative-icon">
              <AutoAwesomeOutlined sx={{ fontSize: 16 }}/>
            </div>
            <div className="narrative-content">
              <p className="narrative-verdict">
                {adjustedSPI.spiTier === 'Excellence' && <><strong>Store performing at Excellence tier</strong> — SPI tracking above district average with strong execution across all streams.</>}
                {adjustedSPI.spiTier === 'Stable' && <><strong>Store performance stable</strong> — SPI within target range. Minor gaps in compliance and VoC to close before next review.</>}
                {adjustedSPI.spiTier === 'AtRisk' && <><strong>Store performance at risk</strong> — SPI has declined and now sits below district average. Execution and compliance gaps require immediate attention.</>}
                {adjustedSPI.spiTier === 'Crisis' && <><strong>Critical: store performance in Crisis tier</strong> — SPI significantly below threshold. Urgent intervention required across multiple execution streams.</>}
              </p>
              <p className="narrative-explanation">
                {adjustedSPI.spiTier === 'Excellence' && 'Planogram compliance and VoC scores are leading the district. Sustain current execution cadence and replicate best practices to peer stores.'}
                {adjustedSPI.spiTier === 'Stable' && 'Shelf audit compliance and OOS rates are within acceptable range. Focus on closing the remaining VoC gap and ensuring full planogram adherence through end of reset cycle.'}
                {adjustedSPI.spiTier === 'AtRisk' && 'VoC dissatisfaction is preceding sales decline. Planogram gaps in key wall displays are compounding size-run availability issues. Prioritize restocking and audit completion this week.'}
                {adjustedSPI.spiTier === 'Crisis' && 'Multiple execution streams are failing simultaneously — OOS, planogram compliance, and VoC are all critical. Escalate to DM and initiate an emergency action plan for this store.'}
              </p>
            </div>
          </div>

        </div>{/* end sdd-spi-card */}

        {/* Right: Store-Level AI Daily Brief */}
        <div className="sdd-pulse-section">
          <AIDailyBrief
            brief={getStoreBrief(selectedStore)}
            userName={user?.name}
          />
        </div>

      </div>{/* end sdd-executive-pulse */}

      {/* Store Action Queue */}
      <div className="action-queue-section">
        <div className="section-header">
          <h2>
            <BoltOutlined sx={{ fontSize: 18 }}/>
            Priority Actions {isDateFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="sdd-filter-icon"/>}
          </h2>
          <span className="section-subtitle">What to fix first</span>
        </div>
        <div className="action-queue-grid">
          {mockActions.slice(0, 5).map((action, index) => (
            <div key={action.id} className={`action-card priority-${action.priority}`}>
              <div className="action-rank">{index + 1}</div>
              <div className={`action-impact-icon impact-${action.impactType}`}>
                {getImpactIcon(action.impactType)}
              </div>
              <div className="action-content">
                <h4 className="action-title">{action.title}</h4>
                <p className="action-reason">{action.reason}</p>
                {action.location && (
                  <span className="action-location">
                    <PlaceOutlined sx={{ fontSize: 10 }}/>
                    {action.location}
                  </span>
                )}
              </div>
              {!isDMReadOnly && (
                <button className={`action-cta priority-${action.priority}`}>
                  {action.cta}
                  <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Big Six KPI Strip */}
      <div className="kpi-strip">
        <div className="section-header">
          <h2>
            <BarChartOutlined sx={{ fontSize: 18 }}/>
            Key Performance Indicators {isDateFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="sdd-filter-icon"/>}
          </h2>
        </div>
        <div className="kpi-cards">
          {mockKPIs.map((kpi) => (
            <Card
              key={kpi.id}
              className={`kpi-card-tier--${kpi.tier}${selectedKPI?.id === kpi.id ? ' kpi-card--selected' : ''}`}
              onClick={() => setSelectedKPI(selectedKPI?.id === kpi.id ? null : kpi)}
              sx={{
                maxWidth: '100%',
                minHeight: 'unset',
                padding: '14px',
                width: '100%',
                borderRadius: '12px',
                position: 'relative',
                border: selectedKPI?.id === kpi.id ? '1px solid var(--ia-color-primary)' : '1px solid var(--ia-color-border)',
                boxShadow: selectedKPI?.id === kpi.id ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: 'var(--ia-color-primary)', transform: 'translateY(-2px)' },
              }}
            >
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-value">{kpi.value}</span>
              <div className="kpi-variance">
                <span className={`variance-primary ${kpi.varianceType}`}>
                  {kpi.varianceType === 'positive' && <NorthEast sx={{ fontSize: 12 }}/>}
                  {kpi.varianceType === 'negative' && <SouthEast sx={{ fontSize: 12 }}/>}
                  {kpi.variance}
                </span>
                {kpi.secondaryVariance && (
                  <span className="variance-secondary">{kpi.secondaryVariance}</span>
                )}
              </div>
              <div className="kpi-sparkline">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke={kpi.varianceType === 'positive' ? 'var(--ia-color-success)' : kpi.varianceType === 'negative' ? 'var(--ia-color-error)' : 'var(--ia-color-text-secondary)'}
                    strokeWidth="2"
                    points={kpi.trend.map((v, i) => `${(i / (kpi.trend.length - 1)) * 100},${30 - ((v - Math.min(...kpi.trend)) / (Math.max(...kpi.trend) - Math.min(...kpi.trend) || 1)) * 25}`).join(' ')}
                  />
                </svg>
              </div>
              <div className="kpi-click-hint">
                <OpenInNewOutlined sx={{ fontSize: 12 }}/>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Intersection Logic Diagnostic */}
      <div className="diagnostic-section">
        <div className="section-header">
          <h2>
            <GridOnOutlined sx={{ fontSize: 18 }}/>
            Cross-Stream Diagnosis {isDateFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="sdd-filter-icon"/>}
          </h2>
          <span className="section-subtitle">Understanding the root cause</span>
        </div>
        <div className="diagnostic-layout">
          {/* Five-Stream Diagnostic Grid */}
          <div className="stream-grid">
            {mockStreamDiagnostics.map((stream) => (
              <div key={stream.stream} className={`stream-card severity-${stream.severity}`}>
                <div className="stream-header">
                  <div className={`stream-icon severity-${stream.severity}`}>
                    {stream.icon}
                  </div>
                  <span className="stream-name">{stream.stream}</span>
                  <span className={`severity-dot ${stream.severity}`} />
                </div>
                <div className="stream-issue">
                  <span className="issue-tag">{stream.primaryIssue}</span>
                </div>
                <p className="stream-finding">{stream.finding}</p>
                <div className={`stream-variance ${stream.varianceType}`}>
                  {stream.varianceType === 'negative' && <SouthEast sx={{ fontSize: 12 }}/>}
                  {stream.varianceType === 'positive' && <NorthEast sx={{ fontSize: 12 }}/>}
                  {stream.variance}
                </div>
              </div>
            ))}
          </div>

          {/* Cross-Stream Verdict Panel */}
          <div className="verdict-panel">
            <div className="verdict-header">
              <span 
                className="discrepancy-badge"
                style={{ backgroundColor: `${getDiscrepancyColor(crossStreamVerdict.discrepancyClass)}20`, color: getDiscrepancyColor(crossStreamVerdict.discrepancyClass) }}
              >
                {crossStreamVerdict.discrepancyClass}
              </span>
              <span className={`urgency-badge urgency-${crossStreamVerdict.urgency}`}>
                {crossStreamVerdict.urgency === 'high' ? 'High Urgency' : crossStreamVerdict.urgency === 'medium' ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="verdict-content">
              <h4>Assessment</h4>
              <p className="verdict-assessment">{crossStreamVerdict.assessment}</p>
              <h4>Recommended Action</h4>
              <p className="verdict-action">{crossStreamVerdict.recommendedAction}</p>
            </div>
            {!isDMReadOnly && (
              <div className="verdict-cta">
                <button className="verdict-btn primary">
                  <BoltOutlined sx={{ fontSize: 14 }}/>
                  Execute Action Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Tactical Deep Dive Area */}
      <div className="tactical-tabs-section">
        <Tabs
          tabNames={[
            { value: 'overall', label: 'Overall Summary', icon: <DashboardOutlined sx={{ fontSize: 14 }}/> },
            { value: 'sea', label: 'SEA Audit', icon: <AssignmentTurnedInOutlined sx={{ fontSize: 14 }}/> },
            { value: 'voc', label: 'VoC Survey', icon: <ChatBubbleOutlineOutlined sx={{ fontSize: 14 }}/> },
            { value: 'shelf', label: 'Shelf Audit', icon: <CameraAltOutlined sx={{ fontSize: 14 }}/> },
            { value: 'pog', label: 'Store POG', icon: <LayersOutlined sx={{ fontSize: 14 }}/> },
            { value: 'inbound', label: 'Inbound Delivery', icon: <LocalShippingOutlined sx={{ fontSize: 14 }}/> },
            { value: 'phantom', label: 'Phantom Stock', icon: <ShieldOutlined sx={{ fontSize: 14 }}/> },
            { value: 'comp', label: 'Comp Benchmarking', icon: <TrackChangesOutlined sx={{ fontSize: 14 }}/> },
          ]}
          tabPanels={[
            /* Overall Summary Panel */
            <div className="tab-panel overall-panel">
              {/* ── Alerts ── */}
              <div className="sdd-alerts-section">
                <div className="sdd-alerts-header">
                  <div className="sdd-alerts-title">
                    <WarningAmberOutlined sx={{ fontSize: 16, color: 'var(--ia-color-error-strong)' }}/>
                    <span>Alerts</span>
                  </div>
                  <span className="sdd-alerts-count">3 Alerts</span>
                </div>

                {/* KPI Summary Tiles — same component as Operational Breakdown */}
                <div className="sc-inv-summary sdd-alert-kpi-summary">
                  <div className="sc-inv-summary-tile sc-inv-summary--critical">
                    <span className="sc-inv-summary-label">Critical</span>
                    <span className="sc-inv-summary-value">1</span>
                    <span className="sc-inv-summary-sub">auto-fail triggered</span>
                  </div>
                  <div className="sc-inv-summary-tile sc-inv-summary--warn">
                    <span className="sc-inv-summary-label">High Priority</span>
                    <span className="sc-inv-summary-value">2</span>
                    <span className="sc-inv-summary-sub">requires action today</span>
                  </div>
                  <div className="sc-inv-summary-tile sc-inv-summary--info">
                    <span className="sc-inv-summary-label">Overdue Actions</span>
                    <span className="sc-inv-summary-value">2</span>
                    <span className="sc-inv-summary-sub">past SLA deadline</span>
                  </div>
                  <div className="sc-inv-summary-tile sc-inv-summary--total">
                    <span className="sc-inv-summary-label">Total Active</span>
                    <span className="sc-inv-summary-value">3</span>
                    <span className="sc-inv-summary-sub">open alerts this week</span>
                  </div>
                </div>

                <div className="sdd-alert-list">
                  {/* Card 1 — Critical: Safety */}
                  <div className="sdd-alert-card sdd-alert-card--critical">
                    <div className="sdd-alert-chips">
                      <span className="sdd-chip sdd-chip--critical">
                        <ErrorOutlined sx={{ fontSize: 11 }}/>
                        Critical
                      </span>
                    </div>
                    <h4 className="sdd-alert-title">Safety Checkpoint Auto-Fail Detected</h4>
                    <p className="sdd-alert-desc">Emergency exit signage not illuminated — auto-fail triggered in SEA audit 2 hours ago. Immediate rectification required before next district visit.</p>
                    <div className="sdd-alert-impact-row">
                      <span className="sdd-alert-impact-item">
                        <ErrorOutlined sx={{ fontSize: 12 }}/>
                        Immediate resolution required — audit score at risk
                      </span>
                      <span className="sdd-alert-impact-store">
                        <StoreOutlined sx={{ fontSize: 11 }}/>
                        2 hours ago
                      </span>
                    </div>
                    <div className="sdd-alert-footer">
                      <button className="sdd-alert-cta">
                        View Details
                        <KeyboardArrowRight sx={{ fontSize: 16 }}/>
                      </button>
                    </div>
                  </div>

                  {/* Card 2 — VOC Trending */}
                  <div className="sdd-alert-card">
                    <div className="sdd-alert-chips">
                      <span className="sdd-chip sdd-chip--voc">
                        <NorthEast sx={{ fontSize: 11 }}/>
                        VoC Trending
                      </span>
                      <span className="sdd-chip sdd-chip--risk">
                        <WarningAmberOutlined sx={{ fontSize: 11 }}/>
                        Rising Risk
                      </span>
                    </div>
                    <h4 className="sdd-alert-title">"Checkout Wait" — Top Rising Complaint</h4>
                    <p className="sdd-alert-desc">Mentions up +35% over last 2 weeks. Correlates with peak-hour staffing gaps and declining VoC satisfaction score from 4.2 → 3.8.</p>
                    <div className="sdd-alert-store-pills">
                      <span className="sdd-store-pill">10am–2pm peak window</span>
                      <span className="sdd-store-pill">5pm–7pm evening rush</span>
                      <span className="sdd-store-pill">Checkout Lanes 3 & 4</span>
                    </div>
                    <div className="sdd-alert-ask-alan">
                      <AutoAwesomeOutlined sx={{ fontSize: 12 }}/>
                      Ask Alan has prepared a staffing action plan for this theme
                    </div>
                    <div className="sdd-alert-footer">
                      <button className="sdd-alert-cta">
                        View Details
                        <KeyboardArrowRight sx={{ fontSize: 16 }}/>
                      </button>
                    </div>
                  </div>

                  {/* Card 3 — Inventory Risk */}
                  <div className="sdd-alert-card">
                    <div className="sdd-alert-chips">
                      <span className="sdd-chip sdd-chip--impacted">
                        <SouthEast sx={{ fontSize: 11 }}/>
                        8 SKUs at Risk
                      </span>
                      <span className="sdd-chip sdd-chip--overdue">
                        <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                        2 overdue actions
                      </span>
                    </div>
                    <h4 className="sdd-alert-title">Inbound Shipment Delay — OOS Risk</h4>
                    <p className="sdd-alert-desc">DC shipment delayed by 1 day. 8 SKUs in Women's &amp; Men's projected to hit zero stock before arrival. Shelf replenishment plan required.</p>
                    <div className="sdd-alert-impact-row">
                      <span className="sdd-alert-impact-item">
                        <AttachMoneyOutlined sx={{ fontSize: 12 }}/>
                        Potential $2.1K daily revenue risk if unresolved
                      </span>
                      <span className="sdd-alert-impact-store">
                        <StoreOutlined sx={{ fontSize: 11 }}/>
                        6 hours ago
                      </span>
                    </div>
                    <div className="sdd-alert-footer">
                      <button className="sdd-alert-cta">
                        View Details
                        <KeyboardArrowRight sx={{ fontSize: 16 }}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── AI Recommendations ── */}
              <div className="sdd-recs-section">
                <div className="sdd-recs-header">
                  <AutoAwesomeOutlined sx={{ fontSize: 15, color: 'var(--ia-color-primary)' }}/>
                  <span>AI Recommendations</span>
                </div>
                <div className="sdd-recs-list">
                  <div className="sdd-rec-item">
                    <div className="sdd-rec-icon sdd-rec-icon--urgent">
                      <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                    </div>
                    <div className="sdd-rec-body">
                      <span className="sdd-rec-title">Address safety compliance immediately</span>
                      <p>Emergency signage failure requires same-day resolution before district visit</p>
                    </div>
                  </div>
                  <div className="sdd-rec-item">
                    <div className="sdd-rec-icon sdd-rec-icon--high">
                      <GroupOutlined sx={{ fontSize: 14 }}/>
                    </div>
                    <div className="sdd-rec-body">
                      <span className="sdd-rec-title">Review peak hour staffing coverage</span>
                      <p>10am–2pm window showing 35% increase in checkout wait complaints</p>
                    </div>
                  </div>
                  <div className="sdd-rec-item">
                    <div className="sdd-rec-icon sdd-rec-icon--high">
                      <InventoryOutlined sx={{ fontSize: 14 }}/>
                    </div>
                    <div className="sdd-rec-body">
                      <span className="sdd-rec-title">Prepare shelf plan for delayed inbound</span>
                      <p>Prioritize 8 OOS-risk SKUs for immediate shelf placement when shipment arrives</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ,
            /* SEA Audit Panel */
            <div className="tab-panel sea-panel">
              <div className="sea-header">
                <Card sx={{ maxWidth: '100%', minHeight: 'unset', padding: '16px 28px', borderRadius: '10px', background: 'var(--ia-color-warning-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="sea-score-label">Current SEA Score</span>
                  <span className="sea-score-value">76.4</span>
                  <span className="sea-score-change negative">-2.8 vs last audit</span>
                </Card>
                <div className="sea-summary">
                  <div className="summary-stat">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Categories Audited</span>
                  </div>
                  <div className="summary-stat warning">
                    <span className="stat-value">1</span>
                    <span className="stat-label">Auto-Fail</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-value">3</span>
                    <span className="stat-label">Below Target</span>
                  </div>
                </div>
              </div>

              {/* What Must Be Fixed */}
              <div className="fix-before-visit">
                <h3>
                  <WarningAmberOutlined sx={{ fontSize: 16 }}/>
                  What Must Be Fixed Before Next Visit
                </h3>
                <div className="fix-list">
                  <div className="fix-item critical">
                    <span className="fix-category">Safety</span>
                    <span className="fix-issue">Emergency exit signage not illuminated</span>
                    <span className="fix-status">Auto-Fail</span>
                  </div>
                  <div className="fix-item warning">
                    <span className="fix-category">Planogram</span>
                    <span className="fix-issue">Women's Wall Display — 8 missing facings</span>
                    <span className="fix-status">68% compliance</span>
                  </div>
                  <div className="fix-item warning">
                    <span className="fix-category">Cleanliness</span>
                    <span className="fix-issue">Restroom maintenance log incomplete</span>
                    <span className="fix-status">Below target</span>
                  </div>
                </div>
              </div>

              {/* Category Audit Table */}
              <div className="audit-table-wrapper">
                <table className="audit-table wow-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Q1 Score</th>
                      <th>Q2 Score</th>
                      <th>Q3 Score</th>
                      <th>Current</th>
                      <th>Trend</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="status-critical">
                      <td>Safety & Compliance</td>
                      <td>92</td>
                      <td>88</td>
                      <td>85</td>
                      <td>45</td>
                      <td><TrendingDownOutlined sx={{ fontSize: 14 }} className="trend-down"/></td>
                      <td><span className="status-badge critical">Auto-Fail</span></td>
                    </tr>
                    <tr className="status-warning">
                      <td>Planogram Compliance</td>
                      <td>88</td>
                      <td>85</td>
                      <td>80</td>
                      <td>68</td>
                      <td><TrendingDownOutlined sx={{ fontSize: 14 }} className="trend-down"/></td>
                      <td><span className="status-badge warning">Below Target</span></td>
                    </tr>
                    <tr>
                      <td>Store Cleanliness</td>
                      <td>90</td>
                      <td>88</td>
                      <td>86</td>
                      <td>82</td>
                      <td><TrendingDownOutlined sx={{ fontSize: 14 }} className="trend-down"/></td>
                      <td><span className="status-badge stable">On Track</span></td>
                    </tr>
                    <tr>
                      <td>Staff Presentation</td>
                      <td>95</td>
                      <td>94</td>
                      <td>92</td>
                      <td>90</td>
                      <td><Remove sx={{ fontSize: 14 }} className="trend-flat"/></td>
                      <td><span className="status-badge stable">On Track</span></td>
                    </tr>
                    <tr>
                      <td>Customer Service</td>
                      <td>88</td>
                      <td>86</td>
                      <td>84</td>
                      <td>82</td>
                      <td><TrendingDownOutlined sx={{ fontSize: 14 }} className="trend-down"/></td>
                      <td><span className="status-badge stable">On Track</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>,
            /* VoC Survey Panel */
            <div className="tab-panel voc-panel">
              <div className="voc-header">
                <Card sx={{ maxWidth: '100%', minHeight: 'unset', padding: '20px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--ia-color-error-bg) 0%, var(--ia-color-error-soft) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="voc-score-label">VoC Satisfaction</span>
                  <span className="voc-score-value">72%</span>
                  <span className="voc-score-change negative">-5.1% vs last month</span>
                </Card>
                <div className="voc-volume">
                  <span className="volume-value">156</span>
                  <span className="volume-label">Responses this month</span>
                </div>
              </div>

              {/* Sentiment Distribution */}
              <div className="sentiment-section">
                <h3>Sentiment Distribution</h3>
                <div className="sentiment-bars">
                  <div className="sentiment-bar-row">
                    <span className="sentiment-label">
                      <SentimentSatisfiedOutlined sx={{ fontSize: 14 }} className="satisfied"/>
                      Satisfied
                    </span>
                    <div className="sentiment-bar">
                      <div className="bar-fill satisfied" style={{ width: '45%' }} />
                    </div>
                    <span className="sentiment-pct">45%</span>
                  </div>
                  <div className="sentiment-bar-row">
                    <span className="sentiment-label">
                      <SentimentNeutralOutlined sx={{ fontSize: 14 }} className="neutral"/>
                      Neutral
                    </span>
                    <div className="sentiment-bar">
                      <div className="bar-fill neutral" style={{ width: '27%' }} />
                    </div>
                    <span className="sentiment-pct">27%</span>
                  </div>
                  <div className="sentiment-bar-row">
                    <span className="sentiment-label">
                      <SentimentVeryDissatisfiedOutlined sx={{ fontSize: 14 }} className="dissatisfied"/>
                      Dissatisfied
                    </span>
                    <div className="sentiment-bar">
                      <div className="bar-fill dissatisfied" style={{ width: '28%' }} />
                    </div>
                    <span className="sentiment-pct">28%</span>
                  </div>
                </div>
              </div>

              {/* Theme Breakdown */}
              <div className="theme-section">
                <h3>Top Issues by Theme</h3>
                <div className="theme-list">
                  <div className="theme-item">
                    <span className="theme-rank">1</span>
                    <span className="theme-name">Staff Availability</span>
                    <span className="theme-count">42 mentions</span>
                    <span className="theme-change negative">+35%</span>
                  </div>
                  <div className="theme-item">
                    <span className="theme-rank">2</span>
                    <span className="theme-name">Checkout Wait Time</span>
                    <span className="theme-count">28 mentions</span>
                    <span className="theme-change negative">+22%</span>
                  </div>
                  <div className="theme-item">
                    <span className="theme-rank">3</span>
                    <span className="theme-name">Product Availability</span>
                    <span className="theme-count">18 mentions</span>
                    <span className="theme-change negative">+15%</span>
                  </div>
                  <div className="theme-item">
                    <span className="theme-rank">4</span>
                    <span className="theme-name">Store Cleanliness</span>
                    <span className="theme-count">12 mentions</span>
                    <span className="theme-change neutral">+2%</span>
                  </div>
                </div>
              </div>

              {/* Recent Comments */}
              <div className="comments-section">
                <h3>Recent Comments</h3>
                <div className="comments-list">
                  <div className="comment-item negative">
                    <div className="comment-header">
                      <SentimentVeryDissatisfiedOutlined sx={{ fontSize: 14 }}/>
                      <span className="comment-date">Today, 2:15 PM</span>
                    </div>
                    <p>"Waited 15 minutes in line with only 2 registers open during lunch rush. Very frustrating."</p>
                    <span className="comment-theme">Checkout Wait Time</span>
                  </div>
                  <div className="comment-item negative">
                    <div className="comment-header">
                      <SentimentVeryDissatisfiedOutlined sx={{ fontSize: 14 }}/>
                      <span className="comment-date">Today, 11:30 AM</span>
                    </div>
                    <p>"Couldn't find anyone to help me in the electronics section. Ended up leaving without buying."</p>
                    <span className="comment-theme">Staff Availability</span>
                  </div>
                  <div className="comment-item positive">
                    <div className="comment-header">
                      <SentimentSatisfiedOutlined sx={{ fontSize: 14 }}/>
                      <span className="comment-date">Yesterday, 4:45 PM</span>
                    </div>
                    <p>"Great selection and the staff member in produce was very helpful with my questions."</p>
                    <span className="comment-theme">Staff Helpfulness</span>
                  </div>
                </div>
              </div>
            </div>,
            /* Shelf Audit Panel */
            <div className="tab-panel shelf-panel">
              <div className="shelf-header">
                <div className="shelf-score-card">
                  <span className="shelf-score-label">POG Compliance</span>
                  <span className="shelf-score-value">74%</span>
                  <span className="shelf-score-change negative">-8% vs last scan</span>
                </div>
                {!isDMReadOnly && (
                  <div className="shelf-actions">
                    <button className="shelf-action-btn">
                      <CameraAltOutlined sx={{ fontSize: 14 }}/>
                      New Scan
                    </button>
                    <button className="shelf-action-btn secondary">
                      <RefreshOutlined sx={{ fontSize: 14 }}/>
                      Re-scan Section
                    </button>
                  </div>
                )}
              </div>

              {/* Aisle Selector */}
              <div className="aisle-selector">
                <span className="selector-label">Select Section:</span>
                <div className="aisle-chips">
                  <button className="aisle-chip">All</button>
                  <button className="aisle-chip critical">Section B</button>
                  <button className="aisle-chip warning">Section D</button>
                  <button className="aisle-chip">Section A</button>
                  <button className="aisle-chip">Section C</button>
                  <button className="aisle-chip">Accessories</button>
                </div>
              </div>

              {/* Delta Task List */}
              <div className="delta-tasks">
                <h3>
                  <TaskAltOutlined sx={{ fontSize: 16 }}/>
                  Delta Task List — Women's Wall Display
                </h3>
                <div className="task-list">
                  <div className="task-item">
                    <span className="task-action add">ADD</span>
                    <span className="task-detail">Add 3 facings — Floral Print Dress (SKU: WD-2024-FL01)</span>
                    <span className="task-location">Section B, Rail 2</span>
                  </div>
                  <div className="task-item">
                    <span className="task-action add">ADD</span>
                    <span className="task-detail">Add 2 facings — Classic Fit Tee White (SKU: WT-2024-CL01)</span>
                    <span className="task-location">Section A, Shelf 1</span>
                  </div>
                  <div className="task-item">
                    <span className="task-action move">MOVE</span>
                    <span className="task-detail">Move Slim Fit Denim to eye-level rail</span>
                    <span className="task-location">Section C, Rail 3</span>
                  </div>
                  <div className="task-item">
                    <span className="task-action replace">REPLACE</span>
                    <span className="task-detail">Replace size labels — V-Neck Basics collection</span>
                    <span className="task-location">Section D, Shelf 2</span>
                  </div>
                  <div className="task-item">
                    <span className="task-action remove">REMOVE</span>
                    <span className="task-detail">Remove last season item — Winter Cardigan</span>
                    <span className="task-location">Section A, Rail 4</span>
                  </div>
                </div>
              </div>

              {/* Compliance Breakdown */}
              <div className="compliance-breakdown">
                <h3>Compliance by Section</h3>
                <div className="breakdown-grid">
                  <div className="breakdown-item critical">
                    <span className="breakdown-section">Section B</span>
                    <span className="breakdown-score">58%</span>
                    <span className="breakdown-issues">7 issues</span>
                  </div>
                  <div className="breakdown-item warning">
                    <span className="breakdown-section">Section A</span>
                    <span className="breakdown-score">72%</span>
                    <span className="breakdown-issues">3 issues</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-section">Section C</span>
                    <span className="breakdown-score">85%</span>
                    <span className="breakdown-issues">2 issues</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-section">Section D</span>
                    <span className="breakdown-score">92%</span>
                    <span className="breakdown-issues">1 issue</span>
                  </div>
                </div>
              </div>
            </div>,
            /* Store POG Panel */
            <div className="tab-panel pog-panel">
              <div className="pog-header">
                <div className="pog-info">
                  <h3>Active Planogram</h3>
                  <span className="pog-version">Women's Wall Display v2.1</span>
                  <span className="pog-date">Published: Apr 1, 2026</span>
                </div>
                {!isDMReadOnly && (
                  <button className="request-change-btn">
                    <DescriptionOutlined sx={{ fontSize: 14 }}/>
                    Request POG Change
                  </button>
                )}
              </div>

              {/* POG Viewer */}
              <div className="pog-viewer">
                <div className="viewer-toolbar">
                  <PremiumDropdown
                    value={pogSectionFilter}
                    options={[
                      { value: '', label: 'All Sections' },
                      { value: 'section-a', label: "Section A — Women's Tops" },
                      { value: 'section-b', label: "Section B — Women's Dresses" },
                      { value: 'section-c', label: "Section C — Women's Denim" },
                      { value: 'section-d', label: "Section D — Women's Basics" },
                    ]}
                    onChange={setPogSectionFilter}
                  />
                  <PremiumDropdown
                    value={pogCategoryFilter}
                    options={[
                      { value: '', label: 'All Categories' },
                      { value: 'tops', label: 'Tops & Blouses' },
                      { value: 'dresses', label: 'Dresses' },
                      { value: 'denim', label: 'Denim & Pants' },
                      { value: 'basics', label: 'Basics & Essentials' },
                    ]}
                    onChange={setPogCategoryFilter}
                  />
                </div>
                <div className="viewer-content">
                  <img 
                    src={LocalizedWomensWall} 
                    alt="Women's Wall Display - Localized Planogram" 
                    className="pog-image"
                  />
                </div>
              </div>

              {/* Pending Requests */}
              <div className="pending-requests">
                <h3>Pending Requests</h3>
                <div className="request-list">
                  <div className="request-item">
                    <span className="request-status pending">Pending Review</span>
                    <span className="request-title">Request additional facing for high-velocity SKU</span>
                    <span className="request-date">Submitted Apr 10, 2026</span>
                  </div>
                </div>
              </div>

              {/* OOS Adaptations */}
              <div className="oos-adaptations">
                <h3>OOS Adaptation Notifications</h3>
                <div className="adaptation-list">
                  <div className="adaptation-item">
                    <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                    <span>Temporary substitution active for SKU 49000028904 — use adjacent facing</span>
                  </div>
                </div>
              </div>
            </div>,
            /* Inbound Delivery Panel */
            <div className="tab-panel inbound-panel">
              <div className="inbound-header">
                <div className="inbound-summary">
                  <div className="summary-card">
                    <span className="summary-value">5</span>
                    <span className="summary-label">Shipments (7 days)</span>
                  </div>
                  <div className="summary-card warning">
                    <span className="summary-value">2</span>
                    <span className="summary-label">Delayed</span>
                  </div>
                  <div className="summary-card critical">
                    <span className="summary-value">8</span>
                    <span className="summary-label">OOS-Risk SKUs</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Timeline */}
              <div className="shipment-timeline">
                <h3>7-Day Shipment Timeline</h3>
                <div className="timeline-grid">
                  <div className="timeline-day">
                    <span className="day-label">Today</span>
                    <div className="day-shipments">
                      <div className="shipment-badge delayed">
                        <LocalShippingOutlined sx={{ fontSize: 12 }}/>
                        <span>APL-2041 (Delayed)</span>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-day">
                    <span className="day-label">Tomorrow</span>
                    <div className="day-shipments">
                      <div className="shipment-badge delayed">
                        <LocalShippingOutlined sx={{ fontSize: 12 }}/>
                        <span>APL-2042 (Delayed)</span>
                      </div>
                      <div className="shipment-badge scheduled">
                        <LocalShippingOutlined sx={{ fontSize: 12 }}/>
                        <span>APL-2045</span>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-day">
                    <span className="day-label">Apr 29</span>
                    <div className="day-shipments">
                      <div className="shipment-badge scheduled">
                        <LocalShippingOutlined sx={{ fontSize: 12 }}/>
                        <span>APL-2048</span>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-day">
                    <span className="day-label">Apr 30</span>
                    <div className="day-shipments">
                      <div className="shipment-badge scheduled">
                        <LocalShippingOutlined sx={{ fontSize: 12 }}/>
                        <span>APL-2050</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OOS Risk Prioritization */}
              <div className="oos-priority">
                <h3>OOS-Risk SKU Prioritization</h3>
                <div className="oos-list">
                  <div className="oos-item high">
                    <span className="oos-rank">1</span>
                    <span className="oos-sku">V-Neck Basic Tee — White (M)</span>
                    <span className="oos-velocity">High Velocity</span>
                    <span className="oos-eta">ETA: Tomorrow</span>
                  </div>
                  <div className="oos-item high">
                    <span className="oos-rank">2</span>
                    <span className="oos-sku">Floral Print Dress — Navy (S)</span>
                    <span className="oos-velocity">High Velocity</span>
                    <span className="oos-eta">ETA: Tomorrow</span>
                  </div>
                  <div className="oos-item medium">
                    <span className="oos-rank">3</span>
                    <span className="oos-sku">Slim Fit Denim — Dark Wash (L)</span>
                    <span className="oos-velocity">Medium Velocity</span>
                    <span className="oos-eta">ETA: Apr 29</span>
                  </div>
                </div>
              </div>
            </div>,
            /* ── Phantom Stock Heatmap Panel ── */
            (() => {
              const psFiltered = PHANTOM_ROWS.filter(r => {
                if (psSearch.trim()) {
                  const q = psSearch.toLowerCase();
                  if (!r.department.toLowerCase().includes(q) && !r.itemClass.toLowerCase().includes(q) && !r.subDepartment.toLowerCase().includes(q)) return false;
                }
                if (psDeptFilter && r.department !== psDeptFilter) return false;
                if (psSubDeptFilter && r.subDepartment !== psSubDeptFilter) return false;
                if (psClassFilter && r.itemClass !== psClassFilter) return false;
                if (psRiskFilter && r.riskLevel !== psRiskFilter) return false;
                if (psStatusFilter && r.status !== psStatusFilter) return false;
                return true;
              });

              const totalPhantomSkus = PHANTOM_ROWS.reduce((s, r) => s + r.phantomSkus, 0);
              const totalInvRisk = PHANTOM_ROWS.reduce((s, r) => s + r.inventoryValue, 0);
              const highestRiskDept = (() => {
                const counts: Record<string, number> = {};
                PHANTOM_ROWS.filter(r => r.riskLevel === 'High').forEach(r => { counts[r.department] = (counts[r.department] || 0) + r.phantomSkus; });
                return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Women's";
              })();
              const openCycleTasks = PHANTOM_ROWS.filter(r => r.linkedTasks > 0 && r.status !== 'Resolved').reduce((s, r) => s + r.linkedTasks, 0);

              const psTotalPages = Math.ceil(psFiltered.length / PS_PAGE_SIZE);
              const psPaginated = psFiltered.slice(psPage * PS_PAGE_SIZE, (psPage + 1) * PS_PAGE_SIZE);

              const psRiskColor = (risk: PhantomRisk | null) => {
                if (!risk) return { bg: '#f8fafc', text: '#cbd5e1', border: '#f1f5f9' };
                if (risk === 'High') return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
                if (risk === 'Medium') return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
                if (risk === 'Low') return { bg: '#fefce8', text: '#a16207', border: '#fde68a' };
                return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
              };

              const psDepts = Array.from(new Set(PHANTOM_ROWS.map(r => r.department)));
              const psSubDepts = Array.from(new Set(PHANTOM_ROWS.map(r => r.subDepartment)));
              const psClasses = Array.from(new Set(PHANTOM_ROWS.map(r => r.itemClass)));

              return (
                <div className="tab-panel phantom-panel">
                  {/* Header */}
                  <div className="ps-panel-header">
                    <div className="ps-panel-title-row">
                      <ShieldOutlined sx={{ fontSize: 18, color: '#7c3aed' }} />
                      <h3 className="ps-panel-title">Phantom Stock Heatmap</h3>
                      <span className="ps-auto-badge">System-Generated · Auto Tasks Created</span>
                    </div>
                    <p className="ps-panel-subtitle">
                      System-detected inventory with zero or abnormally low sales. Linked Inventory Check / Cycle Count tasks are auto-created in Operations Queue.
                    </p>
                  </div>

                  {/* KPI Strip */}
                  <div className="ps-kpi-strip">
                    <div className="ps-kpi-tile ps-kpi-tile--purple">
                      <div className="ps-kpi-icon">
                        <ShieldOutlined sx={{ fontSize: 18 }} />
                      </div>
                      <div className="ps-kpi-content">
                        <span className="ps-kpi-value">{totalPhantomSkus}</span>
                        <span className="ps-kpi-label">Phantom Stock SKUs</span>
                      </div>
                    </div>
                    <div className="ps-kpi-tile ps-kpi-tile--red">
                      <div className="ps-kpi-icon">
                        <AttachMoneyOutlined sx={{ fontSize: 18 }} />
                      </div>
                      <div className="ps-kpi-content">
                        <span className="ps-kpi-value">${(totalInvRisk / 1000).toFixed(1)}K</span>
                        <span className="ps-kpi-label">Inventory at Risk</span>
                      </div>
                    </div>
                    <div className="ps-kpi-tile ps-kpi-tile--orange">
                      <div className="ps-kpi-icon">
                        <WarningAmberOutlined sx={{ fontSize: 18 }} />
                      </div>
                      <div className="ps-kpi-content">
                        <span className="ps-kpi-value">{highestRiskDept}</span>
                        <span className="ps-kpi-label">Highest Risk Dept</span>
                      </div>
                    </div>
                    <div className="ps-kpi-tile ps-kpi-tile--blue">
                      <div className="ps-kpi-icon">
                        <AssignmentOutlined sx={{ fontSize: 18 }} />
                      </div>
                      <div className="ps-kpi-content">
                        <span className="ps-kpi-value">{openCycleTasks}</span>
                        <span className="ps-kpi-label">Open Cycle Count Tasks</span>
                      </div>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="ps-heatmap-card">
                    <div className="ps-heatmap-header">
                      <span className="ps-heatmap-title">Department × Class Risk Concentration</span>
                      <div className="ps-heatmap-legend">
                        <span className="ps-legend-item ps-legend--high">High</span>
                        <span className="ps-legend-item ps-legend--medium">Medium</span>
                        <span className="ps-legend-item ps-legend--low">Low</span>
                        <span className="ps-legend-item ps-legend--minimal">Minimal</span>
                        <span className="ps-legend-item ps-legend--none">—</span>
                      </div>
                    </div>
                    <div className="ps-heatmap-wrap">
                      <table className="ps-heatmap-table">
                        <thead>
                          <tr>
                            <th className="ps-heatmap-corner">Dept \ Class</th>
                            {PS_HEATMAP_CLASSES.map(cls => (
                              <th key={cls} className="ps-heatmap-col-header">{cls}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {PS_HEATMAP_DEPTS.map(dept => (
                            <tr key={dept}>
                              <td className="ps-heatmap-row-header">{dept}</td>
                              {PS_HEATMAP_CLASSES.map(cls => {
                                const risk = PS_HEATMAP_DATA[dept]?.[cls] ?? null;
                                const colors = psRiskColor(risk);
                                const matchingRow = PHANTOM_ROWS.find(r => r.department === dept && r.itemClass === cls);
                                return (
                                  <td key={cls}
                                    className={`ps-heatmap-cell${risk ? ' ps-heatmap-cell--active' : ''}`}
                                    style={risk ? { background: colors.bg, border: `1.5px solid ${colors.border}` } : {}}
                                    onClick={() => matchingRow && setPsDrawerRow(matchingRow)}
                                    title={risk ? `${dept} / ${cls} — ${risk} Risk` : ''}
                                  >
                                    {risk && (
                                      <span className="ps-heatmap-cell-label" style={{ color: colors.text }}>
                                        {risk}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="ps-filters-bar">
                    <div className="ps-search-wrap">
                      <SearchOutlined className="ps-search-icon" />
                      <input
                        className="ps-search-input"
                        placeholder="Search department, class…"
                        value={psSearch}
                        onChange={e => { setPsSearch(e.target.value); setPsPage(0); }}
                      />
                    </div>
                    <select className="ps-filter-select" value={psDeptFilter} onChange={e => { setPsDeptFilter(e.target.value); setPsPage(0); }}>
                      <option value="">All Departments</option>
                      {psDepts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="ps-filter-select" value={psSubDeptFilter} onChange={e => { setPsSubDeptFilter(e.target.value); setPsPage(0); }}>
                      <option value="">All Sub-Depts</option>
                      {psSubDepts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="ps-filter-select" value={psClassFilter} onChange={e => { setPsClassFilter(e.target.value); setPsPage(0); }}>
                      <option value="">All Classes</option>
                      {psClasses.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="ps-filter-select" value={psRiskFilter} onChange={e => { setPsRiskFilter(e.target.value); setPsPage(0); }}>
                      <option value="">All Risk Levels</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Minimal">Minimal</option>
                    </select>
                    <select className="ps-filter-select" value={psStatusFilter} onChange={e => { setPsStatusFilter(e.target.value); setPsPage(0); }}>
                      <option value="">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Dismissed">Dismissed</option>
                    </select>
                    <select className="ps-filter-select" value={psTimeWindow} onChange={e => setPsTimeWindow(e.target.value)}>
                      <option value="7d">Last 7 days</option>
                      <option value="14d">Last 14 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                    </select>
                  </div>

                  {/* Table */}
                  <div className="ps-table-card">
                    <div className="ps-table-header-bar">
                      <span className="ps-table-title">Phantom Stock Detail — Department / Class Level</span>
                      <span className="ps-table-count">{psFiltered.length} records</span>
                    </div>
                    <div className="ps-table-wrap">
                      <table className="ps-table">
                        <thead>
                          <tr>
                            <th>Department</th>
                            <th>Sub-Dept / Class</th>
                            <th>Phantom SKUs</th>
                            <th>Inv. Units</th>
                            <th>BOH Units</th>
                            <th>Shelf Qty</th>
                            <th>Last Sale</th>
                            <th>Zero-Sales Days</th>
                            <th>Inv. Value</th>
                            <th>Risk Level</th>
                            <th>Tasks</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {psPaginated.length === 0 ? (
                            <tr><td colSpan={13}>
                              <div className="ps-empty">
                                <ShieldOutlined sx={{ fontSize: 24, color: '#cbd5e1' }} />
                                <p>No records match your filters</p>
                              </div>
                            </td></tr>
                          ) : psPaginated.map(row => {
                            const rc = psRiskColor(row.riskLevel);
                            return (
                              <tr key={row.id} className="ps-table-row" onClick={() => setPsDrawerRow(row)}>
                                <td>
                                  <span className="ps-dept-name">{row.department}</span>
                                </td>
                                <td>
                                  <div className="ps-dept-cell">
                                    <span className="ps-dept-sub">{row.subDepartment}</span>
                                    <span className="ps-dept-class">{row.itemClass}</span>
                                  </div>
                                </td>
                                <td><span className="ps-num-badge">{row.phantomSkus}</span></td>
                                <td>{row.inventoryUnits}</td>
                                <td>{row.bohUnits}</td>
                                <td>{row.shelfQty}</td>
                                <td><span className="ps-date">{row.lastSaleDate}</span></td>
                                <td>
                                  <span className={`ps-days-badge${row.zeroSalesDays >= 20 ? ' ps-days-badge--high' : row.zeroSalesDays >= 14 ? ' ps-days-badge--med' : ''}`}>
                                    {row.zeroSalesDays}d
                                  </span>
                                </td>
                                <td><span className="ps-value">${row.inventoryValue.toLocaleString()}</span></td>
                                <td>
                                  <span className="ps-risk-chip" style={{ background: rc.bg, color: rc.text, borderColor: rc.border }}>
                                    {row.riskLevel}
                                  </span>
                                </td>
                                <td>
                                  {row.linkedTasks > 0 ? (
                                    <span className="ps-linked-tasks">
                                      <LinkOutlined sx={{ fontSize: 12 }} /> {row.linkedTasks}
                                    </span>
                                  ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                </td>
                                <td>
                                  <span className={`ps-status-chip ps-status-chip--${row.status.toLowerCase().replace(' ', '_')}`}>
                                    {row.status}
                                  </span>
                                </td>
                                <td>
                                  <button className="ps-review-btn" onClick={e => { e.stopPropagation(); setPsDrawerRow(row); }}>
                                    Review
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {psTotalPages > 1 && (
                      <div className="ps-pagination">
                        <span className="ps-pag-info">
                          Showing {psPage * PS_PAGE_SIZE + 1}–{Math.min((psPage + 1) * PS_PAGE_SIZE, psFiltered.length)} of {psFiltered.length}
                        </span>
                        <button className="ps-pag-btn" disabled={psPage === 0} onClick={() => setPsPage(p => p - 1)}>
                          <ChevronLeftOutlined sx={{ fontSize: 16 }} />
                        </button>
                        <button className="ps-pag-btn" disabled={psPage >= psTotalPages - 1} onClick={() => setPsPage(p => p + 1)}>
                          <ChevronRightOutlined sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right-Side Detail Drawer */}
                  {psDrawerRow && (
                    <div className="ps-drawer-overlay" onClick={() => setPsDrawerRow(null)}>
                      <div className="ps-drawer" onClick={e => e.stopPropagation()}>
                        <div className="ps-drawer-header">
                          <div className="ps-drawer-title-row">
                            <div>
                              <h3 className="ps-drawer-title">{psDrawerRow.department} — {psDrawerRow.itemClass}</h3>
                              <span className="ps-drawer-sub">{psDrawerRow.subDepartment}</span>
                            </div>
                            <button className="ps-drawer-close" onClick={() => setPsDrawerRow(null)}>
                              <CloseOutlined sx={{ fontSize: 18 }} />
                            </button>
                          </div>
                          <div className="ps-drawer-chips">
                            {(() => { const rc = psRiskColor(psDrawerRow.riskLevel); return (
                              <span className="ps-risk-chip" style={{ background: rc.bg, color: rc.text, borderColor: rc.border }}>
                                {psDrawerRow.riskLevel} Risk
                              </span>
                            ); })()}
                            <span className={`ps-status-chip ps-status-chip--${psDrawerRow.status.toLowerCase().replace(' ', '_')}`}>
                              {psDrawerRow.status}
                            </span>
                            {psDrawerRow.linkedTasks > 0 && (
                              <span className="ps-linked-tasks">
                                <LinkOutlined sx={{ fontSize: 12 }} /> {psDrawerRow.linkedTasks} Linked Task{psDrawerRow.linkedTasks > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Why Flagged */}
                        <div className="ps-drawer-section">
                          <div className="ps-drawer-section-title">
                            <InfoOutlined sx={{ fontSize: 15, color: '#7c3aed' }} /> Why Flagged
                          </div>
                          <div className="ps-drawer-why-box">
                            {psDrawerRow.whyFlagged}
                          </div>
                        </div>

                        {/* Inventory & Sales Summary */}
                        <div className="ps-drawer-section">
                          <div className="ps-drawer-section-title">
                            <InventoryOutlined sx={{ fontSize: 15, color: '#2563eb' }} /> Inventory &amp; Sales Evidence
                          </div>
                          <div className="ps-drawer-ev-grid">
                            <div className="ps-drawer-ev-tile">
                              <span className="ps-drawer-ev-label">Inventory Units</span>
                              <span className="ps-drawer-ev-value">{psDrawerRow.inventoryUnits}</span>
                            </div>
                            <div className="ps-drawer-ev-tile">
                              <span className="ps-drawer-ev-label">BOH Units</span>
                              <span className="ps-drawer-ev-value">{psDrawerRow.bohUnits}</span>
                            </div>
                            <div className="ps-drawer-ev-tile">
                              <span className="ps-drawer-ev-label">Shelf Qty</span>
                              <span className="ps-drawer-ev-value">{psDrawerRow.shelfQty}</span>
                            </div>
                            <div className="ps-drawer-ev-tile">
                              <span className="ps-drawer-ev-label">Zero-Sales Days</span>
                              <span className="ps-drawer-ev-value ps-drawer-ev-value--alert">{psDrawerRow.zeroSalesDays}d</span>
                            </div>
                            <div className="ps-drawer-ev-tile">
                              <span className="ps-drawer-ev-label">Last Sale Date</span>
                              <span className="ps-drawer-ev-value">{psDrawerRow.lastSaleDate}</span>
                            </div>
                            <div className="ps-drawer-ev-tile">
                              <span className="ps-drawer-ev-label">Inventory Value</span>
                              <span className="ps-drawer-ev-value">${psDrawerRow.inventoryValue.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* SKU Breakdown */}
                        <div className="ps-drawer-section">
                          <div className="ps-drawer-section-title">
                            <GridOnOutlined sx={{ fontSize: 15, color: '#2563eb' }} /> SKU-Level Breakdown
                          </div>
                          <div className="ps-sku-list">
                            {psDrawerRow.skuBreakdown.map((sku, i) => {
                              const rc = psRiskColor(sku.riskLevel);
                              return (
                                <div key={i} className="ps-sku-row">
                                  <div className="ps-sku-main">
                                    <span className="ps-sku-name">{sku.productName}</span>
                                    <span className="ps-sku-code">{sku.sku}</span>
                                  </div>
                                  <div className="ps-sku-stats">
                                    <span className="ps-sku-stat"><span className="ps-sku-stat-label">BOH</span> {sku.bohQty}</span>
                                    <span className="ps-sku-stat"><span className="ps-sku-stat-label">Shelf</span> {sku.shelfQty}</span>
                                    <span className="ps-sku-stat"><span className="ps-sku-stat-label">0-Sale</span> {sku.zeroSalesDays}d</span>
                                    <span className="ps-sku-stat"><span className="ps-sku-stat-label">Value</span> ${sku.inventoryValue.toLocaleString()}</span>
                                    <span className="ps-risk-chip ps-risk-chip--sm" style={{ background: rc.bg, color: rc.text, borderColor: rc.border }}>{sku.riskLevel}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Linked Tasks */}
                        {psDrawerRow.linkedTasks > 0 && (
                          <div className="ps-drawer-section">
                            <div className="ps-drawer-section-title">
                              <AssignmentOutlined sx={{ fontSize: 15, color: '#2563eb' }} /> Linked Operations Queue Tasks
                            </div>
                            <div className="ps-linked-task-card">
                              <div className="ps-linked-task-top">
                                <span className="ps-linked-task-id">OQ-PS-{psDrawerRow.id.replace('ps-', '')}</span>
                                <span className="ps-auto-task-badge">Auto-Created</span>
                                <span className={`ps-status-chip ps-status-chip--${psDrawerRow.status.toLowerCase().replace(' ', '_')}`}>{psDrawerRow.status}</span>
                              </div>
                              <div className="ps-linked-task-body">
                                <span className="ps-linked-task-type">Inventory Check / Cycle Count</span>
                                <span className="ps-linked-task-store">{selectedStore.storeName}</span>
                              </div>
                              <div className="ps-linked-task-meta">
                                <span>Source: <strong>Phantom Stock Alert</strong></span>
                                <span>SLA: 24–48 hours</span>
                                <span>Priority: {psDrawerRow.riskLevel === 'High' ? 'High' : 'Medium'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Recommended Action */}
                        <div className="ps-drawer-section">
                          <div className="ps-drawer-section-title">
                            <AutoAwesomeOutlined sx={{ fontSize: 15, color: '#2563eb' }} /> Recommended Action
                          </div>
                          <div className="ps-drawer-rec-box">
                            {psDrawerRow.recommendedAction}
                          </div>
                        </div>

                        <div className="ps-drawer-footer">
                          <button className="ps-drawer-ops-btn" onClick={() => setPsDrawerRow(null)}>
                            <OpenInNewOutlined sx={{ fontSize: 14 }} /> Open in Operations Queue
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })(),
            /* Comp Benchmarking Panel */
            (() => {
              const sm = storeMetrics;
              const spiVsMedian = sm.spi - sm.compMedianSpi;
              const compRankDiffersDistrict = sm.compRank !== sm.districtRank;

              // KPI gaps — derived from SPI vs cluster median
              type GapItem = { kpi: string; value: string; label: string; cls: string };
              const kpiGaps: GapItem[] = sm.spiTier === 'Excellence'
                ? [
                    { kpi: 'Net Sales',       value: `+${(Math.abs(spiVsMedian) * 0.3).toFixed(1)}%`, label: 'above median', cls: 'positive' },
                    { kpi: 'VoC Satisfaction', value: `+${(Math.abs(spiVsMedian) * 0.25).toFixed(1)} pts`, label: 'above median', cls: 'positive' },
                    { kpi: 'SEA Score',        value: `+${(Math.abs(spiVsMedian) * 0.4).toFixed(1)}`, label: 'above median', cls: 'positive' },
                    { kpi: 'GM%',              value: '+0.8%', label: 'above median', cls: 'positive' },
                  ]
                : sm.spiTier === 'Stable'
                ? [
                    { kpi: 'Net Sales',        value: `${spiVsMedian >= 0 ? '+' : ''}${(spiVsMedian * 0.3).toFixed(1)}%`, label: spiVsMedian >= 0 ? 'above median' : 'near median', cls: spiVsMedian >= 0 ? 'positive' : 'neutral' },
                    { kpi: 'VoC Satisfaction', value: `-1.8 pts`, label: 'near median', cls: 'neutral' },
                    { kpi: 'SEA Score',        value: `-2.1`,     label: 'near median', cls: 'neutral' },
                    { kpi: 'GM%',              value: '-0.3%',    label: 'near median', cls: 'neutral' },
                  ]
                : [
                    { kpi: 'Net Sales',        value: `-${(Math.abs(spiVsMedian) * 0.35).toFixed(1)}%`, label: 'below median', cls: 'negative' },
                    { kpi: 'VoC Satisfaction', value: `-${(Math.abs(spiVsMedian) * 0.28).toFixed(1)} pts`, label: 'below median', cls: 'negative' },
                    { kpi: 'SEA Score',        value: `-${(Math.abs(spiVsMedian) * 0.45).toFixed(1)}`, label: 'below median', cls: 'negative' },
                    { kpi: 'GM%',              value: '-1.2%',    label: 'below median', cls: 'negative' },
                  ];

              // Prescriptive actions — dynamic per tier
              type PrescriptiveAction = { icon: React.ReactNode; title: string; body: string };
              const prescriptiveActions: PrescriptiveAction[] = sm.spiTier === 'Excellence'
                ? [
                    { icon: <EmojiEventsOutlined sx={{ fontSize: 14 }}/>, title: 'Share your playbook with chain peers', body: `${sm.topPeer.storeName} (${sm.topPeer.district}) leads the ${sm.clusterName} cluster at SPI ${sm.topPeer.spi}. Request a best-practice exchange to identify the remaining gap.` },
                    { icon: <GroupOutlined sx={{ fontSize: 14 }}/>, title: 'Sustain staffing advantage', body: `Top ${sm.clusterName} stores maintain peak-hour coverage as a primary lever. Protect current staffing model during upcoming schedule changes.` },
                    { icon: <AttachMoneyOutlined sx={{ fontSize: 14 }}/>, title: 'Expand high-lift planogram templates', body: `Your execution scores are ${Math.abs(spiVsMedian)} pts above the ${sm.clusterName} median. Codify current POG approach for chain-wide replication.` },
                  ]
                : sm.spiTier === 'Stable'
                ? [
                    { icon: <GppGoodOutlined sx={{ fontSize: 14 }}/>, title: 'Close SEA gap vs cluster median', body: `Addressing 2–3 open SEA checkpoints could move this store from #${sm.compRank} to #${Math.max(1, sm.compRank - 1)} in the ${sm.clusterName} comp ranking.` },
                    { icon: <GroupOutlined sx={{ fontSize: 14 }}/>, title: 'Benchmark peak-hour coverage', body: `Top-ranked ${sm.clusterName} stores average 12% more floor staff during 11am–2pm. A targeted shift reallocation would improve both VoC and conversion.` },
                    { icon: <AttachMoneyOutlined sx={{ fontSize: 14 }}/>, title: 'Planogram compliance as a sales lever', body: `${sm.clusterName} stores with full POG compliance average +4.8% net sales vs those with gaps. Prioritise current reset cycle completion.` },
                  ]
                : [
                    { icon: <WarningAmberOutlined sx={{ fontSize: 14 }}/>, title: 'Urgent: close SPI gap to cluster median', body: `This store is ${Math.abs(spiVsMedian)} pts below the ${sm.clusterName} median (SPI ${sm.compMedianSpi}). Execution improvements in VoC and SEA are the fastest path to recovery.` },
                    { icon: <GppGoodOutlined sx={{ fontSize: 14 }}/>, title: 'Benchmark against nearest comp peer', body: `${sm.topPeer.storeName} (${sm.topPeer.district}) leads this cluster at SPI ${sm.topPeer.spi}. Request a DM-level knowledge share to identify root-cause gaps.` },
                    { icon: <AttachMoneyOutlined sx={{ fontSize: 14 }}/>, title: 'Revenue recovery vs comp median', body: `Based on comp performance, closing the SPI gap to median could recover an estimated $${sm.spiTier === 'Crisis' ? '12–18K' : '6–10K'} in weekly revenue.` },
                  ];

              return (
                <div className="tab-panel comp-panel">
                  {/* Rank vs District callout row */}
                  {compRankDiffersDistrict && (
                    <div className={`comp-context-callout ${sm.compRank < sm.districtRank ? 'comp-context-positive' : 'comp-context-amber'}`}>
                      <InfoOutlined sx={{ fontSize: 14 }}/>
                      <div className="comp-context-text">
                        <strong>
                          {sm.compRank < sm.districtRank
                            ? `Chain-wide ${sm.clusterName} leader — above district ranking`
                            : `Chain-wide rank is lower than district rank`}
                        </strong>
                        <span>
                          This store ranks <strong>#{sm.districtRank} of {sm.districtTotal}</strong> in {districtContext.name}, but <strong>#{sm.compRank} of {sm.compTotal}</strong> among all {sm.clusterName} stores chain-wide.
                          {sm.compRank > 1 && ` Top-ranked peer: ${sm.topPeer.storeName} (${sm.topPeer.district}) at SPI ${sm.topPeer.spi}.`}
                          {' '}Chain-wide ranking compares execution across all similar-format stores regardless of district.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="comp-header">
                    <div className="comp-rank-large">
                      <span className="rank-label">Comp Store Rank</span>
                      <span className="rank-value">#{sm.compRank} of {sm.compTotal}</span>
                      <span className={`rank-change ${sm.compMovement > 0 ? 'positive' : sm.compMovement < 0 ? 'negative' : ''}`}>
                        {sm.compMovement > 0 ? `↑ ${sm.compMovement} spots` : sm.compMovement < 0 ? `↓ ${Math.abs(sm.compMovement)} spots` : '— No change'} this month
                      </span>
                    </div>
                    <div className="peer-group">
                      <h4>Peer Group Definition</h4>
                      <p>{sm.clusterName} stores chain-wide with comparable format and sales volume — {sm.compTotal} stores across {[...new Set(CLUSTER_PEERS[sm.clusterName]?.map(p => p.district) ?? [])].length} districts</p>
                    </div>
                  </div>

                  {/* KPI Gap vs Comp Median */}
                  <div className="kpi-gap-section">
                    <h3>KPI Gap vs {sm.clusterName} Median (SPI {sm.compMedianSpi})</h3>
                    <div className="gap-grid">
                      {kpiGaps.map(g => (
                        <div key={g.kpi} className={`gap-item ${g.cls}`}>
                          <span className="gap-kpi">{g.kpi}</span>
                          <span className="gap-value">{g.value}</span>
                          <span className="gap-label">{g.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prescriptive Actions */}
                  <div className="prescriptive-actions">
                    <h3>
                      <AutoAwesomeOutlined sx={{ fontSize: 16 }}/>
                      Prescriptive Actions Based on Comp Analysis
                    </h3>
                    <div className="prescriptive-list">
                      {prescriptiveActions.map((action, i) => (
                        <div key={i} className="prescriptive-item">
                          <div className="prescriptive-icon">{action.icon}</div>
                          <div className="prescriptive-content">
                            <span className="prescriptive-title">{action.title}</span>
                            <p>{action.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })(),
          ]}
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
        />
      </div>

      {/* KPI Detail Side Panel */}
      {selectedKPI && (
        <div className="kpi-panel-overlay" onClick={() => setSelectedKPI(null)}>
          <div className="kpi-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>{selectedKPI.label}</h3>
              <button className="panel-close" onClick={() => setSelectedKPI(null)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            <div className="panel-content">
              <div className="panel-value-section">
                <span className="panel-current-value">{selectedKPI.value}</span>
                <span className={`panel-variance ${selectedKPI.varianceType}`}>
                  {selectedKPI.variance} {selectedKPI.secondaryVariance}
                </span>
              </div>
              <div className="panel-comparison">
                <div className="comparison-row">
                  <span>vs Last Period</span>
                  <span className={selectedKPI.varianceType}>{selectedKPI.variance}</span>
                </div>
                <div className="comparison-row">
                  <span>vs Last Year</span>
                  <span className={selectedKPI.varianceType}>
                    {selectedKPI.varianceType === 'positive' ? '+' : ''}{selectedKPI.variance}
                  </span>
                </div>
                <div className="comparison-row">
                  <span>vs District Avg</span>
                  <span className={storeMetrics.vsDistrictAvg >= 0 ? 'positive' : 'negative'}>
                    {storeMetrics.vsDistrictAvg >= 0 ? '+' : ''}{storeMetrics.vsDistrictAvg} pts
                  </span>
                </div>
              </div>
              <div className="panel-chart">
                <h4>Trend (Last 8 Weeks)</h4>
                <div className="chart-placeholder">
                  <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke={selectedKPI.varianceType === 'positive' ? 'var(--ia-color-success)' : 'var(--ia-color-error)'}
                      strokeWidth="2"
                      points="0,20 40,25 80,35 120,40 160,50 200,60 240,70 300,80"
                    />
                  </svg>
                </div>
              </div>
              <div className="panel-ai-summary">
                <AutoAwesomeOutlined sx={{ fontSize: 14 }}/>
                <p>Declining trend over 8 weeks. Performance is 4.2% below district average. Immediate attention required on staffing and shelf availability.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDeepDive;

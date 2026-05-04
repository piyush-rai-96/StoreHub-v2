import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import Remove from '@mui/icons-material/Remove';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import SwapVert from '@mui/icons-material/SwapVert';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import ChatOutlined from '@mui/icons-material/ChatOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import Check from '@mui/icons-material/Check';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import FavoriteOutlined from '@mui/icons-material/FavoriteOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import NorthEast from '@mui/icons-material/NorthEast';
import SouthEast from '@mui/icons-material/SouthEast';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import { Button, Card, Tabs } from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import { openAskAlan } from '../utils/openAskAlan';
import { AIDailyBrief } from '../components/common/AIDailyBrief';
import './DistrictIntelligence.css';

// Types
interface StoreData {
  id: string;
  rank: number;
  storeNumber: string;
  storeName: string;
  dpi: number;
  dpiTier: 'Excellence' | 'Stable' | 'AtRisk' | 'Crisis';
  netSales: number;
  netSalesVar: number;
  seaScore: number;
  vocSatisfied: number;
  topVocIssue: string;
  topSeaIssue: string;
  trend: 'up' | 'down' | 'flat';
  status: 'critical' | 'warning' | 'stable' | 'excellent';
}

type DistrictTier = 'Excellence' | 'Stable' | 'AtRisk' | 'Crisis';
type MomentumType = 'Improving' | 'Slipping' | 'Flat';


// Mock Data
const mockStores: StoreData[] = [
  { id: '1', rank: 1, storeNumber: '2034', storeName: 'Nashville Flagship', dpi: 94, dpiTier: 'Excellence', netSales: 245000, netSalesVar: 8.2, seaScore: 96, vocSatisfied: 92, topVocIssue: 'Wait times', topSeaIssue: '-', trend: 'up', status: 'excellent' },
  { id: '2', rank: 2, storeNumber: '1876', storeName: 'Memphis Central', dpi: 91, dpiTier: 'Excellence', netSales: 198000, netSalesVar: 5.4, seaScore: 94, vocSatisfied: 89, topVocIssue: 'Product availability', topSeaIssue: '-', trend: 'up', status: 'excellent' },
  { id: '3', rank: 3, storeNumber: '3421', storeName: 'Knoxville East', dpi: 85, dpiTier: 'Stable', netSales: 176000, netSalesVar: 2.1, seaScore: 88, vocSatisfied: 85, topVocIssue: 'Staff friendliness', topSeaIssue: 'Signage', trend: 'flat', status: 'stable' },
  { id: '4', rank: 4, storeNumber: '2198', storeName: 'Chattanooga Riverside', dpi: 82, dpiTier: 'Stable', netSales: 165000, netSalesVar: -1.2, seaScore: 85, vocSatisfied: 82, topVocIssue: 'Checkout speed', topSeaIssue: 'Planogram', trend: 'down', status: 'stable' },
  { id: '5', rank: 5, storeNumber: '4532', storeName: 'Murfreesboro Plaza', dpi: 78, dpiTier: 'Stable', netSales: 142000, netSalesVar: -3.5, seaScore: 82, vocSatisfied: 78, topVocIssue: 'Product quality', topSeaIssue: 'Cleanliness', trend: 'down', status: 'warning' },
  { id: '6', rank: 6, storeNumber: '1234', storeName: 'Franklin Town Center', dpi: 72, dpiTier: 'AtRisk', netSales: 128000, netSalesVar: -6.8, seaScore: 75, vocSatisfied: 71, topVocIssue: 'Staff availability', topSeaIssue: 'Planogram', trend: 'down', status: 'warning' },
  { id: '7', rank: 7, storeNumber: '5678', storeName: 'Clarksville Crossing', dpi: 65, dpiTier: 'AtRisk', netSales: 112000, netSalesVar: -9.2, seaScore: 68, vocSatisfied: 65, topVocIssue: 'Long queues', topSeaIssue: 'Safety', trend: 'down', status: 'critical' },
  { id: '8', rank: 8, storeNumber: '9012', storeName: 'Johnson City Mall', dpi: 58, dpiTier: 'Crisis', netSales: 95000, netSalesVar: -12.4, seaScore: 62, vocSatisfied: 58, topVocIssue: 'Overall experience', topSeaIssue: 'Multiple', trend: 'down', status: 'critical' },
];

// Audit Compliance Heatmap Data
const auditCategories = [
  'Planogram',
  'Signage',
  'Cleanliness',
  'Safety',
  'Stock Rotation',
  'Pricing',
  'Backroom',
  'Customer Area',
];

const auditComplianceData: Record<string, Record<string, number>> = {
  '2034': { Planogram: 98, Signage: 95, Cleanliness: 100, Safety: 97, 'Stock Rotation': 92, Pricing: 96, Backroom: 94, 'Customer Area': 99 },
  '1876': { Planogram: 95, Signage: 92, Cleanliness: 96, Safety: 94, 'Stock Rotation': 88, Pricing: 93, Backroom: 90, 'Customer Area': 97 },
  '3421': { Planogram: 82, Signage: 75, Cleanliness: 90, Safety: 88, 'Stock Rotation': 85, Pricing: 87, Backroom: 78, 'Customer Area': 91 },
  '2198': { Planogram: 68, Signage: 85, Cleanliness: 88, Safety: 82, 'Stock Rotation': 79, Pricing: 84, Backroom: 72, 'Customer Area': 86 },
  '4532': { Planogram: 72, Signage: 78, Cleanliness: 65, Safety: 80, 'Stock Rotation': 70, Pricing: 75, Backroom: 68, 'Customer Area': 74 },
  '1234': { Planogram: 55, Signage: 62, Cleanliness: 70, Safety: 58, 'Stock Rotation': 48, Pricing: 65, Backroom: 52, 'Customer Area': 60 },
  '5678': { Planogram: 42, Signage: 50, Cleanliness: 55, Safety: 38, 'Stock Rotation': 35, Pricing: 48, Backroom: 40, 'Customer Area': 45 },
  '9012': { Planogram: 28, Signage: 35, Cleanliness: 40, Safety: 22, 'Stock Rotation': 18, Pricing: 32, Backroom: 25, 'Customer Area': 30 },
};

// District options for HQ role selector
const HQ_DISTRICT_OPTIONS = [
  { id: 'd14', label: 'District 14 — Tennessee', dm: 'John Doe', storeCount: 8, seedOffset: 0 },
  { id: 'd08', label: 'District 08 — Georgia', dm: 'Sarah Kim', storeCount: 6, seedOffset: 1 },
  { id: 'd22', label: 'District 22 — Carolina', dm: 'Marcus Reed', storeCount: 7, seedOffset: 2 },
  { id: 'd11', label: 'District 11 — Florida', dm: 'Lisa Nguyen', storeCount: 9, seedOffset: 3 },
  { id: 'd19', label: 'District 19 — Alabama', dm: 'David Park', storeCount: 5, seedOffset: 4 },
];

// Generate district-varied store data
const DISTRICT_STORE_NAMES: string[][] = [
  ['Nashville Flagship', 'Memphis Central', 'Knoxville East', 'Chattanooga Riverside', 'Murfreesboro Plaza', 'Franklin Town Center', 'Clarksville Crossing', 'Johnson City Mall'],
  ['Peachtree Plaza', 'Savannah Square', 'Augusta Mall', 'Athens Center', 'Macon Point', 'Columbus Walk'],
  ['Charlotte Hub', 'Raleigh Court', 'Durham Heights', 'Wilmington Bay', 'Greensboro Lane', 'Asheville Park', 'Chapel Hill'],
  ['Miami Central', 'Orlando Gateway', 'Tampa Bay Mall', 'Jacksonville Hub', 'Fort Lauderdale', 'St. Petersburg', 'Tallahassee', 'Gainesville', 'Naples Point'],
  ['Birmingham Center', 'Huntsville Plaza', 'Montgomery Mall', 'Mobile Bay', 'Tuscaloosa Walk'],
];

const getDistrictStores = (seedOffset: number): StoreData[] => {
  if (seedOffset === 0) return mockStores;
  const names = DISTRICT_STORE_NAMES[seedOffset] || mockStores.map(s => s.storeName);
  const baseDPIs = [94, 91, 85, 82, 78, 72, 65, 58, 70];
  return names.map((name, i) => {
    const shift = ((seedOffset * 7 + i * 3) % 11) - 4;
    const baseDpi = (baseDPIs[i % baseDPIs.length] || 75) + shift;
    const dpi = Math.max(48, Math.min(98, baseDpi));
    const salesBase = [245000, 198000, 176000, 165000, 142000, 128000, 112000, 95000, 135000];
    const salesShift = ((seedOffset * 11 + i * 5) % 20) - 10;
    return {
      id: `${seedOffset}-${i}`,
      rank: i + 1,
      storeNumber: String(1000 + seedOffset * 200 + i * 111),
      storeName: name,
      dpi,
      dpiTier: (dpi >= 90 ? 'Excellence' : dpi >= 75 ? 'Stable' : dpi >= 60 ? 'AtRisk' : 'Crisis') as StoreData['dpiTier'],
      netSales: Math.max(80000, (salesBase[i % salesBase.length] || 120000) + salesShift * 5000),
      netSalesVar: parseFloat(((i < 3 ? 5 : i < 5 ? 0 : -5) + shift * 0.5).toFixed(1)),
      seaScore: Math.max(55, Math.min(98, dpi + ((i * 3 + seedOffset) % 7) - 3)),
      vocSatisfied: Math.max(50, Math.min(95, dpi - 5 + ((i * 2 + seedOffset) % 6))),
      topVocIssue: ['Wait times', 'Product availability', 'Staff friendliness', 'Checkout speed', 'Product quality', 'Staff availability', 'Long queues', 'Overall experience'][i % 8],
      topSeaIssue: i < 2 ? '-' : ['Signage', 'Planogram', 'Cleanliness', 'Safety', 'Stock Rotation', 'Pricing'][i % 6],
      trend: (dpi >= 85 ? 'up' : dpi >= 70 ? 'flat' : 'down') as StoreData['trend'],
      status: (dpi >= 85 ? 'excellent' : dpi >= 70 ? 'stable' : dpi >= 60 ? 'warning' : 'critical') as StoreData['status'],
    };
  });
};

// Generate audit compliance data keyed by store numbers for a district
const getDistrictAuditData = (seedOffset: number): Record<string, Record<string, number>> => {
  if (seedOffset === 0) return auditComplianceData;
  const stores = getDistrictStores(seedOffset);
  const result: Record<string, Record<string, number>> = {};
  stores.forEach((store, i) => {
    const base = Math.max(30, Math.min(95, store.dpi + ((i * 3 + seedOffset) % 10) - 4));
    const row: Record<string, number> = {};
    auditCategories.forEach((cat, ci) => {
      const variation = ((seedOffset * 7 + i * 5 + ci * 3) % 25) - 12;
      row[cat] = Math.max(15, Math.min(100, base + variation));
    });
    result[store.storeNumber] = row;
  });
  return result;
};

// Generate district-varied metrics
const getDistrictMetrics = (seedOffset: number) => {
  const dpiShifts = [0, -3, -5, -8, -2];
  const s = dpiShifts[seedOffset] || 0;
  return {
    week: { dpi: 87 + s, tier: (87 + s >= 85 ? 'Excellence' : 'Stable') as DistrictTier, rank: 3 + seedOffset, dpiChange: +(2.4 - seedOffset * 0.3).toFixed(1), momentum: (s >= -2 ? 'Improving' : 'Slipping') as MomentumType, momentumDelta: +(3.2 + s * 0.2).toFixed(1), chainAvg: 79, scoreSales: 92 + s, scoreExecution: 85 + s, scoreVoC: 84 + s },
    month: { dpi: 82 + s, tier: (82 + s >= 85 ? 'Excellence' : 82 + s >= 70 ? 'Stable' : 'AtRisk') as DistrictTier, rank: 5 + seedOffset, dpiChange: +(1.8 - seedOffset * 0.2).toFixed(1), momentum: (s >= -3 ? 'Improving' : 'Flat') as MomentumType, momentumDelta: +(2.1 + s * 0.15).toFixed(1), chainAvg: 79, scoreSales: 86 + s, scoreExecution: 80 + s, scoreVoC: 79 + s },
    quarter: { dpi: 80 + s, tier: (80 + s >= 85 ? 'Excellence' : 80 + s >= 70 ? 'Stable' : 'AtRisk') as DistrictTier, rank: 6 + seedOffset, dpiChange: +(1.2 - seedOffset * 0.15).toFixed(1), momentum: 'Flat' as MomentumType, momentumDelta: +(0.8 + s * 0.1).toFixed(1), chainAvg: 79, scoreSales: 84 + s, scoreExecution: 78 + s, scoreVoC: 77 + s },
  };
};

// Per-district KPI overrides (weekly base values by district)
const DISTRICT_KPI_OVERRIDES: Record<string, Record<string, { primaryValue: string; delta: string; deltaDirection: 'up' | 'down' | 'flat'; microInsight: string; status: 'positive' | 'negative' | 'neutral' | 'warning' }>> = {
  d14: {}, // default — use base districtKPIs
  d08: {
    'sales-performance': { primaryValue: '$982K', delta: '+2.1%', deltaDirection: 'up', microInsight: '4W avg $945K', status: 'positive' },
    'voc-satisfaction': { primaryValue: '78%', delta: '-3.2pts', deltaDirection: 'down', microInsight: 'Top theme: Checkout Speed', status: 'warning' },
    'voc-issue-rate': { primaryValue: '4.2', delta: '+0.9', deltaDirection: 'up', microInsight: '4 of 6 stores affected', status: 'negative' },
    'shelf-audit': { primaryValue: '84%', delta: '-11pts', deltaDirection: 'down', microInsight: '8th week below target', status: 'negative' },
    'oos-rate': { primaryValue: '5.1%', delta: '+1.3pts', deltaDirection: 'up', microInsight: 'Shrinkage driving 45%', status: 'negative' },
    'margin-health': { primaryValue: '33.1%', delta: '-85 bps', deltaDirection: 'down', microInsight: 'Clearance markdown pressure', status: 'negative' },
  },
  d22: {
    'sales-performance': { primaryValue: '$1.08M', delta: '+1.4%', deltaDirection: 'up', microInsight: '4W avg $1.02M', status: 'positive' },
    'voc-satisfaction': { primaryValue: '75%', delta: '-4.8pts', deltaDirection: 'down', microInsight: 'Top theme: Staff Availability', status: 'negative' },
    'voc-issue-rate': { primaryValue: '4.6', delta: '+1.2', deltaDirection: 'up', microInsight: '5 of 7 stores affected', status: 'negative' },
    'shelf-audit': { primaryValue: '81%', delta: '-14pts', deltaDirection: 'down', microInsight: 'Planogram reset overdue', status: 'negative' },
    'oos-rate': { primaryValue: '4.8%', delta: '+1.1pts', deltaDirection: 'up', microInsight: 'Seasonal items drive 55%', status: 'negative' },
    'margin-health': { primaryValue: '33.6%', delta: '-60 bps', deltaDirection: 'down', microInsight: 'Promotional mix impact', status: 'warning' },
  },
  d11: {
    'sales-performance': { primaryValue: '$1.52M', delta: '+5.8%', deltaDirection: 'up', microInsight: '4W avg $1.41M', status: 'positive' },
    'voc-satisfaction': { primaryValue: '71%', delta: '-6.1pts', deltaDirection: 'down', microInsight: 'Top theme: Product Availability', status: 'negative' },
    'voc-issue-rate': { primaryValue: '5.1', delta: '+1.8', deltaDirection: 'up', microInsight: '7 of 9 stores affected', status: 'negative' },
    'shelf-audit': { primaryValue: '76%', delta: '-19pts', deltaDirection: 'down', microInsight: 'Cooler section dragging avg', status: 'negative' },
    'oos-rate': { primaryValue: '6.2%', delta: '+2.4pts', deltaDirection: 'up', microInsight: 'Perishables drive 65%', status: 'negative' },
    'margin-health': { primaryValue: '32.8%', delta: '-110 bps', deltaDirection: 'down', microInsight: 'Spoilage & markdown heavy', status: 'negative' },
  },
  d19: {
    'sales-performance': { primaryValue: '$640K', delta: '+3.6%', deltaDirection: 'up', microInsight: '4W avg $618K', status: 'positive' },
    'voc-satisfaction': { primaryValue: '85%', delta: '+1.2pts', deltaDirection: 'up', microInsight: 'Top theme: Staff Friendliness', status: 'positive' },
    'voc-issue-rate': { primaryValue: '2.4', delta: '-0.3', deltaDirection: 'down', microInsight: '1 of 5 stores affected', status: 'positive' },
    'shelf-audit': { primaryValue: '92%', delta: '-3pts', deltaDirection: 'down', microInsight: 'Near target, minor gaps', status: 'neutral' },
    'oos-rate': { primaryValue: '2.8%', delta: '+0.2pts', deltaDirection: 'up', microInsight: 'Well managed supply', status: 'neutral' },
    'margin-health': { primaryValue: '35.1%', delta: '+15 bps', deltaDirection: 'up', microInsight: 'Efficient ops, low markdown', status: 'positive' },
  },
};

// Per-district triage data
interface TriageItem { id: string; title: string; priority: 'critical' | 'high' | 'medium'; stores: string; metric: string }
const DISTRICT_TRIAGE: Record<string, TriageItem[]> = {
  d14: [
    { id: 'voc-messy', title: 'VoC: Messy Aisles', priority: 'high', stores: 'Johnson City Mall · Clarksville Crossing · Franklin Town Center', metric: '+22% theme spike' },
    { id: 'sea-fire', title: 'SEA Auto-Fail: Fire Exit', priority: 'critical', stores: 'Johnson City Mall — Display blocking exit', metric: 'Escalated to DM · Pending' },
    { id: 'oos-risk', title: 'Inbound OOS Risk', priority: 'medium', stores: 'Clarksville Crossing — 3 SKUs delayed 48h', metric: 'Adaptation pending approval' },
  ],
  d08: [
    { id: 'shrink-spike', title: 'Shrinkage Spike', priority: 'critical', stores: 'Peachtree Plaza · Savannah Square', metric: '+18% vs 4-week avg' },
    { id: 'voc-checkout', title: 'VoC: Checkout Speed', priority: 'high', stores: 'Augusta Mall · Athens Center', metric: '+31% complaint volume' },
    { id: 'labor-gap', title: 'Labor Coverage Gap', priority: 'medium', stores: 'Macon Point — Weekend understaffed', metric: '3 shifts uncovered' },
  ],
  d22: [
    { id: 'compliance-drop', title: 'Planogram Compliance Drop', priority: 'high', stores: 'Charlotte Hub · Durham Heights', metric: 'Below 60% threshold' },
    { id: 'safety-incident', title: 'Safety Incident Reported', priority: 'critical', stores: 'Raleigh Court — Wet floor slip', metric: 'Investigation required' },
    { id: 'stock-expiry', title: 'Stock Expiry Alert', priority: 'medium', stores: 'Wilmington Bay — 28 items near expiry', metric: '48h window to clear' },
  ],
  d11: [
    { id: 'voc-availability', title: 'VoC: Product Availability', priority: 'high', stores: 'Miami Central · Orlando Gateway · Tampa Bay Mall', metric: '+26% theme spike' },
    { id: 'cooler-temp', title: 'Cooler Temp Deviation', priority: 'critical', stores: 'Jacksonville Hub — Dairy cooler at 48°F', metric: 'Maintenance dispatched' },
    { id: 'promo-execution', title: 'Promo Execution Miss', priority: 'medium', stores: 'Fort Lauderdale · St. Petersburg', metric: '4 endcaps incomplete' },
  ],
  d19: [
    { id: 'audit-backlog', title: 'Audit Backlog', priority: 'high', stores: 'Birmingham Center · Huntsville Plaza', metric: '6 audits overdue' },
    { id: 'receiving-delay', title: 'Receiving Dock Delay', priority: 'medium', stores: 'Montgomery Mall — 12h behind schedule', metric: 'Impacts floor replenishment' },
    { id: 'voc-cleanliness', title: 'VoC: Store Cleanliness', priority: 'high', stores: 'Mobile Bay · Tuscaloosa Walk', metric: '+19% negative mentions' },
  ],
};

// Per-district broadcast analytics
interface BroadcastOverview { active: number; sentThisWeek: number; ackPct: number; avgAckTime: string; trendVsLast: number }
interface BroadcastGapItem { store: string; storeId: string; pending: number; overdue: number; lastAck: string }
interface BroadcastEffectivenessRow {
  id: string; name: string; priority: 'high' | 'medium' | 'low'; ackRate: number; avgAckTime: string;
  status: 'good' | 'at-risk'; type: 'Action Required' | 'Informational'; sentAt: string; stores: number; acked: number;
}
interface StoreComplianceRow { store: string; storeId: string; ackRate: number; avgTime: string; tier: 'top' | 'at-risk' | 'defaulter'; missedCount: number }
interface BroadcastInsight { pattern: string; recommendation: string }
interface DistrictBroadcastAnalytics {
  overview: BroadcastOverview;
  gaps: BroadcastGapItem[];
  effectiveness: BroadcastEffectivenessRow[];
  storeCompliance: StoreComplianceRow[];
  insights: BroadcastInsight[];
}
const DISTRICT_BROADCAST_ANALYTICS: Record<string, DistrictBroadcastAnalytics> = {
  d14: {
    overview: { active: 3, sentThisWeek: 12, ackPct: 94, avgAckTime: '1h 12m', trendVsLast: 3 },
    gaps: [
      { store: 'Franklin Town Center', storeId: '1234', pending: 3, overdue: 1, lastAck: '18h ago' },
      { store: 'Johnson City Mall', storeId: '9012', pending: 2, overdue: 2, lastAck: '26h ago' },
      { store: 'Murfreesboro Plaza', storeId: '4532', pending: 1, overdue: 0, lastAck: '4h ago' },
    ],
    effectiveness: [
      { id: 'b1', name: 'Safety Protocol Update', priority: 'high', ackRate: 100, avgAckTime: '32m', status: 'good', type: 'Action Required', sentAt: '2h ago', stores: 8, acked: 8 },
      { id: 'b2', name: 'Weekend Staffing Reminder', priority: 'medium', ackRate: 75, avgAckTime: '2h 15m', status: 'at-risk', type: 'Action Required', sentAt: 'Yesterday', stores: 8, acked: 6 },
      { id: 'b3', name: 'Planogram Refresh Checklist', priority: 'low', ackRate: 63, avgAckTime: '4h 30m', status: 'at-risk', type: 'Informational', sentAt: '3d ago', stores: 8, acked: 5 },
      { id: 'b4', name: 'Monthly Performance Summary', priority: 'low', ackRate: 100, avgAckTime: '1h 05m', status: 'good', type: 'Informational', sentAt: '5d ago', stores: 8, acked: 8 },
      { id: 'b5', name: 'Fire Exit Compliance Alert', priority: 'high', ackRate: 88, avgAckTime: '45m', status: 'good', type: 'Action Required', sentAt: '1d ago', stores: 8, acked: 7 },
    ],
    storeCompliance: [
      { store: 'Nashville Flagship', storeId: '2034', ackRate: 100, avgTime: '28m', tier: 'top', missedCount: 0 },
      { store: 'Memphis Central', storeId: '1876', ackRate: 100, avgTime: '35m', tier: 'top', missedCount: 0 },
      { store: 'Knoxville East', storeId: '3421', ackRate: 96, avgTime: '42m', tier: 'top', missedCount: 0 },
      { store: 'Chattanooga Riverside', storeId: '2198', ackRate: 92, avgTime: '1h 10m', tier: 'top', missedCount: 1 },
      { store: 'Murfreesboro Plaza', storeId: '4532', ackRate: 83, avgTime: '2h 20m', tier: 'at-risk', missedCount: 3 },
      { store: 'Franklin Town Center', storeId: '1234', ackRate: 75, avgTime: '3h 40m', tier: 'defaulter', missedCount: 5 },
      { store: 'Clarksville Crossing', storeId: '5678', ackRate: 88, avgTime: '1h 45m', tier: 'at-risk', missedCount: 2 },
      { store: 'Johnson City Mall', storeId: '9012', ackRate: 67, avgTime: '5h 10m', tier: 'defaulter', missedCount: 7 },
    ],
    insights: [
      { pattern: 'Safety and compliance broadcasts achieve 98% ack within 2 hours — significantly faster than informational ones (avg 4h).', recommendation: 'Tag operational broadcasts as "Action Required" to leverage the urgency pattern and improve ack rates.' },
      { pattern: 'Johnson City Mall and Franklin Town Center are repeat defaulters — combined 12 missed acks in the last 2 weeks, correlating with their low DPI scores.', recommendation: 'Schedule a focused 1:1 with store managers at both locations. Consider linking broadcast compliance to performance reviews.' },
      { pattern: 'Broadcasts sent before 9 AM get 22% faster acknowledgement vs those sent after 2 PM.', recommendation: 'Shift non-urgent broadcasts to early morning delivery windows for better engagement.' },
    ],
  },
  d08: {
    overview: { active: 2, sentThisWeek: 8, ackPct: 88, avgAckTime: '1h 45m', trendVsLast: -2 },
    gaps: [
      { store: 'Macon Point', storeId: '8901', pending: 2, overdue: 1, lastAck: '22h ago' },
      { store: 'Athens Center', storeId: '9012', pending: 1, overdue: 0, lastAck: '6h ago' },
    ],
    effectiveness: [
      { id: 'b1', name: 'Shrinkage Prevention Alert', priority: 'high', ackRate: 83, avgAckTime: '55m', status: 'good', type: 'Action Required', sentAt: '1h ago', stores: 6, acked: 5 },
      { id: 'b2', name: 'Holiday Staffing Plan', priority: 'medium', ackRate: 67, avgAckTime: '3h 10m', status: 'at-risk', type: 'Action Required', sentAt: '4h ago', stores: 6, acked: 4 },
      { id: 'b3', name: 'New POS Training Schedule', priority: 'low', ackRate: 100, avgAckTime: '1h 30m', status: 'good', type: 'Informational', sentAt: '2d ago', stores: 6, acked: 6 },
      { id: 'b4', name: 'Loss Prevention Walkthrough', priority: 'high', ackRate: 100, avgAckTime: '40m', status: 'good', type: 'Action Required', sentAt: '3d ago', stores: 6, acked: 6 },
    ],
    storeCompliance: [
      { store: 'Savannah Square', storeId: '8234', ackRate: 100, avgTime: '30m', tier: 'top', missedCount: 0 },
      { store: 'Columbus Walk', storeId: '8345', ackRate: 100, avgTime: '38m', tier: 'top', missedCount: 0 },
      { store: 'Peachtree Plaza', storeId: '8456', ackRate: 88, avgTime: '1h 50m', tier: 'at-risk', missedCount: 2 },
      { store: 'Augusta Mall', storeId: '8567', ackRate: 83, avgTime: '2h 05m', tier: 'at-risk', missedCount: 3 },
      { store: 'Athens Center', storeId: '9012', ackRate: 79, avgTime: '2h 40m', tier: 'at-risk', missedCount: 3 },
      { store: 'Macon Point', storeId: '8901', ackRate: 63, avgTime: '4h 20m', tier: 'defaulter', missedCount: 6 },
    ],
    insights: [
      { pattern: 'Ack rate dropped 2% vs last week — driven by Macon Point missing 2 consecutive high-priority broadcasts.', recommendation: 'Send a direct nudge to Macon Point manager. Consider escalating if pattern continues next week.' },
      { pattern: 'Training-type broadcasts achieve 100% ack — stores treat them as mandatory. Operational alerts lag at 75%.', recommendation: 'Reframe operational alerts with clearer deadlines and consequences to improve urgency.' },
    ],
  },
  d22: {
    overview: { active: 4, sentThisWeek: 15, ackPct: 82, avgAckTime: '2h 30m', trendVsLast: -5 },
    gaps: [
      { store: 'Chapel Hill', storeId: '2201', pending: 4, overdue: 3, lastAck: '32h ago' },
      { store: 'Raleigh Court', storeId: '2202', pending: 3, overdue: 1, lastAck: '14h ago' },
      { store: 'Wilmington Bay', storeId: '2203', pending: 2, overdue: 0, lastAck: '8h ago' },
    ],
    effectiveness: [
      { id: 'b1', name: 'Wet Floor Safety Reminder', priority: 'high', ackRate: 71, avgAckTime: '1h 40m', status: 'at-risk', type: 'Action Required', sentAt: '30m ago', stores: 7, acked: 5 },
      { id: 'b2', name: 'Planogram Reset Deadline', priority: 'high', ackRate: 57, avgAckTime: '3h 20m', status: 'at-risk', type: 'Action Required', sentAt: '3h ago', stores: 7, acked: 4 },
      { id: 'b3', name: 'Stock Rotation Checklist', priority: 'medium', ackRate: 86, avgAckTime: '2h 05m', status: 'good', type: 'Action Required', sentAt: 'Yesterday', stores: 7, acked: 6 },
      { id: 'b4', name: 'Safety Incident Follow-up', priority: 'high', ackRate: 100, avgAckTime: '25m', status: 'good', type: 'Action Required', sentAt: '1d ago', stores: 7, acked: 7 },
    ],
    storeCompliance: [
      { store: 'Charlotte Hub', storeId: '2204', ackRate: 100, avgTime: '32m', tier: 'top', missedCount: 0 },
      { store: 'Durham Heights', storeId: '2205', ackRate: 93, avgTime: '55m', tier: 'top', missedCount: 1 },
      { store: 'Asheville Park', storeId: '2207', ackRate: 93, avgTime: '48m', tier: 'top', missedCount: 1 },
      { store: 'Greensboro Lane', storeId: '2206', ackRate: 87, avgTime: '1h 30m', tier: 'at-risk', missedCount: 2 },
      { store: 'Wilmington Bay', storeId: '2203', ackRate: 80, avgTime: '2h 10m', tier: 'at-risk', missedCount: 3 },
      { store: 'Raleigh Court', storeId: '2202', ackRate: 67, avgTime: '3h 50m', tier: 'defaulter', missedCount: 6 },
      { store: 'Chapel Hill', storeId: '2201', ackRate: 53, avgTime: '5h 30m', tier: 'defaulter', missedCount: 9 },
    ],
    insights: [
      { pattern: 'Ack rate dropped 5% WoW — worst decline across all districts. Chapel Hill has not acknowledged any broadcast in 32 hours.', recommendation: 'Escalate Chapel Hill immediately. The store may have a staffing or device access issue preventing acknowledgements.' },
      { pattern: 'High-priority broadcasts in Carolina are only achieving 64% avg ack — compared to 94% in District 14 (Tennessee).', recommendation: 'Review broadcast delivery method. Consider requiring read-receipts or adding SMS fallback for critical alerts.' },
    ],
  },
  d11: {
    overview: { active: 5, sentThisWeek: 18, ackPct: 79, avgAckTime: '2h 55m', trendVsLast: -4 },
    gaps: [
      { store: 'Naples Point', storeId: '1101', pending: 5, overdue: 3, lastAck: '28h ago' },
      { store: 'Gainesville', storeId: '1102', pending: 3, overdue: 2, lastAck: '20h ago' },
      { store: 'Fort Lauderdale', storeId: '1103', pending: 2, overdue: 0, lastAck: '6h ago' },
    ],
    effectiveness: [
      { id: 'b1', name: 'Cooler Maintenance Alert', priority: 'high', ackRate: 78, avgAckTime: '1h 20m', status: 'at-risk', type: 'Action Required', sentAt: '45m ago', stores: 9, acked: 7 },
      { id: 'b2', name: 'Promo Execution Deadline', priority: 'high', ackRate: 56, avgAckTime: '3h 45m', status: 'at-risk', type: 'Action Required', sentAt: '2h ago', stores: 9, acked: 5 },
      { id: 'b3', name: 'Product Recall Notice', priority: 'medium', ackRate: 89, avgAckTime: '55m', status: 'good', type: 'Action Required', sentAt: 'Yesterday', stores: 9, acked: 8 },
      { id: 'b4', name: 'Weekly Ops Summary', priority: 'low', ackRate: 100, avgAckTime: '1h 40m', status: 'good', type: 'Informational', sentAt: '3d ago', stores: 9, acked: 9 },
      { id: 'b5', name: 'Emergency OOS Protocol', priority: 'high', ackRate: 100, avgAckTime: '18m', status: 'good', type: 'Action Required', sentAt: '2d ago', stores: 9, acked: 9 },
    ],
    storeCompliance: [
      { store: 'Miami Central', storeId: '1104', ackRate: 100, avgTime: '22m', tier: 'top', missedCount: 0 },
      { store: 'Tampa Bay Mall', storeId: '1105', ackRate: 100, avgTime: '30m', tier: 'top', missedCount: 0 },
      { store: 'Orlando Gateway', storeId: '1106', ackRate: 89, avgTime: '1h 15m', tier: 'top', missedCount: 1 },
      { store: 'St. Petersburg', storeId: '1107', ackRate: 83, avgTime: '2h 00m', tier: 'at-risk', missedCount: 3 },
      { store: 'Jacksonville Hub', storeId: '1108', ackRate: 78, avgTime: '2h 30m', tier: 'at-risk', missedCount: 4 },
      { store: 'Fort Lauderdale', storeId: '1103', ackRate: 72, avgTime: '3h 10m', tier: 'at-risk', missedCount: 4 },
      { store: 'Gainesville', storeId: '1102', ackRate: 56, avgTime: '5h 00m', tier: 'defaulter', missedCount: 8 },
      { store: 'Naples Point', storeId: '1101', ackRate: 44, avgTime: '6h 20m', tier: 'defaulter', missedCount: 11 },
      { store: 'Tallahassee', storeId: '1109', ackRate: 94, avgTime: '40m', tier: 'top', missedCount: 0 },
    ],
    insights: [
      { pattern: 'Naples Point has the worst ack rate in the entire chain (44%). 11 missed acks in 2 weeks — indicating systemic disengagement.', recommendation: 'Flag for formal performance review. Consider requiring the store manager to confirm device functionality and staffing levels.' },
      { pattern: 'Emergency-tagged broadcasts get 100% ack within 18 minutes — even from low-performing stores.', recommendation: 'Use the "Emergency" tag sparingly but leverage its effectiveness for truly critical communications.' },
      { pattern: 'Inland stores (Naples, Gainesville, Jacksonville) average 4h ack time vs coastal stores at 35m — a 7x gap.', recommendation: 'Investigate root cause: could be device access, shift overlap gaps, or manager engagement. Schedule targeted check-ins.' },
    ],
  },
  d19: {
    overview: { active: 2, sentThisWeek: 6, ackPct: 96, avgAckTime: '42m', trendVsLast: 2 },
    gaps: [
      { store: 'Birmingham Center', storeId: '1901', pending: 1, overdue: 0, lastAck: '3h ago' },
    ],
    effectiveness: [
      { id: 'b1', name: 'Audit Compliance Reminder', priority: 'high', ackRate: 80, avgAckTime: '50m', status: 'good', type: 'Action Required', sentAt: '1h ago', stores: 5, acked: 4 },
      { id: 'b2', name: 'Cleanliness Checklist Update', priority: 'medium', ackRate: 100, avgAckTime: '35m', status: 'good', type: 'Action Required', sentAt: '5h ago', stores: 5, acked: 5 },
      { id: 'b3', name: 'Monthly Team Meeting', priority: 'low', ackRate: 100, avgAckTime: '28m', status: 'good', type: 'Informational', sentAt: '2d ago', stores: 5, acked: 5 },
    ],
    storeCompliance: [
      { store: 'Huntsville Plaza', storeId: '1902', ackRate: 100, avgTime: '18m', tier: 'top', missedCount: 0 },
      { store: 'Mobile Bay', storeId: '1903', ackRate: 100, avgTime: '25m', tier: 'top', missedCount: 0 },
      { store: 'Montgomery Mall', storeId: '1904', ackRate: 100, avgTime: '30m', tier: 'top', missedCount: 0 },
      { store: 'Tuscaloosa Walk', storeId: '1905', ackRate: 96, avgTime: '38m', tier: 'top', missedCount: 0 },
      { store: 'Birmingham Center', storeId: '1901', ackRate: 88, avgTime: '1h 10m', tier: 'at-risk', missedCount: 1 },
    ],
    insights: [
      { pattern: 'Alabama has the best ack rate (96%) and fastest avg time (42m) across all districts — a benchmark for communication effectiveness.', recommendation: 'Document Alabama\'s broadcast practices for replication. Key factor: small district size enables direct DM–SM relationships.' },
      { pattern: 'All stores except Birmingham Center are at 96%+ ack. Birmingham\'s single miss was a low-priority informational broadcast.', recommendation: 'No action required — this is healthy performance. Continue current broadcast cadence and format.' },
    ],
  },
};

const getComplianceColor = (value: number): string => {
  if (value >= 90) return '#c6f0d4';
  if (value >= 75) return '#d9f2e0';
  if (value >= 50) return 'var(--ia-color-warning-bg)';
  if (value >= 25) return '#fde2e2';
  return '#fcc';
};

const getComplianceTextColor = (value: number): string => {
  if (value >= 90) return 'var(--ia-color-success)';
  if (value >= 75) return '#166534';
  if (value >= 50) return '#92400e';
  if (value >= 25) return '#991b1b';
  return '#7f1d1d';
};

// Dimension → AI Copilot skill mapping
interface DimensionSkillMap {
  dimension: string;
  skill: 'pog' | 'knowledge' | 'actions' | 'analytics';
  logic: string;
}

const dimensionSkillMapping: DimensionSkillMap[] = [
  { dimension: 'Planogram', skill: 'pog', logic: 'Shelf layout and planogram compliance validation' },
  { dimension: 'Signage', skill: 'knowledge', logic: 'Guideline-driven display and signage standards' },
  { dimension: 'Cleanliness', skill: 'actions', logic: 'Execution-focused operational tasks and upkeep' },
  { dimension: 'Safety', skill: 'knowledge', logic: 'SOP-based safety procedures and compliance' },
  { dimension: 'Stock Rotation', skill: 'analytics', logic: 'Data-driven validation of FIFO and inventory aging' },
  { dimension: 'Pricing', skill: 'analytics', logic: 'Price accuracy validation and mismatch detection' },
  { dimension: 'Backroom', skill: 'actions', logic: 'Operational handling and inventory organization tasks' },
  { dimension: 'Customer Area', skill: 'actions', logic: 'Store execution and customer experience improvements' },
  { dimension: 'Avg', skill: 'analytics', logic: 'Aggregated KPI derived from multiple audit dimensions' },
];

const getSkillForDimension = (dimension: string): DimensionSkillMap => {
  return dimensionSkillMapping.find(m => m.dimension === dimension) || dimensionSkillMapping[dimensionSkillMapping.length - 1];
};

// Audit detail findings for clickable heatmap cells
interface AuditCellDetail {
  findings: string[];
  lastAudit: string;
  auditor: string;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
}

// Auto-generated findings for cells without explicit detail data
const auditors = ['Sarah Chen', 'John Martinez', 'Emily Davis', 'James Wilson', 'Maria Lopez'];
const autoFindingsMap: Record<string, string[]> = {
  Planogram: ['Shelf facings not matching authorized planogram', 'Promotional endcap partially set up', 'Category flow disruption in adjacent aisles', 'Missing shelf labels for new SKUs'],
  Signage: ['Price signage outdated on 8+ items', 'Promotional banner not displayed per guidelines', 'Department wayfinding signs misaligned', 'Sale end-date signage still active post-promo'],
  Cleanliness: ['Floor maintenance below standard in aisles 3-5', 'Restroom cleaning log gaps detected', 'Deli counter area needs deep clean', 'Cart corral area debris accumulation'],
  Safety: ['Emergency exit signage needs replacement', 'Fire extinguisher inspection overdue', 'Wet floor protocol not followed during mopping', 'Staff safety training records incomplete'],
  'Stock Rotation': ['FIFO not followed in dairy section', 'Items approaching best-before date on shelf', 'Backstock rotation overdue by 48+ hours', 'Produce freshness check missed'],
  Pricing: ['Shelf price vs POS mismatch on 5 items', 'Clearance tags not updated after markdown', 'Price label missing on new arrivals', 'Multi-buy pricing error on promotional items'],
  Backroom: ['Receiving dock area congestion', 'Inventory count discrepancy in backroom', 'Overstock pallets blocking access paths', 'Returns processing backlog exceeded 72h'],
  'Customer Area': ['Shopping cart availability below 80%', 'Checkout queue exceeded 5-minute wait target', 'Customer service desk unstaffed during peak', 'Store entrance cleanliness needs attention'],
};

const generateAutoDetail = (storeNumber: string, category: string, score: number): AuditCellDetail => {
  const seed = parseInt(storeNumber) + category.length;
  const findings = autoFindingsMap[category] || autoFindingsMap['Planogram'];
  const count = score >= 90 ? 1 : score >= 75 ? 2 : score >= 50 ? 3 : 4;
  const selectedFindings = findings.slice(0, count);
  if (score >= 90) {
    const positiveFindings = [`${category} standards met or exceeded across all audited areas`];
    return {
      findings: positiveFindings,
      lastAudit: `${(seed % 5) + 1} days ago`,
      auditor: auditors[seed % auditors.length],
      trend: 'stable',
      recommendation: `Maintain current ${category.toLowerCase()} protocols. Strong performance.`,
    };
  }
  return {
    findings: selectedFindings,
    lastAudit: `${(seed % 7) + 1} days ago`,
    auditor: auditors[seed % auditors.length],
    trend: score >= 70 ? 'improving' : 'declining',
    recommendation: score >= 50
      ? `Schedule focused ${category.toLowerCase()} improvement review this week.`
      : `Critical: Immediate ${category.toLowerCase()} intervention required. Escalate to regional.`,
  };
};

const auditCellDetails: Record<string, AuditCellDetail> = {
  '9012-Safety': {
    findings: ['Fire extinguisher expired on Floor 2', 'Emergency exit B partially blocked by stock carts', 'Wet floor signs not deployed in produce section', 'First aid kit missing key supplies'],
    lastAudit: '2 days ago',
    auditor: 'Sarah Chen',
    trend: 'declining',
    recommendation: 'Immediate safety review required. Schedule re-audit within 48h.',
  },
  '5678-Safety': {
    findings: ['Emergency lighting non-functional in stockroom', 'Fire exit signage obscured by promotional displays', 'Safety drill not conducted this quarter'],
    lastAudit: '3 days ago',
    auditor: 'John Martinez',
    trend: 'declining',
    recommendation: 'Escalate to Regional Safety Officer. Mandatory corrective action.',
  },
  '1234-Planogram': {
    findings: ['Aisle 3 endcap missing promotional display', 'Beverage cooler facings off by 30%', 'New seasonal planogram not implemented (overdue 5 days)', 'Shelf tags mismatched in dairy section'],
    lastAudit: '1 day ago',
    auditor: 'Emily Davis',
    trend: 'declining',
    recommendation: 'Deploy planogram reset team. Prioritize Aisle 3 and beverage cooler.',
  },
  '4532-Cleanliness': {
    findings: ['Floor sticky residue in checkout zone', 'Restroom cleanliness below standard', 'Deli counter glass not cleaned on schedule'],
    lastAudit: '4 days ago',
    auditor: 'James Wilson',
    trend: 'stable',
    recommendation: 'Increase cleaning frequency during peak hours. Add evening deep-clean shift.',
  },
  '2198-Planogram': {
    findings: ['Promotional endcap partially set up', 'Category adjacency violation in snacks aisle', 'Missing price labels on 12 SKUs'],
    lastAudit: '2 days ago',
    auditor: 'Sarah Chen',
    trend: 'improving',
    recommendation: 'Complete endcap setup. Address price label gaps by end of shift.',
  },
  '1234-Stock Rotation': {
    findings: ['14 items past best-before date on shelf', 'FIFO not followed in dairy cooler', 'Backstock not rotated in 72+ hours', 'Clearance items blocking fresh stock'],
    lastAudit: '1 day ago',
    auditor: 'Emily Davis',
    trend: 'declining',
    recommendation: 'Urgent: Pull expired items immediately. Retrain staff on FIFO protocol.',
  },
  '9012-Stock Rotation': {
    findings: ['23 expired items found across 4 aisles', 'No FIFO practice observed during audit', 'Backroom stock untouched for 5+ days', 'Produce section 40% past prime freshness'],
    lastAudit: '2 days ago',
    auditor: 'John Martinez',
    trend: 'declining',
    recommendation: 'Critical intervention. Full stock rotation audit and staff retraining.',
  },
  '2034-Cleanliness': {
    findings: ['All areas meet or exceed cleanliness standards', 'Restrooms scored 100% on last 3 audits', 'Floor maintenance schedule fully compliant'],
    lastAudit: '1 day ago',
    auditor: 'James Wilson',
    trend: 'stable',
    recommendation: 'Maintain current protocols. Eligible for "Clean Store" recognition.',
  },
};

// KPI Cards Data
interface DistrictKPI {
  id: string;
  category: 'commercial' | 'customer' | 'execution' | 'profitability' | 'operations';
  label: string;
  primaryValue: string;
  primaryUnit?: string;
  microInsight?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'flat';
  deltaContext?: string;
  status: 'positive' | 'negative' | 'neutral' | 'warning';
  clickable: boolean;
  trendData?: number[];
  trendInsight?: string;
  panelTitle?: string;
  panelDetails?: { label: string; value: string; status?: string }[];
}

const districtKPIs: DistrictKPI[] = [
  // 1. Commercial (Combined)
  {
    id: 'sales-performance',
    category: 'commercial',
    label: 'Sales Performance',
    primaryValue: '$1.26M',
    primaryUnit: 'Weekly',
    microInsight: '4W avg $1.24M',
    delta: '+4.2%',
    deltaDirection: 'up',
    deltaContext: 'YoY',
    status: 'positive',
    clickable: true,
    trendData: [980, 1020, 1050, 1010, 1080, 1120, 1060, 1100, 1150, 1180, 1200, 1260],
    trendInsight: 'Consistent upward trend. Q4 seasonality effect visible. Rolling 4-week avg: $1.19M.',
    panelTitle: 'Sales $ — 52-Week Trend',
    panelDetails: [
      { label: 'Best Week', value: '$1.32M (Mar 23)', status: 'positive' },
      { label: 'Worst Week', value: '$940K (Jun 23)', status: 'negative' },
      { label: 'Rolling 4W Avg', value: '$1.19M', status: 'neutral' },
      { label: 'YoY Δ', value: '+4.2%', status: 'positive' },
    ]
  },
  // 2. Customer — VoC Satisfaction
  {
    id: 'voc-satisfaction',
    category: 'customer',
    label: 'VoC Satisfaction',
    primaryValue: '82%',
    microInsight: 'Top theme: Messy Aisles',
    delta: '-1.4 pts',
    deltaDirection: 'down',
    deltaContext: 'YoY',
    status: 'warning',
    clickable: true,
    trendData: [88, 87, 86, 85, 84, 85, 83, 84, 82, 83, 82, 82],
    trendInsight: 'Gradual decline over 12 weeks. "Messy Aisles" and "Staff Availability" are top negative themes.',
    panelTitle: 'VoC Satisfaction — 52-Week Trend',
    panelDetails: [
      { label: 'Peak', value: '91% (Jul 21)', status: 'positive' },
      { label: 'Low', value: '80% (Jan 5)', status: 'negative' },
      { label: 'Top Theme (↑)', value: 'Messy Aisles (+34%)', status: 'negative' },
      { label: 'Top Theme (↓)', value: 'Checkout Speed (improved)', status: 'positive' },
    ]
  },
  // 2. Customer — VoC Issue Rate
  {
    id: 'voc-issue-rate',
    category: 'customer',
    label: 'VoC Issue Rate',
    primaryValue: '3.8',
    primaryUnit: '/ 100 visits',
    microInsight: '3 of 8 stores affected',
    delta: '+0.6',
    deltaDirection: 'up',
    deltaContext: 'YoY',
    status: 'negative',
    clickable: true,
    trendData: [2.8, 2.9, 3.0, 3.1, 2.9, 3.2, 3.4, 3.2, 3.5, 3.6, 3.4, 3.8],
    trendInsight: 'Spike detected in last 2 weeks. Driven primarily by "Messy Aisles" theme across 3 stores.',
    panelTitle: 'VoC Issue Rate — 52-Week Trend',
    panelDetails: [
      { label: 'Best', value: '2.1 / 100 (Jun 2)', status: 'positive' },
      { label: 'Worst', value: '4.2 / 100 (Feb 2)', status: 'negative' },
      { label: 'Spike Driver', value: 'Messy Aisles (+34%)', status: 'negative' },
      { label: 'Stores Affected', value: '3 of 8', status: 'warning' },
    ]
  },
  // 3. Execution — Shelf Audit Compliance
  {
    id: 'shelf-audit',
    category: 'execution',
    label: 'Shelf Audit Compliance',
    primaryValue: '89%',
    microInsight: '6th week below target',
    delta: '-6 pts',
    deltaDirection: 'down',
    deltaContext: 'vs target',
    status: 'warning',
    clickable: true,
    trendData: [92, 93, 91, 90, 92, 91, 89, 90, 88, 89, 90, 89],
    trendInsight: 'Below target for 6 consecutive weeks. Store variance: 78% (Johnson City Mall) to 97% (Memphis Central).',
    panelTitle: 'Shelf Audit Compliance — 52-Week Trend',
    panelDetails: [
      { label: 'Target', value: '95%', status: 'neutral' },
      { label: 'Gap', value: '-6pts', status: 'negative' },
      { label: 'Best Store', value: 'Memphis Central (97%)', status: 'positive' },
      { label: 'Worst Store', value: 'Johnson City Mall (78%)', status: 'negative' },
    ]
  },
  // 3. Execution — OOS Rate
  {
    id: 'oos-rate',
    category: 'execution',
    label: 'OOS Rate',
    primaryValue: '4.1%',
    microInsight: 'Apparel drives 60%',
    delta: '+0.8 pts',
    deltaDirection: 'up',
    deltaContext: 'YoY',
    status: 'negative',
    clickable: true,
    trendData: [3.0, 2.8, 3.1, 3.3, 3.0, 3.2, 3.5, 3.3, 3.6, 3.8, 3.5, 4.1],
    trendInsight: 'Rising trend over 8 weeks. Apparel category driving 60% of OOS. Clarksville Crossing shipment delay a key factor.',
    panelTitle: 'OOS Rate — 52-Week Trend',
    panelDetails: [
      { label: 'Best', value: '2.1% (Jun 30)', status: 'positive' },
      { label: 'Worst', value: '4.5% (Feb 23)', status: 'negative' },
      { label: 'Top Category', value: 'Apparel (60% of OOS)', status: 'negative' },
      { label: 'Key Driver', value: 'Clarksville Crossing delay', status: 'warning' },
    ]
  },
  // 4. Profitability (Combined)
  {
    id: 'margin-health',
    category: 'profitability',
    label: 'Margin Health',
    primaryValue: '34.2%',
    primaryUnit: 'GM',
    microInsight: 'Apparel markdown pressure',
    delta: '-40 bps',
    deltaDirection: 'down',
    deltaContext: 'YoY',
    status: 'warning',
    clickable: true,
    trendData: [35.1, 35.0, 34.8, 34.9, 34.6, 34.7, 34.5, 34.4, 34.3, 34.2, 34.3, 34.2],
    trendInsight: 'Margin pressure from increased markdowns in Apparel. Promotional mix shift impacting blended margin.',
    panelTitle: 'Gross Margin — 52-Week Trend',
    panelDetails: [
      { label: 'Peak', value: '36.1% (Aug 4)', status: 'positive' },
      { label: 'Low', value: '33.8% (Jan 12)', status: 'negative' },
      { label: 'Pressure Source', value: 'Apparel markdowns', status: 'negative' },
      { label: 'YoY Δ', value: '-40 bps', status: 'warning' },
    ]
  },
];

// Team members for chat/broadcast
const teamMembers = [
  { id: 'sm1', name: 'Sarah Mitchell', role: 'Store Manager - Nashville Flagship', avatar: 'SM', status: 'online' },
  { id: 'sm2', name: 'Marcus Chen', role: 'Store Manager - Franklin Town Center', avatar: 'MC', status: 'online' },
  { id: 'sm3', name: 'Lisa Warren', role: 'Store Manager - Johnson City Mall', avatar: 'LW', status: 'away' },
  { id: 'am1', name: 'Thomas Miller', role: 'Area Manager - East Tennessee', avatar: 'TM', status: 'online' },
  { id: 'am2', name: 'Anna Barnes', role: 'Area Manager - West Tennessee', avatar: 'AB', status: 'offline' },
];

// Helper functions
const getDPIColor = (tier: string) => {
  switch (tier) {
    case 'Excellence': return 'var(--ia-color-success)';
    case 'Stable': return '#0ea5e9';
    case 'AtRisk': return 'var(--ia-color-warning)';
    case 'Crisis': return 'var(--ia-color-error)';
    default: return 'var(--ia-color-text-secondary)';
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

// Calendar helper functions
const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const days: { day: number; trailing: boolean }[] = [];
  
  // Add previous month's trailing days
  if (startDayOfWeek > 0) {
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, trailing: true });
    }
  }
  
  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, trailing: false });
  }
  
  return days;
};

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

export const DistrictIntelligence: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHQ = user?.role === 'HQ' || user?.role === 'ADMIN';
  const [selectedDistrictId, setSelectedDistrictId] = useState('d14');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const selectedDistrictOption = HQ_DISTRICT_OPTIONS.find(d => d.id === selectedDistrictId) || HQ_DISTRICT_OPTIONS[0];
  const activeStores = isHQ ? getDistrictStores(selectedDistrictOption.seedOffset) : mockStores;
  const activeAuditData = isHQ ? getDistrictAuditData(selectedDistrictOption.seedOffset) : auditComplianceData;
  const activeTriageItems = DISTRICT_TRIAGE[selectedDistrictId] || DISTRICT_TRIAGE['d14'];
  const activeBroadcasts = DISTRICT_BROADCAST_ANALYTICS[selectedDistrictId] || DISTRICT_BROADCAST_ANALYTICS['d14'];
  const activeMetricsSet = isHQ ? getDistrictMetrics(selectedDistrictOption.seedOffset) : undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingStore, setNavigatingStore] = useState<string | null>(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'risk' | 'top' | 'revenue'>('all');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  type SortKey = 'rank' | 'store' | 'dpi' | 'sales' | 'sea' | 'voc' | 'vocIssue' | 'seaIssue' | 'trend' | 'status';
  const [leaderboardSort, setLeaderboardSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'rank', dir: 'asc' });

  const handleLeaderboardSort = (key: SortKey) => {
    setLeaderboardSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'rank' || key === 'store' || key === 'vocIssue' || key === 'seaIssue' ? 'asc' : 'desc' });
  };
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'week' | 'month' | 'quarter'>('week');
  const [viewingMonth, setViewingMonth] = useState(new Date().getMonth());
  const [viewingYear, setViewingYear] = useState(new Date().getFullYear());
  // Auto-select last available week on landing
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
  
  // Heatmap tooltip state
  const [heatmapTip, setHeatmapTip] = useState<{ x: number; y: number; store: string; cat: string; val: number } | null>(null);
  // Heatmap cell detail modal
  const [heatmapDetail, setHeatmapDetail] = useState<{ storeNumber: string; storeName: string; category: string; score: number; detail: AuditCellDetail; skill: string; skillLogic: string } | null>(null);

  // Create Broadcast Wizard state
  const [showBroadcastWizard, setShowBroadcastWizard] = useState(false);
  const [bwStep, setBwStep] = useState<1 | 2 | 3>(1);
  const [bwAudience, setBwAudience] = useState<'all-stores' | 'specific-stores' | 'managers'>('all-stores');
  const [bwSelectedStores, setBwSelectedStores] = useState<string[]>([]);
  const [bwSelectedManagers, setBwSelectedManagers] = useState<string[]>([]);
  const [bwPriority, setBwPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal');
  const [bwCategory, setBwCategory] = useState<'Operations' | 'Safety' | 'Compliance' | 'Announcement'>('Operations');
  const [bwSubject, setBwSubject] = useState('');
  const [bwMessage, setBwMessage] = useState('');
  const [bwSending, setBwSending] = useState(false);
  const openBroadcastWizard = () => {
    setBwStep(1);
    setBwAudience('all-stores');
    setBwSelectedStores([]);
    setBwSelectedManagers([]);
    setBwPriority('Normal');
    setBwCategory('Operations');
    setBwSubject('');
    setBwMessage('');
    setBwSending(false);
    setShowBroadcastWizard(true);
  };
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showVocPanel, setShowVocPanel] = useState(false);
  const [showSeaPanel, setShowSeaPanel] = useState(false);
  const [showTriageDetail, setShowTriageDetail] = useState<string | null>(null);
  const [activeKPIPanel, setActiveKPIPanel] = useState<DistrictKPI | null>(null);
  const dpiCardRef = useRef<HTMLDivElement | null>(null);
  const [dpiCardHeight, setDpiCardHeight] = useState<number | null>(null);
  const [bcaSelectedBroadcast, setBcaSelectedBroadcast] = useState<BroadcastEffectivenessRow | null>(null);

  const closeBcaPanel = () => { setBcaSelectedBroadcast(null); };

  // Build per-broadcast store compliance: top `acked` stores are Acknowledged, rest Pending
  const getBroadcastStoreCompliance = (bc: BroadcastEffectivenessRow) => {
    const stores = [...activeBroadcasts.storeCompliance].sort((a, b) => b.ackRate - a.ackRate);
    return stores.slice(0, bc.stores).map((s, i) => ({
      ...s,
      acknowledged: i < bc.acked,
    }));
  };

  // Toast notification helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  // Navigate to Store Deep Dive with loading
  const handleStoreClick = (store: typeof activeStores[0]) => {
    setIsNavigating(true);
    setNavigatingStore(store.storeNumber);
    
    // Simulate 1.5 second loading for realistic feel
    setTimeout(() => {
      navigate(`/store-operations/store-deep-dive?store=${store.storeNumber}&name=${encodeURIComponent(store.storeName)}`);
    }, 1500);
  };
  
  const calendarDays = getCalendarDays(viewingYear, viewingMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewingMonth === 0) {
        setViewingMonth(11);
        setViewingYear(viewingYear - 1);
      } else {
        setViewingMonth(viewingMonth - 1);
      }
    } else {
      if (viewingMonth === 11) {
        setViewingMonth(0);
        setViewingYear(viewingYear + 1);
      } else {
        setViewingMonth(viewingMonth + 1);
      }
    }
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

  // Generate last 4 completed quarters (exclude running quarter)
  const getAvailableQuarters = () => {
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3) + 1;
    const currentY = now.getFullYear();
    const quarters: { label: string; quarter: number; year: number }[] = [];
    let q = currentQ - 1;
    let y = currentY;
    if (q <= 0) { q += 4; y -= 1; }
    for (let i = 0; i < 4; i++) {
      const qMonths = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
      const startM = (q - 1) * 3;
      quarters.push({ label: `Q${q} ${y} (${qMonths[startM]}–${qMonths[startM + 2]})`, quarter: q, year: y });
      q -= 1;
      if (q <= 0) { q = 4; y -= 1; }
    }
    return quarters;
  };
  const availableQuarters = getAvailableQuarters();

  // District metrics - different values for Week vs Month vs Quarter
  type DistrictMetrics = { dpi: number; tier: DistrictTier; rank: number; dpiChange: number; momentum: MomentumType; momentumDelta: number; chainAvg: number; scoreSales: number; scoreExecution: number; scoreVoC: number };
  const weekData: DistrictMetrics = activeMetricsSet ? activeMetricsSet.week : {
    dpi: 87, tier: 'Excellence', rank: 3, dpiChange: +2.4, momentum: 'Improving', momentumDelta: +3.2, chainAvg: 79, scoreSales: 92, scoreExecution: 85, scoreVoC: 84
  };
  
  const monthData: DistrictMetrics = activeMetricsSet ? activeMetricsSet.month : {
    dpi: 82, tier: 'Stable', rank: 5, dpiChange: +1.8, momentum: 'Improving', momentumDelta: +2.1, chainAvg: 79, scoreSales: 86, scoreExecution: 80, scoreVoC: 79
  };

  const quarterData: DistrictMetrics = activeMetricsSet ? activeMetricsSet.quarter : {
    dpi: 80, tier: 'Stable', rank: 6, dpiChange: +1.2, momentum: 'Flat', momentumDelta: +0.8, chainAvg: 79, scoreSales: 84, scoreExecution: 78, scoreVoC: 77
  };
  
  const currentData = calendarMode === 'quarter' ? quarterData : calendarMode === 'month' ? monthData : weekData;

  // Transform KPI data based on selected district + time period
  // KPI tiles always show YoY; period comparison (WoW/MoM/QoQ) is shown in the right-side panel.
  const periodLabel = calendarMode === 'week' ? 'WoW' : calendarMode === 'month' ? 'MoM' : 'QoQ';

  const getAdjustedKPIs = (): DistrictKPI[] => {
    // Step 1: apply district overrides to base KPIs
    const districtOverrides = DISTRICT_KPI_OVERRIDES[selectedDistrictId] || {};
    const baseKPIs = districtKPIs.map(kpi => {
      const ov = districtOverrides[kpi.id];
      if (!ov) return { ...kpi };
      return { ...kpi, primaryValue: ov.primaryValue, delta: ov.delta, deltaDirection: ov.deltaDirection, microInsight: ov.microInsight, status: ov.status };
    });
    if (calendarMode === 'week') return baseKPIs;
    
    // Month and Quarter KPI overrides for realistic data
    const monthOverrides: Record<string, { primaryValue: string; primaryUnit?: string; delta: string; deltaDirection: 'up' | 'down' | 'flat'; microInsight: string; deltaContext?: string }> = {
      'sales-performance': { primaryValue: '$4.92M', primaryUnit: 'MTD', delta: '+3.8%', deltaDirection: 'up', microInsight: 'Monthly total across 8 stores', deltaContext: 'MoM' },
      'voc-satisfaction': { primaryValue: '81%', delta: '-2.1 pts', deltaDirection: 'down', microInsight: 'Avg across 4 weeks', deltaContext: 'MoM' },
      'voc-issue-rate': { primaryValue: '3.4', delta: '+0.4', deltaDirection: 'up', microInsight: '4 of 8 stores affected', deltaContext: 'MoM' },
      'shelf-audit': { primaryValue: '88%', delta: '-7 pts', deltaDirection: 'down', microInsight: 'Monthly avg below target', deltaContext: 'vs target' },
      'oos-rate': { primaryValue: '3.8%', delta: '+0.6 pts', deltaDirection: 'up', microInsight: 'Apparel drives 55%', deltaContext: 'MoM' },
      'margin-health': { primaryValue: '34.0%', primaryUnit: 'GM', delta: '-55 bps', deltaDirection: 'down', microInsight: 'Markdown pressure sustained', deltaContext: 'MoM' },
    };
    
    const quarterOverrides: Record<string, { primaryValue: string; primaryUnit?: string; delta: string; deltaDirection: 'up' | 'down' | 'flat'; microInsight: string; deltaContext?: string }> = {
      'sales-performance': { primaryValue: '$14.8M', primaryUnit: 'QTD', delta: '+2.9%', deltaDirection: 'up', microInsight: 'Q1 total across 8 stores', deltaContext: 'QoQ' },
      'voc-satisfaction': { primaryValue: '83%', delta: '-1.8 pts', deltaDirection: 'down', microInsight: 'Quarterly avg across stores', deltaContext: 'QoQ' },
      'voc-issue-rate': { primaryValue: '3.2', delta: '+0.3', deltaDirection: 'up', microInsight: '3 of 8 stores impacted', deltaContext: 'QoQ' },
      'shelf-audit': { primaryValue: '90%', delta: '-5 pts', deltaDirection: 'down', microInsight: 'Quarterly avg below target', deltaContext: 'vs target' },
      'oos-rate': { primaryValue: '3.5%', delta: '+0.4 pts', deltaDirection: 'up', microInsight: 'Apparel drives 52%', deltaContext: 'QoQ' },
      'margin-health': { primaryValue: '34.4%', primaryUnit: 'GM', delta: '-30 bps', deltaDirection: 'down', microInsight: 'Seasonal markdown impact', deltaContext: 'QoQ' },
    };
    
    const overrides = calendarMode === 'month' ? monthOverrides : quarterOverrides;
    
    return baseKPIs.map(kpi => {
      const override = overrides[kpi.id];
      if (!override) return kpi;
      return {
        ...kpi,
        primaryValue: override.primaryValue,
        primaryUnit: override.primaryUnit ?? kpi.primaryUnit,
        delta: override.delta,
        deltaDirection: override.deltaDirection,
        microInsight: override.microInsight,
        deltaContext: override.deltaContext ?? kpi.deltaContext,
      };
    });
  };
  
  const adjustedKPIs = getAdjustedKPIs();
  const districtDPI = currentData.dpi;
  const districtTier: DistrictTier = currentData.tier;
  const districtRank = currentData.rank;
  const totalDistricts = 24;
  const dpiChange = currentData.dpiChange;
  const chainAvgDPI = currentData.chainAvg;

  // Always true — a period is always pre-selected on landing and mode switch
  const isDateFilterActive = true;
  // True when HQ user has selected a non-default district
  const isDistrictFilterActive = isHQ && selectedDistrictId !== 'd14';
  const isAnyFilterActive = isDateFilterActive || isDistrictFilterActive;

  // Period-adjusted store leaderboard data
  const getAdjustedStores = () => {
    if (calendarMode === 'week') return activeStores;
    // Slight variations for month/quarter to show data reactivity
    const factor = calendarMode === 'month' ? 4.1 : 12.8;
    const varShift = calendarMode === 'month' ? -0.3 : -0.6;
    const dpiShift = calendarMode === 'month' ? -2 : -4;
    return activeStores.map(store => ({
      ...store,
      dpi: Math.max(45, store.dpi + dpiShift + Math.round((parseInt(store.storeNumber) % 5) - 2)),
      netSales: Math.round(store.netSales * factor),
      netSalesVar: parseFloat((store.netSalesVar + varShift).toFixed(1)),
      seaScore: Math.max(50, store.seaScore + dpiShift + (parseInt(store.storeNumber) % 3)),
      vocSatisfied: Math.max(45, store.vocSatisfied + dpiShift + (parseInt(store.storeNumber) % 4)),
    }));
  };
  const adjustedStores = getAdjustedStores();

  // Period-adjusted audit compliance heatmap
  const getAdjustedAuditData = () => {
    if (calendarMode === 'week') return activeAuditData;
    const shift = calendarMode === 'month' ? -2 : -4;
    const adjusted: Record<string, Record<string, number>> = {};
    for (const [store, cats] of Object.entries(activeAuditData)) {
      adjusted[store] = {};
      for (const [cat, val] of Object.entries(cats)) {
        const seed = parseInt(store) % 7;
        adjusted[store][cat] = Math.max(10, Math.min(100, val + shift + (seed % 3 - 1)));
      }
    }
    return adjusted;
  };
  const adjustedAuditData = getAdjustedAuditData();

  // District-specific AI Daily Brief content (detailed paragraphs + bullets)
  interface DIBriefSection { title: string; icon: 'triage' | 'performance' | 'ops' | 'customer' | 'recommendations'; bullets: string[] }
  interface DIBrief { greeting: string; sections: DIBriefSection[]; closing: string }
  const DISTRICT_BRIEFS: Record<string, DIBrief> = {
    d14: {
      greeting: `3 active triage items this week across Johnson City Mall, Clarksville Crossing, and Franklin Town Center. Here's the full district intelligence picture with root causes, trend analysis, and recommended actions.`,
      sections: [
        {
          title: 'Triage & Critical Issues',
          icon: 'triage',
          bullets: [
            '<strong>VoC: Messy Aisles</strong> — +22% theme spike across 3 stores (Johnson City Mall +45%, Clarksville Crossing +38%, Franklin Town Center +31%). WoW trend is accelerating; last week was +14%. Root cause: cleaning staff hours were cut by 2hrs/day at these locations last month.',
            '<strong>SEA Auto-Fail: Fire Exit</strong> at Johnson City Mall is a <strong>CRITICAL</strong> regulatory exposure. Display fixture blocking emergency Exit B. Auto-escalated to DM 2 hours ago; store manager acknowledgment still pending. Any delay risks store closure and penalties.',
            '<strong>Inbound OOS Risk</strong> at Clarksville Crossing — 3 SKUs (Summer Dress, Linen Pants, Cotton Blouse) delayed 48h from DC. Revenue impact estimated at $2,400. Adaptation plan awaiting DM approval.',
          ],
        },
        {
          title: 'Performance & Trends',
          icon: 'performance',
          bullets: [
            'Weekly revenue at <strong>$1.26M</strong> (+8% vs target, +5% WoW). 6 of 8 stores exceeded plan. Nashville Flagship and Memphis Central are the leading revenue contributors, but Johnson City Mall\'s operational issues are offsetting sales performance.',
            'Gross margin held at <strong>34.2%</strong> (+0.3pp WoW). YoY comparison shows a <strong>+1.8pp improvement</strong> driven by markdown optimization. Seasonal clearance contributed an estimated $18K margin recovery this period.',
            'District DPI moved from <strong>85 → 87</strong> (+2pts MoM), placing in the <strong>top 10% — Excellence Tier</strong>. However, the triage items above represent emerging risks that could reverse this trajectory.',
            'Store-level variance is widening: top store (Nashville Flagship) at SPI 94 vs bottom (Johnson City Mall) at SPI 58. The gap increased by 4pts this month — requires targeted intervention.',
          ],
        },
        {
          title: 'Operational Analysis',
          icon: 'ops',
          bullets: [
            '<strong>Compliance:</strong> District-wide POG adherence at <strong>97%</strong> (up from 94%). Franklin Town Center at 100% Camera Shelf Audit for 3 consecutive weeks. However, Johnson City Mall dropped to 88% — directly linked to the messy aisles / fire exit issues.',
            '<strong>Cross-metric relationship:</strong> The VoC "Messy Aisles" complaints correlate 0.87 with declining Cleanliness audit scores. Both map to the same 3 stores. This is not a coincidence — it\'s a staffing execution failure.',
            '<strong>Task execution:</strong> 87% on-time completion. 2 critical overdue items are the fire exit resolution and the Clarksville Crossing adaptation approval — both in your triage queue.',
          ],
        },
        {
          title: 'Customer Experience',
          icon: 'customer',
          bullets: [
            'VoC Score improved to <strong>72 (+12 pts QoQ)</strong> district-wide, but this masks a divergence: stores without triage issues are at VoC Score 81, while Clarksville Crossing / Johnson City Mall average VoC Score 61.',
            '"Messy Aisles" is now the <strong>#1 negative VoC theme</strong> (+34% WoW, +22% overall). If not addressed within 2 weeks, VoC Score modeling projects a <strong>-6pt district-wide impact</strong>.',
            'Positive signal: "Helpful staff" remains the top positive theme. Staff friendliness scores are stable across all stores — the issue is purely operational (cleanliness, stocking), not service attitude.',
          ],
        },
        {
          title: 'Recommendations & Next Steps',
          icon: 'recommendations',
          bullets: [
            '<strong>Immediate (today):</strong> Deploy Johnson City Mall team to clear fire exit and confirm compliance. This is a zero-tolerance safety item — escalate to Regional if not resolved by EOD.',
            '<strong>This week:</strong> Restore cleaning hours at Johnson City Mall, Clarksville Crossing, and Franklin Town Center (+2hrs/day). Model shows this alone could reverse the Messy Aisles trend within 10 days.',
            '<strong>Approve:</strong> Clarksville Crossing adaptation plan for the 3 delayed SKUs — estimated to recover $2,400 in at-risk revenue.',
            '<strong>Forward-looking:</strong> Nashville Flagship\'s execution playbook should be templated for Johnson City Mall turnaround. Schedule a best-practices session and consider pairing store managers.',
          ],
        },
      ],
      closing: 'Overall, the district is in a strong position at DPI 87 / Excellence Tier, but the 3 active triage items need rapid resolution to prevent backsliding. Priority: fire exit (safety), messy aisles (VoC trend), OOS adaptation (revenue protection).',
    },
    d08: {
      greeting: `3 active triage items in Georgia district this week. Shrinkage and checkout speed are the dominant concerns. Here's your detailed intelligence brief with store-level analysis and action plan.`,
      sections: [
        {
          title: 'Triage & Critical Issues',
          icon: 'triage',
          bullets: [
            '<strong>Shrinkage Spike</strong> at Peachtree Plaza (+23%) and Savannah Square (+15%) — combined +18% vs 4-week average. Loss-prevention data indicates afternoon shift (2–5 PM) as the highest-risk window. Estimated monthly impact: <strong>$14K in lost inventory</strong>.',
            '<strong>VoC: Checkout Speed</strong> — +31% complaint volume across Augusta Mall and Athens Center. Average wait time increased from 3.2min to 5.1min during peak hours. Directly correlated with reduced register staffing.',
            '<strong>Labor Coverage Gap</strong> at Macon Point — 3 weekend shifts remain uncovered. Weekend foot traffic is 40% higher, making this a revenue-risk staffing failure.',
          ],
        },
        {
          title: 'Performance & Trends',
          icon: 'performance',
          bullets: [
            'District DPI at <strong>84</strong> (Stable tier). WoW trend is flat, but the shrinkage spike is a leading indicator of potential decline. YoY comparison shows DPI is +3pts vs Q1 last year.',
            'Revenue at <strong>$982K</strong> (+2.1% WoW). Strong top-line performance masks the margin erosion from shrinkage and clearance markdowns (<strong>GM down 85 bps</strong>).',
            'Urban flagship stores (Peachtree, Augusta) drive 62% of revenue but also 78% of shrinkage losses — a classic volume-vs-loss tradeoff that needs targeted intervention.',
          ],
        },
        {
          title: 'Operational Analysis',
          icon: 'ops',
          bullets: [
            '<strong>Cross-metric relationship:</strong> Shrinkage increase at Peachtree correlates with a 30% reduction in floor staff during 2–5 PM. The same staffing gap explains checkout speed complaints — fewer associates means fewer open registers.',
            '<strong>Smaller stores outperforming:</strong> Savannah Square, Macon Center have best compliance scores in the district. The "less traffic, better control" pattern suggests flagship stores need fundamentally different staffing models.',
            '<strong>SEA compliance:</strong> District average at 89%. Peachtree Plaza dropped to 82% — the shrinkage issue is likely masking broader execution lapses.',
          ],
        },
        {
          title: 'Recommendations & Next Steps',
          icon: 'recommendations',
          bullets: [
            '<strong>Immediate:</strong> Increase afternoon floor coverage at Peachtree Plaza by reassigning 2 associates from back-of-house during 2–5 PM peak window.',
            '<strong>48 hours:</strong> Deploy loss-prevention audit at Savannah Square. Investigate whether shrinkage is shoplifting, internal, or process-related.',
            '<strong>This week:</strong> Fill 3 weekend shifts at Macon Point — use the overtime budget or cross-district coverage to prevent revenue loss.',
            '<strong>Forward-looking:</strong> Propose a differentiated staffing model for flagship vs neighborhood stores at the next regional review. Current one-size-fits-all approach is failing.',
          ],
        },
      ],
      closing: 'Georgia district has strong revenue momentum but is bleeding margin through shrinkage and staffing gaps. The root cause is a single issue — afternoon understaffing at flagship stores — that manifests as both shrinkage and checkout complaints. Fix the staffing, fix both problems.',
    },
    d22: {
      greeting: `Carolina district has 3 active issues led by a planogram compliance drop and an unresolved safety incident. Here's the full district intelligence with root cause analysis and resolution path.`,
      sections: [
        {
          title: 'Triage & Critical Issues',
          icon: 'triage',
          bullets: [
            '<strong>Planogram Compliance Drop</strong> — 5 of 7 stores below target. Charlotte Hub at 65%, Durham Heights at 68%. Root cause: seasonal reset began last week but stores without dedicated visual teams are falling behind. Estimated lost impulse sales: <strong>$8K/week</strong>.',
            '<strong>Safety Incident</strong> at Raleigh Court — wet floor slip reported. Investigation required within 24 hours per compliance protocol. Currently unresolved.',
            '<strong>Stock Expiry Alert</strong> at Wilmington Bay — 28 items near expiry within 48h window. Clearance markdown or donation action needed to avoid write-off.',
          ],
        },
        {
          title: 'Performance & Trends',
          icon: 'performance',
          bullets: [
            'District DPI at <strong>82</strong> (mid-pack). WoW trend is <strong>-2pts</strong>, driven entirely by the compliance drop. YoY, the district is flat vs Q1 last year — no growth trajectory.',
            'Revenue at <strong>$1.08M</strong> (+1.4% WoW). Modest growth but planogram gaps are suppressing impulse purchase conversion. Stores with compliant POGs show <strong>+12% basket size</strong> vs non-compliant.',
            'Staff turnover at <strong>18% quarterly</strong> — highest in the region. Stores with >30% new hires have 15% lower audit scores, confirming onboarding gaps as a systemic issue.',
          ],
        },
        {
          title: 'Recommendations & Next Steps',
          icon: 'recommendations',
          bullets: [
            '<strong>Today:</strong> Resolve safety incident at Raleigh Court — dispatch investigation team and document findings before 24h deadline.',
            '<strong>48 hours:</strong> Dispatch visual merchandising support to Charlotte Hub, Durham Heights, and Raleigh Commons for planogram reset completion.',
            '<strong>This week:</strong> Clear 28 expiring items at Wilmington Bay via markdown or donation. Set up automated expiry alerts to prevent recurrence.',
            '<strong>Forward-looking:</strong> Present retention incentive proposal at regional review. Pair underperforming stores with mentors from District 14 (best-in-class execution).',
          ],
        },
      ],
      closing: 'Carolina\'s core challenge is staffing stability. High turnover → onboarding gaps → compliance failures → declining DPI. The planogram drop is a symptom, not the disease. Address retention to fix execution.',
    },
    d11: {
      greeting: `Florida district has the highest revenue in the region but also the worst execution scores — a "busy but broken" pattern. 3 active triage items require immediate attention.`,
      sections: [
        {
          title: 'Triage & Critical Issues',
          icon: 'triage',
          bullets: [
            '<strong>VoC: Product Availability</strong> — +26% theme spike across Miami Central, Orlando Gateway, and Tampa Bay Mall. OOS rate hit <strong>6.2%</strong> (highest in chain). Perishable and cooler categories drive 65% of incidents.',
            '<strong>Cooler Temp Deviation</strong> at Jacksonville Hub — dairy cooler at 48°F (above 41°F threshold). Maintenance dispatched but estimated 4-hour repair window. Spoilage risk: <strong>$3.2K in at-risk inventory</strong>.',
            '<strong>Promo Execution Miss</strong> — 4 endcaps incomplete at Fort Lauderdale and St. Petersburg. Promotional tie-in for weekend sale is at risk. Revenue impact: estimated $6K if not resolved by Friday.',
          ],
        },
        {
          title: 'Performance & Trends',
          icon: 'performance',
          bullets: [
            'District DPI at <strong>79</strong> — lowest in region despite <strong>$1.52M revenue</strong> (highest). The disconnect between sales volume and execution quality is the defining challenge.',
            'Store performance is <strong>bimodal</strong>: coastal flagships (Miami Central SPI 91, Tampa Bay SPI 87) vs inland stores (Jacksonville SPI 54, Gainesville SPI 61). No middle ground — this isn\'t a normal distribution.',
            'YoY: Revenue up +4.2% but DPI down -3pts. The district is <strong>growing but deteriorating operationally</strong>. Spoilage losses are 3x chain average.',
          ],
        },
        {
          title: 'Recommendations & Next Steps',
          icon: 'recommendations',
          bullets: [
            '<strong>Immediate:</strong> Escalate DC delivery issues to supply chain leadership. Deploy emergency stock transfers from adjacent districts for top-20 OOS SKUs.',
            '<strong>Today:</strong> Monitor Jacksonville cooler repair. If not resolved in 4 hours, activate spoilage protocol and transfer at-risk inventory to nearest store.',
            '<strong>This week:</strong> Complete 4 endcaps at Fort Lauderdale / St. Petersburg before weekend sale launch. Assign dedicated setup crew.',
            '<strong>Structural:</strong> Consider restructuring district into coastal and inland sub-clusters with dedicated support. Present plan at half-year review — current one-DM model can\'t manage this variance.',
          ],
        },
      ],
      closing: 'Florida is a tale of two districts in one. Coastal stores are excellent; inland stores are in crisis. No amount of operational fixes will solve this without structural changes to how the district is managed and resourced.',
    },
    d19: {
      greeting: `Alabama district has 3 active triage items this week — audit backlog, a receiving delay, and a VoC cleanliness spike — but remains among the top-performing districts in the region.`,
      sections: [
        {
          title: 'Triage & Active Items',
          icon: 'triage',
          bullets: [
            '<strong>Audit Backlog</strong> at Birmingham Center and Huntsville Plaza — 6 overdue audits total. Low-to-medium risk but should be cleared by Friday to protect the district\'s 92% completion rate.',
            '<strong>Receiving Dock Delay</strong> at Montgomery Mall — 12h behind schedule. Impacts floor replenishment timing; monitor closely to prevent OOS on in-demand SKUs.',
            '<strong>VoC: Store Cleanliness</strong> at Mobile Bay and Tuscaloosa Walk — +19% negative mentions in the past week. Early-stage signal; action now can prevent escalation.',
          ],
        },
        {
          title: 'Performance & Trends',
          icon: 'performance',
          bullets: [
            'Revenue at <strong>$640K</strong> (+3.6% WoW). Modest volume for a 5-store district, but <strong>margin health at 35.1%</strong> is best in class — proving that efficiency drives profitability.',
            'District DPI at <strong>85</strong> — <strong>top quartile</strong>, consistent across all 3 months of Q1. WoW trend is +1pt. YoY improvement of +4pts confirms sustained execution quality.',
            'VoC satisfaction at <strong>85%</strong> — leads the region. Top themes: "Staff friendliness" and "Clean stores." The new cleanliness spike at 2 stores should be resolved before it affects the district average.',
          ],
        },
        {
          title: 'Recommendations & Next Steps',
          icon: 'recommendations',
          bullets: [
            '<strong>This week:</strong> Clear the 6-audit backlog at Birmingham Center and Huntsville Plaza. Escalate receiving dock delay at Montgomery Mall to supply chain if not resolved in 24h.',
            '<strong>48 hours:</strong> Address VoC cleanliness spike at Mobile Bay and Tuscaloosa Walk — increase cleaning rounds during peak hours to reverse the trend before it reaches district level.',
            '<strong>Strategic:</strong> Document the Alabama execution playbook for replication across underperforming districts. Key differentiators: small store count, stable staffing, low turnover, strong DM engagement.',
            '<strong>Recognition:</strong> Nominate David Park for best-practice sharing session at regional meeting. This district\'s approach is a scalable template.',
          ],
        },
      ],
      closing: 'Alabama remains a top-quartile district despite 3 active items this week. The triage items are manageable and early-stage — address them quickly to protect the DPI 85 standing. The district\'s playbook on staffing stability and DM engagement continues to be a model for underperforming districts like Florida (D11) and Carolina (D22).',
    },
  };

  const activeBrief = DISTRICT_BRIEFS[selectedDistrictId] || DISTRICT_BRIEFS['d14'];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  const filteredStores = (() => {
    const q = leaderboardSearch.trim().toLowerCase();
    const trendOrder: Record<string, number> = { up: 2, flat: 1, down: 0 };
    const statusOrder: Record<string, number> = { excellent: 0, stable: 1, warning: 2, critical: 3 };
    const sorters: Record<SortKey, (a: typeof activeStores[0], b: typeof activeStores[0]) => number> = {
      rank: (a, b) => a.rank - b.rank,
      store: (a, b) => a.storeName.localeCompare(b.storeName),
      dpi: (a, b) => a.dpi - b.dpi,
      sales: (a, b) => a.netSales - b.netSales,
      sea: (a, b) => a.seaScore - b.seaScore,
      voc: (a, b) => a.vocSatisfied - b.vocSatisfied,
      vocIssue: (a, b) => (a.topVocIssue || '').localeCompare(b.topVocIssue || ''),
      seaIssue: (a, b) => (a.topSeaIssue || '').localeCompare(b.topSeaIssue || ''),
      trend: (a, b) => (trendOrder[a.trend] ?? 0) - (trendOrder[b.trend] ?? 0),
      status: (a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0),
    };
    return adjustedStores
      .filter(store => {
        if (leaderboardFilter === 'risk' && !(store.status === 'critical' || store.status === 'warning')) return false;
        if (leaderboardFilter === 'top' && store.status !== 'excellent') return false;
        if (leaderboardFilter === 'revenue' && store.netSalesVar >= 0) return false;
        if (!q) return true;
        return (
          store.storeName.toLowerCase().includes(q) ||
          store.storeNumber.toLowerCase().includes(q) ||
          (store.topVocIssue || '').toLowerCase().includes(q) ||
          (store.topSeaIssue || '').toLowerCase().includes(q) ||
          store.status.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const cmp = sorters[leaderboardSort.key](a, b);
        return leaderboardSort.dir === 'asc' ? cmp : -cmp;
      });
  })();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHeight = () => {
      if (!dpiCardRef.current) return;
      const nextHeight = dpiCardRef.current.getBoundingClientRect().height;
      setDpiCardHeight(prev => (prev && Math.abs(prev - nextHeight) < 1 ? prev : nextHeight));
    };

    updateHeight();

    const handleResize = () => updateHeight();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && dpiCardRef.current) {
      observer = new ResizeObserver(entries => {
        if (!entries.length) return;
        const nextHeight = entries[0].contentRect.height;
        setDpiCardHeight(prev => (prev && Math.abs(prev - nextHeight) < 1 ? prev : nextHeight));
      });
      observer.observe(dpiCardRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, []);

  const briefHeightStyle = dpiCardHeight ? { height: dpiCardHeight, maxHeight: dpiCardHeight } : undefined;

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) => (
    leaderboardSort.key !== col
      ? <SwapVert sx={{ fontSize: 12 }} className="sort-icon sort-icon--idle"/>
      : leaderboardSort.dir === 'asc'
        ? <KeyboardArrowUp sx={{ fontSize: 12 }} className="sort-icon sort-icon--active"/>
        : <KeyboardArrowDown sx={{ fontSize: 12 }} className="sort-icon sort-icon--active"/>
  );

  if (isLoading) {
    return (
      <div className="district-intel">
        <div className="district-intel-loading">
          <div className="loading-spinner" />
          <p>Loading District Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="district-intel">
      {/* Global Header */}
      <div className="district-intel-header">
        <div className="header-left">
          <div className="header-title">
            <ShowChartOutlined sx={{ fontSize: 24 }}/>
            <h1>District Intelligence Center</h1>
          </div>
          <div className="header-meta">
            {isHQ ? (
              <div className="di-district-picker-wrap">
                <button className="di-district-picker" onClick={() => setShowDistrictDropdown(prev => !prev)}>
                  <PlaceOutlined sx={{ fontSize: 14 }}/>
                  <span>{selectedDistrictOption.label}</span>
                  <span className="di-district-dm">DM: {selectedDistrictOption.dm}</span>
                  <KeyboardArrowDown sx={{ fontSize: 14 }} className={showDistrictDropdown ? 'rotated' : ''}/>
                </button>
                {showDistrictDropdown && (
                  <div className="di-district-dropdown">
                    {HQ_DISTRICT_OPTIONS.map(d => (
                      <button
                        key={d.id}
                        className={`di-district-option ${d.id === selectedDistrictId ? 'active' : ''}`}
                        onClick={() => { setSelectedDistrictId(d.id); setShowDistrictDropdown(false); }}
                      >
                        <div className="di-district-option-main">
                          <PlaceOutlined sx={{ fontSize: 13 }}/>
                          <span className="di-district-option-label">{d.label}</span>
                        </div>
                        <div className="di-district-option-meta">
                          <span>DM: {d.dm}</span>
                          <span>{d.storeCount} stores</span>
                        </div>
                        {d.id === selectedDistrictId && <Check sx={{ fontSize: 14 }} className="di-district-check"/>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="district-badge">
                <PlaceOutlined sx={{ fontSize: 14 }}/>
                District 14 — Tennessee
              </span>
            )}
            <div className="calendar-picker-wrapper">
              <button 
                className="period-selector"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarTodayOutlined sx={{ fontSize: 14 }}/>
                <span>{getSelectedPeriodLabel()}</span>
                <KeyboardArrowDown sx={{ fontSize: 14 }} className={showCalendar ? 'rotated' : ''}/>
              </button>
              
              {showCalendar && (
                <div className="calendar-dropdown">
                  <div className="calendar-mode-toggle">
                    <button 
                      className={`mode-btn ${calendarMode === 'week' ? 'active' : ''}`}
                      onClick={() => {
                        setCalendarMode('week');
                        if (selectedWeekStart) {
                          setViewingMonth(selectedWeekStart.getMonth());
                          setViewingYear(selectedWeekStart.getFullYear());
                        }
                      }}
                    >
                      Week
                    </button>
                    <button 
                      className={`mode-btn ${calendarMode === 'month' ? 'active' : ''}`}
                      onClick={() => {
                        setCalendarMode('month');
                        if (selectedMonth) {
                          setViewingMonth(selectedMonth.getMonth());
                          setViewingYear(selectedMonth.getFullYear());
                        }
                      }}
                    >
                      Month
                    </button>
                    <button 
                      className={`mode-btn ${calendarMode === 'quarter' ? 'active' : ''}`}
                      onClick={() => setCalendarMode('quarter')}
                    >
                      Quarter
                    </button>
                  </div>
                  
                  {calendarMode === 'quarter' ? (
                    <div className="quarter-list">
                      {availableQuarters.map((q, idx) => (
                        <button
                          key={idx}
                          className={`quarter-option ${selectedQuarter?.quarter === q.quarter && selectedQuarter?.year === q.year ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedQuarter(q);
                            setShowCalendar(false);
                          }}
                        >
                          <span className="quarter-label">Q{q.quarter} {q.year}</span>
                          <span className="quarter-range">{q.label.match(/\((.+)\)/)?.[1]}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="calendar-nav">
                        <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                          <KeyboardArrowDown sx={{ fontSize: 16 }} style={{ transform: 'rotate(90deg)' }}/>
                        </button>
                        <div className="calendar-month-year">
                          <span className="calendar-month">{monthNames[viewingMonth]}</span>
                          <span className="calendar-year">{viewingYear}</span>
                        </div>
                        <button className="nav-btn" onClick={() => navigateMonth('next')}>
                          <KeyboardArrowDown sx={{ fontSize: 16 }} style={{ transform: 'rotate(-90deg)' }}/>
                        </button>
                      </div>
                      
                      <div className="calendar-grid">
                        <div className="calendar-weekdays">
                          <span>Su</span>
                          <span>Mo</span>
                          <span>Tu</span>
                          <span>We</span>
                          <span>Th</span>
                          <span>Fr</span>
                          <span>Sa</span>
                        </div>
                        <div className="calendar-days">
                          {calendarDays.map((entry, index) => {
                            if (entry.trailing) {
                              return (
                                <button key={index} className="calendar-day trailing" disabled>
                                  {entry.day}
                                </button>
                              );
                            }
                            const day = entry.day;
                            const date = new Date(viewingYear, viewingMonth, day);
                            const isDisabledWeek = isDateInFuture(date) || isDateInCurrentWeek(date);
                            const isDisabledMonth = viewingYear > new Date().getFullYear() || 
                              (viewingYear === new Date().getFullYear() && viewingMonth >= new Date().getMonth());
                            const isDisabled = calendarMode === 'week' ? isDisabledWeek : isDisabledMonth;
                            const isSelectedWeek = isInSelectedWeek(day);
                            const isSelectedMonth = selectedMonth && 
                              viewingYear === selectedMonth.getFullYear() && 
                              viewingMonth === selectedMonth.getMonth();
                            const isSelected = calendarMode === 'week' ? isSelectedWeek : isSelectedMonth;
                            
                            return (
                              <button
                                key={index}
                                className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  if (calendarMode === 'week') {
                                    handleDayClick(day);
                                  } else if (!isDisabledMonth) {
                                    setSelectedMonth(new Date(viewingYear, viewingMonth, 1));
                                    setShowCalendar(false);
                                  }
                                }}
                                disabled={isDisabled}
                              >
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
            <span className="last-refresh">
              <AccessTimeOutlined sx={{ fontSize: 12 }}/>
              Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-search">
            <SearchOutlined sx={{ fontSize: 16 }}/>
            <input type="text" placeholder="Search stores, metrics..." />
          </div>
          <button className="header-action-btn secondary">
            <FileDownloadOutlined sx={{ fontSize: 16 }}/>
            Export
          </button>
          <button className="header-icon-btn" onClick={handleRefresh}>
            <RefreshOutlined sx={{ fontSize: 18 }}/>
          </button>
        </div>
      </div>

      {/* Executive Pulse Hero Section - Matching Home Screen DPI Card */}
      <div className="executive-pulse">
        {/* DPI Card - Home Screen Style */}
        <div className="dpi-card-v2" ref={dpiCardRef}>
          {/* Hero Score Section */}
          <div className="dpi-hero-section">
            {isAnyFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="filter-active-icon dpi-card-filter"/>}
            <div className="dpi-gauge-wrapper-v2">
              <svg className="dpi-gauge-v2" viewBox="0 0 160 160">
                {/* Background track */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                {/* Progress arc with gradient */}
                <defs>
                  <linearGradient id="dpiGradientDI" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="url(#dpiGradientDI)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(districtDPI / 100) * 427} 427`}
                  transform="rotate(-90 80 80)"
                  className="dpi-progress-v2"
                />
              </svg>
              <div className="dpi-score-center-v2">
                <span className="dpi-score-value-v2">{districtDPI}</span>
                <span className="dpi-score-label-v2">Performance Index</span>
              </div>
            </div>
          </div>

          {/* Performance Story */}
          <div className="dpi-story-section">
            {/* Excellence Badge */}
            <div className="dpi-tier-badge-v2">
              <div className="tier-text">
                <span className="tier-title">{districtTier} Tier</span>
                <span className="tier-subtitle">Top 10% of all districts</span>
              </div>
            </div>

            {/* Rank & Change Stats */}
            <div className="dpi-rank-stats">
              <div className="dpi-rank-card">
                <span className="dpi-rank-value">#{districtRank}</span>
                <span className="dpi-rank-label">of {totalDistricts}</span>
              </div>
              <div className="dpi-change-card">
                <div className={`dpi-change-value ${dpiChange < 0 ? 'negative' : ''}`}>
                  {dpiChange >= 0
                    ? <TrendingUpOutlined sx={{ fontSize: 18 }}/>
                    : <TrendingDownOutlined sx={{ fontSize: 18 }}/>
                  }
                  <span>{dpiChange >= 0 ? '+' : ''}{dpiChange}%</span>
                </div>
                <span className="dpi-change-label">{calendarMode === 'week' ? 'this week' : calendarMode === 'month' ? 'this month' : 'this quarter'}</span>
              </div>
            </div>

            {/* Score Breakdown - Card Grid */}
            <div className="dpi-breakdown-header">
              <span className="breakdown-title">Score Breakdown</span>
            </div>
            <div className="dpi-breakdown-grid">
              <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '12px 8px 10px', overflow: 'hidden' }}>
                <div className="breakdown-value">{currentData.scoreSales}</div>
                <div className="breakdown-label">Sales</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${currentData.scoreSales}%` }}></div>
                </div>
              </Card>
              <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '12px 8px 10px', overflow: 'hidden' }}>
                <div className="breakdown-value">{currentData.scoreExecution}</div>
                <div className="breakdown-label">Execution</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${currentData.scoreExecution}%` }}></div>
                </div>
              </Card>
              <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '12px 8px 10px', overflow: 'hidden' }}>
                <div className="breakdown-value">{currentData.scoreVoC}</div>
                <div className="breakdown-label">VoC</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${currentData.scoreVoC}%` }}></div>
                </div>
              </Card>
            </div>
            {/* Chain Comparison - Integrated */}
            <div className="dpi-chain-comparison">
              <div className="chain-comparison-header">
                <span className="chain-label-title">vs Chain Average</span>
                <span className={`chain-delta ${districtDPI >= chainAvgDPI ? 'positive' : 'negative'}`}>
                  {districtDPI >= chainAvgDPI ? '+' : ''}{districtDPI - chainAvgDPI} pts
                </span>
              </div>
              <div className="chain-comparison-bar">
                <div className="chain-bar-track">
                  <div className="chain-bar-fill" style={{ width: `${(districtDPI / 100) * 100}%` }}></div>
                  <div className="chain-marker" style={{ left: `${(chainAvgDPI / 100) * 100}%` }}>
                    <div className="chain-marker-line"></div>
                    <span className="chain-marker-label">Chain: {chainAvgDPI}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — AI Daily Brief (shared component) */}
        <div className="pulse-right-panel">
          <AIDailyBrief
            brief={activeBrief}
            userName={user?.name}
            heightStyle={briefHeightStyle}
          />
        </div>
      </div>

      {/* District Broadcasting Analytics — full width below executive pulse */}
      <div className="bca-section">
        <div className="bca-header">
          <div className="bca-header-left">
            <div className="bca-title-row">
              <CampaignOutlined sx={{ fontSize: 20 }}/>
              <h2>Broadcast Analytics</h2>
            </div>
            <p className="bca-subtitle">Communication effectiveness, compliance gaps, and engagement insights</p>
          </div>
          {!isHQ && (
            <button className="bca-create-btn" onClick={openBroadcastWizard}>
              <CampaignOutlined sx={{ fontSize: 13 }}/> Create Broadcast
            </button>
          )}
        </div>

        {/* A. Performance Overview — KPI Strip */}
        <div className="bca-overview-grid">
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Active Broadcasts</span>
            <span className="bca-kpi-value">{activeBroadcasts.overview.active}</span>
            <span className="bca-kpi-context">currently live</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Sent This Week</span>
            <span className="bca-kpi-value">{activeBroadcasts.overview.sentThisWeek}</span>
            <span className="bca-kpi-context">broadcasts</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Acknowledged</span>
            <span className="bca-kpi-value">{activeBroadcasts.overview.ackPct}%</span>
            <span className="bca-kpi-context">of all recipients</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Avg Ack Time</span>
            <span className="bca-kpi-value">{activeBroadcasts.overview.avgAckTime}</span>
            <span className="bca-kpi-context">time to acknowledge</span>
          </div>
          <div className="bca-kpi-card">
            <span className="bca-kpi-label">Trend vs Last</span>
            <span className={`bca-kpi-value ${activeBroadcasts.overview.trendVsLast >= 0 ? 'positive' : 'negative'}`}>
              {activeBroadcasts.overview.trendVsLast >= 0 ? '+' : ''}{activeBroadcasts.overview.trendVsLast}%
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
                {activeBroadcasts.effectiveness.map(bc => {
                  const pending = bc.stores - bc.acked;
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
                        <span className={`bca-pending-count ${pending > 2 ? 'high' : pending > 0 ? 'medium' : 'zero'}`}>{pending}</span>
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

      {/* District KPI Cards */}
      <div className="kpi-cards-section">
        <div className="kpi-cards-header">
          <div className="kpi-header-title-row">
            <div className="kpi-title-group">
              <h2><BarChartOutlined sx={{ fontSize: 20 }}/> District KPIs {isAnyFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="filter-active-icon"/>}</h2>
              <span className="kpi-header-subtitle">Click any metric to explore 52-week trend</span>
            </div>
            <div className="kpi-header-stats">
              <div className="kpi-stat-pill kpi-stat-positive">
                <span className="kpi-stat-value">{adjustedKPIs.filter(k => k.status === 'positive').length}</span>
                <span className="kpi-stat-label">On Track</span>
              </div>
              <div className="kpi-stat-pill kpi-stat-warning">
                <span className="kpi-stat-value">{adjustedKPIs.filter(k => k.status === 'warning').length}</span>
                <span className="kpi-stat-label">Watch</span>
              </div>
              <div className="kpi-stat-pill kpi-stat-negative">
                <span className="kpi-stat-value">{adjustedKPIs.filter(k => k.status === 'negative').length}</span>
                <span className="kpi-stat-label">Needs Attention</span>
              </div>
            </div>
          </div>
        </div>
        <div className="kpi-cards-grid">
          {/* 1. Commercial */}
          {adjustedKPIs.filter(k => k.category === 'commercial').map(kpi => (
            <Card
              key={kpi.id}
              className={`kpi-tile--${kpi.status}`}
              onClick={() => kpi.clickable && setActiveKPIPanel(activeKPIPanel?.id === kpi.id ? null : kpi)}
              sx={{
                maxWidth: '100%',
                minHeight: 'unset',
                padding: 0,
                width: '100%',
                borderRadius: '8px',
                border: activeKPIPanel?.id === kpi.id ? '1px solid var(--ia-color-text-primary)' : '1px solid var(--ia-color-border)',
                boxShadow: activeKPIPanel?.id === kpi.id ? '0 0 0 1px var(--ia-color-text-primary), 0 1px 3px rgba(15,23,42,0.04)' : '0 1px 3px rgba(15,23,42,0.04)',
                cursor: kpi.clickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': kpi.clickable ? { borderColor: 'var(--ia-color-text-tertiary)', boxShadow: '0 1px 4px rgba(15,23,42,0.08)', transform: 'translateY(-1px)' } : {},
              }}
            >
              <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="kpi-tile-category kpi-tile-category--commercial">
                  <AttachMoneyOutlined sx={{ fontSize: 12 }}/>
                  <span>Commercial</span>
                </div>
                <div className="kpi-tile-value-row">
                  <span className="kpi-tile-primary">{kpi.primaryValue}</span>
                  {kpi.primaryUnit && <span className="kpi-tile-unit">{kpi.primaryUnit}</span>}
                </div>
                <span className="kpi-tile-label">{kpi.label}</span>
                {kpi.microInsight && (
                  <div className="kpi-tile-insight">
                    <span className="kpi-tile-insight-dot" />
                    <span>{kpi.microInsight}</span>
                  </div>
                )}
                <div className={`kpi-tile-delta delta-${kpi.deltaDirection}`}>
                  {kpi.deltaDirection === 'up' && <NorthEast sx={{ fontSize: 12 }}/>}
                  {kpi.deltaDirection === 'down' && <SouthEast sx={{ fontSize: 12 }}/>}
                  <span>{kpi.delta}</span>
                  {kpi.deltaContext && <span className="kpi-delta-ctx">{kpi.deltaContext}</span>}
                </div>
                {kpi.trendData && (() => {
                  const data = kpi.trendData;
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const W = 120, H = 44, P = 3;
                  const points = data.map((v, i) => ({
                    x: (i / (data.length - 1)) * W,
                    y: H - P - ((v - min) / range) * (H - P * 2),
                  }));
                  const path = points.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
                  const areaPath = `${path} L ${W},${H} L 0,${H} Z`;
                  const last = points[points.length - 1];
                  const color = kpi.status === 'positive' ? '#047857' : kpi.status === 'negative' ? '#991b1b' : kpi.status === 'warning' ? '#b45309' : 'var(--ia-color-primary-pressed)';
                  return (
                    <div className="kpi-tile-sparkline">
                      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#spark-${kpi.id})`} />
                        <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="miter" />
                        <circle cx={last.x} cy={last.y} r="1.8" fill={color} stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </div>
                  );
                })()}
                {kpi.clickable && <KeyboardArrowRight sx={{ fontSize: 14 }} className="kpi-tile-arrow"/>}
              </div>
            </Card>
          ))}

          {/* 2. Customer */}
          {adjustedKPIs.filter(k => k.category === 'customer').map(kpi => (
            <Card
              key={kpi.id}
              className={`kpi-tile--${kpi.status}`}
              onClick={() => kpi.clickable && setActiveKPIPanel(activeKPIPanel?.id === kpi.id ? null : kpi)}
              sx={{
                maxWidth: '100%',
                minHeight: 'unset',
                padding: 0,
                width: '100%',
                borderRadius: '8px',
                border: activeKPIPanel?.id === kpi.id ? '1px solid var(--ia-color-text-primary)' : '1px solid var(--ia-color-border)',
                boxShadow: activeKPIPanel?.id === kpi.id ? '0 0 0 1px var(--ia-color-text-primary), 0 1px 3px rgba(15,23,42,0.04)' : '0 1px 3px rgba(15,23,42,0.04)',
                cursor: kpi.clickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': kpi.clickable ? { borderColor: 'var(--ia-color-text-tertiary)', boxShadow: '0 1px 4px rgba(15,23,42,0.08)', transform: 'translateY(-1px)' } : {},
              }}
            >
              <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="kpi-tile-category kpi-tile-category--customer">
                  <FavoriteOutlined sx={{ fontSize: 12 }}/>
                  <span>Customer</span>
                </div>
                <div className="kpi-tile-value-row">
                  <span className="kpi-tile-primary">{kpi.primaryValue}</span>
                  {kpi.primaryUnit && <span className="kpi-tile-unit">{kpi.primaryUnit}</span>}
                </div>
                <span className="kpi-tile-label">{kpi.label}</span>
                <div className={`kpi-tile-delta delta-${kpi.deltaDirection}`}>
                  {kpi.deltaDirection === 'up' && <NorthEast sx={{ fontSize: 12 }}/>}
                  {kpi.deltaDirection === 'down' && <SouthEast sx={{ fontSize: 12 }}/>}
                  <span>{kpi.delta}</span>
                  {kpi.deltaContext && <span className="kpi-delta-ctx">{kpi.deltaContext}</span>}
                </div>
                {kpi.trendData && (() => {
                  const data = kpi.trendData;
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const W = 120, H = 44, P = 3;
                  const points = data.map((v, i) => ({
                    x: (i / (data.length - 1)) * W,
                    y: H - P - ((v - min) / range) * (H - P * 2),
                  }));
                  const path = points.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
                  const areaPath = `${path} L ${W},${H} L 0,${H} Z`;
                  const last = points[points.length - 1];
                  const color = kpi.status === 'positive' ? '#047857' : kpi.status === 'negative' ? '#991b1b' : kpi.status === 'warning' ? '#b45309' : 'var(--ia-color-primary-pressed)';
                  return (
                    <div className="kpi-tile-sparkline">
                      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#spark-${kpi.id})`} />
                        <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="miter" />
                        <circle cx={last.x} cy={last.y} r="1.8" fill={color} stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </div>
                  );
                })()}
                {kpi.clickable && <KeyboardArrowRight sx={{ fontSize: 14 }} className="kpi-tile-arrow"/>}
              </div>
            </Card>
          ))}

          {/* 3. Execution */}
          {adjustedKPIs.filter(k => k.category === 'execution').map(kpi => (
            <Card
              key={kpi.id}
              className={`kpi-tile--${kpi.status}`}
              onClick={() => kpi.clickable && setActiveKPIPanel(activeKPIPanel?.id === kpi.id ? null : kpi)}
              sx={{
                maxWidth: '100%',
                minHeight: 'unset',
                padding: 0,
                width: '100%',
                borderRadius: '8px',
                border: activeKPIPanel?.id === kpi.id ? '1px solid var(--ia-color-text-primary)' : '1px solid var(--ia-color-border)',
                boxShadow: activeKPIPanel?.id === kpi.id ? '0 0 0 1px var(--ia-color-text-primary), 0 1px 3px rgba(15,23,42,0.04)' : '0 1px 3px rgba(15,23,42,0.04)',
                cursor: kpi.clickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': kpi.clickable ? { borderColor: 'var(--ia-color-text-tertiary)', boxShadow: '0 1px 4px rgba(15,23,42,0.08)', transform: 'translateY(-1px)' } : {},
              }}
            >
              <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="kpi-tile-category kpi-tile-category--execution">
                  <AssignmentTurnedInOutlined sx={{ fontSize: 12 }}/>
                  <span>Execution</span>
                </div>
                <div className="kpi-tile-value-row">
                  <span className="kpi-tile-primary">{kpi.primaryValue}</span>
                  {kpi.primaryUnit && <span className="kpi-tile-unit">{kpi.primaryUnit}</span>}
                </div>
                <span className="kpi-tile-label">{kpi.label}</span>
                <div className={`kpi-tile-delta delta-${kpi.deltaDirection}`}>
                  {kpi.deltaDirection === 'up' && <NorthEast sx={{ fontSize: 12 }}/>}
                  {kpi.deltaDirection === 'down' && <SouthEast sx={{ fontSize: 12 }}/>}
                  <span>{kpi.delta}</span>
                  {kpi.deltaContext && <span className="kpi-delta-ctx">{kpi.deltaContext}</span>}
                </div>
                {kpi.trendData && (() => {
                  const data = kpi.trendData;
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const W = 120, H = 44, P = 3;
                  const points = data.map((v, i) => ({
                    x: (i / (data.length - 1)) * W,
                    y: H - P - ((v - min) / range) * (H - P * 2),
                  }));
                  const path = points.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
                  const areaPath = `${path} L ${W},${H} L 0,${H} Z`;
                  const last = points[points.length - 1];
                  const color = kpi.status === 'positive' ? '#047857' : kpi.status === 'negative' ? '#991b1b' : kpi.status === 'warning' ? '#b45309' : 'var(--ia-color-primary-pressed)';
                  return (
                    <div className="kpi-tile-sparkline">
                      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#spark-${kpi.id})`} />
                        <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="miter" />
                        <circle cx={last.x} cy={last.y} r="1.8" fill={color} stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </div>
                  );
                })()}
                {kpi.clickable && <KeyboardArrowRight sx={{ fontSize: 14 }} className="kpi-tile-arrow"/>}
              </div>
            </Card>
          ))}

          {/* 4. Profitability */}
          {adjustedKPIs.filter(k => k.category === 'profitability').map(kpi => (
            <Card
              key={kpi.id}
              className={`kpi-tile--${kpi.status}`}
              onClick={() => kpi.clickable && setActiveKPIPanel(activeKPIPanel?.id === kpi.id ? null : kpi)}
              sx={{
                maxWidth: '100%',
                minHeight: 'unset',
                padding: 0,
                width: '100%',
                borderRadius: '8px',
                border: activeKPIPanel?.id === kpi.id ? '1px solid var(--ia-color-text-primary)' : '1px solid var(--ia-color-border)',
                boxShadow: activeKPIPanel?.id === kpi.id ? '0 0 0 1px var(--ia-color-text-primary), 0 1px 3px rgba(15,23,42,0.04)' : '0 1px 3px rgba(15,23,42,0.04)',
                cursor: kpi.clickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': kpi.clickable ? { borderColor: 'var(--ia-color-text-tertiary)', boxShadow: '0 1px 4px rgba(15,23,42,0.08)', transform: 'translateY(-1px)' } : {},
              }}
            >
              <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="kpi-tile-category kpi-tile-category--profitability">
                  <TrackChangesOutlined sx={{ fontSize: 12 }}/>
                  <span>Profitability</span>
                </div>
                <div className="kpi-tile-value-row">
                  <span className="kpi-tile-primary">{kpi.primaryValue}</span>
                  {kpi.primaryUnit && <span className="kpi-tile-unit">{kpi.primaryUnit}</span>}
                </div>
                <span className="kpi-tile-label">{kpi.label}</span>
                {kpi.microInsight && (
                  <div className="kpi-tile-insight">
                    <span className="kpi-tile-insight-dot" />
                    <span>{kpi.microInsight}</span>
                  </div>
                )}
                <div className={`kpi-tile-delta delta-${kpi.deltaDirection}`}>
                  {kpi.deltaDirection === 'up' && <NorthEast sx={{ fontSize: 12 }}/>}
                  {kpi.deltaDirection === 'down' && <SouthEast sx={{ fontSize: 12 }}/>}
                  <span>{kpi.delta}</span>
                  {kpi.deltaContext && <span className="kpi-delta-ctx">{kpi.deltaContext}</span>}
                </div>
                {kpi.trendData && (() => {
                  const data = kpi.trendData;
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const W = 120, H = 44, P = 3;
                  const points = data.map((v, i) => ({
                    x: (i / (data.length - 1)) * W,
                    y: H - P - ((v - min) / range) * (H - P * 2),
                  }));
                  const path = points.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
                  const areaPath = `${path} L ${W},${H} L 0,${H} Z`;
                  const last = points[points.length - 1];
                  const color = kpi.status === 'positive' ? '#047857' : kpi.status === 'negative' ? '#991b1b' : kpi.status === 'warning' ? '#b45309' : 'var(--ia-color-primary-pressed)';
                  return (
                    <div className="kpi-tile-sparkline">
                      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#spark-${kpi.id})`} />
                        <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="miter" />
                        <circle cx={last.x} cy={last.y} r="1.8" fill={color} stroke="#ffffff" strokeWidth="1" />
                      </svg>
                    </div>
                  );
                })()}
                {kpi.clickable && <KeyboardArrowRight sx={{ fontSize: 14 }} className="kpi-tile-arrow"/>}
              </div>
            </Card>
          ))}

        </div>

      </div>


      
      {/* Store Leaderboard - Premium */}
      <div className="leaderboard-section-premium">
        <div className="leaderboard-header-premium">
          <div className="header-title-row">
            <div className="title-group">
              <h2><StoreOutlined sx={{ fontSize: 20 }}/> Store Leaderboard {isAnyFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="filter-active-icon"/>}</h2>
              <span className="header-subtitle">Performance ranking across all stores</span>
            </div>
            <div className="header-stats">
              <div className="stat-pill">
                <span className="stat-value">{activeStores.length}</span>
                <span className="stat-label">Stores</span>
              </div>
              <div className="stat-pill success">
                <span className="stat-value">{activeStores.filter(s => s.status === 'excellent').length}</span>
                <span className="stat-label">Excellent</span>
              </div>
              <div className="stat-pill warning">
                <span className="stat-value">{activeStores.filter(s => s.status === 'warning' || s.status === 'critical').length}</span>
                <span className="stat-label">Needs Attention</span>
              </div>
            </div>
          </div>
          <div className="leaderboard-controls">
            <div className="search-filter">
              <SearchOutlined sx={{ fontSize: 16 }}/>
              <input
                type="text"
                placeholder="Search stores, issues, status..."
                className="store-search-input"
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
              />
              {leaderboardSearch && (
                <button className="store-search-clear" onClick={() => setLeaderboardSearch('')} aria-label="Clear search">
                  <CloseOutlined sx={{ fontSize: 14 }}/>
                </button>
              )}
            </div>
            <Tabs
              tabNames={[
                { value: 'all', label: 'All Stores' },
                { value: 'risk', label: 'At Risk' },
                { value: 'top', label: 'Top Performers' },
                { value: 'revenue', label: 'Revenue Leakers' },
              ]}
              tabPanels={[]}
              value={leaderboardFilter}
              onChange={(_, val) => setLeaderboardFilter(val as 'all' | 'risk' | 'top' | 'revenue')}
            />
          </div>
        </div>
        <div className="leaderboard-table-premium">
          <table className="wow-table">
            <thead>
              <tr>
                <th className="th-rank th-sortable" onClick={() => handleLeaderboardSort('rank')}><span>Rank</span><SortIcon col="rank" /></th>
                <th className="th-store th-sortable" onClick={() => handleLeaderboardSort('store')}><span>Store</span><SortIcon col="store" /></th>
                <th className="th-dpi th-sortable" onClick={() => handleLeaderboardSort('dpi')}><span>SPI</span><SortIcon col="dpi" /></th>
                <th className="th-sales th-sortable" onClick={() => handleLeaderboardSort('sales')}><span>Net Sales</span><SortIcon col="sales" /></th>
                <th className="th-sea th-sortable" onClick={() => handleLeaderboardSort('sea')}><span>SEA Score</span><SortIcon col="sea" /></th>
                <th className="th-voc th-sortable" onClick={() => handleLeaderboardSort('voc')}><span>VoC %</span><SortIcon col="voc" /></th>
                <th className="th-issue th-sortable" onClick={() => handleLeaderboardSort('vocIssue')}><span>Top VoC Issue</span><SortIcon col="vocIssue" /></th>
                <th className="th-issue th-sortable" onClick={() => handleLeaderboardSort('seaIssue')}><span>Top SEA Issue</span><SortIcon col="seaIssue" /></th>
                <th className="th-status th-sortable" onClick={() => handleLeaderboardSort('status')}><span>Status</span><SortIcon col="status" /></th>
                {!isHQ && <th className="th-action"></th>}
              </tr>
            </thead>
            <tbody>
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={10} className="leaderboard-empty">
                    No stores match your search or filters.
                  </td>
                </tr>
              )}
              {filteredStores.map((store) => (
                <tr 
                  key={store.id} 
                  className={`row-${store.status.toLowerCase()} ${!isHQ ? 'clickable-row' : ''} ${navigatingStore === store.storeNumber ? 'navigating' : ''}`}
                  onClick={() => !isHQ && !isNavigating && handleStoreClick(store)}
                >
                  <td className="td-rank">
                    <span className="rank-text">{store.rank}</span>
                  </td>
                  <td className="td-store">
                    <div
                      className="store-info store-info--clickable"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/store-operations/store-deep-dive?store=${store.storeNumber}&name=${encodeURIComponent(store.storeName)}`);
                      }}
                      title={`Open ${store.storeName} in Store Deep Dive`}
                    >
                      <span className="store-id">#{store.storeNumber}</span>
                      <span className="store-name">{store.storeName}</span>
                    </div>
                  </td>
                  <td className="td-dpi">
                    <span className="dpi-text" style={{ color: getDPIColor(store.dpiTier) }}>
                      {store.dpi}
                    </span>
                  </td>
                  <td className="td-sales">
                    <div className="sales-info">
                      <span className="sales-amount">{formatCurrency(store.netSales)}</span>
                      <span className={`sales-change ${store.netSalesVar >= 0 ? 'positive' : 'negative'}`}>
                        {store.netSalesVar >= 0 ? '+' : ''}{store.netSalesVar}%
                      </span>
                    </div>
                  </td>
                  <td className="td-sea">{store.seaScore}</td>
                  <td className="td-voc">
                    <span className={`voc-text ${store.vocSatisfied >= 85 ? 'good' : store.vocSatisfied >= 70 ? 'ok' : 'poor'}`}>
                      {store.vocSatisfied}%
                    </span>
                  </td>
                  <td className="td-issue">{store.topVocIssue || '-'}</td>
                  <td className="td-issue">{store.topSeaIssue || '-'}</td>
                  <td className="td-status">
                    <span className={`status-pill ${store.status.toLowerCase()}`}>{store.status}</span>
                  </td>
                  {!isHQ && (
                    <td className="td-action">
                      <span className={`view-store-link ${navigatingStore === store.storeNumber ? 'loading' : ''}`}>
                        {navigatingStore === store.storeNumber ? (
                          <>
                            <RefreshOutlined sx={{ fontSize: 13 }} className="spinning"/>
                            <span>Loading…</span>
                          </>
                        ) : (
                          <>
                            <span>View store</span>
                            <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                          </>
                        )}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Compliance Heatmap */}
      <div className="heatmap-section">
        <div className="heatmap-header">
          <div className="header-title-row">
            <div className="title-group">
              <h2><AssignmentTurnedInOutlined sx={{ fontSize: 20 }}/> Audit Compliance Heatmap {isAnyFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="filter-active-icon"/>}</h2>
              <span className="header-subtitle">Store-level compliance across audit categories</span>
            </div>
            <div className="heatmap-legend">
              <span className="heatmap-legend-label">Compliance:</span>
              <div className="heatmap-legend-scale">
                <div className="legend-swatch" style={{ background: '#fcc' }}></div>
                <span className="legend-text">0%</span>
                <div className="legend-swatch" style={{ background: '#fde2e2' }}></div>
                <span className="legend-text">25%</span>
                <div className="legend-swatch" style={{ background: 'var(--ia-color-warning-bg)' }}></div>
                <span className="legend-text">50%</span>
                <div className="legend-swatch" style={{ background: '#d9f2e0' }}></div>
                <span className="legend-text">75%</span>
                <div className="legend-swatch" style={{ background: '#c6f0d4' }}></div>
                <span className="legend-text">100%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="heatmap-table-wrapper">
          <table className="heatmap-table wow-table">
            <thead>
              <tr>
                <th className="heatmap-th-store">Store</th>
                {auditCategories.map(cat => (
                  <th key={cat} className="heatmap-th-cat">{cat}</th>
                ))}
                <th className="heatmap-th-cat">Avg</th>
              </tr>
            </thead>
            <tbody>
              {activeStores.map(store => {
                const scores = adjustedAuditData[store.storeNumber];
                const avg = Math.round(auditCategories.reduce((sum, cat) => sum + (scores?.[cat] || 0), 0) / auditCategories.length);
                return (
                  <tr key={store.id}>
                    <td className={`heatmap-store-cell ${!isHQ ? 'heatmap-store-clickable' : ''}`} onClick={() => !isHQ && handleStoreClick(store)}>
                      <span className="heatmap-store-number">#{store.storeNumber}</span>
                      <span className="heatmap-store-name">{store.storeName}</span>
                    </td>
                    {auditCategories.map(cat => {
                      const val = scores?.[cat] || 0;
                      const cellKey = `${store.storeNumber}-${cat}`;
                      const detail = cellKey in auditCellDetails ? auditCellDetails[cellKey] : generateAutoDetail(store.storeNumber, cat, val);
                      const skillMap = getSkillForDimension(cat);
                      const isActive = heatmapDetail?.storeNumber === store.storeNumber && heatmapDetail?.category === cat;
                      return (
                        <td key={cat} className="heatmap-cell">
                          <div
                            className={`heatmap-chip ${isActive ? 'heatmap-chip--active' : ''}`}
                            style={{
                              background: getComplianceColor(val),
                              color: getComplianceTextColor(val),
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHeatmapTip({ x: rect.left + rect.width / 2, y: rect.top, store: store.storeName, cat, val });
                            }}
                            onMouseLeave={() => setHeatmapTip(null)}
                            onClick={() => {
                              setHeatmapTip(null);
                              setHeatmapDetail({
                                storeNumber: store.storeNumber,
                                storeName: store.storeName,
                                category: cat,
                                score: val,
                                detail,
                                skill: skillMap.skill,
                                skillLogic: skillMap.logic,
                              });
                            }}
                          >
                            <span className="heatmap-value">{val}%</span>
                            <span className={`heatmap-chip-trend heatmap-chip-trend--${detail.trend}`}>
                              {detail.trend === 'improving' ? '↑' : detail.trend === 'declining' ? '↓' : '—'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="heatmap-cell">
                      <div
                        className="heatmap-cell-inner heatmap-avg heatmap-cell-clickable"
                        style={{
                          background: getComplianceColor(avg),
                          color: getComplianceTextColor(avg),
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHeatmapTip({ x: rect.left + rect.width / 2, y: rect.top, store: store.storeName, cat: 'Average', val: avg });
                        }}
                        onMouseLeave={() => setHeatmapTip(null)}
                        onClick={() => {
                          setHeatmapTip(null);
                          const avgSkillMap = getSkillForDimension('Avg');
                          setHeatmapDetail({
                            storeNumber: store.storeNumber,
                            storeName: store.storeName,
                            category: 'Avg',
                            score: avg,
                            detail: generateAutoDetail(store.storeNumber, 'Avg', avg),
                            skill: avgSkillMap.skill,
                            skillLogic: avgSkillMap.logic,
                          });
                        }}
                      >
                        <span className="heatmap-value">{avg}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {heatmapTip && (
          <div
            className="heatmap-tooltip heatmap-tooltip--visible"
            style={{ left: heatmapTip.x, top: heatmapTip.y }}
          >
            <strong>{heatmapTip.store}</strong>
            <span>{heatmapTip.cat}: {heatmapTip.val}%</span>
          </div>
        )}
      </div>

      {/* Heatmap Cell Detail Panel — Right-side */}
      {heatmapDetail && (
        <>
          <div className="detail-panel-overlay" onClick={() => setHeatmapDetail(null)} />
          <div className="detail-panel">
            <div className="detail-panel-header">
              <button className="detail-panel-close" onClick={() => setHeatmapDetail(null)}>
                <CloseOutlined sx={{ fontSize: 18 }}/>
              </button>
            </div>
            <div className="detail-panel-body">
              {/* Severity / Source Row */}
              <div className="dp-severity-row">
                <span
                  className="dp-severity-badge"
                  style={{ background: getComplianceColor(heatmapDetail.score), color: getComplianceTextColor(heatmapDetail.score) }}
                >
                  {heatmapDetail.score}% COMPLIANCE
                </span>
                <span className="dp-source">
                  <AssignmentTurnedInOutlined sx={{ fontSize: 11 }}/>
                  Audit Heatmap
                </span>
              </div>

              {/* Title */}
              <h2 className="dp-title">{heatmapDetail.category} Audit</h2>
              <p className="dp-description">
                #{heatmapDetail.storeNumber} — {heatmapDetail.storeName} · Last audit {heatmapDetail.detail.lastAudit} · Auditor: {heatmapDetail.detail.auditor}
              </p>

              {/* Trend pill */}
              <div className="dp-impact-summary">
                {heatmapDetail.detail.trend === 'improving' && <TrendingUpOutlined sx={{ fontSize: 14 }}/>}
                {heatmapDetail.detail.trend === 'declining' && <TrendingDownOutlined sx={{ fontSize: 14 }}/>}
                {heatmapDetail.detail.trend === 'stable' && <Remove sx={{ fontSize: 14 }}/>}
                <span>Trend: {heatmapDetail.detail.trend.charAt(0).toUpperCase() + heatmapDetail.detail.trend.slice(1)}</span>
              </div>

              {/* Performance Comparison — Store vs District Avg vs Top */}
              {(() => {
                const cat = heatmapDetail.category;
                const storeScores = Object.values(activeAuditData)
                  .map(s => (cat === 'Avg'
                    ? Math.round(Object.values(s).reduce((a, b) => a + b, 0) / Object.values(s).length)
                    : (s as Record<string, number>)[cat] || 0))
                  .filter(v => v > 0);
                const districtAvg = storeScores.length
                  ? Math.round(storeScores.reduce((a, b) => a + b, 0) / storeScores.length)
                  : heatmapDetail.score;
                const topScore = storeScores.length ? Math.max(...storeScores) : heatmapDetail.score;
                const vsAvg = heatmapDetail.score - districtAvg;
                return (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <BarChartOutlined sx={{ fontSize: 14 }}/>
                      Performance Comparison
                    </h3>
                    <div className="kpi-period-metrics">
                      <div className="kpi-period-metric">
                        <span className="kpi-period-label">This Store</span>
                        <span className="kpi-period-val">{heatmapDetail.score}%</span>
                        <span className="kpi-period-sub">current score</span>
                      </div>
                      <div className="kpi-period-metric">
                        <span className="kpi-period-label">District Avg</span>
                        <span className="kpi-period-val">{districtAvg}%</span>
                        <span className={`kpi-period-sub delta-${vsAvg > 0 ? 'up' : vsAvg < 0 ? 'down' : 'flat'}`}>
                          {vsAvg > 0 ? '+' : ''}{vsAvg} pts vs district
                        </span>
                      </div>
                      <div className="kpi-period-metric">
                        <span className="kpi-period-label">Top Performer</span>
                        <span className="kpi-period-val">{topScore}%</span>
                        <span className="kpi-period-sub">{topScore - heatmapDetail.score} pts to close gap</span>
                      </div>
                      <div className="kpi-period-metric">
                        <span className="kpi-period-label">Target</span>
                        <span className="kpi-period-val">95%</span>
                        <span className={`kpi-period-sub delta-${heatmapDetail.score >= 95 ? 'up' : 'down'}`}>
                          {heatmapDetail.score >= 95 ? 'on target' : `${95 - heatmapDetail.score} pts below`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Score History — 12-week sparkline */}
              {(() => {
                const seed = parseInt(heatmapDetail.storeNumber.slice(-3), 10) || 1;
                const trend = heatmapDetail.detail.trend;
                const base = heatmapDetail.score;
                // Synthesize 12 weeks ending at current score, biased by trend direction
                const history: number[] = [];
                for (let i = 0; i < 12; i++) {
                  const t = i / 11;
                  const trendOffset = trend === 'improving' ? -8 * (1 - t) : trend === 'declining' ? 8 * (1 - t) : 0;
                  const jitter = ((seed * (i + 1)) % 7) - 3;
                  history.push(Math.max(40, Math.min(100, Math.round(base + trendOffset + jitter))));
                }
                history[history.length - 1] = base;
                const min = Math.min(...history);
                const max = Math.max(...history);
                const range = max - min || 1;
                const W = 400, H = 100, P = 6;
                const points = history.map((v, i) => ({
                  x: (i / (history.length - 1)) * W,
                  y: H - P - ((v - min) / range) * (H - P * 2),
                }));
                const linePath = points.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
                const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;
                const last = points[points.length - 1];
                const accent = base >= 90 ? 'var(--ia-color-success)' : base >= 75 ? 'var(--ia-color-warning-text)' : 'var(--ia-color-error-strong)';
                return (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <ShowChartOutlined sx={{ fontSize: 14 }}/>
                      Score History (12 weeks)
                    </h3>
                    <div className="kpi-panel-chart">
                      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
                        <defs>
                          <linearGradient id={`hm-grad-${heatmapDetail.storeNumber}-${heatmapDetail.category}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
                            <stop offset="100%" stopColor={accent} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#hm-grad-${heatmapDetail.storeNumber}-${heatmapDetail.category})`} />
                        <path d={linePath} fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx={last.x} cy={last.y} r="3" fill={accent} stroke="#ffffff" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="kpi-panel-details" style={{ marginTop: 8 }}>
                      <div className="kpi-panel-detail-row status-neutral">
                        <span className="kpi-panel-detail-label">12-Week Range</span>
                        <span className="kpi-panel-detail-value">{min}% – {max}%</span>
                      </div>
                      <div className="kpi-panel-detail-row status-neutral">
                        <span className="kpi-panel-detail-label">12-Week Avg</span>
                        <span className="kpi-panel-detail-value">{Math.round(history.reduce((a, b) => a + b, 0) / history.length)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Prior Audits */}
              {(() => {
                const dates = ['1 week ago', '2 weeks ago', '4 weeks ago', '8 weeks ago'];
                const seed = parseInt(heatmapDetail.storeNumber.slice(-3), 10) || 1;
                const baseScore = heatmapDetail.score;
                const priors = dates.map((d, i) => {
                  const drift = heatmapDetail.detail.trend === 'improving' ? -(i + 1) * 2
                    : heatmapDetail.detail.trend === 'declining' ? (i + 1) * 2 : 0;
                  const jitter = ((seed * (i + 3)) % 5) - 2;
                  return {
                    date: d,
                    score: Math.max(40, Math.min(100, baseScore + drift + jitter)),
                    auditor: auditors[(seed + i) % auditors.length],
                  };
                });
                return (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <AccessTimeOutlined sx={{ fontSize: 14 }}/>
                      Prior Audits
                    </h3>
                    <div className="kpi-panel-details">
                      {priors.map((p, i) => (
                        <div key={i} className={`kpi-panel-detail-row status-${p.score >= 90 ? 'positive' : p.score >= 75 ? 'warning' : 'negative'}`}>
                          <span className="kpi-panel-detail-label">{p.date} · {p.auditor}</span>
                          <span className="kpi-panel-detail-value" style={{ color: p.score >= 90 ? '#047857' : p.score >= 75 ? '#b45309' : '#b91c1c' }}>
                            {p.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Findings */}
              <div className="dp-section">
                <h3 className="dp-section-title">
                  <ErrorOutlined sx={{ fontSize: 14 }}/>
                  Findings ({heatmapDetail.detail.findings.length})
                </h3>
                <div className="dp-stores-list">
                  {heatmapDetail.detail.findings.map((finding, idx) => (
                    <div key={idx} className="dp-store-card warning">
                      <div className="dp-store-header">
                        <span className="dp-store-name">Finding {idx + 1}</span>
                      </div>
                      <p className="dp-store-detail">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="dp-section">
                <h3 className="dp-section-title">
                  <AutoAwesomeOutlined sx={{ fontSize: 14 }}/>
                  AI Recommendation
                </h3>
                <div className="kpi-ai-insight">
                  <AutoAwesomeOutlined sx={{ fontSize: 14 }} className="kpi-ai-insight-icon"/>
                  <p>{heatmapDetail.detail.recommendation}</p>
                </div>
              </div>

              {/* Action Plan — derived from findings */}
              {heatmapDetail.detail.findings.length > 0 && (
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <TaskAltOutlined sx={{ fontSize: 14 }}/>
                    Action Plan
                  </h3>
                  <div className="hm-action-plan">
                    {heatmapDetail.detail.findings.map((finding, idx) => {
                      const owners = ['Store Manager', 'Dept Lead', 'Asst Manager', 'Floor Lead'];
                      const dueDays = [1, 2, 3, 5];
                      const owner = owners[idx % owners.length];
                      const due = dueDays[idx % dueDays.length];
                      return (
                        <div key={idx} className="hm-action-item">
                          <div className="hm-action-checkbox" />
                          <div className="hm-action-content">
                            <span className="hm-action-title">{finding}</span>
                            <div className="hm-action-meta">
                              <span className="hm-action-owner"><GroupOutlined sx={{ fontSize: 11 }}/> {owner}</span>
                              <span className={`hm-action-due ${due <= 2 ? 'urgent' : ''}`}>
                                <AccessTimeOutlined sx={{ fontSize: 11 }}/> Due in {due} day{due > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ask Alan skill mapping */}
              <div className="dp-section">
                <h3 className="dp-section-title">
                  <ShowChartOutlined sx={{ fontSize: 14 }}/>
                  Ask Alan skill
                </h3>
                <div className="kpi-panel-detail-row status-neutral">
                  <span className="kpi-panel-detail-label">
                    {heatmapDetail.skill === 'pog' ? 'POG' : heatmapDetail.skill === 'knowledge' ? 'Knowledge' : heatmapDetail.skill === 'actions' ? 'Action' : 'Analytics'}
                  </span>
                  <span
                    className="kpi-panel-detail-value"
                    style={{ fontWeight: 'var(--ia-font-weight-medium)', fontSize: 'var(--ia-text-2xs)', color: 'var(--ia-color-text-secondary)' }}
                  >
                    {heatmapDetail.skillLogic}
                  </span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="dp-actions">
                <button className="dp-action-btn outlined" onClick={() => {
                  const hd = heatmapDetail;
                  setHeatmapDetail(null);
                  openAskAlan({
                    heatmapAudit: {
                      skill: hd.skill as import('../types').AskAlanSkillMode,
                      context: `audit-${hd.category.toLowerCase().replace(/ /g, '-')}`,
                      storeNumber: String(hd.storeNumber),
                      storeName: hd.storeName,
                      score: hd.score,
                    },
                  });
                }}>
                  <AutoAwesomeOutlined sx={{ fontSize: 14 }}/>
                  <span>Ask Alan</span>
                </button>
                <button className="dp-action-btn outlined navigate" onClick={() => {
                  const d = heatmapDetail;
                  setHeatmapDetail(null);
                  navigate(`/store-operations/store-deep-dive?store=${d.storeNumber}&name=${encodeURIComponent(d.storeName)}`);
                }}>
                  <span>View Store Deep Dive</span>
                  <OpenInNewOutlined sx={{ fontSize: 14 }}/>
                </button>
              </div>

              {/* Timestamp */}
              <div className="dp-timestamp">
                <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                <span>Last audit: {heatmapDetail.detail.lastAudit}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      {/* ═══ Create Broadcast Wizard (UAM-style multi-step) ═══ */}
      {showBroadcastWizard && (() => {
        const totalStores = activeStores.length;
        const recipientCount =
          bwAudience === 'all-stores' ? totalStores :
          bwAudience === 'specific-stores' ? bwSelectedStores.length :
          bwSelectedManagers.length;
        const canAdvanceStep1 =
          bwAudience === 'all-stores' ||
          (bwAudience === 'specific-stores' && bwSelectedStores.length > 0) ||
          (bwAudience === 'managers' && bwSelectedManagers.length > 0);
        const canSend = bwSubject.trim().length > 0 && bwMessage.trim().length > 0 && recipientCount > 0;
        const audienceLabel =
          bwAudience === 'all-stores' ? `All Stores in District (${totalStores})` :
          bwAudience === 'specific-stores' ? `${bwSelectedStores.length} Specific Store${bwSelectedStores.length === 1 ? '' : 's'}` :
          `${bwSelectedManagers.length} District Manager${bwSelectedManagers.length === 1 ? '' : 's'}`;

        return (
          <div className="bw-overlay" onClick={() => !bwSending && setShowBroadcastWizard(false)}>
            <div className="bw-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bw-header">
                <div className="bw-header-icon">
                  <CampaignOutlined sx={{ fontSize: 18 }}/>
                </div>
                <div className="bw-header-text">
                  <h2>Create Broadcast</h2>
                  <p>Send a broadcast to selected stores or managers in your district</p>
                </div>
                <button className="bw-close" onClick={() => !bwSending && setShowBroadcastWizard(false)} aria-label="Close">
                  <CloseOutlined sx={{ fontSize: 16 }}/>
                </button>
              </div>

              {/* Stepper */}
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
                {/* ── Step 1: Audience ── */}
                {bwStep === 1 && (
                  <div className="bw-step-content">
                    <div className="bw-field-label">Who should receive this broadcast?</div>
                    <div className="bw-audience-options">
                      <div className={`bw-audience-card ${bwAudience === 'all-stores' ? 'selected' : ''}`} onClick={() => setBwAudience('all-stores')}>
                        <div className="bw-audience-radio">{bwAudience === 'all-stores' && <div className="bw-audience-dot" />}</div>
                        <div className="bw-audience-body">
                          <div className="bw-audience-title"><StoreOutlined sx={{ fontSize: 14 }}/> All Stores in District</div>
                          <div className="bw-audience-desc">Send to every store ({totalStores}) and their managers</div>
                        </div>
                      </div>
                      <div className={`bw-audience-card ${bwAudience === 'specific-stores' ? 'selected' : ''}`} onClick={() => setBwAudience('specific-stores')}>
                        <div className="bw-audience-radio">{bwAudience === 'specific-stores' && <div className="bw-audience-dot" />}</div>
                        <div className="bw-audience-body">
                          <div className="bw-audience-title"><FilterListOutlined sx={{ fontSize: 14 }}/> Specific Stores</div>
                          <div className="bw-audience-desc">Pick one or more stores from your district</div>
                        </div>
                      </div>
                      <div className={`bw-audience-card ${bwAudience === 'managers' ? 'selected' : ''}`} onClick={() => setBwAudience('managers')}>
                        <div className="bw-audience-radio">{bwAudience === 'managers' && <div className="bw-audience-dot" />}</div>
                        <div className="bw-audience-body">
                          <div className="bw-audience-title"><GroupOutlined sx={{ fontSize: 14 }}/> District Managers Only</div>
                          <div className="bw-audience-desc">Send to selected store/area managers</div>
                        </div>
                      </div>
                    </div>

                    {bwAudience === 'specific-stores' && (
                      <div className="bw-selector">
                        <div className="bw-selector-header">
                          <span className="bw-selector-title">Select stores ({bwSelectedStores.length}/{totalStores})</span>
                          <button className="bw-selector-toggle" onClick={() =>
                            setBwSelectedStores(bwSelectedStores.length === totalStores ? [] : activeStores.map(s => s.storeNumber))
                          }>{bwSelectedStores.length === totalStores ? 'Clear All' : 'Select All'}</button>
                        </div>
                        <div className="bw-selector-list">
                          {activeStores.map(s => {
                            const selected = bwSelectedStores.includes(s.storeNumber);
                            return (
                              <div key={s.storeNumber} className={`bw-selector-item ${selected ? 'selected' : ''}`} onClick={() =>
                                setBwSelectedStores(prev => selected ? prev.filter(id => id !== s.storeNumber) : [...prev, s.storeNumber])
                              }>
                                <div className={`bw-checkbox ${selected ? 'checked' : ''}`}>{selected && <Check sx={{ fontSize: 11 }}/>}</div>
                                <div className="bw-selector-item-body">
                                  <span className="bw-selector-item-title">{s.storeName} #{s.storeNumber}</span>
                                  <span className="bw-selector-item-sub">{s.dpiTier} · SPI {s.dpi} · {s.status}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {bwAudience === 'managers' && (
                      <div className="bw-selector">
                        <div className="bw-selector-header">
                          <span className="bw-selector-title">Select managers ({bwSelectedManagers.length}/{teamMembers.length})</span>
                          <button className="bw-selector-toggle" onClick={() =>
                            setBwSelectedManagers(bwSelectedManagers.length === teamMembers.length ? [] : teamMembers.map(m => m.id))
                          }>{bwSelectedManagers.length === teamMembers.length ? 'Clear All' : 'Select All'}</button>
                        </div>
                        <div className="bw-selector-list">
                          {teamMembers.map(m => {
                            const selected = bwSelectedManagers.includes(m.id);
                            return (
                              <div key={m.id} className={`bw-selector-item ${selected ? 'selected' : ''}`} onClick={() =>
                                setBwSelectedManagers(prev => selected ? prev.filter(id => id !== m.id) : [...prev, m.id])
                              }>
                                <div className={`bw-checkbox ${selected ? 'checked' : ''}`}>{selected && <Check sx={{ fontSize: 11 }}/>}</div>
                                <div className="bw-selector-item-body">
                                  <span className="bw-selector-item-title">{m.name}</span>
                                  <span className="bw-selector-item-sub">{m.role}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Step 2: Message ── */}
                {bwStep === 2 && (
                  <div className="bw-step-content">
                    <div className="bw-grid-2">
                      <div className="bw-field">
                        <label className="bw-field-label">Category</label>
                        <div className="bw-chip-group">
                          {(['Operations', 'Safety', 'Compliance', 'Announcement'] as const).map(c => (
                            <button key={c} className={`bw-chip ${bwCategory === c ? 'active' : ''}`} onClick={() => setBwCategory(c)}>{c}</button>
                          ))}
                        </div>
                      </div>
                      <div className="bw-field">
                        <label className="bw-field-label">Priority</label>
                        <div className="bw-chip-group">
                          {(['Normal', 'Important', 'Urgent'] as const).map(p => (
                            <button key={p} className={`bw-chip bw-chip--${p.toLowerCase()} ${bwPriority === p ? 'active' : ''}`} onClick={() => setBwPriority(p)}>{p}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bw-field">
                      <label className="bw-field-label">Subject <span className="bw-required">*</span></label>
                      <input className="bw-input" type="text" placeholder="e.g., Inventory safety-stock reorder — action required" value={bwSubject} onChange={(e) => setBwSubject(e.target.value)} maxLength={120} />
                      <div className="bw-field-hint">{bwSubject.length}/120</div>
                    </div>
                    <div className="bw-field">
                      <label className="bw-field-label">Message <span className="bw-required">*</span></label>
                      <textarea className="bw-textarea" rows={6} placeholder="Type your broadcast message..." value={bwMessage} onChange={(e) => setBwMessage(e.target.value)} maxLength={1000} />
                      <div className="bw-field-hint">{bwMessage.length}/1000</div>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Review ── */}
                {bwStep === 3 && (
                  <div className="bw-step-content">
                    <div className="bw-review">
                      <div className="bw-review-row">
                        <span className="bw-review-label">Audience</span>
                        <span className="bw-review-value">{audienceLabel}</span>
                      </div>
                      <div className="bw-review-row">
                        <span className="bw-review-label">Recipients</span>
                        <span className="bw-review-value"><strong>{recipientCount}</strong> {bwAudience === 'managers' ? 'manager(s)' : 'store(s)'}</span>
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
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bw-footer">
                <div className="bw-footer-meta">
                  {recipientCount > 0 && <><GroupOutlined sx={{ fontSize: 13 }}/> Will reach <strong>{recipientCount}</strong> recipient{recipientCount === 1 ? '' : 's'}</>}
                </div>
                <div className="bw-footer-actions">
                  {bwStep > 1 && (
                    <Button variant="outlined" color="primary" className="bw-btn bw-btn--ghost" onClick={() => setBwStep((bwStep - 1) as 1 | 2 | 3)} disabled={bwSending}>
                      Back
                    </Button>
                  )}
                  {bwStep < 3 && (
                    <Button
                      variant="contained"
                      color="primary"
                      className="bw-btn bw-btn--primary"
                      onClick={() => setBwStep((bwStep + 1) as 1 | 2 | 3)}
                      disabled={bwStep === 1 ? !canAdvanceStep1 : !(bwSubject.trim() && bwMessage.trim())}
                      endIcon={<KeyboardArrowRight sx={{ fontSize: 14 }}/>}
                    >
                      Continue
                    </Button>
                  )}
                  {bwStep === 3 && (
                    <Button
                      variant="contained"
                      color="primary"
                      className="bw-btn bw-btn--primary"
                      disabled={!canSend || bwSending}
                      onClick={() => {
                        setBwSending(true);
                        setTimeout(() => {
                          setShowBroadcastWizard(false);
                          setBwSending(false);
                          showToast(`✓ Broadcast sent to ${recipientCount} ${bwAudience === 'managers' ? 'manager(s)' : 'store(s)'}`);
                        }, 1000);
                      }}
                      startIcon={bwSending ? <div className="bw-spinner" /> : <SendOutlined sx={{ fontSize: 14 }}/>}
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

      {/* VoC Investigation Panel */}
      {showVocPanel && (
        <div className="investigation-panel-overlay" onClick={() => setShowVocPanel(false)}>
          <div className="investigation-panel" onClick={(e) => e.stopPropagation()}>
            <div className="investigation-panel-header">
              <div className="panel-header-title">
                <ErrorOutlined sx={{ fontSize: 20 }}/>
                <h3>VoC Crisis Investigation</h3>
              </div>
              <button className="panel-close-btn" onClick={() => setShowVocPanel(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            
            <div className="investigation-panel-content">
              <div className="investigation-summary">
                <div className="summary-badge high">HIGH PRIORITY</div>
                <h4>Staff Availability Complaints +40%</h4>
                <p>Cluster B stores showing significant increase in customer complaints related to staff availability and service wait times.</p>
              </div>
              
              <div className="investigation-stores">
                <div className="section-label">Affected Stores (4)</div>
                <div className="store-list">
                  <div className="store-item">
                    <span className="store-name">Johnson City Mall</span>
                    <span className="store-metric negative">+52% complaints</span>
                  </div>
                  <div className="store-item">
                    <span className="store-name">Clarksville Crossing</span>
                    <span className="store-metric negative">+45% complaints</span>
                  </div>
                  <div className="store-item">
                    <span className="store-name">Franklin Town Center</span>
                    <span className="store-metric negative">+38% complaints</span>
                  </div>
                  <div className="store-item">
                    <span className="store-name">Murfreesboro Plaza</span>
                    <span className="store-metric negative">+31% complaints</span>
                  </div>
                </div>
              </div>
              
              <div className="investigation-actions">
                <button className="action-btn primary" onClick={() => {
                  setShowVocPanel(false);
                  showToast('Scheduling review meeting with store managers...');
                }}>
                  Schedule Review
                  <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                </button>
                <button className="action-btn secondary" onClick={() => {
                  setShowVocPanel(false);
                  openBroadcastWizard();
                }}>
                  Send Broadcast
                  <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEA Audit Panel */}
      {showSeaPanel && (
        <div className="investigation-panel-overlay" onClick={() => setShowSeaPanel(false)}>
          <div className="investigation-panel" onClick={(e) => e.stopPropagation()}>
            <div className="investigation-panel-header">
              <div className="panel-header-title">
                <ErrorOutlined sx={{ fontSize: 20 }}/>
                <h3>SEA Compliance Audit</h3>
              </div>
              <button className="panel-close-btn" onClick={() => setShowSeaPanel(false)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            
            <div className="investigation-panel-content">
              <div className="investigation-summary">
                <div className="summary-badge high">HIGH PRIORITY</div>
                <h4>Planogram Audit Failures</h4>
                <p>Recurring planogram compliance failures detected in 3 stores. Merchandising effectiveness is compromised.</p>
              </div>
              
              <div className="investigation-stores">
                <div className="section-label">Failing Stores (3)</div>
                <div className="store-list">
                  <div className="store-item">
                    <span className="store-name">Johnson City Mall</span>
                    <span className="store-metric negative">3 failures</span>
                  </div>
                  <div className="store-item">
                    <span className="store-name">Clarksville Crossing</span>
                    <span className="store-metric negative">2 failures</span>
                  </div>
                  <div className="store-item">
                    <span className="store-name">Franklin Town Center</span>
                    <span className="store-metric negative">2 failures</span>
                  </div>
                </div>
              </div>
              
              <div className="investigation-actions">
                <button className="action-btn primary" onClick={() => {
                  setShowSeaPanel(false);
                  showToast('Opening full SEA audit report...');
                }}>
                  View Full Audit
                  <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                </button>
                <button className="action-btn secondary" onClick={() => {
                  setShowSeaPanel(false);
                  showToast('Assigning corrective actions to store managers...');
                }}>
                  Assign Actions
                  <KeyboardArrowRight sx={{ fontSize: 14 }}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Triage Detail Modal */}
      {showTriageDetail && (
        <div className="investigation-panel-overlay" onClick={() => setShowTriageDetail(null)}>
          <div className="investigation-panel triage-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="investigation-panel-header">
              <div className="panel-header-title">
                <WarningAmberOutlined sx={{ fontSize: 20 }}/>
                <h3>{activeTriageItems.find(t => t.id === showTriageDetail)?.title || 'Triage Detail'}</h3>
              </div>
              <button className="panel-close-btn" onClick={() => setShowTriageDetail(null)}>
                <CloseOutlined sx={{ fontSize: 20 }}/>
              </button>
            </div>
            
            <div className="investigation-panel-content">
              {showTriageDetail === 'voc-messy' && (
                <>
                  <div className="investigation-summary">
                    <div className="summary-badge high">HIGH PRIORITY</div>
                    <h4>Customer Feedback Spike Detected</h4>
                    <p>+22% increase in "messy aisles" complaints across 3 stores this week. Pattern suggests staffing or process issue during peak hours.</p>
                  </div>
                  
                  <div className="investigation-stores">
                    <div className="section-label">Affected Stores (3)</div>
                    <div className="store-list">
                      <div className="store-item">
                        <span className="store-name">Johnson City Mall</span>
                        <span className="store-metric negative">+45% complaints</span>
                      </div>
                      <div className="store-item">
                        <span className="store-name">Clarksville Crossing</span>
                        <span className="store-metric negative">+38% complaints</span>
                      </div>
                      <div className="store-item">
                        <span className="store-name">Franklin Town Center</span>
                        <span className="store-metric negative">+31% complaints</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="investigation-actions">
                    <button className="action-btn primary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Assigning task to store managers...');
                    }}>
                      <StoreOutlined sx={{ fontSize: 14 }}/>
                      Assign to Store
                    </button>
                    <button className="action-btn secondary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Escalating to Regional Manager...');
                    }}>
                      <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                      Escalate
                    </button>
                    <button className="action-btn tertiary" onClick={() => {
                      setShowTriageDetail(null);
                      openBroadcastWizard();
                    }}>
                      <CampaignOutlined sx={{ fontSize: 14 }}/>
                      Send Broadcast
                    </button>
                  </div>
                </>
              )}
              
              {showTriageDetail === 'sea-fire' && (
                <>
                  <div className="investigation-summary">
                    <div className="summary-badge critical">CRITICAL</div>
                    <h4>Fire Exit Blocked - Safety Violation</h4>
                    <p>Display fixture blocking emergency exit at Johnson City Mall. Immediate action required. Auto-escalated to District Manager.</p>
                  </div>
                  
                  <div className="investigation-stores">
                    <div className="section-label">Violation Details</div>
                    <div className="store-list">
                      <div className="store-item">
                        <span className="store-name">Johnson City Mall</span>
                        <span className="store-metric negative">Fire Exit B - Blocked</span>
                      </div>
                    </div>
                    <div className="violation-timeline">
                      <div className="timeline-item">
                        <span className="timeline-time">2h ago</span>
                        <span className="timeline-event">Violation detected by SEA audit</span>
                      </div>
                      <div className="timeline-item">
                        <span className="timeline-time">1h ago</span>
                        <span className="timeline-event">Auto-escalated to DM</span>
                      </div>
                      <div className="timeline-item pending">
                        <span className="timeline-time">Pending</span>
                        <span className="timeline-event">Store manager acknowledgment</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="investigation-actions">
                    <button className="action-btn primary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Calling store manager...');
                    }}>
                      <ChatOutlined sx={{ fontSize: 14 }}/>
                      Contact Store
                    </button>
                    <button className="action-btn secondary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Escalating to Regional Safety Officer...');
                    }}>
                      <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                      Escalate Further
                    </button>
                    <button className="action-btn tertiary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Opening full audit report...');
                    }}>
                      <OpenInNewOutlined sx={{ fontSize: 14 }}/>
                      View Full Audit
                    </button>
                  </div>
                </>
              )}
              
              {showTriageDetail === 'oos-risk' && (
                <>
                  <div className="investigation-summary">
                    <div className="summary-badge medium">MEDIUM PRIORITY</div>
                    <h4>Inbound Shipment Delay</h4>
                    <p>3 SKUs delayed 48 hours affecting Clarksville Crossing. Adaptation plan pending approval. Estimated revenue impact: $2,400.</p>
                  </div>
                  
                  <div className="investigation-stores">
                    <div className="section-label">Affected SKUs (3)</div>
                    <div className="store-list">
                      <div className="store-item">
                        <span className="store-name">SKU-4521 - Summer Dress</span>
                        <span className="store-metric negative">48h delay</span>
                      </div>
                      <div className="store-item">
                        <span className="store-name">SKU-4522 - Linen Pants</span>
                        <span className="store-metric negative">48h delay</span>
                      </div>
                      <div className="store-item">
                        <span className="store-name">SKU-4523 - Cotton Blouse</span>
                        <span className="store-metric negative">48h delay</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="investigation-actions">
                    <button className="action-btn primary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Approving adaptation plan...');
                    }}>
                      <Check sx={{ fontSize: 14 }}/>
                      Approve Adaptation
                    </button>
                    <button className="action-btn secondary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Assigning to store for local sourcing...');
                    }}>
                      <StoreOutlined sx={{ fontSize: 14 }}/>
                      Assign to Store
                    </button>
                    <button className="action-btn tertiary" onClick={() => {
                      setShowTriageDetail(null);
                      showToast('Opening supply chain details...');
                    }}>
                      <InventoryOutlined sx={{ fontSize: 14 }}/>
                      View Supply Chain
                    </button>
                  </div>
                </>
              )}

              {/* Generic fallback for non-d14 triage items */}
              {showTriageDetail && !['voc-messy', 'sea-fire', 'oos-risk'].includes(showTriageDetail) && (() => {
                const triageItem = activeTriageItems.find(t => t.id === showTriageDetail);
                if (!triageItem) return null;
                const priorityLabel = triageItem.priority === 'critical' ? 'CRITICAL' : triageItem.priority === 'high' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY';
                return (
                  <>
                    <div className="investigation-summary">
                      <div className={`summary-badge ${triageItem.priority}`}>{priorityLabel}</div>
                      <h4>{triageItem.title}</h4>
                      <p>{triageItem.stores}. Current status: {triageItem.metric}. Requires immediate DM review and action.</p>
                    </div>
                    
                    <div className="investigation-stores">
                      <div className="section-label">Affected Locations</div>
                      <div className="store-list">
                        {triageItem.stores.split(' · ').map((s, i) => (
                          <div key={i} className="store-item">
                            <span className="store-name">{s.split(' — ')[0]}</span>
                            <span className="store-metric negative">{triageItem.metric}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="investigation-actions">
                      <button className="action-btn primary" onClick={() => {
                        setShowTriageDetail(null);
                        showToast('Assigning task to store managers...');
                      }}>
                        <StoreOutlined sx={{ fontSize: 14 }}/>
                        Assign to Store
                      </button>
                      <button className="action-btn secondary" onClick={() => {
                        setShowTriageDetail(null);
                        showToast('Escalating to Regional Manager...');
                      }}>
                        <WarningAmberOutlined sx={{ fontSize: 14 }}/>
                        Escalate
                      </button>
                      <button className="action-btn tertiary" onClick={() => {
                        setShowTriageDetail(null);
                        openBroadcastWizard();
                      }}>
                        <CampaignOutlined sx={{ fontSize: 14 }}/>
                        Send Broadcast
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* KPI — Right-Side Detail Panel */}
      {activeKPIPanel && (() => {
        const td = activeKPIPanel.trendData || [];
        const isPctOrPts = /%|pts|bps|\//i.test(activeKPIPanel.delta || '') || /%/.test(activeKPIPanel.primaryValue);
        // Compute period comparison from trendData
        const computePeriodDelta = (): { value: string; direction: 'up' | 'down' | 'flat' } => {
          if (td.length < 2) return { value: '—', direction: 'flat' };
          let curr: number, prev: number;
          if (calendarMode === 'week') {
            curr = td[td.length - 1];
            prev = td[td.length - 2];
          } else if (calendarMode === 'month') {
            const last4 = td.slice(-4);
            const prior4 = td.slice(-8, -4);
            curr = last4.reduce((a, b) => a + b, 0) / last4.length;
            prev = prior4.length ? prior4.reduce((a, b) => a + b, 0) / prior4.length : curr;
          } else {
            const last6 = td.slice(-6);
            const prior6 = td.slice(0, 6);
            curr = last6.reduce((a, b) => a + b, 0) / last6.length;
            prev = prior6.reduce((a, b) => a + b, 0) / prior6.length;
          }
          const diff = curr - prev;
          const pct = prev !== 0 ? (diff / prev) * 100 : 0;
          const direction: 'up' | 'down' | 'flat' = Math.abs(diff) < 0.01 ? 'flat' : diff > 0 ? 'up' : 'down';
          if (isPctOrPts) {
            return { value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} pts`, direction };
          }
          return { value: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, direction };
        };
        const periodDelta = computePeriodDelta();
        const accent = activeKPIPanel.status === 'positive' ? '#047857' : activeKPIPanel.status === 'negative' ? '#991b1b' : activeKPIPanel.status === 'warning' ? '#b45309' : 'var(--ia-color-primary-pressed)';
        return (
          <>
            <div className="detail-panel-overlay" onClick={() => setActiveKPIPanel(null)} />
            <div className="detail-panel">
              <div className="detail-panel-header">
                <button className="detail-panel-close" onClick={() => setActiveKPIPanel(null)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
              <div className="detail-panel-body">
                {/* Severity / Category Row */}
                <div className="dp-severity-row">
                  <span className={`dp-severity-badge ${activeKPIPanel.status === 'negative' ? 'critical' : activeKPIPanel.status === 'warning' ? 'warning' : activeKPIPanel.status === 'positive' ? 'risk' : 'risk'}`}>
                    {activeKPIPanel.category.toUpperCase()}
                  </span>
                  <span className="dp-source">
                    <BarChartOutlined sx={{ fontSize: 11 }}/>
                    52-Week Trend
                  </span>
                </div>

                {/* Title */}
                <h2 className="dp-title">{activeKPIPanel.label}</h2>
                <p className="dp-description">
                  Current: <strong>{activeKPIPanel.primaryValue}</strong>{activeKPIPanel.primaryUnit ? ` ${activeKPIPanel.primaryUnit}` : ''}
                  {activeKPIPanel.microInsight && <> · {activeKPIPanel.microInsight}</>}
                </p>

                {/* Period Comparison Metrics */}
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <ShowChartOutlined sx={{ fontSize: 14 }}/>
                    Period Comparison
                  </h3>
                  <div className="kpi-period-metrics">
                    <div className="kpi-period-metric">
                      <span className="kpi-period-label">{periodLabel}</span>
                      <span className={`kpi-period-val delta-${periodDelta.direction}`}>
                        {periodDelta.direction === 'up' && <NorthEast sx={{ fontSize: 14 }}/>}
                        {periodDelta.direction === 'down' && <SouthEast sx={{ fontSize: 14 }}/>}
                        {periodDelta.value}
                      </span>
                      <span className="kpi-period-sub">vs prior {calendarMode}</span>
                    </div>
                    <div className="kpi-period-metric">
                      <span className="kpi-period-label">YoY</span>
                      <span className={`kpi-period-val delta-${activeKPIPanel.deltaDirection || 'flat'}`}>
                        {activeKPIPanel.deltaDirection === 'up' && <NorthEast sx={{ fontSize: 14 }}/>}
                        {activeKPIPanel.deltaDirection === 'down' && <SouthEast sx={{ fontSize: 14 }}/>}
                        {activeKPIPanel.delta}
                      </span>
                      <span className="kpi-period-sub">{activeKPIPanel.deltaContext || 'Year over Year'}</span>
                    </div>
                  </div>
                </div>

                {/* Trend Graph */}
                {td.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <BarChartOutlined sx={{ fontSize: 14 }}/>
                      Trend
                    </h3>
                    <div className="kpi-panel-chart">
                      <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="kpi-panel-svg">
                        <defs>
                          <linearGradient id={`kpi-grad-${activeKPIPanel.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
                            <stop offset="100%" stopColor={accent} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const min = Math.min(...td);
                          const max = Math.max(...td);
                          const range = max - min || 1;
                          const W = 400, H = 140, P = 8;
                          const points = td.map((v, i) => ({
                            x: (i / (td.length - 1)) * W,
                            y: H - P - ((v - min) / range) * (H - P * 2),
                          }));
                          const linePath = points.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
                          const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;
                          const last = points[points.length - 1];
                          return (
                            <>
                              <path d={areaPath} fill={`url(#kpi-grad-${activeKPIPanel.id})`} />
                              <path d={linePath} fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx={last.x} cy={last.y} r="3" fill={accent} stroke="#ffffff" strokeWidth="1.5" />
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                )}

                {/* AI Insight */}
                {activeKPIPanel.trendInsight && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <AutoAwesomeOutlined sx={{ fontSize: 14 }}/>
                      AI Insight
                    </h3>
                    <div className="kpi-ai-insight">
                      <AutoAwesomeOutlined sx={{ fontSize: 14 }} className="kpi-ai-insight-icon"/>
                      <p>{activeKPIPanel.trendInsight}</p>
                    </div>
                  </div>
                )}

                {/* Panel Details */}
                {activeKPIPanel.panelDetails && activeKPIPanel.panelDetails.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <ShowChartOutlined sx={{ fontSize: 14 }}/>
                      Key Details
                    </h3>
                    <div className="kpi-panel-details">
                      {activeKPIPanel.panelDetails.map((detail, i) => (
                        <div key={i} className={`kpi-panel-detail-row status-${detail.status || 'neutral'}`}>
                          <span className="kpi-panel-detail-label">{detail.label}</span>
                          <span className="kpi-panel-detail-value">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="dp-timestamp">
                  <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                  <span>Updated just now · Showing {calendarMode === 'week' ? 'weekly' : calendarMode === 'month' ? 'monthly' : 'quarterly'} comparison</span>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Broadcast Analytics — Right-Side Detail Panel (same pattern as Home Screen alerts) */}
      {bcaSelectedBroadcast && (
        <>
          <div className="detail-panel-overlay" onClick={closeBcaPanel} />
          <div className="detail-panel">
            <div className="detail-panel-header">
              <button className="detail-panel-close" onClick={closeBcaPanel}>
                <CloseOutlined sx={{ fontSize: 18 }}/>
              </button>
            </div>
            <div className="detail-panel-body">
              {/* Severity / Status Row */}
              <div className="dp-severity-row">
                <span className={`dp-severity-badge ${bcaSelectedBroadcast.priority === 'high' ? 'critical' : bcaSelectedBroadcast.priority === 'medium' ? 'warning' : 'risk'}`}>
                  {bcaSelectedBroadcast.priority.toUpperCase()} PRIORITY
                </span>
                <span className="dp-source">
                  <CampaignOutlined sx={{ fontSize: 11 }}/>
                  {bcaSelectedBroadcast.type}
                </span>
              </div>

              {/* Title */}
              <h2 className="dp-title">{bcaSelectedBroadcast.name}</h2>
              <p className="dp-description">
                Sent {bcaSelectedBroadcast.sentAt} · {bcaSelectedBroadcast.acked}/{bcaSelectedBroadcast.stores} stores acknowledged · Avg ack time: {bcaSelectedBroadcast.avgAckTime}
              </p>

              {/* Impact Summary */}
              {bcaSelectedBroadcast.status === 'at-risk' && (
                <div className="dp-impact-summary">
                  <ErrorOutlined sx={{ fontSize: 14 }}/>
                  <span>
                    {bcaSelectedBroadcast.stores - bcaSelectedBroadcast.acked} stores still pending · {bcaSelectedBroadcast.ackRate}% ack rate — needs follow-up to meet compliance target
                  </span>
                </div>
              )}

              {/* Store-Level Compliance Table */}
              <div className="dp-section">
                <h3 className="dp-section-title">
                  <StoreOutlined sx={{ fontSize: 14 }}/>
                  Store-Level Compliance
                </h3>
                <div className="bca-panel-table-wrapper">
                  <table className="bca-panel-table wow-table">
                    <thead>
                      <tr>
                        <th>Store</th>
                        <th>Status</th>
                        <th>Ack Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getBroadcastStoreCompliance(bcaSelectedBroadcast).map(s => (
                        <tr
                          key={s.storeId}
                          className="bca-panel-table-row"
                          onClick={() => { closeBcaPanel(); navigate(`/store-operations/store-deep-dive?store=${s.storeId}`); }}
                        >
                          <td>
                            <div className="bca-panel-store-name">{s.store}</div>
                            <span className="bca-panel-store-id">#{s.storeId}</span>
                          </td>
                          <td>
                            <span className={`bca-panel-ack-badge ${s.acknowledged ? 'acked' : 'pending'}`}>
                              {s.acknowledged ? 'Acknowledged' : 'Pending'}
                            </span>
                          </td>
                          <td className="bca-panel-td-time">{s.acknowledged ? s.avgTime : '—'}</td>
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
                  {activeBroadcasts.insights.map((insight, idx) => (
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
                <button className="dp-action-btn outlined" onClick={() => { closeBcaPanel(); showToast(`Nudge sent to ${bcaSelectedBroadcast.stores - bcaSelectedBroadcast.acked} pending stores`); }}>
                  <SendOutlined sx={{ fontSize: 14 }}/>
                  <span>Send Nudge</span>
                </button>
                <button className="dp-action-btn outlined" disabled={isHQ} onClick={() => { closeBcaPanel(); showToast(`Follow-up assigned for "${bcaSelectedBroadcast.name}"`); }}>
                  <AssignmentTurnedInOutlined sx={{ fontSize: 14 }}/>
                  <span>Assign Follow-up</span>
                </button>
                <button className="dp-action-btn outlined" disabled={isHQ} onClick={() => { closeBcaPanel(); showToast(`Escalated "${bcaSelectedBroadcast.name}" to Regional`); }}>
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

    </div>
  );
};

export default DistrictIntelligence;

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import Remove from '@mui/icons-material/Remove';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import FavoriteOutlined from '@mui/icons-material/FavoriteOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import NorthEast from '@mui/icons-material/NorthEast';
import SouthEast from '@mui/icons-material/SouthEast';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import PlaylistAddCheckOutlined from '@mui/icons-material/PlaylistAddCheckOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import TimerOutlined from '@mui/icons-material/TimerOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import GridOnOutlined from '@mui/icons-material/GridOnOutlined';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import { Button, Badge, Card, Tabs } from 'impact-ui';
import { AIDailyBrief, AIDailyBriefData } from '../components/common/AIDailyBrief';
import { useAuth } from '../context/AuthContext';
import { openAskAlan } from '../utils/openAskAlan';
import './StoreCenter.css';
// Reuses detail-panel/dp-* styles for the SM broadcast detail panel
import './StoreOpsHome.css';
import './DistrictIntelligence.css';

// ── Types ──────────────────────────────────────────────
interface StoreMeta {
  id: string;
  name: string;
  number: string;
  cluster: string;
  format: string;
  dpi: number;
  dpiDelta: number;
  momentum: 'rising' | 'stable' | 'declining';
  rank: number;
  totalStores: number;
  risk: 'low' | 'moderate' | 'high';
  lastRefresh: string;
  tier: string;
}

interface KPITile {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: string;
  deltaDir: 'up' | 'down' | 'flat';
  deltaContext?: string;
  status: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  trendData: number[];
  trendLabels: string[];
  insight: string;
}

interface AuditWeek {
  weekLabel: string;
  date: string;
  overall: number;
  safety: number;
  planogram: number;
  signage: number;
  cleanliness: number;
  availability: number;
  staffing: number;
  stockRotation: number;
  pricing: number;
  backroom: number;
  customerArea: number;
}

interface VoCItem {
  theme: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  volume: number;
  delta: number;
  topComment: string;
  source: string;
}

interface InventoryItem {
  sku: string;
  name: string;
  status: 'in-stock' | 'low' | 'out-of-stock' | 'inbound';
  quantity: number;
  daysOfSupply: number;
  inboundEta?: string;
}

// ── Store-level AI Daily Brief — tier-aware narrative ──────────
const getStoreBrief = (store: StoreMeta): AIDailyBriefData => {
  const isExcellent = store.dpi >= 88;
  const isStable = store.dpi >= 78 && store.dpi < 88;
  const isAtRisk = store.dpi >= 65 && store.dpi < 78;
  if (isExcellent) {
    return {
      greeting: `${store.name} (#${store.number}) is leading the district at SPI ${store.dpi} — benchmark performance with all streams in green.`,
      sections: [
        { title: 'Performance Highlights', icon: 'performance', bullets: [
          `SPI of <strong>${store.dpi}</strong> ranks <strong>#${store.rank} of ${store.totalStores}</strong> — Excellence tier sustained.`,
          'Net sales tracking <strong>+4.2% vs plan</strong> consistently for 6 weeks.',
          'VoC satisfaction at <strong>4.3/5</strong> — top theme \"Friendly Staff\" mentioned in 38% of positive reviews.',
        ]},
        { title: 'Operational Excellence', icon: 'ops', bullets: [
          'Shelf audit compliance <strong>91/100</strong>, planogram adherence at 96% — no critical SEA findings open.',
          'Stock availability <strong>96.8%</strong> with zero OOS-risk SKUs flagged for the week.',
          'Margin held at <strong>42.1%</strong> with markdown discipline preserved through season.',
        ]},
        { title: 'Recommended Actions', icon: 'recommendations', bullets: [
          'Codify your playbook — schedule a knowledge-share with peer-store managers next week.',
          'Begin preparing for seasonal transition: review markdown plan and pre-stage incoming Spring assortment.',
        ]},
      ],
      closing: 'Sustain momentum and protect against complacency. Consider mentoring a peer store currently in At-Risk tier.',
    };
  }
  if (isStable) {
    return {
      greeting: `${store.name} (#${store.number}) is tracking plan at SPI ${store.dpi} — execution steady with minor opportunities to push into Excellence.`,
      sections: [
        { title: 'Performance & Trends', icon: 'performance', bullets: [
          `SPI of <strong>${store.dpi}</strong> places you mid-pack at #${store.rank} of ${store.totalStores} — momentum is ${store.momentum}.`,
          'Net sales at <strong>+1.2% vs plan</strong> — opportunity in Footwear which is trailing district by 3.4 pts.',
          'VoC satisfaction at <strong>4.0/5</strong>, slight dip from 4.2 — \"Checkout Speed\" mentions trending up.',
        ]},
        { title: 'Operational Notes', icon: 'ops', bullets: [
          'Shelf audit compliance <strong>86/100</strong> — Cleanliness category needs attention (-4 pts vs target).',
          '2 OOS-risk SKUs in Basics — replenishment scheduled for tomorrow.',
        ]},
        { title: 'Recommended Actions', icon: 'recommendations', bullets: [
          'Run a Footwear category review with the dept lead to identify the assortment gap vs peer stores.',
          'Increase checkout coverage during peak (12-2pm, 5-7pm) to address the rising VoC theme.',
        ]},
      ],
      closing: 'Small, focused interventions on Footwear and Checkout Speed could lift SPI 2-3 points within 2 weeks.',
    };
  }
  if (isAtRisk) {
    return {
      greeting: `${store.name} (#${store.number}) is in At-Risk territory at SPI ${store.dpi} — trend declining over the last 4 weeks. Targeted intervention required this week.`,
      sections: [
        { title: 'Triage & Critical Issues', icon: 'triage', bullets: [
          '<strong>VoC: Fitting Room Wait</strong> — complaints up <strong>+34%</strong> over 2 weeks, hitting conversion rate.',
          '<strong>OOS Risk</strong>: 8 size-run gaps in Basics, 4 SKUs critical. Replenishment delayed 36h from DC.',
          '<strong>Planogram Drift</strong>: Women\'s Wall Display 78% compliance — featured items missing or misplaced.',
        ]},
        { title: 'Performance & Trends', icon: 'performance', bullets: [
          `SPI declined <strong>${store.dpiDelta} pts</strong> over 4 weeks — trajectory points to Crisis tier within 2 weeks if uncorrected.`,
          'Net sales at <strong>-3.8% vs plan</strong>, conversion rate down 2.1 pts.',
          `Currently ranked <strong>#${store.rank} of ${store.totalStores}</strong> in district peer cluster.`,
        ]},
        { title: 'Recommended Actions', icon: 'recommendations', bullets: [
          'Increase fitting room staffing during 11am–3pm peak — biggest sales recovery lever.',
          'Expedite the 4 critical Basics SKUs from regional DC; clear backroom for inbound.',
          'Reset Women\'s Wall Display tonight — POG team can deploy in 90 minutes.',
        ]},
      ],
      closing: 'This is a recoverable position — focused execution on the three actions above should stabilize SPI within 1 week.',
    };
  }
  // Crisis
  return {
    greeting: `${store.name} (#${store.number}) is in CRISIS at SPI ${store.dpi} — multiple compounding failures across SEA, VoC, OOS and Sales. District Manager intervention today is required.`,
    sections: [
      { title: 'Triage & Critical Issues', icon: 'triage', bullets: [
        '<strong>SEA Auto-Fail</strong>: Fire exit blocked in Zone B — <strong>regulatory exposure</strong>. Must be cleared before close today.',
        '<strong>VoC Crisis</strong>: \"Messy Aisles\" and \"Staff Unavailable\" complaints up <strong>+38%</strong> in 2 weeks. VoC Score dropped 14 pts.',
        '<strong>OOS Surge</strong>: 14 SKUs out-of-stock, 4 shipments delayed. Estimated revenue impact €4,200 this week.',
        '<strong>Sales Miss</strong>: 4 consecutive weeks of comp sales -12%. Apparel leading the decline.',
      ]},
      { title: 'Performance & Trends', icon: 'performance', bullets: [
        `SPI dropped <strong>${store.dpiDelta} pts</strong> in 4 weeks — momentum strongly negative.`,
        'Net sales at <strong>-9.1% vs district avg</strong>; conversion rate at lowest level in 12 months.',
        `Ranked <strong>last (#${store.rank} of ${store.totalStores})</strong> in district peer cluster.`,
      ]},
      { title: 'Recommended Actions', icon: 'recommendations', bullets: [
        'Dispatch DM for on-site intervention today — escalation protocol triggered.',
        'Clear SEA auto-fail before close. Document remediation; submit to Compliance.',
        'Expedite top-10 OOS SKUs from RDC; restore baseline staffing for next 48h.',
        'Deep-clean store overnight; reset planograms in priority categories before tomorrow open.',
      ]},
    ],
    closing: 'This store requires hands-on leadership today. Escalation to Regional VP recommended if conditions persist by end of week.',
  };
};

// ── KPI Data — mirrors DI's 6 categories (Sales / VoC Sat / VoC Issue / Shelf Audit / OOS / Margin) ──
interface StoreKPI {
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

const getStoreKPIs = (store: StoreMeta): StoreKPI[] => {
  const isStrong = store.dpi >= 85;
  const isOk = store.dpi >= 75 && store.dpi < 85;
  // Use same shape and values as DI districtKPIs, lightly adjusted to store tier
  return [
    {
      id: 'sales-performance',
      category: 'commercial',
      label: 'Sales Performance',
      primaryValue: isStrong ? '$1.32M' : isOk ? '$1.18M' : '$0.94M',
      primaryUnit: 'MTD',
      microInsight: isStrong ? '4W avg $1.24M' : isOk ? '4W avg $1.12M' : '4W avg $0.97M',
      delta: isStrong ? '+4.2%' : isOk ? '+1.1%' : '-5.8%',
      deltaDirection: isStrong || isOk ? 'up' : 'down',
      deltaContext: 'YoY',
      status: isStrong ? 'positive' : isOk ? 'neutral' : 'negative',
      clickable: true,
      trendData: isStrong
        ? [980, 1020, 1050, 1010, 1080, 1120, 1060, 1100, 1150, 1180, 1200, 1320]
        : isOk
          ? [960, 970, 1000, 990, 1020, 1030, 1010, 1050, 1080, 1090, 1100, 1180]
          : [1010, 990, 980, 970, 980, 960, 950, 950, 940, 945, 935, 940],
      trendInsight: isStrong
        ? 'Consistent upward trend. Q4 seasonality effect visible. Rolling 4-week avg: $1.24M.'
        : isOk
          ? 'Plan tracking, mild upward bias. Footwear lagging peer-store contribution.'
          : 'Sales softening for 6 weeks. Conversion rate the primary drag; weekend traffic flat.',
      panelTitle: 'Sales $ — 52-Week Trend',
      panelDetails: [
        { label: 'Best Week', value: isStrong ? '$1.40M (Mar 23)' : '$1.18M (Mar 23)', status: 'positive' },
        { label: 'Worst Week', value: isStrong ? '$1.04M (Jun 23)' : '$0.92M (Jun 23)', status: 'negative' },
        { label: 'Rolling 4W Avg', value: isStrong ? '$1.24M' : '$1.05M', status: 'neutral' },
        { label: 'YoY Δ', value: isStrong ? '+4.2%' : isOk ? '+1.1%' : '-5.8%', status: isStrong || isOk ? 'positive' : 'negative' },
      ],
    },
    {
      id: 'voc-satisfaction',
      category: 'customer',
      label: 'VoC Satisfaction',
      primaryValue: isStrong ? '88%' : isOk ? '82%' : '74%',
      microInsight: isStrong ? 'Top theme: Friendly Staff' : isOk ? 'Top theme: Checkout Speed' : 'Top theme: Messy Aisles',
      delta: isStrong ? '+2.1 pts' : isOk ? '-1.4 pts' : '-4.8 pts',
      deltaDirection: isStrong ? 'up' : 'down',
      deltaContext: 'YoY',
      status: isStrong ? 'positive' : isOk ? 'warning' : 'negative',
      clickable: true,
      trendData: isStrong
        ? [82, 83, 84, 85, 84, 86, 86, 87, 86, 87, 88, 88]
        : isOk
          ? [86, 85, 85, 84, 84, 83, 84, 83, 83, 82, 82, 82]
          : [80, 79, 78, 77, 76, 76, 75, 75, 74, 75, 74, 74],
      trendInsight: isStrong
        ? 'Steady positive trend over 12 weeks. "Friendly Staff" mentioned in 38% of positive reviews.'
        : 'Gradual decline. "Messy Aisles" and "Staff Availability" emerging as top negative themes.',
      panelTitle: 'VoC Satisfaction — 52-Week Trend',
      panelDetails: [
        { label: 'Peak', value: isStrong ? '93% (Jul 21)' : '85% (Jul 21)', status: 'positive' },
        { label: 'Low', value: isStrong ? '82% (Jan 5)' : '74% (Jan 5)', status: 'negative' },
        { label: 'Top Theme (↑)', value: isStrong ? 'Friendly Staff' : 'Messy Aisles (+34%)', status: isStrong ? 'positive' : 'negative' },
        { label: 'Top Theme (↓)', value: 'Checkout Speed (improved)', status: 'positive' },
      ],
    },
    {
      id: 'voc-issue-rate',
      category: 'customer',
      label: 'VoC Issue Rate',
      primaryValue: isStrong ? '2.4' : isOk ? '3.6' : '5.1',
      primaryUnit: '/ 100 visits',
      microInsight: isStrong ? 'Below district avg' : isOk ? 'In-line with peer cluster' : 'Top quartile of issues',
      delta: isStrong ? '-0.4' : isOk ? '+0.6' : '+1.4',
      deltaDirection: isStrong ? 'down' : 'up',
      deltaContext: 'YoY',
      status: isStrong ? 'positive' : isOk ? 'warning' : 'negative',
      clickable: true,
      trendData: isStrong
        ? [2.9, 2.8, 2.7, 2.8, 2.6, 2.7, 2.5, 2.6, 2.4, 2.5, 2.4, 2.4]
        : isOk
          ? [2.8, 2.9, 3.0, 3.1, 2.9, 3.2, 3.4, 3.2, 3.5, 3.6, 3.4, 3.6]
          : [4.0, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 4.9, 5.0, 5.1, 5.1],
      trendInsight: isStrong
        ? 'Issue rate trending down. Strong staff coverage during peak windows.'
        : 'Spike detected in last 2 weeks. Driven primarily by "Messy Aisles" theme.',
      panelTitle: 'VoC Issue Rate — 52-Week Trend',
      panelDetails: [
        { label: 'Best', value: isStrong ? '1.9 / 100 (Jun 2)' : '2.4 / 100 (Jun 2)', status: 'positive' },
        { label: 'Worst', value: isStrong ? '3.0 / 100 (Feb 2)' : '5.1 / 100 (Feb 2)', status: 'negative' },
        { label: 'Spike Driver', value: isStrong ? 'None — stable' : 'Messy Aisles (+34%)', status: isStrong ? 'positive' : 'negative' },
        { label: 'Vs District Avg', value: isStrong ? '-1.4 (better)' : '+1.3 (worse)', status: isStrong ? 'positive' : 'warning' },
      ],
    },
    {
      id: 'shelf-audit',
      category: 'execution',
      label: 'Shelf Audit Compliance',
      primaryValue: isStrong ? '94%' : isOk ? '89%' : '78%',
      microInsight: isStrong ? 'Above target' : isOk ? '6th week below target' : 'Critical — well below target',
      delta: isStrong ? '+1 pt' : isOk ? '-6 pts' : '-17 pts',
      deltaDirection: isStrong ? 'up' : 'down',
      deltaContext: 'vs target',
      status: isStrong ? 'positive' : isOk ? 'warning' : 'negative',
      clickable: true,
      trendData: isStrong
        ? [92, 93, 91, 90, 92, 91, 93, 90, 92, 93, 94, 94]
        : isOk
          ? [92, 93, 91, 90, 92, 91, 89, 90, 88, 89, 90, 89]
          : [86, 84, 82, 80, 81, 79, 80, 78, 79, 78, 78, 78],
      trendInsight: isStrong
        ? 'Above target consistently. Cleanliness and Planogram dimensions leading.'
        : 'Below target for 6 consecutive weeks. Safety and Cleanliness pulling overall score down.',
      panelTitle: 'Shelf Audit Compliance — 52-Week Trend',
      panelDetails: [
        { label: 'Target', value: '95%', status: 'neutral' },
        { label: 'Gap', value: isStrong ? '-1pt' : isOk ? '-6pts' : '-17pts', status: isStrong ? 'warning' : 'negative' },
        { label: 'Top Category', value: 'Pricing (97%)', status: 'positive' },
        { label: 'Bottom Category', value: 'Backroom (78%)', status: 'negative' },
      ],
    },
    {
      id: 'oos-rate',
      category: 'operations',
      label: 'OOS Rate',
      primaryValue: isStrong ? '1.8%' : isOk ? '3.2%' : '6.4%',
      microInsight: isStrong ? 'Apparel 0.8%, Home 1.2%' : isOk ? 'Apparel drives 55%' : 'Apparel drives 62%',
      delta: isStrong ? '-0.3 pts' : isOk ? '+0.5 pts' : '+2.1 pts',
      deltaDirection: isStrong ? 'down' : 'up',
      deltaContext: 'WoW',
      status: isStrong ? 'positive' : isOk ? 'warning' : 'negative',
      clickable: true,
      trendData: isStrong
        ? [2.4, 2.2, 2.1, 2.0, 1.9, 2.0, 1.9, 1.8, 1.9, 1.8, 1.8, 1.8]
        : isOk
          ? [2.6, 2.7, 2.8, 2.9, 2.8, 3.0, 3.1, 3.0, 3.1, 3.2, 3.1, 3.2]
          : [4.1, 4.4, 4.7, 5.0, 5.2, 5.4, 5.6, 5.9, 6.1, 6.2, 6.3, 6.4],
      trendInsight: isStrong
        ? 'OOS contained. Replenishment SLA met 100% over last 30 days.'
        : 'Driven by Basics size-runs and delayed inbound. 4 SKUs critical this week.',
      panelTitle: 'OOS Rate — 52-Week Trend',
      panelDetails: [
        { label: 'Best', value: isStrong ? '1.4% (Jun 9)' : '2.1% (Jun 9)', status: 'positive' },
        { label: 'Worst', value: isStrong ? '2.8% (Jan 19)' : '6.8% (Jan 19)', status: 'negative' },
        { label: 'Top Driver', value: 'Basics size-run gaps', status: 'warning' },
        { label: 'Inbound Delays', value: isStrong ? '0 shipments' : '4 shipments', status: isStrong ? 'positive' : 'negative' },
      ],
    },
    {
      id: 'margin-health',
      category: 'profitability',
      label: 'Margin Health',
      primaryValue: isStrong ? '36.4%' : isOk ? '34.2%' : '31.8%',
      primaryUnit: 'GM',
      microInsight: isStrong ? 'Markdown discipline strong' : isOk ? 'In-line with district' : 'Markdown pressure rising',
      delta: isStrong ? '+30 bps' : isOk ? '+10 bps' : '-90 bps',
      deltaDirection: isStrong || isOk ? 'up' : 'down',
      deltaContext: 'WoW',
      status: isStrong ? 'positive' : isOk ? 'neutral' : 'negative',
      clickable: true,
      trendData: isStrong
        ? [35.4, 35.6, 35.8, 36.0, 35.9, 36.1, 36.0, 36.2, 36.1, 36.3, 36.2, 36.4]
        : isOk
          ? [33.8, 33.9, 34.0, 34.0, 34.1, 34.0, 34.1, 34.0, 34.1, 34.2, 34.1, 34.2]
          : [33.6, 33.4, 33.2, 33.0, 32.8, 32.6, 32.4, 32.2, 32.0, 31.9, 31.8, 31.8],
      trendInsight: isStrong
        ? 'Margin expanding through markdown discipline and full-price mix.'
        : 'Markdown pressure driving compression. Apparel category leading the decline.',
      panelTitle: 'Margin Health — 52-Week Trend',
      panelDetails: [
        { label: 'Peak', value: isStrong ? '37.0% (Aug 18)' : '34.8% (Aug 18)', status: 'positive' },
        { label: 'Low', value: isStrong ? '34.9% (Feb 9)' : '31.8% (Feb 9)', status: 'negative' },
        { label: 'Markdown Mix', value: isStrong ? '12.4%' : '18.6%', status: isStrong ? 'positive' : 'warning' },
        { label: 'Full-Price Mix', value: isStrong ? '74.2%' : '64.8%', status: isStrong ? 'positive' : 'warning' },
      ],
    },
  ];
};

// ── Audit cell findings + recommendations (mirror DI's autoFindingsMap structure) ──
const scAuditFindings: Record<string, string[]> = {
  Overall: ['Multiple sub-dimensions trending below target', 'Cross-category execution gaps observed', 'Score driven by 2-3 weak dimensions'],
  Safety: ['Fire extinguisher inspection overdue', 'Emergency exit signage faded in Zone B', 'Wet floor sign protocol inconsistent', 'First aid kit needs restocking'],
  Planogram: ['Shelf facings deviating from authorized POG', 'Endcap promotion not fully set', 'Adjacency disruption in Women\'s Wall', 'Missing labels for 3 newly added SKUs'],
  Signage: ['Price signage outdated on 6+ items', 'Promotional banner not visible from main aisle', 'Department wayfinding misaligned', 'Sale end-date signage still live post-promo'],
  Cleanliness: ['Aisle floor needs deeper clean (3, 5, 7)', 'Fitting room mirrors smudged', 'Restroom restocking schedule lapsed', 'Customer-facing endcaps dusty'],
  Availability: ['8 size-run gaps in Basics', '4 OOS-risk SKUs flagged this week', 'Backroom replenishment lagging', 'Featured promo SKU low stock'],
  Staffing: ['Coverage thin during 11am–3pm peak', 'Fitting room attendant absent during weekend', 'Cashier coverage 1 short on Fri evening', 'New hire onboarding behind schedule'],
  'Stock Rotation': ['FIFO violations in Grocery aisles', 'Date-coded items not rotated weekly', 'Backstock organization needs reset', 'Aged inventory increasing in Footwear'],
  Pricing: ['Shelf-tag mismatches on 4 SKUs', 'Promo pricing not loaded for Tuesday refresh', 'Multi-buy signage confusing in Snacks', 'Markdown stickers obscuring base price'],
  Backroom: ['Receiving area cluttered, blocking aisle access', 'Pallet rotation not following SLA', 'Hazmat segregation needs review', 'Empty cardboard buildup at dock'],
  'Customer Area': ['Shopping cart availability below 80%', 'Checkout queue exceeded 5-min wait', 'Customer service desk unstaffed during peak', 'Store entrance cleanliness needs attention'],
};

const scCategorySkill: Record<string, { skill: string; logic: string }> = {
  Overall: { skill: 'analytics', logic: 'Aggregated KPI derived from all audit dimensions' },
  Safety: { skill: 'knowledge', logic: 'Compliance-driven; surfaces the relevant safety SOP and remediation steps' },
  Planogram: { skill: 'pog', logic: 'POG drift detected; AI generates corrective shelf-set' },
  Signage: { skill: 'knowledge', logic: 'Surfaces signage standards and missing-asset checklist' },
  Cleanliness: { skill: 'actions', logic: 'Triggers cleaning task with assigned owner and SLA' },
  Availability: { skill: 'analytics', logic: 'Cross-references OOS feed to identify root cause' },
  Staffing: { skill: 'actions', logic: 'Recommends shift adjustments based on traffic forecast' },
  'Stock Rotation': { skill: 'knowledge', logic: 'Reinforces FIFO and rotation SOP for relevant team' },
  Pricing: { skill: 'pog', logic: 'Validates shelf-tag against master price file' },
  Backroom: { skill: 'actions', logic: 'Generates reset task with priority based on aisle blockage risk' },
  'Customer Area': { skill: 'actions', logic: 'Auto-creates tasks targeting peak coverage windows' },
};

// ── Mock Data ──────────────────────────────────────────
const storesData: StoreMeta[] = [
  { id: 's1', name: 'Downtown Plaza', number: '2034', cluster: 'Metro North', format: 'Flagship', dpi: 94, dpiDelta: 3.2, momentum: 'rising', rank: 1, totalStores: 8, risk: 'low', lastRefresh: '5 min ago', tier: 'Excellence' },
  { id: 's2', name: 'Riverside Mall', number: '1876', cluster: 'Metro North', format: 'Full-Line', dpi: 91, dpiDelta: 2.1, momentum: 'rising', rank: 2, totalStores: 8, risk: 'low', lastRefresh: '8 min ago', tier: 'Excellence' },
  { id: 's3', name: 'Central Station', number: '3421', cluster: 'Metro West', format: 'Full-Line', dpi: 85, dpiDelta: 0.5, momentum: 'stable', rank: 3, totalStores: 8, risk: 'low', lastRefresh: '12 min ago', tier: 'Excellence' },
  { id: 's4', name: 'Westfield Center', number: '2198', cluster: 'Metro West', format: 'Compact', dpi: 82, dpiDelta: -1.2, momentum: 'stable', rank: 4, totalStores: 8, risk: 'moderate', lastRefresh: '10 min ago', tier: 'Performing' },
  { id: 's5', name: 'Harbor View', number: '4532', cluster: 'South Bay', format: 'Full-Line', dpi: 78, dpiDelta: -3.5, momentum: 'declining', rank: 5, totalStores: 8, risk: 'moderate', lastRefresh: '15 min ago', tier: 'Performing' },
  { id: 's6', name: 'Oak Street', number: '1234', cluster: 'East Region', format: 'Compact', dpi: 72, dpiDelta: -6.8, momentum: 'declining', rank: 6, totalStores: 8, risk: 'high', lastRefresh: '9 min ago', tier: 'Needs Attention' },
  { id: 's7', name: 'Pine Grove', number: '5678', cluster: 'South Bay', format: 'Compact', dpi: 65, dpiDelta: -9.2, momentum: 'declining', rank: 7, totalStores: 8, risk: 'high', lastRefresh: '20 min ago', tier: 'Needs Attention' },
  { id: 's8', name: 'Maple Heights', number: '9012', cluster: 'East Region', format: 'Compact', dpi: 58, dpiDelta: -12.4, momentum: 'declining', rank: 8, totalStores: 8, risk: 'high', lastRefresh: '14 min ago', tier: 'Needs Attention' },
];

const getAuditData = (store: StoreMeta): AuditWeek[] => {
  const base = store.dpi >= 80 ? 85 : 65;
  const variance = store.dpi >= 80 ? 8 : 15;
  const gen = (offset: number, trendFactor: number, i: number) =>
    Math.round(Math.min(100, Math.max(30, base + offset + Math.floor(Math.random() * variance) - variance / 2 + (i * trendFactor))));
  const tf = store.momentum === 'rising' ? 1.5 : store.momentum === 'declining' ? -1.5 : 0;
  const weekDates = ['Mar 2', 'Mar 9', 'Mar 16', 'Mar 23', 'Mar 30', 'Apr 6', 'Apr 13', 'Apr 20'];
  return Array.from({ length: 8 }, (_, i) => {
    const s = gen(0, tf, i);
    const p = gen(0, 0, i);
    const sg = gen(-2, 0, i);
    const c = gen(5, 0, i);
    const a = gen(3, 0, i);
    const st = gen(-2, 0, i);
    const sr = gen(-3, 0, i);
    const pr = gen(1, 0, i);
    const br = gen(-4, 0, i);
    const ca = gen(2, 0, i);
    return {
      weekLabel: weekDates[i],
      date: weekDates[i],
      overall: Math.round((s + p + sg + c + a + st + sr + pr + br + ca) / 10),
      safety: s,
      planogram: p,
      signage: sg,
      cleanliness: c,
      availability: a,
      staffing: st,
      stockRotation: sr,
      pricing: pr,
      backroom: br,
      customerArea: ca,
    };
  });
};

const getVoCData = (store: StoreMeta): VoCItem[] => [
  { theme: 'Staff Helpfulness', sentiment: store.dpi >= 80 ? 'positive' : 'negative', volume: store.dpi >= 80 ? 142 : 89, delta: store.dpi >= 80 ? 12 : -18, topComment: store.dpi >= 80 ? '"Staff was incredibly helpful finding sizes"' : '"Couldn\'t find anyone to help me"', source: 'Google Reviews' },
  { theme: 'Store Cleanliness', sentiment: store.dpi >= 80 ? 'positive' : 'negative', volume: store.dpi >= 80 ? 98 : 134, delta: store.dpi >= 80 ? 5 : 28, topComment: store.dpi >= 80 ? '"Always tidy and well-organized"' : '"Aisles were messy and cluttered"', source: 'In-App Survey' },
  { theme: 'Product Availability', sentiment: store.dpi >= 75 ? 'neutral' : 'negative', volume: 76, delta: store.dpi >= 75 ? -3 : 15, topComment: store.dpi >= 75 ? '"Most items were in stock"' : '"Basic sizes constantly out of stock"', source: 'Google Reviews' },
  { theme: 'Checkout Speed', sentiment: 'positive', volume: 54, delta: -8, topComment: '"Quick checkout, no waiting"', source: 'In-App Survey' },
  { theme: 'Store Ambience', sentiment: store.dpi >= 85 ? 'positive' : 'neutral', volume: 41, delta: 2, topComment: store.dpi >= 85 ? '"Love the new layout!"' : '"Nothing special but acceptable"', source: 'Social Media' },
];

const getInventoryData = (store: StoreMeta): InventoryItem[] => [
  { sku: 'WOM-BLZ-001', name: "Women's Classic Blazer", status: 'in-stock', quantity: 48, daysOfSupply: 14 },
  { sku: 'MEN-DNM-003', name: "Men's Slim Denim", status: store.dpi >= 80 ? 'in-stock' : 'low', quantity: store.dpi >= 80 ? 32 : 6, daysOfSupply: store.dpi >= 80 ? 10 : 2 },
  { sku: 'KID-TSH-012', name: "Kids Color Block Tee", status: 'in-stock', quantity: 64, daysOfSupply: 21 },
  { sku: 'ACC-BAG-005', name: "Canvas Tote Bag", status: store.risk === 'high' ? 'out-of-stock' : 'in-stock', quantity: store.risk === 'high' ? 0 : 22, daysOfSupply: store.risk === 'high' ? 0 : 8 },
  { sku: 'WOM-DRS-008', name: "Summer Midi Dress", status: 'inbound', quantity: 12, daysOfSupply: 3, inboundEta: '2 days' },
  { sku: 'MEN-PLO-002', name: "Men's Polo Classic", status: store.dpi >= 75 ? 'in-stock' : 'low', quantity: store.dpi >= 75 ? 28 : 4, daysOfSupply: store.dpi >= 75 ? 9 : 1 },
  { sku: 'SEA-JKT-004', name: "Seasonal Rain Jacket", status: 'inbound', quantity: 0, daysOfSupply: 0, inboundEta: '5 days' },
  { sku: 'ACC-SCF-009', name: "Silk Blend Scarf", status: 'in-stock', quantity: 36, daysOfSupply: 18 },
  { sku: 'WOM-TOP-014', name: "Women's V-Neck Basics", status: store.risk !== 'low' ? 'out-of-stock' : 'low', quantity: store.risk !== 'low' ? 0 : 5, daysOfSupply: store.risk !== 'low' ? 0 : 1 },
  { sku: 'MEN-CHN-007', name: "Men's Stretch Chino", status: 'inbound', quantity: 4, daysOfSupply: 1, inboundEta: '7 days (delayed)' },
  { sku: 'KID-SHT-019', name: "Kids Cargo Shorts", status: 'low', quantity: 7, daysOfSupply: 2 },
  { sku: 'ACC-BLT-011', name: "Leather Belt Classic", status: 'in-stock', quantity: 54, daysOfSupply: 25 },
];

type InventoryRisk = 'critical' | 'at-risk' | 'watch' | 'healthy';

const classifyInventoryRisk = (item: InventoryItem): InventoryRisk => {
  // Out of stock → critical
  if (item.status === 'out-of-stock') return 'critical';
  // Inbound that is delayed (text contains "delayed") and qty is 0/very low → at-risk
  if (item.status === 'inbound') {
    const delayed = !!item.inboundEta && /delay/i.test(item.inboundEta);
    if (delayed) return 'at-risk';
    if (item.quantity === 0) return 'at-risk';
    if (item.daysOfSupply > 0 && item.daysOfSupply < 4) return 'watch';
    return 'watch';
  }
  // Low stock with very low DoS → critical
  if (item.status === 'low' && item.daysOfSupply <= 2) return 'critical';
  // Low stock → at-risk
  if (item.status === 'low') return 'at-risk';
  // In-stock but DoS < 7 → watch
  if (item.status === 'in-stock' && item.daysOfSupply < 7) return 'watch';
  return 'healthy';
};

const RISK_LABELS: Record<InventoryRisk, string> = {
  critical: 'Critical',
  'at-risk': 'At Risk',
  watch: 'Watch',
  healthy: 'Healthy',
};

const RISK_RANK: Record<InventoryRisk, number> = {
  critical: 0,
  'at-risk': 1,
  watch: 2,
  healthy: 3,
};

const getAIInsight = (store: StoreMeta) => ({
  rootCause: store.dpi >= 80
    ? `${store.name} is performing well overall, driven by strong sales execution and consistent audit compliance. Minor VoC fluctuations in "product availability" are being offset by positive staff interaction scores. The store's momentum is ${store.momentum}, with DPI trending ${store.dpiDelta >= 0 ? 'upward' : 'flat'} over the last 4 weeks.`
    : `${store.name}'s performance decline is driven by a combination of factors: audit compliance has dropped in Safety and Cleanliness categories for 3 consecutive weeks, leading to VoC complaints about "messy aisles" (up 28%). Simultaneously, 3 key SKUs went out-of-stock, reducing availability to ${store.dpi >= 75 ? '89.2%' : '84.1%'} and directly impacting sales conversion.`,
  causalChain: store.dpi >= 80
    ? [
        { factor: 'Staff Training', contribution: 35, direction: 'positive' as const },
        { factor: 'Planogram Compliance', contribution: 25, direction: 'positive' as const },
        { factor: 'Inventory Management', contribution: 20, direction: 'positive' as const },
        { factor: 'Customer Experience', contribution: 20, direction: 'positive' as const },
      ]
    : [
        { factor: 'Audit Compliance Drop', contribution: 40, direction: 'negative' as const },
        { factor: 'OOS / Availability', contribution: 30, direction: 'negative' as const },
        { factor: 'VoC Sentiment Decline', contribution: 20, direction: 'negative' as const },
        { factor: 'Staffing Gaps', contribution: 10, direction: 'negative' as const },
      ],
  actions: store.dpi >= 80
    ? [
        { priority: 1, action: 'Maintain current execution cadence', module: 'Audit', impact: 'Sustain top-tier performance' },
        { priority: 2, action: 'Address minor availability gaps in accessories', module: 'Inventory', impact: '+0.5% availability uplift' },
        { priority: 3, action: 'Replicate staff training model to nearby stores', module: 'Workforce', impact: 'District-wide improvement' },
      ]
    : [
        { priority: 1, action: 'Clear fire exit blockage immediately', module: 'Safety', impact: 'Regulatory compliance restored' },
        { priority: 2, action: 'Expedite OOS replenishment for 3 critical SKUs', module: 'Inventory', impact: '+3.4% availability recovery' },
        { priority: 3, action: 'Deploy cleaning protocol for aisles', module: 'Operations', impact: 'VoC complaint reduction by ~20%' },
        { priority: 4, action: 'Schedule weekend staffing reinforcement', module: 'Workforce', impact: 'Coverage gap closed' },
      ],
});

// Chain-wide benchmarks vary by cluster — Flagship stores compete in a different peer pool
// than Compact or Full-Line stores. Each cluster also has its own peer count (CLUSTER_SIZE).
type BenchDef = { metric: string; unit: string; clusterAvg: number; chainAvg: number; clusterMin: number; clusterMax: number; clusterMedian: number; higherIsBetter: boolean };
const CLUSTER_BENCH_CONFIG: Record<string, { size: number; label: string; benchmarks: BenchDef[] }> = {
  'Metro North': {
    size: 8,
    label: 'Metro North Flagship',
    benchmarks: [
      { metric: 'Sales vs Plan', unit: '%',   clusterAvg: 101.4, chainAvg: 97.4, clusterMin: 90.1, clusterMax: 114.6, clusterMedian: 100.8, higherIsBetter: true },
      { metric: 'SEA Score',     unit: '/100', clusterAvg: 89,    chainAvg: 84,   clusterMin: 74,   clusterMax: 98,    clusterMedian: 88,    higherIsBetter: true },
      { metric: 'VoC Score',     unit: '/5',   clusterAvg: 4.3,   chainAvg: 3.9,  clusterMin: 3.6,  clusterMax: 4.9,   clusterMedian: 4.3,   higherIsBetter: true },
      { metric: 'Availability',  unit: '%',    clusterAvg: 95.8,  chainAvg: 93.1, clusterMin: 85.2, clusterMax: 99.1,  clusterMedian: 95.6,  higherIsBetter: true },
      { metric: 'Gross Margin',  unit: '%',    clusterAvg: 41.8,  chainAvg: 39.5, clusterMin: 35.4, clusterMax: 48.2,  clusterMedian: 41.6,  higherIsBetter: true },
    ],
  },
  'Metro West': {
    size: 10,
    label: 'Metro West Full-Line',
    benchmarks: [
      { metric: 'Sales vs Plan', unit: '%',   clusterAvg: 98.6,  chainAvg: 97.4, clusterMin: 87.4, clusterMax: 111.2, clusterMedian: 98.2, higherIsBetter: true },
      { metric: 'SEA Score',     unit: '/100', clusterAvg: 86,    chainAvg: 84,   clusterMin: 66,   clusterMax: 95,    clusterMedian: 85,   higherIsBetter: true },
      { metric: 'VoC Score',     unit: '/5',   clusterAvg: 4.1,   chainAvg: 3.9,  clusterMin: 3.2,  clusterMax: 4.8,   clusterMedian: 4.1,  higherIsBetter: true },
      { metric: 'Availability',  unit: '%',    clusterAvg: 94.2,  chainAvg: 93.1, clusterMin: 82.8, clusterMax: 98.4,  clusterMedian: 94.5, higherIsBetter: true },
      { metric: 'Gross Margin',  unit: '%',    clusterAvg: 40.1,  chainAvg: 39.5, clusterMin: 33.2, clusterMax: 46.6,  clusterMedian: 40.0, higherIsBetter: true },
    ],
  },
  'South Bay': {
    size: 7,
    label: 'South Bay Mixed-Format',
    benchmarks: [
      { metric: 'Sales vs Plan', unit: '%',   clusterAvg: 96.8,  chainAvg: 97.4, clusterMin: 85.6, clusterMax: 108.4, clusterMedian: 96.4, higherIsBetter: true },
      { metric: 'SEA Score',     unit: '/100', clusterAvg: 84,    chainAvg: 84,   clusterMin: 64,   clusterMax: 93,    clusterMedian: 83,   higherIsBetter: true },
      { metric: 'VoC Score',     unit: '/5',   clusterAvg: 3.9,   chainAvg: 3.9,  clusterMin: 3.0,  clusterMax: 4.6,   clusterMedian: 3.9,  higherIsBetter: true },
      { metric: 'Availability',  unit: '%',    clusterAvg: 93.1,  chainAvg: 93.1, clusterMin: 80.6, clusterMax: 97.8,  clusterMedian: 93.2, higherIsBetter: true },
      { metric: 'Gross Margin',  unit: '%',    clusterAvg: 39.4,  chainAvg: 39.5, clusterMin: 32.8, clusterMax: 45.6,  clusterMedian: 39.2, higherIsBetter: true },
    ],
  },
  'East Region': {
    size: 6,
    label: 'East Region Compact',
    benchmarks: [
      { metric: 'Sales vs Plan', unit: '%',   clusterAvg: 94.6,  chainAvg: 97.4, clusterMin: 82.0, clusterMax: 106.2, clusterMedian: 94.0, higherIsBetter: true },
      { metric: 'SEA Score',     unit: '/100', clusterAvg: 80,    chainAvg: 84,   clusterMin: 58,   clusterMax: 90,    clusterMedian: 79,   higherIsBetter: true },
      { metric: 'VoC Score',     unit: '/5',   clusterAvg: 3.7,   chainAvg: 3.9,  clusterMin: 2.8,  clusterMax: 4.4,   clusterMedian: 3.7,  higherIsBetter: true },
      { metric: 'Availability',  unit: '%',    clusterAvg: 91.4,  chainAvg: 93.1, clusterMin: 78.2, clusterMax: 96.4,  clusterMedian: 91.6, higherIsBetter: true },
      { metric: 'Gross Margin',  unit: '%',    clusterAvg: 38.2,  chainAvg: 39.5, clusterMin: 30.6, clusterMax: 44.8,  clusterMedian: 38.0, higherIsBetter: true },
    ],
  },
};
// Fallback for any cluster not explicitly configured
const DEFAULT_CLUSTER_BENCH = CLUSTER_BENCH_CONFIG['Metro West'];

// ── Operational Compliance View Data ────────────────────
interface BroadcastAction {
  broadcastId: string;
  broadcastTitle: string;
  priority: 'critical' | 'high' | 'medium';
  sentAt: string;
  sender: string;
  source: string;
  actionTitle: string;
  actionCount: number;
  slaDue: string;
  storeStatus: 'completed' | 'in-progress' | 'pending' | 'overdue';
  completionPct: number;
  pendingStores: number;
  overdueStores: number;
  storeBreakdown: { storeNumber: string; storeName: string; status: 'completed' | 'in-progress' | 'pending' | 'overdue'; completedBy?: string; completionTs?: string }[];
}

const broadcastActions: BroadcastAction[] = [
  {
    broadcastId: 'bc-001',
    broadcastTitle: 'Product Recall — Organic Baby Lotion Batch #7742',
    priority: 'critical',
    sentAt: '2 hours ago',
    sender: 'Regional HQ',
    source: 'Compliance Office',
    actionTitle: 'Remove recalled items from shelf & backroom, confirm count',
    actionCount: 8,
    slaDue: 'Today, 5:00 PM',
    storeStatus: 'in-progress',
    completionPct: 62,
    pendingStores: 3,
    overdueStores: 0,
    storeBreakdown: [
      { storeNumber: '2034', storeName: 'Downtown Plaza', status: 'completed', completedBy: 'Sarah M.', completionTs: '1h ago' },
      { storeNumber: '1876', storeName: 'Riverside Mall', status: 'completed', completedBy: 'Marcus C.', completionTs: '45m ago' },
      { storeNumber: '3421', storeName: 'Central Station', status: 'completed', completedBy: 'Lisa W.', completionTs: '30m ago' },
      { storeNumber: '2198', storeName: 'Westfield Center', status: 'completed', completedBy: 'Tom B.', completionTs: '20m ago' },
      { storeNumber: '4532', storeName: 'Harbor View', status: 'completed', completedBy: 'Amy R.', completionTs: '15m ago' },
      { storeNumber: '1234', storeName: 'Oak Street', status: 'in-progress' },
      { storeNumber: '5678', storeName: 'Pine Grove', status: 'pending' },
      { storeNumber: '9012', storeName: 'Maple Heights', status: 'pending' },
    ],
  },
  {
    broadcastId: 'bc-002',
    broadcastTitle: 'Planogram Refresh — Summer Collection Endcaps',
    priority: 'high',
    sentAt: '1 day ago',
    sender: 'Visual Merchandising',
    source: 'VM Team',
    actionTitle: 'Implement new endcap planogram per visual guide v2.3',
    actionCount: 8,
    slaDue: 'Tomorrow, 12:00 PM',
    storeStatus: 'pending',
    completionPct: 38,
    pendingStores: 5,
    overdueStores: 0,
    storeBreakdown: [
      { storeNumber: '2034', storeName: 'Downtown Plaza', status: 'completed', completedBy: 'Sarah M.', completionTs: '6h ago' },
      { storeNumber: '1876', storeName: 'Riverside Mall', status: 'completed', completedBy: 'Marcus C.', completionTs: '4h ago' },
      { storeNumber: '3421', storeName: 'Central Station', status: 'completed', completedBy: 'Lisa W.', completionTs: '2h ago' },
      { storeNumber: '2198', storeName: 'Westfield Center', status: 'in-progress' },
      { storeNumber: '4532', storeName: 'Harbor View', status: 'pending' },
      { storeNumber: '1234', storeName: 'Oak Street', status: 'pending' },
      { storeNumber: '5678', storeName: 'Pine Grove', status: 'pending' },
      { storeNumber: '9012', storeName: 'Maple Heights', status: 'pending' },
    ],
  },
  {
    broadcastId: 'bc-003',
    broadcastTitle: 'Fire Safety Audit Prep — Q2 Compliance Check',
    priority: 'high',
    sentAt: '3 days ago',
    sender: 'Safety & Compliance',
    source: 'District Manager',
    actionTitle: 'Complete fire safety checklist & photo evidence submission',
    actionCount: 8,
    slaDue: 'Overdue (was 2 days ago)',
    storeStatus: 'overdue',
    completionPct: 75,
    pendingStores: 2,
    overdueStores: 2,
    storeBreakdown: [
      { storeNumber: '2034', storeName: 'Downtown Plaza', status: 'completed', completedBy: 'Sarah M.', completionTs: '2d ago' },
      { storeNumber: '1876', storeName: 'Riverside Mall', status: 'completed', completedBy: 'Marcus C.', completionTs: '2d ago' },
      { storeNumber: '3421', storeName: 'Central Station', status: 'completed', completedBy: 'Lisa W.', completionTs: '1d ago' },
      { storeNumber: '2198', storeName: 'Westfield Center', status: 'completed', completedBy: 'Tom B.', completionTs: '1d ago' },
      { storeNumber: '4532', storeName: 'Harbor View', status: 'completed', completedBy: 'Amy R.', completionTs: '1d ago' },
      { storeNumber: '1234', storeName: 'Oak Street', status: 'completed', completedBy: 'Dan K.', completionTs: '12h ago' },
      { storeNumber: '5678', storeName: 'Pine Grove', status: 'overdue' },
      { storeNumber: '9012', storeName: 'Maple Heights', status: 'overdue' },
    ],
  },
];

// ── SM Broadcast Feeds (view-only) ─────────────────────
interface SMBroadcast {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Safety' | 'Operations' | 'Compliance' | 'Announcement' | 'Merchandising' | 'HR';
  title: string;
  description: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
}

// HQ Broadcasts — IDENTICAL data and content to DM Home (StoreOpsHome generateMockBroadcasts)
const SM_HQ_BROADCASTS: SMBroadcast[] = [
  {
    id: '2',
    priority: 'HIGH',
    category: 'Operations',
    title: 'Holiday Schedule Update',
    description: 'Updated store hours for upcoming holiday weekend. Please review and confirm your availability by Friday.',
    sender: 'District Manager',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    priority: 'MEDIUM',
    category: 'Merchandising',
    title: 'New Planogram Guidelines',
    description: 'New planogram guidelines released. Review updated shelf layouts for seasonal products.',
    sender: 'Merchandising Team',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    priority: 'LOW',
    category: 'HR',
    title: 'Training Module Available',
    description: 'New training module available for team members. Confirm staffing assignments.',
    sender: 'HR Department',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

// DM Broadcasts — mirrors the District Intelligence "Broadcast Analytics" effectiveness list (D14)
const SM_DM_BROADCASTS: SMBroadcast[] = [
  {
    id: 'dm-b1',
    priority: 'HIGH',
    category: 'Safety',
    title: 'Safety Protocol Update',
    description: 'Action Required · Updated emergency response and incident-reporting protocol effective immediately.',
    sender: 'John Doe · District Manager',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dm-b2',
    priority: 'MEDIUM',
    category: 'Operations',
    title: 'Weekend Staffing Reminder',
    description: 'Action Required · Confirm weekend coverage and submit the staffing roster by EOD Friday.',
    sender: 'John Doe · District Manager',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'dm-b3',
    priority: 'LOW',
    category: 'Merchandising',
    title: 'Planogram Refresh Checklist',
    description: 'Informational · Walk through the seasonal planogram refresh checklist and align your team for the upcoming reset.',
    sender: 'John Doe · District Manager',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'dm-b4',
    priority: 'LOW',
    category: 'Announcement',
    title: 'Monthly Performance Summary',
    description: 'Informational · District-level performance recap with rankings, wins, and focus areas for next month.',
    sender: 'John Doe · District Manager',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'dm-b5',
    priority: 'HIGH',
    category: 'Compliance',
    title: 'Fire Exit Compliance Alert',
    description: 'Action Required · Confirm fire exits are unobstructed and signage is visible. Submit photo evidence.',
    sender: 'John Doe · District Manager',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
];

// Enrichment for the SM broadcast detail panel — keyed by broadcast id
const SM_BROADCAST_ENRICHMENT: Record<string, {
  fullMessage: string;
  scope: string;
  keyDates: { label: string; date: string }[];
  actionItems: { text: string; done: boolean }[];
  attachments: { name: string; type: string }[];
}> = {
  // ── HQ broadcasts (mirrors DM Home enrichment) ──
  '2': {
    fullMessage: 'All stores will operate on modified hours during the upcoming holiday weekend (Dec 23–26). Saturday and Sunday hours shift to 9 AM – 6 PM. Monday (Dec 25) all stores closed. Thursday (Dec 26) resume normal hours.\n\nPlease review the attached schedule, confirm your team\'s availability by Friday EOD, and ensure signage is updated at store entrances by Saturday morning.',
    scope: 'All stores in District 14 (8 locations)',
    keyDates: [
      { label: 'Modified hours begin', date: 'Dec 23, 2025' },
      { label: 'Availability confirmation due', date: 'Dec 20, 2025 (Friday)' },
      { label: 'Signage update deadline', date: 'Dec 22, 2025' },
    ],
    actionItems: [
      { text: 'Review and confirm team availability', done: false },
      { text: 'Update store entrance signage', done: false },
      { text: 'Notify part-time staff of schedule changes', done: false },
      { text: 'Adjust POS system operating hours', done: false },
    ],
    attachments: [
      { name: 'Holiday_Schedule_District14.pdf', type: 'pdf' },
      { name: 'Signage_Template_Holiday.png', type: 'image' },
    ],
  },
  '3': {
    fullMessage: 'New planogram guidelines have been released for the SS26 season. Key changes include updated shelf layouts for seasonal products in Women\'s, Men\'s, and Accessories departments.\n\nAll stores must complete the transition by end of next week. Compliance audits will begin the following Monday. Camera Shelf Audit scores will be tracked against the new layouts.',
    scope: 'All stores — Merchandising compliance',
    keyDates: [
      { label: 'Guidelines effective', date: 'Jan 6, 2026' },
      { label: 'Transition deadline', date: 'Jan 12, 2026' },
      { label: 'Compliance audit starts', date: 'Jan 13, 2026' },
    ],
    actionItems: [
      { text: 'Download updated planogram layouts', done: false },
      { text: 'Brief store team on changes', done: false },
      { text: 'Execute shelf reset per new POG', done: false },
      { text: 'Submit completion photo via audit tool', done: false },
    ],
    attachments: [
      { name: 'SS26_Planogram_Guidelines.pdf', type: 'pdf' },
      { name: 'Shelf_Layout_Womens.pdf', type: 'pdf' },
      { name: 'Shelf_Layout_Mens.pdf', type: 'pdf' },
    ],
  },
  '4': {
    fullMessage: 'A new mandatory training module on updated safety protocols and customer service excellence is now available in the Learning Hub.\n\nAll store managers must complete the training by end of month and ensure at least 80% of their team has completed it within 2 weeks of the deadline. Certificates will be issued upon completion and tracked in the compliance dashboard.',
    scope: 'All store managers + team leads',
    keyDates: [
      { label: 'Module available from', date: 'Jan 2, 2026' },
      { label: 'Manager completion deadline', date: 'Jan 31, 2026' },
      { label: 'Team completion deadline', date: 'Feb 14, 2026' },
    ],
    actionItems: [
      { text: 'Complete training module personally', done: false },
      { text: 'Assign training to all team members', done: false },
      { text: 'Track team completion progress', done: false },
      { text: 'Submit completion report to HR', done: false },
    ],
    attachments: [
      { name: 'Training_Module_Overview.pdf', type: 'pdf' },
    ],
  },
  // ── DM broadcasts (mirrors DI Broadcast Analytics list) ──
  'dm-b1': {
    fullMessage: 'A revised emergency response and incident-reporting protocol takes effect immediately across all District 14 stores.\n\nReview the updated playbook with your team in this week\'s huddle, run a tabletop walk-through of the evacuation flow, and confirm completion via the compliance form.',
    scope: 'All stores in District 14',
    keyDates: [
      { label: 'Protocol effective', date: 'Immediately' },
      { label: 'Team huddle review', date: 'This week' },
      { label: 'Compliance confirmation due', date: 'Friday EOD' },
    ],
    actionItems: [
      { text: 'Review updated protocol with your team', done: false },
      { text: 'Run tabletop evacuation walk-through', done: false },
      { text: 'Submit compliance confirmation form', done: false },
    ],
    attachments: [
      { name: 'Safety_Protocol_v2.pdf', type: 'pdf' },
    ],
  },
  'dm-b2': {
    fullMessage: 'Confirm weekend coverage for both Saturday and Sunday peaks, and submit your store\'s staffing roster by EOD Friday.\n\nMake sure shift leads are assigned to peak windows (11 AM–2 PM and 4–7 PM). Flag any gaps to the district roster channel before submission.',
    scope: 'All stores in District 14 — Store Managers',
    keyDates: [
      { label: 'Roster submission due', date: 'Friday EOD' },
      { label: 'Weekend coverage starts', date: 'Saturday' },
    ],
    actionItems: [
      { text: 'Assign shift leads to weekend peak windows', done: false },
      { text: 'Confirm part-time availability', done: false },
      { text: 'Submit roster via staffing tool', done: false },
    ],
    attachments: [
      { name: 'Weekend_Roster_Template.xlsx', type: 'pdf' },
    ],
  },
  'dm-b3': {
    fullMessage: 'A seasonal planogram refresh is scheduled for the upcoming reset window. Use this checklist to align your team and prepare the floor.\n\nReview the attached layouts, schedule the reset within the published window, and complete the post-reset photo capture for compliance scoring.',
    scope: 'All stores — Merchandising',
    keyDates: [
      { label: 'Pre-reset prep window', date: 'Next week' },
      { label: 'Reset execution window', date: 'Following weekend' },
      { label: 'Post-reset audit', date: 'Following Monday' },
    ],
    actionItems: [
      { text: 'Review updated planogram layouts', done: false },
      { text: 'Brief team on the reset plan', done: false },
      { text: 'Execute shelf reset within window', done: false },
      { text: 'Submit post-reset photo evidence', done: false },
    ],
    attachments: [
      { name: 'Planogram_Refresh_Checklist.pdf', type: 'pdf' },
    ],
  },
  'dm-b4': {
    fullMessage: 'Monthly performance recap for District 14 — rankings, wins, and focus areas for the next 30 days.\n\nReview your store\'s standing relative to the district, share two highlights with your team, and pick one focus area for next month.',
    scope: 'All District 14 stores',
    keyDates: [
      { label: 'Recap published', date: 'This week' },
      { label: 'Team share-out', date: 'Next huddle' },
      { label: 'Focus-area selection', date: 'By next Monday' },
    ],
    actionItems: [
      { text: 'Review district performance recap', done: false },
      { text: 'Share two team highlights at huddle', done: false },
      { text: 'Pick one focus area for next month', done: false },
    ],
    attachments: [
      { name: 'District14_Monthly_Performance.pdf', type: 'pdf' },
    ],
  },
  'dm-b5': {
    fullMessage: 'Confirm that all fire exits are unobstructed, lighting is functional, and signage is visible. Submit photo evidence by EOD today.\n\nThis is a recurring compliance check — any failures will trigger a same-day district follow-up call.',
    scope: 'All stores — Compliance',
    keyDates: [
      { label: 'Compliance check active', date: 'Today' },
      { label: 'Photo evidence due', date: 'EOD today' },
    ],
    actionItems: [
      { text: 'Walk all fire exits and verify clearance', done: false },
      { text: 'Test emergency lighting and signage', done: false },
      { text: 'Submit photo evidence via audit tool', done: false },
    ],
    attachments: [
      { name: 'Fire_Exit_Compliance_Form.pdf', type: 'pdf' },
    ],
  },
};

const formatSMBroadcastTime = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

// ── Helpers ────────────────────────────────────────────
const getComplianceColor = (val: number) => {
  if (val >= 90) return 'var(--ia-color-success-bg)';
  if (val >= 75) return '#d9f2e0';
  if (val >= 60) return 'var(--ia-color-warning-bg)';
  if (val >= 40) return '#fde2e2';
  return '#fcc';
};
const getComplianceTextColor = (val: number) => {
  if (val >= 90) return 'var(--ia-color-success)';
  if (val >= 75) return '#166534';
  if (val >= 60) return '#92400e';
  if (val >= 40) return '#991b1b';
  return '#7f1d1d';
};

// ── Component ──────────────────────────────────────────
export const StoreCenter: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSM = user?.role === 'SM';
  const lockedStoreId = isSM
    ? (storesData.find(s => s.number === user?.storeId)?.id || storesData[0].id)
    : null;
  const [selectedStoreId, setSelectedStoreId] = useState(lockedStoreId || storesData[0].id);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  // SM-only: dual broadcast feeds (matches DM Home interactive behavior)
  const [hqBroadcasts, setHqBroadcasts] = useState<SMBroadcast[]>(SM_HQ_BROADCASTS);
  const [dmBroadcasts, setDmBroadcasts] = useState<SMBroadcast[]>(SM_DM_BROADCASTS);
  const [hqBroadcastsExpanded, setHqBroadcastsExpanded] = useState(true);
  const [dmBroadcastsExpanded, setDmBroadcastsExpanded] = useState(true);
  // SM broadcast detail panel
  const [smBroadcastPanel, setSmBroadcastPanel] = useState<{
    source: 'HQ' | 'DM';
    broadcast: SMBroadcast;
    fullMessage: string;
    scope: string;
    keyDates: { label: string; date: string }[];
    actionItems: { text: string; done: boolean }[];
    attachments: { name: string; type: string }[];
  } | null>(null);
  const [trendModal, setTrendModal] = useState<KPITile | null>(null);
  const [auditWeekDetail, setAuditWeekDetail] = useState<AuditWeek | null>(null);
  const [activeKPIPanel, setActiveKPIPanel] = useState<StoreKPI | null>(null);
  const [auditCellDetail, setAuditCellDetail] = useState<{
    weekLabel: string;
    weekDate: string;
    category: string;
    score: number;
    findings: string[];
    skill: string;
    skillLogic: string;
    trend: 'improving' | 'declining' | 'stable';
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'voc' | 'inventory' | 'benchmarking'>('inventory');
  const [inventoryView, setInventoryView] = useState<'at-risk' | 'all'>('at-risk');
  const [vocExpanded, setVocExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  // OCV state
  const [activeTabId, setActiveTabId] = useState<string>(broadcastActions[0]?.broadcastId ?? '');
  const [ocvCompletedActions, setOcvCompletedActions] = useState<Set<string>>(new Set());
  const [ocvExpandedRow, setOcvExpandedRow] = useState<string | null>(null);

  // ── Calendar / Period Filter State ──
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'week' | 'month' | 'quarter'>('week');
  const [viewingMonth, setViewingMonth] = useState(new Date().getMonth());
  const [viewingYear, setViewingYear] = useState(new Date().getFullYear());

  const getLastAvailableWeekStart = () => {
    const today = new Date();
    const sow = new Date(today);
    sow.setDate(today.getDate() - today.getDay());
    sow.setHours(0, 0, 0, 0);
    const lw = new Date(sow);
    lw.setDate(sow.getDate() - 7);
    return lw;
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
    const cq = Math.floor(now.getMonth() / 3) + 1;
    const cy = now.getFullYear();
    let q = cq - 1, y = cy;
    if (q <= 0) { q += 4; y -= 1; }
    const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const s = (q - 1) * 3;
    return { label: `Q${q} ${y} (${mn[s]}–${mn[s + 2]})`, quarter: q, year: y };
  });

  const isDateInCurrentWeek = (date: Date) => {
    const today = new Date();
    const sow = new Date(today);
    sow.setDate(today.getDate() - today.getDay());
    sow.setHours(0, 0, 0, 0);
    const eow = new Date(sow);
    eow.setDate(sow.getDate() + 6);
    eow.setHours(23, 59, 59, 999);
    return date >= sow && date <= eow;
  };
  const isDateInFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const getCalendarDays = (yr: number, mo: number) => {
    const firstDay = new Date(yr, mo, 1);
    const lastDay = new Date(yr, mo + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();
    const days: { day: number; trailing: boolean }[] = [];
    if (startDow > 0) {
      const pmLast = new Date(yr, mo, 0).getDate();
      for (let i = startDow - 1; i >= 0; i--) days.push({ day: pmLast - i, trailing: true });
    }
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, trailing: false });
    return days;
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const cd = new Date(viewingYear, viewingMonth, day);
    if (isDateInFuture(cd) || isDateInCurrentWeek(cd)) return;
    if (calendarMode === 'week') {
      const ws = new Date(cd);
      ws.setDate(cd.getDate() - cd.getDay());
      setSelectedWeekStart(ws);
      setShowCalendar(false);
    }
  };

  const isInSelectedWeek = (day: number | null) => {
    if (!day || !selectedWeekStart || calendarMode !== 'week') return false;
    const date = new Date(viewingYear, viewingMonth, day);
    const we = new Date(selectedWeekStart);
    we.setDate(selectedWeekStart.getDate() + 6);
    return date >= selectedWeekStart && date <= we;
  };

  const getAvailableQuarters = () => {
    const now = new Date();
    const cq = Math.floor(now.getMonth() / 3) + 1;
    const cy = now.getFullYear();
    const quarters: { label: string; quarter: number; year: number }[] = [];
    let q = cq - 1, y = cy;
    if (q <= 0) { q += 4; y -= 1; }
    const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 0; i < 4; i++) {
      const s = (q - 1) * 3;
      quarters.push({ label: `Q${q} ${y} (${mn[s]}–${mn[s + 2]})`, quarter: q, year: y });
      q -= 1;
      if (q <= 0) { q = 4; y -= 1; }
    }
    return quarters;
  };
  const availableQuarters = getAvailableQuarters();

  const getSelectedPeriodLabel = () => {
    if (calendarMode === 'week' && selectedWeekStart) {
      const we = new Date(selectedWeekStart);
      we.setDate(selectedWeekStart.getDate() + 6);
      return `${selectedWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${we.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    if (calendarMode === 'month' && selectedMonth) return selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (calendarMode === 'quarter' && selectedQuarter) return selectedQuarter.label;
    return 'Select Period';
  };

  const navigateMonth = (dir: number) => {
    let nm = viewingMonth + dir, ny = viewingYear;
    if (nm < 0) { nm = 11; ny -= 1; }
    if (nm > 11) { nm = 0; ny += 1; }
    setViewingMonth(nm);
    setViewingYear(ny);
  };

  const calendarDays = getCalendarDays(viewingYear, viewingMonth);
  const isDateFilterActive = true;

  // Close calendar on outside click
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.calendar-picker-wrapper')) setShowCalendar(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Handle incoming store selection via URL query param (ignored for SM — store is locked)
  useEffect(() => {
    if (isSM) return;
    const storeParam = searchParams.get('store');
    if (storeParam) {
      const match = storesData.find(s => s.number === storeParam);
      if (match) {
        setIsLoading(true);
        setSelectedStoreId(match.id);
        window.scrollTo(0, 0);
        scrollRef.current?.scrollTo(0, 0);
        const timer = setTimeout(() => {
          setIsLoading(false);
          window.scrollTo(0, 0);
          scrollRef.current?.scrollTo(0, 0);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);

  const store = storesData.find(s => s.id === selectedStoreId) || storesData[0];
  const auditData = getAuditData(store);
  const aiInsight = getAIInsight(store);
  const vocData = getVoCData(store);
  const inventoryData = getInventoryData(store);

  // Filter broadcasts to only those where this store has a non-completed status
  const storeBroadcasts = broadcastActions.filter(bc => {
    const storeRow = bc.storeBreakdown.find(s => s.storeNumber === store.number);
    return storeRow && storeRow.status !== 'completed';
  });

  // Derive active broadcast from tab id (must be after storeBroadcasts is defined)
  const activeBroadcast = storeBroadcasts.find(bc => bc.broadcastId === activeTabId) ?? storeBroadcasts[0];

  // Reset active tab when store changes
  useEffect(() => {
    if (storeBroadcasts.length > 0) {
      setActiveTabId(storeBroadcasts[0].broadcastId);
    }
  }, [selectedStoreId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredStores = storesData.filter(s =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.number.includes(storeSearch)
  );

  const clusterConfig = CLUSTER_BENCH_CONFIG[store.cluster] ?? DEFAULT_CLUSTER_BENCH;
  const clusterSize = clusterConfig.size;

  const getBenchmarks = () => clusterConfig.benchmarks.map((b, idx) => {
    const storeVal = b.metric === 'Sales vs Plan' ? (store.dpi >= 85 ? 104.2 : store.dpi >= 75 ? 97.8 : 91.3)
      : b.metric === 'SEA Score' ? (store.dpi >= 80 ? 91 : 76)
      : b.metric === 'VoC Score' ? (store.dpi >= 80 ? 4.3 : 3.6)
      : b.metric === 'Availability' ? (store.dpi >= 80 ? 96.8 : 89.2)
      : (store.dpi >= 85 ? 42.1 : store.dpi >= 75 ? 39.8 : 37.2);
    const vsCluster = storeVal - b.clusterAvg;
    const vsChain = storeVal - b.chainAvg;

    // Rank: derive deterministic position within clusterSize based on where storeVal
    // lies between clusterMin..clusterMax. Position 1 = best (highest when higherIsBetter).
    const range = Math.max(0.0001, b.clusterMax - b.clusterMin);
    const clampedPos = Math.max(0, Math.min(1, (storeVal - b.clusterMin) / range));
    const percentile = b.higherIsBetter ? clampedPos : 1 - clampedPos;
    const rank = Math.max(1, Math.min(clusterSize, Math.round((1 - percentile) * (clusterSize - 1) + 1)));
    const quartile = rank <= Math.ceil(clusterSize * 0.25) ? 1
      : rank <= Math.ceil(clusterSize * 0.5) ? 2
        : rank <= Math.ceil(clusterSize * 0.75) ? 3 : 4;

    // Rank movement vs last period — deterministic per-metric nudge seeded by idx + store
    const moveSeed = (store.dpi + idx * 7) % 5; // 0..4
    const rankDelta = moveSeed === 0 ? 2 : moveSeed === 1 ? 1 : moveSeed === 2 ? 0 : moveSeed === 3 ? -1 : -2;

    return { ...b, storeVal, vsCluster, vsChain, rank, rankTotal: clusterSize, quartile, rankDelta, clampedPos };
  });

  if (isPageLoading) {
    return (
      <div className="sc-container">
        <div className="sc-page-loading">
          <div className="sc-page-loading-spinner" />
          <p>Loading Store Deep Dive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-container">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="sc-loading-overlay">
          <div className="sc-loading-card">
            <div className="sc-loading-spinner" />
            <h3>Loading Store Profile</h3>
            <p>Fetching data for <strong>{store.name}</strong> #{store.number}</p>
          </div>
        </div>
      )}

      {/* ── Header (matches District Intelligence look & feel) ─── */}
      <div className="district-intel-header sc-di-header">
        <div className="header-left">
          <div className="header-title">
            <StoreOutlined sx={{ fontSize: 24 }}/>
            <h1>Store Deep Dive</h1>
          </div>
          <div className="header-meta">
            <div className="sc-store-selector-wrap">
              <button
                className={`di-district-picker sc-store-picker${isSM ? ' sc-store-picker--locked' : ''}`}
                onClick={() => { if (!isSM) setShowStoreSelector(!showStoreSelector); }}
                disabled={isSM}
                title={isSM ? 'Your assigned store' : undefined}
              >
                <StoreOutlined sx={{ fontSize: 14 }}/>
                <span>{store.name}</span>
                <span className="di-district-dm">#{store.number} · {store.format}</span>
                {!isSM && <KeyboardArrowDown sx={{ fontSize: 14 }} className={showStoreSelector ? 'rotated' : ''}/>}
              </button>

              {!isSM && showStoreSelector && (
                <div className="sc-store-dropdown">
                  <div className="sc-dropdown-search">
                    <SearchOutlined sx={{ fontSize: 14 }}/>
                    <input
                      type="text"
                      placeholder="Search stores..."
                      value={storeSearch}
                      onChange={e => setStoreSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="sc-dropdown-list">
                    {filteredStores.map(s => (
                      <button
                        key={s.id}
                        className={`sc-dropdown-item ${s.id === selectedStoreId ? 'active' : ''}`}
                        onClick={() => { setSelectedStoreId(s.id); setShowStoreSelector(false); setStoreSearch(''); }}
                      >
                        <div className="sc-dropdown-item-left">
                          <span className="sc-dropdown-item-name">{s.name}</span>
                          <span className="sc-dropdown-item-meta">#{s.number} · {s.format}</span>
                        </div>
                        <div className="sc-dropdown-item-right">
                          <span className={`sc-dropdown-dpi sc-dpi--${s.risk}`}>{s.dpi}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Period Selector — uses same classes as District Intelligence Hub */}
            <div className="calendar-picker-wrapper">
            <button className="period-selector" onClick={() => setShowCalendar(!showCalendar)}>
              <CalendarTodayOutlined sx={{ fontSize: 14 }}/>
              <span>{getSelectedPeriodLabel()}</span>
              <KeyboardArrowDown sx={{ fontSize: 14 }} className={showCalendar ? 'rotated' : ''}/>
            </button>

            {showCalendar && (
              <div className="calendar-dropdown">
                <div className="calendar-mode-toggle">
                  <button
                    className={`mode-btn ${calendarMode === 'week' ? 'active' : ''}`}
                    onClick={() => { setCalendarMode('week'); if (selectedWeekStart) { setViewingMonth(selectedWeekStart.getMonth()); setViewingYear(selectedWeekStart.getFullYear()); } }}
                  >Week</button>
                  <button
                    className={`mode-btn ${calendarMode === 'month' ? 'active' : ''}`}
                    onClick={() => { setCalendarMode('month'); if (selectedMonth) { setViewingMonth(selectedMonth.getMonth()); setViewingYear(selectedMonth.getFullYear()); } }}
                  >Month</button>
                  <button
                    className={`mode-btn ${calendarMode === 'quarter' ? 'active' : ''}`}
                    onClick={() => setCalendarMode('quarter')}
                  >Quarter</button>
                </div>

                {calendarMode === 'quarter' ? (
                  <div className="quarter-list">
                    {availableQuarters.map((q, idx) => (
                      <button
                        key={idx}
                        className={`quarter-option ${selectedQuarter?.quarter === q.quarter && selectedQuarter?.year === q.year ? 'selected' : ''}`}
                        onClick={() => { setSelectedQuarter(q); setShowCalendar(false); }}
                      >
                        <span className="quarter-label">Q{q.quarter} {q.year}</span>
                        <span className="quarter-range">{q.label.match(/\((.+)\)/)?.[1]}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="calendar-nav">
                      <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                        <KeyboardArrowDown sx={{ fontSize: 16 }} style={{ transform: 'rotate(90deg)' }}/>
                      </button>
                      <div className="calendar-month-year">
                        <span className="calendar-month">{['January','February','March','April','May','June','July','August','September','October','November','December'][viewingMonth]}</span>
                        <span className="calendar-year">{viewingYear}</span>
                      </div>
                      <button className="nav-btn" onClick={() => navigateMonth(1)}>
                        <KeyboardArrowDown sx={{ fontSize: 16 }} style={{ transform: 'rotate(-90deg)' }}/>
                      </button>
                    </div>

                    <div className="calendar-grid">
                      <div className="calendar-weekdays">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>
                      <div className="calendar-days">
                        {calendarDays.map((entry, index) => {
                          if (entry.trailing) {
                            return <button key={index} className="calendar-day trailing" disabled>{entry.day}</button>;
                          }
                          const day = entry.day;
                          const date = new Date(viewingYear, viewingMonth, day);
                          const isDisabledWeek = isDateInFuture(date) || isDateInCurrentWeek(date);
                          const isDisabledMonth = viewingYear > new Date().getFullYear() || (viewingYear === new Date().getFullYear() && viewingMonth >= new Date().getMonth());
                          const isDisabled = calendarMode === 'week' ? isDisabledWeek : isDisabledMonth;
                          const isSelectedWeek = isInSelectedWeek(day);
                          const isSelectedMo = selectedMonth && viewingYear === selectedMonth.getFullYear() && viewingMonth === selectedMonth.getMonth();
                          const isSelected = calendarMode === 'week' ? isSelectedWeek : !!isSelectedMo;
                          return (
                            <button
                              key={index}
                              className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                              disabled={isDisabled}
                              onClick={() => {
                                if (calendarMode === 'week') { handleDayClick(day); }
                                else if (!isDisabledMonth) { setSelectedMonth(new Date(viewingYear, viewingMonth, 1)); setShowCalendar(false); }
                              }}
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
              Updated {store.lastRefresh}
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
          <button className="header-icon-btn">
            <RefreshOutlined sx={{ fontSize: 18 }}/>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showStoreSelector && <div className="sc-overlay" onClick={() => { setShowStoreSelector(false); setStoreSearch(''); }} />}

      <div className="sc-scroll-area" ref={scrollRef}>
        {/* ── Hero Pulse: SPI Card + AI Daily Brief (matches DI) ── */}
        <div className="executive-pulse sc-pulse">
          {/* SPI Card — matches DI dpi-card-v2 exactly */}
          <div className="dpi-card-v2">
            <div className="dpi-hero-section">
              <div className="dpi-gauge-wrapper-v2">
                <svg className="dpi-gauge-v2" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <defs>
                    <linearGradient id="spiGradientSC" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={store.risk === 'high' ? 'var(--ia-color-error)' : store.risk === 'moderate' ? 'var(--ia-color-warning)' : 'var(--ia-color-success)'} />
                      <stop offset="50%" stopColor={store.risk === 'high' ? 'var(--ia-color-error-strong)' : store.risk === 'moderate' ? 'var(--ia-color-warning-text)' : '#059669'} />
                      <stop offset="100%" stopColor={store.risk === 'high' ? '#b91c1c' : store.risk === 'moderate' ? '#b45309' : '#047857'} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="80" cy="80" r="68"
                    fill="none"
                    stroke="url(#spiGradientSC)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(store.dpi / 100) * 427} 427`}
                    transform="rotate(-90 80 80)"
                    className="dpi-progress-v2"
                  />
                </svg>
                <div className="dpi-score-center-v2">
                  <span className="dpi-score-value-v2">{store.dpi}</span>
                  <span className="dpi-score-label-v2">Performance Index</span>
                </div>
              </div>
            </div>

            <div className="dpi-story-section">
              <div className="dpi-tier-badge-v2">
                <div className="tier-text">
                  <span className="tier-title">{store.tier} Tier</span>
                  <span className="tier-subtitle">{store.tier === 'Excellence' ? 'Top performer in district' : store.tier === 'Performing' ? 'Tracking plan' : 'Requires intervention'}</span>
                </div>
              </div>

              <div className="dpi-rank-stats">
                <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
                  <span className="dpi-rank-value">#{store.rank}</span>
                  <span className="dpi-rank-label">of {store.totalStores}</span>
                </Card>
                <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
                  <div className={`dpi-change-value ${store.dpiDelta < 0 ? 'negative' : ''}`}>
                    {store.dpiDelta >= 0 ? <TrendingUpOutlined sx={{ fontSize: 18 }}/> : <TrendingDownOutlined sx={{ fontSize: 18 }}/>}
                    <span>{store.dpiDelta >= 0 ? '+' : ''}{store.dpiDelta}%</span>
                  </div>
                  <span className="dpi-change-label">vs last period</span>
                </Card>
              </div>

              <div className="dpi-breakdown-header">
                <span className="breakdown-title">Score Breakdown</span>
              </div>
              <div className="dpi-breakdown-grid">
                {(() => {
                  const sales = Math.max(45, Math.min(98, store.dpi + 2));
                  const exec = Math.max(45, Math.min(98, store.dpi - 1));
                  const voc = Math.max(45, Math.min(98, store.dpi - 3));
                  return (
                    <>
                      <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
                        <div className="breakdown-value">{sales}</div>
                        <div className="breakdown-label">Sales</div>
                        <div className="breakdown-bar"><div className="breakdown-fill" style={{ width: `${sales}%` }} /></div>
                      </Card>
                      <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
                        <div className="breakdown-value">{exec}</div>
                        <div className="breakdown-label">Execution</div>
                        <div className="breakdown-bar"><div className="breakdown-fill" style={{ width: `${exec}%` }} /></div>
                      </Card>
                      <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
                        <div className="breakdown-value">{voc}</div>
                        <div className="breakdown-label">VoC</div>
                        <div className="breakdown-bar"><div className="breakdown-fill" style={{ width: `${voc}%` }} /></div>
                      </Card>
                    </>
                  );
                })()}
              </div>

              <div className="dpi-chain-comparison">
                <div className="chain-comparison-header">
                  <span className="chain-label-title">vs District Average</span>
                  <span className={`chain-delta ${store.dpi >= 79 ? 'positive' : 'negative'}`}>{store.dpi >= 79 ? '+' : ''}{store.dpi - 79} pts</span>
                </div>
                <div className="chain-comparison-bar">
                  <div className="chain-bar-track">
                    <div className="chain-bar-fill" style={{ width: `${store.dpi}%` }} />
                    <div className="chain-marker" style={{ left: `79%` }}>
                      <div className="chain-marker-line" />
                      <span className="chain-marker-label">District: 79</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Daily Brief (shared component) — merges tier narrative + AI Insight */}
          <div className="pulse-right-panel">
            {(() => {
              const baseBrief = getStoreBrief(store);
              const mergedBrief: AIDailyBriefData = {
                ...baseBrief,
                sections: [
                  {
                    title: 'Root Cause',
                    icon: 'triage',
                    bullets: [
                      aiInsight.rootCause,
                      ...aiInsight.causalChain.map(c =>
                        `<strong>${c.factor}</strong> — ${c.contribution}% contribution <em>(${c.direction})</em>`
                      ),
                    ],
                  },
                  ...baseBrief.sections,
                  {
                    title: 'Ranked Actions',
                    icon: 'recommendations',
                    bullets: aiInsight.actions.map(a =>
                      `<strong>#${a.priority} — ${a.action}</strong> · <em>${a.module}</em> · ${a.impact}`
                    ),
                  },
                ],
              };
              return (
                <AIDailyBrief
                  brief={mergedBrief}
                  userName={user?.name}
                />
              );
            })()}
          </div>
        </div>

        {/* ── SM-only: Dual Broadcast Feeds (HQ | DM) — same UI/behavior as DM Home ── */}
        {isSM && (
          <div className="sc-sm-broadcasts">
            {([
              { title: 'HQ Broadcasts', source: 'HQ' as const, data: hqBroadcasts, setData: setHqBroadcasts, expanded: hqBroadcastsExpanded, setExpanded: setHqBroadcastsExpanded },
              { title: 'DM Broadcasts', source: 'DM' as const, data: dmBroadcasts, setData: setDmBroadcasts, expanded: dmBroadcastsExpanded, setExpanded: setDmBroadcastsExpanded },
            ] as const).map((feed) => {
              const unread = feed.data.filter(b => !b.isRead).length;
              return (
                <div key={feed.title} className="hq-broadcasts-card sc-sm-broadcast-card">
                  <div
                    className="hq-broadcasts-header sc-sm-broadcast-header"
                    onClick={() => feed.setExpanded(!feed.expanded)}
                  >
                    <div className="hq-broadcasts-title">
                      <NotificationsOutlined sx={{ fontSize: 15 }}/>
                      <span>{feed.title}</span>
                      {unread > 0 && (
                        <span className="hq-broadcast-count">{unread}</span>
                      )}
                    </div>
                    <KeyboardArrowDown sx={{ fontSize: 14 }} className={`expand-icon ${feed.expanded ? 'expanded' : ''}`}/>
                  </div>
                  {feed.expanded && (
                    <div className="hq-broadcasts-body">
                      <div className="hq-broadcasts-list">
                        {feed.data.map((b) => (
                          <div
                            key={b.id}
                            className={`hq-broadcast-item sc-sm-broadcast-item ${!b.isRead ? 'unread' : ''} ${b.priority === 'CRITICAL' ? 'critical' : ''}`}
                            onClick={() => {
                              feed.setData((prev) =>
                                prev.map((x) => (x.id === b.id ? { ...x, isRead: true } : x))
                              );
                              const extra = SM_BROADCAST_ENRICHMENT[b.id] || {
                                fullMessage: b.description,
                                scope: feed.source === 'HQ' ? 'District-wide' : 'Store-level',
                                keyDates: [],
                                actionItems: [],
                                attachments: [],
                              };
                              setSmBroadcastPanel({
                                source: feed.source,
                                broadcast: b,
                                fullMessage: extra.fullMessage,
                                scope: extra.scope,
                                keyDates: extra.keyDates,
                                actionItems: extra.actionItems,
                                attachments: extra.attachments,
                              });
                            }}
                          >
                            <div className="hq-broadcast-content">
                              <div className="hq-broadcast-title-row">
                                {b.priority === 'CRITICAL' && (
                                  <span className="hq-broadcast-priority-badge critical">
                                    <WarningAmberOutlined sx={{ fontSize: 10 }}/>
                                    CRITICAL
                                  </span>
                                )}
                                <span className="hq-broadcast-title">{b.title}</span>
                                {!b.isRead && <span className="hq-unread-dot"></span>}
                              </div>
                              <p className="hq-broadcast-desc">{b.description}</p>
                              <div className="hq-broadcast-meta">
                                <span className="hq-broadcast-sender">{b.sender}</span>
                                <span className="hq-broadcast-time">{formatSMBroadcastTime(b.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Store KPIs (mirrors District Intelligence "District KPIs") ── */}
        <div className="kpi-cards-section sc-kpi-section">
          <div className="kpi-cards-header">
            <div className="kpi-header-title-row">
              <div className="kpi-title-group">
                <h2><BarChartOutlined sx={{ fontSize: 20 }}/> Store KPIs {isDateFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="filter-active-icon"/>}</h2>
                <span className="kpi-header-subtitle">Click any metric to explore 52-week trend</span>
              </div>
              <div className="kpi-header-stats">
                <div className="kpi-stat-pill kpi-stat-positive">
                  <span className="kpi-stat-value">{getStoreKPIs(store).filter(k => k.status === 'positive').length}</span>
                  <span className="kpi-stat-label">On Track</span>
                </div>
                <div className="kpi-stat-pill kpi-stat-warning">
                  <span className="kpi-stat-value">{getStoreKPIs(store).filter(k => k.status === 'warning').length}</span>
                  <span className="kpi-stat-label">Watch</span>
                </div>
                <div className="kpi-stat-pill kpi-stat-negative">
                  <span className="kpi-stat-value">{getStoreKPIs(store).filter(k => k.status === 'negative').length}</span>
                  <span className="kpi-stat-label">Needs Attention</span>
                </div>
              </div>
            </div>
          </div>
          {isDateFilterActive && <div className="sc-section-filter-badge"><FilterListOutlined sx={{ fontSize: 11 }} className="filter-active-icon"/><span>{getSelectedPeriodLabel()}</span></div>}
          <div className="kpi-cards-grid">
            {getStoreKPIs(store).map(kpi => {
              const categoryIcon =
                kpi.category === 'commercial' ? <AttachMoneyOutlined sx={{ fontSize: 12 }}/> :
                kpi.category === 'customer' ? <FavoriteOutlined sx={{ fontSize: 12 }}/> :
                kpi.category === 'execution' ? <AssignmentTurnedInOutlined sx={{ fontSize: 12 }}/> :
                kpi.category === 'profitability' ? <TrackChangesOutlined sx={{ fontSize: 12 }}/> :
                <InventoryOutlined sx={{ fontSize: 12 }}/>;
              const categoryLabel =
                kpi.category === 'commercial' ? 'Commercial' :
                kpi.category === 'customer' ? 'Customer' :
                kpi.category === 'execution' ? 'Execution' :
                kpi.category === 'profitability' ? 'Profitability' :
                'Operations';
              return (
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
                    <div className={`kpi-tile-category kpi-tile-category--${kpi.category}`}>
                      {categoryIcon}
                      <span>{categoryLabel}</span>
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
                              <linearGradient id={`sc-spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d={areaPath} fill={`url(#sc-spark-${kpi.id})`} />
                            <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="miter" />
                            <circle cx={last.x} cy={last.y} r="1.8" fill={color} stroke="#ffffff" strokeWidth="1" />
                          </svg>
                        </div>
                      );
                    })()}
                    {kpi.clickable && <KeyboardArrowRight sx={{ fontSize: 14 }} className="kpi-tile-arrow"/>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── Operational Compliance View ──────────────────── */}
        <Card sx={{ padding: 0, overflow: 'hidden', marginBottom: '20px', borderRadius: '16px', maxWidth: '100%', minHeight: 0, width: '100%' }}>
          <div className="ocv-header">
            <div className="ocv-title-row">
              <div className="ocv-icon-wrap">
                <AssignmentTurnedInOutlined sx={{ fontSize: 20 }}/>
              </div>
              <div className="ocv-title-text">
                <h3>Operational Compliance View</h3>
                <span className="ocv-subtitle">Broadcast → Action → Execution tracking</span>
              </div>
            </div>
            {storeBroadcasts.length > 0 ? (
              <div className="ocv-kpi-pills">
                <div className="ocv-kpi-pill">
                  <span className="ocv-kpi-val">{activeBroadcast.completionPct}%</span>
                  <span className="ocv-kpi-lbl">Completion</span>
                </div>
                <div className="ocv-kpi-pill ocv-kpi--pending">
                  <span className="ocv-kpi-val">{activeBroadcast.pendingStores}</span>
                  <span className="ocv-kpi-lbl">Pending</span>
                </div>
                <div className="ocv-kpi-pill ocv-kpi--overdue">
                  <span className="ocv-kpi-val">{activeBroadcast.overdueStores}</span>
                  <span className="ocv-kpi-lbl">Overdue</span>
                </div>
              </div>
            ) : (
              <div className="ocv-kpi-pills">
                <div className="ocv-kpi-pill" style={{ background: 'var(--ia-color-success-bg)', borderColor: 'var(--ia-color-success-soft)' }}>
                  <span className="ocv-kpi-val" style={{ color: 'var(--ia-color-success)' }}>All Clear</span>
                </div>
              </div>
            )}
          </div>

          {storeBroadcasts.length > 0 ? (
            <Tabs
              value={activeTabId}
              onChange={(_: React.SyntheticEvent, val: string) => setActiveTabId(val)}
              tabNames={storeBroadcasts.map(bc => ({
                value: bc.broadcastId,
                label: (
                  <span className="ocv-tab-label">
                    <Badge
                      label={bc.priority.toUpperCase()}
                      color={bc.priority === 'critical' ? 'error' : bc.priority === 'high' ? 'warning' : 'default'}
                      size="small"
                      variant="subtle"
                    />
                    <span className="ocv-tab-title">
                      {bc.broadcastTitle.length > 30 ? bc.broadcastTitle.slice(0, 30) + '…' : bc.broadcastTitle}
                    </span>
                  </span>
                ),
              }))}
              tabPanels={storeBroadcasts.map(bc => {
                const storeRow = bc.storeBreakdown.find((s: { storeNumber: string }) => s.storeNumber === store.number);
                const isMarkedDone = ocvCompletedActions.has(`${bc.broadcastId}-${store.number}`);
                const effectiveStatus = isMarkedDone ? 'completed' : storeRow?.status || 'pending';
                return (
                  <div className="ocv-zones">
                    {/* LEFT: Broadcast Feed */}
                    <div className="ocv-zone ocv-zone-broadcast">
                      <div className="ocv-zone-label">
                        <CampaignOutlined sx={{ fontSize: 14 }}/>
                        <span>Broadcast Feed</span>
                      </div>
                      <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="ocv-bc-title">{bc.broadcastTitle}</div>
                        <div className="ocv-bc-meta">
                          <Badge
                            label={bc.priority.toUpperCase()}
                            color={bc.priority === 'critical' ? 'error' : bc.priority === 'high' ? 'warning' : 'default'}
                            size="small"
                            variant="subtle"
                          />
                          <span className="ocv-bc-time">
                            <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                            {bc.sentAt}
                          </span>
                        </div>
                        <div className="ocv-bc-sender">
                          <SendOutlined sx={{ fontSize: 11 }}/>
                          <span>{bc.sender}</span>
                          <span className="ocv-bc-source">· {bc.source}</span>
                        </div>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DescriptionOutlined sx={{ fontSize: 13 }}/>}
                          endIcon={<KeyboardArrowRight sx={{ fontSize: 13 }}/>}
                          onClick={() => setOcvExpandedRow(ocvExpandedRow === `instructions-${bc.broadcastId}` ? null : `instructions-${bc.broadcastId}`)}
                        >
                          View Instructions
                        </Button>
                        {ocvExpandedRow === `instructions-${bc.broadcastId}` && (
                          <div className="ocv-instructions-panel">
                            <p className="ocv-instr-heading">Broadcast Instructions</p>
                            <p><strong>Action Required:</strong> {bc.actionTitle}</p>
                            <p><strong>Priority:</strong> {bc.priority.charAt(0).toUpperCase() + bc.priority.slice(1)}</p>
                            <p><strong>SLA / Due:</strong> {bc.slaDue}</p>
                            <p><strong>Issued By:</strong> {bc.sender} — {bc.source}</p>
                            <p><strong>Scope:</strong> {bc.actionCount} stores assigned</p>
                            <p><strong>Sent:</strong> {bc.sentAt}</p>
                          </div>
                        )}
                      </Card>
                    </div>

                    {/* CENTER: Action Mapping */}
                    <div className="ocv-zone ocv-zone-actions">
                      <div className="ocv-zone-label">
                        <PlaylistAddCheckOutlined sx={{ fontSize: 14 }}/>
                        <span>Action Mapping</span>
                      </div>
                      <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="ocv-action-flow">
                          <div className="ocv-flow-step">
                            <CampaignOutlined sx={{ fontSize: 13 }}/>
                            <span>Broadcast</span>
                          </div>
                          <div className="ocv-flow-arrow">→</div>
                          <div className="ocv-flow-step">
                            <PlaylistAddCheckOutlined sx={{ fontSize: 13 }}/>
                            <span>Action Created</span>
                          </div>
                          <div className="ocv-flow-arrow">→</div>
                          <div className="ocv-flow-step">
                            <CheckCircleOutlined sx={{ fontSize: 13 }}/>
                            <span>Execution</span>
                          </div>
                        </div>
                        <div className="ocv-action-detail">
                          <div className="ocv-action-title">{bc.actionTitle}</div>
                          <div className="ocv-action-meta-row">
                            <div className="ocv-action-meta-item">
                              <StoreOutlined sx={{ fontSize: 12 }}/>
                              <span>{bc.actionCount} store actions</span>
                            </div>
                            <div className="ocv-action-meta-item">
                              <TimerOutlined sx={{ fontSize: 12 }}/>
                              <span>SLA: {bc.slaDue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ocv-progress-bar-wrap">
                          <div className="ocv-progress-label">
                            <span>Progress</span>
                            <span className="ocv-progress-pct">{bc.completionPct}%</span>
                          </div>
                          <div className="ocv-progress-bar">
                            <div
                              className={`ocv-progress-fill ocv-status--${bc.storeStatus}`}
                              style={{ width: `${bc.completionPct}%` }}
                            />
                          </div>
                        </div>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<BoltOutlined sx={{ fontSize: 13 }}/>}
                          endIcon={<KeyboardArrowRight sx={{ fontSize: 13 }}/>}
                          onClick={() => navigate(`/command-center/operations-queue?broadcast=${bc.broadcastId}`)}
                        >
                          View Operation Queue
                        </Button>
                      </Card>
                    </div>

                    {/* RIGHT: Execution Status */}
                    <div className="ocv-zone ocv-zone-execution">
                      <div className="ocv-zone-label">
                        <CheckCircleOutlined sx={{ fontSize: 14 }}/>
                        <span>Execution Status</span>
                      </div>
                      <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="ocv-store-status">
                          <div className="ocv-store-status-header">
                            <span className="ocv-store-label">Store #{store.number} — {store.name}</span>
                            <Badge
                              label={effectiveStatus.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              color={effectiveStatus === 'completed' ? 'success' : effectiveStatus === 'in-progress' ? 'warning' : 'error'}
                              size="small"
                              variant="subtle"
                            />
                          </div>
                          {(effectiveStatus === 'completed' || isMarkedDone) && (
                            <div className="ocv-completed-info">
                              <div className="ocv-completed-row">
                                <GroupOutlined sx={{ fontSize: 12 }}/>
                                <span>Completed by: {isMarkedDone ? 'You (just now)' : storeRow?.completedBy || '—'}</span>
                              </div>
                              <div className="ocv-completed-row">
                                <AccessTimeOutlined sx={{ fontSize: 12 }}/>
                                <span>{isMarkedDone ? 'Just now' : storeRow?.completionTs || '—'}</span>
                              </div>
                            </div>
                          )}
                          {effectiveStatus !== 'completed' && !isMarkedDone && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<TaskAltOutlined sx={{ fontSize: 14 }}/>}
                              onClick={() => {
                                setOcvCompletedActions(prev => {
                                  const next = new Set(prev);
                                  next.add(`${bc.broadcastId}-${store.number}`);
                                  return next;
                                });
                              }}
                            >
                              Mark Done
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                );
              })}
            />
          ) : (
            <div className="ocv-all-clear">
              <div className="ocv-all-clear-icon">
                <TaskAltOutlined sx={{ fontSize: 24 }}/>
              </div>
              <p className="ocv-all-clear-text">No active compliance actions for <strong>{store.name}</strong>. All broadcasts have been completed.</p>
            </div>
          )}
        </Card>

        {/* ── 8-Week Audit Lens ──────────────────────────── */}
        <div className="sc-audit-section">
          <div className="sc-section-header sc-audit-header-row-top">
            <div>
              <div className="sc-section-title-row">
                <AssignmentTurnedInOutlined sx={{ fontSize: 20 }}/>
                <h3>8-Week Audit Lens</h3>
                {isDateFilterActive && <FilterListOutlined sx={{ fontSize: 12 }} className="filter-active-icon"/>}
              </div>
              <span className="sc-section-subtitle">Execution consistency across audit categories</span>
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
          <div className="heatmap-table-wrapper">
            <table className="heatmap-table wow-table">
              <thead>
                <tr>
                  <th className="heatmap-th-store">Category</th>
                  {auditData.map(w => (
                    <th key={w.weekLabel} className="heatmap-th-cat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setAuditWeekDetail(w)}
                    >{w.weekLabel}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['overall', 'safety', 'planogram', 'signage', 'cleanliness', 'availability', 'staffing', 'stockRotation', 'pricing', 'backroom', 'customerArea'].map(cat => {
                  const catLabel = cat === 'stockRotation' ? 'Stock Rotation' : cat === 'customerArea' ? 'Customer Area' : cat.charAt(0).toUpperCase() + cat.slice(1);
                  return (
                    <tr key={cat} className={cat === 'overall' ? 'sc-audit-overall-tr' : ''}>
                      <td>
                        <div className="heatmap-store-cell">
                          <span className="heatmap-store-number">
                            {catLabel}
                          </span>
                        </div>
                      </td>
                      {auditData.map((w, wi) => {
                        const val = w[cat as keyof AuditWeek] as number;
                        const prevVal = wi > 0 ? (auditData[wi - 1][cat as keyof AuditWeek] as number) : val;
                        const trend: 'improving' | 'declining' | 'stable' = val > prevVal + 1 ? 'improving' : val < prevVal - 1 ? 'declining' : 'stable';
                        const findings = scAuditFindings[catLabel] || scAuditFindings.Overall;
                        const skillMap = scCategorySkill[catLabel] || scCategorySkill.Overall;
                        const isActive = auditCellDetail?.weekLabel === w.weekLabel && auditCellDetail?.category === catLabel;
                        return (
                          <td key={w.weekLabel} className="heatmap-cell">
                            <div
                              className={`heatmap-chip${isActive ? ' heatmap-chip--active' : ''}`}
                              style={{ background: getComplianceColor(val), color: getComplianceTextColor(val) }}
                              onClick={() => setAuditCellDetail({
                                weekLabel: w.weekLabel,
                                weekDate: w.date,
                                category: catLabel,
                                score: val,
                                findings: findings.slice(0, val >= 90 ? 1 : val >= 75 ? 2 : val >= 50 ? 3 : 4),
                                skill: skillMap.skill,
                                skillLogic: skillMap.logic,
                                trend,
                              })}
                            >
                              <span className="heatmap-value">{val}%</span>
                              <span className={`heatmap-chip-trend heatmap-chip-trend--${trend}`}>
                                {trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '—'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Operational Breakdown ──────────────────────── */}
        <div className="sc-deepdive-section">
          <div className="sc-section-header">
            <div className="sc-section-title-row">
              <GridOnOutlined sx={{ fontSize: 20 }}/>
              <h3>Operational Breakdown</h3>
            </div>
            <span className="sc-section-subtitle">Inventory, customer voice and benchmarking</span>
          </div>
          <Tabs
            tabNames={[
              { value: 'inventory', label: 'Inventory & Inbound', icon: <InventoryOutlined sx={{ fontSize: 14 }}/> },
              { value: 'voc', label: 'VoC Analysis', icon: <FavoriteOutlined sx={{ fontSize: 14 }}/> },
              { value: 'benchmarking', label: 'Comp Benchmarking', icon: <BarChartOutlined sx={{ fontSize: 14 }}/> },
            ]}
            tabPanels={[]}
            value={activeTab}
            onChange={(_, val) => setActiveTab(val as 'inventory' | 'voc' | 'benchmarking')}
          />

          <div className="sc-deepdive-content">
            {/* VoC Tab — decision-oriented view */}
            {activeTab === 'voc' && (() => {
              // Priority score: negative + rising delta is most urgent
              const scored = vocData.map(item => ({
                ...item,
                priority:
                  (item.sentiment === 'negative' ? 1000 : item.sentiment === 'neutral' ? 200 : 0) +
                  (item.sentiment === 'negative' ? Math.max(0, item.delta) * 8 : 0) +
                  item.volume * 0.5,
              }));
              const sorted = scored.slice().sort((a, b) => b.priority - a.priority);
              const totalMentions = sorted.reduce((sum, i) => sum + i.volume, 0);
              const negatives = sorted.filter(i => i.sentiment === 'negative');
              const positives = sorted.filter(i => i.sentiment === 'positive');
              const topNegative = negatives[0];
              const topRising = sorted
                .filter(i => i.sentiment !== 'positive' && i.delta > 0)
                .sort((a, b) => b.delta - a.delta)[0];

              const visible = vocExpanded ? sorted : sorted.slice(0, 3);

              const summaryLine = negatives.length === 0
                ? `Sentiment is healthy — ${positives.length} positive themes leading customer feedback this period.`
                : `${negatives.length} negative theme${negatives.length === 1 ? '' : 's'} dominating feedback${topNegative ? `, led by "${topNegative.theme}"` : ''}${topRising && topRising.theme !== topNegative?.theme ? `; "${topRising.theme}" is rising fast (${topRising.delta >= 0 ? '+' : ''}${topRising.delta}%)` : ''}.`;

              return (
                <div className="sc-voc-tab">
                  {/* Summary narrative */}
                  <div className="sc-voc-summary">
                    <div className="sc-voc-summary-icon"><AutoAwesomeOutlined sx={{ fontSize: 14 }}/></div>
                    <div className="sc-voc-summary-body">
                      <span className="sc-voc-summary-label">Customer Voice Insight</span>
                      <p className="sc-voc-summary-line">{summaryLine}</p>
                    </div>
                    <div className="sc-voc-summary-stats">
                      <div className="sc-voc-stat">
                        <span className="sc-voc-stat-value">{totalMentions}</span>
                        <span className="sc-voc-stat-label">Mentions</span>
                      </div>
                      <div className="sc-voc-stat">
                        <span className="sc-voc-stat-value">{negatives.length}</span>
                        <span className="sc-voc-stat-label">Negative</span>
                      </div>
                      <div className="sc-voc-stat">
                        <span className="sc-voc-stat-value">{positives.length}</span>
                        <span className="sc-voc-stat-label">Positive</span>
                      </div>
                    </div>
                  </div>

                  {/* Cards — KPI tile style matching Store KPI cards */}
                  <div className="sc-voc-grid">
                    {visible.map(item => {
                      const sharePct = totalMentions > 0 ? Math.round((item.volume / totalMentions) * 100) : 0;
                      const isTopNegative = topNegative && item.theme === topNegative.theme;
                      const isTopRising = topRising && item.theme === topRising.theme && !isTopNegative;
                      const trendDir = item.delta > 0 ? 'up' : item.delta < 0 ? 'down' : 'flat';
                      const trendSeverity =
                        item.sentiment === 'negative'
                          ? (item.delta > 0 ? 'bad' : 'good')
                          : item.sentiment === 'positive'
                            ? (item.delta >= 0 ? 'good' : 'bad')
                            : 'neutral';
                      const status = trendSeverity === 'bad' ? 'negative' : trendSeverity === 'good' ? 'positive' : 'neutral';
                      const color = status === 'positive' ? '#047857' : status === 'negative' ? '#991b1b' : 'var(--ia-color-primary-pressed)';
                      // Synthesize 12-pt sparkline from delta trend
                      const seed = item.theme.length;
                      const sparkData = Array.from({ length: 12 }, (_, i) => {
                        const t = i / 11;
                        const drift = trendDir === 'up' ? item.delta * t * 0.5 : trendDir === 'down' ? -Math.abs(item.delta) * t * 0.5 : 0;
                        const jitter = ((seed * (i + 1)) % 7) - 3;
                        return Math.max(5, Math.round(item.volume + drift + jitter));
                      });
                      sparkData[sparkData.length - 1] = item.volume;
                      const sMin = Math.min(...sparkData), sMax = Math.max(...sparkData), sRange = sMax - sMin || 1;
                      const SW = 120, SH = 44, SP = 3;
                      const sPoints = sparkData.map((v, i) => ({
                        x: (i / (sparkData.length - 1)) * SW,
                        y: SH - SP - ((v - sMin) / sRange) * (SH - SP * 2),
                      }));
                      const sPath = sPoints.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
                      const sArea = `${sPath} L ${SW},${SH} L 0,${SH} Z`;
                      const sLast = sPoints[sPoints.length - 1];
                      const gradId = `sc-voc-spark-${item.theme.replace(/\s+/g, '-')}`;

                      return (
                        <Card
                          key={item.theme}
                          className={`kpi-tile--${status}`}
                          sx={{
                            maxWidth: '100%',
                            minHeight: 'unset',
                            padding: 0,
                            width: '100%',
                            borderRadius: '8px',
                            border: isTopNegative
                              ? '1px solid var(--ia-color-error-soft)'
                              : isTopRising
                                ? '1px solid var(--ia-color-warning-bg)'
                                : '1px solid var(--ia-color-border)',
                            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          {(isTopNegative || isTopRising) && (
                            <span className={`sc-voc-priority-tag sc-voc-priority-tag--${isTopNegative ? 'top-negative' : 'top-risk'}`}>
                              {isTopNegative ? <><ErrorOutlined sx={{ fontSize: 11 }}/> Top Negative</> : <><WarningAmberOutlined sx={{ fontSize: 11 }}/> Top Risk</>}
                            </span>
                          )}
                          <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            {/* Category tag = sentiment */}
                            <div className={`kpi-tile-category kpi-tile-category--${item.sentiment === 'positive' ? 'execution' : item.sentiment === 'negative' ? 'operations' : 'customer'}`}>
                              {item.sentiment === 'positive' ? <NorthEast sx={{ fontSize: 12 }}/> : item.sentiment === 'negative' ? <SouthEast sx={{ fontSize: 12 }}/> : <Remove sx={{ fontSize: 12 }}/>}
                              <span>{item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}</span>
                            </div>
                            {/* Primary value = volume */}
                            <div className="kpi-tile-value-row">
                              <span className="kpi-tile-primary">{item.volume}</span>
                              <span className="kpi-tile-unit">mentions</span>
                            </div>
                            {/* Label = theme */}
                            <span className="kpi-tile-label">{item.theme}</span>
                            {/* Micro-insight = top comment */}
                            <div className="kpi-tile-insight">
                              <span className="kpi-tile-insight-dot" />
                              <span style={{ fontStyle: 'italic' }}>"{item.topComment}"</span>
                            </div>
                            {/* Delta */}
                            <div className={`kpi-tile-delta delta-${trendDir}`} style={{ color }}>
                              {trendDir === 'up' && <NorthEast sx={{ fontSize: 12 }}/>}
                              {trendDir === 'down' && <SouthEast sx={{ fontSize: 12 }}/>}
                              {trendDir === 'flat' && <Remove sx={{ fontSize: 12 }}/>}
                              <span>{item.delta >= 0 ? '+' : ''}{item.delta}%</span>
                              <span className="kpi-delta-ctx">vs last period</span>
                            </div>
                          </div>
                          {/* Sparkline */}
                          <div className="kpi-tile-sparkline">
                            <svg viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none">
                              <defs>
                                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <path d={sArea} fill={`url(#${gradId})`} />
                              <path d={sPath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx={sLast.x} cy={sLast.y} r="2.5" fill={color} stroke="#fff" strokeWidth="1.2" />
                            </svg>
                          </div>
                          {/* Footer */}
                          <div className="sc-voc-card-footer" style={{ padding: '8px 16px', borderTop: '1px solid var(--ia-color-bg-muted)' }}>
                            <span className="sc-voc-source">{item.source} · {sharePct}% of feedback</span>
                            <div className="sc-voc-actions">
                              {item.sentiment === 'negative' && (
                                <button
                                  className="sc-voc-action-btn sc-voc-action--primary"
                                  onClick={() => setActiveTab('inventory')}
                                >
                                  <BoltOutlined sx={{ fontSize: 11 }}/>
                                  Take Action
                                </button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Expand toggle */}
                  {sorted.length > 3 && (
                    <button className="sc-voc-expand-btn" onClick={() => setVocExpanded(!vocExpanded)}>
                      {vocExpanded ? (
                        <>Show top 3 only <KeyboardArrowDown sx={{ fontSize: 14 }} style={{ transform: 'rotate(180deg)' }}/></>
                      ) : (
                        <>Show {sorted.length - 3} more theme{sorted.length - 3 === 1 ? '' : 's'} <KeyboardArrowDown sx={{ fontSize: 14 }}/></>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Inventory Tab — decision-support view */}
            {activeTab === 'inventory' && (() => {
              const inventoryEnriched = inventoryData.map(item => ({ ...item, risk: classifyInventoryRisk(item) }));
              const oosCount = inventoryEnriched.filter(i => i.status === 'out-of-stock').length;
              const lowCount = inventoryEnriched.filter(i => i.status === 'low').length;
              const delayedInboundCount = inventoryEnriched.filter(i => i.status === 'inbound' && i.inboundEta && /delay/i.test(i.inboundEta)).length;
              const totalAtRisk = inventoryEnriched.filter(i => i.risk === 'critical' || i.risk === 'at-risk').length;

              const filteredInventory = (inventoryView === 'at-risk'
                ? inventoryEnriched.filter(i => i.risk !== 'healthy')
                : inventoryEnriched
              ).slice().sort((a, b) => RISK_RANK[a.risk] - RISK_RANK[b.risk] || a.daysOfSupply - b.daysOfSupply);

              const criticalSkus = inventoryEnriched.filter(i => i.risk === 'critical');
              const insightLine = totalAtRisk === 0
                ? 'All SKUs are healthy. Maintain current replenishment cadence.'
                : `${totalAtRisk} SKU${totalAtRisk === 1 ? '' : 's'} need attention${criticalSkus.length > 0 ? ` — prioritize ${criticalSkus.slice(0, 2).map(s => s.name).join(' and ')}` : ''}${delayedInboundCount > 0 ? `; ${delayedInboundCount} inbound shipment${delayedInboundCount === 1 ? ' is' : 's are'} delayed` : ''}.`;
              const recommendation = criticalSkus.length > 0
                ? `Expedite replenishment for ${criticalSkus.length} OOS SKU${criticalSkus.length === 1 ? '' : 's'}${delayedInboundCount > 0 ? ` and follow up with DC on the ${delayedInboundCount} delayed shipment${delayedInboundCount === 1 ? '' : 's'}` : ''}.`
                : delayedInboundCount > 0
                  ? `Follow up with DC on ${delayedInboundCount} delayed shipment${delayedInboundCount === 1 ? '' : 's'} to prevent OOS escalation.`
                  : `Monitor low-DoS SKUs daily; trigger reorder when DoS drops below safety stock.`;

              return (
                <div className="sc-inventory-tab">
                  {/* Summary tiles */}
                  <div className="sc-inv-summary">
                    <div className="sc-inv-summary-tile sc-inv-summary--total">
                      <span className="sc-inv-summary-label">Total SKUs at Risk</span>
                      <span className="sc-inv-summary-value">{totalAtRisk}</span>
                      <span className="sc-inv-summary-sub">of {inventoryEnriched.length} tracked</span>
                    </div>
                    <div className="sc-inv-summary-tile sc-inv-summary--critical">
                      <span className="sc-inv-summary-label">Out of Stock</span>
                      <span className="sc-inv-summary-value">{oosCount}</span>
                      <span className="sc-inv-summary-sub">requires immediate action</span>
                    </div>
                    <div className="sc-inv-summary-tile sc-inv-summary--warn">
                      <span className="sc-inv-summary-label">Low Stock</span>
                      <span className="sc-inv-summary-value">{lowCount}</span>
                      <span className="sc-inv-summary-sub">below safety stock</span>
                    </div>
                    <div className="sc-inv-summary-tile sc-inv-summary--info">
                      <span className="sc-inv-summary-label">Delayed Inbound</span>
                      <span className="sc-inv-summary-value">{delayedInboundCount}</span>
                      <span className="sc-inv-summary-sub">shipments behind ETA</span>
                    </div>
                  </div>

                  {/* AI Insight banner */}
                  <div className="sc-inv-insight">
                    <div className="sc-inv-insight-icon"><AutoAwesomeOutlined sx={{ fontSize: 14 }}/></div>
                    <div className="sc-inv-insight-body">
                      <p className="sc-inv-insight-line">{insightLine}</p>
                      <p className="sc-inv-insight-rec"><strong>Recommended:</strong> {recommendation}</p>
                    </div>
                  </div>

                  {/* Toolbar with toggle */}
                  <div className="sc-inv-toolbar">
                    <div className="sc-inv-toolbar-title">
                      <InventoryOutlined sx={{ fontSize: 14 }}/>
                      <span>{inventoryView === 'at-risk' ? 'SKUs Needing Attention' : 'All SKUs'}</span>
                      <span className="sc-inv-count-badge">{filteredInventory.length}</span>
                    </div>
                    <div className="sc-inv-toggle">
                      <button
                        className={`sc-inv-toggle-btn ${inventoryView === 'at-risk' ? 'active' : ''}`}
                        onClick={() => setInventoryView('at-risk')}
                      >
                        <WarningAmberOutlined sx={{ fontSize: 12 }}/> At Risk
                      </button>
                      <button
                        className={`sc-inv-toggle-btn ${inventoryView === 'all' ? 'active' : ''}`}
                        onClick={() => setInventoryView('all')}
                      >
                        <PlaylistAddCheckOutlined sx={{ fontSize: 12 }}/> All SKUs
                      </button>
                    </div>
                  </div>

                  {filteredInventory.length === 0 ? (
                    <div className="sc-inv-empty">
                      <TaskAltOutlined sx={{ fontSize: 20 }}/>
                      <p>All SKUs are healthy — no action required.</p>
                    </div>
                  ) : (
                    <table className="sc-inv-table wow-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product</th>
                          <th>Risk</th>
                          <th>Status</th>
                          <th>Qty</th>
                          <th>Days of Supply</th>
                          <th>ETA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventory.map(item => (
                          <tr key={item.sku} className={`sc-inv-row sc-inv--${item.status} sc-inv-row--${item.risk}`}>
                            <td className="sc-inv-sku">{item.sku}</td>
                            <td>{item.name}</td>
                            <td>
                              <span className={`sc-inv-risk sc-inv-risk--${item.risk}`}>
                                {item.risk === 'critical' && <ErrorOutlined sx={{ fontSize: 11 }}/>}
                                {item.risk === 'at-risk' && <WarningAmberOutlined sx={{ fontSize: 11 }}/>}
                                {item.risk === 'watch' && <AccessTimeOutlined sx={{ fontSize: 11 }}/>}
                                {item.risk === 'healthy' && <TaskAltOutlined sx={{ fontSize: 11 }}/>}
                                {RISK_LABELS[item.risk]}
                              </span>
                            </td>
                            <td><span className={`sc-inv-status sc-inv-status--${item.status}`}>{item.status.replace('-', ' ')}</span></td>
                            <td className="sc-inv-qty">{item.quantity}</td>
                            <td className="sc-inv-dos">{item.daysOfSupply > 0 ? `${item.daysOfSupply}d` : '—'}</td>
                            <td className="sc-inv-eta">{item.inboundEta || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })()}

            {/* Benchmarking Tab — relative performance intelligence */}
            {activeTab === 'benchmarking' && (() => {
              const benchmarks = getBenchmarks();
              const fmtDelta = (v: number, unit?: string) => (v >= 0 ? '+' : '') + (Math.abs(v) % 1 !== 0 ? v.toFixed(1) : v.toFixed(0)) + (unit && unit !== '/100' && unit !== '/5' ? unit : '');
              const quartileLabel = (q: number) => q === 1 ? 'Top 25%' : q === 2 ? '2nd Quartile' : q === 3 ? '3rd Quartile' : 'Bottom 25%';

              // Overall rank = average of metric ranks
              const avgRank = Math.round(benchmarks.reduce((s, b) => s + b.rank, 0) / benchmarks.length);
              const avgRankDelta = Math.round(benchmarks.reduce((s, b) => s + b.rankDelta, 0) / benchmarks.length);
              const overallQuartile = avgRank <= Math.ceil(clusterSize * 0.25) ? 1
                : avgRank <= Math.ceil(clusterSize * 0.5) ? 2
                  : avgRank <= Math.ceil(clusterSize * 0.75) ? 3 : 4;

              const sortedByRank = benchmarks.slice().sort((a, b) => a.rank - b.rank);
              const topStrengths = sortedByRank.slice(0, 2);
              const biggestGaps = sortedByRank.slice().reverse().slice(0, 2);

              // Callout: does the cluster-wide rank tell a different story than the district rank?
              const districtRank = store.rank;
              const districtTotal = store.totalStores;
              const compRankDiffersDistrict = avgRank !== districtRank;
              const compBetterThanDistrict = avgRank < districtRank;

              return (
                <div className="sc-bench-tab">
                  {/* District vs Chain-Wide Rank callout — visible whenever the two ranks differ */}
                  {compRankDiffersDistrict && (
                    <div className={`sc-bench-rank-callout ${compBetterThanDistrict ? 'sc-bench-rank-callout--positive' : 'sc-bench-rank-callout--amber'}`}>
                      <span className="sc-bench-callout-icon">ℹ</span>
                      <div className="sc-bench-callout-body">
                        <strong>
                          {compBetterThanDistrict
                            ? `Strong chain-wide cluster performance — ranks higher across peers than within district`
                            : `District rank and cluster-wide rank diverge`}
                        </strong>
                        <span>
                          {store.name} is <strong>#{districtRank} of {districtTotal}</strong> in District 14 by DPI, but ranks <strong>#{avgRank} of {clusterSize}</strong> among {clusterConfig.label} peers chain-wide.
                          {' '}The cluster ranking compares execution across all {clusterConfig.label} stores regardless of district, and reflects a broader competitive peer set.
                          {compBetterThanDistrict
                            ? ` This store performs better chain-wide than its district position suggests — a strong signal.`
                            : ` Some district peers in other clusters outperform this store chain-wide — there is room to close the gap.`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Overall Summary — clean KPI strip (matches Inventory & Inbound pattern) */}
                  <div className="sc-bench-summary-strip">
                    {/* Cluster Rank tile */}
                    <div className="sc-bench-tile sc-bench-tile--rank">
                      <span className="sc-bench-tile-label sc-bench-tile-label--primary">Overall Cluster Rank</span>
                      <div className="sc-bench-tile-value">
                        <span className="sc-bench-rank-num">#{avgRank}</span>
                        <span className="sc-bench-rank-of">of {clusterSize}</span>
                      </div>
                      <span className="sc-bench-tile-sub">
                        {quartileLabel(overallQuartile)}
                        <span className="sc-bench-tile-sub-sep">·</span>
                        {avgRankDelta > 0
                          ? `↑ ${avgRankDelta} vs last period`
                          : avgRankDelta < 0
                            ? `↓ ${Math.abs(avgRankDelta)} vs last period`
                            : 'No change vs last period'}
                      </span>
                    </div>

                    {/* Top Strengths tile */}
                    <div className="sc-bench-tile sc-bench-tile--strengths">
                      <span className="sc-bench-tile-label sc-bench-tile-label--success">Top Strengths</span>
                      <div className="sc-bench-tile-list">
                        {topStrengths.map(s => (
                          <div key={s.metric} className="sc-bench-tile-row">
                            <span className="sc-bench-tile-row-rank">#{s.rank}</span>
                            <span className="sc-bench-tile-row-metric" title={s.metric}>{s.metric}</span>
                            <span className="sc-bench-tile-row-badge">
                              <Badge
                                label={quartileLabel(s.quartile)}
                                color={s.quartile === 1 ? 'success' : s.quartile === 2 ? 'primary' : 'warning'}
                                variant="subtle"
                                size="small"
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Biggest Gaps tile */}
                    <div className="sc-bench-tile sc-bench-tile--gaps">
                      <span className="sc-bench-tile-label sc-bench-tile-label--warning">Biggest Gaps</span>
                      <div className="sc-bench-tile-list">
                        {biggestGaps.map(g => (
                          <div key={g.metric} className="sc-bench-tile-row">
                            <span className="sc-bench-tile-row-rank">#{g.rank}</span>
                            <span className="sc-bench-tile-row-metric" title={g.metric}>{g.metric}</span>
                            <span className="sc-bench-tile-row-badge">
                              <Badge
                                label={quartileLabel(g.quartile)}
                                color={g.quartile === 3 ? 'warning' : 'error'}
                                variant="subtle"
                                size="small"
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Distribution legend */}
                  <div className="sc-bench-legend">
                    <span className="sc-bench-legend-item"><span className="sc-legend-dot sc-legend-dot--store" />This Store</span>
                    <span className="sc-bench-legend-item"><span className="sc-legend-tick sc-legend-tick--cluster" />Cluster Median</span>
                    <span className="sc-bench-legend-item"><span className="sc-legend-tick sc-legend-tick--chain" />Chain Median</span>
                    <span className="sc-bench-legend-item"><span className="sc-legend-range" />Cluster Range</span>
                  </div>

                  {/* Benchmark cards — Impact UI Card per metric */}
                  <div className="sc-bench-cards">
                    {benchmarks.map(b => {
                      const range = Math.max(0.0001, b.clusterMax - b.clusterMin);
                      const storePct = Math.max(0, Math.min(100, ((b.storeVal - b.clusterMin) / range) * 100));
                      const clusterMedPct = Math.max(0, Math.min(100, ((b.clusterMedian - b.clusterMin) / range) * 100));
                      const chainPct = Math.max(0, Math.min(100, ((b.chainAvg - b.clusterMin) / range) * 100));
                      const ahead = b.vsCluster >= 0;
                      const rankMoveDir = b.rankDelta > 0 ? 'up' : b.rankDelta < 0 ? 'down' : 'flat';
                      const quartileAccent =
                        b.quartile === 1 ? 'var(--ia-color-success)' :
                        b.quartile === 2 ? 'var(--ia-color-primary)' :
                        b.quartile === 3 ? 'var(--ia-color-warning)' :
                        'var(--ia-color-error-strong)';

                      return (
                        <Card
                          key={b.metric}
                          size="extraSmall"
                          sx={{
                            maxWidth: '100%',
                            minHeight: 0,
                            padding: '14px 16px',
                            borderTop: `3px solid ${quartileAccent}`,
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0',
                          }}
                        >
                          <div className="sc-bench-card-header">
                            <span className="sc-bench-metric">{b.metric}</span>
                            <Badge
                              label={`${b.quartile === 1 ? '🏆 ' : ''}${quartileLabel(b.quartile)}`}
                              color={b.quartile === 1 ? 'success' : b.quartile === 2 ? 'primary' : b.quartile === 3 ? 'warning' : 'error'}
                              variant="subtle"
                              size="small"
                            />
                          </div>

                          {/* Rank hero */}
                          <div className="sc-bench-rank-row">
                            <div className="sc-bench-rank-block">
                              <span className="sc-bench-rank-num-md">#{b.rank}</span>
                              <span className="sc-bench-rank-of">of {b.rankTotal}</span>
                            </div>
                            <Badge
                              label={b.rankDelta > 0 ? `↑ ${b.rankDelta}` : b.rankDelta < 0 ? `↓ ${Math.abs(b.rankDelta)}` : '—'}
                              color={rankMoveDir === 'up' ? 'success' : rankMoveDir === 'down' ? 'error' : 'default'}
                              variant="subtle"
                              size="small"
                            />
                          </div>

                          {/* Gap deltas */}
                          <div className="sc-bench-gaps">
                            <div className="sc-bench-gap-row">
                              <span className="sc-bench-gap-label">Gap vs Cluster</span>
                              <Badge
                                label={`${ahead ? '↑' : '↓'} ${fmtDelta(b.vsCluster, b.unit)}`}
                                color={ahead ? 'success' : 'error'}
                                variant="subtle"
                                size="small"
                              />
                            </div>
                            <div className="sc-bench-gap-row">
                              <span className="sc-bench-gap-label">Gap vs Chain</span>
                              <Badge
                                label={`${b.vsChain >= 0 ? '↑' : '↓'} ${fmtDelta(b.vsChain, b.unit)}`}
                                color={b.vsChain >= 0 ? 'success' : 'error'}
                                variant="subtle"
                                size="small"
                              />
                            </div>
                          </div>

                          {/* Distribution bar — kept custom (no Impact UI equivalent) */}
                          <div className="sc-bench-dist">
                            <div className="sc-bench-dist-track">
                              <div className="sc-bench-dist-range" />
                              <div className="sc-bench-dist-tick sc-bench-dist-tick--chain" style={{ left: `${chainPct}%` }} title={`Chain Median: ${b.chainAvg}${b.unit}`} />
                              <div className="sc-bench-dist-tick sc-bench-dist-tick--cluster" style={{ left: `${clusterMedPct}%` }} title={`Cluster Median: ${b.clusterMedian}${b.unit}`} />
                              <div className={`sc-bench-dist-store sc-bench-dist-store--${ahead ? 'ahead' : 'behind'}`} style={{ left: `${storePct}%` }} />
                            </div>
                            <div className="sc-bench-dist-axis">
                              <span>{b.clusterMin}{b.unit}</span>
                              <span>{b.clusterMax}{b.unit}</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>

      {/* ── SM Broadcast Detail Panel (right slide-in, mirrors DM Home) ── */}
      {smBroadcastPanel && (() => {
        const { source, broadcast: b, fullMessage, scope, keyDates, actionItems, attachments } = smBroadcastPanel;
        const priorityClass = b.priority.toLowerCase();
        const senderInitials = b.sender.split(/[ ·]+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const senderRole = source === 'HQ' ? 'HQ' : 'District Manager';
        return (
          <>
            <div className="detail-panel-overlay" onClick={() => setSmBroadcastPanel(null)} />
            <div className="detail-panel">
              <div className="detail-panel-header">
                <button className="detail-panel-close" onClick={() => setSmBroadcastPanel(null)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
              <div className="detail-panel-body">
                <div className="dp-severity-row">
                  <span className={`dp-priority-badge ${priorityClass}`}>{b.priority}</span>
                  <span className="dp-category-badge">{b.category}</span>
                </div>
                <h2 className="dp-title">{b.title}</h2>
                <div className="dp-broadcast-message">
                  {fullMessage.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                {scope && (
                  <div className="dp-scope-row">
                    <GroupOutlined sx={{ fontSize: 13 }}/>
                    <span>{scope}</span>
                  </div>
                )}
                {keyDates.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <CalendarTodayOutlined sx={{ fontSize: 14 }}/>
                      Key Dates
                    </h3>
                    <div className="dp-key-dates">
                      {keyDates.map((kd, i) => (
                        <div key={i} className="dp-key-date-item">
                          <span className="dp-kd-label">{kd.label}</span>
                          <span className="dp-kd-date">{kd.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {actionItems.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <TaskAltOutlined sx={{ fontSize: 14 }}/>
                      Required Actions ({actionItems.length})
                    </h3>
                    <div className="dp-action-checklist">
                      {actionItems.map((ai, i) => (
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
                {attachments.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <DescriptionOutlined sx={{ fontSize: 14 }}/>
                      Attachments ({attachments.length})
                    </h3>
                    <div className="dp-attachments">
                      {attachments.map((att, i) => (
                        <div key={i} className="dp-attachment-item">
                          <div className={`dp-attachment-icon ${att.type}`}>
                            <DescriptionOutlined sx={{ fontSize: 14 }}/>
                          </div>
                          <span className="dp-attachment-name">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="dp-section">
                  <h3 className="dp-section-title">Source</h3>
                  <div className="dp-broadcast-source">
                    <div className="dp-source-avatar">{senderInitials}</div>
                    <div className="dp-source-info">
                      <span className="dp-source-name">{b.sender}</span>
                      <span className="dp-source-role">{senderRole}</span>
                    </div>
                    <span className="dp-source-time">
                      <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                      {formatSMBroadcastTime(b.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Trend Modal ──────────────────────────────────── */}
      {trendModal && (
        <div className="sc-modal-overlay" onClick={() => setTrendModal(null)}>
          <div className="sc-modal" onClick={e => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div className="sc-modal-title-row">
                {trendModal.icon}
                <h3>{trendModal.label} — {calendarMode === 'week' ? '12-Week' : calendarMode === 'month' ? '7-Month' : '4-Quarter'} Trend</h3>
              </div>
              <button className="sc-modal-close" onClick={() => setTrendModal(null)}><CloseOutlined sx={{ fontSize: 18 }}/></button>
            </div>
            <div className="sc-modal-body">
              <div className="sc-trend-chart">
                {(() => {
                  const n = trendModal.trendData.length;
                  const padL = 50, padR = 30;
                  const spacing = 60;
                  const chartW = padL + (n - 1) * spacing + padR;
                  const color = trendModal.status === 'positive' ? 'var(--ia-color-success)' : trendModal.status === 'negative' ? 'var(--ia-color-error)' : 'var(--ia-color-primary)';
                  const min = Math.min(...trendModal.trendData) * 0.95;
                  const max = Math.max(...trendModal.trendData) * 1.05;
                  const range = max - min || 1;
                  const pts = trendModal.trendData.map((v, i) => ({
                    x: padL + i * spacing,
                    y: 155 - ((v - min) / range) * 130,
                    v,
                  }));
                  return (
                    <svg viewBox={`0 0 ${chartW} 190`} className="sc-trend-svg">
                      {[0, 1, 2, 3, 4].map(i => (
                        <line key={i} x1={padL - 10} y1={20 + i * 35} x2={chartW - padR + 10} y2={20 + i * 35} stroke="#f1f5f9" strokeWidth="1" />
                      ))}
                      <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                      />
                      {pts.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="#64748b">{p.v}</text>
                        </g>
                      ))}
                      {trendModal.trendLabels.map((label, i) => (
                        <text key={i} x={padL + i * spacing} y={182} textAnchor="middle" fontSize="10" fill="#94a3b8">{label}</text>
                      ))}
                    </svg>
                  );
                })()}
              </div>
              <div className="sc-trend-insight">
                <AutoAwesomeOutlined sx={{ fontSize: 14 }}/>
                <span>{trendModal.insight}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Audit Week Detail Modal ──────────────────────── */}
      {auditWeekDetail && (
        <div className="sc-modal-overlay" onClick={() => setAuditWeekDetail(null)}>
          <div className="sc-modal sc-modal--audit" onClick={e => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div className="sc-modal-title-row">
                <AssignmentTurnedInOutlined sx={{ fontSize: 18 }}/>
                <h3>Audit Detail — {auditWeekDetail.weekLabel} ({auditWeekDetail.date})</h3>
              </div>
              <button className="sc-modal-close" onClick={() => setAuditWeekDetail(null)}><CloseOutlined sx={{ fontSize: 18 }}/></button>
            </div>
            <div className="sc-modal-body">
              <div className="sc-audit-detail-grid">
                {(['safety', 'planogram', 'signage', 'cleanliness', 'availability', 'staffing', 'stockRotation', 'pricing', 'backroom', 'customerArea'] as const).map(cat => {
                  const val = auditWeekDetail[cat];
                  const label = cat === 'stockRotation' ? 'Stock Rotation' : cat === 'customerArea' ? 'Customer Area' : cat.charAt(0).toUpperCase() + cat.slice(1);
                  return (
                    <div key={cat} className="sc-audit-detail-card">
                      <div className="sc-audit-detail-bar" style={{ background: getComplianceColor(val), width: `${val}%` }} />
                      <div className="sc-audit-detail-info">
                        <span className="sc-audit-detail-cat">{label}</span>
                        <span className="sc-audit-detail-val" style={{ color: getComplianceTextColor(val) }}>{val}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sc-audit-overall-row">
                <span>Overall Score</span>
                <span className="sc-audit-overall-val" style={{ color: getComplianceTextColor(auditWeekDetail.overall) }}>{auditWeekDetail.overall}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Right-Side Detail Panel (mirrors District Intelligence) ── */}
      {activeKPIPanel && (() => {
        const td = activeKPIPanel.trendData || [];
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
                <div className="dp-severity-row">
                  <span className={`dp-severity-badge ${activeKPIPanel.status === 'negative' ? 'critical' : activeKPIPanel.status === 'warning' ? 'warning' : 'risk'}`}>
                    {activeKPIPanel.category.toUpperCase()}
                  </span>
                  <span className="dp-source">
                    <BarChartOutlined sx={{ fontSize: 11 }}/>
                    52-Week Trend
                  </span>
                </div>

                <h2 className="dp-title">{activeKPIPanel.label}</h2>
                <p className="dp-description">
                  Current: <strong>{activeKPIPanel.primaryValue}</strong>{activeKPIPanel.primaryUnit ? ` ${activeKPIPanel.primaryUnit}` : ''}
                  {activeKPIPanel.microInsight && <> · {activeKPIPanel.microInsight}</>}
                </p>

                {/* Period vs YoY */}
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <BarChartOutlined sx={{ fontSize: 14 }}/>
                    Period Comparison
                  </h3>
                  <div className="kpi-period-metrics">
                    <div className="kpi-period-metric">
                      <span className="kpi-period-label">YoY</span>
                      <span className={`kpi-period-val delta-${activeKPIPanel.deltaDirection || 'flat'}`}>
                        {activeKPIPanel.deltaDirection === 'up' && <NorthEast sx={{ fontSize: 14 }}/>}
                        {activeKPIPanel.deltaDirection === 'down' && <SouthEast sx={{ fontSize: 14 }}/>}
                        {activeKPIPanel.delta}
                      </span>
                      <span className="kpi-period-sub">{activeKPIPanel.deltaContext || 'Year over Year'}</span>
                    </div>
                    {td.length >= 2 && (() => {
                      const curr = td[td.length - 1];
                      const prev = td[td.length - 2];
                      const diff = curr - prev;
                      const dir: 'up' | 'down' | 'flat' = Math.abs(diff) < 0.01 ? 'flat' : diff > 0 ? 'up' : 'down';
                      return (
                        <div className="kpi-period-metric">
                          <span className="kpi-period-label">WoW</span>
                          <span className={`kpi-period-val delta-${dir}`}>
                            {dir === 'up' && <NorthEast sx={{ fontSize: 14 }}/>}
                            {dir === 'down' && <SouthEast sx={{ fontSize: 14 }}/>}
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                          </span>
                          <span className="kpi-period-sub">vs prior week</span>
                        </div>
                      );
                    })()}
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
                          <linearGradient id={`sc-kpi-grad-${activeKPIPanel.id}`} x1="0" y1="0" x2="0" y2="1">
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
                              <path d={areaPath} fill={`url(#sc-kpi-grad-${activeKPIPanel.id})`} />
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

                {/* Key Details */}
                {activeKPIPanel.panelDetails && activeKPIPanel.panelDetails.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <AssignmentTurnedInOutlined sx={{ fontSize: 14 }}/>
                      Key Details
                    </h3>
                    <div className="kpi-panel-details">
                      {activeKPIPanel.panelDetails.map((d, i) => (
                        <div key={i} className={`kpi-panel-detail-row status-${d.status || 'neutral'}`}>
                          <span className="kpi-panel-detail-label">{d.label}</span>
                          <span className="kpi-panel-detail-value">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="dp-timestamp">
                  <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                  <span>Updated just now · Showing weekly comparison</span>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Audit Cell Right-Side Detail Panel (mirrors DI heatmap detail) ── */}
      {auditCellDetail && (() => {
        const d = auditCellDetail;
        const accent = d.score >= 90 ? 'var(--ia-color-success)' : d.score >= 75 ? 'var(--ia-color-warning-text)' : 'var(--ia-color-error-strong)';
        const panelAuditors = ['Sarah Chen', 'John Martinez', 'Emily Davis', 'James Wilson', 'Maria Lopez'];
        const seed = (d.category.length * 7 + d.weekLabel.length * 3) || 1;
        // 12-week score history
        const history: number[] = [];
        for (let i = 0; i < 12; i++) {
          const t = i / 11;
          const trendOffset = d.trend === 'improving' ? -8 * (1 - t) : d.trend === 'declining' ? 8 * (1 - t) : 0;
          const jitter = ((seed * (i + 1)) % 7) - 3;
          history.push(Math.max(40, Math.min(100, Math.round(d.score + trendOffset + jitter))));
        }
        history[history.length - 1] = d.score;
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
        const recommendation = d.score >= 90
          ? `${d.category} performance is strong at ${d.score}%. Maintain SOP cadence and codify the playbook for peer-store knowledge sharing.`
          : d.score >= 75
            ? `${d.category} at ${d.score}% — ${d.findings.length} findings. Address top 2 in the next audit cycle to lift score above 90%.`
            : `${d.category} is critical at ${d.score}%. Trigger immediate corrective actions on all ${d.findings.length} findings; assign owner and SLA today.`;
        // Prior audits — synthesize 4 historical entries
        const priorAuditDates = ['1 week ago', '2 weeks ago', '4 weeks ago', '8 weeks ago'];
        const priors = priorAuditDates.map((date, i) => {
          const drift = d.trend === 'improving' ? -(i + 1) * 2 : d.trend === 'declining' ? (i + 1) * 2 : 0;
          const jitter2 = ((seed * (i + 3)) % 5) - 2;
          return {
            date,
            score: Math.max(40, Math.min(100, d.score + drift + jitter2)),
            auditor: panelAuditors[(seed + i) % panelAuditors.length],
          };
        });
        return (
          <>
            <div className="detail-panel-overlay" onClick={() => setAuditCellDetail(null)} />
            <div className="detail-panel">
              <div className="detail-panel-header">
                <button className="detail-panel-close" onClick={() => setAuditCellDetail(null)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
              <div className="detail-panel-body">
                <div className="dp-severity-row">
                  <span
                    className="dp-severity-badge"
                    style={{ background: getComplianceColor(d.score), color: getComplianceTextColor(d.score) }}
                  >
                    {d.score}% COMPLIANCE
                  </span>
                  <span className="dp-source">
                    <AssignmentTurnedInOutlined sx={{ fontSize: 11 }}/>
                    8-Week Audit Lens
                  </span>
                </div>

                <h2 className="dp-title">{d.category} Audit</h2>
                <p className="dp-description">
                  #{store.number} — {store.name} · Week of {d.weekDate} ({d.weekLabel}) · Auditor: {priors[0].auditor}
                </p>

                <div className="dp-impact-summary">
                  {d.trend === 'improving' && <TrendingUpOutlined sx={{ fontSize: 14 }}/>}
                  {d.trend === 'declining' && <TrendingDownOutlined sx={{ fontSize: 14 }}/>}
                  {d.trend === 'stable' && <Remove sx={{ fontSize: 14 }}/>}
                  <span>Trend: {d.trend.charAt(0).toUpperCase() + d.trend.slice(1)}</span>
                </div>

                {/* Performance Comparison */}
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <BarChartOutlined sx={{ fontSize: 14 }}/>
                    Performance Comparison
                  </h3>
                  <div className="kpi-period-metrics">
                    <div className="kpi-period-metric">
                      <span className="kpi-period-label">This Store</span>
                      <span className="kpi-period-val">{d.score}%</span>
                      <span className="kpi-period-sub">current score</span>
                    </div>
                    <div className="kpi-period-metric">
                      <span className="kpi-period-label">District Avg</span>
                      <span className="kpi-period-val">{Math.round(history.slice(-8).reduce((a, b) => a + b, 0) / 8)}%</span>
                      <span className={`kpi-period-sub delta-${d.score >= Math.round(history.slice(-8).reduce((a, b) => a + b, 0) / 8) ? 'up' : 'down'}`}>
                        {d.score - Math.round(history.slice(-8).reduce((a, b) => a + b, 0) / 8) > 0 ? '+' : ''}{d.score - Math.round(history.slice(-8).reduce((a, b) => a + b, 0) / 8)} pts vs district
                      </span>
                    </div>
                    <div className="kpi-period-metric">
                      <span className="kpi-period-label">Top Performer</span>
                      <span className="kpi-period-val">{max}%</span>
                      <span className="kpi-period-sub">{max - d.score} pts to close gap</span>
                    </div>
                    <div className="kpi-period-metric">
                      <span className="kpi-period-label">Target</span>
                      <span className="kpi-period-val">95%</span>
                      <span className={`kpi-period-sub delta-${d.score >= 95 ? 'up' : 'down'}`}>
                        {d.score >= 95 ? 'on target' : `${95 - d.score} pts below`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score History */}
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <ShowChartOutlined sx={{ fontSize: 14 }}/>
                    Score History (12 weeks)
                  </h3>
                  <div className="kpi-panel-chart">
                    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
                      <defs>
                        <linearGradient id={`sc-hm-grad-${d.weekLabel.replace(/\s+/g, '-')}-${d.category.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
                          <stop offset="100%" stopColor={accent} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill={`url(#sc-hm-grad-${d.weekLabel.replace(/\s+/g, '-')}-${d.category.replace(/\s+/g, '-')})`} />
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

                {/* Prior Audits */}
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

                {/* Findings */}
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <ErrorOutlined sx={{ fontSize: 14 }}/>
                    Findings ({d.findings.length})
                  </h3>
                  <div className="dp-stores-list">
                    {d.findings.map((finding, idx) => (
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
                    <p>{recommendation}</p>
                  </div>
                </div>

                {/* Action Plan */}
                {d.findings.length > 0 && (
                  <div className="dp-section">
                    <h3 className="dp-section-title">
                      <TaskAltOutlined sx={{ fontSize: 14 }}/>
                      Action Plan
                    </h3>
                    <div className="hm-action-plan">
                      {d.findings.map((finding, idx) => {
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

                {/* Ask Alan skill */}
                <div className="dp-section">
                  <h3 className="dp-section-title">
                    <ShowChartOutlined sx={{ fontSize: 14 }}/>
                    Ask Alan skill
                  </h3>
                  <div className="kpi-panel-detail-row status-neutral">
                    <span className="kpi-panel-detail-label">
                      {d.skill === 'pog' ? 'POG' : d.skill === 'knowledge' ? 'Knowledge' : d.skill === 'actions' ? 'Action' : 'Analytics'}
                    </span>
                    <span
                      className="kpi-panel-detail-value"
                      style={{ fontWeight: 'var(--ia-font-weight-medium)', fontSize: 'var(--ia-text-2xs)', color: 'var(--ia-color-text-secondary)' }}
                    >
                      {d.skillLogic}
                    </span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="dp-actions">
                  <button className="dp-action-btn outlined" onClick={() => {
                    setAuditCellDetail(null);
                    openAskAlan({
                      heatmapAudit: {
                        skill: d.skill as import('../types').AskAlanSkillMode,
                        context: `audit-${d.category.toLowerCase().replace(/ /g, '-')}`,
                        storeNumber: String(store.number),
                        storeName: store.name,
                        score: d.score,
                      },
                    });
                  }}>
                    <AutoAwesomeOutlined sx={{ fontSize: 14 }}/>
                    <span>Ask Alan</span>
                  </button>
                  <button className="dp-action-btn outlined navigate" onClick={() => {
                    setAuditCellDetail(null);
                    navigate(`/store-operations/store-deep-dive?store=${store.number}&name=${encodeURIComponent(store.name)}`);
                  }}>
                    <span>View Store Deep Dive</span>
                    <OpenInNewOutlined sx={{ fontSize: 14 }}/>
                  </button>
                </div>

                <div className="dp-timestamp">
                  <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                  <span>Last audit: {d.weekDate}</span>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

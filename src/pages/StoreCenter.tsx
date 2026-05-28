import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
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
import SyncOutlined from '@mui/icons-material/SyncOutlined';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import LaunchOutlined from '@mui/icons-material/LaunchOutlined';
import { Button, Badge, Chips, Card, Tabs, Tooltip, Tag } from 'impact-ui';
import { ImFilterSelect } from '../components/common/ImFilterSelect';
import { AIDailyBrief, AIDailyBriefData } from '../components/common/AIDailyBrief';
import { useAuth } from '../context/AuthContext';
import { useExecutionTasks } from '../context/ExecutionTasksContext';
import { openAskAlan } from '../utils/openAskAlan';
import './StoreCenter.css';
// Reuses detail-panel/dp-* styles for the SM broadcast detail panel
import './StoreOpsHome.css';
import './DistrictIntelligence.css';

// ── Alert Bucket Types ──────────────────────────────────
type TaskStatusType = 'open' | 'in-progress' | 'overdue' | 'escalated' | 'resolved' | 'dismissed';

interface AlertIssueRow {
  id: string;
  itemName: string;
  sku: string;
  department: string;
  subDepartment: string;
  itemClass: string;
  store: string;
  aisle?: string;
  bay?: string;
  issue: string;
  bohQty: number;
  shelfQty: number;
  weeklyOpportunity?: number;
  /** Phantom Stock: min(on-hand, expected weekly demand) × ASP; null = no demand signal */
  recoveryEstimate?: number | null;
  zeroSalesDays?: number;
  confidenceScore?: number;
  // Automated task fields
  taskStatus: TaskStatusType;
  taskOwner: string;
  dueDate: string;
  slaBreached: boolean;
  isEscalated: boolean;
  isAcknowledged: boolean;
  recommendedAction: string;
  signalBreakdown: string;
  evidence: string;
}

type AlertBucketType = 'boh-sync' | 'phantom-stock' | 'pog-compliance';
type AlertPriority = 'High' | 'Medium' | 'Low';

interface AlertMetric { label: string; value: string; tooltip?: string }

const PHANTOM_RECOVERY_TOOLTIP =
  'Estimated sales that may be recovered if phantom stock is resolved. Since current sales are zero, this is calculated using historical demand, forecasted demand, or similar-store performance — not current sales.';

function phantomSkuRecovery(
  onHand: number,
  expectedWeeklyDemand?: number,
  avgPrice?: number,
): number | null {
  if (!expectedWeeklyDemand || expectedWeeklyDemand <= 0 || !avgPrice || avgPrice <= 0) return null;
  return Math.min(onHand, expectedWeeklyDemand) * avgPrice;
}

function formatPhantomRecoveryTotal(total: number | null): string {
  if (total == null || total <= 0) return 'Recovery estimate unavailable';
  if (total >= 1000) return `$${(total / 1000).toFixed(1)}K`;
  return `$${Math.round(total)}`;
}

interface AlertBucket {
  id: AlertBucketType;
  name: string;
  shortDesc: string;
  fullDesc: string;
  priority: AlertPriority;
  category: string;
  metrics: AlertMetric[];
  issues: AlertIssueRow[];
  autoTaskCount: number;
  openTaskCount: number;
  overdueCount: number;
  lastUpdated: string;
}

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
  manager: string;
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
  quantity: number;       // Store on-hand (floor + backroom)
  onOrder: number;        // Units ordered from DC, not yet shipped
  inTransit: number;      // Units shipped from DC, not yet received
  daysOfSupply: number;   // Used to derive FWOS = daysOfSupply / 7
  inboundEta?: string;    // Expected arrival for in-transit units
  department: string;
  subDept: string;
  itemClass: string;
  brand: string;
}

// ── Store-level AI Daily Brief — tier-aware narrative ──────────
const getStoreBrief = (store: StoreMeta): AIDailyBriefData => {
  const isExcellent = store.dpi >= 88;
  const isStable = store.dpi >= 78 && store.dpi < 88;
  const isAtRisk = store.dpi >= 65 && store.dpi < 78;

  const vsLY = store.dpi >= 88 ? '+6.2%' : store.dpi >= 78 ? '–0.8%' : store.dpi >= 65 ? '–7.4%' : '–16.8%';
  const vsPlan = store.dpi >= 88 ? '+8.4%' : store.dpi >= 78 ? '+1.2%' : store.dpi >= 65 ? '–3.8%' : '–12.4%';
  const convRate = store.dpi >= 88 ? '28.4%' : store.dpi >= 78 ? '24.6%' : store.dpi >= 65 ? '21.1%' : '17.4%';
  const convYoY = store.dpi >= 88 ? '+1.8pp' : store.dpi >= 78 ? 'flat' : store.dpi >= 65 ? '–2.1pp' : '–5.8pp';
  const basketSize = store.dpi >= 88 ? '$62.40 (+4.2% YoY)' : store.dpi >= 78 ? '$56.10 (+3.5% YoY)' : store.dpi >= 65 ? '$52.40 (flat YoY)' : '$48.20 (–15.3% over 4 wks)';
  const transactions = store.dpi >= 88 ? '3,820' : store.dpi >= 78 ? '2,810' : store.dpi >= 65 ? '1,940' : '1,420';
  const gmRate = store.dpi >= 88 ? '38.2% (+0.8pp vs plan)' : store.dpi >= 78 ? '35.1% (–0.7pp vs plan)' : store.dpi >= 65 ? '32.1% (–3.7pp vs plan)' : '28.6% (–9.2pp vs plan)';

  if (isExcellent) {
    return {
      greeting: `${store.name} (#${store.number}) delivered a standout week — SPI ${store.dpi}, #${store.rank} of ${store.totalStores} in the district. Net sales beat plan by +8.4% driven by Summer 2 floorset execution and favorable weekend weather. Here is your full weekly business recap.`,
      sections: [
        {
          title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
          icon: 'scorecard',
          bullets: [
            `<strong>vs Plan:</strong> Net sales <strong>${vsPlan} above plan</strong>. Units sold +6.1%. Gross margin <strong>${gmRate}</strong>. Markdown rate 10.8% — within the 12% plan cap.`,
            `<strong>vs Last Year (LY):</strong> Net sales <strong>${vsLY} vs LY</strong>. Traffic up +4.2% YoY. Conversion improved to <strong>${convRate}</strong> (${convYoY}). Average basket size ${basketSize}.`,
            '<strong>vs AI Forecast:</strong> +5.3% above demand forecast — model was conservative on Dresses given last year\'s weather miss; actual warm weekend delivered the upside.',
            `<strong>vs Comparable Week (52-wk prior):</strong> <strong>+7.8% net-comp</strong> — strong like-for-like performance. District rank: <strong>#${store.rank} of ${store.totalStores} stores</strong>. Revenue contribution: 17.8% of total district weekly revenue.`,
          ],
        },
        {
          title: 'Traffic & Conversion Analysis',
          icon: 'traffic',
          bullets: [
            `Total transactions: <strong>${transactions} this week</strong> (+4.2% YoY). Peak day was Saturday (+22% vs Monday baseline) driven by warm weather and Semi Annual Sale awareness.`,
            `Conversion rate: <strong>${convRate}</strong> — strongest in the district. Fitting room utilization 74% during 12–3pm with minimal wait times (VoC confirms near-zero queue complaints).`,
            'Units per transaction (UPT): <strong>2.8</strong> (+0.3 vs LY). Multi-item basket attach rates improved — the Summer 2 Dress + Accessories cross-sell Endcap setup is driving multi-item conversions.',
            `Average transaction value (ATV): <strong>${basketSize.split(' ')[0]}</strong> — premium SKU attach (Blazer, Midi Dress) increasing as these items are at eyeline per current planogram spec.`,
          ],
        },
        {
          title: 'External Context — Weather, Events & Market Factors',
          icon: 'external',
          bullets: [
            '<strong>Weather:</strong> Saturday and Sunday were <strong>3°F above seasonal average</strong> — warm and sunny. Dresses lifted +22% Saturday vs Thursday baseline. Weather-sensitive categories outperformed forecast by 18%. The fully completed Summer 2 floorset amplified the weather benefit — peer stores with partial sets underperformed despite the same conditions.',
            '<strong>Semi Annual Sale:</strong> Estimated <strong>+$9,200 incremental revenue</strong> (AI attribution vs non-sale baseline). Clearance endcap generated 14% of transactions while occupying 8% of floor space — strong efficiency ratio.',
            '<strong>Local Events:</strong> Graduation weekend in Nashville metro added an estimated 8–12% Saturday AM foot traffic lift. Formal-adjacent purchases (Blazer, Midi Dress, accessories) spiked +31% Saturday vs Tuesday average.',
            'No negative external factors this week — no weather disruptions, no competitive promotions detected in the trade area.',
          ],
        },
        {
          title: "Product Performance — Division & Department Breakdown",
          icon: 'product',
          bullets: [
            '<strong>Women\'s Division (+14.2% vs plan — division leader):</strong> Dresses: +22% — Summer Midi Dress was the #1 SKU this week (98 units, $4,802). Tops/Basics: +8.1% (V-Neck at 64 units). Accessories: –4.1% — only division below plan; facing count gap on Endcap is the fix.',
            '<strong>Men\'s Division (+6.8% vs plan):</strong> Denim Slim Fit Dark Wash: 47 units ($2,303). Polo Classic: 38 units. Compression Tee: 29 units. Consistent performance across all Men\'s subcategories.',
            '<strong>Kids (+3.2% vs plan):</strong> Color Block Tee and Cargo Shorts leading. Kids Party Dress lagging — size-run gaps (XS, 4T) limiting conversion. Request DC dispatch this week.',
            '<strong>Footwear (+11.4% vs plan):</strong> Running Shoes Elite: 28 units (#2 overall SKU). Canvas Sneakers: 22 units. Strong week across all footwear styles.',
            '<strong>Accessories (–4.1% vs plan):</strong> The only miss. Endcap at 4 facings vs the 6-facing POG spec — 33% fewer impulse-grab opportunities. Estimated lost revenue: $320–$480 this week. A 20-minute fix.',
          ],
        },
        {
          title: 'Seasonal vs. NOS / Core Performance',
          icon: 'drivers',
          bullets: [
            '<strong>Seasonal (Summer 2): 62% of weekly revenue</strong> — above the 58% plan mix. Full-price sell-through on Summer 2 hero items at 94%. Markdown rate on seasonal items: 4% (plan: 8%). No markdown pressure for 2+ more weeks.',
            '<strong>NOS / Core: 38% of revenue.</strong> V-Neck Basics, Classic Tee, and Denim are the NOS engines — all above plan. Core items holding 78% sell-through despite the seasonal mix shift.',
            '<strong>Clearance / Sale items:</strong> 12% of units, 8.2% of revenue — below plan markdown rate. Clearance velocity healthy; no over-stacked clearance risk this week.',
          ],
        },
        {
          title: 'What Drove the Week — AI Business Analysis',
          icon: 'drivers',
          bullets: [
            '<strong>Primary driver — Floorset execution × weather:</strong> A fully set Summer 2 floorset combined with warm weekend weather created a compounding uplift. Peer stores with partial floorsets averaged $82K lower revenue despite the same weather tailwind — execution quality is the differentiator.',
            '<strong>Secondary driver — Semi Annual Sale placement:</strong> Clearance endcap at the high-traffic aisle junction drove 14% transaction share from 8% floor space — maximized conversion without cannibalizing full-price.',
            '<strong>Tertiary driver — Fitting room staffing:</strong> 2× fitting room coverage at peak drove 31% conversion in Dresses and Blazers vs the district\'s 22% average for the same departments.',
            '<strong>One drag — Accessories Endcap facing gap:</strong> 4 facings vs 6 spec = 33% fewer touchpoints per customer pass. Estimated lost revenue: $320–$480. A 20-minute fix for next week.',
          ],
        },
        {
          title: 'District Context — Your Store vs the District',
          icon: 'district',
          bullets: [
            `This store is <strong>#${store.rank} of ${store.totalStores} in the district</strong> this week. SPI ${store.dpi} is well above the district average. Momentum is <strong>${store.momentum}</strong> — sustained performance over 6 consecutive weeks.`,
            'You contributed 17.8% of total district weekly revenue. Indexed productivity per sq ft: +24% above district average.',
            'District DPI this week: <strong>87 (Excellence)</strong>. Your store anchors this ranking. All 4 active HQ broadcasts acknowledged — full compliance.',
          ],
        },
        {
          title: "Today's Priorities & Week Ahead Focus",
          icon: 'recommendations',
          bullets: [
            '<strong>Monday — Accessories Endcap (20 min):</strong> Reset to 6-facing POG spec. Estimated weekly revenue recovery: $320–$480.',
            '<strong>Tuesday — Kids size-run audit:</strong> Resolve XS and 4T gaps in Party Dress. Request DC dispatch or inter-store transfer.',
            '<strong>This week — Fall transition planning:</strong> Review incoming Fall assortment plan with your merch lead. Pre-stage clearance fixtures. Fall hero items arrive in 3 weeks.',
            '<strong>Schedule — Knowledge share:</strong> DM has flagged your store as a best-practice template. Suggest a 30-min SM peer session with lower-ranked stores in the district.',
          ],
        },
      ],
      closing: `${store.name} is the district benchmark this week. The only open action is the Accessories facing correction — a 20-minute fix. Maintain execution, document the playbook, and start positioning for Fall.`,
    };
  }

  if (isStable) {
    return {
      greeting: `${store.name} (#${store.number}) is tracking plan at SPI ${store.dpi} — net sales ${vsPlan} vs plan but 3 category misses and a conversion gap are leaving upside on the table. Here is the weekly business recap with root causes and the fix list.`,
      sections: [
        {
          title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
          icon: 'scorecard',
          bullets: [
            `<strong>vs Plan:</strong> Net sales <strong>${vsPlan} vs plan</strong>. Units: flat vs plan. Gross margin <strong>${gmRate}</strong>. Slightly below plan target due to higher-than-planned markdowns in Men's Denim clearance.`,
            `<strong>vs Last Year (LY):</strong> Net sales <strong>${vsLY} vs LY</strong>. Traffic –2.1% YoY — 3rd consecutive week of softness. Conversion <strong>${convRate}</strong> (${convYoY}). Average basket size ${basketSize}.`,
            '<strong>vs AI Forecast:</strong> In line with forecast. Model had flagged Men\'s Denim underperformance risk 2 weeks ago based on assortment gap data — the miss materialized as predicted.',
            `<strong>vs Comparable Week:</strong> <strong>+0.4% net-comp</strong> — essentially flat. District rank: <strong>#${store.rank} of ${store.totalStores} stores</strong>, below district average SPI. Momentum: <strong>${store.momentum}</strong>.`,
          ],
        },
        {
          title: 'Traffic & Conversion Analysis',
          icon: 'traffic',
          bullets: [
            `Total transactions: <strong>${transactions} this week</strong> (–2.1% YoY). Traffic softness has persisted 3 consecutive weeks. Possible competitive factor — one competitor ran a parallel promotion in the area this weekend.`,
            `Conversion rate: <strong>${convRate}</strong> — below district average. Biggest drag: checkout queue during 12–2 PM and 5–7 PM peaks. VoC "Checkout Speed" mentions confirm the friction — single-register operation during peak windows is the direct cause.`,
            'Fitting room conversion (try-on → purchase): <strong>41%</strong> vs 52% district average. Understaffed fitting rooms during peak — customers self-manage and a portion abandon without staff assist.',
            `Average transaction value (ATV): <strong>${basketSize.split(' ')[0]}</strong> — basket quality improving but limited by conversion drop-off at the register.`,
          ],
        },
        {
          title: 'External Context — Weather, Events & Market Factors',
          icon: 'external',
          bullets: [
            '<strong>Weather:</strong> Mixed week — warm Thu/Fri, overcast and cooler Saturday (–4°F vs seasonal norm). Saturday cooler weather suppressed Dress demand. Estimated weather drag on Dresses: –$1,200 vs a clear-weather Saturday.',
            '<strong>Semi Annual Sale:</strong> Estimated <strong>+$4,800 incremental revenue</strong>. However, the clearance endcap is mid-aisle rather than at the entrance zone — missed impulse capture opportunity.',
            '<strong>Competitive activity:</strong> Trade area data suggests a competitor ran a parallel promotional event nearby — a possible contributing factor to the –2.1% traffic softness.',
          ],
        },
        {
          title: 'Product Performance — Division & Department Breakdown',
          icon: 'product',
          bullets: [
            '<strong>Women\'s Division (+4.8% vs plan):</strong> Bright spot. Basics (V-Neck, Tee) strong at +9.2%. Dresses at +2.1% — held back by cool Saturday. Accessories lagging (–7.4% vs plan) — Endcap still in Spring configuration.',
            '<strong>Men\'s Division (–6.2% vs plan):</strong> Biggest drag. Denim Slim Fit: only 18 units vs 32 plan (–44% miss). Assortment issue — only 3 washes available vs 5 in peer stores. Polo Classic and Oxford above plan.',
            '<strong>Kids (+2.1% vs plan):</strong> Cargo Shorts and Color Block Tee leading. Kids Party Dress lagging — size-run gaps.',
            '<strong>Accessories (–7.4% vs plan):</strong> Endcap still in Spring configuration. Summer 2 accessories not in optimal placement. Reset is the single highest-priority execution action this week.',
            '<strong>Footwear (+1.8% vs plan):</strong> Running Shoes slightly above plan. Canvas Sneakers flat.',
          ],
        },
        {
          title: 'Seasonal vs. NOS / Core Performance',
          icon: 'drivers',
          bullets: [
            '<strong>Seasonal (Summer 2): 54% of revenue</strong> (vs 58% plan mix). Under-indexed because the Accessories Endcap — the primary Summer 2 showcase zone — has not been reset. Direct execution-to-sales linkage.',
            '<strong>NOS / Core: 46% of revenue</strong> — over-indexed vs plan. Core items are carrying more than their planned share because seasonal execution is incomplete.',
            '<strong>Clearance:</strong> 14% of units, 9.8% of revenue — slightly above plan. Men\'s Denim clearance moving at deeper markdowns than planned due to assortment positioning issues.',
          ],
        },
        {
          title: 'What Drove the Week — AI Business Analysis',
          icon: 'drivers',
          bullets: [
            '<strong>Root cause #1 — Men\'s Denim assortment gap:</strong> The –44% miss on Slim Fit Denim is a product problem. Only 3 washes on floor vs 5 in peer stores. An assortment expansion request to the buyer is the right call this week.',
            '<strong>Root cause #2 — Accessories Endcap in Spring configuration:</strong> Every day the endcap remains in Spring configuration, Seasonal revenue runs at 46% of potential. A reset adds an estimated $380–$520/week for this store\'s traffic volume.',
            '<strong>Root cause #3 — Checkout bottleneck:</strong> Single register during peak hours is suppressing conversion below district average. Opening a 2nd register is the highest-ROI staffing change available — estimated $1,800/week recovery.',
            '<strong>Weather partially explains the miss:</strong> Saturday weather drag (–$1,200 estimated) is real. The Denim and Accessories misses are execution-driven and persist regardless of weather.',
          ],
        },
        {
          title: 'District Context — Your Store vs the District',
          icon: 'district',
          bullets: [
            `Ranked <strong>#${store.rank} of ${store.totalStores}</strong> in the district. SPI ${store.dpi} — the gap to top-3 is approximately 4–6 SPI points, achievable within 2 weeks with the Denim, Accessories, and checkout fixes.`,
            'Traffic is below district median for comparable store sizes. The –2.1% YoY trend warrants a trade area competitive review.',
            '<strong>Broadcast status:</strong> Review the "Visual Merchandising — Summer 2" HQ broadcast — it contains the Accessories Endcap reset spec, the #1 priority action this week.',
          ],
        },
        {
          title: "Today's Priorities & Week Ahead Focus",
          icon: 'recommendations',
          bullets: [
            '<strong>Monday — Accessories Endcap reset (before AM open):</strong> Reset to Summer 2 POG. 45 min, 2 associates. Estimated weekly revenue uplift: $380–$520.',
            '<strong>Daily — Open 2 registers at 12–2 PM and 5–7 PM:</strong> The checkout VoC trend will reverse within 5–7 days.',
            '<strong>Wednesday — Men\'s Denim assortment request:</strong> Submit an assortment request to your buyer for the 2 missing wash options. Reference the –44% vs plan data. 2-week lead time.',
            '<strong>Fitting room staffing:</strong> Deploy 1 fitting room associate 11 AM–3 PM daily. District data shows this alone increases Dresses and Blazer conversion by 8–12 points.',
          ],
        },
      ],
      closing: `${store.name} is 3 execution corrections away from a top-3 district ranking: reset the Accessories Endcap, open the second register at peak, and escalate the Denim assortment gap. Each action is discrete, measurable, and achievable within 1 week.`,
    };
  }

  if (isAtRisk) {
    return {
      greeting: `${store.name} (#${store.number}) had a difficult week — SPI ${store.dpi}, At-Risk tier, net sales ${vsPlan} vs plan and conversion declining for the 4th consecutive week. Here is the full business diagnostic and recovery plan.`,
      sections: [
        {
          title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
          icon: 'scorecard',
          bullets: [
            `<strong>vs Plan:</strong> Net sales <strong>${vsPlan} vs plan</strong>. Units: –6.2% vs plan. Gross margin <strong>${gmRate}</strong>. Over-markdown on clearance compressing margin beyond recovery this week.`,
            `<strong>vs Last Year (LY):</strong> Net sales <strong>${vsLY} vs LY</strong>. Traffic –5.8% YoY — accelerating decline. Conversion dropped to <strong>${convRate}</strong> (${convYoY}). Average basket size ${basketSize} — basket quality holding but the funnel is leaking at conversion.`,
            '<strong>vs AI Forecast:</strong> –2.9% below even the pessimistic scenario. Compounding factors (OOS + fitting room + POG drift) created more drag than modeled.',
            `<strong>vs Comparable Week:</strong> <strong>–8.1% net-comp</strong> — meaningful YoY share loss. District rank: <strong>#${store.rank} of ${store.totalStores}</strong>. Revenue contribution has fallen from 12.1% to 9.4% of district total over 4 weeks. Momentum: <strong>${store.momentum}</strong>.`,
          ],
        },
        {
          title: 'Traffic & Conversion Analysis',
          icon: 'traffic',
          bullets: [
            `Total transactions: <strong>${transactions} this week</strong> (–5.8% YoY, lowest week in 8 weeks). Traffic decline is partially external but conversion is the larger problem.`,
            `Conversion rate: <strong>${convRate}</strong> — lowest in the district. Driven primarily by fitting room abandonment. Customers arrive and browse but do not complete purchases in Dresses and Blazers — the two highest-ATV categories.`,
            'Fitting room wait time (estimated from VoC): <strong>12–18 minutes during 11am–3pm peak</strong>. Industry benchmark: above 10 minutes, abandon rate spikes to 61%.',
            'UPT: <strong>2.1</strong> (–0.4 vs LY). Basket shrinking. Multi-item cross-sell opportunity — typically created during the fitting room visit — is being lost.',
          ],
        },
        {
          title: 'External Context — Weather & OOS Impact',
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
            '<strong>Women\'s Division (–8.2% vs plan):</strong> Biggest drag. Dresses: –18% (fitting room wait). Basics: –11% (OOS in V-Neck sizes S/M/XS). The division has demand — execution failures are suppressing conversion and purchase.',
            '<strong>Men\'s Division (+2.1% vs plan):</strong> Bright spot. Polo Classic and Compression Tee above plan. Men\'s is less impacted by fitting room wait — most male shoppers size-grab without try-on.',
            '<strong>Accessories (–6.8% vs plan):</strong> POG compliance at 78%. Leather Crossbody Bag (featured hero) not at eyeline — buried behind a returns cart.',
            '<strong>Kids (–4.3% vs plan):</strong> Party Dress and Color Block Tee below plan — size gaps a factor.',
            '<strong>Footwear (–1.2% vs plan):</strong> Essentially flat — minimal impact from the execution failures.',
          ],
        },
        {
          title: 'Seasonal vs. NOS / Core Performance',
          icon: 'drivers',
          bullets: [
            '<strong>Seasonal (Summer 2): 48% of revenue</strong> (vs 58% plan). Floorset at 61% completion — the 39% incomplete portion is concentrated in Dresses and Accessories, both underperforming.',
            '<strong>NOS / Core: 52% of revenue</strong> — over-indexed vs plan. Core items (Polo, Tee, Basics) are carrying the store despite OOS gaps.',
            '<strong>Clearance:</strong> 17% of units, 11.4% of revenue — above plan markdown rate. Full-price sell-through restoration is the GM recovery path.',
          ],
        },
        {
          title: 'What Drove the Week — AI Business Analysis',
          icon: 'drivers',
          bullets: [
            '<strong>Root cause #1 — Fitting room service failure ($4,800 lost revenue):</strong> AI modeling attributes $4,800/week to the fitting room wait. Adding 1 fitting room associate 11am–3pm costs ~$112/day — 6× ROI in week 1.',
            '<strong>Root cause #2 — OOS size-run gaps ($3,200 lost demand):</strong> Creates a reinforcing negative loop: customers can\'t find their size → they leave → conversion falls → OOS persists. Escalate DC priority today.',
            '<strong>Root cause #3 — POG drift on Women\'s Wall (78% compliance):</strong> 22% of the Wall displays the wrong items. Full reset (90 min, 2 associates) is a one-time fix.',
            '<strong>Compounding effect:</strong> Each issue causes a –2 to –3% miss individually. Together they compound — a customer who can\'t find her size waits 15 min in a fitting room and abandons — then leaves a negative VoC review that deters the next customer.',
          ],
        },
        {
          title: 'District Context — Your Store vs the District',
          icon: 'district',
          bullets: [
            `Ranked <strong>#${store.rank} of ${store.totalStores}</strong> in the district. At current trajectory this store is pulling the district average down by approximately 1.2 SPI points.`,
            'Peer comparison: the Stable-tier store with similar traffic runs 24.8% conversion vs this store\'s 21.1%. The difference is fitting room staffing — proven in peer stores. The playbook exists.',
            'DM is monitoring daily. 2 of 4 district HQ broadcasts unacknowledged — both contain direct action items for this store\'s recovery. Acknowledge and action before EOD today.',
          ],
        },
        {
          title: 'Triage — Act on These Today',
          icon: 'triage',
          bullets: [
            '<strong>Fitting room staffing (highest ROI):</strong> 1 dedicated fitting room associate 11am–3pm. Estimated weekly revenue recovery: $1,800–$2,400.',
            '<strong>DC escalation:</strong> Submit priority DC dispatch for 4 critical Basics SKUs (V-Neck XS/S/M, Blazer Size 6). Reference the OOS impact data.',
            '<strong>Women\'s Wall POG reset:</strong> Tonight. 90 min, 2 associates. Must be complete before tomorrow AM open.',
            '<strong>Daily 10-min lead stand-up:</strong> OOS count, fitting room wait at noon, audit score. Report daily to DM.',
          ],
        },
      ],
      closing: `${store.name} has the traffic, team, and assortment to recover. The current metrics are driven by 3 specific, solvable execution failures — not a structural business problem. Execute the fitting room fix today and the recovery begins immediately.`,
    };
  }

  // Crisis tier
  return {
    greeting: `${store.name} (#${store.number}) is in CRISIS at SPI ${store.dpi} — the worst week in 12 months across every metric. Multiple compounding failures require District Manager on-site intervention today. Here is the complete diagnostic.`,
    sections: [
      {
        title: 'Weekly Scorecard — vs Plan, LY, Forecast & Comp Week',
        icon: 'scorecard',
        bullets: [
          `<strong>vs Plan:</strong> Net sales <strong>${vsPlan} vs plan</strong>. Units: –14.1%. Gross margin <strong>${gmRate}</strong>. Emergency clearance markdowns compressing margin beyond weekly recovery.`,
          `<strong>vs Last Year (LY):</strong> Net sales <strong>${vsLY} vs LY</strong>. Traffic –9.1% YoY. Conversion <strong>${convRate}</strong> (${convYoY}) — lowest in 12 months. VoC Score dropped 14 pts in 2 weeks.`,
          '<strong>vs AI Forecast:</strong> –9.4% below even the pessimistic scenario. Compounding failures accelerated faster than modeled.',
          `<strong>vs Comparable Week:</strong> <strong>–18.2% net-comp</strong> — 2nd-worst comparable week in 3-year history. District rank: <strong>#${store.rank} of ${store.totalStores} — last in district</strong>. Revenue share collapsed from 10.8% to 6.2% of district total in 4 weeks.`,
        ],
      },
      {
        title: 'Traffic & Conversion — Critical Decline',
        icon: 'traffic',
        bullets: [
          `Total transactions: <strong>${transactions} this week</strong> (–9.1% YoY, lowest week in 12 months). The traffic decline includes a measurable deterrent effect from negative VoC and social reviews beginning to suppress repeat visits.`,
          `Conversion: <strong>${convRate}</strong> — multiple barriers active simultaneously. Messy aisles reduce browse time; OOS gaps eliminate purchase options; fitting room delays deter try-on. Together they compound to a 7.4pp gap vs district average.`,
          'Average basket size down –15.3% vs 4 weeks ago. Customer profile shifting from planned shoppers to opportunistic clearance buyers — a signal of brand trust erosion.',
          'Fitting room estimated wait: <strong>18–22 minutes during peak</strong>. At 18+ minutes, the entire Dresses and Blazers conversion opportunity is effectively lost.',
        ],
      },
      {
        title: 'Critical Issues — Act Before Opening',
        icon: 'triage',
        bullets: [
          '<strong>SEA Auto-Fail — Fire Exit Blocked:</strong> Display fixture obstructing emergency Exit B in Zone B. Zero-tolerance regulatory violation. Store must not open until cleared and photo-documented. DM confirmation required before 9 AM. Risk: mandatory closure and penalties.',
          '<strong>VoC Emergency — "Messy Aisles" + "Staff Unavailable":</strong> Combined complaints up +38% in 2 weeks. VoC Score dropped 14 pts. Negative Google Reviews are amplifying — estimated 2,400 impressions from new 1-star reviews this week.',
          '<strong>OOS Surge — 14 SKUs across Basics, Blazers, Denim, and Kids:</strong> 4 DC shipments delayed. Backroom not fully audited in 5 days — actual stock position unknown. A full backroom count is required today before DC requests can be submitted.',
          '<strong>Summer 2 Floorset — Only 34% Complete:</strong> Women\'s Wall (Dresses), Denim Wall, and Accessories Endcap all in Spring configuration. Estimated revenue suppression: <strong>$4,200/week</strong>.',
        ],
      },
      {
        title: 'External Context — What Shaped the Week',
        icon: 'external',
        bullets: [
          '<strong>Weather was NOT a factor:</strong> Seasonal conditions, no disruptions. Peer stores in the same trade area outperformed plan. The crisis is entirely internal.',
          '<strong>Semi Annual Sale was a partial offset with poor conversion:</strong> Sale awareness drove 12% incremental weekend traffic. However, the execution environment converted this traffic at half the rate of peer stores during the same promotional window.',
          '<strong>Social media amplification risk:</strong> 1-star reviews specifically reference conditions flagged in last week\'s AI audit (messy fitting rooms, empty shelves). Estimated 2,400 impressions — a new customer deterrent forming that will suppress next week\'s traffic if not visibly addressed.',
        ],
      },
      {
        title: 'Product Performance — Division & Department Breakdown',
        icon: 'product',
        bullets: [
          '<strong>Women\'s Division (–18.4% vs plan):</strong> Catastrophic. Dresses: –29% (fitting room abandonment). Basics: –22% (OOS). Division mix shifted from 48% to 36% of store total in 4 weeks.',
          '<strong>Men\'s Division (–6.2% vs plan):</strong> Better than Women\'s but still below plan. Denim miss (–14%) due to OOS in core washes.',
          '<strong>Accessories (–21.8% vs plan):</strong> Endcap in Spring configuration. Hero items not featured. Accessories revenue has essentially collapsed.',
          '<strong>Kids (–11.3% vs plan):</strong> Significant OOS in Party Dress and Cargo Shorts key sizes.',
          '<strong>Footwear (–4.1% vs plan):</strong> Minor impact — self-service format is less affected by staffing failures.',
        ],
      },
      {
        title: 'Seasonal vs. NOS / Core Performance',
        icon: 'drivers',
        bullets: [
          '<strong>Seasonal (Summer 2): Only 29% of revenue</strong> (vs 58% plan). Summer 2 is essentially unexecuted — product is in backroom, on Spring fixtures, or mixed onto clearance rails.',
          '<strong>NOS / Core: 71% of revenue</strong> — core is carrying everything, but even core items are suppressed by OOS gaps.',
          '<strong>Clearance: 24% of units</strong> — well above plan. Emergency clearance marking is reactive and compressing GM below any recovery threshold this week.',
        ],
      },
      {
        title: 'What Drove the Week — AI Business Analysis',
        icon: 'drivers',
        bullets: [
          '<strong>The compounding crisis pattern:</strong> OOS → customers can\'t buy → conversion drops → revenue misses → morale drops → execution standards fall → VoC worsens → traffic declines → OOS worsens. Breaking this cycle requires external intervention — the team cannot self-correct at this velocity.',
          '<strong>The floorset miss is the origin point:</strong> AI attribution tracing back 4 weeks shows performance decline began precisely when the Summer 2 floorset deadline was missed. Every day of incomplete execution during the sale window costs more than a normal week.',
          '<strong>Revenue recovery projection:</strong> If fire exit cleared (today), floorset completed (overnight), OOS addressed (48h), and fitting room staffed (tomorrow): AI projects recovery to –4 to –6% vs plan within 10 days — crisis to At-Risk. Full recovery to Stable: 3–4 weeks of sustained execution.',
        ],
      },
      {
        title: 'Immediate Recovery — Priority Order',
        icon: 'recommendations',
        bullets: [
          '<strong>Before opening — Fire exit:</strong> Clear Exit B obstruction. Photo document. Submit to Compliance. DM confirmation before 9 AM. Store does not open until complete.',
          '<strong>Before 10 AM — Full backroom count:</strong> Accurate inventory count is prerequisite to the DC dispatch request.',
          '<strong>Today — DM on-site visit:</strong> Walk the floor together. Prioritize Women\'s Wall reset and Accessories Endcap as the two highest-revenue-recovery zones.',
          '<strong>Tonight — Overnight floorset reset:</strong> Women\'s Wall and Accessories Endcap in Summer 2 POG. Minimum 3 associates, 3 hours. Focus the 5 hero SKUs at eyeline first.',
          '<strong>Tomorrow AM — Fitting room staffing:</strong> 1 dedicated associate 11 AM–3 PM. Every day without this costs $680–$960 in Women\'s sales.',
          '<strong>48 hours — Deep clean:</strong> Professional-standard clean of all aisles, fitting rooms, and entrance zone before the weekend. The VoC cycle cannot break without a visible physical improvement.',
        ],
      },
    ],
    closing: `${store.name} is in crisis but the data shows demand exists — traffic is down only 9%, the bigger problem is ${convRate} conversion. What is needed is on-site leadership presence and a sequenced, non-negotiable action plan. Follow the priority order: safety first, then backroom count, floorset, fitting room, deep clean.`,
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
  { id: 's1', name: 'Nashville Flagship',    number: '2034', cluster: 'Metro North', format: 'Flagship',  dpi: 94, dpiDelta:  3.2, momentum: 'rising',   rank: 1, totalStores: 8, risk: 'low',      lastRefresh: '5 min ago',  tier: 'Excellence',      manager: 'Sarah Johnson' },
  { id: 's2', name: 'Memphis Central',       number: '1876', cluster: 'Metro North', format: 'Full-Line', dpi: 91, dpiDelta:  2.1, momentum: 'rising',   rank: 2, totalStores: 8, risk: 'low',      lastRefresh: '8 min ago',  tier: 'Excellence',      manager: 'Marcus Reed' },
  { id: 's3', name: 'Knoxville East',        number: '3421', cluster: 'Metro West',  format: 'Full-Line', dpi: 85, dpiDelta:  0.5, momentum: 'stable',   rank: 3, totalStores: 8, risk: 'low',      lastRefresh: '12 min ago', tier: 'Excellence',      manager: 'David Park' },
  { id: 's4', name: 'Chattanooga Riverside', number: '2198', cluster: 'Metro West',  format: 'Compact',   dpi: 82, dpiDelta: -1.2, momentum: 'stable',   rank: 4, totalStores: 8, risk: 'moderate', lastRefresh: '10 min ago', tier: 'Performing',      manager: 'Rachel Torres' },
  { id: 's5', name: 'Murfreesboro Plaza',    number: '4532', cluster: 'South Bay',   format: 'Full-Line', dpi: 78, dpiDelta: -3.5, momentum: 'declining', rank: 5, totalStores: 8, risk: 'moderate', lastRefresh: '15 min ago', tier: 'Performing',      manager: 'Kevin Patel' },
  { id: 's6', name: 'Franklin Town Center',  number: '1234', cluster: 'East Region', format: 'Compact',   dpi: 72, dpiDelta: -6.8, momentum: 'declining', rank: 6, totalStores: 8, risk: 'high',     lastRefresh: '9 min ago',  tier: 'Needs Attention', manager: 'Lisa Chen' },
  { id: 's7', name: 'Clarksville Crossing',  number: '5678', cluster: 'South Bay',   format: 'Compact',   dpi: 65, dpiDelta: -9.2, momentum: 'declining', rank: 7, totalStores: 8, risk: 'high',     lastRefresh: '20 min ago', tier: 'Needs Attention', manager: 'James Williams' },
  { id: 's8', name: 'Johnson City Mall',     number: '9012', cluster: 'East Region', format: 'Compact',   dpi: 58, dpiDelta:-12.4, momentum: 'declining', rank: 8, totalStores: 8, risk: 'high',     lastRefresh: '14 min ago', tier: 'Needs Attention', manager: 'Priya Sharma' },
];

const getAuditData = (store: StoreMeta): AuditWeek[] => {
  const base = store.dpi >= 80 ? 85 : 65;
  const variance = store.dpi >= 80 ? 8 : 15;
  const gen = (field: string, offset: number, trendFactor: number, i: number) =>
    Math.round(Math.min(100, Math.max(30, base + offset + Math.floor(detRnd(`${store.id}-audit-${field}-${i}`) * variance) - variance / 2 + (i * trendFactor))));
  const tf = store.momentum === 'rising' ? 1.5 : store.momentum === 'declining' ? -1.5 : 0;
  const weekDates = ['Mar 2', 'Mar 9', 'Mar 16', 'Mar 23', 'Mar 30', 'Apr 6', 'Apr 13', 'Apr 20'];
  return Array.from({ length: 8 }, (_, i) => {
    const s = gen('safety', 0, tf, i);
    const p = gen('planogram', 0, 0, i);
    const sg = gen('signage', -2, 0, i);
    const c = gen('cleanliness', 5, 0, i);
    const a = gen('availability', 3, 0, i);
    const st = gen('staffing', -2, 0, i);
    const sr = gen('stockRot', -3, 0, i);
    const pr = gen('pricing', 1, 0, i);
    const br = gen('backroom', -4, 0, i);
    const ca = gen('custArea', 2, 0, i);
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
  { sku: 'WOM-BLZ-001', name: "Women's Classic Blazer",  status: 'in-stock',     quantity: 48, onOrder: 0,  inTransit: 0,  daysOfSupply: 14, department: "Women's", subDept: 'Tops', itemClass: 'Blazers', brand: 'House Brand' },
  { sku: 'MEN-DNM-003', name: "Men's Slim Denim",         status: store.dpi >= 80 ? 'in-stock' : 'low', quantity: store.dpi >= 80 ? 32 : 6,  onOrder: store.dpi >= 80 ? 24 : 36, inTransit: store.dpi >= 80 ? 12 : 0,  daysOfSupply: store.dpi >= 80 ? 10 : 2, department: "Men's", subDept: 'Bottoms', itemClass: 'Denim', brand: 'Core Range' },
  { sku: 'KID-TSH-012', name: "Kids Color Block Tee",     status: 'in-stock',     quantity: 64, onOrder: 48, inTransit: 0,  daysOfSupply: 21, department: 'Kids', subDept: 'Tops', itemClass: 'Tees', brand: 'House Brand' },
  { sku: 'ACC-BAG-005', name: "Canvas Tote Bag",           status: store.risk === 'high' ? 'out-of-stock' : 'in-stock', quantity: store.risk === 'high' ? 0 : 22, onOrder: store.risk === 'high' ? 36 : 12, inTransit: store.risk === 'high' ? 24 : 0, daysOfSupply: store.risk === 'high' ? 0 : 8, department: 'Accessories', subDept: 'Bags', itemClass: 'Totes', brand: 'Premium Line' },
  { sku: 'WOM-DRS-008', name: "Summer Midi Dress",         status: 'inbound',      quantity: 12, onOrder: 0,  inTransit: 30, daysOfSupply: 3,  inboundEta: '2 days', department: "Women's", subDept: 'Dresses', itemClass: 'Midi Dresses', brand: 'House Brand' },
  { sku: 'MEN-PLO-002', name: "Men's Polo Classic",        status: store.dpi >= 75 ? 'in-stock' : 'low', quantity: store.dpi >= 75 ? 28 : 4,  onOrder: store.dpi >= 75 ? 18 : 24, inTransit: store.dpi >= 75 ? 0  : 12, daysOfSupply: store.dpi >= 75 ? 9  : 1, department: "Men's", subDept: 'Tops', itemClass: 'Polos', brand: 'Core Range' },
  { sku: 'SEA-JKT-004', name: "Seasonal Rain Jacket",      status: 'inbound',      quantity: 0,  onOrder: 0,  inTransit: 48, daysOfSupply: 0,  inboundEta: '5 days', department: 'Seasonal', subDept: 'Outerwear', itemClass: 'Jackets', brand: 'Premium Line' },
  { sku: 'ACC-SCF-009', name: "Silk Blend Scarf",           status: 'in-stock',     quantity: 36, onOrder: 24, inTransit: 0,  daysOfSupply: 18, department: 'Accessories', subDept: 'Scarves', itemClass: 'Scarves', brand: 'Premium Line' },
  { sku: 'WOM-TOP-014', name: "Women's V-Neck Basics",     status: store.risk !== 'low' ? 'out-of-stock' : 'low', quantity: store.risk !== 'low' ? 0 : 5, onOrder: 48, inTransit: store.risk !== 'low' ? 0 : 0, daysOfSupply: store.risk !== 'low' ? 0 : 1, department: "Women's", subDept: 'Tops', itemClass: 'Basics', brand: 'Core Range' },
  { sku: 'MEN-CHN-007', name: "Men's Stretch Chino",        status: 'inbound',      quantity: 4,  onOrder: 0,  inTransit: 36, daysOfSupply: 1,  inboundEta: '7 days (delayed)', department: "Men's", subDept: 'Bottoms', itemClass: 'Chinos', brand: 'House Brand' },
  { sku: 'KID-SHT-019', name: "Kids Cargo Shorts",          status: 'low',          quantity: 7,  onOrder: 24, inTransit: 12, daysOfSupply: 2, department: 'Kids', subDept: 'Bottoms', itemClass: 'Shorts', brand: 'Core Range' },
  { sku: 'ACC-BLT-011', name: "Leather Belt Classic",       status: 'in-stock',     quantity: 54, onOrder: 0,  inTransit: 0,  daysOfSupply: 25, department: 'Accessories', subDept: 'Belts', itemClass: 'Belts', brand: 'House Brand' },
];

const buildInvFilterOptions = (
  items: InventoryItem[],
  key: 'department' | 'subDept' | 'itemClass' | 'brand',
  allLabel: string,
) => {
  const unique = [...new Set(items.map(i => i[key]))].sort();
  return [{ value: 'All', label: allLabel }, ...unique.map(v => ({ value: v, label: v }))];
};

type InventoryRisk = 'critical' | 'at-risk' | 'watch' | 'healthy';

const classifyInventoryRisk = (item: InventoryItem): InventoryRisk => {
  const pipeline = item.onOrder + item.inTransit;
  // Out of stock: critical only if NO pipeline inventory to recover
  if (item.status === 'out-of-stock') return pipeline > 0 ? 'at-risk' : 'critical';
  // Inbound: delayed shipment → at-risk; qty 0 but something coming → at-risk; otherwise watch
  if (item.status === 'inbound') {
    const delayed = !!item.inboundEta && /delay/i.test(item.inboundEta);
    if (delayed) return 'at-risk';
    if (item.quantity === 0) return 'at-risk';
    return 'watch';
  }
  // Low stock with FWOS < 0.3 weeks (≈ 2 days) and no pipeline → critical
  if (item.status === 'low' && item.daysOfSupply <= 2 && pipeline === 0) return 'critical';
  // Low stock with FWOS < 0.3 weeks but has pipeline → at-risk
  if (item.status === 'low' && item.daysOfSupply <= 2) return 'at-risk';
  // Low stock → at-risk
  if (item.status === 'low') return 'at-risk';
  // In-stock but FWOS < 1 week → watch
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
  category: 'Safety' | 'Operations' | 'Compliance' | 'Announcement' | 'Merchandising' | 'HR' | 'Marketing' | 'Visual Merchandising';
  title: string;
  description: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
}

// HQ Broadcasts — mirrors StoreOpsHome generateMockBroadcasts (apparel retailer content)
const SM_HQ_BROADCASTS: SMBroadcast[] = [
  {
    id: '1',
    priority: 'HIGH',
    category: 'Marketing',
    title: 'Semi-Annual Sale — Signage Kit Confirmation',
    description: 'Reminder: "Semi Annual Sale" sets Friday Open Business. Please confirm you have received your in-store signage kits for Windows, Marquee, and sign toppers.',
    sender: 'Marketing Calendar',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    priority: 'HIGH',
    category: 'Visual Merchandising',
    title: 'Summer 2 Floorset — Overnight Shift Scheduling',
    description: 'Reminder: Summer 2 floorset sets next Thursday overnight. Have you scheduled the overnight shifts required to complete the set?',
    sender: 'VM Planning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    priority: 'HIGH',
    category: 'Operations',
    title: 'Test Store — Early Set Compliance by 6.7.2026',
    description: 'Your store has been selected for an upcoming early set test. Your info packet includes items, pricing, and visual merchandising. Complete the set and confirm compliance by June 7, 2026.',
    sender: 'HQ Merchandising',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '4',
    priority: 'MEDIUM',
    category: 'Operations',
    title: 'Store-to-Store Transfers — This Week\'s Schedule',
    description: 'Alert for this week\'s transfers in and transfers out. Labor estimates based upon inbound/outbound execution are attached. Please ensure scheduling during non-selling hours.',
    sender: 'Operations Team',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
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
  // ── HQ broadcasts (mirrors StoreOpsHome enrichment — identical content for all logins) ──
  '1': {
    fullMessage: 'The "Semi Annual Sale" event sets this Friday as Open Business. Marketing has shipped in-store signage kits to all participating locations. Each kit includes three components: Window signage (large-format vinyl decals for front glass), Marquee signage (dimensional letterboard inserts), and Sign Toppers (price rail headers for all key fixtures).\n\nPlease inspect your shipment immediately upon receipt and confirm all three kit components are present and undamaged. If any component is missing or damaged, contact your District Manager and the Marketing Operations team by end of day Thursday so a replacement can be expedited before Friday open.\n\nWindow and Marquee signage should be installed Thursday evening after close. Sign Toppers are to be placed on fixtures first thing Friday morning before doors open.',
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
    fullMessage: 'Your store has been selected to participate in an upcoming early set test for the new seasonal collection. This test program gives a select group of stores first access to set the new product assortment ahead of the broader network rollout.\n\nYour info packet (attached) contains: (1) the complete item list with SKUs and quantities, (2) the pricing schedule including any introductory price points, and (3) the visual merchandising standards specific to the early set.\n\nThe full set must be executed and compliance confirmed by June 7, 2026. Compliance confirmation requires submitting store photos of each set zone through the Compliance Portal. A VM field rep may visit your store for a live audit between June 5–7.',
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
    fullMessage: 'This week\'s store-to-store transfer schedule has been finalized. Transfers are to be executed during non-selling hours to minimize disruption to the sales floor and customer experience.\n\nInbound transfers: Review the attached inbound manifest for SKUs, quantities, and originating stores. Receiving associates should process inbound items within 24 hours of arrival and update inventory counts in the system immediately.\n\nOutbound transfers: Review the attached outbound manifest for items that need to be prepared and dispatched. Outbound preparation includes picking, packing, and labeling per the transfer SOP. Dispatch must occur during non-selling hours (before open or after close).\n\nLabor estimates for inbound and outbound execution are included in the attached schedule. Any scheduling conflicts or inventory discrepancies should be reported to Operations by Wednesday EOD.',
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

// Deterministic hash → 0..1 (avoids reseeding Math.random on every render)
const detRnd = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h = ((Math.imul(h ^ s.charCodeAt(i), 16777619)) >>> 0); }
  return h / 4294967295;
};

// ── Alert Bucket Data Generator ─────────────────────────
const BOH_ITEMS = [
  { itemName: "Women's V-Neck Basics",      sku: 'WOM-TOP-014', dept: "Women's",    aisle: 'Rail C', bay: 'Bay 2', bohQty: 48, opp: 420 },
  { itemName: 'Floral Midi Dress — Navy',   sku: 'WOM-DRS-014', dept: "Women's",    aisle: 'Rail D', bay: 'Bay 3', bohQty: 36, opp: 310 },
  { itemName: 'Slim Fit Denim — Dark Wash', sku: 'MEN-DNM-003', dept: "Men's",      aisle: 'Rail M', bay: 'Bay 1', bohQty: 24, opp: 185 },
  { itemName: "Men's Stretch Chino",        sku: 'MEN-CHN-007', dept: "Men's",      aisle: 'Rail M', bay: 'Bay 4', bohQty: 18, opp: 220 },
  { itemName: 'Seasonal Rain Jacket',       sku: 'SEA-JKT-004', dept: 'Seasonal',   aisle: 'Rail S', bay: 'Bay 1', bohQty: 60, opp: 390 },
  { itemName: 'Canvas Tote Bag',            sku: 'ACC-BAG-005', dept: 'Accessories',aisle: 'Acc Wall',bay: 'Bay 3', bohQty: 30, opp: 140 },
  { itemName: 'Kids Cargo Shorts',          sku: 'KID-SHT-019', dept: 'Kids',       aisle: 'Rail K', bay: 'Bay 2', bohQty: 14, opp: 165 },
  { itemName: 'Athletic Leggings',          sku: 'WOM-ACT-002', dept: "Women's",    aisle: 'Rail A', bay: 'Bay 2', bohQty: 20, opp: 130 },
];

const PHANTOM_ITEMS: {
  itemName: string; sku: string; dept: string; zeroDays: number; units: number;
  expectedWeeklyDemand?: number; avgPrice?: number;
}[] = [
  { itemName: "Women's Classic Blazer",     sku: 'WOM-BLZ-001', dept: "Women's",    zeroDays: 22, units: 60, expectedWeeklyDemand: 22, avgPrice: 89.95 },
  { itemName: 'Wool Trench Coat',           sku: 'WOM-OUT-003', dept: "Women's",    zeroDays: 19, units: 48, expectedWeeklyDemand: 16, avgPrice: 129.95 },
  { itemName: 'Puffer Jacket',              sku: 'MEN-OUT-006', dept: "Men's",      zeroDays: 31, units: 72, expectedWeeklyDemand: 28, avgPrice: 99.95 },
  { itemName: 'Running Shoes Elite',        sku: 'FTW-RUN-002', dept: 'Footwear',   zeroDays: 25, units: 36, expectedWeeklyDemand: 14, avgPrice: 109.95 },
  { itemName: 'Kids Party Dress',           sku: 'KID-DRS-008', dept: 'Kids',       zeroDays: 18, units: 24, expectedWeeklyDemand: 20, avgPrice: 49.95 },
  { itemName: 'Leather Crossbody Bag',      sku: 'ACC-BAG-011', dept: 'Accessories',zeroDays: 28, units: 18 },
];

const POG_ITEMS = [
  { itemName: "Women's Classic Blazer",    sku: 'WOM-BLZ-001', dept: "Women's",     bay: "Women's Wall 3A", mismatch: 'Wrong rail position' },
  { itemName: 'High-Rise Skinny Jeans',    sku: 'WOM-DNM-005', dept: "Women's",     bay: "Women's Wall 3A", mismatch: 'Placed 2 bays left of planogram' },
  { itemName: "Men's Polo Classic",        sku: 'MEN-PLO-002', dept: "Men's",       bay: "Men's Bay 4",     mismatch: 'Facing count mismatch (3 vs 6 expected)' },
  { itemName: 'Athletic Compression Tee',  sku: 'MEN-ACT-004', dept: "Men's",       bay: "Men's Bay 1",     mismatch: 'SKU not found in planogram location' },
  { itemName: 'Canvas Tote Bag',           sku: 'ACC-BAG-005', dept: 'Accessories', bay: 'Accessories End Cap 7B', mismatch: 'Wrong hook position' },
  { itemName: 'Silk Blend Scarf',          sku: 'ACC-SCF-009', dept: 'Accessories', bay: 'Accessories End Cap 7B', mismatch: 'Facing count mismatch (2 vs 4 expected)' },
  { itemName: 'Kids Color Block Tee',      sku: 'KID-TSH-012', dept: 'Kids',        bay: "Kids Section 2C", mismatch: 'Placed in wrong section' },
  { itemName: 'Limited Edition Hoodie',    sku: 'SEA-HOO-014', dept: 'Seasonal',    bay: 'Seasonal Promo',  mismatch: 'SKU not found in planogram location' },
  { itemName: "Women's V-Neck Basics",     sku: 'WOM-TOP-014', dept: "Women's",     bay: "Women's Wall 3A", mismatch: 'Wrong rail position' },
];

const BOH_OWNERS = ['J. Martinez', 'A. Thompson', 'L. Patel', 'R. Garcia', 'K. Williams'];
const PHANTOM_OWNERS = ['M. Chen', 'D. Robinson', 'S. Kumar', 'T. Johnson'];
const POG_OWNERS = ['N. Davis', 'B. Wilson', 'F. Moore', 'C. Harris'];

export const DISMISS_REASONS = [
  'False detection',
  'Product already replenished',
  'Inventory count incorrect',
  'Store condition changed',
  'Image quality issue',
  'POG no longer active',
  'Duplicate task',
  'Not applicable to this store',
  'Other',
];

function eacDueLabel(hoursFromNow: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  const isToday = d.toDateString() === new Date().toDateString();
  const isTomorrow = d.toDateString() === new Date(Date.now() + 86400000).toDateString();
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today · ${timeStr}`;
  if (isTomorrow) return `Tomorrow · ${timeStr}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` · ${timeStr}`;
}

function getAlertBuckets(store: StoreMeta): AlertBucket[] {
  const r = (seed: string) => detRnd(`${store.id}-${seed}`);
  const bohCount = 8 + Math.round(r('boh-cnt') * 4);
  const bohUnits = 134 + Math.round(r('boh-units') * 40);
  const bohOpp = Math.round((1800 + r('boh-opp') * 600) / 100) * 100;
  const phantomCount = 4 + Math.round(r('ph-cnt') * 3);
  const pogCount = 7 + Math.round(r('pog-cnt') * 4);
  const pogBays = 4 + Math.round(r('pog-bays') * 2);

  const bohIssues: AlertIssueRow[] = BOH_ITEMS.slice(0, bohCount).map((it, i) => {
    const qty = it.bohQty + Math.round(r(`boh-qty-${i}`) * 12);
    const conf = Math.round((0.82 + r(`boh-conf-${i}`) * 0.15) * 100);
    const isOverdue = r(`boh-status-${i}`) > 0.82;
    const owner = BOH_OWNERS[Math.floor(r(`boh-owner-${i}`) * BOH_OWNERS.length)];
    return {
      id: `boh-${i}`,
      itemName: it.itemName,
      sku: it.sku,
      department: it.dept,
      subDepartment: it.dept,
      itemClass: 'Standard',
      store: store.name,
      aisle: it.aisle,
      bay: it.bay,
      issue: 'Shelf gap detected — BOH stock available',
      bohQty: qty,
      shelfQty: 0,
      weeklyOpportunity: it.opp + Math.round(r(`boh-opp-${i}`) * 80),
      confidenceScore: conf,
      taskStatus: isOverdue ? 'overdue' : 'open',
      taskOwner: owner,
      dueDate: isOverdue ? 'Today · 12:00 PM' : eacDueLabel(6),
      slaBreached: isOverdue,
      isEscalated: isOverdue && r(`boh-esc-${i}`) > 0.7,
      isAcknowledged: false,
      recommendedAction: `Move ${qty} units from ${it.aisle}, ${it.bay} BOH to shelf facing`,
      signalBreakdown: `Shelf image: 0 units detected · BOH system: ${qty} units available · Gap first detected: 09:14 AM`,
      evidence: `AI shelf image captured 09:14 AM · BOH system scan 07:30 AM · ${conf}% detection confidence`,
    };
  });

  const phantomIssues: AlertIssueRow[] = PHANTOM_ITEMS.slice(0, phantomCount).map((it, i) => {
    const onHand = it.units + Math.round(r(`ph-units-${i}`) * 20);
    const zeroDays = it.zeroDays + Math.round(r(`ph-days-${i}`) * 5);
    const weeklyDemand = it.expectedWeeklyDemand
      ? it.expectedWeeklyDemand + Math.round(r(`ph-demand-${i}`) * 4)
      : undefined;
    const asp = it.avgPrice ? it.avgPrice + r(`ph-asp-${i}`) * 0.4 : undefined;
    const conf = Math.round((0.74 + r(`ph-conf-${i}`) * 0.18) * 100);
    const isInProgress = r(`ph-status-${i}`) > 0.75;
    const owner = PHANTOM_OWNERS[Math.floor(r(`ph-owner-${i}`) * PHANTOM_OWNERS.length)];
    return {
      id: `ph-${i}`,
      itemName: it.itemName,
      sku: it.sku,
      department: it.dept,
      subDepartment: it.dept,
      itemClass: 'Standard',
      store: store.name,
      issue: `${zeroDays} consecutive zero-sales days`,
      bohQty: onHand,
      shelfQty: onHand,
      zeroSalesDays: zeroDays,
      recoveryEstimate: phantomSkuRecovery(onHand, weeklyDemand, asp),
      confidenceScore: conf,
      taskStatus: isInProgress ? 'in-progress' : 'open',
      taskOwner: owner,
      dueDate: eacDueLabel(28),
      slaBreached: false,
      isEscalated: false,
      isAcknowledged: isInProgress,
      recommendedAction: `Conduct physical shelf count for ${it.itemName} · Verify product accessible at shelf · Clear backroom blockage if found`,
      signalBreakdown: `POS sales: 0 units for ${zeroDays} days · System on-hand: ${onHand} units${weeklyDemand ? ` · Expected demand: ~${weeklyDemand} units/wk` : ''}`,
      evidence: `POS transaction log: no sales recorded since ${zeroDays} days ago · Inventory system: ${onHand} units on-hand · ${conf}% detection confidence`,
    };
  });

  const phantomUnits = phantomIssues.reduce((sum, row) => sum + row.bohQty, 0);
  const phantomAvgZeroDays = phantomIssues.length
    ? Math.round(phantomIssues.reduce((sum, row) => sum + (row.zeroSalesDays ?? 0), 0) / phantomIssues.length)
    : 0;
  const phantomRecoveryParts = phantomIssues
    .map(row => row.recoveryEstimate)
    .filter((v): v is number => v != null && v > 0);
  const phantomRecoveryTotal = phantomRecoveryParts.length > 0
    ? phantomRecoveryParts.reduce((sum, v) => sum + v, 0)
    : null;

  const pogIssues: AlertIssueRow[] = POG_ITEMS.slice(0, pogCount).map((it, i) => {
    const conf = Math.round((0.78 + r(`pog-conf-${i}`) * 0.17) * 100);
    const isOverdue = r(`pog-status-${i}`) > 0.85;
    const owner = POG_OWNERS[Math.floor(r(`pog-owner-${i}`) * POG_OWNERS.length)];
    return {
      id: `pog-${i}`,
      itemName: it.itemName,
      sku: it.sku,
      department: it.dept,
      subDepartment: it.dept,
      itemClass: 'Standard',
      store: store.name,
      bay: it.bay,
      issue: it.mismatch,
      bohQty: 0,
      shelfQty: 0,
      confidenceScore: conf,
      taskStatus: isOverdue ? 'overdue' : 'open',
      taskOwner: owner,
      dueDate: isOverdue ? eacDueLabel(-4) : eacDueLabel(56),
      slaBreached: isOverdue,
      isEscalated: false,
      isAcknowledged: false,
      recommendedAction: `Correct shelf placement for ${it.itemName} · Reset to active planogram · Verify facing count in ${it.bay}`,
      signalBreakdown: `Shelf audit vs planogram: ${it.mismatch} · ${conf}% AI detection confidence · Active POG version checked`,
      evidence: `AI shelf image captured 08:45 AM · Active planogram v3.2 · ${it.bay} audit result`,
    };
  });

  const bohOverdue = bohIssues.filter(i => i.taskStatus === 'overdue').length;
  const phantomOverdue = phantomIssues.filter(i => i.taskStatus === 'overdue').length;
  const pogOverdue = pogIssues.filter(i => i.taskStatus === 'overdue').length;

  return [
    {
      id: 'boh-sync',
      name: 'BOH-to-Shelf Sync',
      shortDesc: 'Shelf gaps detected where back-of-house inventory is available. System auto-created Shelf Replenishment tasks.',
      fullDesc: 'Shelf gaps detected where back-of-house inventory is confirmed available. The system has automatically created Shelf Replenishment tasks at the SKU level routed to floor associates.',
      priority: 'High',
      category: 'Replenishment',
      metrics: [
        { label: 'Shelf Gaps', value: String(bohCount) },
        { label: 'Affected SKUs', value: `${bohCount} SKUs` },
        { label: 'BOH Available', value: `${bohUnits} units` },
        { label: 'Weekly Opportunity', value: `$${(bohOpp / 1000).toFixed(1)}K` },
      ],
      issues: bohIssues,
      autoTaskCount: bohCount,
      openTaskCount: bohCount - bohOverdue,
      overdueCount: bohOverdue,
      lastUpdated: 'Today · 09:14 AM',
    },
    {
      id: 'phantom-stock',
      name: 'Phantom Stock',
      shortDesc: 'System inventory exists but recent sales are zero or unusually low. System auto-created Inventory Check tasks.',
      fullDesc: 'High inventory records with zero recent sales, indicating stock may be trapped in the backroom or not reaching the shelf. System has auto-created Inventory Check / Cycle Count tasks.',
      priority: 'Medium',
      category: 'Inventory Risk',
      metrics: [
        { label: 'Affected SKUs', value: String(phantomCount) },
        { label: 'Units on Hand', value: `${phantomUnits} units` },
        { label: 'Avg Zero-Sales Days', value: `${phantomAvgZeroDays} days` },
        {
          label: 'Potential Sales Recovery',
          value: formatPhantomRecoveryTotal(phantomRecoveryTotal),
          tooltip: PHANTOM_RECOVERY_TOOLTIP,
        },
      ],
      issues: phantomIssues,
      autoTaskCount: phantomCount,
      openTaskCount: phantomCount - phantomOverdue,
      overdueCount: phantomOverdue,
      lastUpdated: 'Today · 06:30 AM',
    },
    {
      id: 'pog-compliance',
      name: 'POG Compliance Gap',
      shortDesc: 'Shelf image or audit results do not match the active planogram. System auto-created POG Correction tasks.',
      fullDesc: 'AI shelf audit detected mismatches between actual shelf layout and the approved planogram. System has auto-created POG Correction tasks routed to department leads.',
      priority: 'Medium',
      category: 'Compliance',
      metrics: [
        { label: 'Mismatches', value: String(pogCount) },
        { label: 'Affected SKUs', value: `${pogCount} SKUs` },
        { label: 'Affected Bays', value: `${pogBays} bays` },
      ],
      issues: pogIssues,
      autoTaskCount: pogCount,
      openTaskCount: pogCount - pogOverdue,
      overdueCount: pogOverdue,
      lastUpdated: 'Today · 08:45 AM',
    },
  ];
}

// ── Phantom Stock Heatmap — Types & Mock Data ─────────
type PhantomRisk = 'High' | 'Medium' | 'Low' | 'Minimal';
type PhantomStatus = 'Open' | 'In Progress' | 'Resolved' | 'Dismissed';

interface PhantomSkuRow { productName: string; sku: string; bohQty: number; shelfQty: number; lastSaleDate: string; zeroSalesDays: number; inventoryValue: number; riskLevel: 'High' | 'Medium' | 'Low'; }

interface PhantomRow {
  id: string; department: string; subDepartment: string; itemClass: string;
  phantomSkus: number; inventoryUnits: number; bohUnits: number; shelfQty: number;
  lastSaleDate: string; zeroSalesDays: number; inventoryValue: number;
  riskLevel: PhantomRisk; linkedTasks: number; status: PhantomStatus;
  whyFlagged: string; recommendedAction: string; skuBreakdown: PhantomSkuRow[];
}

const PHANTOM_ROWS: PhantomRow[] = [
  { id:'ps-001', department:"Women's", subDepartment:'Tops', itemClass:'Basics', phantomSkus:3, inventoryUnits:144, bohUnits:144, shelfQty:0, lastSaleDate:'Apr 28, 2026', zeroSalesDays:27, inventoryValue:8640, riskLevel:'High', linkedTasks:2, status:'Open', whyFlagged:"System shows 144 units on-hand across 3 Women's Tops SKUs, but zero sales for 27 consecutive days. Shelf image audit confirms garments are not displayed on the floor rail.", recommendedAction:"Move all units from BOH Rail C to Women's Tops floor rail. Check for backroom blockage. Initiate Inventory Check task.", skuBreakdown:[{ productName:"Women's V-Neck Basics", sku:'WOM-TOP-014', bohQty:48, shelfQty:0, lastSaleDate:'Apr 28, 2026', zeroSalesDays:27, inventoryValue:2880, riskLevel:'High' },{ productName:"Women's Classic Blazer", sku:'WOM-BLZ-001', bohQty:60, shelfQty:0, lastSaleDate:'Apr 29, 2026', zeroSalesDays:26, inventoryValue:3600, riskLevel:'High' },{ productName:'Athletic Leggings', sku:'WOM-ACT-002', bohQty:36, shelfQty:0, lastSaleDate:'Apr 30, 2026', zeroSalesDays:25, inventoryValue:2160, riskLevel:'Medium' }] },
  { id:'ps-002', department:"Men's", subDepartment:'Outerwear', itemClass:'Jackets', phantomSkus:2, inventoryUnits:96, bohUnits:96, shelfQty:0, lastSaleDate:'May 2, 2026', zeroSalesDays:23, inventoryValue:9600, riskLevel:'High', linkedTasks:1, status:'In Progress', whyFlagged:"96 units of 2 Men's Outerwear SKUs confirmed in BOH with zero floor display. Sales velocity expected at 12–15 units/week based on cluster average.", recommendedAction:"Replenish floor display from BOH Rail M5. Assign cycle count task to stock associate.", skuBreakdown:[{ productName:'Puffer Jacket', sku:'MEN-OUT-006', bohQty:60, shelfQty:0, lastSaleDate:'May 2, 2026', zeroSalesDays:23, inventoryValue:5400, riskLevel:'High' },{ productName:'Seasonal Rain Jacket', sku:'SEA-JKT-004', bohQty:36, shelfQty:0, lastSaleDate:'May 3, 2026', zeroSalesDays:22, inventoryValue:4200, riskLevel:'High' }] },
  { id:'ps-003', department:'Accessories', subDepartment:'Bags', itemClass:'Totes', phantomSkus:2, inventoryUnits:120, bohUnits:80, shelfQty:40, lastSaleDate:'May 3, 2026', zeroSalesDays:22, inventoryValue:7200, riskLevel:'High', linkedTasks:1, status:'Open', whyFlagged:'System reports 120 units across 2 Bags SKUs. Hook display has 40 units but zero sales for 22 days despite typical velocity of 8 units/week. Possible planogram mismatch hiding product.', recommendedAction:'Verify hook position matches active Accessories POG. Check if price tags are visible. Confirm product is accessible.', skuBreakdown:[{ productName:'Canvas Tote Bag', sku:'ACC-BAG-005', bohQty:48, shelfQty:24, lastSaleDate:'May 3, 2026', zeroSalesDays:22, inventoryValue:3360, riskLevel:'High' },{ productName:'Leather Crossbody Bag', sku:'ACC-BAG-011', bohQty:32, shelfQty:16, lastSaleDate:'May 5, 2026', zeroSalesDays:20, inventoryValue:3840, riskLevel:'Medium' }] },
  { id:'ps-004', department:'Seasonal', subDepartment:'Outerwear', itemClass:'Jackets', phantomSkus:1, inventoryUnits:60, bohUnits:60, shelfQty:0, lastSaleDate:'May 3, 2026', zeroSalesDays:22, inventoryValue:5100, riskLevel:'High', linkedTasks:1, status:'Open', whyFlagged:'60 units confirmed in BOH with zero floor display presence. Product trapped in backroom since last delivery.', recommendedAction:'Move 60 units from BOH Rail S3 to Seasonal Promo Table. Verify planogram position.', skuBreakdown:[{ productName:'Seasonal Rain Jacket', sku:'SEA-JKT-004', bohQty:60, shelfQty:0, lastSaleDate:'May 3, 2026', zeroSalesDays:22, inventoryValue:5100, riskLevel:'High' }] },
  { id:'ps-005', department:"Women's", subDepartment:'Dresses', itemClass:'Casual Dresses', phantomSkus:2, inventoryUnits:48, bohUnits:32, shelfQty:16, lastSaleDate:'May 7, 2026', zeroSalesDays:18, inventoryValue:5040, riskLevel:'Medium', linkedTasks:1, status:'Open', whyFlagged:'48 units across 2 casual dress SKUs with 18 days of zero sales. Possible size-run imbalance — system may be miscounting available-to-sell units.', recommendedAction:'Conduct physical size-run audit. Verify system inventory matches rail. Check for incorrect size tagging.', skuBreakdown:[{ productName:'Floral Midi Dress — Navy', sku:'WOM-DRS-014', bohQty:18, shelfQty:10, lastSaleDate:'May 7, 2026', zeroSalesDays:18, inventoryValue:2700, riskLevel:'Medium' },{ productName:'Linen Wrap Dress — White', sku:'WOM-DRS-021', bohQty:14, shelfQty:6, lastSaleDate:'May 8, 2026', zeroSalesDays:17, inventoryValue:2340, riskLevel:'Medium' }] },
  { id:'ps-006', department:"Men's", subDepartment:'Bottoms', itemClass:'Denim', phantomSkus:2, inventoryUnits:55, bohUnits:30, shelfQty:25, lastSaleDate:'May 9, 2026', zeroSalesDays:16, inventoryValue:4125, riskLevel:'Medium', linkedTasks:1, status:'In Progress', whyFlagged:"Denim inventory showing 16 days of zero sales despite 55 units on-hand. Cluster average for this class is 8 units/week. Possible display or placement issue.", recommendedAction:"Review Men's Denim rail display and ensure correct size runs are visible. Check fitting room returns are being re-railed promptly.", skuBreakdown:[{ productName:'Slim Fit Denim — Dark Wash', sku:'MEN-DNM-003', bohQty:18, shelfQty:14, lastSaleDate:'May 9, 2026', zeroSalesDays:16, inventoryValue:2250, riskLevel:'Medium' },{ productName:'Straight Leg Jeans — Black', sku:'MEN-DNM-011', bohQty:12, shelfQty:11, lastSaleDate:'May 10, 2026', zeroSalesDays:15, inventoryValue:1875, riskLevel:'Medium' }] },
  { id:'ps-007', department:'Kids', subDepartment:'Tops', itemClass:'Tees', phantomSkus:1, inventoryUnits:36, bohUnits:12, shelfQty:24, lastSaleDate:'May 12, 2026', zeroSalesDays:13, inventoryValue:1080, riskLevel:'Low', linkedTasks:0, status:'Open', whyFlagged:'36 units on-hand with 13 zero-sales days. Slightly below normal velocity but within acceptable range. May be seasonal slowdown.', recommendedAction:'Monitor for next 7 days. If sales remain zero, initiate cycle count to verify accuracy.', skuBreakdown:[{ productName:'Kids Color Block Tee', sku:'KID-TSH-012', bohQty:12, shelfQty:24, lastSaleDate:'May 12, 2026', zeroSalesDays:13, inventoryValue:1080, riskLevel:'Low' }] },
  { id:'ps-008', department:'Accessories', subDepartment:'Scarves', itemClass:'Scarves', phantomSkus:1, inventoryUnits:24, bohUnits:12, shelfQty:12, lastSaleDate:'May 14, 2026', zeroSalesDays:11, inventoryValue:1200, riskLevel:'Low', linkedTasks:0, status:'Open', whyFlagged:'24 units with 11 days zero sales. Monitor — may be slow-moving seasonal accessory.', recommendedAction:'Monitor. Initiate cycle count if zero sales continue past 14 days.', skuBreakdown:[{ productName:'Silk Blend Scarf', sku:'ACC-SCF-009', bohQty:12, shelfQty:12, lastSaleDate:'May 14, 2026', zeroSalesDays:11, inventoryValue:1200, riskLevel:'Low' }] },
  { id:'ps-009', department:'Footwear', subDepartment:"Men's Formal", itemClass:'Formal', phantomSkus:1, inventoryUnits:18, bohUnits:10, shelfQty:8, lastSaleDate:'May 11, 2026', zeroSalesDays:14, inventoryValue:2700, riskLevel:'Medium', linkedTasks:1, status:'Open', whyFlagged:'Formal footwear SKU showing 14 days zero sales with 18 units on-hand. Higher-value inventory at risk. Velocity of zero is abnormal for this class.', recommendedAction:'Verify product is on display shelf and correctly positioned. Check if size range available matches customer demand profile.', skuBreakdown:[{ productName:'Oxford Leather Shoes — Black', sku:'FTW-FRM-002', bohQty:10, shelfQty:8, lastSaleDate:'May 11, 2026', zeroSalesDays:14, inventoryValue:2700, riskLevel:'Medium' }] },
  { id:'ps-010', department:'Activewear', subDepartment:"Men's Activewear", itemClass:'Tops', phantomSkus:1, inventoryUnits:30, bohUnits:18, shelfQty:12, lastSaleDate:'May 15, 2026', zeroSalesDays:10, inventoryValue:1200, riskLevel:'Low', linkedTasks:0, status:'Open', whyFlagged:'30 units, 10 days zero sales. Below threshold for automatic task creation but flagged for monitoring.', recommendedAction:'Monitor. No action needed unless zero-sales period extends past 14 days.', skuBreakdown:[{ productName:'Athletic Compression Tee', sku:'MEN-ACT-004', bohQty:18, shelfQty:12, lastSaleDate:'May 15, 2026', zeroSalesDays:10, inventoryValue:1200, riskLevel:'Low' }] },
];


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
  const { addTasks } = useExecutionTasks();
  const [activeTab, setActiveTab] = useState<'voc' | 'inventory' | 'benchmarking' | 'phantom'>('inventory');
  // ── Phantom Stock State ──
  const [psSearch, setPsSearch] = useState('');
  const [psDeptFilter, setPsDeptFilter] = useState('');
  const [psSubDeptFilter, setPsSubDeptFilter] = useState('');
  const [psClassFilter, setPsClassFilter] = useState('');
  const [psRiskFilter, setPsRiskFilter] = useState('');
  const [psStatusFilter, setPsStatusFilter] = useState('');
  const [psPage, setPsPage] = useState(0);
  const [psDrawerRow, setPsDrawerRow] = useState<PhantomRow | null>(null);
  const PS_PAGE_SIZE = 6;
  const [inventoryView, setInventoryView] = useState<'at-risk' | 'all'>('at-risk');
  const [invPage, setInvPage] = useState(0);
  const [invSearch, setInvSearch] = useState('');
  const [invDept, setInvDept] = useState('All');
  const [invSubDept, setInvSubDept] = useState('All');
  const [invClass, setInvClass] = useState('All');
  const [invBrand, setInvBrand] = useState('All');
  const [vocExpanded, setVocExpanded] = useState(false);
  // Benchmarking section: view toggle
  const [benchView, setBenchView] = useState<'cards' | 'table'>('cards');
  // Execution Action Center state
  const [alertDrawer, setAlertDrawer] = useState<AlertBucket | null>(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  type StoreEacGroup = { id: string; type: 'boh'|'phantom'|'pog'; title: string; taskType: string; severity: 'High'|'Medium'; severityClass: 'high'|'medium'; desc: string; skuCount: number; riskValue: string; taskTotal: number; taskOpen: number; taskProg: number; taskSub: number; taskOver: number; lastDetected: string; evidence: { label: string; value: string }[]; skus: { name: string; sku: string; dept: string; detail: string; status: 'critical'|'progress'|'submitted'; tasks: number }[] };
  const [storeEacDrawer, setStoreEacDrawer] = useState<StoreEacGroup | null>(null);
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());
  const [dismissedMap, setDismissedMap] = useState<Map<string, string>>(new Map());
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissTargetId, setDismissTargetId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState('');
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
        setSelectedStoreId(match.id);
        window.scrollTo(0, 0);
        scrollRef.current?.scrollTo(0, 0);
      }
    }
  }, [searchParams]);

  const store = storesData.find(s => s.id === selectedStoreId) || storesData[0];
  const auditData = getAuditData(store);
  void getAIInsight(store); // kept for future AI insight panel
  const vocData = getVoCData(store);
  const inventoryData = getInventoryData(store);
  const invDeptOptions = useMemo(
    () => buildInvFilterOptions(inventoryData, 'department', 'All Departments'),
    [inventoryData],
  );
  const invSubDeptOptions = useMemo(
    () => buildInvFilterOptions(inventoryData, 'subDept', 'All Sub Depts'),
    [inventoryData],
  );
  const invClassOptions = useMemo(
    () => buildInvFilterOptions(inventoryData, 'itemClass', 'All Classes'),
    [inventoryData],
  );
  const invBrandOptions = useMemo(
    () => buildInvFilterOptions(inventoryData, 'brand', 'All Brands'),
    [inventoryData],
  );
  const invFiltersActive =
    invSearch.trim() !== '' ||
    invDept !== 'All' ||
    invSubDept !== 'All' ||
    invClass !== 'All' ||
    invBrand !== 'All';
  const clearInvFilters = useCallback(() => {
    setInvSearch('');
    setInvDept('All');
    setInvSubDept('All');
    setInvClass('All');
    setInvBrand('All');
    setInvPage(0);
  }, []);

  const psFiltersActive =
    psSearch.trim() !== '' ||
    psDeptFilter !== '' ||
    psSubDeptFilter !== '' ||
    psClassFilter !== '' ||
    psRiskFilter !== '' ||
    psStatusFilter !== '';
  const clearPsFilters = useCallback(() => {
    setPsSearch('');
    setPsDeptFilter('');
    setPsSubDeptFilter('');
    setPsClassFilter('');
    setPsRiskFilter('');
    setPsStatusFilter('');
    setPsPage(0);
  }, []);

  // alertBuckets kept for legacy drawer wiring (hidden block below)
  const alertBuckets = getAlertBuckets(store); void alertBuckets;

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

  // ── Execution Action Center helpers ──
  const openDismissModal = (issueId: string) => {
    setDismissTargetId(issueId);
    setDismissReason('');
    setShowDismissModal(true);
  };

  const confirmDismiss = () => {
    if (!dismissTargetId || !dismissReason) return;
    setDismissedMap(prev => new Map(prev).set(dismissTargetId, dismissReason));
    setShowDismissModal(false);
    setDismissTargetId(null);
    setDismissReason('');
  };

  const openAllInOpsQueue = (bucket: AlertBucket) => {
    bucket.issues.forEach(issue => {
      const isBoh = bucket.id === 'boh-sync';
      addTasks([{
        id: `eac-${bucket.id}-${issue.id}`,
        type: isBoh ? 'Move' : bucket.id === 'phantom-stock' ? 'Reset Shelf' : 'Adjust Facing',
        title: isBoh
          ? `Replenish shelf from BOH: ${issue.itemName}`
          : bucket.id === 'phantom-stock'
          ? `Inventory Check — Phantom Stock: ${issue.itemName}`
          : `POG Correction: ${issue.itemName}`,
        description: issue.signalBreakdown,
        skuName: issue.itemName,
        skuId: issue.sku,
        priority: bucket.priority as 'High' | 'Medium' | 'Low',
        reason: issue.issue,
        impact: issue.weeklyOpportunity ? `$${issue.weeklyOpportunity}/week opportunity` : issue.evidence,
        status: 'Pending',
        assignedTo: null,
        dueDate: new Date().toISOString().split('T')[0],
        storeName: store.name,
        storeGroup: store.cluster,
        pogName: `${issue.department} Shelf`,
        category: issue.department,
        createdAt: new Date().toISOString(),
        localizationId: `${store.id}-eac-${bucket.id}`,
        source: 'BOH Alert',
        confidenceScore: issue.confidenceScore,
      }]);
    });
    navigate('/store-operations/task-center');
  };

  return (
    <div className="sc-container">

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

          {/* AI Daily Brief (shared component) */}
          <div className="pulse-right-panel">
            <AIDailyBrief
              brief={getStoreBrief(store)}
              userName={user?.name}
            />
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
                      color={bc.priority === 'critical' ? 'error' : bc.priority === 'high' ? 'warning' : 'info'}
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
                            color={bc.priority === 'critical' ? 'error' : bc.priority === 'high' ? 'warning' : 'info'}
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

        {/* ── Store Execution Issues ── */}
        {(() => {
          const storeEacGroups: StoreEacGroup[] = [
            {
              id: 'boh-to-shelf', type: 'boh', title: 'BOH-to-Shelf Sync', taskType: 'Shelf Replenishment',
              severity: 'High', severityClass: 'high',
              desc: `Shelf gaps detected with available backroom inventory in ${store.name}. Products are confirmed in BOH but missing from shelf.`,
              skuCount: 7, riskValue: '$4.2K', taskTotal: 7, taskOpen: 3, taskProg: 3, taskSub: 1, taskOver: 1,
              lastDetected: '4 min ago',
              evidence: [
                { label: 'Departments affected', value: 'Personal Care, Baby, Household' },
                { label: 'BOH available units', value: '184 units confirmed in backroom' },
                { label: 'Signal source', value: 'Inventory scan + shelf sensor' },
                { label: 'SLA', value: 'Same-day (High priority)' },
              ],
              skus: [
                { name: "Women's V-Neck Basics", sku: 'WOM-TOP-014', dept: "Women's",    detail: 'BOH: 32 units · Rail: 0 · Last scan 1h ago', status: 'critical', tasks: 1 },
                { name: 'Slim Fit Denim — Dark',  sku: 'MEN-DNM-003', dept: "Men's",     detail: 'BOH: 18 units · Rail: 0 · Replenishment in progress', status: 'progress', tasks: 1 },
                { name: 'Canvas Tote Bag',         sku: 'ACC-BAG-005', dept: 'Accessories',detail: 'BOH: 24 units · Hook: 0 · 3 open tasks', status: 'critical', tasks: 1 },
                { name: 'Seasonal Rain Jacket',    sku: 'SEA-JKT-004', dept: 'Seasonal',  detail: 'BOH: 28 units · Rail: 0 · Submitted for review', status: 'submitted', tasks: 1 },
              ],
            },
            {
              id: 'phantom-stock', type: 'phantom', title: 'Phantom Stock', taskType: 'Inventory Check / Cycle Count',
              severity: 'Medium', severityClass: 'medium',
              desc: `14 SKUs in ${store.name} have system inventory but zero sales for 14+ days. Possible count discrepancy.`,
              skuCount: 14, riskValue: '$8.6K', taskTotal: 6, taskOpen: 3, taskProg: 2, taskSub: 1, taskOver: 0,
              lastDetected: '12 min ago',
              evidence: [
                { label: 'Zero-sales threshold', value: '14+ days with system stock > 0' },
                { label: 'Highest risk department', value: 'Household (5 SKUs, $3.2K)' },
                { label: 'Signal source', value: 'POS + inventory system cross-check' },
                { label: 'SLA', value: '24–48h (Medium priority)' },
              ],
              skus: [
                { name: 'Puffer Jacket',             sku: 'MEN-OUT-006', dept: "Men's",      detail: '18 units BOH · 0 sales in 21 days · $1.8K at risk', status: 'progress', tasks: 1 },
                { name: "Women's Classic Blazer",   sku: 'WOM-BLZ-001', dept: "Women's",    detail: '12 units BOH · 0 sales in 17 days · $1.1K at risk', status: 'critical', tasks: 1 },
                { name: 'Kids Party Dress',          sku: 'KID-DRS-008', dept: 'Kids',       detail: '22 units BOH · 0 sales in 16 days · $1.1K at risk', status: 'critical', tasks: 1 },
                { name: 'Leather Crossbody Bag',     sku: 'ACC-BAG-011', dept: 'Accessories',detail: '9 units BOH · 0 sales in 14 days · $1.1K at risk', status: 'submitted', tasks: 1 },
              ],
            },
            {
              id: 'pog-compliance', type: 'pog', title: 'POG Compliance Gap', taskType: 'POG Correction',
              severity: 'High', severityClass: 'high',
              desc: `Camera audit detected planogram deviations in ${store.name}. Shelf layout does not match active POG.`,
              skuCount: 3, riskValue: '$2.8K', taskTotal: 4, taskOpen: 2, taskProg: 1, taskSub: 1, taskOver: 1,
              lastDetected: '8 min ago',
              evidence: [
                { label: 'Audit source', value: 'Camera shelf scan + POG comparison' },
                { label: 'Deviations detected', value: '3 fixtures with misplacements' },
                { label: 'Active POG', value: 'Spring Reset 2026 v3.1' },
                { label: 'SLA', value: '24–72h (High priority)' },
              ],
              skus: [
                { name: "Women's Wall 3A",   sku: 'Fixture 3A', dept: "Women's",    detail: '3 POG deviations detected · Wrong rail placement', status: 'critical', tasks: 2 },
                { name: 'Accessories End Cap 7B', sku: 'Fixture 7B', dept: 'Accessories', detail: 'Correction in progress · Missing facing count', status: 'progress', tasks: 1 },
                { name: 'Kids Section 2C',   sku: 'Fixture 2C', dept: 'Kids',       detail: 'Submitted for review', status: 'submitted', tasks: 1 },
              ],
            },
          ];
          const totalTasks = storeEacGroups.reduce((s,g)=>s+g.taskTotal,0);
          const totalOpen  = storeEacGroups.reduce((s,g)=>s+g.taskOpen,0);
          const totalProg  = storeEacGroups.reduce((s,g)=>s+g.taskProg,0);
          const totalSub   = storeEacGroups.reduce((s,g)=>s+g.taskSub,0);
          const totalOver  = storeEacGroups.reduce((s,g)=>s+g.taskOver,0);
          return (
        <div className="eac2-section eac2-section--store">
          <div className="eac2-header">
            <div className="eac2-header-top">
              <div className="eac2-title-block">
                <div className="eac2-icon-wrap">
                  <BoltOutlined sx={{ fontSize: 18 }}/>
                </div>
                <div className="eac2-title-text">
                  <h2 className="eac2-title">Alerts</h2>
                  <p className="eac2-subtitle">System-generated issues and linked tasks for {store.name}</p>
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
            <div className="eac2-summary-strip">
              {[
                { val: totalTasks, lbl:'Auto Tasks', cls:'' },
                { val: totalOpen,  lbl:'Open',       cls:'eac2-summary-tile-val--open' },
                { val: totalProg,  lbl:'In Progress',cls:'eac2-summary-tile-val--prog' },
                { val: totalSub,   lbl:'Submitted',  cls:'eac2-summary-tile-val--sub' },
                { val: totalOver,  lbl:'Overdue',    cls:'eac2-summary-tile-val--over' },
              ].map(t => (
                <div key={t.lbl} className="eac2-summary-tile">
                  <span className={`eac2-summary-tile-val ${t.cls}`}>{t.val}</span>
                  <span className="eac2-summary-tile-lbl">{t.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── EAC card grid — stacked rows ── */}
          <div className="eac2-cards-grid">
            {storeEacGroups.map(g => {
              const pctOpen = Math.round((g.taskOpen / g.taskTotal) * 100);
              const pctProg = Math.round((g.taskProg / g.taskTotal) * 100);
              const pctSub  = Math.round((g.taskSub  / g.taskTotal) * 100);
              const pctOver = Math.round((g.taskOver / g.taskTotal) * 100);
              return (
                <div key={g.id} className={`eac2-card eac2-card--${g.type}`} onClick={() => setStoreEacDrawer(g)}>

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
                        <InventoryOutlined sx={{ fontSize: 13 }}/> <strong>{g.skuCount}</strong> SKUs
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
                        onClick={e => { e.stopPropagation(); setStoreEacDrawer(g); }}
                      >
                        View Evidence
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
                                title: `${g.title} — ${store.name}`,
                                description: `${g.taskType}: ${g.desc}`,
                                severity: g.severity === 'High' ? 'critical' : 'warning',
                                source: 'Automated Execution Alert',
                                stores: [{ name: store.name, manager: store.manager, detail: g.desc }],
                              },
                            },
                          });
                        }}
                      >
                        Open Tasks
                      </Button>
                      <span className="eac2-last-detected">{g.lastDetected}</span>
                    </div>
                  </div>

                  {/* RIGHT: task panel — 2×2 stat grid */}
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
          );
        })()}

        {/* ── Store EAC Drawer ── */}
        {storeEacDrawer && (
          <>
            <div className="eac2-drawer-overlay" onClick={() => setStoreEacDrawer(null)}/>
            <div className="eac2-drawer">
              {/* ── Hero header ── */}
              <div className="eac2-drawer-header">
                <div className="eac2-drawer-hero-top">
                  <div className="eac2-drawer-hero-id">
                    <div className={`eac2-drawer-header-icon eac2-drawer-header-icon--${storeEacDrawer.type}`}>
                      {storeEacDrawer.type === 'boh'     && <SyncOutlined sx={{ fontSize: 16 }}/>}
                      {storeEacDrawer.type === 'phantom' && <InventoryOutlined sx={{ fontSize: 16 }}/>}
                      {storeEacDrawer.type === 'pog'     && <GridOnOutlined sx={{ fontSize: 16 }}/>}
                    </div>
                    <span className="eac2-drawer-type">{storeEacDrawer.taskType}</span>
                  </div>
                  <button className="eac2-drawer-close" onClick={() => setStoreEacDrawer(null)}>
                    <CloseOutlined sx={{ fontSize: 18 }}/>
                  </button>
                </div>
                <h2 className="eac2-drawer-title">{storeEacDrawer.title}</h2>
                <div className="eac2-drawer-hero-pills">
                  <span className={`eac2-drawer-pill eac2-drawer-pill--${storeEacDrawer.severityClass}`}>{storeEacDrawer.severity} Severity</span>
                  <span className="eac2-drawer-pill eac2-drawer-pill--auto">⚡ Auto-Monitored</span>
                  <span className="eac2-drawer-pill eac2-drawer-pill--stores">{store.name}</span>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="eac2-drawer-body">
                {/* Issue Summary block */}
                <div className="eac2-drawer-block">
                  <div className="eac2-drawer-block-label">
                    <WarningAmberOutlined sx={{ fontSize: 11 }}/> Issue Summary
                  </div>
                  <div className={`eac2-drawer-risk-banner eac2-drawer-risk-banner--${storeEacDrawer.severityClass}`}>
                    <WarningAmberOutlined sx={{ fontSize: 15 }} className="eac2-drawer-risk-banner-icon"/>
                    <div>
                      <p className="eac2-drawer-risk-title">{storeEacDrawer.skuCount} SKUs · {storeEacDrawer.riskValue} inventory at risk</p>
                      <p className="eac2-drawer-risk-desc">{storeEacDrawer.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Signal Evidence block */}
                <div className="eac2-drawer-block">
                  <div className="eac2-drawer-block-label">
                    <InfoOutlined sx={{ fontSize: 11 }}/> Signal Evidence
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {storeEacDrawer.evidence.map((e,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                        <span style={{ fontSize:'11.5px', color:'#64748b', fontWeight:600 }}>{e.label}</span>
                        <span style={{ fontSize:'11.5px', color:'#0f172a', fontWeight:600, textAlign:'right' }}>{e.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Status block */}
                <div className="eac2-drawer-block">
                  <div className="eac2-drawer-block-label">
                    <TaskAltOutlined sx={{ fontSize: 11 }}/> Auto-Created Task Status · {storeEacDrawer.taskTotal} total
                  </div>
                  <div className="eac2-drawer-stats">
                    {[
                      { val: storeEacDrawer.taskOpen, lbl: 'Open' },
                      { val: storeEacDrawer.taskProg, lbl: 'In Progress' },
                      { val: storeEacDrawer.taskSub,  lbl: 'Submitted' },
                      { val: storeEacDrawer.taskOver, lbl: 'Overdue' },
                    ].map(s => (
                      <div key={s.lbl} className="eac2-drawer-stat-tile">
                        <span className="eac2-drawer-stat-val">{s.val}</span>
                        <span className="eac2-drawer-stat-lbl">{s.lbl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impacted SKUs / Fixtures block */}
                <div className="eac2-drawer-block">
                  <div className="eac2-drawer-block-label">
                    <InventoryOutlined sx={{ fontSize: 11 }}/> {storeEacDrawer.type === 'pog' ? 'Impacted Fixtures' : 'Impacted SKUs'} ({storeEacDrawer.skus.length})
                  </div>
                  <div className="eac2-entity-list">
                    {storeEacDrawer.skus.map((s, i) => (
                      <div key={i} className={`eac2-entity-card eac2-entity-card--${s.status}`}>
                        <div className="eac2-entity-header">
                          <span className="eac2-entity-name">{s.name}</span>
                          <span className={`eac2-entity-status-badge eac2-entity-status-badge--${s.status}`}>
                            {s.status === 'critical' ? 'Open' : s.status === 'progress' ? 'In Progress' : 'Submitted'}
                          </span>
                        </div>
                        <div className="eac2-entity-detail">{s.sku} · {s.dept} · {s.detail}</div>
                        <div className="eac2-entity-manager">
                          <PersonOutlined sx={{ fontSize: 12 }}/> Assigned to <strong>{store.manager}</strong>
                        </div>
                        <div className="eac2-entity-task-row">
                          <span className="eac2-entity-task-info">
                            <TaskAltOutlined sx={{ fontSize: 12 }}/> {s.tasks} task{s.tasks>1?'s':''}
                          </span>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            endIcon={<KeyboardArrowRight sx={{ fontSize: 12 }}/>}
                            onClick={() => {
                              setStoreEacDrawer(null);
                              navigate('/command-center/operations-queue', {
                                state: {
                                  prefillFromAlert: {
                                    alertId: `${storeEacDrawer.id}-${s.sku}`,
                                    title: `${storeEacDrawer.title} — ${s.name}`,
                                    description: `${s.dept}: ${s.detail}`,
                                    severity: storeEacDrawer.severity === 'High' ? 'critical' : 'warning',
                                    source: 'Automated Execution Alert',
                                    stores: [{ name: store.name, manager: store.manager, detail: s.detail }],
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
                    setStoreEacDrawer(null);
                    navigate('/command-center/operations-queue', {
                      state: {
                        prefillFromAlert: {
                          alertId: storeEacDrawer.id,
                          title: `${storeEacDrawer.title} — ${store.name}`,
                          description: `${storeEacDrawer.taskType}: ${storeEacDrawer.desc}`,
                          severity: storeEacDrawer.severity === 'High' ? 'critical' : 'warning',
                          source: 'Automated Execution Alert',
                          stores: [{ name: store.name, manager: store.manager, detail: storeEacDrawer.desc }],
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
                  onClick={() => setStoreEacDrawer(null)}
                >
                  Close
                </Button>
              </div>
              <div className="eac2-drawer-timestamp">
                <AccessTimeOutlined sx={{ fontSize: 12 }}/> Last detected {storeEacDrawer.lastDetected} · Auto-assigned to {store.manager}
              </div>
            </div>
          </>
        )}

        {/* ── LEGACY BLOCK REMOVED ── */}
        {alertDrawer != null && null}
        {/* legacy drawer removed — dismiss modal below still uses alertDrawer state */}
        {false && <div className="sc-alert-overlay-LEGACY" onClick={() => setAlertDrawer(null)}>
            <div className="sc-alert-drawer eac-task-drawer" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="sc-alert-drawer-header">
                <div className="sc-alert-drawer-title-block">
                  <div className="sc-alert-drawer-eyebrow">
                    <Badge
                      label={`${alertDrawer!.priority} Priority`}
                      color={alertDrawer!.priority === 'High' ? 'error' : 'warning'}
                      variant="subtle"
                      size="small"
                    />
                    <Badge
                      label={alertDrawer!.category}
                      color="info"
                      variant="subtle"
                      size="small"
                    />
                    <span className="eac-source-badge">
                      <BoltOutlined sx={{ fontSize: 10 }}/>
                      Automated Execution Alert
                    </span>
                  </div>
                  <h2 className="sc-alert-drawer-name">{alertDrawer!.name}</h2>
                  <p className="sc-alert-drawer-sub">{alertDrawer!.fullDesc}</p>
                </div>
                <button className="sc-alert-drawer-close" onClick={() => setAlertDrawer(null)}>
                  <CloseOutlined sx={{ fontSize: 20 }}/>
                </button>
              </div>

              {/* Summary stats */}
              <div className="sc-alert-drawer-summary">
                {alertDrawer!.metrics.map(m => (
                  <div key={m.label} className="sc-alert-summary-stat">
                    <span className="sc-alert-summary-val">{m.value}</span>
                    <span className="sc-alert-summary-lbl">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Task count bar */}
              <div className="sc-alert-drawer-actions">
                <div className="sc-alert-drawer-count-block">
                  <span className="sc-alert-drawer-count">{alertDrawer!.autoTaskCount} auto-created tasks</span>
                  <span className="sc-alert-drawer-count-sub">
                    {alertDrawer!.openTaskCount} open · {alertDrawer!.overdueCount} overdue · Last detected {alertDrawer!.lastUpdated}
                  </span>
                </div>
                <div className="sc-alert-drawer-action-btns">
                  <Button variant="outlined" color="primary" size="small"
                    startIcon={<LaunchOutlined sx={{ fontSize: 14 }}/>}
                    onClick={() => openAllInOpsQueue(alertDrawer!)}>
                    Open All in Ops Queue
                  </Button>
                </div>
              </div>

              {/* Task list */}
              <div className="sc-alert-drawer-issues">
                {alertDrawer!.issues.map(issue => {
                  const isAck = acknowledgedIds.has(issue.id);
                  const isResolved = resolvedIds.has(issue.id);
                  const isEsc = escalatedIds.has(issue.id);
                  const isDismissed = dismissedMap.has(issue.id);
                  const effectiveStatus = isDismissed ? 'dismissed' : isResolved ? 'resolved' : isEsc ? 'escalated' : isAck ? 'in-progress' : issue.taskStatus;
                  const isBoh = alertDrawer!.id === 'boh-sync';
                  const isPhantom = alertDrawer!.id === 'phantom-stock';
                  return (
                    <div key={issue.id} className={`eac-task-card eac-task-card--${effectiveStatus}`}>
                      {/* Row 1: product info + status */}
                      <div className="eac-task-card-top">
                        <div className="eac-task-product-img">
                          <InventoryOutlined sx={{ fontSize: 20, color: 'var(--ia-color-text-tertiary)' }}/>
                        </div>
                        <div className="eac-task-product-info">
                          <span className="eac-task-sku-name">{issue.itemName}</span>
                          <span className="eac-task-sku-id">SKU {issue.sku}</span>
                          <span className="eac-task-dept">{issue.department}{issue.subDepartment !== issue.department ? ` · ${issue.subDepartment}` : ''} · {issue.itemClass}</span>
                        </div>
                        <div className="eac-task-status-col">
                          <span className={`eac-task-status eac-task-status--${effectiveStatus}`}>
                            {effectiveStatus === 'open' ? 'Open' : effectiveStatus === 'in-progress' ? 'In Progress' : effectiveStatus === 'overdue' ? 'Overdue' : effectiveStatus === 'escalated' ? 'Escalated' : effectiveStatus === 'resolved' ? 'Resolved' : 'Dismissed'}
                          </span>
                          {issue.confidenceScore && (
                            <span className="eac-task-confidence">AI {issue.confidenceScore}%</span>
                          )}
                        </div>
                      </div>

                      {/* Reason + Signal + Evidence */}
                      <div className="eac-task-detail-rows">
                        <div className="eac-task-detail-row">
                          <span className="eac-task-detail-lbl">Reason Detected</span>
                          <span className="eac-task-detail-val">
                            <WarningAmberOutlined sx={{ fontSize: 12 }} className="eac-detail-icon-warn"/>
                            {issue.issue}
                          </span>
                        </div>
                        <div className="eac-task-detail-row">
                          <span className="eac-task-detail-lbl">Signal Breakdown</span>
                          <span className="eac-task-detail-val">{issue.signalBreakdown}</span>
                        </div>
                        <div className="eac-task-detail-row">
                          <span className="eac-task-detail-lbl">Evidence</span>
                          <span className="eac-task-detail-val eac-evidence-val">
                            <DescriptionOutlined sx={{ fontSize: 11 }}/>
                            {issue.evidence}
                          </span>
                        </div>
                      </div>

                      {/* Stat strip */}
                      <div className="eac-task-stat-strip">
                        {isBoh && <>
                          <div className="eac-task-stat">
                            <span className="eac-task-stat-lbl">BOH Available</span>
                            <span className="eac-task-stat-val eac-task-stat-val--pos">{issue.bohQty} units</span>
                          </div>
                          <div className="eac-task-stat">
                            <span className="eac-task-stat-lbl">Shelf Detected</span>
                            <span className="eac-task-stat-val eac-task-stat-val--neg">{issue.shelfQty} units</span>
                          </div>
                          {issue.weeklyOpportunity != null && (
                            <div className="eac-task-stat">
                              <span className="eac-task-stat-lbl">Weekly Opportunity</span>
                              <span className="eac-task-stat-val eac-task-stat-val--opp">${issue.weeklyOpportunity}/wk</span>
                            </div>
                          )}
                        </>}
                        {isPhantom && <>
                          <div className="eac-task-stat">
                            <span className="eac-task-stat-lbl">Units on Hand</span>
                            <span className="eac-task-stat-val">{issue.bohQty} units</span>
                          </div>
                          {issue.zeroSalesDays != null && (
                            <div className="eac-task-stat">
                              <span className="eac-task-stat-lbl">Zero-Sales Days</span>
                              <span className="eac-task-stat-val eac-task-stat-val--neg">{issue.zeroSalesDays} days</span>
                            </div>
                          )}
                          {issue.recoveryEstimate != null && (
                            <div className="eac-task-stat" title={PHANTOM_RECOVERY_TOOLTIP}>
                              <span className="eac-task-stat-lbl">Recovery Est.</span>
                              <span className="eac-task-stat-val eac-task-stat-val--opp">${Math.round(issue.recoveryEstimate)}/wk</span>
                            </div>
                          )}
                        </>}
                        {!isBoh && !isPhantom && issue.confidenceScore != null && (
                          <div className="eac-task-stat">
                            <span className="eac-task-stat-lbl">AI Confidence</span>
                            <span className="eac-task-stat-val">{issue.confidenceScore}%</span>
                          </div>
                        )}
                      </div>

                      {/* Owner + SLA */}
                      <div className="eac-task-meta-row">
                        <span className="eac-task-meta-item">
                          <PersonOutlined sx={{ fontSize: 12 }}/>
                          {issue.taskOwner}
                        </span>
                        <span className="eac-task-meta-item eac-task-meta-item--sla">
                          <ScheduleOutlined sx={{ fontSize: 12 }}/>
                          Due: {issue.dueDate}
                        </span>
                        {(issue.slaBreached || effectiveStatus === 'overdue') && (
                          <span className="eac-sla-breach-tag">
                            <TimerOutlined sx={{ fontSize: 10 }}/>
                            SLA Breached
                          </span>
                        )}
                        {(issue.isEscalated || effectiveStatus === 'escalated') && (
                          <span className="eac-escalated-tag">
                            <FlagOutlined sx={{ fontSize: 10 }}/>
                            Escalated to DM
                          </span>
                        )}
                      </div>

                      {/* Recommended action */}
                      {!isDismissed && !isResolved && (
                        <div className="eac-task-rec-action">
                          <AutoAwesomeOutlined sx={{ fontSize: 12 }}/>
                          <span>{issue.recommendedAction}</span>
                        </div>
                      )}

                      {/* Dismissed reason */}
                      {isDismissed && (
                        <div className="eac-dismissed-reason">
                          <BlockOutlined sx={{ fontSize: 12 }}/>
                          <span>Dismissed: {dismissedMap.get(issue.id)}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isResolved && !isDismissed && (
                        <div className="eac-task-actions">
                          {!isAck && !isEsc && (
                            <Button variant="outlined" color="primary" size="small"
                              startIcon={<CheckOutlined sx={{ fontSize: 13 }}/>}
                              onClick={() => setAcknowledgedIds(prev => new Set(prev).add(issue.id))}>
                              Acknowledge
                            </Button>
                          )}
                          <Button variant="outlined" color="primary" size="small"
                            startIcon={<CheckCircleOutlined sx={{ fontSize: 13 }}/>}
                            onClick={() => setResolvedIds(prev => new Set(prev).add(issue.id))}>
                            Mark Resolved
                          </Button>
                          {!isEsc && (
                            <Button variant="outlined" size="small"
                              startIcon={<FlagOutlined sx={{ fontSize: 13 }}/>}
                              onClick={() => setEscalatedIds(prev => new Set(prev).add(issue.id))}>
                              Escalate
                            </Button>
                          )}
                          <Button variant="text" size="small" color="primary"
                            startIcon={<BlockOutlined sx={{ fontSize: 13 }}/>}
                            onClick={() => openDismissModal(issue.id)}>
                            Dismiss
                          </Button>
                          <Button variant="text" size="small" color="primary"
                            startIcon={<LaunchOutlined sx={{ fontSize: 13 }}/>}
                            onClick={() => navigate('/store-operations/task-center')}>
                            Open in Ops Queue
                          </Button>
                        </div>
                      )}
                      {(isResolved || isDismissed) && (
                        <div className="eac-task-actions">
                          <Button variant="text" size="small" color="primary"
                            startIcon={<LaunchOutlined sx={{ fontSize: 13 }}/>}
                            onClick={() => navigate('/store-operations/task-center')}>
                            View in Ops Queue
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drawer footer */}
              <div className="sc-alert-drawer-footer">
                <Button variant="outlined" color="primary" size="medium" onClick={() => setAlertDrawer(null)}>Close</Button>
                <Button variant="contained" color="primary" size="medium"
                  startIcon={<LaunchOutlined sx={{ fontSize: 16 }}/>}
                  onClick={() => openAllInOpsQueue(alertDrawer!)}>
                  Open All in Ops Queue
                </Button>
              </div>
            </div>
          </div>}

        {/* ── Dismiss Reason Modal ─────────────────────────── */}
        {showDismissModal && dismissTargetId && (
          <div className="sc-task-confirm-overlay" onClick={() => setShowDismissModal(false)}>
            <div className="sc-task-confirm-modal eac-dismiss-modal" onClick={e => e.stopPropagation()}>
              <div className="sc-task-confirm-header">
                <h4>Dismiss Task</h4>
                <button className="sc-alert-drawer-close" onClick={() => setShowDismissModal(false)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
              <div className="sc-task-confirm-body">
                <p className="eac-dismiss-prompt">Select a reason for dismissing this task. This will also update the linked alert issue status.</p>
                <div className="eac-dismiss-reasons">
                  {DISMISS_REASONS.map(reason => (
                    <button
                      key={reason}
                      className={`eac-dismiss-reason${dismissReason === reason ? ' selected' : ''}`}
                      onClick={() => setDismissReason(reason)}
                    >
                      {dismissReason === reason && <CheckOutlined sx={{ fontSize: 13 }}/>}
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sc-task-confirm-footer">
                <Button variant="outlined" color="primary" size="medium" onClick={() => setShowDismissModal(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  disabled={!dismissReason}
                  startIcon={<BlockOutlined sx={{ fontSize: 16 }}/>}
                  onClick={confirmDismiss}
                >
                  Confirm Dismissal
                </Button>
              </div>
            </div>
          </div>
        )}

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
              { value: 'phantom', label: 'Phantom Stock', icon: <ShieldOutlined sx={{ fontSize: 14 }}/> },
              { value: 'voc', label: 'VoC Analysis', icon: <FavoriteOutlined sx={{ fontSize: 14 }}/> },
              { value: 'benchmarking', label: 'Comp Benchmarking', icon: <BarChartOutlined sx={{ fontSize: 14 }}/> },
            ]}
            tabPanels={[]}
            value={activeTab}
            onChange={(_, val) => setActiveTab(val as 'inventory' | 'phantom' | 'voc' | 'benchmarking')}
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

              const INV_PAGE_SIZE = 8;
              const searchLower = invSearch.trim().toLowerCase();
              const filteredInventory = inventoryEnriched
                .filter(i =>
                  (inventoryView === 'all' || i.risk !== 'healthy') &&
                  (invDept === 'All' || i.department === invDept) &&
                  (invSubDept === 'All' || i.subDept === invSubDept) &&
                  (invClass === 'All' || i.itemClass === invClass) &&
                  (invBrand === 'All' || i.brand === invBrand) &&
                  (searchLower === '' ||
                    i.name.toLowerCase().includes(searchLower) ||
                    i.sku.toLowerCase().includes(searchLower)),
                )
                .sort((a, b) => RISK_RANK[a.risk] - RISK_RANK[b.risk] || a.daysOfSupply - b.daysOfSupply);

              const handleShareInventory = () => {
                const headers = [
                  'SKU', 'Product', 'Department', 'Sub Dept', 'Class', 'Brand',
                  'Risk', 'Status', 'Store On Hand', 'On Order', 'In Transit', 'FWOS',
                ];
                const escapeCsv = (val: string | number) => {
                  const s = String(val);
                  return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
                };
                const rows = filteredInventory.map(i => [
                  i.sku,
                  i.name,
                  i.department,
                  i.subDept,
                  i.itemClass,
                  i.brand,
                  RISK_LABELS[i.risk],
                  i.status,
                  i.quantity,
                  i.onOrder,
                  i.inTransit,
                  i.daysOfSupply > 0 ? `${Math.round(i.daysOfSupply / 7)}w` : '0',
                ]);
                const csv = [headers, ...rows].map(r => r.map(escapeCsv).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `inventory-${store.number}-${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              };

              const totalInvPages = Math.ceil(filteredInventory.length / INV_PAGE_SIZE);
              const currentInvPage = Math.min(invPage, Math.max(0, totalInvPages - 1));
              const pagedInventory = filteredInventory.slice(
                currentInvPage * INV_PAGE_SIZE,
                (currentInvPage + 1) * INV_PAGE_SIZE,
              );

              const criticalSkus = inventoryEnriched.filter(i => i.risk === 'critical');
              const insightLine = totalAtRisk === 0
                ? 'All SKUs are healthy. Maintain current replenishment cadence.'
                : `${totalAtRisk} SKU${totalAtRisk === 1 ? '' : 's'} need attention${criticalSkus.length > 0 ? ` — prioritize ${criticalSkus.slice(0, 2).map(s => s.name).join(' and ')}` : ''}${delayedInboundCount > 0 ? `; ${delayedInboundCount} inbound shipment${delayedInboundCount === 1 ? ' is' : 's are'} delayed` : ''}.`;
              const recommendation = criticalSkus.length > 0
                ? `Expedite replenishment for ${criticalSkus.length} OOS SKU${criticalSkus.length === 1 ? '' : 's'}${delayedInboundCount > 0 ? ` and follow up with DC on the ${delayedInboundCount} delayed shipment${delayedInboundCount === 1 ? '' : 's'}` : ''}.`
                : delayedInboundCount > 0
                  ? `Follow up with DC on ${delayedInboundCount} delayed shipment${delayedInboundCount === 1 ? '' : 's'} to prevent OOS escalation.`
                  : `Monitor low-FWOS SKUs daily; trigger reorder when FWOS drops below 1 week.`;

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

                  {/* Filter bar — premium single-row */}
                  <div className="sc-inv-premium-filter-bar">
                    <div className="sc-inv-search">
                      <SearchOutlined sx={{ fontSize: 15 }}/>
                      <input
                        type="text"
                        placeholder="Search products or SKU…"
                        value={invSearch}
                        onChange={e => {
                          setInvSearch(e.target.value);
                          setInvPage(0);
                        }}
                      />
                      {invSearch && (
                        <button
                          className="sc-inv-search-clear"
                          onClick={() => { setInvSearch(''); setInvPage(0); }}
                          aria-label="Clear search"
                        >
                          <CloseOutlined sx={{ fontSize: 13 }}/>
                        </button>
                      )}
                    </div>
                    <div className="sc-inv-filter-divider" aria-hidden="true"/>
                    <div className="sc-inv-filter-fields">
                      <ImFilterSelect
                        placeholder="Department"
                        value={invDept}
                        options={invDeptOptions}
                        isClearable={invDept !== 'All'}
                        minWidth={168}
                        onChange={v => {
                          setInvDept(v || 'All');
                          setInvPage(0);
                        }}
                      />
                      <ImFilterSelect
                        placeholder="Sub Dept"
                        value={invSubDept}
                        options={invSubDeptOptions}
                        isClearable={invSubDept !== 'All'}
                        minWidth={168}
                        onChange={v => {
                          setInvSubDept(v || 'All');
                          setInvPage(0);
                        }}
                      />
                      <ImFilterSelect
                        placeholder="Class"
                        value={invClass}
                        options={invClassOptions}
                        isClearable={invClass !== 'All'}
                        minWidth={148}
                        onChange={v => {
                          setInvClass(v || 'All');
                          setInvPage(0);
                        }}
                      />
                      <ImFilterSelect
                        placeholder="Brand"
                        value={invBrand}
                        options={invBrandOptions}
                        isClearable={invBrand !== 'All'}
                        minWidth={148}
                        onChange={v => {
                          setInvBrand(v || 'All');
                          setInvPage(0);
                        }}
                      />
                    </div>
                    {invFiltersActive && (
                      <Chips label="Clear filters" onClick={clearInvFilters}/>
                    )}
                    <Tooltip title="Download filtered SKU list as CSV">
                      <span className="sc-inv-export-wrap">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="medium"
                          className="sc-inv-export-btn"
                          startIcon={<FileDownloadOutlined sx={{ fontSize: 18 }}/>}
                          onClick={handleShareInventory}
                          disabled={filteredInventory.length === 0}
                        >
                          Export
                        </Button>
                      </span>
                    </Tooltip>
                  </div>

                  {/* Toolbar with view toggle */}
                  <div className="sc-inv-toolbar">
                    <div className="sc-inv-toolbar-title">
                      <InventoryOutlined sx={{ fontSize: 14 }}/>
                      <span>{inventoryView === 'at-risk' ? 'SKUs Needing Attention' : 'All SKUs'}</span>
                      <span className="sc-inv-count-badge">{filteredInventory.length}</span>
                    </div>
                    <div className="sc-inv-toggle">
                      <Chips
                        label="At Risk"
                        isActive={inventoryView === 'at-risk'}
                        onClick={() => { setInventoryView('at-risk'); setInvPage(0); }}
                      />
                      <Chips
                        label="All SKUs"
                        isActive={inventoryView === 'all'}
                        onClick={() => { setInventoryView('all'); setInvPage(0); }}
                      />
                    </div>
                  </div>

                  {filteredInventory.length === 0 ? (
                    <div className="sc-inv-empty">
                      <TaskAltOutlined sx={{ fontSize: 20 }}/>
                      <p>
                        {invFiltersActive
                          ? 'No SKUs match your filters. Try adjusting search or filters.'
                          : inventoryView === 'at-risk'
                            ? 'All SKUs are healthy — no action required.'
                            : 'No inventory SKUs to display.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="wow-table-wrap sc-inv-wow-table-wrap">
                        <table className="wow-table sc-inv-table">
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Product</th>
                              <th>Risk</th>
                              <th>Status</th>
                              <th>Store On Hand</th>
                              <th>On Order + In Transit</th>
                              <th>FWOS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedInventory.map(item => {
                              const pipeline = item.onOrder + item.inTransit;
                              const fwos = item.daysOfSupply > 0
                                ? Math.round(item.daysOfSupply / 7) + 'w'
                                : '—';
                                  const riskColor: 'error' | 'warning' | 'info' | 'success' =
                                    item.risk === 'critical' ? 'error' :
                                    item.risk === 'at-risk'  ? 'warning' :
                                    item.risk === 'watch'    ? 'info' : 'success';
                                  const statusColor: 'success' | 'warning' | 'error' | 'info' =
                                    item.status === 'in-stock'    ? 'success' :
                                    item.status === 'low'          ? 'warning' :
                                    item.status === 'out-of-stock' ? 'error' : 'info';
                                  const statusLabel =
                                    item.status === 'in-stock'    ? 'In Stock' :
                                    item.status === 'low'          ? 'Low' :
                                    item.status === 'out-of-stock' ? 'Out of Stock' : 'Inbound';
                              return (
                                <tr key={item.sku} className={`sc-inv-row sc-inv-row--${item.risk}`}>
                                  <td className="sc-inv-sku">{item.sku}</td>
                                  <td className="sc-inv-name">{item.name}</td>
                                  <td>
                                    <Badge
                                      label={RISK_LABELS[item.risk]}
                                      color={riskColor}
                                      size="small"
                                      variant="subtle"
                                      isIcon
                                      icon={
                                        item.risk === 'critical' ? <ErrorOutlined sx={{ fontSize: 12 }}/> :
                                        item.risk === 'at-risk'  ? <WarningAmberOutlined sx={{ fontSize: 12 }}/> :
                                        item.risk === 'watch'    ? <AccessTimeOutlined sx={{ fontSize: 12 }}/> :
                                        <TaskAltOutlined sx={{ fontSize: 12 }}/>
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Badge
                                      label={statusLabel}
                                      color={statusColor}
                                      size="small"
                                      variant="subtle"
                                    />
                                  </td>
                                  <td className="sc-inv-qty">
                                    <span className="sc-inv-qty-value">{item.quantity}</span>
                                    <span className="sc-inv-qty-unit">units</span>
                                  </td>
                                  <td className="sc-inv-pipeline">
                                    {pipeline === 0 ? (
                                      <span className="sc-inv-pipeline-none">—</span>
                                    ) : (
                                      <div className="sc-inv-pipeline-cell">
                                        <span className="sc-inv-pipeline-total wow-num">{pipeline}</span>
                                        <span className="sc-inv-pipeline-split">
                                          {item.onOrder > 0 && item.inTransit > 0
                                            ? `${item.onOrder} ordered · ${item.inTransit} transit`
                                            : item.onOrder > 0
                                              ? `${item.onOrder} on order`
                                              : `${item.inTransit} in transit`}
                                          {item.inboundEta ? ` · ETA ${item.inboundEta}` : ''}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="sc-inv-fwos">
                                    <span className={`sc-inv-fwos-value${item.daysOfSupply === 0 ? ' sc-inv-fwos--zero' : item.daysOfSupply < 7 ? ' sc-inv-fwos--low' : ''}`}>
                                      {fwos}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {totalInvPages > 1 && (
                        <div className="wow-table-footer sc-inv-table-footer">
                          <span>
                            Showing {currentInvPage * INV_PAGE_SIZE + 1}–{Math.min((currentInvPage + 1) * INV_PAGE_SIZE, filteredInventory.length)} of {filteredInventory.length} SKUs
                          </span>
                          <div className="sc-inv-pagination-controls">
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={currentInvPage === 0}
                              onClick={() => setInvPage(p => Math.max(0, p - 1))}
                            >
                              ← Prev
                            </Button>
                            <span className="sc-inv-pagination-page">
                              {currentInvPage + 1} / {totalInvPages}
                            </span>
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={currentInvPage >= totalInvPages - 1}
                              onClick={() => setInvPage(p => Math.min(totalInvPages - 1, p + 1))}
                            >
                              Next →
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── Phantom Stock Heatmap Tab ── */}
            {activeTab === 'phantom' && (() => {
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
                return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Beverages';
              })();
              const openCycleTasks = PHANTOM_ROWS.filter(r => r.linkedTasks > 0 && r.status !== 'Resolved').reduce((s, r) => s + r.linkedTasks, 0);

              const psTotalPages = Math.ceil(psFiltered.length / PS_PAGE_SIZE);
              const psPaginated = psFiltered.slice(psPage * PS_PAGE_SIZE, (psPage + 1) * PS_PAGE_SIZE);

              const psRiskColor = (risk: PhantomRisk | null) => {
                if (!risk) return { bg: '#f8fafc', text: '#cbd5e1', border: '#f1f5f9' };
                if (risk === 'High')    return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
                if (risk === 'Medium')  return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
                if (risk === 'Low')     return { bg: '#fefce8', text: '#a16207', border: '#fde68a' };
                return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
              };

              const psDepts   = Array.from(new Set(PHANTOM_ROWS.map(r => r.department)));
              const psSubDepts = Array.from(new Set(PHANTOM_ROWS.map(r => r.subDepartment)));
              const psClasses  = Array.from(new Set(PHANTOM_ROWS.map(r => r.itemClass)));

              return (
                <div className="sc-inventory-tab">
                  {/* Summary tiles — same style as Inventory & Inbound */}
                  <div className="sc-inv-summary">
                    <div className="sc-inv-summary-tile sc-inv-summary--total">
                      <span className="sc-inv-summary-label">Phantom Stock SKUs</span>
                      <span className="sc-inv-summary-value">{totalPhantomSkus}</span>
                      <span className="sc-inv-summary-sub">zero or abnormal sales</span>
                    </div>
                    <div className="sc-inv-summary-tile sc-inv-summary--critical">
                      <span className="sc-inv-summary-label">Inventory at Risk</span>
                      <span className="sc-inv-summary-value">${(totalInvRisk / 1000).toFixed(1)}K</span>
                      <span className="sc-inv-summary-sub">estimated value at risk</span>
                    </div>
                    <div className="sc-inv-summary-tile sc-inv-summary--warn">
                      <span className="sc-inv-summary-label">Highest Risk Dept</span>
                      <span className="sc-inv-summary-value">{highestRiskDept}</span>
                      <span className="sc-inv-summary-sub">most phantom SKUs</span>
                    </div>
                    <div className="sc-inv-summary-tile sc-inv-summary--info">
                      <span className="sc-inv-summary-label">Open Cycle Count Tasks</span>
                      <span className="sc-inv-summary-value">{openCycleTasks}</span>
                      <span className="sc-inv-summary-sub">auto-created in queue</span>
                    </div>
                  </div>

                  {/* AI Insight banner */}
                  <div className="sc-inv-insight">
                    <div className="sc-inv-insight-icon"><AutoAwesomeOutlined sx={{ fontSize: 14 }}/></div>
                    <div className="sc-inv-insight-body">
                      <p className="sc-inv-insight-line">{totalPhantomSkus} SKUs flagged with zero or abnormal sales. Beverages and Personal Care show the highest concentration.</p>
                      <p className="sc-inv-insight-rec"><strong>Recommended:</strong> Initiate Cycle Count tasks for High-risk SKUs. Verify BOH-to-shelf movement in Beverages aisle.</p>
                    </div>
                  </div>

                  {/* Filter bar — same pattern as Inventory & Inbound */}
                  <div className="sc-inv-premium-filter-bar">
                    <div className="sc-inv-search">
                      <SearchOutlined sx={{ fontSize: 15 }}/>
                      <input
                        type="text"
                        placeholder="Search department, class…"
                        value={psSearch}
                        onChange={e => { setPsSearch(e.target.value); setPsPage(0); }}
                      />
                      {psSearch && (
                        <button className="sc-inv-search-clear" onClick={() => { setPsSearch(''); setPsPage(0); }} aria-label="Clear search">
                          <CloseOutlined sx={{ fontSize: 13 }}/>
                        </button>
                      )}
                    </div>
                    <div className="sc-inv-filter-divider" aria-hidden="true"/>
                    <div className="sc-inv-filter-fields">
                      <ImFilterSelect
                        placeholder="All Departments"
                        value={psDeptFilter || 'All'}
                        options={[{ value: 'All', label: 'All Departments' }, ...psDepts.map(d => ({ value: d, label: d }))]}
                        isClearable={psDeptFilter !== ''}
                        minWidth={168}
                        onChange={v => { setPsDeptFilter(v === 'All' ? '' : (v || '')); setPsPage(0); }}
                      />
                      <ImFilterSelect
                        placeholder="All Sub-Depts"
                        value={psSubDeptFilter || 'All'}
                        options={[{ value: 'All', label: 'All Sub-Depts' }, ...psSubDepts.map(d => ({ value: d, label: d }))]}
                        isClearable={psSubDeptFilter !== ''}
                        minWidth={168}
                        onChange={v => { setPsSubDeptFilter(v === 'All' ? '' : (v || '')); setPsPage(0); }}
                      />
                      <ImFilterSelect
                        placeholder="All Classes"
                        value={psClassFilter || 'All'}
                        options={[{ value: 'All', label: 'All Classes' }, ...psClasses.map(c => ({ value: c, label: c }))]}
                        isClearable={psClassFilter !== ''}
                        minWidth={148}
                        onChange={v => { setPsClassFilter(v === 'All' ? '' : (v || '')); setPsPage(0); }}
                      />
                      <ImFilterSelect
                        placeholder="All Risk Levels"
                        value={psRiskFilter || 'All'}
                        options={[
                          { value: 'All', label: 'All Risk Levels' },
                          { value: 'High', label: 'High' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Low', label: 'Low' },
                          { value: 'Minimal', label: 'Minimal' },
                        ]}
                        isClearable={psRiskFilter !== ''}
                        minWidth={148}
                        onChange={v => { setPsRiskFilter(v === 'All' ? '' : (v || '')); setPsPage(0); }}
                      />
                    </div>
                    {psFiltersActive && (
                      <Chips label="Clear filters" onClick={clearPsFilters}/>
                    )}
                    <Tooltip title="Download filtered phantom stock list as CSV">
                      <span className="sc-inv-export-wrap">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="medium"
                          className="sc-inv-export-btn"
                          startIcon={<FileDownloadOutlined sx={{ fontSize: 18 }}/>}
                          onClick={() => {}}
                          disabled={psFiltered.length === 0}
                        >
                          Export
                        </Button>
                      </span>
                    </Tooltip>
                  </div>

                  {/* Toolbar */}
                  <div className="sc-inv-toolbar">
                    <div className="sc-inv-toolbar-title">
                      <ShieldOutlined sx={{ fontSize: 14 }}/>
                      <span>Phantom Stock Detail — Department / Class Level</span>
                      <span className="sc-inv-count-badge">{psFiltered.length}</span>
                    </div>
                  </div>

                  {psFiltered.length === 0 ? (
                    <div className="sc-inv-empty">
                      <ShieldOutlined sx={{ fontSize: 20 }}/>
                      <p>{psFiltersActive ? 'No records match your filters. Try adjusting search or filters.' : 'No phantom stock detected.'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="wow-table-wrap sc-inv-wow-table-wrap">
                        <table className="wow-table sc-inv-table">
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
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {psPaginated.map(row => {
                              const riskColor: 'error' | 'warning' | 'info' | 'success' =
                                row.riskLevel === 'High' ? 'error' :
                                row.riskLevel === 'Medium' ? 'warning' :
                                row.riskLevel === 'Low' ? 'info' : 'success';
                              const statusColor: 'success' | 'warning' | 'error' | 'info' =
                                row.status === 'Resolved' ? 'success' :
                                row.status === 'In Progress' ? 'warning' :
                                row.status === 'Open' ? 'error' : 'info';
                              return (
                                <tr key={row.id} className="sc-inv-row sc-inv-row--at-risk" style={{ cursor: 'pointer' }} onClick={() => setPsDrawerRow(row)}>
                                  <td className="sc-inv-name">{row.department}</td>
                                  <td>
                                    <div className="ps-dept-cell">
                                      <span className="ps-dept-sub">{row.subDepartment}</span>
                                      <span className="ps-dept-class">{row.itemClass}</span>
                                    </div>
                                  </td>
                                  <td className="sc-inv-sku">{row.phantomSkus}</td>
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
                                    <Badge label={row.riskLevel} color={riskColor} size="small" variant="subtle"
                                      isIcon icon={row.riskLevel === 'High' ? <ErrorOutlined sx={{ fontSize: 12 }}/> : row.riskLevel === 'Medium' ? <WarningAmberOutlined sx={{ fontSize: 12 }}/> : <AccessTimeOutlined sx={{ fontSize: 12 }}/>}
                                    />
                                  </td>
                                  <td>
                                    <Badge label={row.status} color={statusColor} size="small" variant="subtle"/>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {psTotalPages > 1 && (
                        <div className="ps-pagination">
                          <span className="ps-pag-info">Showing {psPage * PS_PAGE_SIZE + 1}–{Math.min((psPage + 1) * PS_PAGE_SIZE, psFiltered.length)} of {psFiltered.length}</span>
                          <button className="ps-pag-btn" disabled={psPage === 0} onClick={() => setPsPage(p => p - 1)}><ChevronLeftOutlined sx={{ fontSize: 16 }} /></button>
                          <button className="ps-pag-btn" disabled={psPage >= psTotalPages - 1} onClick={() => setPsPage(p => p + 1)}><ChevronRightOutlined sx={{ fontSize: 16 }} /></button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Right-Side Detail Drawer — matches Alerts panel style */}
                  {psDrawerRow && (
                    <>
                      <div className="detail-panel-overlay" onClick={() => setPsDrawerRow(null)}/>
                      <div className="detail-panel">
                        {/* Hero Header */}
                        <div className="dp-hero-header">
                          <div className="dp-hero-top">
                            <div className="dp-hero-icon" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
                              <InventoryOutlined sx={{ fontSize: 16 }}/>
                            </div>
                            <span className="dp-hero-type">PHANTOM STOCK · {psDrawerRow.department}</span>
                            <button className="dp-hero-close" onClick={() => setPsDrawerRow(null)}>
                              <CloseOutlined sx={{ fontSize: 17 }}/>
                            </button>
                          </div>
                          <h2 className="dp-hero-title">{psDrawerRow.subDepartment} — {psDrawerRow.itemClass}</h2>
                          <div className="dp-hero-pills">
                            <span className={`dp-hero-pill dp-hero-pill--${psDrawerRow.riskLevel === 'High' ? 'critical' : psDrawerRow.riskLevel === 'Medium' ? 'warning' : 'info'}`}>
                              {psDrawerRow.riskLevel === 'High' ? <ErrorOutlined sx={{ fontSize: 10 }}/> : <WarningAmberOutlined sx={{ fontSize: 10 }}/>}
                              {psDrawerRow.riskLevel} Risk
                            </span>
                            <span className="dp-hero-pill dp-hero-pill--neutral">{psDrawerRow.status}</span>
                            <span className="dp-hero-pill dp-hero-pill--auto">⚡ Auto-Monitored</span>
                            {psDrawerRow.linkedTasks > 0 && (
                              <span className="dp-hero-pill dp-hero-pill--tasks">
                                <LinkOutlined sx={{ fontSize: 10 }}/> {psDrawerRow.linkedTasks} Linked Task{psDrawerRow.linkedTasks > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="detail-panel-body">
                          {/* Why Flagged */}
                          <div className="dp-section">
                            <div className="dp-section-title">
                              <InfoOutlined sx={{ fontSize: 12 }}/> Why Flagged
                            </div>
                            <div className="dp-title-block">
                              <p className="dp-description">{psDrawerRow.whyFlagged}</p>
                            </div>
                          </div>

                          {/* Inventory & Sales Evidence */}
                          <div className="dp-section">
                            <div className="dp-section-title">
                              <InventoryOutlined sx={{ fontSize: 12 }}/> Inventory &amp; Sales Evidence
                            </div>
                            <div className="ps-ev-grid">
                              <div className="ps-ev-tile">
                                <span className="ps-ev-label">Inv. Units</span>
                                <span className="ps-ev-value">{psDrawerRow.inventoryUnits}</span>
                              </div>
                              <div className="ps-ev-tile">
                                <span className="ps-ev-label">BOH Units</span>
                                <span className="ps-ev-value">{psDrawerRow.bohUnits}</span>
                              </div>
                              <div className="ps-ev-tile">
                                <span className="ps-ev-label">Shelf Qty</span>
                                <span className="ps-ev-value">{psDrawerRow.shelfQty}</span>
                              </div>
                              <div className="ps-ev-tile">
                                <span className="ps-ev-label">Zero-Sales Days</span>
                                <span className="ps-ev-value ps-ev-value--alert">{psDrawerRow.zeroSalesDays}d</span>
                              </div>
                              <div className="ps-ev-tile">
                                <span className="ps-ev-label">Last Sale Date</span>
                                <span className="ps-ev-value">{psDrawerRow.lastSaleDate}</span>
                              </div>
                              <div className="ps-ev-tile">
                                <span className="ps-ev-label">Inv. Value</span>
                                <span className="ps-ev-value">${psDrawerRow.inventoryValue.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* SKU Breakdown */}
                          <div className="dp-section">
                            <div className="dp-section-title">
                              <GridOnOutlined sx={{ fontSize: 12 }}/> SKU-Level Breakdown
                            </div>
                            <div className="ps-sku-list-new">
                              {psDrawerRow.skuBreakdown.map((sku, i) => {
                                const rc = psRiskColor(sku.riskLevel);
                                return (
                                  <div key={i} className="ps-sku-item">
                                    <div className="ps-sku-item-top">
                                      <div>
                                        <div className="ps-sku-item-name">{sku.productName}</div>
                                        <div className="ps-sku-item-code">{sku.sku}</div>
                                      </div>
                                      <span className="ps-sku-item-risk" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                                        {sku.riskLevel}
                                      </span>
                                    </div>
                                    <div className="ps-sku-item-stats">
                                      <span><span className="ps-sku-stat-lbl">BOH</span> {sku.bohQty}</span>
                                      <span><span className="ps-sku-stat-lbl">Shelf</span> {sku.shelfQty}</span>
                                      <span><span className="ps-sku-stat-lbl">0-Sale</span> {sku.zeroSalesDays}d</span>
                                      <span><span className="ps-sku-stat-lbl">Value</span> ${sku.inventoryValue.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Linked Tasks */}
                          {psDrawerRow.linkedTasks > 0 && (
                            <div className="dp-section">
                              <div className="dp-section-title">
                                <AssignmentOutlined sx={{ fontSize: 12 }}/> Linked Operations Queue Tasks
                              </div>
                              <div className="eac2-entity-card eac2-entity-card--progress" style={{ marginTop: 4 }}>
                                <div className="eac2-entity-header">
                                  <span className="eac2-entity-name">OQ-PS-{psDrawerRow.id.replace('ps-', '')}</span>
                                  <span className="eac2-entity-status-badge eac2-entity-status-badge--progress">Auto-Created</span>
                                </div>
                                <div className="eac2-entity-detail">Inventory Check / Cycle Count · {store.name}</div>
                                <div className="eac2-entity-manager">
                                  <PersonOutlined sx={{ fontSize: 12 }}/> Assigned to <strong>{store.manager}</strong>
                                </div>
                                <div className="eac2-entity-task-row">
                                  <span className="eac2-entity-task-info">
                                    <AccessTimeOutlined sx={{ fontSize: 12 }}/> Source: Phantom Stock Alert · SLA: 24–48h · Priority: {psDrawerRow.riskLevel === 'High' ? 'High' : 'Medium'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Recommended Action */}
                          <div className="dp-section">
                            <div className="dp-section-title">
                              <AutoAwesomeOutlined sx={{ fontSize: 12 }}/> Recommended Action
                            </div>
                            <div className="dp-title-block">
                              <p className="dp-description">{psDrawerRow.recommendedAction}</p>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="dp-actions">
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<OpenInNewOutlined sx={{ fontSize: 14 }}/>}
                            onClick={() => {
                              setPsDrawerRow(null);
                              navigate('/command-center/operations-queue', {
                                state: {
                                  prefillFromAlert: {
                                    alertId: `phantom-${psDrawerRow.id}`,
                                    title: `Phantom Stock — ${psDrawerRow.department} / ${psDrawerRow.itemClass}`,
                                    description: psDrawerRow.whyFlagged,
                                    severity: psDrawerRow.riskLevel === 'High' ? 'critical' : 'warning',
                                    source: 'Automated Execution Alert',
                                    stores: [{ name: store.name, manager: store.manager, detail: psDrawerRow.recommendedAction }],
                                  },
                                },
                              });
                            }}
                          >
                            Open in Operations Queue
                          </Button>
                          <Button variant="outlined" onClick={() => setPsDrawerRow(null)}>
                            Close
                          </Button>
                        </div>
                      </div>
                    </>
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

              const baseYoY = store.momentum === 'rising' ? 5.6 : store.momentum === 'stable' ? 1.3 : -3.9;

              return (
                <div className="sc-bench-tab">

                  {/* ── Controls: View Toggle ── */}
                  <div className="sc-bench-controls">
                    <div className="sc-bench-view-toggle">
                      <button
                        type="button"
                        className={`sc-bench-view-btn${benchView === 'cards' ? ' active' : ''}`}
                        onClick={() => setBenchView('cards')}
                      >
                        Cards
                      </button>
                      <button
                        type="button"
                        className={`sc-bench-view-btn${benchView === 'table' ? ' active' : ''}`}
                        onClick={() => setBenchView('table')}
                      >
                        Table
                      </button>
                    </div>
                  </div>

                  {/* ── Card View ── */}
                  {benchView === 'cards' && (<>
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
                    {benchmarks.map((b, bIdx) => {
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
                      // YoY: store % change vs LY (deterministic per metric)
                      const storeYoY  = baseYoY + detRnd(`${store.id}-bench${bIdx}-yoy`) * 3 - 1.5;
                      const clusterYoY = 1.8 + detRnd(`${b.metric}-cyoy`) * 1.5 - 0.75;

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

                          {/* TY Snapshot: store vs cluster values + YoY */}
                          <div className="sc-bench-snap">
                            <div className="sc-bench-snap-item">
                              <span className="sc-bench-snap-lbl">Store TY</span>
                              <span className="sc-bench-snap-val">{b.storeVal}{b.unit !== '/100' && b.unit !== '/5' ? b.unit : b.unit}</span>
                              <span className={`sc-bench-snap-yoy ${storeYoY >= 0 ? 'pos' : 'neg'}`}>
                                {storeYoY >= 0 ? '+' : ''}{storeYoY.toFixed(1)}% vs LY
                              </span>
                            </div>
                            <div className="sc-bench-snap-sep">vs</div>
                            <div className="sc-bench-snap-item sc-bench-snap-item--cluster">
                              <span className="sc-bench-snap-lbl">Cluster Avg</span>
                              <span className="sc-bench-snap-val">{b.clusterAvg}{b.unit !== '/100' && b.unit !== '/5' ? b.unit : b.unit}</span>
                              <span className={`sc-bench-snap-yoy ${clusterYoY >= 0 ? 'pos' : 'neg'}`}>
                                {clusterYoY >= 0 ? '+' : ''}{clusterYoY.toFixed(1)}% vs LY
                              </span>
                            </div>
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
                  </>) /* end Card View */}

                  {/* ── Table View: all KPIs for this store vs cluster average ── */}
                  {benchView === 'table' && (() => {
                    const tableRows = benchmarks.map((b, bIdx) => {
                      const storeYoY   = baseYoY + detRnd(`${store.id}-bench${bIdx}-yoy`) * 3 - 1.5;
                      const clusterYoY = 1.8 + detRnd(`${b.metric}-cyoy`) * 1.5 - 0.75;
                      const changeGapPP = storeYoY - clusterYoY;
                      const ahead = b.vsCluster >= 0;
                      const quartileAccent =
                        b.quartile === 1 ? 'var(--ia-color-success)' :
                        b.quartile === 2 ? 'var(--ia-color-primary)' :
                        b.quartile === 3 ? 'var(--ia-color-warning)' :
                        'var(--ia-color-error-strong)';
                      return { b, storeYoY, clusterYoY, changeGapPP, ahead, quartileAccent };
                    });

                    return (
                      <div className="sc-bench-kpi-outer">
                        {/* Context banner — separated from table with gap */}
                        <div className="sc-bench-kpi-store-ctx">
                          <div className="sc-bench-kpi-ctx-left">
                            <span className="sc-bench-kpi-ctx-store">{store.name}</span>
                            <span className="sc-bench-kpi-ctx-meta">
                              Store #{store.number} · {store.cluster}
                            </span>
                          </div>
                          <div className="sc-bench-kpi-ctx-right">
                            <span className="sc-bench-kpi-ctx-vs">vs</span>
                            <Tag label={`${clusterConfig.label} Cluster Avg`} variant="stroke" size="small" />
                            <Badge label={`${clusterConfig.size} peers`} color="info" variant="subtle" size="small" />
                          </div>
                        </div>

                        {/* Table card */}
                        <div className="sc-bench-kpi-table-wrap">
                        <div className="sc-bench-kpi-scroll">
                          <table className="sc-bench-kpi-table">
                            <thead>
                              <tr className="sc-bench-kpi-tr-group">
                                <th className="sc-bench-kpi-th sc-bench-kpi-th--metric" rowSpan={2}>Metric</th>
                                <th className="sc-bench-kpi-th-grp sc-bench-kpi-th-grp--store" colSpan={2}>
                                  This Store
                                </th>
                                <th className="sc-bench-kpi-th-grp sc-bench-kpi-th-grp--cluster" colSpan={2}>
                                  {clusterConfig.label} Avg
                                </th>
                                <th className="sc-bench-kpi-th-grp sc-bench-kpi-th-grp--compare" colSpan={2}>
                                  vs Cluster
                                </th>
                              </tr>
                              <tr className="sc-bench-kpi-tr-sub">
                                <th className="sc-bench-kpi-th sc-bench-kpi-th--num sc-bench-kpi-th--store-col">TY Value</th>
                                <th className="sc-bench-kpi-th sc-bench-kpi-th--num sc-bench-kpi-th--store-col">% vs LY</th>
                                <th className="sc-bench-kpi-th sc-bench-kpi-th--num sc-bench-kpi-th--cluster-col">TY Value</th>
                                <th className="sc-bench-kpi-th sc-bench-kpi-th--num sc-bench-kpi-th--cluster-col">% vs LY</th>
                                <th className="sc-bench-kpi-th sc-bench-kpi-th--num sc-bench-kpi-th--compare-col">TY Gap</th>
                                <th className="sc-bench-kpi-th sc-bench-kpi-th--num sc-bench-kpi-th--compare-col">% Change, pp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableRows.map(({ b, storeYoY, clusterYoY, changeGapPP, ahead, quartileAccent }) => (
                                <tr key={b.metric} className={`sc-bench-kpi-row${!ahead ? ' sc-bench-kpi-row--behind' : ''}`}>
                                  {/* Metric: accent bar + name + rank */}
                                  <td className="sc-bench-kpi-td sc-bench-kpi-td--metric">
                                    <span className="sc-bench-kpi-accent" style={{ background: quartileAccent }} />
                                    <div className="sc-bench-kpi-metric-body">
                                      <span className="sc-bench-kpi-metric-name">{b.metric}</span>
                                      <div className="sc-bench-kpi-metric-sub">
                                        <Badge
                                          label={b.quartile === 1 ? `🏆 Top 25%` : b.quartile === 2 ? `2nd Quartile` : b.quartile === 3 ? `3rd Quartile` : `Bottom 25%`}
                                          color={b.quartile === 1 ? 'success' : b.quartile === 2 ? 'primary' : b.quartile === 3 ? 'warning' : 'error'}
                                          variant="subtle"
                                          size="small"
                                        />
                                        <Tooltip
                                          title={`Ranked #${b.rank} out of ${b.rankTotal} stores in the ${clusterConfig.label} cluster`}
                                          orientation="top"
                                        >
                                          <span className="sc-bench-kpi-rank-txt">#{b.rank} of {b.rankTotal}</span>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  </td>
                                  {/* Store TY */}
                                  <td className="sc-bench-kpi-td sc-bench-kpi-td--num sc-bench-kpi-td--store">
                                    <span className="sc-bench-kpi-val">{b.storeVal}{b.unit}</span>
                                  </td>
                                  {/* Store % vs LY */}
                                  <td className="sc-bench-kpi-td sc-bench-kpi-td--num sc-bench-kpi-td--store">
                                    <Badge
                                      label={`${storeYoY >= 0 ? '+' : ''}${storeYoY.toFixed(1)}%`}
                                      color={storeYoY >= 0 ? 'success' : 'error'}
                                      variant="subtle"
                                      size="small"
                                    />
                                  </td>
                                  {/* Cluster TY */}
                                  <td className="sc-bench-kpi-td sc-bench-kpi-td--num sc-bench-kpi-td--cluster">
                                    <span className="sc-bench-kpi-val sc-bench-kpi-val--muted">{b.clusterAvg}{b.unit}</span>
                                  </td>
                                  {/* Cluster % vs LY */}
                                  <td className="sc-bench-kpi-td sc-bench-kpi-td--num sc-bench-kpi-td--cluster">
                                    <Badge
                                      label={`${clusterYoY >= 0 ? '+' : ''}${clusterYoY.toFixed(1)}%`}
                                      color={clusterYoY >= 0 ? 'success' : 'error'}
                                      variant="subtle"
                                      size="small"
                                    />
                                  </td>
                                  {/* TY Gap vs Cluster */}
                                  <td className="sc-bench-kpi-td sc-bench-kpi-td--compare">
                                    <Badge
                                      label={`${ahead ? '↑' : '↓'} ${fmtDelta(b.vsCluster, b.unit)}`}
                                      color={ahead ? 'success' : 'error'}
                                      variant="subtle"
                                      size="small"
                                    />
                                  </td>
                                  {/* % Change Gap pp */}
                                  <td className="sc-bench-kpi-td sc-bench-kpi-td--compare">
                                    <Badge
                                      label={`${changeGapPP >= 0 ? '+' : ''}${changeGapPP.toFixed(1)} pp`}
                                      color={changeGapPP >= 0 ? 'success' : 'error'}
                                      variant="subtle"
                                      size="small"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              );
            })()}

          </div>
        </div>


      </div>

      {/* ── SM Broadcast Detail Panel (right slide-in, mirrors DM Home) ── */}
      {smBroadcastPanel && (() => {
        const { source, broadcast: b, fullMessage, scope, keyDates, actionItems, attachments } = smBroadcastPanel;
        const senderInitials = b.sender.split(/[ ·]+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const senderRole = source === 'HQ' ? 'HQ' : 'District Manager';
        return (
          <>
            <div className="detail-panel-overlay" onClick={() => setSmBroadcastPanel(null)} />
            <div className="detail-panel">
              <div className="dp-hero-header">
                <div className="dp-hero-top">
                  <div className="dp-hero-icon" style={{ background: '#fce7f3', color: '#9d174d' }}>
                    <CampaignOutlined sx={{ fontSize: 16 }}/>
                  </div>
                  <span className="dp-hero-type">{b.category?.toUpperCase()}</span>
                  <button className="dp-hero-close" onClick={() => setSmBroadcastPanel(null)}>
                    <CloseOutlined sx={{ fontSize: 17 }}/>
                  </button>
                </div>
                <h2 className="dp-hero-title">{b.title}</h2>
                <div className="dp-hero-pills">
                  <span className="dp-hero-pill" style={b.priority === 'HIGH' ? { background: '#fee2e2', color: '#b91c1c' } : b.priority === 'MEDIUM' ? { background: '#fef3c7', color: '#92400e' } : { background: '#dbeafe', color: '#1d4ed8' }}>
                    {b.priority} Priority
                  </span>
                </div>
              </div>
              <div className="detail-panel-body">
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
              <div className="dp-hero-header">
                <div className="dp-hero-top">
                  <div className="dp-hero-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    <BarChartOutlined sx={{ fontSize: 16 }}/>
                  </div>
                  <span className="dp-hero-type">{activeKPIPanel.category?.toUpperCase()} · 52-WEEK TREND</span>
                  <button className="dp-hero-close" onClick={() => setActiveKPIPanel(null)}>
                    <CloseOutlined sx={{ fontSize: 17 }}/>
                  </button>
                </div>
                <h2 className="dp-hero-title">{activeKPIPanel.label}</h2>
                <div className="dp-hero-pills">
                  <span className="dp-hero-pill" style={activeKPIPanel.status === 'negative' ? { background: '#fee2e2', color: '#b91c1c' } : activeKPIPanel.status === 'warning' ? { background: '#fef3c7', color: '#92400e' } : { background: '#dcfce7', color: '#166534' }}>
                    Current: {activeKPIPanel.primaryValue}{activeKPIPanel.primaryUnit ? ` ${activeKPIPanel.primaryUnit}` : ''}
                  </span>
                  {activeKPIPanel.microInsight && (
                    <span className="dp-hero-pill" style={{ background: '#f1f5f9', color: '#475569' }}>
                      {activeKPIPanel.microInsight}
                    </span>
                  )}
                </div>
              </div>
              <div className="detail-panel-body">

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
              <div className="dp-hero-header">
                <div className="dp-hero-top">
                  <div className="dp-hero-icon" style={{ background: '#cffafe', color: '#0e7490' }}>
                    <AssignmentTurnedInOutlined sx={{ fontSize: 16 }}/>
                  </div>
                  <span className="dp-hero-type">8-WEEK AUDIT LENS</span>
                  <button className="dp-hero-close" onClick={() => setAuditCellDetail(null)}>
                    <CloseOutlined sx={{ fontSize: 17 }}/>
                  </button>
                </div>
                <h2 className="dp-hero-title">{d.category} Audit</h2>
                <div className="dp-hero-pills">
                  <span className="dp-hero-pill" style={{ background: getComplianceColor(d.score), color: getComplianceTextColor(d.score) }}>
                    {d.score}% Compliance
                  </span>
                  <span className="dp-hero-pill" style={{ background: '#f1f5f9', color: '#475569' }}>
                    #{store.number} · {store.name}
                  </span>
                </div>
              </div>
              <div className="detail-panel-body">
                <div className="dp-title-block">
                  <p className="dp-description">Week of {d.weekDate} ({d.weekLabel}) · Auditor: {priors[0].auditor}</p>
                </div>

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

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Add from '@mui/icons-material/Add';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ListOutlined from '@mui/icons-material/ListOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import ChecklistOutlined from '@mui/icons-material/ChecklistOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import SensorsOutlined from '@mui/icons-material/SensorsOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import RemoveOutlined from '@mui/icons-material/RemoveOutlined';
import OpenWithOutlined from '@mui/icons-material/OpenWithOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import GridOnOutlined from '@mui/icons-material/GridOnOutlined';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card, Tabs, Loader, Alert, Panel, TextArea, Input, Menu } from 'impact-ui';
import { useExecutionTasks, ExecutionTask, TaskStatus, Priority } from '../context/ExecutionTasksContext';
import { useToast } from '../context/ToastContext';
import './TaskCenter.css';

// ── Seed tasks so the Operations Queue isn't empty ──
const seedTasks: ExecutionTask[] = [
  {
    id: 'tc-seed-1',
    type: 'Reset Shelf',
    title: 'Accessories Endcap — Compliance Reset Required',
    description: 'Multiple compliance deviations detected via Ask Alan audit. Scarves section shifted, sunglasses rotated, and belt display missing from fixture.',
    priority: 'High',
    reason: 'Compliance score 76.4% — below threshold',
    impact: 'Estimated $340/week lost sales from missing belt display alone',
    status: 'Pending',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-04-25',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Accessories Endcap v2.1',
    category: 'Accessories',
    createdAt: '2026-04-23T08:30:00Z',
    localizationId: 'loc-acc-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram/localization-engine',
    slaHours: 24,
    severityRationale: 'Compliance score 76.4% is below 85% threshold — scarves shifted 6 inches left, sunglasses rotated 15°, belt display missing from fixture entirely.',
    confidenceScore: 94,
    beforeImage: '/audit-evidence/acc-endcap-before.jpg',
    afterImage: '/audit-evidence/acc-endcap-after.jpg',
  },
  {
    id: 'tc-seed-2',
    type: 'Add',
    title: 'Replenish OOS Items — Women\'s Wall Display',
    description: 'Ask Alan detected 4 out-of-stock positions on the Women\'s Wall Display requiring immediate replenishment.',
    priority: 'High',
    reason: '4 OOS items detected — V-Neck Tee, Floral Dress, Slim Denim, Classic Blouse',
    impact: 'Critical revenue loss on high-traffic display section',
    status: 'In Progress',
    assignedTo: 'user-3',
    assignedToName: 'Mike Chen',
    dueDate: '2026-04-23',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Women\'s Wall Display v2.1',
    category: 'Women\'s Apparel',
    createdAt: '2026-04-23T09:00:00Z',
    localizationId: 'loc-wwd-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram/localization-engine',
    slaHours: 12,
    severityRationale: '4 OOS positions detected on high-traffic Women\'s Wall — V-Neck Tee, Floral Dress, Slim Denim, Classic Blouse. Estimated $580/day revenue at risk.',
    confidenceScore: 97,
    beforeImage: '/audit-evidence/womens-wall-before.jpg',
  },
  {
    id: 'tc-seed-3',
    type: 'Update Label',
    title: 'Replace Missing Price Labels — Jewelry Section',
    description: '3 missing price labels detected in jewelry section during compliance audit. Labels need to be printed and aligned per planogram.',
    priority: 'Medium',
    reason: 'Price label compliance gap',
    impact: 'Customer confusion, potential pricing errors at checkout',
    status: 'Pending',
    assignedTo: null,
    assignedToName: undefined,
    dueDate: '2026-04-26',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Jewelry Counter v1.5',
    category: 'Jewelry',
    createdAt: '2026-04-23T08:45:00Z',
    localizationId: 'loc-jew-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram/localization-engine',
    slaHours: 48,
    severityRationale: '3 missing labels detected during compliance audit — customer confusion risk and potential checkout pricing errors.',
    confidenceScore: 91,
  },
  {
    id: 'tc-seed-4',
    type: 'Install Fixture',
    title: 'Submit Maintenance Ticket — LED Strip Shelf 2',
    description: 'LED strip lighting non-functional on shelf 2 of accessories endcap. Fixture needs replacement.',
    priority: 'Low',
    reason: 'Fixture maintenance required',
    impact: 'Reduced product visibility on shelf 2',
    status: 'Pending',
    assignedTo: 'user-5',
    assignedToName: 'Alex Rivera',
    dueDate: '2026-04-28',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Accessories Endcap v2.1',
    category: 'Accessories',
    createdAt: '2026-04-22T16:00:00Z',
    localizationId: 'loc-acc-01',
    source: 'Manual',
    slaHours: 72,
    severityRationale: 'Non-functional LED strip reduces product visibility on shelf 2 — low urgency but impacts premium display zone.',
  },
  {
    id: 'tc-seed-5',
    type: 'Move',
    title: 'Reposition Sunglasses Display to Eye-Level Center',
    description: 'Designer sunglasses currently on left side rotated 15°. Must be repositioned to center eye-level per planogram specification.',
    priority: 'High',
    reason: 'Premium visibility reduced — critical placement deviation',
    impact: '-12% conversion risk on premium category',
    status: 'Completed',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-04-22',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Accessories Endcap v2.1',
    category: 'Accessories',
    createdAt: '2026-04-21T14:00:00Z',
    localizationId: 'loc-acc-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram/localization-engine',
    slaHours: 24,
    severityRationale: 'Premium sunglasses on left side rotated 15° from planogram spec — 12% conversion risk on high-margin category.',
    confidenceScore: 96,
    beforeImage: '/audit-evidence/sunglasses-before.jpg',
    afterImage: '/audit-evidence/sunglasses-after.jpg',
  },
  {
    id: 'tc-seed-6',
    type: 'Adjust Facing',
    title: 'Add 2 Facings to Hair Accessories Rack',
    description: 'Hair accessories showing 4 facings vs required 6 per planogram. Stock from backroom to add 2 additional facings.',
    priority: 'Medium',
    reason: 'Facing count compliance gap (-33%)',
    impact: '-8% category performance due to reduced selection visibility',
    status: 'Completed',
    assignedTo: 'user-3',
    assignedToName: 'Mike Chen',
    dueDate: '2026-04-22',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Accessories Endcap v2.1',
    category: 'Accessories',
    createdAt: '2026-04-21T14:30:00Z',
    localizationId: 'loc-acc-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram/localization-engine',
    slaHours: 48,
    severityRationale: 'Hair accessories showing 4 facings vs required 6 per planogram — 33% facing gap reducing category visibility.',
    confidenceScore: 92,
    beforeImage: '/audit-evidence/hair-acc-before.jpg',
    afterImage: '/audit-evidence/hair-acc-after.jpg',
  },
  // ── Product Execution linked tasks (OQ-PEX-*)
  {
    id: 'OQ-PEX-001',
    type: 'Move',
    title: 'Running Shoes Elite — Shelf Upgrade to End Cap (Top Performer)',
    description: 'Running Shoes Elite (FTW-RUN-002) is the #1 Footwear SKU in the district — outselling cluster by 58%. Current shelf position Aisle 4, Bay 2 is limiting visibility. Move to Footwear End Cap W4 to capture remaining sell-through. Stock: 18 units on hand at 38 units/week sell rate — stockout in 8–10 days. Request +24 units from DC.',
    priority: 'High',
    reason: 'Top Performing Product — velocity acceleration 4 weeks straight',
    impact: '+$4,200/week opportunity. Stockout risk in 8–10 days without allocation.',
    status: 'Pending',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-05-30',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: 'Footwear Wall W4 / End Cap',
    category: 'Footwear',
    createdAt: '2026-05-26T08:03:00Z',
    localizationId: 'pex-ftw-001',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-001',
    slaHours: 48,
    severityRationale: 'Top performer outselling cluster by 58%. End Cap placement drives +31% conversion vs aisle. Stockout projected Day 8 at current sell rate.',
    confidenceScore: 94,
  },
  {
    id: 'OQ-PEX-002',
    type: 'Add',
    title: "Women's V-Neck Basics — BOH-to-Shelf Replenishment (Overdue)",
    description: "BOH has 48 units of Women's V-Neck Basics (WOM-TOP-014) confirmed in Rail C, Bay 2. Shelf is completely empty. Move all 48 units to Women's Basics wall immediately. SLA breach — task is overdue.",
    priority: 'High',
    reason: "BOH-to-Shelf gap — 48 units available, shelf empty",
    impact: '-$420/week in lost sales. SLA breached.',
    status: 'In Progress',
    assignedTo: 'user-3',
    assignedToName: 'J. Martinez',
    dueDate: '2026-05-25',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: "Women's Basics Wall",
    category: "Women's",
    createdAt: '2026-05-25T09:14:00Z',
    localizationId: 'pex-wom-002',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-002',
    slaHours: 3,
    severityRationale: "Shelf image detected 0 units on Women's Basics wall while BOH confirms 48 units available in backroom. SLA of 3 hours breached.",
    confidenceScore: 94,
  },
  {
    id: 'OQ-PEX-003',
    type: 'Add',
    title: 'Summer Running Sneaker — Inventory Mismatch: Move BOH to Floor (In Progress)',
    description: 'System shows 72 units on-hand for Summer Running Sneaker (FTW-SNK-007) but zero sales for 18 days. Physical investigation confirmed: 72 units are in Shoe Storage Bay S3 — misrouted from May 18 receiving. Associate A. Thompson is moving 36 pairs to Footwear Wall W4, Bay 2. Remaining 36 units to be moved tomorrow AM.',
    priority: 'High',
    reason: 'Inventory mismatch — digital count 72 units, physical floor count 0 units',
    impact: '-$1,550/week vs cluster velocity. 18 consecutive zero-sale days.',
    status: 'In Progress',
    assignedTo: 'user-3',
    assignedToName: 'A. Thompson',
    dueDate: '2026-05-28',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: 'Footwear Wall W4, Bay 2',
    category: 'Footwear',
    createdAt: '2026-05-20T07:03:00Z',
    localizationId: 'pex-ftw-003',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-003',
    slaHours: 48,
    severityRationale: 'Phantom stock — 72 units on-hand per system, 0 on shelf for 18 days. Receiving misroute on May 18 confirmed. Associate actively correcting.',
    confidenceScore: 88,
  },
  {
    id: 'OQ-PEX-004',
    type: 'Move',
    title: 'Canvas Tote Bag — POG Compliance: Incorrect Hook Position (Accessories End Cap)',
    description: 'AI shelf audit detected Canvas Tote Bag (ACC-BAG-005) placed 2 hooks left of its planogram position on the Accessories End Cap. Facing count is 3 vs 6 required. Correct placement and add 3 additional facings to restore POG compliance.',
    priority: 'Medium',
    reason: 'POG Compliance Gap — incorrect bay position and insufficient facings',
    impact: '-$210/week from reduced product visibility vs planogram position.',
    status: 'Pending',
    assignedTo: 'user-2',
    assignedToName: 'N. Davis',
    dueDate: '2026-05-30',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: 'Accessories End Cap v2.1',
    category: 'Accessories',
    createdAt: '2026-05-25T08:45:00Z',
    localizationId: 'pex-acc-004',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-004',
    slaHours: 48,
    severityRationale: 'Product 2 hooks left of POG position. Facing count 3 of 6 expected. Compliance gap reducing product visibility and sales velocity.',
    confidenceScore: 87,
  },
  {
    id: 'OQ-PEX-005',
    type: 'Add',
    title: "Athletic Compression Tee — Emerging Product: Increase Display Prominence (Men's Activewear)",
    description: "Athletic Compression Tee (MEN-ACT-004) is accelerating at +64% velocity over 4 weeks, outpacing the cluster by 64%. Current shelf position is undersized for demand. Increase display prominence — move to featured Men's Activewear wall position and request additional DC allocation before next replenishment cycle.",
    priority: 'Medium',
    reason: 'Emerging Product signal — 4-week velocity acceleration detected',
    impact: '+$1,800/week opportunity. Early trend signal — act now to maximise sell-through.',
    status: 'Pending',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-05-31',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: "Men's Activewear Wall",
    category: "Men's",
    createdAt: '2026-05-24T10:00:00Z',
    localizationId: 'pex-men-005',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-005',
    slaHours: 48,
    severityRationale: 'Emerging trend signal. Sales velocity +64% over 4 weeks. Store outselling cluster by 64%. Window to maximise sell-through is now.',
    confidenceScore: 76,
  },
  {
    id: 'OQ-PEX-006',
    type: 'Add',
    title: "Women's V-Neck Basics — At-Risk: OOS on 3 Size Variants — ESCALATED to DM",
    description: "Women's V-Neck Basics (WOM-TOP-014) has confirmed OOS on XS, S, and M size variants. Sales velocity dropped 91% vs cluster. $3,100/week revenue loss. Emergency reorder submitted to DC — 14-day lead time. Task escalated to District Manager John Doe. Immediate action required.",
    priority: 'High',
    reason: 'At-Risk Product — 3 of 4 size variants OOS, 91% velocity drop vs cluster',
    impact: '-$3,100/week revenue loss. Escalated to District Manager.',
    status: 'In Progress',
    assignedTo: 'user-1',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-05-28',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: "Women's Basics Wall",
    category: "Women's",
    createdAt: '2026-05-22T11:00:00Z',
    localizationId: 'pex-wom-006',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-006',
    slaHours: 12,
    severityRationale: 'OOS confirmed on 3 size variants. 91% velocity drop. Emergency DC reorder placed — 14-day lead time. Escalated to DM.',
    confidenceScore: 89,
  },
  {
    id: 'OQ-PEX-007',
    type: 'Add',
    title: 'Seasonal Rain Jacket — BOH-to-Shelf Sync: 60 Units Available, Shelf Empty (Overdue)',
    description: 'Seasonal Rain Jacket (SEA-JKT-004) shelf on Seasonal Promo Table is completely empty. AI audit confirmed 60 units available in BOH Rail S5, Bay 1. Cluster selling 35 units/week. Move all 60 units from BOH to Seasonal Promo Table immediately. SLA breached.',
    priority: 'High',
    reason: 'BOH-to-Shelf gap — 60 units in BOH, shelf empty. SLA breached.',
    impact: '-$390/week in lost seasonal sales. SLA overdue.',
    status: 'In Progress',
    assignedTo: 'user-3',
    assignedToName: 'R. Garcia',
    dueDate: '2026-05-26',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: 'Seasonal Promo Table',
    category: 'Seasonal',
    createdAt: '2026-05-25T09:14:00Z',
    localizationId: 'pex-sea-007',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-007',
    slaHours: 4,
    severityRationale: 'Seasonal shelf fully empty. 60 units confirmed BOH. Same-day SLA breached. High foot traffic period.',
    confidenceScore: 91,
  },
  {
    id: 'OQ-PEX-008',
    type: 'Move',
    title: "Slim Fit Denim — Dark Wash — Top Performer: Allocation Increased & Shelf Confirmed (Resolved)",
    description: "Slim Fit Denim — Dark Wash (MEN-DNM-003) confirmed as top performer at 60% above cluster average. Additional allocation received. 4 facings confirmed at eye level, Bay 3, Rack R-12. Task resolved — no further action required. Monitor weekly to prevent OOS.",
    priority: 'Medium',
    reason: 'Top Performing Product — allocation increase confirmed and shelf verified',
    impact: '+$2,800/week opportunity captured. Task resolved.',
    status: 'Completed',
    assignedTo: 'user-3',
    assignedToName: 'Mike Chen',
    dueDate: '2026-05-23',
    storeName: 'Nashville Flagship #2034',
    storeGroup: 'District 14 — Tennessee',
    pogName: "Men's Denim Wall, Bay 3",
    category: "Men's",
    createdAt: '2026-05-21T09:00:00Z',
    localizationId: 'pex-men-008',
    source: 'Product Execution',
    sourceLink: '/inventory-management/product-execution/PEX-008',
    slaHours: 48,
    severityRationale: 'Top performer 60% above cluster. Allocation secured and shelves stocked. Resolved.',
    confidenceScore: 88,
  },
  // Broadcast-linked tasks
  {
    id: 'tc-bc-001-1',
    type: 'Reset Shelf',
    title: "[RECALL] Remove Children's Pajamas Drawstring Batch #7742 from sales floor",
    description: "Remove all units of Children's Pajamas — Drawstring Safety Recall Batch #7742 from sales floor rails. Check all Kids aisles and endcaps.",
    priority: 'High',
    reason: 'Product Recall — Compliance Office directive',
    impact: 'Regulatory compliance — immediate action required',
    status: 'Pending',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-04-24',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Kids Section 2C v1.2',
    category: 'Kids',
    createdAt: '2026-04-24T10:00:00Z',
    localizationId: 'bc-001',
    source: 'Broadcast',
    slaHours: 4,
    severityRationale: 'Product Recall — regulatory compliance requires immediate removal from all customer-accessible areas.',
  },
  {
    id: 'tc-bc-001-2',
    type: 'Move',
    title: "[RECALL] Quarantine Children's Pajamas Drawstring Batch #7742 in backroom",
    description: "Locate and quarantine all backroom inventory of Children's Pajamas — Drawstring Safety Recall Batch #7742. Tag for return shipment.",
    priority: 'High',
    reason: 'Product Recall — Compliance Office directive',
    impact: 'Regulatory compliance — immediate action required',
    status: 'Pending',
    assignedTo: 'user-3',
    assignedToName: 'Mike Chen',
    dueDate: '2026-04-24',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Kids Section 2C v1.2',
    category: 'Kids',
    createdAt: '2026-04-24T10:00:00Z',
    localizationId: 'bc-001',
    source: 'Broadcast',
    slaHours: 4,
    severityRationale: 'Product Recall — backroom quarantine required to prevent re-shelving of recalled inventory.',
  },
  {
    id: 'tc-bc-001-3',
    type: 'Update Label',
    title: '[RECALL] Confirm recalled item count and submit report',
    description: 'Count total units removed from shelf and backroom. Submit confirmation report to Regional HQ via compliance portal.',
    priority: 'High',
    reason: 'Product Recall — audit trail required',
    impact: 'Compliance documentation',
    status: 'Pending',
    assignedTo: null,
    assignedToName: undefined,
    dueDate: '2026-04-24',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Kids Section 2C v1.2',
    category: 'Kids',
    createdAt: '2026-04-24T10:00:00Z',
    localizationId: 'bc-001',
    source: 'Broadcast',
    slaHours: 8,
    severityRationale: 'Audit trail required for recalled product — compliance documentation must be submitted within shift.',
  },
  {
    id: 'tc-bc-002-1',
    type: 'Reset Shelf',
    title: '[PLANOGRAM] Implement Summer Collection Endcap layout',
    description: 'Set up new endcap display per visual guide v2.3. Remove winter clearance items and install summer fixtures.',
    priority: 'Medium',
    reason: 'Planogram Refresh — Visual Merchandising directive',
    impact: 'Seasonal transition — revenue impact on featured items',
    status: 'In Progress',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-04-25',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Summer Collection Endcap v2.3',
    category: 'Seasonal',
    createdAt: '2026-04-23T08:00:00Z',
    localizationId: 'bc-002',
    source: 'Broadcast',
    slaHours: 48,
    severityRationale: 'Seasonal planogram refresh — revenue impact on featured endcap items during transition period.',
  },
  {
    id: 'tc-bc-003-1',
    type: 'Install Fixture',
    title: '[SAFETY] Complete fire safety checklist — Zone A & B',
    description: 'Walk through Zone A and B, verify fire extinguisher access, exit signage, and clear pathways. Submit photo evidence.',
    priority: 'High',
    reason: 'Fire Safety Audit Prep — Q2 Compliance Check',
    impact: 'Regulatory compliance — overdue',
    status: 'Completed',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-04-22',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Store Safety Compliance',
    category: 'Safety',
    createdAt: '2026-04-21T09:00:00Z',
    localizationId: 'bc-003',
    source: 'Broadcast',
    slaHours: 24,
    severityRationale: 'Q2 fire safety audit preparation — overdue compliance check requires immediate walk-through and photo documentation.',
  },
];

// Map broadcast IDs to search terms for filtering
const broadcastSearchMap: Record<string, string> = {
  'bc-001': '[RECALL]',
  'bc-002': '[PLANOGRAM]',
  'bc-003': '[SAFETY]',
};

type ViewMode = 'board' | 'list';
type FilterStatus = 'all' | 'Pending' | 'In Progress' | 'Completed';

// ── Dropdown option metadata ──
const PRIORITY_META: Record<Priority, { desc: string }> = {
  High:   { desc: 'Escalate · resolve within 2–4 hours' },
  Medium: { desc: 'Resolve by end of day' },
  Low:    { desc: 'Schedule for next available cycle' },
};

const TYPE_OPTIONS: {
  key: ExecutionTask['type'];
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  { key: 'Reset Shelf',    label: 'Reset Shelf',       desc: 'Rearrange facing & shelf alignment',   Icon: RefreshOutlined },
  { key: 'Add',            label: 'Add / Replenish',   desc: 'Stock shelves or fill inventory',       Icon: Add },
  { key: 'Remove',         label: 'Remove',            desc: 'Pull product from the floor',           Icon: RemoveOutlined },
  { key: 'Move',           label: 'Move / Reposition', desc: 'Relocate product or display',           Icon: OpenWithOutlined },
  { key: 'Adjust Facing',  label: 'Adjust Facing',     desc: 'Fix facing count & product depth',      Icon: TuneOutlined },
  { key: 'Update Label',   label: 'Update Label',      desc: 'Replace or fix shelf labels',           Icon: LabelOutlined },
  { key: 'Install Fixture',label: 'Install Fixture',   desc: 'Set up or install a display fixture',   Icon: BuildOutlined },
];

// ── Anchor-tracked dropdown state helper ──
type DdKey = 'priority' | 'type' | 'assignee' | 'detail-status' | 'detail-owner';

export const TaskCenter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { tasks: contextTasks, addTasks, updateTaskStatus, assignTask, teamMembers } = useExecutionTasks();
  const [tcSearchParams, setTcSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('board');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ExecutionTask | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [broadcastHighlight, setBroadcastHighlight] = useState<string | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [prefillBanner, setPrefillBanner] = useState<{ title: string; count: number; managers: string[] } | null>(null);
  const [prefillIds, setPrefillIds] = useState<string[]>([]);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefillHandledRef = useRef(false);
  const signalPrefillHandledRef = useRef(false);
  const signalPrefillRef = useRef<{ fieldSignalId: string } | null>(null);

  const [ddAnchors, setDdAnchors] = useState<Partial<Record<DdKey, HTMLElement | null>>>({});
  const openDd = (key: DdKey, el: HTMLElement) => setDdAnchors(a => ({ ...a, [key]: el }));
  const closeDd = (key: DdKey) => setDdAnchors(a => ({ ...a, [key]: null }));

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Scroll the newly created task into view when highlight activates
  useEffect(() => {
    if (!highlightedTaskId) return;
    const el = document.getElementById(`tc-task-${highlightedTaskId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedTaskId]);

  // Handle deep-link from Product Execution detail — highlight the linked task
  useEffect(() => {
    const state = location.state as { highlightPexTask?: string } | null;
    const pexTaskId = state?.highlightPexTask;
    if (!pexTaskId) return;
    window.history.replaceState({}, document.title);
    setView('list');
    setFilter('all');
    setHighlightedTaskId(pexTaskId);
    setTimeout(() => {
      const el = document.getElementById(`tc-task-${pexTaskId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, [location.state]);

  // Handle broadcast deep-link from OCV
  useEffect(() => {
    const bcId = tcSearchParams.get('broadcast');
    if (bcId && broadcastSearchMap[bcId]) {
      setSearch(broadcastSearchMap[bcId]);
      setBroadcastHighlight(bcId);
      setFilter('all');
      setView('list');
      setTcSearchParams({}, { replace: true });
    }
  }, [tcSearchParams, setTcSearchParams]);

  // Seed tasks once
  useEffect(() => {
    if (!seeded) {
      const existingIds = new Set(contextTasks.map(t => t.id));
      const newSeeds = seedTasks.filter(t => !existingIds.has(t.id));
      if (newSeeds.length > 0) addTasks(newSeeds);
      setSeeded(true);
    }
  }, [seeded, contextTasks, addTasks]);

  // Prefill tasks from an Alert (e.g., "Open in Operations Queue") — one task per store, tagged to the store manager
  useEffect(() => {
    if (prefillHandledRef.current) return;
    const state = location.state as { prefillFromAlert?: { alertId?: string; title: string; description?: string; severity?: string; source?: string; stores: { name: string; manager?: string; detail?: string }[] } } | null;
    const payload = state?.prefillFromAlert;
    if (!payload || !payload.stores || payload.stores.length === 0) return;
    prefillHandledRef.current = true;

    setPrefillLoading(true);
    setView('list');
    setFilter('all');
    // Clear router state so a refresh doesn't re-trigger
    window.history.replaceState({}, document.title);

    setTimeout(() => {
      const sevToPriority: Record<string, Priority> = { critical: 'High', risk: 'High', warning: 'Medium', info: 'Low' };
      const priority: Priority = sevToPriority[(payload.severity || '').toLowerCase()] || 'High';
      const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const createdAt = new Date().toISOString();
      const taskType: ExecutionTask['type'] = payload.alertId === 'alert-inventory' ? 'Add' : 'Reset Shelf';

      // Alert-type-specific enrichment
      const isPhantom = (payload.alertId || '').toLowerCase().includes('phantom') || (payload.title || '').toLowerCase().includes('phantom');
      const isBOH    = (payload.alertId || '').toLowerCase().includes('boh') || (payload.alertId || '').toLowerCase().includes('inventory');
      const isPOG    = (payload.alertId || '').toLowerCase().includes('pog') || (payload.alertId || '').toLowerCase().includes('planogram');

      const alertType: ExecutionTask['alertType'] = isPhantom ? 'Phantom Stock' : isBOH ? 'BOH-to-Shelf Sync' : isPOG ? 'POG Compliance Gap' : undefined;

      const checklists: Record<string, { text: string; done: boolean }[]> = {
        'Phantom Stock': [
          { text: 'Pull the SKU list flagged by the phantom stock detection engine', done: false },
          { text: 'Physically locate and count each affected SKU in the sales zone', done: false },
          { text: 'Check backroom for any unprocessed receiving that inflated system count', done: false },
          { text: 'Compare physical count against system inventory for each SKU', done: false },
          { text: 'Submit cycle count adjustment in POS/inventory system', done: false },
          { text: 'Reset shelf and confirm product is physically present or removed', done: false },
          { text: 'Mark task complete and attach photo evidence of corrected shelf', done: false },
        ],
        'BOH-to-Shelf Sync': [
          { text: 'Print or pull the BOH replenishment list for affected SKUs', done: false },
          { text: 'Locate all flagged items in the backroom', done: false },
          { text: 'Transport items to the sales floor during a non-selling window', done: false },
          { text: 'Replenish shelves and straighten facings per planogram', done: false },
          { text: 'Update receiving log if items were unprocessed inbound', done: false },
          { text: 'Attach before/after shelf photo via the compliance tool', done: false },
        ],
        'POG Compliance Gap': [
          { text: 'Print the current planogram for the flagged fixture', done: false },
          { text: 'Walk the fixture and identify all out-of-position items', done: false },
          { text: 'Rearrange products to match planogram spec (positions, facings)', done: false },
          { text: 'Ensure pricing labels are aligned with restocked positions', done: false },
          { text: 'Submit post-reset photo to the compliance audit portal', done: false },
          { text: 'Note any missing items for replenishment follow-up', done: false },
        ],
      };

      const detectionMethods: Record<string, string> = {
        'Phantom Stock': 'AI Inventory Engine — cross-referenced POS sales velocity vs system on-hand for 14+ days',
        'BOH-to-Shelf Sync': 'AI Inventory Engine — detected BOH quantity > 0 with shelf OOS condition',
        'POG Compliance Gap': 'Camera Shelf Audit AI — computer vision scan detected deviation from planogram spec',
      };

      const estimatedMinutesByType: Record<string, number> = {
        'Phantom Stock': 30,
        'BOH-to-Shelf Sync': 20,
        'POG Compliance Gap': 25,
      };

      const newTasks: ExecutionTask[] = payload.stores.map((s, idx) => {
        const memberMatch = teamMembers.find(m => m.name === s.manager);
        const id = `tc-prefill-${payload.alertId || 'alert'}-${Date.now()}-${idx}`;
        return {
          id,
          type: taskType,
          title: `${payload.title} — ${s.name}`,
          description: payload.description || '',
          priority,
          reason: s.detail || payload.title,
          impact: payload.description || '',
          status: 'Pending',
          assignedTo: memberMatch?.id || `mgr-${s.name.replace(/\s+/g, '-').toLowerCase()}`,
          assignedToName: s.manager || 'Store Manager',
          dueDate: due,
          storeName: s.name,
          storeGroup: 'Alert-driven Tasks',
          pogName: '—',
          category: isBOH ? 'Inventory' : 'Operations',
          createdAt,
          localizationId: `alert-${payload.alertId || 'gen'}-${idx}`,
          source: 'Automated Execution Alert',
          slaHours: priority === 'High' ? 24 : 48,
          severityRationale: s.detail,
          alertType,
          confidenceScore: isPhantom ? 91 : isBOH ? 88 : isPOG ? 94 : undefined,
          detectionMethod: alertType ? detectionMethods[alertType] : undefined,
          affectedSkuCount: isPhantom ? 14 : isBOH ? 8 : undefined,
          estimatedMinutes: alertType ? estimatedMinutesByType[alertType] : undefined,
          checklist: alertType ? checklists[alertType] : undefined,
        };
      });

      addTasks(newTasks);
      setPrefillIds(newTasks.map(t => t.id));
      setPrefillBanner({
        title: payload.title,
        count: newTasks.length,
        managers: payload.stores.map(s => s.manager || 'Store Manager'),
      });
      setPrefillLoading(false);
    }, 1400);
  }, [location.state, addTasks, teamMembers]);

  // Prefill Create Task modal from Field Signal (user must review and confirm)
  useEffect(() => {
    if (signalPrefillHandledRef.current) return;
    const state = location.state as {
      prefillFromSignal?: {
        fieldSignalId: string;
        title: string;
        description?: string;
        storeName?: string;
        priority?: Priority;
      };
    } | null;
    const payload = state?.prefillFromSignal;
    if (!payload) return;
    signalPrefillHandledRef.current = true;
    signalPrefillRef.current = { fieldSignalId: payload.fieldSignalId };
    window.history.replaceState({}, document.title);
    const due = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setNewTask({
      title: payload.title,
      description: payload.description || '',
      priority: payload.priority || 'Medium',
      assignedTo: '',
      dueDate: due,
      type: 'Reset Shelf',
    });
    setView('list');
    setFilter('all');
    setShowCreateModal(true);
  }, [location.state]);

  // All tasks
  const allTasks = contextTasks;

  // Filtered tasks
  const filteredTasks = allTasks
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => {
      if (!search) return true;
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.assignedToName || '').toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const counts = {
    all: allTasks.length,
    pending: allTasks.filter(t => t.status === 'Pending').length,
    inProgress: allTasks.filter(t => t.status === 'In Progress').length,
    completed: allTasks.filter(t => t.status === 'Completed').length,
  };

  const boardTasks = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (d: string | null, status: string) => {
    if (!d || status === 'Completed') return false;
    return new Date(d) < new Date();
  };

  // ── Create Task ──
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Priority,
    assignedTo: '',
    dueDate: '',
    type: 'Reset Shelf' as ExecutionTask['type'],
  });

  const handleCreate = () => {
    if (!newTask.title.trim()) return;
    const member = teamMembers.find(m => m.id === newTask.assignedTo);
    const isFromSignal = !!signalPrefillRef.current;
    const task: ExecutionTask = {
      id: `tc-${Date.now()}`,
      type: newTask.type,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      reason: isFromSignal ? 'Created from Field Signal' : 'Manually created',
      impact: '',
      status: 'Pending',
      assignedTo: newTask.assignedTo || null,
      assignedToName: member?.name,
      dueDate: newTask.dueDate || null,
      storeName: 'Downtown Plaza #2034',
      storeGroup: 'Urban Flagship Cluster',
      pogName: '',
      category: 'General',
      createdAt: new Date().toISOString(),
      localizationId: 'manual',
      ...(isFromSignal && {
        source: 'Field Signal',
        fieldSignalId: signalPrefillRef.current!.fieldSignalId,
      }),
    };
    addTasks([task]);
    if (signalPrefillRef.current) {
      sessionStorage.setItem(
        'fieldSignalTaskLink',
        JSON.stringify({ signalId: signalPrefillRef.current.fieldSignalId, taskId: task.id })
      );
      signalPrefillRef.current = null;
    }
    setShowCreateModal(false);
    setNewTask({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '', type: 'Reset Shelf' });

    // Highlight the new task for 3.5s, switching to list view so it's visible
    setView('list');
    setFilter('all');
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedTaskId(task.id);
    highlightTimerRef.current = setTimeout(() => setHighlightedTaskId(null), 3500);

    // Immediate toast notification
    const notifLabel = isFromSignal ? 'Task Created From Field Signal' : 'Task Created Successfully';
    showToast(notifLabel, 'success');
  };

  // ── Source badge helper ──
  const getSourceIcon = (source?: string) => {
    if (source === 'AI POG Audit') return <AutoAwesomeOutlined sx={{ fontSize: 10 }} />;
    if (source === 'Localization Engine') return <AutoAwesomeOutlined sx={{ fontSize: 10 }} />;
    if (source === 'Broadcast') return <WarningAmberOutlined sx={{ fontSize: 10 }} />;
    if (source === 'Field Signal') return <SensorsOutlined sx={{ fontSize: 10 }} />;
    if (source === 'Automated Execution Alert') return <BoltOutlined sx={{ fontSize: 10 }} />;
    return null;
  };

  const getSourceClass = (source?: string) => {
    if (source === 'AI POG Audit' || source === 'Localization Engine') return 'tc-source--ai';
    if (source === 'Broadcast') return 'tc-source--broadcast';
    if (source === 'Field Signal') return 'tc-source--signal';
    if (source === 'Automated Execution Alert') return 'tc-source--automated';
    return 'tc-source--manual';
  };

  // ── SLA helper ──
  const getSlaStatus = (task: ExecutionTask) => {
    if (!task.slaHours || !task.createdAt) return null;
    const created = new Date(task.createdAt).getTime();
    const deadline = created + task.slaHours * 60 * 60 * 1000;
    const now = Date.now();
    const remaining = deadline - now;
    if (task.status === 'Completed') return { label: 'Met', className: 'tc-sla--met' };
    if (remaining < 0) return { label: 'Breached', className: 'tc-sla--breached' };
    if (remaining < 4 * 60 * 60 * 1000) return { label: `${Math.ceil(remaining / (60 * 60 * 1000))}h left`, className: 'tc-sla--urgent' };
    return { label: `${Math.ceil(remaining / (60 * 60 * 1000))}h left`, className: 'tc-sla--ok' };
  };

  // ── Task Card ──
  const renderCard = (task: ExecutionTask) => (
    <div key={task.id} id={`tc-task-${task.id}`} className={highlightedTaskId === task.id ? 'tc-card-new-highlight' : ''}>
    <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '12px 14px', cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
      <div className="tc-card-top">
        <span className="tc-card-title">{task.title}</span>
        <span className={`tc-card-priority tc-pri--${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      {task.description && <div className="tc-card-desc">{task.description}</div>}
      {task.source && task.source !== 'Manual' && (
        <div className={`tc-card-source ${getSourceClass(task.source)}`}>
          {getSourceIcon(task.source)}
          <span>{task.source === 'AI POG Audit' ? 'Created from AI POG Audit' : task.source === 'Localization Engine' ? 'Created from Localization Engine' : task.source}</span>
          {task.confidenceScore && <span className="tc-card-source-conf">{task.confidenceScore}%</span>}
        </div>
      )}
      <div className="tc-card-meta">
        <div className="tc-card-meta-left">
          <span className="tc-card-type">{task.type}</span>
          {task.dueDate && (
            <span className={`tc-card-due ${isOverdue(task.dueDate, task.status) ? 'tc-due--overdue' : ''}`}>
              <CalendarTodayOutlined sx={{ fontSize: 10 }} />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.assignedToName ? (
          <span className="tc-card-assignee" title={task.assignedToName}>
            {task.assignedToName.split(' ').map(n => n[0]).join('')}
          </span>
        ) : (
          <span className="tc-card-assignee tc-unassigned">
            <PersonOutlined sx={{ fontSize: 12 }} />
          </span>
        )}
      </div>
    </Card>
    </div>
  );

  // ── Board View ──
  const renderBoard = () => (
    <div className="tc-board">
      {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map(status => {
        const colClass = status === 'Pending' ? 'pending' : status === 'In Progress' ? 'inprogress' : 'completed';
        const tasks = boardTasks(status);
        return (
          <div key={status} className={`tc-board-col tc-board-col--${colClass}`}>
            <div className="tc-board-col-header">
              <span>{status}</span>
              <span className="tc-board-col-count">{tasks.length}</span>
            </div>
            <div className="tc-board-col-body">
              {tasks.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ia-color-text-tertiary)', fontSize: 'var(--ia-text-xs)' }}>No tasks</div>
              ) : (
                tasks.map(renderCard)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── List View (UAM-style table) ──
  const renderList = () => (
    <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
      <table className="tc-table wow-table">
        <thead>
          <tr>
            <th className="tc-th-task">Task</th>
            <th className="tc-th-status">Status</th>
            <th className="tc-th-priority">Priority</th>
            <th className="tc-th-type">Type</th>
            <th className="tc-th-assignee">Assignee</th>
            <th className="tc-th-due">Due</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="tc-table-empty">
                <SearchOutlined sx={{ fontSize: 20 }} />
                <span>No tasks match your search or filters</span>
              </td>
            </tr>
          ) : (
            filteredTasks.map(task => (
              <tr
                key={task.id}
                id={`tc-task-${task.id}`}
                className={`tc-table-row${broadcastHighlight && task.localizationId === broadcastHighlight ? ' tc-table-row--highlighted' : ''}${prefillIds.includes(task.id) ? ' tc-table-row--prefilled' : ''}${highlightedTaskId === task.id ? ' tc-table-row--new-highlight' : ''}`}
                onClick={() => setSelectedTask(task)}
              >
                <td className="tc-td-task">
                  <div className="tc-td-task-inner">
                    <span className="tc-td-task-title">{task.title}</span>
                    {task.description && (
                      <span className="tc-td-task-desc">{task.description}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={`tc-status-pill tc-status-pill--${task.status === 'Pending' ? 'pending' : task.status === 'In Progress' ? 'inprogress' : 'completed'}`}>
                    <span className="tc-status-pill-dot" />
                    <span>{task.status}</span>
                  </div>
                </td>
                <td>
                  <span className={`tc-priority-tag tc-pri--${task.priority.toLowerCase()}`}>{task.priority}</span>
                </td>
                <td>
                  <span className="tc-type-tag">{task.type}</span>
                </td>
                <td>
                  {task.assignedToName ? (
                    <div className="tc-td-assignee">
                      <span className="tc-td-avatar">{task.assignedToName.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                      <span className="tc-td-assignee-name">{task.assignedToName}</span>
                    </div>
                  ) : (
                    <span className="tc-td-unassigned">Unassigned</span>
                  )}
                </td>
                <td>
                  <span className={`tc-td-due ${isOverdue(task.dueDate, task.status) ? 'tc-due--overdue' : ''}`}>{formatDate(task.dueDate)}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="tc-container">
        <div className="page-loading">
          <Loader size="large" />
          <p>Loading Operations Queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tc-container">
      {prefillLoading && (
        <div className="tc-prefill-overlay">
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '28px 32px' }}>
            <Loader size="medium" />
            <div className="tc-prefill-title">Linking auto-created tasks…</div>
            <div className="tc-prefill-sub">Fetching auto-created tasks for each impacted store and loading your Operations Queue.</div>
          </Card>
        </div>
      )}

      {prefillBanner && !prefillLoading && (
        <Alert
          severity="success"
          title={`${prefillBanner.count} auto-created tasks linked for "${prefillBanner.title}"`}
          description={`Auto-assigned to ${prefillBanner.managers.join(', ')}`}
          onClose={() => setPrefillBanner(null)}
          subtleBackground
        />
      )}

      {/* ── Header card ── */}
      <div className="tc-top-card">
        <div className="district-intel-header tc-di-header">
          <div className="header-left">
            <div className="header-title">
              <AssignmentOutlined sx={{ fontSize: 22 }} />
              <h1>Operations Queue</h1>
            </div>
            <div className="header-meta">
              <span className="district-badge">
                <AssignmentOutlined sx={{ fontSize: 13 }} />
                Task Center
              </span>
              <span className="district-badge tc-meta-pill">
                <TaskAltOutlined sx={{ fontSize: 13 }} />
                {counts.all} tasks
              </span>
              <span className="tc-meta-updated">Manage, assign &amp; track tasks across your stores</span>
            </div>
          </div>
          <div className="tc-header-right">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              className="tc-create-btn"
              startIcon={<Add sx={{ fontSize: 15 }} />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Strip card (BCA KPI strip style) ── */}
      <div className="tc-summary-card">
        <div className="tc-summary-strip">
          <div className="tc-stat-pill">
            <span className="tc-stat-pill-label">Total</span>
            <span className="tc-stat-pill-value">{counts.all}</span>
            <span className="tc-stat-pill-context">tasks in queue</span>
          </div>
          <div className="tc-stat-pill">
            <span className="tc-stat-pill-label">To Do</span>
            <span className="tc-stat-pill-value tc-stat-pill-value--neutral">{counts.pending}</span>
            <span className="tc-stat-pill-context">not yet started</span>
          </div>
          <div className="tc-stat-pill">
            <span className="tc-stat-pill-label">In Progress</span>
            <span className="tc-stat-pill-value tc-stat-pill-value--warning">{counts.inProgress}</span>
            <span className="tc-stat-pill-context">currently active</span>
          </div>
          <div className="tc-stat-pill">
            <span className="tc-stat-pill-label">Done</span>
            <span className="tc-stat-pill-value tc-stat-pill-value--success">{counts.completed}</span>
            <span className="tc-stat-pill-context">completed</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar (Store Leaderboard style — search left, filter pills right) ── */}
      <div className="tc-toolbar tc-toolbar--leaderboard">
        <div className="tc-search-bar">
          <Input
            leftIcon={<SearchOutlined sx={{ fontSize: 15 }} />}
            rightIcon={search ? <CloseOutlined sx={{ fontSize: 13 }} /> : undefined}
            rightIconClick={search ? () => setSearch('') : undefined}
            placeholder="Search tasks, assignees, stores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tc-toolbar-right">
          <Tabs
            tabNames={[
              { value: 'all', label: 'All Tasks' },
              { value: 'Pending', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Done' },
            ]}
            tabPanels={[]}
            value={filter}
            onChange={(_, val) => setFilter(val as FilterStatus)}
          />
          <div className="tc-view-toggle">
            <Button
              variant={view === 'board' ? 'contained' : 'outlined'}
              color="primary"
              size="small"
              className="tc-view-btn"
              onClick={() => setView('board')}
              aria-label="Board view"
              title="Board"
            >
              <DashboardOutlined sx={{ fontSize: 15 }} />
            </Button>
            <Button
              variant={view === 'list' ? 'contained' : 'outlined'}
              color="primary"
              size="small"
              className="tc-view-btn"
              onClick={() => setView('list')}
              aria-label="List view"
              title="List"
            >
              <ListOutlined sx={{ fontSize: 15 }} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="tc-content">
        {allTasks.length === 0 ? (
          <div className="tc-empty">
            <div className="tc-empty-icon"><AssignmentOutlined sx={{ fontSize: 28 }} /></div>
            <h3>No Tasks Yet</h3>
            <p>Create a task or use Ask Alan to generate tasks from shelf audits.</p>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              className="tc-create-btn"
              startIcon={<Add sx={{ fontSize: 15 }} />}
              onClick={() => setShowCreateModal(true)}
            >
              Create First Task
            </Button>
          </div>
        ) : view === 'board' ? renderBoard() : renderList()}
      </div>

      {/* ── Create Task Modal (mirrors Create User look) ── */}
      {showCreateModal && (
        <div className="tc-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="tc-modal tc-modal--wow" onClick={e => e.stopPropagation()}>
            {/* Header with icon block + title + subtitle + close */}
            <div className="tc-m-header">
              <div className="tc-m-header-icon">
                <AssignmentOutlined sx={{ fontSize: 18 }} />
              </div>
              <div className="tc-m-header-text">
                <h3>Create New Task</h3>
                <p>Add a task and assign it to your team</p>
              </div>
              <Button variant="text" size="small" className="tc-m-close" onClick={() => setShowCreateModal(false)} aria-label="Close">
                <CloseOutlined sx={{ fontSize: 16 }} />
              </Button>
            </div>

            {/* Body */}
            <div className="tc-m-body">
              {/* Section: Task Details */}
              <div className="tc-m-section">
                <div className="tc-m-section-label">
                  <DescriptionOutlined sx={{ fontSize: 13 }} />
                  <span>Task Details</span>
                </div>
                <div className="tc-m-field" style={{ marginBottom: 14 }}>
                  <label>Title <span className="tc-m-req">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Reset shelf for Energy Drinks"
                    value={newTask.title}
                    onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="tc-m-field">
                  <label>Description</label>
                  <TextArea
                    placeholder="Add context, instructions, or notes for the assignee..."
                    value={newTask.description}
                    onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* Section: Classification */}
              <div className="tc-m-section">
                <div className="tc-m-section-label">
                  <SecurityOutlined sx={{ fontSize: 13 }} />
                  <span>Classification</span>
                </div>
                <div className="tc-m-fields-row">
                  {/* Priority */}
                  <div className="tc-m-field">
                    <label>Priority</label>
                    <div className="tc-dd-wrap">
                      <button
                        type="button"
                        className={`tc-dd-trigger${!!ddAnchors.priority ? ' tc-dd-trigger--open' : ''}`}
                        onClick={e => !!ddAnchors.priority ? closeDd('priority') : openDd('priority', e.currentTarget)}
                        aria-haspopup="listbox"
                      >
                        <span className={`tc-dd-pri-dot tc-dd-pri-dot--${newTask.priority.toLowerCase()}`} />
                        <span className="tc-dd-trigger-text">{newTask.priority}</span>
                        <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron${!!ddAnchors.priority ? ' tc-dd-chevron--open' : ''}`} />
                      </button>
                      <Menu
                        anchorEl={ddAnchors.priority}
                        open={!!ddAnchors.priority}
                        onClose={() => closeDd('priority')}
                        options={(['High', 'Medium', 'Low'] as Priority[]).map(p => ({
                          label: p,
                          subLabel: PRIORITY_META[p].desc,
                          value: p,
                          onClick: () => { setNewTask(prev => ({ ...prev, priority: p })); closeDd('priority'); },
                        }))}
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div className="tc-m-field">
                    <label>Type</label>
                    {(() => {
                      const activeType = TYPE_OPTIONS.find(o => o.key === newTask.type);
                      const TypeIcon = activeType?.Icon ?? BuildOutlined;
                      return (
                        <div className="tc-dd-wrap">
                          <button
                            type="button"
                            className={`tc-dd-trigger${!!ddAnchors.type ? ' tc-dd-trigger--open' : ''}`}
                            onClick={e => !!ddAnchors.type ? closeDd('type') : openDd('type', e.currentTarget)}
                          >
                            <TypeIcon sx={{ fontSize: 14 }} className="tc-dd-icon-muted" />
                            <span className="tc-dd-trigger-text">{activeType?.label ?? newTask.type}</span>
                            <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron${!!ddAnchors.type ? ' tc-dd-chevron--open' : ''}`} />
                          </button>
                          <Menu
                            anchorEl={ddAnchors.type}
                            open={!!ddAnchors.type}
                            onClose={() => closeDd('type')}
                            options={TYPE_OPTIONS.map(({ key, label, desc, Icon }) => ({
                              label,
                              subLabel: desc,
                              value: key,
                              icon: <Icon sx={{ fontSize: 13 }} />,
                              onClick: () => { setNewTask(prev => ({ ...prev, type: key })); closeDd('type'); },
                            }))}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Section: Assignment & Schedule */}
              <div className="tc-m-section tc-m-section--last">
                <div className="tc-m-section-label">
                  <PersonOutlined sx={{ fontSize: 13 }} />
                  <span>Assignment & Schedule</span>
                </div>
                <div className="tc-m-fields-row">
                  {/* Assignee */}
                  <div className="tc-m-field">
                    <label>Assignee</label>
                    <div className="tc-dd-wrap">
                      <button
                        type="button"
                        className={`tc-dd-trigger${!!ddAnchors.assignee ? ' tc-dd-trigger--open' : ''}`}
                        onClick={e => !!ddAnchors.assignee ? closeDd('assignee') : openDd('assignee', e.currentTarget)}
                      >
                        {newTask.assignedTo ? (
                          <>
                            <span className="tc-dd-avatar">
                              {(teamMembers.find(m => m.id === newTask.assignedTo)?.name || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                            <span className="tc-dd-trigger-text">{teamMembers.find(m => m.id === newTask.assignedTo)?.name}</span>
                          </>
                        ) : (
                          <>
                            <PersonOutlined sx={{ fontSize: 14 }} className="tc-dd-icon-muted" />
                            <span className="tc-dd-trigger-text tc-dd-trigger-text--placeholder">Select assignee...</span>
                          </>
                        )}
                        <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron${!!ddAnchors.assignee ? ' tc-dd-chevron--open' : ''}`} />
                      </button>
                      <Menu
                        anchorEl={ddAnchors.assignee}
                        open={!!ddAnchors.assignee}
                        onClose={() => closeDd('assignee')}
                        options={[
                          { label: 'Unassigned', value: '', icon: <PersonOutlined sx={{ fontSize: 13 }} />, onClick: () => { setNewTask(prev => ({ ...prev, assignedTo: '' })); closeDd('assignee'); } },
                          ...teamMembers.map(m => ({
                            label: m.name,
                            subLabel: m.role,
                            value: m.id,
                            onClick: () => { setNewTask(prev => ({ ...prev, assignedTo: m.id })); closeDd('assignee'); },
                          })),
                        ]}
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="tc-m-field">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="tc-m-footer">
              <Button variant="outlined" color="primary" className="tc-m-cancel" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                className="tc-m-submit"
                onClick={handleCreate}
                disabled={!newTask.title.trim()}
                startIcon={<Add sx={{ fontSize: 14 }} />}
              >
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Drawer (structured & wow) ── */}
      <Panel
        open={!!selectedTask}
        setIsOpen={(v) => { if (!v) setSelectedTask(null); }}
        onClose={() => setSelectedTask(null)}
        anchor="right"
        size="large"
      >
        {selectedTask && (() => {
          const sla = getSlaStatus(selectedTask);
          const statusKey = selectedTask.status === 'Pending' ? 'pending' : selectedTask.status === 'In Progress' ? 'inprogress' : 'completed';
          return (
            <div className="tc-detail tc-detail--panel">
              {/* Hero header */}
              <div className="tc-detail-hero">
                <div className="tc-detail-hero-top">
                  <div className="tc-detail-hero-id">
                    <AssignmentOutlined sx={{ fontSize: 13 }} />
                    <span>{selectedTask.id.toUpperCase()}</span>
                  </div>
                  <Button variant="text" size="small" className="tc-detail-close" onClick={() => setSelectedTask(null)} aria-label="Close">
                    <CloseOutlined sx={{ fontSize: 16 }} />
                  </Button>
                </div>
                <h2 className="tc-detail-hero-title">{selectedTask.title}</h2>
                <div className="tc-detail-hero-pills">
                  <Badge
                    label={selectedTask.status}
                    size="medium"
                    color={
                      statusKey === 'completed' ? 'success' : statusKey === 'inprogress' ? 'warning' : 'default'
                    }
                  />
                  <Badge
                    label={`${selectedTask.priority} priority`}
                    size="medium"
                    color={
                      selectedTask.priority === 'High' ? 'error' : selectedTask.priority === 'Medium' ? 'warning' : 'info'
                    }
                  />
                  <Badge label={selectedTask.type} size="medium" color="info" />
                  {sla && (
                    <span className={`tc-detail-sla-pill ${sla.className}`}>
                      <AccessTimeOutlined sx={{ fontSize: 11 }} /> {sla.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="tc-detail-body">
                {/* Description */}
                {selectedTask.description && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><DescriptionOutlined sx={{ fontSize: 12 }} /> Description</div>
                    <p className="tc-detail-desc">{selectedTask.description}</p>
                  </div>
                )}

                {/* Source badge (AI / Broadcast / etc.) */}
                {selectedTask.source && selectedTask.source !== 'Manual' && selectedTask.source !== 'Field Signal' && (
                  <div
                    className={`tc-detail-source-badge ${getSourceClass(selectedTask.source)}`}
                    onClick={() => selectedTask.sourceLink && navigate(selectedTask.sourceLink)}
                    style={{ cursor: selectedTask.sourceLink ? 'pointer' : 'default' }}
                  >
                    <div className="tc-detail-source-left">
                      {getSourceIcon(selectedTask.source)}
                      <span>Created from <strong>{selectedTask.source}</strong></span>
                    </div>
                    <div className="tc-detail-source-right">
                      {selectedTask.confidenceScore && (
                        <span className="tc-detail-source-conf">
                          <AutoAwesomeOutlined sx={{ fontSize: 10 }} /> {selectedTask.confidenceScore}% confidence
                        </span>
                      )}
                      {selectedTask.sourceLink && <OpenInNewOutlined sx={{ fontSize: 12 }} />}
                    </div>
                  </div>
                )}

                {/* POG Compliance info block — shown when task is POG-related */}
                {(selectedTask.type === 'POG Correction' || selectedTask.title?.toLowerCase().includes('pog') || selectedTask.description?.toLowerCase().includes('planogram')) && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label">
                      <GridOnOutlined sx={{ fontSize: 12 }}/> POG Compliance Context
                      <InfoOutlined sx={{ fontSize: 11, marginLeft: 4, color: '#7c3aed', opacity: 0.7 }}/>
                    </div>
                    <div className="tc-detail-pog-info">
                      <div className="tc-pog-info-row">
                        <div className="tc-pog-info-icon">
                          <GridOnOutlined sx={{ fontSize: 14 }}/>
                        </div>
                        <div className="tc-pog-info-body">
                          <p className="tc-pog-info-title">What is a POG Compliance Gap?</p>
                          <p className="tc-pog-info-desc">The shelf layout captured in the shelf audit does not match the active planogram. Products are in wrong positions, missing facings, or placed on incorrect fixtures.</p>
                        </div>
                      </div>
                      <div className="tc-pog-checklist">
                        {[
                          'Verify active planogram is current and applies to this store',
                          'Check product placement matches planogram fixture assignments',
                          'Confirm facing count meets minimum required',
                          'Ensure price tags and signage are correctly placed',
                          'Photograph corrected shelf as evidence of completion',
                        ].map((item, i) => (
                          <div key={i} className="tc-pog-check-item">
                            <InfoOutlined sx={{ fontSize: 12 }}/>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Field Signal back-link (premium provenance block) */}
                {selectedTask.source === 'Field Signal' && selectedTask.fieldSignalId && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><LinkOutlined sx={{ fontSize: 12 }} /> Source</div>
                    <button
                      type="button"
                      className="tc-signal-source-row"
                      onClick={() => navigate('/command-center/communications', {
                        state: { openFieldSignal: selectedTask.fieldSignalId }
                      })}
                    >
                      <div className="tc-signal-source-icon">
                        <SensorsOutlined sx={{ fontSize: 16 }} />
                      </div>
                      <div className="tc-signal-source-body">
                        <span className="tc-signal-source-label">Created from Field Signal</span>
                        <span className="tc-signal-source-id">{selectedTask.fieldSignalId}</span>
                      </div>
                      <OpenInNewOutlined sx={{ fontSize: 13 }} className="tc-signal-source-arrow" />
                    </button>
                  </div>
                )}

                {/* Assignment & Schedule (editable controls) */}
                <div className="tc-detail-block">
                  <div className="tc-detail-block-label"><PersonOutlined sx={{ fontSize: 12 }} /> Assignment & Schedule</div>
                  <div className="tc-detail-grid">
                    <div className="tc-detail-cell">
                      <span className="tc-detail-cell-label">Status</span>
                      <div className="tc-dd-wrap">
                        <button type="button" className={`tc-dd-trigger${!!ddAnchors['detail-status'] ? ' tc-dd-trigger--open' : ''}`}
                          onClick={e => !!ddAnchors['detail-status'] ? closeDd('detail-status') : openDd('detail-status', e.currentTarget)}>
                          <span className="tc-dd-label">
                            {selectedTask.status}
                            <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron${!!ddAnchors['detail-status'] ? ' tc-dd-chevron--open' : ''}`}/>
                          </span>
                        </button>
                        <Menu
                          anchorEl={ddAnchors['detail-status']}
                          open={!!ddAnchors['detail-status']}
                          onClose={() => closeDd('detail-status')}
                          options={(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map(s => ({
                            label: s,
                            value: s,
                            onClick: () => {
                              updateTaskStatus(selectedTask.id, s);
                              setSelectedTask({ ...selectedTask, status: s });
                              closeDd('detail-status');
                            },
                          }))}
                        />
                      </div>
                    </div>
                    <div className="tc-detail-cell">
                      <span className="tc-detail-cell-label">Owner</span>
                      <div className="tc-dd-wrap">
                        <button type="button" className={`tc-dd-trigger${!!ddAnchors['detail-owner'] ? ' tc-dd-trigger--open' : ''}`}
                          onClick={e => !!ddAnchors['detail-owner'] ? closeDd('detail-owner') : openDd('detail-owner', e.currentTarget)}>
                          <span className="tc-dd-label">
                            {selectedTask.assignedToName || 'Unassigned'}
                            <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron${!!ddAnchors['detail-owner'] ? ' tc-dd-chevron--open' : ''}`}/>
                          </span>
                        </button>
                        <Menu
                          anchorEl={ddAnchors['detail-owner']}
                          open={!!ddAnchors['detail-owner']}
                          onClose={() => closeDd('detail-owner')}
                          options={[
                            { label: 'Unassigned', value: '', onClick: () => closeDd('detail-owner') },
                            ...teamMembers.map(m => ({
                              label: `${m.name} — ${m.role}`,
                              value: m.id,
                              onClick: () => {
                                assignTask(selectedTask.id, m.id, m.name);
                                setSelectedTask({ ...selectedTask, assignedTo: m.id, assignedToName: m.name });
                                closeDd('detail-owner');
                              },
                            })),
                          ]}
                        />
                      </div>
                    </div>
                    <div className="tc-detail-cell">
                      <span className="tc-detail-cell-label">Due Date</span>
                      <span className={`tc-detail-cell-value ${isOverdue(selectedTask.dueDate, selectedTask.status) ? 'tc-due--overdue' : ''}`}>
                        <CalendarTodayOutlined sx={{ fontSize: 12 }} /> {formatDate(selectedTask.dueDate)}
                      </span>
                    </div>
                    <div className="tc-detail-cell">
                      <span className="tc-detail-cell-label">Created</span>
                      <span className="tc-detail-cell-value">
                        <AccessTimeOutlined sx={{ fontSize: 12 }} /> {formatDate(selectedTask.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Store & Context */}
                {(selectedTask.storeName || selectedTask.pogName) && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><StoreOutlined sx={{ fontSize: 12 }} /> Store & Context</div>
                    <div className="tc-detail-grid">
                      {selectedTask.storeName && (
                        <div className="tc-detail-cell">
                          <span className="tc-detail-cell-label">Store</span>
                          <span className="tc-detail-cell-value">{selectedTask.storeName}</span>
                        </div>
                      )}
                      {selectedTask.storeGroup && (
                        <div className="tc-detail-cell">
                          <span className="tc-detail-cell-label">Store Group</span>
                          <span className="tc-detail-cell-value">{selectedTask.storeGroup}</span>
                        </div>
                      )}
                      {selectedTask.pogName && (
                        <div className="tc-detail-cell">
                          <span className="tc-detail-cell-label">Planogram</span>
                          <span className="tc-detail-cell-value">{selectedTask.pogName}</span>
                        </div>
                      )}
                      {selectedTask.category && (
                        <div className="tc-detail-cell">
                          <span className="tc-detail-cell-label">Category</span>
                          <span className="tc-detail-cell-value">{selectedTask.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SLA breakdown (only if SLA exists) */}
                {selectedTask.slaHours && sla && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><AccessTimeOutlined sx={{ fontSize: 12 }} /> SLA Tracking</div>
                    <div className="tc-detail-sla-card">
                      <div className="tc-detail-sla-card-row">
                        <span className="tc-detail-sla-card-label">Target window</span>
                        <span className="tc-detail-sla-card-value">{selectedTask.slaHours} hours from creation</span>
                      </div>
                      <div className="tc-detail-sla-card-row">
                        <span className="tc-detail-sla-card-label">Status</span>
                        <span className={`tc-detail-sla-pill ${sla.className}`}>{sla.label}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detection Summary — alert-driven tasks only */}
                {selectedTask.alertType && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><TrackChangesOutlined sx={{ fontSize: 12 }} /> Detection Summary</div>
                    <div className="tc-detection-summary">
                      <div className="tc-detection-type-row">
                        <span className={`tc-alert-type-badge tc-alert-type-badge--${selectedTask.alertType.toLowerCase().replace(/[\s-]+/g, '-')}`}>
                          {selectedTask.alertType}
                        </span>
                        {selectedTask.confidenceScore !== undefined && (
                          <span className="tc-confidence-pill">
                            <AutoAwesomeOutlined sx={{ fontSize: 10 }} />
                            {selectedTask.confidenceScore}% confidence
                          </span>
                        )}
                      </div>
                      {selectedTask.detectionMethod && (
                        <p className="tc-detection-method">{selectedTask.detectionMethod}</p>
                      )}
                      <div className="tc-detection-meta-row">
                        {selectedTask.affectedSkuCount !== undefined && (
                          <div className="tc-detection-meta-item">
                            <span className="tc-detection-meta-label">Affected SKUs</span>
                            <span className="tc-detection-meta-value">{selectedTask.affectedSkuCount}</span>
                          </div>
                        )}
                        {selectedTask.estimatedMinutes !== undefined && (
                          <div className="tc-detection-meta-item">
                            <span className="tc-detection-meta-label">Est. resolution</span>
                            <span className="tc-detection-meta-value">{selectedTask.estimatedMinutes} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Severity Rationale */}
                {selectedTask.severityRationale && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><SecurityOutlined sx={{ fontSize: 12 }} /> Why This Was Flagged</div>
                    <div className="tc-detail-rationale">
                      {selectedTask.severityRationale}
                    </div>
                    {selectedTask.impact && (
                      <div className="tc-detail-impact">
                        <span className="tc-detail-impact-label">Estimated impact</span>
                        <span className="tc-detail-impact-value">{selectedTask.impact}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Resolution Checklist */}
                {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><ChecklistOutlined sx={{ fontSize: 12 }} /> Resolution Steps</div>
                    <div className="tc-resolution-checklist">
                      {selectedTask.checklist.map((item, i) => (
                        <div key={i} className={`tc-checklist-item${item.done ? ' tc-checklist-item--done' : ''}`}>
                          <div className="tc-checklist-num">{i + 1}</div>
                          <span className="tc-checklist-text">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Before / After Proof */}
                {(selectedTask.beforeImage || selectedTask.afterImage) && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><ImageOutlined sx={{ fontSize: 12 }} /> Audit Evidence</div>
                    <div className="tc-detail-proof-grid">
                      {selectedTask.beforeImage && (
                        <div className="tc-detail-proof-item">
                          <div className="tc-detail-proof-label">Before</div>
                          <div className="tc-detail-proof-placeholder">
                            <ImageOutlined sx={{ fontSize: 22 }} />
                            <span>Shelf photo captured</span>
                            <span className="tc-detail-proof-file">{selectedTask.beforeImage.split('/').pop()}</span>
                          </div>
                        </div>
                      )}
                      {selectedTask.afterImage && (
                        <div className="tc-detail-proof-item">
                          <div className="tc-detail-proof-label after">After</div>
                          <div className="tc-detail-proof-placeholder">
                            <ImageOutlined sx={{ fontSize: 22 }} />
                            <span>Expected layout</span>
                            <span className="tc-detail-proof-file">{selectedTask.afterImage.split('/').pop()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Panel>
    </div>
  );
};

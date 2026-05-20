import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
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
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Check from '@mui/icons-material/Check';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import SensorsOutlined from '@mui/icons-material/SensorsOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import RemoveOutlined from '@mui/icons-material/RemoveOutlined';
import OpenWithOutlined from '@mui/icons-material/OpenWithOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card, Tabs } from 'impact-ui';
import { useExecutionTasks, ExecutionTask, TaskStatus, Priority } from '../context/ExecutionTasksContext';
import { useToast } from '../context/ToastContext';
import './TaskCenter.css';

// ── Seed tasks so the Operations Queue isn't empty ──
const seedTasks: ExecutionTask[] = [
  {
    id: 'tc-seed-1',
    type: 'Reset Shelf',
    title: 'C&A Accessories Endcap — Compliance Reset Required',
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
    pogName: 'C&A Accessories Endcap v2.1',
    category: 'Accessories',
    createdAt: '2026-04-23T08:30:00Z',
    localizationId: 'loc-acc-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram-intelligence/pog-localization-engine',
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
    sourceLink: '/planogram-intelligence/pog-localization-engine',
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
    sourceLink: '/planogram-intelligence/pog-localization-engine',
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
    pogName: 'C&A Accessories Endcap v2.1',
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
    pogName: 'C&A Accessories Endcap v2.1',
    category: 'Accessories',
    createdAt: '2026-04-21T14:00:00Z',
    localizationId: 'loc-acc-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram-intelligence/pog-localization-engine',
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
    pogName: 'C&A Accessories Endcap v2.1',
    category: 'Accessories',
    createdAt: '2026-04-21T14:30:00Z',
    localizationId: 'loc-acc-01',
    source: 'AI POG Audit',
    sourceLink: '/planogram-intelligence/pog-localization-engine',
    slaHours: 48,
    severityRationale: 'Hair accessories showing 4 facings vs required 6 per planogram — 33% facing gap reducing category visibility.',
    confidenceScore: 92,
    beforeImage: '/audit-evidence/hair-acc-before.jpg',
    afterImage: '/audit-evidence/hair-acc-after.jpg',
  },
  // Broadcast-linked tasks
  {
    id: 'tc-bc-001-1',
    type: 'Reset Shelf',
    title: '[RECALL] Remove Organic Baby Lotion Batch #7742 from shelf',
    description: 'Remove all units of Organic Baby Lotion Batch #7742 from sales floor shelves. Check all aisle locations and endcaps.',
    priority: 'High',
    reason: 'Product Recall — Compliance Office directive',
    impact: 'Regulatory compliance — immediate action required',
    status: 'Pending',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    dueDate: '2026-04-24',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Health & Beauty Aisle v1.2',
    category: 'Health & Beauty',
    createdAt: '2026-04-24T10:00:00Z',
    localizationId: 'bc-001',
    source: 'Broadcast',
    slaHours: 4,
    severityRationale: 'Product Recall — regulatory compliance requires immediate removal from all customer-accessible areas.',
  },
  {
    id: 'tc-bc-001-2',
    type: 'Move',
    title: '[RECALL] Remove Organic Baby Lotion Batch #7742 from backroom',
    description: 'Locate and quarantine all backroom inventory of Organic Baby Lotion Batch #7742. Tag for return shipment.',
    priority: 'High',
    reason: 'Product Recall — Compliance Office directive',
    impact: 'Regulatory compliance — immediate action required',
    status: 'Pending',
    assignedTo: 'user-3',
    assignedToName: 'Mike Chen',
    dueDate: '2026-04-24',
    storeName: 'Downtown Plaza #2034',
    storeGroup: 'Urban Flagship Cluster',
    pogName: 'Health & Beauty Aisle v1.2',
    category: 'Health & Beauty',
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
    pogName: 'Health & Beauty Aisle v1.2',
    category: 'Health & Beauty',
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

// ── Portal Dropdown — escapes modal overflow:hidden, viewport-aware ──
interface PortalDropdownMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number;
}

const PortalDropdownMenu: React.FC<PortalDropdownMenuProps> = ({
  anchorEl, open, onClose, children, maxHeight = 256,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed', visibility: 'hidden', zIndex: 9999,
  });

  // Recalculate position every time open/anchorEl changes, and on scroll/resize
  const reposition = useCallback(() => {
    if (!open || !anchorEl || !menuRef.current) return;
    const anchor = anchorEl.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const vp = { w: window.innerWidth, h: window.innerHeight };
    const MARGIN = 6;

    const spaceBelow = vp.h - anchor.bottom - MARGIN;
    const spaceAbove = anchor.top - MARGIN;
    const menuH = Math.min(menu.height || maxHeight, maxHeight);

    const flipUp = spaceBelow < menuH && spaceAbove > spaceBelow;
    const top = flipUp
      ? anchor.top - menuH - MARGIN
      : anchor.bottom + MARGIN;

    // Clamp left so it never goes off-screen right edge
    const left = Math.min(anchor.left, vp.w - anchor.width - 8);

    setStyle({
      position: 'fixed',
      top,
      left,
      width: anchor.width,
      maxHeight,
      zIndex: 9999,
      visibility: 'visible',
    });
  }, [open, anchorEl, maxHeight]);

  useEffect(() => {
    if (!open) {
      setStyle(s => ({ ...s, visibility: 'hidden' }));
      return;
    }
    // Two-step: first paint hidden to measure, then position
    setStyle({ position: 'fixed', visibility: 'hidden', zIndex: 9999 });
    const id = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(id);
  }, [open, reposition]);

  // Keep position fresh on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => reposition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, reposition]);

  // Click-outside closes (preserving existing behavior)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        anchorEl?.contains(e.target as Node)
      ) return;
      onClose();
    };
    // Small delay so the trigger's own onClick doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div ref={menuRef} className="tc-dd-menu tc-dd-portal" style={style}>
      <div className="tc-dd-portal-inner">
        {children}
      </div>
    </div>,
    document.body,
  );
};

// ── Portal-aware dropdown trigger wrapper ──
interface PortalDropdownProps {
  id: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: number;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  id, open, onToggle, onClose, trigger, children, maxHeight,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="tc-dd-wrap">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`tc-dd-trigger${open ? ' tc-dd-trigger--open' : ''}`}
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {trigger}
      </button>
      <PortalDropdownMenu
        anchorEl={triggerRef.current}
        open={open}
        onClose={onClose}
        maxHeight={maxHeight}
      >
        {children}
      </PortalDropdownMenu>
    </div>
  );
};

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

  // Custom dropdown state for Create Task modal
  const [openDropdown, setOpenDropdown] = useState<null | 'priority' | 'type' | 'assignee'>(null);

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
          category: payload.alertId === 'alert-inventory' ? 'Inventory' : 'Operations',
          createdAt,
          localizationId: `alert-${payload.alertId || 'gen'}-${idx}`,
          source: 'Manual',
          slaHours: priority === 'High' ? 24 : 48,
          severityRationale: s.detail,
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
    return null;
  };

  const getSourceClass = (source?: string) => {
    if (source === 'AI POG Audit' || source === 'Localization Engine') return 'tc-source--ai';
    if (source === 'Broadcast') return 'tc-source--broadcast';
    if (source === 'Field Signal') return 'tc-source--signal';
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
          <div className="page-loading-spinner" />
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
            <div className="tc-prefill-spinner" />
            <div className="tc-prefill-title">Creating tasks in Operations Queue…</div>
            <div className="tc-prefill-sub">Generating one task per impacted store and assigning to the respective Store Manager.</div>
          </Card>
        </div>
      )}

      {prefillBanner && !prefillLoading && (
        <div className="tc-prefill-banner">
          <div className="tc-prefill-banner-icon"><TaskAltOutlined sx={{ fontSize: 16 }} /></div>
          <div className="tc-prefill-banner-body">
            <div className="tc-prefill-banner-title">{prefillBanner.count} tasks created from "{prefillBanner.title}"</div>
            <div className="tc-prefill-banner-sub">Auto-assigned to {prefillBanner.managers.join(', ')}</div>
          </div>
          <Button
            variant="text"
            size="small"
            className="tc-prefill-banner-close"
            onClick={() => setPrefillBanner(null)}
            aria-label="Dismiss"
          >
            <CloseOutlined sx={{ fontSize: 14 }} />
          </Button>
        </div>
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
          <SearchOutlined sx={{ fontSize: 15 }} />
          <input
            placeholder="Search tasks, assignees, stores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <Button
              variant="text"
              size="small"
              className="tc-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <CloseOutlined sx={{ fontSize: 13 }} />
            </Button>
          )}
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
                  <textarea
                    placeholder="Add context, instructions, or notes for the assignee..."
                    value={newTask.description}
                    onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
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
                    <PortalDropdown
                      id="dd-priority"
                      open={openDropdown === 'priority'}
                      onToggle={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                      onClose={() => setOpenDropdown(null)}
                      maxHeight={180}
                      trigger={<>
                        <span className={`tc-dd-pri-dot tc-dd-pri-dot--${newTask.priority.toLowerCase()}`} />
                        <span className="tc-dd-trigger-text">{newTask.priority}</span>
                        <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron ${openDropdown === 'priority' ? 'tc-dd-chevron--open' : ''}`} />
                      </>}
                    >
                      {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                        <button
                          key={p}
                          type="button"
                          role="option"
                          aria-selected={p === newTask.priority}
                          className={`tc-dd-item ${p === newTask.priority ? 'tc-dd-item--active' : ''}`}
                          onClick={() => { setNewTask(prev => ({ ...prev, priority: p })); setOpenDropdown(null); }}
                        >
                          <span className="tc-dd-item-left">
                            <span className={`tc-dd-pri-badge tc-dd-pri-badge--${p.toLowerCase()}`}>{p[0]}</span>
                            <span className="tc-dd-item-text">
                              <span className="tc-dd-item-name">{p}</span>
                              <span className="tc-dd-item-desc">{PRIORITY_META[p].desc}</span>
                            </span>
                          </span>
                          {p === newTask.priority && <Check sx={{ fontSize: 14 }} />}
                        </button>
                      ))}
                    </PortalDropdown>
                  </div>

                  {/* Type */}
                  <div className="tc-m-field">
                    <label>Type</label>
                    {(() => {
                      const activeType = TYPE_OPTIONS.find(o => o.key === newTask.type);
                      const TypeIcon = activeType?.Icon ?? BuildOutlined;
                      return (
                        <PortalDropdown
                          id="dd-type"
                          open={openDropdown === 'type'}
                          onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                          onClose={() => setOpenDropdown(null)}
                          maxHeight={296}
                          trigger={<>
                            <TypeIcon sx={{ fontSize: 14 }} className="tc-dd-icon-muted" />
                            <span className="tc-dd-trigger-text">{activeType?.label ?? newTask.type}</span>
                            <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron ${openDropdown === 'type' ? 'tc-dd-chevron--open' : ''}`} />
                          </>}
                        >
                          {TYPE_OPTIONS.map(({ key, label, desc, Icon }) => (
                            <button
                              key={key}
                              type="button"
                              role="option"
                              aria-selected={key === newTask.type}
                              className={`tc-dd-item ${key === newTask.type ? 'tc-dd-item--active' : ''}`}
                              onClick={() => { setNewTask(prev => ({ ...prev, type: key })); setOpenDropdown(null); }}
                            >
                              <span className="tc-dd-item-left">
                                <span className="tc-dd-type-badge"><Icon sx={{ fontSize: 13 }} /></span>
                                <span className="tc-dd-item-text">
                                  <span className="tc-dd-item-name">{label}</span>
                                  <span className="tc-dd-item-desc">{desc}</span>
                                </span>
                              </span>
                              {key === newTask.type && <Check sx={{ fontSize: 14 }} />}
                            </button>
                          ))}
                        </PortalDropdown>
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
                    <PortalDropdown
                      id="dd-assignee"
                      open={openDropdown === 'assignee'}
                      onToggle={() => setOpenDropdown(openDropdown === 'assignee' ? null : 'assignee')}
                      onClose={() => setOpenDropdown(null)}
                      maxHeight={256}
                      trigger={<>
                        {newTask.assignedTo ? (
                          <>
                            <span className="tc-dd-avatar">
                              {(teamMembers.find(m => m.id === newTask.assignedTo)?.name || '')
                                .split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                            <span className="tc-dd-trigger-text">
                              {teamMembers.find(m => m.id === newTask.assignedTo)?.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <PersonOutlined sx={{ fontSize: 14 }} className="tc-dd-icon-muted" />
                            <span className="tc-dd-trigger-text tc-dd-trigger-text--placeholder">Select assignee...</span>
                          </>
                        )}
                        <KeyboardArrowDown sx={{ fontSize: 14 }} className={`tc-dd-chevron ${openDropdown === 'assignee' ? 'tc-dd-chevron--open' : ''}`} />
                      </>}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={!newTask.assignedTo}
                        className={`tc-dd-item ${!newTask.assignedTo ? 'tc-dd-item--active' : ''}`}
                        onClick={() => { setNewTask(prev => ({ ...prev, assignedTo: '' })); setOpenDropdown(null); }}
                      >
                        <span className="tc-dd-item-left">
                          <span className="tc-dd-avatar tc-dd-avatar--unassigned"><PersonOutlined sx={{ fontSize: 11 }} /></span>
                          <span className="tc-dd-item-name">Unassigned</span>
                        </span>
                        {!newTask.assignedTo && <Check sx={{ fontSize: 14 }} />}
                      </button>
                      {teamMembers.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          role="option"
                          aria-selected={m.id === newTask.assignedTo}
                          className={`tc-dd-item ${m.id === newTask.assignedTo ? 'tc-dd-item--active' : ''}`}
                          onClick={() => { setNewTask(prev => ({ ...prev, assignedTo: m.id })); setOpenDropdown(null); }}
                        >
                          <span className="tc-dd-item-left">
                            <span className="tc-dd-avatar">{m.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                            <span className="tc-dd-item-text">
                              <span className="tc-dd-item-name">{m.name}</span>
                              <span className="tc-dd-item-desc">{m.role}</span>
                            </span>
                          </span>
                          {m.id === newTask.assignedTo && <Check sx={{ fontSize: 14 }} />}
                        </button>
                      ))}
                    </PortalDropdown>
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
      {selectedTask && (() => {
        const sla = getSlaStatus(selectedTask);
        const statusKey = selectedTask.status === 'Pending' ? 'pending' : selectedTask.status === 'In Progress' ? 'inprogress' : 'completed';
        return (
          <div className="tc-detail-overlay" onClick={() => setSelectedTask(null)}>
            <div className="tc-detail" onClick={e => e.stopPropagation()}>
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
                      <select
                        className="tc-detail-input-select"
                        value={selectedTask.status}
                        onChange={e => {
                          updateTaskStatus(selectedTask.id, e.target.value as TaskStatus);
                          setSelectedTask({ ...selectedTask, status: e.target.value as TaskStatus });
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="tc-detail-cell">
                      <span className="tc-detail-cell-label">Owner</span>
                      <select
                        className="tc-detail-input-select"
                        value={selectedTask.assignedTo || ''}
                        onChange={e => {
                          const member = teamMembers.find(m => m.id === e.target.value);
                          if (member) {
                            assignTask(selectedTask.id, member.id, member.name);
                            setSelectedTask({ ...selectedTask, assignedTo: member.id, assignedToName: member.name });
                          }
                        }}
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                        ))}
                      </select>
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
                    <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '12px 14px' }}>
                      <div className="tc-detail-sla-card-row">
                        <span className="tc-detail-sla-card-label">Target window</span>
                        <span className="tc-detail-sla-card-value">{selectedTask.slaHours} hours from creation</span>
                      </div>
                      <div className="tc-detail-sla-card-row">
                        <span className="tc-detail-sla-card-label">Status</span>
                        <span className={`tc-detail-sla-pill ${sla.className}`}>{sla.label}</span>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Severity Rationale */}
                {selectedTask.severityRationale && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><SecurityOutlined sx={{ fontSize: 12 }} /> Severity Rationale</div>
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

                {/* Before / After Proof */}
                {(selectedTask.beforeImage || selectedTask.afterImage) && (
                  <div className="tc-detail-block">
                    <div className="tc-detail-block-label"><ImageOutlined sx={{ fontSize: 12 }} /> Audit Evidence</div>
                    <div className="tc-detail-proof-grid">
                      {selectedTask.beforeImage && (
                        <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
                          <div className="tc-detail-proof-label">Before</div>
                          <div className="tc-detail-proof-placeholder">
                            <ImageOutlined sx={{ fontSize: 22 }} />
                            <span>Shelf photo captured</span>
                            <span className="tc-detail-proof-file">{selectedTask.beforeImage.split('/').pop()}</span>
                          </div>
                        </Card>
                      )}
                      {selectedTask.afterImage && (
                        <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
                          <div className="tc-detail-proof-label after">After</div>
                          <div className="tc-detail-proof-placeholder">
                            <ImageOutlined sx={{ fontSize: 22 }} />
                            <span>Expected layout</span>
                            <span className="tc-detail-proof-file">{selectedTask.afterImage.split('/').pop()}</span>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import MoreVert from '@mui/icons-material/MoreVert';
import SentimentSatisfiedOutlined from '@mui/icons-material/SentimentSatisfiedOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import Check from '@mui/icons-material/Check';
import DoneAll from '@mui/icons-material/DoneAll';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import ChatOutlined from '@mui/icons-material/ChatOutlined';
import Add from '@mui/icons-material/Add';
import TagOutlined from '@mui/icons-material/TagOutlined';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import SensorsOutlined from '@mui/icons-material/SensorsOutlined';
import { Button, Chips, Badge, EmptyState } from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { openAskAlan } from '../utils/openAskAlan';
import type { FieldSignal, LogSignalFormState } from '../types/fieldSignal';
import { EMPTY_LOG_SIGNAL_FORM } from '../types/fieldSignal';
import { MOCK_FIELD_SIGNALS, FIELD_SIGNAL_NOTIFY_CONTACTS, STORE_OPTIONS, DISTRICT_OPTIONS } from '../constants/fieldSignals';
import {
  LogFieldSignalDrawer,
  FieldSignalChatCard,
  ActiveSignalsPill,
  FieldSignalDetailDrawer,
  FieldSignalSidebarList,
  FieldSignalMainPanel,
  EMPTY_FS_FILTERS,
  type FieldSignalFilters,
  canExportFieldSignals,
  canReviewFieldSignals,
  filterSignalsForRole,
  getActiveSignalsForThread,
} from '../components/fieldSignals/FieldSignalsUI';
import './MessageCenter.css';

// ── Types ──
type ChatType = 'direct' | 'group' | 'broadcast';
type MessageStatus = 'sent' | 'delivered' | 'read';
type Tab = 'all' | 'direct' | 'groups' | 'broadcast' | 'unread';
type CommSection = 'messages' | 'broadcasts' | 'field_signals';
type UserRole = 'ADMIN' | 'DM' | 'SM' | 'HQ' | 'OPS' | 'LP' | 'INV' | 'POG';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  role: string;
  roleCode: UserRole;
  store?: string;
  online: boolean;
  lastSeen?: string;
}

interface MessageContext {
  label: string;
  route: string;
  kind: 'pog' | 'task' | 'localization' | 'audit' | 'broadcast' | 'store';
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  replyTo?: string;
  imageUrl?: string;
  context?: MessageContext;
  fieldSignalId?: string;
}

interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatar: string;
  participants: Contact[];
  messages: Message[];
  unread: number;
  pinned: boolean;
  lastActivity: Date;
  description?: string;
  // broadcast-specific: IDs of people who received individual copies
  broadcastRecipientIds?: string[];
}

// ── Mock Data ──
const contacts: Contact[] = [
  { id: 'u1', name: 'Sarah Chen',     avatar: 'SC', role: 'District Manager',       roleCode: 'DM',    online: true },
  { id: 'u2', name: 'Mike Rodriguez', avatar: 'MR', role: 'Regional VP',            roleCode: 'HQ',    online: false, lastSeen: '2h ago' },
  { id: 'u3', name: 'Emily Parker',   avatar: 'EP', role: 'Store Associate',        roleCode: 'SM',    store: 'Store #2341 - Nashville', online: true },
  { id: 'u4', name: 'David Kim',      avatar: 'DK', role: 'Loss Prevention',        roleCode: 'LP',    online: false, lastSeen: '30m ago' },
  { id: 'u5', name: 'Lisa Thompson',  avatar: 'LT', role: 'Inventory Lead',         roleCode: 'INV',   store: 'Store #2341 - Nashville', online: true },
  { id: 'u6', name: 'James Wilson',   avatar: 'JW', role: 'Store Manager',          roleCode: 'SM',    store: 'Store #1142 - Memphis',   online: false, lastSeen: '1h ago' },
  { id: 'u7', name: 'Anna Martinez',  avatar: 'AM', role: 'POG Specialist',         roleCode: 'POG',   online: true },
  { id: 'u8', name: 'Robert Chang',   avatar: 'RC', role: 'Operations Director',    roleCode: 'OPS',   online: true },
  { id: 'u9', name: 'Clarke T',       avatar: 'CT', role: 'Platform Administrator', roleCode: 'ADMIN', online: true },
];

/** Portal-positioned create menu — Impact UI tokens, avoids sidebar overflow clipping */
const McHeaderAddPortalMenu: React.FC<{
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ anchorEl, open, onClose, children }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed', visibility: 'hidden', zIndex: 1400,
  });

  const reposition = useCallback(() => {
    if (!open || !anchorEl || !menuRef.current) return;
    const anchor = anchorEl.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const MARGIN = 8;
    const top = anchor.bottom + MARGIN;
    const left = Math.max(8, anchor.right - (menu.width || 280));
    setStyle({
      position: 'fixed',
      top,
      left,
      zIndex: 1400,
      visibility: 'visible',
    });
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) {
      setStyle(s => ({ ...s, visibility: 'hidden' }));
      return;
    }
    setStyle({ position: 'fixed', visibility: 'hidden', zIndex: 1400 });
    const id = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(id);
  }, [open, reposition]);

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

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        anchorEl?.contains(e.target as Node)
      ) return;
      onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="mc-add-menu-portal"
      style={style}
      onMouseDown={e => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
};

const ROLE_BADGE: Record<UserRole, { label: string; cls: string }> = {
  ADMIN: { label: 'Admin', cls: 'mc-role--admin' },
  DM:    { label: 'DM',    cls: 'mc-role--dm' },
  SM:    { label: 'SM',    cls: 'mc-role--sm' },
  HQ:    { label: 'HQ',    cls: 'mc-role--hq' },
  OPS:   { label: 'Ops',   cls: 'mc-role--ops' },
  LP:    { label: 'LP',    cls: 'mc-role--lp' },
  INV:   { label: 'Inv',   cls: 'mc-role--inv' },
  POG:   { label: 'POG',   cls: 'mc-role--pog' },
};

const roleBadgeColor = (role: UserRole): 'error' | 'warning' | 'info' | 'success' => {
  switch (role) {
    case 'ADMIN': case 'HQ':   return 'error';
    case 'DM':    case 'OPS':  return 'warning';
    case 'SM':    case 'INV':  return 'success';
    default:                   return 'info';
  }
};

const R = {
  district: '/store-operations/district-intelligence',
  storeDD:  '/store-operations/store-deep-dive',
  pog:      '/planogram/master-pog',
  pogRule:  '/planogram/rule-management',
  loc:      '/planogram/localization-engine',
  copilot:  '/command-center/ai-copilot',
  ops:      '/command-center/operations-queue',
};

const DM_CHATS: Chat[] = [
  // ── Pinned Field Signal thread — always at top ──
  {
    id: 'c-fs-pinned', type: 'group', name: 'Field Signals — District 14', avatar: 'FS',
    description: 'Live local demand signals and hyperlocal event alerts for District 14',
    participants: [contacts[0], contacts[2], contacts[5], contacts[4]], unread: 3, pinned: true,
    lastActivity: new Date(Date.now() - 2 * 60000),
    messages: [
      { id: 'fspm-1', senderId: 'u3', content: 'Just logged a new signal — Coldplay World Tour at Nissan Stadium next week. Two sold-out nights, 50k capacity each. Expect big casualwear and accessories demand around Downtown Plaza #2034.', timestamp: new Date(Date.now() - 60 * 60000), status: 'read', fieldSignalId: 'FS-2408' },
      { id: 'fspm-2', senderId: 'u6', content: 'Also flagging the Tennessee Titans autograph signing this Saturday at Store #2341. Already reviewed and a task is linked.', timestamp: new Date(Date.now() - 30 * 60000), status: 'read', fieldSignalId: 'FS-2409' },
      { id: 'fspm-3', senderId: 'u1', content: 'Both signals confirmed. FIFA group stage matches near #2341 next month too — please ensure Seasonal and Activewear sections are fully stocked before those windows.', timestamp: new Date(Date.now() - 10 * 60000), status: 'delivered', context: { label: 'View all Field Signals', route: '/command-center/communications', kind: 'task' } },
      { id: 'fspm-4', senderId: 'u5', content: 'On it. Inventory check for Activewear scheduled for tomorrow AM. Will log any gaps as a signal.', timestamp: new Date(Date.now() - 2 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'c1', type: 'direct', name: 'Sarah Chen', avatar: 'SC',
    participants: [contacts[0]], unread: 2, pinned: true,
    lastActivity: new Date(Date.now() - 5 * 60000),
    messages: [
      { id: 'm1', senderId: 'u1', content: 'Heads up — Ask Alan flagged 3 POG drift issues for Energy Drinks at Store #2341 this morning.', timestamp: new Date(Date.now() - 45 * 60000), status: 'read' },
      { id: 'm2', senderId: 'me', content: 'Saw it. I\'ve already pushed a Reset Shelf task to the Operations Queue.', timestamp: new Date(Date.now() - 40 * 60000), status: 'read', context: { label: 'Open Operations Queue', route: R.ops, kind: 'task' } },
      { id: 'm3', senderId: 'u1', content: 'Perfect. Loop in Anna if anything escalates — she owns the POG approvals this week.', timestamp: new Date(Date.now() - 30 * 60000), status: 'read' },
      { id: 'm5', senderId: 'u1', content: 'Also: District 14 compliance is back to 94%. Nashville drove most of the lift 📈', timestamp: new Date(Date.now() - 10 * 60000), status: 'delivered', context: { label: 'View District Intelligence', route: R.district, kind: 'audit' } },
      { id: 'm6', senderId: 'u1', content: 'Can you review the Energy Drinks POG audit before EOD?', timestamp: new Date(Date.now() - 5 * 60000), status: 'delivered', context: { label: 'Open in Ask Alan', route: R.copilot, kind: 'audit' } },
    ],
  },
  {
    id: 'c2', type: 'group', name: 'Store #2341 — Nashville', avatar: 'S2',
    description: 'Day-to-day ops for Store #2341 (Nashville)',
    participants: [contacts[0], contacts[2], contacts[4]], unread: 5, pinned: true,
    lastActivity: new Date(Date.now() - 12 * 60000),
    messages: [
      { id: 'm10', senderId: 'u3', content: 'Morning shift check-in: all sections covered ✅', timestamp: new Date(Date.now() - 120 * 60000), status: 'read' },
      { id: 'm11', senderId: 'u5', content: 'Inventory count for Dairy done. Need to reorder milk — down to 15 units.', timestamp: new Date(Date.now() - 90 * 60000), status: 'read' },
      { id: 'm12', senderId: 'me', content: 'Submitting the PO now. Logged it as a task too.', timestamp: new Date(Date.now() - 85 * 60000), status: 'read', context: { label: 'View task in Operations Queue', route: R.ops, kind: 'task' } },
      { id: 'm13', senderId: 'u3', content: 'POG drift on Aisle 7 endcap — facing count is off by 2. Re-shooting now.', timestamp: new Date(Date.now() - 30 * 60000), status: 'read', context: { label: 'Open in Ask Alan', route: R.copilot, kind: 'audit' } },
      { id: 'm14', senderId: 'u5', content: '@everyone Stockroom audit at 4 PM. Everyone needs to confirm by 3:30.', timestamp: new Date(Date.now() - 12 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'c3', type: 'broadcast', name: 'Regional Updates', avatar: 'RU',
    description: 'Official announcements from Regional HQ',
    participants: contacts, unread: 1, pinned: false,
    lastActivity: new Date(Date.now() - 60 * 60000),
    messages: [
      { id: 'm20', senderId: 'u2', content: 'Q2 Planogram Refresh — all stores must complete the Spring Reset by May 20.', timestamp: new Date(Date.now() - 180 * 60000), status: 'read', context: { label: 'Open Master POG Management', route: R.pog, kind: 'pog' } },
      { id: 'm21', senderId: 'u2', content: '🏆 Congrats to Store #2341, #1142, and #3021 for hitting 95%+ compliance this quarter.', timestamp: new Date(Date.now() - 60 * 60000), status: 'delivered', context: { label: 'View leaderboard', route: R.district, kind: 'audit' } },
    ],
  },
  {
    id: 'c4', type: 'direct', name: 'David Kim', avatar: 'DK',
    participants: [contacts[3]], unread: 0, pinned: false,
    lastActivity: new Date(Date.now() - 180 * 60000),
    messages: [
      { id: 'm30', senderId: 'u4', content: 'Weekly LP walkthrough done for Store #2341. Report uploaded.', timestamp: new Date(Date.now() - 240 * 60000), status: 'read' },
      { id: 'm31', senderId: 'me', content: 'Thanks David. Anything I should escalate?', timestamp: new Date(Date.now() - 200 * 60000), status: 'read' },
      { id: 'm32', senderId: 'u4', content: 'Camera 3 near the back exit needs adjustment. I logged a Fixture task.', timestamp: new Date(Date.now() - 180 * 60000), status: 'read', context: { label: 'View task in Operations Queue', route: R.ops, kind: 'task' } },
    ],
  },
  {
    id: 'c5', type: 'group', name: 'District 14 — Managers', avatar: 'D1',
    description: 'DM sync for District 14 (Tennessee)',
    participants: [contacts[0], contacts[5], contacts[7]], unread: 0, pinned: false,
    lastActivity: new Date(Date.now() - 300 * 60000),
    messages: [
      { id: 'm40', senderId: 'u1', content: 'Team — spring staffing schedule is up. Pls review by tomorrow.', timestamp: new Date(Date.now() - 360 * 60000), status: 'read' },
      { id: 'm41', senderId: 'u8', content: 'Reviewed. We need +20% coverage for Black Friday — mostly at #2341 and #1142.', timestamp: new Date(Date.now() - 320 * 60000), status: 'read', context: { label: 'View District Intelligence', route: R.district, kind: 'audit' } },
      { id: 'm42', senderId: 'u6', content: 'Memphis is good. We can absorb +15% without new hires — OT only.', timestamp: new Date(Date.now() - 300 * 60000), status: 'read' },
    ],
  },
  {
    id: 'c6', type: 'broadcast', name: 'Safety Alerts', avatar: 'SA',
    description: 'Critical safety and compliance alerts',
    participants: contacts, unread: 1, pinned: false,
    lastActivity: new Date(Date.now() - 30 * 60000),
    messages: [
      { id: 'm50', senderId: 'u8', content: '🔴 New fire safety protocol effective immediately. All fire exits must be inspected by EOW.', timestamp: new Date(Date.now() - 480 * 60000), status: 'read', context: { label: 'Open Operations Queue', route: R.ops, kind: 'task' } },
      { id: 'm51', senderId: 'u8', content: 'Mandatory safety training modules have been updated. All SMs must complete by EOM.', timestamp: new Date(Date.now() - 30 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'c-pog', type: 'group', name: 'POG Compliance — District 14', avatar: 'PC',
    description: 'Ask Alan audits, drift triage and POG approvals',
    participants: [contacts[0], contacts[6], contacts[1], contacts[7]], unread: 3, pinned: false,
    lastActivity: new Date(Date.now() - 22 * 60000),
    messages: [
      { id: 'mp1', senderId: 'u7', content: 'Pushed the Spring Refresh Beverage template to Localization Engine for Tennessee stores.', timestamp: new Date(Date.now() - 240 * 60000), status: 'read', context: { label: 'Open Localization Engine', route: R.loc, kind: 'localization' } },
      { id: 'mp2', senderId: 'u1', content: 'Nashville is approved. Memphis still has 2 SKUs failing the SLA rule — reviewing.', timestamp: new Date(Date.now() - 180 * 60000), status: 'read', context: { label: 'Open POG Rules', route: R.pogRule, kind: 'pog' } },
      { id: 'mp3', senderId: 'u7', content: 'Ask Alan just opened 4 new audits across Beverages — confidence 88–94%.', timestamp: new Date(Date.now() - 60 * 60000), status: 'delivered', context: { label: 'Triage in Ask Alan', route: R.copilot, kind: 'audit' } },
      { id: 'mp4', senderId: 'u1', content: 'Pinning this thread. Anna will own approvals through Friday.', timestamp: new Date(Date.now() - 22 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'c-loc', type: 'group', name: 'Localization Reviewers', avatar: 'LR',
    description: 'Final sign-off on localized POGs before publish',
    participants: [contacts[6], contacts[1], contacts[8]], unread: 1, pinned: false,
    lastActivity: new Date(Date.now() - 45 * 60000),
    messages: [
      { id: 'ml1', senderId: 'u7', content: 'Beverages — Tennessee variant is ready for review. 12 stores included.', timestamp: new Date(Date.now() - 90 * 60000), status: 'read', context: { label: 'Open in Localization Engine', route: R.loc, kind: 'localization' } },
      { id: 'ml2', senderId: 'u2', content: 'LGTM on assortment. One question on facing rules for #3021.', timestamp: new Date(Date.now() - 45 * 60000), status: 'delivered', context: { label: 'View POG Rules', route: R.pogRule, kind: 'pog' } },
    ],
  },
  {
    id: 'c8', type: 'broadcast', name: 'Operations — Spring Schedule', avatar: 'SS',
    description: 'Spring operations & scheduling updates',
    participants: contacts, unread: 1, pinned: true,
    lastActivity: new Date(Date.now() - 30 * 60000),
    messages: [
      { id: 'm70', senderId: 'u2', content: 'All stores will operate on modified hours during Dec 23–26. Confirm your team\'s availability by Friday.', timestamp: new Date(Date.now() - 30 * 60000), status: 'delivered', context: { label: 'View tasks in Operations Queue', route: R.ops, kind: 'task' } },
    ],
  },
  {
    id: 'c9', type: 'broadcast', name: 'Performance Highlights', avatar: 'PH',
    description: 'Quarterly performance updates and recognition',
    participants: contacts, unread: 1, pinned: false,
    lastActivity: new Date(Date.now() - 120 * 60000),
    messages: [
      { id: 'm80', senderId: 'u2', content: '🏆 Great start to Q2! District 14 hit 104% of April plan. Top performers will be recognized at the regional sync.', timestamp: new Date(Date.now() - 120 * 60000), status: 'delivered', context: { label: 'View leaderboard', route: R.district, kind: 'audit' } },
    ],
  },
  {
    id: 'c7', type: 'direct', name: 'Anna Martinez', avatar: 'AM',
    participants: [contacts[6]], unread: 0, pinned: false,
    lastActivity: new Date(Date.now() - 600 * 60000),
    messages: [
      { id: 'm60', senderId: 'u7', content: 'Aisle 5 planogram audit ready for sign-off — 91% match.', timestamp: new Date(Date.now() - 720 * 60000), status: 'read', context: { label: 'Open in Ask Alan', route: R.copilot, kind: 'audit' } },
      { id: 'm61', senderId: 'me', content: 'Looks great Anna — approving now.', timestamp: new Date(Date.now() - 600 * 60000), status: 'read' },
    ],
  },
];

// ── SM (Store Manager) chats — store-level operational conversations ──
const SM_CHATS: Chat[] = [
  {
    id: 'sm1', type: 'direct', name: 'John Doe', avatar: 'JD',
    participants: [{ id: 'u-dm', name: 'John Doe', avatar: 'JD', role: 'District Manager', roleCode: 'DM', online: true }],
    unread: 2, pinned: true, lastActivity: new Date(Date.now() - 8 * 60000),
    messages: [
      { id: 'sm-m1', senderId: 'u-dm', content: 'Marco, the spring POG refresh needs to be done by Friday. Nashville stores are falling behind.', timestamp: new Date(Date.now() - 90 * 60000), status: 'read', context: { label: 'Open Operations Queue', route: R.ops, kind: 'task' } },
      { id: 'sm-m2', senderId: 'me', content: 'Got it. Aisle 3 and 7 are done. Starting Beverages today — we had a delivery delay.', timestamp: new Date(Date.now() - 60 * 60000), status: 'read' },
      { id: 'sm-m3', senderId: 'u-dm', content: 'Keep me posted. Compliance is at 91% — we need to hold the line. Great job on the Dairy reset btw.', timestamp: new Date(Date.now() - 30 * 60000), status: 'delivered' },
      { id: 'sm-m4', senderId: 'u-dm', content: 'Can you also check the fire exit clearance? SEA flagged it yesterday.', timestamp: new Date(Date.now() - 8 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'sm2', type: 'group', name: 'Store #2034 — Team', avatar: 'ST',
    description: 'Downtown Plaza #2034 daily operations',
    participants: [
      { id: 'u-assoc1', name: 'Emily Parker', avatar: 'EP', role: 'Store Associate', roleCode: 'SM', online: true },
      { id: 'u-inv', name: 'Lisa Thompson', avatar: 'LT', role: 'Inventory Lead', roleCode: 'INV', store: 'Store #2034', online: true },
      { id: 'u-assoc2', name: 'Chris Adams', avatar: 'CA', role: 'Store Associate', roleCode: 'SM', online: false, lastSeen: '45m ago' },
    ],
    unread: 3, pinned: true, lastActivity: new Date(Date.now() - 15 * 60000),
    messages: [
      { id: 'sm-t1', senderId: 'me', content: 'Morning team. Focus areas today: finish Beverage aisle reset and prep for the inventory count at 2 PM.', timestamp: new Date(Date.now() - 180 * 60000), status: 'read' },
      { id: 'sm-t2', senderId: 'u-assoc1', content: 'On it! Endcap is already done. Starting cooler section now ✅', timestamp: new Date(Date.now() - 120 * 60000), status: 'read' },
      { id: 'sm-t3', senderId: 'u-inv', content: 'Heads up — we\'re low on Sparkling Water (12 units). Re-order submitted.', timestamp: new Date(Date.now() - 60 * 60000), status: 'read', context: { label: 'View task in Operations Queue', route: R.ops, kind: 'task' } },
      { id: 'sm-t4', senderId: 'u-assoc2', content: 'Fire exit area cleared. Photo uploaded to the audit.', timestamp: new Date(Date.now() - 15 * 60000), status: 'delivered', context: { label: 'Open in Ask Alan', route: R.copilot, kind: 'audit' } },
    ],
  },
  {
    id: 'sm3', type: 'direct', name: 'Lisa Thompson', avatar: 'LT',
    participants: [{ id: 'u-inv', name: 'Lisa Thompson', avatar: 'LT', role: 'Inventory Lead', roleCode: 'INV', store: 'Store #2034', online: true }],
    unread: 1, pinned: false, lastActivity: new Date(Date.now() - 45 * 60000),
    messages: [
      { id: 'sm-l1', senderId: 'u-inv', content: 'Dairy cooler temp was 39°F at 8 AM — within range but borderline. Monitoring.', timestamp: new Date(Date.now() - 120 * 60000), status: 'read' },
      { id: 'sm-l2', senderId: 'me', content: 'Thanks Lisa. Log it and let me know if it drifts above 40°F — we\'ll need to call maintenance.', timestamp: new Date(Date.now() - 90 * 60000), status: 'read' },
      { id: 'sm-l3', senderId: 'u-inv', content: 'Inventory count done for Snacks section: 98% accuracy. Two SKUs need reconciliation.', timestamp: new Date(Date.now() - 45 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'sm4', type: 'direct', name: 'David Kim', avatar: 'DK',
    participants: [contacts[3]], unread: 0, pinned: false, lastActivity: new Date(Date.now() - 200 * 60000),
    messages: [
      { id: 'sm-d1', senderId: 'u4', content: 'LP walkthrough done. Everything looks good. One minor item — Camera 2 angle in stockroom needs adjustment.', timestamp: new Date(Date.now() - 300 * 60000), status: 'read' },
      { id: 'sm-d2', senderId: 'me', content: 'I\'ll put in a maintenance request. Thanks for the heads up David.', timestamp: new Date(Date.now() - 200 * 60000), status: 'read' },
    ],
  },
  {
    id: 'sm5', type: 'broadcast', name: 'Safety Alerts', avatar: 'SA',
    description: 'Critical safety and compliance alerts',
    participants: contacts, unread: 1, pinned: false, lastActivity: new Date(Date.now() - 30 * 60000),
    messages: [
      { id: 'sm-sa1', senderId: 'u8', content: '🔴 New fire safety protocol effective immediately. All fire exits must be inspected by EOW.', timestamp: new Date(Date.now() - 480 * 60000), status: 'read', context: { label: 'Open Operations Queue', route: R.ops, kind: 'task' } },
      { id: 'sm-sa2', senderId: 'u8', content: 'Mandatory safety training modules have been updated. All SMs must complete by EOM.', timestamp: new Date(Date.now() - 30 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'sm6', type: 'broadcast', name: 'Regional Updates', avatar: 'RU',
    description: 'Official announcements from Regional HQ',
    participants: contacts, unread: 1, pinned: false, lastActivity: new Date(Date.now() - 60 * 60000),
    messages: [
      { id: 'sm-ru1', senderId: 'u2', content: 'Q2 Planogram Refresh — all stores must complete the Spring Reset by May 20.', timestamp: new Date(Date.now() - 180 * 60000), status: 'read', context: { label: 'View task in Operations Queue', route: R.ops, kind: 'task' } },
      { id: 'sm-ru2', senderId: 'u2', content: '🏆 Congrats to Store #2034, #1142, and #2341 for hitting 95%+ compliance this quarter.', timestamp: new Date(Date.now() - 60 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'sm7', type: 'broadcast', name: 'Operations — Spring Schedule', avatar: 'SS',
    description: 'Spring operations & scheduling updates',
    participants: contacts, unread: 1, pinned: true, lastActivity: new Date(Date.now() - 30 * 60000),
    messages: [
      { id: 'sm-ss1', senderId: 'u2', content: 'Modified store hours for Memorial Day weekend. Confirm your team\'s availability by Friday.', timestamp: new Date(Date.now() - 30 * 60000), status: 'delivered', context: { label: 'View tasks in Operations Queue', route: R.ops, kind: 'task' } },
    ],
  },
];

// ── HQ (Merchandising) chats — network-wide, strategic conversations ──
const HQ_CHATS: Chat[] = [
  {
    id: 'hq1', type: 'direct', name: 'John Doe', avatar: 'JD',
    participants: [{ id: 'u-dm14', name: 'John Doe', avatar: 'JD', role: 'District Manager — Tennessee', roleCode: 'DM', online: true }],
    unread: 2, pinned: true, lastActivity: new Date(Date.now() - 10 * 60000),
    messages: [
      { id: 'hq-j1', senderId: 'me', content: 'John, District 14\'s spring POG refresh is tracking well. 6 of 8 stores at 90%+ compliance.', timestamp: new Date(Date.now() - 90 * 60000), status: 'read' },
      { id: 'hq-j2', senderId: 'u-dm14', content: 'Thanks Elena. Johnson City Mall is lagging — fixture delivery was delayed. ETA tomorrow.', timestamp: new Date(Date.now() - 60 * 60000), status: 'read' },
      { id: 'hq-j3', senderId: 'me', content: 'Noted. The Beverage End Cap template has been updated in the Localization Engine. Please review.', timestamp: new Date(Date.now() - 30 * 60000), status: 'read', context: { label: 'Open Localization Engine', route: R.loc, kind: 'localization' } },
      { id: 'hq-j4', senderId: 'u-dm14', content: 'Reviewed and approved for Tennessee. Memphis and Nashville stores look good.', timestamp: new Date(Date.now() - 10 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'hq2', type: 'group', name: 'POG Compliance — All Districts', avatar: 'PC',
    description: 'Cross-district POG compliance tracking and triage',
    participants: [
      { id: 'u-dm14', name: 'John Doe', avatar: 'JD', role: 'DM — Tennessee', roleCode: 'DM', online: true },
      { id: 'u-dm22', name: 'Marcus Reed', avatar: 'MR', role: 'DM — Carolina', roleCode: 'DM', online: false, lastSeen: '1h ago' },
      { id: 'u-dm19', name: 'Patricia Wells', avatar: 'PW', role: 'DM — Alabama', roleCode: 'DM', online: true },
      contacts[6],
    ],
    unread: 4, pinned: true, lastActivity: new Date(Date.now() - 20 * 60000),
    messages: [
      { id: 'hq-pc1', senderId: 'me', content: 'Q2 POG refresh status: Tennessee 91%, Carolina 84%, Alabama 96%. Carolina needs attention.', timestamp: new Date(Date.now() - 180 * 60000), status: 'read', context: { label: 'View District Intelligence', route: R.district, kind: 'audit' } },
      { id: 'hq-pc2', senderId: 'u-dm22', content: 'Carolina had 2 fixture shipments delayed. We\'re catching up this week — targeting 90% by Friday.', timestamp: new Date(Date.now() - 120 * 60000), status: 'read' },
      { id: 'hq-pc3', senderId: 'u7', content: 'Pushed updated Beverage template to Localization Engine for all districts. 36 stores included.', timestamp: new Date(Date.now() - 60 * 60000), status: 'delivered', context: { label: 'Open Localization Engine', route: R.loc, kind: 'localization' } },
      { id: 'hq-pc4', senderId: 'u-dm19', content: 'Alabama is all green. All 4 stores completed spring reset ahead of schedule.', timestamp: new Date(Date.now() - 20 * 60000), status: 'delivered' },
    ],
  },
  {
    id: 'hq3', type: 'direct', name: 'Anna Martinez', avatar: 'AM',
    participants: [contacts[6]], unread: 1, pinned: false, lastActivity: new Date(Date.now() - 40 * 60000),
    messages: [
      { id: 'hq-a1', senderId: 'u7', content: 'The new Seasonal Promo End Cap rule has been added to POG Rule Management.', timestamp: new Date(Date.now() - 180 * 60000), status: 'read', context: { label: 'Open POG Rules', route: R.pogRule, kind: 'pog' } },
      { id: 'hq-a2', senderId: 'me', content: 'Great. Make sure min-facing is set to 3 for high-velocity SKUs in the promo section.', timestamp: new Date(Date.now() - 120 * 60000), status: 'read' },
      { id: 'hq-a3', senderId: 'u7', content: 'Done. Ask Alan flagged 5 stores with potential drift on Beverage Cooler layout. Confidence 88–94%.', timestamp: new Date(Date.now() - 40 * 60000), status: 'delivered', context: { label: 'Triage in Ask Alan', route: R.copilot, kind: 'audit' } },
    ],
  },
  {
    id: 'hq4', type: 'group', name: 'Merchandising Leadership', avatar: 'ML',
    description: 'HQ merchandising strategy and planning',
    participants: [
      { id: 'u-vp', name: 'Mike Rodriguez', avatar: 'MR', role: 'Regional VP', roleCode: 'HQ', online: false, lastSeen: '2h ago' },
      { id: 'u-ops', name: 'Robert Chang', avatar: 'RC', role: 'Operations Director', roleCode: 'OPS', online: true },
    ],
    unread: 0, pinned: false, lastActivity: new Date(Date.now() - 300 * 60000),
    messages: [
      { id: 'hq-ml1', senderId: 'u-vp', content: 'Q2 planogram refresh is on track. Network-wide compliance at 89% — up from 82% last quarter.', timestamp: new Date(Date.now() - 480 * 60000), status: 'read' },
      { id: 'hq-ml2', senderId: 'u-ops', content: 'Gross margin recovery from spring markdown optimization is $18K this period.', timestamp: new Date(Date.now() - 420 * 60000), status: 'read' },
      { id: 'hq-ml3', senderId: 'me', content: 'Great numbers. I\'ll prepare the district-level breakdown for the board review.', timestamp: new Date(Date.now() - 300 * 60000), status: 'read' },
    ],
  },
  {
    id: 'hq5', type: 'broadcast', name: 'Network-Wide Announcements', avatar: 'NW',
    description: 'Official announcements from HQ Merchandising',
    participants: contacts, unread: 0, pinned: false, lastActivity: new Date(Date.now() - 120 * 60000),
    messages: [
      { id: 'hq-nw1', senderId: 'me', content: 'Q2 Planogram Refresh — all districts must reach 90%+ compliance by May 20. Templates are live in POG Management.', timestamp: new Date(Date.now() - 240 * 60000), status: 'read', context: { label: 'Open Master POG Management', route: R.pog, kind: 'pog' } },
      { id: 'hq-nw2', senderId: 'me', content: '🏆 Quarterly compliance awards: District 19 (Alabama) leads at 96%. District 14 close behind at 91%.', timestamp: new Date(Date.now() - 120 * 60000), status: 'delivered', context: { label: 'View District Intelligence', route: R.district, kind: 'audit' } },
    ],
  },
  {
    id: 'hq6', type: 'group', name: 'Localization Reviewers', avatar: 'LR',
    description: 'Final sign-off on localized POGs before publish',
    participants: [contacts[6], contacts[1], contacts[8]], unread: 1, pinned: false, lastActivity: new Date(Date.now() - 45 * 60000),
    messages: [
      { id: 'hq-lr1', senderId: 'u7', content: 'Beverages — Tennessee variant is ready for review. 12 stores included.', timestamp: new Date(Date.now() - 90 * 60000), status: 'read', context: { label: 'Open in Localization Engine', route: R.loc, kind: 'localization' } },
      { id: 'hq-lr2', senderId: 'me', content: 'LGTM on assortment. One question on facing rules for store #3021.', timestamp: new Date(Date.now() - 45 * 60000), status: 'delivered', context: { label: 'View POG Rules', route: R.pogRule, kind: 'pog' } },
    ],
  },
  {
    id: 'hq7', type: 'broadcast', name: 'Performance Highlights', avatar: 'PH',
    description: 'Quarterly performance updates and recognition',
    participants: contacts, unread: 0, pinned: false, lastActivity: new Date(Date.now() - 150 * 60000),
    messages: [
      { id: 'hq-ph1', senderId: 'me', content: '🏆 Great start to Q2! Network-wide revenue +8% vs target. Top districts: Alabama, Tennessee, and Florida.', timestamp: new Date(Date.now() - 150 * 60000), status: 'read', context: { label: 'View District Intelligence', route: R.district, kind: 'audit' } },
    ],
  },
];

// ── ADMIN chats — platform, user management conversations ──
const ADMIN_CHATS: Chat[] = [
  ...DM_CHATS.slice(0, 4),
  {
    id: 'adm1', type: 'group', name: 'Platform Ops', avatar: 'PO',
    description: 'System health, deployments, and platform operations',
    participants: [contacts[7], contacts[1]], unread: 2, pinned: true, lastActivity: new Date(Date.now() - 5 * 60000),
    messages: [
      { id: 'adm-po1', senderId: 'u8', content: 'Ask Alan model update deployed. Audit confidence thresholds recalibrated.', timestamp: new Date(Date.now() - 120 * 60000), status: 'read' },
      { id: 'adm-po2', senderId: 'me', content: 'Confirmed. Monitoring for the next 24h. No anomalies so far.', timestamp: new Date(Date.now() - 60 * 60000), status: 'read' },
      { id: 'adm-po3', senderId: 'u8', content: '3 new user accounts provisioned for District 22 — Marcus Reed team.', timestamp: new Date(Date.now() - 5 * 60000), status: 'delivered' },
    ],
  },
  ...DM_CHATS.slice(5),
];

const getChatsByRole = (role: string): Chat[] => {
  switch (role) {
    case 'SM':    return SM_CHATS;
    case 'HQ':    return HQ_CHATS;
    case 'ADMIN': return ADMIN_CHATS;
    default:      return DM_CHATS;
  }
};

// ── Helpers ──
const formatTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatFullTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** 6-stop distinct pastel palette — vivid enough to distinguish, soft enough for enterprise */
const getAvatarGradient = (initials: string) => {
  const palette = [
    { bg: '#e8eeff', ink: '#3730a3' },   // indigo
    { bg: '#dcfce7', ink: '#15803d' },   // emerald
    { bg: '#fef9c3', ink: '#a16207' },   // amber
    { bg: '#fee2e2', ink: '#b91c1c' },   // rose
    { bg: '#ede9fe', ink: '#6d28d9' },   // violet
    { bg: '#e0f2fe', ink: '#0369a1' },   // sky
  ];
  const code = initials.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return palette[code % palette.length];
};

const getContextIcon = (kind: MessageContext['kind']) => {
  switch (kind) {
    case 'pog':          return <LayersOutlined sx={{ fontSize: 11 }} />;
    case 'task':         return <AssignmentOutlined sx={{ fontSize: 11 }} />;
    case 'localization': return <PlaceOutlined sx={{ fontSize: 11 }} />;
    case 'audit':        return <AutoAwesomeOutlined sx={{ fontSize: 11 }} />;
    case 'broadcast':    return <CampaignOutlined sx={{ fontSize: 11 }} />;
    case 'store':        return <TagOutlined sx={{ fontSize: 11 }} />;
    default:             return <OpenInNewOutlined sx={{ fontSize: 11 }} />;
  }
};

// ── Component ──
export const MessageCenter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const roleChats = getChatsByRole(user?.role || 'DM');
  const [isLoading, setIsLoading]           = useState(true);
  const [chats, setChats]                   = useState<Chat[]>(roleChats);
  const [activeChat, setActiveChat]         = useState<string | null>(roleChats[0]?.id || null);
  const [inputValue, setInputValue]         = useState('');
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeTab, setActiveTab]           = useState<Tab>('all');
  const [section, setSection]               = useState<CommSection>('messages');
  const [showNewChat, setShowNewChat]       = useState(false);
  const [modalStep, setModalStep]           = useState<'main' | 'group' | 'broadcast'>('main');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newChatName, setNewChatName]       = useState('');
  const [contactSearch, setContactSearch]   = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [fieldSignals, setFieldSignals]     = useState<FieldSignal[]>(MOCK_FIELD_SIGNALS);
  const [showLogSignal, setShowLogSignal]     = useState(false);
  const [logSignalForm, setLogSignalForm]   = useState<LogSignalFormState>(EMPTY_LOG_SIGNAL_FORM);
  const [logSignalErrors, setLogSignalErrors] = useState<Partial<Record<keyof LogSignalFormState, string>>>({});
  const [activeSignalId, setActiveSignalId] = useState<string | null>(null);
  const [fsFilters, setFsFilters]           = useState<FieldSignalFilters>(EMPTY_FS_FILTERS);
  const [showComposerAdd, setShowComposerAdd] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const headerAddRef = useRef<HTMLDivElement>(null);
  const [threadSignalFilter, setThreadSignalFilter] = useState(false);
  const [prefillBroadcastFromSignal, setPrefillBroadcastFromSignal] = useState<FieldSignal | null>(null);
  const chatEndRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);

  const selectedChat = chats.find(c => c.id === activeChat);
  const visibleSignals = useMemo(() => filterSignalsForRole(fieldSignals, user), [fieldSignals, user]);
  const activeSignal = activeSignalId ? fieldSignals.find(s => s.id === activeSignalId) ?? null : null;
  const storeOptions = useMemo(
    () => [...new Set(visibleSignals.map(s => s.storeName || s.storeId || ''))].filter(Boolean).sort() as string[],
    [visibleSignals]
  );
  const threadActiveSignals = activeChat
    ? getActiveSignalsForThread(visibleSignals, activeChat)
    : [];

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Deep-link: navigate to a specific Field Signal from another page (e.g. Task detail → Field Signal)
  useEffect(() => {
    const state = location.state as { openFieldSignal?: string } | null;
    const signalId = state?.openFieldSignal;
    if (!signalId) return;
    window.history.replaceState({}, document.title);
    setSection('field_signals');
    setActiveChat(null);
    setActiveSignalId(signalId);
  }, [location.state]);

  // Link task created from Field Signal (return path from Operations Queue)
  useEffect(() => {
    const raw = sessionStorage.getItem('fieldSignalTaskLink');
    if (!raw) return;
    try {
      const { signalId, taskId } = JSON.parse(raw) as { signalId: string; taskId: string };
      sessionStorage.removeItem('fieldSignalTaskLink');
      const now = new Date().toISOString();
      setFieldSignals(prev => prev.map(s => {
        if (s.id !== signalId) return s;
        return {
          ...s,
          linkedTaskId: taskId,
          updatedAt: now,
          activityLog: [...s.activityLog, {
            id: `fsa-${Date.now()}`,
            fieldSignalId: signalId,
            action: 'Task created from signal',
            actorUserId: user?.id || 'me',
            actorName: user?.name || 'You',
            timestamp: now,
            notes: `Task #${taskId}`,
          }],
        };
      }));
      showToast('Task Linked To Field Signal', 'success');
    } catch {
      sessionStorage.removeItem('fieldSignalTaskLink');
    }
  }, [user?.id, user?.name, showToast]);

  // Attach demo field-signal markers to chats that reference them
  useEffect(() => {
    setChats(prev => {
      let changed = false;
      const next = prev.map(chat => {
        const linked = MOCK_FIELD_SIGNALS.filter(
          s => s.originalThreadId === chat.id && s.originalMessageId
        );
        if (!linked.length) return chat;
        const existingIds = new Set(chat.messages.map(m => m.id));
        const toAdd: Message[] = linked
          .filter(s => s.originalMessageId && !existingIds.has(s.originalMessageId))
          .map(s => ({
            id: s.originalMessageId!,
            senderId: 'me',
            content: '',
            timestamp: new Date(s.createdAt),
            status: 'read' as MessageStatus,
            fieldSignalId: s.id,
          }));
        if (!toAdd.length) return chat;
        changed = true;
        return {
          ...chat,
          messages: [...chat.messages, ...toAdd].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
          ),
        };
      });
      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    if (!showHeaderMenu && !showComposerAdd) return;
    const handler = () => { setShowHeaderMenu(false); setShowComposerAdd(false); };
    const timer = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handler); };
  }, [showHeaderMenu, showComposerAdd]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages.length]);

  useEffect(() => {
    if (activeChat) inputRef.current?.focus();
  }, [activeChat]);

  const openLogSignalDrawer = () => {
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const myStore = STORE_OPTIONS.find(s => s.value === (user?.storeId || ''));
    setLogSignalForm({
      ...EMPTY_LOG_SIGNAL_FORM,
      locationScope: 'stores',
      storeId: user?.storeId || '',
      storeName: myStore?.label || user?.store || '',
      affectedStoreIds: user?.storeId ? [user.storeId] : [],
      districtId: myStore?.district || user?.districtId || '',
      districtName: myStore ? (DISTRICT_OPTIONS.find(d => d.value === myStore.district)?.label ?? user?.district ?? '') : (user?.district || ''),
      zipCode: myStore?.zip || '',
      state: myStore?.state || '',
      impactStartDate: today,
      impactEndDate: end,
    });
    setLogSignalErrors({});
    setShowLogSignal(true);
  };

  const validateLogSignalForm = (): boolean => {
    const err: Partial<Record<keyof LogSignalFormState, string>> = {};
    if (!logSignalForm.signalType) err.signalType = 'Required';
    if (!logSignalForm.title.trim()) err.title = 'Required';
    if (!logSignalForm.description.trim()) err.description = 'Required';
    if (!logSignalForm.impactStartDate) err.impactStartDate = 'Required';
    if (!logSignalForm.impactEndDate) err.impactEndDate = 'Required';
    if (!logSignalForm.expectedImpact) err.expectedImpact = 'Required';

    // Location scope conditional validation
    const scope = logSignalForm.locationScope;
    if (scope === 'stores' && logSignalForm.affectedStoreIds.length === 0) {
      err.storeName = 'Select at least one store';
    }
    if (scope === 'zip_code' && !logSignalForm.zipCode.trim()) {
      err.zipCode = 'Required for this scope';
    }
    if (scope === 'city' && !logSignalForm.city.trim()) {
      err.city = 'Required for this scope';
    }
    if (scope === 'state' && !logSignalForm.state.trim()) {
      err.state = 'Required for this scope';
    }

    if (logSignalForm.notifyScope === 'specific' && logSignalForm.notifyRecipientIds.length === 0) {
      err.notifyRecipientIds = 'Select at least one recipient';
    }
    if (logSignalForm.impactStartDate && logSignalForm.impactEndDate
      && logSignalForm.impactEndDate < logSignalForm.impactStartDate) {
      err.impactEndDate = 'End date must be on or after start date';
    }
    setLogSignalErrors(err);
    return Object.keys(err).length === 0;
  };

  const submitFieldSignal = () => {
    if (!validateLogSignalForm() || !logSignalForm.signalType || !logSignalForm.expectedImpact) return;
    const now = new Date().toISOString();
    const id = `FS-${Date.now().toString().slice(-6)}`;
    const notifyNote = logSignalForm.notifyScope === 'all'
      ? `Notified all ${FIELD_SIGNAL_NOTIFY_CONTACTS.length} team members`
      : `Notified ${logSignalForm.notifyRecipientIds.length} recipient${logSignalForm.notifyRecipientIds.length > 1 ? 's' : ''}`;

    const signal: FieldSignal = {
      id,
      signalType: logSignalForm.signalType,
      title: logSignalForm.title.trim(),
      description: logSignalForm.description.trim(),
      locationScope: logSignalForm.locationScope,
      storeId: logSignalForm.storeId || undefined,
      storeName: logSignalForm.storeName || undefined,
      districtId: logSignalForm.districtId || user?.districtId,
      districtName: logSignalForm.districtName || user?.district,
      zipCode: logSignalForm.zipCode || undefined,
      city: logSignalForm.city || undefined,
      state: logSignalForm.state || undefined,
      department: logSignalForm.department || undefined,
      impactStartDate: logSignalForm.impactStartDate,
      impactEndDate: logSignalForm.impactEndDate,
      expectedImpact: logSignalForm.expectedImpact,
      status: 'new',
      createdByUserId: user?.id || 'me',
      createdByName: user?.name || 'You',
      createdAt: now,
      updatedAt: now,
      originalThreadId: activeChat || undefined,
      activityLog: [
        {
          id: `fsa-${Date.now()}`,
          fieldSignalId: id,
          action: 'Field Signal created',
          actorUserId: user?.id || 'me',
          actorName: user?.name || 'You',
          timestamp: now,
        },
        {
          id: `fsa-${Date.now()}-notify`,
          fieldSignalId: id,
          action: notifyNote,
          actorUserId: user?.id || 'me',
          actorName: user?.name || 'You',
          timestamp: now,
        },
      ],
    };
    setFieldSignals(prev => [signal, ...prev]);
    if (activeChat) {
      const msgId = `fs-msg-${Date.now()}`;
      signal.originalMessageId = msgId;
      const marker: Message = {
        id: msgId,
        senderId: 'me',
        content: '',
        timestamp: new Date(),
        status: 'sent',
        fieldSignalId: id,
      };
      setChats(prev => prev.map(c =>
        c.id === activeChat
          ? { ...c, messages: [...c.messages, marker], lastActivity: new Date() }
          : c
      ));
    }
    setShowLogSignal(false);
    setLogSignalForm(EMPTY_LOG_SIGNAL_FORM);
    showToast(
      logSignalForm.notifyScope === 'all'
        ? 'Field Signal Logged And Team Notified'
        : 'Field Signal Logged And Recipients Notified',
      'success',
    );
  };

  const updateSignal = (id: string, updater: (s: FieldSignal) => FieldSignal) => {
    setFieldSignals(prev => prev.map(s => (s.id === id ? updater(s) : s)));
  };

  const handleMarkReviewed = (id: string) => {
    if (!canReviewFieldSignals(user?.role)) return;
    const now = new Date().toISOString();
    updateSignal(id, s => ({
      ...s,
      status: 'reviewed',
      reviewedByUserId: user?.id,
      reviewedByName: user?.name,
      reviewedAt: now,
      updatedAt: now,
      activityLog: [...s.activityLog, {
        id: `fsa-${Date.now()}`,
        fieldSignalId: id,
        action: 'Marked as Reviewed',
        actorUserId: user?.id || 'me',
        actorName: user?.name || 'You',
        timestamp: now,
      }],
    }));
    showToast('Field Signal Marked As Reviewed', 'success');
  };

  const handleCloseSignal = (id: string) => {
    if (!canReviewFieldSignals(user?.role)) return;
    const now = new Date().toISOString();
    updateSignal(id, s => ({
      ...s,
      status: 'closed',
      closedByUserId: user?.id,
      closedByName: user?.name,
      closedAt: now,
      updatedAt: now,
      activityLog: [...s.activityLog, {
        id: `fsa-${Date.now()}`,
        fieldSignalId: id,
        action: 'Signal closed',
        actorUserId: user?.id || 'me',
        actorName: user?.name || 'You',
        timestamp: now,
      }],
    }));
    showToast('Field Signal Closed', 'success');
  };

  const handleCreateTaskFromSignal = (signal: FieldSignal) => {
    navigate('/command-center/operations-queue', {
      state: {
        prefillFromSignal: {
          fieldSignalId: signal.id,
          title: `[Field Signal] ${signal.title}`,
          description: signal.description,
          storeName: signal.storeName || signal.storeId,
          priority: signal.expectedImpact === 'demand_increase' || signal.expectedImpact === 'inventory_risk' ? 'High' : 'Medium',
        },
      },
    });
  };

  const handleCreateBroadcastFromSignal = (signal: FieldSignal) => {
    setPrefillBroadcastFromSignal(signal);
    setNewChatName(signal.title);
    setBroadcastMessage(
      `${signal.description}\n\n— Field Signal ${signal.id} · ${signal.storeName || signal.storeId}`
    );
    setModalStep('broadcast');
    setShowNewChat(true);
    setActiveSignalId(null);
  };


  const totalUnread = useMemo(
    () => chats.filter(c => c.unread > 0).length,
    [chats],
  );

  const markAllRead = useCallback(() => {
    setChats(prev => prev.map(c => ({ ...c, unread: 0 })));
  }, []);

  const filteredChats = chats
    .filter(c => {
      if (section === 'broadcasts') return c.type === 'broadcast';
      if (section === 'messages') {
        if (activeTab === 'direct') return c.type === 'direct';
        if (activeTab === 'groups') return c.type === 'group';
        if (activeTab === 'unread')  return c.unread > 0;
        return true;
      }
      return true;
    })
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    });

  const handleSend = () => {
    if (!inputValue.trim() || !activeChat) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`, senderId: 'me',
      content: inputValue.trim(), timestamp: new Date(), status: 'sent',
    };
    setChats(prev => prev.map(c =>
      c.id === activeChat ? { ...c, messages: [...c.messages, newMsg], lastActivity: new Date() } : c
    ));
    setInputValue('');
    setTimeout(() => {
      setChats(prev => prev.map(c =>
        c.id === activeChat
          ? { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' as MessageStatus } : m) }
          : c
      ));
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const closeModal = () => {
    setShowNewChat(false); setModalStep('main');
    setSelectedMembers([]); setNewChatName(''); setContactSearch(''); setBroadcastMessage('');
    setPrefillBroadcastFromSignal(null);
  };

  const toggleMember = (id: string) =>
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const createGroupChat = () => {
    if (!selectedMembers.length) return;
    const members = contacts.filter(c => selectedMembers.includes(c.id));
    const name = newChatName.trim() || members.map(m => m.name.split(' ')[0]).join(', ');
    const newChat: Chat = {
      id: `c-${Date.now()}`, type: 'group', name, avatar: '👥',
      description: `Group with ${members.length} members`,
      participants: members, messages: [], unread: 0, pinned: false, lastActivity: new Date(),
    };
    setChats(prev => [newChat, ...prev]); setActiveChat(newChat.id); closeModal();
  };

  const createBroadcast = () => {
    if (!selectedMembers.length || !broadcastMessage.trim()) return;
    const members = contacts.filter(c => selectedMembers.includes(c.id));
    const bcEventId = `bc-${Date.now()}`;
    const now = new Date();
    const messageContent = broadcastMessage.trim();

    // Fan-out: create / update an individual direct thread for every recipient
    setChats(prev => {
      let updated = [...prev];
      members.forEach(member => {
        const existingIdx = updated.findIndex(c => c.type === 'direct' && c.participants[0]?.id === member.id);
        const bcMsg: Message = {
          id: `msg-${bcEventId}-${member.id}`,
          senderId: 'me',
          content: messageContent,
          timestamp: now,
          status: 'delivered' as MessageStatus,
        };
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            messages: [...updated[existingIdx].messages, bcMsg],
            unread: 0,
            lastActivity: now,
          };
        } else {
          const newDm: Chat = {
            id: `c-dm-${member.id}-${Date.now()}`,
            type: 'direct',
            name: member.name,
            avatar: member.avatar,
            participants: [member],
            messages: [bcMsg],
            unread: 0,
            pinned: false,
            lastActivity: now,
          };
          updated = [newDm, ...updated];
        }
      });

      // Outbox entry — type broadcast, only visible to sender
      const outboxName = newChatName.trim() || `Announcement · ${members.length} people`;
      const outboxChat: Chat = {
        id: bcEventId,
        type: 'broadcast',
        name: outboxName,
        avatar: '📢',
        description: `Sent privately to ${members.length} ${members.length === 1 ? 'person' : 'people'}`,
        participants: members,
        broadcastRecipientIds: members.map(m => m.id),
        messages: [{
          id: `msg-${bcEventId}-outbox`,
          senderId: 'me',
          content: messageContent,
          timestamp: now,
          status: 'delivered' as MessageStatus,
        }],
        unread: 0,
        pinned: false,
        lastActivity: now,
      };
      return [outboxChat, ...updated];
    });

    if (prefillBroadcastFromSignal) {
      updateSignal(prefillBroadcastFromSignal.id, s => ({
        ...s,
        linkedBroadcastId: bcEventId,
        updatedAt: new Date().toISOString(),
        activityLog: [...s.activityLog, {
          id: `fsa-${Date.now()}`,
          fieldSignalId: s.id,
          action: 'Broadcast sent from signal',
          actorUserId: user?.id || 'me',
          actorName: user?.name || 'You',
          timestamp: new Date().toISOString(),
          notes: `Broadcast #${bcEventId} · ${members.length} recipients`,
        }],
      }));
      setPrefillBroadcastFromSignal(null);
    }

    setActiveChat(bcEventId);
    setActiveTab('broadcast');
    closeModal();
    showToast(`Sent privately to ${members.length} ${members.length === 1 ? 'person' : 'people'}`, 'success');
  };

  const startDirectMessage = (contact: Contact) => {
    const existing = chats.find(c => c.type === 'direct' && c.participants[0]?.id === contact.id);
    if (existing) { setActiveChat(existing.id); closeModal(); return; }
    const newChat: Chat = {
      id: `c-${Date.now()}`, type: 'direct', name: contact.name, avatar: contact.avatar,
      participants: [contact], messages: [], unread: 0, pinned: false, lastActivity: new Date(),
    };
    setChats(prev => [newChat, ...prev]); setActiveChat(newChat.id); closeModal();
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.role.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent':      return <Check sx={{ fontSize: 14 }} />;
      case 'delivered': return <DoneAll sx={{ fontSize: 14 }} />;
      case 'read':      return <DoneAll sx={{ fontSize: 14 }} className="mc-status-read" />;
    }
  };

  const renderDateSeparator = (date: Date) => {
    const today     = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    let label = date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    if (date.toDateString() === today.toDateString())     label = 'Today';
    if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    return <div className="mc-date-sep"><span>{label}</span></div>;
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    messages.forEach(msg => {
      const dateStr = msg.timestamp.toDateString();
      const g = groups.find(g => g.date === dateStr);
      if (g) g.messages.push(msg);
      else groups.push({ date: dateStr, messages: [msg] });
    });
    return groups;
  };

  if (isLoading) {
    return (
      <div className="mc-container mc-container--loading">
        <div className="page-loading">
          <div className="page-loading-spinner" />
          <p>Loading Communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mc-container">

      {/* ── Left Sidebar — always visible, content swaps per section ── */}
      <div className="mc-sidebar">

        {/* Header — identical across all sections */}
        <div className="mc-sidebar-header">
          <div className="mc-sidebar-title">
            <ForumOutlined sx={{ fontSize: 20 }} />
            <h2>Communications</h2>
          </div>
          <div className="mc-header-add-wrap" ref={headerAddRef}>
            <Button
              variant="contained" color="primary" size="small"
              className={`mc-new-chat-btn${showHeaderMenu ? ' mc-new-chat-btn--open' : ''}`}
              onClick={e => { e.stopPropagation(); setShowHeaderMenu(v => !v); }}
              aria-label="Create new"
              aria-expanded={showHeaderMenu}
              aria-haspopup="menu"
            >
              <Add sx={{ fontSize: 18 }} />
            </Button>
            <McHeaderAddPortalMenu
              anchorEl={headerAddRef.current}
              open={showHeaderMenu}
              onClose={() => setShowHeaderMenu(false)}
            >
              <div className="mc-add-menu-panel" role="menu">
                <p className="mc-add-menu-heading">Create</p>
                <button
                  type="button"
                  className="mc-add-menu-item"
                  role="menuitem"
                  onClick={() => { setShowHeaderMenu(false); setShowNewChat(true); setModalStep('main'); }}
                >
                  <span className="mc-add-menu-icon mc-add-menu-icon--message">
                    <ChatOutlined sx={{ fontSize: 18 }} />
                  </span>
                  <span className="mc-add-menu-copy">
                    <span className="mc-add-menu-title">New Message</span>
                    <span className="mc-add-menu-desc">Direct chat or group conversation</span>
                  </span>
                </button>
                <div className="mc-add-menu-divider" />
                <button
                  type="button"
                  className="mc-add-menu-item"
                  role="menuitem"
                  onClick={() => { setShowHeaderMenu(false); openLogSignalDrawer(); }}
                >
                  <span className="mc-add-menu-icon mc-add-menu-icon--signal">
                    <SensorsOutlined sx={{ fontSize: 18 }} />
                  </span>
                  <span className="mc-add-menu-copy">
                    <span className="mc-add-menu-title">Log Field Signal</span>
                    <span className="mc-add-menu-desc">Local demand and operational context</span>
                  </span>
                </button>
              </div>
            </McHeaderAddPortalMenu>
          </div>
        </div>

        {/* Section tabs */}
        <div className="mc-section-tabs">
          {(['messages', 'field_signals'] as CommSection[]).map(sec => (
            <button
              key={sec}
              type="button"
              className={`mc-section-tab ${section === sec ? 'mc-section-tab--active' : ''}`}
              onClick={() => {
                setSection(sec);
                if (sec === 'messages') { setActiveTab('all'); setActiveSignalId(null); }
                if (sec === 'field_signals') { setActiveChat(null); }
              }}
            >
              {sec === 'messages' ? 'Messages' : 'Field Signals'}
            </button>
          ))}
        </div>

        {/* ── Field Signals sidebar: search + export + signal cards ── */}
        {section === 'field_signals' ? (
          <FieldSignalSidebarList
            signals={visibleSignals}
            search={fsFilters.search}
            selectedSignalId={activeSignalId}
            onSearch={v => setFsFilters(f => ({ ...f, search: v }))}
            onSelectSignal={id => setActiveSignalId(id)}
            canExport={canExportFieldSignals(user?.role)}
            storeOptions={storeOptions}
          />
        ) : (
          <>
            {/* Conversation search */}
            <div className="mc-search">
              <SearchOutlined sx={{ fontSize: 15 }} />
              <input
                type="text" placeholder="Search conversations..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="mc-search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear">
                  <CloseOutlined sx={{ fontSize: 13 }} />
                </button>
              )}
            </div>

            {/* Conversation filter: segment + unread toggle (messages only) */}
            {section === 'messages' && (
              <>
                <div className="mc-filter-tabs-wrap">
                  {/* Segment control: All / Direct / Groups */}
                  <div className="mc-filter-segment" role="tablist">
                    {([
                      { value: 'all',    label: 'All'    },
                      { value: 'direct', label: 'Direct', icon: <ChatOutlined sx={{ fontSize: 13 }} /> },
                      { value: 'groups', label: 'Groups', icon: <GroupOutlined sx={{ fontSize: 13 }} /> },
                    ] as { value: Tab; label: string; icon?: React.ReactNode }[]).map(t => (
                      <button
                        key={t.value}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === t.value && activeTab !== 'unread'}
                        className={`mc-filter-tab${(activeTab === t.value && activeTab !== 'unread') ? ' mc-filter-tab--active' : ''}`}
                        onClick={() => setActiveTab(t.value)}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Unread toggle pill */}
                  <button
                    type="button"
                    className={`mc-unread-toggle${activeTab === 'unread' ? ' mc-unread-toggle--on' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'unread' ? 'all' : 'unread')}
                    title={activeTab === 'unread' ? 'Show all' : 'Show only unread'}
                  >
                    <span className="mc-unread-toggle-dot" />
                    Unread
                    {totalUnread > 0 && (
                      <span className="mc-unread-toggle-count">{totalUnread}</span>
                    )}
                  </button>
                </div>

                {/* Mark all read bar — only when there are unreads */}
                {totalUnread > 0 && (
                  <div className="mc-mark-all-bar">
                    <span className="mc-mark-all-label">
                      <span className="mc-mark-all-dot" />
                      {totalUnread} unread conversation{totalUnread !== 1 ? 's' : ''}
                    </span>
                    <button type="button" className="mc-mark-all-btn" onClick={markAllRead}>
                      Mark all read
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Chat list */}
            <div className="mc-chat-list">
              {filteredChats.length === 0 && (
                <div className="mc-chat-list-empty">
                  <SearchOutlined sx={{ fontSize: 22 }} />
                  <span>No conversations found</span>
                </div>
              )}
              {filteredChats.map(chat => {
                const av = getAvatarGradient(chat.avatar);
                const hasUnread = chat.unread > 0;
                const lastMsg = chat.messages[chat.messages.length - 1];
                const isOnline = chat.type === 'direct' && chat.participants[0]?.online;
                const isBroadcastOutbox = chat.type === 'broadcast';
                return (
                  <button
                    key={chat.id}
                    className={`mc-chat-item ${activeChat === chat.id ? 'mc-chat-item--active' : ''} ${hasUnread ? 'mc-chat-item--unread' : ''} ${isBroadcastOutbox ? 'mc-chat-item--broadcast' : ''}`}
                    onClick={() => { setActiveChat(chat.id); setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c)); }}
                  >
                    <div className="mc-chat-item-avatar"
                      style={{ background: isBroadcastOutbox ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : av.bg, borderRadius: '50%' }}>
                      {isBroadcastOutbox
                        ? <CampaignOutlined sx={{ fontSize: 16, color: '#fff' }} />
                        : <span style={{ color: av.ink }}>{chat.avatar}</span>}
                      {isOnline && <span className="mc-chat-item-online-dot" />}
                    </div>
                    <div className="mc-chat-item-body">
                      <div className="mc-chat-item-row">
                        <span className="mc-chat-name">
                          {chat.name}
                          {isBroadcastOutbox && <span className="mc-chat-bc-tag"><CampaignOutlined sx={{ fontSize: 9 }} />Announcement</span>}
                        </span>
                        <div className="mc-chat-meta">
                          {chat.pinned && <PushPinOutlined sx={{ fontSize: 10 }} className="mc-pin-icon" />}
                          {hasUnread
                            ? <span className="mc-unread-badge-wrap"><Badge label={String(chat.unread)} color="error" size="small" /></span>
                            : null}
                          <span className="mc-chat-time">{formatTime(chat.lastActivity)}</span>
                        </div>
                      </div>
                      {isBroadcastOutbox && chat.participants.length > 0 && (
                        <p className="mc-chat-preview mc-chat-preview--bc">
                          <CheckCircleOutlined sx={{ fontSize: 11 }} style={{ color: '#22c55e', marginRight: 3, verticalAlign: 'middle' }} />
                          Delivered to {chat.participants.length} {chat.participants.length === 1 ? 'person' : 'people'}
                        </p>
                      )}
                      {!isBroadcastOutbox && lastMsg && (
                        <p className="mc-chat-preview">
                          {lastMsg.senderId === 'me' ? 'You: ' : ''}
                          {lastMsg.content.slice(0, 55)}{lastMsg.content.length > 55 ? '…' : ''}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Main Panel ── */}
      <div className="mc-main">
        {section === 'field_signals' ? (
          <FieldSignalMainPanel
            selectedSignal={activeSignalId ? (visibleSignals.find(s => s.id === activeSignalId) ?? null) : null}
            user={user}
            onMarkReviewed={handleMarkReviewed}
            onCloseSignal={handleCloseSignal}
            onCreateTask={handleCreateTaskFromSignal}
            onCreateBroadcast={handleCreateBroadcastFromSignal}
            onViewConversation={threadId => {
              setActiveSignalId(null);
              setSection('messages');
              setActiveChat(threadId);
            }}
            onViewTask={taskId => navigate('/command-center/operations-queue', { state: { highlightTaskId: taskId } })}
          />
        ) : selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="mc-chat-header">
              <div className="mc-chat-header-left">
                <div className="mc-chat-header-avatar" style={{ background: getAvatarGradient(selectedChat.avatar).bg }}>
                  <span className="mc-chat-avatar-text" style={{ color: getAvatarGradient(selectedChat.avatar).ink }}>
                    {selectedChat.avatar}
                  </span>
                </div>
                <div className="mc-chat-header-info">
                  <h3>{selectedChat.name}</h3>
                  <span className="mc-chat-header-sub">
                    {selectedChat.type === 'direct'
                        ? (selectedChat.participants[0]?.online
                            ? <><span className="mc-online-indicator" />Online</>
                            : `Last seen ${selectedChat.participants[0]?.lastSeen || 'recently'}`)
                        : selectedChat.type === 'broadcast'
                        ? <><span className="mc-broadcast-pill"><LockOutlined sx={{ fontSize: 10 }} />Announcement</span><span>Sent to {selectedChat.participants.length} {selectedChat.participants.length === 1 ? 'person' : 'people'} individually</span></>
                        : `${selectedChat.participants.length} members`
                      }
                  </span>
                </div>
              </div>
              <div className="mc-chat-header-actions">
                <ActiveSignalsPill
                  count={threadActiveSignals.length}
                  signals={threadActiveSignals}
                  filterActive={threadSignalFilter}
                  onToggleFilter={() => setThreadSignalFilter(v => !v)}
                  onViewSignal={id => setActiveSignalId(id)}
                />
                {selectedChat.type === 'direct' && (
                  <>
                    <Button variant="outlined" size="small" className="mc-header-action" aria-label="Call"><PhoneOutlined sx={{ fontSize: 18 }} /></Button>
                    <Button variant="outlined" size="small" className="mc-header-action" aria-label="Video"><VideocamOutlined sx={{ fontSize: 18 }} /></Button>
                  </>
                )}
                <Button variant="outlined" size="small" className="mc-header-action" aria-label="Search"><SearchOutlined sx={{ fontSize: 18 }} /></Button>
                <Button variant="outlined" size="small" className="mc-header-action" aria-label="More"><MoreVert sx={{ fontSize: 18 }} /></Button>
              </div>
            </div>

            {threadSignalFilter && (
              <div className="mc-thread-signals-filter">
                <span>Showing Field Signals in this thread</span>
                <button type="button" onClick={() => setThreadSignalFilter(false)}>Show all messages</button>
              </div>
            )}

            {/* Messages */}
            <div className="mc-messages">
              {selectedChat.description && (
                <div className="mc-chat-description">
                  <TagOutlined sx={{ fontSize: 14 }} />
                  <span>{selectedChat.description}</span>
                </div>
              )}
              {groupMessagesByDate(selectedChat.messages).map(group => (
                <React.Fragment key={group.date}>
                  {renderDateSeparator(new Date(group.date))}
                  {group.messages.map((msg, idx) => {
                    if (threadSignalFilter && !msg.fieldSignalId) return null;
                    if (msg.fieldSignalId) {
                      const signal = fieldSignals.find(s => s.id === msg.fieldSignalId);
                      if (!signal) return null;
                      return (
                        <FieldSignalChatCard
                          key={msg.id}
                          signal={signal}
                          onViewDetails={() => setActiveSignalId(signal.id)}
                          onOpenLog={() => { setSection('field_signals'); setActiveSignalId(signal.id); }}
                        />
                      );
                    }
                    const isMe     = msg.senderId === 'me';
                    const sender   = contacts.find(c => c.id === msg.senderId);
                    const showAv   = !isMe && selectedChat.type !== 'direct' && (idx === 0 || group.messages[idx - 1].senderId !== msg.senderId);
                    const isConsec = idx > 0 && group.messages[idx - 1].senderId === msg.senderId;
                    const sav      = sender ? getAvatarGradient(sender.avatar) : { bg: '', ink: '' };

                    return (
                      <div key={msg.id} className={`mc-msg ${isMe ? 'mc-msg--me' : 'mc-msg--them'} ${isConsec ? 'mc-msg--consecutive' : ''}`}>
                        {!isMe && selectedChat.type !== 'direct' && (
                          <div className="mc-msg-avatar-space">
                            {showAv && (
                              <div className="mc-msg-avatar" style={{ background: sav.bg, color: sav.ink }}>
                                {sender?.avatar || '??'}
                              </div>
                            )}
                          </div>
                        )}
                        <div className={`mc-msg-bubble ${isMe ? 'mc-msg-bubble--me' : 'mc-msg-bubble--them'}`}>
                          {!isMe && selectedChat.type !== 'direct' && showAv && (
                            <span className="mc-msg-sender-name">
                              <span>{sender?.name}</span>
                              {sender && (
                                <Badge
                                  className="mc-role-pill"
                                  label={ROLE_BADGE[sender.roleCode].label}
                                  size="small"
                                  color={roleBadgeColor(sender.roleCode)}
                                />
                              )}
                            </span>
                          )}
                          <p className="mc-msg-text">{msg.content}</p>
                          {msg.context && (
                            <button
                              type="button"
                              className={`mc-msg-context mc-msg-context--${msg.context.kind} ${isMe ? 'mc-msg-context--me' : ''}`}
                              onClick={() => {
                                const route = msg.context!.route;
                                if (route === R.copilot || route.includes('ai-copilot')) {
                                  openAskAlan({
                                    skill: 'pog',
                                    initialMessage:
                                      'Summarize open planogram audits and shelf compliance items I should triage next.',
                                    autoSend: true,
                                  });
                                  return;
                                }
                                navigate(route);
                              }}
                            >
                              <span className="mc-msg-context-icon">{getContextIcon(msg.context.kind)}</span>
                              <span className="mc-msg-context-label">{msg.context.label}</span>
                              <OpenInNewOutlined sx={{ fontSize: 10 }} className="mc-msg-context-arrow" />
                            </button>
                          )}
                          <div className="mc-msg-footer">
                            <span className="mc-msg-time">{formatFullTime(msg.timestamp)}</span>
                            {isMe && <span className="mc-msg-status">{getStatusIcon(msg.status)}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Composer */}
            {selectedChat.type === 'broadcast' ? (
              <div className="mc-broadcast-composer">
                <div className="mc-bc-outbox-bar">
                  <LockOutlined sx={{ fontSize: 12 }} />
                  <span>This message was delivered privately to each person — recipients cannot see each other.</span>
                </div>
                {/* Delivery receipt grid */}
                {selectedChat.participants.length > 0 && (
                  <div className="mc-bc-delivery-grid">
                    <div className="mc-bc-delivery-title">Delivered to</div>
                    <div className="mc-bc-delivery-list">
                      {selectedChat.participants.map(p => {
                        const av = getAvatarGradient(p.avatar);
                        return (
                          <div key={p.id} className="mc-bc-delivery-item">
                            <div className="mc-bc-delivery-avatar" style={{ background: av.bg, color: av.ink }}>{p.avatar}</div>
                            <div className="mc-bc-delivery-info">
                              <span className="mc-bc-delivery-name">{p.name}</span>
                              <span className="mc-bc-delivery-role">{p.role}{p.store ? ` · ${p.store}` : ''}</span>
                            </div>
                            <CheckCircleOutlined sx={{ fontSize: 15 }} className="mc-bc-delivery-check" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Follow-up composer */}
                <div className="mc-bc-followup-label">
                  <CampaignOutlined sx={{ fontSize: 12 }} />
                  <span>Send another announcement to all recipients</span>
                </div>
                <div className="mc-input-row mc-input-row--broadcast">
                  <textarea
                    ref={inputRef} className="mc-input"
                    placeholder="Write a follow-up broadcast..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown} rows={1}
                  />
                  <Button
                    variant="contained" color="primary" size="medium"
                    className={`mc-send-btn mc-send-btn--broadcast ${inputValue.trim() ? 'mc-send-btn--active' : ''}`}
                    onClick={handleSend} disabled={!inputValue.trim()} aria-label="Broadcast"
                  >
                    <CampaignOutlined sx={{ fontSize: 18 }} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mc-input-area">
                <div className="mc-input-row">
                  <div className="mc-composer-add-wrap">
                    <Button
                      variant="text" size="small" className="mc-input-action mc-composer-add-btn"
                      aria-label="Add"
                      onClick={() => setShowComposerAdd(v => !v)}
                    >
                      <Add sx={{ fontSize: 20 }} />
                    </Button>
                    {showComposerAdd && (
                      <div className="mc-composer-add-menu">
                        <button type="button" onClick={() => { setShowComposerAdd(false); }}>
                          <AttachFileOutlined sx={{ fontSize: 18 }} />
                          Attach File
                        </button>
                        <button type="button" onClick={() => { setShowComposerAdd(false); openLogSignalDrawer(); }}>
                          <SensorsOutlined sx={{ fontSize: 18 }} />
                          Log Field Signal
                        </button>
                      </div>
                    )}
                  </div>
                  <Button variant="text" size="small" className="mc-input-action" aria-label="Emoji">
                    <SentimentSatisfiedOutlined sx={{ fontSize: 20 }} />
                  </Button>
                  <Button variant="text" size="small" className="mc-input-action" aria-label="Attach">
                    <AttachFileOutlined sx={{ fontSize: 20 }} />
                  </Button>
                  <textarea
                    ref={inputRef} className="mc-input"
                    placeholder="Type a message..." value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown} rows={1}
                  />
                  <Button
                    variant="contained" color="primary" size="medium"
                    className={`mc-send-btn ${inputValue.trim() ? 'mc-send-btn--active' : ''}`}
                    onClick={handleSend} disabled={!inputValue.trim()} aria-label="Send"
                  >
                    <SendOutlined sx={{ fontSize: 18 }} />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mc-empty-state">
            <EmptyState
              heading="No Conversation Selected"
              description="Select a conversation from the left to start messaging, or create a new one."
              emptyStateIcon={<ForumOutlined sx={{ fontSize: 48 }} />}
            />
          </div>
        )}
      </div>

      {/* ── New Chat Modal ── */}
      {showNewChat && (
        <div className="mc-modal-overlay" onClick={closeModal}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-header">
              {modalStep !== 'main' && (
                <button className="mc-modal-nav-btn" onClick={() => { setModalStep('main'); setSelectedMembers([]); setNewChatName(''); setContactSearch(''); setBroadcastMessage(''); }} aria-label="Back">
                  <ArrowBackOutlined sx={{ fontSize: 18 }} />
                </button>
              )}
              <h3>
                {modalStep === 'main' && 'New Conversation'}
                {modalStep === 'group' && 'New Group'}
                {modalStep === 'broadcast' && <><span>Announcements</span><span className="mc-modal-h3-private"><LockOutlined sx={{ fontSize: 12 }} />Private</span></>}
              </h3>
              <button className="mc-modal-nav-btn mc-modal-nav-btn--close" onClick={closeModal} aria-label="Close">
                <CloseOutlined sx={{ fontSize: 18 }} />
              </button>
            </div>

            {modalStep === 'main' && (
              <>
                <div className="mc-modal-search">
                  <SearchOutlined sx={{ fontSize: 15 }} />
                  <input type="text" placeholder="Search people..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} />
                  {contactSearch && (
                    <button className="mc-search-clear-btn" onClick={() => setContactSearch('')} aria-label="Clear">
                      <CloseOutlined sx={{ fontSize: 13 }} />
                    </button>
                  )}
                </div>
                <div className="mc-modal-actions">
                  <button className="mc-modal-action-btn" onClick={() => setModalStep('group')}>
                    <span className="mc-modal-action-icon mc-modal-action-icon--group"><GroupOutlined sx={{ fontSize: 18 }} /></span>
                    <div>
                      <span className="mc-modal-action-title">New Group</span>
                      <span className="mc-modal-action-desc">Create a group chat with multiple people</span>
                    </div>
                  </button>
                  <button className="mc-modal-action-btn" onClick={() => setModalStep('broadcast')}>
                    <span className="mc-modal-action-icon mc-modal-action-icon--broadcast"><CampaignOutlined sx={{ fontSize: 18 }} /></span>
                    <div>
                      <span className="mc-modal-action-title">Announcements</span>
                      <span className="mc-modal-action-desc">Send a private message to multiple people individually</span>
                    </div>
                  </button>
                </div>
                <div className="mc-modal-contacts-label">Contacts</div>
                <div className="mc-modal-contacts">
                  {filteredContacts.map(c => {
                    const av = getAvatarGradient(c.avatar);
                    return (
                      <button key={c.id} className="mc-modal-contact" onClick={() => startDirectMessage(c)}>
                        <div className="mc-modal-contact-avatar" style={{ background: av.bg, color: av.ink }}>{c.avatar}</div>
                        <div className="mc-modal-contact-info">
                          <span className="mc-modal-contact-name">{c.name}</span>
                          <span className="mc-modal-contact-role">{c.role}{c.store ? ` · ${c.store}` : ''}</span>
                        </div>
                        {c.online && <span className="mc-modal-contact-online" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {modalStep === 'group' && (
              <>
                <div className="mc-modal-name-input">
                  <input type="text" placeholder="Group name..." value={newChatName} onChange={e => setNewChatName(e.target.value)} autoFocus />
                </div>
                {selectedMembers.length > 0 && (
                  <div className="mc-selected-chips">
                    {selectedMembers.map(id => {
                      const c = contacts.find(ct => ct.id === id);
                      if (!c) return null;
                      return (
                        <Chips key={id} label={c.name.split(' ')[0]} size="small" variant="solid" isRemovable onDelete={() => toggleMember(id)} />
                      );
                    })}
                  </div>
                )}
                <div className="mc-modal-search">
                  <SearchOutlined sx={{ fontSize: 15 }} />
                  <input type="text" placeholder="Add members..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} />
                </div>
                <div className="mc-modal-contacts-label">Select Members ({selectedMembers.length})</div>
                <div className="mc-modal-contacts">
                  {filteredContacts.map(c => {
                    const isSelected = selectedMembers.includes(c.id);
                    const av = getAvatarGradient(c.avatar);
                    return (
                      <button key={c.id} className={`mc-modal-contact ${isSelected ? 'mc-modal-contact--selected' : ''}`} onClick={() => toggleMember(c.id)}>
                        <div className="mc-modal-contact-avatar" style={{ background: av.bg, color: av.ink }}>{c.avatar}</div>
                        <div className="mc-modal-contact-info">
                          <span className="mc-modal-contact-name">{c.name}</span>
                          <span className="mc-modal-contact-role">{c.role}{c.store ? ` · ${c.store}` : ''}</span>
                        </div>
                        <span className={`mc-checkbox ${isSelected ? 'mc-checkbox--checked' : ''}`}>
                          {isSelected && <Check sx={{ fontSize: 12 }} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mc-modal-footer">
                  <Button variant="contained" color="primary" size="large" className="mc-create-btn" disabled={!selectedMembers.length}
                    onClick={createGroupChat} startIcon={<GroupOutlined sx={{ fontSize: 16 }} />}>
                    Create Group
                  </Button>
                </div>
              </>
            )}

            {modalStep === 'broadcast' && (
              <>
                {/* Privacy callout */}
                <div className="mc-bc-privacy-banner">
                  <div className="mc-bc-privacy-icon"><LockOutlined sx={{ fontSize: 15 }} /></div>
                  <div className="mc-bc-privacy-text">
                    <span className="mc-bc-privacy-title">Private delivery</span>
                    <span className="mc-bc-privacy-sub">Each person receives your message as a private conversation — they won't see other recipients.</span>
                  </div>
                </div>

                {prefillBroadcastFromSignal && (
                  <div className="mc-bc-signal-pill">
                    <SensorsOutlined sx={{ fontSize: 12 }} />
                    <span>Pre-filled from Field Signal {prefillBroadcastFromSignal.id}</span>
                  </div>
                )}

                {/* Message composer */}
                <div className={`mc-bc-message-wrap${broadcastMessage.length > 0 ? ' mc-bc-message-wrap--has-content' : ''}`}>
                  <div className="mc-bc-message-label">
                    <EditOutlined sx={{ fontSize: 12 }} />
                    <span>Your message</span>
                    {broadcastMessage.length > 0 && (
                      <span className="mc-bc-char-count-inline">{broadcastMessage.length}</span>
                    )}
                  </div>
                  <textarea
                    className="mc-bc-message-textarea"
                    placeholder="Write your announcement — each recipient receives it as a private message..."
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    rows={6}
                    autoFocus
                  />
                  {/* Attachment toolbar */}
                  <div className="mc-bc-toolbar">
                    <div className="mc-bc-toolbar-left">
                      <label className="mc-bc-tool-btn" title="Attach file">
                        <input type="file" style={{ display: 'none' }} multiple />
                        <AttachFileOutlined sx={{ fontSize: 16 }} />
                        <span>Attach</span>
                      </label>
                      <button type="button" className="mc-bc-tool-btn" title="Add emoji">
                        <SentimentSatisfiedOutlined sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                    <div className="mc-bc-toolbar-right">
                      {broadcastMessage.length > 0 && (
                        <span className="mc-bc-toolbar-chars">{broadcastMessage.length} / 500</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional name */}
                <div className="mc-bc-name-row">
                  <input className="mc-bc-name-input" type="text" placeholder="Label this broadcast (optional)..." value={newChatName} onChange={e => setNewChatName(e.target.value)} />
                </div>

                {/* Recipient chips */}
                {selectedMembers.length > 0 && (
                  <div className="mc-bc-recipients-row">
                    <span className="mc-bc-recipients-label">To</span>
                    <div className="mc-bc-chips">
                      {selectedMembers.map(id => {
                        const c = contacts.find(ct => ct.id === id);
                        if (!c) return null;
                        return (
                          <Chips key={id} label={c.name.split(' ')[0]} size="small" variant="solid" isRemovable onDelete={() => toggleMember(id)} />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="mc-modal-search">
                  <SearchOutlined sx={{ fontSize: 15 }} />
                  <input type="text" placeholder="Add recipients..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} />
                </div>
                <div className="mc-modal-contacts-label">Select Recipients ({selectedMembers.length})</div>
                <div className="mc-modal-contacts">
                  {filteredContacts.map(c => {
                    const isSelected = selectedMembers.includes(c.id);
                    const av = getAvatarGradient(c.avatar);
                    return (
                      <button key={c.id} className={`mc-modal-contact ${isSelected ? 'mc-modal-contact--selected' : ''}`} onClick={() => toggleMember(c.id)}>
                        <div className="mc-modal-contact-avatar" style={{ background: av.bg, color: av.ink }}>{c.avatar}</div>
                        <div className="mc-modal-contact-info">
                          <span className="mc-modal-contact-name">{c.name}</span>
                          <span className="mc-modal-contact-role">{c.role}{c.store ? ` · ${c.store}` : ''}</span>
                        </div>
                        <span className={`mc-checkbox ${isSelected ? 'mc-checkbox--checked' : ''}`}>
                          {isSelected && <Check sx={{ fontSize: 12 }} />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Send footer */}
                <div className="mc-modal-footer mc-bc-footer">
                  <div className="mc-bc-footer-hint">
                    {selectedMembers.length > 0 && broadcastMessage.trim()
                      ? <><LockOutlined sx={{ fontSize: 11 }} /> Sending to {selectedMembers.length} {selectedMembers.length === 1 ? 'person' : 'people'} privately</>
                      : selectedMembers.length > 0
                      ? 'Add a message to send'
                      : 'Select at least one recipient'}
                  </div>
                  <Button
                    variant="contained" color="primary" size="large"
                    className="mc-create-btn mc-bc-send-btn"
                    disabled={!selectedMembers.length || !broadcastMessage.trim()}
                    onClick={createBroadcast}
                    startIcon={<CampaignOutlined sx={{ fontSize: 16 }} />}
                  >
                    Send Announcement
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <LogFieldSignalDrawer
        open={showLogSignal}
        form={logSignalForm}
        errors={logSignalErrors}
        onClose={() => { setShowLogSignal(false); setLogSignalErrors({}); }}
        onChange={updates => setLogSignalForm(prev => ({ ...prev, ...updates }))}
        onSubmit={submitFieldSignal}
      />

      {section !== 'field_signals' && (
        <FieldSignalDetailDrawer
          signal={activeSignal}
          user={user}
          onClose={() => setActiveSignalId(null)}
          onMarkReviewed={handleMarkReviewed}
          onCloseSignal={handleCloseSignal}
          onCreateTask={handleCreateTaskFromSignal}
          onCreateBroadcast={handleCreateBroadcastFromSignal}
          onViewConversation={threadId => {
            setActiveSignalId(null);
            setSection('messages');
            setActiveChat(threadId);
          }}
          onViewTask={taskId => navigate('/command-center/operations-queue', { state: { highlightTaskId: taskId } })}
        />
      )}
    </div>
  );
};

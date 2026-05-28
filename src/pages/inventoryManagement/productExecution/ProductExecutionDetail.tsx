import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import CheckOutlined from '@mui/icons-material/Check';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import LaunchOutlined from '@mui/icons-material/LaunchOutlined';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import AutoFixHighOutlined from '@mui/icons-material/AutoFixHighOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedOutlined from '@mui/icons-material/RadioButtonUnchecked';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ElectricBoltOutlined from '@mui/icons-material/ElectricBoltOutlined';
import SyncOutlined from '@mui/icons-material/SyncOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import NotificationsActiveOutlined from '@mui/icons-material/NotificationsActiveOutlined';
import { Button, Badge } from 'impact-ui';
import { ImFilterSelect } from '../../../components/common/ImFilterSelect';
import {
  PEX_TASKS,
  PEX_SOURCE_LABELS,
  PEX_STATUS_LABELS,
  DISMISS_REASONS_PEX,
  PEX_ISSUE_TYPES,
  type PexSource,
  type PexStatus,
  type PexPriority,
  type PexTask,
  type PexFindings,
  type PexAuditEntry,
  type InventorySmartAction,
  type InventorySmartActionStatus,
} from './pexMockData';
import './ProductExecution.css';

// ── Badge color type ──────────────────────────────────────────────────────
type BadgeColor = 'error' | 'warning' | 'info' | 'success' | 'default';

// ── Source & status color maps ────────────────────────────────────────────
const SOURCE_ICON: Record<PexSource, React.ReactNode> = {
  top_performing: <TrendingUpOutlined sx={{ fontSize: 13 }} />,
  emerging:       <AutoAwesomeOutlined sx={{ fontSize: 13 }} />,
  at_risk:        <WarningAmberOutlined sx={{ fontSize: 13 }} />,
  boh_sync:       <InventoryOutlined sx={{ fontSize: 13 }} />,
  phantom_stock:  <ShieldOutlined sx={{ fontSize: 13 }} />,
  pog_compliance: <GridViewOutlined sx={{ fontSize: 13 }} />,
};

const SOURCE_COLOR: Record<PexSource, BadgeColor> = {
  top_performing: 'success',
  emerging:       'info',
  at_risk:        'error',
  boh_sync:       'warning',
  phantom_stock:  'info',
  pog_compliance: 'default',
};

const STATUS_COLOR: Record<PexStatus, BadgeColor> = {
  open:        'info',
  in_progress: 'warning',
  overdue:     'error',
  escalated:   'error',
  resolved:    'success',
  dismissed:   'default',
};

const PRIORITY_COLOR: Record<PexPriority, BadgeColor> = {
  High:   'error',
  Medium: 'warning',
  Low:    'default',
};

// ── AI Analysis mock ──────────────────────────────────────────────────────
function getAIAnalysis(source: PexSource) {
  if (source === 'boh_sync')     return { presence: 'Not detected', shelfGap: 'Full gap — 0 units visible', facingCount: '0 of 4 expected', placement: 'N/A', pogMatch: 'N/A — gap present', pricingSignage: 'Price tag present', confidence: 94 };
  if (source === 'phantom_stock') return { presence: 'Not clearly visible', shelfGap: 'Partial gap detected', facingCount: '1 of 4 expected', placement: 'Misplaced — Aisle 3, Bay 5', pogMatch: 'Mismatch detected', pricingSignage: 'Missing signage', confidence: 81 };
  if (source === 'pog_compliance') return { presence: 'Detected', shelfGap: 'No gap', facingCount: '3 of 6 expected', placement: 'Incorrect — 2 bays left of POG position', pogMatch: 'Mismatch — incorrect bay', pricingSignage: 'Price tag present', confidence: 87 };
  return { presence: 'Detected', shelfGap: 'No gap detected', facingCount: '4 of 4 expected', placement: 'Correct shelf position', pogMatch: 'Compliant', pricingSignage: 'Price tag present', confidence: 88 };
}

function needsAI(source: PexSource) {
  return ['boh_sync', 'phantom_stock', 'pog_compliance', 'top_performing', 'at_risk', 'emerging'].includes(source);
}

function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Yes / No compact select ────────────────────────────────────────────────
const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No'  },
];

function PexYesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  const strVal = value === true ? 'yes' : value === false ? 'no' : '';
  return (
    <div className={`pex-yn-wrap${value === true ? ' pex-yn--yes' : value === false ? ' pex-yn--no' : ''}`}>
      <ImFilterSelect
        placeholder="Select"
        value={strVal || 'Select'}
        options={[{ value: 'Select', label: '— Select' }, ...YES_NO_OPTIONS]}
        minWidth={120}
        isClearable={false}
        onChange={v => {
          if (v === 'yes') onChange(true);
          else if (v === 'no') onChange(false);
        }}
      />
    </div>
  );
}

// ── SVG Sales Chart ───────────────────────────────────────────────────────
interface PexSalesChartProps { salesTrend: Array<{ week: string; store: number; cluster: number; chain: number }>; }

function PexSalesChart({ salesTrend }: PexSalesChartProps) {
  const CHART_H      = 160;         // compact height — no wasted white space
  const GROUP_W      = 80;          // comfortable group width
  const BAR_W        = 20;          // solid bar width
  const BAR_GAP      = 4;
  const Y_AXIS_W     = 38;
  const X_LABEL_H    = 26;
  const TOP_PAD      = 18;
  const totalW       = Y_AXIS_W + salesTrend.length * GROUP_W;
  const svgH         = CHART_H + X_LABEL_H + TOP_PAD;

  const maxVal = Math.max(...salesTrend.flatMap(w => [w.store, w.cluster, w.chain]), 1);
  const yMax = Math.ceil((maxVal * 1.15) / 10) * 10;
  const gridLines = 4;              // fewer gridlines = less visual noise

  function toY(v: number) {
    return TOP_PAD + CHART_H - (v / yMax) * CHART_H;
  }

  const COLORS = {
    store:   '#6366f1',   // indigo
    cluster: '#a78bfa',   // violet
    chain:   '#d1d5db',   // gray-300
  };

  // rounded top only (simulate with clip path approach via rx on top half)
  function barPath(x: number, y: number, w: number, h: number, r = 4): string {
    if (h <= r * 2) r = h / 2;
    return `M${x + r},${y} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - r} h${-w} v${-(h - r)} a${r},${r} 0 0 1 ${r},${-r}Z`;
  }

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalW} ${svgH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible', maxHeight: 230 }}
    >
      {/* Subtle background stripes */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const val = Math.round((yMax / gridLines) * i);
        const y   = toY(val);
        return (
          <g key={i}>
            <line
              x1={Y_AXIS_W} y1={y} x2={totalW} y2={y}
              stroke={i === 0 ? '#e2e8f0' : '#f1f5f9'}
              strokeWidth={i === 0 ? 1.5 : 1}
              strokeDasharray={i === 0 ? undefined : '3 3'}
            />
            <text
              x={Y_AXIS_W - 8} y={y + 4}
              textAnchor="end" fontSize={11} fill="#94a3b8"
              fontFamily="inherit" fontWeight="500"
            >{val}</text>
          </g>
        );
      })}

      {/* Bars per group */}
      {salesTrend.map((w, gi) => {
        const groupX = Y_AXIS_W + gi * GROUP_W;
        const innerW = 3 * BAR_W + 2 * BAR_GAP;
        const startX = groupX + (GROUP_W - innerW) / 2;
        const bars = [
          { val: w.store,   color: COLORS.store,   x: startX },
          { val: w.cluster, color: COLORS.cluster, x: startX + BAR_W + BAR_GAP },
          { val: w.chain,   color: COLORS.chain,   x: startX + (BAR_W + BAR_GAP) * 2 },
        ];
        const groupCx = groupX + GROUP_W / 2;
        return (
          <g key={w.week}>
            {bars.map(b => {
              const rawH = (b.val / yMax) * CHART_H;
              const barH = b.val === 0 ? 3 : Math.max(6, rawH);
              const barY = toY(b.val === 0 ? 0 : b.val);
              const adjustedY = b.val === 0 ? TOP_PAD + CHART_H - 3 : barY;
              return (
                <g key={b.color}>
                  <path
                    d={barPath(b.x, adjustedY, BAR_W, barH, b.val === 0 ? 1 : 5)}
                    fill={b.val === 0 ? '#e2e8f0' : b.color}
                    opacity={b.val === 0 ? 0.6 : 0.9}
                  />
                  {b.val > 0 && (
                    <text
                      x={b.x + BAR_W / 2} y={adjustedY - 6}
                      textAnchor="middle"
                      fontSize={10.5}
                      fill={b.color}
                      fontWeight="700"
                      fontFamily="inherit"
                    >{b.val}</text>
                  )}
                </g>
              );
            })}
            {/* Week label */}
            <text
              x={groupCx} y={CHART_H + TOP_PAD + 18}
              textAnchor="middle" fontSize={11.5} fill="#64748b"
              fontFamily="inherit" fontWeight="600"
            >{w.week}</text>
          </g>
        );
      })}

      {/* Y-axis baseline */}
      <line
        x1={Y_AXIS_W} y1={TOP_PAD}
        x2={Y_AXIS_W} y2={TOP_PAD + CHART_H}
        stroke="#e2e8f0" strokeWidth={1.5}
      />
    </svg>
  );
}

// ── InventorySmart Auto-Actions Panel ─────────────────────────────────────
const IS_STATUS_META: Record<InventorySmartActionStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  completed: { label: 'Done',    color: '#16a34a', bg: '#f0fdf4', icon: <TaskAltOutlined sx={{ fontSize: 14 }} /> },
  pending:   { label: 'On Resolve', color: '#7c3aed', bg: '#f5f3ff', icon: <SyncOutlined    sx={{ fontSize: 14 }} /> },
  active:    { label: 'Active',  color: '#2563eb', bg: '#eff6ff', icon: <ElectricBoltOutlined sx={{ fontSize: 14 }} /> },
  ready:     { label: 'Ready',   color: '#d97706', bg: '#fffbeb', icon: <NotificationsActiveOutlined sx={{ fontSize: 14 }} /> },
};

interface InventorySmartPanelProps {
  actions: InventorySmartAction[];
  isResolved: boolean;
  title?: string;
  subtitle?: string;
}

function InventorySmartPanel({ actions, isResolved, title, subtitle }: InventorySmartPanelProps) {
  const resolvedActions = isResolved
    ? actions.map(a => ({ ...a, status: 'completed' as InventorySmartActionStatus }))
    : actions;

  return (
    <div className="pex-is-panel">
      <div className="pex-is-panel-header">
        <div className="pex-is-panel-icon-wrap">
          <ElectricBoltOutlined sx={{ fontSize: 16 }} />
        </div>
        <div>
          <div className="pex-is-panel-title">{title ?? 'InventorySmart Auto-Actions'}</div>
          <div className="pex-is-panel-sub">
            {subtitle ?? (isResolved
              ? 'All automated actions completed — no manual steps required.'
              : 'These actions trigger automatically when this task is resolved. No manual steps required.')}
          </div>
        </div>
        <div className="pex-is-panel-badge">
          <ElectricBoltOutlined sx={{ fontSize: 11 }} />
          InventorySmart
        </div>
      </div>
      <div className="pex-is-actions-list">
        {resolvedActions.map((a, i) => {
          const meta = IS_STATUS_META[a.status];
          return (
            <div key={i} className="pex-is-action-row">
              <div className="pex-is-action-dot" style={{ background: meta.bg, color: meta.color }}>
                {meta.icon}
              </div>
              <div className="pex-is-action-body">
                <div className="pex-is-action-text">{a.action}</div>
                <div className="pex-is-action-detail">{a.detail}</div>
              </div>
              <div className="pex-is-action-status" style={{ color: meta.color, background: meta.bg }}>
                {meta.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step definitions ──────────────────────────────────────────────────────
const STEPS = [
  { label: 'Overview',          icon: <BarChartOutlined sx={{ fontSize: 16 }} /> },
  { label: 'Findings & Evidence', icon: <AssignmentTurnedInOutlined sx={{ fontSize: 16 }} /> },
  { label: 'Resolution',        icon: <CheckCircleOutlineOutlined sx={{ fontSize: 16 }} /> },
];

// ── Main Component ────────────────────────────────────────────────────────
export const ProductExecutionDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const baseTask = PEX_TASKS.find(t => t.id === taskId);

  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState<PexTask | null>(baseTask ?? null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);
  const [findingsTab, setFindingsTab] = useState<'info' | 'issues'>('info');
  const [localFindings, setLocalFindings] = useState<PexFindings>(
    baseTask?.findings ?? {
      stockReceived:   null,
      inBackroom:      null,
      onShelf:         null,
      displaySetup:    null,
      displayHasIssues: null,
      labourShortage:  null,
      rackNumber:      '',
      shelfPosition:   '',
      notes:           '',
      selectedIssues:  [],
      uploadedImages:  [],
    },
  );
  const [auditTrail, setAuditTrail] = useState<PexAuditEntry[]>(baseTask?.auditTrail ?? []);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissReason, setDismissReason] = useState('');
  const [aiAnalysisShown, setAiAnalysisShown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isStepLoading, setIsStepLoading] = useState(false);

  function goToStep(idx: number) {
    setIsStepLoading(true);
    setTimeout(() => {
      setCurrentStep(idx);
      setIsStepLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 650);
  }
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="pex-detail-page">
        <div className="pex-loading">
          <div className="pex-loading-spinner" />
          <p>Loading Task Details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="pex-detail-page">
        <div className="pex-breadcrumb">
          <Button variant="text" color="primary" onClick={() => navigate('/inventory-management/product-execution')}>
            <ArrowBackOutlined sx={{ fontSize: 16 }} />&nbsp;&nbsp;Back to Product Execution
          </Button>
        </div>
        <div className="pex-empty">
          <div className="pex-empty-icon"><InventoryOutlined sx={{ fontSize: 26 }} /></div>
          <p className="pex-empty-title">Task not found</p>
          <p className="pex-empty-sub">This task may have been removed or the ID is incorrect.</p>
        </div>
      </div>
    );
  }

  const aiAnalysis   = getAIAnalysis(task.source);
  const hasAiTrigger = needsAI(task.source);
  const safeTask     = task;

  // ── helpers ───────────────────────────────────────────────────────────
  function setBool(field: keyof PexFindings, val: boolean) {
    setLocalFindings(f => ({ ...f, [field]: val }));
  }

  function toggleIssue(issue: string) {
    setLocalFindings(f => ({
      ...f,
      selectedIssues: f.selectedIssues.includes(issue)
        ? f.selectedIssues.filter(i => i !== issue)
        : [...f.selectedIssues, issue],
    }));
  }

  function addAudit(action: string, user = 'Store Manager') {
    setAuditTrail(trail => [...trail, { timestamp: new Date().toISOString(), action, user }]);
  }

  function handleImageUpload(files: FileList | null) {
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach(file => {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        urls.push(URL.createObjectURL(file));
      }
    });
    if (urls.length > 0) {
      setLocalFindings(f => ({ ...f, uploadedImages: [...f.uploadedImages, ...urls] }));
      addAudit(`Image uploaded (${urls.length} file${urls.length > 1 ? 's' : ''})`);
      if (safeTask && needsAI(safeTask.source)) {
        setTimeout(() => {
          setAiAnalysisShown(true);
          addAudit('AI shelf analysis completed — confidence ' + aiAnalysis.confidence + '%', 'System (AI)');
        }, 1200);
      }
    }
  }

  function removeImage(idx: number) {
    setLocalFindings(f => ({ ...f, uploadedImages: f.uploadedImages.filter((_, i) => i !== idx) }));
  }

  function handleSaveFindings() {
    addAudit('Findings saved');
    setShowSuccessModal(true);
  }

  function handleMarkInProgress() {
    setTask(t => t ? { ...t, status: 'in_progress' } : t);
    addAudit('Status changed to In Progress');
  }

  function handleMarkResolved() {
    setTask(t => t ? { ...t, status: 'resolved' } : t);
    addAudit('Task marked Resolved');
  }

  function handleEscalate() {
    setTask(t => t ? { ...t, status: 'escalated' } : t);
    addAudit('Task escalated to District Manager');
  }

  function handleDismissConfirm() {
    if (!dismissReason) return;
    setTask(t => t ? { ...t, status: 'dismissed' } : t);
    addAudit(`Task dismissed — Reason: ${dismissReason}`);
    setShowDismissModal(false);
    setDismissReason('');
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="pex-detail-page">

      {/* ── Back nav ───────────────────────────────────────────────────── */}
      <div className="pex-breadcrumb">
        <Button
          variant="text"
          color="primary"
          onClick={() => navigate('/inventory-management/product-execution')}
        >
          <ArrowBackOutlined sx={{ fontSize: 16 }} />&nbsp;&nbsp;Back to Product Execution
        </Button>
      </div>

      {/* ── Product Hero Header ─────────────────────────────────────────── */}
      <div className="pex-hero-header">
        <div className="pex-hero-left">
          {task.productImage ? (
            <img src={task.productImage} alt="" className="pex-hero-img" />
          ) : (
            <div className="pex-hero-img-placeholder">
              <InventoryOutlined sx={{ fontSize: 28 }} />
            </div>
          )}
          <div className="pex-hero-info">
            <div className="pex-hero-badges">
              <Badge label={PEX_SOURCE_LABELS[task.source]} color={SOURCE_COLOR[task.source]} size="small" variant="subtle" isIcon icon={SOURCE_ICON[task.source]} />
              <Badge label={task.priority} color={PRIORITY_COLOR[task.priority]} size="small" variant="subtle" />
              <Badge label={PEX_STATUS_LABELS[task.status]} color={STATUS_COLOR[task.status]} size="small" variant="subtle" />
            </div>
            <h2 className="pex-hero-name">{task.productName}</h2>
            <div className="pex-hero-meta">
              <span className="pex-hero-sku">{task.sku}</span>
              <span className="pex-hero-meta-sep"/>
              <StoreOutlined sx={{ fontSize: 13 }} /><span>{task.storeName}</span>
              <span className="pex-hero-meta-sep"/>
              <PersonOutlined sx={{ fontSize: 13 }} /><span>{task.owner}</span>
              <span className="pex-hero-meta-sep"/>
              <ScheduleOutlined sx={{ fontSize: 13 }} /><span>Due {task.dueDate}</span>
              <span className="pex-hero-meta-sep"/>
              <LinkOutlined sx={{ fontSize: 12 }} /><span className="pex-hero-task-id">{task.linkedTaskId}</span>
            </div>
          </div>
        </div>
        <div className="pex-hero-kpis">
          <div className="pex-hero-kpi">
            <span className="pex-hero-kpi-label">Department</span>
            <span className="pex-hero-kpi-value">{task.department}</span>
          </div>
          <div className="pex-hero-kpi">
            <span className="pex-hero-kpi-label">Sub-Dept · Class</span>
            <span className="pex-hero-kpi-value">{task.subDepartment} · {task.itemClass}</span>
          </div>
          <div className="pex-hero-kpi">
            <span className="pex-hero-kpi-label">{task.opportunityValue ? 'Opportunity' : 'Risk Value'}</span>
            <span className={`pex-hero-kpi-value ${task.opportunityValue ? 'pex-hero-kpi--positive' : 'pex-hero-kpi--negative'}`}>
              {task.opportunityValue
                ? `+$${task.opportunityValue.toLocaleString()}`
                : `-$${task.riskValue?.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Step Progress Bar ───────────────────────────────────────────── */}
      <div className="pex-stepper">
        {STEPS.map((step, idx) => {
          const done    = idx < currentStep;
          const active  = idx === currentStep;
          return (
            <React.Fragment key={step.label}>
              <button
                className={`pex-step${active ? ' pex-step--active' : ''}${done ? ' pex-step--done' : ''}`}
                onClick={() => idx !== currentStep && goToStep(idx)}
              >
                <div className="pex-step-circle">
                  {done ? <CheckOutlined sx={{ fontSize: 13 }} /> : step.icon}
                </div>
                <div className="pex-step-label">{step.label}</div>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`pex-step-connector${done ? ' pex-step-connector--done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* STEP 0 — Overview                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {currentStep === 0 && (
        <>
          {/* Performance KPIs */}
          <div className="pex-section">
            <div className="pex-section-header">
              <BarChartOutlined sx={{ fontSize: 17 }} />
              <h3 className="pex-section-title">Performance &amp; Benchmark</h3>
            </div>

            <div className="sc-inv-summary pex-perf-summary">
              <div className="sc-inv-summary-tile sc-inv-summary--total">
                <span className="sc-inv-summary-label">This Store (Units/Wk)</span>
                <span className="sc-inv-summary-value">{task.storeWeeklySales}</span>
                <span className="sc-inv-summary-sub">latest week</span>
              </div>
              <div className="sc-inv-summary-tile sc-inv-summary--info">
                <span className="sc-inv-summary-label">Cluster Avg (Units/Wk)</span>
                <span className="sc-inv-summary-value">{task.clusterAvgSales}</span>
                <span className="sc-inv-summary-sub">store vs cluster</span>
              </div>
              <div className="sc-inv-summary-tile sc-inv-summary--warn">
                <span className="sc-inv-summary-label">Chain Avg (Units/Wk)</span>
                <span className="sc-inv-summary-value">{task.chainAvgSales}</span>
                <span className="sc-inv-summary-sub">store vs chain</span>
              </div>
              <div className={`sc-inv-summary-tile ${task.performanceGap >= 0 ? 'sc-inv-summary--success' : 'sc-inv-summary--critical'}`}>
                <span className="sc-inv-summary-label">Performance Gap</span>
                <span className="sc-inv-summary-value">{task.performanceGap >= 0 ? '+' : ''}{task.performanceGap}</span>
                <span className="sc-inv-summary-sub">{task.performanceGap >= 0 ? 'above cluster' : 'below cluster'}</span>
              </div>
            </div>

            {/* 6-Week Sales Trend — premium SVG chart + comparison sidebar */}
            <div className="pex-chart-layout">
              <div className="pex-chart-main">
                <div className="pex-trend-title">6-Week Sales Trend (Units/Week)</div>
                <PexSalesChart salesTrend={task.salesTrend} />
                <div className="pex-sales-legend">
                  <span className="pex-sales-legend-item"><span className="pex-sales-legend-dot" style={{ background: '#4f46e5' }} /> This Store</span>
                  <span className="pex-sales-legend-item"><span className="pex-sales-legend-dot" style={{ background: '#a78bfa' }} /> Cluster Avg</span>
                  <span className="pex-sales-legend-item"><span className="pex-sales-legend-dot" style={{ background: '#cbd5e1' }} /> Chain Avg</span>
                </div>
              </div>
              <div className="pex-chart-sidebar">
                <div className="pex-avg-card-title">
                  <BarChartOutlined sx={{ fontSize: 16 }} />
                  <span>Average Sales</span>
                  <span className="pex-avg-card-subtitle">last 6 weeks</span>
                </div>

                <div className="pex-avg-stat-list">
                  {[
                    {
                      label: 'This Store',
                      value: Math.round(task.salesTrend.reduce((s, w) => s + w.store, 0) / task.salesTrend.length),
                      color: '#6366f1',
                      icon: <StoreOutlined sx={{ fontSize: 16 }} />,
                      bg: '#eef2ff',
                    },
                    {
                      label: 'Cluster Avg',
                      value: Math.round(task.salesTrend.reduce((s, w) => s + w.cluster, 0) / task.salesTrend.length),
                      color: '#7c3aed',
                      icon: <BarChartOutlined sx={{ fontSize: 16 }} />,
                      bg: '#f5f3ff',
                    },
                    {
                      label: 'Chain Avg',
                      value: Math.round(task.salesTrend.reduce((s, w) => s + w.chain, 0) / task.salesTrend.length),
                      color: '#64748b',
                      icon: <GridViewOutlined sx={{ fontSize: 16 }} />,
                      bg: '#f8fafc',
                    },
                  ].map(row => (
                    <div key={row.label} className="pex-avg-stat-row">
                      <div className="pex-avg-stat-icon" style={{ background: row.bg, color: row.color }}>
                        {row.icon}
                      </div>
                      <span className="pex-avg-stat-label">{row.label}</span>
                      <span className="pex-avg-stat-value" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className={`pex-avg-gap-tile ${task.performanceGap >= 0 ? 'pex-avg-gap-tile--pos' : 'pex-avg-gap-tile--neg'}`}>
                  <span className="pex-avg-gap-tile-label">Performance Gap vs Cluster</span>
                  <span className="pex-avg-gap-tile-value">
                    {task.performanceGap >= 0 ? '+' : ''}{task.performanceGap}
                    <span className="pex-avg-gap-tile-unit"> units/wk</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Context boxes */}
            <div className="pex-context-row">
              <div className="pex-rec-box">
                <div className="pex-rec-box-header">
                  <AutoFixHighOutlined sx={{ fontSize: 16 }} />
                  <span className="pex-rec-box-label">Recommended Action</span>
                </div>
                <div className="pex-rec-box-text">{task.recommendedAction}</div>
              </div>
              <div className="pex-opp-box">
                <div className="pex-opp-box-header">
                  <AutoAwesomeOutlined sx={{ fontSize: 16 }} />
                  <span className="pex-opp-box-label">AI System Insight</span>
                </div>
                <div className="pex-opp-box-text">{task.opportunityExplanation}</div>
              </div>
            </div>

            {/* InventorySmart panel — show on overview for all tasks with IS actions */}
            {task.inventorySmartActions && task.inventorySmartActions.length > 0 && (
              <InventorySmartPanel
                actions={task.inventorySmartActions}
                isResolved={task.status === 'resolved'}
                title={task.source === 'phantom_stock' || task.source === 'boh_sync'
                  ? 'InventorySmart — What Happens When You Resolve This'
                  : 'InventorySmart — Proactive Actions Ready'}
                subtitle={task.source === 'phantom_stock' || task.source === 'boh_sync'
                  ? 'Resolve this task in 8 minutes. InventorySmart auto-corrects inventory records, recalibrates replenishment, and schedules follow-up — no cycle count required.'
                  : task.status === 'resolved'
                    ? 'All automated actions completed by InventorySmart.'
                    : 'InventorySmart has pre-staged these actions. Review and approve as needed.'}
              />
            )}

            {/* Inventory mismatch callout for phantom_stock */}
            {task.source === 'phantom_stock' && task.bohUnits != null && (
              <div className="pex-mismatch-callout">
                <div className="pex-mismatch-callout-icon">
                  <ShieldOutlined sx={{ fontSize: 20 }} />
                </div>
                <div className="pex-mismatch-callout-body">
                  <div className="pex-mismatch-callout-title">Digital vs Physical Inventory Mismatch Detected</div>
                  <div className="pex-mismatch-callout-row">
                    <div className="pex-mismatch-stat">
                      <span className="pex-mismatch-stat-label">Digital (System)</span>
                      <span className="pex-mismatch-stat-value pex-mismatch-stat--warn">{task.bohUnits} units</span>
                      <span className="pex-mismatch-stat-sub">on-hand per system</span>
                    </div>
                    <div className="pex-mismatch-divider" />
                    <div className="pex-mismatch-stat">
                      <span className="pex-mismatch-stat-label">Physical (Floor)</span>
                      <span className="pex-mismatch-stat-value pex-mismatch-stat--critical">0 units</span>
                      <span className="pex-mismatch-stat-sub">visible on shelf</span>
                    </div>
                    <div className="pex-mismatch-divider" />
                    <div className="pex-mismatch-stat">
                      <span className="pex-mismatch-stat-label">Days Since Last Sale</span>
                      <span className="pex-mismatch-stat-value pex-mismatch-stat--critical">{task.daysSinceLastSale ?? 0}</span>
                      <span className="pex-mismatch-stat-sub">consecutive zero-sales</span>
                    </div>
                    <div className="pex-mismatch-divider" />
                    <div className="pex-mismatch-stat">
                      <span className="pex-mismatch-stat-label">Opportunity Cost</span>
                      <span className="pex-mismatch-stat-value pex-mismatch-stat--critical">-${task.riskValue?.toLocaleString()}/wk</span>
                      <span className="pex-mismatch-stat-sub">vs cluster velocity</span>
                    </div>
                  </div>
                  <div className="pex-mismatch-callout-note">
                    Fix this in 8 minutes. InventorySmart recalibrates inventory, replenishment, and cycle count — automatically.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pex-step-nav">
            <Button variant="primary" onClick={() => goToStep(1)} disabled={isStepLoading}>
              {isStepLoading
                ? <span className="pex-step-btn-loading"><span className="pex-step-btn-spinner" />Loading…</span>
                : 'Next: Findings & Evidence →'}
            </Button>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* STEP 1 — Findings & Evidence                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <>
          {/* Findings section */}
          <div className="pex-section">
            <div className="pex-section-header">
              <AssignmentTurnedInOutlined sx={{ fontSize: 17 }} />
              <h3 className="pex-section-title">Findings</h3>
            </div>

            <div className="pex-findings-tabs">
              <button
                className={`pex-findings-tab${findingsTab === 'info' ? ' pex-findings-tab--active' : ''}`}
                onClick={() => setFindingsTab('info')}
              >
                Information
              </button>
              <button
                className={`pex-findings-tab${findingsTab === 'issues' ? ' pex-findings-tab--active' : ''}`}
                onClick={() => setFindingsTab('issues')}
              >
                Issues {localFindings.selectedIssues.length > 0 && `(${localFindings.selectedIssues.length})`}
              </button>
            </div>

            {findingsTab === 'info' && (
              <div className="pex-findings-info">
                <div className="pex-info-grid">
                  {([
                    ['stockReceived',    'Stock received?',               'Confirm stock has been received at store'],
                    ['inBackroom',       'Product available in backroom?', 'Is there back-stock in the storeroom'],
                    ['onShelf',          'Product present on shelf?',      'Can the product be found on the shelf'],
                    ['displaySetup',     'Display setup completed?',       'Is the display fully assembled and stocked'],
                    ['displayHasIssues', 'Display has issues?',            'Are there any structural or visual problems'],
                    ['labourShortage',   'Labour shortage?',               'Is store short-staffed for replenishment'],
                  ] as [keyof PexFindings, string, string][]).map(([field, label, hint]) => (
                    <div key={field} className="pex-checklist-row">
                      <div className="pex-checklist-row-left">
                        <span className="pex-checklist-label">{label}</span>
                        <span className="pex-checklist-hint">{hint}</span>
                      </div>
                      <PexYesNo value={localFindings[field] as boolean | null} onChange={v => setBool(field, v)} />
                    </div>
                  ))}
                </div>

                <div className="pex-text-fields">
                  <div className="pex-text-field-row">
                    <label className="pex-text-field-label">Rack Number</label>
                    <input className="pex-text-input" placeholder="e.g. R-12"
                      value={localFindings.rackNumber}
                      onChange={e => setLocalFindings(f => ({ ...f, rackNumber: e.target.value }))} />
                  </div>
                  <div className="pex-text-field-row">
                    <label className="pex-text-field-label">Shelf Position</label>
                    <input className="pex-text-input" placeholder="e.g. Eye level, Bay 3"
                      value={localFindings.shelfPosition}
                      onChange={e => setLocalFindings(f => ({ ...f, shelfPosition: e.target.value }))} />
                  </div>
                  <div className="pex-text-field-row pex-text-field-row--full">
                    <label className="pex-text-field-label">Notes <span className="pex-text-field-optional">optional</span></label>
                    <textarea className="pex-textarea" placeholder="Add any relevant observations — shelf condition, customer feedback, blockages…"
                      value={localFindings.notes}
                      onChange={e => setLocalFindings(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {findingsTab === 'issues' && (
              <div>
                <p className="pex-issues-hint">Select all issues observed during your physical inspection.</p>
                <div className="pex-issues-grid">
                  {PEX_ISSUE_TYPES.map(issue => {
                    const selected = localFindings.selectedIssues.includes(issue);
                    return (
                      <div key={issue} className={`pex-issue-card${selected ? ' pex-issue-card--selected' : ''}`} onClick={() => toggleIssue(issue)}>
                        <div className={`pex-issue-checkbox${selected ? ' pex-issue-checkbox--checked' : ''}`}>
                          {selected && <CheckOutlined sx={{ fontSize: 12 }} />}
                        </div>
                        <span className="pex-issue-label">{issue}</span>
                      </div>
                    );
                  })}
                </div>
                {localFindings.selectedIssues.length > 0 && (
                  <div className="pex-issues-selected-bar">
                    <span className="pex-issues-selected-count">{localFindings.selectedIssues.length} issue{localFindings.selectedIssues.length > 1 ? 's' : ''} selected</span>
                    <button className="pex-issues-clear" onClick={() => setLocalFindings(f => ({ ...f, selectedIssues: [] }))}>Clear all</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Evidence upload section */}
          <div className="pex-section">
            <div className="pex-section-header">
              <CameraAltOutlined sx={{ fontSize: 17 }} />
              <h3 className="pex-section-title">Evidence — Upload Shelf / Rack Image</h3>
              {hasAiTrigger && (
                <span className="pex-ai-badge pex-ai-badge--header" style={{ marginLeft: 'auto' }}>
                  <AutoFixHighOutlined sx={{ fontSize: 12 }} /> AI Analysis Enabled
                </span>
              )}
            </div>

            {localFindings.uploadedImages.length > 0 && (
              <div className="pex-uploaded-images">
                {localFindings.uploadedImages.map((src, i) => (
                  <div key={i} className="pex-uploaded-img-wrap">
                    <img src={src} alt="" className="pex-uploaded-img" />
                    <button className="pex-img-remove" onClick={() => removeImage(i)}>
                      <CloseOutlined sx={{ fontSize: 12 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`pex-upload-zone${isDragOver ? ' pex-upload-zone--drag' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => { e.preventDefault(); setIsDragOver(false); handleImageUpload(e.dataTransfer.files); }}
            >
              <div className="pex-upload-icon-wrap">
                <div className="pex-upload-icon"><CloudUploadOutlined sx={{ fontSize: 28 }} /></div>
              </div>
              <div className="pex-upload-title">Drop images here or <span className="pex-upload-link">click to browse</span></div>
              <div className="pex-upload-sub">Photos are attached to the linked Operations Queue task • {task.linkedTaskId}</div>
              <div className="pex-upload-formats">
                {['JPEG', 'PNG', 'WEBP'].map(f => <span key={f} className="pex-fmt-badge">{f}</span>)}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
              style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files)} />

            {aiAnalysisShown && hasAiTrigger && (
              <div className="pex-ai-analysis">
                <div className="pex-ai-analysis-header">
                  <span className="pex-ai-badge"><AutoFixHighOutlined sx={{ fontSize: 12 }} /> AI Shelf Analysis</span>
                  <span className="pex-ai-analysis-title">Detection Results</span>
                </div>
                <div className="pex-ai-findings-grid">
                  {[
                    ['Product Presence', aiAnalysis.presence],
                    ['Shelf Gap',        aiAnalysis.shelfGap],
                    ['Facing Count',     aiAnalysis.facingCount],
                    ['Placement',        aiAnalysis.placement],
                    ['POG Match',        aiAnalysis.pogMatch],
                    ['Pricing / Signage',aiAnalysis.pricingSignage],
                  ].map(([label, value]) => (
                    <div key={label} className="pex-ai-finding">
                      <div className="pex-ai-finding-label">{label}</div>
                      <div className="pex-ai-finding-value">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="pex-ai-confidence">
                  <span className="pex-ai-confidence-label">Image Confidence</span>
                  <div className="pex-ai-confidence-bar">
                    <div className="pex-ai-confidence-fill" style={{ width: `${aiAnalysis.confidence}%` }} />
                  </div>
                  <span className="pex-ai-confidence-pct">{aiAnalysis.confidence}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="pex-step-nav pex-step-nav--split">
            <Button variant="outlined" onClick={() => setCurrentStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => goToStep(2)} disabled={isStepLoading}>
              {isStepLoading
                ? <span className="pex-step-btn-loading"><span className="pex-step-btn-spinner" />Loading…</span>
                : 'Next: Resolution →'}
            </Button>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* STEP 2 — Resolution                                             */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <>
          {/* Task status summary */}
          <div className="pex-section">
            <div className="pex-section-header">
              <CheckCircleOutlineOutlined sx={{ fontSize: 17 }} />
              <h3 className="pex-section-title">Review &amp; Resolution</h3>
              <div style={{ marginLeft: 'auto' }}>
                <Badge label={PEX_STATUS_LABELS[task.status]} color={STATUS_COLOR[task.status]} size="small" variant="subtle" />
              </div>
            </div>

            {/* Status context banner */}
            <div className="pex-status-banner">
              <div className="pex-status-banner-left">
                <div className="pex-status-banner-icon">
                  <AssignmentTurnedInOutlined sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <div className="pex-status-banner-title">Task linked to Operations Queue</div>
                  <div className="pex-status-banner-sub">
                    All findings and status changes sync automatically to <span className="pex-status-banner-id">{task.linkedTaskId}</span>
                  </div>
                </div>
              </div>
              <Button variant="outlined" color="primary" onClick={() => navigate('/command-center/operations-queue')}>
                <LaunchOutlined sx={{ fontSize: 14 }} />&nbsp;Open Queue Task
              </Button>
            </div>

            {/* Action grid */}
            <div className="pex-action-grid">
              <button className="pex-action-card pex-action-card--primary" onClick={handleSaveFindings}>
                <div className="pex-action-card-icon pex-action-card-icon--primary"><CheckOutlined sx={{ fontSize: 20 }} /></div>
                <div className="pex-action-card-body">
                  <div className="pex-action-card-title">Save &amp; Submit Findings</div>
                  <div className="pex-action-card-desc">Persist all findings and sync to Operations Queue</div>
                </div>
              </button>

              {task.status === 'open' && (
                <button className="pex-action-card pex-action-card--blue" onClick={handleMarkInProgress}>
                  <div className="pex-action-card-icon pex-action-card-icon--blue"><HistoryOutlined sx={{ fontSize: 20 }} /></div>
                  <div className="pex-action-card-body">
                    <div className="pex-action-card-title">Mark In Progress</div>
                    <div className="pex-action-card-desc">Acknowledge and begin working on this task</div>
                  </div>
                </button>
              )}

              {(task.status === 'open' || task.status === 'in_progress') && (
                <button className="pex-action-card pex-action-card--green" onClick={handleMarkResolved}>
                  <div className="pex-action-card-icon pex-action-card-icon--green"><CheckCircleOutlineOutlined sx={{ fontSize: 20 }} /></div>
                  <div className="pex-action-card-body">
                    <div className="pex-action-card-title">Mark Resolved</div>
                    <div className="pex-action-card-desc">Issue has been corrected and shelves are compliant</div>
                  </div>
                </button>
              )}

              {task.status !== 'escalated' && task.status !== 'resolved' && task.status !== 'dismissed' && (
                <button className="pex-action-card pex-action-card--orange" onClick={handleEscalate}>
                  <div className="pex-action-card-icon pex-action-card-icon--orange"><FlagOutlined sx={{ fontSize: 20 }} /></div>
                  <div className="pex-action-card-body">
                    <div className="pex-action-card-title">Escalate to District Manager</div>
                    <div className="pex-action-card-desc">Requires DM attention or store-level resource</div>
                  </div>
                </button>
              )}

              {task.status !== 'resolved' && task.status !== 'dismissed' && (
                <button className="pex-action-card pex-action-card--red" onClick={() => setShowDismissModal(true)}>
                  <div className="pex-action-card-icon pex-action-card-icon--red"><BlockOutlined sx={{ fontSize: 20 }} /></div>
                  <div className="pex-action-card-body">
                    <div className="pex-action-card-title">Dismiss with Reason</div>
                    <div className="pex-action-card-desc">Close task — not actionable or false positive</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* InventorySmart panel on Resolution step */}
          {task.inventorySmartActions && task.inventorySmartActions.length > 0 && (
            <div className="pex-section">
              <InventorySmartPanel
                actions={task.inventorySmartActions}
                isResolved={task.status === 'resolved'}
                title={task.status === 'resolved'
                  ? 'InventorySmart — Actions Completed'
                  : 'InventorySmart — Actions Queued for Resolution'}
                subtitle={task.status === 'resolved'
                  ? 'InventorySmart has automatically corrected all inventory records. No cycle count required.'
                  : 'Mark this task Resolved to trigger all InventorySmart automated actions below.'}
              />
            </div>
          )}

          {/* Audit Trail */}
          <div className="pex-section">
            <div className="pex-section-header">
              <HistoryOutlined sx={{ fontSize: 17 }} />
              <h3 className="pex-section-title">Audit Trail</h3>
              <span className="pex-section-count">{auditTrail.length} entries</span>
            </div>
            <div className="pex-audit-list">
              {[...auditTrail].reverse().map((entry, i) => {
                const isSystem = entry.user === 'System' || entry.user.startsWith('System');
                return (
                  <div key={i} className="pex-audit-row">
                    <div className={`pex-audit-dot${isSystem ? ' pex-audit-dot--system' : ''}`}>
                      {isSystem
                        ? <AutoFixHighOutlined sx={{ fontSize: 13 }} />
                        : <PersonOutlined sx={{ fontSize: 13 }} />}
                    </div>
                    <div className="pex-audit-content">
                      <div className="pex-audit-action">{entry.action}</div>
                      <div className="pex-audit-meta">
                        <span className="pex-audit-user">{entry.user}</span>
                        <span className="pex-audit-time">{formatTs(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {auditTrail.length === 0 && (
                <p className="pex-audit-empty">No audit entries yet. Actions taken above will appear here.</p>
              )}
            </div>
          </div>

          <div className="pex-step-nav">
            <Button variant="outlined" onClick={() => setCurrentStep(1)}>← Back to Findings</Button>
          </div>
        </>
      )}

      {/* ── Success Modal ────────────────────────────────────────────── */}
      {showSuccessModal && (
        <div className="pex-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="pex-modal" onClick={e => e.stopPropagation()}>
            <div className="pex-modal-icon-wrap">
              <CheckCircleOutlined sx={{ fontSize: 38, color: '#16a34a' }} />
            </div>
            <h3 className="pex-modal-title">Findings Submitted</h3>
            <p className="pex-modal-body">
              Your findings have been saved and synced to Operations Queue task <strong>{task.linkedTaskId}</strong>. The audit trail has been updated.
            </p>
            <div className="pex-modal-chips">
              <span className="pex-modal-chip pex-modal-chip--green">✓ Findings saved</span>
              <span className="pex-modal-chip pex-modal-chip--blue">✓ Queue task updated</span>
              <span className="pex-modal-chip pex-modal-chip--purple">✓ Audit logged</span>
              {task.source === 'phantom_stock' && (
                <span className="pex-modal-chip pex-modal-chip--yellow">⚡ InventorySmart queued</span>
              )}
            </div>
            <div className="pex-modal-actions">
              <Button variant="primary" onClick={() => { setShowSuccessModal(false); navigate('/command-center/operations-queue'); }}>
                <LaunchOutlined sx={{ fontSize: 15 }} />&nbsp;Go to Operations Queue
              </Button>
              <Button variant="outlined" onClick={() => setShowSuccessModal(false)}>
                Continue Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dismiss Modal ────────────────────────────────────────────── */}
      {showDismissModal && (
        <div className="pex-modal-overlay" onClick={() => setShowDismissModal(false)}>
          <div className="pex-dismiss-modal" onClick={e => e.stopPropagation()}>
            <div className="pex-dismiss-modal-header">
              <div className="pex-dismiss-modal-icon"><BlockOutlined sx={{ fontSize: 18 }} /></div>
              <div>
                <h3 className="pex-dismiss-title">Dismiss Task</h3>
                <p className="pex-dismiss-sub">Select a reason. This is recorded in the audit trail and cannot be undone.</p>
              </div>
            </div>
            <div className="pex-dismiss-reasons">
              {DISMISS_REASONS_PEX.map(reason => (
                <div
                  key={reason}
                  className={`pex-dismiss-reason${dismissReason === reason ? ' pex-dismiss-reason--selected' : ''}`}
                  onClick={() => setDismissReason(reason)}
                >
                  <div className="pex-dismiss-reason-radio">
                    {dismissReason === reason
                      ? <CheckCircleOutlined sx={{ fontSize: 16, color: '#2563eb' }} />
                      : <RadioButtonUncheckedOutlined sx={{ fontSize: 16, color: '#cbd5e1' }} />}
                  </div>
                  <span className="pex-dismiss-reason-text">{reason}</span>
                </div>
              ))}
            </div>
            <div className="pex-dismiss-actions">
              <Button variant="outlined" onClick={() => { setShowDismissModal(false); setDismissReason(''); }}>
                Cancel
              </Button>
              <Button variant="primary" color="error" disabled={!dismissReason} onClick={handleDismissConfirm}>
                Confirm Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

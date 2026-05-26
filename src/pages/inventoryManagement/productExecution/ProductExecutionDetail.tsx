import React, { useState, useRef } from 'react';
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
import { Button, Badge } from 'impact-ui';
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

  const [task, setTask] = useState<PexTask | null>(baseTask ?? null);
  const [currentStep, setCurrentStep] = useState(0);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!task) {
    return (
      <div className="pex-detail-page">
        <button className="pex-back-btn" onClick={() => navigate('/inventory-management/product-execution')}>
          <ArrowBackOutlined sx={{ fontSize: 16 }} /> Back to Product Execution
        </button>
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
  const maxBar       = Math.max(...task.salesTrend.map(w => Math.max(w.store, w.cluster, w.chain, 1)), 1);
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

      {/* ── Back link ──────────────────────────────────────────────────── */}
      <button className="pex-back-btn" onClick={() => navigate('/inventory-management/product-execution')}>
        <ArrowBackOutlined sx={{ fontSize: 16 }} />
        Back to Product Execution
      </button>

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
                onClick={() => setCurrentStep(idx)}
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

            {/* 6-Week Sales Trend */}
            <div className="pex-trend-block">
              <div className="pex-trend-title">6-Week Sales Trend</div>
              <div className="pex-sales-bars">
                {task.salesTrend.map(w => (
                  <div key={w.week} className="pex-sales-bar-col">
                    <div className="pex-sales-bar-bars" style={{ height: 72 }}>
                      <div className="pex-sales-bar pex-sales-bar--chain"   style={{ height: Math.max(4, (w.chain / maxBar) * 68) }} />
                      <div className="pex-sales-bar pex-sales-bar--cluster" style={{ height: Math.max(4, (w.cluster / maxBar) * 68) }} />
                      <div className="pex-sales-bar pex-sales-bar--store"   style={{ height: Math.max(4, (w.store / maxBar) * 68) }} />
                    </div>
                    <span className="pex-sales-bar-label">{w.week}</span>
                  </div>
                ))}
              </div>
              <div className="pex-sales-legend">
                <span className="pex-sales-legend-item"><span className="pex-sales-legend-dot" style={{ background: '#2563eb' }} /> This Store</span>
                <span className="pex-sales-legend-item"><span className="pex-sales-legend-dot" style={{ background: '#94a3b8' }} /> Cluster Avg</span>
                <span className="pex-sales-legend-item"><span className="pex-sales-legend-dot" style={{ background: '#e2e8f0' }} /> Chain Avg</span>
              </div>
            </div>

            {/* Context boxes */}
            <div className="pex-context-row">
              <div className="pex-rec-box">
                <div className="pex-rec-box-label">Recommended Action</div>
                <div className="pex-rec-box-text">{task.recommendedAction}</div>
              </div>
              <div className="pex-opp-box">
                <div className="pex-opp-box-text">{task.opportunityExplanation}</div>
              </div>
            </div>
          </div>

          <div className="pex-step-nav">
            <Button variant="primary" onClick={() => setCurrentStep(1)}>
              Next: Findings &amp; Evidence →
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
                    ['stockReceived',   'Stock received?'],
                    ['inBackroom',       'Product available in backroom?'],
                    ['onShelf',          'Product present on shelf?'],
                    ['displaySetup',     'Display setup completed?'],
                    ['displayHasIssues', 'Display has issues?'],
                    ['labourShortage',   'Labour shortage?'],
                  ] as [keyof PexFindings, string][]).map(([field, label]) => (
                    <div key={field} className="pex-checklist-row">
                      <span className="pex-checklist-label">{label}</span>
                      <div className="pex-checklist-btns">
                        <button
                          className={`pex-bool-btn${localFindings[field] === true ? ' pex-bool-btn--yes-active' : ''}`}
                          onClick={() => setBool(field, true)}
                        >Yes</button>
                        <button
                          className={`pex-bool-btn${localFindings[field] === false ? ' pex-bool-btn--no-active' : ''}`}
                          onClick={() => setBool(field, false)}
                        >No</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pex-text-fields">
                  <div className="pex-text-field-row">
                    <span className="pex-text-field-label">Rack Number</span>
                    <input className="pex-text-input" placeholder="e.g. R-12"
                      value={localFindings.rackNumber}
                      onChange={e => setLocalFindings(f => ({ ...f, rackNumber: e.target.value }))} />
                  </div>
                  <div className="pex-text-field-row">
                    <span className="pex-text-field-label">Shelf Position</span>
                    <input className="pex-text-input" placeholder="e.g. Eye level, Bay 3"
                      value={localFindings.shelfPosition}
                      onChange={e => setLocalFindings(f => ({ ...f, shelfPosition: e.target.value }))} />
                  </div>
                  <div className="pex-text-field-row pex-text-field-row--full">
                    <span className="pex-text-field-label">Notes</span>
                    <textarea className="pex-textarea" placeholder="Add any relevant observations…"
                      value={localFindings.notes}
                      onChange={e => setLocalFindings(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {findingsTab === 'issues' && (
              <div className="pex-issues-grid">
                {PEX_ISSUE_TYPES.map(issue => {
                  const selected = localFindings.selectedIssues.includes(issue);
                  return (
                    <div key={issue} className={`pex-issue-chip${selected ? ' pex-issue-chip--selected' : ''}`} onClick={() => toggleIssue(issue)}>
                      <div className="pex-issue-check">{selected && <CheckOutlined sx={{ fontSize: 11 }} />}</div>
                      {issue}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Evidence upload section */}
          <div className="pex-section">
            <div className="pex-section-header">
              <CameraAltOutlined sx={{ fontSize: 17 }} />
              <h3 className="pex-section-title">Evidence — Upload Shelf / Rack Image</h3>
              {hasAiTrigger && (
                <span className="pex-ai-badge" style={{ marginLeft: 'auto' }}>
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
              <div className="pex-upload-icon"><CloudUploadOutlined sx={{ fontSize: 24 }} /></div>
              <div className="pex-upload-title">Drop images here or click to upload</div>
              <div className="pex-upload-sub">Images will be attached to the linked Operations Queue task</div>
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
            <Button variant="primary" onClick={() => setCurrentStep(2)}>
              Next: Resolution →
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
              <h3 className="pex-section-title">Task Status</h3>
              <div style={{ marginLeft: 'auto' }}>
                <Badge label={PEX_STATUS_LABELS[task.status]} color={STATUS_COLOR[task.status]} size="small" variant="subtle" />
              </div>
            </div>
            <div className="pex-status-context">
              <p className="pex-status-context-text">
                Review the findings and take an action below. All changes are recorded in the audit trail and synced to the linked Operations Queue task <strong>{task.linkedTaskId}</strong>.
              </p>
            </div>

            {/* Action buttons */}
            <div className="pex-resolution-actions">
              <button className="pex-action-primary" onClick={handleSaveFindings}>
                <CheckOutlined sx={{ fontSize: 15 }} /> Save &amp; Submit Findings
              </button>
              {task.status === 'open' && (
                <button className="pex-action-secondary" onClick={handleMarkInProgress}>
                  Mark In Progress
                </button>
              )}
              {(task.status === 'open' || task.status === 'in_progress') && (
                <button className="pex-action-secondary pex-action-green" onClick={handleMarkResolved}>
                  <CheckCircleOutlineOutlined sx={{ fontSize: 15 }} /> Mark Resolved
                </button>
              )}
              {task.status !== 'escalated' && task.status !== 'resolved' && task.status !== 'dismissed' && (
                <button className="pex-action-secondary pex-action-orange" onClick={handleEscalate}>
                  <FlagOutlined sx={{ fontSize: 15 }} /> Escalate to DM
                </button>
              )}
              {task.status !== 'resolved' && task.status !== 'dismissed' && (
                <button className="pex-action-secondary pex-action-red" onClick={() => setShowDismissModal(true)}>
                  <BlockOutlined sx={{ fontSize: 15 }} /> Dismiss with Reason
                </button>
              )}
              <button className="pex-action-ghost" onClick={() => navigate('/command-center/operations-queue')}>
                <LaunchOutlined sx={{ fontSize: 14 }} /> Open in Operations Queue
              </button>
            </div>
          </div>

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
            <div className="pex-modal-icon"><CheckCircleOutlined sx={{ fontSize: 32 }} /></div>
            <h3 className="pex-modal-title">Findings Saved</h3>
            <p className="pex-modal-body">
              Your findings have been saved and the linked task has been updated in Operations Queue.
            </p>
            <div className="pex-modal-actions">
              <button className="pex-modal-cta-primary" onClick={() => { setShowSuccessModal(false); navigate('/command-center/operations-queue'); }}>
                Go to Operations Queue
              </button>
              <button className="pex-modal-cta-secondary" onClick={() => setShowSuccessModal(false)}>
                Continue Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dismiss Modal ────────────────────────────────────────────── */}
      {showDismissModal && (
        <div className="pex-modal-overlay" onClick={() => setShowDismissModal(false)}>
          <div className="pex-dismiss-modal" onClick={e => e.stopPropagation()}>
            <h3 className="pex-dismiss-title">Dismiss Task</h3>
            <p className="pex-dismiss-sub">Select a reason to dismiss this task. This action is recorded in the audit trail.</p>
            <div className="pex-dismiss-reasons">
              {DISMISS_REASONS_PEX.map(reason => (
                <div
                  key={reason}
                  className={`pex-dismiss-reason${dismissReason === reason ? ' pex-dismiss-reason--selected' : ''}`}
                  onClick={() => setDismissReason(reason)}
                >
                  <div className="pex-dismiss-reason-radio">
                    {dismissReason === reason
                      ? <CheckCircleOutlined sx={{ fontSize: 15, color: '#2563eb' }} />
                      : <RadioButtonUncheckedOutlined sx={{ fontSize: 15, color: '#cbd5e1' }} />}
                  </div>
                  <span className="pex-dismiss-reason-text">{reason}</span>
                </div>
              ))}
            </div>
            <div className="pex-dismiss-actions">
              <button className="pex-dismiss-cancel" onClick={() => { setShowDismissModal(false); setDismissReason(''); }}>
                Cancel
              </button>
              <button className="pex-dismiss-confirm" disabled={!dismissReason} onClick={handleDismissConfirm}>
                Confirm Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState, useCallback } from 'react';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import Add from '@mui/icons-material/Add';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import SensorsOutlined from '@mui/icons-material/SensorsOutlined';
import CheckBoxOutlined from '@mui/icons-material/CheckBoxOutlined';
import CheckBoxOutlineBlankOutlined from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Badge, EmptyState } from 'impact-ui';
import type { User, UserRole } from '../../types';
import type { FieldSignal, LogSignalFormState } from '../../types/fieldSignal';
import {
  SIGNAL_TYPE_CONFIG,
  EXPECTED_IMPACT_CONFIG,
  SIGNAL_STATUS_CONFIG,
  SIGNAL_TYPE_OPTIONS,
  EXPECTED_IMPACT_OPTIONS,
} from '../../constants/fieldSignals';

// ── Helpers ──

export const formatSignalDate = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatSignalDateTime = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const truncateText = (text: string, maxLines = 3) => {
  const lines = text.split('\n');
  if (lines.length <= maxLines && text.length <= 180) return text;
  const joined = lines.slice(0, maxLines).join('\n');
  return joined.length > 180 ? `${joined.slice(0, 177)}…` : joined;
};

export const canExportFieldSignals = (role?: UserRole) =>
  role === 'DM' || role === 'HQ' || role === 'ADMIN';

export const canReviewFieldSignals = (role?: UserRole) =>
  role === 'DM' || role === 'HQ' || role === 'ADMIN';

// ── Log Field Signal Drawer ──

interface LogFieldSignalDrawerProps {
  open: boolean;
  form: LogSignalFormState;
  errors: Partial<Record<keyof LogSignalFormState, string>>;
  onClose: () => void;
  onChange: (updates: Partial<LogSignalFormState>) => void;
  onSubmit: () => void;
}

export const LogFieldSignalDrawer: React.FC<LogFieldSignalDrawerProps> = ({
  open, form, errors, onClose, onChange, onSubmit,
}) => {
  if (!open) return null;
  return (
    <div className="fs-log-drawer-overlay" onClick={onClose}>
      <div className="fs-log-drawer" onClick={e => e.stopPropagation()}>
        <div className="fs-log-drawer-header">
          <div>
            <h3>Log Field Signal</h3>
            <p className="fs-log-drawer-sub">Capture hyper-local demand and operational context for your store.</p>
          </div>
          <button type="button" className="fs-drawer-close" onClick={onClose} aria-label="Close">
            <CloseOutlined sx={{ fontSize: 20 }} />
          </button>
        </div>
        <div className="fs-log-drawer-body">
          <div className="fs-form-section">
            <label className="fs-form-label">Signal Type <span className="fs-required">*</span></label>
            <select
              className={`fs-form-select ${errors.signalType ? 'fs-form-select--error' : ''}`}
              value={form.signalType}
              onChange={e => onChange({ signalType: e.target.value as LogSignalFormState['signalType'] })}
            >
              <option value="">Select signal type…</option>
              {SIGNAL_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.signalType && <span className="fs-form-error">{errors.signalType}</span>}
          </div>

          <div className="fs-form-section">
            <label className="fs-form-label">Event Title <span className="fs-required">*</span></label>
            <input type="text"
              className={`fs-form-input ${errors.title ? 'fs-form-input--error' : ''}`}
              placeholder="Short title for this local event"
              value={form.title} onChange={e => onChange({ title: e.target.value })} />
            {errors.title && <span className="fs-form-error">{errors.title}</span>}
          </div>

          <div className="fs-form-section fs-form-section--primary">
            <label className="fs-form-label">Description <span className="fs-required">*</span></label>
            <p className="fs-form-helper">Describe what is happening locally and how it may affect demand or store operations.</p>
            <textarea
              className={`fs-form-textarea ${errors.description ? 'fs-form-textarea--error' : ''}`}
              placeholder="Describe what is happening locally and how it may affect demand or store operations."
              rows={6} value={form.description} onChange={e => onChange({ description: e.target.value })} />
            {errors.description && <span className="fs-form-error">{errors.description}</span>}
          </div>

          <div className="fs-form-section">
            <label className="fs-form-label">Event Date Range <span className="fs-required">*</span></label>
            <div className="fs-date-range">
              <input type="date" className={`fs-form-input ${errors.impactStartDate ? 'fs-form-input--error' : ''}`}
                value={form.impactStartDate} onChange={e => onChange({ impactStartDate: e.target.value })} />
              <span className="fs-date-sep">to</span>
              <input type="date" className={`fs-form-input ${errors.impactEndDate ? 'fs-form-input--error' : ''}`}
                value={form.impactEndDate} onChange={e => onChange({ impactEndDate: e.target.value })} />
            </div>
            {(errors.impactStartDate || errors.impactEndDate) && (
              <span className="fs-form-error">{errors.impactStartDate || errors.impactEndDate}</span>
            )}
          </div>

          <div className="fs-form-section">
            <label className="fs-form-label">Expected Impact <span className="fs-required">*</span></label>
            <select
              className={`fs-form-select ${errors.expectedImpact ? 'fs-form-select--error' : ''}`}
              value={form.expectedImpact}
              onChange={e => onChange({ expectedImpact: e.target.value as LogSignalFormState['expectedImpact'] })}
            >
              <option value="">Select expected impact…</option>
              {EXPECTED_IMPACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.expectedImpact && <span className="fs-form-error">{errors.expectedImpact}</span>}
          </div>

          <div className="fs-form-section">
            <label className="fs-form-label">Store / Department</label>
            <input type="text" className="fs-form-input"
              value={form.storeName ? `${form.storeName}${form.department ? ` · ${form.department}` : ''}` : form.storeId}
              onChange={e => onChange({ storeName: e.target.value })} placeholder="Store name or ID" />
          </div>

          <div className="fs-form-section">
            <label className="fs-form-label">Optional Attachment</label>
            <button type="button" className="fs-attach-btn">
              <AttachFileOutlined sx={{ fontSize: 18 }} />
              <span>Add attachment</span>
            </button>
          </div>
        </div>
        <div className="fs-log-drawer-footer">
          <Button variant="outlined" color="primary" size="medium" onClick={onClose}>Cancel</Button>
          <Button variant="contained" color="primary" size="medium" onClick={onSubmit}>Send Field Signal</Button>
        </div>
      </div>
    </div>
  );
};

// ── Chat Card ──

interface FieldSignalChatCardProps {
  signal: FieldSignal;
  onViewDetails: () => void;
  onOpenLog: () => void;
}

export const FieldSignalChatCard: React.FC<FieldSignalChatCardProps> = ({
  signal, onViewDetails, onOpenLog,
}) => {
  const statusCfg = SIGNAL_STATUS_CONFIG[signal.status];
  return (
    <div className="fs-chat-card-wrap">
      <div className="fs-chat-card" onClick={onViewDetails} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onViewDetails(); }}>
        <div className="fs-chat-card-top">
          <span className="fs-chat-card-label">
            <SensorsOutlined sx={{ fontSize: 14 }} />
            FIELD SIGNAL · {SIGNAL_TYPE_CONFIG[signal.signalType].label}
          </span>
          <Badge label={statusCfg.label} color={statusCfg.color} size="small" className={`fs-status-badge fs-status--${signal.status}`} />
        </div>
        <h4 className="fs-chat-card-title">{signal.title}</h4>
        <p className="fs-chat-card-desc">{truncateText(signal.description)}</p>
        <div className="fs-chat-card-meta">
          <span><StoreOutlined sx={{ fontSize: 13 }} /> Store: {signal.storeName || signal.storeId}</span>
          <span><CalendarTodayOutlined sx={{ fontSize: 13 }} /> Impact Window: {formatSignalDate(signal.impactStartDate)} – {formatSignalDate(signal.impactEndDate)}</span>
          <span><TrendingUpOutlined sx={{ fontSize: 13 }} /> Expected Impact: {EXPECTED_IMPACT_CONFIG[signal.expectedImpact].label}</span>
        </div>
        <div className="fs-chat-card-actions" onClick={e => e.stopPropagation()}>
          <Button variant="contained" color="primary" size="small" onClick={onViewDetails}>View Details</Button>
          <Button variant="outlined" color="primary" size="small" onClick={onOpenLog}>Open in Field Signals</Button>
        </div>
      </div>
    </div>
  );
};

// ── Active Signals Pill ──

interface ActiveSignalsPillProps {
  count: number;
  signals: FieldSignal[];
  filterActive: boolean;
  onToggleFilter: () => void;
  onViewSignal: (id: string) => void;
}

export const ActiveSignalsPill: React.FC<ActiveSignalsPillProps> = ({
  count, signals, filterActive, onToggleFilter, onViewSignal,
}) => {
  const [showList, setShowList] = useState(false);
  if (count === 0) return null;
  return (
    <div className="fs-active-pill-wrap">
      <button type="button" className={`fs-active-pill ${filterActive ? 'fs-active-pill--active' : ''}`}
        onClick={() => { onToggleFilter(); setShowList(v => !v); }}>
        <BoltOutlined sx={{ fontSize: 14 }} />
        Active Field Signals: {count}
      </button>
      {showList && (
        <div className="fs-active-mini-drawer">
          <div className="fs-active-mini-header">
            <span>Active signals in this thread</span>
            <button type="button" onClick={() => setShowList(false)} aria-label="Close">
              <CloseOutlined sx={{ fontSize: 16 }} />
            </button>
          </div>
          <ul className="fs-active-mini-list">
            {signals.map(s => (
              <li key={s.id}>
                <button type="button" onClick={() => { onViewSignal(s.id); setShowList(false); }}>
                  <strong>{s.title}</strong>
                  <span>{SIGNAL_TYPE_CONFIG[s.signalType].label} · {SIGNAL_STATUS_CONFIG[s.status].label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Field Signals Log View (clean, search-first) ──

export interface FieldSignalFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  store: string;
  signalType: string;
  expectedImpact: string;
  status: string;
  createdBy: string;
}

export const EMPTY_FS_FILTERS: FieldSignalFilters = {
  search: '', dateFrom: '', dateTo: '', store: '', signalType: '', expectedImpact: '', status: '', createdBy: '',
};

const broadSearch = (signal: FieldSignal, query: string): boolean => {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [
    signal.id,
    signal.title,
    signal.description,
    signal.storeName || signal.storeId,
    SIGNAL_TYPE_CONFIG[signal.signalType].label,
    EXPECTED_IMPACT_CONFIG[signal.expectedImpact].label,
    SIGNAL_STATUS_CONFIG[signal.status].label,
    signal.createdByName,
  ].join(' ').toLowerCase();
  return haystack.includes(q);
};

interface FieldSignalsLogViewProps {
  signals: FieldSignal[];
  filters: FieldSignalFilters;
  selectedSignalId: string | null;
  onFiltersChange: (f: FieldSignalFilters) => void;
  onLogSignal: () => void;
  canExport: boolean;
  onSelectSignal: (id: string) => void;
  storeOptions: string[];
  user: User | null;
  onCreateTask: (signal: FieldSignal) => void;
  onCreateBroadcast: (signal: FieldSignal) => void;
  onViewConversation: (threadId: string) => void;
  onViewTask: (taskId: string) => void;
}

export const FieldSignalsLogView: React.FC<FieldSignalsLogViewProps> = ({
  signals, filters, selectedSignalId, onFiltersChange, onLogSignal,
  canExport, onSelectSignal, storeOptions, user,
  onCreateTask, onCreateBroadcast, onViewConversation, onViewTask,
}) => {
  const [showExportDrawer, setShowExportDrawer] = useState(false);

  const filtered = useMemo(() => {
    return signals
      .filter(s => broadSearch(s, filters.search))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [signals, filters.search]);

  const selectedSignal = selectedSignalId ? signals.find(s => s.id === selectedSignalId) ?? null : null;

  const handleSearch = (v: string) => onFiltersChange({ ...filters, search: v });

  if (signals.length === 0) {
    return (
      <div className="fs-log-page">
        <div className="fs-log-toolbar">
          <div className="fs-log-toolbar-left">
            <h2>Field Signals</h2>
          </div>
          <div className="fs-log-toolbar-right">
            <Button variant="contained" color="primary" size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={onLogSignal}>
              Log Field Signal
            </Button>
          </div>
        </div>
        <div className="fs-empty-state">
          <EmptyState
            heading="No field signals yet"
            description="Local demand signals submitted by stores will appear here for review, follow-up, and export."
            emptyStateIcon={<SensorsOutlined sx={{ fontSize: 48 }} />}
          />
          <Button variant="contained" color="primary" size="medium" onClick={onLogSignal} className="fs-empty-cta">
            Log Field Signal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fs-log-page">
      {/* Toolbar: search + actions */}
      <div className="fs-log-toolbar">
        <div className="fs-log-toolbar-left">
          <div className="fs-toolbar-search">
            <SearchOutlined sx={{ fontSize: 16 }} />
            <input type="text" placeholder="Search field signals…" value={filters.search}
              onChange={e => handleSearch(e.target.value)} />
            {filters.search && (
              <button type="button" className="fs-toolbar-search-clear" onClick={() => handleSearch('')} aria-label="Clear search">
                <CloseOutlined sx={{ fontSize: 14 }} />
              </button>
            )}
          </div>
        </div>
        <div className="fs-log-toolbar-right">
          <Button variant="contained" color="primary" size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={onLogSignal}>
            Log Field Signal
          </Button>
          {canExport && (
            <Button variant="outlined" color="primary" size="small" startIcon={<FileDownloadOutlined sx={{ fontSize: 16 }} />}
              onClick={() => setShowExportDrawer(true)}>
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Two-pane inbox */}
      <div className="fs-inbox-layout">
        <div className="fs-inbox-list">
          <div className="fs-inbox-cards">
            {filtered.length === 0 ? (
              <div className="fs-inbox-cards-empty">
                <p>No signals match "{filters.search}"</p>
              </div>
            ) : (
              filtered.map(s => {
                const st = SIGNAL_STATUS_CONFIG[s.status];
                const imp = EXPECTED_IMPACT_CONFIG[s.expectedImpact];
                const isActive = selectedSignalId === s.id;
                return (
                  <button key={s.id} type="button"
                    className={`fs-inbox-card ${isActive ? 'fs-inbox-card--active' : ''}`}
                    onClick={() => onSelectSignal(s.id)}>
                    <div className="fs-inbox-card-top">
                      <Badge label={st.label} color={st.color} size="small" className={`fs-status--${s.status}`} />
                      <Badge label={imp.label} color={imp.color} size="small" />
                    </div>
                    <h4 className="fs-inbox-card-title">{s.title}</h4>
                    <div className="fs-inbox-card-meta">
                      <span><StoreOutlined sx={{ fontSize: 12 }} /> {s.storeName || s.storeId}</span>
                      <span><CalendarTodayOutlined sx={{ fontSize: 12 }} /> {formatSignalDate(s.impactStartDate)} – {formatSignalDate(s.impactEndDate)}</span>
                    </div>
                    <div className="fs-inbox-card-row3">
                      <span className="fs-inbox-card-type">{SIGNAL_TYPE_CONFIG[s.signalType].label}</span>
                      <span className="fs-inbox-card-date">{formatSignalDate(s.createdAt)}</span>
                    </div>
                    <p className="fs-inbox-card-desc">{s.description.slice(0, 90)}{s.description.length > 90 ? '…' : ''}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="fs-inbox-detail">
          {selectedSignal ? (
            <SignalDetailPane signal={selectedSignal} user={user}
              onCreateTask={onCreateTask} onCreateBroadcast={onCreateBroadcast}
              onViewConversation={onViewConversation} onViewTask={onViewTask} />
          ) : (
            <div className="fs-inbox-detail-empty">
              <SensorsOutlined sx={{ fontSize: 36 }} />
              <p>Select a signal to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Export drawer */}
      {showExportDrawer && (
        <ExportFieldSignalsDrawer
          signals={signals}
          currentSearchQuery={filters.search}
          storeOptions={storeOptions}
          onClose={() => setShowExportDrawer(false)}
        />
      )}
    </div>
  );
};

// ── Export Drawer ──

interface ExportFilters {
  dateFrom: string;
  dateTo: string;
  eventDateFrom: string;
  eventDateTo: string;
  status: string;
  signalType: string;
  expectedImpact: string;
  store: string;
  district: string;
  createdBy: string;
}

const EMPTY_EXPORT_FILTERS: ExportFilters = {
  dateFrom: '', dateTo: '', eventDateFrom: '', eventDateTo: '',
  status: '', signalType: '', expectedImpact: '', store: '', district: '',
  createdBy: '',
};

type ExportScope = 'search' | 'all' | 'custom';
type ExportPreset = 'summary' | 'full_audit' | 'custom';

const DEFAULT_FIELDS = [
  'Signal ID', 'Store', 'Event Title', 'Signal Type', 'Impact Window',
  'Expected Impact', 'Status', 'Logged By', 'Logged Date', 'Last Updated',
];

// Curated optional fields — limited to operationally useful columns
const OPTIONAL_FIELDS = [
  'Description', 'District', 'Department',
  'Event Start Date', 'Event End Date',
  'Reviewed By', 'Reviewed Date',
  'Closed By', 'Closed Date',
];

const SUMMARY_FIELDS = [...DEFAULT_FIELDS];
const FULL_AUDIT_FIELDS = [...DEFAULT_FIELDS, ...OPTIONAL_FIELDS];

interface ExportFieldSignalsDrawerProps {
  signals: FieldSignal[];
  currentSearchQuery: string;
  storeOptions: string[];
  onClose: () => void;
}

// Premium select wrapper — consistent with Impact UI token system
const FsSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}> = ({ value, onChange, options, placeholder = 'All' }) => (
  <div className="fs-sel-wrap">
    <select className="fs-sel" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <KeyboardArrowDown sx={{ fontSize: 15 }} className="fs-sel-chevron" />
  </div>
);

const ExportFieldSignalsDrawer: React.FC<ExportFieldSignalsDrawerProps> = ({
  signals, currentSearchQuery, storeOptions, onClose,
}) => {
  const [scope, setScope] = useState<ExportScope>(currentSearchQuery ? 'search' : 'all');
  const [filters, setFilters] = useState<ExportFilters>(EMPTY_EXPORT_FILTERS);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(DEFAULT_FIELDS));
  const [preset, setPreset] = useState<ExportPreset>('summary');
  const [step, setStep] = useState<'config' | 'confirm'>('config');

  const setF = (patch: Partial<ExportFilters>) => setFilters(f => ({ ...f, ...patch }));

  const applyPreset = useCallback((p: ExportPreset) => {
    setPreset(p);
    if (p === 'summary') setSelectedFields(new Set(SUMMARY_FIELDS));
    else if (p === 'full_audit') setSelectedFields(new Set(FULL_AUDIT_FIELDS));
  }, []);

  const toggleField = (field: string) => {
    setPreset('custom');
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const exportFiltered = useMemo(() => {
    let result = [...signals];
    if (scope === 'search' && currentSearchQuery) {
      result = result.filter(s => broadSearch(s, currentSearchQuery));
    } else if (scope === 'custom') {
      result = result.filter(s => {
        if (filters.dateFrom && s.createdAt < filters.dateFrom) return false;
        if (filters.dateTo && s.createdAt > filters.dateTo) return false;
        if (filters.eventDateFrom && s.impactStartDate < filters.eventDateFrom) return false;
        if (filters.eventDateTo && s.impactEndDate > filters.eventDateTo) return false;
        if (filters.status && s.status !== filters.status) return false;
        if (filters.signalType && s.signalType !== filters.signalType) return false;
        if (filters.expectedImpact && s.expectedImpact !== filters.expectedImpact) return false;
        if (filters.store && !(s.storeName || s.storeId).includes(filters.store)) return false;
        if (filters.district && !(s.districtName || s.districtId || '').includes(filters.district)) return false;
        if (filters.createdBy && !s.createdByName.toLowerCase().includes(filters.createdBy.toLowerCase())) return false;
        return true;
      });
    }
    return result;
  }, [signals, scope, currentSearchQuery, filters]);

  const doExport = () => {
    // 'all' and 'search' always export every column; custom uses user selection
    const fields = scope === 'custom' ? Array.from(selectedFields) : FULL_AUDIT_FIELDS;
    const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const fieldGetters: Record<string, (s: FieldSignal) => string> = {
      'Signal ID': s => s.id,
      'Store': s => s.storeName || s.storeId,
      'Event Title': s => s.title,
      'Signal Type': s => SIGNAL_TYPE_CONFIG[s.signalType].label,
      'Impact Window': s => `${formatSignalDate(s.impactStartDate)} – ${formatSignalDate(s.impactEndDate)}`,
      'Expected Impact': s => EXPECTED_IMPACT_CONFIG[s.expectedImpact].label,
      'Status': s => SIGNAL_STATUS_CONFIG[s.status].label,
      'Logged By': s => s.createdByName,
      'Logged Date': s => s.createdAt,
      'Last Updated': s => s.updatedAt,
      'Description': s => s.description,
      'District': s => s.districtName || s.districtId || '',
      'Department': s => s.department || '',
      'Event Start Date': s => s.impactStartDate,
      'Event End Date': s => s.impactEndDate,
      'Reviewed By': s => s.reviewedByName || '',
      'Reviewed Date': s => s.reviewedAt || '',
      'Closed By': s => s.closedByName || '',
      'Closed Date': s => s.closedAt || '',
      'Linked Task ID': s => s.linkedTaskId || '',
      'Linked Broadcast ID': s => s.linkedBroadcastId || '',
      'Original Chat Thread Link': s => s.originalThreadId || '',
      'Activity History': s => s.activityLog.map(a => `${a.action} by ${a.actorName} at ${a.timestamp}`).join('; '),
    };

    const rows = exportFiltered.map(s =>
      fields.map(f => escape(fieldGetters[f]?.(s) ?? '')).join(','),
    );
    const csv = [fields.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-signals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const scopeLabel = scope === 'search' ? 'Current search results' : scope === 'all' ? 'All field signals' : 'Custom filters';
  const statusLabel = filters.status ? SIGNAL_STATUS_CONFIG[filters.status as keyof typeof SIGNAL_STATUS_CONFIG]?.label || 'All' : 'All statuses';
  const typeLabel = filters.signalType ? SIGNAL_TYPE_CONFIG[filters.signalType as keyof typeof SIGNAL_TYPE_CONFIG]?.label || 'All' : 'All types';

  return (
    <div className="fs-export-overlay" onClick={onClose}>
      <div className="fs-export-drawer" onClick={e => e.stopPropagation()}>
        <div className="fs-export-header">
          <div>
            <h3>Export Field Signals</h3>
            <p className="fs-export-sub">Configure scope, filters, and fields for your export.</p>
          </div>
          <button type="button" className="fs-drawer-close" onClick={onClose} aria-label="Close">
            <CloseOutlined sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="fs-export-body">
          {step === 'config' ? (
            <>
              {/* ── Export Scope ── */}
              <div className="fs-export-section">
                <h4 className="fs-export-section-title">Export Scope</h4>
                <div className="fs-export-scope-options">
                  {currentSearchQuery && (
                    <label className={`fs-export-scope ${scope === 'search' ? 'fs-export-scope--active' : ''}`}>
                      <input type="radio" name="scope" checked={scope === 'search'} onChange={() => setScope('search')} />
                      <div className="fs-export-scope-text">
                        <strong>Export current search results</strong>
                        <span>"{currentSearchQuery}" — {signals.filter(s => broadSearch(s, currentSearchQuery)).length} signals</span>
                      </div>
                    </label>
                  )}
                  <label className={`fs-export-scope ${scope === 'all' ? 'fs-export-scope--active' : ''}`}>
                    <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} />
                    <div className="fs-export-scope-text">
                      <strong>Export all field signals</strong>
                      <span>{signals.length} signals · All fields included</span>
                    </div>
                  </label>
                  <label className={`fs-export-scope ${scope === 'custom' ? 'fs-export-scope--active' : ''}`}>
                    <input type="radio" name="scope" checked={scope === 'custom'} onChange={() => setScope('custom')} />
                    <div className="fs-export-scope-text">
                      <strong>Custom export</strong>
                      <span>Apply filters and choose specific columns</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* ── Filters — visible only for Custom scope ── */}
              {scope === 'custom' && (
                <div className="fs-export-section">
                  <h4 className="fs-export-section-title">Filters</h4>
                  <div className="fs-export-filter-grid">

                    {/* Date ranges — each spans full width so inputs never overflow */}
                    <div className="fs-export-filter-group fs-filter-full">
                      <label className="fs-filter-label">Logged Date Range</label>
                      <div className="fs-export-date-pair">
                        <input className="fs-date-input" type="date" value={filters.dateFrom} onChange={e => setF({ dateFrom: e.target.value })} />
                        <span className="fs-date-sep">to</span>
                        <input className="fs-date-input" type="date" value={filters.dateTo} onChange={e => setF({ dateTo: e.target.value })} />
                      </div>
                    </div>
                    <div className="fs-export-filter-group fs-filter-full">
                      <label className="fs-filter-label">Event Date Range</label>
                      <div className="fs-export-date-pair">
                        <input className="fs-date-input" type="date" value={filters.eventDateFrom} onChange={e => setF({ eventDateFrom: e.target.value })} />
                        <span className="fs-date-sep">to</span>
                        <input className="fs-date-input" type="date" value={filters.eventDateTo} onChange={e => setF({ eventDateTo: e.target.value })} />
                      </div>
                    </div>

                    {/* Dropdowns — 2-column */}
                    <div className="fs-export-filter-group">
                      <label className="fs-filter-label">Status</label>
                      <FsSelect
                        value={filters.status}
                        onChange={v => setF({ status: v })}
                        placeholder="All statuses"
                        options={[
                          { value: 'new', label: 'New' },
                          { value: 'reviewed', label: 'Reviewed' },
                          { value: 'closed', label: 'Closed' },
                        ]}
                      />
                    </div>
                    <div className="fs-export-filter-group">
                      <label className="fs-filter-label">Signal Type</label>
                      <FsSelect
                        value={filters.signalType}
                        onChange={v => setF({ signalType: v })}
                        placeholder="All types"
                        options={SIGNAL_TYPE_OPTIONS}
                      />
                    </div>

                    <div className="fs-export-filter-group">
                      <label className="fs-filter-label">Expected Impact</label>
                      <FsSelect
                        value={filters.expectedImpact}
                        onChange={v => setF({ expectedImpact: v })}
                        placeholder="All impacts"
                        options={EXPECTED_IMPACT_OPTIONS}
                      />
                    </div>
                    <div className="fs-export-filter-group">
                      <label className="fs-filter-label">Store</label>
                      <FsSelect
                        value={filters.store}
                        onChange={v => setF({ store: v })}
                        placeholder="All stores"
                        options={storeOptions.map(s => ({ value: s, label: s }))}
                      />
                    </div>

                    {/* Text inputs */}
                    <div className="fs-export-filter-group">
                      <label className="fs-filter-label">District</label>
                      <input className="fs-text-input" type="text" placeholder="District name…" value={filters.district} onChange={e => setF({ district: e.target.value })} />
                    </div>
                    <div className="fs-export-filter-group">
                      <label className="fs-filter-label">Logged By</label>
                      <input className="fs-text-input" type="text" placeholder="Name or email…" value={filters.createdBy} onChange={e => setF({ createdBy: e.target.value })} />
                    </div>

                  </div>
                </div>
              )}

              {/* ── Fields to Export ── */}
              <div className="fs-export-section">
                <div className="fs-export-section-header">
                  <h4 className="fs-export-section-title">Fields to Export</h4>
                  {scope === 'custom' && (
                    <div className="fs-export-presets">
                      <button type="button" className={`fs-preset-btn${preset === 'summary' ? ' fs-preset-btn--active' : ''}`}
                        onClick={() => applyPreset('summary')}>Summary</button>
                      <button type="button" className={`fs-preset-btn${preset === 'full_audit' ? ' fs-preset-btn--active' : ''}`}
                        onClick={() => applyPreset('full_audit')}>Full Audit</button>
                      <button type="button" className={`fs-preset-btn${preset === 'custom' ? ' fs-preset-btn--active' : ''}`}
                        onClick={() => setPreset('custom')}>Custom</button>
                    </div>
                  )}
                </div>

                {/* Export All / Search → all columns grayed-out (read-only preview) */}
                {scope !== 'custom' && (
                  <>
                    <p className="fs-export-all-hint">All columns will be included in this export.</p>
                    <div className="fs-export-fields-group">
                      <span className="fs-export-fields-label">Default Fields</span>
                      <div className="fs-export-fields-grid">
                        {DEFAULT_FIELDS.map(f => (
                          <label key={f} className="fs-export-field-cb fs-export-field-cb--locked">
                            <CheckBoxOutlined sx={{ fontSize: 18 }} className="fs-cb-locked" />
                            <input type="checkbox" checked readOnly disabled />
                            <span>{f}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="fs-export-fields-group">
                      <span className="fs-export-fields-label">Additional Fields</span>
                      <div className="fs-export-fields-grid">
                        {OPTIONAL_FIELDS.map(f => (
                          <label key={f} className="fs-export-field-cb fs-export-field-cb--locked">
                            <CheckBoxOutlined sx={{ fontSize: 18 }} className="fs-cb-locked" />
                            <input type="checkbox" checked readOnly disabled />
                            <span>{f}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Custom → interactive column picker */}
                {scope === 'custom' && (
                  <>
                    <div className="fs-export-fields-group">
                      <span className="fs-export-fields-label">Default Fields</span>
                      <div className="fs-export-fields-grid">
                        {DEFAULT_FIELDS.map(f => (
                          <label key={f} className="fs-export-field-cb">
                            {selectedFields.has(f)
                              ? <CheckBoxOutlined sx={{ fontSize: 18 }} className="fs-cb-checked" />
                              : <CheckBoxOutlineBlankOutlined sx={{ fontSize: 18 }} />}
                            <input type="checkbox" checked={selectedFields.has(f)} onChange={() => toggleField(f)} />
                            <span>{f}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="fs-export-fields-group">
                      <span className="fs-export-fields-label">Optional Fields</span>
                      <div className="fs-export-fields-grid">
                        {OPTIONAL_FIELDS.map(f => (
                          <label key={f} className="fs-export-field-cb">
                            {selectedFields.has(f)
                              ? <CheckBoxOutlined sx={{ fontSize: 18 }} className="fs-cb-checked" />
                              : <CheckBoxOutlineBlankOutlined sx={{ fontSize: 18 }} />}
                            <input type="checkbox" checked={selectedFields.has(f)} onChange={() => toggleField(f)} />
                            <span>{f}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Confirmation step */
            <div className="fs-export-section">
              <h4>Export Summary</h4>
              <div className="fs-export-summary">
                <div className="fs-export-summary-row">
                  <span>Records matched</span>
                  <strong>{exportFiltered.length}</strong>
                </div>
                <div className="fs-export-summary-row">
                  <span>Scope</span>
                  <strong>{scopeLabel}</strong>
                </div>
                {scope === 'custom' && (
                  <>
                    <div className="fs-export-summary-row">
                      <span>Status</span>
                      <strong>{statusLabel}</strong>
                    </div>
                    <div className="fs-export-summary-row">
                      <span>Signal types</span>
                      <strong>{typeLabel}</strong>
                    </div>
                    {filters.dateFrom && (
                      <div className="fs-export-summary-row">
                        <span>Logged date range</span>
                        <strong>{filters.dateFrom} – {filters.dateTo || 'present'}</strong>
                      </div>
                    )}
                  </>
                )}
                <div className="fs-export-summary-row">
                  <span>Fields selected</span>
                  <strong>{selectedFields.size}</strong>
                </div>
                <div className="fs-export-summary-row">
                  <span>Preset</span>
                  <strong>{preset === 'summary' ? 'Summary Export' : preset === 'full_audit' ? 'Full Audit Export' : 'Custom Export'}</strong>
                </div>
                <div className="fs-export-summary-row">
                  <span>Format</span>
                  <strong>CSV</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fs-export-footer">
          {step === 'config' ? (
            <>
              <Button variant="outlined" color="primary" size="medium" onClick={onClose}>Cancel</Button>
              <Button variant="contained" color="primary" size="medium" onClick={() => setStep('confirm')}>
                Review Export ({exportFiltered.length})
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" color="primary" size="medium" onClick={() => setStep('config')}>Back</Button>
              <Button variant="contained" color="primary" size="medium" startIcon={<FileDownloadOutlined sx={{ fontSize: 16 }} />}
                onClick={doExport}>
                Export {exportFiltered.length} Signal{exportFiltered.length === 1 ? '' : 's'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Detail Pane (inline, not overlay) ──

interface SignalDetailPaneProps {
  signal: FieldSignal;
  user: User | null;
  onCreateTask: (signal: FieldSignal) => void;
  onCreateBroadcast: (signal: FieldSignal) => void;
  onViewConversation: (threadId: string) => void;
  onViewTask: (taskId: string) => void;
}

const SignalDetailPane: React.FC<SignalDetailPaneProps> = ({
  signal, user, onCreateTask, onCreateBroadcast,
  onViewConversation, onViewTask,
}) => {
  const canReview = canReviewFieldSignals(user?.role);
  const st = SIGNAL_STATUS_CONFIG[signal.status];
  const linkedWorkflows: string[] = [];
  if (signal.linkedTaskId) linkedWorkflows.push(`Task ${signal.linkedTaskId}`);
  if (signal.linkedBroadcastId) linkedWorkflows.push(`Broadcast ${signal.linkedBroadcastId}`);

  return (
    <div className="fs-detail-pane">
      <div className="fs-detail-pane-body">
        <div className="fs-detail-meta-grid">
          <div><span className="fs-meta-label">Signal ID</span><span className="fs-meta-mono">{signal.id}</span></div>
          <div><span className="fs-meta-label">Signal Type</span><span>{SIGNAL_TYPE_CONFIG[signal.signalType].label}</span></div>
          <div><span className="fs-meta-label">Status</span><Badge label={st.label} color={st.color} size="small" className={`fs-status--${signal.status}`} /></div>
          <div><span className="fs-meta-label">Store</span><span>{signal.storeName || signal.storeId}</span></div>
          {signal.districtName && <div><span className="fs-meta-label">District</span><span>{signal.districtName}</span></div>}
          <div><span className="fs-meta-label">Impact Window</span><span>{formatSignalDate(signal.impactStartDate)} – {formatSignalDate(signal.impactEndDate)}</span></div>
          <div><span className="fs-meta-label">Expected Impact</span><span>{EXPECTED_IMPACT_CONFIG[signal.expectedImpact].label}</span></div>
          <div><span className="fs-meta-label">Logged By</span><span>{signal.createdByName}</span></div>
          <div><span className="fs-meta-label">Logged Date</span><span>{formatSignalDateTime(signal.createdAt)}</span></div>
        </div>

        {linkedWorkflows.length > 0 && (
          <div className="fs-linked-tags">
            <span className="fs-meta-label">Linked Workflows</span>
            <div className="fs-linked-tags-row">
              {linkedWorkflows.map(t => <span key={t} className="fs-linked-tag">{t}</span>)}
            </div>
          </div>
        )}

        <div className="fs-detail-section">
          <h4>Description</h4>
          <p className="fs-detail-description">{signal.description}</p>
        </div>

        {/* Primary actions — only in header bar to avoid duplication */}

        {canReview && (
          <div className="fs-followup-section">
            <div className="fs-followup-header">
              <span className="fs-followup-label">Follow-up workflows</span>
              <span className="fs-followup-hint">Opens existing flows — review before submitting</span>
            </div>
            <div className="fs-followup-cards">
              <button type="button" className="fs-followup-card" onClick={() => onCreateTask(signal)}>
                <div className="fs-followup-card-icon fs-followup-card-icon--task">
                  <AssignmentOutlined sx={{ fontSize: 20 }} />
                </div>
                <div className="fs-followup-card-body">
                  <span className="fs-followup-card-title">Create Task</span>
                  <span className="fs-followup-card-desc">Prefill from this signal · Assign to team</span>
                </div>
                <OpenInNewOutlined sx={{ fontSize: 14 }} className="fs-followup-card-arrow" />
              </button>
              <button type="button" className="fs-followup-card" onClick={() => onCreateBroadcast(signal)}>
                <div className="fs-followup-card-icon fs-followup-card-icon--broadcast">
                  <CampaignOutlined sx={{ fontSize: 20 }} />
                </div>
                <div className="fs-followup-card-body">
                  <span className="fs-followup-card-title">Create Broadcast</span>
                  <span className="fs-followup-card-desc">Prefill from this signal · Select recipients</span>
                </div>
                <OpenInNewOutlined sx={{ fontSize: 14 }} className="fs-followup-card-arrow" />
              </button>
            </div>
          </div>
        )}

        <div className="fs-detail-section fs-detail-links">
          <h4>Links</h4>
          <div className="fs-links-list">
            {signal.originalThreadId && (
              <div className="fs-link-item">
                <LinkOutlined sx={{ fontSize: 13 }} className="fs-link-item-icon" />
                <span className="fs-link-item-label">Original Conversation</span>
                <button type="button" className="fs-link-item-action" onClick={() => onViewConversation(signal.originalThreadId!)}>
                  Thread #{signal.originalThreadId}
                  <OpenInNewOutlined sx={{ fontSize: 11 }} />
                </button>
              </div>
            )}
            {signal.linkedTaskId && (
              <div className="fs-link-item">
                <AssignmentOutlined sx={{ fontSize: 13 }} className="fs-link-item-icon" />
                <span className="fs-link-item-label">Linked Task</span>
                <button type="button" className="fs-link-item-action" onClick={() => onViewTask(signal.linkedTaskId!)}>
                  {signal.linkedTaskId}
                  <OpenInNewOutlined sx={{ fontSize: 11 }} />
                </button>
              </div>
            )}
            {signal.linkedBroadcastId && (
              <div className="fs-link-item">
                <CampaignOutlined sx={{ fontSize: 13 }} className="fs-link-item-icon" />
                <span className="fs-link-item-label">Linked Broadcast</span>
                <span className="fs-link-item-static">{signal.linkedBroadcastId}</span>
              </div>
            )}
            {!signal.originalThreadId && !signal.linkedTaskId && !signal.linkedBroadcastId && (
              <p className="fs-links-empty">No linked items yet</p>
            )}
          </div>
        </div>

        <div className="fs-detail-section">
          <h4><HistoryOutlined sx={{ fontSize: 14 }} /> Activity History</h4>
          <div className="fs-activity-timeline">
            {[...signal.activityLog].reverse().map((a, idx, arr) => (
              <div key={a.id} className={`fs-timeline-item ${idx === arr.length - 1 ? 'fs-timeline-item--last' : ''}`}>
                <div className="fs-timeline-dot" />
                <div className="fs-timeline-body">
                  <span className="fs-activity-action">{a.action}</span>
                  <span className="fs-activity-meta">
                    {a.actorName} · {formatSignalDateTime(a.timestamp)}
                    {a.notes ? <> · <em>{a.notes}</em></> : null}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Detail Drawer (used from chat card "View Details") ──

interface FieldSignalDetailDrawerProps {
  signal: FieldSignal | null;
  user: User | null;
  onClose: () => void;
  onMarkReviewed: (id: string) => void;
  onCloseSignal: (id: string) => void;
  onCreateTask: (signal: FieldSignal) => void;
  onCreateBroadcast: (signal: FieldSignal) => void;
  onViewConversation: (threadId: string) => void;
  onViewTask: (taskId: string) => void;
}

export const FieldSignalDetailDrawer: React.FC<FieldSignalDetailDrawerProps> = ({
  signal, user, onClose, onMarkReviewed, onCloseSignal, onCreateTask, onCreateBroadcast,
  onViewConversation, onViewTask,
}) => {
  if (!signal) return null;
  const canReview = canReviewFieldSignals(user?.role);
  const st = SIGNAL_STATUS_CONFIG[signal.status];
  const imp = EXPECTED_IMPACT_CONFIG[signal.expectedImpact];
  return (
    <div className="fs-detail-overlay" onClick={onClose}>
      <div className="fs-detail" onClick={e => e.stopPropagation()}>
        <div className="fs-detail-header">
          <div className="fs-detail-header-left">
            <span className="fs-detail-kicker">Field Signal · {signal.id}</span>
            <h3>{signal.title}</h3>
            <div className="fs-detail-header-badges">
              <Badge label={st.label} color={st.color} size="small" className={`fs-status--${signal.status}`} />
              <Badge label={imp.label} color={imp.color} size="small" />
            </div>
          </div>
          <div className="fs-detail-header-actions">
            {canReview && signal.status !== 'closed' && (
              <>
                {signal.status === 'new' && (
                  <Button variant="contained" color="primary" size="small"
                    onClick={() => onMarkReviewed(signal.id)}>
                    Mark as Reviewed
                  </Button>
                )}
                <Button variant="outlined" color="primary" size="small"
                  onClick={() => onCloseSignal(signal.id)}>
                  Close Signal
                </Button>
              </>
            )}
            <button type="button" className="fs-drawer-close" onClick={onClose} aria-label="Close">
              <CloseOutlined sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
        <div className="fs-detail-body">
          <SignalDetailPane signal={signal} user={user}
            onCreateTask={onCreateTask} onCreateBroadcast={onCreateBroadcast}
            onViewConversation={onViewConversation} onViewTask={onViewTask} />
        </div>
      </div>
    </div>
  );
};

// ── Sidebar List — plugs into mc-sidebar exactly like chat list ──

interface FieldSignalSidebarListProps {
  signals: FieldSignal[];
  search: string;
  selectedSignalId: string | null;
  onSearch: (v: string) => void;
  onSelectSignal: (id: string) => void;
  canExport: boolean;
  storeOptions: string[];
}

export const FieldSignalSidebarList: React.FC<FieldSignalSidebarListProps> = ({
  signals, search, selectedSignalId, onSearch, onSelectSignal,
  canExport, storeOptions,
}) => {
  const [showExport, setShowExport] = useState(false);

  const filtered = useMemo(() =>
    signals
      .filter(s => broadSearch(s, search))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [signals, search],
  );

  return (
    <>
      {/* Search — reuses mc-search styles for visual consistency */}
      <div className="mc-search">
        <SearchOutlined sx={{ fontSize: 15 }} />
        <input
          type="text"
          placeholder="Search field signals…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        {search && (
          <button className="mc-search-clear-btn" onClick={() => onSearch('')} aria-label="Clear">
            <CloseOutlined sx={{ fontSize: 13 }} />
          </button>
        )}
      </div>

      {/* Action row — export only (Log is in the + header menu) */}
      {canExport && (
        <div className="fs-sidebar-actions">
          <button type="button" className="fs-sidebar-action-export"
            onClick={() => setShowExport(true)} title="Export field signals">
            <FileDownloadOutlined sx={{ fontSize: 15 }} />
            <span>Export</span>
          </button>
        </div>
      )}

      {/* Signal list — reuses mc-chat-list for visual consistency */}
      <div className="mc-chat-list">
        {filtered.length === 0 ? (
          <div className="mc-chat-list-empty">
            {signals.length === 0
              ? <><SensorsOutlined sx={{ fontSize: 22 }} /><span>No field signals yet</span></>
              : <><SearchOutlined sx={{ fontSize: 22 }} /><span>No signals found</span></>
            }
          </div>
        ) : (
          filtered.map(s => {
            const st = SIGNAL_STATUS_CONFIG[s.status];
            const imp = EXPECTED_IMPACT_CONFIG[s.expectedImpact];
            const isActive = selectedSignalId === s.id;
            const isNew = s.status === 'new';
            return (
              <button
                key={s.id}
                type="button"
                className={`mc-chat-item fs-signal-item ${isActive ? 'mc-chat-item--active' : ''} ${isNew ? 'mc-chat-item--unread' : ''}`}
                onClick={() => onSelectSignal(s.id)}
              >
                <div className={`mc-chat-item-avatar fs-signal-avatar fs-signal-avatar--${s.status}`}>
                  <SensorsOutlined sx={{ fontSize: 18 }} />
                </div>
                <div className="mc-chat-item-body">
                  <div className="mc-chat-item-row">
                    <span className="mc-chat-name">{s.title}</span>
                    <span className="mc-chat-time">{formatSignalDate(s.createdAt)}</span>
                  </div>
                  <div className="fs-signal-item-badges">
                    <Badge label={st.label} color={st.color} size="small" className={`fs-status--${s.status}`} />
                    <Badge label={imp.label} color={imp.color} size="small" />
                  </div>
                  <p className="mc-chat-preview">
                    {s.storeName || s.storeId} · {s.description.slice(0, 48)}{s.description.length > 48 ? '…' : ''}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {showExport && (
        <ExportFieldSignalsDrawer
          signals={signals}
          currentSearchQuery={search}
          storeOptions={storeOptions}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
};

// ── Main Panel — plugs into mc-main exactly like a chat thread ──

interface FieldSignalMainPanelProps {
  selectedSignal: FieldSignal | null;
  user: User | null;
  onMarkReviewed: (id: string) => void;
  onCloseSignal: (id: string) => void;
  onCreateTask: (signal: FieldSignal) => void;
  onCreateBroadcast: (signal: FieldSignal) => void;
  onViewConversation: (threadId: string) => void;
  onViewTask: (taskId: string) => void;
}

export const FieldSignalMainPanel: React.FC<FieldSignalMainPanelProps> = ({
  selectedSignal, user, onMarkReviewed, onCloseSignal, onCreateTask,
  onCreateBroadcast, onViewConversation, onViewTask,
}) => {
  if (!selectedSignal) {
    return (
      <div className="mc-no-chat">
        <EmptyState
          heading="Field Signals"
          description="Select a signal from the list to review details, take action, or launch follow-up workflows."
          emptyStateIcon={<SensorsOutlined sx={{ fontSize: 48 }} />}
        />
      </div>
    );
  }

  const st = SIGNAL_STATUS_CONFIG[selectedSignal.status];
  const imp = EXPECTED_IMPACT_CONFIG[selectedSignal.expectedImpact];
  const canReview = canReviewFieldSignals(user?.role);

  return (
    <div className="fs-main-panel">
      {/* Header — mirrors mc-chat-header */}
      <div className="mc-chat-header">
        <div className="mc-chat-header-left">
          <div className={`mc-chat-header-avatar fs-signal-avatar fs-signal-avatar--${selectedSignal.status}`}>
            <SensorsOutlined sx={{ fontSize: 20 }} />
          </div>
          <div className="mc-chat-header-info">
            <h3>{selectedSignal.title}</h3>
            <div className="mc-chat-header-sub fs-main-header-sub">
              <Badge label={st.label} color={st.color} size="small" className={`fs-status--${selectedSignal.status}`} />
              <Badge label={imp.label} color={imp.color} size="small" />
              <span className="fs-main-header-meta">
                {SIGNAL_TYPE_CONFIG[selectedSignal.signalType].label}
                {' · '}
                {selectedSignal.storeName || selectedSignal.storeId}
              </span>
            </div>
          </div>
        </div>
        {canReview && selectedSignal.status !== 'closed' && (
          <div className="mc-chat-header-actions">
            {selectedSignal.status === 'new' && (
              <Button variant="contained" color="primary" size="small"
                onClick={() => onMarkReviewed(selectedSignal.id)}>
                Mark as Reviewed
              </Button>
            )}
            <Button variant="outlined" color="primary" size="small"
              onClick={() => onCloseSignal(selectedSignal.id)}>
              Close Signal
            </Button>
          </div>
        )}
      </div>

      {/* Content — scrollable detail pane */}
      <div className="fs-main-content">
        <SignalDetailPane
          signal={selectedSignal}
          user={user}
          onCreateTask={onCreateTask}
          onCreateBroadcast={onCreateBroadcast}
          onViewConversation={onViewConversation}
          onViewTask={onViewTask}
        />
      </div>
    </div>
  );
};

export const filterSignalsForRole = (signals: FieldSignal[], user: User | null): FieldSignal[] => {
  if (!user) return signals;
  if (user.role === 'ADMIN' || user.role === 'HQ') return signals;
  if (user.role === 'DM' && user.districtId) {
    return signals.filter(s => !s.districtId || s.districtId === user.districtId);
  }
  if (user.role === 'SM' && (user.storeId || user.store)) {
    const sid = user.storeId || '';
    const sname = user.store || '';
    return signals.filter(s => s.storeId === sid || (s.storeName && sname && s.storeName.includes(sid)) || s.storeName?.includes(sname));
  }
  return signals;
};

export const getActiveSignalsForThread = (signals: FieldSignal[], threadId: string) =>
  signals.filter(s => s.originalThreadId === threadId && s.status !== 'closed');

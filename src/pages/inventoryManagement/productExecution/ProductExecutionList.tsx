import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import { Button, Badge, Tabs } from 'impact-ui';
import { ImFilterSelect } from '../../../components/common/ImFilterSelect';
import {
  PEX_TASKS,
  PEX_SOURCE_LABELS,
  PEX_STATUS_LABELS,
  getPexSummary,
  type PexSource,
  type PexStatus,
  type PexPriority,
  type PexTask,
} from './pexMockData';
import './ProductExecution.css';

const ROWS_PER_PAGE = 8;

const SOURCE_ICON: Record<PexSource, React.ReactNode> = {
  top_performing: <TrendingUpOutlined sx={{ fontSize: 11 }} />,
  emerging:       <AutoAwesomeOutlined sx={{ fontSize: 11 }} />,
  at_risk:        <WarningAmberOutlined sx={{ fontSize: 11 }} />,
  boh_sync:       <InventoryOutlined sx={{ fontSize: 11 }} />,
  phantom_stock:  <ShieldOutlined sx={{ fontSize: 11 }} />,
  pog_compliance: <GridViewOutlined sx={{ fontSize: 11 }} />,
};

type BadgeColor = 'error' | 'warning' | 'info' | 'success' | 'default';

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

function avatarInitials(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export const ProductExecutionList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeName = user?.store ?? 'Downtown Flagship';
  const storeId = user?.storeId ?? 'STR-001';

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const summary = useMemo(() => getPexSummary(PEX_TASKS), []);
  const departments = useMemo(() => Array.from(new Set(PEX_TASKS.map(t => t.department))), []);

  const filtersActive = !!(search.trim() || statusFilter || sourceFilter || priorityFilter || deptFilter);

  const tabCounts = useMemo(() => ({
    all:         PEX_TASKS.length,
    open:        PEX_TASKS.filter(t => t.status === 'open').length,
    in_progress: PEX_TASKS.filter(t => t.status === 'in_progress').length,
    overdue:     PEX_TASKS.filter(t => t.status === 'overdue' || t.status === 'escalated').length,
    resolved:    PEX_TASKS.filter(t => t.status === 'resolved' || t.status === 'dismissed').length,
  }), []);

  const filtered = useMemo(() => {
    let result = [...PEX_TASKS];
    if (activeTab === 'open')             result = result.filter(t => t.status === 'open');
    else if (activeTab === 'in_progress') result = result.filter(t => t.status === 'in_progress');
    else if (activeTab === 'overdue')     result = result.filter(t => t.status === 'overdue' || t.status === 'escalated');
    else if (activeTab === 'resolved')    result = result.filter(t => t.status === 'resolved' || t.status === 'dismissed');
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.productName.toLowerCase().includes(q) ||
        t.sku.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.storeName.toLowerCase().includes(q),
      );
    }
    if (statusFilter)   result = result.filter(t => t.status === statusFilter);
    if (sourceFilter)   result = result.filter(t => t.source === sourceFilter);
    if (priorityFilter) result = result.filter(t => t.priority === priorityFilter);
    if (deptFilter)     result = result.filter(t => t.department.toLowerCase() === deptFilter.toLowerCase());
    return result;
  }, [activeTab, search, statusFilter, sourceFilter, priorityFilter, deptFilter]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  function clearFilters() {
    setSearch(''); setStatusFilter(''); setSourceFilter('');
    setPriorityFilter(''); setDeptFilter(''); setPage(0);
  }

  function handleTabChange(_: unknown, val: string) {
    setActiveTab(val); setPage(0);
    setSearch(''); setStatusFilter(''); setSourceFilter(''); setPriorityFilter(''); setDeptFilter('');
  }

  function handleRowClick(task: PexTask) {
    navigate(`/inventory-management/product-execution/${task.id}`);
  }

  function valueDisplay(task: PexTask) {
    if (task.opportunityValue) {
      return (
        <div className="pex-value-cell">
          <span className="pex-value-amount pex-value-amount--positive">
            +${task.opportunityValue.toLocaleString()}
          </span>
          <span className="pex-value-label">Opportunity</span>
        </div>
      );
    }
    if (task.riskValue) {
      return (
        <div className="pex-value-cell">
          <span className="pex-value-amount pex-value-amount--negative">
            -${task.riskValue.toLocaleString()}
          </span>
          <span className="pex-value-label">Risk Value</span>
        </div>
      );
    }
    return <span className="pex-value-empty">—</span>;
  }

  const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isLoading) {
    return (
      <div className="pex-page">
        <div className="pex-loading">
          <div className="pex-loading-spinner" />
          <p>Loading Product Execution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pex-page">
      {/* ── Header — District Intelligence pattern ── */}
      <div className="pex-page-header">
        <div className="pex-page-header-left">
          <div className="pex-page-title-row">
            <AssignmentOutlined sx={{ fontSize: 22 }} />
            <h1>Product Execution Workspace</h1>
          </div>
          <div className="pex-header-meta">
            <div className="pex-header-store-pill">
              <StoreOutlined sx={{ fontSize: 14 }} />
              <span>{storeName}</span>
              <span className="pex-header-store-id">{storeId}</span>
            </div>
            <div className="pex-header-cycle-pill">
              <CalendarTodayOutlined sx={{ fontSize: 13 }} />
              <span>Week of May 25–31</span>
            </div>
            <span className="pex-header-updated">
              <AccessTimeOutlined sx={{ fontSize: 12 }} />
              Updated {updatedTime}
            </span>
          </div>
        </div>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/command-center/operations-queue')}
        >
          Open Operations Queue
        </Button>
      </div>

      {/* ── Content area ── */}
      <div className="pex-content">

      {/* ── KPI Summary Tiles ── */}
      <div className="sc-inv-summary pex-summary-row">
        <div className="sc-inv-summary-tile sc-inv-summary--total">
          <span className="sc-inv-summary-label">Open Tasks</span>
          <span className="sc-inv-summary-value">{summary.open}</span>
          <span className="sc-inv-summary-sub">active + in progress</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--critical">
          <span className="sc-inv-summary-label">High Priority</span>
          <span className="sc-inv-summary-value">{summary.high}</span>
          <span className="sc-inv-summary-sub">requires attention</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--warn">
          <span className="sc-inv-summary-label">Due Today</span>
          <span className="sc-inv-summary-value">{summary.dueToday}</span>
          <span className="sc-inv-summary-sub">deadline today</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--info">
          <span className="sc-inv-summary-label">Overdue</span>
          <span className="sc-inv-summary-value">{summary.overdue}</span>
          <span className="sc-inv-summary-sub">past due date</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--success">
          <span className="sc-inv-summary-label">Resolved This Week</span>
          <span className="sc-inv-summary-value">{summary.resolvedThisWeek}</span>
          <span className="sc-inv-summary-sub">completed</span>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="pex-tabs-row">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          tabNames={[
            { value: 'all',         label: `All (${tabCounts.all})` },
            { value: 'open',        label: `Open (${tabCounts.open})` },
            { value: 'in_progress', label: `In Progress (${tabCounts.in_progress})` },
            { value: 'overdue',     label: `Overdue / Escalated (${tabCounts.overdue})` },
            { value: 'resolved',    label: `Resolved (${tabCounts.resolved})` },
          ]}
          tabPanels={[]}
        />
      </div>

      {/* ── Premium Filter Bar ── */}
      <div className="sc-inv-premium-filter-bar">
        <div className="sc-inv-search">
          <SearchOutlined sx={{ fontSize: 15 }}/>
          <input
            type="text"
            placeholder="Search products, SKU, department…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
          {search && (
            <button className="sc-inv-search-clear" onClick={() => { setSearch(''); setPage(0); }} aria-label="Clear search">
              <CloseOutlined sx={{ fontSize: 13 }}/>
            </button>
          )}
        </div>
        <div className="sc-inv-filter-divider" aria-hidden="true"/>
        <div className="sc-inv-filter-fields">
          <ImFilterSelect
            placeholder="All Statuses"
            value={statusFilter || 'All'}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'escalated', label: 'Escalated' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'dismissed', label: 'Dismissed' },
            ]}
            isClearable={!!statusFilter}
            minWidth={148}
            onChange={v => { setStatusFilter(v === 'All' ? '' : (v || '')); setPage(0); }}
          />
          <ImFilterSelect
            placeholder="All Sources"
            value={sourceFilter || 'All'}
            options={[
              { value: 'All', label: 'All Sources' },
              { value: 'top_performing', label: 'Top Performing' },
              { value: 'emerging', label: 'Emerging' },
              { value: 'at_risk', label: 'At-Risk' },
              { value: 'boh_sync', label: 'BOH-to-Shelf Sync' },
              { value: 'phantom_stock', label: 'Phantom Stock' },
              { value: 'pog_compliance', label: 'POG Compliance' },
            ]}
            isClearable={!!sourceFilter}
            minWidth={160}
            onChange={v => { setSourceFilter(v === 'All' ? '' : (v || '')); setPage(0); }}
          />
          <ImFilterSelect
            placeholder="All Priorities"
            value={priorityFilter || 'All'}
            options={[
              { value: 'All', label: 'All Priorities' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
            isClearable={!!priorityFilter}
            minWidth={140}
            onChange={v => { setPriorityFilter(v === 'All' ? '' : (v || '')); setPage(0); }}
          />
          <ImFilterSelect
            placeholder="All Departments"
            value={deptFilter || 'All'}
            options={[{ value: 'All', label: 'All Departments' }, ...departments.map(d => ({ value: d, label: d }))]}
            isClearable={!!deptFilter}
            minWidth={160}
            onChange={v => { setDeptFilter(v === 'All' ? '' : (v || '')); setPage(0); }}
          />
        </div>
        {filtersActive && (
          <button className="sc-inv-clear-chip" onClick={clearFilters}>
            <CloseOutlined sx={{ fontSize: 11 }}/> Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="wow-table-wrap sc-inv-wow-table-wrap">
        <div className="sc-inv-table-scroll">
          <table className="wow-table sc-inv-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Department</th>
                <th>Store</th>
                <th>Source</th>
                <th>Value</th>
                <th>Priority</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="pex-empty">
                      <div className="pex-empty-icon"><AssignmentOutlined sx={{ fontSize: 26 }}/></div>
                      <p className="pex-empty-title">No tasks match your filters</p>
                      <p className="pex-empty-sub">Try adjusting your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(task => (
                  <tr key={task.id} className="sc-inv-row sc-inv-row--at-risk" onClick={() => handleRowClick(task)} style={{ cursor: 'pointer' }}>
                    <td className="sc-inv-name">
                      <div className="pex-product-cell">
                        {task.productImage ? (
                          <img src={task.productImage} alt="" className="pex-product-img" loading="lazy"/>
                        ) : (
                          <div className="pex-product-img-placeholder">
                            <InventoryOutlined sx={{ fontSize: 16 }}/>
                          </div>
                        )}
                        <div>
                          <div className="pex-product-name">{task.productName}</div>
                          <div className="pex-product-sku">{task.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="pex-dept-cell">
                        <span className="pex-dept-primary">{task.department}</span>
                        <span className="pex-dept-secondary">{task.subDepartment} · {task.itemClass}</span>
                      </div>
                    </td>
                    <td className="pex-store-cell">{task.storeName}</td>
                    <td>
                      <Badge
                        label={PEX_SOURCE_LABELS[task.source]}
                        color={SOURCE_COLOR[task.source]}
                        size="small"
                        variant="subtle"
                        isIcon
                        icon={SOURCE_ICON[task.source]}
                      />
                    </td>
                    <td>{valueDisplay(task)}</td>
                    <td>
                      <Badge
                        label={task.priority}
                        color={PRIORITY_COLOR[task.priority]}
                        size="small"
                        variant="subtle"
                      />
                    </td>
                    <td>
                      <div className="pex-owner-cell">
                        <div className="pex-owner-avatar">{avatarInitials(task.owner)}</div>
                        <span className="pex-owner-name">{task.owner}</span>
                      </div>
                    </td>
                    <td>
                      <span className={task.status === 'overdue' ? 'pex-due-overdue' : 'pex-due-date'}>
                        {task.dueDate}
                      </span>
                    </td>
                    <td>
                      <Badge
                        label={PEX_STATUS_LABELS[task.status]}
                        color={STATUS_COLOR[task.status]}
                        size="small"
                        variant="subtle"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="ps-pagination">
            <span className="ps-pag-info">
              Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <button className="ps-pag-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeftOutlined sx={{ fontSize: 16 }}/>
            </button>
            <button className="ps-pag-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRightOutlined sx={{ fontSize: 16 }}/>
            </button>
          </div>
        )}
      </div>

      </div>{/* end pex-content */}
    </div>
  );
};

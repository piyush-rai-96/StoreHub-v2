import React, { useState, useMemo, useEffect } from 'react';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import { Button, Badge, Card, Tabs } from 'impact-ui';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { ImDrawer } from '../../../components/common/ImDrawer';
import { ImFilterSelect } from '../../../components/common/ImFilterSelect';
import { OpportunityStatusChip } from './OpportunityStatusChip';
import {
  getApprovalRequests,
  getExecutionRecords,
} from '../../../constants/productOpportunityMock';
import {
  FULFILLMENT_LABELS,
  REASON_CODE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
} from '../../../types/productOpportunity';
import type { AllocationRequest, ExecutionRecord, OpportunityStatus } from '../../../types/productOpportunity';
import './ApprovalsAndExecutionPage.css';

const ROWS_PER_PAGE = 10;

const EXEC_STATUS_TABS: (OpportunityStatus | 'all')[] = [
  'all', 'approved', 'actioned', 'closed', 'rejected', 'unresolved',
];

export const ApprovalsAndExecutionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mainTab, setMainTab] = useState('approvals');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  /* ── Approval state ─────────────────────────────────────── */
  const [selectedReq, setSelectedReq] = useState<AllocationRequest | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const allRequests = useMemo(() => getApprovalRequests(), []);

  /* ── Execution state ────────────────────────────────────── */
  const [execStatusFilter, setExecStatusFilter] = useState('');
  const allRecords = useMemo(() => getExecutionRecords(), []);

  /* ── Filtered data ──────────────────────────────────────── */
  const filteredRequests = useMemo(() => {
    if (!search.trim()) return allRequests;
    const q = search.toLowerCase();
    return allRequests.filter(
      r =>
        r.productName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.storeName.toLowerCase().includes(q) ||
        r.requestId.toLowerCase().includes(q),
    );
  }, [allRequests, search]);

  const filteredRecords = useMemo(() => {
    let result = allRecords;
    if (execStatusFilter) result = result.filter(r => r.status === execStatusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        r =>
          r.productName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.executionId.toLowerCase().includes(q) ||
          r.requestId.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allRecords, execStatusFilter, search]);

  const activeData = mainTab === 'approvals' ? filteredRequests : filteredRecords;
  const totalPages = Math.ceil(activeData.length / ROWS_PER_PAGE);
  const pageStart = page * ROWS_PER_PAGE;
  const pageEnd = Math.min(pageStart + ROWS_PER_PAGE, activeData.length);

  const fmt = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const handleAction = (action: 'approve' | 'reject' | 'request_changes') => {
    if ((action === 'reject' || action === 'request_changes') && !actionComment.trim()) return;
    setActionTaken(
      action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Changes Requested',
    );
  };

  const closeDrawer = () => {
    setSelectedReq(null);
    setActionComment('');
    setActionTaken(null);
  };

  if (isLoading) {
    return (
      <div className="aep-page">
        <div className="po-loading">
          <div className="po-loading-spinner" />
          <p>Loading Approvals & Execution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aep-page">
      {/* ── Header ── */}
      <div className="aep-header">
        <div className="aep-header-left">
          <div className="aep-header-title">
            <GavelOutlined sx={{ fontSize: 22, color: 'var(--ia-color-primary)' }} />
            <h1>Allocation Approvals &amp; Execution</h1>
          </div>
          <div className="aep-header-meta">
            <AccessTimeOutlined sx={{ fontSize: 12 }} />
            <span>Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="aep-content">
      {/* ── Summary Tiles ── */}
      <div className="sc-inv-summary">
        <div className="sc-inv-summary-tile sc-inv-summary--warn">
          <span className="sc-inv-summary-label">Pending Approval</span>
          <span className="sc-inv-summary-value">{allRequests.filter(r => r.status === 'pending_approval').length}</span>
          <span className="sc-inv-summary-sub">awaiting review</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--success">
          <span className="sc-inv-summary-label">Approved</span>
          <span className="sc-inv-summary-value">{allRequests.filter(r => r.status === 'approved').length}</span>
          <span className="sc-inv-summary-sub">ready to execute</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--total">
          <span className="sc-inv-summary-label">In Execution</span>
          <span className="sc-inv-summary-value">{allRecords.filter(r => r.status === 'actioned').length}</span>
          <span className="sc-inv-summary-sub">actively tracked</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--info">
          <span className="sc-inv-summary-label">Closed</span>
          <span className="sc-inv-summary-value">{allRecords.filter(r => r.status === 'closed').length}</span>
          <span className="sc-inv-summary-sub">completed</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--critical">
          <span className="sc-inv-summary-label">Rejected</span>
          <span className="sc-inv-summary-value">{allRequests.filter(r => r.status === 'rejected').length}</span>
          <span className="sc-inv-summary-sub">needs re-submission</span>
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <div className="aep-main-tabs">
        <Tabs
          value={mainTab}
          onChange={(_, v: string) => { setMainTab(v); setPage(0); setSearch(''); setExecStatusFilter(''); }}
          tabNames={[
            { value: 'approvals', label: `Pending Approvals (${allRequests.length})`, icon: <GavelOutlined sx={{ fontSize: 15 }} /> },
            { value: 'execution', label: `Execution Tracking (${allRecords.length})`, icon: <LocalShippingOutlined sx={{ fontSize: 15 }} /> },
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
            placeholder={mainTab === 'approvals' ? 'Search by product, SKU, store, or ID…' : 'Search by product, SKU, or ID…'}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
          {search && (
            <button className="sc-inv-search-clear" onClick={() => { setSearch(''); setPage(0); }}>
              <CloseOutlined sx={{ fontSize: 13 }}/>
            </button>
          )}
        </div>
        {mainTab === 'execution' && (
          <>
            <div className="sc-inv-filter-divider"/>
            <div className="sc-inv-filter-fields">
              <ImFilterSelect
                placeholder="All Statuses"
                value={execStatusFilter || 'All'}
                options={[{ value: 'All', label: 'All Statuses' }, ...EXEC_STATUS_TABS.filter(s => s !== 'all').map(s => ({ value: s, label: OPPORTUNITY_STATUS_LABELS[s as OpportunityStatus] }))]}
                isClearable={!!execStatusFilter}
                minWidth={160}
                onChange={v => { setExecStatusFilter(v === 'All' ? '' : (v || '')); setPage(0); }}
              />
            </div>
          </>
        )}
        {(search || execStatusFilter) && (
          <button className="sc-inv-clear-chip" onClick={() => { setSearch(''); setExecStatusFilter(''); setPage(0); }}>
            <CloseOutlined sx={{ fontSize: 11 }}/> Clear
          </button>
        )}
      </div>

      {/* ═══════════ APPROVALS TABLE ═══════════ */}
      {mainTab === 'approvals' && (
        <div className="wow-table-wrap">
          <table className="wow-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Store</th>
                <th style={{ width: 44 }}></th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Value</th>
                <th style={{ textAlign: 'right' }}>HO Alloc</th>
                <th style={{ textAlign: 'right' }}>Rec. Qty</th>
                <th style={{ textAlign: 'right' }}>Edited Qty</th>
                <th style={{ textAlign: 'right' }}>Diff</th>
                <th>Reason</th>
                <th>Submitted By</th>
                <th>SLA Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 && (
                <tr className="wow-row-empty">
                  <td colSpan={15}>No pending approval requests.</td>
                </tr>
              )}
              {filteredRequests.slice(pageStart, pageEnd).map(req => (
                <tr
                  key={req.requestId}
                  onClick={() => setSelectedReq(req)}
                  style={{ cursor: 'pointer' }}
                  className={selectedReq?.requestId === req.requestId ? 'wow-row-highlight' : ''}
                >
                  <td className="aep-mono">{req.requestId}</td>
                  <td>{req.storeName}</td>
                  <td>
                    <img src={req.productImage} alt={req.productName} className="aep-thumb"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </td>
                  <td><span className="aep-product-name">{req.productName}</span></td>
                  <td className="aep-mono aep-secondary">{req.sku}</td>
                  <td>{req.category}</td>
                  <td className="wow-td-num" style={{ textAlign: 'right' }}>{fmt(req.opportunityValue)}</td>
                  <td style={{ textAlign: 'right' }}>{req.currentHoAllocationQty}</td>
                  <td style={{ textAlign: 'right' }}>{req.recommendedAllocationQty}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{req.editedAllocationQty}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={req.diffVsRecommendation !== 0 ? 'aep-diff-highlight' : ''}>
                      {req.diffVsRecommendation > 0 ? '+' : ''}{req.diffVsRecommendation}
                    </span>
                  </td>
                  <td>{REASON_CODE_LABELS[req.reasonCode]}</td>
                  <td>{req.submittedBy}</td>
                  <td className="aep-date">
                    {new Date(req.slaDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td><OpportunityStatusChip status={req.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="wow-table-footer">
              <span>Showing {pageStart + 1}–{pageEnd} of {filteredRequests.length}</span>
              <div className="wow-table-pager">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeftOutlined sx={{ fontSize: 16 }} /></button>
                <span>Page {page + 1} of {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRightOutlined sx={{ fontSize: 16 }} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ EXECUTION TABLE ═══════════ */}
      {mainTab === 'execution' && (
        <div className="wow-table-wrap">
          <table className="wow-table">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Request ID</th>
                <th>Store</th>
                <th style={{ width: 44 }}></th>
                <th>Product</th>
                <th>SKU</th>
                <th>Fulfillment</th>
                <th style={{ textAlign: 'right' }}>Approved Qty</th>
                <th>Downstream Status</th>
                <th>Sent to Exec</th>
                <th>Confirmed</th>
                <th>Owner / Stage</th>
                <th>SLA Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && (
                <tr className="wow-row-empty">
                  <td colSpan={14}>No execution records found.</td>
                </tr>
              )}
              {filteredRecords.slice(pageStart, pageEnd).map((rec: ExecutionRecord) => (
                <tr key={rec.executionId}>
                  <td className="aep-mono">{rec.executionId}</td>
                  <td className="aep-mono">{rec.requestId}</td>
                  <td>{rec.storeName}</td>
                  <td>
                    <img src={rec.productImage} alt={rec.productName} className="aep-thumb"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </td>
                  <td><span className="aep-product-name">{rec.productName}</span></td>
                  <td className="aep-mono aep-secondary">{rec.sku}</td>
                  <td>{FULFILLMENT_LABELS[rec.fulfillmentPath]}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{rec.approvedAllocationQty}</td>
                  <td><span className="aep-downstream">{rec.downstreamSystemStatus}</span></td>
                  <td className="aep-date">
                    {rec.sentToExecutionDate ? new Date(rec.sentToExecutionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="aep-date">
                    {rec.executionConfirmationDate ? new Date(rec.executionConfirmationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td>
                    <div className="aep-owner-cell">
                      <span className="aep-owner">{rec.currentOwner}</span>
                      <span className="aep-stage">{rec.currentStage}</span>
                    </div>
                  </td>
                  <td className="aep-date">
                    {new Date(rec.slaDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td><OpportunityStatusChip status={rec.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {Math.ceil(filteredRecords.length / ROWS_PER_PAGE) > 1 && (
            <div className="wow-table-footer">
              <span>Showing {pageStart + 1}–{pageEnd} of {filteredRecords.length}</span>
              <div className="wow-table-pager">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeftOutlined sx={{ fontSize: 16 }} /></button>
                <span>Page {page + 1} of {Math.ceil(filteredRecords.length / ROWS_PER_PAGE)}</span>
                <button disabled={page >= Math.ceil(filteredRecords.length / ROWS_PER_PAGE) - 1} onClick={() => setPage(p => p + 1)}><ChevronRightOutlined sx={{ fontSize: 16 }} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      </div>

      {/* ═══════════ APPROVAL DETAIL DRAWER ═══════════ */}
      {selectedReq && (
        <ImDrawer
          open
          onClose={closeDrawer}
          title={`Review: ${selectedReq.productName}`}
          subtitle={`${selectedReq.requestId} · ${selectedReq.sku}`}
          width={600}
          footer={
            actionTaken ? (
              <div className="aep-drawer-footer">
                <Badge
                  label={actionTaken}
                  color={actionTaken === 'Approved' ? 'success' : actionTaken === 'Rejected' ? 'error' : 'warning'}
                  variant="subtle"
                  size="medium"
                />
                <Button variant="outlined" color="primary" onClick={closeDrawer}>Close</Button>
              </div>
            ) : (
              <div className="aep-drawer-footer">
                <Button variant="outlined" color="error" startIcon={<CancelOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => handleAction('reject')} disabled={!actionComment.trim()}>
                  Reject
                </Button>
                <Button variant="outlined" color="primary" startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => handleAction('request_changes')} disabled={!actionComment.trim()}>
                  Request Changes
                </Button>
                <Button variant="contained" color="success" startIcon={<CheckCircleOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => handleAction('approve')}>
                  Approve
                </Button>
              </div>
            )
          }
        >
          <div className="aep-detail">
            {/* Request Context */}
            <div className="aep-detail-section">
              <h4 className="aep-detail-title">Request Context</h4>
              <div className="aep-detail-grid">
                <div className="aep-detail-row"><span className="aep-detail-label">Store</span><span className="aep-detail-value">{selectedReq.storeName}</span></div>
                <div className="aep-detail-row"><span className="aep-detail-label">Region</span><span className="aep-detail-value">{selectedReq.region}</span></div>
                <div className="aep-detail-row"><span className="aep-detail-label">Submitted By</span><span className="aep-detail-value">{selectedReq.submittedBy}</span></div>
                <div className="aep-detail-row"><span className="aep-detail-label">Submitted</span><span className="aep-detail-value">{new Date(selectedReq.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                <div className="aep-detail-row"><span className="aep-detail-label">SLA Due</span><span className="aep-detail-value">{new Date(selectedReq.slaDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                <div className="aep-detail-row"><span className="aep-detail-label">Fulfillment</span><span className="aep-detail-value">{FULFILLMENT_LABELS[selectedReq.fulfillmentSource]}</span></div>
              </div>
            </div>

            {/* Allocation Comparison */}
            <div className="aep-detail-section">
              <h4 className="aep-detail-title">Allocation Comparison</h4>
              <div className="aep-comparison-cards">
                <Card size="extraSmall" sx={{ padding: '14px', minHeight: 0, flex: 1 }}>
                  <span className="aep-card-label">HO Allocation</span>
                  <span className="aep-card-value">{selectedReq.currentHoAllocationQty}</span>
                </Card>
                <Card size="extraSmall" sx={{ padding: '14px', minHeight: 0, flex: 1 }}>
                  <span className="aep-card-label">Recommended</span>
                  <span className="aep-card-value aep-card-value--accent">{selectedReq.recommendedAllocationQty}</span>
                </Card>
                <Card size="extraSmall" sx={{ padding: '14px', minHeight: 0, flex: 1 }}>
                  <span className="aep-card-label">Edited</span>
                  <span className="aep-card-value aep-card-value--bold">{selectedReq.editedAllocationQty}</span>
                </Card>
              </div>
              <div className="aep-detail-grid" style={{ marginTop: 12 }}>
                <div className="aep-detail-row">
                  <span className="aep-detail-label">Diff vs Recommendation</span>
                  <span className={`aep-detail-value ${selectedReq.diffVsRecommendation !== 0 ? 'aep-diff-highlight' : ''}`}>
                    {selectedReq.diffVsRecommendation > 0 ? '+' : ''}{selectedReq.diffVsRecommendation}
                  </span>
                </div>
                <div className="aep-detail-row">
                  <span className="aep-detail-label">Reason Code</span>
                  <span className="aep-detail-value">{REASON_CODE_LABELS[selectedReq.reasonCode]}</span>
                </div>
              </div>
            </div>

            {/* Requester Comment */}
            {selectedReq.comment && (
              <div className="aep-detail-section">
                <h4 className="aep-detail-title">Requester Comment</h4>
                <p className="aep-detail-comment">{selectedReq.comment}</p>
              </div>
            )}

            {/* Inventory Context */}
            <div className="aep-detail-section">
              <h4 className="aep-detail-title">Inventory Context</h4>
              <div className="aep-stat-row">
                <div className="aep-stat"><span className="aep-stat-label">Store Stock</span><span className="aep-stat-value">{selectedReq.currentStoreStock}</span></div>
                <div className="aep-stat"><span className="aep-stat-label">In-Transit</span><span className="aep-stat-value">{selectedReq.inTransitQty}</span></div>
                <div className="aep-stat"><span className="aep-stat-label">DC Available</span><span className="aep-stat-value">{selectedReq.dcAvailableQty}</span></div>
                <div className="aep-stat"><span className="aep-stat-label">Transfer Avail</span><span className="aep-stat-value">{selectedReq.transferAvailableQty}</span></div>
              </div>
              <div className="aep-stat-row">
                <div className="aep-stat"><span className="aep-stat-label">Sales (7d)</span><span className="aep-stat-value">{selectedReq.salesLast7Days}</span></div>
                <div className="aep-stat"><span className="aep-stat-label">Sales (30d)</span><span className="aep-stat-value">{selectedReq.salesLast30Days}</span></div>
                <div className="aep-stat"><span className="aep-stat-label">Forecast</span><span className="aep-stat-value">{selectedReq.forecastDemand}</span></div>
                <div className="aep-stat"><span className="aep-stat-label">Value</span><span className="aep-stat-value">{fmt(selectedReq.opportunityValue)}</span></div>
              </div>
            </div>

            {/* Approver Comment */}
            {!actionTaken && (
              <div className="aep-detail-section">
                <h4 className="aep-detail-title">Approver Comment</h4>
                <textarea
                  className="aep-textarea"
                  rows={3}
                  placeholder="Add a comment (required for reject / request changes)..."
                  value={actionComment}
                  onChange={e => setActionComment(e.target.value)}
                />
              </div>
            )}
          </div>
        </ImDrawer>
      )}
    </div>
  );
};

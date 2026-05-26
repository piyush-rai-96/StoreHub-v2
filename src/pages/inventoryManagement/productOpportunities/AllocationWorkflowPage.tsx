import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Button, Badge } from 'impact-ui';
import { ImFilterSelect } from '../../../components/common/ImFilterSelect';
import { OpportunityStatusChip } from './OpportunityStatusChip';
import { getOpportunityById, addApprovalRequest } from '../../../constants/productOpportunityMock';
import {
  FULFILLMENT_LABELS,
  REASON_CODE_LABELS,
} from '../../../types/productOpportunity';
import type { FulfillmentPath, ReasonCode } from '../../../types/productOpportunity';
import './AllocationWorkflowPage.css';

const FULFILLMENT_OPTIONS = Object.entries(FULFILLMENT_LABELS)
  .filter(([k]) => k !== 'no_action')
  .map(([value, label]) => ({ value, label }));

const REASON_OPTIONS = Object.entries(REASON_CODE_LABELS).map(([value, label]) => ({ value, label }));

export const AllocationWorkflowPage: React.FC = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const opp = useMemo(() => getOpportunityById(opportunityId ?? ''), [opportunityId]);

  const [editedQty, setEditedQty]         = useState(opp?.recommendedAllocationQty ?? 0);
  const [fulfillment, setFulfillment]     = useState<FulfillmentPath>(opp?.recommendedFulfillmentPath ?? 'dc_allocation');
  const [reasonCode, setReasonCode]       = useState<ReasonCode>('high_velocity');
  const [requiredByDate, setRequiredByDate] = useState('2026-05-28');
  const [comment, setComment]             = useState('');
  const [status, setStatus]               = useState(opp?.status ?? 'open');
  const [saved, setSaved]                 = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  if (!opp) {
    return (
      <div className="aw-page">
        <div className="aw-empty">
          <p>Opportunity not found.</p>
          <Button variant="outlined" color="primary" onClick={() => navigate('/inventory-management/product-opportunities')}>
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  const diffVsCurrent      = editedQty - opp.currentHoAllocationQty;
  const diffVsRecommended  = editedQty - opp.recommendedAllocationQty;
  const needsComment       = diffVsRecommended !== 0;
  const fmt = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const handleSaveDraft = () => {
    setStatus('in_progress');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canSubmit = editedQty > 0 && reasonCode && fulfillment && (!needsComment || comment.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStatus('pending_approval');
    setSubmitted(true);
    // Push into shared approval queue so ApprovalsAndExecution shows it
    addApprovalRequest({
      opportunityId: opp.id,
      storeId: opp.storeId,
      storeName: opp.storeName,
      region: opp.region,
      productImage: opp.productImage,
      productName: opp.productName,
      sku: opp.sku,
      category: opp.category,
      opportunityType: opp.opportunityType,
      opportunityValue: opp.opportunityValue,
      currentHoAllocationQty: opp.currentHoAllocationQty,
      recommendedAllocationQty: opp.recommendedAllocationQty,
      editedAllocationQty: editedQty,
      approvedAllocationQty: 0,
      fulfillmentSource: fulfillment,
      requiredByDate: requiredByDate,
      reasonCode: reasonCode,
      comment: comment,
      diffVsRecommendation: editedQty - opp.recommendedAllocationQty,
      allocationDelta: editedQty - opp.currentHoAllocationQty,
      submittedBy: 'Store Manager',
      dcAvailableQty: opp.dcAvailableQty,
      transferAvailableQty: opp.transferAvailableQty,
      salesLast7Days: opp.salesLast7Days,
      salesLast30Days: opp.salesLast30Days,
      forecastDemand: opp.forecastDemand,
      currentStoreStock: opp.currentStoreStock,
      inTransitQty: opp.inTransitQty,
      receivedQty: opp.receivedQty,
    });
  };

  const typeColor =
    opp.opportunityType === 'at_risk'  ? 'error'   as const :
    opp.opportunityType === 'emerging' ? 'info'    as const : 'success' as const;

  return (
    <div className="aw-page">

      {/* ══════════════════════════════════════════════
          BACK NAV
      ══════════════════════════════════════════════ */}
      <div className="aw-breadcrumb">
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBackOutlined sx={{ fontSize: 16 }} />}
          onClick={() => navigate('/inventory-management/product-opportunities')}
        >
          Back to Product Opportunities
        </Button>
      </div>

      {/* ══════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════ */}
      <div className="aw-hero">
        <div className="aw-hero-top">
          {opp.productImage && (
            <img
              src={opp.productImage}
              alt={opp.productName}
              className="aw-hero-img"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="aw-hero-info">
            <div className="aw-hero-badges">
              <OpportunityStatusChip status={status} size="small" />
              <Badge
                label={opp.opportunityType.replace(/_/g, ' ')}
                color={typeColor}
                variant="subtle"
                size="small"
              />
              <Badge
                label={opp.priority.charAt(0).toUpperCase() + opp.priority.slice(1)}
                color={opp.priority === 'critical' || opp.priority === 'high' ? 'error' : opp.priority === 'medium' ? 'warning' : 'info'}
                variant="subtle"
                size="small"
              />
            </div>
            <h1 className="aw-hero-title">{opp.productName}</h1>
            <div className="aw-hero-meta">
              <span className="aw-hero-sku">{opp.sku}</span>
              <span className="aw-hero-sep" />
              <StorefrontOutlined sx={{ fontSize: 13 }} />
              <span>{opp.storeName}</span>
              <span className="aw-hero-sep" />
              <CalendarTodayOutlined sx={{ fontSize: 13 }} />
              <span>{opp.allocationCycle}</span>
              <span className="aw-hero-sep" />
              <span className="aw-hero-category">{opp.category}</span>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="aw-hero-kpis">
          <div className="aw-hero-kpi">
            <span className="aw-hero-kpi-label">Opportunity Value</span>
            <span className="aw-hero-kpi-value aw-hero-kpi--green">{fmt(opp.opportunityValue)}</span>
          </div>
          <div className="aw-hero-kpi-divider" />
          <div className="aw-hero-kpi">
            <span className="aw-hero-kpi-label">Lost Sales Risk</span>
            <span className="aw-hero-kpi-value aw-hero-kpi--red">{fmt(opp.lostSalesRisk)}</span>
          </div>
          <div className="aw-hero-kpi-divider" />
          <div className="aw-hero-kpi">
            <span className="aw-hero-kpi-label">Current HO Alloc</span>
            <span className="aw-hero-kpi-value">{opp.currentHoAllocationQty} units</span>
          </div>
          <div className="aw-hero-kpi-divider" />
          <div className="aw-hero-kpi">
            <span className="aw-hero-kpi-label">Recommended</span>
            <span className="aw-hero-kpi-value aw-hero-kpi--blue">{opp.recommendedAllocationQty} units</span>
          </div>
          <div className="aw-hero-kpi-divider" />
          <div className="aw-hero-kpi">
            <span className="aw-hero-kpi-label">Allocation Gap</span>
            <span className="aw-hero-kpi-value aw-hero-kpi--amber">+{opp.allocationGap} units</span>
          </div>
        </div>
      </div>

      {submitted ? (
        /* ══════ SUCCESS STATE ══════ */
        <div className="aw-submitted-wrap">
          <div className="aw-submitted-card">
            <div className="aw-submitted-icon">
              <CheckCircleOutlined sx={{ fontSize: 48 }} />
            </div>
            <h2 className="aw-submitted-title">Allocation Submitted for Approval</h2>
            <p className="aw-submitted-desc">
              Your allocation change for <strong>{opp.productName}</strong> has been submitted and is now pending review by the allocation team.
            </p>
            <div className="aw-submitted-pills">
              <span className="aw-submitted-pill">{opp.allocationCycle}</span>
              <span className="aw-submitted-pill">{editedQty} units</span>
              <span className="aw-submitted-pill">{FULFILLMENT_LABELS[fulfillment]}</span>
            </div>
            <div className="aw-submitted-actions">
              <Button variant="outlined" color="primary" onClick={() => navigate('/inventory-management/product-opportunities')}>
                Back to Opportunities
              </Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/inventory-management/approvals-and-execution')}>
                View Approval Queue
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="aw-body">

          {/* ══════════════════════════════════════════════
              TOP ROW: Review + Recommendation side-by-side
          ══════════════════════════════════════════════ */}
          <div className="aw-two-col">

            {/* ── A. Current Allocation Review ── */}
            <div className="aw-card">
              <div className="aw-card-header">
                <InventoryOutlined sx={{ fontSize: 17 }} />
                <h3>Current Allocation Review</h3>
                <Badge label="Read Only" color="default" variant="subtle" size="small" />
              </div>
              <div className="aw-data-table">
                {[
                  { label: 'HO Allocation ID',  value: opp.hoAllocationId,          mod: '' },
                  { label: 'Allocation Cycle',   value: opp.allocationCycle,         mod: '' },
                  { label: 'HO Allocation Qty',  value: opp.currentHoAllocationQty,  mod: 'bold' },
                  { label: 'Received Qty',       value: opp.receivedQty,             mod: '' },
                  { label: 'In-Transit Qty',     value: opp.inTransitQty,            mod: '' },
                  { label: 'Store Stock',        value: opp.currentStoreStock,       mod: 'warn' },
                  { label: 'Required Qty',       value: opp.requiredQty,             mod: '' },
                  { label: 'Allocation Gap',     value: `+${opp.allocationGap}`,     mod: 'gap' },
                ].map(({ label, value, mod }) => (
                  <div key={label} className="aw-data-row">
                    <span className="aw-data-label">{label}</span>
                    <span className={`aw-data-value${mod ? ` aw-data-value--${mod}` : ''}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── B. Recommendation ── */}
            <div className="aw-card">
              <div className="aw-card-header">
                <LightbulbOutlined sx={{ fontSize: 17 }} />
                <h3>AI Recommendation</h3>
                <Badge label="Auto-Generated" color="info" variant="subtle" size="small" />
              </div>

              {/* Recommendation highlight tiles */}
              <div className="aw-rec-tiles">
                <div className="aw-rec-tile aw-rec-tile--blue">
                  <span className="aw-rec-tile-label">Recommended Qty</span>
                  <span className="aw-rec-tile-value">{opp.recommendedAllocationQty}</span>
                </div>
                <div className="aw-rec-tile aw-rec-tile--green">
                  <span className="aw-rec-tile-label">Opportunity Value</span>
                  <span className="aw-rec-tile-value">{fmt(opp.opportunityValue)}</span>
                </div>
              </div>

              <div className="aw-data-table aw-data-table--compact">
                {[
                  { label: 'Recommended Change',  value: `+${opp.allocationGap} units`, mod: 'accent' },
                  { label: 'DC Available',         value: opp.dcAvailableQty,            mod: '' },
                  { label: 'Transfer Available',   value: opp.transferAvailableQty,      mod: '' },
                  { label: 'Fulfillment Path',     value: FULFILLMENT_LABELS[opp.recommendedFulfillmentPath], mod: '' },
                  { label: 'Expected Coverage',    value: opp.expectedCoverageImprovement, mod: 'ok' },
                ].map(({ label, value, mod }) => (
                  <div key={label} className="aw-data-row">
                    <span className="aw-data-label">{label}</span>
                    <span className={`aw-data-value${mod ? ` aw-data-value--${mod}` : ''}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Why flagged */}
              <div className="aw-flag-reason">
                <InfoOutlined sx={{ fontSize: 14 }} />
                <p>{opp.flagReason}</p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              EDIT ALLOCATION
          ══════════════════════════════════════════════ */}
          <div className="aw-card aw-card--edit">
            <div className="aw-card-header">
              <EditOutlined sx={{ fontSize: 17 }} />
              <h3>Edit Allocation</h3>
              <span className="aw-card-header-sub">Fill in the fields below and send for approval</span>
            </div>

            <div className="aw-edit-grid">
              <div className="aw-edit-field">
                <label className="aw-edit-label">Edited Allocation Qty</label>
                <input
                  className="aw-edit-input"
                  type="number"
                  value={editedQty}
                  onChange={e => setEditedQty(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="aw-edit-field">
                <label className="aw-edit-label">Fulfillment Source</label>
                <ImFilterSelect
                  value={fulfillment}
                  options={FULFILLMENT_OPTIONS}
                  onChange={v => setFulfillment((v || 'dc_allocation') as FulfillmentPath)}
                  isClearable={false}
                  minWidth={220}
                />
              </div>
              <div className="aw-edit-field">
                <label className="aw-edit-label">Required By Date</label>
                <input
                  className="aw-edit-input"
                  type="date"
                  value={requiredByDate}
                  onChange={e => setRequiredByDate(e.target.value)}
                />
              </div>
              <div className="aw-edit-field">
                <label className="aw-edit-label">Reason Code</label>
                <ImFilterSelect
                  value={reasonCode}
                  options={REASON_OPTIONS}
                  onChange={v => setReasonCode((v || 'high_velocity') as ReasonCode)}
                  isClearable={false}
                  minWidth={220}
                />
              </div>
              <div className="aw-edit-field aw-edit-field--full">
                <label className="aw-edit-label">
                  Comment
                  {needsComment && (
                    <span className="aw-required"> * Required — qty differs from recommendation</span>
                  )}
                </label>
                <textarea
                  className="aw-textarea"
                  rows={3}
                  placeholder="Add a comment explaining the allocation change..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>
            </div>

            {/* ── Comparison Summary Tiles ── */}
            <div className="aw-cmp-summary">
              <div className={`aw-cmp-tile ${diffVsCurrent > 0 ? 'aw-cmp-tile--up' : diffVsCurrent < 0 ? 'aw-cmp-tile--down' : 'aw-cmp-tile--neutral'}`}>
                <span className="aw-cmp-tile-label">vs Current HO Alloc</span>
                <span className="aw-cmp-tile-value">
                  {diffVsCurrent > 0 ? '+' : ''}{diffVsCurrent} units
                </span>
              </div>
              <div className={`aw-cmp-tile ${diffVsRecommended > 0 ? 'aw-cmp-tile--up' : diffVsRecommended < 0 ? 'aw-cmp-tile--down' : 'aw-cmp-tile--neutral'}`}>
                <span className="aw-cmp-tile-label">vs AI Recommendation</span>
                <span className="aw-cmp-tile-value">
                  {diffVsRecommended > 0 ? '+' : ''}{diffVsRecommended} units
                </span>
              </div>
              <div className="aw-cmp-tile aw-cmp-tile--total">
                <span className="aw-cmp-tile-label">New Allocation Total</span>
                <span className="aw-cmp-tile-value">{editedQty} units</span>
              </div>
              <div className="aw-cmp-tile aw-cmp-tile--fulfillment">
                <span className="aw-cmp-tile-label">Fulfillment Path</span>
                <span className="aw-cmp-tile-value aw-cmp-tile-value--sm">{FULFILLMENT_LABELS[fulfillment]}</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              ACTION BAR
          ══════════════════════════════════════════════ */}
          <div className="aw-action-bar">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/inventory-management/product-opportunities')}
            >
              Cancel
            </Button>
            <div className="aw-action-bar-right">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SaveOutlined sx={{ fontSize: 16 }} />}
                onClick={handleSaveDraft}
              >
                {saved ? 'Saved!' : 'Save as Draft'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendOutlined sx={{ fontSize: 16 }} />}
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                Send for Approval
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

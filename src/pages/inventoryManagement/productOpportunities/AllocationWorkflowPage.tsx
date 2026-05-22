import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import { Button, Badge, Card, Input } from 'impact-ui';
import { ImFilterSelect } from '../../../components/common/ImFilterSelect';
import { OpportunityStatusChip } from './OpportunityStatusChip';
import { getOpportunityById } from '../../../constants/productOpportunityMock';
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

  const [editedQty, setEditedQty] = useState(opp?.recommendedAllocationQty ?? 0);
  const [fulfillment, setFulfillment] = useState<FulfillmentPath>(opp?.recommendedFulfillmentPath ?? 'dc_allocation');
  const [reasonCode, setReasonCode] = useState<ReasonCode>('high_velocity');
  const [requiredByDate, setRequiredByDate] = useState('2026-05-28');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(opp?.status ?? 'open');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const diffVsCurrent = editedQty - opp.currentHoAllocationQty;
  const diffVsRecommended = editedQty - opp.recommendedAllocationQty;
  const needsComment = diffVsRecommended !== 0;

  const fmt = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const handleSaveDraft = () => {
    setStatus('in_progress');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canSubmit =
    editedQty > 0 &&
    reasonCode &&
    fulfillment &&
    (!needsComment || comment.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStatus('pending_approval');
    setSubmitted(true);
  };

  return (
    <div className="aw-page">
      {/* ── Header ── */}
      <div className="aw-header">
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/inventory-management/product-opportunities')}
        >
          Back to Opportunities
        </Button>
        <div className="aw-header-content">
          <div className="aw-header-top">
            <h1 className="aw-title">Allocation Workflow</h1>
            <OpportunityStatusChip status={status} size="medium" />
          </div>
          <p className="aw-subtitle">Review, adjust, and submit allocation changes for approval.</p>
          <div className="aw-context">
            <span><strong>Store:</strong> {opp.storeName}</span>
            <span><strong>Product:</strong> {opp.productName}</span>
            <span><strong>SKU:</strong> {opp.sku}</span>
            <span><strong>Type:</strong> {opp.opportunityType.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="aw-submitted-card">
          <Card size="extraSmall" sx={{ padding: 0, minHeight: 0 }}>
            <div className="aw-submitted-content">
              <SendOutlined sx={{ fontSize: 32, color: 'var(--ia-color-success)' }} />
              <h2>Allocation Submitted for Approval</h2>
              <p>
                Your allocation change request for <strong>{opp.productName}</strong> has been submitted.
                It is now pending approval.
              </p>
              <div className="aw-submitted-actions">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/inventory-management/product-opportunities')}
                >
                  Back to Opportunities
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/inventory-management/approvals-and-execution')}
                >
                  View Approval Queue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="aw-grid">
          {/* ── A. Current Allocation Review ── */}
          <div className="aw-panel">
            <div className="aw-panel-header">
              <InventoryOutlined sx={{ fontSize: 18 }} />
              <h3>Current Allocation Review</h3>
              <Badge label="Read Only" color="default" variant="subtle" size="small" />
            </div>
            <Card size="extraSmall" sx={{ padding: 0, minHeight: 0 }}>
              <div className="aw-alloc-grid">
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">HO Allocation ID</span>
                  <span className="aw-alloc-value">{opp.hoAllocationId}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Allocation Cycle</span>
                  <span className="aw-alloc-value">{opp.allocationCycle}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">HO Allocation Qty</span>
                  <span className="aw-alloc-value aw-alloc-value--bold">{opp.currentHoAllocationQty}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Received Qty</span>
                  <span className="aw-alloc-value">{opp.receivedQty}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">In-Transit Qty</span>
                  <span className="aw-alloc-value">{opp.inTransitQty}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Store Stock</span>
                  <span className="aw-alloc-value">{opp.currentStoreStock}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Required Qty</span>
                  <span className="aw-alloc-value">{opp.requiredQty}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Allocation Gap</span>
                  <span className="aw-alloc-value aw-alloc-value--gap">+{opp.allocationGap}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* ── B. Recommendation Panel ── */}
          <div className="aw-panel">
            <div className="aw-panel-header">
              <LightbulbOutlined sx={{ fontSize: 18 }} />
              <h3>Recommendation</h3>
            </div>
            <Card size="extraSmall" sx={{ padding: 0, minHeight: 0 }}>
              <div className="aw-alloc-grid">
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Recommended Qty</span>
                  <span className="aw-alloc-value aw-alloc-value--accent">{opp.recommendedAllocationQty}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Recommended Change</span>
                  <span className="aw-alloc-value">+{opp.allocationGap} units</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Opportunity Value</span>
                  <span className="aw-alloc-value">{fmt(opp.opportunityValue)}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">DC Available</span>
                  <span className="aw-alloc-value">{opp.dcAvailableQty}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Transfer Available</span>
                  <span className="aw-alloc-value">{opp.transferAvailableQty}</span>
                </div>
                <div className="aw-alloc-row">
                  <span className="aw-alloc-label">Fulfillment Path</span>
                  <span className="aw-alloc-value">{FULFILLMENT_LABELS[opp.recommendedFulfillmentPath]}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* ── C. Edit Allocation ── */}
          <div className="aw-panel aw-panel--full">
            <div className="aw-panel-header">
              <EditOutlined sx={{ fontSize: 18 }} />
              <h3>Edit Allocation</h3>
            </div>
            <Card size="extraSmall" sx={{ padding: '20px', minHeight: 0 }}>
              <div className="aw-edit-grid">
                <div className="aw-edit-field">
                  <label className="aw-edit-label">Edited Allocation Qty</label>
                  <Input
                    type="number"
                    value={String(editedQty)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedQty(Number(e.target.value))}
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
                  <Input
                    type="date"
                    value={requiredByDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequiredByDate(e.target.value)}
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
                    Comment {needsComment && <span className="aw-required">* Required (qty differs from recommendation)</span>}
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

              {/* Comparison Strip */}
              <div className="aw-comparison-strip">
                <div className="aw-comparison-item">
                  <span className="aw-comparison-label">vs Current HO Alloc</span>
                  <span className={`aw-comparison-value ${diffVsCurrent > 0 ? 'aw-comparison--positive' : diffVsCurrent < 0 ? 'aw-comparison--negative' : ''}`}>
                    {diffVsCurrent > 0 ? '+' : ''}{diffVsCurrent} units
                  </span>
                </div>
                <div className="aw-comparison-item">
                  <span className="aw-comparison-label">vs Recommendation</span>
                  <span className={`aw-comparison-value ${diffVsRecommended > 0 ? 'aw-comparison--positive' : diffVsRecommended < 0 ? 'aw-comparison--negative' : ''}`}>
                    {diffVsRecommended > 0 ? '+' : ''}{diffVsRecommended} units
                  </span>
                </div>
                <div className="aw-comparison-item">
                  <span className="aw-comparison-label">Allocation Delta</span>
                  <span className="aw-comparison-value aw-comparison--bold">
                    {diffVsCurrent > 0 ? '+' : ''}{diffVsCurrent} units
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Actions ── */}
          <div className="aw-actions">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/inventory-management/product-opportunities')}
            >
              Cancel
            </Button>
            <div className="aw-actions-right">
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

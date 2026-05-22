import React from 'react';
import { Button, Badge, Card } from 'impact-ui';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import { ImDrawer } from '../../../components/common/ImDrawer';
import { OpportunityStatusChip } from './OpportunityStatusChip';
import type { ProductOpportunity } from '../../../types/productOpportunity';
import {
  OPPORTUNITY_TYPE_LABELS,
  FULFILLMENT_LABELS,
} from '../../../types/productOpportunity';
import './ProductDetailDrawer.css';

interface Props {
  opportunity: ProductOpportunity | null;
  onClose: () => void;
  onGoToWorkflow: (opp: ProductOpportunity) => void;
}

export const ProductDetailDrawer: React.FC<Props> = ({ opportunity, onClose, onGoToWorkflow }) => {
  if (!opportunity) return null;
  const opp = opportunity;

  const fmt = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const priorityColor = {
    critical: 'error' as const,
    high: 'error' as const,
    medium: 'warning' as const,
    low: 'info' as const,
  }[opp.priority];

  return (
    <ImDrawer
      open
      onClose={onClose}
      title={opp.productName}
      subtitle={`${opp.sku} · ${opp.category}`}
      width={640}
      footer={
        <div className="pdd-footer">
          <Button variant="outlined" color="primary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardOutlined sx={{ fontSize: 16 }} />}
            onClick={() => onGoToWorkflow(opp)}
          >
            Go to Allocation Workflow
          </Button>
        </div>
      }
    >
      <div className="pdd-content">
        {/* ── A. Product Header ── */}
        <div className="pdd-header-card">
          <img src={opp.productImage} alt={opp.productName} className="pdd-product-img" />
          <div className="pdd-header-info">
            <div className="pdd-header-badges">
              <Badge
                label={OPPORTUNITY_TYPE_LABELS[opp.opportunityType]}
                color={opp.opportunityType === 'at_risk' ? 'error' : opp.opportunityType === 'emerging' ? 'info' : 'success'}
                variant="subtle"
                size="small"
              />
              <OpportunityStatusChip status={opp.status} />
              <Badge label={opp.priority.charAt(0).toUpperCase() + opp.priority.slice(1)} color={priorityColor} variant="subtle" size="small" />
            </div>
            <div className="pdd-header-meta">
              <span><strong>Value:</strong> {fmt(opp.opportunityValue)}</span>
              <span><strong>Owner:</strong> {opp.currentOwner}</span>
              <span><strong>Stage:</strong> {opp.currentStage}</span>
            </div>
          </div>
        </div>

        {/* ── B. Why Flagged ── */}
        <section className="pdd-section">
          <h4 className="pdd-section-title">
            <InfoOutlined sx={{ fontSize: 16 }} />
            Why This Product Is Flagged
          </h4>
          <p className="pdd-section-text">{opp.flagReason}</p>
        </section>

        {/* ── C. Opportunity Available ── */}
        <section className="pdd-section">
          <h4 className="pdd-section-title">
            <TrendingUpOutlined sx={{ fontSize: 16 }} />
            Opportunity Available
          </h4>
          <div className="pdd-stat-grid">
            <div className="pdd-stat">
              <span className="pdd-stat-label">Opportunity Value</span>
              <span className="pdd-stat-value">{fmt(opp.opportunityValue)}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Lost Sales Risk</span>
              <span className="pdd-stat-value pdd-stat--danger">{fmt(opp.lostSalesRisk)}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Rec. Allocation Increase</span>
              <span className="pdd-stat-value">+{opp.allocationGap} units</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Expected Coverage</span>
              <span className="pdd-stat-value">{opp.expectedCoverageImprovement}</span>
            </div>
          </div>
        </section>

        {/* ── D. Current Allocation Status ── */}
        <section className="pdd-section">
          <h4 className="pdd-section-title">
            <InventoryOutlined sx={{ fontSize: 16 }} />
            Current Allocation Status
            <Badge label="Read Only" color="default" variant="subtle" size="small" />
          </h4>
          <Card size="extraSmall" sx={{ padding: 0, minHeight: 0 }}>
            <div className="pdd-allocation-grid">
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">HO Allocation ID</span>
                <span className="pdd-alloc-value">{opp.hoAllocationId}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">Allocation Cycle</span>
                <span className="pdd-alloc-value">{opp.allocationCycle}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">Allocator</span>
                <span className="pdd-alloc-value">{opp.allocatorName}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">Allocation Date</span>
                <span className="pdd-alloc-value">{opp.allocationDate}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">HO Allocation Qty</span>
                <span className="pdd-alloc-value pdd-alloc-value--bold">{opp.currentHoAllocationQty}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">Received Qty</span>
                <span className="pdd-alloc-value">{opp.receivedQty}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">In-Transit Qty</span>
                <span className="pdd-alloc-value">{opp.inTransitQty}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">Rec. Allocation Qty</span>
                <span className="pdd-alloc-value pdd-alloc-value--accent">{opp.recommendedAllocationQty}</span>
              </div>
              <div className="pdd-alloc-row">
                <span className="pdd-alloc-label">Allocation Gap</span>
                <span className="pdd-alloc-value pdd-alloc-value--gap">+{opp.allocationGap}</span>
              </div>
            </div>
          </Card>
        </section>

        {/* ── E. Inventory / Store Performance ── */}
        <section className="pdd-section">
          <h4 className="pdd-section-title">
            <InsightsOutlined sx={{ fontSize: 16 }} />
            Inventory &amp; Store Performance
          </h4>
          <div className="pdd-stat-grid pdd-stat-grid--3col">
            <div className="pdd-stat">
              <span className="pdd-stat-label">Sales (7d)</span>
              <span className="pdd-stat-value">{opp.salesLast7Days}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Sales (30d)</span>
              <span className="pdd-stat-value">{opp.salesLast30Days}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Sell-Through</span>
              <span className="pdd-stat-value">{opp.sellThroughPct}%</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Forecast Demand</span>
              <span className="pdd-stat-value">{opp.forecastDemand}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Safety Stock</span>
              <span className="pdd-stat-value">{opp.safetyStock}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Store Stock</span>
              <span className="pdd-stat-value">{opp.currentStoreStock}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">DC Available</span>
              <span className="pdd-stat-value">{opp.dcAvailableQty}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Transfer Avail</span>
              <span className="pdd-stat-value">{opp.transferAvailableQty}</span>
            </div>
            <div className="pdd-stat">
              <span className="pdd-stat-label">Stockout Risk</span>
              <span className={`pdd-stat-value pdd-stat--${opp.stockoutRisk === 'high' ? 'danger' : opp.stockoutRisk === 'medium' ? 'warn' : 'ok'}`}>
                {opp.stockoutRisk.charAt(0).toUpperCase() + opp.stockoutRisk.slice(1)}
              </span>
            </div>
          </div>
          <div className="pdd-comparable">
            <span className="pdd-comparable-label">Comparable Store Performance:</span>
            <span className="pdd-comparable-value">{opp.comparableStorePerformance}</span>
          </div>
        </section>

        {/* ── F. Suggested Action ── */}
        <section className="pdd-section pdd-section--action">
          <h4 className="pdd-section-title">
            <LightbulbOutlined sx={{ fontSize: 16 }} />
            Suggested Action
          </h4>
          <div className="pdd-action-card">
            <span className="pdd-action-path">
              {FULFILLMENT_LABELS[opp.recommendedFulfillmentPath]}
            </span>
            <p className="pdd-action-desc">{opp.suggestedAction}</p>
          </div>
        </section>
      </div>
    </ImDrawer>
  );
};

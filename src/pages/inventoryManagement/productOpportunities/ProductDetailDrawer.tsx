import React from 'react';
import { Button, Badge } from 'impact-ui';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
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
    critical: 'error'  as const,
    high:     'error'  as const,
    medium:   'warning'as const,
    low:      'info'   as const,
  }[opp.priority];

  const typeColor =
    opp.opportunityType === 'at_risk'  ? 'error' as const :
    opp.opportunityType === 'emerging' ? 'info'  as const : 'success' as const;

  return (
    <ImDrawer
      open
      onClose={onClose}
      width={660}
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

        {/* ══════════════════════════════════════════
            HERO HEADER
        ══════════════════════════════════════════ */}
        <div className="pdd-hero">
          <button className="pdd-hero-close" onClick={onClose} aria-label="Close">
            <CloseOutlined sx={{ fontSize: 18 }} />
          </button>

          <div className="pdd-hero-left">
            <img
              src={opp.productImage}
              alt={opp.productName}
              className="pdd-hero-img"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="pdd-hero-info">
              <div className="pdd-hero-badges">
                <Badge label={OPPORTUNITY_TYPE_LABELS[opp.opportunityType]} color={typeColor} variant="subtle" size="small" />
                <OpportunityStatusChip status={opp.status} />
                <Badge label={opp.priority.charAt(0).toUpperCase() + opp.priority.slice(1)} color={priorityColor} variant="subtle" size="small" />
              </div>
              <h2 className="pdd-hero-name">{opp.productName}</h2>
              <div className="pdd-hero-meta">
                <span className="pdd-hero-sku">{opp.sku}</span>
                <span className="pdd-hero-sep"/>
                <span>{opp.category}</span>
                <span className="pdd-hero-sep"/>
                <StorefrontOutlined sx={{ fontSize: 12 }}/><span>{opp.storeName}</span>
                <span className="pdd-hero-sep"/>
                <PersonOutlined sx={{ fontSize: 12 }}/><span>{opp.currentOwner}</span>
              </div>
            </div>
          </div>

          <div className="pdd-hero-kpis">
            <div className="pdd-hero-kpi">
              <span className="pdd-hero-kpi-label">Opportunity Value</span>
              <span className="pdd-hero-kpi-value pdd-hero-kpi--positive">{fmt(opp.opportunityValue)}</span>
            </div>
            <div className="pdd-hero-kpi">
              <span className="pdd-hero-kpi-label">Allocation Gap</span>
              <span className="pdd-hero-kpi-value pdd-hero-kpi--warn">+{opp.allocationGap} units</span>
            </div>
            <div className="pdd-hero-kpi">
              <span className="pdd-hero-kpi-label">Stage</span>
              <span className="pdd-hero-kpi-value">{opp.currentStage}</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            WHY FLAGGED
        ══════════════════════════════════════════ */}
        <section className="pdd-section">
          <div className="pdd-section-header">
            <InfoOutlined sx={{ fontSize: 16 }} />
            <h4 className="pdd-section-title">Why This Product Is Flagged</h4>
          </div>
          <p className="pdd-section-text">{opp.flagReason}</p>
        </section>

        {/* ══════════════════════════════════════════
            OPPORTUNITY TILES
        ══════════════════════════════════════════ */}
        <section className="pdd-section">
          <div className="pdd-section-header">
            <TrendingUpOutlined sx={{ fontSize: 16 }} />
            <h4 className="pdd-section-title">Opportunity Available</h4>
          </div>
          <div className="pdd-opp-tiles">
            <div className="pdd-opp-tile pdd-opp-tile--green">
              <span className="pdd-opp-tile-label">Opportunity Value</span>
              <span className="pdd-opp-tile-value">{fmt(opp.opportunityValue)}</span>
            </div>
            <div className="pdd-opp-tile pdd-opp-tile--red">
              <span className="pdd-opp-tile-label">Lost Sales Risk</span>
              <span className="pdd-opp-tile-value">{fmt(opp.lostSalesRisk)}</span>
            </div>
            <div className="pdd-opp-tile pdd-opp-tile--blue">
              <span className="pdd-opp-tile-label">Rec. Allocation Increase</span>
              <span className="pdd-opp-tile-value">+{opp.allocationGap} units</span>
            </div>
            <div className="pdd-opp-tile pdd-opp-tile--teal">
              <span className="pdd-opp-tile-label">Expected Coverage</span>
              <span className="pdd-opp-tile-value">{opp.expectedCoverageImprovement}</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ALLOCATION STATUS
        ══════════════════════════════════════════ */}
        <section className="pdd-section">
          <div className="pdd-section-header">
            <InventoryOutlined sx={{ fontSize: 16 }} />
            <h4 className="pdd-section-title">Current Allocation Status</h4>
            <Badge label="Read Only" color="default" variant="subtle" size="small" />
          </div>
          <div className="pdd-alloc-table">
            {[
              { label: 'HO Allocation ID',    value: opp.hoAllocationId,              mod: '' },
              { label: 'Allocation Cycle',     value: opp.allocationCycle,             mod: '' },
              { label: 'Allocator',            value: opp.allocatorName,               mod: '' },
              { label: 'Allocation Date',      value: opp.allocationDate,              mod: '' },
              { label: 'HO Allocation Qty',    value: opp.currentHoAllocationQty,      mod: 'bold' },
              { label: 'Received Qty',         value: opp.receivedQty,                 mod: '' },
              { label: 'In-Transit Qty',       value: opp.inTransitQty,                mod: '' },
              { label: 'Rec. Allocation Qty',  value: opp.recommendedAllocationQty,    mod: 'accent' },
              { label: 'Allocation Gap',       value: `+${opp.allocationGap}`,         mod: 'gap' },
            ].map(({ label, value, mod }) => (
              <div key={label} className="pdd-alloc-row">
                <span className="pdd-alloc-label">{label}</span>
                <span className={`pdd-alloc-value${mod ? ` pdd-alloc-value--${mod}` : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PERFORMANCE TILES
        ══════════════════════════════════════════ */}
        <section className="pdd-section">
          <div className="pdd-section-header">
            <InsightsOutlined sx={{ fontSize: 16 }} />
            <h4 className="pdd-section-title">Inventory &amp; Store Performance</h4>
          </div>
          <div className="pdd-perf-grid">
            {[
              { label: 'Sales (7d)',       value: opp.salesLast7Days,      mod: '' },
              { label: 'Sales (30d)',      value: opp.salesLast30Days,     mod: '' },
              { label: 'Sell-Through',     value: `${opp.sellThroughPct}%`,mod: '' },
              { label: 'Forecast Demand',  value: opp.forecastDemand,      mod: '' },
              { label: 'Safety Stock',     value: opp.safetyStock,         mod: '' },
              { label: 'Store Stock',      value: opp.currentStoreStock,   mod: 'warn' },
              { label: 'DC Available',     value: opp.dcAvailableQty,      mod: '' },
              { label: 'Transfer Avail',   value: opp.transferAvailableQty,mod: '' },
              {
                label: 'Stockout Risk',
                value: opp.stockoutRisk.charAt(0).toUpperCase() + opp.stockoutRisk.slice(1),
                mod: opp.stockoutRisk === 'high' ? 'danger' : opp.stockoutRisk === 'medium' ? 'warn' : 'ok',
              },
            ].map(({ label, value, mod }) => (
              <div key={label} className="pdd-perf-tile">
                <span className="pdd-perf-label">{label}</span>
                <span className={`pdd-perf-value${mod ? ` pdd-perf-value--${mod}` : ''}`}>{value}</span>
              </div>
            ))}
          </div>
          {opp.comparableStorePerformance && (
            <div className="pdd-comparable">
              <span className="pdd-comparable-label">Comparable Store:</span>
              <span className="pdd-comparable-value">{opp.comparableStorePerformance}</span>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            SUGGESTED ACTION
        ══════════════════════════════════════════ */}
        <section className="pdd-action-section">
          <div className="pdd-section-header">
            <LightbulbOutlined sx={{ fontSize: 16 }} />
            <h4 className="pdd-section-title">Suggested Action</h4>
          </div>
          <div className="pdd-action-body">
            <span className="pdd-action-path">{FULFILLMENT_LABELS[opp.recommendedFulfillmentPath]}</span>
            <p className="pdd-action-desc">{opp.suggestedAction}</p>
          </div>
        </section>

      </div>
    </ImDrawer>
  );
};

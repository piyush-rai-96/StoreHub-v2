import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import Check from '@mui/icons-material/Check';
import { Tabs } from 'impact-ui';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { ImFilterSelect } from '../../../components/common/ImFilterSelect';
import { OpportunityStatusChip } from './OpportunityStatusChip';
import { ProductDetailDrawer } from './ProductDetailDrawer';
import {
  STORES,
  DEFAULT_STORE_ID,
  getOpportunitiesByStore,
  getOpportunitySummary,
  getStoreById,
} from '../../../constants/productOpportunityMock';
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
} from '../../../types/productOpportunity';
import type { ProductOpportunity, OpportunityType } from '../../../types/productOpportunity';
import './ProductOpportunitiesPage.css';

const ROWS_PER_PAGE = 10;

const TYPE_ICONS: Record<OpportunityType, React.ReactNode> = {
  top_performing: <TrendingUpOutlined sx={{ fontSize: 13, color: 'var(--ia-color-success)' }} />,
  emerging: <AutoAwesomeOutlined sx={{ fontSize: 13, color: 'var(--ia-color-info)' }} />,
  at_risk: <WarningAmberOutlined sx={{ fontSize: 13, color: 'var(--ia-color-error)' }} />,
};

export const ProductOpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState(DEFAULT_STORE_ID);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedOpp, setSelectedOpp] = useState<ProductOpportunity | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const store = useMemo(() => getStoreById(storeId), [storeId]);
  const allOpportunities = useMemo(() => getOpportunitiesByStore(storeId), [storeId]);
  const summary = useMemo(() => getOpportunitySummary(allOpportunities), [allOpportunities]);

  const filtered = useMemo(() => {
    let result = allOpportunities;

    if (activeTab !== 'all') result = result.filter(o => o.opportunityType === activeTab);

    if (statusFilter) result = result.filter(o => o.status === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        o =>
          o.productName.toLowerCase().includes(q) ||
          o.sku.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allOpportunities, activeTab, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const pageData = useMemo(
    () => filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE),
    [filtered, page],
  );

  const handleRowClick = useCallback((opp: ProductOpportunity) => {
    setSelectedOpp(opp);
  }, []);

  const handleGoToWorkflow = useCallback(
    (opp: ProductOpportunity) => {
      navigate(`/inventory-management/product-opportunities/${opp.id}/allocation-workflow`);
    },
    [navigate],
  );

  const fmt = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });


  const topPerformingCount = allOpportunities.filter(o => o.opportunityType === 'top_performing').length;
  const emergingCount      = allOpportunities.filter(o => o.opportunityType === 'emerging').length;
  const atRiskCount        = allOpportunities.filter(o => o.opportunityType === 'at_risk').length;

  if (isLoading) {
    return (
      <div className="po-page">
        <div className="po-loading">
          <div className="po-loading-spinner" />
          <p>Loading Product Opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="po-page">
      {/* ── Page Header — District Intelligence pattern ── */}
      <div className="po-page-header">
        <div className="po-page-header-left">
          <div className="po-page-title-row">
            <TrendingUpOutlined sx={{ fontSize: 24, color: 'var(--ia-color-primary)' }} />
            <h1>Store Product Opportunities</h1>
          </div>
          <div className="po-header-meta">
            <div className="po-store-picker-wrap">
              <button className="po-store-picker" onClick={() => setShowStoreDropdown(prev => !prev)}>
                <StoreOutlined sx={{ fontSize: 14 }} />
                <span>{store?.storeName ?? 'Select Store'}</span>
                <span className="po-store-picker-id">{storeId}</span>
                <KeyboardArrowDown sx={{ fontSize: 14 }} className={showStoreDropdown ? 'po-rotated' : ''} />
              </button>
              {showStoreDropdown && (
                <div className="po-store-dropdown">
                  {STORES.map(s => (
                    <button
                      key={s.storeId}
                      className={`po-store-option ${s.storeId === storeId ? 'active' : ''}`}
                      onClick={() => { setStoreId(s.storeId); setShowStoreDropdown(false); setPage(0); }}
                    >
                      <div className="po-store-option-main">
                        <StoreOutlined sx={{ fontSize: 13 }} />
                        <span className="po-store-option-label">{s.storeName}</span>
                      </div>
                      <div className="po-store-option-meta">
                        <span>{s.storeId}</span>
                        <span>{s.region}</span>
                      </div>
                      {s.storeId === storeId && <Check sx={{ fontSize: 14 }} className="po-store-check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {store && (
              <div className="po-cycle-pill">
                <CalendarTodayOutlined sx={{ fontSize: 12 }} />
                <span>{store.allocationCycle}</span>
              </div>
            )}
            <span className="po-last-refresh">
              <AccessTimeOutlined sx={{ fontSize: 12 }} />
              Updated {store ? new Date(store.lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="po-content">
      {/* ── Summary Tiles ── */}
      <div className="sc-inv-summary">
        <div className="sc-inv-summary-tile sc-inv-summary--total">
          <span className="sc-inv-summary-label">Total Open</span>
          <span className="sc-inv-summary-value">{summary.totalOpen}</span>
          <span className="sc-inv-summary-sub">{allOpportunities.length} tracked SKUs</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--success">
          <span className="sc-inv-summary-label">Top Performing</span>
          <span className="sc-inv-summary-value">{topPerformingCount}</span>
          <span className="sc-inv-summary-sub">high-value opportunities</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--info">
          <span className="sc-inv-summary-label">Emerging</span>
          <span className="sc-inv-summary-value">{emergingCount}</span>
          <span className="sc-inv-summary-sub">growing trend</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--critical">
          <span className="sc-inv-summary-label">At-Risk</span>
          <span className="sc-inv-summary-value">{atRiskCount}</span>
          <span className="sc-inv-summary-sub">requires attention</span>
        </div>
        <div className="sc-inv-summary-tile sc-inv-summary--warn">
          <span className="sc-inv-summary-label">Pending Approval</span>
          <span className="sc-inv-summary-value">{summary.pendingApproval}</span>
          <span className="sc-inv-summary-sub">awaiting review</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="po-tabs-row">
        <Tabs
          value={activeTab}
          onChange={(_, v: string) => { setActiveTab(v); setPage(0); }}
          tabNames={[
            { value: 'all',            label: `All (${allOpportunities.length})` },
            { value: 'top_performing', label: 'Top Performing' },
            { value: 'emerging',       label: 'Emerging' },
            { value: 'at_risk',        label: 'At-Risk' },
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
            placeholder="Search products, SKU, category…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
          {search && (
            <button className="sc-inv-search-clear" onClick={() => { setSearch(''); setPage(0); }}>
              <CloseOutlined sx={{ fontSize: 13 }}/>
            </button>
          )}
        </div>
        <div className="sc-inv-filter-divider"/>
        <div className="sc-inv-filter-fields">
          <ImFilterSelect
            placeholder="All Statuses"
            value={statusFilter || 'All'}
            options={[{ value: 'All', label: 'All Statuses' }, ...Object.entries(OPPORTUNITY_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
            isClearable={!!statusFilter}
            minWidth={160}
            onChange={v => { setStatusFilter(v === 'All' ? '' : (v || '')); setPage(0); }}
          />
        </div>
        {(search || statusFilter) && (
          <button className="sc-inv-clear-chip" onClick={() => { setSearch(''); setStatusFilter(''); setPage(0); }}>
            <CloseOutlined sx={{ fontSize: 11 }}/> Clear
          </button>
        )}
      </div>

      {/* ── Product Opportunity Table ── */}
      <div className="wow-table-wrap">
        <table className="wow-table">
          <thead>
            <tr>
              <th style={{ width: 52 }}></th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Opportunity</th>
              <th style={{ textAlign: 'right' }}>Value</th>
              <th style={{ textAlign: 'right' }}>HO Alloc Qty</th>
              <th style={{ textAlign: 'right' }}>Rec. Qty</th>
              <th style={{ textAlign: 'right' }}>Gap</th>
              <th style={{ textAlign: 'right' }}>DC Avail</th>
              <th style={{ textAlign: 'right' }}>Transfer Avail</th>
              <th>Status</th>
              <th>Owner / Stage</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && (
              <tr className="wow-row-empty">
                <td colSpan={14}>No opportunities found for the selected filters.</td>
              </tr>
            )}
            {pageData.map(opp => (
              <tr
                key={opp.id}
                onClick={() => handleRowClick(opp)}
                style={{ cursor: 'pointer' }}
                className={selectedOpp?.id === opp.id ? 'wow-row-highlight' : ''}
              >
                <td>
                  <img
                    src={opp.productImage}
                    alt={opp.productName}
                    className="po-product-thumb"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </td>
                <td><span className="po-product-name">{opp.productName}</span></td>
                <td className="po-sku">{opp.sku}</td>
                <td>{opp.category}</td>
                <td>
                  <span className="po-opp-type">
                    {TYPE_ICONS[opp.opportunityType]}
                    {OPPORTUNITY_TYPE_LABELS[opp.opportunityType]}
                  </span>
                </td>
                <td className="wow-td-num" style={{ textAlign: 'right' }}>{fmt(opp.opportunityValue)}</td>
                <td style={{ textAlign: 'right' }}>{opp.currentHoAllocationQty}</td>
                <td style={{ textAlign: 'right' }}>{opp.recommendedAllocationQty}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className={`po-gap ${opp.allocationGap > 30 ? 'po-gap--critical' : opp.allocationGap > 15 ? 'po-gap--warn' : ''}`}>
                    {opp.allocationGap > 0 ? `+${opp.allocationGap}` : opp.allocationGap}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>{opp.dcAvailableQty}</td>
                <td style={{ textAlign: 'right' }}>{opp.transferAvailableQty}</td>
                <td><OpportunityStatusChip status={opp.status} /></td>
                <td>
                  <div className="po-owner-cell">
                    <span className="po-owner">{opp.currentOwner}</span>
                    <span className="po-stage">{opp.currentStage}</span>
                  </div>
                </td>
                <td className="po-date">
                  {new Date(opp.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="wow-table-footer">
            <span>
              Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} of {filtered.length} opportunities
            </span>
            <div className="wow-table-pager">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeftOutlined sx={{ fontSize: 16 }} />
              </button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRightOutlined sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      </div>

      {/* ── Product Detail Drawer ── */}
      <ProductDetailDrawer
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onGoToWorkflow={handleGoToWorkflow}
      />
    </div>
  );
};

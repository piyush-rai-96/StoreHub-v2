import React, { useState, useEffect, useRef } from 'react';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import { Button, Badge, Card, Tabs, Tag, Select, SelectOption, Chips, Loader, Input } from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import './MasterPOGManagement.css';
import WomensWallStandard from '../assets/C&A_WOMENS_WALL_STANDARD.png';
import MensDenimWall from '../assets/C&A_MENS_DENIM_WALL.png';
import KidsColorBlockWall from '../assets/C&A_KIDS_COLOR_BLOCK_WALL.png';
import AccessoriesEndcap from '../assets/C&A_ACCESSORIES_ENDCAP.png';
import SeasonalPromoTable from '../assets/C&A_SEASONAL_PROMO_TABLE.png';

interface POGItem {
  id: string;
  name: string;
  category: string;
  lastModified: string;
  status: 'active' | 'draft' | 'archived';
  version: string;
  stores: number;
  planogramImage: string;
}

interface POGRule {
  name: string;
  type: string;
  status: 'Active' | 'Warning';
  description: string;
  icon: string;
}

interface POGClusterMapping {
  clusters: string[];
  count: number;
}

const pogRulesMapping: Record<string, POGRule[]> = {
  '1': [ // Women's Wall Display
    { name: 'Product Fit & Placement', type: 'Adjacency', status: 'Active', description: 'Place folded items on shelves, hanging items on rails, and accessories on display hooks.', icon: '📍' },
    { name: 'Size Sequencing', type: 'Facing', status: 'Active', description: 'Arrange sizes from small to large, left to right on each rail or shelf.', icon: '⭐' },
    { name: 'Color Blocking', type: 'Brand Blocking', status: 'Active', description: 'Group items by color family for visual appeal and easy navigation.', icon: '🎨' },
    { name: 'Capacity Rules', type: 'Capacity', status: 'Active', description: 'Do not overcrowd rails. Maintain spacing between hangers for easy browsing.', icon: '📊' },
    { name: 'Seasonal Rotation', type: 'Space Allocation', status: 'Active', description: 'Feature current season items prominently and phase out previous season stock.', icon: '🔄' },
  ],
  '2': [ // Men's Denim Wall
    { name: 'Fit Grouping', type: 'Adjacency', status: 'Active', description: 'Group by fit (slim, regular, relaxed) in distinct sections.', icon: '📍' },
    { name: 'Wash Sequencing', type: 'Brand Blocking', status: 'Active', description: 'Arrange washes from light to dark within each fit section.', icon: '🎨' },
    { name: 'Size Availability', type: 'Mandatory SKU', status: 'Active', description: 'Ensure full size range is visible and accessible for each style.', icon: '⭐' },
    { name: 'Visual Balance', type: 'Space Allocation', status: 'Active', description: 'Maintain even stack heights and consistent folding across the display.', icon: '📐' },
  ],
  '3': [ // Kids Color Block Wall
    { name: 'Age Grouping', type: 'Adjacency', status: 'Active', description: 'Organize by age group with toddler items at lower heights.', icon: '📍' },
    { name: 'Color Blocking', type: 'Brand Blocking', status: 'Active', description: 'Create vibrant color blocks to attract attention and aid navigation.', icon: '🎨' },
    { name: 'Safety Compliance', type: 'Prohibited SKU', status: 'Active', description: 'Ensure displays are stable and items are within safe reach for children.', icon: '🛡️' },
  ],
  '4': [ // Accessories End Cap
    { name: 'Category Grouping', type: 'Adjacency', status: 'Active', description: 'Group by type: bags, belts, scarves, jewelry in distinct sections.', icon: '📍' },
    { name: 'Trend Highlighting', type: 'Mandatory SKU', status: 'Active', description: 'Feature current trend items at eye level with clear trend signage.', icon: '⭐' },
    { name: 'Gift Presentation', type: 'Brand Blocking', status: 'Active', description: 'Display gift-ready items with packaging visible and price tags accessible.', icon: '🎁' },
    { name: 'Impulse Optimization', type: 'Space Allocation', status: 'Active', description: 'Position grab-and-go items at checkout-adjacent locations.', icon: '⚡' },
  ],
  '5': [ // Seasonal Promo Table
    { name: 'Promotional Focus', type: 'Space Allocation', status: 'Active', description: 'Feature current promotional items prominently with clear pricing.', icon: '📍' },
    { name: 'Bundle Display', type: 'Brand Blocking', status: 'Active', description: 'Create outfit or bundles to encourage multi-item purchases.', icon: '🎨' },
    { name: 'Urgency Signage', type: 'Mandatory SKU', status: 'Active', description: 'Include limited-time messaging to drive immediate purchase decisions.', icon: '⏰' },
  ],
};

const getPOGVersionHistory = (version: string, lastModified: string) => {
  const match = version.match(/v(\d+)\.(\d+)/);
  if (!match) return [{ ver: version, label: 'Current', date: null }];
  const major = parseInt(match[1]);
  const minor = parseInt(match[2]);
  const baseDate = new Date(lastModified);
  const prev1Date = new Date(baseDate);
  prev1Date.setDate(prev1Date.getDate() - 18);
  const prev2Date = new Date(baseDate);
  prev2Date.setDate(prev2Date.getDate() - 45);
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const prevMinor1 = minor > 0 ? minor - 1 : 0;
  const prevMinor2 = prevMinor1 > 0 ? prevMinor1 - 1 : 0;
  const prev1Ver = prevMinor1 > 0 ? `v${major}.${prevMinor1}` : major > 1 ? `v${major - 1}.0` : `v${major}.0`;
  const prev2Ver = prevMinor2 > 0 ? `v${major}.${prevMinor2}` : major > 1 ? `v${major - 1}.0` : null;
  const history = [
    { ver: version, label: 'Current', date: null },
    { ver: prev1Ver, label: null, date: fmtDate(prev1Date) },
  ];
  if (prev2Ver && prev2Ver !== prev1Ver) history.push({ ver: prev2Ver, label: null, date: fmtDate(prev2Date) });
  return history;
};

const pogClusterMapping: Record<string, POGClusterMapping> = {
  '1': { clusters: ['Urban Flagship', 'Family Center', 'Mall Anchor'], count: 3 },
  '2': { clusters: ['Urban Flagship', 'Family Center', 'Outlet Value'], count: 3 },
  '3': { clusters: ['Family Center', 'Mall Anchor', 'Outlet Value'], count: 3 },
  '4': { clusters: ['Urban Flagship', 'Mall Anchor'], count: 2 },
  '5': { clusters: ['Urban Flagship', 'Family Center', 'Mall Anchor', 'Outlet Value'], count: 4 },
};

const mockPOGData: POGItem[] = [
  { id: '1', name: "Women's Wall Display - Standard", category: 'Apparel', lastModified: '2026-04-22', status: 'active', version: 'v2.1', stores: 12, planogramImage: WomensWallStandard },
  { id: '2', name: "Men's Denim Wall Display", category: 'Apparel', lastModified: '2026-04-20', status: 'active', version: 'v1.5', stores: 8, planogramImage: MensDenimWall },
  { id: '3', name: "Kids Color Block Wall", category: 'Apparel', lastModified: '2026-04-18', status: 'draft', version: 'v3.0', stores: 5, planogramImage: KidsColorBlockWall },
  { id: '4', name: 'Accessories End Cap', category: 'Accessories', lastModified: '2026-04-15', status: 'active', version: 'v1.3', stores: 15, planogramImage: AccessoriesEndcap },
  { id: '5', name: 'Seasonal Promo Table', category: 'Seasonal', lastModified: '2026-04-10', status: 'archived', version: 'v2.0', stores: 3, planogramImage: SeasonalPromoTable },
];

interface Filters {
  category: string;
  status: string;
  fixtureType: string;
  cluster: string;
  lastUpdated: string;
  createdBy: string;
}

// Filter select — wraps IA Select with self-contained state management
interface FilterSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<SelectOption[]>(options);
  const selected = value ? (options.find(o => o.value === value) ?? null) : null;

  return (
    <Select
      placeholder={placeholder ?? label}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialOptions={options}
      currentOptions={currentOptions}
      setCurrentOptions={(opts) => setCurrentOptions(Array.isArray(opts) ? opts : options)}
      selectedOptions={selected}
      setSelectedOptions={(opt) => {
        const sel = Array.isArray(opt) ? opt[0] : opt;
        onChange(sel?.value ?? '');
      }}
      setIsSelectAll={() => {}}
      isClearable
      withPortal
      minWidth={160}
    />
  );
};

export const MasterPOGManagement: React.FC = () => {
  const { user } = useAuth();
  /** District managers: browse catalog only — no uploads or edits */
  const isPogViewOnly = user?.role === 'DM';
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'library' | 'workspace'>('library');
  const [selectedPOG, setSelectedPOG] = useState<POGItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const moreFiltersRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<Filters>({
    category: '',
    status: '',
    fixtureType: '',
    cluster: '',
    lastUpdated: '',
    createdBy: '',
  });

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      status: '',
      fixtureType: '',
      cluster: '',
      lastUpdated: '',
      createdBy: '',
    });
    setSearchQuery('');
  };

  // Filter chip helpers
  const filterLabelMap: Record<keyof Filters, string> = {
    category: 'Category', status: 'Status', fixtureType: 'Fixture',
    cluster: 'Cluster', lastUpdated: 'Updated', createdBy: 'By',
  };
  const activeChips = (Object.keys(filters) as (keyof Filters)[])
    .filter(k => filters[k] !== '')
    .map(k => ({ key: k, label: `${filterLabelMap[k]}: ${filters[k]}` }));
  const hasActiveFilters = activeChips.length > 0 || searchQuery !== '';
  const activeSecondaryCount = ['lastUpdated', 'createdBy'].filter(
    k => filters[k as keyof Filters] !== ''
  ).length;

  // Close More Filters panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(e.target as Node)) {
        setShowMoreFilters(false);
      }
    };
    if (showMoreFilters) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreFilters]);

  const handlePOGSelect = (pog: POGItem) => {
    setSelectedPOG(pog);
    setActiveTab('workspace');
  };

  const filteredPOGs = mockPOGData.filter(pog => {
    const matchesSearch = pog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pog.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filters.category || pog.category === filters.category;
    const matchesStatus = !filters.status || pog.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: POGItem['status']) => {
    const map = {
      active: { label: 'Active', color: 'success' as const },
      draft: { label: 'Draft', color: 'warning' as const },
      archived: { label: 'Archived', color: 'info' as const },
    };
    const m = map[status];
    return <Badge label={m.label} color={m.color} size="small" className="pog-status-badge" />;
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="master-pog-container">
        <div className="page-loading">
          <Loader size="large" />
          <p>Loading Master POG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="master-pog-container">
      <div className="master-pog-header">
        <div className="pi-header-row">
          <div className="master-pog-title-section">
            <div className="master-pog-title-row">
              <LayersOutlined sx={{ fontSize: 24 }} />
              <h1 className="master-pog-title">Master POG Management</h1>
            </div>
            <p className="master-pog-subtitle">
              {isPogViewOnly ? 'View corporate planograms for your district (read-only)' : 'Manage and organize your planogram library'}
            </p>
            {isPogViewOnly && (
              <p className="master-pog-subtitle" style={{ marginTop: 8, fontSize: 'var(--ia-text-xs)', color: 'var(--ia-color-text-secondary)' }}>
                Upload and edit actions are limited to HQ and administrators.
              </p>
            )}
          </div>
          <div className="pi-header-right">
            {!isPogViewOnly && (
              <Button variant="contained" color="primary" size="medium" className="pi-btn-primary" startIcon={<FileUploadOutlined sx={{ fontSize: 15 }} />}>
                Upload POG
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pog-kpi-section">
        <div className="pog-kpi-card">
          <div className="pog-kpi-strip">
        <div className="pog-kpi-item">
          <span className="pog-kpi-label">Total POGs</span>
          <span className="pog-kpi-value">{mockPOGData.length}</span>
          <span className="pog-kpi-context">in library</span>
        </div>
        <div className="pog-kpi-item">
          <span className="pog-kpi-label">Active</span>
          <span className="pog-kpi-value">{mockPOGData.filter(p => p.status === 'active').length}</span>
          <span className="pog-kpi-context">live planograms</span>
        </div>
        <div className="pog-kpi-item">
          <span className="pog-kpi-label">Drafts</span>
          <span className="pog-kpi-value">{mockPOGData.filter(p => p.status === 'draft').length}</span>
          <span className="pog-kpi-context">pending review</span>
        </div>
        <div className="pog-kpi-item">
          <span className="pog-kpi-label">Archived</span>
          <span className="pog-kpi-value">{mockPOGData.filter(p => p.status === 'archived').length}</span>
          <span className="pog-kpi-context">no longer active</span>
        </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
      <Tabs
        tabNames={[
          { value: 'library', label: 'POG Library' },
          { value: 'workspace', label: 'POG Workspace', disabled: !selectedPOG },
        ]}
        tabPanels={[
          <div className="pog-library">
            {/* Single-row filter bar */}
            <div className="pog-filter-bar">
              <div className="pog-filter-bar-search">
                <Input
                  leftIcon={<SearchOutlined sx={{ fontSize: 16 }} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search planograms..."
                />
              </div>
              <div className="pog-filter-bar-divider" />
              <FilterSelect
                label="Category"
                value={filters.category}
                placeholder="Category"
                options={[
                  { value: 'Apparel', label: 'Apparel' },
                  { value: 'Accessories', label: 'Accessories' },
                  { value: 'Seasonal', label: 'Seasonal' },
                ]}
                onChange={(value) => handleFilterChange('category', value)}
              />
              <FilterSelect
                label="Status"
                value={filters.status}
                placeholder="Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]}
                onChange={(value) => handleFilterChange('status', value)}
              />
              <FilterSelect
                label="Fixture Type"
                value={filters.fixtureType}
                placeholder="Fixture Type"
                options={[
                  { value: 'wall', label: 'Wall Display' },
                  { value: 'table', label: 'Table' },
                  { value: 'endcap', label: 'End Cap' },
                  { value: 'hangingrail', label: 'Hanging Rail' },
                  { value: 'foldingshelf', label: 'Folding Shelf' },
                ]}
                onChange={(value) => handleFilterChange('fixtureType', value)}
              />
              <FilterSelect
                label="Cluster"
                value={filters.cluster}
                placeholder="Cluster"
                options={[
                  { value: 'urban', label: 'Urban Flagship' },
                  { value: 'family', label: 'Family Center' },
                  { value: 'outlet', label: 'Outlet Value' },
                  { value: 'mall', label: 'Mall Anchor' },
                ]}
                onChange={(value) => handleFilterChange('cluster', value)}
              />
              {/* More Filters popover */}
              <div className="pog-more-filters-wrapper" ref={moreFiltersRef}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  className="pog-more-filters-btn"
                  startIcon={<TuneOutlined sx={{ fontSize: 14 }} />}
                  onClick={() => setShowMoreFilters(p => !p)}
                >
                  More{activeSecondaryCount > 0 && ` (${activeSecondaryCount})`}
                </Button>
                {showMoreFilters && (
                  <div className="pog-more-filters-panel">
                    <p className="pog-more-filters-title">Additional Filters</p>
                    <FilterSelect
                      label="Last Updated"
                      value={filters.lastUpdated}
                      placeholder="Any Time"
                      options={[
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'This Week' },
                        { value: 'month', label: 'This Month' },
                        { value: 'quarter', label: 'This Quarter' },
                      ]}
                      onChange={(value) => handleFilterChange('lastUpdated', value)}
                    />
                    <FilterSelect
                      label="Created By"
                      value={filters.createdBy}
                      placeholder="All Users"
                      options={[
                        { value: 'me', label: 'Me' },
                        { value: 'team', label: 'My Team' },
                      ]}
                      onChange={(value) => handleFilterChange('createdBy', value)}
                    />
                  </div>
                )}
              </div>
              {/* Clear All — only visible when filters active */}
              {hasActiveFilters && (
                <Button variant="text" color="primary" size="small" className="pog-filter-clear-btn" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="pog-active-chips">
                {activeChips.map(chip => (
                  <Chips
                    key={chip.key}
                    label={chip.label}
                    variant="filled"
                    color="primary"
                    size="small"
                    isRemovable
                    onDelete={() => handleFilterChange(chip.key, '')}
                  />
                ))}
              </div>
            )}

            <div className="pog-library-grid">
              {filteredPOGs.map(pog => (
                <Card
                  key={pog.id}
                  size="extraSmall"
                  className="pog-card"
                  sx={{ padding: '0', cursor: 'pointer' }}
                  onClick={() => handlePOGSelect(pog)}
                >
                  <div className="pog-card-inner">
                    <div className="pog-card-header">
                      <div className="pog-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                      </div>
                      {getStatusBadge(pog.status)}
                    </div>
                    <div className="pog-card-body">
                      <span className="pog-card-id">POG-{pog.id.padStart(3, '0')}</span>
                      <h3 className="pog-card-name">{pog.name}</h3>
                      <p className="pog-card-category">{pog.category}</p>
                    </div>
                    <div className="pog-card-footer">
                      <div className="pog-card-meta">
                        <span className="pog-card-version">{pog.version}</span>
                        <span className="pog-card-clusters">{pog.stores} stores · {pogClusterMapping[pog.id]?.count ?? 0} clusters</span>
                      </div>
                      <div className="pog-card-date">
                        <AccessTimeOutlined sx={{ fontSize: 12 }} />
                        <span>{pog.lastModified}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>,
          selectedPOG ? <div className="pog-workspace">
            <div className="pog-workspace-header">
              <div className="pog-workspace-info">
                <h2 className="pog-workspace-name">{selectedPOG.name}</h2>
                <div className="pog-workspace-meta">
                  {getStatusBadge(selectedPOG.status)}
                  <span className="pog-workspace-version">{selectedPOG.version}</span>
                  <span className="pog-workspace-category">{selectedPOG.category}</span>
                </div>
              </div>
              {!isPogViewOnly && (
                <div className="pog-workspace-actions">
                  <button type="button" className="pog-toolbar-btn pog-toolbar-btn--default" aria-label="Edit planogram">
                    <EditOutlined sx={{ fontSize: 18 }} aria-hidden />
                    <span>Edit</span>
                  </button>
                  <button type="button" className="pog-toolbar-btn pog-toolbar-btn--danger" aria-label="Delete planogram">
                    <DeleteOutlined sx={{ fontSize: 18 }} aria-hidden />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pog-workspace-content">
              <div className="pog-workspace-viewer">
                <img 
                  src={selectedPOG.planogramImage} 
                  alt={`Planogram: ${selectedPOG.name}`}
                  className="pog-viewer-image"
                />
              </div>

              <div className="pog-workspace-sidebar">
                <div className="pog-sidebar-section">
                  <h4 className="pog-sidebar-title">Version Control</h4>
                  <div className="pog-version-list">
                    {getPOGVersionHistory(selectedPOG.version, selectedPOG.lastModified).map((v, idx) => (
                      <div key={idx} className={`pog-version-item${idx === 0 ? ' active' : ''}`}>
                        {idx === 0
                          ? <CheckCircleOutlined sx={{ fontSize: 14 }} />
                          : <AccessTimeOutlined sx={{ fontSize: 14 }} />}
                        <span>{v.ver}{v.label ? ` - ${v.label}` : ''}{v.date ? ` - ${v.date}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pog-sidebar-section">
                  <h4 className="pog-sidebar-title">Cluster Mapping</h4>
                  <div className="pog-cluster-info">
                    <div className="pog-cluster-stat">
                      <span className="pog-cluster-number">{pogClusterMapping[selectedPOG.id]?.count || 0}</span>
                      <span className="pog-cluster-label">Total Clusters</span>
                    </div>
                    <div className="pog-cluster-names">
                      {pogClusterMapping[selectedPOG.id]?.clusters.map((cluster, idx) => (
                        <Tag key={idx} label={cluster} size="small" variant="stroke" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pog-sidebar-section">
                  <h4 className="pog-sidebar-title">Quick Actions</h4>
                  <div className="pog-quick-actions">
                    {!isPogViewOnly && (
                      <Button variant="outlined" color="primary" size="small" className="pog-quick-action-btn" fullWidth>
                        Clone POG
                      </Button>
                    )}
                    <Button variant="outlined" color="primary" size="small" className="pog-quick-action-btn" fullWidth>
                      Export
                    </Button>
                    <Button variant="outlined" color="primary" size="small" className="pog-quick-action-btn" fullWidth>
                      Share
                    </Button>
                  </div>
                </div>

                <div className="pog-sidebar-section pog-applied-rules">
                  <h4 className="pog-sidebar-title">Applied Rules</h4>
                  <p className="pog-rules-description">Rules dynamically applied based on category, cluster, and fixture mappings.</p>
                  <div className="pog-rules-list premium">
                    {pogRulesMapping[selectedPOG.id]?.map((rule, idx) => (
                      <div key={idx} className="pog-rule-row">
                        <div className="pog-rule-row-header">
                          <div className={`pog-rule-icon-badge ${rule.type.toLowerCase().replace(/\s+/g, '-')}`}>
                            <span>{rule.icon}</span>
                          </div>
                          <div className="pog-rule-card-title">
                            <span className="pog-rule-name">{rule.name}</span>
                            <span className="pog-rule-type-tag">{rule.type}</span>
                          </div>
                          <span className={`pog-rule-status ${rule.status.toLowerCase()}`}>{rule.status}</span>
                        </div>
                        <p className="pog-rule-description">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div> : <div />,
        ]}
        value={activeTab}
        onChange={(_, val) => setActiveTab(val as 'library' | 'workspace')}
      />
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import Add from '@mui/icons-material/Add';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Check from '@mui/icons-material/Check';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import StraightenOutlined from '@mui/icons-material/StraightenOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import SwapHoriz from '@mui/icons-material/SwapHoriz';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import RemoveCircleOutlined from '@mui/icons-material/RemoveCircleOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import ApartmentOutlined from '@mui/icons-material/ApartmentOutlined';
import PieChartOutlined from '@mui/icons-material/PieChartOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import OpenInFullOutlined from '@mui/icons-material/OpenInFullOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';
import { Button, Card, Tabs, Modal, EmptyState, Stepper, StepperStep, Badge, Select, SelectOption, Loader, Alert, TextArea, Input } from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import './POGRuleManagement.css';

// Types
type RuleType = 'Space Allocation' | 'Performance' | 'Capacity' | 'Price Tier' | 'Dimensional' | 'Facing' | 'Brand Blocking' | 'Adjacency' | 'Mandatory SKU' | 'Prohibited SKU' | 'Priority' | 'Fixture-Specific' | 'Cluster-Specific';
type RuleStatus = 'Active' | 'Inactive' | 'Draft';

interface RuleMapping {
  categories: string[];
  clusters: string[];
  fixtures: string[];
}

interface Rule {
  id: string;
  name: string;
  description: string;
  types: RuleType[];
  mapping: RuleMapping;
  lastUpdated: string;
  status: RuleStatus;
  definition: Record<string, any>;
  completedSteps: number[];
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const wizardSteps: WizardStep[] = [
  { id: 1, title: 'Basic Info', description: 'Name and description' },
  { id: 2, title: 'Mapping', description: 'Apply to categories, clusters, fixtures' },
  { id: 3, title: 'Rule Types', description: 'Select one or more rule types' },
  { id: 4, title: 'Rule Definition', description: 'Configure rule parameters' },
];

const ruleTypeIcons: Record<RuleType, React.ReactNode> = {
  'Space Allocation': <PieChartOutlined sx={{ fontSize: 20 }} />,
  'Performance': <TrendingUpOutlined sx={{ fontSize: 20 }} />,
  'Capacity': <OpenInFullOutlined sx={{ fontSize: 20 }} />,
  'Price Tier': <AttachMoneyOutlined sx={{ fontSize: 20 }} />,
  'Dimensional': <StraightenOutlined sx={{ fontSize: 20 }} />,
  'Facing': <DashboardOutlined sx={{ fontSize: 20 }} />,
  'Brand Blocking': <LayersOutlined sx={{ fontSize: 20 }} />,
  'Adjacency': <SwapHoriz sx={{ fontSize: 20 }} />,
  'Mandatory SKU': <InventoryOutlined sx={{ fontSize: 20 }} />,
  'Prohibited SKU': <RemoveCircleOutlined sx={{ fontSize: 20 }} />,
  'Priority': <StarBorderOutlined sx={{ fontSize: 20 }} />,
  'Fixture-Specific': <Inventory2Outlined sx={{ fontSize: 20 }} />,
  'Cluster-Specific': <ApartmentOutlined sx={{ fontSize: 20 }} />,
};

// Rule type groups for visual organization
const ruleTypeGroups = [
  {
    name: 'Critical Rules',
    types: ['Space Allocation', 'Performance', 'Capacity', 'Price Tier'] as RuleType[]
  },
  {
    name: 'Product Rules',
    types: ['Mandatory SKU', 'Prohibited SKU', 'Brand Blocking'] as RuleType[]
  },
  {
    name: 'Placement Rules',
    types: ['Dimensional', 'Facing', 'Adjacency', 'Priority'] as RuleType[]
  }
];

// Category-based size presets
const categorySizePresets: Record<string, { small: string; medium: string; large: string; unit?: string }> = {
  'Apparel': { small: 'XS-S', medium: 'M-L', large: 'XL-XXL', unit: 'Size Range' },
  'Women\'s Apparel': { small: 'XS-S (0-4)', medium: 'M-L (6-10)', large: 'XL+ (12+)', unit: 'Size Range' },
  'Men\'s Apparel': { small: 'S-M (28-32)', medium: 'L-XL (34-38)', large: 'XXL+ (40+)', unit: 'Size Range' },
  'Kids Apparel': { small: 'Toddler (2T-4T)', medium: 'Kids (5-8)', large: 'Youth (10-16)', unit: 'Age Group' },
  'Accessories': { small: 'Small items (jewelry, belts)', medium: 'Medium items (scarves, hats)', large: 'Large items (bags)', unit: 'Item Type' },
  'Seasonal': { small: 'Single items', medium: 'Gift sets', large: 'Bundle packs', unit: 'Pack Type' },
  'Denim': { small: 'Skinny/Slim fit', medium: 'Regular fit', large: 'Relaxed/Wide fit', unit: 'Fit Type' },
};

// Get size preset for a category (with fallback)
const getSizePreset = (category: string) => {
  if (categorySizePresets[category]) return categorySizePresets[category];
  // Check for partial matches
  for (const key of Object.keys(categorySizePresets)) {
    if (category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase())) {
      return categorySizePresets[key];
    }
  }
  // Default preset
  return { small: 'Small items', medium: 'Medium items', large: 'Large items', unit: 'General' };
};

const ruleTypeOptions: { value: RuleType; label: string; description: string; critical?: boolean }[] = [
  { value: 'Space Allocation', label: 'Space Allocation', description: 'Category space % targets', critical: true },
  { value: 'Performance', label: 'Performance Rules', description: 'Sales-based placement', critical: true },
  { value: 'Capacity', label: 'Capacity / Fit', description: 'Shelf & SKU limits', critical: true },
  { value: 'Price Tier', label: 'Price Tier Rules', description: 'Tier mix & placement', critical: true },
  { value: 'Dimensional', label: 'Product Fit & Placement', description: 'Size-based shelf placement' },
  { value: 'Facing', label: 'Facing', description: 'Product facings' },
  { value: 'Brand Blocking', label: 'Brand Blocking', description: 'Group by brand' },
  { value: 'Adjacency', label: 'Adjacency', description: 'Placement rules' },
  { value: 'Mandatory SKU', label: 'Mandatory SKU', description: 'Required SKUs' },
  { value: 'Prohibited SKU', label: 'Prohibited SKU', description: 'Excluded SKUs' },
  { value: 'Priority', label: 'Priority', description: 'Eye-level placement' },
];

const allCategories = [
  'Apparel', 'Women\'s Apparel', 'Men\'s Apparel', 'Kids Apparel',
  'Denim', 'Tops', 'Dresses', 'Outerwear', 'Basics', 'Activewear',
  'Accessories', 'Bags', 'Jewelry', 'Scarves', 'Belts', 'Hats',
  'Seasonal', 'New Arrivals', 'Sale Items', 'Limited Edition'
];

const allSKUs = [
  { id: 'SKU-001', name: 'Classic Fit Tee - White', category: 'Tops' },
  { id: 'SKU-002', name: 'Slim Fit Denim - Dark Wash', category: 'Denim' },
  { id: 'SKU-003', name: 'Floral Print Dress', category: 'Dresses' },
  { id: 'SKU-004', name: 'Kids Graphic Tee', category: 'Kids Apparel' },
  { id: 'SKU-005', name: 'Leather Crossbody Bag', category: 'Bags' },
  { id: 'SKU-006', name: 'Statement Necklace', category: 'Jewelry' },
  { id: 'SKU-007', name: 'Wool Blend Scarf', category: 'Scarves' },
  { id: 'SKU-008', name: 'Relaxed Fit Jeans', category: 'Denim' },
  { id: 'SKU-009', name: 'Puffer Jacket', category: 'Outerwear' },
  { id: 'SKU-010', name: 'Athletic Leggings', category: 'Activewear' },
  { id: 'SKU-011', name: 'Basic V-Neck Tee', category: 'Basics' },
  { id: 'SKU-012', name: 'Canvas Belt', category: 'Belts' },
  { id: 'SKU-013', name: 'Bucket Hat', category: 'Hats' },
  { id: 'SKU-014', name: 'Limited Edition Collab Hoodie', category: 'Limited Edition' },
  { id: 'SKU-015', name: 'Sale Clearance Dress', category: 'Sale Items' },
];

const clusterOptions = ['Urban Flagship', 'Family Center', 'Outlet Value', 'Mall Anchor'];
const fixtureOptions = ['Wall Display', 'Table', 'End Cap', 'Hanging Rail', 'Folding Shelf'];
const brandOptions = ['Core Essentials', 'Premium Line', 'Kids Collection', 'Active Collection', 'Partner Brand', 'Designer Collab'];

const initialMockRules: Rule[] = [
  {
    id: 'RULE-001',
    name: 'Size Sequencing - Women\'s Wall',
    description: 'Arrange sizes from XS to XL, left to right on rails and shelves',
    types: ['Facing'],
    mapping: { categories: ['Women\'s Apparel'], clusters: ['Urban Flagship', 'Family Center'], fixtures: ['Wall Display'] },
    lastUpdated: '2026-04-22',
    status: 'Active',
    definition: { Facing: { minFacings: 2, maxFacings: 4 } },
    completedSteps: [1, 2, 3, 4],
  },
  {
    id: 'RULE-002',
    name: 'Color Blocking & Priority - Denim',
    description: 'Group denim by wash color and prioritize bestsellers at eye level',
    types: ['Brand Blocking', 'Priority'],
    mapping: { categories: ['Denim'], clusters: [], fixtures: ['Wall Display'] },
    lastUpdated: '2026-04-20',
    status: 'Active',
    definition: { 
      'Brand Blocking': { brand: 'Core Essentials', blockingType: 'Vertical', minProducts: 3 },
      'Priority': { target: 'Bestsellers', placement: 'Eye-level', priority: 'High' }
    },
    completedSteps: [1, 2, 3, 4],
  },
  {
    id: 'RULE-003',
    name: 'Mandatory & Prohibited SKUs - Accessories',
    description: 'Require trend items, exclude discontinued styles in flagship stores',
    types: ['Mandatory SKU', 'Prohibited SKU'],
    mapping: { categories: ['Accessories'], clusters: ['Urban Flagship'], fixtures: ['End Cap'] },
    lastUpdated: '2026-04-18',
    status: 'Active',
    definition: { 
      'Mandatory SKU': { skus: ['SKU-005', 'SKU-006'], minQuantity: 2 },
      'Prohibited SKU': { skus: ['SKU-015'], reason: 'Discontinued style' }
    },
    completedSteps: [1, 2, 3, 4],
  },
  {
    id: 'RULE-004',
    name: 'Draft - Kids Age Grouping',
    description: 'Organize kids apparel by age group with toddler items at lower heights',
    types: ['Adjacency'],
    mapping: { categories: ['Kids Apparel'], clusters: ['Family Center'], fixtures: ['Wall Display'] },
    lastUpdated: '2026-04-25',
    status: 'Draft',
    definition: {},
    completedSteps: [1, 2],
  },
  {
    id: 'RULE-005',
    name: 'Seasonal Promo Placement',
    description: 'Feature promotional items prominently with clear pricing on tables',
    types: ['Priority', 'Space Allocation'],
    mapping: { categories: ['Seasonal', 'Sale Items'], clusters: ['Mall Anchor', 'Outlet Value'], fixtures: ['Table'] },
    lastUpdated: '2026-04-15',
    status: 'Active',
    definition: { 
      'Priority': { target: 'New Arrivals', placement: 'Front-center', priority: 'High' },
      'Space Allocation': { minPercent: 30, maxPercent: 50 }
    },
    completedSteps: [1, 2, 3, 4],
  },
  {
    id: 'RULE-006',
    name: 'Capacity Rules - Hanging Rails',
    description: 'Maintain proper spacing between hangers for easy browsing',
    types: ['Capacity'],
    mapping: { categories: ['Apparel', 'Dresses', 'Outerwear'], clusters: [], fixtures: ['Hanging Rail'] },
    lastUpdated: '2026-04-10',
    status: 'Active',
    definition: { 
      'Capacity': { maxItemsPerRail: 25, minSpacing: '2 inches' }
    },
    completedSteps: [1, 2, 3, 4],
  },
];

interface Filters {
  ruleType: string;
  category: string;
  mappingStatus: string;
  ruleStatus: string;
}

const emptyRule: Partial<Rule> = {
  name: '',
  description: '',
  types: [],
  mapping: { categories: [], clusters: [], fixtures: [] },
  status: 'Draft',
  definition: {},
  completedSteps: [],
};

// Searchable Dropdown Component
const SearchableDropdown: React.FC<{
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  allowUpload?: boolean;
  onUpload?: (items: string[]) => void;
}> = ({ options, selected, onChange, placeholder, allowUpload, onUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt)
  );

  const handleSelect = (item: string) => {
    onChange([...selected, item]);
    setSearch('');
  };

  const handleRemove = (item: string) => {
    onChange(selected.filter(s => s !== item));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const items = text.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);
        if (onUpload) onUpload(items);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="searchable-dropdown">
      <div className="dropdown-selected-items">
        {selected.map(item => (
          <span key={item} className="dropdown-tag">
            {item}
            <button onClick={() => handleRemove(item)}><CloseOutlined sx={{ fontSize: 12 }} /></button>
          </span>
        ))}
      </div>
      <div className="dropdown-input-wrapper">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length === 0 ? placeholder : 'Add more...'}
          className="dropdown-search-input"
        />
        <KeyboardArrowDown sx={{ fontSize: 16 }} className="dropdown-chevron" />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {filteredOptions.length > 0 ? (
            filteredOptions.slice(0, 10).map(opt => (
              <div key={opt} className="dropdown-item" onClick={() => handleSelect(opt)}>
                {opt}
              </div>
            ))
          ) : (
            <div className="dropdown-empty">No matches found</div>
          )}
          {filteredOptions.length > 10 && (
            <div className="dropdown-more">+{filteredOptions.length - 10} more items</div>
          )}
        </div>
      )}
      {allowUpload && (
        <div className="dropdown-upload">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt" style={{ display: 'none' }} />
          <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
            <FileUploadOutlined sx={{ fontSize: 14 }} /> Upload CSV/TXT
          </button>
        </div>
      )}
      {isOpen && <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

// Custom Select Dropdown Component for premium styling
const CustomSelect: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-select-wrapper">
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? '' : 'placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <KeyboardArrowDown sx={{ fontSize: 18 }} className={`custom-select-arrow ${isOpen ? 'rotated' : ''}`} />
      </div>
      {isOpen && (
        <>
          <div className="custom-select-menu">
            {options.map(opt => (
              <div 
                key={opt.value} 
                className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
                {opt.value === value && <Check sx={{ fontSize: 16 }} />}
              </div>
            ))}
          </div>
          <div className="custom-select-backdrop" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};

// Filter select — wraps IA Select for compact single-row toolbar use
interface RuleFilterSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

const RuleFilterSelect: React.FC<RuleFilterSelectProps> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<SelectOption[]>(options);
  const selected = value ? (options.find(o => o.value === value) ?? null) : null;

  return (
    <Select
      placeholder={label}
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

export const POGRuleManagement: React.FC = () => {
  const { user } = useAuth();
  /** District managers: browse rules only — no create, edit, delete, or uploads */
  const isPogViewOnly = user?.role === 'DM';
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'library' | 'builder'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [rules, setRules] = useState<Rule[]>(initialMockRules);
  const [newRuleHighlight, setNewRuleHighlight] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ ruleType: '', category: '', mappingStatus: '', ruleStatus: '' });
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [builderForm, setBuilderForm] = useState<Partial<Rule>>(emptyRule);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Accept new rule from Ask Alan via URL params (not for view-only / DM)
  useEffect(() => {
    if (isPogViewOnly) {
      if (searchParams.get('newRuleName') || searchParams.get('newRuleType') || searchParams.get('newRuleCategory')) {
        setSearchParams({}, { replace: true });
      }
      return;
    }
    const ruleName = searchParams.get('newRuleName');
    const ruleType = searchParams.get('newRuleType');
    const ruleCategory = searchParams.get('newRuleCategory');
    if (ruleName && ruleType) {
      const mappedType = (ruleTypeOptions.find(rt => rt.label === ruleType || rt.value === ruleType)?.value || 'Brand Blocking') as RuleType;
      let createdId: string | null = null;
      setRules(prev => {
        if (prev.some(r => r.name === ruleName)) return prev;
        const newId = `RULE-${String(prev.length + 1).padStart(3, '0')}`;
        createdId = newId;
        const newRule: Rule = {
          id: newId,
          name: ruleName,
          description: `${ruleName} — created via Ask Alan. Applies ${ruleType.toLowerCase()} constraints to planogram layouts.`,
          types: [mappedType],
          mapping: { categories: ruleCategory ? [ruleCategory] : [], clusters: [], fixtures: [] },
          lastUpdated: new Date().toISOString().split('T')[0],
          status: 'Active',
          definition: {},
          completedSteps: [1, 2, 3, 4],
        };
        return [newRule, ...prev];
      });
      setSearchParams({}, { replace: true });
      if (createdId) {
        setNewRuleHighlight(createdId);
        setTimeout(() => setNewRuleHighlight(null), 5000);
      }
    }
  }, [isPogViewOnly, searchParams, setSearchParams]);

  const isMapped = (rule: Rule | Partial<Rule>): boolean => {
    const mapping = rule.mapping;
    if (!mapping) return false;
    return mapping.categories.length > 0 || mapping.clusters.length > 0 || mapping.fixtures.length > 0;
  };

  const unmappedCount = rules.filter(r => !isMapped(r) && r.status !== 'Draft').length;
  const draftCount = rules.filter(r => r.status === 'Draft').length;

  const hasActiveFilters = !!(searchQuery || filters.ruleType || filters.mappingStatus || filters.ruleStatus);

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({ ruleType: '', category: '', mappingStatus: '', ruleStatus: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) || rule.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filters.ruleType || rule.types.includes(filters.ruleType as RuleType);
    const matchesCategory = !filters.category || rule.mapping.categories.includes(filters.category);
    const matchesMappingStatus = !filters.mappingStatus || 
      (filters.mappingStatus === 'Mapped' && isMapped(rule)) ||
      (filters.mappingStatus === 'Unmapped' && !isMapped(rule));
    const matchesRuleStatus = !filters.ruleStatus || rule.status === filters.ruleStatus;
    return matchesSearch && matchesType && matchesCategory && matchesMappingStatus && matchesRuleStatus;
  }).sort((a, b) => {
    if (a.status === 'Draft' && b.status !== 'Draft') return -1;
    if (a.status !== 'Draft' && b.status === 'Draft') return 1;
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(filteredRules.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRules = filteredRules.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const startRow = filteredRules.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endRow = Math.min(safePage * rowsPerPage, filteredRules.length);

  const handleViewRule = (rule: Rule) => setSelectedRule(rule);

  const handleEditRule = (rule: Rule) => {
    if (isPogViewOnly) return;
    setBuilderForm({ ...rule });
    setIsEditing(true);
    setEditingRuleId(rule.id);
    setCurrentStep(rule.status === 'Draft' ? Math.max(...rule.completedSteps, 1) : 1);
    setActiveTab('builder');
  };

  const handleDeleteClick = (rule: Rule) => {
    if (isPogViewOnly) return;
    setRuleToDelete(rule);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (isPogViewOnly) return;
    if (ruleToDelete) {
      setRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
      setShowDeleteModal(false);
      setRuleToDelete(null);
    }
  };

  const handleCreateNew = () => {
    if (isPogViewOnly) return;
    setBuilderForm({ ...emptyRule });
    setIsEditing(false);
    setEditingRuleId(null);
    setCurrentStep(1);
    setActiveTab('builder');
  };

  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1: return !!builderForm.name && builderForm.name.length > 0;
      case 2: return true; // Mapping is optional
      case 3: return (builderForm.types?.length || 0) > 0;
      case 4: return Object.keys(builderForm.definition || {}).length > 0;
      default: return false;
    }
  };

  const canProceedToStep = (stepId: number): boolean => {
    for (let i = 1; i < stepId; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep < 4 && isStepComplete(currentStep)) {
      const newCompletedSteps = [...(builderForm.completedSteps || [])];
      if (!newCompletedSteps.includes(currentStep)) newCompletedSteps.push(currentStep);
      setBuilderForm(prev => ({ ...prev, completedSteps: newCompletedSteps }));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSaveDraft = () => {
    if (isPogViewOnly) return;
    const newCompletedSteps = [...(builderForm.completedSteps || [])];
    if (isStepComplete(currentStep) && !newCompletedSteps.includes(currentStep)) newCompletedSteps.push(currentStep);
    const draftRule: Rule = {
      id: editingRuleId || `RULE-${String(rules.length + 1).padStart(3, '0')}`,
      name: builderForm.name || 'Untitled Rule',
      description: builderForm.description || '',
      types: builderForm.types || [],
      mapping: builderForm.mapping || { categories: [], clusters: [], fixtures: [] },
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Draft',
      definition: builderForm.definition || {},
      completedSteps: newCompletedSteps,
    };
    if (isEditing && editingRuleId) {
      setRules(prev => prev.map(r => r.id === editingRuleId ? draftRule : r));
    } else {
      setRules(prev => [...prev, draftRule]);
    }
    setActiveTab('library');
    resetBuilder();
  };

  const handleSaveRule = () => {
    if (isPogViewOnly) return;
    if (!builderForm.name || !builderForm.types?.length) return;
    const newRule: Rule = {
      id: editingRuleId || `RULE-${String(rules.length + 1).padStart(3, '0')}`,
      name: builderForm.name,
      description: builderForm.description || '',
      types: builderForm.types,
      mapping: builderForm.mapping || { categories: [], clusters: [], fixtures: [] },
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Active',
      definition: builderForm.definition || {},
      completedSteps: [1, 2, 3, 4],
    };
    if (isEditing && editingRuleId) {
      setRules(prev => prev.map(r => r.id === editingRuleId ? newRule : r));
    } else {
      setRules(prev => [...prev, newRule]);
    }
    setActiveTab('library');
    resetBuilder();
  };

  const resetBuilder = () => {
    setBuilderForm({ ...emptyRule });
    setIsEditing(false);
    setEditingRuleId(null);
    setCurrentStep(1);
  };

  useEffect(() => {
    if (!isPogViewOnly || activeTab !== 'builder') return;
    setActiveTab('library');
    setBuilderForm({ ...emptyRule });
    setIsEditing(false);
    setEditingRuleId(null);
    setCurrentStep(1);
  }, [isPogViewOnly, activeTab]);

  const handleTypeToggle = (type: RuleType) => {
    const currentTypes = builderForm.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    const newDefinition = { ...builderForm.definition };
    if (!newTypes.includes(type)) delete newDefinition[type];
    setBuilderForm(prev => ({ ...prev, types: newTypes, definition: newDefinition }));
  };

  const handleMappingChange = (field: keyof RuleMapping, values: string[]) => {
    setBuilderForm(prev => ({ ...prev, mapping: { ...prev.mapping!, [field]: values } }));
  };

  const renderMappingBadges = (items: string[], max: number = 2) => {
    if (items.length === 0) return <span className="rule-no-mapping">—</span>;
    const displayed = items.slice(0, max);
    const remaining = items.length - max;
    return (
      <div className="rule-mapping-badges">
        {displayed.map(item => (<span key={item} className="rule-mapping-badge">{item}</span>))}
        {remaining > 0 && <span className="rule-mapping-more">+{remaining}</span>}
      </div>
    );
  };

  const getTypeBadgeClass = (type: RuleType): string => {
    const typeMap: Record<RuleType, string> = {
      'Space Allocation': 'type-critical', 'Performance': 'type-critical', 'Capacity': 'type-critical', 'Price Tier': 'type-critical',
      'Dimensional': 'type-dimensional', 'Facing': 'type-facing', 'Brand Blocking': 'type-brand-blocking',
      'Adjacency': 'type-adjacency', 'Mandatory SKU': 'type-mandatory-sku', 'Prohibited SKU': 'type-prohibited-sku',
      'Priority': 'type-priority', 'Fixture-Specific': 'type-fixture', 'Cluster-Specific': 'type-cluster',
    };
    return typeMap[type] || '';
  };

  const updateDefinition = (type: RuleType, field: string, value: any) => {
    setBuilderForm(prev => ({
      ...prev,
      definition: {
        ...prev.definition,
        [type]: { ...(prev.definition?.[type] || {}), [field]: value }
      }
    }));
  };

  const renderDefinitionForType = (type: RuleType) => {
    const def = builderForm.definition?.[type] || {};
    const mappedCategories = builderForm.mapping?.categories || [];
    
    switch (type) {
      case 'Space Allocation':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Space Allocation</h4>
            <div className="wizard-field-group">
              <label>Category</label>
              {mappedCategories.length > 0 ? (
                <div className="auto-mapped-tags">
                  {mappedCategories.map(c => <span key={c} className="mapped-tag">{c}</span>)}
                </div>
              ) : (
                <p className="no-mapping-hint">No categories mapped. Go back to Mapping step to select categories.</p>
              )}
            </div>
            <div className="wizard-field-group">
              <label>Target Space %</label>
              <div className="slider-container">
                <input type="range" min="0" max="100" value={def.targetPercent || 20} onChange={(e) => updateDefinition(type, 'targetPercent', parseInt(e.target.value))} />
                <span className="slider-value">{def.targetPercent || 20}%</span>
              </div>
            </div>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Min %</label>
                <input type="number" min="0" max="100" value={def.minPercent || ''} onChange={(e) => updateDefinition(type, 'minPercent', parseInt(e.target.value) || 0)} placeholder="10" />
              </div>
              <div className="wizard-field-group">
                <label>Max %</label>
                <input type="number" min="0" max="100" value={def.maxPercent || ''} onChange={(e) => updateDefinition(type, 'maxPercent', parseInt(e.target.value) || 0)} placeholder="30" />
              </div>
            </div>
          </Card>
        );
      case 'Performance':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Performance Rules</h4>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Metric</label>
                <select value={def.metric || ''} onChange={(e) => updateDefinition(type, 'metric', e.target.value)}>
                  <option value="">Select Metric</option>
                  <option value="Sales">Sales ($)</option>
                  <option value="Units">Units Sold</option>
                  <option value="Margin">Margin %</option>
                  <option value="Velocity">Velocity</option>
                </select>
              </div>
              <div className="wizard-field-group">
                <label>Threshold</label>
                <select value={def.threshold || ''} onChange={(e) => updateDefinition(type, 'threshold', e.target.value)}>
                  <option value="">Select Threshold</option>
                  <option value="Top 10%">Top 10%</option>
                  <option value="Top 20%">Top 20%</option>
                  <option value="Top 30%">Top 30%</option>
                  <option value="Rank 1-5">Rank 1-5</option>
                  <option value="Rank 1-10">Rank 1-10</option>
                </select>
              </div>
            </div>
            <div className="wizard-field-group">
              <label>Action</label>
              <select value={def.action || ''} onChange={(e) => updateDefinition(type, 'action', e.target.value)}>
                <option value="">Select Action</option>
                <option value="+1 Facing">+1 Facing</option>
                <option value="+2 Facings">+2 Facings</option>
                <option value="Eye Level">Move to Eye Level</option>
                <option value="Prime Position">Prime Position</option>
                <option value="Increase Space">Increase Space 10%</option>
              </select>
            </div>
          </Card>
        );
      case 'Capacity':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Capacity / Fit</h4>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Shelf Limit</label>
                <input type="number" min="1" value={def.shelfLimit || ''} onChange={(e) => updateDefinition(type, 'shelfLimit', parseInt(e.target.value) || 0)} placeholder="5" />
                <span className="field-hint">Max shelves to use</span>
              </div>
              <div className="wizard-field-group">
                <label>Max SKUs</label>
                <input type="number" min="1" value={def.maxSKUs || ''} onChange={(e) => updateDefinition(type, 'maxSKUs', parseInt(e.target.value) || 0)} placeholder="25" />
                <span className="field-hint">Total SKUs allowed</span>
              </div>
              <div className="wizard-field-group">
                <label>Max Facings</label>
                <input type="number" min="1" value={def.maxFacings || ''} onChange={(e) => updateDefinition(type, 'maxFacings', parseInt(e.target.value) || 0)} placeholder="50" />
                <span className="field-hint">Total facings allowed</span>
              </div>
            </div>
          </Card>
        );
      case 'Price Tier':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Price Tier Rules</h4>
            <div className="price-tier-section">
              <label>Tier Mix (must total 100%)</label>
              <div className="tier-sliders">
                <div className="tier-slider-row">
                  <span className="tier-label">Premium</span>
                  <input type="range" min="0" max="100" value={def.premiumPercent || 20} onChange={(e) => updateDefinition(type, 'premiumPercent', parseInt(e.target.value))} />
                  <span className="tier-value">{def.premiumPercent || 20}%</span>
                </div>
                <div className="tier-slider-row">
                  <span className="tier-label">Mid-Tier</span>
                  <input type="range" min="0" max="100" value={def.midTierPercent || 50} onChange={(e) => updateDefinition(type, 'midTierPercent', parseInt(e.target.value))} />
                  <span className="tier-value">{def.midTierPercent || 50}%</span>
                </div>
                <div className="tier-slider-row">
                  <span className="tier-label">Value</span>
                  <input type="range" min="0" max="100" value={def.valuePercent || 30} onChange={(e) => updateDefinition(type, 'valuePercent', parseInt(e.target.value))} />
                  <span className="tier-value">{def.valuePercent || 30}%</span>
                </div>
              </div>
            </div>
            <div className="wizard-field-group" style={{ marginTop: '16px' }}>
              <label>Tier Placement Mapping</label>
              <div className="tier-placement-grid">
                <div className="tier-placement-row">
                  <span>Premium →</span>
                  <select value={def.premiumPlacement || ''} onChange={(e) => updateDefinition(type, 'premiumPlacement', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Top Shelf">Top Shelf</option>
                    <option value="Eye Level">Eye Level</option>
                    <option value="Mid Level">Mid Level</option>
                  </select>
                </div>
                <div className="tier-placement-row">
                  <span>Mid-Tier →</span>
                  <select value={def.midTierPlacement || ''} onChange={(e) => updateDefinition(type, 'midTierPlacement', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Eye Level">Eye Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Bottom">Bottom</option>
                  </select>
                </div>
                <div className="tier-placement-row">
                  <span>Value →</span>
                  <select value={def.valuePlacement || ''} onChange={(e) => updateDefinition(type, 'valuePlacement', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Bottom">Bottom</option>
                    <option value="Floor">Floor Level</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        );
      case 'Facing':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Facing Rules</h4>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Min Facings</label>
                <input type="number" min="1" value={def.minFacings || ''} onChange={(e) => updateDefinition(type, 'minFacings', parseInt(e.target.value) || 0)} placeholder="2" />
              </div>
              <div className="wizard-field-group">
                <label>Max Facings</label>
                <input type="number" min="1" value={def.maxFacings || ''} onChange={(e) => updateDefinition(type, 'maxFacings', parseInt(e.target.value) || 0)} placeholder="6" />
              </div>
            </div>
          </Card>
        );
      case 'Dimensional':
        const mappedCategory = mappedCategories[0] || 'Beverages';
        const sizePreset = getSizePreset(mappedCategory);
        const sizeDefinitionType = def.sizeDefinitionType || 'category_standard';
        
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Product Fit & Placement</h4>
            <p className="card-description">Sizes are automatically derived based on category standards for correct shelf placement.</p>
            
            <div className="wizard-field-group">
              <label>Size Definition</label>
              <div className="size-definition-toggle">
                <label className={`radio-option ${sizeDefinitionType === 'category_standard' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="sizeDefinition" 
                    value="category_standard"
                    checked={sizeDefinitionType === 'category_standard'}
                    onChange={() => updateDefinition(type, 'sizeDefinitionType', 'category_standard')}
                  />
                  <span className="radio-label">Use Category Standard</span>
                  <span className="radio-badge">Recommended</span>
                </label>
                <label className={`radio-option ${sizeDefinitionType === 'custom' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="sizeDefinition" 
                    value="custom"
                    checked={sizeDefinitionType === 'custom'}
                    onChange={() => updateDefinition(type, 'sizeDefinitionType', 'custom')}
                  />
                  <span className="radio-label">Custom</span>
                </label>
              </div>
            </div>

            {sizeDefinitionType === 'category_standard' && (
              <div className="size-preset-preview">
                <div className="preset-header">
                  <span className="preset-category">{mappedCategory}</span>
                  <span className="preset-unit">{sizePreset.unit}</span>
                </div>
                <div className="preset-label">Size Buckets (Auto-applied)</div>
                <div className="size-buckets-grid">
                  <div className="size-bucket">
                    <span className="bucket-size">Small</span>
                    <span className="bucket-arrow">→</span>
                    <span className="bucket-value">{sizePreset.small}</span>
                  </div>
                  <div className="size-bucket">
                    <span className="bucket-size">Medium</span>
                    <span className="bucket-arrow">→</span>
                    <span className="bucket-value">{sizePreset.medium}</span>
                  </div>
                  <div className="size-bucket">
                    <span className="bucket-size">Large</span>
                    <span className="bucket-arrow">→</span>
                    <span className="bucket-value">{sizePreset.large}</span>
                  </div>
                </div>
              </div>
            )}

            {sizeDefinitionType === 'custom' && (
              <div className="custom-size-definition">
                <div className="wizard-field-group">
                  <label>Small</label>
                  <input type="text" value={def.customSmall || ''} onChange={(e) => updateDefinition(type, 'customSmall', e.target.value)} placeholder="e.g., ≤ 500 ml" />
                </div>
                <div className="wizard-field-group">
                  <label>Medium</label>
                  <input type="text" value={def.customMedium || ''} onChange={(e) => updateDefinition(type, 'customMedium', e.target.value)} placeholder="e.g., 500 ml – 1L" />
                </div>
                <div className="wizard-field-group">
                  <label>Large</label>
                  <input type="text" value={def.customLarge || ''} onChange={(e) => updateDefinition(type, 'customLarge', e.target.value)} placeholder="e.g., ≥ 1L" />
                </div>
              </div>
            )}

            <div className="placement-rules-section">
              <label>Placement Rules</label>
              <p className="section-hint">Define where each size should be placed on the shelf.</p>
              <div className="placement-grid">
                <div className="placement-row">
                  <span className="placement-size">Small</span>
                  <span className="placement-arrow">→</span>
                  <CustomSelect
                    options={[
                      { value: 'Top Shelf', label: 'Top Shelf' },
                      { value: 'Eye Level', label: 'Eye Level' },
                      { value: 'Mid Shelf', label: 'Mid Shelf' },
                      { value: 'Bottom Shelf', label: 'Bottom Shelf' }
                    ]}
                    value={def.smallPlacement || 'Top Shelf'}
                    onChange={(val) => updateDefinition(type, 'smallPlacement', val)}
                    placeholder="Select placement"
                  />
                </div>
                <div className="placement-row">
                  <span className="placement-size">Medium</span>
                  <span className="placement-arrow">→</span>
                  <CustomSelect
                    options={[
                      { value: 'Top Shelf', label: 'Top Shelf' },
                      { value: 'Eye Level', label: 'Eye Level' },
                      { value: 'Mid Shelf', label: 'Mid Shelf' },
                      { value: 'Bottom Shelf', label: 'Bottom Shelf' }
                    ]}
                    value={def.mediumPlacement || 'Eye Level'}
                    onChange={(val) => updateDefinition(type, 'mediumPlacement', val)}
                    placeholder="Select placement"
                  />
                </div>
                <div className="placement-row">
                  <span className="placement-size">Large</span>
                  <span className="placement-arrow">→</span>
                  <CustomSelect
                    options={[
                      { value: 'Top Shelf', label: 'Top Shelf' },
                      { value: 'Eye Level', label: 'Eye Level' },
                      { value: 'Mid Shelf', label: 'Mid Shelf' },
                      { value: 'Bottom Shelf', label: 'Bottom Shelf' }
                    ]}
                    value={def.largePlacement || 'Bottom Shelf'}
                    onChange={(val) => updateDefinition(type, 'largePlacement', val)}
                    placeholder="Select placement"
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      case 'Brand Blocking':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Brand Blocking Rules</h4>
            <div className="wizard-field-group">
              <label>Brands</label>
              <SearchableDropdown
                options={brandOptions}
                selected={def.brands || []}
                onChange={(brands) => updateDefinition(type, 'brands', brands)}
                placeholder="Search and select brands..."
              />
            </div>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Blocking Type</label>
                <CustomSelect
                  options={[
                    { value: 'Vertical', label: 'Vertical' },
                    { value: 'Horizontal', label: 'Horizontal' },
                    { value: 'Block', label: 'Block' }
                  ]}
                  value={def.blockingType || ''}
                  onChange={(val) => updateDefinition(type, 'blockingType', val)}
                  placeholder="Choose blocking type"
                />
              </div>
              <div className="wizard-field-group">
                <label>Min Products per Brand</label>
                <input type="number" value={def.minProducts || ''} onChange={(e) => updateDefinition(type, 'minProducts', parseInt(e.target.value) || 0)} placeholder="e.g., 3" />
              </div>
            </div>
          </Card>
        );
      case 'Adjacency':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Adjacency Rules</h4>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Category/Product A</label>
                <input type="text" value={def.categoryA || ''} onChange={(e) => updateDefinition(type, 'categoryA', e.target.value)} placeholder="e.g., Cola" />
              </div>
              <div className="wizard-field-group">
                <label>Condition</label>
                <CustomSelect
                  options={[
                    { value: 'Must Be Adjacent', label: 'Must Be Adjacent' },
                    { value: 'Not Adjacent', label: 'Must NOT Be Adjacent' }
                  ]}
                  value={def.condition || ''}
                  onChange={(val) => updateDefinition(type, 'condition', val)}
                  placeholder="Choose condition"
                />
              </div>
              <div className="wizard-field-group">
                <label>Category/Product B</label>
                <input type="text" value={def.categoryB || ''} onChange={(e) => updateDefinition(type, 'categoryB', e.target.value)} placeholder="e.g., Diet Cola" />
              </div>
            </div>
          </Card>
        );
      case 'Mandatory SKU':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Mandatory SKU Rules</h4>
            <div className="wizard-field-group">
              <label>Select SKUs (search or upload)</label>
              <SearchableDropdown
                options={allSKUs.map(s => `${s.id} - ${s.name}`)}
                selected={def.skus || []}
                onChange={(skus) => updateDefinition(type, 'skus', skus)}
                placeholder="Search SKUs..."
                allowUpload
                onUpload={(items) => updateDefinition(type, 'skus', [...(def.skus || []), ...items])}
              />
            </div>
            <div className="wizard-field-group" style={{ maxWidth: '200px', marginTop: '12px' }}>
              <label>Min Quantity</label>
              <input type="number" min="1" value={def.minQuantity || ''} onChange={(e) => updateDefinition(type, 'minQuantity', parseInt(e.target.value) || 1)} placeholder="1" />
            </div>
          </Card>
        );
      case 'Prohibited SKU':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px', backgroundColor: 'var(--ia-color-error-bg)', borderColor: 'var(--ia-color-error-soft)' }}>
            <h4>Prohibited SKU Rules</h4>
            <div className="wizard-field-group">
              <label>Select SKUs to Prohibit (search or upload)</label>
              <SearchableDropdown
                options={allSKUs.map(s => `${s.id} - ${s.name}`)}
                selected={def.skus || []}
                onChange={(skus) => updateDefinition(type, 'skus', skus)}
                placeholder="Search SKUs to prohibit..."
                allowUpload
                onUpload={(items) => updateDefinition(type, 'skus', [...(def.skus || []), ...items])}
              />
            </div>
            <div className="wizard-field-group" style={{ marginTop: '12px' }}>
              <label>Reason</label>
              <input type="text" value={def.reason || ''} onChange={(e) => updateDefinition(type, 'reason', e.target.value)} placeholder="e.g., Competitor exclusion" />
            </div>
          </Card>
        );
      case 'Priority':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>Priority Rules</h4>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Target</label>
                <CustomSelect
                  options={[
                    { value: 'Store Brand', label: 'Store Brand' },
                    { value: 'High Margin', label: 'High Margin' },
                    { value: 'Promotion', label: 'Promotional' },
                    { value: 'New Products', label: 'New Products' }
                  ]}
                  value={def.target || ''}
                  onChange={(val) => updateDefinition(type, 'target', val)}
                  placeholder="Choose target"
                />
              </div>
              <div className="wizard-field-group">
                <label>Placement</label>
                <CustomSelect
                  options={[
                    { value: 'Eye-level', label: 'Eye-level' },
                    { value: 'Mid-level', label: 'Mid-level' },
                    { value: 'Bottom', label: 'Bottom' }
                  ]}
                  value={def.placement || ''}
                  onChange={(val) => updateDefinition(type, 'placement', val)}
                  placeholder="Choose placement"
                />
              </div>
              <div className="wizard-field-group">
                <label>Priority Level</label>
                <CustomSelect
                  options={[
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' }
                  ]}
                  value={def.priority || ''}
                  onChange={(val) => updateDefinition(type, 'priority', val)}
                  placeholder="Choose priority"
                />
              </div>
            </div>
          </Card>
        );
      case 'Fixture-Specific':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>🗄️ Fixture-Specific Rules</h4>
            <div className="wizard-field-row">
              <div className="wizard-field-group">
                <label>Target Fixture</label>
                <select value={def.targetFixture || ''} onChange={(e) => updateDefinition(type, 'targetFixture', e.target.value)}>
                  <option value="">Select</option>
                  {fixtureOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="wizard-field-group"><label>Max SKUs</label><input type="number" value={def.maxSKUs || ''} onChange={(e) => updateDefinition(type, 'maxSKUs', parseInt(e.target.value) || 0)} /></div>
              <div className="wizard-field-group"><label>Max Shelves</label><input type="number" value={def.maxShelves || ''} onChange={(e) => updateDefinition(type, 'maxShelves', parseInt(e.target.value) || 0)} /></div>
            </div>
          </Card>
        );
      case 'Cluster-Specific':
        return (
          <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '24px 28px', marginBottom: '20px' }}>
            <h4>🏪 Cluster-Specific Rules</h4>
            <div className="wizard-field-group">
              <label>Target Cluster</label>
              <select value={def.targetCluster || ''} onChange={(e) => updateDefinition(type, 'targetCluster', e.target.value)}>
                <option value="">Select</option>
                {clusterOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="wizard-field-group" style={{ marginTop: '12px' }}>
              <label>Special Instructions</label>
              <TextArea value={def.instructions || ''} onChange={(e) => updateDefinition(type, 'instructions', e.target.value)} placeholder="Enter instructions..." rows={3} />
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  const renderWizardContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Basic Information</h3>
            <p className="wizard-step-description">Start by providing a name and description for your rule.</p>
            <div className="wizard-form-fields">
              <div className="wizard-field-group">
                <label>Rule Name <span className="required">*</span></label>
                <input type="text" value={builderForm.name || ''} onChange={(e) => setBuilderForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter a descriptive name for this rule" />
              </div>
              <div className="wizard-field-group">
                <label>Description</label>
                <TextArea value={builderForm.description || ''} onChange={(e) => setBuilderForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe what this rule does and when it should be applied" rows={4} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Rule Mapping</h3>
            <p className="wizard-step-description">Define where this rule applies. Select any combination of categories, clusters/stores, and fixtures — use one, two, or all three.</p>
            <div className="wizard-mapping-sections">
              <div className="wizard-mapping-group">
                <h4>Categories</h4>
                <SearchableDropdown
                  options={allCategories}
                  selected={builderForm.mapping?.categories || []}
                  onChange={(cats) => handleMappingChange('categories', cats)}
                  placeholder="Search categories..."
                />
              </div>
              <div className="wizard-mapping-group">
                <h4>Clusters / Stores</h4>
                <SearchableDropdown
                  options={clusterOptions}
                  selected={builderForm.mapping?.clusters || []}
                  onChange={(clusters) => handleMappingChange('clusters', clusters)}
                  placeholder="Search clusters/stores..."
                />
              </div>
              <div className="wizard-mapping-group">
                <h4>Fixtures</h4>
                <SearchableDropdown
                  options={fixtureOptions}
                  selected={builderForm.mapping?.fixtures || []}
                  onChange={(fixtures) => handleMappingChange('fixtures', fixtures)}
                  placeholder="Search fixtures..."
                />
              </div>
            </div>
            <div className="wizard-or-divider">
              <span>OR</span>
            </div>
            <div className="wizard-upload-section">
              <h4>Bulk Upload</h4>
              <p className="upload-hint">Upload a CSV or TXT file with categories, clusters, or fixtures to apply in bulk.</p>
              <label className="upload-btn">
                <FileUploadOutlined sx={{ fontSize: 16 }} />
                Upload CSV/TXT
                <input type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      const items = text.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
                      const matchedCategories = items.filter(i => allCategories.includes(i));
                      const matchedClusters = items.filter(i => clusterOptions.includes(i));
                      const matchedFixtures = items.filter(i => fixtureOptions.includes(i));
                      if (matchedCategories.length > 0) handleMappingChange('categories', [...(builderForm.mapping?.categories || []), ...matchedCategories]);
                      if (matchedClusters.length > 0) handleMappingChange('clusters', [...(builderForm.mapping?.clusters || []), ...matchedClusters]);
                      if (matchedFixtures.length > 0) handleMappingChange('fixtures', [...(builderForm.mapping?.fixtures || []), ...matchedFixtures]);
                    };
                    reader.readAsText(file);
                  }
                  e.target.value = '';
                }} />
              </label>
            </div>
            {!isMapped(builderForm) && (
              <div className="wizard-warning-card"><WarningAmberOutlined sx={{ fontSize: 18 }} /><div><strong>No Mapping Selected</strong><p>This rule will be saved but marked as Unmapped.</p></div></div>
            )}
            {isMapped(builderForm) && (
              <div className="wizard-success-card"><CheckCircleOutlined sx={{ fontSize: 18 }} /><div><strong>Rule Will Be Applied To:</strong>
                <ul>
                  {(builderForm.mapping?.categories?.length || 0) > 0 && <li>Categories: {builderForm.mapping?.categories.join(', ')}</li>}
                  {(builderForm.mapping?.clusters?.length || 0) > 0 && <li>Clusters: {builderForm.mapping?.clusters.join(', ')}</li>}
                  {(builderForm.mapping?.fixtures?.length || 0) > 0 && <li>Fixtures: {builderForm.mapping?.fixtures.join(', ')}</li>}
                </ul>
              </div></div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Select Rule Types</h3>
            <p className="wizard-step-description">Choose one or more rule types to combine in this rule. You can select multiple types to create a comprehensive rule.</p>
            <div className="wizard-rule-type-groups">
              {ruleTypeGroups.map(group => (
                <div key={group.name} className="rule-type-group">
                  <h4 className="rule-type-group-title">{group.name}</h4>
                  <div className="rule-type-group-grid">
                    {group.types.map(typeValue => {
                      const rt = ruleTypeOptions.find(r => r.value === typeValue);
                      if (!rt) return null;
                      return (
                        <div key={rt.value} className={`wizard-rule-type-card ${builderForm.types?.includes(rt.value) ? 'selected' : ''} ${rt.critical ? 'critical' : ''}`} onClick={() => handleTypeToggle(rt.value)}>
                          <span className="wizard-rule-type-icon">{ruleTypeIcons[rt.value]}</span>
                          <div className="wizard-rule-type-info">
                            <h4>{rt.label}</h4>
                            <p>{rt.description}</p>
                          </div>
                          {builderForm.types?.includes(rt.value) && <CheckCircleOutlined sx={{ fontSize: 20 }} className="wizard-rule-type-check" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {(builderForm.types?.length || 0) > 0 && (
              <div className="wizard-selected-types">
                <strong>Selected:</strong> {builderForm.types?.map(t => ruleTypeOptions.find(r => r.value === t)?.label).join(', ')}
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Rule Definition</h3>
            <p className="wizard-step-description">Configure the parameters for each selected rule type.</p>
            {(builderForm.types?.length || 0) === 0 ? (
              <div className="wizard-warning-card"><WarningAmberOutlined sx={{ fontSize: 18 }} /><div>Please go back and select at least one rule type.</div></div>
            ) : (
              <div className="wizard-definitions-list">
                {builderForm.types?.map(type => (
                  <React.Fragment key={type}>{renderDefinitionForType(type)}</React.Fragment>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="rule-management">
        <div className="page-loading">
          <Loader size="large" />
          <p>Loading Rule Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rule-management">
      <div className="rule-management-header">
        <div className="pi-header-row">
          <div className="rule-management-title-section">
            <div className="rule-management-title-row">
              <GppGoodOutlined sx={{ fontSize: 24 }} />
              <h1 className="rule-management-title">POG Rule Management</h1>
            </div>
            <p className="rule-management-subtitle">
              {isPogViewOnly ? 'View centralized planogram rules for your district (read-only)' : 'Create and manage centralized planogram rules'}
            </p>
            <div className="pi-header-meta">
              <span className="pi-meta-pill">
                <GppGoodOutlined sx={{ fontSize: 12 }} />
                {rules.length} Rules
              </span>
              <span className="pi-meta-pill pi-meta-pill--success">
                {rules.filter(r => r.status === 'Active').length} Active
              </span>
              {unmappedCount > 0 && (
                <span className="pi-meta-pill pi-meta-pill--warning">
                  {unmappedCount} Unmapped
                </span>
              )}
              {draftCount > 0 && (
                <span className="pi-meta-pill pi-meta-pill--neutral">
                  {draftCount} Drafts
                </span>
              )}
            </div>
          </div>
          {!isPogViewOnly && (
            <div className="pi-header-right">
              <Button variant="contained" color="primary" size="medium" className="pi-btn-primary" onClick={handleCreateNew} startIcon={<Add sx={{ fontSize: 15 }} />}>
                Create Rule
              </Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
      <Tabs
        tabNames={
          isPogViewOnly
            ? [{ value: 'library', label: 'Rule Library' }]
            : [
                { value: 'library', label: 'Rule Library' },
                { value: 'builder', label: isEditing ? 'Rule Builder — Editing' : 'Rule Builder' },
              ]
        }
        tabPanels={[
          <div className="rule-library">
          {(unmappedCount > 0 || draftCount > 0) && (
            <div className="rule-alerts">
              {unmappedCount > 0 && (
                <Alert
                  severity="warning"
                  title={`You have ${unmappedCount} unmapped rule${unmappedCount > 1 ? 's' : ''}`}
                  subtleBackground
                />
              )}
              {draftCount > 0 && (
                <Alert
                  severity="info"
                  title={`You have ${draftCount} draft rule${draftCount > 1 ? 's' : ''}`}
                  subtleBackground
                />
              )}
            </div>
          )}
          <div className="rule-filter-bar">
            <div className="rule-filter-bar-search">
              <Input
                leftIcon={<SearchOutlined sx={{ fontSize: 16 }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules..."
              />
            </div>
            <div className="rule-filter-bar-divider" />
            <RuleFilterSelect
              label="Rule Type"
              value={filters.ruleType}
              options={ruleTypeOptions.map(rt => ({ value: rt.value, label: rt.label }))}
              onChange={(value) => handleFilterChange('ruleType', value)}
            />
            <RuleFilterSelect
              label="Mapping"
              value={filters.mappingStatus}
              options={[
                { value: 'Mapped', label: 'Mapped' },
                { value: 'Unmapped', label: 'Unmapped' },
              ]}
              onChange={(value) => handleFilterChange('mappingStatus', value)}
            />
            <RuleFilterSelect
              label="Status"
              value={filters.ruleStatus}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Draft', label: 'Draft' },
              ]}
              onChange={(value) => handleFilterChange('ruleStatus', value)}
            />
            {hasActiveFilters && (
              <Button variant="text" color="primary" size="small" className="rule-filter-clear-btn" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="premium-table-container">
            <table className="premium-table wow-table">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Rule Name</th>
                  <th>Rule Types</th>
                  <th>Categories</th>
                  <th>Clusters</th>
                  <th>Fixtures</th>
                  <th>Mapping</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th>{isPogViewOnly ? 'Details' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={10}>
                      <EmptyState
                        heading="No rules found"
                        description={isPogViewOnly ? 'No rules match your filters. Try adjusting search or filters.' : 'Create a new rule or adjust your filters.'}
                        emptyStateIcon={<DescriptionOutlined sx={{ fontSize: 40 }} />}
                        {...(!isPogViewOnly
                          ? { primaryButtonLabel: 'Create Rule', onPrimaryButtonClick: handleCreateNew }
                          : {})}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRules.map(rule => {
                    const mapped = isMapped(rule);
                    const isDraft = rule.status === 'Draft';
                    return (
                      <tr key={rule.id} className={`${!mapped && !isDraft ? 'unmapped-row' : ''} ${isDraft ? 'draft-row' : ''} ${newRuleHighlight === rule.id ? 'new-rule-highlight' : ''}`}>
                        <td>
                          <button className="rule-id-link" onClick={() => handleViewRule(rule)}>
                            {rule.id}
                          </button>
                        </td>
                        <td>
                          <div className="rule-name-cell">
                            <span className="rule-name-text">{rule.name}</span>
                            {isDraft && (
                              <span className="draft-progress">
                                <RadioButtonUnchecked sx={{ fontSize: 8 }} />
                                {rule.completedSteps.length}/4
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="rule-types-cell">
                            {rule.types.slice(0, 2).map(t => (
                              <span key={t} className={`rule-type-badge ${getTypeBadgeClass(t)}`}>
                                {t === 'Dimensional' ? 'Product Fit' : t}
                              </span>
                            ))}
                            {rule.types.length > 2 && (
                              <span className="more-badge">+{rule.types.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td>{renderMappingBadges(rule.mapping.categories)}</td>
                        <td>{renderMappingBadges(rule.mapping.clusters)}</td>
                        <td>{renderMappingBadges(rule.mapping.fixtures)}</td>
                        <td>
                          {isDraft ? (
                            <span className="mapping-badge draft"><DescriptionOutlined sx={{ fontSize: 14 }} />Draft</span>
                          ) : mapped ? (
                            <span className="mapping-badge mapped"><CheckCircleOutlined sx={{ fontSize: 14 }} />Mapped</span>
                          ) : (
                            <span className="mapping-badge unmapped"><WarningAmberOutlined sx={{ fontSize: 14 }} />Unmapped</span>
                          )}
                        </td>
                        <td><span className="date-cell">{rule.lastUpdated}</span></td>
                        <td>
                          <Badge
                            label={rule.status}
                            color={rule.status === 'Active' ? 'success' : rule.status === 'Draft' ? 'warning' : 'default'}
                            size="small"
                            variant="subtle"
                          />
                        </td>
                        <td>
                          {isPogViewOnly ? (
                            <button type="button" className="rule-id-link" onClick={() => handleViewRule(rule)}>
                              View details
                            </button>
                          ) : (
                            <div className="action-buttons">
                              <button className="action-btn edit" onClick={() => handleEditRule(rule)} title="Edit">
                                <EditOutlined sx={{ fontSize: 16 }} />
                              </button>
                              <button className="action-btn delete" onClick={() => handleDeleteClick(rule)} title="Delete">
                                <DeleteOutlined sx={{ fontSize: 16 }} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="table-pagination">
            <div className="pagination-info">
              {filteredRules.length === 0 ? 'No rules' : <>Showing <strong>{startRow}–{endRow}</strong> of <strong>{filteredRules.length}</strong> rules</>}
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={safePage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <KeyboardArrowLeft sx={{ fontSize: 16 }} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '…' ? <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
                  : <button key={p} className={`pagination-page${p === safePage ? ' active' : ''}`} onClick={() => setCurrentPage(p as number)}>{p}</button>
                )}
              <button className="pagination-btn" disabled={safePage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                <KeyboardArrowRight sx={{ fontSize: 16 }} />
              </button>
            </div>
            <div className="pagination-per-page">
              <span>Rows per page:</span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>,
          ...(!isPogViewOnly
            ? [
          <div key="rule-builder" className="rule-builder-wizard">
          <Stepper
            steps={wizardSteps.map((s): StepperStep => ({ label: s.title, description: s.description }))}
            activeStep={currentStep - 1}
            handleStep={(i) => { if (canProceedToStep(i + 1)) setCurrentStep(i + 1); }}
            variant="default"
          />
          <div className="wizard-content">{isEditing && builderForm.status === 'Draft' && <div className="wizard-draft-banner"><DescriptionOutlined sx={{ fontSize: 18 }} /><span>Continuing draft rule</span></div>}{renderWizardContent()}</div>
          <div className="wizard-actions">
            <div className="wizard-actions-left">
              {currentStep > 1 && (
                <Button variant="outlined" color="primary" className="wizard-btn secondary" onClick={handlePrevStep} startIcon={<KeyboardArrowLeft sx={{ fontSize: 18 }} />}>
                  Previous
                </Button>
              )}
            </div>
            <div className="wizard-actions-right">
              <Button variant="outlined" color="primary" className="wizard-btn outline" onClick={() => { setActiveTab('library'); resetBuilder(); }}>
                Cancel
              </Button>
              <Button variant="outlined" color="primary" className="wizard-btn secondary" onClick={handleSaveDraft} startIcon={<SaveOutlined sx={{ fontSize: 18 }} />}>
                Save Draft
              </Button>
              {currentStep < 4 ? (
                <Button variant="contained" color="primary" className="wizard-btn primary" onClick={handleNextStep} disabled={!isStepComplete(currentStep)} endIcon={<KeyboardArrowRight sx={{ fontSize: 18 }} />}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  className="wizard-btn primary"
                  onClick={handleSaveRule}
                  disabled={!builderForm.name || !builderForm.types?.length}
                  startIcon={<CheckCircleOutlined sx={{ fontSize: 18 }} />}
                >
                  {isEditing ? 'Update' : 'Create'} Rule
                </Button>
              )}
            </div>
          </div>
        </div>,
              ]
            : []),
        ]}
        value={activeTab}
        onChange={(_, val) => {
          if (isPogViewOnly) return;
          if (val === 'library') { setActiveTab('library'); resetBuilder(); }
          else setActiveTab(val as 'library' | 'builder');
        }}
      />
      </div>

      <Modal
        open={!!selectedRule}
        title={selectedRule ? (
          <div className="rule-detail-title-section">
            <div className="rule-detail-icon">
              {ruleTypeIcons[selectedRule.types[0]] || <LayersOutlined sx={{ fontSize: 24 }} />}
            </div>
            <div>
              <span>{selectedRule.name}</span>
              <span className="rule-detail-id" style={{ display: 'block', fontSize: 'var(--ia-text-xs)', color: 'var(--ia-color-text-secondary)' }}>{selectedRule.id}</span>
            </div>
          </div>
        ) : ''}
        onClose={() => setSelectedRule(null)}
        primaryButtonLabel={isPogViewOnly ? undefined : 'Edit Rule'}
        onPrimaryButtonClick={isPogViewOnly ? undefined : () => { if (selectedRule) { setSelectedRule(null); handleEditRule(selectedRule); } }}
        secondaryButtonLabel="Close"
        onSecondaryButtonClick={() => setSelectedRule(null)}
        size="large"
      >
        {selectedRule && (
          <>
            <div className="rule-detail-status-bar">
              <div className="status-item">
                <span className="status-label">Status</span>
                <Badge label={selectedRule.status} color={selectedRule.status === 'Active' ? 'success' : selectedRule.status === 'Draft' ? 'warning' : 'default'} size="small" variant="subtle" />
              </div>
              <div className="status-item">
                <span className="status-label">Mapping</span>
                {isMapped(selectedRule) ? (
                  <span className="mapping-status mapped"><CheckCircleOutlined sx={{ fontSize: 14 }} />Mapped</span>
                ) : (
                  <span className="mapping-status unmapped"><WarningAmberOutlined sx={{ fontSize: 14 }} />Unmapped</span>
                )}
              </div>
              <div className="status-item">
                <span className="status-label">Last Updated</span>
                <span className="status-value">{selectedRule.lastUpdated}</span>
              </div>
            </div>

            <div className="rule-detail-content">
              {selectedRule.description && (
                <div className="rule-detail-section">
                  <h4>Description</h4>
                  <p className="rule-description-text">{selectedRule.description}</p>
                </div>
              )}

              <div className="rule-detail-section">
                <h4>Rule Types</h4>
                <div className="rule-types-display">
                  {selectedRule.types.map(t => (
                    <div key={t} className="rule-type-card-mini">
                      <span className="rule-type-icon-mini">{ruleTypeIcons[t]}</span>
                      <span className="rule-type-name">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rule-detail-section">
                <h4>Scope & Mapping</h4>
                <div className="mapping-cards-grid">
                  <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
                    <div className="mapping-card-header"><LabelOutlined sx={{ fontSize: 16 }} /><span>Categories</span></div>
                    <div className="mapping-card-content">
                      {selectedRule.mapping.categories.length > 0 ? (
                        <div className="mapping-tags">{selectedRule.mapping.categories.map(c => <span key={c} className="mapping-tag">{c}</span>)}</div>
                      ) : <span className="no-mapping">No categories mapped</span>}
                    </div>
                  </Card>
                  <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
                    <div className="mapping-card-header"><ApartmentOutlined sx={{ fontSize: 16 }} /><span>Clusters</span></div>
                    <div className="mapping-card-content">
                      {selectedRule.mapping.clusters.length > 0 ? (
                        <div className="mapping-tags">{selectedRule.mapping.clusters.map(c => <span key={c} className="mapping-tag">{c}</span>)}</div>
                      ) : <span className="no-mapping">No clusters mapped</span>}
                    </div>
                  </Card>
                  <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
                    <div className="mapping-card-header"><Inventory2Outlined sx={{ fontSize: 16 }} /><span>Fixtures</span></div>
                    <div className="mapping-card-content">
                      {selectedRule.mapping.fixtures.length > 0 ? (
                        <div className="mapping-tags">{selectedRule.mapping.fixtures.map(f => <span key={f} className="mapping-tag">{f}</span>)}</div>
                      ) : <span className="no-mapping">No fixtures mapped</span>}
                    </div>
                  </Card>
                </div>
              </div>

              <div className="rule-detail-section">
                <h4>Rule Configuration</h4>
                <div className="rule-config-preview">
                  {Object.keys(selectedRule.definition).length > 0 ? (
                    Object.entries(selectedRule.definition).map(([ruleType, config]) => (
                      <div key={ruleType} className="config-block">
                        <div className="config-block-header">{ruleType}</div>
                        <div className="config-block-content">
                          {typeof config === 'object' && config !== null ? (
                            Object.entries(config as Record<string, unknown>).map(([key, value]) => (
                              <div key={key} className="config-row">
                                <span className="config-key">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="config-value">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                              </div>
                            ))
                          ) : <span className="config-value">{String(config)}</span>}
                        </div>
                      </div>
                    ))
                  ) : <div className="no-config">No configuration defined yet</div>}
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={showDeleteModal && !!ruleToDelete}
        title="Delete Rule"
        onClose={() => { setShowDeleteModal(false); setRuleToDelete(null); }}
        primaryButtonLabel="Delete"
        onPrimaryButtonClick={confirmDelete}
        secondaryButtonLabel="Cancel"
        onSecondaryButtonClick={() => { setShowDeleteModal(false); setRuleToDelete(null); }}
        size="small"
      >
        <div className="rule-modal-content">
          <p>Are you sure you want to delete this rule?</p>
          <p className="delete-rule-name">"{ruleToDelete?.name}"</p>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};

export default POGRuleManagement;

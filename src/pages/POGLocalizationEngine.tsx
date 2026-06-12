import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import NorthEast from '@mui/icons-material/NorthEast';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import RotateRight from '@mui/icons-material/RotateRight';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import IosShareOutlined from '@mui/icons-material/IosShareOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import RotateLeftOutlined from '@mui/icons-material/RotateLeftOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { Button, Card, Chips, Tabs, Modal, EmptyState, Stepper, StepperStep, Badge, Tooltip, Loader, Alert, TextArea } from 'impact-ui';
import { useExecutionTasks, ExecutionTask } from '../context/ExecutionTasksContext';
import './POGLocalizationEngine.css';

// Import corporate POG images
import WomensWallStandard from '../assets/C&A_WOMENS_WALL_STANDARD.png';
import MensDenimWall from '../assets/C&A_MENS_DENIM_WALL.png';
import KidsColorBlockWall from '../assets/C&A_KIDS_COLOR_BLOCK_WALL.png';
import AccessoriesEndcap from '../assets/C&A_ACCESSORIES_ENDCAP.png';
import SeasonalPromoTable from '../assets/C&A_SEASONAL_PROMO_TABLE.png';

// Import localized POG images
import LocalizedWomensWall from '../assets/localized_C&A_WOMENS_WALL_STANDARD.png';
import LocalizedMensDenim from '../assets/localized_C&A_MENS_DENIM_WALL.png';
import LocalizedKidsColorBlock from '../assets/localized_C&A_KIDS_COLOR_BLOCK_WALL.png';
import LocalizedAccessoriesEndcap from '../assets/localized_C&A_ACCESSORIES_ENDCAP.png';
import LocalizedSeasonalPromo from '../assets/localized_C&A_SEASONAL_PROMO_TABLE.png';

// Types
type WorkflowStep = 'category' | 'corporate' | 'storeGroup' | 'engine';
type EngineStage = 'geometry' | 'demand' | 'policy' | 'execution';
type StageStatus = 'pending' | 'running' | 'completed';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  pogCount: number;
}

interface CorporatePOG {
  id: string;
  name: string;
  version: string;
  sectionSize: string;
  shelfCount: number;
  image: string;
  insights: string[];
  categoryId: string;
  rules: { name: string; type: string; status: 'Active' | 'Warning'; description?: string }[];
}

interface StoreGroup {
  id: string;
  name: string;
  description: string;
  storeCount: number;
  tags: string[];
  assortment: {
    totalSKUs: number;
    premium: number;
    core: number;
    value: number;
    newItems: number;
  };
}

interface EngineStageData {
  id: EngineStage;
  name: string;
  icon: React.ReactNode;
  status: StageStatus;
  reasoning: string;
  details?: string[];
}

interface LocalizationResult {
  id: string;
  cluster: string;
  version: string;
  status: 'Ready' | 'Published';
  confidenceScore: number;
  corporatePOG: string;
  corporatePOGId: string;
  storeGroup: string;
  category: string;
  createdAt: string;
  changes: {
    facingsAdjusted: number;
    premiumShift: string;
    valuePLShift: string;
    tasksGenerated: number;
  };
  whyChanged: { title: string; reason: string }[];
  agenticSummary: string[];
  diffHighlights: string[];
}

// Mock Data
const categories: Category[] = [
  { id: 'apparel', name: 'Apparel', icon: <GroupOutlined sx={{ fontSize: 24 }} />, pogCount: 3 },
  { id: 'accessories', name: 'Accessories', icon: <InventoryOutlined sx={{ fontSize: 24 }} />, pogCount: 1 },
  { id: 'seasonal', name: 'Seasonal', icon: <HomeOutlined sx={{ fontSize: 24 }} />, pogCount: 1 },
];

// Mapping of corporate POG images to their localized versions
const localizedImageMap: Record<string, string> = {
  [WomensWallStandard]: LocalizedWomensWall,
  [MensDenimWall]: LocalizedMensDenim,
  [KidsColorBlockWall]: LocalizedKidsColorBlock,
  [AccessoriesEndcap]: LocalizedAccessoriesEndcap,
  [SeasonalPromoTable]: LocalizedSeasonalPromo,
};

const allCorporatePOGs: CorporatePOG[] = [
  {
    id: 'app-corp-001',
    name: "Women's Wall Display - Standard",
    version: 'v2.1',
    sectionSize: '12ft',
    shelfCount: 5,
    image: WomensWallStandard,
    insights: ['Premium placement at eye level', 'Color-coordinated sections', 'Seasonal highlights featured'],
    categoryId: 'apparel',
    rules: [
      { name: 'Product Fit & Placement', type: 'Product Fit & Placement', status: 'Active', description: 'Place folded items on shelves, hanging items on rails, and accessories on display hooks.' },
      { name: 'Facing Rules', type: 'Facing', status: 'Active', description: 'Ensure all garments face the same direction with labels visible.' },
      { name: 'Size Sequencing', type: 'Priority', status: 'Active', description: 'Arrange sizes from small to large, left to right on each rail or shelf.' },
      { name: 'Color Blocking', type: 'Visual', status: 'Active', description: 'Group items by color family for visual appeal and easy navigation.' },
      { name: 'Capacity Rules', type: 'Capacity / Fit', status: 'Active', description: 'Do not overcrowd rails. Maintain spacing between hangers for easy browsing.' },
      { name: 'Price Tier Rules', type: 'Price Tier', status: 'Active', description: 'Place premium items at eye level and value items on lower shelves.' },
      { name: 'Seasonal Rotation', type: 'Compliance', status: 'Active', description: 'Feature current season items prominently and phase out previous season stock.' },
      { name: 'Mannequin Styling', type: 'Visual', status: 'Active', description: 'Style mannequins with complete outfits from the current collection.' },
    ],
  },
  {
    id: 'app-corp-002',
    name: "Men's Denim Wall Display",
    version: 'v1.5',
    sectionSize: '10ft',
    shelfCount: 6,
    image: MensDenimWall,
    insights: ['Fit-focused organization', 'Wash gradients displayed', 'Size availability highlighted'],
    categoryId: 'apparel',
    rules: [
      { name: 'Product Fit & Placement', type: 'Product Fit & Placement', status: 'Active', description: 'Stack folded denim by fit type with clear signage for each style.' },
      { name: 'Facing Rules', type: 'Facing', status: 'Active', description: 'Fold denim consistently with waistband visible and size tags accessible.' },
      { name: 'Fit Grouping', type: 'Brand Blocking', status: 'Active', description: 'Group by fit (slim, regular, relaxed) in distinct sections.' },
      { name: 'Wash Sequencing', type: 'Adjacency', status: 'Active', description: 'Arrange washes from light to dark within each fit section.' },
      { name: 'Size Availability', type: 'Price Tier', status: 'Active', description: 'Ensure full size range is visible and accessible for each style.' },
      { name: 'Visual Balance', type: 'Visual', status: 'Active', description: 'Maintain even stack heights and consistent folding across the display.' },
      { name: 'Stock Depth', type: 'Compliance', status: 'Active', description: 'Keep backup stock organized and easily accessible for replenishment.' },
    ],
  },
  {
    id: 'app-corp-003',
    name: 'Kids Color Block Wall',
    version: 'v3.0',
    sectionSize: '8ft',
    shelfCount: 4,
    image: KidsColorBlockWall,
    insights: ['Bright color groupings', 'Age-appropriate heights', 'Character merchandise featured'],
    categoryId: 'apparel',
    rules: [
      { name: 'Age Grouping', type: 'Priority', status: 'Active', description: 'Organize by age group with toddler items at lower heights and older kids items higher.' },
      { name: 'Color Blocking', type: 'Facing', status: 'Active', description: 'Create vibrant color blocks to attract attention and aid navigation.' },
      { name: 'Character Placement', type: 'Space Allocation', status: 'Active', description: 'Feature licensed character items at eye level for target age groups.' },
      { name: 'Size Organization', type: 'Performance', status: 'Active', description: 'Arrange sizes logically within each color or character section.' },
      { name: 'Safety Compliance', type: 'Capacity / Fit', status: 'Active', description: 'Ensure displays are stable and items are within safe reach for children.' },
      { name: 'Parent Accessibility', type: 'Visual', status: 'Active', description: 'Place size and price information at adult eye level for easy reference.' },
      { name: 'Play Zone Integration', type: 'Visual', status: 'Active', description: 'Create engaging displays that encourage interaction while maintaining organization.' },
    ],
  },
  {
    id: 'acc-corp-001',
    name: 'Accessories End Cap',
    version: 'v1.3',
    sectionSize: '4ft',
    shelfCount: 4,
    image: AccessoriesEndcap,
    insights: ['Impulse purchase focus', 'Gift-ready presentation', 'Trend items highlighted'],
    categoryId: 'accessories',
    rules: [
      { name: 'Product Fit & Placement', type: 'Product Fit & Placement', status: 'Active', description: 'Place small accessories on hooks, medium items on shelves, and bags on display stands.' },
      { name: 'Category Grouping', type: 'Pack Behavior', status: 'Active', description: 'Group by type: bags, belts, scarves, jewelry in distinct sections.' },
      { name: 'Adjacency Rules', type: 'Adjacency', status: 'Active', description: 'Place complementary items together for outfit completion suggestions.' },
      { name: 'Trend Highlighting', type: 'Assortment', status: 'Active', description: 'Feature current trend items at eye level with clear trend signage.' },
      { name: 'Gift Presentation', type: 'Visual', status: 'Active', description: 'Display gift-ready items with packaging visible and price tags accessible.' },
      { name: 'Security Compliance', type: 'Visual', status: 'Active', description: 'Ensure high-value items have appropriate security measures in place.' },
      { name: 'Impulse Optimization', type: 'Compliance', status: 'Active', description: 'Position grab-and-go items at checkout-adjacent locations.' },
    ],
  },
  {
    id: 'sea-corp-001',
    name: 'Seasonal Promo Table',
    version: 'v2.0',
    sectionSize: '6ft',
    shelfCount: 3,
    image: SeasonalPromoTable,
    insights: ['High-impact promotional display', 'Limited-time offers featured', 'Cross-category bundling'],
    categoryId: 'seasonal',
    rules: [
      { name: 'Promotional Focus', type: 'Product Fit & Placement', status: 'Active', description: 'Feature current promotional items prominently with clear pricing and offer details.' },
      { name: 'Theme Consistency', type: 'Adjacency', status: 'Active', description: 'Maintain consistent seasonal theme across all displayed items.' },
      { name: 'Bundle Display', type: 'Brand Blocking', status: 'Active', description: 'Create outfit or gift bundles to encourage multi-item purchases.' },
      { name: 'Price Communication', type: 'Price Tier', status: 'Active', description: 'Display original and promotional prices clearly with savings highlighted.' },
      { name: 'Stock Rotation', type: 'Visual', status: 'Active', description: 'Rotate stock regularly to maintain fresh appearance and full presentation.' },
      { name: 'Urgency Signage', type: 'Compliance', status: 'Active', description: 'Include limited-time messaging to drive immediate purchase decisions.' },
      { name: 'Traffic Flow', type: 'Visual', status: 'Active', description: 'Position table to maximize visibility and encourage customer engagement.' },
    ],
  },
];

const storeGroups: StoreGroup[] = [
  { 
    id: 'urban', 
    name: 'Urban Flagship', 
    description: 'High-traffic city centers. Fashion-forward shoppers. Premium focus.', 
    storeCount: 124, 
    tags: ['Trend-driven', 'Premium', 'High footfall', 'Fashion-forward'],
    assortment: { totalSKUs: 186, premium: 65, core: 82, value: 28, newItems: 11 }
  },
  { 
    id: 'family', 
    name: 'Family Center', 
    description: 'Suburban locations. Family shopping trips. Full size range priority.', 
    storeCount: 312, 
    tags: ['Family-focused', 'Size-inclusive', 'Value-conscious', 'Multi-category'],
    assortment: { totalSKUs: 224, premium: 42, core: 115, value: 52, newItems: 15 }
  },
  { 
    id: 'outlet', 
    name: 'Outlet Value', 
    description: 'Value-driven shoppers. Clearance and deals focus. High volume.', 
    storeCount: 186, 
    tags: ['Value-first', 'Deal-seekers', 'High volume', 'Clearance'],
    assortment: { totalSKUs: 142, premium: 18, core: 72, value: 48, newItems: 4 }
  },
  { 
    id: 'mall', 
    name: 'Mall Anchor', 
    description: 'Shopping mall locations. Impulse and planned purchases. Trend-sensitive.', 
    storeCount: 98, 
    tags: ['Impulse', 'Trend-sensitive', 'Accessory-heavy', 'Gift-ready'],
    assortment: { totalSKUs: 168, premium: 48, core: 86, value: 24, newItems: 10 }
  },
];

// POG to Store Group mapping - which clusters each POG is mapped to
const pogClusterMapping: Record<string, string[]> = {
  'app-corp-001': ['urban', 'family', 'mall'],               // Women's Wall - 3 clusters
  'app-corp-002': ['urban', 'family', 'outlet'],             // Men's Denim - 3 clusters
  'app-corp-003': ['family', 'mall', 'outlet'],              // Kids Color Block - 3 clusters
  'acc-corp-001': ['urban', 'mall'],                         // Accessories End Cap - 2 clusters
  'sea-corp-001': ['urban', 'family', 'mall', 'outlet'],     // Seasonal Promo - 4 clusters
};

// Category Demand Index data per category and cluster
interface DemandIndexItem {
  name: string;
  value: number;
}

const categoryDemandIndex: Record<string, Record<string, DemandIndexItem[]>> = {
  apparel: {
    urban: [
      { name: 'Dresses', value: 145 },
      { name: 'Tops', value: 135 },
      { name: 'Denim', value: 125 },
      { name: 'Outerwear', value: 115 },
      { name: 'Basics', value: 95 },
      { name: 'Activewear', value: 85 },
    ],
    family: [
      { name: 'Kids', value: 140 },
      { name: 'Basics', value: 130 },
      { name: 'Denim', value: 120 },
      { name: 'Tops', value: 110 },
      { name: 'Outerwear', value: 100 },
      { name: 'Dresses', value: 85 },
    ],
    outlet: [
      { name: 'Basics', value: 145 },
      { name: 'Denim', value: 130 },
      { name: 'Kids', value: 115 },
      { name: 'Tops', value: 100 },
      { name: 'Outerwear', value: 80 },
      { name: 'Dresses', value: 65 },
    ],
    mall: [
      { name: 'Dresses', value: 150 },
      { name: 'Tops', value: 140 },
      { name: 'Accessories', value: 130 },
      { name: 'Denim', value: 110 },
      { name: 'Outerwear', value: 95 },
      { name: 'Basics', value: 75 },
    ],
  },
  accessories: {
    urban: [
      { name: 'Bags', value: 140 },
      { name: 'Jewelry', value: 130 },
      { name: 'Scarves', value: 115 },
      { name: 'Belts', value: 100 },
      { name: 'Hats', value: 85 },
    ],
    family: [
      { name: 'Bags', value: 125 },
      { name: 'Belts', value: 115 },
      { name: 'Hats', value: 105 },
      { name: 'Scarves', value: 95 },
      { name: 'Jewelry', value: 80 },
    ],
    outlet: [
      { name: 'Bags', value: 135 },
      { name: 'Belts', value: 120 },
      { name: 'Hats', value: 100 },
      { name: 'Scarves', value: 85 },
      { name: 'Jewelry', value: 70 },
    ],
    mall: [
      { name: 'Jewelry', value: 145 },
      { name: 'Bags', value: 135 },
      { name: 'Scarves', value: 120 },
      { name: 'Belts', value: 100 },
      { name: 'Hats', value: 90 },
    ],
  },
  seasonal: {
    urban: [
      { name: 'New Arrivals', value: 150 },
      { name: 'Limited Edition', value: 140 },
      { name: 'Collaborations', value: 125 },
      { name: 'Sale Items', value: 90 },
    ],
    family: [
      { name: 'Sale Items', value: 145 },
      { name: 'New Arrivals', value: 120 },
      { name: 'Bundles', value: 115 },
      { name: 'Limited Edition', value: 85 },
    ],
    outlet: [
      { name: 'Sale Items', value: 160 },
      { name: 'Clearance', value: 145 },
      { name: 'Bundles', value: 120 },
      { name: 'New Arrivals', value: 75 },
    ],
    mall: [
      { name: 'New Arrivals', value: 145 },
      { name: 'Limited Edition', value: 135 },
      { name: 'Gift Sets', value: 125 },
      { name: 'Sale Items', value: 100 },
    ],
  },
};

// Helper to get demand index color
const getDemandIndexColor = (value: number): string => {
  if (value >= 120) return 'high';
  if (value >= 80) return 'neutral';
  return 'low';
};

// Helper to generate implication from demand index
const generateDemandImplication = (indexData: DemandIndexItem[]): string => {
  if (!indexData || indexData.length === 0) return '';
  const sorted = [...indexData].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, 2).map(i => i.name.toLowerCase());
  const low = sorted.slice(-2).map(i => i.name.toLowerCase());
  return `Shift assortment toward ${top.join(' and ')}; reduce emphasis on ${low.join(' and ')}.`;
};

export const POGLocalizationEngine: React.FC = () => {
  const navigate = useNavigate();
  const { addTasks } = useExecutionTasks();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'run' | 'results'>('run');
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPOG, setSelectedPOG] = useState<CorporatePOG | null>(null);
  const [selectedStoreGroup, setSelectedStoreGroup] = useState<string | null>(null);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [engineStages, setEngineStages] = useState<EngineStageData[]>([
    { id: 'geometry', name: 'Geometry & Localization', icon: <LayersOutlined sx={{ fontSize: 20 }} />, status: 'pending', reasoning: '' },
    { id: 'demand', name: 'Demand Rebalancing', icon: <BarChartOutlined sx={{ fontSize: 20 }} />, status: 'pending', reasoning: '' },
    { id: 'policy', name: 'Policy Validation', icon: <GppGoodOutlined sx={{ fontSize: 20 }} />, status: 'pending', reasoning: '' },
    { id: 'execution', name: 'Execution Packaging', icon: <InventoryOutlined sx={{ fontSize: 20 }} />, status: 'pending', reasoning: '' },
  ]);
  const [localizationResult, setLocalizationResult] = useState<LocalizationResult | null>(null);
  const [publishedResults, setPublishedResults] = useState<LocalizationResult[]>([]);
  const [showCorporateView, setShowCorporateView] = useState(false);
  const [expandedReasons, setExpandedReasons] = useState<string[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsFilter, setResultsFilter] = useState<'all' | 'Ready' | 'Published'>('all');
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPublishModal, setShowPublishModal] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState<string | null>(null);

  const workflowSteps = [
    { id: 'category' as WorkflowStep, label: 'Category', number: 1 },
    { id: 'corporate' as WorkflowStep, label: 'Corporate Standard', number: 2 },
    { id: 'storeGroup' as WorkflowStep, label: 'Store Group', number: 3 },
    { id: 'engine' as WorkflowStep, label: 'Localization Engine', number: 4 },
  ];

  const categoryPOGs = allCorporatePOGs.filter(p => p.categoryId === selectedCategory);

  const getStepStatus = (stepId: WorkflowStep): 'completed' | 'current' | 'locked' => {
    const stepOrder: WorkflowStep[] = ['category', 'corporate', 'storeGroup', 'engine'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'locked';
  };

  const transitionToStep = async (nextStep: WorkflowStep) => {
    setIsStepLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    setIsStepLoading(false);
    setCurrentStep(nextStep);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedPOG(null);
    transitionToStep('corporate');
  };

  const handlePOGSelect = (pog: CorporatePOG) => {
    setSelectedPOG(pog);
  };


  const runLocalizationEngine = async () => {
    setIsEngineRunning(true);
    
    // Get context for business-specific changes
    const storeGroup = storeGroups.find(g => g.id === selectedStoreGroup);
    const demandData = categoryDemandIndex[selectedCategory!]?.[selectedStoreGroup!] || [];
    const topDemand = [...demandData].sort((a, b) => b.value - a.value)[0];
    const lowDemand = [...demandData].sort((a, b) => a.value - b.value)[0];
    
    // Generate business-specific stage data based on context
    const stageReasonings = selectedCategory === 'apparel' ? {
      geometry: {
        reasoning: `Configured ${selectedPOG?.sectionSize} wall display for ${storeGroup?.name} store format`,
        details: [
          `Adjusted rail heights to ${storeGroup?.id === 'urban' ? '5 levels' : '4 levels'} for ${storeGroup?.id === 'urban' ? 'premium browsing' : 'family accessibility'}`,
          `Set ${selectedPOG?.shelfCount} folding shelf zones for ${storeGroup?.id === 'urban' ? 'curated presentation' : 'size-run visibility'}`,
          `Configured hanging rail spacing for ${storeGroup?.id === 'outlet' ? 'high-density display' : 'easy browsing'}`
        ],
      },
      demand: {
        reasoning: `Increased ${topDemand?.name || 'Dresses'} facings by ${Math.round((topDemand?.value || 120) - 100)}% based on ${storeGroup?.name} velocity`,
        details: [
          `${topDemand?.name || 'Dresses'} expanded to ${Math.round((topDemand?.value || 120) / 10)} facings (demand index: ${topDemand?.value || 120})`,
          `${storeGroup?.id === 'urban' ? 'Trend items' : 'Basics'} moved to eye-level rail`,
          `${lowDemand?.name || 'Outerwear'} reduced by ${Math.round(100 - (lowDemand?.value || 85))}% to reallocate space`
        ],
      },
      policy: {
        reasoning: `Validated against ${selectedPOG?.rules.length || 5} category merchandising rules`,
        details: [
          `Size sequencing: ${storeGroup?.id === 'family' ? 'Full size range XS-XXL displayed' : 'Core sizes S-XL prioritized'}`,
          `Color blocking: ${storeGroup?.id === 'urban' ? 'Trend colors grouped at front' : 'Neutral basics at eye level'}`,
          `Capacity rule: All rails meet ${storeGroup?.id === 'outlet' ? '80%' : '70%'} max density`
        ],
      },
      execution: {
        reasoning: `Generated ${Math.round((storeGroup?.storeCount || 50) * 0.4)} store-level execution tasks`,
        details: [
          `${Math.round((storeGroup?.storeCount || 50) * 0.25)} size label updates required`,
          `${Math.round((storeGroup?.storeCount || 50) * 0.1)} garment relocations across rails`,
          `${Math.round((storeGroup?.storeCount || 50) * 0.05)} mannequin styling updates`
        ],
      },
    } : selectedCategory === 'accessories' ? {
      geometry: {
        reasoning: `Configured ${selectedPOG?.sectionSize} end cap for ${storeGroup?.name} impulse zones`,
        details: [
          `Set hook density for ${storeGroup?.id === 'urban' ? 'curated accessory display' : 'grab-and-go convenience'}`,
          `Configured shelf heights for ${storeGroup?.id === 'mall' ? 'gift presentation' : 'everyday essentials'}`,
          `Allocated ${storeGroup?.id === 'outlet' ? 'value bin' : 'premium display'} zones`
        ],
      },
      demand: {
        reasoning: `Prioritized ${topDemand?.name || 'Bags'} based on ${storeGroup?.name} accessory trends`,
        details: [
          `${topDemand?.name || 'Bags'} featured at ${storeGroup?.id === 'urban' ? 'eye-level hooks' : 'shelf displays'}`,
          `${storeGroup?.id === 'outlet' ? 'Value accessories' : 'Trend jewelry'} positioned for ${storeGroup?.id === 'outlet' ? 'deal seekers' : 'impulse purchase'}`,
          `${lowDemand?.name || 'Belts'} consolidated to ${storeGroup?.id === 'family' ? 'lower hooks' : 'side sections'}`
        ],
      },
      policy: {
        reasoning: `Validated accessory merchandising and security compliance`,
        details: [
          `Security tagging: High-value items over $25 tagged`,
          `Gift presentation: ${storeGroup?.id === 'mall' ? 'Gift-ready packaging visible' : 'Price tags accessible'}`,
          `Impulse placement: Checkout-adjacent items under $15`
        ],
      },
      execution: {
        reasoning: `Generated ${Math.round((storeGroup?.storeCount || 50) * 0.5)} accessory reset tasks`,
        details: [
          `${Math.round((storeGroup?.storeCount || 50) * 0.3)} hook reconfigurations`,
          `${Math.round((storeGroup?.storeCount || 50) * 0.15)} display refreshes`,
          `${Math.round((storeGroup?.storeCount || 50) * 0.05)} security tag updates`
        ],
      },
    } : {
      geometry: {
        reasoning: `Adapted ${selectedPOG?.sectionSize} promo table for ${storeGroup?.name} traffic patterns`,
        details: [
          `Configured ${storeGroup?.id === 'family' ? 'family browsing' : 'quick-shop'} table layout`,
          `Set feature display heights for ${storeGroup?.id === 'outlet' ? 'value stacks' : 'curated presentation'}`,
          `Allocated ${storeGroup?.id === 'urban' ? 'trend highlight' : 'clearance'} zones`
        ],
      },
      demand: {
        reasoning: `Prioritized ${topDemand?.name || 'New Arrivals'} based on ${storeGroup?.name} seasonal trends`,
        details: [
          `${topDemand?.name || 'New Arrivals'} featured at ${storeGroup?.id === 'urban' ? 'front-center position' : 'high-traffic zones'}`,
          `${storeGroup?.id === 'outlet' ? 'Clearance bundles' : 'Gift sets'} positioned for ${storeGroup?.id === 'outlet' ? 'deal seekers' : 'convenience'}`,
          `${lowDemand?.name || 'Last Season'} consolidated to ${storeGroup?.id === 'outlet' ? 'value bins' : 'back tables'}`
        ],
      },
      policy: {
        reasoning: `Validated seasonal merchandising and promotional compliance`,
        details: [
          `Price signage: ${storeGroup?.id === 'outlet' ? 'Original + sale price displayed' : 'Promotional pricing highlighted'}`,
          `Stock rotation: Current season items at front, clearance at back`,
          `Bundle compliance: Multi-buy offers clearly signed`
        ],
      },
      execution: {
        reasoning: `Generated ${Math.round((storeGroup?.storeCount || 50) * 0.5)} seasonal reset tasks`,
        details: [
          `${Math.round((storeGroup?.storeCount || 50) * 0.3)} table resets required`,
          `${Math.round((storeGroup?.storeCount || 50) * 0.15)} signage installations`,
          `${Math.round((storeGroup?.storeCount || 50) * 0.05)} promotional display builds`
        ],
      },
    };

    const stages: EngineStage[] = ['geometry', 'demand', 'policy', 'execution'];
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      
      setEngineStages(prev => prev.map(s => 
        s.id === stage ? { ...s, status: 'running' as StageStatus } : s
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      setEngineStages(prev => prev.map(s => 
        s.id === stage ? { 
          ...s, 
          status: 'completed' as StageStatus, 
          reasoning: stage === 'geometry' && customPrompt.trim()
            ? `User guidance applied · ${stageReasonings[stage].reasoning}`
            : stageReasonings[stage].reasoning,
          details: stage === 'geometry' && customPrompt.trim()
            ? [`📝 User guidance: ${customPrompt.trim().replace(/\n/g, ' ')}`, ...stageReasonings[stage].details]
            : stageReasonings[stage].details,
        } : s
      ));
    }

    // Calculate dynamic metrics based on context
    const facingsChanged = Math.round((topDemand?.value || 120) / 8);
    const tasksCount = Math.round((storeGroup?.storeCount || 50) * 0.4);
    const premiumShiftPct = storeGroup?.id === 'urban' ? '+18%' : storeGroup?.id === 'family' ? '+8%' : '+12%';
    const valueShiftPct = storeGroup?.id === 'outlet' ? '+5%' : '-8%';

    const result: LocalizationResult = {
      id: `loc-${Date.now()}`,
      cluster: storeGroup?.name || 'Unknown',
      version: 'v1.0',
      status: 'Ready',
      confidenceScore: Math.round(88 + Math.random() * 8),
      corporatePOG: selectedPOG?.name || '',
      corporatePOGId: selectedPOG?.id || '',
      storeGroup: storeGroup?.name || '',
      category: categories.find(c => c.id === selectedCategory)?.name || '',
      createdAt: new Date().toISOString().split('T')[0],
      changes: {
        facingsAdjusted: facingsChanged,
        premiumShift: premiumShiftPct,
        valuePLShift: valueShiftPct,
        tasksGenerated: tasksCount,
      },
      whyChanged: selectedCategory === 'apparel' ? [
        { 
          title: `${topDemand?.name || 'Dresses'} moved to eye-level rail`, 
          reason: `${storeGroup?.name} shoppers show ${Math.round((topDemand?.value || 120) - 100)}% higher demand index for ${topDemand?.name || 'Dresses'} vs. corporate average` 
        },
        { 
          title: `${lowDemand?.name || 'Outerwear'} allocation reduced`, 
          reason: `Lower velocity (index: ${lowDemand?.value || 85}) allows space reallocation to higher-margin ${storeGroup?.id === 'urban' ? 'trend items' : 'basics'}` 
        },
        { 
          title: `${storeGroup?.id === 'urban' ? 'Trend display' : 'Size-run'} zone expanded`, 
          reason: `${storeGroup?.name} shopping data shows ${storeGroup?.id === 'urban' ? '68% trend-driven' : '55% basics-focused'} purchase behavior` 
        },
        { 
          title: 'Color blocking optimized', 
          reason: `Visual merchandising rules applied to maximize ${storeGroup?.id === 'family' ? 'easy navigation' : 'trend discovery'}` 
        },
      ] : selectedCategory === 'accessories' ? [
        { 
          title: `${topDemand?.name || 'Bags'} featured at eye-level`, 
          reason: `${storeGroup?.name} accessory trends show ${Math.round((topDemand?.value || 115) - 100)}% lift in ${topDemand?.name || 'Bags'} category` 
        },
        { 
          title: 'Impulse zone prioritized', 
          reason: `${storeGroup?.id === 'mall' ? 'Gift-ready presentation' : 'Grab-and-go convenience'} drives ${storeGroup?.id === 'mall' ? '42%' : '35%'} of accessory purchases` 
        },
        { 
          title: `${lowDemand?.name || 'Belts'} consolidated`, 
          reason: `Lower demand index (${lowDemand?.value || 80}) allows consolidation to ${storeGroup?.id === 'outlet' ? 'value section' : 'lower hooks'}` 
        },
        { 
          title: 'Security compliance verified', 
          reason: 'All high-value items properly tagged and displayed per security guidelines' 
        },
      ] : [
        { 
          title: `${topDemand?.name || 'New Arrivals'} featured prominently`, 
          reason: `${storeGroup?.name} seasonal trends show ${Math.round((topDemand?.value || 115) - 100)}% lift in ${topDemand?.name || 'New Arrivals'} category` 
        },
        { 
          title: 'Promotional displays prioritized', 
          reason: `${storeGroup?.id === 'outlet' ? 'Clearance bundles' : 'Gift sets'} drive ${storeGroup?.id === 'outlet' ? '52%' : '38%'} of seasonal purchases` 
        },
        { 
          title: `${lowDemand?.name || 'Last Season'} consolidated`, 
          reason: `Lower demand index (${lowDemand?.value || 80}) allows consolidation to ${storeGroup?.id === 'outlet' ? 'value bins' : 'back tables'}` 
        },
        { 
          title: 'Seasonal compliance verified', 
          reason: 'All displays meet promotional signage and pricing requirements' 
        },
      ],
      agenticSummary: [
        `${selectedPOG?.rules.length || 5} policies validated`, 
        `${tasksCount} execution tasks ready`, 
        `${topDemand?.name || 'Top category'} optimized for ${storeGroup?.name}`
      ],
      diffHighlights: selectedCategory === 'apparel' ? [
        `${topDemand?.name || 'Dresses'} +${Math.round((topDemand?.value || 120) / 30)} facings`,
        `${lowDemand?.name || 'Outerwear'} -${Math.round((100 - (lowDemand?.value || 85)) / 10)} facings`,
        `${storeGroup?.id === 'urban' ? 'Trend items' : 'Basics'} to eye-level`,
        `${storeGroup?.id === 'outlet' ? 'Value range expanded' : 'Premium tier prioritized'}`
      ] : selectedCategory === 'accessories' ? [
        `${topDemand?.name || 'Bags'} +${Math.round((topDemand?.value || 115) / 25)} hooks`,
        `${lowDemand?.name || 'Belts'} consolidated`,
        `Impulse zone ${storeGroup?.id === 'mall' ? 'expanded' : 'optimized'}`,
        `Gift presentation enhanced`
      ] : [
        `${topDemand?.name || 'New Arrivals'} +${Math.round((topDemand?.value || 115) / 25)} displays`,
        `${lowDemand?.name || 'Last Season'} consolidated`,
        `Promo section ${storeGroup?.id === 'outlet' ? 'expanded' : 'optimized'}`,
        `Seasonal signage configured`
      ],
    };

    setLocalizationResult(result);
    setPublishedResults(prev => [result, ...prev]);
    setIsEngineRunning(false);
  };

  const toggleReasonExpand = (title: string) => {
    setExpandedReasons(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handlePublish = (resultId: string) => {
    const result = publishedResults.find(r => r.id === resultId);
    if (!result) return;

    // Generate human-readable execution tasks based on the localization result
    const generatedTasks: ExecutionTask[] = [];
    const timestamp = new Date().toISOString();
    const storeGroup = storeGroups.find(g => g.name === result.storeGroup);
    // Task 1: Shelf Reset for high-demand subcategories
    generatedTasks.push({
      id: `task-${resultId}-1`,
      type: 'Reset Shelf',
      title: `Reset ${result.category} section for ${result.storeGroup} stores`,
      description: `Complete shelf reset required to implement localized planogram. Remove all products from shelves 1-${Math.min(5, storeGroup?.storeCount ? 4 : 3)}, clean fixtures, and restock according to new layout specifications.`,
      priority: 'High',
      reason: `Localization engine identified ${result.changes.facingsAdjusted} facing adjustments needed to optimize for ${result.storeGroup} shopper behavior`,
      impact: `Expected ${result.changes.premiumShift} improvement in premium tier visibility and sales conversion`,
      status: 'Pending',
      assignedTo: null,
      dueDate: null,
      storeName: `All ${result.storeGroup} stores`,
      storeGroup: result.storeGroup,
      pogName: result.corporatePOG,
      category: result.category,
      createdAt: timestamp,
      localizationId: resultId,
    });

    // Task 2: Move high-velocity items to eye-level
    const topChange = result.diffHighlights[0] || 'Premium items';
    generatedTasks.push({
      id: `task-${resultId}-2`,
      type: 'Move',
      title: `Relocate ${topChange.split(' ')[0]} products to eye-level shelf`,
      description: `Move ${topChange.split(' ')[0]} category products from current position to Shelf 2 (eye-level, 48-60 inches from floor). Ensure brand blocking is maintained and price tags are updated.`,
      fromPosition: 'Current shelf location',
      toPosition: 'Shelf 2 (Eye-level)',
      priority: 'High',
      reason: `${result.storeGroup} demand index shows ${topChange.includes('+') ? 'higher' : 'adjusted'} velocity for this subcategory`,
      impact: `Projected +12-18% sales lift from improved visibility and accessibility`,
      status: 'Pending',
      assignedTo: null,
      dueDate: null,
      storeName: `All ${result.storeGroup} stores`,
      storeGroup: result.storeGroup,
      pogName: result.corporatePOG,
      category: result.category,
      createdAt: timestamp,
      localizationId: resultId,
    });

    // Task 3: Adjust facings based on demand
    generatedTasks.push({
      id: `task-${resultId}-3`,
      type: 'Adjust Facing',
      title: `Adjust product facings across ${result.category} section`,
      description: `Increase facings for high-demand SKUs and reduce facings for slower-moving items. Total of ${result.changes.facingsAdjusted} facing changes required. Refer to localized planogram for specific SKU-level instructions.`,
      fromFacings: Math.round(result.changes.facingsAdjusted * 0.6),
      toFacings: result.changes.facingsAdjusted,
      priority: 'Medium',
      reason: `Demand rebalancing analysis identified space optimization opportunities for ${result.storeGroup} shopping patterns`,
      impact: `Reduces out-of-stock risk by 25% while improving space productivity`,
      status: 'Pending',
      assignedTo: null,
      dueDate: null,
      storeName: `All ${result.storeGroup} stores`,
      storeGroup: result.storeGroup,
      pogName: result.corporatePOG,
      category: result.category,
      createdAt: timestamp,
      localizationId: resultId,
    });

    // Task 4: Update shelf labels and price tags
    generatedTasks.push({
      id: `task-${resultId}-4`,
      type: 'Update Label',
      title: `Update shelf labels and price tags for relocated items`,
      description: `Print and install new shelf labels for all relocated products. Ensure UPC codes are visible, prices are current, and promotional tags are properly positioned. Remove outdated labels from previous locations.`,
      priority: 'Medium',
      reason: `Product relocations require updated shelf labeling for customer navigation and checkout accuracy`,
      impact: `Maintains pricing accuracy and reduces checkout errors by 15%`,
      status: 'Pending',
      assignedTo: null,
      dueDate: null,
      storeName: `All ${result.storeGroup} stores`,
      storeGroup: result.storeGroup,
      pogName: result.corporatePOG,
      category: result.category,
      createdAt: timestamp,
      localizationId: resultId,
    });

    // Task 5: Verify compliance with planogram
    generatedTasks.push({
      id: `task-${resultId}-5`,
      type: 'Add',
      title: `Verify planogram compliance and capture photo evidence`,
      description: `After completing all shelf changes, verify the section matches the localized planogram. Capture photos of each shelf and upload to the compliance system. Flag any discrepancies or missing products.`,
      priority: 'Low',
      reason: `Compliance verification ensures execution accuracy and enables performance tracking`,
      impact: `Enables ${result.confidenceScore}% confidence score validation and continuous improvement`,
      status: 'Pending',
      assignedTo: null,
      dueDate: null,
      storeName: `All ${result.storeGroup} stores`,
      storeGroup: result.storeGroup,
      pogName: result.corporatePOG,
      category: result.category,
      createdAt: timestamp,
      localizationId: resultId,
    });

    // Add tasks to the shared context
    addTasks(generatedTasks);

    // Update the result status to Published
    setPublishedResults(prev => prev.map(r => 
      r.id === resultId ? { ...r, status: 'Published' as const } : r
    ));

    // Navigate to Store Execution Task List
    navigate('/command-center/operations-queue');
  };

  // Get unique values for filter dropdowns
  const uniqueClusters = [...new Set(publishedResults.map(r => r.cluster))];
  const uniqueCategories = [...new Set(publishedResults.map(r => r.category))];
  const uniqueDates = [...new Set(publishedResults.map(r => r.createdAt))].sort().reverse();

  const filteredResults = publishedResults.filter(r => {
    const matchesSearch = r.cluster.toLowerCase().includes(resultsSearch.toLowerCase()) ||
      r.corporatePOG.toLowerCase().includes(resultsSearch.toLowerCase()) ||
      r.category.toLowerCase().includes(resultsSearch.toLowerCase());
    const matchesStatus = resultsFilter === 'all' || r.status === resultsFilter;
    const matchesCluster = clusterFilter === 'all' || r.cluster === clusterFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesDate = dateFilter === 'all' || r.createdAt === dateFilter;
    return matchesSearch && matchesStatus && matchesCluster && matchesCategory && matchesDate;
  });

  const clearAllFilters = () => {
    setResultsSearch('');
    setResultsFilter('all');
    setClusterFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
  };

  const activeFilterCount = [
    clusterFilter !== 'all',
    categoryFilter !== 'all',
    dateFilter !== 'all',
  ].filter(Boolean).length;

  const getStepSummary = (stepId: WorkflowStep): string | null => {
    if (getStepStatus(stepId) !== 'completed') return null;
    if (stepId === 'category' && selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      return cat ? cat.name : null;
    }
    if (stepId === 'corporate' && selectedPOG) return selectedPOG.name;
    if (stepId === 'storeGroup' && selectedStoreGroup) {
      const sg = storeGroups.find(g => g.id === selectedStoreGroup);
      return sg ? sg.name : null;
    }
    return null;
  };

  const renderWorkflowProgress = () => {
    const stepOrder: WorkflowStep[] = ['category', 'corporate', 'storeGroup', 'engine'];
    const activeStepIndex = stepOrder.indexOf(currentStep);
    const locStepperSteps: StepperStep[] = workflowSteps.map(s => {
      const status = getStepStatus(s.id);
      const summary = getStepSummary(s.id);
      return {
        label: s.label,
        description: status === 'completed' && summary ? summary : undefined,
      };
    });
    return (
      <Stepper
        steps={locStepperSteps}
        activeStep={activeStepIndex}
        handleStep={(i) => {
          const targetStep = workflowSteps[i];
          if (getStepStatus(targetStep.id) === 'completed') setCurrentStep(targetStep.id);
        }}
        variant="default"
      />
    );
  };

  const renderCategoryStep = () => (
    <div className="loc-step-content">
      <h3 className="loc-step-title">Select Category</h3>
      <p className="loc-step-description">Choose a product category to begin the localization process.</p>
      <div className="loc-category-grid">
        {categories.map(cat => (
          <div 
            key={cat.id}
            className={`loc-category-card ${selectedCategory === cat.id ? 'selected' : ''}`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            <div className="loc-category-icon">{cat.icon}</div>
            <div className="loc-category-info">
              <h4>{cat.name}</h4>
              <span>{cat.pogCount} POGs available</span>
            </div>
            {selectedCategory === cat.id && <CheckCircleOutlined sx={{ fontSize: 20 }} className="loc-category-check" />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCorporateStep = () => {
    const pogs = categoryPOGs;
    return (
      <div className="loc-step-content">
        <h3 className="loc-step-title">Select Corporate Standard</h3>
        <p className="loc-step-description">Choose a planogram from this category to localize.</p>
        
        {/* POG Selection Grid */}
        <div className="loc-pog-selection-grid">
          {pogs.map(pog => (
            <div 
              key={pog.id}
              className={`loc-pog-select-card ${selectedPOG?.id === pog.id ? 'selected' : ''}`}
              onClick={() => handlePOGSelect(pog)}
            >
              <div className="loc-pog-select-preview">
                <img src={pog.image} alt={pog.name} />
              </div>
              <div className="loc-pog-select-info">
                <h5>{pog.name}</h5>
                <div className="loc-pog-select-meta">
                  <span>{pog.version}</span>
                  <span>{pog.sectionSize}</span>
                  <span>{pog.shelfCount} shelves</span>
                </div>
              </div>
              {selectedPOG?.id === pog.id && <CheckCircleOutlined sx={{ fontSize: 18 }} className="loc-pog-select-check" />}
            </div>
          ))}
        </div>

        {/* Selected POG Details */}
        {selectedPOG && (
          <div className="loc-corporate-panel">
            <div className="loc-pog-preview">
              <img src={selectedPOG.image} alt={selectedPOG.name} />
            </div>
            <div className="loc-pog-details">
              <h4>{selectedPOG.name}</h4>
              <div className="loc-pog-metadata">
                <div className="loc-metadata-item">
                  <span className="loc-metadata-label">Version</span>
                  <span className="loc-metadata-value">{selectedPOG.version}</span>
                </div>
                <div className="loc-metadata-item">
                  <span className="loc-metadata-label">Section Size</span>
                  <span className="loc-metadata-value">{selectedPOG.sectionSize}</span>
                </div>
                <div className="loc-metadata-item">
                  <span className="loc-metadata-label">Shelf Count</span>
                  <span className="loc-metadata-value">{selectedPOG.shelfCount}</span>
                </div>
              </div>
              
              <div className="loc-agentic-insights">
                <div className="loc-agentic-header">
                  <AutoAwesomeOutlined sx={{ fontSize: 16 }} />
                  <span>AI-Interpreted Structure</span>
                </div>
                <div className="loc-insight-tags">
                  {selectedPOG.insights.map((insight: string, idx: number) => (
                    <span key={idx} className="loc-insight-tag">{insight}</span>
                  ))}
                </div>
              </div>

              {/* Rules Section */}
              <div className="loc-rules-section premium">
                <div className="loc-rules-header">
                  <GppGoodOutlined sx={{ fontSize: 16 }} />
                  <span>Applicable Rules</span>
                  <span className="loc-rules-count">{selectedPOG.rules.length}</span>
                </div>
                <div className="loc-rules-grid">
                  {selectedPOG.rules.map((rule, idx) => {
                    const typeIcon = rule.type.toLowerCase().includes('facing') ? <VisibilityOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('priority') ? <TrackChangesOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('adjacency') ? <LayersOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('capacity') || rule.type.toLowerCase().includes('fit') ? <InventoryOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('brand') || rule.type.toLowerCase().includes('block') ? <BarChartOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('compliance') ? <GppGoodOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('visual') ? <AutoAwesomeOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('space') ? <LayersOutlined sx={{ fontSize: 16 }} />
                      : rule.type.toLowerCase().includes('price') ? <TrendingUpOutlined sx={{ fontSize: 16 }} />
                      : <DescriptionOutlined sx={{ fontSize: 16 }} />;
                    return (
                      <div key={idx} className={`loc-rule-card-v2 ${rule.status.toLowerCase()}`}>
                        <div className="loc-rule-icon" style={{ color: rule.status === 'Warning' ? 'var(--ia-color-warning-text)' : 'var(--ia-color-primary-hover)', background: rule.status === 'Warning' ? '#fef9c3' : 'var(--ia-color-primary-soft)' }}>
                          {typeIcon}
                        </div>
                        <div className="loc-rule-content">
                          <div className="loc-rule-top-row">
                            <span className="loc-rule-name-v2">{rule.name}</span>
                            <span className={`loc-rule-status-dot ${rule.status.toLowerCase()}`} />
                          </div>
                          {rule.description && (
                            <p className="loc-rule-desc-v2">{rule.description}</p>
                          )}
                          <div className="loc-rule-meta-row">
                            <span className="loc-rule-type-label">{rule.type}</span>
                            <span className={`loc-rule-status-label ${rule.status.toLowerCase()}`}>
                              {rule.status === 'Warning' && <ErrorOutlined sx={{ fontSize: 9 }} />}
                              {rule.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          className="pi-btn-primary loc-continue-btn"
          onClick={() => transitionToStep('storeGroup')}
          disabled={!selectedPOG}
          endIcon={<KeyboardArrowRight sx={{ fontSize: 18 }} />}
        >
          Continue to Store Group
        </Button>
      </div>
    );
  };

  const renderStoreGroupStep = () => {
    const selectedGroup = storeGroups.find(g => g.id === selectedStoreGroup);
    // Filter store groups based on selected POG's cluster mapping
    const availableGroups = selectedPOG 
      ? storeGroups.filter(g => pogClusterMapping[selectedPOG.id]?.includes(g.id))
      : storeGroups;
    
    return (
      <div className="loc-step-content">
        <h3 className="loc-step-title">Select Store Group</h3>
        <p className="loc-step-description">Select the store group this planogram should be localized for. Each group has a distinct shopper profile, basket behavior, and space footprint.</p>
        
        <div className="loc-store-group-grid">
          {availableGroups.map(group => (
            <div 
              key={group.id}
              className={`loc-store-group-card ${selectedStoreGroup === group.id ? 'selected' : ''}`}
              onClick={() => setSelectedStoreGroup(group.id)}
            >
              <div className="loc-store-group-header">
                <StoreOutlined sx={{ fontSize: 20 }} />
                <h4>{group.name}</h4>
                {selectedStoreGroup === group.id && <CheckCircleOutlined sx={{ fontSize: 18 }} className="loc-group-check" />}
              </div>
              <p className="loc-store-group-desc">{group.description}</p>
              <div className="loc-store-group-meta">
                <GroupOutlined sx={{ fontSize: 14 }} />
                <span>{group.storeCount} stores</span>
              </div>
              <div className="loc-store-group-tags">
                {group.tags.map((tag, idx) => (
                  <span key={idx} className="loc-group-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Category Demand Index */}
        {selectedGroup && selectedCategory && (
          <>
            <div className="loc-demand-index-panel">
              <div className="loc-demand-index-header">
                <div className="loc-demand-index-title">
                  <BarChartOutlined sx={{ fontSize: 18 }} />
                  <h4>Category Demand Index</h4>
                  <Tooltip title="Index shows how strongly a category performs in this store group compared to average stores. Values above 100 indicate higher demand." orientation="top">
                    <span className="loc-demand-index-tooltip"><InfoOutlined sx={{ fontSize: 14 }} /></span>
                  </Tooltip>
                </div>
                <span className="loc-demand-index-subtitle">Relative demand vs average store (100 = baseline)</span>
              </div>
              <div className="loc-demand-index-bars">
                {(categoryDemandIndex[selectedCategory]?.[selectedStoreGroup!] || [])
                  .sort((a, b) => b.value - a.value)
                  .map((item, idx) => {
                    const maxValue = 160;
                    const barWidth = Math.min((item.value / maxValue) * 100, 100);
                    const colorClass = getDemandIndexColor(item.value);
                    const isTop = idx < 2;
                    return (
                      <div key={item.name} className={`loc-demand-bar-row ${isTop ? 'highlight' : ''}`}>
                        <span className="loc-demand-bar-label">{item.name}</span>
                        <div className="loc-demand-bar-track">
                          <div 
                            className={`loc-demand-bar-fill ${colorClass}`} 
                            style={{ width: `${barWidth}%` }}
                          />
                          <div className="loc-demand-bar-baseline" style={{ left: `${(100/maxValue)*100}%` }} />
                        </div>
                        <span className={`loc-demand-bar-value ${colorClass}`}>{item.value}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <Alert
              severity="info"
              title="Implication"
              description={generateDemandImplication(categoryDemandIndex[selectedCategory]?.[selectedStoreGroup!] || [])}
              subtleBackground
            />

            {/* Pre-Engine Forecast — compact inline */}
            <div className="loc-forecast-strip">
              <div className="loc-forecast-item">
                <span className="loc-forecast-val lift">+{selectedGroup.id === 'urban' ? '8.2' : selectedGroup.id === 'family' ? '5.4' : '6.1'}%</span>
                <span className="loc-forecast-lbl">Expected Lift</span>
              </div>
              <div className="loc-forecast-divider" />
              <div className="loc-forecast-item">
                <span className="loc-forecast-val">{selectedGroup.id === 'urban' ? '3.5' : selectedGroup.id === 'family' ? '2.8' : '2.2'} hrs</span>
                <span className="loc-forecast-lbl">Impl. Effort / Store</span>
              </div>
              <div className="loc-forecast-divider" />
              <div className="loc-forecast-item">
                <span className="loc-forecast-val">{selectedGroup.storeCount}</span>
                <span className="loc-forecast-lbl">Affected Stores</span>
              </div>
            </div>

            <Button variant="contained" color="primary" size="large" className="pi-btn-primary loc-continue-btn" onClick={() => transitionToStep('engine')} endIcon={<KeyboardArrowRight sx={{ fontSize: 18 }} />}>
              Continue to Engine
            </Button>
          </>
        )}
      </div>
    );
  };

  const renderEngineStep = () => (
    <div className="loc-step-content">
      <h3 className="loc-step-title">Localization Engine</h3>
      <p className="loc-step-description">Run the AI-powered localization engine to adapt the corporate planogram.</p>
      
      <div className="loc-engine-panel">
        <div className="loc-engine-stages">
          {engineStages.map((stage) => (
            <div key={stage.id} className={`loc-engine-stage ${stage.status}`}>
              <div className="loc-stage-header">
                <div className="loc-stage-icon">
                  {stage.status === 'running' ? (
                    <RotateRight sx={{ fontSize: 20 }} className="spinning" />
                  ) : stage.status === 'completed' ? (
                    <CheckCircleOutlined sx={{ fontSize: 20 }} />
                  ) : (
                    stage.icon
                  )}
                </div>
                <div className="loc-stage-info">
                  <h5>{stage.name}</h5>
                  {stage.status === 'running' && (
                    <span className="loc-stage-status">Processing...</span>
                  )}
                  {stage.status === 'completed' && stage.reasoning && (
                    <span className="loc-stage-reasoning">{stage.reasoning}</span>
                  )}
                </div>
              </div>
              {stage.status === 'completed' && stage.details && (
                <div className="loc-stage-details">
                  {stage.details.map((detail, idx) => (
                    <div key={idx} className="loc-stage-detail-item">
                      <KeyboardArrowRight sx={{ fontSize: 14 }} />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {isEngineRunning && (
          <div className="loc-engine-live-status">
            <div className="loc-live-indicator" />
            <span>Engine is analyzing and optimizing...</span>
          </div>
        )}

        {!localizationResult && !isEngineRunning && (
          <div className="loc-prompt-block">
            <div className="loc-prompt-header">
              <div className="loc-prompt-label">
                <AutoAwesomeOutlined sx={{ fontSize: 14 }} />
                <span>Customize this run <em>(optional)</em></span>
              </div>
              <span className="loc-prompt-hint">Add natural-language guidance — the engine will factor it into Geometry, Demand &amp; Policy stages.</span>
            </div>
            <TextArea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Prioritize premium SKUs at eye level, cap promotional facings at 30%, and bias toward local brands for this cluster..."
              rows={3}
            />
            <div className="loc-prompt-chips">
              {[
                'Prioritize premium SKUs at eye level',
                'Bias toward local / regional brands',
                'Cap promo facings at 30%',
                'Maximize family / value SKU visibility',
              ].map((s) => (
                <Chips
                  key={s}
                  label={`+ ${s}`}
                  variant="outlined"
                  size="small"
                  className="loc-prompt-chip"
                  onClick={() => setCustomPrompt((p) => (p ? `${p}\n• ${s}` : `• ${s}`))}
                />
              ))}
            </div>
            <Button variant="contained" color="primary" size="large" className="loc-run-engine-btn" onClick={runLocalizationEngine} startIcon={<PlayArrowOutlined sx={{ fontSize: 18 }} />}>
              Run Localization Engine
            </Button>
          </div>
        )}

        {localizationResult && (
          <div className="loc-engine-complete">
            <CheckCircleOutlined sx={{ fontSize: 24 }} />
            <div>
              <strong>Localization Complete</strong>
              <p>View results in the Published Results tab</p>
            </div>
            <Button variant="contained" color="primary" className="loc-view-results-btn" onClick={() => { setSelectedResultId(localizationResult?.id || null); setActiveTab('results'); }} endIcon={<KeyboardArrowRight sx={{ fontSize: 16 }} />}>
              View Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderRunLocalization = () => (
    <div className="loc-run-container">
      {renderWorkflowProgress()}
      <div className="loc-main-panel">
        {isStepLoading ? (
          <div className="loc-step-loading">
            <Loader size="large" />
            <h4>Loading next step...</h4>
            <p>Preparing data and validating selections</p>
          </div>
        ) : (
          <>
            {currentStep === 'category' && renderCategoryStep()}
            {currentStep === 'corporate' && renderCorporateStep()}
            {currentStep === 'storeGroup' && renderStoreGroupStep()}
            {currentStep === 'engine' && renderEngineStep()}
          </>
        )}
      </div>
    </div>
  );

  const handlePublishWithConfirm = async (resultId: string) => {
    setIsPublishing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    handlePublish(resultId);
    setIsPublishing(false);
    setShowPublishModal(null);
  };

  const handleRollback = (resultId: string) => {
    setPublishedResults(prev => prev.map(r => 
      r.id === resultId ? { ...r, status: 'Ready' as const } : r
    ));
    setShowRollbackConfirm(null);
  };

  const renderResultDetail = (result: LocalizationResult) => {
    const corpPOG = allCorporatePOGs.find(p => p.id === result.corporatePOGId);
    const storeGroup = storeGroups.find(g => g.name === result.storeGroup);
    
    // Validation checks based on the localization
    const validationChecks = [
      { id: 'policy', label: 'Policy Rules Validated', detail: `${corpPOG?.rules.length || 5} merchandising rules passed`, passed: true },
      { id: 'capacity', label: 'Shelf Capacity Within Limits', detail: 'All shelves within 70-85% density target', passed: true },
      { id: 'facing', label: 'Minimum Facings Met', detail: 'No SKU below minimum 1-facing threshold', passed: true },
      { id: 'brand', label: 'Brand Blocking Maintained', detail: 'Brand adjacency and grouping rules intact', passed: true },
      { id: 'demand', label: 'Demand Signal Alignment', detail: `Top categories match ${result.cluster} velocity data`, passed: true },
      { id: 'size', label: 'Size-Run Integrity', detail: result.confidenceScore > 90 ? 'Full size runs preserved across key styles' : 'Minor size-run gaps flagged — review recommended', passed: result.confidenceScore > 90 },
    ];

    // Task package preview
    const taskPackage = [
      { type: 'Reset Shelf', count: Math.round((storeGroup?.storeCount || 50) * 0.08), priority: 'High', icon: <LayersOutlined sx={{ fontSize: 16 }} /> },
      { type: 'Relocate Products', count: Math.round(result.changes.facingsAdjusted * 0.6), priority: 'High', icon: <NorthEast sx={{ fontSize: 16 }} /> },
      { type: 'Adjust Facings', count: result.changes.facingsAdjusted, priority: 'Medium', icon: <TrackChangesOutlined sx={{ fontSize: 16 }} /> },
      { type: 'Update Labels', count: Math.round(result.changes.facingsAdjusted * 0.8), priority: 'Medium', icon: <DescriptionOutlined sx={{ fontSize: 16 }} /> },
      { type: 'Photo Compliance', count: Math.round((storeGroup?.storeCount || 50) * 0.08), priority: 'Low', icon: <VisibilityOutlined sx={{ fontSize: 16 }} /> },
    ];
    
    return (
      <div className="loc-artifact">
        {/* Top Bar */}
        <div className="loc-artifact-topbar">
          <button className="loc-back-btn" onClick={() => setSelectedResultId(null)}>
            <KeyboardArrowRight sx={{ fontSize: 16 }} className="rotated" /> Back to Results
          </button>
          <div className="loc-artifact-actions">
            <button className="loc-artifact-action-btn"><PrintOutlined sx={{ fontSize: 15 }} /> Print</button>
            <button className="loc-artifact-action-btn"><FileDownloadOutlined sx={{ fontSize: 15 }} /> Export PDF</button>
            <button className="loc-artifact-action-btn primary"><IosShareOutlined sx={{ fontSize: 15 }} /> Share Artifact</button>
          </div>
        </div>

        {/* Artifact Header */}
        <div className="loc-artifact-header">
          <div className="loc-artifact-header-left">
            <div className="loc-artifact-badge-row">
              <span className={`loc-artifact-status ${result.status.toLowerCase()}`}>
                {result.status === 'Published' ? <CheckCircleOutlined sx={{ fontSize: 13 }} /> : <AccessTimeOutlined sx={{ fontSize: 13 }} />}
                {result.status}
              </span>
              <span className="loc-artifact-confidence">
                <AutoAwesomeOutlined sx={{ fontSize: 13 }} />
                {result.confidenceScore}% Confidence
              </span>
            </div>
            <h2 className="loc-artifact-title">{result.corporatePOG}</h2>
            <p className="loc-artifact-subtitle">Localized for <strong>{result.cluster}</strong> · {storeGroup?.storeCount || 0} stores · {result.category}</p>
            <div className="loc-artifact-meta-row">
              <span><CalendarTodayOutlined sx={{ fontSize: 13 }} /> Created {result.createdAt}</span>
              <span>{result.version}</span>
              <span>Derived from corporate standard</span>
            </div>
          </div>
          <div className="loc-artifact-header-right">
            <div className="loc-artifact-kpi-strip">
              <div className="loc-artifact-kpi">
                <span className="loc-artifact-kpi-value">{result.changes.facingsAdjusted}</span>
                <span className="loc-artifact-kpi-label">Facings Changed</span>
              </div>
              <div className="loc-artifact-kpi">
                <span className="loc-artifact-kpi-value">{result.changes.premiumShift}</span>
                <span className="loc-artifact-kpi-label">Premium Shift</span>
              </div>
              <div className="loc-artifact-kpi">
                <span className="loc-artifact-kpi-value">{result.changes.valuePLShift}</span>
                <span className="loc-artifact-kpi-label">Value/PL Shift</span>
              </div>
              <div className="loc-artifact-kpi">
                <span className="loc-artifact-kpi-value">{result.changes.tasksGenerated}</span>
                <span className="loc-artifact-kpi-label">Tasks Generated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="loc-artifact-grid">
          {/* Left: Visual Layout Preview */}
          <div className="loc-artifact-left">
            <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
              <div className="loc-artifact-card-header">
                <h3>Visual Layout Preview</h3>
                <div className="loc-viewer-toggle">
                  <button className={!showCorporateView ? 'active' : ''} onClick={() => setShowCorporateView(false)}>
                    Localized
                  </button>
                  <button className={showCorporateView ? 'active' : ''} onClick={() => setShowCorporateView(true)}>
                    Corporate
                  </button>
                </div>
              </div>
              <div className="loc-artifact-viewer">
                <img 
                  src={showCorporateView 
                    ? (corpPOG?.image || WomensWallStandard)
                    : (localizedImageMap[corpPOG?.image || ''] || corpPOG?.image || LocalizedWomensWall)
                  } 
                  alt="Planogram" 
                  className={showCorporateView ? 'corporate' : 'localized'}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = showCorporateView ? WomensWallStandard : LocalizedWomensWall;
                  }}
                />
                {!showCorporateView && (
                  <div className="loc-artifact-overlay-badge"><AutoAwesomeOutlined sx={{ fontSize: 14 }} /> AI-Localized for {result.cluster}</div>
                )}
              </div>
              <div className="loc-artifact-diff-strip">
                <span className="loc-artifact-diff-label"><TrendingUpOutlined sx={{ fontSize: 14 }} /> Key Changes</span>
                <div className="loc-artifact-diff-tags">
                  {result.diffHighlights.map((diff, idx) => (
                    <span key={idx} className="loc-artifact-diff-tag">{diff}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Why This Changed */}
            <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
              <div className="loc-artifact-card-header">
                <h3><InfoOutlined sx={{ fontSize: 16 }} /> Why This Changed</h3>
              </div>
              <div className="loc-artifact-why-list">
                {result.whyChanged.map((item, idx) => (
                  <div key={idx} className="loc-artifact-why-item">
                    <div className="loc-artifact-why-header" onClick={() => toggleReasonExpand(item.title)}>
                      <KeyboardArrowDown sx={{ fontSize: 15 }} className={expandedReasons.includes(item.title) ? 'expanded' : ''} />
                      <span className="loc-artifact-why-title">{item.title}</span>
                    </div>
                    {expandedReasons.includes(item.title) && (
                      <p className="loc-artifact-why-reason">{item.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Validation, Tasks, Actions */}
          <div className="loc-artifact-right">
            {/* Validation Checks */}
            <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
              <div className="loc-artifact-card-header">
                <h3><GppGoodOutlined sx={{ fontSize: 16 }} /> Validation Checks</h3>
                <span className="loc-artifact-check-summary">
                  {validationChecks.filter(c => c.passed).length}/{validationChecks.length} passed
                </span>
              </div>
              <div className="loc-artifact-checks">
                {validationChecks.map(check => (
                  <div key={check.id} className={`loc-artifact-check ${check.passed ? 'passed' : 'warning'}`}>
                    <div className="loc-artifact-check-icon">
                      {check.passed ? <CheckCircleOutlined sx={{ fontSize: 16 }} /> : <ErrorOutlined sx={{ fontSize: 16 }} />}
                    </div>
                    <div className="loc-artifact-check-info">
                      <span className="loc-artifact-check-label">{check.label}</span>
                      <span className="loc-artifact-check-detail">{check.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Task Package */}
            <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
              <div className="loc-artifact-card-header">
                <h3><InventoryOutlined sx={{ fontSize: 16 }} /> Task Package</h3>
                <span className="loc-artifact-task-total">{result.changes.tasksGenerated} tasks</span>
              </div>
              <div className="loc-artifact-tasks">
                {taskPackage.map((task, idx) => (
                  <div key={idx} className="loc-artifact-task-row">
                    <div className="loc-artifact-task-icon">{task.icon}</div>
                    <div className="loc-artifact-task-info">
                      <span className="loc-artifact-task-type">{task.type}</span>
                      <span className="loc-artifact-task-count">{task.count} across {storeGroup?.storeCount || 0} stores</span>
                    </div>
                    <span className={`loc-artifact-task-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Publish / Rollback Actions */}
            <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: 0, overflow: 'hidden' }}>
              {result.status === 'Ready' ? (
                <>
                  <div className="loc-artifact-publish-header">
                    <div>
                      <h3>Ready to Publish</h3>
                      <p>Deploy this localized planogram and {result.changes.tasksGenerated} tasks to {storeGroup?.storeCount || 0} stores.</p>
                    </div>
                  </div>
                  <button className="loc-artifact-publish-btn" onClick={() => setShowPublishModal(result.id)}>
                    <BoltOutlined sx={{ fontSize: 16 }} />
                    Publish to Stores
                  </button>
                </>
              ) : (
                <>
                  <div className="loc-artifact-publish-header published">
                    <CheckCircleOutlined sx={{ fontSize: 20 }} />
                    <div>
                      <h3>Published</h3>
                      <p>Live across {storeGroup?.storeCount || 0} stores · {result.changes.tasksGenerated} tasks dispatched</p>
                    </div>
                  </div>
                  <button className="loc-artifact-rollback-btn" onClick={() => setShowRollbackConfirm(result.id)}>
                    <RotateLeftOutlined sx={{ fontSize: 15 }} />
                    Rollback to Draft
                  </button>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Publish Confirmation Modal */}
        <Modal
          open={showPublishModal === result.id}
          title="Publish Localization"
          onClose={() => !isPublishing && setShowPublishModal(null)}
          primaryButtonLabel={isPublishing ? 'Publishing…' : 'Confirm Publish'}
          onPrimaryButtonClick={() => handlePublishWithConfirm(result.id)}
          secondaryButtonLabel="Cancel"
          onSecondaryButtonClick={() => setShowPublishModal(null)}
          size="small"
        >
          <p>This will deploy the localized planogram to <strong>{storeGroup?.storeCount || 0} {result.cluster} stores</strong> and generate <strong>{result.changes.tasksGenerated} execution tasks</strong> in the Operations Queue.</p>
          <div className="loc-modal-summary">
            <div className="loc-modal-summary-row"><span>Planogram</span><strong>{result.corporatePOG}</strong></div>
            <div className="loc-modal-summary-row"><span>Store Group</span><strong>{result.cluster}</strong></div>
            <div className="loc-modal-summary-row"><span>Confidence</span><strong>{result.confidenceScore}%</strong></div>
          </div>
        </Modal>

        {/* Rollback Confirmation Modal */}
        <Modal
          open={showRollbackConfirm === result.id}
          title="Rollback to Draft"
          onClose={() => setShowRollbackConfirm(null)}
          primaryButtonLabel="Confirm Rollback"
          onPrimaryButtonClick={() => handleRollback(result.id)}
          secondaryButtonLabel="Cancel"
          onSecondaryButtonClick={() => setShowRollbackConfirm(null)}
          size="small"
        >
          <p>This will revert the localization status to <strong>Ready</strong>. Published tasks in the Operations Queue will remain but no new tasks will be dispatched.</p>
        </Modal>
      </div>
    );
  };

  const renderPublishedResults = () => {
    if (selectedResultId) {
      const result = publishedResults.find(r => r.id === selectedResultId);
      if (result) return renderResultDetail(result);
    }

    return (
      <div className="loc-results-container">
        {/* Toolbar */}
        <div className="loc-results-toolbar">
          <div className="loc-results-search">
            <SearchOutlined sx={{ fontSize: 18 }} />
            <input 
              type="text" 
              placeholder="Search by cluster, POG, or category..." 
              value={resultsSearch}
              onChange={(e) => setResultsSearch(e.target.value)}
            />
          </div>
          <div className="loc-results-filters loc-results-filters--impact">
            <Chips
              label={`All (${publishedResults.length})`}
              variant={resultsFilter === 'all' ? 'filled' : 'outlined'}
              color={resultsFilter === 'all' ? 'primary' : undefined}
              size="small"
              onClick={() => setResultsFilter('all')}
            />
            <Chips
              label={`Ready (${publishedResults.filter(r => r.status === 'Ready').length})`}
              variant={resultsFilter === 'Ready' ? 'filled' : 'outlined'}
              color={resultsFilter === 'Ready' ? 'primary' : undefined}
              size="small"
              onClick={() => setResultsFilter('Ready')}
            />
            <Chips
              label={`Published (${publishedResults.filter(r => r.status === 'Published').length})`}
              variant={resultsFilter === 'Published' ? 'filled' : 'outlined'}
              color={resultsFilter === 'Published' ? 'primary' : undefined}
              size="small"
              onClick={() => setResultsFilter('Published')}
            />
          </div>
          <button 
            className={`loc-filter-toggle-btn ${showFilters ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <StoreOutlined sx={{ fontSize: 16 }} />
            Filters
            {activeFilterCount > 0 && <span className="loc-filter-count">{activeFilterCount}</span>}
          </button>
          <div className="loc-results-actions-toolbar">
            <button className="loc-toolbar-btn"><FileDownloadOutlined sx={{ fontSize: 16 }} /> Export All</button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="loc-advanced-filters">
            <div className="loc-filter-group">
              <label>Cluster</label>
              <select value={clusterFilter} onChange={(e) => setClusterFilter(e.target.value)}>
                <option value="all">All Clusters</option>
                {uniqueClusters.map(cluster => (
                  <option key={cluster} value={cluster}>{cluster}</option>
                ))}
              </select>
            </div>
            <div className="loc-filter-group">
              <label>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="loc-filter-group">
              <label>Date</label>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">All Dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="text" color="primary" size="small" className="loc-clear-filters-btn" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <EmptyState
            heading="No Results Found"
            description={publishedResults.length === 0 ? 'Run the localization engine to generate results.' : 'Try adjusting your search or filters.'}
            emptyStateIcon={<DescriptionOutlined sx={{ fontSize: 40 }} />}
            primaryButtonLabel={publishedResults.length === 0 ? 'Go to Run Localization' : undefined}
            onPrimaryButtonClick={publishedResults.length === 0 ? () => setActiveTab('run') : undefined}
          />
        ) : (
          <div className="loc-results-list">
            {filteredResults.map(result => (
              <div key={result.id} className="loc-result-card" onClick={() => setSelectedResultId(result.id)}>
                <div className="loc-result-card-left">
                  <Card size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
                    <img src={allCorporatePOGs.find(p => p.id === result.corporatePOGId)?.image || '/planograms/beverage-cooler-standard.svg'} alt="" />
                  </Card>
                  <div className="loc-result-card-info">
                    <h4>{result.corporatePOG}</h4>
                    <p>Localized for <strong>{result.cluster}</strong></p>
                    <div className="loc-result-card-meta">
                      <span><CalendarTodayOutlined sx={{ fontSize: 12 }} /> {result.createdAt}</span>
                      <span className="loc-result-card-category">{result.category}</span>
                    </div>
                  </div>
                </div>
                <div className="loc-result-card-right">
                  <div className="loc-result-card-stats">
                    <div className="loc-result-stat">
                      <span className="loc-stat-value">{result.confidenceScore}%</span>
                      <span className="loc-stat-label">Confidence</span>
                    </div>
                    <div className="loc-result-stat">
                      <span className="loc-stat-value">{result.changes.facingsAdjusted}</span>
                      <span className="loc-stat-label">Changes</span>
                    </div>
                  </div>
                  <Badge label={result.status} color={result.status === 'Published' ? 'success' : 'warning'} size="small" variant="subtle" />
                  <div className="loc-result-card-actions">
                    <button className="loc-card-action" onClick={(e) => { e.stopPropagation(); }}><VisibilityOutlined sx={{ fontSize: 14 }} /></button>
                    <button className="loc-card-action" onClick={(e) => { e.stopPropagation(); }}><FileDownloadOutlined sx={{ fontSize: 14 }} /></button>
                    <button className="loc-card-action" onClick={(e) => { e.stopPropagation(); }}><IosShareOutlined sx={{ fontSize: 14 }} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loc-engine-container">
        <div className="page-loading">
          <Loader size="large" />
          <p>Loading Localization Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loc-engine-container">
      <div className="loc-engine-header">
        <div className="pi-header-row">
          <div className="loc-engine-title-section">
            <div className="loc-engine-title-row">
              <TrackChangesOutlined sx={{ fontSize: 24 }} />
              <h1 className="loc-engine-title">Localization Engine</h1>
            </div>
            <p className="loc-engine-subtitle">
              Adapt corporate planograms into store-specific layouts using demand signals and rule validation
            </p>
            <div className="pi-header-meta">
              <span className="pi-meta-pill">
                <TrackChangesOutlined sx={{ fontSize: 12 }} />
                {publishedResults.length} Localizations
              </span>
              <span className="pi-meta-pill pi-meta-pill--success">
                {publishedResults.filter(r => r.status === 'Published').length} Published
              </span>
              <span className="pi-meta-pill pi-meta-pill--warning">
                {publishedResults.filter(r => r.status === 'Ready').length} Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Tabs
          tabNames={[
            { value: 'run', label: 'Run Localization' },
            { value: 'results', label: 'Published Results' },
          ]}
          tabPanels={[
            <div className="loc-engine-content">{renderRunLocalization()}</div>,
            <div className="loc-engine-content">{renderPublishedResults()}</div>,
          ]}
          value={activeTab}
          onChange={(_, val) => setActiveTab(val as 'run' | 'results')}
        />
      </div>
    </div>
  );
};

export default POGLocalizationEngine;

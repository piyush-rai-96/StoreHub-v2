// ── Product Execution Workspace — Mock Data ────────────────────────────────

export type PexSource =
  | 'top_performing'
  | 'emerging'
  | 'at_risk'
  | 'boh_sync'
  | 'phantom_stock'
  | 'pog_compliance';

export type PexStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'dismissed'
  | 'overdue'
  | 'escalated';

export type PexPriority = 'High' | 'Medium' | 'Low';

export interface PexFindings {
  stockReceived: boolean | null;
  inBackroom: boolean | null;
  onShelf: boolean | null;
  displaySetup: boolean | null;
  displayHasIssues: boolean | null;
  labourShortage: boolean | null;
  rackNumber: string;
  shelfPosition: string;
  notes: string;
  selectedIssues: string[];
  uploadedImages: string[];
}

export interface PexAuditEntry {
  timestamp: string;
  action: string;
  user: string;
}

export interface PexWeeklySales {
  week: string;
  store: number;
  cluster: number;
  chain: number;
}

export interface PexTask {
  id: string;
  linkedTaskId: string;
  source: PexSource;
  productName: string;
  sku: string;
  department: string;
  subDepartment: string;
  itemClass: string;
  productImage: string;
  storeId: string;
  storeName: string;
  priority: PexPriority;
  status: PexStatus;
  owner: string;
  ownerId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  opportunityValue?: number;
  riskValue?: number;
  confidenceScore?: number;
  // Performance
  storeWeeklySales: number;
  clusterAvgSales: number;
  chainAvgSales: number;
  performanceGap: number;
  salesTrend: PexWeeklySales[];
  recommendedAction: string;
  opportunityExplanation: string;
  // Findings
  findings: PexFindings;
  auditTrail: PexAuditEntry[];
}

export const PEX_SOURCE_LABELS: Record<PexSource, string> = {
  top_performing: 'Top Performing Product',
  emerging: 'Emerging Product',
  at_risk: 'At-Risk Product',
  boh_sync: 'BOH-to-Shelf Sync',
  phantom_stock: 'Phantom Stock',
  pog_compliance: 'POG Compliance Gap',
};

export const PEX_STATUS_LABELS: Record<PexStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
  overdue: 'Overdue',
  escalated: 'Escalated',
};

export const DISMISS_REASONS_PEX = [
  'False detection',
  'Product already replenished',
  'Inventory count incorrect',
  'Store condition changed',
  'Image quality issue',
  'POG no longer active',
  'Duplicate task',
  'Not applicable to this store',
  'Other',
];

export const PEX_ISSUE_TYPES = [
  'Shelf gap',
  'BOH available but not on shelf',
  'Phantom stock suspected',
  'POG placement mismatch',
  'Incorrect facing',
  'Wrong shelf position',
  'Missing price tag / signage',
  'Damaged product',
  'Labour constraint',
  'Stock not received',
  'Other',
];

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=80&h=80&fit=crop',
];

const emptyFindings = (): PexFindings => ({
  stockReceived: null,
  inBackroom: null,
  onShelf: null,
  displaySetup: null,
  displayHasIssues: null,
  labourShortage: null,
  rackNumber: '',
  shelfPosition: '',
  notes: '',
  selectedIssues: [],
  uploadedImages: [],
});

const makeSalesTrend = (base: number, clusterBase: number, chainBase: number): PexWeeklySales[] => {
  const weeks = ['W16', 'W17', 'W18', 'W19', 'W20', 'W21'];
  return weeks.map((w, i) => ({
    week: w,
    store: Math.round(base * (0.88 + i * 0.025 + (Math.sin(i) * 0.04))),
    cluster: Math.round(clusterBase * (0.95 + i * 0.01)),
    chain: Math.round(chainBase * (0.97 + i * 0.006)),
  }));
};

export const PEX_TASKS: PexTask[] = [
  {
    id: 'PEX-001',
    linkedTaskId: 'OQ-PEX-001',
    source: 'top_performing',
    productName: 'Premium Running Shoe X9',
    sku: 'SKU-10042',
    department: "Footwear",
    subDepartment: "Men's Footwear",
    itemClass: 'Running',
    productImage: PRODUCT_IMAGES[0],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'High',
    status: 'open',
    owner: 'Sarah Johnson',
    ownerId: 'user-2',
    dueDate: 'May 25, 2026',
    createdAt: '2026-05-23T08:00:00Z',
    updatedAt: '2026-05-23T08:00:00Z',
    opportunityValue: 4200,
    confidenceScore: 92,
    storeWeeklySales: 38,
    clusterAvgSales: 24,
    chainAvgSales: 21,
    performanceGap: +14,
    salesTrend: makeSalesTrend(38, 24, 21),
    recommendedAction: 'Increase shelf allocation by 3 facings. Move from Aisle 4 Bay 2 to end-cap position to capitalize on top-performer momentum.',
    opportunityExplanation: 'This store is outselling the cluster average by 58% for this SKU. Increasing shelf visibility and allocation will unlock additional sell-through before end of season.',
    findings: emptyFindings(),
    auditTrail: [
      { timestamp: '2026-05-23T08:00:00Z', action: 'Task auto-created by system from Top Performing Product signal', user: 'System' },
      { timestamp: '2026-05-23T08:01:00Z', action: 'Owner assigned: Sarah Johnson', user: 'System' },
    ],
  },
  {
    id: 'PEX-002',
    linkedTaskId: 'OQ-PEX-002',
    source: 'boh_sync',
    productName: 'Coca-Cola Zero 12pk',
    sku: 'SKU-884221',
    department: 'Beverages',
    subDepartment: 'Carbonated Drinks',
    itemClass: 'Cola',
    productImage: PRODUCT_IMAGES[4],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'High',
    status: 'overdue',
    owner: 'J. Martinez',
    ownerId: 'user-3',
    dueDate: 'May 25, 2026 · 5:00 PM',
    createdAt: '2026-05-25T09:14:00Z',
    updatedAt: '2026-05-25T09:14:00Z',
    riskValue: 420,
    confidenceScore: 94,
    storeWeeklySales: 0,
    clusterAvgSales: 42,
    chainAvgSales: 38,
    performanceGap: -42,
    salesTrend: makeSalesTrend(0, 42, 38),
    recommendedAction: 'Move 48 units from BOH Aisle 4, Bay 2 to shelf facing immediately. Same-day SLA.',
    opportunityExplanation: 'Shelf image detected 0 units on shelf while BOH system confirms 48 units available in backroom. Shelf gap is causing lost sales.',
    findings: emptyFindings(),
    auditTrail: [
      { timestamp: '2026-05-25T09:14:00Z', action: 'Task auto-created by system from BOH-to-Shelf Sync alert', user: 'System' },
      { timestamp: '2026-05-25T09:14:30Z', action: 'Owner assigned: J. Martinez', user: 'System' },
      { timestamp: '2026-05-25T12:00:00Z', action: 'Task marked Overdue — SLA breached', user: 'System' },
    ],
  },
  {
    id: 'PEX-003',
    linkedTaskId: 'OQ-PEX-003',
    source: 'phantom_stock',
    productName: "Heinz Ketchup 1L",
    sku: 'SKU-334512',
    department: 'Condiments',
    subDepartment: 'Sauces',
    itemClass: 'Ketchup',
    productImage: PRODUCT_IMAGES[5],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'Medium',
    status: 'in_progress',
    owner: 'M. Chen',
    ownerId: 'user-3',
    dueDate: 'May 26, 2026',
    createdAt: '2026-05-25T06:30:00Z',
    updatedAt: '2026-05-25T14:22:00Z',
    riskValue: 535,
    confidenceScore: 81,
    storeWeeklySales: 0,
    clusterAvgSales: 22,
    chainAvgSales: 18,
    performanceGap: -22,
    salesTrend: makeSalesTrend(0, 22, 18),
    recommendedAction: 'Conduct physical shelf count. Verify product is accessible to customers. Clear any backroom blockage.',
    opportunityExplanation: 'System shows 60 units on-hand but zero sales for 22 consecutive days. Likely trapped in backroom or misplaced on shelf.',
    findings: {
      ...emptyFindings(),
      notes: 'Checked aisle 3 - product not visible on shelf. Backroom has stock.',
    },
    auditTrail: [
      { timestamp: '2026-05-25T06:30:00Z', action: 'Task auto-created by system from Phantom Stock alert', user: 'System' },
      { timestamp: '2026-05-25T06:31:00Z', action: 'Owner assigned: M. Chen', user: 'System' },
      { timestamp: '2026-05-25T14:22:00Z', action: 'User opened task', user: 'M. Chen' },
    ],
  },
  {
    id: 'PEX-004',
    linkedTaskId: 'OQ-PEX-004',
    source: 'pog_compliance',
    productName: 'Dove Body Wash 400ml',
    sku: 'SKU-556732',
    department: 'Personal Care',
    subDepartment: 'Body Wash',
    itemClass: 'Body Care',
    productImage: PRODUCT_IMAGES[1],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'Medium',
    status: 'open',
    owner: 'N. Davis',
    ownerId: 'user-2',
    dueDate: 'May 27, 2026',
    createdAt: '2026-05-25T08:45:00Z',
    updatedAt: '2026-05-25T08:45:00Z',
    riskValue: 210,
    confidenceScore: 87,
    storeWeeklySales: 14,
    clusterAvgSales: 19,
    chainAvgSales: 17,
    performanceGap: -5,
    salesTrend: makeSalesTrend(14, 19, 17),
    recommendedAction: 'Correct shelf placement to match active planogram. Product is 2 bays left of correct position. Verify facing count (3 vs 6 expected).',
    opportunityExplanation: 'AI shelf audit detected product placed 2 bays left of planogram position with incorrect facing count. POG compliance gap is impacting sales velocity.',
    findings: emptyFindings(),
    auditTrail: [
      { timestamp: '2026-05-25T08:45:00Z', action: 'Task auto-created by system from POG Compliance Gap alert', user: 'System' },
      { timestamp: '2026-05-25T08:45:30Z', action: 'Owner assigned: N. Davis', user: 'System' },
    ],
  },
  {
    id: 'PEX-005',
    linkedTaskId: 'OQ-PEX-005',
    source: 'emerging',
    productName: 'Athletic Compression Tee',
    sku: 'SKU-20871',
    department: "Men's",
    subDepartment: 'Activewear',
    itemClass: 'Tops',
    productImage: PRODUCT_IMAGES[6],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'Medium',
    status: 'open',
    owner: 'Sarah Johnson',
    ownerId: 'user-2',
    dueDate: 'May 28, 2026',
    createdAt: '2026-05-24T10:00:00Z',
    updatedAt: '2026-05-24T10:00:00Z',
    opportunityValue: 1800,
    confidenceScore: 76,
    storeWeeklySales: 18,
    clusterAvgSales: 11,
    chainAvgSales: 9,
    performanceGap: +7,
    salesTrend: makeSalesTrend(18, 11, 9),
    recommendedAction: 'Increase display prominence. Consider moving to featured wall position. Request additional allocation from DC before next replenishment cycle.',
    opportunityExplanation: 'Sales velocity accelerating +64% over 4 weeks, outpacing cluster by 64%. Early signal of emerging trend. Increased shelf presence now will maximise sell-through.',
    findings: emptyFindings(),
    auditTrail: [
      { timestamp: '2026-05-24T10:00:00Z', action: 'Task auto-created by system from Emerging Product signal', user: 'System' },
      { timestamp: '2026-05-24T10:00:30Z', action: 'Owner assigned: Sarah Johnson', user: 'System' },
    ],
  },
  {
    id: 'PEX-006',
    linkedTaskId: 'OQ-PEX-006',
    source: 'at_risk',
    productName: "Women's V-Neck Basics",
    sku: 'SKU-WOM-TOP-014',
    department: "Women's",
    subDepartment: 'Tops',
    itemClass: 'Basics',
    productImage: PRODUCT_IMAGES[2],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'High',
    status: 'escalated',
    owner: 'John Smith',
    ownerId: 'user-1',
    dueDate: 'May 25, 2026',
    createdAt: '2026-05-22T11:00:00Z',
    updatedAt: '2026-05-25T08:00:00Z',
    riskValue: 3100,
    confidenceScore: 89,
    storeWeeklySales: 2,
    clusterAvgSales: 22,
    chainAvgSales: 19,
    performanceGap: -20,
    salesTrend: makeSalesTrend(2, 22, 19),
    recommendedAction: 'Immediate replenishment required. OOS confirmed on 3 of 4 size variants. Raise emergency reorder with DC.',
    opportunityExplanation: 'Sales velocity dropped 91% vs cluster average. 3 size variants confirmed OOS. Potential $3.1K weekly revenue loss. Escalated to District Manager.',
    findings: {
      ...emptyFindings(),
      onShelf: false,
      inBackroom: false,
      selectedIssues: ['Stock not received'],
      notes: 'Store confirms OOS on all standard sizes. Reorder placed but DC has 14 day lead time.',
    },
    auditTrail: [
      { timestamp: '2026-05-22T11:00:00Z', action: 'Task auto-created by system from At-Risk Product signal', user: 'System' },
      { timestamp: '2026-05-22T11:01:00Z', action: 'Owner assigned: John Smith', user: 'System' },
      { timestamp: '2026-05-23T09:00:00Z', action: 'User opened task', user: 'John Smith' },
      { timestamp: '2026-05-23T09:15:00Z', action: 'Findings saved', user: 'John Smith' },
      { timestamp: '2026-05-25T08:00:00Z', action: 'Task escalated to District Manager', user: 'John Smith' },
    ],
  },
  {
    id: 'PEX-007',
    linkedTaskId: 'OQ-PEX-007',
    source: 'boh_sync',
    productName: 'Red Bull 250ml 4pk',
    sku: 'SKU-990341',
    department: 'Beverages',
    subDepartment: 'Energy Drinks',
    itemClass: 'Energy',
    productImage: PRODUCT_IMAGES[7],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'High',
    status: 'open',
    owner: 'R. Garcia',
    ownerId: 'user-3',
    dueDate: 'May 25, 2026 · 5:00 PM',
    createdAt: '2026-05-25T09:14:00Z',
    updatedAt: '2026-05-25T09:14:00Z',
    riskValue: 390,
    confidenceScore: 91,
    storeWeeklySales: 0,
    clusterAvgSales: 35,
    chainAvgSales: 31,
    performanceGap: -35,
    salesTrend: makeSalesTrend(0, 35, 31),
    recommendedAction: 'Move 60 units from BOH Aisle 5, Bay 1 to shelf facing. Same-day SLA.',
    opportunityExplanation: 'Shelf gap detected via AI image audit. 60 units confirmed available in BOH. Immediate replenishment required.',
    findings: emptyFindings(),
    auditTrail: [
      { timestamp: '2026-05-25T09:14:00Z', action: 'Task auto-created by system from BOH-to-Shelf Sync alert', user: 'System' },
      { timestamp: '2026-05-25T09:14:30Z', action: 'Owner assigned: R. Garcia', user: 'System' },
    ],
  },
  {
    id: 'PEX-008',
    linkedTaskId: 'OQ-PEX-008',
    source: 'top_performing',
    productName: 'Slim Fit Denim Jeans',
    sku: 'SKU-MEN-DNM-003',
    department: "Men's",
    subDepartment: 'Bottoms',
    itemClass: 'Denim',
    productImage: PRODUCT_IMAGES[3],
    storeId: 'STR-001',
    storeName: 'Downtown Flagship',
    priority: 'Medium',
    status: 'resolved',
    owner: 'Mike Chen',
    ownerId: 'user-3',
    dueDate: 'May 23, 2026',
    createdAt: '2026-05-21T09:00:00Z',
    updatedAt: '2026-05-23T11:30:00Z',
    opportunityValue: 2800,
    confidenceScore: 88,
    storeWeeklySales: 32,
    clusterAvgSales: 20,
    chainAvgSales: 17,
    performanceGap: +12,
    salesTrend: makeSalesTrend(32, 20, 17),
    recommendedAction: 'Maintain current allocation. Monitor weekly to prevent OOS.',
    opportunityExplanation: 'Top performer — 60% above cluster average. Allocation increased and shelf presence confirmed. Task resolved.',
    findings: {
      ...emptyFindings(),
      stockReceived: true,
      onShelf: true,
      displaySetup: true,
      displayHasIssues: false,
      rackNumber: 'R-12',
      shelfPosition: 'Eye level, Bay 3',
      notes: 'Allocation received and fully stocked. 4 facings confirmed.',
    },
    auditTrail: [
      { timestamp: '2026-05-21T09:00:00Z', action: 'Task auto-created by system from Top Performing Product signal', user: 'System' },
      { timestamp: '2026-05-21T09:01:00Z', action: 'Owner assigned: Mike Chen', user: 'System' },
      { timestamp: '2026-05-22T10:00:00Z', action: 'User opened task', user: 'Mike Chen' },
      { timestamp: '2026-05-22T10:30:00Z', action: 'Findings saved', user: 'Mike Chen' },
      { timestamp: '2026-05-22T10:31:00Z', action: 'Image uploaded and AI analysis completed', user: 'Mike Chen' },
      { timestamp: '2026-05-23T11:30:00Z', action: 'Task marked Resolved', user: 'Mike Chen' },
    ],
  },
];

export function getPexSummary(tasks: PexTask[]) {
  const open = tasks.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'escalated').length;
  const high = tasks.filter(t => t.priority === 'High' && t.status !== 'resolved' && t.status !== 'dismissed').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dueToday = tasks.filter(t => t.dueDate.startsWith(today) && t.status !== 'resolved' && t.status !== 'dismissed').length;
  const resolvedThisWeek = tasks.filter(t => t.status === 'resolved').length;
  return { open, high, overdue, dueToday, resolvedThisWeek };
}

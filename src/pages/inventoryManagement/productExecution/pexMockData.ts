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
  // Quick context numbers for the mismatch callout
  bohUnits?: number;
  daysSinceLastSale?: number;
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

// SKU-keyed product images — matched to actual product category and name
const SKU_IMAGES: Record<string, string> = {
  'FTW-RUN-002': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop',   // Running Shoes Elite
  'FTW-SNK-007': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120&h=120&fit=crop', // Summer Running Sneaker
  'WOM-TOP-014': 'https://images.unsplash.com/photo-1624484631620-9e53e4aed980?w=120&h=120&fit=crop', // Women's V-Neck Basics
  'MEN-DNM-003': 'https://images.unsplash.com/photo-1714143164072-7646ef5cb24d?w=120&h=120&fit=crop', // Slim Fit Denim — Dark Wash
  'ACC-BAG-005': 'https://images.unsplash.com/photo-1572966059657-6e8910c8c3c0?w=120&h=120&fit=crop', // Canvas Tote Bag
  'MEN-ACT-004': 'https://images.unsplash.com/photo-1613593013133-b6e122feafe8?w=120&h=120&fit=crop', // Athletic Compression Tee
  'SEA-JKT-004': 'https://images.unsplash.com/photo-1559433101-fd3dfc8823ae?w=120&h=120&fit=crop',   // Seasonal Rain Jacket
};

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

// Declining sales trend — product was selling, then dropped to near-zero
const makeDecliningTrend = (normalBase: number, clusterBase: number, chainBase: number): PexWeeklySales[] => {
  const weeks = ['W16', 'W17', 'W18', 'W19', 'W20', 'W21'];
  const dropFactors = [1.0, 0.95, 0.5, 0.1, 0, 0];
  return weeks.map((w, i) => ({
    week: w,
    store: Math.round(normalBase * dropFactors[i]),
    cluster: Math.round(clusterBase * (0.95 + i * 0.01)),
    chain: Math.round(chainBase * (0.97 + i * 0.006)),
  }));
};

export const PEX_TASKS: PexTask[] = [
  {
    id: 'PEX-001',
    linkedTaskId: 'OQ-PEX-001',
    source: 'top_performing',
    productName: 'Running Shoes Elite',
    sku: 'FTW-RUN-002',
    department: 'Footwear',
    subDepartment: "Men's Athletic",
    itemClass: 'Running',
    productImage: SKU_IMAGES['FTW-RUN-002'],
    storeId: 'STR-001',
    storeName: 'Nashville Flagship',
    priority: 'High',
    status: 'open',
    owner: 'Sarah Johnson',
    ownerId: 'user-2',
    dueDate: 'May 30, 2026',
    createdAt: '2026-05-26T08:00:00Z',
    updatedAt: '2026-05-26T08:00:00Z',
    opportunityValue: 4200,
    confidenceScore: 94,
    storeWeeklySales: 38,
    clusterAvgSales: 24,
    chainAvgSales: 21,
    performanceGap: +14,
    salesTrend: makeSalesTrend(38, 24, 21),
    recommendedAction: 'Move from Aisle 4, Bay 2 to the Footwear End Cap (W4). End Cap placement drives +31% higher conversion for this SKU category in peer stores. Request +24 units from DC before this weekend — current stock is 18 units at a 38-unit/week sell rate. InventorySmart has pre-staged the DC allocation request. Approve in 1 click to prevent stockout within 8 days.',
    opportunityExplanation: 'Running Shoes Elite is the #1 Footwear SKU in the district this week — outselling the cluster average by 58% and accelerating 4 weeks in a row. At the current sell rate of 38 units/week with only 18 units in stock, InventorySmart projects a stockout in 8–10 days. Increasing shelf visibility to End Cap and securing the +24 unit DC allocation now captures the full sell-through window before stockout.',
    findings: emptyFindings(),
    auditTrail: [
      { timestamp: '2026-05-26T08:00:00Z', action: 'InventorySmart: Top Performing signal triggered — 4-week velocity acceleration detected', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-26T08:01:00Z', action: 'Stockout risk identified: 18 units on-hand, 38 units/week sell rate — stockout in 8–10 days', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-26T08:02:00Z', action: 'DC allocation request pre-staged: +24 units FTW-RUN-002 (awaiting SM approval)', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-26T08:03:00Z', action: 'Task auto-created — owner assigned: Sarah Johnson', user: 'System' },
    ],
  },
  {
    id: 'PEX-002',
    linkedTaskId: 'OQ-PEX-002',
    source: 'boh_sync',
    productName: "Women's V-Neck Basics",
    sku: 'WOM-TOP-014',
    department: "Women's",
    subDepartment: 'Tops',
    itemClass: 'Basics',
    productImage: SKU_IMAGES['WOM-TOP-014'],
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
    salesTrend: makeDecliningTrend(40, 42, 38),
    recommendedAction: "Move 48 units from BOH Rail C, Bay 2 to Women's Basics wall facing immediately. Same-day SLA.",
    opportunityExplanation: "Shelf image detected 0 units on Women's Basics wall while BOH confirms 48 units in backroom. Shelf gap causing lost sales of ~$420 per week.",
    findings: emptyFindings(),
    auditTrail: [
      { timestamp: '2026-05-25T09:14:00Z', action: 'Task auto-created from BOH-to-Shelf Sync signal — BOH: 48 units, Shelf: 0', user: 'System' },
      { timestamp: '2026-05-25T09:14:30Z', action: 'Owner assigned: J. Martinez', user: 'System' },
      { timestamp: '2026-05-25T09:30:00Z', action: 'Alert notification sent to J. Martinez via app', user: 'System' },
      { timestamp: '2026-05-25T12:00:00Z', action: 'Task marked Overdue — SLA of 3 hours breached', user: 'System' },
    ],
  },
  {
    // ── HERO STORY: Inventory mismatch discovered and corrected in real time ──
    // Digital says 72 units on-hand. Floor says 0. Associate finds them in BOH
    // Bay S3 (misrouted from receiving), moves 36 to floor in 8 min.
    // InventorySmart handles the rest — no cycle count needed.
    id: 'PEX-003',
    linkedTaskId: 'OQ-PEX-003',
    source: 'phantom_stock',
    productName: 'Summer Running Sneaker',
    sku: 'FTW-SNK-007',
    department: 'Footwear',
    subDepartment: "Men's Athletic",
    itemClass: 'Running / Casual',
    productImage: SKU_IMAGES['FTW-SNK-007'],
    storeId: 'STR-001',
    storeName: 'Nashville Flagship',
    priority: 'High',
    status: 'in_progress',
    owner: 'A. Thompson',
    ownerId: 'user-3',
    dueDate: 'May 28, 2026 · 12:00 PM',
    createdAt: '2026-05-26T09:00:00Z',
    updatedAt: '2026-05-28T10:28:00Z',
    riskValue: 1550,
    confidenceScore: 88,
    storeWeeklySales: 0,
    clusterAvgSales: 31,
    chainAvgSales: 27,
    performanceGap: -31,
    bohUnits: 72,
    daysSinceLastSale: 18,
    salesTrend: makeDecliningTrend(29, 31, 27),
    recommendedAction: 'Go to Shoe Storage Bay S3 (rear of stockroom). InventorySmart has pinpointed 72 units from the May 18 shipment misrouted during receiving. Move 36 pairs to Footwear Wall W4, Bay 2 — eye level, size-run XS to XL. Scan to confirm shelf transfer in the app. InventorySmart will handle all inventory record corrections, replenishment recalibration, and follow-up tasks automatically.',
    opportunityExplanation: 'Digital inventory: 72 units on-hand. Physical floor: 0 units. Zero sales for 18 days. The cluster is selling 31 units/week of this SKU — this store is losing an estimated $1,550/week in footwear revenue. InventorySmart traced the discrepancy to a receiving misroute on May 18 — units went to Shoe Storage Bay S3 instead of the Footwear floor. This is an 8-minute fix. No cycle count needed. Fix it now and InventorySmart recalibrates everything automatically.',
    findings: {
      ...emptyFindings(),
      stockReceived: true,
      inBackroom: true,
      onShelf: false,
      rackNumber: 'Bay S3',
      shelfPosition: 'Shoe Storage — Rear stockroom',
      notes: 'Located 72 units in Shoe Storage Bay S3. Confirmed misrouted from May 18 receiving — should have gone to Footwear Wall W4. Moving 36 pairs to floor now. Remaining 36 staying in BOH as buffer stock.',
    },
    auditTrail: [
      { timestamp: '2026-05-18T14:10:00Z', action: 'InventorySmart: 72 units received (FTW-SNK-007) — shipment logged to on-hand inventory', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-20T07:00:00Z', action: 'InventorySmart: Phantom stock signal triggered — 72 units on-hand, 0 sales detected for 2 days post-receive', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-20T07:01:00Z', action: 'InventorySmart: Opportunity cost estimate — $1,550/week in lost footwear revenue vs cluster velocity', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-20T07:02:00Z', action: 'InventorySmart: Receiving route analysis — 72 units likely in Shoe Storage Bay S3 (misrouted May 18 shipment)', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-20T07:03:00Z', action: 'Task auto-created and assigned to A. Thompson — High priority, SLA 48h', user: 'System' },
      { timestamp: '2026-05-20T07:04:00Z', action: 'Push notification sent to A. Thompson: "Inventory mismatch — $1,550/wk at risk. Tap to investigate."', user: 'System (InventorySmart)' },
      { timestamp: '2026-05-28T10:15:00Z', action: 'Task opened — A. Thompson proceeding to Shoe Storage to physically locate units', user: 'A. Thompson' },
      { timestamp: '2026-05-28T10:22:00Z', action: 'Physical investigation complete: 72 units confirmed in Shoe Storage Bay S3. Mismatch cause: receiving misroute on May 18. Units never reached the Footwear floor.', user: 'A. Thompson' },
      { timestamp: '2026-05-28T10:24:00Z', action: 'Moving 36 pairs to Footwear Wall W4, Bay 2 (eye level). Remaining 36 units designated as BOH buffer.', user: 'A. Thompson' },
      { timestamp: '2026-05-28T10:28:00Z', action: 'Findings saved: In BOH=Yes, On shelf=No, Location=Bay S3. 36 units now in transit to floor.', user: 'A. Thompson' },
    ],
  },
  {
    id: 'PEX-004',
    linkedTaskId: 'OQ-PEX-004',
    source: 'pog_compliance',
    productName: 'Canvas Tote Bag',
    sku: 'ACC-BAG-005',
    department: 'Accessories',
    subDepartment: 'Bags',
    itemClass: 'Totes',
    productImage: SKU_IMAGES['ACC-BAG-005'],
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
    recommendedAction: 'Correct placement to match active Accessories End Cap planogram. Product is 2 hooks left of correct position. Verify facing count (3 vs 6 expected).',
    opportunityExplanation: 'AI shelf audit detected product placed 2 hooks left of planogram position on Accessories End Cap with incorrect facing count. POG compliance gap is impacting sales velocity.',
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
    sku: 'MEN-ACT-004',
    department: "Men's",
    subDepartment: 'Activewear',
    itemClass: 'Tops',
    productImage: SKU_IMAGES['MEN-ACT-004'],
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
    sku: 'WOM-TOP-014',
    department: "Women's",
    subDepartment: 'Tops',
    itemClass: 'Basics',
    productImage: SKU_IMAGES['WOM-TOP-014'],
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
    productName: 'Seasonal Rain Jacket',
    sku: 'SEA-JKT-004',
    department: 'Seasonal',
    subDepartment: 'Outerwear',
    itemClass: 'Jackets',
    productImage: SKU_IMAGES['SEA-JKT-004'],
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
    recommendedAction: 'Move 60 units from BOH Rail S5, Bay 1 to Seasonal Promo Table. Same-day SLA.',
    opportunityExplanation: 'Shelf gap detected via AI image audit on Seasonal Promo Table. 60 units confirmed available in BOH. Immediate replenishment required.',
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
    productName: 'Slim Fit Denim — Dark Wash',
    sku: 'MEN-DNM-003',
    department: "Men's",
    subDepartment: 'Bottoms',
    itemClass: 'Denim',
    productImage: SKU_IMAGES['MEN-DNM-003'],
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

export type OpportunityStatus =
  | 'open'
  | 'in_progress'
  | 'pending_approval'
  | 'approved'
  | 'actioned'
  | 'closed'
  | 'rejected'
  | 'unresolved';

export type OpportunityType = 'top_performing' | 'emerging' | 'at_risk';

export type FulfillmentPath =
  | 'dc_allocation'
  | 'store_transfer'
  | 'combined'
  | 'escalate'
  | 'no_action';

export type ReasonCode =
  | 'high_velocity'
  | 'emerging_trend'
  | 'low_stock'
  | 'safety_stock_breach'
  | 'forecast_uplift'
  | 'promotional'
  | 'seasonal'
  | 'rebalance'
  | 'other';

export interface StoreMeta {
  storeId: string;
  storeName: string;
  region: string;
  cluster: string;
  allocationCycle: string;
  lastRefreshed: string;
}

export interface ProductOpportunity {
  id: string;
  storeId: string;
  storeName: string;
  region: string;
  productImage: string;
  productName: string;
  sku: string;
  category: string;
  opportunityType: OpportunityType;
  opportunityValue: number;

  hoAllocationId: string;
  allocationCycle: string;
  allocationDate: string;
  allocatorName: string;
  allocationReleaseDate: string;
  currentHoAllocationQty: number;
  receivedQty: number;
  inTransitQty: number;
  pendingAllocationQty: number;
  allocationStatus: string;
  allocationVersion: number;
  allocationReason: string;

  recommendedAllocationQty: number;
  allocationGap: number;
  currentStoreStock: number;
  requiredQty: number;
  dcAvailableQty: number;
  transferAvailableQty: number;

  salesLast7Days: number;
  salesLast30Days: number;
  sellThroughPct: number;
  forecastDemand: number;
  safetyStock: number;
  stockoutRisk: 'high' | 'medium' | 'low';
  comparableStorePerformance: string;

  status: OpportunityStatus;
  currentOwner: string;
  currentStage: string;
  lastUpdated: string;

  flagReason: string;
  suggestedAction: string;
  recommendedFulfillmentPath: FulfillmentPath;

  lostSalesRisk: number;
  expectedCoverageImprovement: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AllocationRequest {
  requestId: string;
  opportunityId: string;
  storeId: string;
  storeName: string;
  region: string;
  productImage: string;
  productName: string;
  sku: string;
  category: string;
  opportunityType: OpportunityType;
  opportunityValue: number;

  currentHoAllocationQty: number;
  recommendedAllocationQty: number;
  editedAllocationQty: number;
  approvedAllocationQty: number;

  fulfillmentSource: FulfillmentPath;
  sourceStoreId?: string;
  sourceStoreName?: string;
  requiredByDate: string;
  reasonCode: ReasonCode;
  comment: string;

  diffVsRecommendation: number;
  allocationDelta: number;

  submittedBy: string;
  submittedDate: string;
  slaDueDate: string;
  status: OpportunityStatus;

  approver?: string;
  approvalDate?: string;
  rejectionReason?: string;
  approverComment?: string;

  dcAvailableQty: number;
  transferAvailableQty: number;
  salesLast7Days: number;
  salesLast30Days: number;
  forecastDemand: number;
  currentStoreStock: number;
  inTransitQty: number;
  receivedQty: number;
}

export interface ExecutionRecord {
  executionId: string;
  requestId: string;
  storeId: string;
  storeName: string;
  productImage: string;
  productName: string;
  sku: string;
  fulfillmentPath: FulfillmentPath;
  approvedAllocationQty: number;
  executionStatus: OpportunityStatus;
  downstreamSystemStatus: string;
  sentToExecutionDate: string;
  executionConfirmationDate: string;
  currentOwner: string;
  currentStage: string;
  slaDueDate: string;
  status: OpportunityStatus;
}

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  top_performing: 'Top Performing',
  emerging: 'Emerging',
  at_risk: 'At-Risk',
};

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  actioned: 'Actioned',
  closed: 'Closed',
  rejected: 'Rejected',
  unresolved: 'Unresolved',
};

export const FULFILLMENT_LABELS: Record<FulfillmentPath, string> = {
  dc_allocation: 'DC Allocation',
  store_transfer: 'Store-to-Store Transfer',
  combined: 'DC + Store Transfer',
  escalate: 'Escalate to Allocator',
  no_action: 'No Action',
};

export const REASON_CODE_LABELS: Record<ReasonCode, string> = {
  high_velocity: 'High Velocity',
  emerging_trend: 'Emerging Trend',
  low_stock: 'Low Stock',
  safety_stock_breach: 'Safety Stock Breach',
  forecast_uplift: 'Forecast Uplift',
  promotional: 'Promotional',
  seasonal: 'Seasonal',
  rebalance: 'Rebalance',
  other: 'Other',
};

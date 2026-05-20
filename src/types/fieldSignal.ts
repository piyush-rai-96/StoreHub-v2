export type SignalType =
  | 'local_event'
  | 'weather'
  | 'competitor_activity'
  | 'road_closure'
  | 'school_community_event'
  | 'staffing_impact'
  | 'other';

export type ExpectedImpact =
  | 'demand_increase'
  | 'demand_drop'
  | 'inventory_risk'
  | 'staffing_impact'
  | 'operational_disruption'
  | 'awareness_only';

export type SignalStatus = 'new' | 'reviewed' | 'closed';

export interface FieldSignalAttachment {
  id: string;
  name: string;
  url?: string;
}

export interface FieldSignalActivity {
  id: string;
  fieldSignalId: string;
  action: string;
  actorUserId: string;
  actorName: string;
  timestamp: string;
  notes?: string;
}

export interface FieldSignal {
  id: string;
  signalType: SignalType;
  title: string;
  description: string;
  storeId: string;
  storeName?: string;
  districtId?: string;
  districtName?: string;
  department?: string;
  impactStartDate: string;
  impactEndDate: string;
  expectedImpact: ExpectedImpact;
  status: SignalStatus;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  reviewedByUserId?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  closedByUserId?: string;
  closedByName?: string;
  closedAt?: string;
  originalThreadId?: string;
  originalMessageId?: string;
  linkedTaskId?: string;
  linkedBroadcastId?: string;
  attachments?: FieldSignalAttachment[];
  activityLog: FieldSignalActivity[];
}

export interface LogSignalFormState {
  signalType: SignalType | '';
  title: string;
  description: string;
  impactStartDate: string;
  impactEndDate: string;
  expectedImpact: ExpectedImpact | '';
  storeId: string;
  storeName: string;
  department: string;
}

export const EMPTY_LOG_SIGNAL_FORM: LogSignalFormState = {
  signalType: '',
  title: '',
  description: '',
  impactStartDate: '',
  impactEndDate: '',
  expectedImpact: '',
  storeId: '',
  storeName: '',
  department: '',
};

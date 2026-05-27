export type SignalType =
  | 'local_event'
  | 'major_sports_event'
  | 'entertainment_event'
  | 'instore_event'
  | 'community_gathering'
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

export type LocationScope =
  | 'stores'
  | 'zip_code'
  | 'city'
  | 'state';

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
  locationScope?: LocationScope;
  storeId?: string;
  storeName?: string;
  affectedStoreIds?: string[];
  districtId?: string;
  districtName?: string;
  zipCode?: string;
  city?: string;
  state?: string;
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

export type FieldSignalNotifyScope = 'all' | 'specific';

export interface LogSignalFormState {
  signalType: SignalType | '';
  title: string;
  description: string;
  impactStartDate: string;
  impactEndDate: string;
  expectedImpact: ExpectedImpact | '';
  locationScope: LocationScope;
  storeId: string;
  storeName: string;
  affectedStoreIds: string[];
  districtId: string;
  districtName: string;
  zipCode: string;
  city: string;
  state: string;
  department: string;
  notifyScope: FieldSignalNotifyScope;
  notifyRecipientIds: string[];
}

export const EMPTY_LOG_SIGNAL_FORM: LogSignalFormState = {
  signalType: '',
  title: '',
  description: '',
  impactStartDate: '',
  impactEndDate: '',
  expectedImpact: '',
  locationScope: 'stores',
  storeId: '',
  storeName: '',
  affectedStoreIds: [],
  districtId: '',
  districtName: '',
  zipCode: '',
  city: '',
  state: '',
  department: '',
  notifyScope: 'all',
  notifyRecipientIds: [],
};

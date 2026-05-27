// Store Operations Hub Type Definitions

// User role types for Store Operations
export type StoreOpsRole = 'SM' | 'DM' | 'HQ';

// Scope types
export type ScopeType = 'store' | 'district' | 'region';

// System states
export type SystemState = 'HIGH_ACTIVITY' | 'LOW_ACTIVITY' | 'ALL_CLEAR';

// Priority levels
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Task types
export type TaskType = 'AI' | 'ASSIGNED' | 'FOLLOW_UP';

// Broadcast category
export type BroadcastCategory = 'Safety' | 'Operations' | 'Audit' | 'Merchandising' | 'HR' | 'General' | 'Marketing' | 'Visual Merchandising';

// User context
export interface UserContext {
  user_id: string;
  role: StoreOpsRole;
  assigned_scope: {
    type: ScopeType;
    id: string;
  };
  last_login_timestamp: string;
  last_data_refresh_timestamp: string;
}

// User profile
export interface UserProfile {
  name: string;
  role: StoreOpsRole;
  avatar?: string;
}

// Daily brief item
export interface DailyBriefItem {
  id: string;
  theme: 'Performance' | 'Risk' | 'Compliance' | 'Customer';
  message: string;
  icon?: string;
  timestamp?: string;
}

// Deep link payload
export interface DeepLinkPayload {
  target_module: string;
  context_payload: {
    store_id?: string;
    sku_id?: string;
    shipment_id?: string;
    task_id?: string;
    [key: string]: string | undefined;
  };
}

// Action item (task)
export interface ActionItem {
  id: string;
  title: string;
  type: TaskType;
  source_module: string;
  priority_score: number;
  due_time: string;
  status: 'pending' | 'in_progress' | 'overdue' | 'completed';
  context?: string;
  deep_link: DeepLinkPayload;
  isNew?: boolean;
}

// Broadcast message
export interface BroadcastMessage {
  id: string;
  priority: Priority;
  title: string;
  description: string;
  sender: string;
  senderRole?: string;
  timestamp: string;
  expiry?: string;
  entity?: string;
  category: BroadcastCategory;
  isRead: boolean;
  isAcknowledged: boolean;
  requiresAcknowledgement: boolean;
  attachments?: number;
}

// Critical broadcast for overlay
export interface CriticalBroadcast {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
  impactCount?: number;
  impactLabel?: string;
  context?: string;
}

// Home screen state
export interface HomeScreenState {
  userProfile: UserProfile | null;
  scopeMapping: {
    type: ScopeType;
    id: string;
    name: string;
  } | null;
  lastLoginTimestamp: string | null;
  lastRefreshTimestamp: string | null;
  systemState: SystemState;
  dailyBrief: DailyBriefItem[];
  actionItems: ActionItem[];
  broadcasts: BroadcastMessage[];
  criticalBroadcast: CriticalBroadcast | null;
  isLoading: boolean;
  error: string | null;
}

// Filter options for broadcasts
export interface BroadcastFilters {
  showAll: boolean;
  showUnread: boolean;
  priority: Priority | 'ALL';
  category: BroadcastCategory | 'ALL';
}

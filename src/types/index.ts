/** Ask Alan (AICopilot) — event detail + deep-link presets */
export type AskAlanSkillMode = 'knowledge' | 'analytics' | 'pog' | 'actions';
export type AskAlanPreset = 'district-gaps' | 'voc-messy-aisles';

export interface StorehubOpenAlanDetail {
  preset?: AskAlanPreset;
  /** Heatmap / dimension drill — same behavior as former ?mode=&context=audit-…&store=… URL */
  heatmapAudit?: {
    skill: AskAlanSkillMode;
    context: string;
    storeNumber: string;
    storeName: string;
    score: number;
  };
  skill?: AskAlanSkillMode;
  initialMessage?: string;
  autoSend?: boolean;
}

// User role types
export type UserRole = 'DM' | 'SM' | 'HQ' | 'ADMIN';

// User status
export type UserStatus = 'active' | 'invited';

// Screen access identifiers — map to sidebar sub-module IDs
export type ScreenAccess =
  | 'home'
  | 'district_intelligence'
  | 'store_deep_dive'
  | 'master_pog_management'
  | 'pog_rule_management'
  | 'pog_localization_engine'
  | 'ai_copilot'
  | 'operations_queue'
  | 'communications'
  | 'user_access_management'
  | 'inv_product_execution'
  | 'inv_product_opportunities'
  | 'inv_approvals_execution';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accessRoutes: ScreenAccess[];
  status: UserStatus;
  district?: string;
  districtId?: string;
  store?: string;
  storeId?: string;
  region?: string;
  avatar?: string;
}

// Auth context type
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  allUsers: User[];
  login: (email: string, password: string, dryRun?: boolean) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  removeUser: (userId: string) => void;
}

// Login form data
export interface LoginFormData {
  email: string;
  password: string;
}

// Role display labels
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Platform Administrator',
  DM: 'District Manager',
  SM: 'Store Manager',
  HQ: 'HQ Merchandising',
};

// Route paths - centralized for easy management
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  PORTAL: '/portal',
  HOME: '/home',
  MASTER_POG: '/planogram/master-pog',
  // Store Operations Hub
  STORE_OPS_HOME: '/store-operations/home',
} as const;

// Map screen access IDs to actual route paths
export const SCREEN_TO_PATH: Record<ScreenAccess, string> = {
  home: '/store-operations/home',
  district_intelligence: '/store-operations/district-intelligence',
  store_deep_dive: '/store-operations/store-deep-dive',
  master_pog_management: '/planogram/master-pog',
  pog_rule_management: '/planogram/rule-management',
  pog_localization_engine: '/planogram/localization-engine',
  ai_copilot: '/command-center/ai-copilot',
  operations_queue: '/command-center/operations-queue',
  communications: '/command-center/communications',
  user_access_management: '/app-config/user-access',
  inv_product_execution: '/inventory-management/product-execution',
  inv_product_opportunities: '/inventory-management/product-opportunities',
  inv_approvals_execution: '/inventory-management/approvals-and-execution',
};

// Get the default landing route for a user based on their access
export const getDefaultRouteForAccess = (accessRoutes?: ScreenAccess[]): string => {
  if (!accessRoutes || accessRoutes.length === 0) return '/store-operations/home';
  if (accessRoutes.includes('home')) return '/store-operations/home';
  return SCREEN_TO_PATH[accessRoutes[0]];
};

// Default access routes per role
export const ROLE_ACCESS: Record<UserRole, ScreenAccess[]> = {
  ADMIN: [
    'home', 'district_intelligence', 'store_deep_dive',
    'master_pog_management', 'pog_rule_management', 'pog_localization_engine',
    'ai_copilot', 'operations_queue', 'communications', 'user_access_management',
    'inv_product_execution', 'inv_product_opportunities', 'inv_approvals_execution',
  ],
  DM: [
    'home', 'district_intelligence', 'store_deep_dive',
    'master_pog_management', 'pog_rule_management', 'pog_localization_engine',
    'ai_copilot', 'operations_queue', 'communications',
    'inv_product_execution', 'inv_product_opportunities', 'inv_approvals_execution',
  ],
  SM: [
    'store_deep_dive',
    'ai_copilot', 'operations_queue', 'communications',
    'inv_product_execution', 'inv_product_opportunities', 'inv_approvals_execution',
  ],
  HQ: [
    'home', 'district_intelligence',
    'master_pog_management', 'pog_rule_management', 'pog_localization_engine',
    'ai_copilot', 'operations_queue', 'communications',
    'inv_product_opportunities', 'inv_approvals_execution',
  ],
};

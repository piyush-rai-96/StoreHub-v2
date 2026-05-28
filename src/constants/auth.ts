import { User, ROLE_ACCESS } from '../types';

// Authentication constants
export const AUTH_STORAGE_KEY = 'ia_storehub_auth';
export const USERS_STORAGE_KEY = 'ia_storehub_users';

// Predefined demo users with credentials
export interface UserCredential {
  email: string;
  password: string;
  user: User;
}

export const DEFAULT_USERS: UserCredential[] = [
  {
    email: 'admin_dummy@impactanalytics.co',
    password: 'Password@123',
    user: {
      id: 'user-001',
      email: 'admin_dummy@impactanalytics.co',
      name: 'Clarke T',
      role: 'ADMIN',
      accessRoutes: ROLE_ACCESS.ADMIN,
      status: 'active',
      region: 'Global',
    },
  },
  {
    email: 'john.doe.dm@impactanalytics.co',
    password: 'Password@123',
    user: {
      id: 'user-002',
      email: 'john.doe.dm@impactanalytics.co',
      name: 'John Doe',
      role: 'DM',
      accessRoutes: ROLE_ACCESS.DM,
      status: 'active',
      district: 'District 14 - Tennessee',
      districtId: 'D14',
    },
  },
  {
    email: 'marco.rossi.sm@impactanalytics.co',
    password: 'Password@123',
    user: {
      id: 'user-003',
      email: 'marco.rossi.sm@impactanalytics.co',
      name: 'Marco Rossi',
      role: 'SM',
      accessRoutes: ROLE_ACCESS.SM,
      status: 'active',
      store: 'Nashville Flagship',
      storeId: 'STR-001',
    },
  },
  {
    email: 'elena.fischer.hq@impactanalytics.co',
    password: 'Password@123',
    user: {
      id: 'user-004',
      email: 'elena.fischer.hq@impactanalytics.co',
      name: 'Elena Fischer',
      role: 'HQ',
      accessRoutes: ROLE_ACCESS.HQ,
      status: 'active',
      region: 'North America',
    },
  },
];

// Error messages - centralized for consistency
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
} as const;

import React, { useState, useEffect, useRef } from 'react';
import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Check from '@mui/icons-material/Check';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import MailOutlined from '@mui/icons-material/MailOutlined';
import WorkOutlined from '@mui/icons-material/WorkOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import RotateLeftOutlined from '@mui/icons-material/RotateLeftOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import {
  Button, Badge, Card,
  Toast, Avatar, EmptyState, Tooltip,
  Input, Switch, Checkbox, Modal, Select,
} from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, ROLE_LABELS, ROLE_ACCESS, ScreenAccess } from '../types';
import './UserAccessManagement.css';

const SCREEN_LABELS: Record<ScreenAccess, string> = {
  home: 'Dashboard',
  district_intelligence: 'District Intelligence',
  store_deep_dive: 'Store Deep Dive',
  master_pog_management: 'Master POG Management',
  pog_rule_management: 'POG Rule Management',
  pog_localization_engine: 'POG Localization Engine',
  ai_copilot: 'Ask Alan',
  operations_queue: 'Operations Queue',
  communications: 'Communications',
  user_access_management: 'User Access Management',
  inv_product_execution: 'Product Execution',
  inv_product_opportunities: 'Product Opportunities',
  inv_approvals_execution: 'Approvals & Execution',
};

interface ScreenMeta { label: string; icon: React.ReactNode; module: string; color: string; }
const SCREEN_META: Record<ScreenAccess, ScreenMeta> = {
  home:                    { label: 'Dashboard',              icon: <HomeOutlined sx={{ fontSize: 15 }}/>,            module: 'Store Operations',     color: '#2563eb' },
  district_intelligence:   { label: 'District Intelligence',  icon: <PlaceOutlinedIcon sx={{ fontSize: 15 }}/>,       module: 'Store Operations',     color: '#2563eb' },
  store_deep_dive:         { label: 'Store Deep Dive',        icon: <StoreOutlined sx={{ fontSize: 15 }}/>,           module: 'Store Operations',     color: '#2563eb' },
  master_pog_management:   { label: 'Master POG Management',  icon: <LayersOutlined sx={{ fontSize: 15 }}/>,          module: 'Planogram Intelligence', color: '#7c3aed' },
  pog_rule_management:     { label: 'POG Rule Management',    icon: <LayersOutlined sx={{ fontSize: 15 }}/>,          module: 'Planogram Intelligence', color: '#7c3aed' },
  pog_localization_engine: { label: 'POG Localization Engine',icon: <AutoAwesomeOutlined sx={{ fontSize: 15 }}/>,     module: 'Planogram Intelligence', color: '#7c3aed' },
  inv_product_execution:   { label: 'Product Execution',      icon: <AssignmentOutlined sx={{ fontSize: 15 }}/>,      module: 'Inventory Management', color: '#0891b2' },
  inv_product_opportunities:{ label: 'Product Opportunities', icon: <TrendingUpOutlined sx={{ fontSize: 15 }}/>,      module: 'Inventory Management', color: '#0891b2' },
  inv_approvals_execution: { label: 'Approvals & Execution',  icon: <GavelOutlined sx={{ fontSize: 15 }}/>,           module: 'Inventory Management', color: '#0891b2' },
  operations_queue:        { label: 'Operations Queue',       icon: <AssignmentOutlined sx={{ fontSize: 15 }}/>,      module: 'Command Center',       color: '#059669' },
  communications:          { label: 'Communications',         icon: <ForumOutlined sx={{ fontSize: 15 }}/>,           module: 'Command Center',       color: '#059669' },
  ai_copilot:              { label: 'Ask Alan',               icon: <AutoAwesomeOutlined sx={{ fontSize: 15 }}/>,     module: 'Command Center',       color: '#059669' },
  user_access_management:  { label: 'User Access Management', icon: <ManageAccountsOutlined sx={{ fontSize: 15 }}/>,  module: 'Administration',       color: '#b45309' },
};

const MODULE_ORDER = ['Store Operations', 'Inventory Management', 'Planogram Intelligence', 'Command Center', 'Administration'];

const MODULE_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'Store Operations':      { bg: '#fafbfc', border: '#eaecef', text: '#667085', dot: '#2563eb' },
  'Inventory Management':  { bg: '#fafbfc', border: '#eaecef', text: '#667085', dot: '#0891b2' },
  'Planogram Intelligence':{ bg: '#fafbfc', border: '#eaecef', text: '#667085', dot: '#7c3aed' },
  'Command Center':        { bg: '#fafbfc', border: '#eaecef', text: '#667085', dot: '#059669' },
  'Administration':        { bg: '#fafbfc', border: '#eaecef', text: '#667085', dot: '#b45309' },
};

const SCOPE_OPTIONS: Record<UserRole, { label: string; options: string[] }> = {
  SM: { label: 'Assign Store', options: ['Store #2341 - Nashville', 'Store #1142 - Memphis', 'Store #3021 - Knoxville', 'Store #1587 - Chattanooga'] },
  DM: { label: 'Assign District', options: ['District 14 - Tennessee', 'District 08 - Georgia', 'District 22 - Carolina', 'District 11 - Florida'] },
  HQ: { label: 'Assign Region', options: ['North America', 'Southeast', 'Midwest', 'West Coast'] },
  ADMIN: { label: 'Scope', options: ['Global (Full Access)'] },
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SM: 'Store-level operations & inventory',
  DM: 'District oversight & performance',
  HQ: 'Enterprise merchandising & strategy',
  ADMIN: 'Full platform access & configuration',
};

export const UserAccessManagement: React.FC = () => {
  const { allUsers, addUser, removeUser, updateUser, user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  // Per-user live access edits (keyed by user.id → current accessRoutes draft)
  const [accessDrafts, setAccessDrafts] = useState<Record<string, ScreenAccess[]>>({});
  const [accessSaved, setAccessSaved] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const removedName = confirmDelete.name;
    removeUser(confirmDelete.id);
    setConfirmDelete(null);
    setExpandedRow(prev => prev === confirmDelete.id ? null : prev);
    setDeleteSuccess(removedName);
    setTimeout(() => setDeleteSuccess(null), 2800);
  };

  // ── Access edit helpers ─────────────────────────────────────────────────
  // Administration module is always locked — admins can never lose platform config access
  const LOCKED_MODULES = new Set(['Administration']);
  const LOCKED_SCREENS = new Set<ScreenAccess>(['user_access_management']);

  const getDraft = (userId: string, base: ScreenAccess[]): ScreenAccess[] =>
    accessDrafts[userId] ?? [...base];

  const toggleScreen = (userId: string, base: ScreenAccess[], screen: ScreenAccess) => {
    if (LOCKED_SCREENS.has(screen)) return;
    const draft = getDraft(userId, base);
    const next = draft.includes(screen) ? draft.filter(s => s !== screen) : [...draft, screen];
    setAccessDrafts(prev => ({ ...prev, [userId]: next }));
  };

  const toggleModule = (userId: string, base: ScreenAccess[], moduleName: string) => {
    if (LOCKED_MODULES.has(moduleName)) return;
    const draft = getDraft(userId, base);
    const moduleScreens = (Object.keys(SCREEN_META) as ScreenAccess[]).filter(
      s => SCREEN_META[s].module === moduleName && !LOCKED_SCREENS.has(s)
    );
    const allOn = moduleScreens.every(s => draft.includes(s));
    let next: ScreenAccess[];
    if (allOn) {
      next = draft.filter(s => !moduleScreens.includes(s));
    } else {
      next = [...new Set([...draft, ...moduleScreens])];
    }
    setAccessDrafts(prev => ({ ...prev, [userId]: next }));
  };

  const saveAccessDraft = (userId: string) => {
    const draft = accessDrafts[userId];
    if (!draft) return;
    // Enforce: ADMIN always keeps user_access_management regardless of draft
    const targetUser = allUsers.find(u => u.id === userId);
    let finalRoutes = [...draft];
    if (targetUser?.role === 'ADMIN' && !finalRoutes.includes('user_access_management')) {
      finalRoutes = [...finalRoutes, 'user_access_management'];
    }
    updateUser(userId, { accessRoutes: finalRoutes });
    setAccessSaved(userId);
    setTimeout(() => setAccessSaved(null), 2500);
  };

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('SM');
  const [newScope, setNewScope] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; scope?: string }>({});

  // Close role dropdown when clicking outside it
  useEffect(() => {
    if (!roleMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [roleMenuOpen]);

  // Scope — Impact UI Select state
  const [scopeIsOpen, setScopeIsOpen] = useState(false);
  const [scopeCurrentOptions, setScopeCurrentOptions] = useState<{ label: string; value: string }[]>(
    () => SCOPE_OPTIONS['SM'].options.map(o => ({ label: o, value: o }))
  );
  const [scopeSelectedOptions, setScopeSelectedOptions] = useState<{ label: string; value: string } | null>(null);

  const handleScopeChange = (options: { label: string; value: string }[] | { label: string; value: string } | null) => {
    const single = Array.isArray(options) ? (options[0] ?? null) : options ?? null;
    setScopeSelectedOptions(single);
    const val = single?.value || '';
    setNewScope(val);
    if (val) setFieldErrors(prev => ({ ...prev, scope: undefined }));
  };
  const [customizeAccess, setCustomizeAccess] = useState(false);
  const [customAccess, setCustomAccess] = useState<ScreenAccess[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ROLE_LABELS[u.role].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserScope = (u: User) => {
    if (u.role === 'ADMIN') return 'Global';
    if (u.store) return u.store;
    if (u.district) return u.district;
    if (u.region) return u.region;
    return '—';
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewRole('SM');
    setNewScope('');
    setFieldErrors({});
    setRoleMenuOpen(false);
    setScopeIsOpen(false);
    setScopeCurrentOptions(SCOPE_OPTIONS['SM'].options.map(o => ({ label: o, value: o })));
    setScopeSelectedOptions(null);
    setCustomizeAccess(false);
    setCustomAccess([]);
    setCurrentStep(1);
  };

  const effectiveAccess: ScreenAccess[] = customizeAccess && customAccess.length > 0 ? customAccess : ROLE_ACCESS[newRole];

  // ── Step completion state (used by step indicator) ──

  const toggleCustomScreen = (screen: ScreenAccess) => {
    setCustomAccess(prev =>
      prev.includes(screen) ? prev.filter(s => s !== screen) : [...prev, screen]
    );
  };

  // Validate a specific step; writes fieldErrors and returns true/false
  const validateStep = (step: 1 | 2 | 3): boolean => {
    if (step === 1) {
      const errors: { name?: string; email?: string } = {};
      if (!newName.trim()) errors.name = 'Full name is required';
      if (!newEmail.trim()) errors.email = 'Email is required';
      else if (!EMAIL_REGEX.test(newEmail.trim())) errors.email = 'Enter a valid email address';
      else if (allUsers.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
        errors.email = 'A user with this email already exists';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...errors }));
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (newRole !== 'ADMIN' && !newScope) {
        setFieldErrors(prev => ({ ...prev, scope: 'Please select a scope assignment' }));
        return false;
      }
      return true;
    }
    // step === 3
    if (customizeAccess && customAccess.length === 0) return false;
    return effectiveAccess.length > 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 3) setCurrentStep((currentStep + 1) as 2 | 3);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as 1 | 2);
  };

  const handleCreateUser = () => {
    // Re-validate all steps before submitting
    if (!validateStep(1)) { setCurrentStep(1); return; }
    if (!validateStep(2)) { setCurrentStep(2); return; }
    if (!validateStep(3)) { setCurrentStep(3); return; }

    const user: User = {
      id: `user-${Date.now()}`,
      email: newEmail.trim(),
      name: newName.trim(),
      role: newRole,
      accessRoutes: effectiveAccess,
      status: 'invited',
      ...(newRole === 'SM' && { store: newScope, storeId: newScope.match(/#(\d+)/)?.[1] || '' }),
      ...(newRole === 'DM' && { district: newScope, districtId: newScope.match(/District (\d+)/)?.[1] ? `D${newScope.match(/District (\d+)/)?.[1]}` : '' }),
      ...(newRole === 'HQ' && { region: newScope }),
      ...(newRole === 'ADMIN' && { region: 'Global' }),
    };

    addUser(user);
    setShowCreateModal(false);
    resetForm();
    setInviteSuccess(user.name);
    setTimeout(() => setInviteSuccess(null), 4000);
  };

  const roleOptions: UserRole[] = ['SM', 'DM', 'HQ', 'ADMIN'];

  const statCounts = {
    total: allUsers.length,
    active: allUsers.filter(u => u.status === 'active').length,
    invited: allUsers.filter(u => u.status === 'invited').length,
    roles: [...new Set(allUsers.map(u => u.role))].length,
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="uam-page">
        <div className="page-loading">
          <div className="page-loading-spinner" />
          <p>Loading User Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="uam-page">
      {/* ── Header ── */}
      <div className="district-intel-header uam-di-header">
        <div className="header-left">
          <div className="header-title">
            <GppGoodOutlined sx={{ fontSize: 24 }}/>
            <h1>User Access Management</h1>
          </div>
          <div className="header-meta">
            <span className="district-badge">
              <SecurityOutlined sx={{ fontSize: 13 }}/>
              Team Directory
            </span>
            <span className="district-badge uam-meta-pill">
              <PersonOutlined sx={{ fontSize: 13 }}/>
              {statCounts.total} members
            </span>
            <span className="uam-meta-updated">Manage roles, scope &amp; platform access</span>
          </div>
        </div>
        <div className="uam-header-right">
          <Button variant="contained" size="medium" onClick={() => { resetForm(); setShowCreateModal(true); }} startIcon={<PersonAddAlt1Outlined sx={{ fontSize: 15 }}/>}>
            Create User
          </Button>
        </div>
      </div>

      {/* Success / delete toasts — Impact UI Toast */}
      <Toast
        isOpen={!!inviteSuccess}
        message={`Invitation sent successfully to ${inviteSuccess ?? ''}`}
        variant="success"
        position="top-right"
        autoHideDuration={4000}
        onClose={() => setInviteSuccess(null)}
      />
      <Toast
        isOpen={!!deleteSuccess}
        message={`${deleteSuccess ?? ''} was removed`}
        variant="error"
        position="top-right"
        autoHideDuration={2800}
        onClose={() => setDeleteSuccess(null)}
      />

      {/* ── Stats Strip ── */}
      <div className="uam-kpi-grid">
        <Card size="extraSmall" style={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
          <span className="uam-kpi-label">Total Users</span>
          <span className="uam-kpi-value">{statCounts.total}</span>
          <span className="uam-kpi-context">across all roles</span>
        </Card>
        <Card size="extraSmall" style={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
          <span className="uam-kpi-label">Active</span>
          <span className="uam-kpi-value">{statCounts.active}</span>
          <span className="uam-kpi-context">currently active</span>
        </Card>
        <Card size="extraSmall" style={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
          <span className="uam-kpi-label">Pending</span>
          <span className="uam-kpi-value">{statCounts.invited}</span>
          <span className="uam-kpi-context">invite not accepted</span>
        </Card>
        <Card size="extraSmall" style={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
          <span className="uam-kpi-label">Roles</span>
          <span className="uam-kpi-value">{statCounts.roles}</span>
          <span className="uam-kpi-context">distinct role types</span>
        </Card>
        <Card size="extraSmall" style={{ maxWidth: '100%', minHeight: 0, padding: '16px' }}>
          <span className="uam-kpi-label">Filtered</span>
          <span className="uam-kpi-value">{filteredUsers.length}</span>
          <span className="uam-kpi-context">matching search</span>
        </Card>
      </div>

      {/* ── Search toolbar ── */}
      <div className="uam-table-toolbar">
        <div className="search-filter uam-search-filter">
          <SearchOutlined sx={{ fontSize: 16 }}/>
          <input
            type="text"
            className="store-search-input"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="store-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <CloseOutlined sx={{ fontSize: 14 }}/>
            </button>
          )}
        </div>
        <span className="uam-toolbar-count">{filteredUsers.length} of {allUsers.length} users</span>
      </div>

      {/* ── Users Table ── */}
      <div className="uam-table-card uam-table-card--modern">
        <table className="uam-table wow-table">
          <thead>
            <tr>
              <th className="uam-th-name">User</th>
              <th>Role</th>
              <th>Scope</th>
              <th>Status</th>
              <th className="uam-th-screens">Access</th>
              <th className="uam-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <React.Fragment key={u.id}>
                <tr
                  className={`uam-row ${expandedRow === u.id ? 'uam-row--expanded' : ''}`}
                  onClick={() => setExpandedRow(expandedRow === u.id ? null : u.id)}
                >
                  <td className="uam-td-user">
                    <div className="uam-user-info">
                      <Avatar
                        type="withoutPicture"
                        size="small"
                        label={u.name}
                        className={`uam-avatar--${u.role.toLowerCase()}`}
                      />
                      <div className="uam-user-details">
                        <span className="uam-user-name">{u.name}</span>
                        <span className="uam-user-email">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge
                      label={ROLE_LABELS[u.role]}
                      variant="subtle"
                      color={u.role === 'SM' ? 'primary' : u.role === 'DM' ? 'info' : u.role === 'HQ' ? 'warning' : 'error'}
                      size="small"
                    />
                  </td>
                  <td>
                    <span className="uam-scope-text">{getUserScope(u)}</span>
                  </td>
                  <td>
                    <Badge
                      label={u.status === 'active' ? 'Active' : 'Invited'}
                      variant="subtle"
                      color={u.status === 'active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </td>
                  <td className="uam-td-screens">
                    <Badge
                      label={`${u.accessRoutes.length} screens`}
                      variant="subtle"
                      color="primary"
                      size="small"
                    />
                  </td>
                  <td className="uam-td-actions uam-td-actions--hover" onClick={e => e.stopPropagation()}>
                    {currentUser?.id === u.id ? (
                      <Tooltip title="You can't remove your own account" orientation="top">
                        <span className="uam-action-self">You</span>
                      </Tooltip>
                    ) : (
                      <Tooltip title={`Remove ${u.name}`} orientation="top">
                        <Button
                          variant="outlined"
                          size="small"
                          className="uam-action-delete"
                          onClick={() => setConfirmDelete(u)}
                          aria-label={`Remove ${u.name}`}
                        >
                          <DeleteOutlined sx={{ fontSize: 14 }}/>
                        </Button>
                      </Tooltip>
                    )}
                  </td>
                </tr>
                {/* Expanded detail row */}
                {expandedRow === u.id && (() => {
                  const draft = getDraft(u.id, u.accessRoutes);
                  // Admin can edit anyone's access (including their own), except the locked Administration module
                  const canEdit = currentUser?.role === 'ADMIN';
                  const isDirty = !!accessDrafts[u.id];
                  const allScreens = Object.keys(SCREEN_META) as ScreenAccess[];
                  return (
                    <tr className="uam-expand-row">
                      <td colSpan={6}>
                        <div className="uam-expand-content uam-screen-access-panel">

                          {/* Header row */}
                          <div className="uam-sap-header">
                            <div className="uam-sap-header-left">
                              <div className="uam-sap-header-icon">
                                <GppGoodOutlined sx={{ fontSize: 16 }}/>
                              </div>
                              <div>
                                <div className="uam-sap-title">Screen Access</div>
                                <div className="uam-sap-subtitle">
                                  {canEdit ? 'Click a screen or module to grant or hide access' : 'Screens this user can access on the platform'}
                                </div>
                              </div>
                            </div>
                            <div className="uam-sap-header-right">
                              <span className="uam-sap-count">
                                {draft.length} <span>of</span> {allScreens.length} screens
                              </span>
                              {canEdit && isDirty && (
                                <button className="uam-save-access-btn" onClick={() => saveAccessDraft(u.id)}>
                                  <SaveOutlined sx={{ fontSize: 13 }}/> Save Changes
                                </button>
                              )}
                              {accessSaved === u.id && (
                                <span className="uam-access-saved-pill">
                                  <Check sx={{ fontSize: 12 }}/> Saved
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Module grid */}
                          <div className="uam-screen-access-modules">
                            {MODULE_ORDER.map(module => {
                              // Administration is exclusively for ADMIN role — never show/grant to others
                              if (module === 'Administration' && u.role !== 'ADMIN') return null;

                              const moduleScreens = allScreens.filter(s => SCREEN_META[s].module === module);
                              const activeInDraft = moduleScreens.filter(s => draft.includes(s));
                              const style = MODULE_STYLES[module];
                              const isLocked = LOCKED_MODULES.has(module);
                              const moduleOn = activeInDraft.length > 0;
                              return (
                                <div
                                  key={module}
                                  className={`uam-screen-module uam-screen-module--premium${!moduleOn ? ' uam-screen-module--hidden' : ''}`}
                                  style={{ '--mod-color': style.dot } as React.CSSProperties}
                                >
                                  {/* Colored left accent */}
                                  <div className="uam-mod-accent" style={{ background: style.dot }}/>

                                  <div className="uam-screen-module-header">
                                    {/* Row 1: dot + name + count */}
                                    <div className="uam-mod-header-top">
                                      <span className="uam-screen-module-dot" style={{ background: style.dot }}/>
                                      <span className="uam-screen-module-name">{module}</span>
                                      <span className="uam-screen-module-count">{activeInDraft.length}/{moduleScreens.length}</span>
                                    </div>
                                    {/* Row 2: toggle or lock badge */}
                                    {canEdit && (
                                      <div className="uam-mod-header-action">
                                        {isLocked ? (
                                          <span className="uam-module-lock-badge" title="Administration access is required and cannot be removed">
                                            <LockOutlined sx={{ fontSize: 12 }}/> Always Required
                                          </span>
                                        ) : (
                                          <button
                                            className={`uam-module-toggle-btn${moduleOn ? '' : ' uam-module-toggle-btn--off'}`}
                                            title={moduleOn ? 'Hide entire module' : 'Show entire module'}
                                            onClick={() => toggleModule(u.id, u.accessRoutes, module)}
                                          >
                                            {moduleOn
                                              ? <><VisibilityOutlined sx={{ fontSize: 12 }}/><span>Module Visible</span></>
                                              : <><VisibilityOffOutlined sx={{ fontSize: 12 }}/><span>Module Hidden</span></>}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="uam-screen-module-items">
                                    {moduleScreens.map(screen => {
                                      const meta = SCREEN_META[screen];
                                      const on = draft.includes(screen);
                                      const isScreenLocked = LOCKED_SCREENS.has(screen);
                                      const clickable = canEdit && !isScreenLocked;
                                      return (
                                        <div
                                          key={screen}
                                          className={`uam-screen-item${on ? ' uam-screen-item--on' : ' uam-screen-item--hidden'}${clickable ? ' uam-screen-item--editable' : ''}${isScreenLocked ? ' uam-screen-item--locked' : ''}`}
                                          onClick={clickable ? () => toggleScreen(u.id, u.accessRoutes, screen) : undefined}
                                          title={isScreenLocked ? 'This screen access is required and cannot be removed' : clickable ? (on ? 'Click to hide' : 'Click to grant access') : undefined}
                                        >
                                          <span className="uam-screen-item-icon" style={{ color: on ? style.dot : undefined }}>{meta.icon}</span>
                                          <span className="uam-screen-item-label">{meta.label}</span>
                                          {isScreenLocked ? (
                                            <span className="uam-screen-item-lock"><LockOutlined sx={{ fontSize: 11 }}/></span>
                                          ) : canEdit ? (
                                            <span className={`uam-screen-item-vis${on ? ' uam-screen-item-vis--on' : ' uam-screen-item-vis--off'}`}>
                                              {on ? <VisibilityOutlined sx={{ fontSize: 12 }}/> : <VisibilityOffOutlined sx={{ fontSize: 12 }}/>}
                                            </span>
                                          ) : on ? (
                                            <Check sx={{ fontSize: 12, color: style.dot }}/>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })()}
              </React.Fragment>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="uam-empty">
                  <EmptyState
                    heading="No users found"
                    description={searchQuery ? 'No users match your search. Try adjusting the query.' : 'No users have been added yet.'}
                    emptyStateIcon={<SearchOutlined sx={{ fontSize: 40 }}/>}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========== Create User — Broadcast-style wizard ========== */}
      {showCreateModal && (
        <div className="uam-w-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="uam-w-modal" onClick={e => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="uam-w-header">
              <div className="uam-w-header-icon">
                {currentStep === 1 && <PersonAddAlt1Outlined sx={{ fontSize: 20 }}/>}
                {currentStep === 2 && <WorkOutlined sx={{ fontSize: 20 }}/>}
                {currentStep === 3 && <SecurityOutlined sx={{ fontSize: 20 }}/>}
              </div>
              <div className="uam-w-header-text">
                <h2>
                  {currentStep === 1 && 'Create New User'}
                  {currentStep === 2 && 'Role & Scope Assignment'}
                  {currentStep === 3 && 'Screen Access Control'}
                </h2>
                <p>
                  {currentStep === 1 && 'Enter the name and work email for the new team member'}
                  {currentStep === 2 && 'Define their role, reporting scope, and optionally customise access'}
                  {currentStep === 3 && 'Select which screens this user can access within the platform'}
                </p>
              </div>
              <button className="uam-w-close" onClick={() => setShowCreateModal(false)} aria-label="Close">
                <CloseOutlined sx={{ fontSize: 16 }}/>
              </button>
            </div>

            {/* ── Stepper ── */}
            <div className="uam-w-stepper">
              {([
                { n: 1, label: 'Identity' },
                { n: 2, label: 'Role & Scope' },
                { n: 3, label: 'Screen Access' },
              ] as { n: 1 | 2 | 3; label: string }[]).map((s, i, arr) => (
                <React.Fragment key={s.n}>
                  <div className={`uam-w-step${currentStep === s.n ? ' active' : ''}${currentStep > s.n ? ' done' : ''}`}
                       onClick={() => { if (s.n < currentStep) setCurrentStep(s.n); }}
                       style={{ cursor: s.n < currentStep ? 'pointer' : 'default' }}>
                    <div className="uam-w-step-dot">
                      {currentStep > s.n ? <Check sx={{ fontSize: 12 }}/> : s.n}
                    </div>
                    <span className="uam-w-step-label">{s.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`uam-w-step-connector${currentStep > s.n ? ' done' : ''}`}/>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── Body ── */}
            <div className="uam-w-body">
              <div className="uam-w-step-content">

                {/* Step 1: Identity */}
                {currentStep === 1 && (<>
                  <div className="uam-w-field-label">
                    Team member details
                    <span className="uam-w-field-hint">All fields marked <span className="uam-m-req">*</span> are required</span>
                  </div>
                  <div className="uam-m-fields-row">
                    <div className="uam-m-field">
                      <Input
                        label="Full Name"
                        isRequired
                        placeholder="Sarah Johnson"
                        value={newName}
                        isError={!!fieldErrors.name}
                        isHelperText={!!fieldErrors.name}
                        helperText={fieldErrors.name}
                        onChange={e => { setNewName(e.target.value); if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined })); }}
                        onBlur={() => { if (!newName.trim()) setFieldErrors(prev => ({ ...prev, name: 'Full name is required' })); }}
                        size="large"
                      />
                    </div>
                    <div className="uam-m-field">
                      <Input
                        label="Email Address"
                        isRequired
                        leftIcon={<MailOutlined sx={{ fontSize: 14 }}/>}
                        type="email"
                        placeholder="sarah.johnson@company.co"
                        value={newEmail}
                        isError={!!fieldErrors.email}
                        isHelperText={!!fieldErrors.email}
                        helperText={fieldErrors.email}
                        onChange={e => { setNewEmail(e.target.value); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                        onBlur={() => {
                          if (!newEmail.trim()) setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
                          else if (!EMAIL_REGEX.test(newEmail.trim())) setFieldErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
                        }}
                        size="large"
                      />
                    </div>
                  </div>
                </>)}

                {/* Step 2: Role & Scope */}
                {currentStep === 2 && (<>
                  <div className="uam-w-field-label">Assign a role and reporting scope</div>
                  <div className="uam-m-fields-row">
                    <div className="uam-m-field">
                      <label className="uam-dd-label">Role</label>
                      <div className="uam-role-wrap" ref={roleDropdownRef}>
                        <button
                          className={`uam-dd-trigger${roleMenuOpen ? ' uam-dd-trigger--open' : ''}`}
                          type="button"
                          onClick={() => { setRoleMenuOpen(o => !o); setScopeIsOpen(false); }}
                        >
                          <span className={`uam-dd-role-dot uam-dd-role-dot--${newRole.toLowerCase()}`} />
                          <span>{ROLE_LABELS[newRole]}</span>
                          <KeyboardArrowDown sx={{ fontSize: 14 }} className={`uam-dd-chevron${roleMenuOpen ? ' uam-dd-chevron--open' : ''}`}/>
                        </button>
                        {roleMenuOpen && (
                          <div className="uam-role-dropdown">
                            {roleOptions.map(r => (
                              <div
                                key={r}
                                className={`uam-role-option${r === newRole ? ' uam-role-option--active' : ''}`}
                                onMouseDown={e => {
                                  e.preventDefault(); // keep focus in modal
                                  setNewRole(r);
                                  setNewScope('');
                                  setRoleMenuOpen(false);
                                  setFieldErrors(prev => ({ ...prev, scope: undefined }));
                                  setScopeIsOpen(false);
                                  setScopeCurrentOptions(SCOPE_OPTIONS[r].options.map(o => ({ label: o, value: o })));
                                  setScopeSelectedOptions(null);
                                  setCustomizeAccess(false);
                                  setCustomAccess([]);
                                }}
                              >
                                <span className={`uam-dd-role-dot uam-dd-role-dot--${r.toLowerCase()}`} />
                                <div className="uam-role-option-text">
                                  <span className="uam-role-option-label">{ROLE_LABELS[r]}</span>
                                  <span className="uam-role-option-sub">{ROLE_DESCRIPTIONS[r]}</span>
                                </div>
                                {r === newRole && <Check sx={{ fontSize: 14, color: 'var(--ia-color-primary)' }}/>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="uam-m-field">
                      {newRole === 'ADMIN' ? (
                        <Input
                          label={SCOPE_OPTIONS[newRole].label}
                          value="Global (Full Access)"
                          isDisabled
                          leftIcon={<PlaceOutlined sx={{ fontSize: 14 }}/>}
                          size="large"
                        />
                      ) : (
                        <Select
                          label={SCOPE_OPTIONS[newRole].label}
                          isRequired
                          placeholder="Select assignment..."
                          isOpen={scopeIsOpen}
                          setIsOpen={setScopeIsOpen}
                          initialOptions={SCOPE_OPTIONS[newRole].options.map(o => ({ label: o, value: o }))}
                          currentOptions={scopeCurrentOptions}
                          setCurrentOptions={opts => setScopeCurrentOptions(Array.isArray(opts) ? opts : [])}
                          selectedOptions={scopeSelectedOptions}
                          setSelectedOptions={handleScopeChange as (opts: { label: string; value: string }[] | { label: string; value: string } | null) => void}
                          setIsSelectAll={() => {}}
                          isError={!!fieldErrors.scope}
                          helperText={fieldErrors.scope}
                          width="100%"
                          withPortal
                          isWithSearch
                        />
                      )}
                      {fieldErrors.scope && newRole !== 'ADMIN' && (
                        <span className="uam-m-field-error"><ErrorOutlined sx={{ fontSize: 12 }}/>{fieldErrors.scope}</span>
                      )}
                    </div>
                  </div>
                </>)}

                {/* Step 3: Screen Access */}
                {currentStep === 3 && (<>
                  <div className="uam-w-step3-header">
                    <div className="uam-w-field-label" style={{ margin: 0 }}>
                      Screen access permissions
                      <span className="uam-w-access-count">
                        {effectiveAccess.length} screen{effectiveAccess.length === 1 ? '' : 's'}{' '}
                        {customizeAccess ? 'selected' : 'auto-assigned'}
                      </span>
                    </div>
                    <Switch
                      value={customizeAccess}
                      rightLabel="Customize"
                      onChange={e => {
                        const on = e.target.checked;
                        setCustomizeAccess(on);
                        if (on) setCustomAccess([...ROLE_ACCESS[newRole]]);
                        else setCustomAccess([]);
                      }}
                    />
                  </div>

                  {customizeAccess && (
                    <div className="uam-m-customize-hint">
                      <span>Toggle any screen on or off. Auto-assigned defaults are pre-selected.</span>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setCustomAccess([...ROLE_ACCESS[newRole]])}
                        startIcon={<RotateLeftOutlined sx={{ fontSize: 12 }}/>}
                      >
                        Reset to defaults
                      </Button>
                    </div>
                  )}

                  <div className="uam-m-access-modules">
                    {MODULE_ORDER.map(module => {
                      const moduleScreens = (Object.keys(SCREEN_LABELS) as ScreenAccess[]).filter(
                        s => SCREEN_META[s]?.module === module
                      );
                      const visibleScreens = customizeAccess
                        ? moduleScreens
                        : moduleScreens.filter(s => ROLE_ACCESS[newRole].includes(s));
                      if (visibleScreens.length === 0) return null;
                      const style = MODULE_STYLES[module];
                      return (
                        <div key={module} className="uam-m-access-module-group">
                          <div className="uam-m-access-module-label">
                            <span className="uam-m-access-module-dot" style={{ background: style.dot }}/>
                            {module}
                          </div>
                          <div className="uam-m-access-grid">
                            {visibleScreens.map(screen => {
                              const isAutoAssigned = ROLE_ACCESS[newRole].includes(screen);
                              const isChecked = customizeAccess ? customAccess.includes(screen) : isAutoAssigned;
                              return customizeAccess ? (
                                <div key={screen} className={`uam-m-access-item uam-m-access-item--interactive ${isChecked ? 'uam-m-access-item--checked' : ''}`}>
                                  <Checkbox
                                    label={
                                      <span className="uam-m-access-checkbox-label">
                                        {SCREEN_LABELS[screen]}
                                        {isAutoAssigned && <span className="uam-m-access-default" title="Default for this role">default</span>}
                                      </span>
                                    }
                                    checked={isChecked}
                                    onChange={() => toggleCustomScreen(screen)}
                                  />
                                </div>
                              ) : (
                                <div key={screen} className="uam-m-access-item">
                                  <Check sx={{ fontSize: 12 }}/>
                                  <span>{SCREEN_LABELS[screen]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {customizeAccess && customAccess.length === 0 && (
                    <span className="uam-m-field-error"><ErrorOutlined sx={{ fontSize: 12 }}/>Select at least one screen</span>
                  )}
                </>)}

              </div>
            </div>

            {/* ── Footer ── */}
            <div className="uam-w-footer">
              <div className="uam-w-footer-meta">
                <PersonAddAlt1Outlined sx={{ fontSize: 13 }}/>
                Step {currentStep} of 3
                {currentStep === 2 && newRole && <> · <strong>{ROLE_LABELS[newRole]}</strong></>}
                {currentStep === 3 && <> · <strong>{effectiveAccess.length}</strong> screen{effectiveAccess.length === 1 ? '' : 's'}</>}
              </div>
              <div className="uam-w-footer-actions">
                {currentStep > 1 && (
                  <Button variant="outlined" onClick={goBack} startIcon={<KeyboardArrowLeft sx={{ fontSize: 14 }}/>}>
                    Back
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button variant="contained" onClick={goNext} endIcon={<KeyboardArrowRight sx={{ fontSize: 14 }}/>}>
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleCreateUser}
                    disabled={customizeAccess && customAccess.length === 0}
                    startIcon={<SendOutlined sx={{ fontSize: 13 }}/>}
                  >
                    Send Invite
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========== Confirm Delete — Impact UI Modal (small) ========== */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove user?"
        size="small"
        footerOptions={
          <div className="uam-confirm-actions">
            <Button variant="outlined" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="destructive"
              onClick={handleConfirmDelete}
              startIcon={<DeleteOutlined sx={{ fontSize: 13 }}/>}
            >
              Remove user
            </Button>
          </div>
        }
      >
        <div className="uam-confirm-body">
          <div className="uam-confirm-icon">
            <WarningAmberOutlined sx={{ fontSize: 28 }}/>
          </div>
          <p className="uam-confirm-text">
            You're about to permanently remove <strong>{confirmDelete?.name}</strong>
            {' '}({confirmDelete?.email}). They will lose access to StoreHub immediately.
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

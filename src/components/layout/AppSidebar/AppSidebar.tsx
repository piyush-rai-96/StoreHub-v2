import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar as ImpactSidebar } from 'impact-ui';
import ApartmentOutlined from '@mui/icons-material/ApartmentOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import RouterOutlined from '@mui/icons-material/RouterOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import PlaylistAddCheckOutlined from '@mui/icons-material/PlaylistAddCheckOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import WarehouseOutlined from '@mui/icons-material/WarehouseOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import { User, ScreenAccess, ROUTES } from '../../../types';
import './AppSidebar.css';

interface AppSidebarProps {
  user: User;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

interface SidebarRoute {
  value: string;
  label: string;
  icon: React.ReactNode;
  link?: string;
  children?: SidebarRoute[];
}

const SUB_MODULE_ACCESS: Record<string, ScreenAccess> = {
  'store-ops-home': 'home',
  'district-intelligence': 'district_intelligence',
  'store-deep-dive': 'store_deep_dive',
  'master-pog': 'master_pog_management',
  'rule-management': 'pog_rule_management',
  'localization-engine': 'pog_localization_engine',
  'operations-queue': 'operations_queue',
  communications: 'communications',
  'user-access': 'user_access_management',
  'product-execution': 'inv_product_execution',
  'product-opportunities': 'inv_product_opportunities',
  'approvals-execution': 'inv_approvals_execution',
};

const PORTAL_ONLY_ROUTES: SidebarRoute[] = [
  {
    value: 'portal',
    label: 'Home',
    icon: <HomeOutlined sx={{ fontSize: 20 }} />,
    link: ROUTES.PORTAL,
  },
];

const ALL_MODULES: SidebarRoute[] = [
  {
    value: 'store-operations',
    label: 'Store Operations Hub',
    icon: <ApartmentOutlined sx={{ fontSize: 20 }} />,
    children: [
      { value: 'store-ops-home', label: 'Dashboard', icon: <HomeOutlined sx={{ fontSize: 18 }} />, link: '/store-operations/home' },
      { value: 'district-intelligence', label: 'District Intelligence', icon: <PlaceOutlined sx={{ fontSize: 18 }} />, link: '/store-operations/district-intelligence' },
      { value: 'store-deep-dive', label: 'Store Deep Dive', icon: <StoreOutlined sx={{ fontSize: 18 }} />, link: '/store-operations/store-deep-dive' },
    ],
  },
  {
    value: 'inventory-management',
    label: 'Inventory Management',
    icon: <Inventory2Outlined sx={{ fontSize: 20 }} />,
    children: [
      { value: 'product-execution', label: 'Product Execution', icon: <AssignmentOutlined sx={{ fontSize: 18 }} />, link: '/inventory-management/product-execution' },
      { value: 'product-opportunities', label: 'Product Opportunities', icon: <TrendingUpOutlined sx={{ fontSize: 18 }} />, link: '/inventory-management/product-opportunities' },
      { value: 'approvals-execution', label: 'Approvals & Execution', icon: <GavelOutlined sx={{ fontSize: 18 }} />, link: '/inventory-management/approvals-and-execution' },
    ],
  },
  {
    value: 'planogram',
    label: 'Planogram Intelligence',
    icon: <LayersOutlined sx={{ fontSize: 20 }} />,
    children: [
      { value: 'master-pog', label: 'Master POG Management', icon: <WarehouseOutlined sx={{ fontSize: 18 }} />, link: '/planogram/master-pog' },
      { value: 'rule-management', label: 'POG Rule Management', icon: <AssignmentOutlined sx={{ fontSize: 18 }} />, link: '/planogram/rule-management' },
      { value: 'localization-engine', label: 'POG Localization Engine', icon: <AutoAwesomeOutlined sx={{ fontSize: 18 }} />, link: '/planogram/localization-engine' },
    ],
  },
  {
    value: 'command-center',
    label: 'Command Center',
    icon: <RouterOutlined sx={{ fontSize: 20 }} />,
    children: [
      { value: 'operations-queue', label: 'Operations Queue', icon: <PlaylistAddCheckOutlined sx={{ fontSize: 18 }} />, link: '/command-center/operations-queue' },
      { value: 'communications', label: 'Communications', icon: <ForumOutlined sx={{ fontSize: 18 }} />, link: '/command-center/communications' },
    ],
  },
  {
    value: 'app-config',
    label: 'Application Configuration',
    icon: <SettingsOutlined sx={{ fontSize: 20 }} />,
    children: [
      { value: 'user-access', label: 'User Access Management', icon: <GroupOutlined sx={{ fontSize: 18 }} />, link: '/app-config/user-access' },
    ],
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ user, isOpen, setIsOpen, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isPortal = location.pathname === ROUTES.PORTAL;

  const filteredRoutes = useMemo<SidebarRoute[]>(() => {
    if (isPortal) return PORTAL_ONLY_ROUTES;
    return ALL_MODULES
      .map(module => {
        if (!module.children) {
          const screenKey = SUB_MODULE_ACCESS[module.value];
          if (screenKey && !user.accessRoutes.includes(screenKey)) return null;
          return module;
        }
        const allowed = module.children.filter(sub => {
          const screenKey = SUB_MODULE_ACCESS[sub.value];
          return screenKey ? user.accessRoutes.includes(screenKey) : true;
        });
        return allowed.length > 0 ? { ...module, children: allowed } : null;
      })
      .filter((m): m is SidebarRoute => m !== null);
  }, [user.accessRoutes, isPortal]);

  const { parentActive, childActive } = useMemo(() => {
    if (isPortal) return { parentActive: 'portal', childActive: '' };
    for (const m of filteredRoutes) {
      if (m.link && location.pathname.startsWith(m.link)) {
        return { parentActive: m.value, childActive: '' };
      }
      for (const c of m.children || []) {
        if (c.link && location.pathname.startsWith(c.link)) {
          return { parentActive: m.value, childActive: c.value };
        }
      }
    }
    return { parentActive: '', childActive: '' };
  }, [filteredRoutes, location.pathname, isPortal]);

  const handleParentRouteChange = (item: SidebarRoute) => {
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleChildRouteChange = (_parent: SidebarRoute, child: SidebarRoute) => {
    if (child.link) {
      navigate(child.link);
    }
  };

  return (
    <div className="app-sidebar-host">
      <ImpactSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleClose={() => setIsOpen(!isOpen)}
        routes={filteredRoutes}
        actionRoutes={[]}
        parentActive={parentActive}
        childActive={childActive}
        handleParentRouteChange={handleParentRouteChange}
        handleChildRouteChange={handleChildRouteChange}
        handleLogOut={onLogout}
        isCloseWhenClickOutside={false}
        isMemoryRouter={false}
      />
    </div>
  );
};

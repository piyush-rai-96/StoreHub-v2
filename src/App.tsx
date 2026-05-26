import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExecutionTasksProvider } from './context/ExecutionTasksContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { Login } from './pages/Login';
// import { SignUp } from './pages/SignUp';
// import { ForgotPassword } from './pages/ForgotPassword';
import { Portal } from './pages/Portal';
import { MainLayout } from './components/layout/MainLayout/MainLayout';
import { MasterPOGManagement } from './pages/MasterPOGManagement';
import { POGRuleManagement } from './pages/POGRuleManagement';
import { POGLocalizationEngine } from './pages/POGLocalizationEngine';
import { StoreOpsHome } from './pages/StoreOpsHome';
import { DistrictIntelligence } from './pages/DistrictIntelligence';
import { StoreCenter as StoreDeepDive } from './pages/StoreCenter';
import { TaskCenter } from './pages/TaskCenter';
import { MessageCenter } from './pages/MessageCenter';
import { UserAccessManagement } from './pages/UserAccessManagement';
import { ProductOpportunitiesPage } from './pages/inventoryManagement/productOpportunities/ProductOpportunitiesPage';
import { AllocationWorkflowPage } from './pages/inventoryManagement/productOpportunities/AllocationWorkflowPage';
import { ApprovalsAndExecutionPage } from './pages/inventoryManagement/productOpportunities/ApprovalsAndExecutionPage';
import { ProductExecutionList } from './pages/inventoryManagement/productExecution/ProductExecutionList';
import { ProductExecutionDetail } from './pages/inventoryManagement/productExecution/ProductExecutionDetail';
import { ROUTES } from './types';
import './App.css';

/**
 * Main App Component
 * Sets up routing and authentication context
 * 
 * Route Structure:
 * - / → Redirects to /login
 * - /login → Public route (Login page)
 * - /signup → Public route (Signup page)
 * - /forgot-password → Public route (Forgot Password page)
 * - /home → Protected route with MainLayout
 * - /planogram/master-pog → Protected route (Master POG Management)
 */
function App() {
  return (
    <AuthProvider>
      <ExecutionTasksProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTES.PORTAL} replace />} />
          <Route path={ROUTES.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />
          {/* Portal landing — protected, inside MainLayout for header+sidebar */}
          {/* <Route path={ROUTES.SIGNUP} element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<PublicRoute><ForgotPassword /></PublicRoute>} /> */}
          
          {/* Protected routes with MainLayout */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path={ROUTES.PORTAL} element={<Portal />} />
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.STORE_OPS_HOME} replace />} />
            <Route path={ROUTES.MASTER_POG} element={<MasterPOGManagement />} />
            <Route path="/planogram/rule-management" element={<POGRuleManagement />} />
            <Route path="/planogram/localization-engine" element={<POGLocalizationEngine />} />
            <Route path="/planogram/store-execution" element={<Navigate to="/command-center/operations-queue" replace />} />
            {/* Store Operations Hub */}
            <Route path={ROUTES.STORE_OPS_HOME} element={<StoreOpsHome />} />
            <Route path="/store-operations/district-intelligence" element={<DistrictIntelligence />} />
            <Route path="/store-operations/store-deep-dive" element={<StoreDeepDive />} />
            {/* Inventory Management */}
            <Route path="/inventory-management" element={<Navigate to="/inventory-management/product-opportunities" replace />} />
            <Route path="/inventory-management/product-opportunities" element={<ProductOpportunitiesPage />} />
            <Route path="/inventory-management/product-opportunities/:opportunityId/allocation-workflow" element={<AllocationWorkflowPage />} />
            <Route path="/inventory-management/approvals-and-execution" element={<ApprovalsAndExecutionPage />} />
            <Route path="/inventory-management/product-execution" element={<ProductExecutionList />} />
            <Route path="/inventory-management/product-execution/:taskId" element={<ProductExecutionDetail />} />
            {/* Command Center — AI Copilot panel is always mounted globally in MainLayout; route redirects to home */}
            <Route path="/command-center/ai-copilot" element={<Navigate to={ROUTES.STORE_OPS_HOME} replace />} />
            <Route path="/command-center/operations-queue" element={<TaskCenter />} />
            <Route path="/command-center/task-center" element={<Navigate to="/command-center/operations-queue" replace />} />
            <Route path="/command-center/communications" element={<MessageCenter />} />
            <Route path="/command-center/message-center" element={<Navigate to="/command-center/communications" replace />} />
            {/* Application Configuration */}
            <Route path="/app-config/user-access" element={<UserAccessManagement />} />
          </Route>
          
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
      </ExecutionTasksProvider>
    </AuthProvider>
  );
}

export default App;

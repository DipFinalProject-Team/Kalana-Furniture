import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SalesAnalytics from './pages/SalesAnalytics';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import InventoryManagement from './pages/InventoryManagement';
import CreateSupplierOrder from './pages/CreateSupplierOrder';
import SupplierInvoices from './pages/SupplierInvoices';
import SupplierApprovals from './pages/SupplierApprovals';
import Promotions from './pages/Promotions';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import AdminLoginPage from './components/AdminLoginPage';
import AdminForgotPasswordPage from './components/AdminForgotPasswordPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Content Component (needs to be inside AuthProvider)
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Redirect root to login or dashboard based on auth status */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/admin" replace /> : <AdminLoginPage />
        }
      />
      <Route path="/forgot-password" element={<AdminForgotPasswordPage onSwitchToLogin={() => {}} />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<SalesAnalytics />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="create-order" element={<CreateSupplierOrder />} />
        <Route path="approvals" element={<SupplierApprovals />} />
        <Route path="invoices" element={<SupplierInvoices />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

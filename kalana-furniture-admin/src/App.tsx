import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SalesAnalytics from './pages/SalesAnalytics';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import InventoryManagement from './pages/InventoryManagement';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import SupplierInvoices from './pages/SupplierInvoices';
import SupplierApprovals from './pages/SupplierApprovals';
import Promotions from './pages/Promotions';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import AdminLoginPage from './components/AdminLoginPage';
import AdminForgotPasswordPage from './components/AdminForgotPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<AdminForgotPasswordPage onSwitchToLogin={() => {}} />} />

        {/* Admin Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<SalesAnalytics />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="create-order" element={<CreatePurchaseOrder />} />
          <Route path="approvals" element={<SupplierApprovals />} />
          <Route path="invoices" element={<SupplierInvoices />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

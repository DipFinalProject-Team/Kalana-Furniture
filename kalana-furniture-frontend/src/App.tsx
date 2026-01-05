import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import UserProfile from './pages/UserProfile';
import Cart from './pages/Cart';
import OrderHistoryPage from './pages/OrderHistory';
import ProductsPage from './pages/ProductsPage';
import CategoryProducts from './pages/CategoryProducts';
import SnowAnimation from './components/SnowAnimation';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import ProductDetailsPage from './pages/ProductDetailsPage';
import OffersPage from './pages/OffersPage';
import ReviewPage from './pages/ReviewPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  const navigate = useNavigate();


  return (
    <AuthProvider>
      <CartProvider>
        <div className="relative">
          <SnowAnimation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onSwitchToRegister={() => navigate('/register')} onForgotPassword={() => navigate('/forgot-password')} />} />
            <Route path="/register" element={<RegistrationPage onSwitchToLogin={() => navigate('/login')} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage onSwitchToLogin={() => navigate('/login')} />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/category/:categoryName" element={<CategoryProducts />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
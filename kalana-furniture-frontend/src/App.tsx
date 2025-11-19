import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import HomePage from './components/HomePage';
import UserProfile from './components/UserProfile';
import Cart from './components/Cart';
import OrderHistoryPage from './components/OrderHistory';
import ProductsPage from './components/ProductsPage';
import CategoryProducts from './components/CategoryProducts';
import SnowAnimation from './components/SnowAnimation';
import { CartProvider } from './contexts/CartContext';
import ProductDetailsPage from './components/ProductDetailsPage';
import OffersPage from './components/OffersPage';
import ReviewPage from './components/ReviewPage';
import CheckoutPage from './components/CheckoutPage';

function App() {
  const navigate = useNavigate();


  return (
    <CartProvider>
      <div className="relative">
        <SnowAnimation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onSwitchToRegister={() => navigate('/register')} onForgotPassword={() => navigate('/forgot-password')} />} />
          <Route path="/register" element={<RegistrationPage onSwitchToLogin={() => navigate('/login')} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage onSwitchToLogin={() => navigate('/login')} />} />
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
  );
}

export default App;
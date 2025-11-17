import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import HomePage from './components/HomePage';
import UserProfile from './components/UserProfile';
import Cart from './components/Cart';
import OrderHistory from './components/OrderHistory';
import ProductsPage from './pages/ProductsPage';
import SnowAnimation from './components/SnowAnimation';

function App() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <SnowAnimation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onSwitchToRegister={() => navigate('/register')} onForgotPassword={() => navigate('/forgot-password')} />} />
        <Route path="/register" element={<RegistrationPage onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
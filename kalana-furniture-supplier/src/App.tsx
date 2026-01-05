import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SupplierLoginPage from "./components/SupplierLoginPage";
import SupplierForgotPasswordPage from "./components/SupplierForgotPasswordPage";
import SupplierRegistrationPage from "./components/SupplierRegistrationPage";
import SupplierResetPasswordPage from "./components/SupplierResetPasswordPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <SupplierLoginPage />,
  },
  {
    path: "/forgot-password",
    element: <SupplierForgotPasswordPage />,
  },
  {
    path: "/supplier/reset-password",
    element: <SupplierResetPasswordPage />,
  },
  {
    path: "/apply",
    element: <SupplierRegistrationPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "invoices",
        element: <Invoices />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

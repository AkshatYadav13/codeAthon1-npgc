import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import Auth from "../components/auth/Auth";
import Login from "../components/auth/Login";
import SignUp from "../components/auth/SignUp";
import VendorList from "../components/vendor/VendorList";
import VendorDetails from "../components/vendor/VendorDetails";
import Cart from "../components/cart/Cart";
import AppLayout from "../components/AppLayout";
import Home from "../components/Home";
import Orders from "../components/orders/Orders";
import VendorItems from "../components/vendor/VendorItems";

/* ================== AUTH GUARD ================== */
const AuthenticatedUser = () => {
  const { user, loading } = useAppStore();

  // Show a loading placeholder while checking user
  if (loading.page) return <div>Loading...</div>;

  // If no user, redirect to login
  if (!user) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
};

/* ================== UNAUTH GUARD ================== */
const UnAuthenticatedUser = () => {
  const { user, loading } = useAppStore();

  if (loading.page) return <div>Loading...</div>;

  // If user exists, redirect to dashboard/home
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};

const router = createBrowserRouter([
  /* ================== AUTH (LEGACY) ================== */
  {
    path: "/auth",
    element: <UnAuthenticatedUser />,
    children: [
      {
        element: <Auth />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <SignUp /> },
        ],
      },
    ],
  },

  /* ================== AUTH (NEW) ================== */
  {
    path: "/login",
    element: <UnAuthenticatedUser />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: "/register",
    element: <UnAuthenticatedUser />,
    children: [{ index: true, element: <SignUp /> }],
  },

  /* ================== APP SHELL (NAVBAR + FOOTER) ================== */
  {
    path: "/",
    element: <AppLayout />,
    children: [
      /* Public/Main Screens */
      { index: true, element: <Home /> },
      {
        path: "vendors",
        children: [
          { index: true, element: <VendorList /> },
          { path: ":id", element: <VendorDetails /> }
        ],
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "vendor/items",
        element: <VendorItems />,
      },
    ],
  },

  /* ================== FALLBACK ================== */
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;

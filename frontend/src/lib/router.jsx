import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import Auth from "../components/auth/Auth";
import Login from "../components/auth/Login";
import SignUp from "../components/auth/SignUp";
import AppLayout from "../components/AppLayout";
import Home from "../components/Home";

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
  /* ================== AUTH ================== */
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

  /* ================== PROTECTED ROOT ================== */
  {
    path: "/",
    element: <AuthenticatedUser />,
    children: [
      {
        element: <AppLayout />,
        children: [{ index: true, element: <Home /> }],
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

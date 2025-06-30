import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Wrapper } from "../components/layout";
import {
  Dashboard,
  ForgotPassword,
  Login,
  NotFound,
  Profile,
  Quiz,
  ResetPassword,
  Signup,
  Summaries,
  Upload,
  VerifyOTP,
} from "../pages";

const routes = [
  {
    path: "/",
    element: <Navigate to="/login" />,
    exact: true,
  },
  {
    path: "/login",
    element: <Login />,
    public: true,
  },
  {
    path: "/signup",
    element: <Signup />,
    public: true,
  },
  {
    path: "/verify-otp",
    element: <VerifyOTP />,
    public: true,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    public: true,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    public: true,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    protected: true,
  },
  {
    path: "/upload",
    element: <Upload />,
    protected: true,
  },
  {
    path: "/summaries",
    element: <Summaries />,
    protected: true,
  },
  // Add this route for when no specific quiz ID is provided
  {
    path: "/quiz",
    element: <Quiz />,
    protected: true,
  },
  // Keep this route for specific quiz IDs
  {
    path: "/quiz/:id",
    element: <Quiz />,
    protected: true,
  },
  {
    path: "/profile",
    element: <Profile />,
    protected: true,
  },
];

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => {
          const element = route.protected ? (
            <Wrapper>{route.element}</Wrapper>
          ) : (
            route.element
          );
          return <Route key={route.path} path={route.path} element={element} />;
        })}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
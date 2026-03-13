import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import NavBar from '@/components/NavBar';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const ReviewDetailPage = lazy(() => import('@/pages/ReviewDetailPage'));
const ReflectionDetailPage = lazy(() => import('@/pages/ReflectionDetailPage'));
const ReviewsFeedPage = lazy(() => import('@/pages/ReviewsFeedPage'));
const MyListsPage = lazy(() => import('@/pages/MyListsPage'));
const ListDetailPage = lazy(() => import('@/pages/ListDetailPage'));
const BrowseListsPage = lazy(() => import('@/pages/BrowseListsPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));

const routeFallbackCls = 'flex min-h-[100dvh] items-center justify-center text-sm text-slate-500 dark:text-slate-400';

function RouteFallback() {
  return <div className={routeFallbackCls}>Loading page...</div>;
}

function ProtectedRoute({ children, hideNavBar = false }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RouteFallback />;

  if (!isAuthenticated) {
    if (location.pathname === '/') {
      return <Navigate to="/welcome" replace />;
    }
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <>
      {children}
      {!hideNavBar && <NavBar />}
    </>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <RouteFallback />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}

function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<ProtectedRoute hideNavBar><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><ReviewsFeedPage /></ProtectedRoute>} />
        <Route path="/reviews/:reviewId" element={<ProtectedRoute><ReviewDetailPage /></ProtectedRoute>} />
        <Route path="/reflections/:reflectionId" element={<ProtectedRoute><ReflectionDetailPage /></ProtectedRoute>} />
        <Route path="/lists" element={<ProtectedRoute><MyListsPage /></ProtectedRoute>} />
        <Route path="/lists/browse" element={<ProtectedRoute><BrowseListsPage /></ProtectedRoute>} />
        <Route path="/lists/:listId" element={<ProtectedRoute><ListDetailPage /></ProtectedRoute>} />
        <Route path="/welcome" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;

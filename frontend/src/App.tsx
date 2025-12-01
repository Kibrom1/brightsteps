/**
 * Main App component with routing.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { lazy, Suspense } from 'react';
import { SkeletonCard } from './components/ui/Skeleton';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DealCreatePage = lazy(() => import('./pages/DealCreatePage'));
const DealDetailPage = lazy(() => import('./pages/DealDetailPage'));
const DealEditPage = lazy(() => import('./pages/DealEditPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const AIToolsPage = lazy(() => import('./pages/AIToolsPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const FeatureFlags = lazy(() => import('./pages/admin/FeatureFlags'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-4xl px-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/register"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <RegisterPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/verify-email"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <VerifyEmailPage />
                  </Suspense>
                </Layout>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <DashboardPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <LeadsPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-tools"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <AIToolsPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <BillingPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <DealCreatePage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <DealDetailPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <DealEditPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <ProfilePage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminLayout />
                  </Suspense>
                </ProtectedRoute>
              }
            >
              <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<PageLoader />}><UserManagement /></Suspense>} />
              <Route path="feature-flags" element={<Suspense fallback={<PageLoader />}><FeatureFlags /></Suspense>} />
              <Route path="audit-logs" element={<Suspense fallback={<PageLoader />}><AuditLogs /></Suspense>} />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <NotFoundPage />
                  </Suspense>
                </Layout>
              }
            />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

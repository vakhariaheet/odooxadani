import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WebSocketTestPage } from './pages/WebSocketTestPage';
<<<<<<< HEAD
import { TemplateListPage } from './pages/templates/TemplateListPage';
import { TemplateCreatePage } from './pages/templates/TemplateCreatePage';
import { TemplateEditPage } from './pages/templates/TemplateEditPage';
import { TemplateLibraryPage } from './pages/templates/TemplateLibraryPage';
=======
import { ContractListPage } from './pages/contracts/ContractListPage';
import { ContractViewPage } from './pages/contracts/ContractViewPage';
import { ContractCreatePage } from './pages/contracts/ContractCreatePage';
import { ContractEditPage } from './pages/contracts/ContractEditPage';
import { ContractSignPage } from './pages/contracts/ContractSignPage';
>>>>>>> ed4d2f8 (feat: Added Contract Management)
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

// Component to redirect authenticated users away from auth pages
function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user } = useUser();

  return (
    <div className="app">
      <Toaster position="top-right" richColors closeButton expand={true} duration={4000} />
      <header className="app-header">
        <Link to="/" className="logo-link">
          <h1>Hackathon App</h1>
        </Link>
        <div className="auth-section">
          <SignedOut>
            <div className="auth-buttons">
              <Link to="/sign-in" className="auth-btn signin-btn">
                Sign In
              </Link>
              <Link to="/sign-up" className="auth-btn signup-btn">
                Sign Up
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="user-section">
              <span>Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!</span>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <SignedOut>
                <LandingPage />
              </SignedOut>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            </>
          }
        />
        <Route
          path="/sign-in/*"
          element={
            <AuthPageWrapper>
              <SignInPage />
            </AuthPageWrapper>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <AuthPageWrapper>
              <SignUpPage />
            </AuthPageWrapper>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/websocket-test"
          element={
            <ProtectedRoute>
              <WebSocketTestPage />
            </ProtectedRoute>
          }
        />
        <Route
<<<<<<< HEAD
          path="/templates"
          element={
            <ProtectedRoute>
              <TemplateListPage />
=======
          path="/contracts"
          element={
            <ProtectedRoute>
              <ContractListPage />
>>>>>>> ed4d2f8 (feat: Added Contract Management)
            </ProtectedRoute>
          }
        />
        <Route
<<<<<<< HEAD
          path="/templates/new"
          element={
            <ProtectedRoute>
              <TemplateCreatePage />
=======
          path="/contracts/create"
          element={
            <ProtectedRoute>
              <ContractCreatePage />
>>>>>>> ed4d2f8 (feat: Added Contract Management)
            </ProtectedRoute>
          }
        />
        <Route
<<<<<<< HEAD
          path="/templates/:id/edit"
          element={
            <ProtectedRoute>
              <TemplateEditPage />
=======
          path="/contracts/create/:proposalId"
          element={
            <ProtectedRoute>
              <ContractCreatePage />
>>>>>>> ed4d2f8 (feat: Added Contract Management)
            </ProtectedRoute>
          }
        />
        <Route
<<<<<<< HEAD
          path="/templates/library"
          element={
            <ProtectedRoute>
              <TemplateLibraryPage />
=======
          path="/contracts/:id"
          element={
            <ProtectedRoute>
              <ContractViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:id/edit"
          element={
            <ProtectedRoute>
              <ContractEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:id/sign"
          element={
            <ProtectedRoute>
              <ContractSignPage />
>>>>>>> ed4d2f8 (feat: Added Contract Management)
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;

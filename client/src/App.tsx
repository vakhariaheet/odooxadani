import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { DemoPage } from './pages/DemoPage';
import { SuccessPage } from './pages/SuccessPage';
import { NewsletterConfirmPage } from './pages/NewsletterConfirmPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WebSocketTestPage } from './pages/WebSocketTestPage';
import { BookingsPage } from './pages/bookings/BookingsPage';
import { CreateBookingPage } from './pages/bookings/CreateBookingPage';
import { BookingDetailsPage } from './pages/bookings/BookingDetailsPage';
import { EditBookingPage } from './pages/bookings/EditBookingPage';
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
          <h1>EventHub</h1>
        </Link>
        <nav className="nav-links">
          <Link to="/features" className="nav-link">
            Features
          </Link>
          <Link to="/pricing" className="nav-link">
            Pricing
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </nav>
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
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/newsletter-confirm" element={<NewsletterConfirmPage />} />
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
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/create"
          element={
            <ProtectedRoute>
              <CreateBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id/edit"
          element={
            <ProtectedRoute>
              <EditBookingPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;

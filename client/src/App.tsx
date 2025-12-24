<<<<<<< Updated upstream
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
import { TemplateListPage } from './pages/templates/TemplateListPage';
import { TemplateCreatePage } from './pages/templates/TemplateCreatePage';
import { TemplateEditPage } from './pages/templates/TemplateEditPage';
import { TemplateLibraryPage } from './pages/templates/TemplateLibraryPage';
import { ContractListPage } from './pages/contracts/ContractListPage';
import { ContractViewPage } from './pages/contracts/ContractViewPage';
import { ContractCreatePage } from './pages/contracts/ContractCreatePage';
import { ContractEditPage } from './pages/contracts/ContractEditPage';
import { ContractSignPage } from './pages/contracts/ContractSignPage';
import { ProposalListPage } from './pages/proposals/ProposalListPage';
import { ProposalCreatePage } from './pages/proposals/ProposalCreatePage';
import { ProposalViewPage } from './pages/proposals/ProposalViewPage';
import { ProposalEditPage } from './pages/proposals/ProposalEditPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';
=======
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, useUser, useAuth } from '@clerk/clerk-react'
import { Toaster } from 'sonner'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { LandingPage } from './pages/LandingPage'
import { PricingPage } from './pages/PricingPage'
import { FeaturesPage } from './pages/FeaturesPage'
import { AboutPage } from './pages/AboutPage'
import { DemoPage } from './pages/DemoPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { TermsOfServicePage } from './pages/TermsOfServicePage'
import { CookiePolicyPage } from './pages/CookiePolicyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { WebSocketTestPage } from './pages/WebSocketTestPage'
import { ClientDashboardPage } from './pages/ClientDashboardPage'
import { ClientProposalsPage } from './pages/ClientProposalsPage'
import { ClientContractsPage } from './pages/ClientContractsPage'
import { ClientInvoicesPage } from './pages/ClientInvoicesPage'
import { ClientProfilePage } from './pages/ClientProfilePage'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
        {/* Template Routes */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <TemplateListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/new"
          element={
            <ProtectedRoute>
              <TemplateCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/:id/edit"
          element={
            <ProtectedRoute>
              <TemplateEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/library"
          element={
            <ProtectedRoute>
              <TemplateLibraryPage />
            </ProtectedRoute>
          }
        />
        {/* Contract Routes */}
        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <ContractListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/create"
          element={
            <ProtectedRoute>
              <ContractCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/create/:proposalId"
          element={
            <ProtectedRoute>
              <ContractCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
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
            </ProtectedRoute>
          }
        />
        {/* Proposal Routes */}
        <Route
          path="/proposals"
          element={
            <ProtectedRoute>
              <ProposalListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/new"
          element={
            <ProtectedRoute requiredRole="freelancer">
              <ProposalCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:id"
          element={
            <ProtectedRoute>
              <ProposalViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:id/edit"
          element={
            <ProtectedRoute requiredRole="freelancer">
              <ProposalEditPage />
            </ProtectedRoute>
          }
        />
=======
        <Route path="/" element={
          <>
            <SignedOut>
              <LandingPage />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        } />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/sign-in/*" element={
          <AuthPageWrapper>
            <SignInPage />
          </AuthPageWrapper>
        } />
        <Route path="/sign-up/*" element={
          <AuthPageWrapper>
            <SignUpPage />
          </AuthPageWrapper>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/websocket-test" element={
          <ProtectedRoute>
            <WebSocketTestPage />
          </ProtectedRoute>
        } />
        {/* Client Portal Routes */}
        <Route path="/client/dashboard" element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/client/proposals" element={
          <ProtectedRoute requiredRole="client">
            <ClientProposalsPage />
          </ProtectedRoute>
        } />
        <Route path="/client/contracts" element={
          <ProtectedRoute requiredRole="client">
            <ClientContractsPage />
          </ProtectedRoute>
        } />
        <Route path="/client/invoices" element={
          <ProtectedRoute requiredRole="client">
            <ClientInvoicesPage />
          </ProtectedRoute>
        } />
        <Route path="/client/profile" element={
          <ProtectedRoute requiredRole="client">
            <ClientProfilePage />
          </ProtectedRoute>
        } />
>>>>>>> Stashed changes
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
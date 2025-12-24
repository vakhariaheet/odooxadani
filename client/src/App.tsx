import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, useUser, useAuth } from '@clerk/clerk-react'
import { Heart } from 'lucide-react'
import { Toaster } from 'sonner'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { LandingPage } from './pages/LandingPage'
import { FeaturesPage } from './pages/FeaturesPage'
import { PricingPage } from './pages/PricingPage'
import { ContactPage } from './pages/ContactPage'
import { AboutPage } from './pages/AboutPage'
import { DemoPage } from './pages/DemoPage'
import { SuccessPage } from './pages/SuccessPage'
import { NewsletterConfirmPage } from './pages/NewsletterConfirmPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { WebSocketTestPage } from './pages/WebSocketTestPage'
import { BookingsPage } from './pages/bookings/BookingsPage'
import { CreateBookingPage } from './pages/bookings/CreateBookingPage'
import { BookingDetailsPage } from './pages/bookings/BookingDetailsPage'
import { EditBookingPage } from './pages/bookings/EditBookingPage'
import { EventsPage } from './pages/events/EventsPage'
import { EventDetailsPage } from './pages/events/EventDetailsPage'
import { MyEventsPage } from './pages/events/MyEventsPage'
import { CreateEventPage } from './pages/events/CreateEventPage'
import { EditEventPage } from './pages/events/EditEventPage'
import { EventSearchPage } from './pages/events/EventSearchPage'
import { EventCategoryPage } from './pages/events/EventCategoryPage'
import { RecommendedEventsPage } from './pages/events/RecommendedEventsPage'
import { PopularEventsPage } from './pages/events/PopularEventsPage'
import { VenuesPage } from './pages/venues/VenuesPage'
import { VenueDetailsPage } from './pages/venues/VenueDetailsPage'
import { MyVenuesPage } from './pages/venues/MyVenuesPage'
import { CreateVenuePage } from './pages/venues/CreateVenuePage'
import { EditVenuePage } from './pages/venues/EditVenuePage'
import { VenueBookingPage } from './pages/venues/VenueBookingPage'
import { WishlistPage } from './pages/venues/WishlistPage'
import { useWishlist } from './hooks/useWishlist'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'

// Component to redirect authenticated users away from auth pages
function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  
  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

// Wishlist Navigation Component with Counter
function WishlistNavigation() {
  const { getWishlistCount, isLoaded } = useWishlist();
  const wishlistCount = getWishlistCount();

  return (
    <nav className="nav-menu">
      <Link to="/venues" className="nav-link">
        Browse Venues
      </Link>
      <Link to="/venues/wishlist" className="nav-link wishlist-link">
        <Heart className="h-4 w-4" />
        Wishlist
        {isLoaded && wishlistCount > 0 && (
          <span className="wishlist-counter">
            {wishlistCount}
          </span>
        )}
      </Link>
      <Link to="/dashboard" className="nav-link">
        Dashboard
      </Link>
    </nav>
  );
}

function App() {
  const { user } = useUser()

  return (
    <div className="app">
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        expand={true}
        duration={4000}
      />
      <header className="app-header">
        <Link to="/" className="logo-link">
          <h1>Hackathon App</h1>
        </Link>
        
        {/* Navigation Menu */}
        <SignedIn>
          <WishlistNavigation />
        </SignedIn>
        
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
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/newsletter-confirm" element={<NewsletterConfirmPage />} />
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
        
        {/* Booking Routes */}
        <Route path="/bookings" element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        } />
        <Route path="/bookings/create" element={
          <ProtectedRoute>
            <CreateBookingPage />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id/edit" element={
          <ProtectedRoute>
            <EditBookingPage />
          </ProtectedRoute>
        } />
        
        {/* Event Routes */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/search" element={<EventSearchPage />} />
        <Route path="/events/category/:category" element={<EventCategoryPage />} />
        <Route path="/events/recommended" element={
          <ProtectedRoute>
            <RecommendedEventsPage />
          </ProtectedRoute>
        } />
        <Route path="/events/popular" element={<PopularEventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/dashboard/events" element={
          <ProtectedRoute>
            <MyEventsPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/events/create" element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/events/:id/edit" element={
          <ProtectedRoute>
            <EditEventPage />
          </ProtectedRoute>
        } />
        
        {/* Venue Routes */}
        <Route path="/venues" element={
          <ProtectedRoute>
            <VenuesPage />
          </ProtectedRoute>
        } />
        <Route path="/venues/:id" element={
          <ProtectedRoute>
            <VenueDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/venues/:id/book" element={
          <ProtectedRoute>
            <VenueBookingPage />
          </ProtectedRoute>
        } />
        
        {/* Wishlist Route - under venues */}
        <Route path="/venues/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        
        {/* Venue Owner Dashboard Routes */}
        <Route path="/dashboard/venues" element={
          <ProtectedRoute requiredRole="venue_owner">
            <MyVenuesPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/venues/create" element={
          <ProtectedRoute requiredRole="venue_owner">
            <CreateVenuePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/venues/:id/edit" element={
          <ProtectedRoute requiredRole="venue_owner">
            <EditVenuePage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App

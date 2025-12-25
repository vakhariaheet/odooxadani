import { Link, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

export function DashboardPage() {
  const { user } = useUser()
  const location = useLocation()
  const isAdmin = (user?.publicMetadata?.role as string) === 'admin'
  const isVenueOwner = (user?.publicMetadata?.role as string) === 'venue_owner'
  const isEventOrganizer = (user?.publicMetadata?.role as string) === 'event_organizer'

  return (
    <>
      <nav className="navigation">
        <Link 
          to="/dashboard"
          className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        
        {/* Public Pages */}
        <Link 
          to="/venues"
          className={`nav-btn ${location.pathname === '/venues' ? 'active' : ''}`}
          title="Browse all venues (public)"
        >
          Find Venues
        </Link>
        
        {/* Events (Coming Soon) */}
        <Link 
          to="/events"
          className={`nav-btn ${location.pathname === '/events' ? 'active' : ''}`}
          style={{ opacity: 0.5, pointerEvents: 'none' }}
          title="Coming Soon"
        >
          Browse Events (Soon)
        </Link>
        
        {/* Venue Owner Dashboard */}
        {(isVenueOwner || isAdmin) && (
          <Link 
            to="/dashboard/venues"
            className={`nav-btn ${location.pathname.startsWith('/dashboard/venues') ? 'active' : ''}`}
            title="Manage your venues"
          >
            My Venues
          </Link>
        )}
        
        {/* Event Organizer Dashboard (Coming Soon) */}
        {(isEventOrganizer || isAdmin) && (
          <Link 
            to="/dashboard/events"
            className={`nav-btn ${location.pathname.startsWith('/dashboard/events') ? 'active' : ''}`}
            style={{ opacity: 0.5, pointerEvents: 'none' }}
            title="Coming Soon"
          >
            My Events (Soon)
          </Link>
        )}
        
        <Link 
          to="/websocket-test"
          className={`nav-btn ${location.pathname === '/websocket-test' ? 'active' : ''}`}
        >
          WebSocket Test
        </Link>
        
        {isAdmin && (
          <Link 
            to="/admin"
            className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            Admin Panel
          </Link>
        )}
      </nav>

      <main className="main-content">
        <div className="dashboard">
          <h2>Dashboard</h2>
          <p>Welcome to your dashboard! Here's what you can do:</p>
          
          <div className="dashboard-sections">
            <div className="dashboard-section">
              <h3>🏢 Venues</h3>
              <p>Find venues for your events or manage your venue listings.</p>
              <div className="dashboard-actions">
                <Link to="/venues" className="dashboard-link">🔍 Find Venues (Public Browse)</Link>
                {(isVenueOwner || isAdmin) && (
                  <>
                    <Link to="/dashboard/venues" className="dashboard-link">📋 My Venues (Manage)</Link>
                    <Link to="/dashboard/venues/create" className="dashboard-link">➕ Add New Venue</Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="dashboard-section">
              <h3>🎉 Events</h3>
              <p>Create and manage events (Coming Soon).</p>
              <div className="dashboard-actions">
                <span className="dashboard-link disabled">Browse Events (Soon)</span>
                {(isEventOrganizer || isAdmin) && (
                  <>
                    <span className="dashboard-link disabled">My Events (Soon)</span>
                    <span className="dashboard-link disabled">Create Event (Soon)</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="user-info">
            <h3>User Information:</h3>
            <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Role:</strong> {(user?.publicMetadata?.role as string) || 'user'}</p>
          </div>
        </div>
      </main>
    </>
  )
}
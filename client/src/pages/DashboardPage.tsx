import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function DashboardPage() {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = (user?.publicMetadata?.role as string) === 'admin';
  const isEventOrganizer = (user?.publicMetadata?.role as string) === 'event_organizer';

  return (
    <>
      <nav className="navigation">
        <Link
          to="/dashboard"
          className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/bookings"
          className={`nav-btn ${location.pathname.startsWith('/bookings') ? 'active' : ''}`}
        >
          My Bookings
        </Link>
        <Link
          to="/events"
          className={`nav-btn ${location.pathname.startsWith('/events') ? 'active' : ''}`}
        >
          Events
        </Link>
        {(isEventOrganizer || isAdmin) && (
          <Link
            to="/dashboard/events"
            className={`nav-btn ${location.pathname === '/dashboard/events' ? 'active' : ''}`}
          >
            My Events
          </Link>
        )}
        <Link
          to="/websocket-test"
          className={`nav-btn ${location.pathname === '/websocket-test' ? 'active' : ''}`}
        >
          WebSocket Test
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`}>
            Admin Panel
          </Link>
        )}
      </nav>

      <main className="main-content">
        <div className="dashboard">
          <h2>Dashboard</h2>
          <p>You're successfully signed in!</p>

          {/* Quick Actions */}
          <div
            className="quick-actions"
            style={{
              margin: '2rem 0',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button
                onClick={() => navigate('/events')}
                className="nav-btn"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Browse Events
              </button>

              {(isEventOrganizer || isAdmin) && (
                <>
                  <button
                    onClick={() => navigate('/dashboard/events')}
                    className="nav-btn"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Manage My Events
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/events/create')}
                    className="nav-btn"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Create New Event
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="user-info">
            <h3>User Information:</h3>
            <p>
              <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
            </p>
            <p>
              <strong>Name:</strong> {user?.firstName} {user?.lastName}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
            <p>
              <strong>Role:</strong> {(user?.publicMetadata?.role as string) || 'user'}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

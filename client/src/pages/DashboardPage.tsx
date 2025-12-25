import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function DashboardPage() {
  const { user } = useUser();
  const location = useLocation();
  const isAdmin = (user?.publicMetadata?.role as string) === 'admin';

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
          to="/ideas"
          className={`nav-btn ${location.pathname.startsWith('/ideas') ? 'active' : ''}`}
        >
          Ideas
        </Link>
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
          <p>Welcome to the Hackathon Platform!</p>

          <div
            className="dashboard-actions"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>💡 Ideas</h3>
              <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
                Discover innovative hackathon ideas or submit your own. Get AI-powered enhancements
                and community feedback.
              </p>
              <Link
                to="/ideas"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                }}
              >
                Browse Ideas
              </Link>
            </div>

            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link
                  to="/ideas/new"
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  Submit New Idea
                </Link>
                <Link
                  to="/ideas?sortBy=votes&sortOrder=desc"
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  Top Voted Ideas
                </Link>
              </div>
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

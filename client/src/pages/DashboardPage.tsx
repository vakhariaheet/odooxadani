import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function DashboardPage() {
  const { user } = useUser();
  const location = useLocation();
  const isAdmin = (user?.publicMetadata?.role as string) === 'admin';
  const userRole = user?.publicMetadata?.role as string;

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
          to="/templates"
          className={`nav-btn ${location.pathname.startsWith('/templates') ? 'active' : ''}`}
        >
          My Templates
        </Link>
        <Link
          to="/templates/library"
          className={`nav-btn ${location.pathname === '/templates/library' ? 'active' : ''}`}
        >
          Template Library
        </Link>
        <Link
          to="/contracts"
          className={`nav-btn ${location.pathname.startsWith('/contracts') ? 'active' : ''}`}
        >
          Contracts
        </Link>
        <Link
          to="/proposals"
          className={`nav-btn ${location.pathname.startsWith('/proposals') ? 'active' : ''}`}
        >
          Proposals
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
          <p>You're successfully signed in!</p>
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
              <strong>Role:</strong> {userRole || 'user'}
            </p>
          </div>

          <div className="quick-actions" style={{ marginTop: '2rem' }}>
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/proposals" className="auth-btn">
                View Proposals
              </Link>
              {userRole === 'freelancer' && (
                <Link to="/proposals/new" className="auth-btn signup-btn">
                  Create New Proposal
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
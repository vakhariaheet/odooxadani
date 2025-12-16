/**
 * Admin stats section component
 */

import { StatsCard } from './StatsCard';
import { StatsCardSkeleton } from './LoadingComponents';

interface AdminStatsProps {
  stats?: {
    totalUsers: number;
    usersByRole?: { admin?: number; user?: number };
    bannedUsers: number;
    activeUsers: number;
  };
  isLoading: boolean;
  error?: Error | null;
}

export function AdminStats({ stats, isLoading, error }: AdminStatsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
      minHeight: '120px',
    }}>
      {isLoading ? (
        <>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </>
      ) : error ? (
        <div style={{ 
          gridColumn: '1 / -1',
          padding: '2rem',
          textAlign: 'center',
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          borderRadius: '1rem',
          border: '1px solid #fecaca'
        }}>
          Error loading stats: {error.message}
        </div>
      ) : stats ? (
        <>
          <StatsCard title="Total Users" value={stats.totalUsers} color="#2563eb" />
          <StatsCard title="Admins" value={stats.usersByRole?.admin ?? 0} color="#7c3aed" />
          <StatsCard title="Regular Users" value={stats.usersByRole?.user ?? 0} color="#059669" />
          <StatsCard title="Banned" value={stats.bannedUsers} color="#dc2626" />
          <StatsCard title="Active Users" value={stats.activeUsers} color="#f59e0b" />
        </>
      ) : null}
    </div>
  );
}
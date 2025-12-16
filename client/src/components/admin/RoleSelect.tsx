/**
 * Role Select Component
 * Specialized select for user roles with loading states
 */

import { CustomSelect } from './CustomSelect';
import { LoadingSpinner } from './LoadingComponents';
import type { UserRole } from '../../types/user';

interface RoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const roleOptions = [
  { value: 'user' as UserRole, label: 'User' },
  { value: 'admin' as UserRole, label: 'Admin' },
];

export function RoleSelect({ value, onChange, disabled = false, isLoading = false }: RoleSelectProps) {
  if (isLoading) {
    return (
      <div
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: '2px solid #e2e8f0',
          backgroundColor: '#f1f5f9',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#94a3b8',
          opacity: 0.7,
          minWidth: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        <LoadingSpinner size={14} color="#94a3b8" />
        <span>Updating...</span>
      </div>
    );
  }

  return (
    <CustomSelect
      value={value}
      onChange={(newValue) => onChange(newValue as UserRole)}
      options={roleOptions}
      disabled={disabled}
      style={{
        minWidth: '100px',
      }}
    />
  );
}
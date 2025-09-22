'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/lib/auth';

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles: UserProfile['role'][];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
}

export default function RoleBasedComponent({ 
  children, 
  allowedRoles, 
  fallback = null,
  requireAll = false 
}: RoleBasedComponentProps) {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <>{fallback}</>;
  }

  const hasPermission = requireAll 
    ? allowedRoles.every(role => userProfile.role === role)
    : allowedRoles.includes(userProfile.role);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleBasedComponent allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

export function CoordinatorOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleBasedComponent allowedRoles={['ADMIN', 'COORDINATOR']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

export function ResponderOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleBasedComponent allowedRoles={['ADMIN', 'COORDINATOR', 'RESPONDER']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

export function ReporterOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleBasedComponent allowedRoles={['REPORTER']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

// Hook for role checking
export function useRoleCheck() {
  const { userProfile } = useAuth();

  const hasRole = (roles: UserProfile['role'] | UserProfile['role'][]) => {
    if (!userProfile) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(userProfile.role);
  };

  const hasAnyRole = (roles: UserProfile['role'][]) => {
    return hasRole(roles);
  };

  const hasAllRoles = (roles: UserProfile['role'][]) => {
    if (!userProfile) return false;
    return roles.every(role => userProfile.role === role);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isCoordinator = () => hasRole(['ADMIN', 'COORDINATOR']);
  const isResponder = () => hasRole(['ADMIN', 'COORDINATOR', 'RESPONDER']);
  const isReporter = () => hasRole('REPORTER');

  return {
    userProfile,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isCoordinator,
    isResponder,
    isReporter
  };
}

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
type Role = 'admin' | 'partner' | 'any';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export const AuthGuard = ({ children, requiredRole = 'any' }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }
      if (requiredRole !== 'any' && user.role !== requiredRole) {
        const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/partner/dashboard';
        router.push(dashboardPath);
        return;
      }
      setIsAuthorized(true);
    }
  }, [user, isLoading, router, requiredRole]);
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  return <>{children}</>;
};

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: Role = 'any'
) {
  return function ProtectedRoute(props: P) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <Component {...props as P} />
      </AuthGuard>
    );
  };
};

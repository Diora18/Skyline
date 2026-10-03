import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProtectedRoute({
  children,
  requireOfficer = false,
  requireExecutive = false,
  requireMember = false,
}) {
  const { user, token, authLoading, isMember, isAdmin, isExecutive } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Verifying authorization...</p>
        </div>
      </main>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions
  if (requireOfficer && !isAdmin) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 min-h-[60vh]">
        <div className="max-w-md text-center bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Officer Access Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted to Skyline SSA Executive Officers. Contact an administrator if you need access.
          </p>
          <Button className="mt-6 rounded-full" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </main>
    );
  }

  if (requireExecutive && !isExecutive) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 min-h-[60vh]">
        <div className="max-w-md text-center bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Executive Board Access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This management dashboard is reserved for Treasurers and Officers.
          </p>
          <Button className="mt-6 rounded-full" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </main>
    );
  }

  if (requireMember && !isMember) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 min-h-[60vh]">
        <div className="max-w-md text-center bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-primary mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Active Membership Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This feature is exclusive to active Skyline SSA members. Join or renew your membership to unlock access.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button className="rounded-full" onClick={() => window.location.href = '/membership/join'}>
              Join Membership Now
            </Button>
            <Button variant="ghost" className="rounded-full" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return children;
}

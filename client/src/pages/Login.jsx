import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center py-20 px-4 md:px-6">
      <div className="w-full max-w-5xl grid overflow-hidden rounded-[2rem] border-2 border-foreground lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:p-12">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full bg-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              Welcome Back
            </span>
            <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">Log in to Skyline SSA.</h2>
            <p className="text-primary-foreground/85">
              Access your digital member card, event tickets, and exclusive perks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <img
              src="/skyline-logo.png"
              alt="Skyline Student Club"
              className="h-16 w-32 rounded-xl bg-background object-contain"
            />
          </div>
        </div>
        
        <div className="bg-card p-6 md:p-12 flex flex-col justify-center">
          {error && (
            <div className="mb-6 rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">University Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-semibold">
              {loading ? 'Logging in...' : 'Log in securely'}
              {!loading && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-foreground hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

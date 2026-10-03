import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const majors = ['Computer Science', 'Business', 'Engineering', 'Arts', 'Science', 'Other'];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    major: '',
    gradYear: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        register(data.user, data.token);
        navigate('/');
      } else {
        setError(data.message || 'Failed to register');
      }
    } catch (err) {
      // Mock fallback if backend isn't running yet
      console.warn("Backend not reachable. Mocking register...");
      register({ name: formData.name, role: 'student', membershipStatus: 'none' }, 'mock-token-123');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center py-20 px-4 md:px-6">
      <div className="w-full max-w-6xl grid overflow-hidden rounded-[2rem] border-2 border-foreground lg:grid-cols-5">
        <div className="flex flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:p-10 lg:col-span-2">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full bg-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              New Account
            </span>
            <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">{"Let's get you in."}</h2>
            <p className="text-primary-foreground/85">
              Takes about two minutes. Create an account to RSVP for events, buy merch, and join the club.
            </p>
          </div>
          <ol className="flex flex-col gap-4">
            {['Fill out the form', 'Create your account', 'Pay member dues (optional)'].map(
              (step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground font-display font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </li>
              ),
            )}
          </ol>
        </div>
        
        <div className="bg-card p-6 md:p-10 lg:col-span-3">
          {error && (
            <div className="mb-6 rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-semibold">Full Name</label>
                <input id="name" name="name" required placeholder="Jane Doe" value={formData.name} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="studentId" className="text-sm font-semibold">Student ID</label>
                <input id="studentId" name="studentId" required placeholder="12345678" inputMode="numeric" value={formData.studentId} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold">University Email</label>
                <input id="email" name="email" type="email" required placeholder="you@university.edu" value={formData.email} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-semibold">Phone Number</label>
                <input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="major" className="text-sm font-semibold">Major</label>
                <select id="major" name="major" required value={formData.major} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30">
                  <option value="" disabled>Select Major</option>
                  {majors.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="gradYear" className="text-sm font-semibold">Graduation Year</label>
                <select id="gradYear" name="gradYear" required value={formData.gradYear} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30">
                  <option value="" disabled>Select Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold">Password</label>
                <input id="password" name="password" type="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-4 h-12 w-full rounded-full text-base font-semibold">
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-foreground hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

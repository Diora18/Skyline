import { Routes, Route } from 'react-router-dom';
import { SiteHeader } from './components/club/site-header';
import { SiteFooter } from './components/club/site-footer';
import Home from './pages/Home';
import Events from './pages/Events';
import JoinMembership from './pages/JoinMembership';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import Perks from './pages/Perks';
import Team from './pages/Team';
import Faq from './pages/Faq';

const Merch = () => (
  <main className="flex flex-1 items-center justify-center px-6 py-24">
    <section className="max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Merch</p>
      <h1 className="mt-3 text-4xl font-extrabold">Merch store</h1>
      <p className="mt-4 text-muted-foreground">
        Club merchandise and ordering will appear here.
      </p>
    </section>
  </main>
);

const NotFound = () => (
  <main className="flex flex-1 items-center justify-center px-6 py-24">
    <section className="text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-3 text-4xl font-extrabold">Page not found</h1>
      <p className="mt-4 text-muted-foreground">The page you requested does not exist.</p>
    </section>
  </main>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event" element={<Events />} />
        <Route path="/events" element={<Events />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/perks" element={<Perks />} />
        <Route path="/team" element={<Team />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/membership/join" element={<JoinMembership />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

export default App;

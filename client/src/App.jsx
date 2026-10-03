import { Routes, Route } from 'react-router-dom';
import { SiteHeader } from './components/club/site-header';
import { SiteFooter } from './components/club/site-footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Merch from './pages/Merch';
import Orders from './pages/Orders';
import AdminOrders from './pages/AdminOrders';
import JoinMembership from './pages/JoinMembership';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import ProjectKanban from './pages/ProjectKanban';
import Perks from './pages/Perks';
import Team from './pages/Team';
import Faq from './pages/Faq';
import Tickets from './pages/Tickets';
import Scanner from './pages/Scanner';
import Treasury from './pages/Treasury';
import ExpenseSubmit from './pages/ExpenseSubmit';
import AdminExpenses from './pages/AdminExpenses';
import Members from './pages/Members';
import Announcements from './pages/Announcements';
import Inventory from './pages/Inventory';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/perks" element={<Perks />} />
        <Route path="/team" element={<Team />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/membership/join" element={<JoinMembership />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectKanban />} />

        {/* Protected Student Routes */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/submit"
          element={
            <ProtectedRoute>
              <ExpenseSubmit />
            </ProtectedRoute>
          }
        />

        {/* Protected Officer & Executive Operations Routes */}
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requireOfficer>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/scanner"
          element={
            <ProtectedRoute requireExecutive>
              <Scanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute requireExecutive>
              <Scanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/treasury"
          element={
            <ProtectedRoute requireExecutive>
              <Treasury />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/expenses"
          element={
            <ProtectedRoute requireExecutive>
              <AdminExpenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute requireOfficer>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute requireOfficer>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

export default App;

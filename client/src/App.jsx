import { Routes, Route } from 'react-router-dom';
import { SiteHeader } from './components/club/site-header';
import { SiteFooter } from './components/club/site-footer';
import Home from './pages/Home';
import Events from './pages/Events';
import JoinMembership from './pages/JoinMembership';
import Login from './pages/Login';
import Register from './pages/Register';

const Merch = () => <div className="p-8">Merch Store</div>;

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/membership/join" element={<JoinMembership />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

export default App;

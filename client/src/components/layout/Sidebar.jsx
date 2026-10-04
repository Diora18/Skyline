import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Calendar,
  ShoppingBag,
  Bell,
  FolderGit2,
  Gift,
  Users,
  HelpCircle,
  Ticket,
  HeartHandshake,
  Receipt,
  Package,
  PlusCircle,
  QrCode,
  Wallet,
  ReceiptText,
  UserCheck,
  Truck,
  Boxes,
  LogOut,
  LogIn,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, canScan, canAccessTreasury, canSubmitExpenses, isOfficer } = useAuth();

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const mainLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/merch', label: 'Merch Store', icon: ShoppingBag },
    { href: '/announcements', label: 'Bulletin', icon: Bell },
    { href: '/projects', label: 'Projects', icon: FolderGit2 },
    { href: '/perks', label: 'Perks', icon: Gift },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
  ];

  const userLinks = user
    ? [
        { href: '/tickets', label: 'My Tickets', icon: Ticket },
        { href: '/volunteering', label: 'My Volunteering', icon: HeartHandshake },
        { href: '/expenses/my', label: 'My Claims', icon: Receipt },
        { href: '/orders', label: 'My Orders', icon: Package },
        ...(canSubmitExpenses
          ? [{ href: '/expenses/submit', label: 'Submit Expense', icon: PlusCircle }]
          : []),
      ]
    : [];

  const adminLinks = [
    ...(canScan ? [{ href: '/admin/scanner', label: 'Door Scanner', icon: QrCode }] : []),
    ...(canAccessTreasury
      ? [
          { href: '/admin/treasury', label: 'Treasury & Ledger', icon: Wallet },
          { href: '/admin/expenses', label: 'Expense Review', icon: ReceiptText },
        ]
      : []),
    ...(isOfficer
      ? [
          { href: '/admin/members', label: 'Member Directory', icon: UserCheck },
          { href: '/admin/orders', label: 'Orders Queue', icon: Truck },
          { href: '/admin/inventory', label: 'Inventory Control', icon: Boxes },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  const renderNavItem = (link, isManagement = false) => {
    const Icon = link.icon;
    const active = isActive(link.href);

    return (
      <div key={link.href} className="relative group">
        <Link
          to={link.href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-xl py-2 text-xs font-semibold transition-all duration-200 relative',
            isCollapsed ? 'justify-center px-0 h-10 w-full' : 'px-3.5',
            active
              ? isManagement
                ? 'border-l-4 border-primary bg-primary/10 text-primary font-bold shadow-sm shadow-primary/10'
                : 'border-l-4 border-primary bg-primary/10 text-primary font-bold shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border-l-4 border-transparent'
          )}
        >
          <Icon className={cn('size-4 shrink-0 transition-transform duration-150 group-hover:scale-110', isManagement && 'text-primary')} />

          {!isCollapsed && (
            <span className="truncate transition-opacity duration-200">
              {link.label}
            </span>
          )}
        </Link>

        {/* Floating Tooltip Preview when Sidebar is Collapsed (POSAI Spec) */}
        {isCollapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xl text-foreground text-xs font-bold whitespace-nowrap animate-in fade-in-0 zoom-in-95">
              <span>{link.label}</span>
              {active && <span className="size-1.5 rounded-full bg-primary"></span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/skyline-logo.png"
            alt="Skyline Student Club"
            className="h-10 w-24 object-contain"
          />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation Panel (POSAI Collapsible Layout & Smooth Width Animation) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card shadow-lg transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header with Brand & PosAI Collapse Toggle Button */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border px-4',
            isCollapsed ? 'justify-center px-0' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 group overflow-hidden"
            >
              <img
                src="/skyline-logo.png"
                alt="Skyline Student Club"
                className="h-11 w-28 object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          )}

          {/* Desktop PosAI Collapse Toggle Button with smooth 3-bar -> Arrow morph */}
          <button
            onClick={toggleCollapse}
            onMouseEnter={() => setIsToggleHovered(true)}
            onMouseLeave={() => setIsToggleHovered(false)}
            className={cn(
              'group hidden md:inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              !isCollapsed && 'ml-auto'
            )}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300"
            >
              {/* Top Bar -> Top Arrowhead */}
              <line
                x1={isToggleHovered ? (isCollapsed ? '13' : '4') : '4'}
                y1={isToggleHovered ? (isCollapsed ? '5' : '12') : '6'}
                x2={isToggleHovered ? (isCollapsed ? '20' : '11') : '20'}
                y2={isToggleHovered ? (isCollapsed ? '12' : '5') : '6'}
                className="transition-all duration-300 ease-in-out"
              />
              {/* Middle Bar -> Horizontal Arrow Shaft */}
              <line
                x1="4"
                y1="12"
                x2="20"
                y2="12"
                className="transition-all duration-300 ease-in-out"
              />
              {/* Bottom Bar -> Bottom Arrowhead */}
              <line
                x1={isToggleHovered ? (isCollapsed ? '13' : '4') : '4'}
                y1={isToggleHovered ? (isCollapsed ? '19' : '12') : '18'}
                x2={isToggleHovered ? (isCollapsed ? '20' : '11') : '20'}
                y2={isToggleHovered ? (isCollapsed ? '12' : '19') : '18'}
                className="transition-all duration-300 ease-in-out"
              />
            </svg>
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted md:hidden ml-auto"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block transition-all duration-200">
                Main
              </span>
            )}
            {mainLinks.map((link) => renderNavItem(link))}
          </div>

          {/* User Workspace (Logged In) */}
          {user && userLinks.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block transition-all duration-200">
                  Operations
                </span>
              )}
              {userLinks.map((link) => renderNavItem(link))}
            </div>
          )}

          {/* Management Suite (Officer & Executive Roles) */}
          {adminLinks.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-primary block transition-all duration-200">
                  Management
                </span>
              )}
              {adminLinks.map((link) => renderNavItem(link, true))}
            </div>
          )}
        </div>

        {/* Sidebar Footer: POSAI User Profile / Auth Actions */}
        <div className="shrink-0 border-t border-border p-3 bg-muted/20">
          {!user ? (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors',
                  isCollapsed && 'px-0'
                )}
                title="Log In"
              >
                <LogIn className="size-3.5" />
                {!isCollapsed && <span>Log In</span>}
              </Link>
              {!isCollapsed && (
                <Link
                  to="/membership/join"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'w-full justify-center rounded-xl text-xs font-bold'
                  )}
                >
                  Join the Club
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {isCollapsed ? (
                /* Collapsed User Avatar Icon with Floating Profile Tooltip */
                <div className="relative group flex items-center justify-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm cursor-pointer shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-4" />}
                  </div>

                  <div className="absolute left-full bottom-0 ml-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                    <div className="p-3 rounded-xl bg-card border border-border shadow-2xl space-y-2 text-xs w-48 font-medium">
                      <div className="font-bold text-foreground truncate">{user.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">{user.role}</div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="size-3.5" /> Log Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Full Expanded User Profile Card */
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border/80 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground leading-snug">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="rounded bg-primary/10 text-primary px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                            {user.role}
                          </span>
                          {user.membershipStatus === 'active' && (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-400">
                              <ShieldCheck className="size-2.5" /> Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Log out"
                    >
                      <LogOut className="size-4" />
                    </button>
                  </div>

                  {user.membershipStatus !== 'active' && (
                    <Link
                      to="/membership/join"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center text-[11px] font-bold text-primary hover:underline bg-primary/10 py-1.5 rounded-lg border border-primary/20"
                    >
                      Join Member Tier ($25/yr)
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

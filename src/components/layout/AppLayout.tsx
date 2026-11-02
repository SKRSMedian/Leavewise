import { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, BarChart3,
  Settings, Brain, FileText, LogOut, Menu, X, PlusCircle, Shield
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useClock } from '../../hooks/useClock';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, path: '/app/dashboard' },
  { label: 'Leave Requests', icon: FileText, path: '/app/requests' },
  { label: 'Calendar', icon: Calendar, path: '/app/calendar' },
  { label: 'AI Decision Centre', icon: Brain, path: '/app/decision-engine' },
  { label: 'Employees', icon: Users, path: '/app/employees' },
  { label: 'Analytics', icon: BarChart3, path: '/app/analytics' },
  { label: 'Settings', icon: Settings, path: '/app/settings' },
];

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#3E5C76" />
      <rect x="6" y="9" width="8" height="8" rx="1.5" fill="#F0EBD8" opacity="0.9" />
      <rect x="18" y="6" width="8" height="8" rx="1.5" fill="#748CAB" />
      <rect x="12" y="19" width="8" height="8" rx="1.5" fill="#F0EBD8" opacity="0.7" />
      <line x1="14" y1="13" x2="18" y2="10" stroke="#F0EBD8" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="18" y1="14" x2="16" y2="19" stroke="#F0EBD8" strokeWidth="1.2" strokeOpacity="0.6" />
    </svg>
  );
}

export function AppSidebar() {
  const { user, logout, sidebarOpen, setSidebarOpen, toggleSidebar } = useStore();
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 280);
  };

  return (
    <>
      {/* Invisible edge zone at very left of screen that reveals sidebar when cursor touches it */}
      <div
        className="edge-hover-zone"
        onMouseEnter={() => setSidebarOpen(true)}
        aria-hidden="true"
      />

      {/* Dimmed backdrop when sidebar is open */}
      {sidebarOpen && (
        <div
          className="app-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          onMouseEnter={handleMouseLeave}
        />
      )}

      <aside
        className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Main Navigation"
      >
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark />
            <span className="sidebar-logo-text">LeaveWise</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: 4, minHeight: 28 }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Enterprise Navigation</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Keep brief auto-close on navigate for smooth UX
                setTimeout(() => setSidebarOpen(false), 150);
              }}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
              {user?.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield size={10} /> {user?.role}
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={logout}
            style={{ width: '100%', justifyContent: 'flex-start', gap: 8, fontSize: '0.8125rem' }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

interface TopbarProps {
  title: string;
  pendingCount?: number;
  onNewRequest?: () => void;
}

export function AppTopbar({ title, pendingCount = 0, onNewRequest }: TopbarProps) {
  const { user, sidebarOpen, toggleSidebar, setSidebarOpen, switchRole } = useStore();
  const { timeStr, dateStr } = useClock();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTriggerEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setSidebarOpen(true);
  };

  const handleTriggerLeave = () => {
    // Give cursor time to move inside the sliding sidebar
    hoverTimerRef.current = setTimeout(() => {
      // Do not auto close immediately if user is hovering inside the sidebar
    }, 300);
  };

  return (
    <header className="app-topbar">
      {/* Three lines menu button in top-left corner */}
      <button
        className={`topbar-menu-trigger ${sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={handleTriggerLeave}
        aria-label="Toggle navigation dashboard"
        id="topbar-three-lines"
        title="Open/Hide Navigation Dashboard"
      >
        <Menu size={18} />
        <span style={{ fontSize: '0.8125rem' }}>Menu</span>
      </button>

      <h1 className="topbar-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, minWidth: 140 }}>
        {title}
      </h1>

      {/* Global Quick Action: New Request */}
      {onNewRequest && (
        <button
          className="btn btn-primary btn-sm"
          onClick={onNewRequest}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
          id="topbar-apply-leave-btn"
        >
          <PlusCircle size={14} />
          <span>Apply Leave</span>
        </button>
      )}

      {/* Role Switcher for instant testing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-40)', display: 'none', minWidth: 60 }} className="role-label">Role:</span>
        <select
          className="form-select"
          value={user?.role || 'manager'}
          onChange={(e) => switchRole(e.target.value as 'employee' | 'manager' | 'admin')}
          style={{
            padding: '4px 10px',
            fontSize: '0.75rem',
            height: 32,
            background: 'rgba(29,45,68,0.8)',
            borderColor: 'var(--border-accent)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-sm)'
          }}
          title="Switch role to test permissions"
        >
          <option value="manager">Role: Manager (Reviewer)</option>
          <option value="employee">Role: Employee (Applicant)</option>
          <option value="admin">Role: Admin (Settings & Rules)</option>
        </select>
      </div>

      {/* Clock */}
      <div className="topbar-clock" style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
        <span className="clock-time">{timeStr}</span>
        <span className="clock-date" style={{ fontSize: '0.6875rem' }}>{dateStr}</span>
      </div>

      {/* Notifications indicator */}
      <NavLink
        to="/app/requests"
        className="topbar-btn"
        aria-label="Pending Approvals"
        title={`${pendingCount} requests pending`}
        style={{ position: 'relative' }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {pendingCount > 0 && <span className="badge">{pendingCount > 9 ? '9+' : pendingCount}</span>}
      </NavLink>

      {/* Avatar */}
      <div className="avatar" id="user-avatar" title={`${user?.name} (${user?.role})`}>
        {user?.avatar}
      </div>
    </header>
  );
}

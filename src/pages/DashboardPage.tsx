import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AppSidebar, AppTopbar } from '../components/layout/AppLayout';
import { NewLeaveRequestModal } from '../components/modals/NewLeaveRequestModal';
import { useRelativeTime } from '../hooks/useClock';
import {
  Clock, Users, CheckCircle, AlertTriangle,
  Calendar, ArrowRight, PlusCircle, Check, X, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

function MetricCard({
  label, value, sub, icon: Icon, accent = false,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ComponentType<{ size?: number }>;
  accent?: boolean;
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={accent ? { color: 'var(--color-accent)' } : {}}>
        {value}
      </div>
      <div className="metric-sub">{sub}</div>
      <div className="metric-icon">
        <Icon size={16} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    pending: 'badge-status badge-pending',
    approved: 'badge-status badge-approved',
    rejected: 'badge-status badge-rejected',
  };
  return (
    <span className={classes[status] || 'badge-status'}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {status}
    </span>
  );
}

function ActivityItem({ event }: { event: { type: string; employeeName: string; leaveType: string; timestamp: string; actor?: string } }) {
  const rel = useRelativeTime(event.timestamp);
  const typeLabels: Record<string, string> = {
    submitted: 'submitted a request',
    approved: 'was approved',
    rejected: 'was rejected',
    cancelled: 'cancelled request',
  };
  return (
    <div className="timeline-item">
      <div className={`timeline-dot ${event.type === 'approved' ? 'approved' : event.type === 'rejected' ? 'rejected' : ''}`} />
      <div className="timeline-content">
        <div className="timeline-title">
          <strong>{event.employeeName}</strong>'s {event.leaveType} leave {typeLabels[event.type]}
          {event.actor && <> by <strong>{event.actor}</strong></>}
        </div>
        <div className="timeline-meta">{rel}</div>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { leaveRequests } = useStore();
  const approvedDays = new Set(
    leaveRequests
      .filter(r => r.status === 'approved')
      .flatMap(r => {
        const days = [];
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === month && d.getFullYear() === year) {
            days.push(d.getDate());
          }
        }
        return days;
      })
  );

  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {weekdays.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.625rem', color: 'var(--color-text-40)', padding: '4px 0', fontWeight: 600 }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map((day, i) => (
          <div
            key={i}
            className={`calendar-day ${day === today.getDate() ? 'today' : ''} ${day && approvedDays.has(day) ? 'has-leave' : ''} ${!day ? 'other-month' : ''}`}
            style={{ fontSize: '0.6875rem', minHeight: 28 }}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkforceBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--color-text-60)' }}>{label}</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{value}/{max}</span>
      </div>
      <div className="priority-bar">
        <div
          className="priority-fill"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, activityEvents, employees, getPendingRequests, getEmployeesOnLeaveToday, approveRequest, rejectRequest } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const pending = getPendingRequests();
  const onLeaveToday = getEmployeesOnLeaveToday();
  const totalEmployees = employees.length;
  const availableCount = totalEmployees - onLeaveToday.length;
  const todayDate = new Date().toDateString();

  const handleQuickApprove = (id: string, name: string) => {
    approveRequest(id, 'Approved from Overview dashboard.');
    setAlertMsg(`Approved leave request for ${name}.`);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleQuickReject = (id: string, name: string) => {
    rejectRequest(id, 'Declined due to team capacity.');
    setAlertMsg(`Declined leave request for ${name}.`);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppTopbar
          title="Overview Dashboard"
          pendingCount={pending.length}
          onNewRequest={() => setModalOpen(true)}
        />

        <div className="app-content">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginBottom: 'var(--space-2xl)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              flexWrap: 'wrap', gap: 16
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
                Welcome, {user?.name || 'Manager'}.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-60)' }}>
                Active role: <strong style={{ color: 'var(--color-accent)' }}>{user?.role?.toUpperCase()}</strong> • {user?.department} • Staffing thresholds active.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setModalOpen(true)}
              id="dashboard-apply-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
            >
              <PlusCircle size={16} />
              <span>+ Apply for Leave</span>
            </button>
          </motion.div>

          {/* Toast alert */}
          <AnimatePresence>
            {alertMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  background: 'var(--color-success-bg)',
                  border: '1px solid #5CBA8C',
                  color: '#5CBA8C',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: '0.875rem', fontWeight: 600
                }}
              >
                <CheckCircle2 size={16} />
                {alertMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="metric-grid"
            style={{ marginBottom: 'var(--space-xl)' }}
          >
            <MetricCard
              label="Pending Requests"
              value={pending.length}
              sub="Awaiting manager review"
              icon={Clock}
              accent={pending.length > 0}
            />
            <MetricCard
              label="On Leave Today"
              value={onLeaveToday.length}
              sub={todayDate}
              icon={Users}
            />
            <MetricCard
              label="Available Workforce"
              value={availableCount}
              sub={`of ${totalEmployees} total staff`}
              icon={CheckCircle}
            />
            <MetricCard
              label="Staffing Health"
              value={pending.length > 5 ? 'Moderate' : 'Optimal'}
              sub="Bayesian risk estimate"
              icon={AlertTriangle}
              accent={pending.length > 5}
            />
          </motion.div>

          {/* Main content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

              {/* Pending Approvals */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="card-header">
                  <span className="card-title">Pending Approvals ({pending.length})</span>
                  <Link to="/app/requests" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    View all requests <ArrowRight size={12} />
                  </Link>
                </div>
                {pending.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <CheckCircle size={32} />
                    <h4 style={{ margin: '8px 0 4px 0' }}>All caught up!</h4>
                    <p style={{ color: 'var(--color-text-40)' }}>No pending leave requests awaiting approval.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Type</th>
                          <th>Dates</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Quick Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pending.slice(0, 6).map(req => (
                          <tr key={req.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                                {req.employeeName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)' }}>{req.department}</div>
                            </td>
                            <td style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{req.leaveType}</td>
                            <td style={{ fontSize: '0.8125rem' }}>
                              {new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              {req.days > 1 && ` — ${new Date(req.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>{req.days} day{req.days > 1 ? 's' : ''}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="priority-bar" style={{ width: 48, height: 4 }}>
                                  <div className="priority-fill" style={{ width: `${req.priorityScore}%` }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                                  {req.priorityScore}
                                </span>
                              </div>
                            </td>
                            <td><StatusBadge status={req.status} /></td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleQuickApprove(req.id, req.employeeName)}
                                  title="Approve"
                                  style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                                >
                                  <Check size={11} /> Approve
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleQuickReject(req.id, req.employeeName)}
                                  title="Reject"
                                  style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                                >
                                  <X size={11} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>

              {/* Workforce Overview */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <div className="card-header">
                  <span className="card-title">Workforce Capacity & Allocation</span>
                  <Link to="/app/analytics" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Analytics <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <WorkforceBar
                    label="Available On-Duty Staff"
                    value={availableCount}
                    max={totalEmployees}
                    color="linear-gradient(90deg, #3E5C76, #748CAB)"
                  />
                  <WorkforceBar
                    label="Staff On Leave Today"
                    value={onLeaveToday.length}
                    max={totalEmployees}
                    color="linear-gradient(90deg, #C4842A, #E8A84A)"
                  />
                  <WorkforceBar
                    label="Pending Requests Impact"
                    value={pending.length}
                    max={totalEmployees}
                    color="linear-gradient(90deg, #748CAB, #8CA8C4)"
                  />
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12, marginTop: 4,
                  }}>
                    {[
                      { label: 'Total Roster', value: totalEmployees, color: 'var(--color-text)' },
                      { label: 'Active Now', value: availableCount, color: '#5CBA8C' },
                      { label: 'On Leave', value: onLeaveToday.length, color: '#E8A84A' },
                    ].map((stat, i) => (
                      <div key={i} style={{
                        textAlign: 'center', background: 'var(--color-bg-deep)',
                        borderRadius: 8, padding: 12, border: 'var(--border-subtle)',
                      }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)', marginTop: 2 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {/* Recent Activity */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 }}
              >
                <div className="card-header">
                  <span className="card-title">Live Request Audit Feed</span>
                </div>
                <div className="card-body" style={{ paddingTop: 8 }}>
                  <div className="timeline">
                    {activityEvents.slice(0, 5).map(ev => (
                      <ActivityItem key={ev.id} event={ev} />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mini Calendar */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
              >
                <div className="card-header">
                  <span className="card-title">
                    {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                  <Link to="/app/calendar" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Full Calendar <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="card-body">
                  <MiniCalendar />
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }} />
                      Approved absence
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-primary)' }} />
                      Today
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* New Request Modal */}
      <NewLeaveRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

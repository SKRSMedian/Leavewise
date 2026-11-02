import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AppSidebar, AppTopbar } from '../components/layout/AppLayout';
import { NewLeaveRequestModal } from '../components/modals/NewLeaveRequestModal';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { LeaveRequest, Department } from '../data/mockData';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const LEAVE_COLORS: Record<string, string> = {
  Annual: '#3E5C76',
  Sick: '#8C4A4A',
  Personal: '#4A7A8C',
  Emergency: '#8C6A4A',
  Maternity: '#4A8C6F',
  Paternity: '#4A6F8C',
};

function getDateRange(start: string, end: string): Date[] {
  const dates: Date[] = [];
  const s = new Date(start);
  const e = new Date(end);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function CalendarPage() {
  const { leaveRequests, getPendingRequests } = useStore();
  const pending = getPendingRequests();
  const [viewDate, setViewDate] = useState(new Date());
  const [deptFilter, setDeptFilter] = useState<'all' | Department>('all');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const relevantRequests = useMemo(() =>
    leaveRequests.filter(r =>
      (r.status === 'approved' || r.status === 'pending') &&
      (deptFilter === 'all' || r.department === deptFilter)
    ),
    [leaveRequests, deptFilter]
  );

  const requestsByDay = useMemo(() => {
    const map: Record<string, LeaveRequest[]> = {};
    for (const req of relevantRequests) {
      const dates = getDateRange(req.startDate, req.endDate);
      for (const d of dates) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          const key = d.getDate().toString();
          map[key] = [...(map[key] || []), req];
        }
      }
    }
    return map;
  }, [relevantRequests, month, year]);

  const selectedDayRequests = useMemo(() => {
    if (!selectedDay) return [];
    return relevantRequests.filter(r => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      return selectedDay >= start && selectedDay <= end;
    });
  }, [selectedDay, relevantRequests]);

  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const navMonth = (dir: -1 | 1) => {
    setViewDate(d => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() + dir);
      return nd;
    });
    setSelectedDay(null);
  };

  const DEPARTMENTS: Department[] = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales'];

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppTopbar
          title="Workforce Calendar"
          pendingCount={pending.length}
          onNewRequest={() => setModalOpen(true)}
        />
        <div className="app-content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
                  Workforce Calendar
                </h2>
                <p style={{ marginTop: 4, color: 'var(--color-text-60)' }}>
                  Approved leave events, pending requests, and team availability across departments.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <PlusCircle size={14} />
                  <span>+ Apply Leave</span>
                </button>

                <select
                  className="form-select"
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value as 'all' | Department)}
                  aria-label="Department filter"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className="topbar-btn" onClick={() => navMonth(-1)} aria-label="Previous month">
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', minWidth: 140, textAlign: 'center' }}>
                    {MONTHS[month]} {year}
                  </span>
                  <button className="topbar-btn" onClick={() => navMonth(1)} aria-label="Next month">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-lg)' }}>
              {/* Calendar Grid */}
              <div className="card">
                <div className="card-body">
                  {/* Weekday headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                    {WEEKDAYS.map(d => (
                      <div key={d} style={{
                        textAlign: 'center', fontSize: '0.75rem', fontWeight: 700,
                        color: 'var(--color-text-40)', padding: '6px 0',
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                    {days.map((day, i) => {
                      if (!day) return <div key={i} style={{ minHeight: 80, borderRadius: 8, background: 'rgba(29,45,68,0.1)' }} />;
                      const dayReqs = requestsByDay[day.toString()] || [];
                      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                      const thisDate = new Date(year, month, day);
                      const isSelected = selectedDay && isSameDay(thisDate, selectedDay);

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDay(isSelected ? null : thisDate)}
                          style={{
                            minHeight: 80,
                            borderRadius: 8,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            border: isSelected
                              ? '1.5px solid var(--color-accent)'
                              : isToday
                              ? '1.5px solid var(--color-primary)'
                              : '1px solid rgba(240,235,216,0.08)',
                            background: isToday
                              ? 'rgba(62,92,118,0.25)'
                              : isSelected
                              ? 'rgba(116,140,171,0.2)'
                              : 'var(--color-bg-deep)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{
                              fontSize: '0.75rem', fontWeight: isToday ? 800 : 600,
                              color: isToday ? 'var(--color-accent)' : 'var(--color-text)',
                            }}>
                              {day}
                            </span>
                            {dayReqs.length > 0 && (
                              <span style={{
                                fontSize: '0.625rem', padding: '1px 5px', borderRadius: 4,
                                background: 'rgba(62,92,118,0.4)', color: 'var(--color-text)', fontWeight: 700
                              }}>
                                {dayReqs.length}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {dayReqs.slice(0, 2).map((r, ri) => (
                              <div
                                key={ri}
                                style={{
                                  fontSize: '0.625rem',
                                  padding: '1px 4px',
                                  borderRadius: 3,
                                  background: r.status === 'pending' ? 'rgba(196,132,42,0.2)' : 'rgba(74,140,111,0.2)',
                                  color: r.status === 'pending' ? '#E8A84A' : '#5CBA8C',
                                  borderLeft: `2px solid ${LEAVE_COLORS[r.leaveType] || '#3E5C76'}`,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontWeight: 500
                                }}
                              >
                                {r.employeeName.split(' ')[0]}: {r.leaveType}
                              </div>
                            ))}
                            {dayReqs.length > 2 && (
                              <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-40)', textAlign: 'right' }}>
                                +{dayReqs.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Side Details Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {selectedDay ? (
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <span className="card-title" style={{ fontSize: '0.9375rem' }}>
                          {selectedDay.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)' }}>
                          {selectedDayRequests.length} absence{selectedDayRequests.length !== 1 ? 's' : ''} scheduled
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedDay(null)}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="card-body">
                      {selectedDayRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-40)', fontSize: '0.875rem' }}>
                          Full team available on this day.
                          <div style={{ marginTop: 12 }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setModalOpen(true)}
                            >
                              + Apply for Leave
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {selectedDayRequests.map(req => (
                            <div key={req.id} style={{
                              padding: 12,
                              background: 'var(--color-bg-deep)',
                              borderRadius: 8,
                              border: 'var(--border-subtle)',
                              borderLeft: `3px solid ${LEAVE_COLORS[req.leaveType] || 'var(--color-primary)'}`,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                                  {req.employeeName}
                                </span>
                                <span style={{
                                  fontSize: '0.6875rem', padding: '2px 6px', borderRadius: 4,
                                  background: req.status === 'pending' ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                                  color: req.status === 'pending' ? '#E8A84A' : '#5CBA8C',
                                  fontWeight: 600,
                                }}>
                                  {req.status}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginBottom: 2 }}>
                                {req.leaveType} ({req.days} days)
                              </div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
                                {req.department} • {req.designation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-40)' }}>
                    <CalendarIcon size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-60)' }}>
                      Select a date
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                      Click any day on the calendar to inspect active workforce coverage and request details.
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Leave Type Breakdown</span>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.entries(LEAVE_COLORS).map(([type, color]) => {
                      const count = relevantRequests.filter(r => r.leaveType === type).length;
                      return (
                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--color-text-60)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                            {type}
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* New Request Modal */}
      <NewLeaveRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultStartDate={selectedDay ? selectedDay.toISOString().split('T')[0] : undefined}
      />
    </div>
  );
}

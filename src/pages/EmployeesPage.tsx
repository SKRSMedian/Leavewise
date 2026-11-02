import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AppSidebar, AppTopbar } from '../components/layout/AppLayout';
import { Search, ChevronRight, Mail, Briefcase, Calendar } from 'lucide-react';
import { Employee, Department } from '../data/mockData';

function StatusDot({ status }: { status: 'active' | 'on-leave' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: status === 'active' ? 'var(--color-success)' : '#E8A84A',
        animation: status === 'active' ? 'pulse 2s infinite' : 'none',
      }} />
      <span style={{ fontSize: '0.75rem', color: status === 'active' ? '#5CBA8C' : '#E8A84A', fontWeight: 500 }}>
        {status === 'active' ? 'Active' : 'On Leave'}
      </span>
    </div>
  );
}

function EmployeeDetailPanel({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const { leaveRequests } = useStore();
  const empRequests = leaveRequests.filter(r => r.employeeId === emp.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--color-bg-panel)',
        border: 'var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'sticky',
        top: 'calc(var(--topbar-height) + 24px)',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-deep)',
        padding: '24px 20px',
        borderBottom: 'var(--border-subtle)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-40)' }}
        >×</button>
        <div style={{
          width: 56, height: 56, borderRadius: 12, background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)',
        }}>
          {emp.avatar}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: 2 }}>{emp.name}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-60)' }}>{emp.designation}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: 2 }}>{emp.department}</div>
        </div>
        <StatusDot status={emp.status} />
      </div>

      {/* Details */}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {[
            { icon: Mail, label: 'Email', value: emp.email },
            { icon: Briefcase, label: 'Role', value: emp.role.charAt(0).toUpperCase() + emp.role.slice(1) },
            { icon: Calendar, label: 'Joined', value: new Date(emp.joinDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary-20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={12} color="var(--color-accent)" />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-60)' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Leave Balances */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-40)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Leave Balance
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {Object.entries(emp.leaveBalance).filter(([, v]) => v > 0).map(([type, days]) => (
            <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-60)' }}>{type}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{days} days</span>
            </div>
          ))}
        </div>

        {/* Recent Requests */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-40)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Recent Requests
        </div>
        {empRequests.slice(0, 4).length === 0 ? (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-40)' }}>No requests found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {empRequests.slice(0, 4).map(r => (
              <div key={r.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 10px', background: 'var(--color-bg-deep)',
                borderRadius: 6, border: 'var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)' }}>{r.leaveType}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
                    {new Date(r.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6875rem', padding: '2px 6px', borderRadius: 4, fontWeight: 600,
                  background: r.status === 'approved' ? 'var(--color-success-bg)' : r.status === 'rejected' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                  color: r.status === 'approved' ? '#5CBA8C' : r.status === 'rejected' ? '#E06060' : '#E8A84A',
                }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function EmployeesPage() {
  const { employees, getPendingRequests } = useStore();
  const pending = getPendingRequests();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | Department>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState<Employee | null>(null);

  const filtered = employees.filter(e => {
    const matchSearch = search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.department === deptFilter;
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    return matchSearch && matchDept && matchRole;
  });

  const DEPARTMENTS: Department[] = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales'];

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppTopbar title="Employees" pendingCount={pending.length} />
        <div className="app-content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Employee Directory</h2>
              <p style={{ marginTop: 4 }}>{employees.length} employees across {DEPARTMENTS.length} departments.</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-40)' }} />
                <input
                  type="text" className="form-input"
                  placeholder="Search name, role or email..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 36 }}
                  id="employees-search"
                />
              </div>
              <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value as any)} aria-label="Department filter">
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} aria-label="Role filter">
                <option value="all">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 'var(--space-lg)' }}>
              {/* Employee Table */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Leave Balance</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(emp => (
                      <tr
                        key={emp.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelected(s => s?.id === emp.id ? null : emp)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', flexShrink: 0,
                            }}>
                              {emp.avatar}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>{emp.name}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>{emp.department}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 600,
                            background: 'var(--color-primary-20)', color: 'var(--color-accent)',
                            textTransform: 'capitalize',
                          }}>
                            {emp.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)' }}>
                            <strong>{emp.leaveBalance.Annual}</strong>
                            <span style={{ color: 'var(--color-text-40)' }}> annual</span>
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
                            {emp.leaveBalance.Sick} sick
                          </div>
                        </td>
                        <td><StatusDot status={emp.status} /></td>
                        <td style={{ color: 'var(--color-text-40)' }}>
                          <ChevronRight size={14} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detail panel */}
              {selected && (
                <EmployeeDetailPanel emp={selected} onClose={() => setSelected(null)} />
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

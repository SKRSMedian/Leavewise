import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AppSidebar, AppTopbar } from '../components/layout/AppLayout';
import { NewLeaveRequestModal } from '../components/modals/NewLeaveRequestModal';
import {
  Search, Filter, Check, X, ChevronDown, ChevronUp,
  PlusCircle, AlertTriangle, Sparkles, CheckCircle2, Clock
} from 'lucide-react';
import { LeaveRequest } from '../data/mockData';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'badge-status badge-pending',
    approved: 'badge-status badge-approved',
    rejected: 'badge-status badge-rejected',
  };
  return (
    <span className={map[status] || 'badge-status'}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AIBadge({ rec }: { rec: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    approve: { bg: 'var(--color-success-bg)', text: '#5CBA8C' },
    reject: { bg: 'var(--color-danger-bg)', text: '#E06060' },
    review: { bg: 'rgba(116,140,171,0.18)', text: 'var(--color-accent)' },
  };
  const c = colors[rec] || colors.review;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 4,
      background: c.bg, color: c.text,
      fontSize: '0.6875rem', fontWeight: 700,
    }}>
      <Sparkles size={10} />
      {rec === 'approve' ? 'Recommended: Approve' : rec === 'reject' ? 'Recommended: Reject' : 'Requires Review'}
    </span>
  );
}

function RequestRow({
  req,
  onApprove,
  onReject
}: {
  req: LeaveRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const { user } = useStore();

  const isPending = req.status === 'pending';

  return (
    <>
      <tr
        style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
        onClick={() => setExpanded(e => !e)}
        className="request-row-item"
      >
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 6, background: 'var(--color-primary-20)',
              border: 'var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', flexShrink: 0,
            }}>
              {req.employeeName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                {req.employeeName}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
                {req.designation} • {req.department}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.875rem' }}>
            {req.leaveType}
          </span>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
            {req.days} working day{req.days > 1 ? 's' : ''}
          </div>
        </td>
        <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-60)' }}>
          <div>
            {new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            {' → '}
            {new Date(req.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
            Requested {new Date(req.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </div>
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="priority-bar" style={{ width: 50, height: 5 }}>
              <div
                className="priority-fill"
                style={{
                  width: `${req.priorityScore}%`,
                  background: req.priorityScore > 80 ? '#5CBA8C' : req.priorityScore > 50 ? 'var(--color-accent)' : '#E06060'
                }}
              />
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {req.priorityScore}
            </span>
          </div>
        </td>
        <td>
          <AIBadge rec={req.aiRecommendation} />
        </td>
        <td>
          <StatusBadge status={req.status} />
        </td>
        <td onClick={e => e.stopPropagation()}>
          {isPending ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className="btn btn-success btn-sm"
                onClick={() => onApprove(req.id)}
                title="Approve this leave request"
                id={`approve-${req.id}`}
                style={{ padding: '5px 10px', fontSize: '0.75rem', fontWeight: 600 }}
              >
                <Check size={12} /> Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { setShowRejectForm(true); setExpanded(true); }}
                title="Reject with note"
                id={`reject-${req.id}`}
                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
              >
                <X size={12} /> Reject
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)' }}>
              {req.reviewedBy ? `Reviewed by ${req.reviewedBy}` : 'Processed'}
            </div>
          )}
        </td>
        <td style={{ color: 'var(--color-text-40)', textAlign: 'right' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>

      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={8} style={{ padding: 0, border: 'none' }}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  background: 'rgba(13,19,33,0.7)',
                  borderTop: 'var(--border-subtle)',
                  borderBottom: 'var(--border-subtle)',
                  padding: '18px 24px',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: 24,
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Reason for Leave
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6, background: 'rgba(29,45,68,0.4)', padding: 12, borderRadius: 6, border: 'var(--border-subtle)' }}>
                      "{req.reason}"
                    </p>

                    {req.reviewNote && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-40)', marginBottom: 4, textTransform: 'uppercase' }}>
                          Manager Review Decision Note
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: req.status === 'approved' ? '#5CBA8C' : '#E06060' }}>
                          {req.reviewNote}
                        </p>
                      </div>
                    )}

                    {showRejectForm && isPending && (
                      <div style={{ marginTop: 16, background: 'var(--color-bg-deep)', padding: 14, borderRadius: 8, border: '1px solid rgba(224,96,96,0.3)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E06060', marginBottom: 6 }}>
                          Specify Reason for Rejection:
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Critical project milestone / minimum staffing breached..."
                          value={rejectNote}
                          onChange={e => setRejectNote(e.target.value)}
                          style={{ marginBottom: 10, width: '100%' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              onReject(req.id, rejectNote.trim() || 'Department staffing constraints prevent approval.');
                              setShowRejectForm(false);
                            }}
                          >
                            Confirm Rejection
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setShowRejectForm(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={12} /> AI Heuristic Rationale
                    </div>
                    <div style={{
                      background: 'var(--color-bg-deep)', borderRadius: 8, padding: 14,
                      border: 'var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--color-text)',
                      lineHeight: 1.6,
                    }}>
                      {req.aiReason}
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-40)' }}>
                      <span>Ref ID: <code>{req.id}</code></span>
                      <span>Department: <strong>{req.department}</strong></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

export function RequestsPage() {
  const { leaveRequests, approveRequest, rejectRequest, getPendingRequests, getMyRequests, user } = useStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'my'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const pendingList = getPendingRequests();
  const myList = getMyRequests();

  const handleApprove = (id: string) => {
    approveRequest(id, `Approved by ${user?.name || 'Manager'}`);
    setActionAlert('Leave request successfully APPROVED!');
    setTimeout(() => setActionAlert(null), 3000);
  };

  const handleReject = (id: string, note: string) => {
    rejectRequest(id, note);
    setActionAlert('Leave request REJECTED.');
    setTimeout(() => setActionAlert(null), 3000);
  };

  const filtered = leaveRequests.filter(r => {
    // Tab filter
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'approved' && r.status !== 'approved') return false;
    if (activeTab === 'rejected' && r.status !== 'rejected') return false;
    if (activeTab === 'my' && r.employeeId !== user?.id && r.employeeName !== user?.name) return false;

    // Search filter
    const matchSearch = search === '' ||
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.leaveType.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());

    // Type & Dept filters
    const matchType = typeFilter === 'all' || r.leaveType === typeFilter;
    const matchDept = deptFilter === 'all' || r.department === deptFilter;

    return matchSearch && matchType && matchDept;
  });

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppTopbar
          title="Leave Requests"
          pendingCount={pendingList.length}
          onNewRequest={() => setModalOpen(true)}
        />

        <div className="app-content">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header row with Title and Apply Button */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 16
            }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
                  Leave Requests
                </h2>
                <p style={{ marginTop: 4, color: 'var(--color-text-60)', fontSize: '0.9375rem' }}>
                  Manage, approve, or reject employee leave requests with automated AI conflict analysis.
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setModalOpen(true)}
                id="requests-apply-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
              >
                <PlusCircle size={16} />
                <span>+ Apply for Leave</span>
              </button>
            </div>

            {/* Notification alert toast */}
            <AnimatePresence>
              {actionAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: actionAlert.includes('APPROVED') ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                    border: `1px solid ${actionAlert.includes('APPROVED') ? '#5CBA8C' : '#E06060'}`,
                    color: actionAlert.includes('APPROVED') ? '#5CBA8C' : '#E06060',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 18px',
                    marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: '0.875rem', fontWeight: 600
                  }}
                >
                  <CheckCircle2 size={16} />
                  {actionAlert}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Tabs */}
            <div style={{
              display: 'flex', gap: 8, marginBottom: 16, borderBottom: 'var(--border-subtle)',
              paddingBottom: 12, overflowX: 'auto'
            }}>
              {[
                { id: 'all', label: 'All Requests', count: leaveRequests.length },
                { id: 'pending', label: 'Pending Review', count: pendingList.length, highlight: pendingList.length > 0 },
                { id: 'approved', label: 'Approved', count: leaveRequests.filter(r => r.status === 'approved').length },
                { id: 'rejected', label: 'Rejected', count: leaveRequests.filter(r => r.status === 'rejected').length },
                { id: 'my', label: 'My Submissions', count: myList.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(29,45,68,0.5)',
                    color: activeTab === tab.id ? '#fff' : 'var(--color-text-60)',
                    border: activeTab === tab.id ? 'var(--border-accent)' : 'var(--border-subtle)',
                    fontSize: '0.8125rem', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 100, fontSize: '0.6875rem',
                    background: tab.highlight ? 'var(--color-warning)' : 'rgba(13,19,33,0.5)',
                    color: tab.highlight ? '#000' : 'inherit',
                    fontWeight: 700
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Dropdown Filter Row */}
            <div style={{
              display: 'flex', gap: 12, marginBottom: 'var(--space-lg)',
              flexWrap: 'wrap', alignItems: 'center',
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={14} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-40)',
                }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by employee name, reason, or department..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 36, width: '100%' }}
                  id="requests-search"
                />
              </div>

              <select
                className="form-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                aria-label="Filter by Leave Type"
              >
                <option value="all">All Leave Types</option>
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
                <option value="Emergency">Emergency</option>
                <option value="Maternity">Maternity</option>
                <option value="Paternity">Paternity</option>
              </select>

              <select
                className="form-select"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                aria-label="Filter by Department"
              >
                <option value="all">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>

              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-40)', whiteSpace: 'nowrap' }}>
                Showing <strong>{filtered.length}</strong> request{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Main Table Card */}
            <div className="card" style={{ overflow: 'hidden' }}>
              {filtered.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 20px' }}>
                  <Filter size={36} />
                  <h4 style={{ margin: '12px 0 4px 0' }}>No leave requests found</h4>
                  <p style={{ color: 'var(--color-text-40)', margin: '0 0 16px 0' }}>
                    No records match your selected filter criteria.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setModalOpen(true)}
                  >
                    + Apply for Leave
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>Duration / Dates</th>
                        <th>Priority Score</th>
                        <th>AI Recommendation</th>
                        <th>Status</th>
                        <th>Actions</th>
                        <th style={{ width: 40 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(req => (
                        <RequestRow
                          key={req.id}
                          req={req}
                          onApprove={handleApprove}
                          onReject={handleReject}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
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

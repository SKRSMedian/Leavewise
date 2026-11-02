import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { LeaveType, Department } from '../../data/mockData';
import { X, Sparkles, AlertCircle, CheckCircle2, Calendar, Clock, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStartDate?: string;
}

export function NewLeaveRequestModal({ isOpen, onClose, defaultStartDate }: Props) {
  const { user, employees, submitRequest, leaveRequests } = useStore();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 3);
  const nextDayStr = nextDay.toISOString().split('T')[0];

  const [selectedEmpId, setSelectedEmpId] = useState(user?.id || 'emp-001');
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState(defaultStartDate || tomorrowStr);
  const [endDate, setEndDate] = useState(nextDayStr);
  const [reason, setReason] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Calculate day count
  const days = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  // Live AI Preview calculation
  const aiPreview = useMemo(() => {
    const balance = selectedEmployee.leaveBalance[leaveType] || 10;
    const isExceeded = days > balance;
    
    let score = 70;
    let rec: 'approve' | 'review' | 'reject' = 'approve';
    let rationale = 'Leave is within normal policy boundaries and team limits.';

    if (isEmergency) {
      score = 96;
      rec = 'approve';
      rationale = 'Urgent circumstance flag applied. Emergency queue priority.';
    } else if (isExceeded) {
      score = 35;
      rec = 'reject';
      rationale = `Requested ${days} days exceeds available ${leaveType} balance (${balance} days).`;
    } else if (days > 5) {
      score = 64;
      rec = 'review';
      rationale = 'Extended absence spans more than one week. Manager coverage review advised.';
    } else {
      score = 82;
      rec = 'approve';
      rationale = `Balance confirmed (${balance} days available). Department minimum staffing satisfied.`;
    }

    return { score, rec, rationale, balance, isExceeded };
  }, [leaveType, days, isEmergency, selectedEmployee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      submitRequest({
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        department: selectedEmployee.department,
        designation: selectedEmployee.designation,
        leaveType,
        startDate,
        endDate,
        days,
        reason: reason.trim() || `Scheduled ${leaveType} leave for personal commitments.`,
      });

      setSubmitting(false);
      setSuccessMsg(true);

      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1200);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13, 19, 33, 0.75)', backdropFilter: 'blur(6px)',
        padding: 16
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        style={{
          background: 'var(--color-bg-panel)',
          border: 'var(--border-accent)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 560,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: 'var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--color-primary-20)',
              border: 'var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-accent)'
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                Apply for Leave
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-40)', margin: 0 }}>
                Submit a new leave request for automated AI validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6 }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {successMsg ? (
            <div style={{
              padding: 32, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'var(--color-success-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5CBA8C'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#5CBA8C' }}>
                Request Submitted!
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-60)', margin: 0 }}>
                Your leave request has been evaluated by the AI engine and sent to the manager's queue.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Employee selection */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Applicant Employee</span>
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.75rem' }}>
                    {selectedEmployee.department}
                  </span>
                </label>
                <select
                  className="form-select"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.designation} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type and Emergency toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select
                    className="form-select"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Paternity">Paternity Leave</option>
                  </select>
                </div>

                <div className="form-group" style={{ justifyContent: 'center' }}>
                  <label className="form-label">Priority Flag</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8, height: 42,
                    background: 'var(--color-bg-deep)', padding: '0 12px',
                    borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)',
                    cursor: 'pointer', fontSize: '0.8125rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={isEmergency}
                      onChange={(e) => setIsEmergency(e.target.checked)}
                      style={{ accentColor: '#E06060' }}
                    />
                    <span style={{ color: isEmergency ? '#E06060' : 'var(--color-text-60)', fontWeight: 600 }}>
                      Mark as Urgent
                    </span>
                  </label>
                </div>
              </div>

              {/* Date pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label className="form-label">Reason / Justification</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Annual family travel, scheduled medical appointment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              {/* AI Engine Live Evaluation Banner */}
              <div style={{
                background: 'rgba(13, 19, 33, 0.6)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    <Sparkles size={14} /> AI Decision Engine Evaluation
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                      background: aiPreview.rec === 'approve' ? 'var(--color-success-bg)' : aiPreview.rec === 'reject' ? 'var(--color-danger-bg)' : 'rgba(116,140,171,0.15)',
                      color: aiPreview.rec === 'approve' ? '#5CBA8C' : aiPreview.rec === 'reject' ? '#E06060' : 'var(--color-accent)'
                    }}>
                      AI Rec: {aiPreview.rec.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Score: {aiPreview.score}/100
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-60)', margin: 0 }}>
                  {aiPreview.rationale} • <strong>{days} working day{days > 1 ? 's' : ''}</strong> requested • <strong>{aiPreview.balance} days</strong> available balance.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  id="submit-leave-request-btn"
                  style={{ minWidth: 150, justifyContent: 'center' }}
                >
                  {submitting ? 'Evaluating...' : 'Submit Request'}
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}

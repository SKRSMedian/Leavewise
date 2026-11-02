import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AppSidebar, AppTopbar } from '../components/layout/AppLayout';
import { Lock, Save, AlertCircle } from 'lucide-react';
import { LEAVE_POLICIES, STAFFING_MINIMUMS, ALGORITHM_WEIGHTS, Department } from '../data/mockData';

function SectionCard({ title, subtitle, children, locked = false }: {
  title: string; subtitle: string; children: React.ReactNode; locked?: boolean
}) {
  return (
    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
      <div className="card-header">
        <div>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {title}
            {locked && <Lock size={13} color="var(--color-text-40)" />}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-40)', marginTop: 2 }}>{subtitle}</div>
        </div>
        {!locked && (
          <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={12} /> Save
          </button>
        )}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user, getPendingRequests } = useStore();
  const pending = getPendingRequests();
  const isAdmin = user?.role === 'admin';

  const [weights, setWeights] = useState({ ...ALGORITHM_WEIGHTS });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppTopbar title="Settings" pendingCount={pending.length} />
        <div className="app-content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Settings</h2>
              <p style={{ marginTop: 4 }}>Configure leave policies, staffing minimums, and algorithm parameters.</p>
            </div>

            {!isAdmin && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', marginBottom: 24,
                background: 'rgba(196,132,42,0.1)',
                border: '1px solid rgba(196,132,42,0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem', color: '#E8A84A',
              }}>
                <AlertCircle size={16} />
                View-only. Admin or HR access required to modify policies.
              </div>
            )}

            {/* Leave Policies */}
            <SectionCard
              title="Leave Policies"
              subtitle="Maximum days, consecutive limits, and advance notice requirements"
              locked={!isAdmin}
            >
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Max Per Year</th>
                      <th>Max Consecutive</th>
                      <th>Advance Notice (days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(LEAVE_POLICIES).map(([type, policy]) => (
                      <tr key={type}>
                        <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{type}</td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            defaultValue={policy.maxPerYear}
                            disabled={!isAdmin}
                            style={{ width: 80, padding: '6px 10px', fontSize: '0.875rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            defaultValue={policy.maxConsecutive}
                            disabled={!isAdmin}
                            style={{ width: 80, padding: '6px 10px', fontSize: '0.875rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            defaultValue={policy.advanceNoticeDays}
                            disabled={!isAdmin}
                            style={{ width: 80, padding: '6px 10px', fontSize: '0.875rem' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Staffing Minimums */}
            <SectionCard
              title="Minimum Staffing Requirements"
              subtitle="Minimum available employees per department before leave requests are restricted"
              locked={!isAdmin}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {Object.entries(STAFFING_MINIMUMS).map(([dept, min]) => (
                  <div key={dept} style={{
                    background: 'var(--color-bg-deep)',
                    border: 'var(--border-subtle)',
                    borderRadius: 8,
                    padding: 14,
                  }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>{dept}</div>
                    <input
                      type="number"
                      className="form-input"
                      defaultValue={min}
                      disabled={!isAdmin}
                      style={{ width: '100%', padding: '6px 10px', fontSize: '0.875rem' }}
                    />
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)', marginTop: 4 }}>minimum staff</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Algorithm Weights */}
            <SectionCard
              title="Priority Scoring Weights"
              subtitle="Adjust the weight of each factor in the priority scoring algorithm"
              locked={!isAdmin}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(weights).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    leaveBalance: 'Leave Balance Adequacy',
                    urgency: 'Leave Urgency (Fuzzy)',
                    advanceNotice: 'Advance Notice',
                    staffingImpact: 'Staffing Impact',
                    historicalAbsence: 'Historical Absence',
                  };
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-60)' }}>{labels[key]}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                          {(val * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0} max={1} step={0.05}
                        value={val}
                        disabled={!isAdmin}
                        onChange={e => setWeights(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                        style={{
                          width: '100%', accentColor: 'var(--color-accent)',
                          cursor: isAdmin ? 'pointer' : 'not-allowed',
                        }}
                      />
                    </div>
                  );
                })}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>
                      <Save size={12} /> Save Weights
                    </button>
                    {saved && (
                      <span style={{ fontSize: '0.8125rem', color: '#5CBA8C' }}>✓ Saved</span>
                    )}
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-40)' }}>
                      Total: {(Object.values(weights).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
                      {Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 0.01 && (
                        <span style={{ color: '#E8A84A', marginLeft: 4 }}>
                          (should sum to 100%)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* User Preferences */}
            <SectionCard
              title="User Preferences"
              subtitle="Personal notification and display settings"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Email notifications for new requests', defaultChecked: true },
                  { label: 'Push notifications for approvals', defaultChecked: true },
                  { label: 'Weekly workforce summary email', defaultChecked: false },
                  { label: 'Show AI recommendations by default', defaultChecked: true },
                ].map((pref, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ position: 'relative' }}>
                      <input type="checkbox" defaultChecked={pref.defaultChecked} style={{ accentColor: 'var(--color-accent)', width: 16, height: 16 }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-60)' }}>{pref.label}</span>
                  </label>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AppSidebar, AppTopbar } from '../components/layout/AppLayout';
import { Play, Info, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  checkEligibility, computePriorityScore, checkConstraints,
  runSimulation, bayesianStaffingRisk, fuzzyClassifyRisk,
  EligibilityResult, PriorityResult, CSPResult, SimulationResult
} from '../algorithms/engine';
import { LeaveRequest, Department, STAFFING_MINIMUMS } from '../data/mockData';

const ALGO_CARDS = [
  {
    id: 'rule',
    title: 'Rule-Based Expert System',
    tag: 'Policy Validation',
    desc: 'Validates each request against company leave policies. Checks leave balance, annual caps, advance notice requirements, consecutive day limits, and duplicate request detection.',
    color: '#3E5C76',
  },
  {
    id: 'csp',
    title: 'Constraint Satisfaction Problem',
    tag: 'Workforce Feasibility',
    desc: 'Determines whether approving a request violates hard staffing constraints. Uses backtracking to find feasible allocations that keep departments above minimum thresholds.',
    color: '#4A8C6F',
  },
  {
    id: 'priority',
    title: 'Weighted Priority Scoring',
    tag: 'Request Ranking',
    desc: 'Computes a 0–100 priority score using five weighted factors: leave balance adequacy, urgency classification, advance notice, staffing impact, and historical absence patterns.',
    color: '#748CAB',
  },
  {
    id: 'fuzzy',
    title: 'Fuzzy Logic Risk Classification',
    tag: 'Urgency & Risk',
    desc: 'Classifies staffing risk as Low, Moderate, High, or Critical using fuzzy membership functions on absence ratio, staffing margin, and period criticality.',
    color: '#C4842A',
  },
  {
    id: 'bayesian',
    title: 'Bayesian Risk Estimation',
    tag: 'Staffing Probability',
    desc: "Computes P(shortage | current absences) using Bayes' theorem with a prior absence rate, updating based on real-time department data.",
    color: '#6F4A8C',
  },
  {
    id: 'greedy',
    title: 'Greedy Priority Allocation',
    tag: 'Batch Processing',
    desc: 'Processes pending requests in priority order, greedily allocating approvals while maintaining constraint feasibility for each successive approval.',
    color: '#4A6F8C',
  },
];

function AlgoCard({ algo }: { algo: typeof ALGO_CARDS[0] }) {
  return (
    <div style={{
      background: 'var(--color-bg-panel)',
      border: 'var(--border-subtle)',
      borderLeft: `3px solid ${algo.color}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-lg)',
      transition: 'border-color var(--transition-fast)',
    }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: algo.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {algo.tag}
      </div>
      <h4 style={{ fontSize: '1rem', marginBottom: 8 }}>{algo.title}</h4>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-60)', lineHeight: 1.65 }}>{algo.desc}</p>
    </div>
  );
}

function EligibilityPanel({ result }: { result: EligibilityResult }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {result.eligible ? (
          <><CheckCircle size={16} color="#5CBA8C" /> <span style={{ fontWeight: 600, color: '#5CBA8C' }}>Eligible</span></>
        ) : (
          <><XCircle size={16} color="#E06060" /> <span style={{ fontWeight: 600, color: '#E06060' }}>Ineligible</span></>
        )}
      </div>
      <div className="algo-panel">
        {result.rules.map((r, i) => (
          <div key={i} className="algo-step">
            <span className="step-num">{i + 1}.</span>
            <span className={`step-status ${r.pass ? 'pass' : 'fail'}`}>{r.pass ? '✓' : '✗'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{r.rule}</div>
              <div style={{ color: 'rgba(240,235,216,0.5)', fontSize: '0.75rem' }}>{r.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityPanel({ result }: { result: PriorityResult }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>{result.score}</div>
        <div style={{ flex: 1 }}>
          <div className="priority-bar" style={{ height: 8, borderRadius: 4 }}>
            <div className="priority-fill" style={{ width: `${result.score}%`, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)', marginTop: 4 }}>Priority Score / 100</div>
        </div>
      </div>
      <div className="algo-panel">
        {result.breakdown.map((b, i) => (
          <div key={i} className="algo-step">
            <span className="step-num">{i + 1}.</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{b.factor}</span>
                <span style={{ color: 'var(--color-accent)' }}>+{b.contribution}</span>
              </div>
              <div style={{ color: 'rgba(240,235,216,0.5)', fontSize: '0.75rem' }}>
                Score: {b.score}/100 × Weight: {(b.weight * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CSPPanel({ result }: { result: CSPResult }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {result.feasible ? (
          <><CheckCircle size={16} color="#5CBA8C" /> <span style={{ fontWeight: 600, color: '#5CBA8C' }}>Feasible — No constraint violations</span></>
        ) : (
          <><AlertTriangle size={16} color="#E8A84A" /> <span style={{ fontWeight: 600, color: '#E8A84A' }}>Infeasible — Constraints violated</span></>
        )}
      </div>
      <div className="algo-panel">
        {result.constraints.map((c, i) => (
          <div key={i} className="algo-step">
            <span className="step-num">{i + 1}.</span>
            <span className={`step-status ${c.satisfied ? 'pass' : 'fail'}`}>{c.satisfied ? '✓' : '✗'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{c.constraint}</div>
              <div style={{ color: 'rgba(240,235,216,0.5)', fontSize: '0.75rem' }}>{c.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimulationResults({ result }: { result: SimulationResult }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary */}
      <div style={{
        background: 'var(--color-bg-panel)', border: 'var(--border-subtle)',
        borderRadius: 'var(--radius-md)', padding: 16,
        fontSize: '0.875rem', color: 'var(--color-accent)',
      }}>
        <Info size={14} style={{ display: 'inline', marginRight: 6 }} />
        {result.summary}
      </div>

      {/* Rankings */}
      <div>
        <h5 style={{ marginBottom: 12, color: 'var(--color-text-60)' }}>Priority Rankings</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {result.rankings.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: 'var(--color-bg-deep)',
              borderRadius: 6, border: 'var(--border-subtle)',
              borderLeft: `3px solid ${result.approved.find(a => a.id === r.request.id) ? '#5CBA8C' : '#8C4A4A'}`,
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-40)', minWidth: 20 }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                  {r.request.employeeName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)' }}>{r.reason}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>{r.score}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>score</div>
              </div>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 600,
                background: result.approved.find(a => a.id === r.request.id) ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                color: result.approved.find(a => a.id === r.request.id) ? '#5CBA8C' : '#E06060',
              }}>
                {result.approved.find(a => a.id === r.request.id) ? 'Allocated' : 'Deferred'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Department Risk */}
      {Object.keys(result.staffingImpact).length > 0 && (
        <div>
          <h5 style={{ marginBottom: 12, color: 'var(--color-text-60)' }}>Department Staffing Impact</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(result.staffingImpact).map(([dept, impact]) => {
              const bayes = result.bayesianRisk[dept as Department];
              const riskColors: Record<string, string> = { Low: '#5CBA8C', Moderate: '#E8A84A', High: '#E06060', Critical: '#FF4444' };
              return (
                <div key={dept} style={{
                  padding: '12px 16px', background: 'var(--color-bg-deep)',
                  borderRadius: 8, border: 'var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{dept}</span>
                    <span style={{ color: riskColors[impact.risk], fontSize: '0.8125rem', fontWeight: 600 }}>
                      {impact.risk} Risk
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)' }}>
                    Available: {impact.available} (min: {impact.minimum}) ·{' '}
                    Shortage probability: {bayes?.posteriorRisk ?? 0}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function DecisionEnginePage() {
  const { leaveRequests, employees, getPendingRequests } = useStore();
  const pending = getPendingRequests();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    pending.length > 0 ? pending[0].id : null
  );
  const [activeTab, setActiveTab] = useState<'eligibility' | 'priority' | 'csp'>('eligibility');

  const [simSelected, setSimSelected] = useState<Set<string>>(new Set());
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const selectedRequest = leaveRequests.find(r => r.id === selectedRequestId);
  const selectedEmployee = employees.find(e => e.id === selectedRequest?.employeeId);

  const eligibilityResult = useMemo(() => {
    if (!selectedRequest || !selectedEmployee) return null;
    return checkEligibility(selectedRequest, selectedEmployee, leaveRequests);
  }, [selectedRequest, selectedEmployee, leaveRequests]);

  const priorityResult = useMemo(() => {
    if (!selectedRequest || !selectedEmployee) return null;
    return computePriorityScore(selectedRequest, selectedEmployee, leaveRequests);
  }, [selectedRequest, selectedEmployee, leaveRequests]);

  const cspResult = useMemo(() => {
    if (!selectedRequest) return null;
    return checkConstraints(selectedRequest, leaveRequests, employees);
  }, [selectedRequest, leaveRequests, employees]);

  const toggleSimSelect = (id: string) => {
    setSimSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSimResult(null);
  };

  const runSim = async () => {
    setSimRunning(true);
    await new Promise(r => setTimeout(r, 800)); // visual delay
    const selected = leaveRequests.filter(r => simSelected.has(r.id));
    const result = runSimulation(selected, employees, leaveRequests);
    setSimResult(result);
    setSimRunning(false);
  };

  const tabs = [
    { id: 'eligibility', label: 'Policy Eligibility' },
    { id: 'priority', label: 'Priority Score' },
    { id: 'csp', label: 'CSP Constraints' },
  ];

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppTopbar title="AI Decision Centre" pendingCount={pending.length} />
        <div className="app-content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>AI Decision Centre</h2>
              <p style={{ marginTop: 4 }}>
                Inspect algorithm outputs, run workforce allocation simulations, and understand every recommendation.
              </p>
            </div>

            {/* Algorithm Architecture */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>
                Decision Architecture
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {ALGO_CARDS.map(a => <AlgoCard key={a.id} algo={a} />)}
              </div>
            </div>

            {/* Request Inspector */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
              {/* Request selector */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Select Request</span>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {leaveRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-40)' }}>
                      No pending requests
                    </div>
                  ) : (
                    leaveRequests.filter(r => r.status === 'pending').map(req => (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestId(req.id)}
                        style={{
                          padding: '10px 16px', cursor: 'pointer',
                          borderLeft: `2px solid ${req.id === selectedRequestId ? 'var(--color-accent)' : 'transparent'}`,
                          background: req.id === selectedRequestId ? 'var(--color-primary-20)' : 'transparent',
                          transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={e => req.id !== selectedRequestId && (e.currentTarget.style.background = 'rgba(62,92,118,0.1)')}
                        onMouseLeave={e => req.id !== selectedRequestId && (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                          {req.employeeName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>{req.leaveType}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)' }}>
                          {new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' — '}
                          {new Date(req.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Algorithm outputs */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    {selectedRequest ? `Analysis — ${selectedRequest.employeeName}` : 'Select a request to analyse'}
                  </span>
                  {selectedRequest && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {tabs.map(t => (
                        <button
                          key={t.id}
                          className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setActiveTab(t.id as any)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-body">
                  {!selectedRequest ? (
                    <div className="empty-state" style={{ padding: 40 }}>
                      <Info size={32} />
                      <h4>No request selected</h4>
                      <p>Select a pending request from the left panel to run algorithm analysis.</p>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'eligibility' && eligibilityResult && <EligibilityPanel result={eligibilityResult} />}
                      {activeTab === 'priority' && priorityResult && <PriorityPanel result={priorityResult} />}
                      {activeTab === 'csp' && cspResult && <CSPPanel result={cspResult} />}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Simulation Panel */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>
                Workforce Allocation Simulation
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Request Selection */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Select Requests to Simulate</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={runSim}
                      disabled={simSelected.size === 0 || simRunning}
                      id="run-simulation"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {simRunning ? (
                        <><div className="spinner" style={{ width: 14, height: 14 }} /> Running...</>
                      ) : (
                        <><Play size={14} /> Run Simulation</>
                      )}
                    </button>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    {leaveRequests.filter(r => r.status === 'pending').length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-40)', fontSize: '0.875rem' }}>
                        No pending requests to simulate
                      </div>
                    ) : (
                      leaveRequests.filter(r => r.status === 'pending').map(req => (
                        <div
                          key={req.id}
                          onClick={() => toggleSimSelect(req.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 16px', cursor: 'pointer',
                            background: simSelected.has(req.id) ? 'var(--color-primary-20)' : 'transparent',
                            transition: 'background var(--transition-fast)',
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: 4,
                            border: simSelected.has(req.id) ? '1px solid var(--color-accent)' : 'var(--border-default)',
                            background: simSelected.has(req.id) ? 'var(--color-accent)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all var(--transition-fast)',
                          }}>
                            {simSelected.has(req.id) && <CheckCircle size={12} color="#0D1321" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>{req.employeeName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)' }}>
                              {req.leaveType} · {req.department} · Priority: {req.priorityScore}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Simulation Output */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Simulation Results</span>
                  </div>
                  <div className="card-body">
                    {!simResult ? (
                      <div className="empty-state" style={{ padding: 40 }}>
                        <Play size={32} />
                        <h4>No simulation run yet</h4>
                        <p>Select requests and click Run Simulation to see allocation results.</p>
                      </div>
                    ) : (
                      <SimulationResults result={simResult} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

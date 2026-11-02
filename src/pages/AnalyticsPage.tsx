import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { AppSidebar, AppTopbar } from '../components/layout/AppLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const PALETTE = {
  primary: '#3E5C76',
  accent: '#748CAB',
  text: '#F0EBD8',
  bg: '#1D2D44',
  success: '#4A8C6F',
  warning: '#C4842A',
  danger: '#8C4A4A',
};

const CHART_COLORS = [
  '#3E5C76', '#748CAB', '#4A8C6F', '#C4842A', '#8C4A4A', '#4A7A8C', '#6F4A8C'
];

const CustomTooltipStyle = {
  backgroundColor: '#1D2D44',
  border: '1px solid rgba(240,235,216,0.1)',
  borderRadius: 8,
  color: '#F0EBD8',
  fontSize: '0.8125rem',
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export function AnalyticsPage() {
  const { leaveRequests, employees, getPendingRequests } = useStore();
  const pending = getPendingRequests();

  // Monthly trend data (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; approved: number; rejected: number; pending: number; total: number }> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      months[key] = { month: key, approved: 0, rejected: 0, pending: 0, total: 0 };
    }

    for (const req of leaveRequests) {
      const d = new Date(req.submittedAt);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (months[key]) {
        months[key][req.status]++;
        months[key].total++;
      }
    }

    return Object.values(months);
  }, [leaveRequests]);

  // Department-wise distribution
  const deptData = useMemo(() => {
    const dept: Record<string, number> = {};
    for (const req of leaveRequests) {
      dept[req.department] = (dept[req.department] || 0) + 1;
    }
    return Object.entries(dept).map(([name, value]) => ({ name, value }));
  }, [leaveRequests]);

  // Leave type distribution
  const typeData = useMemo(() => {
    const types: Record<string, number> = {};
    for (const req of leaveRequests) {
      types[req.leaveType] = (types[req.leaveType] || 0) + 1;
    }
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [leaveRequests]);

  // Approval stats
  const totalRequests = leaveRequests.length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length;
  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvalRate = totalRequests > 0 ? Math.round((approvedCount / (totalRequests - pendingCount)) * 100) : 0;

  // Average leave duration per type
  const avgDuration = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const req of leaveRequests.filter(r => r.status === 'approved')) {
      if (!map[req.leaveType]) map[req.leaveType] = { total: 0, count: 0 };
      map[req.leaveType].total += req.days;
      map[req.leaveType].count++;
    }
    return Object.entries(map).map(([type, d]) => ({
      type,
      avg: parseFloat((d.total / d.count).toFixed(1)),
    }));
  }, [leaveRequests]);

  // Staffing availability over months (simulated from real data)
  const staffingTrend = useMemo(() => {
    return monthlyData.map(m => ({
      month: m.month,
      available: Math.max(0, employees.length - m.approved),
      onLeave: m.approved,
    }));
  }, [monthlyData, employees.length]);

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppTopbar title="Analytics" pendingCount={pending.length} />
        <div className="app-content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Analytics</h2>
              <p style={{ marginTop: 4 }}>Historical trends, approval rates, and workforce availability metrics.</p>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Requests', value: totalRequests, color: 'var(--color-text)' },
                { label: 'Approval Rate', value: `${approvalRate}%`, color: '#5CBA8C' },
                { label: 'Approved', value: approvedCount, color: '#5CBA8C' },
                { label: 'Rejected', value: rejectedCount, color: '#E06060' },
              ].map((stat, i) => (
                <div key={i} className="metric-card">
                  <div className="metric-label">{stat.label}</div>
                  <div className="metric-value" style={{ color: stat.color, fontSize: '1.75rem' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <ChartCard title="Monthly Leave Trend">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,235,216,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: 'rgba(240,235,216,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(240,235,216,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(62,92,118,0.1)' }} />
                    <Legend
                      wrapperStyle={{ fontSize: '0.75rem', color: 'rgba(240,235,216,0.6)' }}
                    />
                    <Bar dataKey="approved" name="Approved" fill="#4A8C6F" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="rejected" name="Rejected" fill="#8C4A4A" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#C4842A" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Department-Wise Distribution">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={deptData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {deptData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: '0.75rem', color: 'rgba(240,235,216,0.6)' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <ChartCard title="Workforce Availability Trend">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={staffingTrend} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="available" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3E5C76" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3E5C76" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,235,216,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: 'rgba(240,235,216,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(240,235,216,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Area type="monotone" dataKey="available" name="Available" stroke="#3E5C76" fill="url(#available)" strokeWidth={2} />
                    <Area type="monotone" dataKey="onLeave" name="On Leave" stroke="#C4842A" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Avg Leave Duration by Type (days)">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={avgDuration} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,235,216,0.06)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(240,235,216,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="type" type="category" tick={{ fill: 'rgba(240,235,216,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Bar dataKey="avg" name="Avg days" radius={[0, 3, 3, 0]}>
                      {avgDuration.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Leave Type Distribution */}
            <ChartCard title="Leave Type Breakdown — All Requests">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 8 }}>
                {typeData.map((t, i) => (
                  <div key={i} style={{
                    textAlign: 'center', padding: '16px 12px',
                    background: 'var(--color-bg-deep)',
                    borderRadius: 8, border: 'var(--border-subtle)',
                    borderTop: `3px solid ${CHART_COLORS[i % CHART_COLORS.length]}`,
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{t.value}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.name}</div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

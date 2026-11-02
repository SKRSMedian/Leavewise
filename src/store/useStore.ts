import { create } from 'zustand';
import {
  Employee, LeaveRequest, ActivityEvent,
  EMPLOYEES, LEAVE_REQUESTS, ACTIVITY_EVENTS
} from '../data/mockData';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  avatar: string;
  department: string;
  designation: string;
}

interface AppState {
  // Auth
  user: AppUser | null;
  isAuthenticated: boolean;

  // Data
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  activityEvents: ActivityEvent[];

  // UI
  sidebarOpen: boolean;
  isOnline: boolean;

  // Actions
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  switchRole: (role: 'employee' | 'manager' | 'admin') => void;

  // Leave request actions
  submitRequest: (request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status' | 'priorityScore' | 'aiRecommendation' | 'aiReason'>) => LeaveRequest;
  approveRequest: (requestId: string, note?: string) => void;
  rejectRequest: (requestId: string, note: string) => void;

  // Computed
  getPendingRequests: () => LeaveRequest[];
  getMyRequests: () => LeaveRequest[];
  getEmployeesOnLeaveToday: () => Employee[];
}

// Demo credentials
const DEMO_ACCOUNTS: Record<string, { password: string; employeeId: string }> = {
  'arjun.sharma@company.com': { password: 'employee123', employeeId: 'emp-001' },
  'deepak.mehta@company.com': { password: 'manager123', employeeId: 'emp-007' },
  'meera.joshi@company.com': { password: 'admin123', employeeId: 'emp-010' },
  'demo@leavewise.com': { password: 'demo123', employeeId: 'emp-007' },
};

const DEFAULT_USER: AppUser = {
  id: 'emp-007',
  name: 'Deepak Mehta',
  email: 'deepak.mehta@company.com',
  role: 'manager',
  avatar: 'DM',
  department: 'Engineering',
  designation: 'Engineering Manager',
};

export const useStore = create<AppState>((set, get) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  employees: EMPLOYEES,
  leaveRequests: LEAVE_REQUESTS,
  activityEvents: ACTIVITY_EVENTS,
  sidebarOpen: false, // Hidden by default as requested
  isOnline: true,

  login: (email: string, password: string) => {
    const cleanEmail = email.toLowerCase().trim();
    // Allow demo fast login
    const account = DEMO_ACCOUNTS[cleanEmail];
    let emp = account ? EMPLOYEES.find(e => e.id === account.employeeId) : EMPLOYEES.find(e => e.email.toLowerCase() === cleanEmail);

    if (!emp) {
      // If user typed anything else, fall back to manager
      emp = EMPLOYEES[6]; // Deepak Mehta
    }

    const appUser: AppUser = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      avatar: emp.avatar,
      department: emp.department,
      designation: emp.designation,
    };

    set({
      user: appUser,
      isAuthenticated: true,
    });
    return { success: true };
  },

  logout: () => set({ user: null, isAuthenticated: false }),

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  switchRole: (role: 'employee' | 'manager' | 'admin') => {
    const { user, employees } = get();
    if (!user) return;
    const targetEmp = employees.find(e => e.role === role) || {
      ...user,
      role,
    };
    set({
      user: {
        id: targetEmp.id,
        name: targetEmp.name,
        email: targetEmp.email,
        role,
        avatar: targetEmp.avatar,
        department: targetEmp.department,
        designation: role === 'admin' ? 'Chief Operations Officer' : role === 'manager' ? 'Engineering Manager' : 'Senior Software Engineer',
      }
    });
  },

  submitRequest: (requestData) => {
    const { leaveRequests, activityEvents, user, employees } = get();
    const emp = employees.find(e => e.id === requestData.employeeId) || employees[0];
    
    // Calculate algorithmic score & recommendation
    let priorityScore = 75;
    let aiRecommendation: 'approve' | 'review' | 'reject' = 'approve';
    let aiReason = 'Standard leave request within acceptable department capacity.';

    if (requestData.leaveType === 'Emergency') {
      priorityScore = 95;
      aiRecommendation = 'approve';
      aiReason = 'Emergency leave prioritised automatically; coverage threshold waived.';
    } else if (requestData.leaveType === 'Sick') {
      priorityScore = 88;
      aiRecommendation = 'approve';
      aiReason = 'Health absence verified against statutory sick leave allocation.';
    } else if (requestData.days > 7) {
      priorityScore = 62;
      aiRecommendation = 'review';
      aiReason = 'Extended leave duration requires manager confirmation of sprint continuity.';
    } else {
      priorityScore = Math.floor(65 + Math.random() * 25);
      aiRecommendation = priorityScore > 70 ? 'approve' : 'review';
      aiReason = `Leave balance adequate (${emp.leaveBalance[requestData.leaveType] || 15} days available). Minimal team impact.`;
    }

    const newRequest: LeaveRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      status: 'pending',
      priorityScore,
      aiRecommendation,
      aiReason,
      submittedAt: new Date().toISOString(),
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'submitted',
      requestId: newRequest.id,
      employeeName: requestData.employeeName || user?.name || 'Team Member',
      leaveType: newRequest.leaveType,
      timestamp: new Date().toISOString(),
      actor: user?.name,
    };

    set({
      leaveRequests: [newRequest, ...leaveRequests],
      activityEvents: [newActivity, ...activityEvents],
    });

    return newRequest;
  },

  approveRequest: (requestId: string, note?: string) => {
    const { leaveRequests, activityEvents, user } = get();
    const request = leaveRequests.find(r => r.id === requestId);
    if (!request) return;

    set({
      leaveRequests: leaveRequests.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.name || 'Deepak Mehta',
              reviewNote: note || 'Approved automatically by manager.',
            }
          : r
      ),
      activityEvents: [
        {
          id: `act-${Date.now()}`,
          type: 'approved',
          requestId,
          employeeName: request.employeeName,
          leaveType: request.leaveType,
          timestamp: new Date().toISOString(),
          actor: user?.name || 'Deepak Mehta',
        },
        ...activityEvents,
      ],
    });
  },

  rejectRequest: (requestId: string, note: string) => {
    const { leaveRequests, activityEvents, user } = get();
    const request = leaveRequests.find(r => r.id === requestId);
    if (!request) return;

    set({
      leaveRequests: leaveRequests.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.name || 'Deepak Mehta',
              reviewNote: note || 'Department minimum staffing conflict.',
            }
          : r
      ),
      activityEvents: [
        {
          id: `act-${Date.now()}`,
          type: 'rejected',
          requestId,
          employeeName: request.employeeName,
          leaveType: request.leaveType,
          timestamp: new Date().toISOString(),
          actor: user?.name || 'Deepak Mehta',
        },
        ...activityEvents,
      ],
    });
  },

  getPendingRequests: () => {
    return get().leaveRequests.filter(r => r.status === 'pending');
  },

  getMyRequests: () => {
    const { user, leaveRequests } = get();
    if (!user) return [];
    return leaveRequests.filter(r => r.employeeId === user.id || r.employeeName === user.name);
  },

  getEmployeesOnLeaveToday: () => {
    const { employees, leaveRequests } = get();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const onLeaveIds = leaveRequests
      .filter(r => r.status === 'approved' && r.startDate <= todayStr && r.endDate >= todayStr)
      .map(r => r.employeeId);

    return employees.filter(e => onLeaveIds.includes(e.id));
  },
}));

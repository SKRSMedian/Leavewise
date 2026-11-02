// Mock data for LeaveWise application
// In production, this comes from Supabase

export type LeaveType = 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Emergency';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'employee' | 'manager' | 'admin';
export type Department = 'Engineering' | 'Design' | 'Marketing' | 'HR' | 'Finance' | 'Operations' | 'Sales';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  designation: string;
  avatar: string;
  joinDate: string;
  leaveBalance: Record<LeaveType, number>;
  status: 'active' | 'on-leave';
  managerId: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  designation: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: RequestStatus;
  priorityScore: number;
  aiRecommendation: 'approve' | 'reject' | 'review';
  aiReason: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'submitted' | 'approved' | 'rejected' | 'cancelled';
  requestId: string;
  employeeName: string;
  leaveType: LeaveType;
  timestamp: string;
  actor?: string;
}

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@company.com',
    role: 'employee',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    avatar: 'AS',
    joinDate: '2021-03-15',
    leaveBalance: { Annual: 18, Sick: 10, Personal: 3, Maternity: 0, Paternity: 5, Emergency: 2 },
    status: 'active',
    managerId: 'emp-007',
  },
  {
    id: 'emp-002',
    name: 'Priya Nair',
    email: 'priya.nair@company.com',
    role: 'employee',
    department: 'Design',
    designation: 'UI/UX Designer',
    avatar: 'PN',
    joinDate: '2022-07-01',
    leaveBalance: { Annual: 12, Sick: 8, Personal: 3, Maternity: 90, Paternity: 0, Emergency: 2 },
    status: 'on-leave',
    managerId: 'emp-007',
  },
  {
    id: 'emp-003',
    name: 'Rahul Verma',
    email: 'rahul.verma@company.com',
    role: 'employee',
    department: 'Engineering',
    designation: 'Backend Developer',
    avatar: 'RV',
    joinDate: '2020-11-20',
    leaveBalance: { Annual: 22, Sick: 10, Personal: 3, Maternity: 0, Paternity: 5, Emergency: 2 },
    status: 'active',
    managerId: 'emp-007',
  },
  {
    id: 'emp-004',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@company.com',
    role: 'employee',
    department: 'Marketing',
    designation: 'Marketing Lead',
    avatar: 'SK',
    joinDate: '2021-08-10',
    leaveBalance: { Annual: 15, Sick: 7, Personal: 3, Maternity: 0, Paternity: 0, Emergency: 2 },
    status: 'active',
    managerId: 'emp-008',
  },
  {
    id: 'emp-005',
    name: 'Vikram Patel',
    email: 'vikram.patel@company.com',
    role: 'employee',
    department: 'Finance',
    designation: 'Financial Analyst',
    avatar: 'VP',
    joinDate: '2022-01-15',
    leaveBalance: { Annual: 16, Sick: 10, Personal: 3, Maternity: 0, Paternity: 5, Emergency: 2 },
    status: 'active',
    managerId: 'emp-009',
  },
  {
    id: 'emp-006',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@company.com',
    role: 'employee',
    department: 'HR',
    designation: 'HR Specialist',
    avatar: 'AR',
    joinDate: '2020-05-22',
    leaveBalance: { Annual: 20, Sick: 10, Personal: 3, Maternity: 0, Paternity: 0, Emergency: 2 },
    status: 'active',
    managerId: 'emp-010',
  },
  {
    id: 'emp-007',
    name: 'Deepak Mehta',
    email: 'deepak.mehta@company.com',
    role: 'manager',
    department: 'Engineering',
    designation: 'Engineering Manager',
    avatar: 'DM',
    joinDate: '2019-02-10',
    leaveBalance: { Annual: 24, Sick: 10, Personal: 3, Maternity: 0, Paternity: 5, Emergency: 2 },
    status: 'active',
    managerId: 'emp-011',
  },
  {
    id: 'emp-008',
    name: 'Kavya Iyer',
    email: 'kavya.iyer@company.com',
    role: 'manager',
    department: 'Marketing',
    designation: 'Marketing Director',
    avatar: 'KI',
    joinDate: '2018-09-01',
    leaveBalance: { Annual: 28, Sick: 10, Personal: 3, Maternity: 0, Paternity: 0, Emergency: 2 },
    status: 'active',
    managerId: 'emp-011',
  },
  {
    id: 'emp-009',
    name: 'Suresh Agarwal',
    email: 'suresh.agarwal@company.com',
    role: 'manager',
    department: 'Finance',
    designation: 'Finance Manager',
    avatar: 'SA',
    joinDate: '2017-11-15',
    leaveBalance: { Annual: 30, Sick: 10, Personal: 3, Maternity: 0, Paternity: 0, Emergency: 2 },
    status: 'active',
    managerId: 'emp-011',
  },
  {
    id: 'emp-010',
    name: 'Meera Joshi',
    email: 'meera.joshi@company.com',
    role: 'admin',
    department: 'HR',
    designation: 'HR Director',
    avatar: 'MJ',
    joinDate: '2016-06-01',
    leaveBalance: { Annual: 30, Sick: 10, Personal: 5, Maternity: 0, Paternity: 0, Emergency: 3 },
    status: 'active',
    managerId: null,
  },
  {
    id: 'emp-011',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@company.com',
    role: 'admin',
    department: 'Operations',
    designation: 'Chief Operating Officer',
    avatar: 'RK',
    joinDate: '2015-01-01',
    leaveBalance: { Annual: 30, Sick: 10, Personal: 5, Maternity: 0, Paternity: 0, Emergency: 3 },
    status: 'active',
    managerId: null,
  },
  {
    id: 'emp-012',
    name: 'Pooja Singh',
    email: 'pooja.singh@company.com',
    role: 'employee',
    department: 'Engineering',
    designation: 'Frontend Developer',
    avatar: 'PS',
    joinDate: '2023-02-01',
    leaveBalance: { Annual: 8, Sick: 10, Personal: 3, Maternity: 0, Paternity: 0, Emergency: 2 },
    status: 'active',
    managerId: 'emp-007',
  },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-001',
    employeeId: 'emp-001',
    employeeName: 'Arjun Sharma',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    leaveType: 'Annual',
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    days: 5,
    reason: 'Family vacation planned for Diwali holidays.',
    status: 'pending',
    priorityScore: 72,
    aiRecommendation: 'approve',
    aiReason: 'Sufficient leave balance (18 days). No overlapping critical project deadlines. Team staffing above minimum threshold during requested period.',
    submittedAt: '2026-11-01T09:30:00+05:30',
  },
  {
    id: 'req-002',
    employeeId: 'emp-003',
    employeeName: 'Rahul Verma',
    department: 'Engineering',
    designation: 'Backend Developer',
    leaveType: 'Sick',
    startDate: '2026-11-03',
    endDate: '2026-11-04',
    days: 2,
    reason: 'Medical appointment and recovery.',
    status: 'pending',
    priorityScore: 88,
    aiRecommendation: 'approve',
    aiReason: 'Sick leave policy satisfied. Urgent medical need detected. Current team availability allows coverage. High priority granted.',
    submittedAt: '2026-11-02T08:15:00+05:30',
  },
  {
    id: 'req-003',
    employeeId: 'emp-004',
    employeeName: 'Sneha Kulkarni',
    department: 'Marketing',
    designation: 'Marketing Lead',
    leaveType: 'Personal',
    startDate: '2026-11-07',
    endDate: '2026-11-07',
    days: 1,
    reason: 'Personal errands — house registration.',
    status: 'pending',
    priorityScore: 61,
    aiRecommendation: 'approve',
    aiReason: 'Single-day personal leave within policy limit. No critical marketing campaigns scheduled on requested date.',
    submittedAt: '2026-11-01T16:45:00+05:30',
  },
  {
    id: 'req-004',
    employeeId: 'emp-005',
    employeeName: 'Vikram Patel',
    department: 'Finance',
    designation: 'Financial Analyst',
    leaveType: 'Annual',
    startDate: '2026-11-17',
    endDate: '2026-11-21',
    days: 5,
    reason: 'Annual leave for personal travel.',
    status: 'approved',
    priorityScore: 65,
    aiRecommendation: 'approve',
    aiReason: 'Adequate leave balance. No quarter-end conflicts. Department staffing meets minimum threshold.',
    submittedAt: '2026-10-28T10:00:00+05:30',
    reviewedAt: '2026-10-29T14:20:00+05:30',
    reviewedBy: 'Suresh Agarwal',
    reviewNote: 'Approved. Enjoy your travels!',
  },
  {
    id: 'req-005',
    employeeId: 'emp-012',
    employeeName: 'Pooja Singh',
    department: 'Engineering',
    designation: 'Frontend Developer',
    leaveType: 'Emergency',
    startDate: '2026-11-03',
    endDate: '2026-11-05',
    days: 3,
    reason: 'Family emergency — immediate travel required.',
    status: 'approved',
    priorityScore: 95,
    aiRecommendation: 'approve',
    aiReason: 'Emergency leave — maximum priority. Policy mandates immediate approval subject to manager discretion.',
    submittedAt: '2026-11-02T07:00:00+05:30',
    reviewedAt: '2026-11-02T07:45:00+05:30',
    reviewedBy: 'Deepak Mehta',
    reviewNote: 'Emergency approved. Team coverage arranged.',
  },
  {
    id: 'req-006',
    employeeId: 'emp-006',
    employeeName: 'Ananya Reddy',
    department: 'HR',
    designation: 'HR Specialist',
    leaveType: 'Annual',
    startDate: '2026-11-24',
    endDate: '2026-11-28',
    days: 5,
    reason: 'Year-end vacation.',
    status: 'rejected',
    priorityScore: 45,
    aiRecommendation: 'reject',
    aiReason: 'Year-end appraisal period conflicts with requested dates. Minimum HR staffing constraint violated — only 1 HR staff would be available below the threshold of 2.',
    submittedAt: '2026-10-20T11:30:00+05:30',
    reviewedAt: '2026-10-21T09:15:00+05:30',
    reviewedBy: 'Meera Joshi',
    reviewNote: 'Rejected due to year-end appraisal cycle. Please rebook for December 15 onwards.',
  },
  {
    id: 'req-007',
    employeeId: 'emp-001',
    employeeName: 'Arjun Sharma',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    leaveType: 'Sick',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    days: 2,
    reason: 'Fever and rest.',
    status: 'approved',
    priorityScore: 87,
    aiRecommendation: 'approve',
    aiReason: 'Sick leave — sufficient balance. No sprint deliverables on those dates.',
    submittedAt: '2026-10-14T22:00:00+05:30',
    reviewedAt: '2026-10-15T08:30:00+05:30',
    reviewedBy: 'Deepak Mehta',
  },
];

export const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'act-001',
    type: 'submitted',
    requestId: 'req-002',
    employeeName: 'Rahul Verma',
    leaveType: 'Sick',
    timestamp: '2026-11-02T08:15:00+05:30',
  },
  {
    id: 'act-002',
    type: 'submitted',
    requestId: 'req-001',
    employeeName: 'Arjun Sharma',
    leaveType: 'Annual',
    timestamp: '2026-11-01T09:30:00+05:30',
  },
  {
    id: 'act-003',
    type: 'submitted',
    requestId: 'req-003',
    employeeName: 'Sneha Kulkarni',
    leaveType: 'Personal',
    timestamp: '2026-11-01T16:45:00+05:30',
  },
  {
    id: 'act-004',
    type: 'approved',
    requestId: 'req-005',
    employeeName: 'Pooja Singh',
    leaveType: 'Emergency',
    timestamp: '2026-11-02T07:45:00+05:30',
    actor: 'Deepak Mehta',
  },
  {
    id: 'act-005',
    type: 'approved',
    requestId: 'req-004',
    employeeName: 'Vikram Patel',
    leaveType: 'Annual',
    timestamp: '2026-10-29T14:20:00+05:30',
    actor: 'Suresh Agarwal',
  },
  {
    id: 'act-006',
    type: 'rejected',
    requestId: 'req-006',
    employeeName: 'Ananya Reddy',
    leaveType: 'Annual',
    timestamp: '2026-10-21T09:15:00+05:30',
    actor: 'Meera Joshi',
  },
];

export const DEPARTMENTS: Department[] = [
  'Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales'
];

export const LEAVE_TYPES: LeaveType[] = [
  'Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Emergency'
];

export const LEAVE_POLICIES = {
  Annual: { maxPerYear: 24, maxConsecutive: 15, advanceNoticeDays: 7 },
  Sick: { maxPerYear: 12, maxConsecutive: 7, advanceNoticeDays: 0 },
  Personal: { maxPerYear: 5, maxConsecutive: 3, advanceNoticeDays: 2 },
  Maternity: { maxPerYear: 180, maxConsecutive: 180, advanceNoticeDays: 30 },
  Paternity: { maxPerYear: 15, maxConsecutive: 15, advanceNoticeDays: 7 },
  Emergency: { maxPerYear: 5, maxConsecutive: 5, advanceNoticeDays: 0 },
};

export const STAFFING_MINIMUMS: Record<Department, number> = {
  Engineering: 3,
  Design: 1,
  Marketing: 2,
  HR: 2,
  Finance: 2,
  Operations: 3,
  Sales: 2,
};

export const ALGORITHM_WEIGHTS = {
  leaveBalance: 0.25,
  urgency: 0.30,
  advanceNotice: 0.15,
  staffingImpact: 0.20,
  historicalAbsence: 0.10,
};

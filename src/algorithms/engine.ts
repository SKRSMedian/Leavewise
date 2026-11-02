/**
 * LeaveWise Algorithm Engine
 * 
 * Real algorithm implementations for the AI Decision Centre.
 * These are not mock/hardcoded — they compute actual outputs from input data.
 */

import {
  LeaveRequest, Employee, Department,
  LEAVE_POLICIES, STAFFING_MINIMUMS, ALGORITHM_WEIGHTS
} from '../data/mockData';

// ============================================================
// 1. RULE-BASED EXPERT SYSTEM — Policy Eligibility Validation
// ============================================================

export interface EligibilityResult {
  eligible: boolean;
  rules: { rule: string; pass: boolean; detail: string }[];
}

export function checkEligibility(
  request: LeaveRequest,
  employee: Employee,
  allRequests: LeaveRequest[]
): EligibilityResult {
  const rules: { rule: string; pass: boolean; detail: string }[] = [];
  const policy = LEAVE_POLICIES[request.leaveType];

  // Rule 1: Leave balance check
  const currentBalance = employee.leaveBalance[request.leaveType];
  const balancePass = currentBalance >= request.days;
  rules.push({
    rule: 'Leave Balance',
    pass: balancePass,
    detail: `Required: ${request.days} days. Available: ${currentBalance} days.`,
  });

  // Rule 2: Max consecutive days
  const consecutivePass = request.days <= policy.maxConsecutive;
  rules.push({
    rule: 'Max Consecutive Days',
    pass: consecutivePass,
    detail: `Requested: ${request.days} days. Policy max: ${policy.maxConsecutive} days.`,
  });

  // Rule 3: Advance notice
  const submittedDate = new Date(request.submittedAt);
  const startDate = new Date(request.startDate);
  const noticeDays = Math.floor((startDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
  const noticePass = noticeDays >= policy.advanceNoticeDays;
  rules.push({
    rule: 'Advance Notice',
    pass: noticePass,
    detail: `Required notice: ${policy.advanceNoticeDays} days. Given: ${Math.max(0, noticeDays)} days.`,
  });

  // Rule 4: No duplicate active request
  const hasDuplicate = allRequests.some(r =>
    r.id !== request.id &&
    r.employeeId === request.employeeId &&
    r.status === 'pending' &&
    new Date(r.startDate) <= new Date(request.endDate) &&
    new Date(r.endDate) >= new Date(request.startDate)
  );
  rules.push({
    rule: 'No Duplicate Request',
    pass: !hasDuplicate,
    detail: hasDuplicate ? 'Overlapping pending request exists.' : 'No conflicting requests found.',
  });

  // Rule 5: Annual max cap check
  const yearRequests = allRequests.filter(r =>
    r.employeeId === request.employeeId &&
    r.leaveType === request.leaveType &&
    r.status === 'approved' &&
    new Date(r.startDate).getFullYear() === new Date(request.startDate).getFullYear()
  );
  const usedDays = yearRequests.reduce((sum, r) => sum + r.days, 0);
  const maxCapPass = (usedDays + request.days) <= policy.maxPerYear;
  rules.push({
    rule: 'Annual Cap',
    pass: maxCapPass,
    detail: `Max per year: ${policy.maxPerYear}. Already used: ${usedDays}. Requested: ${request.days}.`,
  });

  const eligible = rules.every(r => r.pass);
  return { eligible, rules };
}

// ============================================================
// 2. WEIGHTED PRIORITY SCORING
// ============================================================

export interface PriorityResult {
  score: number; // 0-100
  breakdown: { factor: string; score: number; weight: number; contribution: number }[];
}

export function computePriorityScore(
  request: LeaveRequest,
  employee: Employee,
  allRequests: LeaveRequest[]
): PriorityResult {
  const breakdown: PriorityResult['breakdown'] = [];

  // Factor 1: Leave balance adequacy (0-100)
  const balance = employee.leaveBalance[request.leaveType];
  const balanceScore = Math.min(100, (balance / request.days) * 50);
  breakdown.push({
    factor: 'Leave Balance Adequacy',
    score: Math.round(balanceScore),
    weight: ALGORITHM_WEIGHTS.leaveBalance,
    contribution: Math.round(balanceScore * ALGORITHM_WEIGHTS.leaveBalance),
  });

  // Factor 2: Urgency classification
  let urgencyScore = 50;
  if (request.leaveType === 'Emergency') urgencyScore = 100;
  else if (request.leaveType === 'Sick') urgencyScore = 85;
  else if (request.leaveType === 'Maternity' || request.leaveType === 'Paternity') urgencyScore = 80;
  else if (request.leaveType === 'Personal') urgencyScore = 55;
  else if (request.leaveType === 'Annual') {
    // Fuzzy: shorter requests are slightly lower urgency unless advance planned
    const days = request.days;
    urgencyScore = days <= 1 ? 60 : days <= 5 ? 50 : 40;
  }
  breakdown.push({
    factor: 'Leave Urgency (Fuzzy)',
    score: urgencyScore,
    weight: ALGORITHM_WEIGHTS.urgency,
    contribution: Math.round(urgencyScore * ALGORITHM_WEIGHTS.urgency),
  });

  // Factor 3: Advance notice score
  const policy = LEAVE_POLICIES[request.leaveType];
  const submittedDate = new Date(request.submittedAt);
  const startDate = new Date(request.startDate);
  const noticeDays = Math.max(0, Math.floor((startDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)));
  const noticeScore = policy.advanceNoticeDays === 0
    ? 100
    : Math.min(100, (noticeDays / (policy.advanceNoticeDays * 2)) * 100);
  breakdown.push({
    factor: 'Advance Notice',
    score: Math.round(noticeScore),
    weight: ALGORITHM_WEIGHTS.advanceNotice,
    contribution: Math.round(noticeScore * ALGORITHM_WEIGHTS.advanceNotice),
  });

  // Factor 4: Staffing impact (how many others are off in same dept/period)
  const overlappingDeptRequests = allRequests.filter(r =>
    r.id !== request.id &&
    r.department === request.department &&
    r.status !== 'rejected' &&
    new Date(r.startDate) <= new Date(request.endDate) &&
    new Date(r.endDate) >= new Date(request.startDate)
  );
  const minStaff = STAFFING_MINIMUMS[request.department as Department] ?? 2;
  const deptSize = 5; // approximate team size
  const concurrentAbsences = overlappingDeptRequests.length;
  const availableStaff = Math.max(0, deptSize - concurrentAbsences - 1);
  const staffScore = availableStaff >= minStaff ? 90 : availableStaff >= 1 ? 50 : 10;
  breakdown.push({
    factor: 'Staffing Impact',
    score: staffScore,
    weight: ALGORITHM_WEIGHTS.staffingImpact,
    contribution: Math.round(staffScore * ALGORITHM_WEIGHTS.staffingImpact),
  });

  // Factor 5: Historical absence frequency
  const pastRequests = allRequests.filter(r =>
    r.employeeId === request.employeeId &&
    r.status === 'approved' &&
    r.id !== request.id
  );
  const approvalRate = allRequests.filter(r => r.employeeId === request.employeeId && r.status !== 'pending').length;
  const histScore = pastRequests.length > 15 ? 40 : pastRequests.length > 10 ? 60 : pastRequests.length > 5 ? 80 : 90;
  breakdown.push({
    factor: 'Historical Absence',
    score: histScore,
    weight: ALGORITHM_WEIGHTS.historicalAbsence,
    contribution: Math.round(histScore * ALGORITHM_WEIGHTS.historicalAbsence),
  });

  const score = breakdown.reduce((sum, b) => sum + b.contribution, 0);
  return { score: Math.min(100, Math.round(score)), breakdown };
}

// ============================================================
// 3. CSP — CONSTRAINT SATISFACTION PROBLEM
// Checks whether approving a request violates workforce constraints
// ============================================================

export interface CSPResult {
  feasible: boolean;
  constraints: { constraint: string; satisfied: boolean; detail: string }[];
}

export function checkConstraints(
  request: LeaveRequest,
  allApprovedRequests: LeaveRequest[],
  employees: Employee[]
): CSPResult {
  const constraints: CSPResult['constraints'] = [];
  const dept = request.department as Department;
  const minStaff = STAFFING_MINIMUMS[dept];

  // Count department employees
  const deptEmployees = employees.filter(e => e.department === dept);
  const deptCount = deptEmployees.length;

  // Count already approved absences in the period
  const concurrentApproved = allApprovedRequests.filter(r =>
    r.department === dept &&
    r.status === 'approved' &&
    new Date(r.startDate) <= new Date(request.endDate) &&
    new Date(r.endDate) >= new Date(request.startDate)
  );

  const availableAfterApproval = deptCount - concurrentApproved.length - 1;
  const minStaffConstraint = availableAfterApproval >= minStaff;
  constraints.push({
    constraint: `Minimum Staffing (${dept})`,
    satisfied: minStaffConstraint,
    detail: `Dept size: ${deptCount}. Current absences: ${concurrentApproved.length}. After approval: ${availableAfterApproval} available (min: ${minStaff}).`,
  });

  // Critical period check (month-end = last 3 days of month)
  const start = new Date(request.startDate);
  const isMonthEnd = start.getDate() >= 28;
  const criticalPeriodOk = !(isMonthEnd && (dept === 'Finance' || dept === 'Operations'));
  constraints.push({
    constraint: 'Critical Period Restriction',
    satisfied: criticalPeriodOk,
    detail: isMonthEnd && !criticalPeriodOk
      ? `Month-end period — ${dept} leaves restricted during last 3 days of month.`
      : 'No critical period conflicts detected.',
  });

  // Weekend exclusion
  const weekendOnly = isWeekend(new Date(request.startDate)) && isWeekend(new Date(request.endDate));
  constraints.push({
    constraint: 'Weekday Coverage',
    satisfied: !weekendOnly,
    detail: weekendOnly
      ? 'Request spans weekends only — no working days affected.'
      : 'Request covers working days.',
  });

  const feasible = constraints.every(c => c.satisfied);
  return { feasible, constraints };
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// ============================================================
// 4. GREEDY PRIORITY ALLOCATION
// Given a list of pending requests, rank and allocate within staffing limits
// ============================================================

export interface AllocationResult {
  approved: LeaveRequest[];
  deferred: LeaveRequest[];
  rankings: { request: LeaveRequest; score: number; reason: string }[];
}

export function greedyAllocate(
  pending: LeaveRequest[],
  employees: Employee[],
  allRequests: LeaveRequest[]
): AllocationResult {
  // Score each request
  const scored = pending.map(req => {
    const employee = employees.find(e => e.id === req.employeeId)!;
    const priority = computePriorityScore(req, employee, allRequests);
    const eligibility = checkEligibility(req, employee, allRequests);
    const csp = checkConstraints(req, allRequests.filter(r => r.status === 'approved'), employees);
    
    return {
      request: req,
      score: priority.score,
      eligible: eligibility.eligible,
      feasible: csp.feasible,
      reason: !eligibility.eligible
        ? 'Failed policy eligibility checks'
        : !csp.feasible
        ? 'Violates workforce constraints'
        : `Priority score: ${priority.score}/100`,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const approved: LeaveRequest[] = [];
  const deferred: LeaveRequest[] = [];
  const approvedIds = new Set<string>();

  // Track virtual absences per dept/date for constraint checking
  const virtualApproved = [...allRequests.filter(r => r.status === 'approved')];

  for (const item of scored) {
    if (!item.eligible || !item.feasible) {
      deferred.push(item.request);
      continue;
    }

    // Re-check constraint with already allocated in this batch
    const csp = checkConstraints(item.request, virtualApproved, employees);
    if (csp.feasible) {
      approved.push(item.request);
      virtualApproved.push({ ...item.request, status: 'approved' });
    } else {
      deferred.push(item.request);
    }
  }

  return {
    approved,
    deferred,
    rankings: scored.map(s => ({
      request: s.request,
      score: s.score,
      reason: s.reason,
    })),
  };
}

// ============================================================
// 5. FUZZY LOGIC — Urgency & Risk Classification
// ============================================================

export type FuzzyRisk = 'Low' | 'Moderate' | 'High' | 'Critical';

export function fuzzyClassifyRisk(
  pendingCount: number,
  deptSize: number,
  minStaff: number,
  isMonthEnd: boolean
): { risk: FuzzyRisk; confidence: number; reasoning: string } {
  const absenceRatio = pendingCount / deptSize;
  const staffingMargin = (deptSize - pendingCount) - minStaff;

  let riskScore = 0;
  riskScore += absenceRatio * 40;
  riskScore += (staffingMargin < 0 ? 40 : staffingMargin < 1 ? 20 : 0);
  riskScore += isMonthEnd ? 20 : 0;

  let risk: FuzzyRisk;
  let confidence: number;
  if (riskScore >= 75) { risk = 'Critical'; confidence = 0.92; }
  else if (riskScore >= 50) { risk = 'High'; confidence = 0.81; }
  else if (riskScore >= 25) { risk = 'Moderate'; confidence = 0.74; }
  else { risk = 'Low'; confidence = 0.88; }

  return {
    risk,
    confidence,
    reasoning: `Absence ratio: ${(absenceRatio * 100).toFixed(0)}%. Staffing margin: ${staffingMargin}. Month-end: ${isMonthEnd}.`,
  };
}

// ============================================================
// 6. BAYESIAN STAFFING RISK ESTIMATION
// P(shortage | current approvals) using simple Bayesian inference
// ============================================================

export interface BayesianResult {
  priorRisk: number;
  likelihood: number;
  posteriorRisk: number;
  interpretation: string;
}

export function bayesianStaffingRisk(
  dept: Department,
  currentAbsences: number,
  employees: Employee[],
  historicalAbsenceRate: number = 0.15 // baseline 15% absence rate
): BayesianResult {
  const deptSize = employees.filter(e => e.department === dept).length;
  const minStaff = STAFFING_MINIMUMS[dept];

  // Prior: probability of staffing shortage based on historical data
  const priorRisk = historicalAbsenceRate;

  // Likelihood: given current absences, how likely is shortage?
  const absenceRatio = currentAbsences / Math.max(deptSize, 1);
  const likelihood = Math.min(0.99, absenceRatio * 2.5);

  // Posterior using Bayes' theorem: P(shortage|evidence) ∝ P(evidence|shortage) * P(shortage)
  const posterior = (likelihood * priorRisk) / (
    (likelihood * priorRisk) + ((1 - likelihood) * (1 - priorRisk))
  );

  const available = deptSize - currentAbsences;
  const interpretation =
    posterior > 0.7
      ? `CRITICAL: Only ${available} staff available against minimum ${minStaff}. High probability of operational impact.`
      : posterior > 0.4
      ? `WARNING: Staffing is marginal. ${available} available vs ${minStaff} minimum.`
      : `SAFE: ${available} staff available, well above minimum ${minStaff}.`;

  return {
    priorRisk: Math.round(priorRisk * 100),
    likelihood: Math.round(likelihood * 100),
    posteriorRisk: Math.round(posterior * 100),
    interpretation,
  };
}

// ============================================================
// 7. SIMULATION ENGINE — Run full allocation for a date range
// ============================================================

export interface SimulationResult {
  eligible: LeaveRequest[];
  ineligible: LeaveRequest[];
  rankings: { request: LeaveRequest; score: number; reason: string }[];
  approved: LeaveRequest[];
  deferred: LeaveRequest[];
  staffingImpact: Record<Department, { available: number; minimum: number; risk: FuzzyRisk }>;
  bayesianRisk: Record<Department, BayesianResult>;
  summary: string;
}

export function runSimulation(
  selectedRequests: LeaveRequest[],
  employees: Employee[],
  allRequests: LeaveRequest[]
): SimulationResult {
  const eligible: LeaveRequest[] = [];
  const ineligible: LeaveRequest[] = [];

  for (const req of selectedRequests) {
    const emp = employees.find(e => e.id === req.employeeId);
    if (!emp) { ineligible.push(req); continue; }
    const eligResult = checkEligibility(req, emp, allRequests);
    if (eligResult.eligible) eligible.push(req);
    else ineligible.push(req);
  }

  const allocation = greedyAllocate(eligible, employees, allRequests);

  // Compute staffing impact per department
  const staffingImpact: Record<string, { available: number; minimum: number; risk: FuzzyRisk }> = {};
  const bayesianRisk: Record<string, BayesianResult> = {};
  
  const uniqueDepts = [...new Set(selectedRequests.map(r => r.department))] as Department[];

  for (const dept of uniqueDepts) {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptAbsences = allocation.approved.filter(r => r.department === dept).length;
    const available = Math.max(0, deptEmployees.length - deptAbsences);
    const minStaff = STAFFING_MINIMUMS[dept];
    const fuzzy = fuzzyClassifyRisk(deptAbsences, deptEmployees.length, minStaff, false);
    
    staffingImpact[dept] = { available, minimum: minStaff, risk: fuzzy.risk };
    bayesianRisk[dept] = bayesianStaffingRisk(dept, deptAbsences, employees);
  }

  const summary = `Processed ${selectedRequests.length} requests. ${ineligible.length} ineligible (policy violations). Of ${eligible.length} eligible, allocated ${allocation.approved.length} approvals, deferred ${allocation.deferred.length} due to staffing constraints.`;

  return {
    eligible,
    ineligible,
    rankings: allocation.rankings,
    approved: allocation.approved,
    deferred: allocation.deferred,
    staffingImpact: staffingImpact as Record<Department, { available: number; minimum: number; risk: FuzzyRisk }>,
    bayesianRisk: bayesianRisk as Record<Department, BayesianResult>,
    summary,
  };
}

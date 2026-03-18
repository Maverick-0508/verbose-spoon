/**
 * Date utility functions for the Project Calendar Calculator
 */

export const US_HOLIDAYS_2024_2026 = [
  // 2024
  '2024-01-01', '2024-01-15', '2024-02-19', '2024-05-27',
  '2024-06-19', '2024-07-04', '2024-09-02', '2024-10-14',
  '2024-11-11', '2024-11-28', '2024-12-25',
  // 2025
  '2025-01-01', '2025-01-20', '2025-02-17', '2025-05-26',
  '2025-06-19', '2025-07-04', '2025-09-01', '2025-10-13',
  '2025-11-11', '2025-11-27', '2025-12-25',
  // 2026
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-05-25',
  '2026-06-19', '2026-07-03', '2026-09-07', '2026-10-12',
  '2026-11-11', '2026-11-26', '2026-12-25',
];

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date, holidays = []) {
  const dateStr = formatDateISO(date);
  return holidays.includes(dateStr);
}

/**
 * Check if a date is a working day (not weekend and not holiday)
 */
export function isWorkingDay(date, holidays = [], includeWeekends = false) {
  if (!includeWeekends && isWeekend(date)) return false;
  if (isHoliday(date, holidays)) return false;
  return true;
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDateISO(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date for display (e.g., "March 17, 2026")
 */
export function formatDateDisplay(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date as short display (e.g., "Mar 17")
 */
export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Count working days between two dates (inclusive of start, exclusive of end)
 */
export function countWorkingDays(startDate, endDate, holidays = [], includeWeekends = false) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (start >= end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current < end) {
    if (isWorkingDay(current, holidays, includeWeekends)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Add working days to a start date
 */
export function addWorkingDays(startDate, workingDays, holidays = [], includeWeekends = false) {
  const date = new Date(startDate);
  date.setHours(0, 0, 0, 0);
  let remaining = workingDays;

  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (isWorkingDay(date, holidays, includeWeekends)) {
      remaining--;
    }
  }

  return date;
}

/**
 * Calculate the deadline date based on working days
 */
export function calculateDeadline(startDate, workingDays, holidays = [], includeWeekends = false) {
  return addWorkingDays(startDate, workingDays, holidays, includeWeekends);
}

/**
 * Calculate working days from total calendar days
 */
export function calendarToWorkingDays(startDate, calendarDays, holidays = [], includeWeekends = false) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + calendarDays);
  return countWorkingDays(startDate, endDate, holidays, includeWeekends);
}

/**
 * Get the total calendar days between two dates
 */
export function getTotalCalendarDays(startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the number of days until a deadline
 */
export function daysUntilDeadline(deadlineDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getTotalCalendarDays(today, deadlineDate);
}

/**
 * Calculate sprint dates based on sprint length
 */
export function calculateSprints(startDate, endDate, sprintLengthDays, holidays = []) {
  const sprints = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  let sprintNum = 1;

  while (current < end) {
    const sprintStart = new Date(current);
    const sprintEndCalc = addWorkingDays(current, sprintLengthDays, holidays);
    const sprintEnd = sprintEndCalc > end ? new Date(end) : new Date(sprintEndCalc);

    sprints.push({
      id: sprintNum,
      start: new Date(sprintStart),
      end: new Date(sprintEnd),
      workingDays: countWorkingDays(sprintStart, sprintEnd, holidays),
      calendarDays: getTotalCalendarDays(sprintStart, sprintEnd),
    });

    current = new Date(sprintEnd);
    sprintNum++;
  }

  return sprints;
}

/**
 * Apply buffer percentage to working days
 */
export function applyBuffer(workingDays, bufferPercent) {
  return Math.ceil(workingDays * (1 + bufferPercent / 100));
}

/**
 * Get project progress percentage
 */
export function getProjectProgress(startDate, endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (today <= start) return 0;
  if (today >= end) return 100;

  const totalDays = getTotalCalendarDays(start, end);
  const elapsedDays = getTotalCalendarDays(start, today);
  return Math.round((elapsedDays / totalDays) * 100);
}

/**
 * Get status label and color class based on days remaining
 */
export function getProjectStatus(daysRemaining) {
  if (daysRemaining < 0) return { label: 'Overdue', color: 'status-overdue' };
  if (daysRemaining === 0) return { label: 'Due Today', color: 'status-today' };
  if (daysRemaining <= 7) return { label: 'Critical', color: 'status-critical' };
  if (daysRemaining <= 14) return { label: 'At Risk', color: 'status-risk' };
  if (daysRemaining <= 30) return { label: 'On Track', color: 'status-track' };
  return { label: 'Healthy', color: 'status-healthy' };
}

/**
 * Generate a timeline array of months between two dates
 */
export function getTimelineMonths(startDate, endDate) {
  const months = [];
  const start = new Date(startDate);
  start.setDate(1);
  const end = new Date(endDate);

  while (start <= end) {
    months.push({
      year: start.getFullYear(),
      month: start.getMonth(),
      label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    });
    start.setMonth(start.getMonth() + 1);
  }

  return months;
}

/**
 * Parse a date string safely
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date formatted as ISO string
 */
export function getTodayISO() {
  return formatDateISO(new Date());
}

/**
 * Add calendar days to a date
 */
export function addCalendarDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get week number for a date
 */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

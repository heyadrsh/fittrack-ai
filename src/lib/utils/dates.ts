import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, isToday, isYesterday, parseISO, isSameDay } from 'date-fns';

/**
 * Get today's date range for database queries
 */
export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(now),
  };
}

/**
 * Get date range for the last N days
 */
export function getLastNDaysRange(days: number): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(subDays(now, days - 1)),
    end: endOfDay(now),
  };
}

/**
 * Get this week's date range (Monday to Sunday)
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

/**
 * Get this month's date range
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';

  return format(d, 'MMM d, yyyy');
}

/**
 * Format time for display
 */
export function formatDisplayTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return `${formatDisplayDate(d)} at ${formatDisplayTime(d)}`;
}

/**
 * Format date for API/database
 */
export function formatForDB(date: Date): string {
  return date.toISOString();
}

/**
 * Get day of week (1 = Monday, 7 = Sunday)
 */
export function getDayOfWeek(date: Date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 7 : day; // Convert Sunday (0) to 7
}

/**
 * Check if today is a workout day (Mon-Fri)
 */
export function isWorkoutDay(date: Date = new Date()): boolean {
  const dayOfWeek = getDayOfWeek(date);
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Get workout day name
 */
export function getWorkoutDayName(dayOfWeek: number): string | null {
  const days: Record<number, string> = {
    1: 'Push Day',
    2: 'Pull Day',
    3: 'Legs Day',
    4: 'Upper Body',
    5: 'Core & Conditioning',
  };
  return days[dayOfWeek] || null;
}

/**
 * Calculate streak from array of dates
 */
export function calculateStreak(
  dates: (Date | string)[],
  excludeWeekends: boolean = false
): number {
  if (dates.length === 0) return 0;

  // Convert to Date objects and sort descending
  const sortedDates = dates
    .map(d => (typeof d === 'string' ? parseISO(d) : d))
    .map(d => startOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Remove duplicates
  const uniqueDates: Date[] = [];
  for (const date of sortedDates) {
    if (uniqueDates.length === 0 || !isSameDay(date, uniqueDates[uniqueDates.length - 1])) {
      uniqueDates.push(date);
    }
  }

  let streak = 0;
  let currentDate = startOfDay(new Date());
  let dateIndex = 0;

  while (dateIndex < uniqueDates.length) {
    // Skip weekends if needed
    if (excludeWeekends) {
      const dayOfWeek = getDayOfWeek(currentDate);
      if (dayOfWeek === 6 || dayOfWeek === 7) {
        currentDate = startOfDay(subDays(currentDate, 1));
        continue;
      }
    }

    // Check if current date matches expected date
    if (isSameDay(uniqueDates[dateIndex], currentDate)) {
      streak++;
      dateIndex++;
    } else if (uniqueDates[dateIndex].getTime() < currentDate.getTime()) {
      // Date in list is older than expected, streak broken
      break;
    }

    currentDate = startOfDay(subDays(currentDate, 1));
  }

  return streak;
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffDays = differenceInDays(now, d);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get array of dates between two dates
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let current = startOfDay(start);
  const endDate = startOfDay(end);

  while (current <= endDate) {
    dates.push(new Date(current));
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return dates;
}

/**
 * Time and date utility functions for calendar operations
 */

/**
 * Parse a time string (e.g., "7:30 AM") to hour in 24-hour format
 * @param timeStr - Time string in format "H:MM AM/PM"
 * @returns Hour in 24-hour format (0-23)
 */
export function parseTimeToHour(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  let hour = parseInt(match[1]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour;
}

/**
 * Parse a time string to total minutes since midnight
 * @param timeStr - Time string in format "H:MM AM/PM"
 * @returns Total minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  let hour = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minutes;
}

/**
 * Calculate duration in hours between two time strings
 * @param startTime - Start time string
 * @param endTime - End time string
 * @returns Duration in hours
 */
export function calculateEventDuration(startTime: string, endTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  const durationMinutes = endMinutes - startMinutes;
  return durationMinutes / 60; // Convert to hours
}

/**
 * Calculate fractional hour offset for event positioning
 * @param startTime - Time string
 * @returns Fraction of hour (0-1)
 */
export function calculateEventOffset(startTime: string): number {
  const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  const minutes = parseInt(match[2]);
  return minutes / 60; // Return fraction of hour for positioning
}

/**
 * Format hour and minutes into time string
 * @param hour - Hour in 24-hour format (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Formatted time string "H:MM AM/PM"
 */
export function formatTimeFromHour(hour: number, minutes: number = 0): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format date for header display
 * @param date - Date object
 * @returns Formatted date string "MMM D, YYYY"
 */
export function formatHeaderDate(date: Date): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Get array of 7 days for the week view (starting Wednesday)
 * @param date - Reference date
 * @returns Array of day objects with date info
 */
export function getWeekDays(date: Date) {
  const days = [];
  const currentDate = new Date(date);
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Go back to the previous Wednesday
  const startDate = new Date(currentDate);
  const daysToSubtract = (dayOfWeek + 4) % 7; // Calculate days to Wednesday
  startDate.setDate(currentDate.getDate() - daysToSubtract);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      day: dayNames[date.getDay()],
      date: date.getDate(),
      fullDate: new Date(date),
      isSelected: false, // Will be set by the caller
    });
  }

  return days;
}

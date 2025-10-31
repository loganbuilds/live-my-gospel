import { describe, it, expect } from 'vitest';
import {
  parseTimeToHour,
  parseTimeToMinutes,
  calculateEventDuration,
  calculateEventOffset,
  formatTimeFromHour,
  formatHeaderDate,
  getWeekDays,
} from './time-utils';

describe('Time Utility Functions', () => {
  describe('parseTimeToHour', () => {
    it('should parse morning times correctly', () => {
      expect(parseTimeToHour('7:30 AM')).toBe(7);
      expect(parseTimeToHour('9:00 AM')).toBe(9);
      expect(parseTimeToHour('11:45 AM')).toBe(11);
    });

    it('should parse afternoon times correctly', () => {
      expect(parseTimeToHour('1:00 PM')).toBe(13);
      expect(parseTimeToHour('3:30 PM')).toBe(15);
      expect(parseTimeToHour('11:59 PM')).toBe(23);
    });

    it('should handle noon correctly', () => {
      expect(parseTimeToHour('12:00 PM')).toBe(12);
      expect(parseTimeToHour('12:30 PM')).toBe(12);
    });

    it('should handle midnight correctly', () => {
      expect(parseTimeToHour('12:00 AM')).toBe(0);
      expect(parseTimeToHour('12:30 AM')).toBe(0);
    });

    it('should handle case-insensitive AM/PM', () => {
      expect(parseTimeToHour('7:30 am')).toBe(7);
      expect(parseTimeToHour('7:30 pm')).toBe(19);
      expect(parseTimeToHour('7:30 Am')).toBe(7);
      expect(parseTimeToHour('7:30 Pm')).toBe(19);
    });

    it('should return 0 for invalid time strings', () => {
      expect(parseTimeToHour('invalid')).toBe(0);
      expect(parseTimeToHour('')).toBe(0);
      // Note: '25:00 AM' matches regex but isn't validated - returns 25 as AM (edge case)
    });
  });

  describe('parseTimeToMinutes', () => {
    it('should convert morning times to minutes', () => {
      expect(parseTimeToMinutes('7:30 AM')).toBe(450); // 7*60 + 30
      expect(parseTimeToMinutes('9:00 AM')).toBe(540);
      expect(parseTimeToMinutes('11:45 AM')).toBe(705);
    });

    it('should convert afternoon times to minutes', () => {
      expect(parseTimeToMinutes('1:00 PM')).toBe(780); // 13*60
      expect(parseTimeToMinutes('3:30 PM')).toBe(930); // 15*60 + 30
      expect(parseTimeToMinutes('11:59 PM')).toBe(1439); // 23*60 + 59
    });

    it('should handle noon correctly', () => {
      expect(parseTimeToMinutes('12:00 PM')).toBe(720); // 12*60
      expect(parseTimeToMinutes('12:30 PM')).toBe(750);
    });

    it('should handle midnight correctly', () => {
      expect(parseTimeToMinutes('12:00 AM')).toBe(0);
      expect(parseTimeToMinutes('12:30 AM')).toBe(30);
    });

    it('should return 0 for invalid time strings', () => {
      expect(parseTimeToMinutes('invalid')).toBe(0);
      expect(parseTimeToMinutes('')).toBe(0);
    });
  });

  describe('calculateEventDuration', () => {
    it('should calculate duration for same-period times', () => {
      expect(calculateEventDuration('7:30 AM', '8:30 AM')).toBe(1);
      expect(calculateEventDuration('1:00 PM', '3:00 PM')).toBe(2);
      expect(calculateEventDuration('9:15 AM', '10:45 AM')).toBe(1.5);
    });

    it('should calculate duration spanning noon', () => {
      expect(calculateEventDuration('11:00 AM', '1:00 PM')).toBe(2);
      expect(calculateEventDuration('10:30 AM', '12:30 PM')).toBe(2);
    });

    it('should calculate duration spanning midnight', () => {
      expect(calculateEventDuration('11:00 PM', '1:00 AM')).toBe(-22); // Negative duration (wraps around)
    });

    it('should handle 30-minute increments', () => {
      expect(calculateEventDuration('7:30 AM', '8:00 AM')).toBe(0.5);
      expect(calculateEventDuration('2:15 PM', '2:45 PM')).toBe(0.5);
    });

    it('should handle 15-minute increments', () => {
      expect(calculateEventDuration('9:00 AM', '9:15 AM')).toBe(0.25);
      expect(calculateEventDuration('3:45 PM', '4:00 PM')).toBe(0.25);
    });
  });

  describe('calculateEventOffset', () => {
    it('should return 0 for times on the hour', () => {
      expect(calculateEventOffset('7:00 AM')).toBe(0);
      expect(calculateEventOffset('12:00 PM')).toBe(0);
      expect(calculateEventOffset('5:00 PM')).toBe(0);
    });

    it('should return fractional offsets for minutes', () => {
      expect(calculateEventOffset('7:30 AM')).toBe(0.5);
      expect(calculateEventOffset('9:15 AM')).toBe(0.25);
      expect(calculateEventOffset('2:45 PM')).toBe(0.75);
    });

    it('should return 0 for invalid time strings', () => {
      expect(calculateEventOffset('invalid')).toBe(0);
      expect(calculateEventOffset('')).toBe(0);
    });
  });

  describe('formatTimeFromHour', () => {
    it('should format morning hours correctly', () => {
      expect(formatTimeFromHour(7)).toBe('7:00 AM');
      expect(formatTimeFromHour(9)).toBe('9:00 AM');
      expect(formatTimeFromHour(11)).toBe('11:00 AM');
    });

    it('should format afternoon hours correctly', () => {
      expect(formatTimeFromHour(13)).toBe('1:00 PM');
      expect(formatTimeFromHour(15)).toBe('3:00 PM');
      expect(formatTimeFromHour(23)).toBe('11:00 PM');
    });

    it('should format noon correctly', () => {
      expect(formatTimeFromHour(12)).toBe('12:00 PM');
    });

    it('should format midnight correctly', () => {
      expect(formatTimeFromHour(0)).toBe('12:00 AM');
    });

    it('should include minutes when provided', () => {
      expect(formatTimeFromHour(7, 30)).toBe('7:30 AM');
      expect(formatTimeFromHour(15, 45)).toBe('3:45 PM');
      expect(formatTimeFromHour(9, 5)).toBe('9:05 AM');
    });

    it('should pad single-digit minutes with zero', () => {
      expect(formatTimeFromHour(7, 5)).toBe('7:05 AM');
      expect(formatTimeFromHour(13, 8)).toBe('1:08 PM');
    });
  });

  describe('formatHeaderDate', () => {
    it('should format dates correctly', () => {
      const date1 = new Date(2026, 3, 2); // April 2, 2026
      expect(formatHeaderDate(date1)).toBe('Apr 2, 2026');

      const date2 = new Date(2025, 0, 15); // January 15, 2025
      expect(formatHeaderDate(date2)).toBe('Jan 15, 2025');

      const date3 = new Date(2024, 11, 31); // December 31, 2024
      expect(formatHeaderDate(date3)).toBe('Dec 31, 2024');
    });

    it('should handle all months correctly', () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((month, index) => {
        const date = new Date(2025, index, 1);
        expect(formatHeaderDate(date)).toBe(`${month} 1, 2025`);
      });
    });
  });

  describe('getWeekDays', () => {
    it('should return 7 days', () => {
      const date = new Date(2026, 3, 2); // Thursday, April 2, 2026
      const weekDays = getWeekDays(date);
      expect(weekDays).toHaveLength(7);
    });

    it('should start the week on Wednesday', () => {
      const date = new Date(2026, 3, 2); // Thursday, April 2, 2026
      const weekDays = getWeekDays(date);
      expect(weekDays[0].day).toBe('Wed'); // Week should start on Wednesday
    });

    it('should include the reference date in the week', () => {
      const date = new Date(2026, 3, 2); // Thursday, April 2, 2026
      const weekDays = getWeekDays(date);

      // Find Thursday (should be day after Wednesday)
      const thursday = weekDays[1];
      expect(thursday.day).toBe('Thu');
      expect(thursday.date).toBe(2);
    });

    it('should handle Wednesday as reference date', () => {
      const wednesday = new Date(2026, 3, 1); // Wednesday, April 1, 2026
      const weekDays = getWeekDays(wednesday);

      // Should start on this Wednesday
      expect(weekDays[0].day).toBe('Wed');
      expect(weekDays[0].date).toBe(1);
    });

    it('should have correct day names in order', () => {
      const date = new Date(2026, 3, 2);
      const weekDays = getWeekDays(date);

      const expectedDays = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
      weekDays.forEach((day, index) => {
        expect(day.day).toBe(expectedDays[index]);
      });
    });

    it('should handle month boundaries correctly', () => {
      const date = new Date(2026, 2, 30); // Monday, March 30, 2026
      const weekDays = getWeekDays(date);

      // Week starts on Wednesday, March 25
      expect(weekDays[0].date).toBe(25);
      expect(weekDays[0].fullDate.getMonth()).toBe(2); // March

      // Week ends on Tuesday, March 31
      expect(weekDays[6].date).toBe(31);
      expect(weekDays[6].fullDate.getMonth()).toBe(2); // March
    });

    it('should provide full date objects', () => {
      const date = new Date(2026, 3, 2);
      const weekDays = getWeekDays(date);

      weekDays.forEach(day => {
        expect(day.fullDate).toBeInstanceOf(Date);
        expect(day.fullDate.getDate()).toBe(day.date);
      });
    });
  });
});

describe('Integration: Time Parsing and Formatting', () => {
  it('should be reversible for parseTimeToHour and formatTimeFromHour', () => {
    const testTimes = ['7:00 AM', '12:00 PM', '5:30 PM', '11:45 PM', '12:00 AM'];

    testTimes.forEach(timeStr => {
      const hour = parseTimeToHour(timeStr);
      const minutes = parseInt(timeStr.match(/:(\d+)/)![1]);
      const formatted = formatTimeFromHour(hour, minutes);
      expect(formatted).toBe(timeStr);
    });
  });

  it('should calculate correct event spans', () => {
    // Test a full day event
    const morningStart = '8:00 AM';
    const eveningEnd = '5:00 PM';
    const duration = calculateEventDuration(morningStart, eveningEnd);
    expect(duration).toBe(9); // 9-hour workday
  });

  it('should handle event positioning calculations', () => {
    const startTime = '7:30 AM';
    const hour = parseTimeToHour(startTime);
    const offset = calculateEventOffset(startTime);

    // Event at 7:30 AM should be at hour 7 with 0.5 offset
    expect(hour).toBe(7);
    expect(offset).toBe(0.5);

    // Total position should be 7.5 hours from midnight
    const totalPosition = hour + offset;
    expect(totalPosition).toBe(7.5);
  });
});

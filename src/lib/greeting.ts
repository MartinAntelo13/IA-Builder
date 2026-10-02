"use strict";

/**
 * Pure functions for greeting logic - no browser APIs, no React.
 * Used by Client Components to get time-based greetings and display names.
 */

/**
 * Get time-based greeting based on hour of day.
 * @param hour - 0-23 hour in 24-hour format
 * @returns 'Buenos días', 'Buenas tardes', or 'Buenas noches'
 */
export function getTimeBasedGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return 'Buenos días';
  } else if (hour >= 12 && hour < 18) {
    return 'Buenas tardes';
  } else {
    // 18:00 - 4:59
    return 'Buenas noches';
  }
}

/**
 * Resolve display name from user profile data.
 * @param fullName - User's full name (optional)
 * @param format - 'first' for first name only, 'full' for complete name
 * @param email - User's email (optional, fallback)
 * @returns Display name string
 */
export function resolveDisplayName(
  fullName: string | null,
  format: 'first' | 'full' = 'first',
  email?: string | null
): string {
  if (fullName?.trim()) {
    if (format === 'first') {
      return fullName.split(' ')[0];
    }
    return fullName;
  }

  if (email?.includes('@')) {
    return email.split('@')[0];
  }

  return 'Usuario';
}
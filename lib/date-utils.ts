/**
 * Date utilities for consistent timezone handling.
 *
 * BUSINESS TIMEZONE: America/Bogota (Colombia, UTC-5)
 *
 * All business dates are interpreted in Colombia timezone and stored as UTC.
 * Colombia does not observe daylight saving time, so the offset is constant.
 */

// Colombia is UTC-5 (no daylight saving)
const BUSINESS_TZ_OFFSET_HOURS = -5;

/**
 * Parse a date string (YYYY-MM-DD) as start of day in Colombia timezone.
 * Returns a Date object in UTC that represents midnight in Colombia.
 *
 * Example: "2026-01-13" → 2026-01-13T05:00:00.000Z (midnight in Colombia = 5AM UTC)
 */
export function parseBusinessDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  // Create date at midnight Colombia time, then convert to UTC
  // Midnight in Colombia (UTC-5) = 5:00 AM UTC
  const colombiaMidnight = new Date(
    Date.UTC(year, month - 1, day, -BUSINESS_TZ_OFFSET_HOURS, 0, 0, 0)
  );
  return colombiaMidnight;
}

/**
 * Get start of business day in UTC for a given date string.
 * Same as parseBusinessDate - midnight in Colombia.
 *
 * Example: "2026-01-13" → 2026-01-13T05:00:00.000Z
 */
export function getBusinessDayStart(dateString: string): Date {
  return parseBusinessDate(dateString);
}

/**
 * Get end of business day in UTC for a given date string.
 * Returns 23:59:59.999 in Colombia timezone, converted to UTC.
 *
 * Example: "2026-01-13" → 2026-01-14T04:59:59.999Z (11:59:59.999 PM Colombia = 4:59:59.999 AM next day UTC)
 */
export function getBusinessDayEnd(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  // 23:59:59.999 in Colombia = next day 00:00:00.000 - 1ms in Colombia
  // Which is: next day 05:00:00.000 - 1ms in UTC
  return new Date(
    Date.UTC(year, month - 1, day + 1, -BUSINESS_TZ_OFFSET_HOURS, 0, 0, 0) - 1
  );
}

/**
 * DATE-ONLY UTILITIES (for birthdates, etc.)
 * 
 * These functions handle dates without time components, avoiding timezone issues.
 */

/**
 * Parse a date string (YYYY-MM-DD or ISO string) as a local Date object.
 * Returns a Date with the correct year, month, and day in local timezone.
 * Use this for displaying dates that should not be affected by timezone conversions.
 * 
 * @param value - Date string in YYYY-MM-DD format or ISO string
 * @returns Date object in local timezone, or undefined if invalid
 * 
 * Example: "1997-09-05" → Date object representing September 5, 1997 (local time)
 */
export function parseDateOnly(
  value: Date | string | null | undefined
): Date | undefined {
  if (!value) return undefined;
  
  const dateStr = typeof value === 'string' ? value : value.toISOString();
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  
  // Create date in local timezone without time component
  return new Date(year, month - 1, day);
}

/**
 * Convert a date string (YYYY-MM-DD) to a Date object for database storage.
 * Uses UTC at noon to avoid timezone conversion issues.
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at UTC noon, or null if invalid
 * 
 * Example: "1997-09-05" → Date object at 1997-09-05T12:00:00.000Z
 */
export function dateOnlyToUTC(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  const [year, month, day] = dateString.split('-').map(Number);
  // Use UTC to avoid timezone issues, set to noon to ensure correct date
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

/**
 * Format a Date object to YYYY-MM-DD string.
 * Extracts the date components directly without timezone conversion.
 * 
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 * 
 * Example: Date(1997, 8, 5) → "1997-09-05"
 */
export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
/**
 * Date utility functions
 * Centralized date logic for consistency across the app
 */

// Week configuration
export const WEEK_STARTS_ON_MONDAY = 1

// Map default zoom level
export const MAP_DEFAULT_ZOOM = 5

/**
 * Get Monday-based day index (Mon=0, Tue=1, ..., Sun=6)
 * @param {Date} date 
 * @returns {number} 0-6 where 0=Monday, 6=Sunday
 */
export function getMondayBasedDayIndex(date) {
    const day = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    return day === 0 ? 6 : day - 1
}

/**
 * Get the first day of month as Monday-based index
 * @param {number} year 
 * @param {number} month - 0-indexed
 * @returns {number} 0-6 where 0=Monday
 */
export function getMonthFirstDayIndex(year, month) {
    return getMondayBasedDayIndex(new Date(year, month, 1))
}

/**
 * Format date for display (MM.DD)
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatShortDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}.${date.getDate()}`
}

/**
 * Check if two dates are in the same month
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
export function isSameMonthYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
}

/**
 * Get month key for storage (YYYY-MM)
 * @param {Date} date 
 * @returns {string}
 */
export function getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

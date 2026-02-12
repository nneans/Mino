/**
 * Date Utility Functions for Mino
 * Centralized date formatting and manipulation
 */

/**
 * Get current date in local timezone as ISO string (YYYY-MM-DD)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getLocalISODate() {
    const now = new Date()
    const tzOffset = now.getTimezoneOffset() * 60000
    return new Date(now - tzOffset).toISOString().slice(0, 10)
}

/**
 * Get current datetime in local timezone as ISO string (YYYY-MM-DDTHH:mm)
 * Useful for datetime-local input fields
 * @returns {string} Datetime string in YYYY-MM-DDTHH:mm format
 */
export function getLocalISODateTime() {
    const tzOffset = new Date().getTimezoneOffset() * 60000
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 16)
}

/**
 * Format date for Korean display (M월 D일)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatKoreanDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/**
 * Format date with full year (YYYY년 M월 D일)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string with year
 */
export function formatKoreanDateFull(date) {
    const d = typeof date === 'string' ? new Date(date) : date
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

/**
 * Format time for Korean display (HH:MM)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time string
 */
export function formatKoreanTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

/**
 * Get month key for budget/stats lookup (YYYY-MM)
 * @param {Date} date - Date object
 * @returns {string} Month key in YYYY-MM format
 */
export function getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Check if a date string starts with today's date
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if date is today
 */
export function isToday(dateString) {
    const today = getLocalISODate()
    return dateString?.startsWith(today)
}

/**
 * Get the start of the current month
 * @returns {Date} First day of current month
 */
export function getMonthStart() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
}

/**
 * Calculate days remaining in current month
 * @returns {number} Number of days left including today
 */
export function getDaysRemainingInMonth() {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return Math.max(1, daysInMonth - now.getDate() + 1)
}

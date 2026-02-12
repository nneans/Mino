/**
 * Constants and Utilities
 * Replaces Python utils.py
 */

// Category mappings
const CATEGORY_KR = {
    'Food': '식비', 'Cafe': '카페', 'Shopping': '쇼핑', 'Transport': '교통',
    'Bills': '공과금', 'Fixed': '고정지출', 'Transfer': '이체', 'Medical': '의료',
    'Exercise': '운동', 'Others': '기타', 'Salary': '급여', 'Allowance': '용돈',
    'Bonus': '보너스', 'Investment': '투자'
};

const EXPENSE_CATEGORIES = [
    { name: 'Food', label: '식비' },
    { name: 'Cafe', label: '카페' },
    { name: 'Shopping', label: '쇼핑' },
    { name: 'Transport', label: '교통' },
    { name: 'Bills', label: '공과금' },
    { name: 'Fixed', label: '고정지출' },
    { name: 'Transfer', label: '이체' },
    { name: 'Medical', label: '의료' },
    { name: 'Exercise', label: '운동' },
    { name: 'Others', label: '기타' }
];

const INCOME_CATEGORIES = [
    { name: 'Salary', label: '급여' },
    { name: 'Allowance', label: '용돈' },
    { name: 'Bonus', label: '보너스' },
    { name: 'Investment', label: '투자' },
    { name: 'Others', label: '기타' }
];

/**
 * Validate expense data
 */
function validateExpenseData(data) {
    if (!data) {
        return { valid: false, error: 'No data provided' };
    }

    if (!data.place) {
        return { valid: false, error: 'Place/description is required' };
    }

    const amount = data.amount;
    if (amount === undefined || amount === null) {
        return { valid: false, error: 'Amount is required' };
    }

    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount)) {
        return { valid: false, error: 'Amount must be a valid number' };
    }

    if (parsedAmount < 0) {
        return { valid: false, error: 'Amount cannot be negative' };
    }

    // Date validation
    const txDate = data.transaction_date;
    if (txDate) {
        const date = new Date(txDate);
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }
    }

    return { valid: true, error: null };
}

/**
 * Rate limiting (in-memory)
 */
const rateLimitCache = {};

function rateLimit(key, maxCalls = 5, periodSeconds = 60) {
    const now = Date.now();

    if (!rateLimitCache[key]) {
        rateLimitCache[key] = [];
    }

    // Clean old entries
    rateLimitCache[key] = rateLimitCache[key].filter(t => now - t < periodSeconds * 1000);

    if (rateLimitCache[key].length >= maxCalls) {
        return false; // Rate limited
    }

    rateLimitCache[key].push(now);
    return true; // Allowed
}

module.exports = {
    CATEGORY_KR,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    validateExpenseData,
    rateLimit,
};

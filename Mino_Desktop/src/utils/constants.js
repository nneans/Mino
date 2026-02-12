export const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5001' : '')
export const INCOME_CATEGORIES = ['Salary', 'Allowance', 'Bonus', 'Investment', 'Others']
export const EXPENSE_CATEGORIES = ['Food', 'Cafe', 'Shopping', 'Transport', 'Bills', 'Fixed', 'Transfer', 'Medical', 'Exercise', 'Others']

// Reverse mapping for display if needed (e.g. English keys to Korean display)
export const CATEGORY_DISPLAY = {
    'Food': '식비', 'Cafe': '카페', 'Shopping': '쇼핑', 'Transport': '교통',
    'Bills': '공과금', 'Fixed': '고정지출', 'Transfer': '이체', 'Medical': '의료', 'Exercise': '운동', 'Others': '기타',
    'Salary': '급여', 'Allowance': '용돈', 'Bonus': '보너스', 'Investment': '투자'
}

export function getKoreanCategory(engCat) {
    return CATEGORY_DISPLAY[engCat] || engCat
}

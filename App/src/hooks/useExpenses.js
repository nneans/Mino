import { useState, useEffect, useMemo } from 'react'
import { expenseService } from '../services/apiService'
import { DEMO_EXPENSES } from '../data/mockData'

const isDemoMode = false

export function useExpenses(config) {
    const [expenses, setExpenses] = useState(isDemoMode ? DEMO_EXPENSES : [])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchExpenses = async () => {
        // Demo mode: use mock data
        if (isDemoMode) {
            setExpenses(DEMO_EXPENSES)
            return
        }

        try {
            setLoading(true)
            const data = await expenseService.getAll()
            setExpenses(data || [])
        } catch (err) {
            console.error('Failed to fetch expenses:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Issue #4: Split heavy calculations into separate useMemo for better performance

    // Basic totals - recalculates only when expenses change
    const basicTotals = useMemo(() => {
        const expenseItems = expenses.filter(e => e.type === 'expense');
        const incomeItems = expenses.filter(e => e.type === 'income');

        return {
            totalExpense: expenseItems.reduce((sum, e) => sum + (e.amount || 0), 0),
            totalIncome: incomeItems.reduce((sum, e) => sum + (e.amount || 0), 0),
            totalFixedExpense: expenseItems.filter(e => e.category === 'Fixed').reduce((sum, e) => sum + (e.amount || 0), 0),
            txCount: expenses.length
        };
    }, [expenses]);

    // Budget usage - depends on totals and config
    const budgetUsage = useMemo(() => {
        if (!config.budget || config.budget <= 0) return 0;
        return Math.min(100, Math.round((basicTotals.totalExpense / config.budget) * 100));
    }, [basicTotals.totalExpense, config.budget]);

    // Top merchants - expensive operation, separate memo
    const topMerchants = useMemo(() => {
        const counts = {};
        expenses.filter(e => e.type === 'expense').forEach(e => {
            const key = e.normalized_place || e.place || 'Unknown';
            counts[key] = (counts[key] || 0) + (e.amount || 0);
        });
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, total]) => ({ name, total }));
    }, [expenses]);

    // Category stats - separate memo
    const categoryStats = useMemo(() => {
        const catTotals = {};
        expenses.filter(e => e.type === 'expense').forEach(e => {
            const cat = e.category || 'Others';
            catTotals[cat] = (catTotals[cat] || 0) + (e.amount || 0);
        });
        const maxVal = Math.max(...Object.values(catTotals), 0);
        return Object.entries(catTotals).map(([name, total]) => ({
            name,
            total,
            percentage: maxVal > 0 ? (total / maxVal) * 100 : 0
        })).sort((a, b) => b.total - a.total);
    }, [expenses]);

    // Daily Guide
    const dailyGuide = useMemo(() => {
        if (!config.budget) return { message: '예산을 설정하면 일일 가이드를 볼 수 있습니다!', status: 'normal' };

        const today = new Date().toISOString().split('T')[0];
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const currentDay = new Date().getDate();
        const daysLeft = Math.max(1, daysInMonth - currentDay + 1);
        const remainingBudget = config.budget - basicTotals.totalExpense;
        const safeDailyLimit = Math.max(0, Math.floor(remainingBudget / daysLeft));

        const todaySpend = expenses
            .filter(e => e.transaction_date?.startsWith(today) && e.type === 'expense')
            .reduce((s, e) => s + (e.amount || 0), 0);

        let message = "";
        let status = "normal";

        if (budgetUsage > 90) {
            message = "예산의 90% 이상을 사용했습니다. 지출을 줄여보세요!";
            status = "danger";
        } else if (todaySpend > safeDailyLimit) {
            message = `오늘 ${todaySpend.toLocaleString()}원 지출 (권장: ${safeDailyLimit.toLocaleString()}원)`;
            status = "warning";
        } else {
            message = `오늘 ${safeDailyLimit.toLocaleString()}원까지 사용 가능`;
            status = "success";
        }
        return { message, safeDailyLimit, daysLeft, status };
    }, [expenses, config.budget, basicTotals.totalExpense, budgetUsage]);

    // Combine all stats
    const stats = useMemo(() => ({
        ...basicTotals,
        budgetUsage,
        topMerchants,
        categoryStats,
        dailyGuide
    }), [basicTotals, budgetUsage, topMerchants, categoryStats, dailyGuide]);

    const addExpense = async (data) => {
        try {
            await expenseService.add(data)
            await fetchExpenses()
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const updateExpense = async (id, data) => {
        try {
            await expenseService.update(id, data)
            await fetchExpenses()
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const deleteExpense = async (id) => {
        try {
            await expenseService.delete(id)
            setExpenses(prev => prev.filter(e => e.id !== id))
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const syncExpenses = async () => {
        try {
            const result = await expenseService.sync()
            await fetchExpenses()
            return { success: true, ...result }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    // Fetch expenses only when config is initially loaded or Gmail user changes
    // Using specific property instead of entire config object to prevent unnecessary re-fetches
    const configLoaded = !!config
    useEffect(() => {
        if (configLoaded) fetchExpenses()
    }, [configLoaded])

    return {
        expenses,
        stats,
        loading,
        error,
        addExpense,
        updateExpense,
        deleteExpense,
        syncExpenses,
        refreshExpenses: fetchExpenses
    }
}

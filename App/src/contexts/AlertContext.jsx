/**
 * Alert Context - Centralized alert/confirm modal management
 * 
 * Benefits:
 * - Any component can trigger alerts without prop drilling
 * - Consistent alert behavior across the app
 * - Easier to extend with new alert types
 */

import { createContext, useContext, useState, useCallback } from 'react'
import AlertModal from '../modals/AlertModal'

const AlertContext = createContext(null)

export function AlertProvider({ children }) {
    const [alertState, setAlertState] = useState({
        open: false,
        title: '',
        message: '',
        type: 'alert', // 'alert' | 'confirm'
        onConfirm: null
    })

    const showAlert = useCallback((title, message, onConfirm = null, type = 'alert') => {
        setAlertState({
            open: true,
            title,
            message,
            onConfirm,
            type
        })
    }, [])

    const showConfirm = useCallback((title, message, onConfirm) => {
        showAlert(title, message, onConfirm, 'confirm')
    }, [showAlert])

    const closeAlert = useCallback(() => {
        setAlertState(prev => ({ ...prev, open: false }))
    }, [])

    const handleConfirm = useCallback(() => {
        if (alertState.onConfirm) {
            alertState.onConfirm()
        }
        closeAlert()
    }, [alertState.onConfirm, closeAlert])

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm, closeAlert }}>
            {children}
            <AlertModal
                isOpen={alertState.open}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={closeAlert}
                onConfirm={handleConfirm}
            />
        </AlertContext.Provider>
    )
}

export function useAlert() {
    const context = useContext(AlertContext)
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider')
    }
    return context
}

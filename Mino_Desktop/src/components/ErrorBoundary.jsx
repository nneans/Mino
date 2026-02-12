import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    margin: '20px',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>앱 실행 중 오류가 발생했습니다</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        새로고침을 시도하거나 관리자에게 문의해 주세요.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px', borderRadius: '8px' }}
                    >
                        새로고침
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

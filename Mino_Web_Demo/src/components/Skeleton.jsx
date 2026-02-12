import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius = '12px', className = '' }) => {
    return (
        <div
            className={`skeleton-base ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius
            }}
        />
    );
};

export const CardSkeleton = () => (
    <div className="dashboard-card skeleton-card">
        <Skeleton width="40%" height="24px" className="mb-4" />
        <Skeleton width="100%" height="200px" />
    </div>
);

// Row skeleton for list items
export const RowSkeleton = ({ count = 5 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <Skeleton width="40px" height="40px" borderRadius="50%" />
                <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height="16px" className="mb-2" />
                    <Skeleton width="40%" height="12px" />
                </div>
                <Skeleton width="80px" height="20px" />
            </div>
        ))}
    </div>
);

// Stat card skeleton
export const StatSkeleton = () => (
    <div style={{ display: 'flex', gap: '16px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ flex: 1, padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <Skeleton width="60%" height="14px" className="mb-3" />
                <Skeleton width="80%" height="28px" />
            </div>
        ))}
    </div>
);

// Full page loading skeleton
export const PageSkeleton = () => (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton width="200px" height="32px" />
        <StatSkeleton />
        <RowSkeleton count={6} />
    </div>
);

// Inline loading spinner
export const InlineLoader = ({ text = '로딩 중...' }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '20px',
        color: '#64748b'
    }}>
        <div className="spinner-small" />
        <span>{text}</span>
    </div>
);

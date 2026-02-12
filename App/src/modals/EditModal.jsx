/* eslint-disable react/prop-types */
import './Modals.css'
import { useState, useEffect } from 'react'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants'
import { expenseService } from '../services/apiService'
import { useAlert } from '../contexts'

export default function EditModal({
    isOpen, onClose, expense, setExpense, onSave, onSearch
}) {
    const { showAlert } = useAlert()
    const [searchResults, setSearchResults] = useState([])
    const [locationKeyword, setLocationKeyword] = useState('')
    const [userLocation, setUserLocation] = useState(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [rememberRule, setRememberRule] = useState(false)

    // Get user's current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                () => {
                    // Location permission denied - silent fail
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }, [])

    // Set location keyword to place name when modal opens or expense changes
    // Also reset search results when switching to different expense
    useEffect(() => {
        // Reset state when expense changes
        setSearchResults([])
        setSearchLoading(false)
        setRememberRule(false)

        if (isOpen && expense?.place && !expense?.location) {
            setLocationKeyword(expense.place)
        } else {
            setLocationKeyword('')
        }
    }, [isOpen, expense?.id])

    const handleSaveInternal = async () => {
        if (rememberRule && expense.place && expense.category) {
            try {
                // Determine normalized place name (simple client-side logic + server-side robustness)
                const res = await expenseService.addRule({
                    place: expense.place,
                    category: expense.category
                })

                if (res.status === 'success' || res.success) {
                    showAlert('학습 완료', `앞으로 '${expense.place}'(은)는 '${expense.category}'(으)로 자동 분류됩니다.`)
                }
            } catch (e) {
                console.error("Failed to save rule:", e)
            }
        }
        onSave()
    }

    if (!isOpen || !expense) return null

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null

        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    const handleLocationSearch = () => {
        if (!locationKeyword.trim()) return

        setSearchLoading(true)
        onSearch(locationKeyword, (results) => {
            let sortedResults = results

            // Only calculate distance if we have valid user location
            if (userLocation && userLocation.lat && userLocation.lng && results.length > 0) {
                sortedResults = results.map(item => {
                    const itemLat = parseFloat(item.y)
                    const itemLng = parseFloat(item.x)

                    // Only calculate if item has valid coordinates
                    if (itemLat && itemLng) {
                        const dist = calculateDistance(
                            userLocation.lat, userLocation.lng,
                            itemLat, itemLng
                        )
                        return { ...item, distance: dist }
                    }
                    return { ...item, distance: null }
                }).sort((a, b) => {
                    // Sort by distance, nulls at end
                    if (a.distance === null) return 1
                    if (b.distance === null) return -1
                    return a.distance - b.distance
                })
            }
            setSearchResults(sortedResults)
            setSearchLoading(false)
        })
    }

    // Location selection does NOT change place name
    const selectPlace = (place) => {
        const addr = place.road_address_name || place.address_name
        setExpense({
            ...expense,
            location: addr,
            latitude: parseFloat(place.y),
            longitude: parseFloat(place.x)
        })
        setSearchResults([])
        setLocationKeyword('')
    }

    const formatDistance = (km) => {
        if (km === null || km === undefined) return ''
        if (km < 1) return `${Math.round(km * 1000)}m`
        return `${km.toFixed(1)}km`
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>거래 수정</h3>

                {/* Place/Content */}
                <div className="form-group">
                    <label>상호명 / 내용</label>
                    <input
                        type="text"
                        value={expense.place}
                        onChange={e => setExpense({ ...expense, place: e.target.value })}
                        placeholder="상호명 또는 지출 내용을 입력하세요"
                    />
                </div>

                {/* Location Search */}
                <div className="form-group">
                    <label>
                        위치 검색
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal', marginLeft: '6px' }}>
                            (선택사항)
                        </span>
                        {userLocation && (
                            <span style={{ fontSize: '0.65rem', color: '#10b981', marginLeft: '8px' }}>
                                📍 현재 위치 기반 정렬
                            </span>
                        )}
                    </label>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="장소명으로 검색 (예: 스타벅스, GS25)"
                            value={locationKeyword}
                            onChange={e => setLocationKeyword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLocationSearch()}
                        />
                        <button
                            type="button"
                            className="btn-search"
                            onClick={handleLocationSearch}
                            disabled={searchLoading}
                        >
                            {searchLoading ? '...' : '검색'}
                        </button>
                    </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="search-results-list" style={{
                        maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0',
                        borderRadius: '6px', marginBottom: '12px', background: 'white'
                    }}>
                        {searchResults.map((item, idx) => (
                            <div key={idx}
                                onClick={() => selectPlace(item)}
                                style={{
                                    padding: '10px 12px',
                                    borderBottom: '1px solid #f1f5f9',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: '600' }}>{item.place_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {item.road_address_name || item.address_name}
                                    </div>
                                </div>
                                {item.distance !== null && item.distance !== undefined && item.distance > 0.001 && (
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: '#10b981',
                                        fontWeight: '600',
                                        background: '#ecfdf5',
                                        padding: '2px 6px',
                                        borderRadius: '10px'
                                    }}>
                                        {formatDistance(item.distance)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Selected Location Display */}
                {expense.location && (
                    <div className="form-group">
                        <label>선택된 위치</label>
                        <div style={{
                            padding: '10px 12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>📍 {expense.location}</span>
                            <button
                                type="button"
                                onClick={() => setExpense({ ...expense, location: '', latitude: null, longitude: null })}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                )}

                {/* Amount & Category */}
                <div className="form-row">
                    <div className="form-group">
                        <label>금액</label>
                        <input
                            type="number"
                            value={expense.amount}
                            onChange={e => setExpense({ ...expense, amount: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group">
                        <label>분류</label>
                        <select
                            value={expense.category}
                            onChange={e => setExpense({ ...expense, category: e.target.value })}
                        >
                            {(expense.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Training & Fixed Expense Checkboxes */}
                <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            id="remember-rule"
                            checked={rememberRule}
                            onChange={(e) => setRememberRule(e.target.checked)}
                            style={{ width: 'auto' }}
                        />
                        <label htmlFor="remember-rule" style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', margin: 0 }}>
                            앞으로 <strong>{expense.place}</strong>(은)는 항상 <strong>{expense.category}</strong>(으)로 분류 (학습하기)
                        </label>
                    </div>

                    {expense.type === 'expense' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="edit-fixed"
                                checked={expense.is_fixed || false}
                                onChange={(e) => setExpense({ ...expense, is_fixed: e.target.checked })}
                                style={{ width: 'auto' }}
                            />
                            <label htmlFor="edit-fixed" style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', margin: 0 }}>
                                📌 <strong>매월 발생하는 고정 지출로 설정</strong>
                            </label>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-primary" onClick={handleSaveInternal}>확인</button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    )
}

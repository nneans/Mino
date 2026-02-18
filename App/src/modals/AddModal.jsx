/* eslint-disable react/prop-types */
import './Modals.css'
import { useState, useEffect } from 'react'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants'
import { goalService } from '../services/apiService'

export default function AddModal({
    isOpen, onClose, form, setForm, onSave, onSearch
}) {
    if (!isOpen) return null

    const [searchResults, setSearchResults] = useState([])
    const [locationKeyword, setLocationKeyword] = useState('')
    const [userLocation, setUserLocation] = useState(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [goals, setGoals] = useState([])

    useEffect(() => {
        if (isOpen) {
            goalService.getAll().then(data => setGoals(data || []))
        }
    }, [isOpen])

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

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null

        const R = 6371 // Earth's radius in km
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

    const selectPlace = (place) => {
        const addr = place.road_address_name || place.address_name
        setForm(prev => ({
            ...prev,
            location: addr,
            latitude: parseFloat(place.y),
            longitude: parseFloat(place.x)
        }))
        setSearchResults([])
        setLocationKeyword('')
    }

    // Format distance for display
    const formatDistance = (km) => {
        if (km === null || km === undefined) return ''
        if (km < 1) return `${Math.round(km * 1000)}m`
        return `${km.toFixed(1)}km`
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>거래 직접 입력</h3>

                {/* Type Toggle */}
                <div className="form-group">
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={`type-btn ${form.type === 'expense' ? 'active expense' : ''}`}
                            onClick={() => setForm({ ...form, type: 'expense', category: 'Food', goal_id: null })}
                        >
                            지출
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${form.type === 'income' ? 'active income' : ''}`}
                            onClick={() => setForm({ ...form, type: 'income', category: 'Salary', goal_id: null })}
                        >
                            수입
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${form.type === 'saving' ? 'active saving' : ''}`}
                            onClick={() => setForm({
                                ...form,
                                type: 'saving',
                                category: 'Saving',
                                goal_id: goals[0]?.id || null,
                                place: goals.length > 0 ? goals[0].name : '저축'
                            })}
                        >
                            저축
                        </button>
                    </div>
                </div>

                {/* Date & Time - 24 hour format with separate selectors */}
                <div className="form-group">
                    <label>날짜 및 시간</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="date"
                            value={form.transaction_date?.split('T')[0] || ''}
                            onChange={e => {
                                const timePart = form.transaction_date?.split('T')[1] || '12:00'
                                setForm({ ...form, transaction_date: `${e.target.value}T${timePart}` })
                            }}
                            style={{ flex: 1 }}
                        />
                        <select
                            value={parseInt(form.transaction_date?.split('T')[1]?.split(':')[0] || '12')}
                            onChange={e => {
                                const datePart = form.transaction_date?.split('T')[0] || new Date().toISOString().slice(0, 10)
                                const minute = form.transaction_date?.split('T')[1]?.split(':')[1] || '00'
                                setForm({ ...form, transaction_date: `${datePart}T${e.target.value.padStart(2, '0')}:${minute}` })
                            }}
                            style={{ width: '70px' }}
                        >
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>{i.toString().padStart(2, '0')}시</option>
                            ))}
                        </select>
                        <span>:</span>
                        <select
                            value={parseInt(form.transaction_date?.split('T')[1]?.split(':')[1] || '0')}
                            onChange={e => {
                                const datePart = form.transaction_date?.split('T')[0] || new Date().toISOString().slice(0, 10)
                                const hour = form.transaction_date?.split('T')[1]?.split(':')[0] || '12'
                                setForm({ ...form, transaction_date: `${datePart}T${hour}:${e.target.value.padStart(2, '0')}` })
                            }}
                            style={{ width: '70px' }}
                        >
                            {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i}>{i.toString().padStart(2, '0')}분</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Place/Content - Simple input without search */}
                {form.type !== 'saving' && (
                    <div className="form-group">
                        <label>상호명 / 내용</label>
                        <input
                            type="text"
                            placeholder="상호명 또는 지출 내용을 입력하세요"
                            value={form.place}
                            onChange={e => setForm({ ...form, place: e.target.value })}
                        />
                    </div>
                )}

                {/* Location Search - Separate section */}
                {form.type !== 'saving' && (
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
                )}

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
                {form.location && form.type !== 'saving' && (
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
                            <span>📍 {form.location}</span>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, location: '', latitude: null, longitude: null })}
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

                {/* Goal Selection for Saving Type */}
                {form.type === 'saving' && (
                    <div className="form-group">
                        <label>저축 목표 선택</label>
                        <select
                            value={form.goal_id || ''}
                            onChange={e => {
                                const gId = parseInt(e.target.value);
                                const g = goals.find(x => x.id === gId);
                                setForm({ ...form, goal_id: gId, place: g ? g.name : '저축' });
                            }}
                        >
                            {goals.length > 0 ? (
                                goals.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))
                            ) : (
                                <option value="">목표 없음 (대시보드에서 추가하세요)</option>
                            )}
                        </select>
                    </div>
                )}

                {/* Amount & Category */}
                <div className="form-row">
                    <div className="form-group">
                        <label>금액</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                        />
                    </div>
                    {form.type !== 'saving' && (
                        <div className="form-group">
                            <label>분류</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                            >
                                {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>



                <div className="modal-actions">
                    <button type="button" className="btn btn-primary" onClick={onSave}>확인</button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    )
}

import "./KakaoMap.css"
import { useEffect, useRef, useState } from 'react'

export default function KakaoMap({ expenses, selectedPlace, onPlaceSelect, apiKey }) {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersRef = useRef([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [loadError, setLoadError] = useState(false)

    // Dynamically load Kakao Maps SDK
    useEffect(() => {
        if (!apiKey) {
            // If API key is missing, show error only if we absolutely need it?
            // Actually, just set error state.
            if (apiKey === undefined) return // Initial undefined check
            setLoadError(true)
            return
        }

        // Check if already loaded
        if (window.kakao && window.kakao.maps) {
            setIsLoaded(true)
            return
        }

        // Load SDK dynamically
        const script = document.createElement('script')
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`
        script.async = true

        script.onload = () => {
            window.kakao.maps.load(() => {
                setIsLoaded(true)
            })
        }

        script.onerror = () => {
            setLoadError(true)
        }

        document.head.appendChild(script)
    }, [apiKey])

    // Initialize map when SDK is loaded (Run only once)
    useEffect(() => {
        if (!isLoaded || !window.kakao || !mapRef.current) return
        if (mapInstanceRef.current) return // Already initialized

        // 위치 정보가 있는 항목 중 가장 최신 것 찾기 (Initial Center only)
        const latestWithLocation = [...expenses]
            .filter(e => e.latitude && e.longitude)
            .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))[0]

        const defaultCenter = latestWithLocation
            ? new window.kakao.maps.LatLng(latestWithLocation.latitude, latestWithLocation.longitude)
            : new window.kakao.maps.LatLng(37.5665, 126.9780)

        const options = {
            center: defaultCenter,
            level: 5
        }
        const map = new window.kakao.maps.Map(mapRef.current, options)
        mapInstanceRef.current = map
    }, [isLoaded]) // Removed 'expenses' dependency to prevent re-initialization

    // Update markers when expenses change
    useEffect(() => {
        if (!mapInstanceRef.current || !window.kakao) return
        const map = mapInstanceRef.current

        // Clear existing markers
        markersRef.current.forEach(m => m.setMap(null))
        markersRef.current = []

        // Group expenses by location (lat/lng rounded to avoid duplicates)
        const locationGroups = {}
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        expenses.filter(e => e.location && e.latitude && e.longitude).forEach(exp => {
            const key = `${exp.latitude.toFixed(4)}_${exp.longitude.toFixed(4)}`
            if (!locationGroups[key]) {
                locationGroups[key] = []
            }
            locationGroups[key].push(exp)
        })

        // Create markers for each unique location
        Object.values(locationGroups).forEach(group => {
            // Sort by date DESC and show up to 5 items
            const sorted = group.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
            const displayItems = sorted.slice(0, 5) // Always show up to 5 items
            const remainingCount = sorted.length - displayItems.length

            const firstExp = sorted[0]
            const position = new window.kakao.maps.LatLng(firstExp.latitude, firstExp.longitude)
            const marker = new window.kakao.maps.Marker({ position, map })

            // Build info content
            const placeName = firstExp.place.length > 15
                ? firstExp.place.substring(0, 15) + '...'
                : firstExp.place

            let infoContent = `<div style="padding:10px;font-size:12px;color:#333;min-width:140px;max-width:200px;">
                <div style="font-weight:bold;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${placeName}</div>`

            displayItems.forEach((exp, idx) => {
                const dateStr = exp.transaction_date.slice(5, 10).replace('-', '/')
                infoContent += `
                    <div style="display:flex;justify-content:space-between;align-items:center;${idx > 0 ? 'margin-top:4px;padding-top:4px;border-top:1px solid #f1f5f9;' : ''}">
                        <span style="color:#666;font-size:11px;">${dateStr}</span>
                        <span style="font-weight:600;color:#3b82f6;">${exp.amount.toLocaleString()}원</span>
                    </div>
                `
            })
            if (remainingCount > 0) {
                infoContent += `<div style="color:#94a3b8;font-size:10px;margin-top:6px;text-align:center;">+${remainingCount}개 더 있음</div>`
            }
            infoContent += `</div>`

            const infowindow = new window.kakao.maps.InfoWindow({ content: infoContent })

            // Simple hover behavior - show on mouseover, hide on mouseout
            window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker))
            window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close())

            markersRef.current.push(marker)
        })
        // No auto-center here - only markers update
    }, [expenses, isLoaded])

    // Handle center change when a specific place is selected (click from list)
    useEffect(() => {
        if (selectedPlace?.latitude && mapInstanceRef.current) {
            const pos = new window.kakao.maps.LatLng(selectedPlace.latitude, selectedPlace.longitude)
            mapInstanceRef.current.setCenter(pos)
        }
    }, [selectedPlace])

    const handleZoom = (delta) => {
        if (!mapInstanceRef.current) return
        const level = mapInstanceRef.current.getLevel()
        mapInstanceRef.current.setLevel(level + delta)
    }

    // Show message if API key is not configured
    if (loadError || (!apiKey && isLoaded)) {
        return (
            <div className="map-placeholder">
                <div className="placeholder-content">
                    <span className="placeholder-icon">🗺️</span>
                    <h4>지도 API 설정 필요</h4>
                    <p>설정에서 Kakao Map API Key를 입력해주세요.</p>
                </div>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="map-placeholder">
                <div className="placeholder-content">
                    <span className="placeholder-icon">⏳</span>
                    <p>지도 로딩 중...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            <div className="custom-zoom-control">
                <button onClick={() => handleZoom(-1)}>+</button>
                <div className="zoom-divider" />
                <button onClick={() => handleZoom(1)}>−</button>
            </div>
        </div>
    )
}

#!/bin/bash
# Mino - Personal Finance Manager
# 더블클릭으로 실행하세요!

cd "$(dirname "$0")"

echo "🚀 Mino 시작 중..."

# 1. 기존 프로세스 정리
echo "🧹 기존 프로세스 정리..."
pkill -f "MacOS/Mino" 2>/dev/null
pkill -f "Electron" 2>/dev/null

# 2. Electron 앱 실행
# 보통 electron-builder는 아키텍처별 폴더(mac-arm64 또는 mac)에 앱을 생성합니다.
APP_ARM64="./Mino_Desktop/release/mac-arm64/Mino.app"
APP_UNIV="./Mino_Desktop/release/mac/Mino.app"
APP_DMG_MOUNT="/Volumes/Mino/Mino.app"

if [ -d "$APP_ARM64" ]; then
    echo "📂 Mino.app (Arm64)을 엽니다..."
    xattr -cr "$APP_ARM64" 2>/dev/null
    open "$APP_ARM64"
elif [ -d "$APP_UNIV" ]; then
    echo "📂 Mino.app (Universal)을 엽니다..."
    xattr -cr "$APP_UNIV" 2>/dev/null
    open "$APP_UNIV"
else
    echo "⚠️ 앱을 찾을 수 없습니다."
    echo "빌드가 완료되었는지 확인해주세요."
fi

echo "✅ 명령 실행 완료"
# 터미널 창을 닫으려면 아래 주석 해제
# exit 0

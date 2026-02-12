# Mino - Personal Finance Manager

개인 금융 관리 데스크톱 앱 (macOS)

## 🚀 시작하기

### 필수 요구사항
- macOS 12.0+
- Python 3.9+
- Node.js 18+
- Gmail 계정 (앱 비밀번호 필요)
- LLM API Key (Gemini, OpenAI, 등) 또는 Ollama (로컬)
- Kakao Map API Key

### 설치

1. **의존성 설치**
```bash
# 백엔드
cd backend
pip install -r requirements.txt

# 프론트엔드
cd frontend
npm install
```

2. **앱 실행**
```bash
# 더블클릭으로 실행
./Mino\ 실행.command

# 또는 수동 실행
cd backend && python3 api.py &
cd frontend && npm run dev
```

3. **브라우저에서 열기**
- http://localhost:5173

## ⚙️ 설정 방법

앱 실행 후 우측 상단의 **"설정"** 버튼을 클릭하세요.

### Gmail 연동

1. [Google 앱 비밀번호](https://myaccount.google.com/apppasswords)에서 16자리 비밀번호 생성
2. Gmail 주소와 앱 비밀번호 입력
3. 카드사 결제 알림 메일을 Gmail로 전달 설정

#### ⚠️ 중요: 메일 제목 형식

Mino가 결제 알림을 인식하려면 **메일 제목에 `[Mino_DATA]`가 반드시 포함**되어야 합니다.

**설정 방법:**
1. Gmail에서 **필터 만들기** (설정 > 필터 및 차단된 주소 > 새 필터 만들기)
2. 발신자: 카드사 알림 이메일 주소 (예: `notification@kbcard.com`)
3. **제목 앞에 추가**: `[Mino_DATA]`를 선택하거나, 스크립트로 자동 추가

또는 카드사 앱에서 전달 설정 시 제목에 `[Mino_DATA]`를 직접 추가하세요.

**예시:**
- ❌ `KB카드 승인 알림`
- ✅ `[Mino_DATA] KB카드 승인 알림`

### LLM API Key

다음 중 하나의 API Key를 입력하세요:
- **Ollama** (로컬 - 무료, 권장)
- Google Gemini
- OpenAI GPT
- Anthropic Claude
- Deepseek
- Groq

### Kakao Map API Key

1. [Kakao Developers](https://developers.kakao.com/)에서 앱 생성
2. **JavaScript Key** 복사
3. 설정에 입력

#### ⚠️ 중요: 플랫폼 도메인 등록

카카오맵 API가 작동하려면 **허용된 도메인을 등록**해야 합니다:

1. [Kakao Developers Console](https://developers.kakao.com/console/app) 접속
2. 앱 선택 > **플랫폼** 탭
3. **Web 플랫폼 등록** 클릭
4. 다음 도메인 추가:
   - `http://localhost:5173` (개발용)
   - `http://localhost:*` (모든 로컬 포트)
   - `http://127.0.0.1:5173`

**Electron 앱 사용 시 추가:**
   - `file://` (로컬 파일 접근용)

## 📱 주요 기능

- **대시보드**: 지출/수입 현황, 예산 관리, 캘린더
- **INBOX**: 거래 내역 조회 및 수정
- **MAP**: 지출 위치 시각화
- **INSIGHT**: AI 분석 및 통계
- **CHAT**: AI 재무 상담

## 🔒 보안

- 모든 API 키와 비밀번호는 **로컬 컴퓨터에만 저장**됩니다
- 설정 파일 위치:
  - Electron 앱: `~/Library/Application Support/Mino/config.json`
  - 개발 모드: `backend/config.json`
- config.json 파일은 사용자만 읽을 수 있도록 권한이 설정됩니다 (chmod 0600)
- 외부 서버로 개인정보가 전송되지 않습니다

## 📊 API 사용량

설정 화면 하단에서 API 사용량을 확인할 수 있습니다:
- LLM API: 월 1,500회 기준 (Ollama 사용 시 무제한)
- Kakao Map API: 월 5,000회 기준

매월 1일에 자동으로 리셋됩니다.

## 🐛 문제 해결

### 백엔드가 시작되지 않음
```bash
pip install flask flask-cors requests
```

### 프론트엔드가 시작되지 않음
```bash
cd frontend && npm install
```

### Gmail 동기화 오류
- 앱 비밀번호가 정확한지 확인 (16자리, 공백 제외)
- 2단계 인증이 활성화되어 있는지 확인
- 메일 제목에 `[Mino_DATA]`가 포함되어 있는지 확인

### 카카오맵이 로드되지 않음
- Kakao Developers에서 도메인이 등록되어 있는지 확인
- JavaScript Key가 정확한지 확인 (32자)
- 브라우저 콘솔에서 CORS 오류 확인

### 포트 충돌 (EADDRINUSE)
```bash
lsof -ti :5001 | xargs kill -9
lsof -ti :5173 | xargs kill -9
```

## 📝 라이선스

MIT License

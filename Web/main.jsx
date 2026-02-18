import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronRight, ChevronLeft, Github, Mail, Map as MapIcon, MessageSquare, AlertTriangle, CheckCircle2, Command, Globe, Server, Code, Monitor, ExternalLink } from 'lucide-react';
import logo from './assets/logo.png';
import screen1 from './assets/screen1.png';
import screen2 from './assets/screen2.png';
import screen3 from './assets/screen3.png';
import screen4 from './assets/screen4.png';
import screen5 from './assets/screen5.png';

const screenshots = [
  { src: screen1, title: '대시보드', desc: '대시보드에서 수입, 지출, 저축 목표를 한눈에 관리하세요.' },
  { src: screen2, title: '지출 동기화', desc: 'Gmail과 연동하여 카드 결제 내역을 자동으로 가져옵니다.' },
  { src: screen3, title: '인사이트', desc: 'AI가 사용자님의 소비 패턴을 분석하고 맞춤형 리포트를 제공합니다.' },
  { src: screen4, title: '재정 리포트', desc: '정확한 수치와 차트로 재정 흐름을 직관적으로 파악하세요.' },
  { src: screen5, title: 'LLM', desc: 'LLM 기반 AI가 사용자님의 지출과 목표를 반영하여 답변합니다.' },
];

function App() {
  const [activeTab, setActiveTab] = useState('install');
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="Mino" className="w-8 h-8 rounded-lg" />
            <span className="text-blue-500">Mino</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
            <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-600 transition-colors">기능 소개</button>
            <button onClick={() => document.getElementById('guide').scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-600 transition-colors">설치 가이드</button>
            <a href="https://mino-frontend.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-bold text-xs">
              <ExternalLink className="w-3.5 h-3.5" />
              Demo
            </a>
            <a href="https://github.com/nneans/Mino" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-blue-500 mb-6 leading-tight break-keep">
              Mino
            </h1>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium break-keep">
              내 컴퓨터에서 관리하는 개인 금융 가계부.
            </p>
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gray-900 overflow-hidden rounded-full font-medium transition-all"
                onClick={() => window.location.href = "https://github.com/nneans/Mino/releases/latest/download/Mino.dmg"}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative flex items-center gap-3 text-white">
                  <Monitor className="w-6 h-6" />
                  <span className="text-lg font-bold tracking-wide">Mac용 다운로드</span>
                </div>
              </motion.button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* App Screenshots Slider */}
      <section className="pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative aspect-[16/10] md:aspect-[21/9] rounded-2xl bg-gray-100 overflow-hidden shadow-2xl border border-gray-200 group">
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentImage}
                src={screenshots[currentImage].src}
                alt={screenshots[currentImage].title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </AnimatePresence>

            {/* Caption */}
            <div className="absolute bottom-8 left-8 text-blue-600 z-10 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 shadow-lg">
              <h3 className="text-xl font-bold mb-1">{screenshots[currentImage].title}</h3>
              <p className="text-gray-600 text-sm">{screenshots[currentImage].desc}</p>
            </div>

            {/* Controls */}
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100 z-20 cursor-pointer">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100 z-20 cursor-pointer">
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 right-8 flex gap-2 z-20">
              {screenshots.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${idx === currentImage ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mino의 핵심 기술</h2>
            <p className="text-gray-500">단순한 기록을 넘어선 자동화와 분석.</p>
          </div>

          <div className="space-y-24">
            {/* Feature 1: Gmail */}
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="w-full md:w-1/3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gmail 결제 연동</h3>
                <div className="h-1 w-12 bg-red-500 rounded-full mb-4"></div>
              </div>
              <div className="w-full md:w-2/3 pt-4">
                <h4 className="text-2xl font-bold text-gray-900 mb-4 break-keep">놓치는 결제 내역 없이, 자동으로.</h4>
                <p className="text-gray-600 leading-relaxed mb-6 break-keep">
                  Mino는 사용자의 Gmail 계정과 연동하여 카드사에서 수신된 결제 승인 메일을 분석합니다.
                  매번 앱을 켜서 입력할 필요 없이, 메일이 도착하면 Mino가 알아서 가계부에 기록합니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-600 break-keep">
                    <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span><b>데이터 프라이버시:</b> 메일 내용은 오직 내 컴퓨터에서만 처리되며 외부로 전송되지 않습니다.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 break-keep">
                    <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span><b>스마트 파싱:</b> [Mino_DATA] 태그가 붙은 메일만 정확하게 골라내어 금액, 가맹점, 시간을 추출합니다.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: LLM */}
            <div className="flex flex-col md:flex-row-reverse gap-12 items-start">
              <div className="w-full md:w-1/3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">Local AI 분석</h3>
                <div className="h-1 w-12 bg-indigo-500 rounded-full mb-4"></div>
              </div>
              <div className="w-full md:w-2/3 pt-4 text-left md:text-right">
                <h4 className="text-2xl font-bold text-gray-900 mb-4 break-keep">내 소비 패턴을 꿰뚫는 전용 비서.</h4>
                <p className="text-gray-600 leading-relaxed mb-6 break-keep">
                  Gemini API, GPT, Ollama 등을 활용해 인터넷 연결 여부와 상관없이 고성능 AI와 대화할 수 있습니다.
                  "이번 달 식비가 왜 이렇게 많이 나왔어?"라고 물어보세요.
                </p>
                <ul className="space-y-3 md:items-end md:flex md:flex-col">
                  <li className="flex items-start gap-3 text-gray-600 break-keep md:flex-row-reverse md:text-right">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span><b>무제한 무료 사용:</b> 내 컴퓨터의 자원을 사용하므로 API 비용이나 구독료가 들지 않습니다.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 break-keep md:flex-row-reverse md:text-right">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span><b>완벽한 보안:</b> 민감한 금융 데이터가 AI 학습용 서버로 넘어갈 걱정이 없습니다.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Kakao Map */}
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="w-full md:w-1/3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center mb-6">
                  <MapIcon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">Kakao Map 시각화</h3>
                <div className="h-1 w-12 bg-yellow-400 rounded-full mb-4"></div>
              </div>
              <div className="w-full md:w-2/3 pt-4">
                <h4 className="text-2xl font-bold text-gray-900 mb-4 break-keep">지도로 보는 나의 라이프스타일.</h4>
                <p className="text-gray-600 leading-relaxed mb-6 break-keep">
                  단순한 텍스트 목록 대신, 지도를 통해 직관적인 소비 기록을 제공합니다.
                  결제된 가맹점 이름을 기반으로 위치를 찾아 지도에 핀을 꽂아드립니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-600 break-keep">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <span><b>정확한 위치 매핑:</b> 카카오맵 API의 방대한 장소 데이터를 활용해 정확한 좌표를 찾습니다.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 break-keep">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <span><b>소비 동선 파악:</b> 내가 주로 어디서 돈을 쓰는지 시각적으로 확인하고 동선을 점검해보세요.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Guide Tabs */}
      <section id="guide" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">초기 설정 가이드</h2>

          <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl mb-12 shadow-inner">
            {[
              { id: 'install', label: '1. 앱 설치 및 권한', icon: <Command className="w-4 h-4" /> },
              { id: 'gmail', label: '2. Gmail 연동', icon: <Mail className="w-4 h-4" /> },
              { id: 'llm', label: '3. LLM 설정', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'kakao', label: '4. Kakao Map', icon: <MapIcon className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200 min-h-[400px]">
            {activeTab === 'install' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="prose max-w-none text-gray-600 break-keep">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm shrink-0">1</span>
                    설치 파일 열기
                  </h3>
                  <p className="ml-9 mb-8">
                    다운로드 받은 <code>Mino.dmg</code> 파일을 실행한 후, Mino 아이콘을 <strong>Applications</strong> 폴더로 드래그하여 설치합니다.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm shrink-0">2</span>
                    보안 경고 및 손상 메시지 해결 (필수)
                  </h3>
                  <div className="ml-9 space-y-6">
                    <p className="text-gray-600">
                      Mino는 Apple 공식 인증서로 서명되지 않아, 실행 시 "손상되어 열 수 없습니다" 또는 "확인되지 않은 개발자" 경고가 발생합니다. 아래 방법 중 하나로 해결 가능합니다.
                    </p>

                    {/* Method A: Terminal */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider text-blue-600">
                        방법 1. 터미널 명령어로 해결 (가장 확실함)
                      </h4>
                      <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-xs">Terminal</span>
                          <Code className="w-4 h-4 text-gray-400" />
                        </div>
                        <code className="text-green-400 break-all">
                          sudo xattr -rd com.apple.quarantine /Applications/Mino.app
                        </code>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed italic">
                        * 터미널 앱 실행 후 위 명령어를 복사/붙여넣기 하고 맥 비밀번호를 입력해주세요. (입력 시 글자가 보이지 않는 것은 정상입니다)
                      </p>
                    </div>

                    {/* Method B: GUI */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider text-blue-600">
                        방법 2. 시스템 설정에서 허용
                      </h4>
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 font-medium">
                          <li>화면 좌측 상단 <span className="font-bold">메뉴 &gt; 시스템 설정 (System Settings)</span>을 엽니다.</li>
                          <li>좌측 사이드바에서 <strong>개인정보 보호 및 보안 (Privacy & Security)</strong> 탭을 클릭합니다.</li>
                          <li>스크롤을 아래로 내려 <strong>보안 (Security)</strong> 섹션을 찾습니다.</li>
                          <li>
                            "Mino 앱이 차단되었습니다" 메시지 옆의
                            <span className="inline-block px-2 py-1 bg-gray-100 border border-gray-300 rounded mx-1 text-xs font-bold text-gray-900">확인 없이 열기 (Open Anyway)</span>
                            버튼을 클릭합니다.
                          </li>
                          <li>팝업창이 뜨면 비밀번호나 Touch ID로 승인합니다.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gmail' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="prose max-w-none text-gray-600 break-keep">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm shrink-0">1</span>
                    앱 비밀번호 발급
                  </h3>
                  <div className="ml-9 mb-8">
                    <p className="mb-4">Mino가 Gmail에 접근하려면 구글 계정의 '앱 비밀번호'가 필요합니다. (기존 로그인 비밀번호 X)</p>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-sm space-y-2">
                      <p>1. 구글 계정 관리 &gt; 보안 탭 &gt; <strong>2단계 인증</strong> 켜기</p>
                      <p>2. 보안 검색창에 '앱 비밀번호' 검색</p>
                      <p>3. 생성할 앱 이름에 'Mino' 입력 후 생성</p>
                      <p>4. 생성된 <strong>16자리 코드</strong>를 복사하여 Mino 앱 설정에 입력</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm shrink-0">2</span>
                    메일 필터링 규칙
                  </h3>
                  <div className="ml-9">
                    <div className="p-5 bg-red-50 border border-red-100 rounded-xl text-red-900 text-sm leading-relaxed">
                      <p className="font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> 중요: 메일 제목 규칙
                      </p>
                      Mino는 정확한 분석을 위해 제목에 <code>[Mino_DATA]</code>가 포함된 메일만 읽어옵니다.<br />
                      Gmail 필터 설정을 통해 카드사 결제 알림 메일 제목 앞에 자동으로 이 태그가 붙도록 설정하거나, 테스트 시 수동으로 제목을 수정해주세요.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'llm' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="prose max-w-none text-gray-600 break-keep">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">다양한 AI 모델 지원</h3>
                  <p className="mb-6">내 상황에 맞는 최적의 AI 모델을 선택할 수 있습니다.</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><Globe className="w-5 h-5" /></div>
                        <h4 className="font-bold">Cloud API (권장)</h4>
                      </div>
                      <ul className="text-sm space-y-2 text-gray-600 list-disc list-inside">
                        <li><strong>Groq (Llama 3)</strong>: <span className="text-blue-600 font-bold">강력 추천!</span> 완전 무료 & 압도적인 속도</li>
                        <li><strong>Google Gemini Pro</strong>: 무료 API 사용 가능 (구글 정책에 따름)</li>
                        <li><strong>OpenAI GPT-4o</strong>: 유료 API Key 필요</li>
                        <li><strong>Anthropic Claude 3.5</strong>: 유료 API Key 필요</li>
                      </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-800"><Server className="w-5 h-5" /></div>
                        <h4 className="font-bold">Local LLM (Ollama)</h4>
                      </div>
                      <ul className="text-sm space-y-2 text-gray-600 list-disc list-inside">
                        <li><strong>Llama 3</strong>: 완전 무료, 로컬 실행</li>
                        <li><strong>Mistral</strong>: 완전 무료, 로컬 실행</li>
                        <li><strong>EEVE-Korean</strong>: 완전 무료, 로컬 실행</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <code className="bg-gray-900 text-green-400 p-2 rounded text-xs block text-center">ollama run mistral</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kakao' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="prose max-w-none text-gray-600 break-keep">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-yellow-400 text-white flex items-center justify-center text-sm shrink-0">1</span>
                        키 발급받기
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p>1. <a href="https://developers.kakao.com/" target="_blank" className="text-blue-600 underline font-bold">Kakao Developers</a> 접속 및 로그인</p>
                        <p>2. <strong>애플리케이션 추가하기</strong> &gt; 앱 이름(Mino) 입력</p>
                        <p>3. 좌측 메뉴 <strong>앱 키</strong> 클릭</p>
                        <p>4. <strong>JavaScript 키</strong> 복사 후 Mino 설정에 입력</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-yellow-400 text-white flex items-center justify-center text-sm shrink-0">2</span>
                        플랫폼 등록 (필수)
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p>1. 좌측 메뉴 <strong>플랫폼</strong> 클릭</p>
                        <p>2. <strong>Web 플랫폼 등록</strong> 버튼 클릭</p>
                        <p>3. <strong>사이트 도메인</strong>에 아래 주소를 입력하고 저장</p>
                        <div className="bg-gray-900 text-yellow-300 p-4 rounded-lg font-mono text-xs leading-relaxed mt-2 selection:bg-yellow-900">
                          file://
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MapIcon className="w-24 h-24 text-yellow-600" />
                      </div>
                      <h4 className="font-bold text-yellow-800 mb-2 relative z-10">💡 왜 file:// 인가요?</h4>
                      <p className="text-sm text-yellow-900 leading-relaxed relative z-10">
                        Mino와 같은 <strong>Electron 앱(데스크톱 앱)</strong>은 내부적으로 파일을 읽을 때 <code>file://</code> 프로토콜을 사용합니다.<br />
                        이 설정은 "내 PC안의 로컬 파일에서 지도를 불러오는 것을 허용하겠다"는 의미이므로,
                        사용자마다 파일 경로가 달라도 문제없이 작동합니다. 안심하고 등록해주세요!
                      </p>
                    </div>

                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Globe className="w-24 h-24 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-blue-800 mb-2 relative z-10">📍 근처 위치가 작동하지 않나요?</h4>
                      <div className="text-sm text-blue-900 leading-relaxed relative z-10 space-y-2">
                        <p>지도와 검색은 잘 되는데 '내 위치' 기능만 안 된다면, macOS의 위치 권한 문제일 확률이 높습니다.</p>
                        <ol className="list-decimal list-inside font-medium text-xs space-y-1">
                          <li>시스템 설정 &gt; 개인정보 보호 및 보안 &gt; 위치 서비스</li>
                          <li>'위치 서비스' 스위치가 켜져 있는지 확인</li>
                          <li>목록에서 <strong>Mino</strong>(또는 사용하는 브라우저) 앱을 찾아 허용</li>
                          <li>Mino 앱 재시작</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Mino. Built for macOS.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

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
  { src: screen1, title: '한눈에 파악하는 나의 재정 현황', desc: '대시보드에서 수입, 지출, 저축 목표를 한눈에 관리하세요.' },
  { src: screen2, title: '터치 한 번으로 끝나는 스마트한 지출 동기화', desc: 'Gmail과 연동하여 카드 결제 내역을 자동으로 가져옵니다.' },
  { src: screen3, title: '나보다 더 나를 잘 아는 인공지능 소비 분석', desc: 'AI가 사용자님의 소비 패턴을 분석하고 맞춤형 리포트를 제공합니다.' },
  { src: screen4, title: '차트로 확인하는 월간/연간 재정 리포트', desc: '정확한 수치와 차트로 재정 흐름을 직관적으로 파악하세요.' },
  { src: screen5, title: '무엇이든 물어보세요, 개인 금융 비서 Mino', desc: 'LLM 기반 AI가 사용자님의 지출과 목표를 반영하여 답변합니다.' },
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
      ... (rest of the file)

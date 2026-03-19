"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useBasketStore } from "@/store/basketStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// 포리의 풍부한 메시지 라이브러리 (상황별/성격별)
const PORI_MESSAGES_KO = [
  // 인사 및 환영
  "안녕! 나는 상호작용 마스터 포리야! 🧪✨",
  "오늘도 대표님의 영양 밸런스를 위해 포리 가동! 🚀",
  "반가워! 오늘은 어떤 영양제들이 내 돔 안으로 들어올까? 🧪",

  // 기능 안내 및 유도
  "영양제끼리 싸우지 않게 내가 꼼꼼히 체크해줄게! 🛡️",
  "함께 먹으면 효과가 두 배! 그런 꿀조합만 찾아줄게! 🧬",
  "영양제 바구니를 채워봐! 포리 레이더가 작동 중이야! 🛰️",
  "궁금한 조합이 있다면 주저 말고 나를 클릭해줘! 😎",

  // 전문가적 면모
  "복잡한 과학 분석도 포리에겐 식은 죽 먹기지! 🔬",
  "성분들 사이의 숨겨진 운명을 읽어내는 게 내 특기야! ✨",
  "나노 입자 수준으로 정밀하게 매칭 시스템 가동 중! 🧬",

  // 응원 및 건강 팁
  "건강한 내일을 위한 완벽한 밸런스, 포리가 찾아줄게! 🌈",
  "대표님, 물은 충분히 마시고 계신가요? 수분도 중요해요! 💧",
  "피곤할 땐 눈을 잠시 감고 포리의 힐링 에너지를 받아봐! ✨",
  "대표님의 건강 자산, 포리가 확실히 지켜드릴게요! 💎",

  // 영양제 시너지 & 주의 팁 (지식 전수)
  "비타민C와 철분은 환상의 짝꿍! 흡수율이 쭉쭉 올라가요! 🍊+⛓️",
  "칼슘과 마그네슘은 2:1 비율이 이상적이에요. 포리가 체크해줄게요! ⚖️",
  "오메가3는 식사 후에 드시는 게 흡수가 더 잘 된다는 사실! 유익하죠? 🐟",
  "지용성 비타민은 지방과 함께! 더 똑똑하게 섭취해봐요!  avocado",
  "철분과 칼슘은 서로 흡수를 방해해요! 시간차를 두는 게 핵심! 🛡️",
  "비타민D는 칼슘 흡수를 돕는 최고의 파란색 조력자예요! ☀️",
  "종합비타민에 이미 포함된 성분이 있는지 포리가 살펴볼게요! 🔍",
  "카페인은 일부 영양소 흡수를 방해하니 주의가 필요해요! ☕",

  // 재미 및 애교
  "내 돔 안의 입자들이 오늘따라 아주 활발해! 시너지 예감! ⚡",
  "포포포~ 포리 중! 최고의 궁합을 찾고 있어! 🍱",
  "바구니에 영양제가 담길 때마다 내 마음도 콩닥콩닥! 💓",
  "포리는 대표님만의 전용 AI 영양사라구! 👩‍🔬",
];

const PORI_MESSAGES_EN = [
  // Greeting & Welcome
  "Hi! I'm Pori, the Master of Interactions! 🧪✨",
  "Activating Pori for your nutritional balance today! 🚀",
  "Welcome! What supplements are we mixing today? 🧪",

  // Feature Guidance
  "I'll make sure your supplements get along perfectly! 🛡️",
  "Double the effect! I'll find the best synergies! 🧬",
  "Fill your basket! My Pori radar is scanning! 🛰️",
  "Click me anytime if you have questions! 😎",

  // Professional Side
  "Complex scientific analysis is a piece of cake for me! 🔬",
  "Reading the destiny between ingredients is my specialty! ✨",
  "Precision matching system activated at the nano-level! 🧬",

  // Support & Health Tips
  "I'll find the perfect balance for your healthy tomorrow! 🌈",
  "Are you drinking enough water? Hydration is key! 💧",
  "Close your eyes and feel Pori's healing energy! ✨",
  "I'll protect your health assets with precision! 💎",

  // Supplement Synergies & Cautions
  "Vitamin C and Iron are best friends! Absorption shoots up! 🍊+⛓️",
  "Calcium and Magnesium work best in a 2:1 ratio! ⚖️",
  "Omega-3 is better absorbed after a meal! 🐟",
  "Fat-soluble vitamins love healthy fats! Let's get smarter! avocado",
  "Iron and Calcium can block each other. Timing is everything! 🛡️",
  "Vitamin D is the blue-ribbon helper for calcium absorption! ☀️",
  "I'll check for overlapping ingredients in your multi-vitamins! 🔍",
  "Caffeine can hinder some nutrient absorption! Watch out! ☕",

  // Fun & Personality
  "The particles inside my dome are so active today! Feel the synergy! ⚡",
  "Po-po-pori! Finding the ultimate match for you! 🍱",
  "My heart flutters every time you add a supplement! 💓",
  "I'm your exclusive AI Nutritionist, Pori! 👩‍🔬",
];

export default function FloatingAssistant() {
  const { selectedIngredients, language, isBasketExpanded, hasResult, isAnalyzing } = useBasketStore();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [poriStatus, setPoriStatus] = useState<'idle' | 'thinking' | 'happy'>('idle');

  const hasItems = selectedIngredients.length > 0;
  // 바구니 바가 보일 때 (바구니에 아이템이 있고, 분석 중이 아니고, 분석 결과가 없을 때)
  const isBasketBarVisible = hasItems && !isAnalyzing && !hasResult;
  const messages = language === "ko" ? PORI_MESSAGES_KO : PORI_MESSAGES_EN;
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    // 모바일에서도 첫 진입 시 자동으로 말풍선 노출 (선택 시 숨겨지는 로직이 추가되었으므로 가이드로 활용)
    const timer = setTimeout(() => {
      setIsVisible(true);
      setMessage(messages[0]);
      // 모바일은 주목도를 위해 2.5초 뒤에, 데스크탑은 0.5초 뒤에 노출
      setTimeout(() => setShowBubble(true), isMobile ? 2500 : 500);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isMobile, messages]);

  useEffect(() => {
    if (!isVisible) return;
    setShowBubble(false);
    setIsBubbleDismissed(false);

    // 언어 변경 시 가이드를 위해 노출
    setTimeout(() => {
      setMessage(messages[0]);
      setShowBubble(true);
    }, isMobile ? 1200 : 800);
  }, [language, isVisible, isMobile, messages]);

  useEffect(() => {
    // 선택 안된 상태에서는 모바일에서도 이따금씩 팁을 보여주도록 인터벌 재활성화
    if (!isVisible || isBubbleDismissed) return;
    const interval = setInterval(() => {
      setShowBubble(false);
      setPoriStatus('thinking');
      setTimeout(() => {
        const nextMsg = messages[Math.floor(Math.random() * messages.length)];
        setMessage(nextMsg);
        setPoriStatus('idle');
        setShowBubble(true);
      }, 1200);
    }, 20000); // 모바일 배려를 위해 인터벌 주기를 조금 늘림 (20초)
    return () => clearInterval(interval);
  }, [isVisible, messages, isBubbleDismissed, isMobile]);

  const shouldShowOnMobile = !hasItems || hasResult;
  const renderAssistant = !isBasketExpanded && (!isMobile || shouldShowOnMobile);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {renderAssistant && (
        <motion.div
          className="fixed right-7 md:right-8 bottom-0 z-60 pointer-events-none"
          id="pori-assistant-root"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-end"
            style={{
              paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${isBasketBarVisible ? '130px' : (isMobile ? '20px' : '48px')})`
            }}
          >
            <AnimatePresence>
              {showBubble && !isBubbleDismissed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
                  className="mb-2 md:mb-3 relative"
                >
                  <div
                    className="relative px-4 py-3 md:px-5 md:py-4 rounded-[1.5rem] md:rounded-[2rem] max-w-[160px] md:max-w-[260px] pointer-events-auto group/bubble"
                    style={{
                      background: "linear-gradient(145deg, rgba(8,12,24,0.92) 0%, rgba(10,22,20,0.92) 100%)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)"
                    }}
                  >
                    <div className="absolute top-3 left-4 flex items-center gap-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
                      />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBubble(false);
                        setIsBubbleDismissed(true);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full opacity-100 md:opacity-0 md:group-hover/bubble:opacity-100 transition-opacity hover:bg-white/10 text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-2.5 py-0.5 rounded-full"
                          style={{
                            background: "linear-gradient(90deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))",
                            border: "1px solid rgba(16,185,129,0.3)",
                            color: "#6ee7b7"
                          }}
                        >
                          Pori AI
                        </span>
                        {poriStatus === 'thinking' && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map(i => (
                              <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1 h-1 rounded-full"
                                style={{ background: "#34d399" }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] md:text-[13px] font-semibold leading-relaxed tracking-tight break-keep" style={{ color: "rgba(255,255,255,0.82)" }}>
                        {message}
                      </p>
                    </div>

                    <div
                      className="absolute -bottom-1.5 md:-bottom-2 right-7 md:right-9 w-3 h-3 md:w-4 md:h-4 rotate-45"
                      style={{
                        background: "linear-gradient(145deg, rgba(10,22,20,0.92), rgba(8,12,24,0.92))",
                        borderRight: "1px solid rgba(16,185,129,0.2)",
                        borderBottom: "1px solid rgba(16,185,129,0.2)"
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group pointer-events-auto">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowBubble(false);
                  setIsBubbleDismissed(false);
                  setPoriStatus('happy');
                  setTimeout(() => {
                    const nextMsg = messages[Math.floor(Math.random() * messages.length)];
                    setMessage(nextMsg);
                    setShowBubble(true);
                    setPoriStatus('idle');
                  }, 400);
                }}
                className="relative w-16 h-16 md:w-32 md:h-32 cursor-pointer"
              >
                {/* ── ULTIMATE AURA: 다채로운 오로라 레이어 ── */}
                <div className="absolute inset-x-[-20%] inset-y-[-20%] flex items-center justify-center pointer-events-none overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full bg-emerald-500/20 blur-[60px] rounded-full opacity-60" 
                  />
                  <motion.div 
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-full bg-cyan-400/10 blur-[50px] rounded-full opacity-40 translate-x-4" 
                  />
                </div>

                {/* ── HUD SCANNER: 정밀 분석 링 ── */}
                <div className="absolute inset-[-10%] pointer-events-none">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-[1px] border-emerald-500/10 rounded-full"
                    style={{ borderStyle: 'dotted' }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-3 border-[0.5px] border-cyan-400/15 rounded-full"
                    style={{ borderStyle: 'dashed' }}
                  />
                </div>

                {/* ── VITAMIN ESSENCE: 플로팅 파티클 효과 ── */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [-10, -60], 
                      x: [0, (i % 2 === 0 ? 25 : -25)],
                      opacity: [0, 0.8, 0],
                      scale: [0.3, 0.6, 0.2]
                    }}
                    transition={{ 
                      duration: 2 + i * 0.5, 
                      repeat: Infinity, 
                      delay: i * 0.4,
                      ease: "easeOut" 
                    }}
                    className="absolute left-1/2 bottom-1/2 w-2 h-2 rounded-full pointer-events-none z-0"
                    style={{ background: i % 2 === 0 ? '#10b981' : '#06b6d2', filter: 'blur(2px)' }}
                  />
                ))}

                {/* ── PORI MAIN UNIT: 공중 부양 ── */}
                <motion.img
                  src="/images/pori.png"
                  alt="Pori"
                  animate={{ 
                    y: [0, -14, 0],
                    rotate: [0, 3, -2, 0]
                  }}
                  transition={{ 
                    duration: 4.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className={cn(
                    "relative z-10 w-full h-full object-contain rounded-full transition-all duration-500 drop-shadow-[0_15px_30px_rgba(16,185,129,0.3)]",
                    poriStatus === 'thinking' ? "brightness-125 saturate-150 scale-105" : "brightness-[1.03] contrast-[1.05]"
                  )}
                  style={{
                    maskImage: 'radial-gradient(circle at center, black 65%, transparent 72%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 72%)'
                  }}
                />

                {/* ── HOLOGRAPHIC HUD: 오비팅 코어 ── */}
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-x-[-25%] inset-y-[-25%] opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 pointer-events-none"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-black/80 backdrop-blur-xl rounded-[1rem] flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <span className="text-lg">🧬</span>
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-xl rounded-[1rem] flex items-center justify-center border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-black/80 backdrop-blur-xl rounded-[1rem] flex items-center justify-center border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <span className="text-lg">🔬</span>
                  </div>
                </motion.div>
                 
                {/* ── 상태 표시 코어 (PING) ── */}
                <div className="absolute bottom-2 right-2 md:bottom-5 md:right-5 flex items-center justify-center z-30">
                  <div className="absolute w-10 h-10 md:w-16 md:h-16 bg-emerald-400/20 rounded-full animate-ping opacity-20" />
                  <div className="relative w-4 h-4 md:w-6 md:h-6 bg-emerald-500 border-[4px] border-white rounded-full shadow-[0_0_25px_rgba(16,185,129,1)]" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useBasketStore } from "@/store/basketStore";

// 포리의 풍부한 메시지 라이브러리 (상황별/성격별)
const MIXY_MESSAGES_KO = [
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
  "지용성 비타민은 지방과 함께! 더 똑똑하게 섭취해봐요! 🥑",
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

const MIXY_MESSAGES_EN = [
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
  "Fat-soluble vitamins love healthy fats! Let's get smarter! 🥑",
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

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function FloatingAssistant() {
  const { selectedIngredients, language } = useBasketStore();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [poriStatus, setPoriStatus] = useState<'idle' | 'thinking' | 'happy'>('idle');

  const hasItems = selectedIngredients.length > 0;
  const messages = language === "ko" ? MIXY_MESSAGES_KO : MIXY_MESSAGES_EN;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setMessage(messages[0]);
      setTimeout(() => setShowBubble(true), 500);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    setShowBubble(false);
    setIsBubbleDismissed(false);
    setTimeout(() => {
      setMessage(messages[0]);
      setShowBubble(true);
    }, 500);
  }, [language, isVisible]);

  useEffect(() => {
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
    }, 15000);
    return () => clearInterval(interval);
  }, [isVisible, messages, isBubbleDismissed]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed right-3 md:right-8 z-[100] flex flex-col items-end pointer-events-none transition-all duration-1000 ease-in-out",
        hasItems ? "bottom-32 md:bottom-32" : "bottom-10 md:bottom-12"
      )} 
      id="pori-assistant-root"
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
                backdropFilter: "blur(40px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)"
              }}
            >
              {/* 내부 글로우 오브 */}
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-30 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)", filter: "blur(15px)" }}
              />
              {/* 폄리 상태 인디케이터 */}
              <div className="absolute top-3 left-4 flex items-center gap-1">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
                />
              </div>

              {/* 닫기 버튼 */}
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
                <p
                  className="text-[11px] md:text-[13px] font-semibold leading-relaxed tracking-tight break-keep"
                  style={{ color: "rgba(255,255,255,0.82)" }}
                >
                  {message}
                </p>
              </div>

              {/* 말풍선 꼬리 */}
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
          {/* 하이퍼 코어 오라 */}
          <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-amber-300/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-1000 animate-pulse-slow" />
          
          {/* 회전하는 액션 서클 (Hover 시 노출) */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 inset-y-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border border-white/20 shadow-xl">
              <span className="text-xs">🧬</span>
            </div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border border-white/20 shadow-xl">
              <span className="text-xs">⚡</span>
            </div>
            <div className="absolute bottom-1/2 -left-4 translate-y-1/2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border border-white/20 shadow-xl">
              <span className="text-xs">🔬</span>
            </div>
          </motion.div>

          <img
            src="/images/mixy.png"
            alt="Pori"
            className={cn(
              "w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)] transition-all duration-500",
              poriStatus === 'thinking' ? "brightness-110 saturate-150" : ""
            )}
            style={{ 
              mixBlendMode: 'multiply',
              maskImage: 'radial-gradient(circle, black 65%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 95%)'
            }}
          />
          
          {/* 다중 레이어 가동 상태 인디케이터 */}
          <div className="absolute bottom-4 right-4 md:bottom-7 md:right-7 flex items-center justify-center">
            <div className="absolute w-6 h-6 md:w-8 md:h-8 bg-emerald-400/30 rounded-full animate-ping" />
            <div className="relative w-3 h-3 md:w-5 md:h-5 bg-emerald-500 border-[3px] border-white rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          </div>
          
          {/* 톡톡 튀는 마법 효과 파티클 */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              opacity: [1, 0, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-sm md:text-xl"
          >
            ✨
          </motion.div>
          <motion.div 
            animate={{ 
              x: [0, 15, 0],
              rotate: [0, 360, 0]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/2 -left-6 text-sm md:text-lg opacity-80"
          >
            💊
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -left-2 text-sm md:text-lg"
          >
            💎
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}


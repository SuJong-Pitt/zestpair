"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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

import { useBasketStore } from "@/store/basketStore";

export default function FloatingAssistant() {
  const { selectedIngredients } = useBasketStore();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const hasItems = selectedIngredients.length > 0;

  useEffect(() => {
    // 브라우저 언어 설정 확인 (혹은 URL 쿼리 파라미터 등)
    const browserLang = navigator.language.startsWith("ko") ? "ko" : "en";
    setLang(browserLang);

    const messages = browserLang === "ko" ? MIXY_MESSAGES_KO : MIXY_MESSAGES_EN;

    // 1.5초 뒤에 포리 등장!
    const timer = setTimeout(() => {
      setIsVisible(true);
      setMessage(messages[0]);
      setTimeout(() => setShowBubble(true), 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 주기적으로 포리의 상태 브리핑
  useEffect(() => {
    if (!isVisible) return;
    
    const messages = lang === "ko" ? MIXY_MESSAGES_KO : MIXY_MESSAGES_EN;

    const interval = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        const nextMsg = messages[Math.floor(Math.random() * messages.length)];
        setMessage(nextMsg);
        setShowBubble(true);
      }, 600);
    }, 10000); // 10초마다 소통

    return () => clearInterval(interval);
  }, [isVisible, lang]);

  if (!isVisible) return null;

  const currentMessages = lang === "ko" ? MIXY_MESSAGES_KO : MIXY_MESSAGES_EN;

  return (
    <div 
      className={cn(
        "fixed right-3 md:right-4 z-50 flex flex-col items-end pointer-events-none transition-all duration-700 ease-in-out",
        hasItems ? "bottom-32 md:bottom-28" : "bottom-6 md:bottom-8"
      )} 
      id="pori-assistant-root"
    >
      {/* 포리의 말풍선 */}
      <div
        className={cn(
          "mb-3 px-4 py-3 bg-white/95 backdrop-blur-lg rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-emerald-100/60 max-w-[180px] md:max-w-[220px] transition-all duration-700 origin-bottom-right pointer-events-auto",
          showBubble ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-6"
        )}
      >
        <p className="text-[11px] md:text-sm font-black text-[#0D4D43] leading-[1.4] tracking-tight">
          {message}
        </p>
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/95 border-r border-b border-emerald-100/60 rotate-45 transform" />
      </div>

      {/* 포리 본체 (캡슐 로봇) */}
      <div className="relative group pointer-events-auto">
        {/* 역동적인 오라 효과 */}
        <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-amber-300/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-1000 animate-pulse-slow" />
        
        <div className="relative w-16 h-16 md:w-28 md:h-28 animate-float cursor-pointer active:scale-90 transition-all duration-300 transform group-hover:scale-110"
             onClick={() => {
                setShowBubble(false);
                setTimeout(() => {
                    const nextMsg = currentMessages[Math.floor(Math.random() * currentMessages.length)];
                    setMessage(nextMsg);
                    setShowBubble(true);
                }, 300);
             }}>
          <img
            src="/images/mixy.png"
            alt="Pori - Synergy Analysis Master"
            className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)]"
            style={{ 
              mixBlendMode: 'multiply',
              maskImage: 'radial-gradient(circle, black 65%, transparent 98%)',
              WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 98%)'
            }}
          />
          
          {/* 가동 상태 인디케이터 */}
          <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 w-2.5 h-2.5 md:w-4 md:h-4 bg-[#10B981] border-2 md:border-[3px] border-white rounded-full shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse" />
          
          {/* 부유 파티클 (애니메이션 요소) */}
          <div className="absolute -top-1 -right-1 text-[10px] md:text-xs animate-bounce" style={{ animationDuration: '4s' }}>✨</div>
          <div className="absolute top-1/2 -left-3 text-xs md:text-sm animate-pulse opacity-60">💊</div>
        </div>
      </div>
    </div>
  );
}


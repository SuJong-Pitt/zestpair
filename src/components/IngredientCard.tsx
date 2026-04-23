"use client";

import { memo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Ingredient } from "@/types/database";
import { useBasketStore } from "@/store/basketStore";
import { cn } from "@/lib/utils";
import { Check, Clock, Sparkles, Zap, Waves, Heart, ShieldCheck } from "lucide-react";
import { UI_TRANSLATIONS } from "@/lib/i18n";

interface IngredientCardProps {
  ingredient: Ingredient;
  isFeatured?: boolean;
}

/* ── 카테고리별 컬러 테마 (모듈 상수 — 렌더마다 재생성 방지) ──
 * icon 을 JSX가 아닌 컴포넌트 레퍼런스로 저장해 불필요한 객체 생성을 없앱니다.
 */
const THEME_MAP = {
  vitamin: { color: "#f59e0b", glow: "rgba(245,158,11,0.35)", Icon: Zap },
  omega:   { color: "#06b6d4", glow: "rgba(6,182,212,0.35)",  Icon: Waves },
  collagen:{ color: "#f43f5e", glow: "rgba(244,63,94,0.35)",  Icon: Heart },
  default: { color: "#10b981", glow: "rgba(16,185,129,0.35)", Icon: ShieldCheck },
} as const;

function getCategoryTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("vitamin") || n.includes("비타민")) return THEME_MAP.vitamin;
  if (n.includes("omega")   || n.includes("오메가"))   return THEME_MAP.omega;
  if (n.includes("collagen")|| n.includes("콜라겐")) return THEME_MAP.collagen;
  return THEME_MAP.default;
}

const IngredientCardContent = memo(function IngredientCardContent({ ingredient, isFeatured = false }: IngredientCardProps) {
  // ── useHasMounted 제거: Zustand isSelected는 클라이언트 전용이므로 직접 호출해도 안전
  const { isSelected, toggleIngredient, language } = useBasketStore();
  const selected = isSelected(ingredient.id);
  const [showTooltip, setShowTooltip] = useState(false);

  const t = UI_TRANSLATIONS[language];
  const name     = language === "ko" ? ingredient.name     : ingredient.name_en;
  const shortDesc= language === "ko" ? ingredient.short_description : (ingredient.short_description_en || ingredient.short_description);
  const desc     = language === "ko" ? ingredient.description       : (ingredient.description_en       || ingredient.description);
  const theme    = getCategoryTheme(ingredient.name);
  const { Icon } = theme;

  // 말풍선 자동 사라짐 타이머
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleToggle = () => {
    toggleIngredient(ingredient);
    setShowTooltip(true);
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => !selected && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="group relative w-full text-left transition-transform duration-200 active:scale-95 hover:-translate-y-1 hover:z-[60]"
      style={{ zIndex: showTooltip ? 50 : 1 }}
    >
      {/* ── 카드 본체 ── */}
      <div
        className="relative w-full rounded-[1.75rem] overflow-hidden transition-all duration-500"
        style={selected ? {
          background: "linear-gradient(145deg, #0a1a15 0%, #060e10 100%)",
          border: `1.5px solid ${theme.color}`,
          boxShadow: `0 15px 40px ${theme.glow}, inset 0 0 12px ${theme.color}15`,
        } : {
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* ── 배경 글로우 오브 (Selected) ── */}
        {selected && (
          <div
            className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-50"
            style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, filter: "blur(25px)" }}
          />
        )}

        {/* ── TRENDING / LIMITED 배지 ── */}
        {(isFeatured || ingredient.is_popular) && (
          <div className="absolute top-0 left-5 z-30">
            <div
              className="text-[8px] font-[900] px-2.5 py-1 rounded-b-xl text-white tracking-widest uppercase"
              style={isFeatured ? {
                background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                boxShadow: "0 4px 12px rgba(16,185,129,0.4)"
              } : {
                background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                boxShadow: "0 4px 12px rgba(239,68,68,0.4)"
              }}
            >
              {isFeatured ? "TRENDING" : "LIMITED"}
            </div>
          </div>
        )}

        {/* ── 속성 아이콘 오브 ── */}
        <div
          className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
          style={selected ? {
            background: `${theme.color}20`,
            border: `1px solid ${theme.color}40`,
            color: theme.color,
          } : {
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#64748b"
          }}
        >
          <Icon size={11} />
        </div>

        {/* ── 이모지 이미지 영역 (세로폭 축소 및 크기 조정) ── */}
        <div
          className="relative w-full h-16 md:h-24 flex items-center justify-center overflow-hidden"
          style={selected ? {
            background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 100%)",
          } : {
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
          }}
        >
          <span
            className="relative z-10 text-2xl md:text-4xl transition-transform duration-500"
            style={selected ? {
              transform: "scale(1.1)",
              filter: `drop-shadow(0 0 12px ${theme.glow})`
            } : {
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.12))"
            }}
          >
            {ingredient.icon_emoji}
          </span>
        </div>

        {/* ── 텍스트 영역 (간격 조정) ── */}
        <div className="px-4 pt-2.5 pb-0.5">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <h3
              className="font-black text-[11px] md:text-[14px] tracking-tight leading-tight line-clamp-1 transition-colors duration-300"
              style={selected ? { color: theme.color } : { color: "#e2e8f0" }}
            >
              {name}
            </h3>
            {selected && (
              <div className="shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
              </div>
            )}
          </div>

          <p
            className="text-[9px] md:text-[11px] leading-snug line-clamp-2 transition-colors duration-300 h-6 md:h-auto"
            style={selected ? { color: "rgba(255,255,255,0.4)", fontWeight: 500 } : { color: "#94a3b8", fontWeight: 500 }}
          >
            {shortDesc}
          </p>
        </div>

        {/* ── 하단 바 (높이 및 간격 축소) ── */}
        <div
          className="flex items-center justify-between px-4 py-2 mt-0.5 transition-colors duration-300"
          style={selected
            ? { borderTop: `1px solid ${theme.color}20` }
            : { borderTop: "1px solid rgba(255,255,255,0.06)" }
          }
        >
          {/* 복용 시간 태그 */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-wider"
            style={selected ? {
              background: `${theme.color}18`,
              border: `1px solid ${theme.color}30`,
              color: theme.color
            } : {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: isFeatured ? "#10b981" : "#475569"
            }}
          >
            <Clock size={8} strokeWidth={2.5} />
            {t.dosage[ingredient.dosage_time]}
          </div>

          {/* 선택됨 / 힌트 */}
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tight">
            {selected ? (
              <div className="flex items-center gap-1" style={{ color: theme.color }}>
                <Check size={10} strokeWidth={3.5} />
                {t.common.selected}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {isFeatured
                  ? <Sparkles size={12} className="text-emerald-400 opacity-60" />
                  : <div className="w-4 h-4 rounded-full border border-dashed border-white/10 group-hover:border-emerald-400/40 transition-colors" />
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 인라인 툴팁 (마이크로 말풍선) ── */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -5, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.8, y: 5, x: "-50%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -top-3 left-1/2 z-[40] pointer-events-none"
          >
            <div
              className="relative rounded-[1.25rem] p-2 bg-slate-950/98 border backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-[140px] md:w-[240px]"
              style={{ borderColor: `${theme.color}50`, borderTop: `2px solid ${theme.color}a0` }}
            >
              <div className="flex items-center gap-1.5 mb-1.5 pb-1.5" style={{ borderBottom: `1px solid ${theme.color}25` }}>
                <span className="text-xs md:text-sm">{ingredient.icon_emoji}</span>
                <span className="text-[7.5px] md:text-[8.5px] font-[1000] uppercase tracking-widest" style={{ color: theme.color }}>
                  {t.common.analysisProtocol}
                </span>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto w-1 h-1 rounded-full"
                  style={{ background: theme.color, boxShadow: `0 0 5px ${theme.color}` }}
                />
              </div>
              <p className="text-[9.5px] md:text-[10.5px] leading-snug text-slate-200 font-bold tracking-tight">
                {desc}
              </p>

              {/* 말풍선 꼬리 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-2.5 h-2.5 rotate-45 bg-[#020617] border-r border-b"
                style={{ borderRightColor: `${theme.color}50`, borderBottomColor: `${theme.color}50` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
});

export default function IngredientCard(props: IngredientCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stop early if no ref
    if (!ref.current) return;

    // Use IntersectionObserver to delay heavy rendering until near viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Once visible, keeps it rendered to prevent re-renders
        }
      },
      { rootMargin: "600px" } // Load before coming into view
    );
    
    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, []);

  if (isVisible) {
    return <IngredientCardContent {...props} />;
  }

  // Render a placeholder that matches the final card dimensions to prevent Layout Shifts (CLS)
  return (
    <div
      ref={ref}
      className="w-full h-[180px] md:h-[220px] rounded-[1.75rem] border border-white/5 bg-white/[0.02]"
      aria-hidden="true"
    />
  );
}

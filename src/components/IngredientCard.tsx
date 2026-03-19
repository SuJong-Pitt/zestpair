"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ingredient } from "@/types/database";
import { useBasketStore } from "@/store/basketStore";
import { cn } from "@/lib/utils";
import { Check, Clock, Sparkles, Zap, Waves, Heart, ShieldCheck } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { UI_TRANSLATIONS } from "@/lib/i18n";

interface IngredientCardProps {
  ingredient: Ingredient;
  isFeatured?: boolean;
}

/* 카테고리별 컬러 테마 */
function getCategoryTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("vitamin") || n.includes("비타민")) return { color: "#f59e0b", glow: "rgba(245,158,11,0.35)", icon: <Zap size={11} /> };
  if (n.includes("omega") || n.includes("오메가")) return { color: "#06b6d4", glow: "rgba(6,182,212,0.35)", icon: <Waves size={11} /> };
  if (n.includes("collagen") || n.includes("콜라겐")) return { color: "#f43f5e", glow: "rgba(244,63,94,0.35)", icon: <Heart size={11} /> };
  return { color: "#10b981", glow: "rgba(16,185,129,0.35)", icon: <ShieldCheck size={11} /> };
}

const IngredientCard = memo(function IngredientCard({ ingredient, isFeatured = false }: IngredientCardProps) {
  const hasMounted = useHasMounted();
  const { isSelected, toggleIngredient, language } = useBasketStore();
  const selected = hasMounted ? isSelected(ingredient.id) : false;
  const [showTooltip, setShowTooltip] = useState(false);

  const t = UI_TRANSLATIONS[language];
  const name = language === "ko" ? ingredient.name : ingredient.name_en;
  const shortDesc = language === "ko" ? ingredient.short_description : (ingredient.short_description_en || ingredient.short_description);
  const desc = language === "ko" ? ingredient.description : (ingredient.description_en || ingredient.description);
  const theme = getCategoryTheme(ingredient.name);

  // 말풍선 자동 사라짐 타이머 (3초)
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleToggle = () => {
    toggleIngredient(ingredient);
    // 선택할 때마다 말풍선을 자연스럽게 보여줌
    setShowTooltip(true);
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => !selected && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="group relative w-full text-left transition-transform duration-200 active:scale-95 hover:-translate-y-1"
    >
      {/* ── 카드 본체 ── */}
      <div
        className="relative w-full rounded-[1.75rem] overflow-hidden transition-all duration-500"
        style={selected ? {
          background: "linear-gradient(145deg, #0a1a15 0%, #060e10 100%)",
          border: `1.5px solid ${theme.color}`,
          boxShadow: `0 15px 40px ${theme.glow}, inset 0 0 12px ${theme.color}15`,
        } : {
          background: isFeatured
            ? "linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)",
          border: isFeatured ? "1.5px solid rgba(16,185,129,0.2)" : "1.5px solid rgba(0,0,0,0.06)",
          boxShadow: isFeatured
            ? "0 12px 40px rgba(16,185,129,0.1)"
            : "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
        {/* ── 쉬머 효과 (Premium Glossy Feel) ── */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          className="absolute inset-0 z-10 pointer-events-none opacity-[0.4]"
          style={{
            background: "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
            backgroundSize: "200% 100%"
          }}
        />

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
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.06)",
            color: "#94a3b8"
          }}
        >
          {theme.icon}
        </div>

        {/* ── 이모지 이미지 영역 ── */}
        <div
          className="relative w-full h-28 md:h-32 flex items-center justify-center overflow-hidden"
          style={selected ? {
            background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 100%)",
          } : {
            background: isFeatured
              ? "linear-gradient(180deg, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.03) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.025) 0%, rgba(0,0,0,0.01) 100%)"
          }}
        >
          <span
            className="relative z-10 text-4xl md:text-5xl transition-transform duration-500"
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

        {/* ── 텍스트 영역 ── */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3
              className="font-black text-[14px] md:text-[15px] tracking-tight leading-tight line-clamp-1 transition-colors duration-300"
              style={selected ? { color: theme.color } : { color: "#0f172a" }}
            >
              {name}
            </h3>
            {/* 선택 상태 도트 */}
            {selected && (
              <div className="shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
              </div>
            )}
          </div>

          <p
            className="text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300"
            style={selected ? { color: "rgba(255,255,255,0.4)", fontWeight: 500 } : { color: "#94a3b8", fontWeight: 500 }}
          >
            {shortDesc}
          </p>
        </div>

        {/* ── 하단 바 ── */}
        <div
          className="flex items-center justify-between px-4 py-3 mt-1 transition-colors duration-300"
          style={selected
            ? { borderTop: `1px solid ${theme.color}20` }
            : { borderTop: "1px solid rgba(0,0,0,0.05)" }
          }
        >
          {/* 복용 시간 태그 */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
            style={selected ? {
              background: `${theme.color}18`,
              border: `1px solid ${theme.color}30`,
              color: theme.color
            } : {
              background: isFeatured ? "rgba(16,185,129,0.07)" : "rgba(0,0,0,0.04)",
              border: isFeatured ? "1px solid rgba(16,185,129,0.12)" : "1px solid rgba(0,0,0,0.06)",
              color: isFeatured ? "#10b981" : "#94a3b8"
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
                  : <div className="w-4 h-4 rounded-full border border-dashed border-slate-200 group-hover:border-emerald-300 transition-colors" />
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 개선된 인라인 툴팁 (마이크로 말풍선) ── */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -5, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.8, y: 5, x: "-50%" }}
            className="absolute -top-3 left-1/2 z-[200] pointer-events-none"
          >
            <div
              className="relative rounded-2xl p-3 md:p-4 bg-slate-950/95 border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[200px] md:w-[240px]"
              style={{ borderColor: `${theme.color}40`, borderTop: `1.5px solid ${theme.color}80` }}
            >
              <div className="flex items-center gap-2 mb-1.5 md:mb-2 pb-1.5 md:pb-2" style={{ borderBottom: `1px solid ${theme.color}20` }}>
                <span className="text-sm md:text-base">{ingredient.icon_emoji}</span>
                <span className="text-[8px] md:text-[9px] font-[1000] uppercase tracking-widest" style={{ color: theme.color }}>
                  {t.common.analysisProtocol}
                </span>
                <span className="ml-auto w-1 h-1 rounded-full animate-pulse" style={{ background: theme.color }} />
              </div>
              <p className="text-[10px] md:text-[11px] leading-relaxed text-slate-200 font-semibold tracking-tight">
                {desc}
              </p>

              {/* 말풍선 꼬리 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-[#020617] border-r border-b"
                style={{ borderRightColor: `${theme.color}40`, borderBottomColor: `${theme.color}40` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
});

export default IngredientCard;

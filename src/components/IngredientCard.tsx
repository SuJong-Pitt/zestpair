"use client";

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

export default function IngredientCard({ ingredient, isFeatured = false }: IngredientCardProps) {
  const hasMounted = useHasMounted();
  const { isSelected, toggleIngredient, language } = useBasketStore();
  const selected = hasMounted ? isSelected(ingredient.id) : false;

  const t = UI_TRANSLATIONS[language];
  const name = language === "ko" ? ingredient.name : ingredient.name_en;
  const shortDesc = language === "ko" ? ingredient.short_description : (ingredient.short_description_en || ingredient.short_description);
  const desc = language === "ko" ? ingredient.description : (ingredient.description_en || ingredient.description);
  const theme = getCategoryTheme(ingredient.name);

  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.22, ease: "easeOut" } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      onClick={() => toggleIngredient(ingredient)}
      className="group relative w-full text-left"
      style={{ perspective: "800px" }}
    >
      {/* ── 카드 본체 ── */}
      <div
        className="relative w-full rounded-[1.75rem] overflow-hidden transition-all duration-400"
        style={selected ? {
          background: "linear-gradient(145deg, #071210 0%, #0a1a15 60%, #060e10 100%)",
          border: `1.5px solid ${theme.color}55`,
          boxShadow: `0 0 0 1px ${theme.color}22, 0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${theme.glow}`,
        } : {
          background: isFeatured
            ? "linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)",
          border: isFeatured ? "1.5px solid rgba(16,185,129,0.15)" : "1.5px solid rgba(0,0,0,0.05)",
          boxShadow: isFeatured
            ? "0 8px 30px rgba(16,185,129,0.08), 0 2px 8px rgba(0,0,0,0.05)"
            : "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* ── 홀로그램 스캐너 (Selected) ── */}
        {selected && (
          <motion.div
            animate={{ x: ["-110%", "210%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/3 pointer-events-none z-10"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.color}18, transparent)`, transform: "skewX(-12deg)" }}
          />
        )}

        {/* ── 배경 글로우 오브 (Selected) ── */}
        {selected && (
          <div
            className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, filter: "blur(20px)", opacity: 0.5 }}
          />
        )}

        {/* ── 호버 글로우 (비선택) ── */}
        {!selected && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.75rem]"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(6,182,212,0.02) 100%)" }}
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
            boxShadow: `0 0 10px ${theme.glow}`
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
          {/* 이모지 배경 할로 */}
          <motion.div
            animate={selected ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-16 h-16 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${theme.color} 0%, transparent 70%)`, filter: "blur(25px)" }}
          />

          <motion.span
            className="relative z-10 text-4xl md:text-5xl"
            animate={selected ? { y: [-2, 2, -2] } : { y: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={selected ? { filter: `drop-shadow(0 0 12px ${theme.glow})` } : { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.12))" }}
          >
            {ingredient.icon_emoji}
          </motion.span>

          {/* 선택 시 파티클 */}
          {selected && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full pointer-events-none"
                  style={{ background: theme.color, boxShadow: `0 0 6px ${theme.color}` }}
                  animate={{
                    x: [0, (Math.sin(i * 90 * Math.PI / 180)) * 30],
                    y: [0, (Math.cos(i * 90 * Math.PI / 180)) * 30],
                    opacity: [0.8, 0],
                    scale: [1, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                />
              ))}
            </>
          )}

          {/* 프리미엄 광택 */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            {/* 선택 상태 펄스 닷 */}
            {selected && (
              <div className="relative shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
                <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: theme.color, opacity: 0.5 }} />
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
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, x: 8, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.8 }}
                className="flex items-center gap-1 text-[9px] font-black"
                style={{ color: theme.color }}
              >
                <Check size={10} strokeWidth={3.5} />
                {t.common.selected}
              </motion.div>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                {isFeatured
                  ? <Sparkles size={12} className="text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  : <div className="w-4 h-4 rounded-full border border-dashed border-slate-200 group-hover:border-emerald-300 transition-colors" />
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 선택 테두리 링 ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-[1.75rem] pointer-events-none"
              style={{
                border: `1.5px solid ${theme.color}`,
                boxShadow: `inset 0 0 0 1px ${theme.color}15`
              }}
            />
          )}
        </AnimatePresence>

        {/* ── 툴팁 (호버 팝업, 비선택 시) ── */}
        {!selected && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              whileHover={{ opacity: 0 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-50 hidden group-hover:block"
            />
          </AnimatePresence>
        )}
      </div>

      {/* ── 인라인 툴팁 구현 ── */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2 w-[200px] z-[200] pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
      >
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(145deg, rgba(8,12,24,0.97) 0%, rgba(10,20,18,0.97) 100%)",
            border: `1px solid ${theme.color}35`,
            backdropFilter: "blur(30px)",
            boxShadow: `0 0 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`
          }}
        >
          <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: `1px solid ${theme.color}20` }}>
            <span className="text-base">{ingredient.icon_emoji}</span>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.color }}>
              {t.common.analysisProtocol}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
            {desc}
          </p>
        </div>
        {/* 꼬리 */}
        <div
          className="w-3 h-3 mx-auto rotate-45 -mt-1.5"
          style={{
            background: "rgba(10,20,18,0.97)",
            border: `1px solid ${theme.color}30`,
            borderTop: "none",
            borderLeft: "none"
          }}
        />
      </div>
    </motion.button>
  );
}

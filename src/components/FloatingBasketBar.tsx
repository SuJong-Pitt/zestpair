"use client";

import { useBasketStore, MAX_BASKET_SIZE } from "@/store/basketStore";
import { cn } from "@/lib/utils";
import { FlaskConical, X, Sparkles, ShoppingBasket, ChevronUp, Trash2, Zap, Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import type { Ingredient } from "@/types/database";

interface FloatingBasketBarProps {
  onAnalyze: () => void;
  allIngredients?: Ingredient[];
  isHeroSearchVisible?: boolean;
  isIngredientsVisible?: boolean;
}


export default function FloatingBasketBar({ 
  onAnalyze, 
  allIngredients = [], 
  isHeroSearchVisible = false,
  isIngredientsVisible = false
}: FloatingBasketBarProps) {

  const { selectedIngredients, addIngredient, removeIngredient, clearBasket, isAnalyzing, language, isSelected, isBasketExpanded, setBasketExpanded, hasResult } = useBasketStore();
  const [isVisible, setIsVisible] = useState(false);
  const isExpanded = isBasketExpanded;
  const setIsExpanded = setBasketExpanded;
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const t = UI_TRANSLATIONS[language];
  const count = selectedIngredients.length;
  const canAnalyze = count >= 2;

  useEffect(() => {
    // 분석 결과가 있더라도 성분이 선택되어 있고, 
    // 히어로 검색바가 보이지 않으며,
    // (결과가 없거나 또는 결과가 있더라도 성분 리스트 영역에 있을 때) 바를 보여줌
    const shouldShow = (count > 0 || isSearchActive) && 
                       !isAnalyzing && 
                       !isHeroSearchVisible && 
                       (!hasResult || isIngredientsVisible);
                       
    setIsVisible(shouldShow);
    
    if ((count === 0 || isHeroSearchVisible || (hasResult && !isIngredientsVisible)) && !isSearchActive) {
      setIsExpanded(false);
    }
  }, [count, isSearchActive, hasResult, isAnalyzing, isHeroSearchVisible, isIngredientsVisible]);


  const filteredSearch = allIngredients.filter(ing => {
    if (!searchQuery) return false;
    const name = language === 'ko' ? ing.name : ing.name_en;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed left-0 right-0 z-50 pointer-events-none flex justify-center px-4",
            hasResult ? "top-8 md:top-12" : "bottom-0"
          )}
          style={!hasResult ? { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' } : {}}
        >

          {/* 배경 블러 오버레이 */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[-1] pointer-events-auto"
                onClick={() => setIsExpanded(false)}
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-2xl px-3 relative pointer-events-auto overflow-hidden rounded-[2rem]"
            style={{
              background: "linear-gradient(145deg, rgba(8,12,24,0.95) 0%, rgba(10,20,18,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(40px)",
              boxShadow: "0 -4px 60px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
            }}
          >
            {/* 바텀시트 핸들 (모바일 전용 시각적 요소) */}
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />

            {/* 배경 오브 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-25"
                style={{ background: "radial-gradient(circle, rgba(16,185,129,0.7) 0%, transparent 70%)", filter: "blur(50px)" }}
              />
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.7) 0%, transparent 70%)", filter: "blur(40px)" }}
              />
              {/* 스캔라인 */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)" }}
              />
            </div>

            {/* 확장된 영양제 목록 */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pt-6 pb-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span
                          className="text-[10px] font-black uppercase tracking-[0.2em]"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          {t.basket.selectedList}
                        </span>
                      </div>
                      <button
                        onClick={clearBasket}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: "rgba(239,68,68,0.12)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          color: "rgba(252,165,165,0.9)"
                        }}
                      >
                        <Trash2 size={9} />
                        {t.basket.clearAll}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto scrollbar-hide">
                      {isSearchActive && searchQuery ? (
                        // 검색 결과 모드
                        filteredSearch.length > 0 ? (
                          filteredSearch.map((ingredient, i) => {
                            const active = isSelected(ingredient.id);
                            return (
                              <motion.button
                                key={ingredient.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => active ? removeIngredient(ingredient.id) : addIngredient(ingredient)}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-black transition-all",
                                  active
                                    ? "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
                                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                                )}
                              >
                                <span className="text-xl">{ingredient.icon_emoji}</span>
                                <span>{language === 'ko' ? ingredient.name : ingredient.name_en}</span>
                                {active && <Zap size={10} fill="white" />}
                              </motion.button>
                            );
                          })
                        ) : (
                          <div className="w-full py-10 text-center text-white/30 font-bold italic">
                            {language === 'ko' ? "검색 결과가 없습니다." : "No results found."}
                          </div>
                        )
                      ) : (
                        // 기본 선택 목록 모드
                        selectedIngredients.map((ingredient, i) => (
                          <motion.div
                            layout
                            key={ingredient.id}
                            initial={{ scale: 0.7, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[13px] font-bold transition-all hover:scale-[1.03]"
                            style={{
                              background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.9)"
                            }}
                          >
                            <span className="text-lg group-hover:scale-110 transition-transform">
                              {ingredient.icon_emoji}
                            </span>
                            <span className="tracking-tight">
                              {language === 'ko' ? ingredient.name : ingredient.name_en}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeIngredient(ingredient.id); }}
                              className="ml-1 w-5 h-5 flex items-center justify-center rounded-full transition-all"
                              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.6)";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)";
                              }}
                            >
                              <X size={9} strokeWidth={3} />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 메인 컨트롤 바 */}
            <div className="flex items-center gap-3 p-3 md:p-4 relative z-10">

              {/* 검색 & 정보 토글 가능 영역 */}
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchActive(!isSearchActive);
                    if (!isSearchActive) {
                      setIsExpanded(true);
                      setTimeout(() => document.getElementById('bar-search')?.focus(), 100);
                    }
                  }}
                  className={cn(
                    "h-11 md:h-12 rounded-xl flex items-center justify-center transition-all shrink-0 px-4 relative overflow-hidden",
                    isSearchActive
                      ? "w-11 md:w-12 text-white"
                      : "w-auto bg-white/[0.03] border border-white/10 backdrop-blur-xl text-white/40 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/20"
                  )}
                  style={isSearchActive ? {
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 0 20px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                  } : {}}
                >
                  {isSearchActive && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-white/10 pointer-events-none"
                    />
                  )}
                  {isSearchActive ? <X size={20} /> : (
                    <div className="flex items-center gap-2">
                      <SearchIcon size={20} className="transition-transform group-hover:scale-110" />
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">{language === 'ko' ? '검색' : 'SEARCH'}</span>
                    </div>
                  )}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    {isSearchActive ? (
                      <motion.div
                        key="search"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="w-full"
                      >
                        <input
                          id="bar-search"
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={language === 'ko' ? "성분 추가..." : "Add ingredient..."}
                          className="w-full bg-transparent border-none focus:ring-0 text-white p-0 font-bold placeholder:text-white/20"
                        />
                      </motion.div>
                    ) : (
                      <motion.button
                        key="info"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        whileHover={{ x: 2 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex flex-col text-left w-full min-w-0 group/info cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="font-black text-sm md:text-base tracking-tight flex items-center gap-1.5 truncate transition-colors group-hover/info:text-emerald-400"
                            style={{ color: "rgba(255,255,255,0.95)" }}
                          >
                            {t.basket.itemsSelected.replace('{count}', count.toString())}
                          </span>
                          <motion.div
                            animate={{
                              rotate: isExpanded ? 180 : 0,
                              y: isExpanded ? 0 : [0, -3, 0]
                            }}
                            transition={isExpanded ? { duration: 0.3 } : { duration: 2, repeat: Infinity }}
                            className="text-emerald-500/50 group-hover/info:text-emerald-400"
                          >
                            <ChevronUp size={14} strokeWidth={3} />
                          </motion.div>
                        </div>
                        <motion.span
                          initial={false}
                          animate={canAnalyze ? {
                            y: [0, -1.5, 0],
                            opacity: [0.7, 1, 0.7],
                            scale: [1, 1.05, 1],
                            color: ["rgba(52,211,153,0.8)", "rgba(110,231,183,1)", "rgba(52,211,153,0.8)"]
                          } : { y: 0, opacity: 0.6, scale: 1, color: "rgba(255,255,255,0.35)" }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="text-[10px] md:text-xs font-bold truncate group-hover/info:opacity-100 flex items-center gap-1.5"
                        >
                          {count < 2 ? t.basket.notEnough : (
                            <>
                              {t.basket.ready}
                              <motion.span
                                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <Sparkles size={10} className="text-amber-300" />
                              </motion.span>
                            </>
                          )}
                        </motion.span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 분석 버튼 (모바일 검색 시에는 숨김 처리하여 검색창 공간 확보) */}
              <AnimatePresence>
                {!(isMobile && isSearchActive) && (
                  <motion.button
                    initial={isMobile ? { opacity: 0, x: 20 } : undefined}
                    animate={{ opacity: 1, x: 0 }}
                    exit={isMobile ? { opacity: 0, x: 20 } : undefined}
                    whileHover={canAnalyze ? { scale: 1.04 } : {}}
                    whileTap={canAnalyze ? { scale: 0.95 } : {}}
                    onClick={() => {
                      setIsExpanded(false);
                      setIsSearchActive(false);
                      onAnalyze();
                    }}
                    disabled={!canAnalyze || isAnalyzing}
                    className="relative shrink-0 overflow-hidden rounded-full font-[900] text-xs md:text-sm px-6 md:px-9 h-11 md:h-12 transition-all duration-400"
                    style={canAnalyze ? {
                      background: "linear-gradient(135deg, #10b981 0%, #0891b2 60%, #7c3aed 100%)",
                      color: "white",
                      boxShadow: isAnalyzing ? "none" : "0 6px 30px rgba(16,185,129,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                      letterSpacing: "0.07em",
                    } : {
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      letterSpacing: "0.07em"
                    }}
                  >
                    {/* 호버 시 스캐너 효과 */}
                    {canAnalyze && (
                      <motion.span
                        animate={{ x: ["-120%", "220%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                        className="absolute inset-y-0 w-1/3 pointer-events-none"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", transform: "skewX(-12deg)" }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {isAnalyzing ? (
                        <>
                          <FlaskConical size={15} className="animate-spin" />
                          <span className="hidden sm:inline uppercase">{t.basket.analyzing}</span>
                          <span className="sm:hidden">···</span>
                        </>
                      ) : (
                        <>
                          <Zap size={15} className={canAnalyze ? "text-yellow-200" : ""} />
                          <span className="uppercase">{language === 'ko' ? '분석' : 'ANALYZE'}</span>
                        </>
                      )}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* 하단 프로그레스 바 */}
            <div className="h-1 w-full overflow-hidden relative z-10" style={{ background: "rgba(255,255,255,0.04)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / MAX_BASKET_SIZE) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="h-full"
                style={{
                  background: canAnalyze
                    ? "linear-gradient(90deg, #10b981, #06b6d4, #7c3aed)"
                    : "linear-gradient(90deg, #f59e0b, #f97316)",
                  boxShadow: canAnalyze
                    ? "0 0 10px rgba(16,185,129,0.6)"
                    : "0 0 10px rgba(245,158,11,0.6)"
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

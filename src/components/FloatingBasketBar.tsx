"use client";

import { useBasketStore, MAX_BASKET_SIZE } from "@/store/basketStore";
import { cn } from "@/lib/utils";
import { FlaskConical, X, Sparkles, ChevronUp, Trash2, Zap, Search as SearchIcon, Check } from "lucide-react";
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
  isHeroDropdownOpen?: boolean;
}

export default function FloatingBasketBar({
  onAnalyze,
  allIngredients = [],
  isHeroSearchVisible = false,
  isIngredientsVisible = false,
  isHeroDropdownOpen = false,
}: FloatingBasketBarProps) {
  const {
    selectedIngredients, addIngredient, removeIngredient, clearBasket,
    isAnalyzing, language, isSelected, isBasketExpanded, setBasketExpanded, hasResult,
  } = useBasketStore();

  const [isVisible, setIsVisible] = useState(false);
  const isExpanded = isBasketExpanded;
  const setIsExpanded = setBasketExpanded;
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['ko'];
  const count = selectedIngredients.length;
  const canAnalyze = count >= 2;

  useEffect(() => {
    const shouldShow =
      (count > 0 || isSearchActive) &&
      !isAnalyzing &&
      !isHeroSearchVisible &&
      !isHeroDropdownOpen &&
      isIngredientsVisible && // 스크롤을 내려 카드가 나올 때만 표시
      !hasResult; // 결과 페이지에서는 숨김 (필요시 ingredients 섹션 가시성으로 조절)
    setIsVisible(shouldShow);
    if ((count === 0 || isHeroSearchVisible || isHeroDropdownOpen || (hasResult && !isIngredientsVisible)) && !isSearchActive) {
      setIsExpanded(false);
    }
  }, [count, isSearchActive, hasResult, isAnalyzing, isHeroSearchVisible, isIngredientsVisible, isHeroDropdownOpen]);

  const filteredSearch = allIngredients.filter((ing) => {
    if (!searchQuery) return false;
    const name = language === "ko" ? ing.name : language === "ja" && ing.name_ja ? ing.name_ja : language === "zh" && ing.name_zh ? ing.name_zh : ing.name_en || ing.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed left-0 right-0 z-50 pointer-events-none flex justify-center px-4",
            "bottom-0"
          )}
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
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

          {/* ✦ 메인 바 컨테이너 */}
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg relative pointer-events-auto flex flex-col-reverse"
          >
            {/* 무지개 외곽 글로우 (canAnalyze) */}
            {canAnalyze && (
              <motion.div
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-[-2px] rounded-[2.2rem] pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, #10b981, #06b6d4, #7c3aed, #e879f9, #10b981)",
                  filter: "blur(8px)",
                }}
              />
            )}

            {/* 내부 카드 */}
            <div
              className="relative overflow-hidden rounded-[2rem]"
              style={{
                background: "linear-gradient(160deg, rgba(8,14,28,0.97) 0%, rgba(6,18,16,0.97) 100%)",
                border: canAnalyze
                  ? "1px solid rgba(16,185,129,0.35)"
                  : "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(48px)",
                boxShadow: canAnalyze
                  ? "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
                  : "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* 배경 오브 */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ x: [0, 15, 0], y: [0, -8, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -left-8 w-40 h-40 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)", filter: "blur(30px)" }}
                />
                <motion.div
                  animate={{ x: [0, -10, 0], y: [0, 10, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-4 -right-4 w-28 h-28 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)", filter: "blur(25px)" }}
                />
                {/* 상단 하이라이트 라인 (하단에 위치할 때 상단에 배치) */}
                <div
                  className="absolute top-0 left-8 right-8 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
                />
              </div>

              {/* 확장 패널: 선택 목록 */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden order-2"
                  >
                    <div
                      className="px-5 pt-5 pb-4"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                          />
                          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                            {t.basket.selectedList}
                          </span>
                        </div>
                        <button
                          onClick={clearBasket}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "rgba(252,165,165,0.85)",
                          }}
                        >
                          <Trash2 size={9} />
                          {t.basket.clearAll}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto scrollbar-hide">
                        {isSearchActive && searchQuery ? (
                          filteredSearch.length > 0 ? (
                            filteredSearch.map((ing, i) => {
                              const ingName = language === "ko" ? ing.name : language === "ja" && ing.name_ja ? ing.name_ja : language === "zh" && ing.name_zh ? ing.name_zh : ing.name_en || ing.name;
                              const sel = isSelected(ing.id);
                              return (
                                <motion.button
                                  key={ing.id}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: i * 0.03 }}
                                  onClick={() => (sel ? removeIngredient(ing.id) : addIngredient(ing))}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                                  style={
                                    sel
                                      ? { background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7" }
                                      : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }
                                  }
                                >
                                  {sel && <Check size={10} />}
                                  <span className="text-base">{ing.icon_emoji}</span>
                                  {ingName}
                                </motion.button>
                              );
                            })
                          ) : (
                            <div className="w-full py-6 text-center text-white/30 text-xs font-bold">
                              {language === "ko" ? "검색 결과가 없습니다." : language === "ja" ? "検索結果がありません。" : language === "zh" ? "没有找到结果。" : "No results found."}
                            </div>
                          )
                        ) : (
                          selectedIngredients.map((ing, i) => {
                            const ingName = language === "ko" ? ing.name : language === "ja" && ing.name_ja ? ing.name_ja : language === "zh" && ing.name_zh ? ing.name_zh : ing.name_en || ing.name;
                            return (
                              <motion.div
                                key={ing.id}
                                layout
                                initial={{ scale: 0.8, opacity: 0, y: 8 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap"
                                style={{
                                  background: "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.15) 100%)",
                                  border: "1px solid rgba(52,211,153,0.3)",
                                  color: "#a7f3d0",
                                }}
                              >
                                <span className="text-base">{ing.icon_emoji}</span>
                                <span>{ingName}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeIngredient(ing.id); }}
                                  className="w-4 h-4 rounded-full flex items-center justify-center transition-all"
                                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.3)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(252,165,165,0.9)";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)";
                                  }}
                                >
                                  <X size={9} strokeWidth={3} />
                                </button>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ✦ 메인 컨트롤 행 */}
              <div className="flex items-center gap-2 p-2.5 relative z-10">

                {/* 검색 아이콘 버튼 */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchActive(!isSearchActive);
                    if (!isSearchActive) {
                      setIsExpanded(true);
                      setTimeout(() => document.getElementById("bar-search")?.focus(), 100);
                    }
                  }}
                  className="shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-[1.1rem] flex items-center justify-center transition-all"
                  style={
                    isSearchActive
                      ? { background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 18px rgba(16,185,129,0.5)" }
                      : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {isSearchActive ? <X size={16} className="text-white" /> : <SearchIcon size={16} className="text-white/50" />}
                </motion.button>

                {/* 중앙 정보 / 검색 입력 */}
                <div className="flex-1 min-w-0 px-1">
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
                          placeholder={language === "ko" ? "성분 검색..." : language === "ja" ? "成分検索..." : language === "zh" ? "搜索成分..." : "Search..."}
                          className="w-full bg-transparent border-none focus:ring-0 text-[13px] md:text-sm text-white font-bold p-0 placeholder:text-white/25"
                        />
                      </motion.div>
                    ) : (
                      <motion.button
                        key="info"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2.5 w-full group/info cursor-pointer select-none"
                      >
                        {/* 카운터 뱃지 */}
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2.2, repeat: Infinity }}
                          className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-[900] text-xs md:text-sm"
                          style={{
                            background: "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(6,182,212,0.18))",
                            border: "1.5px solid rgba(52,211,153,0.45)",
                            color: "#6ee7b7",
                            boxShadow: "0 0 14px rgba(52,211,153,0.18)",
                          }}
                        >
                          {count}
                        </motion.div>

                        {/* 텍스트 */}
                        <div className="flex flex-col">
                          <span className="text-xs font-[800] leading-tight text-white/90 whitespace-nowrap">
                            {language === "ko" ? `${count}개 선택됨` : language === "ja" ? `${count}個選択中` : language === "zh" ? `已选 ${count} 个` : `${count} selected`}
                          </span>
                          <motion.span
                            initial={{ x: 0 }}
                            animate={
                              showAlert && count < 2
                                ? { x: [-4, 4, -4, 4, 0], color: ["#f87171", "#ef4444", "#f87171"] }
                                : canAnalyze
                                  ? { opacity: [0.7, 1, 0.7], color: ["rgba(52,211,153,0.8)", "rgba(110,231,183,1)", "rgba(52,211,153,0.8)"] }
                                  : { opacity: 0.4, color: "rgba(255,255,255,0.3)" }
                            }
                            transition={showAlert && count < 2 ? { duration: 0.4 } : { duration: 2.5, repeat: Infinity }}
                            className="text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
                          >
                            {count < 2 ? (
                              showAlert ? (
                                <span>{t.common.notEnoughIngredients}</span>
                              ) : (
                                language === "ko" ? "1개 더 추가하세요" : language === "ja" ? "もう1つ追加" : language === "zh" ? "再加1个" : "Add 1 more"
                              )
                            ) : (
                              <>
                                {language === "ko" ? "분석 준비 완료!" : language === "ja" ? "分析準備完了！" : language === "zh" ? "准备好分析了！" : "Ready to analyze!"}
                                <motion.span
                                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <Sparkles size={9} className="text-amber-300" />
                                </motion.span>
                              </>
                            )}
                          </motion.span>
                        </div>

                        {/* 화살표 (하단 고정이므로 회전 방향 조정) */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0, y: isExpanded ? 0 : [0, -3, 0] }}
                          transition={isExpanded ? { duration: 0.3 } : { duration: 2, repeat: Infinity }}
                          className="ml-auto shrink-0 text-white/25 group-hover/info:text-emerald-400 transition-colors"
                        >
                          <ChevronUp size={15} strokeWidth={2.5} />
                        </motion.div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* 구분선 */}
                <div
                  className="shrink-0 w-px h-7 self-center"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />

                {/* ✦ 분석 버튼 */}
                <AnimatePresence>
                  {!(isMobile && isSearchActive) && (
                    <motion.button
                      initial={isMobile ? { opacity: 0, x: 20 } : undefined}
                      animate={{ opacity: 1, x: 0 }}
                      exit={isMobile ? { opacity: 0, x: 20 } : undefined}
                      whileHover={canAnalyze ? { scale: 1.05 } : {}}
                      whileTap={canAnalyze ? { scale: 0.93 } : {}}
                      onClick={() => {
                        if (!canAnalyze) {
                          setShowAlert(true);
                          setTimeout(() => setShowAlert(false), 2000);
                          return;
                        }
                        setIsExpanded(false);
                        setIsSearchActive(false);
                        onAnalyze();
                      }}
                      disabled={!canAnalyze || isAnalyzing}
                      className="relative shrink-0 overflow-hidden rounded-[1.1rem] font-[900] text-xs tracking-wider h-11 px-5 transition-all duration-300"
                      style={
                        canAnalyze
                          ? {
                            background: "linear-gradient(135deg, #10b981 0%, #0891b2 55%, #7c3aed 100%)",
                            color: "white",
                            boxShadow: isAnalyzing ? "none" : "0 4px 24px rgba(16,185,129,0.45), 0 2px 6px rgba(0,0,0,0.35)",
                            letterSpacing: "0.08em",
                          }
                          : {
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.18)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            letterSpacing: "0.08em",
                          }
                      }
                    >
                      {/* 스캐너 시머 */}
                      {canAnalyze && (
                        <motion.span
                          animate={{ x: ["-130%", "230%"] }}
                          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" }}
                          className="absolute inset-y-0 w-1/3 pointer-events-none"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)", transform: "skewX(-15deg)" }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1 md:gap-1.5">
                        {isAnalyzing ? (
                          <>
                            <FlaskConical size={12} className="animate-spin" />
                            <span className="hidden sm:inline uppercase">{t.basket.analyzing}</span>
                            <span className="sm:hidden">···</span>
                          </>
                        ) : (
                          <>
                            <Zap size={12} className={canAnalyze ? "text-yellow-200" : ""} />
                            <span className="uppercase">{language === "ko" ? "분석" : language === "ja" ? "分析" : language === "zh" ? "分析" : "SCAN"}</span>
                          </>
                        )}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* 하단 프로그레스 바 */}
              <div className="h-0.5 w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / MAX_BASKET_SIZE) * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="h-full"
                  style={{
                    background: canAnalyze
                      ? "linear-gradient(90deg, #10b981, #06b6d4, #7c3aed)"
                      : "linear-gradient(90deg, #f59e0b, #f97316)",
                    boxShadow: canAnalyze ? "0 0 8px rgba(16,185,129,0.6)" : "0 0 8px rgba(245,158,11,0.5)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

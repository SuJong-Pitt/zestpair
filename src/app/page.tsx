"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Pill, ChevronDown, ChevronRight, Info, Sparkles, RefreshCcw, Languages, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import IngredientCard from "@/components/IngredientCard";
import FloatingBasketBar from "@/components/FloatingBasketBar";
import AnalyzingAnimation from "@/components/AnalyzingAnimation";
import AnalysisResults from "@/components/AnalysisResults";
import { useBasketStore } from "@/store/basketStore";
import { supabase } from "@/lib/supabase";
import type { AnalysisResult, Ingredient, InteractionResult } from "@/types/database";
import { cn } from "@/lib/utils";
import FloatingAssistant from "@/components/FloatingAssistant";
import ScrollToTop from "@/components/ScrollToTop";
import VisualDecorations from "@/components/VisualDecorations";
import { motion, AnimatePresence } from "framer-motion";
import { UI_TRANSLATIONS, CATEGORIES_TRANSLATIONS } from "@/lib/i18n";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// 헬퍼 컴포넌트: 가로 스크롤 컨테이너 (관성 드래그 지원)
function HorizontalScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        // 드레그 여유 공간 32px 추가
        setDragConstraints({ left: Math.min(0, -(contentWidth - containerWidth + 32)), right: 0 });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    // 이미지나 내용 로드가 늦어질 수 있으므로 추가 체크
    const timer = setTimeout(updateConstraints, 500);

    return () => {
      window.removeEventListener('resize', updateConstraints);
      clearTimeout(timer);
    };
  }, [children]);

  return (
    <div ref={containerRef} className="relative group/hscroll w-full overflow-hidden">
      {/* 페이드 효과 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/hscroll:opacity-100 transition-opacity" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/hscroll:opacity-100 transition-opacity" />

      <motion.div
        ref={contentRef}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.05}
        dragTransition={{ power: 0.1, timeConstant: 200 }}
        className={cn("flex cursor-grab active:cursor-grabbing", className)}
        style={{ width: "max-content" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const resultRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [dbIngredients, setDbIngredients] = useState<Ingredient[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoadingList(true);
      const { data } = await supabase
        .from("ingredients")
        .select("*")
        .order("sort_order", { ascending: true });

      if (data) setDbIngredients(data);
      setIsLoadingList(false);
    };
    fetchIngredients();
  }, []);

  const { selectedIngredients, isAnalyzing, hasResult, setAnalyzing, setHasResult, clearBasket, language, setLanguage } =
    useBasketStore();

  const t = UI_TRANSLATIONS[language];

  const filteredIngredients = dbIngredients.filter((ing) => {
    const name = language === "ko" ? ing.name : ing.name_en;
    const desc = language === "ko" ? ing.short_description : (ing.short_description_en || ing.short_description);

    const matchesSearch =
      searchQuery === "" ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || ing.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularIngredients = dbIngredients.filter((i) => i.is_popular);

  const handleAnalyze = async () => {
    if (selectedIngredients.length < 2) return;

    setAnalyzing(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    const ingredientIds = selectedIngredients.map((i) => i.id);
    const { data: dbInteractions } = await supabase
      .from("interactions")
      .select("*")
      .in("ingredient_a_id", ingredientIds)
      .in("ingredient_b_id", ingredientIds);

    const findInteraction = (idA: string, idB: string) => {
      const dbInts = (dbInteractions as any[]) || [];
      return dbInts.find(i =>
        (i.ingredient_a_id === idA && i.ingredient_b_id === idB) ||
        (i.ingredient_a_id === idB && i.ingredient_b_id === idA)
      ) ?? null;
    };

    const synergies: InteractionResult[] = [];
    const cautions: InteractionResult[] = [];
    const conflicts: InteractionResult[] = [];

    for (let i = 0; i < selectedIngredients.length; i++) {
      for (let j = i + 1; j < selectedIngredients.length; j++) {
        const ing1 = selectedIngredients[i];
        const ing2 = selectedIngredients[j];
        const interaction = findInteraction(ing1.id, ing2.id) as any;
        const res: InteractionResult = { pair: [ing1, ing2], interaction };
        if (!interaction) continue;
        if (interaction.type === "SYNERGY") synergies.push(res);
        else if (interaction.type === "CAUTION") cautions.push(res);
        else if (interaction.type === "CONFLICT") conflicts.push(res);
      }
    }

    const synergyWeight = synergies.length * 15;
    const cautionPenalty = cautions.length * 5;
    const conflictPenalty = conflicts.length * 25;
    const score = Math.max(10, Math.min(100, 70 + synergyWeight - cautionPenalty - conflictPenalty));

    let summary = "";
    if (language === "ko") {
      if (conflicts.length > 0) summary = `⚠️ ${conflicts.length}가지 충돌 조합이 발견되었습니다...`;
      else if (synergies.length > 0) summary = `✅ ${synergies.length}가지 시너지 조합이 발견되었습니다!`;
      else if (cautions.length > 0) summary = `🔶 ${cautions.length}가지 주의 조합이 발견되었습니다...`;
      else summary = "중립적인 조합입니다.";
    } else {
      if (conflicts.length > 0) summary = `⚠️ ${conflicts.length} conflicts detected...`;
      else if (synergies.length > 0) summary = `✅ ${synergies.length} synergies detected!`;
      else if (cautions.length > 0) summary = `🔶 ${cautions.length} cautions detected...`;
      else summary = "Neutral combination.";
    }

    setAnalysisResult({
      ingredients: selectedIngredients,
      synergies, cautions, conflicts, score, summary,
      analyzed_at: new Date().toISOString()
    });
  };

  const handleAnimationComplete = () => {
    setAnalyzing(false);
    setHasResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <section
        className="relative overflow-hidden pb-24 pt-14 md:pt-12 md:pb-32"
        style={{
          background: "radial-gradient(circle at 50% 0%, #0d1a15 0%, #080c14 50%, #030712 100%)"
        }}
      >
        {/* 고도화된 배경 장식 */}
        {!isMobile && <VisualDecorations />}

        <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-50">
          <button
            onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-[1000] text-[10px] sm:text-xs transition-all hover:bg-white/30 active:scale-95 shadow-lg group"
          >
            <Languages size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="tracking-widest uppercase">{language === "ko" ? "ENGLISH" : "한국어"}</span>
          </button>
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center">

          {/* === 로고 배지 === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full relative group cursor-default"
          >
            {/* 뒤 배경 글로우 */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                <Pill size={16} className="text-white animate-bounce-slow" />
              </div>
              <span className="text-white font-[1000] text-sm tracking-[0.2em] uppercase">ZestPair</span>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <span
                className="text-[9px] font-black uppercase tracking-widest text-[#6ee7b7] flex items-center gap-1.5"
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"
                />
                AI Core v2.5
              </span>
            </div>
          </motion.div>

          {/* === 메인 헤드라인 === */}
          <h1 className="mb-6 tracking-tight">
            {/* 라인 1: 작은 선행 텍스트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base md:text-2xl font-bold mb-1 md:mb-2"
              style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}
            >
              {language === 'ko' ? '복잡한 영양제 조합,' : 'Complex supplements,'}
            </motion.div>

            {/* 라인 2: 핵심 임팩트 문구 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative inline-block"
            >
              {/* 뒤 글로우 */}
              <span
                aria-hidden
                className="absolute -inset-3 rounded-[2.5rem] opacity-50 blur-3xl pointer-events-none"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #0891b2 50%, #7c3aed 100%)" }}
              />
              {/* 홀로그램 박스 */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left" }}
                className="absolute inset-0 rounded-[2rem] pointer-events-none"
              >
                <span
                  className="absolute inset-0 rounded-[2rem]"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(8,145,178,0.1) 50%, rgba(124,58,237,0.12) 100%)",
                    border: "1.5px solid rgba(16,185,129,0.4)",
                    boxShadow: "0 0 50px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                />
                {/* 스캐너 */}
                <motion.span
                  animate={{ x: ["-110%", "210%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 w-1/3 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", transform: "skewX(-12deg)" }}
                />
              </motion.span>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="relative z-10 block text-[2.2rem] md:text-6xl lg:text-7xl font-[1000] px-6 md:px-12 py-3 md:py-5 leading-none"
                style={{
                  color: "#ffffff",
                  textShadow: "0 0 30px rgba(52,211,153,0.3)",
                  letterSpacing: "-0.04em",
                }}
              >
                {t.hero.title2}
              </motion.span>

              {/* 코너 브래킷 */}
              {[["top-1.5 left-2.5", "border-t-2 border-l-2"], ["top-1.5 right-2.5", "border-t-2 border-r-2"], ["bottom-1.5 left-2.5", "border-b-2 border-l-2"], ["bottom-1.5 right-2.5", "border-b-2 border-r-2"]].map(([pos, border], i) => (
                <span key={i} className={`absolute ${pos} w-4 h-4 ${border} border-emerald-400/60 hidden md:block`} style={{ borderRadius: "3px" }} />
              ))}
              {/* 스파클 */}
              <motion.span
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 0.6], rotate: [-10, 10, -10] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: 1.2 }}
                className="absolute -top-6 -right-6 hidden md:block"
              >
                <Sparkles size={26} className="text-amber-300" />
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 2.5 }}
                className="absolute -bottom-5 -left-4 hidden md:block"
              >
                <Sparkles size={18} className="text-cyan-300" />
              </motion.span>
            </motion.div>
          </h1>

          {/* === 서브타이틀 === */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="text-sm md:text-lg mb-5 leading-relaxed max-w-md mx-auto px-2"
            style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}
          >
            {t.hero.subtitle1}{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #6ee7b7, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800
              }}
            >{t.hero.subtitle2}</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{t.hero.subtitle3}</span>
          </motion.p>

          {/* === 소셜 프루프 배지 행 === */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-7"
          >
            {[
              { icon: "⚡", text: language === 'ko' ? '0.5초 분석' : '0.5s Analysis', color: "rgba(251,191,36,0.9)" },
              { icon: "🔬", text: language === 'ko' ? 'AI 성분 매칭' : 'AI Matching', color: "rgba(52,211,153,0.9)" },
              { icon: "🛡️", text: language === 'ko' ? '충돌 감지' : 'Conflict Alert', color: "rgba(239,68,68,0.9)" },
              { icon: "✨", text: language === 'ko' ? '시너지 발견' : 'Synergy Finder', color: "rgba(167,139,250,0.9)" },
              { icon: "💚", text: language === 'ko' ? '무료 서비스' : 'Free Forever', color: "rgba(52,211,153,0.9)" },
            ].map((badge, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.07 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  color: badge.color
                }}
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </motion.span>
            ))}
          </motion.div>

          {/* === 검색 바 === */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-2xl mx-auto group"
          >
            {/* 글로우 */}
            <div
              className="absolute -inset-3 rounded-[4rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 blur-2xl"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.4), rgba(6,182,212,0.25), rgba(124,58,237,0.2))" }}
            />
            <div
              className="absolute -inset-1 rounded-[4rem] opacity-30 blur-xl"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.15))" }}
            />

            <div
              className="relative flex items-center rounded-[4rem] p-1.5 md:p-2.5 transition-all duration-500 group-focus-within:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(40px)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
              }}
            >
              <div className="pl-4 md:pl-6 text-emerald-400">
                <Search size={22} className="md:size-6" />
              </div>
              <Input
                ref={searchRef}
                type="text"
                placeholder={t.hero.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white placeholder:text-white/25 focus-visible:ring-0 text-sm md:text-xl h-11 md:h-14 flex-1 font-bold px-3 md:px-5 tracking-tight"
              />
              <div className="flex items-center gap-2 pr-1.5 md:pr-2">
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-2.5 text-white/30 hover:text-white/70 transition-colors">
                    <RefreshCcw size={16} />
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-3.5 rounded-full font-[900] text-xs md:text-sm transition-all active:scale-95 whitespace-nowrap group/btn"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #0891b2 60%, #7c3aed 100%)",
                    color: "white",
                    boxShadow: "0 8px 32px rgba(16,185,129,0.45), 0 2px 8px rgba(0,0,0,0.3)",
                    letterSpacing: "0.08em"
                  }}
                >
                  <span className="uppercase">{language === 'ko' ? '분석하기' : 'ANALYZE'}</span>
                  <ChevronRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* 인기 태그 */}
            <div className="mt-5 flex items-center justify-center gap-3" style={{ opacity: 0.45 }}>
              <span className="text-[9px] text-white font-black uppercase tracking-[0.25em]">
                {language === 'ko' ? '인기' : 'POPULAR'}:
              </span>
              <div className="flex gap-2.5">
                {['Vitamin C', 'Zinc', 'Biotin', 'Omega-3'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-[10px] font-bold transition-all hover:opacity-100"
                    style={{ color: "#6ee7b7" }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 하단 스크림 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-20"
          style={{
            background: "linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.9) 25%, rgba(248,250,252,0.5) 55%, rgba(248,250,252,0.15) 80%, transparent 100%)"
          }}
        />
      </section>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="relative mb-10">
          {/* 섹션 라벨 */}
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #10b981, #06b6d4)" }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#94a3b8" }}>
                {t.common.categoryTitle}
              </span>
            </div>
          </div>

          <HorizontalScroll className="gap-2 pt-1 pb-4">
            {Object.entries(CATEGORIES_TRANSLATIONS).map(([key, data]) => {
              const isActive = selectedCategory === key;
              return (
                <motion.button
                  key={key}
                  layout
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedCategory(key)}
                  className="relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-2xl text-[12px] font-black transition-all duration-300"
                  style={isActive ? {
                    background: "linear-gradient(135deg, #0a1a15 0%, #071210 100%)",
                    border: "1.5px solid rgba(16,185,129,0.4)",
                    color: "#34d399",
                    boxShadow: "0 0 20px rgba(16,185,129,0.2), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)"
                  } : {
                    background: "rgba(255,255,255,0.8)",
                    border: "1.5px solid rgba(0,0,0,0.05)",
                    color: "#64748b",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    backdropFilter: "blur(12px)"
                  }}
                >
                  {/* 활성 배경 글로우 */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryGlow"
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)"
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 text-base leading-none">{data.emoji}</span>
                  <span className="relative z-10 tracking-tight">{data[language]}</span>
                  {/* 활성 하단 닷 */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </HorizontalScroll>
        </div>

        {searchQuery === "" && selectedCategory === "all" && (
          <div
            className="mb-16 -mx-4 px-5 py-8 rounded-[2rem]"
            style={{
              background: "linear-gradient(160deg, rgba(240,253,250,0.8) 0%, rgba(255,255,255,0.95) 40%, rgba(240,249,255,0.6) 100%)",
              border: "1px solid rgba(16,185,129,0.1)",
              boxShadow: "0 4px 30px rgba(16,185,129,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
            }}
          >
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-start gap-3">
                {/* 아이콘 오브 */}
                <motion.div
                  animate={{ scale: [1, 1.12, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.08) 100%)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    boxShadow: "0 0 20px rgba(245,158,11,0.15)"
                  }}
                >
                  <Sparkles size={18} style={{ color: "#f59e0b" }} />
                </motion.div>

                <div>
                  <h2 className="text-xl font-[900] tracking-tight" style={{ color: "#0f172a" }}>
                    {t.common.popular}
                  </h2>
                  <p className="text-[10px] font-black uppercase mt-0.5" style={{ color: "#10b981", letterSpacing: "0.18em" }}>
                    Curated trending picks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* 라이브 뱃지 */}
                <div
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.15)"
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#10b981" }}>
                    {t.common.popularPicks}
                  </span>
                </div>

                {/* 전체보기 버튼 */}
                {popularIngredients.length > 8 && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowAllPopular(!showAllPopular)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
                    style={showAllPopular ? {
                      background: "linear-gradient(135deg, #10b981, #06b6d4)",
                      color: "white",
                      boxShadow: "0 6px 20px rgba(16,185,129,0.35)"
                    } : {
                      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                      color: "white",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
                    }}
                  >
                    <span>{showAllPopular ? t.common.hide : t.common.showAll}</span>
                    <motion.div animate={{ rotate: showAllPopular ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown size={13} strokeWidth={3} />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showAllPopular ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 pb-4 px-1"
                >
                  {popularIngredients.map((ing) => (
                    <IngredientCard key={ing.id} ingredient={ing} isFeatured={true} />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <HorizontalScroll className="gap-4 pt-2 pb-4 px-1">
                    {popularIngredients.slice(0, 8).map((ing) => (
                      <div key={ing.id} className="w-[160px] md:w-[210px] flex-shrink-0">
                        <IngredientCard ingredient={ing} isFeatured={true} />
                      </div>
                    ))}
                  </HorizontalScroll>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mb-8 relative pt-4">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-emerald-500/50 to-transparent" />

          {/* ── 전체 목록 헤더 ── */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(15,23,42,0.06) 0%, rgba(15,23,42,0.03) 100%)",
                  border: "1px solid rgba(0,0,0,0.06)"
                }}
              >
                <Database size={12} style={{ color: "#10b981" }} />
                <h2 className="font-[900] text-sm tracking-tight" style={{ color: "#0f172a" }}>
                  {t.common.all}
                </h2>
                <span
                  className="text-xs font-black px-1.5 py-0.5 rounded-lg"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    color: "#10b981"
                  }}
                >
                  {filteredIngredients.length}
                </span>
              </div>
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.12)"
              }}
            >
              <Info size={10} style={{ color: "#10b981" }} />
              <span
                className="text-[9px] font-black uppercase tracking-tight"
                style={{ color: "#64748b" }}
              >
                {language === 'ko' ? '2개 이상 선택 시 분석 활성화' : 'Select 2+ to Analyze'}
              </span>
            </div>
          </div>

          {isLoadingList ? (
            <div className="text-center py-16 text-gray-400 animate-pulse">{t.common.loading}</div>
          ) : filteredIngredients.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredIngredients.map((ing) => (
                <IngredientCard key={ing.id} ingredient={ing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">{t.common.noResult}</div>
          )}
        </div>

        <div ref={resultRef} className="mt-8">
          {isAnalyzing && <AnalyzingAnimation onComplete={handleAnimationComplete} />}
          {!isAnalyzing && hasResult && analysisResult && (
            <>
              <div className="flex items-center gap-2 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                <h2 className="text-base font-bold text-gray-600 px-3 flex items-center gap-2 uppercase tracking-widest">
                  <Sparkles size={16} className="text-emerald-500" />
                  {t.common.resultTitle}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
              </div>
              <AnalysisResults result={analysisResult} />
            </>
          )}
        </div>
      </main>

      <FloatingBasketBar onAnalyze={handleAnalyze} allIngredients={dbIngredients} />
      <FloatingAssistant />
    </div>
  );
}

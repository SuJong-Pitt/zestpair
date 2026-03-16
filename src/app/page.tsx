"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Pill, ChevronDown, Info, Sparkles, RefreshCcw, Languages, ChevronRight, Database } from "lucide-react";
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
      <section className="relative overflow-hidden pb-16 pt-8 md:pt-14 md:pb-32 bg-[#0F172A]">
        {/* 고도화된 배경 장식 */}
        <VisualDecorations />

        <div className="absolute top-8 right-8 z-50">
          <button
            onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-xs transition-all hover:bg-white/30 active:scale-95 shadow-lg group"
          >
            <Languages size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="tracking-widest uppercase">{language === "ko" ? "ENGLISH" : "한국어"}</span>
          </button>
        </div>

        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Pill size={22} className="text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">ZestPair</span>
          </div>

          <h1 className="text-[1.8rem] md:text-5xl lg:text-6xl font-[1000] text-white mb-4 leading-[1.05] tracking-tighter">
            <span className="block opacity-90 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-2 italic">{t.hero.title1}</span>
            <span className="relative inline-block mt-2 md:mt-4 group">
              <span className="relative z-10 bg-gradient-to-br from-emerald-200 via-white to-emerald-200 bg-clip-text text-transparent px-6 md:px-10 py-3 md:py-4 block">
                {t.hero.title2}
              </span>
              <motion.span 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-teal-600/30 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border-2 border-emerald-400/30 shadow-[0_30px_60px_rgba(16,185,129,0.4)] md:-skew-x-3"
              ></motion.span>
              
              {/* 스파클 데코레이션 */}
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 text-emerald-300 hidden md:block"
              >
                <Sparkles size={32} />
              </motion.div>
            </span>
          </h1>

          <p className="text-white/90 text-sm md:text-xl mb-6 md:mb-8 leading-relaxed font-bold max-w-sm md:max-w-lg mx-auto drop-shadow-sm px-4">
            {t.hero.subtitle1} {" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent font-[900]">{t.hero.subtitle2}</span>
            {t.hero.subtitle3}
          </p>

          <div className="relative max-w-2xl mx-auto group">
            {/* 고해상도 퀀텀 글로우 */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 via-teal-400/20 to-emerald-600/30 rounded-[5rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            
            <div className="relative flex items-center bg-slate-950/40 backdrop-blur-3xl border border-white/20 rounded-[5rem] p-1.5 md:p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 group-focus-within:bg-slate-900/60 group-focus-within:border-emerald-400/60 group-focus-within:scale-[1.02]">
              {/* 테크니컬 스캔라인 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent -translate-x-full group-hover:animate-[scan-once_1.5s_ease-in-out] pointer-events-none" />
              
              <div className="pl-4 md:pl-6 flex items-center justify-center text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <Search size={24} className="md:size-7 group-focus-within:scale-110 transition-transform duration-500" />
              </div>
              <Input
                ref={searchRef}
                type="text"
                placeholder={t.hero.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 text-xs md:text-2xl h-10 md:h-16 flex-1 font-[800] px-2 md:px-5 tracking-tighter md:tracking-tight"
              />
              <div className="flex items-center gap-2 md:gap-4 pr-1.5 md:pr-3">
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="hidden sm:block p-3 text-white/40 hover:text-white transition-colors bg-white/10 rounded-full">
                    <RefreshCcw size={22} />
                  </button>
                )}
                <button 
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 md:gap-3 px-6 md:px-10 py-2.5 md:py-4 bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-600 hover:brightness-110 text-emerald-950 rounded-full font-[1000] text-xs md:text-base transition-all active:scale-95 shadow-[0_15px_40px_rgba(16,185,129,0.5)] group/btn whitespace-nowrap"
                >
                  <span className="tracking-[0.1em] uppercase">{language === 'ko' ? '분석' : 'ANALYZE'}</span>
                  <ChevronDown size={18} className="md:size-5 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            
            {/* 검색창 하단 팁 */}
            <div className="mt-6 flex items-center justify-center gap-4 opacity-50">
              <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Popular:</span>
              <div className="flex gap-3">
                {['Vitamin C', 'Zinc', 'Biotin'].map(tag => (
                   <button key={tag} onClick={() => setSearchQuery(tag)} className="text-[10px] text-emerald-300 font-bold hover:text-white transition-colors">#{tag}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 
            고급 하단 스크림(Scrim): 
            콘텐츠를 가리지 않도록 높이를 조절하고 부드러운 전이 유지
        */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20" 
          style={{
            background: 'linear-gradient(to top, ' +
              'rgba(255,255,255,1) 0%, ' +
              'rgba(255,255,255,0.95) 20%, ' +
              'rgba(255,255,255,0.7) 45%, ' +
              'rgba(255,255,255,0.3) 75%, ' +
              'rgba(255,255,255,0) 100%)'
          }}
        />
      </section>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="relative mb-12">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.common.categoryTitle}</span>
          </div>

          <HorizontalScroll className="gap-3 pt-2 pb-4">
            {Object.entries(CATEGORIES_TRANSLATIONS).map(([key, data]) => (
              <motion.button
                key={key}
                layout
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory(key)}
                className={cn(
                  "relative flex items-center gap-2.5 whitespace-nowrap px-6 py-3.5 rounded-2xl text-[13px] font-black transition-all duration-500",
                  selectedCategory === key 
                    ? "text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)]" 
                    : "bg-white text-slate-500 hover:text-slate-900 border border-slate-100 shadow-sm"
                )}
              >
                {selectedCategory === key && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-slate-900 rounded-2xl z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 text-lg">{data.emoji}</span>
                <span className="relative z-10 tracking-tight">{data[language]}</span>
                
                {selectedCategory === key && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                  />
                )}
              </motion.button>
            ))}
          </HorizontalScroll>
        </div>

        {searchQuery === "" && selectedCategory === "all" && (
          <div className="mb-16 -mx-4 px-4 py-10 bg-gradient-to-b from-slate-50/50 via-white to-transparent rounded-[3rem] border-b border-slate-100">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Sparkles size={16} className="text-amber-600 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-[1000] text-slate-900 tracking-tighter italic uppercase">{t.common.popular}</h2>
                </div>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] ml-9 opacity-70">Curated trending picks</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.common.popularPicks}</span>
                </div>
                {popularIngredients.length > 8 && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllPopular(!showAllPopular)} 
                    className={cn(
                      "group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black transition-all duration-300 shadow-lg",
                      "text-[11px] uppercase tracking-widest italic",
                      showAllPopular 
                        ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                        : "bg-slate-900 text-white shadow-slate-900/40 hover:bg-slate-800"
                    )}
                  >
                    <span>{showAllPopular ? t.common.hide : t.common.showAll}</span>
                    <motion.div
                      animate={{ rotate: showAllPopular ? 180 : 0 }}
                      className="flex items-center justify-center"
                    >
                      <ChevronDown size={14} strokeWidth={3} />
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
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 pb-6 px-1"
                >
                  {popularIngredients.map((ing) => (
                    <IngredientCard key={ing.id} ingredient={ing} isFeatured={true} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="scroll"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <HorizontalScroll className="gap-4 pt-2 pb-6 px-1">
                    {popularIngredients.slice(0, 8).map((ing) => (
                      <div key={ing.id} className="w-[170px] md:w-[220px] flex-shrink-0">
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
          
          <div className="flex items-center justify-between mb-6 text-xs text-gray-400 px-1">
            <div className="flex items-center gap-3">
              <h2 className="font-[1000] text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                <Database size={14} className="text-slate-400" />
                {t.common.all} 
                <span className="text-emerald-500 ml-1">[{filteredIngredients.length}]</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Info size={12} className="text-emerald-500" />
              <span className="font-black text-[9px] uppercase tracking-tighter text-slate-500">
                {language === 'ko' ? '2개 이상 선택 시 분석 시스템 활성화' : 'Select 2+ for Analysis'}
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

      <FloatingBasketBar onAnalyze={handleAnalyze} />
      <FloatingAssistant />
      <ScrollToTop />
    </div>
  );
}

"use client";

import { useRef, useState, useEffect, Suspense, useMemo, useCallback, useTransition } from "react";
import { Search, Pill, ChevronDown, ChevronRight, Info, Sparkles, RefreshCcw, Languages, Database, Smartphone, X, Zap, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const IngredientCard = dynamic(() => import("@/components/IngredientCard"), {
  loading: () => <div className="w-full h-[180px] md:h-[220px] rounded-[1.75rem] bg-slate-200/20 animate-pulse" />,
  ssr: true
});
const FloatingBasketBar = dynamic(() => import("@/components/FloatingBasketBar"), { ssr: false });
import { useBasketStore } from "@/store/basketStore";
import { supabase } from "@/lib/supabase";
import type { AnalysisResult, Ingredient, InteractionResult } from "@/types/database";
import { cn } from "@/lib/utils";
import ScrollToTop from "@/components/ScrollToTop";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { UI_TRANSLATIONS, CATEGORIES_TRANSLATIONS } from "@/lib/i18n";
import { BrandLogo, BrandName } from "@/components/BrandAssets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Image from "next/image";

const AnalyzingAnimation = dynamic(() => import("@/components/AnalyzingAnimation"), { ssr: false });
const AnalysisResults = dynamic(() => import("@/components/AnalysisResults"), { ssr: false });
const VisualDecorations = dynamic(() => import("@/components/VisualDecorations"), { ssr: false });
import type { Interaction } from "@/types/database";
import { performAnalysis } from "@/lib/analysis";

// 검색 결과 타입을 위한 인터페이스
interface SearchCategory {
  id: string;
  name: string;
  name_en: string;
  emoji: string;
  isCategory: true;
}

type SearchResult = Ingredient | SearchCategory;


// 헬퍼 컴포넌트: 가로 스크롤 컨테이너 (관성 드래그 지원)
function HorizontalScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const updateConstraints = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setDragConstraints({ left: Math.min(0, -(contentWidth - containerWidth + 32)), right: 0 });
      }
    };

    updateConstraints();

    // ResizeObserver를 사용하여 내용물 크기 변화 감지 (카테고리 필터링 등)
    const resizeObserver = new ResizeObserver(() => {
      updateConstraints();
    });

    resizeObserver.observe(contentRef.current);
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', updateConstraints);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateConstraints);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative group/hscroll w-full overflow-hidden">
      {/* 페이드 효과: 모바일에서는 항상 보이거나 스크롤 상태에 따라 조절 가능하지만, 일단 항상 보이게 하거나 제거 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent z-10 pointer-events-none md:opacity-0 md:group-hover/hscroll:opacity-100 transition-opacity" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent z-10 pointer-events-none md:opacity-0 md:group-hover/hscroll:opacity-100 transition-opacity" />

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
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);
  const ingredientsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const heroSearchContainerRef = useRef<HTMLDivElement>(null);
  const isHeroSearchVisible = useInView(heroSearchContainerRef, { amount: 0.01 });
  const isIngredientsVisible = useInView(ingredientsRef, { amount: 0.01 }); // 더 민감하게 (1%만 보여도 감지)




  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  // 카테고리 전환 감지: 0=초기 로드(stagger 적용), >0=탭 전환(딜레이 없이 즉각 표시)
  const categoryVersionRef = useRef(0);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [showTopAlert, setShowTopAlert] = useState(false);

  // 마운트 직후 hydration mismatch 방지
  useEffect(() => {
    setIsMounted(true);
    // 초기 로딩 애니메이션 완료 후 플래그 설정 (약 2.5초 후)
    const timer = setTimeout(() => setHasInitialLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const [dbIngredients, setDbIngredients] = useState<Ingredient[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const {
    selectedIngredients, isAnalyzing, hasResult, setAnalyzing, setHasResult, clearBasket, language, setLanguage,
    analysisResult, setAnalysisResult, removeIngredient, addIngredient
  } = useBasketStore();

  const t = UI_TRANSLATIONS[language];

  // 메인 그리드용 필터링 (검색어 제외, 카테고리만) - 성능 최적화: useMemo
  const filteredIngredients = useMemo(() => {
    return dbIngredients.filter((ing) => {
      return selectedCategory === "all" || ing.category === selectedCategory;
    });
  }, [dbIngredients, selectedCategory]);

  // 카테고리 변경 시 버전 증가 (최초 로드 제외)
  const prevCategoryRef = useRef(selectedCategory);
  const isFirstCategoryRender = useRef(true);
  if (prevCategoryRef.current !== selectedCategory) {
    prevCategoryRef.current = selectedCategory;
    if (!isFirstCategoryRender.current) {
      categoryVersionRef.current += 1;
    }
  }

  // 드롭다운 검색 결과용 필터링 - 성분 및 카테고리 통합 매칭
  const dropdownResults = useMemo(() => {
    if (!searchQuery) return [];

    // 1. 카테고리 매칭 확인
    const matchedCategories = Object.entries(CATEGORIES_TRANSLATIONS)
      .filter(([key, data]) => {
        if (key === 'all') return false;
        const catName = language === 'ko' ? data.ko : data.en;
        return catName.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .map(([key, data]) => ({
        id: key,
        name: data.ko,
        name_en: data.en,
        emoji: data.emoji,
        isCategory: true
      }));

    // 2. 성분 매칭 (이름, 설명, 또는 매칭된 카테고리 소속)
    const matchedIngredients = dbIngredients.filter((ing) => {
      const name = (language === "ko" ? ing.name : ing.name_en).toLowerCase();
      const desc = (language === "ko" ? ing.short_description : (ing.short_description_en || ing.short_description)).toLowerCase();
      const query = searchQuery.toLowerCase();

      const isTextMatch = name.includes(query) || desc.includes(query);
      const isInMatchedCategory = matchedCategories.some(cat => cat.id === ing.category);

      return isTextMatch || isInMatchedCategory;
    });

    // 카테고리 결과를 상단에 배치하고 성분을 뒤에 배치
    return [...matchedCategories, ...matchedIngredients] as SearchResult[];
  }, [dbIngredients, searchQuery, language]);

  const isBlur = isDropdownOpen && dropdownResults.length > 0;

  const popularIngredients = useMemo(() => {
    return dbIngredients.filter((i) => i.is_popular);
  }, [dbIngredients]);

  // 데이터 로드 완료 후 첫 렌더 플래그 해제
  useEffect(() => {
    if (!isLoadingList && dbIngredients.length > 0) {
      isFirstCategoryRender.current = false;
    }
  }, [isLoadingList, dbIngredients.length]);

  const handleAnalyze = useCallback(async () => {
    if (selectedIngredients.length < 2) return;

    setIsDropdownOpen(false); // 분석 시작 시 드롭다운 닫기
    setHasResult(false);
    setAnalysisResult(null);
    setAnalyzing(true);

    // 공통 분석 로직 호출 (lib/analysis.ts)
    const result = await performAnalysis(selectedIngredients, language, dbIngredients);
    
    if (result) {
      setAnalysisResult(result);
    } else {
      setAnalyzing(false);
    }
  }, [selectedIngredients, language, dbIngredients, setHasResult, setAnalysisResult, setAnalyzing]);


  const handleAnimationComplete = useCallback(() => {
    // 분석이 끝났다고 바로 꺼버리면 홈 화면이 비춰서 안 예뻐요! (영자 실장 생각 ✨)
    // router.push가 완료될 때까지 오버레이를 유지합니다.
    router.push("/analysis");
  }, [router]);

  // (페이지 전환 방식으로 변경되어 기존 스크롤 로직은 제거합니다)

  return (
    <div className="min-h-screen bg-slate-50/50">
      <section
        className="relative pb-16 pt-10 md:pb-32 md:pt-12 z-40"
        style={{
          background: "radial-gradient(circle at 50% 0%, #0d1a15 0%, #080c14 50%, #030712 100%)"
        }}
      >
        {/* 고도화된 배경 장식 */}
        {!isMobile && <VisualDecorations />}

        <div className="absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 z-50 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black text-[10px] transition-all hover:bg-white/20 active:scale-95 shadow-lg group pointer-events-auto"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
              <Languages size={12} className="text-slate-900" />
            </div>
            <span className="tracking-widest uppercase mr-1">{language === "ko" ? "EN" : "KO"}</span>
          </button>

          <div className="flex items-center gap-2 lg:gap-3 pointer-events-auto">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl text-emerald-400 font-black text-[10px] transition-all hover:bg-emerald-500/20 hover:text-emerald-300 hover:scale-105 active:scale-95 shadow-lg relative group/guide overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-[150%] group-hover/guide:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              <span>{language === 'ko' ? '가이드보기' : 'Guide'}</span>
            </button>
            <Link
              href="/about"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/70 font-black text-[10px] transition-all hover:bg-white/20 hover:text-white active:scale-95 shadow-lg"
            >
              <span>{language === 'ko' ? '서비스 소개' : 'About'}</span>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center mt-6 md:mt-4">

          {/* === 로고 배지 === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center gap-3 mb-5 md:mb-8 px-5 py-2.5 rounded-full relative group cursor-default"
          >
            {/* 뒤 배경 글로우 */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2.5 md:gap-3 px-3.5 md:px-5 py-2.5 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)]">
              <BrandLogo size={isMobile ? 28 : 36} />
              <BrandName size="text-[17px] md:text-[20px]" />
              <div className="w-px h-3 md:h-4 bg-white/20 mx-1" />
              <Link
                href="/about"
                className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#6ee7b7]/80 flex items-center gap-1.5 hover:text-[#6ee7b7] transition-all group/core"
              >
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"
                  />
                  <span>AI Core v2.5</span>
                </div>
                <Info size={10} className="text-[#6ee7b7]/40 group-hover/core:text-[#6ee7b7] transition-colors" />
              </Link>
            </div>
          </motion.div>

          {/* === 메인 헤드라인 === */}
          <h1 className="mb-2 md:mb-4 tracking-tight">
            {/* 라인 1: 작은 선행 텍스트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xs md:text-xl font-black uppercase mb-1 md:mb-2 text-emerald-400 tracking-[0.2em]"
            >
              {t.hero.title1}
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
                className="absolute -inset-2 rounded-[2.5rem] opacity-40 blur-xl md:blur-2xl pointer-events-none"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #0891b2 50%, #7c3aed 100%)", willChange: "filter" }}
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
              </motion.span>

              <span className="relative z-10 flex flex-wrap items-center justify-center gap-x-1 md:gap-x-3 text-2xl sm:text-3xl md:text-5xl font-[1000] px-3 md:px-10 py-2 md:py-3 leading-tight tracking-tighter text-center text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {language === 'ko' ? (
                  <>
                    지금 드시는 영양제, <span className="text-rose-500 underline decoration-rose-500/30 underline-offset-8 decoration-4">'독'</span>이 되고 있습니까?
                  </>
                ) : (
                  <>
                    Are the supplements you take daily actually <span className="text-rose-500 underline decoration-rose-500/30 underline-offset-8 decoration-4">'POISON'</span>?
                  </>
                )}
              </span>

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
            className="text-[13px] md:text-base mb-3 md:mb-5 leading-relaxed max-w-md mx-auto px-2"
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




          {/* === 검색 바 === */}
          <AnimatePresence>
            {isDropdownOpen && dropdownResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDropdownOpen(false)}
                className="fixed inset-0 z-[700] bg-black/15 backdrop-blur-md"
              />
            )}
          </AnimatePresence>
          <motion.div
            ref={heroSearchContainerRef}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.7, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-2xl mx-auto group z-[800]"
          >
            {/* 메인 펄스 글로우 (항상 부드럽게 깜빡임) */}
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-4 rounded-[4rem] blur-xl md:blur-2xl pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)", willChange: "opacity" }}
            />

            {/* === 독립적인 분석바(검색바) 그룹 (포커스 효과 한정) === */}
            <div className="relative group/bar mb-4 md:mb-10">
              {/* 포커스 시 배경 글로우 (분석바 본체에만 집중) */}
              <div
                className="absolute -inset-5 rounded-[4rem] opacity-0 group-focus-within/bar:opacity-100 transition-all duration-700 blur-2xl md:blur-3xl pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.5), rgba(6,182,212,0.35), rgba(124,58,237,0.25))",
                  transform: "translateZ(0)",
                  willChange: "opacity"
                }}
              />
              <div
                className="absolute -inset-1 rounded-[4rem] opacity-0 group-focus-within/bar:opacity-40 transition-all duration-700 blur-xl md:blur-2xl pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.4), rgba(6,182,212,0.25))" }}
              />


              <div
                className="relative flex items-center rounded-[4rem] p-1 md:p-1.5 transition-all duration-500 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)",
                  transform: "translateZ(0)"
                }}
              >
                {/* 테두리 애니메이션 효과 */}
                <motion.div
                  className="absolute inset-0 rounded-[4rem] pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.1)"
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="pl-4 md:pl-6 text-emerald-400 relative z-20">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Search size={18} className="md:size-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </motion.div>
                </div>
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsDropdownOpen(true);
                    startTransition(() => {
                      setSearchQuery(e.target.value);
                    });
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="bg-transparent border-none text-white placeholder:text-white/35 focus-visible:ring-0 text-[11px] md:text-lg h-8 md:h-12 flex-1 font-bold px-1 md:px-4 tracking-tight relative z-20"
                />
                <div className="flex items-center gap-2 pr-1.5 md:pr-2">
                  {selectedIngredients.length > 0 && (
                    <button
                      onClick={clearBasket}
                      title={language === 'ko' ? '초기화' : 'Reset'}
                      className="p-1.5 md:p-2 text-white/25 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all active:scale-90 group/reset border border-white/5 hover:border-emerald-500/20 shadow-sm"
                    >
                      <RotateCcw size={14} className="group-hover/reset:rotate-[-180deg] transition-transform duration-500" />
                    </button>
                  )}
                  <motion.button
                    initial={{ x: 0 }}
                    animate={showTopAlert && selectedIngredients.length < 2 ? { x: [-4, 4, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={() => {
                      if (selectedIngredients.length < 2) {
                        setShowTopAlert(true);
                        setTimeout(() => setShowTopAlert(false), 2000);
                        return;
                      }
                      handleAnalyze();
                    }}
                    className="relative flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full font-[900] text-[9px] md:text-xs transition-all active:scale-95 whitespace-nowrap group/btn overflow-hidden"
                    style={{
                      background: (selectedIngredients.length < 2 && !showTopAlert)
                        ? "rgba(255,255,255,0.05)"
                        : (showTopAlert && selectedIngredients.length < 2)
                          ? "linear-gradient(135deg, #f87171 0%, #ef4444 100%)"
                          : "linear-gradient(135deg, #10b981 0%, #0891b2 60%, #7c3aed 100%)",
                      color: (selectedIngredients.length < 2 && !showTopAlert) ? "rgba(255,255,255,0.2)" : "white",
                      boxShadow: (selectedIngredients.length < 2) ? "none" : "0 8px 32px rgba(16,185,129,0.45), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                      letterSpacing: "0.08em",
                      border: (selectedIngredients.length < 2 && !showTopAlert) ? "1px solid rgba(255,255,255,0.1)" : "none"
                    }}
                  >
                    {selectedIngredients.length >= 2 && (
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        style={{ transform: "skewX(-20deg)" }}
                      />
                    )}
                    <span className="relative z-10 uppercase">
                      {showTopAlert && selectedIngredients.length < 2
                        ? (language === 'ko' ? '2개 이상 선택!' : 'MIN 2 ITEMS!')
                        : (language === 'ko' ? '분석하기' : 'ANALYZE')}
                    </span>
                    <ChevronRight size={16} className="relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* === 검색 드롭다운 === */}
            <AnimatePresence>
              {isDropdownOpen && dropdownResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute bottom-full left-0 right-0 z-[900] overflow-hidden rounded-[2.5rem] p-1.5 mb-3 shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)",
                    backdropFilter: "blur(40px)",
                    border: "1.5px solid rgba(16,185,129,0.3)",
                    boxShadow: "0 -25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(16,185,129,0.25)"
                  }}
                >
                  <div className="bg-[#0f172a]/95 rounded-[2.2rem] overflow-hidden shadow-2xl">
                    <div className="max-h-[140px] md:max-h-[180px] overflow-y-auto scrollbar-hide py-3 px-3 flex flex-wrap justify-center gap-1.5 md:gap-2">
                      {dropdownResults.map((item: SearchResult, i) => {
                        const isCategory = "isCategory" in item;
                        const active = !isCategory && selectedIngredients.some(sel => sel.id === (item as Ingredient).id);
                        return (
                          <motion.button
                            key={isCategory ? `cat-${item.id}` : (item as Ingredient).id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: Math.min(i * 0.01, 0.2) }}
                            onClick={() => {
                              if (isCategory) {
                                setSelectedCategory(item.id);
                                setInputValue("");
                                startTransition(() => setSearchQuery(""));
                                setIsDropdownOpen(false);
                                if (ingredientsRef.current) {
                                  ingredientsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              } else if (!active) {
                                addIngredient(item as Ingredient);
                                setInputValue("");
                                startTransition(() => setSearchQuery(""));
                                setIsDropdownOpen(false);
                              }
                            }}
                            className={cn(
                              "group/item flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-300 border font-bold text-[10px] md:text-xs whitespace-nowrap",
                              isCategory
                                ? "bg-amber-400/15 text-amber-200 border-amber-400/30 hover:bg-amber-400/25 hover:border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                                : (active
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                                  : "bg-slate-930/60 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white"
                                )
                            )}
                          >
                            <span className="text-sm group-hover/item:scale-110 transition-transform">
                              {isCategory ? (item as SearchCategory).emoji : (item as Ingredient).icon_emoji}
                            </span>
                            <span className="tracking-tighter">
                              {language === 'ko' ? item.name : item.name_en}
                            </span>
                            {isCategory ? (
                              <span className="text-[7px] text-amber-400/80 font-black uppercase tracking-widest pl-1 border-l border-amber-400/20 ml-1">Cat</span>
                            ) : (
                              active && <Zap size={8} className="text-white fill-current animate-pulse ml-0.5" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    {/* 드롭다운 푸터 */}
                    <div className="px-6 py-3 bg-white/[0.02] border-t border-white/[0.05] flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Select to add</span>
                      <span className="text-[9px] font-bold text-emerald-400/50 italic">Pori AI Search</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 인기 태그 */}
            <motion.div
              animate={{ filter: "blur(0px)", opacity: 0.75 }}
              transition={{ duration: 0.4 }}
              className="mt-0 md:mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-2"
            >
              <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.25em] whitespace-nowrap">
                {language === 'ko' ? '인기' : 'POPULAR'}:
              </span>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {t.hero.popularTags.map(tag => {
                  const matchingCategory = Object.values(CATEGORIES_TRANSLATIONS).find(c => c.ko === tag || c.en === tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setInputValue(tag);
                        startTransition(() => setSearchQuery(tag));
                        setIsDropdownOpen(true);
                      }}
                      className="group/tag relative text-[10px] md:text-xs font-black transition-all hover:scale-110 active:scale-95 px-2.5 py-1 rounded-lg overflow-hidden flex items-center gap-1"
                      style={{ color: "#6ee7b7" }}
                    >
                      <span className="relative z-10 opacity-70 group-hover/tag:scale-125 transition-transform">{matchingCategory?.emoji}</span>
                      <span className="relative z-10">#{tag}</span>
                      <span className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/tag:opacity-100 transition-opacity rounded-lg" />
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* === 선택된 성분 목록 (위치 이동: 인기 태그 하단) === */}
            <AnimatePresence>
              {selectedIngredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{
                    opacity: isBlur ? 0.3 : 1,
                    y: 0,
                    scale: 1,
                    filter: isBlur ? "blur(5px)" : "blur(0px)"
                  }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="flex flex-wrap justify-center gap-1.5 md:gap-2 mt-6 mb-2 px-4"
                >
                  {isMounted && selectedIngredients.map((ingredient) => (
                    <motion.div
                      layout
                      key={ingredient.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="group relative flex items-center gap-1 px-1.5 py-0.5 md:px-3 md:py-1 rounded-xl transition-all duration-300 whitespace-nowrap shrink-0"
                      style={{
                        background: "rgba(15, 23, 42, 0.85)",
                        border: "1.5px solid rgba(16, 185, 129, 0.5)",
                        boxShadow: "0 8px 20px rgba(16, 185, 129, 0.2)",
                        backdropFilter: "blur(16px)"
                      }}
                    >
                      <span className="text-[10px] md:text-sm group-hover:scale-110 transition-transform">
                        {ingredient.icon_emoji}
                      </span>
                      <span className="text-[8px] md:text-[11px] font-[900] text-white tracking-tight">
                        {language === 'ko' ? ingredient.name : ingredient.name_en}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeIngredient(ingredient.id); }}
                        className="ml-0.5 p-0.5 text-white/30 hover:text-white/80 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={3} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* === 소셜 프루프 배지 행 (상태 가속화) === */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isBlur ? 0.3 : 1,
                y: 0,
                filter: isBlur ? "blur(8px)" : "blur(0px)",
                scale: isBlur ? 0.98 : 1
              }}
              transition={{
                duration: 0.5,
                delay: !hasInitialLoaded ? 1.5 : 0,
                ease: "easeOut"
              }}
              className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2.5 mt-8 md:mt-12 mb-4 max-w-4xl mx-auto gpu-accelerated"
            >
              {[
                { icon: "⚡", text: language === 'ko' ? '0.5초 분석' : '0.5s Analysis', color: "#fbbf24" },
                { icon: "🔬", text: language === 'ko' ? 'AI 성분 매칭' : 'AI Matching', color: "#34d399" },
                { icon: "🛡️", text: language === 'ko' ? '충돌 감지' : 'Conflict Alert', color: "#f87171" },
                { icon: "✨", text: language === 'ko' ? '시너지 발견' : 'Synergy Finder', color: "#a78bfa" },
                { icon: "📱", text: language === 'ko' ? 'App 출시 예정' : 'App Coming Soon', color: "#60a5fa" },
                { icon: "💚", text: language === 'ko' ? '무료 서비스' : 'Free Forever', color: "#34d399" },
              ].map((badge, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: !hasInitialLoaded ? (1.6 + i * 0.05) : 0,
                    duration: 0.3
                  }}
                  whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.08)" }}
                  className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-full text-[8.5px] md:text-[11px] font-[900] transition-colors whitespace-nowrap gpu-accelerated"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color: badge.color,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
                  }}
                >
                  <span className="filter drop-shadow-[0_0_5px_rgba(0,0,0,0.3)]">{badge.icon}</span>
                  <span className="tracking-tighter">{badge.text}</span>
                </motion.span>
              ))}
            </motion.div>
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
        <div ref={ingredientsRef}> {/* 영양제 선택 영역만 ref로 감싸기 */}

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
                    className="group relative flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-2xl text-[12px] font-black transition-all duration-300"
                    style={isActive ? {
                      background: "linear-gradient(135deg, #0a1a15 0%, #071210 100%)",
                      border: "1.5px solid rgba(16,185,129,0.5)",
                      color: "#34d399",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3), 0 0 15px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                    } : {
                      background: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(0,0,0,0.04)",
                      color: "#64748b",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      backdropFilter: "blur(16px)"
                    }}
                  >
                    {/* 활성 배경 글로우 (Liquid Light 효과) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryGlow"
                        className="absolute inset-x-0 -bottom-1 h-3 blur-md opacity-60 z-0 pointer-events-none"
                        style={{ background: "#10b981" }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    {/* 내부 광원 효과 (Active 전용) */}
                    {isActive && (
                      <motion.div
                        animate={{ opacity: [0.1, 0.25, 0.1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-emerald-400/10 rounded-2xl pointer-events-none"
                      />
                    )}
                    <span className="relative z-10 text-base leading-none group-hover:scale-110 transition-transform">{data.emoji}</span>
                    <motion.span
                      className="relative z-10 tracking-tight"
                      animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    >
                      {data[language]}
                    </motion.span>
                    {/* 활성 하단 포인트 닷 */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full"
                        style={{
                          background: "#10b981",
                          boxShadow: "0 0 8px #10b981, 0 0 16px #10b981"
                        }}
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
                {isLoadingList ? (
                  <div key="skeleton" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pt-2 pb-4 px-1">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-[180px] md:h-[220px] rounded-[1.75rem]" />
                    ))}
                  </div>
                ) : showAllPopular ? (
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
                    <HorizontalScroll className="gap-3 pt-2 pb-4 px-1">
                      {popularIngredients.slice(0, 8).map((ing) => (
                        <div key={ing.id} className="w-[135px] md:w-[175px] flex-shrink-0">
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-1">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-[180px] md:h-[220px] rounded-[1.75rem]" />
                ))}
              </div>
            ) : filteredIngredients.length > 0 ? (
              <div
                key={categoryVersionRef.current}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-1 animate-fade-in"
              >
                {filteredIngredients.map((ing) => (
                  <IngredientCard key={ing.id} ingredient={ing} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 px-8 text-center"
              >
                <div className="relative mb-10 group">
                  {/* 프리미엄 리어 글로우 (오로라 효과) - 일관성 유지 */}
                  <div className="absolute inset-0 bg-emerald-300 blur-[100px] opacity-30 rounded-full group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-cyan-200 blur-[70px] opacity-20 rounded-full -translate-x-6 translate-y-6" />

                  {/* 깜찍한 3D 포리 애니메이션 */}
                  <motion.div
                    className="relative z-10 w-44 h-44 md:w-60 md:h-60 object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)]"
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 2, -1, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Image
                      src="/images/pori.png"
                      alt="Pori Mascot"
                      width={240}
                      height={240}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>

                  {/* 바닥 그림자 애니메이션 */}
                  <motion.div
                    animate={{
                      scaleX: [0.8, 1, 0.8],
                      opacity: [0.1, 0.18, 0.1]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-28 h-2.5 bg-black/30 blur-lg rounded-full"
                  />
                </div>

                <div className="space-y-4 max-w-sm">
                  <h3 className="text-2xl md:text-3xl font-[1000] text-slate-800 tracking-tighter leading-tight drop-shadow-sm">
                    {t.common.poriNoResult}
                  </h3>
                  <p className="text-slate-400 font-bold text-sm md:text-base leading-relaxed opacity-90">
                    {t.common.poriNoResultSub}
                  </p>
                </div>

                <div className="mt-12">
                  <button
                    onClick={() => {
                      setInputValue("");
                      startTransition(() => setSearchQuery(""));
                      setSelectedCategory("all");
                    }}
                    className="group/btn relative px-10 h-14 rounded-full font-black text-lg transition-all active:scale-95 shadow-xl hover:shadow-2xl overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #0891b2 100%)",
                      color: "white"
                    }}
                  >
                    {/* 내부 쉬머(Shimmer) 애니메이션 */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] animate-shimmer pointer-events-none" />

                    <div className="relative flex items-center gap-3">
                      <RefreshCcw className="h-5 w-5 group-hover/btn:rotate-180 transition-transform duration-700" />
                      <span>{t.common.viewAllIngredients}</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div> {/* ingredientsRef 닫기 */}

        <div ref={resultRef} id="analysis-results-section" className="mt-8 min-h-[50vh] scroll-mt-0">

          {isAnalyzing && <AnalyzingAnimation onComplete={handleAnimationComplete} />}
        </div>
      </main>


      {isMounted && (
        <FloatingBasketBar
          onAnalyze={handleAnalyze}
          allIngredients={dbIngredients}
          isHeroSearchVisible={isHeroSearchVisible}
          isIngredientsVisible={isIngredientsVisible}
          isHeroDropdownOpen={isDropdownOpen}
        />
      )}


      {/* 가이드 팝업 */}
      <AnimatePresence>
        {isGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          >
            {/* 어두운 배경 (클릭 시 닫힘) */}
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
              onClick={() => setIsGuideOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-auto h-auto max-w-5xl max-h-[90vh] bg-transparent rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setIsGuideOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                <X size={20} />
              </button>

              {/* 이미지 영역 (스크롤 가능) */}
              <div className="overflow-y-auto scrollbar-hide flex-1">
                <img
                  src={language === 'ko' ? '/hero-illustration-guide.webp' : '/hero-illustration-guide-en.webp'}
                  alt="ZestPair Using Guide"
                  className="w-auto h-auto max-w-full max-h-[90vh] object-contain block leading-none"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

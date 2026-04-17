"use client";

import { useRef, useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { Search, ChevronDown, ChevronRight, Info, Sparkles, Languages, X, Zap, RotateCcw, RefreshCcw } from "lucide-react";
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
import { cn, encodeShareParams } from "@/lib/utils";
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

// 카테고리별 테마 컬러 및 스타일 설정 (화사한 헥스 코드로 전면 개편 ✨)
const CATEGORY_THEMES: Record<string, { bg: string, border: string, text: string }> = {
  all: { bg: "#f0fdfa", border: "#ccfbf1", text: "#10b981" },
  vitamins: { bg: "#fff7ed", border: "#ffedd5", text: "#f59e0b" },
  minerals: { bg: "#f0f9ff", border: "#e0f2fe", text: "#f97316" }, // 오렌지 계열 유지
  omega: { bg: "#ecfeff", border: "#cffafe", text: "#0ea5e9" },
  probiotics: { bg: "#f0fdf4", border: "#dcfce7", text: "#10b981" },
  antioxidants: { bg: "#f5f3ff", border: "#ede9fe", text: "#8b5cf6" },
  amino_acids: { bg: "#fffbeb", border: "#fef3c7", text: "#d97706" },
  lipids: { bg: "#fff1f2", border: "#ffe4e6", text: "#f43f5e" },
  enzymes: { bg: "#f7fee7", border: "#ecfccb", text: "#84cc16" },
  herbs: { bg: "#f0fdfa", border: "#ccfbf1", text: "#14b8a6" },
  hormones: { bg: "#fdf4ff", border: "#fae8ff", text: "#d946ef" },
  drugs: { bg: "#f8fafc", border: "#f1f5f9", text: "#64748b" },
  other: { bg: "#f8fafc", border: "#f1f5f9", text: "#64748b" },
};

export default function HomeClient() {
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
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'popular'>('default');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  // 카테고리 전환 감지: 1=초기 로드(stagger 적용), >0=탭 전환(딜레이 없이 즉각 표시)
  const categoryVersionRef = useRef(0);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [comboIndex, setComboIndex] = useState(0);

  const {
    selectedIngredients, isAnalyzing, hasResult, setAnalyzing, setHasResult, clearBasket, language, setLanguage,
    analysisResult, setAnalysisResult, removeIngredient, addIngredient
  } = useBasketStore();

  const t = UI_TRANSLATIONS[language];

  useEffect(() => {
    // 플레이스홀더 로테이션 (3초)
    const pInterval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % t.hero.placeholderExamples.length);
    }, 3000);

    // 퀵스타트 콤보 로테이션 (5초)
    const cInterval = setInterval(() => {
      setComboIndex((prev) => (prev + 1) % 3); // 3개 세트 로테이션
    }, 5000);

    return () => {
      clearInterval(pInterval);
      clearInterval(cInterval);
    };
  }, [t.hero.placeholderExamples.length]);

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

  // 메인 그리드용 필터링 및 정렬 - 성능 최적화: useMemo
  const filteredIngredients = useMemo(() => {
    // 1. 카테고리 필터링
    let result = dbIngredients.filter((ing) => {
      return selectedCategory === "all" || ing.category === selectedCategory;
    });

    // 2. 정렬 적용
    switch (sortBy) {
      case 'name':
        // 이름순 (가나다/ABC)
        result = [...result].sort((a, b) => {
          const nameA = (language === 'ko' ? a.name : a.name_en).toLowerCase();
          const nameB = (language === 'ko' ? b.name : b.name_en).toLowerCase();
          return nameA.localeCompare(nameB, language === 'ko' ? 'ko' : 'en');
        });
        break;
      case 'popular':
        // 인기순 (is_popular 성분을 최상단으로)
        result = [...result].sort((a, b) => {
          if (a.is_popular && !b.is_popular) return -1;
          if (!a.is_popular && b.is_popular) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0); // 같은 인기라면 기존 순서 유지
        });
        break;
      case 'default':
      default:
        // 추천순 (기존 sort_order 유지)
        // dbIngredients 자체가 이미 sort_order로 가져와졌으므로 추가 정렬 불필요할 수 있으나, 명시적으로 처리
        result = [...result].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        break;
    }

    return result;
  }, [dbIngredients, selectedCategory, sortBy, language]);

  // 카테고리 변경 시 버전 증가 (최초 로드 제외)
  const prevCategoryRef = useRef(selectedCategory);
  const isFirstCategoryRender = useRef(true);
  if (prevCategoryRef.current !== selectedCategory) {
    prevCategoryRef.current = selectedCategory;
    if (!isFirstCategoryRender.current) {
      categoryVersionRef.current += 1;
    }
  }

  const popularIngredients = useMemo(() => {
    return [...dbIngredients.filter((i) => i.is_popular)].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = (language === 'ko' ? a.name : a.name_en) || '';
        const nameB = (language === 'ko' ? b.name : b.name_en) || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'popular') {
        // 인기순 정렬 (이미 필터링 되었으므로 sort_order 위주로 정렬하거나, is_popular 내부 순서 유지)
        return (a.sort_order || 0) - (b.sort_order || 0);
      }
      return 0; // default (order by sort_order or featured)
    });
  }, [dbIngredients, sortBy, language]);

  // 드롭다운 검색 결과용 필터링 - 성분 및 카테고리 통합 매칭
  const dropdownResults = useMemo(() => {
    if (!searchQuery) {
      // 검색어가 없을 때는 인기 성분을 제안 (드롭다운이 열려있을 때만)
      return popularIngredients.slice(0, 10) as SearchResult[];
    }

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
  }, [dbIngredients, searchQuery, language, popularIngredients]);

  const isBlur = isDropdownOpen && dropdownResults.length > 0;

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
    // GET 방식: 성분 슬러그를 URL에 인코딩하여 새로고침·공유 모두 동작하도록 합니다.
    const slugs = selectedIngredients.map(ing => ing.slug);
    const encoded = encodeShareParams(slugs);
    router.push(`/analysis?v=${encoded}`);
  }, [router, selectedIngredients]);

  // (페이지 전환 방식으로 변경되어 기존 스크롤 로직은 제거합니다)

  return (
    <div className="min-h-screen bg-slate-50/50">
      <section
        className="relative pb-24 pt-10 md:pb-32 md:pt-12 z-40"
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl text-white/80 font-black text-[10px] transition-all hover:bg-emerald-500/20 hover:text-white hover:scale-105 active:scale-95 shadow-lg relative group/guide overflow-hidden"
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
            <div className="relative flex items-center gap-2.5 md:gap-3 px-4 md:px-6 py-2.5 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)]">
              <BrandLogo size={32} />
              <BrandName size="text-[20px] md:text-[26px]" />
              <div className="w-px h-3 md:h-4 bg-white/20 mx-1" />
              <Link
                href="/about"
                className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#6ee7b7]/80 flex items-center gap-1.5 hover:text-[#6ee7b7] transition-all group/core"
              >
                <div className="flex items-center gap-1">
                  <div className="dot-pulse w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  <span>AI Core v2.5</span>
                </div>
                <Info size={10} className="text-[#6ee7b7]/40 group-hover/core:text-[#6ee7b7] transition-colors" />
              </Link>
            </div>
          </motion.div>

          {/* === 메인 헤드라인 === */}
          <h1 className="mb-2 md:mb-4 tracking-tight">
            {/* 라인 1: 상단 소형 텍스트 */}
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
              {/* 슬로건 박스 */}
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

              <span className="relative z-10 flex flex-wrap items-center justify-center gap-x-1 md:gap-x-3 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-[1000] px-3 md:px-10 py-2 md:py-3 leading-[1.1] tracking-tighter text-center text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                {language === 'ko' ? (
                  <>
                    <span className="relative inline-block mr-1 md:mr-2">
                      <span className="relative z-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]">영양제 상호작용</span>
                      <span className="absolute bottom-0 left-0 w-full h-[4px] bg-emerald-500/30 blur-[1px] rounded-full" />
                    </span>
                    무료 분석
                  </>
                ) : (
                  <>
                    Free Supplement <br className="lg:hidden" />
                    <span className="relative inline-block ml-1.5 md:ml-2">
                      <span className="relative z-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]">Interaction Analysis</span>
                      <span className="absolute bottom-0 left-0 w-full h-[4px] bg-emerald-500/30 blur-[1px] rounded-full" />
                    </span>
                  </>
                )}
              </span>

              {/* 코너 브래킷 */}
              {[["top-1.5 left-2.5", "border-t-2 border-l-2"], ["top-1.5 right-2.5", "border-t-2 border-r-2"], ["bottom-1.5 left-2.5", "border-b-2 border-l-2"], ["bottom-1.5 right-2.5", "border-b-2 border-r-2"]].map(([pos, border], i) => (
                <span key={i} className={`absolute ${pos} w-4 h-4 ${border} border-emerald-400/60 hidden md:block`} style={{ borderRadius: "3px" }} />
              ))}
              {/* 반짝이 */}
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
              }}
              className="font-black"
            >
              {t.hero.subtitle2}
            </span>
          </motion.p>






          {/* === 검색 바 === */}
          <AnimatePresence>
            {isDropdownOpen && dropdownResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDropdownOpen(false)}
                className="fixed inset-0 z-[700] bg-black/10 backdrop-blur-[2px]"
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
            {/* 메인 펄스 글로우 - 데스크탑 전용 (모바일에서 비활성화) */}
            {!isMobile && (
              <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-4 rounded-[4rem] blur-xl md:blur-2xl pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)", willChange: "opacity" }}
              />
            )}



            {/* === 독립적인 분석바(검색바) 그룹 (포커스 효과 한정) === */}
            <div className="relative group/bar mb-1">
              {/* 포커스 시 배경 글로우 (분석바 본체에만 집중) */}
              <div
                className="absolute -inset-5 rounded-[4rem] opacity-0 group-focus-within/bar:opacity-100 transition-all duration-700 blur-2xl md:blur-3xl pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.5), rgba(6,182,212,0.35), rgba(124,58,237,0.25))",
                  transform: "translateZ(0)",
                  willChange: "opacity"
                }}
              />
              {/* [신규] 배경 강화 광채 (Aurora Glow) */}
              <div
                className="absolute -inset-8 opacity-20 transition-all duration-1000 blur-3xl pointer-events-none group-hover/bar:opacity-30"
                style={{
                  background: "radial-gradient(circle at center, #10b981 0%, #06b6d4 30%, transparent 70%)",
                }}
              />

              <div
                className="absolute -inset-1 rounded-[4rem] opacity-0 group-focus-within/bar:opacity-60 transition-all duration-1000 blur-2xl md:blur-3xl pointer-events-none"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4, #7c3aed, #ec4899)" }}
              />


              <div
                className="relative flex items-center rounded-[4rem] p-1 md:p-1.5 transition-all duration-700 overflow-hidden group/inner"
                style={{
                  background: "rgba(10, 15, 30, 0.45)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
                  transform: "translateZ(0)"
                }}
              >
                {/* [신규] 프리즘 테두리 애니메이션 */}
                <div className="absolute inset-0 p-[2px] rounded-[4rem] pointer-events-none opacity-40 group-focus-within/bar:opacity-100 transition-opacity duration-1000">
                  <div
                    className="absolute inset-[-100%] animate-spin-slow"
                    style={{
                      background: "conic-gradient(from 0deg, transparent 0deg, #10b981 90deg, #06b6d4 180deg, #7c3aed 270deg, transparent 360deg)",
                      animationDuration: "4s"
                    }}
                  />
                  <div
                    className="absolute inset-[1.5px] rounded-[4rem]"
                    style={{ background: "#0a0f1e" }}
                  />
                </div>

                {/* [신규] 내부 광택 코팅 (Glossy Coating) */}
                <div
                  className="absolute inset-0 opacity-10 group-focus-within/bar:opacity-20 transition-opacity duration-1000 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 8s infinite linear"
                  }}
                />
                {/* 테두리 애니메이션 효과 - 데스크탑 전용 */}
                {/* 테두리 은은한 광채 효과 */}
                <motion.div
                  className="absolute inset-0 rounded-[4rem] pointer-events-none z-10"
                  style={{ boxShadow: "inset 0 0 15px rgba(16,185,129,0.15)" }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                <div className="pl-4 md:pl-6 text-emerald-400 relative z-20">
                  <Search size={18} className="md:size-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder={t.hero.placeholderExamples[placeholderIndex]}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsDropdownOpen(true);
                    startTransition(() => {
                      setSearchQuery(e.target.value);
                    });
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="bg-transparent border-none text-white placeholder:text-white/35 focus-visible:ring-0 text-[11px] md:text-lg h-8 md:h-12 flex-1 font-bold px-1 md:px-4 tracking-tight relative z-20 transition-all duration-500"
                />
                {/* 검색 Input 우측 영역: 기존 버튼들은 아래 액션 바로 이동 */}
              </div>
            </div>

            {/* === 선택된 성분 목록 — 검색 바 하단 배치 === */}
            <AnimatePresence>
              {selectedIngredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: isBlur ? 0.7 : 1, // 블러 대신 살짝 투명도 처리 (선명도 유지)
                    y: 0,
                  }}
                  exit={{ opacity: 0, y: -5, transition: { duration: 0.2 } }}
                  className="mt-3 mb-3 px-2 w-full"
                >
                  {/* 섹션 헤더 */}
                  <div className="flex items-center justify-between gap-2 mb-2 px-1">
                    <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(52,211,153,0.3))" }} />
                    <span
                      className="text-[9px] font-[1000] uppercase tracking-[0.2em] flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                      style={{ color: "#6ee7b7" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#10b981] dot-pulse" />
                      {language === 'ko' ? `선택됨 ${selectedIngredients.length}` : `${selectedIngredients.length} Items`}
                    </span>
                    <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(52,211,153,0.3))" }} />
                  </div>

                  {/* 칩 목록: 전체 노출 (스크롤 및 높이 제한 제거) */}
                  <div
                    className="flex flex-wrap justify-center gap-1.5 py-1 px-0.5"
                  >
                    {isMounted && selectedIngredients.map((ingredient, chipIdx) => (
                      <motion.div
                        layout
                        key={ingredient.id}
                        initial={{ scale: 0.7, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.15 } }}
                        transition={{ type: "spring", stiffness: 500, damping: 30, delay: chipIdx * 0.04 }}
                        className="group relative flex items-center gap-1.5 pl-2 pr-1 py-1 md:pl-3 md:pr-2 md:py-1.5 rounded-xl whitespace-nowrap shrink-0 active:scale-95 transition-transform border border-white/10"
                        style={{
                          background: "linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)",
                          boxShadow: "0 4px 16px rgba(16,185,129,0.45), 0 1px 3px rgba(0,0,0,0.3)",
                        }}
                      >
                        {/* 체크 뱃지 */}
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        {/* 이모지 */}
                        <span className="text-sm md:text-base leading-none">{ingredient.icon_emoji}</span>
                        {/* 이름 */}
                        <span className="text-[10px] md:text-xs font-[900] text-white tracking-tight max-w-[90px] md:max-w-[150px] truncate">
                          {language === 'ko' ? ingredient.name : ingredient.name_en}
                        </span>
                        {/* 삭제 버튼 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeIngredient(ingredient.id); }}
                          className="ml-0.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/15 flex items-center justify-center text-white/70 hover:bg-red-400/80 hover:text-white transition-all active:scale-90 shrink-0"
                        >
                          <X className="w-2.5 h-2.5" strokeWidth={3.5} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* ===== 검색 바 하단 액션 바 ===== */}
            <AnimatePresence>
              {selectedIngredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  {/* 좌측: 초기화 버튼 */}
                  <button
                    onClick={clearBasket}
                    className="group/reset flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 active:scale-95 shrink-0"
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    onMouseEnter={e => {
                      const btn = e.currentTarget;
                      btn.style.color = "#f87171";
                      btn.style.background = "rgba(248,113,113,0.12)";
                      btn.style.borderColor = "rgba(248,113,113,0.35)";
                    }}
                    onMouseLeave={e => {
                      const btn = e.currentTarget;
                      btn.style.color = "rgba(255,255,255,0.55)";
                      btn.style.background = "rgba(255,255,255,0.05)";
                      btn.style.borderColor = "rgba(255,255,255,0.12)";
                    }}
                  >
                    <RotateCcw size={12} className="group-hover/reset:rotate-[-180deg] transition-transform duration-500 shrink-0" />
                    <span className="whitespace-nowrap">{language === 'ko' ? '초기화' : 'Clear'}</span>
                  </button>

                  {/* 구분선 */}
                  <div className="w-px self-stretch shrink-0 my-1" style={{ background: "rgba(255,255,255,0.1)" }} />

                  {/* 우측: 상태 분기 분석 버튼 — flex-1로 남은 공간 채움 */}
                  {selectedIngredients.length === 1 ? (
                    /* 비활성화 — 1개 선택 시: amber 경고 스타일 */
                    <div
                      className="flex items-center justify-center gap-2 flex-1 py-2 px-3 rounded-xl text-[11px] font-black"
                      style={{
                        background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))",
                        border: "1px dashed rgba(251,191,36,0.35)",
                        color: "rgba(251,191,36,0.7)",
                      }}
                    >
                      <span className="text-sm leading-none shrink-0">+</span>
                      <span className="whitespace-nowrap">{language === 'ko' ? '1개를 더 선택해주세요' : 'Select 1 more item'}</span>
                    </div>
                  ) : (
                    /* 활성화 — 2개 이상: 프리즘 고광량 버튼 */
                    <motion.button
                      onClick={handleAnalyze}
                      className="relative flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-xl font-[900] text-[12px] overflow-hidden"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #0891b2 50%, #7c3aed 100%)",
                        color: "white",
                        boxShadow: "0 4px 20px rgba(16,185,129,0.5), 0 8px 32px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
                      }}
                    >
                      {/* 프리즘 광택 슬라이드 */}
                      <motion.span
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)", transform: "skewX(-20deg)" }}
                        animate={{ x: ["-150%", "150%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
                      />
                      {/* 상단 하이라이트 */}
                      <span
                        className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none rounded-full"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }}
                      />
                      <Zap size={13} className="relative z-10 fill-current shrink-0" />
                      <span className="relative z-10 tracking-tight whitespace-nowrap">
                        {language === 'ko'
                          ? `${selectedIngredients.length}개 조합 분석!!`
                          : `Analyze ${selectedIngredients.length}!`}
                      </span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* 퀵 스타트 조합 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isBlur ? 0.3 : 1,
                y: 0,
                filter: isBlur ? "blur(8px)" : "blur(0px)",
                scale: isBlur ? 0.98 : 1
              }}
              transition={{ duration: 0.4 }}
              className="mt-6 flex flex-col items-center gap-3"
            >
              <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={10} className="fill-current" />
                {t.hero.quickStart}
              </span>
              <div className="flex flex-wrap justify-center gap-2 px-4 min-h-[44px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={comboIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                  >
                    <div className="grid grid-cols-2 gap-2 w-full max-w-lg mx-auto">
                      {(comboIndex === 0 ? [
                        { id: 'immunity', tags: ['비타민C', '아연'], label: t.hero.combos.immunity },
                        { id: 'bone', tags: ['칼슘', '비타민D'], label: t.hero.combos.bone },
                      ] : comboIndex === 1 ? [
                        { id: 'vision', tags: ['루테인', '아스타잔틴'], label: t.hero.combos.vision },
                        { id: 'energy', tags: ['비타민B12', '아르기닌'], label: t.hero.combos.energy },
                      ] : [
                        { id: 'beauty', tags: ['콜라겐', '비타민C'], label: t.hero.combos.beauty },
                        { id: 'liver', tags: ['밀크씨슬 (실리마린)', '비타민B12'], label: t.hero.combos.liver }
                      ]).map((combo) => (
                        <button
                          key={combo.id}
                          onClick={() => {
                            const toAdd = dbIngredients.filter(ing =>
                              combo.tags.some(tag =>
                                ing.name === tag ||
                                ing.slug === tag
                              )
                            );
                            toAdd.forEach(ing => {
                              if (!selectedIngredients.some(s => s.id === ing.id)) {
                                addIngredient(ing);
                              }
                            });
                            if (toAdd.length > 0) {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-white/80 hover:text-emerald-300 text-[10px] md:text-xs font-bold transition-all active:scale-95 shadow-lg flex items-center justify-between gap-1 group/combo"
                        >
                          <span className="truncate">{combo.label}</span>
                          <ChevronRight size={12} className="group-hover/combo:translate-x-0.5 transition-transform opacity-30 group-hover/combo:opacity-100 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* 인기 태그 */}
            <motion.div
              animate={{
                opacity: isBlur ? 0.3 : 0.75,
                filter: isBlur ? "blur(8px)" : "blur(0px)",
                scale: isBlur ? 0.98 : 1
              }}
              transition={{ duration: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-2"
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
          </motion.div>





          {/* === 소셜 프루프 배지 행 (상태 가속화) === */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isBlur ? 0.7 : 1, // 블러 대신 투명도만 살짝 (선명도 유지)
              y: 0,
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
                className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-full text-[8.5px] md:text-[11px] font-[900] whitespace-nowrap hover:-translate-y-0.5 transition-transform"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: badge.color,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.2)"
                }}
              >
                <span className="filter drop-shadow-[0_0_5px_rgba(0,0,0,0.3)]">{badge.icon}</span>
                <span className="tracking-tighter">{badge.text}</span>
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* 하단 스크림 (가독성을 위해 높이 조절 및 위치 최적화) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 md:h-40 pointer-events-none z-20"
          style={{
            background: "linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.9) 30%, transparent 100%)"
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
            {/* 카테고리 나래비 (모바일 그리드 / 데스크탑 플렉스) */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-2 md:gap-3 px-1 md:px-0 pt-1 pb-6">
              {Object.entries(CATEGORIES_TRANSLATIONS).map(([key, data]) => {
                const isActive = selectedCategory === key;
                return (
                  <motion.button
                    key={key}
                    layout="position"
                    whileHover={{ y: -3, scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedCategory(key)}
                    className="group relative flex items-center justify-center sm:justify-start gap-1.5 md:gap-2.5 px-2 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-[1.25rem] text-[10px] md:text-[13px] font-[900] transition-all duration-300"
                    style={isActive ? {
                      background: "linear-gradient(135deg, #0a1a15 0%, #071210 100%)",
                      border: "1.2px solid rgba(16,185,129,0.5)",
                      color: "#34d399",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.3), 0 0 15px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
                    } : {
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      color: "#64748b",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
                      backdropFilter: "blur(20px)"
                    }}
                  >
                    {/* 활성 배경 글로우 (Liquid Light 효과) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryGlow"
                        className="absolute inset-x-0 -bottom-1 h-3 blur-md opacity-60 z-0 pointer-events-none"
                        style={{ background: "#10b981" }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                      />
                    )}

                    {/* 내부 광원 효과 (Active 전용) — 정적 opacity로 대체 */}
                    {isActive && (
                      <div className="absolute inset-0 bg-emerald-400/15 rounded-xl md:rounded-[1.25rem] pointer-events-none" />
                    )}

                    <span className="relative z-10 text-xs md:text-lg leading-none group-hover:scale-110 transition-transform duration-500">
                      {data.emoji}
                    </span>
                    <motion.span
                      className="relative z-10 tracking-tight whitespace-nowrap"
                      animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                    >
                      {data[language]}
                    </motion.span>

                    {/* 활성 하단 포인트 닷 (프리미엄 피니시) */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute bottom-1 md:bottom-2 left-1/2 -translate-x-1/2 w-1 h-0.5 rounded-full"
                        style={{
                          background: "#10b981",
                          boxShadow: "0 0 8px #10b981"
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
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
              <div className="flex items-start sm:items-center justify-between mb-7">
                <div className="flex items-start gap-3">
                  {/* 아이콘 오브 */}
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.08) 100%)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      boxShadow: "0 0 15px rgba(245,158,11,0.12)"
                    }}
                  >
                    <Sparkles size={15} style={{ color: "#f59e0b" }} />
                  </motion.div>

                  <div>
                    <h2 className="text-base font-[900] tracking-tight" style={{ color: "#0f172a", lineHeight: "1.2" }}>
                      {t.common.popular}
                    </h2>
                    <p className="text-[9px] font-black uppercase mt-0.5" style={{ color: "#10b981", letterSpacing: "0.15em", lineHeight: "1" }}>
                      Curated trending picks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 sm:pt-0">


                  {/* 정렬 셀렉터 (인기 섹션 버전) */}
                  <div className="relative group">
                    <div
                      className="absolute inset-0 bg-emerald-500/5 blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="relative z-10 appearance-none bg-white/40 hover:bg-white/60 border border-slate-200/60 rounded-xl px-3 pr-8 py-1.5 text-[10px] md:text-[11px] font-[900] text-slate-600 cursor-pointer transition-all outline-none focus:ring-2 focus:ring-emerald-500/20"
                      style={{
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                      }}
                    >
                      <option value="default">{language === 'ko' ? '추천순' : 'Recommended'}</option>
                      <option value="name">{language === 'ko' ? '이름순' : 'A-Z'}</option>
                      <option value="popular">{language === 'ko' ? '인기순' : 'Popularity'}</option>
                    </select>
                    <ChevronDown
                      size={10}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors"
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isLoadingList ? (
                  <div key="skeleton" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pt-2 pb-4 px-1">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-[180px] md:h-[220px] rounded-[1.75rem]" />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    key="popular-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 pb-4 px-1"
                  >
                    {/* 상위 인기 품목 전원을 고정 노출 (토글 기능 및 개수 제한 없음) */}
                    {popularIngredients.map((ing) => (
                      <IngredientCard key={ing.id} ingredient={ing} isFeatured={true} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="relative">


            <AnimatePresence mode="wait">
              {(selectedCategory !== 'all' || searchQuery !== '') && (
                <motion.div
                  key="list-header-and-content"
                  className="mb-20 md:mb-32 -mx-4 px-5 py-8 rounded-[2rem] transition-all duration-700"
                  initial={{ opacity: 0, scale: 1, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: (() => {
                      const theme = CATEGORY_THEMES[selectedCategory] || CATEGORY_THEMES.all;
                      // 대표님 요청: HEX -> RGBA 변환으로 완벽한 화사함 구현 (0.8 / 0.95 / 0.6 룰 적용 ✨)
                      const r1 = parseInt(theme.bg.slice(1, 3), 16);
                      const g1 = parseInt(theme.bg.slice(3, 5), 16);
                      const b1 = parseInt(theme.bg.slice(5, 7), 16);

                      const r2 = parseInt(theme.border.slice(1, 3), 16);
                      const g2 = parseInt(theme.border.slice(3, 5), 16);
                      const b2 = parseInt(theme.border.slice(5, 7), 16);

                      return `linear-gradient(160deg, rgba(${r1}, ${g1}, ${b1}, 0.8) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(${r2}, ${g2}, ${b2}, 0.6) 100%)`;
                    })(),
                    border: `1px solid ${selectedCategory === 'all' ? 'rgba(16,185,129,0.1)' : (CATEGORY_THEMES[selectedCategory]?.border || '#eee') + 'cc'}`,
                    boxShadow: selectedCategory === 'all'
                      ? "0 4px 30px rgba(16,185,129,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
                      : `0 4px 30px ${(CATEGORY_THEMES[selectedCategory]?.text || '#000')}06, inset 0 1px 0 rgba(255,255,255,0.8)`
                  }}
                >
                  {/* ── 전체 목록 헤더 (인기 섹션과 100% 매칭 ✨) ── */}
                  <div className="flex items-start sm:items-center justify-between gap-4 mb-7 px-1">
                    <div className="flex items-center gap-3">
                      {/* ── 메인 결과 헤더 (많이 찾는 영양제 섹션과 완벽 매칭 ✨) ── */}
                      {(() => {
                        const theme = CATEGORY_THEMES[selectedCategory] || CATEGORY_THEMES.all;
                        const categoryInfo = CATEGORIES_TRANSLATIONS[selectedCategory as keyof typeof CATEGORIES_TRANSLATIONS];

                        return (
                          <div className="flex items-center gap-3.5 group">
                            {/* 프리미엄 아이콘 보주(Orb) - 압도적인 볼륨감 (XL) ✨ */}
                            <motion.div
                              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              className="relative shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${theme.text}26 0%, ${theme.text}14 100%)`,
                                border: `1px solid ${theme.text}33`,
                                boxShadow: `0 0 15px ${theme.text}1f`
                              }}
                            >
                              <span className="text-base grayscale-[0.1] drop-shadow-sm group-hover:rotate-[-6deg] transition-transform">
                                {selectedCategory === 'all' ? <Sparkles size={15} style={{ color: theme.text }} /> : categoryInfo?.emoji}
                              </span>
                            </motion.div>

                            {/* 제목 및 부제목 - 인기 섹션과 동일 사양 ✨ */}
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-base font-[900] tracking-tight" style={{ color: "#0f172a", lineHeight: "1.2" }}>
                                  {selectedCategory === 'all' ? t.common.searchResult : categoryInfo[language]}
                                </h2>
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded-lg border border-slate-100 flex items-center justify-center min-w-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                                  style={{
                                    background: "#fff",
                                    color: theme.text,
                                    border: `1px solid ${theme.border}30`
                                  }}
                                >
                                  {filteredIngredients.length}
                                </span>
                              </div>
                              <p className="text-[9px] font-black uppercase mt-0.5" style={{ color: "#10b981", letterSpacing: "0.15em", lineHeight: "1" }}>
                                {selectedCategory === 'all'
                                  ? 'Curated trending picks'
                                  : `Discover ${selectedCategory.split('_')[0]} collection`}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center self-end sm:self-auto gap-3">


                      {/* 정렬 셀렉터 */}
                      <div className="relative group shrink-0">
                        <div
                          className="absolute inset-0 bg-emerald-500/5 blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="relative z-10 appearance-none bg-white/40 hover:bg-white/60 border border-slate-200/60 rounded-xl px-3 pr-8 py-1.5 text-[10px] md:text-[11px] font-[900] text-slate-600 cursor-pointer transition-all outline-none focus:ring-2 focus:ring-emerald-500/20"
                          style={{
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                          }}
                        >
                          <option value="default">{language === 'ko' ? '추천순' : 'Recommended'}</option>
                          <option value="name">{language === 'ko' ? '이름순' : 'A-Z'}</option>
                          <option value="popular">{language === 'ko' ? '인기순' : 'Popularity'}</option>
                        </select>
                        <ChevronDown
                          size={10}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors"
                          strokeWidth={3}
                        />
                      </div>
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
                      key={`${selectedCategory}-${categoryVersionRef.current}`}
                      className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 pb-4 px-1 animate-fade-in"
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div> {/* ingredientsRef 닫기 */}

        <div ref={resultRef} id="analysis-results-section" className={`mt-8 scroll-mt-0 ${(isAnalyzing || hasResult) ? 'min-h-[50vh]' : 'min-h-0'}`}>

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

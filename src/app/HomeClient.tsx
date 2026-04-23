"use client";

import { useRef, useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { Search, ChevronDown, ChevronRight, Info, Sparkles, Languages, X, Zap, RotateCcw, RefreshCcw, Activity } from "lucide-react";
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
  drugs: { bg: "#fff1f2", border: "#ffe4e6", text: "#f43f5e" },
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
  const [searchMode, setSearchMode] = useState<"ai" | "manual">("ai");
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'popular'>('default');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMainSortDropdownOpen, setIsMainSortDropdownOpen] = useState(false);
  // 카테고리 전환 감지: 1=초기 로드(stagger 적용), >0=탭 전환(딜레이 없이 즉각 표시)
  const categoryVersionRef = useRef(0);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [comboIndex, setComboIndex] = useState(0);

  const {
    selectedIngredients, isAnalyzing, hasResult, setAnalyzing, setHasResult, clearBasket, language, setLanguage,
    analysisResult, setAnalysisResult, removeIngredient, addIngredient, analysisHistory, addToHistory, clearHistory
  } = useBasketStore();

  // AI 매칭 관련 상태
  const [aiIntent, setAiIntent] = useState("");
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchError, setAiMatchError] = useState<string | null>(null);

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // AI 매칭 로딩 메시지 설정
  const aiLoadingMessages = useMemo(() => ({
    ko: [
      "신경망 코어 초기화 중...",
      "증상 벡터 분석 중...",
      "성분 데이터베이스 스캔 중...",
      "최적의 시너지 계산 중...",
      "맞춤형 프로토콜 생성 중...",
      "데이터 동기화 완료 중..."
    ],
    en: [
      "INITIALIZING NEURAL CORE...",
      "ANALYZING SYMPTOM VECTORS...",
      "SCANNING DATABASE...",
      "CALCULATING SYNERGY...",
      "GENERATING PROTOCOL...",
      "FINALIZING DATA SYNC..."
    ]
  }), []);

  // 로딩 메시지 순환 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiMatching) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % aiLoadingMessages[language].length);
      }, 1200);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isAiMatching, language, aiLoadingMessages]);

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
      // [대표님 제안 ✨] '트렌드(all)' 카테고리 선택 시에는 대중적인(is_popular) 성분만 노출
      if (selectedCategory === "all") {
        return ing.is_popular;
      }
      return ing.category === selectedCategory;
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

    // 공통 분석 로직 호출 (api/analyze/route.ts)
    try {
      const result = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient_ids: selectedIngredients.map(i => i.id),
          language
        })
      }).then(res => res.json());

      if (result.success && result.data) {
        setAnalysisResult(result.data);
        addToHistory(result.data);
      } else {
        setAnalyzing(false);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalyzing(false);
    }
  }, [selectedIngredients, language, setHasResult, setAnalysisResult, setAnalyzing, addToHistory]);

  const handleAiMatch = useCallback(async () => {
    if (!aiIntent || aiIntent.trim().length < 2 || isAiMatching) return;

    setIsAiMatching(true);
    setAiMatchError(null);

    try {
      // [대표님 제안 ✨] 매칭과 분석을 한 번의 API 호출로 통합
      const response = await fetch("/api/ai-match-and-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: aiIntent, language })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { ingredients: matchedIngredients, analysisResult } = result.data;
        
        if (matchedIngredients && matchedIngredients.length > 0) {
          // 1. 바구니 초기화 및 매칭된 성분 추가
          clearBasket();
          matchedIngredients.forEach((ing: Ingredient) => addIngredient(ing));
          setAiIntent("");
          
          // 2. 분석 결과 즉시 반영 및 애니메이션 트리거
          if (analysisResult) {
            setAnalysisResult(analysisResult);
            addToHistory(analysisResult);
            
            // 글로벌 분석 애니메이션 시작! (이미 데이터를 가지고 있으므로 바로 보여줄 준비가 됨)
            setAnalyzing(true);
          }
        } else {
          setAiMatchError(language === 'ko' ? "적절한 성분을 찾지 못했습니다." : "No matching ingredients found.");
        }
      } else {
        setAiMatchError(language === 'ko' ? "AI 매칭 및 분석에 실패했습니다." : "AI matching & analysis failed.");
      }
    } catch (error) {
      setAiMatchError(language === 'ko' ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
    } finally {
      setIsAiMatching(false);
    }
  }, [aiIntent, isAiMatching, language, clearBasket, addIngredient, setAnalyzing, setAnalysisResult, addToHistory]);


  const handleAnimationComplete = useCallback(() => {
    // GET 방식: 성분 슬러그를 URL에 인코딩하여 새로고침·공유 모두 동작하도록 합니다.
    const slugs = selectedIngredients.map(ing => ing.slug);
    const encoded = encodeShareParams(slugs);
    router.push(`/analysis?v=${encoded}`);
  }, [router, selectedIngredients]);

  // (페이지 전환 방식으로 변경되어 기존 스크롤 로직은 제거합니다)

  return (
    <div className="min-h-screen" style={{ background: "#030712" }}>
      <section
        className="relative pb-20 pt-24 md:pb-28 md:pt-28 z-40 hud-grid"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(13, 26, 21, 0.95) 0%, rgba(8, 12, 20, 0.98) 50%, #030712 100%)"
        }}
      >
        {/* 미세한 그리드 레이어 추가 */}
        <div className="absolute inset-0 hud-grid-fine opacity-30 pointer-events-none" />
        {/* 고도화된 배경 장식 */}
        {!isMobile && <VisualDecorations />}

        {/* ── 상단 네비게이션 ── */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* 언어 토글 */}
            <button
              onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-bold text-[10px] tracking-widest uppercase transition-all active:scale-95 pointer-events-auto"
            >
              <Languages size={11} className="shrink-0" />
              <span>{language === "ko" ? "EN" : "KO"}</span>
            </button>

            {/* 우측 네비 */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-3 py-1.5 rounded-lg text-white/60 hover:text-white font-bold text-[10px] tracking-wide transition-all hover:bg-white/5"
              >
                {language === 'ko' ? '가이드' : 'Guide'}
              </button>
              <Link
                href="/about"
                className="px-3 py-1.5 rounded-lg text-white/60 hover:text-white font-bold text-[10px] tracking-wide transition-all hover:bg-white/5"
              >
                {language === 'ko' ? '소개' : 'About'}
              </Link>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-2xl px-5 text-center">

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
          <h1 className="mb-4 md:mb-6 tracking-tight px-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[11px] md:text-sm font-black uppercase mb-3 md:mb-4 tracking-[0.25em]"
              style={{ color: "rgba(52,211,153,0.8)" }}
            >
              {t.hero.title1}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tighter text-white"
            >
              {language === 'ko' ? (
                <>
                  <span
                    className="inline"
                    style={{
                      background: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >영양제 상호작용</span>
                  <span className="text-white"> 무료 분석</span>
                </>
              ) : (
                <>
                  <span className="text-white">Free Supplement</span>{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >Analysis</span>
                </>
              )}
            </motion.div>
          </h1>

          {/* === 서브타이틀 === */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm md:text-base mb-8 md:mb-10 leading-relaxed max-w-sm md:max-w-md mx-auto px-4 text-white/45 font-medium"
          >
            {t.hero.subtitle1}{" "}
            <span className="text-white/70 font-semibold">{t.hero.subtitle2}</span>
          </motion.p>






          {/* ===== 검색 모드 스위처 + 검색 영역 ===== */}
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
            transition={{ duration: 0.7, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-2xl mx-auto z-[800]"
          >
            {/* ── 탭 스위처 ── */}
            <div className="flex items-center justify-center mb-3 px-4">
              <div
                className="relative inline-flex items-center rounded-xl p-0.5 gap-0.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* 슬라이딩 배경 */}
                <motion.div
                  layoutId="search-tab-indicator"
                  className="absolute top-0.5 bottom-0.5 rounded-[10px] pointer-events-none"
                  animate={{
                    left: searchMode === "ai" ? "2px" : "50%",
                    width: "calc(50% - 2px)",
                  }}
                  style={{
                    background: searchMode === "ai"
                      ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))"
                      : "rgba(255,255,255,0.06)",
                    border: searchMode === "ai" ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />

                {/* AI 매칭 탭 */}
                <button
                  onClick={() => setSearchMode("ai")}
                  className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-[10px] transition-all duration-200 min-w-[120px] justify-center"
                >
                  <Sparkles
                    size={12}
                    className="shrink-0 transition-colors duration-200"
                    style={{ color: searchMode === "ai" ? "#34d399" : "rgba(255,255,255,0.3)" }}
                  />
                  <span
                    className="text-[11px] md:text-xs font-bold tracking-wide whitespace-nowrap transition-colors duration-200"
                    style={{ color: searchMode === "ai" ? "#ffffff" : "rgba(255,255,255,0.35)" }}
                  >
                    {language === "ko" ? "AI 매칭" : "AI Match"}
                  </span>
                </button>

                {/* 직접 검색 탭 */}
                <button
                  onClick={() => { setSearchMode("manual"); setIsDropdownOpen(true); }}
                  className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-[10px] transition-all duration-200 min-w-[120px] justify-center"
                >
                  <Search
                    size={12}
                    className="shrink-0 transition-colors duration-200"
                    style={{ color: searchMode === "manual" ? "#94a3b8" : "rgba(255,255,255,0.3)" }}
                  />
                  <span
                    className="text-[11px] md:text-xs font-bold tracking-wide whitespace-nowrap transition-colors duration-200"
                    style={{ color: searchMode === "manual" ? "#ffffff" : "rgba(255,255,255,0.35)" }}
                  >
                    {language === "ko" ? "직접 검색" : "Search"}
                  </span>
                </button>
              </div>
            </div>

            {/* ── 검색 패널 ── */}
            <AnimatePresence mode="wait">

              {/* ── AI 매칭 패널 ── */}
              {searchMode === "ai" && (
                <motion.div
                  key="ai-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="px-2"
                >
                  <div className="relative group/ai-input">
                    {/* 외부 글로우 - 은은한 호흡 느낌 */}
                    <motion.div
                      className="absolute -inset-[1px] rounded-xl blur-md pointer-events-none"
                      animate={{ 
                        opacity: isAiMatching ? [0.2, 0.4, 0.2] : 0,
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{ 
                        background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2), rgba(124,58,237,0.2))",
                        opacity: 0
                      }}
                    />
                    <div
                      className="absolute -inset-[1px] rounded-xl opacity-0 group-focus-within/ai-input:opacity-100 transition-all duration-700 blur-sm pointer-events-none"
                      style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.5), rgba(6,182,212,0.4), rgba(124,58,237,0.45))" }}
                    />

                    <div
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        background: "rgba(2, 6, 23, 0.95)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
                      }}
                    >
                      {/* 상단 상태 스트립 */}
                      <div
                        className="flex items-center justify-between px-4 py-1.5 border-b"
                        style={{ borderColor: "rgba(6,182,212,0.1)", background: "rgba(6,182,212,0.03)" }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse shadow-[0_0_6px_#10b981]" />
                          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-emerald-400/60">
                            AI NEURAL MATCH · ONLINE
                          </span>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={isAiMatching ? loadingMessageIndex : 'ready'}
                            initial={{ opacity: 0, x: -2 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 2 }}
                            transition={{ duration: 0.2 }}
                            className="text-[9px] font-black tracking-widest uppercase"
                            style={{ 
                              color: isAiMatching ? "#34d399" : "rgba(255,255,255,0.15)",
                              textShadow: isAiMatching ? "0 0 8px rgba(52,211,153,0.5)" : "none"
                            }}
                          >
                            {isAiMatching ? aiLoadingMessages[language][loadingMessageIndex] : "READY"}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      {/* 메인 입력 영역 */}
                      <div className="flex items-center gap-3 px-3 md:px-4">
                        {/* 좌측 AI 아이콘 */}
                        <div className="flex flex-col items-center gap-0.5 shrink-0 py-2.5">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300"
                            style={{
                              background: isAiMatching
                                ? "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.25))"
                                : "rgba(16,185,129,0.08)",
                              border: "1px solid rgba(16,185,129,0.2)",
                            }}
                          >
                            {isAiMatching ? (
                              <RefreshCcw size={14} className="text-emerald-400 animate-spin" />
                            ) : (
                              <Sparkles size={14} className="text-emerald-400" />
                            )}
                          </div>
                          <span className="text-[7px] font-black tracking-widest text-emerald-500/40 uppercase">AI</span>
                        </div>

                        {/* 세로 구분선 */}
                        <div
                          className="self-stretch w-px shrink-0 my-2"
                          style={{ background: "linear-gradient(to bottom, transparent, rgba(6,182,212,0.25), transparent)" }}
                        />

                        {/* 터미널 프롬프트 + 입력 */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-emerald-400/30 font-mono text-sm shrink-0 select-none hidden md:block">&gt;_</span>
                          <input
                            type="text"
                            value={aiIntent}
                            onChange={(e) => { setAiIntent(e.target.value); setAiMatchError(null); }}
                            onKeyDown={(e) => e.key === "Enter" && handleAiMatch()}
                            placeholder={
                              language === "ko"
                                ? isMobile ? "증상이나 목표를 입력하세요" : "증상이나 목표를 말씀해주세요 (예: 요즘 너무 피곤해)"
                                : isMobile ? "Describe your symptoms" : "Tell me your symptoms (e.g., I'm so tired lately)"
                            }
                            className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 focus:ring-0 text-[13px] md:text-[14px] font-medium py-3 md:py-3.5 min-w-0"
                          />
                        </div>

                        {/* EXECUTE 버튼 */}
                        <div className="shrink-0 py-2 pr-1">
                          <motion.button
                            onClick={handleAiMatch}
                            disabled={aiIntent.length < 2 || isAiMatching}
                            whileHover={aiIntent.length >= 2 && !isAiMatching ? { scale: 1.04 } : {}}
                            whileTap={aiIntent.length >= 2 && !isAiMatching ? { scale: 0.96 } : {}}
                            className="relative overflow-hidden flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-300"
                            style={
                              aiIntent.length >= 2 && !isAiMatching
                                ? {
                                    background: "linear-gradient(135deg, #10b981, #0891b2)",
                                    color: "#000",
                                    boxShadow: "0 0 20px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.04)",
                                    color: "rgba(255,255,255,0.2)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    cursor: "not-allowed",
                                  }
                            }
                          >
                            {aiIntent.length >= 2 && !isAiMatching && (
                              <motion.span
                                className="absolute inset-0 pointer-events-none"
                                style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%)" }}
                                animate={{ x: ["-150%", "150%"] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                              />
                            )}
                            <Zap size={10} className="relative z-10 shrink-0" />
                            <span className="relative z-10">
                              {isAiMatching
                                ? (isMobile ? "···" : "SCAN")
                                : "MATCH"}
                            </span>
                          </motion.button>
                        </div>
                      </div>

                      {/* HUD 정밀 스캔라인 효과 */}
                      <div className="hud-scanline opacity-10" />
                      {isAiMatching && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                        >
                          {/* 초정밀 레이저 스캐닝 라인 */}
                          <motion.div 
                            className="absolute left-0 right-0 h-[1px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                            animate={{ 
                              top: ["0%", "100%"] 
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity, 
                              ease: "linear" 
                            }}
                          />
                          
                          {/* 은은한 데이터 플로우 필터 */}
                          <motion.div 
                            className="absolute inset-0 bg-cyan-500/5"
                            animate={{ 
                              opacity: [0.03, 0.08, 0.03] 
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* 에러 메시지 */}
                    <AnimatePresence>
                      {aiMatchError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 left-2 text-[11px] font-bold text-red-400/80 text-center"
                        >
                          {aiMatchError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 하단 힌트 태그 — HUD Query Chips */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {(language === "ko"
                      ? [
                          { code: "SLP", label: "잠이 안 와",    icon: "💤", color: "#818cf8" },
                          { code: "FAT", label: "너무 피곤해",   icon: "⚡", color: "#f59e0b" },
                          { code: "RCV", label: "운동 회복",     icon: "💪", color: "#34d399" },
                          { code: "COG", label: "집중력 향상",   icon: "🧠", color: "#06b6d4" },
                          { code: "SKN", label: "피부 개선",     icon: "🌿", color: "#a78bfa" },
                        ]
                      : [
                          { code: "SLP", label: "Can't sleep",      icon: "💤", color: "#818cf8" },
                          { code: "FAT", label: "Always tired",     icon: "⚡", color: "#f59e0b" },
                          { code: "RCV", label: "Workout recovery", icon: "💪", color: "#34d399" },
                          { code: "COG", label: "Focus boost",      icon: "🧠", color: "#06b6d4" },
                          { code: "SKN", label: "Skin glow",        icon: "🌿", color: "#a78bfa" },
                        ]
                    ).map((hint) => (
                      <motion.button
                        key={hint.code}
                        onClick={() => { setAiIntent(hint.label); setAiMatchError(null); }}
                        whileHover={{ y: -2, scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="group/chip relative flex items-center gap-2 px-3 py-1.5 overflow-hidden"
                        style={{
                          background: "rgba(10, 15, 30, 0.6)",
                          border: `1px solid ${hint.color}30`,
                          borderLeft: `2px solid ${hint.color}`,
                          borderRadius: "6px",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {/* 호버 시 스캔 슬라이드 */}
                        <span
                          className="absolute inset-0 opacity-0 group-hover/chip:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: `linear-gradient(90deg, ${hint.color}15, transparent)` }}
                        />
                        {/* 상태 코드 라벨 */}
                        <span
                          className="text-[8px] font-black tracking-widest shrink-0"
                          style={{ color: hint.color, opacity: 0.7 }}
                        >
                          {hint.code}
                        </span>
                        {/* 구분선 */}
                        <span className="w-px h-3 shrink-0" style={{ background: `${hint.color}30` }} />
                        {/* 라벨 텍스트 */}
                        <span
                          className="text-[11px] font-bold text-white/60 group-hover/chip:text-white/90 transition-colors whitespace-nowrap relative z-10"
                        >
                          {hint.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── 직접 검색 패널 ── */}
              {searchMode === "manual" && (
                <motion.div
                  key="manual-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative group"
                >
                  {/* 메인 펄스 글로우 */}
                  {!isMobile && (
                    <motion.div
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -inset-4 rounded-[4rem] blur-xl md:blur-2xl pointer-events-none"
                      style={{ background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)", willChange: "opacity" }}
                    />
                  )}
                  <div className="relative group/bar mb-1">
                    {/* 포커스 글로우 */}
                    <div
                      className="absolute -inset-5 rounded-[4rem] opacity-0 group-focus-within/bar:opacity-100 transition-all duration-700 blur-2xl md:blur-3xl pointer-events-none"
                      style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.5), rgba(6,182,212,0.35), rgba(124,58,237,0.25))", willChange: "opacity" }}
                    />
                    <div
                      className="absolute -inset-1 rounded-[4rem] opacity-0 group-focus-within/bar:opacity-60 transition-all duration-1000 blur-2xl md:blur-3xl pointer-events-none"
                      style={{ background: "linear-gradient(135deg, #10b981, #06b6d4, #7c3aed, #ec4899)" }}
                    />

                    <div
                      className="relative flex items-center rounded-xl p-1 md:p-1.5 transition-all duration-700 overflow-hidden group/inner hud-card"
                      style={{
                        background: "rgba(2, 6, 23, 0.9)",
                        border: "1px solid var(--color-hud-border)",
                        backdropFilter: "blur(24px)",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)",
                        transform: "translateZ(0)"
                      }}
                    >
                      {/* HUD Corner Brackets & Scanline */}
                      <div className="hud-corner-br opacity-60" />
                      <div className="hud-corner-bl opacity-60" />
                      <div className="hud-scanline opacity-10" />

                      {/* 프리즘 테두리 애니메이션 */}
                      <div className="absolute inset-0 p-[2px] rounded-xl pointer-events-none opacity-40 group-focus-within/bar:opacity-100 transition-opacity duration-1000">
                        <div
                          className="absolute inset-[-100%] animate-spin-slow"
                          style={{
                            background: "conic-gradient(from 0deg, transparent 0deg, var(--color-hud-cyan) 90deg, #06b6d4 180deg, #7c3aed 270deg, transparent 360deg)",
                            animationDuration: "4s"
                          }}
                        />
                        <div
                          className="absolute inset-[1.5px] rounded-xl"
                          style={{ background: "#020617" }}
                        />
                      </div>

                      {/* 내부 광택 코팅 */}
                      <div
                        className="absolute inset-0 opacity-10 group-focus-within/bar:opacity-20 transition-opacity duration-1000 pointer-events-none"
                        style={{
                          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 70%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 8s infinite linear"
                        }}
                      />
                      {/* 테두리 은은한 광채 */}
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
                          startTransition(() => { setSearchQuery(e.target.value); });
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="bg-transparent border-none text-white placeholder:text-white/35 focus-visible:ring-0 text-base md:text-lg h-10 md:h-12 flex-1 font-bold px-1 md:px-4 tracking-tight relative z-20 transition-all duration-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>


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

            {/* === [신규] 인기 프로토콜 (추천 조합) === */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isBlur ? 0.2 : 1,
                y: 0,
                filter: isBlur ? "blur(12px)" : "blur(0px)",
                scale: isBlur ? 0.96 : 1
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <div className="flex flex-col items-center mb-2">
                <span className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                  <Activity size={12} className="text-emerald-400" />
                  {t.hero.quickStart}
                </span>
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              </div>
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
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="relative group/combo flex flex-col items-start p-4 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] active:scale-95 border border-white/10"
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            backdropFilter: "blur(20px)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{combo.id} Protocol</span>
                          </div>
                          <span className="text-xs md:text-sm font-black text-white mb-2 group-hover/combo:text-emerald-400 transition-colors leading-tight">{combo.label}</span>
                          <div className="flex flex-wrap gap-1">
                            {combo.tags.map(tag => (
                              <span key={tag} className="text-[8px] font-bold text-emerald-400/70 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">{tag}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
            {/* 최근 분석 히스토리 [신규 ✨] */}
            {isMounted && analysisHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isBlur ? 0.2 : 1,
                  filter: isBlur ? "blur(10px)" : "blur(0px)",
                  scale: isBlur ? 0.97 : 1
                }}
                className="mt-8 w-full max-w-xl mx-auto"
              >
                <div className="flex items-center justify-between gap-4 mb-3 px-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] flex items-center gap-2 italic">
                    <RotateCcw size={10} />
                    {language === 'ko' ? '최근 분석 기록' : 'Recent Scans'}
                  </span>
                  <button 
                    onClick={clearHistory}
                    className="text-[9px] font-bold text-white/20 hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    {language === 'ko' ? '기록 삭제' : 'Clear All'}
                  </button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {analysisHistory.map((history, hIdx) => (
                    <motion.button
                      key={history.analyzed_at || hIdx}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        clearBasket();
                        history.ingredients.forEach(ing => addIngredient(ing));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group relative flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all shadow-lg"
                    >
                      <div className="flex -space-x-2 mr-1">
                        {history.ingredients.slice(0, 3).map((ing, i) => (
                          <div 
                            key={ing.id} 
                            className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs shadow-sm"
                            style={{ zIndex: 3 - i }}
                          >
                            {ing.icon_emoji}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] font-black text-white/80 line-clamp-1 max-w-[120px]">
                          {history.ingredients.map(ing => language === 'ko' ? ing.name : ing.name_en).join(', ')}
                        </span>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[8px] font-bold" style={{ color: history.score >= 80 ? '#10b981' : history.score >= 60 ? '#f59e0b' : '#f87171' }}>
                            SCORE: {history.score}
                           </span>
                           <span className="w-1 h-1 rounded-full bg-white/10" />
                           <span className="text-[8px] font-medium text-white/20">
                            {new Date(history.analyzed_at || '').toLocaleDateString(language, { month: 'short', day: 'numeric' })}
                           </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 인기 태그 */}
            <motion.div
              animate={{
                opacity: isBlur ? 0.3 : 1,
                scale: isBlur ? 0.98 : 1
              }}
              transition={{ duration: 0.4 }}
              className="mt-12 flex flex-col items-center gap-4 px-2"
            >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
                 <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] whitespace-nowrap">
                   {language === 'ko' ? '인기 키워드' : 'Trending Tags'}
                 </span>
                 <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
              </div>
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 max-w-lg">
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
                      className="group/tag relative px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="text-[10px] md:text-xs font-bold text-white/60 group-hover/tag:text-emerald-400 transition-colors">
                        <span className="opacity-50 mr-0.5">#</span>{tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>





          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isBlur ? 0.7 : 1,
              y: 0,
              scale: isBlur ? 0.98 : 1
            }}
            transition={{
              duration: 0.5,
              delay: !hasInitialLoaded ? 1.5 : 0,
              ease: "easeOut"
            }}
            className="flex flex-wrap items-center justify-center gap-2 mt-12 mb-6 max-w-3xl mx-auto"
          >
            {[
              { icon: "⚡", text: language === 'ko' ? '0.5초 분석' : '0.5s Analysis', color: "#fbbf24" },
              { icon: "🔬", text: language === 'ko' ? 'AI 성분 매칭' : 'AI Matching', color: "#34d399" },
              { icon: "🛡️", text: language === 'ko' ? '충돌 감지' : 'Conflict Alert', color: "#f87171" },
              { icon: "✨", text: language === 'ko' ? '시너지 발견' : 'Synergy Finder', color: "#a78bfa" },
              { 
                icon: "📱", 
                text: language === 'ko' ? 'App 출시 예정' : 'App Coming Soon', 
                color: "#60a5fa",
              },
              { icon: "💚", text: language === 'ko' ? '무료 서비스' : 'Free Forever', color: "#34d399" },
            ].map((badge: any, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] md:text-[10px] font-bold whitespace-nowrap bg-white/[0.02] border border-white/[0.08]"
                style={{ color: badge.color }}
              >
                <span className="opacity-80">{badge.icon}</span>
                <span className="tracking-tight text-white/70">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </section>



      <main className="mx-auto max-w-2xl px-4 py-10">
        <div ref={ingredientsRef}>

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
            {/* 카테고리 나래비 (모바일 가로 스크롤 / 데스크탑 플렉스) ✨ */}
            <div 
              className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center justify-start sm:justify-center gap-2 md:gap-3 px-1 md:px-0 pt-1 pb-6 [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {Object.entries(CATEGORIES_TRANSLATIONS).map(([key, data]) => {
                const isActive = selectedCategory === key;
                return (
                  <motion.button
                    key={key}
                    layout="position"
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedCategory(key)}
                    className="group relative flex items-center justify-center sm:justify-start gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 rounded-full text-[10px] md:text-[13px] font-[900] transition-all duration-300"
                    style={isActive ? {
                      background: "rgba(16,185,129,0.15)",
                      border: "1.5px solid rgba(16,185,129,0.5)",
                      color: "#34d399",
                      boxShadow: "0 8px 24px rgba(16,185,129,0.25), inset 0 0 10px rgba(16,185,129,0.1)"
                    } : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                    }}
                  >
                    {/* 활성 배경 글로우 ✨ */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryGlow"
                        className="absolute inset-0 bg-emerald-400/10 blur-md rounded-full pointer-events-none"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                      />
                    )}

                    <span className="relative z-10 text-xs md:text-lg leading-none group-hover:scale-110 transition-transform duration-500">
                      {data.emoji}
                    </span>
                    <motion.span
                      className="relative z-10 tracking-tight whitespace-nowrap"
                    >
                      {data[language]}
                    </motion.span>
                    
                    {/* 하단 활성 인디케이터 바 (스크린샷 참고) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {searchQuery === "" && selectedCategory === "all" && (
            <div
              className="mb-20 md:mb-32 -mx-4 px-5 py-8 rounded-[2rem]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* 섹션 헤더 */}
              <div className="flex items-center justify-between gap-4 mb-7 px-1">
                <div className="flex items-center gap-3.5">
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
                    <h2 className="text-sm md:text-base font-[1000] tracking-tight" style={{ color: "#f8fafc", lineHeight: "1.2" }}>
                    {t.common.popular}
                    </h2>
                    <p className="text-[8px] md:text-[9px] font-black uppercase mt-0.5" style={{ color: "#10b981", letterSpacing: "0.2em", lineHeight: "1" }}>
                      Curated trending picks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 sm:pt-0">


                  {/* 정렬 셀렉터 (인기 섹션 버전) ✨ */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8",
                      }}
                    >
                      <span className="whitespace-nowrap">
                        {sortBy === 'default' ? (language === 'ko' ? '추천순' : 'Recommended') :
                         sortBy === 'name' ? (language === 'ko' ? '이름순' : 'A-Z') :
                         (language === 'ko' ? '인기순' : 'Popularity')}
                      </span>
                      <ChevronDown
                        size={12}
                        className={cn("transition-transform duration-300 text-emerald-400", isSortDropdownOpen && "rotate-180")}
                        strokeWidth={3}
                      />
                    </button>

                    <AnimatePresence>
                      {isSortDropdownOpen && (
                        <>
                          {/* 외부 클릭 감지용 투명 오버레이 */}
                          <div 
                            className="fixed inset-0 z-[100]" 
                            onClick={() => setIsSortDropdownOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-32 py-1.5 z-[110] rounded-xl overflow-hidden shadow-2xl"
                            style={{
                              background: "rgba(15, 23, 42, 0.95)",
                              backdropFilter: "blur(20px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {[
                              { value: 'default', label: language === 'ko' ? '추천순' : 'Recommended' },
                              { value: 'name', label: language === 'ko' ? '이름순' : 'A-Z' },
                              { value: 'popular', label: language === 'ko' ? '인기순' : 'Popularity' },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  setSortBy(opt.value as any);
                                  setIsSortDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-[11px] font-black transition-colors"
                                style={{
                                  background: sortBy === opt.value ? "#2563eb" : "transparent",
                                  color: sortBy === opt.value ? "white" : "rgba(255,255,255,0.6)",
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
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
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
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
                                <h2 className="text-sm md:text-base font-[1000] tracking-tight" style={{ color: "#f8fafc", lineHeight: "1.2" }}>
                                  {selectedCategory === 'all' ? t.common.searchResult : categoryInfo[language]}
                                </h2>
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded-lg flex items-center justify-center min-w-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                                  style={{
                                    background: "#fff",
                                    color: theme.text,
                                    border: `1px solid ${theme.text}40`
                                  }}
                                >
                                  {filteredIngredients.length}
                                </span>
                              </div>
                              <p className="text-[8px] md:text-[9px] font-black uppercase mt-0.5" style={{ color: "#10b981", letterSpacing: "0.2em", lineHeight: "1" }}>
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


                      {/* 정렬 셀렉터 ✨ */}
                      <div className="relative">
                        <button
                          onClick={() => setIsMainSortDropdownOpen(!isMainSortDropdownOpen)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] md:text-[11px] font-black transition-all duration-300"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#94a3b8",
                          }}
                        >
                          <span className="whitespace-nowrap">
                            {sortBy === 'default' ? (language === 'ko' ? '추천순' : 'Recommended') :
                             sortBy === 'name' ? (language === 'ko' ? '이름순' : 'A-Z') :
                             (language === 'ko' ? '인기순' : 'Popularity')}
                          </span>
                          <ChevronDown
                            size={12}
                            className={cn("transition-transform duration-300 text-emerald-400", isMainSortDropdownOpen && "rotate-180")}
                            strokeWidth={3}
                          />
                        </button>

                        <AnimatePresence>
                          {isMainSortDropdownOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-[100]" 
                                onClick={() => setIsMainSortDropdownOpen(false)} 
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-32 py-1.5 z-[110] rounded-xl overflow-hidden shadow-2xl"
                                style={{
                                  background: "rgba(15, 23, 42, 0.95)",
                                  backdropFilter: "blur(20px)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                {[
                                  { value: 'default', label: language === 'ko' ? '추천순' : 'Recommended' },
                                  { value: 'name', label: language === 'ko' ? '이름순' : 'A-Z' },
                                  { value: 'popular', label: language === 'ko' ? '인기순' : 'Popularity' },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() => {
                                      setSortBy(opt.value as any);
                                      setIsMainSortDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-[11px] font-black transition-colors"
                                    style={{
                                      background: sortBy === opt.value ? "#2563eb" : "transparent",
                                      color: sortBy === opt.value ? "white" : "rgba(255,255,255,0.6)",
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
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
                      className="flex flex-col items-center justify-center py-12 px-8 text-center"
                    >
                      <div className="relative mb-8 group">
                        {/* 프리미엄 리어 글로우 (오로라 효과) - 일관성 유지 */}
                        <div className="absolute inset-0 bg-emerald-300 blur-[100px] opacity-30 rounded-full group-hover:scale-110 transition-transform duration-1000" />
                        
                        {/* 깜찍한 3D 포리 애니메이션 */}
                        <motion.div
                          className="relative z-10 w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Image
                            src="/images/pori.png"
                            alt="Pori Mascot"
                            width={180}
                            height={180}
                            className="w-full h-full object-contain"
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-3 max-w-sm mb-10">
                        <h3 className="text-xl md:text-2xl font-[1000] text-slate-800 tracking-tighter leading-tight">
                          {t.common.poriNoResult}
                        </h3>
                        <p className="text-slate-400 font-bold text-xs md:text-sm leading-relaxed opacity-90">
                          {t.common.poriNoResultSub}
                        </p>
                      </div>

                      {/* [신규] 대안 제안: 인기 성분 바로가기 */}
                      <div className="w-full max-w-md mx-auto mb-10">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                          <span className="h-px w-8 bg-slate-200" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maybe Try These?</span>
                          <span className="h-px w-8 bg-slate-200" />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {popularIngredients.slice(0, 4).map((ing) => (
                            <button
                              key={ing.id}
                              onClick={() => {
                                setInputValue(language === 'ko' ? ing.name : ing.name_en);
                                startTransition(() => setSearchQuery(language === 'ko' ? ing.name : ing.name_en));
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-slate-600 text-[10px] font-bold hover:border-emerald-300 hover:text-emerald-500 transition-all shadow-sm active:scale-95"
                            >
                              {ing.icon_emoji} {language === 'ko' ? ing.name : ing.name_en}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="">
                        <button
                          onClick={() => {
                            setInputValue("");
                            startTransition(() => setSearchQuery(""));
                            setSelectedCategory("all");
                          }}
                          className="group/btn relative px-8 h-12 rounded-full font-black text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #10b981 0%, #0891b2 100%)",
                            color: "white"
                          }}
                        >
                          <div className="relative flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4 group-hover/btn:rotate-180 transition-transform duration-700" />
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

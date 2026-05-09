"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBasketStore } from "@/store/basketStore";
import AnalysisResults from "@/components/AnalysisResults";
import ReportHeader from "@/components/analysis/ReportHeader";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { performAnalysis } from "@/lib/analysis";
import type { Ingredient } from "@/types/database";
import { cn, decodeShareParams } from "@/lib/utils";
import { UI_TRANSLATIONS } from "@/lib/i18n";

/**
 * 분석 결과 페이지 본체 (Suspense 대응을 위해 분리)
 */
function AnalysisContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { 
        analysisResult, 
        language, 
        setAnalyzing, 
        setHasResult, 
        setAnalysisResult,
        addIngredient,
        clearBasket
    } = useBasketStore();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const isFetchingRef = useRef(false); // 중복 호출 방지용 락 (Race Condition 해결 ✨)

    useEffect(() => {
        const handleSharedLink = async () => {
            if (isFetchingRef.current) return;

            const vParam = searchParams.get("v");
            const idsParam = searchParams.get("ids");
            const hasParams = !!(vParam || idsParam);

            // 1. 파라미터가 있는 경우: 현재 결과와 비교하여 다르면 새로 불러오기 ✨
            if (hasParams) {
                let targetSlugs: string[] = vParam ? decodeShareParams(vParam) : [];
                let targetIds: string[] = idsParam ? idsParam.split(",") : [];

                if (analysisResult) {
                    const currentSlugs = [...analysisResult.ingredients.map(i => i.slug)].sort();
                    const currentIds = [...analysisResult.ingredients.map(i => i.id)].sort();
                    
                    const isMatch = vParam 
                        ? JSON.stringify(currentSlugs) === JSON.stringify([...targetSlugs].sort())
                        : JSON.stringify(currentIds) === JSON.stringify([...targetIds].sort());

                    if (isMatch) {
                        setAnalyzing(false);
                        setHasResult(true);
                        setIsLoading(false);
                        return;
                    }
                }
                
                // 매치되지 않으면 로딩 시작
                setIsLoading(true);
                try {
                    // 모든 성분 데이터 가져오기
                    const { data: allIngs } = await supabase
                        .from("ingredients")
                        .select("*")
                        .order("sort_order", { ascending: true });

                    if (!allIngs) throw new Error("Failed to fetch ingredients");

                    const selectedIngs = (allIngs as Ingredient[]).filter(ing => {
                        if (targetSlugs.length > 0) return targetSlugs.includes(ing.slug);
                        if (targetIds.length > 0) return targetIds.includes(ing.id);
                        return false;
                    });
                    
                    if (selectedIngs.length >= 2) {
                        isFetchingRef.current = true;
                        setAnalyzing(true);

                        clearBasket();
                        selectedIngs.forEach(ing => addIngredient(ing));

                        const response = await fetch("/api/analyze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ingredient_ids: selectedIngs.map(i => i.id),
                                language
                            })
                        });
                        const result = await response.json();

                        if (result.success && result.data) {
                            setAnalysisResult(result.data);
                            setHasResult(true);
                        }
                        
                        isFetchingRef.current = false;
                        setAnalyzing(false);
                    } else {
                        setIsRedirecting(true);
                    }
                } catch (error) {
                    console.error("Error loading shared analysis:", error);
                    setIsRedirecting(true);
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // 2. 파라미터가 없는데 이미 결과가 있는 경우: 그대로 사용
            if (analysisResult) {
                setAnalyzing(false);
                setHasResult(true);
                setIsLoading(false);
                return;
            }

            // 3. 결과도 없고 파라미터도 없으면 홈으로
            setIsRedirecting(true);
        };

        handleSharedLink();
    }, [analysisResult, searchParams, language, setAnalyzing, setHasResult, setAnalysisResult, clearBasket, addIngredient]);

    useEffect(() => {
        if (isRedirecting) {
            const timer = setTimeout(() => {
                router.push("/");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isRedirecting, router]);

    // 로딩 중이거나 리다이렉트 중일 때 보여줄 화면
    if (isLoading || isRedirecting) {
        const t = UI_TRANSLATIONS[language as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS.ko;
        
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="relative w-20 h-20 mx-auto">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent"
                        />
                        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="text-emerald-500 animate-spin" size={32} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h2 className={cn(
                            "text-xl md:text-2xl font-[1000] text-white tracking-tight leading-tight",
                            (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                        )}>
                            {isRedirecting ? t.loading.redirectTitle : t.loading.title}
                        </h2>
                        <p className={cn(
                            "text-slate-400 text-sm md:text-base font-bold bg-white/5 py-2 px-4 rounded-xl border border-white/5",
                            (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                        )}>
                            {isRedirecting ? t.loading.redirectSubtitle : t.loading.subtitle}
                        </p>
                        
                        {/* Dynamic AI Protocol Logs ✨ */}
                        {!isRedirecting && (
                            <div className="flex flex-col items-center gap-1.5 pt-2">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1] }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em] font-mono">
                                        {t.loading.protocol}
                                    </span>
                                </motion.div>
                                <div className="flex flex-col items-start gap-1 font-mono text-[9px] text-slate-500/60 font-bold">
                                    {t.loading.logs.map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.8, repeat: Infinity, repeatDelay: 3 }}
                                        >
                                            {">"} {log}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!analysisResult) return null;

    return (
        <main className="min-h-screen bg-[#030712] selection:bg-emerald-500/30 overflow-x-hidden">
            <ReportHeader />
            <motion.div
                className="pt-12 md:pt-16"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <AnalysisResults result={analysisResult} />
            </motion.div>
        </main>
    );
}

/**
 * 분석 결과 페이지 (/analysis)
 * Suspense로 감싸 useSearchParams 사용 가능하게 처리
 */
export default function AnalysisClient() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-emerald-500 animate-spin" size={32} />
            </div>
        }>
            <AnalysisContent />
        </Suspense>
    );
}

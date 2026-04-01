"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBasketStore } from "@/store/basketStore";
import AnalysisResults from "@/components/AnalysisResults";
import ReportHeader from "@/components/analysis/ReportHeader";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { performAnalysis } from "@/lib/analysis";
import type { Ingredient } from "@/types/database";

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
    
    const [isLoading, setIsLoading] = useState(!analysisResult);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const handleSharedLink = async () => {
            const idsParam = searchParams.get("ids");
            
            // 1. 이미 결과가 있는 경우 (정상 진입)
            if (analysisResult) {
                setAnalyzing(false);
                setHasResult(true);
                setIsLoading(false);
                return;
            }

            // 2. 공유 링크를 통해 들어온 경우 (?ids=...)
            if (idsParam) {
                const ids = idsParam.split(",");
                setIsLoading(true);

                try {
                    // 모든 성분 데이터 가져오기 (추천 로직용)
                    const { data: allIngs } = await supabase
                        .from("ingredients")
                        .select("*")
                        .order("sort_order", { ascending: true });

                    if (!allIngs) throw new Error("Failed to fetch ingredients");

                    // 링크에 포함된 성분들 필터링
                    const selectedIngs = (allIngs as Ingredient[]).filter(ing => ids.includes(ing.id));
                    
                    if (selectedIngs.length >= 2) {
                        // 바구니 업데이트 (공유받은 리스트로 교체)
                        clearBasket();
                        selectedIngs.forEach(ing => addIngredient(ing));

                        // 분석 실행
                        const result = await performAnalysis(selectedIngs, language, allIngs as Ingredient[]);
                        if (result) {
                            setAnalysisResult(result);
                            setHasResult(true);
                        }
                    } else {
                        // 성분이 부족하면 홈으로
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

            // 3. 결과도 없고 공유 링크도 아니면 홈으로 리다이렉트
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
                        <h2 className="text-xl md:text-2xl font-[1000] text-white tracking-tight leading-tight">
                            {isRedirecting 
                                ? (language === 'ko' ? '데이터를 찾을 수 없어요!' : 'Data not found!')
                                : (language === 'ko' ? '분석 결과를 불러오는 중...' : 'Loading analysis results...')
                            }
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base font-bold bg-white/5 py-2 px-4 rounded-xl border border-white/5">
                            {isRedirecting 
                                ? (language === 'ko' ? '대표님, 홈 스크린에서 다시 시작해 볼까요? ✨' : 'Shall we start again from the home screen? ✨')
                                : (language === 'ko' ? 'Pori AI가 조합을 정밀 분석하고 있어요. 잠시만 기다려주세요!' : 'Pori AI is precisely analyzing your combination. Just a moment!')
                            }
                        </p>
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
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
export default function AnalysisPage() {
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

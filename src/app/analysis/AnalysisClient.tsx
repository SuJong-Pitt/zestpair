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
import { decodeShareParams } from "@/lib/utils";

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
            // 1. 이미 결과가 있거나 요청 중이면 중복 실행 방지
            if (analysisResult || isFetchingRef.current) {
                setAnalyzing(false);
                setHasResult(true);
                setIsLoading(false);
                return;
            }

            // 2. 공유 링크를 통해 들어온 경우 (?v=... 또는 ?ids=...)
            const vParam = searchParams.get("v");
            const idsParam = searchParams.get("ids");
            
            if (vParam || idsParam) {
                setIsLoading(true);
                let selectedSlugs: string[] = [];
                let selectedIds: string[] = [];

                if (vParam) {
                    selectedSlugs = decodeShareParams(vParam);
                } else if (idsParam) {
                    selectedIds = idsParam.split(",");
                }

                try {
                    // 모든 성분 데이터 가져오기 (추천 로직용)
                    const { data: allIngs } = await supabase
                        .from("ingredients")
                        .select("*")
                        .order("sort_order", { ascending: true });

                    if (!allIngs) throw new Error("Failed to fetch ingredients");

                    // 링크에 포함된 성분들 필터링 (슬러그 또는 ID 기준)
                    const selectedIngs = (allIngs as Ingredient[]).filter(ing => {
                        if (selectedSlugs.length > 0) return selectedSlugs.includes(ing.slug);
                        if (selectedIds.length > 0) return selectedIds.includes(ing.id);
                        return false;
                    });
                    
                    if (selectedIngs.length >= 2) {
                        // 로딩 시작 및 락 걸기
                        isFetchingRef.current = true;
                        setAnalyzing(true);

                        // 바구니 업데이트 (공유받은 리스트로 교체)
                        clearBasket();
                        selectedIngs.forEach(ing => addIngredient(ing));

                        // 분석 실행 (서버 사이드 API 호출)
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
                                        Establishing Protocol...
                                    </span>
                                </motion.div>
                                <div className="flex flex-col items-start gap-1 font-mono text-[9px] text-slate-500/60 font-bold">
                                    {[
                                        "MATCHING SYNERGY VECTORS...",
                                        "CALCULATING BIO-AVAILABILITY...",
                                        "DECODING CHEMICAL INTERACTIONS..."
                                    ].map((log, i) => (
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

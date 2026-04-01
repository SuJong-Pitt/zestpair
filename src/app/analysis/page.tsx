"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBasketStore } from "@/store/basketStore";
import AnalysisResults from "@/components/AnalysisResults";
import ReportHeader from "@/components/analysis/ReportHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * 분석 결과 전용 페이지 (/analysis)
 * 
 * - Zustand 스토어에서 직접 결과를 읽어와 렌더링
 * - 결과가 없거나(새로고침 등) 잘못된 접근 시 홈(/)으로 리다이렉트
 * - 영자 실장의 감각을 담아 부드러운 로딩 연출
 */
export default function AnalysisPage() {
    const router = useRouter();
    const { analysisResult, language, setAnalyzing, setHasResult } = useBasketStore();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // 대표님, 이제 결과 페이지가 떴으니 분석 오버레이를 자연스럽게 걷어낼게요! ✨
        if (analysisResult) {
            setAnalyzing(false);
            setHasResult(true);
        }

        // 분석 결과가 없으면 메인으로 튕겨냄
        if (!analysisResult) {
            setIsRedirecting(true);
            const timer = setTimeout(() => {
                router.push("/");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [analysisResult, router]);

    // 결과가 없을 때 보여줄 안내 화면 (영자's 트랜지션)
    if (isRedirecting || !analysisResult) {
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
                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-black text-white">
                            {language === 'ko' ? '분석 데이터를 찾을 수 없어요!' : 'Analysis data not found!'}
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base font-medium">
                            {language === 'ko' 
                                ? '대표님, 홈 스크린에서 분석을 다시 시작해 볼까요? ✨' 
                                : 'Representative, shall we start the analysis again from home? ✨'}
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

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

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, RefreshCcw } from "lucide-react";
import { encodeShareParams, getKakaoShareDetails } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import type { AnalysisResult, CoupangProduct } from "@/types/database";
import SynergyCard from "./SynergyCard";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Optimized modular components
import InteractionCard from "./analysis/InteractionCard";
import Toast from "./ui/Toast";
import OptimizedScoreSection from "./analysis/OptimizedScoreSection";
import SynergyOptimizer from "./analysis/SynergyOptimizer";
import ScientificEvidence from "./analysis/ScientificEvidence";

interface AnalysisResultsProps {
    result: AnalysisResult;
    coupangProducts?: CoupangProduct[];
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
    const router = useRouter();
    const { language, clearBasket } = useBasketStore();
    const t = UI_TRANSLATIONS[language];
    const isMobile = useMediaQuery("(max-width: 768px)");
    
    const [toast, setToast] = useState({ show: false, message: "" });
    const [isExiting, setIsExiting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 인게이지먼트 공유 데이터 메모이제이션
    const shareData = useMemo(() => {
        if (!result || !result.ingredients) return null;
        const slugs = result.ingredients.map(ing => ing.slug);
        const encoded = encodeShareParams(slugs);
        const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
        const canonicalBase = isLocal ? window.location.origin : "https://zestpair.com";
        const shareUrl = `${canonicalBase}/analysis?v=${encoded}`;
        
        return { shareUrl, score: result.score };
    }, [result]);

    const handleKakaoShare = useCallback(() => {
        if (!shareData) return;
        const { shareUrl, score } = shareData;
        const { imageFileName, title, description } = getKakaoShareDetails(score, language);
        const imageBase = "https://zestpair.com";
        const targetImageUrl = `${imageBase}/images/share/${imageFileName}`;

        if (typeof window !== "undefined" && (window as any).Kakao) {
            const Kakao = (window as any).Kakao;
            try {
                if (!Kakao.isInitialized()) Kakao.init("27a049c799662857ed882c2639461392");
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title, description, imageUrl: targetImageUrl,
                        imageWidth: 800, imageHeight: 800,
                        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                    },
                    buttons: [{
                        title: language === 'ko' ? '내 영양제 궁합 점수' : 'My Supplement Score',
                        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                    }],
                });
            } catch (err) { console.error(err); }
        }
    }, [shareData, language]);

    const handleNativeShare = useCallback(async () => {
        if (!shareData) return;
        const { shareUrl, score } = shareData;
        const { title } = getKakaoShareDetails(score, language);

        const data = { title: "ZestPair", text: title, url: shareUrl };

        if (navigator.share) {
            try { await navigator.share(data); } catch (err) {}
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setToast({ show: true, message: language === 'ko' ? "링크가 복사되었습니다!" : "Link copied!" });
                setTimeout(() => setToast({ show: false, message: "" }), 3000);
            } catch (err) {}
        }
    }, [shareData, language]);

    const allInteractions = useMemo(() => {
        return [
            ...result.synergies,
            ...result.cautions,
            ...result.conflicts,
        ].filter((r): r is any => !!(r && r.interaction));
    }, [result.synergies, result.cautions, result.conflicts]);

    const handleReset = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            router.push("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => clearBasket(), 200);
        }, 400);
    }, [router, clearBasket]);

    if (!result || !result.ingredients || !isMounted) {
        return <div className="p-20 text-center text-slate-400">{t.common.loading}...</div>;
    }

    return (
        <div className="relative min-h-screen bg-slate-950 w-full font-sans text-slate-200 selection:bg-emerald-500/30">
            {/* Background Blobs (Static decoration) */}
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    y: isExiting ? 40 : 0,
                    scale: isExiting ? 0.98 : 1
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Content Container */}
                <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-24">
                    <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-3 md:p-10 space-y-8 md:space-y-16">

                        {/* 0. Report Header */}
                        <div id="analysis-report-top" className="flex flex-col items-center gap-2 pt-4 pb-0">
                            <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center gap-2.5 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl"
                            >
                                <Sparkles size={12} className="text-emerald-400" />
                                <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 pt-0.5 whitespace-nowrap">
                                    {language === 'ko' ? 'Analysis Protocol' : 'Analysis Report'}
                                </h2>
                            </motion.div>
                            <div className="w-px h-2 bg-gradient-to-b from-emerald-500/30 to-transparent" />
                        </div>

                        {/* 1. Score Summary (Optimized & Memoized) */}
                        <OptimizedScoreSection 
                            result={result}
                            language={language}
                            t={t}
                            isMobile={isMobile}
                            handleKakaoShare={handleKakaoShare}
                            handleNativeShare={handleNativeShare}
                        />

                        {/* 2. Interaction Details */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                    {t.results.matrixTitle}
                                </h3>
                                <Badge variant="outline" className="rounded-lg px-3 py-1.5 border-white/10 text-slate-300 font-bold bg-white/5">
                                    {allInteractions.length}{language === "ko" ? "건의 분석결과" : " Results"}
                                </Badge>
                            </div>

                            {allInteractions.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {allInteractions.map((r, idx) => (
                                        <SynergyCard key={r.interaction.id || idx} result={r} index={idx} />
                                    ))}
                                </div>
                            ) : (
                                <InteractionCard language={language} t={t} />
                            )}
                        </div>

                        {/* 3. Synergy Optimization (Extracted) */}
                        <SynergyOptimizer result={result} language={language} />

                        {/* 4. Scientific Evidence (Extracted) */}
                        <ScientificEvidence result={result} language={language} />
                    </div>

                    {/* 5. Footer Actions */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="pt-20 pb-12 flex flex-col items-center gap-6 relative z-10"
                    >
                        <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
                            {language === 'ko' ? '다른 영양제도 궁금하신가요?' : 'Curious about other combinations?'}
                        </p>
                        <button
                            onClick={handleReset}
                            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/10"
                        >
                            <RefreshCcw size={18} className="text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
                            <span className="text-xs md:text-sm font-black text-white/90 uppercase tracking-widest">
                                {language === 'ko' ? '새로운 조합 분석하기' : 'Analyze New Combination'}
                            </span>
                        </button>
                    </motion.div>
                </main>
            </motion.div>

            <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
}

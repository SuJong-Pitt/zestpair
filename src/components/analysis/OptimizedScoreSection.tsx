"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Info, Share2, ArrowRight, TrendingUp, ShoppingCart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import ScoreRing from "./ScoreRing";
import ReportSummary from "./ReportSummary";
import type { AnalysisResult } from "@/types/database";

interface OptimizedScoreSectionProps {
    result: AnalysisResult;
    language: string;
    t: any;
    isMobile: boolean;
    handleKakaoShare: () => void;
    handleNativeShare: () => void;
}

const OptimizedScoreSection = memo(function OptimizedScoreSection({
    result,
    language,
    t,
    isMobile,
    handleKakaoShare,
    handleNativeShare
}: OptimizedScoreSectionProps) {
    const isKo = language === 'ko';

    const scrollTarget = () => {
        const element = document.getElementById('synergy-optimizer-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // 점수 산정 근거 계산 로직 메모이제이션
    const scoreRationale = useMemo(() => {
        const synergyScore = result.synergies.length * 20;
        const basisScore = 70 + Math.max(0, (result.ingredients.length - 2) * 10);
        const penalties = (result.score - (synergyScore + basisScore));
        const isHighEnd = result.score >= 85;

        return { synergyScore, basisScore, penalties, isHighEnd };
    }, [result.score, result.synergies.length, result.ingredients.length]);

    // 수익화 전환을 위한 시너지 브릿지 데이터
    const synergyBridge = useMemo(() => {
        if (!result.potentialSynergy) return null;
        const targetPartner = result.potentialSynergy.pair[1];
        const currentScore = result.score;
        const nextScore = Math.max(currentScore, result.projectedScore || currentScore);
        
        const isAlreadyPerfect = currentScore >= 100;
        const isNextPerfect = nextScore >= 100;

        let bridgeText = isKo ? `${nextScore}점 달성하기` : `Reach ${nextScore} pts`;
        
        if (isAlreadyPerfect) {
            bridgeText = isKo ? "완벽 그 이상의 시너지" : "Beyond Perfection";
        } else if (isNextPerfect) {
            bridgeText = isKo ? "100점 만점 도전" : "Ultimate 100 Pts";
        }

        return {
            name: isKo ? targetPartner.name : targetPartner.name_en,
            score: nextScore,
            emoji: targetPartner.icon_emoji,
            bridgeText
        };
    }, [result.potentialSynergy, result.score, result.projectedScore, isKo]);

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500 rounded-[3rem] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>

            <div className="relative rounded-[2.5rem] bg-slate-900/80 border border-white/10 backdrop-blur-2xl text-white overflow-hidden">
                <CardContent className="px-3 py-6 sm:p-5 md:p-10 relative z-10 flex flex-col items-center text-center">
                    
                    {/* Potential Synergy Bridge (Hot Funnel 🔥) */}
                    {synergyBridge && (
                        <motion.button
                            onClick={scrollTarget}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="absolute top-6 md:top-10 right-6 md:right-10 flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl z-20 group/bridge"
                        >
                            <div className="relative">
                                <span className="text-lg md:text-xl">{synergyBridge.emoji}</span>
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"
                                />
                            </div>
                            <div className="flex flex-col items-start leading-none gap-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Next Level</span>
                                    <ArrowRight size={10} className="text-emerald-400" />
                                </div>
                                <span className="text-[14px] font-[1000] text-white tracking-tighter">
                                    {synergyBridge.bridgeText}
                                </span>
                            </div>
                        </motion.button>
                    )}

                    {/* Score Gauge Section */}
                    <div className="relative mb-2">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <ScoreRing score={result.score} size={isMobile ? 180 : 260} />
                        </motion.div>
                        
                        {/* Interactive Hint for Bridge */}
                        {synergyBridge && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-widest">{isKo ? "시너지 해결책 발견" : "Synergy Solution Found"}</p>
                                    <motion.div 
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowRight size={16} className="text-emerald-500 rotate-90" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* AI Badge */}
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-4 mt-6"
                    >
                        <Sparkles size={10} className="text-indigo-300" />
                        <span className="text-[8px] md:text-[9px] font-black text-indigo-100 uppercase tracking-[0.2em]">AI Precision Analysis</span>
                    </motion.div>

                    {/* Title & Motivation */}
                    <div className="mb-4 space-y-1">
                        <motion.h2
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="text-2xl md:text-4xl font-[1000] tracking-tighter leading-none text-white"
                        >
                            {result.score >= 90 ? t.results.synergy : result.score >= 70 ? (isKo ? "좋은 조합입니다!" : "Great Match!") : result.score >= 40 ? t.results.caution : t.results.conflict}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-sm md:text-base font-black text-emerald-400/90 tracking-tight"
                        >
                            {result.score >= 90 ? t.results.bestMix : result.score >= 70 ? (isKo ? "서로의 효능을 보완하는 구성" : "Ingredients complement each other") : result.score >= 40 ? t.results.potentialConflict : t.results.dangerous}
                        </motion.p>
                    </div>

                    {/* Summary Box */}
                    <ReportSummary result={result} className="w-full max-w-2xl mb-4" />

                    {/* My Selected Stack — Direction Z: Score Contribution + CTA Cards */}
                    <div className="w-full max-w-2xl mb-8 pt-6 border-t border-white/[0.04] space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-1 mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                    <TrendingUp size={13} className="text-emerald-400" />
                                </div>
                                <h5 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {isKo ? "내 성분 스택 — 구매 가이드" : "My Stack — Purchase Guide"}
                                </h5>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Sparkles size={9} className="text-emerald-400" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">
                                    {result.ingredients.length} {isKo ? "개 AI 검증" : "AI Verified"}
                                </span>
                            </div>
                        </div>

                        {/* Ingredient Cards */}
                        {result.ingredients.map((ing, i) => {
                            // 점수 기여도 정밀 계산 (AI Precision)
                            // 1. 기초 점수를 성분 수로 나눔
                            const baseContrib = scoreRationale.basisScore / result.ingredients.length;
                            // 2. 시너지 참여당 10점 추가 (시너지 1개당 총점 20점 증가하므로 인당 10점)
                            const synergyCount = result.synergies.filter(
                                s => s.pair[0].id === ing.id || s.pair[1].id === ing.id
                            ).length;
                            const synergyBonus = synergyCount * 10;
                            // 3. 페널티/보정치 배분
                            const penaltyAdj = scoreRationale.penalties / result.ingredients.length;
                            
                            const scoreContrib = Math.round(baseContrib + synergyBonus + penaltyAdj);

                            // 역할 라벨
                            const roleLabel = (() => {
                                if (synergyCount >= 2) return isKo ? "핵심 시너지 성분" : "Core Synergy";
                                if (synergyCount === 1) return isKo ? "보완 역할" : "Complement";
                                return isKo ? "기초 지원 성분" : "Foundation";
                            })();

                            // AI 브리핑에서 해당 성분 언급 문장 추출 (1문장)
                            const ingName = isKo ? ing.name : (ing.name_en || ing.name);
                            const briefingHint = result.ai_briefing?.find(b =>
                                b.includes(isKo ? ing.name : (ing.name_en || ing.name))
                            );
                            const hintSentence = briefingHint
                                ? briefingHint.split(/[.。]/).find(s => s.includes(ingName))?.trim()
                                : null;

                            const purchaseUrl = isKo
                                ? (ing.coupang_url || `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.name)}`)
                                : (ing.amazon_url || `https://www.amazon.com/s?k=${encodeURIComponent(ing.name_en || ing.name)}`);

                            const storeLabel = isKo ? "쿠팡 로켓배송" : "Amazon";
                            const storeIcon = isKo ? "🚀" : "📦";

                            return (
                                <motion.div
                                    key={ing.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.08 }}
                                    className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5 group/card hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300"
                                >
                                    {/* Left accent */}
                                    <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-emerald-400/40 group-hover/card:bg-emerald-400/80 transition-colors" />

                                    <div className="pl-3 flex flex-col gap-3">
                                        {/* Top row: emoji + name + score contribution */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <span className="text-2xl md:text-3xl">{ing.icon_emoji}</span>
                                                    <motion.div
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                                                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400/60 blur-[2px]"
                                                    />
                                                </div>
                                                <div className="flex flex-col items-start leading-tight">
                                                    <span className="text-[15px] md:text-[17px] font-black text-white">
                                                        {ingName}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                            {ing.category}
                                                        </span>
                                                        <span className="text-[8px] text-slate-600">·</span>
                                                        <span className="text-[8px] font-black text-emerald-400/80 uppercase tracking-wide">
                                                            {roleLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score contribution badge */}
                                            <div className="shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                <span className="text-[18px] md:text-[22px] font-[1000] text-emerald-400 leading-none">+{scoreContrib}</span>
                                                <span className="text-[7px] font-black text-emerald-400/60 uppercase tracking-wider">{isKo ? "점 기여" : "pts"}</span>
                                            </div>
                                        </div>

                                        {/* AI insight hint */}
                                        {hintSentence && hintSentence.length > 5 && (
                                            <p className="text-[11px] md:text-[12px] text-slate-400 leading-relaxed border-l-2 border-emerald-500/20 pl-3 italic">
                                                "{hintSentence}"
                                            </p>
                                        )}

                                        {/* CTA Button */}
                                        <a
                                            href={purchaseUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all group/btn active:scale-95"
                                        >
                                            <div className="flex items-center gap-2">
                                                <ShoppingCart size={13} className="text-emerald-400" />
                                                <span className="text-[11px] md:text-[12px] font-black text-emerald-300">
                                                    {storeIcon} {storeLabel}{isKo ? "으로 구매" : " — Best Price"}
                                                </span>
                                            </div>
                                            <ExternalLink size={11} className="text-emerald-400/50 group-hover/btn:text-emerald-300 transition-colors" />
                                        </a>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Score Rationale Breakdown */}
                    <div className={cn(
                        "w-full max-w-2xl mb-10 p-4 sm:p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-md transition-all duration-700",
                        scoreRationale.isHighEnd 
                            ? "bg-yellow-500/[0.03] border border-yellow-500/20 shadow-[0_20px_50px_-20px_rgba(251,191,36,0.15)]" 
                            : "bg-white/[0.03] border border-white/10 shadow-xl md:shadow-2xl"
                    )}>
                        <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                            <div className="flex items-center gap-2">
                                <Info size={12} className={scoreRationale.isHighEnd ? "text-yellow-500/50" : "text-slate-500"} />
                                <h5 className={cn(
                                    "text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-[0.2em]",
                                    scoreRationale.isHighEnd ? "text-yellow-500/70" : "text-slate-500"
                                )}>
                                    {isKo ? "과학적 정밀 분석 지표" : "Precision Analysis Metrics"}
                                </h5>
                            </div>
                            <div className={cn("h-px flex-1 ml-4", scoreRationale.isHighEnd ? "bg-yellow-500/10" : "bg-white/5")} />
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-4">
                            <div className="flex flex-col items-center gap-1 md:gap-1.5">
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tight sm:tracking-[0.2em] text-center leading-tight">Synergy</span>
                                <span className="text-xl sm:text-2xl md:text-3xl font-[1000] text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">+{scoreRationale.synergyScore}</span>
                            </div>
                            <div className={cn("flex flex-col items-center gap-1 md:gap-1.5 border-x", scoreRationale.isHighEnd ? "border-yellow-500/10" : "border-white/5")}>
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tight sm:tracking-[0.2em] text-center leading-tight">Foundation</span>
                                <span className="text-xl sm:text-2xl md:text-3xl font-[1000] text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">+{scoreRationale.basisScore}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 md:gap-1.5">
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tight sm:tracking-[0.2em] text-center leading-tight">Risk Factor</span>
                                <span className={cn("text-xl sm:text-2xl md:text-3xl font-[1000]", scoreRationale.penalties < 0 ? "text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]" : "text-slate-600")}>
                                    {scoreRationale.penalties < 0 ? scoreRationale.penalties : 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl mb-12 px-4">
                        <Button
                            onClick={handleKakaoShare}
                            className="h-12 md:h-14 rounded-2xl bg-[#FEE500] text-[#3A1D1D] font-[1000] border border-[#FEE500]/30 hover:bg-[#FEE500]/90 transition-all px-8 shadow-xl shadow-yellow-500/5 active:scale-95"
                        >
                            <div className="flex items-center gap-2.5 text-[13px] md:text-sm tracking-tight">
                                <img src="/icons/kakao.svg" className="w-5 h-5 md:w-6 md:h-6" alt="K" />
                                <span>Kakao Talk</span>
                            </div>
                        </Button>
                        <Button
                            onClick={handleNativeShare}
                            variant="outline"
                            className="h-12 md:h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-[1000] px-8 active:scale-95 text-[13px] md:text-sm tracking-widest uppercase"
                        >
                            <Share2 size={16} className="mr-2.5 opacity-60" />
                            COPY LINK
                        </Button>
                    </div>

                </CardContent>
            </div>
        </div>
    );
});

export default OptimizedScoreSection;

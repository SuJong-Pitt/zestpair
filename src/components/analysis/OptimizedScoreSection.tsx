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

                    {/* Synergy Jackpot (Premium Highlight) ✨ */}
                    {result.synergy_jackpot && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="w-full max-w-2xl mb-8 p-0.5 rounded-[2rem] bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)] group/jackpot"
                        >
                            <div className="bg-slate-900/90 backdrop-blur-xl rounded-[1.95rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/jackpot:opacity-20 transition-opacity">
                                    <Sparkles size={80} className="text-yellow-500" />
                                </div>
                                
                                <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-[2.5rem] bg-yellow-500/10 border border-yellow-500/20 flex flex-col items-center justify-center relative">
                                    <span className="text-3xl md:text-4xl mb-1">🎰</span>
                                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">Jackpot</span>
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -inset-2 rounded-[3rem] border border-yellow-500/30 blur-[2px]"
                                    />
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Today's Best Pair</span>
                                        <h4 className="text-xl md:text-2xl font-[1000] text-white tracking-tight">
                                            {result.synergy_jackpot.pair_names}
                                        </h4>
                                    </div>
                                    <p className="text-sm md:text-base font-bold text-slate-300 leading-relaxed break-keep">
                                        {result.synergy_jackpot.reason}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

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
                            const briefingHintStr = result.ai_briefing?.map(b => typeof b === 'string' ? b : `${b.headline} ${b.details}`).find(b => b.includes(ingName));
                            const hintSentence = briefingHintStr
                                ? briefingHintStr.split(/[.。]/).find((s: string) => s.includes(ingName))?.trim()
                                : null;

                            const purchaseUrl = isKo
                                ? (ing.coupang_url || `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.name)}`)
                                : (ing.amazon_url || `https://www.amazon.com/s?k=${encodeURIComponent(ing.name_en || ing.name)}`);

                            const storeLabel = isKo ? "쿠팡 로켓배송" : "Amazon";
                            const storeIcon = isKo ? "🚀" : "📦";

                            return (
                                <motion.div
                                    key={ing.id}
                                    initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: [0.22,1,0.36,1] }}
                                    className="group/card relative overflow-hidden rounded-[1.8rem] transition-all duration-400"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02), rgba(15,23,42,0.8))',
                                        border: '1px solid rgba(52,211,153,0.18)',
                                        boxShadow: '0 15px 40px -15px rgba(0,0,0,0.5)'
                                    }}
                                    whileHover={{ scale: 1.01, boxShadow: '0 20px 60px -15px rgba(52,211,153,0.2)' }}
                                >
                                    {/* Sweep shine on hover */}
                                    <motion.div
                                        animate={{ x: ['-200%', '200%'] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12 pointer-events-none"
                                    />
                                    {/* Left accent bar */}
                                    <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-300"
                                        style={{ background: 'linear-gradient(180deg, #34d399, rgba(52,211,153,0.2))' }} />
                                    {/* Top gradient line */}
                                    <div className="absolute top-0 left-0 right-0 h-px"
                                        style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)' }} />

                                    <div className="pl-5 pr-4 py-4 md:py-5 flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                                    <span className="text-2xl">{ing.icon_emoji}</span>
                                                    <motion.div
                                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}
                                                        className="absolute inset-0 rounded-2xl"
                                                        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.3), transparent)' }}
                                                    />
                                                </div>
                                                <div className="flex flex-col items-start leading-tight">
                                                    <span className="text-[15px] md:text-[17px] font-black text-white tracking-tight">
                                                        {ingName}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                            {ing.category}
                                                        </span>
                                                        <span className="text-[8px] text-slate-700">·</span>
                                                        <span className="text-[8px] font-black uppercase tracking-wide"
                                                            style={{ color: synergyCount >= 2 ? '#34d399' : synergyCount === 1 ? '#60a5fa' : '#64748b' }}>
                                                            {roleLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score badge - premium */}
                                            <div className="shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl"
                                                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', boxShadow: '0 4px 20px -4px rgba(52,211,153,0.2)' }}>
                                                <span className="text-[20px] md:text-[24px] font-[1000] leading-none"
                                                    style={{ color: '#34d399', textShadow: '0 0 12px rgba(52,211,153,0.5)' }}>+{scoreContrib}</span>
                                                <span className="text-[7px] font-black text-emerald-400/60 uppercase tracking-wider mt-0.5">{isKo ? "점 기여" : "pts"}</span>
                                            </div>
                                        </div>

                                        {hintSentence && hintSentence.length > 5 && (
                                            <p className="text-[11px] md:text-[12px] text-slate-400 leading-relaxed pl-3 italic"
                                                style={{ borderLeft: '2px solid rgba(52,211,153,0.25)' }}>
                                                &ldquo;{hintSentence}&rdquo;
                                            </p>
                                        )}

                                        {/* CTA */}
                                        <a
                                            href={purchaseUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl transition-all group/btn active:scale-95"
                                            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(52,211,153,0.18)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(52,211,153,0.4)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(52,211,153,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(52,211,153,0.18)'; }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ShoppingCart size={13} className="text-emerald-400" />
                                                <span className="text-[11px] md:text-[12px] font-black text-emerald-300">
                                                    {storeIcon} {storeLabel}{isKo ? "으로 구매" : " — Best Price"}
                                                </span>
                                            </div>
                                            <ExternalLink size={11} className="text-emerald-400/50" />
                                        </a>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Score Rationale Breakdown - Luxury */}
                    <div className="w-full max-w-2xl mb-10 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] relative"
                        style={{
                            background: scoreRationale.isHighEnd
                                ? 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.02))'
                                : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                            border: scoreRationale.isHighEnd ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: scoreRationale.isHighEnd ? '0 20px 60px -20px rgba(251,191,36,0.15)' : '0 20px 60px -20px rgba(0,0,0,0.4)'
                        }}>
                        {/* Top glow line */}
                        <div className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: scoreRationale.isHighEnd ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                        <div className="p-4 sm:p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-5 md:mb-6">
                                <Info size={11} style={{ color: scoreRationale.isHighEnd ? 'rgba(251,191,36,0.5)' : '#475569' }} />
                                <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]"
                                    style={{ color: scoreRationale.isHighEnd ? 'rgba(251,191,36,0.7)' : '#475569' }}>
                                    {isKo ? "과학적 정밀 분석 지표" : "Precision Analysis Metrics"}
                                </h5>
                                <div className="h-px flex-1 ml-2"
                                    style={{ background: scoreRationale.isHighEnd ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)' }} />
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                {[
                                    { label: 'Synergy', value: `+${scoreRationale.synergyScore}`, color: '#34d399', glow: 'rgba(52,211,153,0.3)' },
                                    { label: 'Foundation', value: `+${scoreRationale.basisScore}`, color: '#60a5fa', glow: 'rgba(96,165,250,0.3)', bordered: true },
                                    { label: 'Risk Factor', value: scoreRationale.penalties < 0 ? String(scoreRationale.penalties) : '0', color: scoreRationale.penalties < 0 ? '#fb7185' : '#334155', glow: scoreRationale.penalties < 0 ? 'rgba(251,113,133,0.3)' : 'transparent' },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 md:gap-2 py-2 relative"
                                        style={{ borderRight: item.bordered ? (scoreRationale.isHighEnd ? '1px solid rgba(251,191,36,0.1)' : '1px solid rgba(255,255,255,0.05)') : 'none',
                                                 borderLeft: item.bordered ? (scoreRationale.isHighEnd ? '1px solid rgba(251,191,36,0.1)' : '1px solid rgba(255,255,255,0.05)') : 'none' }}>
                                        <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] text-center leading-tight">{item.label}</span>
                                        <span className="text-xl sm:text-2xl md:text-3xl font-[1000]"
                                            style={{ color: item.color, filter: `drop-shadow(0 0 12px ${item.glow})` }}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
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

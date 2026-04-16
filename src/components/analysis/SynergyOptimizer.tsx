"use client";

import { memo, useMemo, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Sparkles, ArrowRight, ShoppingCart, FlaskConical, TrendingUp, AlertCircle, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/database";

// --- High-End HUD Component for Synergy Visualization ---
const SynergyHUD = memo(function SynergyHUD({
    score,
    initialScore,
    isTarget = false,
    isPerfect = false,
    label
}: {
    score: number;
    initialScore?: number;
    isTarget?: boolean;
    isPerfect?: boolean;
    label: string;
}) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;

    // Counter animation for the numeric score - Use useState for maximum React compatibility
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        const animation = animate(0, score, {
            duration: 2,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayScore(Math.round(latest))
        });
        return animation.stop;
    }, [score]);

    const colors = isPerfect
        ? { main: "#fbbf24", glow: "rgba(251,191,36,0.5)", bg: "rgba(251,191,36,0.05)" }
        : isTarget
            ? { main: "#10b981", glow: "rgba(16,185,129,0.5)", bg: "rgba(16,185,129,0.05)" }
            : { main: "#94a3b8", glow: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.02)" };

    return (
        <div className="relative flex flex-col items-center justify-center p-6 md:p-8 rounded-[3rem] w-full max-w-[260px] md:max-w-[320px] transition-all duration-700 group/hud overflow-hidden"
            style={{
                background: "radial-gradient(140% 140% at 50% 10%, rgba(15,23,42,0.8) 0%, rgba(2,6,23,1) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 60px -15px rgba(0,0,0,0.8)"
            }}>

            {/* HUD Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
                <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] opacity-20", isPerfect ? "bg-amber-500" : isTarget ? "bg-emerald-500" : "bg-slate-500")} />
            </div>

            {/* Top Badge */}
            <div className={cn(
                "relative z-10 flex items-center gap-2 px-3 py-1 mb-6 rounded-full border backdrop-blur-md transition-all duration-500",
                isPerfect ? "bg-amber-950/40 border-amber-500/30" : isTarget ? "bg-emerald-950/40 border-emerald-500/30" : "bg-slate-800/60 border-slate-700/50"
            )}>
                <Activity size={10} className={isPerfect ? "text-amber-400" : isTarget ? "text-emerald-400" : "text-slate-500"} />
                <span className={cn("text-[9px] font-black tracking-[0.3em] uppercase", isPerfect ? "text-amber-400" : isTarget ? "text-emerald-400" : "text-slate-500")}>{label}</span>
            </div>

            {/* Main HUD Gauge */}
            <div className="relative w-40 h-40 md:w-52 md:h-52 flex items-center justify-center z-10">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
                    <defs>
                        <filter id={`glow-${label}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Outer Rotating Ticks */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        className="origin-center"
                    >
                        {Array.from({ length: 36 }).map((_, i) => (
                            <line
                                key={i}
                                x1="50" y1="2" x2="50" y2="5"
                                stroke={colors.main}
                                strokeWidth="0.5"
                                strokeOpacity={i % 3 === 0 ? "0.4" : "0.1"}
                                transform={`rotate(${i * 10} 50 50)`}
                            />
                        ))}
                    </motion.g>

                    {/* Outer Scanning Beam */}
                    <motion.circle
                        cx="50" cy="50" r="48"
                        stroke={colors.main} strokeWidth="0.2" fill="none"
                        strokeDasharray="10 300"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="origin-center opacity-30"
                    />

                    {/* Base Track */}
                    <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="none" />

                    {/* Gap Fill Effect for Target Gauge */}
                    {isTarget && initialScore !== undefined && (
                        <circle
                            cx="50" cy="50" r={radius}
                            stroke="rgba(16,185,129,0.1)" strokeWidth="8" fill="none" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (circumference * initialScore) / 100}
                        />
                    )}

                    {/* Main Progress Ring */}
                    <motion.circle
                        cx="50" cy="50" r={radius}
                        stroke={colors.main} strokeWidth="8" fill="none" strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        style={{ filter: `url(#glow-${label})` }}
                    />

                    {/* Scanning Point */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: "50px 50px" }}
                    >
                        <circle cx="50" cy={50 - radius} r="2" fill="white" filter={`url(#glow-${label})`} />
                    </motion.g>

                    {/* Inner HUD UI Elements */}
                    <circle cx="50" cy="50" r={radius - 8} stroke="white" strokeWidth="0.5" strokeDasharray="2 6" fill="transparent" opacity="0.05" />
                    <motion.circle
                        cx="50" cy="50" r={radius - 12}
                        stroke={colors.main} strokeWidth="0.3" fill="transparent" opacity="0.1"
                        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </svg>

                {/* Score Number HUD */}
                <div className="absolute flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="relative flex items-center justify-center"
                    >
                        <span className={cn(
                            "text-5xl md:text-7xl font-[1000] leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                            isPerfect ? "text-amber-300" : isTarget ? "text-emerald-300" : "text-slate-300"
                        )}>
                            {displayScore}
                        </span>
                    </motion.div>

                    {/* Growth Indicator */}
                    {isTarget && initialScore !== undefined && score > initialScore && (
                        <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-emerald-500/20 shadow-lg border border-emerald-500/30">
                            <TrendingUp size={10} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400">+{score - initialScore}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Secondary Metadata Info */}
            <div className="mt-8 grid grid-cols-2 gap-4 w-full opacity-40">
                <div className="flex flex-col items-center gap-1 border-r border-white/5">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Calibration</span>
                    <span className="text-[10px] font-bold text-white tracking-widest leading-none">V2.4.9</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                    <span className="text-[10px] font-bold text-white tracking-widest leading-none">{score >= 100 ? "OPTIMAL" : "SYNCING"}</span>
                </div>
            </div>

            {/* Corner Bracket Accents */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/10" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/10" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/10" />
        </div>
    );
});

interface SynergyOptimizerProps {
    result: AnalysisResult;
    language: string;
}

const SynergyOptimizer = memo(function SynergyOptimizer({
    result,
    language
}: SynergyOptimizerProps) {
    const isKo = language === 'ko';

    const optimizerData = useMemo(() => {
        const potentialSynergy = result.potentialSynergy;
        if (!potentialSynergy) return null;

        const currentScore = result.score;
        const rawProjectedScore = result.projectedScore || currentScore;
        const displayProjectedScore = Math.max(currentScore, rawProjectedScore);

        const targetPartner = potentialSynergy.pair[1];
        const recName = isKo ? targetPartner.name : targetPartner.name_en;

        const buyUrl = isKo
            ? (targetPartner.coupang_url || `https://www.coupang.com/np/search?q=${encodeURIComponent(targetPartner.name)}`)
            : (targetPartner.amazon_url || `https://www.amazon.com/s?k=${encodeURIComponent(targetPartner.name_en || targetPartner.name)}`);

        const isPerfect = currentScore >= 100;
        const efficiencyGain = 45 + Math.floor(Math.random() * 20);

        return {
            potentialSynergy,
            currentScore,
            displayProjectedScore,
            targetPartner,
            recName,
            buyUrl,
            isPerfect,
            efficiencyGain
        };
    }, [result.score, result.potentialSynergy, result.projectedScore, isKo]);

    if (!optimizerData) return null;

    const {
        currentScore,
        displayProjectedScore,
        targetPartner,
        recName,
        buyUrl,
        isPerfect,
        efficiencyGain
    } = optimizerData;

    // GA4 Click Tracking
    const handleAffiliateClick = () => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'click_affiliate_link', {
                'event_category': 'outbound',
                'event_label': recName,
                'ingredient_id': targetPartner.id,
                'platform': isKo ? 'coupang' : 'amazon'
            });
        }
    };

    return (
        <motion.div
            id="synergy-optimizer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-10 pb-5 space-y-12"
        >
            {/* AI Targeted Insight Header */}
            <div className="pt-10 pb-6 md:pt-16 md:pb-12 flex flex-col items-center gap-6 md:gap-10 relative">
                {/* Background Technical Grid (Subtle) */}
                <div className="absolute inset-x-0 top-0 h-40 md:h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none opacity-50" />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-3 md:gap-4 relative"
                >
                    <div className="px-3 md:px-4 py-1 rounded bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] md:tracking-[0.5em]">AI Optimal Match Found</span>
                    </div>

                    <div className="relative flex items-center justify-center py-4 md:py-6 px-10 md:px-20">
                        {/* Dynamic Framing Corners */}
                        <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-xl md:rounded-2xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-xl md:rounded-2xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 border-b-2 border-l-2 border-emerald-500/40 rounded-bl-xl md:rounded-2xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b-2 border-r-2 border-emerald-500/40 rounded-br-xl md:rounded-2xl" />

                        <h2 className="text-4xl md:text-8xl font-[1000] text-center tracking-tighter leading-none relative z-10">
                            <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
                                {recName}
                            </span>
                        </h2>
                        
                        {/* Floating Interaction Sparkle */}
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-2 -right-2 md:-top-6 md:-right-6"
                        >
                            <Sparkles className="text-emerald-400 w-5 h-5 md:w-10 md:h-10 fill-emerald-500/20" />
                        </motion.div>
                    </div>
                </motion.div>

                <div className="flex flex-col items-center text-center space-y-2 md:space-y-3 px-6 max-w-2xl mx-auto">
                    <p className="text-lg md:text-3xl text-emerald-100 font-bold tracking-tight leading-tight break-keep">
                        {isKo ? (
                            <>현재의 조합을 <span className="text-emerald-400">완벽</span>하게 마무리지을<br />가장 강력한 시너지의 주인공입니다.</>
                        ) : (
                            <>The most powerful synergy partner<br />to <span className="text-emerald-400">perfectly</span> complete your stack.</>
                        )}
                    </p>
                    <div className="h-[1px] md:h-[2px] w-12 md:w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
            </div>

            {/* High-Resolution Score Comparison: Minimalist & Direct */}
            <div className="relative py-4 md:py-12 px-2 md:px-6">
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-12 relative z-10 w-full">
                    <div className="flex items-center justify-between w-full gap-4 md:gap-16 relative">
                        {/* Current Score State */}
                        <div className="flex flex-col items-center gap-4 flex-1">
                            <span className="text-[10px] md:text-sm font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.5em] whitespace-nowrap">Current State</span>
                            <div className="relative group/score">
                                <span className="text-6xl md:text-9xl font-[1000] text-white/10 tracking-tighter tabular-nums leading-none">
                                    {currentScore}
                                </span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl md:text-7xl font-black text-white/90 tracking-tighter drop-shadow-2xl">
                                        {currentScore}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Energy Flow / Synergy Stream */}
                        <div className="relative flex-1 flex flex-col items-center justify-center h-12">
                            <div className="w-full h-[1px] bg-white/5 relative overflow-hidden">
                                <motion.div
                                    animate={{
                                        left: ['-50%', '150%']
                                    }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
                                />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute bg-[#020617] border border-white/10 p-2.5 rounded-full z-20 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                            >
                                <TrendingUp size={22} className="text-emerald-400" />
                            </motion.div>
                            <span className="absolute -bottom-8 text-[9px] font-bold text-emerald-500/50 tracking-widest uppercase truncate w-full text-center">AI Optimization Bridge</span>
                        </div>

                        {/* Optimized Score State */}
                        <div className="flex flex-col items-center gap-4 flex-1">
                            <span className="text-[10px] md:text-sm font-black text-emerald-500 uppercase tracking-[0.3em] md:tracking-[0.5em] whitespace-nowrap">Optimal Peak</span>
                            <div className="relative">
                                <motion.span
                                    animate={{
                                        opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="text-6xl md:text-9xl font-[1000] text-emerald-500 tracking-tighter tabular-nums leading-none blur-sm"
                                >
                                    {displayProjectedScore}
                                </motion.span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={cn(
                                        "text-4xl md:text-7xl font-black tracking-tighter drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]",
                                        isPerfect ? "text-amber-400" : "text-white"
                                    )}>
                                        {displayProjectedScore}
                                    </span>
                                </div>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    className="absolute -top-6 -right-4 md:-top-10 md:-right-8 px-2.5 py-1 rounded bg-emerald-500 text-[10px] md:text-sm font-black text-black shadow-3xl z-30"
                                >
                                    +{displayProjectedScore - currentScore} UP
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Insight Labels */}
                    <div className="flex gap-4 md:gap-12 w-full pt-4">
                        <div className="flex-1 text-center py-4 md:py-6 rounded-2xl md:rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="block text-[8px] md:text-[10px] font-black text-slate-500 tracking-widest uppercase">Performance Gap</span>
                            <span className="text-xs md:text-lg font-bold text-white/50">{100 - currentScore}% Potential Lost</span>
                        </div>
                        <div className="flex-1 text-center py-4 md:py-6 rounded-2xl md:rounded-[2rem] bg-emerald-500/[0.03] border border-emerald-500/10 space-y-1">
                            <span className="block text-[8px] md:text-[10px] font-black text-emerald-500 tracking-widest uppercase">Synergy Impact</span>
                            <span className="text-xs md:text-lg font-bold text-emerald-400">Deep Integration Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Persuasive Bridge Card */}
            <div className="relative overflow-hidden rounded-[3rem] md:rounded-[5rem] bg-slate-950/40 border border-white/10 backdrop-blur-3xl p-6 md:p-16 lg:p-20 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] group/card">
                {/* Intense Central Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.03] blur-[180px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-10 md:gap-24">
                    {/* GROUP 1: Conclusions (Centered Hero) */}
                    <div className="flex flex-col items-center text-center space-y-8 md:space-y-14 w-full max-w-5xl">
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent to-emerald-500/50" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-emerald-400">Clinical Conclusion</span>
                                <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-emerald-500/50" />
                            </div>
                            <h4 className="text-2xl md:text-6xl lg:text-7xl font-[1000] text-white tracking-tighter leading-[1.2] md:leading-[1.05]">
                                {isKo ? (
                                    <>당신의 건강 자산,<br /><span className="text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">마지막 연결</span>로<br />완성하세요.</>
                                ) : (
                                    <>Complete your health<br />investment with the<br /><span className="text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">Final Link.</span></>
                                )}
                            </h4>
                        </div>

                        {/* Rainbow Prism Product Card Container */}
                        <div className="w-full max-w-[340px] md:max-w-[500px] pt-4">
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="relative p-[2px] rounded-[3.5rem] overflow-hidden group/card shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]"
                            >
                                {/* Continuous Rainbow Spin Border */}
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,#ff0000,#ff8000,#ffff00,#00ff00,#00ffff,#0000ff,#8000ff,#ff0000)] opacity-40 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                                />

                                <div className="relative p-10 md:p-14 rounded-[3.4rem] bg-[#020617] backdrop-blur-3xl flex flex-col items-center gap-10 overflow-hidden">
                                    {/* Sweeping Rainbow Prism Shine Effect */}
                                    <motion.div 
                                        animate={{ x: ['-200%', '200%'] }}
                                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-25 pointer-events-none z-10"
                                    />
                                    
                                    {/* Inner Spectrum Glow */}
                                    <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.3),transparent_70%)] pointer-events-none" />

                                    <div className="flex flex-col items-center gap-6 relative z-10 text-center">
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                            className="text-7xl md:text-9xl drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                        >
                                            {targetPartner.icon_emoji}
                                        </motion.div>
                                        <div className="space-y-2">
                                            <h5 className="text-3xl md:text-5xl font-[1000] text-white tracking-tighter leading-none">{recName}</h5>
                                            <div className="flex flex-col items-center gap-1.5 opacity-60">
                                                <div className="w-10 h-px bg-emerald-500" />
                                                <span className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">{isKo ? "AI 선정 파트너" : "AI SELECTED PARTNER"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Magnetic Pulse Action Button */}
                                    <div className="flex justify-center pt-8 w-full max-w-sm relative">
                                        {/* Eternal Pulse Ripples */}
                                        <motion.div 
                                            animate={{ scale: [1, 1.4, 1.1], opacity: [0.5, 0, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                            className="absolute inset-0 rounded-[2rem] border-2 border-emerald-500/50 -z-10"
                                        />
                                        <motion.div 
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                            className="absolute inset-0 rounded-[2rem] border-2 border-emerald-500/30 -z-10"
                                        />

                                        <motion.a
                                            href={buyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={handleAffiliateClick}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "relative w-full py-5 md:py-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center gap-1 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.5)] overflow-hidden group/magnetic transition-all duration-300",
                                                isPerfect 
                                                    ? "bg-gradient-to-br from-amber-400 to-orange-600 text-black shadow-amber-500/30" 
                                                    : "bg-[#10b981] text-white"
                                            )}
                                        >
                                            {/* Dynamic Glossy Shine Overlay */}
                                            <motion.div 
                                                animate={{ x: ['-250%', '250%'] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[40deg] z-20 pointer-events-none"
                                            />

                                            <div className="flex items-center gap-1.5 md:gap-3 relative z-10 px-4">
                                                <Zap size={14} fill="currentColor" className="animate-pulse shrink-0 md:size-[22px]" />
                                                <span className="text-[12px] md:text-2xl font-[1000] tracking-tight md:tracking-tighter whitespace-nowrap">
                                                    {isKo ? "쿠팡에서 잠재력 깨우기" : "Awaken Your Potential"}
                                                </span>
                                            </div>
                                            <span className="relative z-10 text-[8px] md:text-[10px] font-black tracking-[0.15em] md:tracking-[0.3em] uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                                                {isKo ? "최저가 시너지 조합 찾기" : "Start Optimization"}
                                            </span>
                                            
                                            {/* Magnetic Glow Reveal */}
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                                        </motion.a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* GROUP 2: Insights (Aligned Grid) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 w-full max-w-5xl">
                        <div className="flex items-start gap-4 md:gap-6 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-emerald-500/[0.03] border border-emerald-500/10 hover:bg-emerald-500/[0.05] transition-all group/item shadow-2xl">
                            <div className="mt-0.5 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                <FlaskConical size={20} className="text-emerald-400 md:size-6" />
                            </div>
                            <div className="space-y-2 md:space-y-3 min-w-0">
                                <span className="text-[9px] md:text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">{isKo ? "시너지 분석 데이터" : "Synergy Analysis"}</span>
                                <p className="text-slate-300 text-sm md:text-lg leading-relaxed font-semibold break-keep">
                                    {isKo
                                        ? (optimizerData.potentialSynergy.interaction?.reason || `${recName}은(는) 현재 드시는 성분들과 뛰어난 시너지를 이루어 효능을 극대화합니다.`)
                                        : (optimizerData.potentialSynergy.interaction?.reason_en || `${recName} creates excellent synergy with your current stack.`)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 md:gap-6 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-amber-500/[0.03] border border-amber-500/10 hover:bg-amber-500/[0.05] transition-all group/item shadow-2xl">
                            <div className="mt-0.5 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                <AlertCircle size={20} className="text-amber-400 md:size-6" />
                            </div>
                            <div className="space-y-2 md:space-y-3 min-w-0">
                                <span className="text-[9px] md:text-[11px] font-black text-amber-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">{isKo ? "기회 비용 경고" : "Efficiency Recovery"}</span>
                                <p className="text-slate-400 text-xs md:text-base leading-relaxed font-medium italic break-keep">
                                    {isKo
                                        ? `현재 조합만으로는 성분의 잠재 시너지를 약 ${efficiencyGain}% 놓치고 있습니다. ${recName}을 통해 잠재된 효능을 100% 활성화하세요.`
                                        : `You are missing out on up to ${efficiencyGain}% of potential synergy. Unlock your stack's full potential now.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coupang Partners Disclosure - HUD Style Footnote */}
                {isKo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 pt-12 pb-4 opacity-20 hover:opacity-40 transition-opacity duration-700 select-none"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-[1px] bg-white/10" />
                            <div className="flex items-center gap-2 grayscale opacity-50 px-2 py-0.5 rounded border border-white/10 bg-white/5">
                                <ShoppingCart size={8} className="text-white" />
                                <span className="text-[7px] font-black uppercase tracking-[0.25em] text-white">Affiliate Disclosure</span>
                            </div>
                            <div className="w-8 h-[1px] bg-white/10" />
                        </div>
                        <p className="text-[9px] md:text-[11px] font-medium text-slate-400 text-center leading-relaxed px-6 max-w-xl break-keep">
                            이 게시물은 쿠팡 파트너스 활동의 일환으로,<br className="md:hidden" /> 이에 따른 일정액의 수수료를 제공받습니다.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
});

export default SynergyOptimizer;

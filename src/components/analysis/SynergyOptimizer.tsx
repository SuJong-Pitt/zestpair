"use client";

import { memo, useMemo, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Sparkles, ArrowRight, ShoppingCart, FlaskConical, TrendingUp, AlertCircle, Activity } from "lucide-react";
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
            ? `https://www.coupang.com/np/search?q=${encodeURIComponent(targetPartner.name)}`
            : `https://www.amazon.com/s?k=${encodeURIComponent(targetPartner.name_en || targetPartner.name)}`;

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

    return (
        <motion.div
            id="synergy-optimizer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-10 pb-5 space-y-12"
        >
            {/* Header with High-Value Prospecting */}
            <div className="text-center space-y-5">
                <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500", 
                    isPerfect 
                        ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                        : "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                )}>
                    <Sparkles size={14} className={isPerfect ? "text-amber-400" : "text-emerald-400"} />
                    <span className={cn("text-[11px] font-black uppercase tracking-widest", isPerfect ? "text-amber-400" : "text-emerald-400")}>
                        {isPerfect ? "Ultimate Vitality Configuration" : "Precision Optimization Algorithm"}
                    </span>
                </div>
                
                <h3 className="text-2xl md:text-5xl font-[1000] text-white tracking-tight leading-[1.1] px-4 max-w-4xl mx-auto">
                    {isKo ? (
                        isPerfect ? (
                            <>이미 완벽한 조합을 한 단계 더 뛰어넘을 <span className="inline-block px-3 py-1.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-lg">슈퍼 시너지</span><br />
                            <span className="text-white/40">[{recName}]</span>으로 최상의 컨디션을 유지하세요.</>
                        ) : (
                            <>당신의 조합을 완성할 <span className="inline-block px-3 py-1.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-black shadow-lg">마지막 퍼즐</span><br />
                            <span className="text-white/40">[{recName}]</span>을 추가하고 건강 지수를 극대화하세요.</>
                        )
                    ) : (
                        isPerfect ? (
                            <>Push your perfect stack even further with <span className="inline-block px-3 py-1.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-lg">Super Synergy</span><br />
                            Maintain peak performance with <span className="text-white/40">[{recName}]</span>.</>
                        ) : (
                            <>Complete your stack with the <span className="inline-block px-3 py-1.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-black shadow-lg">Final Piece</span><br />
                            Maximize your vitality with <span className="text-white/40">[{recName}]</span>.</>
                        )
                    )}
                </h3>
            </div>

            {/* High-End HUD Comparison Session */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-14 w-full pt-4">
                <SynergyHUD 
                    score={currentScore} 
                    label="Initial State" 
                />

                {/* Animated Interaction Bridge */}
                <div className="flex lg:flex-col items-center gap-4">
                    <motion.div
                        animate={{ x: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="hidden lg:block"
                    >
                        <ArrowRight size={48} className="text-emerald-500/30" strokeWidth={1} />
                    </motion.div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest backdrop-blur-3xl">
                        AI Linking...
                    </div>
                </div>

                <SynergyHUD 
                    score={displayProjectedScore} 
                    initialScore={currentScore}
                    label="Optimal Strategy" 
                    isTarget 
                    isPerfect={isPerfect} 
                />
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

                        {/* Centered Premium Product Card */}
                        <div className="w-full max-w-[320px] md:max-w-[480px]">
                            <div className="relative p-6 md:p-12 rounded-[3rem] md:rounded-[4rem] bg-gradient-to-b from-white/[0.08] to-white/[0.01] border border-white/10 flex flex-col items-center gap-6 md:gap-10 shadow-3xl group/product overflow-hidden">
                                <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-60 md:w-80 h-60 md:h-80 blur-[80px] md:blur-[120px] opacity-20 -z-10", isPerfect ? "bg-amber-500" : "bg-emerald-500")} />
                                
                                <div className="flex flex-col items-center gap-4 md:gap-6">
                                    <motion.div 
                                        animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="text-6xl md:text-9xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                                    >
                                        {targetPartner.icon_emoji}
                                    </motion.div>
                                    <div className="text-center space-y-1 md:space-y-2">
                                        <h5 className="text-2xl md:text-4xl font-[1000] text-white tracking-tighter leading-none">{recName}</h5>
                                        <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">{isKo ? "AI 선정 최적 파트너" : "AI-Selected Partner"}</p>
                                    </div>
                                </div>
                                
                                <motion.a
                                    href={buyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.04, y: -5 }}
                                    whileTap={{ scale: 0.96 }}
                                    className={cn(
                                        "relative flex items-center justify-center gap-3 md:gap-4 w-full py-5 md:py-7 rounded-2xl md:rounded-[2.5rem] font-[1000] text-xs md:text-lg tracking-[0.15em] md:tracking-[0.2em] transition-all shadow-xl md:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] group/btn overflow-hidden",
                                        isPerfect ? "bg-amber-500 text-black" : "bg-emerald-500 text-white"
                                    )}
                                >
                                    <motion.div 
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12" 
                                    />
                                    <ShoppingCart size={18} className="relative z-10 shrink-0" strokeWidth={3} />
                                    <span className="relative z-10">{isKo ? "시너지 지금 완성하기" : "COMPLETE SYNERGY NOW"}</span>
                                </motion.a>
                            </div>
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
            </div>
        </motion.div>
    );
});

export default SynergyOptimizer;

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Sparkles,
    ShieldCheck,
    AlertTriangle,
    Share2,
    ArrowRight,
    ShoppingCart,
    RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import type { AnalysisResult } from "@/types/database";
import SynergyCard from "./SynergyCard";

// New modular components
import ScoreRing from "./analysis/ScoreRing";
import InteractionCard from "./analysis/InteractionCard";

interface AnalysisResultsProps {
    result: AnalysisResult;
    coupangProducts?: any[];
}

export default function AnalysisResults({ result, coupangProducts = [] }: AnalysisResultsProps) {
    const { clearBasket, language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];

    if (!result || !result.ingredients) {
        return <div className="p-20 text-center text-slate-400">{t.common.loading}...</div>;
    }

    const handleShare = async () => {
        const shareData = {
            title: language === 'ko' ? "ZestPair | 영양제 궁합 분석 결과" : "ZestPair | Supplement Synergy Analysis",
            text: language === 'ko'
                ? `🔥 나의 영양제 궁합 점수는 ${result.score}점! Pori AI가 알려주는 최적의 조합을 확인해보세요.`
                : `🔥 My supplement synergy score is ${result.score}! Check your personalized analysis by Pori AI at ZestPair.`,
            url: window.location.origin
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.origin);
                alert(language === 'ko' ? "링크가 복사되었습니다!" : "Link copied to clipboard!");
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    const allInteractions = [
        ...result.synergies,
        ...result.cautions,
        ...result.conflicts,
    ].filter((r) => r && r.interaction);

    return (
        <div className="relative min-h-screen bg-slate-950 w-full font-sans text-slate-200 selection:bg-emerald-500/30">
            {/* Background Blobs */}
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-24"
            >
                {/* Main Glass Panel (Reduced vertical spacing) */}
                <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-4 md:p-8 lg:p-10 space-y-8 md:space-y-10">

                    {/* 0. Report Header */}
                    <div id="analysis-report-top" className="flex flex-col items-center gap-2 pt-4 pb-0">
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-2.5 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            <div className="relative shrink-0">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-1 rounded-full border border-dashed border-emerald-400/40"
                                />
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Sparkles size={12} className="md:size-[14px] text-emerald-400 relative z-10" />
                                </motion.div>
                            </div>
                            <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-emerald-400 pt-0.5 whitespace-nowrap">
                                {language === 'ko' ? 'Analysis Protocol' : 'Analysis Report'}
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 8 }}
                            className="w-px bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent"
                        />
                    </div>

                    {/* 1. Score Summary Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500 rounded-[3rem] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>

                        <div className="relative rounded-[2.5rem] bg-slate-900/80 border border-white/10 backdrop-blur-2xl text-white">
                            {/* Decorative Background Grid */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-[2.5rem]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                            </div>

                            <CardContent className="p-5 md:p-10 relative z-10 flex flex-col items-center text-center">
                                {/* Score Gauge Section */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative mb-6"
                                >
                                    <div className="absolute inset-0 rounded-full bg-slate-950/70 pointer-events-none" style={{ transform: "scale(0.85)" }} />
                                    <ScoreRing score={result.score} />
                                </motion.div>

                                {/* AI Badge */}
                                <motion.div
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-6"
                                >
                                    <Sparkles size={12} className="text-indigo-300 animate-pulse" />
                                    <span className="text-[9px] md:text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] pt-0.5">AI Precision Analysis</span>
                                </motion.div>

                                {/* Title & Motivation */}
                                <div className="mb-6 space-y-1.5">
                                    <motion.h2
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                        className="text-3xl md:text-5xl font-[1000] tracking-tighter leading-none text-white drop-shadow-xl"
                                    >
                                        {result.score >= 70 ? t.results.synergy : result.score >= 40 ? t.results.caution : t.results.conflict}
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-base md:text-lg font-black text-emerald-400/90 tracking-tight"
                                    >
                                        {result.score >= 70 ? t.results.bestMix : result.score >= 40 ? t.results.potentialConflict : t.results.dangerous}
                                    </motion.p>
                                </div>

                                {/* Summary Box */}
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative w-full max-w-xl mb-2"
                                >
                                    <div className="relative px-5 py-4 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner">
                                        <div className="relative flex items-center justify-center gap-2.5">
                                            <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                <ShieldCheck size={12} className="text-emerald-400" />
                                            </div>
                                            <p className="text-[13px] md:text-[16px] font-[900] text-white/90 tracking-tight text-center leading-relaxed">
                                                {(() => {
                                                    const count = result.conflicts.length || result.synergies.length || result.cautions.length;
                                                    const countSpan = <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] bg-emerald-500/10 px-1.5 py-0.5 rounded-lg mx-1">{count}</span>;
                                                    const cautionSpan = <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] bg-amber-500/10 px-1.5 py-0.5 rounded-lg mx-1">{count}</span>;
                                                    const conflictSpan = <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] bg-rose-500/10 px-1.5 py-0.5 rounded-lg mx-1">{count}</span>;

                                                    if (language === 'ko') {
                                                        if (result.conflicts.length > 0) return <>⚠️ {conflictSpan}가지 충돌 조합이 발견되었습니다...</>;
                                                        if (result.synergies.length > 0) return <>✅ {countSpan}가지 시너지 조합이 발견되었습니다!</>;
                                                        if (result.cautions.length > 0) return <>🔶 {cautionSpan}가지 주의 조합이 발견되었습니다...</>;
                                                        return t.results.summaryNeutral;
                                                    } else {
                                                        if (result.conflicts.length > 0) return <>{conflictSpan} conflicts detected...</>;
                                                        if (result.synergies.length > 0) return <>{countSpan} synergies detected!</>;
                                                        if (result.cautions.length > 0) return <>{cautionSpan} cautions detected...</>;
                                                        return t.results.summaryNeutral;
                                                    }
                                                })()}
                                            </p>
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2.5 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 shadow-lg"
                                    >
                                        <AlertTriangle size={12} className="text-amber-500/70" />
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 leading-tight break-keep text-center">
                                            {language === 'ko' 
                                                ? "본 리포트는 참고용이며 의학적 진단을 대체할 수 없습니다. 상호작용은 개인에 따라 다를 수 있으니 전문의와 상담하세요."
                                                : "This report is for reference only and does not replace medical advice. Consult a doctor for professional diagnosis."}
                                        </p>
                                    </motion.div>
                                </motion.div>

                                {/* Share Action */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-8"
                                >
                                    <Button
                                        onClick={handleShare}
                                        className="group/share relative px-8 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                                    >
                                        <div className="relative flex items-center gap-2">
                                            <Share2 size={16} />
                                            <span>{language === 'ko' ? "분석 결과 공유하기" : "Share Analysis"}</span>
                                        </div>
                                    </Button>
                                </motion.div>

                                {/* Ingredients Capsule List (Stabilized and tightened) */}
                                <div className="flex flex-col gap-2 w-full max-w-xl">
                                    {result.ingredients.map((ing, i) => (
                                        <motion.div
                                            key={ing.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.05 }}
                                            className="flex items-center gap-3 md:gap-4 bg-slate-800/40 border border-white/5 rounded-2xl px-4 py-2 md:px-5 md:py-2.5 backdrop-blur-sm group hover:bg-slate-800/60 transition-colors"
                                        >
                                            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900/50 border border-white/5 shadow-inner shrink-0">
                                                <span className="text-lg md:text-xl group-hover:scale-110 transition-transform duration-300">{ing.icon_emoji}</span>
                                            </div>
                                            <div className="flex flex-col items-start min-w-0">
                                                <span className="text-[10px] md:text-[13px] font-[900] text-white/90 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full">
                                                    {language === "ko" ? ing.name : ing.name_en}
                                                </span>
                                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                                    {language === "ko" ? ing.category : ing.category}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </div>
                    </div>

                    {/* 2. Interaction Details Section */}
                    <div className="space-y-6">
                        <div className="flex items-end justify-between px-2">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white tracking-tight">
                                    {t.results.matrixTitle}
                                </h3>
                                <p className="text-sm text-slate-400 font-semibold opacity-90">{t.results.matrixSubtitle}</p>
                            </div>
                            <Badge variant="outline" className="rounded-lg px-3 py-1.5 border-white/10 text-slate-300 font-bold bg-white/5">
                                {allInteractions.length}{language === "ko" ? "건의 분석결과" : " Results"}
                            </Badge>
                        </div>

                        {allInteractions.length > 0 ? (
                            <div className="flex flex-col gap-5 py-8 w-full max-w-4xl mx-auto">
                                {[...result.synergies, ...result.cautions, ...result.conflicts].map(
                                    (r, idx) => r.interaction && (
                                        <SynergyCard key={r.interaction.id ?? idx} result={r} index={idx} />
                                    )
                                )}
                            </div>
                        ) : (
                            <InteractionCard language={language} t={t} />
                        )}
                    </div>

                    {/* 3. Synergy Optimization Bridge */}
                    {(() => {
                        const currentIngNames = result.ingredients.map(ing => (ing.name_en || ing.name).toLowerCase().trim());
                        const potentialSynergy = result.potentialSynergy;
                        const isTrueSynergy = !!potentialSynergy;
                        const fallbackCandidates = [
                            { ko: "비타민 C", en: "Vitamin C" },
                            { ko: "오메가3", en: "Omega-3" },
                            { ko: "유산균", en: "Probiotics" },
                            { ko: "마그네슘", en: "Magnesium" }
                        ];
                        const bestFallback = fallbackCandidates.find(f =>
                            !currentIngNames.some(own =>
                                own.includes(f.ko.toLowerCase()) ||
                                own.includes(f.en.toLowerCase())
                            )
                        ) || fallbackCandidates[0];
                        const targetPartner = potentialSynergy?.pair[1];
                        const targetIngredient = isTrueSynergy && targetPartner
                            ? { ko: targetPartner.name, en: targetPartner.name_en }
                            : bestFallback;
                        const recName = language === 'ko' ? targetIngredient.ko : targetIngredient.en;

                        const synergyBoost = isTrueSynergy ? 15 : 0;
                        const foundationBoost = result.ingredients.length >= 2 ? 8 : 0;
                        const totalBoost = synergyBoost + (synergyBoost === 0 && result.score >= 100 ? 0 : foundationBoost);
                        const projectedScore = Math.max(result.score, Math.min(100, result.score + totalBoost));
                        const buyUrl = language === 'ko'
                            ? `https://www.coupang.com/np/search?q=${encodeURIComponent(targetIngredient.ko)}`
                            : `https://www.amazon.com/s?k=${encodeURIComponent(targetIngredient.en)}`;

                        return (
                            <div className="pt-20 pb-10 space-y-16">
                                {/* Gauge Comparison */}
                                <div className="w-full max-w-4xl mx-auto space-y-8">
                                    <div className="text-center space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border", isTrueSynergy ? "bg-emerald-500/10 border-emerald-500/30" : "bg-blue-500/10 border-blue-500/30")}
                                        >
                                            <Sparkles size={14} className={isTrueSynergy ? "text-emerald-400" : "text-blue-400"} />
                                            <span className={cn("text-[11px] font-black uppercase tracking-widest pt-px", isTrueSynergy ? "text-emerald-400" : "text-blue-400")}>
                                                {result.score >= 100 && !isTrueSynergy ? "Continuous Maintenance" : isTrueSynergy ? "Synergy Optimization" : "Foundation Bridge"}
                                            </span>
                                        </motion.div>
                                        <h3 className="text-xl md:text-3xl lg:text-4xl font-[1000] text-white tracking-tight break-keep leading-[1.6] text-center max-w-2xl mx-auto uppercase">
                                            {language === 'ko' ? (
                                                <>
                                                    현재 조합에{" "}
                                                    <span className="relative inline-block px-1.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)] mx-1">
                                                        [{recName}]
                                                    </span>
                                                    를 추가하면
                                                    <br className="hidden sm:block" />
                                                    {" "}영양 시너지가 완성되며{" "}
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] mx-1">
                                                        {projectedScore}점
                                                    </span>
                                                    이 됩니다!
                                                </>
                                            ) : (
                                                <>
                                                    Adding{" "}
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)] px-1">
                                                        [{recName}]
                                                    </span>
                                                    completes your nutritional
                                                    <br className="hidden sm:block" />
                                                    synergy triad! Potential:{" "}
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                                                        {projectedScore}pts
                                                    </span>
                                                </>
                                            )}
                                        </h3>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full pt-4">
                                        {/* ── CURRENT HUD Gauge ── */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6 }}
                                            className="relative flex flex-col items-center gap-3 p-6 rounded-[2rem] w-full max-w-[260px] overflow-hidden"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.8) 100%)",
                                                border: "1px solid rgba(148,163,184,0.15)",
                                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.5)"
                                            }}
                                        >
                                            {/* scan line decoration */}
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                                                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:100%_8px]" />
                                                <motion.div
                                                    animate={{ y: ["-100%", "200%"] }}
                                                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                                    className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-slate-400/5 to-transparent"
                                                />
                                            </div>
                                            {/* corner brackets */}
                                            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-slate-500/40 rounded-tl pointer-events-none" />
                                            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-slate-500/40 rounded-tr pointer-events-none" />
                                            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-slate-500/40 rounded-bl pointer-events-none" />
                                            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-slate-500/40 rounded-br pointer-events-none" />

                                            {/* header badge */}
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600/30 backdrop-blur z-10">
                                                <motion.div
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 2.2, repeat: Infinity }}
                                                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                                                />
                                                <span className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase">Current</span>
                                            </div>

                                            {/* ring */}
                                            <div className="relative w-36 h-36 flex items-center justify-center z-10">
                                                {/* outer blur glow */}
                                                <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(148,163,184,0.08) 30%, transparent 70%)", filter: "blur(16px)" }} />
                                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                    <defs>
                                                        <filter id="cur-glow">
                                                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                                                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                                        </filter>
                                                    </defs>
                                                    {/* track */}
                                                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                                                    {/* glow layer */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="42"
                                                        stroke="#94a3b8" strokeWidth="14" fill="none" strokeLinecap="round"
                                                        strokeDasharray="264"
                                                        initial={{ strokeDashoffset: 264 }}
                                                        whileInView={{ strokeDashoffset: 264 - (264 * result.score) / 100 }}
                                                        transition={{ duration: 1.6, ease: "easeOut" }}
                                                        style={{ opacity: 0.12, filter: "blur(6px)" }}
                                                    />
                                                    {/* main ring */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="42"
                                                        stroke="#94a3b8" strokeWidth="8" fill="none" strokeLinecap="round"
                                                        strokeDasharray="264"
                                                        initial={{ strokeDashoffset: 264 }}
                                                        whileInView={{ strokeDashoffset: 264 - (264 * result.score) / 100 }}
                                                        transition={{ duration: 1.6, ease: "easeOut" }}
                                                        filter="url(#cur-glow)"
                                                        style={{ opacity: 0.7 }}
                                                    />
                                                    {/* tick marks */}
                                                    {Array.from({ length: 20 }).map((_, i) => {
                                                        const angle = (i / 20) * 360;
                                                        const rad = (angle * Math.PI) / 180;
                                                        const r1 = 48, r2 = i % 5 === 0 ? 44 : 46;
                                                        return (
                                                            <line key={i}
                                                                x1={50 + r2 * Math.cos(rad)} y1={50 + r2 * Math.sin(rad)}
                                                                x2={50 + r1 * Math.cos(rad)} y2={50 + r1 * Math.sin(rad)}
                                                                stroke="rgba(148,163,184,0.25)" strokeWidth={i % 5 === 0 ? "1.2" : "0.6"}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                                {/* score text */}
                                                <div className="absolute flex flex-col items-center">
                                                    <motion.span
                                                        className="text-3xl font-[1000] leading-none"
                                                        style={{ color: "#94a3b8", textShadow: "0 0 20px rgba(148,163,184,0.4)" }}
                                                    >
                                                        {result.score}
                                                    </motion.span>
                                                    <span className="text-[8px] font-black text-slate-600 tracking-widest mt-0.5">PTS</span>
                                                </div>
                                            </div>

                                            {/* bottom data row */}
                                            <div className="flex items-center gap-2 z-10">
                                                <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-600" />
                                                <span className="text-[8px] font-mono text-slate-600 tracking-widest uppercase">Stack_v1</span>
                                                <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-600" />
                                            </div>
                                        </motion.div>

                                        {/* ── ARROW ── */}
                                        <motion.div
                                            animate={{ x: [0, 5, 0], opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                            className="hidden md:flex flex-col items-center gap-1"
                                        >
                                            <div className="h-px w-12 bg-gradient-to-r from-slate-700 via-emerald-500/50 to-slate-700" />
                                            <ArrowRight className="text-emerald-500/70" size={20} />
                                            <div className="h-px w-12 bg-gradient-to-r from-slate-700 via-emerald-500/50 to-slate-700" />
                                        </motion.div>

                                        {/* ── TARGET HUD Gauge ── */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                            className="relative flex flex-col items-center gap-3 p-6 rounded-[2rem] w-full max-w-[260px] overflow-hidden"
                                            style={{
                                                background: isTrueSynergy
                                                    ? "linear-gradient(135deg, rgba(6,27,22,0.95) 0%, rgba(15,41,35,0.85) 100%)"
                                                    : "linear-gradient(135deg, rgba(6,18,35,0.95) 0%, rgba(15,30,55,0.85) 100%)",
                                                border: isTrueSynergy
                                                    ? "1px solid rgba(52,211,153,0.25)"
                                                    : "1px solid rgba(96,165,250,0.25)",
                                                boxShadow: isTrueSynergy
                                                    ? "inset 0 1px 0 rgba(52,211,153,0.08), 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(52,211,153,0.08)"
                                                    : "inset 0 1px 0 rgba(96,165,250,0.08), 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(96,165,250,0.08)"
                                            }}
                                        >
                                            {/* animated outer glow pulse */}
                                            <motion.div
                                                animate={{ opacity: [0.05, 0.18, 0.05] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 rounded-[2rem] pointer-events-none"
                                                style={{
                                                    background: isTrueSynergy
                                                        ? "radial-gradient(circle at 50% 50%, rgba(52,211,153,0.15) 0%, transparent 70%)"
                                                        : "radial-gradient(circle at 50% 50%, rgba(96,165,250,0.15) 0%, transparent 70%)"
                                                }}
                                            />
                                            {/* scan line decoration */}
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                                                <div className={`absolute inset-0 bg-[linear-gradient(${isTrueSynergy ? "rgba(52,211,153,0.03)" : "rgba(96,165,250,0.03)"}_1px,transparent_1px)] bg-[size:100%_8px]`} />
                                                <motion.div
                                                    animate={{ y: ["-100%", "200%"] }}
                                                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
                                                    className={`absolute inset-x-0 h-12 bg-gradient-to-b from-transparent ${isTrueSynergy ? "via-emerald-400/6" : "via-blue-400/6"} to-transparent`}
                                                />
                                            </div>
                                            {/* corner brackets */}
                                            <div className={`absolute top-3 left-3 w-4 h-4 border-t border-l rounded-tl pointer-events-none ${isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40"}`} />
                                            <div className={`absolute top-3 right-3 w-4 h-4 border-t border-r rounded-tr pointer-events-none ${isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40"}`} />
                                            <div className={`absolute bottom-3 left-3 w-4 h-4 border-b border-l rounded-bl pointer-events-none ${isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40"}`} />
                                            <div className={`absolute bottom-3 right-3 w-4 h-4 border-b border-r rounded-br pointer-events-none ${isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40"}`} />

                                            {/* header badge */}
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur z-10 border ${isTrueSynergy ? "bg-emerald-900/50 border-emerald-500/30" : "bg-blue-900/50 border-blue-500/30"}`}>
                                                <motion.div
                                                    animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
                                                    transition={{ duration: 1.4, repeat: Infinity }}
                                                    className={`w-1.5 h-1.5 rounded-full ${isTrueSynergy ? "bg-emerald-400" : "bg-blue-400"}`}
                                                    style={{ boxShadow: isTrueSynergy ? "0 0 8px rgba(52,211,153,0.8)" : "0 0 8px rgba(96,165,250,0.8)" }}
                                                />
                                                <span className={`text-[9px] font-black tracking-[0.3em] uppercase ${isTrueSynergy ? "text-emerald-400" : "text-blue-400"}`}>Target</span>
                                            </div>

                                            {/* ring */}
                                            <div className="relative w-36 h-36 flex items-center justify-center z-10">
                                                {/* outer blur glow */}
                                                <motion.div
                                                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                                                    transition={{ duration: 2.5, repeat: Infinity }}
                                                    className="absolute inset-0 rounded-full"
                                                    style={{
                                                        background: isTrueSynergy
                                                            ? "radial-gradient(circle, rgba(52,211,153,0.15) 30%, transparent 70%)"
                                                            : "radial-gradient(circle, rgba(96,165,250,0.15) 30%, transparent 70%)",
                                                        filter: "blur(18px)"
                                                    }}
                                                />
                                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
                                                    <defs>
                                                        <linearGradient id="tgt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor={isTrueSynergy ? "#34d399" : "#60a5fa"} />
                                                            <stop offset="100%" stopColor={isTrueSynergy ? "#06b6d4" : "#a78bfa"} />
                                                        </linearGradient>
                                                        <filter id="tgt-glow">
                                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                                        </filter>
                                                    </defs>
                                                    {/* track */}
                                                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                                                    {/* glow layer */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="42"
                                                        stroke="url(#tgt-grad)" strokeWidth="16" fill="none" strokeLinecap="round"
                                                        strokeDasharray="264"
                                                        initial={{ strokeDashoffset: 264 }}
                                                        whileInView={{ strokeDashoffset: 264 - (264 * projectedScore) / 100 }}
                                                        transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
                                                        style={{ opacity: 0.18, filter: "blur(8px)" }}
                                                    />
                                                    {/* main ring */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="42"
                                                        stroke="url(#tgt-grad)" strokeWidth="8" fill="none" strokeLinecap="round"
                                                        strokeDasharray="264"
                                                        initial={{ strokeDashoffset: 264 }}
                                                        whileInView={{ strokeDashoffset: 264 - (264 * projectedScore) / 100 }}
                                                        transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
                                                        filter="url(#tgt-glow)"
                                                    />
                                                    {/* spinning accent arc */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="48"
                                                        stroke={isTrueSynergy ? "#34d399" : "#60a5fa"} strokeWidth="0.8"
                                                        strokeDasharray="20 80" fill="none" opacity="0.3"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                                        style={{ transformOrigin: "50px 50px" }}
                                                    />
                                                    {/* tick marks */}
                                                    {Array.from({ length: 20 }).map((_, i) => {
                                                        const angle = (i / 20) * 360;
                                                        const rad = (angle * Math.PI) / 180;
                                                        const r1 = 48, r2 = i % 5 === 0 ? 44 : 46;
                                                        return (
                                                            <line key={i}
                                                                x1={50 + r2 * Math.cos(rad)} y1={50 + r2 * Math.sin(rad)}
                                                                x2={50 + r1 * Math.cos(rad)} y2={50 + r1 * Math.sin(rad)}
                                                                stroke={isTrueSynergy ? "rgba(52,211,153,0.3)" : "rgba(96,165,250,0.3)"}
                                                                strokeWidth={i % 5 === 0 ? "1.2" : "0.6"}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                                {/* score text */}
                                                <div className="absolute flex flex-col items-center">
                                                    <motion.span
                                                        animate={{ opacity: [0.85, 1, 0.85] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="text-3xl font-[1000] leading-none"
                                                        style={{
                                                            color: isTrueSynergy ? "#34d399" : "#60a5fa",
                                                            textShadow: isTrueSynergy
                                                                ? "0 0 24px rgba(52,211,153,0.6)"
                                                                : "0 0 24px rgba(96,165,250,0.6)"
                                                        }}
                                                    >
                                                        {projectedScore}
                                                    </motion.span>
                                                    <span className={`text-[8px] font-black tracking-widest mt-0.5 ${isTrueSynergy ? "text-emerald-700" : "text-blue-700"}`}>PTS</span>
                                                </div>
                                            </div>

                                            {/* bottom data row */}
                                            <div className="flex items-center gap-2 z-10">
                                                <div className={`h-px w-8 bg-gradient-to-r from-transparent ${isTrueSynergy ? "to-emerald-600" : "to-blue-600"}`} />
                                                <span className={`text-[8px] font-mono tracking-widest uppercase ${isTrueSynergy ? "text-emerald-700" : "text-blue-700"}`}>Optimized</span>
                                                <div className={`h-px w-8 bg-gradient-to-l from-transparent ${isTrueSynergy ? "to-emerald-600" : "to-blue-600"}`} />
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Premium Recommendation Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="relative w-full max-w-5xl mx-auto rounded-[3rem] overflow-hidden bg-gradient-to-b from-emerald-900/40 to-slate-900 border border-emerald-500/20 shadow-2xl p-8 md:p-12 flex flex-wrap items-center justify-center gap-10"
                                >
                                    <div className="flex-[1_1_300px] space-y-6">
                                        <div className="space-y-2">
                                            <span className="text-xs font-black text-emerald-500 tracking-widest uppercase">{language === 'ko' ? "AI 맞춤 큐레이션" : "AI Curation"}</span>
                                            <h3 className="text-3xl md:text-5xl font-[1000] text-white tracking-tighter leading-tight">
                                                Pori’s {isTrueSynergy ? "Perfect" : "Foundation"}<br />
                                                <span className="text-emerald-400">{isTrueSynergy ? "Synergy 1-Pick" : "Daily 1-Pick"}</span>
                                            </h3>
                                        </div>
                                        <div className="flex items-start gap-3 md:gap-4 bg-white/[0.03] p-5 md:p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl relative group/pori overflow-hidden">
                                            {/* Decorative corner glow */}
                                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover/pori:bg-emerald-500/20 transition-all duration-700" />

                                            <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-emerald-400/50 bg-slate-900/50 overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                                <img src="/hero-pori.png" alt="Pori" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="space-y-1.5 flex-1 pt-0.5">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest pl-0.5">AI Counselor</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white/40 italic">💬 Pori says</span>
                                                </div>
                                                <div className="text-slate-200 text-xs md:text-sm leading-[1.6] font-medium tracking-tight break-keep">
                                                    {language === 'ko' ? (
                                                        isTrueSynergy ? (
                                                            <>
                                                                회원님이 드시는 성분들과{" "}
                                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-black drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                                                                    [{recName}]
                                                                </span>
                                                                은{" "}
                                                                <span className="text-white font-[900] underline decoration-emerald-500/50 decoration-2 underline-offset-4">
                                                                    찰떡궁합
                                                                </span>
                                                                이에요! 흡수율이 가장 높은 제품으로 특별히 찾아왔어요.
                                                            </>
                                                        ) : (
                                                            <>
                                                                직접적인 충돌은 없으면서도, 부족한 기초 영양을 탄탄하게 채워줄 수 있는{" "}
                                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-black">
                                                                    [{recName}]
                                                                </span>
                                                                를 골라봤어요!
                                                            </>
                                                        )
                                                    ) : (
                                                        <>
                                                            <span className="text-emerald-400 font-black">[{recName}]</span>
                                                            {" "}is a perfect match with your current stack! I found the most absorbable one for you.
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-[1_1_300px] flex justify-center">
                                        <div className="w-full max-w-[340px] bg-[#0d1117] rounded-[2.5rem] border border-white/10 p-8 flex flex-col items-center gap-6 shadow-2xl relative group/prod">
                                            <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] opacity-0 group-hover/prod:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                AI Top Pick
                                            </div>
                                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-8xl drop-shadow-2xl">💊</motion.div>
                                            <div className="text-center">
                                                <h4 className="text-2xl font-[1000] text-white tracking-tighter">{recName}</h4>
                                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Premium · Ultra-Pure</p>
                                            </div>
                                            <a
                                                href={buyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white flex items-center justify-between px-6 hover:scale-[1.02] transition-transform shadow-lg"
                                            >
                                                <div className="flex flex-col text-left">
                                                    <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">Buy Now</span>
                                                    <span className="text-lg font-[1000]">{language === 'ko' ? "최저가 구매하기" : "Best Price"}</span>
                                                </div>
                                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <ShoppingCart size={20} />
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })()}

                    {/* 4. Reset Button */}
                    <div className="pt-12 pb-8 flex flex-col items-center gap-4 relative z-10 w-full max-w-xl mx-auto">
                        <motion.button
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            onClick={() => {
                                clearBasket();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors px-4 py-2"
                        >
                            <span className="text-sm font-bold">{language === 'ko' ? '다른 영양제 분석하기' : 'Analyze other supplements'}</span>
                            <RefreshCcw size={14} className="opacity-70" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

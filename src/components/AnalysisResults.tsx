"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import type { AnalysisResult, CoupangProduct } from "@/types/database";
import SynergyCard from "./SynergyCard";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// New modular components
import ScoreRing from "./analysis/ScoreRing";
import InteractionCard from "./analysis/InteractionCard";
import Toast from "./ui/Toast";

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

    if (!result || !result.ingredients) {
        return <div className="p-20 text-center text-slate-400">{t.common.loading}...</div>;
    }

    const handleShare = async () => {
        // IDs를 콤마로 연결해 URL 파라미터 생성
        const ids = result.ingredients.map(ing => ing.id).join(',');
        const shareUrl = `${window.location.origin}/analysis?ids=${ids}`;

        const shareData = {
            title: language === 'ko' ? "ZestPair | 영양제 궁합 분석 결과" : "ZestPair | Supplement Synergy Analysis",
            text: language === 'ko'
                ? `🔥 저의 영양제 궁합 점수는 ${result.score}점! Pori AI가 알려주는 최적의 조합을 확인해보세요.`
                : `🔥 My supplement synergy score is ${result.score}pts! Check your personalized analysis by Pori AI at ZestPair.`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setToast({ 
                    show: true, 
                    message: language === 'ko' ? "링크가 복사되었습니다!" : "Link copied to clipboard!" 
                });
                setTimeout(() => setToast({ show: false, message: "" }), 3000);
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
                {/* Main Glass Panel */}
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
                                <Sparkles size={12} className="md:size-[14px] text-emerald-400 relative z-10" />
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

                        <div className="relative rounded-[2.5rem] bg-slate-900/80 border border-white/10 backdrop-blur-2xl text-white overflow-hidden">
                            <CardContent className="p-5 md:p-10 relative z-10 flex flex-col items-center text-center">
                                {/* Score Gauge Section */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative mb-6"
                                >
                                    <ScoreRing score={result.score} size={isMobile ? 220 : 300} />
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
                                <div className="text-[13px] md:text-base font-bold text-white/70 max-w-xl mb-8 leading-relaxed">
                                    {result.summary}
                                </div>

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

                                {/* Ingredients Capsule List */}
                                <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-2xl">
                                    {result.ingredients.map((ing, i) => (
                                        <motion.div
                                            key={ing.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 + i * 0.05 }}
                                            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-sm"
                                        >
                                            <span className="text-base md:text-xl">{ing.icon_emoji}</span>
                                            <span className="text-[11px] md:text-[13px] font-black text-white/90">
                                                {language === "ko" ? ing.name : ing.name_en}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </div>
                    </div>

                    {/* 2. Interaction Details Section */}
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
                        const projectedScore = result.projectedScore ?? Math.min(100, result.score + totalBoost);
                        
                        const buyUrl = language === 'ko'
                            ? `https://www.coupang.com/np/search?q=${encodeURIComponent(targetIngredient.ko)}`
                            : `https://www.amazon.com/s?k=${encodeURIComponent(targetIngredient.en)}`;

                        return (
                            <div className="pt-10 pb-5 space-y-10">
                                <div className="text-center space-y-4">
                                    <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border", isTrueSynergy ? "bg-emerald-500/10 border-emerald-500/30" : "bg-blue-500/10 border-blue-500/30")}>
                                        <Sparkles size={14} className={isTrueSynergy ? "text-emerald-400" : "text-blue-400"} />
                                        <span className={cn("text-[11px] font-black uppercase tracking-widest", isTrueSynergy ? "text-emerald-400" : "text-blue-400")}>
                                            {isTrueSynergy ? "Synergy Optimization" : "Foundation Bridge"}
                                        </span>
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-[1000] text-white tracking-tight leading-tight">
                                        {language === 'ko' ? (
                                            <>현재 조합에 <span className="text-emerald-400">[{recName}]</span>를 추가하면 <span className="text-amber-400">{projectedScore}점</span>이 됩니다!</>
                                        ) : (
                                            <>Adding <span className="text-emerald-400">[{recName}]</span> could boost your score to <span className="text-amber-400">{projectedScore}pts</span>!</>
                                        )}
                                    </h3>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full pt-4">
                                    {/* ── CURRENT HUD Gauge ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="relative flex flex-col items-center gap-3 p-5 md:p-6 rounded-[2rem] w-full max-w-[220px] md:max-w-[260px] overflow-hidden"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.8) 100%)",
                                            border: "1px solid rgba(148,163,184,0.15)",
                                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.5)"
                                        }}
                                    >
                                        {/* scan line decoration */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:100%_8px]" />
                                        </div>
                                        {/* corner brackets */}
                                        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-slate-500/40 rounded-tl pointer-events-none" />
                                        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-slate-500/40 rounded-tr pointer-events-none" />
                                        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-slate-500/40 rounded-bl pointer-events-none" />
                                        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-slate-500/40 rounded-br pointer-events-none" />

                                        {/* header badge */}
                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-600/30 backdrop-blur z-10">
                                            <span className="text-[8px] md:text-[9px] font-black text-slate-400 tracking-[0.2em] md:tracking-[0.3em] uppercase">Current</span>
                                        </div>

                                        {/* ring */}
                                        <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center z-10">
                                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                                                <motion.circle
                                                    cx="50" cy="50" r="42"
                                                    stroke="#94a3b8" strokeWidth="8" fill="none" strokeLinecap="round"
                                                    strokeDasharray="264"
                                                    initial={{ strokeDashoffset: 264 }}
                                                    whileInView={{ strokeDashoffset: 264 - (264 * result.score) / 100 }}
                                                    transition={{ duration: 1.6, ease: "easeOut" }}
                                                    style={{ opacity: 0.7 }}
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-2xl md:text-3xl font-[1000] leading-none text-slate-400">{result.score}</span>
                                                <span className="text-[7px] md:text-[8px] font-black text-slate-600 tracking-widest mt-0.5">PTS</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* ── ARROW ── */}
                                    <motion.div
                                        animate={{ y: [0, 5, 0], opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                        className="flex md:flex-col items-center gap-2 md:gap-1"
                                    >
                                        <div className="hidden md:block h-12 w-px bg-gradient-to-b from-slate-700 via-emerald-500/50 to-slate-700" />
                                        <ArrowRight className="text-emerald-500/70 rotate-90 md:rotate-0" size={20} />
                                        <div className="hidden md:block h-12 w-px bg-gradient-to-b from-slate-700 via-emerald-500/50 to-slate-700" />
                                    </motion.div>

                                    {/* ── TARGET HUD Gauge ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className="relative flex flex-col items-center gap-3 p-5 md:p-6 rounded-[2rem] w-full max-w-[220px] md:max-w-[260px] overflow-hidden"
                                        style={{
                                            background: isTrueSynergy
                                                ? "linear-gradient(135deg, rgba(6,27,22,0.95) 0%, rgba(15,41,35,0.85) 100%)"
                                                : "linear-gradient(135deg, rgba(6,18,35,0.95) 0%, rgba(15,30,55,0.85) 100%)",
                                            border: isTrueSynergy
                                                ? "1px solid rgba(52,211,153,0.25)"
                                                : "1px solid rgba(96,165,250,0.25)"
                                        }}
                                    >
                                        {/* corner brackets */}
                                        <div className={cn("absolute top-3 left-3 w-3 h-3 border-t border-l rounded-tl pointer-events-none", isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40")} />
                                        <div className={cn("absolute top-3 right-3 w-3 h-3 border-t border-r rounded-tr pointer-events-none", isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40")} />
                                        <div className={cn("absolute bottom-3 left-3 w-3 h-3 border-b border-l rounded-bl pointer-events-none", isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40")} />
                                        <div className={cn("absolute bottom-3 right-3 w-3 h-3 border-b border-r rounded-br pointer-events-none", isTrueSynergy ? "border-emerald-500/40" : "border-blue-500/40")} />

                                        {/* header badge */}
                                        <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-full backdrop-blur z-10 border", isTrueSynergy ? "bg-emerald-900/50 border-emerald-500/30" : "bg-blue-900/50 border-blue-500/30")}>
                                            <span className={cn("text-[8px] md:text-[9px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase", isTrueSynergy ? "text-emerald-400" : "text-blue-400")}>Target</span>
                                        </div>

                                        {/* ring */}
                                        <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center z-10">
                                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                                                <motion.circle
                                                    cx="50" cy="50" r="42"
                                                    stroke={isTrueSynergy ? "#34d399" : "#60a5fa"} strokeWidth="8" fill="none" strokeLinecap="round"
                                                    strokeDasharray="264"
                                                    initial={{ strokeDashoffset: 264 }}
                                                    whileInView={{ strokeDashoffset: 264 - (264 * projectedScore) / 100 }}
                                                    transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className={cn("text-2xl md:text-3xl font-[1000] leading-none", isTrueSynergy ? "text-emerald-400" : "text-blue-400")}>{projectedScore}</span>
                                                <span className={cn("text-[7px] md:text-[8px] font-black tracking-widest mt-0.5", isTrueSynergy ? "text-emerald-700" : "text-blue-700")}>PTS</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="relative w-full max-w-4xl mx-auto rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 p-5 md:p-10 flex flex-wrap items-center justify-center gap-8 md:gap-12"
                                >
                                    <div className="w-full md:flex-1 md:min-w-[280px] space-y-6">
                                        <div className="space-y-2">
                                            <span className="text-xs font-black text-emerald-500 tracking-widest uppercase">AI Recommendation</span>
                                            <h4 className="text-xl sm:text-2xl md:text-4xl font-[1000] text-white tracking-tight break-words">
                                                Pori’s <span className="text-emerald-400">Synergy Pick</span>
                                            </h4>
                                        </div>
                                        <div className="bg-white/5 p-5 md:p-6 rounded-2xl border border-white/5">
                                            <div className="text-slate-300 text-xs md:text-sm leading-relaxed mb-4">
                                                {language === 'ko' 
                                                    ? `${recName}은(는) 현재 드시는 성분들과 뛰어난 영양학적 상호작용을 보여줍니다. 특히 흡수율이 검증된 최적의 제품을 추천해 드립니다.`
                                                    : `${recName} shows excellent nutritional interaction with your current stack. Here is a hand-picked product for maximum absorption.`}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full border border-emerald-500/30 overflow-hidden">
                                                    <img src="/hero-pori.png" alt="Pori" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">AI Counselor Pori</span>
                                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Medical Grade Engine</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-[320px] bg-slate-950/50 rounded-[2rem] border border-white/10 p-6 md:p-8 flex flex-col items-center gap-6">
                                        <div className="text-[100px] drop-shadow-2xl">💊</div>
                                        <div className="text-center">
                                            <h5 className="text-2xl font-[1000] text-white tracking-tight">{recName}</h5>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Recommended Partner</p>
                                        </div>
                                        <a
                                            href={buyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center gap-2 font-black transition-all shadow-lg active:scale-95"
                                        >
                                            <ShoppingCart size={18} />
                                            <span>{language === 'ko' ? "최저가 확인" : "Check Price"}</span>
                                        </a>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })()}

                    {/* 영자's 프리미엄 분석 리셋 섹션 (대표님, 이 버튼 정말 예쁘죠? ✨) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="pt-20 pb-12 flex flex-col items-center gap-6 relative z-10"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                {language === 'ko' ? '다른 영양제도 궁금하신가요?' : 'Curious about other combinations?'}
                            </p>
                            <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                        </div>
                        
                        <button
                            onClick={() => {
                                clearBasket();
                                router.push("/");
                            }}
                            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] active:scale-95"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <RefreshCcw size={18} className="text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
                            <span className="text-xs md:text-sm font-black text-white/90 group-hover:text-white transition-colors uppercase tracking-widest">
                                {language === 'ko' ? '새로운 조합 분석하기' : 'Analyze New Combination'}
                            </span>
                        </button>
                    </motion.div>
                </div>
            </motion.div>
            {/* 공유 피드백 토스트 (영자 실장의 배려 ✨) */}
            <Toast 
                show={toast.show} 
                message={toast.message} 
                onClose={() => setToast({ ...toast, show: false })} 
            />
        </div>
    );
}

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
    RefreshCcw,
    FlaskConical
} from "lucide-react";
import { cn, encodeShareParams } from "@/lib/utils";
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
    const [isExiting, setIsExiting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!result || !result.ingredients) {
        return <div className="p-20 text-center text-slate-400">{t.common.loading}...</div>;
    }

    const getShareUrlAndData = () => {
        const slugs = result.ingredients.map(ing => ing.slug);
        const encoded = encodeShareParams(slugs);
        const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
        const canonicalBase = isLocal ? window.location.origin : "https://zestpair.com";
        const shareUrl = `${canonicalBase}/analysis?v=${encoded}`;
        return { shareUrl, score: result.score };
    };

    const handleKakaoShare = () => {
        const { shareUrl, score } = getShareUrlAndData();

        let imageFileName = "pori-0.png";
        if (score === 100) imageFileName = "pori-100.png";
        else if (score >= 90) imageFileName = "pori-90.png";
        else if (score >= 70) imageFileName = "pori-70.png";
        else if (score >= 50) imageFileName = "pori-50.png";

        // 이미지는 Kakao 서버가 접근 가능해야 하므로, 로컬 테스트 중에도 운영 서버 이미지를 참조하게 합니다.
        const imageBase = "https://zestpair.com";
        const targetImageUrl = `${imageBase}/images/share/${imageFileName}`;

        const title = language === 'ko' 
            ? `🚨 내 약통 점수는 ${score}점! (치명적 충돌 주의)` 
            : `🚨 Supplement Match Score: ${score}pts!`;
        const description = language === 'ko'
            ? "비싼 소변을 만들고 계시지는 않나요? Pori AI에게 영양제 궁합을 채점받아보세요."
            : "Check your active supplement interactions instantly!";

        if (typeof window !== "undefined" && (window as any).Kakao) {
            const Kakao = (window as any).Kakao;
            try {
                if (!Kakao.isInitialized()) {
                    Kakao.init("27a049c799662857ed882c2639461392");
                }
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: title,
                        description: description,
                        imageUrl: targetImageUrl,
                        imageWidth: 800,
                        imageHeight: 800,
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                    buttons: [
                        {
                            title: language === 'ko' ? '내 약통 점수 확인하기' : 'Check my score',
                            link: {
                                mobileWebUrl: shareUrl,
                                webUrl: shareUrl,
                            },
                        },
                    ],
                });
            } catch (err) {
                console.error("Kakao Share Error:", err);
                alert("카카오톡 실행 중 오류가 발생했습니다. (설정 확인 필요)");
            }
        } else {
            alert("카카오톡 모듈을 불러오는 중입니다. 잠시 후 상단 아이콘이나 다시 시도해 주세요!");
        }
    };

    const handleNativeShare = async () => {
        const { shareUrl, score } = getShareUrlAndData();
        const title = language === 'ko' 
            ? `🚨 내 약통 점수는 ${score}점! (치명적 충돌 주의)` 
            : `🚨 Supplement Match Score: ${score}pts!`;

        const shareData = {
            title: "ZestPair | 영양제 궁합 분석 결과",
            text: title,
            url: shareUrl
        };

        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setToast({
                    show: true,
                    message: language === 'ko' ? "링크가 복사되었습니다!" : "Link copied to clipboard!"
                });
                setTimeout(() => setToast({ show: false, message: "" }), 3000);
            } catch (err) {}
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
                animate={{ 
                    opacity: isExiting ? 0 : 1, 
                    y: isExiting ? 40 : 0,
                    scale: isExiting ? 0.98 : 1
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

                                {/* Share Action (Two-Track) */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full"
                                >
                                    {/* 1. 카카오톡 전용 공유 버튼 */}
                                    <Button
                                        onClick={handleKakaoShare}
                                        className="group relative h-12 md:h-14 rounded-full border border-[#FEE500]/30 hover:border-[#FEE500]/50 bg-[#FEE500] text-[#3A1D1D] font-black transition-all duration-300 shadow-[0_10px_30px_rgba(254,229,0,0.15)] w-full sm:w-[240px] flex items-center justify-center p-0 active:scale-95"
                                    >
                                        <div className="relative flex items-center gap-3 text-sm md:text-base">
                                            <img src="/icons/kakao.svg" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" alt="Kakao" />
                                            <span className="font-extrabold">{language === 'ko' ? "카카오톡 공유" : "Share via Kakao"}</span>
                                        </div>
                                    </Button>

                                    {/* 2. 라인(LINE) 전용 공유 버튼 */}
                                    <Button
                                        onClick={() => {
                                            const { shareUrl, score } = getShareUrlAndData();
                                            const title = language === 'ko' 
                                                ? `🚨 내 약통 점수는 ${score}점! (치명적 충돌 주의)` 
                                                : `🚨 Supplement Match Score: ${score}pts!`;
                                            const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
                                            window.open(lineUrl, '_blank');
                                        }}
                                        className="group relative h-12 md:h-14 rounded-full border border-[#00B900]/30 hover:border-[#00B900]/50 bg-[#00B900] text-white font-black transition-all duration-300 shadow-[0_10px_30px_rgba(0,185,0,0.15)] w-full sm:w-[240px] flex items-center justify-center p-0 active:scale-95"
                                    >
                                        <div className="relative flex items-center gap-3 text-sm md:text-base">
                                            <img src="/icons/line.svg" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" alt="LINE" />
                                            <span className="font-extrabold">{language === 'ko' ? "LINE 공유" : "LINE Share"}</span>
                                        </div>
                                    </Button>

                                    {/* 3. 일반 공유 (링크) 버튼 */}
                                    <Button
                                        onClick={handleNativeShare}
                                        variant="outline"
                                        className="group relative px-6 md:px-8 h-12 md:h-14 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-black transition-all duration-300 backdrop-blur-xl w-full sm:w-auto"
                                    >
                                        <div className="relative flex items-center gap-2 text-sm md:text-base">
                                            <Share2 size={16} />
                                            <span>{language === 'ko' ? "링크 복사" : "Copy Link"}</span>
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

                    {/* 3. Synergy Optimization Bridge (어필리에이트 전환 최적화 ✨) */}
                    {(() => {
                        const potentialSynergy = result.potentialSynergy;
                        if (!potentialSynergy) return null;

                        const currentScore = result.score;
                        const rawProjectedScore = result.projectedScore || currentScore;

                        // 100점일 때 점수가 떨어지는 시나리오 방지 (비즈니스 로직 ✨)
                        const displayProjectedScore = Math.max(currentScore, rawProjectedScore);

                        const isTrueSynergy = true;
                        const targetPartner = potentialSynergy.pair[1];
                        const recName = language === 'ko' ? targetPartner.name : targetPartner.name_en;

                        const buyUrl = language === 'ko'
                            ? `https://www.coupang.com/np/search?q=${encodeURIComponent(targetPartner.name)}`
                            : `https://www.amazon.com/s?k=${encodeURIComponent(targetPartner.name_en || targetPartner.name)}`;

                        const isPerfect = currentScore >= 100;

                        return (
                            <div className="pt-10 pb-5 space-y-10">
                                <div className="text-center space-y-4">
                                    <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border", isPerfect ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30")}>
                                        <Sparkles size={14} className={isPerfect ? "text-amber-400" : "text-emerald-400"} />
                                        <span className={cn("text-[11px] font-black uppercase tracking-widest", isPerfect ? "text-amber-400" : "text-emerald-400")}>
                                            {isPerfect ? "Perfect Harmony Collection" : "Synergy Optimization"}
                                        </span>
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-[1000] text-white tracking-tight leading-tight">
                                        {language === 'ko' ? (
                                            isPerfect ? (
                                                <>이미 완벽한 조합에 <span className="text-amber-300">[{recName}]</span>를 더해 시너지를 완성하세요!</>
                                            ) : (
                                                <>현재 조합에 <span className="text-emerald-400">[{recName}]</span>를 추가하면 <span className="text-amber-400">{displayProjectedScore}점</span>이 됩니다!</>
                                            )
                                        ) : (
                                            isPerfect ? (
                                                <>Complete your perfect stack with <span className="text-amber-300">[{recName}]</span>!</>
                                            ) : (
                                                <>Adding <span className="text-emerald-400">[{recName}]</span> could boost your score to <span className="text-amber-400">{displayProjectedScore}pts</span>!</>
                                            )
                                        )}
                                    </h3>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full pt-6 pb-2">
                                    {/* ── CURRENT HUD Gauge ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="relative flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] w-full max-w-[240px] md:max-w-[280px] overflow-hidden group/hud"
                                        style={{
                                            background: "radial-gradient(120% 120% at 50% 0%, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.9) 100%)",
                                            border: "1px solid rgba(148,163,184,0.1)",
                                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md -z-10" />
                                        
                                        {/* Luxury Scan Lines */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem] opacity-30 mix-blend-overlay">
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
                                        </div>

                                        {/* Futuristic Corner Brackets */}
                                        <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-slate-500/50 rounded-tl-md pointer-events-none drop-shadow-[0_0_3px_rgba(100,116,139,0.5)] transition-all group-hover/hud:translate-x-[-2px] group-hover/hud:translate-y-[-2px]" />
                                        <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-slate-500/50 rounded-tr-md pointer-events-none drop-shadow-[0_0_3px_rgba(100,116,139,0.5)] transition-all group-hover/hud:translate-x-[2px] group-hover/hud:translate-y-[-2px]" />
                                        <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-slate-500/50 rounded-bl-md pointer-events-none drop-shadow-[0_0_3px_rgba(100,116,139,0.5)] transition-all group-hover/hud:translate-x-[-2px] group-hover/hud:translate-y-[2px]" />
                                        <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-slate-500/50 rounded-br-md pointer-events-none drop-shadow-[0_0_3px_rgba(100,116,139,0.5)] transition-all group-hover/hud:translate-x-[2px] group-hover/hud:translate-y-[2px]" />

                                        {/* Subtle Tech Text */}
                                        <div className="absolute top-5 right-6 text-[6px] text-slate-500 font-mono tracking-widest opacity-50">SYS.ON</div>
                                        <div className="absolute bottom-5 left-6 text-[6px] text-slate-500 font-mono tracking-widest opacity-50">V.2.5</div>

                                        {/* header badge */}
                                        <div className="flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-slate-800/80 border border-slate-500/30 backdrop-blur shadow-[0_0_15px_rgba(71,85,105,0.2)] z-10">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase drop-shadow-sm">Current</span>
                                        </div>

                                        {/* ring container */}
                                        <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center z-10">
                                            {/* Outer Dashed Tech Ring */}
                                            <div className="absolute inset-2 rounded-full border border-dashed border-slate-600/20 animate-[spin_30s_linear_infinite]" />
                                            
                                            {/* Inner Glow Base */}
                                            <div className="absolute inset-6 rounded-full bg-slate-500/5 blur-xl group-hover/hud:bg-slate-500/10 transition-colors duration-700" />

                                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                <defs>
                                                    <linearGradient id="currentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#cbd5e1" />
                                                        <stop offset="100%" stopColor="#64748b" />
                                                    </linearGradient>
                                                </defs>
                                                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="none" />
                                                
                                                <motion.circle
                                                    cx="50" cy="50" r="42"
                                                    stroke="url(#currentGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
                                                    strokeDasharray="264"
                                                    initial={{ strokeDashoffset: 264 }}
                                                    whileInView={{ strokeDashoffset: 264 - (264 * result.score) / 100 }}
                                                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                                                    style={{ filter: "drop-shadow(0 0 6px rgba(148,163,184,0.4))" }}
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center justify-center mt-1">
                                                <span className="text-4xl md:text-5xl font-[1000] leading-none text-slate-200 tracking-tighter" style={{ textShadow: "0 2px 15px rgba(148,163,184,0.4)" }}>{result.score}</span>
                                                <span className="text-[8px] md:text-[10px] font-black text-slate-500 tracking-[0.3em] mt-1.5 drop-shadow-sm">PTS</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* ── ARROW ── */}
                                    <motion.div
                                        animate={{ y: [0, -4, 0], opacity: [0.3, 0.8, 0.3], filter: ["blur(1px)", "blur(0px)", "blur(1px)"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="flex md:flex-col items-center gap-2 md:gap-4 shrink-0"
                                    >
                                        <div className="hidden md:block h-12 w-[2px] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent" />
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                                            <ArrowRight className="text-emerald-300 rotate-90 md:rotate-0 relative z-10" size={28} strokeWidth={2.5} />
                                        </div>
                                        <div className="hidden md:block h-12 w-[2px] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent" />
                                    </motion.div>

                                    {/* ── TARGET HUD Gauge ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className="relative flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] w-full max-w-[240px] md:max-w-[280px] overflow-hidden group/hud"
                                        style={{
                                            background: isPerfect
                                                ? "radial-gradient(120% 120% at 50% 0%, rgba(69,26,3,0.6) 0%, rgba(20,8,0,0.95) 100%)"
                                                : "radial-gradient(120% 120% at 50% 0%, rgba(2,44,34,0.6) 0%, rgba(2,6,23,0.95) 100%)",
                                            border: isPerfect
                                                ? "1px solid rgba(251,191,36,0.15)"
                                                : "1px solid rgba(16,185,129,0.15)",
                                            boxShadow: isPerfect
                                                ? "0 30px 60px -15px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 0 40px rgba(251,191,36,0.08)"
                                                : "0 30px 60px -15px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 0 40px rgba(16,185,129,0.08)"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/20 backdrop-blur-md -z-10" />

                                        {/* Luxury Scan Lines */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem] opacity-30 mix-blend-overlay">
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
                                        </div>

                                        {/* Futuristic Corner Brackets */}
                                        <div className={cn("absolute top-4 left-4 w-5 h-5 border-t border-l rounded-tl-md pointer-events-none transition-all duration-500 group-hover/hud:translate-x-[-2px] group-hover/hud:translate-y-[-2px]", isPerfect ? "border-amber-500/70 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" : "border-emerald-400/70 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]")} />
                                        <div className={cn("absolute top-4 right-4 w-5 h-5 border-t border-r rounded-tr-md pointer-events-none transition-all duration-500 group-hover/hud:translate-x-[2px] group-hover/hud:translate-y-[-2px]", isPerfect ? "border-amber-500/70 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" : "border-emerald-400/70 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]")} />
                                        <div className={cn("absolute bottom-4 left-4 w-5 h-5 border-b border-l rounded-bl-md pointer-events-none transition-all duration-500 group-hover/hud:translate-x-[-2px] group-hover/hud:translate-y-[2px]", isPerfect ? "border-amber-500/70 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" : "border-emerald-400/70 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]")} />
                                        <div className={cn("absolute bottom-4 right-4 w-5 h-5 border-b border-r rounded-br-md pointer-events-none transition-all duration-500 group-hover/hud:translate-x-[2px] group-hover/hud:translate-y-[2px]", isPerfect ? "border-amber-500/70 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" : "border-emerald-400/70 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]")} />

                                        {/* Subtle Tech Text */}
                                        <div className={cn("absolute top-5 right-6 text-[6px] font-mono tracking-widest opacity-60", isPerfect ? "text-amber-400" : "text-emerald-400")}>MAX.P</div>
                                        <div className={cn("absolute bottom-5 left-6 text-[6px] font-mono tracking-widest opacity-60", isPerfect ? "text-amber-400" : "text-emerald-400")}>SYNC</div>

                                        {/* header badge */}
                                        <div className={cn("flex items-center gap-2 px-3 py-1 mb-5 rounded-full backdrop-blur shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 border", isPerfect ? "bg-amber-950/60 border-amber-500/40" : "bg-emerald-950/60 border-emerald-500/40")}>
                                            <span className={cn("text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase drop-shadow-md", isPerfect ? "text-amber-400" : "text-emerald-400")}>Target</span>
                                        </div>

                                        {/* ring container */}
                                        <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center z-10">
                                            {/* Outer Dashed Tech Ring */}
                                            <div className={cn("absolute inset-2 rounded-full border border-dashed animate-[spin_20s_linear_infinite_reverse]", isPerfect ? "border-amber-500/30" : "border-emerald-500/30")} />
                                            
                                            {/* Inner Intense Glow Base */}
                                            <motion.div 
                                                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                className={cn("absolute inset-4 rounded-full blur-[24px] -z-10", isPerfect ? "bg-amber-500/20" : "bg-emerald-500/25")} 
                                            />

                                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                <defs>
                                                    <linearGradient id="targetGradientPerfect" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#fef3c7" />
                                                        <stop offset="50%" stopColor="#f59e0b" />
                                                        <stop offset="100%" stopColor="#b45309" />
                                                    </linearGradient>
                                                    <linearGradient id="targetGradientEmer" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#a7f3d0" />
                                                        <stop offset="50%" stopColor="#10b981" />
                                                        <stop offset="100%" stopColor="#047857" />
                                                    </linearGradient>
                                                </defs>
                                                
                                                {/* Track */}
                                                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="none" />

                                                {/* Progress Ring with Glow */}
                                                <motion.circle
                                                    cx="50" cy="50" r="42"
                                                    stroke={isPerfect ? "url(#targetGradientPerfect)" : "url(#targetGradientEmer)"} strokeWidth="8" fill="none" strokeLinecap="round"
                                                    strokeDasharray="264"
                                                    initial={{ strokeDashoffset: 264 }}
                                                    whileInView={{ strokeDashoffset: 264 - (264 * displayProjectedScore) / 100 }}
                                                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                                    style={{ 
                                                        filter: isPerfect ? "drop-shadow(0 0 12px rgba(245,158,11,0.8))" : "drop-shadow(0 0 12px rgba(16,185,129,0.8))"
                                                    }}
                                                />
                                            </svg>
                                            
                                            <div className="absolute flex flex-col items-center justify-center mt-1">
                                                <motion.span 
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    whileInView={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.5, delay: 1 }}
                                                    className={cn("text-4xl md:text-5xl font-[1000] leading-none tracking-tighter", isPerfect ? "text-amber-300" : "text-emerald-300")} 
                                                    style={{ textShadow: isPerfect ? "0 4px 20px rgba(245,158,11,0.6)" : "0 4px 20px rgba(16,185,129,0.6)" }}
                                                >
                                                    {displayProjectedScore}
                                                </motion.span>
                                                <span className={cn("text-[8px] md:text-[10px] font-black tracking-[0.3em] mt-1.5 relative drop-shadow-md", isPerfect ? "text-amber-500" : "text-emerald-500")}>
                                                    PTS
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative w-full max-w-4xl mx-auto"
                                >
                                    {/* Background Glow */}
                                    <div className="absolute -inset-4 bg-emerald-500/10 blur-[100px] opacity-40 pointer-events-none" />

                                    <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-900/40 border border-white/10 backdrop-blur-3xl p-6 md:p-12 shadow-2xl">
                                        {/* Top Accents */}
                                        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                                        <div className="flex flex-col lg:flex-row items-stretch gap-10 md:gap-16">
                                            {/* Left: AI Rationale Zone */}
                                            <div className="flex-1 space-y-8 w-full flex flex-col">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                                            AI Core v2.5 Verified
                                                        </div>
                                                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Perfect Harmony</div>
                                                    </div>
                                                    <h4 className="text-3xl md:text-5xl font-[1000] text-white tracking-tighter leading-[1.1] md:leading-[1.05]">
                                                        The <span className="text-emerald-400">Perfect</span><br />
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Nutritional Link.</span>
                                                    </h4>
                                                </div>

                                                {/* The Magic Reason Box */}
                                                <div className="relative flex-1 p-6 md:p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 group/reason overflow-hidden flex flex-col justify-center">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/reason:opacity-100 transition-opacity duration-700" />

                                                    <div className="relative z-10 space-y-4">
                                                        <div className="flex items-center gap-2 text-emerald-400/80">
                                                            <FlaskConical size={14} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'ko' ? "영양학적 근거" : "Scientific Rationale"}</span>
                                                        </div>
                                                        <h5 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                                            {language === 'ko'
                                                                ? (potentialSynergy.interaction?.title || "최상의 시너지 발견")
                                                                : (potentialSynergy.interaction?.title_en || "Optimal Synergy Found")}
                                                        </h5>
                                                        <p className="text-slate-300 text-sm md:text-lg leading-relaxed font-medium">
                                                            {(() => {
                                                                const reason = language === 'ko'
                                                                    ? (potentialSynergy.interaction?.reason || `${recName}은(는) 현재 드시는 성분들과 뛰어난 영양학적 조화를 이룹니다. 신체 활력을 극대화할 수 있는 최적의 배합입니다.`)
                                                                    : (potentialSynergy.interaction?.reason_en || `${recName} harmonizes perfectly with your current nutritional stack for maximum vitality.`);

                                                                // Highlight Logic ✨
                                                                const highlightTerms = [
                                                                    language === 'ko' ? potentialSynergy.pair[0].name : potentialSynergy.pair[0].name_en,
                                                                    recName
                                                                ].filter(Boolean);

                                                                if (highlightTerms.length === 0) return reason;

                                                                const regex = new RegExp(`(${highlightTerms.join('|')})`, 'gi');
                                                                const parts = reason.split(regex);

                                                                return parts.map((part, i) => (
                                                                    regex.test(part) ? (
                                                                        <span key={i} className="text-emerald-400 font-black relative px-0.5">
                                                                            {part}
                                                                            <span className="absolute bottom-0.5 left-0 right-0 h-1.5 bg-emerald-500/20 -z-10 rounded-sm" />
                                                                        </span>
                                                                    ) : part
                                                                ));
                                                            })()}
                                                        </p>
                                                    </div>

                                                    {/* Bottom Trust Line */}
                                                    <div className="relative z-10 flex items-center gap-3 pt-6 mt-6 border-t border-white/5">
                                                        <div className="w-10 h-10 rounded-full border border-emerald-500/30 overflow-hidden shrink-0">
                                                            <img src="/hero-pori.png" alt="Pori" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter">AI Counselor Pori</span>
                                                            <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-widest">Molecular Precision Mapping</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Product Visual Card */}
                                            <div className="w-full lg:w-[340px] shrink-0 flex flex-col">
                                                <div className="relative h-full p-8 md:p-10 rounded-[3rem] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 flex flex-col items-center justify-between gap-8 shadow-2xl group/product">
                                                    {/* Floating Decoration */}
                                                    <div className="flex-1 flex items-center justify-center">
                                                        <motion.div
                                                            animate={{ y: [0, -10, 0] }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                            className="text-[100px] drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)] group-hover/product:scale-110 transition-transform duration-500"
                                                        >
                                                            {targetPartner.icon_emoji}
                                                        </motion.div>
                                                    </div>

                                                    <div className="text-center space-y-4 w-full">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.25em]">Exclusive Recommendation</span>
                                                            <h5 className="text-2xl md:text-3xl font-[1000] text-white tracking-tight">{recName}</h5>
                                                        </div>

                                                        <a
                                                            href={buyUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-3 w-full py-5 rounded-[1.5rem] bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm tracking-widest transition-all shadow-[0_10px_30px_rgba(16,185,129,0.4)] active:scale-95 group/btn overflow-hidden relative"
                                                        >
                                                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                                            <ShoppingCart size={18} />
                                                            <span>{language === 'ko' ? "최저가 확인" : "BUY NOW"}</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
                                // 1. 먼저 부드러운 퇴장 애니메이션을 시작합니다.
                                setIsExiting(true);
                                
                                // 2. 애니메이션이 어느 정도 진행된 후(약 400ms) 실제 이동을 시작합니다.
                                setTimeout(() => {
                                    router.push("/");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                    
                                    // 3. 페이지가 완전히 넘어가기 직전에 바구니를 비워 에러 화면을 방지합니다.
                                    setTimeout(() => {
                                        clearBasket();
                                    }, 200);
                                }, 400);
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

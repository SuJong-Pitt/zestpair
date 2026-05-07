"use client";

import { memo, useMemo, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Sparkles, ArrowRight, ShoppingCart, FlaskConical, TrendingUp, AlertCircle, Activity, Zap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { AnalysisResult, Ingredient } from "@/types/database";

// --- Helpers ---
const renderIcon = (icon: string) => {
    if (icon === "sparkles") return "✨";
    return icon;
};

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
                    <span className="text-[10px] font-bold text-white tracking-widest leading-none">{score >= 100 ? (language === 'ko' ? "최적" : language === 'ja' ? "最適" : language === 'zh' ? "最佳" : "OPTIMAL") : "SYNCING"}</span>
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
    const [popularIngredients, setPopularIngredients] = useState<Ingredient[]>([]);

    useEffect(() => {
        const fetchPopular = async () => {
            const { data } = await supabase
                .from("ingredients")
                .select("*")
                .eq("is_popular", true)
                .neq("category", "drugs")
                .limit(10); // Fetch more for variety

            if (data) {
                const currentIds = result.ingredients.map(ing => ing.id);
                if (result.potentialSynergy?.pair[1].id) {
                    currentIds.push(result.potentialSynergy.pair[1].id);
                }

                const populars = data as Ingredient[];
                const filtered = populars.filter(ing => !currentIds.includes(ing.id));
                
                // Shuffle logic for fresh variety on each visit
                const shuffled = [...filtered].sort(() => Math.random() - 0.5);
                setPopularIngredients(shuffled.slice(0, 2));
            }
        };
        fetchPopular();
    }, [result.ingredients, result.potentialSynergy]);

    const optimizerData = useMemo(() => {
        const potentialSynergy = result.potentialSynergy;
        if (!potentialSynergy) return null;

        const currentScore = result.score;
        const rawProjectedScore = result.projectedScore || currentScore;
        const displayProjectedScore = Math.max(currentScore, rawProjectedScore);

        const targetPartner = potentialSynergy.pair[1];
        const recName = language === 'ko' ? targetPartner.name : 
                        language === 'ja' ? (targetPartner.name_ja || targetPartner.name_en || targetPartner.name) : 
                        language === 'zh' ? (targetPartner.name_zh || targetPartner.name_en || targetPartner.name) : 
                        (targetPartner.name_en || targetPartner.name);

        const buyUrl = language === 'ko'
            ? (targetPartner.coupang_url || `https://www.coupang.com/np/search?q=${encodeURIComponent(targetPartner.name)}`)
            : language === 'ja'
            ? (targetPartner.rakuten_url || `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(targetPartner.rakuten_search_keyword || targetPartner.name_ja || targetPartner.name)}`)
            : language === 'zh'
            ? (targetPartner.tmall_url || `https://s.taobao.com/search?q=${encodeURIComponent(targetPartner.tmall_search_keyword || targetPartner.name_zh || targetPartner.name)}`)
            : (targetPartner.amazon_url || `https://www.amazon.com/s?k=${encodeURIComponent(targetPartner.amazon_search_keyword || targetPartner.name_en || targetPartner.name)}`);

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
                'platform': language === 'ko' ? 'coupang' : language === 'ja' ? 'rakuten' : language === 'zh' ? 'tmall' : 'amazon'
            });
        }
    };

    const platformConfig = useMemo(() => {
        switch(language) {
            case 'ko': return { label: "쿠팡 로켓배송", bg: "from-[#cb1400] to-[#015199]", shadow: "rgba(203,20,0,0.4)" };
            case 'ja': return { label: "Rakuten GO", bg: "from-[#bf0000] to-[#df0000]", shadow: "rgba(191,0,0,0.4)" };
            case 'zh': return { label: "Tmall GO", bg: "from-[#ff0036] to-[#000000]", shadow: "rgba(255,0,54,0.4)" };
            default: return { label: "Amazon GO", bg: "from-[#232f3e] to-[#ff9900]", shadow: "rgba(255,153,0,0.35)" };
        }
    }, [language]);

    return (
        <motion.div
            id="synergy-optimizer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-10 pb-5 space-y-12"
        >
            {/* Direction A: Vertical Story Flow */}
            <div className="flex flex-col gap-5 px-2 md:px-4 pt-6 md:pt-10 pb-2">

                {/* 1. AI Discovery Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2"
                >
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/30" />
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        />
                        <span className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                            {language === 'ko' ? "AI 최적 파트너 발견" : language === 'ja' ? "AI最適パートナー発見" : language === 'zh' ? "发现AI最佳拍档" : "AI Optimal Match Found"}
                        </span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/30" />
                </motion.div>

                {/* 2. Large Ingredient Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-2xl md:rounded-3xl bg-white/[0.03] border border-emerald-500/20 p-5 md:p-7 flex items-center gap-5"
                >
                    {/* Left accent */}
                    <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full bg-emerald-400/60" />

                    {/* Floating emoji */}
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-5xl md:text-6xl shrink-0 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    >
                        {renderIcon(targetPartner.icon_emoji)}
                    </motion.div>

                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[9px] md:text-[10px] font-black text-emerald-400/70 uppercase tracking-[0.3em]">
                            {language === 'ko' ? "AI 선정 최적 파트너" : language === 'ja' ? "AI選定最適パートナー" : language === 'zh' ? "AI评选最佳拍档" : "AI Selected Partner"}
                        </span>
                        <h2 className="text-2xl md:text-4xl font-[1000] text-white tracking-tighter leading-none truncate">
                            {recName}
                        </h2>
                        <span className="text-[11px] md:text-[13px] font-bold text-slate-400">
                            {language === 'ko'
                                ? `현재 조합의 마지막 퍼즐 — 시너지의 완성`
                                : language === 'ja'
                                ? `現在の組み合わせの最後のパズル — シナジーの完成`
                                : language === 'zh'
                                ? `当前组合的最后一块拼图 — 协同效应的完成`
                                : `The final piece — completes your synergy stack`}
                        </span>
                    </div>

                    {/* Sparkle */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-3 right-4"
                    >
                        <Sparkles className="text-emerald-400 w-4 h-4 fill-emerald-500/20" />
                    </motion.div>
                </motion.div>

                {/* 3. Score Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-white/[0.02] border border-white/8 p-4 md:p-6 space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">
                            {language === 'ko' ? "점수 업그레이드 경로" : language === 'ja' ? "スコアアップグレード経路" : language === 'zh' ? "分数升级路径" : "Score Upgrade Path"}
                        </span>
                        <span className="text-[10px] font-black text-emerald-400">
                            +{displayProjectedScore - currentScore} {language === 'ko' ? "점 상승 가능" : language === 'ja' ? "点アップ可能" : language === 'zh' ? "分提升可能" : "pts gain"}
                        </span>
                    </div>

                    {/* Progress track */}
                    <div className="relative h-3 md:h-4 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${currentScore}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-400"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${displayProjectedScore}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.6, ease: "easeOut", delay: 0.6 }}
                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-40"
                        />
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="flex flex-col items-start">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{language === 'ko' ? "현재" : language === 'ja' ? "現在" : language === 'zh' ? "当前" : "Current"}</span>
                            <span className="text-2xl md:text-3xl font-[1000] text-white/70 tracking-tighter">{currentScore}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <TrendingUp size={16} className="text-emerald-400" />
                            </motion.div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{language === 'ko' ? "달성 가능" : language === 'ja' ? "達成可能" : language === 'zh' ? "可达成" : "Reachable"}</span>
                            <span className={cn(
                                "text-2xl md:text-3xl font-[1000] tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]",
                                isPerfect ? "text-amber-400" : "text-emerald-400"
                            )}>{displayProjectedScore}</span>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Insight Bullets */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2.5"
                >
                    {[
                        language === 'ko'
                            ? `지금 ${recName}을(를) 추가하면 점수가 ${currentScore}점 → ${displayProjectedScore}점으로 상승합니다.`
                            : language === 'ja'
                            ? `今 ${recName} を追加すると、スコアが ${currentScore}点 → ${displayProjectedScore}点 に上昇します。`
                            : language === 'zh'
                            ? `现在添加 ${recName}，分数将从 ${currentScore}分 提升至 ${displayProjectedScore}分。`
                            : `Adding ${recName} now will boost your score from ${currentScore} → ${displayProjectedScore} pts.`,
                        language === 'ko'
                            ? `현재 잠재력의 ${100 - currentScore}%가 아직 활성화되지 않은 상태입니다.`
                            : language === 'ja'
                            ? `現在のポテンシャルの ${100 - currentScore}% がまだ活性化されていない状態です。`
                            : language === 'zh'
                            ? `当前潜力的 ${100 - currentScore}% 尚未被激活。`
                            : `${100 - currentScore}% of your stack's potential is still untapped.`
                    ].map((text, i) => (
                        <div key={i} className="flex items-start gap-3 px-1">
                            <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            </div>
                            <p className="text-[12px] md:text-[14px] text-slate-300 leading-relaxed font-medium">
                                {text}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Scroll hint → 아래 프리미엄 카드로 자연 연결 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-1.5 pt-1 pb-2"
                >
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                        {language === 'ko' ? "구매 상세 정보 확인하기" : language === 'ja' ? "購入詳細情報を確認する" : language === 'zh' ? "查看购买详细信息" : "See Purchase Details"}
                    </span>
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                    >
                        <TrendingUp size={10} className="text-emerald-400 rotate-90" />
                    </motion.div>
                </motion.div>
            </div>



            <div className="relative mt-6 overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-slate-950/60 border border-white/10 backdrop-blur-3xl p-5 md:p-10 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                {/* Subtle glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald-500/[0.06] blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6 md:gap-8">

                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-6 bg-emerald-500/40" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                                {language === 'ko' ? "AI 임상 결론" : language === 'ja' ? "AI臨床結論" : language === 'zh' ? "AI临床结论" : "Clinical Conclusion"}
                            </span>
                        </div>
                        <h4 className={cn(
                            "text-[22px] md:text-4xl font-[1000] text-white tracking-tight leading-snug",
                            (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                        )}>
                            {language === 'ko' ? (
                                <>당신의 건강 자산,{" "}
                                    <span className="text-emerald-400">마지막 연결</span>로 완성하세요.
                                </>
                            ) : language === 'ja' ? (
                                <>あなたの健康資産、{" "}
                                    <span className="text-emerald-400">最後のピース</span>で完成させてください。
                                </>
                            ) : language === 'zh' ? (
                                <>您的健康资产，{" "}
                                    通过<span className="text-emerald-400">最后的链接</span>来完成。
                                </>
                            ) : (
                                <>Complete your health investment with the{" "}
                                    <span className="text-emerald-400">Final Link.</span>
                                </>
                            )}
                        </h4>
                    </div>

                    {/* Minimal Product Card */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="relative rounded-2xl md:rounded-3xl bg-white/[0.03] border border-emerald-500/20 p-4 md:p-7 flex items-center gap-4 md:gap-5 overflow-hidden"
                    >
                        {/* Subtle sweep shine */}
                        <motion.div
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-12 pointer-events-none"
                        />
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-emerald-400/50" />

                        {/* Emoji — 모바일에서 작게 */}
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="text-3xl md:text-6xl shrink-0 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] pl-2"
                        >
                            {renderIcon(targetPartner.icon_emoji)}
                        </motion.div>

                        {/* Text block — flex-1 so it takes all remaining space */}
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <span className="text-[8px] md:text-[9px] font-black text-emerald-400/60 uppercase tracking-[0.2em] whitespace-nowrap">
                                {language === 'ko' ? "AI 선정 파트너" : language === 'ja' ? "AI選定パートナー" : language === 'zh' ? "AI评选拍档" : "AI Selected Partner"}
                            </span>
                            <h5 className={cn(
                                "text-lg md:text-3xl font-[1000] text-white tracking-tighter leading-tight",
                                (language === 'ja' || language === 'zh') ? "break-all" : "break-keep"
                            )}>
                                {recName}
                            </h5>
                            <span className={cn(
                                "text-[10px] md:text-[13px] text-slate-400 font-medium",
                                (language === 'ja' || language === 'zh') ? "break-all" : "break-keep"
                            )}>
                                {language === 'ko' ? "현재 조합의 마지막 퍼즐" : language === 'ja' ? "現在の組み合わせの最後のパズル" : language === 'zh' ? "当前组合的最后一块拼图" : "The final piece of your stack"}
                            </span>
                        </div>

                        {/* +점수 뱃지 — 모바일에서 숨김 (위 프로그레스 바에 이미 표시됨) */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="hidden md:flex ml-auto shrink-0 flex-col items-center px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25"
                        >
                            <span className="text-lg md:text-2xl font-[1000] text-emerald-400 leading-none">
                                +{displayProjectedScore - currentScore}
                            </span>
                            <span className="text-[7px] font-black text-emerald-400/60 uppercase tracking-wider">
                                {language === 'ko' ? "점" : language === 'ja' ? "点" : language === 'zh' ? "分" : "pts"}
                            </span>
                        </motion.div>
                    </motion.div>


                    {/* Insight Cards — outside, readable */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Synergy insight */}
                        <div className="flex items-start gap-3 p-4 md:p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15">
                            <div className="mt-0.5 w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <FlaskConical size={15} className="text-emerald-400" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                    {language === 'ko' ? "시너지 분석" : language === 'ja' ? "シナジー分析" : language === 'zh' ? "协同分析" : "Synergy Analysis"}
                                </span>
                                <p className={cn(
                                    "text-[12px] md:text-[13px] text-slate-300 leading-relaxed font-medium",
                                    (language === 'ja' || language === 'zh') ? "break-all" : "break-keep"
                                )}>
                                    {language === 'ko'
                                        ? (optimizerData.potentialSynergy.interaction?.reason || `${recName}은(는) 현재 드시는 성분들과 뛰어난 시너지를 이루어 효능을 극대화합니다.`)
                                        : language === 'ja'
                                        ? (optimizerData.potentialSynergy.interaction?.reason_ja || `${recName} は、現在服用中の成分と優れた相乗効果を発揮し、効能を最大限に高めます。`)
                                        : language === 'zh'
                                        ? (optimizerData.potentialSynergy.interaction?.reason_zh || `${recName} 与您当前服用的成分具有出色的协同作用，可最大限度地提高功效。`)
                                        : (optimizerData.potentialSynergy.interaction?.reason_en || `${recName} creates excellent synergy with your current stack.`)}
                                </p>
                            </div>
                        </div>

                        {/* Opportunity cost */}
                        <div className="flex items-start gap-3 p-4 md:p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/15">
                            <div className="mt-0.5 w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                                <AlertCircle size={15} className="text-amber-400" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <span className="block text-[9px] font-black text-amber-400 uppercase tracking-[0.2em]">
                                    {language === 'ko' ? "기회 비용 경고" : language === 'ja' ? "機会費用の警告" : language === 'zh' ? "机会成本警告" : "Efficiency Recovery"}
                                </span>
                                <p className={cn(
                                    "text-[12px] md:text-[13px] text-slate-300 leading-relaxed font-medium",
                                    (language === 'ja' || language === 'zh') ? "break-all" : "break-keep"
                                )}>
                                    {language === 'ko'
                                        ? `현재 잠재 시너지의 약 ${efficiencyGain}%를 놓치고 있습니다. ${recName}을 추가하면 효능을 100% 활성화할 수 있습니다.`
                                        : language === 'ja'
                                        ? `現在の潜在的なシナジーの約 ${efficiencyGain}% を逃しています。 ${recName} を追加すると、効能を 100% 活性化できます。`
                                        : language === 'zh'
                                        ? `您目前错失了约 ${efficiencyGain}% 的潜在协同效应。添加 ${recName} 可以 100% 激活功效。`
                                        : `You are missing ~${efficiencyGain}% of potential synergy. Add ${recName} to unlock your stack's full potential.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Full-width standalone CTA */}
                    <motion.a
                        href={buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleAffiliateClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                            "relative w-full py-4 md:py-5 rounded-2xl flex items-center justify-between px-5 md:px-7 overflow-hidden group/cta transition-all",
                            "bg-gradient-to-r shadow-xl",
                            platformConfig.bg
                        )}
                        style={{ boxShadow: `0 12px 40px -10px ${platformConfig.shadow}` }}
                    >
                        {/* Sweep on hover */}
                        <motion.div
                            variants={{ initial: { x: '-100%', opacity: 0 }, hover: { x: '200%', opacity: 1, transition: { duration: 1.2, repeat: Infinity, ease: "linear" } } }}
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[30deg] z-10 pointer-events-none"
                        />
                        <div className="flex items-center gap-3 z-20">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <ShoppingCart size={17} fill="currentColor" className="text-white" />
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                                    {platformConfig.label}
                                </span>
                                <span className="text-[14px] md:text-[16px] font-black text-white">
                                    {language === 'ko' ? `${recName} 지금 바로 추가하기` : language === 'ja' ? `${recName}を今すぐ追加する` : language === 'zh' ? `立即添加${recName}` : `Add ${recName} Now`}
                                </span>
                            </div>
                        </div>
                        <ExternalLink size={16} className="text-white/50 group-hover/cta:text-white transition-colors z-20 shrink-0" />
                    </motion.a>

                    {/* Affiliate Disclosure */}
                    {language === 'ko' && (
                        <p className="text-center text-[9px] text-slate-600 leading-relaxed pt-1">
                            이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                        </p>
                    )}
                    {language === 'ja' && (
                        <p className="text-center text-[9px] text-slate-600 leading-relaxed pt-1">
                            このページは楽天アフィリエイト・プログラムに参加しており、商品の購入により紹介料を受領する場合があります。
                        </p>
                    )}
                    {language === 'zh' && (
                        <p className="text-center text-[9px] text-slate-600 leading-relaxed pt-1">
                            本页面包含推广链接，如果您通过链接购买，我们可能会获得一定比例的佣金。
                        </p>
                    )}
                </div>
            </div>



            {/* Popular Selection - Secondary Engagement Section (MOVED DOWN HERE) */}
            {popularIngredients.length > 0 && (
                <div className="pt-20 space-y-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-white/5">
                            <TrendingUp size={10} className="text-slate-400" />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                                {language === 'ko' ? "사용자들이 가장 많이 찾는 영양제" : language === 'ja' ? "ユーザーが最も多く探しているサプリメント" : language === 'zh' ? "用户最常搜索的补充剂" : "Global Popular Selections"}
                            </span>
                        </div>
                        <h4 className="text-xl md:text-3xl font-black text-white tracking-tight">
                            {language === 'ko' ? "놓치면 아쉬운 대중적인 인기템" : language === 'ja' ? "見逃せない人気のアイテム" : language === 'zh' ? "不容错过的热门单品" : "Don't Miss These Trending Items"}
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto">
                        {popularIngredients.map((ing) => (
                            <motion.a
                                key={ing.id}
                                href={language === 'ko' 
                                    ? (ing.coupang_url || `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.name)}`)
                                    : language === 'ja'
                                    ? (ing.rakuten_url || `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(ing.rakuten_search_keyword || ing.name_ja || ing.name)}`)
                                    : language === 'zh'
                                    ? (ing.tmall_url || `https://s.taobao.com/search?q=${encodeURIComponent(ing.tmall_search_keyword || ing.name_zh || ing.name)}`)
                                    : (ing.amazon_url || `https://www.amazon.com/s?k=${encodeURIComponent(ing.amazon_search_keyword || ing.name_en || ing.name)}`)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="relative group/pop p-[1px] rounded-[2rem] overflow-hidden"
                            >
                                {/* Subtle Hover Border Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover/pop:from-emerald-500/20 transition-all duration-300" />
                                
                                <div className="relative p-5 md:p-8 rounded-[1.9rem] bg-slate-900/60 backdrop-blur-xl border border-white/5 flex flex-col items-center gap-4 text-center h-full">
                                    <span className="text-4xl md:text-6xl drop-shadow-xl group-hover/pop:scale-110 transition-transform duration-500">
                                        {renderIcon(ing.icon_emoji)}
                                    </span>
                                    <div className="space-y-1">
                                        <h5 className="text-sm md:text-xl font-black text-white">
                                            {language === 'ko' ? ing.name : 
                                             language === 'ja' ? (ing.name_ja || ing.name_en || ing.name) : 
                                             language === 'zh' ? (ing.name_zh || ing.name_en || ing.name) : 
                                             (ing.name_en || ing.name)}
                                        </h5>
                                        <p className="text-[9px] md:text-xs text-slate-500 font-bold tracking-tight line-clamp-1">
                                            {language === 'ko' ? ing.short_description : 
                                             language === 'ja' ? (ing.short_description_ja || ing.short_description_en || ing.short_description) : 
                                             language === 'zh' ? (ing.short_description_zh || ing.short_description_en || ing.short_description) : 
                                             (ing.short_description_en || ing.short_description)}
                                        </p>
                                    </div>
                                    <div className="mt-auto pt-4 w-full">
                                         <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] md:text-xs font-black text-slate-300 group-hover/pop:bg-emerald-500 group-hover/pop:text-black group-hover/pop:border-emerald-500 transition-all duration-300">
                                             <span>{language === 'ko' ? "최저가 확인하기" : language === 'ja' ? "最安値を確認する" : language === 'zh' ? "查看最低价" : "Check Best Price"}</span>
                                             <ArrowRight size={12} />
                                         </div>
                                     </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
});

export default SynergyOptimizer;

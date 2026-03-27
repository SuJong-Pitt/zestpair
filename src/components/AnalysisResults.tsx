"use client";

import { useEffect, useState, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    TrendingUp,
    AlertTriangle,
    XCircle,
    ExternalLink,
    ShoppingCart,
    Star,
    Truck,
    RefreshCcw,
    Zap,
    ShieldCheck,
    ArrowRight,
    Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useBasketStore } from "@/store/basketStore";
import type { CoupangProduct, AnalysisResult, InteractionResult } from "@/types/database";
import SynergyCard from "./SynergyCard";
import { UI_TRANSLATIONS } from "@/lib/i18n";

interface AnalysisResultsProps {
    result: AnalysisResult;
    coupangProducts?: CoupangProduct[];
}

const interactionTypeConfig = {
    SYNERGY: {
        color: "bg-emerald-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-emerald-500/10",
        glowColor: "bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        icon: TrendingUp,
        iconColor: "text-emerald-500",
        borderColor: "border-emerald-100/50",
    },
    CAUTION: {
        color: "bg-amber-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-amber-500/10",
        glowColor: "bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
        icon: AlertTriangle,
        iconColor: "text-amber-500",
        borderColor: "border-amber-100/50",
    },
    CONFLICT: {
        color: "bg-red-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-red-500/10",
        glowColor: "bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        icon: XCircle,
        iconColor: "text-red-500",
        borderColor: "border-red-100/50",
    },
} as const;

/* --- 시너지 완성 데이터는 이제 데이터베이스(result.potentialSynergy)에서 다이내믹하게 가져옵니다. --- */


/** 점수 링 컴포넌트 - 풀 컬러 네온 HUD 버전 */
function ScoreRing({ score }: { score: number }) {
    const radius = 72;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;

    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const animation = animate(count, score, { duration: 1.8, ease: "easeOut" });
        return animation.stop;
    }, [score, count]);

    const offset = useTransform(count, (latest) =>
        circumference - (latest / 100) * circumference
    );

    const orbPos = useTransform(count, (latest) => {
        const angle = (latest / 100) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return {
            x: 90 + radius * Math.cos(rad),
            y: 90 + radius * Math.sin(rad)
        };
    });

    // 점수에 따라 팔레트 변경 (더 다채롭게)
    const getColor = (s: number) => {
        if (s === 100) return {
            main: "#e879f9", light: "#f0abfc", accent: "#fae8ff",
            shadow: "rgba(232,121,249,1)",
            gradA: "#e879f9",   // fuchsia
            gradB: "#818cf8",   // indigo  
            gradC: "#34d399",   // emerald
            label: "✦  P E R F E C T  ✦", labelColor: "#f0abfc"
        };
        if (s >= 80) return {
            main: "#34d399", light: "#6ee7b7", accent: "#a7f3d0",
            shadow: "rgba(52,211,153,0.9)",
            gradA: "#34d399", gradB: "#06b6d4", gradC: "#6366f1",
            label: "HIGH_SYNERGY", labelColor: "#34d399"
        };
        if (s >= 60) return {
            main: "#22d3ee", light: "#67e8f9", accent: "#a5f3fc",
            shadow: "rgba(34,211,238,0.9)",
            gradA: "#22d3ee", gradB: "#818cf8", gradC: "#c084fc",
            label: "SYNC_STABLE", labelColor: "#22d3ee"
        };
        if (s >= 40) return {
            main: "#fbbf24", light: "#fcd34d", accent: "#fde68a",
            shadow: "rgba(251,191,36,0.9)",
            gradA: "#fbbf24", gradB: "#f97316", gradC: "#fb7185",
            label: "CAUTION_REQ", labelColor: "#fbbf24"
        };
        return {
            main: "#f87171", light: "#fca5a5", accent: "#fecaca",
            shadow: "rgba(248,113,113,0.9)",
            gradA: "#f87171", gradB: "#e879f9", gradC: "#fb923c",
            label: "CRIT_WARN", labelColor: "#f87171"
        };
    };

    const colors = getColor(score);
    const isMaxScore = score === 100;

    return (
        <div className="relative flex items-center justify-center w-52 h-52 md:w-60 md:h-60 select-none group/score">
            {/* 100점 전용: 스피닝 홀로그래픽 코닉 오라 */}
            {isMaxScore && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-8px] rounded-full pointer-events-none"
                    style={{
                        background: "conic-gradient(from 0deg, #e879f9, #818cf8, #06b6d4, #34d399, #fbbf24, #f87171, #e879f9)",
                        filter: "blur(18px)",
                        opacity: 0.55
                    }}
                />
            )}
            {/* 외부 다층 네온 오라 */}
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${colors.gradA} 0%, ${colors.gradB} 40%, transparent 70%)`, filter: "blur(55px)" }}
            />
            <motion.div
                animate={{ scale: [1.1, 1.35, 1.1], opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${colors.gradC} 0%, transparent 65%)`, filter: "blur(70px)" }}
            />

            <svg viewBox="0 0 180 180" className="w-full h-full overflow-visible">
                <defs>
                    {/* 3색 무지개 그라디언트 */}
                    <linearGradient id="scoreRainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.gradA} />
                        <stop offset="50%" stopColor={colors.gradB} />
                        <stop offset="100%" stopColor={colors.gradC} />
                    </linearGradient>
                    {/* 글로우 필터 */}
                    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="orbGlow" x="-80%" y="-80%" width="360%" height="360%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <pattern id="colorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.gradA} strokeWidth="0.15" strokeOpacity="0.3" />
                    </pattern>
                </defs>

                {/* 배경 컬러 그리드 */}
                <circle cx="90" cy="90" r={radius + 12} fill="url(#colorGrid)" opacity="0.35" />

                {/* 컬러 눈금 링 (3색 분산) */}
                <g opacity="0.4">
                    {Array.from({ length: 48 }).map((_, i) => {
                        const isMajor = i % 4 === 0;
                        const col = i % 3 === 0 ? colors.gradA : i % 3 === 1 ? colors.gradB : colors.gradC;
                        return (
                            <rect key={i} x="89.5" y="0"
                                width={isMajor ? "1.2" : "0.6"}
                                height={isMajor ? "12" : "7"}
                                fill={col}
                                transform={`rotate(${i * 7.5} 90 90)`}
                                opacity={isMajor ? 0.9 : 0.35}
                            />
                        );
                    })}
                </g>

                {/* 트랙 링 */}
                <circle cx="90" cy="90" r={radius} stroke="white" strokeWidth="1.5" strokeDasharray="3 5" fill="transparent" opacity="0.07" />

                {/* 내부 동심원 장식 */}
                <circle cx="90" cy="90" r={radius - 13} stroke={colors.gradB} strokeWidth="0.5" strokeDasharray="8 22" fill="transparent" opacity="0.18" />
                <circle cx="90" cy="90" r={radius - 24} stroke={colors.gradC} strokeWidth="0.5" strokeDasharray="4 16" fill="transparent" opacity="0.12" />

                {/* 역방향 회전 데코 링 */}
                <motion.circle cx="90" cy="90" r={radius + 8}
                    stroke={`url(#scoreRainbowGrad)`} strokeWidth="0.8"
                    strokeDasharray="30 170" fill="transparent"
                    animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    className="origin-center" opacity="0.45"
                />
                {/* 정방향 빠른 데코 링 */}
                <motion.circle cx="90" cy="90" r={radius + 15}
                    stroke={colors.gradC} strokeWidth="0.5"
                    strokeDasharray="6 55" fill="transparent"
                    animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="origin-center" opacity="0.28"
                />

                {/* 메인 프로그레스 글로우 레이어 (흐릿한 두꺼운 후광) */}
                <motion.circle cx="90" cy="90" r={radius}
                    stroke="url(#scoreRainbowGrad)" strokeWidth={strokeWidth + 8}
                    fill="transparent" strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset, strokeLinecap: "round", filter: "blur(9px)", opacity: 0.22 }}
                    className="-rotate-90 origin-center"
                />
                {/* 메인 프로그레스 링 */}
                <motion.circle cx="90" cy="90" r={radius}
                    stroke="url(#scoreRainbowGrad)" strokeWidth={strokeWidth}
                    fill="transparent" strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset, strokeLinecap: "round",
                        filter: `drop-shadow(0 0 10px ${colors.shadow}) drop-shadow(0 0 5px ${colors.gradB})`
                    }}
                    className="-rotate-90 origin-center"
                />

                {/* 100점 전용: 별 파티클 8개 + 전체 무지개 링 */}
                {isMaxScore && (
                    <>
                        {/* 전체 무지개 아웃라인 링 */}
                        <motion.circle cx="90" cy="90" r={radius + 4}
                            stroke="url(#scoreRainbowGrad)" strokeWidth="2"
                            strokeDasharray="15 10" fill="transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="origin-center" opacity="0.7"
                        />
                        {/* 빠른 역방향 무지개 링 */}
                        <motion.circle cx="90" cy="90" r={radius + 12}
                            stroke="url(#scoreRainbowGrad)" strokeWidth="1.5"
                            strokeDasharray="8 20" fill="transparent"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="origin-center" opacity="0.5"
                        />
                        {/* 궤도 별 파티클 8개 (각기 다른 색+속도) */}
                        {[
                            { color: "#e879f9", r: radius + 4, dur: 3.2, delay: 0 },
                            { color: "#818cf8", r: radius + 4, dur: 3.2, delay: 0.4 },
                            { color: "#06b6d4", r: radius + 4, dur: 3.2, delay: 0.8 },
                            { color: "#34d399", r: radius + 4, dur: 3.2, delay: 1.2 },
                            { color: "#fbbf24", r: radius + 4, dur: 3.2, delay: 1.6 },
                            { color: "#f87171", r: radius + 4, dur: 3.2, delay: 2.0 },
                            { color: "#f0abfc", r: radius + 4, dur: 3.2, delay: 2.4 },
                            { color: "#67e8f9", r: radius + 4, dur: 3.2, delay: 2.8 },
                        ].map((p, i) => (
                            <motion.g key={i}
                                animate={{ rotate: 360 }}
                                transition={{ duration: p.dur, repeat: Infinity, ease: "linear", delay: -p.delay }}
                                style={{ transformOrigin: "90px 90px" }}
                            >
                                {/* 별 모양 (4-point star via 2 rotated rects) */}
                                <g transform={`translate(${90 + p.r}, 90)`}>
                                    <motion.rect x="-2.5" y="-0.5" width="5" height="1" rx="0.5"
                                        fill={p.color} filter="url(#orbGlow)"
                                        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                    <motion.rect x="-0.5" y="-2.5" width="1" height="5" rx="0.5"
                                        fill={p.color} filter="url(#orbGlow)"
                                        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                </g>
                            </motion.g>
                        ))}
                        {/* 중앙 흰색 코어 펄스 */}
                        <motion.circle cx="90" cy="90" r="8"
                            fill="white" opacity="0.06"
                            animate={{ r: [6, 16, 6], opacity: [0.06, 0.15, 0.06] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </>
                )}

                {/* 컬러 모서리 브래킷 */}
                <g opacity="0.5" strokeWidth="1" fill="none">
                    <path d="M 58 38 L 38 38 L 38 58" stroke={colors.gradA} />
                    <path d="M 122 38 L 142 38 L 142 58" stroke={colors.gradB} />
                    <path d="M 58 142 L 38 142 L 38 122" stroke={colors.gradC} />
                    <path d="M 122 142 L 142 142 L 142 122" stroke={colors.gradA} />
                </g>

                {/* 회전하는 메인 스캐닝 광선 */}
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "90px 90px" }}>
                    <line x1="90" y1="90" x2="90" y2={90 - radius - 2} stroke={colors.gradA} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
                    <circle cx="90" cy={90 - radius} r="2.5" fill={colors.gradA} opacity="0.9" filter="url(#orbGlow)" />
                </motion.g>

                {/* 역방향 느린 파티클 */}
                <motion.g animate={{ rotate: -360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "90px 90px" }}>
                    <circle cx="90" cy={90 - radius - 8} r="2" fill={colors.gradB} opacity="0.55" filter="url(#orbGlow)" />
                </motion.g>
                {/* 정방향 느린 파티클 */}
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 9.5, repeat: Infinity, ease: "linear", delay: 3 }}
                    style={{ transformOrigin: "90px 90px" }}>
                    <circle cx="90" cy={90 - radius + 4} r="1.5" fill={colors.gradC} opacity="0.45" filter="url(#orbGlow)" />
                </motion.g>

                {/* 궤도 끝 구슬 */}
                <motion.circle cx={orbPos.get().x} cy={orbPos.get().y} r="5.5" fill="white"
                    style={{ filter: `drop-shadow(0 0 10px ${colors.gradA}) drop-shadow(0 0 5px ${colors.gradB})` }} />
                <motion.circle cx={orbPos.get().x} cy={orbPos.get().y} r="2.5" fill={colors.gradA}
                    style={{ filter: `drop-shadow(0 0 8px ${colors.shadow})` }} />
            </svg>

            {/* 텍스트 레이어 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* 상단 상태 뱃지 */}
                <div className="absolute top-[28%] left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <motion.div
                        animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.5, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                        style={{ background: `${colors.gradA}20`, border: `1px solid ${colors.gradA}50` }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: colors.gradA, boxShadow: `0 0 8px ${colors.gradA}` }}
                        />
                        <span className="text-[7px] font-mono tracking-widest uppercase" style={{ color: colors.labelColor }}>
                            {colors.label}
                        </span>
                    </motion.div>
                </div>

                {/* 점수 숫자 (그라디언트 텍스트) */}
                <motion.div
                    animate={{ opacity: [1, 0.85, 1] }} transition={{ duration: 2.2, repeat: Infinity }}
                    className="flex items-baseline mt-7"
                >
                    <motion.span
                        className="font-[1000] tracking-tighter leading-none"
                        style={{
                            fontSize: "clamp(2.8rem, 5.5vw, 4rem)",
                            background: `linear-gradient(135deg, ${colors.gradA}, ${colors.gradB}, ${colors.gradC})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: `drop-shadow(0 0 18px ${colors.shadow})`
                        }}
                    >
                        {rounded}
                    </motion.span>
                    <span className="ml-1 text-[10px] font-black italic tracking-widest uppercase" style={{ color: colors.accent, opacity: 0.7 }}>%</span>
                </motion.div>

                {/* 하단 데이터 라벨 */}
                <div className="mt-3 flex flex-col items-center gap-1.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: 56 }} transition={{ duration: 1.2, delay: 0.5 }}
                        className="h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${colors.gradB}, ${colors.gradC}, transparent)` }}
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-[7px] font-mono tracking-[0.28em] uppercase" style={{ color: `${colors.gradA}90` }}>Core_V2.5</span>
                        <div className="w-0.5 h-0.5 rounded-full" style={{ background: colors.gradB, opacity: 0.5 }} />
                        <span className="text-[7px] font-mono tracking-[0.28em] uppercase" style={{ color: `${colors.gradC}90` }}>
                            {score >= 60 ? "HIGH_SYNC" : score >= 40 ? "CAUTION" : "CRITICAL"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 상호작용 카드 컴포넌트 */
function InteractionCard({ result }: { result: InteractionResult }) {
    const { language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];
    if (!result.interaction) return null;
    const { type, title, reason, recommendation, title_en, reason_en, recommendation_en } = result.interaction;
    const config = interactionTypeConfig[type];
    const Icon = config.icon;

    const displayTitle = language === "ko" ? title : (title_en || title);
    const displayReason = language === "ko" ? reason : (reason_en || reason);
    const displayRec = language === "ko" ? recommendation : (recommendation_en || recommendation);
    const nameA = language === "ko" ? result.pair[0].name : result.pair[0].name_en;
    const nameB = language === "ko" ? result.pair[1].name : result.pair[1].name_en;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                "group overflow-hidden border transition-all duration-300",
                "bg-gradient-to-br from-white to-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)]",
                config.borderColor,
                config.shadowColor
            )}>
                <CardContent className="p-6 relative">
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", config.glowColor)} />

                    <div className="relative flex items-start gap-5">
                        <div
                            className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-500 bg-white border border-gray-100 group-hover:scale-110 group-hover:rotate-3",
                                config.iconColor
                            )}
                        >
                            <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0 font-sans tracking-tight">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-bold text-lg text-slate-900 leading-tight tracking-tight">{displayTitle}</h4>
                                <Badge className={cn("text-[10px] px-2 py-0 h-5 border-none font-black uppercase tracking-wider", config.color)}>
                                    {type === 'SYNERGY' ? t.results.typeSynergy : type === 'CAUTION' ? t.results.typeCaution : t.results.typeConflict}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                <span className="text-slate-600 font-black">{nameA}</span>
                                <Zap size={10} className="text-emerald-400 animate-pulse" />
                                <span className="text-slate-600 font-black">{nameB}</span>
                            </div>
                            <p className="text-[15px] text-slate-600 leading-relaxed mb-5 font-medium">{displayReason}</p>

                            {displayRec && (
                                <div className="p-4 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 bg-emerald-100 rounded-lg">
                                            <ShieldCheck size={14} className="text-emerald-600" />
                                        </div>
                                        <span className="text-[11px] text-emerald-800 font-black uppercase tracking-tighter">{t.common.expertProtocol}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-semibold leading-relaxed">{displayRec}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/** 프리미엄 상품 카드 - 퍼스널 큐레이션 버전 */
const ProductCard = memo(function ProductCard({ product, index, sourceIngredient }: { product: CoupangProduct; index: number; sourceIngredient?: string }) {
    const { language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];

    const configs = [
        { label: t.products.bestAi, color: "text-blue-600", bg: "bg-blue-500/5", border: "border-blue-100/50", gradient: "from-blue-600 to-indigo-600", glow: "shadow-blue-500/20", icon: <Sparkles size={10} className="text-blue-400" /> },
        { label: t.products.maxSynergy, color: "text-emerald-600", bg: "bg-emerald-500/5", border: "border-emerald-100/50", gradient: "from-emerald-600 to-teal-600", glow: "shadow-emerald-500/20", icon: <Zap size={10} className="text-emerald-400" /> },
        { label: t.products.bestValue, color: "text-amber-600", bg: "bg-amber-500/5", border: "border-orange-100/50", gradient: "from-orange-500 to-amber-600", glow: "shadow-orange-500/20", icon: <TrendingUp size={10} className="text-orange-400" /> },
    ];
    const config = configs[index % configs.length];

    return (
        <Card className="group relative h-full flex flex-col overflow-hidden border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-all duration-700 rounded-[2.2rem] bg-white group/card">
            {/* 상단 비주얼 영역 - 한층 더 콤팩트하게 */}
            <div className="relative h-[140px] md:h-[160px] bg-gradient-to-b from-slate-50/80 to-white flex items-center justify-center p-5 overflow-hidden">
                {/* 랭킹 넘버링 - 모던한 스타일 */}
                <div className="absolute top-4 left-5 z-20">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Rank</span>
                        <span className="text-[14px] font-[1000] italic text-slate-800">0{index + 1}</span>
                    </div>
                </div>

                {/* 매칭 뱃지 - 플로팅 스타일 */}
                <div className="absolute top-4 right-5 z-20">
                    <div className={cn("px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-black/5 bg-white border border-slate-100 transition-all duration-500 group-hover/card:-translate-y-1")}>
                        {config.icon}
                        <span className={cn("text-[9px] font-black uppercase tracking-tight", config.color)}>{config.label}</span>
                    </div>
                </div>

                {/* 상품 이미지 */}
                <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-700 group-hover/card:scale-110">
                    {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain drop-shadow-2xl"
                        />
                    ) : (
                        <div className="relative">
                            <div className="text-6xl drop-shadow-2xl group-hover/card:scale-110 transition-all duration-500">
                                {index % 4 === 0 ? "💊" : index % 4 === 1 ? "🧬" : index % 4 === 2 ? "🧪" : "🧴"}
                            </div>
                            <div className={cn("absolute inset-0 blur-2xl opacity-20 rounded-full animate-pulse", config.bg)} />
                        </div>
                    )}
                </div>

                {/* 하단 페이드 */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
            </div>

            <CardContent className="px-5 pb-6 pt-2 flex flex-col flex-1 bg-white">
                {/* 메타 정보 */}
                <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="flex h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-[0.15em] truncate">
                        {sourceIngredient ? t.products.relatedTo.replace("{ingredient}", sourceIngredient) : t.products.curationTitle}
                    </p>
                </div>

                {/* 상품명 */}
                <h4 className="font-extrabold text-[14px] sm:text-[15px] text-slate-900 leading-[1.3] mb-3 line-clamp-2 min-h-[36px] tracking-tight group-hover/card:text-blue-600 transition-colors">
                    {product.name}
                </h4>

                {/* 별점 & 배송 */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                        <Star size={10} fill="#F59E0B" className="text-amber-500" />
                        <span className="text-[11px] font-black text-slate-700 pt-0.5">{typeof product.rating === 'number' ? product.rating.toFixed(1) : "4.8"}</span>
                    </div>
                    {product.is_rocket ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-sky-500">
                            <Truck size={10} strokeWidth={2.5} />
                            <span className="text-[9px] font-black uppercase italic">Rocket</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-orange-600">
                            <ShoppingCart size={10} />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Prime</span>
                        </div>
                    )}
                </div>

                {/* 가격 및 구매 인터페이스 - 초고밀도 레이아웃 */}
                <div className="mt-auto border-t border-slate-50 pt-4 flex items-end justify-between">
                    <div className="flex flex-col">
                        {product.discount_rate && (
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-rose-500 text-[10px] font-black italic">{product.discount_rate}% OFF</span>
                                {product.original_price && (
                                    <span className="text-[9px] text-slate-300 line-through font-bold">
                                        {language === 'ko' ? `₩${Math.floor(product.original_price).toLocaleString()}` : `$${product.original_price.toFixed(2)}`}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-[10px] font-black text-slate-400">{language === 'ko' ? '₩' : '$'}</span>
                            <span className="text-xl md:text-2xl font-[1000] text-slate-900 tracking-tighter">
                                {product.price > 0
                                    ? (language === 'ko' ? Math.floor(product.price).toLocaleString() : product.price.toFixed(2))
                                    : t.products.outOfStock}
                            </span>
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "group/btn relative overflow-hidden rounded-[1.2rem] px-4 h-10 transition-all duration-500 shadow-lg hover:shadow-xl active:scale-95 border border-white/10 bg-gradient-to-r",
                            config.gradient,
                            config.glow
                        )}
                        asChild
                    >
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                            {/* 쉬머 효과 */}
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                            <ShoppingCart size={10} className="text-white/90" />
                            <span className="text-[9px] font-black tracking-tight text-white whitespace-nowrap">
                                {language === 'ko' ? t.common.shoppingCoupang : t.common.shoppingAmazon}
                            </span>
                        </a>
                    </Button>
                </div>
            </CardContent>

            {/* AI 신뢰성 점수 바 (장식용) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '99%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn("h-full bg-gradient-to-r opacity-40", config.gradient)}
                />
            </div>
        </Card>
    );
});

export default function AnalysisResults({ result, coupangProducts = [] }: AnalysisResultsProps) {
    const { clearBasket, language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
        const updateConstraints = () => {
            if (containerRef.current && contentRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const contentWidth = contentRef.current.scrollWidth;
                setDragConstraints({ left: Math.min(0, -(contentWidth - containerWidth + 40)), right: 0 });
            }
        };

        updateConstraints();
        window.addEventListener('resize', updateConstraints);
        const timer = setTimeout(updateConstraints, 500);

        return () => {
            window.removeEventListener('resize', updateConstraints);
            clearTimeout(timer);
        };
    }, [result.ingredients]);

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

    const synergyCount = result.synergies.length;
    if (!result || !result.ingredients) {
        return <div className="p-20 text-center text-slate-400">{t.common.loading}...</div>;
    }

    const allInteractions = [
        ...result.synergies,
        ...result.cautions,
        ...result.conflicts,
    ].filter((r) => r && r.interaction);

    return (
        <div className="relative min-h-screen bg-slate-950 w-full font-sans text-slate-200 selection:bg-emerald-500/30">
            {/* 네온 그린/블루 계열 블랍(Blob) 원형 그라데이션 파티클 */}
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-24"
            >
                {/* 메인 반투명 글래스 패널 컨테이너 */}
                <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 md:p-12 lg:p-16 space-y-12 md:space-y-16">
                    {/* 0. 최상단 리포트 헤더 라벨 - 스크롤 타겟 */}
                    <div id="analysis-report-top" className="flex flex-col items-center gap-2 pt-4 pb-0">
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-2.5 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] group/protocol max-w-[90vw]"
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
                                    <Sparkles size={12} className="md:size-[14px] text-emerald-400 relative z-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                </motion.div>
                            </div>
                            <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-emerald-400 pt-0.5 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] whitespace-nowrap">
                                {language === 'ko' ? 'Analysis Protocol' : 'Analysis Report'}
                            </h2>
                        </motion.div>


                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 8 }}
                            className="w-px bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent"
                        />
                    </div>

                    {/* 종합 점수 카드 - Centered Impact & Premium Report */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500 rounded-[3rem] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>

                        <div className="relative rounded-[2.5rem] border-none text-white">
                            {/* 하이테크 애니메이션 배경 - 신경망/그리드 */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                                <motion.div
                                    animate={{
                                        backgroundPosition: ["0px 0px", "0px 40px"],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:100%_40px] opacity-30"
                                />
                                {/* 플로팅 데이터 입자들 */}
                                <div className="absolute inset-0">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: "100%" }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                y: "-100%",
                                                x: `${Math.random() * 100}%`
                                            }}
                                            transition={{
                                                duration: 5 + Math.random() * 5,
                                                repeat: Infinity,
                                                delay: Math.random() * 5,
                                                ease: "linear"
                                            }}
                                            className="absolute w-px h-20 bg-gradient-to-t from-transparent via-emerald-500/50 to-transparent"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none opacity-50 md:opacity-100" />

                            <CardContent className="p-5 md:p-10 relative z-10 flex flex-col items-center text-center">
                                {/* 0. 점수 링 섹션 (최상단) */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative mb-6"
                                >
                                    <div className="absolute inset-0 bg-emerald-500/10 blur-[30px] rounded-full scale-125 pointer-events-none" />
                                    <ScoreRing score={result.score} />
                                </motion.div>

                                {/* 1. AI 뱃지 */}
                                <motion.div
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-6"
                                >
                                    <Sparkles size={12} className="text-indigo-300 animate-pulse" />
                                    <span className="text-[9px] md:text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] pt-0.5">AI Precision Analysis</span>
                                </motion.div>

                                {/* 2. 최적화된 타이틀 */}
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
                                        {result.score >= 70
                                            ? t.results.bestMix
                                            : result.score >= 40
                                                ? t.results.potentialConflict
                                                : t.results.dangerous}
                                    </motion.p>
                                </div>

                                {/* 3. 요약 박스 (Compact) */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="relative w-full max-w-xl mb-4"
                                >
                                    <div className="relative px-6 py-6 rounded-[1.8rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                            <ShieldCheck size={100} />
                                        </div>
                                        <div className="relative flex items-center justify-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                <ShieldCheck size={14} className="text-emerald-400" />
                                            </div>
                                            <p className="text-sm md:text-lg font-bold text-white/90 tracking-tight text-center">
                                                {(() => {
                                                    if (result.conflicts.length > 0) return t.results.summaryConflict.replace("{count}", result.conflicts.length.toString());
                                                    if (result.synergies.length > 0) return t.results.summarySynergy.replace("{count}", result.synergies.length.toString());
                                                    if (result.cautions.length > 0) return t.results.summaryCaution.replace("{count}", result.cautions.length.toString());
                                                    return t.results.summaryNeutral;
                                                })()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Prominent Disclaimer Below Summary */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                    >
                                        <AlertTriangle size={12} className="text-amber-400" />
                                        <p className="text-[10px] md:text-[11px] font-bold text-amber-200/70 tracking-tight">
                                            {t.common.medicalDisclaimerBody}
                                        </p>
                                    </motion.div>
                                </motion.div>

                                {/* 공유 버튼 (Share Action) */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="mb-10"
                                >
                                    <Button
                                        onClick={handleShare}
                                        className="group/share relative px-8 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95"
                                    >
                                        <div className="absolute inset-x-0 -bottom-1 h-3 blur-md opacity-50 bg-emerald-400 group-hover/share:opacity-80 transition-opacity" />
                                        <div className="relative flex items-center gap-2">
                                            <Share2 size={16} />
                                            <span>{language === 'ko' ? "분석 결과 공유하기" : "Share Analysis"}</span>
                                        </div>
                                    </Button>
                                </motion.div>

                                {/* 4. 성분 캡슐 그리드 (2열) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                                    {result.ingredients.map((ing, i) => (
                                        <motion.div
                                            key={ing.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.8 + i * 0.1 }}
                                            className="flex items-center gap-3 bg-slate-800/40 border border-white/5 rounded-2xl px-5 py-3.5 backdrop-blur-sm group/ing hover:bg-slate-800/60 transition-colors"
                                        >
                                            <span className="text-2xl drop-shadow-sm group-hover/ing:scale-110 transition-transform">
                                                {ing.icon_emoji}
                                            </span>
                                            <span className="text-sm md:text-base font-black text-white/80 tracking-tight">
                                                {language === "ko" ? ing.name : ing.name_en}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                            </CardContent>
                        </div>
                    </div>

                    {/* 궁합 상세 섹션 */}
                    <div className="space-y-6">
                        <div className="flex items-end justify-between px-2">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                                    {t.results.matrixTitle}
                                </h3>
                                <p className="text-sm text-slate-400 font-semibold opacity-90">{t.results.matrixSubtitle}</p>
                            </div>
                            <Badge variant="outline" className="rounded-lg px-3 py-1.5 border-white/10 text-slate-300 font-bold bg-white/5 backdrop-blur-md shadow-sm">
                                {allInteractions.length}{language === "ko" ? "건의 분석결과" : " Results"}
                            </Badge>
                        </div>

                        {allInteractions.length > 0 ? (
                            <div className="flex flex-col gap-5 py-8 w-full max-w-4xl mx-auto">
                                {[...result.synergies, ...result.cautions, ...result.conflicts].map(
                                    (r, idx) =>
                                        r.interaction && (
                                            <SynergyCard key={r.interaction.id ?? idx} result={r} index={idx} />
                                        )
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7 }}
                                className="relative rounded-[2.5rem] w-full mx-auto group"
                                style={{
                                    background: "linear-gradient(145deg, rgba(4,20,16,0.97) 0%, rgba(4,12,24,0.97) 100%)",
                                    border: "1px solid rgba(52,211,153,0.2)",
                                    boxShadow: "0 0 0 1px rgba(52,211,153,0.05) inset, 0 40px 80px rgba(0,0,0,0.5)"
                                }}
                            >
                                {/* 배경 레이어들 — overflow-hidden은 여기에만 적용 */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
                                    {/* 메인 코어 오라 */}
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.25, 0.12] }}
                                        transition={{ duration: 5, repeat: Infinity }}
                                        className="absolute inset-0"
                                        style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(52,211,153,0.3) 0%, transparent 65%)" }}
                                    />
                                    <motion.div
                                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.18, 0.08] }}
                                        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                                        className="absolute inset-0"
                                        style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.2) 0%, transparent 60%)" }}
                                    />
                                    {/* 코너 HUD 브래킷 */}
                                    <div className="absolute top-5 left-5 w-12 h-12 border-t-2 border-l-2 border-emerald-400/30 rounded-tl-2xl" />
                                    <div className="absolute top-5 right-5 w-12 h-12 border-t-2 border-r-2 border-cyan-400/25 rounded-tr-2xl" />
                                    <div className="absolute bottom-5 left-5 w-12 h-12 border-b-2 border-l-2 border-cyan-400/25 rounded-bl-2xl" />
                                    <div className="absolute bottom-5 right-5 w-12 h-12 border-b-2 border-r-2 border-emerald-400/30 rounded-br-2xl" />
                                    {/* 수평 스캔라인 */}
                                    <motion.div
                                        animate={{ y: ["-100%", "200%"] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                                        className="absolute inset-x-0 h-px"
                                        style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)" }}
                                    />
                                </div>

                                {/* 콘텐츠 — 좌우 분할 레이아웃 */}
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 p-8 md:p-12">

                                    {/* 왼쪽: 홀로그래픽 실드 (고정 너비) */}
                                    <div className="shrink-0 flex items-center justify-center">
                                        <div className="relative w-40 h-40 md:w-44 md:h-44 flex items-center justify-center">
                                            {/* 멀티 궤도 링 */}
                                            {[
                                                { size: "inset-0", dur: 12, color: "rgba(52,211,153,0.18)", dash: "border-dashed" },
                                                { size: "inset-4", dur: 8, color: "rgba(6,182,212,0.15)", dash: "border-dotted" },
                                                { size: "inset-8", dur: 5, color: "rgba(99,102,241,0.12)", dash: "border-dashed" },
                                            ].map((ring, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                                                    transition={{ duration: ring.dur, repeat: Infinity, ease: "linear" }}
                                                    className={`absolute ${ring.size} rounded-full border-2 ${ring.dash}`}
                                                    style={{ borderColor: ring.color }}
                                                />
                                            ))}

                                            {/* 코닉 스캐너 빔 */}
                                            <motion.div
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 rounded-full"
                                                style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(52,211,153,0.35) 25deg, transparent 50deg)" }}
                                            />

                                            {/* 글로우 코어 */}
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full"
                                                style={{ background: "radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)", filter: "blur(10px)" }}
                                            />

                                            {/* 실드 아이콘 카드 */}
                                            <motion.div
                                                animate={{ y: [0, -5, 0], scale: [1, 1.04, 1] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="relative w-20 h-20 md:w-24 md:h-24 rounded-[1.6rem] flex items-center justify-center"
                                                style={{
                                                    background: "linear-gradient(145deg, rgba(6,20,16,0.95), rgba(4,30,22,0.95))",
                                                    border: "1.5px solid rgba(52,211,153,0.4)",
                                                    boxShadow: "0 0 30px rgba(52,211,153,0.2), inset 0 1px 0 rgba(52,211,153,0.1)"
                                                }}
                                            >
                                                <ShieldCheck
                                                    size={42}
                                                    strokeWidth={1.2}
                                                    style={{ color: "#34d399", filter: "drop-shadow(0 0 16px rgba(52,211,153,0.7))" }}
                                                />
                                            </motion.div>

                                            {/* 궤도 파티클 3개 */}
                                            {[
                                                { color: "#34d399", dur: 3, offset: 0 },
                                                { color: "#06b6d4", dur: 3, offset: 1 },
                                                { color: "#818cf8", dur: 3, offset: 2 },
                                            ].map((p, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: p.dur, repeat: Infinity, ease: "linear", delay: -(p.offset) }}
                                                    className="absolute inset-0"
                                                    style={{ transformOrigin: "center" }}
                                                >
                                                    <div
                                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
                                                        style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 오른쪽: 텍스트 + 배지 */}
                                    {/* 오른쪽: 텍스트 + 배지 — flex-1 min-w-0으로 overflow 방지 */}
                                    <div className="flex flex-col gap-4 text-center md:text-left flex-1 min-w-0">
                                        {/* 상태 레이블 */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="inline-flex items-center gap-2 self-center md:self-start"
                                        >
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-2 h-2 rounded-full bg-emerald-400"
                                                style={{ boxShadow: "0 0 8px #34d399" }}
                                            />
                                            <span
                                                className="text-[10px] font-black uppercase tracking-[0.3em]"
                                                style={{ color: "#34d399" }}
                                            >
                                                Security Status — Verified
                                            </span>
                                        </motion.div>

                                        <motion.h4
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-2xl md:text-3xl font-[1000] tracking-tighter leading-[1.1]"
                                            style={{
                                                background: "linear-gradient(135deg, #ffffff 0%, #a7f3d0 50%, #6ee7b7 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                filter: "drop-shadow(0 0 20px rgba(52,211,153,0.25))"
                                            }}
                                        >
                                            {t.results.noInteraction}
                                        </motion.h4>

                                        {/* 설명 텍스트 */}
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ delay: 0.45 }}
                                            className="text-xs md:text-sm leading-relaxed max-w-xs md:max-w-sm"
                                            style={{ color: "rgba(203,213,225,0.8)" }}
                                        >
                                            {t.results.noInteractionBody}
                                        </motion.p>

                                        {/* 스탯 배지 3종 */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.55 }}
                                            className="flex flex-row flex-wrap gap-2.5 justify-center md:justify-start pt-1"
                                        >
                                            {[
                                                { label: "Zero Risk", icon: "🛡️", gradA: "#34d399", gradB: "#06b6d4", glow: "rgba(52,211,153,0.3)" },
                                                { label: "Bio-Safe", icon: "🧬", gradA: "#818cf8", gradB: "#c084fc", glow: "rgba(129,140,248,0.3)" },
                                                { label: "100% Synergy", icon: "⚡", gradA: "#fbbf24", gradB: "#f59e0b", glow: "rgba(251,191,36,0.3)" },
                                            ].map((badge, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    whileInView={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}
                                                    whileHover={{ scale: 1.06, y: -2 }}
                                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider whitespace-nowrap"
                                                    style={{
                                                        background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.3))`,
                                                        border: `1px solid ${badge.gradA}40`,
                                                        color: badge.gradA,
                                                        boxShadow: `0 0 16px ${badge.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`
                                                    }}
                                                >
                                                    <span style={{ filter: `drop-shadow(0 0 4px ${badge.gradA})` }}>{badge.icon}</span>
                                                    <span style={{
                                                        background: `linear-gradient(90deg, ${badge.gradA}, ${badge.gradB})`,
                                                        WebkitBackgroundClip: "text",
                                                        WebkitTextFillColor: "transparent"
                                                    }}>{badge.label}</span>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* --- 수익화 브릿지 및 AI 큐레이션 (Step 4 & 5 통합) --- */}
                    {(() => {
                        const currentIngNames = result.ingredients.map(ing => (ing.name_en || ing.name).toLowerCase().trim());

                        // 1단계: DB에서 분석 단계에 미리 찾아둔 잠재적 시너지 활용 (Step 2)
                        const potentialSynergy = result.potentialSynergy;
                        const isTrueSynergy = !!potentialSynergy;

                        // 2단계: 시너지 파트너가 없으면 선택되지 않은 기본 추천 영양제 중 하나 선택 (Step 3)
                        const fallbackCandidates = [
                            { ko: "비타민 C", en: "Vitamin C" },
                            { ko: "오메가3", en: "Omega-3" },
                            { ko: "유산균", en: "Probiotics" },
                            { ko: "마그네슘", en: "Magnesium" }
                        ];

                        const bestFallback = fallbackCandidates.find(f =>
                            !currentIngNames.some(own =>
                                own.includes(f.ko.toLowerCase()) ||
                                own.includes(f.en.toLowerCase()) ||
                                own.includes(f.ko.replace(" ", "").toLowerCase())
                            )
                        ) || fallbackCandidates[0];

                        // 3단계: 최종 추천 성분 결정 (Step 4)
                        const targetPartner = potentialSynergy?.pair[1];
                        const targetIngredient = isTrueSynergy && targetPartner
                            ? { ko: targetPartner.name, en: targetPartner.name_en }
                            : bestFallback;

                        const recName = language === 'ko' ? targetIngredient.ko : targetIngredient.en;


                        // 동적 예상 점수 계산
                        // 1. 시너지 완성 시: +15점
                        // 2. 기초 영양 보완(Foundation Bonus): 성분이 3개 이상이 될 때 +8점 추가
                        // page.tsx의 scoring logic과 동기화
                        const synergyBoost = isTrueSynergy ? 15 : 0;
                        const foundationBoost = result.ingredients.length >= 2 ? 8 : 0; // 2개 -> 3개 이상이 될 때
                        const totalBoost = synergyBoost + (synergyBoost === 0 && result.score >= 100 ? 0 : foundationBoost);

                        const projectedScore = Math.max(result.score, Math.min(100, result.score + totalBoost));


                        const buyUrl = language === 'ko'
                            ? `https://www.coupang.com/np/search?q=${encodeURIComponent(targetIngredient.ko)}`
                            : `https://www.amazon.com/s?k=${encodeURIComponent(targetIngredient.en)}`;

                        return (
                            <div className="pt-20 pb-10 space-y-16">
                                {/* [Step 4] Before & After 게이지 (결핍 자극) */}
                                <div className="w-full max-w-4xl mx-auto space-y-8">
                                    <div className="text-center space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border",
                                                isTrueSynergy
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-blue-500/10 border-blue-500/30"
                                            )}
                                        >
                                            <Sparkles size={14} className={isTrueSynergy ? "text-emerald-400" : "text-blue-400"} />
                                            <span className={cn(
                                                "text-[11px] font-black uppercase tracking-widest leading-none pt-px",
                                                isTrueSynergy ? "text-emerald-400" : "text-blue-400"
                                            )}>
                                                {result.score >= 100 && !isTrueSynergy
                                                    ? "Continuous Maintenance"
                                                    : isTrueSynergy ? "Synergy Optimization" : "Foundation Bridge"}
                                            </span>
                                        </motion.div>
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-[1000] text-white tracking-tight break-keep">
                                            {language === 'ko'
                                                ? isTrueSynergy
                                                    ? `현재 조합에 [${recName}]를 추가하면 영양 시너지가 완성되며 ${projectedScore}점이 됩니다!`
                                                    : result.score >= 100
                                                        ? `이미 완벽한 조합입니다! 여기에 [${recName}]를 더해 기초 영양까지 완벽하게 관리해보세요.`
                                                        : `현재 조합도 훌륭하지만, [${recName}]를 추가하면 전체적인 영양 밸런스가 ${projectedScore}점 수준으로 높아집니다!`
                                                : isTrueSynergy
                                                    ? `Adding [${recName}] completes your nutritional synergy triad! Potential: ${projectedScore}pts`
                                                    : result.score >= 100
                                                        ? `Your stack is already perfect! Adding [${recName}] will provide the ultimate foundational support.`
                                                        : `Your combination is great, but adding [${recName}] balances your overall nutrition up to ${projectedScore}pts!`}
                                        </h3>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full pt-4">
                                        {/* 현재 점수 카드 */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6 }}
                                            className="relative flex flex-col items-center gap-4 p-6 rounded-[2rem] w-full max-w-[240px] overflow-hidden group/card"
                                            style={{
                                                background: "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)",
                                                border: "1px solid rgba(148,163,184,0.12)",
                                                boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                                            }}
                                        >
                                            {/* 배경 글로우 */}
                                            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-[2rem]"
                                                style={{ background: "radial-gradient(circle at 50% 50%, rgba(148,163,184,0.05) 0%, transparent 70%)" }} />

                                            {/* 헤더 레이블 */}
                                            <div className="relative z-10 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase">Current Level</span>
                                            </div>

                                            {/* 게이지 링 */}
                                            <div className="relative z-10 w-32 h-32 flex items-center justify-center">
                                                {/* 외부 글로우 */}
                                                <div className="absolute inset-0 rounded-full opacity-20"
                                                    style={{ background: "radial-gradient(circle, rgba(148,163,184,0.3) 0%, transparent 70%)", filter: "blur(15px)" }} />
                                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
                                                    <defs>
                                                        <linearGradient id="currentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#64748b" />
                                                            <stop offset="100%" stopColor="#94a3b8" />
                                                        </linearGradient>
                                                    </defs>
                                                    {/* 트랙 */}
                                                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                                                    {/* 눈금선 */}
                                                    {Array.from({ length: 20 }).map((_, i) => (
                                                        <rect key={i} x="49" y="1" width="0.6" height="5"
                                                            fill="rgba(148,163,184,0.3)"
                                                            transform={`rotate(${i * 18} 50 50)`} />
                                                    ))}
                                                    {/* 메인 프로그레스 */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="45"
                                                        stroke="url(#currentGrad)" strokeWidth="9" fill="none" strokeLinecap="round"
                                                        strokeDasharray="283"
                                                        initial={{ strokeDashoffset: 283 }}
                                                        whileInView={{ strokeDashoffset: 283 - (283 * result.score) / 100 }}
                                                        transition={{ duration: 1.8, ease: "easeOut" }}
                                                    />
                                                </svg>
                                                {/* 숫자 */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <motion.span
                                                        initial={{ opacity: 0, scale: 0.7 }}
                                                        whileInView={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.5 }}
                                                        className="text-3xl font-[1000] leading-none"
                                                        style={{ color: "#94a3b8", textShadow: "0 0 12px rgba(148,163,184,0.4)" }}
                                                    >{result.score}</motion.span>
                                                </div>
                                            </div>

                                            {/* 하단 라벨 */}
                                            <span className="relative z-10 text-xs font-bold text-slate-500">
                                                {language === 'ko' ? "현재 점수" : "Current Score"}
                                            </span>
                                        </motion.div>

                                        {/* 가운데 화살표 */}
                                        <motion.div
                                            animate={{ x: [0, 6, 0] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                            className="hidden md:flex flex-col items-center gap-1"
                                        >
                                            <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.5))" }} />
                                            <ArrowRight size={22} className="text-emerald-500/60" />
                                            <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, rgba(52,211,153,0.5), transparent)" }} />
                                        </motion.div>

                                        {/* 추천 최적 점수 카드 */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: 0.15 }}
                                            className="relative flex flex-col items-center gap-4 p-6 rounded-[2rem] w-full max-w-[240px] overflow-hidden group/cardB"
                                            style={{
                                                background: isTrueSynergy
                                                    ? "linear-gradient(145deg, rgba(6,20,15,0.98) 0%, rgba(5,46,22,0.9) 100%)"
                                                    : "linear-gradient(145deg, rgba(6,12,28,0.98) 0%, rgba(15,23,60,0.9) 100%)",
                                                border: isTrueSynergy
                                                    ? "1px solid rgba(52,211,153,0.35)"
                                                    : "1px solid rgba(99,102,241,0.35)",
                                                boxShadow: isTrueSynergy
                                                    ? "0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(52,211,153,0.12), inset 0 1px 0 rgba(52,211,153,0.08)"
                                                    : "0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.12), inset 0 1px 0 rgba(99,102,241,0.08)"
                                            }}
                                        >
                                            {/* 배경 오라 */}
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 rounded-[2rem] pointer-events-none"
                                                style={{
                                                    background: isTrueSynergy
                                                        ? "radial-gradient(circle at 50% 40%, rgba(52,211,153,0.2) 0%, transparent 65%)"
                                                        : "radial-gradient(circle at 50% 40%, rgba(99,102,241,0.2) 0%, transparent 65%)"
                                                }}
                                            />

                                            {/* 헤더 레이블 */}
                                            <div className="relative z-10 flex items-center gap-2">
                                                <motion.div
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ background: isTrueSynergy ? "#34d399" : "#818cf8", boxShadow: isTrueSynergy ? "0 0 6px #34d399" : "0 0 6px #818cf8" }}
                                                />
                                                <span
                                                    className="text-[10px] font-black tracking-[0.22em] uppercase"
                                                    style={{ color: isTrueSynergy ? "#34d399" : "#818cf8" }}
                                                >
                                                    {isTrueSynergy ? "Perfect Synergy" : "Foundation Support"}
                                                </span>
                                            </div>

                                            {/* 게이지 링 */}
                                            <div className="relative z-10 w-32 h-32 flex items-center justify-center">
                                                {/* 외부 글로우 */}
                                                <motion.div
                                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                                    transition={{ duration: 2.5, repeat: Infinity }}
                                                    className="absolute inset-0 rounded-full"
                                                    style={{
                                                        background: isTrueSynergy
                                                            ? "radial-gradient(circle, rgba(52,211,153,0.35) 0%, transparent 70%)"
                                                            : "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
                                                        filter: "blur(12px)"
                                                    }}
                                                />
                                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
                                                    <defs>
                                                        <linearGradient id="projGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor={isTrueSynergy ? "#34d399" : "#818cf8"} />
                                                            <stop offset="50%" stopColor={isTrueSynergy ? "#06b6d4" : "#6366f1"} />
                                                            <stop offset="100%" stopColor={isTrueSynergy ? "#6366f1" : "#c084fc"} />
                                                        </linearGradient>
                                                    </defs>
                                                    {/* 트랙 */}
                                                    <circle cx="50" cy="50" r="45"
                                                        stroke={isTrueSynergy ? "rgba(52,211,153,0.1)" : "rgba(99,102,241,0.1)"}
                                                        strokeWidth="10" fill="none" />
                                                    {/* 눈금선 */}
                                                    {Array.from({ length: 20 }).map((_, i) => (
                                                        <rect key={i} x="49" y="1" width="0.6" height="5"
                                                            fill={isTrueSynergy ? "rgba(52,211,153,0.35)" : "rgba(99,102,241,0.35)"}
                                                            transform={`rotate(${i * 18} 50 50)`} />
                                                    ))}
                                                    {/* 글로우 후광 */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="45"
                                                        stroke="url(#projGradA)" strokeWidth="14" fill="none" strokeLinecap="round"
                                                        strokeDasharray="283"
                                                        initial={{ strokeDashoffset: 283 }}
                                                        whileInView={{ strokeDashoffset: 283 - (283 * projectedScore) / 100 }}
                                                        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                                        style={{ filter: "blur(6px)", opacity: 0.3 }}
                                                    />
                                                    {/* 메인 프로그레스 */}
                                                    <motion.circle
                                                        cx="50" cy="50" r="45"
                                                        stroke="url(#projGradA)" strokeWidth="9" fill="none" strokeLinecap="round"
                                                        strokeDasharray="283"
                                                        initial={{ strokeDashoffset: 283 }}
                                                        whileInView={{ strokeDashoffset: 283 - (283 * projectedScore) / 100 }}
                                                        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                                        style={{ filter: isTrueSynergy ? "drop-shadow(0 0 6px rgba(52,211,153,0.8))" : "drop-shadow(0 0 6px rgba(99,102,241,0.8))" }}
                                                    />
                                                </svg>
                                                {/* 숫자 */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <motion.span
                                                        initial={{ scale: 0.7, opacity: 0 }}
                                                        whileInView={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: 1, type: "spring", stiffness: 200 }}
                                                        className="text-4xl font-[1000] leading-none"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${isTrueSynergy ? "#34d399, #06b6d4, #6366f1" : "#818cf8, #6366f1, #c084fc"})`,
                                                            WebkitBackgroundClip: "text",
                                                            WebkitTextFillColor: "transparent",
                                                            filter: isTrueSynergy ? "drop-shadow(0 0 12px rgba(52,211,153,0.6))" : "drop-shadow(0 0 12px rgba(99,102,241,0.6))"
                                                        }}
                                                    >{projectedScore}</motion.span>
                                                </div>
                                            </div>

                                            {/* 하단 라벨 */}
                                            <span
                                                className="relative z-10 text-xs font-bold"
                                                style={{ color: isTrueSynergy ? "#6ee7b7" : "#a5b4fc" }}
                                            >
                                                {language === 'ko' ? `+ ${recName} 추가시` : `With ${recName}`}
                                            </span>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* [Step 5] Pori's Perfect Synergy 1-Pick (Single Premium Recommendation) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="relative w-full max-w-5xl mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gradient-to-b from-emerald-900/40 to-slate-900 border border-emerald-500/20 shadow-2xl"
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                                    {/* Step 1: 100% Bulletproof flex-wrap layout. No lg: rules that accidentally force side-by-side */}
                                    {/* Step 1: Optimized for zero clipping. p-4 on mobile to give room, p-8+ on desktop */}
                                    <div className="relative z-10 p-4 sm:p-8 md:p-10 flex flex-wrap items-center justify-center gap-6 lg:gap-12">

                                        {/* 좌측 비주얼 & 코멘트 */}
                                        <div className="flex-[1_1_300px] max-w-full flex flex-col gap-6 justify-center min-w-0">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[11px] sm:text-xs font-black text-emerald-500 tracking-[0.2em] uppercase">
                                                    {language === 'ko' ? "프리미엄 AI 맞춤 큐레이션" : "Premium AI Curation"}
                                                </span>
                                                {/* Step 2: Title size */}
                                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-[1000] text-white tracking-tighter leading-[1.15] drop-shadow-lg break-words">
                                                    Pori’s {isTrueSynergy ? "Perfect" : "Foundation"}<br />
                                                    <span className={cn(
                                                        "text-transparent bg-clip-text bg-gradient-to-r mt-1 inline-block",
                                                        isTrueSynergy ? "from-emerald-400 to-cyan-400" : "from-blue-400 to-indigo-400"
                                                    )}>
                                                        {isTrueSynergy ? "Synergy 1-Pick" : "Daily 1-Pick"}
                                                    </span>
                                                </h3>
                                            </div>

                                            {/* 포리의 AI 코멘트 (Chat Bubble Concept) */}
                                            <div className="flex items-start gap-4 w-full mt-2">
                                                {/* Step 2: Avatar */}
                                                <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 relative rounded-full border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] bg-emerald-900/30 overflow-hidden transform hover:-rotate-6 transition-transform">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src="/hero-pori.png" alt="Pori" className="w-full h-full object-cover scale-110" />
                                                </div>

                                                {/* Step 2: Chat Bubble */}
                                                <div className="flex-1 min-w-0 shadow-xl">
                                                    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl rounded-tl-none p-4 md:p-6 border border-white/10 relative">
                                                        <div className="absolute -left-[6px] top-0 w-3 h-3 bg-slate-800/80 border-l border-t border-white/10 transform rotate-[-45deg] origin-top-right rounded-sm" />
                                                        <div className="text-[13px] sm:text-[14px] md:text-[16px] font-semibold text-slate-200 leading-[1.6] sm:leading-[1.7] break-words whitespace-pre-wrap relative z-10 w-full">
                                                            <span className={cn("font-bold block mb-2 text-[11px] md:text-sm tracking-wide", isTrueSynergy ? "text-emerald-400" : "text-blue-400")}>
                                                                💬 {language === 'ko' ? "포리의 코멘트" : "Pori says"}
                                                            </span>
                                                            {language === 'ko'
                                                                ? isTrueSynergy
                                                                    ? `회원님이 드시는 성분들과 [${recName}]은 찰떡궁합이에요! 흡수율이 가장 높은 제품으로 특별히 찾아왔어요.`
                                                                    : result.score >= 100
                                                                        ? `이미 완벽한 영양 조합을 갖추셨네요! 혹시 놓치고 계실지 모를 기초 영양을 위해 [${recName}]를 추천드려요.`
                                                                        : `직접적인 충돌은 없으면서도, 부족한 기초 영양을 탄탄하게 채워줄 수 있는 [${recName}]를 골라봤어요!`
                                                                : isTrueSynergy
                                                                    ? `[${recName}] is a perfect match with your current stack! I found the most absorbable one for you.`
                                                                    : result.score >= 100
                                                                        ? `You have a perfect stack already! I recommend [${recName}] as a foundational gap-filler for your long-term health.`
                                                                        : `I selected [${recName}] to reinforce your foundational health without any conflict with your current routine.`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 3: 우측 상품 카드 — Premium Holographic Redesign */}
                                        <div className="flex-[1_1_300px] w-full flex justify-center items-center px-2 sm:px-0">
                                            <div className="w-full max-w-[380px] group/card relative flex flex-col items-center">

                                                {/* ── Outer glow ring that pulses on hover ── */}
                                                <div className={cn(
                                                    "absolute -inset-0.5 rounded-[3rem] opacity-0 group-hover/card:opacity-100 blur-xl transition-all duration-700",
                                                    isTrueSynergy
                                                        ? "bg-gradient-to-br from-emerald-400/60 via-teal-300/40 to-cyan-500/60"
                                                        : "bg-gradient-to-br from-blue-500/60 via-indigo-400/40 to-violet-500/60"
                                                )} />

                                                {/* ── Main card shell ── */}
                                                <div className="relative w-full bg-[#0d1117] rounded-[2.8rem] border border-white/10 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] transition-all duration-500 group-hover/card:-translate-y-2">

                                                    {/* Aurora background */}
                                                    <div className={cn(
                                                        "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[90px] opacity-30 group-hover/card:opacity-60 transition-opacity duration-700",
                                                        isTrueSynergy ? "bg-emerald-500" : "bg-blue-500"
                                                    )} />
                                                    <div className={cn(
                                                        "absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover/card:opacity-40 transition-opacity duration-700",
                                                        isTrueSynergy ? "bg-teal-400" : "bg-violet-500"
                                                    )} />

                                                    {/* Scan line */}
                                                    <motion.div
                                                        animate={{ y: ["-100%", "400%"] }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                                                        className={cn(
                                                            "absolute left-0 right-0 h-px blur-sm z-10",
                                                            isTrueSynergy ? "bg-emerald-400/60" : "bg-blue-400/60"
                                                        )}
                                                    />

                                                    {/* Content */}
                                                    <div className="relative z-20 p-6 sm:p-8 flex flex-col items-center gap-6">

                                                        {/* Badge */}
                                                        <div className={cn(
                                                            "flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                                                            isTrueSynergy
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                                        )}>
                                                            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isTrueSynergy ? "bg-emerald-400" : "bg-blue-400")} />
                                                            {language === 'ko' ? 'AI 추천 1순위' : 'AI Top Pick'}
                                                        </div>

                                                        {/* Floating pill image */}
                                                        <motion.div
                                                            animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                            className="text-[5rem] sm:text-[6.5rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
                                                        >
                                                            💊
                                                        </motion.div>

                                                        {/* Product name */}
                                                        <div className="text-center space-y-1">
                                                            <h4 className="text-2xl sm:text-3xl font-[1000] text-white tracking-tighter leading-none break-keep">
                                                                {recName}
                                                            </h4>
                                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
                                                                Premium · Ultra-Pure
                                                            </p>
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                                        {/* CTA button */}
                                                        <div className="relative w-full group/btn">
                                                            {/* Multi-layer glow */}
                                                            <div className={cn(
                                                                "absolute -inset-1 rounded-2xl blur-lg opacity-60 group-hover/btn:opacity-100 transition-opacity duration-500",
                                                                isTrueSynergy
                                                                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                                                                    : "bg-gradient-to-r from-blue-600 to-violet-500"
                                                            )} />
                                                            <a
                                                                href={buyUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={cn(
                                                                    "relative w-full py-4 sm:py-5 px-6 rounded-2xl flex items-center justify-between gap-3 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                                                                    isTrueSynergy
                                                                        ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_10px_40px_rgba(16,185,129,0.5)]"
                                                                        : "bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 shadow-[0_10px_40px_rgba(99,102,241,0.5)]"
                                                                )}
                                                            >
                                                                {/* Shimmer sweep */}
                                                                <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_forwards] pointer-events-none" />

                                                                <div className="flex flex-col text-left z-10">
                                                                    <span className="text-[9px] sm:text-[11px] font-[900] text-white/70 uppercase tracking-[0.2em] leading-none mb-1">
                                                                        {language === 'ko' ? '오늘만 특가' : 'Limited Offer'}
                                                                    </span>
                                                                    <span className="text-base sm:text-xl font-[1000] text-white tracking-tight leading-none">
                                                                        {language === 'ko' ? '지금 최저가로 구매' : 'Get at Best Price'}
                                                                    </span>
                                                                </div>

                                                                <div className="z-10 w-11 h-11 sm:w-12 sm:h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-all duration-500 shadow-inner">
                                                                    <ShoppingCart size={20} className="text-white" />
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })()}

                    {/* Secondary CTA: Reset (Restored) */}
                    <div className="pt-12 pb-8 flex flex-col items-center gap-4 relative z-10 w-full max-w-xl mx-auto">
                        <motion.button
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            onClick={() => {
                                clearBasket();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors px-4 py-2"
                        >
                            <span className="text-sm font-bold tracking-tight">{language === 'ko' ? '다른 영양제 분석하기' : 'Analyze other supplements'}</span>
                            <RefreshCcw size={14} className="opacity-70" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
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
        label: "시너지",
        color: "bg-emerald-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-emerald-500/10",
        glowColor: "bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        icon: TrendingUp,
        iconColor: "text-emerald-500",
        borderColor: "border-emerald-100/50",
    },
    CAUTION: {
        label: "주의",
        color: "bg-amber-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-amber-500/10",
        glowColor: "bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
        icon: AlertTriangle,
        iconColor: "text-amber-500",
        borderColor: "border-amber-100/50",
    },
    CONFLICT: {
        label: "충돌",
        color: "bg-red-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-red-500/10",
        glowColor: "bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        icon: XCircle,
        iconColor: "text-red-500",
        borderColor: "border-red-100/50",
    },
} as const;

/** 점수 링 컴포넌트 - 시네마틱 AI 프로토콜 버전 */
function ScoreRing({ score }: { score: number }) {
    const radius = 72;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    
    // 애니메이션을 위한 모션 벨류
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const spring = useSpring(count, { stiffness: 45, damping: 20 });

    useEffect(() => {
        const animation = animate(count, score, { duration: 2.5, ease: [0.22, 1, 0.36, 1] });
        return animation.stop;
    }, [score, count]);

    const offset = useTransform(spring, (latest) => 
        circumference - (latest / 100) * circumference
    );

    // 구슬(Orbital Particle)의 위치 계산
    const orbX = useTransform(spring, (latest) => {
        const angle = (latest / 100) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return 90 + radius * Math.cos(rad);
    });
    const orbY = useTransform(spring, (latest) => {
        const angle = (latest / 100) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return 90 + radius * Math.sin(rad);
    });

    const getColor = (s: number) => {
        if (s >= 70) return { main: "#10b981", light: "#34d399", accent: "#fbbf24" };
        if (s >= 40) return { main: "#f59e0b", light: "#fbbf24", accent: "#ffffff" };
        return { main: "#ef4444", light: "#f87171", accent: "#ffffff" };
    };

    const colors = getColor(score);

    return (
        <div className="relative flex items-center justify-center w-72 h-72 md:w-80 md:h-80 select-none">
            {/* 주변 네온 오라 (Super Deep Glow) */}
            <div
                className="absolute inset-0 rounded-full opacity-30 blur-[100px] transition-all duration-1000 scale-125"
                style={{ background: `radial-gradient(circle, ${colors.main} 0%, transparent 70%)` }}
            />

            <svg viewBox="0 0 180 180" className="w-full h-full transform transition-all duration-1000">
                <defs>
                    <linearGradient id="scoreProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.main} />
                        <stop offset="100%" stopColor={colors.light} />
                    </linearGradient>
                    <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* 베이스 가이드 링 (Track) */}
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* 프로그레스 링 1 (Outer Blur Layer) */}
                <motion.circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={colors.main}
                    strokeWidth={strokeWidth + 4}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset, opacity: 0.2, filter: "blur(8px)", strokeLinecap: "round" }}
                    className="-rotate-90 origin-center"
                />

                {/* 프로그레스 링 2 (Inner Pure Layer) */}
                <motion.circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="url(#scoreProgressGrad)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset, strokeLinecap: "round" }}
                    className="-rotate-90 origin-center"
                />

                {/* 궤도 위 구슬 (Particle Orb) */}
                <motion.circle
                    cx={orbX}
                    cy={orbY}
                    r="4.5"
                    fill="white"
                    filter="url(#orbGlow)"
                    style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))" }}
                />
            </svg>

            {/* 텍스트 정보 레이어 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <div className="relative">
                    <motion.span className="text-7xl md:text-8xl font-[1000] text-white tracking-tighter drop-shadow-2xl">
                        {rounded}
                    </motion.span>
                    <span 
                        className="absolute -top-1 -right-8 text-xs font-black italic tracking-widest uppercase"
                        style={{ color: colors.accent }}
                    >
                        PTS
                    </span>
                </div>
                
                {/* 하단 장식선 */}
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 60, opacity: 0.5 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="h-px bg-white/50 mb-4 mt-2"
                />

                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white/60">
                    AI Protocol
                </span>
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
                                    {language === "ko" ? config.label : type}
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
function ProductCard({ product, index, sourceIngredient }: { product: CoupangProduct; index: number; sourceIngredient?: string }) {
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
            {/* 상단 비주얼 영역 - 콤팩트화 */}
            <div className="relative h-[160px] md:h-[180px] bg-gradient-to-b from-slate-50/80 to-white flex items-center justify-center p-6 overflow-hidden">
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
                <h4 className="font-extrabold text-[15px] sm:text-base text-slate-900 leading-[1.3] mb-4 line-clamp-2 min-h-[40px] tracking-tight group-hover/card:text-blue-600 transition-colors">
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

                {/* 가격 및 구매 인터페이스 - 콤팩트 레이아웃 */}
                <div className="mt-auto border-t border-slate-50 pt-5 flex items-end justify-between">
                    <div className="flex flex-col">
                        {product.discount_rate && (
                           <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-rose-500 text-[10px] font-black italic">{product.discount_rate}% OFF</span>
                                {product.original_price && (
                                    <span className="text-[9px] text-slate-300 line-through font-bold">
                                        ₩{Math.floor(product.original_price).toLocaleString()}
                                    </span>
                                )}
                           </div>
                        )}
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-[12px] font-black text-slate-400">₩</span>
                            <span className="text-2xl md:text-3xl font-[1000] text-slate-900 tracking-tighter">
                                {product.price > 0 ? Math.floor(product.price).toLocaleString() : t.products.outOfStock}
                            </span>
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "group/btn relative overflow-hidden rounded-[1.2rem] px-5 h-11 transition-all duration-500 shadow-lg hover:shadow-xl active:scale-95 border border-white/10",
                            config.gradient,
                            config.glow
                        )}
                        asChild
                    >
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            {/* 쉬머 효과 */}
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                            <ShoppingCart size={14} className="text-white/90" />
                            <span className="text-[13px] font-black tracking-tight text-white whitespace-nowrap">
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
}

export default function AnalysisResults({ result, coupangProducts = [] }: AnalysisResultsProps) {
    const { clearBasket, language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];

    if (!result || !result.ingredients) {
        return <div className="p-20 text-center text-slate-400">{t.common.loading}...</div>;
    }

    const allInteractions = [
        ...result.synergies,
        ...result.cautions,
        ...result.conflicts,
    ].filter((r) => r && r.interaction);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-24 pb-48 w-full max-w-7xl mx-auto px-4 md:px-8"
        >
            {/* 종합 점수 카드 - Centered Impact & Premium Report */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500 rounded-[3rem] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>

                <Card className="relative rounded-[2.5rem] overflow-hidden border-none bg-slate-900 text-white shadow-2xl texture-grain">
                    {/* 하이테크 스캔라인 효과 */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none opacity-50 md:opacity-100" />

                    <CardContent className="p-8 md:p-16 relative z-10 flex flex-col items-center text-center">
                        {/* 0. 점수 링 섹션 (최상단) */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative mb-12"
                        >
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full scale-150 pointer-events-none" />
                            <ScoreRing score={result.score} />
                        </motion.div>

                        {/* 1. AI 뱃지 */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2.5 px-5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8"
                        >
                            <Sparkles size={14} className="text-indigo-300 animate-pulse" />
                            <span className="text-[10px] md:text-xs font-black text-indigo-100 uppercase tracking-[0.3em] pt-0.5">AI Precision Analysis</span>
                        </motion.div>

                        {/* 2. 초대형 타이틀 */}
                        <div className="mb-10 space-y-4">
                            <motion.h2 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                className="text-6xl md:text-8xl font-[1000] tracking-tighter leading-none text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                            >
                                {result.score >= 70 ? t.results.synergy : result.score >= 40 ? t.results.caution : t.results.conflict}
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl md:text-3xl font-black text-emerald-400 tracking-tight"
                            >
                                {result.score >= 70 
                                    ? t.results.bestMix 
                                    : result.score >= 40 
                                        ? t.results.potentialConflict 
                                        : t.results.dangerous}
                            </motion.p>
                        </div>

                        {/* 3. 인용문 형태의 요약 박스 */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="relative w-full max-w-2xl mb-16 group/summary"
                        >
                            <div className="absolute -top-4 -left-4 text-4xl text-white/10 font-serif select-none">“</div>
                            <div className="absolute -bottom-10 -right-4 text-4xl text-white/10 font-serif select-none rotate-180">“</div>
                            
                            <div className="relative px-8 py-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner overflow-hidden">
                                {/* 내부 체크 아이콘 배경 */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                    <ShieldCheck size={180} />
                                </div>
                                <div className="relative flex items-center justify-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                        <ShieldCheck size={18} className="text-emerald-400" />
                                    </div>
                                    <p className="text-lg md:text-2xl font-bold text-white/90 tracking-tight">
                                        {result.summary}
                                    </p>
                                </div>
                            </div>
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
                                    className="flex items-center gap-4 bg-slate-800/40 border border-white/5 rounded-2xl px-6 py-4 backdrop-blur-sm group/ing hover:bg-slate-800/60 transition-colors"
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
                </Card>
            </div>

            {/* 궁합 상세 섹션 */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {t.results.matrixTitle}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">{t.results.matrixSubtitle}</p>
                    </div>
                    <Badge variant="outline" className="rounded-lg px-3 py-1 border-slate-200 text-slate-400 font-bold bg-slate-50">
                        {allInteractions.length}{language === "ko" ? "건의 분석결과" : " Results"}
                    </Badge>
                </div>

                {allInteractions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-x-16 md:gap-y-20 py-10 place-items-center">
                        {[...result.synergies, ...result.cautions, ...result.conflicts].map(
                            (r, idx) =>
                                r.interaction && (
                                    <SynergyCard key={r.interaction.id ?? idx} result={r} index={idx} />
                                )
                        )}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-[3rem] p-16 md:p-24 text-center group"
                        style={{
                            background: "linear-gradient(145deg, rgba(16,185,129,0.05) 0%, rgba(8,145,178,0.03) 100%)",
                            border: "1px solid rgba(16,185,129,0.1)",
                            boxShadow: "0 20px 60px -10px rgba(0,0,0,0.1), inset 0 0 30px rgba(16,185,129,0.02)"
                        }}
                    >
                        {/* 배경 장식 HUD */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-[2rem]" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-emerald-500/30 rounded-br-[2rem]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
                        </div>

                        <div className="relative z-10 space-y-8 flex flex-col items-center">
                            {/* 초대형 시큐리티 실드 애니메이션 */}
                            <div className="relative w-28 h-28 md:w-36 md:h-36">
                                {/* 바깥 궤도 링 */}
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/20" 
                                />
                                
                                {/* 스캐너 빔 */}
                                <motion.div 
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.4)_20deg,transparent_40deg)]" 
                                />

                                <div className="absolute inset-4 rounded-[1.8rem] bg-white shadow-xl flex items-center justify-center border border-emerald-50/50">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        <ShieldCheck size={56} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" strokeWidth={1.5} />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em]"
                                >
                                    Security Status: Verified
                                </motion.div>
                                <h4 className="text-2xl md:text-3xl lg:text-4xl font-[1000] text-slate-800 tracking-tighter">
                                    {t.results.noInteraction}
                                </h4>
                                <p className="text-sm md:text-lg text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                                    {t.results.noInteractionBody}
                                </p>
                            </div>

                            {/* 세이프티 배지 */}
                            <div className="flex gap-4 pt-4">
                                {['Zero Risk', 'Bio-Safe', '100% Synergy'].map((label, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 italic">
                                        <Zap size={10} className="text-emerald-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 쇼핑 섹션 - Personalized Medical Recommendation */}
            <div className="relative rounded-[3rem] md:rounded-[4rem] bg-[#0f172a] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                {/* 배경 효과 영역 (터치에 방해되지 않도록 분리) */}
                <div className="absolute inset-0 rounded-[3rem] md:rounded-[4rem] overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -mr-64 -mt-64" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -ml-64 -mb-64" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                </div>

                {/* 중앙 정렬 럭셔리 헤더 영역 */}
                <div className="p-8 sm:p-12 md:p-16 pb-8">
                    <div className="flex flex-col items-center text-center relative z-10 space-y-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-full shadow-lg backdrop-blur-md"
                        >
                            <ShoppingCart size={14} className="text-emerald-400 animate-pulse" />
                            <span className="text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] pt-px">Personalized Pharmacy</span>
                        </motion.div>

                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-[1000] text-white tracking-tighter leading-tight drop-shadow-md">
                                {t.results.prescriptionTitle}<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{t.results.premiumPrescription}</span>
                            </h3>
                            <p className="text-slate-400 font-medium text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
                                {t.results.prescriptionSubtitle}
                            </p>
                        </div>

                        <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-emerald-400 font-black text-[10px] md:text-xs tracking-widest uppercase">{t.results.lowestPriceFound}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 모바일 가로 스크롤 스와이프 안내 */}
                <div className="lg:hidden flex items-center justify-end px-8 mb-4 max-w-5xl mx-auto">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400/80 uppercase tracking-widest animate-pulse">
                        {t.common.swipeToSeeMore} <ArrowRight size={14} className="opacity-70" />
                    </span>
                </div>

                {/* 가로 스크롤 컨테이너 (드래그 지원) */}
                <div className="relative z-10 px-6 sm:px-10 lg:px-16 max-w-5xl mx-auto overflow-hidden group/productScroll">
                    {/* 페이드 마스크 */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/50 to-transparent z-20 pointer-events-none opacity-0 group-hover/productScroll:opacity-100 transition-opacity lg:hidden" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0f172a] via-[#0f172a]/50 to-transparent z-20 pointer-events-none opacity-0 group-hover/productScroll:opacity-100 transition-opacity lg:hidden" />

                    <motion.div
                        drag="x"
                        dragConstraints={{ left: -1000, right: 0 }} // 임시, 실제 너비에 맞춰 자동 계산 로직 필요 시 추가
                        dragElastic={0.05}
                        dragTransition={{ power: 0.1, timeConstant: 200 }}
                        className="flex flex-nowrap lg:grid lg:grid-cols-2 pt-4 pb-10 gap-4 sm:gap-6 lg:gap-8 cursor-grab active:cursor-grabbing lg:cursor-default lg:overflow-visible"
                    >
                        {result.ingredients.map((ing, idx) => {
                            const searchKeyword = language === "ko"
                                ? (ing.coupang_search_keyword || ing.name)
                                : (ing.amazon_search_keyword || ing.name_en);

                            const shopUrl = language === "ko"
                                ? `https://www.coupang.com/np/search?q=${encodeURIComponent(searchKeyword)}`
                                : `https://www.amazon.com/s?k=${encodeURIComponent(searchKeyword)}`;

                            return (
                                <div key={`${ing.id}-${idx}`} className="w-[240px] sm:w-[300px] lg:w-auto flex-shrink-0 lg:flex-shrink snap-center lg:snap-align-none">
                                    <ProductCard
                                        index={idx}
                                        sourceIngredient={language === "ko" ? ing.name : ing.name_en}
                                        product={{
                                            product_id: `mock-${ing.id}-${idx}`,
                                            name: language === "ko"
                                                ? `${ing.name} ${idx % 2 === 0 ? "프리미엄 정량 고농축" : "고효능 시너지 포뮬러"}`
                                                : `${ing.name_en} ${idx % 2 === 0 ? "Premium High Conc." : "High Potency Synergy Formula"}`,
                                            product_url: shopUrl,
                                            image_url: "",
                                            price: language === "ko" ? (28000 + (idx * 3500)) : (19.99 + (idx * 5.5)),
                                            original_price: language === "ko" ? (35000 + (idx * 4000)) : (29.99 + (idx * 6.5)),
                                            discount_rate: 14 + (idx % 10),
                                            is_rocket: language === "ko",
                                            rating: 4.7 + (idx * 0.02),
                                            review_count: 500 + (idx * 100)
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* 다시 분석하기 버튼 - Premium Glassmorphism & Soft Glow */}
            <div className="pt-20 px-4 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative w-full max-w-xl group"
                >
                    {/* 뒤 배경 소프트 글로우 */}
                    <div className="absolute -inset-8 bg-gradient-to-r from-emerald-400/10 via-teal-400/5 to-cyan-400/10 rounded-full blur-[80px] opacity-100 group-hover:opacity-100 transition duration-1000" />

                    <Button
                        onClick={clearBasket}
                        className={cn(
                            "w-full pt-20 pb-16 md:pt-28 md:pb-20 h-auto rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden transition-all duration-700",
                            "bg-slate-900 border border-white/10",
                            "shadow-[0_40px_100px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                            "hover:scale-[1.02] active:scale-95 group/reset"
                        )}
                    >
                        {/* 다이나믹 배경 장식 */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)] opacity-0 group-hover/reset:opacity-100 transition-opacity duration-700" />
                            <div className="absolute -inset-[100%] group-hover/reset:animate-[spin_10s_linear_infinite] opacity-20 pointer-events-none"
                                 style={{ background: "conic-gradient(from_0deg, transparent_0deg, #10b981_20deg, transparent_40deg, transparent_180deg, #06b6d4_200deg, transparent_220deg)" }} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center w-full gap-6 md:gap-8">
                            {/* 아이콘 컨테이너 - 모바일 사이즈 최적화 */}
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-3 md:-inset-4 rounded-full border border-dashed border-emerald-500/20 opacity-50"
                                />
                                <motion.div
                                    whileHover={{ rotate: 180, scale: 1.1 }}
                                    transition={{ duration: 0.8, ease: "anticipate" }}
                                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] relative z-10"
                                >
                                    <RefreshCcw className="w-5 h-5 md:w-6 md:h-6 drop-shadow-lg" strokeWidth={3} />
                                </motion.div>
                            </div>

                            <div className="text-center space-y-2 px-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-80">
                                        System Re-Initialization
                                    </span>
                                </div>
                                <h3 className="text-lg md:text-3xl font-[1000] tracking-tighter text-white leading-tight drop-shadow-md break-keep">
                                    {t.common.reset}
                                </h3>
                                <p className="text-slate-400 font-bold text-[9px] md:text-xs uppercase tracking-widest opacity-40 group-hover/reset:opacity-80 transition-opacity">
                                    Clear protocol & start fresh
                                </p>
                            </div>
                        </div>

                        {/* 프리미엄 쉬머 스캔 */}
                        <motion.div 
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" 
                        />
                    </Button>
                </motion.div>
            </div>

            {/* 법적 고지 - Premium Professional Layout */}
            <div className="mt-32 pb-32 px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto relative"
                >
                    {/* 상단 장식선 */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                        <div className="relative group/icon">
                            <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full scale-150 animate-pulse" />
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center relative z-10">
                                <AlertTriangle size={18} className="text-amber-500" />
                            </div>
                        </div>
                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    </div>

                    <div className="text-center space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">
                            {t.common.medicalDisclaimerTitle}
                        </h4>

                        <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-slate-50/30 border border-slate-100/50 backdrop-blur-sm shadow-inner group/body">
                            {/* 코너 데코레이션 */}
                            <div className="absolute top-0 right-10 w-20 h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
                            <div className="absolute bottom-0 left-10 w-20 h-px bg-gradient-to-r from-transparent via-sky-200/50 to-transparent" />

                            <p className="text-[13px] md:text-[15px] text-slate-400 font-medium leading-[1.8] tracking-tight max-w-2xl mx-auto italic opacity-80 group-hover/body:opacity-100 transition-opacity duration-700">
                                {t.common.medicalDisclaimerBody}
                            </p>
                        </div>

                        {/* 하단 시스템 시그니처 */}
                        <div className="pt-6 flex flex-col items-center opacity-40">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mb-2" />
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em] pl-[0.5em]">
                                ZestPair Security Protocol
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

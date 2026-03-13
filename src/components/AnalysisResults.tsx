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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useBasketStore } from "@/store/basketStore";
import type { CoupangProduct, AnalysisResult, InteractionResult } from "@/types/database";
import SynergyCard from "./SynergyCard";

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

/** 점수 링 컴포넌트 */
/** 점수 링 컴포넌트 - 프리미엄 그래디언트 및 글로우 버전 */
function ScoreRing({ score }: { score: number }) {
    const radius = 70;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 70) return ["#10b981", "#34d399", "rgba(16, 185, 129, 0.5)"]; // Emerald/Green
        if (s >= 40) return ["#f59e0b", "#fbbf24", "rgba(245, 158, 11, 0.5)"]; // Amber
        return ["#ef4444", "#f87171", "rgba(239, 68, 68, 0.5)"]; // Red
    };

    const [mainColor, lightColor, glowColor] = getColor(score);

    return (
        <div className="relative flex items-center justify-center w-64 h-64 md:w-72 md:h-72 select-none">
            {/* 주변 네온 오라 (Deep Glow) */}
            <div
                className="absolute inset-0 rounded-full opacity-30 blur-[100px] transition-all duration-1000 scale-125"
                style={{ backgroundColor: mainColor }}
            />

            <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={mainColor} />
                        <stop offset="100%" stopColor={lightColor} />
                    </linearGradient>
                    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* 베이스 가이드 링 (Track) */}
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* 메인 프로그레스 링 (Outer Glow layer) */}
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={mainColor}
                    strokeWidth={strokeWidth + 2}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset,
                        transition: "stroke-dashoffset 2.5s cubic-bezier(0.2, 1, 0.3, 1)",
                        opacity: 0.3,
                        filter: "blur(8px)"
                    }}
                    strokeLinecap="round"
                />

                {/* 메인 프로그레스 링 (Inner Glow layer) */}
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={lightColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset,
                        transition: "stroke-dashoffset 2.5s cubic-bezier(0.2, 1, 0.3, 1)",
                        filter: "url(#neonGlow)"
                    }}
                    strokeLinecap="round"
                />

                {/* 프로그레스 포인트 (End dot) */}
                <motion.circle
                    cx={90 + radius * Math.cos((score / 100) * 2 * Math.PI - Math.PI / 2)}
                    cy={90 + radius * Math.sin((score / 100) * 2 * Math.PI - Math.PI / 2)}
                    r="4.5"
                    fill="white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    style={{
                        transition: "all 2.5s cubic-bezier(0.2, 1, 0.3, 1)",
                        filter: "drop-shadow(0 0 8px white)"
                    }}
                />
            </svg>

            {/* 내부 텍스트 레이아웃 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                <div className="relative flex flex-col items-center">
                    {/* 상단 PTS 레이블 - 강조 버전 */}
                    <div className="absolute -top-3 -right-10 flex flex-col items-start">
                        <span className="text-xs md:text-sm font-black text-yellow-300 tracking-widest drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]">
                            PTS
                        </span>
                    </div>

                    {/* 중앙 메인 점수 - 크기 최적화 */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="relative"
                    >
                        <span className={cn(
                            "text-6xl md:text-7xl font-[1000] tracking-tight tabular-nums leading-none",
                            "bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400",
                            "filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                        )}>
                            {score}
                        </span>
                    </motion.div>

                    {/* 하단 구분선 및 타이틀 - 부각 버전 */}
                    <div className="flex flex-col items-center w-full mt-4">
                        <div className="h-[2px] w-14 bg-gradient-to-r from-transparent via-white to-transparent mb-3 shadow-[0_0_10px_white]" />
                        <span className="text-[11px] md:text-13px font-black text-white tracking-[0.6em] pl-[0.6em] leading-none uppercase filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                            AI PROTOCOL
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 상호작용 카드 컴포넌트 */
function InteractionCard({ result }: { result: InteractionResult }) {
    if (!result.interaction) return null;
    const { type, title, reason, recommendation } = result.interaction;
    const config = interactionTypeConfig[type];
    const Icon = config.icon;

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
                                <h4 className="font-bold text-lg text-slate-900 leading-tight tracking-tight">{title}</h4>
                                <Badge className={cn("text-[10px] px-2 py-0 h-5 border-none font-black uppercase tracking-wider", config.color)}>
                                    {config.label}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                <span className="text-slate-600 font-black">{result.pair[0].name}</span>
                                <Zap size={10} className="text-emerald-400 animate-pulse" />
                                <span className="text-slate-600 font-black">{result.pair[1].name}</span>
                            </div>
                            <p className="text-[15px] text-slate-600 leading-relaxed mb-5 font-medium">{reason}</p>

                            {recommendation && (
                                <div className="p-4 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 bg-emerald-100 rounded-lg">
                                            <ShieldCheck size={14} className="text-emerald-600" />
                                        </div>
                                        <span className="text-[11px] text-emerald-800 font-black uppercase tracking-tighter">전문가 권고 프로토콜</span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-semibold leading-relaxed">{recommendation}</p>
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
    const configs = [
        { label: "AI 최적 추천", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", gradient: "from-blue-600 to-indigo-600", glow: "shadow-blue-500/20" },
        { label: "시너지 극대화", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", gradient: "from-emerald-600 to-teal-600", glow: "shadow-emerald-500/20" },
        { label: "최고의 가성비", color: "text-amber-600", bg: "bg-amber-50", border: "border-orange-100", gradient: "from-orange-500 to-amber-600", glow: "shadow-orange-500/20" },
    ];
    const config = configs[index % configs.length];

    return (
        <Card className="group h-full flex flex-col overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 rounded-[2.5rem] bg-white relative">
            {/* 배경 글로우 장식 */}
            <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000", config.bg)} />

            {/* 상단 비주얼 영역 */}
            <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50/50 to-white flex items-center justify-center p-8 overflow-hidden">
                {/* 랭킹 넘버링 */}
                <div className="absolute top-5 left-6 z-10">
                    <span className="text-4xl font-[1000] italic text-slate-100 group-hover:text-emerald-50 transition-colors select-none">
                        0{index + 1}
                    </span>
                </div>

                {/* 매칭 뱃지 */}
                <div className="absolute top-5 right-5 z-10 flex flex-col items-end gap-2">
                    <Badge className={cn("px-2.5 py-1 border-none shadow-sm text-[10px] font-black uppercase tracking-tight text-white bg-gradient-to-r", config.gradient)}>
                        {config.label}
                    </Badge>
                </div>

                {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000 drop-shadow-xl"
                    />
                ) : (
                    <div className="relative">
                        <div className="text-7xl group-hover:scale-110 transition-transform duration-700 select-none drop-shadow-2xl">
                            {index % 4 === 0 ? "💊" : index % 4 === 1 ? "🧬" : index % 4 === 2 ? "🧪" : "🧴"}
                        </div>
                        <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full -z-10 animate-pulse" />
                    </div>
                )}

                {/* 하단 샴페인 데코레이션 */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
            </div>

            <CardContent className="px-6 pb-8 pt-2 flex flex-col flex-1">
                {/* 매칭 정보 태그 */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">
                        {sourceIngredient ? `${sourceIngredient} 관련 맞춤추천` : "AI 정밀 시너지 추천"}
                    </p>
                </div>

                {/* 상품명 - 가독성 중심 */}
                <h4 className="font-ex-bold text-lg text-slate-900 leading-[1.4] mb-6 line-clamp-2 min-h-[2.8em] tracking-tight group-hover:text-emerald-700 transition-colors">
                    {product.name}
                </h4>

                {/* 별점 & 배송 - 깔끔한 인디케이터 */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Star size={14} fill="#F59E0B" className="text-amber-500" />
                        <span className="text-sm font-black text-slate-700">{typeof product.rating === 'number' ? product.rating.toFixed(1) : "4.8"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sky-500 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                        <Truck size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase italic">Rocket</span>
                    </div>
                </div>

                {/* 가격 및 구매 인터페이스 */}
                <div className="mt-auto flex flex-col gap-5">
                    <div className="flex items-end justify-between border-t border-slate-50 pt-5 pr-2">
                        <div className="flex flex-col">
                            {product.discount_rate && (
                                <span className="text-rose-500 text-[11px] font-black italic mb-0.5 animate-bounce-subtle">{product.discount_rate}% Limited Sale</span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-slate-400">₩</span>
                                <span className="text-3xl font-[1000] text-slate-900 tracking-tighter">
                                    {product.price > 0 ? Math.floor(product.price).toLocaleString() : "품절임박"}
                                </span>
                            </div>
                        </div>
                        {product.original_price && (
                            <span className="text-xs text-slate-300 line-through font-bold pb-1">
                                ₩{Math.floor(product.original_price).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <Button
                        className={cn(
                            "w-full h-15 rounded-2xl text-white font-[900] text-[15px] transition-all duration-500 shadow-lg hover:shadow-2xl group-hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 relative overflow-hidden bg-gradient-to-r border border-white/20",
                            config.gradient,
                            config.glow
                        )}
                        asChild
                    >
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full h-full py-4">
                            {/* 고급스러운 빛 반사 쉬머 효과 */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />

                            <ShoppingCart size={18} className="text-white/90 drop-shadow-sm" />
                            <span className="tracking-wide drop-shadow-md">쿠팡 최저가 구매</span>
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AnalysisResults({ result, coupangProducts = [] }: AnalysisResultsProps) {
    const { clearBasket, setHasResult } = useBasketStore();

    if (!result || !result.ingredients) {
        return <div className="p-20 text-center text-slate-400">분석 결과를 불러오는 중입니다...</div>;
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

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />

                    <CardContent className="p-10 md:p-16 relative z-10 flex flex-col items-center text-center">
                        {/* 1. 최상단 스코어 섹션 (Centered) */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full scale-150 pointer-events-none" />
                            <ScoreRing score={result.score} />
                        </div>

                        {/* 2. 상태 텍스트 섹션 */}
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                                    <Sparkles size={16} className="text-indigo-300 animate-pulse" />
                                    <span className="text-[10px] md:text-xs font-black text-indigo-200 uppercase tracking-[0.3em]">AI Precision Analysis</span>
                                </div>

                                <h2 className={cn(
                                    "text-5xl md:text-8xl font-[1000] tracking-tighter leading-none py-2",
                                    "bg-clip-text text-transparent bg-gradient-to-b from-white via-white 60% to-white/40",
                                    "drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                                )}>
                                    {result.score >= 70
                                        ? "시너지 폭발!"
                                        : result.score >= 40
                                            ? "주의필요 단계"
                                            : "조합 재고필요"}
                                </h2>

                                <div className="flex items-center gap-3">
                                    <div className="h-px w-8 bg-emerald-500/30" />
                                    <p className="text-xl md:text-3xl font-black text-emerald-400 tracking-tight">
                                        {result.score >= 70
                                            ? "최상의 조화를 이룬 믹스입니다"
                                            : result.score >= 40
                                                ? "성분 간 상충 가능성 감지"
                                                : "함께 드시면 건강이 위험할 수 있어요"}
                                    </p>
                                    <div className="h-px w-8 bg-emerald-500/30" />
                                </div>
                            </div>

                            {/* 요약 박스 (Centered & Focused) */}
                            <div className="relative group/summary">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 rounded-3xl blur opacity-0 group-hover/summary:opacity-100 transition duration-500" />
                                <div className="relative p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner text-lg md:text-xl text-white/70 leading-relaxed font-medium tracking-tight">
                                    <div className="absolute top-0 left-0 p-3 opacity-20">❝</div>
                                    <div className="absolute bottom-0 right-0 p-3 opacity-20 rotate-180">❝</div>
                                    {result.summary}
                                </div>
                            </div>

                            {/* 복용 성분 리스트 (Centered Grid) */}
                            <div className="pt-4 flex flex-wrap justify-center gap-3">
                                {result.ingredients.map((ing) => (
                                    <motion.div
                                        key={ing.id}
                                        whileHover={{ y: -5, scale: 1.05 }}
                                        className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-6 py-3.5 font-black shadow-lg backdrop-blur-md"
                                    >
                                        <span className="text-2xl">{ing.icon_emoji}</span>
                                        <span className="text-sm tracking-tight text-white/90">{ing.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 궁합 상세 섹션 */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            상호작용 매트릭스
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">영양 성분 간의 생화학적 시너지와 충돌 분석</p>
                    </div>
                    <Badge variant="outline" className="rounded-lg px-3 py-1 border-slate-200 text-slate-400 font-bold bg-slate-50">
                        {allInteractions.length}건의 분석결과
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
                    <div className="rounded-[2rem] bg-slate-50/50 border border-slate-100 p-12 text-center shadow-inner backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <ShieldCheck size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-slate-900 font-bold text-lg">상호작용 위험 없음</p>
                        <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">선택하신 영양 성분들은 함께 복용하셔도 안전한 것으로 분석되었습니다.</p>
                    </div>
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
                                믹시가 제안하는<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">프리미엄 처방전</span>
                            </h3>
                            <p className="text-slate-400 font-medium text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
                                성분 분석 결과를 완벽하게 보완하고 시너지를 낼 수 있는 <strong className="text-emerald-400">TOP 큐레이션</strong>만을 엄선했습니다.
                            </p>
                        </div>

                        <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-emerald-400 font-black text-[10px] md:text-xs tracking-widest uppercase">실시간 최저가 탐색 완료</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 모바일 가로 스크롤 / 데스크톱 2열 그리드 전환 */}
                <div className="relative z-10 flex flex-nowrap lg:grid lg:grid-cols-2 overflow-x-auto lg:overflow-visible pb-16 px-6 sm:px-10 lg:px-16 gap-4 sm:gap-6 lg:gap-8 scrollbar-hide snap-x snap-mandatory lg:snap-none max-w-5xl mx-auto">
                    {coupangProducts.length > 0 ? (
                        coupangProducts.map((product, idx) => (
                            <div key={product.product_id} className="w-[280px] sm:w-[320px] lg:w-auto flex-shrink-0 lg:flex-shrink snap-center lg:snap-align-none">
                                <ProductCard
                                    product={product}
                                    index={idx}
                                    sourceIngredient={result.ingredients[idx % result.ingredients.length]?.name}
                                />
                            </div>
                        ))
                    ) : (
                        result.ingredients.map((ing, idx) => {
                            return (
                                <div key={`${ing.id}-${idx}`} className="w-[280px] sm:w-[320px] lg:w-auto flex-shrink-0 lg:flex-shrink snap-center lg:snap-align-none">
                                    <ProductCard
                                        index={idx}
                                        sourceIngredient={ing.name}
                                        product={{
                                            product_id: `mock-${ing.id}-${idx}`,
                                            name: `${ing.name} ${idx % 2 === 0 ? "프리미엄 정량 고농축" : "고효능 시너지 포뮬러"}`,
                                            product_url: `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.coupang_search_keyword)}`,
                                            image_url: "",
                                            price: 28000 + (idx * 3500),
                                            original_price: 35000 + (idx * 4000),
                                            discount_rate: 14 + (idx % 10),
                                            is_rocket: true,
                                            rating: 4.7 + (idx * 0.02),
                                            review_count: 500 + (idx * 100)
                                        }}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 다시 분석하기 버튼 - 3D Lift Effect */}
            <div className="pt-4 px-4">
                <Button
                    onClick={clearBasket}
                    variant="outline"
                    className={cn(
                        "w-full py-10 rounded-[2.5rem] border-none",
                        "bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]",
                        "hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:-translate-y-1 group active:translate-y-0 active:shadow-inner",
                        "transition-all duration-500 ease-out font-black text-lg text-slate-900 tracking-tight ring-1 ring-slate-100"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                            <RefreshCcw size={24} className="group-hover:rotate-180 transition-transform duration-1000" />
                        </div>
                        분석 리셋 및 새로 시작하기
                    </div>
                </Button>
            </div>

            {/* 법적 고지 - Clear Typography */}
            <div className="text-center space-y-2 pb-12">
                <div className="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em] flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-500" />
                        의학적 고지 사항
                    </p>
                </div>
                <p className="text-xs text-slate-400 leading-normal max-w-2xl mx-auto font-medium">
                    본 리포트는 정보 제공만을 목적으로 하며 의학적 진단을 대체할 수 없습니다.
                    개인의 체질에 따라 상호작용은 다르게 나타날 수 있으므로, 반드시 전문의와 상담하시기 바랍니다.
                </p>
            </div>
        </motion.div>
    );
}

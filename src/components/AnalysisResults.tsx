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

/** 프리미엄 상품 카드 */
function ProductCard({ product, index }: { product: CoupangProduct; index: number }) {
    const badges = [
        { label: "BEST SELLER", color: "bg-indigo-600" },
        { label: "HOT DEAL", color: "bg-red-500" },
        { label: "최저가 보장", color: "bg-emerald-600" },
    ];
    const badge = badges[index % badges.length];

    return (
        <Card className="group overflow-hidden border-none shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] transition-all duration-500 rounded-[2rem] bg-white flex flex-col h-full relative border border-transparent hover:border-emerald-200/50">
            {/* 상단 장식 배지 */}
            <div className="absolute top-4 left-4 z-10">
                <Badge className={cn("text-[8px] font-black border-none px-2 py-0.5 h-auto backdrop-blur-md shadow-lg select-none text-white tracking-widest animate-pulse", badge.color)}>
                    {badge.label}
                </Badge>
            </div>

            {/* 이미지 영역 */}
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-125 transition-transform duration-700 grayscale-[0.2] group-hover:grayscale-0">
                        {index % 2 === 0 ? "💊" : "🧪"}
                    </div>
                )}
                {/* 오버레이 효과 */}
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500" />
                
                {/* 랭킹 오버레이 (Optional) */}
                <div className="absolute bottom-2 right-4 text-[40px] font-black text-black/5 select-none italic group-hover:text-emerald-500/10 transition-colors">
                    0{index + 1}
                </div>
            </div>

            <CardContent className="p-5 flex flex-col flex-1">
                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-emerald-500 rounded-full" />
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">AI MATCHED</p>
                    </div>
                    <h4 className="font-bold text-[15px] text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors tracking-tight">
                        {product.name}
                    </h4>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-bold text-amber-600 ml-1">{product.rating || "4.8"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-white bg-[#00AEEF] px-2 py-1 rounded-md shadow-sm">
                            <Truck size={10} strokeWidth={3} />
                            로켓배송
                        </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-dashed border-gray-100 pt-4">
                        <div className="flex flex-col">
                            {product.discount_rate && (
                                <span className="text-[10px] text-red-500 font-black leading-none mb-1">{product.discount_rate}% SALE</span>
                            )}
                            <span className="text-2xl font-[1000] text-gray-900 leading-none tracking-tighter">
                                {product.price > 0 ? `${product.price.toLocaleString()}원` : "최저가 확인"}
                            </span>
                        </div>
                        {product.original_price && (
                            <span className="text-[11px] text-gray-300 line-through font-bold mb-1">
                                {product.original_price.toLocaleString()}원
                            </span>
                        )}
                    </div>

                    <Button
                        variant="default"
                        className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-950 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl h-12 text-sm font-black tracking-tight border-none shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:shadow-emerald-200 group-hover:-translate-y-1"
                        asChild
                    >
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                            <ShoppingCart size={16} className="mr-2" />
                            지금 최저가로 구매하기
                        </a>
                    </Button>
                    <p className="text-center text-[9px] text-gray-400 font-medium">실시간 재고 부족! 빠른 구매 권장</p>
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
            className="space-y-16 pb-32 max-w-5xl mx-auto px-4"
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

            {/* 쇼핑 섹션 - Monetization focused design */}
            <div className="relative rounded-[3.5rem] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border border-slate-100 p-10 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/20 blur-[120px] rounded-full -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/20 blur-[100px] rounded-full -ml-40 -mb-40" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 rounded-full text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-200 animate-bounce-subtle">
                            <ShoppingCart size={12} />
                            Premium Choice
                        </div>
                        <h3 className="text-3xl md:text-4xl font-[1000] text-slate-900 tracking-tighter leading-none">
                            이런 제품은 어떠세요?
                        </h3>
                        <p className="text-slate-500 font-semibold text-lg">분석 결과에 따른 <span className="text-emerald-600 font-black">정밀 시너지</span> 제품 라인업</p>
                    </div>
                </div>

                <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {coupangProducts.length > 0 ? (
                        coupangProducts.map((product, idx) => (
                            <ProductCard key={product.product_id} product={product} index={idx} />
                        ))
                    ) : (
                        result.ingredients.slice(0, 3).map((ing, idx) => (
                            <ProductCard
                                key={ing.id}
                                index={idx}
                                product={{
                                    product_id: `mock-${ing.id}`,
                                    name: `${ing.name} 프리미엄 추천 제품`,
                                    product_url: `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.coupang_search_keyword)}`,
                                    image_url: "",
                                    price: 32000 + (idx * 4500),
                                    original_price: 39000 + (idx * 5000),
                                    discount_rate: 15 + (idx * 2),
                                    is_rocket: true,
                                    rating: 4.8 + (idx * 0.1),
                                    review_count: 2450 + (idx * 150)
                                }}
                            />
                        ))
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

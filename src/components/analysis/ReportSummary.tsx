"use client";

import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

import { 
    AlertTriangle, 
    CheckCircle2, 
    Zap, 
    Share2,
    Coffee, 
    Calendar,
    Sparkles,
    Layers,
    TrendingUp,
    Users
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useBasketStore } from "@/store/basketStore";
import { AnalysisResult } from "@/types/database";

interface ReportSummaryProps {
    result: AnalysisResult;
    className?: string;
}

// 카드별 메타데이터
const CARD_META = [
    {
        labelKo: "퍼포먼스 & 전략",
        labelEn: "Performance Strategy",
        icon: Zap,
        colorClass: "text-cyan-400",
        borderClass: "border-cyan-500/20",
        bgClass: "bg-cyan-500/[0.03]",
        badgeBg: "bg-cyan-500/10",
        badgeText: "text-cyan-400",
        glowClass: "shadow-[0_0_20px_-5px_rgba(34,211,238,0.15)]",
        barColor: "bg-cyan-400/80"
    },
    {
        labelKo: "시너지 메커니즘",
        labelEn: "Synergy Mechanism",
        icon: Layers,
        colorClass: "text-emerald-400",
        borderClass: "border-emerald-500/20",
        bgClass: "bg-emerald-500/[0.03]",
        badgeBg: "bg-emerald-500/10",
        badgeText: "text-emerald-400",
        glowClass: "shadow-[0_0_20px_-5px_rgba(52,211,153,0.15)]",
        barColor: "bg-emerald-400/80"
    },
    {
        labelKo: "장기 전략 & 기대 효과",
        labelEn: "Long-Term Strategy",
        icon: TrendingUp,
        colorClass: "text-violet-400",
        borderClass: "border-violet-500/20",
        bgClass: "bg-violet-500/[0.03]",
        badgeBg: "bg-violet-500/10",
        badgeText: "text-violet-400",
        glowClass: "shadow-[0_0_20px_-5px_rgba(167,139,250,0.15)]",
        barColor: "bg-violet-400/80"
    },
    {
        labelKo: "추천 복용 대상",
        labelEn: "Recommended For",
        icon: Users,
        colorClass: "text-amber-400",
        borderClass: "border-amber-500/20",
        bgClass: "bg-amber-500/[0.03]",
        badgeBg: "bg-amber-500/10",
        badgeText: "text-amber-400",
        glowClass: "shadow-[0_0_20px_-5px_rgba(251,191,36,0.15)]",
        barColor: "bg-amber-400/80"
    },
    {
        labelKo: "생활 습관 시너지",
        labelEn: "Lifestyle Synergy",
        icon: Coffee,
        colorClass: "text-orange-400",
        borderClass: "border-orange-500/20",
        bgClass: "bg-orange-500/[0.03]",
        badgeBg: "bg-orange-500/10",
        badgeText: "text-orange-400",
        glowClass: "shadow-[0_0_20px_-5px_rgba(251,146,60,0.15)]",
        barColor: "bg-orange-400/80"
    },
    {
        labelKo: "4주 기대 효과 타임라인",
        labelEn: "4-Week Journey",
        icon: Calendar,
        colorClass: "text-pink-400",
        borderClass: "border-pink-500/20",
        bgClass: "bg-pink-500/[0.03]",
        badgeBg: "bg-pink-500/10",
        badgeText: "text-pink-400",
        glowClass: "shadow-[0_0_20px_-5px_rgba(244,114,182,0.15)]",
        barColor: "bg-pink-400/80"
    },
];

const WARN_META = {
    labelKo: "주의 사항",
    labelEn: "Caution",
    icon: AlertTriangle,
    colorClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/[0.05]",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    glowClass: "shadow-[0_0_20px_-5px_rgba(251,191,36,0.2)]",
    barColor: "bg-amber-400"
};

function extractHeadline(text: string): { headline: string; body: string } {
    // 1. 첫 번째 문장(마침표, 느낌표, 물음표)을 찾음
    const sentenceEnd = text.search(/[.。！?!]/);
    
    // 적절한 길이의 첫 문장이 있으면 분리
    if (sentenceEnd > 0 && sentenceEnd < 100) {
        const headline = text.slice(0, sentenceEnd + 1).trim();
        const body = text.slice(sentenceEnd + 1).trim();
        return { headline, body };
    }
    
    // 문장이 너무 길거나 마침표가 없으면 적당한 위치에서 자름
    if (text.length <= 60) {
        return { headline: text, body: "" };
    }

    // 공백 기준으로 약 50자 내외에서 자름
    const cutAt = text.indexOf(" ", 45) > 0 ? text.indexOf(" ", 45) : 50;
    return {
        headline: text.slice(0, cutAt).trim() + "...",
        body: text // 문장이 하나뿐일 때는 본문에 전체 노출 (중복 방지 로직은 렌더링 시 처리)
    };
}

function highlightIngredients(text: string, ingredientNames: string[], colorClass: string): React.ReactNode {
    if (!ingredientNames || !ingredientNames.length) return text;
    
    // 특수 문자 이스케이프 및 정규식 생성
    const escaped = ingredientNames
        .filter(n => n && n.length > 0)
        .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    if (escaped.length === 0) return text;
    
    const regex = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = text.split(regex);

    return parts.map((part, i) =>
        ingredientNames.includes(part)
            ? <mark key={i} className={cn("bg-transparent font-black not-italic border-b-2 border-current pb-0.5", colorClass)}>{part}</mark>
            : part
    );
}

export default function ReportSummary({ result, className }: ReportSummaryProps) {
    const { language } = useBasketStore();
    const { score, ingredients, cautions, conflicts } = result;
    const isKo = language === 'ko';

    const ingredientNames = useMemo(() =>
        ingredients.map(i => isKo ? i.name : (i.name_en || i.name)),
        [ingredients, isKo]
    );

    const insights = useMemo(() => {
        if (result.ai_briefing && result.ai_briefing.length >= 3) {
            return result.ai_briefing.slice(0, 3);
        }
        return [
            isKo ? "성분 간 흡수율을 극대화하는 최적의 배합으로 설계되었습니다." : "Optimized formulation for maximum absorption.",
            isKo ? "에너지 대사 활성화에 유리한 시너지가 확인되었습니다." : "Confirmed synergy for metabolic activation.",
            isKo ? "체내 안전성을 최우선으로 고려한 AI 검증 조합입니다." : "AI verified combination for safety."
        ];
    }, [result.ai_briefing, isKo]);

    const isHighEnd = score >= 85;
    const hasWarning = (conflicts?.length || 0) > 0 || (cautions?.length || 0) > 0;

    const handleShare = useCallback(async () => {
        let text = isKo ? `[ZestPair] ${score}점 영양제 분석 리포트 ✨\n\n` : `[ZestPair] Supplement Analysis Report: ${score} pts ✨\n\n`;
        insights.forEach((insight, idx) => {
            const meta = idx === 0 && hasWarning ? WARN_META : CARD_META[idx] || CARD_META[2];
            text += `📍 ${isKo ? meta.labelKo : meta.labelEn}\n${insight}\n\n`;
        });
        text += `${isKo ? '상세 결과 보기' : 'View Full Analysis'}: ${window.location.href}`;

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: 'ZestPair', text });
            } catch (err) { console.log(err); }
        } else if (typeof navigator !== 'undefined') {
            await navigator.clipboard.writeText(text);
            alert(isKo ? "클립보드에 복사되었습니다!" : "Copied to clipboard!");
        }
    }, [isKo, score, insights, hasWarning]);

    return (
        <div className={cn("relative space-y-6", className)}>
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
                        isHighEnd ? "bg-yellow-500/20 shadow-yellow-500/10" : "bg-emerald-500/20 shadow-emerald-500/10"
                    )}>
                        <Sparkles size={18} className={isHighEnd ? "text-yellow-400" : "text-emerald-400"} />
                    </div>
                    <div className="flex flex-col">
                        <h4 className={cn(
                            "text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em]",
                            isHighEnd ? "text-yellow-400" : "text-emerald-400"
                        )}>
                            {isKo ? "AI 프로토콜 리포트" : "AI PROTOCOL REPORT"}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-bold tracking-tight opacity-70">HYPER-PERSONALIZED ANALYSIS</span>
                    </div>
                </div>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 group"
                >
                    <Share2 size={14} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-wider">{isKo ? '공유' : 'SHARE'}</span>
                </button>
            </div>

            <div className="grid gap-3.5">
                {insights.map((insight, idx) => {
                    const isWarnCard = idx === 0 && hasWarning;
                    const meta = isWarnCard ? WARN_META : CARD_META[idx] || CARD_META[2];
                    const Icon = meta.icon;
                    const { headline, body } = extractHeadline(insight);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "group relative rounded-[2rem] border p-6 md:p-7 overflow-hidden transition-all duration-500",
                                "backdrop-blur-xl bg-opacity-40",
                                meta.bgClass,
                                meta.borderClass,
                                meta.glowClass,
                                "hover:scale-[1.01] hover:brightness-110 active:scale-[0.99]"
                            )}
                        >
                            <div className={cn(
                                "absolute left-0 top-6 bottom-6 w-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity",
                                meta.barColor
                            )} />
                            
                            <div className={cn(
                                "absolute -right-10 -top-10 w-32 h-32 blur-[60px] opacity-20 rounded-full transition-opacity group-hover:opacity-30",
                                meta.badgeBg
                            )} />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn("p-2 rounded-xl transition-colors", meta.badgeBg)}>
                                        <Icon size={14} className={meta.colorClass} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em]",
                                        meta.badgeText
                                    )}>
                                        {isKo ? meta.labelKo : meta.labelEn}
                                    </span>
                                </div>

                                <div className="space-y-3 text-left">
                                    <h5 className={cn(
                                        "text-[16px] md:text-[18px] font-black leading-[1.4] tracking-tight",
                                        isWarnCard ? "text-amber-100" : "text-white/95"
                                    )}>
                                        {highlightIngredients(headline, ingredientNames, meta.colorClass)}
                                    </h5>
                                    {body && body.length > 5 && body !== headline && (
                                        <p className="text-[14px] md:text-[15px] font-medium leading-[1.6] text-slate-400/90 tracking-tight">
                                            {highlightIngredients(body, ingredientNames, meta.colorClass)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                <div className="grid md:grid-cols-2 gap-4">
                    {result.recommendation_targets && result.recommendation_targets.length > 0 && (
                        <div className={cn(
                            "rounded-[2rem] border p-6 md:p-8 bg-amber-500/[0.02] border-amber-500/10 relative overflow-hidden group transition-all duration-500",
                            CARD_META[3].glowClass
                        )}>
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400/40 to-transparent" />
                             <div className="relative z-10 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-500/10">
                                        <Users size={16} className="text-amber-400" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400/80">
                                        {isKo ? '추천 복용 대상' : 'TARGETS'}
                                    </span>
                                </div>
                                <div className="grid gap-2.5">
                                    {result.recommendation_targets.map((target, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 transition-colors hover:bg-white/[0.05]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                                            <span className="text-[13px] md:text-[14px] font-bold text-slate-200 leading-tight">
                                                {target}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}

                    {result.lifestyle_guidelines && result.lifestyle_guidelines.length > 0 && (
                        <div className={cn(
                            "rounded-[2rem] border p-6 md:p-8 bg-orange-500/[0.02] border-orange-500/10 relative overflow-hidden group transition-all duration-500",
                            CARD_META[4].glowClass
                        )}>
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400/40 to-transparent" />
                            <div className="relative z-10 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-orange-500/10">
                                        <Coffee size={16} className="text-orange-400" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-400/80">
                                        {isKo ? '라이프스타일 시너지' : 'LIFESTYLE'}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {result.lifestyle_guidelines.slice(0, 2).map((tip, i) => (
                                        <div key={i} className="flex items-start gap-3 text-left">
                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                                            <p className="text-[13px] md:text-[14px] font-medium text-slate-300 leading-relaxed">
                                                {tip}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {result.expected_timeline && (
                    <div className={cn(
                        "rounded-[2.5rem] border p-7 md:p-10 bg-pink-500/[0.02] border-pink-500/10 relative overflow-hidden group transition-all duration-500",
                        CARD_META[5].glowClass
                    )}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400/40 to-transparent" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-pink-500/10">
                                    <Calendar size={16} className="text-pink-400" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-pink-400/80">
                                    {isKo ? '4주간의 변화 과정' : '4-WEEK JOURNEY'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                {[
                                    { w: 'Week 1', t: result.expected_timeline.week1, s: '초기 적응기' },
                                    { w: 'Week 2', t: result.expected_timeline.week2, s: '활성 가속기' },
                                    { w: 'Week 4', t: result.expected_timeline.week4, s: '체감 안정기' },
                                ].map((step, i) => (
                                    <div key={i} className="space-y-3 text-left group/item">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[12px] font-black uppercase tracking-widest text-pink-400">
                                                {step.w}
                                            </span>
                                            <span className="text-[10px] font-bold text-pink-400/40 uppercase tracking-tighter italic">
                                                {step.s}
                                            </span>
                                        </div>
                                        <p className="text-[14px] md:text-[15px] font-bold text-slate-200 leading-[1.6] tracking-tight">
                                            {step.t}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

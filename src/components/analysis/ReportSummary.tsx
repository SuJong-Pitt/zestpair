"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, ShieldCheck, Info, AlertTriangle, Zap, Layers, TrendingUp } from "lucide-react";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import { AnalysisResult } from "@/types/database";

interface ReportSummaryProps {
    result: AnalysisResult;
    className?: string;
}

// 카드별 메타데이터 (라벨, 아이콘, 색상)
const CARD_META = [
    {
        labelKo: "퍼포먼스 & 전략",
        labelEn: "Performance Strategy",
        icon: Zap,
        colorClass: "text-cyan-400",
        borderClass: "border-cyan-500/20",
        bgClass: "bg-cyan-500/[0.04]",
        badgeBg: "bg-cyan-500/10",
        badgeText: "text-cyan-400",
        glowClass: "from-cyan-500/10",
    },
    {
        labelKo: "시너지 메커니즘",
        labelEn: "Synergy Mechanism",
        icon: Layers,
        colorClass: "text-emerald-400",
        borderClass: "border-emerald-500/20",
        bgClass: "bg-emerald-500/[0.04]",
        badgeBg: "bg-emerald-500/10",
        badgeText: "text-emerald-400",
        glowClass: "from-emerald-500/10",
    },
    {
        labelKo: "장기 전략 & 기대 효과",
        labelEn: "Long-Term Strategy",
        icon: TrendingUp,
        colorClass: "text-violet-400",
        borderClass: "border-violet-500/20",
        bgClass: "bg-violet-500/[0.04]",
        badgeBg: "bg-violet-500/10",
        badgeText: "text-violet-400",
        glowClass: "from-violet-500/10",
    },
];

// 경고 상태일 때의 메타데이터
const WARN_META = {
    labelKo: "주의 사항",
    labelEn: "Caution",
    icon: AlertTriangle,
    colorClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/[0.05]",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    glowClass: "from-amber-500/10",
};

// 긴 문장에서 첫 번째 마침표 기준으로 헤드라인 추출
function extractHeadline(text: string): { headline: string; body: string } {
    const sentenceEnd = text.search(/[.。！?!]/);
    if (sentenceEnd > 0 && sentenceEnd < text.length - 1) {
        return {
            headline: text.slice(0, sentenceEnd + 1).trim(),
            body: text.slice(sentenceEnd + 1).trim(),
        };
    }
    // 짧은 문장이면 전체를 headline으로
    if (text.length < 60) {
        return { headline: text, body: "" };
    }
    // 문장이 길면 앞 40자까지를 헤드라인으로
    const cutAt = text.indexOf(" ", 35) > 0 ? text.indexOf(" ", 35) : 40;
    return {
        headline: text.slice(0, cutAt) + "...",
        body: text,
    };
}

// 성분 이름을 하이라이트하는 함수
function highlightIngredients(text: string, ingredientNames: string[], colorClass: string): React.ReactNode {
    if (!ingredientNames.length) return text;

    const escaped = ingredientNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = text.split(regex);

    return parts.map((part, i) =>
        ingredientNames.includes(part)
            ? <mark key={i} className={cn("bg-transparent font-black not-italic", colorClass)}>{part}</mark>
            : part
    );
}

export default function ReportSummary({ result, className }: ReportSummaryProps) {
    const { language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];
    const { score, ingredients, synergies, cautions, conflicts } = result;
    const isKo = language === 'ko';

    const ingredientNames = useMemo(() =>
        ingredients.map(i => isKo ? i.name : (i.name_en || i.name)),
        [ingredients, isKo]
    );

    const insights = useMemo(() => {
        if (result.ai_briefing && result.ai_briefing.length >= 3) {
            return result.ai_briefing.slice(0, 3);
        }

        let items: string[] = [];

        if (conflicts.length > 0) {
            const worstRes = conflicts[0];
            const nameA = isKo ? worstRes.pair[0].name : worstRes.pair[0].name_en;
            const nameB = isKo ? worstRes.pair[1].name : worstRes.pair[1].name_en;
            items.push(isKo
                ? `${nameA}와(과) ${nameB} 사이에 강한 간섭이 발견되어 복용 전 전문가 조언이 권장됩니다.`
                : `Strong interference between ${nameA} and ${nameB} requires professional advice.`);
        } else if (cautions.length > 0) {
            const worstRes = cautions[0];
            const nameA = isKo ? worstRes.pair[0].name : worstRes.pair[0].name_en;
            const nameB = isKo ? worstRes.pair[1].name : worstRes.pair[1].name_en;
            items.push(isKo
                ? `${nameA}와(과) ${nameB}의 흡수를 돕기 위해 최소 2시간 이상의 시간차를 두세요.`
                : `Take ${nameA} and ${nameB} at least 2 hours apart to optimize absorption.`);
        }

        const categories = ingredients.map(i => i.category);
        const hasVitamins = categories.includes('vitamins');
        const hasMinerals = categories.includes('minerals');
        const hasProbiotics = categories.includes('probiotics');
        const hasDrugs = categories.includes('drugs');

        if (synergies.length > 0 && score >= 80) {
            items.push(isKo
                ? "성분 간 흡수율을 극대화하는 최적의 배합으로 설계된 에센셜 리포트입니다."
                : "Optimized formulation confirmed, maximizing the absorption rate of key nutrients.");
        }

        if (hasVitamins && hasMinerals) {
            items.push(isKo
                ? "비타민과 미네랄의 조화로 기초 에너지 대사를 활성화하는 데 유리한 조합입니다."
                : "Vitamin-mineral balance detected, highly effective for activating basal metabolism.");
        } else if (hasProbiotics) {
            items.push(isKo
                ? "유산균 생존율을 고려한 조합으로, 장내 환경 개선에 집중된 리포트입니다."
                : "Focuses on probiotic survival, optimized for improving gut microbiome health.");
        }

        if (hasDrugs) {
            items.push(isKo
                ? "약물이 포함된 조합입니다. 간과 신장의 부담을 줄이기 위한 복용 가이드를 꼭 확인하세요."
                : "Combination includes drugs. Follow the guide to minimize burden on liver & kidneys.");
        } else {
            items.push(isKo
                ? "체내 안전성을 최우선으로 고려한 ZestPair AI 검증 완료 조합입니다."
                : "Verified by ZestPair AI with a priority on overall physiological safety.");
        }

        if (result.potentialSynergy && score < 100) {
            const partner = result.potentialSynergy.pair[1];
            const pName = isKo ? partner.name : partner.name_en;
            items.push(isKo
                ? `${pName}을(를) 추가하면 점수가 ${result.projectedScore || '보강'}점까지 상승할 수 있는 잠재력이 발견되었습니다.`
                : `Adding ${pName} could potentially boost your score to ${result.projectedScore || 'higher'} points.`);
        }

        while (items.length < 3) {
            items.push(isKo ? "전반적으로 안정적인 시너지가 확인되었습니다." : "Overall stable synergy confirmed.");
        }

        return items.slice(0, 3);
    }, [score, ingredients, synergies, cautions, conflicts, language, result.ai_briefing, isKo]);

    const isHighEnd = score >= 85;
    const hasWarning = conflicts.length > 0 || cautions.length > 0;

    const getPoriImage = () => {
        const interval = Math.round(score / 10) * 10;
        return `/images/share/pori-kakao-${interval}.png`;
    };

    return (
        <div className={cn("relative", className)}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-5 px-1">
                <div className={cn(
                    "p-1.5 rounded-lg",
                    isHighEnd ? "bg-yellow-500/10" : "bg-emerald-500/10"
                )}>
                    <Sparkles size={13} className={isHighEnd ? "text-yellow-400" : "text-emerald-400"} />
                </div>
                <h4 className={cn(
                    "text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em]",
                    isHighEnd ? "text-yellow-400" : "text-emerald-400"
                )}>
                    {isKo ? "사용자 맞춤 프로토콜 브리핑" : "Your Personal Protocol Briefing"}
                </h4>

                {/* Pori mini avatar */}
                <div className="ml-auto">
                    <div className={cn(
                        "w-8 h-8 rounded-xl overflow-hidden ring-1",
                        isHighEnd ? "ring-yellow-500/40" : "ring-emerald-500/30"
                    )}>
                        <img src={getPoriImage()} alt="Pori" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Intelligence Cards */}
            <div className="space-y-3">
                {insights.map((insight: string, idx: number) => {
                    const isWarnCard = idx === 0 && hasWarning;
                    const meta = isWarnCard ? WARN_META : CARD_META[idx] ?? CARD_META[2];
                    const IconComponent = meta.icon;
                    const { headline, body } = extractHeadline(insight);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.12, duration: 0.5 }}
                            className={cn(
                                "relative rounded-2xl border p-4 md:p-5 overflow-hidden transition-all duration-300 hover:brightness-110",
                                meta.bgClass,
                                meta.borderClass,
                            )}
                        >
                            {/* Subtle left accent bar */}
                            <div className={cn(
                                "absolute left-0 top-3 bottom-3 w-[3px] rounded-full",
                                isWarnCard ? "bg-amber-400/60" : (idx === 0 ? "bg-cyan-400/60" : idx === 1 ? "bg-emerald-400/60" : "bg-violet-400/60")
                            )} />

                            <div className="pl-3 md:pl-4 space-y-2">
                                {/* Label badge */}
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1 rounded-md", meta.badgeBg)}>
                                        <IconComponent size={11} className={meta.colorClass} />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]",
                                        meta.badgeText
                                    )}>
                                        {isKo ? meta.labelKo : meta.labelEn}
                                    </span>
                                </div>

                                {/* Headline */}
                                <p className={cn(
                                    "text-[13px] md:text-[15px] font-black leading-snug tracking-tight",
                                    isWarnCard ? "text-amber-100" : "text-white"
                                )}>
                                    {highlightIngredients(headline, ingredientNames, meta.colorClass)}
                                </p>

                                {/* Body (only if separate from headline) */}
                                {body && body.length > 10 && (
                                    <p className="text-[12px] md:text-[13px] font-medium leading-relaxed text-slate-400">
                                        {highlightIngredients(body, ingredientNames, meta.colorClass)}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer badges */}
            <div className="mt-4 pt-4 flex flex-wrap items-center gap-2 border-t border-white/5 opacity-70">
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md",
                    isHighEnd ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/5 border-white/10"
                )}>
                    <ShieldCheck size={10} className={isHighEnd ? "text-yellow-400" : "text-emerald-400"} />
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest",
                        isHighEnd ? "text-yellow-400/80" : "text-slate-400"
                    )}>
                        {isKo ? "ZESTPAIR BLACK LABEL AUTHENTICATED" : "BLACK LABEL AUTHENTICATED"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/30 border border-white/5">
                    <Info size={10} className="text-slate-600" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                        Precision Medical Mapping v2.5
                    </span>
                </div>
            </div>
        </div>
    );
}

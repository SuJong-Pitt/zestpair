"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, CheckCircle2, ShieldCheck, Info, AlertCircle } from "lucide-react";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import { AnalysisResult } from "@/types/database";

interface ReportSummaryProps {
    result: AnalysisResult;
    className?: string;
}

export default function ReportSummary({ result, className }: ReportSummaryProps) {
    const { language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];
    const { score, ingredients, synergies, cautions, conflicts } = result;
    const isKo = language === 'ko';

    const insights = useMemo(() => {
        // 0. AI Briefing Priority (Luxury Insight Core ✨)
        if (result.ai_briefing && result.ai_briefing.length >= 3) {
            return result.ai_briefing.slice(0, 3);
        }

        let items: string[] = [];
        const isKo = language === 'ko';
        
        // 1. Critical Conflict/Caution Insights (Priority 1)
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

        // 2. Synergy/Theme Insights (Priority 2)
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

        // 3. Timing/Safety Insights (Priority 3)
        if (hasDrugs) {
            items.push(isKo 
                ? "약물이 포함된 조합입니다. 간과 신장의 부담을 줄이기 위한 복용 가이드를 꼭 확인하세요."
                : "Combination includes drugs. Follow the guide to minimize burden on liver & kidneys.");
        } else {
            const dosageTimes = ingredients.map(i => i.dosage_time);
            const isMorningHeavy = dosageTimes.filter(t => t === 'morning' || t === 'before_meal').length > (ingredients.length / 2);
            if (isMorningHeavy) {
                items.push(isKo 
                    ? "오전 시간대 활동 에너지를 높이는 데 최적화된 복용 스케줄이 권장됩니다."
                    : "Recommended morning schedule optimized for boosting daily activity energy.");
            } else {
                items.push(isKo 
                    ? "체내 안전성을 최우선으로 고려한 포리 AI 검증 완료 조합입니다."
                    : "Verified by Pori AI with a priority on overall physiological safety.");
            }
        }

        // 4. Synergy Gap Insight (Conversion Hook 🔥)
        if (result.potentialSynergy && score < 100) {
            const partner = result.potentialSynergy.pair[1];
            const pName = isKo ? partner.name : partner.name_en;
            items.push(isKo 
                ? `현재 조합에서 ${pName}을(를) 추가하면 점수가 ${result.projectedScore || '보강'}점까지 상승할 수 있는 잠재력이 발견되었습니다.`
                : `Adding ${pName} could potentially boost your score to ${result.projectedScore || 'higher'} points.`);
        }

        if (items.length < 3) {
            const defaultInsights = score >= 70 
                ? [isKo ? "전반적으로 안정적인 시너지가 확인되었습니다." : "Overall stable synergy confirmed."]
                : [isKo ? "복용량과 시간을 조절하면 더 높은 효과를 볼 수 있습니다." : "Adjust dosage & timing for better results."];
            items = [...items, ...defaultInsights];
        }

        return items.slice(0, 3);
    }, [score, ingredients, synergies, cautions, conflicts, language, result.ai_briefing]);

    const getPoriImage = () => {
        const interval = Math.round(score / 10) * 10;
        return `/images/share/pori-kakao-${interval}.png`;
    };

    const isHighEnd = score >= 85;

    return (
        <div className={cn("relative group", className)}>
            {/* Ultra Luxury Background Glow */}
            <div className={cn(
                "absolute -inset-4 bg-gradient-to-r blur-3xl opacity-20 transition-opacity duration-1000 group-hover:opacity-30",
                isHighEnd ? "from-yellow-400/30 via-amber-500/30 to-orange-400/30" : "from-emerald-400/30 via-cyan-500/30 to-blue-400/30"
            )} />

            <div className={cn(
                "relative overflow-hidden rounded-[2.5rem] bg-slate-900/40 border backdrop-blur-3xl p-8 md:p-10 transition-all duration-700",
                isHighEnd ? "border-yellow-500/30 shadow-[inset_0_0_80px_rgba(251,191,36,0.05)]" : "border-white/10 shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]"
            )}>
                {/* Metallic Reflection Scan Effect */}
                <motion.div 
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 pointer-events-none"
                />
                
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center sm:items-start relative z-10">
                    
                    {/* Character HUD Zone */}
                    <div className="relative shrink-0">
                        {/* Orbit Animation */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className={cn(
                                "absolute -inset-3 rounded-full border border-dashed opacity-20",
                                isHighEnd ? "border-yellow-400" : "border-emerald-400"
                            )}
                        />

                        <div className={cn(
                            "relative w-[80px] h-[80px] md:w-28 md:h-28 rounded-3xl bg-slate-950 p-0.5 md:p-1 overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105",
                            isHighEnd ? "ring-2 ring-yellow-500/50" : "ring-1 ring-white/20"
                        )}>
                            <img 
                                src={getPoriImage()} 
                                alt="Pori" 
                                className="w-full h-full object-cover rounded-2xl [image-rendering:auto] sm:[image-rendering:-webkit-optimize-contrast]" 
                            />
                        </div>

                        {/* Status Pulse */}
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={cn(
                                "absolute -top-1 -right-1 w-3 h-3 rounded-full shadow-lg",
                                isHighEnd ? "bg-yellow-400 shadow-yellow-500/50" : "bg-emerald-400 shadow-emerald-500/50"
                            )} 
                        />
                    </div>

                    {/* Content Zone */}
                    <div className="flex-1 space-y-5 md:space-y-7 text-left w-full">
                        <div className="flex items-center gap-2 md:gap-3 px-1">
                            <div className={cn(
                                "p-1.5 rounded-lg",
                                isHighEnd ? "bg-yellow-500/10" : "bg-emerald-500/10"
                            )}>
                                <Sparkles size={14} className={isHighEnd ? "text-yellow-400" : "text-emerald-400"} />
                            </div>
                            <h4 className={cn(
                                "text-[10px] md:text-[12px] font-black uppercase tracking-[0.25em] md:tracking-[0.35em]",
                                isHighEnd ? "text-yellow-400" : "text-emerald-400"
                            )}>
                                {((t as any).analysis?.threeSecondInsight) || (isKo ? "럭셔리 에센셜 브리핑" : "Luxury Essential Briefing")}
                            </h4>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            {insights.map((insight: string, idx: number) => {
                                const isWarning = (idx === 0 && (conflicts.length > 0 || cautions.length > 0));
                                return (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.15, duration: 0.6 }}
                                        className="flex items-start gap-3 md:gap-6 group/item"
                                    >
                                        <div className={cn(
                                            "mt-1 flex items-center justify-center shrink-0 w-5 h-5 md:w-7 md:h-7 rounded-lg md:rounded-xl border transition-all duration-500 rotate-45 group-hover/item:rotate-90 shadow-sm",
                                            isWarning 
                                                ? (conflicts.length > 0 ? "bg-rose-500/20 border-rose-500/40 text-rose-400" : "bg-amber-500/20 border-amber-500/40 text-amber-400")
                                                : (isHighEnd ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400")
                                        )}>
                                            <div className="-rotate-45 group-hover/item:-rotate-90 transition-transform duration-500">
                                                {isWarning ? (
                                                    <AlertCircle size={12} className="stroke-[2.5]" />
                                                ) : (
                                                    <CheckCircle2 size={12} className="stroke-[2.5]" />
                                                )}
                                            </div>
                                        </div>
                                        <p className={cn(
                                            "flex-1 text-[14px] md:text-[17px] font-bold leading-relaxed transition-all duration-300",
                                            isWarning ? "text-rose-100 group-hover/item:text-rose-50" : (isHighEnd ? "text-yellow-50 group-hover/item:text-white" : "text-slate-100 group-hover/item:text-white")
                                        )}>
                                            {insight}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Ultra Premium Footer - Single Streamline Layout */}
                        <div className="pt-6 flex flex-wrap items-center gap-3 border-t border-white/5 opacity-80">
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md transition-colors",
                                isHighEnd ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/5 border-white/10"
                            )}>
                                <ShieldCheck size={11} className={isHighEnd ? "text-yellow-400" : "text-emerald-400"} />
                                <span className={cn(
                                    "text-[8px] md:text-[9px] font-black uppercase tracking-widest",
                                    isHighEnd ? "text-yellow-400/80" : "text-slate-400"
                                )}>
                                    {((t as any).analysis?.verifiedBy) || (isKo ? "ZESTPAIR BLACK LABEL AUTHENTICATED" : "BLACK LABEL AUTHENTICATED")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/30 border border-white/5">
                                <Info size={11} className="text-slate-600" />
                                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                    Precision Medical Mapping v2.5
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

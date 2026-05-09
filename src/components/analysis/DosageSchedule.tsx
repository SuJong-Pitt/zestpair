"use client";

import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import { Clock, Sun, Sunrise, SunMedium, Moon, Coffee, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import type { AnalysisResult, ScheduleSlot, ScheduleItem } from "@/types/database";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface DosageScheduleProps {
    result: AnalysisResult;
    language: "ko" | "en" | "ja" | "zh";
}

const TIME_CONFIG: Record<string, { icon: any, color: string, labels: Record<string, string> }> = {
    morning_before: { 
        icon: Sunrise, 
        color: "from-amber-400 to-orange-500", 
        labels: {
            ko: "아침 식전",
            en: "Morning (Empty)",
            ja: "朝食前",
            zh: "早餐前"
        }
    },
    morning_after: { 
        icon: Sun, 
        color: "from-orange-400 to-yellow-500", 
        labels: {
            ko: "아침 식후",
            en: "Morning (After Meal)",
            ja: "朝食後",
            zh: "早餐后"
        }
    },
    lunch_after: { 
        icon: SunMedium, 
        color: "from-yellow-400 to-emerald-500", 
        labels: {
            ko: "점심 식후",
            en: "Lunch (After Meal)",
            ja: "昼食後",
            zh: "午餐后"
        }
    },
    evening_after: { 
        icon: Moon, 
        color: "from-indigo-400 to-purple-600", 
        labels: {
            ko: "저녁 식후",
            en: "Evening (After Meal)",
            ja: "夕食後",
            zh: "晚餐后"
        }
    },
    night_before: { 
        icon: Coffee, 
        color: "from-slate-700 to-slate-900", 
        labels: {
            ko: "취침 전",
            en: "Before Sleep",
            ja: "就寝前",
            zh: "睡觉前"
        }
    },
    anytime: { 
        icon: Clock, 
        color: "from-emerald-400 to-teal-500", 
        labels: {
            ko: "편한 시간",
            en: "Anytime",
            ja: "いつでも",
            zh: "随时"
        }
    }
};

const renderIngredientIcon = (icon: string) => {
    const iconMap: Record<string, string> = {
        "sparkles": "✨",
        "droplet": "💧",
        "shield": "🛡️",
        "sun": "☀️",
        "moon": "🌙",
        "zap": "⚡",
        "brain": "🧠",
        "heart": "❤️"
    };
    return iconMap[icon] || icon;
};

const DosageSchedule = memo(function DosageSchedule({ result, language }: DosageScheduleProps) {
    const schedule = result.schedule || [];
    const isLoading = false; 
    const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['ko'];

    if (isLoading) {
        return (
            <div className="w-full p-12 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-[2.5rem] border border-white/10 animate-pulse">
                <Sparkles className="text-emerald-400 animate-spin" size={32} />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">AI Optimizing Schedule...</p>
            </div>
        );
    }

    if (schedule.length === 0) return null;

    return (
        <section id="dosage-schedule-section" className="space-y-8 py-10">
            <div className="flex flex-col items-center text-center gap-3">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                >
                    <Clock size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">{t.results.actionPlan}</span>
                </motion.div>
                <h3 className="text-2xl md:text-5xl font-[1000] text-white tracking-tighter">
                    {t.results.actionPlan}
                </h3>
                <p className="text-slate-400 text-xs md:text-lg font-medium max-w-xl break-keep">
                    {t.results.actionPlanSub}
                </p>
            </div>

            {/* AI Conflict Solution Advisory (Reassurance) ✨ */}
            {result.conflict_solution && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto px-4 mb-4"
                >
                    <div className="relative p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-2.5 rounded-2xl bg-indigo-500/20">
                                <AlertCircle size={20} className="text-indigo-400" />
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                    {language === 'ko' ? "AI 충돌 해결 리포트" : language === 'ja' ? "AI衝突解決レポート" : language === 'zh' ? "AI 冲突解决报告" : "AI Conflict Resolution"}
                                </h4>
                                <p className={cn(
                                    "text-[14px] md:text-[16px] font-bold text-indigo-100 leading-relaxed",
                                    (language === 'ja' || language === 'zh') ? "break-all" : "break-keep"
                                )}>
                                    {result.conflict_solution}
                                </p>
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sparkles size={120} className="text-indigo-400" />
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid gap-6 md:gap-8 max-w-4xl mx-auto px-2">
                    {schedule.map((slot, idx) => {
                        const config = TIME_CONFIG[slot.time_id] || TIME_CONFIG.anytime;
                        const Icon = config.icon;
                        
                        return (
                            <motion.div
                                key={slot.time_id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: idx * 0.08 }}
                                className="group relative flex flex-col md:flex-row gap-4 md:gap-8"
                            >
                                {/* Left: Time Marker */}
                                <div className={cn(
                                    "flex items-center md:flex-col md:items-end gap-3 md:pt-4 shrink-0",
                                    language === 'en' ? "md:w-44" : "md:w-32"
                                )}>
                                    <div className={cn(
                                        "w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center bg-gradient-to-br shadow-xl group-hover:scale-110 transition-transform duration-500",
                                        config.color
                                    )}>
                                        <Icon size={24} className="text-white drop-shadow-lg" />
                                    </div>
                                    <span className="text-lg md:text-xl font-black text-white whitespace-nowrap">
                                        {config.labels[language] || config.labels['en']}
                                    </span>
                                </div>

                                {/* Right: Card Content */}
                                <div className="flex-1 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                    {/* AI Insight Header */}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Sparkles size={10} className="text-emerald-400" />
                                        </div>
                                        <p className={cn(
                                            "text-emerald-100/90 text-sm md:text-base font-bold leading-relaxed",
                                            (language === 'ja' || language === 'zh') ? "break-all" : "break-keep"
                                        )}>
                                            {slot.ai_insight}
                                        </p>
                                    </div>

                                    {/* Items List */}
                                    <div className="flex flex-wrap gap-3">
                                        {slot.items.map((item, itemIdx) => (
                                            <div 
                                                key={item.ingredient_id}
                                                className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-2xl">{renderIngredientIcon(item.icon)}</span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white">{item.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.note}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Glass Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                            </motion.div>
                        );
                    })}
                </div>
        </section>
    );
});

export default DosageSchedule;

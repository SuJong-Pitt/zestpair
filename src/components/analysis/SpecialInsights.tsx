"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
    Utensils, 
    ShieldAlert, 
    Sparkles, 
    ChevronRight,
    Apple,
    Info
} from 'lucide-react';
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/database";

interface SpecialInsightsProps {
    result: AnalysisResult;
    language: "ko" | "en" | "ja" | "zh";
}

const SpecialInsights = memo(function SpecialInsights({ result, language }: SpecialInsightsProps) {
    const isKo = language === 'ko';
    const { meal_pairing, medication_safety } = result;

    if (!meal_pairing?.length && !medication_safety) return null;

    return (
        <section className="space-y-8 py-10">
            <div className="flex flex-col items-center text-center gap-3">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                >
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                        {language === 'ko' ? "AI 스페셜 가이드" : language === 'ja' ? "AIスペシャルガイド" : language === 'zh' ? "AI特别指南" : "AI SPECIAL GUIDE"}
                    </span>
                </motion.div>
                <h3 className="text-2xl md:text-5xl font-[1000] text-white tracking-tighter">
                    {language === 'ko' ? "더 완벽한 섭취를 위한 팁" : language === 'ja' ? "より完璧な摂取のためのヒント" : language === 'zh' ? "更完美摄入的提示" : "Tips for Perfect Intake"}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-2">
                {/* AI Meal Pairing Section ✨ */}
                {meal_pairing && meal_pairing.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group relative rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 p-6 md:p-8 space-y-6 hover:bg-emerald-500/[0.05] hover:border-emerald-500/30 transition-all duration-500 overflow-hidden"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                                <Utensils size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                                    {language === 'ko' ? "추천 식단 궁합" : language === 'ja' ? "おすすめの食事との相性" : language === 'zh' ? "推荐饮食搭配" : "Meal Pairing"}
                                </span>
                                <h4 className="text-lg md:text-xl font-black text-white">
                                    {language === 'ko' ? "AI 식단 매칭" : language === 'ja' ? "AI食事マッチング" : language === 'zh' ? "AI饮食搭配" : "AI Meal Guide"}
                                </h4>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {meal_pairing.map((meal, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 5 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <p className={cn(
                                        "text-[14px] md:text-[15px] font-bold text-slate-200 leading-tight",
                                        (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                                    )}>
                                        {meal}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Background Decoration */}
                        <Apple className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                    </motion.div>
                )}

                {/* AI Medication Safety Section ✨ */}
                {medication_safety && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={cn(
                            "group relative rounded-[2.5rem] border p-6 md:p-8 space-y-6 transition-all duration-500 overflow-hidden",
                            result.ingredients.some(i => i.category === 'drugs')
                                ? "bg-rose-500/[0.03] border-rose-500/20 hover:bg-rose-500/[0.05] hover:border-rose-500/40"
                                : "bg-indigo-500/[0.03] border-indigo-500/10 hover:bg-indigo-500/[0.05] hover:border-indigo-500/30"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-3 rounded-2xl",
                                result.ingredients.some(i => i.category === 'drugs')
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-indigo-500/10 text-indigo-400"
                            )}>
                                <ShieldAlert size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-[11px] font-black uppercase tracking-widest",
                                    result.ingredients.some(i => i.category === 'drugs') ? "text-rose-400" : "text-indigo-400"
                                )}>
                                    {language === 'ko' ? "약물 안전 가이드" : language === 'ja' ? "薬物安全ガイド" : language === 'zh' ? "药物安全指南" : "Safety Check"}
                                </span>
                                <h4 className="text-lg md:text-xl font-black text-white">
                                    {language === 'ko' ? "의약품 안전성" : language === 'ja' ? "医薬品の安全性" : language === 'zh' ? "药品安全性" : "Medication Safety"}
                                </h4>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className={cn(
                                "p-5 rounded-2xl border leading-relaxed",
                                (language === 'ja' || language === 'zh') ? "break-all" : "break-keep",
                                result.ingredients.some(i => i.category === 'drugs')
                                    ? "bg-rose-500/5 border-rose-500/10 text-rose-100/90"
                                    : "bg-indigo-500/5 border-indigo-500/10 text-indigo-100/90"
                            )}>
                                <p className="text-[14px] md:text-[16px] font-bold">
                                    {medication_safety}
                                </p>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <ShieldAlert className={cn(
                            "absolute -right-6 -bottom-6 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform duration-700 opacity-5",
                            result.ingredients.some(i => i.category === 'drugs') ? "text-rose-500" : "text-indigo-500"
                        )} />
                    </motion.div>
                )}
            </div>
        </section>
    );
});

export default SpecialInsights;

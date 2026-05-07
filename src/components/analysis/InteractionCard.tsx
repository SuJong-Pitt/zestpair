"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { I18nContent } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NoInteractionCardProps {
    language: string;
    t: I18nContent;
}

const NoInteractionCard = memo(function NoInteractionCard({ language, t }: NoInteractionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[2.5rem] w-full mx-auto group overflow-hidden"
            style={{
                background: "linear-gradient(145deg, rgba(4,20,16,0.97) 0%, rgba(4,12,24,0.97) 100%)",
                border: "1px solid rgba(52,211,153,0.2)",
                boxShadow: "0 0 0 1px rgba(52,211,153,0.05) inset, 0 40px 80px rgba(0,0,0,0.5)"
            }}
        >
            {/* Background Animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.25, 0.12] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(52,211,153,0.3) 0%, transparent 65%)" }}
                />
                <motion.div
                    animate={{ y: ["-100%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    className="absolute inset-x-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)" }}
                />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 p-6 sm:p-8 md:p-12">
                {/* Holographic Shield Icon */}
                <div className="shrink-0 flex items-center justify-center">
                    <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/20" />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full"
                            style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(52,211,153,0.35) 25deg, transparent 50deg)" }}
                        />
                        <div className="relative w-12 h-12 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[1.6rem] flex items-center justify-center bg-slate-900 border border-emerald-400/40 shadow-xl">
                            <ShieldCheck size={32} className="text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 md:gap-4 text-center md:text-left flex-1 min-w-0">
                    <div className="inline-flex items-center gap-2 self-center md:self-start">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #34d399" }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                            {language === 'ko' ? "보안 상태 — 검증됨" : language === 'ja' ? "セキュリティステータス — 検証済み" : language === 'zh' ? "安全状态 — 已验证" : "Security Status — Verified"}
                        </span>
                    </div>

                    <h4 className={cn(
                        "text-xl md:text-3xl font-[1000] tracking-tighter leading-[1.1] text-white",
                        (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                    )}>
                        {t.results.noInteraction}
                    </h4>

                    <p className="text-xs md:text-sm leading-relaxed text-slate-400 max-w-xs md:max-w-sm">
                        {t.results.noInteractionBody}
                    </p>

                    <div className="flex flex-row flex-wrap gap-2.5 justify-center md:justify-start pt-1">
                        {[
                            { label: language === 'ko' ? "위험 제로" : language === 'ja' ? "リスクゼロ" : language === 'zh' ? "零风险" : "Zero Risk", icon: "🛡️", color: "#34d399" },
                            { label: language === 'ko' ? "생체 안전" : language === 'ja' ? "バイオセーフ" : language === 'zh' ? "生物安全" : "Bio-Safe", icon: "🧬", color: "#818cf8" },
                            { label: language === 'ko' ? "100% 시너지" : language === 'ja' ? "100%シナジー" : language === 'zh' ? "100%协同" : "100% Synergy", icon: "⚡", color: "#fbbf24" },
                        ].map((badge, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/20 bg-black/40 text-[10px] font-black text-white/80 uppercase tracking-widest"
                            >
                                <span>{badge.icon}</span>
                                <span style={{ color: badge.color }}>{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default NoInteractionCard;

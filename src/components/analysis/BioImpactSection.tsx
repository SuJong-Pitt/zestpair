"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Accessibility, Info, ChevronDown, Shield, Sparkles, Moon, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BioImpactSectionProps {
    metrics: {
        focus: number;
        vitality: number;
        shield: number;
        beauty: number;
        calm: number;
        metabolism: number;
    };
    mechanism?: string | null;
    language: "ko" | "en";
}

export default function BioImpactSection({ metrics, mechanism, language }: BioImpactSectionProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const isKo = language === 'ko';

    // Radar Chart Logic
    const size = 260;
    const center = size / 2;
    const radius = size * 0.35;
    
    const categories = [
        { key: 'focus', label: isKo ? '정신/집중' : 'FOCUS', icon: Brain, color: 'text-indigo-400' },
        { key: 'vitality', label: isKo ? '신체/활력' : 'VITALITY', icon: Zap, color: 'text-orange-400' },
        { key: 'shield', label: isKo ? '면역/보호' : 'SHIELD', icon: Shield, color: 'text-emerald-400' },
        { key: 'beauty', label: isKo ? '항노화/미용' : 'BEAUTY', icon: Sparkles, color: 'text-pink-400' },
        { key: 'calm', label: isKo ? '스트레스/수면' : 'CALM', icon: Moon, color: 'text-violet-400' },
        { key: 'metabolism', label: isKo ? '대사/소화' : 'METABOLIC', icon: Accessibility, color: 'text-blue-400' },
    ];

    const getPoint = (index: number, value: number, max: number = 100) => {
        const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
        const r = (radius * value) / max;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    const radarPath = categories
        .map((cat, i) => {
            const p = getPoint(i, metrics[cat.key as keyof typeof metrics]);
            return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
        })
        .join(' ') + ' Z';

    const gridLevels = [0.25, 0.5, 0.75, 1];

    return (
        <div className="space-y-4">
            {/* 🕸️ 6-Dimensional Radar Chart Section */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 md:p-8 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-emerald-500/[0.03] pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Zap size={16} className="text-indigo-400" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400/80">
                                {isKo ? '6대 바이오 임팩트 분석' : '6D BIO-IMPACT METRICS'}
                            </span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {isKo ? 'AI 정밀 데이터' : 'AI PRECISION DATA'}
                            </span>
                        </div>
                    </div>

                    {/* Radar Chart Visual */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                            <svg width={size} height={size} className="overflow-visible">
                                {/* Grid Lines */}
                                {gridLevels.map((level) => (
                                    <polygon
                                        key={level}
                                        points={categories.map((_, i) => {
                                            const p = getPoint(i, level * 100);
                                            return `${p.x},${p.y}`;
                                        }).join(' ')}
                                        className="fill-none stroke-white/5 stroke-[0.5]"
                                    />
                                ))}
                                
                                {/* Axis Lines */}
                                {categories.map((_, i) => {
                                    const p = getPoint(i, 100);
                                    return (
                                        <line
                                            key={i}
                                            x1={center}
                                            y1={center}
                                            x2={p.x}
                                            y2={p.y}
                                            className="stroke-white/5 stroke-[0.5]"
                                        />
                                    );
                                })}

                                {/* Data Area */}
                                <motion.path
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    d={radarPath}
                                    className="fill-indigo-500/20 stroke-indigo-400 stroke-[2] drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                                />

                                {/* Data Points */}
                                {categories.map((cat, i) => {
                                    const p = getPoint(i, metrics[cat.key as keyof typeof metrics]);
                                    return (
                                        <motion.circle
                                            key={i}
                                            initial={{ r: 0 }}
                                            animate={{ r: 3 }}
                                            transition={{ delay: 1 + i * 0.1 }}
                                            cx={p.x}
                                            cy={p.y}
                                            className="fill-indigo-400"
                                        />
                                    );
                                })}
                            </svg>

                            {/* Floating Labels with Icons */}
                            {categories.map((cat, i) => {
                                const labelAngle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
                                const distance = radius + 42;
                                const lx = center + distance * Math.cos(labelAngle);
                                const ly = center + distance * Math.sin(labelAngle);
                                const Icon = cat.icon;
                                const val = metrics[cat.key as keyof typeof metrics];

                                return (
                                    <motion.div 
                                        key={cat.key} 
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.5 + i * 0.1 }}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                                        style={{ left: lx, top: ly }}
                                    >
                                        <div className={cn("p-1.5 rounded-lg bg-slate-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl", cat.color)}>
                                            <Icon size={12} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-300 whitespace-nowrap tracking-tighter drop-shadow-md">
                                            {cat.label}
                                        </span>
                                        <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                                            <span className={cn("text-[10px] font-black leading-none", cat.color)}>
                                                {val}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Stats Row */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                        <div className="flex flex-col items-center p-2 rounded-2xl bg-white/[0.02]">
                            <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">{isKo ? '평균 지수' : 'AVG INDEX'}</span>
                            <span className="text-sm font-black text-white">
                                {Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / 6)}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-2xl bg-white/[0.02]">
                            <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">{isKo ? '최고 강점' : 'PEAK STRENGTH'}</span>
                            <span className="text-sm font-black text-emerald-400">
                                {categories.reduce((a, b) => metrics[a.key as keyof typeof metrics] > metrics[b.key as keyof typeof metrics] ? a : b).label}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-2xl bg-white/[0.02]">
                            <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">{isKo ? '분석 신뢰도' : 'CONFIDENCE'}</span>
                            <span className="text-sm font-black text-indigo-400">98%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔬 Scientific Mechanism (Accordion) */}
            {mechanism && (
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full px-6 py-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <Info size={14} className="text-violet-400" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-400/80">
                                {isKo ? '과학적 기전 심층 분석' : 'SCIENTIFIC MECHANISM'}
                            </span>
                        </div>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-slate-500 group-hover:text-white"
                        >
                            <ChevronDown size={18} />
                        </motion.div>
                    </button>
                    
                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="text-[13px] md:text-[14px] font-medium leading-relaxed text-slate-300 text-left">
                                    {mechanism}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                                    <span className="text-[9px] font-bold text-violet-400/50 uppercase tracking-widest font-mono">
                                        CELLULAR PROTOCOL ACTIVE
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

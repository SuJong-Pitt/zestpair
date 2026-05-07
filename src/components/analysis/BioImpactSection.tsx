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
    language: "ko" | "en" | "ja" | "zh";
}

export default function BioImpactSection({ metrics, mechanism, language }: BioImpactSectionProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const isKo = language === 'ko';

    // SVG coordinate space — labels are also drawn inside the SVG via foreignObject
    // so there's zero coordinate mismatch regardless of rendered size.
    const VB = 400;            // viewBox dimension
    const center = VB / 2;    // 200
    const radius = VB * 0.27; // ~108 — radar polygon radius

    const categories = [
        { key: 'focus',      label: language === 'ko' ? '정신/집중'     : language === 'ja' ? '精神/集中' : language === 'zh' ? '精神/集中' : 'FOCUS',     icon: Brain,        color: '#818cf8', bg: 'rgba(129,140,248,0.18)', colorClass: 'text-indigo-400' },
        { key: 'vitality',   label: language === 'ko' ? '신체/활력'     : language === 'ja' ? '身体/活力' : language === 'zh' ? '身体/活力' : 'VITALITY',  icon: Zap,          color: '#fb923c', bg: 'rgba(251,146,60,0.18)',  colorClass: 'text-orange-400' },
        { key: 'shield',     label: language === 'ko' ? '면역/보호'     : language === 'ja' ? '免疫/保護' : language === 'zh' ? '免疫/保护' : 'SHIELD',    icon: Shield,       color: '#34d399', bg: 'rgba(52,211,153,0.18)',  colorClass: 'text-emerald-400' },
        { key: 'beauty',     label: language === 'ko' ? '항노화/미용'   : language === 'ja' ? '美容/抗加齢' : language === 'zh' ? '美容/抗衰老' : 'BEAUTY',    icon: Sparkles,     color: '#f472b6', bg: 'rgba(244,114,182,0.18)', colorClass: 'text-pink-400' },
        { key: 'calm',       label: language === 'ko' ? '스트레스/수면' : language === 'ja' ? '睡眠/ストレス' : language === 'zh' ? '睡眠/压力' : 'CALM',      icon: Moon,         color: '#c084fc', bg: 'rgba(192,132,252,0.18)', colorClass: 'text-violet-400' },
        { key: 'metabolism', label: language === 'ko' ? '대사/소화'     : language === 'ja' ? '代謝/消化' : language === 'zh' ? '代谢/消化' : 'METABOLIC', icon: Accessibility, color: '#60a5fa', bg: 'rgba(96,165,250,0.18)',  colorClass: 'text-blue-400' },
    ];

    const getPoint = (index: number, value: number, max = 100) => {
        const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
        const r = (radius * value) / max;
        return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };

    const radarPath = categories
        .map((cat, i) => {
            const p = getPoint(i, metrics[cat.key as keyof typeof metrics]);
            return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
        })
        .join(' ') + ' Z';

    const gridLevels = [0.25, 0.5, 0.75, 1];
    const avgScore = Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / 6);
    const peakCategory = categories.reduce((a, b) =>
        metrics[a.key as keyof typeof metrics] > metrics[b.key as keyof typeof metrics] ? a : b
    );

    // Label box dimensions in SVG coordinate space
    const BOX_W = 96;
    const BOX_H = 60;
    const LABEL_DIST = radius + 66; // distance from center to label center

    return (
        <div className="space-y-3">
            {/* Main Bio-Impact Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/8"
                style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(8,12,30,0.98) 100%)',
                    boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)'
                }}
            >
                {/* Ambient gradient blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-10"
                        style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-10"
                        style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />
                </div>

                <div className="relative z-10 p-6 md:p-8">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(52,211,153,0.2))', border: '1px solid rgba(129,140,248,0.3)' }}>
                                <Zap size={14} className="text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] md:text-[13px] font-black uppercase tracking-[0.06em] md:tracking-[0.2em] text-indigo-400/90 whitespace-nowrap">
                                    {language === 'ko' ? '6대 바이오 임팩트 분석' : language === 'ja' ? '6大バイオインパクト分析' : language === 'zh' ? '6大生物影响分析' : '6D BIO-IMPACT'}
                                </p>
                                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-wide mt-0.5 whitespace-nowrap">
                                    {language === 'ko' ? "개인 맞춤형 · AI 연산" : language === 'ja' ? "パーソナライズ · AI演算" : language === 'zh' ? "个性化 · AI计算" : "HYPER-PERSONALIZED · AI COMPUTED"}
                                </p>
                            </div>
                        </div>
                        {/* 모바일에서는 배지 숨김 — 공간 확보 */}
                        <div className="hidden md:flex flex-shrink-0 px-2.5 py-1.5 rounded-full border"
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap">
                                {language === 'ko' ? 'AI 정밀 데이터' : language === 'ja' ? 'AI精密データ' : language === 'zh' ? 'AI精密数据' : 'AI PRECISION DATA'}
                            </span>
                        </div>
                    </div>

                    {/* ─── Radar Chart ─── 
                        Using viewBox so the SVG scales to its container.
                        All labels are foreignObject children of the SVG,
                        guaranteeing pixel-perfect alignment at any width. */}
                    <div className="flex justify-center py-2">
                        <svg
                            viewBox={`0 0 ${VB} ${VB}`}
                            width="100%"
                            style={{ maxWidth: 360, display: 'block', overflow: 'visible' }}
                        >
                            <defs>
                                <radialGradient id="bioRadarFill" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.38" />
                                    <stop offset="55%"  stopColor="#60a5fa" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.08" />
                                </radialGradient>
                                <filter id="bioGlow" x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="5" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>

                            {/* Outer hint ring */}
                            <circle cx={center} cy={center} r={radius + 16}
                                fill="none" stroke="rgba(129,140,248,0.06)" strokeWidth="1" />

                            {/* Grid polygons */}
                            {gridLevels.map((level, li) => (
                                <polygon
                                    key={level}
                                    points={categories.map((_, i) => {
                                        const p = getPoint(i, level * 100);
                                        return `${p.x},${p.y}`;
                                    }).join(' ')}
                                    fill={li === 3 ? 'rgba(129,140,248,0.03)' : 'none'}
                                    stroke={li === 3 ? 'rgba(129,140,248,0.14)' : 'rgba(255,255,255,0.04)'}
                                    strokeWidth={li === 3 ? 1 : 0.5}
                                />
                            ))}

                            {/* Axis lines */}
                            {categories.map((cat, i) => {
                                const p = getPoint(i, 100);
                                return (
                                    <line key={i}
                                        x1={center} y1={center} x2={p.x} y2={p.y}
                                        stroke={cat.color} strokeWidth="0.6" strokeOpacity="0.18"
                                    />
                                );
                            })}

                            {/* Glow data area */}
                            <motion.path
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ duration: 1.8 }}
                                d={radarPath} fill="none"
                                stroke="rgba(129,140,248,0.55)" strokeWidth="7"
                                style={{ filter: 'blur(9px)' }}
                            />

                            {/* Main fill */}
                            <motion.path
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ duration: 1.8 }}
                                d={radarPath}
                                fill="url(#bioRadarFill)"
                                stroke="none"
                                filter="url(#bioGlow)"
                            />

                            {/* Stroke */}
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2.2, ease: 'easeOut' }}
                                d={radarPath} fill="none"
                                stroke="#818cf8" strokeWidth="1.8"
                                style={{ filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.85))' }}
                            />

                            {/* Data-point dots */}
                            {categories.map((cat, i) => {
                                const p = getPoint(i, metrics[cat.key as keyof typeof metrics]);
                                return (
                                    <g key={cat.key} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
                                        <motion.circle
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 0.25 }}
                                            transition={{ delay: 1.4 + i * 0.1 }}
                                            cx={p.x} cy={p.y} r={8} fill={cat.color}
                                            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                                        />
                                        <motion.circle
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            transition={{ delay: 1.4 + i * 0.1, type: 'spring', stiffness: 220 }}
                                            cx={p.x} cy={p.y} r={4} fill="white"
                                            style={{ filter: `drop-shadow(0 0 5px ${cat.color})`, transformOrigin: `${p.x}px ${p.y}px` }}
                                        />
                                        <motion.circle
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            transition={{ delay: 1.5 + i * 0.1 }}
                                            cx={p.x} cy={p.y} r={2} fill={cat.color}
                                            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                                        />
                                    </g>
                                );
                            })}

                            {/* ─── Labels via foreignObject — coordinate-perfect ─── */}
                            {categories.map((cat, i) => {
                                const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
                                const lx = center + LABEL_DIST * Math.cos(angle);
                                const ly = center + LABEL_DIST * Math.sin(angle);
                                const val = metrics[cat.key as keyof typeof metrics];
                                const isHigh = val >= 80;

                                return (
                                    <motion.g
                                        key={cat.key}
                                        initial={{ opacity: 0, scale: 0.4 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.7 + i * 0.09, type: 'spring', stiffness: 180 }}
                                        style={{ transformOrigin: `${lx}px ${ly}px` }}
                                    >
                                        <foreignObject
                                            x={lx - BOX_W / 2}
                                            y={ly - BOX_H / 2}
                                            width={BOX_W}
                                            height={BOX_H}
                                            style={{ overflow: 'visible' }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '1px',
                                                padding: '4px 6px',
                                                borderRadius: '10px',
                                                background: `linear-gradient(135deg, ${cat.bg}, rgba(2,6,18,0.88))`,
                                                border: `1px solid ${cat.color}38`,
                                                boxShadow: isHigh
                                                    ? `0 4px 18px -4px ${cat.color}60, inset 0 1px 0 ${cat.color}20`
                                                    : '0 2px 10px rgba(0,0,0,0.5)',
                                                backdropFilter: 'blur(14px)',
                                                width: '100%',
                                                height: '100%',
                                                boxSizing: 'border-box'
                                            }}>
                                                <span style={{ fontSize: 9, fontWeight: 900, color: '#94a3b8', letterSpacing: '0.04em', wordBreak: 'break-all', textAlign: 'center', lineHeight: 1.1 }}>
                                                    {cat.label}
                                                </span>
                                                <span style={{
                                                    fontSize: 22,
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: cat.color,
                                                    textShadow: isHigh ? `0 0 10px ${cat.color}` : 'none',
                                                }}>
                                                    {val}
                                                </span>
                                            </div>
                                        </foreignObject>
                                    </motion.g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-4"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { label: language === 'ko' ? '평균 지수' : language === 'ja' ? '平均指数' : language === 'zh' ? '平均指数' : 'AVG INDEX', value: String(avgScore), colorClass: 'text-white', sub: 'OVERALL' },
                            { label: language === 'ko' ? '최고 강점' : language === 'ja' ? '最高強み' : language === 'zh' ? '最高强项' : 'PEAK', value: peakCategory.label, colorClass: peakCategory.colorClass, sub: 'STRENGTH' },
                            { label: language === 'ko' ? '분석 신뢰도' : language === 'ja' ? '分析信頼度' : language === 'zh' ? '分析信誉' : 'CONFIDENCE', value: '98%', colorClass: 'text-indigo-400', sub: 'AI SCORE' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.9 + i * 0.1 }}
                                className="flex flex-col items-center p-3 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                    {stat.label}
                                </span>
                                <span className={cn("text-base md:text-lg font-black leading-none", stat.colorClass)}>
                                    {stat.value}
                                </span>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-600 mt-1 tracking-widest">
                                    {stat.sub}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scientific Mechanism Accordion */}
            {mechanism && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="overflow-hidden rounded-[2rem] border"
                    style={{
                        background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,12,30,0.95))',
                        borderColor: 'rgba(192,132,252,0.15)',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                    }}
                >
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full px-6 py-4 flex items-center justify-between transition-colors"
                        style={{ background: isExpanded ? 'rgba(192,132,252,0.04)' : 'transparent' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.2)' }}>
                                <Info size={13} className="text-violet-400" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-400/80">
                                {language === 'ko' ? '과학적 기전 심층 분석' : language === 'ja' ? '科学的メカニズムの深層分析' : language === 'zh' ? '科学机制深层分析' : 'SCIENTIFIC MECHANISM'}
                            </span>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-violet-500/50">
                            <ChevronDown size={16} />
                        </motion.div>
                    </button>

                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2">
                            <div className="p-4 rounded-2xl"
                                style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.1)' }}>
                                <p className={cn(
                                    "text-[13px] md:text-[14px] font-medium leading-relaxed text-slate-300 text-left",
                                    (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                                )}>
                                    {mechanism}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-1.5 h-1.5 rounded-full bg-violet-400"
                                    />
                                    <span className="text-[9px] font-black text-violet-400/40 uppercase tracking-widest font-mono">
                                        {language === 'ko' ? "세포 프로토콜 활성화" : language === 'ja' ? "細胞プロトコル活性化" : language === 'zh' ? "细胞协议已激活" : "CELLULAR PROTOCOL ACTIVE"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

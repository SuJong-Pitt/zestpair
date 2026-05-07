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
import BioImpactSection from "./BioImpactSection";

interface ReportSummaryProps {
    result: AnalysisResult;
    className?: string;
}

const CARD_META = [
    {
        label: { ko: "퍼포먼스 & 전략", en: "Performance Strategy", ja: "パフォーマンス＆戦略", zh: "表现与策略" },
        icon: Zap,
        color: '#22d3ee',
        borderColor: 'rgba(34,211,238,0.2)',
        bgGrad: 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(34,211,238,0.02))',
        glowColor: 'rgba(34,211,238,0.15)',
        barColor: 'linear-gradient(180deg, #22d3ee, #0ea5e9)',
        colorClass: "text-cyan-400",
        badgeText: "text-cyan-400",
    },
    {
        label: { ko: "시너지 메커니즘", en: "Synergy Mechanism", ja: "相乗効果メカニズム", zh: "协同机制" },
        icon: Layers,
        color: '#34d399',
        borderColor: 'rgba(52,211,153,0.2)',
        bgGrad: 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))',
        glowColor: 'rgba(52,211,153,0.15)',
        barColor: 'linear-gradient(180deg, #34d399, #10b981)',
        colorClass: "text-emerald-400",
        badgeText: "text-emerald-400",
    },
    {
        label: { ko: "장기 전략 & 기대 효과", en: "Long-Term Strategy", ja: "長期戦略と期待効果", zh: "长期策略与预期效果" },
        icon: TrendingUp,
        color: '#a78bfa',
        borderColor: 'rgba(167,139,250,0.2)',
        bgGrad: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(167,139,250,0.02))',
        glowColor: 'rgba(167,139,250,0.15)',
        barColor: 'linear-gradient(180deg, #a78bfa, #7c3aed)',
        colorClass: "text-violet-400",
        badgeText: "text-violet-400",
    },
    {
        label: { ko: "추천 복용 대상", en: "Recommended For", ja: "おすすめの服用対象", zh: "推荐服用对象" },
        icon: Users,
        color: '#fbbf24',
        borderColor: 'rgba(251,191,36,0.2)',
        bgGrad: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.02))',
        glowColor: 'rgba(251,191,36,0.15)',
        barColor: 'linear-gradient(180deg, #fbbf24, #f59e0b)',
        colorClass: "text-amber-400",
        badgeText: "text-amber-400",
    },
    {
        label: { ko: "생활 습관 시너지", en: "Lifestyle Synergy", ja: "生活習慣シナジー", zh: "生活方式协同" },
        icon: Coffee,
        color: '#fb923c',
        borderColor: 'rgba(251,146,60,0.2)',
        bgGrad: 'linear-gradient(135deg, rgba(251,146,60,0.06), rgba(251,146,60,0.02))',
        glowColor: 'rgba(251,146,60,0.15)',
        barColor: 'linear-gradient(180deg, #fb923c, #ea580c)',
        colorClass: "text-orange-400",
        badgeText: "text-orange-400",
    },
    {
        label: { ko: "4주 기대 효과 타임라인", en: "4-Week Journey", ja: "4週間の期待効果タイムライン", zh: "4周预期效果时间线" },
        icon: Calendar,
        color: '#f472b6',
        borderColor: 'rgba(244,114,182,0.2)',
        bgGrad: 'linear-gradient(135deg, rgba(244,114,182,0.06), rgba(244,114,182,0.02))',
        glowColor: 'rgba(244,114,182,0.15)',
        barColor: 'linear-gradient(180deg, #f472b6, #db2777)',
        colorClass: "text-pink-400",
        badgeText: "text-pink-400",
    },
];

const WARN_META = {
    label: { ko: "주의 사항", en: "Caution", ja: "注意事項", zh: "注意事项" },
    icon: AlertTriangle,
    color: '#fbbf24',
    borderColor: 'rgba(251,191,36,0.25)',
    bgGrad: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))',
    glowColor: 'rgba(251,191,36,0.2)',
    barColor: 'linear-gradient(180deg, #fbbf24, #f59e0b)',
    colorClass: "text-amber-400",
    badgeText: "text-amber-400",
};

function extractHeadline(text: string): { headline: string; body: string } {
    const sentenceEnd = text.search(/[.。！?!]/);
    if (sentenceEnd > 0 && sentenceEnd < 100) {
        const headline = text.slice(0, sentenceEnd + 1).trim();
        const body = text.slice(sentenceEnd + 1).trim();
        return { headline, body };
    }
    if (text.length <= 60) return { headline: text, body: "" };
    const cutAt = text.indexOf(" ", 45) > 0 ? text.indexOf(" ", 45) : 50;
    return { headline: text.slice(0, cutAt).trim() + "...", body: text };
}

function highlightIngredients(text: string, ingredientNames: string[], color: string): React.ReactNode {
    if (!ingredientNames || !ingredientNames.length) return text;
    const escaped = ingredientNames
        .filter(n => n && n.length > 0)
        .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escaped.length === 0) return text;
    const regex = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        ingredientNames.includes(part)
            ? <mark key={i} className="bg-transparent font-black not-italic border-b-2 pb-0.5" style={{ color, borderColor: color }}>{part}</mark>
            : part
    );
}

export default function ReportSummary({ result, className }: ReportSummaryProps) {
    const { language } = useBasketStore();
    const { score, ingredients, cautions, conflicts } = result;
    const isKo = language === 'ko';

    const ingredientNames = useMemo(() =>
        ingredients.map(i => language === 'ko' ? i.name : language === 'ja' ? (i.name_ja || i.name_en) : language === 'zh' ? (i.name_zh || i.name_en) : (i.name_en || i.name)),
        [ingredients, language]
    );

    const insights = useMemo(() => {
        if (result.ai_briefing && result.ai_briefing.length >= 3) {
            return result.ai_briefing.slice(0, 3);
        }
        return [
            language === 'ko' ? "성분 간 흡수율을 극대화하는 최적의 배합으로 설계되었습니다." : language === 'ja' ? "成分間の吸収率を最大化する最適な配合で設計されています。" : language === 'zh' ? "旨在最大限度提高成分吸收率的最佳配方。" : "Optimized formulation for maximum absorption.",
            language === 'ko' ? "에너지 대사 활성화에 유리한 시너지가 확인되었습니다." : language === 'ja' ? "エネルギー代謝の活性化に有利な相乗効果が確認されました。" : language === 'zh' ? "确认了有利于能量代谢激活的协同效应。" : "Confirmed synergy for metabolic activation.",
            language === 'ko' ? "체내 안전성을 최우선으로 고려한 AI 검증 조합입니다." : language === 'ja' ? "体内の安全性を最優先に考慮したAI検証済みの組み合わせです。" : language === 'zh' ? "最优先考虑体内安全性的AI验证组合。" : "AI verified combination for safety."
        ];
    }, [result.ai_briefing, language]);

    const isHighEnd = score >= 85;
    const hasWarning = (conflicts?.length || 0) > 0 || (cautions?.length || 0) > 0;

    const handleShare = useCallback(async () => {
        const ingredientsList = ingredientNames.join(", ");
        let text = language === 'ko'
            ? `💊 선택한 영양제: ${ingredientsList}\n\n[ZestPair] ${score}점 영양제 분석 리포트 ✨\n\n`
            : language === 'ja'
            ? `💊 選択したサプリメント: ${ingredientsList}\n\n[ZestPair] ${score}点 サプリメント分析レポート ✨\n\n`
            : language === 'zh'
            ? `💊 选择的补充剂: ${ingredientsList}\n\n[ZestPair] ${score}分 补充剂分析报告 ✨\n\n`
            : `💊 Selected: ${ingredientsList}\n\n[ZestPair] Supplement Analysis Report: ${score} pts ✨\n\n`;
        insights.forEach((insight, idx) => {
            const meta = idx === 0 && hasWarning ? WARN_META : CARD_META[idx] || CARD_META[2];
            const insightText = typeof insight === 'string' ? insight : `${insight.headline} ${insight.details}`;
            text += `📍 ${meta.label[language] || meta.label.en}\n${insightText}\n\n`;
        });
        text += `${language === 'ko' ? '상세 결과 보기' : language === 'ja' ? '詳細結果を見る' : language === 'zh' ? '查看详细结果' : 'View Full Analysis'}: ${window.location.href}`;
        if (typeof navigator !== 'undefined' && navigator.share) {
            try { await navigator.share({ title: 'ZestPair', text }); } catch (err) { console.log(err); }
        } else if (typeof navigator !== 'undefined') {
            await navigator.clipboard.writeText(text);
            alert(language === 'ko' ? "클립보드에 복사되었습니다!" : language === 'ja' ? "クリップボードにコピーされました！" : language === 'zh' ? "已复制到剪贴板！" : "Copied to clipboard!");
        }
    }, [language, score, insights, hasWarning, ingredientNames]);

    return (
        <div className={cn("relative space-y-5", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{
                            background: isHighEnd ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                            border: `1px solid ${isHighEnd ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
                            boxShadow: isHighEnd ? '0 0 20px -5px rgba(251,191,36,0.3)' : '0 0 20px -5px rgba(52,211,153,0.3)'
                        }}>
                        <Sparkles size={17} className={isHighEnd ? "text-yellow-400" : "text-emerald-400"} />
                    </div>
                    <div className="flex flex-col">
                        <motion.h4
                            animate={{ opacity: [1, 0.8, 1, 0.9, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
                            className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.22em]"
                            style={{ color: isHighEnd ? '#fbbf24' : '#34d399' }}
                        >
                            {language === 'ko' ? "AI 프로토콜 리포트" : language === 'ja' ? "AIプロトコルレポート" : language === 'zh' ? "AI协议报告" : "AI PROTOCOL REPORT"}
                        </motion.h4>
                        <span className="text-[9px] text-slate-600 font-bold tracking-tight mt-0.5">
                            {language === 'ko' ? "개인 맞춤형 정밀 분석" : language === 'ja' ? "パーソナライズ精密分析" : language === 'zh' ? "个性化精密分析" : "HYPER-PERSONALIZED ANALYSIS"}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all active:scale-95 group"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)'
                    }}
                >
                    <Share2 size={13} className="text-slate-400 group-hover:text-white transition-colors group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">
                        {language === 'ko' ? '공유' : language === 'ja' ? '共有' : language === 'zh' ? '分享' : 'SHARE'}
                    </span>
                </button>
            </div>

            {/* Bio-Impact Section */}
            {result.bio_metrics && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true }}
                >
                    <BioImpactSection
                        metrics={result.bio_metrics}
                        mechanism={result.scientific_mechanism}
                        language={language}
                    />
                </motion.div>
            )}

            {/* Insight Cards */}
            <div className="grid gap-4">
                {insights.map((insight, idx) => {
                    const isWarnCard = idx === 0 && hasWarning;
                    const meta = isWarnCard ? WARN_META : CARD_META[idx] || CARD_META[2];
                    const Icon = meta.icon;

                    let headline = "";
                    let body = "";
                    if (typeof insight === 'string') {
                        const extracted = extractHeadline(insight);
                        headline = extracted.headline;
                        body = extracted.body;
                    } else {
                        headline = insight.headline;
                        body = insight.details;
                    }

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                            whileInView={{
                                opacity: 1,
                                x: 0,
                                filter: "blur(0px)",
                                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: idx * 0.12 }
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="group relative rounded-[2rem] overflow-hidden cursor-default"
                            style={{
                                background: meta.bgGrad,
                                border: `1px solid ${meta.borderColor}`,
                                boxShadow: `0 20px 60px -20px ${meta.glowColor}, 0 0 0 0 transparent`,
                                transition: 'box-shadow 0.4s ease, transform 0.3s ease'
                            }}
                            whileHover={{
                                scale: 1.01,
                                boxShadow: `0 25px 70px -15px ${meta.glowColor}, 0 0 40px -10px ${meta.glowColor}`
                            }}
                        >
                            {/* Scan beam animation */}
                            <motion.div
                                initial={{ top: "-100%" }}
                                whileInView={{ top: "200%" }}
                                transition={{ duration: 1.8, delay: idx * 0.12 + 0.3, ease: "easeInOut" }}
                                className="absolute left-0 right-0 h-16 opacity-10 blur-xl pointer-events-none z-0"
                                style={{ background: meta.color }}
                            />

                            {/* Left accent bar */}
                            <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                                style={{ background: meta.barColor }} />

                            {/* Corner glow */}
                            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-[50px] opacity-20 transition-opacity group-hover:opacity-35"
                                style={{ background: meta.color }} />

                            <div className="relative z-10 p-6 md:p-7 space-y-4">
                                {/* Category badge */}
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl transition-colors"
                                        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}20` }}>
                                        <Icon size={13} style={{ color: meta.color }} />
                                    </div>
                                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.28em]"
                                        style={{ color: meta.color }}>
                                        {meta.label[language] || meta.label.en}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="space-y-3 text-left">
                                    <motion.h5
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: idx * 0.12 + 0.2 }}
                                        className={cn(
                                            "text-[16px] md:text-[18px] font-black leading-[1.4] tracking-tight",
                                            (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                                        )}
                                        style={{ color: isWarnCard ? '#fef3c7' : 'rgba(255,255,255,0.95)' }}
                                    >
                                        {highlightIngredients(headline, ingredientNames, meta.color)}
                                    </motion.h5>
                                    {body && body.length > 5 && body !== headline && (
                                        <p className={cn(
                                            "text-[14px] md:text-[15px] font-medium leading-[1.65] text-slate-400/90 tracking-tight",
                                            (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                                        )}>
                                            {highlightIngredients(body, ingredientNames, meta.color)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Targets & Lifestyle Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                    {result.recommendation_targets && result.recommendation_targets.length > 0 && (
                        <div className="rounded-[2rem] overflow-hidden relative"
                            style={{
                                background: 'linear-gradient(135deg, rgba(251,191,36,0.05), rgba(251,191,36,0.02))',
                                border: '1px solid rgba(251,191,36,0.15)',
                                boxShadow: '0 20px 50px -20px rgba(251,191,36,0.1)'
                            }}>
                            <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                                style={{ background: 'linear-gradient(180deg, #fbbf24, rgba(251,191,36,0.1))' }} />
                            <div className="relative z-10 p-6 md:p-8 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                        <Users size={14} className="text-amber-400" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-400/80">
                                        {language === 'ko' ? '추천 복용 대상' : language === 'ja' ? 'おすすめの服用対象' : language === 'zh' ? '推荐服用对象' : 'TARGETS'}
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    {result.recommendation_targets.map((target, i) => (
                                        <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl transition-colors text-left"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{ background: 'rgba(251,191,36,0.5)' }} />
                                            <span className={cn(
                                                "text-[13px] md:text-[14px] font-bold text-slate-200 leading-[1.5]",
                                                (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                                            )}>
                                                {target}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {result.lifestyle_guidelines && result.lifestyle_guidelines.length > 0 && (
                        <div className="rounded-[2rem] overflow-hidden relative"
                            style={{
                                background: 'linear-gradient(135deg, rgba(251,146,60,0.05), rgba(251,146,60,0.02))',
                                border: '1px solid rgba(251,146,60,0.15)',
                                boxShadow: '0 20px 50px -20px rgba(251,146,60,0.1)'
                            }}>
                            <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                                style={{ background: 'linear-gradient(180deg, #fb923c, rgba(251,146,60,0.1))' }} />
                            <div className="relative z-10 p-6 md:p-8 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl" style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)' }}>
                                        <Coffee size={14} className="text-orange-400" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-400/80">
                                        {language === 'ko' ? '라이프스타일 시너지' : language === 'ja' ? 'ライフスタイルシナジー' : language === 'zh' ? '生活方式协同' : 'LIFESTYLE'}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {result.lifestyle_guidelines.slice(0, 2).map((tip, i) => (
                                        <div key={i} className="flex items-start gap-3 text-left">
                                            <div className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                                                style={{ background: '#fb923c' }} />
                                            <p className={cn(
                                                "text-[13px] md:text-[14px] font-medium text-slate-300 leading-relaxed",
                                                (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                                            )}>
                                                {tip}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeline Card */}
                {result.expected_timeline && (
                    <div className="rounded-[2.5rem] overflow-hidden relative"
                        style={{
                            background: 'linear-gradient(135deg, rgba(244,114,182,0.05), rgba(244,114,182,0.02))',
                            border: '1px solid rgba(244,114,182,0.15)',
                            boxShadow: '0 20px 60px -20px rgba(244,114,182,0.12)'
                        }}>
                        <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                            style={{ background: 'linear-gradient(180deg, #f472b6, rgba(244,114,182,0.1))' }} />

                        {/* Top gradient line */}
                        <div className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(244,114,182,0.4), transparent)' }} />

                        <div className="relative z-10 p-7 md:p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.2)' }}>
                                    <Calendar size={14} className="text-pink-400" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-pink-400/80">
                                    {language === 'ko' ? '4주간의 변화 과정' : language === 'ja' ? '4週間の変化過程' : language === 'zh' ? '4周变化过程' : '4-WEEK JOURNEY'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                {[
                                    { w: 'Week 1', t: result.expected_timeline.week1, s: language === 'ko' ? '초기 적응기' : language === 'ja' ? '初期適応期' : language === 'zh' ? '初期适应期' : 'Adaptation' },
                                    { w: 'Week 2', t: result.expected_timeline.week2, s: language === 'ko' ? '활성 가속기' : language === 'ja' ? '活性加速期' : language === 'zh' ? '活性加速期' : 'Acceleration' },
                                    { w: 'Week 4', t: result.expected_timeline.week4, s: language === 'ko' ? '체감 안정기' : language === 'ja' ? '体感安定期' : language === 'zh' ? '体感稳定期' : 'Stabilization' },
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="space-y-3 text-left relative"
                                    >
                                        {/* Step indicator */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black"
                                                style={{
                                                    background: `rgba(244,114,182,${0.1 + i * 0.05})`,
                                                    border: `1px solid rgba(244,114,182,${0.2 + i * 0.1})`,
                                                    color: '#f472b6'
                                                }}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <span className="block text-[13px] font-black uppercase tracking-widest text-pink-400">
                                                    {step.w}
                                                </span>
                                                <span className="text-[9px] font-bold text-pink-400/40 uppercase tracking-tight">
                                                    {step.s}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={cn(
                                            "text-[14px] md:text-[15px] font-bold text-slate-200 leading-[1.6] tracking-tight pl-11",
                                            (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
                                        )}>
                                            {step.t}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

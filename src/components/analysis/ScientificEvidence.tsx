"use client";

import { useState, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, FileText, Globe } from "lucide-react";
import { BrandName } from "../BrandAssets";
import type { AnalysisResult } from "@/types/database";

interface ScientificEvidenceProps {
    result: AnalysisResult;
    language: string;
}

const ScientificEvidence = memo(function ScientificEvidence({
    result,
    language
}: ScientificEvidenceProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isKo = language === 'ko';

    // 참고 문헌 데이터 추출 및 중복 제거 메모이제이션
    const allReferences = useMemo(() => {
        const refs = [
            ...result.synergies.map(s => s.interaction?.scientific_reference),
            ...result.cautions.map(c => c.interaction?.scientific_reference),
            ...result.conflicts.map(c => c.interaction?.scientific_reference)
        ].filter((r): r is string => !!r && r.trim() !== "");
        
        return Array.from(new Set(refs));
    }, [result.synergies, result.cautions, result.conflicts]);

    // 모바일에서는 접기 기능 적용
    const displayReferences = useMemo(() => {
        if (!isExpanded && allReferences.length > 2) {
            return allReferences.slice(0, 2);
        }
        return allReferences;
    }, [allReferences, isExpanded]);

    return (
        <div className="w-full pt-6 md:pt-10">
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3.5rem] bg-slate-900/40 border border-white/10 backdrop-blur-3xl p-5 md:p-12 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10 pb-4 md:pb-8 border-b border-white/5">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-inner">
                            <BookOpen size={18} className="text-slate-400 md:size-[22px]" />
                        </div>
                        <div>
                            <h4 className="text-base md:text-xl font-black text-white tracking-tight">
                                {isKo ? "학술적 근거 및 데이터 투명성" : "Evidence & Transparency"}
                            </h4>
                            <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                Verified Medical Scholarly Sources
                            </p>
                        </div>
                    </div>
                    <div className="px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 self-start md:self-center">
                        <ShieldCheck size={12} className="text-emerald-400 md:size-3.5" />
                        <span className="text-[9px] md:text-[11px] font-black text-emerald-400 tracking-tighter uppercase pt-0.5">
                            Medical Grade v2.4 Certified
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                    {displayReferences.length > 0 ? (
                        <>
                            {displayReferences.map((ref, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/10 transition-all group/ref"
                                >
                                    <div className="mt-0.5 flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg bg-slate-800 border border-white/5 group-hover/ref:border-white/20 transition-colors shrink-0">
                                        <FileText size={12} className="text-slate-500 group-hover/ref:text-slate-300 transition-colors md:size-3.5" />
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] md:text-[15px] text-slate-300 font-bold group-hover/ref:text-white transition-colors leading-snug truncate">
                                                {ref}
                                            </span>
                                            <Globe size={10} className="text-slate-600 opacity-0 group-hover/ref:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            P-R Scholarly Resource
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {allReferences.length > 2 && (
                                <div className="col-span-full pt-4 flex justify-center lg:hidden">
                                    <button 
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
                                    >
                                        {isExpanded ? (
                                            <>접기 <Globe size={12} className="rotate-180" /></>
                                        ) : (
                                            <>더 보기 (+{allReferences.length - 2})</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="col-span-full p-8 md:p-10 text-center rounded-2xl md:rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01]">
                            <span className="text-xs md:text-[14px] font-bold text-slate-500 italic leading-relaxed">
                                {isKo 
                                    ? "본 리포트의 모든 데이터는 ZestPair AI 임상 가이드라인을 기반으로 생성되었습니다." 
                                    : "All data was generated based on ZestPair AI clinical guidelines."}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
                    <p className="text-[9px] md:text-[11px] font-bold text-slate-400 leading-relaxed max-w-xl text-center md:text-left pt-1">
                        {isKo 
                            ? "* 본 서비스는 참고용 정보만을 제공하며 의료 진단을 대신할 수 없습니다."
                            : "* This service is for reference only and is not a medical diagnosis."}
                    </p>
                    <div className="flex items-center gap-6 shrink-0 pt-1">
                        <div className="w-px h-6 bg-white/10 hidden md:block" />
                        <BrandName size="text-lg md:text-xl" className="opacity-20 grayscale" />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ScientificEvidence;

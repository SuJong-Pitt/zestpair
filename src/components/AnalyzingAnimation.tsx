"use client";

import { useEffect, useState, useMemo } from "react";
import { Atom, Activity, Beaker, Pill, Droplets, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBasketStore } from "@/store/basketStore";

const ANALYZING_MESSAGES_KO = [
    "장바구니 성분 추출 중... 🔬",
    "분자 구조 분석 및 매핑 중... 🧬",
    "성분 간 충돌 테스트 프로토콜... ⚡",
    "시너지 공식 산출 중... 🧪",
    "영양 밸런스 최적화 로직 가동... ✨",
    "분석 결과 패키징 완료! 🎯",
];

const ANALYZING_MESSAGES_EN = [
    "Extracting basket ingredients... 🔬",
    "Mapping molecular structures... 🧬",
    "Executing collision protocols... ⚡",
    "Calculating synergy formulas... 🧪",
    "Optimizing nutrient balance... ✨",
    "Packaging results... 🎯",
];

interface Props {
    onComplete?: () => void;
}

export default function AnalyzingAnimation({ onComplete }: Props) {
    const { language } = useBasketStore();
    const [messageIdx, setMessageIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const messages = language === "ko" ? ANALYZING_MESSAGES_KO : ANALYZING_MESSAGES_EN;

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMessageIdx((prev) => (prev + 1) % messages.length);
        }, 1200);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setIsFinished(true);
                    // 100% 도달 후 연출을 위해 약간의 지연 후 콜백 실행
                    setTimeout(() => onComplete?.(), 800);
                    return 100;
                }
                // 자연스러운 가속/감속 로직
                const remaining = 100 - prev;
                const step = Math.max(0.5, remaining * 0.08); // 남은 거리의 8%씩 이동 (최소 0.5)
                const jitter = Math.random() * 2;
                return Math.min(100, prev + step + jitter);
            });
        }, 150);

        return () => {
            clearInterval(msgInterval);
            clearInterval(progressInterval);
        };
    }, [messages.length, onComplete]);

    const particles = useMemo(() => 
        Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            delay: i * 0.1,
            duration: 1.5 + Math.random() * 2,
            size: 2 + Math.random() * 4
        }))
    , []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050B0A] overflow-hidden"
        >
            {/* 시네마틱 배경 입자 */}
            <div className="absolute inset-0">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 1000 }}
                        animate={{ 
                            opacity: [0, 0.4, 0],
                            y: [-100, -1100],
                            x: [Math.random() * 1000 - 500, Math.random() * 1000 - 500]
                        }}
                        transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                        className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
                
                {/* 메인 믹싱 코어: 비커 & 아이콘 액션 */}
                <div className="relative mb-12">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                        {/* 회전하는 하이테크 링 */}
                        <motion.div 
                            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-30px] border-2 border-dashed border-emerald-500/20 rounded-full" 
                        />
                        
                        {/* 액티브 믹싱 비커 */}
                        <motion.div
                            animate={isFinished ? { 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            } : { 
                                y: [0, -15, 0],
                                rotate: [-2, 2, -2]
                            }}
                            transition={{ duration: 0.5, repeat: isFinished ? 1 : Infinity }}
                            className="relative w-48 h-48 md:w-60 md:h-60 rounded-[3.5rem] bg-slate-900/40 backdrop-blur-3xl border-2 border-white/20 shadow-[0_0_100px_rgba(16,185,129,0.3)] flex items-center justify-center overflow-hidden group"
                        >
                            {/* 액체 수위 애니메이션 */}
                            <motion.div 
                                animate={{ height: `${progress}%` }}
                                className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 via-emerald-400/40 to-teal-300/10 transition-all duration-300"
                            >
                                {/* 파도 효과 */}
                                <motion.div 
                                    animate={{ x: ["-50%", "0%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-0 left-0 w-[200%] h-4 bg-white/20 blur-md rounded-full"
                                />
                            </motion.div>
                            
                            {/* 반응 기포 */}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 200, opacity: 0 }}
                                    animate={{ 
                                        y: [-50, -250], 
                                        opacity: [0, 0.8, 0],
                                        scale: [0.5, 1.2, 0.5]
                                    }}
                                    transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.2 }}
                                    className="absolute w-2 h-2 rounded-full bg-emerald-200 blur-[1px]"
                                />
                            ))}

                            <AnimatePresence mode="wait">
                                {isFinished ? (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="z-20 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,1)]"
                                    >
                                        <CheckCircle2 size={100} strokeWidth={2.5} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="beaker" className="z-10 text-emerald-400/80">
                                        <Beaker size={90} strokeWidth={1.5} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* 플로팅 성분 아이콘들의 "결합" 액션 */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[Pill, Droplets, Atom, Zap].map((Icon, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        x: [
                                            (i % 2 === 0 ? -120 : 120), 
                                            (i % 2 === 0 ? -40 : 40), 
                                            (i % 2 === 0 ? -120 : 120)
                                        ],
                                        y: [
                                            (i < 2 ? -120 : 120), 
                                            (i < 2 ? -40 : 40), 
                                            (i < 2 ? -120 : 120)
                                        ],
                                        scale: [1, 1.4, 1],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-slate-900/80 border border-emerald-500/50 shadow-2xl text-emerald-400 z-30"
                                >
                                    <Icon size={24} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 하단 텍스트 및 데이터 바 */}
                <div className="w-full text-center">
                    <div className="h-16 mb-8 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.h3 
                                key={messageIdx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-2xl md:text-5xl font-[1000] text-emerald-50 tracking-tight italic drop-shadow-[0_0_25px_rgba(16,185,129,0.6)]"
                            >
                                {messages[messageIdx]}
                            </motion.h3>
                        </AnimatePresence>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <motion.div 
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.8)] rounded-full"
                                />
                            </div>
                        </div>

                        <div className="flex items-end justify-between px-2">
                            <div className="text-left">
                                <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest block mb-1">Status</span>
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-emerald-400 animate-pulse" />
                                    <span className="font-mono text-sm text-white/50 tracking-tighter">
                                        {isFinished ? "PROCESS_COMPLETE" : `MIXING_ACTIVE_00${Math.floor(progress)}`}
                                    </span>
                                </div>
                            </div>
                            
                            <motion.div 
                                animate={isFinished ? { scale: [1, 1.2, 1] } : {}}
                                className="text-right"
                            >
                                <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest block mb-1">Blend Index</span>
                                <span className="text-5xl md:text-8xl font-[1010] text-white italic leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                    {Math.floor(progress)}<span className="text-xl md:text-3xl ml-1 text-emerald-400">%</span>
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하이테크 레이더 스캔 효과 */}
            <div className="absolute inset-0 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] animate-[spin_10s_linear_infinite]" />
        </motion.div>
    );
}

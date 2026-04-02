"use client";

import { useEffect, memo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ScoreRingProps {
    score: number;
    size?: number;
}

/** 
 * 점수 링 컴포넌트 - 풀 컬러 네온 HUD 버전
 * React.memo를 통해 부모 리렌더링 시에도 불필요한 계산을 방지합니다.
 */
const ScoreRing = memo(function ScoreRing({ score, size }: ScoreRingProps) {
    const radius = 72;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;

    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const animation = animate(count, score, { duration: 1.8, ease: "easeOut" });
        return animation.stop;
    }, [score, count]);

    const offset = useTransform(count, (latest) =>
        circumference - (latest / 100) * circumference
    );

    const orbPos = useTransform(count, (latest) => {
        const angle = (latest / 100) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return {
            x: 90 + radius * Math.cos(rad),
            y: 90 + radius * Math.sin(rad)
        };
    });

    // 점수에 따라 팔레트 변경 (더 다채롭게)
    const getColor = (s: number) => {
        if (s === 100) return {
            main: "#e879f9", light: "#f0abfc", accent: "#fae8ff",
            shadow: "rgba(232,121,249,1)",
            gradA: "#e879f9",   // fuchsia
            gradB: "#818cf8",   // indigo  
            gradC: "#34d399",   // emerald
            label: "✦  P E R F E C T  ✦", labelColor: "#f0abfc"
        };
        if (s >= 80) return {
            main: "#34d399", light: "#6ee7b7", accent: "#a7f3d0",
            shadow: "rgba(52,211,153,0.9)",
            gradA: "#34d399", gradB: "#06b6d4", gradC: "#6366f1",
            label: "HIGH_SYNERGY", labelColor: "#34d399"
        };
        if (s >= 60) return {
            main: "#22d3ee", light: "#67e8f9", accent: "#a5f3fc",
            shadow: "rgba(34,211,238,0.9)",
            gradA: "#22d3ee", gradB: "#818cf8", gradC: "#c084fc",
            label: "SYNC_STABLE", labelColor: "#22d3ee"
        };
        if (s >= 40) return {
            main: "#fbbf24", light: "#fcd34d", accent: "#fde68a",
            shadow: "rgba(251,191,36,0.9)",
            gradA: "#fbbf24", gradB: "#f97316", gradC: "#fb7185",
            label: "CAUTION_REQ", labelColor: "#fbbf24"
        };
        return {
            main: "#f87171", light: "#fca5a5", accent: "#fecaca",
            shadow: "rgba(248,113,113,0.9)",
            gradA: "#f87171", gradB: "#e879f9", gradC: "#fb923c",
            label: "CRIT_WARN", labelColor: "#f87171"
        };
    };

    const colors = getColor(score);
    const isMaxScore = score === 100;

    return (
        <div 
            className="relative flex items-center justify-center select-none group/score w-52 h-52 md:w-60 md:h-60"
            style={size ? { width: size, height: size } : {}}
        >
            {/* 100점 전용: 스피닝 홀로그래픽 코닉 오라 */}
            {isMaxScore && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-8px] rounded-full pointer-events-none"
                    style={{
                        background: "conic-gradient(from 0deg, #e879f9, #818cf8, #06b6d4, #34d399, #fbbf24, #f87171, #e879f9)",
                        filter: "blur(18px)",
                        opacity: 0.55
                    }}
                />
            )}
            {/* 외부 다층 네온 오라 */}
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${colors.gradA} 0%, ${colors.gradB} 40%, transparent 70%)`, filter: "blur(55px)" }}
            />
            <motion.div
                animate={{ scale: [1.1, 1.35, 1.1], opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${colors.gradC} 0%, transparent 65%)`, filter: "blur(70px)" }}
            />

            <svg viewBox="0 0 180 180" className="w-full h-full overflow-visible">
                <defs>
                    {/* 3색 무지개 그라디언트 */}
                    <linearGradient id="scoreRainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.gradA} />
                        <stop offset="50%" stopColor={colors.gradB} />
                        <stop offset="100%" stopColor={colors.gradC} />
                    </linearGradient>
                    {/* 글로우 필터 */}
                    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="orbGlow" x="-80%" y="-80%" width="360%" height="360%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <pattern id="colorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.gradA} strokeWidth="0.15" strokeOpacity="0.3" />
                    </pattern>
                </defs>

                {/* 배경 컬러 그리드 */}
                <circle cx="90" cy="90" r={radius + 12} fill="url(#colorGrid)" opacity="0.35" />

                {/* 컬러 눈금 링 (3색 분산) */}
                <g opacity="0.4">
                    {Array.from({ length: 48 }).map((_, i) => {
                        const isMajor = i % 4 === 0;
                        const col = i % 3 === 0 ? colors.gradA : i % 3 === 1 ? colors.gradB : colors.gradC;
                        return (
                            <rect key={i} x="89.5" y="0"
                                width={isMajor ? "1.2" : "0.6"}
                                height={isMajor ? "12" : "7"}
                                fill={col}
                                transform={`rotate(${i * 7.5} 90 90)`}
                                opacity={isMajor ? 0.9 : 0.35}
                            />
                        );
                    })}
                </g>

                {/* 트랙 링 */}
                <circle cx="90" cy="90" r={radius} stroke="white" strokeWidth="1.5" strokeDasharray="3 5" fill="transparent" opacity="0.07" />

                {/* 내부 동심원 장식 */}
                <circle cx="90" cy="90" r={radius - 13} stroke={colors.gradB} strokeWidth="0.5" strokeDasharray="8 22" fill="transparent" opacity="0.18" />
                <circle cx="90" cy="90" r={radius - 24} stroke={colors.gradC} strokeWidth="0.5" strokeDasharray="4 16" fill="transparent" opacity="0.12" />

                {/* 역방향 회전 데코 링 */}
                <motion.circle cx="90" cy="90" r={radius + 8}
                    stroke={`url(#scoreRainbowGrad)`} strokeWidth="0.8"
                    strokeDasharray="30 170" fill="transparent"
                    animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    className="origin-center" opacity="0.45"
                />
                {/* 정방향 빠른 데코 링 */}
                <motion.circle cx="90" cy="90" r={radius + 15}
                    stroke={colors.gradC} strokeWidth="0.5"
                    strokeDasharray="6 55" fill="transparent"
                    animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="origin-center" opacity="0.28"
                />

                {/* 메인 프로그레스 글로우 레이어 (흐릿한 두꺼운 후광) */}
                <motion.circle cx="90" cy="90" r={radius}
                    stroke="url(#scoreRainbowGrad)" strokeWidth={strokeWidth + 8}
                    fill="transparent" strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset, strokeLinecap: "round", filter: "blur(9px)", opacity: 0.22 }}
                    className="-rotate-90 origin-center"
                />
                {/* 메인 프로그레스 링 */}
                <motion.circle cx="90" cy="90" r={radius}
                    stroke="url(#scoreRainbowGrad)" strokeWidth={strokeWidth}
                    fill="transparent" strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset, strokeLinecap: "round",
                        filter: `drop-shadow(0 0 10px ${colors.shadow}) drop-shadow(0 0 5px ${colors.gradB})`
                    }}
                    className="-rotate-90 origin-center"
                />

                {/* 100점 전용: 별 파티클 8개 + 전체 무지개 링 */}
                {isMaxScore && (
                    <>
                        {/* 전체 무지개 아웃라인 링 */}
                        <motion.circle cx="90" cy="90" r={radius + 4}
                            stroke="url(#scoreRainbowGrad)" strokeWidth="2"
                            strokeDasharray="15 10" fill="transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="origin-center" opacity="0.7"
                        />
                        {/* 빠른 역방향 무지개 링 */}
                        <motion.circle cx="90" cy="90" r={radius + 12}
                            stroke="url(#scoreRainbowGrad)" strokeWidth="1.5"
                            strokeDasharray="8 20" fill="transparent"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="origin-center" opacity="0.5"
                        />
                        {/* 궤도 별 파티클 8개 (각기 다른 색+속도) */}
                        {[
                            { color: "#e879f9", r: radius + 4, dur: 3.2, delay: 0 },
                            { color: "#818cf8", r: radius + 4, dur: 3.2, delay: 0.4 },
                            { color: "#06b6d4", r: radius + 4, dur: 3.2, delay: 0.8 },
                            { color: "#34d399", r: radius + 4, dur: 3.2, delay: 1.2 },
                            { color: "#fbbf24", r: radius + 4, dur: 3.2, delay: 1.6 },
                            { color: "#f87171", r: radius + 4, dur: 3.2, delay: 2.0 },
                            { color: "#f0abfc", r: radius + 4, dur: 3.2, delay: 2.4 },
                            { color: "#67e8f9", r: radius + 4, dur: 3.2, delay: 2.8 },
                        ].map((p, i) => (
                            <motion.g key={i}
                                animate={{ rotate: 360 }}
                                transition={{ duration: p.dur, repeat: Infinity, ease: "linear", delay: -p.delay }}
                                style={{ transformOrigin: "90px 90px" }}
                            >
                                {/* 별 모양 (4-point star via 2 rotated rects) */}
                                <g transform={`translate(${90 + p.r}, 90)`}>
                                    <motion.rect x="-2.5" y="-0.5" width="5" height="1" rx="0.5"
                                        fill={p.color} filter="url(#orbGlow)"
                                        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                    <motion.rect x="-0.5" y="-2.5" width="1" height="5" rx="0.5"
                                        fill={p.color} filter="url(#orbGlow)"
                                        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                </g>
                            </motion.g>
                        ))}
                        {/* 중앙 흰색 코어 펄스 */}
                        <motion.circle cx="90" cy="90" r="8"
                            fill="white" opacity="0.06"
                            animate={{ r: [6, 16, 6], opacity: [0.06, 0.15, 0.06] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </>
                )}

                {/* 컬러 모서리 브래킷 */}
                <g opacity="0.5" strokeWidth="1" fill="none">
                    <path d="M 58 38 L 38 38 L 38 58" stroke={colors.gradA} />
                    <path d="M 122 38 L 142 38 L 142 58" stroke={colors.gradB} />
                    <path d="M 58 142 L 38 142 L 38 122" stroke={colors.gradC} />
                    <path d="M 122 142 L 142 142 L 142 122" stroke={colors.gradA} />
                </g>

                {/* 회전하는 메인 스캐닝 광선 */}
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "90px 90px" }}>
                    <line x1="90" y1="90" x2="90" y2={90 - radius - 2} stroke={colors.gradA} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
                    <circle cx="90" cy={90 - radius} r="2.5" fill={colors.gradA} opacity="0.9" filter="url(#orbGlow)" />
                </motion.g>

                {/* 역방향 느린 파티클 */}
                <motion.g animate={{ rotate: -360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "90px 90px" }}>
                    <circle cx="90" cy={90 - radius - 8} r="2" fill={colors.gradB} opacity="0.55" filter="url(#orbGlow)" />
                </motion.g>
                {/* 정방향 느린 파티클 */}
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 9.5, repeat: Infinity, ease: "linear", delay: 3 }}
                    style={{ transformOrigin: "90px 90px" }}>
                    <circle cx="90" cy={90 - radius + 4} r="1.5" fill={colors.gradC} opacity="0.45" filter="url(#orbGlow)" />
                </motion.g>

                {/* 궤도 끝 구슬 */}
                <motion.circle cx={orbPos.get().x} cy={orbPos.get().y} r="5.5" fill="white"
                    style={{ filter: `drop-shadow(0 0 10px ${colors.gradA}) drop-shadow(0 0 5px ${colors.gradB})` }} />
                <motion.circle cx={orbPos.get().x} cy={orbPos.get().y} r="2.5" fill={colors.gradA}
                    style={{ filter: `drop-shadow(0 0 8px ${colors.shadow})` }} />
            </svg>

            {/* 텍스트 레이어 - 가독성 강화 버전 (overflow 제거로 잘림 방지) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* 내부 다크 배경 - 텍스트 대비 강화 */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: "58%", height: "58%",
                        background: "radial-gradient(circle, rgba(2,6,23,0.85) 60%, transparent 100%)",
                    }}
                />
                {/* 상단 상태 뱃지 */}
                <div className="absolute top-[28%] left-1/2 -translate-x-1/2 max-w-[85%]">
                    <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                        style={{ background: `rgba(2,6,23,0.7)`, border: `1px solid ${colors.gradA}70`, backdropFilter: "blur(4px)" }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: colors.gradA, boxShadow: `0 0 8px ${colors.gradA}` }}
                        />
                        <span className="text-[7px] font-mono tracking-widest uppercase font-bold truncate" style={{ color: colors.labelColor }}>
                            {colors.label}
                        </span>
                    </motion.div>
                </div>

                {/* 점수 숫자 - 강한 네온 글로우 + 선명한 대비 */}
                <motion.div
                    animate={{ opacity: [1, 0.9, 1] }} transition={{ duration: 2.2, repeat: Infinity }}
                    className="relative flex items-center justify-center mt-7 z-10"
                >
                    <motion.span
                        className="font-[1000] tracking-tighter leading-none pr-[0.05em]"
                        style={{
                            fontSize: "clamp(2.5rem, 5vw, 3.6rem)",
                            background: `linear-gradient(135deg, #ffffff 0%, ${colors.gradA} 35%, ${colors.gradB} 70%, ${colors.gradC} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            // drop-shadow filter on text-clip creates black boxes on Android/Samsung Internet scrolling
                        }}
                    >
                        {rounded}
                    </motion.span>
                    <span
                        className="absolute left-[calc(100%+2px)] bottom-[15%] text-[10px] font-black italic tracking-widest uppercase"
                        style={{ color: colors.light, opacity: 0.8 }}
                    >
                        %
                    </span>
                </motion.div>

                {/* 하단 데이터 라벨 */}
                <div className="mt-3 flex flex-col items-center gap-1.5 relative z-10">
                    <motion.div initial={{ width: 0 }} animate={{ width: 56 }} transition={{ duration: 1.2, delay: 0.5 }}
                        className="h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${colors.gradB}, ${colors.gradC}, transparent)` }}
                    />
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-md" style={{ background: "rgba(2,6,23,0.5)" }}>
                        <span className="text-[7px] font-mono tracking-[0.28em] uppercase font-semibold" style={{ color: colors.light }}>Core_V2.5</span>
                        <div className="w-0.5 h-0.5 rounded-full" style={{ background: colors.gradB, opacity: 0.7 }} />
                        <span className="text-[7px] font-mono tracking-[0.28em] uppercase font-semibold" style={{ color: colors.light }}>
                            {score >= 60 ? "HIGH_SYNC" : score >= 40 ? "CAUTION" : "CRITICAL"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ScoreRing;

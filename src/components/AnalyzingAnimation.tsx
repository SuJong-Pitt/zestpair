"use client";

import { useEffect, useState, useMemo } from "react";
import { Activity, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBasketStore } from "@/store/basketStore";

const ANALYZING_MESSAGES_KO = [
  "바스켓 성분 추출 중...",
  "분자 구조 매핑 중...",
  "충돌 테스트 프로토콜 가동...",
  "성분 시너지 계산 중...",
  "영양 밸런스 최적화...",
  "분석 완료! 결과 패키징 중...",
];

const ANALYZING_MESSAGES_EN = [
  "Extracting ingredients...",
  "Mapping molecular structures...",
  "Running collision protocols...",
  "Calculating synergy formulas...",
  "Optimizing nutrient balance...",
  "Complete! Packaging results...",
];

// 알약 이모지 세트
const PILL_EMOJIS = ["💊", "🧬", "🔬", "⚗️", "🧪", "💉", "🫧", "🌿"];

interface Props { onComplete?: () => void; }

export default function AnalyzingAnimation({ onComplete }: Props) {
  const { language, selectedIngredients } = useBasketStore();
  const [messageIdx, setMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const messages = language === "ko" ? ANALYZING_MESSAGES_KO : ANALYZING_MESSAGES_EN;

  // 선택된 영양제의 이모지 (없으면 기본값)
  const ingredientEmojis = useMemo(() =>
    selectedIngredients.length > 0
      ? selectedIngredients.slice(0, 6).map(i => i.icon_emoji)
      : PILL_EMOJIS.slice(0, 4),
    [selectedIngredients]
  );

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % messages.length);
    }, 1100);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsFinished(true);
          setTimeout(() => onComplete?.(), 900);
          return 100;
        }
        const remaining = 100 - prev;
        const step = Math.max(0.4, remaining * 0.07);
        const jitter = Math.random() * 1.5;
        return Math.min(100, prev + step + jitter);
      });
    }, 120);

    return () => { clearInterval(msgInterval); clearInterval(progressInterval); };
  }, [messages.length, onComplete]);

  // 배경 파티클
  const bgParticles = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
      size: 1 + Math.random() * 3,
      color: ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#f43f5e"][i % 5],
      emoji: i % 5 === 0 ? PILL_EMOJIS[i % PILL_EMOJIS.length] : null
    }))
  , []);

  // 오비트 영양제 구슬
  const orbitItems = useMemo(() =>
    ingredientEmojis.map((emoji, i) => ({
      emoji,
      angle: (360 / ingredientEmojis.length) * i,
      radius: 140,
      duration: 6 + i * 0.4,
      delay: i * 0.3,
      color: ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#f43f5e", "#ec4899"][i % 6],
    }))
  , [ingredientEmojis]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #030712 0%, #050e0a 40%, #030a14 100%)" }}
    >
      {/* ── 배경 오브 ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 60%)", filter: "blur(80px)", opacity: 0.5 }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 60%)", filter: "blur(70px)", opacity: 0.35 }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 50%)", filter: "blur(60px)", opacity: 0.25 }} />
      </div>

      {/* ── 배경 파티클 (상승) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bgParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute flex items-center justify-center"
            style={{ left: `${p.x}%`, bottom: "-2rem" }}
            animate={{ y: [0, -window.innerHeight - 100], opacity: [0, p.emoji ? 0.85 : 0.65, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          >
            {p.emoji ? (
              <span style={{ fontSize: `${p.size * 5}px` }}>{p.emoji}</span>
            ) : (
              <div
                className="rounded-full"
                style={{ width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}` }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* ── 수평 스캔라인 ── */}
      <motion.div
        className="absolute inset-x-0 h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)" }}
        animate={{ y: ["-100vh", "100vh"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* ── 메인 콘텐츠 ── */}
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">

        {/* ── 중앙 믹싱 코어 ── */}
        <div className="relative mb-10 flex items-center justify-center" style={{ width: 320, height: 320 }}>

          {/* 오비팅 링 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full pointer-events-none"
            style={{ inset: -10, border: "1px solid rgba(16,185,129,0.2)" }}
          />
          {/* 오비팅 링 2 (반대) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full pointer-events-none"
            style={{ inset: 15, border: "1px dashed rgba(6,182,212,0.15)" }}
          />

          {/* 영양제 이모지 궤도 오브 */}
          {orbitItems.map((item, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{ originX: 0, originY: 0 }}
              animate={{ rotate: [item.angle, item.angle + 360] }}
              transition={{ duration: item.duration, repeat: Infinity, ease: "linear", delay: item.delay }}
            >
              <motion.div
                style={{ translateX: item.radius, translateY: -item.radius / 5 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: item.delay }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}08 100%)`,
                    border: `1.5px solid ${item.color}50`,
                    boxShadow: `0 0 20px ${item.color}35, 0 0 0 1px ${item.color}15`
                  }}
                >
                  {item.emoji}
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* 메인 믹싱 플라스크 */}
          <motion.div
            animate={isFinished
              ? { scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }
              : { y: [0, -10, 0], rotate: [-1, 1, -1] }
            }
            transition={{ duration: isFinished ? 0.4 : 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-44 h-44 rounded-[3rem] overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(6,18,14,0.9) 0%, rgba(3,10,8,0.95) 100%)",
              border: "1.5px solid rgba(16,185,129,0.3)",
              boxShadow: "0 0 60px rgba(16,185,129,0.25), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)"
            }}
          >
            {/* 액체 수위 */}
            <motion.div
              animate={{ height: `${progress}%` }}
              transition={{ ease: "easeOut" }}
              className="absolute bottom-0 inset-x-0"
              style={{ background: "linear-gradient(to top, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.15) 60%, rgba(6,182,212,0.05) 100%)" }}
            >
              {/* 파도 */}
              <motion.div
                animate={{ x: ["-50%", "0%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-[200%] h-3"
                style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent, rgba(52,211,153,0.2), transparent)", borderRadius: "50%" }}
              />
            </motion.div>

            {/* 기포 */}
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3 + (i % 4),
                  height: 3 + (i % 4),
                  left: `${10 + (i * 9) % 80}%`,
                  background: "rgba(52,211,153,0.6)",
                  boxShadow: "0 0 6px rgba(52,211,153,0.4)"
                }}
                animate={{ y: [200, -220], opacity: [0, 0.9, 0], scale: [0.5, 1, 0.3] }}
                transition={{ duration: 1.4 + Math.random() * 1.5, repeat: Infinity, delay: i * 0.22, ease: "easeOut" }}
              />
            ))}

            {/* 완료 / 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <AnimatePresence mode="wait">
                {isFinished ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ color: "#34d399", filter: "drop-shadow(0 0 20px #10b981)" }}
                  >
                    <CheckCircle2 size={80} strokeWidth={2} />
                  </motion.div>
                ) : (
                  <motion.div
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <span className="text-6xl">⚗️</span>
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex gap-1.5"
                      >
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "#34d399", boxShadow: "0 0 8px #10b981" }}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── 메시지 / 텍스트 ── */}
        <div className="w-full text-center mb-8">
          <div className="h-14 flex items-center justify-center mb-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIdx}
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                transition={{ duration: 0.4 }}
                className="text-xl md:text-2xl font-black tracking-tight"
                style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 0 40px rgba(16,185,129,0.5)" }}
              >
                {messages[messageIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(16,185,129,0.45)" }}>
            AI · SYNERGY ENGINE · v2.0
          </p>
        </div>

        {/* ── 프로그레스 바 ── */}
        <div className="w-full space-y-4">
          <div
            className="relative h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)",
                boxShadow: "0 0 16px rgba(16,185,129,0.7)"
              }}
            />
            {/* 스캐너 글린트 */}
            <motion.div
              className="absolute inset-y-0 w-12"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
              animate={{ x: [`-10%`, `${progress + 5}%`] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* 하단 상태 / 인덱스 */}
          <div className="flex items-end justify-between px-1">
            <div className="text-left">
              <span className="block text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(16,185,129,0.45)" }}>Status</span>
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Activity size={13} style={{ color: "#34d399" }} />
                </motion.div>
                <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {isFinished ? "PROCESS_COMPLETE" : `MIXING_ACTIVE_${String(Math.floor(progress)).padStart(4, "0")}`}
                </span>
              </div>
            </div>

            <motion.div
              animate={isFinished ? { scale: [1, 1.15, 1] } : {}}
              className="text-right"
            >
              <span className="block text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(16,185,129,0.45)" }}>
                Blend Index
              </span>
              <span
                className="text-6xl md:text-7xl font-[900] leading-none tracking-tighter"
                style={{
                  color: isFinished ? "#34d399" : "white",
                  textShadow: isFinished ? "0 0 30px rgba(16,185,129,0.8)" : "0 0 30px rgba(255,255,255,0.15)"
                }}
              >
                {Math.floor(progress)}
                <span className="text-2xl ml-1" style={{ color: "#34d399" }}>%</span>
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── 레이더 코닉 스캔 ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.04) 50%, transparent 100%)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* ── 코너 HUD 브래킷 ── */}
      {[
        { top: "1.5rem", left: "1.5rem", rotate: "0deg" },
        { top: "1.5rem", right: "1.5rem", rotate: "90deg" },
        { bottom: "1.5rem", left: "1.5rem", rotate: "270deg" },
        { bottom: "1.5rem", right: "1.5rem", rotate: "180deg" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-6 h-6 pointer-events-none"
          style={{ ...pos }}
        >
          <div
            className="absolute inset-0"
            style={{
              borderTop: "2px solid rgba(16,185,129,0.4)",
              borderLeft: "2px solid rgba(16,185,129,0.4)",
              transform: `rotate(${pos.rotate})`,
              transformOrigin: "center",
              borderRadius: "2px 0 0 0"
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}

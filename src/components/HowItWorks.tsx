"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Pill, Sparkles, Database, Smartphone, ChevronRight, Info } from "lucide-react";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import Image from "next/image";

export default function HowItWorks({ onStart }: { onStart?: () => void }) {
  const { language } = useBasketStore();
  const t = UI_TRANSLATIONS[language];
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 3D Tilt & Mouse Shine Logic ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 20 });

  // Shine position (relative to card)
  const shineX = useSpring(useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]), { stiffness: 300, damping: 30 });
  const shineY = useSpring(useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section className="relative py-20 px-4 mt-[-4rem] z-30 overflow-hidden">
      {/* 배경 장식 (Liquid Light) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] pointer-events-none opacity-40">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full blur-[100px]"
          style={{ background: "conic-gradient(from 0deg, #10b98120, #06b6d420, #8b5cf620, #10b98120)" }}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            perspective: 1000,
            transformStyle: "preserve-3d"
          }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2.5rem] bg-white border border-emerald-500/10 shadow-[0_40px_100px_rgba(0,0,0,0.08)] group overflow-hidden"
        >
          {/* 하이테크 스캐너 효과 (주기적) */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]"
            style={{ 
              background: "linear-gradient(90deg, transparent, #10b981, transparent)",
              transform: "skewX(-15deg)"
            }}
          />

          {/* 콘텐츠 영역 */}
          <div className="relative z-30 p-1 md:p-1.5 flex flex-col h-full bg-white/40">
            
            {/* 상단바 (가상 브라우저 스타일) */}
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex flex-col items-start gap-1">
                 <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100"
                 >
                    <Sparkles size={12} className="text-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Smart Protocol</span>
                 </motion.div>
                 <h2 className="text-2xl md:text-4xl font-[1000] text-slate-900 tracking-tighter">
                   {t.howItWorks.title}
                 </h2>
              </div>
              
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex gap-1.5 mr-4">
                  {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />)}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Info size={14} />
                </div>
              </div>
            </div>

            {/* 메인 비주얼 박스 */}
            <div className="px-6 md:px-10 pb-4">
               <motion.div 
                 className="relative rounded-[1.5rem] overflow-hidden border border-slate-200/50 shadow-2xl shadow-emerald-500/5 group-hover:shadow-emerald-500/10 transition-shadow duration-500"
                 style={{ transform: "translateZ(40px)" }} // 3D 효과 강화
               >
                 <Image 
                   src="/hero-illustration-guide.webp" 
                   alt="ZestPair Process Guide" 
                   width={1200}
                   height={1000}
                   className="w-full h-auto transform transition-all duration-1000 group-hover:scale-[1.03]"
                   sizes="(max-width: 768px) 100vw, 896px"
                />
                 
                 {/* 이미지 위 오버레이 (Floating Badge) */}
                 <div className="absolute top-4 left-4 p-3 bg-white/95 rounded-2xl border border-white/40 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                          <Pill size={20} className="animate-bounce" />
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                          <p className="text-xs font-black text-slate-800">Optimizing Synergy</p>
                       </div>
                    </div>
                 </div>
               </motion.div>
            </div>

            {/* 하단 단계 요약 (리치 그리드) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 md:p-8 pt-4">
              {[
                { step: "01", title: t.howItWorks.step1, icon: <Pill size={18} />, color: "emerald" },
                { step: "02", title: t.howItWorks.step2, icon: <Sparkles size={18} />, color: "cyan" },
                { step: "03", title: t.howItWorks.step3, icon: <Database size={18} />, color: "indigo" },
                { step: "04", title: t.howItWorks.step4, icon: <Smartphone size={18} />, color: "amber" },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group/item relative flex flex-col items-center justify-center p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-emerald-200 overflow-hidden"
                >
                  <div className="absolute top-3 right-3 text-[10px] font-[1000] text-slate-200 group-hover/item:text-emerald-100 transition-colors">
                    {item.step}
                  </div>
                  
                  {/* 아이콘 컨테이너 */}
                  <div className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center transition-all bg-slate-50 group-hover/item:scale-110 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-500 text-slate-400`}>
                    {item.icon}
                  </div>
                  
                  <span className="text-xs md:text-sm font-black text-slate-700 group-hover/item:text-emerald-900 transition-colors tracking-tight text-center px-1">
                    {item.title}
                  </span>

                  {/* 하단 포인트 닷 */}
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className="mt-3 w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-emerald-400 group-hover/item:shadow-[0_0_8px_#10b981]" 
                  />
                </motion.div>
              ))}
            </div>

            {/* 장식용 버튼 */}
            <div className="px-8 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
               <p className="text-xs text-slate-400 font-bold max-w-[240px] text-center sm:text-left">
                  {language === 'ko' 
                    ? '* 포리의 AI 코어 v2.5 기반 실시간 분석 가이드입니다.' 
                    : '* Real-time analysis guide based on Pori AI Core v2.5.'}
               </p>
               <motion.button 
                 onClick={() => onStart?.()}
                 whileHover={{ scale: 1.05, x: 5 }}
                 whileTap={{ scale: 0.95 }}
                 className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 cursor-pointer"
               >
                 <span>{language === 'ko' ? '포리와 시작하기' : 'Start with Pori'}</span>
                 <ChevronRight size={14} strokeWidth={3} />
               </motion.button>
            </div>
          </div>

          {/* 코너 데코 배경 아이콘 */}
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] select-none pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
             <Image
                src="/icon.png"
                alt=""
                width={256}
                height={256}
                className="w-64 h-64 grayscale"
             />
          </div>
        </motion.div>
      </div>

      {/* 부유 파티클 (배경용) */}
      {[...Array(6)].map((_, i) => (
        <motion.div 
          key={i}
          animate={{ 
            y: [0, -40, 0],
            x: [0, (i % 2 === 0 ? 20 : -20), 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i }}
          className="absolute w-2 h-2 rounded-full bg-emerald-400 blur-[1px] pointer-events-none"
          style={{ 
            left: `${15 + i * 15}%`, 
            top: `${20 + (i * 12)}%` 
          }}
        />
      ))}
    </section>
  );
}

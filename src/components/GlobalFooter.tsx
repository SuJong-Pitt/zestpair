"use client";

import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import { BrandLogo, BrandName } from "@/components/BrandAssets";
import { Mail, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GlobalFooter() {
  const { language } = useBasketStore();
  const t = UI_TRANSLATIONS[language];

  return (
    <footer className="relative pt-28 pb-14 overflow-hidden bg-[#030712]">
      {/* ✨ 배경 글로우 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 상단 분리선 글로우 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        {/* 좌측 에메랄드 오브 */}
        <div className="absolute top-12 left-[10%] w-[400px] h-[400px] bg-emerald-500/[0.04] blur-[100px] rounded-full" />
        {/* 우측 앰버 오브 */}
        <div className="absolute top-8 right-[10%] w-[350px] h-[350px] bg-amber-500/[0.04] blur-[100px] rounded-full" />
        {/* 하단 중앙 글로우 */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/[0.03] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── 메인 컨텐츠 그리드 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-6 items-start mb-16">

          {/* 🦾 1. 브랜드 영역 */}
          <motion.div
            className="lg:col-span-4 flex flex-col items-center lg:items-start gap-5 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <BrandLogo size={34} />
              <BrandName size="text-3xl" />
            </div>
            <p className="text-slate-500 text-sm font-medium leading-[1.8] max-w-[260px]">
              {language === "ko"
                ? "AI 기술을 통해 당신의 건강한\n영양제 생활을 돕는 고감도\n시너지 가이드."
                : "A high-sensitivity synergy guide helping your healthy supplement life through AI technology."}
            </p>

            {/* 브랜드 태그 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
                {language === "ko" ? "서비스 운영 중" : "Service Active"}
              </span>
            </div>
          </motion.div>

          {/* 💌 2. 문의 카드 영역 */}
          <motion.div
            className="lg:col-span-4 flex flex-col items-center lg:items-start gap-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* 섹션 라벨 */}
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-[1.5px] bg-emerald-500/60 rounded-full" />
              <span className="text-[10px] font-black text-emerald-400/70 uppercase tracking-[0.35em]">
                {language === "ko" ? "문의 사항" : "Inquiry"}
              </span>
            </div>

            {/* Email 카드 */}
            <motion.a
              href="mailto:admin@zestpair.com"
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.975 }}
              className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl w-full max-w-[320px] lg:max-w-none overflow-hidden cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* 호버 글로우 오버레이 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.02) 100%)" }}
              />
              {/* 좌측 컬러 바 */}
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-emerald-400/0 via-emerald-400/60 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* 아이콘 */}
              <div className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.06) 100%)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: "0 0 16px rgba(16,185,129,0.3)" }}
                />
                <Mail size={17} className="text-emerald-400 relative z-10" />
              </div>

              {/* 텍스트 */}
              <div className="flex flex-col items-start relative z-10 flex-1 min-w-0">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-0.5">{t.common.inquiry}</span>
                <span className="text-[13px] font-black text-white/90 group-hover:text-emerald-300 transition-colors duration-300 tracking-tight truncate w-full">
                  admin@zestpair.com
                </span>
              </div>

              <ArrowRight
                size={15}
                className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300 relative z-10 flex-shrink-0"
              />
            </motion.a>

            {/* KakaoTalk 카드 */}
            <motion.a
              href="http://pf.kakao.com/_stxouX/chat"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.975 }}
              className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl w-full max-w-[320px] lg:max-w-none overflow-hidden cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* 호버 글로우 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: "linear-gradient(135deg, rgba(250,225,0,0.06) 0%, rgba(250,225,0,0.02) 100%)" }}
              />
              {/* 좌측 컬러 바 */}
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-[#FAE100]/0 via-[#FAE100]/70 to-[#FAE100]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* 아이콘 */}
              <div className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ background: "linear-gradient(135deg, rgba(250,225,0,0.15) 0%, rgba(250,225,0,0.05) 100%)", border: "1px solid rgba(250,225,0,0.2)" }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: "0 0 16px rgba(250,225,0,0.25)" }}
                />
                <img src="/icons/kakao.svg" className="w-5 h-5 relative z-10" alt="Kakao" />
              </div>

              {/* 텍스트 */}
              <div className="flex flex-col items-start relative z-10 flex-1 min-w-0 text-left">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-0.5">{t.common.kakaoInquiry}</span>
                <span className="text-[13px] font-black text-white/90 group-hover:text-[#FAE100] transition-colors duration-300 tracking-tight">
                  {t.common.kakaoChannel}
                </span>
              </div>

              <ArrowRight
                size={15}
                className="text-slate-600 group-hover:text-[#FAE100] group-hover:translate-x-1 transition-all duration-300 relative z-10 flex-shrink-0"
              />
            </motion.a>
          </motion.div>

          {/* 🛡️ 3. 안내 사항 */}
          <motion.div
            className="lg:col-span-4 flex flex-col items-center lg:items-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* 섹션 라벨 */}
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-[1.5px] bg-amber-500/60 rounded-full" />
              <span className="text-[10px] font-black text-amber-400/70 uppercase tracking-[0.35em]">
                {language === "ko" ? "안내 사항" : "Notice"}
              </span>
            </div>

            {/* 면책 카드 */}
            <div
              className="relative p-6 rounded-2xl w-full max-w-[320px] lg:max-w-none overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* 코너 장식 */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-60"
                style={{ background: "radial-gradient(circle at top right, rgba(245,158,11,0.08) 0%, transparent 70%)" }}
              />

              {/* 아이콘 + 제목 */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Shield size={13} className="text-amber-400" />
                </div>
                <span className="text-[12px] font-black text-slate-300 tracking-tight">
                  {t.common.medicalDisclaimerTitle}
                </span>
              </div>

              <p className="text-slate-500 text-[11px] leading-[1.85] font-medium">
                {t.common.medicalDisclaimerBody}
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── 하단 저작권 바 ── */}
        <div
          className="relative pt-8 flex flex-col md:flex-row items-center justify-between gap-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* 중앙 그래디언트 라인 장식 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <p className="text-[10px] text-slate-600 font-bold tracking-[0.25em] uppercase">
            © 2026 ZESTPAIR. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
            <Link 
              href="/privacy"
              className="hover:text-emerald-400 cursor-pointer transition-colors duration-300 relative group"
            >
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-500 transition-all group-hover:w-full" />
            </Link>
            <Link 
              href="/terms"
              className="hover:text-emerald-400 cursor-pointer transition-colors duration-300 relative group"
            >
              Terms of Service
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-500 transition-all group-hover:w-full" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

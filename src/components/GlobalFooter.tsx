"use client";

import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import { BrandLogo, BrandName } from "@/components/BrandAssets";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalFooter() {
  const { language } = useBasketStore();
  const t = UI_TRANSLATIONS[language];

  return (
    <footer className="relative pt-24 pb-12 border-t border-white/5 bg-[#030712] overflow-hidden">
      {/* 🔮 배경 장식 (Subtle Glow & Divider) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start mb-20 text-center lg:text-left">
          
          {/* 🦾 1. 브랜드 정체성 영역 (4/12) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-5">
            <div className="flex items-center gap-3">
              <BrandLogo size={32} />
              <BrandName size="text-3xl" />
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              {language === 'ko' 
                ? 'AI 기술을 통해 당신의 건강한 영양제 생활을 돕는 고감도 시너지 가이드.' 
                : 'A high-sensitivity synergy guide helping your healthy supplement life through AI technology.'}
            </p>
          </div>

          {/* 💌 2. 프리미엄 커넥션 카드 (문의하기) (4/12) */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-3 w-full">
            <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.3em]">
              {language === 'ko' ? '문의 사항' : 'Inquiry'}
            </span>
            
            {/* Email Inquiry */}
            <motion.a
                href="mailto:admin@zestpair.com"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-3 px-6 py-4 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl transition-all hover:bg-white/5 hover:border-white/20 shadow-2xl w-full max-w-[300px] lg:max-w-none"
            >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <Mail size={18} />
                </div>
                <div className="flex flex-col items-start pr-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{t.common.inquiry}</span>
                    <span className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">admin@zestpair.com</span>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all ml-auto" />
            </motion.a>

            {/* KakaoTalk Inquiry */}
            <motion.a
                href="http://pf.kakao.com/_stxouX/chat"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-3 px-6 py-4 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl transition-all hover:bg-white/5 hover:border-white/20 shadow-2xl w-full max-w-[300px] lg:max-w-none"
            >
                <div className="w-10 h-10 rounded-2xl bg-[#FAE100]/10 flex items-center justify-center text-emerald-400 group-hover:bg-[#FAE100]/20 transition-colors">
                    <img src="/icons/kakao.svg" className="w-5 h-5" alt="Kakao" />
                </div>
                <div className="flex flex-col items-start pr-4 text-left">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{t.common.kakaoInquiry}</span>
                    <span className="text-sm font-black text-white group-hover:text-[#FAE100] transition-colors tracking-tight">{t.common.kakaoChannel}</span>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-[#FAE100] group-hover:translate-x-1 transition-all ml-auto" />
            </motion.a>
          </div>

          {/* 🛡️ 3. 면책조항 아카이브 (4/12) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-4">
            <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.3em]">
                {language === 'ko' ? '안내 사항' : 'Notice'}
            </span>
            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-slate-500 text-[11px] leading-relaxed font-medium">
                <strong className="text-slate-400 block mb-1.5 font-black">{t.common.medicalDisclaimerTitle}</strong>
                {t.common.medicalDisclaimerBody}
            </div>
          </div>
        </div>

        {/* 📋 하단 저작권 및 법적 공지 영역 */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">
            © 2026 ZESTPAIR. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

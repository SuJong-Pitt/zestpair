"use client";

import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";

export default function GlobalFooter() {
  const { language } = useBasketStore();
  const t = UI_TRANSLATIONS[language];

  return (
    <footer className="py-24 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* 강조된 면책 조항 박스 */}
        <div className="inline-block p-8 md:p-10 rounded-[2.5rem] bg-amber-50/40 border border-amber-100 mb-12 max-w-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 border border-amber-200 mb-2">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em]">Medical Disclaimer</span>
            </div>
            <h3 className="text-slate-900 font-extrabold text-lg md:text-xl tracking-tight">
              {t.common.medicalDisclaimerTitle}
            </h3>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
              {t.common.medicalDisclaimerBody}
            </p>
            {language === 'ko' && (
              <p className="text-slate-400 text-xs mt-2 italic">
                ZestPair is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            )}
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100">
          <p className="text-[10px] text-slate-300 font-black tracking-[0.3em] uppercase">
            © 2026 ZESTPAIR. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}

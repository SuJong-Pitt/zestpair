"use client";

import { motion } from "framer-motion";
import { Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { BrandLogo, BrandName } from "@/components/BrandAssets";
import { useBasketStore } from "@/store/basketStore";

/**
 * ZestPair 고감도 개인정보 처리방침 페이지 (AI Core v2.5 Design ✨)
 * 1인 기업 대표님의 법적 리스크를 제거하기 위해 코다리 부장이 정성껏 다듬었습니다.
 */
export default function PrivacyPage() {
  const { language } = useBasketStore();

  const content = {
    ko: {
      title: "개인정보 처리방침",
      lastUpdated: "최종 수정일: 2026년 4월 21일",
      sections: [
        {
          title: "1. 수집하는 개인정보 항목",
          body: "ZestPair는 이용자로부터 별도의 회원가입 절차 없이 서비스를 제공하며, 원칙적으로 개인을 식별할 수 있는 정보를 수집하지 않습니다. 다만, 서비스 이용 과정에서 아래와 같은 정보가 자동으로 생성되어 수집될 수 있습니다.\n- 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보"
        },
        {
          title: "2. 개인정보의 수집 및 이용 목적",
          body: "- AI 영양제 분석 서비스 제공 및 결과 최적화\n- 서비스 이용 통계 분석 및 품질 개선\n- 부정 이용 방지 및 보안 강화"
        },
        {
          title: "3. 개인정보의 보유 및 이용 기간",
          body: "ZestPair는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다."
        },
        {
          title: "4. 개인정보의 제3자 제공",
          body: "ZestPair는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우나 법령의 규정에 의거한 경우에는 예외로 합니다."
        },
        {
          title: "5. 이용자의 권리 및 그 행사 방법",
          body: "이용자는 언제든지 자신의 개인정보(쿠키 등) 설정을 변경하거나 삭제할 수 있습니다. 문의 사항은 고객센터를 통해 연락 주시면 지체 없이 조치하겠습니다."
        }
      ]
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: April 21, 2026",
      sections: [
        {
          title: "1. Information We Collect",
          body: "ZestPair provides services without a separate sign-up process and does not collect personally identifiable information in principle. However, the following information may be automatically generated and collected during service use:\n- Service use records, access logs, cookies, access IP info"
        },
        {
          title: "2. Purpose of Collection",
          body: "- To provide and optimize AI supplement analysis results\n- To analyze service usage statistics and improve quality\n- To prevent unauthorized use and strengthen security"
        },
        {
          title: "3. Retention Period",
          body: "In principle, ZestPair destroys the information immediately after the purpose is achieved. However, if preservation is required by laws, it will be stored for the period specified by the laws."
        },
        {
          title: "4. Third-Party Provision",
          body: "ZestPair does not provide your information to third parties in principle, except when you have consented in advance or it is required by law."
        },
        {
          title: "5. User Rights",
          body: "Users can change or delete their information (cookies, etc.) settings at any time. For inquiries, please contact our support team for prompt action."
        }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-emerald-500/30">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-20">
        {/* 헤더 */}
        <div className="flex flex-col items-center mb-16">
          <Link 
            href="/"
            className="group flex items-center gap-2 mb-10 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-slate-400 hover:text-white"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>{language === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <BrandLogo size={40} />
            <BrandName size="text-4xl" />
          </div>

          <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Shield size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Legal Document</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter mb-4 text-center">
            {t.title}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {t.lastUpdated}
          </p>
        </div>

        {/* 본문 컨텐츠 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {t.sections.map((section, idx) => (
            <section key={idx} className="group">
              <h2 className="text-xl font-black mb-4 flex items-center gap-3 text-emerald-400/90 group-hover:text-emerald-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                {section.title}
              </h2>
              <div 
                className="text-slate-400 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-all"
              >
                {section.body}
              </div>
            </section>
          ))}

          {/* 문의처 */}
          <section className="pt-8 border-t border-white/10">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-emerald-500/20 text-center">
              <h3 className="text-lg font-black mb-3">
                {language === 'ko' ? '문의 사항이 있으신가요?' : 'Have any questions?'}
              </h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                {language === 'ko' 
                  ? '제스트페어의 개인정보 처리와 관련하여 궁금한 점이 있다면 언제든 문의해 주세요.'
                  : 'If you have any questions regarding the processing of personal information, please feel free to contact us.'}
              </p>
              <a 
                href="mailto:admin@zestpair.com"
                className="inline-flex items-center px-8 py-3 rounded-full bg-emerald-500 text-[#030712] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.4)]"
              >
                admin@zestpair.com
              </a>
            </div>
          </section>
        </motion.div>

        {/* 푸터 카피 */}
        <div className="mt-24 text-center">
          <p className="text-[10px] text-slate-700 font-bold tracking-[0.25em] uppercase">
            © 2026 ZESTPAIR. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}

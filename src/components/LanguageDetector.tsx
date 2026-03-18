"use client";

import { useEffect } from "react";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";

/**
 * 사용자의 위치(IP 주소) 또는 브라우저 설정을 기반으로 
 * 언어를 자동으로 감지하여 초기 설정하고, 문서 타이틀을 동기화하는 컴포넌트입니다.
 */
export default function LanguageDetector() {
    const { language, setLanguage } = useBasketStore();

    // 언어 변경 시 문서 타이틀 동기화
    useEffect(() => {
        if (typeof document !== "undefined") {
            document.title = UI_TRANSLATIONS[language].metadata.title;
        }
    }, [language]);

    useEffect(() => {
        const detectLanguage = async () => {
            // 이전에 언어 감지가 성공적으로 완료되었는지 확인 (한 번만 실행되도록 보장)
            const isDetected = localStorage.getItem("zestpair-language-detected");
            if (isDetected) return;

            try {
                // 1. 타임존(Timezone)으로 1차 판단 (가장 빠르고 비용 없음)
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (timeZone === "Asia/Seoul") {
                    setLanguage("ko");
                    localStorage.setItem("zestpair-language-detected", "true");
                    return;
                }

                // 2. IP 위치 정보 API를 통한 정밀 분석 (한국인 경우 ko, 그 외 en)
                // ipapi.co는 무료 계층에서 일정 횟수 호출이 가능합니다.
                const res = await fetch("https://ipapi.co/json/");
                if (res.ok) {
                    const data = await res.json();
                    if (data.country_code === "KR") {
                        setLanguage("ko");
                    } else {
                        setLanguage("en");
                    }
                    localStorage.setItem("zestpair-language-detected", "true");
                    return;
                }
                
                // 3. 브라우저 언어 설정 참고 (API 실패 시)
                const userLang = navigator.language.toLowerCase();
                if (userLang.startsWith("ko")) {
                    setLanguage("ko");
                } else {
                    setLanguage("en");
                }
                localStorage.setItem("zestpair-language-detected", "true");

            } catch (err) {
                console.error("Language detection failed:", err);
                // 오류 시 기본적인 브라우저 선호 언어 따름
                const userLang = navigator.language.toLowerCase();
                if (userLang.startsWith("ko")) {
                    setLanguage("ko");
                } else {
                    setLanguage("en");
                }
                localStorage.setItem("zestpair-language-detected", "true");
            }
        };

        detectLanguage();
    }, [setLanguage]);

    return null;
}

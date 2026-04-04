import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 🎨 공유용 파라미터 인코딩 (Base64)
 * UUID 대신 슬러그를 사용하여 URL 길이를 획기적으로 줄입니다.
 */
export function encodeShareParams(slugs: string[]): string {
  try {
    const slugStr = slugs.join(',');
    // 브라우저 호환성을 위해 btoa 사용 (UTF-8 대응을 위해 encodeURIComponent 활용)
    return btoa(encodeURIComponent(slugStr));
  } catch (err) {
    console.error("Encoding error:", err);
    return "";
  }
}

/**
 * 🎨 공유용 파라미터 디코딩
 */
export function decodeShareParams(encoded: string): string[] {
  try {
    if (!encoded) return [];
    const decodedStr = decodeURIComponent(atob(encoded));
    return decodedStr.split(',').filter(Boolean);
  } catch (err) {
    console.error("Decoding error:", err);
    return [];
  }
}

/**
 * 점수별로 카카오톡 공유에 쓰일 동적 이미지와 메시지를 가져옵니다.
 */
export function getKakaoShareDetails(score: number, language: string) {
    let imageFileName, customTitle, description;

    if (score === 100) {
        imageFileName = "pori-kakao-100.png";
        customTitle = language === 'ko' ? "우와! 영양제 스승님!" : "You are a master!";
        description = language === 'ko' 
            ? "100점 만점에 100점! 흠잡을 데 없는 완벽한 짝꿍이에요. 이대로 쭉 드세요! 👍" 
            : "Perfect match! Keep it up!";
    } else if (score >= 90) {
        imageFileName = "pori-kakao-90.png";
        customTitle = language === 'ko' ? "찰떡궁합이에요!" : "Great match!";
        description = language === 'ko' 
            ? "서로 돕는 훌륭한 시너지 효과! 내 몸을 아끼는 최고의 선택이에요." 
            : "Excellent synergy!";
    } else if (score >= 80) {
        imageFileName = "pori-kakao-80.png";
        customTitle = language === 'ko' ? "아주 좋아요!" : "Very good!";
        description = language === 'ko' 
            ? "서로 든든하게 밀어주는 조합이에요. 매일 챙겨 먹기 딱 좋네요!" 
            : "Great daily combo!";
    } else if (score >= 70) {
        imageFileName = "pori-kakao-70.png";
        customTitle = language === 'ko' ? "무난하고 편안해요!" : "Solid!";
        description = language === 'ko' 
            ? "크게 부딪히는 성분 없이 매일매일 속 편하게 먹기 좋은 조합이에요." 
            : "Comfortable match without major conflicts.";
    } else if (score >= 60) {
        imageFileName = "pori-kakao-60.png";
        customTitle = language === 'ko' ? "어라? 살짝 아쉬워요!" : "Slightly lacking!";
        description = language === 'ko' 
            ? "나쁘진 않지만... 같이 먹었을 때 큰 시너지가 나지는 않는 조합이에요." 
            : "Not bad, but not much synergy.";
    } else if (score >= 50) {
        imageFileName = "pori-kakao-50.png";
        customTitle = language === 'ko' ? "잠깐, 서로 눈치 보고 있어요!" : "Watch out!";
        description = language === 'ko' 
            ? "같이 먹으면 한쪽 영양소의 흡수율이 슬쩍 떨어질 수 있어요. 확인이 필요해요!" 
            : "Absorption might drop. Needs checking!";
    } else if (score >= 40) {
        imageFileName = "pori-kakao-40.png";
        customTitle = language === 'ko' ? "헉! 영양소가 새고 있어요!" : "Nutrients leaking!";
        description = language === 'ko' 
            ? "이렇게 같이 드시면 기껏 먹은 영양제가 몸 밖으로 빠져나갈 수 있어요!" 
            : "You might lose nutrients taking them together.";
    } else if (score >= 30) {
        imageFileName = "pori-kakao-30.png";
        customTitle = language === 'ko' ? "삑! 따로 드시는 게 좋아요!" : "Better separate!";
        description = language === 'ko' 
            ? "서로 너무 안 맞아요! 아침과 저녁으로 시간차를 두고 따로 챙겨 드세요." 
            : "They don't match well! Take at different times.";
    } else if (score >= 20) {
        imageFileName = "pori-kakao-20.png";
        customTitle = language === 'ko' ? "삐용삐용! 과유불급이에요!" : "Too much!";
        description = language === 'ko' 
            ? "성분이 너무 겹치거나 부딪혀서, 간과 신장이 몹시 피곤해하고 있어요!" 
            : "Overlapping components might tax your liver/kidneys!";
    } else if (score >= 10) {
        imageFileName = "pori-kakao-10.png";
        customTitle = language === 'ko' ? "흑흑... 몸이 힘들어해요!" : "Terrible match!";
        description = language === 'ko' 
            ? "영양을 채우려다 오히려 몸을 긁어먹는 조합이에요. 당장 스케줄을 바꿔주세요!" 
            : "Change your supplement schedule immediately!";
    } else {
        imageFileName = "pori-kakao-0.png";
        customTitle = language === 'ko' ? "꼬르륵... 최악의 궁합!" : "Worst match!";
        description = language === 'ko' 
            ? "절대 같이 드시지 마세요! 약통을 당장 멀리멀리 떨어뜨려 놓으셔야 해요!" 
            : "NEVER take these together!";
    }

    const titlePrefix = language === 'ko' 
        ? `🚨 내 약통 점수는 ${score}점!\n` 
        : `🚨 Match Score: ${score}pts!\n`;
    
    const title = titlePrefix + customTitle;

    return { imageFileName, title, description };
}

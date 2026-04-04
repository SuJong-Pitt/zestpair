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
        customTitle = language === 'ko' ? "완벽한 조합!" : "Perfect combo!";
        description = language === 'ko' ? "100점 만점! 이 조합 그대로 유지하세요." : "Flawless. Keep this up.";
    } else if (score >= 90) {
        imageFileName = "pori-kakao-90.png";
        customTitle = language === 'ko' ? "찰떡궁합!" : "Great match!";
        description = language === 'ko' ? "시너지 최고. 매일 챙겨드세요." : "Excellent synergy. Take daily.";
    } else if (score >= 80) {
        imageFileName = "pori-kakao-80.png";
        customTitle = language === 'ko' ? "좋은 조합!" : "Good combo!";
        description = language === 'ko' ? "서로 돕는 안정적인 조합이에요." : "Stable and supportive combination.";
    } else if (score >= 70) {
        imageFileName = "pori-kakao-70.png";
        customTitle = language === 'ko' ? "무난해요." : "Solid.";
        description = language === 'ko' ? "큰 충돌 없이 편하게 먹을 수 있어요." : "No major conflicts. Comfortable.";
    } else if (score >= 60) {
        imageFileName = "pori-kakao-60.png";
        customTitle = language === 'ko' ? "살짝 아쉬워요." : "Could be better.";
        description = language === 'ko' ? "시너지가 약해요. 조합을 재검토해보세요." : "Low synergy. Consider adjusting.";
    } else if (score >= 50) {
        imageFileName = "pori-kakao-50.png";
        customTitle = language === 'ko' ? "주의 필요." : "Watch out.";
        description = language === 'ko' ? "흡수율이 떨어질 수 있어요. 확인하세요." : "Absorption may drop. Check timing.";
    } else if (score >= 40) {
        imageFileName = "pori-kakao-40.png";
        customTitle = language === 'ko' ? "영양소 손실!" : "Nutrient loss!";
        description = language === 'ko' ? "같이 드시면 영양이 빠져나갈 수 있어요." : "Nutrients may be wasted together.";
    } else if (score >= 30) {
        imageFileName = "pori-kakao-30.png";
        customTitle = language === 'ko' ? "따로 드세요." : "Take separately.";
        description = language === 'ko' ? "아침·저녁으로 나눠서 드세요." : "Split morning and evening doses.";
    } else if (score >= 20) {
        imageFileName = "pori-kakao-20.png";
        customTitle = language === 'ko' ? "성분 충돌!" : "Conflict!";
        description = language === 'ko' ? "간·신장에 부담이 될 수 있어요." : "May burden liver and kidneys.";
    } else if (score >= 10) {
        imageFileName = "pori-kakao-10.png";
        customTitle = language === 'ko' ? "위험해요." : "Risky combo.";
        description = language === 'ko' ? "스케줄을 지금 바로 바꾸세요." : "Change your schedule now.";
    } else {
        imageFileName = "pori-kakao-0.png";
        customTitle = language === 'ko' ? "최악의 궁합!" : "Worst match!";
        description = language === 'ko' ? "절대 같이 드시지 마세요." : "Never take these together.";
    }

    const scoreIcon = 
        score >= 100 ? '💎' :
        score >= 90 ? '🏆' :
        score >= 80 ? '✨' :
        score >= 70 ? '👍' :
        score >= 60 ? '🤔' :
        score >= 50 ? '⚠️' :
        score >= 40 ? '🚧' :
        score >= 30 ? '❌' :
        score >= 20 ? '⛔' :
        score >= 10 ? '💀' : '☠️';

    const titlePrefix = language === 'ko' 
        ? `${scoreIcon} 영양제 궁합 ${score}점\n` 
        : `${scoreIcon} Supplement Score: ${score}pts\n`;
    
    const title = titlePrefix + customTitle;

    return { imageFileName, title, description };
}

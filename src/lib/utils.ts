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
export function getKakaoShareDetails(score: number, language: string, ingredientNames?: string) {
  let imageFileName, customTitle, description;

  if (score === 100) {
    imageFileName = "pori-kakao-100.png";
    customTitle = language === 'ko' ? "완벽한 조합!" : language === 'ja' ? "完璧な組み合わせ！" : language === 'zh' ? "完美的搭配！" : "Perfect combo!";
    description = language === 'ko' ? "100점 만점! 이 조합 그대로 유지하세요." : language === 'ja' ? "100点満点！この組み合わせを維持してください。" : language === 'zh' ? "100分满分！请保持这个组合。" : "Flawless. Keep this up.";
  } else if (score >= 90) {
    imageFileName = "pori-kakao-90.png";
    customTitle = language === 'ko' ? "찰떡궁합!" : language === 'ja' ? "相性抜群！" : language === 'zh' ? "绝佳拍档！" : "Great match!";
    description = language === 'ko' ? "시너지 최고. 매일 챙겨드세요." : language === 'ja' ? "シナジー最高。毎日摂取してください。" : language === 'zh' ? "协同效应极佳。请坚持每天服用。" : "Excellent synergy. Take daily.";
  } else if (score >= 80) {
    imageFileName = "pori-kakao-80.png";
    customTitle = language === 'ko' ? "좋은 조합!" : language === 'ja' ? "良い組み合わせ！" : language === 'zh' ? "不错的组合！" : "Good combo!";
    description = language === 'ko' ? "서로 돕는 안정적인 조합이에요." : language === 'ja' ? "互いに助け合う安定した組み合わせです。" : language === 'zh' ? "互相促进的稳定组合。" : "Stable and supportive combination.";
  } else if (score >= 70) {
    imageFileName = "pori-kakao-70.png";
    customTitle = language === 'ko' ? "무난해요." : language === 'ja' ? "無難な組み合わせです。" : language === 'zh' ? "中规中矩。" : "Solid.";
    description = language === 'ko' ? "큰 충돌 없이 편하게 먹을 수 있어요." : language === 'ja' ? "大きな衝突なく安心して摂取できます。" : language === 'zh' ? "没有明显冲突，可以放心服用。" : "No major conflicts. Comfortable.";
  } else if (score >= 60) {
    imageFileName = "pori-kakao-60.png";
    customTitle = language === 'ko' ? "살짝 아쉬워요." : language === 'ja' ? "少し残念です。" : language === 'zh' ? "略显遗憾。" : "Could be better.";
    description = language === 'ko' ? "시너지가 약해요. 조합을 재검토해보세요." : language === 'ja' ? "シナジーが弱いです。組み合わせを再検討してください。" : language === 'zh' ? "协同效应较弱。建议重新考虑组合。" : "Low synergy. Consider adjusting.";
  } else if (score >= 50) {
    imageFileName = "pori-kakao-50.png";
    customTitle = language === 'ko' ? "주의 필요." : language === 'ja' ? "注意が必要。" : language === 'zh' ? "需要注意。" : "Watch out.";
    description = language === 'ko' ? "흡수율이 떨어질 수 있어요. 확인하세요." : language === 'ja' ? "吸収率が低下する可能性があります。確認してください。" : language === 'zh' ? "吸收率可能会降低。请确认。" : "Absorption may drop. Check timing.";
  } else if (score >= 40) {
    imageFileName = "pori-kakao-40.png";
    customTitle = language === 'ko' ? "영양소 손실!" : language === 'ja' ? "栄養素の損失！" : language === 'zh' ? "营养流失！" : "Nutrient loss!";
    description = language === 'ko' ? "같이 드시면 영양이 빠져나갈 수 있어요." : language === 'ja' ? "一緒に摂取すると栄養が損なわれる可能性があります。" : language === 'zh' ? "同时服用可能会导致营养流失。" : "Nutrients may be wasted together.";
  } else if (score >= 30) {
    imageFileName = "pori-kakao-30.png";
    customTitle = language === 'ko' ? "따로 드세요." : language === 'ja' ? "別々に摂取してください。" : language === 'zh' ? "请分开服用。" : "Take separately.";
    description = language === 'ko' ? "아침·저녁으로 나눠서 드세요." : language === 'ja' ? "朝・晩に分けて摂取してください。" : language === 'zh' ? "请分早晚服用。" : "Split morning and evening doses.";
  } else if (score >= 20) {
    imageFileName = "pori-kakao-20.png";
    customTitle = language === 'ko' ? "성분 충돌!" : language === 'ja' ? "成分の衝突！" : language === 'zh' ? "成分冲突！" : "Conflict!";
    description = language === 'ko' ? "간·신장에 부담이 될 수 있어요." : language === 'ja' ? "肝臓・腎臓に負担がかかる可能性があります。" : language === 'zh' ? "可能会加重肝脏或肾脏负担。" : "May burden liver and kidneys.";
  } else if (score >= 10) {
    imageFileName = "pori-kakao-10.png";
    customTitle = language === 'ko' ? "위험해요." : language === 'ja' ? "危険です。" : language === 'zh' ? "危险组合。" : "Risky combo.";
    description = language === 'ko' ? "스케줄을 지금 바로 바꾸세요." : language === 'ja' ? "今すぐスケジュールを変更してください。" : language === 'zh' ? "请立即调整服用计划。" : "Change your schedule now.";
  } else {
    imageFileName = "pori-kakao-0.png";
    customTitle = language === 'ko' ? "최악의 궁합!" : language === 'ja' ? "最悪の相性！" : language === 'zh' ? "最差的搭配！" : "Worst match!";
    description = language === 'ko' ? "절대 같이 드시지 마세요." : language === 'ja' ? "絶対に一緒に摂取しないでください。" : language === 'zh' ? "绝对不要同时服用。" : "Never take these together.";
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

  // 성분명 가공 (너무 길면 'A, B 외 N건'으로 요약)
  let processedNames = "";
  if (ingredientNames) {
    const namesArray = ingredientNames.split(" + ");
    if (namesArray.length > 2) {
      processedNames = language === 'ko' 
        ? `${namesArray[0]}, ${namesArray[1]} 외 ${namesArray.length - 2}건`
        : language === 'ja'
        ? `${namesArray[0]}, ${namesArray[1]} 他 ${namesArray.length - 2}件`
        : language === 'zh'
        ? `${namesArray[0]}, ${namesArray[1]} 等 ${namesArray.length - 2}项`
        : `${namesArray[0]}, ${namesArray[1]} & ${namesArray.length - 2} others`;
    } else {
      processedNames = ingredientNames;
    }
  }

  const title = language === 'ko' 
    ? `${processedNames ? `${processedNames}의 ` : ""}궁합 점수 ${score}점! ${scoreIcon}`
    : language === 'ja'
    ? `${processedNames ? `${processedNames}の` : ""}相性スコア ${score}点！ ${scoreIcon}`
    : language === 'zh'
    ? `${processedNames ? `${processedNames}的` : ""}协同评分 ${score}分！ ${scoreIcon}`
    : `${processedNames ? `${processedNames}: ` : ""}Synergy Score ${score}pts! ${scoreIcon}`;

  return { imageFileName, title, description };
}

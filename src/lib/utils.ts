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

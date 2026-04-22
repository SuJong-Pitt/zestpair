import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Ingredient, InteractionResult, ScheduleSlot } from "@/types/database";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

/**
 * 사용자의 의도(예: "잠이 안 와", "피곤해")를 분석하여 등록된 성분 중 가장 적합한 성분들을 매칭합니다.
 * (할당량 최적화를 위해 최소한의 성분 정보만 사용하여 호출합니다.)
 */
export async function matchIngredientsByIntent(
    intent: string,
    availableIngredients: { id: string, name: string, short_description: string }[]
): Promise<string[]> {
    const ingredientsContext = availableIngredients.map(ing => `- ${ing.name} (ID: ${ing.id}): ${ing.short_description}`).join('\n');
    
    const prompt = `
You are an expert nutritionist AI for "ZestPair".
Analyze the user's intent and select the 2-3 most appropriate ingredient IDs from the list below.

[Available Ingredients]
${ingredientsContext}

[User Intent]
"${intent}"

[Rules]
1. Select only the most relevant 2-3 ingredients.
2. Return ONLY a JSON array of strings containing the ingredient IDs.
3. No explanation, no other text.

Example: ["uuid-1", "uuid-2"]
`;

    try {
        console.log(`[AI Match] Analyzing intent: "${intent}"`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // JSON 추출 로직 (마크다운 등 제거)
        text = text.replace(/```json\n?/, "").replace(/\n?```/, "").replace(/```\n?/, "").trim();
        const ingredientIds = JSON.parse(text);
        
        console.log(`[AI Match] Successfully matched ${ingredientIds.length} ingredients.`);
        return Array.isArray(ingredientIds) ? ingredientIds : [];
    } catch (error) {
        console.error("[AI Match] Error matching ingredients:", error);
        return [];
    }
}

/**
 * 재시도 로직을 포함한 Gemini 호출 래퍼 (Exponential Backoff ✨)
 */
async function callGeminiWithRetry(prompt: string, retries = 2, delay = 2000): Promise<string> {
    try {
        console.log(`[Gemini API] Requesting content... (Prompt length: ${prompt.length})`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        console.log(`[Gemini API] Success! Response received.`);
        return text;
    } catch (error: any) {
        // 429 (Too Many Requests) 에러 발생 시 재시도
        if (retries > 0 && (error?.status === 429 || error?.message?.includes("429"))) {
            console.warn(`[Kodari Alert] Gemini Quota hit! Retrying in ${delay}ms... (Remains: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callGeminiWithRetry(prompt, retries - 1, delay * 2);
        }
        throw error;
    }
}

/**
 * Gemini를 사용하여 최적의 영양제 복용 시간표를 생성합니다. (AI Core v2.5)
 */
export async function generateDosageSchedule(
    ingredients: Ingredient[],
    interactions: { synergies: InteractionResult[], cautions: InteractionResult[], conflicts: InteractionResult[] },
    language: "ko" | "en"
): Promise<ScheduleSlot[]> {
    const prompt = `
You are an expert nutritionist and pharmacist AI for ZestPair.
Your task is to create the MOST OPTIMAL daily supplement intake schedule based on the provided list of ingredients and their interactions.

## Ingredients to analyze:
${ingredients.map(ing => `- ${ing.name} (${ing.name_en}): Recommended time is ${ing.dosage_time}`).join("\n")}

## Known Interactions:
- Synergies: ${interactions.synergies.map(s => `${s.pair[0].name}+${s.pair[1].name}`).join(", ") || "None"}
- Cautions: ${interactions.cautions.map(c => `${c.pair[0].name}+${c.pair[1].name}`).join(", ") || "None"}
- Conflicts: ${interactions.conflicts.map(c => `${c.pair[0].name}+${c.pair[1].name}`).join(", ") || "None"}

## Rules:
1. Group ingredients into: morning_before (empty stomach), morning_after, lunch_after, evening_after, night_before, anytime.
2. IMPORTANT: If there is a CAUTION or CONFLICT between two ingredients, separate them into different time slots (e.g., one in morning, one in evening).
3. Synergies should be taken together if their recommended dosage times allow.
4. For each time slot, provide a short "ai_insight" explaining WHY this grouping is good (in ${language === 'ko' ? 'Korean' : 'English'}).
5. Keep it professional, scientific, but encouraging.

## Return Format (JSON only):
[
  {
    "time_id": "morning_before",
    "items": [{"ingredient_id": "...", "name": "...", "icon": "...", "note": "..."}],
    "ai_insight": "..."
  },
  ...
]

Only return the JSON array. Do not include markdown code blocks.
`;

    try {
        let text = await callGeminiWithRetry(prompt);
        
        // Remove markdown code blocks if present
        if (text.startsWith("```json")) {
            text = text.replace(/```json\n?/, "").replace(/\n?```/, "");
        } else if (text.startsWith("```")) {
            text = text.replace(/```\n?/, "").replace(/\n?```/, "");
        }

        const rawSchedule = JSON.parse(text) as ScheduleSlot[];
        
        // Filter out empty slots
        return rawSchedule.filter(slot => slot.items.length > 0);
    } catch (error: any) {
        // 할당량 초과 에러일 경우 워닝으로 처리
        if (error?.status === 429) {
            console.warn("Gemini Quota Exceeded. Using Fallback Schedule.");
        } else {
            console.error("Gemini Schedule Generation Failed:", error);
        }
        
        // Fallback: AI 호출 실패 시 휴리스틱 알고리즘으로 대체
        return fallbackSchedule(ingredients, language);
    }
}

function fallbackSchedule(ingredients: Ingredient[], language: "ko" | "en"): ScheduleSlot[] {
    // Simple heuristic-based fallback
    const slots: Record<string, ScheduleSlot> = {
        morning_after: { time_id: "morning_after", items: [], ai_insight: language === 'ko' ? "아침 식사 후 활력을 위해 배정되었습니다." : "Scheduled after breakfast for daily energy." },
        anytime: { time_id: "anytime", items: [], ai_insight: language === 'ko' ? "편하신 시간에 편하게 드세요." : "Take anytime at your convenience." }
    };

    ingredients.forEach(ing => {
        const item = {
            ingredient_id: ing.id,
            name: language === 'ko' ? ing.name : ing.name_en,
            icon: ing.icon_emoji,
            note: language === 'ko' ? (ing.dosage_note || "물과 함께 섭취") : (ing.dosage_note_en || "Take with water")
        };
        if (ing.dosage_time === "morning") slots.morning_after.items.push(item);
        else slots.anytime.items.push(item);
    });

    return Object.values(slots).filter(s => s.items.length > 0);
}

/**
 * Gemini를 사용하여 통합 분석(브리핑 3개 + 복용 시간표)을 한 번의 호출로 생성합니다.
 * (Unified Intelligence Core v1.0 ✨)
 */
export async function generateUnifiedAnalysis(
    ingredients: Ingredient[],
    interactions: { synergies: InteractionResult[], cautions: InteractionResult[], conflicts: InteractionResult[] },
    score: number,
    language: "ko" | "en" = "ko"
): Promise<{ briefing: string[], schedule: ScheduleSlot[], isFallback: boolean }> {
    const isKo = language === 'ko';
    
    const prompt = `
You are the "Chief AI Design Director" for ZestPair.
Your task is to provide a COMPLETE ANALYSIS package:
1. Luxury Essential Briefing (3 premium points)
2. Optimal Dosage Schedule (grouped by time slots)

## Input Data:
- Ingredients: ${ingredients.map(i => isKo ? i.name : i.name_en).join(", ")}
- Score: ${score}/100
- Synergies Found: ${interactions.synergies.length}
- Cautions Found: ${interactions.cautions.length}
- Conflicts Found: ${interactions.conflicts.length}

## Style: Luxury, Professional, Scientific.
- Briefing: 3 concise, impactful points.
- Schedule: Group into morning_before, morning_after, lunch_after, evening_after, night_before, anytime.

## Return Format (Strict JSON only):
{
  "briefing": ["point1", "point2", "point3"],
  "schedule": [
    {
      "time_id": "...",
      "items": [{"ingredient_id": "...", "name": "...", "icon": "...", "note": "..."}],
      "ai_insight": "..."
    }
  ]
}

Language: ${isKo ? 'Korean' : 'English'}.
Only return the JSON. No markdown code blocks.
`;

    try {
        let text = await callGeminiWithRetry(prompt);
        text = text.replace(/```json\n?/, "").replace(/\n?```/, "").replace(/```\n?/, "").trim();
        const result = JSON.parse(text);
        
        return {
            briefing: (result.briefing && result.briefing.length > 0) ? result.briefing.slice(0, 3) : FALLBACK_BRIEFING,
            schedule: (result.schedule && result.schedule.length > 0) ? result.schedule : [],
            isFallback: false // 성공 시 false 명시 ✨
        };
    } catch (error) {
        console.warn("⚠️ [Gemini API] Unified Analysis Failed. Using Luxury Fallback Text.");
        console.error("Error Detail:", error);
        
        // 할당량 초과 시에도 럭셔리한 경험을 유지하기 위한 '품격 있는 대안' 데이터 ✨
        return {
            briefing: FALLBACK_BRIEFING,
            schedule: [],
            isFallback: true // 캐시 방지 등을 위한 플래그 추가
        };
    }
}

const FALLBACK_BRIEFING = [
    "현재 조합은 기초 대사량 증진과 세포 보호를 위한 핵심 성분들이 조화롭게 구성된 프리미엄 베이스를 갖추고 있습니다.",
    "성분 간의 흡수율을 극대화하기 위해 식사 직후 복용을 권장하며, 수분 섭취를 충분히 늘려 대사 효율을 보조하시기 바랍니다.",
    "이 구성을 4주간 유지할 경우 활력 지수의 유의미한 수치 개선과 항산화 밸런스의 정교한 최적화가 기대됩니다."
];

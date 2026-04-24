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
): Promise<{ 
    briefing: string[], 
    schedule: ScheduleSlot[], 
    recommendation_targets: string[], 
    lifestyle_guidelines: string[],
    expected_timeline: { week1: string; week2: string; week4: string; },
    isFallback: boolean 
}> {
    const isKo = language === 'ko';
    
    const prompt = `
You are the "Chief AI Design Director" for ZestPair, a premium supplement analysis service.
The user has carefully selected a set of supplements (their "Personal Basket"). 
Your mission is to ANALYZE, VALIDATE, and OPTIMIZE this specific selection.

## Goal:
- Validate the user's choices (Celebrate their selection if good, warn if risky).
- Make the user feel that THIS report is uniquely for their specific basket.
- Provide a clear, actionable intake schedule.

## Input Data:
- User's Selected Ingredients: ${ingredients.map(i => isKo ? i.name : i.name_en).join(", ")}
- Synergy Score: ${score}/100
- Detected Synergies: ${interactions.synergies.length}
- Detected Cautions: ${interactions.cautions.length}
- Detected Conflicts: ${interactions.conflicts.length}

## Style Guidelines:
- Tone: Luxury, Empowering, Clinical, Personalized.
- Reference the user's basket explicitly (e.g., "당신이 선택한 이 조합은...", "Your selected stack...").
- Do not just list facts; provide a "Briefing" that feels like a personal consultation.

## Deliverables:
1. Luxury Essential Briefing (3 premium points):
   - Point 1: Overall validation of the user's selected basket foundation.
   - Point 2: Specific synergy or caution highlights within THEIR selection.
   - Point 3: Future outlook or lifestyle advice based on this specific stack.
2. Recommended For (3 short phrases):
    - Identify who would benefit most from this specific combination (e.g., "고강도 운동을 즐기는 분", "만성 피로에 시달리는 직장인").
3. Lifestyle & Food Synergy (3 tips):
   - Habits or foods that boost the effectiveness of this specific stack.
4. 4-Week Expected Journey:
   - Predict physical changes for Week 1, Week 2, and Week 4.
5. Optimal Dosage Schedule: Group into morning_before, morning_after, lunch_after, evening_after, night_before, anytime.

## Return Format (Strict JSON only):
{
    "briefing": ["point1", "point2", "point3"],
    "recommendation_targets": ["target1", "target2", "target3"],
    "lifestyle_guidelines": ["tip1", "tip2", "tip3"],
    "expected_timeline": {
      "week1": "Short prediction",
      "week2": "Short prediction",
      "week4": "Short prediction"
    },
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
            recommendation_targets: (result.recommendation_targets && result.recommendation_targets.length > 0) ? result.recommendation_targets.slice(0, 3) : FALLBACK_TARGETS,
            lifestyle_guidelines: (result.lifestyle_guidelines && result.lifestyle_guidelines.length > 0) ? result.lifestyle_guidelines.slice(0, 3) : FALLBACK_LIFESTYLE,
            expected_timeline: result.expected_timeline || FALLBACK_TIMELINE,
            schedule: (result.schedule && result.schedule.length > 0) ? result.schedule : [],
            isFallback: false // 성공 시 false 명시 ✨
        };
    } catch (error) {
        console.warn("⚠️ [Gemini API] Unified Analysis Failed. Using Luxury Fallback Text.");
        console.error("Error Detail:", error);
        
        // 할당량 초과 시에도 럭셔리한 경험을 유지하기 위한 '품격 있는 대안' 데이터 ✨
        return {
            briefing: FALLBACK_BRIEFING,
            recommendation_targets: FALLBACK_TARGETS,
            lifestyle_guidelines: FALLBACK_LIFESTYLE,
            expected_timeline: FALLBACK_TIMELINE,
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

const FALLBACK_TARGETS = [
    "일과 후 빠른 피로 회복이 필요한 분",
    "고강도 운동이나 활동적인 라이프스타일을 즐기는 분",
    "아침 기상이 무겁고 만성적인 활력 저하를 느끼는 분"
];

const FALLBACK_LIFESTYLE = [
    "복용 전후 1시간은 카페인 섭취를 피해 흡수율을 높이세요.",
    "충분한 수분 섭취는 미네랄 대사를 원활하게 돕습니다.",
    "가벼운 스트레칭과 병행하면 근육 이완 효과가 배가됩니다."
];

const FALLBACK_TIMELINE = {
    week1: "신체 긴장 완화와 수면 질 개선 단계",
    week2: "세포 에너지 대사 활성화 및 활력 증가 단계",
    week4: "신체 밸런스 최적화 및 항산화 체계 구축 단계"
};

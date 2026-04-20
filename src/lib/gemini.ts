import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Ingredient, InteractionResult, ScheduleSlot } from "@/types/database";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // Remove markdown code blocks if present
        if (text.startsWith("```json")) {
            text = text.replace(/```json\n?/, "").replace(/\n?```/, "");
        } else if (text.startsWith("```")) {
            text = text.replace(/```\n?/, "").replace(/\n?```/, "");
        }

        const rawSchedule = JSON.parse(text) as ScheduleSlot[];
        
        // Filter out empty slots
        return rawSchedule.filter(slot => slot.items.length > 0);
    } catch (error) {
        console.error("Gemini Schedule Generation Failed:", error);
        // Fallback: simple grouping if AI fails
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

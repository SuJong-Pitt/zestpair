import { NextRequest, NextResponse } from "next/server";
import { generateDosageSchedule } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ingredients, interactions, language } = body;

        if (!ingredients || !interactions) {
            return NextResponse.json({ error: "Missing required data" }, { status: 400 });
        }

        const schedule = await generateDosageSchedule(ingredients, interactions, language || "ko");

        return NextResponse.json({ success: true, schedule });
    } catch (error) {
        console.error("API Schedule Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI is offline (No API key found)' }, { status: 503 });
    }

    const body = await req.json();
    const { selectedText, activeLens } = body;

    if (!selectedText || !activeLens) {
      return NextResponse.json({ error: 'Missing selectedText or activeLens' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // ── Lens-agnostic adaptive tutor prompt ──────────────────────────────────
    // No matter which lens is chosen (Skeptic, Teacher, Auditor, or any future
    // lens added to src/lib/lenses.ts), the AI always produces the same three
    // structured fields. Zero API changes needed for new lenses.
    const prompt = `
You are an adaptive tutor. The user has selected a Perspective Lens called "${activeLens}" and highlighted the following text:

"${selectedText}"

Regardless of the lens, you MUST return a JSON object with EXACTLY these three keys:

1. "insight"  — Analyse the text through the "${activeLens}" lens. Explain what this lens reveals that a plain reading would miss. Be concise and specific to this lens.
2. "example"  — Provide a super-simple analogy (ELI10 — Explain Like I'm 10) to make the insight immediately click. Use everyday concepts (toys, sport, cooking, etc.). Adapt the analogy to match the spirit of the "${activeLens}" lens.
3. "challenge" — Pose one Socratic question that forces the student to think MORE DEEPLY about the text from the "${activeLens}" perspective. The question must be open-ended, not answerable with yes/no.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "insight": "string",
  "example": "string",
  "challenge": "string"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const jsonResponse = JSON.parse(responseText);
      return NextResponse.json(jsonResponse);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error: any) {
    if (error?.status === 429 || error?.statusText === 'Too Many Requests') {
      console.warn('Gemini rate limit hit (/api/reader) — returning fallback.');
      return NextResponse.json({ error: 'Rate limit reached — please wait a few seconds and try again.' }, { status: 429 });
    }
    console.error("Gemini API Error (/api/reader):", error);
    return NextResponse.json({ error: 'AI is offline' }, { status: 503 });
  }
}

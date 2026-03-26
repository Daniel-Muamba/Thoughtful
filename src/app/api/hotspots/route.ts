import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI is offline (No API key found)' }, { status: 503 });
    }

    const body = await req.json();
    const { sourceText, activeLens } = body;

    if (!sourceText || !activeLens || activeLens === 'None') {
      return NextResponse.json({ error: 'Missing sourceText or activeLens' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
You are a mentor analyzing a text through the lens of a "${activeLens}".
Read the following text:
"${sourceText}"

Your task is to identify 3 specific brief exact quotes (1-5 words long) from the text that represent assumptions, core concepts, logical leaps, or areas where the "${activeLens}" lens would have questions.

For each phrase, provide:
1. "textToHighlight": The exact phrase as it appears in the text (case-insensitive). MUST match the source text exactly.
2. "insight": A simple explanation of why this phrase is interesting or problematic under this lens.
3. "example": An ELI10 (Explain Like I'm 10) example using child-friendly concepts to illustrate the insight.
4. "challenge": A Socratic question to challenge the student's thinking based on this phrase.

Respond ONLY with a valid JSON Array of objects matching this schema:
[
  {
    "textToHighlight": "string",
    "insight": "string",
    "example": "string",
    "challenge": "string"
  }
]
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const jsonResponse = JSON.parse(responseText);
      return NextResponse.json(jsonResponse);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error("Gemini API Error (/api/hotspots):", error);
    return NextResponse.json({ error: 'AI is offline' }, { status: 503 });
  }
}

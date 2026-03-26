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
    // Use Gemini 1.5 Flash as requested implicitly by "Gemini Flash"
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
You are a mentor analyzing a text through the lens of a "${activeLens}".
Read the following text selected by a student:
"${selectedText}"

Your task is to provide:
1. "insight": A simple definition or explanation of the core concept in the text.
2. "example": An ELI10 (Explain Like I'm 10) example using child-friendly concepts (like lemonade stands or playgrounds).
3. "challenge": A Socratic question to challenge the student's thinking based on the text.

Respond ONLY with a valid JSON object matching this schema:
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

  } catch (error) {
    console.error("Gemini API Error (/api/reader):", error);
    return NextResponse.json({ error: 'AI is offline' }, { status: 503 });
  }
}

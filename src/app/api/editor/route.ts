import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ScaffoldNode } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI is offline (No API key found)' }, { status: 503 });
    }

    const body = await req.json();
    const { currentDraft, scaffoldNodes } = body as { currentDraft: string; scaffoldNodes: ScaffoldNode[] };

    if (!currentDraft) {
      return NextResponse.json({ error: 'Missing currentDraft' }, { status: 400 });
    }

    // Only assess if there's enough text to matter, but we'll let the model decide if it's fine.
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const formattedNodes = (scaffoldNodes || []).map(n => 
      `- Title: ${n.title}\n  Evidence: "${n.evidence_quote}"\n  Claim: ${n.student_claim}`
    ).join('\n');

    const prompt = `
You are a Socratic Gadfly reviewing a student's essay draft.
Do NOT fix the primary writing.
Your only job is to compare their current draft to their scaffolded research notes.

Here are the student's research notes:
${formattedNodes || "No research notes."}

Here is the student's current draft:
"${currentDraft}"

Task:
Analyze the draft. If the student makes a claim that is NOT supported by their research notes, or if there is a logical leap, you must output a Socratic question that points the user back to their specific research notes to reconsider their stance.

If the draft is perfectly aligned with the notes and has no logical flaws, return empty values.

Respond ONLY with a valid JSON object matching this schema:
{
  "sentence": "The specific sentence from the draft that has the logical leap (or empty string)",
  "challenge": "The Socratic question (or empty string)",
  "nodeTitle": "The title of the most relevant note (or empty string)",
  "nodeEvidence": "The evidence quote from the most relevant note (or empty string)",
  "nodeClaim": "The student claim from the most relevant note (or empty string)"
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
    console.error("Gemini API Error (/api/editor):", error);
    return NextResponse.json({ error: 'AI is offline' }, { status: 503 });
  }
}

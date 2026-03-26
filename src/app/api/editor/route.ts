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
    const { currentDraft, scaffoldNodes, sourceContent } = body as {
      currentDraft: string;
      scaffoldNodes: ScaffoldNode[];
      sourceContent?: string;
    };

    if (!currentDraft) {
      return NextResponse.json({ cards: [] });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const formattedNodes = (scaffoldNodes || []).map(n =>
      `- Title: ${n.title}\n  Evidence: "${n.evidence_quote}"\n  Claim: ${n.student_claim}`
    ).join('\n');

    // Whitespace-cleaned source, capped at 3000 chars
    const trimmedSource = (sourceContent || '').replace(/\s+/g, ' ').trim().slice(0, 3000);

    const prompt = `
You are a proactive thinking coach and writing mentor. Your job is NOT to correct grammar.
Your job is to surface specific, actionable memory prompts that help the student write a better argument.

You have THREE inputs:
=== SOURCE CONTENT (up to 3000 chars) ===
${trimmedSource || "None provided."}

=== SCAFFOLD NOTES ===
${formattedNodes || "None provided."}

=== CURRENT DRAFT (focus on the last 1-3 sentences) ===
"${currentDraft}"

=== YOUR TASK ===
Analyse the LAST 1-3 sentences of the draft. Find up to 3 high-value interventions from this priority list:

1. LOGIC_CHECK — The draft sentence contradicts or ignores a Scaffold Note claim. Point it out directly.
   Suggestion format: "Your note on [Node Title] says [Claim], but your sentence says the opposite. Which is right?"

2. EVIDENCE_GAP — The paragraph makes a broad claim, but there is a specific fact in the Source Content that would make it much stronger.
   Suggestion format: "This is thin. Remember [Fact] from your reading? It fits perfectly here."

3. BETTER_WAY — The student is explaining something complex. There is an ELI10 simplification that would make the argument clearer.
   Suggestion format: "You're overcomplicating this. Would it be clearer to say it like [ELI10]?"

4. SENTENCE_IMPROVER — A specific sentence is over 30 words long or uses unnecessary filler phrases.
   Suggestion format: "This sentence is [N] words. Can you say the same thing in 10 words? Simple is powerful."

Return ONLY the interventions that are genuinely useful. If the draft is excellent, return an empty cards array.
Return UP TO 3 cards. Never return more than 3.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "cards": [
    {
      "type": "logic_check" | "evidence_gap" | "better_way" | "sentence_improver",
      "targetSentence": "The exact sentence from the draft this card refers to (or last sentence)",
      "headline": "Short card title, max 6 words",
      "suggestion": "Your specific proactive suggestion (1-2 sentences maximum)",
      "eli10Example": "A simple ELI10 analogy if relevant to this card (or empty string)",
      "nodeTitle": "Relevant scaffold node title if applicable (or empty string)",
      "nodeEvidence": "Evidence quote from the node if applicable (or empty string)",
      "sourceFact": "A specific fact from the Source Content if applicable (or empty string)"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const jsonResponse = JSON.parse(responseText);
      // Ensure cards is always an array
      if (!Array.isArray(jsonResponse.cards)) {
        return NextResponse.json({ cards: [] });
      }
      return NextResponse.json({ cards: jsonResponse.cards.slice(0, 3) });
    } catch {
      return NextResponse.json({ cards: [] });
    }

  } catch (error: any) {
    if (error?.status === 429 || error?.statusText === 'Too Many Requests') {
      console.warn('Gemini rate limit hit (/api/editor) — skipping check.');
      return NextResponse.json({ cards: [] });
    }
    console.error("Gemini API Error (/api/editor):", error);
    return NextResponse.json({ error: 'AI is offline' }, { status: 503 });
  }
}

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
      return NextResponse.json({ error: 'Missing currentDraft' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const formattedNodes = (scaffoldNodes || []).map(n =>
      `- Title: ${n.title}\n  Evidence: "${n.evidence_quote}"\n  Claim: ${n.student_claim}`
    ).join('\n');

    // Truncate source content to a safe limit for token budget
    const trimmedSource = (sourceContent || '').slice(0, 3000);

    const prompt = `
You are a Socratic Research Assistant with a perfect memory.
Do NOT rewrite or fix the student's prose.

You have access to THREE streams of knowledge:
1. SOURCE CONTENT — the full original reading material the student studied.
2. SCAFFOLD NOTES — the structured notes they extracted from that reading.
3. CURRENT DRAFT — what the student has written so far.

=== SOURCE CONTENT (first 3000 chars) ===
${trimmedSource || "No source content provided."}

=== SCAFFOLD NOTES ===
${formattedNodes || "No scaffold notes."}

=== CURRENT DRAFT ===
"${currentDraft}"

=== YOUR TASK ===
Monitor the draft carefully. Look for ONE of these situations:
A) The student makes a broad claim that IS supported by a specific detail in the SOURCE CONTENT but that detail is NOT mentioned in their SCAFFOLD NOTES — surface it with: "How does the [Detail] from your reading support this?"
B) The student contradicts or ignores one of their SCAFFOLD NOTES — point it out with a Socratic question about that specific note.

Prioritise situation (A) — catching evidence from the source the student has forgotten.
If the draft is well-supported and coherent, return all empty strings.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "sentence": "The specific sentence from the draft being challenged (or empty string)",
  "challenge": "The Socratic question to pose to the student (or empty string)",
  "eli10Reminder": "A one-sentence ELI10 summary (Explain Like I'm 10) of the missing fact or evidence the student should recall — use very simple, everyday language. (or empty string)",
  "nodeTitle": "The title of the most relevant SCAFFOLD NOTE, if the challenge is from notes (or empty string)",
  "nodeEvidence": "The evidence quote from the most relevant note (or empty string)",
  "nodeClaim": "The student claim from the most relevant note (or empty string)",
  "sourceHint": "Use 'from_source' if the challenge points to SOURCE CONTENT the student missed. Use 'from_notes' if it points to a SCAFFOLD NOTE. Use empty string if no challenge."
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
    // If rate-limited (429), return empty silently so the UI doesn't show an error
    if (error?.status === 429 || error?.statusText === 'Too Many Requests') {
      console.warn('Gemini rate limit hit (/api/editor) — skipping this check.');
      return NextResponse.json({
        sentence: '', challenge: '', eli10Reminder: '',
        nodeTitle: '', nodeEvidence: '', nodeClaim: '', sourceHint: ''
      });
    }
    console.error("Gemini API Error (/api/editor):", error);
    return NextResponse.json({ error: 'AI is offline' }, { status: 503 });
  }
}

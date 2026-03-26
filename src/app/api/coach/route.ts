import { NextResponse } from 'next/server';

interface ScaffoldNodeInput {
  id: string;
  title?: string;
  evidence_quote: string;
  student_claim?: string;
}

const WEAK_WORDS = [
  'think', 'maybe', 'probably', 'good', 'bad', 'stuff', 'things',
  'believe', 'feel', 'seems', 'i feel', 'i think', 'sort of', 'kind of',
];

const QUESTIONS = [
  'This sentence uses weak or speculative phrasing. Can you back this up with a direct quote from your evidence?',
  'What concrete proof do you have for this claim? Your scaffold notes might have the answer.',
  'Is this your opinion, or can you ground it in evidence? Check your research nodes.',
  'A sceptic would challenge this sentence immediately. What evidence makes it unassailable?',
  'This feels like an assertion without support. How does your scaffold evidence back this up?',
];

export async function POST(req: Request) {
  try {
    const { content, nodes } = (await req.json()) as {
      content: string;
      nodes?: ScaffoldNodeInput[];
    };

    if (!content?.trim()) return NextResponse.json({});

    const sentences = content.match(/[^.!?]+[.!?]+/g) ?? [content];

    // Scan most-recent sentence first
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];
      const lower = sentence.toLowerCase();
      const hasWeak = WEAK_WORDS.some((w) => lower.includes(w));
      if (!hasWeak) continue;

      // Pick a related node (random for now; would be semantic in prod)
      let nodeId: string | null = null;
      let nodeTitle: string | null = null;
      let nodeEvidence: string | null = null;
      let nodeClaim: string | null = null;

      if (nodes && nodes.length > 0) {
        const node = nodes[Math.floor(Math.random() * nodes.length)];
        nodeId = node.id;
        nodeTitle = node.title ?? null;
        nodeEvidence = node.evidence_quote;
        nodeClaim = node.student_claim ?? null;
      }

      const question =
        QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)] +
        (nodeTitle ? ` Consider your note: "${nodeTitle}".` : '');

      await new Promise((resolve) => setTimeout(resolve, 600));

      return NextResponse.json({
        provocation: {
          textSnippet: sentence.trim(),
          question,
          nodeId,
          nodeTitle,
          nodeEvidence,
          nodeClaim,
        },
      });
    }

    return NextResponse.json({});
  } catch {
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}

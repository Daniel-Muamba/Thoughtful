import { NextResponse } from 'next/server';

const ELI10_TEMPLATES = [
  {
    keywords: ['artificial intelligence', 'ai', 'machine learning'],
    explanation:
      "OK so imagine a really smart robot that watches you play a video game a thousand times. After all that watching, it figures out the best moves on its own — without anyone teaching it! That's what AI does. It learns patterns from tons of examples, just like you learned to recognise cats after seeing a million of them.",
  },
  {
    keywords: ['cognitive', 'cognition', 'mental'],
    explanation:
      "Imagine your brain is like a backpack. 'Cognitive' just means 'stuff that happens inside that backpack' — like thinking, remembering, and solving problems. When your backpack is too full (too much to think about at once), it gets heavy and slow. Scientists study how to make the backpack lighter!",
  },
  {
    keywords: ['efficiency', 'efficient', 'optimal'],
    explanation:
      "Imagine you need to eat 10 cookies. You COULD eat them one at a time walking across the room each trip, OR you could put them all on one plate and do it in one go. Doing it the one-plate way is more 'efficient' — same result, way less wasted effort.",
  },
  {
    keywords: ['sustainability', 'sustainable', 'environment'],
    explanation:
      "Imagine you have a magical apple tree that gives you 10 apples a day. If you only eat 10, the tree stays happy forever. But if you eat 20, you're taking too much and the tree dies. 'Sustainability' means only taking what the tree can grow back — so it keeps giving apples forever.",
  },
  {
    keywords: ['paradigm', 'framework', 'methodology'],
    explanation:
      "Think of this like the rulebook for a board game. Different games have different rulebooks — Monopoly vs Chess vs Uno. A 'paradigm' or 'framework' is the rulebook that everyone in a field agrees to follow. When the rulebook changes, everyone has to learn new rules!",
  },
  {
    keywords: ['stakeholder', 'collaboration', 'team'],
    explanation:
      "Imagine you're making a class poster project. The teacher wants it neat, your friend wants cool drawings, and you want funny jokes. Everyone who CARES about how the poster turns out is a 'stakeholder'. Good teamwork means making something everyone is happy with!",
  },
  {
    keywords: ['risk', 'mitigation', 'probability'],
    explanation:
      "Before you ride your bike, you wear a helmet. You don't know IF you'll fall, but you know it COULD happen. 'Risk management' is exactly that — spotting things that could go wrong and getting your helmet ready BEFORE you fall, not after.",
  },
];

const DEFAULT_EXPLANATION =
  "Great question! Think of this idea like a recipe. The author is basically saying: to get a good result (the final dish), you need the right ingredients in the right order. If you skip a step or use the wrong ingredient, the dish doesn't work out. This sentence is explaining one of those important ingredients!";

function generateELI10(text: string): string {
  const lower = text.toLowerCase();
  const match = ELI10_TEMPLATES.find((t) =>
    t.keywords.some((k) => lower.includes(k))
  );
  return match ? match.explanation : DEFAULT_EXPLANATION;
}

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text: string };
    if (!text?.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 700));

    const explanation = generateELI10(text);
    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

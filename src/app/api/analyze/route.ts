import { NextResponse } from 'next/server';

function getQuestionForLens(lens: string, index: number) {
  if (lens === "The Skeptic") {
    return index === 0 
      ? "What critical assumption is the author making without providing direct evidence?"
      : "Could there be an alternative motive or bias explaining this statement?";
  }
  if (lens === "The Exam-Maker") {
    return index === 0 
      ? "If this concept was a multiple-choice question, what would the incorrect 'distractor' answers be?"
      : "How would you summarize this mechanism in a single vocabulary flashcard?";
  }
  if (lens === "The Business Auditor") {
    return index === 0 
      ? "What is the hidden operational cost implied by this requirement?"
      : "How can the success of this claim be measured using concrete KPIs?";
  }
  
  // Default: Analytical
  return index === 0 
    ? "How does this specific premise support the author's primary thesis?"
    : "What logical leap is occurring between this point and the preceding evidence?";
}

export async function POST(request: Request) {
  try {
    const { source_text, active_lens } = await request.json();
    
    if (!source_text || source_text.trim() === '') {
      return NextResponse.json({ success: true, highlights: [] });
    }

    // Split text into sentences for reliable mock targeting
    // Matching anything ending with a punctuation mark (., !, ?) or just the whole block
    const sentences = source_text.match(/[^.!?]+[.!?]+/g) || [source_text];
    const highlights = [];
    
    // Create up to 2 highlights depending on text length
    if (sentences.length > 0) {
      highlights.push({
        id: 'h1',
        text_snippet: sentences[0].trim(),
        question: getQuestionForLens(active_lens, 0)
      });
      
      if (sentences.length > 2) {
         // Grab a sentence from the middle
         const middleIdx = Math.floor(sentences.length / 2);
         highlights.push({
           id: 'h2',
           text_snippet: sentences[middleIdx].trim(),
           question: getQuestionForLens(active_lens, 1)
         });
      }
    }

    // Simulate network delay for AI realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, highlights });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to analyze text' }, { status: 500 });
  }
}

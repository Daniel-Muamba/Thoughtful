import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { content, nodes } = await req.json();
    if (!content || content.trim() === '') {
      return NextResponse.json({});
    }

    const weakWords = ['think', 'maybe', 'probably', 'good', 'bad', 'stuff', 'things', 'believe', 'feel', 'seems'];
    // Split into sentences
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    
    // Check for weak phrases backwards (most recent typed sentence first)
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];
      const hasWeak = weakWords.some((w) => sentence.toLowerCase().includes(w));
      
      if (hasWeak) {
        // Find a relevant node from the scaffolder if they exist
        // In a real AI, this would use semantic search embeddings.
        let referenceText = "your thought cards";
        let nodeId = null;
        
        if (nodes && nodes.length > 0) {
          const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
          referenceText = `"${randomNode.title || randomNode.evidence_quote.substring(0, 30)}..."`;
          nodeId = randomNode.id;
        }

        // Add physical delay to simulate the "Lurker" AI thinking
        await new Promise((resolve) => setTimeout(resolve, 600));

        return NextResponse.json({
          provocation: {
            textSnippet: sentence.trim(),
            question: `This sentence uses weak or speculative phrasing. Can you strengthen it using concrete evidence from ${referenceText}?`,
            nodeId: nodeId
          }
        });
      }
    }
    
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}

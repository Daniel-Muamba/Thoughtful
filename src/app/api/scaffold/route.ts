import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import type { ScaffoldNode } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    const data = readDB();
    let nodes = data.scaffoldNodes ?? [];
    
    if (sessionId) {
      nodes = nodes.filter(n => n.session_id === sessionId);
    }
    
    return NextResponse.json(nodes);
  } catch {
    return NextResponse.json({ error: 'Failed to read nodes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<ScaffoldNode, 'id' | 'order_index'>;
    const data = readDB();
    const newNode: ScaffoldNode = {
      id: `node_${Date.now()}`,
      session_id: body.session_id ?? 'default-session-1',
      evidence_quote: body.evidence_quote,
      title: body.title ?? '',
      student_claim: body.student_claim ?? '',
      order_index: data.scaffoldNodes.length,
    };
    data.scaffoldNodes.push(newNode);
    writeDB(data);
    return NextResponse.json(newNode, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id: string; title?: string; student_claim?: string };
    const data = readDB();
    const idx = data.scaffoldNodes.findIndex((n) => n.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    data.scaffoldNodes[idx] = { ...data.scaffoldNodes[idx], ...body };
    writeDB(data);
    return NextResponse.json(data.scaffoldNodes[idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update node' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id: string };
    const data = readDB();
    data.scaffoldNodes = data.scaffoldNodes.filter((n) => n.id !== id);
    writeDB(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { readDB, writeDB, DBType } from '@/lib/db';

export async function GET() {
  try {
    const data = readDB();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DBType>;
    const currentData = readDB();

    const newData: DBType = {
      sessions: body.sessions ?? currentData.sessions,
      scaffoldNodes: body.scaffoldNodes ?? currentData.scaffoldNodes,
      provocations: body.provocations ?? currentData.provocations,
      drafts: body.drafts ?? currentData.drafts,
    };

    writeDB(newData);

    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write database' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert Web File to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    const data = await pdfParse(buffer);
    
    if (!data.text) {
      return NextResponse.json({ error: 'No readable text found in PDF' }, { status: 400 });
    }

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
  }
}

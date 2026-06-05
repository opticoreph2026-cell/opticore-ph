import { NextResponse } from 'next/server';
import { parseBillImage } from '@/lib/ocr';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { imageBase64, mimeType } = data;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Image data missing' }, { status: 400 });
    }

    const parsedData = await parseBillImage(imageBase64, mimeType, 'electric');

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error('Scan API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

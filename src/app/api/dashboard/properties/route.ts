import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const properties = await db.property.findMany({
      where: { clientId: user.sub as string },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Properties GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();

    const newProperty = await db.property.create({
      data: {
        ...data,
        clientId: user.sub as string,
      }
    });

    // If it's the first property, set it as default
    const count = await db.property.count({
      where: { clientId: user.sub as string }
    });

    if (count === 1) {
      await db.property.update({
        where: { id: newProperty.id },
        data: { isDefault: true }
      });
    }

    return NextResponse.json({ property: newProperty });
  } catch (error) {
    console.error('Properties POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

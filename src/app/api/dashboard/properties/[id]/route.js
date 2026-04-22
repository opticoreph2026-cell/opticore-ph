/**
 * PATCH  /api/dashboard/properties/[id]  — update a property
 * DELETE /api/dashboard/properties/[id]  — delete a property
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateProperty, deleteProperty } from '@/lib/db';

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  try {
    const property = await updateProperty(params.id, user.sub, body);
    return NextResponse.json({ property });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update property.' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await deleteProperty(params.id, user.sub);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to delete property.' }, { status: 400 });
  }
}

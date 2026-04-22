import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteClient, db } from '@/lib/db';

/**
 * DELETE /api/admin/clients/[id]
 *
 * Admin only. Permanently deletes a client and all associated data.
 */
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    
    // Check if user is authenticated and is an admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required.' }, { status: 400 });
    }

    // Double check the client exists
    const client = await db.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (client.id === user.sub) {
      return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
    }

    await deleteClient(id);

    return NextResponse.json({ success: true, message: 'Client deleted successfully.' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

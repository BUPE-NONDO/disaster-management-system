import { NextRequest, NextResponse } from 'next/server';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../../../../../../lib/firebase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Call Firebase Function
    const allocateResource = httpsCallable(functions, 'api');
    const result = await allocateResource({
      method: 'POST',
      path: `/resources/${id}/allocate`,
      body
    });

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error allocating resource:', error);
    return NextResponse.json(
      { error: 'Failed to allocate resource' },
      { status: 500 }
    );
  }
}

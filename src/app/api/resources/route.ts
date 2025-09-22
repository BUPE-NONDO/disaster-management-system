import { NextRequest, NextResponse } from 'next/server';
import { resourceService } from '../../../../lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const available = searchParams.get('available');

    const resources = await resourceService.getResources({
      type: type || undefined,
      availableOnly: available === 'true'
    });

    return NextResponse.json({ resources, total: resources.length });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const resourceId = await resourceService.createResource(body);
    const resource = await resourceService.getResource(resourceId);

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

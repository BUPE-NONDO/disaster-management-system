import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');

    const incidents = await incidentService.getIncidents({
      status: status || undefined,
      severity: severity || undefined,
      type: type || undefined,
      limitCount: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({ incidents, total: incidents.length });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const incidentId = await incidentService.createIncident(body);
    const incident = await incidentService.getIncident(incidentId);

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    await incidentService.updateIncident(id, body);
    const incident = await incidentService.getIncident(id);

    return NextResponse.json({ incident });
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

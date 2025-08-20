
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pitchedDeckId = searchParams.get('pitchedDeckId');

    // Return empty array for now - client-side storage will handle this
    const allInvestors: any[] = [];

    if (pitchedDeckId) {
      const filteredInvestors = allInvestors.filter((investor: any) => investor.pitchedDeckId === pitchedDeckId);
      return NextResponse.json(filteredInvestors);
    }

    // Return all investors sorted by most recent first
    return NextResponse.json(allInvestors);
  } catch (error) {
    console.error('GET investors error:', error);
    return NextResponse.json({ error: 'Failed to retrieve investors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const investor = await request.json();
    investor.id = Date.now().toString();
    investor.createdAt = Date.now();
    investor.updatedAt = Date.now();
    
    // Just return the investor - client will handle storage
    return NextResponse.json(investor, { status: 201 });
  } catch (error) {
    console.error('POST investor error:', error);
    return NextResponse.json({ error: 'Failed to create investor' }, { status: 500 });
  }
}

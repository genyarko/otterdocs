
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ investorId: string }> }) {
  try {
    const { investorId } = await params;
    // Return 404 since we're handling storage client-side
    return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
  } catch (error) {
    console.error('GET investor error:', error);
    return NextResponse.json({ error: 'Failed to retrieve investor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ investorId: string }> }) {
  try {
    const { investorId } = await params;
    const updatedInvestor = await request.json();
    
    // Just return the updated data with proper timestamps
    const updated = { 
      ...updatedInvestor, 
      id: investorId,
      updatedAt: Date.now()
    };
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT investor error:', error);
    return NextResponse.json({ error: 'Failed to update investor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ investorId: string }> }) {
  try {
    const { investorId } = await params;
    
    // Just return success - client will handle removal
    return NextResponse.json({ id: investorId });
  } catch (error) {
    console.error('DELETE investor error:', error);
    return NextResponse.json({ error: 'Failed to delete investor' }, { status: 500 });
  }
}

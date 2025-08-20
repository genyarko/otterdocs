
import { NextRequest, NextResponse } from 'next/server';
import { Investor } from '@/types/investor';

let investors: Investor[] = [];

export async function PUT(request: NextRequest, { params }: { params: Promise<{ investorId: string }> }) {
  const { investorId } = await params;
  const updatedInvestor: Investor = await request.json();
  const index = investors.findIndex(investor => investor.id === investorId);

  if (index !== -1) {
    investors[index] = { ...investors[index], ...updatedInvestor };
    return NextResponse.json(investors[index]);
  } else {
    return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ investorId: string }> }) {
  const { investorId } = await params;
  const index = investors.findIndex(investor => investor.id === investorId);

  if (index !== -1) {
    const deletedInvestor = investors.splice(index, 1);
    return NextResponse.json(deletedInvestor[0]);
  } else {
    return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
  }
}

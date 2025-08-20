
import { NextRequest, NextResponse } from 'next/server';
import { Investor } from '@/types/investor';

let investors: Investor[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pitchedDeckId = searchParams.get('pitchedDeckId');

  if (pitchedDeckId) {
    const filteredInvestors = investors.filter(investor => investor.pitchedDeckId === pitchedDeckId);
    return NextResponse.json(filteredInvestors);
  }

  // Return all investors sorted by most recent first
  const sortedInvestors = [...investors].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  return NextResponse.json(sortedInvestors);
}

export async function POST(request: NextRequest) {
  const investor: Investor = await request.json();
  investor.id = Date.now().toString();
  investors.push(investor);
  return NextResponse.json(investor, { status: 201 });
}

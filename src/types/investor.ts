export interface Investor {
  id: string;
  name: string;
  email?: string;
  firm?: string;
  status: 'Pitched' | 'Followed Up' | 'Interested' | 'Not Interested';
  notes?: string;
  pitchedDeckId: string;
}
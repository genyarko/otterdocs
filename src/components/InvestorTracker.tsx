
import { Investor } from '@/types/investor';
import { useEffect, useState } from 'react';
import InvestorList from './InvestorList';
import InvestorForm from './InvestorForm';

interface InvestorTrackerProps {
  pitchedDeckId: string;
}

export default function InvestorTracker({ pitchedDeckId }: InvestorTrackerProps) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchInvestors = async () => {
      const response = await fetch(`/api/investors?pitchedDeckId=${pitchedDeckId}`);
      const data = await response.json();
      setInvestors(data);
    };
    fetchInvestors();
  }, [pitchedDeckId]);

  const handleFormSubmit = async (investorData: Omit<Investor, 'id'>) => {
    const response = await fetch('/api/investors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...investorData, pitchedDeckId }),
    });
    const newInvestor = await response.json();
    setInvestors([...investors, newInvestor]);
    setIsFormOpen(false);
  };

  const handleEdit = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsFormOpen(true);
  };

  const handleDelete = async (investorId: string) => {
    await fetch(`/api/investors/${investorId}`, { method: 'DELETE' });
    setInvestors(investors.filter(investor => investor.id !== investorId));
  };

  return (
    <div>
      <h2>Investor Tracker</h2>
      <button onClick={() => { setSelectedInvestor(undefined); setIsFormOpen(true); }}>Add Investor</button>
      {isFormOpen ? (
        <InvestorForm
          investor={selectedInvestor}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <InvestorList investors={investors} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}

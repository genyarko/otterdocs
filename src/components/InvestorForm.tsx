
import { Investor } from '@/types/investor';
import { PitchDeck } from '@/types/pitchDeck';
import { useState } from 'react';

interface InvestorFormProps {
  investor?: Investor;
  onSubmit: (investor: Omit<Investor, 'id'>) => void;
  onCancel: () => void;
  allPitchDecks?: PitchDeck[];
}

export default function InvestorForm({ investor, onSubmit, onCancel, allPitchDecks }: InvestorFormProps) {
  const [name, setName] = useState(investor?.name || '');
  const [email, setEmail] = useState(investor?.email || '');
  const [firm, setFirm] = useState(investor?.firm || '');
  const [status, setStatus] = useState<Investor['status']>(investor?.status || 'Pitched');
  const [notes, setNotes] = useState(investor?.notes || '');
  const [pitchedDeckId, setPitchedDeckId] = useState(investor?.pitchedDeckId || (allPitchDecks?.[0]?.id || ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      firm,
      status,
      notes,
      pitchedDeckId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name *
        </label>
        <input 
          id="name" 
          type="text"
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input 
          id="email" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="firm" className="block text-sm font-medium text-gray-700 mb-2">
          Firm
        </label>
        <input 
          id="firm" 
          type="text"
          value={firm} 
          onChange={e => setFirm(e.target.value)} 
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {allPitchDecks && allPitchDecks.length > 0 && (
        <div>
          <label htmlFor="pitchDeck" className="block text-sm font-medium text-gray-700 mb-2">
            Pitch Deck *
          </label>
          <select 
            id="pitchDeck" 
            value={pitchedDeckId} 
            onChange={e => setPitchedDeckId(e.target.value)}
            required
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {allPitchDecks.map(deck => (
              <option key={deck.id} value={deck.id}>
                {deck.title}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select 
          id="status" 
          value={status} 
          onChange={e => setStatus(e.target.value as Investor['status'])}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="Pitched">Pitched</option>
          <option value="Followed Up">Followed Up</option>
          <option value="Interested">Interested</option>
          <option value="Not Interested">Not Interested</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea 
          id="notes" 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          rows={4}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Any notes about this investor or the pitch..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {investor ? 'Update' : 'Save'} Investor
        </button>
      </div>
    </form>
  );
}


import { Investor } from '@/types/investor';
import { PitchDeck } from '@/types/pitchDeck';
import { useState } from 'react';

interface InvestorFormProps {
  investor?: Investor;
  onSubmit: (investor: Omit<Investor, 'id'>) => void;
  onCancel: () => void;
  allPitchDecks?: PitchDeck[];
  isSubmitting?: boolean;
}

export default function InvestorForm({ investor, onSubmit, onCancel, allPitchDecks, isSubmitting = false }: InvestorFormProps) {
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
          disabled={isSubmitting}
          className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-purple-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {investor ? 'Updating...' : 'Saving...'}
            </div>
          ) : (
            `${investor ? 'Update' : 'Save'} Investor`
          )}
        </button>
      </div>
    </form>
  );
}

'use client';

import { Investor } from '@/types/investor';
import { PitchDeck } from '@/types/pitchDeck';
import { useEffect, useState } from 'react';
import InvestorList from './InvestorList';
import InvestorForm from './InvestorForm';

interface InvestorTrackerMainProps {
  allPitchDecks: PitchDeck[];
}

export default function InvestorTrackerMain({ allPitchDecks }: InvestorTrackerMainProps) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPitchDeck, setSelectedPitchDeck] = useState<string>('all');

  useEffect(() => {
    const fetchAllInvestors = async () => {
      const response = await fetch('/api/investors');
      const data = await response.json();
      setInvestors(data);
    };
    fetchAllInvestors();
  }, []);

  const handleFormSubmit = async (investorData: Omit<Investor, 'id'>) => {
    if (selectedInvestor) {
      // Update existing investor
      const response = await fetch(`/api/investors/${selectedInvestor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investorData),
      });
      const updatedInvestor = await response.json();
      setInvestors(investors.map(inv => inv.id === selectedInvestor.id ? updatedInvestor : inv));
    } else {
      // Create new investor
      const response = await fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investorData),
      });
      const newInvestor = await response.json();
      setInvestors([...investors, newInvestor]);
    }
    setIsFormOpen(false);
    setSelectedInvestor(undefined);
  };

  const handleEdit = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsFormOpen(true);
  };

  const handleDelete = async (investorId: string) => {
    await fetch(`/api/investors/${investorId}`, { method: 'DELETE' });
    setInvestors(investors.filter(investor => investor.id !== investorId));
  };

  const filteredInvestors = selectedPitchDeck === 'all' 
    ? investors 
    : investors.filter(inv => inv.pitchedDeckId === selectedPitchDeck);

  const getPitchDeckTitle = (pitchDeckId: string) => {
    const deck = allPitchDecks.find(deck => deck.id === pitchDeckId);
    return deck ? deck.title : 'Unknown Deck';
  };

  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedInvestor ? 'Edit Investor' : 'Add New Investor'}
            </h2>
            <InvestorForm
              investor={selectedInvestor}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedInvestor(undefined);
              }}
              allPitchDecks={allPitchDecks}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investor Tracker</h1>
                <p className="text-gray-600 mt-1">Manage your investor submissions and follow-ups</p>
              </div>
              <button
                onClick={() => {
                  setSelectedInvestor(undefined);
                  setIsFormOpen(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Add Investor
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <label htmlFor="pitch-deck-filter" className="text-sm font-medium text-gray-700">
                Filter by Pitch Deck:
              </label>
              <select
                id="pitch-deck-filter"
                value={selectedPitchDeck}
                onChange={(e) => setSelectedPitchDeck(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Pitch Decks</option>
                {allPitchDecks.map(deck => (
                  <option key={deck.id} value={deck.id}>
                    {deck.title}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                ({filteredInvestors.length} investor{filteredInvestors.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {filteredInvestors.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No investors yet</h3>
                <p className="text-gray-600 mb-6">
                  {selectedPitchDeck === 'all' 
                    ? "Start tracking your investor submissions by adding your first investor."
                    : "No investors found for the selected pitch deck."
                  }
                </p>
                {allPitchDecks.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    You'll need to create a pitch deck first before adding investors.
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedInvestor(undefined);
                      setIsFormOpen(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    Add Your First Investor
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Firm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pitch Deck
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvestors.map(investor => (
                      <tr key={investor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{investor.name}</div>
                            {investor.email && (
                              <div className="text-sm text-gray-500">{investor.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {investor.firm || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getPitchDeckTitle(investor.pitchedDeckId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            investor.status === 'Interested' ? 'bg-green-100 text-green-800' :
                            investor.status === 'Followed Up' ? 'bg-yellow-100 text-yellow-800' :
                            investor.status === 'Not Interested' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {investor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(investor)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(investor.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
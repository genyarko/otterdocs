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
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load investors from localStorage after component mounts
    const loadInvestors = () => {
      try {
        const stored = localStorage.getItem('investors');
        if (stored) {
          const parsedInvestors = JSON.parse(stored) as Investor[];
          setInvestors(parsedInvestors.sort((a, b) => parseInt(b.id) - parseInt(a.id)));
        }
      } catch (error) {
        console.error('Failed to load investors from localStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    // Use a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      loadInvestors();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const saveInvestorsToStorage = (investorList: Investor[]) => {
    try {
      localStorage.setItem('investors', JSON.stringify(investorList));
    } catch (error) {
      console.error('Failed to save investors to localStorage:', error);
    }
  };

  const handleFormSubmit = async (investorData: Omit<Investor, 'id'>) => {
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      if (selectedInvestor) {
        // Update existing investor
        console.log('Updating investor:', selectedInvestor.id, investorData);
        
        const updatedInvestor: Investor = {
          ...selectedInvestor,
          ...investorData,
          id: selectedInvestor.id,
          updatedAt: Date.now()
        };
        
        const updatedInvestors = investors.map(inv => 
          inv.id === selectedInvestor.id ? updatedInvestor : inv
        );
        
        setInvestors(updatedInvestors);
        saveInvestorsToStorage(updatedInvestors);
        
        console.log('Update successful:', updatedInvestor);
        setNotification({ message: 'Investor updated successfully!', type: 'success' });
      } else {
        // Create new investor
        console.log('Creating new investor:', investorData);
        
        const newInvestor: Investor = {
          ...investorData,
          id: Date.now().toString(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        const updatedInvestors = [newInvestor, ...investors];
        
        setInvestors(updatedInvestors);
        saveInvestorsToStorage(updatedInvestors);
        
        console.log('Creation successful:', newInvestor);
        setNotification({ message: 'Investor added successfully!', type: 'success' });
      }
      
      // Close form after successful operation
      setTimeout(() => {
        setIsFormOpen(false);
        setSelectedInvestor(undefined);
      }, 1500); // Give user time to see success message
      
    } catch (error) {
      console.error('Form submission error:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsFormOpen(true);
  };

  const handleDelete = async (investorId: string) => {
    try {
      const updatedInvestors = investors.filter(investor => investor.id !== investorId);
      setInvestors(updatedInvestors);
      saveInvestorsToStorage(updatedInvestors);
      console.log('Investor deleted successfully:', investorId);
    } catch (error) {
      console.error('Failed to delete investor:', error);
    }
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
            
            {/* Notification */}
            {notification && (
              <div className={`mb-6 p-4 rounded-md ${
                notification.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{notification.message}</p>
                  </div>
                </div>
              </div>
            )}
            
            <InvestorForm
              investor={selectedInvestor}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedInvestor(undefined);
                setNotification(null);
              }}
              allPitchDecks={allPitchDecks}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while data is being loaded to prevent hydration issues
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading investors...</span>
            </div>
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
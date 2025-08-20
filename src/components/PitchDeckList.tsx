'use client';

import { PitchDeck } from '@/types/pitchDeck';

interface PitchDeckListProps {
  pitchDecks: PitchDeck[];
  onSelectPitchDeck: (id: string) => void;
  onDeletePitchDeck: (id: string) => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

export default function PitchDeckList({
  pitchDecks,
  onSelectPitchDeck,
  onDeletePitchDeck,
  onCreateNew,
  isLoading
}: PitchDeckListProps) {
  console.log('📋 PitchDeckList render:', {
    pitchDecksCount: pitchDecks.length,
    isLoading,
    pitchDecks: pitchDecks.map(p => ({
      id: p.id,
      title: p.title,
      companyName: p.companyName,
      isCompleted: p.isCompleted,
      slidesCount: p.slides.length
    }))
  });
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatIndustry = (industry: string) => {
    return industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatFundingStage = (stage: string) => {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pitch decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Pitch Decks</h1>
              <p className="mt-2 text-gray-600">
                Create and manage your AI-generated pitch decks
              </p>
            </div>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              + New Pitch Deck
            </button>
          </div>
        </div>

        {/* Pitch Deck Grid */}
        {pitchDecks.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pitch decks yet</h3>
            <p className="mt-2 text-gray-500">
              Get started by creating your first AI-generated pitch deck
            </p>
            <button
              onClick={onCreateNew}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              Create Your First Pitch Deck
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitchDecks.map((pitchDeck) => (
              <div
                key={pitchDeck.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {pitchDeck.title}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Company:</span> {pitchDeck.companyName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Industry:</span> {formatIndustry(pitchDeck.industry)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Stage:</span> {formatFundingStage(pitchDeck.fundingStage)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Funding:</span> {pitchDeck.targetFunding}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4">
                      {pitchDeck.isCompleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>
                        {pitchDeck.isCompleted 
                          ? `${pitchDeck.totalSlides} of ${pitchDeck.totalSlides} slides`
                          : `${pitchDeck.slides.filter(s => s.isGenerated).length} of ${pitchDeck.totalSlides} slides`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          pitchDeck.isCompleted ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ 
                          width: pitchDeck.isCompleted 
                            ? '100%'
                            : `${Math.round(pitchDeck.slides.filter(s => s.isGenerated).length / pitchDeck.totalSlides * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Created: {formatDate(pitchDeck.createdAt)}</p>
                    {pitchDeck.completedAt && (
                      <p>Completed: {formatDate(pitchDeck.completedAt)}</p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onSelectPitchDeck(pitchDeck.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Deck →
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this pitch deck?')) {
                          onDeletePitchDeck(pitchDeck.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
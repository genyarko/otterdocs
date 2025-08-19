'use client';

import { usePitchDeck } from '@/hooks/usePitchDeck';
import PitchDeckCreator from '@/components/PitchDeckCreator';
import PitchDeckList from '@/components/PitchDeckList';
import PitchDeckViewer from '@/components/PitchDeckViewer';
import GenerationProgress from '@/components/GenerationProgress';

export default function Home() {
  const {
    // State
    isGenerating,
    generationProgress,
    currentPitchDeck,
    allPitchDecks,
    error,
    isLoading,
    currentSlide,
    showPitchDeckList,
    
    // Actions
    generatePitchDeck,
    loadPitchDeck,
    deletePitchDeck,
    showPitchDeckList: returnToList,
    clearError,
    generateImageForSlide,
    uploadImageForSlide,
    exportSpeakerPDF,
    exportInvestorPDF,
    
    // Navigation
    nextSlide,
    previousSlide,
    goToSlide,
    canGoNext,
    canGoPrevious,
    progressPercentage
  } = usePitchDeck();

  console.log('Home component render state:', {
    isGenerating,
    hasCurrentPitchDeck: !!currentPitchDeck,
    currentPitchDeckTitle: currentPitchDeck?.title,
    showPitchDeckList,
    error,
    isLoading,
    allPitchDecksCount: allPitchDecks.length,
    currentSlide
  });

  // Show generation progress modal
  if (isGenerating) {
    return (
      <GenerationProgress 
        progress={generationProgress}
        onCancel={() => {
          // Add cancel logic here if needed
          clearError();
        }}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-3">
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Dismiss
            </button>
            <button
              onClick={returnToList}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Pitch Decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show pitch deck viewer if a deck is selected
  if (currentPitchDeck && !showPitchDeckList) {
    console.log('Rendering PitchDeckViewer with:', {
      deckTitle: currentPitchDeck.title,
      currentSlide,
      showPitchDeckList,
      slidesCount: currentPitchDeck.slides.length,
      slideAtCurrentIndex: currentPitchDeck.slides[currentSlide]?.title || 'No slide'
    });
    
    return (
      <PitchDeckViewer
        pitchDeck={currentPitchDeck}
        currentSlide={currentSlide}
        onSlideChange={goToSlide}
        onBack={returnToList}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        onNext={nextSlide}
        onPrevious={previousSlide}
        progressPercentage={progressPercentage}
        onGenerateImageForSlide={generateImageForSlide}
        onUploadImageForSlide={uploadImageForSlide}
        onExportSpeakerPDF={exportSpeakerPDF}
        onExportInvestorPDF={exportInvestorPDF}
      />
    );
  }

  // TEMPORARY DEBUG: Force viewer if we have a pitch deck
  if (currentPitchDeck && !isGenerating) {
    console.log('🔍 DEBUG: Forcing PitchDeckViewer display');
    console.log('State check:', { 
      hasCurrentPitchDeck: !!currentPitchDeck, 
      showPitchDeckList, 
      isGenerating,
      deckTitle: currentPitchDeck.title 
    });
    
    return (
      <div>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <strong>🔧 DEBUG MODE:</strong> Showing deck because we have currentPitchDeck="{currentPitchDeck.title}" 
          and showPitchDeckList={showPitchDeckList.toString()}
        </div>
        <PitchDeckViewer
          pitchDeck={currentPitchDeck}
          currentSlide={currentSlide}
          onSlideChange={goToSlide}
          onBack={returnToList}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          onNext={nextSlide}
          onPrevious={previousSlide}
          progressPercentage={progressPercentage}
          onGenerateImageForSlide={generateImageForSlide}
          onUploadImageForSlide={uploadImageForSlide}
          onExportSpeakerPDF={exportSpeakerPDF}
          onExportInvestorPDF={exportInvestorPDF}
        />
      </div>
    );
  }


  // Show creation form or pitch deck list
  const showCreator = showPitchDeckList && allPitchDecks.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {showCreator ? (
        <div className="py-8">
          <PitchDeckCreator
            onCreatePitchDeck={generatePitchDeck}
            isGenerating={isGenerating}
          />
        </div>
      ) : (
        <PitchDeckList
          pitchDecks={allPitchDecks}
          onSelectPitchDeck={loadPitchDeck}
          onDeletePitchDeck={deletePitchDeck}
          onCreateNew={() => {
            // For now, we'll show the creator form inline
            // In a more complex app, you might navigate to a separate route
            returnToList();
          }}
          isLoading={isLoading}
        />
      )}


      {/* Floating Create Button when viewing list with existing decks */}
      {showPitchDeckList && allPitchDecks.length > 0 && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => {
              // This could open a modal or navigate to creator
              // For now, let's show the creator inline by clearing the list
              window.location.reload(); // Simple approach - in real app use routing
            }}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            title="Create New Pitch Deck"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

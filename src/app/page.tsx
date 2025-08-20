'use client';

import { useState, useEffect } from 'react';
import { usePitchDeck } from '@/hooks/usePitchDeck';
import { useBusinessPlan } from '@/hooks/useBusinessPlan';
import PitchDeckCreator from '@/components/PitchDeckCreator';
import PitchDeckList from '@/components/PitchDeckList';
import PitchDeckViewer from '@/components/PitchDeckViewer';
import BusinessPlanCreator from '@/components/BusinessPlanCreator';
import BusinessPlanList from '@/components/BusinessPlanList';
import BusinessPlanViewer from '@/components/BusinessPlanViewer';
import GenerationProgress from '@/components/GenerationProgress';
import InvestorTrackerMain from '@/components/InvestorTrackerMain';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pitch-decks' | 'business-plans' | 'investor-tracker'>('pitch-decks');

  // Pitch Deck hook
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
    showCreator: showPitchDeckCreatorBool,
    
    // Actions
    generatePitchDeck,
    loadPitchDeck,
    deletePitchDeck,
    goToPitchDeckList: returnToList,
    showCreator: showCreatorForm,
    clearError,
    generateImageForSlide,
    uploadImageForSlide,
    exportSpeakerPDF,
    exportInvestorPDF,
    exportOnePagerPDF,
    
    // Navigation
    nextSlide,
    previousSlide,
    goToSlide,
    canGoNext,
    canGoPrevious,
    progressPercentage
  } = usePitchDeck();

  // Business Plan hook
  const {
    // State
    isGenerating: isGeneratingBusinessPlan,
    generationProgress: businessPlanProgress,
    currentBusinessPlan,
    allBusinessPlans,
    error: businessPlanError,
    isLoading: isLoadingBusinessPlans,
    currentSection,
    showBusinessPlanList,
    showCreator: showBusinessPlanCreator,
    
    // Actions
    generateBusinessPlan,
    loadBusinessPlan,
    deleteBusinessPlan,
    goToBusinessPlanList: returnToBusinessPlanList,
    showCreatorForm: showBusinessPlanCreatorForm,
    clearError: clearBusinessPlanError,
    exportPDF: exportBusinessPlanPDF,
    
    // Navigation
    nextSection,
    previousSection,
    goToSection,
    canGoNext: canGoNextSection,
    canGoPrevious: canGoPreviousSection,
    progressPercentage: businessPlanProgressPercentage
  } = useBusinessPlan();


  // Show generation progress modal
  if (isGenerating || isGeneratingBusinessPlan) {
    return (
      <GenerationProgress 
        progress={isGenerating ? generationProgress : businessPlanProgress}
        onCancel={() => {
          // Add cancel logic here if needed
          if (isGenerating) {
            clearError();
          } else {
            clearBusinessPlanError();
          }
        }}
      />
    );
  }

  // Show error state
  if (error || businessPlanError) {
    const currentError = error || businessPlanError;
    const clearCurrentError = error ? clearError : clearBusinessPlanError;
    const returnToCurrentList = error ? returnToList : returnToBusinessPlanList;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{currentError}</p>
          <div className="space-x-3">
            <button
              onClick={clearCurrentError}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Dismiss
            </button>
            <button
              onClick={returnToCurrentList}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to List
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
        onExportOnePagerPDF={exportOnePagerPDF}
      />
    );
  }

  // Show business plan viewer if a business plan is selected
  
  if (currentBusinessPlan && !showBusinessPlanList) {
    console.log('Rendering BusinessPlanViewer with:', {
      planTitle: currentBusinessPlan.title,
      currentSection,
      showBusinessPlanList,
      sectionsCount: currentBusinessPlan.sections.length,
      sectionAtCurrentIndex: currentBusinessPlan.sections[currentSection]?.title || 'No section'
    });
    
    return (
      <BusinessPlanViewer
        businessPlan={currentBusinessPlan}
        currentSection={currentSection}
        onSectionChange={goToSection}
        onBack={returnToBusinessPlanList}
        canGoNext={canGoNextSection}
        canGoPrevious={canGoPreviousSection}
        onNext={nextSection}
        onPrevious={previousSection}
        progressPercentage={businessPlanProgressPercentage}
        onExportPDF={exportBusinessPlanPDF}
      />
    );
  }



  // Show creation form logic for both types - consistent behavior
  const shouldShowPitchDeckCreator = showPitchDeckCreatorBool || (showPitchDeckList && allPitchDecks.length === 0);
  const shouldShowBusinessPlanCreator = showBusinessPlanCreator || (showBusinessPlanList && allBusinessPlans.length === 0);
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('pitch-decks');
                if (currentBusinessPlan) returnToBusinessPlanList();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pitch-decks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pitch Decks ({allPitchDecks.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('business-plans');
                if (currentPitchDeck) returnToList();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business-plans'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Plans ({allBusinessPlans.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('investor-tracker');
                if (currentPitchDeck) returnToList();
                if (currentBusinessPlan) returnToBusinessPlanList();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'investor-tracker'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Investor Tracker
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'pitch-decks' ? (
        shouldShowPitchDeckCreator ? (
          <div className="py-8">
            <PitchDeckCreator
              onCreatePitchDeck={generatePitchDeck}
              isGenerating={isGenerating}
              onCancel={allPitchDecks.length > 0 ? returnToList : undefined}
            />
          </div>
        ) : (
          <PitchDeckList
            pitchDecks={allPitchDecks}
            onSelectPitchDeck={loadPitchDeck}
            onDeletePitchDeck={deletePitchDeck}
            onCreateNew={() => {
              console.log('🆕 Create New Pitch Deck button clicked');
              showCreatorForm();
            }}
            isLoading={isLoading}
          />
        )
      ) : activeTab === 'business-plans' ? (
        shouldShowBusinessPlanCreator ? (
          <div className="py-8">
            <BusinessPlanCreator
              onCreateBusinessPlan={generateBusinessPlan}
              isGenerating={isGeneratingBusinessPlan}
              onCancel={allBusinessPlans.length > 0 ? returnToBusinessPlanList : undefined}
            />
          </div>
        ) : (
          <BusinessPlanList
            businessPlans={allBusinessPlans}
            onSelectBusinessPlan={loadBusinessPlan}
            onDeleteBusinessPlan={deleteBusinessPlan}
            onCreateNew={() => {
              console.log('🆕 Create New Business Plan button clicked');
              showBusinessPlanCreatorForm();
            }}
            isLoading={isLoadingBusinessPlans}
          />
        )
      ) : (
        <InvestorTrackerMain allPitchDecks={allPitchDecks} />
      )}


      {/* Floating Create Button when viewing list with existing items */}
      {((activeTab === 'pitch-decks' && showPitchDeckList && allPitchDecks.length > 0) ||
        (activeTab === 'business-plans' && showBusinessPlanList && allBusinessPlans.length > 0)) && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => {
              if (activeTab === 'pitch-decks') {
                console.log('🆕 Floating Create Pitch Deck button clicked');
                showCreatorForm();
              } else {
                console.log('🆕 Floating Create Business Plan button clicked');
                showBusinessPlanCreatorForm();
              }
            }}
            className={`text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              activeTab === 'pitch-decks'
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
            title={`Create New ${activeTab === 'pitch-decks' ? 'Pitch Deck' : 'Business Plan'}`}
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

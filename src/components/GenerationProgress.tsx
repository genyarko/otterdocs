'use client';

import { GenerationProgress as ProgressType, GenerationPhase } from '@/types/pitchDeck';

interface GenerationProgressProps {
  progress: ProgressType;
  onCancel?: () => void;
}

export default function GenerationProgress({ progress, onCancel }: GenerationProgressProps) {
  const getPhaseText = (phase: GenerationPhase) => {
    switch (phase) {
      case GenerationPhase.PREPARING:
        return 'Preparing your pitch deck...';
      case GenerationPhase.GENERATING_SLIDES:
        return 'Generating slides...';
      case GenerationPhase.FINALIZING:
        return 'Finalizing your pitch deck...';
      case GenerationPhase.COMPLETED:
        return 'Pitch deck completed!';
      case GenerationPhase.ERROR:
        return 'An error occurred';
      default:
        return 'Processing...';
    }
  };

  const getProgressPercentage = () => {
    if (progress.phase === GenerationPhase.PREPARING) return 5;
    if (progress.phase === GenerationPhase.GENERATING_SLIDES) {
      return 10 + (progress.currentSlide / progress.totalSlides) * 80;
    }
    if (progress.phase === GenerationPhase.FINALIZING) return 95;
    if (progress.phase === GenerationPhase.COMPLETED) return 100;
    return 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {progress.phase === GenerationPhase.ERROR ? (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : progress.phase === GenerationPhase.COMPLETED ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {progress.phase === GenerationPhase.ERROR ? 'Generation Failed' : 'Creating Your Pitch Deck'}
          </h3>
          
          <p className="text-gray-600">
            {getPhaseText(progress.phase)}
          </p>
        </div>

        {/* Progress Bar */}
        {progress.phase !== GenerationPhase.ERROR && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Slide Progress */}
        {progress.phase === GenerationPhase.GENERATING_SLIDES && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800 font-medium">
                Generating Slide {progress.currentSlide} of {progress.totalSlides}
              </span>
              <span className="text-blue-600">
                {Math.round((progress.currentSlide / progress.totalSlides) * 100)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.currentSlide / progress.totalSlides) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {progress.phase === GenerationPhase.ERROR && progress.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{progress.error}</p>
          </div>
        )}

        {/* Generation Steps */}
        {progress.phase === GenerationPhase.GENERATING_SLIDES && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Generation Steps</h4>
            <div className="space-y-2">
              {[
                'Title Slide',
                'Problem Statement',
                'Solution Overview',
                'Market Opportunity',
                'Business Model',
                'Traction & Validation',
                'Competition Analysis',
                'Team Introduction',
                'Financial Projections',
                'Funding Request'
              ].map((step, index) => (
                <div key={index} className="flex items-center text-sm">
                  {index < progress.currentSlide ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : index === progress.currentSlide ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded-full mr-2" />
                  )}
                  <span className={index <= progress.currentSlide ? 'text-gray-900' : 'text-gray-500'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          {progress.phase === GenerationPhase.ERROR && onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          )}
          
          {progress.isGenerating && onCancel && progress.phase !== GenerationPhase.COMPLETED && (
            <button
              onClick={onCancel}
              className="px-6 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Estimated Time */}
        {progress.isGenerating && progress.phase === GenerationPhase.GENERATING_SLIDES && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Estimated time remaining: {Math.max(1, 10 - progress.currentSlide)} minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
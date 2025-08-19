'use client';

import { useState, useEffect, useRef } from 'react';
import { PitchDeck, PitchDeckSlide } from '@/types/pitchDeck';

interface PitchDeckViewerProps {
  pitchDeck: PitchDeck;
  currentSlide: number;
  onSlideChange: (slideNumber: number) => void;
  onBack: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  progressPercentage: number;
  onGenerateImageForSlide?: (slideIndex: number) => void;
  onUploadImageForSlide?: (slideIndex: number, file: File) => void;
  onExportSpeakerPDF?: () => void;
  onExportInvestorPDF?: () => void;
}

export default function PitchDeckViewer({
  pitchDeck,
  currentSlide,
  onSlideChange,
  onBack,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  progressPercentage,
  onGenerateImageForSlide,
  onUploadImageForSlide,
  onExportSpeakerPDF,
  onExportInvestorPDF
}: PitchDeckViewerProps) {
  const [showPDFDropdown, setShowPDFDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPDFDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  console.log('PitchDeckViewer rendering:', {
    title: pitchDeck.title,
    currentSlide,
    totalSlides: pitchDeck.slides.length,
    hasSlides: pitchDeck.slides.length > 0
  });

  const slide = pitchDeck.slides[currentSlide];

  if (!slide) {
    console.log('No slide found at index:', currentSlide, 'Available slides:', pitchDeck.slides.length);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-600">Slide not found (slide {currentSlide + 1})</h2>
          <p className="text-gray-500 mt-2">Deck has {pitchDeck.slides.length} slides</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-800">
            ← Back to Pitch Decks
          </button>
        </div>
      </div>
    );
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <li key={index} className="ml-4">
            {line.trim().substring(1).trim()}
          </li>
        );
      }
      return line.trim() ? (
        <p key={index} className="mb-2">
          {line.trim()}
        </p>
      ) : (
        <br key={index} />
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {pitchDeck.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* PDF Export Dropdown */}
              {(onExportSpeakerPDF || onExportInvestorPDF) && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowPDFDropdown(!showPDFDropdown)}
                    className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    title="Download as PDF"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showPDFDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {onExportSpeakerPDF && (
                          <button
                            onClick={() => {
                              onExportSpeakerPDF();
                              setShowPDFDropdown(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 010-2h4zM6 6v12h8V6H6zM8 8h4v2H8V8zm0 4h4v2H8v-2z" />
                            </svg>
                            Speaker PDF
                            <span className="ml-auto text-xs text-gray-500">with notes</span>
                          </button>
                        )}
                        {onExportInvestorPDF && (
                          <button
                            onClick={() => {
                              onExportInvestorPDF();
                              setShowPDFDropdown(false);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                            </svg>
                            Investor PDF
                            <span className="ml-auto text-xs text-gray-500">clean version</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <span className="text-sm text-gray-500">
                Slide {currentSlide + 1} of {pitchDeck.totalSlides}
              </span>
              
              {/* Progress Bar */}
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Slide Navigation Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-4 sticky top-8">
              <h3 className="font-medium text-gray-900 mb-4">Slides</h3>
              <div className="space-y-2">
                {pitchDeck.slides.map((slideItem, index) => (
                  <button
                    key={index}
                    onClick={() => onSlideChange(index)}
                    className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                      index === currentSlide
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{index + 1}. {slideItem.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {slideItem.slideType.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="ml-2">
                        {slideItem.imageUrl ? (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" title="Has image">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="No image">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Slide Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-lg min-h-[600px]">
              {/* Slide Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {slide.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {slide.slideType.replace(/_/g, ' ').toLowerCase()}
                    </p>
                  </div>
                  
                  {slide.isGenerated && (
                    <div className="flex items-center text-green-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      AI Generated
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Content */}
              <div className="p-8">
                <div className="prose max-w-none">
                  {/* Slide Image - Moved to top */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Visual</h4>
                      <div className="flex gap-2">
                        {onGenerateImageForSlide && !slide.imageUrl && (
                          <button
                            onClick={() => onGenerateImageForSlide(currentSlide)}
                            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Generate Image
                          </button>
                        )}
                        {onGenerateImageForSlide && slide.imageUrl && (
                          <button
                            onClick={() => onGenerateImageForSlide(currentSlide)}
                            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Regenerate Image
                          </button>
                        )}
                        {onUploadImageForSlide && (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && onUploadImageForSlide) {
                                  try {
                                    await onUploadImageForSlide(currentSlide, file);
                                    e.target.value = ''; // Reset file input
                                  } catch (error) {
                                    console.error('Upload failed:', error);
                                    alert(error instanceof Error ? error.message : 'Failed to upload image');
                                  }
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              id={`upload-image-${currentSlide}`}
                            />
                            <button
                              className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Upload Image
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {slide.imageUrl ? (
                      <div className="relative mb-6">
                        <img
                          src={slide.imageUrl}
                          alt={`Visual for ${slide.title}`}
                          className="w-full max-w-md mx-auto rounded-lg shadow-md"
                          onError={(e) => {
                            console.error('Failed to load image:', slide.imageUrl);
                            // Check if this looks like an expired DALL-E URL
                            const isExpiredUrl = slide.imageUrl?.includes('blob.core.windows.net') && slide.imageUrl.includes('se=');
                            if (isExpiredUrl) {
                              console.warn('Image URL appears to be expired (DALL-E URLs expire after 2 hours)');
                            }
                            e.currentTarget.style.display = 'none';
                            // Show fallback message
                            const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackDiv && fallbackDiv.classList.contains('image-fallback')) {
                              fallbackDiv.style.display = 'block';
                            }
                          }}
                        />
                        <div className="image-fallback hidden flex flex-col items-center justify-center h-48 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg mb-2">
                          <svg className="w-12 h-12 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-orange-700 font-medium">Image failed to load</p>
                          <p className="text-sm text-orange-600 mt-1 text-center">
                            Generated images expire after 2 hours.<br/>
                            Use "Regenerate Image" or "Upload Image" above.
                          </p>
                        </div>
                        {slide.imagePrompt && (
                          <p className="text-xs text-gray-500 mt-2 italic text-center">
                            {slide.imagePrompt}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 mt-2">No image generated yet</p>
                        <p className="text-sm text-gray-400">Click "Generate Image" to create a visual for this slide</p>
                      </div>
                    )}
                  </div>

                  <div className="text-gray-800 leading-relaxed">
                    {formatContent(slide.content)}
                  </div>
                  
                  {/* Key Points */}
                  {slide.keyPoints && slide.keyPoints.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Key Points</h4>
                      <ul className="space-y-2">
                        {slide.keyPoints.map((point, index) => (
                          <li key={index} className="text-blue-800 flex items-start">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Speaker Notes */}
                  {slide.speakerNotes && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Speaker Notes</h4>
                      <p className="text-gray-700 text-sm">{slide.speakerNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Navigation */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      canGoPrevious
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="text-sm text-gray-500">
                    {currentSlide + 1} / {pitchDeck.totalSlides}
                  </div>

                  <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      canGoNext
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
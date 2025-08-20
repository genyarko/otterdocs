'use client';

import { useState, useEffect, useRef } from 'react';
import { BusinessPlan } from '@/types/pitchDeck';

interface BusinessPlanViewerProps {
  businessPlan: BusinessPlan;
  currentSection: number;
  onSectionChange: (sectionNumber: number) => void;
  onBack: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  progressPercentage: number;
  onExportPDF?: (format?: 'pdf' | 'txt') => void;
}

export default function BusinessPlanViewer({
  businessPlan,
  currentSection,
  onSectionChange,
  onBack,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  progressPercentage,
  onExportPDF
}: BusinessPlanViewerProps) {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  console.log('BusinessPlanViewer rendering:', {
    title: businessPlan.title,
    currentSection,
    totalSections: businessPlan.sections.length,
    hasSections: businessPlan.sections.length > 0
  });

  const section = businessPlan.sections[currentSection];

  if (!section) {
    console.log('No section found at index:', currentSection, 'Available sections:', businessPlan.sections.length);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-600">Section not found (section {currentSection + 1})</h2>
          <p className="text-gray-500 mt-2">Business plan has {businessPlan.sections.length} sections</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-800">
            ← Back to Business Plans
          </button>
        </div>
      </div>
    );
  }

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.JSX.Element[] = [];
    let currentList: string[] = [];
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        return;
      }

      if (trimmedLine.match(/^[•\-\*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        if (!inList) {
          inList = true;
        }
        currentList.push(trimmedLine.replace(/^[•\-\*\d+\.\s]+/, ''));
      } else {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        
        if (trimmedLine.length > 0) {
          elements.push(
            <p key={`p-${elements.length}`} className="text-gray-700 mb-4 leading-relaxed">
              {trimmedLine}
            </p>
          );
        }
      }
    });

    // Handle remaining list items
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
          {currentList.map((item, i) => (
            <li key={i} className="text-gray-700">{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Business Plans
              </button>
              
              <div className="text-2xl font-bold text-gray-900">
                {businessPlan.title}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress */}
              <div className="text-sm text-gray-600">
                Section {currentSection + 1} of {businessPlan.totalSections}
              </div>
              
              {/* Export Button */}
              {onExportPDF && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </button>
                  
                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onExportPDF('pdf');
                            setShowExportDropdown(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as PDF
                        </button>
                        <button
                          onClick={() => {
                            onExportPDF('txt');
                            setShowExportDropdown(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as Text File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar - Section Navigation */}
        <div className="w-80 bg-white rounded-lg shadow-md p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Plan Sections</h3>
          <div className="space-y-2">
            {businessPlan.sections.map((sectionItem, index) => (
              <button
                key={index}
                onClick={() => onSectionChange(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === currentSection
                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{index + 1}. {sectionItem.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sectionItem.sectionType.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md">
          <div className="p-8">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {section.title}
                </h1>
                <div className="text-sm text-gray-500">
                  Section {section.sectionNumber} of {businessPlan.totalSections}
                </div>
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {section.sectionType.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Section Content */}
            <div className="prose prose-lg max-w-none">
              {formatContent(section.content)}
            </div>

            {/* Key Points */}
            {section.keyPoints && section.keyPoints.length > 0 && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {section.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-blue-800">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Section
              </button>
              
              <button
                onClick={onNext}
                disabled={!canGoNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Section
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
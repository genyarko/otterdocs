'use client';

import { useState } from 'react';
import { IndustryType, FundingStage, BusinessPlanRequest } from '@/types/pitchDeck';
import FileUpload from './FileUpload';

interface BusinessPlanCreatorProps {
  onCreateBusinessPlan: (request: BusinessPlanRequest, extractedContent?: string) => void;
  isGenerating: boolean;
  onCancel?: () => void;
}

export default function BusinessPlanCreator({ onCreateBusinessPlan, isGenerating, onCancel }: BusinessPlanCreatorProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    prompt: '',
    industry: IndustryType.TECHNOLOGY,
    fundingStage: FundingStage.SEED,
    targetFunding: '',
    teamSize: 1,
    marketSize: '',
    existingTraction: '',
    competitiveAdvantage: '',
    businessModel: ''
  });

  const [extractedContent, setExtractedContent] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: BusinessPlanRequest = {
      ...formData,
      sectionCount: 9 // Fixed for standard business plan
    };
    
    onCreateBusinessPlan(request, extractedContent || undefined);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Business Plan
            </h1>
            <p className="text-gray-600">
              Generate a comprehensive 9-section business plan for your startup using AI
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Business Plans
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., TechCorp Inc."
              suppressHydrationWarning={true}
            />
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              suppressHydrationWarning={true}
            >
              <option value={IndustryType.TECHNOLOGY}>Technology</option>
              <option value={IndustryType.HEALTHCARE}>Healthcare</option>
              <option value={IndustryType.FINTECH}>Fintech</option>
              <option value={IndustryType.ECOMMERCE}>E-commerce</option>
              <option value={IndustryType.EDUCATION}>Education</option>
              <option value={IndustryType.SUSTAINABILITY}>Sustainability</option>
              <option value={IndustryType.ENTERTAINMENT}>Entertainment</option>
              <option value={IndustryType.FOOD_BEVERAGE}>Food & Beverage</option>
              <option value={IndustryType.REAL_ESTATE}>Real Estate</option>
              <option value={IndustryType.TRANSPORTATION}>Transportation</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fundingStage" className="block text-sm font-medium text-gray-700 mb-2">
              Funding Stage *
            </label>
            <select
              id="fundingStage"
              name="fundingStage"
              value={formData.fundingStage}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              suppressHydrationWarning={true}
            >
              <option value={FundingStage.PRE_SEED}>Pre-Seed</option>
              <option value={FundingStage.SEED}>Seed</option>
              <option value={FundingStage.SERIES_A}>Series A</option>
              <option value={FundingStage.SERIES_B}>Series B</option>
              <option value={FundingStage.SERIES_C}>Series C</option>
              <option value={FundingStage.GROWTH}>Growth</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="targetFunding" className="block text-sm font-medium text-gray-700 mb-2">
              Target Funding Amount *
            </label>
            <input
              type="text"
              id="targetFunding"
              name="targetFunding"
              value={formData.targetFunding}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $1M, $500K, $10M"
              suppressHydrationWarning={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
              Team Size *
            </label>
            <input
              type="number"
              id="teamSize"
              name="teamSize"
              value={formData.teamSize}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              suppressHydrationWarning={true}
            />
          </div>
          
          <div>
            <label htmlFor="marketSize" className="block text-sm font-medium text-gray-700 mb-2">
              Market Size (Optional)
            </label>
            <input
              type="text"
              id="marketSize"
              name="marketSize"
              value={formData.marketSize}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $50B globally, $5B TAM"
              suppressHydrationWarning={true}
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Company Documents (Optional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload existing pitch decks, company documents, or business plans to automatically extract relevant information. This will help create a more accurate and detailed business plan.
          </p>
          
          <FileUpload
            onFileProcessed={(content: string, fileName: string) => {
              setExtractedContent(prev => {
                const newContent = prev ? `${prev}\n\n--- From ${fileName} ---\n${content}` : content;
                return newContent;
              });
              setUploadError('');
              
              // Handle different types of PDF processing results
              const isFailureMessage = content.includes('PDF Upload Notice:') || 
                                     content.includes('Text Extraction Failed') ||
                                     content.includes('PDF Document Context:') ||
                                     content.includes('PDF file uploaded:') ||
                                     content.includes('File upload error') ||
                                     content.includes('upload encountered an issue') ||
                                     content.includes('Analysis:') ||
                                     content.includes('Manual Entry Required') ||
                                     content.includes('Please manually enter');
              
              if (isFailureMessage) {
                console.log('📁 PDF uploaded but extraction failed - user guidance provided');
                // Don't auto-populate since this is guidance content, not extracted text
              } else {
                // This looks like actual extracted text content
                console.log('🔄 Auto-populating Business Description with extracted content');
                
                // Clean the content - remove common PDF artifacts
                const cleanContent = content
                  .replace(/^\s*%PDF.*?\n/gm, '') // Remove PDF headers
                  .replace(/\s+/g, ' ') // Normalize whitespace
                  .trim();
                
                if (cleanContent.length > 50) {
                  // Either add to existing content or replace empty field
                  setFormData(prev => {
                    const existingPrompt = prev.prompt.trim();
                    let newPrompt = '';
                    
                    if (existingPrompt) {
                      // Add to existing content
                      newPrompt = `${existingPrompt}\n\nAdditional content from ${fileName}:\n${cleanContent}`;
                    } else {
                      // Replace empty field
                      newPrompt = cleanContent;
                    }
                    
                    // Truncate if too long
                    if (newPrompt.length > 2000) {
                      newPrompt = newPrompt.substring(0, 2000) + '...\n[Content truncated - full details available to AI]';
                    }
                    
                    return { ...prev, prompt: newPrompt };
                  });
                }
              }
            }}
            onError={(error: string) => {
              setUploadError(error);
            }}
            className="mb-4"
          />
          
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
          
          {extractedContent && (
            <div className={`mb-4 p-4 rounded-md border ${
              extractedContent.includes('Text Extraction Failed') 
                ? 'bg-orange-50 border-orange-200'
                : extractedContent.includes('PDF file uploaded:') || extractedContent.includes('PDF Upload Notice:')
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-medium ${
                  extractedContent.includes('Text Extraction Failed') 
                    ? 'text-orange-900'
                    : extractedContent.includes('PDF file uploaded:') || extractedContent.includes('PDF Upload Notice:')
                    ? 'text-yellow-900' 
                    : 'text-green-900'
                }`}>
                  {extractedContent.includes('Text Extraction Failed') 
                    ? 'PDF Upload - Manual Entry Required'
                    : extractedContent.includes('PDF file uploaded:') || extractedContent.includes('PDF Upload Notice:')
                    ? 'PDF Uploaded - Manual Entry Needed' 
                    : 'PDF Text Extracted Successfully'}
                </h4>
                <button
                  type="button"
                  onClick={() => setExtractedContent('')}
                  className={`text-sm hover:underline ${
                    extractedContent.includes('Text Extraction Failed') 
                      ? 'text-orange-600 hover:text-orange-800'
                      : extractedContent.includes('PDF file uploaded:') || extractedContent.includes('PDF Upload Notice:')
                      ? 'text-yellow-600 hover:text-yellow-800' 
                      : 'text-green-600 hover:text-green-800'
                  }`}
                >
                  Clear
                </button>
              </div>
              <div className={`text-xs max-h-32 overflow-y-auto bg-white p-2 rounded border ${
                extractedContent.includes('Text Extraction Failed') 
                  ? 'text-orange-700'
                  : extractedContent.includes('PDF file uploaded:') || extractedContent.includes('PDF Upload Notice:')
                  ? 'text-yellow-700' 
                  : 'text-green-700'
              }`}>
                {extractedContent.substring(0, 500)}
                {extractedContent.length > 500 && '...'}
              </div>
              <p className={`text-xs mt-1 ${
                extractedContent.includes('Text Extraction Failed') 
                  ? 'text-orange-600'
                  : extractedContent.includes('PDF file uploaded:') || extractedContent.includes('PDF Upload Notice:')
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`}>
                {extractedContent.includes('Text Extraction Failed') || extractedContent.includes('PDF Upload Notice:')
                  ? 'Please manually enter your PDF content in the Business Description field below' 
                  : extractedContent.includes('PDF file uploaded:')
                  ? 'File context available for AI - please fill out the form fields below'
                  : `${extractedContent.length} characters automatically extracted and ready for use`}
              </p>
            </div>
          )}
        </div>

        {/* Business Description */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Business Description *
          </label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            placeholder="Describe your business idea, the problem you're solving, your solution, and what makes your company unique. Be as detailed as possible to get the best business plan."
            suppressHydrationWarning={true}
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information (Optional)</h3>
          
          <div>
            <label htmlFor="existingTraction" className="block text-sm font-medium text-gray-700 mb-2">
              Existing Traction
            </label>
            <textarea
              id="existingTraction"
              name="existingTraction"
              value={formData.existingTraction}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="Current customers, revenue, partnerships, milestones achieved..."
              suppressHydrationWarning={true}
            />
          </div>

          <div>
            <label htmlFor="competitiveAdvantage" className="block text-sm font-medium text-gray-700 mb-2">
              Competitive Advantage
            </label>
            <textarea
              id="competitiveAdvantage"
              name="competitiveAdvantage"
              value={formData.competitiveAdvantage}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="What sets you apart from competitors? Unique technology, patents, team expertise..."
              suppressHydrationWarning={true}
            />
          </div>

          <div>
            <label htmlFor="businessModel" className="block text-sm font-medium text-gray-700 mb-2">
              Business Model
            </label>
            <textarea
              id="businessModel"
              name="businessModel"
              value={formData.businessModel}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="How do you make money? Subscription, one-time sales, freemium, marketplace..."
              suppressHydrationWarning={true}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">9 sections</span> will be generated for your business plan
          </div>
          <button
            type="submit"
            disabled={isGenerating || !formData.companyName || !formData.prompt}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Business Plan...
              </div>
            ) : (
              'Generate Business Plan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
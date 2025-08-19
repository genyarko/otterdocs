'use client';

import { useState } from 'react';
import { IndustryType, FundingStage, PitchDeckRequest } from '@/types/pitchDeck';

interface PitchDeckCreatorProps {
  onCreatePitchDeck: (request: PitchDeckRequest) => void;
  isGenerating: boolean;
}

export default function PitchDeckCreator({ onCreatePitchDeck, isGenerating }: PitchDeckCreatorProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    prompt: '',
    industry: IndustryType.TECHNOLOGY,
    fundingStage: FundingStage.SEED,
    targetFunding: '',
    teamSize: 2,
    marketSize: '',
    existingTraction: '',
    competitiveAdvantage: '',
    businessModel: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: PitchDeckRequest = {
      ...formData,
      slideCount: 10 // Fixed for standard pitch deck
    };
    
    onCreatePitchDeck(request);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Your Pitch Deck
        </h1>
        <p className="text-gray-600">
          Generate a professional 10-slide pitch deck for your startup using AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Company Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Funding *
            </label>
            <input
              type="text"
              value={formData.targetFunding}
              onChange={(e) => handleChange('targetFunding', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $500K, $2M, $10M"
              required
            />
          </div>
        </div>

        {/* Startup Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Startup Description *
          </label>
          <textarea
            value={formData.prompt}
            onChange={(e) => handleChange('prompt', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your startup idea, the problem you're solving, and your solution in detail..."
            required
          />
        </div>

        {/* Industry and Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value as IndustryType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(IndustryType).map((industry) => (
                <option key={industry} value={industry}>
                  {industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Stage *
            </label>
            <select
              value={formData.fundingStage}
              onChange={(e) => handleChange('fundingStage', e.target.value as FundingStage)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(FundingStage).map((stage) => (
                <option key={stage} value={stage}>
                  {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Team and Market */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Size
            </label>
            <input
              type="number"
              value={formData.teamSize}
              onChange={(e) => handleChange('teamSize', parseInt(e.target.value) || 1)}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market Size (Optional)
            </label>
            <input
              type="text"
              value={formData.marketSize}
              onChange={(e) => handleChange('marketSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $50B TAM, $5B SAM"
            />
          </div>
        </div>

        {/* Optional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Additional Details (Optional)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing Traction
            </label>
            <textarea
              value={formData.existingTraction}
              onChange={(e) => handleChange('existingTraction', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Current customers, revenue, partnerships, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competitive Advantage
            </label>
            <textarea
              value={formData.competitiveAdvantage}
              onChange={(e) => handleChange('competitiveAdvantage', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What makes you unique? IP, team expertise, first-mover advantage, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Model
            </label>
            <textarea
              value={formData.businessModel}
              onChange={(e) => handleChange('businessModel', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How do you make money? Subscription, transaction fees, advertising, etc."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isGenerating || !formData.companyName || !formData.prompt || !formData.targetFunding}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Pitch Deck...
              </div>
            ) : (
              'Generate Pitch Deck'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
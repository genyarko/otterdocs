import { 
  PitchDeck, 
  PitchDeckRequest, 
  PitchDeckSlide, 
  SlideTemplate, 
  SlideType,
  PitchDeckGenerator,
  IndustryType,
  FundingStage 
} from '@/types/pitchDeck';

export class OnlinePitchDeckGenerator implements PitchDeckGenerator {
  private readonly API_ROUTE = '/api/generate-slide';
  private readonly IMAGE_API_ROUTE = '/api/generate-image';
  private readonly slideTemplates: SlideTemplate[];
  
  // Circuit breaker for image generation
  private imageFailureCount = 0;
  private readonly maxImageFailures = 3;
  private circuitBreakerOpen = false;

  constructor(apiKey?: string) {
    // API key is now handled server-side
    this.slideTemplates = this.initializeSlideTemplates();
  }

  private initializeSlideTemplates(): SlideTemplate[] {
    return [
      {
        slideType: SlideType.TITLE,
        title: 'Company Introduction',
        contentPrompt: 'Create a compelling title slide that introduces the company name, tagline, and core value proposition.',
        keyQuestions: ['What is the company name?', 'What is the main value proposition?', 'What industry does this company operate in?'],
        order: 1
      },
      {
        slideType: SlideType.PROBLEM,
        title: 'Problem Statement', 
        contentPrompt: 'Identify and articulate the specific problem this startup solves. Make it relatable and urgent.',
        keyQuestions: ['What pain point does this solve?', 'How big is this problem?', 'Who experiences this problem?'],
        order: 2
      },
      {
        slideType: SlideType.SOLUTION,
        title: 'Our Solution',
        contentPrompt: 'Present the innovative solution that addresses the identified problem. Focus on uniqueness and effectiveness.',
        keyQuestions: ['How does your solution work?', 'What makes it unique?', 'Why is this the best approach?'],
        order: 3
      },
      {
        slideType: SlideType.MARKET,
        title: 'Market Opportunity',
        contentPrompt: 'Define the target market, market size, and growth potential. Include TAM, SAM, and SOM if relevant.',
        keyQuestions: ['Who is your target customer?', 'How big is the market?', 'What is the growth potential?'],
        order: 4
      },
      {
        slideType: SlideType.BUSINESS_MODEL,
        title: 'Business Model',
        contentPrompt: 'Explain how the company makes money, pricing strategy, and revenue streams.',
        keyQuestions: ['How do you make money?', 'What is your pricing strategy?', 'What are your revenue streams?'],
        order: 5
      },
      {
        slideType: SlideType.TRACTION,
        title: 'Traction & Validation',
        contentPrompt: 'Showcase early traction, customer validation, partnerships, or significant milestones achieved.',
        keyQuestions: ['What traction have you achieved?', 'Who are your early customers?', 'What validates your approach?'],
        order: 6
      },
      {
        slideType: SlideType.COMPETITION,
        title: 'Competitive Landscape',
        contentPrompt: 'Analyze the competitive landscape and clearly articulate your competitive advantages.',
        keyQuestions: ['Who are your competitors?', 'What is your competitive advantage?', 'How do you differentiate?'],
        order: 7
      },
      {
        slideType: SlideType.TEAM,
        title: 'Our Team',
        contentPrompt: 'Introduce the founding team, their relevant experience, and why they are uniquely positioned to execute.',
        keyQuestions: ['Who are the founders?', 'What relevant experience do they have?', 'Why is this the right team?'],
        order: 8
      },
      {
        slideType: SlideType.FINANCIALS,
        title: 'Financial Projections',
        contentPrompt: 'Present realistic financial projections, key metrics, and path to profitability.',
        keyQuestions: ['What are your revenue projections?', 'What are key unit economics?', 'When will you be profitable?'],
        order: 9
      },
      {
        slideType: SlideType.FUNDING,
        title: 'Funding Ask',
        contentPrompt: 'Clearly state the funding amount requested, use of funds, and expected outcomes.',
        keyQuestions: ['How much funding do you need?', 'How will you use the funds?', 'What milestones will you achieve?'],
        order: 10
      }
    ];
  }

  async generatePitchDeck(
    request: PitchDeckRequest,
    onSlideGenerated: (slideNumber: number, totalSlides: number) => void = () => {}
  ): Promise<PitchDeck | null> {
    try {
      const slides: PitchDeckSlide[] = [];
      const totalSlides = 10; // Standard pitch deck length

      // PHASE 1: Generate all text content first (essential content)
      console.log('Phase 1: Generating text content for all slides...');
      for (let i = 0; i < this.slideTemplates.length; i++) {
        const template = this.slideTemplates[i];
        
        try {
          const slide = await this.generateSlide(template, request, slides);
          if (slide) {
            slides.push(slide);
            onSlideGenerated(i + 1, totalSlides);
            console.log(`Generated text for slide ${i + 1}/${totalSlides}: ${slide.title}`);
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            // If generateSlide returns null (failed but no exception), create fallback
            console.warn(`generateSlide returned null for slide ${i + 1}, creating fallback`);
            const fallbackSlide = this.createFallbackSlide(template, i + 1);
            slides.push(fallbackSlide);
            onSlideGenerated(i + 1, totalSlides);
            console.log(`Created fallback slide ${i + 1}/${totalSlides}: ${fallbackSlide.title}`);
          }
        } catch (error) {
          console.error(`Failed to generate slide ${i + 1}:`, error);
          // Create fallback slide - ensure we always have content
          const fallbackSlide = this.createFallbackSlide(template, i + 1);
          slides.push(fallbackSlide);
          onSlideGenerated(i + 1, totalSlides);
          console.log(`Created fallback slide ${i + 1}/${totalSlides}: ${fallbackSlide.title}`);
        }
      }
      
      // Create the pitch deck with text content (ready to use immediately)
      const pitchDeck: PitchDeck = {
        id: crypto.randomUUID(),
        title: `${request.companyName} Pitch Deck`,
        industry: request.industry,
        fundingStage: request.fundingStage,
        slides,
        totalSlides: 10, // Always 10 slides for standard pitch deck
        createdAt: Date.now(),
        currentSlide: 0,
        isCompleted: true, // Mark as completed since all text is generated
        completedAt: Date.now(),
        prompt: request.prompt,
        companyName: request.companyName,
        targetFunding: request.targetFunding,
        teamSize: request.teamSize,
        marketSize: request.marketSize || 'To be determined'
      };
      
      console.log('Phase 1 Complete: Text content generated for all slides');
      
      // PHASE 2: Generate images independently (enhancement, can fail gracefully)
      console.log('Phase 2: Generating images for slides...');
      await this.generateImagesForExistingPitchDeck(pitchDeck);

      return pitchDeck;
    } catch (error) {
      console.error('Failed to generate pitch deck:', error);
      return this.createFallbackPitchDeck(request);
    }
  }

  async generateSlide(
    template: SlideTemplate,
    context: PitchDeckRequest,
    previousSlides: PitchDeckSlide[]
  ): Promise<PitchDeckSlide | null> {
    try {
      const prompt = this.createSlidePrompt(template, context, previousSlides);
      
      console.log('Making server-side API call to:', this.API_ROUTE);

      const response = await fetch(this.API_ROUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          model: 'gpt-5-chat-latest',
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error response:', errorData);
        throw new Error(`Server API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }
      
      const content = data.choices[0].message.content;
      console.log('Extracted content:', content);

      return this.parseSlideResponse(content, template);
    } catch (error) {
      console.error('Failed to generate slide:', error);
      return null;
    }
  }

  async generateSlideImage(
    slide: PitchDeckSlide, 
    context: PitchDeckRequest
  ): Promise<string | null> {
    try {
      const imagePrompt = this.createImagePrompt(slide, context);
      
      console.log('Generating image for slide:', slide.title);

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      try {
        const response = await fetch(this.IMAGE_API_ROUTE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            size: '1024x1024',
            quality: 'hd'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          console.log('Image generation error:', errorData);
          throw new Error(`Image generation error: ${response.status} - ${errorData.error}`);
        }

        const data = await response.json();
        return data.data[0]?.url || null;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.warn('Image generation timed out after 5 minutes for slide:', slide.title);
          return null;
        }
        
        throw fetchError;
      }

    } catch (error) {
      console.error('Failed to generate slide image:', error);
      return null;
    }
  }

  /**
   * Generate image for a specific slide in an existing pitch deck
   */
  async generateImageForSlide(
    pitchDeck: PitchDeck, 
    slideIndex: number
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    if (slideIndex < 0 || slideIndex >= pitchDeck.slides.length) {
      return { success: false, error: 'Invalid slide index' };
    }

    const slide = pitchDeck.slides[slideIndex];
    console.log(`Generating image for slide ${slideIndex + 1}: ${slide.title}`);

    try {
      const imageUrl = await this.generateSlideImage(slide, {
        companyName: pitchDeck.companyName,
        industry: pitchDeck.industry,
        fundingStage: pitchDeck.fundingStage,
        targetFunding: pitchDeck.targetFunding,
        teamSize: pitchDeck.teamSize,
        prompt: pitchDeck.prompt,
        slideCount: 10
      });

      if (imageUrl) {
        return { success: true, imageUrl };
      } else {
        return { success: false, error: 'Failed to generate image' };
      }
    } catch (error) {
      console.error('Error generating image for slide:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generates images for an existing pitch deck independently
   * Implements circuit breaker pattern for resilient image generation
   */
  async generateImagesForExistingPitchDeck(pitchDeck: PitchDeck): Promise<void> {
    console.log('Starting independent image generation for pitch deck:', pitchDeck.title);
    
    // Reset circuit breaker for new pitch deck
    this.imageFailureCount = 0;
    this.circuitBreakerOpen = false;
    
    for (let i = 0; i < pitchDeck.slides.length; i++) {
      const slide = pitchDeck.slides[i];
      
      // Check circuit breaker
      if (this.circuitBreakerOpen) {
        console.warn(`Circuit breaker open, skipping image generation for remaining slides (${i + 1}-${pitchDeck.slides.length})`);
        break;
      }
      
      try {
        console.log(`Generating image for slide ${i + 1}/${pitchDeck.slides.length}: ${slide.title}`);
        
        const imageUrl = await this.generateSlideImage(slide, {
          companyName: pitchDeck.companyName,
          industry: pitchDeck.industry,
          fundingStage: pitchDeck.fundingStage,
          targetFunding: pitchDeck.targetFunding,
          teamSize: pitchDeck.teamSize,
          prompt: pitchDeck.prompt,
          slideCount: 10
        });
        
        if (imageUrl) {
          slide.imageUrl = imageUrl;
          this.imageFailureCount = 0; // Reset failure count on success
          console.log(`Successfully generated image for slide ${i + 1}`);
        } else {
          console.warn(`No image generated for slide ${i + 1}, continuing...`);
        }
        
        // Small delay between image generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        this.imageFailureCount++;
        console.warn(`Failed to generate image for slide ${i + 1} (failure ${this.imageFailureCount}/${this.maxImageFailures}):`, error);
        
        // Open circuit breaker if too many consecutive failures
        if (this.imageFailureCount >= this.maxImageFailures) {
          this.circuitBreakerOpen = true;
          console.warn(`Circuit breaker opened after ${this.maxImageFailures} consecutive image generation failures`);
        }
        
        // Continue to next slide - don't let image failures stop the process
      }
    }
    
    const successfulImages = pitchDeck.slides.filter(slide => slide.imageUrl).length;
    console.log(`Image generation complete: ${successfulImages}/${pitchDeck.slides.length} slides have images`);
  }

  private createImagePrompt(slide: PitchDeckSlide, context: PitchDeckRequest): string {
    const imagePrompts: Record<SlideType, string> = {
      [SlideType.TITLE]: `Simple, minimal logo design for ${context.companyName}. Clean typography, single focal element, white background, minimal color palette.`,
      [SlideType.PROBLEM]: `Minimal icon representing a business challenge. Single concept illustration, clean lines, simple geometric shapes, white background, one primary color.`,
      [SlideType.SOLUTION]: `Clean, simple diagram showing a solution concept. Minimal geometric shapes, clear visual hierarchy, white background, modern flat design.`,
      [SlideType.MARKET]: `Simple chart or graph visualization. Minimal data representation, clean lines, single color accent, white background, easy to read.`,
      [SlideType.BUSINESS_MODEL]: `Minimalist flowchart with simple boxes and arrows. Clean geometric shapes, single accent color, white background, clear visual flow.`,
      [SlideType.TRACTION]: `Simple upward trending chart or graph. Minimal design, clean lines, single color, white background, clear growth visualization.`,
      [SlideType.COMPETITION]: `Clean comparison chart or positioning diagram. Simple geometric elements, minimal color palette, white background, clear differentiation.`,
      [SlideType.TEAM]: `Simple silhouette figures or minimal avatar illustrations. Clean, professional icons, single color, white background, no complex details.`,
      [SlideType.FINANCIALS]: `Clean financial chart with minimal elements. Simple bar or line chart, single accent color, white background, easy to read labels.`,
      [SlideType.FUNDING]: `Minimal investment icon or simple growth arrow. Clean geometric design, single accent color, white background, clear concept visualization.`
    };

    const basePrompt = imagePrompts[slide.slideType] || 'Simple, minimal business illustration with clean design.';
    return `${basePrompt} Style: Minimalist, flat design, professional, white background, single primary color, clean lines, no clutter, business appropriate.`;
  }

  private createSlidePrompt(
    template: SlideTemplate,
    context: PitchDeckRequest,
    previousSlides: PitchDeckSlide[]
  ): string {
    const industryContext = this.getIndustryContext(context.industry);
    const fundingContext = this.getFundingStageContext(context.fundingStage);
    
    const previousContent = previousSlides.length > 0 
      ? `\n\nPrevious slides for context:\n${previousSlides.map(s => `${s.title}: ${s.content.substring(0, 100)}...`).join('\n')}`
      : '';

    return `
Create a compelling pitch deck slide for a ${context.industry} startup seeking ${context.fundingStage} funding.

COMPANY CONTEXT:
- Company Name: ${context.companyName}
- Startup Idea: ${context.prompt}
- Industry: ${context.industry} (${industryContext})
- Funding Stage: ${context.fundingStage} (${fundingContext})
- Target Funding: ${context.targetFunding}
- Team Size: ${context.teamSize}
- Market Size: ${context.marketSize || 'To be determined'}
- Existing Traction: ${context.existingTraction || 'Early stage'}
- Business Model: ${context.businessModel || 'To be defined'}

SLIDE REQUIREMENTS:
- Slide Type: ${template.slideType}
- Slide Title: ${template.title}
- Purpose: ${template.contentPrompt}
- Key Questions to Address: ${template.keyQuestions.join(', ')}

GUIDELINES:
- Keep content concise and impactful (suitable for a pitch presentation)
- Use bullet points for key information
- Make it investor-focused and compelling
- Include specific, relevant details based on the company context
- Ensure the content flows logically from previous slides
- Use professional, confident tone

${previousContent}

Return your response in the following JSON format:
{
  "title": "Specific slide title",
  "content": "Main slide content with clear structure and bullet points",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "speakerNotes": "Additional notes for the presenter"
}

Generate the ${template.slideType} slide now:
    `.trim();
  }

  private parseSlideResponse(response: string, template: SlideTemplate): PitchDeckSlide | null {
    try {
      console.log('Raw AI response:', response);
      
      // Extract JSON from response - try to find the last complete JSON object
      const jsonMatches = response.match(/\{[\s\S]*?\}/g);
      if (!jsonMatches || jsonMatches.length === 0) {
        console.error('No JSON found in response');
        throw new Error('No JSON found in response');
      }

      // Try parsing each JSON match, starting from the last one
      let slideData = null;
      for (let i = jsonMatches.length - 1; i >= 0; i--) {
        try {
          slideData = JSON.parse(jsonMatches[i]);
          console.log('Successfully parsed JSON:', slideData);
          break;
        } catch (parseError) {
          console.warn(`Failed to parse JSON attempt ${i + 1}:`, jsonMatches[i]);
          continue;
        }
      }

      if (!slideData) {
        throw new Error('No valid JSON could be parsed from response');
      }

      return {
        slideNumber: template.order,
        title: slideData.title || template.title,
        content: slideData.content || 'Content to be developed',
        slideType: template.slideType,
        keyPoints: slideData.keyPoints || [],
        speakerNotes: slideData.speakerNotes,
        isGenerated: true,
        generatedAt: Date.now()
      };
    } catch (error) {
      console.error('Failed to parse slide response:', error);
      console.error('Response was:', response);
      return this.createFallbackSlide(template, template.order);
    }
  }

  private createFallbackSlide(template: SlideTemplate, slideNumber: number): PitchDeckSlide {
    const fallbackContent = this.getFallbackContent(template.slideType);
    
    return {
      slideNumber,
      title: template.title,
      content: fallbackContent,
      slideType: template.slideType,
      keyPoints: [
        'This slide needs to be customized',
        'Add specific details about your company',
        'Include relevant data and metrics'
      ],
      isGenerated: true, // Mark as generated so progress tracking works
      generatedAt: Date.now()
    };
  }

  private getFallbackContent(slideType: SlideType): string {
    const fallbackMap: Record<SlideType, string> = {
      [SlideType.TITLE]: 'Company Name\nTagline: Brief description of value proposition\nIndustry: [Your Industry]',
      [SlideType.PROBLEM]: '• Large market problem affecting [target customers]\n• Current solutions are inadequate because [reasons]\n• This creates [specific pain points]',
      [SlideType.SOLUTION]: '• Our innovative approach: [solution description]\n• Key benefits: [benefit 1], [benefit 2], [benefit 3]\n• Competitive advantages: [advantages]',
      [SlideType.MARKET]: '• Target market: [customer segments]\n• Market size: $X billion TAM\n• Growing at X% annually',
      [SlideType.BUSINESS_MODEL]: '• Revenue model: [subscription/transaction/other]\n• Pricing strategy: [pricing approach]\n• Revenue streams: [stream 1], [stream 2]',
      [SlideType.TRACTION]: '• Early customers: [number/examples]\n• Key metrics: [growth numbers]\n• Partnerships: [strategic relationships]',
      [SlideType.COMPETITION]: '• Direct competitors: [competitor analysis]\n• Competitive advantage: [differentiators]\n• Market positioning: [unique position]',
      [SlideType.TEAM]: '• Founder(s): [names and backgrounds]\n• Key team members: [relevant experience]\n• Advisory board: [advisors if any]',
      [SlideType.FINANCIALS]: '• Revenue projections: [3-5 year forecast]\n• Key metrics: [unit economics]\n• Path to profitability: [timeline]',
      [SlideType.FUNDING]: '• Funding ask: [amount requested]\n• Use of funds: [allocation breakdown]\n• Milestones: [expected achievements]'
    };

    return fallbackMap[slideType] || 'Slide content to be developed';
  }

  private getIndustryContext(industry: IndustryType): string {
    const contexts: Record<IndustryType, string> = {
      [IndustryType.TECHNOLOGY]: 'Software, hardware, or tech-enabled solutions',
      [IndustryType.HEALTHCARE]: 'Medical devices, health tech, biotech, or wellness',
      [IndustryType.FINTECH]: 'Financial technology, payments, or banking solutions',
      [IndustryType.ECOMMERCE]: 'Online retail, marketplace, or e-commerce platform',
      [IndustryType.EDUCATION]: 'EdTech, online learning, or educational services',
      [IndustryType.SUSTAINABILITY]: 'Clean tech, renewable energy, or environmental solutions',
      [IndustryType.ENTERTAINMENT]: 'Media, gaming, content, or entertainment platforms',
      [IndustryType.FOOD_BEVERAGE]: 'Food tech, restaurant tech, or beverage innovation',
      [IndustryType.REAL_ESTATE]: 'PropTech, real estate services, or property management',
      [IndustryType.TRANSPORTATION]: 'Mobility, logistics, or transportation technology'
    };

    return contexts[industry] || 'Innovative technology solution';
  }

  private getFundingStageContext(stage: FundingStage): string {
    const contexts: Record<FundingStage, string> = {
      [FundingStage.PRE_SEED]: 'Very early stage, proving concept',
      [FundingStage.SEED]: 'Early stage with initial traction',
      [FundingStage.SERIES_A]: 'Growth stage with proven model',
      [FundingStage.SERIES_B]: 'Scaling stage with strong metrics',
      [FundingStage.SERIES_C]: 'Late stage preparing for exit',
      [FundingStage.GROWTH]: 'Mature company scaling rapidly'
    };

    return contexts[stage] || 'Seeking investment for growth';
  }

  private createFallbackPitchDeck(request: PitchDeckRequest): PitchDeck {
    const fallbackSlides = this.slideTemplates.map((template, index) => 
      this.createFallbackSlide(template, index + 1)
    );

    return {
      id: crypto.randomUUID(),
      title: `${request.companyName} Pitch Deck`,
      industry: request.industry,
      fundingStage: request.fundingStage,
      slides: fallbackSlides,
      totalSlides: fallbackSlides.length,
      createdAt: Date.now(),
      currentSlide: 0,
      isCompleted: true, // Mark as completed even if fallback
      completedAt: Date.now(),
      prompt: request.prompt,
      companyName: request.companyName,
      targetFunding: request.targetFunding,
      teamSize: request.teamSize,
      marketSize: request.marketSize || 'To be determined'
    };
  }
}
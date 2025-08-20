import { 
  BusinessPlan, 
  BusinessPlanRequest, 
  BusinessPlanSection, 
  BusinessPlanSectionType,
  GenerationProgress,
  GenerationPhase 
} from '@/types/pitchDeck';

interface SectionTemplate {
  sectionType: BusinessPlanSectionType;
  title: string;
  contentPrompt: string;
  keyQuestions: string[];
  order: number;
}

export class OnlineBusinessPlanGenerator {
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.aimlapi.com';

  constructor() {
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_AIML_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_AIML_API_KEY is not set');
    }
    this.apiKey = apiKey;
    console.log('BusinessPlanGenerator initialized with AI/ML API');
  }

  private getSectionTemplates(): SectionTemplate[] {
    return [
      {
        sectionType: BusinessPlanSectionType.EXECUTIVE_SUMMARY,
        title: 'Executive Summary',
        contentPrompt: 'Create a compelling executive summary that provides an overview of the business, its mission, and key success factors.',
        keyQuestions: [
          'What is the business opportunity?',
          'What is your unique value proposition?',
          'What are your key financial projections?',
          'What funding are you seeking?'
        ],
        order: 1
      },
      {
        sectionType: BusinessPlanSectionType.COMPANY_DESCRIPTION,
        title: 'Company Description',
        contentPrompt: 'Provide a detailed description of the company, its history, ownership structure, and legal status.',
        keyQuestions: [
          'What does your company do?',
          'What industry are you in?',
          'What makes your company unique?',
          'What is your company\'s mission and vision?'
        ],
        order: 2
      },
      {
        sectionType: BusinessPlanSectionType.MARKET_ANALYSIS,
        title: 'Market Analysis',
        contentPrompt: 'Analyze the target market, industry trends, customer segments, and competitive landscape.',
        keyQuestions: [
          'Who is your target market?',
          'What is the size of your market?',
          'What are the industry trends?',
          'Who are your main competitors?'
        ],
        order: 3
      },
      {
        sectionType: BusinessPlanSectionType.ORGANIZATION_MANAGEMENT,
        title: 'Organization & Management',
        contentPrompt: 'Describe the organizational structure, management team, and key personnel.',
        keyQuestions: [
          'What is your organizational structure?',
          'Who are the key team members?',
          'What experience does your team bring?',
          'What are the key roles and responsibilities?'
        ],
        order: 4
      },
      {
        sectionType: BusinessPlanSectionType.PRODUCTS_SERVICES,
        title: 'Products & Services',
        contentPrompt: 'Detail the products or services offered, their features, benefits, and development stage.',
        keyQuestions: [
          'What products or services do you offer?',
          'What are the key features and benefits?',
          'What is your development roadmap?',
          'How do you price your offerings?'
        ],
        order: 5
      },
      {
        sectionType: BusinessPlanSectionType.MARKETING_SALES,
        title: 'Marketing & Sales Strategy',
        contentPrompt: 'Outline the marketing strategy, sales approach, and customer acquisition plans.',
        keyQuestions: [
          'How will you reach your customers?',
          'What is your sales strategy?',
          'What are your marketing channels?',
          'How will you measure success?'
        ],
        order: 6
      },
      {
        sectionType: BusinessPlanSectionType.FUNDING_REQUEST,
        title: 'Funding Request',
        contentPrompt: 'Specify the funding requirements, how funds will be used, and future funding needs.',
        keyQuestions: [
          'How much funding do you need?',
          'How will you use the funding?',
          'What is your repayment plan?',
          'What future funding might be needed?'
        ],
        order: 7
      },
      {
        sectionType: BusinessPlanSectionType.FINANCIAL_PROJECTIONS,
        title: 'Financial Projections',
        contentPrompt: 'Present financial forecasts, including income statements, cash flow, and break-even analysis.',
        keyQuestions: [
          'What are your revenue projections?',
          'What are your main expenses?',
          'When will you break even?',
          'What are your profit margins?'
        ],
        order: 8
      },
      {
        sectionType: BusinessPlanSectionType.APPENDIX,
        title: 'Appendix',
        contentPrompt: 'Include supporting documents, additional data, and supplementary information.',
        keyQuestions: [
          'What supporting documents are needed?',
          'What additional data supports your plan?',
          'What technical specifications are relevant?',
          'What legal documents are important?'
        ],
        order: 9
      }
    ];
  }

  async generateBusinessPlan(
    request: BusinessPlanRequest,
    onSectionGenerated: (sectionNumber: number, totalSections: number) => void,
    extractedContent?: string
  ): Promise<BusinessPlan | null> {
    try {
      console.log('Starting business plan generation for:', request.companyName);
      
      const sections: BusinessPlanSection[] = [];
      const templates = this.getSectionTemplates();
      
      // Generate each section
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        console.log(`Generating section ${i + 1}: ${template.title}`);
        
        const section = await this.generateSection(template, request, sections, extractedContent);
        if (section) {
          sections.push(section);
        }
        
        onSectionGenerated(i + 1, templates.length);
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create the business plan
      const businessPlan: BusinessPlan = {
        id: `bp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${request.companyName} Business Plan`,
        industry: request.industry,
        fundingStage: request.fundingStage,
        sections,
        totalSections: templates.length,
        createdAt: Date.now(),
        currentSection: 0,
        isCompleted: true,
        completedAt: Date.now(),
        prompt: request.prompt,
        companyName: request.companyName,
        targetFunding: request.targetFunding,
        teamSize: request.teamSize,
        marketSize: request.marketSize || 'Not specified'
      };

      console.log('Business plan generated successfully:', businessPlan.title);
      return businessPlan;

    } catch (error) {
      console.error('Failed to generate business plan:', error);
      return null;
    }
  }

  private async generateSection(
    template: SectionTemplate,
    context: BusinessPlanRequest,
    previousSections: BusinessPlanSection[],
    extractedContent?: string
  ): Promise<BusinessPlanSection | null> {
    try {
      const prompt = this.buildSectionPrompt(template, context, previousSections, extractedContent);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-chat-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a professional business plan writer. Generate ONLY the section content in a clean, professional format suitable for direct export to PDF. Do NOT include: conversation phrases, markdown formatting, emojis, section headers, transitions, or questions to the user. Write in formal business language with clear paragraphs and bullet points where appropriate.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI/ML API Response:', JSON.stringify(data, null, 2));
      
      // Check if we have the expected response structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid API response structure');
      }
      
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        console.error('No content in API response:', data.choices[0]);
        throw new Error('No content generated');
      }

      // Extract key points from the content
      const keyPoints = this.extractKeyPoints(content, template.keyQuestions);

      const section: BusinessPlanSection = {
        sectionNumber: template.order,
        title: template.title,
        content,
        sectionType: template.sectionType,
        keyPoints,
        isGenerated: true,
        generatedAt: Date.now()
      };

      return section;

    } catch (error) {
      console.error(`Failed to generate section ${template.title}:`, error);
      return null;
    }
  }

  private buildSectionPrompt(
    template: SectionTemplate,
    context: BusinessPlanRequest,
    previousSections: BusinessPlanSection[],
    extractedContent?: string
  ): string {
    let prompt = `Write the "${template.title}" section content for a business plan. Output ONLY the section body text in professional business language. Do NOT include section titles, headers, conversational phrases, or questions.

Company Information:
- Name: ${context.companyName}
- Industry: ${context.industry}
- Funding Stage: ${context.fundingStage}
- Target Funding: ${context.targetFunding}
- Team Size: ${context.teamSize}
- Market Size: ${context.marketSize || 'Not specified'}

Business Overview: ${context.prompt}

Section Requirements: ${template.contentPrompt}

Address these key areas:
${template.keyQuestions.map(q => `• ${q}`).join('\n')}

Output Requirements:
- Professional business writing style
- Direct, factual content ready for PDF export
- Use paragraphs and bullet points appropriately
- Include specific data and metrics where relevant
- No markdown, emojis, or conversational elements`;

    // Add extracted content from uploaded files if available
    if (extractedContent && extractedContent.trim()) {
      prompt += `\n\nExtracted Content from Company Documents:
${extractedContent.substring(0, 3000)}${extractedContent.length > 3000 ? '...' : ''}

Please use this information to make the business plan section more accurate and specific to the company.`;
    }

    // Add context from previous sections if available
    if (previousSections.length > 0) {
      prompt += `\n\nContext from previous sections:\n`;
      previousSections.forEach(section => {
        prompt += `${section.title}: ${section.content.substring(0, 200)}...\n`;
      });
    }

    return prompt;
  }

  private extractKeyPoints(content: string, questions: string[]): string[] {
    // Simple extraction of key points based on common patterns
    const lines = content.split('\n');
    const keyPoints: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[•\-\*]\s/) || trimmed.match(/^\d+\.\s/)) {
        keyPoints.push(trimmed.replace(/^[•\-\*\d+\.\s]+/, ''));
      }
    }
    
    // If no bullet points found, create key points based on first sentences of paragraphs
    if (keyPoints.length === 0) {
      const paragraphs = content.split('\n\n');
      paragraphs.slice(0, 4).forEach(paragraph => {
        const firstSentence = paragraph.trim().split('.')[0];
        if (firstSentence && firstSentence.length > 20) {
          keyPoints.push(firstSentence + '.');
        }
      });
    }
    
    return keyPoints.slice(0, 5); // Limit to 5 key points
  }
}
// Types for pitch deck generation based on story mode architecture
export interface PitchDeckSlide {
  slideNumber: number;
  title: string;
  content: string;
  slideType: SlideType;
  keyPoints: string[];
  speakerNotes?: string;
  imageUrl?: string;
  imagePrompt?: string;
  isGenerated: boolean;
  generatedAt?: number;
}

export enum SlideType {
  TITLE = 'title',
  PROBLEM = 'problem', 
  SOLUTION = 'solution',
  MARKET = 'market',
  BUSINESS_MODEL = 'business_model',
  TRACTION = 'traction',
  COMPETITION = 'competition',
  TEAM = 'team',
  FINANCIALS = 'financials',
  FUNDING = 'funding'
}

export enum IndustryType {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  FINTECH = 'fintech',
  ECOMMERCE = 'ecommerce',
  EDUCATION = 'education',
  SUSTAINABILITY = 'sustainability',
  ENTERTAINMENT = 'entertainment',
  FOOD_BEVERAGE = 'food_beverage',
  REAL_ESTATE = 'real_estate',
  TRANSPORTATION = 'transportation'
}

export enum FundingStage {
  PRE_SEED = 'pre_seed',
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
  SERIES_C = 'series_c',
  GROWTH = 'growth'
}

export interface PitchDeck {
  id: string;
  title: string;
  industry: IndustryType;
  fundingStage: FundingStage;
  slides: PitchDeckSlide[];
  totalSlides: number;
  createdAt: number;
  completedAt?: number;
  currentSlide: number;
  isCompleted: boolean;
  prompt: string;
  companyName: string;
  targetFunding: string;
  teamSize: number;
  marketSize: string;
}

export interface PitchDeckRequest {
  prompt: string;
  industry: IndustryType;
  fundingStage: FundingStage;
  companyName: string;
  targetFunding: string;
  teamSize: number;
  marketSize?: string;
  existingTraction?: string;
  competitiveAdvantage?: string;
  businessModel?: string;
  slideCount: number; // Fixed at 10 for standard pitch deck
}

export interface SlideTemplate {
  slideType: SlideType;
  title: string;
  contentPrompt: string;
  keyQuestions: string[];
  order: number;
}

// Progress tracking similar to story mode
export interface GenerationProgress {
  currentSlide: number;
  totalSlides: number;
  phase: GenerationPhase;
  isGenerating: boolean;
  error?: string;
}

export enum GenerationPhase {
  PREPARING = 'preparing',
  GENERATING_SLIDES = 'generating_slides',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Repository interfaces matching Android pattern
export interface PitchDeckRepository {
  getAllPitchDecks(): Promise<PitchDeck[]>;
  getPitchDeckById(id: string): Promise<PitchDeck | null>;
  savePitchDeck(pitchDeck: PitchDeck): Promise<void>;
  updatePitchDeck(pitchDeck: PitchDeck): Promise<void>;
  deletePitchDeck(id: string): Promise<void>;
  updateCurrentSlide(id: string, slideNumber: number): Promise<void>;
  markPitchDeckCompleted(id: string): Promise<void>;
}

// AI service interface
export interface PitchDeckGenerator {
  generatePitchDeck(
    request: PitchDeckRequest,
    onSlideGenerated: (slideNumber: number, totalSlides: number) => void
  ): Promise<PitchDeck | null>;
  generateSlide(
    template: SlideTemplate,
    context: PitchDeckRequest,
    previousSlides: PitchDeckSlide[]
  ): Promise<PitchDeckSlide | null>;
}

// State management interface matching Android ViewModel pattern
export interface PitchDeckState {
  isGenerating: boolean;
  generationProgress: GenerationProgress;
  currentPitchDeck: PitchDeck | null;
  allPitchDecks: PitchDeck[];
  error: string | null;
  isLoading: boolean;
  currentSlide: number;
  showPitchDeckList: boolean;
  showCreator: boolean;
  lastPitchDeckRequest: PitchDeckRequest | null;
}

// Business Plan Types
export interface BusinessPlanSection {
  sectionNumber: number;
  title: string;
  content: string;
  sectionType: BusinessPlanSectionType;
  keyPoints: string[];
  isGenerated: boolean;
  generatedAt?: number;
}

export enum BusinessPlanSectionType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  COMPANY_DESCRIPTION = 'company_description',
  MARKET_ANALYSIS = 'market_analysis',
  ORGANIZATION_MANAGEMENT = 'organization_management',
  PRODUCTS_SERVICES = 'products_services',
  MARKETING_SALES = 'marketing_sales',
  FUNDING_REQUEST = 'funding_request',
  FINANCIAL_PROJECTIONS = 'financial_projections',
  APPENDIX = 'appendix'
}

export interface BusinessPlan {
  id: string;
  title: string;
  industry: IndustryType;
  fundingStage: FundingStage;
  sections: BusinessPlanSection[];
  totalSections: number;
  createdAt: number;
  completedAt?: number;
  currentSection: number;
  isCompleted: boolean;
  prompt: string;
  companyName: string;
  targetFunding: string;
  teamSize: number;
  marketSize: string;
}

export interface BusinessPlanRequest {
  prompt: string;
  industry: IndustryType;
  fundingStage: FundingStage;
  companyName: string;
  targetFunding: string;
  teamSize: number;
  marketSize?: string;
  existingTraction?: string;
  competitiveAdvantage?: string;
  businessModel?: string;
  sectionCount: number; // Fixed at 9 for standard business plan
}

export interface BusinessPlanState {
  isGenerating: boolean;
  generationProgress: GenerationProgress;
  currentBusinessPlan: BusinessPlan | null;
  allBusinessPlans: BusinessPlan[];
  error: string | null;
  isLoading: boolean;
  currentSection: number;
  showBusinessPlanList: boolean;
  showCreator: boolean;
  lastBusinessPlanRequest: BusinessPlanRequest | null;
}
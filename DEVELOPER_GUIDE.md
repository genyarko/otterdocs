# PitchDeckGPT Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Core Patterns](#core-patterns)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Component Architecture](#component-architecture)
8. [Data Flow](#data-flow)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

PitchDeckGPT follows a modern React architecture inspired by Android's ViewModel pattern, emphasizing clean separation of concerns and maintainable code.

### Key Architectural Principles

1. **Repository Pattern**: Data persistence abstraction layer
2. **ViewModel Pattern**: Custom React hooks for state management
3. **Progressive Generation**: Real-time AI content creation
4. **Component Modularity**: Reusable, testable components
5. **Type Safety**: Strict TypeScript throughout

### Technology Stack

```typescript
{
  "frontend": "Next.js 15.4.7 + React 19.1.0",
  "language": "TypeScript (strict mode)",
  "styling": "TailwindCSS 4.x",
  "aiIntegration": "OpenAI GPT-5 + DALL-E",
  "stateManagement": "Custom hooks (ViewModel pattern)",
  "dataLayer": "Repository pattern with LocalStorage",
  "pdfGeneration": "Browser-based PDF creation",
  "buildTools": "Next.js + ESLint + TypeScript"
}
```

## Development Setup

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
npm >= 8.0.0

# Optional but recommended
Git
VS Code with TypeScript extension
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd pitchdeckgpt

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Add your OpenAI API key to .env.local

# Start development server
npm run dev

# Access application
open http://localhost:3000
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
NEXT_PUBLIC_API_BASE_URL=https://api.openai.com/v1  # Optional
```

### Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler check
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate-slide/    # Slide generation endpoint
│   │   ├── generate-image/    # Image generation endpoint
│   │   ├── investors/         # Investor data endpoints
│   │   └── parse-file/        # File parsing utilities
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page component
├── components/            # React components
│   ├── BusinessPlanCreator.tsx
│   ├── BusinessPlanViewer.tsx
│   ├── GenerationProgress.tsx
│   ├── InvestorTracker.tsx
│   ├── PitchDeckCreator.tsx
│   ├── PitchDeckViewer.tsx
│   └── ...
├── hooks/                 # Custom hooks (ViewModel layer)
│   ├── useBusinessPlan.ts
│   └── usePitchDeck.ts
├── services/             # Business logic layer
│   ├── businessPlanGenerator.ts
│   ├── pdfExportService.ts
│   ├── pitchDeckGenerator.ts
│   └── pitchDeckRepository.ts
└── types/               # TypeScript definitions
    ├── investor.ts
    └── pitchDeck.ts
```

## Core Patterns

### Repository Pattern

The Repository pattern abstracts data persistence, making it easy to switch between storage mechanisms.

```typescript
// Interface definition
interface PitchDeckRepository {
  getAllPitchDecks(): Promise<PitchDeck[]>;
  getPitchDeckById(id: string): Promise<PitchDeck | null>;
  savePitchDeck(pitchDeck: PitchDeck): Promise<void>;
  deletePitchDeck(id: string): Promise<void>;
  updateCurrentSlide(id: string, slideNumber: number): Promise<void>;
  markPitchDeckCompleted(id: string): Promise<void>;
}

// Implementation
export class LocalPitchDeckRepository implements PitchDeckRepository {
  private readonly STORAGE_KEY = 'pitchdecks';
  
  async getAllPitchDecks(): Promise<PitchDeck[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const pitchDecks = JSON.parse(stored) as PitchDeck[];
      return pitchDecks.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Failed to load pitch decks:', error);
      return [];
    }
  }
  
  // ... other methods
}
```

### ViewModel Pattern (Custom Hooks)

Custom hooks encapsulate business logic and state management, similar to Android ViewModels.

```typescript
export function usePitchDeck() {
  const [state, setState] = useState<PitchDeckState>({
    isGenerating: false,
    generationProgress: initialProgress,
    currentPitchDeck: null,
    allPitchDecks: [],
    error: null,
    isLoading: false,
    currentSlide: 0,
    showPitchDeckList: true,
    showCreator: false,
    lastPitchDeckRequest: null
  });

  // Services
  const [generator] = useState(() => new OnlinePitchDeckGenerator());
  const [repository] = useState(() => new LocalPitchDeckRepository());

  // Business logic
  const generatePitchDeck = useCallback(async (request: PitchDeckRequest) => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }));
      
      const pitchDeck = await generator.generatePitchDeck(
        request,
        (currentSlide, totalSlides) => {
          setState(prev => ({
            ...prev,
            generationProgress: { ...prev.generationProgress, currentSlide, totalSlides }
          }));
        }
      );
      
      await repository.savePitchDeck(pitchDeck);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentPitchDeck: pitchDeck,
        showPitchDeckList: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, isGenerating: false }));
    }
  }, [generator, repository]);

  return {
    // State
    ...state,
    
    // Actions
    generatePitchDeck,
    loadPitchDeck,
    deletePitchDeck,
    // ... other actions
    
    // Computed properties
    canGoNext: state.currentPitchDeck 
      ? state.currentSlide < state.currentPitchDeck.totalSlides - 1 
      : false,
    progressPercentage: state.currentPitchDeck 
      ? Math.round((state.currentSlide + 1) / state.currentPitchDeck.totalSlides * 100)
      : 0
  };
}
```

### Progressive Generation

AI content is generated progressively with real-time progress updates.

```typescript
export class OnlinePitchDeckGenerator implements PitchDeckGenerator {
  async generatePitchDeck(
    request: PitchDeckRequest,
    onProgress?: (currentSlide: number, totalSlides: number) => void
  ): Promise<PitchDeck> {
    const slides: PitchDeckSlide[] = [];
    
    for (let i = 0; i < SLIDE_TYPES.length; i++) {
      onProgress?.(i, SLIDE_TYPES.length);
      
      const slide = await this.generateSlide(request, SLIDE_TYPES[i], slides);
      slides.push(slide);
    }
    
    return {
      id: generateId(),
      title: request.companyName,
      slides,
      totalSlides: slides.length,
      // ... other properties
    };
  }
}
```

## State Management

### State Architecture

Each module has its own state management hook:

- `usePitchDeck()` - Pitch deck state and operations
- `useBusinessPlan()` - Business plan state and operations
- Component-level state for UI interactions

### State Flow

```
User Action → Hook Function → Service Layer → Repository → LocalStorage
     ↓
UI Update ← State Update ← Response ← Business Logic ← Data Layer
```

### Error Handling

```typescript
const handleError = useCallback((error: Error, context: string) => {
  console.error(`${context}:`, error);
  setState(prev => ({
    ...prev,
    error: error.message,
    isLoading: false,
    isGenerating: false
  }));
}, []);
```

## API Integration

### OpenAI Integration

```typescript
export class OnlinePitchDeckGenerator {
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('/api/generate-slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.content;
  }
}
```

### API Routes

```typescript
// app/api/generate-slide/route.ts
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    return Response.json({ 
      content: completion.choices[0].message.content 
    });
  } catch (error) {
    return Response.json(
      { error: 'Generation failed' }, 
      { status: 500 }
    );
  }
}
```

## Component Architecture

### Component Hierarchy

```
App (page.tsx)
├── PitchDeckCreator
├── PitchDeckList
├── PitchDeckViewer
│   ├── GenerationProgress
│   └── InvestorTracker
├── BusinessPlanCreator
├── BusinessPlanList
└── BusinessPlanViewer
```

### Component Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Props Interface**: Well-defined TypeScript interfaces
3. **Error Boundaries**: Graceful error handling
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Responsive**: Mobile-first design

### Example Component Structure

```typescript
interface PitchDeckViewerProps {
  pitchDeck: PitchDeck;
  currentSlide: number;
  onSlideChange: (slideNumber: number) => void;
  onBack: () => void;
  // ... other props
}

export default function PitchDeckViewer({
  pitchDeck,
  currentSlide,
  onSlideChange,
  onBack,
}: PitchDeckViewerProps) {
  // Component logic
  const slide = pitchDeck.slides[currentSlide];
  
  if (!slide) {
    return <ErrorState onBack={onBack} />;
  }
  
  return (
    <div className="pitch-deck-viewer">
      <Header onBack={onBack} title={pitchDeck.title} />
      <SlideContent slide={slide} />
      <Navigation 
        currentSlide={currentSlide}
        totalSlides={pitchDeck.totalSlides}
        onSlideChange={onSlideChange}
      />
    </div>
  );
}
```

## Data Flow

### Complete Data Flow Example

```
1. User clicks "Generate Pitch Deck"
   ↓
2. PitchDeckCreator calls hook.generatePitchDeck()
   ↓
3. usePitchDeck hook updates state (isGenerating: true)
   ↓
4. Hook calls OnlinePitchDeckGenerator.generatePitchDeck()
   ↓
5. Generator makes API calls to /api/generate-slide
   ↓
6. API route calls OpenAI GPT-4
   ↓
7. Progress callbacks update UI in real-time
   ↓
8. Generated pitch deck saved via Repository
   ↓
9. State updated with new pitch deck
   ↓
10. UI renders PitchDeckViewer component
```

### Type Safety

```typescript
// Strict type definitions
export interface PitchDeck {
  id: string;
  title: string;
  description: string;
  industry: Industry;
  fundingStage: FundingStage;
  fundingAmount: string;
  slides: PitchDeckSlide[];
  totalSlides: number;
  currentSlide: number;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface PitchDeckSlide {
  title: string;
  slideType: SlideType;
  content: string;
  keyPoints: string[];
  speakerNotes: string;
  imageUrl?: string;
  imagePrompt?: string;
  isGenerated: boolean;
}
```

## Testing Strategy

### Unit Testing

```typescript
// Example test structure
describe('usePitchDeck', () => {
  it('should generate pitch deck successfully', async () => {
    const { result } = renderHook(() => usePitchDeck());
    
    await act(async () => {
      await result.current.generatePitchDeck(mockRequest);
    });
    
    expect(result.current.currentPitchDeck).toBeDefined();
    expect(result.current.isGenerating).toBe(false);
  });
});
```

### Integration Testing

```typescript
// Component integration tests
describe('PitchDeckViewer', () => {
  it('should navigate between slides', () => {
    render(
      <PitchDeckViewer 
        pitchDeck={mockPitchDeck}
        currentSlide={0}
        onSlideChange={mockOnSlideChange}
        onBack={mockOnBack}
      />
    );
    
    fireEvent.click(screen.getByText('Next'));
    expect(mockOnSlideChange).toHaveBeenCalledWith(1);
  });
});
```

### E2E Testing Strategy

```typescript
// Playwright/Cypress example
test('complete pitch deck creation flow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="company-name"]', 'Test Company');
  await page.click('[data-testid="generate-button"]');
  await page.waitForSelector('[data-testid="pitch-deck-viewer"]');
  
  expect(await page.textContent('h1')).toBe('Test Company');
});
```

## Deployment

### Build Process

```bash
# Production build
npm run build

# Build output
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── standalone/      # Standalone deployment files
```

### Environment Configuration

```typescript
// next.config.ts
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    typedRoutes: true,
  },
};
```

### Performance Optimization

```typescript
// Dynamic imports for code splitting
const PitchDeckViewer = dynamic(() => import('./PitchDeckViewer'), {
  loading: () => <LoadingSpinner />,
});

// Image optimization
import Image from 'next/image';

// API route optimization
export const runtime = 'edge'; // For faster cold starts
```

## Contributing Guidelines

### Code Style

```typescript
// Use TypeScript strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true
  }
}

// ESLint configuration
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ]
}
```

### Commit Convention

```bash
# Commit message format
type(scope): description

# Examples
feat(pitch-deck): add image regeneration functionality
fix(navigation): resolve back button issue
docs(readme): update installation instructions
refactor(hooks): simplify state management logic
```

### Pull Request Process

1. **Branch Naming**: `feature/description` or `fix/description`
2. **Testing**: All tests must pass
3. **Type Safety**: No TypeScript errors
4. **Documentation**: Update relevant docs
5. **Code Review**: At least one approval required

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes with proper testing
npm run test
npm run lint
npm run type-check

# 3. Commit with conventional format
git commit -m "feat(component): add new feature"

# 4. Push and create PR
git push origin feature/new-feature
```

### Architecture Guidelines

1. **Repository Pattern**: All data operations through repository
2. **ViewModel Hooks**: Business logic in custom hooks
3. **Component Props**: Use interfaces for all props
4. **Error Handling**: Consistent error boundaries
5. **Performance**: Lazy loading and code splitting
6. **Accessibility**: WCAG 2.1 AA compliance

---

*This developer guide is maintained alongside the codebase. Please keep it updated when making architectural changes.*
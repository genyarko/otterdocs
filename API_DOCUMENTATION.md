# PitchDeckGPT API Documentation

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Slide Generation API](#slide-generation-api)
4. [Image Generation API](#image-generation-api)
5. [Investor Management API](#investor-management-api)
6. [File Processing API](#file-processing-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Examples](#examples)
10. [SDK Usage](#sdk-usage)

## API Overview

PitchDeckGPT provides several API endpoints for content generation and data management. All APIs are built using Next.js App Router and follow RESTful conventions.

### Base URL

```
http://localhost:3000/api  # Development
https://your-domain.com/api  # Production
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-slide` | POST | Generate slide content using GPT-5 |
| `/api/generate-image` | POST | Generate images using DALL-E |
| `/api/image-proxy` | GET | Proxy for external image URLs |
| `/api/investors` | GET, POST | Manage investor data |
| `/api/investors/[id]` | GET, PUT, DELETE | Individual investor operations |
| `/api/parse-file` | POST | Parse uploaded files |
| `/api/test-upload` | POST | Test file upload functionality |

## Authentication

Currently, the API uses API key authentication through environment variables. No user authentication is required for endpoints.

### Environment Setup

```bash
# Required environment variables
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
NEXT_PUBLIC_API_BASE_URL=https://api.openai.com/v1
```

### Request Headers

```http
Content-Type: application/json
Accept: application/json
```

## Slide Generation API

### Generate Slide Content

Generate slide content using GPT-5 based on company information and slide type.

#### Endpoint
```http
POST /api/generate-slide
```

#### Request Body

```typescript
interface SlideGenerationRequest {
  prompt: string;                    // Full prompt for slide generation
  companyName: string;              // Company name
  description: string;              // Company description
  industry: string;                 // Industry sector
  fundingStage: string;            // Funding stage
  slideType: SlideType;            // Type of slide to generate
  existingSlides?: PitchDeckSlide[]; // Previously generated slides for context
}
```

#### Example Request

```json
{
  "prompt": "Generate a problem statement slide for TechStartup, a SaaS platform for small businesses in the technology industry at seed stage.",
  "companyName": "TechStartup",
  "description": "A revolutionary SaaS platform that helps small businesses automate their workflows",
  "industry": "Technology",
  "fundingStage": "Seed",
  "slideType": "PROBLEM_STATEMENT"
}
```

#### Response

```typescript
interface SlideGenerationResponse {
  success: boolean;
  slide?: {
    title: string;
    content: string;
    keyPoints: string[];
    speakerNotes: string;
    slideType: SlideType;
    isGenerated: boolean;
  };
  error?: string;
}
```

#### Example Response

```json
{
  "success": true,
  "slide": {
    "title": "The Problem",
    "content": "Small businesses struggle with manual workflow processes that consume 40% of their productive time. Current solutions are either too complex or too expensive for SMBs.",
    "keyPoints": [
      "Manual processes waste 40% of productive time",
      "Existing solutions are overcomplicated",
      "SMBs need affordable, simple automation"
    ],
    "speakerNotes": "Start by establishing the pain point that 73% of small businesses report manual workflow management as their biggest operational challenge.",
    "slideType": "PROBLEM_STATEMENT",
    "isGenerated": true
  }
}
```

#### Error Responses

```json
// Invalid request
{
  "success": false,
  "error": "Missing required field: companyName"
}

// OpenAI API error
{
  "success": false,
  "error": "Failed to generate content: Rate limit exceeded"
}
```

## Image Generation API

### Generate Slide Images

Generate professional images for slides using DALL-E.

#### Endpoint
```http
POST /api/generate-image
```

#### Request Body

```typescript
interface ImageGenerationRequest {
  slideTitle: string;        // Title of the slide
  slideContent: string;      // Content of the slide
  slideType: SlideType;      // Type of slide
  companyName: string;       // Company name for context
  industry: string;          // Industry for appropriate styling
}
```

#### Example Request

```json
{
  "slideTitle": "Market Opportunity",
  "slideContent": "The global SaaS market is expected to reach $716 billion by 2028",
  "slideType": "MARKET_OPPORTUNITY",
  "companyName": "TechStartup",
  "industry": "Technology"
}
```

#### Response

```typescript
interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imagePrompt?: string;
  error?: string;
}
```

#### Example Response

```json
{
  "success": true,
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/private/...",
  "imagePrompt": "Professional business chart showing SaaS market growth, clean modern design, blue and white color scheme"
}
```

### Image Proxy

Proxy external image URLs to avoid CORS issues.

#### Endpoint
```http
GET /api/image-proxy?url={encoded_image_url}
```

#### Example Request
```http
GET /api/image-proxy?url=https%3A//example.com/image.jpg
```

#### Response
Returns the image data with appropriate headers.

## Investor Management API

### List All Investors

Retrieve all investors in the database.

#### Endpoint
```http
GET /api/investors
```

#### Response

```typescript
interface InvestorsResponse {
  investors: Investor[];
}

interface Investor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: InvestorType;
  focusAreas: string[];
  checkSize: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Create New Investor

Add a new investor to the database.

#### Endpoint
```http
POST /api/investors
```

#### Request Body

```json
{
  "name": "John Smith",
  "email": "john@venture-capital.com",
  "phone": "+1-555-0123",
  "type": "VC",
  "focusAreas": ["Technology", "SaaS", "B2B"],
  "checkSize": "$1M - $5M",
  "notes": "Focused on early-stage B2B SaaS companies"
}
```

#### Response

```json
{
  "success": true,
  "investor": {
    "id": "inv_123456",
    "name": "John Smith",
    "email": "john@venture-capital.com",
    "phone": "+1-555-0123",
    "type": "VC",
    "focusAreas": ["Technology", "SaaS", "B2B"],
    "checkSize": "$1M - $5M",
    "notes": "Focused on early-stage B2B SaaS companies",
    "createdAt": 1640995200000,
    "updatedAt": 1640995200000
  }
}
```

### Individual Investor Operations

#### Get Investor by ID
```http
GET /api/investors/[id]
```

#### Update Investor
```http
PUT /api/investors/[id]
```

#### Delete Investor
```http
DELETE /api/investors/[id]
```

## File Processing API

### Parse Uploaded Files

Process uploaded files and extract relevant information.

#### Endpoint
```http
POST /api/parse-file
```

#### Request Body
```typescript
interface FileParseRequest {
  file: File;                // Uploaded file
  type: 'company-info' | 'investor-list' | 'business-plan';
}
```

#### Response
```typescript
interface FileParseResponse {
  success: boolean;
  data?: {
    companyName?: string;
    description?: string;
    investors?: Partial<Investor>[];
    businessPlan?: Partial<BusinessPlan>;
  };
  error?: string;
}
```

### Test Upload

Test file upload functionality.

#### Endpoint
```http
POST /api/test-upload
```

#### Request Body
Multipart form data with file attachment.

#### Response
```json
{
  "success": true,
  "filename": "test-file.pdf",
  "size": 1024,
  "type": "application/pdf"
}
```

## Error Handling

### Standard Error Response

All API endpoints return errors in a consistent format:

```typescript
interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Request validation failed | 400 |
| `MISSING_FIELDS` | Required fields missing | 400 |
| `UNAUTHORIZED` | Invalid or missing API key | 401 |
| `RATE_LIMITED` | Too many requests | 429 |
| `OPENAI_ERROR` | OpenAI API error | 500 |
| `GENERATION_FAILED` | Content generation failed | 500 |
| `INTERNAL_ERROR` | Server error | 500 |

### Example Error Responses

```json
// Validation error
{
  "success": false,
  "error": "Invalid slide type provided",
  "code": "INVALID_REQUEST",
  "details": {
    "field": "slideType",
    "provided": "INVALID_TYPE",
    "expected": ["TITLE", "PROBLEM_STATEMENT", "SOLUTION", ...]
  }
}

// Rate limiting
{
  "success": false,
  "error": "Rate limit exceeded. Please try again in 60 seconds.",
  "code": "RATE_LIMITED",
  "details": {
    "retryAfter": 60
  }
}
```

## Rate Limiting

### Limits

- **Slide Generation**: 10 requests per minute per IP
- **Image Generation**: 5 requests per minute per IP
- **Investor Operations**: 100 requests per minute per IP

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640995200
```

## Examples

### Complete Pitch Deck Generation Flow

```typescript
// 1. Generate all slides
const slides = [];
const slideTypes = ['TITLE', 'PROBLEM_STATEMENT', 'SOLUTION', ...];

for (const slideType of slideTypes) {
  const response = await fetch('/api/generate-slide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: 'TechStartup',
      description: 'Revolutionary SaaS platform',
      industry: 'Technology',
      fundingStage: 'Seed',
      slideType,
      existingSlides: slides
    })
  });
  
  const result = await response.json();
  if (result.success) {
    slides.push(result.slide);
  }
}

// 2. Generate images for each slide
for (let i = 0; i < slides.length; i++) {
  const imageResponse = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slideTitle: slides[i].title,
      slideContent: slides[i].content,
      slideType: slides[i].slideType,
      companyName: 'TechStartup',
      industry: 'Technology'
    })
  });
  
  const imageResult = await imageResponse.json();
  if (imageResult.success) {
    slides[i].imageUrl = imageResult.imageUrl;
    slides[i].imagePrompt = imageResult.imagePrompt;
  }
}
```

### Investor Management

```typescript
// Create investor
const createInvestor = async (investorData) => {
  const response = await fetch('/api/investors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(investorData)
  });
  
  return await response.json();
};

// Get all investors
const getInvestors = async () => {
  const response = await fetch('/api/investors');
  return await response.json();
};

// Update investor
const updateInvestor = async (id, updates) => {
  const response = await fetch(`/api/investors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  return await response.json();
};
```

## SDK Usage

### TypeScript SDK Example

```typescript
class PitchDeckGPTClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }
  
  async generateSlide(request: SlideGenerationRequest): Promise<SlideGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/generate-slide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  // ... other methods
}

// Usage
const client = new PitchDeckGPTClient();

try {
  const slide = await client.generateSlide({
    companyName: 'MyStartup',
    description: 'AI-powered solution',
    industry: 'Technology',
    fundingStage: 'Seed',
    slideType: 'PROBLEM_STATEMENT'
  });
  
  console.log('Generated slide:', slide);
} catch (error) {
  console.error('Generation failed:', error);
}
```

### Error Handling with SDK

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleAPIResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new APIError(
      data.error || 'Unknown error',
      data.code,
      response.status,
      data.details
    );
  }
  
  return data;
}
```

## Webhook Support (Future Enhancement)

### Webhook Events

Future versions may support webhooks for:

- `slide.generated` - When a slide is successfully generated
- `image.generated` - When an image is successfully generated
- `pitch_deck.completed` - When a full pitch deck is completed
- `generation.failed` - When generation fails

### Webhook Payload Example

```json
{
  "event": "slide.generated",
  "data": {
    "slideId": "slide_123",
    "slideType": "PROBLEM_STATEMENT",
    "pitchDeckId": "deck_456",
    "generatedAt": 1640995200000
  },
  "timestamp": 1640995200000
}
```

---

*This API documentation is automatically generated and maintained. Please report any discrepancies or outdated information.*
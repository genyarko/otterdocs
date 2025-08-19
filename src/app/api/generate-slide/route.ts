import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gpt-5-chat-latest', max_tokens = 2000, temperature = 0.7 } = await request.json();
    
    const apiKey = process.env.NEXT_PUBLIC_AIML_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Server-side API call with key:', apiKey ? `${apiKey.slice(0, 8)}...` : 'empty');

    const response = await fetch('https://api.aimlapi.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens,
        temperature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI/ML API error:', response.status, errorText);
      return NextResponse.json(
        { error: `AI/ML API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
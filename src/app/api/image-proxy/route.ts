import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Image proxy request received');
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('Fetching image from URL:', imageUrl.substring(0, 100) + '...');
    
    // Fetch the image from the external URL
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'PitchDeckGPT-PDF-Generator/1.0',
        'Accept': 'image/*',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}`, expired: response.status === 403 || response.status === 404 },
        { status: response.status }
      );
    }

    // Get the image data as buffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log('Successfully fetched image, size:', imageBuffer.byteLength, 'bytes, type:', contentType);

    // Convert to base64
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      contentType,
      size: imageBuffer.byteLength
    });

  } catch (error) {
    console.error('Server error in image proxy:', error);
    return NextResponse.json(
      { 
        error: 'Failed to proxy image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
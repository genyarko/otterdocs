import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('📥 Parse file API called');
  
  try {
    // Add request timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
    });
    
    const processingPromise = async () => {
      const data = await request.formData();
      const file = data.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { error: 'No file uploaded' },
          { status: 400 }
        );
      }

      console.log('📄 Processing file:', file.name, file.size, 'bytes');

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }

      let buffer: Buffer;
      try {
        const bytes = await file.arrayBuffer();
        buffer = Buffer.from(bytes);
        console.log('✅ Buffer created:', buffer.length, 'bytes');
      } catch (error) {
        console.error('❌ Failed to create buffer:', error);
        return NextResponse.json(
          { error: 'Failed to process file data' },
          { status: 400 }
        );
      }
      
      const content = '';
      return { buffer, file, content };
    };
    
    const result = await Promise.race([processingPromise(), timeoutPromise]);
    if (result instanceof NextResponse) {
      return result;
    }
    
    const { buffer, file } = result as { buffer: Buffer; file: File; content: string };
    let content = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('📁 PDF file uploaded - providing context without text extraction');
      
      const fileSize = Math.round(file.size / 1024);
      
      content = `PDF Document Context: ${file.name}

📄 **PDF File Information**:
- File Name: ${file.name}
- File Size: ${fileSize}KB
- Upload Status: Successfully received

💡 **Note**: PDF text extraction has been disabled for reliability. Please manually enter your key business information below:

🏢 **Company Information**:
• Company name and mission statement
• Value proposition and unique selling points

🎯 **Business Problem & Solution**:
• Problem your company solves
• Your solution and how it works
• Key features and benefits

📈 **Market & Business Model**:
• Target market and size
• Customer segments
• Revenue model and pricing strategy

👥 **Team & Operations**:
• Key team members and expertise
• Business operations and processes

📊 **Financials & Traction**:
• Revenue projections and financial highlights
• Funding requirements and use of funds
• Current traction, customers, or partnerships

🚀 **AI Enhancement**: The AI will use this PDF context along with your detailed input to create a comprehensive, professional business plan tailored to your business.`;
      
      console.log('✅ PDF context provided without extraction');
    } else if (
      file.type === 'text/plain' ||
      file.name.toLowerCase().endsWith('.txt')
    ) {
      // Parse TXT file
      try {
        console.log('📝 Attempting to parse TXT file...');
        content = buffer.toString('utf8');
        
        // Clean up any BOM or weird encoding artifacts
        content = content.replace(/^\uFEFF/, ''); // Remove BOM
        content = content.trim();
        
        console.log('📄 TXT parsed successfully, extracted', content.length, 'characters');
        console.log('📊 Content preview:', content.substring(0, 200) + '...');
        
      } catch (error) {
        console.error('TXT parsing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Return content instead of error to prevent 500s
        content = `TXT file uploaded: ${file.name}

File was uploaded successfully but text extraction encountered issues.

Please manually enter the key information from your TXT document:

📄 Document Content: [Copy key sections from your TXT file]
🏢 Company Information: [Your company details]
📋 Business Details: [Business model, market, etc.]

Error details: ${errorMessage}

The AI will use this file context along with your manual input to create a comprehensive business plan.`;
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      // Parse DOCX
      try {
        console.log('Attempting to parse DOCX...');
        const mammoth = await import('mammoth').then(m => m.default);
        const docxData = await mammoth.extractRawText({ buffer });
        content = docxData.value;
        console.log('DOCX parsed successfully, extracted', content.length, 'characters');
      } catch (error) {
        console.error('DOCX parsing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Return content instead of error to prevent 500s
        content = `DOCX file uploaded: ${file.name}

File was uploaded successfully but text extraction encountered issues.

Please manually enter the key information from your DOCX document:

📄 Document Content: [Copy key sections from your DOCX]
🏢 Company Information: [Your company details]
📋 Business Details: [Business model, market, etc.]

Error details: ${errorMessage}

The AI will use this file context along with your manual input to create a comprehensive business plan.`;
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    // Clean and validate content
    const cleanedContent = content.trim();
    
    if (cleanedContent.length === 0) {
      // Even if no content, provide helpful response
      return NextResponse.json({
        content: `File uploaded: ${file.name}\n\nFile was uploaded successfully but no text could be extracted. Please manually enter the content from your document in the form fields below.`,
        originalLength: 0,
        truncated: false,
        extractionStatus: 'no_content'
      });
    }

    if (cleanedContent.length > 50000) {
      // Truncate very long content to prevent API issues
      return NextResponse.json({
        content: cleanedContent.substring(0, 50000) + '\n\n[Content truncated due to length...]',
        originalLength: cleanedContent.length,
        truncated: true,
        extractionStatus: 'truncated'
      });
    }

    return NextResponse.json({
      content: cleanedContent,
      originalLength: cleanedContent.length,
      truncated: false,
      extractionStatus: 'success'
    });

  } catch (error) {
    console.error('File processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return a safe response instead of 500 error
    return NextResponse.json({
      content: `File upload encountered an issue, but your file information is available:\n\nFile: ${request.headers.get('content-length') ? 'Document' : 'Unknown file'}\n\nPlease manually enter the key information from your document in the form fields below. The AI will use this context along with your input to create a comprehensive business plan.\n\nError details: ${errorMessage}`,
      originalLength: 0,
      truncated: false,
      extractionStatus: 'error',
      error: errorMessage
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
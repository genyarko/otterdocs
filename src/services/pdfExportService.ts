import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PitchDeck, PitchDeckSlide } from '@/types/pitchDeck';

export interface PDFExportOptions {
  includeSlideNumbers?: boolean;
  includeSpeakerNotes?: boolean;
  imageSize?: 'small' | 'medium' | 'large';
}

export class PDFExportService {
  private static readonly PAGE_WIDTH = 297; // A4 width in mm (landscape)
  private static readonly PAGE_HEIGHT = 210; // A4 height in mm (landscape)
  private static readonly MARGIN = 20; // Margin in mm
  private static readonly CONTENT_WIDTH = this.PAGE_WIDTH - (this.MARGIN * 2);
  private static readonly CONTENT_HEIGHT = this.PAGE_HEIGHT - (this.MARGIN * 2);

  /**
   * Export a speaker version of the pitch deck to PDF (includes speaker notes)
   */
  static async exportSpeakerPDF(
    pitchDeck: PitchDeck,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    return this.exportToPDF(pitchDeck, {
      includeSpeakerNotes: true,
      includeSlideNumbers: true
    }, 'speaker', onProgress);
  }

  /**
   * Export an investor version of the pitch deck to PDF (no speaker notes)
   */
  static async exportInvestorPDF(
    pitchDeck: PitchDeck,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    return this.exportToPDF(pitchDeck, {
      includeSpeakerNotes: false,
      includeSlideNumbers: true
    }, 'investor', onProgress);
  }

  /**
   * Export a one-pager executive summary to PDF
   */
  static async exportOnePagerPDF(
    pitchDeck: PitchDeck,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    try {
      console.log('Starting One-Pager export for:', pitchDeck.title);
      
      // Create PDF in portrait orientation for one-pager
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        putOnlyUsedFonts: true
      });

      // Use a more reliable font for better text rendering
      try {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
      } catch (error) {
        console.warn('Font setting failed, using defaults:', error);
      }

      await this.addOnePagerContent(pdf, pitchDeck);
      
      // Report progress
      onProgress?.(1, 1);

      // Generate filename
      const sanitizedTitle = pitchDeck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `${sanitizedTitle}_one_pager_${timestamp}.pdf`;

      // Download the PDF
      pdf.save(filename);
      
      console.log('One-Pager export completed successfully');
    } catch (error) {
      console.error('One-Pager export failed:', error);
      throw new Error(`Failed to export One-Pager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export a pitch deck to PDF with customizable options
   */
  private static async exportToPDF(
    pitchDeck: PitchDeck,
    options: PDFExportOptions = {},
    versionType: 'speaker' | 'investor' = 'speaker',
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    try {
      console.log('Starting PDF export for:', pitchDeck.title);
      
      // Create PDF in landscape orientation with better encoding support
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
        putOnlyUsedFonts: true
      });

      // Use a more reliable font for better text rendering
      // Try to use built-in fonts that handle more characters
      try {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
      } catch (error) {
        console.warn('Font setting failed, using defaults:', error);
        // Fallback to default font
      }

      // Add title page
      await this.addTitlePage(pdf, pitchDeck);
      
      // Add each slide
      for (let i = 0; i < pitchDeck.slides.length; i++) {
        const slide = pitchDeck.slides[i];
        console.log(`Adding slide ${i + 1}/${pitchDeck.slides.length}: ${slide.title}`);
        
        if (i > 0 || pitchDeck.slides.length > 0) {
          pdf.addPage();
        }
        
        await this.addSlideToPDF(pdf, slide, i + 1, options);
        
        // Report progress
        onProgress?.(i + 1, pitchDeck.slides.length);
        
        // Small delay to prevent blocking the UI
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate filename with version type
      const sanitizedTitle = pitchDeck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `${sanitizedTitle}_pitch_deck_${versionType}_${timestamp}.pdf`;

      // Download the PDF
      pdf.save(filename);
      
      console.log('PDF export completed successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add title page to PDF
   */
  private static async addTitlePage(pdf: jsPDF, pitchDeck: PitchDeck): Promise<void> {
    const centerX = this.PAGE_WIDTH / 2;
    const centerY = this.PAGE_HEIGHT / 2;

    // Company name (large)
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    const cleanCompanyName = this.cleanTextForPDF(pitchDeck.companyName);
    this.safeAddText(pdf, cleanCompanyName, centerX, centerY - 40, { align: 'center' });

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'normal');
    const cleanTitle = this.cleanTextForPDF(pitchDeck.title);
    this.safeAddText(pdf, cleanTitle, centerX, centerY - 20, { align: 'center' });

    // Subtitle information
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    
    const subtitleY = centerY + 10;
    const lineHeight = 8;
    
    this.safeAddText(pdf, `Industry: ${pitchDeck.industry}`, centerX, subtitleY, { align: 'center' });
    this.safeAddText(pdf, `Funding Stage: ${pitchDeck.fundingStage}`, centerX, subtitleY + lineHeight, { align: 'center' });
    this.safeAddText(pdf, `Target Funding: ${pitchDeck.targetFunding}`, centerX, subtitleY + (lineHeight * 2), { align: 'center' });

    // Date
    pdf.setFontSize(12);
    this.safeAddText(pdf, `Generated: ${new Date(pitchDeck.createdAt).toLocaleDateString()}`, centerX, subtitleY + (lineHeight * 4), { align: 'center' });
  }

  /**
   * Add one-pager content to PDF - executive summary format
   */
  private static async addOnePagerContent(pdf: jsPDF, pitchDeck: PitchDeck): Promise<void> {
    const PAGE_WIDTH = 210; // A4 portrait width in mm
    const PAGE_HEIGHT = 297; // A4 portrait height in mm
    const MARGIN = 15;
    const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
    let currentY = MARGIN;

    // Header Section
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const cleanCompanyName = this.cleanTextForPDF(pitchDeck.companyName);
    this.safeAddText(pdf, cleanCompanyName, PAGE_WIDTH / 2, currentY + 10, { align: 'center' });
    currentY += 18;

    // Tagline/Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'italic');
    const cleanTitle = this.cleanTextForPDF(pitchDeck.title);
    this.safeAddText(pdf, cleanTitle, PAGE_WIDTH / 2, currentY, { align: 'center' });
    currentY += 20;

    // Key Info Line
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const keyInfo = `${pitchDeck.industry} • ${pitchDeck.fundingStage} • ${pitchDeck.targetFunding}`;
    this.safeAddText(pdf, keyInfo, PAGE_WIDTH / 2, currentY, { align: 'center' });
    currentY += 15;

    // Separator line
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);
    currentY += 12;

    // Two-column layout for main content
    const leftColumnX = MARGIN;
    const rightColumnX = PAGE_WIDTH / 2 + 5;
    const columnWidth = (CONTENT_WIDTH - 10) / 2;

    // Left Column
    let leftY = currentY;
    leftY = await this.addOnePagerSection(pdf, 'PROBLEM & SOLUTION', 
      this.extractOnePagerSection(pitchDeck, ['problem', 'solution']), 
      leftColumnX, leftY, columnWidth);

    leftY = await this.addOnePagerSection(pdf, 'MARKET OPPORTUNITY', 
      this.extractOnePagerSection(pitchDeck, ['market_size', 'target_market']), 
      leftColumnX, leftY, columnWidth);

    leftY = await this.addOnePagerSection(pdf, 'BUSINESS MODEL', 
      this.extractOnePagerSection(pitchDeck, ['business_model', 'revenue_streams']), 
      leftColumnX, leftY, columnWidth);

    // Right Column
    let rightY = currentY;
    rightY = await this.addOnePagerSection(pdf, 'TRACTION & METRICS', 
      this.extractOnePagerSection(pitchDeck, ['traction', 'key_metrics']), 
      rightColumnX, rightY, columnWidth);

    rightY = await this.addOnePagerSection(pdf, 'COMPETITIVE ADVANTAGE', 
      this.extractOnePagerSection(pitchDeck, ['competitive_landscape', 'unique_value_proposition']), 
      rightColumnX, rightY, columnWidth);

    rightY = await this.addOnePagerSection(pdf, 'FUNDING & USE OF FUNDS', 
      this.extractOnePagerSection(pitchDeck, ['funding_ask', 'use_of_funds']), 
      rightColumnX, rightY, columnWidth);

    // Team section (full width at bottom)
    currentY = Math.max(leftY, rightY) + 10;
    
    // Only add team section if we have space
    if (currentY < PAGE_HEIGHT - 60) {
      // Separator line
      pdf.setLineWidth(0.5);
      pdf.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);
      currentY += 8;

      await this.addOnePagerSection(pdf, 'KEY TEAM MEMBERS', 
        this.extractOnePagerSection(pitchDeck, ['team', 'founders']), 
        MARGIN, currentY, CONTENT_WIDTH);
    }

    // Footer with contact info
    const footerY = PAGE_HEIGHT - 20;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const footerText = `Generated: ${new Date().toLocaleDateString()} | Visit our pitch deck for full details`;
    this.safeAddText(pdf, footerText, PAGE_WIDTH / 2, footerY, { align: 'center' });
  }

  /**
   * Add a section to the one-pager
   */
  private static async addOnePagerSection(
    pdf: jsPDF, 
    title: string, 
    content: string, 
    x: number, 
    y: number, 
    width: number
  ): Promise<number> {
    let currentY = y;

    // Section title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    this.safeAddText(pdf, title, x, currentY);
    currentY += 8;

    // Section content
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    if (content && content.trim()) {
      const cleanContent = this.cleanTextForPDF(content);
      const wrappedText = pdf.splitTextToSize(cleanContent, width);
      
      // Limit content to prevent overflow
      const maxLines = 8;
      const linesToShow = wrappedText.slice(0, maxLines);
      
      for (let i = 0; i < linesToShow.length; i++) {
        this.safeAddText(pdf, linesToShow[i], x, currentY);
        currentY += 4;
      }
      
      if (wrappedText.length > maxLines) {
        this.safeAddText(pdf, '...', x, currentY);
        currentY += 4;
      }
    } else {
      pdf.setFont('helvetica', 'italic');
      this.safeAddText(pdf, 'Details available in full pitch deck', x, currentY);
      currentY += 4;
    }

    return currentY + 8; // Add spacing after section
  }

  /**
   * Extract relevant content from pitch deck for one-pager sections
   */
  private static extractOnePagerSection(pitchDeck: PitchDeck, slideTypes: string[]): string {
    const relevantSlides = pitchDeck.slides.filter(slide => 
      slideTypes.some(type => slide.slideType.toLowerCase().includes(type.toLowerCase()))
    );

    if (relevantSlides.length === 0) {
      return '';
    }

    let combinedContent = '';
    
    relevantSlides.forEach(slide => {
      if (slide.content && slide.content.trim()) {
        // Extract key points or first paragraph
        const content = slide.content.trim();
        const firstParagraph = content.split('\n\n')[0];
        
        // Prefer key points if available
        if (slide.keyPoints && slide.keyPoints.length > 0) {
          combinedContent += slide.keyPoints.slice(0, 3).join('. ') + '. ';
        } else if (firstParagraph) {
          // Limit to first 200 characters
          const summary = firstParagraph.length > 200 
            ? firstParagraph.substring(0, 200) + '...' 
            : firstParagraph;
          combinedContent += summary + ' ';
        }
      }
    });

    return combinedContent.trim();
  }

  /**
   * Add a single slide to the PDF
   */
  private static async addSlideToPDF(
    pdf: jsPDF, 
    slide: PitchDeckSlide, 
    slideNumber: number, 
    options: PDFExportOptions = {}
  ): Promise<void> {
    const startY = this.MARGIN;
    let currentY = startY;

    // Slide number (top right) - only if enabled
    if (options.includeSlideNumbers !== false) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      this.safeAddText(pdf, `${slideNumber}`, this.PAGE_WIDTH - this.MARGIN, startY + 5, { align: 'right' });
    }

    // Slide title (cleaned)
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const cleanTitle = this.cleanTextForPDF(slide.title);
    const titleLines = pdf.splitTextToSize(cleanTitle, this.CONTENT_WIDTH);
    this.safeAddText(pdf, titleLines, this.MARGIN, currentY + 10);
    currentY += (titleLines.length * 8) + 15;

    // Slide type subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    const cleanSlideType = slide.slideType.replace(/_/g, ' ').toLowerCase();
    this.safeAddText(pdf, cleanSlideType, this.MARGIN, currentY);
    currentY += 12;

    // Add image if available (with improved error handling and CORS support)
    if (slide.imageUrl) {
      try {
        console.log(`Processing image for slide ${slideNumber}:`, slide.imageUrl.substring(0, 100) + '...');
        const imageData = await this.convertImageToBase64(slide.imageUrl);
        if (imageData) {
          const imageWidth = 80; // mm
          const imageHeight = 60; // mm
          const imageX = this.PAGE_WIDTH - this.MARGIN - imageWidth;
          
          // Try to add image, detect format from data URL
          const format = imageData.includes('data:image/png') ? 'PNG' : 'JPEG';
          pdf.addImage(imageData, format, imageX, currentY, imageWidth, imageHeight);
          console.log(`Successfully added image for slide ${slideNumber}`);
        } else {
          console.warn(`No image data returned for slide ${slideNumber}`);
        }
      } catch (error) {
        console.warn(`Failed to add image for slide ${slideNumber}:`, error);
        // Continue without image - don't fail the entire export
      }
    }

    // Main content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const contentLines = this.formatContentForPDF(slide.content);
    const maxWidth = slide.imageUrl ? this.CONTENT_WIDTH - 90 : this.CONTENT_WIDTH; // Leave space for image
    
    for (const line of contentLines) {
      if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) {
        break; // Prevent overflow
      }
      
      if (line.trim() === '') {
        currentY += 6; // Paragraph break spacing
        continue;
      }
      
      if (line.match(/^[\s]*[-•*]\s/) || line.startsWith('•') || line.startsWith('-')) {
        // Bullet point
        this.safeAddText(pdf, '•', this.MARGIN + 5, currentY);
        const bulletText = line.replace(/^[\s]*[-•*]\s*/, '').trim(); // Remove bullet marker
        const cleanBulletText = this.cleanTextForPDF(bulletText);
        const wrappedText = pdf.splitTextToSize(cleanBulletText, maxWidth - 15);
        
        // Render each wrapped line
        for (let i = 0; i < wrappedText.length; i++) {
          if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) break;
          this.safeAddText(pdf, wrappedText[i], this.MARGIN + 12, currentY);
          currentY += 5; // Line height
        }
        currentY += 3; // Extra space after bullet point
        
      } else if (line.match(/^\d+\.\s/)) {
        // Numbered list item
        const numberMatch = line.match(/^(\d+\.\s*)/);
        const number = numberMatch ? numberMatch[1] : '1. ';
        const text = line.replace(/^\d+\.\s*/, '').trim();
        
        this.safeAddText(pdf, number, this.MARGIN + 5, currentY);
        const cleanText = this.cleanTextForPDF(text);
        const wrappedText = pdf.splitTextToSize(cleanText, maxWidth - 20);
        
        for (let i = 0; i < wrappedText.length; i++) {
          if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) break;
          this.safeAddText(pdf, wrappedText[i], this.MARGIN + 12 + (number.length * 3), currentY);
          currentY += 5;
        }
        currentY += 3; // Extra space after numbered item
        
      } else {
        // Regular paragraph text
        const cleanLine = this.cleanTextForPDF(line);
        const wrappedText = pdf.splitTextToSize(cleanLine, maxWidth);
        
        for (let i = 0; i < wrappedText.length; i++) {
          if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) break;
          this.safeAddText(pdf, wrappedText[i], this.MARGIN, currentY);
          currentY += 5; // Line height
        }
        currentY += 4; // Extra space after paragraph
      }
    }

    // Key points section
    if (slide.keyPoints && slide.keyPoints.length > 0) {
      currentY += 10;
      
      if (currentY < this.PAGE_HEIGHT - this.MARGIN - 20) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        this.safeAddText(pdf, 'Key Points', this.MARGIN, currentY);
        currentY += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        for (const point of slide.keyPoints) {
          if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) {
            break;
          }
          
          this.safeAddText(pdf, '•', this.MARGIN + 5, currentY);
          const cleanPoint = this.cleanTextForPDF(point);
          const wrappedPoint = pdf.splitTextToSize(cleanPoint, maxWidth - 15);
          
          // Render each wrapped line of the key point
          for (let i = 0; i < wrappedPoint.length; i++) {
            if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) break;
            this.safeAddText(pdf, wrappedPoint[i], this.MARGIN + 12, currentY);
            currentY += 4; // Slightly tighter line height for key points
          }
          currentY += 2; // Space between key points
        }
      }
    }

    // Speaker notes at bottom if space available and option is enabled
    if (options.includeSpeakerNotes && slide.speakerNotes && currentY < this.PAGE_HEIGHT - this.MARGIN - 25) {
      const notesStartY = this.PAGE_HEIGHT - this.MARGIN - 20;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      this.safeAddText(pdf, 'Speaker Notes:', this.MARGIN, notesStartY);
      
      const cleanNotes = this.cleanTextForPDF(slide.speakerNotes);
      const notesText = pdf.splitTextToSize(cleanNotes, this.CONTENT_WIDTH);
      
      // Render speaker notes line by line
      let notesY = notesStartY + 4;
      for (let i = 0; i < notesText.length && i < 3; i++) { // Limit to 3 lines max
        if (notesY > this.PAGE_HEIGHT - this.MARGIN - 5) break;
        this.safeAddText(pdf, notesText[i], this.MARGIN, notesY);
        notesY += 3; // Tight line spacing for notes
      }
    }
  }

  /**
   * Format content text for PDF display with proper paragraph structure
   */
  private static formatContentForPDF(content: string): string[] {
    if (!content) return [];

    // Clean and normalize the text content
    const cleanedContent = this.cleanTextForPDF(content);
    
    // Split into paragraphs first (double line breaks or more)
    const paragraphs = cleanedContent
      .split(/\n\s*\n+/)  // Split on empty lines
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    const formattedLines: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      
      // Check if this is a list item or bullet point
      if (paragraph.match(/^[\s]*[-•*]\s/)) {
        // Handle as bullet points - split individual items
        const bulletItems = paragraph
          .split(/\n(?=\s*[-•*]\s)/)  // Split on lines that start with bullets
          .map(item => item.trim())
          .filter(item => item.length > 0);
          
        bulletItems.forEach(item => {
          formattedLines.push(item);
        });
      } else if (paragraph.match(/^\d+\.\s/)) {
        // Handle as numbered list
        const numberedItems = paragraph
          .split(/\n(?=\s*\d+\.\s)/)  // Split on lines that start with numbers
          .map(item => item.trim())
          .filter(item => item.length > 0);
          
        numberedItems.forEach(item => {
          formattedLines.push(item);
        });
      } else {
        // Regular paragraph - preserve internal line breaks but clean up formatting
        const lines = paragraph
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (lines.length === 1) {
          // Single line paragraph
          formattedLines.push(lines[0]);
        } else {
          // Multi-line paragraph - join with spaces for better flow
          const joinedParagraph = lines.join(' ');
          formattedLines.push(joinedParagraph);
        }
      }
      
      // Add spacing between paragraphs (except for the last one)
      if (i < paragraphs.length - 1) {
        formattedLines.push(''); // Empty line for paragraph break
      }
    }
    
    return formattedLines;
  }

  /**
   * Clean text content to remove problematic characters and formatting
   * Uses aggressive ASCII conversion to ensure PDF compatibility
   */
  private static cleanTextForPDF(text: string): string {
    if (!text) return '';

    let cleanedText = text;

    try {
      // First pass: Handle common encoding issues
      cleanedText = cleanedText
        // Normalize Unicode composition
        .normalize('NFKD')  // Compatibility decomposition
        
        // Replace problematic Unicode characters that cause PDF encoding issues
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // All smart quotes to regular quotes
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // All smart apostrophes to regular apostrophes
        .replace(/[\u2013\u2014]/g, '-')             // En dash and Em dash to hyphen
        .replace(/\u2026/g, '...')                   // Ellipsis to three dots
        .replace(/[\u2022\u25CF\u25E6\u25A0\u25B2\u25C6\u2219]/g, '•') // Various bullets to standard bullet
        
        // Currency symbols to text
        .replace(/[\u00A3\u20A4]/g, 'GBP')           // Pound signs
        .replace(/[\u20AC]/g, 'EUR')                 // Euro sign
        .replace(/[\u00A5\u20A5]/g, 'YEN')           // Yen signs
        .replace(/[\u0024]/g, '$')                   // Normalize dollar sign
        
        // Mathematical and special symbols
        .replace(/[\u00B1]/g, '+/-')                 // Plus-minus sign
        .replace(/[\u00D7]/g, 'x')                   // Multiplication sign
        .replace(/[\u00F7]/g, '/')                   // Division sign
        .replace(/[\u2190\u2191\u2192\u2193]/g, '') // Remove arrow characters
        .replace(/[\u2605\u2606]/g, '*')             // Star symbols to asterisk
        .replace(/[\u00B0]/g, ' degrees')            // Degree symbol
        .replace(/[\u00A9]/g, '(c)')                 // Copyright symbol
        .replace(/[\u00AE]/g, '(R)')                 // Registered trademark
        .replace(/[\u2122]/g, '(TM)')                // Trademark symbol
        
        // Remove diacritical marks after decomposition
        .replace(/[\u0300-\u036f]/g, '') 
        
        // Clean up markdown formatting
        .replace(/\*\*([^*]+)\*\*/g, '$1')           // Remove bold markdown
        .replace(/\*([^*]+)\*/g, '$1')               // Remove italic markdown
        .replace(/`([^`]+)`/g, '$1')                 // Remove code markdown
        .replace(/#{1,6}\s+/g, '')                   // Remove heading markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')     // Remove markdown links
        
        // Handle HTML entities
        .replace(/&nbsp;/g, ' ')                     // Non-breaking space
        .replace(/&amp;/g, '&')                      // Ampersand
        .replace(/&lt;/g, '<')                       // Less than
        .replace(/&gt;/g, '>')                       // Greater than
        .replace(/&quot;/g, '"')                     // Quotation mark
        .replace(/&#39;/g, "'")                      // Apostrophe
        .replace(/&[a-zA-Z0-9]+;/g, '')              // Remove any remaining HTML entities
        
        // More aggressive character filtering - keep only safe ASCII and basic extended ASCII
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, (match) => {
          // Convert common extended ASCII to safe alternatives
          const code = match.charCodeAt(0);
          if (code >= 160 && code <= 255) {
            // Keep basic extended ASCII but convert problematic ones
            switch (code) {
              case 160: return ' ';      // Non-breaking space
              case 161: return '!';      // Inverted exclamation
              case 162: return 'c';      // Cent sign
              case 163: return 'GBP';    // Pound sign
              case 165: return 'YEN';    // Yen sign
              case 169: return '(c)';    // Copyright
              case 174: return '(R)';    // Registered
              case 176: return 'deg';    // Degree symbol
              case 177: return '+/-';    // Plus-minus
              case 215: return 'x';      // Multiplication
              case 247: return '/';      // Division
              default: 
                // For accented characters, try to convert to base character
                if (code >= 192 && code <= 255) {
                  const baseChars = 'AAAAAACEEEEIIIIDNOOOOOxOUUUUYbsaaaaaaceeeeiiiionoooooouuuuyby';
                  const index = code - 192;
                  return index < baseChars.length ? baseChars[index] : '';
                }
                return ''; // Remove other extended ASCII
            }
          }
          return ''; // Remove anything else that's not basic ASCII
        })
        
        // Remove control characters except essential whitespace
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        
        // Final whitespace cleanup - preserve paragraph breaks but normalize other whitespace
        .replace(/[ \t]+/g, ' ')  // Normalize spaces and tabs but keep line breaks
        .replace(/\n{3,}/g, '\n\n')  // Limit to double line breaks max
        .trim();

    } catch (error) {
      console.warn('Text cleaning failed, using basic cleanup:', error);
      // Fallback to very basic cleaning if anything goes wrong
      cleanedText = text
        .replace(/[^\x20-\x7E\x0A\x0D\x09]/g, '') // Keep only printable ASCII and basic whitespace
        .replace(/\s+/g, ' ')
        .trim();
    }

    return cleanedText;
  }

  /**
   * Safely add text to PDF with encoding handling
   */
  private static safeAddText(
    pdf: jsPDF, 
    text: string, 
    x: number, 
    y: number, 
    options?: any
  ): void {
    try {
      // Clean text before adding
      const cleanText = this.cleanTextForPDF(text);
      if (cleanText && cleanText.trim().length > 0) {
        pdf.text(cleanText, x, y, options);
      }
    } catch (error) {
      console.warn('Failed to add text to PDF:', error);
      // Try to add a simplified version
      try {
        const simpleText = text.replace(/[^\x20-\x7E]/g, '').trim();
        if (simpleText) {
          pdf.text(simpleText, x, y, options);
        }
      } catch (fallbackError) {
        console.error('Even simplified text failed:', fallbackError);
      }
    }
  }

  /**
   * Convert image URL to base64 for PDF inclusion using server-side proxy
   */
  private static async convertImageToBase64(imageUrl: string): Promise<string | null> {
    try {
      // If it's already a base64 data URL, return as is
      if (imageUrl.startsWith('data:image/')) {
        console.log('Image is already base64, using directly');
        return imageUrl;
      }

      console.log('Using server-side proxy to fetch external image...');
      
      // Use our server-side proxy to fetch external images (bypasses CORS)
      const response = await fetch('/api/image-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (errorData.expired) {
          console.warn('Image URL appears to be expired or no longer accessible');
        }
        throw new Error(`Image proxy failed: ${response.status} - ${errorData.error}`);
      }

      const data = await response.json();
      
      if (data.success && data.dataUrl) {
        console.log(`Successfully converted image via proxy: ${data.size} bytes, type: ${data.contentType}`);
        return data.dataUrl;
      } else {
        throw new Error('Image proxy returned unsuccessful response');
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          console.warn('Image URL appears to be expired or no longer accessible:', imageUrl);
        } else if (error.message.includes('403') || error.message.includes('404')) {
          console.warn('Image URL is not accessible (possibly expired):', imageUrl);
        } else {
          console.warn('Failed to convert image to base64 via proxy:', error.message);
        }
      } else {
        console.warn('Unknown error converting image to base64:', error);
      }
      return null;
    }
  }

  /**
   * Create a progress callback for UI updates
   */
  static createProgressCallback(
    onProgress: (message: string, percentage: number) => void
  ) {
    return (current: number, total: number) => {
      const percentage = Math.round((current / total) * 100);
      onProgress(`Generating PDF... (${current}/${total} slides)`, percentage);
    };
  }
}
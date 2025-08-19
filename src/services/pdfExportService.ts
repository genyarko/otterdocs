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
      
      // Create PDF in landscape orientation with Unicode support
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Ensure proper font encoding for better text rendering
      pdf.setFont('helvetica');
      pdf.setFontSize(12);

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
    pdf.setFont(undefined, 'bold');
    const cleanCompanyName = this.cleanTextForPDF(pitchDeck.companyName);
    pdf.text(cleanCompanyName, centerX, centerY - 40, { align: 'center' });

    // Title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'normal');
    const cleanTitle = this.cleanTextForPDF(pitchDeck.title);
    pdf.text(cleanTitle, centerX, centerY - 20, { align: 'center' });

    // Subtitle information
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'normal');
    
    const subtitleY = centerY + 10;
    const lineHeight = 8;
    
    pdf.text(`Industry: ${pitchDeck.industry}`, centerX, subtitleY, { align: 'center' });
    pdf.text(`Funding Stage: ${pitchDeck.fundingStage}`, centerX, subtitleY + lineHeight, { align: 'center' });
    pdf.text(`Target Funding: ${pitchDeck.targetFunding}`, centerX, subtitleY + (lineHeight * 2), { align: 'center' });

    // Date
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date(pitchDeck.createdAt).toLocaleDateString()}`, centerX, subtitleY + (lineHeight * 4), { align: 'center' });
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
      pdf.setFont(undefined, 'normal');
      pdf.text(`${slideNumber}`, this.PAGE_WIDTH - this.MARGIN, startY + 5, { align: 'right' });
    }

    // Slide title (cleaned)
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    const cleanTitle = this.cleanTextForPDF(slide.title);
    const titleLines = pdf.splitTextToSize(cleanTitle, this.CONTENT_WIDTH);
    pdf.text(titleLines, this.MARGIN, currentY + 10);
    currentY += (titleLines.length * 8) + 15;

    // Slide type subtitle
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'italic');
    const cleanSlideType = slide.slideType.replace(/_/g, ' ').toLowerCase();
    pdf.text(cleanSlideType, this.MARGIN, currentY);
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
    pdf.setFont(undefined, 'normal');
    const contentLines = this.formatContentForPDF(slide.content);
    const maxWidth = slide.imageUrl ? this.CONTENT_WIDTH - 90 : this.CONTENT_WIDTH; // Leave space for image
    
    for (const line of contentLines) {
      if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) {
        break; // Prevent overflow
      }
      
      if (line.trim() === '') {
        currentY += 4;
        continue;
      }
      
      if (line.startsWith('•') || line.startsWith('-')) {
        // Bullet point
        pdf.text('•', this.MARGIN + 5, currentY);
        const bulletText = line.substring(1).trim();
        const cleanBulletText = this.cleanTextForPDF(bulletText);
        const wrappedText = pdf.splitTextToSize(cleanBulletText, maxWidth - 10);
        pdf.text(wrappedText, this.MARGIN + 12, currentY);
        currentY += wrappedText.length * 5 + 2;
      } else {
        // Regular text
        const cleanLine = this.cleanTextForPDF(line);
        const wrappedText = pdf.splitTextToSize(cleanLine, maxWidth);
        pdf.text(wrappedText, this.MARGIN, currentY);
        currentY += wrappedText.length * 5 + 2;
      }
    }

    // Key points section
    if (slide.keyPoints && slide.keyPoints.length > 0) {
      currentY += 10;
      
      if (currentY < this.PAGE_HEIGHT - this.MARGIN - 20) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Key Points', this.MARGIN, currentY);
        currentY += 8;
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        
        for (const point of slide.keyPoints) {
          if (currentY > this.PAGE_HEIGHT - this.MARGIN - 10) {
            break;
          }
          
          pdf.text('•', this.MARGIN + 5, currentY);
          const cleanPoint = this.cleanTextForPDF(point);
          const wrappedPoint = pdf.splitTextToSize(cleanPoint, maxWidth - 10);
          pdf.text(wrappedPoint, this.MARGIN + 12, currentY);
          currentY += wrappedPoint.length * 4 + 2;
        }
      }
    }

    // Speaker notes at bottom if space available and option is enabled
    if (options.includeSpeakerNotes && slide.speakerNotes && currentY < this.PAGE_HEIGHT - this.MARGIN - 25) {
      const notesStartY = this.PAGE_HEIGHT - this.MARGIN - 20;
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'italic');
      pdf.text('Speaker Notes:', this.MARGIN, notesStartY);
      
      const cleanNotes = this.cleanTextForPDF(slide.speakerNotes);
      const notesText = pdf.splitTextToSize(cleanNotes, this.CONTENT_WIDTH);
      pdf.text(notesText, this.MARGIN, notesStartY + 4);
    }
  }

  /**
   * Format content text for PDF display with proper text cleaning
   */
  private static formatContentForPDF(content: string): string[] {
    // Clean and normalize the text content
    const cleanedContent = this.cleanTextForPDF(content);
    return cleanedContent.split('\n').filter(line => line.trim() !== '');
  }

  /**
   * Clean text content to remove problematic characters and formatting
   */
  private static cleanTextForPDF(text: string): string {
    if (!text) return '';

    return text
      // First normalize common Unicode issues
      .normalize('NFD')  // Decompose characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      
      // Replace problematic Unicode characters that cause encoding issues
      .replace(/[\u201C\u201D]/g, '"') // Smart quotes to regular quotes
      .replace(/[\u2018\u2019]/g, "'") // Smart apostrophes to regular apostrophes
      .replace(/\u2013/g, '-')         // En dash to hyphen
      .replace(/\u2014/g, '--')        // Em dash to double hyphen
      .replace(/\u2026/g, '...')       // Ellipsis to three dots
      .replace(/[\u2022\u25CF\u25E6]/g, '•') // Various bullet points to standard bullet
      
      // Handle currency and special symbols
      .replace(/\u00A3/g, 'GBP')       // Pound sign
      .replace(/\u20AC/g, 'EUR')       // Euro sign
      .replace(/\u00A5/g, 'YEN')       // Yen sign
      
      // Remove/clean markdown-style formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown (**text**)
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markdown (*text*)
      .replace(/`([^`]+)`/g, '$1')       // Remove code markdown (`text`)
      .replace(/#{1,6}\s+/g, '')        // Remove heading markdown (# text)
      
      // Clean up specific problematic sequences that cause garbled text
      .replace(/Ø=Ü°/g, '')            // Remove specific garbled sequence
      .replace(/Ø=Ý9/g, '')            // Remove specific garbled sequence  
      .replace(/!'/g, 'to')            // Replace garbled 'to' text
      .replace(/\$'/g, '$')            // Fix garbled dollar signs
      
      // Remove any remaining control characters and problematic Unicode
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '') // Keep only basic Latin and Latin-1 Supplement
      
      // Clean up extra whitespace and normalize
      .replace(/\s+/g, ' ')
      .trim();
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
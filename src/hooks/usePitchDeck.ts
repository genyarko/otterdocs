'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  PitchDeck, 
  PitchDeckRequest, 
  PitchDeckState, 
  GenerationProgress,
  GenerationPhase 
} from '@/types/pitchDeck';
import { OnlinePitchDeckGenerator } from '@/services/pitchDeckGenerator';
import { LocalPitchDeckRepository } from '@/services/pitchDeckRepository';
import { PDFExportService } from '@/services/pdfExportService';

// Custom hook that mimics the Android ViewModel pattern
export function usePitchDeck() {
  const [state, setState] = useState<PitchDeckState>({
    isGenerating: false,
    generationProgress: {
      currentSlide: 0,
      totalSlides: 10,
      phase: GenerationPhase.PREPARING,
      isGenerating: false
    },
    currentPitchDeck: null,
    allPitchDecks: [],
    error: null,
    isLoading: false,
    currentSlide: 0,
    showPitchDeckList: true,
    showCreator: false,
    lastPitchDeckRequest: null
  });

  // Initialize services (similar to Android dependency injection)
  const [generator] = useState(() => {
    console.log('Initializing OnlinePitchDeckGenerator with server-side API');
    return new OnlinePitchDeckGenerator();
  });

  const [repository] = useState(() => new LocalPitchDeckRepository());

  // Load all pitch decks on initialization (client-side only to avoid hydration issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadAllPitchDecks();
    }
  }, []);

  const loadAllPitchDecks = useCallback(async (preserveCurrentState = false) => {
    try {
      if (!preserveCurrentState) {
        setState(prev => ({ ...prev, isLoading: true }));
      }
      const pitchDecks = await repository.getAllPitchDecks();
      setState(prev => ({ 
        ...prev, 
        allPitchDecks: pitchDecks, 
        isLoading: preserveCurrentState ? prev.isLoading : false 
      }));
    } catch (error) {
      console.error('Failed to load pitch decks:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load pitch decks', 
        isLoading: preserveCurrentState ? prev.isLoading : false 
      }));
    }
  }, [repository]);

  const generatePitchDeck = useCallback(async (request: PitchDeckRequest) => {
    try {
      console.log('Starting pitch deck generation');
      setState(prev => ({
        ...prev,
        isGenerating: true,
        generationProgress: {
          currentSlide: 0,
          totalSlides: 10,
          phase: GenerationPhase.PREPARING,
          isGenerating: true
        },
        error: null,
        currentPitchDeck: null, // Clear any existing deck
        showPitchDeckList: false, // Ensure we're not showing list during generation
        showCreator: false, // Hide creator during generation
        lastPitchDeckRequest: request
      }));

      // Update phase to generating
      setState(prev => ({
        ...prev,
        generationProgress: {
          ...prev.generationProgress,
          phase: GenerationPhase.GENERATING_SLIDES
        }
      }));

      // Generate pitch deck with progress callbacks
      const pitchDeck = await generator.generatePitchDeck(
        request,
        (currentSlide: number, totalSlides: number) => {
          setState(prev => ({
            ...prev,
            generationProgress: {
              ...prev.generationProgress,
              currentSlide,
              totalSlides
            }
          }));
        }
      );

      if (pitchDeck) {
        console.log('Generation completed successfully, transitioning to viewer:', pitchDeck.title);
        
        // Save to repository
        await repository.savePitchDeck(pitchDeck);

        // Update state with completed generation
        setState(prev => ({
          ...prev,
          isGenerating: false,
          generationProgress: {
            currentSlide: 10,
            totalSlides: 10,
            phase: GenerationPhase.COMPLETED,
            isGenerating: false
          },
          currentPitchDeck: pitchDeck,
          currentSlide: 0, // Start at first slide
          showPitchDeckList: false
        }));

        console.log('State updated, should show pitch deck viewer now');
        console.log('Final state should be:', {
          isGenerating: false,
          currentPitchDeck: pitchDeck.title,
          showPitchDeckList: false,
          currentSlide: 0,
          slidesCount: pitchDeck.slides.length
        });

        // Note: We'll reload the list when user returns to it, not immediately
      } else {
        throw new Error('Failed to generate pitch deck');
      }
    } catch (error) {
      console.error('Pitch deck generation failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationProgress: {
          currentSlide: 0,
          totalSlides: 10,
          phase: GenerationPhase.ERROR,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        error: error instanceof Error ? error.message : 'Failed to generate pitch deck'
      }));
    }
  }, [generator, repository, loadAllPitchDecks]);

  const loadPitchDeck = useCallback(async (id: string) => {
    try {
      console.log('🔍 Loading pitch deck with ID:', id);
      setState(prev => ({ ...prev, isLoading: true }));
      const pitchDeck = await repository.getPitchDeckById(id);
      
      if (pitchDeck) {
        console.log('✅ Successfully loaded pitch deck:', pitchDeck.title, 'with', pitchDeck.slides.length, 'slides');
        setState(prev => ({
          ...prev,
          currentPitchDeck: pitchDeck,
          currentSlide: pitchDeck.currentSlide,
          showPitchDeckList: false,
          isLoading: false
        }));
        console.log('📊 State updated - showPitchDeckList:', false, 'currentSlide:', pitchDeck.currentSlide);
      } else {
        console.error('❌ Pitch deck not found for ID:', id);
        setState(prev => ({
          ...prev,
          error: 'Pitch deck not found',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('💥 Failed to load pitch deck:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load pitch deck',
        isLoading: false
      }));
    }
  }, [repository]);

  const updateCurrentSlide = useCallback(async (slideNumber: number) => {
    const { currentPitchDeck } = state;
    console.log('updateCurrentSlide called:', { slideNumber, hasDeck: !!currentPitchDeck });
    
    if (!currentPitchDeck) {
      console.log('No current pitch deck, cannot update slide');
      return;
    }

    try {
      console.log('Updating slide in repository and state...');
      await repository.updateCurrentSlide(currentPitchDeck.id, slideNumber);
      setState(prev => ({
        ...prev,
        currentSlide: slideNumber,
        currentPitchDeck: prev.currentPitchDeck 
          ? { ...prev.currentPitchDeck, currentSlide: slideNumber }
          : null
      }));
      console.log('Slide updated to:', slideNumber);
    } catch (error) {
      console.error('Failed to update current slide:', error);
    }
  }, [state.currentPitchDeck, repository]);

  const deletePitchDeck = useCallback(async (id: string) => {
    try {
      await repository.deletePitchDeck(id);
      await loadAllPitchDecks();
      
      // If deleted pitch deck was currently loaded, clear it
      if (state.currentPitchDeck?.id === id) {
        setState(prev => ({
          ...prev,
          currentPitchDeck: null,
          showPitchDeckList: true
        }));
      }
    } catch (error) {
      console.error('Failed to delete pitch deck:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete pitch deck'
      }));
    }
  }, [repository, loadAllPitchDecks, state.currentPitchDeck]);

  const markPitchDeckCompleted = useCallback(async () => {
    const { currentPitchDeck } = state;
    if (!currentPitchDeck) return;

    try {
      await repository.markPitchDeckCompleted(currentPitchDeck.id);
      setState(prev => ({
        ...prev,
        currentPitchDeck: prev.currentPitchDeck
          ? { 
              ...prev.currentPitchDeck, 
              isCompleted: true, 
              completedAt: Date.now() 
            }
          : null
      }));
      await loadAllPitchDecks();
    } catch (error) {
      console.error('Failed to mark pitch deck as completed:', error);
    }
  }, [state.currentPitchDeck, repository, loadAllPitchDecks]);

  const showPitchDeckListFunc = useCallback(() => {
    console.log('🔄 showPitchDeckListFunc called - returning to pitch deck list');
    setState(prev => {
      console.log('🔄 Previous state:', {
        showPitchDeckList: prev.showPitchDeckList,
        currentPitchDeck: prev.currentPitchDeck?.title || 'none',
        showCreator: prev.showCreator
      });
      
      const newState = {
        ...prev,
        showPitchDeckList: true,
        showCreator: false,
        currentPitchDeck: null
      };
      
      console.log('🔄 New state:', {
        showPitchDeckList: newState.showPitchDeckList,
        currentPitchDeck: newState.currentPitchDeck?.title || 'none',
        showCreator: newState.showCreator
      });
      
      return newState;
    });
    // Reload the list when returning to it
    loadAllPitchDecks().catch(console.error);
  }, [loadAllPitchDecks]);

  const showCreatorFunc = useCallback(() => {
    setState(prev => ({
      ...prev,
      showPitchDeckList: false,
      showCreator: true,
      currentPitchDeck: null
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const retryGeneration = useCallback(() => {
    if (state.lastPitchDeckRequest) {
      generatePitchDeck(state.lastPitchDeckRequest);
    }
  }, [state.lastPitchDeckRequest, generatePitchDeck]);

  const generateImageForSlide = useCallback(async (slideIndex: number) => {
    const { currentPitchDeck } = state;
    if (!currentPitchDeck) return;

    try {
      console.log(`Generating image for slide ${slideIndex + 1}...`);
      
      const result = await generator.generateImageForSlide(currentPitchDeck, slideIndex);
      
      if (result.success && result.imageUrl) {
        // Update the slide with the new image
        const updatedSlides = [...currentPitchDeck.slides];
        updatedSlides[slideIndex] = {
          ...updatedSlides[slideIndex],
          imageUrl: result.imageUrl
        };

        const updatedPitchDeck = {
          ...currentPitchDeck,
          slides: updatedSlides
        };

        // Save to repository
        await repository.savePitchDeck(updatedPitchDeck);

        // Update state
        setState(prev => ({
          ...prev,
          currentPitchDeck: updatedPitchDeck
        }));

        console.log(`Successfully generated image for slide ${slideIndex + 1}`);
      } else {
        console.error(`Failed to generate image for slide ${slideIndex + 1}:`, result.error);
        setState(prev => ({
          ...prev,
          error: `Failed to generate image: ${result.error}`
        }));
      }
    } catch (error) {
      console.error('Error in generateImageForSlide:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate image'
      }));
    }
  }, [state.currentPitchDeck, generator, repository]);

  const uploadImageForSlide = useCallback(async (slideIndex: number, file: File) => {
    const { currentPitchDeck } = state;
    if (!currentPitchDeck) return;

    try {
      console.log(`Uploading image for slide ${slideIndex + 1}...`);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        throw new Error('Image file is too large. Please select an image smaller than 5MB');
      }

      // Convert file to base64 data URL
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      // Update the slide with the uploaded image
      const updatedSlides = [...currentPitchDeck.slides];
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        imageUrl: base64Url,
        imagePrompt: `User uploaded: ${file.name}`
      };

      const updatedPitchDeck = {
        ...currentPitchDeck,
        slides: updatedSlides
      };

      // Save to repository
      await repository.savePitchDeck(updatedPitchDeck);

      // Update state
      setState(prev => ({
        ...prev,
        currentPitchDeck: updatedPitchDeck
      }));

      console.log(`Successfully uploaded image for slide ${slideIndex + 1}`);
    } catch (error) {
      console.error('Error in uploadImageForSlide:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to upload image'
      }));
    }
  }, [state.currentPitchDeck, repository]);

  const exportSpeakerPDF = useCallback(async () => {
    const { currentPitchDeck } = state;
    if (!currentPitchDeck) {
      setState(prev => ({
        ...prev,
        error: 'No pitch deck selected for export'
      }));
      return;
    }

    try {
      console.log('Starting speaker PDF export for:', currentPitchDeck.title);
      setState(prev => ({ ...prev, error: null }));
      
      // Create progress callback
      const progressCallback = PDFExportService.createProgressCallback(
        (message: string, percentage: number) => {
          console.log(message, `${percentage}%`);
        }
      );

      await PDFExportService.exportSpeakerPDF(currentPitchDeck, progressCallback);
      
      console.log('Speaker PDF export completed successfully');
    } catch (error) {
      console.error('Speaker PDF export failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export speaker PDF'
      }));
    }
  }, [state.currentPitchDeck]);

  const exportInvestorPDF = useCallback(async () => {
    const { currentPitchDeck } = state;
    if (!currentPitchDeck) {
      setState(prev => ({
        ...prev,
        error: 'No pitch deck selected for export'
      }));
      return;
    }

    try {
      console.log('Starting investor PDF export for:', currentPitchDeck.title);
      setState(prev => ({ ...prev, error: null }));
      
      // Create progress callback
      const progressCallback = PDFExportService.createProgressCallback(
        (message: string, percentage: number) => {
          console.log(message, `${percentage}%`);
        }
      );

      await PDFExportService.exportInvestorPDF(currentPitchDeck, progressCallback);
      
      console.log('Investor PDF export completed successfully');
    } catch (error) {
      console.error('Investor PDF export failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export investor PDF'
      }));
    }
  }, [state.currentPitchDeck]);

  const exportOnePagerPDF = useCallback(async () => {
    const { currentPitchDeck } = state;
    if (!currentPitchDeck) {
      setState(prev => ({
        ...prev,
        error: 'No pitch deck selected for export'
      }));
      return;
    }

    try {
      console.log('Starting One-Pager PDF export for:', currentPitchDeck.title);
      setState(prev => ({ ...prev, error: null }));
      
      // Create progress callback
      const progressCallback = PDFExportService.createProgressCallback(
        (message: string, percentage: number) => {
          console.log(message, `${percentage}%`);
        }
      );

      await PDFExportService.exportOnePagerPDF(currentPitchDeck, progressCallback);
      
      console.log('One-Pager PDF export completed successfully');
    } catch (error) {
      console.error('One-Pager PDF export failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export One-Pager PDF'
      }));
    }
  }, [state.currentPitchDeck]);

  // Navigate between slides
  const nextSlide = useCallback(() => {
    const { currentPitchDeck, currentSlide } = state;
    console.log('nextSlide called:', { 
      currentSlide, 
      totalSlides: currentPitchDeck?.totalSlides,
      canGoNext: currentPitchDeck && currentSlide < currentPitchDeck.totalSlides - 1
    });
    
    if (currentPitchDeck && currentSlide < currentPitchDeck.totalSlides - 1) {
      console.log('Moving to next slide:', currentSlide + 1);
      updateCurrentSlide(currentSlide + 1);
    } else {
      console.log('Cannot go to next slide - at end or no deck');
    }
  }, [state.currentPitchDeck, state.currentSlide, updateCurrentSlide]);

  const previousSlide = useCallback(() => {
    const { currentSlide } = state;
    if (currentSlide > 0) {
      updateCurrentSlide(currentSlide - 1);
    }
  }, [state.currentSlide, updateCurrentSlide]);

  const goToSlide = useCallback((slideNumber: number) => {
    const { currentPitchDeck } = state;
    if (currentPitchDeck && slideNumber >= 0 && slideNumber < currentPitchDeck.totalSlides) {
      updateCurrentSlide(slideNumber);
    }
  }, [state.currentPitchDeck, updateCurrentSlide]);

  return {
    // State
    ...state,
    
    // Actions
    generatePitchDeck,
    loadPitchDeck,
    deletePitchDeck,
    markPitchDeckCompleted,
    updateCurrentSlide,
    goToPitchDeckList: showPitchDeckListFunc,
    showCreatorForm: showCreatorFunc,
    clearError,
    retryGeneration,
    generateImageForSlide,
    uploadImageForSlide,
    exportSpeakerPDF,
    exportInvestorPDF,
    exportOnePagerPDF,
    
    // Navigation
    nextSlide,
    previousSlide,
    goToSlide,
    
    // Computed properties
    canGoNext: state.currentPitchDeck 
      ? state.currentSlide < state.currentPitchDeck.totalSlides - 1 
      : false,
    canGoPrevious: state.currentSlide > 0,
    progressPercentage: state.currentPitchDeck 
      ? Math.round((state.currentSlide + 1) / state.currentPitchDeck.totalSlides * 100)
      : 0
  };
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BusinessPlan,
  BusinessPlanRequest, 
  BusinessPlanState, 
  GenerationPhase 
} from '@/types/pitchDeck';
import { OnlineBusinessPlanGenerator } from '@/services/businessPlanGenerator';
import { LocalPitchDeckRepository } from '@/services/pitchDeckRepository';

// Custom hook for business plan management
export function useBusinessPlan() {
  const [state, setState] = useState<BusinessPlanState>({
    isGenerating: false,
    generationProgress: {
      currentSlide: 0,
      totalSlides: 9,
      phase: GenerationPhase.PREPARING,
      isGenerating: false
    },
    currentBusinessPlan: null,
    allBusinessPlans: [],
    error: null,
    isLoading: false,
    currentSection: 0,
    showBusinessPlanList: true,
    showCreator: false,
    lastBusinessPlanRequest: null
  });

  // Initialize services
  const [generator] = useState(() => {
    console.log('Initializing OnlineBusinessPlanGenerator with server-side API');
    return new OnlineBusinessPlanGenerator();
  });

  const [repository] = useState(() => new LocalPitchDeckRepository());

  // Load all business plans on initialization (client-side only to avoid hydration issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadAllBusinessPlans();
    }
  }, []);

  const loadAllBusinessPlans = useCallback(async (preserveCurrentState = false) => {
    try {
      if (!preserveCurrentState) {
        setState(prev => ({ ...prev, isLoading: true }));
      }
      
      // Get all pitch decks and filter for business plans
      // For now, we'll use the same repository but in a real app you'd have a separate BusinessPlanRepository
      const allItems = await repository.getAllPitchDecks();
      const businessPlans = allItems.filter(item => item.id.startsWith('bp-')) as unknown as BusinessPlan[];
      
      setState(prev => ({ 
        ...prev, 
        allBusinessPlans: businessPlans, 
        isLoading: preserveCurrentState ? prev.isLoading : false 
      }));
    } catch (error) {
      console.error('Failed to load business plans:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load business plans', 
        isLoading: preserveCurrentState ? prev.isLoading : false 
      }));
    }
  }, [repository]);

  const generateBusinessPlan = useCallback(async (request: BusinessPlanRequest, extractedContent?: string) => {
    try {
      console.log('Starting business plan generation');
      setState(prev => ({
        ...prev,
        isGenerating: true,
        generationProgress: {
          currentSlide: 0,
          totalSlides: 9,
          phase: GenerationPhase.PREPARING,
          isGenerating: true
        },
        error: null,
        currentBusinessPlan: null,
        showBusinessPlanList: false,
        showCreator: false,
        lastBusinessPlanRequest: request
      }));

      // Update phase to generating
      setState(prev => ({
        ...prev,
        generationProgress: {
          ...prev.generationProgress,
          phase: GenerationPhase.GENERATING_SLIDES
        }
      }));

      // Generate business plan with progress callbacks
      const businessPlan = await generator.generateBusinessPlan(
        request,
        (currentSection: number, totalSections: number) => {
          setState(prev => ({
            ...prev,
            generationProgress: {
              ...prev.generationProgress,
              currentSlide: currentSection,
              totalSlides: totalSections
            }
          }));
        },
        extractedContent
      );

      if (businessPlan) {
        console.log('Generation completed successfully, transitioning to viewer:', businessPlan.title);
        
        // Save to repository (cast to PitchDeck for storage compatibility)
        await repository.savePitchDeck(businessPlan as any);

        // Update state with completed generation
        setState(prev => ({
          ...prev,
          isGenerating: false,
          generationProgress: {
            currentSlide: 9,
            totalSlides: 9,
            phase: GenerationPhase.COMPLETED,
            isGenerating: false
          },
          currentBusinessPlan: businessPlan,
          currentSection: 0,
          showBusinessPlanList: false
        }));

        console.log('State updated, should show business plan viewer now');
      } else {
        throw new Error('Failed to generate business plan');
      }
    } catch (error) {
      console.error('Business plan generation failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationProgress: {
          currentSlide: 0,
          totalSlides: 9,
          phase: GenerationPhase.ERROR,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        error: error instanceof Error ? error.message : 'Failed to generate business plan'
      }));
    }
  }, [generator, repository]);

  const loadBusinessPlan = useCallback(async (id: string) => {
    try {
      console.log('🔍 Loading business plan with ID:', id);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const item = await repository.getPitchDeckById(id);
      const businessPlan = item as unknown as BusinessPlan;
      
      if (businessPlan && businessPlan.id.startsWith('bp-')) {
        console.log('✅ Successfully loaded business plan:', businessPlan.title, 'with', businessPlan.sections.length, 'sections');
        setState(prev => ({
          ...prev,
          currentBusinessPlan: businessPlan,
          currentSection: businessPlan.currentSection,
          showBusinessPlanList: false,
          isLoading: false
        }));
        console.log('📊 State updated - showBusinessPlanList:', false, 'currentSection:', businessPlan.currentSection);
      } else {
        console.error('❌ Business plan not found for ID:', id);
        setState(prev => ({
          ...prev,
          error: 'Business plan not found',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('💥 Failed to load business plan:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load business plan',
        isLoading: false
      }));
    }
  }, [repository]);

  const updateCurrentSection = useCallback(async (sectionNumber: number) => {
    const { currentBusinessPlan } = state;
    console.log('updateCurrentSection called:', { sectionNumber, hasPlan: !!currentBusinessPlan });
    
    if (!currentBusinessPlan) {
      console.log('No current business plan, cannot update section');
      return;
    }

    try {
      console.log('Updating section in repository and state...');
      await repository.updateCurrentSlide(currentBusinessPlan.id, sectionNumber);
      setState(prev => ({
        ...prev,
        currentSection: sectionNumber,
        currentBusinessPlan: prev.currentBusinessPlan 
          ? { ...prev.currentBusinessPlan, currentSection: sectionNumber }
          : null
      }));
      console.log('Section updated to:', sectionNumber);
    } catch (error) {
      console.error('Failed to update current section:', error);
    }
  }, [state.currentBusinessPlan, repository]);

  const deleteBusinessPlan = useCallback(async (id: string) => {
    try {
      await repository.deletePitchDeck(id);
      await loadAllBusinessPlans();
      
      // If deleted business plan was currently loaded, clear it
      if (state.currentBusinessPlan?.id === id) {
        setState(prev => ({
          ...prev,
          currentBusinessPlan: null,
          showBusinessPlanList: true
        }));
      }
    } catch (error) {
      console.error('Failed to delete business plan:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete business plan'
      }));
    }
  }, [repository, loadAllBusinessPlans, state.currentBusinessPlan]);

  const showBusinessPlanListFunc = useCallback(() => {
    console.log('🔙 BACK BUTTON CLICKED - showBusinessPlanListFunc called');
    
    setState(prev => {
      console.log('🔍 BEFORE STATE UPDATE:', {
        showBusinessPlanList: prev.showBusinessPlanList,
        currentBusinessPlan: prev.currentBusinessPlan?.title || null,
        showCreator: prev.showCreator
      });
      
      return {
        ...prev,
        showBusinessPlanList: true,
        showCreator: false,
        currentBusinessPlan: null,
        currentSection: 0,
        error: null
      };
    });
    
    console.log('✅ setState called, should trigger re-render');
    loadAllBusinessPlans().catch(console.error);
  }, [loadAllBusinessPlans]);

  const showCreatorFunc = useCallback(() => {
    setState(prev => ({
      ...prev,
      showBusinessPlanList: false,
      showCreator: true,
      currentBusinessPlan: null
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const retryGeneration = useCallback(() => {
    if (state.lastBusinessPlanRequest) {
      generateBusinessPlan(state.lastBusinessPlanRequest);
    }
  }, [state.lastBusinessPlanRequest, generateBusinessPlan]);

  // Navigate between sections
  const nextSection = useCallback(() => {
    const { currentBusinessPlan, currentSection } = state;
    console.log('nextSection called:', { 
      currentSection, 
      totalSections: currentBusinessPlan?.totalSections,
      canGoNext: currentBusinessPlan && currentSection < currentBusinessPlan.totalSections - 1
    });
    
    if (currentBusinessPlan && currentSection < currentBusinessPlan.totalSections - 1) {
      console.log('Moving to next section:', currentSection + 1);
      updateCurrentSection(currentSection + 1);
    } else {
      console.log('Cannot go to next section - at end or no plan');
    }
  }, [state.currentBusinessPlan, state.currentSection, updateCurrentSection]);

  const previousSection = useCallback(() => {
    const { currentSection } = state;
    if (currentSection > 0) {
      updateCurrentSection(currentSection - 1);
    }
  }, [state.currentSection, updateCurrentSection]);

  const goToSection = useCallback((sectionNumber: number) => {
    const { currentBusinessPlan } = state;
    if (currentBusinessPlan && sectionNumber >= 0 && sectionNumber < currentBusinessPlan.totalSections) {
      updateCurrentSection(sectionNumber);
    }
  }, [state.currentBusinessPlan, updateCurrentSection]);

  const exportPDF = useCallback(async (format: 'pdf' | 'txt' = 'pdf') => {
    const { currentBusinessPlan } = state;
    if (!currentBusinessPlan) {
      setState(prev => ({
        ...prev,
        error: 'No business plan selected for export'
      }));
      return;
    }

    try {
      console.log(`Starting ${format.toUpperCase()} export for:`, currentBusinessPlan.title);
      setState(prev => ({ ...prev, error: null }));
      
      if (format === 'txt') {
        // Text export
        const textContent = currentBusinessPlan.sections
          .map(section => `${section.title}\n\n${section.content}\n\n`)
          .join('');
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentBusinessPlan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_business_plan.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // PDF export using jsPDF
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        // PDF styling
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;
        
        // Add title
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(currentBusinessPlan.title, margin, yPosition);
        yPosition += 20;
        
        // Add creation date
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 20;
        
        // Add each section
        for (const section of currentBusinessPlan.sections) {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Section title
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(section.title, margin, yPosition);
          yPosition += 15;
          
          // Section content
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          
          // Split text into lines that fit the page width
          const lines = pdf.splitTextToSize(section.content, maxWidth);
          
          for (const line of lines) {
            // Check if we need a new page
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.text(line, margin, yPosition);
            yPosition += 6;
          }
          
          yPosition += 10; // Extra space between sections
        }
        
        // Save the PDF
        const fileName = `${currentBusinessPlan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_business_plan.pdf`;
        pdf.save(fileName);
      }
      
      console.log(`${format.toUpperCase()} export completed successfully`);
    } catch (error) {
      console.error(`${format.toUpperCase()} export failed:`, error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : `Failed to export ${format.toUpperCase()}`
      }));
    }
  }, [state.currentBusinessPlan]);

  return {
    // State
    ...state,
    
    // Actions
    generateBusinessPlan,
    loadBusinessPlan,
    deleteBusinessPlan,
    updateCurrentSection,
    goToBusinessPlanList: showBusinessPlanListFunc,
    showCreatorForm: showCreatorFunc,
    clearError,
    retryGeneration,
    exportPDF,
    
    // Navigation
    nextSection,
    previousSection,
    goToSection,
    
    // Computed properties
    canGoNext: state.currentBusinessPlan 
      ? state.currentSection < state.currentBusinessPlan.totalSections - 1 
      : false,
    canGoPrevious: state.currentSection > 0,
    progressPercentage: state.currentBusinessPlan 
      ? Math.round((state.currentSection + 1) / state.currentBusinessPlan.totalSections * 100)
      : 0
  };
}
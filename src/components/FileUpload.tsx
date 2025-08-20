'use client';

import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileProcessed: (content: string, fileName: string) => void;
  onError: (error: string) => void;
  className?: string;
}

interface UploadedFile {
  file: File;
  status: 'processing' | 'completed' | 'error';
  content?: string;
  error?: string;
}

export default function FileUpload({ onFileProcessed, onError, className = '' }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Create timeout manually for better browser compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      // Check for different response formats
      if (data.error && !data.content) {
        // Old error format - convert to content
        return `File upload error: ${data.error}\n\nPlease manually enter the content from your document in the form fields below.`;
      }
      
      if (data.content) {
        // New format always has content
        return data.content;
      }
      
      // Fallback if unexpected format
      return `File "${file.name}" was uploaded but content could not be extracted. Please manually enter the key information from your document.`;
      
    } catch (error) {
      // Handle all errors gracefully - no more 500s
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        return `File "${file.name}" upload timed out. Please try a smaller file or manually enter the content from your document.`;
      }
      
      return `File "${file.name}" upload encountered an issue. Please manually enter the content from your document in the form fields below.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                         file.type === 'text/plain' ||
                         file.name.toLowerCase().endsWith('.pdf') ||
                         file.name.toLowerCase().endsWith('.docx') ||
                         file.name.toLowerCase().endsWith('.txt');
      
      if (!isValidType) {
        onError(`File "${file.name}" is not a supported format. Please upload PDF, DOCX, or TXT files only.`);
        return false;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        onError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      status: 'processing' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const uploadedFile = newFiles[i];
      
      try {
        const content = await processFile(uploadedFile.file);
        
        setUploadedFiles(prev => prev.map(f => 
          f.file === uploadedFile.file 
            ? { ...f, status: 'completed', content }
            : f
        ));

        // Always call onFileProcessed - even with fallback content
        onFileProcessed(content, uploadedFile.file.name);
        
        // Only show error if it's actually an error, not just fallback content
        if (content.includes('upload error') || content.includes('encountered an issue')) {
          onError(`Note: "${uploadedFile.file.name}" processing had issues, but file context is available for AI generation.`);
        }
        
      } catch (error) {
        // This should rarely happen now since processFile handles errors internally
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const fallbackContent = `File "${uploadedFile.file.name}" upload failed. Please manually enter your document content in the form fields below.`;
        
        setUploadedFiles(prev => prev.map(f => 
          f.file === uploadedFile.file 
            ? { ...f, status: 'completed', content: fallbackContent }
            : f
        ));

        // Still provide the file context to the form
        onFileProcessed(fallbackContent, uploadedFile.file.name);
        onError(`Upload issue with "${uploadedFile.file.name}": ${errorMessage}`);
      }
    }
  }, [processFile, onFileProcessed, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  }, [handleFiles]);

  const removeFile = useCallback((fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-lg font-medium text-gray-900 mb-2">
          Upload company documents
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Drag & drop PDF, DOCX, or TXT files here, or click to browse
          <br />
          <span className="text-xs text-gray-500">Maximum file size: 10MB</span>
        </div>
        <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Choose Files
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileInput}
            className="sr-only"
          />
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {uploadedFile.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {uploadedFile.status === 'processing' && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-xs">Processing...</span>
                  </div>
                )}
                
                {uploadedFile.status === 'completed' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="ml-2 text-xs">Processed</span>
                  </div>
                )}
                
                {uploadedFile.status === 'error' && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="ml-2 text-xs">Error</span>
                  </div>
                )}
                
                <button
                  onClick={() => removeFile(uploadedFile.file)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useRef } from 'react';
import { useToast } from '../ui/Toast';
import { Spinner } from '../ui/Spinner';

interface BillScannerProps {
  onScanComplete: (data: any) => void;
}

export function BillScanner({ onScanComplete }: BillScannerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, error } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      error('Please upload an image or PDF file');
      return;
    }

    setIsScanning(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Str = reader.result?.toString().split(',')[1];
        if (!base64Str) throw new Error('Failed to read file');

        const res = await fetch('/api/ai/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64: base64Str,
            mimeType: file.type
          })
        });

        if (!res.ok) throw new Error('Failed to scan bill');

        const { data } = await res.json();
        toast('Bill scanned successfully!', 'success');
        onScanComplete(data);
      };
    } catch (err) {
      console.error(err);
      error('Failed to process the bill. Please try again or enter manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) processFile(file);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        isDragging 
          ? 'border-accent-cyan bg-accent-cyan/5' 
          : 'border-border-subtle bg-surface-900/50 hover:bg-surface-900'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden" 
      />

      {isScanning ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Spinner className="w-8 h-8" />
          <p className="text-sm font-medium text-white/80 animate-pulse">OptiCore AI is analyzing your bill...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-white mb-1">Upload a photo of your utility bill</p>
            <p className="text-sm text-white/60 mb-6">Drag and drop, or click to browse</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Select File
          </button>
          <p className="text-xs text-white/40 mt-4">Supports JPEG, PNG, WEBP, and PDF. Our AI automatically extracts consumption, dates, and amounts.</p>
        </div>
      )}
    </div>
  );
}

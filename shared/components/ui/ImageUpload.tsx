import React, { useState, useRef } from 'react';
import { cn } from '../utils';
import { Upload, X, Camera, User } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null, preview?: string) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  variant?: 'avatar' | 'banner' | 'product';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  error,
  label,
  required = false,
  placeholder = 'Upload image',
  variant = 'avatar'
}) => {
  const [preview, setPreview] = useState<string>(value || '');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please use: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxSize}MB`;
    }
    
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setUploading(true);
    
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange(file, previewUrl);
    } catch (err) {
      console.error('Error handling file:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'avatar':
        return 'aspect-square rounded-full';
      case 'banner':
        return 'aspect-[3/1] rounded-lg';
      case 'product':
        return 'aspect-square rounded-lg';
      default:
        return 'aspect-square rounded-lg';
    }
  };

  const getVariantSize = () => {
    switch (variant) {
      case 'avatar':
        return 'h-24 w-24';
      case 'banner':
        return 'h-32 w-full';
      case 'product':
        return 'h-48 w-48';
      default:
        return 'h-24 w-24';
    }
  };

  return (
    <div className={cn('form-group', className)}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {/* Upload Area */}
        <div
          className={cn(
            'relative border-2 border-dashed transition-all duration-200 cursor-pointer',
            'hover:border-primary/50 hover:bg-primary/5',
            dragOver && 'border-primary bg-primary/10',
            error && 'border-destructive/50',
            getVariantClasses(),
            getVariantSize(),
            preview ? 'border-solid border-border' : 'border-border'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className={cn(
                  'w-full h-full object-cover',
                  getVariantClasses()
                )}
              />
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              
              {/* Change Button */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary" />
              ) : (
                <>
                  <Upload className="h-8 w-8 mb-2" />
                  <p className="text-sm font-medium">{placeholder}</p>
                  <p className="text-xs mt-1">
                    {variant === 'avatar' 
                      ? 'PNG, JPG up to 5MB'
                      : `${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} up to ${maxSize}MB`
                    }
                  </p>
                </>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
            }}
          />
        </div>

        {/* Upload Button Alternative */}
        {!preview && variant !== 'avatar' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            leftIcon={<Upload className="h-4 w-4" />}
            disabled={uploading}
          >
            Choose File
          </Button>
        )}
      </div>

      {error && (
        <p className="form-error">{error}</p>
      )}
      
      {!error && (
        <p className="form-help">
          Drag and drop or click to upload. Max size: {maxSize}MB
        </p>
      )}
    </div>
  );
};

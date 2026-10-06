"use client";

import React, { useState, useRef, useCallback } from "react";
import { X, Camera, Upload, CheckCircle2, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";

interface EditProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl: string;
  onSavePhoto: (newUrl: string) => void;
}

const PRESET_AVATARS = [
  "https://lh3.googleusercontent.com/aida/AP1WRLsSwZ4DjkxkSDZcZiAFoC9WKVvWBd8YATVOK-aK4N5vTMk-Tk_6V8WlDvdomJ6bYe3HBp3PNJ57I_UT61tstMRF7kFhOemD1si94bMRwOkkiJtzmqqVRoT-zrcdNLikddEewBScNfE0KSklZnZdxG8S9jZVhAjVQHsJTFgrR9hBngkx66hTESe8CD9gV0WcYBEfci5hir_QikVnOaQyKCE_F5dZy8foopgH73duZTbFG4POtZ2DI7uiZIE",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80"
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_DIMENSION = 400; // Compress to 400x400 max

/**
 * Compresses an image file to a Base64 data URL via canvas resizing.
 * Output is always JPEG at 0.85 quality, max 400x400px.
 */
function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Scale down to fit within MAX_DIMENSION while keeping aspect ratio
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function EditProfilePhotoModal({
  isOpen,
  onClose,
  currentPhotoUrl,
  onSavePhoto
}: EditProfilePhotoModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(currentPhotoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload PNG, JPG, or WEBP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Compress and convert to Base64
    setIsProcessing(true);
    try {
      const base64DataUrl = await compressImageToBase64(file);
      setSelectedPhoto(base64DataUrl);
    } catch (err) {
      setError("Failed to process image. Please try a different file.");
      console.error("Image compression error:", err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!selectedPhoto) {
      setError("No photo selected.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    setTimeout(() => {
      onSavePhoto(selectedPhoto);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Update Profile Picture</h2>
            <p className="text-xs text-on-surface-variant">Upload a new photo or choose from avatars</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* Preview */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-primary via-surface-container-highest to-surface shadow-lg relative">
            {isProcessing ? (
              <div className="w-full h-full rounded-full border-4 border-surface-container bg-surface-high flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : (
              <img src={selectedPhoto} alt="Selected Avatar" className="w-full h-full object-cover rounded-full border-4 border-surface-container" />
            )}
          </div>
          <span className="text-xs text-on-surface-variant">
            {isProcessing ? "Processing..." : "Selected Preview"}
          </span>
        </div>

        {/* Upload Button */}
        <div className="p-4 border-2 border-dashed border-white/10 hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer relative bg-surface transition-colors">
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png,image/jpeg,image/webp" 
            onChange={handleFileUpload} 
            className="absolute inset-0 opacity-0 cursor-pointer" 
          />
          <Upload size={20} className="text-primary" />
          <span className="text-xs font-bold text-on-surface">Upload Custom Photo</span>
          <span className="text-[10px] text-on-surface-variant">PNG, JPG or WEBP up to 5MB</span>
        </div>

        {/* Preset Avatars */}
        <div>
          <label className="text-xs font-semibold text-on-surface-variant block mb-2">Preset Avatars</label>
          <div className="flex gap-3 justify-center">
            {PRESET_AVATARS.map((url, idx) => (
              <img 
                key={idx} 
                src={url} 
                alt="Avatar preset"
                onClick={() => { setSelectedPhoto(url); setError(null); }}
                className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-all ${selectedPhoto === url ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs cursor-pointer">Cancel</button>
          <button 
            type="button"
            disabled={isSubmitting || isProcessing}
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                Save Profile Photo <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

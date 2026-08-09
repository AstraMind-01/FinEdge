"use client";

import React, { useState } from "react";
import { X, Camera, Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

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

export default function EditProfilePhotoModal({
  isOpen,
  onClose,
  currentPhotoUrl,
  onSavePhoto
}: EditProfilePhotoModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(currentPhotoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhoto(url);
    }
  };

  const handleSave = () => {
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
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-primary via-surface-container-highest to-surface shadow-lg">
            <img src={selectedPhoto} alt="Selected Avatar" className="w-full h-full object-cover rounded-full border-4 border-surface-container" />
          </div>
          <span className="text-xs text-on-surface-variant">Selected Preview</span>
        </div>

        {/* Upload Button */}
        <div className="p-4 border-2 border-dashed border-white/10 hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer relative bg-surface">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
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
                onClick={() => setSelectedPhoto(url)}
                className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-all ${selectedPhoto === url ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
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

import React from 'react';
import { Camera, Verified, Mail, Smartphone, MapPin, Edit2 } from 'lucide-react';

interface ProfileOverviewProps {
  profile?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    branch: string;
    avatarUrl?: string;
  };
  onEditPhotoClick?: () => void;
  onEditProfileClick?: () => void;
}

export default function ProfileOverview({ profile, onEditPhotoClick, onEditProfileClick }: ProfileOverviewProps) {
  const avatarUrl = profile?.avatarUrl || "https://lh3.googleusercontent.com/aida/AP1WRLsSwZ4DjkxkSDZcZiAFoC9WKVvWBd8YATVOK-aK4N5vTMk-Tk_6V8WlDvdomJ6bYe3HBp3PNJ57I_UT61tstMRF7kFhOemD1si94bMRwOkkiJtzmqqVRoT-zrcdNLikddEewBScNfE0KSklZnZdxG8S9jZVhAjVQHsJTFgrR9hBngkx66hTESe8CD9gV0WcYBEfci5hir_QikVnOaQyKCE_F5dZy8foopgH73duZTbFG4POtZ2DI7uiZIE";
  const name = profile?.name || "Soumya Ranjan";
  const email = profile?.email || "soumya@finedge.bank";
  const phone = profile?.phone || "+91 98765 43210";
  const address = profile?.address || "402, Skyline Towers, G Block, BKC, Mumbai 400051";
  const branch = profile?.branch || "Mumbai Corporate";

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden relative shadow-lg group w-full">
      {/* Decorative background blur */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10 w-full">
        {/* Avatar Area */}
        <div className="relative shrink-0 flex flex-col items-center gap-3">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-primary via-surface-container-highest to-surface shadow-[0_0_20px_rgba(240,180,41,0.15)] group-hover:shadow-[0_0_30px_rgba(240,180,41,0.3)] transition-shadow duration-500">
            <img 
              alt="Profile Avatar" 
              className="w-full h-full object-cover rounded-full bg-surface-container-low border-4 border-surface-container" 
              src={avatarUrl}
            />
            <button 
              type="button"
              onClick={onEditPhotoClick}
              title="Change Profile Photo"
              className="absolute bottom-0 right-0 p-2 bg-surface-container-highest text-primary rounded-full border-2 border-surface-container hover:bg-surface-variant transition-colors shadow-md cursor-pointer"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full border border-primary/20">
            <Verified className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Premium Member</span>
          </div>
        </div>

        {/* Profile Info Area */}
        <div className="flex-1 flex flex-col gap-4 w-full min-w-0 overflow-hidden">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="text-2xl md:text-3xl font-semibold m-0 text-on-surface truncate">{name}</h2>
                <Verified className="text-teal-400 w-6 h-6 shrink-0" />
              </div>
              
              <button 
                type="button"
                onClick={onEditProfileClick}
                className="px-3 py-1.5 rounded-lg bg-surface-high hover:bg-surface-variant border border-outline-variant/30 text-xs font-bold text-primary flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-2">
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-on-surface-variant mb-0.5 font-medium tracking-wide">Customer ID</span>
                <span className="font-mono text-xs md:text-sm text-on-surface truncate">FE9842</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-on-surface-variant mb-0.5 font-medium tracking-wide">Member Since</span>
                <span className="font-mono text-xs md:text-sm text-on-surface truncate">Oct 2021</span>
              </div>
              <div className="flex flex-col min-w-0 col-span-2 sm:col-span-1">
                <span className="text-xs text-on-surface-variant mb-0.5 font-medium tracking-wide">Branch</span>
                <span className="font-mono text-xs md:text-sm text-on-surface truncate cursor-pointer hover:text-primary transition-colors" title={branch} onClick={onEditProfileClick}>{branch}</span>
              </div>
            </div>
          </div>
          
          <div className="h-px w-full bg-surface-container-highest my-1"></div>
          
          {/* Contact Rows with Interactive Edit Buttons */}
          <div className="flex flex-col gap-2.5 w-full">
            
            {/* Email Row */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface-container-low/40 hover:bg-surface-container-highest transition-colors w-full border border-surface-container-highest/50 group/row">
              <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onEditProfileClick}>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 text-primary group-hover/row:text-primary">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] text-on-surface-variant font-medium tracking-wide">Email Address</span>
                  <span className="font-mono text-xs md:text-sm text-on-surface truncate" title={email}>{email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-teal-400/10 text-teal-400 text-[10px] font-bold uppercase tracking-wider border border-teal-400/20">Verified</span>
                <button 
                  type="button" 
                  onClick={onEditProfileClick} 
                  className="p-1 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-variant"
                  title="Edit Email Address (Requires 2FA)"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
            
            {/* Phone Row */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface-container-low/40 hover:bg-surface-container-highest transition-colors w-full border border-surface-container-highest/50 group/row">
              <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onEditProfileClick}>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 text-primary group-hover/row:text-primary">
                  <Smartphone size={16} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] text-on-surface-variant font-medium tracking-wide">Phone Number</span>
                  <span className="font-mono text-xs md:text-sm text-on-surface truncate" title={phone}>{phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-teal-400/10 text-teal-400 text-[10px] font-bold uppercase tracking-wider border border-teal-400/20">Verified</span>
                <button 
                  type="button" 
                  onClick={onEditProfileClick} 
                  className="p-1 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-variant"
                  title="Edit Phone Number (Requires 2FA)"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
            
            {/* Primary Address Row */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface-container-low/40 hover:bg-surface-container-highest transition-colors w-full border border-surface-container-highest/50 group/row">
              <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onEditProfileClick}>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 text-primary group-hover/row:text-primary">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] text-on-surface-variant font-medium tracking-wide">Primary Address</span>
                  <span className="text-xs md:text-sm text-on-surface truncate" title={address}>{address}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  onClick={onEditProfileClick} 
                  className="p-1 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-variant"
                  title="Edit Primary Address (Requires 2FA)"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Camera, Verified, Mail, Smartphone, MapPin } from 'lucide-react';

export default function ProfileOverview() {
  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden relative shadow-lg group">
      {/* Decorative background blur */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative z-10">
        {/* Avatar Area */}
        <div className="relative shrink-0 flex flex-col items-center gap-3">
          <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary via-surface-container-highest to-surface shadow-[0_0_20px_rgba(240,180,41,0.15)] group-hover:shadow-[0_0_30px_rgba(240,180,41,0.3)] transition-shadow duration-500">
            <img 
              alt="Profile Avatar" 
              className="w-full h-full object-cover rounded-full bg-surface-container-low border-4 border-surface-container" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLsSwZ4DjkxkSDZcZiAFoC9WKVvWBd8YATVOK-aK4N5vTMk-Tk_6V8WlDvdomJ6bYe3HBp3PNJ57I_UT61tstMRF7kFhOemD1si94bMRwOkkiJtzmqqVRoT-zrcdNLikddEewBScNfE0KSklZnZdxG8S9jZVhAjVQHsJTFgrR9hBngkx66hTESe8CD9gV0WcYBEfci5hir_QikVnOaQyKCE_F5dZy8foopgH73duZTbFG4POtZ2DI7uiZIE"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-surface-container-highest text-primary rounded-full border-2 border-surface-container hover:bg-surface-variant transition-colors shadow-md">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full border border-primary/20">
            <Verified className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Premium Member</span>
          </div>
        </div>

        {/* Profile Info Area */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-semibold m-0 text-on-surface">Soumya Ranjan</h2>
              <Verified className="text-teal-400 w-6 h-6" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant mb-1 font-medium tracking-wide">Customer ID</span>
                <span className="font-mono text-sm text-on-surface">FE9842</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant mb-1 font-medium tracking-wide">Member Since</span>
                <span className="font-mono text-sm text-on-surface">Oct 2021</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant mb-1 font-medium tracking-wide">Branch</span>
                <span className="font-mono text-sm text-on-surface">Mumbai Corporate</span>
              </div>
            </div>
          </div>
          
          <div className="h-px w-full bg-surface-container-highest my-3"></div>
          
          {/* Contact Rows */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 group/row p-3 -ml-3 rounded-lg hover:bg-surface-container-highest transition-colors">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0 group-hover/row:text-primary transition-colors">
                <Mail size={18} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs text-on-surface-variant font-medium tracking-wide">Email Address</span>
                <span className="font-mono text-sm text-on-surface truncate">s***n@example.com</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-400/10 text-teal-400 text-[10px] font-bold uppercase tracking-wider shrink-0 border border-teal-400/20">Verified</span>
            </div>
            
            <div className="flex items-center gap-4 group/row p-3 -ml-3 rounded-lg hover:bg-surface-container-highest transition-colors">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0 group-hover/row:text-primary transition-colors">
                <Smartphone size={18} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs text-on-surface-variant font-medium tracking-wide">Phone Number</span>
                <span className="font-mono text-sm text-on-surface truncate">+91 9***12</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-400/10 text-teal-400 text-[10px] font-bold uppercase tracking-wider shrink-0 border border-teal-400/20">Verified</span>
            </div>
            
            <div className="flex items-center gap-4 group/row p-3 -ml-3 rounded-lg hover:bg-surface-container-highest transition-colors">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0 group-hover/row:text-primary transition-colors">
                <MapPin size={18} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs text-on-surface-variant font-medium tracking-wide">Primary Address</span>
                <span className="text-sm text-on-surface truncate">402, Skyline Towers, BKC, Mumbai</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

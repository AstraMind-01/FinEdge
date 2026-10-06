"use client";

import React from 'react';
import { MapPin, Home, Edit, Check } from 'lucide-react';
import { UserAddress } from '../../types';

interface AddressDetailsProps {
  addressData?: UserAddress;
  onUpdateAddressClick?: () => void;
}

export default function AddressDetails({ addressData, onUpdateAddressClick }: AddressDetailsProps) {
  const currentAddress = addressData?.currentAddress || "402, Skyline Towers, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051";
  const permanentAddress = addressData?.permanentAddress || currentAddress;
  const isSameAsCurrent = addressData ? addressData.isSameAsCurrent : true;

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6 md:p-8 relative">
      {/* Decorative map background subtle */}
      <div 
        className="absolute inset-0 opacity-5 mix-blend-screen pointer-events-none grayscale" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAC2SziN1Njk9Q_E00IyhHl_P3wdJxtSsSIEeJPuhkpmP094x90H72z6DNfksMxkcCL7CxhFW0z6fBkQcEkyay4rk9gVsxT5bBRmC-yczoIngiKO8DswiblobHBXOiXxzTahsyOK4Sg9zkPwzQeucGomjupvx35RtYrZpsJOvAoXTXq5AWraOJoqET9CN9JNu9Jk2uCbzb29RYblv10CNQu4ZNvHNu8zA_dO-AKm8RyAo7xTkaLxElEIA')" }}
      ></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold m-0 text-on-surface">Address Details</h3>
            {addressData?.lastUpdated && (
              <span className="text-[10px] text-on-surface-variant font-mono">Last updated: {addressData.lastUpdated}</span>
            )}
          </div>
          <button 
            type="button"
            onClick={onUpdateAddressClick}
            className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Update Address
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Address */}
          <div className="p-4 rounded-lg bg-surface-container-highest/30 border border-surface-container-highest flex flex-col gap-3 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2 text-primary mb-1">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold text-sm">Current Address</span>
            </div>
            <p className="text-sm text-on-surface m-0 leading-relaxed whitespace-pre-line">
              {currentAddress}
            </p>
          </div>

          {/* Permanent Address */}
          <div className="p-4 rounded-lg bg-surface-container-highest/30 border border-surface-container-highest flex flex-col gap-3 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <Home className="w-5 h-5" />
              <span className="font-semibold text-sm">Permanent Address</span>
            </div>
            <p className="text-sm text-on-surface-variant m-0 leading-relaxed whitespace-pre-line">
              {permanentAddress}
            </p>
            {isSameAsCurrent && (
              <div className="mt-auto pt-3 flex items-center gap-1.5">
                <Check className="text-teal-400 w-3.5 h-3.5" />
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Same as Current</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

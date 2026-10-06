import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { UploadCloud, CheckCircle2, ShieldAlert } from 'lucide-react';

interface IntlStep3PurposeProps {
  purpose: string;
  setPurpose: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function IntlStep3Purpose({
  purpose, setPurpose, onNext, onBack
}: IntlStep3PurposeProps) {

  const [isLrsChecked, setIsLrsChecked] = useState(false);
  const [fileStatus, setFileStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const lrsUsed = 1800000;
  const lrsLimit = 10000000; // Approx $250k equivalent limit typical for LRS
  const lrsPercentage = (lrsUsed / lrsLimit) * 100;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const simulateUpload = () => {
    setFileStatus('uploading');
    setTimeout(() => setFileStatus('success'), 1500);
  };

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden min-h-[500px]">
      
      <div className="p-6 sm:p-10 flex flex-col items-center gap-8 flex-1">
        
        <div className="w-full max-w-md flex flex-col gap-6">
          
          {/* Purpose Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Purpose of Transfer</label>
            <select 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-[52px] bg-surface px-4 rounded-xl border border-outline-variant/20 text-[14px] text-on-surface focus:outline-none focus:border-primary/50"
            >
              <option value="">Select a purpose...</option>
              <option value="Education">Education / University Fees</option>
              <option value="Family Maintenance">Maintenance of Close Relatives</option>
              <option value="Medical Treatment">Medical Treatment Abroad</option>
              <option value="Gift">Gift</option>
              <option value="Business">Business / Freelance Payment</option>
              <option value="Investment">Investment in Equity/Debt</option>
            </select>
          </div>

          {/* Document Upload */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Supporting Documents (Optional)</label>
            
            <div 
              onClick={fileStatus === 'idle' ? simulateUpload : undefined}
              className={`w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
                fileStatus === 'success' ? 'border-tertiary bg-tertiary/5' :
                fileStatus === 'uploading' ? 'border-primary bg-primary/5' :
                'border-outline-variant/30 bg-surface hover:border-primary/50 hover:bg-surface-high cursor-pointer'
              }`}
            >
              {fileStatus === 'success' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-bold text-on-surface text-[14px]">Document Uploaded Successfully</span>
                  <span className="text-[12px] text-on-surface-variant mt-1">invoice_2026.pdf (1.2 MB)</span>
                </>
              ) : fileStatus === 'uploading' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-3 animate-pulse">
                    <UploadCloud size={24} />
                  </div>
                  <span className="font-bold text-primary text-[14px]">Uploading...</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-3">
                    <UploadCloud size={24} />
                  </div>
                  <span className="font-bold text-on-surface text-[14px]">Click or drag file to upload</span>
                  <span className="text-[12px] text-on-surface-variant mt-1 text-center">Supported formats: PDF, JPG, PNG (Max 5MB)<br/>e.g., University Offer Letter, Medical Invoice</span>
                </>
              )}
            </div>
          </div>

          {/* LRS Declaration */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl border border-secondary/20 bg-secondary/5 mt-4">
            
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="text-secondary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[14px] text-on-surface">LRS Compliance Declaration</span>
                <span className="text-[12px] text-on-surface-variant leading-relaxed">
                  As per RBI guidelines, resident individuals can remit up to {formatCurrency(lrsLimit)} per financial year under the Liberalised Remittance Scheme.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-on-surface-variant">LRS Limit Utilized (FY 26-27)</span>
                <span className="text-secondary">{formatCurrency(lrsUsed)} / {formatCurrency(lrsLimit)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div 
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${lrsPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-3">
              <input 
                type="checkbox" 
                id="lrsCheck" 
                checked={isLrsChecked}
                onChange={(e) => setIsLrsChecked(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant/30 text-secondary focus:ring-secondary mt-0.5 cursor-pointer" 
              />
              <label htmlFor="lrsCheck" className="text-[12px] text-on-surface cursor-pointer select-none leading-snug">
                I declare that the total amount of foreign exchange purchased or remitted by me during the current financial year does not exceed the LRS limit of $250,000 equivalent.
              </label>
            </div>

          </div>

        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between mt-auto">
        <button className="text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors" onClick={onBack}>
          Back
        </button>
        <Button 
          disabled={!purpose || !isLrsChecked}
          onClick={onNext}
          className="bg-primary text-on-primary h-[44px] px-8 font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow"
        >
          Continue
        </Button>
      </div>

    </Card>
  );
}

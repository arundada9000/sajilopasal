'use client';

import React from 'react';
import { ShieldCheck, Lock, Database, FileText, Check } from 'lucide-react';
import { IosBottomSheet } from '@/components/ui/IosBottomSheet';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <IosBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="गोपनीयता नीति तथा कानुनी सर्तहरू"
      subtitle="Privacy Policy & Legal Terms • SajiloPasal"
      maxHeight="max-h-[90vh]"
    >
      <div className="space-y-4 text-foreground text-sm leading-relaxed">
        {/* 1. 100% Local Data Ownership Guarantee */}
        <div className="p-4 rounded-lg flex gap-3 items-start bg-green-bg border border-green-border">
          <Database className="w-5 h-5 shrink-0 mt-0.5 text-green-text" />
          <div>
            <h4 className="font-bold text-[15px] text-green-text">
              १००% स्थानीय डाटा स्वामित्व (100% Offline & Private)
            </h4>
            <p className="text-[13px] text-muted-foreground mt-1">
              तपाईंको पसलको सम्पूर्ण हिसाब, ग्राहकको उधारो, बिक्री रेकर्ड, र नाफा विवरण तपाईंको आफ्नै मोबाइल वा कम्प्युटरमा सुरक्षित रूपमा स्टोर हुन्छ। सजिलो पसलले तपाईंको ग्राहक वा बिक्री डाटा तेस्रो पक्षलाई बेच्ने वा शेयर गर्ने कार्य गर्दैन।
            </p>
          </div>
        </div>

        {/* 2. Tax & PAN Responsibility */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border/60 flex gap-3 items-start">
          <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[15px] text-foreground">
              कर तथा प्यान (Tax & PAN Compliance)
            </h4>
            <p className="text-[13px] text-muted-foreground mt-1">
              सजिलो पसल आन्तरिक हिसाब किताब र ग्राहक खाता व्यवस्थापनको लागि निर्मित डिजिटल औजार हो। नेपाल सरकारको आन्तरिक राजस्व विभाग (IRD) को नियम अनुसार आफ्नो पसलको आधिकारिक कर दाखिला र लेखा परीक्षण गर्ने पूर्ण जिम्मेवारी सम्बन्धित पसल धनीकै रहनेछ।
            </p>
          </div>
        </div>

        {/* 3. WhatsApp Communication Liability */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border/60 flex gap-3 items-start">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-amber-text" />
          <div>
            <h4 className="font-bold text-[15px] text-foreground">
              WhatsApp तथा भुक्तानी सम्झौता
            </h4>
            <p className="text-[13px] text-muted-foreground mt-1">
              WhatsApp मार्फत रसिद र उधारो ताकेता पठाउँदा तपाईंको व्यक्तिगत खाताबाट सिधै सन्देश जान्छ। ग्राहकसँगको उधारो भुक्तानी सम्झौता र लेनदेन पसल धनी र ग्राहक बीचको आपसी विश्वासमा आधारित हुन्छ।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-13 rounded-md bg-primary text-primary-foreground font-extrabold text-base shadow-lg flex items-center justify-center gap-2 ios-press"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>मैले बुझेँ (Accept & Close)</span>
        </button>
      </div>
    </IosBottomSheet>
  );
}

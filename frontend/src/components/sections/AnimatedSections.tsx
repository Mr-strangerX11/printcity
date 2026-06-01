'use client';

import dynamic from 'next/dynamic';

// ssr:false is only valid inside Client Components — this wrapper lets
// the Server Component home page consume these framer-motion sections
// without triggering the React 19 hydration mismatch (error #418).

const SocialProofCounter   = dynamic(() => import('./SocialProofCounter'),   { ssr: false });
const LoyaltyRewardsSection = dynamic(() => import('./LoyaltyRewardsSection'), { ssr: false });
const ComparisonTable       = dynamic(() => import('./ComparisonTable'),       { ssr: false });
const VendorSuccessStories  = dynamic(() => import('./VendorSuccessStories'),  { ssr: false });
const QuickFAQ              = dynamic(() => import('./QuickFAQ'),              { ssr: false });

export {
  SocialProofCounter,
  LoyaltyRewardsSection,
  ComparisonTable,
  VendorSuccessStories,
  QuickFAQ,
};

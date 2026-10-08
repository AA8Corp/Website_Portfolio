type PremiumBadgeProps = { className?: string };

/** Small marker used in each site footer so it's clear these are the premium builds. */
export const PremiumBadge = ({ className }: PremiumBadgeProps) => (
  <span className={className}>Premium build: React, Three.js, Vite</span>
);

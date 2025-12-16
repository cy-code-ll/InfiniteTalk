'use client';

import React, { Suspense } from 'react';
import { ChristmasHeroMobile } from './ChristmasHeroMobile';
import { ChristmasHeroDesktop } from './ChristmasHeroDesktop';

function ChristmasHeroContent() {
  return (
    <>
      {/* Mobile: visible on small screens, hidden on medium and larger screens */}
      <div className="block md:hidden">
        <ChristmasHeroMobile />
      </div>
      
      {/* Desktop: hidden on small screens, visible on medium and larger screens */}
      <div className="hidden md:block h-full">
        <ChristmasHeroDesktop />
      </div>
    </>
  );
}

export function ChristmasHero() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
      <ChristmasHeroContent />
    </Suspense>
  );
}


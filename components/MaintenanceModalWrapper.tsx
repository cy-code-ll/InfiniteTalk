'use client';

import dynamic from 'next/dynamic';

// Dynamically import MaintenanceModal (client component only)
const MaintenanceModal = dynamic(() => import('@/components/MaintenanceModal').then(mod => ({ default: mod.MaintenanceModal })), {
  ssr: false,
});

export function MaintenanceModalWrapper() {
  return <MaintenanceModal />;
}


'use client';

import dynamic from 'next/dynamic';

// Dynamically import MaintenanceModal (client component only)
const MaintenanceModal = dynamic(() => import('@/components/Maintenance/MaintenanceModal').then(mod => ({ default: mod.MaintenanceModal })), {
  ssr: false,
});

export function MaintenanceModalWrapper() {
  return <MaintenanceModal />;
}


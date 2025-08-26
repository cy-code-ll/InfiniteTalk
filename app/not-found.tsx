'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
      <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md">
        Oops! The page you're looking for doesn't seem to exist.
      </p>
      <Button asChild size="lg">
        <Link href="/">
          Go Back Home
        </Link>
      </Button>
    </div>
  );
} 
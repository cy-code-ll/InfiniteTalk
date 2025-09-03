import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script';
import PaymentStatusModal from '@/components/payment-status-modal';
import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import ClerkProviderWithLocale from '@/components/auth/clerk-provider';
import { ToastProvider } from '@/components/ui/toast-provider';
import { UserProvider } from '@/lib/providers';
import { metadata, schemaData } from '@/lib/seo-config';

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const GA_TRACKING_ID = 'G-BST9KGD31X';

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <ClerkProviderWithLocale>
          <ToastProvider>
            <UserProvider>
              <>
                <Navbar />
                <main className="min-h-[calc(100vh-80px)]">
                  {children}
                </main>
              </>
              <Suspense fallback={null}>
                <PaymentStatusModal />
              </Suspense>
            </UserProvider>
          </ToastProvider>
        </ClerkProviderWithLocale>
        <Script
          id="analytics"
          strategy="lazyOnload"
          src="/js/cy1.js"
        />

      </body>
    </html>
  )
}

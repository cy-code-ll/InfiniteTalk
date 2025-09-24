import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script';
import PaymentStatusModal from '@/components/payment-status-modal';
import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/components/ui/toast-provider';
import { UserProvider } from '@/lib/providers';
import { metadata, schemaData } from '@/lib/seo-config';
import dynamic from 'next/dynamic';

// 动态导入 Clerk Provider 以减少初始包大小
const ClerkProviderWithLocale = dynamic(() => import('@/components/auth/clerk-provider'), {
  ssr: true, // 保持 SSR 以确保认证状态正确
  loading: () => <div className="min-h-screen" />,
});

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const GA_TRACKING_ID = 'G-BST9KGD31X';

  return (
    <html lang="en">
      <head>
        {/* Preconnect & DNS Prefetch for analytics domain */}
        <link rel="preconnect" href="https://v1.cnzz.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://v1.cnzz.com" />
        <link rel="preconnect" href="https://c.cnzz.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://c.cnzz.com" />
      </head>
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
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* CNZZ init */}
            <Script id="cnzz-init" strategy="afterInteractive">
              {`var _czc = _czc || [];`}
            </Script>
            {/* CNZZ scripts - async after interactive */}
            <Script
              id="cnzz-1"
              strategy="afterInteractive"
              src="https://v1.cnzz.com/z.js?id=1281417985&async=1"
            />
            <Script
              id="cnzz-2"
              strategy="afterInteractive"
              src="https://v1.cnzz.com/z.js?id=1281431393&async=1"
            />
          </>
        )}

      </body>
    </html>
  )
}

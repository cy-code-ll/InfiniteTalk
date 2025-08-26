import './globals.css'
import { Inter, Playfair_Display, Poppins, Nunito, Baloo_2 } from 'next/font/google';
import type { Metadata } from 'next'
import Script from 'next/script';
import PaymentStatusModal from '@/components/payment-status-modal';
import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import ClerkProviderWithLocale from '@/components/auth/clerk-provider';
import { ToastProvider } from '@/components/ui/toast-provider';
import { UserProvider } from '@/lib/providers';
import { metadata, schemaData } from '@/lib/seo-config';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const poppins = Poppins({ subsets: ['latin'], variable: '--font-poppins', weight: ['300', '400', '500', '600', '700'] });
const baloo = Baloo_2({ subsets: ['latin'], variable: '--font-baloo', weight: ['400', '500', '600', '700', '800'] });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', weight: ['200', '300', '400', '500', '600', '700', '800', '900'] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const GA_TRACKING_ID = 'G-BST9KGD31X';

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${poppins.variable} ${baloo.variable} ${nunito.variable} bg-background text-foreground`}>
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
          strategy="afterInteractive"
          src="/js/cy1.js"
        />

      </body>
    </html>
  )
}

import './globals.css'
import Script from 'next/script';
import { Navbar } from '@/components/Navbar';
import { MaintenanceBanner } from '@/components/MaintenanceBanner';
import { MaintenanceModalWrapper } from '@/components/MaintenanceModalWrapper';
import { MaintenanceBannerProvider } from '@/components/MaintenanceBannerContext';
import { AdBanner } from '@/components/AdBanner';
import { AdBannerProvider } from '@/components/AdBannerContext';
import { ToastProvider } from '@/components/ui/toast-provider';
import { UserProvider } from '@/lib/providers';
import { metadata, schemaData } from '@/lib/seo-config';
import dynamic from 'next/dynamic';
import { Poppins, Mountains_of_Christmas } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthModalProvider } from '@/components/auth/auth-modal-provider';

// Optimized font loading - only load primary font
// Poppins is the core brand font used 25+ times across the site
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// Christmas section decorative font
const mountainsOfChristmas = Mountains_of_Christmas({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mountains-of-christmas',
  display: 'swap',
});

// Dynamically import Clerk Provider to reduce initial bundle size
const ClerkProviderWithLocale = dynamic(() => import('@/components/auth/clerk-provider'), {
  ssr: true,
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
    <html lang="en" className={`${poppins.variable} ${mountainsOfChristmas.variable}`}>
      <head>
        {/* Critical CSS - Inlined for instant render (Complete CSS Variables) */}
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --radius: 0.625rem;
            --background: #000000;
            --foreground: #FFFFFF;
            --card: #111111;
            --card-foreground: #FFFFFF;
            --popover: #111111;
            --popover-foreground: #FFFFFF;
            --primary: #D4AF37;
            --primary-foreground: #000000;
            --secondary: #1A1A1A;
            --secondary-foreground: #FFFFFF;
            --muted: #333333;
            --muted-foreground: #CCCCCC;
            --accent: #1A1A1A;
            --accent-foreground: #FFFFFF;
            --destructive: #E63946;
            --border: #333333;
            --input: #333333;
            --ring: #D4AF37;
            --info: #2196F3;
            --success: #4CAF50;
            --warning: #FFC107;
            --chart-1: #D4AF37;
            --chart-2: #B8860B;
            --chart-3: #FFD700;
            --chart-4: #F4A460;
            --chart-5: #DAA520;
            --sidebar: #111111;
            --sidebar-foreground: #FFFFFF;
            --sidebar-primary: #D4AF37;
            --sidebar-primary-foreground: #000000;
            --sidebar-accent: #1A1A1A;
            --sidebar-accent-foreground: #FFFFFF;
            --sidebar-border: #333333;
            --sidebar-ring: #D4AF37;
          }
          html {
            scroll-behavior: smooth;
            overflow-x: hidden;
          }
          body {
            background-color: var(--background);
            color: var(--foreground);
            font-family: var(--font-poppins), system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
          .font-poppins {
            font-family: var(--font-poppins), system-ui, -apple-system, sans-serif;
          }
        `}} />
        {/* Preconnect & DNS Prefetch for analytics domain */}
        <link rel="preconnect" href="https://v1.cnzz.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://v1.cnzz.com" />
        <link rel="preconnect" href="https://c.cnzz.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://c.cnzz.com" />
        {/* Preconnect to Clerk domain for faster authentication */}
        <link rel="preconnect" href="https://clerk.infinitetalk.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://clerk.infinitetalk.net" />
        {/* Non-critical CSS will be loaded by Next.js automatically */}
        {/* Critical styles are inlined above for instant render */}
      </head>
      <body className="bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <ClerkProviderWithLocale>
          <ToastProvider>
            <UserProvider>
              <AuthModalProvider>
                <AdBannerProvider>
                  <MaintenanceBannerProvider>
                    <AdBanner />
                    <MaintenanceBanner />
                    <Navbar />
                    <MaintenanceModalWrapper />
                    <main>
                      {children}
                    </main>
                  </MaintenanceBannerProvider>
                </AdBannerProvider>
              </AuthModalProvider>
            </UserProvider>
          </ToastProvider>
        </ClerkProviderWithLocale>

        {/* CNZZ init - optimized with lazyOnload */}
        <Script id="cnzz-init" strategy="lazyOnload">
          {`var _czc = _czc || []; _czc.push(["_setAccount", 1281431393]);`}
        </Script>
        {/* CNZZ scripts - lazy load on idle */}
        <Script
          id="cnzz-1"
          strategy="lazyOnload"
          src="https://v1.cnzz.com/z.js?id=1281417985&async=1"
        />
        <Script
          id="cnzz-2"
          strategy="lazyOnload"
          src="https://v1.cnzz.com/z.js?id=1281431393&async=1"
        />

        <SpeedInsights />

      </body>
    </html>
  )
}

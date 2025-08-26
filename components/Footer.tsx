'use client';

import Link from 'next/link';
import { FriendLink } from '../lib/server-api';

interface FooterProps {
  friendlyLinks?: FriendLink[];
}

export function Footer({ friendlyLinks = [] }: FooterProps) {
  return (
    <footer className="bg-white border-t border-muted py-12">
      <div className="container mx-auto px-6">
        {/* Partner Sites - Only show if there are links */}
        {friendlyLinks && friendlyLinks.length > 0 && (
          <div className="mb-10 pb-6 border-b border-muted">
            <h3 className="font-semibold text-base text-foreground mb-4">
              PartnerSites
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {friendlyLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-xs hover:underline decoration-primary decoration-1 underline-offset-2"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Copyright */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="font-fredoka text-xl font-bold text-primary">
                QuickMedCert
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              © 2023 QuickMedCert. All rights reserved.
            </p>
            <div className="mt-4">
              <a 
                href="mailto:support@quickmedcert.com" 
                className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@quickmedcert.com
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
} 
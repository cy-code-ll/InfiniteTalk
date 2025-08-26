'use client';

import { Footer } from '../../components/Footer';
import { useState } from 'react';

export default function TermsOfServicePage() {
  // 定义静态内容
  const termsContent = {
    title: "Terms of Service",
    effectiveDate: "Effective Date: January 1, 2023",
    introduction: "Please read these Terms of Service carefully before using the PolaToons service. By accessing or using our service, you agree to be bound by these terms.",
    sections: [
      {
        title: "Acceptance of Terms",
        content: "By accessing or using our service, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the terms, you may not access the service."
      },
      {
        title: "Changes to Terms",
        content: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion."
      },
      {
        title: "Use of Service",
        content: "PolaToons provides an AI-powered image transformation service. You may use our service only as permitted by law and these Terms. You agree not to misuse our service or help anyone else to do so."
      },
      {
        title: "User Content",
        content: "Our service allows you to upload, submit, store, and share content. You retain all rights to your content, but you grant us a license to use, host, store, reproduce, modify, and distribute your content solely for the purpose of providing and improving the service. You are responsible for any content you upload and must have the necessary rights to share that content."
      },
      {
        title: "Disclaimers",
        content: "Our service is provided on an 'AS IS' and 'AS AVAILABLE' basis. We expressly disclaim all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement."
      },
      {
        title: "Limitation of Liability",
        content: "In no event shall PolaToons, its directors, employees, or agents be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service."
      },
      {
        title: "General",
        content: "These Terms constitute the entire agreement between you and PolaToons regarding our service and supersede any prior agreements. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights."
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-xl lg:prose-2xl max-w-none dark:prose-invert bg-white p-8 md:p-12 rounded-2xl shadow-custom">
            <h1 className="text-center font-fredoka font-bold text-primary text-3xl md:text-4xl mb-4">{termsContent.title}</h1>
            <p className="text-center text-base text-muted-foreground mb-10">{termsContent.effectiveDate}</p>
            <p className="lead text-lg md:text-xl mb-8">{termsContent.introduction}</p>

            {termsContent.sections.map((section, index) => (
              <section key={index} className="mt-10">
                <h2 className="font-baloo font-semibold text-2xl md:text-3xl">{`${index + 1}. ${section.title}`}</h2>
                <div className="text-base md:text-lg text-muted-foreground space-y-4">
                  {section.content.split('\n').map((paragraph, pIndex) => (
                    paragraph.trim() && <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
} 
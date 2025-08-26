'use client';

import { Footer } from '../../components/Footer';

export default function PrivacyPolicyPage() {
  // 定义静态内容
  const privacyContent = {
    title: "Privacy Policy",
    effectiveDate: "Effective Date: January 1, 2023",
    introduction: "At PolaToons, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your information when you use our services.",
    sections: [
      {
        title: "Information We Collect",
        content: "We may collect personal information that you provide directly to us when you register for an account, subscribe to our services, or contact our customer support. This information may include your name, email address, profile picture, and payment information."
      },
      {
        title: "Information We Collect Automatically",
        content: "When you access or use our services, we automatically collect certain information about your device and usage of our services. This includes your IP address, browser type, operating system, referring URLs, and information about how you interact with our website."
      },
      {
        title: "Cookies and Similar Technologies",
        content: "We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."
      },
      {
        title: "Payment Information",
        content: "When you make a purchase through our service, your payment information is processed by our third-party payment processors. We do not store your full credit card details on our servers."
      },
      {
        title: "Information We Do Not Collect",
        content: "We do not intentionally collect sensitive personal information, such as social security numbers, genetic data, health information, or religious information. We do not collect information from children under the age of 13."
      },
      {
        title: "How We Use Your Information",
        content: "We use the information we collect to provide, maintain, and improve our services. This includes personalizing your experience, processing your transactions, sending communications about your account or our services, and analyzing usage patterns."
      },
      {
        title: "Data Security",
        content: "We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
      },
      {
        title: "Changes to This Policy",
        content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date. You are advised to review this Privacy Policy periodically for any changes."
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-xl lg:prose-2xl max-w-none dark:prose-invert bg-white p-8 md:p-12 rounded-2xl shadow-custom">
            <h1 className="text-center font-fredoka font-bold text-primary text-3xl md:text-4xl mb-4">{privacyContent.title}</h1>
            <p className="text-center text-base text-muted-foreground mb-10">{privacyContent.effectiveDate}</p>
            <p className="lead text-lg md:text-xl mb-8">{privacyContent.introduction}</p>
            
            {privacyContent.sections.map((section, index) => (
              <section key={index} className="mt-10">
                <h2 className="font-baloo font-semibold text-2xl md:text-3xl">{section.title}</h2>
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
'use client';

import { Button } from '../../components/ui/button';
import { Check, Loader2, DollarSign, Shield, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import Link from 'next/link';

// Define Plan structure
interface PricingPlan {
  key: string;
  priceId: string;
  popular: boolean;
  title: string;
  price: string;
  priceAmount: number;
  credits: number;
  creditsPerDollar: string;
  features: string[];
  buttonText: string;
}

export default function CustomPricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();
  const { openAuthModal } = useAuthModal();

  // Common features for all plans
  const commonFeatures = [
    'HD video generation',
    'Lip-sync & body animation',
    'Download enabled',
    'Commercial use license',
    'Priority support',
    'Best value per credit',
    'Bulk processing'
  ];

  // Define custom pricing plans
  const customPricingPlans: PricingPlan[] = [
    {
      key: 'custom-1',
      priceId: 'price_1Sfymi2LCxiz8WFQxvRZ7TsL', // TODO: Add actual price ID
      popular: false,
      title: 'Custom Plan 1',
      price: '$1,998',
      priceAmount: 1998,
      credits: 44000,
      creditsPerDollar: '$0.045',
      buttonText: 'Get 44,000 Credits',
      features: [
        '44,000 Credits included',
        '$0.045 per credit',
        ...commonFeatures
      ]
    },
    {
      key: 'custom-2',
      priceId: 'price_1Sfyn32LCxiz8WFQajnXflvV', // TODO: Add actual price ID
      popular: true,
      title: 'Custom Plan 2',
      price: '$2,997',
      priceAmount: 2997,
      credits: 66000,
      creditsPerDollar: '$0.045',
      buttonText: 'Get 66,000 Credits',
      features: [
        '66,000 Credits included',
        '$0.045 per credit',
        ...commonFeatures
      ]
    },
    {
      key: 'custom-3',
      priceId: 'price_1SfynG2LCxiz8WFQ9jsIneTa', // TODO: Add actual price ID
      popular: false,
      title: 'Custom Plan 3',
      price: '$4,995',
      priceAmount: 4995,
      credits: 110000,
      creditsPerDollar: '$0.045',
      buttonText: 'Get 110,000 Credits',
      features: [
        '110,000 Credits included',
        '$0.045 per credit',
        ...commonFeatures
      ]
    }
  ];

  // Handle upgrade button click
  const handleUpgradeClick = async (priceId: string, planKey: string) => {
    // 1. Check if user is signed in
    if (!isSignedIn) {
      requestAnimationFrame(() => openAuthModal('signin'));
      return;
    }

    // 2. Get user ID
    const userId = user?.id;
    if (!userId) {
      console.error("User is signed in but user ID is missing.");
      alert('Could not get user information. Please try refreshing the page.');
      return;
    }

    // 3. Cache payment info to local storage
    const selectedPlan = customPricingPlans.find(plan => plan.key === planKey);
    if (selectedPlan) {
      localStorage.setItem('selectedPlan', JSON.stringify({
        key: selectedPlan.key,
        title: selectedPlan.title,
        price: selectedPlan.price,
        features: selectedPlan.features,
        credits: selectedPlan.credits,
        timestamp: Date.now()
      }));
      
      // CNZZ event tracking - click purchase credits
      if (typeof window !== 'undefined' && (window as any)._czc) {
        const trackData = ['_trackEvent', 'User Action', 'Purchase Credit Package', 'Custom Package', selectedPlan.priceAmount, ''];
        (window as any)._czc.push(trackData);
        console.log('✅ CNZZ event tracking success:', {
          eventCategory: 'User Action',
          eventAction: 'Purchase Credit Package',
          packageType: 'Custom Package',
          price: selectedPlan.priceAmount,
          packageName: selectedPlan.title,
          fullData: trackData
        });
      } else {
        console.warn('⚠️ CNZZ not initialized, cannot track event');
      }
    }

    // Check if priceId is provided
    if (!priceId) {
      alert('Payment configuration is not available. Please contact support.');
      return;
    }

    setLoadingPlan(planKey);
    try {
      const data = await api.payment.createPaypalSession(priceId);

      const checkoutUrl = data?.data?.url || data?.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        console.error('Payment session response missing URL:', data);
        alert('Checkout URL is missing. Please try again later.');
        setLoadingPlan(null);
      }

    } catch (error) {
      console.error('Error during payment session creation request:', error);
      if (error instanceof Error) {
        alert(error.message || 'An error occurred. Please try again later.');
      } else {
        alert('Network error. Please check your connection and try again.');
      }
      setLoadingPlan(null);
    } 
  };

  return (
    <section id="custom-pricing" className="py-24 px-4 bg-gradient-to-b from-slate-950/50 to-slate-900/30">
      <div className="max-w-7xl mx-auto">
        {/* SEO-optimized heading */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            InfiniteTalk AI Custom Pricing
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
            Enterprise-level credit packages with the best value per credit. Perfect for bulk processing and large-scale video generation.
          </p>
        </div>

        {/* Custom pricing plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {customPricingPlans.map((plan) => {
            return (
              <div
                key={plan.key}
                className={cn(
                  'relative p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105',
                  plan.popular 
                    ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-primary/50 shadow-2xl shadow-primary/20' 
                    : 'bg-gradient-to-b from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-slate-600/50'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                  {plan.title}
                </h2>
      
                <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                </div>

                <div className="text-center mb-8">
                  <div className="text-2xl font-semibold text-primary mb-2">
                    {plan.credits.toLocaleString()} Credits
                  </div>
                  <div className="text-sm text-slate-400">
                    {plan.creditsPerDollar} per credit
                  </div>
                </div>

                <Button 
                  className={cn(
                    'w-full mb-8 py-3 font-semibold transition-all duration-200',
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl'
                      : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500'
                  )}
                  onClick={() => handleUpgradeClick(plan.priceId, plan.key)}
                  disabled={loadingPlan === plan.key || !plan.priceId}
                >
                  {loadingPlan === plan.key 
                    ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </span>
                      )
                    : plan.buttonText
                  }
                </Button>

                <div className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className={cn(
                          'w-5 h-5 mt-0.5 flex-shrink-0',
                          plan.popular ? 'text-primary' : 'text-slate-400'
                        )} />
                        <span className="text-slate-300 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 mb-12">
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {/* 7-Day Refund Guarantee */}
            <Link href="/refund" aria-label="Refund Policy" className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl backdrop-blur-sm hover:border-green-400/40 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">7‑Day Refund</div>
                <div className="text-slate-400 text-sm">Money-back guarantee</div>
              </div>
            </Link>

            {/* Secure Payment by Stripe */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Secure Payment</div>
                <div className="text-slate-400 text-sm">Powered by Stripe</div>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">24/7 Support</div>
                <div className="text-slate-400 text-sm">Always here to help</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional pricing info */}
        <div className="mt-8 text-center">
          <p className="text-white mb-4">
            Enterprise credit packages • Best value per credit • Bulk processing available
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 text-white">
            <span>✓ Large credit packages</span>
            <span>✓ Credits never expire</span>
            <span>✓ Secure payments</span>
            <span>✓ Priority support</span>
            <span>✓ Bulk processing</span>
          </div>
        </div>
      </div>
    </section>
  );
}


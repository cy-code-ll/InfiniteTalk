'use client';

import { Button } from './ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// 定义 Plan 结构
interface PricingPlan {
  key: string;
  priceId: string;
  popular: boolean;
  title: string;
  price: string;
  features: string[];
  buttonText: string;
}

export default function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  // 定义固定的价格计划数据
  const pricingPlans: PricingPlan[] = [
    {
      key: 'free',
      priceId: '', // Free 计划不可购买，Price ID 为空
      popular: false,
      title: 'Free',
      price: '$0',
      buttonText: 'Try for Free',
      features: [
        'Generate 2 AI total',
        'Standard generation speed',
        'Download enabled'
      ]
    },
    {
      key: 'premium',
      priceId: 'price_1RRSlvBTlYgHUE88w1CCLNmM', 
      popular: true,
      title: 'Premium',
      price: '$1',
      buttonText: 'Upgrade Plan',
      features: [
        'Generate 5 AI total',
        'Medical Certificate Download enabled',
        'Faster AI generation',
        'Commercial use',
        'Remove watermark'
      ]
    },
    {
      key: 'ultimate',
      priceId: 'price_1RRSmiBTlYgHUE88ptTMrxKj', 
      popular: false,
      title: 'Ultimate',
      price: '$10',
      buttonText: 'Upgrade Plan',
      features: [
        'Generate 500 images per month',
        'Everything in Premium',
        'Priority support',
        'Early access to new features'
      ]
    }
  ];

  // 处理点击升级按钮的异步函数
  const handleUpgradeClick = async (priceId: string, planKey: string) => {
    // 1. 检查用户是否登录
    if (!isSignedIn) {
      // 如果未登录，打开 Clerk 登录框
      openSignIn();
      return; // 阻止后续操作
    }

    // 2. 获取用户 ID (确保用户存在且有 ID)
    const userId = user?.id;
    if (!userId) {
      console.error("User is signed in but user ID is missing.");
      // 可以选择提示用户或记录错误
      alert('Could not get user information. Please try refreshing the page.');
      return;
    }

    setLoadingPlan(planKey); // 设置当前加载的计划
    try {
      const data = await api.payment.createPaypalSession(priceId);

      // 检查返回的数据结构是否符合预期
      const checkoutUrl = data?.data?.url || data?.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        console.error('Stripe subscription response missing URL:', data);
        alert('Checkout URL is missing. Please try again later.');
        setLoadingPlan(null);
      }

    } catch (error) {
      console.error('Error during subscription creation request:', error);
      if (error instanceof Error) {
        alert(error.message || 'An error occurred. Please try again later.');
      } else {
        alert('Network error. Please check your connection and try again.');
      }
      setLoadingPlan(null);
    } 
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <h2 className="pricing-title">
          Choose Your Perfect Plan
        </h2>
        <p className="pricing-subtitle">
          All plans include HD image download and fast AI generation.
        </p>

        <div className="pricing-grid">
            {pricingPlans.map((plan) => {
              const isFree = plan.key === 'free';

              return (
                <div
                  key={plan.key}
                  className={cn(
                    'pricing-card',
                    plan.popular ? 'pricing-card-popular' : 'pricing-card-regular'
                  )}
                >
                  {plan.popular && (
                    <div className="pricing-badge">
                      Most Popular
                    </div>
                  )}

                  <h3 className="pricing-card-title">
                    {plan.title}
                  </h3>
      
                  <div className="pricing-card-price">
                    <span className="pricing-price-value">
                      {plan.price}
                    </span>
                    {!isFree && (<span className="pricing-price-period">/month</span>)}
                  </div>

                  <Button 
                    className={cn(
                      'w-full mb-6',
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : isFree
                          ? 'bg-muted text-muted-foreground hover:bg-muted/90'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                    )}
                    onClick={() => !isFree && handleUpgradeClick(plan.priceId, plan.key)}
                    disabled={loadingPlan === plan.key}
                  >
                    {loadingPlan === plan.key 
                      ? 'Processing...'
                      : plan.buttonText
                    }
                  </Button>

                  <div className="pricing-features">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="pricing-feature-item">
                          <Check className={cn(
                            'pricing-feature-icon',
                            plan.popular ? 'text-primary' : 'text-muted-foreground'
                          )} />
                          <span className="pricing-feature-text">
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
      </div>
    </section>
  );
} 
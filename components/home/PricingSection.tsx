'use client';

import { Button } from '../ui/button';
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
      priceId: 'price_1S0bzJ2LCxiz8WFQshNuYpsJ',
      popular: false,
      title: 'Starter',
      price: '$9.90',
      buttonText: 'Get 100 Credits',
      features: [
        '100 Credits included',
        'HD video generation (480p/720p)',
        'Lip-sync & body animation',
        'Download enabled',
        'Email support'
      ]
    },
    {
      key: 'premium',
      priceId: 'price_1S0bze2LCxiz8WFQJBMjVxi0', 
      popular: true,
      title: 'Pro',
      price: '$29.90',
      buttonText: 'Get 330 Credits',
      features: [
        '330 Credits included',
        'HD video generation (480p/720p)',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support'
      ]
    },
    {
      key: 'ultimate',
      priceId: 'price_1S0bzt2LCxiz8WFQXQ5Foe8K', 
      popular: false,
      title: 'Ultimate',
      price: '$49.90',
      buttonText: 'Get 550 Credits',
      features: [
        '550 Credits included',
        'HD video generation (480p/720p)',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support',
        'Best value per credit'
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
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-slate-950/50 to-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
          Choose Your Perfect Plan
        </h2>
        <p className="text-xl text-center text-slate-300 mb-12 max-w-2xl mx-auto">
          All plans include HD image download and fast AI generation.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => {
              const isFree = plan.key === 'free';

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

                  <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    {plan.title}
                  </h3>
      
                  <div className="text-center mb-8">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                
                  </div>

                  <Button 
                    className={cn(
                      'w-full mb-8 py-3 font-semibold transition-all duration-200',
                      plan.popular
                        ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl'
                        : isFree
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                          : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500'
                    )}
                    onClick={() => !isFree && handleUpgradeClick(plan.priceId, plan.key)}
                    disabled={loadingPlan === plan.key}
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
      </div>
    </section>
  );
} 
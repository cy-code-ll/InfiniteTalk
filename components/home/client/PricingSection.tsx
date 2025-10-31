'use client';

import { Button } from '@/components/ui/button';
import { Check, Loader2, DollarSign, Shield, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import Link from 'next/link';

// 定义 Plan 结构
interface PricingPlan {
  key: string;
  priceId: string;
  popular: boolean;
  title: string;
  price: string;
  priceAmount: number; // 数字类型的金额，用于统计
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
      key: 'Starter',
      priceId: 'price_1S0bzJ2LCxiz8WFQshNuYpsJ',
      popular: false,
      title: 'Starter',
      price: '$9.9',
      priceAmount: 9.9,
      buttonText: 'Get 90 Credits',
      features: [
        '90 Credits included',
        '$0.11 per credit',
        'HD video generation',
        'Lip-sync & body animation',
        'Download enabled',
        'Email support'
      ]
    },
    {
      key: 'premium',
      priceId: 'price_1S0bze2LCxiz8WFQJBMjVxi0', 
      popular: false,
      title: 'Pro',
      price: '$29.9',
      priceAmount: 29.9,
      buttonText: 'Get 400 Credits',
      features: [
        '400 Credits included',
        '$0.074 per credit',
        'HD video generation',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support'
      ]
    },
    {
      key: 'ultimate',
      priceId: 'price_1S0bzt2LCxiz8WFQXQ5Foe8K', 
      popular: true,
      title: 'Ultimate',
      price: '$49.9',
      priceAmount: 49.9,
      buttonText: 'Get 800 Credits',
      features: [
        '800 Credits included',
        '$0.062 per credit',
        'HD video generation',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support',
        'Best value per credit'
      ]
    },
    {
      key: 'enterprise',
      priceId: 'price_1S3sev2LCxiz8WFQana9TXxD', 
      popular: false,
      title: 'Enterprise',
      price: '$99.9',
      priceAmount: 99.9,
      buttonText: 'Get 1800 Credits',
      features: [
        '1800 Credits included',
        '$0.055 per credit',
        'HD video generation ',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support',
        'Best value per credit',
        'Bulk processing'
      ]
    }
  ];

  // 订阅计划（Subscription）
  const subscriptionPlans: PricingPlan[] = [
    {
      key: 'sub-starter',
      priceId: 'price_1SOBEv2LCxiz8WFQL3g9wyoE',
      popular: false,
      title: 'Starter',
      price: '$9.9',
      priceAmount: 9.9,
      buttonText: 'Subscribe 100 Credits',
      features: [
        '100 Credits included',
        '$0.099 per credit',
        'HD video generation',
        'Lip-sync & body animation',
        'Download enabled',
        'Email support'
      ]
    },
    {
      key: 'sub-pro',
      priceId: 'price_1SOBFm2LCxiz8WFQMOiwvH65',
      popular: false,
      title: 'Pro',
      price: '$29.9',
      priceAmount: 29.9,
      buttonText: 'Subscribe 480 Credits',
      features: [
        '480 Credits included',
        '$0.062 per credit',
        'HD video generation',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support'
      ]
    },
    {
      key: 'sub-ultimate',
      priceId: 'price_1SOBGA2LCxiz8WFQnTEEHxXH',
      popular: true,
      title: 'Ultimate',
      price: '$49.9',
      priceAmount: 49.9,
      buttonText: 'Subscribe 990 Credits',
      features: [
        '990 Credits included',
        '$0.050 per credit',
        'HD video generation',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support',
        'Best value per credit'
      ]
    },
    {
      key: 'sub-enterprise',
      priceId: 'price_1SOBGa2LCxiz8WFQllMRPdsp',
      popular: false,
      title: 'Enterprise',
      price: '$99.9',
      priceAmount: 99.9,
      buttonText: 'Subscribe 2200 Credits',
      features: [
        '2200 Credits included',
        '$0.045 per credit',
        'HD video generation ',
        'Lip-sync & body animation',
        'Download enabled',
        'Commercial use license',
        'Priority support',
        'Best value per credit',
        'Bulk processing'
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

    // 3. 缓存支付信息到本地存储
    const selectedPlan = [...pricingPlans, ...subscriptionPlans].find(plan => plan.key === planKey);
    if (selectedPlan) {
      const paymentInfo = {
        planKey: planKey,
        price: selectedPlan.price,
        credits: selectedPlan.buttonText.match(/\d+/)?.[0] || '0',
        planTitle: selectedPlan.title,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
      
      // CNZZ 事件追踪 - 点击购买积分
      if (typeof window !== 'undefined' && (window as any)._czc) {
        // 判断是一次性购买还是订阅
        const isSubscription = planKey.startsWith('sub-');
        const planType = isSubscription ? '订阅套餐' : '一次性套餐';
        const trackData = ['_trackEvent', '用户操作', '购买积分套餐', planType, selectedPlan.priceAmount, ''];
        (window as any)._czc.push(trackData);
        console.log('✅ CNZZ 事件追踪成功:', {
          事件类别: '用户操作',
          事件动作: '购买积分套餐',
          套餐类型: planType,
          价格: selectedPlan.priceAmount,
          套餐名称: selectedPlan.title,
          完整数据: trackData
        });
      } else {
        console.warn('⚠️ CNZZ 未初始化，无法追踪事件');
      }
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

        {/* One-time purchase plans */}
        <div className="text-white text-xl font-semibold mb-6">One-time Credits</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-8xl mx-auto mb-16">
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

          {/* Subscription plans */}
          <div className="text-white text-xl font-semibold mb-6">Subscription Plans</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-8xl mx-auto">
            {subscriptionPlans.map((plan) => {
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
                        : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500'
                    )}
                    onClick={() => handleUpgradeClick(plan.priceId, plan.key)}
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
      </div>
    </section>
  );
} 
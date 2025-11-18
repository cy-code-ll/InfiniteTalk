'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, FileText, Zap, Film, Mail, Mic, Video, Headphones } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useUserInfo } from '@/lib/providers';

// 扩展Window接口以支持gtag
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

// 从URL参数获取transaction_id
const getTransactionIdFromUrl = (searchParams: URLSearchParams) => {
  return searchParams.get('token') || '';
};

// 格式化显示Order ID，只显示前几位和后几位
const formatOrderId = (orderId: string) => {
  if (!orderId || orderId.length <= 20) {
    return orderId;
  }
  return `${orderId.substring(0, 8)}...${orderId.substring(orderId.length - 8)}`;
};

// 发送gtag转化事件
const sendGtagConversion = (email: string, price: string, transactionId: string, retryCount: number = 0) => {
  if (typeof window === 'undefined') return;

  try {
    // 确保gtag已加载，最多重试3次
    if (!window.gtag) {
      if (retryCount < 3) {
        console.warn(`gtag not loaded yet, retrying... (${retryCount + 1}/3)`);
        setTimeout(() => sendGtagConversion(email, price, transactionId, retryCount + 1), 1000);
      } else {
        console.error('gtag failed to load after 3 retries');
      }
      return;
    }

    // 验证并转换价格为数字
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      console.error('Invalid price value:', price);
      return;
    }

    console.log('发送gtag转化事件:', { email, price: priceValue, transactionId });

    window.gtag('set', 'user_data', { "email": email });
    window.gtag('event', 'conversion', {
      'send_to': 'AW-16699731013/XdpwCNPxhoYbEMXYhps-',
      'value': parseFloat(price),
      'currency': 'USD',
      'transaction_id': transactionId
    });

    console.log('gtag转化事件发送成功');
  } catch (error) {
    console.error('发送gtag转化事件失败:', error);
  }
};

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [hasTrackedConversion, setHasTrackedConversion] = useState(false);
  const { userInfo } = useUserInfo();

  useEffect(() => {
    const statusParam = searchParams.get('status');
    setStatus(statusParam || '');

    // 获取选中的计划信息
    try {
      const planData = localStorage.getItem('selectedPlan');
      if (planData) {
        const plan = JSON.parse(planData);
        // 检查是否是最近的购买（24小时内）
        const isRecent = Date.now() - plan.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent) {
          setSelectedPlan(plan);

          // 如果支付成功，发送gtag转化事件（只发送一次）
          if (statusParam === 'success' && userInfo?.email && !hasTrackedConversion) {
            // 提取价格数字
            const priceMatch = plan.price.match(/[\d.]+/);
            const price = priceMatch ? priceMatch[0] : '0';

            // 从URL参数获取transaction_id
            const transactionId = getTransactionIdFromUrl(searchParams);

            // 发送gtag转化事件
            // sendGtagConversion(userInfo.email, price, transactionId);

            // 标记已发送，防止重复发送
            // setHasTrackedConversion(true);
          }

          // 如果支付成功，清理localStorage中的计划数据（避免重复显示）
          if (statusParam === 'success') {
            setTimeout(() => {
              localStorage.removeItem('selectedPlan');
            }, 5000); // 5秒后清理，确保用户看到了权益信息
          }
        }
      }
    } catch (error) {
      console.error('Error parsing selected plan:', error);
    }
  }, [searchParams, userInfo, hasTrackedConversion]);

  const isSuccess = status === 'success';
  const isFailure = status === 'failed';

  const features = [
    {
      icon: Mic,
      title: "Sparse-Frame Dubbing Technology",
      description: "InfiniteTalk AI drives not only lip movements but also subtle head tilts, posture shifts, and facial expressions for a human-like experience that goes beyond traditional lip-sync."
    },
    {
      icon: Zap,
      title: "Unlimited Duration Video Generation",
      description: "Remove short-clip limits. Create lectures, podcasts, and full presentations without interruption. InfiniteTalk AI supports unlimited-length generation for long-form content."
    },
    {
      icon: Video,
      title: "Precision Lip Alignment",
      description: "Professional-grade audio-to-visual alignment ensures lip movements match speech precisely. InfiniteTalk AI delivers superior lip precision for natural-looking results."
    },
    {
      icon: Headphones,
      title: "Multi-Speaker Capabilities",
      description: "With InfiniteTalk AI Multi, support multiple characters in one video—each with independent audio tracks and reference controls for complex multi-person scenarios."
    }
  ];

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 py-30 md:py-30">
      <div className="container mx-auto px-6">

        {/* Top Section - Payment Result */}
        <div className="text-center mb-16">
          <div className="max-w-5xl mx-auto">
            {isSuccess ? (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Payment Successful!
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    Thank you for choosing <Link href="/" className="text-primary hover:text-primary/80 font-semibold underline">InfiniteTalk</Link>! Your {selectedPlan?.title || 'plan'} is now active and ready to use.
                  </p>

                  {/* Order Summary and Plan Benefits Table-like Layout */}
                  {selectedPlan && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-8 max-w-5xl mx-auto shadow-lg">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Left Column - Order Summary */}
                        <div className="space-y-6">
                          <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-300 mb-6">Order Summary</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">Your Account:</span>
                              <span className="font-semibold text-gray-500 dark:text-gray-300">{userInfo?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">Plan:</span>
                              <span className="font-semibold text-gray-500 dark:text-gray-300">{selectedPlan.title}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">Amount:</span>
                              <span className="font-semibold text-gray-500 dark:text-gray-300">{selectedPlan.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">Credits:</span>
                              <span className="font-semibold text-gray-500 dark:text-gray-300">{selectedPlan.credits}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">Date:</span>
                              <span className="font-semibold text-gray-500 dark:text-gray-300">{new Date().toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">Order ID:</span>
                              <span className="font-semibold text-gray-500 dark:text-gray-300 text-right break-all max-w-xs">
                                {getTransactionIdFromUrl(searchParams) || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Plan Benefits */}
                        <div className="space-y-6">
                          <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-300 mb-6">Your Plan Benefits</h3>
                          <ul className="space-y-3">
                            {selectedPlan.features?.map((feature: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-500 dark:text-gray-300">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Need Help Section */}
                  <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 max-w-2xl mx-auto">
                    <div className="flex items-start gap-4">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-semibold mb-3 text-lg text-gray-800 dark:text-gray-200">Need help?</p>
                        <p className="mb-3 text-gray-700 dark:text-gray-300">Email us: <a href="mailto:support@infinitetalk.net" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline">support@infinitetalk.net</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : isFailure ? (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-16 h-16 text-red-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Payment Failed
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    Sorry, there was an issue with your payment
                  </p>

                  {/* Need Help Notice */}
                  <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-2xl mx-auto">
                    <div className="flex items-start gap-4">
                      <Mail className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                      <div className="text-left text-red-800 dark:text-red-200">
                        <p className="font-semibold mb-3 text-lg">Need Help?</p>
                        <p className="mb-3">If you encounter payment issues, please contact our support team:</p>
                        <a
                          href="mailto:support@infinitetalk.net"
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold underline text-lg"
                        >
                          support@infinitetalk.net
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Payment Result
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Please access this page through the correct link
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 max-w-md mx-auto">
          <Link href="/infinitetalk" className="flex-1">
            <Button className="w-full flex items-center justify-center gap-3 px-2 py-6 bg-primary text-white hover:bg-primary/90 rounded-full text-lg font-semibold">
              Start Creating Now
            </Button>
          </Link>
        </div>

        {/* Bottom Section - Features */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              InfiniteTalk Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover what you can create with our AI video generator and start your creative journey today
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card/90 backdrop-blur-md rounded-3xl p-10 lg:p-12 shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30 text-center"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-blue-100/50 dark:from-primary/20 dark:to-blue-900/20 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Start Creating?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your creativity into professional videos with our advanced AI technology
            </p>
            <Link href="/infinitetalk">
              <Button className="px-8 py-4 bg-primary text-white hover:bg-primary/90 rounded-full text-lg font-semibold">
                Start Creating Today
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function PaymentResultFallback() {
  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 py-8 md:py-16">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Loading Payment Result...
                </h1>
                <p className="text-xl text-muted-foreground">
                  Please wait while we process your payment information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultFallback />}>
      <PaymentResultContent />
    </Suspense>
  );
}


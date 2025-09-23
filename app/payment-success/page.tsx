'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { CheckCircle, CreditCard, Gift, Mail } from 'lucide-react';

interface PaymentInfo {
  planKey: string;
  price: string;
  credits: string;
  planTitle: string;
  timestamp: string;
}

export default function PaymentSuccessPage() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [orderToken, setOrderToken] = useState<string>('');

  useEffect(() => {
    // 从 URL 参数中获取 token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setOrderToken(token);
    }

    // 从本地存储中获取支付信息
    const storedPaymentInfo = localStorage.getItem('paymentInfo');
    if (storedPaymentInfo) {
      try {
        const parsedInfo = JSON.parse(storedPaymentInfo);
        setPaymentInfo(parsedInfo);
        // 清除本地存储的支付信息
        localStorage.removeItem('paymentInfo');
      } catch (error) {
        console.error('Error parsing payment info:', error);
      }
    }
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-slate-300">
            Thank you for your purchase. Your credits have been added to your account.
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Payment Details</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Payment Info */}
            <div className="space-y-4">
              {paymentInfo && (
                <>
                  <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-slate-400">Plan</div>
                      <div className="text-white font-semibold">{paymentInfo.planTitle}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-sm text-slate-400">Amount Paid</div>
                      <div className="text-white font-semibold text-xl">{paymentInfo.price}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                    <Gift className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-sm text-slate-400">Credits Received</div>
                      <div className="text-white font-semibold text-xl">{paymentInfo.credits} Credits</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Order Info */}
            <div className="space-y-4">
              {orderToken && (
                <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-sm text-slate-400">Order ID</div>
                    <div className="text-white font-mono text-sm break-all">{orderToken}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm text-slate-400">Support Email</div>
                  <div className="text-white font-semibold">support@infinitetalk.net</div>
                </div>
              </div>
              
              {paymentInfo && (
                <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Purchase Date</div>
                    <div className="text-white font-semibold">
                      {new Date(paymentInfo.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/infinitetalk">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 font-medium transition-colors">
              Start Creating Videos
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-8 py-3 font-medium transition-colors">
              View More Plans
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:support@infinitetalk.net" className="text-blue-400 hover:text-blue-300 underline">
              support@infinitetalk.net
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}



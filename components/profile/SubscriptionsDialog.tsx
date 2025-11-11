'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from '@radix-ui/react-icons';
import { api } from '@/lib/api';
import { SubscriptionItem } from './types';
import { formatTimestamp, formatPrice, dialogTable } from './utils';
import { useToast } from '@/components/ui/toast-provider';

interface SubscriptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionsDialog({ open, onOpenChange }: SubscriptionsDialogProps) {
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionItem[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState<number | null>(null);
  const toast = useToast();

  const fetchSubscriptions = async () => {
    setIsLoadingSubscriptions(true);
    setSubscriptionError(null);
    try {
      const result = await api.payment.getSubscriptions();

      if (result.code === 200 && Array.isArray(result.data)) {
        setSubscriptionList(result.data);
      } else {
        console.error("Failed to fetch subscriptions:", result.msg || 'Unknown API error');
        setSubscriptionList([]);
        setSubscriptionError(result.msg || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      setSubscriptionError(error instanceof Error ? error.message : 'An unknown error occurred fetching subscriptions');
      setSubscriptionList([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSubscriptions();
    }
  }, [open]);

  const handleCancelSubscription = async (subscriptionId: number) => {
    setCancellingSubscriptionId(subscriptionId);
    try {
      const result = await api.payment.cancelSubscription(subscriptionId);

      if (result.code === 200) {
        await fetchSubscriptions();
        toast.success('Subscription cancelled successfully!');
      } else {
        console.error("Failed to cancel subscription:", result.msg || 'Unknown API error');
        toast.error('Failed to cancel subscription: ' + (result.msg || 'Unknown error'));
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error('Failed to cancel subscription: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCancellingSubscriptionId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[85vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted/80 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted"
        style={{ 
          width: 'min(98vw, 1200px)',
          maxWidth: 'min(98vw, 1200px)',
          minWidth: '360px'
        }}
      >
        <DialogHeader className="text-center pb-6 border-b border-border">
          <DialogTitle className="text-2xl font-semibold text-card-foreground tracking-tight">Subscription Records</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Manage your active subscriptions
          </DialogDescription>
        </DialogHeader>
        <div className="pt-6">
          {isLoadingSubscriptions ? (
            <div className="text-center py-12">
              <ReloadIcon className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Loading...</p>
            </div>
          ) : subscriptionError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <p className="text-red-400 font-medium">Failed to load: {subscriptionError}</p>
            </div>
          ) : subscriptionList.length > 0 ? (
            <>
              {/* 移动端卡片布局 */}
              <div className="block sm:hidden space-y-3">
                {subscriptionList.map((subscription) => (
                  <div key={subscription.id} className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Plan</span>
                      <span className="text-sm text-card-foreground font-semibold">{subscription.price_info.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <span className={`${dialogTable.pillBase} bg-green-500/20 text-green-400 whitespace-nowrap`}>
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 inline-block"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Price</span>
                      <span className="text-sm text-card-foreground font-semibold">{formatPrice(subscription.price_info.price)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Limit</span>
                      <span className="text-sm text-card-foreground font-semibold">{subscription.price_info.usage_limit === 999999 ? '∞' : subscription.price_info.usage_limit}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant={subscription.price_info.button_text === 'Contact Sales' ? 'outline' : 'destructive'}
                        size="sm"
                        onClick={() => handleCancelSubscription(subscription.id)}
                        disabled={cancellingSubscriptionId === subscription.id || subscription.price_info.button_text === 'Contact Sales'}
                        className={`w-full h-9 text-sm ${subscription.price_info.button_text === 'Contact Sales' ? 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-60' : ''}`}
                      >
                        {cancellingSubscriptionId === subscription.id ? (
                          <>
                            <ReloadIcon className="h-3 w-3 animate-spin mr-1" />
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          subscription.price_info.button_text === 'Contact Sales' ? 'Contact Sales' : 'Cancel Subscription'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 桌面端表格布局 */}
              <div className="hidden sm:block">
                <div className={dialogTable.wrapper}>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/60">
                    <table className="w-full" style={{ minWidth: '800px' }}>
                      <thead>
                        <tr className="border-b border-border">
                          <th className={`${dialogTable.headCell} w-1/4 min-w-[140px]`}>Plan</th>
                          <th className={`${dialogTable.headCell} w-1/6 min-w-[100px]`}>Status</th>
                          <th className={`${dialogTable.headCell} w-1/6 min-w-[90px]`}>Price</th>
                          <th className={`${dialogTable.headCell} w-1/6 hidden lg:table-cell min-w-[100px]`}>ID</th>
                          <th className={`${dialogTable.headCell} w-1/6 hidden xl:table-cell min-w-[180px]`}>Started</th>
                          <th className={`${dialogTable.headCell} w-1/6 min-w-[80px]`}>Limit</th>
                          <th className={`${dialogTable.headCell} w-1/6 min-w-[100px]`}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptionList.map((subscription) => (
                          <tr key={subscription.id} className={dialogTable.row}>
                            <td className={`${dialogTable.cell} text-card-foreground font-medium min-w-[140px]`}>{subscription.price_info.name}</td>
                            <td className={`${dialogTable.cell} min-w-[100px]`}>
                              <span className={`${dialogTable.pillBase} bg-green-500/20 text-green-400 whitespace-nowrap`}>
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 inline-block"></div>
                                Active
                              </span>
                            </td>
                            <td className={`${dialogTable.cell} text-card-foreground font-semibold min-w-[90px] whitespace-nowrap`}>{formatPrice(subscription.price_info.price)}</td>
                            <td className={`${dialogTable.cell} ${dialogTable.mono} hidden lg:table-cell min-w-[100px]`}>{subscription.subscription_id.slice(-8)}</td>
                            <td className={`${dialogTable.cell} text-muted-foreground hidden xl:table-cell min-w-[180px] whitespace-nowrap`}>{formatTimestamp(subscription.created_at)}</td>
                            <td className={`${dialogTable.cell} text-card-foreground font-semibold min-w-[80px] whitespace-nowrap`}>{subscription.price_info.usage_limit === 999999 ? '∞' : subscription.price_info.usage_limit}</td>
                            <td className={`${dialogTable.cell} min-w-[100px]`}>
                              <Button
                                variant={subscription.price_info.button_text === 'Contact Sales' ? 'outline' : 'destructive'}
                                size="sm"
                                onClick={() => handleCancelSubscription(subscription.id)}
                                disabled={cancellingSubscriptionId === subscription.id || subscription.price_info.button_text === 'Contact Sales'}
                                className={`text-sm px-3 sm:px-4 py-2 h-8 whitespace-nowrap ${subscription.price_info.button_text === 'Contact Sales' ? 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-60' : ''}`}
                              >
                                {cancellingSubscriptionId === subscription.id ? (
                                  <>
                                    <ReloadIcon className="h-3 w-3 animate-spin mr-1" />
                                    <span>Cancelling...</span>
                                  </>
                                ) : (
                                  subscription.price_info.button_text === 'Contact Sales' ? 'Contact' : 'Cancel'
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-primary text-4xl">💳</span>
              </div>
              <p className="text-card-foreground font-semibold text-xl mb-2">No active subscriptions</p>
              <p className="text-muted-foreground text-sm">Subscribe to a plan to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


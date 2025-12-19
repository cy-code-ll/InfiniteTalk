'use client';

import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import Script from 'next/script';
import { Footer } from '../../components/Footer';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from 'next/link';
import { ReloadIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast-provider';
import { 
  PayLogDialog, 
  PointsLogDialog, 
  SubscriptionsDialog, 
  InvoiceDialog, 
  VideoDetailDialog 
} from '@/components/profile';
import { 
  FriendLink, 
  UserApiInfo, 
  GenerationHistoryItem 
} from '@/components/profile/types';
import { 
  groupHistoryByDate, 
  getPaginationItems, 
  formatTimestamp 
} from '@/components/profile/utils';

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { userId } = useAuth();
  const { signOut } = useClerk();
  const { openAuthModal } = useAuthModal();
  const toast = useToast();

  // API 数据状态 (用户信息)
  const [userApiInfo, setUserApiInfo] = useState<UserApiInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  // 图片历史记录状态
  const [historyList, setHistoryList] = useState<GenerationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const historyPageSize = 16;
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // 友情链接状态
  const [friendlyLinks, setFriendlyLinks] = useState<FriendLink[]>([]);

  // 对话框状态
  const [isPayLogDialogOpen, setIsPayLogDialogOpen] = useState(false);
  const [isTimesLogDialogOpen, setIsTimesLogDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedPayLogId, setSelectedPayLogId] = useState<number | null>(null);
  const [payLogList, setPayLogList] = useState<any[]>([]);

  // 视频详情弹窗状态
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState<GenerationHistoryItem | null>(null);

  // Close Account 相关状态
  const [isCloseAccountDialogOpen, setIsCloseAccountDialogOpen] = useState(false);
  const [isClosingAccount, setIsClosingAccount] = useState(false);

  // 作品保留政策提示框显示状态
  const [showRetentionPolicyAlert, setShowRetentionPolicyAlert] = useState(() => {
    // 从localStorage读取用户是否已关闭提示框
    if (typeof window !== 'undefined') {
      const closed = localStorage.getItem('retentionPolicyAlertClosed');
      return closed !== 'true';
    }
    return true;
  });

  // 打开发票弹窗
  const handleOpenInvoiceDialog = (payLogId: number) => {
    setSelectedPayLogId(payLogId);
    setIsInvoiceDialogOpen(true);
  };

  // 获取支付记录（用于发票对话框）
  const fetchPayLogForInvoice = async () => {
    if (!isLoaded || !userId) return;
    try {
      const result = await api.user.getPayLog(1, 100); // 获取足够的数据用于发票
      if (result.code === 200 && result.data) {
        setPayLogList(result.data.list || []);
      }
    } catch (error) {
      console.error('Failed to fetch pay log for invoice:', error);
    }
  };

  // 修改useEffect，添加userId作为依赖项以确保登录时触发
  useEffect(() => {
    // 删除修改document.title的代码，保持网站原有标题不变
  }, [isLoaded, user]);

  // 获取友情链接数据
  useEffect(() => {
    const fetchFriendlyLinks = async () => {
      try {
        const result = await api.cms.getFriendLinkList();
        if (result.code === 200 && result.success && Array.isArray(result.data)) {
          setFriendlyLinks(result.data);
        } else {
          console.warn('Failed to fetch friend links, using defaults');
          setFriendlyLinks([]);
        }
      } catch (error) {
        console.error('Failed to fetch friend links:', error);
        setFriendlyLinks([]);
      }
    };

    fetchFriendlyLinks();
  }, []); // 只在组件挂载时执行一次

  // API 调用 Effect (获取用户信息) - 添加userId监听
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isLoaded || !userId) {
        // 还未加载完成或用户未登录
        setIsLoadingUserInfo(false);
        setUserApiInfo(null);
        return;
      }

      setIsLoadingUserInfo(true);
      setUserInfoError(null);
      try {
        const result = await api.user.getUserInfo();
        if (result.code === 200 && result.data) {
          setUserApiInfo(result.data);
        } else {
          console.warn("User info API returned success code but no data");
          setUserApiInfo(null);
        }
      } catch (error) {
        console.error("Failed to fetch user API info:", error);
        setUserInfoError(error instanceof Error ? error.message : 'An unknown error occurred fetching user info');
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, [isLoaded, userId]);

  // 修改获取作品历史记录的useEffect，移除定时器
  useEffect(() => {
    const fetchGenerationHistory = async (page: number) => {
      if (!isLoaded || !userId) {
        // 还未加载完成或用户未登录
        setIsLoadingHistory(false);
        setHistoryList([]);
        setTotalPages(0);
        setTotalHistoryCount(0);
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const result = await api.user.getUserOpusList(page, historyPageSize);

        if (result.code === 200 && result.data) {
          setHistoryList(result.data.list || []);
          setTotalPages(result.data.total_page || 0);
          setTotalHistoryCount(result.data.count || 0);
        } else {
          console.error("Failed to fetch history:", result.msg || 'Unknown API error');
          setHistoryList([]);
          setTotalPages(0);
          setTotalHistoryCount(0);
          setHistoryError(result.msg || 'Failed to fetch generation history');
        }
      } catch (error) {
        console.error("Failed to fetch generation history:", error);
        setHistoryError(error instanceof Error ? error.message : 'An unknown error occurred fetching history');
        setHistoryList([]);
        setTotalPages(0);
        setTotalHistoryCount(0);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    // 首次加载数据
    fetchGenerationHistory(currentPage);
  }, [isLoaded, userId, currentPage]); // 使用userId替换user作为依赖项

  // Auto-refresh effect - 每30秒自动刷新一次
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const startAutoRefresh = () => {
      if (autoRefreshRef.current) return; // 已存在则不重复创建
      autoRefreshRef.current = setInterval(() => {
        // 静默刷新，不显示loading状态
        const fetchGenerationHistory = async (page: number) => {
          try {
            const result = await api.user.getUserOpusList(page, historyPageSize);
            if (result.code === 200 && result.data) {
              setHistoryList(result.data.list || []);
              setTotalPages(result.data.total_page || 0);
              setTotalHistoryCount(result.data.count || 0);
            }
          } catch (error) {
            console.error("Auto-refresh failed:", error);
          }
        };
        fetchGenerationHistory(currentPage);
      }, 30000); // 30秒
    };

    const stopAutoRefresh = () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else {
        startAutoRefresh();
      }
    };

    startAutoRefresh();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理：页面卸载或路由变更时停止轮询并移除监听
    return () => {
      stopAutoRefresh();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoaded, userId, currentPage]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      const historySection = document.getElementById('generation-history-section');
      if (historySection) {
        historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // 打开视频详情弹窗
  const handleOpenDetailDialog = (item: GenerationHistoryItem) => {
    setSelectedVideoDetail(item);
    setIsDetailDialogOpen(true);
  };

  // 刷新历史记录
  const refreshHistory = () => {
    const fetchGenerationHistory = async (page: number) => {
      if (!isLoaded || !userId) {
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const result = await api.user.getUserOpusList(page, historyPageSize);

        if (result.code === 200 && result.data) {
          setHistoryList(result.data.list || []);
          setTotalPages(result.data.total_page || 0);
          setTotalHistoryCount(result.data.count || 0);
        } else {
          console.error("Failed to fetch history:", result.msg || 'Unknown API error');
          setHistoryList([]);
          setTotalPages(0);
          setTotalHistoryCount(0);
          setHistoryError(result.msg || 'Failed to fetch generation history');
        }
      } catch (error) {
        console.error("Failed to fetch generation history:", error);
        setHistoryError(error instanceof Error ? error.message : 'An unknown error occurred fetching history');
        setHistoryList([]);
        setTotalPages(0);
        setTotalHistoryCount(0);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchGenerationHistory(currentPage);
  };

  // 处理关闭账户
  const handleCloseAccountClick = useCallback(() => {
    setIsCloseAccountDialogOpen(true);
  }, []);

  const handleConfirmCloseAccount = useCallback(async () => {
    setIsClosingAccount(true);
    try {
      const result = await api.user.closeAccount();
      if (result.code === 200) {
        toast.success('Account closed successfully');
        // 清除token并退出登录
        api.auth.clearTokens();
        signOut();
      } else {
        toast.error(result.msg || 'Failed to close account');
      }
    } catch (error) {
      console.error('Failed to close account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to close account');
    } finally {
      setIsClosingAccount(false);
      setIsCloseAccountDialogOpen(false);
    }
  }, [signOut, toast]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow py-12 px-6">
          <div className="container mx-auto">
            <div className="text-center py-12">
              <ReloadIcon className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
              <p className="text-gray font-inter">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow py-12 px-6">
          <div className="container mx-auto max-w-lg">
            <div className="bg-card rounded-2xl p-8 text-center shadow-custom border border-border">
              <h1 className="text-2xl font-bold mb-4 text-card-foreground">Profile</h1>
              <p className="mb-6 text-muted-foreground">Please sign in to view your profile</p>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => requestAnimationFrame(() => openAuthModal('signin'))}
              >
                Sign In
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  // 根据 API 数据计算使用率
  const usagePercentage = userApiInfo?.total_limit && userApiInfo.total_limit > 0
    ? (userApiInfo.use_limit / userApiInfo.total_limit) * 100
    : 0;

  // 获取用户等级名称
  const getUserLevelName = (level: number | undefined) => {
    switch (level) {
      case 0: return 'Free';
      case 1: return 'Starter';
      case 2: return 'Pro';
      case 3: return 'Ultimate';
      case 4: return 'Enterprise';
      default: return 'Free';
    }
  };
  const userLevelName = getUserLevelName(userApiInfo?.level);

  // Pagination items calculation
  const paginationItems = getPaginationItems(currentPage, totalPages);

  // Grouped history by date
  const groupedHistory = groupHistoryByDate(historyList);

  // 用户信息卡片统计项
  const stats = [
    {
      label: 'Membership Level',
      value: userLevelName,
      key: 'level',
      custom: (
        <span className="px-3 py-1 rounded-lg bg-[#232b3e] text-primary font-bold text-sm">
          {userLevelName}
        </span>
      )
    },
    {
      label: 'Points Remaining',
      value: ((userApiInfo?.remaining_limit || 0) + (userApiInfo?.free_limit || 0)).toString(),
      key: 'points',
    },
    {
      label: 'Points Used',
      value: userApiInfo?.use_limit?.toString() || '0',
      key: 'pointsUsed',
    },
    {
      label: 'Total Points',
      value: userApiInfo?.total_limit?.toString() || '0',
      key: 'pointsTotal',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Breadcrumb structured data */}
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/profile#breadcrumb',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://www.infinitetalk.net/'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Profile',
              item: 'https://www.infinitetalk.net/profile'
            }
          ]
        }) }}
      />
      <main className="flex-grow pt-20">
        {/* 顶部用户信息卡片 */}
        <div className="container mx-auto mt-8 mb-8">
          <div className="bg-card rounded-2xl px-10 py-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl">
            {/* 头像 */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-border">
                <div className="relative w-full h-full">
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    fill
                    className="object-cover"
                    priority={false}
                    loading="lazy"
                    draggable="false"
                    unoptimized={true}
                  />
                </div>
              </div>
            </div>
            {/* 用户信息和统计 */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <span className="text-2xl font-bold text-card-foreground">{user.fullName || user.username}</span>
                <span className="text-muted-foreground text-base">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                {/* 会员等级/积分/生成数/API调用数 */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-inter">
                  <span>Membership Level</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold ml-2">
                    {userLevelName}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                  <span>Points Remaining</span>
                  <span className="font-bold ml-2 text-card-foreground">{(userApiInfo?.remaining_limit || 0) + (userApiInfo?.free_limit || 0)}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                  <span>Points Used</span>
                  <span className="font-bold ml-2 text-card-foreground">{userApiInfo?.use_limit || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                  <span>Total Points</span>
                  <span className="font-bold ml-2 text-card-foreground">{(userApiInfo?.total_limit || 0) + (userApiInfo?.free_limit || 0)}</span>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Dialog open={isPayLogDialogOpen} onOpenChange={setIsPayLogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-full border-border bg-card/50 hover:bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-4 py-2"
                      onClick={() => {
                        setIsPayLogDialogOpen(true);
                        fetchPayLogForInvoice();
                      }}
                    >
                      <span className="text-card-foreground">Pay Log</span>
                    </Button>
                  </DialogTrigger>
                  <PayLogDialog
                    open={isPayLogDialogOpen}
                    onOpenChange={setIsPayLogDialogOpen}
                    onOpenInvoiceDialog={handleOpenInvoiceDialog}
                  />
                </Dialog>
                <Dialog open={isTimesLogDialogOpen} onOpenChange={setIsTimesLogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-full border-border bg-card/50 hover:bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-4 py-2"
                      onClick={() => setIsTimesLogDialogOpen(true)}
                    >
                      <span className="text-card-foreground">Points Log</span>
                    </Button>
                  </DialogTrigger>
                  <PointsLogDialog
                    open={isTimesLogDialogOpen}
                    onOpenChange={setIsTimesLogDialogOpen}
                  />
                </Dialog>
                <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-full border-border bg-card/50 hover:bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-4 py-2"
                      onClick={() => setIsSubscriptionDialogOpen(true)}
                    >
                      <span className="text-card-foreground">Subscriptions</span>
                    </Button>
                  </DialogTrigger>
                  <SubscriptionsDialog
                    open={isSubscriptionDialogOpen}
                    onOpenChange={setIsSubscriptionDialogOpen}
                  />
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 rounded-full border-red-500/50 bg-card/50 hover:bg-red-500/10 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-4 py-2 text-red-500 hover:text-red-600"
                  onClick={handleCloseAccountClick}
                >
                  <span>Close Account</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Generation History 标题 - 添加刷新按钮 */}
        <div className="container mx-auto mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-primary text-2xl font-bold mb-4">Video Generation History</h2>
            <Button
              onClick={refreshHistory}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? (
                <>
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <ReloadIcon className="h-4 w-4" />
                  <span>Refresh</span>
                </>
              )}
            </Button>
          </div>
          {/* 作品保留政策提示框 */}
          {showRetentionPolicyAlert && (
            <div className="bg-gray-100 border border-orange-300 rounded-lg p-2 flex items-start gap-2 mb-4">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">i</span>
              </div>
              <div className="flex-1">
                <div className="text-orange-900 font-semibold mb-1.5 text-xs">Content Retention Policy Reminder</div>
                <div className="text-orange-800 text-xs leading-tight">
                  <div>Your creations are only retained for the last 6 months.</div>
                  <div> Any works older than 6 months will be automatically deleted on a rolling monthly basis.
                  Please make sure to back up and download any important content in time.</div>
                </div>
              </div>
              {/* <button
                onClick={() => {
                  setShowRetentionPolicyAlert(false);
                  // 保存到localStorage，记住用户已关闭提示框
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('retentionPolicyAlertClosed', 'true');
                  }
                }}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center hover:bg-orange-700 transition-colors"
                aria-label="关闭提示"
              >
                <span className="text-white text-[10px] font-bold">×</span>
              </button> */}
            </div>
          )}
        </div>

        {/* 视频历史区域（按日期分组） */}
        <div className="container mx-auto pb-16">
          {historyList.length > 0 ? (
            <div className="space-y-8">
              {groupedHistory.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  {/* 日期标题 */}
                  <h3 className="text-xl font-semibold text-card-foreground border-b border-border pb-2">
                    {group.date}
                  </h3>
                  {/* 分组内网格 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {group.items
                      .filter((item: GenerationHistoryItem) => {
                        // 过滤状态
                        const statusMatch = item.status === 0 || item.status === 1 || (item.status === -1 && item.generate_image === '');
                        if (!statusMatch) return false;
                        
                        // 过滤掉 model 为 "Nano Banana" 的作品
                        if (item.model === 'Nano Banana') {
                          return false;
                        }
                        
                        return true;
                      })
                      .map((item: GenerationHistoryItem) => {
                        const isFailed = item.status === -1 && item.generate_image === '';
                        const isGenerating = item.status === 0 && item.generate_image === '';
                        const getModelName = (sizeImage: string) => {
                          const modelMatch = sizeImage.match(/Model:\s*([^;]+)/);
                          return modelMatch ? modelMatch[1].trim() : null;
                        };
                        const getResolution = (sizeImage: string) => {
                          // 匹配 resolution: 后面的内容，直到遇到下一个字段或字符串结束
                          const resolutionMatch = sizeImage.match(/resolution:\s*([^\s;]+)/i);
                          return resolutionMatch ? resolutionMatch[1].trim() : null;
                        };
                        const modelName = item.size_image ? getModelName(item.size_image) : null;
                        const resolution = item.size_image ? getResolution(item.size_image) : null;
                        return (
                          <div 
                            key={item.id} 
                            className={`bg-card rounded-xl overflow-hidden relative flex flex-col shadow-lg border border-border transition-all duration-200 ${!isFailed && !isGenerating ? 'cursor-pointer hover:shadow-xl hover:border-primary/50' : ''}`}
                            onClick={() => {
                              if (!isFailed && !isGenerating) {
                                handleOpenDetailDialog(item);
                              }
                            }}
                          >
                            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                              {modelName && (
                                <div className="bg-primary/90 hover:bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold shadow-lg backdrop-blur-sm">
                                  Model: {modelName}
                                </div>
                              )}
                              {resolution && (
                                <div className="bg-emerald-500/90 hover:bg-emerald-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg backdrop-blur-sm">
                                  Resolution: {resolution}
                                </div>
                              )}
                            </div>
                            {!isFailed && !isGenerating && (
                              <button
                                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-primary p-2 rounded-full text-white transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetailDialog(item);
                                }}
                                title="View Details"
                              >
                                <EyeOpenIcon className="h-4 w-4" />
                              </button>
                            )}
                            <div className="relative w-full aspect-video overflow-hidden">
                              {isFailed ? (
                                <div className="w-full h-full bg-gradient-to-br from-red-500/10 to-red-600/20 flex flex-col items-center justify-center border-2 border-dashed border-red-300/50">
                                  <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <span className="text-red-400 text-2xl">⚠️</span>
                                    </div>
                                    <p className="text-red-400 font-semibold text-sm mb-1">Generation Failed</p>
                                    <p className="text-red-300/70 text-xs">Please try again</p>
                                  </div>
                                </div>
                              ) : isGenerating ? (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex flex-col items-center justify-center border-2 border-dashed border-primary/50">
                                  <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <ReloadIcon className="h-6 w-6 text-primary animate-spin" />
                                    </div>
                                    <p className="text-primary font-semibold text-sm mb-1">Generating...</p>
                                    <p className="text-primary/70 text-xs">Please wait</p>
                                  </div>
                                </div>
                              ) : (
                                <video
                                  src={item.generate_image}
                                  muted
                                  preload="metadata"
                                  className="w-full h-full pointer-events-none"
                                  playsInline
                                  disablePictureInPicture
                                >
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </div>
                            <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted">
                              {formatTimestamp(item.created_at)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">No videos yet.</div>
          )}

          {/* 分页组件 */}
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {paginationItems.map((item: number | '...', index: number) => (
                  <PaginationItem key={index}>
                    {item === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(item as number);
                        }}
                        isActive={item === currentPage}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* 发票对话框 */}
        <InvoiceDialog
          open={isInvoiceDialogOpen}
          onOpenChange={setIsInvoiceDialogOpen}
          payLogId={selectedPayLogId}
          payLogList={payLogList}
        />

        {/* 视频详情对话框 */}
        <VideoDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          videoDetail={selectedVideoDetail}
          onDeleteSuccess={refreshHistory}
        />

        {/* 注销账户确认弹窗 */}
        <Dialog open={isCloseAccountDialogOpen} onOpenChange={setIsCloseAccountDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-foreground">Close Account</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to close your account? This action cannot be undone. All your data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsCloseAccountDialogOpen(false)}
                disabled={isClosingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCloseAccount}
                disabled={isClosingAccount}
                className="flex items-center gap-2 ml-5"
              >
                {isClosingAccount ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Closing...
                  </>
                ) : (
                  'Confirm Close Account'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer friendlyLinks={friendlyLinks} />
    </div>
  );
} 
'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Footer } from '../../components/Footer';
import Image from 'next/image';
import { Progress } from '../../components/ui/progress';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { DownloadIcon, ReloadIcon } from '@radix-ui/react-icons';
import { api } from '@/lib/api';
import { User } from "@clerk/nextjs/server";
import { cmsApi } from "@/lib/api";
import { useToast } from '@/components/ui/toast-provider';

// 友情链接数据类型定义
interface FriendLink {
  id: number;
  name: string;
  url: string;
  is_bright: number;
  desc: string;
  image: string;
  web_type: number;
  sort: number;
  appid: string;
  created_time: number;
}

// 定义从API获取的用户信息类型
interface UserApiInfo {
  uuid: string;
  email: string;
  from_login: string;
  nickname: string;
  avatar?: string;
  free_limit: number;
  remaining_limit: number;
  total_limit: number;
  use_limit: number;
  vip_last_time: number;
  level: number;
  created_at: number;
  updated_at: number;
  status: number;
  id: number;
}

// 定义图片历史记录项的类型
interface GenerationHistoryItem {
  id: number;
  user_id: number;
  task_id: string;
  origin_image: string;
  size_image: string;
  other_image: string;
  generate_image: string;
  quality_image: string;
  status: number;
  status_msg: string;
  generation_time: number;
  prompt: string;
  created_at: number;
  updated_at: number;
}

// 定义图片历史记录 API 返回的数据结构
interface GenerationHistoryResponse {
  count: number;
  list: GenerationHistoryItem[];
  total_page: number;
}

// 定义积分记录项的类型
interface TimesLogItem {
  id: number;
  user_id: number;
  change_type: string;
  use_limit: number;
  created_at: number;
  updated_at: number;
}

// 定义积分记录 API 返回的数据结构
interface TimesLogResponse {
  count: number;
  list: TimesLogItem[];
  total_page: number;
}

// 定义订阅记录项的类型
interface SubscriptionItem {
  id: number;
  pay_type: string;
  user_id: number;
  customer_id: string;
  subscription_id: string;
  price_id: string;
  created_at: number;
  updated_at: number;
  price_info: {
    id: number;
    appid: string;
    name: string;
    description: string;
    price: number;
    features: string;
    is_popular: number;
    button_text: string;
    usage_limit: number;
    level: number;
    stripe_id: number;
    prices_id: string;
    stripe_type: string;
    status: number;
  };
}

// 定义用户生成图片的接口
interface GeneratedImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

// 将辅助函数移到组件外部
function getPaginationItems(currentPage: number, totalPages: number, siblingCount = 1): (number | '...')[] {
  const totalPageNumbers = siblingCount + 5; // siblings + first + last + current + 2*ellipsis

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
    return [firstPageIndex, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1); // Fallback
}

// --- 将下载逻辑定义为独立函数 --- 
async function downloadMediaWithCors(
  mediaUrl: string, 
  filename: string, 
  setIsDownloading: (id: number | null) => void, // 用于更新加载状态
  mediaId: number, // 媒体 ID 用于设置加载状态
  showToast: (message: string, type: 'success' | 'error' | 'info') => void // toast显示函数
) {
  setIsDownloading(mediaId); // 开始下载，设置加载状态
  try {
    // 1. 发起 fetch 请求
    const response = await fetch(mediaUrl, { mode: 'cors' });

    // 检查响应是否成功并且是 CORS 允许的
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}. Failed to fetch media. Check CORS headers on the server.`);
    }

    // 2. 将响应体转换为 Blob 对象
    const blob = await response.blob();

    // 3. 创建一个指向 Blob 的 Object URL
    const objectUrl = URL.createObjectURL(blob);

    // 4. 创建 <a> 标签并触发下载
    const link = document.createElement('a');
    link.href = objectUrl;
            link.download = filename || `ideavido-media-${mediaId}.mp4`; // 使用传入的 filename 或生成一个
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. 释放 Object URL 资源
    URL.revokeObjectURL(objectUrl);

    console.log('Media download initiated!');
    showToast('Video downloaded successfully!', 'success');

  } catch (error: any) {
    console.error('Download failed:', error);
    // 使用英文显示错误信息
    const errorMessage = 'Download failed!';
    const corsMessage = `Could not fetch media from ${mediaUrl}. This is often due to missing CORS headers (Access-Control-Allow-Origin) on the server. Check the browser console for details.`;
    const genericMessage = `Error: ${error.message}`;

    // 检查是否是网络错误或类型错误（通常与 CORS 相关）
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        showToast(`${errorMessage} - CORS error. Check server configuration.`, 'error');
    } else {
        showToast(`${errorMessage} ${genericMessage}`, 'error');
    }
  } finally {
    setIsDownloading(null); // 结束下载（无论成功或失败），清除加载状态
  }
}

// Function to format timestamp based on locale
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp * 1000));
  } catch (e) {
    console.error("Error formatting date:", e);
    return new Date(timestamp * 1000).toLocaleDateString(); // Fallback
  }
};

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { userId, sessionId, getToken } = useAuth();
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
  const [isDownloading, setIsDownloading] = useState<number | null>(null); // 跟踪正在下载的图片ID

  // 积分记录状态
  const [timesLogList, setTimesLogList] = useState<TimesLogItem[]>([]);
  const [isLoadingTimesLog, setIsLoadingTimesLog] = useState(false);
  const [timesLogError, setTimesLogError] = useState<string | null>(null);
  const [timesLogCurrentPage, setTimesLogCurrentPage] = useState(1);
  const [timesLogTotalPages, setTimesLogTotalPages] = useState(0);
  const [isTimesLogDialogOpen, setIsTimesLogDialogOpen] = useState(false);
  const timesLogPageSize = 10;

  // New state for generated images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userImages, setUserImages] = useState<GeneratedImage[]>([]);

  // 友情链接状态
  const [friendlyLinks, setFriendlyLinks] = useState<FriendLink[]>([]);

  // 订阅记录状态
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionItem[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState<number | null>(null);

  // 获取积分记录数据的函数
  const fetchTimesLog = async (page: number) => {
    if (!isLoaded || !userId) return;

    setIsLoadingTimesLog(true);
    setTimesLogError(null);
    try {
      const result = await api.user.getTimesLog(page, timesLogPageSize);

      if (result.code === 200 && result.data) {
        setTimesLogList(result.data.list || []);
        setTimesLogTotalPages(result.data.total_page || 0);
      } else {
        console.error("Failed to fetch times log:", result.msg || 'Unknown API error');
        setTimesLogList([]);
        setTimesLogTotalPages(0);
        setTimesLogError(result.msg || 'Failed to fetch times log');
      }
    } catch (error) {
      console.error("Failed to fetch times log:", error);
      setTimesLogError(error instanceof Error ? error.message : 'An unknown error occurred fetching times log');
      setTimesLogList([]);
      setTimesLogTotalPages(0);
    } finally {
      setIsLoadingTimesLog(false);
    }
  };

  // Format change type
  const formatChangeType = (changeType: string): string => {
    const typeMap: Record<string, string> = {
      'buy_package': 'Buy Package',
      'create_task_free': 'Free Generation',
      'month_free': 'Monthly Free',
      'register_give': 'Registration Gift',
      'invite_reward': 'Invitation Reward',
      'daily_check': 'Daily Check-in',
      'refund': 'Refund',
    };
    return typeMap[changeType] || changeType;
  };

  // Open points log dialog
  const handleOpenTimesLogDialog = () => {
    setIsTimesLogDialogOpen(true);
    setTimesLogCurrentPage(1);
    fetchTimesLog(1);
  };

  // Handle points log page change
  const handleTimesLogPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= timesLogTotalPages && newPage !== timesLogCurrentPage) {
      setTimesLogCurrentPage(newPage);
      fetchTimesLog(newPage);
    }
  };

  // 获取订阅记录数据的函数
  const fetchSubscriptions = async () => {
    if (!isLoaded || !userId) return;

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

  // 取消订阅函数
  const handleCancelSubscription = async (subscriptionId: number) => {
    setCancellingSubscriptionId(subscriptionId);
    try {
      const result = await api.payment.cancelSubscription(subscriptionId);

      if (result.code === 200) {
        // 取消成功，刷新订阅记录
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

  // 打开订阅记录弹窗
  const handleOpenSubscriptionDialog = () => {
    setIsSubscriptionDialogOpen(true);
    fetchSubscriptions();
  };

  // 格式化价格显示
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // 格式化特性列表
  const formatFeatures = (features: string): string[] => {
    return features.split(',').map(feature => feature.trim());
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

  // 添加一个刷新历史记录的函数
  const refreshHistory = () => {
    // 刷新当前页
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
              <Link href="/sign-in">
                                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Sign In
                </Button>
              </Link>
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
      default: return 'Free';
    }
  };
  const userLevelName = getUserLevelName(userApiInfo?.level);

  // Pagination items calculation
  const paginationItems = getPaginationItems(currentPage, totalPages);

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
              <div className="mt-6 flex gap-3">
                <Dialog open={isTimesLogDialogOpen} onOpenChange={setIsTimesLogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 rounded-full border-border bg-card/50 hover:bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-4 py-2"
                      onClick={handleOpenTimesLogDialog}
                    >
                      <span className="text-card-foreground">Points Log</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted/80 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
                                          <DialogHeader className="text-center pb-6 border-b border-border">
                        <DialogTitle className="text-2xl font-semibold text-card-foreground tracking-tight">Points Log</DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2">
                        View your points transaction history
                      </DialogDescription>
                    </DialogHeader>
                    <div className="pt-6">
                      {isLoadingTimesLog ? (
                        <div className="text-center py-12">
                          <ReloadIcon className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Loading...</p>
                        </div>
                      ) : timesLogError ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-400 text-2xl">⚠️</span>
                          </div>
                          <p className="text-red-400 font-medium">Failed to load: {timesLogError}</p>
                        </div>
                      ) : timesLogList.length > 0 ? (
                        <>
                                                     {/* Points Log List */}
                          <div className="space-y-3">
                            {timesLogList.map((item) => (
                              <div key={item.id} className="group p-6 rounded-2xl bg-secondary/80 hover:bg-card hover:shadow-lg transition-all duration-200 border border-border">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                      <span className="font-semibold text-card-foreground text-lg">
                                        {formatChangeType(item.change_type)}
                                      </span>
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                        item.use_limit > 0 
                                          ? 'bg-green-500/20 text-green-400' 
                                          : 'bg-red-500/20 text-red-400'
                                      }`}>
                                        {item.use_limit > 0 ? '+' : ''}{item.use_limit}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">
                                      {formatTimestamp(item.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                                                     {/* Points Log Pagination */}
                          {timesLogTotalPages > 1 && (
                            <div className="flex justify-center mt-6">
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious 
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleTimesLogPageChange(timesLogCurrentPage - 1);
                                      }}
                                      className={timesLogCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                  </PaginationItem>
                                  
                                  {getPaginationItems(timesLogCurrentPage, timesLogTotalPages).map((item, index) => (
                                    <PaginationItem key={index}>
                                      {item === '...' ? (
                                        <PaginationEllipsis />
                                      ) : (
                                        <PaginationLink
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleTimesLogPageChange(item as number);
                                          }}
                                          isActive={item === timesLogCurrentPage}
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
                                        handleTimesLogPageChange(timesLogCurrentPage + 1);
                                      }}
                                      className={timesLogCurrentPage >= timesLogTotalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-muted-foreground text-3xl">📊</span>
                          </div>
                          <p className="text-muted-foreground font-medium text-lg">No points records yet</p>
                          <p className="text-muted-foreground/60 text-sm mt-1">Your transaction history will appear here</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 rounded-full border-border bg-card/50 hover:bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-4 py-2"
                      onClick={handleOpenSubscriptionDialog}
                    >
                      <span className="text-card-foreground">Subscriptions</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-fit min-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted/80 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
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
                        <div className="grid gap-6">
                          {subscriptionList.map((subscription) => (
                            <div key={subscription.id} className="group relative p-6 rounded-3xl bg-gradient-to-br from-card to-secondary/50 border border-border shadow-lg hover:shadow-xl transition-all duration-300">
                              {/* 顶部彩条 */}
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60 rounded-t-3xl"></div>
                              
                              {/* 简化的头部区域：名称、状态、价格、按钮 */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <h3 className="text-2xl font-bold text-card-foreground tracking-tight">
                                    {subscription.price_info.name}
                                  </h3>
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    Active
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="text-3xl font-bold text-card-foreground">
                                    {formatPrice(subscription.price_info.price)}
                                  </div>
                                  <Button
                                    variant={subscription.price_info.button_text === 'Contact Sales' ? 'outline' : 'destructive'}
                                    size="sm"
                                    onClick={() => handleCancelSubscription(subscription.id)}
                                    disabled={cancellingSubscriptionId === subscription.id || subscription.price_info.button_text === 'Contact Sales'}
                                    className={`min-w-[120px] rounded-full transition-all duration-200 ${
                                      subscription.price_info.button_text === 'Contact Sales' 
                                        ? 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-60' 
                                        : 'bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 shadow-md hover:shadow-lg'
                                    }`}
                                  >
                                    {cancellingSubscriptionId === subscription.id ? (
                                      <>
                                        <ReloadIcon className="h-4 w-4 animate-spin mr-2" />
                                        <span>Cancelling...</span>
                                      </>
                                    ) : (
                                      subscription.price_info.button_text === 'Contact Sales' ? 'Contact Sales' : 'Cancel Plan'
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              {/* 底部信息 */}
                              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground bg-secondary/80 rounded-2xl p-4 mt-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-card-foreground">ID:</span>
                                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{subscription.subscription_id.slice(-8)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-card-foreground">Started:</span>
                                  <span>{formatTimestamp(subscription.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-card-foreground">Usage Limit:</span>
                                  <span className="font-semibold text-primary">{subscription.price_info.usage_limit === 999999 ? 'Unlimited' : subscription.price_info.usage_limit}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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
        </div>

        {/* 视频历史区域 */}
        <div className="container mx-auto pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {historyList.length > 0 ? (
              historyList
                .filter(item => item.status !== -1 && item.quality_image) // 过滤掉状态为-1的作品和没有quality_image的记录
                .map((item) => (
                <div key={item.id} className="bg-card rounded-xl overflow-hidden relative flex flex-col shadow-lg border border-border">
                  {/* 下载按钮 - 只在有quality_image时才显示 */}
                  <button 
                    className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-primary p-2 rounded-full text-white transition-colors"
                                         onClick={() => downloadMediaWithCors(item.quality_image, `video-${item.id}.mp4`, setIsDownloading, item.id, toast.showToast)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                  
                  {/* 视频内容 - 16:9比例 */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    <video
                      src={item.quality_image}
                      controls
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* 日期 - 减少内边距使其更紧凑 */}
                  <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted">
                    {formatTimestamp(item.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-12">No videos yet.</div>
            )}
          </div>
          
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
                
                {paginationItems.map((item, index) => (
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
      </main>
      <Footer friendlyLinks={friendlyLinks} />
    </div>
  );
} 
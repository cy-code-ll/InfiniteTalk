'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Footer } from '../../components/Footer';
import Image from 'next/image';
import { Progress } from '../../components/ui/progress';
import { useEffect, useState, useRef } from 'react';
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
import { DownloadIcon, ReloadIcon, EyeOpenIcon, Cross2Icon, Share1Icon } from '@radix-ui/react-icons';
import { api } from '@/lib/api';
import { User } from "@clerk/nextjs/server";
import { cmsApi } from "@/lib/api";
import { useToast } from '@/components/ui/toast-provider';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import { shareToSocial, SocialPlatform } from '@/lib/share-utils';

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

// 按日期分组类型与函数
interface GroupedHistoryItem {
  date: string;
  items: GenerationHistoryItem[];
}

const groupHistoryByDate = (items: GenerationHistoryItem[]): GroupedHistoryItem[] => {
  const groups: Record<string, GenerationHistoryItem[]> = {};
  items.forEach((item) => {
    const date = new Date(item.created_at * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });

  return Object.entries(groups)
    .map(([date, itemsForDate]) => ({ date, items: itemsForDate }))
    .sort((a, b) => {
      const aTs = a.items[0]?.created_at ?? 0;
      const bTs = b.items[0]?.created_at ?? 0;
      return bTs - aTs;
    });
};

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

// 定义支付记录项的类型
interface PayLogItem {
  id: number;
  user_id: number;
  created_at: number;
  amount: number;
  currency: string;
  pay_type: string;
  price_id?: string;
  updated_at: number;
}

// 定义支付记录 API 返回的数据结构
interface PayLogResponse {
  count: number;
  list: PayLogItem[];
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
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

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

  // 支付记录状态（Pay Log）
  const [payLogList, setPayLogList] = useState<PayLogItem[]>([]);
  const [isLoadingPayLog, setIsLoadingPayLog] = useState(false);
  const [payLogError, setPayLogError] = useState<string | null>(null);
  const [payLogCurrentPage, setPayLogCurrentPage] = useState(1);
  const [payLogTotalPages, setPayLogTotalPages] = useState(0);
  const [isPayLogDialogOpen, setIsPayLogDialogOpen] = useState(false);
  const payLogPageSize = 10;

  // 发票状态
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedPayLogId, setSelectedPayLogId] = useState<number | null>(null);
  const [invoiceType, setInvoiceType] = useState<'personal' | 'business'>('personal');
  const [companyName, setCompanyName] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  // 视频详情弹窗状态
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState<GenerationHistoryItem | null>(null);

  // 临时假数据用于测试样式（已移除）

  // 临时支付记录假数据（已移除）

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

  // 统一弹窗表格样式
  const dialogTable = {
    wrapper: 'rounded-lg border border-border overflow-x-auto',
    table: 'w-full table-fixed',
    headCell: 'text-left px-6 py-3 md:py-4 text-sm font-semibold text-muted-foreground',
    cell: 'px-6 py-3 md:py-4 text-sm',
    row: 'border-b border-border hover:bg-muted/50',
    mono: 'text-muted-foreground text-sm font-mono',
    pillBase: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium',
  } as const;

  // 打开支付记录弹窗
  const handleOpenPayLogDialog = () => {
    setIsPayLogDialogOpen(true);
    setPayLogCurrentPage(1);
    fetchPayLog(1);
  };

  // 获取支付记录
  const fetchPayLog = async (page: number) => {
    if (!isLoaded || !userId) return;

    setIsLoadingPayLog(true);
    setPayLogError(null);
    try {
      const result = await api.user.getPayLog(page, payLogPageSize);
      if (result.code === 200 && result.data) {
        setPayLogList(result.data.list || []);
        setPayLogTotalPages(result.data.total_page || 0);
      } else {
        setPayLogList([]);
        setPayLogTotalPages(0);
        setPayLogError(result.msg || 'Failed to fetch pay log');
      }
    } catch (error) {
      setPayLogError(error instanceof Error ? error.message : 'An unknown error occurred fetching pay log');
      setPayLogList([]);
      setPayLogTotalPages(0);
    } finally {
      setIsLoadingPayLog(false);
    }
  };

  // 支付记录翻页
  const handlePayLogPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= payLogTotalPages && newPage !== payLogCurrentPage) {
      setPayLogCurrentPage(newPage);
      fetchPayLog(newPage);
    }
  };

  // 打开发票弹窗
  const handleOpenInvoiceDialog = (payLogId: number) => {
    setSelectedPayLogId(payLogId);
    setInvoiceType('personal');
    setCompanyName('');
    setIsInvoiceDialogOpen(true);
  };

  // 价格映射（参考 seedance）
  const getPriceFromPriceId = (priceId?: string): string => {
    if (!priceId) return '-';
    const priceMap: Record<string, string> = {
      // Legacy/seedance ids
      'C938Z6WZUH7WU': '$1',
      '2HVS2EBUXQJMC': '$5',
      'P-63W46975WN208225XNBFEG4A': '$10',
      'MMLMFFTHKPXHG': '$10',
      'price_1RjVFUAxK12WUhXq5i3sSm7G': '$10',
      'P-06V038958U832370VNBFHR5Q': '$30',
      'U9ANZBSMDW4WJ': '$30',
      'price_1RjVFdAxK12WUhXqCxSKnNVi': '$30',
      'AM3HRVSV2C2GY': '$99',
      'price_1RjVFlAxK12WUhXqlbatB1um': '$99',
      'P-9A720338VD080470HNBFHSWA': '$100',

      // InfiniteTalk current PricingSection one-time plans
      'price_1S0bzJ2LCxiz8WFQshNuYpsJ': '$9.9',   // Starter 90 credits
      'price_1S0bze2LCxiz8WFQJBMjVxi0': '$29.9', // Pro 400 credits
      'price_1S0bzt2LCxiz8WFQXQ5Foe8K': '$49.9', // Ultimate 800 credits
      'price_1S3sev2LCxiz8WFQana9TXxD': '$99.9', // Enterprise 1800 credits

      // InfiniteTalk subscription plans
      'price_1S6QPW2LCxiz8WFQit6OMKPr': '$9.9',  // sub-starter 100 credits
      'price_1S6QPh2LCxiz8WFQZ3HexZwV': '$29.9', // sub-pro 480 credits
      'price_1S6QQX2LCxiz8WFQIegCJKHt': '$49.9', // sub-ultimate 990 credits
      'price_1S6QQq2LCxiz8WFQD3mpyy0O': '$99.9', // sub-enterprise 2200 credits
    };
    return priceMap[priceId] || '-';
  };

  // 创建发票（采用 seedance 流程）
  const handleCreateInvoice = async () => {
    if (!selectedPayLogId) {
      toast.error('Please select a payment record');
      return;
    }
    if (invoiceType === 'business' && !companyName.trim()) {
      toast.error('Please enter company name for business invoice');
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const payLogItem = payLogList.find((item: PayLogItem) => item.id === selectedPayLogId);
      if (!payLogItem) {
        throw new Error('Payment record not found');
      }

      const price = getPriceFromPriceId(payLogItem.price_id);
      const priceValue = parseFloat(price.replace('$', '')) || payLogItem.amount;

      const invoiceNumber = `INFINITETALK-${new Date().getFullYear()}-${payLogItem.id}`;
      const data = {
        invoiceNumber,
        dateOfIssue: formatTimestamp(payLogItem.created_at),
        companyName: 'InfiniteTalk',
        companyEmailAddress: 'support@infinitetalk.net',
        customerName: user?.fullName || user?.username || 'Customer',
        customerEmail: user?.primaryEmailAddress?.emailAddress || 'customer@example.com',
        customerCompanyName: invoiceType === 'business' ? companyName.trim() : '',
        description: `${payLogItem.amount} Credits`,
        quantity: 1,
        unitPrice: priceValue,
        amount: priceValue,
        subtotal: priceValue,
        total: priceValue,
        amountPaid: priceValue,
        notes: `Payment received in full on ${formatTimestamp(payLogItem.created_at)}. Thank you for your business!`
      };

      setInvoiceData(data);
      setShowInvoicePreview(true);

      setTimeout(() => {
        generateInvoicePDF(invoiceNumber);
      }, 300);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast.error('Failed to generate invoice');
      setShowInvoicePreview(false);
      setInvoiceData(null);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const generateInvoicePDF = async (invoiceNumber: string) => {
    try {
      const invoiceElement = document.querySelector('.invoice-template') as HTMLElement;
      if (!invoiceElement) {
        throw new Error('Invoice template not found');
      }

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default || html2pdfModule;

      const options = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      await (html2pdf().from(invoiceElement).set(options) as any).save();

      toast.success('Invoice generated and downloaded successfully!');
      setIsInvoiceDialogOpen(false);
      setSelectedPayLogId(null);
      setCompanyName('');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setShowInvoicePreview(false);
      setInvoiceData(null);
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

  // 打开视频详情弹窗
  const handleOpenDetailDialog = (item: GenerationHistoryItem) => {
    setSelectedVideoDetail(item);
    setIsDetailDialogOpen(true);
  };

  // 解析音频URL字符串（用 | 分割）
  const parseAudioUrls = (audioString: string): string[] => {
    if (!audioString) return [];
    return audioString.split('|').filter(url => url.trim());
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
                <Dialog open={isPayLogDialogOpen} onOpenChange={setIsPayLogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-full border-border bg-card/50 hover:bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-4 py-2"
                      onClick={handleOpenPayLogDialog}
                    >
                      <span className="text-card-foreground">Pay Log</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="max-h-[85vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted/80 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted"
                    style={{ 
                      width: 'min(98vw, 1200px)',
                      maxWidth: 'min(98vw, 1200px)',
                      minWidth: '360px'
                    }}
                  >
                    <DialogHeader className="text-center pb-6 border-b border-border">
                      <DialogTitle className="text-2xl font-semibold text-card-foreground tracking-tight">Pay Log</DialogTitle>
                      <DialogDescription className="text-muted-foreground mt-2">
                        View your payment transaction history
                      </DialogDescription>
                    </DialogHeader>
                    <div className="pt-6">
                      {isLoadingPayLog ? (
                        <div className="text-center py-12">
                          <ReloadIcon className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Loading...</p>
                        </div>
                      ) : payLogError ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-400 text-2xl">⚠️</span>
                          </div>
                          <p className="text-red-400 font-medium">Failed to load: {payLogError}</p>
                        </div>
                      ) : payLogList.length > 0 ? (
                        <>
                          <div className={dialogTable.wrapper}>
                            <table className={dialogTable.table} style={{ minWidth: '700px' }}>
                              <thead>
                                <tr className="border-b border-border">
                                  <th className={`${dialogTable.headCell} w-1/4`}>Date</th>
                                  <th className={`${dialogTable.headCell} w-1/6`}>Points</th>
                                  <th className={`${dialogTable.headCell} w-1/6`}>Price</th>
                                  <th className={`${dialogTable.headCell} w-1/6 hidden sm:table-cell`}>Currency</th>
                                  <th className={`${dialogTable.headCell} w-1/6 hidden sm:table-cell`}>Payment Type</th>
                                  <th className={`${dialogTable.headCell} w-1/6`}>Invoice</th>
                                </tr>
                              </thead>
                              <tbody>
                                {payLogList.map((item) => (
                                  <tr key={item.id} className={dialogTable.row}>
                                    <td className={`${dialogTable.cell} text-muted-foreground`}>{formatTimestamp(item.created_at)}</td>
                                    <td className={dialogTable.cell}>
                                      <span className={`${dialogTable.pillBase} bg-green-500/20 text-green-400 font-bold`}>
                                        {item.amount}
                                      </span>
                                    </td>
                                    <td className={`${dialogTable.cell} text-card-foreground font-medium whitespace-nowrap`}>
                                      {(() => {
                                        const mapped = getPriceFromPriceId(item.price_id);
                                        if (mapped && mapped !== '-') return mapped;
                                        return (
                                          <span className="inline-block max-w-[180px] truncate align-middle" title={item.price_id || '-' }>
                                            {item.price_id || '-'}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td className={`${dialogTable.cell} text-card-foreground hidden sm:table-cell`}>{item.currency}</td>
                                    <td className={`${dialogTable.cell} text-card-foreground hidden sm:table-cell`}>{item.pay_type}</td>
                                    <td className={dialogTable.cell}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenInvoiceDialog(item.id)}
                                        className="h-8 px-3 text-sm"
                                      >
                                        Invoice
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {payLogTotalPages > 1 && (
                            <div className="flex justify-center mt-6">
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handlePayLogPageChange(payLogCurrentPage - 1);
                                      }}
                                      className={payLogCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                  </PaginationItem>
                                  {getPaginationItems(payLogCurrentPage, payLogTotalPages).map((item, index) => (
                                    <PaginationItem key={index}>
                                      {item === '...' ? (
                                        <PaginationEllipsis />
                                      ) : (
                                        <PaginationLink
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handlePayLogPageChange(item as number);
                                          }}
                                          isActive={item === payLogCurrentPage}
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
                                        handlePayLogPageChange(payLogCurrentPage + 1);
                                      }}
                                      className={payLogCurrentPage >= payLogTotalPages ? 'pointer-events-none opacity-50' : ''}
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
                            <span className="text-muted-foreground text-3xl">💳</span>
                          </div>
                          <p className="text-muted-foreground font-medium text-lg">No payment records yet</p>
                          <p className="text-muted-foreground/60 text-sm mt-1">Your payment history will appear here</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
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
                  <DialogContent 
                    className="max-h-[85vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted/80 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted"
                    style={{ 
                      width: 'min(98vw, 1200px)',
                      maxWidth: 'min(98vw, 1200px)',
                      minWidth: '360px'
                    }}
                  >
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
                          {/* Points Log Table */}
                          <div className={dialogTable.wrapper}>
                            <table className={dialogTable.table} style={{ minWidth: '600px' }}>
                              <thead>
                                <tr className="border-b border-border">
                                  <th className={`${dialogTable.headCell} w-1/3`}>Type</th>
                                  <th className={`${dialogTable.headCell} w-1/6`}>Points</th>
                                  <th className={`${dialogTable.headCell} w-1/2`}>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {timesLogList.map((item) => (
                                  <tr key={item.id} className={dialogTable.row}>
                                    <td className={`${dialogTable.cell} text-card-foreground font-medium`}>{formatChangeType(item.change_type)}</td>
                                    <td className={dialogTable.cell}>
                                      <span className={`${dialogTable.pillBase} font-bold ${item.use_limit > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {item.use_limit > 0 ? '+' : ''}{item.use_limit}
                                      </span>
                                    </td>
                                    <td className={`${dialogTable.cell} text-muted-foreground`}>{formatTimestamp(item.created_at)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
                          {/* Subscriptions Table */}
                          <div className={dialogTable.wrapper}>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className={`${dialogTable.headCell} w-1/4`}>Plan</th>
                                    <th className={`${dialogTable.headCell} w-1/6`}>Status</th>
                                    <th className={`${dialogTable.headCell} w-1/6`}>Price</th>
                                    <th className={`${dialogTable.headCell} w-1/6 hidden lg:table-cell`}>ID</th>
                                    <th className={`${dialogTable.headCell} w-1/6 hidden xl:table-cell`}>Started</th>
                                    <th className={`${dialogTable.headCell} w-1/6`}>Limit</th>
                                    <th className={`${dialogTable.headCell} w-1/6`}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subscriptionList.map((subscription) => (
                                    <tr key={subscription.id} className={dialogTable.row}>
                                      <td className={`${dialogTable.cell} text-card-foreground font-medium`}>{subscription.price_info.name}</td>
                                      <td className={dialogTable.cell}>
                                        <span className={`${dialogTable.pillBase} bg-green-500/20 text-green-400`}>
                                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                          Active
                                        </span>
                                      </td>
                                      <td className={`${dialogTable.cell} text-card-foreground font-semibold`}>{formatPrice(subscription.price_info.price)}</td>
                                      <td className={`${dialogTable.cell} ${dialogTable.mono} hidden lg:table-cell`}>{subscription.subscription_id.slice(-8)}</td>
                                      <td className={`${dialogTable.cell} text-muted-foreground hidden xl:table-cell`}>{formatTimestamp(subscription.created_at)}</td>
                                      <td className={`${dialogTable.cell} text-card-foreground font-semibold`}>{subscription.price_info.usage_limit === 999999 ? '∞' : subscription.price_info.usage_limit}</td>
                                      <td className={dialogTable.cell}>
                                        <Button
                                          variant={subscription.price_info.button_text === 'Contact Sales' ? 'outline' : 'destructive'}
                                          size="sm"
                                          onClick={() => handleCancelSubscription(subscription.id)}
                                          disabled={cancellingSubscriptionId === subscription.id || subscription.price_info.button_text === 'Contact Sales'}
                                          className={`text-sm px-4 py-2 h-8 ${subscription.price_info.button_text === 'Contact Sales' ? 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-60' : ''}`}
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

                {/* 发票创建对话框（简单版） */}
                <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold text-card-foreground">Create Invoice</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Choose invoice type and generate your invoice.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex border-b border-border mt-6">
                      <button
                        onClick={() => setInvoiceType('personal')}
                        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${invoiceType === 'personal'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-card-foreground'
                          }`}
                        disabled={isCreatingInvoice}
                      >
                        Personal Invoice
                      </button>
                      <button
                        onClick={() => setInvoiceType('business')}
                        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${invoiceType === 'business'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-card-foreground'
                          }`}
                        disabled={isCreatingInvoice}
                      >
                        Business Invoice
                      </button>
                    </div>

                    {invoiceType === 'business' ? (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Enter your company name"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          disabled={isCreatingInvoice}
                        />
                      </div>
                    ) : (
                      <div className="mt-6 p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                        Personal Invoice: Click Create Invoice to download.
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsInvoiceDialogOpen(false);
                          setSelectedPayLogId(null);
                          setInvoiceType('personal');
                          setCompanyName('');
                        }}
                        disabled={isCreatingInvoice}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateInvoice} disabled={isCreatingInvoice} className="flex items-center gap-2">
                        {isCreatingInvoice ? (
                          <>
                            <ReloadIcon className="h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Invoice'
                        )}
                      </Button>
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
                      .filter(item => item.status === 0 || item.status === 1 || (item.status === -1 && item.generate_image === ''))
                      .map((item) => {
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

        {/* 视频详情弹窗 */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent 
            className="max-w-[95vw] w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted"
          >
            <DialogHeader className="pb-4 border-b border-border">
              <DialogTitle className="text-2xl font-semibold text-card-foreground">Video Details</DialogTitle>
            </DialogHeader>

            {selectedVideoDetail && (
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：视频播放器 */}
                <div className="flex flex-col justify-center space-y-3">
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                    <video
                      src={selectedVideoDetail.generate_image}
                      controls
                      className="w-full h-full"
                      playsInline
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* 下载和分享按钮 */}
                  <div className="flex gap-2">
                    {/* 下载按钮 */}
                    <Button
                      onClick={() => downloadMediaWithCors(
                        selectedVideoDetail.generate_image, 
                        `video-${selectedVideoDetail.id}.mp4`, 
                        setIsDownloading, 
                        selectedVideoDetail.id, 
                        toast.showToast
                      )}
                      className="flex-1 flex items-center justify-center gap-2"
                      disabled={isDownloading === selectedVideoDetail.id}
                    >
                      {isDownloading === selectedVideoDetail.id ? (
                        <>
                          <ReloadIcon className="h-4 w-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>

                    {/* 分享按钮组 */}
                    <div className="flex gap-2">
                      {/* Twitter */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => shareToSocial(selectedVideoDetail.task_id, 'twitter')}
                        title="Share to Twitter"
                        className="hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </Button>

                      {/* Facebook */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => shareToSocial(selectedVideoDetail.task_id, 'facebook')}
                        title="Share to Facebook"
                        className="hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </Button>

                      {/* WhatsApp */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => shareToSocial(selectedVideoDetail.task_id, 'whatsapp')}
                        title="Share to WhatsApp"
                        className="hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 右侧：详细信息 */}
                <div className="space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted">
                  {/* Created At */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Created At</h3>
                    <p className="text-card-foreground text-sm">{formatTimestamp(selectedVideoDetail.created_at)}</p>
                  </div>

                  {/* Resolution & Generation Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Resolution</h3>
                      <p className="text-card-foreground font-medium text-sm">
                        {selectedVideoDetail.size_image ? 
                          (() => {
                            const resolutionMatch = selectedVideoDetail.size_image.match(/resolution:\s*([^\s;]+)/i);
                            return resolutionMatch ? resolutionMatch[1].trim() : 'N/A';
                          })() 
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Generation Time</h3>
                      <p className="text-card-foreground text-sm">{selectedVideoDetail.generation_time || 0} seconds</p>
                    </div>
                  </div>

                  {/* Prompt */}
                  {selectedVideoDetail.prompt && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Prompt</h3>
                      <div className="max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
                        <p className="text-card-foreground text-sm whitespace-pre-wrap">{selectedVideoDetail.prompt}</p>
                      </div>
                    </div>
                  )}

                  {/* Origin Image/Video */}
                  {selectedVideoDetail.origin_image && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Original Media</h3>
                      <div className="mt-2 rounded-lg overflow-hidden bg-slate-900">
                        {selectedVideoDetail.origin_image.match(/\.(mp4|webm|mov)$/i) ? (
                          <video
                            src={selectedVideoDetail.origin_image}
                            controls
                            className="w-full max-h-40 object-contain"
                            playsInline
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <Image
                            src={selectedVideoDetail.origin_image}
                            alt="Original media"
                            width={400}
                            height={300}
                            className="w-full max-h-40 object-contain"
                            unoptimized
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Audio Files */}
                  {selectedVideoDetail.other_image && parseAudioUrls(selectedVideoDetail.other_image).length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Audio Files</h3>
                      <div className="space-y-2 mt-2">
                        {parseAudioUrls(selectedVideoDetail.other_image).map((audioUrl, index) => (
                          <div key={index} className="bg-slate-900 rounded-lg p-2.5">
                            <p className="text-xs text-muted-foreground mb-1.5">Audio {index + 1}</p>
                            <audio controls className="w-full h-8" preload="metadata">
                              <source src={audioUrl} type="audio/wav" />
                              <source src={audioUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      {invoiceData && (
        <InvoiceTemplate data={invoiceData} isVisible={showInvoicePreview} />
      )}
      <Footer friendlyLinks={friendlyLinks} />
    </div>
  );
} 
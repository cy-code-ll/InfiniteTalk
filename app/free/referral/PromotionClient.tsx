'use client';

import { useEffect, useMemo, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useUserInfo } from '@/lib/providers';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast-provider';
import { AuthButton } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Copy, Users, TrendingUp, Clock, Gift, RefreshCw, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Shared types
interface PromotionStatistics {
  promotion_user_count: number;
  promotion_user_score: number;
  promotion_user_score_pending: number;
  promotion_user_score_this_month: number;
}

interface PromotionLink {
  ivcode: string;
  promotion_link: string;
}

interface PromotionScoreLog {
  id: number;
  amount: number;
  user_id: number;
  from_user_id: number;
  score: number;
  status: number;
  status_msg: string;
  created_at: number;
  updated_at: number;
  status_text: string;
  from_user_email: string;
  from_user_nickname: string;
  from_user_avatar: string;
}

interface PromotionUser {
  promotion_time: number;
  user_id: number;
  user_email: string;
  user_nickname: string;
  user_avatar: string;
  user_level: number;
  user_created_time: number;
  user_last_login_time: number;
}

interface WebsiteConfig {
  appid: string;
  prompt_word: string;
  success_url: string;
  cancel_url: string;
  status: number;
  promotion_socre_ratio: number; // percentage
  pay_methods: string[];
  describe: string;
}

const PLACEHOLDER = '***';

export default function PromotionClient() {
  const { userInfo } = useUserInfo();
  const { openSignIn } = useClerk();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [promotionLink, setPromotionLink] = useState<PromotionLink | null>(null);
  const [statistics, setStatistics] = useState<PromotionStatistics | null>(null);
  const [scoreLog, setScoreLog] = useState<PromotionScoreLog[]>([]);
  const [promotionUsers, setPromotionUsers] = useState<PromotionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [scorePage, setScorePage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [scoreLogTotal, setScoreLogTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);
  const [currentView, setCurrentView] = useState<'earnings' | 'users'>('earnings');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null);

  const isLoggedIn = Boolean(userInfo?.id);

  // Fetchers
  const fetchWebsiteConfig = async () => {
    try {
      const result = await api.website.getConfig();
      if (result.code === 200) {
        setWebsiteConfig(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch website config:', error);
      setWebsiteConfig({
        appid: 'ai_outfit',
        prompt_word: '',
        success_url: '',
        cancel_url: '',
        status: 1,
        promotion_socre_ratio: 10,
        pay_methods: ['stripe'],
        describe: '',
      });
    }
  };

  const fetchPromotionLink = async () => {
    try {
      const result = await api.user.getPromotionLink();
      if (result.code === 200) {
        setPromotionLink(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch promotion link:', error);
      showErrorToast('Failed to fetch promotion link');
    }
  };

  const fetchPromotionStatistics = async () => {
    try {
      const result = await api.user.getPromotionStatistics();
      if (result.code === 200) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch promotion statistics:', error);
      showErrorToast('Failed to fetch promotion statistics');
    }
  };

  const fetchPromotionScoreLog = async (page: number = 1, status?: number) => {
    try {
      const result = await api.user.getPromotionScoreLog(page, 10, status);
      if (result.code === 200) {
        setScoreLog(result.data.list);
        setScoreLogTotal(result.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch promotion score log:', error);
      showErrorToast('Failed to fetch promotion score log');
    }
  };

  const fetchPromotionUsers = async (page: number = 1) => {
    try {
      const result = await api.user.getPromotionUsers(page, 10);
      if (result.code === 200) {
        setPromotionUsers(result.data.list);
        setUsersTotal(result.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch promotion users:', error);
      showErrorToast('Failed to fetch promotion users');
    }
  };

  // Pagination handlers
  const handleUsersPageChange = (page: number) => {
    setUsersPage(page);
    if (isLoggedIn) fetchPromotionUsers(page);
  };

  const handleTabChange = (value: 'all' | 'pending' | 'completed') => {
    setActiveTab(value);
    const statusMap: Record<string, number | undefined> = {
      all: undefined,
      pending: 0,
      completed: 1,
    };
    setScorePage(1);
    if (isLoggedIn) fetchPromotionScoreLog(1, statusMap[value]);
  };

  const handlePageChange = (page: number) => {
    setScorePage(page);
    const statusMap: Record<string, number | undefined> = {
      all: undefined,
      pending: 0,
      completed: 1,
    };
    if (isLoggedIn) fetchPromotionScoreLog(page, statusMap[activeTab]);
  };

  // Refresh handlers
  const refreshPromotionScoreLog = async () => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }
    setIsRefreshing(true);
    setLoading(true);
    const statusMap: Record<string, number | undefined> = {
      all: undefined,
      pending: 0,
      completed: 1,
    };
    await fetchPromotionScoreLog(scorePage, statusMap[activeTab]);
    setLoading(false);
    setIsRefreshing(false);
  };

  const refreshPromotionUsers = async () => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }
    setIsRefreshing(true);
    await fetchPromotionUsers(usersPage);
    setIsRefreshing(false);
  };

  // Copy link
  const copyPromotionLink = async () => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }
    if (!promotionLink) return;
    try {
      await navigator.clipboard.writeText(promotionLink.promotion_link);
      showSuccessToast('Promotion link copied successfully!');
    } catch (error) {
      console.error('Failed to copy:', error);
      showErrorToast('Failed to copy, please copy manually');
    }
  };

  // Utils
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });1
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case -1:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Completed';
      case 0:
        return 'Pending';
      case -1:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const promotionRatioDisplay = useMemo(() => {
    if (!websiteConfig) return PLACEHOLDER;
    if (typeof websiteConfig.promotion_socre_ratio === 'number') {
      return `${websiteConfig.promotion_socre_ratio}%`;
    }
    return PLACEHOLDER;
  }, [websiteConfig]);

  // Initial load
  useEffect(() => {
    // Always load website config (public)
    fetchWebsiteConfig();
  }, []);

  // Load user-related data after login
  useEffect(() => {
    if (!isLoggedIn) {
      setPromotionLink(null);
      setStatistics(null);
      setScoreLog([]);
      setPromotionUsers([]);
      setScoreLogTotal(0);
      setUsersTotal(0);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchPromotionLink(),
        fetchPromotionStatistics(),
        fetchPromotionScoreLog(1, undefined),
        fetchPromotionUsers(1),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, [isLoggedIn]);

  // Placeholder rows for SSR and not logged-in state
  const placeholderScoreLogs: PromotionScoreLog[] = useMemo(() => {
    return Array.from({ length: 3 }).map((_, idx) => ({
      id: idx + 1,
      amount: 0,
      user_id: 0,
      from_user_id: 0,
      score: 0,
      status: 0,
      status_msg: '',
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      status_text: '',
      from_user_email: PLACEHOLDER,
      from_user_nickname: PLACEHOLDER,
      from_user_avatar: '',
    }));
  }, []);

  const placeholderUsers: PromotionUser[] = useMemo(() => {
    return Array.from({ length: 3 }).map((_, idx) => ({
      promotion_time: Math.floor(Date.now() / 1000),
      user_id: idx + 1,
      user_email: PLACEHOLDER,
      user_nickname: PLACEHOLDER,
      user_avatar: '',
      user_level: 0,
      user_created_time: Math.floor(Date.now() / 1000),
      user_last_login_time: Math.floor(Date.now() / 1000),
    }));
  }, []);

  const displayScoreLogs = isLoggedIn ? scoreLog : placeholderScoreLogs;
  const displayUsers = isLoggedIn ? promotionUsers : placeholderUsers;

  return (
    <>
      <div className="container mx-auto px-4 pt-24 pb-0 relative">
        <div className="mb-12">
          <nav className="flex items-center space-x-2 text-sm overflow-x-auto whitespace-nowrap">
            <Link 
              title="Seedance Pro"
              href="https://www.seedancepro.com/" 
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Seedance Pro
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <Link 
              title="Seedance 1.0 Pro AI Video Generator"
              href="/seedance" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              <span className="hidden sm:inline">Seedance 1.0 Pro AI Video Generator</span>
              <span className="inline sm:hidden">Seedance 1.0 Pro AI Video Generator</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <Link 
              title="Seedance 1.0 Pro AI Video Generator for Free"
              href="/seedance/free" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              <span className="hidden sm:inline">Seedance 1.0 Pro AI Video Generator for Free</span>
              <span className="inline sm:hidden">Seedance 1.0 Pro AI Video Generator for Free</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-100 font-medium">
              Seedance 1.0 Pro Referral
            </span>
          </nav>
        </div>
      </div>
      <div className="container mx-auto px-4 py-0 pb-30 max-w-6xl">
        <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Referral Center</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Seedance 1.0 Pro AI Video Generator for Free By Referral</h2>
        <p className="text-foreground">
          Share your personal referral link. When someone signs up and makes a payment through your link, you’ll earn {promotionRatioDisplay} back in credits.
        </p>
      </div>

      <Card className="mb-8 border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Gift className="h-5 w-5 text-primary" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-foreground font-medium leading-relaxed">Earn {promotionRatioDisplay} of each referred user’s payment as credits</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-foreground font-medium leading-relaxed">Credits are added to your account after manual review (usually within 24 hours of payment)</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-foreground font-medium leading-relaxed">Track your referrals and rewards anytime in your dashboard</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Your Referral Link</CardTitle>
          <CardDescription className="text-muted-foreground">
            Referral Code: {isLoggedIn ? (promotionLink?.ivcode || PLACEHOLDER) : PLACEHOLDER} | Earn {promotionRatioDisplay} credits for every successful referral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex-1 font-mono text-sm break-all text-foreground">
              {isLoggedIn ? (promotionLink?.promotion_link || PLACEHOLDER) : PLACEHOLDER}
            </div>
            <Button 
              onClick={copyPromotionLink}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          className="cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
          onClick={() => setCurrentView('users')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invited Users</p>
                <p className="text-2xl font-bold text-foreground">{isLoggedIn ? (statistics?.promotion_user_count ?? 0) : PLACEHOLDER}</p>
                <p className="text-xs text-blue-500 font-medium mt-1">Click to view users</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-green-500/50 hover:shadow-lg transition-all duration-300"
          onClick={() => setCurrentView('earnings')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Earned</p>
                <p className="text-2xl font-bold text-foreground">{isLoggedIn ? (statistics?.promotion_user_score ?? 0) : PLACEHOLDER}</p>
                <p className="text-xs text-green-500 font-medium mt-1">Click to view earnings</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits This Month</p>
                <p className="text-2xl font-bold text-foreground">{isLoggedIn ? (statistics?.promotion_user_score_this_month ?? 0) : PLACEHOLDER}</p>
              </div>
              <Gift className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Pending</p>
                <p className="text-2xl font-bold text-foreground">{isLoggedIn ? (statistics?.promotion_user_score_pending ?? 0) : PLACEHOLDER}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">
                {currentView === 'earnings' ? 'Referral History' : 'Referral Users List'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {currentView === 'earnings' 
                  ? 'View your referral earnings. Credits will be added to your account within 24 hours after the referred user completes payment'
                  : 'View all users who registered through your referral link'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={currentView === 'earnings' ? refreshPromotionScoreLog : refreshPromotionUsers}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isRefreshing || loading}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => setCurrentView(currentView === 'earnings' ? 'users' : 'earnings')}
                variant="outline"
                size="sm"
              >
                {currentView === 'earnings' ? 'View Users' : 'View Earnings'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentView === 'earnings' ? (
            <div className="w-full">
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid grid-cols-3 w-full">
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === 'all' ? 'bg-background text-foreground shadow-sm' : ''
                  }`}
                  onClick={() => handleTabChange('all')}
                >
                  All
                </button>
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === 'completed' ? 'bg-background text-foreground shadow-sm' : ''
                  }`}
                  onClick={() => handleTabChange('completed')}
                >
                  Approved
                </button>
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === 'pending' ? 'bg-background text-foreground shadow-sm' : ''
                  }`}
                  onClick={() => handleTabChange('pending')}
                >
                  Pending
                </button>
              </div>
              <div className="mt-6">
                {loading && isLoggedIn ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                  </div>
                ) : displayScoreLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No earnings records yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayScoreLogs.map((log, idx) => (
                      <div key={`${log.id}-${idx}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={isLoggedIn ? log.from_user_avatar : ''} alt={isLoggedIn ? log.from_user_nickname : 'placeholder'} />
                            <AvatarFallback>{isLoggedIn ? log.from_user_nickname.charAt(0) : '*'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{isLoggedIn ? log.from_user_nickname : PLACEHOLDER}</span>
                              <Badge variant="outline" className="text-xs">
                                {isLoggedIn ? log.from_user_email : PLACEHOLDER}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isLoggedIn ? (
                                <>Payment Amount: ${log.amount} | Credits Earned: {log.score}</>
                              ) : (
                                <>Payment Amount: {PLACEHOLDER} | Credits Earned: {PLACEHOLDER}</>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isLoggedIn ? formatTime(log.created_at) : PLACEHOLDER}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={isLoggedIn ? getStatusColor(log.status) : 'bg-gray-100 text-gray-800'}>
                            {isLoggedIn ? getStatusText(log.status) : PLACEHOLDER}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isLoggedIn ? `+${log.score} credits` : `${PLACEHOLDER} credits`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="mt-6">
                {loading && isLoggedIn ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                  </div>
                ) : displayUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No referred users yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayUsers.map((user, idx) => (
                      <div key={`${user.user_id}-${idx}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={isLoggedIn ? user.user_avatar : ''} alt={isLoggedIn ? user.user_nickname : 'placeholder'} />
                            <AvatarFallback>{isLoggedIn ? user.user_nickname.charAt(0) : '*'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-lg text-foreground">{isLoggedIn ? user.user_nickname : PLACEHOLDER}</span>
                              <Badge variant="outline" className="text-xs">
                                {isLoggedIn ? `Level ${user.user_level}` : PLACEHOLDER}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{isLoggedIn ? user.user_email : PLACEHOLDER}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {isLoggedIn ? formatTime(user.user_created_time) : PLACEHOLDER}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Promoted: {isLoggedIn ? formatTime(user.promotion_time) : PLACEHOLDER}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last Login: {isLoggedIn ? formatTime(user.user_last_login_time) : PLACEHOLDER}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      const currentPage = currentView === 'earnings' ? scorePage : usersPage;
                      if (currentPage > 1) {
                        if (currentView === 'earnings') {
                          handlePageChange(currentPage - 1);
                        } else {
                          handleUsersPageChange(currentPage - 1);
                        }
                      }
                    }}
                    className={
                      (currentView === 'earnings' ? scorePage : usersPage) === 1 
                        ? 'pointer-events-none opacity-50' 
                        : ''
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    {currentView === 'earnings' ? scorePage : usersPage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      const currentPage = currentView === 'earnings' ? scorePage : usersPage;
                      const totalPages = currentView === 'earnings' ? Math.ceil(scoreLogTotal / 10) : Math.ceil(usersTotal / 10);
                      if (currentPage < Math.max(1, totalPages)) {
                        if (currentView === 'earnings') {
                          handlePageChange(currentPage + 1);
                        } else {
                          handleUsersPageChange(currentPage + 1);
                        }
                      }
                    }}
                    className={
                      (currentView === 'earnings' ? scorePage : usersPage) >= Math.max(1, currentView === 'earnings' ? Math.ceil(scoreLogTotal / 10) : Math.ceil(usersTotal / 10))
                        ? 'pointer-events-none opacity-50' 
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Sign-in helper for users who are not logged in */}
      {!isLoggedIn && (
        <div className="mt-10 flex justify-center">
          <AuthButton />
        </div>
      )}
      </div>
    </>
  );
}



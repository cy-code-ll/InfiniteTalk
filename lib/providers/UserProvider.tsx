'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { api } from '../api';
import { useToast } from '@/components/ui/toast-provider';

export interface UserInfo {
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
  total_credits: number; // 计算字段：free_limit + remaining_limit
}

interface UserContextType {
  userInfo: UserInfo | null;
  isLoadingUserInfo: boolean;
  refreshUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

// 全局同步状态，避免重复同步
const globalSyncStatus: { [userId: string]: boolean } = {};

export function UserProvider({ children }: UserProviderProps) {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const { error: showErrorToast } = useToast();

  // 同步用户数据到后端
  const syncUserToBackend = async () => {
    console.log('User________________', user);
    if (!isSignedIn || !user?.id || !user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    const userId = user.id;
    
    // 避免重复同步
    if (globalSyncStatus[userId]) {
      return;
    }

    globalSyncStatus[userId] = true;

    try {
      // 获取 Clerk JWT token，添加错误处理
      let clerkToken: string | null = null;
      try {
        clerkToken = await getToken();
        console.log('Clerk Token 获取成功:', clerkToken ? 'Token已获取' : 'Token为空');
        // console.log('Clerk Token:', clerkToken);
      } catch (tokenError) {
        console.error('获取 Clerk Token 失败，清除登录状态:', tokenError);
        // 清除同步状态
        delete globalSyncStatus[userId];
        // 清除用户信息
        setUserInfo(null);
        // 清除tokens
        api.auth.clearTokens();
        // 显示错误提示
        showErrorToast('Failed to get user token, please sign in again');
        // 退出登录状态
        try {
          await signOut();
          console.log('UserProvider: Token获取失败，已清除登录状态');
        } catch (signOutError) {
          console.error('UserProvider: 清除登录状态失败:', signOutError);
        }
        return;
      }

      // 如果没有获取到有效的 token，清除登录状态
      if (!clerkToken) {
        console.warn('Clerk Token 为空，清除登录状态');
        // 清除同步状态
        delete globalSyncStatus[userId];
        // 清除用户信息
        setUserInfo(null);
        // 清除tokens
        api.auth.clearTokens();
        // 显示错误提示
        showErrorToast('User token is empty, please sign in again');
        // 退出登录状态
        try {
          await signOut();
          console.log('UserProvider: Token为空，已清除登录状态');
        } catch (signOutError) {
          console.error('UserProvider: 清除登录状态失败:', signOutError);
        }
        return;
      }

      const userData = {
        uuid: userId,
        email: user.primaryEmailAddress.emailAddress,
        nickname: user.fullName || undefined,
        avatar: user.imageUrl || undefined,
        from_login: "google",
        token: clerkToken // API期望的字段名是token
      };

      console.log('UserProvider: 开始同步用户数据', {
        ...userData,
        token: '***' // 安全起见，不在日志中显示完整token
      });
      
      const responseData = await api.auth.syncUser(userData);
      console.log('UserProvider: 用户数据同步成功', responseData);
      
      // 验证同步结果
      if (!responseData || responseData.code !== 200) {
        throw new Error(`Sync failed: ${responseData?.message || responseData?.msg || 'Unknown error'}`);
      }
      
      // 验证返回的token数据
      if (!responseData.data?.access_token) {
        throw new Error('Sync succeeded but no access_token received');
      }
      
      console.log('UserProvider: 用户数据同步成功，Token已保存');
      
      // 同步成功后立即获取用户信息
      await fetchUserInfo(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('UserProvider: 用户数据同步失败，清除登录状态', {
        error: errorMessage,
        userId,
        email: user.primaryEmailAddress.emailAddress,
        timestamp: new Date().toISOString()
      });
      
      // 清除同步状态
      delete globalSyncStatus[userId];
      
      // 清除用户信息
      setUserInfo(null);
      
      // 清除tokens
      api.auth.clearTokens();
      
      // 显示错误提示
      showErrorToast(`Failed to sync user data, please sign in again: ${errorMessage}`);
      
      // 退出登录状态
      try {
        await signOut();
        console.log('UserProvider: 已清除登录状态');
      } catch (signOutError) {
        console.error('UserProvider: 清除登录状态失败:', signOutError);
      }
      
      return; // 直接退出，不再执行后续逻辑
    }
  };

  const fetchUserInfo = async (isInitialLoad = false) => {
    if (!isSignedIn || !user?.id) {
      setUserInfo(null);
      return;
    }
    
    // 检查token是否可用
    if (!api.auth.isTokenValid()) {
      console.log('Token not available yet, waiting...');
      return;
    }
    
    // 只在初始加载时显示loading
    if (isInitialLoad) {
    setIsLoadingUserInfo(true);
    }
    
    try {
      const result = await api.user.getUserInfo();
      
      if (result.code === 200 && result.data) {
        const userInfoData: UserInfo = {
          uuid: result.data.uuid,
          email: result.data.email,
          from_login: result.data.from_login,
          nickname: result.data.nickname,
          avatar: result.data.avatar,
          free_limit: result.data.free_limit,
          remaining_limit: result.data.remaining_limit,
          total_limit: result.data.total_limit,
          use_limit: result.data.use_limit,
          vip_last_time: result.data.vip_last_time,
          level: result.data.level,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          status: result.data.status,
          id: result.data.id,
          total_credits: result.data.free_limit + result.data.remaining_limit
        };
        setUserInfo(userInfoData);
      } else {
        console.warn("User info API returned success code but no data for:", user.id);
        setUserInfo(null);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      setUserInfo(null);
      // 只在初始加载时显示错误提示，避免频繁弹窗
      if (isInitialLoad) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user info';
        showErrorToast(errorMessage);
      }
    } finally {
      // 只在初始加载时才设置loading为false
      if (isInitialLoad) {
      setIsLoadingUserInfo(false);
      }
    }
  };

  const refreshUserInfo = async () => {
    await fetchUserInfo(true);
  };

  // 用户登录状态变化时，先同步用户数据，再获取用户信息
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // 清空之前的用户信息
      setUserInfo(null);
      
      // 先同步用户数据，确保token可用
      syncUserToBackend();
    } else {
      // 用户未登录时清空信息和同步状态
      setUserInfo(null);
      if (user?.id) {
        delete globalSyncStatus[user.id];
      }
    }
  }, [isSignedIn, user?.id]);

  // 设置定时器，每10秒更新一次用户信息（仅在有token时）
  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    const intervalId = setInterval(() => {
      if (api.auth.isTokenValid()) {
        fetchUserInfo(false); // 后续刷新，不是初始加载
      }
    }, 10000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, [isSignedIn, user?.id]);

  const value: UserContextType = {
    userInfo,
    isLoadingUserInfo,
    refreshUserInfo,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserInfo() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserProvider');
  }
  return context;
} 
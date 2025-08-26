// API 基础配置
const API_CONFIG = {
  VIDOR_AI_BASE: 'https://svc.seedancepro.com',
  APP_ID: 'seedance',
};

// 通用请求头
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-appid': API_CONFIG.APP_ID,
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// 通用错误处理
const handleApiError = async (response: Response) => {
  // 首先检查 HTTP 状态码
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP Error ${response.status}: ${errorData || response.statusText}`);
  }
  
  // 解析 JSON 响应
  const result = await response.json();
  
  // 检查业务错误码
  if (result.code && result.code !== 200) {
    throw new Error(`API Business Error ${result.code}: ${result.message || result.msg || 'Unknown error'}`);
  }
  
  return result;
};

// 用户认证相关接口
export const authApi = {
  // 用户登录同步接口
  syncUser: async (userData: {
    uuid: string;
    email: string;
    token: string;
    nickname?: string;
    avatar?: string;
    from_login: string;
  }) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const endpoint = isDevelopment ? 'loginAuthCyTest' : 'loginAuth';
    
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/user/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(false), // 登录接口不需要Authorization
      body: JSON.stringify(userData),
    });

    const result = await handleApiError(response);
    
    // 保存token到localStorage
    if (result.code === 200 && result.data) {
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);
      localStorage.setItem('token_expire_at', result.data.expire_at.toString());
    }
    
    return result;
  },

  // 检查token是否有效
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('access_token');
    const expireAt = localStorage.getItem('token_expire_at');
    
    if (!token || !expireAt) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return parseInt(expireAt) > currentTime;
  },

  // 清除token
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expire_at');
  },
};

// 用户信息相关接口
export const userApi = {
  // 获取用户信息
  getUserInfo: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/user/info`, {
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 获取用户作品列表
  getUserOpusList: async (page: number = 1, pageSize: number = 30) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/user/opus_list?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleApiError(response);
  },

  // 获取用户积分记录
  getTimesLog: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/user/times_log?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleApiError(response);
  },
};

// 支付相关接口
export const paymentApi = {
  // 创建PayPal支付会话
  createPaypalSession: async (priceId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/paypal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        price_id: priceId,
      }),
    });

    return handleApiError(response);
  },

  // 获取订阅记录
  getSubscriptions: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/subscriptions`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 取消订阅
  cancelSubscription: async (id: number) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/subscription/cancel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id: id,
      }),
    });

    return handleApiError(response);
  },
};

// 视频生成相关接口
export const videoApi = {
  // 文生视频接口
  textToVideo: async (params: {
    prompt: string;
    resolution: string;
    ratio: string;
    duration: number;
    framepersecond?: number;
  }) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/volcengine/text2video`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        prompt: params.prompt,
        resolution: params.resolution,
        ratio: params.ratio,
        duration: params.duration,
        framepersecond: params.framepersecond || 24,
      }),
    });

    return handleApiError(response);
  },

  // 图生视频接口
  imageToVideo: async (params: {
    prompt: string;
    resolution: string;
    duration: number;
    framepersecond?: number;
    file: File;
  }) => {
    console.log(params);
    const formData = new FormData();
    formData.append('prompt', params.prompt);
    formData.append('resolution', params.resolution);
    formData.append('duration', params.duration.toString());
    formData.append('framepersecond', (params.framepersecond || 24).toString());
    formData.append('image_file', params.file);

    console.log(formData);

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/volcengine/img2video`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

  // 检查任务状态接口
  checkTaskStatus: async (taskId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/volcengine/check_task_status?task_id=${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 轮询检查任务状态，直到完成或失败
  pollTaskStatus: async (
    taskId: string,
    onProgress?: (progress: number, statusMsg: string) => void
  ): Promise<{ video_url: string; status: number; status_msg: string }> => {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = await videoApi.checkTaskStatus(taskId);
          
          if (result.code !== 200) {
            reject(new Error(result.msg || 'Task check failed'));
            return;
          }

          const { status, status_msg, video_url, progress } = result.data;
          
          // 更新进度
          if (onProgress) {
            const progressNum = parseFloat(progress) * 100;
            onProgress(progressNum, status_msg);
          }

          if (status === 1) {
            // 任务完成
            resolve({
              video_url: video_url,
              status,
              status_msg
            });
          } else if (status === -1) {
            // 任务失败
            reject(new Error(status_msg || 'Task failed'));
          } else {
            // 任务进行中，2秒后继续轮询
            setTimeout(poll, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  },
};

// CMS相关接口
export const cmsApi = {
  // 获取友情链接列表（客户端版本）
  getFriendLinkList: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/cms/friendLinkList`, {
      method: 'GET',
      headers: getHeaders(false), // 不需要认证
    });

    return handleApiError(response);
  },
};

// 重新导出FriendLink类型以保持兼容性
export type { FriendLink } from './server-api';

// 带重试机制的API调用（用于依赖token的接口）
export const apiWithRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // 如果没有token，等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return await apiCall();
    } catch (error) {
      console.error(`API call failed (attempt ${i + 1}/${maxRetries}):`, error);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('API call failed after maximum retries');
};

// 导出所有API
export const api = {
  auth: authApi,
  user: userApi,
  payment: paymentApi,
  video: videoApi,
  cms: cmsApi,
  withRetry: apiWithRetry,
}; 
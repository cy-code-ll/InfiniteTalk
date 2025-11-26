// API 基础配置
const API_CONFIG = {
  VIDOR_AI_BASE: 'https://svc.infinitetalk.net',
  APP_ID: 'infinitetalk',
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
    throw new Error(`${result.message || result.msg || 'Unknown error'}`);
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
    ivcode?: string;
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
  // 获取用户支付记录（为与页面调用保持一致）
  getPayLog: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/user/pay_log?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleApiError(response);
  },
  // 删除用户作品
  deleteOpus: async (opusId: number) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/opus/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        opus_id: opusId,
      }),
    });

    return handleApiError(response);
  },
  // 获取推广链接
  getPromotionLink: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/user/promotion_link`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 获取推广统计数据
  getPromotionStatistics: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/user/promotion_statistics`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 获取推广收益明细
  getPromotionScoreLog: async (page: number = 1, pageSize: number = 10, status?: number) => {
    let url = `${API_CONFIG.VIDOR_AI_BASE}/api/user/promotion_score_log?page=${page}&page_size=${pageSize}`;
    if (status !== undefined) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 获取推广用户列表
  getPromotionUsers: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/user/promotion_users?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleApiError(response);
  },

  // 注销账户
  closeAccount: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/user/close_account`, {
      method: 'POST',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },
};

// 支付相关接口
export const paymentApi = {
  // 创建PayPal支付会话
  createPaypalSession: async (priceId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/stripe`, {
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

  // 获取支付记录（对齐 seedance 实现）
  getPayLog: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/user/pay_log?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

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

  // 创建发票（与 seedance 保持一致）
  createInvoice: async (params: {
    company_name: string;
    company_address?: string;
    pay_log_id: number;
  }) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/pay/create_invoice`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });

    return handleApiError(response);
  },
};

// 视频生成相关接口
export const videoApi = {


  // 数字人视频生成接口
  infiniteTalk: async (params: {
    image: File;
    audio: File;
    resolution: string;
    duration: number;
    prompt: string;
  }) => {
    const formData = new FormData();
    formData.append('image', params.image);
    formData.append('audio', params.audio);
    formData.append('resolution', params.resolution);
    formData.append('duration', params.duration.toString());
    formData.append('prompt', params.prompt);

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/wavespeedai/infinitetalk/wan`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

  // 轮询检查任务状态，直到完成或失败
  pollTaskStatus: async (
    taskId: string,
    abortController?: AbortController
  ): Promise<{ video_url: string; status: number; status_msg: string }> => {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;
      let isAborted = false;

      // 监听取消信号
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          isAborted = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          reject(new Error('Polling cancelled'));
        });
      }

      const poll = async () => {
        // 检查是否已取消
        if (isAborted || abortController?.signal.aborted) {
          return;
        }

        try {
          const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/infinitetalk/check_task?task_id=${taskId}`, {
            method: 'GET',
            headers: getHeaders(),
          });

          // 再次检查是否已取消
          if (isAborted || abortController?.signal.aborted) {
            return;
          }

          const result = await handleApiError(response);

          if (result.code !== 200) {
            reject(new Error(result.msg || 'Task check failed'));
            return;
          }

          const { status, status_msg, video_url } = result.data;

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
            timeoutId = setTimeout(poll, 2000);
          }
        } catch (error) {
          // 如果是取消错误，不重复抛出
          if (!isAborted && !abortController?.signal.aborted) {
            reject(error);
          }
        }
      };

      poll();
    });
  },
};

// InfiniteTalk相关接口
export const infiniteTalkApi = {
  // 创建InfiniteTalk任务
  createTask: async (params: {
    image: File;
    audio: File;
    prompt: string;
    duration: number;
    resolution: string;
    mask?: string;
  }) => {
    const formData = new FormData();
    formData.append('image', params.image);
    formData.append('audio', params.audio);
    formData.append('prompt', params.prompt);
    formData.append('duration', params.duration.toString());
    formData.append('resolution', params.resolution);

    // 如果有遮罩图，添加到FormData中
    if (params.mask) {
      formData.append('mask_image', params.mask);
    }

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/wavespeedai/infinitetalk`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

  // 检查InfiniteTalk任务状态
  checkTaskStatus: async (taskId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/wavespeedai/infinitetalk/check?task_id=${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
  },

  // 轮询检查InfiniteTalk任务状态
  pollTaskStatus: async (
    taskId: string,
    onProgress?: (progress: number, statusMsg: string) => void,
    abortController?: AbortController
  ): Promise<{ image_url: string; status: number; status_msg: string }> => {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;
      let isAborted = false;

      // 监听取消信号
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          isAborted = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          reject(new Error('Polling cancelled'));
        });
      }

      const poll = async () => {
        // 检查是否已取消
        if (isAborted || abortController?.signal.aborted) {
          return;
        }

        try {
          const result = await infiniteTalkApi.checkTaskStatus(taskId);

          // 再次检查是否已取消
          if (isAborted || abortController?.signal.aborted) {
            return;
          }

          if (result.code !== 200) {
            reject(new Error(result.msg || 'Task check failed'));
            return;
          }

          const { status, status_msg, image_url, progress } = result.data;

          // 更新进度
          if (onProgress) {
            const progressNum = parseFloat(progress) * 100;
            onProgress(progressNum, status_msg);
          }

          if (status === 1) {
            // 任务完成
            resolve({
              image_url: image_url,
              status,
              status_msg
            });
          } else if (status === -1) {
            // 任务失败
            reject(new Error(status_msg || 'Task failed'));
          } else {
            // 任务进行中，2秒后继续轮询
            timeoutId = setTimeout(poll, 2000);
          }
        } catch (error) {
          // 如果是取消错误，不重复抛出
          if (!isAborted && !abortController?.signal.aborted) {
            reject(error);
          }
        }
      };

      poll();
    });
  },

  // 创建Video To Video任务
  createVideoToVideoTask: async (params: {
    video: File;
    audio: File;
    prompt: string;
    duration: number;
    resolution: string;
    mask?: string;
  }) => {
    const formData = new FormData();
    formData.append('video', params.video);
    formData.append('audio', params.audio);
    formData.append('prompt', params.prompt);
    formData.append('duration', params.duration.toString());
    formData.append('resolution', params.resolution);

    // 如果有遮罩数据，添加到 FormData
    if (params.mask) {
      formData.append('mask', params.mask);
    }

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/wavespeedai/infinitetalk/video-to-video`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

  // 创建InfiniteTalk Multi任务
  createMultiTask: async (params: {
    image: File;
    prompt: string;
    left_audio: File;
    left_duration: number;
    right_audio: File;
    right_duration: number;
    order: 'meanwhile' | 'left_right' | 'right_left';
    resolution: '480p' | '720p' | '1080p';
  }) => {
    const formData = new FormData();
    formData.append('image', params.image);
    formData.append('prompt', params.prompt);
    formData.append('left_audio', params.left_audio);
    formData.append('left_duration', params.left_duration.toString());
    formData.append('right_audio', params.right_audio);
    formData.append('right_duration', params.right_duration.toString());
    formData.append('order', params.order);
    formData.append('resolution', params.resolution);

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/wavespeedai/infinitetalk/multi`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },

};

// 通用上传接口
export const uploadApi = {
  // 上传图片接口
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // 为FormData请求创建特殊的头部（不包含Content-Type，让浏览器自动设置）
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'x-appid': API_CONFIG.APP_ID,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/common/upload`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return handleApiError(response);
  },
};

// Nano Banana Edit 相关接口
export const nanoBananaApi = {
  // 创建 Nano Banana Edit 任务
  createTask: async (params: {
    prompt: string;
    image_urls: string[];
    output_format: "png" | "jpeg";
    image_size: "auto" | "1:1" | "3:4" | "9:16" | "4:3" | "16:9";
  }) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/kieai/nano-banana-edit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });

    return handleApiError(response);
  },

  // 检查 Nano Banana Edit 任务状态
  checkTaskStatus: async (taskId: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/task/kieai/nano-banana-edit/check_task_status?task_id=${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleApiError(response);
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

  // 博客点击统计
  trackBlogClick: async (url: string) => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/cms/statistics?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: getHeaders(false), // 不需要认证
    });

    return handleApiError(response);
  },
};

// 站点配置相关接口
export const websiteApi = {
  // 获取站点配置
  getConfig: async () => {
    const response = await fetch(`${API_CONFIG.VIDOR_AI_BASE}/api/website/config`, {
      method: 'GET',
      headers: getHeaders(false), // 不需要认证
    });

    return handleApiError(response);
  },

  // 获取公开作品列表
  getOpenOpusList: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(
      `${API_CONFIG.VIDOR_AI_BASE}/api/website/open/opus_list?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: getHeaders(false), // 不需要认证
      }
    );

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
  infiniteTalk: infiniteTalkApi,
  website: websiteApi,
  cms: cmsApi,
  upload: uploadApi,
  nanoBanana: nanoBananaApi,

  withRetry: apiWithRetry,
}; 
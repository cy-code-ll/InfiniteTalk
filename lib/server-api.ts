// 服务端专用API配置 - 不依赖localStorage
const SERVER_API_CONFIG = {
  VIDOR_AI_BASE: 'https://svc.seedancepro.com',
  APP_ID: 'seedance',
};

// 服务端专用请求头
const getServerHeaders = () => {
  return {
    'x-appid': SERVER_API_CONFIG.APP_ID,
  };
};

// 友情链接数据类型定义
export interface FriendLink {
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

// 博客文章数据类型定义
export interface BlogPost {
  id: number;
  title: string;
  keywords: string;
  content: string;
  abstract: string;
  thumb: string;
  class_id: number;
  status: number;
  is_top: number;
  appid: string;
  is_bright: number;
  created_time: number;
  sort: number;
  updated_time: number;
  url: string;
  seo_name: string;
  seo_desc: string;
}

// 博客列表响应类型
export interface BlogListResponse {
  list: BlogPost[];
  total: number;
  total_page: number;
}

// 通用错误处理
const handleServerApiError = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// 服务端专用CMS API
export const serverCmsApi = {
  // 获取友情链接列表（服务端专用）
  getFriendLinkList: async (): Promise<FriendLink[]> => {
    try {
      const response = await fetch(`${SERVER_API_CONFIG.VIDOR_AI_BASE}/api/cms/friendLinkList`, {
        method: 'GET',
        headers: getServerHeaders(),
        // 使用缓存并设置重新验证时间（1小时）
        next: { revalidate: 3600 },
      });

      const result = await handleServerApiError(response);
      // 检查API返回格式并提取data
      if (result.code === 200 && result.success && Array.isArray(result.data)) {
        console.log(`Server API: Successfully fetched ${result.data.length} friend links`);
        return result.data;
      }
      
      console.warn('Server API: Invalid response format', result);
      return [];
    } catch (error) {
      console.error('Server API: Failed to fetch friend links:', error);
      return [];
    }
  },

  // 获取博客文章列表（服务端专用）
  getBlogList: async (page: number = 1, pageSize: number = 10, classId: number = 0): Promise<BlogListResponse> => {
    try {
      const response = await fetch(
        `${SERVER_API_CONFIG.VIDOR_AI_BASE}/api/cms/blogList?page=${page}&page_size=${pageSize}&class_id=${classId}`,
        {
          method: 'GET',
          headers: getServerHeaders(),
          // 使用缓存并设置重新验证时间（1小时）
          next: { revalidate: 3600 },
        }
      );

      const result = await handleServerApiError(response);
      console.log('Blog API Response:', result);
      
      // 根据实际API返回格式处理数据
      if (result.code === 200 && result.success && result.data) {
        const blogData = result.data;
        
        // 检查数据结构：data.list 存在且为数组
        if (Array.isArray(blogData.list)) {
          console.log(`Server API: Successfully fetched ${blogData.list.length} blog articles`);
          return {
            list: blogData.list,
            total: blogData.total || 0,
            total_page: blogData.total_page || 1
          };
        }
      }
      
      console.warn('Server API: Invalid blog response format', result);
      return {
        list: [],
        total: 0,
        total_page: 1
      };
    } catch (error) {
      console.error('Server API: Failed to fetch blog list:', error);
      return {
        list: [],
        total: 0,
        total_page: 1
      };
    }
  },
}; 
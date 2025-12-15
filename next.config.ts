import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 性能优化
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@clerk/nextjs'],
    // 优化 CSS 处理 (需要安装 critters)
    optimizeCss: true,
  },
  // 服务器外部依赖（Next.js 15+ 新配置）
  serverExternalPackages: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  // 编译优化 - Next.js 15 默认使用 SWC，无需配置
  compiler: {
    // 移除 console.log（生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // 生产环境禁用 Source Maps（减少构建大小）
  productionBrowserSourceMaps: false,
  // 模块化导入 - 自动优化组件库导入
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
  },
  // Webpack 配置优化
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // 客户端包优化
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // 生产环境优化
    if (!dev) {
      // 优化代码分割
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // 分离大型依赖
            ffmpeg: {
              name: 'ffmpeg',
              test: /[\\/]node_modules[\\/](@ffmpeg)[\\/]/,
              priority: 40,
              reuseExistingChunk: true,
            },
            clerk: {
              name: 'clerk',
              test: /[\\/]node_modules[\\/](@clerk)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            lib: {
              name: 'lib',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  // 压缩优化
  compress: true,
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Headers 优化缓存
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*\\.(?:jpg|jpeg|png|gif|svg|webp|avif|ico|css|js)$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

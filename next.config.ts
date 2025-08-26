import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        // port: '', // 可选
        // pathname: '/**', // 可选, 允许所有路径
      },
      {
        protocol: 'https',
        hostname: 'cf.framepola.com',
        port: '', // 通常不需要指定端口
        pathname: '/**', // 允许该域名下的所有路径
      },
      // 如果有其他需要允许的域名，可以在这里继续添加
    ],
  },
};

export default nextConfig;

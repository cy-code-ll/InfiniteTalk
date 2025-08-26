# Next.js 基础模板

一个基于 Next.js 15 + TypeScript + Tailwind CSS 的现代化 Web 应用基础模板，集成了用户认证、博客系统、支付处理和 SEO 优化等核心功能。

## ✨ 功能特性

- 🚀 **Next.js 15** - 最新的 React 框架，支持 App Router
- 💎 **TypeScript** - 类型安全的开发体验
- 🎨 **Tailwind CSS** - 现代化的 CSS 框架
- 🔐 **Clerk 认证** - 完整的用户认证系统
- 🌐 **全局状态管理** - 基于 Context API 的用户信息管理
- 📝 **博客系统** - 支持 Markdown 的博客功能
- 💳 **支付集成** - 支付状态处理和用户积分系统
- 🔍 **SEO 优化** - 自动生成 sitemap 和 meta 标签
- 📱 **响应式设计** - 移动端友好的界面设计
- 🎯 **组件化架构** - 可复用的 UI 组件库

## 📁 项目结构

```
nest-template/
├── app/                        # Next.js App Router 目录
│   ├── globals.css            # 全局样式文件
│   ├── layout.tsx             # 根布局组件
│   ├── page.tsx               # 首页组件
│   ├── sitemap.ts             # sitemap 导出文件
│   ├── not-found.tsx          # 404 页面
│   ├── favicon.ico            # 网站图标
│   ├── blog/                  # 博客相关页面
│   │   ├── page.tsx           # 博客列表页
│   │   ├── [slug]/            # 动态博客文章页
│   │   └── data/              # 博客数据
│   ├── sign-in/               # 登录页面
│   ├── sign-up/               # 注册页面
│   ├── profile/               # 用户资料页
│   ├── terms/                 # 服务条款页
│   └── privacy/               # 隐私政策页
│
├── components/                 # 组件目录
│   ├── Navbar.tsx             # 导航栏组件
│   ├── Footer.tsx             # 页脚组件
│   ├── PricingSection.tsx     # 价格展示组件
│   ├── payment-status-modal.tsx # 支付状态弹窗
│   ├── ui/                    # UI 基础组件库
│   │   ├── button.tsx         # 按钮组件
│   │   ├── dialog.tsx         # 对话框组件
│   │   ├── dropdown-menu.tsx  # 下拉菜单组件
│   │   ├── sheet.tsx          # 侧边栏组件
│   │   └── ...                # 其他 UI 组件
│   └── auth/                  # 认证相关组件
│       ├── auth-button.tsx    # 认证按钮
│       └── clerk-provider.tsx # Clerk 认证提供者
│
├── lib/                       # 工具库目录
│   ├── providers/             # 全局状态管理 ✨
│   │   ├── index.ts          # 统一导出文件
│   │   ├── UserProvider.tsx  # 用户信息Provider
│   │   └── README.md         # Provider使用说明
│   ├── utils.ts              # 通用工具函数
│   ├── api.ts                # API 请求封装
│   ├── seo-config.js         # SEO 配置
│   └── sitemap.ts            # sitemap 生成逻辑
│
├── public/                    # 静态资源目录
│   └── js/                    # 第三方脚本文件
│
├── package.json              # 项目依赖配置
├── tailwind.config.js        # Tailwind CSS 配置
├── next.config.ts            # Next.js 配置
├── tsconfig.json             # TypeScript 配置
├── components.json           # shadcn/ui 组件配置
└── README.md                 # 项目说明文档
```

## 🔧 核心文件说明

### 应用入口
- **`app/layout.tsx`** - 根布局，包含全局字体、认证提供者、用户状态管理和 SEO 配置
- **`app/page.tsx`** - 网站首页
- **`app/globals.css`** - 全局样式和 Tailwind CSS 配置

### 组件系统
- **`components/Navbar.tsx`** - 响应式导航栏，集成用户认证和积分显示
- **`components/Footer.tsx`** - 网站页脚，包含导航链接和友情链接
- **`components/ui/`** - 基于 Radix UI 的组件库，使用 Tailwind CSS 样式

### 全局状态管理
- **`lib/providers/`** - 统一的状态管理目录
  - **`UserProvider.tsx`** - 用户信息全局管理，提供 `useUserInfo` hook
  - **`index.ts`** - 统一导出所有 Providers 和 hooks
  - **`README.md`** - 详细的使用说明和扩展指南

### 工具库
- **`lib/utils.ts`** - 包含 `cn()` 函数，用于合并 Tailwind CSS 类名
- **`lib/api.ts`** - 封装的 API 请求函数，处理认证和错误
- **`lib/seo-config.js`** - SEO 元数据配置，包含 OpenGraph 和 Twitter 卡片
- **`lib/sitemap.ts`** - 自动生成 sitemap.xml 的逻辑

### 认证系统
- 使用 **Clerk** 提供完整的用户认证功能
- 支持登录、注册、用户资料管理
- 集成用户积分系统和全局用户状态管理

## 🌐 全局状态管理特性

### UserProvider
提供全局用户信息管理功能：

```tsx
// 在任何组件中使用
import { useUserInfo } from '@/lib/providers';

function MyComponent() {
  const { userInfo, isLoadingUserInfo, refreshUserInfo } = useUserInfo();
  
  return (
    <div>
      <p>用户: {userInfo?.nickname}</p>
      <p>积分: {userInfo?.total_credits}</p>
      <button onClick={refreshUserInfo}>刷新</button>
    </div>
  );
}
```

**特性：**
- ✅ 自动获取用户信息（登录后）
- ✅ 定时更新（每60秒）
- ✅ 错误处理和重试机制
- ✅ 登录状态变化时自动更新
- ✅ 全局共享，避免重复请求
- ✅ 完整的 TypeScript 类型支持

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm / yarn / pnpm

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 环境配置

创建 `.env.local` 文件并配置必要的环境变量：

```bash
# Clerk 认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# 网站配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# API 配置
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 📝 主要技术栈

- **前端框架**: Next.js 15 (App Router)
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **状态管理**: Context API + Custom Hooks
- **UI 组件**: Radix UI + shadcn/ui
- **用户认证**: Clerk
- **图标库**: Lucide React
- **内容渲染**: React Markdown
- **日期处理**: date-fns
- **PDF 生成**: html2pdf.js

## 🎨 自定义配置

### 主题配置
在 `tailwind.config.js` 中自定义颜色、字体和其他设计令牌。

### SEO 配置
在 `lib/seo-config.js` 中修改网站的 meta 信息、OpenGraph 和 Twitter 卡片配置。

### 添加新的 Provider
按照 `lib/providers/README.md` 中的说明添加新的全局状态管理功能。

### 组件扩展
使用 shadcn/ui CLI 添加新的 UI 组件：

```bash
npx shadcn@latest add [component-name]
```

## 📦 构建和部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run start
```

### 部署到 Vercel

推荐使用 [Vercel Platform](https://vercel.com/new) 进行部署，它是 Next.js 的创建者提供的最佳部署平台。

查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多部署选项。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改善这个模板！

# 广告横幅组件文档

## 概述

本文档详细说明了 InfiniteTalk 项目中广告横幅（AdBanner）相关的组件功能，包括广告横幅组件和 Context 的实现逻辑、配置方式和使用方法。

## 核心组件

- **`components/adBanner/AdBanner.tsx`** - 广告横幅组件
- **`components/adBanner/AdBannerContext.tsx`** - 广告横幅 Context

---

## 1. 广告横幅 Context (AdBannerContext)

### 1.1 功能说明

`AdBannerContext` 提供了一个 React Context，用于在组件之间共享广告横幅的可见性状态和高度信息。这使得其他组件（如导航栏、内容包装器）可以根据广告横幅的状态动态调整自己的位置。

### 1.2 API

#### AdBannerProvider

Provider 组件，用于包裹需要使用广告横幅状态的组件树。

```typescript
<AdBannerProvider>
  {children}
</AdBannerProvider>
```

**Props:**
- `children: ReactNode` - 子组件

#### useAdBanner Hook

用于在组件中访问广告横幅状态的 Hook。

```typescript
const { 
  isAdBannerVisible, 
  adBannerHeight, 
  setAdBannerVisible, 
  setAdBannerHeight 
} = useAdBanner();
```

**返回值:**
- `isAdBannerVisible: boolean` - 广告横幅是否可见
- `adBannerHeight: number` - 广告横幅的高度（像素）
- `setAdBannerVisible: (visible: boolean) => void` - 设置广告横幅可见性
- `setAdBannerHeight: (height: number) => void` - 设置广告横幅高度

**错误处理:**
- 如果 Hook 在 `AdBannerProvider` 外部使用，会抛出错误：`"useAdBanner must be used within an AdBannerProvider"`

### 1.3 状态管理

Context 内部维护两个状态：
- `isAdBannerVisible`: 初始值为 `false`
- `adBannerHeight`: 初始值为 `0`

这些状态由 `AdBanner` 组件自动更新。

---

## 2. 广告横幅组件 (AdBanner)

### 2.1 功能说明

`AdBanner` 是一个粘性横幅组件，显示在页面顶部，用于展示广告内容。组件支持响应式设计，会根据屏幕尺寸显示不同的图片（移动端和桌面端）。

### 2.2 特性

- ✅ 响应式设计（移动端和桌面端使用不同图片）
- ✅ 自动计算并更新横幅高度
- ✅ 粘性定位，始终显示在页面顶部
- ✅ 支持页面路由控制（在 `/christmas` 页面不显示）
- ✅ 点击横幅跳转到 `/christmas` 页面
- ✅ 监听窗口大小变化，自动更新高度

### 2.3 图片资源

组件使用两个远程图片 URL：

- **桌面端图片**: `https://cfsource.infinitetalk.net/infinitetalk/banner.gif`
- **移动端图片**: `https://cfsource.infinitetalk.net/infinitetalk/bannershouji.gif`

### 2.4 显示逻辑

#### 显示条件

- 默认在所有页面显示
- **例外**: 在 `/christmas` 页面不显示

#### 高度计算

组件会自动计算横幅高度：

1. 当图片加载完成时，通过 `onLoad` 事件触发高度更新
2. 当窗口大小改变时，通过 `resize` 事件触发高度更新
3. 高度通过 `bannerRef.current.offsetHeight` 获取
4. 计算出的高度会通过 `setAdBannerHeight` 更新到 Context 中

#### 可见性控制

- 当路径为 `/christmas` 时，设置 `isAdBannerVisible = false` 和 `adBannerHeight = 0`
- 其他情况下，设置 `isAdBannerVisible = true`

### 2.5 样式配置

- **背景色**: `#760103`（深红色）
- **定位**: `sticky top-0`（粘性定位在顶部）
- **层级**: `z-[60]`（确保在其他元素之上）
- **响应式断点**: 
  - 移动端：`md:hidden`（中等屏幕以下显示移动端图片）
  - 桌面端：`hidden md:block`（中等屏幕以上显示桌面端图片）

### 2.6 事件处理

组件监听以下事件：

1. **图片加载事件**: 当移动端或桌面端图片加载完成时，更新高度
2. **窗口大小变化事件**: 当窗口大小改变时，重新计算高度
3. **清理**: 组件卸载时，移除所有事件监听器

---

## 3. 使用方式

### 3.1 基本设置

在应用的根布局文件中（`app/layout.tsx`）设置 Provider 和组件：

```tsx
import { AdBanner } from '@/components/adBanner/AdBanner';
import { AdBannerProvider } from '@/components/adBanner/AdBannerContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AdBannerProvider>
          <AdBanner />
          <Navbar />
          <main>{children}</main>
        </AdBannerProvider>
      </body>
    </html>
  );
}
```

### 3.2 在导航栏中使用

`Navbar` 组件使用 `useAdBanner` Hook 来获取广告横幅高度，并调整自己的位置：

```tsx
import { useAdBanner } from '@/components/adBanner/AdBannerContext';

export function Navbar() {
  const { isAdBannerVisible, adBannerHeight } = useAdBanner();
  
  // 计算导航栏的 top 位置
  const totalBannerHeight = isAdBannerVisible ? adBannerHeight : 0;
  const topPosition = totalBannerHeight > 0 ? `${totalBannerHeight}px` : '0px';

  return (
    <nav style={{ top: topPosition }}>
      {/* 导航栏内容 */}
    </nav>
  );
}
```

### 3.3 在内容包装器中使用

`MainContentWrapper` 组件使用广告横幅高度来计算主内容区域的最小高度：

```tsx
import { useAdBanner } from '@/components/adBanner/AdBannerContext';

export function MainContentWrapper({ children }) {
  const { isAdBannerVisible, adBannerHeight } = useAdBanner();
  
  // 计算总头部高度（广告横幅 + 维护横幅 + 导航栏）
  const adBannerEffectiveHeight = isAdBannerVisible 
    ? (adBannerHeight > 0 ? adBannerHeight : 80) // 如果高度未计算，使用 80px 作为后备值
    : 0;
  
  const totalHeaderHeight = adBannerEffectiveHeight + 64; // 64px 是导航栏高度

  return (
    <main style={{ minHeight: `calc(100vh - ${totalHeaderHeight}px)` }}>
      {children}
    </main>
  );
}
```

---

## 4. 与其他组件的协作

### 4.1 与维护横幅的协作

广告横幅与维护横幅（MaintenanceBanner）可以同时显示。在 `Navbar` 和 `MainContentWrapper` 中，需要同时考虑两者的高度：

```tsx
const { isAdBannerVisible, adBannerHeight } = useAdBanner();
const { isBannerVisible, bannerHeight } = useMaintenanceBanner();

const totalBannerHeight = 
  (isAdBannerVisible ? adBannerHeight : 0) + 
  (isBannerVisible ? bannerHeight : 0);
```

### 4.2 层级关系

组件的 z-index 层级：
- 广告横幅: `z-[60]`
- 维护横幅: 通常低于广告横幅
- 导航栏: `z-50`

---

## 5. 常见问题

### 5.1 为什么在 `/christmas` 页面不显示？

为了避免在圣诞节活动页面显示广告横幅，保持页面的视觉一致性。

### 5.2 高度计算不准确怎么办？

组件会在以下情况自动更新高度：
- 图片加载完成时
- 窗口大小改变时

如果高度仍然不准确，可以检查：
1. 图片是否正确加载
2. 是否有 CSS 样式影响高度计算
3. 是否在 `AdBannerProvider` 内部使用

### 5.3 如何修改广告图片？

修改 `AdBanner.tsx` 文件中的常量：

```typescript
const AD_BANNER_IMAGE_URL = 'your-desktop-image-url';
const AD_BANNER_MOBILE_IMAGE_URL = 'your-mobile-image-url';
```

### 5.4 如何修改跳转链接？

修改 `AdBanner.tsx` 文件中的 `Link` 组件的 `href` 属性：

```tsx
<Link href="/your-target-page">
  {/* 图片内容 */}
</Link>
```

---

## 6. 技术细节

### 6.1 性能优化

- 使用 `useCallback` 优化高度更新函数
- 使用 `useRef` 避免不必要的重新渲染
- 在组件卸载时清理事件监听器

### 6.2 响应式实现

使用 Tailwind CSS 的响应式类：
- `md:hidden`: 在中等屏幕以下隐藏（移动端图片）
- `hidden md:block`: 在中等屏幕以上显示（桌面端图片）

### 6.3 状态同步

`AdBanner` 组件负责更新 Context 中的状态，其他组件通过 `useAdBanner` Hook 读取状态。这种设计确保了状态的一致性。

---

## 7. 文件结构

```
components/
  adBanner/
    ├── AdBanner.tsx          # 广告横幅组件
    └── AdBannerContext.tsx   # 广告横幅 Context
```

---

## 8. 相关文档

- [维护通知组件文档](./maintenance-components.md) - 了解维护横幅的实现
- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 路由和布局

---

## 更新日志

- **初始版本**: 创建广告横幅组件和 Context
- **功能**: 支持响应式设计、自动高度计算、页面路由控制


# 维护通知组件文档

## 概述

本文档详细说明了 InfiniteTalk 项目中维护通知相关的组件功能，包括维护横幅（Banner）和维护模态框（Modal）的实现逻辑、配置方式和使用方法。

## 核心组件

- **`components/Maintenance/MaintenanceBanner.tsx`** - 维护横幅组件
- **`components/Maintenance/MaintenanceBannerContext.tsx`** - 维护横幅 Context
- **`components/Maintenance/MaintenanceModal.tsx`** - 维护模态框组件
- **`components/Maintenance/MaintenanceModalWrapper.tsx`** - 维护模态框动态导入包装器
- **`components/Maintenance/MainContentWrapper.tsx`** - 主内容包装器（计算头部高度）

---

## 1. 维护横幅 (MaintenanceBanner)

### 1.1 功能说明

维护横幅是一个粘性横幅组件，显示在页面顶部，用于向已登录用户展示维护通知。横幅支持关闭功能，关闭状态会保存在用户的 localStorage 中。

### 1.2 特性

- ✅ 仅对已登录用户显示
- ✅ 支持用户关闭，关闭状态持久化
- ✅ 支持三种严重级别：`info`、`warning`、`error`
- ✅ 自动格式化时间（UTC 转本地时间）
- ✅ 支持消息模板占位符
- ✅ 自动计算并更新横幅高度
- ✅ 粘性定位，始终显示在页面顶部

### 1.3 配置来源

横幅配置从远程 JSON 文件获取：

```
https://cysource.jxp.com/public/maintenance-notice.json
```

### 1.4 配置结构

```typescript
interface MaintenanceConfig {
  enabled: boolean;        // 是否启用横幅
  startTime: string;      // 开始时间（ISO 8601 格式）
  endTime: string;        // 结束时间（ISO 8601 格式）
  message: string;        // 消息内容（支持 {startTime} 和 {endTime} 占位符）
  severity: 'info' | 'warning' | 'error';  // 严重级别
}

interface MaintenanceNotice {
  sites: {
    [key: string]: MaintenanceConfig;  // key 为站点 ID，如 'infinitetalk'
  };
}
```

### 1.5 配置示例

```json
{
  "sites": {
    "infinitetalk": {
      "enabled": true,
      "startTime": "2025-01-15T10:00:00Z",
      "endTime": "2025-01-15T12:00:00Z",
      "message": "Scheduled maintenance from {startTime} to {endTime}. Services may be temporarily unavailable.",
      "severity": "warning"
    }
  }
}
```

### 1.6 显示逻辑

1. **用户检查：** 仅对已登录用户显示（`isSignedIn === true`）
2. **关闭状态检查：** 检查用户是否已关闭该横幅
3. **配置检查：** 从远程获取配置，检查 `enabled` 状态
4. **站点匹配：** 根据站点 ID（`infinitetalk`）获取对应配置

### 1.7 关闭功能

- 关闭按钮位于横幅右侧
- 关闭状态保存在 localStorage：`maintenance-banner-dismissed-{siteId}-{userId}`
- 每个用户独立保存关闭状态
- 关闭后横幅不会再次显示（除非清除 localStorage）

### 1.8 时间格式化

横幅会自动将 UTC 时间转换为用户本地时间显示：

- **输入格式：** ISO 8601（如 `2025-01-15T10:00:00Z`）
- **输出格式：** `"December 25, 10:00"`（本地时间）

### 1.9 消息模板

支持在消息中使用占位符：

- `{startTime}` - 替换为格式化的开始时间
- `{endTime}` - 替换为格式化的结束时间

**示例：**
```
"Scheduled maintenance from {startTime} to {endTime}."
→ "Scheduled maintenance from December 25, 10:00 to December 25, 12:00."
```

### 1.10 样式配置

根据 `severity` 显示不同颜色：

| Severity | 背景色 | 边框色 | 用途 |
|----------|--------|--------|------|
| `info` | 蓝色 (`bg-blue-600/90`) | 蓝色 (`border-blue-500`) | 一般信息通知 |
| `warning` | 黄色 (`bg-yellow-600/90`) | 黄色 (`border-yellow-500`) | 警告通知 |
| `error` | 红色 (`bg-red-600/90`) | 红色 (`border-red-500`) | 错误通知 |

### 1.11 高度管理

横幅会自动计算并更新高度，通过 Context 传递给其他组件：

```typescript
useEffect(() => {
  if (isVisible && bannerRef.current) {
    const height = bannerRef.current.offsetHeight;
    setBannerHeight(height);
  } else {
    setBannerHeight(0);
  }
}, [isVisible, setBannerHeight]);
```

---

## 2. 维护横幅 Context (MaintenanceBannerContext)

### 2.1 功能说明

提供全局状态管理，用于在组件间共享横幅的可见性和高度信息。

### 2.2 Context 接口

```typescript
interface MaintenanceBannerContextType {
  isBannerVisible: boolean;           // 横幅是否可见
  setBannerVisible: (visible: boolean) => void;  // 设置横幅可见性
  bannerHeight: number;               // 横幅高度（像素）
  setBannerHeight: (height: number) => void;   // 设置横幅高度
}
```

### 2.3 使用方法

```typescript
import { useMaintenanceBanner } from '@/components/MaintenanceBannerContext';

function MyComponent() {
  const { isBannerVisible, bannerHeight, setBannerVisible, setBannerHeight } = useMaintenanceBanner();
  
  // 使用状态...
}
```

### 2.4 Provider 设置

需要在应用根组件中包裹 `MaintenanceBannerProvider`：

```typescript
import { MaintenanceBannerProvider } from '@/components/MaintenanceBannerContext';

function App({ children }) {
  return (
    <MaintenanceBannerProvider>
      {children}
    </MaintenanceBannerProvider>
  );
}
```

---

## 3. 维护模态框 (MaintenanceModal)

### 3.1 功能说明

维护模态框是一个全屏遮罩的模态框组件，用于显示重要的维护通知。模态框会阻止所有用户交互，直到维护结束或配置关闭。

### 3.2 特性

- ✅ 全屏遮罩，阻止所有交互
- ✅ 固定定位在右上角
- ✅ 支持三种严重级别
- ✅ 自动阻止页面滚动
- ✅ 无需用户登录即可显示
- ✅ 动态加载（SSR 禁用）

### 3.3 配置结构

```typescript
interface MaintenanceModalConfig {
  enabled: boolean;        // 是否启用维护通知
  startTime: string;      // 开始时间
  endTime: string;        // 结束时间
  severity: 'info' | 'warning' | 'error';  // 严重级别
  modal: {
    enabled: boolean;      // 是否启用模态框
    title: string;         // 模态框标题
    message: string;       // 模态框消息内容
  };
}
```

### 3.4 配置示例

```json
{
  "sites": {
    "infinitetalk": {
      "enabled": true,
      "startTime": "2025-01-15T10:00:00Z",
      "endTime": "2025-01-15T12:00:00Z",
      "severity": "error",
      "modal": {
        "enabled": true,
        "title": "System Maintenance",
        "message": "We are currently performing scheduled maintenance. Services will be unavailable from 10:00 AM to 12:00 PM UTC."
      }
    }
  }
}
```

### 3.5 显示逻辑

1. **配置获取：** 从远程 JSON 文件获取配置
2. **启用检查：** 检查 `enabled` 和 `modal.enabled` 都为 `true`
3. **自动显示：** 满足条件时自动显示模态框

### 3.6 交互阻止

模态框显示时会：

- 设置 `document.body.style.overflow = 'hidden'` 阻止页面滚动
- 使用全屏遮罩（`fixed inset-0`）阻止所有点击事件
- 模态框内容区域允许点击（`pointer-events-auto`）

### 3.7 样式配置

根据 `severity` 显示不同颜色：

| Severity | 边框色 | 图标色 | 标题色 |
|----------|--------|--------|--------|
| `info` | `border-blue-500` | `text-blue-500` | `text-blue-700` |
| `warning` | `border-yellow-500` | `text-yellow-500` | `text-yellow-700` |
| `error` | `border-red-500` | `text-red-500` | `text-red-700` |

### 3.8 定位

模态框固定在页面右上角：

- **位置：** `top-10 right-4`（距离顶部 40px，距离右侧 16px）
- **最大宽度：** `max-w-md`（28rem / 448px）
- **层级：** `z-[100]`（确保在最上层）

---

## 4. 维护模态框包装器 (MaintenanceModalWrapper)

### 4.1 功能说明

使用 Next.js 的 `dynamic` 导入功能，将维护模态框组件进行动态加载，禁用 SSR（服务端渲染）。

### 4.2 实现原因

- **客户端专用：** 维护模态框需要访问 `window` 和 `document` 对象
- **性能优化：** 避免在服务端渲染不必要的组件
- **避免水合错误：** 防止服务端和客户端渲染不一致

### 4.3 使用方法

```typescript
import { MaintenanceModalWrapper } from '@/components/MaintenanceModalWrapper';

function Layout({ children }) {
  return (
    <>
      {children}
      <MaintenanceModalWrapper />
    </>
  );
}
```

---

## 5. 主内容包装器 (MainContentWrapper)

### 5.1 功能说明

主内容包装器用于计算并应用正确的最小高度，确保内容区域能够填满视口，同时考虑所有头部元素的高度。

### 5.2 计算逻辑

```typescript
const totalHeaderHeight = 
  adBannerEffectiveHeight +      // 广告横幅高度
  (isBannerVisible ? bannerHeight : 0) +  // 维护横幅高度
  64;                             // 导航栏高度（h-16 = 64px）
```

### 5.3 高度来源

1. **广告横幅高度：** 从 `AdBannerContext` 获取
   - 如果横幅可见但高度未计算，使用 80px 作为回退值
2. **维护横幅高度：** 从 `MaintenanceBannerContext` 获取
   - 仅在横幅可见时计入高度
3. **导航栏高度：** 固定 64px（Tailwind `h-16`）

### 5.4 样式应用

```typescript
<main 
  style={{ 
    minHeight: `calc(100vh - ${totalHeaderHeight}px)`,
  }}
>
  {children}
</main>
```

### 5.5 使用场景

确保页面内容区域能够：
- 填满整个视口高度
- 正确计算滚动区域
- 适应动态变化的头部高度

---

## 6. 完整使用示例

### 6.1 应用根组件设置

```typescript
// app/layout.tsx
import { MaintenanceBannerProvider } from '@/components/MaintenanceBannerContext';
import { MaintenanceBanner } from '@/components/MaintenanceBanner';
import { MaintenanceModalWrapper } from '@/components/MaintenanceModalWrapper';
import { MainContentWrapper } from '@/components/MainContentWrapper';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MaintenanceBannerProvider>
          <MaintenanceBanner />
          <MaintenanceModalWrapper />
          <MainContentWrapper>
            {children}
          </MainContentWrapper>
        </MaintenanceBannerProvider>
      </body>
    </html>
  );
}
```

### 6.2 配置 JSON 文件示例

```json
{
  "sites": {
    "infinitetalk": {
      "enabled": true,
      "startTime": "2025-01-15T10:00:00Z",
      "endTime": "2025-01-15T12:00:00Z",
      "message": "Scheduled maintenance from {startTime} to {endTime}. Services may be temporarily unavailable.",
      "severity": "warning",
      "modal": {
        "enabled": true,
        "title": "Scheduled Maintenance",
        "message": "We are performing scheduled maintenance from 10:00 AM to 12:00 PM UTC. Services will be temporarily unavailable during this time."
      }
    }
  }
}
```

---

## 7. 组件关系图

```
┌─────────────────────────────────────────┐
│     MaintenanceBannerProvider          │
│  (提供全局状态管理)                      │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────────┐
│ Maintenance │  │ MaintenanceBanner   │
│ Modal       │  │ (使用 Context)       │
│             │  └──────┬───────────────┘
└─────────────┘         │
                        │
              ┌─────────▼──────────┐
              │ MainContentWrapper │
              │ (读取横幅高度)      │
              └────────────────────┘
```

---

## 8. 关键特性对比

| 特性 | MaintenanceBanner | MaintenanceModal |
|------|-------------------|------------------|
| 显示位置 | 页面顶部（粘性） | 右上角（固定） |
| 用户交互 | 可关闭 | 不可关闭（全屏遮罩） |
| 显示条件 | 仅已登录用户 | 所有用户 |
| 关闭持久化 | ✅ localStorage | ❌ 无 |
| 阻止交互 | ❌ 否 | ✅ 是 |
| 阻止滚动 | ❌ 否 | ✅ 是 |
| 高度管理 | ✅ 是 | ❌ 否 |
| 时间格式化 | ✅ 是 | ❌ 否 |
| 消息模板 | ✅ 支持 | ❌ 不支持 |

---

## 9. 配置管理

### 9.1 远程配置

所有配置从以下 URL 获取：

```
https://cysource.jxp.com/public/maintenance-notice.json
```

### 9.2 缓存策略

- **横幅：** `cache: 'no-store'` - 始终获取最新配置
- **模态框：** `cache: 'no-store'` - 始终获取最新配置

### 9.3 错误处理

- 配置获取失败时静默失败，不显示横幅/模态框
- 错误信息仅记录到控制台，不影响用户体验

---

## 10. 时间处理

### 10.1 时间格式

- **输入：** ISO 8601 格式（UTC）
  - 示例：`2025-01-15T10:00:00Z`
- **输出：** 本地时间格式
  - 示例：`"December 25, 10:00"`

### 10.2 格式化函数

```typescript
const formatLocalTime = (isoString: string): string => {
  const date = new Date(isoString);
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${monthNames[month]} ${day}, ${hours}:${minutes}`;
};
```

---

## 11. 本地存储

### 11.1 存储键格式

```
maintenance-banner-dismissed-{siteId}-{userId}
```

**示例：**
```
maintenance-banner-dismissed-infinitetalk-user_2abc123
```

### 11.2 存储值

- **类型：** 字符串
- **值：** `"true"`（关闭）或不存在（未关闭）

### 11.3 作用域

- 每个用户独立存储
- 每个站点独立存储
- 关闭后永久有效（除非清除 localStorage）

---

## 12. 样式定制

### 12.1 横幅样式

横幅使用 Tailwind CSS 类名，可通过修改 `severityStyles` 对象自定义：

```typescript
const severityStyles = {
  info: 'bg-blue-600/90 text-white border-blue-500',
  warning: 'bg-yellow-600/90 text-white border-yellow-500',
  error: 'bg-red-600/90 text-white border-red-500',
};
```

### 12.2 模态框样式

模态框样式通过 `severityStyles` 对象定义：

```typescript
const severityStyles = {
  info: {
    border: 'border-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-700',
  },
  // ...
};
```

---

## 13. 测试建议

### 13.1 横幅测试

1. **显示测试：**
   - 已登录用户应看到横幅
   - 未登录用户不应看到横幅
   - 已关闭用户不应再次看到横幅

2. **关闭测试：**
   - 点击关闭按钮后横幅消失
   - 刷新页面后横幅不再显示
   - 不同用户独立存储关闭状态

3. **配置测试：**
   - `enabled: false` 时不显示横幅
   - 配置获取失败时不显示横幅
   - 站点 ID 不匹配时不显示横幅

### 13.2 模态框测试

1. **显示测试：**
   - `enabled: true` 且 `modal.enabled: true` 时显示
   - 配置获取失败时不显示
   - 站点 ID 不匹配时不显示

2. **交互测试：**
   - 模态框显示时页面无法滚动
   - 模态框显示时无法点击其他元素
   - 模态框内容区域可以正常显示

### 13.3 高度计算测试

1. **动态高度：**
   - 横幅显示时高度正确计算
   - 横幅隐藏时高度为 0
   - 内容区域高度正确调整

2. **多横幅场景：**
   - 广告横幅 + 维护横幅同时显示
   - 高度累加正确
   - 内容区域高度正确

---

## 14. 故障排查

### 14.1 横幅不显示

**可能原因：**
1. 用户未登录
2. 用户已关闭横幅
3. 配置中 `enabled: false`
4. 站点 ID 不匹配
5. 网络请求失败

**排查步骤：**
1. 检查用户登录状态
2. 检查 localStorage 中是否有关闭记录
3. 检查远程配置 JSON 文件
4. 检查浏览器控制台错误信息

### 14.2 模态框不显示

**可能原因：**
1. 配置中 `enabled: false`
2. 配置中 `modal.enabled: false`
3. 站点 ID 不匹配
4. 网络请求失败

**排查步骤：**
1. 检查远程配置 JSON 文件
2. 检查浏览器控制台错误信息
3. 验证 JSON 格式是否正确

### 14.3 高度计算错误

**可能原因：**
1. Context 未正确提供
2. 横幅高度未正确更新
3. 广告横幅高度未正确获取

**排查步骤：**
1. 检查 `MaintenanceBannerProvider` 是否正确包裹
2. 检查 `AdBannerContext` 是否正确提供
3. 使用浏览器开发者工具检查元素高度

---

## 15. 最佳实践

1. **配置管理：**
   - 使用远程 JSON 文件管理配置，便于快速更新
   - 配置变更无需重新部署应用

2. **用户体验：**
   - 横幅允许用户关闭，避免干扰
   - 模态框用于重要通知，阻止交互
   - 时间自动转换为本地时间，提升可读性

3. **性能优化：**
   - 模态框使用动态导入，避免 SSR
   - 配置获取失败时静默处理，不影响主流程

4. **可维护性：**
   - 使用 Context 管理状态，便于扩展
   - 组件职责清晰，易于测试和维护


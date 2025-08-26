# Providers 目录

这个目录统一管理应用的所有Context Providers和相关的hooks。

## 目录结构

```
lib/providers/
├── index.ts           # 统一导出文件
├── UserProvider.tsx   # 用户信息Provider和useUserInfo hook
└── README.md         # 说明文档
```

## 使用方法

### 导入Provider
```tsx
import { UserProvider } from '@/lib/providers';
```

### 导入Hook
```tsx
import { useUserInfo } from '@/lib/providers';
```

### 导入类型
```tsx
import type { UserInfo } from '@/lib/providers';
```

## 当前可用的Providers

### UserProvider
- **功能**: 全局用户信息管理
- **Hook**: `useUserInfo()`
- **类型**: `UserInfo`
- **特性**: 
  - 自动获取用户信息
  - 定时更新（60秒）
  - 错误处理和重试
  - 登录状态变化时自动更新

## 添加新的Provider

当需要添加新的Provider时，请遵循以下步骤：

1. 在此目录下创建新的Provider文件，如 `ThemeProvider.tsx`
2. 在 `index.ts` 中导出新的Provider和相关hooks
3. 在根Layout中添加新的Provider包装

### 示例：添加主题Provider

```tsx
// ThemeProvider.tsx
'use client';

export function ThemeProvider({ children }) {
  // Provider逻辑
}

export function useTheme() {
  // Hook逻辑
}
```

```tsx
// index.ts
export { ThemeProvider, useTheme } from './ThemeProvider';
```

## 设计原则

1. **单一职责**: 每个Provider负责一个特定的功能域
2. **统一导出**: 通过index.ts统一管理所有导出
3. **类型安全**: 提供完整的TypeScript类型支持
4. **错误处理**: 内置错误边界和错误处理
5. **性能优化**: 避免不必要的重渲染和请求 
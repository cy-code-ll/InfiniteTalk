# Christmas Page - Mobile & Desktop UI Strategy

## 方案概述

本页面采用**条件渲染**方案，根据设备类型（移动端/PC端）渲染完全不同的UI组件，实现移动端和PC端完全不同的视觉风格和布局。

## 实现方案

### 方案选择：客户端条件渲染

**优点：**
- ✅ 移动端和PC端组件完全分离，代码清晰易维护
- ✅ 可以设计完全不同的UI风格，不受响应式限制
- ✅ 性能优化：只加载当前设备需要的组件
- ✅ 灵活性高：可以针对不同设备做深度定制

**实现方式：**
1. 使用 `isMobileDevice()` 工具函数检测设备类型
2. 在 `ChristmasHero` 组件中根据设备类型条件渲染
3. 移动端渲染 `ChristmasHeroMobile` 组件
4. PC端渲染 `ChristmasHeroDesktop` 组件

### 文件结构

```
components/christmas/
├── index.ts                    # 导出文件
├── ChristmasHero.tsx           # 主组件（条件渲染逻辑）
├── ChristmasHeroMobile.tsx     # 移动端UI组件
├── ChristmasHeroDesktop.tsx    # PC端UI组件
└── README.md                   # 说明文档
```

### 核心代码逻辑

```typescript
// ChristmasHero.tsx
export function ChristmasHero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    // 监听窗口大小变化
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <ChristmasHeroMobile />;
  }
  return <ChristmasHeroDesktop />;
}
```

## 其他可选方案

### 方案2：Tailwind 响应式类名（不推荐用于差异很大的UI）

**适用场景：** UI差异较小，主要是布局调整

```tsx
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">...</div>
</div>
```

**缺点：** 当移动端和PC端UI差异很大时，代码会变得复杂难维护

### 方案3：CSS Media Queries（不推荐）

**适用场景：** 纯样式差异

**缺点：** 无法处理结构性的UI差异

### 方案4：Next.js useMediaQuery Hook（可选）

如果需要更精确的断点控制，可以安装 `react-responsive` 或使用自定义 hook：

```typescript
import { useMediaQuery } from 'react-responsive';

const isMobile = useMediaQuery({ maxWidth: 768 });
```

## 当前实现特点

### 移动端 UI (`ChristmasHeroMobile`)
- 紧凑的垂直布局
- 简化的功能展示
- 全宽按钮
- 2列网格布局
- 较小的字体和间距

### PC端 UI (`ChristmasHeroDesktop`)
- 宽敞的水平布局
- 丰富的功能展示
- 3列网格布局
- 更大的字体和间距
- 更复杂的视觉层次

## 扩展建议

1. **添加更多组件：** 可以创建 `ChristmasFeatures`, `ChristmasExamples` 等组件，同样采用条件渲染
2. **性能优化：** 考虑使用 `dynamic import` 按需加载组件
3. **SEO优化：** 确保移动端和PC端内容对SEO友好
4. **测试：** 在不同设备和浏览器上测试UI表现

## 使用示例

在页面中使用：

```tsx
import { ChristmasHero } from '@/components/christmas';

export default function ChristmasPage() {
  return (
    <main>
      <ChristmasHero />
      {/* 其他组件 */}
    </main>
  );
}
```


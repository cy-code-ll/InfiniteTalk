# 免费券与按钮文字显示功能文档

## 概述

本文档详细说明了 InfiniteTalk 项目中免费券（优惠券）的使用逻辑、试用条件判断、以及生成按钮的文案显示规则。

## 核心文件

- **`lib/trial-config.ts`** - 试用配置定义
- **`lib/providers/useTrialAccess.ts`** - 试用访问模式判断 Hook
- **`app/infinitetalk/InfiniteTalkGenerator.tsx`** - 生成器组件，包含按钮逻辑

---

## 1. 试用配置 (trial-config.ts)

### 1.1 文件结构

```typescript
export type TrialModelKey = 'infinitetalk';

export interface InfiniteTalkTrialParams {
  resolution: string;
  duration: number; // Audio duration in seconds (ceil)
}
```

### 1.2 试用条件规则

**InfiniteTalk 试用条件：**
- **分辨率：** 480p 或 720p
- **音频时长：** > 0 秒 且 <= 15 秒

```typescript
isTrialEligible: (params: InfiniteTalkTrialParams) =>
  (params.resolution === '480p' || params.resolution === '720p') &&
  params.duration > 0 &&
  params.duration <= 15
```

### 1.3 配置说明

- 只有满足上述条件的配置才能使用免费券
- 1080p 分辨率不适用于试用
- 音频时长超过 15 秒不适用于试用

---

## 2. 试用访问模式判断 (useTrialAccess.ts)

### 2.1 访问模式类型

```typescript
export type TrialAccessMode = 'credits' | 'trial' | 'locked';
```

### 2.2 模式判断逻辑

```typescript
let mode: TrialAccessMode = 'locked';

// 优先级 1: 试用模式（最高优先级）
if (freeTimes > 0 && isTrialEligible && userLevel == 0) {
  mode = 'trial';
}
// 优先级 2: 积分模式
else if (totalCredits > 0) {
  mode = 'credits';
}
// 优先级 3: 锁定模式
else {
  mode = 'locked';
}
```

### 2.3 模式说明

#### 2.3.1 Trial 模式（试用模式）

**条件：**
- `freeTimes > 0` - 用户有免费券
- `isTrialEligible === true` - 当前配置符合试用条件
- `userLevel === 0` - 用户未充值（等级为 0）

**特点：**
- 即使有赠送积分，也优先使用免费券
- 不消耗积分
- 显示 "Free" 标签

#### 2.3.2 Credits 模式（积分模式）

**条件：**
- `totalCredits > 0` - 用户有积分
- 不符合试用条件，或已充值用户

**特点：**
- 消耗积分
- 显示积分消耗数量（如 "11 Credits"）
- 已充值用户（`userLevel > 0`）始终使用此模式

#### 2.3.3 Locked 模式（锁定模式）

**条件：**
- `totalCredits === 0` - 无积分
- `freeTimes === 0` 或 `!isTrialEligible` - 无免费券或不符合试用条件

**特点：**
- 无法生成视频
- 会弹出积分不足弹窗或跳转到定价页面

### 2.4 Hook 返回值

```typescript
export interface TrialAccessResult<K extends TrialModelKey> {
  mode: TrialAccessMode;           // 当前访问模式
  totalCredits: number;            // 总积分
  freeTimes: number;               // 免费券数量
  isTrialEligible: boolean;        // 是否符合试用条件
  modelKey: K;                     // 模型键
}
```

---

## 3. 生成按钮逻辑 (InfiniteTalkGenerator.tsx)

### 3.1 按钮状态判断

#### 3.1.1 isUpgradeMode 判断

```typescript
const isUpgradeMode =
  isSignedIn &&           // 已登录
  hasVouchers &&          // 有免费券 (free_times > 0)
  hasNoCredits &&         // 无积分 (total_credits === 0)
  hasAudio &&             // 有音频文件
  (isNonTrialResolution || isAudioTooLong) &&  // 超过试用配置
  userLevel === 0;        // 未充值用户
```

**说明：**
- 当用户有免费券但无积分，且选择了超过试用限制的配置时，显示 "Upgrade Plan" 按钮
- 如果用户有积分，即使有免费券且超过试用配置，也会显示 "Generate Video" 并使用积分

#### 3.1.2 按钮文案逻辑

```typescript
{isGenerating
  ? 'Generating...'           // 生成中
  : isUpgradeMode
  ? 'Upgrade Plan'            // 升级模式
  : 'Generate Video'}         // 正常生成
```

### 3.2 积分标签显示逻辑

```typescript
{!isUpgradeMode && (
  <div className="积分标签">
    {!isSignedIn || (trialAccess.mode === 'trial' && isSignedIn)
      ? 'Free'                 // 未登录或试用模式
      : audioDuration > 0
      ? `${creditsCost} Credits`  // 有音频，显示实际积分消耗
      : `${默认积分} Credits`}    // 无音频，显示默认积分
  </div>
)}
```

**标签显示规则：**

| 条件 | 显示内容 |
|------|----------|
| 未登录 | "Free" |
| `trialAccess.mode === 'trial'` | "Free" |
| `audioDuration > 0` | `"${creditsCost} Credits"` |
| `audioDuration === 0` | 根据分辨率显示默认值：<br>480p: "5 Credits"<br>720p: "10 Credits"<br>1080p: "15 Credits" |
| `isUpgradeMode === true` | 不显示标签 |

### 3.3 积分计算规则

```typescript
function calculateCredits(duration: number, resolution: Resolution): number {
  if (!duration) return 1;
  const rounded = Math.ceil(duration);

  // 5秒以下：固定积分
  if (rounded <= 5) {
    if (resolution === '480p') return 5 + 1;
    if (resolution === '720p') return 10 + 1;
    return 15 + 1; // 1080p
  }

  // 5秒以上：按秒计算
  const perSecond = resolution === '480p' ? 1 : resolution === '720p' ? 2 : 3;
  return rounded * perSecond + 1;
}
```

**积分计算规则：**
- **≤ 5 秒：** 固定积分
  - 480p: 6 积分
  - 720p: 11 积分
  - 1080p: 16 积分
- **> 5 秒：** 按秒计算 + 1 积分基础费用
  - 480p: 1 积分/秒 + 1
  - 720p: 2 积分/秒 + 1
  - 1080p: 3 积分/秒 + 1

---

## 4. 完整场景分析

### 4.1 场景判断流程图

```
用户状态判断
├─ 未登录
│  └─ 按钮: "Generate Video" | 标签: "Free" | 点击: 打开登录弹窗
│
├─ 已登录
│  ├─ 有免费券 + 符合试用条件 + 未充值
│  │  └─ 模式: trial | 按钮: "Generate Video" | 标签: "Free"
│  │
│  ├─ 有积分
│  │  ├─ 有免费券 + 超过试用配置 + 未充值
│  │  │  └─ 模式: credits | 按钮: "Generate Video" | 标签: "X Credits"
│  │  │
│  │  └─ 其他情况
│  │     └─ 模式: credits | 按钮: "Generate Video" | 标签: "X Credits"
│  │
│  └─ 无积分
│     ├─ 有免费券 + 超过试用配置 + 未充值
│     │  └─ isUpgradeMode: true | 按钮: "Upgrade Plan" | 标签: 不显示
│     │
│     └─ 无免费券或不符合试用条件
│        └─ 模式: locked | 按钮: "Generate Video" | 点击: 弹积分不足弹窗
```

### 4.2 详细场景表格

| 场景 | 登录 | 免费券 | 积分 | 等级 | 配置 | 模式 | 按钮文案 | 标签 | 说明 |
|------|------|--------|------|------|------|------|----------|------|------|
| 1 | ❌ | - | - | - | - | - | Generate Video | Free | 未登录，点击打开登录弹窗 |
| 2 | ✅ | ✅ | ❌ | 0 | 符合 | trial | Generate Video | Free | 使用免费券 |
| 3 | ✅ | ✅ | ❌ | 0 | 超过 | locked | Upgrade Plan | - | 无积分且超过试用配置 |
| 4 | ✅ | ✅ | ✅ | 0 | 符合 | trial | Generate Video | Free | 有积分但优先用券 |
| 5 | ✅ | ✅ | ✅ | 0 | 超过 | credits | Generate Video | X Credits | 有积分，使用积分 |
| 6 | ✅ | ❌ | ✅ | 0 | - | credits | Generate Video | X Credits | 无券有积分 |
| 7 | ✅ | ❌ | ❌ | 0 | - | locked | Generate Video | X Credits | 无券无积分，点击弹窗 |
| 8 | ✅ | ✅ | ✅ | >0 | - | credits | Generate Video | X Credits | 已充值用户，不使用券 |
| 9 | ✅ | ✅ | ❌ | >0 | - | locked | Generate Video | X Credits | 已充值但无积分，点击弹窗 |

### 4.3 关键场景说明

#### 场景 3：有券无积分超过配置
- **条件：** 有免费券、无积分、未充值、超过试用配置
- **行为：** 显示 "Upgrade Plan" 按钮，点击后打开升级弹窗
- **目的：** 引导用户充值以使用高级配置

#### 场景 5：有券有积分超过配置（重要修改）
- **条件：** 有免费券、有积分、未充值、超过试用配置
- **行为：** 显示 "Generate Video" 按钮，使用积分生成
- **说明：** 允许用户使用积分，而不是强制升级

---

## 5. 代码实现细节

### 5.1 useTrialAccess Hook 使用

```typescript
const trialAccess = useTrialAccess('infinitetalk', {
  resolution,
  duration: audioDuration > 0 ? Math.ceil(audioDuration) : 0,
});
```

**参数说明：**
- `modelKey`: 模型键，当前为 `'infinitetalk'`
- `params.resolution`: 当前选择的分辨率
- `params.duration`: 音频时长（向上取整）

### 5.2 按钮点击处理

```typescript
onClick={() => {
  if (isGenerating) return;

  if (isUpgradeMode) {
    setIsUpgradeModeModalOpen(true);  // 打开升级弹窗
    return;
  }

  handleGenerate();  // 执行生成
}}
```

### 5.3 生成前检查

在 `handleGenerate` 函数中：

```typescript
// 1. 检查 locked 模式
if (trialAccess.mode === 'locked') {
  if (totalCredits === 0 && freeTimes === 0) {
    setIsInsufficientCreditsModalOpen(true);  // 弹积分不足弹窗
    return;
  } else {
    window.location.href = '/pricing';  // 跳转定价页
    return;
  }
}

// 2. 检查积分是否足够（credits 模式）
if (trialAccess.mode === 'credits' && totalCredits < requiredCredits) {
  setIsInsufficientCreditsModalOpen(true);  // 弹积分不足弹窗
  return;
}
```

---

## 6. 相关组件

以下组件使用相同的逻辑：

1. **`app/infinitetalk/InfiniteTalkGenerator.tsx`** - 单角色视频生成
2. **`components/multi/MultiHero.tsx`** - 多角色视频生成
3. **`components/christmas/ChristmasHeroDesktop.tsx`** - Christmas 桌面版
4. **`components/christmas/ChristmasHeroMobile.tsx`** - Christmas 移动版

所有组件都遵循相同的：
- `isUpgradeMode` 判断逻辑
- 按钮文案显示规则
- 标签显示规则

---

## 7. 重要修改历史

### 7.1 isUpgradeMode 条件修改

**修改前：**
```typescript
const isUpgradeMode =
  isSignedIn &&
  hasVouchers &&
  hasAudio &&
  (isNonTrialResolution || isAudioTooLong) &&
  userLevel === 0;
```

**修改后：**
```typescript
const isUpgradeMode =
  isSignedIn &&
  hasVouchers &&
  hasNoCredits &&  // ✅ 新增条件
  hasAudio &&
  (isNonTrialResolution || isAudioTooLong) &&
  userLevel === 0;
```

**修改原因：**
- 允许有积分的用户使用积分生成，即使有免费券且超过试用配置
- 只有在真正无积分时才显示 "Upgrade Plan" 按钮

---

## 8. 测试建议

### 8.1 关键测试场景

1. **未登录用户**
   - 按钮显示 "Generate Video"
   - 标签显示 "Free"
   - 点击后打开登录弹窗

2. **有免费券 + 符合试用条件**
   - 模式为 `trial`
   - 按钮显示 "Generate Video"
   - 标签显示 "Free"
   - 生成不消耗积分

3. **有免费券 + 无积分 + 超过试用配置**
   - `isUpgradeMode === true`
   - 按钮显示 "Upgrade Plan"
   - 标签不显示
   - 点击后打开升级弹窗

4. **有免费券 + 有积分 + 超过试用配置**
   - `isUpgradeMode === false`
   - 按钮显示 "Generate Video"
   - 标签显示积分消耗
   - 使用积分生成

5. **已充值用户**
   - 无论是否有免费券，都使用积分模式
   - 按钮显示 "Generate Video"
   - 标签显示积分消耗

### 8.2 边界情况

- 音频时长为 0 的情况
- 音频时长刚好为 15 秒的情况
- 音频时长刚好为 16 秒的情况
- 分辨率切换时的模式变化
- 积分不足时的弹窗处理

---

## 9. 注意事项

1. **试用优先级：** 即使有赠送积分，未充值用户符合试用条件时优先使用免费券
2. **已充值用户：** 已充值用户（`userLevel > 0`）不使用免费券，始终使用积分
3. **积分检查：** 即使显示 "Generate Video"，在 `handleGenerate` 中仍会检查积分是否足够
4. **一致性：** 所有相关组件使用相同的判断逻辑，确保用户体验一致

---

## 10. 未来扩展

如需添加新的模型或修改试用条件：

1. **在 `trial-config.ts` 中添加新模型：**
   ```typescript
   export type TrialModelKey = 'infinitetalk' | 'newmodel';
   ```

2. **添加对应的试用配置：**
   ```typescript
   newmodel: {
     isTrialEligible: (params: NewModelTrialParams) => {
       // 自定义试用条件
     }
   }
   ```

3. **在组件中使用：**
   ```typescript
   const trialAccess = useTrialAccess('newmodel', { ... });
   ```


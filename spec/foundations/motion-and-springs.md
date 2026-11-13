# 物理运动系统与四端弹簧映射 (`motion-and-springs`)

> 源码对齐：AOSP `ExpressiveMotionTokens.kt` & `StandardMotionTokens.kt` (`v0_14_0`)
> 代码事实源：`packages/tokens/src/motion.ts` (`EXPRESSIVE_MOTION_SCHEME`, `resolveCrossPlatformSpring`)

---

## 1. 核心铁律：Spatial 与 Effects 双轨分离

在 Material 3 Expressive 中，**严禁**对所有属性套用同一个缓动曲线。动画必须严格拆分为两个正交物理域：

| 物理域 | 控制属性 | 阻尼比约束 ($\zeta$) | 允许过冲 (Overshoot) | 违规后果 |
| :--- | :--- | :--- | :--- | :--- |
| **`spatial`（空间弹簧）** | 位置 (`x/y`)、尺寸 (`width/height`)、缩放 (`scale`)、圆角 (`cornerRadius`)、多边形顶点形变 (`morph`) | Expressive: $\zeta \in [0.6, 0.8]$<br>Standard: $\zeta = 0.9$ | **允许**（产生真实弹性回弹） | 若用线性/普通贝塞尔，组件失去 M3E 生命力 |
| **`effects`（视觉效果弹簧）** | 背景色 (`backgroundColor`)、前景色 (`color`)、不透明度 (`opacity`)、边框色 | **强制 $\zeta = 1.0$（临界阻尼）** | **绝对禁止 ($0\%$)** | 若将欠阻尼弹簧用于 `opacity` 或颜色，会产生越界闪烁或刺眼色偏 |

---

## 2. 官方弹簧参数矩阵（单位质量 $m = 1.0$）

### Expressive Motion Scheme（默认推荐）

| Token Key | 物理域 | $\zeta$ (`dampingRatio`) | $k$ (`stiffness`) | 阻尼系数 $c = 2\zeta\sqrt{k}$ | 峰值过冲 | 典型适用场景 |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `fastSpatial` | Spatial | `0.6` | `800` | `33.94` | `9.48%` | 按钮按压圆角收缩、按钮组 15% 挤压、分段列表选中圆角分离、开关拨动 |
| `defaultSpatial` | Spatial | `0.8` | `380` | `31.19` | `1.52%` | 抽屉展开、卡片布局重排、弹出面板位移 |
| `slowSpatial` | Spatial | `0.8` | `200` | `22.63` | `1.52%` | 全屏转场、大型 Hero 容器形变 |
| `fastEffects` | Effects | `1.0` | `3800` | `123.29` | `0%` | 按钮悬停/按压颜色混合、图标显隐 |
| `defaultEffects` | Effects | `1.0` | `1600` | `80.00` | `0%` | 容器状态背景切换、蒙层渐显 |
| `slowEffects` | Effects | `1.0` | `800` | `56.57` | `0%` | 大面积主题背景渐变 |

### Standard Motion Scheme（高密度工具/克制场景）

| Token Key | $\zeta$ (`dampingRatio`) | $k$ (`stiffness`) | 阻尼系数 $c = 2\zeta\sqrt{k}$ | 峰值过冲 |
| :--- | :---: | :---: | :---: | :---: |
| `fastSpatial` | `0.9` | `1400` | `67.35` | `0.15%` |
| `defaultSpatial` | `0.9` | `700` | `47.62` | `0.15%` |
| `slowSpatial` | `0.9` | `300` | `31.18` | `0.15%` |
| `fast/default/slowEffects` | `1.0` | `3800 / 1600 / 800` | `123.29 / 80.00 / 56.57` | `0%` |

---

## 3. 四大生态精确数学换算公式

所有平台统一求解二阶常微分方程：

$$
m \ddot{x}(t) + c \dot{x}(t) + k (x(t) - 1) = 0, \quad m = 1, \quad c = 2 \zeta \sqrt{k}
$$

不同 UI 框架接收的构造参数不同，必须按以下精确公式转换（或直接读取 `resolveCrossPlatformSpring(spec)` 输出）：

### Jetpack Compose (Kotlin)
Compose 原生接收 `(dampingRatio, stiffness)`，无需换算：
```kotlin
// fastSpatial (Expressive)
spring<Float>(dampingRatio = 0.6f, stiffness = 800.0f)
```

### SwiftUI (iOS 17+ / macOS 14+)
SwiftUI 的 `Spring(mass:stiffness:damping:)` 第三个参数是**粘性阻尼系数 $c$**（而非无量纲阻尼比 $\zeta$！）：
```swift
// c = 2 * 0.6 * sqrt(800) = 33.94
let fastSpatial = Spring(mass: 1.0, stiffness: 800, damping: 33.94)
// 或使用周期与弹跳度构造：response = 2π / sqrt(k) = 0.2221, bounce = 1 - ζ = 0.4
let altFastSpatial = Spring(duration: 0.2221, bounce: 0.4)
```

### Flutter (Dart)
`SpringDescription.withDampingRatio` 直接接收无量纲 `ratio`：
```dart
final fastSpatial = SpringDescription.withDampingRatio(
  mass: 1.0,
  stiffness: 800.0,
  ratio: 0.6,
);
```

### Web (`motion/react` 与原生 CSS `linear()`)
1. **可打断物理弹簧（推荐用于几何属性）**：`motion` 的 `damping` 同样是阻尼系数 $c = 2\zeta\sqrt{k}$：
   ```ts
   { type: "spring", mass: 1, stiffness: 800, damping: 33.94 }
   ```
2. **纯 CSS `linear()` 采样回退（推荐用于 `effects` 颜色过渡）**：
   先声明 `ease-out` 兜底，再声明 32 点解析采样 `linear(...)`；在 `@media (prefers-reduced-motion: reduce)` 下将空间弹簧阻尼比收敛至 $\zeta = 1.0$（消除弹跳但不粗暴清零全部过渡反馈）。

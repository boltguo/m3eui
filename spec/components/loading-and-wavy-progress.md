# 7 多边形形变加载器与参数化波浪进度条 (`loading-and-wavy-progress`)

> 源码对齐：AOSP `LoadingIndicator.kt`、`MaterialShapes.kt`、`WavyProgressIndicator.kt`、`LinearProgressIndicatorTokens.kt`
> 代码事实源：`packages/tokens/src/shapes.ts` & `packages/tokens/src/wavy.ts`

---

## Part A：`LoadingIndicator`（7 多边形循环形变加载器）

### 1. 为什么各端自己画多边形会失真？

AOSP 原生实现依赖 `androidx.graphics.shapes` 的 `RoundedPolygon` 圆角切线裁剪与 `Morph` 弧长特征配对。若由 SwiftUI、Flutter 或 Web 开发者各自手写 SVG/Path 近似，会出现顶点错位、翻转扭曲（twist）或旋转裁切。

**本仓库解决方案**：`packages/tokens/src/shapes.ts` 将官方 `MaterialShapes` 精确归一化至 `[0..1] × [0..1]`（中心 `(0.5, 0.5)`，统一顺时针绕序，起始角对齐 3 点钟方向 `0 rad`），并通过 **弧长并集 De Casteljau 精确细分** 导出预配对数组 `LOADING_INDICATOR_MORPH_SEQUENCE`：
- 每一对 `MorphPair` 严格满足 `startCubics.length === endCubics.length`；
- 任意平台只需对 8 元组 `[x0, y0, c1x, c1y, c2x, c2y, x1, y1]` 执行**纯线性插值**即可获得 100% 一致的丝滑形变：

$$
C_k(p) = C^{\text{start}}_k + p \cdot \left(C^{\text{end}}_k - C^{\text{start}}_k\right)
$$

### 2. 官方 7 形变序列与运动时间轴

1. **循环顺序**：`SoftBurst` → `Cookie9Sided` → `Pentagon` → `Pill` → `Sunny` → `Cookie4Sided` → `Oval` →（回到 `SoftBurst`）。
2. **尺寸与防裁切缩放**：
   - 默认容器尺寸：`48 × 48`（`ContainedLoadingIndicator` 背景为正圆 `primaryContainer`，图形色为 `onPrimaryContainer`；无容器版图形色为 `primary`）。
   - 活动图形基准比例：`ActiveIndicatorScale = 38 / 48 ≈ 0.7917`，再乘以旋转最大外接圆安全系数 `calculateIndicatorScaleFactor`（确保斜向胶囊 `Pill` / `Oval` 在旋转与弹簧过冲时绝不触碰边界）。
3. **双层复合旋转 + 弹簧步进**：
   - 每隔 **`MorphIntervalMillis = 650ms`** 触发一次形变步进；
   - 步内形变进度 $p(t)$ 由欠阻尼弹簧 **`spring(dampingRatio = 0.6, stiffness = 200)`** 驱动从 `0 -> 1`（在 `~220ms` 处产生约 `9.5%` 的有机弹性膨胀过冲，并在 `650ms` 步末收敛至 `0.999` 平滑切入下一形态）；
   - **总瞬时旋转角（顺时针）**：

$$
\theta(t) = \underbrace{p(t) \times 90^\circ + \text{stepIndex} \times 90^\circ}_{\text{每步四分之一圈弹性跃迁}} + \underbrace{\frac{t_{\text{total}} \bmod 4666}{4666} \times 360^\circ}_{\text{4666ms 匀速全局自转}}
$$

---

## Part B：`WavyProgressIndicator`（线性波浪进度条）

### 1. 几何尺寸常数 (`WAVY_PROGRESS_TOKENS`)

| 参数 | 数值（逻辑像素） | 规范说明 |
| :--- | :---: | :--- |
| `containerHeight` | `10` | 容器总高度 |
| `strokeWidth` | `4` | 激活波浪与轨道线宽（两端均为圆头 `StrokeCap.Round`） |
| `maxAmplitudePx` | `3` | 波峰偏离中心线的最大振幅 $(10 - 4) / 2 = 3$，确保圆头描边绝不纵向裁切 |
| `determinateWavelength` | `40` | 确定性进度模式默认波长 $\lambda$ |
| `indeterminateWavelength` | `20` | 不确定加载模式默认波长 $\lambda$ |
| `waveSpeed` | `1 λ / sec` | 相位以每秒 **1 个完整波长** 的恒定速度向前推进 |
| `trackActiveGap` | `4` | 激活波浪末端与右侧静止直线轨道之间的净空隙（需额外扣除两侧半圆线帽 `strokeWidth`） |
| `stopIndicatorSize` | `4` | 确定性模式下轨道最右端的终点圆点直径（当 `progress >= 0.98` 时隐藏） |

### 2. 确定性端点振幅自动收平规则 (`indicatorAmplitude`)

许多第三方实现从 `1%` 到 `99%` 全程保持最大波浪振幅，导致进度极小时只有半截扭曲短线、接近 `100%` 时末端无法干净闭合。AOSP `WavyProgressIndicatorDefaults.indicatorAmplitude` 规定：

$$
A_{\text{target}}(\text{progress}) = \begin{cases}
0, & \text{progress} \le 0.10 \;\text{或}\; \text{progress} \ge 0.95 \\
1, & 0.10 < \text{progress} < 0.95
\end{cases}
$$

当目标振幅在 `0` 与 `1` 之间切换时，实际渲染振幅以 **`DurationLong2 = 500ms`** 平滑过渡。

### 3. 无抖动 Hermite 三次贝塞尔波浪拟合 (`buildSinusoidSvgPath`)

对于任意区间 $[x_{\text{start}}, x_{\text{end}}]$ 上的正弦波 $y(x) = y_c + A \sin(\omega (x - \phi))$（其中 $\omega = 2\pi / \lambda$），将其按不大于 $\lambda / 4$ 的步长 $\Delta x$ 等分，利用精确导数 $y'(x) = A\omega\cos(\omega(x - \phi))$ 构造 C1 连续 Hermite 三次贝塞尔控制点：

$$
C_1 = \left(x_a + \frac{\Delta x}{3},\; y(x_a) + \frac{\Delta x}{3} y'(x_a)\right), \quad
C_2 = \left(x_b - \frac{\Delta x}{3},\; y(x_b) - \frac{\Delta x}{3} y'(x_b)\right)
$$

该公式对任意连续变化的浮点端点 `xEnd` 均无跳帧或端点漂移，在 Web `SVGPath`、SwiftUI `Path.addCurve`、Flutter `Path.cubicTo` 与 Compose `Path.cubicTo` 中完全通用。

---

## Part C：`CircularWavyProgressIndicator`（极坐标环形波浪进度条）

### 1. 为什么环形波浪必须「整波瓣数指数量化」？

在环形进度条中，若直接把线性波长 $\lambda = 15$ 代入极角弧长公式而不做整数量化，当进度接近 `100%` 首尾合拢时，周长 $2\pi R_0$ 往往不是 $\lambda$ 的整数倍，导致 12 点钟接缝处出现明显的**折角断层（Seam Kink）**。

`packages/tokens/src/wavy.ts` (`CIRCULAR_WAVY_TOKENS`) 严格执行以下极坐标几何约束：
- 默认容器尺寸 `size = 48`、线宽 `strokeWidth = 4`、径向波幅 `maxAmplitudePx = 1.6`、轨隙 `trackActiveGap = 4`；
- 基准中心半径：
  $$R_0 = \frac{\text{size} - \text{strokeWidth}}{2} - A_{\max} = \frac{48 - 4}{2} - 1.6 = 20.4\text{px}$$
- **整波瓣数量化 (`resolveCircularWaveLobes`)**：
  $$N = \max\left(4,\; \text{round}\left(\frac{2\pi R_0}{\lambda_{\text{target}}}\right)\right) = \text{round}\left(\frac{128.18}{15}\right) = 9$$
  由于 $N \in \mathbb{Z}^+$，极径方程 $r(\theta) = R_0 + A \sin\left(N(\theta - \theta_0) - \phi\right)$ 天然满足 $r(\theta_0 + 2\pi) = r(\theta_0)$ 且 $r'(\theta_0 + 2\pi) = r'(\theta_0)$，在 `100%` 处实现零折角 $C^1$ 光滑闭合！

### 2. 极坐标 Hermite 切向量精确转换 (`buildPolarWavyArcSvgPath`)

对极角区间 $[\theta_a, \theta_b]$（步长 $h = \theta_b - \theta_a \le \frac{\pi}{2N}$），由链式法则直接求得笛卡尔切向量：

$$
\begin{aligned}
x(\theta) &= c_x + r(\theta)\cos\theta, & x'(\theta) &= r'(\theta)\cos\theta - r(\theta)\sin\theta \\
y(\theta) &= c_y + r(\theta)\sin\theta, & y'(\theta) &= r'(\theta)\sin\theta + r(\theta)\cos\theta
\end{aligned}
$$

控制点为 $C_1 = \mathbf{P}(\theta_a) + \frac{h}{3}\mathbf{P}'(\theta_a)$、$C_2 = \mathbf{P}(\theta_b) - \frac{h}{3}\mathbf{P}'(\theta_b)$。当 $A = 0$（如静止轨道或 `<=10%` / `>=95%` 自动收平区间）时，同一公式自动退化为高精度圆弧。

---

## Part D：官方全量 `35 / 35` `MaterialShapes` 几何目录与任意互变

除 `LoadingIndicator` 使用的 7 个形状外，`packages/tokens/src/shapes.ts` 已完整收录 AOSP `MaterialShapes.kt` 全部 **35 种官方归一化形状**（用于徽章容器、头像裁剪、徽记按钮与状态形变）：

| 分类 | 包含形状 (`M3EShapeName`) |
| :--- | :--- |
| **基础几何 (10)** | `circle`, `square`, `slanted`, `arch`, `fan`, `arrow`, `semiCircle`, `oval`, `pill`, `triangle` |
| **多面与宝石 (4)** | `diamond`, `clamShell`, `pentagon`, `gem` |
| **阳光与曲奇星章 (7)** | `sunny`, `verySunny`, `cookie4Sided`, `cookie6Sided`, `cookie7Sided`, `cookie9Sided`, `cookie12Sided` |
| **有机花叶与爆炸贴纸 (10)** | `ghostish`, `clover4Leaf`, `clover8Leaf`, `burst`, `softBurst`, `boom`, `softBoom`, `flower`, `puffy`, `puffyDiamond` |
| **像素与情感符号 (4)** | `pixelCircle`, `pixelTriangle`, `bun`, `heart` |

通过 `getShapeMorphPair(from, to)`，全部 $35 \times 35 = 1,225$ 种形状组合均可按需生成等长三次贝塞尔控制点对并由 `fastSpatial` / `defaultSpatial` 弹簧平滑驱动形变。

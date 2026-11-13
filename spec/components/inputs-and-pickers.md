# 表单控件、校验编排与日期时间选择器规范 (`inputs-and-pickers`)

本文档涵盖 `m3eui` 中全部输入类、选择类、表单编排类与日期时间选择组件的几何参数、无障碍契约与国际化行为。

---

## 一、表单编排与分组 (`Form` & `Fieldset`)

1. **`Form` (`@base-ui/react/form`)**
   - 统一支持 `validationMode` (`"onSubmit" | "onBlur" | "onChange"`) 与服务端异步错误字典 `errors: Record<string, string | string[]>`。
   - 当 `showErrorSummary` 开启且存在校验错误时，顶部自动渲染 `role="alert"` 汇总横幅，标题通过 `t("form.errorSummaryHeading", { count })` 本地化，点击任意错误项可将焦点精准移至对应输入控件。
   - **反模式禁令**：切勿在表单填完前将提交按钮设为 `disabled`；保持提交按钮可点击，由 `Form` 触发校验并引导屏幕阅读器定位错误字段。

2. **`Fieldset` (`@base-ui/react/fieldset`)**
   - 通过 `BaseFieldset.Legend render={<legend />}` 严格保证原生 `<legend>` 是 `<fieldset>` 的**第一个直接子元素**，确保所有主流屏幕阅读器正确播报分组上下文。

---

## 二、文本、数值、验证码与搜索输入

| 组件 | 底层原语 | M3E 几何与交互契约 |
| :--- | :--- | :--- |
| **`TextField` / `TextareaField`** | `Field` + `Input` | `Outlined` (`12px` 四角) 与 `Filled` (`12px 12px 0 0` 平底指示线)；格式说明置于输入框上方以防移动端软键盘与自动填充浮层遮挡；`email`/`url`/`search`/`password` 自动关闭 `autocorrect`、`autocapitalize` 与 `spellcheck`；支持 `React.forwardRef<HTMLInputElement>`。 |
| **`NumberField`** | `NumberField` | 两侧连接式步进按钮采用外侧 `22px` 半胶囊、内缝 `4px`（按压软化至 `10px`，RTL 自动镜像左右圆角），支持标签 Scrub 拖拽增减。 |
| **`OTPField`** | `OTPField` | 相邻验证码槽位采用 `2px` 接缝分段连接圆角；当前聚焦槽位自动通过空间弹簧脱出为独立 `[16, 16, 16, 16]` 圆角并渐进增强支持 WebOTP API。 |
| **`SearchBar`** | `Autocomplete` | `56px` 全胶囊搜索栏 + `28px` 同心圆（内项 `20px`）建议浮层；完整监听 `compositionstart` / `compositionend`，杜绝中文/日文 IME 拼音组词阶段误提交。 |
| **`Select` & `Combobox`** | `Select` / `Combobox` | 浮层采用 `16px` 外圆角 + `6px` 内边距 = `10px` 选项圆角（选中态 `12px` `secondary-container` 胶囊），避免多层嵌套背景撞色。 |
| **`Switch` / `Checkbox` / `Radio` / `Slider`** | 对应 Base UI 原语 | `Switch` 按压滑块膨胀至 `28px` 并在 RTL 下自动取反位移符号；`Slider` 注册全局 `window` `pointerup` / `pointercancel` 确保松手瞬间手柄由 `2px` 恢复至 `4px`。 |

---

## 三、无时区漂移日期与模拟表盘时间选择器

### 3.1 `DockedDatePicker` / `DatePickerField` / `DateRangePicker`
- **纯日期数据模型**：统一采用 `YYYY-MM-DD` 纯字符串（`PlainDateRange = { start: string; end: string }`），绝不把日历日期暴露给宿主时区敏感的 `new Date(isoString)`。
- **动态本地化**：顶部提示、年月按钮、周一至周日表头以及已选日期摘要全部由 `useM3EI18n()` 与 UTC 锚定 `Intl.DateTimeFormat(locale)` 实时生成。
- **连续区间色带**：`DateRangePicker` 支持任意先后顺序点击两次自动归序（先点 20 日再点 12 日自动生成 `12..20`），悬停态实时预览连续胶囊色带。

### 3.2 `TimePicker` / `TimePickerField`
- **256px 极坐标双环表盘**：
  - 12 小时制：单外环 `1..12`（半径 `92px`）+ 垂直分段连接式 `AM/PM` 切换器（本地化自 `timePicker.am` / `timePicker.pm`）。
  - 24 小时制：外环 `00..11`（半径 `92px`）+ 内环 `12..23`（半径 `58px`），指针长度随内外环通过 `fastSpatial` 空间弹簧平滑伸缩。
- **最短弧度解缠绕**：跨 `11 → 12` 或 `55 → 00` 时自动选取 `[-180°, +180°]` 最短角位移，杜绝表盘指针逆向绕行整圈。
- **表盘 / 键盘双模式**：左下角按钮支持一键在模拟表盘与双数字框键盘输入模式间无损切换。

import * as React from "react";
import {
  Button,
  Chip,
  Combobox,
  type ComboboxOption,
  DatePickerField,
  DatePickerDialog,
  DateRangePicker,
  DateRangePickerField,
  DateTimePickerField,
  DockedDatePicker,
  Fieldset,
  Form,
  MultiCombobox,
  MultiSelect,
  NumberField,
  OTPField,
  type PlainDateRange,
  Select,
  type SelectOption,
  type SelectOptionGroup,
  Switch,
  TextareaField,
  TextField,
  TimePicker,
  TimePickerDialog,
  TimePickerField,
} from "m3eui";
import { useCopyResolver } from "../../i18n";
import {
  BarChartIcon,
  FolderIcon,
  RefreshIcon,
  SearchIcon,
  SendIcon,
  SettingsGearIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TerminalIcon,
  UsersIcon,
} from "../../layout/Icons";
import type { ComponentDocSpec } from "../types";

/* -------------------------------------------------------------------------- */
/* Shared Options & Demo Helpers                                              */
/* -------------------------------------------------------------------------- */

const CLOUD_REGION_GROUPS: readonly SelectOptionGroup[] = [
  {
    label: "Asia Pacific",
    options: [
      {
        value: "ap-northeast-1",
        label: "Tokyo (ap-northeast-1)",
        description: "Low-latency edge cluster · 4ms RTT",
        icon: <SparkleIcon size={15} />,
      },
      {
        value: "ap-southeast-1",
        label: "Singapore (ap-southeast-1)",
        description: "Multi-AZ sovereign availability zone",
        icon: <ShieldCheckIcon size={15} />,
      },
    ],
  },
  {
    label: "North America & Europe",
    options: [
      {
        value: "us-west-2",
        label: "Oregon (us-west-2)",
        description: "GPU inference & training pool",
        icon: <BarChartIcon size={15} />,
      },
      {
        value: "eu-central-1",
        label: "Frankfurt (eu-central-1)",
        description: "GDPR-isolated compliance boundary",
        icon: <FolderIcon size={15} />,
      },
    ],
  },
];

const WORKSPACE_ROLE_OPTIONS: readonly SelectOption[] = [
  {
    value: "owner",
    label: "Workspace Owner",
    description: "Full billing, security policy, and key rotation control",
    icon: <ShieldCheckIcon size={15} />,
  },
  {
    value: "maintainer",
    label: "Maintainer",
    description: "Can publish releases, manage tokens, and review PRs",
    icon: <SettingsGearIcon size={15} />,
  },
  {
    value: "contributor",
    label: "Contributor",
    description: "Read/write access to staging branches and previews",
    icon: <UsersIcon size={15} />,
  },
  {
    value: "auditor",
    label: "Compliance Auditor (Enterprise)",
    description: "Requires Enterprise SSO plan upgrade",
    disabled: true,
  },
];

const ENVIRONMENT_OPTIONS: readonly SelectOption[] = [
  { value: "development", label: "Development · Sandbox" },
  { value: "staging", label: "Staging · Pre-release" },
  { value: "production", label: "Production · Multi-region" },
  {
    value: "govcloud",
    label: "FedRAMP Isolated (Locked)",
    disabled: true,
  },
];

const PACKAGE_COMBOBOX_OPTIONS: readonly ComboboxOption[] = [
  {
    value: "spring-physics",
    label: "SpringSimulation ODE",
    description: "Analytical 2nd-order underdamped, critical & overdamped solver",
  },
  {
    value: "monet-hct",
    label: "AOSP Monet SPEC_2025",
    description: "HCT perceptual dynamic color engine with 9 palette schemes",
  },
  {
    value: "rounded-polygon",
    label: "RoundedPolygon Morphing",
    description: "35 Material 3 Expressive shapes with smooth vertex interpolation",
  },
  {
    value: "bidi-cldr",
    label: "CLDR & BiDi Directionality",
    description: "Locale-aware pluralization, calendar grids, and RTL corner flipping",
  },
  {
    value: "webgpu-shader",
    label: "WebGPU Surface Shader (Experimental)",
    description: "Hardware-locked feature flag",
    disabled: true,
  },
];

/* -------------------------- 1. TextField Demos ---------------------------- */

function TextFieldVariantsDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 740 }}>
      <TextField
        variant="outlined"
        label={c({ zh: "工作区标识 (Outlined)", en: "Workspace handle (Outlined)" })}
        defaultValue="m3e-design-system"
        description={c({
          zh: "用于 CLI 拉取命令与公开预览域名。",
          en: "Used in CLI pull commands and preview URLs.",
        })}
      />
      <TextField
        variant="filled"
        label={c({ zh: "显示名称 (Filled)", en: "Display name (Filled)" })}
        defaultValue="Material 3 Expressive"
        description={c({
          zh: "在团队导航栏与通知邮件中展示。",
          en: "Shown across team navigation headers and notifications.",
        })}
      />
    </div>
  );
}

function TextFieldAffixesDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 760 }}>
      <TextField
        variant="outlined"
        label={c({ zh: "自定义子域名", en: "Custom subdomain" })}
        prefixText="https://"
        suffixText=".m3e.dev"
        defaultValue="tokens"
        description={c({
          zh: "自动签发通配符 TLS 证书。",
          en: "Wildcard TLS certificate provisioned automatically.",
        })}
      />
      <TextField
        variant="filled"
        label={c({ zh: "月度预算上限", en: "Monthly budget cap" })}
        prefixText="$"
        suffixText="USD"
        defaultValue="2,400"
        inputMode="decimal"
        description={c({
          zh: "达到 80% 时触发告警钩子。",
          en: "Triggers webhook alert at 80% utilization.",
        })}
      />
      <TextField
        variant="outlined"
        label={c({ zh: "检索 API 路由", en: "Filter API routes" })}
        leadingIcon={<SearchIcon size={16} />}
        placeholder="/v2/palettes..."
      />
      <TextField
        variant="filled"
        label={c({ zh: "CLI 命名空间", en: "CLI namespace" })}
        leadingIcon={<TerminalIcon size={15} />}
        trailingIcon={<ShieldCheckIcon size={16} />}
        defaultValue="@m3eui/primitives"
      />
    </div>
  );
}

function TextFieldPasswordClearDemo() {
  const c = useCopyResolver();
  const [query, setQuery] = React.useState("color-scheme: expressive");

  return (
    <div className="demo-grid-2" style={{ maxWidth: 740 }}>
      <TextField
        type="password"
        label={c({ zh: "Webhook 签名密钥", en: "Webhook signing secret" })}
        defaultValue="whsec_m3e_98f2a41c7e"
        description={c({
          zh: "内置密码显隐切换按钮，自动关闭拼写检查。",
          en: "Built-in visibility toggle with spellcheck disabled.",
        })}
      />
      <TextField
        clearable
        variant="filled"
        label={c({ zh: "可一键清空检索词", en: "Clearable filter query" })}
        leadingIcon={<SearchIcon size={16} />}
        value={query}
        onValueChange={setQuery}
        placeholder={c({ zh: "输入筛选条件…", en: "Type a filter expression…" })}
        description={c({
          zh: "非空且可编辑时右侧显示一键清除按钮。",
          en: "Inline clear action appears automatically while populated.",
        })}
      />
    </div>
  );
}

function TextFieldValidationCountDemo() {
  const c = useCopyResolver();
  const [email, setEmail] = React.useState("alex@personal-mail.io");
  const [summary, setSummary] = React.useState(
    "Expressive spring physics & HCT dynamic color tokens.",
  );
  const isInvalidEmail = !email.trim().endsWith("@m3e.dev");

  return (
    <div className="demo-grid-2" style={{ maxWidth: 740 }}>
      <TextField
        type="email"
        required
        clearable
        label={c({ zh: "企业邮箱 (@m3e.dev)", en: "Corporate email (@m3e.dev)" })}
        value={email}
        onValueChange={setEmail}
        invalid={isInvalidEmail}
        errorMessage={c({
          zh: "必须使用以 @m3e.dev 结尾的企业域邮箱。",
          en: "Must use a verified @m3e.dev corporate address.",
        })}
        description={c({
          zh: "输入后缀改为 @m3e.dev 可实时解除错误态。",
          en: "Change domain to @m3e.dev to resolve validation.",
        })}
      />
      <TextField
        variant="filled"
        label={c({ zh: "版本简述", en: "Release summary" })}
        value={summary}
        onValueChange={setSummary}
        maxLength={72}
        showCharacterCount
        description={c({
          zh: "实时显示当前字数与上限比值。",
          en: "Live character counter paired with maxLength.",
        })}
      />
    </div>
  );
}

function TextFieldDisabledReadOnlyDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 760 }}>
      <TextField
        variant="outlined"
        disabled
        label={c({ zh: "组织 ID (Outlined 禁用)", en: "Organization ID (Outlined disabled)" })}
        defaultValue="org_01J9M3EXPRESSIVE"
      />
      <TextField
        variant="filled"
        disabled
        label={c({ zh: "计费周期 (Filled 禁用)", en: "Billing cycle (Filled disabled)" })}
        defaultValue="Enterprise Annual"
      />
      <TextField
        variant="outlined"
        readOnly
        label={c({ zh: "回调地址 (Outlined 只读)", en: "Callback URL (Outlined read-only)" })}
        defaultValue="https://hooks.m3e.dev/v1/events"
        description={c({
          zh: "允许聚焦与复制文本，但不可修改。",
          en: "Focusable for keyboard selection & copy, non-editable.",
        })}
      />
      <TextField
        variant="filled"
        readOnly
        label={c({ zh: "合规驻留区 (Filled 只读)", en: "Residency lock (Filled read-only)" })}
        defaultValue="ap-northeast-1 · Tokyo"
        description={c({
          zh: "由安全管理员策略锁定。",
          en: "Locked by organization security policy.",
        })}
      />
    </div>
  );
}

function TextFieldOutsideTextareaDemo() {
  const c = useCopyResolver();
  const [notes, setNotes] = React.useState(
    "Added analytical ODE spring corner morphing across inputs, steppers, and popovers.",
  );

  return (
    <div className="demo-grid-2" style={{ maxWidth: 760, alignItems: "start" }}>
      <TextField
        labelPosition="outside"
        required
        label={c({ zh: "发布版本标签 (外部固定标签)", en: "Release tag (Outside label)" })}
        placeholder="v2.4.0-rc.1"
        defaultValue="v2.4.0"
        description={c({
          zh: "labelPosition=\"outside\" 将标题与字数统计置于容器上方。",
          en: "labelPosition=\"outside\" renders a static label row above a 48px shell.",
        })}
      />
      <TextareaField
        label={c({ zh: "变更说明 (TextareaField)", en: "Changelog notes (TextareaField)" })}
        rows={4}
        maxLength={200}
        showCharacterCount
        value={notes}
        onValueChange={setNotes}
        description={c({
          zh: "多行文本域同样支持缺口浮动标签与字数统计。",
          en: "Multiline field with notched floating label and live counter.",
        })}
      />
    </div>
  );
}

/* ------------------------- 2. NumberField Demos --------------------------- */

function NumberFieldBasicDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 700 }}>
      <div className="demo-panel">
        <span className="demo-panel__label">
          {c({ zh: "标准步进器 (支持拖拽标签调值)", en: "Standard integer stepper (Scrubbable label)" })}
        </span>
        <NumberField
          label={c({ zh: "并发工作线程", en: "Worker concurrency" })}
          defaultValue={4}
          min={1}
          max={32}
        />
      </div>
      <div className="demo-panel">
        <span className="demo-panel__label">
          {c({ zh: "Intl 货币格式化容器", en: "Intl currency format on tonal surface" })}
        </span>
        <NumberField
          label={c({ zh: "单席位预算", en: "Per-seat credit" })}
          defaultValue={120}
          step={10}
          min={0}
          max={1000}
          format={{
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }}
        />
      </div>
    </div>
  );
}

function NumberFieldBoundsDemo() {
  const c = useCopyResolver();
  const [damping, setDamping] = React.useState<number | null>(3.5);

  return (
    <div className="demo-panel" style={{ maxWidth: 420 }}>
      <NumberField
        label={c({ zh: "弹簧增益系数 (0 – 10, 步长 0.5)", en: "Spring gain factor (0 – 10, step 0.5)" })}
        min={0}
        max={10}
        step={0.5}
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        value={damping}
        onValueChange={setDamping}
      />
      <div className="demo-row" style={{ gap: 8 }}>
        <Chip tone="primary" size="sm" dot>
          {c({ zh: "当前值", en: "Value" })}: {damping !== null ? damping.toFixed(1) : "null"}
        </Chip>
        {damping === 0 ? (
          <Chip tone="warning" size="sm">
            {c({ zh: "已达下限 (min=0)", en: "At minimum (0)" })}
          </Chip>
        ) : null}
        {damping === 10 ? (
          <Chip tone="warning" size="sm">
            {c({ zh: "已达上限 (max=10)", en: "At maximum (10)" })}
          </Chip>
        ) : null}
      </div>
    </div>
  );
}

function NumberFieldValidationDemo() {
  const c = useCopyResolver();
  const [replicas, setReplicas] = React.useState<number | null>(1);
  const isInvalid = replicas === null || replicas < 2 || replicas % 2 !== 0;

  return (
    <div className="demo-panel" style={{ maxWidth: 440 }}>
      <NumberField
        label={c({ zh: "高可用副本数 (需为 ≥ 2 的偶数)", en: "HA cluster replicas (Even integer ≥ 2)" })}
        min={1}
        max={16}
        step={1}
        required
        value={replicas}
        onValueChange={setReplicas}
      />
      {isInvalid ? (
        <div className="m3e-field__error" role="alert">
          <span>
            {c({
              zh: "生产环境要求至少 2 个且为偶数的副本以实现跨可用区仲裁。",
              en: "Production quorum requires an even replica count of at least 2.",
            })}
          </span>
        </div>
      ) : (
        <Chip tone="success" size="sm" dot>
          {c({
            zh: `配额校验通过（${replicas} 副本跨区均衡）`,
            en: `Quorum valid (${replicas} balanced replicas)`,
          })}
        </Chip>
      )}
      <div className="demo-row" style={{ gap: 8 }}>
        <Button size="xs" variant="tonal" onClick={() => setReplicas(4)}>
          {c({ zh: "设为合规值 (4)", en: "Set valid (4)" })}
        </Button>
        <Button size="xs" variant="outlined" onClick={() => setReplicas(3)}>
          {c({ zh: "测试奇数告警 (3)", en: "Test odd count (3)" })}
        </Button>
      </div>
    </div>
  );
}

function NumberFieldDisabledDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 680 }}>
      <div className="demo-panel">
        <span className="demo-panel__label">
          {c({ zh: "禁用态 (disabled)", en: "Disabled state" })}
        </span>
        <NumberField
          disabled
          label={c({ zh: "预留 GPU 卡数", en: "Reserved GPU nodes" })}
          defaultValue={8}
        />
      </div>
      <div className="demo-panel">
        <span className="demo-panel__label">
          {c({ zh: "只读态 (readOnly)", en: "Read-only state" })}
        </span>
        <NumberField
          readOnly
          label={c({ zh: "分片副本基线", en: "Shard factor baseline" })}
          defaultValue={16}
        />
      </div>
    </div>
  );
}

/* ---------------------------- 3. Select Demos ----------------------------- */

function SelectVariantsDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 720 }}>
      <Select
        variant="outlined"
        label={c({ zh: "部署环境 (Outlined)", en: "Environment (Outlined)" })}
        defaultValue="staging"
        options={ENVIRONMENT_OPTIONS}
        description={c({
          zh: "缺口式浮动标签轮廓与旋转箭头弹簧。",
          en: "Notched floating outline with spring-animated chevron.",
        })}
      />
      <Select
        variant="filled"
        label={c({ zh: "部署环境 (Filled)", en: "Environment (Filled)" })}
        defaultValue="production"
        options={ENVIRONMENT_OPTIONS}
        description={c({
          zh: "填充容器底部激活指示条样式。",
          en: "Tonal surface container with active bottom indicator.",
        })}
      />
    </div>
  );
}

function SelectGroupsDescriptionsDemo() {
  const c = useCopyResolver();
  return (
    <div style={{ maxWidth: 380 }}>
      <Select
        label={c({ zh: "主计算区域", en: "Primary compute region" })}
        defaultValue="ap-northeast-1"
        groups={CLOUD_REGION_GROUPS}
        description={c({
          zh: "支持分组标题、前置图标与双行副标题说明。",
          en: "Supports section group headers, leading icons, and two-line option descriptions.",
        })}
      />
    </div>
  );
}

function SelectClearableDemo() {
  const c = useCopyResolver();
  const [role, setRole] = React.useState<string | null>("maintainer");

  return (
    <div style={{ maxWidth: 380, display: "flex", flexDirection: "column", gap: 12 }}>
      <Select
        clearable
        label={c({ zh: "成员角色权限", en: "Member role" })}
        placeholder={c({ zh: "未分配角色…", en: "Unassigned…" })}
        options={WORKSPACE_ROLE_OPTIONS}
        value={role}
        onValueChange={setRole}
        description={c({
          zh: "点击右侧 × 按钮可一键重置回占位状态。",
          en: "Click the inline clear button to reset back to placeholder.",
        })}
      />
      <div className="demo-row" style={{ gap: 8 }}>
        <Chip tone={role ? "primary" : "neutral"} size="sm" dot>
          value: {role ?? "null"}
        </Chip>
        {!role ? (
          <Button size="xs" variant="tonal" onClick={() => setRole("owner")}>
            {c({ zh: "恢复为 Owner", en: "Restore Owner" })}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SelectValidationDemo() {
  const c = useCopyResolver();
  const [cluster, setCluster] = React.useState<string | null>(null);
  const isInvalid = cluster === null;

  return (
    <div style={{ maxWidth: 380 }}>
      <Select
        required
        clearable
        label={c({ zh: "目标发布集群", en: "Target release cluster" })}
        placeholder={c({ zh: "请选择目标集群…", en: "Choose a cluster…" })}
        options={ENVIRONMENT_OPTIONS}
        value={cluster}
        onValueChange={setCluster}
        invalid={isInvalid}
        description={c({
          zh: "选中任意集群后错误提示自动消除，清空后重新触发。",
          en: "Select an environment to resolve the error, or clear to re-trigger.",
        })}
        errorMessage={c({
          zh: "发版流水线必须指定一个目标部署集群。",
          en: "A target deployment cluster is required before rollout.",
        })}
      />
    </div>
  );
}

function SelectDisabledDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-3" style={{ maxWidth: 820 }}>
      <Select
        variant="outlined"
        disabled
        label={c({ zh: "Outlined 禁用触发器", en: "Outlined disabled" })}
        defaultValue="production"
        options={ENVIRONMENT_OPTIONS}
      />
      <Select
        variant="filled"
        disabled
        label={c({ zh: "Filled 禁用触发器", en: "Filled disabled" })}
        defaultValue="staging"
        options={ENVIRONMENT_OPTIONS}
      />
      <Select
        label={c({ zh: "含禁用菜单项", en: "Disabled option item" })}
        defaultValue="maintainer"
        options={WORKSPACE_ROLE_OPTIONS}
        description={c({
          zh: "打开菜单查看置灰锁定的 Auditor 项。",
          en: "Open menu to inspect the locked Enterprise option.",
        })}
      />
    </div>
  );
}

/* --------------------------- 4. Combobox Demos ---------------------------- */

function ComboboxBasicDemo() {
  const c = useCopyResolver();
  return (
    <div style={{ maxWidth: 380 }}>
      <Combobox
        label={c({ zh: "检索架构子系统", en: "Search architecture module" })}
        placeholder={c({ zh: "输入关键字过滤…", en: "Type to filter modules…" })}
        emptyMessage={c({ zh: "未找到匹配的子系统模块", en: "No matching subsystem found" })}
        options={PACKAGE_COMBOBOX_OPTIONS}
        defaultValue={PACKAGE_COMBOBOX_OPTIONS[0]}
      />
    </div>
  );
}

function ComboboxControlledDemo() {
  const c = useCopyResolver();
  const [selected, setSelected] = React.useState<ComboboxOption | null>(
    PACKAGE_COMBOBOX_OPTIONS[1] ?? null,
  );

  return (
    <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>
      <Combobox
        label={c({ zh: "受控模块选择器", en: "Controlled module picker" })}
        options={PACKAGE_COMBOBOX_OPTIONS}
        value={selected}
        onValueChange={setSelected}
      />
      <div className="demo-row" style={{ gap: 8 }}>
        <Chip tone={selected ? "primary" : "neutral"} size="sm" dot>
          {selected ? `${selected.label} (${selected.value})` : c({ zh: "未选择 (null)", en: "None (null)" })}
        </Chip>
        <Button
          size="xs"
          variant="outlined"
          leadingIcon={<RefreshIcon size={13} />}
          onClick={() => setSelected(null)}
        >
          {c({ zh: "重置选择", en: "Reset" })}
        </Button>
        <Button
          size="xs"
          variant="tonal"
          onClick={() => setSelected(PACKAGE_COMBOBOX_OPTIONS[2] ?? null)}
        >
          {c({ zh: "选中多边形引擎", en: "Pick Polygon" })}
        </Button>
      </div>
    </div>
  );
}

function ComboboxVariantsDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 740 }}>
      <Combobox
        variant="outlined"
        label={c({ zh: "Outlined 自动补全", en: "Outlined Combobox" })}
        options={PACKAGE_COMBOBOX_OPTIONS}
        defaultValue={PACKAGE_COMBOBOX_OPTIONS[0]}
      />
      <Combobox
        variant="filled"
        label={c({ zh: "Filled 自动补全", en: "Filled Combobox" })}
        options={PACKAGE_COMBOBOX_OPTIONS}
        defaultValue={PACKAGE_COMBOBOX_OPTIONS[3]}
      />
    </div>
  );
}

function ComboboxDisabledDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 740 }}>
      <Combobox
        variant="outlined"
        disabled
        label={c({ zh: "锁定的核心引擎 (Outlined)", en: "Locked core engine (Outlined)" })}
        options={PACKAGE_COMBOBOX_OPTIONS}
        defaultValue={PACKAGE_COMBOBOX_OPTIONS[0]}
      />
      <Combobox
        variant="filled"
        disabled
        label={c({ zh: "锁定的色彩规范 (Filled)", en: "Locked color spec (Filled)" })}
        options={PACKAGE_COMBOBOX_OPTIONS}
        defaultValue={PACKAGE_COMBOBOX_OPTIONS[1]}
      />
    </div>
  );
}

/* --------------------------- 5. OTPField Demos ---------------------------- */

function OTPBasicDemo() {
  const c = useCopyResolver();
  const [code, setCode] = React.useState("482");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
      <OTPField
        length={6}
        separatorAfterIndex={2}
        label={c({ zh: "双因素认证动态码", en: "Two-factor verification code" })}
        helperText={c({
          zh: "请输入验证器应用生成的 6 位数字，第 3 位后自动分组。",
          en: "Enter the 6-digit authenticator code grouped 3–3.",
        })}
        value={code}
        onValueChange={setCode}
      />
      <div className="demo-row" style={{ gap: 8 }}>
        <Chip tone={code.length === 6 ? "success" : "neutral"} size="sm" dot>
          {code.length === 6
            ? c({ zh: `已填满：${code}`, en: `Complete: ${code}` })
            : `${code.length} / 6`}
        </Chip>
        <Button size="xs" variant="tonal" onClick={() => setCode("591042")}>
          {c({ zh: "填入示例 591042", en: "Fill 591042" })}
        </Button>
        <Button size="xs" variant="outlined" onClick={() => setCode("")}>
          {c({ zh: "清空", en: "Clear" })}
        </Button>
      </div>
    </div>
  );
}

function OTPPinDemo() {
  const c = useCopyResolver();
  const [pin, setPin] = React.useState("7391");
  const [masked, setMasked] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380 }}>
      <OTPField
        length={4}
        separatorAfterIndex={4}
        mask={masked}
        label={c({ zh: "设备解锁 4 位 PIN", en: "4-digit hardware PIN" })}
        helperText={c({
          zh: "紧凑连续 4 槽位布局，支持圆点掩码切换。",
          en: "Compact 4-slot continuous group with optional PIN masking.",
        })}
        value={pin}
        onValueChange={setPin}
      />
      <div className="demo-row" style={{ gap: 14 }}>
        <Chip tone="primary" size="sm" dot>
          PIN: {pin || "—"}
        </Chip>
        <Switch
          checked={masked}
          onCheckedChange={setMasked}
          label={c({ zh: "掩码隐藏 (mask)", en: "Mask digits" })}
        />
      </div>
    </div>
  );
}

function OTPInvalidDemo() {
  const c = useCopyResolver();
  const [code, setCode] = React.useState("918273");
  const expected = "246810";
  const isComplete = code.length === 6;
  const isInvalid = isComplete && code !== expected;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 440 }}>
      <OTPField
        length={6}
        separatorAfterIndex={2}
        label={c({ zh: "安全确认验证码 (正确码: 246810)", en: "Security challenge (Expected: 246810)" })}
        helperText={c({
          zh: "输入完整 6 位后自动核对，不匹配时呈现校验失败告警。",
          en: "Automatically verifies upon 6 digits; mismatches surface an alert.",
        })}
        value={code}
        onValueChange={setCode}
      />
      {isInvalid ? (
        <div className="m3e-field__error" role="alert">
          <span>
            {c({
              zh: "验证码不匹配或已过期，请核对后重试（测试正确码：246810）。",
              en: "Verification code expired or incorrect. Try test code 246810.",
            })}
          </span>
        </div>
      ) : isComplete ? (
        <Chip tone="success" size="sm" dot>
          {c({ zh: "验证通过 · 会话已授权", en: "Verified · Session authorized" })}
        </Chip>
      ) : null}
      <div className="demo-row" style={{ gap: 8 }}>
        <Button size="xs" variant="tonal" onClick={() => setCode("246810")}>
          {c({ zh: "填入正确码 (246810)", en: "Fill valid (246810)" })}
        </Button>
        <Button size="xs" variant="outlined" onClick={() => setCode("918273")}>
          {c({ zh: "模拟错误码", en: "Simulate mismatch" })}
        </Button>
      </div>
    </div>
  );
}

function OTPDisabledDemo() {
  const c = useCopyResolver();
  return (
    <div style={{ maxWidth: 400 }}>
      <OTPField
        disabled
        length={6}
        separatorAfterIndex={2}
        defaultValue="849201"
        label={c({ zh: "已锁定的硬件令牌验证码", en: "Locked hardware token code" })}
        helperText={c({
          zh: "审批通过后只读锁定，禁止再次修改或聚焦。",
          en: "Disabled after security key confirmation.",
        })}
      />
    </div>
  );
}

/* -------------------------- 6. DatePicker Demos --------------------------- */

function DatePickerFieldDemo() {
  const c = useCopyResolver();
  const [launchDate, setLaunchDate] = React.useState("2026-05-18");
  const [cutoffDate, setCutoffDate] = React.useState("2026-06-01");

  return (
    <div className="demo-grid-2" style={{ maxWidth: 720, alignItems: "end" }}>
      <DatePickerField
        labelPosition="floating"
        label={c({ zh: "发版目标日 (浮动缺口标签)", en: "Release date (Floating label)" })}
        value={launchDate}
        onValueChange={setLaunchDate}
      />
      <DatePickerField
        labelPosition="outside"
        label={c({ zh: "特性冻结日 (外部顶置标签)", en: "Feature freeze (Outside label)" })}
        value={cutoffDate}
        onValueChange={setCutoffDate}
      />
    </div>
  );
}

function DockedDatePickerDemo() {
  const c = useCopyResolver();
  const [selectedDate, setSelectedDate] = React.useState("2026-05-20");

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", gap: 24 }}>
      <DockedDatePicker
        title={c({ zh: "里程碑日历", en: "Milestone calendar" })}
        value={selectedDate}
        onValueChange={setSelectedDate}
      />
      <div className="demo-panel" style={{ minWidth: 220 }}>
        <span className="demo-panel__label">
          {c({ zh: "ISO PlainDate 输出", en: "ISO PlainDate value" })}
        </span>
        <Chip tone="primary" dot>
          {selectedDate}
        </Chip>
      </div>
    </div>
  );
}

function DateRangePickerDemo() {
  const c = useCopyResolver();
  const [range, setRange] = React.useState<PlainDateRange>({
    start: "2026-05-10",
    end: "2026-05-19",
  });

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", gap: 24 }}>
      <DateRangePicker
        title={c({ zh: "冲刺迭代周期", en: "Sprint interval" })}
        value={range}
        onValueChange={setRange}
      />
      <div className="demo-panel" style={{ minWidth: 240 }}>
        <span className="demo-panel__label">
          {c({ zh: "起止日期区间", en: "Selected date interval" })}
        </span>
        <Chip tone="primary" dot>
          {range.start} → {range.end}
        </Chip>
      </div>
    </div>
  );
}

function DatePickerDisabledBoundsDemo() {
  const c = useCopyResolver();
  const minDate = "2026-05-01";
  const maxDate = "2026-05-31";
  const [windowDate, setWindowDate] = React.useState("2026-05-15");
  const isOutOfBounds = windowDate < minDate || windowDate > maxDate;

  return (
    <div className="demo-grid-2" style={{ maxWidth: 740, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <DatePickerField
          label={c({
            zh: "合规窗口日期 (2026-05-01 至 05-31)",
            en: "Window date (2026-05-01 .. 05-31)",
          })}
          value={windowDate}
          onValueChange={setWindowDate}
        />
        {isOutOfBounds ? (
          <div className="m3e-field__error" role="alert">
            <span>
              {c({
                zh: `所选日期 ${windowDate} 超出允许窗口（${minDate} 至 ${maxDate}）。`,
                en: `Selected ${windowDate} falls outside ${minDate} – ${maxDate}.`,
              })}
            </span>
          </div>
        ) : (
          <Chip tone="success" size="sm" dot>
            {c({ zh: `在允许窗口内：${windowDate}`, en: `Within window: ${windowDate}` })}
          </Chip>
        )}
      </div>

      <DatePickerField
        disabled
        label={c({ zh: "归档封板日期 (禁用态)", en: "Archived cutoff date (Disabled)" })}
        defaultValue="2026-04-30"
      />
    </div>
  );
}

/* -------------------------- 7. TimePicker Demos --------------------------- */

function TimePicker12hDemo() {
  const c = useCopyResolver();
  const [standupTime, setStandupTime] = React.useState("09:30");

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", gap: 24 }}>
      <TimePicker
        use24Hour={false}
        title={c({ zh: "12 小时模拟表盘", en: "12-hour analog dial" })}
        value={standupTime}
        onValueChange={setStandupTime}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 260 }}>
        <TimePickerField
          use24Hour={false}
          label={c({ zh: "每日站会时间", en: "Daily standup" })}
          value={standupTime}
          onValueChange={setStandupTime}
        />
        <div className="demo-panel">
          <span className="demo-panel__label">
            {c({ zh: "24h 标准存储值", en: "Normalized HH:mm value" })}
          </span>
          <Chip tone="primary" dot>
            {standupTime}
          </Chip>
        </div>
      </div>
    </div>
  );
}

function TimePicker24hKeyboardDemo() {
  const c = useCopyResolver();
  const [deployTime, setDeployTime] = React.useState("21:45");

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", gap: 24 }}>
      <TimePicker
        use24Hour
        defaultInputMode="keyboard"
        title={c({ zh: "24h 键盘直输模式", en: "24-hour keyboard entry" })}
        value={deployTime}
        onValueChange={setDeployTime}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 260 }}>
        <TimePickerField
          use24Hour
          label={c({ zh: "维护窗口起点 (UTC)", en: "Maintenance window (UTC)" })}
          value={deployTime}
          onValueChange={setDeployTime}
        />
        <div className="demo-panel">
          <span className="demo-panel__label">
            {c({
              zh: "点击右上角图标可在键盘与双环 24h 表盘间切换",
              en: "Toggle header icon to switch between keyboard & dual-ring 24h dial",
            })}
          </span>
          <Chip tone="primary" dot>
            UTC {deployTime}
          </Chip>
          <TimePickerDialog
            variant="vibrant"
            use24Hour
            value={deployTime}
            onValueChange={setDeployTime}
            trigger={<Button size="xs" variant="tonal">Open Vibrant TimePickerDialog</Button>}
          />
          <DatePickerDialog
            mode="range"
            trigger={<Button size="xs" variant="outlined">Open Range DatePickerDialog</Button>}
          />
        </div>
      </div>
    </div>
  );
}

function TimePickerDisabledDemo() {
  const c = useCopyResolver();
  return (
    <div className="demo-grid-2" style={{ maxWidth: 680, alignItems: "end" }}>
      <TimePickerField
        disabled
        labelPosition="floating"
        label={c({ zh: "备份快照时刻 (浮动标签禁用)", en: "Snapshot schedule (Floating disabled)" })}
        defaultValue="03:00"
      />
      <TimePickerField
        disabled
        use24Hour
        labelPosition="outside"
        label={c({ zh: "审计归档时刻 (外部标签禁用)", en: "Audit cutoff (Outside disabled)" })}
        defaultValue="23:59"
      />
    </div>
  );
}

/* ------------------------ 8. Form & Fieldset Demos ------------------------ */

function FormValidationSummaryDemo() {
  const c = useCopyResolver();
  const [slug, setSlug] = React.useState("m3e");
  const [ownerEmail, setOwnerEmail] = React.useState("lead@invalid");
  const [region, setRegion] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({
    slug: "Workspace slug must be at least 4 characters.",
    ownerEmail: "Enter a valid @m3e.dev administrator email.",
    region: "Select a primary deployment region.",
  });

  const validateNow = (nextSlug: string, nextEmail: string, nextRegion: string | null) => {
    const nextErrors: Record<string, string> = {};
    if (nextSlug.trim().length < 4) {
      nextErrors.slug = c({
        zh: "工作区短标识长度至少需要 4 个字符。",
        en: "Workspace slug must be at least 4 characters.",
      });
    }
    if (!nextEmail.trim().endsWith("@m3e.dev")) {
      nextErrors.ownerEmail = c({
        zh: "管理员邮箱必须使用 @m3e.dev 企业域名。",
        en: "Administrator email must end with @m3e.dev.",
      });
    }
    if (!nextRegion) {
      nextErrors.region = c({
        zh: "必须指定主计算区域。",
        en: "Please select a primary compute region.",
      });
    }
    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateNow(slug, ownerEmail, region);
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  };

  return (
    <Form
      showErrorSummary
      errors={errors}
      onSubmit={handleSubmit}
      style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 18 }}
    >
      <TextField
        name="slug"
        required
        label={c({ zh: "工作区标识 (≥ 4 字符)", en: "Workspace slug (≥ 4 chars)" })}
        prefixText="m3e.dev/"
        value={slug}
        onValueChange={(v) => {
          setSlug(v);
          setSubmitted(false);
        }}
        invalid={Boolean(errors.slug)}
        errorMessage={errors.slug}
      />

      <TextField
        name="ownerEmail"
        type="email"
        required
        clearable
        label={c({ zh: "管理员邮箱 (@m3e.dev)", en: "Admin email (@m3e.dev)" })}
        value={ownerEmail}
        onValueChange={(v) => {
          setOwnerEmail(v);
          setSubmitted(false);
        }}
        invalid={Boolean(errors.ownerEmail)}
        errorMessage={errors.ownerEmail}
      />

      <Select
        name="region"
        required
        clearable
        label={c({ zh: "主计算区域", en: "Primary region" })}
        groups={CLOUD_REGION_GROUPS}
        value={region}
        onValueChange={(v) => {
          setRegion(v);
          setSubmitted(false);
        }}
        invalid={Boolean(errors.region)}
        errorMessage={errors.region}
      />

      <div className="demo-row" style={{ gap: 10 }}>
        <Button type="submit" leadingIcon={<SendIcon size={15} />}>
          {c({ zh: "校验并提交", en: "Validate & Submit" })}
        </Button>
        <Button
          type="button"
          variant="tonal"
          onClick={() => {
            const validSlug = "expressive-ui";
            const validEmail = "architect@m3e.dev";
            const validRegion = "ap-northeast-1";
            setSlug(validSlug);
            setOwnerEmail(validEmail);
            setRegion(validRegion);
            setErrors({});
            setSubmitted(true);
          }}
        >
          {c({ zh: "填入合规示例", en: "Fill valid values" })}
        </Button>
        {submitted ? (
          <Chip tone="success" dot>
            {c({ zh: "提交成功！", en: "Provisioned!" })}
          </Chip>
        ) : null}
      </div>
    </Form>
  );
}

function FieldsetGroupingDemo() {
  const c = useCopyResolver();
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [auditStream, setAuditStream] = React.useState(false);

  return (
    <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 20 }}>
      <Fieldset
        variant="tonal"
        legend={c({ zh: "服务端点配置 (Tonal Fieldset)", en: "Service endpoint (Tonal Fieldset)" })}
        description={c({
          zh: "使用语义化 <fieldset> 与 <legend> 对关联合同字段进行无障碍分组。",
          en: "Semantic <fieldset> + <legend> grouping related service identity fields.",
        })}
      >
        <div className="demo-grid-2">
          <TextField
            label={c({ zh: "服务名称", en: "Service name" })}
            defaultValue="token-compiler"
          />
          <Select
            label={c({ zh: "运行环境", en: "Runtime tier" })}
            defaultValue="production"
            options={ENVIRONMENT_OPTIONS}
          />
        </div>
      </Fieldset>

      <Fieldset
        variant="outlined"
        legend={c({ zh: "安全与密钥策略 (Outlined Fieldset)", en: "Security & key rotation (Outlined Fieldset)" })}
        description={c({
          zh: "轮廓线分组适合承载开关与安全合规策略。",
          en: "Outlined container cleanly frames boolean security toggles.",
        })}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Switch
            showIcons
            checked={autoRotate}
            onCheckedChange={setAutoRotate}
            label={c({ zh: "每 90 天自动轮换 KMS 密钥", en: "Auto-rotate KMS keys every 90 days" })}
            description={c({
              zh: "零停机双活签名过渡",
              en: "Zero-downtime dual-key signing window",
            })}
          />
          <Switch
            showIcons
            checked={auditStream}
            onCheckedChange={setAuditStream}
            label={c({ zh: "实时推送 SIEM 审计日志流", en: "Stream real-time SIEM audit events" })}
          />
        </div>
      </Fieldset>
    </div>
  );
}

function FieldsetDisabledDemo() {
  const c = useCopyResolver();
  return (
    <div style={{ maxWidth: 580 }}>
      <Fieldset
        disabled
        variant="outlined"
        legend={c({ zh: "变更冻结保护期 (Fieldset disabled)", en: "Change-freeze lock (Fieldset disabled)" })}
        description={c({
          zh: "在 Fieldset 上设置 disabled 会一次性同步禁用内部所有输入、步进器、开关与按钮。",
          en: "Setting disabled on Fieldset cascades native disabled state to every nested control.",
        })}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            label={c({ zh: "生产镜像标签", en: "Production image digest" })}
            defaultValue="sha256:9f84c2e10b7a"
          />
          <NumberField
            label={c({ zh: "最小实例保底数", en: "Minimum warm instances" })}
            defaultValue={6}
          />
          <Switch
            defaultChecked
            showIcons
            label={c({ zh: "强制双人审批发布", en: "Require two-person deployment approval" })}
          />
        </div>
      </Fieldset>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INPUTS_COMPONENT_DOCS Registry                                             */
/* -------------------------------------------------------------------------- */

export const INPUTS_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  /* ============================= 1. text-field ============================ */
  {
    slug: "text-field",
    title: "TextField",
    category: "inputs",
    subtitle: {
      zh: "Material 3 Expressive 单行与多行文本输入框，支持 Outlined 缺口浮动标签与 Filled 填充容器、前后缀文本与图标、密码显隐、一键清空及实时字数校验。",
      en: "Material 3 Expressive single-line and multiline text fields supporting notched Outlined and tonal Filled containers, text/icon affixes, password reveal, clear button, and character counters.",
    },
    importStatement: 'import { TextField, TextareaField } from "m3eui";',
    primitive: "@base-ui/react/field · @base-ui/react/input",
    scenarios: [
      {
        id: "textfield-variants",
        title: {
          zh: "Outlined 与 Filled 浮动标签",
          en: "Outlined vs Filled Floating Labels",
        },
        description: {
          zh: "提供带自适应 legend 缺口的 `outlined` 与顶部圆角底部指示条的 `filled` 两种视觉变体，并通过 `description` 呈现辅助说明文本。",
          en: "Choose between `outlined` with a notched legend cutout and `filled` with a tonal container and active indicator bar, paired with `description` supporting text.",
        },
        code: `import { TextField } from "m3eui";

<TextField
  variant="outlined"
  label="Workspace handle"
  defaultValue="m3e-design-system"
  description="Used in CLI pull commands and preview URLs."
/>

<TextField
  variant="filled"
  label="Display name"
  defaultValue="Material 3 Expressive"
  description="Shown across team navigation headers and notifications."
/>`,
        render: () => <TextFieldVariantsDemo />,
      },
      {
        id: "textfield-affixes",
        title: {
          zh: "前后缀文本与图标装饰",
          en: "Text Affixes & Leading/Trailing Icons",
        },
        description: {
          zh: "支持 `prefixText` / `suffixText`（如协议头、域名后缀、货币单位）以及 `leadingIcon` / `trailingIcon` 槽位。",
          en: "Compose `prefixText` and `suffixText` (such as protocol schemes, domain suffixes, or currency codes) alongside `leadingIcon` and `trailingIcon` slots.",
        },
        code: `import { TextField } from "m3eui";

<TextField
  label="Custom subdomain"
  prefixText="https://"
  suffixText=".m3e.dev"
  defaultValue="tokens"
/>

<TextField
  variant="filled"
  label="Monthly budget cap"
  prefixText="$"
  suffixText="USD"
  defaultValue="2,400"
  inputMode="decimal"
/>

<TextField
  label="Filter API routes"
  leadingIcon={<SearchIcon />}
  placeholder="/v2/palettes..."
/>`,
        render: () => <TextFieldAffixesDemo />,
      },
      {
        id: "textfield-password-clear",
        title: {
          zh: "密码显隐切换与一键清空",
          en: "Password Visibility Toggle & Clearable Input",
        },
        description: {
          zh: "`type=\"password\"` 自动渲染无障碍密码显隐按钮；`clearable` 在输入框非空且可编辑时提供一键清空操作。",
          en: "`type=\"password\"` mounts an accessible show/hide toggle automatically, while `clearable` reveals an inline reset button whenever populated.",
        },
        code: `import { TextField } from "m3eui";

<TextField
  type="password"
  label="Webhook signing secret"
  defaultValue="whsec_m3e_98f2a41c7e"
/>

<TextField
  clearable
  variant="filled"
  label="Clearable filter query"
  value={query}
  onValueChange={setQuery}
/>`,
        render: () => <TextFieldPasswordClearDemo />,
      },
      {
        id: "textfield-validation-count",
        title: {
          zh: "校验错误态与字数统计器",
          en: "Validation Errors & Character Counter",
        },
        description: {
          zh: "通过 `invalid` 与 `errorMessage` 展示带警示图标的错误提示，配合 `maxLength` + `showCharacterCount` 输出实时字符计数。",
          en: "Pair `invalid` and `errorMessage` for accessible inline error feedback, and enable `maxLength` with `showCharacterCount` for live character tracking.",
        },
        code: `import { TextField } from "m3eui";

<TextField
  type="email"
  required
  clearable
  label="Corporate email (@m3e.dev)"
  value={email}
  onValueChange={setEmail}
  invalid={!email.endsWith("@m3e.dev")}
  errorMessage="Must use a verified @m3e.dev corporate address."
/>

<TextField
  variant="filled"
  label="Release summary"
  value={summary}
  onValueChange={setSummary}
  maxLength={72}
  showCharacterCount
/>`,
        render: () => <TextFieldValidationCountDemo />,
      },
      {
        id: "textfield-disabled-readonly",
        title: {
          zh: "禁用与只读状态矩阵",
          en: "Disabled & Read-Only Matrix",
        },
        description: {
          zh: "完整对比 `outlined` 与 `filled` 两种变体下的 `disabled`（完全不可交互）与 `readOnly`（允许聚焦复制但禁止编辑）视觉反馈。",
          en: "Side-by-side matrix comparing `disabled` (non-interactive) and `readOnly` (focusable and copyable, non-editable) across `outlined` and `filled` variants.",
        },
        code: `import { TextField } from "m3eui";

<TextField variant="outlined" disabled label="Organization ID" defaultValue="org_01J9M3EXPRESSIVE" />
<TextField variant="filled" disabled label="Billing cycle" defaultValue="Enterprise Annual" />

<TextField variant="outlined" readOnly label="Callback URL" defaultValue="https://hooks.m3e.dev/v1/events" />
<TextField variant="filled" readOnly label="Residency lock" defaultValue="ap-northeast-1 · Tokyo" />`,
        render: () => <TextFieldDisabledReadOnlyDemo />,
      },
      {
        id: "textfield-outside-textarea",
        title: {
          zh: "外部固定标签与多行 TextareaField",
          en: "Outside Label Placement & Multiline TextareaField",
        },
        description: {
          zh: "`labelPosition=\"outside\"` 将标题与计数置于输入框上方；`TextareaField` 提供多行自动增高布局与字数上限统计。",
          en: "`labelPosition=\"outside\"` places a static label row above a 48px container, while `TextareaField` handles multiline prose with character counting.",
        },
        code: `import { TextField, TextareaField } from "m3eui";

<TextField
  labelPosition="outside"
  required
  label="Release tag"
  defaultValue="v2.4.0"
  description="Static outside label row above a 48px shell."
/>

<TextareaField
  label="Changelog notes"
  rows={4}
  maxLength={200}
  showCharacterCount
  value={notes}
  onValueChange={setNotes}
/>`,
        render: () => <TextFieldOutsideTextareaDemo />,
      },
    ],
    apis: [
      {
        title: "TextField Props",
        rows: [
          {
            name: "label",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "字段标签内容，默认作为浮动标签渲染。",
              en: "Field label rendered as a floating label by default.",
            },
          },
          {
            name: "variant",
            type: '"outlined" | "filled"',
            defaultValue: '"outlined"',
            description: {
              zh: "输入框容器外观变体。",
              en: "Visual container style of the text field.",
            },
          },
          {
            name: "labelPosition",
            type: '"floating" | "outside"',
            defaultValue: '"floating"',
            description: {
              zh: "标签位置：容器内浮动缺口或容器上方固定标题。",
              en: "Whether the label floats inside the shell or sits statically above it.",
            },
          },
          {
            name: "value / defaultValue",
            type: "string",
            defaultValue: '""',
            description: {
              zh: "受控值或非受控初始字符串。",
              en: "Controlled string value or uncontrolled initial string.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: string) => void",
            description: {
              zh: "文本变化或点击清空按钮时触发的回调。",
              en: "Callback fired whenever the text changes or is cleared.",
            },
          },
          {
            name: "type",
            type: '"text" | "email" | "password" | "search" | "tel" | "url"',
            defaultValue: '"text"',
            description: {
              zh: "原生输入类型；设为 `password` 时自动附带显隐切换按钮。",
              en: "Input type; `password` automatically adds a reveal toggle button.",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "辅助说明文本（Supporting text）。",
              en: "Supporting helper text displayed beneath or above the field.",
            },
          },
          {
            name: "invalid",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "标记字段进入错误校验状态。",
              en: "Marks the field as invalid and reveals the error message row.",
            },
          },
          {
            name: "errorMessage",
            type: "React.ReactNode",
            description: {
              zh: "校验失败时展示的错误信息。",
              en: "Validation error message displayed when invalid.",
            },
          },
          {
            name: "prefixText / suffixText",
            type: "React.ReactNode",
            description: {
              zh: "输入行内部的前缀与后缀固定文本（如 `https://`、`USD`）。",
              en: "Inline prefix and suffix text affixes inside the input line.",
            },
          },
          {
            name: "leadingIcon / trailingIcon",
            type: "React.ReactNode",
            description: {
              zh: "容器首尾的装饰图标槽位。",
              en: "Leading and trailing decorative icon slots.",
            },
          },
          {
            name: "clearable",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "非空且未禁用/只读时显示一键清除按钮。",
              en: "Shows an inline clear button when non-empty and editable.",
            },
          },
          {
            name: "maxLength / showCharacterCount",
            type: "number / boolean",
            defaultValue: "undefined / false",
            description: {
              zh: "最大字符限制与实时 `当前/上限` 计数器开关。",
              en: "Maximum character limit and live `current/max` counter toggle.",
            },
          },
          {
            name: "disabled / readOnly / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用、只读或必填标记状态。",
              en: "Disabled, read-only, or required field flags.",
            },
          },
        ],
      },
      {
        title: "TextareaField Props",
        rows: [
          {
            name: "label",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "多行文本域标签内容。",
              en: "Label for the multiline textarea field.",
            },
          },
          {
            name: "rows",
            type: "number",
            defaultValue: "3",
            description: {
              zh: "初始可见文本行数。",
              en: "Visible number of text lines.",
            },
          },
          {
            name: "variant",
            type: '"outlined" | "filled"',
            defaultValue: '"outlined"',
            description: {
              zh: "多行容器视觉变体。",
              en: "Visual variant of the textarea shell.",
            },
          },
          {
            name: "labelPosition",
            type: '"floating" | "outside"',
            defaultValue: '"floating"',
            description: {
              zh: "浮动标签或外部顶置标签。",
              en: "Floating notch label or static outside label.",
            },
          },
          {
            name: "value / defaultValue / onValueChange",
            type: "string / (value: string) => void",
            description: {
              zh: "受控值、初始值与变更回调。",
              en: "Controlled value, default value, and change callback.",
            },
          },
          {
            name: "maxLength / showCharacterCount",
            type: "number / boolean",
            defaultValue: "undefined / false",
            description: {
              zh: "最大字符数与字数统计显示开关。",
              en: "Character limit and live character count display.",
            },
          },
          {
            name: "invalid / errorMessage / description",
            type: "boolean / React.ReactNode",
            description: {
              zh: "错误状态、错误文案与辅助说明。",
              en: "Validation state, error message, and supporting description.",
            },
          },
          {
            name: "disabled / readOnly / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用、只读与必填状态。",
              en: "Disabled, read-only, and required flags.",
            },
          },
        ],
      },
    ],
  },

  /* ============================ 2. number-field =========================== */
  {
    slug: "number-field",
    title: "NumberField",
    category: "inputs",
    subtitle: {
      zh: "胶囊分体式数值步进输入框，具备按压圆角物理弹簧形变、标签横向拖拽调值（Scrub Area）以及 CLDR Intl 本地化数字/货币格式化能力。",
      en: "Expressive split-pill numeric stepper featuring spring-animated inner seam corners, pointer-scrubbable labels, and CLDR Intl number/currency formatting.",
    },
    importStatement: 'import { NumberField } from "m3eui";',
    primitive: "@base-ui/react/number-field",
    scenarios: [
      {
        id: "number-field-basic",
        title: {
          zh: "基础步进与本地化格式",
          en: "Standard & Formatted Steppers",
        },
        description: {
          zh: "两端胶囊步进按钮在按压时通过物理弹簧收窄内侧圆角，支持整数步进与 `Intl.NumberFormatOptions` 货币/单位格式。",
          en: "Split-pill decrement/increment buttons morph their inner seam radius on press, supporting both plain integers and `Intl.NumberFormatOptions` currency or unit formatting.",
        },
        code: `import { NumberField } from "m3eui";

<NumberField
  label="Worker concurrency"
  defaultValue={4}
  min={1}
  max={32}
/>

<NumberField
  label="Per-seat credit"
  defaultValue={120}
  step={10}
  format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
/>`,
        render: () => <NumberFieldBasicDemo />,
      },
      {
        id: "number-field-bounds",
        title: {
          zh: "上下界约束与小数步进",
          en: "Min/Max Bounds & Fractional Step",
        },
        description: {
          zh: "配置 `min={0}`、`max={10}` 与 `step={0.5}` 实现半步浮点调节，抵达边界时自动禁用对应方向的步进按钮。",
          en: "Configure `min={0}`, `max={10}`, and `step={0.5}` for fractional precision; stepper buttons automatically disable at boundary limits.",
        },
        code: `import { NumberField } from "m3eui";

<NumberField
  label="Spring gain factor (0 – 10, step 0.5)"
  min={0}
  max={10}
  step={0.5}
  format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
  value={gain}
  onValueChange={setGain}
/>`,
        render: () => <NumberFieldBoundsDemo />,
      },
      {
        id: "number-field-validation",
        title: {
          zh: "业务配额实时校验",
          en: "Quota & Policy Validation",
        },
        description: {
          zh: "结合受控 `value` 与无障碍 `role=\"alert\"` 错误提示，对奇偶仲裁副本数或配额阈值进行实时校验反馈。",
          en: "Pair controlled numeric state with inline `role=\"alert\"` validation feedback to enforce domain rules such as even quorum counts.",
        },
        code: `import { NumberField } from "m3eui";

<NumberField
  label="HA cluster replicas (Even integer ≥ 2)"
  min={1}
  max={16}
  required
  value={replicas}
  onValueChange={setReplicas}
/>
{isInvalid ? (
  <div className="m3e-field__error" role="alert">
    Production quorum requires an even replica count of at least 2.
  </div>
) : null}`,
        render: () => <NumberFieldValidationDemo />,
      },
      {
        id: "number-field-disabled",
        title: {
          zh: "禁用与只读步进器",
          en: "Disabled & Read-Only States",
        },
        description: {
          zh: "`disabled` 置灰并禁止聚焦与步进；`readOnly` 保留清晰数值供读取复制，同时锁定加减按钮与标签拖拽。",
          en: "`disabled` mutes and locks the control completely, while `readOnly` keeps the current value legible and selectable while locking steppers.",
        },
        code: `import { NumberField } from "m3eui";

<NumberField disabled label="Reserved GPU nodes" defaultValue={8} />
<NumberField readOnly label="Shard factor baseline" defaultValue={16} />`,
        render: () => <NumberFieldDisabledDemo />,
      },
    ],
    apis: [
      {
        title: "NumberField Props",
        rows: [
          {
            name: "label",
            type: "React.ReactNode",
            description: {
              zh: "显示在步进器上方且支持指针横向拖拽调值的标签。",
              en: "Label rendered inside a pointer-scrubbable area above the stepper.",
            },
          },
          {
            name: "value / defaultValue",
            type: "number | null / number",
            description: {
              zh: "受控数值或非受控初始数值。",
              en: "Controlled numeric value or initial uncontrolled number.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: number | null) => void",
            description: {
              zh: "数值通过键盘、步进按钮或拖拽更新时触发。",
              en: "Called when the value changes via input, steppers, or scrubbing.",
            },
          },
          {
            name: "min / max",
            type: "number",
            description: {
              zh: "允许的最小与最大数值边界。",
              en: "Minimum and maximum allowed numeric bounds.",
            },
          },
          {
            name: "step",
            type: "number",
            defaultValue: "1",
            description: {
              zh: "每次加减步进的增量（支持小数如 `0.5`）。",
              en: "Increment/decrement step interval (supports decimals like `0.5`).",
            },
          },
          {
            name: "format",
            type: "Intl.NumberFormatOptions",
            description: {
              zh: "基于当前 `M3EProvider` 语言的 `Intl.NumberFormat` 格式配置。",
              en: "Locale-aware `Intl.NumberFormat` options for units, percentages, or currencies.",
            },
          },
          {
            name: "disabled / readOnly / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用、只读与必填表单属性。",
              en: "Disabled, read-only, and required form flags.",
            },
          },
        ],
      },
    ],
  },

  /* =============================== 3. select ============================== */
  {
    slug: "select",
    title: "Select",
    category: "inputs",
    subtitle: {
      zh: "支持 Outlined 缺口浮动标签与 Filled 填充容器的单选 Select 与标签胶囊多选 MultiSelect，内置分组、一键清空及 +N 折叠。",
      en: "Single Select and chip-tagged MultiSelect supporting notched Outlined and Filled triggers, option groups, and +N overflow.",
    },
    importStatement: 'import { Select, MultiSelect } from "m3eui";',
    primitive: "@base-ui/react/select",
    scenarios: [
      {
        id: "select-variants",
        title: {
          zh: "Outlined 与 Filled 触发器变体",
          en: "Outlined vs Filled Select Triggers",
        },
        description: {
          zh: "与 `TextField` 保持严格的几何高度与圆角对齐：支持 `outlined` 缺口边框与 `filled` 填充底栏，展开时箭头通过弹簧旋转 180°。",
          en: "Geometrically aligned with `TextField` heights and radii across `outlined` notched and `filled` tonal shells, with a 180° spring-driven chevron.",
        },
        code: `import { Select } from "m3eui";

<Select
  variant="outlined"
  label="Environment (Outlined)"
  defaultValue="staging"
  options={ENVIRONMENT_OPTIONS}
/>

<Select
  variant="filled"
  label="Environment (Filled)"
  defaultValue="production"
  options={ENVIRONMENT_OPTIONS}
/>`,
        render: () => <SelectVariantsDemo />,
      },
      {
        id: "select-groups-descriptions",
        title: {
          zh: "分组菜单与副标题描述",
          en: "Option Groups & Descriptions",
        },
        description: {
          zh: "通过 `groups` 传入分类菜单组（`SelectOptionGroup[]`），每个选项可携带 `icon` 与 `description` 双行说明。",
          en: "Pass `groups` (`SelectOptionGroup[]`) for categorized headers, with per-option `icon` and `description` subtitles.",
        },
        code: `import { Select, type SelectOptionGroup } from "m3eui";

const REGION_GROUPS: SelectOptionGroup[] = [
  {
    label: "Asia Pacific",
    options: [
      {
        value: "ap-northeast-1",
        label: "Tokyo (ap-northeast-1)",
        description: "Low-latency edge cluster · 4ms RTT",
      },
    ],
  },
];

<Select
  label="Primary compute region"
  defaultValue="ap-northeast-1"
  groups={REGION_GROUPS}
/>`,
        render: () => <SelectGroupsDescriptionsDemo />,
      },
      {
        id: "select-clearable",
        title: {
          zh: "可一键清空的受控选择器",
          en: "Clearable Controlled Select",
        },
        description: {
          zh: "启用 `clearable` 后，当存在已选项时触发器右侧将显示清除按钮，点击可将受控值重置为 `null` 并收起浮动标签。",
          en: "With `clearable`, an inline reset button appears whenever a value is selected, resetting controlled state to `null` in one click.",
        },
        code: `import { Select } from "m3eui";

const [role, setRole] = useState<string | null>("maintainer");

<Select
  clearable
  label="Member role"
  placeholder="Unassigned…"
  options={WORKSPACE_ROLE_OPTIONS}
  value={role}
  onValueChange={setRole}
/>`,
        render: () => <SelectClearableDemo />,
      },
      {
        id: "select-validation",
        title: {
          zh: "必填校验与辅助说明文本",
          en: "Validation State & Helper Text",
        },
        description: {
          zh: "组合 `invalid`、`errorMessage` 与 `description`，在用户未选择有效目标时呈现高亮边框与无障碍告警文案。",
          en: "Combine `invalid`, `errorMessage`, and `description` to guide users when a required selection is missing.",
        },
        code: `import { Select } from "m3eui";

<Select
  required
  clearable
  label="Target release cluster"
  options={ENVIRONMENT_OPTIONS}
  value={cluster}
  onValueChange={setCluster}
  invalid={cluster === null}
  description="Select an environment to resolve the error."
  errorMessage="A target deployment cluster is required before rollout."
/>`,
        render: () => <SelectValidationDemo />,
      },
      {
        id: "select-disabled",
        title: {
          zh: "禁用触发器与单项禁用选项",
          en: "Disabled Triggers & Disabled Menu Items",
        },
        description: {
          zh: "既可通过顶层 `disabled` 锁定整个 `outlined` / `filled` 选择器，也可在单个 `SelectOption` 上标记 `disabled: true` 仅置灰特定高阶选项。",
          en: "Disable the entire trigger (`outlined` or `filled`) with `disabled`, or set `disabled: true` on individual `SelectOption` items inside an active menu.",
        },
        code: `import { Select } from "m3eui";

<Select variant="outlined" disabled label="Outlined disabled" defaultValue="production" options={ENVIRONMENT_OPTIONS} />
<Select variant="filled" disabled label="Filled disabled" defaultValue="staging" options={ENVIRONMENT_OPTIONS} />

<Select
  label="Disabled option item"
  defaultValue="maintainer"
  options={[
    { value: "maintainer", label: "Maintainer" },
    { value: "auditor", label: "Compliance Auditor (Enterprise)", disabled: true },
  ]}
/>`,
        render: () => <SelectDisabledDemo />,
      },
      {
        id: "select-multiple",
        title: {
          zh: "多选下拉与 +N 胶囊折叠 (MultiSelect)",
          en: "MultiSelect with +N Chip Overflow",
        },
        description: {
          zh: "触发器内将已选项渲染为紧凑标签，超出 maxVisibleTags 时自动聚合为本地化 +N 徽标。",
          en: "Renders selected options as compact chips inside the trigger and collapses excess items into a +N badge.",
        },
        code: `<MultiSelect
  label="Target edge regions"
  groups={CLOUD_REGION_GROUPS}
  defaultValue={["ap-northeast-1", "ap-southeast-1", "eu-central-1"]}
  maxVisibleTags={2}
/>`,
        render: () => (
          <div className="demo-panel" style={{ maxWidth: 440 }}>
            <MultiSelect
              label="Target edge regions"
              groups={CLOUD_REGION_GROUPS}
              defaultValue={["ap-northeast-1", "ap-southeast-1", "eu-central-1"]}
              maxVisibleTags={2}
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Select Props",
        rows: [
          {
            name: "options",
            type: "readonly SelectOption<Value>[]",
            defaultValue: "[]",
            description: {
              zh: "扁平选项数组（与 `groups` 二选一）。",
              en: "Flat list of selectable options (use `groups` for sectioned lists).",
            },
          },
          {
            name: "groups",
            type: "readonly SelectOptionGroup<Value>[]",
            description: {
              zh: "带分组标题的选项组列表。",
              en: "Categorized option groups rendered with section headers.",
            },
          },
          {
            name: "value / defaultValue",
            type: "Value | null",
            defaultValue: "null",
            description: {
              zh: "受控选中值或非受控默认选中值。",
              en: "Controlled selected value or initial uncontrolled selection.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: Value | null) => void",
            description: {
              zh: "选中项改变或被清空时触发。",
              en: "Callback invoked when an option is chosen or cleared.",
            },
          },
          {
            name: "variant",
            type: '"outlined" | "filled"',
            defaultValue: '"outlined"',
            description: {
              zh: "触发器容器视觉变体。",
              en: "Trigger container visual variant.",
            },
          },
          {
            name: "labelPosition",
            type: '"floating" | "outside"',
            defaultValue: '"floating"',
            description: {
              zh: "标签布局：浮动缺口标签或外部顶置标签。",
              en: "Floating label inside the trigger or static label above it.",
            },
          },
          {
            name: "label / placeholder",
            type: "string",
            description: {
              zh: "字段标题与未选择时的占位提示语。",
              en: "Field label text and unselected placeholder string.",
            },
          },
          {
            name: "clearable",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "有选中值时允许一键重置为 `null`。",
              en: "Renders an inline clear button to reset selection to `null`.",
            },
          },
          {
            name: "description / errorMessage / invalid",
            type: "React.ReactNode / React.ReactNode / boolean",
            defaultValue: "false (invalid)",
            description: {
              zh: "辅助说明文本、错误提示文案与校验失败状态。",
              en: "Supporting helper text, error message, and invalid flag.",
            },
          },
          {
            name: "disabled / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用整个触发器或标记为必填项。",
              en: "Disables the select trigger or marks it required.",
            },
          },
        ],
      },
      {
        title: "SelectOption & SelectOptionGroup",
        rows: [
          {
            name: "option.value",
            type: "Value (string)",
            required: true,
            description: {
              zh: "选项唯一字符串标识。",
              en: "Unique string identifier for the option.",
            },
          },
          {
            name: "option.label",
            type: "string",
            required: true,
            description: {
              zh: "主显示文本。",
              en: "Primary display text for the option.",
            },
          },
          {
            name: "option.description",
            type: "string",
            description: {
              zh: "可选的第二行辅助描述文本。",
              en: "Optional secondary subtitle rendered beneath the label.",
            },
          },
          {
            name: "option.icon",
            type: "React.ReactNode",
            description: {
              zh: "选项前置图标节点。",
              en: "Optional leading icon rendered inside the menu item.",
            },
          },
          {
            name: "option.disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "单独禁用该菜单选项。",
              en: "Disables selection of this specific option.",
            },
          },
          {
            name: "group.label / group.options",
            type: "string / readonly SelectOption<Value>[]",
            required: true,
            description: {
              zh: "分组标题与该组包含的选项列表。",
              en: "Section header label and array of options within the group.",
            },
          },
        ],
      },
      {
        title: "MultiSelect Props",
        rows: [
          {
            name: "value / defaultValue / onValueChange",
            type: "readonly Value[] / (value: Value[]) => void",
            defaultValue: "[]",
            description: {
              zh: "受控或默认多选值数组及变更回调。",
              en: "Controlled or initial selected array and change handler.",
            },
          },
          {
            name: "maxVisibleTags",
            type: "number",
            defaultValue: "3",
            description: {
              zh: "触发器内展开显示的最大标签数量，超出部分折叠为 +N。",
              en: "Maximum inline chips before collapsing into a +N counter.",
            },
          },
        ],
      },
    ],
  },

  /* ============================== 4. combobox ============================= */
  {
    slug: "combobox",
    title: "Combobox",
    category: "inputs",
    subtitle: {
      zh: "可输入过滤的单选 Combobox 与多选胶囊 MultiCombobox，支持首项高亮、Backspace 移除末尾标签与空结果提示。",
      en: "Searchable single Combobox and chip-based MultiCombobox with top-match highlighting and Backspace chip removal.",
    },
    importStatement: 'import { Combobox, MultiCombobox } from "m3eui";',
    primitive: "@base-ui/react/combobox",
    scenarios: [
      {
        id: "combobox-basic",
        title: {
          zh: "可搜索自动补全与选项描述",
          en: "Searchable Autocomplete with Descriptions",
        },
        description: {
          zh: "输入关键字即时过滤候选项并自动高亮最佳匹配，支持双行 `description` 说明与自定义 `emptyMessage` 无结果提示。",
          en: "Filters options as you type with `autoHighlight` enabled, rendering two-line `description` subtitles and a customizable `emptyMessage`.",
        },
        code: `import { Combobox, type ComboboxOption } from "m3eui";

const OPTIONS: ComboboxOption[] = [
  {
    value: "spring-physics",
    label: "SpringSimulation ODE",
    description: "Analytical 2nd-order underdamped, critical & overdamped solver",
  },
  {
    value: "monet-hct",
    label: "AOSP Monet SPEC_2025",
    description: "HCT perceptual dynamic color engine with 9 palette schemes",
  },
];

<Combobox
  label="Search architecture module"
  emptyMessage="No matching subsystem found"
  options={OPTIONS}
  defaultValue={OPTIONS[0]}
/>`,
        render: () => <ComboboxBasicDemo />,
      },
      {
        id: "combobox-controlled",
        title: {
          zh: "受控选择与外部重置联动",
          en: "Controlled State & External Reset",
        },
        description: {
          zh: "通过 `value`（`ComboboxOption | null`）与 `onValueChange` 同步外部状态，支持外部按钮一键重置或编程式切换选项。",
          en: "Bind `value` (`ComboboxOption | null`) and `onValueChange` to inspect selection metadata or programmatically reset and assign options.",
        },
        code: `import { Button, Combobox, type ComboboxOption } from "m3eui";

const [selected, setSelected] = useState<ComboboxOption | null>(OPTIONS[1]);

<Combobox
  label="Controlled module picker"
  options={OPTIONS}
  value={selected}
  onValueChange={setSelected}
/>
<Button size="xs" variant="outlined" onClick={() => setSelected(null)}>
  Reset
</Button>`,
        render: () => <ComboboxControlledDemo />,
      },
      {
        id: "combobox-variants",
        title: {
          zh: "Outlined 与 Filled 组合框对比",
          en: "Outlined vs Filled Variants",
        },
        description: {
          zh: "同时提供缺口轮廓 `outlined` 与柔和填充 `filled` 两种容器风格，与表单内其他输入控件保持统一视觉韵律。",
          en: "Available in both notched `outlined` and tonal `filled` shells to match surrounding form controls.",
        },
        code: `import { Combobox } from "m3eui";

<Combobox variant="outlined" label="Outlined Combobox" options={OPTIONS} defaultValue={OPTIONS[0]} />
<Combobox variant="filled" label="Filled Combobox" options={OPTIONS} defaultValue={OPTIONS[1]} />`,
        render: () => <ComboboxVariantsDemo />,
      },
      {
        id: "combobox-disabled",
        title: {
          zh: "禁用状态组合框",
          en: "Disabled Combobox State",
        },
        description: {
          zh: "设置 `disabled` 后锁定输入检索与清除按钮，保留已选值用于只读上下文展示。",
          en: "Setting `disabled` locks text filtering, popup opening, and clear actions while preserving the current label.",
        },
        code: `import { Combobox } from "m3eui";

<Combobox variant="outlined" disabled label="Locked core engine" options={OPTIONS} defaultValue={OPTIONS[0]} />
<Combobox variant="filled" disabled label="Locked color spec" options={OPTIONS} defaultValue={OPTIONS[1]} />`,
        render: () => <ComboboxDisabledDemo />,
      },
      {
        id: "combobox-multiple",
        title: {
          zh: "边搜边选多标签组合框 (MultiCombobox)",
          en: "Searchable MultiCombobox",
        },
        description: {
          zh: "支持输入过滤的同时勾选多项并内嵌紧凑移除胶囊。",
          en: "Filter options while accumulating multiple removable selection chips.",
        },
        code: `<MultiCombobox
  label="Enabled subsystems"
  options={PACKAGE_COMBOBOX_OPTIONS}
  defaultValue={[PACKAGE_COMBOBOX_OPTIONS[0], PACKAGE_COMBOBOX_OPTIONS[1]]}
/>`,
        render: () => (
          <div className="demo-panel" style={{ maxWidth: 520 }}>
            <MultiCombobox
              label="Enabled subsystems"
              options={PACKAGE_COMBOBOX_OPTIONS}
              defaultValue={[
                PACKAGE_COMBOBOX_OPTIONS[0],
                PACKAGE_COMBOBOX_OPTIONS[1],
              ]}
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Combobox Props",
        rows: [
          {
            name: "options",
            type: "readonly ComboboxOption[]",
            required: true,
            description: {
              zh: "可供检索与选择的候选项列表。",
              en: "Array of searchable `ComboboxOption` items.",
            },
          },
          {
            name: "value / defaultValue",
            type: "ComboboxOption | null",
            defaultValue: "null",
            description: {
              zh: "受控选中项对象或非受控默认选项对象。",
              en: "Controlled `ComboboxOption` object or initial default option.",
            },
          },
          {
            name: "onValueChange",
            type: "(option: ComboboxOption | null) => void",
            description: {
              zh: "选项确认或清除时触发的回调。",
              en: "Called with the selected `ComboboxOption` or `null` when cleared.",
            },
          },
          {
            name: "variant",
            type: '"outlined" | "filled"',
            defaultValue: '"outlined"',
            description: {
              zh: "输入框容器视觉变体。",
              en: "Visual shell variant of the combobox.",
            },
          },
          {
            name: "labelPosition",
            type: '"floating" | "outside"',
            defaultValue: '"floating"',
            description: {
              zh: "浮动标签或容器外上方标签。",
              en: "Floating label inside the shell or static label above it.",
            },
          },
          {
            name: "label / placeholder",
            type: "React.ReactNode / string",
            description: {
              zh: "组合框标签与输入过滤占位符。",
              en: "Label element and filter input placeholder text.",
            },
          },
          {
            name: "emptyMessage",
            type: "React.ReactNode",
            description: {
              zh: "过滤无匹配项时在弹层内展示的提示内容。",
              en: "Message displayed inside the popup when no options match.",
            },
          },
          {
            name: "disabled / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用组合框或标记为必填字段。",
              en: "Disables interaction or marks the combobox required.",
            },
          },
        ],
      },
      {
        title: "ComboboxOption",
        rows: [
          {
            name: "value",
            type: "string",
            required: true,
            description: {
              zh: "选项唯一值。",
              en: "Unique string identifier compared via `isItemEqualToValue`.",
            },
          },
          {
            name: "label",
            type: "string",
            required: true,
            description: {
              zh: "主标签文本（同时用于输入匹配过滤）。",
              en: "Display label and text-matching target.",
            },
          },
          {
            name: "description",
            type: "string",
            description: {
              zh: "可选的第二行辅助说明。",
              en: "Optional secondary subtitle inside the dropdown list.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁止选择该候选项。",
              en: "Prevents selecting this option.",
            },
          },
        ],
      },
      {
        title: "MultiCombobox Props",
        rows: [
          {
            name: "value / defaultValue / onValueChange",
            type: "readonly ComboboxOption[] / (options: ComboboxOption[]) => void",
            defaultValue: "[]",
            description: {
              zh: "受控或初始已选选项对象数组及变更回调。",
              en: "Controlled or initial array of selected ComboboxOption items.",
            },
          },
        ],
      },
    ],
  },

  /* ============================== 5. otp-field ============================ */
  {
    slug: "otp-field",
    title: "OTPField",
    category: "inputs",
    subtitle: {
      zh: "一次性验证码与 PIN 码分段输入框，具备分组外圆角/内直角弹簧过渡、剪贴板整串粘贴、RTL 自动翻转及可选 WebOTP 短信自动填充。",
      en: "Segmented one-time passcode and PIN input featuring group-aware spring corner morphing, full-code paste, BiDi RTL corner flipping, and optional WebOTP autofill.",
    },
    importStatement: 'import { OTPField } from "m3eui";',
    primitive: "@base-ui/react/otp-field",
    scenarios: [
      {
        id: "otp-basic",
        title: {
          zh: "6 位双因素验证码 (3–3 分组)",
          en: "6-Digit Verification Code with Separator",
        },
        description: {
          zh: "默认 `length={6}` 且 `separatorAfterIndex={2}`，在第三位后插入连接符并将左右两组槽位各自渲染为外圆内方的连体胶囊组。",
          en: "With `length={6}` and `separatorAfterIndex={2}`, slots split into two 3-digit groups with outer pill corners and crisp inner seams.",
        },
        code: `import { OTPField } from "m3eui";

<OTPField
  length={6}
  separatorAfterIndex={2}
  label="Two-factor verification code"
  helperText="Enter the 6-digit authenticator code grouped 3–3."
  value={code}
  onValueChange={setCode}
  onValueComplete={(fullCode) => console.log("Verified:", fullCode)}
/>`,
        render: () => <OTPBasicDemo />,
      },
      {
        id: "otp-pin",
        title: {
          zh: "4 位紧凑 PIN 码与掩码切换",
          en: "4-Digit Compact PIN & Mask Toggle",
        },
        description: {
          zh: "设置 `length={4}` 与 `separatorAfterIndex={4}` 构成连续 4 位 PIN 槽，配合 `mask` 属性隐藏敏感数字并实时回显状态徽标。",
          en: "Configure `length={4}` with `separatorAfterIndex={4}` for an unbroken 4-digit PIN bar, paired with `mask` privacy mode and a live value badge.",
        },
        code: `import { OTPField } from "m3eui";

<OTPField
  length={4}
  separatorAfterIndex={4}
  mask={masked}
  label="4-digit hardware PIN"
  value={pin}
  onValueChange={setPin}
/>`,
        render: () => <OTPPinDemo />,
      },
      {
        id: "otp-invalid",
        title: {
          zh: "验证码核验失败反馈",
          en: "Verification Failure Feedback",
        },
        description: {
          zh: "结合受控状态在填满 6 位后即时比对服务端挑战码，校验不通过时输出无障碍错误提示并支持一键重填。",
          en: "Validate completed 6-digit codes against expected challenge tokens and surface clear `role=\"alert\"` error messaging on mismatch.",
        },
        code: `import { OTPField } from "m3eui";

<OTPField
  length={6}
  separatorAfterIndex={2}
  label="Security challenge"
  value={code}
  onValueChange={setCode}
/>
{code.length === 6 && code !== "246810" ? (
  <div className="m3e-field__error" role="alert">
    Verification code expired or incorrect.
  </div>
) : null}`,
        render: () => <OTPInvalidDemo />,
      },
      {
        id: "otp-disabled",
        title: {
          zh: "预填只读禁用态",
          en: "Disabled Pre-Filled OTPField",
        },
        description: {
          zh: "设置 `disabled` 与 `defaultValue` 展示已完成硬件确认且不可二次编辑的锁定令牌。",
          en: "Combine `disabled` and `defaultValue` to display a confirmed, locked verification code.",
        },
        code: `import { OTPField } from "m3eui";

<OTPField
  disabled
  length={6}
  separatorAfterIndex={2}
  defaultValue="849201"
  label="Locked hardware token code"
/>`,
        render: () => <OTPDisabledDemo />,
      },
    ],
    apis: [
      {
        title: "OTPField Props",
        rows: [
          {
            name: "length",
            type: "number",
            defaultValue: "6",
            description: {
              zh: "验证码字符槽位总数。",
              en: "Total number of character input slots.",
            },
          },
          {
            name: "separatorAfterIndex",
            type: "number",
            defaultValue: "2",
            description: {
              zh: "在该 0 基索引槽位之后渲染短横分隔符（设为 `>= length` 可隐藏分隔符）。",
              en: "Zero-based slot index after which a dash separator is rendered.",
            },
          },
          {
            name: "value / defaultValue",
            type: "string",
            description: {
              zh: "受控验证码字符串或非受控默认值。",
              en: "Controlled passcode string or initial uncontrolled value.",
            },
          },
          {
            name: "onValueChange / onValueComplete",
            type: "(value: string) => void",
            description: {
              zh: "每次字符变更回调，以及填满全部 `length` 位时的完成回调。",
              en: "Change callback and completion callback fired once `length` characters are entered.",
            },
          },
          {
            name: "label / helperText",
            type: "React.ReactNode",
            description: {
              zh: "顶部标题标签与辅助说明段落（自动绑定 `aria-describedby`）。",
              en: "Label and accessible helper description bound via `aria-describedby`.",
            },
          },
          {
            name: "mask",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否掩码隐藏已输入的敏感字符。",
              en: "Masks entered characters for sensitive PIN entry.",
            },
          },
          {
            name: "validationType",
            type: '"numeric" | "alphanumeric" | "alpha" | "none"',
            defaultValue: '"numeric"',
            description: {
              zh: "允许输入的字符集校验类型，默认仅数字并唤起移动端数字键盘。",
              en: "Allowed character class; `numeric` also sets `inputMode=\"numeric\"`.",
            },
          },
          {
            name: "enableWebOTP",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "启用浏览器 WebOTP API 自动读取短信验证码。",
              en: "Listens for SMS one-time codes via the browser WebOTP Credential API.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用全部验证码输入槽位。",
              en: "Disables all OTP character slots.",
            },
          },
        ],
      },
    ],
  },

  /* ============================= 6. date-picker =========================== */
  {
    slug: "date-picker",
    title: "DatePicker",
    category: "inputs",
    subtitle: {
      zh: "基于 ISO PlainDate（`YYYY-MM-DD`）无时区偏移设计的日期选择器套件，包含弹出式 `DatePickerField`、内嵌日历 `DockedDatePicker` 与起止区间 `DateRangePicker`。",
      en: "Timezone-safe ISO PlainDate (`YYYY-MM-DD`) calendar suite comprising popover `DatePickerField`, inline `DockedDatePicker`, and dual-endpoint `DateRangePicker`.",
    },
    importStatement:
      'import { DatePickerField, DateRangePickerField, DateTimePickerField, DatePickerDialog, DockedDatePicker, DateRangePicker } from "m3eui";',
    primitive: "@base-ui/react/popover",
    scenarios: [
      {
        id: "date-picker-field",
        title: {
          zh: "弹出式日期输入框 (DatePickerField)",
          en: "Popover DatePickerField",
        },
        description: {
          zh: "点击触发器弹出 `DockedDatePicker` 浮层，选中日期后自动收起并按当前语言本地化格式化完整日期，支持 `floating` 与 `outside` 两种标签布局。",
          en: "Opens a `DockedDatePicker` popover on click, formatting the chosen ISO date with CLDR locale rules and supporting `floating` or `outside` labels.",
        },
        code: `import { DatePickerField } from "m3eui";

<DatePickerField
  labelPosition="floating"
  label="Release date"
  value={launchDate}
  onValueChange={setLaunchDate}
/>

<DatePickerField
  labelPosition="outside"
  label="Feature freeze"
  value={cutoffDate}
  onValueChange={setCutoffDate}
/>`,
        render: () => <DatePickerFieldDemo />,
      },
      {
        id: "date-picker-docked",
        title: {
          zh: "内嵌式日历面板 (DockedDatePicker)",
          en: "Inline DockedDatePicker Surface",
        },
        description: {
          zh: "直接在页面流中渲染完整月历网格，内置年份快速跳转面板、CLDR 周首日自动推导及完整方向键（Arrow / PageUp / Home / End）无障碍导航。",
          en: "Inline calendar card with quick year-picker toggle, locale-derived first day of week, and full WAI-ARIA grid keyboard navigation.",
        },
        code: `import { DockedDatePicker } from "m3eui";

<DockedDatePicker
  title="Milestone calendar"
  value={selectedDate}
  onValueChange={setSelectedDate}
/>`,
        render: () => <DockedDatePickerDemo />,
      },
      {
        id: "date-range-picker",
        title: {
          zh: "起止日期区间选择 (DateRangePicker)",
          en: "Start & End DateRangePicker",
        },
        description: {
          zh: "两次点击依次锚定起点与终点日期，悬停期间实时预览高亮连续区间带，并自动按时间先后归一化 `{ start, end }`。",
          en: "Two-click anchor selection with live hover range highlighting and automatic chronological `{ start, end }` normalization.",
        },
        code: `import { DateRangePicker, type PlainDateRange } from "m3eui";

const [range, setRange] = useState<PlainDateRange>({
  start: "2026-05-10",
  end: "2026-05-19",
});

<DateRangePicker
  title="Sprint interval"
  value={range}
  onValueChange={setRange}
/>`,
        render: () => <DateRangePickerDemo />,
      },
      {
        id: "date-picker-disabled-bounds",
        title: {
          zh: "日期窗口范围校验与禁用态",
          en: "Date Window Constraints & Disabled State",
        },
        description: {
          zh: "利用字典序可直接比较的 `YYYY-MM-DD` 字符串实施业务日期窗口校验，并对比展示 `disabled` 锁定态的 `DatePickerField`。",
          en: "Enforce valid booking windows using lexicographically comparable `YYYY-MM-DD` strings alongside a `disabled` `DatePickerField`.",
        },
        code: `import { DatePickerField } from "m3eui";

<DatePickerField
  label="Window date (2026-05-01 .. 05-31)"
  value={windowDate}
  onValueChange={setWindowDate}
/>

<DatePickerField
  disabled
  label="Archived cutoff date"
  defaultValue="2026-04-30"
/>`,
        render: () => <DatePickerDisabledBoundsDemo />,
      },
      {
        id: "date-picker-advanced-triggers",
        title: {
          zh: "区间选择框、日期时间一体与模态选择器",
          en: "DateRangePickerField, DateTimePickerField & DatePickerDialog",
        },
        description: {
          zh: "补齐弹出式区间选择框、日期+时间组合面板以及支持“日历网格 ⇄ 键盘输入”切换的 M3 模态日期对话框，全部原生支持 minDate / maxDate / isDateDisabled。",
          en: "Popover range field, combined date-time field, and M3 modal dialog with calendar/input mode switching and minDate/maxDate bounds.",
        },
        code: `<DateRangePickerField label="Release window" minDate="2026-01-01" maxDate="2026-12-31" />
<DateTimePickerField label="Maintenance slot" />
<DatePickerDialog trigger={<Button variant="tonal" size="sm">Open DatePickerDialog</Button>} />`,
        render: () => (
          <div className="demo-panel" style={{ maxWidth: 440, gap: 14 }}>
            <DateRangePickerField
              label="Release window"
              defaultValue={{ start: "2026-05-10", end: "2026-05-18" }}
              minDate="2026-05-01"
              maxDate="2026-06-30"
            />
            <DateTimePickerField
              label="Maintenance slot"
              defaultValue={{ date: "2026-05-15", time: "14:30" }}
            />
            <div>
              <DatePickerDialog
                defaultValue="2026-05-20"
                minDate="2026-05-01"
                maxDate="2026-06-30"
                trigger={
                  <Button variant="tonal" size="sm">
                    Open DatePickerDialog
                  </Button>
                }
              />
            </div>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "DatePickerField Props",
        rows: [
          {
            name: "label",
            type: "React.ReactNode",
            description: {
              zh: "日期输入框标题标签。",
              en: "Field label for the date trigger.",
            },
          },
          {
            name: "labelPosition",
            type: '"floating" | "outside"',
            defaultValue: '"floating"',
            description: {
              zh: "缺口浮动标签或容器上方固定标签。",
              en: "Floating notched label or static outside label.",
            },
          },
          {
            name: "value / defaultValue",
            type: "PlainDateString (`YYYY-MM-DD`)",
            defaultValue: "today",
            description: {
              zh: "受控或非受控的 ISO 纯日期字符串。",
              en: "Controlled or initial ISO `YYYY-MM-DD` date string.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: string) => void",
            description: {
              zh: "用户在弹出月历中选中新日期时触发。",
              en: "Called with the selected `YYYY-MM-DD` date string.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用弹出触发按钮。",
              en: "Disables opening the calendar popover.",
            },
          },
        ],
      },
      {
        title: "DockedDatePicker Props",
        rows: [
          {
            name: "value / defaultValue",
            type: "PlainDateString (`YYYY-MM-DD`)",
            defaultValue: "today",
            description: {
              zh: "受控或初始选中的纯日期字符串。",
              en: "Controlled or default `YYYY-MM-DD` date string.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: string) => void",
            description: {
              zh: "点击日期单元格时触发。",
              en: "Callback fired when a calendar day is selected.",
            },
          },
          {
            name: "firstDayOfWeek",
            type: "number (0–6)",
            defaultValue: "CLDR locale default",
            description: {
              zh: "自定义每周起始星期（`0` 周日，`1` 周一），默认随语言自动切换。",
              en: "Overrides week start day (`0` Sun, `1` Mon); defaults to CLDR locale rule.",
            },
          },
          {
            name: "title",
            type: "React.ReactNode",
            description: {
              zh: "日历顶部眉题说明文案。",
              en: "Eyebrow heading displayed at the top of the calendar card.",
            },
          },
        ],
      },
      {
        title: "DateRangePicker Props",
        rows: [
          {
            name: "value / defaultValue",
            type: "PlainDateRange (`{ start: string; end: string }`)",
            description: {
              zh: "受控或默认的起止日期区间对象。",
              en: "Controlled or default `{ start, end }` ISO date range.",
            },
          },
          {
            name: "onValueChange",
            type: "(range: PlainDateRange) => void",
            description: {
              zh: "完成第二次点击选定完整区间时触发。",
              en: "Invoked once both start and end dates are picked.",
            },
          },
          {
            name: "firstDayOfWeek / title",
            type: "number / React.ReactNode",
            description: {
              zh: "周起始日覆盖与面板顶部眉题。",
              en: "Optional first day of week override and eyebrow title.",
            },
          },
        ],
      },
      {
        title: "Constraints & Extended Triggers",
        rows: [
          {
            name: "minDate / maxDate / isDateDisabled",
            type: "PlainDateString / PlainDateString / (iso: string) => boolean",
            description: {
              zh: "所有日期组件通用的最小/最大日期边界与按日禁用函数。",
              en: "Shared lower/upper ISO date bounds and per-day disable predicate.",
            },
          },
          {
            name: "DateRangePickerField",
            type: "M3EDateRangePickerFieldProps",
            description: {
              zh: "带浮动或缺口外部标签的弹出式双日期范围输入框。",
              en: "Popover field trigger wrapping DateRangePicker.",
            },
          },
          {
            name: "DatePickerDialog",
            type: "M3EDatePickerDialogProps",
            description: {
              zh: "M3 模态对话框日期选择器，支持日历网格与文本直输模式切换。",
              en: "M3 modal date dialog with calendar-to-text-input mode toggle.",
            },
          },
          {
            name: "DateTimePickerField",
            type: "M3EDateTimePickerFieldProps",
            description: {
              zh: "单浮层集成日历与时间选择的复合输入框（{ date, time }）。",
              en: "Combined popover picker emitting { date, time }.",
            },
          },
        ],
      },
    ],
  },

  /* ============================= 7. time-picker =========================== */
  {
    slug: "time-picker",
    title: "TimePicker",
    category: "inputs",
    subtitle: {
      zh: "Material 3 Expressive 时间选择器，支持 12 小时 AM/PM 与 24 小时内外双环模拟表盘、连续最短弧物理弹簧指针拖拽，以及键盘数字直输模式。",
      en: "Material 3 Expressive time picker featuring 12-hour AM/PM and 24-hour dual-ring analog clock dials with shortest-arc spring hand physics and keyboard input mode.",
    },
    importStatement:
      'import { TimePicker, TimePickerField, TimePickerDialog } from "m3eui";',
    primitive: "@base-ui/react/popover",
    scenarios: [
      {
        id: "time-picker-12h",
        title: {
          zh: "12 小时制 AM/PM 模拟表盘",
          en: "12-Hour AM/PM Analog Clock Dial",
        },
        description: {
          zh: "提供时/分胶囊切换与 AM/PM 分段按钮；选定小时后自动平滑过渡至分钟表盘，指针沿最短角度弧进行弹性物理旋转。",
          en: "Interactive hour/minute chips with segmented AM/PM toggle; picking an hour automatically advances to minutes with unwrapped shortest-arc spring motion.",
        },
        code: `import { TimePicker, TimePickerField } from "m3eui";

<TimePickerField
  use24Hour={false}
  label="Daily standup"
  value={time}
  onValueChange={setTime}
/>

<TimePicker
  use24Hour={false}
  value={time}
  onValueChange={setTime}
/>`,
        render: () => <TimePicker12hDemo />,
      },
      {
        id: "time-picker-24h-keyboard",
        title: {
          zh: "24 小时制与键盘直输模式",
          en: "24-Hour Mode & Keyboard Input",
        },
        description: {
          zh: "开启 `use24Hour` 支持 00–23 双环表盘，配合 `TimePicker` 的 `defaultInputMode=\"keyboard\"` 可直接键入精确时分数值。",
          en: "Enable `use24Hour` for 00–23 formatting and dual-ring dial selection, and set `defaultInputMode=\"keyboard\"` on `TimePicker` for direct numeric entry.",
        },
        code: `import { Button, TimePicker, TimePickerDialog, TimePickerField } from "m3eui";

<TimePicker
  use24Hour
  defaultInputMode="keyboard"
  title="24-hour keyboard entry"
  value={deployTime}
  onValueChange={setDeployTime}
/>

<TimePickerField
  use24Hour
  label="Maintenance window (UTC)"
  value={deployTime}
  onValueChange={setDeployTime}
/>

<TimePickerDialog
  variant="vibrant"
  use24Hour
  value={deployTime}
  onValueChange={setDeployTime}
  trigger={<Button size="xs" variant="tonal">Open Vibrant TimePickerDialog</Button>}
/>`,
        render: () => <TimePicker24hKeyboardDemo />,
      },
      {
        id: "time-picker-disabled",
        title: {
          zh: "禁用态时间选择框",
          en: "Disabled TimePickerField",
        },
        description: {
          zh: "对比展示 `floating` 缺口标签与 `outside` 顶置标签两种布局下的 `disabled` 禁用状态。",
          en: "Displays `disabled` `TimePickerField` triggers across `floating` and `outside` label placements.",
        },
        code: `import { TimePickerField } from "m3eui";

<TimePickerField
  disabled
  labelPosition="floating"
  label="Snapshot schedule"
  defaultValue="03:00"
/>

<TimePickerField
  disabled
  use24Hour
  labelPosition="outside"
  label="Audit cutoff"
  defaultValue="23:59"
/>`,
        render: () => <TimePickerDisabledDemo />,
      },
    ],
    apis: [
      {
        title: "TimePickerField Props",
        rows: [
          {
            name: "label",
            type: "React.ReactNode",
            description: {
              zh: "时间选择框标题标签。",
              en: "Label displayed on the time picker trigger.",
            },
          },
          {
            name: "labelPosition",
            type: '"floating" | "outside"',
            defaultValue: '"floating"',
            description: {
              zh: "浮动缺口标签或外部上方固定标签。",
              en: "Floating notched label or static outside label.",
            },
          },
          {
            name: "value / defaultValue",
            type: "PlainTimeString (`HH:mm`)",
            defaultValue: '"09:30"',
            description: {
              zh: "标准化 24 小时制 `HH:mm` 时间字符串。",
              en: "Normalized 24-hour `HH:mm` wall-time string.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: string) => void",
            description: {
              zh: "时间变更时返回最新 `HH:mm` 字符串。",
              en: "Invoked with the updated `HH:mm` string when time changes.",
            },
          },
          {
            name: "use24Hour",
            type: "boolean",
            defaultValue: "CLDR locale default",
            description: {
              zh: "强制使用 24 小时制或 12 小时 AM/PM 制；未传时随当前语言自动决定。",
              en: "Forces 24-hour or 12-hour AM/PM clock; defaults to CLDR locale convention.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用弹出式时间触发器。",
              en: "Disables opening the time picker popover.",
            },
          },
        ],
      },
      {
        title: "TimePicker Props",
        rows: [
          {
            name: "value / defaultValue / onValueChange",
            type: "PlainTimeString / (value: string) => void",
            defaultValue: '"09:30"',
            description: {
              zh: "受控/非受控 `HH:mm` 值与变更回调。",
              en: "Controlled/uncontrolled `HH:mm` time string and change handler.",
            },
          },
          {
            name: "use24Hour",
            type: "boolean",
            defaultValue: "CLDR locale default",
            description: {
              zh: "启用内外双圈 00–23 表盘并隐藏 AM/PM 切换器。",
              en: "Renders an inner 12–23 ring on the dial and hides the AM/PM toggle.",
            },
          },
          {
            name: "defaultInputMode",
            type: '"dial" | "keyboard"',
            defaultValue: '"dial"',
            description: {
              zh: "初始交互模式：模拟时钟表盘或数字键盘直输。",
              en: "Initial entry surface: analog clock dial or numeric keyboard fields.",
            },
          },
          {
            name: "title",
            type: "React.ReactNode",
            description: {
              zh: "面板左上角眉题文案。",
              en: "Header eyebrow title inside the picker card.",
            },
          },
        ],
      },
      {
        title: "TimePickerDialog Props",
        rows: [
          {
            name: "open / defaultOpen / onOpenChange",
            type: "boolean / (open: boolean) => void",
            description: {
              zh: "受控或非受控模态时间对话框开关状态。",
              en: "Controlled or uncontrolled modal dialog open state.",
            },
          },
          {
            name: "trigger",
            type: "React.ReactElement",
            description: {
              zh: "打开模态时间选择对话框的触发元素。",
              en: "Trigger element that opens the modal TimePickerDialog.",
            },
          },
          {
            name: "variant",
            type: '"standard" | "vibrant"',
            defaultValue: '"standard"',
            description: {
              zh: "时间对话框表面色彩风格。",
              en: "Surface color treatment of the modal time picker.",
            },
          },
        ],
      },
    ],
  },

  /* =============================== 8. form ================================ */
  {
    slug: "form",
    title: "Form",
    category: "inputs",
    subtitle: {
      zh: "结构化表单容器与语义化字段分组组件，提供统一的顶置无障碍错误汇总横幅（`showErrorSummary`）、字段级 `errors` 映射与整组级联禁用能力。",
      en: "Structured form container and semantic fieldset grouping offering an accessible `role=\"alert\"` error summary banner, field-level `errors` mapping, and cascading group disablement.",
    },
    importStatement: 'import { Form, Fieldset } from "m3eui";',
    primitive: "@base-ui/react/form · @base-ui/react/fieldset",
    scenarios: [
      {
        id: "form-validation-summary",
        title: {
          zh: "表单校验与顶置错误汇总横幅",
          en: "Form Validation & Error Summary Banner",
        },
        description: {
          zh: "启用 `showErrorSummary` 并传入 `errors` 映射对象，提交不合规数据时自动在顶部聚合渲染 `role=\"alert\"` 错误清单。",
          en: "Enable `showErrorSummary` alongside `errors` to render a consolidated `role=\"alert\"` validation summary banner on submit.",
        },
        code: `import { Button, Form, Select, TextField } from "m3eui";

<Form
  showErrorSummary
  errors={errors}
  onSubmit={handleSubmit}
>
  <TextField
    name="slug"
    required
    label="Workspace slug"
    prefixText="m3e.dev/"
    value={slug}
    onValueChange={setSlug}
    invalid={Boolean(errors.slug)}
    errorMessage={errors.slug}
  />
  <TextField
    name="ownerEmail"
    type="email"
    required
    label="Admin email (@m3e.dev)"
    value={ownerEmail}
    onValueChange={setOwnerEmail}
    invalid={Boolean(errors.ownerEmail)}
    errorMessage={errors.ownerEmail}
  />
  <Button type="submit">Validate & Submit</Button>
</Form>`,
        render: () => <FormValidationSummaryDemo />,
      },
      {
        id: "fieldset-grouping",
        title: {
          zh: "多分区 Fieldset 语义分组",
          en: "Multi-Section Fieldset Grouping",
        },
        description: {
          zh: "`Fieldset` 提供 `tonal`、`outlined` 与 `plain` 三种表面变体，将输入框、下拉框与开关清晰组织为无障碍 `<fieldset>` + `<legend>` 分区。",
          en: "`Fieldset` offers `tonal`, `outlined`, and `plain` variants to organize text fields, selects, and switches into accessible `<fieldset>` + `<legend>` sections.",
        },
        code: `import { Fieldset, Select, Switch, TextField } from "m3eui";

<Fieldset
  variant="tonal"
  legend="Service endpoint"
  description="Semantic <fieldset> + <legend> grouping related service fields."
>
  <TextField label="Service name" defaultValue="token-compiler" />
  <Select label="Runtime tier" defaultValue="production" options={ENVIRONMENT_OPTIONS} />
</Fieldset>

<Fieldset variant="outlined" legend="Security & key rotation">
  <Switch showIcons defaultChecked label="Auto-rotate KMS keys every 90 days" />
</Fieldset>`,
        render: () => <FieldsetGroupingDemo />,
      },
      {
        id: "fieldset-disabled",
        title: {
          zh: "Fieldset 整组级联禁用",
          en: "Cascading Disabled Fieldset",
        },
        description: {
          zh: "只需在顶层 `<Fieldset disabled>` 声明一次，内部嵌套的所有 `TextField`、`NumberField` 与 `Switch` 均自动继承禁用状态。",
          en: "Setting `disabled` once on `<Fieldset>` disables all nested `TextField`, `NumberField`, and `Switch` controls simultaneously.",
        },
        code: `import { Fieldset, NumberField, Switch, TextField } from "m3eui";

<Fieldset
  disabled
  variant="outlined"
  legend="Change-freeze lock"
  description="Setting disabled on Fieldset cascades to every nested control."
>
  <TextField label="Production image digest" defaultValue="sha256:9f84c2e10b7a" />
  <NumberField label="Minimum warm instances" defaultValue={6} />
  <Switch defaultChecked showIcons label="Require two-person deployment approval" />
</Fieldset>`,
        render: () => <FieldsetDisabledDemo />,
      },
    ],
    apis: [
      {
        title: "Form Props",
        rows: [
          {
            name: "errors",
            type: "Record<string, string | string[]>",
            description: {
              zh: "按字段 `name` 索引的外部校验错误映射表。",
              en: "External validation error map keyed by field `name`.",
            },
          },
          {
            name: "showErrorSummary",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "当 `errors` 非空时是否在表单顶部渲染 `role=\"alert\"` 错误汇总列表。",
              en: "Renders an accessible `role=\"alert\"` error summary banner when `errors` is non-empty.",
            },
          },
          {
            name: "validationMode",
            type: '"onSubmit" | "onBlur" | "onChange"',
            defaultValue: '"onSubmit"',
            description: {
              zh: "表单内部字段校验的触发时机。",
              en: "When field-level validation rules should run.",
            },
          },
          {
            name: "onFormSubmit",
            type: "(formValues: Record<string, unknown>, eventDetails: { event: SubmitEvent }) => void",
            description: {
              zh: "校验通过时回调结构化表单键值对象。",
              en: "Callback receiving serialized form values upon valid submission.",
            },
          },
          {
            name: "onSubmit",
            type: "React.FormEventHandler<HTMLFormElement>",
            description: {
              zh: "原生表单 `submit` 事件处理器。",
              en: "Native HTML form `submit` event handler.",
            },
          },
        ],
      },
      {
        title: "Fieldset Props",
        rows: [
          {
            name: "legend",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "渲染为语义化 `<legend>` 的分组标题。",
              en: "Group heading rendered inside a semantic `<legend>` element.",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "分组副标题说明（自动通过 `aria-describedby` 关联）。",
              en: "Optional section description linked via `aria-describedby`.",
            },
          },
          {
            name: "variant",
            type: '"tonal" | "outlined" | "plain"',
            defaultValue: '"tonal"',
            description: {
              zh: "分组容器外观：柔和填充块、轮廓边框或无背景纯排版。",
              en: "Surface presentation: tonal container, outlined card, or unstyled plain layout.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "通过原生 `<fieldset disabled>` 级联禁用组内所有表单控件。",
              en: "Cascades native disabled state to all nested form controls.",
            },
          },
        ],
      },
    ],
  },
];

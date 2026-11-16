import * as React from "react";
import {
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Slider,
  Switch,
} from "m3eui";
import { BellIcon, SparkleIcon } from "../../layout/Icons";
import type { ComponentDocSpec } from "../types";

/* -------------------------------------------------------------------------- */
/* Interactive Demo Wrappers                                                  */
/* -------------------------------------------------------------------------- */

function CheckboxBasicDemo() {
  const [agreed, setAgreed] = React.useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Checkbox
        checked={agreed}
        onCheckedChange={setAgreed}
        label={`Accept release notes & telemetry (${agreed ? "Checked" : "Unchecked"})`}
      />
      <Checkbox defaultChecked label="Automatically install security patches (Uncontrolled)" />
      <div className="demo-row" style={{ paddingTop: 6 }}>
        <Checkbox defaultChecked aria-label="Standalone checked checkbox" />
        <Checkbox aria-label="Standalone unchecked checkbox" />
        <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
          Standalone label-less checkboxes with <code>aria-label</code>
        </span>
      </div>
    </div>
  );
}

const ALL_SCOPES = ["repos", "deployments", "billing"] as const;

function CheckboxIndeterminateDemo() {
  const [selected, setSelected] = React.useState<string[]>(["repos", "deployments"]);
  const allChecked = selected.length === ALL_SCOPES.length;
  const isIndeterminate = selected.length > 0 && !allChecked;

  return (
    <div className="demo-panel" style={{ maxWidth: 440, gap: 6 }}>
      <Checkbox
        checked={allChecked}
        indeterminate={isIndeterminate}
        onCheckedChange={() => {
          setSelected(allChecked ? [] : [...ALL_SCOPES]);
        }}
        label={`Select all API scopes (${selected.length}/${ALL_SCOPES.length})`}
      />
      <div
        style={{
          paddingInlineStart: 24,
          borderInlineStart: "2px solid var(--m3e-color-outline-variant)",
          marginInlineStart: 10,
        }}
      >
        <CheckboxGroup
          value={selected}
          onValueChange={setSelected}
          aria-label="API Token Scopes"
        >
          <Checkbox value="repos" label="Read & write repositories" />
          <Checkbox value="deployments" label="Trigger production deployments" />
          <Checkbox value="billing" label="Manage invoices & billing" />
        </CheckboxGroup>
      </div>
    </div>
  );
}

function CheckboxDescriptionsDemo() {
  const [channels, setChannels] = React.useState<string[]>(["security", "mentions"]);

  return (
    <div className="demo-panel" style={{ maxWidth: 500 }}>
      <span className="demo-panel__label">NOTIFICATION CHANNELS</span>
      <CheckboxGroup
        value={channels}
        onValueChange={setChannels}
        aria-label="Notification channels"
      >
        <Checkbox
          value="security"
          label="Critical security advisories"
          description="Immediate alerts when a new CVE or token leak affects your workspace."
        />
        <Checkbox
          value="mentions"
          label="Direct @mentions & review requests"
          description="Push notifications when teammates request your approval on pull requests."
        />
        <Checkbox
          value="digest"
          label="Weekly architecture digest"
          description="Curated summary delivered every Monday morning at 09:00 local time."
        />
      </CheckboxGroup>
    </div>
  );
}

function RadioVerticalDemo() {
  const [plan, setPlan] = React.useState("expressive");

  return (
    <div className="demo-panel" style={{ maxWidth: 480 }}>
      <div className="docs-inline-card-head">
        <span className="demo-panel__label">MOTION PHYSICS PROFILE</span>
        <code style={{ fontSize: 12 }}>{plan}</code>
      </div>
      <RadioGroup
        value={plan}
        onValueChange={setPlan}
        aria-label="Motion physics profile"
      >
        <Radio
          value="expressive"
          label="Expressive Spring (Recommended)"
          description="Under-damped spatial springs with subtle overshoot and lively corner morphing."
        />
        <Radio
          value="standard"
          label="Standard Critically Damped"
          description="Crisp, zero-bounce settling tuned for dense enterprise data tables."
        />
        <Radio
          value="reduced"
          label="Reduced Motion"
          description="Replaces spatial translation with instant cross-fades for vestibular comfort."
        />
      </RadioGroup>
    </div>
  );
}

function RadioHorizontalDemo() {
  const [density, setDensity] = React.useState("comfortable");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <RadioGroup
        orientation="horizontal"
        value={density}
        onValueChange={setDensity}
        aria-label="Layout density"
      >
        <Radio value="compact" label="Compact" />
        <Radio value="comfortable" label="Comfortable" />
        <Radio value="spacious" label="Spacious" />
      </RadioGroup>
      <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
        Active density: <code>{density}</code>
      </span>
    </div>
  );
}

function SwitchBasicDemo() {
  const [airplane, setAirplane] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
      <Switch
        checked={airplane}
        onCheckedChange={setAirplane}
        label={`Airplane Mode (${airplane ? "On" : "Off"})`}
      />
      <Switch defaultChecked label="Wi-Fi Auto-Join (Uncontrolled)" />
      <div className="demo-row" style={{ paddingTop: 4 }}>
        <Switch defaultChecked aria-label="Standalone active switch" />
        <Switch aria-label="Standalone inactive switch" />
      </div>
    </div>
  );
}

function SwitchSettingsRowDemo() {
  const [dynamicColor, setDynamicColor] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [telemetry, setTelemetry] = React.useState(false);

  return (
    <div className="demo-panel" style={{ maxWidth: 500, gap: 8 }}>
      <span className="demo-panel__label">WORKSPACE PREFERENCES</span>
      <Switch
        checked={dynamicColor}
        onCheckedChange={setDynamicColor}
        showIcons
        label="Dynamic HCT Seed Palette"
        description="Automatically derive light, dark, and high-contrast tonal surfaces from seed hex."
      />
      <Switch
        checked={haptics}
        onCheckedChange={setHaptics}
        showIcons
        label="Spring Geometry Telemetry"
        description="Expose real-time corner radii and thumb diameters when Geometry Ruler is enabled."
      />
      <Switch
        checked={telemetry}
        onCheckedChange={setTelemetry}
        showIcons
        label="Anonymous Crash Diagnostics"
        description="Upload sanitized stack traces when WebGL shader compilation fails."
      />
    </div>
  );
}

function SliderContinuousDemo() {
  const [volume, setVolume] = React.useState(68);
  const [committed, setCommitted] = React.useState(68);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 460 }}>
      <Slider
        label="Master Output Gain"
        value={volume}
        onValueChange={setVolume}
        onValueCommitted={setCommitted}
        min={0}
        max={100}
        showValue
        formatValue={(v) => `${Math.round(v)}%`}
      />
      <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
        Live value: <strong>{volume}%</strong> · Committed on release:{" "}
        <strong>{committed}%</strong>
      </span>
    </div>
  );
}

function SliderRangeDemo() {
  const [band, setBand] = React.useState<readonly number[]>([25, 75]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 460 }}>
      <Slider
        label="Target Latency Window"
        defaultValue={[25, 75]}
        onValueChange={setBand}
        min={0}
        max={100}
        minStepsBetweenValues={5}
        showValue
        formatValue={(v) => `${v} ms`}
      />
      <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
        Selected range: <code>{band[0]} ms – {band[1]} ms</code>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component Documentation Registry: Selection                                */
/* -------------------------------------------------------------------------- */

export const SELECTION_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  /* ---------------------------------------------------------------------- */
  /* 1. Checkbox & CheckboxGroup                                            */
  /* ---------------------------------------------------------------------- */
  {
    slug: "checkbox",
    title: "Checkbox",
    subtitle: {
      zh: "支持按压圆角弹簧微动效的 M3E 复选框与复选框组，完整覆盖受控/非受控、半选（indeterminate）全选联动、辅助描述行与禁用态。",
      en: "M3E checkbox and checkbox group with spring-animated press corners, supporting controlled/uncontrolled usage, parent indeterminate tri-state, rich helper descriptions, and disabled states.",
    },
    importStatement: 'import { Checkbox, CheckboxGroup } from "m3eui";',
    primitive: "@base-ui/react/checkbox · @base-ui/react/checkbox-group",
    scenarios: [
      {
        id: "checkbox-basic",
        title: {
          zh: "受控与非受控基础用法",
          en: "Controlled & Uncontrolled Checkboxes",
        },
        description: {
          zh: "传入 label 时自动渲染符合 48px 最小触控热区的整行可点击标签；不传 label 时可搭配 aria-label 作为独立表格勾选框。",
          en: "Providing label wraps the control in a 48px minimum touch-target row; omitting label renders a standalone checkbox element using aria-label.",
        },
        code: `const [agreed, setAgreed] = React.useState(true);

<Checkbox
  checked={agreed}
  onCheckedChange={setAgreed}
  label="Accept release notes & telemetry"
/>
<Checkbox defaultChecked label="Automatically install security patches" />
<Checkbox defaultChecked aria-label="Standalone checked checkbox" />`,
        render: () => <CheckboxBasicDemo />,
      },
      {
        id: "checkbox-indeterminate",
        title: {
          zh: "父级全选与半选（Indeterminate）联动",
          en: "Parent Select-All with Indeterminate State",
        },
        description: {
          zh: "当子级 CheckboxGroup 处于部分选中状态时，父级复选框通过 indeterminate 展示横杠标记并同步 aria-checked=\"mixed\"。",
          en: "Combine an indeterminate parent Checkbox with CheckboxGroup to represent partial selection with proper aria-checked=\"mixed\" semantics.",
        },
        code: `const ALL_SCOPES = ["repos", "deployments", "billing"];
const [selected, setSelected] = React.useState(["repos", "deployments"]);
const allChecked = selected.length === ALL_SCOPES.length;
const isIndeterminate = selected.length > 0 && !allChecked;

<Checkbox
  checked={allChecked}
  indeterminate={isIndeterminate}
  onCheckedChange={() => setSelected(allChecked ? [] : [...ALL_SCOPES])}
  label="Select all API scopes"
/>
<CheckboxGroup value={selected} onValueChange={setSelected} aria-label="API Scopes">
  <Checkbox value="repos" label="Read & write repositories" />
  <Checkbox value="deployments" label="Trigger production deployments" />
  <Checkbox value="billing" label="Manage invoices & billing" />
</CheckboxGroup>`,
        render: () => <CheckboxIndeterminateDemo />,
      },
      {
        id: "checkbox-disabled",
        title: {
          zh: "三种状态的禁用表现",
          en: "Disabled States (Unchecked, Checked, Indeterminate)",
        },
        description: {
          zh: "展示未勾选禁用、已勾选禁用与半选禁用三种完整视觉状态。",
          en: "Covers disabled rendering across unchecked, checked, and indeterminate tri-state indicators.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
  <Checkbox disabled label="Disabled unchecked" />
  <Checkbox disabled defaultChecked label="Disabled checked" />
  <Checkbox disabled indeterminate label="Disabled indeterminate" />
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Checkbox disabled label="Disabled unchecked" />
            <Checkbox disabled defaultChecked label="Disabled checked" />
            <Checkbox disabled indeterminate label="Disabled indeterminate" />
          </div>
        ),
      },
      {
        id: "checkbox-descriptions",
        title: {
          zh: "带辅助说明的设置清单",
          en: "Settings Checklist with Descriptions",
        },
        description: {
          zh: "通过 description 属性在主标题下方排版次级说明文字，构建清晰的多选偏好设置面板。",
          en: "Supply description alongside label to build structured multi-line preference checklists.",
        },
        code: `<CheckboxGroup defaultValue={["security", "mentions"]} aria-label="Notifications">
  <Checkbox
    value="security"
    label="Critical security advisories"
    description="Immediate alerts when a new CVE or token leak affects your workspace."
  />
  <Checkbox
    value="mentions"
    label="Direct @mentions & review requests"
    description="Push notifications when teammates request your approval on pull requests."
  />
</CheckboxGroup>`,
        render: () => <CheckboxDescriptionsDemo />,
      },
    ],
    apis: [
      {
        title: "Checkbox Props",
        rows: [
          {
            name: "checked / defaultChecked",
            type: "boolean",
            description: {
              zh: "受控或非受控勾选状态。",
              en: "Controlled or uncontrolled checked state.",
            },
          },
          {
            name: "indeterminate",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "半选混合态（渲染短横线图标并声明 aria-checked=\"mixed\"）。",
              en: "Displays the horizontal dash glyph and sets aria-checked=\"mixed\".",
            },
          },
          {
            name: "onCheckedChange",
            type: "(checked: boolean) => void",
            description: {
              zh: "勾选状态变更回调。",
              en: "Callback fired when the checked state toggles.",
            },
          },
          {
            name: "value",
            type: "string",
            description: {
              zh: "在 CheckboxGroup 内使用的选项标识值。",
              en: "Option identifier when nested inside a CheckboxGroup.",
            },
          },
          {
            name: "label",
            type: "React.ReactNode",
            description: {
              zh: "右侧主文本标签；传入后自动包裹 48px 热区 label 容器。",
              en: "Primary text label wrapping the control in an accessible 48px touch row.",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "主标签下方的辅助说明文案。",
              en: "Secondary helper text rendered beneath label.",
            },
          },
          {
            name: "parent",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "配合 CheckboxGroup allValues 作为原生父级全选框。",
              en: "Marks this checkbox as the parent select-all control inside a CheckboxGroup.",
            },
          },
          {
            name: "disabled / readOnly / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用、只读或表单必填校验。",
              en: "Disables, locks, or marks the checkbox as required.",
            },
          },
        ],
      },
      {
        title: "CheckboxGroup Props",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "子级 Checkbox 列表。",
              en: "Checkbox elements managed by the group.",
            },
          },
          {
            name: "value / defaultValue",
            type: "string[]",
            description: {
              zh: "受控或非受控已勾选 value 数组。",
              en: "Controlled or initial array of checked item values.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: string[]) => void",
            description: {
              zh: "选中项集合变更时的回调。",
              en: "Invoked with the updated array of checked values.",
            },
          },
          {
            name: "allValues",
            type: "string[]",
            description: {
              zh: "供 parent 复选框计算全选/半选的全部候选值列表。",
              en: "All option values used when coordinating a parent select-all checkbox.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "整组禁用所有子复选框。",
              en: "Disables every checkbox within the group.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 2. RadioGroup & Radio                                                  */
  /* ---------------------------------------------------------------------- */
  {
    slug: "radio-group",
    title: "RadioGroup",
    subtitle: {
      zh: "用于互斥单选场景的 M3E 单选按钮组，支持垂直详情卡片列表、水平行内排列、方向键漫游聚焦与细粒度禁用。",
      en: "Mutually exclusive M3E radio selection group supporting vertical descriptive stacks, horizontal inline layouts, roving arrow-key focus, and granular disabled states.",
    },
    importStatement: 'import { RadioGroup, Radio } from "m3eui";',
    primitive: "@base-ui/react/radio-group · @base-ui/react/radio",
    scenarios: [
      {
        id: "radio-vertical",
        title: {
          zh: "垂直排列与详情描述",
          en: "Vertical Stack with Descriptions",
        },
        description: {
          zh: "默认垂直方向排列，每个 Radio 可附带 description 解释各档策略差异。",
          en: "Default vertical orientation pairing each Radio label with explanatory secondary copy.",
        },
        code: `const [plan, setPlan] = React.useState("expressive");

<RadioGroup value={plan} onValueChange={setPlan} aria-label="Motion physics profile">
  <Radio
    value="expressive"
    label="Expressive Spring (Recommended)"
    description="Under-damped spatial springs with subtle overshoot and lively corner morphing."
  />
  <Radio
    value="standard"
    label="Standard Critically Damped"
    description="Crisp, zero-bounce settling tuned for dense enterprise data tables."
  />
  <Radio
    value="reduced"
    label="Reduced Motion"
    description="Replaces spatial translation with instant cross-fades for vestibular comfort."
  />
</RadioGroup>`,
        render: () => <RadioVerticalDemo />,
      },
      {
        id: "radio-horizontal",
        title: {
          zh: "水平行内紧凑单选",
          en: "Horizontal Inline Orientation",
        },
        description: {
          zh: "设置 orientation=\"horizontal\" 使选项在同一行横向铺开，适合字段较少的行内表单项。",
          en: "Pass orientation=\"horizontal\" to lay out concise radio options inline.",
        },
        code: `<RadioGroup
  orientation="horizontal"
  defaultValue="comfortable"
  aria-label="Layout density"
>
  <Radio value="compact" label="Compact" />
  <Radio value="comfortable" label="Comfortable" />
  <Radio value="spacious" label="Spacious" />
</RadioGroup>`,
        render: () => <RadioHorizontalDemo />,
      },
      {
        id: "radio-disabled",
        title: {
          zh: "单项禁用与整组禁用",
          en: "Individual & Entire Group Disabled",
        },
        description: {
          zh: "既可在某个 Radio 上单独标记 disabled（键盘方向键会自动跳过该项），也可在 RadioGroup 根部整组禁用。",
          en: "Disable a single unavailable option (skipped during keyboard roving) or disable the entire RadioGroup at once.",
        },
        code: `<div className="demo-grid-2">
  <RadioGroup defaultValue="pro" aria-label="Tier with locked enterprise">
    <Radio value="starter" label="Starter" />
    <Radio value="pro" label="Pro Workspace" />
    <Radio value="enterprise" label="Enterprise Dedicated (Contact Sales)" disabled />
  </RadioGroup>

  <RadioGroup defaultValue="eu" disabled aria-label="Locked region">
    <Radio value="us" label="US-East (Virginia)" />
    <Radio value="eu" label="EU-Central (Frankfurt)" />
  </RadioGroup>
</div>`,
        render: () => (
          <div className="demo-grid-2">
            <div className="demo-panel" style={{ gap: 6 }}>
              <span className="demo-panel__label">SINGLE OPTION DISABLED</span>
              <RadioGroup defaultValue="pro" aria-label="Tier with locked enterprise">
                <Radio value="starter" label="Starter" />
                <Radio value="pro" label="Pro Workspace" />
                <Radio
                  value="enterprise"
                  label="Enterprise Dedicated (Locked)"
                  disabled
                />
              </RadioGroup>
            </div>
            <div className="demo-panel" style={{ gap: 6 }}>
              <span className="demo-panel__label">ENTIRE GROUP DISABLED</span>
              <RadioGroup defaultValue="eu" disabled aria-label="Locked region">
                <Radio value="us" label="US-East (Virginia)" />
                <Radio value="eu" label="EU-Central (Frankfurt)" />
              </RadioGroup>
            </div>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "RadioGroup Props",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "组内 Radio 选项节点。",
              en: "Radio option elements.",
            },
          },
          {
            name: "value / defaultValue",
            type: "Value (string)",
            description: {
              zh: "受控或非受控当前选中值。",
              en: "Controlled or initial selected value.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: Value) => void",
            description: {
              zh: "选中项变更回调。",
              en: "Callback fired when selection changes.",
            },
          },
          {
            name: "orientation",
            type: '"vertical" | "horizontal"',
            defaultValue: '"vertical"',
            description: {
              zh: "选项排列轴向。",
              en: "Visual layout axis for child radios.",
            },
          },
          {
            name: "disabled / readOnly / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "整组禁用、只读或必填状态。",
              en: "Group-wide disabled, read-only, or required flags.",
            },
          },
          {
            name: "name",
            type: "string",
            description: {
              zh: "原生表单提交字段名。",
              en: "Form field name submitted with native forms.",
            },
          },
        ],
      },
      {
        title: "Radio Props",
        rows: [
          {
            name: "value",
            type: "Value (string)",
            required: true,
            description: {
              zh: "该单选项对应的唯一值。",
              en: "Unique value represented by this radio option.",
            },
          },
          {
            name: "label",
            type: "React.ReactNode",
            description: {
              zh: "选项主标题文本。",
              en: "Primary option label.",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "选项下方的辅助描述说明。",
              en: "Optional secondary description below the label.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "单独禁用该选项。",
              en: "Disables this individual radio option.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 3. Switch                                                              */
  /* ---------------------------------------------------------------------- */
  {
    slug: "switch",
    title: "Switch",
    subtitle: {
      zh: "即时生效的双态滑动开关，滑块直径在未开启（16px）、开启（24px）与按压（28px）三态间通过物理弹簧平滑缩放并自动适配 RTL 镜像。",
      en: "Immediate binary toggle switch whose thumb spring-morphs between 16px (off), 24px (on), and 28px (pressed) diameters with automatic RTL mirroring and optional state icons.",
    },
    importStatement: 'import { Switch } from "m3eui";',
    primitive: "@base-ui/react/switch",
    scenarios: [
      {
        id: "switch-basic",
        title: {
          zh: "受控与非受控基础开关",
          en: "Controlled & Uncontrolled Switches",
        },
        description: {
          zh: "传入 label 自动生成左右两端对齐的设置行；按住滑块可观察直径弹性扩张至 28px 的 M3E 手感。",
          en: "Passing label renders a space-between control row; press and hold the track to see the thumb expand to 28px via fastSpatial spring physics.",
        },
        code: `const [airplane, setAirplane] = React.useState(false);

<Switch
  checked={airplane}
  onCheckedChange={setAirplane}
  label="Airplane Mode"
/>
<Switch defaultChecked label="Wi-Fi Auto-Join" />`,
        render: () => <SwitchBasicDemo />,
      },
      {
        id: "switch-icons",
        title: {
          zh: "内置状态图标与自定义滑块图标",
          en: "Thumb State Icons (showIcons & Custom Glyphs)",
        },
        description: {
          zh: "开启 showIcons 在滑块内部显示对勾/叉号双重视觉线索（同时关闭态滑块扩大至 24px 以容纳图标），亦可通过 checkedIcon / uncheckedIcon 定制图标。",
          en: "Enable showIcons to render check/cross glyphs inside the thumb for redundant non-color affordance, or supply custom checkedIcon and uncheckedIcon nodes.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
  <Switch showIcons defaultChecked label="Built-in check / cross glyphs (On)" />
  <Switch showIcons label="Built-in check / cross glyphs (Off)" />
  <Switch
    defaultChecked
    checkedIcon={<SparkleIcon size={12} />}
    uncheckedIcon={<BellIcon size={12} />}
    label="Custom thumb glyphs"
  />
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
            <Switch showIcons defaultChecked label="Built-in check / cross glyphs (On)" />
            <Switch showIcons label="Built-in check / cross glyphs (Off)" />
            <Switch
              defaultChecked
              checkedIcon={<SparkleIcon size={12} />}
              uncheckedIcon={<BellIcon size={12} />}
              label="Custom thumb glyphs"
            />
          </div>
        ),
      },
      {
        id: "switch-disabled",
        title: {
          zh: "禁用态完整对比（含无图标与带图标）",
          en: "Disabled States (Off & On, With & Without Icons)",
        },
        description: {
          zh: "完整覆盖关闭禁用、开启禁用及其搭配 showIcons 时的视觉表现。",
          en: "Disabled matrix covering off and on states both without and with thumb icons.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
  <Switch disabled label="Disabled Off" />
  <Switch disabled defaultChecked label="Disabled On" />
  <Switch disabled showIcons label="Disabled Off (with icon)" />
  <Switch disabled defaultChecked showIcons label="Disabled On (with icon)" />
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
            <Switch disabled label="Disabled Off" />
            <Switch disabled defaultChecked label="Disabled On" />
            <Switch disabled showIcons label="Disabled Off (with icon)" />
            <Switch disabled defaultChecked showIcons label="Disabled On (with icon)" />
          </div>
        ),
      },
      {
        id: "switch-settings-row",
        title: {
          zh: "交互式功能偏好设置面板",
          en: "Interactive Feature Toggle Panel",
        },
        description: {
          zh: "结合 label、description 与 showIcons 快速搭建符合 M3 规范的系统偏好设置卡片。",
          en: "Combine label, description, and showIcons to assemble multi-row system settings panels.",
        },
        code: `<Switch
  checked={dynamicColor}
  onCheckedChange={setDynamicColor}
  showIcons
  label="Dynamic HCT Seed Palette"
  description="Automatically derive light, dark, and high-contrast tonal surfaces from seed hex."
/>`,
        render: () => <SwitchSettingsRowDemo />,
      },
    ],
    apis: [
      {
        title: "Switch Props",
        rows: [
          {
            name: "checked / defaultChecked",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "受控或非受控开关状态。",
              en: "Controlled or initial checked state.",
            },
          },
          {
            name: "onCheckedChange",
            type: "(checked: boolean) => void",
            description: {
              zh: "开关切换时的回调。",
              en: "Callback invoked when the switch toggles.",
            },
          },
          {
            name: "label / description",
            type: "React.ReactNode",
            description: {
              zh: "左侧标题文本与辅助说明；传入 label 时自动渲染整行布局。",
              en: "Row label and helper description rendered opposite the switch track.",
            },
          },
          {
            name: "showIcons",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "在滑块内展示内置对勾与叉号状态图标。",
              en: "Displays built-in check and close glyphs inside the thumb.",
            },
          },
          {
            name: "checkedIcon / uncheckedIcon",
            type: "React.ReactNode",
            description: {
              zh: "自定义开启态或关闭态滑块内部图标。",
              en: "Custom glyphs rendered inside the thumb when on or off.",
            },
          },
          {
            name: "disabled / readOnly / required",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用、只读或必填状态。",
              en: "Disables, locks, or marks the switch as required.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 4. Slider                                                              */
  /* ---------------------------------------------------------------------- */
  {
    slug: "slider",
    title: "Slider",
    subtitle: {
      zh: "采用 M3E 竖条手柄与轨道镂空断口（Track Cutout）设计的滑块组件，支持连续调节、离散刻度点、双滑块区间选择、悬浮数值气泡与三档轨道厚度。",
      en: "M3E vertical-handlebar slider with dynamic spring track cutouts, floating value bubbles, discrete tick marks, dual-thumb range selection, and three track height scales.",
    },
    importStatement: 'import { Slider } from "m3eui";',
    primitive: "@base-ui/react/slider",
    scenarios: [
      {
        id: "slider-continuous",
        title: {
          zh: "连续数值滑块与实时读数",
          en: "Continuous 0–100 Slider with Live Readout",
        },
        description: {
          zh: "拖动或使用键盘方向键微调时，手柄自动收窄并弹出弹簧气泡提示当前精确值，松手时触发 onValueCommitted。",
          en: "Dragging or stepping with arrow keys narrows the vertical handlebar, pops up a spring value bubble, and fires onValueCommitted on release.",
        },
        code: `const [volume, setVolume] = React.useState(68);

<Slider
  label="Master Output Gain"
  value={volume}
  onValueChange={setVolume}
  min={0}
  max={100}
  showValue
  formatValue={(v) => \`\${Math.round(v)}%\`}
/>`,
        render: () => <SliderContinuousDemo />,
      },
      {
        id: "slider-discrete",
        title: {
          zh: "离散步进与刻度点（Tick Marks）",
          en: "Discrete Stepped Slider with Tick Marks",
        },
        description: {
          zh: "设置 step={10} 与 showTicks 在轨道内均匀绘制步进圆点，靠近手柄处的刻度点会自动避让隐藏以保持切口干净。",
          en: "Combine step={10} with showTicks to render track stop dots that automatically hide beneath the active thumb cutout.",
        },
        code: `<div style={{ maxWidth: 460 }}>
  <Slider
    label="CPU Thread Quota"
    defaultValue={60}
    min={0}
    max={100}
    step={10}
    showTicks
    showValue
    formatValue={(v) => \`\${v} cores\`}
  />
</div>`,
        render: () => (
          <div style={{ maxWidth: 460 }}>
            <Slider
              label="CPU Thread Quota"
              defaultValue={60}
              min={0}
              max={100}
              step={10}
              showTicks
              showValue
              formatValue={(v) => `${v} cores`}
            />
          </div>
        ),
      },
      {
        id: "slider-range",
        title: {
          zh: "双滑块区间范围选择",
          en: "Dual-Thumb Range Slider",
        },
        description: {
          zh: "当 defaultValue 或 value 为双元素数组（如 [25, 75]）时自动渲染起止双滑块与三段式镂空轨道，可通过 minStepsBetweenValues 限制最小间距。",
          en: "Passing a two-number tuple such as defaultValue={[25, 75]} activates dual thumbs with a three-segment cutout track and optional minStepsBetweenValues.",
        },
        code: `<Slider
  label="Target Latency Window"
  defaultValue={[25, 75]}
  min={0}
  max={100}
  minStepsBetweenValues={5}
  showValue
  formatValue={(v) => \`\${v} ms\`}
/>`,
        render: () => <SliderRangeDemo />,
      },
      {
        id: "slider-sizes-disabled",
        title: {
          zh: "三档轨道尺寸与禁用态",
          en: "Track Sizes (SM / MD / LG) & Disabled State",
        },
        description: {
          zh: "提供 sm（16px 轨道）、md（24px 轨道）与 lg（40px 巨型表达力轨道）三档规格，以及单滑块与区间滑块的禁用态。",
          en: "Compare sm (16px), md (24px), and lg (40px expressive) track heights alongside disabled single-thumb and range sliders.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 460 }}>
  <Slider size="sm" label="Small Track (16px)" defaultValue={45} showValue />
  <Slider size="md" label="Medium Track (24px)" defaultValue={62} showValue />
  <Slider size="lg" label="Large Expressive Track (40px)" defaultValue={78} showValue />
  <Slider disabled label="Disabled Slider" defaultValue={40} showValue />
  <Slider disabled label="Disabled Range" defaultValue={[30, 70]} showValue />
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 460 }}>
            <Slider size="sm" label="Small Track (16px)" defaultValue={45} showValue />
            <Slider size="md" label="Medium Track (24px)" defaultValue={62} showValue />
            <Slider
              size="lg"
              label="Large Expressive Track (40px)"
              defaultValue={78}
              showValue
            />
            <Slider disabled label="Disabled Slider" defaultValue={40} showValue />
            <Slider disabled label="Disabled Range" defaultValue={[30, 70]} showValue />
          </div>
        ),
      },
      {
        id: "slider-centered-vertical",
        title: {
          zh: "居中双向滑块、垂直推子与轨道图标",
          en: "Centered, Vertical & Track-Icon Sliders",
        },
        description: {
          zh: "支持 AOSP CenteredSlider（从 0 双向延伸激活轨道）、orientation=\"vertical\" 垂直推子以及 startIcon / endIcon 端点图标。",
          en: "Supports AOSP centered zero-origin fill, vertical fader orientation, and startIcon / endIcon slots.",
        },
        code: `<Slider centered min={-50} max={50} defaultValue={18} label="Stereo Pan" showValue />
<Slider startIcon={<BellIcon size={16} />} endIcon={<SparkleIcon size={16} />} defaultValue={72} aria-label="Level" />
<Slider orientation="vertical" size="md" defaultValue={65} aria-label="EQ Band" />`,
        render: () => (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32 }}>
            <div style={{ flex: "1 1 260px", maxWidth: 380, display: "flex", flexDirection: "column", gap: 18 }}>
              <Slider
                centered
                min={-50}
                max={50}
                defaultValue={18}
                label="Stereo Pan"
                showValue
                formatValue={(v) => (v > 0 ? `+${Math.round(v)}` : `${Math.round(v)}`)}
              />
              <Slider
                size="md"
                defaultValue={72}
                aria-label="Notification intensity"
                startIcon={<BellIcon size={16} />}
                endIcon={<SparkleIcon size={16} />}
              />
            </div>
            <div style={{ display: "flex", gap: 20, height: 188, alignItems: "stretch" }}>
              <Slider orientation="vertical" size="sm" defaultValue={45} aria-label="60 Hz" />
              <Slider orientation="vertical" size="md" defaultValue={70} aria-label="1 kHz" />
              <Slider orientation="vertical" size="lg" defaultValue={55} aria-label="8 kHz" />
            </div>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Slider Props",
        rows: [
          {
            name: "value / defaultValue",
            type: "number | readonly number[]",
            description: {
              zh: "单值（单滑块）或双值元组（区间滑块），支持受控与非受控模式。",
              en: "Single number or two-thumb range array, controlled or uncontrolled.",
            },
          },
          {
            name: "onValueChange / onValueCommitted",
            type: "(value: Value) => void",
            description: {
              zh: "拖动实时回调与松手提交回调。",
              en: "Live drag callback and pointer-up commit callback.",
            },
          },
          {
            name: "min / max / step",
            type: "number",
            defaultValue: "0 / 100 / 1",
            description: {
              zh: "数值下界、上界与步进粒度。",
              en: "Minimum bound, maximum bound, and step increment.",
            },
          },
          {
            name: "minStepsBetweenValues",
            type: "number",
            defaultValue: "0",
            description: {
              zh: "双滑块模式下两个滑块之间保留的最小步数间距。",
              en: "Minimum step separation enforced between dual range thumbs.",
            },
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            defaultValue: '"sm"',
            description: {
              zh: "轨道高度规格（16px / 24px / 40px）。",
              en: "Track thickness scale (16px / 24px / 40px).",
            },
          },
          {
            name: "label / showValue",
            type: "React.ReactNode · boolean",
            defaultValue: "undefined / false",
            description: {
              zh: "顶部字段标题与右上角实时汇总读数。",
              en: "Header label and live formatted summary readout.",
            },
          },
          {
            name: "showValueBubble",
            type: "boolean",
            defaultValue: "true",
            description: {
              zh: "按压或键盘调节时是否在滑块上方弹出数值气泡。",
              en: "Toggles the floating value indicator bubble while active.",
            },
          },
          {
            name: "showTicks",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "在离散步进轨道上渲染刻度圆点（最多 24 段）。",
              en: "Renders discrete step dots along the track (when step count ≤ 24).",
            },
          },
          {
            name: "formatValue",
            type: "(value: number) => string",
            description: {
              zh: "自定义气泡与顶部汇总读数的格式化函数。",
              en: "Custom formatter for both the value bubble and header summary.",
            },
          },
          {
            name: "orientation / centered",
            type: '"horizontal" | "vertical" · boolean',
            defaultValue: '"horizontal" / false',
            description: {
              zh: "水平或垂直方向；单滑块居中双向填充模式（CenteredSlider）。",
              en: "Horizontal or vertical axis; centered bidirectional fill mode.",
            },
          },
          {
            name: "startIcon / endIcon",
            type: "React.ReactNode",
            description: {
              zh: "轨道首尾辅助图标插槽。",
              en: "Optional leading and trailing icons flanking the slider track.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用滑块拖动与键盘交互。",
              en: "Disables pointer dragging and keyboard stepping.",
            },
          },
        ],
      },
    ],
  },
];

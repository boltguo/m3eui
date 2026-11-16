import * as React from "react";
import {
  Alert,
  AlertDialog,
  AlertDialogClose,
  Avatar,
  BottomSheet,
  Button,
  Chip,
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
  ContainedLoadingIndicator,
  Dialog,
  DialogClose,
  Divider,
  IconButton,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
  LoadingIndicator,
  Meter,
  PreviewCard,
  RichTooltip,
  ScrollArea,
  Sheet,
  SheetClose,
  SideSheet,
  Slider,
  Switch,
  TextareaField,
  TextField,
  Tooltip,
  useM3EToast,
} from "m3eui";
import { useCopyResolver } from "../../i18n";
import {
  BellIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  HeartIcon,
  PlusIcon,
  RefreshIcon,
  SendIcon,
  SettingsGearIcon,
  ShareIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TrashIcon,
} from "../../layout/Icons";
import type { ComponentDocSpec } from "../types";

const STACK_COL: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
};

const ROW_WRAP: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
};

function AlertClosableActionDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [bannerKey, setBannerKey] = React.useState(0);
  const [closed, setClosed] = React.useState(false);

  return (
    <div style={STACK_COL}>
      {!closed ? (
        <Alert
          key={bannerKey}
          severity="info"
          closable
          onClose={() => setClosed(true)}
          title={copy({
            zh: "已启用 SPEC_2025 动态色彩管线",
            en: "SPEC_2025 dynamic color pipeline active",
          })}
        >
          {copy({
            zh: "点击右侧关闭按钮可移除此提示条，随时可恢复预览状态。",
            en: "Dismiss this banner using the close control and restore it anytime.",
          })}
        </Alert>
      ) : (
        <div style={ROW_WRAP}>
          <Button
            size="xs"
            variant="tonal"
            leadingIcon={<RefreshIcon size={14} />}
            onClick={() => {
              setBannerKey((k) => k + 1);
              setClosed(false);
            }}
          >
            {copy({ zh: "恢复可关闭横幅", en: "Restore closable alert" })}
          </Button>
        </div>
      )}

      <Alert
        severity="warning"
        variant="outlined"
        title={copy({
          zh: "API 密钥将在 3 天后轮换",
          en: "API token rotates in 3 days",
        })}
        action={
          <Button
            size="xs"
            variant="tonal"
            onClick={() =>
              toast({
                title: copy({ zh: "已生成新密钥", en: "Token rotated" }),
                description: copy({
                  zh: "新生产密钥已同步到环境变量。",
                  en: "Your production environment secret has been updated.",
                }),
                type: "success",
              })
            }
          >
            {copy({ zh: "立即轮换", en: "Rotate now" })}
          </Button>
        }
      >
        {copy({
          zh: "建议提前更新持续集成流水线中的访问凭据。",
          en: "Update CI/CD pipeline secrets ahead of schedule to avoid downtime.",
        })}
      </Alert>
    </div>
  );
}

function DialogStandardDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("Design System v2");
  const [notes, setNotes] = React.useState(
    " adopts AOSP Monet HCT tokens and analytical springs.",
  );

  return (
    <div style={ROW_WRAP}>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        showCloseButton
        icon={<SparkleIcon size={22} />}
        title={copy({ zh: "新建主题工作区", en: "Create theme workspace" })}
        description={copy({
          zh: "配置种子色预设与工作区描述信息，保存后立即生效。",
          en: "Configure workspace metadata and shareable theme configuration.",
        })}
        trigger={
          <Button leadingIcon={<PlusIcon size={18} />}>
            {copy({ zh: "打开表单对话框", en: "Open form dialog" })}
          </Button>
        }
        actions={
          <>
            <DialogClose render={<Button variant="text">{copy({ zh: "取消", en: "Cancel" })}</Button>} />
            <Button
              onClick={() => {
                setOpen(false);
                toast({
                  title: copy({ zh: "工作区已保存", en: "Workspace saved" }),
                  description: name,
                  type: "success",
                });
              }}
            >
              {copy({ zh: "保存更改", en: "Save workspace" })}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <TextField
            label={copy({ zh: "工作区名称", en: "Workspace name" })}
            value={name}
            onValueChange={setName}
            clearable
          />
          <TextareaField
            label={copy({ zh: "版本说明", en: "Release notes" })}
            rows={3}
            value={notes}
            onValueChange={setNotes}
          />
        </div>
      </Dialog>
    </div>
  );
}

function AlertDialogDestructiveDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();

  return (
    <div style={ROW_WRAP}>
      <AlertDialog
        icon={<TrashIcon size={22} />}
        title={copy({
          zh: "永久删除生产密钥？",
          en: "Revoke production key permanently?",
        })}
        description={copy({
          zh: "此操作不可撤销。所有依赖 m3e_live_98a2 的客户端请求将立即返回 401。",
          en: "This action cannot be undone. Any service authenticating with m3e_live_98a2 will immediately fail with 401.",
        })}
        trigger={
          <Button variant="tonal" intent="danger" leadingIcon={<TrashIcon size={18} />}>
            {copy({ zh: "吊销访问密钥", en: "Revoke API key" })}
          </Button>
        }
        actions={
          <>
            <AlertDialogClose
              render={<Button variant="text">{copy({ zh: "保留密钥", en: "Keep key" })}</Button>}
            />
            <AlertDialogClose
              render={
                <Button
                  intent="danger"
                  onClick={() =>
                    toast({
                      title: copy({ zh: "密钥已吊销", en: "API key revoked" }),
                      type: "error",
                    })
                  }
                >
                  {copy({ zh: "确认吊销", en: "Revoke key" })}
                </Button>
              }
            />
          </>
        }
      />
    </div>
  );
}

function DialogScrollableDemo() {
  const copy = useCopyResolver();

  const changelogItems = [
    {
      ver: "v0.4.0",
      note: copy({
        zh: "新增 Alert、Breadcrumb、Pagination、CommandPalette、Empty 与 Chip 六大组件。",
        en: "Added Alert, Breadcrumb, Pagination, CommandPalette, Empty, and Chip components.",
      }),
    },
    {
      ver: "v0.3.2",
      note: copy({
        zh: "升级二阶常微分方程解析弹簧引擎，零 GC 抖动驱动四角独立圆角形变。",
        en: "Upgraded analytical second-order ODE spring solver for zero-allocation corner morphing.",
      }),
    },
    {
      ver: "v0.3.0",
      note: copy({
        zh: "完整支持 AOSP Monet SPEC_2025 九种动态调色板变体与 RTL 双向布局。",
        en: "Full AOSP Monet SPEC_2025 9-scheme dynamic color engine and BiDi RTL layout support.",
      }),
    },
    {
      ver: "v0.2.4",
      note: copy({
        zh: "重构 LinearWavyProgressIndicator 与 CircularWavyProgressIndicator 相位动画。",
        en: "Refined phase velocity and amplitude settling on wavy progress indicators.",
      }),
    },
  ];

  return (
    <div style={ROW_WRAP}>
      <Dialog
        showCloseButton
        title={copy({ zh: "发行说明与许可协议", en: "Changelog & license terms" })}
        description={copy({
          zh: "内置可滚动视口容器，适配长篇协议或版本历史记录。",
          en: "Scrollable body region keeps header and footer actions pinned in view.",
        })}
        trigger={
          <Button variant="outlined">
            {copy({ zh: "查看版本记录", en: "View release changelog" })}
          </Button>
        }
        actions={
          <DialogClose
            render={<Button variant="tonal">{copy({ zh: "我已阅读", en: "Acknowledge" })}</Button>}
          />
        }
      >
        <ScrollArea maxHeight={200}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingInlineEnd: 8 }}>
            {changelogItems.map((entry, idx) => (
              <React.Fragment key={entry.ver}>
                {idx > 0 ? <Divider /> : null}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 13.5 }}>{entry.ver}</strong>
                    {idx === 0 ? (
                      <Chip size="sm" tone="primary">
                        Latest
                      </Chip>
                    ) : null}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
                    {entry.note}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </Dialog>
    </div>
  );
}

function SideSheetInspectorDemo() {
  const copy = useCopyResolver();
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(true);

  return (
    <div style={ROW_WRAP}>
      <SideSheet
        side="end"
        title={copy({ zh: "令牌属性检查器", en: "Token inspector" })}
        description={copy({
          zh: "右侧逻辑抽屉（RTL 环境下自动镜像至左侧）。",
          en: "Logical end drawer (automatically mirrors in RTL layouts).",
        })}
        trigger={
          <Button variant="tonal" leadingIcon={<SettingsGearIcon size={16} />}>
            {copy({ zh: "打开右侧抽屉 (side=\"end\")", en: "Open end SideSheet" })}
          </Button>
        }
      >
        <div style={STACK_COL}>
          <Switch
            label={copy({ zh: "高对比度轮廓 (+0.5)", en: "Medium-high contrast (+0.5)" })}
            description={copy({
              zh: "强化容器边界与文本可读性",
              en: "Boosts outline chroma and text legibility",
            })}
            checked={highContrast}
            onCheckedChange={setHighContrast}
            showIcons
          />
          <Divider />
          <Switch
            label={copy({ zh: "减弱物理弹簧摆幅", en: "Dampen spring overshoot" })}
            description={copy({
              zh: "切换至临界阻尼曲线 (ζ = 1.0)",
              en: "Uses critically damped curve (ζ = 1.0)",
            })}
            checked={reducedMotion}
            onCheckedChange={setReducedMotion}
            showIcons
          />
        </div>
      </SideSheet>

      <SideSheet
        side="start"
        title={copy({ zh: "项目资源树", en: "Workspace explorer" })}
        description={copy({
          zh: "从逻辑起始侧滑入的辅助面板。",
          en: "Slides in from the logical inline-start edge.",
        })}
        trigger={
          <Button variant="outlined">
            {copy({ zh: "打开起始侧抽屉 (side=\"start\")", en: "Open start SideSheet" })}
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
          <div style={{ padding: "8px 12px", borderRadius: 10, background: "var(--m3e-color-secondary-container)", color: "var(--m3e-color-on-secondary-container)", fontWeight: 600 }}>
            tokens / color.ts
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 10 }}>tokens / motion.ts</div>
          <div style={{ padding: "8px 12px", borderRadius: 10 }}>tokens / shapes.ts</div>
          <div style={{ padding: "8px 12px", borderRadius: 10 }}>components / Alert.tsx</div>
        </div>
      </SideSheet>
    </div>
  );
}

function BottomSheetModalDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();

  const actions = [
    {
      icon: <ShareIcon size={16} />,
      label: copy({ zh: "复制公开分享链接", en: "Copy share link" }),
    },
    {
      icon: <DownloadIcon size={16} />,
      label: copy({ zh: "导出 m3e.json 主题令牌", en: "Export m3e.json tokens" }),
    },
    {
      icon: <CopyIcon size={16} />,
      label: copy({ zh: "克隆至新分支", en: "Duplicate to new branch" }),
    },
  ];

  return (
    <div style={ROW_WRAP}>
      <BottomSheet
        title={copy({ zh: "分享与导出主题", en: "Share & export theme" })}
        description={copy({
          zh: "顶部自带拖拽手柄，支持向下滑动手势关闭。",
          en: "Includes an M3 drag handle and swipe-down gesture dismissal.",
        })}
        trigger={
          <Button leadingIcon={<ShareIcon size={16} />}>
            {copy({ zh: "打开底部面板", en: "Open BottomSheet" })}
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {actions.map((item) => (
            <SheetClose
              key={item.label}
              render={
                <Button
                  variant="tonal"
                  fullWidth
                  leadingIcon={item.icon}
                  style={{ justifyContent: "flex-start" }}
                  onClick={() =>
                    toast({
                      title: item.label,
                      type: "success",
                    })
                  }
                >
                  {item.label}
                </Button>
              }
            />
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function SheetFormFooterDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [endpoint, setEndpoint] = React.useState("https://api.m3e.dev/webhooks/deploy");
  const [secret, setSecret] = React.useState("whsec_m3e_expressive_2025");

  return (
    <div style={ROW_WRAP}>
      <Sheet
        side="end"
        title={copy({ zh: "配置 Webhook 端点", en: "Configure webhook endpoint" })}
        description={copy({
          zh: "底部固定操作栏在表单内容滚动时始终保持可见。",
          en: "Sticky footer keeps primary save/cancel actions pinned at the bottom.",
        })}
        trigger={
          <Button variant="outlined" leadingIcon={<EditIcon size={16} />}>
            {copy({ zh: "编辑 Webhook 抽屉", en: "Edit webhook in Sheet" })}
          </Button>
        }
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, width: "100%" }}>
            <SheetClose
              render={<Button variant="text">{copy({ zh: "取消", en: "Cancel" })}</Button>}
            />
            <SheetClose
              render={
                <Button
                  onClick={() =>
                    toast({
                      title: copy({ zh: "Webhook 配置已更新", en: "Webhook updated" }),
                      description: endpoint,
                      type: "success",
                    })
                  }
                >
                  {copy({ zh: "保存配置", en: "Save webhook" })}
                </Button>
              }
            />
          </div>
        }
      >
        <div style={STACK_COL}>
          <TextField
            label={copy({ zh: "回调 URL", en: "Payload URL" })}
            type="url"
            value={endpoint}
            onValueChange={setEndpoint}
          />
          <TextField
            label={copy({ zh: "签名密钥", en: "Signing secret" })}
            type="password"
            value={secret}
            onValueChange={setSecret}
          />
        </div>
      </Sheet>
    </div>
  );
}

function ToastBasicDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();

  return (
    <div style={ROW_WRAP}>
      <Button
        variant="tonal"
        leadingIcon={<BellIcon size={16} />}
        onClick={() =>
          toast({
            title: copy({ zh: "草稿已自动保存", en: "Draft auto-saved" }),
          })
        }
      >
        {copy({ zh: "标准提示", en: "Default snackbar" })}
      </Button>

      <Button
        variant="filled"
        leadingIcon={<ShieldCheckIcon size={16} />}
        onClick={() =>
          toast({
            title: copy({ zh: "部署已完成", en: "Deployment succeeded" }),
            description: copy({
              zh: "边缘节点已在 1.4 秒内同步最新版本。",
              en: "Edge regions updated in 1.4s with zero cold starts.",
            }),
            type: "success",
          })
        }
      >
        {copy({ zh: "成功描述通知", en: "Success with description" })}
      </Button>

      <Button
        variant="outlined"
        intent="danger"
        onClick={() =>
          toast({
            title: copy({ zh: "构建任务失败", en: "Build pipeline failed" }),
            description: copy({
              zh: "请检查 tsconfig.json 中的严格类型约束。",
              en: "Check strict type assertions in registry schema.",
            }),
            type: "error",
          })
        }
      >
        {copy({ zh: "错误通知", en: "Error snackbar" })}
      </Button>
    </div>
  );
}

function ToastActionDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [archivedCount, setArchivedCount] = React.useState(0);

  return (
    <div style={ROW_WRAP}>
      <Button
        leadingIcon={<SendIcon size={16} />}
        onClick={() => {
          setArchivedCount((c) => c + 1);
          toast({
            title: copy({ zh: "会话已归档", en: "Thread archived" }),
            description: copy({
              zh: "可在 6 秒内点击撤销恢复至收件箱。",
              en: "Click Undo within 6 seconds to move back to inbox.",
            }),
            actionLabel: copy({ zh: "撤销", en: "Undo" }),
            timeout: 6000,
            onAction: () => {
              setArchivedCount((c) => Math.max(0, c - 1));
              toast({
                title: copy({ zh: "已恢复至收件箱", en: "Restored to inbox" }),
                type: "success",
              });
            },
          });
        }}
      >
        {copy({ zh: "归档并显示撤销操作", en: "Archive with Undo action" })}
      </Button>
      <Chip tone="secondary">
        {copy({
          zh: `已归档计数：${archivedCount}`,
          en: `Archived count: ${archivedCount}`,
        })}
      </Chip>
    </div>
  );
}

function ToastDurationsDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();

  return (
    <div style={ROW_WRAP}>
      <Button
        variant="tonal"
        onClick={() =>
          toast({
            title: copy({ zh: "1.6 秒闪现提示", en: "Quick 1.6s toast" }),
            timeout: 1600,
            showClose: false,
          })
        }
      >
        {copy({ zh: "短时无关闭按钮 (1.6s)", en: "Short 1.6s (no close)" })}
      </Button>

      <Button
        variant="outlined"
        onClick={() => {
          ["#1 HCT Palette", "#2 Spring ODE", "#3 Morph SVG"].forEach((step, idx) => {
            window.setTimeout(() => {
              toast({
                title: copy({
                  zh: `队列任务 ${step} 已就绪`,
                  en: `Pipeline stage ${step} ready`,
                }),
                timeout: 3800,
              });
            }, idx * 220);
          });
        }}
      >
        {copy({ zh: "触发连续堆叠通知 (×3)", en: "Trigger stacked burst (×3)" })}
      </Button>
    </div>
  );
}

function LoadingIndicatorDemo() {
  const copy = useCopyResolver();
  const [paused, setPaused] = React.useState(false);
  const [detProgress, setDetProgress] = React.useState(64);

  return (
    <div style={STACK_COL}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <LoadingIndicator paused={paused} />
          <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
            LoadingIndicator
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <ContainedLoadingIndicator paused={paused} />
          <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
            Contained
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <ContainedLoadingIndicator size={56} progress={detProgress / 100} />
          <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
            {copy({ zh: `确定性 ${detProgress}%`, en: `Determinate ${detProgress}%` })}
          </span>
        </div>
        <Button
          size="xs"
          variant="tonal"
          onClick={() => setPaused((p) => !p)}
        >
          {paused
            ? copy({ zh: "继续播放", en: "Resume morph" })
            : copy({ zh: "暂停形变", en: "Pause morph" })}
        </Button>
      </div>

      <Slider
        label={copy({ zh: "确定性多边形插值进度", en: "Determinate polygon morph progress" })}
        value={detProgress}
        onValueChange={setDetProgress}
        min={0}
        max={100}
        showValue
      />
    </div>
  );
}

function WavyProgressDemo() {
  const copy = useCopyResolver();
  const [progress, setProgress] = React.useState(62);

  return (
    <div style={STACK_COL}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px" }}>
          <LinearWavyProgressIndicator value={progress} />
        </div>
        <CircularWavyProgressIndicator value={progress} size={52} />
      </div>
      <Slider
        label={copy({ zh: "实时波浪进度 (0–100%)", en: "Live wavy progress (0–100%)" })}
        value={progress}
        onValueChange={setProgress}
        min={0}
        max={100}
        showValue
      />
    </div>
  );
}

function WavyIndeterminateDemo() {
  const copy = useCopyResolver();
  const [paused, setPaused] = React.useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", width: "100%" }}>
      <div style={{ flex: "1 1 220px" }}>
        <LinearWavyProgressIndicator value={null} paused={paused} />
      </div>
      <CircularWavyProgressIndicator value={null} size={52} paused={paused} />
      <Button size="xs" variant="outlined" onClick={() => setPaused((p) => !p)}>
        {paused
          ? copy({ zh: "恢复相位动画", en: "Resume wave" })
          : copy({ zh: "暂停相位动画", en: "Pause wave" })}
      </Button>
    </div>
  );
}

function RichTooltipActionDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();

  return (
    <div style={ROW_WRAP}>
      <RichTooltip
        subhead={copy({ zh: "解析弹簧物理引擎", en: "Analytical spring physics" })}
        content={copy({
          zh: "使用闭合解二阶微分方程实时计算欠阻尼弹性形变，帧率无关且无内存分配开销。",
          en: "Computes under-damped spatial motion in closed form — frame-rate independent with zero per-frame allocations.",
        })}
        action={
          <Button
            size="xs"
            variant="text"
            trailingIcon={<ExternalLinkIcon size={13} />}
            onClick={() =>
              toast({
                title: copy({ zh: "已打开动效规范说明", en: "Opened motion specification" }),
              })
            }
          >
            {copy({ zh: "了解数学模型", en: "Read ODE spec" })}
          </Button>
        }
      >
        <Button variant="tonal" leadingIcon={<SparkleIcon size={16} />}>
          {copy({ zh: "悬停查看富文本提示", en: "Hover for RichTooltip" })}
        </Button>
      </RichTooltip>
    </div>
  );
}

function PreviewCardDemo() {
  const copy = useCopyResolver();

  return (
    <div style={{ fontSize: 14, color: "var(--m3e-color-on-surface)" }}>
      {copy({ zh: "将指针悬停在组件库维护者 ", en: "Hover over maintainer handle " })}
      <PreviewCard
        trigger={
          <a
            href="#preview-card"
            onClick={(e) => e.preventDefault()}
            style={{
              color: "var(--m3e-color-primary)",
              fontWeight: 650,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            @m3e-design-core
          </a>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar fallback="M3" shape="clover4Leaf" size="md" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>M3E Design Engineering</div>
              <div style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                @m3e-design-core · SPEC_2025
              </div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
            {copy({
              zh: "负责维护 HCT 色彩空间算法、35 种圆角多边形路径与 Base UI 无障碍原语封装。",
              en: "Maintains HCT color science, 35 morphing rounded polygons, and accessible Base UI primitives.",
            })}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip size="sm" tone="primary">
              45 Modules
            </Chip>
            <Chip size="sm" tone="success">
              WCAG AAA Ready
            </Chip>
          </div>
        </div>
      </PreviewCard>
      {copy({ zh: " 即可预览悬浮资料卡片。", en: " to inspect the rich hover card." })}
    </div>
  );
}

export const FEEDBACK_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  {
    slug: "alert",
    title: "Alert",
    category: "feedback",
    isNew: true,
    subtitle: {
      zh: "内联状态横幅，涵盖四种语义严重度、三种视觉表面变体、尾部动作插槽与无障碍实时播报角色。",
      en: "Inline status and callout banner supporting four semantic severities, three surface variants, trailing actions, and automatic ARIA live roles.",
    },
    importStatement: 'import { Alert } from "m3eui";',
    scenarios: [
      {
        id: "alert-severities",
        title: {
          zh: "四种语义严重度",
          en: "Semantic severities",
        },
        description: {
          zh: "提供 info、success、warning 与 error 四级状态反馈；warning 与 error 默认映射为 role=\"alert\"。",
          en: "Supports info, success, warning, and error severities; warning and error automatically resolve to role=\"alert\".",
        },
        code: `<Alert severity="info" title="System maintenance">
  Scheduled cluster upgrade runs Sunday at 02:00 UTC.
</Alert>
<Alert severity="success" title="Palette synchronized">
  All 9 AOSP Monet schemes compiled without contrast warnings.
</Alert>
<Alert severity="warning" title="Approaching quota limit">
  86% of monthly edge invocations have been consumed.
</Alert>
<Alert severity="error" title="Signature verification failed">
  Webhook payload timestamp exceeded the 5-minute tolerance window.
</Alert>`,
        render: () => (
          <div style={STACK_COL}>
            <Alert severity="info" title="System maintenance · 系统维护通知">
              Scheduled cluster upgrade runs Sunday at 02:00 UTC with zero expected downtime.
            </Alert>
            <Alert severity="success" title="Palette synchronized · 调色板已同步">
              All 9 AOSP Monet schemes compiled without WCAG contrast warnings.
            </Alert>
            <Alert severity="warning" title="Approaching quota limit · 配额预警">
              86% of monthly edge function invocations have been consumed.
            </Alert>
            <Alert severity="error" title="Signature verification failed · 验签失败">
              Webhook payload timestamp exceeded the 5-minute tolerance window.
            </Alert>
          </div>
        ),
      },
      {
        id: "alert-variants",
        title: {
          zh: "视觉容器变体",
          en: "Visual variants",
        },
        description: {
          zh: "支持柔和容器色 tonal（默认）、描边 outlined 与高显著度实心 filled 三种风格。",
          en: "Choose between tonal (default), outlined, and high-emphasis filled banner surfaces.",
        },
        code: `<Alert variant="tonal" severity="info" title="Tonal container">
  Soft tonal fill balanced for persistent page-level guidance.
</Alert>
<Alert variant="outlined" severity="success" title="Outlined container">
  Crisp hairline border suited for dense forms and settings cards.
</Alert>
<Alert variant="filled" severity="error" title="Filled high-emphasis">
  High-contrast surface reserved for critical blocking incidents.
</Alert>`,
        render: () => (
          <div style={STACK_COL}>
            <Alert variant="tonal" severity="info" title="Tonal · 柔和容器表面">
              Soft tonal fill balanced for persistent page-level guidance.
            </Alert>
            <Alert variant="outlined" severity="success" title="Outlined · 描边表面">
              Crisp hairline border suited for dense forms and settings cards.
            </Alert>
            <Alert variant="filled" severity="error" title="Filled · 高显著度实心表面">
              High-contrast surface reserved for critical blocking incidents.
            </Alert>
          </div>
        ),
      },
      {
        id: "alert-closable-action",
        title: {
          zh: "可关闭横幅与尾部动作",
          en: "Closable & trailing action",
        },
        description: {
          zh: "开启 closable 提供本地化无障碍关闭按钮，或通过 action 嵌入内联修复操作。",
          en: "Enable closable for built-in dismissal or pass an interactive control via the action slot.",
        },
        code: `<Alert
  severity="info"
  closable
  onClose={() => console.log("dismissed")}
  title="SPEC_2025 dynamic color pipeline active"
>
  Dismiss this banner using the close control.
</Alert>

<Alert
  severity="warning"
  variant="outlined"
  title="API token rotates in 3 days"
  action={<Button size="xs" variant="tonal">Rotate now</Button>}
>
  Update CI/CD pipeline secrets ahead of schedule.
</Alert>`,
        render: () => <AlertClosableActionDemo />,
      },
      {
        id: "alert-compact",
        title: {
          zh: "仅标题紧凑横幅",
          en: "Compact title-only banners",
        },
        description: {
          zh: "省略 children 描述文本或设置 icon={false} 可渲染单行紧凑提示条。",
          en: "Omit children for single-line inline banners, or pass icon={false} for ultra-minimal notices.",
        },
        code: `<Alert severity="success" title="All checks passed — ready to merge." />
<Alert severity="info" variant="outlined" icon={false} title="Read-only preview environment." />`,
        render: () => (
          <div style={STACK_COL}>
            <Alert severity="success" title="All checks passed — ready to merge into main." />
            <Alert
              severity="info"
              variant="outlined"
              icon={false}
              title="Read-only preview environment · 当前处于只读预览环境"
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Alert Props",
        rows: [
          {
            name: "severity",
            type: '"info" | "success" | "warning" | "error"',
            defaultValue: '"info"',
            description: {
              zh: "语义严重度，决定默认图标、色彩语义令牌以及默认 ARIA role。",
              en: "Semantic severity controlling default glyph, tonal color tokens, and fallback ARIA role.",
            },
          },
          {
            name: "variant",
            type: '"tonal" | "outlined" | "filled"',
            defaultValue: '"tonal"',
            description: {
              zh: "横幅视觉表面风格。",
              en: "Visual container style of the alert banner.",
            },
          },
          {
            name: "title",
            type: "React.ReactNode",
            description: {
              zh: "主要标题内容。",
              en: "Primary headline node.",
            },
          },
          {
            name: "children",
            type: "React.ReactNode",
            description: {
              zh: "辅助说明正文；省略时呈现紧凑单行样式。",
              en: "Supporting description content; omit for a compact single-line alert.",
            },
          },
          {
            name: "icon",
            type: "React.ReactNode | false",
            description: {
              zh: "自定义前导图标；传入 false 时隐藏图标槽位。",
              en: "Custom leading icon node, or false to hide the leading icon slot.",
            },
          },
          {
            name: "action",
            type: "React.ReactNode",
            description: {
              zh: "尾部自定义交互动作区域（如按钮或链接）。",
              en: "Trailing interactive slot rendered before the optional close button.",
            },
          },
          {
            name: "closable",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否渲染内置关闭按钮并管理本地隐藏状态。",
              en: "Renders a localized close button that dismisses the alert when clicked.",
            },
          },
          {
            name: "onClose",
            type: "() => void",
            description: {
              zh: "点击关闭按钮时触发的回调。",
              en: "Callback invoked when the user clicks the close button.",
            },
          },
          {
            name: "role",
            type: '"alert" | "status" | "region"',
            description: {
              zh: "覆盖自动推导的无障碍地标角色（warning/error 默认为 alert，其余默认为 status）。",
              en: "Overrides the automatic ARIA role (defaults to \"alert\" for warning/error, \"status\" otherwise).",
            },
          },
          {
            name: "className",
            type: "string",
            description: {
              zh: "附加自定义类名。",
              en: "Additional CSS class names.",
            },
          },
          {
            name: "style",
            type: "React.CSSProperties",
            description: {
              zh: "内联样式覆盖。",
              en: "Inline CSS style overrides.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "dialog",
    title: "Dialog",
    category: "feedback",
    primitive: "@base-ui/react/dialog · @base-ui/react/alert-dialog",
    subtitle: {
      zh: "基于 Base UI 构建的模态对话框与强制确认警告框，具备焦点锁定、28px 大圆角容器与无障碍标题关联。",
      en: "Modal Dialog and interruptive AlertDialog with focus trapping, 28px expressive container radius, and accessible title/description wiring.",
    },
    importStatement:
      'import { Dialog, DialogClose, AlertDialog, AlertDialogClose } from "m3eui";',
    scenarios: [
      {
        id: "dialog-standard",
        title: {
          zh: "标准表单对话框",
          en: "Standard modal dialog",
        },
        description: {
          zh: "结合图标头部、表单输入控件与底部操作栏的受控模态对话框。",
          en: "Controlled modal Dialog combining header icon, form fields, close button, and footer actions.",
        },
        code: `<Dialog
  open={open}
  onOpenChange={setOpen}
  showCloseButton
  icon={<SparkleIcon />}
  title="Create theme workspace"
  description="Configure workspace metadata and shareable theme configuration."
  trigger={<Button>Open form dialog</Button>}
  actions={
    <>
      <DialogClose render={<Button variant="text">Cancel</Button>} />
      <Button onClick={() => setOpen(false)}>Save workspace</Button>
    </>
  }
>
  <TextField label="Workspace name" value={name} onValueChange={setName} />
</Dialog>`,
        render: () => <DialogStandardDemo />,
      },
      {
        id: "alert-dialog-destructive",
        title: {
          zh: "不可逆危险确认 (AlertDialog)",
          en: "Destructive confirmation AlertDialog",
        },
        description: {
          zh: "AlertDialog 屏蔽背景点击意外关闭，配合 intent=\"danger\" 按钮守护高风险删除操作。",
          en: "AlertDialog prevents accidental backdrop dismissal and pairs with intent=\"danger\" buttons for irreversible actions.",
        },
        code: `<AlertDialog
  icon={<TrashIcon />}
  title="Revoke production key permanently?"
  description="This action cannot be undone. Clients using m3e_live_98a2 will fail with 401."
  trigger={<Button variant="tonal" intent="danger">Revoke API key</Button>}
  actions={
    <>
      <AlertDialogClose render={<Button variant="text">Keep key</Button>} />
      <AlertDialogClose render={<Button intent="danger">Revoke key</Button>} />
    </>
  }
/>`,
        render: () => <AlertDialogDestructiveDemo />,
      },
      {
        id: "dialog-scrollable",
        title: {
          zh: "可滚动长内容对话框",
          en: "Scrollable terms & changelog dialog",
        },
        description: {
          zh: "内部嵌套 ScrollArea 承载版本记录或服务条款，保持标题与操作按钮常驻可见。",
          en: "Embeds ScrollArea inside the modal body so long changelogs or legal terms scroll cleanly.",
        },
        code: `<Dialog
  showCloseButton
  title="Changelog & license terms"
  description="Scrollable body region keeps header and footer actions pinned."
  trigger={<Button variant="outlined">View release changelog</Button>}
  actions={<DialogClose render={<Button variant="tonal">Acknowledge</Button>} />}
>
  <ScrollArea maxHeight={200}>{/* Changelog items */}</ScrollArea>
</Dialog>`,
        render: () => <DialogScrollableDemo />,
      },
    ],
    apis: [
      {
        title: "Dialog Props",
        rows: [
          {
            name: "title",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "对话框无障碍标题。",
              en: "Accessible dialog heading rendered inside Dialog.Title.",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "辅助说明文本，自动绑定 aria-describedby。",
              en: "Supporting description automatically linked via aria-describedby.",
            },
          },
          {
            name: "trigger",
            type: "React.ReactElement",
            description: {
              zh: "触发打开对话框的元素。",
              en: "Trigger element rendered via Base UI render prop.",
            },
          },
          {
            name: "open",
            type: "boolean",
            description: {
              zh: "受控打开状态。",
              en: "Controlled open state.",
            },
          },
          {
            name: "defaultOpen",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "非受控初始打开状态。",
              en: "Initial open state when uncontrolled.",
            },
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: {
              zh: "开关状态变化回调。",
              en: "Callback fired when open state changes.",
            },
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description: {
              zh: "顶部居中装饰图标，设置后标题自动居中对齐。",
              en: "Optional hero icon displayed above the centered title.",
            },
          },
          {
            name: "children",
            type: "React.ReactNode",
            description: {
              zh: "对话框主体区域内容。",
              en: "Custom body content rendered between description and actions.",
            },
          },
          {
            name: "actions",
            type: "React.ReactNode",
            description: {
              zh: "底部操作按钮组插槽。",
              en: "Footer action buttons slot.",
            },
          },
          {
            name: "showCloseButton",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否在右上角显示关闭图标按钮（仅 Dialog 支持）。",
              en: "Displays a top-corner close icon button (Dialog only).",
            },
          },
        ],
      },
      {
        title: "AlertDialog & Close Helper Props",
        rows: [
          {
            name: "title / description / icon / actions",
            type: "M3EDialogProps",
            required: true,
            description: {
              zh: "AlertDialog 复用与 Dialog 一致的结构属性，但使用 alertdialog 角色并禁用点击遮罩关闭。",
              en: "AlertDialog shares M3EDialogProps while enforcing role=\"alertdialog\" and modal confirmation semantics.",
            },
          },
          {
            name: "DialogClose / AlertDialogClose.render",
            type: "React.ReactElement",
            description: {
              zh: "将关闭行为组合到自定义按钮（如 <Button variant=\"text\" />）上，避免嵌套原生 button。",
              en: "Composes close behavior onto an M3E Button element without nested button tags.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "sheet",
    title: "Sheet",
    category: "feedback",
    primitive: "@base-ui/react/drawer",
    subtitle: {
      zh: "模态侧边抽屉与底部抽屉面板，支持逻辑方向（start / end）自动镜像、手势滑动关闭与固定底栏。",
      en: "Modal SideSheet and BottomSheet drawers with logical BiDi edge resolution, swipe-to-dismiss gestures, and sticky footers.",
    },
    importStatement:
      'import { Sheet, SideSheet, BottomSheet, SheetClose } from "m3eui";',
    scenarios: [
      {
        id: "side-sheet-end",
        title: {
          zh: "逻辑侧边检查器抽屉 (end & start)",
          en: "SideSheet inspector (end & start)",
        },
        description: {
          zh: "支持 side=\"end\" 与 side=\"start\" 逻辑方向，在阿拉伯语等 RTL 布局下自动翻转滑入边缘与圆角。",
          en: "Logical side=\"end\" and side=\"start\" automatically mirror slide edge, swipe direction, and corner radii in RTL.",
        },
        code: `<SideSheet
  side="end"
  title="Token inspector"
  description="Logical end drawer (mirrors in RTL layouts)."
  trigger={<Button variant="tonal">Open end SideSheet</Button>}
>
  <Switch label="Medium-high contrast (+0.5)" defaultChecked />
</SideSheet>

<SideSheet
  side="start"
  title="Workspace explorer"
  trigger={<Button variant="outlined">Open start SideSheet</Button>}
>
  {/* Navigation or tree items */}
</SideSheet>`,
        render: () => <SideSheetInspectorDemo />,
      },
      {
        id: "bottom-sheet-modal",
        title: {
          zh: "底部模态抽屉与拖拽手柄",
          en: "Modal BottomSheet with drag handle",
        },
        description: {
          zh: "BottomSheet 自动渲染顶部 32×4px 拖拽指示条并启用向下滑动关闭手势。",
          en: "BottomSheet renders the M3 32×4px drag handle and supports downward swipe dismissal.",
        },
        code: `<BottomSheet
  title="Share & export theme"
  description="Includes an M3 drag handle and swipe-down gesture dismissal."
  trigger={<Button>Open BottomSheet</Button>}
>
  <SheetClose render={<Button variant="tonal" fullWidth>Copy share link</Button>} />
  <SheetClose render={<Button variant="tonal" fullWidth>Export m3e.json tokens</Button>} />
</BottomSheet>`,
        render: () => <BottomSheetModalDemo />,
      },
      {
        id: "sheet-form-footer",
        title: {
          zh: "带固定底栏的表单抽屉",
          en: "SideSheet with sticky footer",
        },
        description: {
          zh: "通过 footer 属性固定保存与取消操作，配合 SheetClose 无缝关闭面板。",
          en: "Pass save/cancel controls to the footer slot so actions remain pinned below scrollable form content.",
        },
        code: `<Sheet
  side="end"
  title="Configure webhook endpoint"
  trigger={<Button variant="outlined">Edit webhook in Sheet</Button>}
  footer={
    <>
      <SheetClose render={<Button variant="text">Cancel</Button>} />
      <SheetClose render={<Button>Save webhook</Button>} />
    </>
  }
>
  <TextField label="Payload URL" type="url" defaultValue="https://api.m3e.dev/webhooks" />
</Sheet>`,
        render: () => <SheetFormFooterDemo />,
      },
    ],
    apis: [
      {
        title: "Sheet, SideSheet & BottomSheet Props",
        rows: [
          {
            name: "title",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "抽屉面板主标题。",
              en: "Required drawer title node.",
            },
          },
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "抽屉主体滚动区域内容。",
              en: "Scrollable body content inside the sheet.",
            },
          },
          {
            name: "side",
            type: '"start" | "end" | "right" | "left"',
            defaultValue: '"end"',
            description: {
              zh: "SideSheet 滑出方向；BottomSheet 固定为底部滑出。",
              en: "Edge from which SideSheet slides in; omitted on BottomSheet (fixed to \"bottom\").",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "标题下方的副标题说明。",
              en: "Optional subtitle rendered beneath the sheet title.",
            },
          },
          {
            name: "trigger",
            type: "React.ReactElement",
            description: {
              zh: "触发抽屉打开的交互元素。",
              en: "Element that opens the drawer when activated.",
            },
          },
          {
            name: "footer",
            type: "React.ReactNode",
            description: {
              zh: "固定在抽屉底部的操作栏内容。",
              en: "Sticky footer region rendered below the scrollable content.",
            },
          },
          {
            name: "open / defaultOpen / onOpenChange",
            type: "boolean / (open: boolean) => void",
            description: {
              zh: "受控或非受控开关状态管理。",
              en: "Controlled and uncontrolled open state props.",
            },
          },
          {
            name: "SheetClose.render",
            type: "React.ReactElement",
            description: {
              zh: "将抽屉关闭行为注入任意按钮元素。",
              en: "Composes drawer dismissal onto a custom button element.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "toast",
    title: "Toast",
    category: "feedback",
    primitive: "@base-ui/react/toast",
    subtitle: {
      zh: "由 M3EProvider 托管视口的轻量消息通知（Snackbar），通过 useM3EToast() 钩子在任意组件内命令式触发。",
      en: "Viewport-managed snackbar notifications triggered imperatively via useM3EToast() with action callbacks and auto-dismissal.",
    },
    importStatement: 'import { useM3EToast } from "m3eui";',
    scenarios: [
      {
        id: "toast-basic",
        title: {
          zh: "基础与语义通知",
          en: "Standard & semantic snackbars",
        },
        description: {
          zh: "调用 toast({ title, description, type }) 触发默认、成功或错误反馈。",
          en: "Call toast({ title, description, type }) to dispatch default, success, or error snackbars.",
        },
        code: `const { toast } = useM3EToast();

toast({ title: "Draft auto-saved" });
toast({
  title: "Deployment succeeded",
  description: "Edge regions updated in 1.4s.",
  type: "success",
});`,
        render: () => <ToastBasicDemo />,
      },
      {
        id: "toast-action",
        title: {
          zh: "带撤销回调的交互通知",
          en: "Interactive Undo action callback",
        },
        description: {
          zh: "通过 actionLabel 与 onAction 提供单步撤销或查看详情按钮，点击后自动关闭当前通知。",
          en: "Provide actionLabel and onAction for inline recovery workflows such as Undo.",
        },
        code: `const { toast } = useM3EToast();

toast({
  title: "Thread archived",
  description: "Click Undo within 6 seconds to restore.",
  actionLabel: "Undo",
  timeout: 6000,
  onAction: () => restoreThread(),
});`,
        render: () => <ToastActionDemo />,
      },
      {
        id: "toast-durations",
        title: {
          zh: "自定义停留时长与连续堆叠",
          en: "Custom timeout & stacked queue",
        },
        description: {
          zh: "配置 timeout 控制自动消失毫秒数，支持多条通知平滑堆叠展示。",
          en: "Customize timeout in milliseconds, hide the close icon, or dispatch sequential stacked notifications.",
        },
        code: `toast({ title: "Quick 1.6s toast", timeout: 1600, showClose: false });`,
        render: () => <ToastDurationsDemo />,
      },
    ],
    apis: [
      {
        title: "ShowM3EToastOptions (toast(options))",
        description: {
          zh: "useM3EToast() 返回 { toast, close }，其中 toast(options) 接收以下参数并返回通知 id：",
          en: "useM3EToast() returns { toast, close }; pass these options to toast(options):",
        },
        rows: [
          {
            name: "title",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "通知主标题文本。",
              en: "Primary snackbar message.",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "可选的次要说明文本。",
              en: "Optional secondary supporting line.",
            },
          },
          {
            name: "type",
            type: '"default" | "success" | "error"',
            defaultValue: '"default"',
            description: {
              zh: "视觉状态语义类型。",
              en: "Semantic tone applied to the snackbar container.",
            },
          },
          {
            name: "actionLabel",
            type: "string",
            description: {
              zh: "右侧动作按钮文案（例如“撤销”）。",
              en: "Label for the optional inline action button.",
            },
          },
          {
            name: "onAction",
            type: "() => void",
            description: {
              zh: "点击动作按钮时执行的回调，触发后自动关闭该条通知。",
              en: "Handler invoked when the action button is clicked.",
            },
          },
          {
            name: "timeout",
            type: "number",
            defaultValue: "4200",
            description: {
              zh: "自动关闭延迟时间（毫秒）。",
              en: "Auto-dismiss duration in milliseconds.",
            },
          },
          {
            name: "showClose",
            type: "boolean",
            defaultValue: "true",
            description: {
              zh: "是否渲染右侧关闭图标按钮。",
              en: "Whether to display the dismiss cross button.",
            },
          },
          {
            name: "id",
            type: "string",
            description: {
              zh: "自定义通知唯一标识，便于手动调用 close(id)。",
              en: "Optional custom identifier for programmatic close(id).",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "loading-indicator",
    title: "LoadingIndicator",
    category: "feedback",
    subtitle: {
      zh: "在 7 个 Material 多边形之间弹簧形变的加载指示器，支持不确定与确定进度。",
      en: "Loading indicator that spring-morphs across seven Material polygons, indeterminate or determinate.",
    },
    importStatement:
      'import { LoadingIndicator, ContainedLoadingIndicator } from "m3eui";',
    scenarios: [
      {
        id: "loading-indicator",
        title: {
          zh: "形变加载",
          en: "Morphing loader",
        },
        description: {
          zh: "在预定义圆角多边形序列间按弹簧曲线连续形变旋转，支持独立与 Contained 容器模式以及确定性 progress。",
          en: "Continuously morphs across rounded Material polygons using spring physics, supporting both indeterminate and determinate progress.",
        },
        code: `<LoadingIndicator />
<ContainedLoadingIndicator />
<ContainedLoadingIndicator size={56} progress={0.64} />`,
        render: () => <LoadingIndicatorDemo />,
      },
    ],
    apis: [
      {
        title: "Props",
        rows: [
          {
            name: "size",
            type: "number",
            defaultValue: "48",
            description: {
              zh: "SVG 容器宽高像素值。",
              en: "Container width and height in pixels.",
            },
          },
          {
            name: "progress",
            type: "number",
            description: {
              zh: "传入 0–1 数值时切换为确定性多边形插值模式；省略时持续循环动画。",
              en: "0–1 value enabling determinate shape interpolation; omit for continuous morphing.",
            },
          },
          {
            name: "contained",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否渲染圆形主色容器背景（ContainedLoadingIndicator 默认开启）。",
              en: "Renders a filled circular tonal container behind the polygon.",
            },
          },
          {
            name: "paused",
            type: "boolean",
            description: {
              zh: "暂停帧循环动画。",
              en: "Pauses the requestAnimationFrame morph loop.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "progress-indicator",
    title: "ProgressIndicator",
    category: "feedback",
    primitive: "@base-ui/react/progress",
    subtitle: {
      zh: "线形与环形进度指示器，含 M3E 断开轨道、终点圆点与波形（Wavy）变体。",
      en: "Linear and circular progress with M3E split track, stop dot, and wavy variants.",
    },
    importStatement:
      'import { LinearProgressIndicator, CircularProgressIndicator, LinearWavyProgressIndicator, CircularWavyProgressIndicator } from "m3eui";',
    scenarios: [
      {
        id: "standard-progress",
        title: {
          zh: "线形与环形",
          en: "Linear & circular",
        },
        description: {
          zh: "具备 M3 标志性轨道切口间隙与末端停止圆点，支持数值百分比展示与不确定态。",
          en: "Features M3 split-track gap geometry, trailing stop dot, localized percentage readout, and indeterminate mode.",
        },
        code: `<LinearProgressIndicator label="Uploading assets" value={72} showValue />
<LinearProgressIndicator indeterminate thickness="thick" />
<CircularProgressIndicator value={68} size="lg" showValue />
<CircularProgressIndicator indeterminate size="md" />`,
        render: () => (
          <div style={STACK_COL}>
            <LinearProgressIndicator label="Uploading assets · 上传构建产物" value={72} showValue />
            <LinearProgressIndicator indeterminate thickness="thick" aria-label="Syncing index" />
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <CircularProgressIndicator value={35} size="sm" />
              <CircularProgressIndicator value={68} size="md" showValue />
              <CircularProgressIndicator value={84} size="lg" showValue />
              <CircularProgressIndicator indeterminate size="md" />
            </div>
          </div>
        ),
      },
      {
        id: "wavy-progress",
        title: {
          zh: "波形进度",
          en: "Wavy",
        },
        description: {
          zh: "LinearWavyProgressIndicator 与 CircularWavyProgressIndicator 在接近 0% 与 100% 时自动平滑收敛振幅。",
          en: "Linear and circular wavy indicators animate phase continuously and smoothly taper wave amplitude near 0% and 100%.",
        },
        code: `<LinearWavyProgressIndicator value={progress} />
<CircularWavyProgressIndicator value={progress} size={52} />`,
        render: () => <WavyProgressDemo />,
      },
      {
        id: "wavy-indeterminate",
        title: {
          zh: "波形不确定态",
          en: "Wavy indeterminate",
        },
        description: {
          zh: "当 value={null} 时进入周期性伸缩波浪巡航模式，并自动响应系统减弱动态偏好。",
          en: "Passing value={null} activates indeterminate wave cycling while respecting prefers-reduced-motion.",
        },
        code: `<LinearWavyProgressIndicator value={null} />
<CircularWavyProgressIndicator value={null} size={52} />`,
        render: () => <WavyIndeterminateDemo />,
      },
    ],
    apis: [
      {
        title: "LinearProgressIndicator & CircularProgressIndicator Props",
        rows: [
          {
            name: "value",
            type: "number | null",
            description: {
              zh: "Progress 支持 0–100 或 null；Meter 必填数值（配合 min / max）。",
              en: "0–100 (or null) for Progress indicators; required numeric value within [min, max] for Meter.",
            },
          },
          {
            name: "indeterminate",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否开启不确定态往返进度动画（Linear / CircularProgressIndicator）。",
              en: "Switches Linear or CircularProgressIndicator into indeterminate mode.",
            },
          },
          {
            name: "thickness / size",
            type: '"standard" | "thick" · "sm" | "md" | "lg"',
            description: {
              zh: "线性进度条厚度（4px / 8px）或环形进度条尺寸档位。",
              en: "Track thickness on LinearProgressIndicator or diameter preset on CircularProgressIndicator.",
            },
          },
          {
            name: "label / showValue / valueText",
            type: "React.ReactNode / boolean / string",
            description: {
              zh: "顶部标签、本地化百分比显示开关以及 Meter 自定义读数文本。",
              en: "Header label, localized percentage toggle, and custom formatted valueText on Meter.",
            },
          },
        ],
      },
      {
        title: "LinearWavyProgressIndicator & CircularWavyProgressIndicator Props",
        rows: [
          {
            name: "value",
            type: "number | null",
            defaultValue: "null",
            description: {
              zh: "0–100 确定性进度百分比；null 表示不确定态动画。",
              en: "0–100 determinate percentage, or null for indeterminate wave motion.",
            },
          },
          {
            name: "amplitude / wavelength",
            type: "number",
            description: {
              zh: "自定义波幅比例（0–1）或波长像素值（LinearWavyProgressIndicator）。",
              en: "Optional wave amplitude (0–1) and wavelength in px.",
            },
          },
          {
            name: "size",
            type: "number",
            defaultValue: "48",
            description: {
              zh: "CircularWavyProgressIndicator 外径尺寸（px）。",
              en: "Outer diameter in pixels for CircularWavyProgressIndicator.",
            },
          },
          {
            name: "strokeWidth / trackGap",
            type: "number",
            description: {
              zh: "描边宽度与激活段/轨道段之间的切口间距。",
              en: "Stroke thickness and active-to-track cutout gap in pixels.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "meter",
    title: "Meter",
    category: "feedback",
    primitive: "@base-ui/react/meter",
    subtitle: {
      zh: "表示容量或用量的静态量表，按阈值切换正常、警告与危险色。",
      en: "Static capacity gauge that shifts tone across normal, warning, and critical thresholds.",
    },
    importStatement:
      'import { Meter } from "m3eui";',
    scenarios: [
      {
        id: "meter-thresholds",
        title: {
          zh: "阈值量表",
          en: "Threshold gauges",
        },
        description: {
          zh: "根据占用比例自动在 normal、warning 与 critical 三档色彩语义间平滑过渡。",
          en: "Automatically transitions indicator tone across normal, warning, and critical usage thresholds.",
        },
        code: `<Meter label="Memory pool" value={42} valueText="3.4 / 8 GB" />
<Meter label="API rate budget" value={78} />
<Meter label="NVMe scratch disk" value={94} valueText="940 / 1000 GB" />`,
        render: () => (
          <div style={STACK_COL}>
            <Meter label="Memory pool (Normal)" value={42} valueText="3.4 / 8 GB" />
            <Meter label="API rate budget (Warning)" value={78} />
            <Meter label="NVMe scratch disk (Critical)" value={94} valueText="940 / 1000 GB" />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Props",
        rows: [
          {
            name: "value / min / max",
            type: "number",
            required: true,
            defaultValue: "— / 0 / 100",
            description: {
              zh: "当前量值与量程。",
              en: "Current reading and range.",
            },
          },
          {
            name: "label",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "量表名称，同时作为无障碍名称。",
              en: "Gauge label, also used as the accessible name.",
            },
          },
          {
            name: "valueText",
            type: "string",
            description: {
              zh: "覆盖默认的本地化百分比读数。",
              en: "Overrides the default localized percentage readout.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    category: "feedback",
    primitive: "@base-ui/react/tooltip",
    subtitle: {
      zh: "纯文本 Tooltip 与带标题、操作按钮的 RichTooltip。",
      en: "Plain label Tooltip and RichTooltip with subhead and action.",
    },
    importStatement:
      'import { Tooltip, RichTooltip } from "m3eui";',
    scenarios: [
      {
        id: "tooltip-plain",
        title: {
          zh: "纯文本提示",
          en: "Plain",
        },
        description: {
          zh: "为图标按钮和工具栏控件补充简洁说明，支持上、下、左、右四个弹出方位。",
          en: "Provides concise accessible labels for icon buttons across top, bottom, left, and right sides.",
        },
        code: `<Tooltip content="Favorite component" side="top">
  <IconButton icon={<HeartIcon />} aria-label="Favorite" variant="tonal" />
</Tooltip>
<Tooltip content="Copy code snippet" side="bottom">
  <IconButton icon={<CopyIcon />} aria-label="Copy" variant="outlined" />
</Tooltip>`,
        render: () => (
          <div style={ROW_WRAP}>
            <Tooltip content="Favorite · 收藏组件" side="top">
              <IconButton icon={<HeartIcon />} aria-label="Favorite" variant="tonal" />
            </Tooltip>
            <Tooltip content="Copy snippet · 复制代码" side="bottom">
              <IconButton icon={<CopyIcon />} aria-label="Copy" variant="outlined" />
            </Tooltip>
            <Tooltip content="Share link · 分享链接" side="right">
              <IconButton icon={<ShareIcon />} aria-label="Share" variant="standard" />
            </Tooltip>
            <Tooltip content="Notifications · 通知中心" side="left">
              <IconButton icon={<BellIcon />} aria-label="Notifications" variant="filled" />
            </Tooltip>
          </div>
        ),
      },
      {
        id: "rich-tooltip",
        title: {
          zh: "富提示",
          en: "Rich",
        },
        description: {
          zh: "包含 subhead 小标题、多行正文与可点击的 action 按钮，指针移入浮层时保持开启。",
          en: "Displays a structured subhead, multi-line explanation, and an interactive action button.",
        },
        code: `<RichTooltip
  subhead="Analytical spring physics"
  content="Computes under-damped spatial motion in closed form with zero allocations."
  action={<Button size="xs" variant="text">Read ODE spec</Button>}
>
  <Button variant="tonal">Hover for RichTooltip</Button>
</RichTooltip>`,
        render: () => <RichTooltipActionDemo />,
      },
    ],
    apis: [
      {
        title: "Tooltip & RichTooltip Props",
        rows: [
          {
            name: "children",
            type: "React.ReactElement",
            required: true,
            description: {
              zh: "触发提示框的单个可聚焦/可悬停子元素。",
              en: "Single focusable/hoverable trigger element.",
            },
          },
          {
            name: "content",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "提示正文内容。",
              en: "Primary tooltip text or supporting body.",
            },
          },
          {
            name: "subhead",
            type: "React.ReactNode",
            description: {
              zh: "RichTooltip 顶部加粗小标题。",
              en: "Optional bold heading rendered at the top of RichTooltip.",
            },
          },
          {
            name: "action",
            type: "React.ReactNode",
            description: {
              zh: "RichTooltip 底部交互操作节点。",
              en: "Interactive footer action rendered inside RichTooltip.",
            },
          },
          {
            name: "side",
            type: '"top" | "bottom" | "left" | "right"',
            defaultValue: '"top"',
            description: {
              zh: "首选弹出方向。",
              en: "Preferred placement side relative to the trigger.",
            },
          },
          {
            name: "sideOffset",
            type: "number",
            defaultValue: "8 (Tooltip) / 10 (RichTooltip)",
            description: {
              zh: "触发器与浮层之间的像素间距。",
              en: "Distance in pixels between trigger and popup.",
            },
          },
          {
            name: "delay",
            type: "number",
            defaultValue: "280 / 250",
            description: {
              zh: "悬停打开延迟（毫秒）。",
              en: "Hover open delay in milliseconds.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用提示弹出。",
              en: "Disables opening the tooltip.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "preview-card",
    title: "PreviewCard",
    category: "feedback",
    primitive: "@base-ui/react/preview-card",
    subtitle: {
      zh: "悬停或聚焦链接时展示的实体预览卡片。",
      en: "Entity preview surface revealed on link hover or focus.",
    },
    importStatement:
      'import { PreviewCard } from "m3eui";',
    scenarios: [
      {
        id: "preview-card",
        title: {
          zh: "链接预览",
          en: "Link preview",
        },
        description: {
          zh: "悬停或聚焦在触发链接上时展示作者、仓库或组件元信息卡片。",
          en: "Reveals a rich surface card when hovering or focusing inline mentions and entity links.",
        },
        code: `<PreviewCard
  trigger={<a href="#author">@m3e-design-core</a>}
  side="bottom"
  align="start"
>
  <div>M3E Design Engineering · 45 Modules</div>
</PreviewCard>`,
        render: () => <PreviewCardDemo />,
      },
    ],
    apis: [
      {
        title: "Props",
        rows: [
          {
            name: "trigger",
            type: "React.ReactElement",
            required: true,
            description: {
              zh: "触发预览卡片的链接或行内元素。",
              en: "Trigger link or element that opens the preview card on hover/focus.",
            },
          },
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "预览卡片内部自定义布局内容。",
              en: "Rich content rendered inside the preview popup.",
            },
          },
          {
            name: "side / align",
            type: '"top" | "bottom" | "left" | "right" · "start" | "center" | "end"',
            defaultValue: '"bottom" / "start"',
            description: {
              zh: "预览卡弹出方位与对齐方式。",
              en: "Popup side and alignment relative to the trigger.",
            },
          },
          {
            name: "delay / closeDelay",
            type: "number",
            defaultValue: "280 / 200",
            description: {
              zh: "悬停打开与离开关闭的延迟毫秒数。",
              en: "Open and close hover delays in milliseconds.",
            },
          },
        ],
      },
    ],
  },
];

import * as React from "react";
import {
  Button,
  ButtonGroup,
  FAB,
  FABMenu,
  FloatingToolbar,
  IconButton,
  SplitButton,
} from "m3eui";
import {
  BellIcon,
  CodeBracketsIcon,
  CopyIcon,
  DesktopViewportIcon,
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  FolderIcon,
  HeartIcon,
  MobileViewportIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  SendIcon,
  SettingsGearIcon,
  ShareIcon,
  SparkleIcon,
  TabletViewportIcon,
  TrashIcon,
} from "../../layout/Icons";
import type { ComponentDocSpec } from "../types";

/* -------------------------------------------------------------------------- */
/* Interactive Demo Wrappers                                                  */
/* -------------------------------------------------------------------------- */

function ButtonLoadingDemo() {
  const [submitting, setSubmitting] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const triggerLoad = () => {
    if (submitting) return;
    setSubmitting(true);
    timerRef.current = window.setTimeout(() => {
      setSubmitting(false);
      timerRef.current = null;
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="demo-row">
        <Button variant="filled" loading>
          Saving
        </Button>
        <Button variant="tonal" loading>
          Syncing
        </Button>
        <Button variant="elevated" loading>
          Indexing
        </Button>
        <Button variant="outlined" loading>
          Verifying
        </Button>
        <Button variant="text" loading>
          Fetching
        </Button>
      </div>
      <div className="demo-row">
        <Button
          variant="filled"
          leadingIcon={<SendIcon size={16} />}
          loading={submitting}
          onClick={triggerLoad}
        >
          {submitting ? "Deploying (1.2s)…" : "Click to Deploy (1.2s)"}
        </Button>
        <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
          {submitting ? "aria-busy=\"true\" active" : "Ready"}
        </span>
      </div>
    </div>
  );
}

function ButtonLinkAndToggleDemo() {
  const [starred, setStarred] = React.useState(true);
  const [pinned, setPinned] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", maxWidth: 520 }}>
      <div className="demo-row">
        <Button
          variant="outlined"
          href="https://m3.material.io"
          target="_blank"
          rel="noopener noreferrer"
          trailingIcon={<ExternalLinkIcon size={14} />}
        >
          Material 3 Spec
        </Button>
        <Button
          variant="tonal"
          pressed={starred}
          onPressedChange={setStarred}
          leadingIcon={<HeartIcon filled={starred} size={16} />}
        >
          {starred ? "Starred (128)" : "Star"}
        </Button>
        <Button
          variant="outlined"
          pressed={pinned}
          onPressedChange={setPinned}
          showCheckIcon
        >
          {pinned ? "Pinned to Top" : "Pin Issue"}
        </Button>
      </div>
      <Button variant="filled" fullWidth leadingIcon={<SparkleIcon size={16} />}>
        Full-Width Primary Action
      </Button>
    </div>
  );
}

function IconButtonToggleDemo() {
  const [liked, setLiked] = React.useState(true);
  const [subscribed, setSubscribed] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(true);

  return (
    <div className="demo-row">
      <IconButton
        variant="tonal"
        pressed={liked}
        onPressedChange={setLiked}
        icon={<HeartIcon filled={false} size={18} />}
        checkedIcon={<HeartIcon filled size={18} />}
        aria-label="Favorite item"
      />
      <IconButton
        variant="outlined"
        pressed={subscribed}
        onPressedChange={setSubscribed}
        icon={<BellIcon size={18} />}
        aria-label="Toggle notifications"
      />
      <IconButton
        variant="filled"
        shape="square"
        pressed={bookmarked}
        onPressedChange={setBookmarked}
        icon={<SparkleIcon size={18} />}
        aria-label="Toggle AI assist"
      />
      <IconButton
        variant="standard"
        defaultPressed={false}
        icon={<SettingsGearIcon size={18} />}
        aria-label="Toggle inspector"
      />
      <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
        Favorite: <strong>{liked ? "On" : "Off"}</strong> · Alerts:{" "}
        <strong>{subscribed ? "On" : "Off"}</strong>
      </span>
    </div>
  );
}

function IconButtonLoadingDangerDemo() {
  const [refreshing, setRefreshing] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const triggerRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    timerRef.current = window.setTimeout(() => {
      setRefreshing(false);
      timerRef.current = null;
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="demo-row">
        <IconButton variant="filled" loading icon={<RefreshIcon />} aria-label="Loading filled" />
        <IconButton variant="tonal" loading icon={<RefreshIcon />} aria-label="Loading tonal" />
        <IconButton
          variant="outlined"
          loading
          icon={<RefreshIcon />}
          aria-label="Loading outlined"
        />
        <IconButton
          variant="standard"
          loading
          icon={<RefreshIcon />}
          aria-label="Loading standard"
        />
        <IconButton
          variant="tonal"
          loading={refreshing}
          onClick={triggerRefresh}
          icon={<RefreshIcon size={18} />}
          aria-label="Click to refresh"
        />
      </div>
      <div className="demo-row">
        <IconButton
          variant="filled"
          intent="danger"
          icon={<TrashIcon size={18} />}
          aria-label="Delete permanently"
        />
        <IconButton
          variant="tonal"
          intent="danger"
          icon={<TrashIcon size={18} />}
          aria-label="Move to trash"
        />
        <IconButton
          variant="outlined"
          intent="danger"
          icon={<TrashIcon size={18} />}
          aria-label="Remove item"
        />
        <IconButton
          variant="standard"
          intent="danger"
          icon={<TrashIcon size={18} />}
          aria-label="Clear item"
        />
      </div>
    </div>
  );
}

function StandardButtonGroupDemo() {
  const [lastAction, setLastAction] = React.useState<string>("none");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ButtonGroup
        variant="standard"
        buttonVariant="tonal"
        expandedRatio={0.18}
        aria-label="Document actions"
        onAction={(val) => setLastAction(val)}
        items={[
          { value: "edit", label: "Edit", icon: <EditIcon size={16} /> },
          { value: "share", label: "Share", icon: <ShareIcon size={16} /> },
          { value: "export", label: "Export", icon: <DownloadIcon size={16} /> },
        ]}
      />
      <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
        Hold any button to observe expressive neighbor compression · Last action:{" "}
        <code>{lastAction}</code>
      </span>
    </div>
  );
}

function ConnectedSingleGroupDemo() {
  const [viewport, setViewport] = React.useState<string[]>(["desktop"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ButtonGroup
        variant="connected"
        selectionMode="single"
        value={viewport}
        onValueChange={setViewport}
        aria-label="Viewport preview mode"
        items={[
          {
            value: "desktop",
            label: "Desktop",
            icon: <DesktopViewportIcon size={15} />,
            showCheckIcon: true,
          },
          {
            value: "tablet",
            label: "Tablet",
            icon: <TabletViewportIcon size={15} />,
            showCheckIcon: true,
          },
          {
            value: "mobile",
            label: "Mobile",
            icon: <MobileViewportIcon size={15} />,
            showCheckIcon: true,
          },
        ]}
      />
      <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
        Active segment: <code>{viewport[0] ?? "desktop"}</code>
      </span>
    </div>
  );
}

function ConnectedMultiGroupDemo() {
  const [formats, setFormats] = React.useState<string[]>(["bold", "code"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ButtonGroup
        variant="connected"
        selectionMode="multiple"
        buttonVariant="outlined"
        size="sm"
        value={formats}
        onValueChange={setFormats}
        aria-label="Text formatting"
        items={[
          { value: "bold", label: "Bold", showCheckIcon: true },
          { value: "italic", label: "Italic", showCheckIcon: true },
          {
            value: "code",
            label: "Code",
            icon: <CodeBracketsIcon size={15} />,
            showCheckIcon: true,
          },
        ]}
      />
      <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
        Selected formats: <code>{formats.length > 0 ? formats.join(", ") : "none"}</code>
      </span>
    </div>
  );
}

function SplitButtonDangerItemsDemo() {
  const [status, setStatus] = React.useState("Ready");

  return (
    <div className="demo-row">
      <SplitButton
        variant="tonal"
        leadingIcon={<FolderIcon size={16} />}
        onClick={() => setStatus("Saved snapshot")}
        menuItems={[
          {
            id: "save-copy",
            label: "Save a copy",
            icon: <CopyIcon size={15} />,
            shortcut: "⇧⌘S",
            onSelect: () => setStatus("Saved duplicate copy"),
          },
          {
            id: "export-zip",
            label: "Export archive (.zip)",
            icon: <DownloadIcon size={15} />,
            shortcut: "⌘E",
            onSelect: () => setStatus("Exported archive"),
          },
          {
            id: "locked-branch",
            label: "Force overwrite main (locked)",
            shortcut: "⌘F",
            disabled: true,
          },
          {
            id: "delete-draft",
            label: "Discard & delete draft",
            icon: <TrashIcon size={15} />,
            shortcut: "⌘⌫",
            onSelect: () => setStatus("Deleted draft"),
          },
        ]}
      >
        Save Snapshot
      </SplitButton>
      <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
        Last command: <strong>{status}</strong>
      </span>
    </div>
  );
}

function FabVisibilityAndElevationDemo() {
  const [visible, setVisible] = React.useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="demo-row" style={{ gap: 8 }}>
        <Button
          size="xs"
          variant="tonal"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Hide FAB (visible=false)" : "Show FAB (visible=true)"}
        </Button>
      </div>
      <div className="demo-row" style={{ minHeight: 64 }}>
        <FAB
          visible={visible}
          icon={<PlusIcon size={22} />}
          aria-label="Animated visibility FAB"
        />
        <FAB
          variant="secondary"
          elevation="lowered"
          icon={<EditIcon size={20} />}
          aria-label="Lowered FAB"
        />
        <FAB
          variant="tertiary"
          elevation="none"
          morphOnPress
          icon={<SparkleIcon size={20} />}
          aria-label="Flat morphOnPress FAB"
        />
      </div>
    </div>
  );
}

function ExtendedFabCollapseDemo() {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="demo-row">
        <Button
          variant="outlined"
          pressed={!expanded}
          onPressedChange={(collapsed) => setExpanded(!collapsed)}
          showCheckIcon
        >
          {expanded ? "Collapse to Icon FAB" : "Expand Label"}
        </Button>
      </div>
      <div className="demo-row">
        <FAB
          expanded={expanded}
          variant="primary"
          size="sm"
          icon={<PlusIcon size={20} />}
        >
          Compose Message
        </FAB>
        <FAB
          expanded={expanded}
          variant="tertiary"
          size="md"
          icon={<SparkleIcon size={22} />}
        >
          Generate Summary
        </FAB>
      </div>
    </div>
  );
}

function FabMenuDemo() {
  const [open, setOpen] = React.useState(false);
  const [picked, setPicked] = React.useState("None");

  return (
    <div
      style={{
        minHeight: 250,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 20,
        padding: "16px 20px",
        borderRadius: 20,
        background: "var(--m3e-color-surface-container-low)",
        border: "1px solid var(--m3e-color-outline-variant)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Quick Creation Menu</span>
        <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
          Click the toggle FAB to fan out staggered spring actions · Last chosen:{" "}
          <strong>{picked}</strong>
        </span>
      </div>
      <FABMenu
        size="md"
        open={open}
        onOpenChange={setOpen}
        triggerLabel="Create resource"
        items={[
          {
            id: "new-doc",
            label: "New Document",
            icon: <EditIcon size={18} />,
            onSelect: () => setPicked("New Document"),
          },
          {
            id: "new-folder",
            label: "New Folder",
            icon: <FolderIcon size={18} />,
            onSelect: () => setPicked("New Folder"),
          },
          {
            id: "share-link",
            label: "Share Invite",
            icon: <ShareIcon size={18} />,
            onSelect: () => setPicked("Share Invite"),
          },
        ]}
      />
    </div>
  );
}

function FloatingToolbarVerticalDemo() {
  const [activeTool, setActiveTool] = React.useState("edit");

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", gap: 28 }}>
      <FloatingToolbar
        orientation="vertical"
        theme="vibrant"
        aria-label="Canvas docked tools"
        items={[
          {
            id: "search",
            label: "Find in canvas",
            icon: <SearchIcon size={18} />,
            selected: activeTool === "search",
            onClick: () => setActiveTool("search"),
          },
          {
            id: "edit",
            label: "Annotate",
            icon: <EditIcon size={18} />,
            selected: activeTool === "edit",
            onClick: () => setActiveTool("edit"),
          },
          {
            id: "code",
            label: "Inspect JSX",
            icon: <CodeBracketsIcon size={18} />,
            selected: activeTool === "code",
            separatorBefore: true,
            onClick: () => setActiveTool("code"),
          },
          {
            id: "share",
            label: "Share board",
            icon: <ShareIcon size={18} />,
            disabled: true,
          },
        ]}
        companionFab={
          <FAB
            size="sm"
            variant="primary"
            icon={<PlusIcon size={20} />}
            aria-label="Add node"
          />
        }
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>Vertical Docked Orientation</span>
        <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
          Selected tool: <code>{activeTool}</code> (with separator & disabled Share item)
        </span>
      </div>
    </div>
  );
}

function FloatingToolbarCollapsibleDemo() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="demo-row">
        <Button
          variant="outlined"
          pressed={collapsed}
          onPressedChange={setCollapsed}
          showCheckIcon
        >
          {collapsed ? "Collapsed (Companion FAB Prominent)" : "Collapse Toolbar"}
        </Button>
      </div>
      <div className="demo-row">
        <FloatingToolbar
          theme="standard"
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          aria-label="Reader actions"
          items={[
            { id: "like", label: "Like", icon: <HeartIcon size={18} />, selected: true },
            { id: "copy", label: "Copy link", icon: <CopyIcon size={18} /> },
            {
              id: "download",
              label: "Download offline",
              icon: <DownloadIcon size={18} />,
              separatorBefore: true,
            },
          ]}
          companionFab={
            <FAB
              size="sm"
              variant="tertiary"
              icon={<SparkleIcon size={20} />}
              aria-label="Ask AI assistant"
            />
          }
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component Documentation Registry: Actions                                  */
/* -------------------------------------------------------------------------- */

const COMMON_SPLIT_MENU = [
  { id: "send-now", label: "Send immediately", shortcut: "⌘↵" },
  { id: "schedule", label: "Schedule for 9:00 AM", shortcut: "⇧⌘L" },
  { id: "draft", label: "Save as template" },
] as const;

export const ACTIONS_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  /* ---------------------------------------------------------------------- */
  /* 1. Button                                                              */
  /* ---------------------------------------------------------------------- */
  {
    slug: "button",
    title: "Button",
    subtitle: {
      zh: "具备物理弹簧圆角形变（按压态与选中态平滑过渡）的 Material 3 Expressive 按钮与切换按钮，支持五级尺寸、危险意图、异步加载与多态链接渲染。",
      en: "Material 3 Expressive push and toggle buttons featuring spring-driven corner morphing on press and selection, five size scales, danger intent, async loading, and polymorphic link rendering.",
    },
    importStatement: 'import { Button } from "m3eui";',
    primitive: "@base-ui/react/button · @base-ui/react/toggle",
    scenarios: [
      {
        id: "button-variants",
        title: {
          zh: "五种视觉变体",
          en: "Five M3E Variants",
        },
        description: {
          zh: "按照界面操作层级从高到低依次提供 filled、tonal、elevated、outlined 与 text 五种标准容器风格。",
          en: "Covers all five emphasis tiers from high to low prominence: filled, tonal, elevated, outlined, and text.",
        },
        code: `<div className="demo-row">
  <Button variant="filled">Filled</Button>
  <Button variant="tonal">Tonal</Button>
  <Button variant="elevated">Elevated</Button>
  <Button variant="outlined">Outlined</Button>
  <Button variant="text">Text</Button>
</div>`,
        render: () => (
          <div className="demo-row">
            <Button variant="filled">Filled</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="elevated">Elevated</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
          </div>
        ),
      },
      {
        id: "button-sizes-shapes",
        title: {
          zh: "五档尺寸与圆角形态",
          en: "Sizes & Corner Shapes",
        },
        description: {
          zh: "支持 xs（32px）至 xl（136px）五档 M3E 规格，以及 round（胶囊）与 square（方圆角）两种静态形态；长按按钮可观察弹簧物理收敛至按压圆角。",
          en: "Spans five M3E size steps from xs (32px) to xl (136px) in both round and square resting shapes. Press and hold any button to feel the spring corner morph.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <div className="demo-row">
    <Button size="xs">Extra Small</Button>
    <Button size="sm">Small (Default)</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
    <Button size="xl">Extra Large</Button>
  </div>
  <div className="demo-row">
    <Button shape="round" variant="tonal" size="md">Round Shape</Button>
    <Button shape="square" variant="tonal" size="md">Square Shape</Button>
    <Button shape="square" variant="outlined" size="sm">Square Outlined</Button>
  </div>
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="demo-row">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small (Default)</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
            <div className="demo-row">
              <Button shape="round" variant="tonal" size="md">
                Round Shape
              </Button>
              <Button shape="square" variant="tonal" size="md">
                Square Shape
              </Button>
              <Button shape="square" variant="outlined" size="sm">
                Square Outlined
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "button-icons",
        title: {
          zh: "前置与后置图标",
          en: "Leading & Trailing Icons",
        },
        description: {
          zh: "通过 leadingIcon 与 trailingIcon 插入图标槽位，图标尺寸与间距随按钮 size 自动缩放。",
          en: "Attach leadingIcon, trailingIcon, or both; icon dimensions and inline gaps scale automatically with the active size spec.",
        },
        code: `<div className="demo-row">
  <Button leadingIcon={<PlusIcon size={16} />}>New Project</Button>
  <Button variant="tonal" trailingIcon={<SendIcon size={16} />}>Send Invite</Button>
  <Button
    variant="outlined"
    leadingIcon={<SparkleIcon size={16} />}
    trailingIcon={<ExternalLinkIcon size={14} />}
  >
    Open Studio
  </Button>
</div>`,
        render: () => (
          <div className="demo-row">
            <Button leadingIcon={<PlusIcon size={16} />}>New Project</Button>
            <Button variant="tonal" trailingIcon={<SendIcon size={16} />}>
              Send Invite
            </Button>
            <Button
              variant="outlined"
              leadingIcon={<SparkleIcon size={16} />}
              trailingIcon={<ExternalLinkIcon size={14} />}
            >
              Open Studio
            </Button>
          </div>
        ),
      },
      {
        id: "button-loading",
        title: {
          zh: "异步加载态",
          en: "Loading Spinner State",
        },
        description: {
          zh: "开启 loading 后自动渲染同色旋转指示器、挂载 aria-busy 并拦截重复点击；下方提供 1.2 秒交互式异步提交示例。",
          en: "Setting loading swaps the leading slot for a matching spinner, sets aria-busy, and prevents duplicate clicks. Try the interactive 1.2s deploy trigger below.",
        },
        code: `const [submitting, setSubmitting] = React.useState(false);

<div className="demo-row">
  <Button variant="filled" loading>Saving</Button>
  <Button variant="tonal" loading>Syncing</Button>
  <Button variant="outlined" loading>Verifying</Button>
  <Button
    leadingIcon={<SendIcon size={16} />}
    loading={submitting}
    onClick={() => {
      setSubmitting(true);
      setTimeout(() => setSubmitting(false), 1200);
    }}
  >
    {submitting ? "Deploying (1.2s)…" : "Click to Deploy (1.2s)"}
  </Button>
</div>`,
        render: () => <ButtonLoadingDemo />,
      },
      {
        id: "button-danger",
        title: {
          zh: "危险破坏性意图",
          en: "Danger / Destructive Intent",
        },
        description: {
          zh: "使用 intent=\"danger\" 将语义色板切换至 M3 error / error-container 体系，适用于删除、撤销权限等不可逆操作。",
          en: "Pass intent=\"danger\" to map container, outline, and label tokens onto the M3 error palette across filled, tonal, outlined, and text variants.",
        },
        code: `<div className="demo-row">
  <Button variant="filled" intent="danger" leadingIcon={<TrashIcon size={16} />}>
    Delete Workspace
  </Button>
  <Button variant="tonal" intent="danger">Revoke Token</Button>
  <Button variant="outlined" intent="danger">Remove Member</Button>
  <Button variant="text" intent="danger">Discard Draft</Button>
</div>`,
        render: () => (
          <div className="demo-row">
            <Button variant="filled" intent="danger" leadingIcon={<TrashIcon size={16} />}>
              Delete Workspace
            </Button>
            <Button variant="tonal" intent="danger">
              Revoke Token
            </Button>
            <Button variant="outlined" intent="danger">
              Remove Member
            </Button>
            <Button variant="text" intent="danger">
              Discard Draft
            </Button>
          </div>
        ),
      },
      {
        id: "button-disabled",
        title: {
          zh: "禁用态完整矩阵",
          en: "Disabled State Matrix",
        },
        description: {
          zh: "五种变体及未选中 / 已选中切换按钮的禁用态（12% 容器、38% 前景）。",
          en: "Disabled states across all five variants plus unselected and selected toggle buttons.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
  <div className="demo-row">
    <Button variant="filled" disabled>Filled</Button>
    <Button variant="tonal" disabled>Tonal</Button>
    <Button variant="elevated" disabled>Elevated</Button>
    <Button variant="outlined" disabled>Outlined</Button>
    <Button variant="text" disabled>Text</Button>
  </div>
  <div className="demo-row">
    <Button defaultPressed={false} variant="tonal" disabled>Toggle Off</Button>
    <Button variant="tonal" defaultPressed showCheckIcon disabled>
      Toggle On
    </Button>
  </div>
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="demo-row">
              <Button variant="filled" disabled>
                Filled
              </Button>
              <Button variant="tonal" disabled>
                Tonal
              </Button>
              <Button variant="elevated" disabled>
                Elevated
              </Button>
              <Button variant="outlined" disabled>
                Outlined
              </Button>
              <Button variant="text" disabled>
                Text
              </Button>
            </div>
            <div className="demo-row">
              <Button defaultPressed={false} variant="tonal" disabled>
                Toggle Off
              </Button>
              <Button variant="tonal" defaultPressed showCheckIcon disabled>
                Toggle On
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "button-link-toggle",
        title: {
          zh: "多态链接、通栏按钮与切换按钮",
          en: "Link, full-width & toggle",
        },
        description: {
          zh: "href 渲染为 <a>；fullWidth 铺满容器；传 pressed / defaultPressed 即为切换按钮，选中时圆角形变。",
          en: "href renders an <a>; fullWidth fills the container; pressed / defaultPressed makes it a toggle that morphs its corners.",
        },
        code: `const [starred, setStarred] = React.useState(true);
const [pinned, setPinned] = React.useState(false);

<Button
  variant="outlined"
  href="https://m3.material.io"
  target="_blank"
  rel="noopener noreferrer"
  trailingIcon={<ExternalLinkIcon size={14} />}
>
  Material 3 Spec
</Button>
<Button
  variant="tonal"
  pressed={starred}
  onPressedChange={setStarred}
  leadingIcon={<HeartIcon filled={starred} size={16} />}
>
  {starred ? "Starred (128)" : "Star"}
</Button>
<Button variant="outlined" pressed={pinned} onPressedChange={setPinned} showCheckIcon>
  {pinned ? "Pinned to Top" : "Pin Issue"}
</Button>
<Button variant="filled" fullWidth leadingIcon={<SparkleIcon size={16} />}>
  Full-Width Primary Action
</Button>`,
        render: () => <ButtonLinkAndToggleDemo />,
      },
    ],
    apis: [
      {
        title: "Button Props",
        description: {
          zh: "标准按钮与多态链接按钮属性。",
          en: "Props for standard push and link buttons.",
        },
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "按钮主文案内容。",
              en: "Primary button label content.",
            },
          },
          {
            name: "variant",
            type: '"filled" | "tonal" | "elevated" | "outlined" | "text"',
            defaultValue: '"filled"',
            description: {
              zh: "M3E 视觉层级变体。",
              en: "Visual emphasis variant.",
            },
          },
          {
            name: "intent",
            type: '"default" | "danger"',
            defaultValue: '"default"',
            description: {
              zh: "语义意图；设为 danger 时映射至错误破坏性色板。",
              en: "Semantic color intent; danger maps tokens to the error palette.",
            },
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"sm"',
            description: {
              zh: "五档高度与字号规格（32px–136px）。",
              en: "Five-step M3E height and typography scale (32px–136px).",
            },
          },
          {
            name: "shape",
            type: '"round" | "square"',
            defaultValue: '"round"',
            description: {
              zh: "常态几何圆角形态，按压时均通过弹簧向小圆角过渡。",
              en: "Resting corner profile; both morph via spring physics when pressed.",
            },
          },
          {
            name: "loading",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "展示内联加载旋转器并设置 aria-busy，同时阻止点击。",
              en: "Replaces the leading icon with a spinner, sets aria-busy, and disables interaction.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用按钮交互与弹簧按压反馈。",
              en: "Disables pointer/keyboard interaction and press morphing.",
            },
          },
          {
            name: "fullWidth",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否占满父容器 100% 宽度。",
              en: "Expands the button to 100% inline width of its container.",
            },
          },
          {
            name: "leadingIcon / trailingIcon",
            type: "React.ReactNode",
            description: {
              zh: "前置与后置图标节点（loading 时自动隐藏后置图标）。",
              en: "Optional leading and trailing icon elements.",
            },
          },
          {
            name: "href / target / rel",
            type: "string",
            description: {
              zh: "提供 href 时自动渲染为语义化 <a> 链接元素。",
              en: "Renders the button as an anchor link when href is supplied.",
            },
          },
          {
            name: "render",
            type: "React.ReactElement",
            description: {
              zh: "自定义底层渲染元素（如路由 Link 组件）。",
              en: "Custom element passed to Base UI render prop (e.g. router Link).",
            },
          },
          {
            name: "type",
            type: '"button" | "submit" | "reset"',
            defaultValue: '"button"',
            description: {
              zh: "原生 button 元素的表单行为类型。",
              en: "Native HTML button type attribute when rendered as a button.",
            },
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler<HTMLElement>",
            description: {
              zh: "点击事件回调。",
              en: "Click event handler.",
            },
          },
        ],
      },
      {
        title: "Button Props (toggle)",
        description: {
          zh: "具备 aria-pressed 双态切换与圆角形态记忆的切换按钮属性。",
          en: "Props for stateful toggle buttons with selection corner morphing.",
        },
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "切换按钮文本标签。",
              en: "Label content inside the toggle button.",
            },
          },
          {
            name: "pressed",
            type: "boolean",
            description: {
              zh: "受控选中状态。",
              en: "Controlled pressed/selected state.",
            },
          },
          {
            name: "defaultPressed",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "非受控初始选中状态。",
              en: "Initial pressed state when uncontrolled.",
            },
          },
          {
            name: "onPressedChange",
            type: "(pressed: boolean) => void",
            description: {
              zh: "选中状态变更时的回调。",
              en: "Callback fired when the pressed state changes.",
            },
          },
          {
            name: "variant",
            type: '"filled" | "tonal" | "elevated" | "outlined"',
            defaultValue: '"tonal"',
            description: {
              zh: "切换按钮容器风格（不含 text）。",
              en: "Container surface style (excludes text).",
            },
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"sm"',
            description: {
              zh: "按钮尺寸规格。",
              en: "Size token scale.",
            },
          },
          {
            name: "shape",
            type: '"round" | "square"',
            defaultValue: '"round"',
            description: {
              zh: "未选中时的基础几何形态，选中后自动形变为对偶圆角。",
              en: "Unselected corner shape; morphs to its complementary radius when selected.",
            },
          },
          {
            name: "showCheckIcon",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "选中时是否将前置图标替换为对勾标记。",
              en: "Displays a checkmark icon in the leading slot while selected.",
            },
          },
          {
            name: "leadingIcon",
            type: "React.ReactNode",
            description: {
              zh: "自定义前置图标节点。",
              en: "Optional leading icon when not overridden by showCheckIcon.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否禁用切换操作。",
              en: "Disables user interaction.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 2. IconButton                                                          */
  /* ---------------------------------------------------------------------- */
  {
    slug: "icon-button",
    title: "IconButton",
    subtitle: {
      zh: "紧凑型纯图标操作按钮与双态切换图标按钮，内置窄/标准/宽三种水平比例、五档尺寸、异步加载与危险语义。",
      en: "Compact icon-only action and toggle buttons supporting narrow/default/wide aspect ratios, five sizes, loading spinners, and destructive intent.",
    },
    importStatement: 'import { IconButton } from "m3eui";',
    primitive: "@base-ui/react/button · @base-ui/react/toggle",
    scenarios: [
      {
        id: "icon-button-variants",
        title: {
          zh: "四种容器变体与形态",
          en: "Four Variants & Shapes",
        },
        description: {
          zh: "提供 standard（无底色工具栏常用）、filled、tonal 与 outlined 四种风格，均可搭配 round 或 square 形态。",
          en: "Available in standard, filled, tonal, and outlined variants across both round and square corner profiles.",
        },
        code: `<div className="demo-row">
  <IconButton variant="standard" icon={<SearchIcon size={18} />} aria-label="Search" />
  <IconButton variant="filled" icon={<PlusIcon size={18} />} aria-label="Create" />
  <IconButton variant="tonal" icon={<ShareIcon size={18} />} aria-label="Share" />
  <IconButton variant="outlined" icon={<SettingsGearIcon size={18} />} aria-label="Settings" />
  <IconButton variant="tonal" shape="square" icon={<EditIcon size={18} />} aria-label="Edit square" />
</div>`,
        render: () => (
          <div className="demo-row">
            <IconButton variant="standard" icon={<SearchIcon size={18} />} aria-label="Search" />
            <IconButton variant="filled" icon={<PlusIcon size={18} />} aria-label="Create" />
            <IconButton variant="tonal" icon={<ShareIcon size={18} />} aria-label="Share" />
            <IconButton
              variant="outlined"
              icon={<SettingsGearIcon size={18} />}
              aria-label="Settings"
            />
            <IconButton
              variant="tonal"
              shape="square"
              icon={<EditIcon size={18} />}
              aria-label="Edit square"
            />
          </div>
        ),
      },
      {
        id: "icon-button-widths-sizes",
        title: {
          zh: "三种宽度比例与五档尺寸",
          en: "Width Variants & Size Scale",
        },
        description: {
          zh: "M3E 独有的 widthVariant（narrow / default / wide）允许在不改变高度的前提下调节水平视觉权重；尺寸覆盖 xs 至 xl。",
          en: "M3E widthVariant (narrow, default, wide) tunes horizontal footprint at constant height, alongside sizes xs through xl.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <div className="demo-row">
    <IconButton variant="tonal" widthVariant="narrow" icon={<BellIcon />} aria-label="Narrow" />
    <IconButton variant="tonal" widthVariant="default" icon={<BellIcon />} aria-label="Default" />
    <IconButton variant="tonal" widthVariant="wide" icon={<BellIcon />} aria-label="Wide" />
  </div>
  <div className="demo-row">
    <IconButton variant="filled" size="xs" icon={<SparkleIcon size={16} />} aria-label="XS" />
    <IconButton variant="filled" size="sm" icon={<SparkleIcon size={18} />} aria-label="SM" />
    <IconButton variant="filled" size="md" icon={<SparkleIcon size={20} />} aria-label="MD" />
    <IconButton variant="filled" size="lg" icon={<SparkleIcon size={26} />} aria-label="LG" />
    <IconButton variant="filled" size="xl" icon={<SparkleIcon size={32} />} aria-label="XL" />
  </div>
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="demo-row">
              <IconButton
                variant="tonal"
                widthVariant="narrow"
                icon={<BellIcon />}
                aria-label="Narrow width"
              />
              <IconButton
                variant="tonal"
                widthVariant="default"
                icon={<BellIcon />}
                aria-label="Default width"
              />
              <IconButton
                variant="tonal"
                widthVariant="wide"
                icon={<BellIcon />}
                aria-label="Wide width"
              />
            </div>
            <div className="demo-row">
              <IconButton
                variant="filled"
                size="xs"
                icon={<SparkleIcon size={16} />}
                aria-label="Extra small icon button"
              />
              <IconButton
                variant="filled"
                size="sm"
                icon={<SparkleIcon size={18} />}
                aria-label="Small icon button"
              />
              <IconButton
                variant="filled"
                size="md"
                icon={<SparkleIcon size={20} />}
                aria-label="Medium icon button"
              />
              <IconButton
                variant="filled"
                size="lg"
                icon={<SparkleIcon size={26} />}
                aria-label="Large icon button"
              />
              <IconButton
                variant="filled"
                size="xl"
                icon={<SparkleIcon size={32} />}
                aria-label="Extra large icon button"
              />
            </div>
          </div>
        ),
      },
      {
        id: "icon-button-toggle",
        title: {
          zh: "可切换状态图标按钮",
          en: "Toggle",
        },
        description: {
          zh: "适用于收藏、订阅通知、固定面板等双态开关，支持通过 checkedIcon 在激活时替换为实心图标并自动形变圆角。",
          en: "Ideal for favorites, mute/bell toggles, and inspector pins; supports a dedicated checkedIcon and spring corner morphing when active.",
        },
        code: `const [liked, setLiked] = React.useState(true);
const [subscribed, setSubscribed] = React.useState(false);

<IconButton
  variant="tonal"
  pressed={liked}
  onPressedChange={setLiked}
  icon={<HeartIcon filled={false} />}
  checkedIcon={<HeartIcon filled />}
  aria-label="Favorite item"
/>
<IconButton
  variant="outlined"
  pressed={subscribed}
  onPressedChange={setSubscribed}
  icon={<BellIcon />}
  aria-label="Toggle notifications"
/>`,
        render: () => <IconButtonToggleDemo />,
      },
      {
        id: "icon-button-loading-danger",
        title: {
          zh: "加载态与危险意图",
          en: "Loading Spinner & Danger Intent",
        },
        description: {
          zh: "四种变体均支持 loading 异步旋转态（点击右侧刷新按钮体验 1.2s 加载）以及 intent=\"danger\" 破坏性配色。",
          en: "Both loading spinners and intent=\"danger\" error palettes work consistently across filled, tonal, outlined, and standard variants.",
        },
        code: `<div className="demo-row">
  <IconButton variant="filled" loading icon={<RefreshIcon />} aria-label="Loading" />
  <IconButton variant="tonal" loading icon={<RefreshIcon />} aria-label="Loading" />
  <IconButton variant="filled" intent="danger" icon={<TrashIcon />} aria-label="Delete" />
  <IconButton variant="tonal" intent="danger" icon={<TrashIcon />} aria-label="Move to trash" />
  <IconButton variant="outlined" intent="danger" icon={<TrashIcon />} aria-label="Remove" />
  <IconButton variant="standard" intent="danger" icon={<TrashIcon />} aria-label="Clear" />
</div>`,
        render: () => <IconButtonLoadingDangerDemo />,
      },
      {
        id: "icon-button-disabled",
        title: {
          zh: "禁用态矩阵",
          en: "Disabled Matrix",
        },
        description: {
          zh: "四种变体及未选中 / 已选中切换态的禁用态。",
          en: "Disabled states across all four variants plus unpressed and pressed toggles.",
        },
        code: `<div className="demo-row">
  <IconButton variant="standard" disabled icon={<SearchIcon />} aria-label="Search" />
  <IconButton variant="filled" disabled icon={<PlusIcon />} aria-label="Create" />
  <IconButton variant="tonal" disabled icon={<ShareIcon />} aria-label="Share" />
  <IconButton variant="outlined" disabled icon={<SettingsGearIcon />} aria-label="Settings" />
  <IconButton defaultPressed={false} variant="tonal" disabled icon={<HeartIcon />} aria-label="Favorite off" />
  <IconButton
    variant="tonal"
    defaultPressed
    disabled
    icon={<HeartIcon filled />}
    aria-label="Favorite on"
  />
</div>`,
        render: () => (
          <div className="demo-row">
            <IconButton
              variant="standard"
              disabled
              icon={<SearchIcon size={18} />}
              aria-label="Search disabled"
            />
            <IconButton
              variant="filled"
              disabled
              icon={<PlusIcon size={18} />}
              aria-label="Create disabled"
            />
            <IconButton
              variant="tonal"
              disabled
              icon={<ShareIcon size={18} />}
              aria-label="Share disabled"
            />
            <IconButton
              variant="outlined"
              disabled
              icon={<SettingsGearIcon size={18} />}
              aria-label="Settings disabled"
            />
            <IconButton
              defaultPressed={false}
              variant="tonal"
              disabled
              icon={<HeartIcon size={18} />}
              aria-label="Favorite disabled off"
            />
            <IconButton
              variant="tonal"
              defaultPressed
              disabled
              icon={<HeartIcon filled size={18} />}
              aria-label="Favorite disabled on"
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "IconButton Props",
        rows: [
          {
            name: "icon",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "中心渲染的 SVG 图标节点。",
              en: "Icon glyph rendered inside the button.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            required: true,
            description: {
              zh: "必填无障碍名称，供屏幕阅读器朗读纯图标按钮用途。",
              en: "Required accessible name announcing the button action to assistive tech.",
            },
          },
          {
            name: "variant",
            type: '"standard" | "filled" | "tonal" | "outlined"',
            defaultValue: '"standard"',
            description: {
              zh: "图标按钮容器视觉风格。",
              en: "Surface emphasis style.",
            },
          },
          {
            name: "widthVariant",
            type: '"narrow" | "default" | "wide"',
            defaultValue: '"default"',
            description: {
              zh: "M3E 水平宽度比例变体。",
              en: "Horizontal width proportion at the selected height.",
            },
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"sm"',
            description: {
              zh: "按钮尺寸等级。",
              en: "Size scale token.",
            },
          },
          {
            name: "shape",
            type: '"round" | "square"',
            defaultValue: '"round"',
            description: {
              zh: "静态圆角轮廓类型。",
              en: "Resting corner shape.",
            },
          },
          {
            name: "intent",
            type: '"default" | "danger"',
            defaultValue: '"default"',
            description: {
              zh: "设为 danger 时启用错误破坏性语义配色。",
              en: "Switches surface and icon colors to the destructive error palette.",
            },
          },
          {
            name: "loading",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "将图标替换为旋转加载器并锁定点击。",
              en: "Replaces the icon with a spinner and disables interaction.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否禁用按钮。",
              en: "Disables button interaction.",
            },
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler<HTMLElement>",
            description: {
              zh: "点击事件回调。",
              en: "Click handler.",
            },
          },
          {
            name: "href",
            type: "string",
            description: {
              zh: "传入时自动将底层节点渲染为语义化 <a> 链接，并保留弹簧圆角物理形变。",
              en: "Renders a semantic <a> anchor element while preserving spring corner morphing.",
            },
          },
          {
            name: "target / rel",
            type: "string",
            description: {
              zh: "配合 href 使用的原生物理链接打开目标与安全关系属性。",
              en: "Anchor target and rel attributes forwarded when href is set.",
            },
          },
          {
            name: "render",
            type: "React.ReactElement",
            description: {
              zh: "自定义底层渲染元素（如路由 Link 组件）。",
              en: "Custom element composition override (e.g. router Link).",
            },
          },
        ],
      },
      {
        title: "IconButton Props (toggle)",
        rows: [
          {
            name: "icon",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "默认（未选中）图标节点。",
              en: "Default unselected icon element.",
            },
          },
          {
            name: "checkedIcon",
            type: "React.ReactNode",
            description: {
              zh: "选中激活时替换显示的图标节点（如实心红心）。",
              en: "Optional icon rendered while pressed/selected.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            required: true,
            description: {
              zh: "必填无障碍标签。",
              en: "Required accessible label.",
            },
          },
          {
            name: "pressed / defaultPressed",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "受控或非受控激活状态。",
              en: "Controlled or uncontrolled pressed state.",
            },
          },
          {
            name: "onPressedChange",
            type: "(pressed: boolean) => void",
            description: {
              zh: "激活状态切换回调。",
              en: "Called when the toggle state changes.",
            },
          },
          {
            name: "variant",
            type: '"standard" | "filled" | "tonal" | "outlined"',
            defaultValue: '"tonal"',
            description: {
              zh: "容器视觉变体。",
              en: "Container style variant.",
            },
          },
          {
            name: "widthVariant",
            type: '"narrow" | "default" | "wide"',
            defaultValue: '"default"',
            description: {
              zh: "水平宽度比例变体。",
              en: "Horizontal width proportion.",
            },
          },
          {
            name: "size / shape / disabled",
            type: "ButtonSize · \"round\" | \"square\" · boolean",
            description: {
              zh: "与 IconButton 一致的尺寸、圆角形态及禁用控制。",
              en: "Size, corner shape, and disabled state matching IconButton.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 3. ButtonGroup                                                         */
  /* ---------------------------------------------------------------------- */
  {
    slug: "button-group",
    title: "ButtonGroup",
    subtitle: {
      zh: "支持按压宽度弹簧挤压传递的 Standard 按钮组与共享内侧小圆角的 Connected 分段控制器，内置单选、多选与响应式溢出菜单。",
      en: "Expressive button groups supporting spring width-sharing neighbor compression (standard) and shared inner-corner segmented controls (connected) with single/multiple selection and overflow menus.",
    },
    importStatement: 'import { ButtonGroup } from "m3eui";',
    primitive: "@base-ui/react/toggle-group · @base-ui/react/toolbar · @base-ui/react/menu",
    scenarios: [
      {
        id: "button-group-standard",
        title: {
          zh: "Standard 弹簧宽度膨胀按钮组",
          en: "Standard Expressive Width-Expansion Group",
        },
        description: {
          zh: "variant=\"standard\" 下按住任意按钮，该按钮按 expandedRatio（此处为 0.18）水平舒展，相邻按钮同步弹性收敛，总行宽保持恒定不抖动。",
          en: "With variant=\"standard\" and expandedRatio={0.18}, pressing an item expands its width while smoothly compressing adjacent neighbors so total group width never shifts.",
        },
        code: `<ButtonGroup
  variant="standard"
  buttonVariant="tonal"
  expandedRatio={0.18}
  aria-label="Document actions"
  onAction={(val) => console.log(val)}
  items={[
    { value: "edit", label: "Edit", icon: <EditIcon size={16} /> },
    { value: "share", label: "Share", icon: <ShareIcon size={16} /> },
    { value: "export", label: "Export", icon: <DownloadIcon size={16} /> },
  ]}
/>`,
        render: () => <StandardButtonGroupDemo />,
      },
      {
        id: "button-group-connected-single",
        title: {
          zh: "Connected 单选分段控制器",
          en: "Connected Single-Selection Segmented Control",
        },
        description: {
          zh: "variant=\"connected\" 外侧保持胶囊大圆角、内侧缝隙收紧为小圆角；被选中的分段自动平滑还原为完整胶囊轮廓。",
          en: "Connected groups pair pill outer caps with tight inner seams; the selected segment springs back into a full pill silhouette.",
        },
        code: `const [viewport, setViewport] = React.useState(["desktop"]);

<ButtonGroup
  variant="connected"
  selectionMode="single"
  value={viewport}
  onValueChange={setViewport}
  aria-label="Viewport preview mode"
  items={[
    { value: "desktop", label: "Desktop", icon: <DesktopViewportIcon />, showCheckIcon: true },
    { value: "tablet", label: "Tablet", icon: <TabletViewportIcon />, showCheckIcon: true },
    { value: "mobile", label: "Mobile", icon: <MobileViewportIcon />, showCheckIcon: true },
  ]}
/>`,
        render: () => <ConnectedSingleGroupDemo />,
      },
      {
        id: "button-group-connected-multi",
        title: {
          zh: "Connected 多选文本格式工具栏",
          en: "Connected Multi-Select Formatting Toolbar",
        },
        description: {
          zh: "设置 selectionMode=\"multiple\" 可同时激活多个格式开关，适用于富文本编辑器工具条或多重筛选器。",
          en: "Set selectionMode=\"multiple\" to allow independent formatting toggles such as Bold, Italic, and Code.",
        },
        code: `const [formats, setFormats] = React.useState(["bold", "code"]);

<ButtonGroup
  variant="connected"
  selectionMode="multiple"
  buttonVariant="outlined"
  size="sm"
  value={formats}
  onValueChange={setFormats}
  aria-label="Text formatting"
  items={[
    { value: "bold", label: "Bold", showCheckIcon: true },
    { value: "italic", label: "Italic", showCheckIcon: true },
    { value: "code", label: "Code", icon: <CodeBracketsIcon />, showCheckIcon: true },
  ]}
/>`,
        render: () => <ConnectedMultiGroupDemo />,
      },
      {
        id: "button-group-disabled",
        title: {
          zh: "单项禁用与多尺寸对比",
          en: "Disabled Items & Size Scale",
        },
        description: {
          zh: "支持在 items 中针对单个选项设置 disabled，并支持 xs、sm、md 等多级高度尺寸。",
          en: "Individual items can be disabled via disabled: true while preserving connected corner geometry across xs, sm, and md sizes.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
  <ButtonGroup
    size="xs"
    defaultValue={["day"]}
    items={[
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "quarter", label: "Quarter", disabled: true },
    ]}
  />
  <ButtonGroup
    size="sm"
    defaultValue={["week"]}
    items={[
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "quarter", label: "Quarter", disabled: true },
    ]}
  />
  <ButtonGroup
    size="md"
    defaultValue={["day"]}
    items={[
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "quarter", label: "Quarter", disabled: true },
    ]}
  />
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ButtonGroup
              size="xs"
              aria-label="Schedule range xs"
              defaultValue={["day"]}
              items={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "quarter", label: "Quarter", disabled: true },
              ]}
            />
            <ButtonGroup
              size="sm"
              aria-label="Schedule range sm"
              defaultValue={["week"]}
              items={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "quarter", label: "Quarter", disabled: true },
              ]}
            />
            <ButtonGroup
              size="md"
              aria-label="Schedule range md"
              defaultValue={["day"]}
              items={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "quarter", label: "Quarter", disabled: true },
              ]}
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "ButtonGroup Props",
        rows: [
          {
            name: "items",
            type: "readonly ButtonGroupOption[]",
            required: true,
            description: {
              zh: "按钮组配置项数组。",
              en: "Array of item descriptors rendered in the group.",
            },
          },
          {
            name: "variant",
            type: '"standard" | "connected"',
            defaultValue: '"connected"',
            description: {
              zh: "standard 为独立间距按钮组；connected 为共享内侧圆角的分段组。",
              en: "Layout topology: independent pills (standard) or segmented inner seams (connected).",
            },
          },
          {
            name: "selectionMode",
            type: '"none" | "single" | "multiple"',
            defaultValue: '"single" (connected) / "none" (standard)',
            description: {
              zh: "选择模式：纯触发动作、单选或多选。",
              en: "Action-only toolbar (none), single selection, or multi-select toggle group.",
            },
          },
          {
            name: "value / defaultValue",
            type: "readonly string[]",
            defaultValue: "[]",
            description: {
              zh: "受控或非受控选中项 value 数组。",
              en: "Controlled or initial selected item values.",
            },
          },
          {
            name: "onValueChange",
            type: "(value: string[]) => void",
            description: {
              zh: "单选或多选状态变化回调。",
              en: "Callback invoked when selected values change.",
            },
          },
          {
            name: "onAction",
            type: "(value: string) => void",
            description: {
              zh: "点击某个按钮项（含溢出菜单项）时的动作回调。",
              en: "Fired with the item value whenever an action item is activated.",
            },
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"sm"',
            description: {
              zh: "组内按钮统一尺寸。",
              en: "Uniform button size across the group.",
            },
          },
          {
            name: "buttonVariant",
            type: '"filled" | "tonal" | "elevated" | "outlined"',
            defaultValue: '"tonal" (connected) / "filled" (standard)',
            description: {
              zh: "子按钮视觉变体。",
              en: "Surface style applied to each member button.",
            },
          },
          {
            name: "expandedRatio",
            type: "number",
            defaultValue: "0.15 (standard) / 0 (connected)",
            description: {
              zh: "按压某项时向两侧借用宽度的膨胀比例。",
              en: "Fraction of item width borrowed from neighbors while pressed.",
            },
          },
          {
            name: "maxVisibleItems / autoOverflow",
            type: "number · boolean",
            defaultValue: "undefined / false",
            description: {
              zh: "超出数量或容器宽度不足时自动收纳进末尾更多菜单。",
              en: "Collapses excess items into a trailing segmented overflow menu.",
            },
          },
        ],
      },
      {
        title: "ButtonGroupItemSpec (ButtonGroupOption)",
        description: {
          zh: "items 数组中每个按钮项的结构定义。",
          en: "Fields for each item object passed in the items prop.",
        },
        rows: [
          {
            name: "value",
            type: "string",
            required: true,
            description: {
              zh: "唯一标识值。",
              en: "Unique identifier for selection and action callbacks.",
            },
          },
          {
            name: "label",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "按钮显示文本。",
              en: "Visible label node.",
            },
          },
          {
            name: "icon / checkedIcon",
            type: "React.ReactNode",
            description: {
              zh: "默认前置图标与选中态替换图标。",
              en: "Leading icon and optional selected-state icon.",
            },
          },
          {
            name: "showCheckIcon",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "选中时是否展示对勾图标。",
              en: "Shows a leading checkmark when the item is selected.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "单独禁用当前分段项。",
              en: "Disables this specific item.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 4. SplitButton                                                         */
  /* ---------------------------------------------------------------------- */
  {
    slug: "split-button",
    title: "SplitButton",
    subtitle: {
      zh: "将高频主操作与次级下拉菜单合二为一的双段式按钮，右侧触发器具备光学中心补偿、悬停内角形变与 180° 弹簧箭头旋转。",
      en: "Dual-segment action button pairing a primary trigger with a segmented dropdown menu, complete with optical chevron centering, hover inner-corner morphing, and 180° spring chevron rotation.",
    },
    importStatement: 'import { SplitButton } from "m3eui";',
    primitive: "@base-ui/react/button · @base-ui/react/menu",
    scenarios: [
      {
        id: "split-button-variants",
        title: {
          zh: "四种表面变体",
          en: "Four Surface Variants",
        },
        description: {
          zh: "支持 filled、tonal、elevated 与 outlined 四种变体；展开右侧菜单时触发器自动形变为对称圆角并旋转箭头。",
          en: "Supports filled, tonal, elevated, and outlined variants. Opening the trailing trigger morphs it into a symmetric pill and rotates the chevron.",
        },
        code: `<div className="demo-row">
  <SplitButton variant="filled" leadingIcon={<SendIcon size={16} />} menuItems={menuItems}>
    Send Mail
  </SplitButton>
  <SplitButton variant="tonal" leadingIcon={<SendIcon size={16} />} menuItems={menuItems}>
    Tonal
  </SplitButton>
  <SplitButton variant="elevated" menuItems={menuItems}>Elevated</SplitButton>
  <SplitButton variant="outlined" menuItems={menuItems}>Outlined</SplitButton>
</div>`,
        render: () => (
          <div className="demo-row">
            <SplitButton
              variant="filled"
              leadingIcon={<SendIcon size={16} />}
              menuItems={COMMON_SPLIT_MENU}
            >
              Send Mail
            </SplitButton>
            <SplitButton
              variant="tonal"
              leadingIcon={<SendIcon size={16} />}
              menuItems={COMMON_SPLIT_MENU}
            >
              Tonal
            </SplitButton>
            <SplitButton variant="elevated" menuItems={COMMON_SPLIT_MENU}>
              Elevated
            </SplitButton>
            <SplitButton variant="outlined" menuItems={COMMON_SPLIT_MENU}>
              Outlined
            </SplitButton>
          </div>
        ),
      },
      {
        id: "split-button-sizes",
        title: {
          zh: "多级尺寸规格",
          en: "Size Scale (XS – LG)",
        },
        description: {
          zh: "从紧凑工具栏 xs（32px）到大号主操作 lg（96px），主按钮内边距、中缝间隙与右侧箭头光学偏移量均按规格自适应。",
          en: "Scales cleanly across xs, sm, md, and lg while maintaining proportional seam radii and trailing chevron optical alignment.",
        },
        code: `<div className="demo-row">
  <SplitButton size="xs" menuItems={menuItems}>Extra Small</SplitButton>
  <SplitButton size="sm" menuItems={menuItems}>Small</SplitButton>
  <SplitButton size="md" variant="tonal" menuItems={menuItems}>Medium</SplitButton>
  <SplitButton size="lg" variant="outlined" menuItems={menuItems}>Large</SplitButton>
</div>`,
        render: () => (
          <div className="demo-row">
            <SplitButton size="xs" menuItems={COMMON_SPLIT_MENU}>
              Extra Small
            </SplitButton>
            <SplitButton size="sm" menuItems={COMMON_SPLIT_MENU}>
              Small
            </SplitButton>
            <SplitButton size="md" variant="tonal" menuItems={COMMON_SPLIT_MENU}>
              Medium
            </SplitButton>
            <SplitButton size="lg" variant="outlined" menuItems={COMMON_SPLIT_MENU}>
              Large
            </SplitButton>
          </div>
        ),
      },
      {
        id: "split-button-danger-items",
        title: {
          zh: "快捷键提示、选中标记与破坏性菜单项",
          en: "Shortcuts, Locked & Destructive Menu Items",
        },
        description: {
          zh: "下拉分段菜单项支持前置图标、右侧快捷键提示（shortcut）、当前默认项高亮（selected）、单项禁用（disabled）与删除等破坏性操作。",
          en: "Segmented menu items support leading icons, keyboard shortcut hints, selected highlights, disabled entries, and destructive actions.",
        },
        code: `<SplitButton
  variant="tonal"
  leadingIcon={<FolderIcon size={16} />}
  menuItems={[
    { id: "copy", label: "Save a copy", icon: <CopyIcon />, shortcut: "⇧⌘S", selected: true },
    { id: "zip", label: "Export archive (.zip)", icon: <DownloadIcon />, shortcut: "⌘E" },
    { id: "locked", label: "Force overwrite main (locked)", shortcut: "⌘F", disabled: true },
    { id: "delete", label: "Discard & delete draft", icon: <TrashIcon />, shortcut: "⌘⌫" },
  ]}
>
  Save Snapshot
</SplitButton>`,
        render: () => <SplitButtonDangerItemsDemo />,
      },
      {
        id: "split-button-disabled",
        title: {
          zh: "禁用态变体矩阵",
          en: "Disabled Across Variants",
        },
        description: {
          zh: "设置 disabled 后同时锁定左侧主动作按钮与右侧下拉菜单触发器。",
          en: "Passing disabled locks both the primary leading button and the trailing menu trigger across all variants.",
        },
        code: `<div className="demo-row">
  <SplitButton variant="filled" disabled menuItems={menuItems}>Filled</SplitButton>
  <SplitButton variant="tonal" disabled menuItems={menuItems}>Tonal</SplitButton>
  <SplitButton variant="elevated" disabled menuItems={menuItems}>Elevated</SplitButton>
  <SplitButton variant="outlined" disabled menuItems={menuItems}>Outlined</SplitButton>
</div>`,
        render: () => (
          <div className="demo-row">
            <SplitButton variant="filled" disabled menuItems={COMMON_SPLIT_MENU}>
              Filled
            </SplitButton>
            <SplitButton variant="tonal" disabled menuItems={COMMON_SPLIT_MENU}>
              Tonal
            </SplitButton>
            <SplitButton variant="elevated" disabled menuItems={COMMON_SPLIT_MENU}>
              Elevated
            </SplitButton>
            <SplitButton variant="outlined" disabled menuItems={COMMON_SPLIT_MENU}>
              Outlined
            </SplitButton>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "SplitButton Props",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "左侧主动作按钮文本。",
              en: "Label content for the leading primary action button.",
            },
          },
          {
            name: "menuItems",
            type: "readonly M3EMenuItemSpec[]",
            required: true,
            description: {
              zh: "右侧下拉菜单项，与 DropdownMenu 的 items 相同。",
              en: "Trailing menu items; same shape as DropdownMenu items.",
            },
          },
          {
            name: "variant",
            type: '"filled" | "tonal" | "elevated" | "outlined"',
            defaultValue: '"filled"',
            description: {
              zh: "双段按钮统一视觉变体。",
              en: "Visual variant applied to both leading and trailing segments.",
            },
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"sm"',
            description: {
              zh: "尺寸规格。",
              en: "Button height and typography size scale.",
            },
          },
          {
            name: "leadingIcon",
            type: "React.ReactNode",
            description: {
              zh: "左侧主按钮前置图标。",
              en: "Optional leading icon inside the primary segment.",
            },
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler<HTMLElement>",
            description: {
              zh: "点击左侧主按钮时的回调。",
              en: "Click handler for the leading primary action.",
            },
          },
          {
            name: "open / defaultOpen / onOpenChange",
            type: "boolean · (open: boolean) => void",
            defaultValue: "false",
            description: {
              zh: "右侧下拉菜单的受控或非受控展开状态。",
              en: "Controlled or uncontrolled open state for the dropdown menu.",
            },
          },
          {
            name: "menuTriggerLabel",
            type: "string",
            description: {
              zh: "右侧下拉触发按钮的无障碍标签（默认使用内置国际化文案）。",
              en: "Accessible aria-label for the trailing chevron menu trigger.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "同时禁用主按钮与菜单触发器。",
              en: "Disables both segments of the split button.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 5. FAB & FABMenu                                                       */
  /* ---------------------------------------------------------------------- */
  {
    slug: "fab",
    title: "FAB",
    subtitle: {
      zh: "页面最高优先级的悬浮主操作。传 children 即为带文字的 FAB，expanded 控制展开收起。",
      en: "Highest-emphasis floating action. Pass children for a labelled FAB; expanded collapses it to icon-only.",
    },
    importStatement: 'import { FAB } from "m3eui";',
    primitive: "@base-ui/react/button",
    scenarios: [
      {
        id: "fab-palettes-sizes",
        title: {
          zh: "四种主题色板与多档尺寸",
          en: "Color Palettes & Size Scale",
        },
        description: {
          zh: "支持 primary、secondary、tertiary、surface 四种主题容器配色，以及 xs（40px）、sm（56px，默认）、md（80px）、lg（96px）四档 AOSP 尺寸。",
          en: "Supports primary, secondary, tertiary, and surface color roles across xs (40px), sm (56px, default), md (80px), and lg (96px) container sizes.",
        },
        code: `<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
  <div className="demo-row">
    <FAB variant="primary" icon={<PlusIcon size={22} />} aria-label="Primary FAB" />
    <FAB variant="secondary" icon={<EditIcon size={20} />} aria-label="Secondary FAB" />
    <FAB variant="tertiary" icon={<SparkleIcon size={20} />} aria-label="Tertiary FAB" />
    <FAB variant="surface" icon={<ShareIcon size={20} />} aria-label="Surface FAB" />
  </div>
  <div className="demo-row">
    <FAB size="xs" variant="secondary" icon={<PlusIcon size={18} />} aria-label="Extra-small FAB" />
    <FAB size="sm" variant="primary" icon={<PlusIcon size={22} />} aria-label="Baseline FAB" />
    <FAB size="md" variant="tertiary" icon={<PlusIcon size={26} />} aria-label="Medium FAB" />
    <FAB size="lg" variant="surface" icon={<PlusIcon size={32} />} aria-label="Large FAB" />
  </div>
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="demo-row">
              <FAB variant="primary" icon={<PlusIcon size={22} />} aria-label="Primary FAB" />
              <FAB variant="secondary" icon={<EditIcon size={20} />} aria-label="Secondary FAB" />
              <FAB variant="tertiary" icon={<SparkleIcon size={20} />} aria-label="Tertiary FAB" />
              <FAB variant="surface" icon={<ShareIcon size={20} />} aria-label="Surface FAB" />
            </div>
            <div className="demo-row">
              <FAB
                size="xs"
                variant="secondary"
                icon={<PlusIcon size={18} />}
                aria-label="Extra-small FAB"
              />
              <FAB
                size="sm"
                variant="primary"
                icon={<PlusIcon size={22} />}
                aria-label="Baseline FAB"
              />
              <FAB
                size="md"
                variant="tertiary"
                icon={<PlusIcon size={26} />}
                aria-label="Medium FAB"
              />
              <FAB
                size="lg"
                variant="surface"
                icon={<PlusIcon size={32} />}
                aria-label="Large FAB"
              />
            </div>
          </div>
        ),
      },
      {
        id: "extended-fab-collapse",
        title: {
          zh: "带文字与展开收起",
          en: "Labelled & collapsible",
        },
        description: {
          zh: "切换 expanded 属性可在「图标 + 文本标签」与紧凑正方图标按钮之间通过弹簧物理平滑过渡宽度与不透明度。",
          en: "Toggle expanded to smoothly spring-animate container width and label opacity between full icon+label mode and a compact icon-only square.",
        },
        code: `const [expanded, setExpanded] = React.useState(true);

<FAB expanded={expanded} variant="primary" icon={<PlusIcon size={20} />}>
  Compose Message
</FAB>`,
        render: () => <ExtendedFabCollapseDemo />,
      },
      {
        id: "fab-visibility-elevation",
        title: {
          zh: "显隐缩放动画、海拔档位与稳态圆角",
          en: "Visibility Animation, Elevation & Press Policy",
        },
        description: {
          zh: "对齐 AOSP FloatingActionButton：visible 控制 0.2 ↔ 1 弹簧显隐，elevation 支持 lowered / none，默认按压保持稳态圆角（可通过 morphOnPress 开启收紧）。",
          en: "Matches AOSP FloatingActionButton: visible drives 0.2 ↔ 1 spring scale/opacity, elevation supports lowered / none, and corners stay steady unless morphOnPress is set.",
        },
        code: `<FAB visible={visible} icon={<PlusIcon />} aria-label="Create" />
<FAB elevation="lowered" variant="secondary" icon={<EditIcon />} aria-label="Lowered" />
<FAB elevation="none" morphOnPress variant="tertiary" icon={<SparkleIcon />} aria-label="Flat" />`,
        render: () => <FabVisibilityAndElevationDemo />,
      },
      {
        id: "fab-disabled",
        title: {
          zh: "禁用态",
          en: "Disabled",
        },
        description: {
          zh: "禁用状态下自动移除悬浮阴影并降低容器与图标对比度。",
          en: "Disabled FABs drop elevation and use muted M3 disabled tokens.",
        },
        code: `<div className="demo-row">
  <FAB disabled icon={<PlusIcon size={22} />} aria-label="Disabled FAB" />
  <FAB disabled icon={<EditIcon size={20} />}>New Entry</FAB>
  <FAB disabled expanded={false} icon={<SparkleIcon size={20} />}>
    Collapsed Disabled
  </FAB>
</div>`,
        render: () => (
          <div className="demo-row">
            <FAB disabled icon={<PlusIcon size={22} />} aria-label="Disabled FAB" />
            <FAB disabled icon={<EditIcon size={20} />}>
              New Entry
            </FAB>
            <FAB disabled expanded={false} icon={<SparkleIcon size={20} />}>
              Collapsed Disabled
            </FAB>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "FAB Props",
        rows: [
          {
            name: "icon",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "悬浮按钮中心图标。",
              en: "Icon rendered inside the FAB.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            required: true,
            description: {
              zh: "必填无障碍名称。",
              en: "Required accessible label.",
            },
          },
          {
            name: "variant",
            type: '"primary" | "secondary" | "tertiary" | "surface"',
            defaultValue: '"primary"',
            description: {
              zh: "M3 主题色板变体。",
              en: "M3 container color role.",
            },
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg"',
            defaultValue: '"sm"',
            description: {
              zh: "容器尺寸（40 / 56 / 80 / 96px）。",
              en: "Container size step (40 / 56 / 80 / 96px).",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用按钮并移除阴影。",
              en: "Disables interaction and elevation.",
            },
          },
        ],
      },
      {
        title: "FAB Props (with label)",
        rows: [
          {
            name: "icon",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "前置图标节点。",
              en: "Leading icon element.",
            },
          },
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "展开时显示的文本标签（收起时自动用作备用 aria-label）。",
              en: "Label text shown when expanded (also used as fallback aria-label when collapsed).",
            },
          },
          {
            name: "expanded",
            type: "boolean",
            defaultValue: "true",
            description: {
              zh: "是否处于展开显示文本状态。",
              en: "Controls whether the text label is expanded or collapsed to icon-only.",
            },
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            defaultValue: '"sm"',
            description: {
              zh: "扩展悬浮按钮高度规格（56 / 80 / 96px）。",
              en: "Extended FAB height scale (56 / 80 / 96px).",
            },
          },
          {
            name: "variant / disabled",
            type: 'FabColorVariant · boolean',
            defaultValue: '"primary" / false',
            description: {
              zh: "色板角色与禁用状态。",
              en: "Palette variant and disabled flag.",
            },
          },
        ],
      },
    ],
  },

  {
    slug: "fab-menu",
    title: "FABMenu",
    primitive: "@base-ui/react/menu",
    subtitle: {
      zh: "由 FAB 展开的快捷操作菜单，子项错峰弹出。",
      en: "Speed-dial menu expanded from a FAB, with staggered items.",
    },
    importStatement: 'import { FABMenu } from "m3eui";',
    scenarios: [
      {
        id: "fab-menu",
        title: {
          zh: "快捷创建",
          en: "Speed dial",
        },
        description: {
          zh: "点击主触发器按钮后，加号旋转 45° 变为关闭图标，子操作项按 35ms 错峰物理弹簧向上扇出，支持方向键循环聚焦与 Esc 关闭。",
          en: "Activating FABMenu rotates the trigger glyph 45° into a close icon while staggering child action pills upward with roving keyboard navigation.",
        },
        code: `<FABMenu
  size="md"
  triggerLabel="Create resource"
  items={[
    { id: "doc", label: "New Document", icon: <EditIcon /> },
    { id: "folder", label: "New Folder", icon: <FolderIcon /> },
    { id: "share", label: "Share Invite", icon: <ShareIcon /> },
  ]}
/>`,
        render: () => <FabMenuDemo />,
      },
    ],
    apis: [
      {
        title: "FABMenu Props",
        rows: [
          {
            name: "items",
            type: "readonly FABMenuItemSpec[]",
            required: true,
            description: {
              zh: "展开动作项列表（包含 id、label、icon、onSelect）。",
              en: "Array of speed-dial menu items ({ id, label, icon, onSelect }).",
            },
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            defaultValue: '"md"',
            description: {
              zh: "主触发器在收起态的尺寸等级。",
              en: "Trigger button size when closed.",
            },
          },
          {
            name: "open / defaultOpen / onOpenChange",
            type: "boolean · (open: boolean) => void",
            defaultValue: "false",
            description: {
              zh: "受控或非受控菜单展开状态。",
              en: "Controlled or uncontrolled menu open state.",
            },
          },
          {
            name: "icon / triggerLabel",
            type: "React.ReactNode · string",
            description: {
              zh: "自定义主触发器图标与无障碍标签。",
              en: "Custom trigger glyph and accessible trigger label.",
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* 6. FloatingToolbar                                                     */
  /* ---------------------------------------------------------------------- */
  {
    slug: "floating-toolbar",
    title: "FloatingToolbar",
    subtitle: {
      zh: "胶囊悬浮工具栏，支持双主题、伴随 FAB 与滚动折叠。",
      en: "Pill-shaped floating toolbar with vibrant themes, companion FAB, and scroll collapse.",
    },
    importStatement: 'import { FloatingToolbar } from "m3eui";',
    primitive: "@base-ui/react/toolbar",
    scenarios: [
      {
        id: "floating-toolbar-themes",
        title: {
          zh: "Standard 与 Vibrant 双主题及伴随 FAB",
          en: "Standard vs Vibrant Themes with Companion FAB",
        },
        description: {
          zh: "theme=\"standard\" 采用柔和表面容器色，theme=\"vibrant\" 采用高对比主色容器；均可通过 companionFab 在末尾衔接一枚主操作 FAB。",
          en: "Compare subtle surface-container styling (standard) against high-contrast primary-container emphasis (vibrant), each paired with a trailing companionFab.",
        },
        code: `<FloatingToolbar
  theme="standard"
  items={[
    { id: "edit", label: "Edit", icon: <EditIcon />, selected: true },
    { id: "copy", label: "Copy", icon: <CopyIcon /> },
    { id: "share", label: "Share", icon: <ShareIcon />, separatorBefore: true },
  ]}
  companionFab={<FAB size="sm" icon={<PlusIcon />} aria-label="Create" />}
/>
<FloatingToolbar
  theme="vibrant"
  items={[
    { id: "edit", label: "Edit", icon: <EditIcon />, selected: true },
    { id: "copy", label: "Copy", icon: <CopyIcon /> },
    { id: "delete", label: "Delete", icon: <TrashIcon />, disabled: true, separatorBefore: true },
  ]}
  companionFab={<FAB size="sm" variant="tertiary" icon={<SendIcon />} aria-label="Send" />}
/>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <FloatingToolbar
              theme="standard"
              aria-label="Standard toolbar"
              items={[
                { id: "edit", label: "Edit", icon: <EditIcon size={18} />, selected: true },
                { id: "copy", label: "Copy", icon: <CopyIcon size={18} /> },
                {
                  id: "share",
                  label: "Share",
                  icon: <ShareIcon size={18} />,
                  separatorBefore: true,
                },
              ]}
              companionFab={
                <FAB size="sm" icon={<PlusIcon size={20} />} aria-label="Create item" />
              }
            />
            <FloatingToolbar
              theme="vibrant"
              aria-label="Vibrant toolbar"
              items={[
                { id: "edit", label: "Edit", icon: <EditIcon size={18} />, selected: true },
                { id: "copy", label: "Copy", icon: <CopyIcon size={18} /> },
                {
                  id: "delete",
                  label: "Delete (Disabled)",
                  icon: <TrashIcon size={18} />,
                  disabled: true,
                  separatorBefore: true,
                },
              ]}
              companionFab={
                <FAB
                  size="sm"
                  variant="tertiary"
                  icon={<SendIcon size={18} />}
                  aria-label="Send now"
                />
              }
            />
          </div>
        ),
      },
      {
        id: "floating-toolbar-vertical",
        title: {
          zh: "垂直侧边停靠工具栏",
          en: "Vertical Docked Action Bar",
        },
        description: {
          zh: "设置 orientation=\"vertical\" 可构建画布侧栏或白板工具条，方向键自动切换为上下导航。",
          en: "Use orientation=\"vertical\" for side-docked canvas or whiteboard toolbars with automatic up/down roving focus.",
        },
        code: `<FloatingToolbar
  orientation="vertical"
  theme="vibrant"
  items={[
    { id: "search", label: "Find", icon: <SearchIcon />, selected: active === "search" },
    { id: "edit", label: "Annotate", icon: <EditIcon />, selected: active === "edit" },
    { id: "code", label: "Inspect", icon: <CodeBracketsIcon />, separatorBefore: true },
    { id: "share", label: "Share", icon: <ShareIcon />, disabled: true },
  ]}
  companionFab={<FAB size="sm" icon={<PlusIcon />} aria-label="Add node" />}
/>`,
        render: () => <FloatingToolbarVerticalDemo />,
      },
      {
        id: "floating-toolbar-collapsible",
        title: {
          zh: "可折叠收起态",
          en: "Interactive collapsed state",
        },
        description: {
          zh: "开启 collapsed（或配合 scrollCollapse 监听滚动）时，工具栏胶囊平滑收起并设为 inert，同时伴随 FAB 弹性放大 8% 保持核心入口突出。",
          en: "Collapsing the toolbar retracts the action pill with inert semantics while spring-scaling the companion FAB up by 8% to keep the primary action prominent.",
        },
        code: `const [collapsed, setCollapsed] = React.useState(false);

<FloatingToolbar
  theme="standard"
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  items={[
    { id: "like", label: "Like", icon: <HeartIcon />, selected: true },
    { id: "copy", label: "Copy link", icon: <CopyIcon /> },
    { id: "download", label: "Download", icon: <DownloadIcon />, separatorBefore: true },
  ]}
  companionFab={<FAB size="sm" variant="tertiary" icon={<SparkleIcon />} aria-label="Ask AI" />}
/>`,
        render: () => <FloatingToolbarCollapsibleDemo />,
      },
    ],
    apis: [
      {
        title: "FloatingToolbar Props",
        rows: [
          {
            name: "items",
            type: "readonly FloatingToolbarItemSpec[]",
            required: true,
            description: {
              zh: "工具栏动作项数组（id、label、icon、selected、disabled、separatorBefore、onClick）。",
              en: "Toolbar action items ({ id, label, icon, selected, disabled, separatorBefore, onClick }).",
            },
          },
          {
            name: "theme",
            type: '"standard" | "vibrant"',
            defaultValue: '"vibrant"',
            description: {
              zh: "胶囊容器主题配色。",
              en: "Color theme for the floating pill container.",
            },
          },
          {
            name: "orientation",
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: {
              zh: "工具栏排列轴向与键盘导航方向。",
              en: "Layout axis and keyboard arrow-key orientation.",
            },
          },
          {
            name: "companionFab",
            type: "React.ReactNode",
            description: {
              zh: "紧邻工具栏末尾渲染的伴随 FAB 节点。",
              en: "Optional FAB rendered alongside the toolbar.",
            },
          },
          {
            name: "collapsed / defaultCollapsed / onCollapsedChange",
            type: "boolean · (collapsed: boolean) => void",
            defaultValue: "false",
            description: {
              zh: "受控或非受控收起状态。",
              en: "Controlled or uncontrolled collapsed state.",
            },
          },
          {
            name: "scrollCollapse / scrollTarget",
            type: "boolean · React.RefObject<HTMLElement | null>",
            defaultValue: "false",
            description: {
              zh: "向下滚动时自动折叠工具栏、向上回滚时自动展开。",
              en: "Automatically collapses on downward scroll and expands when scrolling back up.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            description: {
              zh: "工具栏区域无障碍名称。",
              en: "Accessible label for the toolbar landmark.",
            },
          },
        ],
      },
    ],
  },
];

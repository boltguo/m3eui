import * as React from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import type { M3EShapeName } from "m3eui/tokens";
import {
  Avatar,
  BottomSheet,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Chip,
  CircularWavyProgressIndicator,
  Dialog,
  DialogClose,
  DropdownMenu,
  FABMenu,
  FilterChip,
  FloatingToolbar,
  IconButton,
  IconToggleButton,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
  ListItem,
  LoadingIndicator,
  MaterialShapeView,
  NavigationBar,
  Radio,
  RadioGroup,
  SearchBar,
  SegmentedList,
  Select,
  Skeleton,
  Slider,
  Snippet,
  SplitButton,
  Switch,
  TextField,
  Tooltip,
  useM3E,
  useM3EI18n,
  useM3EToast,
} from "m3eui";
import { type LocalizedCopy, useCopyResolver, usePlaygroundStrings } from "../i18n";
import {
  BellIcon,
  DownloadIcon,
  EditIcon,
  FolderIcon,
  GITHUB_REPO_URL,
  GitHubIcon,
  HeartIcon,
  HomeGlyph,
  PlusIcon,
  SendIcon,
  SettingsGearIcon,
  ShareIcon,
  TrashIcon,
  UsersIcon,
} from "../layout/Icons";
import type { SiteOutletContext } from "../layout/SiteLayout";
import {
  BLOCK_CATALOG,
  COMPONENT_CATALOG,
  COMPONENT_CATALOG_BY_CATEGORY,
  COMPONENT_CATEGORY_ORDER,
} from "../registry/catalog";

const HERO_SHAPES: readonly M3EShapeName[] = [
  "cookie9Sided",
  "flower",
  "clover4Leaf",
  "sunny",
  "softBurst",
  "pill",
  "gem",
  "puffy",
];

const HERO_SLOTS = [
  { id: "a", offset: 0, size: 200, fill: "var(--m3e-color-primary)" },
  { id: "b", offset: 2, size: 168, fill: "var(--m3e-color-tertiary-container)" },
  { id: "c", offset: 4, size: 136, fill: "var(--m3e-color-secondary-container)" },
  { id: "d", offset: 6, size: 88, fill: "var(--m3e-color-tertiary)" },
] as const;

function GlyphSvg({ d, filled }: { readonly d: string; readonly filled?: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const PlayGlyph = () => <GlyphSvg filled d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />;
const PauseGlyph = () => <GlyphSvg filled d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />;
const PrevGlyph = () => <GlyphSvg filled d="M6 5h2v14H6zM20 6.2v11.6a.8.8 0 0 1-1.25.66L10 12.66a.8.8 0 0 1 0-1.32l8.75-5.8A.8.8 0 0 1 20 6.2Z" />;
const NextGlyph = () => <GlyphSvg filled d="M16 5h2v14h-2zM4 6.2v11.6a.8.8 0 0 0 1.25.66L14 12.66a.8.8 0 0 0 0-1.32l-8.75-5.8A.8.8 0 0 0 4 6.2Z" />;
const MoreGlyph = () => <GlyphSvg filled d="M12 7a1.75 1.75 0 1 0 0-3.5A1.75 1.75 0 0 0 12 7Zm0 6.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm0 6.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />;

function Scene({
  title,
  to,
  className,
  children,
}: {
  readonly title: string;
  readonly to: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className={className ? `home-scene ${className}` : "home-scene"}>
      <Link to={to} className="home-scene__title">
        {title}
      </Link>
      {children}
    </section>
  );
}

const Hero = React.memo(function Hero({
  openCommandPalette,
}: {
  readonly openCommandPalette: () => void;
}) {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setStep((s) => s + 1), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="home-hero">
      <div className="home-hero__copy">
        <h1 className="home-hero__title">{ui.heroTitle}</h1>
        <p className="home-hero__desc">{ui.heroDesc}</p>
        <div className="home-hero__actions">
          <Button size="md" variant="filled" onClick={() => navigate("/docs")}>
            {resolve({ zh: "开始使用", en: "Get started" })}
          </Button>
          <Button
            size="md"
            variant="tonal"
            onClick={() => navigate("/components/button")}
          >
            {ui.browseComponentsBtn}
          </Button>
          <Tooltip content="GitHub">
            <IconButton
              size="md"
              variant="outlined"
              icon={<GitHubIcon size={22} />}
              aria-label="GitHub"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            />
          </Tooltip>
        </div>
        <div className="home-hero__install">
          <Snippet code="npx m3eui init" />
          <Button variant="text" size="sm" onClick={openCommandPalette}>
            {resolve({ zh: "搜索组件", en: "Search components" })}
          </Button>
        </div>
      </div>

      <div className="home-hero__art" aria-hidden="true">
        {HERO_SLOTS.map((slot) => (
          <span key={slot.id} className={`home-hero__shape home-hero__shape--${slot.id}`}>
            <MaterialShapeView
              shape={HERO_SHAPES[(step + slot.offset) % HERO_SHAPES.length]!}
              size={slot.size}
              fill={slot.fill}
            />
          </span>
        ))}
      </div>
    </header>
  );
});

interface Mail {
  readonly id: string;
  readonly from: string;
  readonly subject: LocalizedCopy;
  readonly time: LocalizedCopy;
  readonly shape: M3EShapeName;
  readonly unread?: boolean;
}

const MAILS: readonly Mail[] = [
  { id: "m1", from: "Ada", subject: { zh: "周五的设计评审改到下午三点", en: "Design review moved to 3 pm Friday" }, time: "9:41", shape: "cookie9Sided", unread: true },
  { id: "m2", from: "Kenji", subject: { zh: "新图标已经上传到共享盘", en: "New icons are in the shared drive" }, time: "8:15", shape: "clover4Leaf", unread: true },
  { id: "m3", from: "Lena", subject: { zh: "周末一起去爬山吗？", en: "Hiking this weekend?" }, time: "7:02", shape: "sunny" },
  { id: "m4", from: "Omar", subject: { zh: "发票已付，谢谢", en: "Invoice paid, thank you" }, time: "6:30", shape: "pentagon" },
  { id: "m5", from: "Priya", subject: { zh: "原型链接更新了", en: "Prototype link updated" }, time: { zh: "周一", en: "Mon" }, shape: "flower" },
  { id: "m6", from: "Tomás", subject: { zh: "午饭吃什么？", en: "Lunch today?" }, time: { zh: "周日", en: "Sun" }, shape: "gem" },
];

type PhoneTab = "inbox" | "people" | "files" | "settings";

const PhoneScene = React.memo(function PhoneScene() {
  const resolve = useCopyResolver();
  const [tab, setTab] = React.useState<PhoneTab>("inbox");
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [selected, setSelected] = React.useState("m1");
  const mails = unreadOnly ? MAILS.filter((m) => m.unread) : MAILS;

  return (
    <Scene
      title={resolve({ zh: "导航", en: "Navigation" })}
      to="/components/navigation"
      className="home-scene--phone"
    >
      <div className="home-phone">
        <div className="home-phone__body">
          <SearchBar
            size="sm"
            placeholder={resolve({ zh: "搜索邮件", en: "Search mail" })}
            aria-label={resolve({ zh: "搜索邮件", en: "Search mail" })}
          />
          <div className="home-row">
            <FilterChip selected={!unreadOnly} onSelectedChange={() => setUnreadOnly(false)}>
              {resolve({ zh: "全部", en: "All" })}
            </FilterChip>
            <FilterChip selected={unreadOnly} onSelectedChange={() => setUnreadOnly(true)}>
              {resolve({ zh: "未读", en: "Unread" })}
            </FilterChip>
          </div>
          <SegmentedList aria-label={resolve({ zh: "收件箱", en: "Inbox" })}>
            {mails.map((mail) => (
              <ListItem
                key={mail.id}
                interactive
                selected={selected === mail.id}
                onClick={() => setSelected(mail.id)}
                leading={<Avatar size="md" shape={mail.shape} fallback={mail.from[0]} />}
                headline={mail.from}
                supportingText={resolve(mail.subject)}
                trailing={<span className="home-phone__time">{resolve(mail.time)}</span>}
              />
            ))}
          </SegmentedList>
          <FABMenu
            className="home-phone__fab"
            size="sm"
            triggerLabel={resolve({ zh: "新建", en: "Create" })}
            items={[
              { id: "mail", label: resolve({ zh: "写邮件", en: "Compose" }), icon: <EditIcon size={20} /> },
              { id: "folder", label: resolve({ zh: "新建文件夹", en: "New folder" }), icon: <FolderIcon size={20} /> },
              { id: "invite", label: resolve({ zh: "邀请", en: "Invite" }), icon: <UsersIcon size={20} /> },
            ]}
          />
        </div>
        <NavigationBar<PhoneTab>
          value={tab}
          onValueChange={setTab}
          items={[
            { value: "inbox", label: resolve({ zh: "收件箱", en: "Inbox" }), icon: <HomeGlyph size={22} />, badgeCount: 2 },
            { value: "people", label: resolve({ zh: "联系人", en: "People" }), icon: <UsersIcon size={22} /> },
            { value: "files", label: resolve({ zh: "文件", en: "Files" }), icon: <FolderIcon size={22} />, badgeDot: true },
            { value: "settings", label: resolve({ zh: "设置", en: "Settings" }), icon: <SettingsGearIcon size={22} /> },
          ]}
        />
      </div>
    </Scene>
  );
});

const TRACKS: readonly { readonly title: string; readonly artist: string; readonly shape: M3EShapeName }[] = [
  { title: "Soft Burst", artist: "The Polygons", shape: "softBurst" },
  { title: "Nine Sided", artist: "Cookie Cutter", shape: "cookie9Sided" },
  { title: "Four Leaf", artist: "Clover Club", shape: "clover4Leaf" },
];

const PlayerScene = React.memo(function PlayerScene() {
  const resolve = useCopyResolver();
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(36);
  const [trackIdx, setTrackIdx] = React.useState(0);
  const track = TRACKS[trackIdx]!;

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 600);
    return () => window.clearInterval(id);
  }, [playing]);

  const skip = (delta: number) => {
    setTrackIdx((i) => (i + delta + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  return (
    <Scene
      title={resolve({ zh: "进度", en: "Progress" })}
      to="/components/progress-indicator"
      className="home-scene--player"
    >
      <div className="home-player__art">
        <MaterialShapeView
          shape={track.shape}
          size={132}
          fill="var(--m3e-color-tertiary)"
        />
      </div>
      <div className="home-player__meta">
        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
        <IconToggleButton
          icon={<HeartIcon size={20} />}
          aria-label={resolve({ zh: "收藏", en: "Favorite" })}
          variant="standard"
        />
      </div>
      <LinearWavyProgressIndicator
        value={progress}
        paused={!playing}
        aria-label={resolve({ zh: "播放进度", en: "Playback progress" })}
      />
      <div className="home-player__controls">
        <IconButton
          variant="tonal"
          icon={<PrevGlyph />}
          aria-label={resolve({ zh: "上一首", en: "Previous" })}
          onClick={() => skip(-1)}
        />
        <IconToggleButton
          size="lg"
          widthVariant="wide"
          variant="filled"
          pressed={playing}
          onPressedChange={setPlaying}
          icon={<PlayGlyph />}
          checkedIcon={<PauseGlyph />}
          aria-label={resolve({ zh: "播放", en: "Play" })}
        />
        <IconButton
          variant="tonal"
          icon={<NextGlyph />}
          aria-label={resolve({ zh: "下一首", en: "Next" })}
          onClick={() => skip(1)}
        />
      </div>
    </Scene>
  );
});

const ThemeScene = React.memo(function ThemeScene({
  openStudio,
}: {
  readonly openStudio: () => void;
}) {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    resolvedColorMode,
    setColorMode,
  } = useM3E();

  const seeds = [
    { hex: "#6750A4", name: ui.seedPurple },
    { hex: "#0B6B58", name: ui.seedJade },
    { hex: "#1A73E8", name: ui.seedOcean },
    { hex: "#B3261E", name: ui.seedVermilion },
    { hex: "#7D5260", name: ui.seedRose },
  ];

  return (
    <Scene
      title={resolve({ zh: "动态色彩", en: "Dynamic color" })}
      to="/docs"
      className="home-scene--theme"
    >
      <div className="home-row">
        {seeds.map((seed) => (
          <Tooltip key={seed.hex} content={seed.name}>
            <IconToggleButton
              variant="outlined"
              pressed={seedHex.toLowerCase() === seed.hex.toLowerCase()}
              onPressedChange={() =>
                React.startTransition(() => setSeedHex(seed.hex))
              }
              icon={
                <span
                  className="home-theme__dot"
                  style={{ backgroundColor: seed.hex }}
                />
              }
              aria-label={seed.name}
            />
          </Tooltip>
        ))}
      </div>
      <ButtonGroup
        variant="connected"
        size="sm"
        selectionMode="single"
        aria-label={resolve({ zh: "配色方案", en: "Scheme variant" })}
        value={[schemeVariant]}
        onValueChange={(next) => {
          const picked = next[0];
          if (picked) {
            React.startTransition(() =>
              setSchemeVariant(picked as typeof schemeVariant),
            );
          }
        }}
        items={[
          { value: "expressive", label: "Expressive" },
          { value: "tonalSpot", label: "Tonal" },
          { value: "vibrant", label: "Vibrant" },
          { value: "neutral", label: "Neutral" },
        ]}
      />
      <div className="home-theme__roles" aria-hidden="true">
        {["primary", "secondary", "tertiary"].map((role) => (
          <React.Fragment key={role}>
            <span style={{ backgroundColor: `var(--m3e-color-${role})` }} />
            <span style={{ backgroundColor: `var(--m3e-color-${role}-container)` }} />
          </React.Fragment>
        ))}
      </div>
      <div className="home-theme__foot">
        <Switch
          label={resolve({ zh: "深色", en: "Dark" })}
          checked={resolvedColorMode === "dark"}
          onCheckedChange={(dark) => setColorMode(dark ? "dark" : "light")}
        />
        <Button variant="text" size="sm" onClick={openStudio}>
          {ui.openStudioBtn}
        </Button>
      </div>
    </Scene>
  );
});

const ActionsScene = React.memo(function ActionsScene() {
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const [view, setView] = React.useState<string[]>(["week"]);

  return (
    <Scene title={resolve({ zh: "按钮", en: "Buttons" })} to="/components/button">
      <div className="home-row">
        <Button variant="filled">{resolve({ zh: "保存", en: "Save" })}</Button>
        <Button variant="tonal">{resolve({ zh: "分享", en: "Share" })}</Button>
        <Button variant="outlined">{resolve({ zh: "取消", en: "Cancel" })}</Button>
      </div>
      <ButtonGroup
        variant="connected"
        selectionMode="single"
        aria-label={resolve({ zh: "视图", en: "View" })}
        value={view}
        onValueChange={(next) => {
          if (next.length) setView(next);
        }}
        items={[
          { value: "day", label: resolve({ zh: "日", en: "Day" }) },
          { value: "week", label: resolve({ zh: "周", en: "Week" }) },
          { value: "month", label: resolve({ zh: "月", en: "Month" }) },
        ]}
      />
      <div className="home-row">
        <SplitButton
          variant="filled"
          leadingIcon={<SendIcon size={18} />}
          menuTriggerLabel={resolve({ zh: "更多发送方式", en: "More send options" })}
          onClick={() => toast({ title: resolve({ zh: "已发送", en: "Sent" }) })}
          menuItems={[
            { id: "later", label: resolve({ zh: "定时发送", en: "Schedule send" }) },
            { id: "draft", label: resolve({ zh: "存为草稿", en: "Save draft" }) },
          ]}
        >
          {resolve({ zh: "发送", en: "Send" })}
        </SplitButton>
        <IconToggleButton
          variant="tonal"
          icon={<BellIcon size={20} />}
          aria-label={resolve({ zh: "通知", en: "Notifications" })}
          defaultPressed
        />
        <IconButton
          variant="outlined"
          icon={<ShareIcon size={20} />}
          aria-label={resolve({ zh: "分享", en: "Share" })}
        />
      </div>
      <div className="home-row">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <IconButton
            key={size}
            size={size}
            variant="filled"
            icon={<PlusIcon size={size === "lg" ? 26 : 20} />}
            aria-label={`${resolve({ zh: "添加", en: "Add" })} ${size.toUpperCase()}`}
          />
        ))}
      </div>
      <FloatingToolbar
        aria-label={resolve({ zh: "编辑工具", en: "Editing tools" })}
        items={[
          { id: "edit", label: resolve({ zh: "编辑", en: "Edit" }), icon: <EditIcon size={22} />, selected: true },
          { id: "share", label: resolve({ zh: "分享", en: "Share" }), icon: <ShareIcon size={22} /> },
          { id: "download", label: resolve({ zh: "下载", en: "Download" }), icon: <DownloadIcon size={22} /> },
          { id: "delete", label: resolve({ zh: "删除", en: "Delete" }), icon: <TrashIcon size={22} /> },
        ]}
        fab={{ icon: <PlusIcon size={22} />, "aria-label": resolve({ zh: "添加", en: "Add" }) }}
      />
    </Scene>
  );
});

const ControlsScene = React.memo(function ControlsScene() {
  const resolve = useCopyResolver();
  const [volume, setVolume] = React.useState(64);

  return (
    <Scene title={resolve({ zh: "输入与选择", en: "Inputs" })} to="/components/text-field">
      <TextField
        label={resolve({ zh: "昵称", en: "Display name" })}
        defaultValue="Ada"
      />
      <Select
        label={resolve({ zh: "语言", en: "Language" })}
        defaultValue="en"
        options={[
          { value: "en", label: "English" },
          { value: "zh", label: "简体中文" },
          { value: "ja", label: "日本語" },
        ]}
      />
      <Slider
        label={resolve({ zh: "音量", en: "Volume" })}
        value={volume}
        onValueChange={setVolume}
        showValue
      />
      <div className="home-controls__toggles">
        <Switch label={resolve({ zh: "通知", en: "Notifications" })} defaultChecked showIcons />
        <Checkbox label={resolve({ zh: "每周摘要", en: "Weekly digest" })} defaultChecked />
      </div>
      <RadioGroup
        orientation="horizontal"
        defaultValue="comfortable"
        aria-label={resolve({ zh: "密度", en: "Density" })}
      >
        <Radio value="comfortable" label={resolve({ zh: "舒适", en: "Comfortable" })} />
        <Radio value="compact" label={resolve({ zh: "紧凑", en: "Compact" })} />
      </RadioGroup>
    </Scene>
  );
});

const OverlaysScene = React.memo(function OverlaysScene() {
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const [pinned, setPinned] = React.useState(true);

  return (
    <Scene title={resolve({ zh: "菜单与浮层", en: "Menus & overlays" })} to="/components/menu">
      <div className="home-row">
        <DropdownMenu
          trigger={
            <Button variant="tonal" trailingIcon={<MoreGlyph />}>
              {resolve({ zh: "菜单", en: "Menu" })}
            </Button>
          }
          items={[
            { id: "edit", label: resolve({ zh: "编辑", en: "Edit" }), icon: <EditIcon size={20} />, shortcut: "⌘E" },
            { id: "share", label: resolve({ zh: "分享", en: "Share" }), icon: <ShareIcon size={20} /> },
            { id: "download", label: resolve({ zh: "下载", en: "Download" }), icon: <DownloadIcon size={20} /> },
            {
              id: "pin",
              separatorBefore: true,
              label: resolve({ zh: "置顶", en: "Pinned" }),
              checked: pinned,
              onCheckedChange: setPinned,
            },
            {
              id: "delete",
              separatorBefore: true,
              danger: true,
              label: resolve({ zh: "删除", en: "Delete" }),
              icon: <TrashIcon size={20} />,
            },
          ]}
        />
        <Dialog
          trigger={<Button variant="outlined">{resolve({ zh: "对话框", en: "Dialog" })}</Button>}
          icon={<TrashIcon size={24} />}
          title={resolve({ zh: "删除这封邮件？", en: "Delete this message?" })}
          description={resolve({
            zh: "删除后可在 30 天内从回收站恢复。",
            en: "You can restore it from Trash within 30 days.",
          })}
          actions={
            <>
              <DialogClose
                render={
                  <Button variant="text">
                    {resolve({ zh: "取消", en: "Cancel" })}
                  </Button>
                }
              />
              <DialogClose
                render={
                  <Button variant="filled">
                    {resolve({ zh: "删除", en: "Delete" })}
                  </Button>
                }
              />
            </>
          }
        />
        <BottomSheet
          trigger={<Button variant="outlined">{resolve({ zh: "底部面板", en: "Sheet" })}</Button>}
          title={resolve({ zh: "分享到", en: "Share to" })}
        >
          <SegmentedList>
            <ListItem interactive leading={<UsersIcon size={22} />} headline={resolve({ zh: "团队", en: "Team" })} />
            <ListItem interactive leading={<SendIcon size={22} />} headline={resolve({ zh: "邮件", en: "Email" })} />
            <ListItem interactive leading={<FolderIcon size={22} />} headline={resolve({ zh: "保存到文件", en: "Save to files" })} />
          </SegmentedList>
        </BottomSheet>
        <Button
          variant="outlined"
          onClick={() =>
            toast({
              type: "success",
              title: resolve({ zh: "已归档", en: "Archived" }),
            })
          }
        >
          {resolve({ zh: "消息条", en: "Snackbar" })}
        </Button>
      </div>
    </Scene>
  );
});

const LoadingScene = React.memo(function LoadingScene() {
  const resolve = useCopyResolver();
  return (
    <Scene title={resolve({ zh: "加载", en: "Loading" })} to="/components/loading-indicator">
      <div className="home-loading">
        <LoadingIndicator size={56} />
        <LoadingIndicator contained size={56} />
        <CircularWavyProgressIndicator
          value={72}
          size={56}
          aria-label={resolve({ zh: "同步进度", en: "Sync progress" })}
        />
        <div className="home-loading__lines">
          <LinearProgressIndicator
            value={72}
            aria-label={resolve({ zh: "上传进度", en: "Upload progress" })}
          />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="56%" />
        </div>
      </div>
    </Scene>
  );
});

const Directory = React.memo(function Directory() {
  const ui = usePlaygroundStrings();
  return (
    <section className="home-directory">
      <h2 className="home-heading">
        {ui.navComponents}
        <span>{COMPONENT_CATALOG.length}</span>
      </h2>
      <div className="home-directory__grid">
        {COMPONENT_CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="home-directory__group">
            <h3>{ui.componentCategories[cat]}</h3>
            <ul>
              {COMPONENT_CATALOG_BY_CATEGORY[cat].map((doc) => (
                <li key={doc.slug}>
                  <Link to={`/components/${doc.slug}`}>{doc.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
});

const Blocks = React.memo(function Blocks() {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const navigate = useNavigate();
  const { direction } = useM3EI18n();

  return (
    <section className="home-directory">
      <h2 className="home-heading">
        Blocks
        <span>{BLOCK_CATALOG.length}</span>
        <Button variant="text" size="sm" onClick={() => navigate("/blocks")}>
          {ui.browseBlocksBtn} {direction === "rtl" ? "←" : "→"}
        </Button>
      </h2>
      <div className="home-blocks">
        {BLOCK_CATALOG.map((blk) => (
          <Card
            key={blk.slug}
            variant="filled"
            interactive
            onClick={() => navigate(`/blocks#${blk.slug}`)}
          >
            <Chip tone="primary" size="sm">
              {ui.blockCategories[blk.category]}
            </Chip>
            <strong className="home-blocks__title">{resolve(blk.title)}</strong>
          </Card>
        ))}
      </div>
    </section>
  );
});

export function HomePage() {
  const { openStudio, openCommandPalette } =
    useOutletContext<SiteOutletContext>();

  return (
    <div className="home">
      <Hero openCommandPalette={openCommandPalette} />
      <div className="home-stage">
        <PhoneScene />
        <PlayerScene />
        <ThemeScene openStudio={openStudio} />
        <ActionsScene />
        <ControlsScene />
        <OverlaysScene />
        <LoadingScene />
      </div>
      <Directory />
      <Blocks />
    </div>
  );
}

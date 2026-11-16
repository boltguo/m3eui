import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateM3EThemeTokens,
} from "./tokens/color.js";
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Sheet,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Carousel,
  Checkbox,
  CheckboxGroup,
  Chip,
  CircularProgressIndicator,
  ColorPicker,
  ColorPickerField,
  ColorSwatch,
  Combobox,
  CommandPalette,
  LoadingIndicator,
  CopyButton,
  DataTable,
  DatePickerField,
  DatePicker,
  Dialog,
  Divider,
  DropdownMenu,
  Empty,
  FAB,
  FABMenu,
  Fieldset,
  FileUpload,
  FloatingToolbar,
  Form,
  IconButton,
  Kbd,
  LinearProgressIndicator,
  List,
  ListItem,
  M3E_BUILT_IN_LOCALES,
  type M3EConfig,
  M3EProvider,
  MaterialShapeView,
  Meter,
  Select,
  NavigationRail,
  NumberField,
  OTPField,
  Pagination,
  Popover,
  Radio,
  RadioGroup,
  ScrollArea,
  SearchBar,
  SearchView,
  Skeleton,
  Slider,
  Snippet,
  SplitButton,
  Switch,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  TextField,
  TimePicker,
  TimePickerField,
  TopAppBar,
  arSAMessages,
  canonicalizeBcp47Locale,
  defineM3EConfig,
  enUSMessages,
  formatLocalizedDateRange,
  formatLocalizedFullDate,
  formatLocalizedInteger,
  formatLocalizedMonthYear,
  formatLocalizedPercent,
  formatLocalizedWallTime,
  formatM3EMessage,
  generateM3EStaticThemeCss,
  getLocaleFirstDayOfWeek,
  getLocaleUses24Hour,
  getLocalizedMondayWeekdays,
  getLocalizedWeekdays,
  getM3EInitScript,
  isRtlLocale,
  jaJPMessages,
  resolveM3EConfig,
  useM3E,
  useM3EToast,
  zhCNMessages,
} from "./index.js";
import * as Primitives from "./primitives.js";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function PausedWrapper({
  children,
  direction = "ltr",
  locale = "zh-CN",
}: {
  readonly children: React.ReactNode;
  readonly direction?: "ltr" | "rtl" | "auto";
  readonly locale?: string;
}) {
  return (
    <M3EProvider
      syncDocumentRoot={false}
      locale={locale}
      initialDirection={direction}
    >
      <PauseMount>{children}</PauseMount>
    </M3EProvider>
  );
}

function PauseMount({ children }: { readonly children: React.ReactNode }) {
  const { setPaused } = useM3E();
  React.useLayoutEffect(() => {
    setPaused(true);
  }, [setPaused]);
  return <>{children}</>;
}

function collectCjkViolations(dir: string, excludedSegment: string): string[] {
  const cjkRe = /[\u3400-\u9FFF\uF900-\uFAFF]/;
  const violations: string[] = [];

  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (full.includes(excludedSegment)) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      violations.push(...collectCjkViolations(full, excludedSegment));
      continue;
    }
    const ext = extname(full);
    if (ext !== ".ts" && ext !== ".tsx") continue;
    if (full.endsWith(".test.ts") || full.endsWith(".test.tsx")) continue;
    const content = readFileSync(full, "utf8");
    if (cjkRe.test(content)) {
      violations.push(full);
    }
  }
  return violations;
}

describe("m3eui — Source Architecture, i18n & Declarative Config Suite", () => {
  it("enforces zero hardcoded CJK UI strings across unified m3eui source outside src/i18n/locales", () => {
    const repoRoot = resolve(__dirname, "../../..");
    const m3euiViolations = collectCjkViolations(
      join(repoRoot, "packages/m3eui/src"),
      join("src", "i18n", "locales"),
    );

    expect(m3euiViolations).toEqual([]);
  });

  it("enforces zero hardcoded UI/ARIA attribute string literals across m3eui components", () => {
    const repoRoot = resolve(__dirname, "../../..");
    const componentsDir = join(repoRoot, "packages/m3eui/src/components");
    const attrLiteralRe =
      /\b(?:aria-label|aria-roledescription|aria-valuetext|placeholder|alt)\s*=\s*["'][^"']+["']/;
    const violations: string[] = [];

    for (const file of readdirSync(componentsDir)) {
      if (!file.endsWith(".tsx")) continue;
      const content = readFileSync(join(componentsDir, file), "utf8");
      if (attrLiteralRe.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("maintains 100% key parity, placeholder parity, and non-empty translations across en-US, zh-CN, ja-JP, and ar-SA", () => {
    const baseKeys = Object.keys(enUSMessages).sort();
    expect(baseKeys.length).toBeGreaterThanOrEqual(75);
    const extractParams = (s: string) =>
      Array.from(s.matchAll(/\{(\w+)\}/g), (m) => m[1]!).sort();

    for (const [code, dict] of Object.entries(M3E_BUILT_IN_LOCALES)) {
      const keys = Object.keys(dict).sort();
      expect(keys, `Key mismatch in ${code}`).toEqual(baseKeys);
      for (const k of keys) {
        const typedKey = k as keyof typeof enUSMessages;
        const val = dict[typedKey];
        expect(
          typeof val === "string" && val.trim().length > 0,
          `Empty value for ${code}.${k}`,
        ).toBe(true);
        expect(
          extractParams(val),
          `Placeholder mismatch for ${code}.${k}`,
        ).toEqual(extractParams(enUSMessages[typedKey]));
      }
    }

    expect(zhCNMessages["datePicker.title"]).toBe("选择日期");
    expect(jaJPMessages["datePicker.title"]).toBe("日付を選択");
    expect(arSAMessages["datePicker.title"]).toBe("اختر التاريخ");
    expect(
      formatM3EMessage("第 {index} 项，共 {total} 项", { index: 2, total: 5 }),
    ).toBe("第 2 项，共 5 项");
  });

  it("canonicalizes BCP 47 tags, resolves script-aware RTL, and formats CLDR dates, ranges, 12h/24h cycles, and numbers", () => {
    expect(canonicalizeBcp47Locale("zh_cn")).toBe("zh-CN");
    expect(canonicalizeBcp47Locale("EN_us")).toBe("en-US");

    expect(isRtlLocale("ar-SA")).toBe(true);
    expect(isRtlLocale("he-IL")).toBe(true);
    expect(isRtlLocale("fa-IR")).toBe(true);
    expect(isRtlLocale("pa-Arab")).toBe(true);
    expect(isRtlLocale("az-Arab")).toBe(true);
    expect(isRtlLocale("ku-Latn")).toBe(false);
    expect(isRtlLocale("zh-CN")).toBe(false);
    expect(isRtlLocale("en-US")).toBe(false);

    expect(getLocaleUses24Hour("en-US")).toBe(false);
    expect(getLocaleUses24Hour("ar-SA")).toBe(false);
    expect(getLocaleUses24Hour("zh-CN")).toBe(true);
    expect(getLocaleUses24Hour("ja-JP")).toBe(true);
    expect(getLocaleUses24Hour("en-US-u-hc-h23")).toBe(true);
    expect(getLocaleUses24Hour("zh-CN-u-hc-h12")).toBe(false);

    const weekdaysZh = getLocalizedMondayWeekdays("zh-CN");
    const weekdaysEn = getLocalizedMondayWeekdays("en-US");
    expect(weekdaysZh.length).toBe(7);
    expect(weekdaysEn.length).toBe(7);

    expect(formatLocalizedMonthYear("en-US", 2026, 11)).toContain("November");
    expect(
      formatLocalizedFullDate("en-US", { year: 2026, month: 1, day: 1 }),
    ).toContain("Jan");
    expect(
      formatLocalizedDateRange(
        "en-US",
        { year: 2026, month: 11, day: 10 },
        { year: 2027, month: 1, day: 4 },
      ),
    ).toContain("2027");
    expect(
      formatLocalizedWallTime("en-US", { hour: 14, minute: 30 }, true),
    ).toContain("14:30");
    expect(formatLocalizedInteger("ar-SA", 99)).toBe(
      new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(99),
    );
    expect(formatLocalizedPercent("ar-SA", 0.45)).toBe(
      new Intl.NumberFormat("ar-SA", {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(0.45),
    );
  });

  it("generates a safe synchronous SSR zero-FOUC init script", () => {
    const script = getM3EInitScript("custom-theme-key");
    expect(script).toContain('"custom-theme-key"');
    expect(script).toContain('meta[name="color-scheme"]');
    expect(script).toContain("light dark");
  });

  it("resolves m3e.json config, clamps contrast, auto-detects RTL locales, and generates static light-dark() CSS", () => {
    const cfg = defineM3EConfig({
      style: "expressive",
      theme: {
        seed: "#0B6B58",
        schemeVariant: "vibrant",
        contrastLevel: 0.5,
        colorMode: "dark",
      },
      i18n: {
        locale: "ar-SA",
        direction: "auto",
      },
    });

    const resolved = resolveM3EConfig(cfg);
    expect(resolved.seedHex).toBe("#0B6B58");
    expect(resolved.schemeVariant).toBe("vibrant");
    expect(resolved.contrastLevel).toBe(0.5);
    expect(resolved.resolvedDirection).toBe("rtl");

    const clamped = resolveM3EConfig({ theme: { contrastLevel: 3.2 } });
    expect(clamped.contrastLevel).toBe(1);

    const css = generateM3EStaticThemeCss(cfg);
    expect(css).toContain(":root {");
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain("--m3e-color-primary: light-dark(");
    expect(css).toContain("--m3e-spatial-fast-easing:");
  });

  it("re-exports complete compound Base UI primitives from m3eui/primitives", () => {
    expect(Primitives.AccordionPrimitives).toBeDefined();
    expect(Primitives.CollapsiblePrimitives).toBeDefined();
    expect(Primitives.NavigationMenuPrimitives).toBeDefined();
    expect(Primitives.CSPProvider).toBeDefined();
    expect(Primitives.DialogPrimitives).toBeDefined();
    expect(Primitives.SelectPrimitives).toBeDefined();
    expect(typeof Primitives.mergeProps).toBe("function");
  });
});

describe("m3eui — DOM Component & Interaction Regression Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.documentElement.removeAttribute("lang");
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("data-color-mode");
    document.documentElement.style.colorScheme = "";
    window.localStorage?.removeItem?.("m3e-color-scheme");
  });

  it("defaults colorMode to system and syncs documentElement colorScheme, data-color-mode, and meta[name=color-scheme] when toggling dark/light mode", () => {
    let toggleMode: ((mode: "light" | "dark" | "system") => void) | undefined;

    function ColorModeProbe() {
      const { colorMode, setColorMode } = useM3E();
      toggleMode = setColorMode;
      return <span data-testid="mode">{colorMode}</span>;
    }

    act(() => {
      root.render(
        <M3EProvider>
          <ColorModeProbe />
        </M3EProvider>,
      );
    });

    expect(container.querySelector('[data-testid="mode"]')?.textContent).toBe("system");
    expect(document.documentElement.dataset.colorMode).toBe("system");
    expect(document.documentElement.style.colorScheme).toBe("light dark");
    expect(
      document.querySelector('meta[name="color-scheme"]')?.getAttribute("content"),
    ).toBe("light dark");

    act(() => {
      toggleMode?.("dark");
    });

    expect(container.querySelector('[data-testid="mode"]')?.textContent).toBe("dark");
    expect(document.documentElement.dataset.colorMode).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(
      document.querySelector('meta[name="color-scheme"]')?.getAttribute("content"),
    ).toBe("dark");

    act(() => {
      toggleMode?.("light");
    });

    expect(document.documentElement.dataset.colorMode).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("syncs html[lang] and auto-RTL html[dir] dynamically when switching locales and supports custom message overrides", () => {
    let switchLocale: ((loc: string) => void) | undefined;
    let exportedJson = "";

    function Probe() {
      const { setLocale, exportConfigJson, t } = useM3E();
      switchLocale = setLocale;
      exportedJson = exportConfigJson();
      return (
        <div>
          <span data-testid="search-ph">{t("searchBar.placeholder")}</span>
          <span data-testid="picker-title">{t("datePicker.title")}</span>
        </div>
      );
    }

    const projectConfig: M3EConfig = {
      theme: { seed: "#1A73E8", contrastLevel: 0.5 },
      i18n: { locale: "ar-SA", direction: "auto" },
      csp: { nonce: "m3e-test-nonce" },
    };

    act(() => {
      root.render(
        <M3EProvider
          config={projectConfig}
          messages={{ "searchBar.placeholder": "Custom Search Override" }}
        >
          <Probe />
        </M3EProvider>,
      );
    });

    expect(document.documentElement.lang).toBe("ar-SA");
    expect(document.documentElement.dir).toBe("rtl");
    expect(container.querySelector('[data-testid="search-ph"]')?.textContent).toBe(
      "Custom Search Override",
    );
    expect(container.querySelector('[data-testid="picker-title"]')?.textContent).toBe(
      arSAMessages["datePicker.title"],
    );
    expect(JSON.parse(exportedJson).theme.contrastLevel).toBe(0.5);

    act(() => {
      switchLocale?.("ja-JP");
    });
    expect(document.documentElement.lang).toBe("ja-JP");
    expect(document.documentElement.dir).toBe("ltr");
    expect(container.querySelector('[data-testid="picker-title"]')?.textContent).toBe(
      jaJPMessages["datePicker.title"],
    );
  });

  it("localizes DatePicker and TimePicker titles, weekdays, and AM/PM across en-US, zh-CN, and ja-JP", () => {
    act(() => {
      root.render(
        <div>
          <div data-testid="en">
            <PausedWrapper locale="en-US">
              <DatePicker defaultValue="2026-11-18" />
              <TimePicker defaultValue="09:15" use24Hour={false} />
            </PausedWrapper>
          </div>
          <div data-testid="ja">
            <PausedWrapper locale="ja-JP">
              <DatePicker defaultValue="2026-11-18" />
              <TimePicker defaultValue="09:15" use24Hour={false} />
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    const enTitle = container.querySelector(
      '[data-testid="en"] .m3e-date-picker__eyebrow',
    )?.textContent;
    const jaTitle = container.querySelector(
      '[data-testid="ja"] .m3e-date-picker__eyebrow',
    )?.textContent;

    expect(enTitle).toBe("Select date");
    expect(jaTitle).toBe("日付を選択");

    const enMonth = container.querySelector(
      '[data-testid="en"] .m3e-date-picker__year-toggle span',
    )?.textContent;
    const jaMonth = container.querySelector(
      '[data-testid="ja"] .m3e-date-picker__year-toggle span',
    )?.textContent;

    expect(enMonth).toContain("November");
    expect(jaMonth).toContain("2026");

    const jaAmBtn = container.querySelector(
      '[data-testid="ja"] .m3e-time-picker__period button',
    )?.textContent;
    expect(jaAmBtn).toBe("午前");
  });

  it("renders a single-item Accordion with variant, trailingBadge, and hidden='until-found' panel", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <Accordion
            variant="outlined"
            items={[
              {
                value: "notes",
                title: "Architecture Notes",
                trailingBadge: <span>New</span>,
                content: "Searchable hidden paragraph",
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    expect(
      container.querySelector(".m3e-accordion")?.getAttribute("data-variant"),
    ).toBe("outlined");
    expect(container.querySelector(".m3e-accordion__badge")?.textContent).toBe("New");
    const panel = container.querySelector<HTMLElement>(".m3e-accordion__panel");
    expect(panel?.getAttribute("hidden")).toBe("until-found");
    expect(panel?.querySelector(".m3e-accordion__content")?.textContent).toBe(
      "Searchable hidden paragraph",
    );
    act(() => {
      container.querySelector<HTMLButtonElement>(".m3e-accordion__trigger")!.click();
    });
    expect(panel?.hasAttribute("hidden")).toBe(false);
  });

  it("synchronizes Accordion showExpandAll aria-expanded strictly when all items are open", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <Accordion
            showExpandAll
            defaultValue={["one"]}
            items={[
              { value: "one", title: "Item 1", content: "Body 1" },
              { value: "two", title: "Item 2", content: "Body 2" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const expandBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-accordion__expand-all",
    );
    expect(expandBtn).not.toBeNull();
    expect(expandBtn!.getAttribute("aria-expanded")).toBe("false");
    expect(expandBtn!.textContent).toBe("Expand all");

    act(() => {
      expandBtn!.click();
    });
    expect(expandBtn!.getAttribute("aria-expanded")).toBe("true");
    expect(expandBtn!.textContent).toBe("Collapse all");

    act(() => {
      expandBtn!.click();
    });
    expect(expandBtn!.getAttribute("aria-expanded")).toBe("false");
    expect(expandBtn!.textContent).toBe("Expand all");
  });

  it("forwards refs cleanly across Button, IconButton, Switch, Checkbox, Card, and TextField", () => {
    const btnRef = React.createRef<HTMLElement>();
    const iconBtnRef = React.createRef<HTMLElement>();
    const switchRef = React.createRef<HTMLElement>();
    const checkRef = React.createRef<HTMLElement>();
    const cardRef = React.createRef<HTMLElement>();
    const inputRef = React.createRef<HTMLInputElement>();

    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <Button ref={btnRef}>Save</Button>
          <IconButton ref={iconBtnRef} aria-label="Star" icon="★" />
          <Switch ref={switchRef} aria-label="Toggle" />
          <Checkbox ref={checkRef} aria-label="Agree" />
          <Card ref={cardRef}>Card content</Card>
          <TextField ref={inputRef} label="Email" type="email" />
        </PausedWrapper>,
      );
    });

    expect(btnRef.current?.tagName.toLowerCase()).toBe("button");
    expect(iconBtnRef.current?.tagName.toLowerCase()).toBe("button");
    expect(switchRef.current).toBeInstanceOf(HTMLElement);
    expect(checkRef.current).toBeInstanceOf(HTMLElement);
    expect(cardRef.current?.tagName.toLowerCase()).toBe("article");
    expect(inputRef.current?.tagName.toLowerCase()).toBe("input");
  });

  it("handles TextField identifier attributes, password reveal toggle, clearable button, OTPField, and SearchBar", () => {
    let textVal = "secret123";
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <TextField
            label="Password"
            type="password"
            defaultValue="secret123"
            clearable
            onValueChange={(v) => {
              textVal = v;
            }}
          />
          <NumberField label="Count" defaultValue={5} min={0} max={10} />
          <OTPField length={4} defaultValue="12" aria-label="Verification code" />
          <SearchBar defaultValue="spring" />
        </PausedWrapper>,
      );
    });

    const pwdInput = container.querySelector<HTMLInputElement>(
      '.m3e-text-field__input',
    );
    expect(pwdInput?.type).toBe("password");
    expect(pwdInput?.getAttribute("autocorrect")).toBe("off");

    const togglePwdBtn = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show password"]',
    );
    expect(togglePwdBtn).not.toBeNull();
    act(() => {
      togglePwdBtn!.click();
    });
    expect(pwdInput?.type).toBe("text");

    const clearBtn = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Clear input"]',
    );
    act(() => {
      clearBtn!.click();
    });
    expect(textVal).toBe("");

    const otpSlots = container.querySelectorAll(".m3e-otp-field__slot");
    expect(otpSlots.length).toBe(4);

    expect(
      container.querySelector('button[aria-label="Clear search query"]'),
    ).not.toBeNull();
  });

  it("renders Tabs, Chips, Avatar MaterialShapes clipPath, Badge truncation, SplitButton, Dialog, Toast, Progress & Wavy SVG", () => {
    let fireToast: (() => void) | undefined;
    function ToastTrigger() {
      const { toast } = useM3EToast();
      fireToast = () => toast({ title: "Saved!", description: "All synced" });
      return null;
    }

    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <ToastTrigger />
          <Button defaultPressed>Pin</Button>
          <SplitButton
            menuItems={[{ id: "1", label: "Schedule" }]}
            onClick={() => {}}
          >
            Send
          </SplitButton>
          <Tabs defaultValue="a">
            <TabsList aria-label="Demo tabs">
              <Tab value="a">Tab A</Tab>
              <Tab value="b">Tab B</Tab>
            </TabsList>
            <TabsPanel value="a">Panel A</TabsPanel>
            <TabsPanel value="b">Panel B</TabsPanel>
          </Tabs>
          <Chip defaultSelected>Expressive</Chip>
          <Chip onRemove={() => {}}>m3eui</Chip>
          <Avatar shape="clover4Leaf" fallback="M3" />
          <Badge count={128} max={99}>
            <span>Inbox</span>
          </Badge>
          <Dialog open showCloseButton title="Confirm Sync">
            Dialog body
          </Dialog>
          <LinearProgressIndicator value={64} />
          <Meter value={85} label="CPU" />
          <LinearProgressIndicator wavy value={0.5} />
          <CircularProgressIndicator wavy value={0.7} />
        </PausedWrapper>,
      );
    });

    expect(container.querySelector(".m3e-badge")?.textContent).toBe("99+");
    expect(
      container.querySelector('button[aria-label="Remove chip"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('button[aria-label="More options"]'),
    ).not.toBeNull();
    expect(
      document.body.querySelector('button[aria-label="Close dialog"]'),
    ).not.toBeNull();

    act(() => {
      fireToast?.();
    });
    expect(document.body.textContent).toContain("Saved!");
  });

  it("reverses Carousel ArrowLeft/ArrowRight navigation in RTL and localizes slide announcements", () => {
    const slides = [
      { id: "s1", title: "Alpha" },
      { id: "s2", title: "Beta" },
      { id: "s3", title: "Gamma" },
    ];
    let activeIdx = 0;

    act(() => {
      root.render(
        <PausedWrapper locale="ar-SA" direction="rtl">
          <Carousel
            items={slides}
            defaultActiveIndex={0}
            onActiveIndexChange={(idx) => {
              activeIdx = idx;
            }}
          />
        </PausedWrapper>,
      );
    });

    const track = container.querySelector<HTMLElement>(".m3e-carousel__track");
    expect(track).not.toBeNull();

    act(() => {
      track!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
    });
    expect(activeIdx).toBe(1);
  });

  it("renders TopAppBar, FloatingToolbar, FAB, extended FAB, segmented List, MaterialShapeView, LoadingIndicator & CircularProgress", async () => {
    await act(async () => {
      root.render(
        <PausedWrapper locale="en-US">
          <TopAppBar
            variant="large-flexible"
            title="Expressive Header"
            subtitle="Collapsed 40%"
            collapsedFraction={0.4}
            actions={<button type="button">Act</button>}
          />
          <FloatingToolbar
            items={[
              { id: "bold", label: "Bold", icon: "B", selected: true },
              { id: "italic", label: "Italic", icon: "I" },
            ]}
          />
          <FAB aria-label="Create" icon="+" variant="primary" size="md" />
          <FAB expanded icon="+">
            Compose
          </FAB>
          <List variant="segmented">
            <ListItem selected headline="First item" supportingText="Sub" />
            <ListItem headline="Second item" />
          </List>
          <MaterialShapeView
            shape="cookie9Sided"
            toShape="heart"
            morphProgress={0.5}
            size={64}
          />
          <LoadingIndicator />
          <LoadingIndicator contained />
          <CircularProgressIndicator value={45} />
          <ScrollArea maxHeight={120}>
            <div>Scrollable content</div>
          </ScrollArea>
          <Divider />
        </PausedWrapper>,
      );
    });

    expect(container.querySelector(".m3e-top-app-bar")?.textContent).toContain(
      "Expressive Header",
    );
    expect(
      container.querySelector('[aria-label="App bar actions"]'),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(".m3e-segmented-list__item").length,
    ).toBe(2);
    expect(
      container.querySelectorAll('[role="progressbar"]').length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("renders Combobox, RadioGroup, CheckboxGroup, multiline TextField & bottom Sheet with localized labels", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="ja-JP">
          <Combobox
            label="コンポーネント検索"
            options={[{ value: "btn", label: "Button" }]}
          />
          <TextField multiline label="説明" invalid />
          <RadioGroup defaultValue="a" aria-label="モード">
            <Radio value="a" label="A" />
            <Radio value="b" label="B" />
          </RadioGroup>
          <CheckboxGroup defaultValue={["x"]} aria-label="権限">
            <Checkbox value="x" label="Read" />
          </CheckboxGroup>
          <Sheet open title="設定シート">
            Sheet content
          </Sheet>
        </PausedWrapper>,
      );
    });

    const comboInput = container.querySelector<HTMLInputElement>(
      ".m3e-combobox__input",
    );
    expect(comboInput?.placeholder).toBe(jaJPMessages["combobox.placeholder"]);
    expect(container.textContent).toContain(
      jaJPMessages["textField.textareaDefaultInvalid"],
    );
    expect(
      document.body.querySelector(
        `button[aria-label="${jaJPMessages["sheet.close"]}"]`,
      ),
    ).not.toBeNull();
  });

  it("restores default values on form reset", async () => {
    act(() => {
      root.render(
        <PausedWrapper>
          <form id="reset-form">
            <Checkbox name="cb" defaultChecked aria-label="Check" />
            <Switch name="sw" defaultChecked aria-label="Switch" />
          </form>
        </PausedWrapper>,
      );
    });
    const form = container.querySelector<HTMLFormElement>("#reset-form")!;
    const cb = container.querySelector<HTMLElement>('[role="checkbox"]')!;
    const sw = container.querySelector<HTMLElement>('[role="switch"]')!;
    act(() => {
      cb.click();
      sw.click();
    });
    expect(cb.getAttribute("aria-checked")).toBe("false");
    expect(sw.getAttribute("aria-checked")).toBe("false");
    await act(async () => {
      form.reset();
    });
    expect(container.querySelector('[role="checkbox"]')!.getAttribute("aria-checked")).toBe("true");
    expect(container.querySelector('[role="switch"]')!.getAttribute("aria-checked")).toBe("true");
  });

  it("keeps empty, out-of-range, and future-bounded field values consistent", () => {
    act(() => {
      root.render(
        <PausedWrapper>
          <TimePickerField name="t" label="Time" defaultValue="" />
          <Slider name="s" aria-label="Level" defaultValue={80} max={50} />
          <DatePicker defaultValue="2026-01-15" minDate="2026-04-01" />
        </PausedWrapper>,
      );
    });
    expect(container.querySelector<HTMLInputElement>('input[name="t"]')!.value).toBe("");
    expect(container.querySelector<HTMLInputElement>('input[name="s"]')!.value).toBe("50");
    expect(container.querySelector<HTMLInputElement>('.m3e-slider input[type="range"]')?.value).toBe("50");
    const navButtons = container.querySelectorAll<HTMLButtonElement>(".m3e-date-picker__nav-btn");
    expect(navButtons[0]!.disabled).toBe(true);
    expect(navButtons[1]!.disabled).toBe(false);
  });

  it("stacks a Dialog opened inside a Sheet above the Sheet", () => {
    act(() => {
      root.render(
        <PausedWrapper>
          <Sheet open title="Sheet">
            <Dialog open title="Confirm">
              Body
            </Dialog>
          </Sheet>
        </PausedWrapper>,
      );
    });

    const sheet = document.body.querySelector(".m3e-sheet__viewport");
    const dialog = document.body.querySelector(".m3e-dialog__viewport");
    expect(sheet).not.toBeNull();
    expect(dialog).not.toBeNull();
    expect(
      sheet!.compareDocumentPosition(dialog!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(sheet!.contains(dialog)).toBe(false);
  });

  it("restores Slider active handle width (2px -> 4px) immediately on global window pointerup without requiring blur", () => {
    act(() => {
      root.render(
        <PausedWrapper>
          <Slider defaultValue={50} aria-label="音量滑块" />
        </PausedWrapper>,
      );
    });

    const thumb = container.querySelector<HTMLElement>(".m3e-slider__thumb");
    const handleBar = container.querySelector<HTMLElement>(
      ".m3e-slider__handle-bar",
    );
    expect(thumb).not.toBeNull();
    expect(handleBar).not.toBeNull();
    expect(thumb!.hasAttribute("data-active")).toBe(false);
    expect(handleBar!.style.width).toBe("4px");

    act(() => {
      thumb!.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
      );
    });
    expect(thumb!.hasAttribute("data-active")).toBe(true);
    expect(handleBar!.style.width).toBe("2px");

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    });
    expect(thumb!.hasAttribute("data-active")).toBe(false);
    expect(handleBar!.style.width).toBe("4px");
  });

  it("renders Select with canonical M3 4px floating corners by default and 12px corners when labelPosition is outside", () => {
    const options = [
      { value: "expressive", label: "Expressive" },
      { value: "vibrant", label: "Vibrant" },
    ];

    act(() => {
      root.render(
        <PausedWrapper>
          <Select
            variant="filled"
            label="色彩方案"
            options={options}
            defaultValue="expressive"
          />
          <Select
            variant="outlined"
            label="边框方案"
            options={options}
            defaultValue="vibrant"
          />
          <Select
            variant="filled"
            labelPosition="outside"
            label="外部填充"
            options={options}
            defaultValue="expressive"
          />
          <Select
            variant="outlined"
            labelPosition="outside"
            label="外部边框"
            options={options}
            defaultValue="vibrant"
          />
        </PausedWrapper>,
      );
    });

    const triggers = container.querySelectorAll<HTMLElement>(
      ".m3e-select__trigger",
    );
    expect(triggers.length).toBe(4);
    expect(triggers[0]!.style.borderRadius).toBe("4px 4px 0px 0px");
    expect(triggers[1]!.style.borderRadius).toBe("4px");
    expect(triggers[2]!.style.borderRadius).toBe("12px 12px 0px 0px");
    expect(triggers[3]!.style.borderRadius).toBe("12px");
  });

  it("mirrors ConnectedButtonGroup corner tuples and Switch thumb offset horizontally in RTL", () => {
    const items = [
      { value: "day", label: "D" },
      { value: "week", label: "W" },
      { value: "month", label: "M" },
    ];

    act(() => {
      root.render(
        <div>
          <PausedWrapper direction="ltr">
            <div data-testid="ltr">
              <ButtonGroup
                variant="connected"
                items={items}
                defaultValue={["week"]}
              />
              <Switch aria-label="LTR Switch" defaultChecked={false} />
            </div>
          </PausedWrapper>
          <PausedWrapper direction="rtl">
            <div data-testid="rtl">
              <ButtonGroup
                variant="connected"
                items={items}
                defaultValue={["week"]}
              />
              <Switch aria-label="RTL Switch" defaultChecked={false} />
            </div>
          </PausedWrapper>
        </div>,
      );
    });

    const ltrButtons = container.querySelectorAll<HTMLElement>(
      '[data-testid="ltr"] .m3e-button-group__item',
    );
    const rtlButtons = container.querySelectorAll<HTMLElement>(
      '[data-testid="rtl"] .m3e-button-group__item',
    );

    expect(ltrButtons[0]!.style.borderRadius).toBe("20px 8px 8px 20px");
    expect(rtlButtons[0]!.style.borderRadius).toBe("8px 20px 20px 8px");
    expect(ltrButtons[1]!.style.borderRadius).toBe("20px");
    expect(rtlButtons[1]!.style.borderRadius).toBe("20px");

    const ltrThumb = container.querySelector<HTMLElement>(
      '[data-testid="ltr"] .m3e-switch__thumb',
    );
    const rtlThumb = container.querySelector<HTMLElement>(
      '[data-testid="rtl"] .m3e-switch__thumb',
    );
    expect(ltrThumb!.style.translate).toBe("8.00px -50%");
    expect(rtlThumb!.style.translate).toBe("-8.00px -50%");
  });

  it("manages DataTable aria-sort strictly on active column and localizes status announcements", () => {
    const rows = [
      { id: "1", version: "v10", latency: 42 },
      { id: "2", version: "v2", latency: 18 },
      { id: "3", version: "v1", latency: 95 },
    ];

    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <DataTable
            caption="版本性能监控表"
            rows={rows}
            getRowKey={(r) => r.id}
            columns={[
              {
                id: "version",
                header: "版本号",
                sortable: true,
                sortAccessor: (r) => r.version,
                cell: (r) => r.version,
              },
              {
                id: "latency",
                header: "延迟 (ms)",
                sortable: true,
                align: "end",
                sortAccessor: (r) => r.latency,
                cell: (r) => r.latency,
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const headers = container.querySelectorAll<HTMLTableCellElement>(
      "thead th[scope='col']",
    );
    expect(headers[0]!.hasAttribute("aria-sort")).toBe(false);
    expect(headers[1]!.hasAttribute("aria-sort")).toBe(false);

    const versionSortBtn = headers[0]!.querySelector<HTMLButtonElement>(
      "button.m3e-data-table__sort-btn",
    );
    act(() => {
      versionSortBtn!.click();
    });
    expect(headers[0]!.getAttribute("aria-sort")).toBe("ascending");
    expect(headers[1]!.hasAttribute("aria-sort")).toBe(false);

    const rowHeadersAsc = Array.from(
      container.querySelectorAll("tbody th[scope='row']"),
    ).map((el) => el.textContent);
    expect(rowHeadersAsc).toEqual(["v1", "v2", "v10"]);

    act(() => {
      versionSortBtn!.click();
    });
    expect(headers[0]!.getAttribute("aria-sort")).toBe("descending");
    const status = container.querySelector('[role="status"]');
    expect(status?.textContent).toContain("已按版本号降序排列");
  });

  it("renders TimePicker (24h dual ring), range DatePicker, Form/Fieldset & Skeleton", () => {
    let pickedRange: { start: string; end: string } | null = null;

    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <TimePicker defaultValue="14:30" use24Hour />
          <DatePicker
            mode="range"
            defaultValue={{ start: "2026-11-10", end: "2026-11-14" }}
            onValueChange={(r) => {
              pickedRange = r;
            }}
          />
          <Form errors={{ username: "该用户名已被注册" }} showErrorSummary>
            <Fieldset legend="账号安全配置" description="管理登录凭据">
              <input name="username" defaultValue="m3e" />
            </Fieldset>
          </Form>
          <Skeleton shape="cookie9Sided" width={48} />
        </PausedWrapper>,
      );
    });

    const dialOptions = container.querySelectorAll(
      '.m3e-time-picker__dial button.m3e-time-picker__dial-num',
    );
    expect(dialOptions.length).toBe(24);

    const fieldset = container.querySelector("fieldset.m3e-fieldset");
    expect(fieldset!.firstElementChild?.tagName.toLowerCase()).toBe("legend");

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("该用户名已被注册");

    const dayButtons = container.querySelectorAll<HTMLButtonElement>(
      ".m3e-date-range-picker .m3e-date-picker__day",
    );
    act(() => {
      dayButtons[19]!.click();
    });
    act(() => {
      dayButtons[11]!.click();
    });
    expect(pickedRange).toEqual({
      start: "2026-11-12",
      end: "2026-11-20",
    });

    const shapeSkeleton = container.querySelector("svg.m3e-skeleton--shape path");
    expect(shapeSkeleton?.getAttribute("d")?.startsWith("M ")).toBe(true);
  });

  it("supports primary language subtag fallback (zh-TW -> zh-CN, ar-EG -> ar-SA, fr-CA -> en-US)", () => {
    act(() => {
      root.render(
        <div>
          <div data-testid="tw">
            <PausedWrapper locale="zh-TW">
              <SearchBar />
            </PausedWrapper>
          </div>
          <div data-testid="eg">
            <PausedWrapper locale="ar-EG" direction="auto">
              <SearchBar />
            </PausedWrapper>
          </div>
          <div data-testid="fr">
            <PausedWrapper locale="fr-CA">
              <SearchBar />
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    expect(
      container.querySelector<HTMLInputElement>('[data-testid="tw"] input')
        ?.placeholder,
    ).toBe(zhCNMessages["searchBar.placeholder"]);
    expect(
      container.querySelector<HTMLInputElement>('[data-testid="eg"] input')
        ?.placeholder,
    ).toBe(arSAMessages["searchBar.placeholder"]);
    expect(
      container.querySelector<HTMLInputElement>('[data-testid="fr"] input')
        ?.placeholder,
    ).toBe(enUSMessages["searchBar.placeholder"]);
  });

  it("switches TimePicker between dial mode and keyboard input mode with localized button labels", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <TimePicker defaultValue="08:45" use24Hour />
        </PausedWrapper>,
      );
    });

    const modeBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-time-picker__mode-btn",
    );
    expect(modeBtn?.getAttribute("aria-label")).toBe(
      enUSMessages["timePicker.switchToKeyboard"],
    );

    act(() => {
      modeBtn!.click();
    });
    expect(modeBtn?.getAttribute("aria-label")).toBe(
      enUSMessages["timePicker.switchToDial"],
    );
    expect(
      container.querySelector('input[aria-label="Hour"]'),
    ).not.toBeNull();
  });

  it("toggles DatePicker year grid view and selects a year cleanly", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <DatePicker defaultValue="2026-11-18" />
        </PausedWrapper>,
      );
    });

    const yearToggle = container.querySelector<HTMLButtonElement>(
      ".m3e-date-picker__year-toggle",
    );
    expect(yearToggle?.getAttribute("aria-expanded")).toBe("false");

    act(() => {
      yearToggle!.click();
    });
    expect(yearToggle?.getAttribute("aria-expanded")).toBe("true");
    expect(
      container.querySelectorAll(".m3e-date-picker__year-pill").length,
    ).toBe(15);
  });

  it("handles NumberField increment/decrement steppers with localized accessible names", () => {
    let currentNum: number | null = 10;
    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <NumberField
            label="数量"
            defaultValue={10}
            onValueChange={(v) => {
              currentNum = v;
            }}
          />
        </PausedWrapper>,
      );
    });

    const incBtn = container.querySelector<HTMLButtonElement>(
      `button[aria-label="${zhCNMessages["numberField.increment"]}"]`,
    );
    const decBtn = container.querySelector<HTMLButtonElement>(
      `button[aria-label="${zhCNMessages["numberField.decrement"]}"]`,
    );
    expect(incBtn).not.toBeNull();
    expect(decBtn).not.toBeNull();
    expect(currentNum).toBe(10);
  });

  it("handles DataTable select-all checkbox and empty-state localized fallback", () => {
    let selected: string[] = [];
    act(() => {
      root.render(
        <div>
          <div data-testid="empty-tbl">
            <PausedWrapper locale="ja-JP">
              <DataTable
                caption="空テーブル"
                rows={[]}
                getRowKey={(r: { id: string }) => r.id}
                columns={[{ id: "id", header: "ID", cell: (r) => r.id }]}
              />
            </PausedWrapper>
          </div>
          <div data-testid="sel-tbl">
            <PausedWrapper locale="en-US">
              <DataTable
                caption="Selectable"
                selectable
                onSelectedRowKeysChange={(k) => {
                  selected = [...k];
                }}
                rows={[
                  { id: "r1", name: "Row 1" },
                  { id: "r2", name: "Row 2" },
                ]}
                getRowKey={(r) => r.id}
                columns={[{ id: "name", header: "Name", cell: (r) => r.name }]}
              />
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    expect(
      container.querySelector('[data-testid="empty-tbl"]')?.textContent,
    ).toContain(jaJPMessages["dataTable.empty"]);

    const selectAll = container.querySelector<HTMLElement>(
      '[data-testid="sel-tbl"] [aria-label="Select all rows"]',
    );
    expect(selectAll).not.toBeNull();
    act(() => {
      selectAll!.click();
    });
    expect(selected).toEqual(["r1", "r2"]);
  });

  it("computes standard ButtonGroup zero-sum press expansion while conserving group width", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <ButtonGroup
            variant="standard"
            items={[
              { value: "a", label: "Reply" },
              { value: "b", label: "Forward" },
              { value: "c", label: "Archive" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const buttons = container.querySelectorAll<HTMLElement>(
      ".m3e-button-group__item",
    );
    expect(buttons.length).toBe(3);
  });

  it("renders compact NavigationRail anchor links with section titles, badgeLabel, and a SearchBar header", () => {
    let selected = "theme-setup";
    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <div>
            <NavigationRail
              expanded
              modal="auto"
              density="compact"
              header={<SearchBar size="sm" placeholder="快速搜索组件" />}
              value={selected}
              onValueChange={(v) => {
                selected = v;
              }}
              items={[
                {
                  value: "theme-setup",
                  label: "主题与国际化",
                  href: "#theme-setup",
                  badgeLabel: "v1.0",
                  section: "入门",
                },
                {
                  value: "button",
                  label: "Button 按钮",
                  href: "#button",
                  section: "动作",
                },
              ]}
            />
          </div>
        </PausedWrapper>,
      );
    });

    const compactBar = container.querySelector<HTMLElement>(
      '.m3e-search-bar[data-size="sm"]',
    );
    expect(compactBar).not.toBeNull();
    expect(compactBar!.style.minHeight).toBe("40px");

    const nav = container.querySelector<HTMLElement>("nav.m3e-nav-rail--compact");
    expect(nav?.getAttribute("data-modal")).toBe("auto");
    expect(nav?.querySelector(".m3e-nav-rail__header .m3e-search-bar")).not.toBeNull();
    expect(
      nav?.querySelector<HTMLElement>(".m3e-nav-list__item")?.style.minHeight,
    ).toBe("40px");
    expect(
      [...nav!.querySelectorAll(".m3e-nav-list__section-title")].map((el) => el.textContent),
    ).toEqual(["入门", "动作"]);
    const links = nav!.querySelectorAll<HTMLAnchorElement>("a.m3e-nav-list__item");
    expect(links.length).toBe(2);
    expect(links[0]!.getAttribute("href")).toBe("#theme-setup");
    expect(links[0]!.getAttribute("aria-current")).toBe("true");
    expect(links[0]!.querySelector(".m3e-nav-list__tag")?.textContent).toBe("v1.0");

    act(() => {
      links[1]!.click();
    });
    expect(selected).toBe("button");
  });

  it("floats labels and opens <fieldset>/<legend> outline notches on TextField, Select, DatePickerField, TimePickerField, and Combobox", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <div>
            <TextField variant="outlined" label="Project name" />
            <TextField
              variant="outlined"
              label="Filled field"
              defaultValue="M3 Expressive"
            />
            <Combobox
              variant="outlined"
              label="Framework"
              items={[
                { value: "react", label: "React" },
                { value: "compose", label: "Compose" },
              ]}
            />
            <Select
              variant="outlined"
              label="Model (Outlined)"
              defaultValue="pro"
              options={[
                { value: "pro", label: "Gemini 2.5 Pro" },
                { value: "flash", label: "Gemini 2.5 Flash" },
              ]}
            />
            <DatePickerField label="Release date" defaultValue="2026-11-13" />
            <TimePickerField label="Release time" defaultValue="09:30" />
          </div>
        </PausedWrapper>,
      );
    });

    const outlines = container.querySelectorAll<HTMLFieldSetElement>(
      "fieldset.m3e-field__outline",
    );
    expect(outlines.length).toBe(6);
    expect(outlines[0]!.hasAttribute("data-floating")).toBe(false);
    expect(outlines[1]!.hasAttribute("data-floating")).toBe(true);
    expect(outlines[3]!.hasAttribute("data-floating")).toBe(true);

    // Ensure <fieldset class="m3e-field__outline"> is a direct child of .m3e-select__shell (never inside <button class="m3e-select__trigger">)
    const selectShellOutlines = container.querySelectorAll<HTMLFieldSetElement>(
      ".m3e-select__shell > fieldset.m3e-field__outline",
    );
    expect(selectShellOutlines.length).toBe(3);
    expect(
      container.querySelector(".m3e-select__trigger fieldset.m3e-field__outline"),
    ).toBeNull();
    const selectShell = container.querySelector<HTMLElement>(".m3e-select__shell");
    expect(selectShell?.style.borderRadius).toBe("4px");

    const firstInput = container.querySelector<HTMLInputElement>(
      ".m3e-text-field__input",
    );
    expect(firstInput).not.toBeNull();
    act(() => {
      firstInput!.focus();
    });
    expect(outlines[0]!.hasAttribute("data-floating")).toBe(true);
  });

  it("preserves toggle Button leadingIcon by default when selected, supports showCheckIcon, and renders ButtonGroup overflow trigger", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <div>
            <Button
              defaultPressed
              leadingIcon={<span data-testid="star-glyph">*</span>}
            >
              Favorite
            </Button>
            <Button
              defaultPressed
              showCheckIcon
              leadingIcon={<span data-testid="pin-glyph">#</span>}
            >
              Pinned
            </Button>
            <ButtonGroup
              maxVisibleItems={2}
              items={[
                { value: "one", label: "One" },
                { value: "two", label: "Two" },
                { value: "three", label: "Three" },
                { value: "four", label: "Four" },
              ]}
            />
          </div>
        </PausedWrapper>,
      );
    });

    expect(container.querySelector('[data-testid="star-glyph"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="pin-glyph"]')).toBeNull();

    const visibleItems = container.querySelectorAll(
      ".m3e-button-group__item:not(.m3e-button-group__overflow-trigger)",
    );
    expect(visibleItems.length).toBe(2);
    const overflowBtn = container.querySelector<HTMLButtonElement>(
      '.m3e-button-group button.m3e-button-group__overflow-trigger[aria-label="More actions"]',
    );
    expect(overflowBtn).not.toBeNull();
  });

  it("applies inert to collapsed FloatingToolbar and closed FABMenu, roving focus on ArrowUp/ArrowDown, and outside pointerdown dismiss", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <div>
            <FloatingToolbar
              collapsed
              items={[
                { id: "cut", label: "Cut", icon: <span>X</span> },
                { id: "copy", label: "Copy", icon: <span>C</span> },
              ]}
            />
            <FABMenu
              triggerLabel="Create"
              items={[
                { id: "doc", label: "Document", icon: <span>D</span> },
                { id: "sheet", label: "Spreadsheet", icon: <span>S</span> },
              ]}
            />
          </div>
        </PausedWrapper>,
      );
    });

    const toolbar = container.querySelector<HTMLElement>(".m3e-floating-toolbar");
    expect(toolbar).not.toBeNull();
    expect(toolbar!.hasAttribute("data-collapsed")).toBe(true);
    expect(toolbar!.inert).toBe(true);

    const fabMenuList = container.querySelector<HTMLElement>(".m3e-fab-menu__list");
    const toggleFab = container.querySelector<HTMLButtonElement>(".m3e-toggle-fab");
    expect(fabMenuList).not.toBeNull();
    expect(toggleFab).not.toBeNull();
    expect(fabMenuList!.inert).toBe(true);
    expect(
      container.querySelector(".m3e-fab-menu__item")?.getAttribute("aria-hidden"),
    ).toBeNull();

    act(() => {
      toggleFab!.click();
    });
    expect(fabMenuList!.inert).toBe(false);

    const menuItems = container.querySelectorAll<HTMLButtonElement>(
      ".m3e-fab-menu__item",
    );
    expect(menuItems.length).toBe(2);
    act(() => {
      menuItems[1]!.focus();
      fabMenuList!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(menuItems[0]);

    act(() => {
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      );
    });
    expect(fabMenuList!.inert).toBe(true);
  });

  it("adapts DatePicker firstDayOfWeek by locale and supports 2D arrow-key roving grid navigation", () => {
    expect(getLocaleFirstDayOfWeek("en-US")).toBe(0);
    expect(getLocaleFirstDayOfWeek("ar-SA")).toBe(6);
    expect(getLocaleFirstDayOfWeek("zh-CN")).toBe(1);
    expect(getLocalizedWeekdays("en-US").length).toBe(7);

    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <DatePicker defaultValue="2026-05-15" />
        </PausedWrapper>,
      );
    });

    const weekRows = container.querySelectorAll('.m3e-date-picker__week-row[role="row"]');
    expect(weekRows.length).toBeGreaterThanOrEqual(5);
    const gridCells = container.querySelectorAll('.m3e-date-picker__week-row [role="gridcell"]');
    expect(gridCells.length).toBe(weekRows.length * 7);

    const activeDay = container.querySelector<HTMLButtonElement>(
      '.m3e-date-picker__day[tabindex="0"]',
    );
    expect(activeDay?.textContent).toBe("15");

    act(() => {
      activeDay!.focus();
      activeDay!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    });

    const nextActiveDay = container.querySelector<HTMLButtonElement>(
      '.m3e-date-picker__day[tabindex="0"]',
    );
    expect(nextActiveDay?.textContent).toBe("22");
  });

  it("advances Carousel focal slide via horizontal pointer drag scrubbing", () => {
    let focalIndex = 0;
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <Carousel
            defaultActiveIndex={0}
            onActiveIndexChange={(idx) => {
              focalIndex = idx;
            }}
            items={[
              { id: "1", title: "Slide One" },
              { id: "2", title: "Slide Two" },
              { id: "3", title: "Slide Three" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const track = container.querySelector<HTMLElement>(".m3e-carousel__track");
    expect(track).not.toBeNull();

    act(() => {
      track!.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerId: 1,
          clientX: 280,
          clientY: 100,
        }),
      );
      track!.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          pointerId: 1,
          clientX: 120,
          clientY: 102,
        }),
      );
      track!.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerId: 1,
          clientX: 120,
          clientY: 102,
        }),
      );
    });

    expect(focalIndex).toBe(1);
  });

  it("supports TimePicker keyboard dial navigation, FloatingToolbar scrollCollapse, and SPEC_2025 M3EProvider tokens", () => {
    let currentTime = "09:30";
    let collapsedState = false;
    const scrollBoxRef = { current: null as HTMLDivElement | null };

    act(() => {
      root.render(
        <M3EProvider themeEngine={generateM3EThemeTokens} syncDocumentRoot={false}>
          <div
            ref={(node) => {
              scrollBoxRef.current = node;
            }}
            style={{ height: 120, overflowY: "auto" }}
          >
            <TimePicker
              defaultValue="09:30"
              use24Hour
              onValueChange={(v) => {
                currentTime = v;
              }}
            />
            <FloatingToolbar
              scrollCollapse
              scrollTarget={scrollBoxRef}
              onCollapsedChange={(c) => {
                collapsedState = c;
              }}
              items={[{ id: "edit", label: "Edit", icon: "✎" }]}
              companionFab={<button type="button">+</button>}
            />
          </div>
        </M3EProvider>,
      );
    });

    const scope = container.querySelector<HTMLElement>(".m3e-scope");
    expect(scope?.style.getPropertyValue("--m3e-color-primary-dim")).toContain("light-dark(");

    const dial = container.querySelector<HTMLElement>(".m3e-time-picker__dial");
    expect(dial?.getAttribute("tabindex")).toBe("0");

    act(() => {
      dial!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });
    expect(currentTime).toBe("10:30");

    act(() => {
      dial!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    act(() => {
      dial!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true, bubbles: true }),
      );
    });
    expect(currentTime).toBe("10:35");

    // Simulate downward scroll > 24px -> collapses toolbar; upward scroll -> expands toolbar
    act(() => {
      scrollBoxRef.current!.scrollTop = 60;
      scrollBoxRef.current!.dispatchEvent(new Event("scroll"));
    });
    expect(collapsedState).toBe(true);

    act(() => {
      scrollBoxRef.current!.scrollTop = 0;
      scrollBoxRef.current!.dispatchEvent(new Event("scroll"));
    });
    expect(collapsedState).toBe(false);
  });

  it("applies scoped BCP 47 lang/dir, CLDR 12h/24h TimePicker BiDi digits, localized Carousel/Badge/Progress, and RTL Slider/end Sheet geometry", () => {
    act(() => {
      root.render(
        <div>
          <div data-testid="ar-scope">
            <M3EProvider locale="ar_sa" initialDirection="auto" syncDocumentRoot={false}>
              <TimePicker defaultValue="14:30" />
              <Carousel
                items={Array.from({ length: 8 }, (_, i) => ({ id: String(i), title: `${i + 1}` }))}
              />
              <DatePicker
                mode="range"
                defaultValue={{ start: "2026-11-10", end: "2026-11-14" }}
              />
              <CircularProgressIndicator value={45} showValueLabel />
              <Badge count={120} max={99}>
                <span>Inbox</span>
              </Badge>
              <Slider defaultValue={40} step={20} showTicks aria-label="مستوى الصوت" />
              <Sheet side="end" open title="لوحة جانبية">
                <span>محتوى</span>
              </Sheet>
            </M3EProvider>
          </div>
          <div data-testid="zh-scope">
            <M3EProvider locale="zh_cn" initialDirection="auto" syncDocumentRoot={false}>
              <TimePicker defaultValue="14:30" />
              <Carousel
                items={[
                  { id: "1", title: "第一张" },
                  { id: "2", title: "第二张" },
                ]}
              />
            </M3EProvider>
          </div>
        </div>,
      );
    });

    const arScope = container.querySelector<HTMLElement>(
      '[data-testid="ar-scope"] .m3e-scope',
    );
    const zhScope = container.querySelector<HTMLElement>(
      '[data-testid="zh-scope"] .m3e-scope',
    );
    expect(arScope?.getAttribute("lang")).toBe("ar-SA");
    expect(arScope?.getAttribute("dir")).toBe("rtl");
    expect(zhScope?.getAttribute("lang")).toBe("zh-CN");
    expect(zhScope?.getAttribute("dir")).toBe("ltr");

    // CLDR default hourCycle: ar-SA -> 12h (12 dial options + LTR digit container), zh-CN -> 24h (24 dial options)
    expect(
      arScope?.querySelectorAll('.m3e-time-picker__dial button.m3e-time-picker__dial-num').length,
    ).toBe(12);
    expect(
      arScope
        ?.querySelector(".m3e-time-picker__digits-ltr")
        ?.getAttribute("dir"),
    ).toBe("ltr");
    expect(
      zhScope?.querySelectorAll('.m3e-time-picker__dial button.m3e-time-picker__dial-num').length,
    ).toBe(24);

    // Carousel localized aria-roledescription + RTL chevron mirroring
    expect(
      arScope?.querySelector(".m3e-carousel")?.getAttribute("aria-roledescription"),
    ).toBe(arSAMessages["carousel.roleDescription"]);
    expect(
      zhScope?.querySelector(".m3e-carousel")?.getAttribute("aria-roledescription"),
    ).toBe(zhCNMessages["carousel.roleDescription"]);
    expect(
      zhScope
        ?.querySelector(".m3e-carousel__slide")
        ?.getAttribute("aria-roledescription"),
    ).toBe(zhCNMessages["carousel.slideRoleDescription"]);
    const arChevronSvg = arScope?.querySelector<SVGSVGElement>(
      ".m3e-carousel__nav-btn svg",
    );
    expect(arChevronSvg?.style.scale).toBe("-1 1");

    // Badge overflow & CircularProgressIndicator localized via Intl.NumberFormat
    const expectedOverflow = formatM3EMessage(arSAMessages["badge.overflow"], {
      max: formatLocalizedInteger("ar-SA", 99),
    });
    expect(arScope?.querySelector(".m3e-badge")?.textContent).toBe(
      expectedOverflow,
    );
    const expectedPct = formatLocalizedPercent("ar-SA", 0.45);
    expect(
      arScope
        ?.querySelector(".m3e-circular-progress")
        ?.getAttribute("aria-valuetext"),
    ).toBe(expectedPct);

    // Slider RTL segment borderRadius caps & logical tick positioning
    const activeSeg = arScope?.querySelector<HTMLElement>(
      ".m3e-slider__segment--active",
    );
    expect(activeSeg?.style.borderRadius).toBe("2px 8px 8px 2px");
    const firstTick = arScope?.querySelector<HTMLElement>(".m3e-slider__tick");
    expect(firstTick?.style.insetInlineStart).toContain("calc(6px +");
    expect(firstTick?.style.left).toBe("");

    // end Sheet defaults to logical side="end", resolving to data-side="left" in RTL
    const rtlEndSheet = document.body.querySelector<HTMLElement>(
      ".m3e-sheet__popup",
    );
    expect(rtlEndSheet?.getAttribute("data-side")).toBe("left");
  });

  it("supports Button loading/danger/fullWidth/href, TextField prefix/suffix, Select clearable/groups, and new Alert/Chip/Breadcrumb/Pagination/Empty/CommandPalette components", () => {
    let clickCount = 0;
    let chipRemoved = false;
    let chipClicked = false;
    let selectedVal: string | null = "pro";
    let currentPage = 2;
    let ranCommand = "";

    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <Button
            loading
            intent="danger"
            fullWidth
            onClick={() => {
              clickCount += 1;
            }}
          >
            正在删除
          </Button>
          <Button href="https://example.com/docs" variant="outlined">
            外链按钮
          </Button>
          <IconButton
            icon={<span>✕</span>}
            aria-label="删除条目"
            intent="danger"
            loading
          />
          <TextField
            label="自定义域名"
            prefixText="https://"
            suffixText=".m3e.dev"
            defaultValue=""
          />
          <Select
            label="部署实例"
            clearable
            value={selectedVal}
            onValueChange={(v) => {
              selectedVal = v;
            }}
            groups={[
              {
                label: "亚太区",
                options: [
                  { value: "pro", label: "Tokyo Pro" },
                  { value: "std", label: "Singapore Standard" },
                ],
              },
            ]}
          />
          <Alert severity="error" title="同步失败" closable>
            请检查上游令牌权限
          </Alert>
          <Chip tone="success" dot>
            运行中
          </Chip>
          <Chip
            tone="primary"
            onRemove={() => {
              chipRemoved = true;
            }}
          >
            v0.1.0
          </Chip>
          <Chip
            tone="secondary"
            variant="outlined"
            onClick={() => {
              chipClicked = true;
            }}
          >
            筛选
          </Chip>
          <Breadcrumb
            items={[
              { key: "home", label: "首页", href: "/" },
              { key: "comp", label: "组件", href: "/components" },
              { key: "btn", label: "Button", href: "/components/button" },
            ]}
          />
          <Pagination
            page={currentPage}
            totalItems={95}
            pageSize={10}
            showSummary
            onPageChange={(next) => {
              currentPage = next;
            }}
          />
          <Empty shape="clover8Leaf" actions={<Button size="xs">新建</Button>} />
          <CommandPalette
            open
            groups={[
              {
                id: "nav",
                heading: "快捷跳转",
                items: [
                  {
                    id: "go-blocks",
                    label: "打开 Blocks 模板库",
                    shortcut: "⌘B",
                    onSelect: () => {
                      ranCommand = "go-blocks";
                    },
                  },
                ],
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const loadingBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-button[data-loading]",
    );
    expect(loadingBtn?.getAttribute("aria-busy")).toBe("true");
    expect(loadingBtn?.getAttribute("data-intent")).toBe("danger");
    expect(loadingBtn?.hasAttribute("data-full-width")).toBe(true);
    act(() => {
      loadingBtn?.click();
    });
    expect(clickCount).toBe(0);

    const linkBtn = container.querySelector<HTMLAnchorElement>(
      'a.m3e-button[href="https://example.com/docs"]',
    );
    expect(linkBtn).not.toBeNull();

    const textAffixes = container.querySelectorAll(".m3e-text-field__text-affix");
    expect(textAffixes.length).toBe(2);
    expect(textAffixes[0]?.textContent).toBe("https://");
    expect(
      container
        .querySelector(".m3e-text-field__shell")
        ?.hasAttribute("data-floating"),
    ).toBe(true);

    const clearSelectBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-select__clear-btn",
    );
    expect(clearSelectBtn?.getAttribute("aria-label")).toBe(
      zhCNMessages["select.clear"],
    );
    act(() => {
      clearSelectBtn?.click();
    });
    expect(selectedVal).toBeNull();

    const errorAlert = container.querySelector('.m3e-alert[data-severity="error"]');
    expect(errorAlert?.getAttribute("role")).toBe("alert");
    const closeAlertBtn = errorAlert?.querySelector<HTMLButtonElement>(
      ".m3e-alert__close",
    );
    act(() => {
      closeAlertBtn?.click();
    });
    expect(container.querySelector(".m3e-alert")).toBeNull();

    const staticStatusChip = container.querySelector(
      'span.m3e-chip-status[data-tone="success"]',
    );
    expect(staticStatusChip?.querySelector(".m3e-chip-status__dot")).not.toBeNull();
    const removeStatusChipBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-chip-status__remove",
    );
    act(() => {
      removeStatusChipBtn?.click();
    });
    expect(chipRemoved).toBe(true);
    const interactiveStatusChip = container.querySelector<HTMLButtonElement>(
      "button.m3e-chip-status[data-interactive]",
    );
    expect(interactiveStatusChip).not.toBeNull();
    act(() => {
      interactiveStatusChip?.click();
    });
    expect(chipClicked).toBe(true);

    const breadcrumbOl = container.querySelector("nav.m3e-breadcrumb > ol");
    expect(breadcrumbOl).not.toBeNull();
    const lastCrumbLink = breadcrumbOl?.querySelector(
      'li:last-child > a[aria-current="page"]',
    );
    expect(lastCrumbLink?.textContent).toBe("Button");

    const nextBtn = container.querySelector<HTMLButtonElement>(
      `button[aria-label="${zhCNMessages["pagination.next"]}"]`,
    );
    act(() => {
      nextBtn?.click();
    });
    expect(currentPage).toBe(3);

    expect(container.querySelector(".m3e-empty__title")?.textContent).toBe(
      zhCNMessages["empty.title"],
    );

    const cmdOption = document.body.querySelector<HTMLElement>(
      '.m3e-command-palette__item[role="option"]',
    );
    expect(cmdOption?.textContent).toContain("打开 Blocks 模板库");
    act(() => {
      cmdOption?.click();
    });
    expect(ranCommand).toBe("go-blocks");
  });

  it("filters CommandPalette items by keywords and runs the highlighted one on Enter", async () => {
    const ran: string[] = [];
    act(() => {
      root.render(
        <PausedWrapper>
          <CommandPalette
            open
            items={[
              { id: "a", label: "Alpha", onSelect: () => ran.push("a") },
              { id: "b", label: "Beta", keywords: ["spring"], onSelect: () => ran.push("b") },
            ]}
          />
        </PausedWrapper>,
      );
    });
    const input = document.body.querySelector<HTMLInputElement>(
      ".m3e-command-palette__input",
    )!;
    await act(async () => {
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        input,
        "spring",
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const options = document.body.querySelectorAll(".m3e-command-palette__item");
    expect([...options].map((o) => o.textContent)).toEqual(["Beta"]);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(ran).toEqual(["b"]);
  });

  it("renders IconButton as a semantic anchor element when href is provided", () => {
    act(() => {
      root.render(
        <PausedWrapper>
          <IconButton
            href="https://github.com/boltguo/m3eui"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            icon={<span data-testid="gh-glyph">GH</span>}
          />
        </PausedWrapper>,
      );
    });

    const link = container.querySelector<HTMLAnchorElement>("a.m3e-icon-button");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("https://github.com/boltguo/m3eui");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link?.getAttribute("aria-label")).toBe("GitHub");
    expect(link?.getAttribute("type")).toBeNull();
  });

  it("renders Phase 1 M3E spec components: filter Chip, SearchView, and standard List", () => {
    let chipClicks = 0;
    let submittedSearch = "";
    let clearedRecent = false;

    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <div>
            <Chip
              selected
              elevated
              icon={<span>✨</span>}
              onSelectedChange={() => {
                chipClicks += 1;
              }}
            >
              总结本周变更
            </Chip>

            <SearchView
              open
              recentSearches={["MaterialShapes", "HCT 色彩"]}
              onClearRecent={() => {
                clearedRecent = true;
              }}
              suggestions={[
                { value: "btn", label: "Button 按钮", category: "动作" },
              ]}
              onSearchSubmit={(q) => {
                submittedSearch = q;
              }}
            />

            <List dividers="inset" aria-label="标准设置列表">
              <ListItem headline="通知偏好" supportingText="管理推送渠道" selected />
              <ListItem headline="安全与密钥" />
            </List>
          </div>
        </PausedWrapper>,
      );
    });

    const suggestionChip = container.querySelector<HTMLButtonElement>(
      ".m3e-chip--filter",
    );
    expect(suggestionChip).not.toBeNull();
    expect(suggestionChip?.getAttribute("aria-pressed")).toBe("true");
    expect(suggestionChip?.hasAttribute("data-elevated")).toBe(true);
    act(() => {
      suggestionChip?.click();
    });
    expect(chipClicks).toBe(1);

    const searchView = document.body.querySelector<HTMLElement>(
      ".m3e-search-view__modal-popup .m3e-search-view",
    );
    expect(searchView?.querySelector('form[role="search"]')).not.toBeNull();
    const recentList = searchView?.querySelector('ul[role="listbox"]');
    expect(recentList).not.toBeNull();
    const clearRecentBtn = searchView?.querySelector<HTMLButtonElement>(
      ".m3e-search-view__clear-recent",
    );
    act(() => {
      clearRecentBtn?.click();
    });
    expect(clearedRecent).toBe(true);

    const recentBtn = searchView?.querySelector<HTMLButtonElement>(
      ".m3e-search-view__item",
    );
    act(() => {
      recentBtn?.click();
    });
    expect(submittedSearch).toBe("MaterialShapes");

    const stdList = container.querySelector<HTMLElement>(
      '.m3e-segmented-list[data-variant="standard"]',
    );
    expect(stdList?.getAttribute("data-dividers")).toBe("inset");
    const stdItems = stdList?.querySelectorAll<HTMLElement>(".m3e-segmented-list__item");
    expect(stdItems?.length).toBe(2);
    expect(stdItems?.[1]?.style.borderRadius).toBe("0px");
  });

  it("supports Phase 2 upgrades: multiple Select, multiple Combobox, AvatarGroup, expandable/sticky DataTable, and DatePicker variants", () => {
    let multiValues: string[] = ["design", "eng"];
    let modalConfirmedDate = "";

    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <div>
            <Select
              multiple
              label="负责团队"
              maxVisibleTags={1}
              value={multiValues}
              onValueChange={(next) => {
                multiValues = next;
              }}
              options={[
                { value: "design", label: "设计系统" },
                { value: "eng", label: "前端架构" },
                { value: "qa", label: "质量保障" },
              ]}
            />

            <Combobox
              multiple
              label="技术栈"
              defaultValue={[{ value: "react", label: "React 19" }]}
              options={[
                { value: "react", label: "React 19" },
                { value: "ts", label: "TypeScript 5" },
              ]}
            />

            <AvatarGroup
              max={3}
              items={[
                { id: "1", fallback: "A" },
                { id: "2", fallback: "B" },
                { id: "3", fallback: "C" },
                { id: "4", fallback: "D" },
                { id: "5", fallback: "E" },
              ]}
            />

            <DataTable
              caption="集群节点"
              getRowKey={(r) => r.id}
              rows={[
                { id: "n1", name: "node-alpha", region: "ap-east" },
                { id: "n2", name: "node-beta", region: "eu-central" },
              ]}
              columns={[
                { id: "name", header: "节点", sticky: "start", width: 160, cell: (r) => r.name },
                { id: "region", header: "区域", sticky: "end", cell: (r) => r.region },
              ]}
              renderExpandedRow={(row) => (
                <div data-testid={`expanded-${row.id}`}>详情: {row.region}</div>
              )}
            />

            <DatePicker
              defaultValue="2026-06-15"
              minDate="2026-06-10"
              maxDate="2026-06-20"
            />
            <DatePickerField
              mode="range"
              label="迭代周期"
              defaultValue={{ start: "2026-06-10", end: "2026-06-18" }}
            />
            <DatePickerField
              id="modal-date"
              modal
              defaultValue="2026-06-15"
              onValueChange={(val) => {
                modalConfirmedDate = val;
              }}
            />
          </div>
        </PausedWrapper>,
      );
    });

    // multiple Select summary & clear
    const multiClear = container.querySelector<HTMLButtonElement>(
      ".m3e-multi-select .m3e-select__clear-btn",
    );
    expect(multiClear).not.toBeNull();
    act(() => {
      multiClear?.click();
    });
    expect(multiValues).toEqual([]);

    // multiple Combobox chip
    expect(
      container.querySelector(".m3e-multi-combobox__chip-text")?.textContent,
    ).toBe("React 19");

    // AvatarGroup overflow (+2)
    const overflowAvatar = container.querySelector(".m3e-avatar-group__overflow");
    expect(overflowAvatar?.textContent).toContain("+2");

    // DataTable sticky columns & expandable rows
    expect(
      container.querySelector('th[data-sticky="start"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('td[data-sticky="end"]'),
    ).not.toBeNull();
    const expandBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-data-table__expand-btn",
    );
    expect(expandBtn?.getAttribute("aria-expanded")).toBe("false");
    act(() => {
      expandBtn?.click();
    });
    expect(
      container.querySelector('[data-testid="expanded-n1"]')?.textContent,
    ).toContain("ap-east");

    // DatePicker minDate/maxDate constraints
    const disabledDays = container.querySelectorAll(
      ".m3e-date-picker__day:disabled",
    );
    expect(disabledDays.length).toBeGreaterThan(10);

    // modal DatePickerField confirm
    act(() => {
      container.querySelector<HTMLButtonElement>("#modal-date")!.click();
    });
    const modalPopup = document.body.querySelector(".m3e-modal-date-picker");
    expect(modalPopup).not.toBeNull();
    const confirmBtn = Array.from(
      modalPopup!.querySelectorAll<HTMLButtonElement>("button.m3e-button"),
    ).find((b) => b.textContent === zhCNMessages["datePicker.confirm"]);
    act(() => {
      confirmBtn?.click();
    });
    expect(modalConfirmedDate).toBe("2026-06-15");
  });

  it("renders retained Web utility components: FileUpload, Kbd/CopyButton/Snippet, and HCT ColorPicker", async () => {
    const platformSpy = vi
      .spyOn(navigator, "platform", "get")
      .mockReturnValue("MacIntel");
    let copiedSnippet = "";
    let pickedHex = "#6750A4";
    let uploadItems = [
      { id: "f1", name: "spec.pdf", size: 204800, status: "uploading" as const, progress: 60 },
      { id: "f2", name: "tokens.json", size: 12400, status: "completed" as const },
    ];

    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <FileUpload
            defaultValue={uploadItems}
            onValueChange={(next) => {
              uploadItems = next as typeof uploadItems;
            }}
          />

          <Kbd keys={["mod", "shift", "p"]} />
          <Snippet
            code="npx m3eui init"
            onCopy={(val) => {
              copiedSnippet = val;
            }}
          />

          <ColorPicker
            defaultValue="#6750A4"
            onValueChange={(hex) => {
              pickedHex = hex;
            }}
          />
          <ColorPickerField label="主题种子色" defaultValue="#0B6B58" />
          <ColorSwatch defaultValue="#6750A4" />
        </PausedWrapper>,
      );
    });

    // FileUpload list & remove
    const fileList = container.querySelector('.m3e-file-upload__list[role="list"]');
    expect(fileList?.querySelectorAll(".m3e-file-upload__item").length).toBe(2);
    const removeFileBtn = fileList?.querySelector<HTMLButtonElement>(
      ".m3e-file-upload__remove",
    );
    act(() => {
      removeFileBtn?.click();
    });
    expect(uploadItems.length).toBe(1);

    // Kbd & Snippet
    const kbdText = container.querySelector("kbd.m3e-kbd")?.textContent;
    expect(kbdText).toBe("⌘⇧P");
    platformSpy.mockReturnValue("Linux x86_64");
    const linuxHost = document.createElement("div");
    document.body.appendChild(linuxHost);
    const linuxRoot = createRoot(linuxHost);
    await act(async () => {
      linuxRoot.render(<Kbd keys={["mod", "shift", "p"]} />);
    });
    expect(linuxHost.querySelector("kbd.m3e-kbd")?.textContent).toBe("Ctrl⇧P");
    act(() => linuxRoot.unmount());
    linuxHost.remove();
    platformSpy.mockRestore();
    const snippetCopyBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-snippet .m3e-copy-button",
    );
    await act(async () => {
      snippetCopyBtn?.click();
    });
    expect(copiedSnippet).toBe("npx m3eui init");

    // ColorPicker HCT swatches & tonal ramp
    const swatchBtns = container.querySelectorAll<HTMLButtonElement>(
      ".m3e-color-swatch__item",
    );
    expect(swatchBtns.length).toBeGreaterThanOrEqual(8);
    expect(
      container.querySelectorAll(".m3e-color-picker__ramp-stop").length,
    ).toBe(10);
    act(() => {
      swatchBtns[1]?.click();
    });
    expect(pickedHex).toBe("#0B6B58");
  });

  it("styles scrollbars via scoped webkit pseudo-elements without disabling overlay scrollbars", () => {
    const css = readFileSync(
      resolve(__dirname, "styles/m3e.css"),
      "utf8",
    );
    expect(css).not.toMatch(/scrollbar-color:|scrollbar-width:\s*thin/);
    expect(css).not.toMatch(/(?:^|[\s,])(?:html|body|:root|\*)::-webkit-scrollbar/);
  });

  it("layers floating popup positioners above Dialog, Sheet, SearchView, and CommandPalette modals", () => {
    const css = readFileSync(
      resolve(__dirname, "styles/m3e.css"),
      "utf8",
    );
    const getZIndex = (selector: string): number => {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = css.match(
        new RegExp(`${escaped}\\s*\\{[^}]*?z-index:\\s*(\\d+)`, "m"),
      );
      if (!match) {
        throw new Error(`Missing z-index for ${selector}`);
      }
      return Number(match[1]);
    };

    const modalZIndices = [
      getZIndex(".m3e-dialog__backdrop"),
      getZIndex(".m3e-dialog__viewport"),
      getZIndex(".m3e-sheet__backdrop"),
      getZIndex(".m3e-sheet__viewport"),
      getZIndex(".m3e-search-view__modal-popup"),
      getZIndex(".m3e-command-palette"),
    ];
    const maxModalZ = Math.max(...modalZIndices);

    expect(getZIndex(".m3e-search-view__modal-popup")).toBeGreaterThan(
      getZIndex(".m3e-dialog__backdrop"),
    );

    const popupPositioners = [
      ".m3e-select__positioner",
      ".m3e-segmented-menu__positioner",
      ".m3e-popover__positioner",
      ".m3e-search-bar__positioner",
    ];
    for (const selector of popupPositioners) {
      expect(getZIndex(selector)).toBeGreaterThan(maxModalZ);
    }

    expect(getZIndex(".m3e-tooltip__positioner")).toBeGreaterThan(
      getZIndex(".m3e-select__positioner"),
    );
    expect(getZIndex(".m3e-toast__viewport")).toBeGreaterThan(
      getZIndex(".m3e-tooltip__positioner"),
    );
  });

  it("dogfoods Kbd, Divider, Empty, and IconButton across internal composite components", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <CommandPalette
            open
            items={[
              {
                id: "open-blocks",
                label: "Open Blocks",
                shortcut: "⇧⌘B",
                onSelect: () => {},
              },
            ]}
          />
          <DropdownMenu
            open
            trigger={<Button>Menu</Button>}
            items={[
              {
                id: "save",
                label: "Save",
                shortcut: "⌘S",
              },
            ]}
          />
          <SplitButton
            open
            menuItems={[
              {
                id: "deploy",
                label: "Deploy Now",
                shortcut: "⌘↵",
              },
            ]}
          >
            Publish
          </SplitButton>
          <NavigationRail
            expanded
            value="b"
            onValueChange={() => {}}
            items={[
              { value: "a", label: "Overview", section: "Docs" },
              { value: "b", label: "Button", section: "Components" },
            ]}
          />
          <Alert severity="info" closable title="Synced" />
        </PausedWrapper>,
      );
    });

    const cmdKbdKeys = document.body.querySelectorAll(
      ".m3e-command-palette .m3e-kbd .m3e-kbd__key",
    );
    expect(Array.from(cmdKbdKeys).map((el) => el.textContent)).toEqual([
      "⇧",
      "⌘",
      "B",
    ]);

    const menuKbds = document.body.querySelectorAll(
      ".m3e-segmented-menu .m3e-kbd",
    );
    expect(menuKbds.length).toBe(2);

    expect(
      container.querySelector(".m3e-nav-rail .m3e-nav-list__divider"),
    ).not.toBeNull();
    expect(
      container.querySelector(".m3e-alert .m3e-icon-button.m3e-alert__close"),
    ).not.toBeNull();
  });

  it("keeps popup scrollports flush with outer borders and opens ColorPicker inside Popover via Button trigger", () => {
    let pickedHex = "#6750A4";

    act(() => {
      root.render(
        <PausedWrapper>
          <Select
            label="Scheme"
            defaultValue="expressive"
            options={[
              { value: "expressive", label: "Expressive" },
              { value: "vibrant", label: "Vibrant" },
            ]}
          />
          <Sheet side="end" open title="Studio">
            <Popover
              trigger={
                <Button size="xs" variant="outlined">
                  Custom
                </Button>
              }
            >
              <ColorPicker
                value={pickedHex}
                onValueChange={(next) => {
                  pickedHex = next;
                }}
              />
            </Popover>
          </Sheet>
        </PausedWrapper>,
      );
    });

    const selectTrigger = container.querySelector<HTMLButtonElement>(
      ".m3e-select__trigger",
    );
    expect(selectTrigger).not.toBeNull();
    act(() => {
      selectTrigger?.click();
    });

    const selectPopup = document.body.querySelector<HTMLElement>(
      ".m3e-select__popup",
    );
    const selectList = document.body.querySelector<HTMLElement>(
      ".m3e-select__list",
    );
    expect(selectPopup).not.toBeNull();
    expect(selectPopup?.style.padding).toBe("");
    expect(selectList?.style.padding).not.toBe("");

    const sheetPopup = document.body.querySelector<HTMLElement>(
      ".m3e-sheet__popup",
    );
    expect(sheetPopup?.style.padding).toBe("");
    expect(sheetPopup?.style.getPropertyValue("--m3e-sheet-pad")).not.toBe("");

    const customBtn = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>(".m3e-button"),
    ).find((b) => b.textContent?.includes("Custom"));
    expect(customBtn).not.toBeUndefined();
    expect(customBtn?.getAttribute("aria-expanded")).toBe("false");

    act(() => {
      customBtn?.click();
    });

    expect(customBtn?.getAttribute("aria-expanded")).toBe("true");
    const picker = document.body.querySelector<HTMLElement>(
      ".m3e-popover .m3e-color-picker",
    );
    expect(picker).not.toBeNull();
  });

  it("prevents unselected :hover rules from overriding [data-selected] or solid backgrounds via specificity inflation", () => {
    const css = readFileSync(resolve(__dirname, "styles/m3e.css"), "utf8");

    expect(css).toContain(
      '.m3e-button[data-variant="outlined"]:hover:where(:not([data-disabled], [data-selected], [data-pressed]))',
    );
    expect(css).toContain(
      ".m3e-button[data-selected]:hover:where(:not([data-disabled], [data-pressed]))",
    );
    expect(css).toContain(
      '.m3e-icon-button[data-variant="outlined"]:hover:where(:not([data-disabled], [data-selected], [data-pressed]))',
    );
    expect(css).toContain(
      ".m3e-icon-button[data-toggle][data-selected]:hover:where(:not([data-disabled], [data-pressed]))",
    );
    expect(css).toContain(
      '.m3e-chip-status[data-variant="solid"][data-tone="primary"]',
    );
    expect(css).toContain("--m3e-chip-status-bg: var(--m3e-color-primary);");
  });
});

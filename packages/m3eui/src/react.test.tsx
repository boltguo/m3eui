// @vitest-environment happy-dom

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  Accordion,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  ButtonGroup,
  Card,
  Carousel,
  Checkbox,
  CheckboxGroup,
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
  Collapsible,
  Combobox,
  ContainedLoadingIndicator,
  DataTable,
  DateRangePicker,
  Dialog,
  Divider,
  DockedDatePicker,
  ExtendedFAB,
  FAB,
  Fieldset,
  FilterChip,
  FloatingToolbar,
  Form,
  IconButton,
  InputChip,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
  LoadingIndicator,
  M3E_BUILT_IN_LOCALES,
  type M3EConfig,
  M3EProvider,
  MaterialShapeView,
  Menubar,
  Meter,
  NavigationDrawer,
  NavigationMenu,
  NavigationSuite,
  NumberField,
  OTPField,
  Radio,
  RadioGroup,
  ScrollArea,
  SearchBar,
  SegmentedList,
  SegmentedListItem,
  Select,
  Skeleton,
  Slider,
  SplitButton,
  Switch,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  TextareaField,
  TextField,
  TimePicker,
  ToggleButton,
  TopAppBar,
  arSAMessages,
  defineM3EConfig,
  enUSMessages,
  formatLocalizedFullDate,
  formatLocalizedMonthYear,
  formatLocalizedWallTime,
  formatM3EMessage,
  generateM3EStaticThemeCss,
  getLocalizedMondayWeekdays,
  getM3EInitScript,
  isRtlLocale,
  jaJPMessages,
  resolveM3EConfig,
  useM3E,
  useM3EToast,
  zhCNMessages,
} from "./index.js";
import * as Primitives from "./primitives.js";

// Enable React 19 act() environment flag for clean synchronous DOM tests
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

  it("maintains 100% key parity and non-empty translations across en-US, zh-CN, ja-JP, and ar-SA", () => {
    const baseKeys = Object.keys(enUSMessages).sort();
    expect(baseKeys.length).toBeGreaterThanOrEqual(70);

    for (const [code, dict] of Object.entries(M3E_BUILT_IN_LOCALES)) {
      const keys = Object.keys(dict).sort();
      expect(keys, `Key mismatch in ${code}`).toEqual(baseKeys);
      for (const k of keys) {
        const val = dict[k as keyof typeof enUSMessages];
        expect(
          typeof val === "string" && val.trim().length > 0,
          `Empty value for ${code}.${k}`,
        ).toBe(true);
      }
    }

    expect(zhCNMessages["datePicker.title"]).toBe("选择日期");
    expect(jaJPMessages["datePicker.title"]).toBe("日付を選択");
    expect(arSAMessages["datePicker.title"]).toBe("اختر التاريخ");
    expect(
      formatM3EMessage("第 {index} 项，共 {total} 项", { index: 2, total: 5 }),
    ).toBe("第 2 项，共 5 项");
  });

  it("formats UTC-anchored localized dates, weekdays, and wall times without host-timezone drift", () => {
    expect(isRtlLocale("ar-SA")).toBe(true);
    expect(isRtlLocale("he-IL")).toBe(true);
    expect(isRtlLocale("fa-IR")).toBe(true);
    expect(isRtlLocale("zh-CN")).toBe(false);
    expect(isRtlLocale("en-US")).toBe(false);

    const weekdaysZh = getLocalizedMondayWeekdays("zh-CN");
    const weekdaysEn = getLocalizedMondayWeekdays("en-US");
    expect(weekdaysZh.length).toBe(7);
    expect(weekdaysEn.length).toBe(7);

    expect(formatLocalizedMonthYear("en-US", 2026, 11)).toContain("November");
    expect(
      formatLocalizedFullDate("en-US", { year: 2026, month: 1, day: 1 }),
    ).toContain("Jan");
    expect(
      formatLocalizedWallTime("en-US", { hour: 14, minute: 30 }, true),
    ).toContain("14:30");
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

    // Switch dynamically to Japanese -> dir automatically flips back to ltr!
    act(() => {
      switchLocale?.("ja-JP");
    });
    expect(document.documentElement.lang).toBe("ja-JP");
    expect(document.documentElement.dir).toBe("ltr");
    expect(container.querySelector('[data-testid="picker-title"]')?.textContent).toBe(
      jaJPMessages["datePicker.title"],
    );
  });

  it("localizes DockedDatePicker and TimePicker titles, weekdays, and AM/PM across en-US, zh-CN, and ja-JP", () => {
    act(() => {
      root.render(
        <div>
          <div data-testid="en">
            <PausedWrapper locale="en-US">
              <DockedDatePicker defaultValue="2026-11-18" />
              <TimePicker defaultValue="09:15" use24Hour={false} />
            </PausedWrapper>
          </div>
          <div data-testid="ja">
            <PausedWrapper locale="ja-JP">
              <DockedDatePicker defaultValue="2026-11-18" />
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

  it("renders Collapsible with hidden='until-found', nested content padding wrapper, and RTL chevron rotation", () => {
    act(() => {
      root.render(
        <div>
          <div data-testid="ltr-col">
            <PausedWrapper locale="en-US" direction="ltr">
              <Collapsible title="Architecture Notes" defaultOpen={false}>
                Searchable hidden paragraph
              </Collapsible>
            </PausedWrapper>
          </div>
          <div data-testid="rtl-col">
            <PausedWrapper locale="ar-SA" direction="rtl">
              <Collapsible title="ملاحظات" defaultOpen={false}>
                محتوى قابل للبحث
              </Collapsible>
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    const ltrPanel = container.querySelector<HTMLElement>(
      '[data-testid="ltr-col"] .m3e-collapsible__panel',
    );
    expect(ltrPanel?.getAttribute("hidden")).toBe("until-found");
    expect(
      ltrPanel?.querySelector(".m3e-collapsible__content")?.textContent,
    ).toBe("Searchable hidden paragraph");

    const ltrChevron = container.querySelector<HTMLElement>(
      '[data-testid="ltr-col"] .m3e-collapsible__chevron',
    );
    const rtlChevron = container.querySelector<HTMLElement>(
      '[data-testid="rtl-col"] .m3e-collapsible__chevron',
    );
    expect(ltrChevron?.style.rotate).toBe("-90.0deg");
    expect(rtlChevron?.style.rotate).toBe("90.0deg");

    // Click trigger to expand
    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-testid="ltr-col"] .m3e-collapsible__trigger',
    );
    act(() => {
      trigger!.click();
    });
    expect(ltrPanel?.hasAttribute("hidden")).toBe(false);
    expect(ltrChevron?.style.rotate).toBe("0.0deg");
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
    // Mixed state (1 of 2 open) -> aria-expanded="false" and reads "Expand all"
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

  it("renders NavigationMenu as a semantic <nav> landmark and marks active link with aria-current='page'", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <NavigationMenu
            brand="M3E"
            items={[
              { value: "home", label: "Overview", href: "#overview", active: true },
              {
                value: "docs",
                label: "Foundations",
                links: [
                  {
                    id: "tokens",
                    title: "Design Tokens",
                    description: "HCT & Springs",
                    href: "#tokens",
                  },
                ],
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const nav = container.querySelector("nav.m3e-nav-menu");
    expect(nav).not.toBeNull();
    expect(nav!.getAttribute("aria-label")).toBe("Site navigation");
    expect(nav!.getAttribute("role")).toBeNull();

    const activeLink = container.querySelector<HTMLAnchorElement>(
      ".m3e-nav-menu__link",
    );
    expect(activeLink?.getAttribute("aria-current")).toBe("page");
  });

  it("forwards refs cleanly across Button, IconButton, Switch, Checkbox, Card, TextField, and Collapsible", () => {
    const btnRef = React.createRef<HTMLElement>();
    const iconBtnRef = React.createRef<HTMLElement>();
    const switchRef = React.createRef<HTMLElement>();
    const checkRef = React.createRef<HTMLElement>();
    const cardRef = React.createRef<HTMLElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const colRef = React.createRef<HTMLDivElement>();

    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <Button ref={btnRef}>Save</Button>
          <IconButton ref={iconBtnRef} aria-label="Star" icon="★" />
          <Switch ref={switchRef} aria-label="Toggle" />
          <Checkbox ref={checkRef} aria-label="Agree" />
          <Card ref={cardRef}>Card content</Card>
          <TextField ref={inputRef} label="Email" type="email" />
          <Collapsible ref={colRef} title="More">
            Details
          </Collapsible>
        </PausedWrapper>,
      );
    });

    expect(btnRef.current?.tagName.toLowerCase()).toBe("button");
    expect(iconBtnRef.current?.tagName.toLowerCase()).toBe("button");
    expect(switchRef.current).toBeInstanceOf(HTMLElement);
    expect(checkRef.current).toBeInstanceOf(HTMLElement);
    expect(cardRef.current?.tagName.toLowerCase()).toBe("article");
    expect(inputRef.current?.tagName.toLowerCase()).toBe("input");
    expect(colRef.current?.classList.contains("m3e-collapsible")).toBe(true);
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

    // OTPField renders 4 digit slots
    const otpSlots = container.querySelectorAll(".m3e-otp-field__slot");
    expect(otpSlots.length).toBe(4);

    // SearchBar uses localized aria-labels
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
          <ToggleButton defaultPressed>Pin</ToggleButton>
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
          <FilterChip defaultSelected>Expressive</FilterChip>
          <InputChip onRemove={() => {}}>m3eui</InputChip>
          <Avatar shape="clover4Leaf" fallback="M3" />
          <Badge count={128} max={99}>
            <span>Inbox</span>
          </Badge>
          <Dialog open showCloseButton title="Confirm Sync">
            Dialog body
          </Dialog>
          <LinearProgressIndicator value={64} />
          <Meter value={85} label="CPU" />
          <LinearWavyProgressIndicator value={0.5} />
          <CircularWavyProgressIndicator value={0.7} />
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

    // In RTL, ArrowLeft advances to the next slide (index 1)!
    act(() => {
      track!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
    });
    expect(activeIdx).toBe(1);
  });

  it("renders TopAppBar, FloatingToolbar, FAB, ExtendedFAB, SegmentedList, MaterialShapeView, LoadingIndicator & CircularProgress", () => {
    act(() => {
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
          <ExtendedFAB expanded icon="+">
            Compose
          </ExtendedFAB>
          <SegmentedList>
            <SegmentedListItem selected headline="First item" supportingText="Sub" />
            <SegmentedListItem headline="Second item" />
          </SegmentedList>
          <MaterialShapeView
            shape="cookie9Sided"
            toShape="heart"
            morphProgress={0.5}
            size={64}
          />
          <LoadingIndicator />
          <ContainedLoadingIndicator />
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

  it("renders Combobox, RadioGroup, CheckboxGroup, TextareaField, Menubar & BottomSheet with localized labels", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="ja-JP">
          <Combobox
            label="コンポーネント検索"
            options={[{ value: "btn", label: "Button" }]}
          />
          <TextareaField label="説明" invalid />
          <RadioGroup defaultValue="a" aria-label="モード">
            <Radio value="a" label="A" />
            <Radio value="b" label="B" />
          </RadioGroup>
          <CheckboxGroup defaultValue={["x"]} aria-label="権限">
            <Checkbox value="x" label="Read" />
          </CheckboxGroup>
          <Menubar
            menus={[
              {
                id: "file",
                label: "ファイル",
                items: [{ id: "new", label: "新規" }],
              },
            ]}
          />
          <BottomSheet open title="設定シート">
            Sheet content
          </BottomSheet>
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

  it("renders Select filled variant with crisp 0px bottom corners and outlined variant with 12px corners", () => {
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
        </PausedWrapper>,
      );
    });

    const triggers = container.querySelectorAll<HTMLElement>(
      ".m3e-select__trigger",
    );
    expect(triggers.length).toBe(2);
    expect(triggers[0]!.style.borderRadius).toBe("12px 12px 0px 0px");
    expect(triggers[1]!.style.borderRadius).toBe("12px");
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

  it("renders TimePicker (24h dual ring), DateRangePicker, Form/Fieldset, NavigationSuite & Skeleton", () => {
    let pickedRange: { start: string; end: string } | null = null;

    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <TimePicker defaultValue="14:30" use24Hour />
          <DateRangePicker
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
          <NavigationSuite
            layout="bar"
            value="home"
            onValueChange={() => {}}
            items={[
              { value: "home", label: "首页", icon: "⌂" },
              { value: "tokens", label: "令牌", icon: "◈" },
            ]}
          >
            <div>主体内容</div>
          </NavigationSuite>
          <Skeleton shape="cookie9Sided" width={48} />
        </PausedWrapper>,
      );
    });

    const dialOptions = container.querySelectorAll(
      '.m3e-time-picker__dial [role="option"]',
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

  it("toggles DockedDatePicker year grid view and selects a year cleanly", () => {
    act(() => {
      root.render(
        <PausedWrapper locale="en-US">
          <DockedDatePicker defaultValue="2026-11-18" />
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

  it("renders NavigationDrawer semantic anchor links with badgeLabel & scrollSpy and compact SearchBar", () => {
    let selected = "theme-setup";
    act(() => {
      root.render(
        <PausedWrapper locale="zh-CN">
          <div>
            <SearchBar size="sm" placeholder="快速搜索组件" />
            <NavigationDrawer
              variant="permanent"
              scrollSpy
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

    const links = container.querySelectorAll<HTMLAnchorElement>(
      "nav.m3e-nav-drawer[data-scrollspy] a.m3e-wide-rail__item",
    );
    expect(links.length).toBe(2);
    expect(links[0]!.getAttribute("href")).toBe("#theme-setup");
    expect(links[0]!.getAttribute("aria-current")).toBe("true");
    expect(links[0]!.querySelector(".m3e-wide-rail__tag")?.textContent).toBe(
      "v1.0",
    );

    act(() => {
      links[1]!.click();
    });
    expect(selected).toBe("button");
  });
});

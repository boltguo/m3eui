import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Carousel,
  CircularProgressIndicator,
  ColorPicker,
  Combobox,
  CopyButton,
  DataTable,
  DatePickerField,
  Dialog,
  DatePicker,
  DragHandle,
  DropdownMenu,
  Empty,
  FAB,
  FABMenu,
  Fieldset,
  FileUpload,
  LinearProgressIndicator,
  M3EPortal,
  M3EProvider,
  MaterialShapeView,
  NavigationBar,
  NumberField,
  OTPField,
  Tooltip,
  SearchBar,
  SearchView,
  List,
  ListItem,
  Select,
  Sheet,
  Slider,
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
  NavigationRail,
  resolveM3EConfig,
  useM3EToast,
} from "./index.js";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const readLibraryCss = (): string => {
  const dir = resolve(process.cwd(), "packages/m3eui/src/styles");
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".css"))
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");
};

describe("m3eui — AOSP & Web Interaction Remediation Suite", () => {
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
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("preserves RSC-safe server entrypoints and client directives in dist build", () => {
    const pkgRoot = resolve(process.cwd(), "packages/m3eui");
    const distRoot = resolve(pkgRoot, "dist");
    if (!existsSync(distRoot)) return;

    for (const rel of [
      "index.js",
      "config.js",
      "tokens/index.js",
      "i18n/index.js",
    ]) {
      const code = readFileSync(resolve(distRoot, rel), "utf8").trimStart();
      expect(code.startsWith('"use client"'), `${rel} must stay RSC-safe`).toBe(
        false,
      );
    }

    for (const rel of [
      "context/M3EContext.js",
      "context/M3EProvider.js",
      "context/M3EPortal.js",
      "components/Button.js",
      "components/Tabs.js",
      "components/TopAppBar.js",
      "components/DragHandle.js",
      "components/Navigation.js",
    ]) {
      const code = readFileSync(resolve(distRoot, rel), "utf8").trimStart();
      expect(
        code.startsWith('"use client"'),
        `${rel} must declare "use client"`,
      ).toBe(true);
    }
  });

  it("gates every :hover rule in library CSS inside @media (hover: hover)", () => {
    const lines = readLibraryCss().split("\n");
    let depth = 0;
    let hoverMediaStack: number[] = [];
    const ungated: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const isHoverMedia = /@media\s*\(\s*hover\s*:\s*hover\s*\)/.test(line);
      for (const ch of line) {
        if (ch === "{") {
          depth++;
          if (isHoverMedia && !hoverMediaStack.includes(depth)) {
            hoverMediaStack.push(depth);
          }
        } else if (ch === "}") {
          hoverMediaStack = hoverMediaStack.filter((d) => d !== depth);
          depth--;
        }
      }
      if (line.includes(":hover") && hoverMediaStack.length === 0) {
        ungated.push(`${i + 1}: ${line.trim()}`);
      }
    }

    expect(ungated).toEqual([]);
  });

  it("supports system colorMode with matchMedia live updates, isolated roots, and scoped M3EPortal overlays", () => {
    expect(resolveM3EConfig({}).colorMode).toBe("system");

    let darkMatches = false;
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark") ? darkMatches : false,
      media: query,
      onchange: null,
      addEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => {
        if (query.includes("prefers-color-scheme: dark")) listeners.add(cb);
      },
      removeEventListener: (
        _type: string,
        cb: (e: MediaQueryListEvent) => void,
      ) => {
        listeners.delete(cb);
      },
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const portalHost = document.createElement("div");
    portalHost.id = "scoped-portal-host";
    container.appendChild(portalHost);

    const prevHtmlTheme = document.documentElement.getAttribute("data-theme");

    function ToastTrigger() {
      const { toast } = useM3EToast();
      return (
        <button
          type="button"
          id="fire-scoped-toast"
          onClick={() => toast({ title: "Scoped notification" })}
        >
          Notify
        </button>
      );
    }

    try {
      act(() => {
        root.render(
          <M3EProvider
            initialColorMode="system"
            syncDocumentRoot={false}
            portalContainer={portalHost}
          >
            <M3EPortal container={portalHost}>
              <Dialog open onOpenChange={() => {}} title="Scoped Dialog">
                <p>Inside scoped portal</p>
              </Dialog>
            </M3EPortal>
            <ToastTrigger />
          </M3EProvider>,
        );
      });

      const providerRoot = container.querySelector(".m3e-scope")!;
      expect(providerRoot.getAttribute("data-theme")).toBe("light");
      expect(providerRoot.getAttribute("data-color-mode")).toBe("system");
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        prevHtmlTheme,
      );

      expect(portalHost.textContent).toContain("Scoped Dialog");
      act(() => {
        container
          .querySelector<HTMLButtonElement>("#fire-scoped-toast")!
          .click();
      });
      expect(portalHost.textContent).toContain("Scoped notification");

      darkMatches = true;
      act(() => {
        for (const cb of listeners) {
          cb({ matches: true } as MediaQueryListEvent);
        }
      });
      expect(providerRoot.getAttribute("data-theme")).toBe("dark");
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("holds touch tap press morph across synthetic touch pointerleave and cancels immediately on pointercancel", () => {
    vi.useFakeTimers();

    act(() => {
      root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Button id="touch-btn">Tap me</Button>
          <MaterialShapeView shape="circle" size={48} />
        </M3EProvider>,
      );
    });

    const btn = container.querySelector<HTMLButtonElement>("#touch-btn")!;

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerType: "touch",
        }),
      );
    });
    expect(btn.hasAttribute("data-pressed")).toBe(true);

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerType: "touch",
        }),
      );
      btn.dispatchEvent(
        new PointerEvent("pointerleave", {
          bubbles: false,
          pointerType: "touch",
        }),
      );
    });
    // Still held during the 95ms touch pulse window even after synthetic pointerleave
    expect(btn.hasAttribute("data-pressed")).toBe(true);

    act(() => {
      vi.advanceTimersByTime(110);
    });
    expect(btn.hasAttribute("data-pressed")).toBe(false);

    // Scroll takeover (pointercancel) clears pressed state immediately
    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerType: "touch",
        }),
      );
    });
    expect(btn.hasAttribute("data-pressed")).toBe(true);

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointercancel", {
          bubbles: true,
          pointerType: "touch",
        }),
      );
    });
    expect(btn.hasAttribute("data-pressed")).toBe(false);

    // Mid-morph retargeting keeps valid SVG path geometry
    act(() => {
      root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Button id="touch-btn">Tap me</Button>
          <MaterialShapeView shape="cookie9Sided" size={48} />
        </M3EProvider>,
      );
      root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Button id="touch-btn">Tap me</Button>
          <MaterialShapeView shape="clover8Leaf" size={48} />
        </M3EProvider>,
      );
    });
    const pathD = container
      .querySelector(".m3e-material-shape path")
      ?.getAttribute("d");
    expect(pathD?.startsWith("M")).toBe(true);
  });

  it("enforces AOSP action contracts on Button loading, SplitButton xl/aria-expanded, ButtonGroup radiogroup, and FABMenu Escape focus", async () => {
    const onClick = vi.fn();

    act(() => {
      root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Button id="loading-btn" loading onClick={onClick}>
            Saving
          </Button>
          <SplitButton
            size="xl"
            open
            onClick={() => {}}
            menuItems={[{ id: "schedule", label: "Schedule" }]}
          >
            Publish
          </SplitButton>
          <ButtonGroup
            selectionMode="single"
            defaultValue={["day"]}
            items={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
          <FABMenu
            defaultOpen
            items={[{ id: "doc", label: "New Doc", icon: <span>+</span> }]}
          />
        </M3EProvider>,
      );
    });

    const loadingBtn = container.querySelector<HTMLButtonElement>("#loading-btn")!;
    expect(loadingBtn.disabled).toBe(false);
    expect(loadingBtn.getAttribute("aria-disabled")).toBe("true");
    expect(loadingBtn.getAttribute("aria-busy")).toBe("true");
    act(() => {
      loadingBtn.click();
    });
    expect(onClick).not.toHaveBeenCalled();

    const splitButtons = container.querySelectorAll<HTMLButtonElement>(
      ".m3e-split-button button",
    );
    expect(splitButtons[0]?.style.height).toBe("136px");
    expect(splitButtons[1]?.getAttribute("aria-expanded")).toBe("true");

    const toggleGroup = container.querySelector('.m3e-button-group[role="group"]')!;
    const toggles = toggleGroup.querySelectorAll<HTMLButtonElement>("button");
    expect(toggles[0]?.getAttribute("aria-pressed")).toBe("true");
    expect(toggles[0]?.tabIndex).toBe(0);
    expect(toggles[1]?.tabIndex).toBe(-1);

    await act(async () => {
      toggles[0]!.focus();
    });
    await act(async () => {
      toggles[0]!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
    });
    expect(toggles[0]?.tabIndex).toBe(-1);
    expect(toggles[1]?.tabIndex).toBe(0);

    const fabMenuRoot = container.querySelector(".m3e-fab-menu")!;
    const fabTrigger = container.querySelector<HTMLButtonElement>(
      ".m3e-fab-menu button[aria-haspopup='menu']",
    )!;
    act(() => {
      fabMenuRoot.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(fabTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(fabTrigger);
  });

  it("propagates Fieldset disabled, supports uncontrolled clear/form.reset, controlled null Select/Combobox, Picker edge cases, and FileUpload idle/replace", () => {
    function ControlledNullDemo() {
      const [sel, setSel] = React.useState<string | null>("apple");
      const [combo, setCombo] = React.useState<string | null>("apple");
      return (
        <div>
          <button
            type="button"
            id="clear-both"
            onClick={() => {
              setSel(null);
              setCombo(null);
            }}
          >
            Clear
          </button>
          <Select
            label="Fruit"
            value={sel}
            onValueChange={setSel}
            options={[{ value: "apple", label: "Apple" }]}
          />
          <Combobox
            label="Search fruit"
            value={combo}
            onValueChange={setCombo}
            options={[{ value: "apple", label: "Apple" }]}
          />
        </div>
      );
    }

    const onColors: string[] = [];

    act(() => {
      root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Fieldset legend="Locked section" disabled>
            <TextField id="fs-input" label="Name" />
            <Switch label="Alerts" />
            <Slider label="Volume" defaultValue={40} />
          </Fieldset>

          <form id="reset-form">
            <TextField id="uncontrolled-tf" label="Query" defaultValue="hello" clearable />
            <NumberField label="Qty" defaultValue={5} />
            <OTPField label="Code" defaultValue="1234" length={4} />
          </form>

          <ControlledNullDemo />

          <DatePicker
            defaultValue="2026-05-15"
            minDate="2026-05-10"
            maxDate="2026-05-20"
          />

          <TimePicker defaultValue="14:30" use24Hour />

          <ColorPicker
            defaultValue="#FF0000"
            onValueChange={(hex) => onColors.push(hex)}
          />

          <FileUpload multiple={false} />
        </M3EProvider>,
      );
    });

    expect(
      container.querySelector<HTMLInputElement>("#fs-input")?.disabled,
    ).toBe(true);
    expect(
      container
        .querySelector(".m3e-fieldset .m3e-switch")
        ?.hasAttribute("data-disabled"),
    ).toBe(true);

    // Uncontrolled TextField clear + form.reset()
    const tfInput = container.querySelector<HTMLInputElement>("#uncontrolled-tf")!;
    expect(tfInput.value).toBe("hello");
    const clearBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-text-field__icon-btn",
    )!;
    act(() => {
      clearBtn.click();
    });
    expect(tfInput.value).toBe("");

    const form = container.querySelector<HTMLFormElement>("#reset-form")!;
    act(() => {
      form.reset();
    });
    expect(tfInput.value).toBe("hello");

    // Controlled Select + Combobox null reset
    act(() => {
      container.querySelector<HTMLButtonElement>("#clear-both")!.click();
    });
    const comboInput = container.querySelector<HTMLInputElement>(
      ".m3e-combobox__input",
    )!;
    expect(comboInput.value).toBe("");

    // DatePicker minDate/maxDate disables out-of-range day buttons
    const dayButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>(".m3e-date-picker__day"),
    );
    const day5 = dayButtons.find((b) => b.textContent?.trim() === "5");
    const day15 = dayButtons.find((b) => b.textContent?.trim() === "15");
    expect(day5?.disabled).toBe(true);
    expect(day15?.disabled).toBe(false);

    // TimePicker 24h ring includes 00 and 13..23
    const dialTexts = container.querySelector(".m3e-time-picker")?.textContent ?? "";
    expect(dialTexts).toContain("00");
    expect(dialTexts).toContain("23");

    // FileUpload single-file replacement & "idle" default status
    const fileInput = container.querySelector<HTMLInputElement>(
      ".m3e-file-upload input[type='file']",
    )!;
    const f1 = new File(["alpha"], "a.txt", { type: "text/plain" });
    const f2 = new File(["beta"], "b.txt", { type: "text/plain" });

    act(() => {
      Object.defineProperty(fileInput, "files", {
        value: [f1],
        configurable: true,
      });
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.querySelector(".m3e-file-upload")?.textContent).toContain(
      "a.txt",
    );
    expect(
      container
        .querySelector(".m3e-file-upload__item")
        ?.getAttribute("data-status"),
    ).toBe("idle");

    act(() => {
      Object.defineProperty(fileInput, "files", {
        value: [f2],
        configurable: true,
      });
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const uploadText =
      container.querySelector(".m3e-file-upload")?.textContent ?? "";
    expect(uploadText).toContain("b.txt");
    expect(uploadText).not.toContain("a.txt");
  });

  it("validates Navigation, Card/segmented List valid DOM, rich Tooltip action, indeterminate Progress, CopyButton error, DataTable cross-page selection, and Carousel interactive slides", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")),
      },
      configurable: true,
    });

    const onCopyError = vi.fn();
    const onCardAction = vi.fn();
    const onCardMain = vi.fn();
    const onSlideAction = vi.fn();
    let selectedRows = ["r1", "r99"];

    function NavAndSurfaceHarness({ railExpanded }: { readonly railExpanded: boolean }) {
      return (
        <M3EProvider syncDocumentRoot={false} initialDirection="rtl" locale="ar-SA">
          <NavigationBar
            itemLayout="horizontal"
            arrangement="centered"
            value="home"
            items={[
              { value: "home", label: "Home", href: "/home" },
              { value: "files", label: "Files", href: "#files" },
            ]}
          />
          <NavigationRail
            collapsible
            expanded={railExpanded}
            onValueChange={() => {}}
            value="inbox"
            items={[{ value: "inbox", label: "Inbox", icon: <span>I</span> }]}
          />
          <Tabs defaultValue="t1">
            <TabsList>
              <Tab value="t1">Tab 1</Tab>
              <Tab value="t2">Tab 2</Tab>
            </TabsList>
            <TabsPanel value="t1">Panel 1</TabsPanel>
          </Tabs>

          <Card
            id="compound-card"
            interactive
            onClick={onCardMain}
            title="Release 1.0"
            actions={
              <button type="button" id="card-inner-btn" onClick={onCardAction}>
                Approve
              </button>
            }
          />

          <List variant="segmented">
            <ListItem headline="Static row" />
            <ListItem
              headline="Interactive row"
              onClick={() => {}}
              trailing={<button type="button">More</button>}
            />
          </List>

          <Tooltip
            title="Rich info"
            action={<button type="button" id="rt-action">Learn more</button>}
          >
            <button type="button" id="rt-trigger">Inspect</button>
          </Tooltip>

          <Tooltip
            disabled
            title="Suppressed"
            action={<button type="button">Action</button>}
          >
            <button type="button" id="rt-disabled-trigger">Still clickable</button>
          </Tooltip>

          <LinearProgressIndicator id="indet-linear" />
          <CircularProgressIndicator id="indet-circular" />

          <CopyButton value="secret" onCopyError={onCopyError} />

          <DataTable
            caption="Users"
            selectable
            selectedRowKeys={selectedRows}
            onSelectedRowKeysChange={(next) => {
              selectedRows = next;
            }}
            columns={[
              { id: "id", header: "ID", width: 80, sticky: "start", cell: (r) => r.id },
              { id: "name", header: "Name", width: 140, sticky: "start", cell: (r) => r.name },
            ]}
            rows={[
              { id: "r1", name: "Ada" },
              { id: "r2", name: "Grace" },
            ]}
            getRowKey={(r) => r.id}
          />

          <Carousel
            items={[
              {
                id: "s1",
                title: "Slide 1",
                content: (
                  <div>
                    <button
                      type="button"
                      id="slide-cta"
                      onClick={onSlideAction}
                    >
                      Open slide CTA
                    </button>
                  </div>
                ),
              },
              { id: "s2", title: "Slide 2" },
            ]}
          />
        </M3EProvider>
      );
    }

    try {
      act(() => {
        root.render(<NavAndSurfaceHarness railExpanded={false} />);
      });

      // NavigationBar horizontal + anchor href + aria-current
      const navBar = container.querySelector(".m3e-nav-bar")!;
      expect(navBar.getAttribute("data-item-layout")).toBe("horizontal");
      expect(navBar.getAttribute("data-arrangement")).toBe("centered");
      const activeNavAnchor = navBar.querySelector<HTMLAnchorElement>(
        "a[href='/home']",
      )!;
      expect(activeNavAnchor.getAttribute("aria-current")).toBe("page");

      // NavigationRail keeps its toggle (and focus) across expansion; active item stays marked
      const railToggle = container.querySelector<HTMLButtonElement>(
        ".m3e-nav-rail__toggle",
      )!;
      expect(railToggle.getAttribute("aria-expanded")).toBe("false");
      expect(
        container.querySelector(".m3e-nav-rail button[aria-current='page']"),
      ).not.toBeNull();
      railToggle.focus();

      act(() => {
        root.render(<NavAndSurfaceHarness railExpanded={true} />);
      });
      expect(container.querySelector(".m3e-nav-rail__toggle")).toBe(railToggle);
      expect(document.activeElement).toBe(railToggle);
      expect(railToggle.getAttribute("aria-expanded")).toBe("true");
      expect(
        container.querySelector(".m3e-nav-list__item[aria-current='page']"),
      ).not.toBeNull();

      // Compound Card has zero nested <button> inside <button>
      expect(container.querySelectorAll("button button").length).toBe(0);
      act(() => {
        container.querySelector<HTMLButtonElement>("#card-inner-btn")!.click();
      });
      expect(onCardAction).toHaveBeenCalledTimes(1);
      expect(onCardMain).not.toHaveBeenCalled();

      // segmented List static vs compound interactive row
      const segItems = container.querySelectorAll(".m3e-segmented-list__item");
      expect(segItems[0]?.tagName).toBe("DIV");
      expect(segItems[0]?.hasAttribute("data-static")).toBe(true);
      expect(
        segItems[1]?.querySelector(".m3e-segmented-list__primary")?.tagName,
      ).toBe("BUTTON");

      // rich Tooltip disabled=true does NOT disable its trigger button
      const rtDisabledTrigger = container.querySelector<HTMLButtonElement>(
        "#rt-disabled-trigger",
      )!;
      expect(rtDisabledTrigger.disabled).toBe(false);

      // Indeterminate progress indicators omit aria-valuenow
      const indetLinear = container.querySelector(".m3e-linear-progress")!;
      const indetCircular = container.querySelector(".m3e-circular-progress")!;
      expect(indetLinear.hasAttribute("aria-valuenow")).toBe(false);
      expect(indetCircular.hasAttribute("aria-valuenow")).toBe(false);

      // CopyButton clipboard error surfaces [data-error] and calls onCopyError
      const copyBtn = container.querySelector<HTMLButtonElement>(
        ".m3e-copy-button",
      )!;
      await act(async () => {
        copyBtn.click();
      });
      expect(copyBtn.hasAttribute("data-error")).toBe(true);
      expect(onCopyError).toHaveBeenCalledTimes(1);

      // DataTable preserves off-page key "r99" when toggling select-all on current page
      const selectAllCheckbox = container.querySelector<HTMLElement>(
        "thead .m3e-checkbox",
      )!;
      act(() => {
        selectAllCheckbox.click();
      });
      expect(selectedRows).toEqual(expect.arrayContaining(["r99", "r1", "r2"]));

      // Multi-column sticky start offsets accumulate cleanly (col0=48px selection + col1=80px)
      const headerCells = container.querySelectorAll<HTMLTableCellElement>(
        "thead th",
      );
      expect(headerCells[1]?.style.insetInlineStart).toBe("48px");
      expect(headerCells[2]?.style.insetInlineStart).toBe("128px");

      // Carousel custom slide CTA button fires without slide hijacking
      act(() => {
        container.querySelector<HTMLButtonElement>("#slide-cta")!.click();
      });
      expect(onSlideAction).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }
  });

  it("covers Carousel (50 items + 4 variants), FAB visibility/elevation/morphOnPress, Vertical/Centered Slider, Vibrant/Segmented DropdownMenu, and Non-Modal Snap Sheet", () => {
    const onFabClick = vi.fn();
    let carouselIdx = 0;
    const fiftyItems = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      title: `Slide ${i + 1}`,
    }));

    act(() => {
      root.render(
        <M3EProvider>
          <Carousel
            id="c-hero"
            items={fiftyItems}
            variant="centered-hero"
            activeIndex={carouselIdx}
            onActiveIndexChange={(next) => {
              carouselIdx = next;
            }}
          />
          <Carousel
            id="c-uncontained"
            items={fiftyItems.slice(0, 8)}
            variant="uncontained"
            preferredItemWidth={180}
          />
          <FAB
            id="fab-hidden"
            visible={false}
            icon={<span>+</span>}
            aria-label="Create"
            onClick={onFabClick}
          />
          <FAB
            id="fab-default"
            icon={<span>+</span>}
            aria-label="Default FAB"
          />
          <FAB
            id="fab-xs"
            size="xs"
            icon={<span>+</span>}
            aria-label="Small FAB"
          />
          <FAB
            id="fab-steady"
            size="md"
            elevation="lowered"
            icon={<span>+</span>}
            aria-label="Edit"
          />
          <FAB
            id="fab-lg"
            size="lg"
            icon={<span>+</span>}
            aria-label="Large FAB"
          />
          <FAB
            id="efab-morph"
            size="lg"
            morphOnPress
            elevation="none"
            icon={<span>+</span>}
          >
            Compose
          </FAB>
          <Slider
            id="slider-vert"
            orientation="vertical"
            defaultValue={40}
            aria-label="Gain"
            startIcon={<span id="s-icon">-</span>}
            endIcon={<span id="e-icon">+</span>}
          />
          <Slider
            id="slider-centered"
            centered
            min={-50}
            max={50}
            defaultValue={20}
            aria-label="Pan"
          />
          <DropdownMenu
            open
            theme="vibrant"
            variant="segmented"
            trigger={<Button id="menu-seg-btn">Menu</Button>}
            items={[
              { id: "a1", label: "Cut" },
              { id: "a2", label: "Copy" },
              { id: "a3", label: "Delete", danger: true, separatorBefore: true },
            ]}
          />
          <DropdownMenu
            open
            variant="standard"
            trigger={<Button id="menu-std-btn">Standard Menu</Button>}
            items={[
              { id: "b1", label: "One" },
              { id: "b2", label: "Two", separatorBefore: true },
            ]}
          />
          <Sheet
            open
            modal={false}
            snapPoints={[0.4, 1]}
            defaultSnapPoint={0.4}
            title="Inspector"
          >
            <div id="sheet-content">Live Properties</div>
          </Sheet>
        </M3EProvider>,
      );
    });

    // 1. Carousel 50-item centered-hero + keyboard End/Home
    const cHero = container.querySelector<HTMLElement>(
      '.m3e-carousel[data-variant="centered-hero"]',
    )!;
    expect(cHero).not.toBeNull();
    const cHeroTrack = cHero.querySelector<HTMLElement>(".m3e-carousel__track")!;
    expect(cHero.querySelectorAll(".m3e-carousel__slide").length).toBe(50);
    act(() => {
      cHeroTrack.dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true }),
      );
    });
    expect(carouselIdx).toBe(49);
    act(() => {
      cHeroTrack.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
    });
    expect(carouselIdx).toBe(49);

    const cUncontained = container.querySelector<HTMLElement>(
      '.m3e-carousel[data-variant="uncontained"]',
    )!;
    expect(cUncontained).not.toBeNull();

    // 2. FAB visible={false} + elevation + steady corners by default
    const fabHidden = container.querySelector<HTMLButtonElement>("#fab-hidden")!;
    expect(fabHidden.hasAttribute("data-hidden")).toBe(true);
    expect(fabHidden.getAttribute("aria-hidden")).toBe("true");
    expect(fabHidden.tabIndex).toBe(-1);
    act(() => {
      fabHidden.click();
    });
    expect(onFabClick).not.toHaveBeenCalled();

    const fabDefault = container.querySelector<HTMLButtonElement>("#fab-default")!;
    expect(fabDefault.style.width).toBe("56px");
    expect(fabDefault.style.borderRadius).toBe("16px");

    const fabXs = container.querySelector<HTMLButtonElement>("#fab-xs")!;
    expect(fabXs.style.width).toBe("40px");
    expect(fabXs.style.borderRadius).toBe("12px");

    const fabSteady = container.querySelector<HTMLButtonElement>("#fab-steady")!;
    expect(fabSteady.getAttribute("data-elevation")).toBe("lowered");
    expect(fabSteady.style.width).toBe("80px");
    expect(fabSteady.style.borderRadius).toBe("20px");
    act(() => {
      fabSteady.dispatchEvent(
        new PointerEvent("pointerdown", { button: 0, bubbles: true }),
      );
    });
    // Default morphOnPress=false keeps steady 20px corner radius per AOSP FloatingActionButton.kt
    expect(fabSteady.style.borderRadius).toBe("20px");
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    });

    const fabLg = container.querySelector<HTMLButtonElement>("#fab-lg")!;
    expect(fabLg.style.width).toBe("96px");
    expect(fabLg.style.borderRadius).toBe("28px");
    expect(
      fabLg.querySelector<HTMLElement>(".m3e-fab__icon")?.style.width,
    ).toContain("36px");

    const efabMorph = container.querySelector<HTMLButtonElement>("#efab-morph")!;
    expect(efabMorph.getAttribute("data-elevation")).toBe("none");
    expect(
      efabMorph.querySelector<HTMLElement>(".m3e-extended-fab__icon")?.style
        .width,
    ).toBe("32px");

    // 3. Vertical Slider & Centered Slider + flanking icons
    const vertSlider = container.querySelector<HTMLElement>(
      '.m3e-slider[data-orientation="vertical"]',
    )!;
    expect(vertSlider).not.toBeNull();
    expect(vertSlider.querySelector("#s-icon")).not.toBeNull();
    expect(vertSlider.querySelector("#e-icon")).not.toBeNull();
    const vertHandleBar = vertSlider.querySelector<HTMLElement>(
      ".m3e-slider__handle-bar",
    )!;
    expect(vertHandleBar.style.width).toBe("44px");
    expect(vertHandleBar.style.height).toBe("4px");

    const centeredSlider = container.querySelector<HTMLElement>(
      '.m3e-slider[data-centered]',
    )!;
    expect(centeredSlider).not.toBeNull();
    expect(
      centeredSlider.querySelectorAll(".m3e-slider__stop-dot").length,
    ).toBe(2);

    // 4. Vibrant & detached SegmentedMenu groups vs Standard single surface
    const vibrantMenu = document.body.querySelector<HTMLElement>(
      '.m3e-segmented-menu[data-theme="vibrant"]',
    )!;
    expect(vibrantMenu).not.toBeNull();
    expect(
      vibrantMenu.querySelectorAll(".m3e-segmented-menu__group").length,
    ).toBe(2);

    const stdMenu = document.body.querySelector<HTMLElement>(
      '.m3e-segmented-menu[data-variant="standard"]',
    )!;
    expect(stdMenu).not.toBeNull();
    expect(stdMenu.querySelectorAll(".m3e-segmented-menu__group").length).toBe(
      0,
    );
    expect(
      stdMenu.querySelectorAll(".m3e-menu__separator").length,
    ).toBe(1);

    // 5. Non-modal Sheet omits backdrop and sets data-non-modal
    const nonModalSheet = document.body.querySelector<HTMLElement>(
      ".m3e-sheet__popup[data-non-modal]",
    )!;
    expect(nonModalSheet).not.toBeNull();
    expect(document.body.querySelector(".m3e-sheet__backdrop")).toBeNull();
  });

  it("supports TopAppBar/AppBarRow overflow actions, SearchBar->SearchView anchorRef focus return, modal DatePickerField range mode, and modal TimePickerField draft isolation", async () => {
    const onOverflowClick = vi.fn();
    const onRangeCommit = vi.fn();
    const onTimeCommit = vi.fn();

    function AppBarsSearchAndDialogsHarness() {
      const searchBarRef = React.useRef<HTMLFormElement | null>(null);
      const [searchOpen, setSearchOpen] = React.useState(false);

      return (
        <M3EProvider>
          <TopAppBar
            title="Inbox"
            maxVisibleActions={3}
            actionItems={[
              { id: "search", label: "Search", icon: <span>S</span> },
              { id: "archive", label: "Archive", icon: <span>A</span> },
              { id: "pin", label: "Pin", icon: <span>P</span> },
              {
                id: "settings",
                label: "Settings",
                icon: <span>G</span>,
                onClick: onOverflowClick,
              },
            ]}
          />
          <div onClick={() => setSearchOpen(true)}>
            <SearchBar ref={searchBarRef} placeholder="Search workspace" />
          </div>
          <SearchView
            open={searchOpen}
            onOpenChange={setSearchOpen}
            anchorRef={searchBarRef}
          >
            <div>Suggestions</div>
          </SearchView>
          <DatePickerField
            id="open-date-dlg"
            modal
            mode="range"
            defaultValue={{ start: "2026-11-10", end: "2026-11-16" }}
            onValueChange={onRangeCommit}
          />
          <TimePickerField
            id="open-time-dlg"
            modal
            defaultValue="09:30"
            onValueChange={onTimeCommit}
          />
        </M3EProvider>
      );
    }

    act(() => {
      root.render(<AppBarsSearchAndDialogsHarness />);
    });

    // 1. TopAppBar with 4 actionItems and maxVisibleActions=3 renders 2 inline IconButtons + 1 More actions menu trigger
    const appBarRow = container.querySelector<HTMLElement>(".m3e-app-bar-row")!;
    expect(appBarRow).not.toBeNull();
    const appBarButtons = appBarRow.querySelectorAll<HTMLButtonElement>(
      "button.m3e-icon-button",
    );
    expect(appBarButtons.length).toBe(3);
    expect(appBarButtons[2]?.getAttribute("aria-label")).toBe("More actions");

    // 2. SearchBar ref + SearchView anchorRef focus restoration on close
    const searchInput = container.querySelector<HTMLInputElement>(
      ".m3e-search-bar__input",
    )!;
    expect(searchInput).not.toBeNull();
    act(() => {
      searchInput.click();
    });
    const searchPopup = document.body.querySelector<HTMLElement>(
      ".m3e-search-view",
    )!;
    expect(searchPopup).not.toBeNull();
    const backBtn = searchPopup.querySelector<HTMLButtonElement>(
      ".m3e-search-view__back",
    )!;
    await act(async () => {
      backBtn.click();
    });
    expect(document.activeElement).toBe(searchInput);

    // 3. Modal range DatePickerField switches to text input, edits range, and commits on OK
    act(() => {
      container.querySelector<HTMLButtonElement>("#open-date-dlg")!.click();
    });
    const dateModal = document.body.querySelector<HTMLElement>(
      ".m3e-modal-date-picker",
    )!;
    expect(dateModal).not.toBeNull();
    const switchInputBtn = dateModal.querySelector<HTMLButtonElement>(
      ".m3e-date-picker__nav-btn",
    )!;
    act(() => {
      switchInputBtn.click();
    });
    const rangeInputs = dateModal.querySelectorAll<HTMLInputElement>("input");
    expect(rangeInputs.length).toBe(2);
    const dateActionBtns = dateModal.querySelectorAll<HTMLButtonElement>(
      ".m3e-modal-date-picker__actions button",
    );
    act(() => {
      dateActionBtns[1]!.click();
    });
    expect(onRangeCommit).toHaveBeenCalledWith({
      start: "2026-11-10",
      end: "2026-11-16",
    });

    // 4. Modal TimePickerField toggles keyboard mode and cancels without firing onValueChange
    act(() => {
      container.querySelector<HTMLButtonElement>("#open-time-dlg")!.click();
    });
    const timeModal = document.body.querySelector<HTMLElement>(
      ".m3e-time-picker-dialog",
    )!;
    expect(timeModal).not.toBeNull();
    const modeToggleBtn = timeModal.querySelector<HTMLButtonElement>(
      ".m3e-time-picker__mode-btn",
    )!;
    expect(modeToggleBtn.getAttribute("aria-label")).toBe(
      "Switch to keyboard time input",
    );
    act(() => {
      modeToggleBtn.click();
    });
    expect(modeToggleBtn.getAttribute("aria-label")).toBe(
      "Switch to clock dial picker",
    );
    const timeActionBtns = timeModal.querySelectorAll<HTMLButtonElement>(
      ".m3e-time-picker-dialog__actions button",
    );
    act(() => {
      timeActionBtns[0]!.click(); // Cancel
    });
    expect(onTimeCommit).not.toHaveBeenCalled();
  });

  it("delivers standalone AOSP DragHandle (RTL keyboard + pointercancel)", () => {
    const onSplitChange = vi.fn();

    act(() => {
      root.render(
        <M3EProvider initialDirection="rtl">
          <DragHandle
            defaultValue={50}
            min={20}
            max={80}
            step={5}
            onValueChange={onSplitChange}
          />
          <DragHandle orientation="horizontal" defaultValue={40} />
        </M3EProvider>,
      );
    });

    // 1. vertical DragHandle separator semantics + RTL keyboard inversion (ArrowLeft increases split in RTL)
    const separators = container.querySelectorAll<HTMLElement>(
      '[role="separator"]',
    );
    const vHandle = separators[0]!;
    expect(vHandle.getAttribute("aria-orientation")).toBe("vertical");
    expect(vHandle.getAttribute("aria-valuenow")).toBe("50");
    act(() => {
      vHandle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
    });
    expect(onSplitChange).toHaveBeenLastCalledWith(55);
    act(() => {
      vHandle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
    });
    expect(onSplitChange).toHaveBeenLastCalledWith(20);

    // Pointer press + move + pointercancel cleans up data-active and data-dragging
    act(() => {
      vHandle.dispatchEvent(
        new PointerEvent("pointerdown", {
          button: 0,
          pointerId: 7,
          clientX: 200,
          clientY: 100,
          bubbles: true,
        }),
      );
      vHandle.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 7,
          clientX: 160,
          clientY: 100,
          bubbles: true,
        }),
      );
    });
    expect(vHandle.hasAttribute("data-active")).toBe(true);
    expect(vHandle.hasAttribute("data-dragging")).toBe(true);
    act(() => {
      vHandle.dispatchEvent(
        new PointerEvent("pointercancel", { pointerId: 7, bubbles: true }),
      );
    });
    expect(vHandle.hasAttribute("data-active")).toBe(false);
    expect(vHandle.hasAttribute("data-dragging")).toBe(false);
  });

  it("covers 0.1.0 release regressions across Web-derived & form controls", () => {
    const onAlertClose = vi.fn();
    const onCrumbClick = vi.fn((e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
    });

    function Harness({ alertOpen }: { readonly alertOpen: boolean }) {
      return (
        <M3EProvider>
          <Alert
            open={alertOpen}
            closable
            title="Controlled Alert"
            onClose={onAlertClose}
          />
          <Select
            readOnly
            clearable
            label="Role"
            name="role"
            defaultValue="admin"
            options={[
              { value: "admin", label: "Admin" },
              { value: "viewer", label: "Viewer" },
            ]}
          />
          <Combobox
            readOnly
            clearable
            label="Owner"
            name="owner"
            defaultValue="ada"
            options={[
              { value: "ada", label: "Ada Lovelace" },
              { value: "lin", label: "Linus Torvalds" },
            ]}
          />
          <DatePickerField
            readOnly
            label="Launch Date"
            name="launchDate"
            defaultValue="2026-11-15"
          />
          <TimePickerField
            readOnly
            label="Launch Time"
            name="launchTime"
            defaultValue="09:30"
          />
          <Button id="btn-loading-width" loading>
            Publish Release
          </Button>
          <Empty title="No matching artifacts" />
          <Tabs defaultValue="t1">
            <TabsList scrollable>
              <Tab value="t1">Overview</Tab>
              <Tab value="t2">Tokens</Tab>
            </TabsList>
            <TabsPanel value="t1">Body</TabsPanel>
          </Tabs>
          <Dialog open title="Preferences" showCloseButton>
            <div>Dialog body</div>
          </Dialog>
          <AvatarGroup shape="cookie9">
            <Avatar name="Ada Lovelace" />
            <Avatar name="Grace Hopper" />
          </AvatarGroup>
          <Breadcrumb
            maxItems={3}
            items={[
              { label: "Home", href: "#home" },
              { label: "Engineering", href: "#eng", onClick: onCrumbClick },
              { label: "Design System", href: "#ds" },
              { label: "Tokens" },
            ]}
          />
        </M3EProvider>
      );
    }

    act(() => {
      root.render(<Harness alertOpen={true} />);
    });

    // 1. Controlled Alert does not hide internally when open={true}, and re-mounts cleanly
    const closeBtn = container.querySelector<HTMLButtonElement>(".m3e-alert__close")!;
    expect(closeBtn).not.toBeNull();
    act(() => {
      closeBtn.click();
    });
    expect(onAlertClose).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".m3e-alert")).not.toBeNull();

    act(() => {
      root.render(<Harness alertOpen={false} />);
    });
    expect(container.querySelector(".m3e-alert")).toBeNull();

    act(() => {
      root.render(<Harness alertOpen={true} />);
    });
    expect(container.querySelector(".m3e-alert")).not.toBeNull();

    // 2. readOnly Select / Combobox / DatePickerField / TimePickerField suppress popups & clear buttons while preserving form values
    expect(container.querySelector(".m3e-select__clear-btn")).toBeNull();
    expect(container.querySelector(".m3e-combobox__clear-btn")).toBeNull();
    expect(
      container.querySelector<HTMLInputElement>('input[name="launchDate"]')?.value,
    ).toBe("2026-11-15");
    expect(
      container.querySelector<HTMLInputElement>('input[name="launchTime"]')?.value,
    ).toBe("09:30");

    for (const trigger of container.querySelectorAll<HTMLElement>(
      ".m3e-select__trigger",
    )) {
      act(() => {
        trigger.click();
      });
    }
    expect(container.querySelector("[data-popup-open]")).toBeNull();

    // 3. Button loading preserves label element in layout while rendering loader overlay
    const loadingBtn = container.querySelector<HTMLButtonElement>(
      "#btn-loading-width",
    )!;
    expect(loadingBtn.querySelector(".m3e-button__loader")).not.toBeNull();
    expect(loadingBtn.querySelector(".m3e-button__label")?.textContent).toBe(
      "Publish Release",
    );

    // 4. Empty without description omits .m3e-empty__description
    expect(container.querySelector(".m3e-empty__title")?.textContent).toBe(
      "No matching artifacts",
    );
    expect(container.querySelector(".m3e-empty__description")).toBeNull();

    // 5. Scrollable TabsList, Dialog close button, AvatarGroup polygon ring SVG, and Breadcrumb overflow MouseEvent
    expect(
      container.querySelector(".m3e-tabs__list")?.hasAttribute("data-scrollable"),
    ).toBe(true);
    expect(document.body.querySelector(".m3e-dialog__close-btn")).not.toBeNull();
    expect(
      document.body
        .querySelector(".m3e-dialog__header")
        ?.hasAttribute("data-has-close"),
    ).toBe(true);
    expect(container.querySelector(".m3e-avatar-group__ring-svg")).not.toBeNull();

    const ellipsisBtn = container.querySelector<HTMLButtonElement>(
      ".m3e-breadcrumb__ellipsis",
    )!;
    act(() => {
      ellipsisBtn.click();
    });
    const menuItems = Array.from(
      document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const engItem = menuItems.find((el) =>
      el.textContent?.includes("Engineering"),
    );
    expect(engItem).toBeDefined();
    act(() => {
      engItem!.click();
    });
    expect(onCrumbClick).toHaveBeenCalledTimes(1);
    expect(typeof onCrumbClick.mock.calls[0]?.[0]?.preventDefault).toBe(
      "function",
    );
  });
});

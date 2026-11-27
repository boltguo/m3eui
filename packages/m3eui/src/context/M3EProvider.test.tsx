import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { setupDomTest } from "../__tests__/domHarness.js";
import { generateM3EThemeTokens } from "../tokens/color.js";
import { type M3EConfig } from "../config.js";
import {
  arSAMessages,
  enUSMessages,
  jaJPMessages,
  zhCNMessages,
} from "../i18n/index.js";
import { M3EProvider, useM3E } from "./M3EProvider.js";
import { M3EPortal } from "./M3EPortal.js";
import { Dialog } from "../components/Dialog/Dialog.js";
import { Popover } from "../components/Popover/Popover.js";
import { SearchBar } from "../components/SearchBar/SearchBar.js";
import { Tooltip } from "../components/Tooltip/Tooltip.js";
import { useM3EToast } from "../components/Toast/Toast.js";

describe("M3EProvider & M3EPortal", () => {
  const dom = setupDomTest();

  it("defaults colorMode to system and syncs documentElement colorScheme, data-color-mode, and meta[name=color-scheme] when toggling dark/light mode", () => {
    let toggleMode: ((mode: "light" | "dark" | "system") => void) | undefined;

    function ColorModeProbe() {
      const { colorMode, setColorMode } = useM3E();
      toggleMode = setColorMode;
      return <span data-testid="mode">{colorMode}</span>;
    }

    act(() => {
      dom.root.render(
        <M3EProvider>
          <ColorModeProbe />
        </M3EProvider>,
      );
    });

    expect(dom.container.querySelector('[data-testid="mode"]')?.textContent).toBe("system");
    expect(document.documentElement.dataset.colorMode).toBe("system");
    expect(document.documentElement.style.colorScheme).toBe("light dark");
    expect(
      document.querySelector('meta[name="color-scheme"]')?.getAttribute("content"),
    ).toBe("light dark");

    act(() => {
      toggleMode?.("dark");
    });

    expect(dom.container.querySelector('[data-testid="mode"]')?.textContent).toBe("dark");
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
      dom.root.render(
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
    expect(dom.container.querySelector('[data-testid="search-ph"]')?.textContent).toBe(
      "Custom Search Override",
    );
    expect(dom.container.querySelector('[data-testid="picker-title"]')?.textContent).toBe(
      arSAMessages["datePicker.title"],
    );
    expect(JSON.parse(exportedJson).theme.contrastLevel).toBe(0.5);

    act(() => {
      switchLocale?.("ja-JP");
    });
    expect(document.documentElement.lang).toBe("ja-JP");
    expect(document.documentElement.dir).toBe("ltr");
    expect(dom.container.querySelector('[data-testid="picker-title"]')?.textContent).toBe(
      jaJPMessages["datePicker.title"],
    );
  });

  it("supports primary language subtag fallback (zh-TW -> zh-CN, ar-EG -> ar-SA, fr-CA -> en-US)", () => {
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="tw">
            <M3EProvider syncDocumentRoot={false} locale="zh-TW">
              <SearchBar />
            </M3EProvider>
          </div>
          <div data-testid="eg">
            <M3EProvider syncDocumentRoot={false} locale="ar-EG" initialDirection="auto">
              <SearchBar />
            </M3EProvider>
          </div>
          <div data-testid="fr">
            <M3EProvider syncDocumentRoot={false} locale="fr-CA">
              <SearchBar />
            </M3EProvider>
          </div>
        </div>,
      );
    });

    expect(
      dom.container.querySelector<HTMLInputElement>('[data-testid="tw"] input')
        ?.placeholder,
    ).toBe(zhCNMessages["searchBar.placeholder"]);
    expect(
      dom.container.querySelector<HTMLInputElement>('[data-testid="eg"] input')
        ?.placeholder,
    ).toBe(arSAMessages["searchBar.placeholder"]);
    expect(
      dom.container.querySelector<HTMLInputElement>('[data-testid="fr"] input')
        ?.placeholder,
    ).toBe(enUSMessages["searchBar.placeholder"]);
  });

  it("applies scoped BCP 47 lang/dir and themeEngine SPEC_2025 tokens", () => {
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="ar-scope">
            <M3EProvider
              themeEngine={generateM3EThemeTokens}
              locale="ar_sa"
              initialDirection="auto"
              syncDocumentRoot={false}
            >
              <span />
            </M3EProvider>
          </div>
          <div data-testid="zh-scope">
            <M3EProvider locale="zh_cn" initialDirection="auto" syncDocumentRoot={false}>
              <span />
            </M3EProvider>
          </div>
        </div>,
      );
    });

    const arScope = dom.container.querySelector<HTMLElement>(
      '[data-testid="ar-scope"] .m3e-scope',
    );
    const zhScope = dom.container.querySelector<HTMLElement>(
      '[data-testid="zh-scope"] .m3e-scope',
    );
    expect(arScope?.getAttribute("lang")).toBe("ar-SA");
    expect(arScope?.getAttribute("dir")).toBe("rtl");
    expect(zhScope?.getAttribute("lang")).toBe("zh-CN");
    expect(zhScope?.getAttribute("dir")).toBe("ltr");
    expect(arScope?.style.getPropertyValue("--m3e-color-primary-dim")).toContain("light-dark(");
  });

  it("supports system colorMode with matchMedia live updates, isolated roots, and scoped M3EPortal overlays", () => {
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
    dom.container.appendChild(portalHost);

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
        dom.root.render(
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

      const providerRoot = dom.container.querySelector(".m3e-scope")!;
      expect(providerRoot.getAttribute("data-theme")).toBe("light");
      expect(providerRoot.getAttribute("data-color-mode")).toBe("system");
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        prevHtmlTheme,
      );

      expect(portalHost.textContent).toContain("Scoped Dialog");
      act(() => {
        dom.container
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

  it("propagates lang, dir, dark theme, and CSS tokens into custom M3EPortal containers without mutating the caller container", () => {
    const externalHost = document.createElement("div");
    externalHost.id = "custom-external-portal";
    dom.container.appendChild(externalHost);

    act(() => {
      dom.root.render(
        <M3EProvider
          syncDocumentRoot={false}
          locale="ar-SA"
          initialDirection="rtl"
          initialColorMode="dark"
          initialSeedHex="#0B6B58"
          themeEngine={generateM3EThemeTokens}
        >
          <M3EPortal container={externalHost}>
            <Dialog open onOpenChange={() => {}} title="RTL Portal Dialog">
              <p>Custom container content</p>
            </Dialog>
            <Popover trigger={<button type="button">Open Popover</button>} open>
              <span data-testid="scoped-popover-body">Popover body</span>
            </Popover>
            <Tooltip content="Helpful tooltip">
              <button type="button" id="scoped-tooltip-trigger">
                Hover
              </button>
            </Tooltip>
          </M3EPortal>
        </M3EProvider>,
      );
    });

    expect(externalHost.getAttribute("dir")).toBeNull();
    expect(externalHost.getAttribute("data-theme")).toBeNull();

    const scopedPortal = externalHost.querySelector<HTMLElement>(
      ".m3e-scope[data-m3e-portal]",
    )!;
    expect(scopedPortal).not.toBeNull();
    expect(scopedPortal.getAttribute("dir")).toBe("rtl");
    expect(scopedPortal.getAttribute("lang")).toBe("ar-SA");
    expect(scopedPortal.getAttribute("data-theme")).toBe("dark");
    expect(scopedPortal.style.getPropertyValue("--m3e-color-primary")).toContain(
      "light-dark(",
    );
    expect(scopedPortal.textContent).toContain("RTL Portal Dialog");
    expect(scopedPortal.textContent).toContain("Popover body");
  });

  it("avoids writing static CSS variables onto documentElement in default static mode and cleans up runtime motion overrides", () => {
    let updateRate: ((rate: number) => void) | undefined;

    function RateProbe() {
      const { setPlaybackRate } = useM3E();
      updateRate = setPlaybackRate;
      return null;
    }

    act(() => {
      dom.root.render(
        <M3EProvider>
          <RateProbe />
        </M3EProvider>,
      );
    });

    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue("--m3e-font-brand")).toBe("");
    expect(rootStyle.getPropertyValue("--m3e-elevation-level1")).toBe("");
    expect(rootStyle.getPropertyValue("--m3e-shape-corner-medium")).toBe("");
    expect(rootStyle.getPropertyValue("--m3e-spatial-fast-duration")).toBe("");

    act(() => {
      updateRate?.(0.5);
    });
    expect(rootStyle.getPropertyValue("--m3e-spatial-fast-duration")).not.toBe("");

    act(() => {
      updateRate?.(1);
    });
    expect(rootStyle.getPropertyValue("--m3e-spatial-fast-duration")).toBe("");
  });

  it("tracks OS prefers-contrast: more and elevates contrastLevel when autoContrast is enabled", () => {
    let contrastMatches = false;
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-contrast: more") ? contrastMatches : false,
      media: query,
      onchange: null,
      addEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => {
        if (query.includes("prefers-contrast: more")) listeners.add(cb);
      },
      removeEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.delete(cb);
      },
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    let latestPrefers = false;
    let latestContrast = 0;

    function ContrastProbe() {
      const { prefersHighContrast, themeTokens } = useM3E();
      latestPrefers = prefersHighContrast;
      latestContrast = themeTokens.contrastLevel;
      return null;
    }

    try {
      act(() => {
        dom.root.render(
          <M3EProvider
            syncDocumentRoot={false}
            autoContrast
            themeEngine={generateM3EThemeTokens}
          >
            <ContrastProbe />
          </M3EProvider>,
        );
      });

      expect(latestPrefers).toBe(false);
      expect(latestContrast).toBe(0);

      contrastMatches = true;
      act(() => {
        for (const cb of listeners) {
          cb({ matches: true } as MediaQueryListEvent);
        }
      });

      expect(latestPrefers).toBe(true);
      expect(latestContrast).toBe(0.5);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("reads theme.autoContrast and theme.customColors from config and preserves them in exportConfigJson", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-contrast: more"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    let capturedBrand: string | undefined;
    let capturedContrast = 0;
    let exportedJson = "";

    function ConfigProbe() {
      const { themeTokens, exportConfigJson } = useM3E();
      capturedBrand = themeTokens.customColors?.brand?.light.color;
      capturedContrast = themeTokens.contrastLevel;
      exportedJson = exportConfigJson();
      return null;
    }

    try {
      act(() => {
        dom.root.render(
          <M3EProvider
            syncDocumentRoot={false}
            config={{
              theme: {
                seed: "#6750A4",
                autoContrast: true,
                customColors: { brand: "#006C51" },
              },
            }}
            themeEngine={generateM3EThemeTokens}
          >
            <ConfigProbe />
          </M3EProvider>,
        );
      });

      expect(capturedBrand).toMatch(/^#[0-9a-f]{6}$/);
      expect(capturedContrast).toBe(0.5);
      const parsed = JSON.parse(exportedJson);
      expect(parsed.theme.autoContrast).toBe(true);
      expect(parsed.theme.customColors).toEqual({ brand: "#006C51" });
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});

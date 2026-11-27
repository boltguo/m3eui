import * as React from "react";
import { Link, useLocation } from "react-router";
import {
  Button,
  Chip,
  DropdownMenu,
  IconButton,
  Kbd,
  type M3EBuiltInLocale,
  MaterialShapeView,
  Tooltip,
  useM3E,
} from "m3eui";
import m3ePkg from "../../../../packages/m3eui/package.json";
import { usePlaygroundStrings } from "../i18n";
import { GITHUB_REPO_URL, GitHubIcon, SearchIcon } from "./Icons";
import { SeedSwatchDot } from "./ThemeStudioSheet";

const LOCALE_MENU_OPTIONS: readonly {
  code: M3EBuiltInLocale;
  shortLabel: string;
  fullLabel: string;
}[] = [
  { code: "en-US", shortLabel: "EN", fullLabel: "English (en-US)" },
  { code: "zh-CN", shortLabel: "中文", fullLabel: "简体中文 (zh-CN)" },
  { code: "ja-JP", shortLabel: "日本語", fullLabel: "日本語 (ja-JP)" },
  { code: "ar-SA", shortLabel: "العربية", fullLabel: "العربية (ar-SA)" },
];

function MenuHamburgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronDownTinyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SlidersStudioIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function ColorModeGlyph({ mode }: { readonly mode: "light" | "dark" | "system" }) {
  if (mode === "system") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="3" width="20" height="14" rx="2.5" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  if (mode === "light") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export function DocsBrandMark({ isScrolled }: { readonly isScrolled?: boolean }) {
  return (
    <span className="docs-brand-mark" aria-hidden="true">
      <MaterialShapeView
        shape={isScrolled ? "clover8Leaf" : "cookie9Sided"}
        size={34}
        scaleFactor={0.95}
        fill="var(--m3e-color-primary)"
      />
      <span className="docs-brand-mark__glyph">M3</span>
    </span>
  );
}

export function SiteHeader({
  onOpenMobileNav,
  onOpenStudio,
  onOpenCommandPalette,
}: {
  readonly onOpenMobileNav: () => void;
  readonly onOpenStudio: () => void;
  readonly onOpenCommandPalette: () => void;
}) {
  const ui = usePlaygroundStrings();
  const {
    seedHex,
    colorMode,
    resolvedColorMode,
    setColorMode,
    locale,
    setLocale,
    setDirectionMode,
  } = useM3E();

  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeLocaleOption = React.useMemo(() => {
    const langPrefix = locale.split(/[-_]/)[0]?.toLowerCase();
    return (
      LOCALE_MENU_OPTIONS.find(
        (opt) => opt.code.split("-")[0]?.toLowerCase() === langPrefix,
      ) ?? LOCALE_MENU_OPTIONS[0]!
    );
  }, [locale]);

  const localeMenuItems = React.useMemo(
    () =>
      LOCALE_MENU_OPTIONS.map((opt) => ({
        id: opt.code,
        label: opt.fullLabel,
        checked: activeLocaleOption.code === opt.code,
        closeOnClick: true,
        onCheckedChange: () => {
          setDirectionMode("auto");
          setLocale(opt.code);
        },
      })),
    [activeLocaleOption.code, setDirectionMode, setLocale],
  );

  const handleToggleColorMode = React.useCallback(() => {
    const targetScheme: "light" | "dark" =
      resolvedColorMode === "dark" ? "light" : "dark";
    const systemPrefersDark =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemScheme: "light" | "dark" = systemPrefersDark ? "dark" : "light";
    setColorMode(targetScheme === systemScheme ? "system" : targetScheme);
  }, [resolvedColorMode, setColorMode]);

  const colorModeTooltipLabel =
    resolvedColorMode === "dark"
      ? `${ui.colorModeLabel}: ${ui.modeDark}${colorMode === "system" ? ` (${ui.modeSystem})` : ""}`
      : `${ui.colorModeLabel}: ${ui.modeLight}${colorMode === "system" ? ` (${ui.modeSystem})` : ""}`;

  const navItems = [
    { to: "/", label: ui.navHome, end: true },
    { to: "/docs", label: ui.navDocs, end: false },
    { to: "/components", label: ui.navComponents, end: false },
    { to: "/blocks", label: ui.navBlocks, end: false },
  ] as const;

  return (
    <header
      className="m3e-site-header"
      data-elevated={isScrolled || undefined}
    >
      <div className="m3e-site-header__inner">
        <div className="m3e-site-header__start">
          <IconButton
            size="sm"
            variant="standard"
            aria-label={ui.openNavDrawer}
            className="docs-mobile-menu-btn"
            icon={<MenuHamburgerIcon />}
            onClick={onOpenMobileNav}
          />
          <Link to="/" className="docs-brand-link">
            <DocsBrandMark isScrolled={isScrolled} />
            <span className="docs-brand__title">m3eui</span>
          </Link>
          <Chip size="sm" tone="primary" className="docs-brand__chip">
            v{m3ePkg.version}
          </Chip>

          <nav aria-label={ui.primaryNavAria} className="m3e-site-nav">
            <ul className="m3e-site-nav__list">
              {navItems.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname === item.to ||
                    location.pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to} className="m3e-site-nav__item">
                    <Button
                      size="xs"
                      variant={isActive ? "tonal" : "text"}
                      render={
                        <Link
                          to={item.to}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                    >
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="docs-header-actions">
          <Button
            size="xs"
            variant="outlined"
            className="m3e-cmd-trigger"
            aria-keyshortcuts="Control+K Meta+K"
            leadingIcon={<SearchIcon size={15} />}
            onClick={onOpenCommandPalette}
          >
            <span className="m3e-cmd-trigger__content">
              <span className="m3e-cmd-trigger__text">{ui.searchBtnLabel}</span>
              <span className="m3e-cmd-trigger__kbd" aria-hidden="true">
                <Kbd size="sm" keys={["mod", "k"]} />
              </span>
            </span>
          </Button>

          <DropdownMenu
            align="end"
            items={localeMenuItems}
            trigger={
              <Button
                size="xs"
                variant="outlined"
                className="docs-locale-btn"
                aria-label={`${activeLocaleOption.shortLabel} — ${ui.languageLabel}`}
                leadingIcon={<GlobeIcon />}
                trailingIcon={<ChevronDownTinyIcon />}
              >
                {activeLocaleOption.shortLabel}
              </Button>
            }
          />

          <Tooltip
            content={colorModeTooltipLabel}
            side="bottom"
          >
            <IconButton
              size="sm"
              variant="standard"
              className="docs-colormode-btn"
              aria-label={colorModeTooltipLabel}
              icon={<ColorModeGlyph mode={resolvedColorMode} />}
              onClick={handleToggleColorMode}
            />
          </Tooltip>

          <Tooltip content={ui.githubTooltip} side="bottom">
            <IconButton
              size="sm"
              variant="standard"
              className="docs-github-btn"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              icon={<GitHubIcon size={18} />}
            />
          </Tooltip>

          <Button
            size="xs"
            variant="tonal"
            className="docs-studio-btn"
            aria-label={ui.studioTitle}
            leadingIcon={<SeedSwatchDot hex={seedHex} />}
            trailingIcon={<SlidersStudioIcon />}
            onClick={onOpenStudio}
          >
            <span className="docs-studio-btn-text">{ui.studioButton}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

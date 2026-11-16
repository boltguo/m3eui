import * as React from "react";
import { Link, useLocation } from "react-router";
import { Button, type NavigationDestination } from "m3eui";
import { usePlaygroundStrings } from "../i18n";

const SECTION_PREFIXES = [
  ["/docs", "/docs/introduction"],
  ["/components", "/components/button"],
  ["/blocks", "/blocks"],
] as const;

export function siteSectionOf(pathname: string): string {
  for (const [prefix, to] of SECTION_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return to;
  }
  return "/";
}

export function useSiteSections(): readonly NavigationDestination<string>[] {
  const ui = usePlaygroundStrings();
  return React.useMemo(
    () => [
      { value: "/", label: ui.navHome },
      { value: "/docs/introduction", label: ui.navDocs },
      { value: "/components/button", label: ui.navComponents },
      { value: "/blocks", label: ui.navBlocks },
    ],
    [ui],
  );
}

export function SiteSectionLinks() {
  const sections = useSiteSections();
  const current = siteSectionOf(useLocation().pathname);
  return (
    <div className="docs-sidebar-sections">
      {sections.map((s) => (
        <Button
          key={s.value}
          size="xs"
          variant={s.value === current ? "tonal" : "text"}
          render={
            <Link
              to={s.value}
              aria-current={s.value === current ? "page" : undefined}
            />
          }
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}

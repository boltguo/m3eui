import * as React from "react";
import { NavigationDrawer, type NavigationDestination } from "m3eui";
import { usePlaygroundStrings } from "../i18n";

export interface TocAnchorItem {
  readonly id: string;
  readonly label: string;
}

export function OnThisPage({
  items,
}: {
  readonly items: readonly TocAnchorItem[];
}) {
  const ui = usePlaygroundStrings();
  const [activeId, setActiveId] = React.useState<string>(items[0]?.id ?? "");

  React.useEffect(() => {
    setActiveId(items[0]?.id ?? "");
  }, [items]);

  const drawerItems = React.useMemo<readonly NavigationDestination<string>[]>(
    () =>
      items.map((item) => ({
        value: item.id,
        label: item.label,
        href: `#${item.id}`,
      })),
    [items],
  );

  if (items.length === 0) return null;

  return (
    <NavigationDrawer
      variant="permanent"
      scrollSpy
      className="m3e-toc-drawer"
      aria-label={ui.onThisPage}
      headline={ui.onThisPage}
      items={drawerItems}
      value={activeId}
      onValueChange={setActiveId}
    />
  );
}

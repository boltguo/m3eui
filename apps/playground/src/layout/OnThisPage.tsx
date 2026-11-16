import * as React from "react";
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
  const ids = items.map((item) => item.id).join(" ");
  const [activeId, setActiveId] = React.useState(items[0]?.id ?? "");

  React.useEffect(() => {
    const idList = ids ? ids.split(" ") : [];
    setActiveId(idList[0] ?? "");
    if (typeof IntersectionObserver === "undefined") return;
    const targets = idList
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);

  if (items.length === 0) return null;

  return (
    <nav className="m3e-toc" aria-label={ui.onThisPage}>
      <div className="m3e-toc__title">{ui.onThisPage}</div>
      <ul className="m3e-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="m3e-toc__link"
              aria-current={item.id === activeId ? "true" : undefined}
              onClick={() => setActiveId(item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

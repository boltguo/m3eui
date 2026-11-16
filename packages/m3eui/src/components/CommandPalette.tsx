"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useM3EI18n } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { parseShortcutKeys } from "../tokens/index.js";
import { Empty } from "./Empty.js";
import { Kbd } from "./Kbd.js";

export interface CommandPaletteItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly icon?: React.ReactNode;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly onSelect: () => void;
}

export interface CommandPaletteGroup {
  readonly id: string;
  readonly heading: string;
  readonly items: readonly CommandPaletteItem[];
}

export interface M3ECommandPaletteProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly groups?: readonly CommandPaletteGroup[];
  readonly items?: readonly CommandPaletteItem[];
  readonly enableShortcut?: boolean;
  readonly placeholder?: string;
  readonly emptyMessage?: React.ReactNode;
  readonly footerHint?: React.ReactNode;
  readonly "aria-label"?: string;
}

function CommandSearchSvg() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function CommandPalette({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  enableShortcut = false,
  "aria-label": ariaLabel,
  ...bodyProps
}: M3ECommandPaletteProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const resolvedAriaLabel = ariaLabel ?? t("command.ariaLabel");

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  React.useEffect(() => {
    if (!enableShortcut) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableShortcut, isOpen, setOpen]);

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={setOpen}>
      <BaseDialog.Portal container={portalContainer}>
        <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
        <BaseDialog.Popup
          aria-label={resolvedAriaLabel}
          className="m3e-command-palette"
        >
          <CommandPaletteBody
            {...bodyProps}
            ariaLabel={resolvedAriaLabel}
            onClose={() => setOpen(false)}
          />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

function CommandPaletteBody({
  groups,
  items = [],
  placeholder,
  emptyMessage,
  footerHint,
  ariaLabel,
  onClose,
}: Pick<
  M3ECommandPaletteProps,
  "groups" | "items" | "placeholder" | "emptyMessage" | "footerHint"
> & {
  readonly ariaLabel: string;
  readonly onClose: () => void;
}): React.JSX.Element {
  const { t } = useM3EI18n();
  const [query, setQuery] = React.useState<string>("");
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const lastCompositionEndAtRef = React.useRef<number>(-Infinity);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const listboxId = React.useId();
  const optionPrefix = React.useId();

  const normalizedGroups = React.useMemo<readonly CommandPaletteGroup[]>(() => {
    const baseGroups: readonly CommandPaletteGroup[] = groups
      ? groups
      : [{ id: "default", heading: "", items }];

    const q = query.trim().toLowerCase();
    if (!q) {
      return baseGroups.filter((g) => g.items.length > 0);
    }

    return baseGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          const haystack = [
            item.label,
            item.description ?? "",
            g.heading,
            ...(item.keywords ?? []),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, items, query]);

  const flatSelectable = React.useMemo(
    () =>
      normalizedGroups
        .flatMap((g) => g.items)
        .filter((item) => !item.disabled),
    [normalizedGroups],
  );

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const clampedActive =
    flatSelectable.length > 0
      ? Math.min(activeIndex, flatSelectable.length - 1)
      : -1;
  const activeItem =
    clampedActive >= 0 ? flatSelectable[clampedActive] : undefined;

  const activeId = activeItem?.id;
  React.useEffect(() => {
    if (activeId === undefined) return;
    listRef.current
      ?.querySelector<HTMLElement>("[data-highlighted]")
      ?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const runItem = (item: CommandPaletteItem) => {
    if (item.disabled) return;
    onClose();
    item.onSelect();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.nativeEvent.isComposing ||
      e.keyCode === 229 ||
      e.nativeEvent.timeStamp - lastCompositionEndAtRef.current < 32
    ) {
      return;
    }
    if (flatSelectable.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatSelectable.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + flatSelectable.length) % flatSelectable.length,
      );
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(flatSelectable.length - 1);
    } else if (e.key === "Enter" && activeItem) {
      e.preventDefault();
      runItem(activeItem);
    }
  };

  return (
    <>
      <div className="m3e-command-palette__input-bar">
        <span className="m3e-command-palette__search-icon" aria-hidden="true">
          <CommandSearchSvg />
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded={true}
          aria-controls={listboxId}
          aria-activedescendant={
            activeItem ? `${optionPrefix}-${activeItem.id}` : undefined
          }
          aria-label={ariaLabel}
          placeholder={placeholder ?? t("command.placeholder")}
          value={query}
          autoFocus
          className="m3e-command-palette__input"
          onCompositionEnd={(e) => {
            lastCompositionEndAtRef.current = e.nativeEvent.timeStamp;
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
      </div>

      <div
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel}
        className="m3e-command-palette__list"
      >
        {normalizedGroups.length === 0 ? (
          <Empty
            compact
            className="m3e-command-palette__empty"
            title={emptyMessage ?? t("command.empty")}
          />
        ) : (
          normalizedGroups.map((group) => (
            <div key={group.id} className="m3e-command-palette__group">
              {group.heading ? (
                <div className="m3e-command-palette__group-heading">
                  {group.heading}
                </div>
              ) : null}
              {group.items.map((item) => {
                const isHighlighted = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    id={`${optionPrefix}-${item.id}`}
                    role="option"
                    aria-selected={isHighlighted}
                    aria-disabled={item.disabled || undefined}
                    className="m3e-command-palette__item"
                    data-highlighted={isHighlighted ? "" : undefined}
                    data-disabled={item.disabled ? "" : undefined}
                    onMouseEnter={() => {
                      if (!item.disabled) {
                        const idx = flatSelectable.findIndex(
                          (s) => s.id === item.id,
                        );
                        if (idx >= 0) setActiveIndex(idx);
                      }
                    }}
                    onClick={() => runItem(item)}
                  >
                    {item.icon ? (
                      <span
                        className="m3e-command-palette__item-icon"
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="m3e-command-palette__item-copy">
                      <span className="m3e-command-palette__item-label">
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="m3e-command-palette__item-desc">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    {item.shortcut ? (
                      <Kbd
                        size="sm"
                        className="m3e-command-palette__kbd"
                        keys={parseShortcutKeys(item.shortcut)}
                      >
                        {item.shortcut}
                      </Kbd>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="m3e-command-palette__footer">
        <span>{footerHint ?? t("command.navigateHint")}</span>
      </div>
    </>
  );
}

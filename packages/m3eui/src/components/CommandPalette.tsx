"use client";

import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useM3EI18n } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import {
  parseShortcutKeys,
} from "../tokens/topology.js";
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

interface CommandEntry {
  readonly item: CommandPaletteItem;
  readonly text: string;
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

  const entries = React.useMemo(
    () =>
      (groups ?? [{ id: "default", heading: "", items }])
        .filter((g) => g.items.length > 0)
        .map((g) => ({
          id: g.id,
          heading: g.heading,
          items: g.items.map<CommandEntry>((item) => ({
            item,
            text: [
              item.label,
              item.description,
              g.heading,
              ...(item.keywords ?? []),
            ]
              .join(" ")
              .toLowerCase(),
          })),
        })),
    [groups, items],
  );

  const runItem = (item: CommandPaletteItem) => {
    onClose();
    item.onSelect();
  };

  return (
    <BaseAutocomplete.Root
      inline
      open
      items={entries}
      autoHighlight="always"
      itemToStringValue={(entry: CommandEntry) => entry.item.label}
      filter={(entry: CommandEntry, query) =>
        entry.text.includes(query.trim().toLowerCase())
      }
    >
      <div className="m3e-command-palette__input-bar">
        <span className="m3e-command-palette__search-icon" aria-hidden="true">
          <CommandSearchSvg />
        </span>
        <BaseAutocomplete.Input
          aria-label={ariaLabel}
          placeholder={placeholder ?? t("command.placeholder")}
          autoFocus
          className="m3e-command-palette__input"
        />
      </div>

      <BaseAutocomplete.Empty>
        <Empty
          compact
          className="m3e-command-palette__empty"
          title={emptyMessage ?? t("command.empty")}
        />
      </BaseAutocomplete.Empty>
      <BaseAutocomplete.List
        aria-label={ariaLabel}
        className="m3e-command-palette__list"
      >
        {(group: (typeof entries)[number]) => (
          <BaseAutocomplete.Group
            key={group.id}
            items={group.items}
            className="m3e-command-palette__group"
          >
            {group.heading ? (
              <BaseAutocomplete.GroupLabel className="m3e-command-palette__group-heading">
                {group.heading}
              </BaseAutocomplete.GroupLabel>
            ) : null}
            <BaseAutocomplete.Collection>
              {(entry: CommandEntry) => {
                const { item } = entry;
                return (
                  <BaseAutocomplete.Item
                    key={item.id}
                    value={entry}
                    disabled={item.disabled}
                    className="m3e-command-palette__item"
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
                  </BaseAutocomplete.Item>
                );
              }}
            </BaseAutocomplete.Collection>
          </BaseAutocomplete.Group>
        )}
      </BaseAutocomplete.List>

      <div className="m3e-command-palette__footer">
        <span>{footerHint ?? t("command.navigateHint")}</span>
      </div>
    </BaseAutocomplete.Root>
  );
}

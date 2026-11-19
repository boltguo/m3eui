"use client";

import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  SEARCH_BAR_TOKENS,
  SEARCH_VIEW_TOKENS,
  SEGMENTED_MENU_TOKENS,
} from "../../tokens/topology.js";
import { useM3ERuntime, useM3EI18n } from "../../context/M3EContext.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { useDropdownItemState } from "../../internal/dropdownItem.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";
import { ClockIcon, CloseIcon } from "../../internal/icons.js";
import { assignRef } from "../../internal/assignRef.js";
import { useAdaptivePositionMethod } from "../../internal/positionMethod.js";
import { useM3ERipple } from "../../internal/ripple.js";

function SearchActionButton({
  type = "button",
  disabled = false,
  ariaLabel,
  className,
  onClick,
  children,
}: {
  readonly type?: "button" | "submit";
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly className: string;
  readonly onClick?: () => void;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      onClick={onClick}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {children}
    </button>
  );
}

function SearchClearTrigger({
  ariaLabel,
  disabled,
}: {
  readonly ariaLabel: string;
  readonly disabled: boolean;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  return (
    <BaseAutocomplete.Clear
      aria-label={ariaLabel}
      className="m3e-search-bar__clear"
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <CloseIcon size={16} strokeWidth={2.3} />
    </BaseAutocomplete.Clear>
  );
}

function SearchViewItemButton({
  id,
  highlighted,
  onClick,
  children,
}: {
  readonly id: string;
  readonly highlighted: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <button
      type="button"
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={highlighted}
      className="m3e-search-view__item"
      data-highlighted={highlighted ? "" : undefined}
      style={{
        borderRadius: `${SEARCH_VIEW_TOKENS.itemRadius}px`,
      }}
      onClick={onClick}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {children}
    </button>
  );
}

export interface SearchSuggestion {
  readonly value: string;
  readonly label: string;
  readonly category?: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
}

export interface M3ESearchBarProps {
  readonly suggestions?: readonly SearchSuggestion[];
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onSearchSubmit?: (query: string) => void;
  readonly placeholder?: string;
  readonly "aria-label"?: string;
  readonly trailingSlot?: React.ReactNode;
  readonly emptyText?: React.ReactNode;
  readonly size?: "md" | "sm";
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function SearchGlassSvg() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7.5" />
      <line x1="20.5" y1="20.5" x2="16.4" y2="16.4" />
    </svg>
  );
}

function SearchSuggestionRow({
  item,
  index,
  onPick,
}: {
  readonly item: SearchSuggestion;
  readonly index: number;
  readonly onPick: (label: string) => void;
}) {
  const count = BaseAutocomplete.useFilteredItems().length;
  const hasDescription = Boolean(item.description);
  const {
    ref,
    rippleRef,
    isPressed,
    interactionHandlers,
    itemStyle,
  } = useDropdownItemState<HTMLDivElement>({
    index,
    count,
    hasDescription,
  });

  return (
    <BaseAutocomplete.Item
      ref={ref}
      value={item}
      onClick={() => onPick(item.label)}
      data-pressed={isPressed ? "" : undefined}
      className="m3e-dropdown-item m3e-search-bar__item"
      style={itemStyle}
      {...interactionHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <span
        className="m3e-dropdown-item__icon m3e-search-bar__item-icon"
        aria-hidden="true"
      >
        {item.icon ?? <ClockIcon size={18} />}
      </span>
      <span className="m3e-dropdown-item__text m3e-search-bar__item-text">
        <span
          className="m3e-dropdown-item__label m3e-search-bar__item-label"
          data-text={item.label}
        >
          {item.label}
        </span>
        {item.description ? (
          <span className="m3e-dropdown-item__desc m3e-search-bar__item-desc">
            {item.description}
          </span>
        ) : null}
      </span>
      {item.category ? (
        <span className="m3e-search-bar__item-tag">{item.category}</span>
      ) : null}
    </BaseAutocomplete.Item>
  );
}

export const SearchBar = React.forwardRef<HTMLFormElement, M3ESearchBarProps>(
  function SearchBar(
    {
      suggestions = [],
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      onSearchSubmit,
      placeholder,
      "aria-label": ariaLabel,
      trailingSlot,
      emptyText,
      size = "md",
      disabled = false,
      className,
      style,
    },
    forwardedRef,
  ): React.JSX.Element {
    const { t } = useM3EI18n();
    const portalContainer = useM3EPortalContainer();
    const resolvedPlaceholder = placeholder ?? t("searchBar.placeholder");
    const resolvedAriaLabel = ariaLabel ?? t("searchBar.ariaLabel");
    const resolvedEmptyText = emptyText ?? t("searchBar.empty");
    const [uncontrolledVal, setUncontrolledVal] =
      React.useState<string>(defaultValue);
    const [popupOpen, setPopupOpen] = React.useState(false);
    const query = controlledValue ?? uncontrolledVal;

    const lastCompositionEndAtRef = React.useRef<number | null>(null);
    const formRef = React.useRef<HTMLFormElement | null>(null);
    const barRef = React.useRef<HTMLDivElement | null>(null);
    const positionMethod = useAdaptivePositionMethod(barRef, popupOpen);

    const setMergedFormRef = React.useCallback(
      (node: HTMLFormElement | null) => {
        formRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef],
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSearchSubmit?.(query.trim());
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (e.nativeEvent.isComposing || e.keyCode === 229) {
          return;
        }
        if (
          lastCompositionEndAtRef.current !== null &&
          Math.abs(e.nativeEvent.timeStamp - lastCompositionEndAtRef.current) <
            50
        ) {
          return;
        }
        const activeOption = e.currentTarget.getAttribute(
          "aria-activedescendant",
        );
        if (!activeOption) {
          e.preventDefault();
          formRef.current?.requestSubmit();
        }
      }
    };

    return (
      <form
        ref={setMergedFormRef}
        role="search"
        onSubmit={handleSubmit}
        className={
          className ? `m3e-search-bar-form ${className}` : "m3e-search-bar-form"
        }
        style={style}
      >
        <BaseAutocomplete.Root
          items={suggestions}
          disabled={disabled}
          value={controlledValue}
          defaultValue={defaultValue}
          openOnInputClick={suggestions.length > 0}
          onOpenChange={setPopupOpen}
          itemToStringValue={(item) => item.label}
          onValueChange={(next) => {
            if (controlledValue === undefined) {
              setUncontrolledVal(next);
            }
            onValueChange?.(next);
          }}
        >
          <div
            ref={barRef}
            className="m3e-search-bar"
            data-size={size}
            data-disabled={disabled ? "" : undefined}
            style={{
              minHeight: `${size === "sm" ? 40 : SEARCH_BAR_TOKENS.height}px`,
              borderRadius: `${SEARCH_BAR_TOKENS.radius}px`,
              paddingInline: `${size === "sm" ? 12 : SEARCH_BAR_TOKENS.horizontalPadding}px`,
            }}
          >
            <SearchActionButton
              type="submit"
              disabled={disabled}
              ariaLabel={t("searchBar.submit")}
              className="m3e-search-bar__submit-icon"
            >
              <SearchGlassSvg />
            </SearchActionButton>

            <BaseAutocomplete.Input
              disabled={disabled}
              placeholder={resolvedPlaceholder}
              aria-label={resolvedAriaLabel}
              className="m3e-search-bar__input"
              onCompositionEnd={(e) => {
                lastCompositionEndAtRef.current = e.nativeEvent.timeStamp;
              }}
              onKeyDown={handleInputKeyDown}
            />

            <div className="m3e-search-bar__actions">
              {query.length > 0 ? (
                <SearchClearTrigger
                  ariaLabel={t("searchBar.clear")}
                  disabled={disabled}
                />
              ) : null}
              {trailingSlot}
            </div>
          </div>

          {suggestions.length > 0 ? (
            <BaseAutocomplete.Portal container={portalContainer}>
              <BaseAutocomplete.Positioner
                positionMethod={positionMethod}
                anchor={barRef}
                sideOffset={6}
                align="start"
                className="m3e-search-bar__positioner"
              >
                <BaseAutocomplete.Popup
                  className="m3e-dropdown-popup m3e-search-bar__popup"
                  style={{
                    borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
                  }}
                >
                  <BaseAutocomplete.Empty className="m3e-dropdown-empty m3e-search-bar__empty">
                    {resolvedEmptyText}
                  </BaseAutocomplete.Empty>
                  <BaseAutocomplete.List
                    className="m3e-dropdown-list m3e-search-bar__list"
                    style={{
                      padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                    }}
                  >
                    {(item: SearchSuggestion, index: number) => (
                      <SearchSuggestionRow
                        key={item.value}
                        item={item}
                        index={index}
                        onPick={(label) => onSearchSubmit?.(label)}
                      />
                    )}
                  </BaseAutocomplete.List>
                </BaseAutocomplete.Popup>
              </BaseAutocomplete.Positioner>
            </BaseAutocomplete.Portal>
          ) : null}
        </BaseAutocomplete.Root>
      </form>
    );
  },
);

export interface M3ESearchViewProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly anchorRef?: React.RefObject<HTMLElement | null>;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onSearchSubmit?: (query: string) => void;
  readonly recentSearches?: readonly string[];
  readonly onClearRecent?: () => void;
  readonly suggestions?: readonly SearchSuggestion[];
  readonly placeholder?: string;
  readonly "aria-label"?: string;
  readonly trailingSlot?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function BackArrowSvg({ rtl }: { readonly rtl: boolean }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={rtl ? { transform: "scaleX(-1)" } : undefined}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function SearchViewSurface({
  anchorRef,
  query,
  setQuery,
  onClose,
  onSearchSubmit,
  recentSearches,
  onClearRecent,
  suggestions,
  placeholder,
  ariaLabel,
  trailingSlot,
  children,
  className,
  style,
}: {
  readonly anchorRef?: React.RefObject<HTMLElement | null>;
  readonly query: string;
  readonly setQuery: (val: string) => void;
  readonly onClose: () => void;
  readonly onSearchSubmit?: (q: string) => void;
  readonly recentSearches: readonly string[];
  readonly onClearRecent?: () => void;
  readonly suggestions: readonly SearchSuggestion[];
  readonly placeholder: string;
  readonly ariaLabel: string;
  readonly trailingSlot?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}) {
  const { direction, prefersReducedMotion: reducedMotion, t } = useM3ERuntime();
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const lastCompositionEndAtRef = React.useRef<number>(-Infinity);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const optionPrefix = React.useId();

  useIsoLayoutEffect(() => {
    const surfaceEl = surfaceRef.current;
    const anchorEl = anchorRef?.current;
    inputRef.current?.focus();
    if (
      !surfaceEl ||
      !anchorEl ||
      reducedMotion ||
      typeof surfaceEl.animate !== "function"
    ) {
      return;
    }
    const anchorRect = anchorEl.getBoundingClientRect();
    const surfaceRect = surfaceEl.getBoundingClientRect();
    if (
      anchorRect.width <= 0 ||
      anchorRect.height <= 0 ||
      surfaceRect.width <= 0 ||
      surfaceRect.height <= 0
    ) {
      return;
    }
    const dx = anchorRect.left - surfaceRect.left;
    const dy = anchorRect.top - surfaceRect.top;
    const sx = Math.max(0.2, anchorRect.width / surfaceRect.width);
    const sy = Math.max(0.12, anchorRect.height / surfaceRect.height);

    const anim = surfaceEl.animate(
      [
        {
          transformOrigin: "top left",
          transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`,
          borderRadius: `${SEARCH_BAR_TOKENS.radius}px`,
          opacity: 0.86,
        },
        {
          transformOrigin: "top left",
          transform: "translate(0px, 0px) scale(1, 1)",
          opacity: 1,
        },
      ],
      {
        duration: 320,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
      },
    );
    return () => anim.cancel();
  }, [anchorRef, reducedMotion]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSuggestions = React.useMemo(() => {
    if (!normalizedQuery) return suggestions;
    return suggestions.filter(
      (item) =>
        item.label.toLowerCase().includes(normalizedQuery) ||
        (item.description?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (item.category?.toLowerCase().includes(normalizedQuery) ?? false),
    );
  }, [suggestions, normalizedQuery]);

  const navTargets = React.useMemo(() => {
    const out: Array<{ readonly id: string; readonly label: string }> = [];
    if (!normalizedQuery) {
      recentSearches.forEach((item, idx) => {
        out.push({ id: `recent-${idx}`, label: item });
      });
    }
    filteredSuggestions.forEach((item, idx) => {
      out.push({ id: `sugg-${idx}-${item.value}`, label: item.label });
    });
    return out;
  }, [normalizedQuery, recentSearches, filteredSuggestions]);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const clampedActiveIndex =
    activeIndex >= 0 && activeIndex < navTargets.length ? activeIndex : -1;
  const recentListShown = !normalizedQuery && recentSearches.length > 0;
  const activeTarget =
    clampedActiveIndex >= 0 ? navTargets[clampedActiveIndex] : undefined;

  const submitQuery = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onSearchSubmit?.(trimmed);
  };

  return (
    <div
      ref={surfaceRef}
      className={className ? `m3e-search-view ${className}` : "m3e-search-view"}
      style={style}
    >
      <form
        role="search"
        className="m3e-search-view__header"
        style={{ minHeight: `${SEARCH_VIEW_TOKENS.headerHeight}px` }}
        onSubmit={(e) => {
          e.preventDefault();
          submitQuery(query);
        }}
      >
        <SearchActionButton
          ariaLabel={t("searchView.back")}
          className="m3e-search-view__back"
          onClick={onClose}
        >
          <BackArrowSvg rtl={direction === "rtl"} />
        </SearchActionButton>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={recentListShown || filteredSuggestions.length > 0}
          aria-controls={
            [
              recentListShown ? `${optionPrefix}-recent` : "",
              filteredSuggestions.length > 0 ? `${optionPrefix}-sugg` : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-activedescendant={
            activeTarget ? `${optionPrefix}-${activeTarget.id}` : undefined
          }
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="m3e-search-view__input"
          onCompositionEnd={(e) => {
            lastCompositionEndAtRef.current = e.nativeEvent.timeStamp;
          }}
          onKeyDown={(e) => {
            if (
              e.nativeEvent.isComposing ||
              e.keyCode === 229 ||
              e.nativeEvent.timeStamp - lastCompositionEndAtRef.current < 32
            ) {
              if (e.key === "Enter") {
                e.preventDefault();
              }
              return;
            }
            if (e.key === "ArrowDown" && navTargets.length > 0) {
              e.preventDefault();
              setActiveIndex((prev) =>
                prev < 0 ? 0 : (prev + 1) % navTargets.length,
              );
            } else if (e.key === "ArrowUp" && navTargets.length > 0) {
              e.preventDefault();
              setActiveIndex((prev) =>
                prev <= 0 ? navTargets.length - 1 : prev - 1,
              );
            } else if (e.key === "Enter" && activeTarget) {
              e.preventDefault();
              setQuery(activeTarget.label);
              submitQuery(activeTarget.label);
            }
          }}
        />

        <div className="m3e-search-view__actions">
          {query.length > 0 ? (
            <SearchActionButton
              ariaLabel={t("searchBar.clear")}
              className="m3e-search-bar__clear"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <CloseIcon size={16} strokeWidth={2.3} />
            </SearchActionButton>
          ) : null}
          {trailingSlot}
        </div>
      </form>

      <div className="m3e-search-view__body">
        {recentListShown ? (
          <div className="m3e-search-view__section">
            <div className="m3e-search-view__section-header">
              <span className="m3e-search-view__section-title">
                {t("searchView.recentHeading")}
              </span>
              {onClearRecent ? (
                <SearchActionButton
                  className="m3e-search-view__clear-recent"
                  onClick={onClearRecent}
                >
                  {t("searchView.clearRecent")}
                </SearchActionButton>
              ) : null}
            </div>
            <ul
              role="listbox"
              id={`${optionPrefix}-recent`}
              aria-label={t("searchView.recentHeading")}
              className="m3e-search-view__list"
            >
              {recentSearches.map((item, idx) => {
                const targetId = `recent-${idx}`;
                const isHighlighted = activeTarget?.id === targetId;
                return (
                  <li role="presentation" key={item}>
                    <SearchViewItemButton
                      id={`${optionPrefix}-${targetId}`}
                      highlighted={isHighlighted}
                      onClick={() => {
                        setQuery(item);
                        submitQuery(item);
                      }}
                    >
                      <span
                        className="m3e-dropdown-item__icon m3e-search-bar__item-icon"
                        aria-hidden="true"
                      >
                        <ClockIcon size={17} />
                      </span>
                      <span className="m3e-dropdown-item__label m3e-search-bar__item-label">
                        {item}
                      </span>
                    </SearchViewItemButton>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {filteredSuggestions.length > 0 ? (
          <div className="m3e-search-view__section">
            <div className="m3e-search-view__section-header">
              <span className="m3e-search-view__section-title">
                {t("searchView.suggestionsHeading")}
              </span>
            </div>
            <ul
              role="listbox"
              id={`${optionPrefix}-sugg`}
              aria-label={t("searchView.suggestionsHeading")}
              className="m3e-search-view__list"
            >
              {filteredSuggestions.map((item, idx) => {
                const targetId = `sugg-${idx}-${item.value}`;
                const isHighlighted = activeTarget?.id === targetId;
                return (
                  <li role="presentation" key={item.value}>
                    <SearchViewItemButton
                      id={`${optionPrefix}-${targetId}`}
                      highlighted={isHighlighted}
                      onClick={() => {
                        setQuery(item.label);
                        submitQuery(item.label);
                      }}
                    >
                      <span
                        className="m3e-dropdown-item__icon m3e-search-bar__item-icon"
                        aria-hidden="true"
                      >
                        {item.icon ?? <SearchGlassSvg />}
                      </span>
                      <span className="m3e-dropdown-item__text m3e-search-bar__item-body">
                        <span className="m3e-dropdown-item__label m3e-search-bar__item-label">
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="m3e-dropdown-item__desc m3e-search-bar__item-desc">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                      {item.category ? (
                        <span className="m3e-search-bar__item-tag m3e-search-bar__item-category">
                          {item.category}
                        </span>
                      ) : null}
                    </SearchViewItemButton>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : normalizedQuery && !children ? (
          <div className="m3e-dropdown-empty m3e-search-bar__empty">
            {t("searchBar.empty")}
          </div>
        ) : null}

        {children ? (
          <div className="m3e-search-view__custom">{children}</div>
        ) : null}
      </div>
    </div>
  );
}

export function SearchView({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  anchorRef,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onSearchSubmit,
  recentSearches = [],
  onClearRecent,
  suggestions = [],
  placeholder,
  "aria-label": ariaLabel,
  trailingSlot,
  children,
  className,
  style,
}: M3ESearchViewProps): React.JSX.Element | null {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const [uncontrolledQuery, setUncontrolledQuery] =
    React.useState<string>(defaultValue);

  const isOpen = controlledOpen ?? uncontrolledOpen;
  const query = controlledValue ?? uncontrolledQuery;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
    if (!next && anchorRef?.current) {
      const target =
        anchorRef.current.querySelector<HTMLElement>("input") ??
        anchorRef.current.querySelector<HTMLElement>("button") ??
        anchorRef.current;
      queueMicrotask(() => target.focus());
    }
  };

  const setQuery = (next: string) => {
    if (controlledValue === undefined) {
      setUncontrolledQuery(next);
    }
    onValueChange?.(next);
  };

  const resolvedPlaceholder = placeholder ?? t("searchBar.placeholder");
  const resolvedAriaLabel = ariaLabel ?? t("searchBar.ariaLabel");

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={setOpen}>
      <BaseDialog.Portal container={portalContainer}>
        <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
        <BaseDialog.Popup
          aria-label={resolvedAriaLabel}
          className="m3e-search-view__modal-popup"
        >
          <SearchViewSurface
            anchorRef={anchorRef}
            query={query}
            setQuery={setQuery}
            onClose={() => setOpen(false)}
            onSearchSubmit={onSearchSubmit}
            recentSearches={recentSearches}
            onClearRecent={onClearRecent}
            suggestions={suggestions}
            placeholder={resolvedPlaceholder}
            ariaLabel={resolvedAriaLabel}
            trailingSlot={trailingSlot}
            className={className}
            style={style}
          >
            {children}
          </SearchViewSurface>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

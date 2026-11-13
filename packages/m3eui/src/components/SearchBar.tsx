import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { SEARCH_BAR_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

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
  /** `"md"` (`56px`, standard M3E search bar) or `"sm"` (`40px`, compact app-bar embedded search) */
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

function ClearCrossSvg() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function HistoryClockSvg() {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

function SearchSuggestionRow({
  item,
  onPick,
}: {
  readonly item: SearchSuggestion;
  readonly onPick: (label: string) => void;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(false);
  const radius = useM3EScalarSpring(
    isPressed
      ? SEARCH_BAR_TOKENS.itemPressedRadius
      : SEARCH_BAR_TOKENS.itemRadius,
    "fastSpatial",
  );

  return (
    <BaseAutocomplete.Item
      value={item}
      onClick={() => onPick(item.label)}
      className="m3e-search-bar__item"
      style={{
        borderRadius: `${Math.max(6, radius).toFixed(1)}px`,
      }}
      {...pressHandlers}
    >
      <span className="m3e-search-bar__item-icon" aria-hidden="true">
        {item.icon ?? <HistoryClockSvg />}
      </span>
      <span className="m3e-search-bar__item-text">
        <span className="m3e-search-bar__item-label">{item.label}</span>
        {item.description ? (
          <span className="m3e-search-bar__item-desc">{item.description}</span>
        ) : null}
      </span>
      {item.category ? (
        <span className="m3e-search-bar__item-tag">{item.category}</span>
      ) : null}
    </BaseAutocomplete.Item>
  );
}

export function SearchBar({
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
}: M3ESearchBarProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedPlaceholder = placeholder ?? t("searchBar.placeholder");
  const resolvedAriaLabel = ariaLabel ?? t("searchBar.ariaLabel");
  const resolvedEmptyText = emptyText ?? t("searchBar.empty");
  const [uncontrolledVal, setUncontrolledVal] =
    React.useState<string>(defaultValue);
  const query = controlledValue ?? uncontrolledVal;

  // Safari WebKit IME compositionend -> keydown timestamp inversion guard (per modern-web-guidance `ime-safe-enter-submit`)
  const lastCompositionEndAtRef = React.useRef<number | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchSubmit?.(query.trim());
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Block premature submission while CJK IME is confirming candidate conversion
      if (e.nativeEvent.isComposing || e.keyCode === 229) {
        return;
      }
      if (
        lastCompositionEndAtRef.current !== null &&
        Math.abs(e.nativeEvent.timeStamp - lastCompositionEndAtRef.current) < 50
      ) {
        return;
      }
      // If no popup item is highlighted, submit the search form cleanly
      const activeOption = e.currentTarget.getAttribute("aria-activedescendant");
      if (!activeOption) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
  };

  return (
    <form
      ref={formRef}
      role="search"
      onSubmit={handleSubmit}
      className={
        className ? `m3e-search-bar-form ${className}` : "m3e-search-bar-form"
      }
      style={style}
    >
      <BaseAutocomplete.Root
        items={suggestions}
        value={controlledValue}
        defaultValue={defaultValue}
        openOnInputClick={suggestions.length > 0}
        itemToStringValue={(item) => item.label}
        onValueChange={(next) => {
          if (controlledValue === undefined) {
            setUncontrolledVal(next);
          }
          onValueChange?.(next);
        }}
      >
        <div
          className="m3e-search-bar"
          data-size={size}
          data-disabled={disabled ? "" : undefined}
          style={{
            minHeight: `${size === "sm" ? 40 : SEARCH_BAR_TOKENS.height}px`,
            borderRadius: `${SEARCH_BAR_TOKENS.radius}px`,
            paddingInline: `${size === "sm" ? 12 : SEARCH_BAR_TOKENS.horizontalPadding}px`,
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            aria-label={t("searchBar.submit")}
            className="m3e-search-bar__submit-icon"
          >
            <SearchGlassSvg />
          </button>

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
              <BaseAutocomplete.Clear
                aria-label={t("searchBar.clear")}
                className="m3e-search-bar__clear"
              >
                <ClearCrossSvg />
              </BaseAutocomplete.Clear>
            ) : null}
            {trailingSlot}
          </div>
        </div>

        {suggestions.length > 0 ? (
          <BaseAutocomplete.Portal>
            <BaseAutocomplete.Positioner
              sideOffset={6}
              align="start"
              className="m3e-search-bar__positioner"
            >
              <BaseAutocomplete.Popup
                className="m3e-search-bar__popup"
                style={{
                  borderRadius: `${SEARCH_BAR_TOKENS.popupRadius}px`,
                  padding: `${SEARCH_BAR_TOKENS.popupPadding}px`,
                }}
              >
                <BaseAutocomplete.Empty className="m3e-search-bar__empty">
                  {resolvedEmptyText}
                </BaseAutocomplete.Empty>
                <BaseAutocomplete.List className="m3e-search-bar__list">
                  {(item: SearchSuggestion) => (
                    <SearchSuggestionRow
                      key={item.value}
                      item={item}
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
}

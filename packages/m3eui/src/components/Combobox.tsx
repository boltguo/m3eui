import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { SELECT_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export interface ComboboxOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface M3EComboboxProps {
  readonly options: readonly ComboboxOption[];
  readonly value?: ComboboxOption | null;
  readonly defaultValue?: ComboboxOption | null;
  readonly onValueChange?: (option: ComboboxOption | null) => void;
  readonly label?: React.ReactNode;
  readonly placeholder?: string;
  readonly emptyMessage?: React.ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function SearchSvg() {
  return (
    <svg
      width={17}
      height={17}
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

function ClearSvg() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckSvg() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ComboboxOptionRow({
  option,
  isSelected,
}: {
  readonly option: ComboboxOption;
  readonly isSelected: boolean;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(option.disabled));
  const targetRadius = isPressed
    ? SELECT_TOKENS.itemPressedRadius
    : isSelected
      ? SELECT_TOKENS.itemSelectedRadius
      : SELECT_TOKENS.itemRadius;

  const radius = useM3EScalarSpring(targetRadius, "fastSpatial");
  const hasDescription = Boolean(option.description);

  return (
    <BaseCombobox.Item
      value={option}
      disabled={option.disabled}
      className="m3e-select__item"
      style={{
        minHeight: hasDescription ? "56px" : "42px",
        paddingBlock: hasDescription ? "10px" : "8px",
        paddingInline: "12px",
        borderRadius: `${Math.max(4, radius).toFixed(1)}px`,
      }}
      {...pressHandlers}
    >
      <span className="m3e-select__item-text">
        <span className="m3e-select__item-label">{option.label}</span>
        {option.description ? (
          <span className="m3e-select__item-desc">{option.description}</span>
        ) : null}
      </span>
      <BaseCombobox.ItemIndicator className="m3e-select__item-check">
        <CheckSvg />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

export function Combobox({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  label,
  placeholder,
  emptyMessage,
  disabled = false,
  required = false,
  name,
  id,
  className,
  style,
}: M3EComboboxProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedPlaceholder = placeholder ?? t("combobox.placeholder");
  const resolvedEmptyMessage = emptyMessage ?? t("combobox.empty");
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<ComboboxOption | null>(defaultValue ?? null);
  const currentValue =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;

  return (
    <div
      className={className ? `m3e-combobox ${className}` : "m3e-combobox"}
      style={style}
    >
      <BaseCombobox.Root
        items={options}
        value={controlledValue}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        name={name}
        autoHighlight
        isItemEqualToValue={(a, b) => a.value === b.value}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        onValueChange={(next) => {
          const resolved = next ?? null;
          if (controlledValue === undefined) {
            setUncontrolledValue(resolved);
          }
          onValueChange?.(resolved);
        }}
      >
        {label ? (
          <label htmlFor={inputId} className="m3e-field__label">
            {label}
          </label>
        ) : null}

        <div
          className="m3e-combobox__shell"
          style={{
            minHeight: `${SELECT_TOKENS.outlinedHeight}px`,
            borderRadius: `${SELECT_TOKENS.outlinedRadius}px`,
          }}
        >
          <span className="m3e-text-field__affix" aria-hidden="true">
            <SearchSvg />
          </span>
          <BaseCombobox.Input
            id={inputId}
            placeholder={resolvedPlaceholder}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="m3e-combobox__input"
          />
          <BaseCombobox.Clear
            aria-label={t("combobox.clear")}
            className="m3e-text-field__icon-btn m3e-combobox__clear"
          >
            <ClearSvg />
          </BaseCombobox.Clear>
        </div>

        <BaseCombobox.Portal>
          <BaseCombobox.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-select__positioner"
          >
            <BaseCombobox.Popup
              className="m3e-select__popup m3e-combobox__popup"
              style={{
                borderRadius: `${SELECT_TOKENS.popupRadius}px`,
                padding: `${SELECT_TOKENS.popupPadding}px`,
              }}
            >
              <BaseCombobox.Empty className="m3e-combobox__empty">
                {resolvedEmptyMessage}
              </BaseCombobox.Empty>
              <BaseCombobox.List
                className="m3e-select__list"
                style={{ gap: `${SELECT_TOKENS.itemGap}px` }}
              >
                {(option: ComboboxOption) => (
                  <ComboboxOptionRow
                    key={option.value}
                    option={option}
                    isSelected={currentValue?.value === option.value}
                  />
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </div>
  );
}

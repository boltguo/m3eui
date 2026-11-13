import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { SELECT_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import {
  useM3ECornerSpringRef,
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
  readonly variant?: "outlined" | "filled";
  readonly labelPosition?: "floating" | "outside";
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
  const targetRadius = Math.max(
    4,
    isPressed
      ? SELECT_TOKENS.itemPressedRadius
      : isSelected
        ? SELECT_TOKENS.itemSelectedRadius
        : SELECT_TOKENS.itemRadius,
  );

  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    isSelected ? "fastSpatial" : "defaultEffects",
  );
  const hasDescription = Boolean(option.description);

  return (
    <BaseCombobox.Item
      ref={ref}
      value={option}
      disabled={option.disabled}
      className="m3e-select__item"
      style={{
        minHeight: hasDescription ? "56px" : "42px",
        paddingBlock: hasDescription ? "10px" : "8px",
        paddingInline: "12px",
        borderRadius: borderRadiusCss,
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
  variant = "outlined",
  labelPosition = "floating",
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
  const [inputText, setInputText] = React.useState<string>(
    defaultValue?.label ?? "",
  );
  const [isFocused, setIsFocused] = React.useState(false);

  const currentValue =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const isLabelFloated =
    isFocused || currentValue !== null || inputText.length > 0;

  const height = isFloatingLabel
    ? variant === "filled"
      ? SELECT_TOKENS.filledHeight
      : SELECT_TOKENS.outlinedHeight
    : 48;

  const baseRadius = isFloatingLabel
    ? variant === "filled"
      ? SELECT_TOKENS.filledTopRadius
      : SELECT_TOKENS.outlinedRadius
    : SELECT_TOKENS.outsideLabelRadius;

  const containerRadius =
    variant === "filled"
      ? `${baseRadius}px ${baseRadius}px ${SELECT_TOKENS.filledBottomRadius}px ${SELECT_TOKENS.filledBottomRadius}px`
      : `${baseRadius}px`;

  return (
    <div
      className={className ? `m3e-combobox ${className}` : "m3e-combobox"}
      data-label-position={labelPosition}
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
        onInputValueChange={(val) => setInputText(val)}
        onValueChange={(next) => {
          const resolved = next ?? null;
          if (controlledValue === undefined) {
            setUncontrolledValue(resolved);
          }
          onValueChange?.(resolved);
        }}
      >
        {label && !isFloatingLabel ? (
          <label htmlFor={inputId} className="m3e-field__label">
            {label}
            {required ? (
              <span className="m3e-field__required" aria-hidden="true">
                {" "}*
              </span>
            ) : null}
          </label>
        ) : null}

        <div
          className="m3e-combobox__shell"
          data-variant={variant}
          data-label-position={labelPosition}
          data-floating={isLabelFloated ? "" : undefined}
          data-has-leading=""
          style={{
            minHeight: `${height}px`,
            borderRadius: containerRadius,
          }}
        >
          {isFloatingLabel && variant === "outlined" ? (
            <fieldset
              aria-hidden="true"
              className="m3e-field__outline"
              data-floating={isLabelFloated ? "" : undefined}
            >
              <legend className="m3e-field__outline-legend">
                <span>
                  {label}
                  {required ? " *" : ""}
                </span>
              </legend>
            </fieldset>
          ) : null}

          <span className="m3e-text-field__affix" aria-hidden="true">
            <SearchSvg />
          </span>

          <div className="m3e-text-field__control-stack">
            {isFloatingLabel ? (
              <label
                htmlFor={inputId}
                className="m3e-field__floating-label"
                data-floating={isLabelFloated ? "" : undefined}
              >
                {label}
                {required ? (
                  <span className="m3e-field__required" aria-hidden="true">
                    {" "}*
                  </span>
                ) : null}
              </label>
            ) : null}
            <BaseCombobox.Input
              id={inputId}
              placeholder={resolvedPlaceholder}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="m3e-combobox__input"
            />
          </div>

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

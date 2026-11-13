import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { SELECT_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export type SelectVariant = "outlined" | "filled";
export type SelectLabelPosition = "floating" | "outside";

export interface SelectOption<Value extends string = string> {
  readonly value: Value;
  readonly label: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly disabled?: boolean;
}

export interface M3ESelectProps<Value extends string = string> {
  readonly options: readonly SelectOption<Value>[];
  readonly value?: Value | null;
  readonly defaultValue?: Value | null;
  readonly onValueChange?: (value: Value | null) => void;
  readonly variant?: SelectVariant;
  readonly labelPosition?: SelectLabelPosition;
  readonly label?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function ChevronSvg() {
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
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckMarkSvg() {
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

interface SelectOptionRowProps<Value extends string> {
  readonly option: SelectOption<Value>;
  readonly isSelected: boolean;
}

function SelectOptionRow<Value extends string>({
  option,
  isSelected,
}: SelectOptionRowProps<Value>) {
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
    <BaseSelect.Item
      ref={ref}
      value={option.value}
      disabled={option.disabled}
      className="m3e-select__item"
      data-has-desc={hasDescription ? "" : undefined}
      style={{
        minHeight: hasDescription ? "56px" : "42px",
        paddingBlock: hasDescription ? "10px" : "8px",
        paddingInline: "12px",
        borderRadius: borderRadiusCss,
      }}
      {...pressHandlers}
    >
      {option.icon ? (
        <span className="m3e-select__item-icon" aria-hidden="true">
          {option.icon}
        </span>
      ) : null}
      <span className="m3e-select__item-text">
        <BaseSelect.ItemText className="m3e-select__item-label">
          {option.label}
        </BaseSelect.ItemText>
        {option.description ? (
          <span className="m3e-select__item-desc">{option.description}</span>
        ) : null}
      </span>
      <BaseSelect.ItemIndicator className="m3e-select__item-check">
        <CheckMarkSvg />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export function Select<Value extends string = string>({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  variant = "outlined",
  labelPosition = "floating",
  label,
  placeholder,
  disabled = false,
  required = false,
  name,
  id,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ESelectProps<Value>): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedPlaceholder = placeholder ?? t("select.placeholder");
  const [isOpen, setIsOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<Value | null>(
    defaultValue ?? null,
  );
  const currentValue =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const hasSelection =
    currentValue !== null &&
    currentValue !== undefined &&
    String(currentValue).length > 0;
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const isLabelFloated = isOpen || hasSelection;

  const chevronDeg = useM3EScalarSpring(isOpen ? 180 : 0, "fastSpatial");

  const generatedId = React.useId();
  const triggerId = id ?? generatedId;

  const itemsMap = React.useMemo(
    () => options.map((o) => ({ value: o.value, label: o.label })),
    [options],
  );

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

  const triggerRadius =
    variant === "filled"
      ? `${baseRadius}px ${baseRadius}px ${SELECT_TOKENS.filledBottomRadius}px ${SELECT_TOKENS.filledBottomRadius}px`
      : `${baseRadius}px`;

  return (
    <div
      className={className ? `m3e-select-field ${className}` : "m3e-select-field"}
      data-label-position={labelPosition}
      data-disabled={disabled ? "" : undefined}
      style={style}
    >
      {label && !isFloatingLabel ? (
        <label htmlFor={triggerId} className="m3e-field__label">
          {label}
          {required ? (
            <span className="m3e-field__required" aria-hidden="true">
              {" "}*
            </span>
          ) : null}
        </label>
      ) : null}
      <BaseSelect.Root
        id={triggerId}
        name={name}
        items={itemsMap}
        value={controlledValue}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        modal={false}
        onOpenChange={(next) => setIsOpen(next)}
        onValueChange={(next) => {
          const resolved = (next as Value | null) ?? null;
          if (controlledValue === undefined) {
            setUncontrolledValue(resolved);
          }
          onValueChange?.(resolved);
        }}
      >
        <div
          className="m3e-select__shell"
          data-variant={variant}
          data-label-position={labelPosition}
          data-floating={isLabelFloated ? "" : undefined}
          data-popup-open={isOpen ? "" : undefined}
        >
          {isFloatingLabel ? (
            <label
              htmlFor={triggerId}
              className="m3e-field__floating-label m3e-select__floating-label"
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

          <BaseSelect.Trigger
            aria-label={!label ? ariaLabel ?? resolvedPlaceholder : undefined}
            className="m3e-select__trigger"
            data-variant={variant}
            data-label-position={labelPosition}
            data-floating={isLabelFloated ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
              borderRadius: triggerRadius,
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

            <BaseSelect.Value
              placeholder={resolvedPlaceholder}
              className="m3e-select__value"
            />
            <BaseSelect.Icon
              className="m3e-select__chevron"
              style={{ rotate: `${chevronDeg.toFixed(1)}deg` }}
            >
              <ChevronSvg />
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
        </div>

        <BaseSelect.Portal>
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-select__positioner"
          >
            <BaseSelect.Popup
              className="m3e-select__popup"
              style={{
                borderRadius: `${SELECT_TOKENS.popupRadius}px`,
                padding: `${SELECT_TOKENS.popupPadding}px`,
              }}
            >
              <BaseSelect.List
                className="m3e-select__list"
                style={{ gap: `${SELECT_TOKENS.itemGap}px` }}
              >
                {options.map((opt) => (
                  <SelectOptionRow
                    key={opt.value}
                    option={opt}
                    isSelected={currentValue === opt.value}
                  />
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
}

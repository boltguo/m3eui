import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import {
  SEGMENTED_MENU_TOKENS,
  SELECT_TOKENS,
  resolveSegmentedMenuItemCorners,
} from "../tokens/topology.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { useM3EI18n } from "../context/M3EContext.js";
import { formatLocalizedInteger } from "../i18n/index.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../internal/fieldOutline.js";

export type SelectVariant = "outlined" | "filled";
export type SelectLabelPosition = "floating" | "outside";

export interface SelectOption<Value extends string = string> {
  readonly value: Value;
  readonly label: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly disabled?: boolean;
}

export interface SelectOptionGroup<Value extends string = string> {
  readonly label: string;
  readonly options: readonly SelectOption<Value>[];
}

interface SelectBaseProps<Value extends string> {
  readonly options?: readonly SelectOption<Value>[];
  readonly groups?: readonly SelectOptionGroup<Value>[];
  readonly variant?: SelectVariant;
  readonly labelPosition?: SelectLabelPosition;
  readonly label?: string;
  readonly placeholder?: string;
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly clearable?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ESelectSingleProps<Value extends string = string>
  extends SelectBaseProps<Value> {
  readonly multiple?: false;
  readonly value?: Value | null;
  readonly defaultValue?: Value | null;
  readonly onValueChange?: (value: Value | null) => void;
}

export interface M3ESelectMultipleProps<Value extends string = string>
  extends SelectBaseProps<Value> {
  readonly multiple: true;
  readonly value?: readonly Value[];
  readonly defaultValue?: readonly Value[];
  readonly onValueChange?: (value: Value[]) => void;
  readonly maxVisibleTags?: number;
}

export type M3ESelectProps<Value extends string = string> =
  | M3ESelectSingleProps<Value>
  | M3ESelectMultipleProps<Value>;

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
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

function ClearSvg() {
  return (
    <svg
      width={14}
      height={14}
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
  readonly index: number;
  readonly count: number;
}

function SelectOptionRow<Value extends string>({
  option,
  isSelected,
  index,
  count,
}: SelectOptionRowProps<Value>) {
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(option.disabled));
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    resolveSegmentedMenuItemCorners({ index, count, isSelected }),
    "fastSpatial",
  );
  const hasDescription = Boolean(option.description);

  return (
    <BaseSelect.Item
      ref={ref}
      value={option.value}
      disabled={option.disabled}
      className="m3e-select__item"
      data-has-desc={hasDescription ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        minHeight: hasDescription ? "56px" : `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
        paddingBlock: hasDescription ? "8px" : undefined,
        paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
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
        <BaseSelect.ItemText
          className="m3e-select__item-label"
          data-text={option.label}
        >
          {option.label}
        </BaseSelect.ItemText>
        {option.description ? (
          <span className="m3e-select__item-desc">{option.description}</span>
        ) : null}
      </span>
      <BaseSelect.ItemIndicator keepMounted className="m3e-select__item-check">
        <CheckMarkSvg />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

function SelectInner<Value extends string = string>(
  {
    options = [],
    groups,
    value: controlledValue,
    defaultValue,
    onValueChange,
    variant = "outlined",
    labelPosition = "floating",
    label,
    placeholder,
    description,
    errorMessage,
    invalid,
    clearable = false,
    disabled,
    readOnly = false,
    required = false,
    name,
    id,
    "aria-label": ariaLabel,
    className,
    style,
  }: M3ESelectSingleProps<Value>,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const resolvedPlaceholder = placeholder ?? t("select.placeholder");
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const defaultValRef = React.useRef<Value | null>(defaultValue ?? null);
  defaultValRef.current = defaultValue ?? null;

  const [isOpen, setIsOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<Value | null>(
    defaultValue ?? null,
  );

  React.useEffect(() => {
    if (controlledValue !== undefined) return;
    const form = triggerRef.current?.closest("form");
    if (!form) return;
    const onReset = () => {
      setUncontrolledValue(defaultValRef.current);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [controlledValue]);

  const effectiveOpen = readOnly ? false : isOpen;
  const currentValue =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const hasSelection =
    currentValue !== null &&
    currentValue !== undefined &&
    String(currentValue).length > 0;
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const isLabelFloated = effectiveOpen || hasSelection;
  const hasExplicitError = Boolean(invalid || errorMessage);

  const chevronDeg = useM3EScalarSpring(effectiveOpen ? 180 : 0, "fastSpatial");

  const generatedId = React.useId();
  const triggerId = id ?? generatedId;

  const flatOptions = React.useMemo(
    () => (groups ? groups.flatMap((g) => g.options) : options),
    [groups, options],
  );

  const itemsMap = React.useMemo(
    () => flatOptions.map((o) => ({ value: o.value, label: o.label })),
    [flatOptions],
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

  const handleCommit = (resolved: Value | null) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(resolved);
    }
    onValueChange?.(resolved);
  };

  const showClearBtn = Boolean(
    clearable && hasSelection && !isDisabled && !readOnly,
  );

  return (
    <BaseField.Root
      name={name}
      disabled={isDisabled || undefined}
      invalid={errorMessage ? true : invalid}
      className={
        className
          ? `m3e-field m3e-field-root m3e-select-field ${className}`
          : "m3e-field m3e-field-root m3e-select-field"
      }
      data-label-position={labelPosition}
      data-readonly={readOnly ? "" : undefined}
      style={style}
    >
      {label && !isFloatingLabel ? (
        <BaseField.Label className="m3e-field__label">
          {label}
          {required ? (
            <span className="m3e-field__required" aria-hidden="true">
              {" "}*
            </span>
          ) : null}
        </BaseField.Label>
      ) : null}
      {description && !isFloatingLabel ? (
        <BaseField.Description className="m3e-field__description">
          {description}
        </BaseField.Description>
      ) : null}
      <BaseSelect.Root
        id={triggerId}
        name={name}
        items={itemsMap}
        value={currentValue}
        disabled={isDisabled}
        readOnly={readOnly}
        required={required}
        modal={false}
        open={effectiveOpen}
        onOpenChange={(next) => {
          if (readOnly && next) return;
          setIsOpen(next);
        }}
        onValueChange={(next) => {
          if (readOnly) return;
          handleCommit((next as Value | null) ?? null);
        }}
      >
        <div
          className="m3e-select__shell m3e-select-shell"
          data-variant={variant}
          data-label-position={labelPosition}
          data-floating={isLabelFloated ? "" : undefined}
          data-popup-open={effectiveOpen ? "" : undefined}
          data-disabled={isDisabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          data-invalid={hasExplicitError ? "" : undefined}
          data-clearable={showClearBtn ? "" : undefined}
          style={{ borderRadius: triggerRadius }}
        >
          {isFloatingLabel && variant === "outlined" ? (
            <FieldNotchedOutline
              label={label}
              required={required}
              floating={isLabelFloated}
            />
          ) : null}

          {isFloatingLabel ? (
            <BaseField.Label
              className="m3e-field__floating-label m3e-select__floating-label"
              data-floating={isLabelFloated ? "" : undefined}
            >
              {label}
              {required ? (
                <span className="m3e-field__required" aria-hidden="true">
                  {" "}*
                </span>
              ) : null}
            </BaseField.Label>
          ) : null}

          <BaseSelect.Trigger
            ref={(node) => {
              const btnNode =
                node instanceof HTMLButtonElement ? node : null;
              triggerRef.current = btnNode;
              assignRef(forwardedRef, btnNode);
            }}
            aria-label={!label ? ariaLabel ?? resolvedPlaceholder : undefined}
            aria-invalid={hasExplicitError ? true : undefined}
            className="m3e-select__trigger m3e-select-trigger"
            data-variant={variant}
            data-label-position={labelPosition}
            data-floating={isLabelFloated ? "" : undefined}
            data-readonly={readOnly ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
              borderRadius: triggerRadius,
            }}
          >
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

          {showClearBtn ? (
            <button
              type="button"
              aria-label={t("select.clear")}
              className="m3e-select__clear-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCommit(null);
                triggerRef.current?.focus();
              }}
            >
              <ClearSvg />
            </button>
          ) : null}
        </div>

        <BaseSelect.Portal container={portalContainer}>
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
                borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
              }}
            >
              <BaseSelect.List
                className="m3e-select__list"
                style={{
                  padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                }}
              >
                {groups
                  ? groups.map((group) => (
                      <BaseSelect.Group
                        key={group.label}
                        className="m3e-select__group"
                      >
                        <BaseSelect.GroupLabel className="m3e-select__group-label">
                          {group.label}
                        </BaseSelect.GroupLabel>
                        {group.options.map((opt, idx) => (
                          <SelectOptionRow
                            key={opt.value}
                            option={opt}
                            index={idx}
                            count={group.options.length}
                            isSelected={currentValue === opt.value}
                          />
                        ))}
                      </BaseSelect.Group>
                    ))
                  : options.map((opt, idx) => (
                      <SelectOptionRow
                        key={opt.value}
                        option={opt}
                        index={idx}
                        count={options.length}
                        isSelected={currentValue === opt.value}
                      />
                    ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>

      {isFloatingLabel && description ? (
        <div className="m3e-field__supporting-row">
          <BaseField.Description className="m3e-field__description">
            {description}
          </BaseField.Description>
        </div>
      ) : null}

      {!isDisabled ? (
        <BaseField.Error
          match={hasExplicitError ? true : undefined}
          className="m3e-field__error"
          render={(errorProps) => {
            const resolvedMessage =
              errorMessage ??
              errorProps.children ??
              (invalid ? t("textField.defaultInvalid") : null);
            return (
              <div {...errorProps}>
                <FieldErrorIconSvg label={t("textField.errorIcon")} />
                <span>{resolvedMessage}</span>
              </div>
            );
          }}
        />
      ) : null}
    </BaseField.Root>
  );
}

function MultiSelectInner<Value extends string = string>(
  {
    options = [],
    groups,
    value: controlledValue,
    defaultValue = [],
    onValueChange,
    maxVisibleTags = 3,
    variant = "outlined",
    labelPosition = "floating",
    label,
    placeholder,
    description,
    errorMessage,
    invalid,
    clearable = true,
    disabled,
    readOnly = false,
    required = false,
    name,
    id,
    "aria-label": ariaLabel,
    className,
    style,
  }: M3ESelectMultipleProps<Value>,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const resolvedPlaceholder = placeholder ?? t("select.placeholder");
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const defaultValRef = React.useRef<readonly Value[]>(defaultValue);
  defaultValRef.current = defaultValue;

  const [isOpen, setIsOpen] = React.useState(false);
  const [uncontrolledValues, setUncontrolledValues] = React.useState<
    readonly Value[]
  >(defaultValue);

  React.useEffect(() => {
    if (controlledValue !== undefined) return;
    const form = triggerRef.current?.closest("form");
    if (!form) return;
    const onReset = () => {
      setUncontrolledValues(defaultValRef.current);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [controlledValue]);

  const effectiveOpen = readOnly ? false : isOpen;
  const currentValues =
    controlledValue !== undefined ? controlledValue : uncontrolledValues;

  const hasSelection = currentValues.length > 0;
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const isLabelFloated = effectiveOpen || hasSelection;
  const hasExplicitError = Boolean(invalid || errorMessage);

  const chevronDeg = useM3EScalarSpring(effectiveOpen ? 180 : 0, "fastSpatial");
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;

  const flatOptions = React.useMemo(
    () => (groups ? groups.flatMap((g) => g.options) : options),
    [groups, options],
  );

  const labelByValue = React.useMemo(() => {
    const map = new Map<Value, string>();
    for (const opt of flatOptions) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [flatOptions]);

  const itemsMap = React.useMemo(
    () => flatOptions.map((o) => ({ value: o.value, label: o.label })),
    [flatOptions],
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

  const handleCommit = (resolved: Value[]) => {
    if (controlledValue === undefined) {
      setUncontrolledValues(resolved);
    }
    onValueChange?.(resolved);
  };

  const showClearBtn = Boolean(
    clearable && hasSelection && !isDisabled && !readOnly,
  );
  const selectedSet = React.useMemo(
    () => new Set<Value>(currentValues),
    [currentValues],
  );
  const visibleValues = currentValues.slice(0, Math.max(1, maxVisibleTags));
  const overflowCount = Math.max(0, currentValues.length - visibleValues.length);

  return (
    <BaseField.Root
      name={name}
      disabled={isDisabled || undefined}
      invalid={errorMessage ? true : invalid}
      className={
        className
          ? `m3e-field m3e-field-root m3e-select-field m3e-multi-select ${className}`
          : "m3e-field m3e-field-root m3e-select-field m3e-multi-select"
      }
      data-label-position={labelPosition}
      data-readonly={readOnly ? "" : undefined}
      style={style}
    >
      {label && !isFloatingLabel ? (
        <BaseField.Label className="m3e-field__label">
          {label}
          {required ? (
            <span className="m3e-field__required" aria-hidden="true">
              {" "}*
            </span>
          ) : null}
        </BaseField.Label>
      ) : null}
      {description && !isFloatingLabel ? (
        <BaseField.Description className="m3e-field__description">
          {description}
        </BaseField.Description>
      ) : null}

      <BaseSelect.Root
        multiple
        id={triggerId}
        name={name}
        items={itemsMap}
        value={currentValues}
        disabled={isDisabled}
        readOnly={readOnly}
        required={required}
        modal={false}
        open={effectiveOpen}
        onOpenChange={(next) => {
          if (readOnly && next) return;
          setIsOpen(next);
        }}
        onValueChange={(next) => {
          if (readOnly) return;
          handleCommit(Array.isArray(next) ? (next as Value[]) : []);
        }}
      >
        <div
          className="m3e-select__shell m3e-select-shell"
          data-variant={variant}
          data-label-position={labelPosition}
          data-floating={isLabelFloated ? "" : undefined}
          data-popup-open={effectiveOpen ? "" : undefined}
          data-disabled={isDisabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          data-invalid={hasExplicitError ? "" : undefined}
          data-clearable={showClearBtn ? "" : undefined}
          style={{ borderRadius: triggerRadius }}
        >
          {isFloatingLabel && variant === "outlined" ? (
            <FieldNotchedOutline
              label={label}
              required={required}
              floating={isLabelFloated}
            />
          ) : null}

          {isFloatingLabel ? (
            <BaseField.Label
              className="m3e-field__floating-label m3e-select__floating-label"
              data-floating={isLabelFloated ? "" : undefined}
            >
              {label}
              {required ? (
                <span className="m3e-field__required" aria-hidden="true">
                  {" "}*
                </span>
              ) : null}
            </BaseField.Label>
          ) : null}

          <BaseSelect.Trigger
            ref={(node) => {
              const btnNode =
                node instanceof HTMLButtonElement ? node : null;
              triggerRef.current = btnNode;
              assignRef(forwardedRef, btnNode);
            }}
            aria-label={!label ? ariaLabel ?? resolvedPlaceholder : undefined}
            aria-invalid={hasExplicitError ? true : undefined}
            className="m3e-select__trigger m3e-select-trigger m3e-multi-select__trigger"
            data-variant={variant}
            data-label-position={labelPosition}
            data-floating={isLabelFloated ? "" : undefined}
            data-readonly={readOnly ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
              borderRadius: triggerRadius,
            }}
          >
            {hasSelection ? (
              <span className="m3e-multi-select__tags">
                {visibleValues.map((val) => (
                  <span key={val} className="m3e-multi-select__tag">
                    <span className="m3e-multi-select__tag-text">
                      {labelByValue.get(val) ?? val}
                    </span>
                  </span>
                ))}
                {overflowCount > 0 ? (
                  <span className="m3e-multi-select__overflow">
                    +{formatLocalizedInteger(locale, overflowCount)}
                  </span>
                ) : null}
              </span>
            ) : (
              <BaseSelect.Value
                placeholder={resolvedPlaceholder}
                className="m3e-select__value"
              />
            )}
            <BaseSelect.Icon
              className="m3e-select__chevron"
              style={{ rotate: `${chevronDeg.toFixed(1)}deg` }}
            >
              <ChevronSvg />
            </BaseSelect.Icon>
          </BaseSelect.Trigger>

          {showClearBtn ? (
            <button
              type="button"
              aria-label={t("select.clear")}
              className="m3e-select__clear-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCommit([]);
                triggerRef.current?.focus();
              }}
            >
              <ClearSvg />
            </button>
          ) : null}
        </div>

        <BaseSelect.Portal container={portalContainer}>
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
                borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
              }}
            >
              <BaseSelect.List
                className="m3e-select__list"
                style={{
                  padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                }}
              >
                {groups
                  ? groups.map((group) => (
                      <BaseSelect.Group
                        key={group.label}
                        className="m3e-select__group"
                      >
                        <BaseSelect.GroupLabel className="m3e-select__group-label">
                          {group.label}
                        </BaseSelect.GroupLabel>
                        {group.options.map((opt, idx) => (
                          <SelectOptionRow
                            key={opt.value}
                            option={opt}
                            index={idx}
                            count={group.options.length}
                            isSelected={selectedSet.has(opt.value)}
                          />
                        ))}
                      </BaseSelect.Group>
                    ))
                  : options.map((opt, idx) => (
                      <SelectOptionRow
                        key={opt.value}
                        option={opt}
                        index={idx}
                        count={options.length}
                        isSelected={selectedSet.has(opt.value)}
                      />
                    ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>

      {isFloatingLabel && description ? (
        <div className="m3e-field__supporting-row">
          <BaseField.Description className="m3e-field__description">
            {description}
          </BaseField.Description>
        </div>
      ) : null}

      {!isDisabled ? (
        <BaseField.Error
          match={hasExplicitError ? true : undefined}
          className="m3e-field__error"
          render={(errorProps) => {
            const resolvedMessage =
              errorMessage ??
              errorProps.children ??
              (invalid ? t("textField.defaultInvalid") : null);
            return (
              <div {...errorProps}>
                <FieldErrorIconSvg label={t("textField.errorIcon")} />
                <span>{resolvedMessage}</span>
              </div>
            );
          }}
        />
      ) : null}
    </BaseField.Root>
  );
}

const SingleSelect = React.forwardRef(SelectInner) as <Value extends string>(
  props: M3ESelectSingleProps<Value> & React.RefAttributes<HTMLButtonElement>,
) => React.JSX.Element;

const MultiSelect = React.forwardRef(MultiSelectInner) as <Value extends string>(
  props: M3ESelectMultipleProps<Value> & React.RefAttributes<HTMLButtonElement>,
) => React.JSX.Element;

export const Select = React.forwardRef(function Select(
  props: M3ESelectProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return props.multiple ? (
    <MultiSelect {...props} ref={ref} />
  ) : (
    <SingleSelect {...props} ref={ref} />
  );
}) as <Value extends string = string>(
  props: M3ESelectProps<Value> & React.RefAttributes<HTMLButtonElement>,
) => React.JSX.Element;

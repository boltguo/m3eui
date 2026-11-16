import * as React from "react";
import { useFormReset } from "../internal/formField.js";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Field as BaseField } from "@base-ui/react/field";
import {
  SEGMENTED_MENU_TOKENS,
  SELECT_TOKENS,
  resolveSegmentedMenuItemCorners,
} from "../tokens/index.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { useM3EI18n } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../internal/fieldOutline.js";

export interface ComboboxOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

interface ComboboxBaseProps {
  readonly options: readonly ComboboxOption[];
  readonly variant?: "outlined" | "filled";
  readonly labelPosition?: "floating" | "outside";
  readonly label?: React.ReactNode;
  readonly placeholder?: string;
  readonly emptyMessage?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly clearable?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly leadingIcon?: React.ReactNode;
  readonly name?: string;
  readonly id?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EComboboxSingleProps extends ComboboxBaseProps {
  readonly multiple?: false;
  readonly value?: ComboboxOption | string | null;
  readonly defaultValue?: ComboboxOption | string | null;
  readonly onValueChange?: (option: ComboboxOption | null) => void;
}

export interface M3EComboboxMultipleProps extends ComboboxBaseProps {
  readonly multiple: true;
  readonly value?: readonly ComboboxOption[];
  readonly defaultValue?: readonly ComboboxOption[];
  readonly onValueChange?: (options: ComboboxOption[]) => void;
}

export type M3EComboboxProps = M3EComboboxSingleProps | M3EComboboxMultipleProps;

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
  index,
}: {
  readonly option: ComboboxOption;
  readonly isSelected: boolean;
  readonly index: number;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(option.disabled));
  const count = BaseCombobox.useFilteredItems().length;
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    resolveSegmentedMenuItemCorners({ index, count, isSelected }),
    "fastSpatial",
  );
  const hasDescription = Boolean(option.description);

  return (
    <BaseCombobox.Item
      ref={ref}
      value={option}
      disabled={option.disabled}
      className="m3e-select__item"
      data-pressed={isPressed ? "" : undefined}
      style={{
        minHeight: hasDescription ? "56px" : `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
        paddingBlock: hasDescription ? "8px" : undefined,
        paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
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

const SingleCombobox = React.forwardRef<HTMLInputElement, M3EComboboxSingleProps>(
  function SingleCombobox(
    {
      options,
      value: controlledValue,
      defaultValue,
      onValueChange,
      variant = "outlined",
      labelPosition = "floating",
      label,
      placeholder,
      emptyMessage,
      description,
      errorMessage,
      invalid,
      clearable = true,
      disabled,
      readOnly = false,
      required = false,
      leadingIcon,
      name,
      id,
      "aria-label": ariaLabel,
      className,
      style,
    },
    forwardedRef,
  ): React.JSX.Element {
    const { t } = useM3EI18n();
    const portalContainer = useM3EPortalContainer();
    const isDisabled = useFieldsetDisabled(disabled);
    const resolvedPlaceholder = placeholder ?? t("combobox.placeholder");
    const resolvedEmptyMessage = emptyMessage ?? t("combobox.empty");
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const shellRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const normalizeOption = React.useCallback(
      (raw: ComboboxOption | string | null | undefined): ComboboxOption | null => {
        if (raw == null) return null;
        if (typeof raw === "string") {
          return options.find((opt) => opt.value === raw) ?? { value: raw, label: raw };
        }
        return options.find((opt) => opt.value === raw.value) ?? raw;
      },
      [options],
    );

    const defaultValRef = React.useRef<ComboboxOption | null>(
      normalizeOption(defaultValue),
    );
    defaultValRef.current = normalizeOption(defaultValue);

    const [uncontrolledValue, setUncontrolledValue] =
      React.useState<ComboboxOption | null>(() => normalizeOption(defaultValue));
    const [isOpen, setIsOpen] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    useFormReset(
      inputRef,
      () => setUncontrolledValue(defaultValRef.current),
      controlledValue === undefined,
    );

    const rawCurrentValue =
      controlledValue !== undefined ? controlledValue : uncontrolledValue;

    const resolvedCurrentValue = React.useMemo(
      () => normalizeOption(rawCurrentValue),
      [rawCurrentValue, normalizeOption],
    );

    const [inputText, setInputText] = React.useState<string>(
      () => resolvedCurrentValue?.label ?? "",
    );

    const resolveOptionLabel = React.useCallback(
      (item: ComboboxOption) =>
        options.find((opt) => opt.value === item.value)?.label ?? item.label ?? "",
      [options],
    );

    const effectiveOpen = readOnly ? false : isOpen;
    const hasExplicitError = Boolean(invalid || errorMessage);
    const resolvedLabelText = resolvedCurrentValue
      ? resolveOptionLabel(resolvedCurrentValue)
      : "";
    const hasValue = resolvedLabelText.length > 0 || inputText.length > 0;
    const isFloatingLabel = labelPosition === "floating" && Boolean(label);
    const isLabelFloated = isFocused || effectiveOpen || hasValue;

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
      <BaseField.Root
        name={name}
        disabled={isDisabled || undefined}
        invalid={errorMessage ? true : invalid}
        className={
          className
            ? `m3e-field m3e-field-root m3e-combobox ${className}`
            : "m3e-field m3e-field-root m3e-combobox"
        }
        data-label-position={labelPosition}
        data-readonly={readOnly ? "" : undefined}
        style={style}
      >
        <BaseCombobox.Root
          items={options}
          value={resolvedCurrentValue}
          disabled={isDisabled}
          readOnly={readOnly}
          required={required}
          name={name}
          openOnInputClick={!readOnly}
          open={effectiveOpen}
          onOpenChange={(next) => {
            if (readOnly && next) return;
            setIsOpen(next);
          }}
          autoHighlight
          isItemEqualToValue={(a, b) => a.value === b.value}
          itemToStringLabel={resolveOptionLabel}
          itemToStringValue={(item) => item.value}
          onInputValueChange={(val) => setInputText(val)}
          onValueChange={(next) => {
            if (readOnly) return;
            const resolved = next ?? null;
            if (controlledValue === undefined) {
              setUncontrolledValue(resolved);
            }
            onValueChange?.(resolved);
          }}
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

          <div
            ref={shellRef}
            className="m3e-combobox__shell"
            data-variant={variant}
            data-label-position={labelPosition}
            data-floating={isLabelFloated ? "" : undefined}
            data-popup-open={effectiveOpen ? "" : undefined}
            data-disabled={isDisabled ? "" : undefined}
            data-readonly={readOnly ? "" : undefined}
            data-invalid={hasExplicitError ? "" : undefined}
            data-has-leading={leadingIcon ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              borderRadius: containerRadius,
            }}
          >
            {isFloatingLabel && variant === "outlined" ? (
              <FieldNotchedOutline
                label={label}
                required={required}
                floating={isLabelFloated}
              />
            ) : null}

            {leadingIcon ? (
              <span className="m3e-text-field__affix" aria-hidden="true">
                {leadingIcon}
              </span>
            ) : null}

            <div className="m3e-text-field__control-stack">
              {isFloatingLabel ? (
                <BaseField.Label
                  className="m3e-field__floating-label"
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
              <BaseCombobox.Input
                ref={(node) => {
                  const inputNode =
                    node instanceof HTMLInputElement ? node : null;
                  inputRef.current = inputNode;
                  assignRef(forwardedRef, inputNode);
                }}
                id={inputId}
                readOnly={readOnly}
                aria-label={!label ? ariaLabel ?? resolvedPlaceholder : undefined}
                placeholder={resolvedPlaceholder}
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="m3e-combobox__input"
              />
            </div>

            {clearable && !isDisabled && !readOnly ? (
              <BaseCombobox.Clear
                aria-label={t("combobox.clear")}
                className="m3e-text-field__icon-btn m3e-combobox__clear"
              >
                <ClearSvg />
              </BaseCombobox.Clear>
            ) : null}

            <BaseCombobox.Trigger
              className="m3e-combobox__trigger"
              aria-label={t("combobox.toggle")}
              aria-labelledby={undefined}
              tabIndex={-1}
              disabled={isDisabled || readOnly}
              data-open={effectiveOpen ? "" : undefined}
            >
              <ChevronSvg />
            </BaseCombobox.Trigger>
          </div>

          <BaseCombobox.Portal container={portalContainer}>
            <BaseCombobox.Positioner
              anchor={shellRef}
              side="bottom"
              align="start"
              sideOffset={6}
              className="m3e-select__positioner"
            >
              <BaseCombobox.Popup
                className="m3e-select__popup m3e-combobox__popup"
                style={{
                  borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
                }}
              >
                <BaseCombobox.Empty className="m3e-combobox__empty">
                  {resolvedEmptyMessage}
                </BaseCombobox.Empty>
                <BaseCombobox.List
                  className="m3e-select__list"
                  style={{
                    padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                  }}
                >
                  {(option: ComboboxOption, index: number) => (
                    <ComboboxOptionRow
                      key={option.value}
                      option={option}
                      index={index}
                      isSelected={resolvedCurrentValue?.value === option.value}
                    />
                  )}
                </BaseCombobox.List>
              </BaseCombobox.Popup>
            </BaseCombobox.Positioner>
          </BaseCombobox.Portal>
        </BaseCombobox.Root>

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
  },
);

const MultiCombobox = React.forwardRef<
  HTMLInputElement,
  M3EComboboxMultipleProps
>(function MultiCombobox(
  {
    options,
    value: controlledValue,
    defaultValue = [],
    onValueChange,
    variant = "outlined",
    labelPosition = "floating",
    label,
    placeholder,
    emptyMessage,
    description,
    errorMessage,
    invalid,
    clearable = true,
    disabled,
    readOnly = false,
    required = false,
    leadingIcon,
    name,
    id,
    "aria-label": ariaLabel,
    className,
    style,
  },
  forwardedRef,
): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const resolvedPlaceholder = placeholder ?? t("combobox.placeholder");
  const resolvedEmptyMessage = emptyMessage ?? t("combobox.empty");
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const defaultValRef = React.useRef<readonly ComboboxOption[]>(defaultValue);
  defaultValRef.current = defaultValue;

  const [uncontrolledValues, setUncontrolledValues] = React.useState<
    readonly ComboboxOption[]
  >(defaultValue);
  const [inputText, setInputText] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  useFormReset(
    inputRef,
    () => setUncontrolledValues(defaultValRef.current),
    controlledValue === undefined,
  );

  const rawCurrentValues =
    controlledValue !== undefined ? controlledValue : uncontrolledValues;

  const currentValues = React.useMemo(
    () =>
      rawCurrentValues.map(
        (item) => options.find((opt) => opt.value === item.value) ?? item,
      ),
    [rawCurrentValues, options],
  );

  const selectedValueSet = React.useMemo(
    () => new Set(currentValues.map((v) => v.value)),
    [currentValues],
  );

  const effectiveOpen = readOnly ? false : isOpen;
  const hasExplicitError = Boolean(invalid || errorMessage);
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const isLabelFloated =
    isFocused || effectiveOpen || currentValues.length > 0 || inputText.length > 0;

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

  const resolveOptionLabel = React.useCallback(
    (item: ComboboxOption) =>
      options.find((opt) => opt.value === item.value)?.label ?? item.label,
    [options],
  );

  const handleValuesChange = (resolved: ComboboxOption[]) => {
    if (controlledValue === undefined) {
      setUncontrolledValues(resolved);
    }
    onValueChange?.(resolved);
  };

  const showClear = Boolean(
    clearable && !isDisabled && !readOnly && currentValues.length > 0,
  );

  return (
    <BaseField.Root
      name={name}
      disabled={isDisabled || undefined}
      invalid={errorMessage ? true : invalid}
      className={
        className
          ? `m3e-field m3e-field-root m3e-combobox m3e-multi-combobox ${className}`
          : "m3e-field m3e-field-root m3e-combobox m3e-multi-combobox"
      }
      data-label-position={labelPosition}
      data-readonly={readOnly ? "" : undefined}
      style={style}
    >
      <BaseCombobox.Root
        multiple
        items={options}
        value={currentValues}
        disabled={isDisabled}
        readOnly={readOnly}
        required={required}
        name={name}
        openOnInputClick={!readOnly}
        open={effectiveOpen}
        onOpenChange={(next) => {
          if (readOnly && next) return;
          setIsOpen(next);
        }}
        autoHighlight
        isItemEqualToValue={(a, b) => a.value === b.value}
        itemToStringLabel={resolveOptionLabel}
        itemToStringValue={(item) => item.value}
        onInputValueChange={(val) => setInputText(val)}
        onValueChange={(next) => {
          if (readOnly) return;
          const resolved = Array.isArray(next) ? next : [];
          handleValuesChange(resolved);
        }}
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

        <div
          ref={anchorRef}
          className="m3e-combobox__shell m3e-multi-combobox__shell"
          data-variant={variant}
          data-label-position={labelPosition}
          data-floating={isLabelFloated ? "" : undefined}
          data-popup-open={effectiveOpen ? "" : undefined}
          data-disabled={isDisabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          data-invalid={hasExplicitError ? "" : undefined}
          data-has-leading={leadingIcon ? "" : undefined}
          style={{
            minHeight: `${height}px`,
            borderRadius: containerRadius,
          }}
          onClick={(e) => {
            if (
              !isDisabled &&
              !(e.target as HTMLElement).closest("button")
            ) {
              inputRef.current?.focus();
            }
          }}
        >
          {isFloatingLabel && variant === "outlined" ? (
            <FieldNotchedOutline
              label={label}
              required={required}
              floating={isLabelFloated}
            />
          ) : null}

          {leadingIcon ? (
            <span className="m3e-text-field__affix" aria-hidden="true">
              {leadingIcon}
            </span>
          ) : null}

          {isFloatingLabel ? (
            <BaseField.Label
              className="m3e-field__floating-label m3e-select__floating-label"
              data-floating={isLabelFloated ? "" : undefined}
              style={
                leadingIcon
                  ? {
                      insetInlineStart:
                        isLabelFloated && variant === "outlined"
                          ? "16px"
                          : "44px",
                    }
                  : undefined
              }
            >
              {label}
              {required ? (
                <span className="m3e-field__required" aria-hidden="true">
                  {" "}*
                </span>
              ) : null}
            </BaseField.Label>
          ) : null}

          <BaseCombobox.Chips className="m3e-multi-combobox__chips">
            <BaseCombobox.Value>
              {(selected: ComboboxOption[]) => (
                <React.Fragment>
                  {selected.map((opt) => {
                    const resolvedLabel = resolveOptionLabel(opt);
                    return (
                      <BaseCombobox.Chip
                        key={opt.value}
                        className="m3e-multi-combobox__chip"
                        aria-label={resolvedLabel}
                      >
                        <span className="m3e-multi-combobox__chip-text">
                          {resolvedLabel}
                        </span>
                        {!isDisabled && !readOnly ? (
                          <BaseCombobox.ChipRemove
                            aria-label={t("chip.removeItem", {
                              label: resolvedLabel,
                            })}
                            className="m3e-multi-combobox__chip-remove"
                          >
                            <ClearSvg />
                          </BaseCombobox.ChipRemove>
                        ) : null}
                      </BaseCombobox.Chip>
                    );
                  })}
                  <BaseCombobox.Input
                    ref={(node) => {
                      const inputNode =
                        node instanceof HTMLInputElement ? node : null;
                      inputRef.current = inputNode;
                      assignRef(forwardedRef, inputNode);
                    }}
                    id={inputId}
                    readOnly={readOnly}
                    aria-label={
                      !label ? ariaLabel ?? resolvedPlaceholder : undefined
                    }
                    size={
                      selected.length === 0
                        ? undefined
                        : Math.max(2, inputText.length + 1)
                    }
                    placeholder={
                      selected.length === 0 ? resolvedPlaceholder : ""
                    }
                    data-has-tags={selected.length > 0 ? "" : undefined}
                    data-draft-empty={inputText.length === 0 ? "" : undefined}
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                      if (
                        (readOnly || isDisabled) &&
                        (e.key === "Backspace" || e.key === "Delete")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="m3e-combobox__input m3e-multi-combobox__input"
                  />
                </React.Fragment>
              )}
            </BaseCombobox.Value>
          </BaseCombobox.Chips>

          {showClear ? (
            <BaseCombobox.Clear
              keepMounted
              aria-label={t("combobox.clear")}
              className="m3e-text-field__icon-btn m3e-combobox__clear"
            >
              <ClearSvg />
            </BaseCombobox.Clear>
          ) : null}

          <BaseCombobox.Trigger
            className="m3e-combobox__trigger"
            aria-label={t("combobox.toggle")}
            aria-labelledby={undefined}
            tabIndex={-1}
            disabled={isDisabled || readOnly}
            data-open={effectiveOpen ? "" : undefined}
          >
            <ChevronSvg />
          </BaseCombobox.Trigger>
        </div>

        <BaseCombobox.Portal container={portalContainer}>
          <BaseCombobox.Positioner
            anchor={anchorRef}
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-select__positioner"
          >
            <BaseCombobox.Popup
              className="m3e-select__popup m3e-combobox__popup"
              style={{
                borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
              }}
            >
              <BaseCombobox.Empty className="m3e-combobox__empty">
                {resolvedEmptyMessage}
              </BaseCombobox.Empty>
              <BaseCombobox.List
                className="m3e-select__list"
                style={{
                  padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                }}
              >
                {(option: ComboboxOption, index: number) => (
                  <ComboboxOptionRow
                    key={option.value}
                    option={option}
                    index={index}
                    isSelected={selectedValueSet.has(option.value)}
                  />
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>

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
});

export const Combobox = React.forwardRef<HTMLInputElement, M3EComboboxProps>(
  function Combobox(props, ref) {
    return props.multiple ? (
      <MultiCombobox {...props} ref={ref} />
    ) : (
      <SingleCombobox {...props} ref={ref} />
    );
  },
);

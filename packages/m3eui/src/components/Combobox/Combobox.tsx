"use client";

import * as React from "react";
import { useFormReset } from "../../internal/formField.js";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Field as BaseField } from "@base-ui/react/field";
import {
  SEGMENTED_MENU_TOKENS,
  SELECT_TOKENS,
} from "../../tokens/topology.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { useDropdownItemState } from "../../internal/dropdownItem.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../../internal/fieldOutline.js";
import { assignRef } from "../../internal/assignRef.js";
import { CheckIcon, ChevronDownIcon, CloseIcon } from "../../internal/icons.js";
import { useAdaptivePositionMethod } from "../../internal/positionMethod.js";
import { useM3ERipple } from "../../internal/ripple.js";

export interface ComboboxOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
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

function ComboboxOptionRow({
  option,
  isSelected,
  index,
  hasAnyIcon = false,
}: {
  readonly option: ComboboxOption;
  readonly isSelected: boolean;
  readonly index: number;
  readonly hasAnyIcon?: boolean;
}) {
  const count = BaseCombobox.useFilteredItems().length;
  const hasDescription = Boolean(option.description);
  const {
    ref,
    rippleRef,
    isPressed,
    interactionHandlers,
    itemStyle,
  } = useDropdownItemState<HTMLDivElement>({
    index,
    count,
    disabled: Boolean(option.disabled),
    isSelected,
    hasDescription,
  });

  return (
    <BaseCombobox.Item
      ref={ref}
      value={option}
      disabled={option.disabled}
      className="m3e-dropdown-item m3e-select__item"
      data-pressed={isPressed ? "" : undefined}
      style={itemStyle}
      {...interactionHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {option.icon ? (
        <span className="m3e-dropdown-item__icon m3e-select__item-icon" aria-hidden="true">
          {option.icon}
        </span>
      ) : hasAnyIcon ? (
        <span className="m3e-dropdown-item__icon m3e-select__item-icon" aria-hidden="true" />
      ) : null}
      <span className="m3e-dropdown-item__text m3e-select__item-text">
        <span
          className="m3e-dropdown-item__label m3e-select__item-label"
          data-text={option.label}
        >
          {option.label}
        </span>
        {option.description ? (
          <span className="m3e-dropdown-item__desc m3e-select__item-desc">
            {option.description}
          </span>
        ) : null}
      </span>
      <BaseCombobox.ItemIndicator
        keepMounted
        className="m3e-dropdown-item__check m3e-select__item-check"
      >
        <CheckIcon size={16} strokeWidth={2.6} />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

function ComboboxChipRemoveButton({
  ariaLabel,
}: {
  readonly ariaLabel: string;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <BaseCombobox.ChipRemove
      aria-label={ariaLabel}
      className="m3e-multi-combobox__chip-remove"
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <CloseIcon size={14} strokeWidth={2.4} />
    </BaseCombobox.ChipRemove>
  );
}

function ComboboxClearButton({
  keepMounted,
  ariaLabel,
}: {
  readonly keepMounted?: boolean;
  readonly ariaLabel: string;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <BaseCombobox.Clear
      keepMounted={keepMounted}
      aria-label={ariaLabel}
      className="m3e-text-field__icon-btn m3e-combobox__clear"
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <CloseIcon size={14} strokeWidth={2.4} />
    </BaseCombobox.Clear>
  );
}

function ComboboxTriggerButton({
  ariaLabel,
  disabled,
  open,
}: {
  readonly ariaLabel: string;
  readonly disabled: boolean;
  readonly open: boolean;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  return (
    <BaseCombobox.Trigger
      className="m3e-combobox__trigger"
      aria-label={ariaLabel}
      aria-labelledby={undefined}
      tabIndex={-1}
      disabled={disabled}
      data-open={open ? "" : undefined}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <ChevronDownIcon size={18} strokeWidth={2.2} />
    </BaseCombobox.Trigger>
  );
}

const NO_OPTIONS: readonly ComboboxOption[] = [];

function normalizeSingleOption(
  options: readonly ComboboxOption[],
  raw: ComboboxOption | string | null | undefined,
): ComboboxOption | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    return options.find((opt) => opt.value === raw) ?? { value: raw, label: raw };
  }
  return options.find((opt) => opt.value === raw.value) ?? raw;
}

const ComboboxInner = React.forwardRef<HTMLInputElement, M3EComboboxProps>(
  function ComboboxInner(props, forwardedRef): React.JSX.Element {
    const multiple = props.multiple === true;
    const {
      options,
      value: controlledValue,
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
    } = props;

    const { t } = useM3EI18n();
    const portalContainer = useM3EPortalContainer();
    const isDisabled = useFieldsetDisabled(disabled);
    const resolvedPlaceholder = placeholder ?? t("combobox.placeholder");
    const resolvedEmptyMessage = emptyMessage ?? t("combobox.empty");
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const shellRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const normalizeSingle = React.useCallback(
      (raw: ComboboxOption | string | null | undefined) =>
        normalizeSingleOption(options, raw),
      [options],
    );

    const resolvedDefaultValue = multiple
      ? ((props.defaultValue ?? NO_OPTIONS) as readonly ComboboxOption[])
      : normalizeSingle(props.defaultValue as ComboboxOption | string | null | undefined);

    const defaultValRef = React.useRef<
      ComboboxOption | null | readonly ComboboxOption[]
    >(resolvedDefaultValue);
    defaultValRef.current = resolvedDefaultValue;

    const [uncontrolledValue, setUncontrolledValue] = React.useState<
      ComboboxOption | null | readonly ComboboxOption[]
    >(resolvedDefaultValue);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    useFormReset(
      inputRef,
      () => setUncontrolledValue(defaultValRef.current),
      controlledValue === undefined,
    );

    const rawCurrentValue =
      controlledValue !== undefined ? controlledValue : uncontrolledValue;

    const resolvedSingleValue = React.useMemo(
      () =>
        multiple
          ? null
          : normalizeSingle(rawCurrentValue as ComboboxOption | string | null | undefined),
      [multiple, rawCurrentValue, normalizeSingle],
    );

    const resolvedMultiValues = React.useMemo(
      () =>
        multiple
          ? ((rawCurrentValue as readonly ComboboxOption[] | undefined) ?? NO_OPTIONS).map(
              (item) => options.find((opt) => opt.value === item.value) ?? item,
            )
          : NO_OPTIONS,
      [multiple, rawCurrentValue, options],
    );

    const selectedValueSet = React.useMemo(
      () => new Set(resolvedMultiValues.map((v) => v.value)),
      [resolvedMultiValues],
    );

    const [inputText, setInputText] = React.useState<string>(() =>
      multiple ? "" : (resolvedSingleValue?.label ?? ""),
    );

    const resolveOptionLabel = React.useCallback(
      (item: ComboboxOption) =>
        options.find((opt) => opt.value === item.value)?.label ?? item.label ?? "",
      [options],
    );

    const effectiveOpen = readOnly ? false : isOpen;
    const positionMethod = useAdaptivePositionMethod(shellRef, effectiveOpen);
    const hasExplicitError = Boolean(invalid || errorMessage);
    const resolvedLabelText =
      !multiple && resolvedSingleValue ? resolveOptionLabel(resolvedSingleValue) : "";
    const hasValue = multiple
      ? resolvedMultiValues.length > 0 || inputText.length > 0
      : resolvedLabelText.length > 0 || inputText.length > 0;
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

    const showClear = multiple
      ? Boolean(clearable && !isDisabled && !readOnly && resolvedMultiValues.length > 0)
      : Boolean(clearable && !isDisabled && !readOnly);
    const hasAnyIcon = React.useMemo(
      () => options.some((opt) => Boolean(opt.icon)),
      [options],
    );

    const rootClass = multiple
      ? "m3e-field m3e-field-root m3e-combobox m3e-multi-combobox"
      : "m3e-field m3e-field-root m3e-combobox";

    const floatingLabel = isFloatingLabel ? (
      <BaseField.Label
        className={
          multiple
            ? "m3e-field__floating-label m3e-select__floating-label"
            : "m3e-field__floating-label"
        }
        data-floating={isLabelFloated ? "" : undefined}
        style={
          multiple && leadingIcon
            ? {
                insetInlineStart:
                  isLabelFloated && variant === "outlined" ? "16px" : "44px",
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
    ) : null;

    const bindInputRef = (node: HTMLInputElement | null) => {
      const inputNode = node instanceof HTMLInputElement ? node : null;
      inputRef.current = inputNode;
      assignRef(forwardedRef, inputNode);
    };

    return (
      <BaseField.Root
        name={name}
        disabled={isDisabled || undefined}
        invalid={errorMessage ? true : invalid}
        className={className ? `${rootClass} ${className}` : rootClass}
        data-label-position={labelPosition}
        data-readonly={readOnly ? "" : undefined}
        style={style}
      >
        <BaseCombobox.Root
          multiple={multiple}
          items={options}
          value={multiple ? resolvedMultiValues : resolvedSingleValue}
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
            if (multiple) {
              const resolved = Array.isArray(next) ? next : [];
              if (controlledValue === undefined) {
                setUncontrolledValue(resolved);
              }
              (props.onValueChange as ((v: ComboboxOption[]) => void) | undefined)?.(
                resolved,
              );
            } else {
              const resolved = (next as ComboboxOption | null | undefined) ?? null;
              if (controlledValue === undefined) {
                setUncontrolledValue(resolved);
              }
              (props.onValueChange as ((v: ComboboxOption | null) => void) | undefined)?.(
                resolved,
              );
            }
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
            className={
              multiple
                ? "m3e-combobox__shell m3e-multi-combobox__shell"
                : "m3e-combobox__shell"
            }
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
            onClick={
              multiple
                ? (e) => {
                    if (
                      !isDisabled &&
                      !(e.target as HTMLElement).closest("button")
                    ) {
                      inputRef.current?.focus();
                    }
                  }
                : undefined
            }
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

            {multiple ? (
              <React.Fragment>
                {floatingLabel}
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
                                <ComboboxChipRemoveButton
                                  ariaLabel={t("chip.removeItem", {
                                    label: resolvedLabel,
                                  })}
                                />
                              ) : null}
                            </BaseCombobox.Chip>
                          );
                        })}
                        <BaseCombobox.Input
                          ref={bindInputRef}
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
              </React.Fragment>
            ) : (
              <div className="m3e-text-field__control-stack">
                {floatingLabel}
                <BaseCombobox.Input
                  ref={bindInputRef}
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
            )}

            {showClear ? (
              <ComboboxClearButton
                keepMounted={multiple || undefined}
                ariaLabel={t("combobox.clear")}
              />
            ) : null}

            <ComboboxTriggerButton
              ariaLabel={t("combobox.toggle")}
              disabled={isDisabled || readOnly}
              open={effectiveOpen}
            />
          </div>

          <BaseCombobox.Portal container={portalContainer}>
            <BaseCombobox.Positioner
              positionMethod={positionMethod}
              anchor={shellRef}
              side="bottom"
              align="start"
              sideOffset={6}
              className="m3e-select__positioner"
            >
              <BaseCombobox.Popup
                className="m3e-dropdown-popup m3e-select__popup m3e-combobox__popup"
                style={{
                  borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
                }}
              >
                <BaseCombobox.Empty className="m3e-dropdown-empty m3e-combobox__empty">
                  {resolvedEmptyMessage}
                </BaseCombobox.Empty>
                <BaseCombobox.List
                  className="m3e-dropdown-list m3e-select__list"
                  style={{
                    padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                  }}
                >
                  {(option: ComboboxOption, index: number) => (
                    <ComboboxOptionRow
                      key={option.value}
                      option={option}
                      index={index}
                      hasAnyIcon={hasAnyIcon}
                      isSelected={
                        multiple
                          ? selectedValueSet.has(option.value)
                          : resolvedSingleValue?.value === option.value
                      }
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

export const Combobox = React.forwardRef<HTMLInputElement, M3EComboboxProps>(
  function Combobox(props, ref) {
    return (
      <ComboboxInner
        key={props.multiple ? "multiple" : "single"}
        {...props}
        ref={ref}
      />
    );
  },
);

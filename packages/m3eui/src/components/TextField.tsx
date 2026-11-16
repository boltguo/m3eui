import * as React from "react";
import { useFormReset } from "../internal/formField.js";
import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { TEXT_FIELD_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EContext.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../internal/fieldOutline.js";

export type TextFieldVariant = "outlined" | "filled";
export type FieldLabelPosition = "floating" | "outside";

export interface M3ETextFieldProps {
  readonly label: React.ReactNode;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly variant?: TextFieldVariant;
  readonly labelPosition?: FieldLabelPosition;
  readonly type?: "text" | "email" | "password" | "search" | "tel" | "url";
  readonly name?: string;
  readonly id?: string;
  readonly placeholder?: string;
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly validate?: (value: unknown) => string | string[] | null | void;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly autoComplete?: string;
  readonly inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  readonly enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
  readonly pattern?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly showCharacterCount?: boolean;
  readonly clearable?: boolean;
  readonly prefixText?: React.ReactNode;
  readonly suffixText?: React.ReactNode;
  readonly leadingIcon?: React.ReactNode;
  readonly trailingIcon?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ETextareaFieldProps {
  readonly label: React.ReactNode;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly variant?: TextFieldVariant;
  readonly labelPosition?: FieldLabelPosition;
  readonly rows?: number;
  readonly name?: string;
  readonly id?: string;
  readonly placeholder?: string;
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly validate?: (value: unknown) => string | string[] | null | void;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly maxLength?: number;
  readonly showCharacterCount?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function ClearGlyph() {
  return (
    <svg
      width={15}
      height={15}
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

function EyeGlyph({ shown }: { readonly shown: boolean }) {
  return shown ? (
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
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const TextField = React.forwardRef<HTMLInputElement, M3ETextFieldProps>(
  function TextField(
    {
      label,
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      variant = "outlined",
      labelPosition = "floating",
      type = "text",
      name,
      id,
      placeholder,
      description,
      errorMessage,
      invalid,
      validate,
      required = false,
      disabled,
      readOnly = false,
      autoComplete,
      inputMode,
      enterKeyHint,
      pattern,
      minLength,
      maxLength,
      showCharacterCount = false,
      clearable = false,
      prefixText,
      suffixText,
      leadingIcon,
      trailingIcon,
      className,
      style,
    },
    ref,
  ) {
    const { t } = useM3EI18n();
    const isDisabled = useFieldsetDisabled(disabled);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const defaultValRef = React.useRef(defaultValue);
    defaultValRef.current = defaultValue;

    const [uncontrolledValue, setUncontrolledValue] =
      React.useState<string>(defaultValue);
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    useFormReset(
      inputRef,
      () => setUncontrolledValue(defaultValRef.current),
      controlledValue === undefined,
    );

    const currentVal = controlledValue ?? uncontrolledValue;
    const isPopulated = currentVal.length > 0;
    const isFloatingLabel = labelPosition === "floating" && Boolean(label);
    const isLabelFloated =
      isFocused || isPopulated || Boolean(prefixText) || Boolean(suffixText);

    const isPassword = type === "password";
    const effectiveType = isPassword && showPassword ? "text" : type;

    const isIdentifierField =
      type === "email" || type === "url" || type === "search" || isPassword;

    const height = isFloatingLabel
      ? variant === "filled"
        ? TEXT_FIELD_TOKENS.filledHeight
        : TEXT_FIELD_TOKENS.outlinedHeight
      : 48;

    const baseRadius = isFloatingLabel
      ? variant === "filled"
        ? TEXT_FIELD_TOKENS.filledTopRadius
        : TEXT_FIELD_TOKENS.outlinedRadius
      : TEXT_FIELD_TOKENS.outsideLabelRadius;

    const containerRadius =
      variant === "filled"
        ? `${baseRadius}px ${baseRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px`
        : `${baseRadius}px`;

    const handleChange = (next: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    };

    const hasCounter = Boolean(showCharacterCount && maxLength);

    return (
      <BaseField.Root
        name={name}
        disabled={isDisabled || undefined}
        invalid={errorMessage ? true : invalid}
        validate={validate}
        className={className ? `m3e-field ${className}` : "m3e-field"}
        data-label-position={labelPosition}
        data-readonly={readOnly ? "" : undefined}
        style={style}
      >
        {!isFloatingLabel ? (
          <>
            <div className="m3e-field__label-row">
              <BaseField.Label className="m3e-field__label">
                {label}
                {required ? (
                  <span className="m3e-field__required" aria-hidden="true">
                    {" "}*
                  </span>
                ) : null}
              </BaseField.Label>
              {hasCounter ? (
                <span className="m3e-field__counter" aria-live="off">
                  {currentVal.length}/{maxLength}
                </span>
              ) : null}
            </div>
            {description ? (
              <BaseField.Description className="m3e-field__description">
                {description}
              </BaseField.Description>
            ) : null}
          </>
        ) : null}

        <div
          className="m3e-text-field__shell"
          data-variant={variant}
          data-label-position={labelPosition}
          data-floating={isLabelFloated ? "" : undefined}
          data-populated={isPopulated ? "" : undefined}
          data-has-leading={leadingIcon ? "" : undefined}
          data-invalid={invalid || Boolean(errorMessage) ? "" : undefined}
          data-disabled={isDisabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          style={{
            minHeight: `${height}px`,
            paddingInline: `${TEXT_FIELD_TOKENS.paddingInline}px`,
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

            <div className="m3e-text-field__input-line">
              {prefixText ? (
                <span className="m3e-text-field__text-affix" aria-hidden="true">
                  {prefixText}
                </span>
              ) : null}

              <BaseInput
                ref={(node) => {
                  const inputNode =
                    node instanceof HTMLInputElement ? node : null;
                  inputRef.current = inputNode;
                  assignRef(ref, inputNode);
                }}
                id={id}
                type={effectiveType}
                value={currentVal}
                onValueChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                required={required}
                readOnly={readOnly}
                autoComplete={autoComplete}
                inputMode={inputMode}
                enterKeyHint={enterKeyHint}
                pattern={pattern}
                minLength={minLength}
                maxLength={maxLength}
                autoCorrect={isIdentifierField ? "off" : undefined}
                autoCapitalize={isIdentifierField ? "none" : undefined}
                spellCheck={isIdentifierField ? false : undefined}
                className="m3e-text-field__input"
              />

              {suffixText ? (
                <span className="m3e-text-field__text-affix" aria-hidden="true">
                  {suffixText}
                </span>
              ) : null}
            </div>
          </div>

          {clearable && currentVal.length > 0 && !isDisabled && !readOnly ? (
            <button
              type="button"
              aria-label={t("textField.clear")}
              className="m3e-text-field__icon-btn"
              onClick={() => {
                handleChange("");
                inputRef.current?.focus();
              }}
            >
              <ClearGlyph />
            </button>
          ) : null}

          {isPassword ? (
            <button
              type="button"
              disabled={isDisabled}
              aria-pressed={showPassword}
              aria-label={
                showPassword
                  ? t("textField.hidePassword")
                  : t("textField.showPassword")
              }
              className="m3e-text-field__icon-btn"
              onClick={() => setShowPassword((s) => !s)}
            >
              <EyeGlyph shown={showPassword} />
            </button>
          ) : null}

          {trailingIcon ? (
            <span className="m3e-text-field__affix" aria-hidden="true">
              {trailingIcon}
            </span>
          ) : null}
        </div>

        {isFloatingLabel && (description || hasCounter) ? (
          <div className="m3e-field__supporting-row">
            {description ? (
              <BaseField.Description className="m3e-field__description">
                {description}
              </BaseField.Description>
            ) : (
              <span />
            )}
            {hasCounter ? (
              <span className="m3e-field__counter" aria-live="off">
                {currentVal.length}/{maxLength}
              </span>
            ) : null}
          </div>
        ) : null}

        {!isDisabled ? (
          <BaseField.Error
            match={invalid || Boolean(errorMessage) ? true : undefined}
            className="m3e-field__error"
            render={(errorProps) => {
              const baseError =
                errorProps.children !== "" ? errorProps.children : undefined;
              const resolvedMessage =
                errorMessage ??
                baseError ??
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

export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  M3ETextareaFieldProps
>(function TextareaField(
  {
    label,
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    variant = "outlined",
    labelPosition = "floating",
    rows = 3,
    name,
    id,
    placeholder,
    description,
    errorMessage,
    invalid,
    validate,
    required = false,
    disabled,
    readOnly = false,
    maxLength,
    showCharacterCount = false,
    className,
    style,
  },
  ref,
) {
  const { t } = useM3EI18n();
  const isDisabled = useFieldsetDisabled(disabled);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const defaultValRef = React.useRef(defaultValue);
  defaultValRef.current = defaultValue;

  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<string>(defaultValue);
  const [isFocused, setIsFocused] = React.useState(false);

  useFormReset(
    textareaRef,
    () => setUncontrolledValue(defaultValRef.current),
    controlledValue === undefined,
  );

  const currentVal = controlledValue ?? uncontrolledValue;
  const isPopulated = currentVal.length > 0;
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const isLabelFloated = isFocused || isPopulated;

  const baseRadius = isFloatingLabel
    ? variant === "filled"
      ? TEXT_FIELD_TOKENS.filledTopRadius
      : TEXT_FIELD_TOKENS.outlinedRadius
    : TEXT_FIELD_TOKENS.outsideLabelRadius;

  const containerRadius =
    variant === "filled"
      ? `${baseRadius}px ${baseRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px`
      : `${baseRadius}px`;

  const hasCounter = Boolean(showCharacterCount && maxLength);

  return (
    <BaseField.Root
      name={name}
      disabled={isDisabled || undefined}
      invalid={errorMessage ? true : invalid}
      validate={validate}
      className={className ? `m3e-field ${className}` : "m3e-field"}
      data-label-position={labelPosition}
      data-readonly={readOnly ? "" : undefined}
      style={style}
    >
      {!isFloatingLabel ? (
        <>
          <div className="m3e-field__label-row">
            <BaseField.Label className="m3e-field__label">
              {label}
              {required ? (
                <span className="m3e-field__required" aria-hidden="true">
                  {" "}*
                </span>
              ) : null}
            </BaseField.Label>
            {hasCounter ? (
              <span className="m3e-field__counter" aria-live="off">
                {currentVal.length}/{maxLength}
              </span>
            ) : null}
          </div>
          {description ? (
            <BaseField.Description className="m3e-field__description">
              {description}
            </BaseField.Description>
          ) : null}
        </>
      ) : null}

      <div
        className="m3e-text-field__shell m3e-text-field__shell--textarea"
        data-variant={variant}
        data-label-position={labelPosition}
        data-floating={isLabelFloated ? "" : undefined}
        data-populated={isPopulated ? "" : undefined}
        data-invalid={invalid || Boolean(errorMessage) ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        style={{
          paddingInline: `${TEXT_FIELD_TOKENS.paddingInline}px`,
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

        <div className="m3e-text-field__control-stack m3e-text-field__control-stack--textarea">
          {isFloatingLabel ? (
            <BaseField.Label
              className="m3e-field__floating-label m3e-field__floating-label--textarea"
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

          <BaseField.Control
            id={id}
            required={required}
            readOnly={readOnly}
            render={(props) => (
              <textarea
                {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                ref={(node) => {
                  textareaRef.current = node;
                  const baseRef = (props as { ref?: React.Ref<HTMLTextAreaElement> }).ref;
                  if (typeof baseRef === "function") baseRef(node);
                  else if (baseRef && "current" in baseRef) {
                    (baseRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
                  }
                  assignRef(ref, node);
                }}
                rows={rows}
                placeholder={placeholder}
                maxLength={maxLength}
                value={currentVal}
                onFocus={(e) => {
                  setIsFocused(true);
                  (props as React.TextareaHTMLAttributes<HTMLTextAreaElement>).onFocus?.(e);
                }}
                onBlur={(e) => {
                  setIsFocused(false);
                  (props as React.TextareaHTMLAttributes<HTMLTextAreaElement>).onBlur?.(e);
                }}
                onChange={(e) => {
                  if (controlledValue === undefined) {
                    setUncontrolledValue(e.target.value);
                  }
                  onValueChange?.(e.target.value);
                  (props as React.TextareaHTMLAttributes<HTMLTextAreaElement>).onChange?.(e);
                }}
                className="m3e-text-field__textarea"
              />
            )}
          />
        </div>
      </div>

      {isFloatingLabel && (description || hasCounter) ? (
        <div className="m3e-field__supporting-row">
          {description ? (
            <BaseField.Description className="m3e-field__description">
              {description}
            </BaseField.Description>
          ) : (
            <span />
          )}
          {hasCounter ? (
            <span className="m3e-field__counter" aria-live="off">
              {currentVal.length}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}

      {!isDisabled ? (
        <BaseField.Error
          match={invalid || Boolean(errorMessage) ? true : undefined}
          className="m3e-field__error"
          render={(errorProps) => {
            const baseError =
              errorProps.children !== "" ? errorProps.children : undefined;
            const resolvedMessage =
              errorMessage ??
              baseError ??
              (invalid ? t("textField.textareaDefaultInvalid") : null);
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

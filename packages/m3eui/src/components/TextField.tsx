import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { TEXT_FIELD_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";

export type TextFieldVariant = "outlined" | "filled";

export interface M3ETextFieldProps {
  readonly label: React.ReactNode;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly variant?: TextFieldVariant;
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
  readonly rows?: number;
  readonly name?: string;
  readonly id?: string;
  readonly placeholder?: string;
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
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

function ErrorIconSvg({ label }: { readonly label: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export const TextField = React.forwardRef<HTMLInputElement, M3ETextFieldProps>(
  function TextField(
    {
      label,
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      variant = "outlined",
      type = "text",
      name,
      id,
      placeholder,
      description,
      errorMessage,
      invalid,
      validate,
      required = false,
      disabled = false,
      readOnly = false,
      autoComplete,
      inputMode,
      enterKeyHint,
      pattern,
      minLength,
      maxLength,
      showCharacterCount = false,
      clearable = false,
      leadingIcon,
      trailingIcon,
      className,
      style,
    },
    ref,
  ) {
    const { t } = useM3EI18n();
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState<string>(defaultValue);
    const [showPassword, setShowPassword] = React.useState(false);

    const currentVal = controlledValue ?? uncontrolledValue;
    const isPassword = type === "password";
    const effectiveType = isPassword && showPassword ? "text" : type;

    const isIdentifierField =
      type === "email" || type === "url" || type === "search" || isPassword;

    const height =
      variant === "filled"
        ? TEXT_FIELD_TOKENS.filledHeight
        : TEXT_FIELD_TOKENS.outlinedHeight;

    const containerRadius =
      variant === "filled"
        ? `${TEXT_FIELD_TOKENS.filledTopRadius}px ${TEXT_FIELD_TOKENS.filledTopRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px`
        : `${TEXT_FIELD_TOKENS.outlinedRadius}px`;

    const handleChange = (next: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    };

    return (
      <BaseField.Root
        name={name}
        disabled={disabled}
        invalid={invalid}
        validate={validate}
        validationMode="onBlur"
        className={className ? `m3e-field ${className}` : "m3e-field"}
        style={style}
      >
        <div className="m3e-field__label-row">
          <BaseField.Label className="m3e-field__label">
            {label}
            {required ? (
              <span className="m3e-field__required" aria-hidden="true">
                {" "}*
              </span>
            ) : null}
          </BaseField.Label>
          {showCharacterCount && maxLength ? (
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

        <div
          className="m3e-text-field__shell"
          data-variant={variant}
          data-invalid={invalid ? "" : undefined}
          style={{
            minHeight: `${height}px`,
            paddingInline: `${TEXT_FIELD_TOKENS.paddingInline}px`,
            borderRadius: containerRadius,
          }}
        >
          {leadingIcon ? (
            <span className="m3e-text-field__affix" aria-hidden="true">
              {leadingIcon}
            </span>
          ) : null}

          <BaseInput
            ref={ref}
            id={id}
          type={effectiveType}
          value={controlledValue}
          defaultValue={controlledValue === undefined ? defaultValue : undefined}
          onValueChange={handleChange}
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

        {clearable && currentVal.length > 0 && !disabled && !readOnly ? (
          <button
            type="button"
            aria-label={t("textField.clear")}
            className="m3e-text-field__icon-btn"
            onClick={() => handleChange("")}
          >
            <ClearGlyph />
          </button>
        ) : null}

        {isPassword ? (
          <button
            type="button"
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

      <BaseField.Error
        match={invalid ? true : undefined}
        className="m3e-field__error"
      >
        <ErrorIconSvg label={t("textField.errorIcon")} />
        <span>{errorMessage ?? t("textField.defaultInvalid")}</span>
      </BaseField.Error>
    </BaseField.Root>
  );
},
);

export function TextareaField({
  label,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  variant = "outlined",
  rows = 3,
  name,
  id,
  placeholder,
  description,
  errorMessage,
  invalid,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  showCharacterCount = false,
  className,
  style,
}: M3ETextareaFieldProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(defaultValue);
  const currentVal = controlledValue ?? uncontrolledValue;

  const containerRadius =
    variant === "filled"
      ? `${TEXT_FIELD_TOKENS.filledTopRadius}px ${TEXT_FIELD_TOKENS.filledTopRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px ${TEXT_FIELD_TOKENS.filledBottomRadius}px`
      : `${TEXT_FIELD_TOKENS.outlinedRadius}px`;

  return (
    <BaseField.Root
      name={name}
      disabled={disabled}
      invalid={invalid}
      validationMode="onBlur"
      className={className ? `m3e-field ${className}` : "m3e-field"}
      style={style}
    >
      <div className="m3e-field__label-row">
        <BaseField.Label className="m3e-field__label">
          {label}
          {required ? (
            <span className="m3e-field__required" aria-hidden="true">
              {" "}*
            </span>
          ) : null}
        </BaseField.Label>
        {showCharacterCount && maxLength ? (
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

      <div
        className="m3e-text-field__shell m3e-text-field__shell--textarea"
        data-variant={variant}
        data-invalid={invalid ? "" : undefined}
        style={{
          paddingInline: `${TEXT_FIELD_TOKENS.paddingInline}px`,
          borderRadius: containerRadius,
        }}
      >
        <BaseField.Control
          id={id}
          required={required}
          readOnly={readOnly}
          render={(props) => (
            <textarea
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              rows={rows}
              placeholder={placeholder}
              maxLength={maxLength}
              value={controlledValue}
              defaultValue={controlledValue === undefined ? defaultValue : undefined}
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

      <BaseField.Error
        match={invalid ? true : undefined}
        className="m3e-field__error"
      >
        <ErrorIconSvg label={t("textField.errorIcon")} />
        <span>{errorMessage ?? t("textField.textareaDefaultInvalid")}</span>
      </BaseField.Error>
    </BaseField.Root>
  );
}

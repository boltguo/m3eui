import * as React from "react";
import { useFormReset } from "../../internal/formField.js";
import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { useM3EI18n } from "../../context/M3EContext.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../../internal/fieldOutline.js";
import { assignRef } from "../../internal/assignRef.js";
import { CloseIcon } from "../../internal/icons.js";
import { useM3ERipple } from "../../internal/ripple.js";

function FieldActionIconButton({
  disabled,
  ariaLabel,
  ariaPressed,
  onClick,
  children,
}: {
  readonly disabled?: boolean;
  readonly ariaLabel: string;
  readonly ariaPressed?: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      className="m3e-text-field__icon-btn"
      onClick={onClick}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {children}
    </button>
  );
}

export type TextFieldVariant = "outlined" | "filled";
export type FieldLabelPosition = "floating" | "outside";

interface TextFieldBaseProps {
  readonly label: React.ReactNode;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly variant?: TextFieldVariant;
  readonly labelPosition?: FieldLabelPosition;
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

export interface M3ETextFieldSingleLineProps extends TextFieldBaseProps {
  readonly multiline?: false;
  readonly type?: "text" | "email" | "password" | "search" | "tel" | "url";
  readonly autoComplete?: string;
  readonly inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  readonly enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
  readonly pattern?: string;
  readonly minLength?: number;
  readonly clearable?: boolean;
  readonly prefixText?: React.ReactNode;
  readonly suffixText?: React.ReactNode;
  readonly leadingIcon?: React.ReactNode;
  readonly trailingIcon?: React.ReactNode;
}

export interface M3ETextFieldMultilineProps extends TextFieldBaseProps {
  readonly multiline: true;
  readonly rows?: number;
}

export type M3ETextFieldProps =
  | M3ETextFieldSingleLineProps
  | M3ETextFieldMultilineProps;

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

function useFieldValue<T extends HTMLElement>(
  controlledValue: string | undefined,
  defaultValue: string,
  onValueChange: ((value: string) => void) | undefined,
) {
  const controlRef = React.useRef<T | null>(null);
  const defaultValRef = React.useRef(defaultValue);
  defaultValRef.current = defaultValue;

  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<string>(defaultValue);
  const [isFocused, setIsFocused] = React.useState(false);

  useFormReset(
    controlRef,
    () => setUncontrolledValue(defaultValRef.current),
    controlledValue === undefined,
  );

  const setValue = (next: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(next);
    }
    onValueChange?.(next);
  };

  return {
    controlRef,
    value: controlledValue ?? uncontrolledValue,
    setValue,
    isFocused,
    setIsFocused,
  };
}

interface FieldFrameProps
  extends Pick<
    TextFieldBaseProps,
    | "label"
    | "name"
    | "description"
    | "errorMessage"
    | "invalid"
    | "validate"
    | "maxLength"
    | "className"
    | "style"
  > {
  readonly variant: TextFieldVariant;
  readonly labelPosition: FieldLabelPosition;
  readonly required: boolean;
  readonly readOnly: boolean;
  readonly isDisabled: boolean;
  readonly floated: boolean;
  readonly valueLength: number;
  readonly showCharacterCount: boolean;
  readonly textarea?: boolean;
  readonly leading?: React.ReactNode;
  readonly trailing?: React.ReactNode;
  readonly children: React.ReactNode;
}

function FieldFrame({
  label,
  name,
  description,
  errorMessage,
  invalid,
  validate,
  maxLength,
  className,
  style,
  variant,
  labelPosition,
  required,
  readOnly,
  isDisabled,
  floated,
  valueLength,
  showCharacterCount,
  textarea = false,
  leading,
  trailing,
  children,
}: FieldFrameProps) {
  const { t } = useM3EI18n();
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const hasCounter = Boolean(showCharacterCount && maxLength);
  const hasError = invalid || Boolean(errorMessage);

  const labelContent = (
    <>
      {label}
      {required ? (
        <span className="m3e-field__required" aria-hidden="true">
          {" "}*
        </span>
      ) : null}
    </>
  );

  const counter = hasCounter ? (
    <span className="m3e-field__counter" aria-live="off">
      {valueLength}/{maxLength}
    </span>
  ) : null;

  const descriptionNode = description ? (
    <BaseField.Description className="m3e-field__description">
      {description}
    </BaseField.Description>
  ) : null;

  const textareaMod = (base: string) =>
    textarea ? `${base} ${base}--textarea` : base;

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
              {labelContent}
            </BaseField.Label>
            {counter}
          </div>
          {descriptionNode}
        </>
      ) : null}

      <div
        className={textareaMod("m3e-text-field__shell")}
        data-variant={variant}
        data-label-position={labelPosition}
        data-has-floating-label={isFloatingLabel ? "" : undefined}
        data-floating={floated ? "" : undefined}
        data-populated={valueLength > 0 ? "" : undefined}
        data-has-leading={leading ? "" : undefined}
        data-invalid={hasError ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
      >
        {isFloatingLabel && variant === "outlined" ? (
          <FieldNotchedOutline
            label={label}
            required={required}
            floating={floated}
          />
        ) : null}

        {leading ? (
          <span className="m3e-text-field__affix" aria-hidden="true">
            {leading}
          </span>
        ) : null}

        <div className={textareaMod("m3e-text-field__control-stack")}>
          {isFloatingLabel ? (
            <BaseField.Label
              className={textareaMod("m3e-field__floating-label")}
              data-floating={floated ? "" : undefined}
            >
              {labelContent}
            </BaseField.Label>
          ) : null}
          {children}
        </div>

        {trailing}
      </div>

      {isFloatingLabel && (description || hasCounter) ? (
        <div className="m3e-field__supporting-row">
          {descriptionNode ?? <span />}
          {counter}
        </div>
      ) : null}

      {!isDisabled ? (
        <BaseField.Error
          match={hasError ? true : undefined}
          className="m3e-field__error"
          render={(errorProps) => {
            const baseError =
              errorProps.children !== "" ? errorProps.children : undefined;
            const resolvedMessage =
              errorMessage ??
              baseError ??
              (invalid
                ? t(
                    textarea
                      ? "textField.textareaDefaultInvalid"
                      : "textField.defaultInvalid",
                  )
                : null);
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

const SingleLineField = React.forwardRef<HTMLInputElement, M3ETextFieldSingleLineProps>(
  function SingleLineField(
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      variant = "outlined",
      labelPosition = "floating",
      type = "text",
      id,
      placeholder,
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
      ...frameProps
    },
    ref,
  ) {
    const { t } = useM3EI18n();
    const isDisabled = useFieldsetDisabled(disabled);
    const {
      controlRef: inputRef,
      value: currentVal,
      setValue: handleChange,
      isFocused,
      setIsFocused,
    } = useFieldValue<HTMLInputElement>(controlledValue, defaultValue, onValueChange);
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === "password";
    const effectiveType = isPassword && showPassword ? "text" : type;

    const isIdentifierField =
      type === "email" || type === "url" || type === "search" || isPassword;

    return (
      <FieldFrame
        {...frameProps}
        variant={variant}
        labelPosition={labelPosition}
        required={required}
        readOnly={readOnly}
        isDisabled={isDisabled}
        floated={
          isFocused ||
          currentVal.length > 0 ||
          Boolean(prefixText) ||
          Boolean(suffixText)
        }
        valueLength={currentVal.length}
        maxLength={maxLength}
        showCharacterCount={showCharacterCount}
        leading={leadingIcon}
        trailing={
          <>
            {clearable && currentVal.length > 0 && !isDisabled && !readOnly ? (
              <FieldActionIconButton
                ariaLabel={t("textField.clear")}
                onClick={() => {
                  handleChange("");
                  inputRef.current?.focus();
                }}
              >
                <CloseIcon size={15} strokeWidth="2.3" />
              </FieldActionIconButton>
            ) : null}

            {isPassword ? (
              <FieldActionIconButton
                disabled={isDisabled}
                ariaPressed={showPassword}
                ariaLabel={
                  showPassword
                    ? t("textField.hidePassword")
                    : t("textField.showPassword")
                }
                onClick={() => setShowPassword((s) => !s)}
              >
                <EyeGlyph shown={showPassword} />
              </FieldActionIconButton>
            ) : null}

            {trailingIcon ? (
              <span className="m3e-text-field__affix" aria-hidden="true">
                {trailingIcon}
              </span>
            ) : null}
          </>
        }
      >
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
      </FieldFrame>
    );
  },
);

const MultilineField = React.forwardRef<
  HTMLTextAreaElement,
  M3ETextFieldMultilineProps
>(function MultilineField(
  {
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    variant = "outlined",
    labelPosition = "floating",
    rows = 3,
    id,
    placeholder,
    required = false,
    disabled,
    readOnly = false,
    maxLength,
    showCharacterCount = false,
    ...frameProps
  },
  ref,
) {
  const isDisabled = useFieldsetDisabled(disabled);
  const {
    controlRef: textareaRef,
    value: currentVal,
    setValue,
    isFocused,
    setIsFocused,
  } = useFieldValue<HTMLTextAreaElement>(controlledValue, defaultValue, onValueChange);

  return (
    <FieldFrame
      {...frameProps}
      variant={variant}
      labelPosition={labelPosition}
      required={required}
      readOnly={readOnly}
      isDisabled={isDisabled}
      floated={isFocused || currentVal.length > 0}
      valueLength={currentVal.length}
      maxLength={maxLength}
      showCharacterCount={showCharacterCount}
      textarea
    >
      <BaseField.Control
        id={id}
        required={required}
        readOnly={readOnly}
        render={(props) => {
          const baseProps = props as React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
            ref?: React.Ref<HTMLTextAreaElement>;
          };
          return (
            <textarea
              {...baseProps}
              ref={(node) => {
                textareaRef.current = node;
                assignRef(baseProps.ref, node);
                assignRef(ref, node);
              }}
              rows={rows}
              placeholder={placeholder}
              maxLength={maxLength}
              value={currentVal}
              onFocus={(e) => {
                setIsFocused(true);
                baseProps.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                baseProps.onBlur?.(e);
              }}
              onChange={(e) => {
                setValue(e.target.value);
                baseProps.onChange?.(e);
              }}
              className="m3e-text-field__textarea"
            />
          );
        }}
      />
    </FieldFrame>
  );
});

export const TextField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  M3ETextFieldProps
>(function TextField(props, ref) {
  return props.multiline ? (
    <MultilineField {...props} ref={ref as React.Ref<HTMLTextAreaElement>} />
  ) : (
    <SingleLineField {...props} ref={ref as React.Ref<HTMLInputElement>} />
  );
}) as {
  (
    props: M3ETextFieldSingleLineProps & React.RefAttributes<HTMLInputElement>,
  ): React.JSX.Element;
  (
    props: M3ETextFieldMultilineProps & React.RefAttributes<HTMLTextAreaElement>,
  ): React.JSX.Element;
};

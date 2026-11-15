import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import {
  OTP_FIELD_TOKENS,
  resolveOtpSlotCorners,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { FieldErrorIconSvg, useFieldsetDisabled } from "../internal/fieldOutline.js";

export interface M3EOTPFieldProps {
  readonly length?: number;
  readonly separatorAfterIndex?: number;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onValueComplete?: (value: string) => void;
  readonly label?: React.ReactNode;
  readonly helperText?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly mask?: boolean;
  readonly validationType?: "numeric" | "alphanumeric" | "alpha" | "none";
  readonly enableWebOTP?: boolean;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function OTPSlotCell({
  index,
  length,
  isFirstInGroup,
  isLastInGroup,
  disabled,
}: {
  readonly index: number;
  readonly length: number;
  readonly isFirstInGroup: boolean;
  readonly isLastInGroup: boolean;
  readonly disabled: boolean;
}) {
  const { t } = useM3E();
  const [focused, setFocused] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(disabled);

  const corners = resolveOtpSlotCorners({
    index,
    count: length,
    isFirstInGroup,
    isLastInGroup,
    isFocused: focused,
    isPressed,
  });

  const { ref: slotRef, borderRadiusCss } =
    useM3ECornerSpringRef<HTMLInputElement>(corners, "fastSpatial");

  return (
    <BaseOTPField.Input
      ref={slotRef}
      aria-label={
        index === 0 ? undefined : t("otpField.digitLabel", { index: index + 1 })
      }
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        pressHandlers.onBlur();
      }}
      onPointerDown={pressHandlers.onPointerDown}
      onPointerUp={pressHandlers.onPointerUp}
      onPointerLeave={pressHandlers.onPointerLeave}
      onPointerCancel={pressHandlers.onPointerCancel}
      className="m3e-otp-field__slot"
      data-focused={focused ? "" : undefined}
      style={{
        width: `${OTP_FIELD_TOKENS.slotWidth}px`,
        height: `${OTP_FIELD_TOKENS.slotHeight}px`,
        fontSize: `${OTP_FIELD_TOKENS.minFontSize}px`,
        borderRadius: borderRadiusCss,
      }}
    />
  );
}

export function OTPField({
  length = 6,
  separatorAfterIndex = 2,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onValueComplete,
  label,
  helperText,
  errorMessage,
  invalid = false,
  name,
  id,
  mask = false,
  validationType = "numeric",
  enableWebOTP = false,
  disabled,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EOTPFieldProps): React.JSX.Element {
  const { t } = useM3E();
  const isDisabled = useFieldsetDisabled(disabled);
  const generatedId = React.useId();
  const firstInputId = id ?? generatedId;
  const hintId = React.useId();
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const defaultValRef = React.useRef(defaultValue ?? "");
  defaultValRef.current = defaultValue ?? "";

  const [uncontrolledVal, setUncontrolledVal] = React.useState<string>(
    defaultValue ?? "",
  );
  const currentVal = controlledValue ?? uncontrolledVal;

  React.useEffect(() => {
    if (controlledValue !== undefined) return;
    const form = wrapRef.current?.closest("form");
    if (!form) return;
    const onReset = () => {
      setUncontrolledVal(defaultValRef.current);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [controlledValue]);

  React.useEffect(() => {
    if (
      !enableWebOTP ||
      isDisabled ||
      typeof window === "undefined" ||
      !("OTPCredential" in window) ||
      typeof navigator === "undefined" ||
      !navigator.credentials
    ) {
      return undefined;
    }

    const ac = new AbortController();
    navigator.credentials
      .get({
        ...({ otp: { transport: ["sms"] }, signal: ac.signal } as CredentialRequestOptions),
      })
      .then((cred) => {
        const code = (cred as { code?: string } | null)?.code;
        if (!code) return;
        const trimmed = code.slice(0, length);
        if (controlledValue === undefined) {
          setUncontrolledVal(trimmed);
        }
        onValueChange?.(trimmed);
        if (trimmed.length === length) {
          onValueComplete?.(trimmed);
        }
      })
      .catch((err: unknown) => {
        if (err && typeof err === "object" && (err as { name?: string }).name === "AbortError") {
          return;
        }
      });

    return () => {
      ac.abort();
    };
  }, [enableWebOTP, isDisabled, length, controlledValue, onValueChange, onValueComplete]);

  return (
    <BaseField.Root
      ref={wrapRef}
      name={name}
      disabled={isDisabled || undefined}
      invalid={invalid || undefined}
      className={
        className ? `m3e-otp-field-wrap ${className}` : "m3e-otp-field-wrap"
      }
      style={style}
    >
      <label
        htmlFor={firstInputId}
        className={label ? "m3e-otp-field__label" : "m3e-sr-only"}
      >
        {label ?? ariaLabel ?? t("otpField.digitLabel", { index: 1 })}
      </label>

      {helperText ? (
        <p id={hintId} className="m3e-otp-field__hint">
          {helperText}
        </p>
      ) : null}

      <BaseOTPField.Root
        id={firstInputId}
        name={name}
        dir="ltr"
        aria-label={ariaLabel}
        length={length}
        value={currentVal}
        autoComplete="one-time-code"
        inputMode={validationType === "numeric" ? "numeric" : "text"}
        validationType={validationType}
        mask={mask}
        disabled={isDisabled}
        aria-describedby={helperText ? hintId : undefined}
        onValueChange={(next) => {
          if (controlledValue === undefined) {
            setUncontrolledVal(next);
          }
          onValueChange?.(next);
        }}
        onValueComplete={(completed) => {
          onValueComplete?.(completed);
        }}
        className="m3e-otp-field"
        data-complete={currentVal.length === length ? "" : undefined}
        style={{ gap: `${OTP_FIELD_TOKENS.slotGap}px` }}
      >
        {Array.from({ length }, (_, idx) => {
          const hasSepBefore =
            separatorAfterIndex !== undefined && idx === separatorAfterIndex + 1;
          const hasSepAfter =
            separatorAfterIndex !== undefined &&
            idx === separatorAfterIndex &&
            idx < length - 1;

          const isFirstInGroup = idx === 0 || hasSepBefore;
          const isLastInGroup = idx === length - 1 || hasSepAfter;

          return (
            <React.Fragment key={idx}>
              <OTPSlotCell
                index={idx}
                length={length}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                disabled={isDisabled}
              />
              {hasSepAfter ? (
                <BaseOTPField.Separator className="m3e-otp-field__separator">
                  –
                </BaseOTPField.Separator>
              ) : null}
            </React.Fragment>
          );
        })}
      </BaseOTPField.Root>

      {invalid ? (
        <div className="m3e-field__error" role="alert">
          <FieldErrorIconSvg label={t("textField.errorIcon")} />
          <span>{errorMessage ?? t("textField.defaultInvalid")}</span>
        </div>
      ) : null}
    </BaseField.Root>
  );
}

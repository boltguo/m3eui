import * as React from "react";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import {
  OTP_FIELD_TOKENS,
  flipCornersHorizontal,
  resolveOtpSlotCorners,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import {
  useM3ECornerSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export interface M3EOTPFieldProps {
  readonly length?: number;
  /** Optional index after which a group separator `-` is inserted (e.g. `3` for `3 + 3` layout) */
  readonly separatorAfterIndex?: number;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onValueComplete?: (value: string) => void;
  readonly label?: React.ReactNode;
  readonly helperText?: React.ReactNode;
  readonly mask?: boolean;
  readonly validationType?: "numeric" | "alphanumeric" | "alpha" | "none";
  readonly enableWebOTP?: boolean;
  readonly disabled?: boolean;
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
  const { direction, t } = useM3E();
  const [focused, setFocused] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(disabled);

  const rawCorners = resolveOtpSlotCorners({
    index,
    count: length,
    isFirstInGroup,
    isLastInGroup,
    isFocused: focused,
    isPressed,
  });
  const corners =
    direction === "rtl" ? flipCornersHorizontal(rawCorners) : rawCorners;

  const { borderRadiusCss } = useM3ECornerSpring(corners, "fastSpatial");

  return (
    <BaseOTPField.Input
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

/**
 * M3E Connected OTP Verification Field (`@base-ui/react/otp-field` v1.9.0).
 *
 * - Instructional helper text is placed **above** the inputs (`aria-describedby`) per
 *   `modern-web-guidance` (`sms-otp-form`) so autofill popovers & virtual keyboards never obscure it.
 * - Uses `autoComplete="one-time-code"` + `inputMode="numeric"` + optional progressive WebOTP
 *   (`OTPCredential`) listener managed with an `AbortController`.
 */
export function OTPField({
  length = 6,
  separatorAfterIndex = 2,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onValueComplete,
  label,
  helperText,
  mask = false,
  validationType = "numeric",
  enableWebOTP = false,
  disabled = false,
  className,
  style,
}: M3EOTPFieldProps): React.JSX.Element {
  const firstInputId = React.useId();
  const hintId = React.useId();
  const [uncontrolledVal, setUncontrolledVal] = React.useState<string>(
    defaultValue ?? "",
  );
  const currentVal = controlledValue ?? uncontrolledVal;

  // Progressive WebOTP API integration (`if ('OTPCredential' in window)`) with clean AbortController lifecycle
  React.useEffect(() => {
    if (
      !enableWebOTP ||
      disabled ||
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
        // Cast WebOTP transport options cleanly without global DOM type pollution
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
  }, [enableWebOTP, disabled, length, controlledValue, onValueChange, onValueComplete]);

  return (
    <div
      className={
        className ? `m3e-otp-field-wrap ${className}` : "m3e-otp-field-wrap"
      }
      style={style}
    >
      {label ? (
        <label htmlFor={firstInputId} className="m3e-otp-field__label">
          {label}
        </label>
      ) : null}

      {/* Place instructional hint ABOVE the input row per `sms-otp-form` */}
      {helperText ? (
        <p id={hintId} className="m3e-otp-field__hint">
          {helperText}
        </p>
      ) : null}

      <BaseOTPField.Root
        id={firstInputId}
        length={length}
        value={controlledValue}
        defaultValue={defaultValue}
        autoComplete="one-time-code"
        inputMode={validationType === "numeric" ? "numeric" : "text"}
        validationType={validationType}
        mask={mask}
        disabled={disabled}
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
                disabled={disabled}
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
    </div>
  );
}

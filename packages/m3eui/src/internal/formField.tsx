import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";

const HIDDEN_CONTROL_STYLE: React.CSSProperties = {
  position: "absolute",
  inlineSize: "1px",
  blockSize: "1px",
  margin: 0,
  padding: 0,
  border: 0,
  clipPath: "inset(50%)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  opacity: 0,
};

export function FormFieldScope({
  name,
  disabled,
  children,
}: {
  readonly name: string | undefined;
  readonly disabled?: boolean;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  if (!name) return <>{children}</>;
  return (
    <BaseField.Root name={name} disabled={disabled} className="m3e-form-field">
      {children}
    </BaseField.Root>
  );
}

export function FormHiddenValue({
  name,
  value,
  disabled,
  required,
  pattern,
  triggerRef,
}: {
  readonly name: string | undefined;
  readonly value: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly pattern?: string;
  readonly triggerRef?: React.RefObject<HTMLElement | null>;
}): React.JSX.Element {
  return (
    <BaseField.Control
      type="text"
      name={name}
      value={value}
      onChange={() => {}}
      disabled={disabled}
      required={required}
      pattern={pattern}
      tabIndex={-1}
      aria-hidden="true"
      suppressHydrationWarning
      style={HIDDEN_CONTROL_STYLE}
      onFocus={() => {
        triggerRef?.current?.focus();
      }}
    />
  );
}

export function useFormReset(
  elementRef: React.RefObject<HTMLElement | null>,
  onReset: () => void,
  enabled: boolean,
): void {
  const onResetRef = React.useRef(onReset);
  onResetRef.current = onReset;
  React.useEffect(() => {
    const el = enabled ? elementRef.current : null;
    const form = el instanceof HTMLInputElement ? el.form : el?.closest("form");
    if (!form) return;
    const handler = () => onResetRef.current();
    form.addEventListener("reset", handler);
    return () => form.removeEventListener("reset", handler);
  }, [enabled, elementRef]);
}

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";

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
}: {
  readonly name: string | undefined;
  readonly value: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
}): React.JSX.Element | null {
  if (!name) return null;
  return (
    <BaseField.Root name={name} disabled={disabled} className="m3e-form-field">
      <BaseField.Control
        type="hidden"
        value={value}
        required={required}
        readOnly
      />
    </BaseField.Root>
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

import * as React from "react";

export const FieldsetDisabledContext = React.createContext<boolean>(false);

export function useFieldsetDisabled(disabled?: boolean): boolean {
  const parentDisabled = React.useContext(FieldsetDisabledContext);
  return Boolean(parentDisabled || disabled);
}

export function FieldErrorIconSvg({ label }: { readonly label?: string }) {
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
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export interface FieldNotchedOutlineProps {
  readonly label: React.ReactNode;
  readonly required?: boolean;
  readonly floating: boolean;
}

export function FieldNotchedOutline({
  label,
  required,
  floating,
}: FieldNotchedOutlineProps) {
  const legendContent = (
    <legend className="m3e-field__outline-legend">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
    </legend>
  );

  return (
    <React.Fragment>
      <fieldset
        aria-hidden="true"
        className="m3e-field__outline"
        data-floating={floating ? "" : undefined}
      >
        {legendContent}
      </fieldset>
      <fieldset
        aria-hidden="true"
        className="m3e-field__outline-active"
        data-floating={floating ? "" : undefined}
      >
        {legendContent}
      </fieldset>
    </React.Fragment>
  );
}

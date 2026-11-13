"use client";

import * as React from "react";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { Form as BaseForm } from "@base-ui/react/form";
import { useM3EI18n } from "../context/M3EProvider.js";

export interface M3EFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** External / server-side field validation errors keyed by field `name` */
  readonly errors?: Record<string, string | string[]>;
  /**
   * Validation timing strategy (`"onSubmit"` default avoids premature red text while typing,
   * then re-validates invalid fields on change after first submit).
   */
  readonly validationMode?: "onSubmit" | "onBlur" | "onChange";
  readonly onFormSubmit?: (
    formValues: Record<string, unknown>,
    eventDetails: { readonly event: SubmitEvent },
  ) => void;
  readonly onSubmit?: React.FormEventHandler<HTMLFormElement>;
  /** Renders an accessible summary banner when `errors` contains messages */
  readonly showErrorSummary?: boolean;
  readonly children: React.ReactNode;
}

/**
 * M3E Form (`@base-ui/react/form`)
 *
 * Coordinates native + external (`errors`) field validation across `TextField`, `NumberField`,
 * `Select`, `Combobox`, `Checkbox`, `RadioGroup`, and `Switch`, moving focus automatically
 * to the first invalid control on submit.
 */
export function Form({
  errors,
  validationMode = "onSubmit",
  onFormSubmit,
  onSubmit,
  showErrorSummary = false,
  className,
  children,
  ...rest
}: M3EFormProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const errorList = React.useMemo(() => {
    if (!errors) return [];
    return Object.entries(errors).flatMap(([field, msg]) => {
      if (Array.isArray(msg)) {
        return msg.filter(Boolean).map((m) => ({ field, message: m }));
      }
      return msg ? [{ field, message: msg }] : [];
    });
  }, [errors]);

  return (
    <BaseForm
      errors={errors}
      validationMode={validationMode}
      onFormSubmit={
        onFormSubmit
          ? (values, details) =>
              onFormSubmit(values, { event: details.event as SubmitEvent })
          : undefined
      }
      onSubmit={onSubmit}
      className={className ? `m3e-form ${className}` : "m3e-form"}
      {...rest}
    >
      {showErrorSummary && errorList.length > 0 ? (
        <div role="alert" className="m3e-form__error-summary">
          <strong className="m3e-form__error-title">
            {t("form.errorSummaryHeading", { count: errorList.length })}
          </strong>
          <ul className="m3e-form__error-list">
            {errorList.map((item, idx) => (
              <li key={`${item.field}-${idx}`}>{item.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {children}
    </BaseForm>
  );
}

export interface M3EFieldsetProps {
  /** Mandatory accessible legend rendered as the first child of `<fieldset>` */
  readonly legend: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly disabled?: boolean;
  readonly variant?: "outlined" | "tonal" | "plain";
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

/**
 * M3E Fieldset (`@base-ui/react/fieldset`)
 *
 * Enforces `<Fieldset.Legend>` as the first child of `<Fieldset.Root>` so screen readers
 * announce group context cleanly across grouped controls.
 */
export function Fieldset({
  legend,
  description,
  disabled = false,
  variant = "tonal",
  children,
  className,
  style,
}: M3EFieldsetProps): React.JSX.Element {
  const descId = React.useId();

  return (
    <BaseFieldset.Root
      disabled={disabled}
      aria-describedby={description ? descId : undefined}
      className={className ? `m3e-fieldset ${className}` : "m3e-fieldset"}
      data-variant={variant}
      style={style}
    >
      <BaseFieldset.Legend render={<legend />} className="m3e-fieldset__legend">
        {legend}
      </BaseFieldset.Legend>
      {description ? (
        <p id={descId} className="m3e-fieldset__description">
          {description}
        </p>
      ) : null}
      <div className="m3e-fieldset__body">{children}</div>
    </BaseFieldset.Root>
  );
}

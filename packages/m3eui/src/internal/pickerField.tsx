import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Field as BaseField } from "@base-ui/react/field";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { SELECT_TOKENS } from "../tokens/topology.js";
import { useM3EI18n } from "../context/M3EContext.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
} from "./fieldOutline.js";
import { FormHiddenValue } from "./formField.js";

export function FieldRoot({
  modal,
  open,
  onOpenChange,
  children,
}: {
  readonly modal: boolean;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const Root = modal ? BaseDialog.Root : BasePopover.Root;
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Root>
  );
}

export function FieldTrigger({
  modal,
  ...props
}: React.ComponentProps<typeof BasePopover.Trigger> & {
  readonly modal: boolean;
}): React.JSX.Element {
  return modal ? (
    <BaseDialog.Trigger
      {...(props as React.ComponentProps<typeof BaseDialog.Trigger>)}
    />
  ) : (
    <BasePopover.Trigger {...props} />
  );
}

export interface PickerFieldRenderState {
  readonly isFieldInvalid: boolean;
  readonly triggerAriaProps: {
    readonly id: string;
    readonly "aria-required"?: true;
    readonly "aria-invalid"?: true;
    readonly "aria-describedby"?: string;
  };
}

export function PickerFieldFrame({
  id,
  name,
  label,
  labelPosition = "floating",
  description,
  errorMessage,
  invalid = false,
  required = false,
  disabled = false,
  readOnly = false,
  floating = true,
  popupOpen = false,
  hiddenValue,
  hiddenPattern,
  validate,
  triggerRef,
  className,
  style,
  children,
}: {
  readonly id?: string;
  readonly name?: string;
  readonly label?: React.ReactNode;
  readonly labelPosition?: "floating" | "outside";
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly floating?: boolean;
  readonly popupOpen?: boolean;
  readonly hiddenValue: string;
  readonly hiddenPattern?: string;
  readonly validate?: () => string | string[] | null;
  readonly triggerRef: React.RefObject<HTMLElement | null>;
  readonly className: string;
  readonly style?: React.CSSProperties;
  readonly children: (state: PickerFieldRenderState) => React.ReactNode;
}): React.JSX.Element {
  const { t } = useM3EI18n();
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const descId = React.useId();
  const errId = React.useId();

  const hasExplicitError = Boolean(invalid || errorMessage);
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const radius = isFloatingLabel
    ? SELECT_TOKENS.outlinedRadius
    : SELECT_TOKENS.outsideLabelRadius;
  const labelNode = label ? (
    <>
      {label}
      {required ? (
        <span className="m3e-field__required" aria-hidden="true">
          {" *"}
        </span>
      ) : null}
    </>
  ) : null;

  return (
    <BaseField.Root
      name={name}
      disabled={disabled || undefined}
      invalid={hasExplicitError ? true : undefined}
      validate={validate}
      className={className}
      data-label-position={labelPosition}
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      style={style}
    >
      <FormHiddenValue
        name={name}
        value={hiddenValue}
        disabled={disabled}
        required={required && !readOnly}
        pattern={hiddenPattern}
        triggerRef={triggerRef}
      />

      <BaseField.Validity>
        {(validityState) => {
          const isFieldInvalid =
            !disabled &&
            (hasExplicitError || validityState.validity.valid === false);
          const resolvedErrorMessage = isFieldInvalid
            ? (errorMessage ??
              (validityState.error || t("textField.defaultInvalid")))
            : null;
          const describedBy = isFieldInvalid
            ? errId
            : description
              ? descId
              : undefined;

          return (
            <div
              className="m3e-field"
              data-invalid={isFieldInvalid ? "" : undefined}
              data-disabled={disabled ? "" : undefined}
            >
              {labelNode && !isFloatingLabel ? (
                <label htmlFor={triggerId} className="m3e-field__label">
                  {labelNode}
                </label>
              ) : null}

              {description && !isFloatingLabel ? (
                <p id={descId} className="m3e-field__description">
                  {description}
                </p>
              ) : null}

              <div
                className="m3e-select__shell"
                data-variant="outlined"
                data-label-position={labelPosition}
                data-floating={floating ? "" : undefined}
                data-popup-open={popupOpen ? "" : undefined}
                data-disabled={disabled ? "" : undefined}
                data-readonly={readOnly ? "" : undefined}
                data-invalid={isFieldInvalid ? "" : undefined}
                style={{ borderRadius: `${radius}px` }}
              >
                {isFloatingLabel ? (
                  <FieldNotchedOutline label={labelNode} floating={floating} />
                ) : null}
                {isFloatingLabel ? (
                  <label
                    htmlFor={triggerId}
                    className="m3e-field__floating-label m3e-select__floating-label"
                    data-floating={floating ? "" : undefined}
                  >
                    {labelNode}
                  </label>
                ) : null}
                {children({
                  isFieldInvalid,
                  triggerAriaProps: {
                    id: triggerId,
                    "aria-required": required ? true : undefined,
                    "aria-invalid": isFieldInvalid ? true : undefined,
                    "aria-describedby": describedBy,
                  },
                })}
              </div>

              {description && isFloatingLabel && !isFieldInvalid ? (
                <div className="m3e-field__supporting-row">
                  <p id={descId} className="m3e-field__description">
                    {description}
                  </p>
                </div>
              ) : null}
              {isFieldInvalid ? (
                <div id={errId} role="alert" className="m3e-field__error">
                  <FieldErrorIconSvg label={t("textField.errorIcon")} />
                  <span>{resolvedErrorMessage}</span>
                </div>
              ) : null}
            </div>
          );
        }}
      </BaseField.Validity>
    </BaseField.Root>
  );
}

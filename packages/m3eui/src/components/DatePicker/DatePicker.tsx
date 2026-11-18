"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  DATE_PICKER_TOKENS,
  SELECT_TOKENS,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../../internal/fieldOutline.js";
import {
  formatLocalizedDateRange,
  formatLocalizedFullDate,
} from "../../i18n/index.js";
import { Button } from "../Button/Button.js";
import { TextField } from "../TextField/TextField.js";
import { FormHiddenValue } from "../../internal/formField.js";
import { FieldRoot, FieldTrigger } from "../../internal/pickerField.js";
import { DateCalendar } from "../../internal/calendar.js";
import {
  comparePlainDates,
  formatPlainDate,
  getDaysInMonth,
  getTodayPlainDate,
  isIsoOutOfBounds,
  parsePlainDate,
  type PlainDateRange,
  type PlainDateString,
} from "../../internal/plainDate.js";

export {
  comparePlainDates,
  formatPlainDate,
  parsePlainDate,
  type PlainDateRange,
  type PlainDateString,
};

export interface M3EDatePickerSingleProps {
  readonly mode?: "single";
  readonly value?: PlainDateString;
  readonly defaultValue?: PlainDateString;
  readonly onValueChange?: (value: string) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly firstDayOfWeek?: number;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function SingleDatePicker({
  value: controlledValue,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  firstDayOfWeek,
  title,
  className,
  style,
}: M3EDatePickerSingleProps): React.JSX.Element {
  const { locale, t } = useM3ERuntime();
  const resolvedTitle = title ?? t("datePicker.title");
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(
    () => defaultValue ?? formatPlainDate(today),
  );
  const selectedIso = controlledValue ?? uncontrolledIso;
  const selected = parsePlainDate(selectedIso) ?? today;

  return (
    <DateCalendar
      header={
        <>
          <div className="m3e-date-picker__eyebrow">{resolvedTitle}</div>
          <div className="m3e-date-picker__headline">
            {formatLocalizedFullDate(locale, selected)}
          </div>
        </>
      }
      initialDate={selected}
      selection={{ start: selectedIso, end: selectedIso }}
      minDate={minDate}
      maxDate={maxDate}
      isDateDisabled={isDateDisabled}
      firstDayOfWeek={firstDayOfWeek}
      onDayPick={(iso) => {
        if (controlledValue === undefined) {
          setUncontrolledIso(iso);
        }
        onValueChange?.(iso);
      }}
      className={className}
      style={style}
    />
  );
}

export interface M3EDatePickerRangeProps {
  readonly mode: "range";
  readonly value?: PlainDateRange;
  readonly defaultValue?: PlainDateRange;
  readonly onValueChange?: (range: PlainDateRange) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly firstDayOfWeek?: number;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function getDefaultRange(): PlainDateRange {
  const today = getTodayPlainDate();
  return {
    start: formatPlainDate(today),
    end: formatPlainDate({
      year: today.year,
      month: today.month,
      day: Math.min(getDaysInMonth(today.year, today.month), today.day + 4),
    }),
  };
}

function RangeDatePicker({
  value: controlledRange,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  firstDayOfWeek,
  title,
  className,
  style,
}: Omit<M3EDatePickerRangeProps, "mode">): React.JSX.Element {
  const { locale, t } = useM3ERuntime();
  const resolvedTitle = title ?? t("datePicker.rangeTitle");
  const today = React.useMemo(() => getTodayPlainDate(), []);

  const [uncontrolledRange, setUncontrolledRange] =
    React.useState<PlainDateRange>(() => defaultValue ?? getDefaultRange());
  const activeRange = controlledRange ?? uncontrolledRange;

  const [draftAnchor, setDraftAnchor] = React.useState<string | null>(null);
  const [hoverIso, setHoverIso] = React.useState<string | null>(null);

  const startParsed = parsePlainDate(activeRange.start) ?? today;
  const endParsed = parsePlainDate(activeRange.end) ?? startParsed;

  const effectiveRange = React.useMemo<PlainDateRange>(() => {
    if (draftAnchor) {
      const target = hoverIso ?? draftAnchor;
      return comparePlainDates(draftAnchor, target) <= 0
        ? { start: draftAnchor, end: target }
        : { start: target, end: draftAnchor };
    }
    return comparePlainDates(activeRange.start, activeRange.end) <= 0
      ? activeRange
      : { start: activeRange.end, end: activeRange.start };
  }, [draftAnchor, hoverIso, activeRange]);

  const handleDayPick = (iso: string) => {
    if (!draftAnchor) {
      setDraftAnchor(iso);
      setHoverIso(iso);
      return;
    }
    const nextRange: PlainDateRange =
      comparePlainDates(draftAnchor, iso) <= 0
        ? { start: draftAnchor, end: iso }
        : { start: iso, end: draftAnchor };
    setDraftAnchor(null);
    setHoverIso(null);
    if (controlledRange === undefined) {
      setUncontrolledRange(nextRange);
    }
    onValueChange?.(nextRange);
  };

  const displayStart = parsePlainDate(effectiveRange.start) ?? startParsed;
  const displayEnd = parsePlainDate(effectiveRange.end) ?? endParsed;

  return (
    <DateCalendar
      range
      header={
        <>
          <div className="m3e-date-picker__eyebrow">
            {resolvedTitle}
            {draftAnchor ? t("datePicker.selectEndPrompt") : ""}
          </div>
          <div className="m3e-date-picker__headline m3e-date-range-picker__headline">
            <span>
              {formatLocalizedDateRange(locale, displayStart, displayEnd)}
            </span>
          </div>
        </>
      }
      initialDate={startParsed}
      selection={effectiveRange}
      minDate={minDate}
      maxDate={maxDate}
      isDateDisabled={isDateDisabled}
      firstDayOfWeek={firstDayOfWeek}
      onDayPick={handleDayPick}
      onPreview={(iso) => {
        if (draftAnchor) setHoverIso(iso);
      }}
      onMouseLeave={() => {
        if (draftAnchor) setHoverIso(draftAnchor);
      }}
      className={className}
      style={style}
    />
  );
}

interface DatePickerFieldBaseProps {
  readonly id?: string;
  readonly name?: string;
  readonly label?: React.ReactNode;
  readonly labelPosition?: "floating" | "outside";
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly required?: boolean;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly modal?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EDatePickerFieldSingleProps extends DatePickerFieldBaseProps {
  readonly mode?: "single";
  readonly value?: PlainDateString;
  readonly defaultValue?: PlainDateString;
  readonly onValueChange?: (value: string) => void;
}

export interface M3EDatePickerFieldRangeProps extends DatePickerFieldBaseProps {
  readonly mode: "range";
  readonly value?: PlainDateRange;
  readonly defaultValue?: PlainDateRange;
  readonly onValueChange?: (range: PlainDateRange) => void;
}

function CalendarIconSvg() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function DatePickerFieldShell({
  id: idProp,
  name,
  label,
  labelPosition = "floating",
  description,
  errorMessage,
  invalid = false,
  required = false,
  disabled = false,
  readOnly = false,
  modal = false,
  className,
  style,
  hiddenValue,
  displayText,
  renderModal,
  renderPopover,
}: Omit<
  DatePickerFieldBaseProps,
  "minDate" | "maxDate" | "isDateDisabled"
> & {
  readonly hiddenValue: string;
  readonly displayText: React.ReactNode;
  readonly renderModal: (open: boolean, close: () => void) => React.ReactNode;
  readonly renderPopover: (close: () => void) => React.ReactNode;
}): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const generatedId = React.useId();
  const triggerId = idProp ?? generatedId;
  const descId = React.useId();
  const errId = React.useId();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if ((isDisabled || readOnly) && open) setOpen(false);
  }, [isDisabled, readOnly, open]);

  const close = () => setOpen(false);
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const height = isFloatingLabel ? SELECT_TOKENS.outlinedHeight : 48;
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
    <div
      className={
        className
          ? `m3e-date-picker-field ${className}`
          : "m3e-date-picker-field"
      }
      data-label-position={labelPosition}
      data-disabled={isDisabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      style={style}
    >
      {labelNode && !isFloatingLabel ? (
        <label htmlFor={triggerId} className="m3e-field__label">
          {labelNode}
        </label>
      ) : null}
      <FormHiddenValue
        name={name}
        value={hiddenValue}
        disabled={isDisabled}
        required={required}
      />
      <FieldRoot
        modal={modal}
        open={readOnly ? false : open}
        onOpenChange={(next) => {
          if (!readOnly && !isDisabled) setOpen(next);
        }}
      >
        <div
          className="m3e-select__shell"
          data-variant="outlined"
          data-label-position={labelPosition}
          data-floating=""
          data-popup-open={!readOnly && open ? "" : undefined}
          data-disabled={isDisabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          data-invalid={invalid ? "" : undefined}
          style={{ borderRadius: `${radius}px` }}
        >
          {isFloatingLabel ? (
            <FieldNotchedOutline label={labelNode} floating />
          ) : null}
          {isFloatingLabel ? (
            <label
              htmlFor={triggerId}
              className="m3e-field__floating-label m3e-select__floating-label"
              data-floating=""
            >
              {labelNode}
            </label>
          ) : null}
          <FieldTrigger
            modal={modal}
            id={triggerId}
            disabled={isDisabled}
            aria-invalid={invalid ? true : undefined}
            aria-describedby={
              invalid && errorMessage ? errId : description ? descId : undefined
            }
            className="m3e-select__trigger m3e-date-picker-field__trigger"
            data-variant="outlined"
            data-label-position={labelPosition}
            data-floating=""
            data-readonly={readOnly ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              borderRadius: `${radius}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
            }}
          >
            <span className="m3e-select__value">{displayText}</span>
            <span className="m3e-select__chevron" aria-hidden="true">
              <CalendarIconSvg />
            </span>
          </FieldTrigger>
        </div>

        {modal ? (
          renderModal(open, close)
        ) : (
          <BasePopover.Portal container={portalContainer}>
            <BasePopover.Positioner
              side="bottom"
              align="start"
              sideOffset={6}
              className="m3e-popover__positioner"
            >
              <BasePopover.Popup
                initialFocus={(openType) => openType === "keyboard"}
                className="m3e-date-picker-field__popup"
              >
                {renderPopover(close)}
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        )}
      </FieldRoot>

      {description && !(invalid && errorMessage) ? (
        <p id={descId} className="m3e-field__description">
          {description}
        </p>
      ) : null}
      {invalid && errorMessage ? (
        <div id={errId} role="alert" className="m3e-field__error">
          <FieldErrorIconSvg />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}

function SingleDatePickerField({
  value: controlledValue,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  ...shellProps
}: M3EDatePickerFieldSingleProps): React.JSX.Element {
  const { locale } = useM3ERuntime();
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(
    () => defaultValue ?? formatPlainDate(today),
  );
  const currentIso = controlledValue ?? uncontrolledIso;
  const commit = (next: string) => {
    if (controlledValue === undefined) setUncontrolledIso(next);
    onValueChange?.(next);
  };
  const parsed = parsePlainDate(currentIso);

  return (
    <DatePickerFieldShell
      {...shellProps}
      hiddenValue={currentIso}
      displayText={parsed ? formatLocalizedFullDate(locale, parsed) : currentIso}
      renderModal={(open, close) => (
        <ModalDatePickerPopup
          open={open}
          onClose={close}
          value={currentIso}
          onValueCommit={commit}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
        />
      )}
      renderPopover={(close) => (
        <SingleDatePicker
          value={currentIso}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
          onValueChange={(next) => {
            commit(next);
            close();
          }}
        />
      )}
    />
  );
}

function RangeDatePickerField({
  value: controlledRange,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  ...shellProps
}: Omit<M3EDatePickerFieldRangeProps, "mode">): React.JSX.Element {
  const { locale } = useM3ERuntime();
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledRange, setUncontrolledRange] =
    React.useState<PlainDateRange>(() => defaultValue ?? getDefaultRange());
  const activeRange = controlledRange ?? uncontrolledRange;
  const commit = (next: PlainDateRange) => {
    if (controlledRange === undefined) setUncontrolledRange(next);
    onValueChange?.(next);
  };
  const startParsed = parsePlainDate(activeRange.start) ?? today;
  const endParsed = parsePlainDate(activeRange.end) ?? startParsed;

  return (
    <DatePickerFieldShell
      {...shellProps}
      hiddenValue={`${activeRange.start}/${activeRange.end}`}
      displayText={formatLocalizedDateRange(locale, startParsed, endParsed)}
      renderModal={(open, close) => (
        <ModalDatePickerPopup
          open={open}
          onClose={close}
          range={activeRange}
          onRangeCommit={commit}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
        />
      )}
      renderPopover={(close) => (
        <RangeDatePicker
          value={activeRange}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
          onValueChange={(next) => {
            commit(next);
            close();
          }}
        />
      )}
    />
  );
}

interface ModalDatePickerPopupProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly value?: PlainDateString;
  readonly onValueCommit?: (value: string) => void;
  readonly range?: PlainDateRange;
  readonly onRangeCommit?: (range: PlainDateRange) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
}

function EditModePencilSvg() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function ModalDatePickerPopup({
  open,
  onClose,
  value: committedIso = "",
  onValueCommit,
  range,
  onRangeCommit,
  minDate,
  maxDate,
  isDateDisabled,
}: ModalDatePickerPopupProps): React.JSX.Element {
  const { locale, t } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const committedRange = range ?? EMPTY_RANGE;
  const [draftIso, setDraftIso] = React.useState<string>(committedIso);
  const [draftRange, setDraftRange] =
    React.useState<PlainDateRange>(committedRange);
  const [inputMode, setInputMode] = React.useState<"calendar" | "input">(
    "calendar",
  );

  React.useEffect(() => {
    if (open) {
      setDraftIso(committedIso);
      setDraftRange(committedRange);
    }
  }, [open, committedIso, committedRange]);

  const isRangeMode = range !== undefined;
  const parsedDraft = parsePlainDate(draftIso);
  const parsedRangeStart = parsePlainDate(draftRange.start);
  const parsedRangeEnd = parsePlainDate(draftRange.end);

  const isDraftValid = isRangeMode
    ? parsedRangeStart !== null &&
      parsedRangeEnd !== null &&
      comparePlainDates(draftRange.start, draftRange.end) <= 0 &&
      !isIsoOutOfBounds(draftRange.start, minDate, maxDate, isDateDisabled) &&
      !isIsoOutOfBounds(draftRange.end, minDate, maxDate, isDateDisabled)
    : parsedDraft !== null &&
      !isIsoOutOfBounds(draftIso, minDate, maxDate, isDateDisabled);

  const headlineText = isRangeMode
    ? parsedRangeStart && parsedRangeEnd
      ? formatLocalizedDateRange(locale, parsedRangeStart, parsedRangeEnd)
      : `${draftRange.start} – ${draftRange.end}`
    : parsedDraft
      ? formatLocalizedFullDate(locale, parsedDraft)
      : draftIso;

  return (
    <BaseDialog.Portal container={portalContainer}>
      <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
      <BaseDialog.Viewport className="m3e-dialog__viewport">
        <BaseDialog.Popup
          className="m3e-dialog__popup m3e-modal-date-picker"
          style={{
            borderRadius: `${DATE_PICKER_TOKENS.containerRadius}px`,
            padding: 0,
            width: "auto",
            maxWidth: isRangeMode ? "380px" : "360px",
          }}
        >
          <div className="m3e-modal-date-picker__header">
            <div className="m3e-modal-date-picker__header-copy">
              <BaseDialog.Title className="m3e-date-picker__overline">
                {isRangeMode
                  ? t("datePicker.rangeTitle")
                  : t("datePicker.title")}
              </BaseDialog.Title>
              <div className="m3e-modal-date-picker__headline">
                {headlineText}
              </div>
            </div>
            <button
              type="button"
              aria-label={
                inputMode === "calendar"
                  ? t("datePicker.switchToInput")
                  : t("datePicker.switchToCalendar")
              }
              className="m3e-date-picker__nav-btn"
              onClick={() =>
                setInputMode((m) => (m === "calendar" ? "input" : "calendar"))
              }
            >
              {inputMode === "calendar" ? (
                <EditModePencilSvg />
              ) : (
                <CalendarIconSvg />
              )}
            </button>
          </div>

          <div className="m3e-modal-date-picker__body">
            {inputMode === "calendar" ? (
              isRangeMode ? (
                <RangeDatePicker
                  value={
                    parsedRangeStart && parsedRangeEnd
                      ? draftRange
                      : committedRange
                  }
                  minDate={minDate}
                  maxDate={maxDate}
                  isDateDisabled={isDateDisabled}
                  onValueChange={(next) => setDraftRange(next)}
                  className="m3e-modal-date-picker__calendar"
                />
              ) : (
                <SingleDatePicker
                  value={parsedDraft ? draftIso : committedIso}
                  minDate={minDate}
                  maxDate={maxDate}
                  isDateDisabled={isDateDisabled}
                  onValueChange={(next) => setDraftIso(next)}
                  className="m3e-modal-date-picker__calendar"
                />
              )
            ) : isRangeMode ? (
              <div className="m3e-modal-date-picker__input-pane m3e-modal-date-picker__input-pane--range">
                <TextField
                  label={t("datePicker.dateInputLabel")}
                  value={draftRange.start}
                  invalid={
                    draftRange.start.length > 0 && parsedRangeStart === null
                  }
                  onValueChange={(v) =>
                    setDraftRange((prev) => ({ ...prev, start: v }))
                  }
                  placeholder={t("datePicker.dateInputPlaceholder")}
                />
                <TextField
                  label={t("datePicker.dateInputLabel")}
                  value={draftRange.end}
                  invalid={draftRange.end.length > 0 && !isDraftValid}
                  onValueChange={(v) =>
                    setDraftRange((prev) => ({ ...prev, end: v }))
                  }
                  placeholder={t("datePicker.dateInputPlaceholder")}
                />
              </div>
            ) : (
              <div className="m3e-modal-date-picker__input-pane">
                <TextField
                  label={t("datePicker.dateInputLabel")}
                  value={draftIso}
                  invalid={draftIso.length > 0 && !isDraftValid}
                  onValueChange={(v) => setDraftIso(v)}
                  placeholder={t("datePicker.dateInputPlaceholder")}
                />
              </div>
            )}
          </div>

          <div className="m3e-modal-date-picker__actions">
            <Button variant="text" size="sm" onClick={onClose}>
              {t("datePicker.cancel")}
            </Button>
            <Button
              variant="filled"
              size="sm"
              disabled={!isDraftValid}
              onClick={() => {
                if (!isDraftValid) return;
                if (isRangeMode) onRangeCommit?.(draftRange);
                else onValueCommit?.(draftIso);
                onClose();
              }}
            >
              {t("datePicker.confirm")}
            </Button>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

const EMPTY_RANGE: PlainDateRange = { start: "", end: "" };

export type M3EDatePickerProps =
  M3EDatePickerSingleProps | M3EDatePickerRangeProps;

export function DatePicker(props: M3EDatePickerProps): React.JSX.Element {
  return props.mode === "range" ? (
    <RangeDatePicker {...props} />
  ) : (
    <SingleDatePicker {...props} />
  );
}

export type M3EDatePickerFieldProps =
  M3EDatePickerFieldSingleProps | M3EDatePickerFieldRangeProps;

export function DatePickerField(
  props: M3EDatePickerFieldProps,
): React.JSX.Element {
  return props.mode === "range" ? (
    <RangeDatePickerField {...props} />
  ) : (
    <SingleDatePickerField {...props} />
  );
}

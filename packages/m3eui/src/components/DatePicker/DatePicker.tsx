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
  useFieldsetDisabled,
} from "../../internal/fieldOutline.js";
import {
  formatLocalizedDateRange,
  formatLocalizedFullDate,
} from "../../i18n/index.js";
import { Button } from "../Button/Button.js";
import { TextField } from "../TextField/TextField.js";
import { useFormReset } from "../../internal/formField.js";
import { useAdaptivePositionMethod } from "../../internal/positionMethod.js";
import { useM3ERipple } from "../../internal/ripple.js";
import {
  FieldRoot,
  FieldTrigger,
  PickerFieldFrame,
} from "../../internal/pickerField.js";
import { DateCalendar } from "../../internal/calendar.js";
import {
  clampPlainDateToBounds,
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
  const [defaultIso] = React.useState<string>(() =>
    defaultValue !== undefined ? defaultValue : formatPlainDate(today),
  );
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(defaultIso);
  const [resetCount, setResetCount] = React.useState(0);
  const calendarRef = React.useRef<HTMLDivElement | null>(null);
  useFormReset(
    calendarRef,
    () => {
      setUncontrolledIso(defaultIso);
      setResetCount((c) => c + 1);
    },
    controlledValue === undefined,
  );
  const selectedIso = controlledValue ?? uncontrolledIso;
  const parsed = parsePlainDate(selectedIso);
  const initialDate =
    parsed ?? clampPlainDateToBounds(today, minDate, maxDate);

  return (
    <DateCalendar
      containerRef={calendarRef}
      header={
        <>
          <div className="m3e-date-picker__eyebrow">{resolvedTitle}</div>
          <div className="m3e-date-picker__headline">
            {parsed ? formatLocalizedFullDate(locale, parsed) : "—"}
          </div>
        </>
      }
      initialDate={initialDate}
      anchorIso={parsed ? selectedIso : ""}
      resetCount={resetCount}
      selection={
        parsed ? { start: selectedIso, end: selectedIso } : EMPTY_RANGE
      }
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

  const [defaultRange] = React.useState<PlainDateRange>(
    () => defaultValue ?? getDefaultRange(),
  );
  const [uncontrolledRange, setUncontrolledRange] =
    React.useState<PlainDateRange>(defaultRange);
  const [resetCount, setResetCount] = React.useState(0);
  const [draftAnchor, setDraftAnchor] = React.useState<string | null>(null);
  const [hoverIso, setHoverIso] = React.useState<string | null>(null);
  const calendarRef = React.useRef<HTMLDivElement | null>(null);

  useFormReset(
    calendarRef,
    () => {
      setUncontrolledRange(defaultRange);
      setDraftAnchor(null);
      setHoverIso(null);
      setResetCount((c) => c + 1);
    },
    controlledRange === undefined,
  );

  const activeRange = controlledRange ?? uncontrolledRange;
  const startParsed = parsePlainDate(activeRange.start);
  const endParsed = parsePlainDate(activeRange.end);

  const effectiveRange = React.useMemo<PlainDateRange>(() => {
    if (draftAnchor) {
      const target = hoverIso ?? draftAnchor;
      return comparePlainDates(draftAnchor, target) <= 0
        ? { start: draftAnchor, end: target }
        : { start: target, end: draftAnchor };
    }
    if (startParsed && endParsed) {
      return comparePlainDates(activeRange.start, activeRange.end) <= 0
        ? activeRange
        : { start: activeRange.end, end: activeRange.start };
    }
    if (startParsed) {
      return { start: activeRange.start, end: activeRange.start };
    }
    if (endParsed) {
      return { start: activeRange.end, end: activeRange.end };
    }
    return EMPTY_RANGE;
  }, [draftAnchor, hoverIso, activeRange, startParsed, endParsed]);

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

  const displayStart = parsePlainDate(effectiveRange.start);
  const displayEnd = parsePlainDate(effectiveRange.end);
  const headlineText =
    draftAnchor || (startParsed && endParsed)
      ? displayStart && displayEnd
        ? formatLocalizedDateRange(locale, displayStart, displayEnd)
        : "—"
      : startParsed
        ? `${formatLocalizedFullDate(locale, startParsed)} – …`
        : endParsed
          ? `… – ${formatLocalizedFullDate(locale, endParsed)}`
          : "—";

  const initialDate =
    startParsed ??
    endParsed ??
    clampPlainDateToBounds(today, minDate, maxDate);
  const anchorIso = startParsed
    ? activeRange.start
    : endParsed
      ? activeRange.end
      : "";

  return (
    <DateCalendar
      containerRef={calendarRef}
      range
      header={
        <>
          <div className="m3e-date-picker__eyebrow">
            {resolvedTitle}
            {draftAnchor ? t("datePicker.selectEndPrompt") : ""}
          </div>
          <div className="m3e-date-picker__headline m3e-date-range-picker__headline">
            <span>{headlineText}</span>
          </div>
        </>
      }
      initialDate={initialDate}
      anchorIso={anchorIso}
      resetCount={resetCount}
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
  modal = false,
  className,
  style,
  triggerRef,
  hasValue,
  hiddenValue,
  hiddenPattern,
  validate,
  displayText,
  popupAriaLabel,
  renderModal,
  renderPopover,
}: Omit<
  DatePickerFieldBaseProps,
  "minDate" | "maxDate" | "isDateDisabled"
> & {
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
  readonly hasValue: boolean;
  readonly hiddenValue: string;
  readonly hiddenPattern?: string;
  readonly validate?: () => string | string[] | null;
  readonly displayText: React.ReactNode;
  readonly popupAriaLabel: string;
  readonly renderModal: (open: boolean, close: () => void) => React.ReactNode;
  readonly renderPopover: (close: () => void) => React.ReactNode;
}): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const [open, setOpen] = React.useState(false);
  const positionMethod = useAdaptivePositionMethod(triggerRef, open);

  React.useEffect(() => {
    if ((isDisabled || readOnly) && open) setOpen(false);
  }, [isDisabled, readOnly, open]);

  const close = () => setOpen(false);
  const isLabelFloated = hasValue || open;
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const height = isFloatingLabel ? SELECT_TOKENS.outlinedHeight : 48;
  const radius = isFloatingLabel
    ? SELECT_TOKENS.outlinedRadius
    : SELECT_TOKENS.outsideLabelRadius;

  return (
    <FieldRoot
      modal={modal}
      open={readOnly ? false : open}
      onOpenChange={(next) => {
        if (!readOnly && !isDisabled) setOpen(next);
      }}
    >
      <PickerFieldFrame
        id={id}
        name={name}
        label={label}
        labelPosition={labelPosition}
        description={description}
        errorMessage={errorMessage}
        invalid={invalid}
        required={required}
        disabled={isDisabled}
        readOnly={readOnly}
        floating={isLabelFloated}
        popupOpen={!readOnly && open}
        hiddenValue={hiddenValue}
        hiddenPattern={hiddenPattern}
        validate={validate}
        triggerRef={triggerRef}
        className={
          className
            ? `m3e-date-picker-field ${className}`
            : "m3e-date-picker-field"
        }
        style={style}
      >
        {({ triggerAriaProps }) => (
          <FieldTrigger
            modal={modal}
            ref={triggerRef}
            {...triggerAriaProps}
            disabled={isDisabled}
            className="m3e-select__trigger m3e-date-picker-field__trigger"
            data-variant="outlined"
            data-label-position={labelPosition}
            data-floating={isLabelFloated ? "" : undefined}
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
        )}
      </PickerFieldFrame>

      {modal ? (
        renderModal(open, close)
      ) : (
        <BasePopover.Portal container={portalContainer}>
          <BasePopover.Positioner
            positionMethod={positionMethod}
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-popover__positioner"
          >
            <BasePopover.Popup
              aria-label={popupAriaLabel}
              initialFocus={(openType) => openType === "keyboard"}
              className="m3e-date-picker-field__popup"
            >
              {renderPopover(close)}
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      )}
    </FieldRoot>
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
  const { locale, t } = useM3ERuntime();
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [defaultIso] = React.useState<string>(() =>
    defaultValue !== undefined ? defaultValue : formatPlainDate(today),
  );
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(defaultIso);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  useFormReset(
    triggerRef,
    () => setUncontrolledIso(defaultIso),
    controlledValue === undefined,
  );

  const currentIso = controlledValue ?? uncontrolledIso;
  const commit = (next: string) => {
    if (controlledValue === undefined) setUncontrolledIso(next);
    onValueChange?.(next);
  };
  const parsed = parsePlainDate(currentIso);
  const popupAriaLabel =
    typeof shellProps.label === "string" && shellProps.label.trim().length > 0
      ? shellProps.label
      : t("datePicker.title");

  return (
    <DatePickerFieldShell
      {...shellProps}
      triggerRef={triggerRef}
      hasValue={parsed !== null}
      hiddenValue={parsed ? currentIso : ""}
      displayText={parsed ? formatLocalizedFullDate(locale, parsed) : ""}
      popupAriaLabel={popupAriaLabel}
      renderModal={(open, close) => (
        <ModalDatePickerPopup
          open={open}
          onClose={close}
          value={parsed ? currentIso : ""}
          onValueCommit={commit}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
        />
      )}
      renderPopover={(close) => (
        <SingleDatePicker
          value={parsed ? currentIso : ""}
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
  const { locale, t } = useM3ERuntime();
  const [defaultRange] = React.useState<PlainDateRange>(
    () => defaultValue ?? getDefaultRange(),
  );
  const [uncontrolledRange, setUncontrolledRange] =
    React.useState<PlainDateRange>(defaultRange);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  useFormReset(
    triggerRef,
    () => setUncontrolledRange(defaultRange),
    controlledRange === undefined,
  );

  const activeRange = controlledRange ?? uncontrolledRange;
  const commit = (next: PlainDateRange) => {
    if (controlledRange === undefined) setUncontrolledRange(next);
    onValueChange?.(next);
  };
  const startParsed = parsePlainDate(activeRange.start);
  const endParsed = parsePlainDate(activeRange.end);
  const isEmpty = startParsed === null && endParsed === null;
  const isComplete =
    startParsed !== null &&
    endParsed !== null &&
    comparePlainDates(activeRange.start, activeRange.end) <= 0;
  const isPartial = !isEmpty && !isComplete;
  const displayText = isComplete
    ? formatLocalizedDateRange(locale, startParsed, endParsed)
    : isEmpty
      ? ""
      : `${startParsed ? formatLocalizedFullDate(locale, startParsed) : "…"} – ${endParsed ? formatLocalizedFullDate(locale, endParsed) : "…"}`;
  const popupAriaLabel =
    typeof shellProps.label === "string" && shellProps.label.trim().length > 0
      ? shellProps.label
      : t("datePicker.rangeTitle");

  return (
    <DatePickerFieldShell
      {...shellProps}
      triggerRef={triggerRef}
      hasValue={!isEmpty}
      hiddenValue={isEmpty ? "" : `${activeRange.start}/${activeRange.end}`}
      hiddenPattern={
        isPartial ? "^\\d{4}-\\d{2}-\\d{2}/\\d{4}-\\d{2}-\\d{2}$" : undefined
      }
      validate={() => (isPartial ? t("textField.defaultInvalid") : null)}
      displayText={displayText}
      popupAriaLabel={popupAriaLabel}
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
  const { rippleRef: modeBtnRippleRef, rippleHandlers: modeBtnRippleHandlers } =
    useM3ERipple();
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

  const startInvalid =
    draftRange.start.length > 0 &&
    (parsedRangeStart === null ||
      isIsoOutOfBounds(draftRange.start, minDate, maxDate, isDateDisabled));
  const endInvalid =
    draftRange.end.length > 0 &&
    (parsedRangeEnd === null ||
      isIsoOutOfBounds(draftRange.end, minDate, maxDate, isDateDisabled) ||
      (parsedRangeStart !== null &&
        comparePlainDates(draftRange.start, draftRange.end) > 0));

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
      : draftRange.start || draftRange.end
        ? `${draftRange.start || "…"} – ${draftRange.end || "…"}`
        : "—"
    : parsedDraft
      ? formatLocalizedFullDate(locale, parsedDraft)
      : draftIso || "—";

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
              <BaseDialog.Title className="m3e-date-picker__eyebrow">
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
              {...modeBtnRippleHandlers}
            >
              <span ref={modeBtnRippleRef} className="m3e-ripple" aria-hidden="true" />
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
                  invalid={startInvalid}
                  onValueChange={(v) =>
                    setDraftRange((prev) => ({ ...prev, start: v }))
                  }
                  placeholder={t("datePicker.dateInputPlaceholder")}
                />
                <TextField
                  label={t("datePicker.dateInputLabel")}
                  value={draftRange.end}
                  invalid={endInvalid}
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

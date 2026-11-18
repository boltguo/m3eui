"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import {
  Hct,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from "../../tokens/monet/index.js";
import {
  COLOR_PICKER_TOKENS,
  SELECT_TOKENS,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { useFieldsetDisabled } from "../../internal/fieldOutline.js";
import {
  useM3EScalarSpringEffect,
  usePressHoldState,
} from "../../hooks/useM3ESpring.js";
import { formatLocalizedInteger } from "../../i18n/index.js";
import { useFormReset } from "../../internal/formField.js";
import { PickerFieldFrame } from "../../internal/pickerField.js";
import { ChevronDownIcon } from "../../internal/icons.js";

const DEFAULT_SWATCHES: readonly string[] = [
  "#6750A4",
  "#0B6B58",
  "#1A73E8",
  "#B3261E",
  "#7D5260",
  "#8C5000",
  "#3E6700",
  "#006874",
];

const TONAL_STOPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95] as const;

function normalizeHex(raw: string, fallback = "#6750A4"): string {
  const cleaned = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const expanded = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return fallback;
}

function safeHctFromHex(hex: string): {
  readonly hue: number;
  readonly chroma: number;
  readonly tone: number;
} {
  try {
    const hct = Hct.fromInt(argbFromHex(normalizeHex(hex)));
    return {
      hue: Math.round(hct.hue),
      chroma: Math.round(hct.chroma),
      tone: Math.round(hct.tone),
    };
  } catch {
    return { hue: 265, chroma: 48, tone: 40 };
  }
}

export interface M3EColorSwatchProps {
  readonly colors?: readonly string[];
  readonly value?: string;
  readonly onValueChange?: (hex: string) => void;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function SwatchButton({
  hex,
  selected,
}: {
  readonly hex: string;
  readonly selected: boolean;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(false);
  const btnRef = React.useRef<HTMLElement | null>(null);
  const targetRadius = isPressed
    ? 6
    : selected
      ? COLOR_PICKER_TOKENS.swatchSelectedRadius
      : COLOR_PICKER_TOKENS.swatchRadius;
  useM3EScalarSpringEffect(targetRadius, "defaultEffects", (r) => {
    if (btnRef.current) {
      btnRef.current.style.borderRadius = `${r.toFixed(1)}px`;
    }
  });

  return (
    <BaseRadio.Root
      ref={btnRef}
      value={hex}
      aria-label={hex}
      className="m3e-color-swatch__item"
      data-selected={selected ? "" : undefined}
      style={{
        width: `${COLOR_PICKER_TOKENS.swatchSize}px`,
        height: `${COLOR_PICKER_TOKENS.swatchSize}px`,
        borderRadius: `${targetRadius}px`,
        backgroundColor: hex,
      }}
      {...pressHandlers}
    />
  );
}

export function ColorSwatch({
  colors = DEFAULT_SWATCHES,
  value,
  onValueChange,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EColorSwatchProps): React.JSX.Element {
  const { t } = useM3ERuntime();
  const normalizedCurrent = value ? normalizeHex(value, "") : "";

  return (
    <BaseRadioGroup
      value={normalizedCurrent}
      onValueChange={(next) => onValueChange?.(String(next))}
      aria-label={ariaLabel ?? t("colorPicker.swatchesLabel")}
      className={
        className ? `m3e-color-swatch ${className}` : "m3e-color-swatch"
      }
      style={style}
    >
      {colors.map((c) => {
        const norm = normalizeHex(c);
        return (
          <SwatchButton key={norm} hex={norm} selected={norm === normalizedCurrent} />
        );
      })}
    </BaseRadioGroup>
  );
}

export interface M3EColorPickerProps {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (hex: string) => void;
  readonly onValueCommitted?: (hex: string) => void;
  readonly swatches?: readonly string[];
  readonly showTonalRamp?: boolean;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ColorPicker({
  value: controlledHex,
  defaultValue = "#6750A4",
  onValueChange,
  onValueCommitted,
  swatches = DEFAULT_SWATCHES,
  showTonalRamp = true,
  disabled = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EColorPickerProps): React.JSX.Element {
  const { locale, direction, t } = useM3ERuntime();
  const isDisabled = useFieldsetDisabled(disabled);
  const hexInputId = React.useId();
  const hueId = React.useId();
  const chromaId = React.useId();
  const toneId = React.useId();

  const [uncontrolledHex, setUncontrolledHex] = React.useState<string>(() =>
    normalizeHex(defaultValue),
  );
  const currentHex = normalizeHex(controlledHex ?? uncontrolledHex);
  const [latentHct, setLatentHct] = React.useState(() =>
    safeHctFromHex(currentHex),
  );
  const lastCommittedHexRef = React.useRef<string>(currentHex);

  React.useEffect(() => {
    if (currentHex !== lastCommittedHexRef.current) {
      lastCommittedHexRef.current = currentHex;
      const nextParsed = safeHctFromHex(currentHex);
      setLatentHct((prev) => ({
        hue: nextParsed.chroma < 2 ? prev.hue : nextParsed.hue,
        chroma: nextParsed.chroma,
        tone: nextParsed.tone,
      }));
    }
  }, [currentHex]);

  const hct = latentHct;

  const [hexDraft, setHexDraft] = React.useState<string>(currentHex);
  React.useEffect(() => {
    setHexDraft(currentHex);
  }, [currentHex]);

  const commitHex = (nextRaw: string, syncLatent = true, final = true) => {
    const next = normalizeHex(nextRaw, currentHex);
    lastCommittedHexRef.current = next;
    if (syncLatent) {
      const nextParsed = safeHctFromHex(next);
      setLatentHct((prev) => ({
        hue: nextParsed.chroma < 2 ? prev.hue : nextParsed.hue,
        chroma: nextParsed.chroma,
        tone: nextParsed.tone,
      }));
    }
    if (controlledHex === undefined) {
      setUncontrolledHex(next);
    }
    onValueChange?.(next);
    if (final) onValueCommitted?.(next);
  };
  const commitRange = () => onValueCommitted?.(lastCommittedHexRef.current);

  const commitHct = (nextH: number, nextC: number, nextT: number) => {
    setLatentHct({ hue: nextH, chroma: nextC, tone: nextT });
    const solved = Hct.from(nextH, nextC, nextT);
    const hex = hexFromArgb(solved.toInt()).toUpperCase();
    commitHex(hex, false, false);
  };

  const tonalRamp = React.useMemo(() => {
    if (!showTonalRamp) return [];
    const palette = TonalPalette.fromHueAndChroma(
      hct.hue,
      Math.max(16, hct.chroma),
    );
    return TONAL_STOPS.map((stop) => ({
      tone: stop,
      hex: hexFromArgb(palette.tone(stop)).toUpperCase(),
    }));
  }, [hct.hue, hct.chroma, showTonalRamp]);

  const chromaTrackEnd = React.useMemo(
    () =>
      hexFromArgb(
        Hct.from(hct.hue, 96, Math.max(25, Math.min(75, hct.tone))).toInt(),
      ),
    [hct.hue, hct.tone],
  );
  const chromaTrackStart = React.useMemo(
    () => hexFromArgb(Hct.from(hct.hue, 0, hct.tone).toInt()),
    [hct.hue, hct.tone],
  );
  const gradDir = direction === "rtl" ? "to left" : "to right";

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? t("colorPicker.ariaLabel")}
      className={
        className ? `m3e-color-picker ${className}` : "m3e-color-picker"
      }
      data-disabled={isDisabled ? "" : undefined}
      style={{
        width: `${COLOR_PICKER_TOKENS.panelWidth}px`,
        borderRadius: `${COLOR_PICKER_TOKENS.containerRadius}px`,
        ...style,
      }}
    >
      <div className="m3e-color-picker__preview-row">
        <span
          className="m3e-color-picker__well"
          style={{ backgroundColor: currentHex }}
          aria-hidden="true"
        />
        <div className="m3e-color-picker__hex-field">
          <label htmlFor={hexInputId} className="m3e-color-picker__channel-label">
            {t("colorPicker.hexLabel")}
          </label>
          <input
            id={hexInputId}
            type="text"
            value={hexDraft}
            disabled={isDisabled}
            maxLength={7}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="m3e-color-picker__hex-input"
            onChange={(e) => {
              const raw = e.target.value;
              setHexDraft(raw);
              if (/^#?[0-9a-fA-F]{6}$/.test(raw.trim())) {
                commitHex(raw, true, false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setHexDraft(currentHex);
              } else if (e.key === "Enter") {
                e.preventDefault();
                const committed = normalizeHex(hexDraft, currentHex);
                commitHex(committed);
                setHexDraft(committed);
              }
            }}
            onBlur={() => {
              const committed = normalizeHex(hexDraft, currentHex);
              commitHex(committed);
              setHexDraft(committed);
            }}
          />
        </div>
      </div>

      <div className="m3e-color-picker__channels">
        <div className="m3e-color-picker__channel">
          <div className="m3e-color-picker__channel-head">
            <label htmlFor={hueId} className="m3e-color-picker__channel-label">
              {t("colorPicker.hue")}
            </label>
            <span className="m3e-color-picker__channel-val">
              {formatLocalizedInteger(locale, hct.hue)}°
            </span>
          </div>
          <input
            id={hueId}
            type="range"
            min={0}
            max={360}
            value={hct.hue}
            disabled={isDisabled}
            className="m3e-color-picker__range m3e-color-picker__range--hue"
            onPointerUp={commitRange}
            onKeyUp={commitRange}
            onChange={(e) =>
              commitHct(Number(e.target.value), hct.chroma, hct.tone)
            }
          />
        </div>

        <div className="m3e-color-picker__channel">
          <div className="m3e-color-picker__channel-head">
            <label htmlFor={chromaId} className="m3e-color-picker__channel-label">
              {t("colorPicker.chroma")}
            </label>
            <span className="m3e-color-picker__channel-val">
              {formatLocalizedInteger(locale, hct.chroma)}
            </span>
          </div>
          <input
            id={chromaId}
            type="range"
            min={0}
            max={100}
            value={Math.min(100, hct.chroma)}
            disabled={isDisabled}
            className="m3e-color-picker__range"
            onPointerUp={commitRange}
            onKeyUp={commitRange}
            style={{
              background: `linear-gradient(${gradDir}, ${chromaTrackStart}, ${chromaTrackEnd})`,
            }}
            onChange={(e) =>
              commitHct(hct.hue, Number(e.target.value), hct.tone)
            }
          />
        </div>

        <div className="m3e-color-picker__channel">
          <div className="m3e-color-picker__channel-head">
            <label htmlFor={toneId} className="m3e-color-picker__channel-label">
              {t("colorPicker.tone")}
            </label>
            <span className="m3e-color-picker__channel-val">
              {formatLocalizedInteger(locale, hct.tone)}
            </span>
          </div>
          <input
            id={toneId}
            type="range"
            min={0}
            max={100}
            value={hct.tone}
            disabled={isDisabled}
            className="m3e-color-picker__range m3e-color-picker__range--tone"
            onPointerUp={commitRange}
            onKeyUp={commitRange}
            onChange={(e) =>
              commitHct(hct.hue, hct.chroma, Number(e.target.value))
            }
          />
        </div>
      </div>

      {showTonalRamp && tonalRamp.length > 0 ? (
        <div className="m3e-color-picker__ramp-wrap">
          <span className="m3e-color-picker__channel-label">
            {t("colorPicker.derivedTones")}
          </span>
          <div className="m3e-color-picker__ramp">
            {tonalRamp.map((stop) => (
              <button
                key={stop.tone}
                type="button"
                disabled={isDisabled}
                aria-label={t("colorPicker.toneStop", {
                  tone: stop.tone,
                  hex: stop.hex,
                })}
                className="m3e-color-picker__ramp-stop"
                style={{ backgroundColor: stop.hex }}
                onClick={() => commitHex(stop.hex)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {swatches.length > 0 ? (
        <ColorSwatch
          colors={swatches}
          value={currentHex}
          onValueChange={(hex) => {
            if (!isDisabled) commitHex(hex);
          }}
        />
      ) : null}
    </div>
  );
}

export interface M3EColorPickerFieldProps {
  readonly id?: string;
  readonly name?: string;
  readonly label?: React.ReactNode;
  readonly labelPosition?: "floating" | "outside";
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly required?: boolean;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (hex: string) => void;
  readonly onValueCommitted?: (hex: string) => void;
  readonly swatches?: readonly string[];
  readonly showTonalRamp?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ColorPickerField({
  id,
  name,
  label,
  labelPosition = "floating",
  description,
  errorMessage,
  invalid = false,
  required = false,
  value: controlledValue,
  defaultValue = "#6750A4",
  onValueChange,
  onValueCommitted,
  swatches,
  showTonalRamp = true,
  disabled = false,
  className,
  style,
}: M3EColorPickerFieldProps): React.JSX.Element {
  const { t } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [uncontrolledHex, setUncontrolledHex] = React.useState<string>(() =>
    defaultValue.trim() === "" ? "" : normalizeHex(defaultValue),
  );
  useFormReset(
    triggerRef,
    () =>
      setUncontrolledHex(
        defaultValue.trim() === "" ? "" : normalizeHex(defaultValue),
      ),
    controlledValue === undefined,
  );
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (isDisabled && open) setOpen(false);
  }, [isDisabled, open]);
  const chevronRef = React.useRef<HTMLSpanElement | null>(null);
  useM3EScalarSpringEffect(open ? 180 : 0, "defaultEffects", (deg) => {
    if (chevronRef.current) {
      chevronRef.current.style.rotate = `${deg.toFixed(1)}deg`;
    }
  });
  const rawHex = controlledValue ?? uncontrolledHex;
  const isEmpty = rawHex.trim() === "";
  const currentHex = isEmpty ? "" : normalizeHex(rawHex);
  const isLabelFloated = !isEmpty || open;
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const height = isFloatingLabel ? SELECT_TOKENS.outlinedHeight : 48;
  const radius = isFloatingLabel
    ? SELECT_TOKENS.outlinedRadius
    : SELECT_TOKENS.outsideLabelRadius;
  const popupAriaLabel =
    typeof label === "string" && label.trim().length > 0
      ? label
      : t("colorPicker.ariaLabel");

  return (
    <BasePopover.Root open={open} onOpenChange={setOpen}>
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
        floating={isLabelFloated}
        popupOpen={open}
        hiddenValue={currentHex}
        triggerRef={triggerRef}
        className={
          className
            ? `m3e-field m3e-color-picker-field ${className}`
            : "m3e-field m3e-color-picker-field"
        }
        style={style}
      >
        {({ triggerAriaProps }) => (
          <BasePopover.Trigger
            ref={triggerRef}
            {...triggerAriaProps}
            disabled={isDisabled}
            className="m3e-select__trigger m3e-color-picker-field__trigger"
            data-variant="outlined"
            data-label-position={labelPosition}
            data-floating={isLabelFloated ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              borderRadius: `${radius}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
            }}
          >
            <span className="m3e-color-picker-field__value">
              {!isEmpty ? (
                <>
                  <span
                    className="m3e-color-picker-field__dot"
                    style={{ backgroundColor: currentHex }}
                    aria-hidden="true"
                  />
                  <span className="m3e-color-picker-field__hex">{currentHex}</span>
                </>
              ) : null}
            </span>
            <span
              ref={chevronRef}
              className="m3e-select__chevron"
              style={{ rotate: `${open ? 180 : 0}deg` }}
              aria-hidden="true"
            >
              <ChevronDownIcon strokeWidth={2.2} />
            </span>
          </BasePopover.Trigger>
        )}
      </PickerFieldFrame>

      <BasePopover.Portal container={portalContainer}>
        <BasePopover.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="m3e-popover__positioner"
        >
          <BasePopover.Popup
            aria-label={popupAriaLabel}
            initialFocus={(openType) => openType === "keyboard"}
            className="m3e-color-picker-field__popup"
          >
            <ColorPicker
              value={isEmpty ? "#6750A4" : currentHex}
              swatches={swatches}
              showTonalRamp={showTonalRamp}
              onValueChange={(next) => {
                if (controlledValue === undefined) {
                  setUncontrolledHex(next);
                }
                onValueChange?.(next);
              }}
              onValueCommitted={onValueCommitted}
            />
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

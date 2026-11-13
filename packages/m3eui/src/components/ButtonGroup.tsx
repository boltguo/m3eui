import * as React from "react";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  BUTTON_GROUP_TOKENS,
  BUTTON_SIZE_SPECS,
  type ButtonSize,
  type CornerTuple,
  computeButtonGroupWidths,
  flipCornersHorizontal,
  resolveConnectedGroupCorners,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";
import { Button, type ButtonVariant, ToggleButton } from "./Button.js";

export interface ButtonGroupOption {
  readonly value: string;
  readonly label: React.ReactNode;
  /** Optional constant-width leading icon (unchecked state) */
  readonly icon?: React.ReactNode;
  /** Optional constant-width leading icon when checked (swaps in-place with zero width jump) */
  readonly checkedIcon?: React.ReactNode;
  readonly disabled?: boolean;
}

export interface M3EButtonGroupProps {
  readonly items: readonly ButtonGroupOption[];
  /**
   * `"standard"` (12px gap + default 15% zero-sum neighbor squish) or
   * `"connected"` (2px gap + inner corner matrix + default 0% width change so tab labels stay stationary)
   */
  readonly variant?: "standard" | "connected";
  readonly selectionMode?: "none" | "single" | "multiple";
  readonly value?: readonly string[];
  readonly defaultValue?: readonly string[];
  readonly onValueChange?: (value: string[]) => void;
  readonly onAction?: (value: string) => void;
  readonly size?: ButtonSize;
  readonly buttonVariant?: Exclude<ButtonVariant, "text">;
  /**
   * Press width expansion ratio (`0` = fixed width, `0.15` = 15% expansion with zero-sum neighbor compression).
   * Defaults to `0.15` for `variant="standard"` and `0` for `variant="connected"` (matching AOSP `ButtonGroup.kt` L118
   * & `SingleSelectConnectedButtonGroupSample`).
   */
  readonly expandedRatio?: number;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly onWidthsTelemetry?: (telemetry: {
    readonly baseWidths: readonly number[];
    readonly liveWidths: readonly number[];
  }) => void;
}

function GroupPressTracker({
  isPressed,
  index,
  onProgress,
}: {
  readonly isPressed: boolean;
  readonly index: number;
  readonly onProgress: (index: number, value: number) => void;
}) {
  const progress = useM3EScalarSpring(isPressed ? 1 : 0, "fastSpatial");
  React.useEffect(() => {
    onProgress(index, Math.max(0, progress));
  }, [index, progress, onProgress]);
  return null;
}

export function ButtonGroup({
  items,
  variant = "connected",
  selectionMode = variant === "connected" ? "single" : "none",
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  onAction,
  size = "sm",
  buttonVariant = variant === "connected" ? "tonal" : "filled",
  expandedRatio = variant === "standard"
    ? BUTTON_GROUP_TOKENS.standardExpandedRatio
    : BUTTON_GROUP_TOKENS.connectedExpandedRatio,
  "aria-label": ariaLabel,
  className,
  onWidthsTelemetry,
}: M3EButtonGroupProps): React.JSX.Element {
  const { debugGeometry, direction } = useM3E();
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<readonly string[]>(defaultValue);
  const selectedValues = controlledValue ?? uncontrolledValue;

  const itemRefs = React.useRef<(HTMLElement | null)[]>([]);
  const [baseWidths, setBaseWidths] = React.useState<number[]>([]);
  const [pressedFlags, setPressedFlags] = React.useState<boolean[]>(() =>
    items.map(() => false),
  );
  const [pressProgress, setPressProgress] = React.useState<number[]>(() =>
    items.map(() => 0),
  );

  const spec = BUTTON_SIZE_SPECS[size];
  const itemKeySignature = items.map((i) => `${i.value}:${Boolean(i.icon)}`).join("|");

  // Synchronously measure natural rest widths before paint ONLY when item roster or size tier changes
  React.useLayoutEffect(() => {
    const measured = items.map((_, idx) => {
      const el = itemRefs.current[idx];
      if (!el) return 0;
      const prevInlineWidth = el.style.width;
      const prevPaddingInline = el.style.paddingInline;
      el.style.width = "";
      el.style.paddingInline = `${spec.paddingHorizontal}px`;
      const w = Number(el.getBoundingClientRect().width.toFixed(2));
      el.style.width = prevInlineWidth;
      el.style.paddingInline = prevPaddingInline;
      return w;
    });
    if (measured.every((w) => w > 0)) {
      setBaseWidths(measured);
    }
  }, [itemKeySignature, size, items.length, spec.paddingHorizontal]);

  const handlePressFlag = React.useCallback((idx: number, pressed: boolean) => {
    setPressedFlags((prev) => {
      if (prev[idx] === pressed) return prev;
      const next = [...prev];
      next[idx] = pressed;
      return next;
    });
  }, []);

  const handleProgress = React.useCallback((idx: number, val: number) => {
    setPressProgress((prev) => {
      if (Math.abs((prev[idx] ?? 0) - val) < 1e-4) return prev;
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }, []);

  const liveWidths = React.useMemo(() => {
    if (baseWidths.length !== items.length) return [];
    if (expandedRatio <= 0) return baseWidths;
    // Limit compression to at most 75% of one-side horizontal padding so centered text always has breathing room
    const maxSafeSquish = Math.max(8, Math.floor(spec.paddingHorizontal * 0.75));
    const compressionLimits = items.map(() => maxSafeSquish);
    return computeButtonGroupWidths({
      baseWidths,
      pressProgress,
      expandedRatio,
      compressionLimits,
    });
  }, [baseWidths, pressProgress, expandedRatio, items, spec.paddingHorizontal]);

  React.useEffect(() => {
    if (baseWidths.length === items.length && liveWidths.length === items.length) {
      onWidthsTelemetry?.({ baseWidths, liveWidths });
    }
  }, [baseWidths, liveWidths, items.length, onWidthsTelemetry]);

  const count = items.length;
  const hasMeasuredWidths = liveWidths.length === count;

  const renderItem = (item: ButtonGroupOption, idx: number) => {
    const isChecked = selectedValues.includes(item.value);
    const isPointerPressed = pressedFlags[idx] ?? false;

    const rawCornerOverride: CornerTuple | undefined =
      variant === "connected"
        ? resolveConnectedGroupCorners({
            index: idx,
            count,
            height: spec.height,
            isPressed: isPointerPressed,
            isChecked,
          })
        : undefined;
    const cornerOverride: CornerTuple | undefined =
      rawCornerOverride && direction === "rtl"
        ? flipCornersHorizontal(rawCornerOverride)
        : rawCornerOverride;

    // Crucial CSS rule: once explicit width is locked, set paddingInline: 0 so justify-content: center
    // lets horizontal whitespace absorb 100% of neighbor compression without ever truncating label text!
    const lockedWidthStyle: React.CSSProperties | undefined = hasMeasuredWidths
      ? {
          width: `${liveWidths[idx].toFixed(2)}px`,
          paddingInline: "0px",
        }
      : undefined;

    const deltaWidth =
      hasMeasuredWidths && baseWidths.length === count
        ? liveWidths[idx] - baseWidths[idx]
        : 0;

    if (selectionMode === "none") {
      return (
        <Button
          key={item.value}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          size={size}
          variant={buttonVariant}
          disabled={item.disabled}
          leadingIcon={item.icon}
          cornerOverride={cornerOverride}
          onPressStateChange={(p) => handlePressFlag(idx, p)}
          onClick={() => onAction?.(item.value)}
          className="m3e-button-group__item"
          style={lockedWidthStyle}
        >
          {item.label}
          {debugGeometry && Math.abs(deltaWidth) >= 0.4 ? (
            <span style={{ fontSize: 10, opacity: 0.85, marginLeft: 4 }}>
              ({deltaWidth > 0 ? `+${deltaWidth.toFixed(0)}` : deltaWidth.toFixed(0)}px)
            </span>
          ) : null}
        </Button>
      );
    }

    // If item defines an icon, swap icon <-> checkedIcon in the exact same fixed-size icon slot;
    // if item is text-only, keep showCheckIcon={false} so selection never causes a +32px width jump!
    const hasIconSlot = Boolean(item.icon);
    const activeIcon = isChecked ? (item.checkedIcon ?? item.icon) : item.icon;

    return (
      <ToggleButton
        key={item.value}
        ref={(el) => {
          itemRefs.current[idx] = el;
        }}
        value={item.value}
        pressed={isChecked}
        size={size}
        variant={buttonVariant}
        disabled={item.disabled}
        leadingIcon={activeIcon}
        showCheckIcon={hasIconSlot && !item.checkedIcon}
        cornerOverride={cornerOverride}
        onPointerPressChange={(p) => handlePressFlag(idx, p)}
        className="m3e-button-group__item"
        style={lockedWidthStyle}
      >
        {item.label}
      </ToggleButton>
    );
  };

  const trackers =
    expandedRatio > 0
      ? items.map((item, idx) => (
          <GroupPressTracker
            key={`tracker-${item.value}`}
            index={idx}
            isPressed={pressedFlags[idx] ?? false}
            onProgress={handleProgress}
          />
        ))
      : null;

  const rootClassName = className
    ? `m3e-button-group ${className}`
    : "m3e-button-group";

  if (selectionMode === "none") {
    return (
      <Toolbar.Root
        aria-label={ariaLabel}
        className={rootClassName}
        data-group-variant={variant}
      >
        {trackers}
        {items.map(renderItem)}
      </Toolbar.Root>
    );
  }

  return (
    <ToggleGroup
      aria-label={ariaLabel}
      multiple={selectionMode === "multiple"}
      value={selectedValues as string[]}
      onValueChange={(next) => {
        const resolved =
          selectionMode === "single" && next.length === 0 && selectedValues.length === 1
            ? [...selectedValues]
            : next;
        if (controlledValue === undefined) {
          setUncontrolledValue(resolved);
        }
        onValueChange?.(resolved);
      }}
      className={rootClassName}
      data-group-variant={variant}
    >
      {trackers}
      {items.map(renderItem)}
    </ToggleGroup>
  );
}

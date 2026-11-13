import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  BUTTON_GROUP_TOKENS,
  BUTTON_SIZE_SPECS,
  type ButtonSize,
  type CornerTuple,
  SEGMENTED_MENU_TOKENS,
  computeButtonGroupWidths,
  flipCornersHorizontal,
  resolveConnectedGroupCorners,
  resolveSegmentedMenuItemCorners,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { Button, type ButtonVariant, ToggleButton } from "./Button.js";

export interface ButtonGroupOption {
  readonly value: string;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly checkedIcon?: React.ReactNode;
  readonly showCheckIcon?: boolean;
  readonly disabled?: boolean;
}

export interface M3EButtonGroupProps {
  readonly items: readonly ButtonGroupOption[];
  readonly variant?: "standard" | "connected";
  readonly selectionMode?: "none" | "single" | "multiple";
  readonly value?: readonly string[];
  readonly defaultValue?: readonly string[];
  readonly onValueChange?: (value: string[]) => void;
  readonly onAction?: (value: string) => void;
  readonly size?: ButtonSize;
  readonly buttonVariant?: Exclude<ButtonVariant, "text">;
  readonly expandedRatio?: number;
  readonly maxVisibleItems?: number;
  readonly autoOverflow?: boolean;
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

function MoreHorizontalSvg({ size }: { readonly size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function OverflowMenuItem({
  item,
  index,
  count,
  isSelected,
  onSelect,
}: {
  readonly item: ButtonGroupOption;
  readonly index: number;
  readonly count: number;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  const [highlighted, setHighlighted] = React.useState(false);
  const corners = resolveSegmentedMenuItemCorners({
    index,
    count,
    isHighlighted: highlighted,
    isSelected,
  });
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    corners,
    "fastSpatial",
  );

  return (
    <Menu.Item
      ref={ref}
      disabled={item.disabled}
      onClick={onSelect}
      onPointerEnter={() => setHighlighted(true)}
      onPointerLeave={() => setHighlighted(false)}
      onFocus={() => setHighlighted(true)}
      onBlur={() => setHighlighted(false)}
      className="m3e-segmented-menu__item"
      data-selected={isSelected ? "" : undefined}
      style={{
        minHeight: `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
        paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
        borderRadius: borderRadiusCss,
      }}
    >
      {item.icon ? (
        <span className="m3e-segmented-menu__icon" aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span className="m3e-segmented-menu__label">{item.label}</span>
    </Menu.Item>
  );
}

function OverflowMenuTrigger({
  overflowItems,
  size,
  buttonVariant,
  cornerOverride,
  selectedValues,
  onSelectOverflow,
  label,
}: {
  readonly overflowItems: readonly ButtonGroupOption[];
  readonly size: ButtonSize;
  readonly buttonVariant: Exclude<ButtonVariant, "text">;
  readonly cornerOverride?: CornerTuple;
  readonly selectedValues: readonly string[];
  readonly onSelectOverflow: (value: string) => void;
  readonly label: string;
}) {
  const spec = BUTTON_SIZE_SPECS[size];
  const { isPressed, pressHandlers } = usePressHoldState(false);
  const hasSelectedOverflow = overflowItems.some((i) =>
    selectedValues.includes(i.value),
  );
  const scalarRadius = isPressed ? spec.pressedCornerRadius : spec.restCornerRadius;
  const targetCorners: CornerTuple =
    cornerOverride ?? [scalarRadius, scalarRadius, scalarRadius, scalarRadius];
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLButtonElement>(
    targetCorners,
    "defaultEffects",
  );

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        ref={ref}
        aria-label={label}
        className="m3e-button m3e-button-group__item m3e-button-group__overflow-trigger"
        data-variant={buttonVariant}
        data-size={size}
        data-selected={hasSelectedOverflow ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        style={{
          height: `${spec.height}px`,
          paddingInline: `${Math.max(10, Math.round(spec.paddingHorizontal * 0.75))}px`,
          borderRadius: borderRadiusCss,
        }}
        {...pressHandlers}
      >
        <span
          className="m3e-button__icon"
          style={{ width: spec.iconSize, height: spec.iconSize }}
          aria-hidden="true"
        >
          <MoreHorizontalSvg size={spec.iconSize} />
        </span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="m3e-segmented-menu__positioner"
        >
          <Menu.Popup
            className="m3e-segmented-menu"
            style={{
              borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
              padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
              gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
            }}
          >
            {overflowItems.map((item, idx) => (
              <OverflowMenuItem
                key={item.value}
                item={item}
                index={idx}
                count={overflowItems.length}
                isSelected={selectedValues.includes(item.value)}
                onSelect={() => onSelectOverflow(item.value)}
              />
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
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
  maxVisibleItems,
  autoOverflow = false,
  "aria-label": ariaLabel,
  className,
  onWidthsTelemetry,
}: M3EButtonGroupProps): React.JSX.Element {
  const { debugGeometry, direction, t } = useM3E();
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<readonly string[]>(defaultValue);
  const selectedValues = controlledValue ?? uncontrolledValue;

  const rootRef = React.useRef<HTMLElement | null>(null);
  const measureRowRef = React.useRef<HTMLDivElement | null>(null);
  const [autoLimit, setAutoLimit] = React.useState<number | null>(null);
  const spec = BUTTON_SIZE_SPECS[size];

  React.useLayoutEffect(() => {
    if (!autoOverflow) {
      setAutoLimit(null);
      return;
    }
    const rootEl = rootRef.current;
    const measureEl = measureRowRef.current;
    if (!rootEl || !measureEl) return;

    const computeFit = () => {
      const containerWidth = rootEl.parentElement
        ? rootEl.parentElement.getBoundingClientRect().width
        : rootEl.getBoundingClientRect().width;
      if (containerWidth <= 0) return;

      const childWidths = Array.from(measureEl.children).map((node) =>
        node.getBoundingClientRect().width,
      );
      if (childWidths.length !== items.length || childWidths.some((w) => w <= 0)) {
        return;
      }

      const gapPx =
        variant === "connected"
          ? BUTTON_GROUP_TOKENS.connectedGap
          : BUTTON_GROUP_TOKENS.standardGap;
      const totalAll =
        childWidths.reduce((acc, w) => acc + w, 0) +
        Math.max(0, items.length - 1) * gapPx;

      if (totalAll <= containerWidth + 0.5) {
        setAutoLimit(items.length);
        return;
      }

      const overflowTriggerWidth =
        spec.iconSize + Math.max(10, Math.round(spec.paddingHorizontal * 0.75)) * 2;
      let acc = 0;
      let fitCount = 1;
      for (let i = 0; i < childWidths.length; i++) {
        const nextAcc = acc + childWidths[i]! + gapPx;
        if (nextAcc + overflowTriggerWidth <= containerWidth + 0.5) {
          acc = nextAcc;
          fitCount = i + 1;
        } else {
          break;
        }
      }
      setAutoLimit(Math.max(1, Math.min(items.length - 1, fitCount)));
    };

    computeFit();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(computeFit);
    ro.observe(rootEl.parentElement ?? rootEl);
    return () => ro.disconnect();
  }, [autoOverflow, items, size, spec.iconSize, spec.paddingHorizontal, variant]);

  const effectiveLimit = React.useMemo(() => {
    const manual =
      typeof maxVisibleItems === "number" && maxVisibleItems > 0
        ? maxVisibleItems
        : items.length;
    const responsive = autoLimit !== null ? autoLimit : items.length;
    return Math.min(manual, responsive);
  }, [maxVisibleItems, autoLimit, items.length]);

  const hasOverflow = items.length > effectiveLimit && effectiveLimit > 0;

  const visibleItems = React.useMemo(
    () => (hasOverflow ? items.slice(0, effectiveLimit) : items),
    [hasOverflow, items, effectiveLimit],
  );
  const overflowItems = React.useMemo(
    () => (hasOverflow ? items.slice(effectiveLimit) : []),
    [hasOverflow, items, effectiveLimit],
  );

  const itemRefs = React.useRef<(HTMLElement | null)[]>([]);
  const [baseWidths, setBaseWidths] = React.useState<number[]>([]);
  const [pressedFlags, setPressedFlags] = React.useState<boolean[]>(() =>
    visibleItems.map(() => false),
  );
  const [pressProgress, setPressProgress] = React.useState<number[]>(() =>
    visibleItems.map(() => 0),
  );

  const itemKeySignature = visibleItems
    .map((i) => `${i.value}:${Boolean(i.icon)}`)
    .join("|");

  React.useLayoutEffect(() => {
    const measured = visibleItems.map((_, idx) => {
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
  }, [itemKeySignature, size, visibleItems.length, spec.paddingHorizontal]);

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
    if (baseWidths.length !== visibleItems.length) return [];
    if (expandedRatio <= 0) return baseWidths;
    const maxSafeSquish = Math.max(8, Math.floor(spec.paddingHorizontal * 0.75));
    const compressionLimits = visibleItems.map(() => maxSafeSquish);
    return computeButtonGroupWidths({
      baseWidths,
      pressProgress,
      expandedRatio,
      compressionLimits,
    });
  }, [baseWidths, pressProgress, expandedRatio, visibleItems, spec.paddingHorizontal]);

  React.useEffect(() => {
    if (
      baseWidths.length === visibleItems.length &&
      liveWidths.length === visibleItems.length
    ) {
      onWidthsTelemetry?.({ baseWidths, liveWidths });
    }
  }, [baseWidths, liveWidths, visibleItems.length, onWidthsTelemetry]);

  const visibleCount = visibleItems.length;
  const totalSlots = hasOverflow ? visibleCount + 1 : visibleCount;
  const hasMeasuredWidths = liveWidths.length === visibleCount;

  const commitValues = React.useCallback(
    (next: string[]) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  const handleOverflowSelect = React.useCallback(
    (val: string) => {
      onAction?.(val);
      if (selectionMode === "single") {
        commitValues([val]);
      } else if (selectionMode === "multiple") {
        const exists = selectedValues.includes(val);
        commitValues(
          exists
            ? selectedValues.filter((v) => v !== val)
            : [...selectedValues, val],
        );
      }
    },
    [commitValues, onAction, selectedValues, selectionMode],
  );

  const renderItem = (item: ButtonGroupOption, idx: number) => {
    const isChecked = selectedValues.includes(item.value);
    const isPointerPressed = pressedFlags[idx] ?? false;

    const rawCornerOverride: CornerTuple | undefined =
      variant === "connected"
        ? resolveConnectedGroupCorners({
            index: idx,
            count: totalSlots,
            height: spec.height,
            isPressed: isPointerPressed,
            isChecked,
          })
        : undefined;
    const cornerOverride: CornerTuple | undefined =
      rawCornerOverride && direction === "rtl"
        ? flipCornersHorizontal(rawCornerOverride)
        : rawCornerOverride;

    const lockedWidthStyle: React.CSSProperties | undefined = hasMeasuredWidths
      ? {
          width: `${liveWidths[idx].toFixed(2)}px`,
          paddingInline: "0px",
        }
      : undefined;

    const deltaWidth =
      hasMeasuredWidths && baseWidths.length === visibleCount
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
            <span style={{ fontSize: 10, opacity: 0.85, marginInlineStart: 4 }}>
              ({deltaWidth > 0 ? `+${deltaWidth.toFixed(0)}` : deltaWidth.toFixed(0)}px)
            </span>
          ) : null}
        </Button>
      );
    }

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
        showCheckIcon={item.showCheckIcon ?? false}
        cornerOverride={cornerOverride}
        onPointerPressChange={(p) => handlePressFlag(idx, p)}
        className="m3e-button-group__item"
        style={lockedWidthStyle}
      >
        {item.label}
      </ToggleButton>
    );
  };

  const overflowCornerOverride: CornerTuple | undefined = React.useMemo(() => {
    if (!hasOverflow || variant !== "connected") return undefined;
    const raw = resolveConnectedGroupCorners({
      index: visibleCount,
      count: totalSlots,
      height: spec.height,
      isChecked: overflowItems.some((i) => selectedValues.includes(i.value)),
    });
    return direction === "rtl" ? flipCornersHorizontal(raw) : raw;
  }, [
    hasOverflow,
    variant,
    visibleCount,
    totalSlots,
    spec.height,
    overflowItems,
    selectedValues,
    direction,
  ]);

  const trackers =
    expandedRatio > 0
      ? visibleItems.map((item, idx) => (
          <GroupPressTracker
            key={`tracker-${item.value}`}
            index={idx}
            isPressed={pressedFlags[idx] ?? false}
            onProgress={handleProgress}
          />
        ))
      : null;

  const overflowNode = hasOverflow ? (
    <OverflowMenuTrigger
      overflowItems={overflowItems}
      size={size}
      buttonVariant={buttonVariant}
      cornerOverride={overflowCornerOverride}
      selectedValues={selectedValues}
      onSelectOverflow={handleOverflowSelect}
      label={t("buttonGroup.moreActions")}
    />
  ) : null;

  const rootClassName = className
    ? `m3e-button-group ${className}`
    : "m3e-button-group";

  const measureGhostNode = autoOverflow ? (
    <div
      ref={measureRowRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        visibility: "hidden",
        pointerEvents: "none",
        top: -9999,
        left: -9999,
        display: "inline-flex",
        whiteSpace: "nowrap",
      }}
    >
      {items.map((item) => (
        <span
          key={`measure-${item.value}`}
          className="m3e-button"
          data-size={size}
          style={{
            height: `${spec.height}px`,
            paddingInline: `${spec.paddingHorizontal}px`,
            gap: `${spec.iconGap}px`,
            fontSize: `${spec.fontSize}px`,
          }}
        >
          {item.icon ? (
            <span
              style={{ width: spec.iconSize, height: spec.iconSize, display: "inline-flex" }}
            />
          ) : null}
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  ) : null;

  if (selectionMode === "none") {
    return (
      <Toolbar.Root
        ref={rootRef as React.RefObject<HTMLDivElement>}
        aria-label={ariaLabel}
        className={rootClassName}
        data-group-variant={variant}
      >
        {measureGhostNode}
        {trackers}
        {visibleItems.map(renderItem)}
        {overflowNode}
      </Toolbar.Root>
    );
  }

  return (
    <ToggleGroup
      ref={rootRef as React.RefObject<HTMLDivElement>}
      aria-label={ariaLabel}
      multiple={selectionMode === "multiple"}
      value={selectedValues as string[]}
      onValueChange={(next) => {
        const resolved =
          selectionMode === "single" && next.length === 0 && selectedValues.length === 1
            ? [...selectedValues]
            : next;
        commitValues(resolved);
      }}
      className={rootClassName}
      data-group-variant={variant}
    >
      {measureGhostNode}
      {trackers}
      {visibleItems.map(renderItem)}
      {overflowNode}
    </ToggleGroup>
  );
}

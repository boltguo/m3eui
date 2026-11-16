"use client";

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
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { ButtonGroupItemContext } from "../internal/buttonGroupContext.js";
import { Button, type ButtonVariant, ToggleButton } from "./Button.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";

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

interface OverflowMenuSurfaceProps {
  readonly itemProps: React.HTMLAttributes<HTMLDivElement> & {
    readonly ref?: React.Ref<HTMLDivElement>;
  };
  readonly item: ButtonGroupOption;
  readonly index: number;
  readonly count: number;
  readonly isSelected: boolean;
}

function OverflowMenuSurface({
  itemProps,
  item,
  index,
  count,
  isSelected,
}: OverflowMenuSurfaceProps) {
  const { ref: incomingRef, style: incomingStyle, ...restItemProps } = itemProps;
  const corners = resolveSegmentedMenuItemCorners({
    index,
    count,
    isSelected,
  });
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    corners,
    "fastSpatial",
    incomingRef,
  );

  return (
    <div
      {...restItemProps}
      ref={ref}
      data-selected={isSelected ? "" : undefined}
      style={{
        ...incomingStyle,
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
      <span
        className="m3e-segmented-menu__label"
        data-text={typeof item.label === "string" ? item.label : undefined}
      >
        {item.label}
      </span>
    </div>
  );
}

function OverflowMenuItem({
  item,
  index,
  count,
  selectionMode,
  isSelected,
  onSelect,
}: {
  readonly item: ButtonGroupOption;
  readonly index: number;
  readonly count: number;
  readonly selectionMode: "none" | "single" | "multiple";
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  if (selectionMode === "single") {
    return (
      <Menu.RadioItem
        value={item.value}
        disabled={item.disabled}
        closeOnClick
        onClick={onSelect}
        className="m3e-segmented-menu__item"
        render={(props) => (
          <OverflowMenuSurface
            itemProps={props as OverflowMenuSurfaceProps["itemProps"]}
            item={item}
            index={index}
            count={count}
            isSelected={isSelected}
          />
        )}
      />
    );
  }

  if (selectionMode === "multiple") {
    return (
      <Menu.CheckboxItem
        checked={isSelected}
        disabled={item.disabled}
        closeOnClick
        onClick={onSelect}
        className="m3e-segmented-menu__item"
        render={(props) => (
          <OverflowMenuSurface
            itemProps={props as OverflowMenuSurfaceProps["itemProps"]}
            item={item}
            index={index}
            count={count}
            isSelected={isSelected}
          />
        )}
      />
    );
  }

  return (
    <Menu.Item
      disabled={item.disabled}
      onClick={onSelect}
      className="m3e-segmented-menu__item"
      render={(props) => (
        <OverflowMenuSurface
          itemProps={props as OverflowMenuSurfaceProps["itemProps"]}
          item={item}
          index={index}
          count={count}
          isSelected={isSelected}
        />
      )}
    />
  );
}

function OverflowMenuTrigger({
  overflowItems,
  size,
  buttonVariant,
  selectionMode,
  cornerOverride,
  selectedValues,
  onSelectOverflow,
  label,
}: {
  readonly overflowItems: readonly ButtonGroupOption[];
  readonly size: ButtonSize;
  readonly buttonVariant: Exclude<ButtonVariant, "text">;
  readonly selectionMode: "none" | "single" | "multiple";
  readonly cornerOverride?: CornerTuple;
  readonly selectedValues: readonly string[];
  readonly onSelectOverflow: (value: string) => void;
  readonly label: string;
}) {
  const portalContainer = useM3EPortalContainer();
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

  const renderedItems = overflowItems.map((item, idx) => (
    <OverflowMenuItem
      key={item.value}
      item={item}
      index={idx}
      count={overflowItems.length}
      selectionMode={selectionMode}
      isSelected={selectedValues.includes(item.value)}
      onSelect={() => onSelectOverflow(item.value)}
    />
  ));

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
          borderWidth: buttonVariant === "outlined" ? `${spec.outlineWidth}px` : undefined,
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
      <Menu.Portal container={portalContainer}>
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
            {selectionMode === "single" ? (
              <Menu.RadioGroup value={selectedValues[0] ?? ""}>
                {renderedItems}
              </Menu.RadioGroup>
            ) : (
              renderedItems
            )}
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
}: M3EButtonGroupProps): React.JSX.Element {
  const { debugGeometry, direction, t } = useM3ERuntime();
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<readonly string[]>(defaultValue);
  const selectedValues = controlledValue ?? uncontrolledValue;

  const rootRef = React.useRef<HTMLElement | null>(null);
  const measureRowRef = React.useRef<HTMLDivElement | null>(null);
  const [autoLimit, setAutoLimit] = React.useState<number | null>(null);
  const spec = BUTTON_SIZE_SPECS[size];
  const itemsSignature = items
    .map(
      (i) =>
        `${i.value}:${typeof i.label === "string" || typeof i.label === "number" ? i.label : ""}:${Boolean(i.icon)}:${Boolean(i.checkedIcon)}:${Boolean(i.showCheckIcon)}`,
    )
    .join("|");
  const itemCount = items.length;

  useIsoLayoutEffect(() => {
    if (!autoOverflow) {
      setAutoLimit((prev) => (prev === null ? prev : null));
      return;
    }
    const rootEl = rootRef.current;
    const measureEl = measureRowRef.current;
    if (!rootEl || !measureEl) return;

    let cancelled = false;
    const computeFit = () => {
      if (cancelled) return;
      const containerWidth = rootEl.parentElement
        ? rootEl.parentElement.getBoundingClientRect().width
        : rootEl.getBoundingClientRect().width;
      if (containerWidth <= 0) return;

      const children = Array.from(measureEl.children);
      const childWidths = children.map((node) =>
        node.getBoundingClientRect().width,
      );
      if (childWidths.length !== itemCount || childWidths.some((w) => w <= 0)) {
        return;
      }

      const gapPx =
        variant === "connected"
          ? BUTTON_GROUP_TOKENS.connectedGap
          : BUTTON_GROUP_TOKENS.standardGap;
      const totalAll =
        childWidths.reduce((acc, w) => acc + w, 0) +
        Math.max(0, itemCount - 1) * gapPx;

      if (totalAll <= containerWidth + 0.5) {
        setAutoLimit((prev) => (prev === itemCount ? prev : itemCount));
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
      const nextLimit = Math.max(1, Math.min(itemCount - 1, fitCount));
      setAutoLimit((prev) => (prev === nextLimit ? prev : nextLimit));
    };

    computeFit();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        computeFit();
      });
    }
    if (typeof ResizeObserver === "undefined") {
      return () => {
        cancelled = true;
      };
    }
    const ro = new ResizeObserver(computeFit);
    ro.observe(rootEl.parentElement ?? rootEl);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [
    autoOverflow,
    itemsSignature,
    itemCount,
    selectionMode,
    size,
    spec.iconSize,
    spec.paddingHorizontal,
    variant,
  ]);

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

  const visibleCount = visibleItems.length;
  const visibleItemsRef = React.useRef(visibleItems);
  visibleItemsRef.current = visibleItems;

  useIsoLayoutEffect(() => {
    let cancelled = false;
    const measureItems = () => {
      if (cancelled) return;
      const currentItems = visibleItemsRef.current;
      const elements = currentItems.map((_, idx) => itemRefs.current[idx]);
      const savedStyles = elements.map((el) => {
        if (!el) return null;
        const prev = {
          width: el.style.width,
          paddingInline: el.style.paddingInline,
        };
        el.style.width = "";
        el.style.paddingInline = `${spec.paddingHorizontal}px`;
        return prev;
      });

      const measured = elements.map((el, idx) => {
        if (!el) return 0;
        const rawWidth = el.getBoundingClientRect().width;
        if (rawWidth <= 0) return 0;
        const item = currentItems[idx];
        const reservesCheckSlot =
          selectionMode !== "none" &&
          Boolean(item && !item.icon && (item.showCheckIcon || item.checkedIcon));
        const hasMountedIcon = Boolean(el.querySelector(".m3e-button__icon"));
        const extraCheckWidth =
          reservesCheckSlot && !hasMountedIcon ? spec.iconSize + spec.iconGap : 0;
        return Number((rawWidth + extraCheckWidth).toFixed(2));
      });

      elements.forEach((el, idx) => {
        const prev = savedStyles[idx];
        if (!el || !prev) return;
        el.style.width = prev.width;
        el.style.paddingInline = prev.paddingInline;
      });

      if (measured.length > 0 && measured.every((w) => w > 0)) {
        setBaseWidths((prev) => {
          if (
            prev.length === measured.length &&
            prev.every((w, i) => Math.abs(w - measured[i]!) < 0.05)
          ) {
            return prev;
          }
          return measured;
        });
      }
    };

    measureItems();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        measureItems();
      });
    }
    return () => {
      cancelled = true;
    };
  }, [
    itemsSignature,
    visibleCount,
    selectionMode,
    size,
    spec.paddingHorizontal,
    spec.iconSize,
    spec.iconGap,
  ]);

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
    if (baseWidths.length !== visibleCount) return [];
    if (expandedRatio <= 0) return baseWidths;
    const maxSafeSquish = Math.max(8, Math.floor(spec.paddingHorizontal * 0.75));
    const compressionLimits = baseWidths.map(() => maxSafeSquish);
    return computeButtonGroupWidths({
      baseWidths,
      pressProgress,
      expandedRatio,
      compressionLimits,
    });
  }, [baseWidths, pressProgress, expandedRatio, visibleCount, spec.paddingHorizontal]);

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
        <ButtonGroupItemContext.Provider
          key={item.value}
          value={{
            cornerOverride,
            onPressChange: (p) => handlePressFlag(idx, p),
          }}
        >
          <Toolbar.Button
            disabled={item.disabled}
            render={
              <Button
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                size={size}
                variant={buttonVariant}
                disabled={item.disabled}
                leadingIcon={item.icon}
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
            }
          />
        </ButtonGroupItemContext.Provider>
      );
    }

    const activeIcon = isChecked ? (item.checkedIcon ?? item.icon) : item.icon;

    return (
      <ButtonGroupItemContext.Provider
        key={item.value}
        value={{
          cornerOverride,
          onPressChange: (p) => handlePressFlag(idx, p),
        }}
      >
        <ToggleButton
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
          className="m3e-button-group__item"
          style={lockedWidthStyle}
        >
          {item.label}
        </ToggleButton>
      </ButtonGroupItemContext.Provider>
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
      selectionMode={selectionMode}
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
      {items.map((item) => {
        const reservesIcon = Boolean(
          item.icon ||
            (selectionMode !== "none" && (item.showCheckIcon || item.checkedIcon)),
        );
        return (
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
            {reservesIcon ? (
              <span
                style={{
                  width: spec.iconSize,
                  height: spec.iconSize,
                  display: "inline-flex",
                }}
              />
            ) : null}
            <span>{item.label}</span>
          </span>
        );
      })}
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

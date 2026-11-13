import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  FAB_MENU_TOKENS,
  FLOATING_TOOLBAR_TOKENS,
  type FloatingToolbarTheme,
  type ToggleFabSize,
  resolveToggleFabGeometry,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export interface FloatingToolbarItemSpec {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly separatorBefore?: boolean;
  readonly onClick?: () => void;
}

export interface M3EFloatingToolbarProps {
  readonly items: readonly FloatingToolbarItemSpec[];
  readonly "aria-label"?: string;
  readonly orientation?: "horizontal" | "vertical";
  readonly theme?: FloatingToolbarTheme;
  readonly collapsed?: boolean;
  readonly defaultCollapsed?: boolean;
  readonly onCollapsedChange?: (collapsed: boolean) => void;
  readonly scrollCollapse?: boolean;
  readonly scrollTarget?: React.RefObject<HTMLElement | null>;
  readonly companionFab?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function FloatingToolbarActionButton({
  item,
}: {
  readonly item: FloatingToolbarItemSpec;
}) {
  const { debugGeometry } = useM3E();
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const pill = FLOATING_TOOLBAR_TOKENS.itemSize / 2;
  const targetRadius = isPressed ? 10 : item.selected ? 14 : pill;
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLButtonElement>(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    item.selected ? "fastSpatial" : "defaultEffects",
  );

  return (
    <Toolbar.Button
      ref={ref}
      disabled={item.disabled}
      aria-label={item.label}
      aria-pressed={item.selected}
      title={item.label}
      onClick={item.onClick}
      className="m3e-floating-toolbar__button"
      data-selected={item.selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        height: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        minInlineSize: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        minBlockSize: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        borderRadius: borderRadiusCss,
      }}
      {...pressHandlers}
    >
      <span className="m3e-floating-toolbar__icon" aria-hidden="true">
        {item.icon}
      </span>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          r:{targetRadius.toFixed(0)}
        </span>
      ) : null}
    </Toolbar.Button>
  );
}

export function FloatingToolbar({
  items,
  "aria-label": ariaLabel,
  orientation = "horizontal",
  theme = "vibrant",
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  scrollCollapse = false,
  scrollTarget,
  companionFab,
  className,
  style,
}: M3EFloatingToolbarProps): React.JSX.Element {
  const { t } = useM3E();
  const resolvedAriaLabel = ariaLabel ?? t("floatingToolbar.ariaLabel");
  const isVertical = orientation === "vertical";

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    React.useState<boolean>(defaultCollapsed);
  const collapsed = controlledCollapsed ?? uncontrolledCollapsed;

  const updateCollapsed = React.useCallback(
    (next: boolean) => {
      if (controlledCollapsed === undefined) {
        setUncontrolledCollapsed((prev) => {
          if (prev !== next) onCollapsedChange?.(next);
          return next;
        });
      } else if (next !== controlledCollapsed) {
        onCollapsedChange?.(next);
      }
    },
    [controlledCollapsed, onCollapsedChange],
  );

  React.useEffect(() => {
    if (!scrollCollapse || typeof window === "undefined") return;
    const targetEl = scrollTarget?.current;
    const eventSource: HTMLElement | Window = targetEl ?? window;
    const readScrollOffset = () =>
      targetEl ? targetEl.scrollTop : window.scrollY;

    let lastOffset = readScrollOffset();
    const onScroll = () => {
      const current = readScrollOffset();
      const delta = current - lastOffset;
      if (current <= 8 || delta < -8) {
        updateCollapsed(false);
        lastOffset = current;
      } else if (delta > 10 && current > 24) {
        updateCollapsed(true);
        lastOffset = current;
      }
    };

    eventSource.addEventListener("scroll", onScroll, { passive: true });
    return () => eventSource.removeEventListener("scroll", onScroll);
  }, [scrollCollapse, scrollTarget, updateCollapsed]);

  const collapseMorph = useM3EScalarSpring(collapsed ? 1 : 0, "fastSpatial");
  const companionScale = 1 + 0.08 * Math.max(0, collapseMorph);

  return (
    <div
      className={
        className
          ? `m3e-floating-toolbar-layout ${className}`
          : "m3e-floating-toolbar-layout"
      }
      data-orientation={orientation}
      data-collapsed={collapsed ? "" : undefined}
      style={{
        gap: collapsed ? "0px" : `${FLOATING_TOOLBAR_TOKENS.companionFabGap}px`,
        ...style,
      }}
    >
      <Toolbar.Root
        orientation={orientation}
        aria-label={resolvedAriaLabel}
        inert={collapsed ? true : undefined}
        className="m3e-floating-toolbar"
        data-theme={theme}
        data-orientation={orientation}
        data-collapsed={collapsed ? "" : undefined}
        style={{
          borderRadius: `${FLOATING_TOOLBAR_TOKENS.containerRadius}px`,
          padding: collapsed ? "0px" : `${FLOATING_TOOLBAR_TOKENS.containerPadding}px`,
          gap: `${FLOATING_TOOLBAR_TOKENS.itemGap}px`,
          minHeight: isVertical
            ? undefined
            : collapsed
              ? "0px"
              : `${FLOATING_TOOLBAR_TOKENS.containerCrossSize}px`,
          minWidth: isVertical
            ? collapsed
              ? "0px"
              : `${FLOATING_TOOLBAR_TOKENS.containerCrossSize}px`
            : undefined,
        }}
      >
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.separatorBefore ? (
              <Toolbar.Separator
                className="m3e-floating-toolbar__separator"
                data-orientation={orientation}
              />
            ) : null}
            <FloatingToolbarActionButton item={item} />
          </React.Fragment>
        ))}
      </Toolbar.Root>
      {companionFab ? (
        <div
          className="m3e-floating-toolbar__companion"
          data-collapsed={collapsed ? "" : undefined}
          style={{ scale: `${companionScale.toFixed(3)}` }}
        >
          {companionFab}
        </div>
      ) : null}
    </div>
  );
}

export interface FABMenuItemSpec {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly onSelect?: () => void;
}

export interface M3EFABMenuProps {
  readonly items: readonly FABMenuItemSpec[];
  readonly size?: ToggleFabSize;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly icon?: React.ReactNode;
  readonly triggerLabel?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DefaultPlusSvg() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function StaggeredFabMenuItem({
  item,
  index,
  count,
  isOpen,
  isRovingActive,
  onFocusItem,
  onDismissAndSelect,
  buttonRef,
}: {
  readonly item: FABMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly isOpen: boolean;
  readonly isRovingActive: boolean;
  readonly onFocusItem: () => void;
  readonly onDismissAndSelect: () => void;
  readonly buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const { playbackRate } = useM3E();
  const [itemActive, setItemActive] = React.useState<boolean>(isOpen);

  React.useEffect(() => {
    const rate = Math.max(0.1, playbackRate);
    const rawDelayMs = isOpen
      ? (count - 1 - index) * FAB_MENU_TOKENS.staggerStepMs
      : index * 25;
    const delayMs = rawDelayMs / rate;

    if (delayMs <= 1) {
      setItemActive(isOpen);
      return;
    }
    const timer = setTimeout(() => {
      setItemActive(isOpen);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isOpen, index, count, playbackRate]);

  const spatialProgress = useM3EScalarSpring(
    itemActive ? 1 : 0,
    "defaultSpatial",
  );
  const opacityProgress = useM3EScalarSpring(itemActive ? 1 : 0, "fastEffects");

  const { isPressed, pressHandlers } = usePressHoldState(!isOpen);
  const itemCornerTarget = isPressed ? 16 : FAB_MENU_TOKENS.itemRadius;
  const { ref: mergedRef, borderRadiusCss } =
    useM3ECornerSpringRef<HTMLButtonElement>(
      [itemCornerTarget, itemCornerTarget, itemCornerTarget, itemCornerTarget],
      "defaultEffects",
      buttonRef,
    );

  const translateY = (1 - spatialProgress) * 18;
  const scale = 0.88 + 0.12 * spatialProgress;
  const clampedOpacity = Math.max(0, Math.min(1, opacityProgress));

  return (
    <button
      ref={mergedRef}
      type="button"
      role="menuitem"
      tabIndex={isOpen && isRovingActive ? 0 : -1}
      onFocus={onFocusItem}
      onClick={onDismissAndSelect}
      className="m3e-fab-menu__item"
      data-open={isOpen ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        height: `${FAB_MENU_TOKENS.itemHeight}px`,
        paddingInline: `${FAB_MENU_TOKENS.itemPaddingInline}px`,
        gap: `${FAB_MENU_TOKENS.itemIconGap}px`,
        borderRadius: borderRadiusCss,
        opacity: clampedOpacity,
        translate: `0px ${translateY.toFixed(2)}px`,
        scale: `${scale.toFixed(3)}`,
        pointerEvents: isOpen ? "auto" : "none",
      }}
      {...pressHandlers}
    >
      <span
        className="m3e-fab-menu__item-icon"
        style={{
          width: FAB_MENU_TOKENS.itemIconSize,
          height: FAB_MENU_TOKENS.itemIconSize,
        }}
        aria-hidden="true"
      >
        {item.icon}
      </span>
      <span className="m3e-fab-menu__item-label">{item.label}</span>
    </button>
  );
}

export function FABMenu({
  items,
  size = "md",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  icon,
  triggerLabel,
  className,
  style,
}: M3EFABMenuProps): React.JSX.Element {
  const { debugGeometry, t } = useM3E();
  const resolvedTriggerLabel = triggerLabel ?? t("fabMenu.triggerOpen");
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = React.useState<number>(() =>
    Math.max(0, items.length - 1),
  );
  const menuListId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, setOpen]);

  const focusItemAt = React.useCallback(
    (idx: number) => {
      if (items.length === 0) return;
      const clamped = ((idx % items.length) + items.length) % items.length;
      setActiveIndex(clamped);
      itemRefs.current[clamped]?.focus();
    },
    [items.length],
  );

  const { isPressed, pressHandlers } = usePressHoldState(false);
  const morphProgress = useM3EScalarSpring(isOpen ? 1 : 0, "fastSpatial");
  const fabGeo = resolveToggleFabGeometry(size, morphProgress);

  const effectiveRadius = isPressed
    ? Math.max(10, fabGeo.cornerRadius - 6)
    : fabGeo.cornerRadius;

  return (
    <div
      ref={rootRef}
      className={className ? `m3e-fab-menu ${className}` : "m3e-fab-menu"}
      data-open={isOpen ? "" : undefined}
      style={style}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
          return;
        }
        if (items.length === 0) return;
        if (e.target === triggerRef.current) {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen) {
              setOpen(true);
              queueMicrotask(() => focusItemAt(items.length - 1));
            } else {
              focusItemAt(items.length - 1);
            }
          } else if (e.key === "ArrowDown" && isOpen) {
            e.preventDefault();
            focusItemAt(0);
          }
          return;
        }
        if (!isOpen) return;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          focusItemAt(activeIndex - 1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          focusItemAt(activeIndex + 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          focusItemAt(0);
        } else if (e.key === "End") {
          e.preventDefault();
          focusItemAt(items.length - 1);
        }
      }}
    >
      <div
        id={menuListId}
        role="menu"
        aria-label={resolvedTriggerLabel}
        inert={!isOpen ? true : undefined}
        className="m3e-fab-menu__list"
        style={{
          gap: `${FAB_MENU_TOKENS.listGap}px`,
          marginBottom: `${FAB_MENU_TOKENS.closeButtonGap}px`,
        }}
      >
        {items.map((item, idx) => (
          <StaggeredFabMenuItem
            key={item.id}
            item={item}
            index={idx}
            count={items.length}
            isOpen={isOpen}
            isRovingActive={idx === activeIndex}
            onFocusItem={() => setActiveIndex(idx)}
            buttonRef={(el) => {
              itemRefs.current[idx] = el;
            }}
            onDismissAndSelect={() => {
              item.onSelect?.();
              setOpen(false);
              triggerRef.current?.focus();
            }}
          />
        ))}
      </div>

      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? t("fabMenu.triggerClose") : resolvedTriggerLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuListId}
        onClick={() => setOpen(!isOpen)}
        className="m3e-toggle-fab"
        data-open={isOpen ? "" : undefined}
        data-size={size}
        data-pressed={isPressed ? "" : undefined}
        style={{
          width: `${fabGeo.containerSize.toFixed(1)}px`,
          height: `${fabGeo.containerSize.toFixed(1)}px`,
          borderRadius: `${effectiveRadius.toFixed(1)}px`,
        }}
        {...pressHandlers}
      >
        <span
          className="m3e-toggle-fab__icon"
          style={{
            width: `${fabGeo.iconSize.toFixed(1)}px`,
            height: `${fabGeo.iconSize.toFixed(1)}px`,
            rotate: `${fabGeo.iconRotationDeg.toFixed(1)}deg`,
          }}
          aria-hidden="true"
        >
          {icon ?? <DefaultPlusSvg />}
        </span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            {Math.round(fabGeo.containerSize)}px r:{effectiveRadius.toFixed(0)}
          </span>
        ) : null}
      </button>
    </div>
  );
}

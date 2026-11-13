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
  useM3ECornerSpring,
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
  readonly "aria-label": string;
  readonly orientation?: "horizontal" | "vertical";
  readonly theme?: FloatingToolbarTheme;
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
  const { corners, borderRadiusCss } = useM3ECornerSpring(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    "fastSpatial",
  );

  return (
    <Toolbar.Button
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
          r:{corners[0].toFixed(0)}
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
  companionFab,
  className,
  style,
}: M3EFloatingToolbarProps): React.JSX.Element {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={
        className
          ? `m3e-floating-toolbar-layout ${className}`
          : "m3e-floating-toolbar-layout"
      }
      data-orientation={orientation}
      style={{
        gap: `${FLOATING_TOOLBAR_TOKENS.companionFabGap}px`,
        ...style,
      }}
    >
      <Toolbar.Root
        orientation={orientation}
        aria-label={ariaLabel}
        className="m3e-floating-toolbar"
        data-theme={theme}
        data-orientation={orientation}
        style={{
          borderRadius: `${FLOATING_TOOLBAR_TOKENS.containerRadius}px`,
          padding: `${FLOATING_TOOLBAR_TOKENS.containerPadding}px`,
          gap: `${FLOATING_TOOLBAR_TOKENS.itemGap}px`,
          minHeight: isVertical
            ? undefined
            : `${FLOATING_TOOLBAR_TOKENS.containerCrossSize}px`,
          minWidth: isVertical
            ? `${FLOATING_TOOLBAR_TOKENS.containerCrossSize}px`
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
        <div className="m3e-floating-toolbar__companion">{companionFab}</div>
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
  onDismissAndSelect,
}: {
  readonly item: FABMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly isOpen: boolean;
  readonly onDismissAndSelect: () => void;
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
  const { borderRadiusCss } = useM3ECornerSpring(
    [itemCornerTarget, itemCornerTarget, itemCornerTarget, itemCornerTarget],
    "fastSpatial",
  );

  const translateY = (1 - spatialProgress) * 18;
  const scale = 0.88 + 0.12 * spatialProgress;
  const clampedOpacity = Math.max(0, Math.min(1, opacityProgress));

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={isOpen ? 0 : -1}
      aria-hidden={!isOpen && clampedOpacity < 0.02 ? true : undefined}
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
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
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

  const { isPressed, pressHandlers } = usePressHoldState(false);
  const morphProgress = useM3EScalarSpring(isOpen ? 1 : 0, "fastSpatial");
  const fabGeo = resolveToggleFabGeometry(size, morphProgress);

  const effectiveRadius = isPressed
    ? Math.max(10, fabGeo.cornerRadius - 6)
    : fabGeo.cornerRadius;

  return (
    <div
      className={className ? `m3e-fab-menu ${className}` : "m3e-fab-menu"}
      data-open={isOpen ? "" : undefined}
      style={style}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <div
        id={menuListId}
        role="menu"
        aria-label={resolvedTriggerLabel}
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
            onDismissAndSelect={() => {
              item.onSelect?.();
              setOpen(false);
            }}
          />
        ))}
      </div>

      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? t("fabMenu.triggerClose") : resolvedTriggerLabel}
        aria-expanded={isOpen}
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

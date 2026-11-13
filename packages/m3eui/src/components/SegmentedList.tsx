import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import {
  type CornerTuple,
  resolveSegmentedListCorners,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { useM3ECornerSpring, usePressHoldState } from "../hooks/useM3ESpring.js";

interface SegmentedListItemContextValue {
  readonly index: number;
  readonly count: number;
}

const SegmentedListItemContext = React.createContext<SegmentedListItemContextValue>({
  index: 0,
  count: 1,
});

export interface SegmentedListProps {
  readonly children: React.ReactNode;
  readonly "aria-label"?: string;
  readonly className?: string;
}

export function SegmentedList({
  children,
  "aria-label": ariaLabel,
  className,
}: SegmentedListProps): React.JSX.Element {
  const validChildren = React.Children.toArray(children).filter(React.isValidElement);
  const count = validChildren.length;

  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={className ? `m3e-segmented-list ${className}` : "m3e-segmented-list"}
    >
      {validChildren.map((child, index) => (
        <SegmentedListItemContext.Provider
          key={child.key ?? index}
          value={{ index, count }}
        >
          <li className="m3e-segmented-list__li">{child}</li>
        </SegmentedListItemContext.Provider>
      ))}
    </ul>
  );
}

export interface SegmentedListItemProps {
  readonly headline: React.ReactNode;
  readonly supportingText?: React.ReactNode;
  readonly leading?: React.ReactNode;
  readonly trailing?: React.ReactNode;
  readonly lines?: 1 | 2 | 3;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
}

function CheckBadgeSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatTupleBadge(c: CornerTuple): string {
  const [a, b, d, e] = c.map((v) => Math.round(v));
  if (a === b && b === d && d === e) return `r:${c[0].toFixed(1)}`;
  return `r:${a}/${b}/${d}/${e}`;
}

export function SegmentedListItem({
  headline,
  supportingText,
  leading,
  trailing,
  lines = supportingText ? 2 : 1,
  selected = false,
  disabled = false,
  onClick,
}: SegmentedListItemProps): React.JSX.Element {
  const { index, count } = React.useContext(SegmentedListItemContext);
  const { debugGeometry } = useM3E();
  const [isHovered, setIsHovered] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(disabled);

  const targetCorners = resolveSegmentedListCorners({
    index,
    count,
    isHovered,
    isPressed,
    isSelected: selected,
  });

  const { corners, borderRadiusCss } = useM3ECornerSpring(targetCorners, "fastSpatial");

  return (
    <BaseButton
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className="m3e-segmented-list__item"
      style={{ borderRadius: borderRadiusCss }}
      data-lines={lines}
      data-selected={selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      data-hovered={isHovered ? "" : undefined}
      data-position={
        count === 1
          ? "single"
          : index === 0
            ? "first"
            : index === count - 1
              ? "last"
              : "middle"
      }
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        pressHandlers.onPointerLeave();
      }}
      onPointerDown={pressHandlers.onPointerDown}
      onPointerUp={pressHandlers.onPointerUp}
      onPointerCancel={pressHandlers.onPointerCancel}
      onKeyDown={pressHandlers.onKeyDown}
      onKeyUp={pressHandlers.onKeyUp}
      onBlur={pressHandlers.onBlur}
    >
      <span className="m3e-segmented-list__leading" aria-hidden="true">
        {selected ? <CheckBadgeSvg /> : (leading ?? "•")}
      </span>
      <span className="m3e-segmented-list__content">
        <span className="m3e-segmented-list__headline">{headline}</span>
        {supportingText ? (
          <span className="m3e-segmented-list__supporting">{supportingText}</span>
        ) : null}
      </span>
      {trailing ? (
        <span className="m3e-segmented-list__trailing">{trailing}</span>
      ) : null}
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          #{index + 1}/{count} {formatTupleBadge(corners)}
        </span>
      ) : null}
    </BaseButton>
  );
}

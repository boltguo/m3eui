"use client";

import * as React from "react";
import {
  DRAG_HANDLE_TOKENS,
  resolveDragHandleGeometry,
} from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";

export interface M3EDragHandleProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children" | "onChange" | "aria-label"
  > {
  readonly orientation?: "vertical" | "horizontal";
  readonly value?: number;
  readonly defaultValue?: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly onValueChange?: (value: number) => void;
  readonly onDragDelta?: (deltaPx: number) => void;
  readonly containerRef?: React.RefObject<HTMLElement | null>;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly "aria-controls"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}


function clampRange(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const DragHandle = React.forwardRef<HTMLDivElement, M3EDragHandleProps>(
  function DragHandle(
    {
      orientation = "vertical",
      value: controlledValue,
      defaultValue = 50,
      min = 15,
      max = 85,
      step = 2,
      onValueChange,
      onDragDelta,
      containerRef,
      disabled = false,
      "aria-label": ariaLabel,
      "aria-controls": ariaControls,
      className,
      style,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onBlur,
      ...restProps
    },
    forwardedRef,
  ): React.JSX.Element {
    const { debugGeometry, direction, t } = useM3ERuntime();
    const isRtl = direction === "rtl";
    const resolvedAriaLabel = ariaLabel ?? t("dragHandle.ariaLabel");

    const [uncontrolledValue, setUncontrolledValue] = React.useState<number>(
      () => clampRange(defaultValue, min, max),
    );
    const currentValue = clampRange(
      controlledValue ?? uncontrolledValue,
      min,
      max,
    );

    const commitValue = React.useCallback(
      (rawNext: number) => {
        const clamped = Number(clampRange(rawNext, min, max).toFixed(2));
        if (controlledValue === undefined) {
          setUncontrolledValue(clamped);
        }
        onValueChange?.(clamped);
      },
      [controlledValue, min, max, onValueChange],
    );

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setMergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const [isDragging, setIsDragging] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);
    const dragSessionRef = React.useRef<{
      active: boolean;
      pointerId: number;
      startPos: number;
      lastPos: number;
      startValue: number;
      containerSpan: number;
    }>({
      active: false,
      pointerId: -1,
      startPos: 0,
      lastPos: 0,
      startValue: 50,
      containerSpan: 0,
    });

    const isActive = !disabled && (isPressed || isDragging);
    const targetGeo = resolveDragHandleGeometry({
      isActive,
      orientation,
    });
    const springInline = useM3EScalarSpring(
      targetGeo.inlineSize,
      "fastSpatial",
    );
    const springBlock = useM3EScalarSpring(targetGeo.blockSize, "fastSpatial");
    const springRadius = useM3EScalarSpring(
      targetGeo.cornerRadius,
      "fastSpatial",
    );

    const endDragSession = React.useCallback(
      (el: HTMLDivElement | null, pointerId?: number) => {
        dragSessionRef.current.active = false;
        if (
          el &&
          pointerId !== undefined &&
          pointerId >= 0 &&
          el.hasPointerCapture?.(pointerId)
        ) {
          try {
            el.releasePointerCapture(pointerId);
          } catch {
            // Ignore synthetic pointer capture release errors
          }
        }
        setIsPressed(false);
        setIsDragging(false);
      },
      [],
    );

    const isVertical = orientation === "vertical";

    return (
      <div
        {...restProps}
        ref={setMergedRef}
        role="separator"
        tabIndex={disabled ? -1 : 0}
        aria-orientation={orientation}
        aria-label={resolvedAriaLabel}
        aria-controls={ariaControls}
        aria-valuenow={Math.round(currentValue)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-disabled={disabled ? true : undefined}
        data-orientation={orientation}
        data-active={isActive ? "" : undefined}
        data-dragging={isDragging ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={
          className ? `m3e-drag-handle ${className}` : "m3e-drag-handle"
        }
        style={{
          ...(isVertical
            ? { inlineSize: `${DRAG_HANDLE_TOKENS.containerSize}px` }
            : { blockSize: `${DRAG_HANDLE_TOKENS.containerSize}px` }),
          ...style,
        }}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          if (disabled || e.button !== 0) return;
          const host =
            containerRef?.current ?? rootRef.current?.parentElement ?? null;
          const rect = host?.getBoundingClientRect();
          const span = isVertical
            ? (rect?.width ?? 0)
            : (rect?.height ?? 0);
          const pos = isVertical ? e.clientX : e.clientY;
          dragSessionRef.current = {
            active: true,
            pointerId: e.pointerId,
            startPos: pos,
            lastPos: pos,
            startValue: currentValue,
            containerSpan: span > 0 ? span : 400,
          };
          setIsPressed(true);
          try {
            e.currentTarget.setPointerCapture?.(e.pointerId);
          } catch {
            // Ignore synthetic pointer capture errors
          }
        }}
        onPointerMove={(e) => {
          onPointerMove?.(e);
          const session = dragSessionRef.current;
          if (
            disabled ||
            !session.active ||
            session.pointerId !== e.pointerId
          ) {
            return;
          }
          const pos = isVertical ? e.clientX : e.clientY;
          const stepDelta = pos - session.lastPos;
          const totalDelta = pos - session.startPos;
          if (!isDragging && Math.abs(totalDelta) >= 2) {
            setIsDragging(true);
          }
          session.lastPos = pos;

          const dirMultiplier = isVertical && isRtl ? -1 : 1;
          if (stepDelta !== 0) {
            onDragDelta?.(stepDelta * dirMultiplier);
          }
          const pctDelta =
            ((totalDelta * dirMultiplier) /
              Math.max(1, session.containerSpan)) *
            100;
          commitValue(session.startValue + pctDelta);
        }}
        onPointerUp={(e) => {
          onPointerUp?.(e);
          if (dragSessionRef.current.pointerId === e.pointerId) {
            endDragSession(e.currentTarget, e.pointerId);
          }
        }}
        onPointerCancel={(e) => {
          onPointerCancel?.(e);
          if (dragSessionRef.current.pointerId === e.pointerId) {
            endDragSession(e.currentTarget, e.pointerId);
          }
        }}
        onBlur={(e) => {
          onBlur?.(e);
          if (isPressed || isDragging) {
            endDragSession(rootRef.current, dragSessionRef.current.pointerId);
          }
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (disabled || e.defaultPrevented) return;
          const stepAmount = e.shiftKey ? step * 5 : step;
          const rtlSign = isRtl ? -1 : 1;

          if (isVertical) {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              commitValue(currentValue + stepAmount * rtlSign);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              commitValue(currentValue - stepAmount * rtlSign);
            }
          } else {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              commitValue(currentValue + stepAmount);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              commitValue(currentValue - stepAmount);
            }
          }

          if (e.key === "Home") {
            e.preventDefault();
            commitValue(min);
          } else if (e.key === "End") {
            e.preventDefault();
            commitValue(max);
          }
        }}
      >
        <span
          className="m3e-drag-handle__pill"
          aria-hidden="true"
          style={{
            inlineSize: `${Math.max(2, springInline).toFixed(2)}px`,
            blockSize: `${Math.max(2, springBlock).toFixed(2)}px`,
            borderRadius: `${Math.max(2, Math.min(9999, springRadius)).toFixed(1)}px`,
          }}
        />
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            {Math.round(springInline)}×{Math.round(springBlock)}
          </span>
        ) : null}
      </div>
    );
  },
);

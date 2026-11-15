"use client";

import * as React from "react";
import {
  CAROUSEL_TOKENS,
  type CarouselVariant,
  resolveCarouselItemFrame,
  resolveCarouselKeylineStrategy,
  resolveCarouselSnapOffset,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EContext.js";

export interface CarouselItemSpec {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly badge?: string;
  readonly background?: string;
  readonly content?: React.ReactNode;
}

export interface M3ECarouselProps {
  readonly items: readonly CarouselItemSpec[];
  readonly "aria-label"?: string;
  readonly variant?: CarouselVariant;
  readonly preferredItemWidth?: number;
  readonly gap?: number;
  readonly activeIndex?: number;
  readonly defaultActiveIndex?: number;
  readonly onActiveIndexChange?: (index: number) => void;
  readonly height?: number;
  readonly loop?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function ChevronSvg({
  direction,
  rtl,
}: {
  readonly direction: "prev" | "next";
  readonly rtl: boolean;
}) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={rtl ? { scale: "-1 1" } : undefined}
      aria-hidden="true"
    >
      {direction === "prev" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

const DRAG_DEADZONE_PX = 6;

function isInteractiveSlideDescendant(
  target: EventTarget | null,
  slideEl: HTMLElement,
): boolean {
  if (!(target instanceof Element)) return false;
  const interactive = target.closest(
    'button, a, input, select, textarea, [role="button"], [role="link"], [contenteditable="true"]',
  );
  return Boolean(
    interactive && interactive !== slideEl && slideEl.contains(interactive),
  );
}

function readNormalizedScrollLeft(el: HTMLElement, isRtl: boolean): number {
  return isRtl ? Math.abs(el.scrollLeft) : Math.max(0, el.scrollLeft);
}

function scrollTrackToOffset(
  el: HTMLElement,
  offset: number,
  isRtl: boolean,
  smooth: boolean,
): void {
  const targetLeft = isRtl ? -offset : offset;
  if (typeof el.scrollTo === "function") {
    try {
      el.scrollTo({
        left: targetLeft,
        behavior: smooth ? "smooth" : "instant",
      });
      if (!smooth) {
        el.scrollLeft = targetLeft;
      }
      return;
    } catch {
      // Fallback for synthetic DOM environments
    }
  }
  el.scrollLeft = targetLeft;
}

export function Carousel({
  items,
  "aria-label": ariaLabel,
  variant = "multi-browse",
  preferredItemWidth,
  gap = CAROUSEL_TOKENS.gap,
  activeIndex: controlledIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  height = 240,
  loop = true,
  className,
  style,
}: M3ECarouselProps): React.JSX.Element {
  const { debugGeometry, t, direction, prefersReducedMotion: reducedMotion } = useM3E();
  const isRtl = direction === "rtl";
  const rtlSign = isRtl ? -1 : 1;
  const resolvedAriaLabel = ariaLabel ?? t("carousel.listLabel");
  const count = items.length;

  const [uncontrolledIdx, setUncontrolledIdx] = React.useState<number>(() =>
    Math.max(0, Math.min(Math.max(0, count - 1), defaultActiveIndex)),
  );
  const currentIdx = Math.max(
    0,
    Math.min(Math.max(0, count - 1), controlledIndex ?? uncontrolledIdx),
  );

  const [announcement, setAnnouncement] = React.useState<string>("");
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(680);

  React.useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const syncWidth = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };
    syncWidth();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(syncWidth);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, []);

  const strategy = React.useMemo(
    () =>
      resolveCarouselKeylineStrategy({
        count,
        containerWidth,
        variant,
        preferredItemWidth,
        gap,
      }),
    [count, containerWidth, variant, preferredItemWidth, gap],
  );

  const maxScrollOffset = React.useMemo(() => {
    if (!strategy.isValid || count <= 1) return 0;
    return Math.max(
      0,
      count * strategy.itemMainAxisSize +
        (count - 1) * strategy.itemSpacing -
        strategy.availableSpace,
    );
  }, [strategy, count]);

  const [scrollOffset, setScrollOffset] = React.useState<number>(() =>
    resolveCarouselSnapOffset({
      strategy,
      index: currentIdx,
      count,
    }),
  );

  const pendingTargetRef = React.useRef<{
    index: number;
    offset: number;
  } | null>(null);
  const pendingTimerRef = React.useRef<number | null>(null);
  const settleTimerRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const clearPendingTarget = React.useCallback(() => {
    pendingTargetRef.current = null;
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (pendingTimerRef.current !== null) {
        window.clearTimeout(pendingTimerRef.current);
      }
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const findNearestSnapIndex = React.useCallback(
    (offset: number): number => {
      if (count <= 1) return 0;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < count; i++) {
        const snap = resolveCarouselSnapOffset({ strategy, index: i, count });
        const dist = Math.abs(snap - offset);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      return bestIdx;
    },
    [count, strategy],
  );

  const announceSlide = React.useCallback(
    (next: number) => {
      const targetItem = items[next];
      setAnnouncement(
        targetItem
          ? t("carousel.slideAnnouncementWithTitle", {
              index: next + 1,
              count,
              title: targetItem.title,
            })
          : t("carousel.slideAnnouncement", {
              index: next + 1,
              count,
            }),
      );
    },
    [items, count, t],
  );

  const selectIndex = React.useCallback(
    (nextRaw: number, options?: { readonly instant?: boolean }) => {
      if (count <= 0) return;
      const canWrap = loop && count >= 3;
      const next = canWrap
        ? ((nextRaw % count) + count) % count
        : Math.max(0, Math.min(count - 1, nextRaw));

      if (controlledIndex === undefined) {
        setUncontrolledIdx(next);
      }
      onActiveIndexChange?.(next);
      announceSlide(next);

      const targetOffset = resolveCarouselSnapOffset({
        strategy,
        index: next,
        count,
      });
      const el = trackRef.current;
      const useSmooth =
        !options?.instant &&
        !reducedMotion &&
        Boolean(el && el.clientWidth > 0);

      if (useSmooth && el) {
        pendingTargetRef.current = { index: next, offset: targetOffset };
        if (pendingTimerRef.current !== null) {
          window.clearTimeout(pendingTimerRef.current);
        }
        pendingTimerRef.current = window.setTimeout(() => {
          clearPendingTarget();
          setScrollOffset(targetOffset);
        }, 620);
        scrollTrackToOffset(el, targetOffset, isRtl, true);
      } else {
        clearPendingTarget();
        setScrollOffset(targetOffset);
        if (el) {
          scrollTrackToOffset(el, targetOffset, isRtl, false);
        }
      }
    },
    [
      count,
      loop,
      controlledIndex,
      onActiveIndexChange,
      announceSlide,
      strategy,
      reducedMotion,
      isRtl,
      clearPendingTarget,
    ],
  );

  const prevControlledRef = React.useRef<number | undefined>(controlledIndex);
  const prevLayoutKeyRef = React.useRef<string>("");

  React.useLayoutEffect(() => {
    const layoutKey = `${containerWidth}:${variant}:${count}:${isRtl}`;
    const controlledChanged =
      controlledIndex !== undefined &&
      controlledIndex !== prevControlledRef.current;
    const layoutChanged = layoutKey !== prevLayoutKeyRef.current;
    prevControlledRef.current = controlledIndex;
    prevLayoutKeyRef.current = layoutKey;

    if (!controlledChanged && !layoutChanged) return;

    const targetOffset = resolveCarouselSnapOffset({
      strategy,
      index: currentIdx,
      count,
    });
    const el = trackRef.current;
    if (layoutChanged) {
      clearPendingTarget();
      setScrollOffset(targetOffset);
      if (el) scrollTrackToOffset(el, targetOffset, isRtl, false);
    } else if (controlledChanged) {
      const useSmooth = !reducedMotion && Boolean(el && el.clientWidth > 0);
      if (useSmooth && el) {
        pendingTargetRef.current = { index: currentIdx, offset: targetOffset };
        scrollTrackToOffset(el, targetOffset, isRtl, true);
      } else {
        setScrollOffset(targetOffset);
        if (el) scrollTrackToOffset(el, targetOffset, isRtl, false);
      }
    }
  }, [
    controlledIndex,
    currentIdx,
    containerWidth,
    variant,
    count,
    isRtl,
    strategy,
    reducedMotion,
    clearPendingTarget,
  ]);

  const dragSessionRef = React.useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startScrollOffset: number;
    lastX: number;
    lastTime: number;
    velocityPxPerMs: number;
    dragging: boolean;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollOffset: 0,
    lastX: 0,
    lastTime: 0,
    velocityPxPerMs: 0,
    dragging: false,
  });
  const suppressClickRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const settleNativeScroll = React.useCallback(
    (finalOffset: number) => {
      if (dragSessionRef.current.dragging) return;
      if (pendingTargetRef.current !== null) {
        if (Math.abs(finalOffset - pendingTargetRef.current.offset) <= 2) {
          clearPendingTarget();
        }
        return;
      }
      const nearest = findNearestSnapIndex(finalOffset);
      const snapTarget = resolveCarouselSnapOffset({
        strategy,
        index: nearest,
        count,
      });
      if (nearest !== currentIdx) {
        if (controlledIndex === undefined) {
          setUncontrolledIdx(nearest);
        }
        onActiveIndexChange?.(nearest);
        announceSlide(nearest);
      }
      const el = trackRef.current;
      if (el && Math.abs(finalOffset - snapTarget) > 1.5) {
        scrollTrackToOffset(el, snapTarget, isRtl, !reducedMotion);
      }
    },
    [
      clearPendingTarget,
      findNearestSnapIndex,
      strategy,
      count,
      currentIdx,
      controlledIndex,
      onActiveIndexChange,
      announceSlide,
      isRtl,
      reducedMotion,
    ],
  );

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScrollEnd = () => {
      const nextOffset = readNormalizedScrollLeft(el, isRtl);
      setScrollOffset(nextOffset);
      if (pendingTargetRef.current !== null) {
        const target = pendingTargetRef.current.offset;
        clearPendingTarget();
        setScrollOffset(target);
        return;
      }
      settleNativeScroll(nextOffset);
    };
    el.addEventListener("scrollend", onScrollEnd);
    return () => el.removeEventListener("scrollend", onScrollEnd);
  }, [isRtl, clearPendingTarget, settleNativeScroll]);

  const handleTrackScroll = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const curr = readNormalizedScrollLeft(el, isRtl);
        setScrollOffset(curr);
      });
    }
    // Skip active-index recomputation while a click or key press has a pending target
    if (pendingTargetRef.current !== null) return;
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null;
      settleNativeScroll(readNormalizedScrollLeft(el, isRtl));
    }, 120);
  }, [isRtl, settleNativeScroll]);

  const finishDrag = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const session = dragSessionRef.current;
      if (!session.active || session.pointerId !== e.pointerId) return;
      session.active = false;

      if (session.dragging) {
        try {
          if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore synthetic pointer capture errors
        }
        setIsDragging(false);

        if (!cancelled && count > 1) {
          const dx = e.clientX - session.startX;
          const projectedOffset = Math.max(
            0,
            Math.min(
              maxScrollOffset,
              session.startScrollOffset -
                dx * rtlSign -
                session.velocityPxPerMs * rtlSign * 140,
            ),
          );
          let targetIdx = findNearestSnapIndex(projectedOffset);
          if (
            targetIdx === currentIdx &&
            Math.abs(session.velocityPxPerMs) >= 0.35
          ) {
            const flickDir = -Math.sign(session.velocityPxPerMs) * rtlSign;
            targetIdx = Math.max(0, Math.min(count - 1, currentIdx + flickDir));
          } else if (
            targetIdx === currentIdx &&
            Math.abs(dx) >= Math.max(48, strategy.itemMainAxisSize * 0.22)
          ) {
            const dragDir = -Math.sign(dx) * rtlSign;
            targetIdx = Math.max(0, Math.min(count - 1, currentIdx + dragDir));
          }
          selectIndex(targetIdx);
        }
      }
      session.dragging = false;
    },
    [
      count,
      maxScrollOffset,
      rtlSign,
      findNearestSnapIndex,
      currentIdx,
      strategy.itemMainAxisSize,
      selectIndex,
    ],
  );

  const canLoop = loop && count >= 3;
  const prevDisabled = !canLoop && currentIdx <= 0;
  const nextDisabled = !canLoop && currentIdx >= count - 1;

  return (
    <section
      aria-roledescription={t("carousel.roleDescription")}
      aria-label={resolvedAriaLabel}
      data-variant={variant}
      className={className ? `m3e-carousel ${className}` : "m3e-carousel"}
      style={style}
    >
      <div className="m3e-carousel__header-bar">
        <div className="m3e-carousel__controls">
          <button
            type="button"
            disabled={prevDisabled}
            aria-label={t("carousel.prevSlide")}
            className="m3e-carousel__nav-btn"
            onClick={() => selectIndex(currentIdx - 1)}
          >
            <ChevronSvg direction="prev" rtl={isRtl} />
          </button>
          <button
            type="button"
            disabled={nextDisabled}
            aria-label={t("carousel.nextSlide")}
            className="m3e-carousel__nav-btn"
            onClick={() => selectIndex(currentIdx + 1)}
          >
            <ChevronSvg direction="next" rtl={isRtl} />
          </button>
        </div>

        <nav
          className="m3e-carousel__markers"
          aria-label={t("carousel.paginationLabel")}
        >
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              aria-label={t("carousel.goToSlide", {
                index: idx + 1,
                title: item.title,
              })}
              aria-current={idx === currentIdx ? "true" : undefined}
              className="m3e-carousel__marker"
              onClick={() => selectIndex(idx)}
            />
          ))}
        </nav>
      </div>

      <div
        ref={trackRef}
        role="group"
        aria-label={t("carousel.listLabel")}
        className="m3e-carousel__track"
        data-dragging={isDragging ? "" : undefined}
        style={{
          gap: `${gap}px`,
          height: `${height}px`,
        }}
        onScroll={handleTrackScroll}
        onPointerDown={(e) => {
          if (e.pointerType === "touch" || e.button !== 0 || count <= 1) return;
          if (
            e.target instanceof Element &&
            e.target.closest(
              'input, select, textarea, [contenteditable="true"]',
            )
          ) {
            return;
          }
          clearPendingTarget();
          suppressClickRef.current = false;
          dragSessionRef.current = {
            active: true,
            pointerId: e.pointerId,
            startX: e.clientX,
            startScrollOffset: scrollOffset,
            lastX: e.clientX,
            lastTime: performance.now(),
            velocityPxPerMs: 0,
            dragging: false,
          };
        }}
        onPointerMove={(e) => {
          const session = dragSessionRef.current;
          if (!session.active || session.pointerId !== e.pointerId) return;
          const dx = e.clientX - session.startX;
          if (!session.dragging) {
            if (Math.abs(dx) < DRAG_DEADZONE_PX) return;
            session.dragging = true;
            suppressClickRef.current = true;
            setIsDragging(true);
            try {
              e.currentTarget.setPointerCapture?.(e.pointerId);
            } catch {
              // Ignore synthetic pointer capture errors
            }
          }
          const now = performance.now();
          const dt = Math.max(1, now - session.lastTime);
          session.velocityPxPerMs = (e.clientX - session.lastX) / dt;
          session.lastX = e.clientX;
          session.lastTime = now;

          const nextOffset = Math.max(
            0,
            Math.min(maxScrollOffset, session.startScrollOffset - dx * rtlSign),
          );
          setScrollOffset(nextOffset);
          scrollTrackToOffset(e.currentTarget, nextOffset, isRtl, false);
        }}
        onPointerUp={(e) => finishDrag(e, false)}
        onPointerCancel={(e) => finishDrag(e, true)}
        onKeyDown={(e) => {
          if (
            e.target !== e.currentTarget &&
            e.target instanceof Element &&
            e.target.closest(
              'input, select, textarea, [contenteditable="true"]',
            )
          ) {
            return;
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            selectIndex(currentIdx - rtlSign);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            selectIndex(currentIdx + rtlSign);
          } else if (e.key === "Home") {
            e.preventDefault();
            selectIndex(0);
          } else if (e.key === "End") {
            e.preventDefault();
            selectIndex(count - 1);
          }
        }}
      >
        {items.map((item, idx) => {
          const frame = resolveCarouselItemFrame({
            strategy,
            index: idx,
            count,
            scrollOffset,
          });
          const slotWidth = Math.max(40, frame.slotWidth || containerWidth);
          const maskWidth = Math.max(24, frame.maskWidth || slotWidth);
          const isFocal = idx === currentIdx || frame.isFocal;
          const captionOpacity = Math.max(
            0,
            Math.min(1, (frame.prominence - 0.35) / 0.55),
          );
          const translateX = rtlSign * frame.offsetDelta;

          return (
            <div
              key={item.id}
              role="presentation"
              className="m3e-carousel__slide-slot"
              style={{
                flex: `0 0 ${slotWidth.toFixed(2)}px`,
                inlineSize: `${slotWidth.toFixed(2)}px`,
              }}
            >
              <div
                role="group"
                aria-roledescription={t("carousel.slideRoleDescription")}
                aria-label={t("carousel.slideLabel", {
                  index: idx + 1,
                  count,
                  title: item.title,
                })}
                tabIndex={0}
                data-focal={idx === currentIdx ? "" : undefined}
                data-unmasked={isFocal ? "" : undefined}
                className="m3e-carousel__slide"
                onClick={(e) => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }
                  if (isInteractiveSlideDescendant(e.target, e.currentTarget)) {
                    return;
                  }
                  selectIndex(idx);
                }}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) {
                    return;
                  }
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectIndex(idx);
                  }
                }}
                style={{
                  width: `${maskWidth.toFixed(2)}px`,
                  borderRadius: `${frame.cornerRadius.toFixed(1)}px`,
                  background: item.background,
                  zIndex: frame.zIndex,
                  transform: `translate3d(${translateX.toFixed(2)}px, 0, 0)`,
                }}
              >
                <div
                  className="m3e-carousel__slide-inner"
                  style={{
                    inlineSize: `${slotWidth.toFixed(2)}px`,
                  }}
                >
                  {item.content ? (
                    <div className="m3e-carousel__media">{item.content}</div>
                  ) : null}
                  <div
                    className="m3e-carousel__scrim"
                    style={{ opacity: 0.35 + 0.65 * captionOpacity }}
                  />
                  <div
                    className="m3e-carousel__caption"
                    style={{
                      opacity: captionOpacity,
                      translate: `0px ${((1 - captionOpacity) * 8).toFixed(1)}px`,
                    }}
                  >
                    {item.badge ? (
                      <span className="m3e-carousel__badge">{item.badge}</span>
                    ) : null}
                    <div className="m3e-carousel__title">{item.title}</div>
                    {item.subtitle ? (
                      <div className="m3e-carousel__subtitle">
                        {item.subtitle}
                      </div>
                    ) : null}
                  </div>
                </div>
                {debugGeometry ? (
                  <span className="m3e-debug-badge" aria-hidden="true">
                    {Math.round(maskWidth)}/{Math.round(slotWidth)}px r:
                    {frame.cornerRadius.toFixed(0)}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="m3e-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

"use client";

import * as React from "react";
import {
  CAROUSEL_TOKENS,
  type CarouselVariant,
  resolveCarouselItemFrame,
  resolveCarouselKeylineStrategy,
  resolveCarouselSnapOffset,
} from "../../tokens/carousel.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";

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

function resolveSlideGeometry(
  strategy: Parameters<typeof resolveCarouselItemFrame>[0]["strategy"],
  index: number,
  count: number,
  scrollOffset: number,
  containerWidth: number,
  rtlSign: number,
) {
  const frame = resolveCarouselItemFrame({ strategy, index, count, scrollOffset });
  const slotWidth = Math.max(40, frame.slotWidth || containerWidth);
  return {
    slotWidth,
    maskWidth: Math.max(24, frame.maskWidth || slotWidth),
    isFocal: frame.isFocal,
    cornerRadius: frame.cornerRadius,
    zIndex: frame.zIndex,
    // Captions belong to large items only; they fade out before an item reaches medium size.
    captionOpacity: Math.max(0, Math.min(1, (frame.prominence - 0.75) / 0.25)),
    translateX: rtlSign * frame.offsetDelta,
  };
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
  const { debugGeometry, t, direction, prefersReducedMotion: reducedMotion } = useM3ERuntime();
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

  useIsoLayoutEffect(() => {
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
      const requested = canWrap
        ? ((nextRaw % count) + count) % count
        : Math.max(0, Math.min(count - 1, nextRaw));
      const next = controlledIndex ?? requested;

      if (requested !== currentIdx) onActiveIndexChange?.(requested);
      if (controlledIndex === undefined) {
        setUncontrolledIdx(requested);
        announceSlide(requested);
      }

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
      currentIdx,
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

  useIsoLayoutEffect(() => {
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
      announceSlide(currentIdx);
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
    announceSlide,
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
      const isControlled = controlledIndex !== undefined;
      const snapTarget = resolveCarouselSnapOffset({
        strategy,
        index: isControlled ? currentIdx : nearest,
        count,
      });
      if (nearest !== currentIdx) {
        if (!isControlled) {
          setUncontrolledIdx(nearest);
          announceSlide(nearest);
        }
        onActiveIndexChange?.(nearest);
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

  const paintFrames = React.useCallback(
    (track: HTMLElement, offset: number) => {
      const slots = track.children;
      for (let idx = 0; idx < slots.length && idx < count; idx++) {
        const slide = slots[idx]!.firstElementChild as HTMLElement | null;
        if (!slide) continue;
        const g = resolveSlideGeometry(strategy, idx, count, offset, containerWidth, rtlSign);
        const slot = slots[idx] as HTMLElement;
        slot.style.flex = `0 0 ${g.slotWidth.toFixed(2)}px`;
        slot.style.inlineSize = `${g.slotWidth.toFixed(2)}px`;
        slide.style.width = `${g.maskWidth.toFixed(2)}px`;
        slide.style.borderRadius = `${g.cornerRadius.toFixed(1)}px`;
        slide.style.zIndex = String(g.zIndex);
        slide.style.transform = `translate3d(${g.translateX.toFixed(2)}px, 0, 0)`;
        slide.toggleAttribute("data-unmasked", idx === currentIdx || g.isFocal);
        const inner = slide.firstElementChild as HTMLElement | null;
        if (inner) inner.style.inlineSize = `${g.slotWidth.toFixed(2)}px`;
        const caption = slide.querySelector<HTMLElement>(":scope > .m3e-carousel__caption");
        if (caption) {
          caption.style.opacity = String(g.captionOpacity);
          caption.style.translate = `0px ${((1 - g.captionOpacity) * 8).toFixed(1)}px`;
        }
      }
    },
    [strategy, count, containerWidth, rtlSign, currentIdx],
  );

  useIsoLayoutEffect(() => {
    if (trackRef.current) paintFrames(trackRef.current, scrollOffset);
  }, [scrollOffset, paintFrames]);

  const handleTrackScroll = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        paintFrames(el, readNormalizedScrollLeft(el, isRtl));
      });
    }
    // Skip active-index recomputation while a click or key press has a pending target
    if (pendingTargetRef.current !== null) return;
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null;
      const finalOffset = readNormalizedScrollLeft(el, isRtl);
      setScrollOffset(finalOffset);
      settleNativeScroll(finalOffset);
    }, 120);
  }, [isRtl, settleNativeScroll, paintFrames]);

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
  const canScroll = maxScrollOffset > 0.5;
  const snapOffsets = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        resolveCarouselSnapOffset({ strategy, index: i, count }),
      ),
    [strategy, count],
  );
  // Arrows advance to the next index whose snap position actually moves the track.
  const stepTarget = (dir: 1 | -1): number | null => {
    const from = snapOffsets[currentIdx] ?? 0;
    for (let i = currentIdx + dir; i >= 0 && i < count; i += dir) {
      if (Math.abs((snapOffsets[i] ?? 0) - from) > 0.5) return i;
    }
    return canLoop ? (dir > 0 ? 0 : count - 1) : null;
  };
  const prevTarget = stepTarget(-1);
  const nextTarget = stepTarget(1);

  return (
    <section
      aria-roledescription={t("carousel.roleDescription")}
      aria-label={resolvedAriaLabel}
      data-variant={variant}
      className={className ? `m3e-carousel ${className}` : "m3e-carousel"}
      style={style}
    >
      {canScroll ? (
        <div className="m3e-carousel__header-bar">
          <div className="m3e-carousel__controls">
            <button
              type="button"
              disabled={prevTarget === null}
              aria-label={t("carousel.prevSlide")}
              className="m3e-carousel__nav-btn"
              onClick={() => prevTarget !== null && selectIndex(prevTarget)}
            >
              <ChevronSvg direction="prev" rtl={isRtl} />
            </button>
            <button
              type="button"
              disabled={nextTarget === null}
              aria-label={t("carousel.nextSlide")}
              className="m3e-carousel__nav-btn"
              onClick={() => nextTarget !== null && selectIndex(nextTarget)}
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
      ) : null}

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
            startScrollOffset: readNormalizedScrollLeft(e.currentTarget, isRtl),
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
          const g = resolveSlideGeometry(strategy, idx, count, scrollOffset, containerWidth, rtlSign);
          const { slotWidth, maskWidth, captionOpacity, translateX } = g;
          const isFocal = idx === currentIdx || g.isFocal;

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
                  borderRadius: `${g.cornerRadius.toFixed(1)}px`,
                  background: item.background,
                  zIndex: g.zIndex,
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
                </div>
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
                {debugGeometry ? (
                  <span className="m3e-debug-badge" aria-hidden="true">
                    {Math.round(maskWidth)}/{Math.round(slotWidth)}px r:
                    {g.cornerRadius.toFixed(0)}
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

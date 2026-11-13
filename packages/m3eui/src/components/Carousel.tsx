import * as React from "react";
import {
  CAROUSEL_TOKENS,
  resolveCarouselLayout,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";

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
  readonly variant?: "multi-browse" | "hero";
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

export function Carousel({
  items,
  "aria-label": ariaLabel,
  variant = "multi-browse",
  activeIndex: controlledIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  height = 240,
  loop = true,
  className,
  style,
}: M3ECarouselProps): React.JSX.Element {
  const { debugGeometry, t, direction } = useM3E();
  const resolvedAriaLabel = ariaLabel ?? t("carousel.listLabel");
  const count = items.length;
  const [uncontrolledIdx, setUncontrolledIdx] = React.useState<number>(() =>
    Math.max(0, Math.min(count - 1, defaultActiveIndex)),
  );
  const currentIdx = Math.max(
    0,
    Math.min(count - 1, controlledIndex ?? uncontrolledIdx),
  );

  const [announcement, setAnnouncement] = React.useState<string>("");

  const selectIndex = React.useCallback(
    (nextRaw: number) => {
      if (count <= 0) return;
      let next = nextRaw;
      if (loop && count >= 3) {
        next = ((nextRaw % count) + count) % count;
      } else {
        next = Math.max(0, Math.min(count - 1, nextRaw));
      }
      if (controlledIndex === undefined) {
        setUncontrolledIdx(next);
      }
      onActiveIndexChange?.(next);
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
    [count, loop, controlledIndex, onActiveIndexChange, items, t],
  );

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

  const canLoop = loop && count >= 3;
  const rtlSign = direction === "rtl" ? -1 : 1;

  const dragSessionRef = React.useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    lastX: number;
    lastTime: number;
    velocityPxPerMs: number;
    dragging: boolean;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    lastX: 0,
    lastTime: 0,
    velocityPxPerMs: 0,
    dragging: false,
  });
  const suppressClickRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragDeltaSlides, setDragDeltaSlides] = React.useState(0);

  const slideStepPx = Math.max(80, containerWidth * 0.38);

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
        setDragDeltaSlides(0);

        if (!cancelled && count > 1) {
          const dx = e.clientX - session.startX;
          const dragSteps = (-dx * rtlSign) / slideStepPx;
          const flickStep =
            Math.abs(session.velocityPxPerMs) >= 0.35
              ? -Math.sign(session.velocityPxPerMs) * rtlSign
              : 0;
          let stepDelta = Math.round(dragSteps);
          if (stepDelta === 0) {
            if (Math.abs(dragSteps) >= 0.22) {
              stepDelta = dragSteps > 0 ? 1 : -1;
            } else if (flickStep !== 0) {
              stepDelta = flickStep;
            }
          }
          if (stepDelta !== 0) {
            selectIndex(currentIdx + stepDelta);
          }
        }
      }
      session.dragging = false;
    },
    [count, currentIdx, rtlSign, selectIndex, slideStepPx],
  );

  const springFocalPos = useM3EScalarSpring(currentIdx, "defaultSpatial");

  const effectiveFocalPos = React.useMemo(() => {
    if (!isDragging || dragDeltaSlides === 0) return springFocalPos;
    const raw = currentIdx + dragDeltaSlides;
    if (canLoop) {
      return ((raw % count) + count) % Math.max(1, count);
    }
    if (raw < 0) return raw * 0.25;
    if (raw > count - 1) return count - 1 + (raw - (count - 1)) * 0.25;
    return raw;
  }, [isDragging, dragDeltaSlides, springFocalPos, currentIdx, canLoop, count]);

  const metrics = resolveCarouselLayout({
    count,
    containerWidth,
    focalPosition: effectiveFocalPos,
    variant,
    gap: CAROUSEL_TOKENS.gap,
  });

  const prevDisabled = !canLoop && currentIdx <= 0;
  const nextDisabled = !canLoop && currentIdx >= count - 1;

  return (
    <section
      aria-roledescription={t("carousel.roleDescription")}
      aria-label={resolvedAriaLabel}
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
            <ChevronSvg direction="prev" rtl={direction === "rtl"} />
          </button>
          <button
            type="button"
            disabled={nextDisabled}
            aria-label={t("carousel.nextSlide")}
            className="m3e-carousel__nav-btn"
            onClick={() => selectIndex(currentIdx + 1)}
          >
            <ChevronSvg direction="next" rtl={direction === "rtl"} />
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
          gap: `${CAROUSEL_TOKENS.gap}px`,
          height: `${height}px`,
        }}
        onPointerDown={(e) => {
          if (e.button !== 0 || count <= 1) return;
          suppressClickRef.current = false;
          dragSessionRef.current = {
            active: true,
            pointerId: e.pointerId,
            startX: e.clientX,
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
          setDragDeltaSlides((-dx * rtlSign) / slideStepPx);
        }}
        onPointerUp={(e) => finishDrag(e, false)}
        onPointerCancel={(e) => finishDrag(e, true)}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName === "INPUT") {
            return;
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            selectIndex(currentIdx - rtlSign);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            selectIndex(currentIdx + rtlSign);
          }
        }}
      >
        {items.map((item, idx) => {
          const metric = metrics[idx] ?? {
            width: containerWidth / Math.max(1, count),
            cornerRadius: CAROUSEL_TOKENS.peekRadius,
            prominence: idx === currentIdx ? 1 : 0,
          };
          const isFocal = idx === currentIdx;
          const captionOpacity = Math.max(0, Math.min(1, (metric.prominence - 0.35) / 0.55));

          return (
            <div
              key={item.id}
              role="group"
              aria-roledescription={t("carousel.slideRoleDescription")}
              aria-label={t("carousel.slideLabel", {
                index: idx + 1,
                count,
                title: item.title,
              })}
              tabIndex={0}
              data-focal={isFocal ? "" : undefined}
              className="m3e-carousel__slide"
              onClick={() => {
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                  return;
                }
                selectIndex(idx);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectIndex(idx);
                }
              }}
              style={{
                width: `${Math.max(36, metric.width).toFixed(2)}px`,
                flexBasis: `${Math.max(36, metric.width).toFixed(2)}px`,
                borderRadius: `${metric.cornerRadius.toFixed(1)}px`,
                background: item.background,
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
                  <div className="m3e-carousel__subtitle">{item.subtitle}</div>
                ) : null}
              </div>
              {debugGeometry ? (
                <span className="m3e-debug-badge" aria-hidden="true">
                  {Math.round(metric.width)}px r:{metric.cornerRadius.toFixed(0)}
                </span>
              ) : null}
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

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
  /** Optional custom visual/gradient background or media node */
  readonly background?: string;
  readonly content?: React.ReactNode;
}

export interface M3ECarouselProps {
  readonly items: readonly CarouselItemSpec[];
  readonly "aria-label": string;
  readonly variant?: "multi-browse" | "hero";
  readonly activeIndex?: number;
  readonly defaultActiveIndex?: number;
  readonly onActiveIndexChange?: (index: number) => void;
  readonly height?: number;
  readonly loop?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function ChevronSvg({ direction }: { readonly direction: "prev" | "next" }) {
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

/**
 * M3E Horizontal Multi-Browse & Centered Hero Carousel (`Carousel.kt` 1.5.0).
 *
 * Combines AOSP's dynamic focal-width & corner morphing (`28px` focal -> `16px` peek,
 * zero-sum total row width conservation) with accessible HTML prev/next/marker controls
 * and polite settled status announcements (`modern-web-guidance` `carousel`).
 */
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
  const count = items.length;
  const [uncontrolledIdx, setUncontrolledIdx] = React.useState<number>(() =>
    Math.max(0, Math.min(count - 1, defaultActiveIndex)),
  );
  const currentIdx = Math.max(
    0,
    Math.min(count - 1, controlledIndex ?? uncontrolledIdx),
  );

  // Polite status region stays silent on initial mount and updates after user navigation settles
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
        t("carousel.slideAnnouncement", {
          index: next + 1,
          count,
          titleSuffix: targetItem ? `: ${targetItem.title}` : "",
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

  const springFocalPos = useM3EScalarSpring(currentIdx, "defaultSpatial");
  const metrics = resolveCarouselLayout({
    count,
    containerWidth,
    focalPosition: springFocalPos,
    variant,
    gap: CAROUSEL_TOKENS.gap,
  });

  const canLoop = loop && count >= 3;
  const prevDisabled = !canLoop && currentIdx <= 0;
  const nextDisabled = !canLoop && currentIdx >= count - 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
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
            <ChevronSvg direction="prev" />
          </button>
          <button
            type="button"
            disabled={nextDisabled}
            aria-label={t("carousel.nextSlide")}
            className="m3e-carousel__nav-btn"
            onClick={() => selectIndex(currentIdx + 1)}
          >
            <ChevronSvg direction="next" />
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
        style={{
          gap: `${CAROUSEL_TOKENS.gap}px`,
          height: `${height}px`,
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName === "INPUT") {
            return;
          }
          const delta = direction === "rtl" ? -1 : 1;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            selectIndex(currentIdx - delta);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            selectIndex(currentIdx + delta);
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
              aria-roledescription="slide"
              aria-label={`${idx + 1} / ${count}: ${item.title}`}
              tabIndex={0}
              data-focal={isFocal ? "" : undefined}
              className="m3e-carousel__slide"
              onClick={() => selectIndex(idx)}
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

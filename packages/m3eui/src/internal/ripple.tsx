"use client";

import * as React from "react";
import { useM3ERuntime } from "../context/M3EContext.js";
import { M3E_STATE_LAYER_TOKENS } from "../tokens/elevation.js";

const FADE_IN_MS = 75;
const ENTER_MS = 225;
const MIN_HOLD_MS = 150;
const FADE_OUT_MS = 150;
const REDUCED_MIN_HOLD_MS = 120;
const BOUNDED_EXTRA_RADIUS_PX = 10;
const SOLID_CORE_RATIO = 0.6;
const PRESS_WAVE_OPACITY = M3E_STATE_LAYER_TOKENS.pressOpacity;

export interface M3ERippleOptions {
  readonly unbounded?: boolean;
}

export interface M3EInteractionHandlers {
  readonly onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  readonly onPointerUp?: () => void;
  readonly onPointerLeave?: (e?: React.PointerEvent<HTMLElement>) => void;
  readonly onPointerCancel?: () => void;
  readonly onLostPointerCapture?: () => void;
  readonly onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  readonly onKeyUp?: (e: React.KeyboardEvent<HTMLElement>) => void;
  readonly onBlur?: () => void;
}

export function mergeInteractionHandlers(
  ...sets: readonly (M3EInteractionHandlers | undefined)[]
): M3EInteractionHandlers {
  const active = sets.filter(Boolean) as readonly M3EInteractionHandlers[];
  return {
    onPointerDown: (e) => {
      for (const s of active) s.onPointerDown?.(e);
    },
    onPointerUp: () => {
      for (const s of active) s.onPointerUp?.();
    },
    onPointerLeave: (e) => {
      for (const s of active) s.onPointerLeave?.(e);
    },
    onPointerCancel: () => {
      for (const s of active) s.onPointerCancel?.();
    },
    onLostPointerCapture: () => {
      for (const s of active) s.onLostPointerCapture?.();
    },
    onKeyDown: (e) => {
      for (const s of active) s.onKeyDown?.(e);
    },
    onKeyUp: (e) => {
      for (const s of active) s.onKeyUp?.(e);
    },
    onBlur: () => {
      for (const s of active) s.onBlur?.();
    },
  };
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function fastOutSlowIn(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let u = t;
  for (let i = 0; i < 6; i += 1) {
    const inv = 1 - u;
    const x = 1.2 * inv * inv * u + 0.6 * inv * u * u + u * u * u;
    const err = x - t;
    if (Math.abs(err) < 1e-5) break;
    const dx = 1.2 * inv * (1 - 3 * u) + 0.6 * u * (2 - 3 * u) + 3 * u * u;
    if (Math.abs(dx) < 1e-6) break;
    u = Math.max(0, Math.min(1, u - err / dx));
  }
  return u * u * (3 - 2 * u);
}

interface ActiveWave {
  readonly el: HTMLSpanElement;
  rafId: number | null;
  timerId: ReturnType<typeof setTimeout> | null;
  animations: Animation[];
}

function cancelWaveAnimations(entry: ActiveWave) {
  for (const anim of entry.animations) {
    anim.onfinish = null;
    anim.oncancel = null;
    try {
      anim.cancel();
    } catch {
      // ignore detached animation errors
    }
  }
}

export function useM3ERipple(
  disabled = false,
  options?: M3ERippleOptions,
) {
  const unbounded = Boolean(options?.unbounded);
  const { prefersReducedMotion, paused, motionRef } = useM3ERuntime();
  const rippleRef = React.useRef<HTMLSpanElement | null>(null);
  const activeWavesRef = React.useRef<Set<ActiveWave>>(new Set());
  const heldFinishRef = React.useRef<(() => void) | null>(null);

  const clearAllWaves = React.useCallback(() => {
    heldFinishRef.current = null;
    for (const entry of activeWavesRef.current) {
      if (entry.rafId !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(entry.rafId);
      }
      if (entry.timerId !== null) {
        clearTimeout(entry.timerId);
      }
      cancelWaveAnimations(entry);
      entry.el.remove();
    }
    activeWavesRef.current.clear();
  }, []);

  React.useEffect(() => {
    if (disabled) {
      clearAllWaves();
    }
  }, [disabled, clearAllWaves]);

  React.useEffect(() => clearAllWaves, [clearAllWaves]);

  const finishActive = React.useCallback(() => {
    const finish = heldFinishRef.current;
    heldFinishRef.current = null;
    finish?.();
  }, []);

  const spawnWave = React.useCallback(
    (clientX: number | null, clientY: number | null) => {
      if (disabled || typeof document === "undefined") return;
      const host = rippleRef.current;
      if (!host) return;

      heldFinishRef.current?.();
      heldFinishRef.current = null;

      const rect = host.getBoundingClientRect();
      const wave = document.createElement("span");
      wave.className = "m3e-ripple__wave";
      const entry: ActiveWave = {
        el: wave,
        rafId: null,
        timerId: null,
        animations: [],
      };
      activeWavesRef.current.add(entry);

      const canAnimateWaapi = typeof wave.animate === "function";

      if (
        prefersReducedMotion ||
        paused ||
        (rect.width <= 0 && rect.height <= 0) ||
        (!canAnimateWaapi && typeof requestAnimationFrame !== "function")
      ) {
        wave.dataset.staticWave = "";
        wave.style.inset = "0";
        wave.style.borderRadius = "inherit";
        wave.style.opacity = String(PRESS_WAVE_OPACITY);
        host.appendChild(wave);
        const pressedAt = nowMs();
        heldFinishRef.current = () => {
          const removeWave = () => {
            entry.timerId = null;
            wave.remove();
            activeWavesRef.current.delete(entry);
          };
          if (prefersReducedMotion && !paused && typeof setTimeout === "function") {
            const remaining = Math.max(0, REDUCED_MIN_HOLD_MS - (nowMs() - pressedAt));
            if (remaining > 0) {
              entry.timerId = setTimeout(removeWave, remaining);
              return;
            }
          }
          removeWave();
        };
        return;
      }

      const targetX = rect.width / 2;
      const targetY = rect.height / 2;
      const minDim = Math.min(rect.width, rect.height);
      const originX = unbounded
        ? targetX
        : clientX !== null
          ? Math.max(0, Math.min(rect.width, clientX - rect.left))
          : targetX;
      const originY = unbounded
        ? targetY
        : clientY !== null
          ? Math.max(0, Math.min(rect.height, clientY - rect.top))
          : targetY;
      const startRadius = unbounded
        ? minDim * 0.15
        : Math.min(minDim * 0.2, 12);
      const solidEndRadius = unbounded
        ? Math.max(rect.width, rect.height) / 2
        : Math.hypot(rect.width, rect.height) / 2 + BOUNDED_EXTRA_RADIUS_PX;
      const endRadius = unbounded
        ? solidEndRadius
        : solidEndRadius / SOLID_CORE_RATIO;
      if (unbounded) {
        wave.dataset.unboundedWave = "";
      }
      const diameter = endRadius * 2;
      const initScale = solidEndRadius > 0 ? startRadius / solidEndRadius : 1;
      const initTransform = `translate3d(${(originX - endRadius).toFixed(2)}px, ${(originY - endRadius).toFixed(2)}px, 0) scale(${initScale.toFixed(4)})`;
      const endTransform = `translate3d(${(targetX - endRadius).toFixed(2)}px, ${(targetY - endRadius).toFixed(2)}px, 0) scale(1.0000)`;

      wave.style.width = `${diameter.toFixed(2)}px`;
      wave.style.height = `${diameter.toFixed(2)}px`;
      wave.style.transform = initTransform;
      wave.style.opacity = "0";
      host.appendChild(wave);

      const rate = Math.max(0.1, motionRef.current.playbackRate);
      const startTime = nowMs();

      if (canAnimateWaapi) {
        const expandAnim = wave.animate(
          [{ transform: initTransform }, { transform: endTransform }],
          {
            duration: ENTER_MS,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
            fill: "forwards",
          },
        );
        expandAnim.playbackRate = rate;
        expandAnim.finished?.catch(() => {});

        const fadeInAnim = wave.animate(
          [{ opacity: 0 }, { opacity: PRESS_WAVE_OPACITY }],
          {
            duration: FADE_IN_MS,
            easing: "linear",
            fill: "forwards",
          },
        );
        fadeInAnim.playbackRate = rate;
        fadeInAnim.finished?.catch(() => {});
        entry.animations.push(expandAnim, fadeInAnim);

        let finishRequested = false;

        const removeWave = () => {
          if (entry.timerId !== null) {
            clearTimeout(entry.timerId);
            entry.timerId = null;
          }
          cancelWaveAnimations(entry);
          wave.remove();
          activeWavesRef.current.delete(entry);
        };

        const startFadeOut = () => {
          entry.timerId = null;
          if (!wave.isConnected) {
            removeWave();
            return;
          }
          const fadeInProgress = Math.min(
            1,
            Math.max(0, ((nowMs() - startTime) * rate) / FADE_IN_MS),
          );
          const startOpacity = +(fadeInProgress * PRESS_WAVE_OPACITY).toFixed(4);
          fadeInAnim.onfinish = null;
          fadeInAnim.oncancel = null;
          try {
            fadeInAnim.cancel();
          } catch {
            // ignore
          }
          const fadeOutAnim = wave.animate(
            [{ opacity: startOpacity }, { opacity: 0 }],
            {
              duration: FADE_OUT_MS,
              easing: "linear",
              fill: "forwards",
            },
          );
          fadeOutAnim.playbackRate = rate;
          fadeOutAnim.finished?.catch(() => {});
          entry.animations.push(fadeOutAnim);
          fadeOutAnim.onfinish = removeWave;
          fadeOutAnim.oncancel = removeWave;
          if (typeof setTimeout === "function") {
            entry.timerId = setTimeout(
              removeWave,
              Math.ceil(FADE_OUT_MS / rate) + 16,
            );
          }
        };

        heldFinishRef.current = () => {
          if (finishRequested) return;
          finishRequested = true;
          const remainingHold = Math.max(
            0,
            MIN_HOLD_MS / rate - (nowMs() - startTime),
          );
          if (remainingHold > 0 && typeof setTimeout === "function") {
            entry.timerId = setTimeout(startFadeOut, remainingHold);
            return;
          }
          startFadeOut();
        };
        return;
      }

      let finishRequested = false;
      let releaseTime = startTime;
      let fadeOutStartTime: number | null = null;

      const step = () => {
        const current = nowMs();
        const elapsed = Math.max(0, (current - startTime) * rate);
        const radiusProgress = Math.min(1, elapsed / ENTER_MS);
        const eased = fastOutSlowIn(radiusProgress);
        const rSolid = startRadius + (solidEndRadius - startRadius) * eased;
        const cx = originX + (targetX - originX) * eased;
        const cy = originY + (targetY - originY) * eased;
        const scale = solidEndRadius > 0 ? rSolid / solidEndRadius : 1;

        wave.style.transform = `translate3d(${(cx - endRadius).toFixed(2)}px, ${(cy - endRadius).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;

        const fadeIn = Math.min(1, elapsed / FADE_IN_MS);

        if (!finishRequested || elapsed < MIN_HOLD_MS) {
          if (!finishRequested && elapsed >= ENTER_MS) {
            wave.style.opacity = String(PRESS_WAVE_OPACITY);
            entry.rafId = null;
            return;
          }
          wave.style.opacity = String(+(fadeIn * PRESS_WAVE_OPACITY).toFixed(4));
          entry.rafId = requestAnimationFrame(step);
          return;
        }

        if (fadeOutStartTime === null) {
          fadeOutStartTime = Math.max(releaseTime, startTime + MIN_HOLD_MS / rate);
        }
        const fadeProgress = Math.min(
          1,
          Math.max(0, ((current - fadeOutStartTime) * rate) / FADE_OUT_MS),
        );
        if (fadeProgress >= 1) {
          entry.rafId = null;
          wave.remove();
          activeWavesRef.current.delete(entry);
          return;
        }

        wave.style.opacity = String(
          +(fadeIn * (1 - fadeProgress) * PRESS_WAVE_OPACITY).toFixed(4),
        );
        entry.rafId = requestAnimationFrame(step);
      };

      entry.rafId = requestAnimationFrame(step);

      heldFinishRef.current = () => {
        if (finishRequested) return;
        finishRequested = true;
        releaseTime = nowMs();
        if (entry.rafId === null && wave.isConnected) {
          fadeOutStartTime = releaseTime;
          entry.rafId = requestAnimationFrame(step);
        }
      };
    },
    [disabled, unbounded, prefersReducedMotion, paused, motionRef],
  );

  const rippleHandlers = React.useMemo(
    () => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (e.button === 0 && !(e.ctrlKey && e.pointerType === "mouse")) {
          spawnWave(e.clientX, e.clientY);
        }
      },
      onPointerUp: () => finishActive(),
      onPointerLeave: (e?: React.PointerEvent<HTMLElement>) => {
        if (e?.pointerType === "touch") return;
        finishActive();
      },
      onPointerCancel: () => finishActive(),
      onLostPointerCapture: () => finishActive(),
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.repeat) return;
        if (e.key === " " || e.key === "Enter") {
          spawnWave(null, null);
        }
      },
      onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === " " || e.key === "Enter") {
          finishActive();
        }
      },
      onBlur: () => finishActive(),
    }),
    [spawnWave, finishActive],
  );

  return { rippleRef, rippleHandlers };
}

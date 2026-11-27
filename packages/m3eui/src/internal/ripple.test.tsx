import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { setupDomTest } from "../__tests__/domHarness.js";
import { M3EProvider } from "../context/M3EProvider.js";
import { useM3ERipple } from "./ripple.js";

function RippleSurface({
  disabled = false,
  unbounded = false,
}: {
  readonly disabled?: boolean;
  readonly unbounded?: boolean;
}) {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled, { unbounded });
  return (
    <button type="button" data-testid="surface" {...rippleHandlers}>
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      Tap
    </button>
  );
}

describe("useM3ERipple WAAPI", () => {
  const dom = setupDomTest();

  it("animates expand, fade-in, hold, fade-out, and cleanup via Element.animate", () => {
    vi.useFakeTimers();

    interface FakeAnimRecord {
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null;
      options: KeyframeAnimationOptions | number | undefined;
      anim: {
        playbackRate: number;
        cancel: ReturnType<typeof vi.fn>;
        onfinish: ((ev?: unknown) => void) | null;
        oncancel: ((ev?: unknown) => void) | null;
      };
    }

    const calls: FakeAnimRecord[] = [];
    const originalAnimate = HTMLElement.prototype.animate;

    HTMLElement.prototype.animate = function mockAnimate(
      keyframes,
      options,
    ) {
      const anim = {
        playbackRate: 1,
        cancel: vi.fn(),
        onfinish: null as ((ev?: unknown) => void) | null,
        oncancel: null as ((ev?: unknown) => void) | null,
      };
      calls.push({
        keyframes,
        options: options as KeyframeAnimationOptions | number | undefined,
        anim,
      });
      return anim as unknown as Animation;
    };

    try {
      act(() => {
        dom.root.render(
          <M3EProvider initialPlaybackRate={0.5} syncDocumentRoot={false}>
            <RippleSurface />
          </M3EProvider>,
        );
      });

      const button = dom.container.querySelector<HTMLButtonElement>('[data-testid="surface"]')!;
      const host = button.querySelector<HTMLSpanElement>(".m3e-ripple")!;
      vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
        width: 200,
        height: 56,
        left: 0,
        top: 0,
        right: 200,
        bottom: 56,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      act(() => {
        button.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            button: 0,
            clientX: 40,
            clientY: 28,
          }),
        );
      });

      const wave = host.querySelector<HTMLSpanElement>(".m3e-ripple__wave");
      expect(wave).not.toBeNull();
      expect(calls).toHaveLength(2);
      expect(calls[0]!.options).toMatchObject({
        duration: 225,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
        fill: "forwards",
      });
      expect(calls[0]!.anim.playbackRate).toBe(0.5);
      expect(calls[1]!.options).toMatchObject({
        duration: 75,
        easing: "linear",
        fill: "forwards",
      });
      expect(calls[1]!.anim.playbackRate).toBe(0.5);

      // Early pointerup must wait until MIN_HOLD_MS / playbackRate (150 / 0.5 = 300ms)
      act(() => {
        vi.advanceTimersByTime(100);
        button.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      });
      expect(calls).toHaveLength(2);

      act(() => {
        vi.advanceTimersByTime(210);
      });
      expect(calls[1]!.anim.cancel).toHaveBeenCalledTimes(1);
      expect(calls).toHaveLength(3);
      expect(calls[2]!.options).toMatchObject({
        duration: 150,
        easing: "linear",
        fill: "forwards",
      });

      act(() => {
        calls[2]!.anim.onfinish?.();
      });
      expect(host.querySelector(".m3e-ripple__wave")).toBeNull();

      // Unmounting while active cancels active animations cleanly
      act(() => {
        button.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            button: 0,
            clientX: 60,
            clientY: 28,
          }),
        );
      });
      expect(host.querySelector(".m3e-ripple__wave")).not.toBeNull();
      expect(calls).toHaveLength(5);

      act(() => {
        dom.root.render(<span />);
      });
      expect(calls[3]!.anim.cancel).toHaveBeenCalledTimes(1);
      expect(calls[4]!.anim.cancel).toHaveBeenCalledTimes(1);
    } finally {
      HTMLElement.prototype.animate = originalAnimate;
    }
  });
});

import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { arSAMessages, zhCNMessages } from "../../i18n/index.js";
import { Carousel } from "./Carousel.js";

describe("Carousel", () => {
  const dom = setupDomTest();

  it("reverses ArrowLeft/ArrowRight navigation in RTL and localizes slide announcements & chevron mirroring", () => {
    const slides = Array.from({ length: 8 }, (_, i) => ({
      id: `s${i + 1}`,
      title: `Slide ${i + 1}`,
    }));
    let activeIdx = 0;

    act(() => {
      dom.root.render(
        <div>
          <div data-testid="ar-scope">
            <PausedWrapper locale="ar-SA" direction="rtl">
              <Carousel
                items={slides}
                defaultActiveIndex={0}
                onActiveIndexChange={(idx) => {
                  activeIdx = idx;
                }}
              />
            </PausedWrapper>
          </div>
          <div data-testid="zh-scope">
            <PausedWrapper locale="zh-CN" direction="ltr">
              <Carousel
                items={[
                  { id: "1", title: "第一张" },
                  { id: "2", title: "第二张" },
                ]}
              />
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    const arScope = dom.container.querySelector<HTMLElement>('[data-testid="ar-scope"]')!;
    const zhScope = dom.container.querySelector<HTMLElement>('[data-testid="zh-scope"]')!;
    expect(
      arScope.querySelector(".m3e-carousel")?.getAttribute("aria-roledescription"),
    ).toBe(arSAMessages["carousel.roleDescription"]);
    expect(
      zhScope.querySelector(".m3e-carousel")?.getAttribute("aria-roledescription"),
    ).toBe(zhCNMessages["carousel.roleDescription"]);
    expect(
      zhScope
        .querySelector(".m3e-carousel__slide")
        ?.getAttribute("aria-roledescription"),
    ).toBe(zhCNMessages["carousel.slideRoleDescription"]);
    const arChevronSvg = arScope.querySelector<SVGSVGElement>(".m3e-carousel__nav-btn svg");
    expect(arChevronSvg?.style.scale).toBe("-1 1");

    const track = arScope.querySelector<HTMLElement>(".m3e-carousel__track")!;
    act(() => {
      track.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
    });
    expect(activeIdx).toBe(1);
  });

  it("advances Carousel focal slide via horizontal pointer drag scrubbing", () => {
    let focalIndex = 0;
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Carousel
            defaultActiveIndex={0}
            onActiveIndexChange={(idx) => {
              focalIndex = idx;
            }}
            items={[
              { id: "1", title: "Slide One" },
              { id: "2", title: "Slide Two" },
              { id: "3", title: "Slide Three" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const track = dom.container.querySelector<HTMLElement>(".m3e-carousel__track")!;
    act(() => {
      track.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerId: 1,
          clientX: 280,
          clientY: 100,
        }),
      );
      track.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          pointerId: 1,
          clientX: 120,
          clientY: 102,
        }),
      );
      track.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerId: 1,
          clientX: 120,
          clientY: 102,
        }),
      );
    });

    expect(focalIndex).toBe(1);
  });

  it("fires interactive slide CTA without slide hijacking and handles 50-item centered-hero End/Home and uncontained variants", () => {
    const onSlideAction = vi.fn();
    let carouselIdx = 0;
    const fiftyItems = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      title: `Slide ${i + 1}`,
    }));

    act(() => {
      dom.root.render(
        <M3EProvider>
          <Carousel
            items={[
              {
                id: "s1",
                title: "Slide 1",
                content: (
                  <button type="button" id="slide-cta" onClick={onSlideAction}>
                    Open slide CTA
                  </button>
                ),
              },
              { id: "s2", title: "Slide 2" },
            ]}
          />
          <Carousel
            items={fiftyItems}
            variant="centered-hero"
            activeIndex={carouselIdx}
            onActiveIndexChange={(next) => {
              carouselIdx = next;
            }}
          />
          <Carousel
            items={fiftyItems.slice(0, 8)}
            variant="uncontained"
            preferredItemWidth={180}
          />
        </M3EProvider>,
      );
    });

    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#slide-cta")!.click();
    });
    expect(onSlideAction).toHaveBeenCalledTimes(1);

    const cHero = dom.container.querySelector<HTMLElement>(
      '.m3e-carousel[data-variant="centered-hero"]',
    )!;
    const cHeroTrack = cHero.querySelector<HTMLElement>(".m3e-carousel__track")!;
    expect(cHero.querySelectorAll(".m3e-carousel__slide").length).toBe(50);
    act(() => {
      cHeroTrack.dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true }),
      );
    });
    expect(carouselIdx).toBe(49);
    act(() => {
      cHeroTrack.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
    });
    expect(carouselIdx).toBe(49);

    expect(
      dom.container.querySelector('.m3e-carousel[data-variant="uncontained"]'),
    ).not.toBeNull();
  });
});

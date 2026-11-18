import * as React from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Card } from "./Card.js";

describe("Card", () => {
  const dom = setupDomTest();

  it("forwards ref to the article element", () => {
    const cardRef = React.createRef<HTMLElement>();
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Card ref={cardRef}>Card content</Card>
        </PausedWrapper>,
      );
    });
    expect(cardRef.current?.tagName.toLowerCase()).toBe("article");
  });

  it("renders compound interactive Card without nested buttons and isolates inner action clicks", () => {
    const onCardAction = vi.fn();
    const onCardMain = vi.fn();

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Card
            id="compound-card"
            interactive
            onClick={onCardMain}
            title="Release 1.0"
            actions={
              <button type="button" id="card-inner-btn" onClick={onCardAction}>
                Approve
              </button>
            }
          >
            Release summary
          </Card>
        </M3EProvider>,
      );
    });

    expect(dom.container.querySelectorAll("button button").length).toBe(0);
    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#card-inner-btn")!.click();
    });
    expect(onCardAction).toHaveBeenCalledTimes(1);
    expect(onCardMain).not.toHaveBeenCalled();
  });

  it("renders href cards as native links without role='button' while non-link interactive cards keep role='button'", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Card id="card-link" href="/docs">
            Docs link
          </Card>
          <Card
            id="card-compound-link"
            href="/releases"
            title="Release Notes"
            actions={<button type="button">Star</button>}
          >
            Details
          </Card>
          <Card id="card-action" onClick={() => {}}>
            Action card
          </Card>
        </M3EProvider>,
      );
    });

    const linkCard = dom.container.querySelector<HTMLAnchorElement>("a#card-link");
    expect(linkCard?.getAttribute("href")).toBe("/docs");
    expect(linkCard?.getAttribute("role")).toBeNull();

    const overlayLink = dom.container.querySelector<HTMLAnchorElement>(
      "#card-compound-link a.m3e-card__overlay-action",
    );
    expect(overlayLink?.getAttribute("href")).toBe("/releases");
    expect(overlayLink?.getAttribute("role")).toBeNull();

    const actionCard = dom.container.querySelector<HTMLElement>("#card-action");
    expect(actionCard?.getAttribute("role")).toBe("button");
  });
});

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
});

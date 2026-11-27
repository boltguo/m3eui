import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { formatLocalizedInteger, formatM3EMessage, arSAMessages } from "../../i18n/index.js";
import { Badge } from "./Badge.js";

describe("Badge", () => {
  const dom = setupDomTest();

  it("truncates counts past max and formats localized numerals", () => {
    const badgeRef = React.createRef<HTMLSpanElement>();
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="en">
            <PausedWrapper locale="en-US">
              <Badge ref={badgeRef} count={128} max={99}>
                <span>Inbox</span>
              </Badge>
            </PausedWrapper>
          </div>
          <div data-testid="ar">
            <PausedWrapper locale="ar-SA" direction="rtl">
              <Badge count={120} max={99}>
                <span>Inbox</span>
              </Badge>
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    expect(badgeRef.current).toBe(
      dom.container.querySelector('[data-testid="en"] .m3e-badge-anchor'),
    );
    expect(dom.container.querySelector('[data-testid="en"] .m3e-badge')?.textContent).toBe("99+");
    const expectedOverflow = formatM3EMessage(arSAMessages["badge.overflow"], {
      max: formatLocalizedInteger("ar-SA", 99),
    });
    expect(dom.container.querySelector('[data-testid="ar"] .m3e-badge')?.textContent).toBe(
      expectedOverflow,
    );
  });
});

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Kbd } from "./Kbd.js";

describe("Kbd", () => {
  const dom = setupDomTest();

  it("formats platform modifier keys for macOS and Linux", async () => {
    const platformSpy = vi
      .spyOn(navigator, "platform", "get")
      .mockReturnValue("MacIntel");

    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Kbd keys={["mod", "shift", "p"]} />
        </PausedWrapper>,
      );
    });

    expect(dom.container.querySelector("kbd.m3e-kbd")?.textContent).toBe("⌘⇧P");

    platformSpy.mockReturnValue("Linux x86_64");
    const linuxHost = document.createElement("div");
    document.body.appendChild(linuxHost);
    const linuxRoot = createRoot(linuxHost);
    await act(async () => {
      linuxRoot.render(<Kbd keys={["mod", "shift", "p"]} />);
    });
    expect(linuxHost.querySelector("kbd.m3e-kbd")?.textContent).toBe("Ctrl⇧P");
    act(() => linuxRoot.unmount());
    linuxHost.remove();
  });
});

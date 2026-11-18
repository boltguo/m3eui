import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, vi } from "vitest";
import { useM3E } from "../context/M3EContext.js";
import { M3EProvider } from "../context/M3EProvider.js";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

export function setupDomTest() {
  let container!: HTMLDivElement;
  let root!: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.documentElement.removeAttribute("lang");
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("data-color-mode");
    document.documentElement.style.colorScheme = "";
    window.localStorage?.removeItem?.("m3e-color-scheme");
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  return {
    get container() {
      return container;
    },
    get root() {
      return root;
    },
  };
}

function PauseMount({ children }: { readonly children: React.ReactNode }) {
  const { setPaused } = useM3E();
  React.useLayoutEffect(() => {
    setPaused(true);
  }, [setPaused]);
  return <>{children}</>;
}

export function PausedWrapper({
  children,
  direction = "ltr",
  locale = "zh-CN",
}: {
  readonly children: React.ReactNode;
  readonly direction?: "ltr" | "rtl" | "auto";
  readonly locale?: string;
}) {
  return (
    <M3EProvider
      syncDocumentRoot={false}
      locale={locale}
      initialDirection={direction}
    >
      <PauseMount>{children}</PauseMount>
    </M3EProvider>
  );
}

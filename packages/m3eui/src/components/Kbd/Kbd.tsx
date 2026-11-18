"use client";

import * as React from "react";
import { KBD_SNIPPET_TOKENS } from "../../tokens/topology.js";

export type KbdKeyAlias =
  | "mod"
  | "cmd"
  | "command"
  | "meta"
  | "shift"
  | "alt"
  | "option"
  | "ctrl"
  | "control"
  | "enter"
  | "escape"
  | "esc"
  | "backspace"
  | "tab"
  | "up"
  | "down"
  | "left"
  | "right"
  | (string & {});

const KEY_GLYPH_MAP: Record<string, string> = {
  cmd: "⌘",
  command: "⌘",
  meta: "⌘",
  shift: "⇧",
  alt: "⌥",
  option: "⌥",
  ctrl: "Ctrl",
  control: "Ctrl",
  enter: "↵",
  escape: "Esc",
  esc: "Esc",
  backspace: "⌫",
  tab: "⇥",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

const APPLE_PLATFORM_RE = /Mac|iPhone|iPad|iPod|Darwin/i;

export interface M3EKbdProps {
  readonly keys?: readonly KbdKeyAlias[];
  readonly children?: React.ReactNode;
  readonly size?: "sm" | "md";
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Kbd({
  keys,
  children,
  size = "md",
  className,
  style,
}: M3EKbdProps): React.JSX.Element {
  const [isApplePlatform, setIsApplePlatform] = React.useState(false);

  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    const platformHint = navigator.platform || navigator.userAgent || "";
    setIsApplePlatform(APPLE_PLATFORM_RE.test(platformHint));
  }, []);

  return (
    <kbd
      className={className ? `m3e-kbd ${className}` : "m3e-kbd"}
      data-size={size}
      style={{
        borderRadius: `${KBD_SNIPPET_TOKENS.kbdRadius}px`,
        minHeight:
          size === "sm" ? "19px" : `${KBD_SNIPPET_TOKENS.kbdHeight}px`,
        ...style,
      }}
    >
      {keys && keys.length > 0
        ? keys.map((k, idx) => {
            const lower = k.toLowerCase();
            const glyph =
              lower === "mod"
                ? isApplePlatform
                  ? "⌘"
                  : "Ctrl"
                : KEY_GLYPH_MAP[lower] ??
                  (k.length === 1 ? k.toUpperCase() : k);
            return (
              <span key={`${k}-${idx}`} className="m3e-kbd__key">
                {glyph}
              </span>
            );
          })
        : children}
    </kbd>
  );
}

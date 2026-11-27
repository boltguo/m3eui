"use client";

import * as React from "react";
import {
  KBD_SNIPPET_TOKENS,
} from "../../tokens/topology.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { useM3EScalarSpringEffect, usePressHoldState } from "../../hooks/useM3ESpring.js";
import { CheckIcon } from "../../internal/icons.js";
import { mergeInteractionHandlers, useM3ERipple } from "../../internal/ripple.js";

export interface M3ECopyButtonProps {
  readonly value: string;
  readonly timeout?: number;
  readonly onCopy?: (value: string) => unknown;
  readonly onCopyError?: (error: unknown) => void;
  readonly label?: string;
  readonly copiedLabel?: string;
  readonly errorLabel?: string;
  readonly variant?: "ghost" | "tonal" | "outlined";
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function CopyClipboardSvg() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CopyErrorSvg() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function CopyButton({
  value,
  timeout = 1800,
  onCopy,
  onCopyError,
  label,
  copiedLabel,
  errorLabel,
  variant = "ghost",
  disabled = false,
  className,
  style,
}: M3ECopyButtonProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const [status, setStatus] = React.useState<"idle" | "copied" | "error">("idle");
  const copied = status === "copied";
  const failed = status === "error";
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  const mergedHandlers = mergeInteractionHandlers(
    pressHandlers,
    rippleHandlers,
  );

  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const restRadius = KBD_SNIPPET_TOKENS.copyButtonSize / 2;
  const [initRadius] = React.useState(restRadius);
  useM3EScalarSpringEffect(
    isPressed ? 8 : copied || failed ? 10 : restRadius,
    "fastSpatial",
    (next) => {
      if (btnRef.current) {
        btnRef.current.style.borderRadius = `${next.toFixed(1)}px`;
      }
    },
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (disabled) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(value);
      await Promise.resolve(onCopy?.(value));
      setStatus("copied");
    } catch (err) {
      setStatus("error");
      onCopyError?.(err);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), timeout);
  };

  const resolvedCopyText = label ?? t("copyButton.copy");
  const resolvedCopiedText = copiedLabel ?? t("copyButton.copied");
  const resolvedErrorText = errorLabel ?? t("copyButton.error");
  const activeAriaLabel = copied
    ? resolvedCopiedText
    : failed
      ? resolvedErrorText
      : resolvedCopyText;

  return (
    <button
      ref={btnRef}
      type="button"
      disabled={disabled}
      aria-label={activeAriaLabel}
      onClick={() => void handleCopy()}
      className={className ? `m3e-copy-button ${className}` : "m3e-copy-button"}
      data-variant={variant}
      data-copied={copied ? "" : undefined}
      data-error={failed ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${KBD_SNIPPET_TOKENS.copyButtonSize}px`,
        height: `${KBD_SNIPPET_TOKENS.copyButtonSize}px`,
        borderRadius: `${initRadius.toFixed(1)}px`,
        ...style,
      }}
      {...mergedHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {copied ? (
        <CheckIcon size={16} strokeWidth={2.5} />
      ) : failed ? (
        <CopyErrorSvg />
      ) : (
        <CopyClipboardSvg />
      )}
      <span role="status" aria-live="polite" className="m3e-sr-only">
        {copied ? resolvedCopiedText : failed ? resolvedErrorText : ""}
      </span>
    </button>
  );
}

export interface M3ESnippetProps {
  readonly code: string | readonly string[];
  readonly symbol?: React.ReactNode | false;
  readonly variant?: "filled" | "outlined";
  readonly hideCopyButton?: boolean;
  readonly onCopy?: (value: string) => unknown;
  readonly onCopyError?: (error: unknown) => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Snippet({
  code,
  symbol = "$",
  variant = "filled",
  hideCopyButton = false,
  onCopy,
  onCopyError,
  className,
  style,
}: M3ESnippetProps): React.JSX.Element {
  const lines = Array.isArray(code) ? code : [code];
  const rawCopyValue = lines.join("\n");

  return (
    <div
      className={className ? `m3e-snippet ${className}` : "m3e-snippet"}
      data-variant={variant}
      style={{
        minHeight: `${KBD_SNIPPET_TOKENS.snippetMinHeight}px`,
        borderRadius: `${KBD_SNIPPET_TOKENS.snippetRadius}px`,
        ...style,
      }}
    >
      <pre className="m3e-snippet__pre">
        {lines.map((line, idx) => (
          <code key={idx} className="m3e-snippet__line">
            {symbol !== false ? (
              <span className="m3e-snippet__symbol" aria-hidden="true">
                {symbol}
              </span>
            ) : null}
            <span>{line}</span>
          </code>
        ))}
      </pre>

      {!hideCopyButton ? (
        <CopyButton
          value={rawCopyValue}
          onCopy={onCopy}
          onCopyError={onCopyError}
          className="m3e-snippet__copy"
        />
      ) : null}
    </div>
  );
}

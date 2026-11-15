import * as React from "react";
import type { ThemedToken } from "shiki/core";
import { Chip, CopyButton, useM3EToast } from "m3eui";
import { usePlaygroundStrings } from "../i18n";
import { CodeBracketsIcon, TerminalIcon } from "./Icons";
import type { SupportedCodeLang } from "./shikiEngine";

let loadedEngineModule: typeof import("./shikiEngine") | null = null;

export interface CodeBlockProps {
  readonly code: string;
  readonly lang?: SupportedCodeLang;
  readonly title?: string;
  readonly maxHeight?: number | string;
  readonly showLineNumbers?: boolean;
  readonly showHeader?: boolean;
  readonly showCopyButton?: boolean;
  readonly copyLabel?: string;
  readonly compact?: boolean;
  readonly embedded?: boolean;
}

export function CodeBlock({
  code,
  lang = "tsx",
  title,
  maxHeight,
  showLineNumbers,
  showHeader = false,
  showCopyButton = false,
  copyLabel,
  compact = false,
  embedded = false,
}: CodeBlockProps) {
  const ui = usePlaygroundStrings();
  const { toast } = useM3EToast();
  const trimmed = React.useMemo(() => code.trim(), [code]);
  const rawLines = React.useMemo(() => trimmed.split("\n"), [trimmed]);
  const displayLineNumbers =
    showLineNumbers ?? (!compact && rawLines.length > 1);

  const [tokens, setTokens] = React.useState<
    readonly (readonly ThemedToken[])[] | null
  >(() =>
    loadedEngineModule ? loadedEngineModule.getCachedTokens(trimmed, lang) : null,
  );

  React.useEffect(() => {
    let cancelled = false;

    if (loadedEngineModule) {
      const syncTokens = loadedEngineModule.getCachedTokens(trimmed, lang);
      if (syncTokens) {
        setTokens(syncTokens);
        return;
      }
    }

    void import("./shikiEngine")
      .then(async (mod) => {
        loadedEngineModule = mod;
        await mod.ensureShikiHighlighter();
        if (cancelled) return;
        setTokens(mod.getCachedTokens(trimmed, lang));
      })
      .catch(() => {
        // Fallback to plain text if dynamic chunk fails
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed, lang]);

  const accessibleCopyName = `${ui.cardCopy} ${copyLabel ?? title ?? lang.toUpperCase()}`;

  const preElement = (
    <pre
      className={
        compact
          ? "m3e-shiki-pre m3e-shiki-pre--compact"
          : "m3e-shiki-pre"
      }
      dir="ltr"
    >
      <code className="m3e-shiki-code">
        {tokens
          ? tokens.map((line, lineIdx) => (
              <span key={lineIdx} className="m3e-shiki-line">
                {displayLineNumbers && (
                  <span className="m3e-shiki-ln" aria-hidden="true">
                    {lineIdx + 1}
                  </span>
                )}
                <span className="m3e-shiki-line-content">
                  {line.length === 0 ? (
                    lineIdx < tokens.length - 1 ? "\n" : ""
                  ) : (
                    <>
                      {line.map((tok, tokIdx) => (
                        <span
                          key={tokIdx}
                          className="m3e-code-token"
                          style={tok.htmlStyle as React.CSSProperties | undefined}
                        >
                          {tok.content}
                        </span>
                      ))}
                      {lineIdx < tokens.length - 1 ? "\n" : null}
                    </>
                  )}
                </span>
              </span>
            ))
          : rawLines.map((lineText, lineIdx) => (
              <span key={lineIdx} className="m3e-shiki-line">
                {displayLineNumbers && (
                  <span className="m3e-shiki-ln" aria-hidden="true">
                    {lineIdx + 1}
                  </span>
                )}
                <span className="m3e-shiki-line-content">
                  {lineText}
                  {lineIdx < rawLines.length - 1 ? "\n" : null}
                </span>
              </span>
            ))}
      </code>
    </pre>
  );

  if (compact) {
    return preElement;
  }

  const showLangBadge = Boolean(
    title && title.trim().toLowerCase() !== lang.toLowerCase(),
  );

  return (
    <div
      className="m3e-code-surface"
      data-embedded={embedded ? "" : undefined}
    >
      {showHeader && (
        <div className="m3e-code-surface__header">
          <div className="m3e-code-surface__title-group">
            <span className="m3e-code-surface__icon" aria-hidden="true">
              {lang === "bash" ? (
                <TerminalIcon size={13.5} />
              ) : (
                <CodeBracketsIcon size={13.5} />
              )}
            </span>
            <span className="m3e-code-surface__lang">
              {title ?? lang.toUpperCase()}
            </span>
          </div>

          <div className="m3e-code-surface__actions">
            {showLangBadge && (
              <Chip size="sm" tone="neutral" variant="tonal">
                {lang.toUpperCase()}
              </Chip>
            )}
            {showCopyButton && (
              <CopyButton
                value={trimmed}
                variant="outlined"
                label={accessibleCopyName}
                copiedLabel={ui.cardCopied}
                onCopy={() =>
                  toast({
                    title: ui.cardCopiedCodeToast(
                      copyLabel ?? title ?? lang.toUpperCase(),
                    ),
                  })
                }
              />
            )}
          </div>
        </div>
      )}
      <div
        className="m3e-code-surface__scroll"
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        {preElement}
      </div>
    </div>
  );
}

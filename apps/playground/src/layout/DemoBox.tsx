import * as React from "react";
import { CopyButton, IconButton, Tooltip, useM3EToast } from "m3eui";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import type { ComponentScenarioSpec } from "../registry/types";
import { CodeBlock } from "./CodeBlock";
import { CodeBracketsIcon } from "./Icons";

export function DemoBox({
  scenario,
  defaultExpanded = false,
}: {
  readonly scenario: ComponentScenarioSpec;
  readonly defaultExpanded?: boolean;
}) {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const titleText = resolve(scenario.title);
  const descText = resolve(scenario.description);
  const codeLabel = expanded ? ui.hideCode : ui.showCode;

  const handleCopyAnchor = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${scenario.id}`;
    window.history.replaceState(null, "", `#${scenario.id}`);
    document.getElementById(scenario.id)?.scrollIntoView({ behavior: "smooth" });
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore clipboard errors
    }
    toast({ title: ui.cardCopiedLinkToast(scenario.id) });
  };

  return (
    <section id={scenario.id} tabIndex={-1} className="m3e-demo-box">
      <header className="m3e-demo-box__header">
        <div className="m3e-demo-box__info">
          <h3 className="m3e-demo-box__title">
            <a
              href={`#${scenario.id}`}
              onClick={handleCopyAnchor}
              className="m3e-demo-box__anchor-link"
            >
              {titleText}
              <span className="m3e-demo-box__hash" aria-hidden="true">
                #
              </span>
            </a>
          </h3>
          <p className="m3e-demo-box__desc">{descText}</p>
        </div>

        <div className="m3e-demo-box__actions">
          <Tooltip content={codeLabel}>
            <IconButton
              size="xs"
              variant={expanded ? "tonal" : "standard"}
              aria-label={codeLabel}
              icon={<CodeBracketsIcon size={18} />}
              onClick={() => setExpanded((prev) => !prev)}
            />
          </Tooltip>
          <CopyButton
            value={scenario.code.trim()}
            variant="ghost"
            label={`${ui.cardCopy} ${titleText}`}
            copiedLabel={ui.cardCopied}
            onCopy={() => toast({ title: ui.cardCopiedCodeToast(titleText) })}
          />
        </div>
      </header>

      <div className="m3e-demo-box__surface">
        <div className="m3e-demo-box__preview">{scenario.render()}</div>
        {expanded && (
          <div className="m3e-demo-box__code">
            <CodeBlock code={scenario.code} lang="tsx" maxHeight={380} embedded />
          </div>
        )}
      </div>
    </section>
  );
}

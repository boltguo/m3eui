import * as React from "react";
import {
  Button,
  CopyButton,
  useM3EToast,
} from "m3eui";
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
      <div className="m3e-demo-box__preview">{scenario.render()}</div>

      <div className="m3e-demo-box__meta">
        <div className="m3e-demo-box__info">
          <div className="m3e-demo-box__title-row">
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
          </div>
          <p className="m3e-demo-box__desc">{descText}</p>
        </div>

        <div className="m3e-demo-box__actions">
          <CopyButton
            value={scenario.code.trim()}
            variant="ghost"
            label={`${ui.cardCopy} ${titleText}`}
            copiedLabel={ui.cardCopied}
            onCopy={() => toast({ title: ui.cardCopiedCodeToast(titleText) })}
          />
          <Button
            size="xs"
            variant={expanded ? "tonal" : "outlined"}
            leadingIcon={<CodeBracketsIcon size={14} />}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? ui.hideCode : ui.showCode}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="m3e-demo-box__code">
          <CodeBlock code={scenario.code} lang="tsx" maxHeight={380} embedded />
        </div>
      )}
    </section>
  );
}

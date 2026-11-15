import * as React from "react";
import {
  Button,
  ButtonGroup,
  CopyButton,
  Dialog,
  DialogClose,
  Divider,
  IconButton,
  Tooltip,
  useM3EToast,
} from "m3eui";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import type { BlockSpec } from "../registry/types";
import { CodeBlock } from "./CodeBlock";
import {
  DesktopViewportIcon,
  MaximizeIcon,
  MobileViewportIcon,
  RefreshIcon,
  TabletViewportIcon,
} from "./Icons";

type ViewportSize = "desktop" | "tablet" | "mobile";

export function BlockViewer({ block }: { readonly block: BlockSpec }) {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();

  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [viewport, setViewport] = React.useState<ViewportSize>("desktop");
  const [remountKey, setRemountKey] = React.useState(0);
  const [fullscreenOpen, setFullscreenOpen] = React.useState(false);

  const titleText = resolve(block.title);
  const descText = resolve(block.description);

  return (
    <article id={block.slug} className="m3e-block-viewer">
      <div className="m3e-block-viewer__toolbar">
        <div className="m3e-block-viewer__left">
          <ButtonGroup
            variant="connected"
            size="xs"
            selectionMode="single"
            aria-label={titleText}
            items={[
              { value: "preview", label: ui.cardPreviewTab },
              { value: "code", label: ui.cardCodeTab },
            ]}
            value={[tab]}
            onValueChange={(vals) => {
              const next = vals[0] as "preview" | "code" | undefined;
              if (next) setTab(next);
            }}
          />
          <Divider orientation="vertical" className="m3e-block-viewer__sep" />
          <div className="m3e-block-viewer__title-group">
            <strong className="m3e-block-viewer__title">{titleText}</strong>
            <span className="m3e-block-viewer__desc">{descText}</span>
          </div>
        </div>

        <div className="m3e-block-viewer__right">
          {tab === "preview" && (
            <div className="m3e-block-viewer__viewport-controls">
              <Tooltip content={ui.viewportDesktop}>
                <IconButton
                  size="xs"
                  variant={viewport === "desktop" ? "tonal" : "standard"}
                  aria-label={ui.viewportDesktop}
                  icon={<DesktopViewportIcon />}
                  onClick={() => setViewport("desktop")}
                />
              </Tooltip>
              <Tooltip content={ui.viewportTablet}>
                <IconButton
                  size="xs"
                  variant={viewport === "tablet" ? "tonal" : "standard"}
                  aria-label={ui.viewportTablet}
                  icon={<TabletViewportIcon />}
                  onClick={() => setViewport("tablet")}
                />
              </Tooltip>
              <Tooltip content={ui.viewportMobile}>
                <IconButton
                  size="xs"
                  variant={viewport === "mobile" ? "tonal" : "standard"}
                  aria-label={ui.viewportMobile}
                  icon={<MobileViewportIcon />}
                  onClick={() => setViewport("mobile")}
                />
              </Tooltip>
              <Divider
                orientation="vertical"
                className="m3e-block-viewer__mini-sep"
              />
              <Tooltip content={ui.resetDemo}>
                <IconButton
                  size="xs"
                  variant="standard"
                  aria-label={ui.resetDemo}
                  icon={<RefreshIcon />}
                  onClick={() => setRemountKey((k) => k + 1)}
                />
              </Tooltip>
              <Tooltip content={ui.openFullscreen}>
                <IconButton
                  size="xs"
                  variant="standard"
                  aria-label={ui.openFullscreen}
                  icon={<MaximizeIcon />}
                  onClick={() => setFullscreenOpen(true)}
                />
              </Tooltip>
            </div>
          )}

          <Tooltip content={`${ui.cardCopy} ${block.slug}.tsx`}>
            <CopyButton
              value={block.code}
              variant="outlined"
              label={`${ui.cardCopy} ${block.slug}.tsx`}
              copiedLabel={ui.cardCopied}
              onCopy={() => toast({ title: ui.cardCopiedCodeToast(titleText) })}
            />
          </Tooltip>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="m3e-block-viewer__backdrop">
          <div
            className="block-viewport-stage"
            data-viewport={viewport}
            style={{ minHeight: block.minHeight ?? 520 }}
          >
            <React.Fragment key={remountKey}>{block.render()}</React.Fragment>
          </div>
        </div>
      ) : (
        <CodeBlock
          code={block.code}
          lang="tsx"
          title={`${block.slug}.tsx`}
          copyLabel={titleText}
          showHeader
          showCopyButton
          maxHeight={580}
        />
      )}

      <Dialog
        open={fullscreenOpen}
        onOpenChange={setFullscreenOpen}
        title={titleText}
        description={descText}
        className="m3e-block-fullscreen-dialog"
        actions={
          <DialogClose
            render={
              <Button variant="tonal" size="sm">
                {ui.closeFullscreen}
              </Button>
            }
          />
        }
      >
        <div className="block-viewport-stage" data-viewport="desktop">
          <React.Fragment key={`fs-${remountKey}`}>{block.render()}</React.Fragment>
        </div>
      </Dialog>
    </article>
  );
}

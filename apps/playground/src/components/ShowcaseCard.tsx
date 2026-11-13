import * as React from "react";
import {
  AssistChip,
  Button,
  Card,
  DataTable,
  Divider,
  type M3EDataTableColumn,
  IconButton,
  ScrollArea,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  Tooltip,
  useM3EToast,
} from "m3eui";
import { PROPS_CATALOG, type PropDocRow } from "../data/propsCatalog";
import { usePlaygroundStrings } from "../i18n";

export interface DocsCategoryHeaderProps {
  readonly indexLabel: string;
  readonly title: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly countLabel?: string;
}

export function DocsCategoryHeader({
  indexLabel,
  title,
  subtitle,
  countLabel,
}: DocsCategoryHeaderProps): React.JSX.Element {
  return (
    <div className="docs-category__header">
      <Divider className="docs-category__divider" />
      <div className="docs-category__title-row">
        <AssistChip className="docs-category__index-chip">
          {indexLabel}
        </AssistChip>
        <h2 className="docs-category__title">{title}</h2>
        {countLabel ? (
          <AssistChip className="docs-category__count-chip">
            {countLabel}
          </AssistChip>
        ) : null}
      </div>
      {subtitle ? <p className="docs-category__subtitle">{subtitle}</p> : null}
    </div>
  );
}

export interface ShowcaseCardProps {
  readonly id: string;
  readonly title: string;
  readonly primitive?: string;
  readonly description?: string;
  readonly code: string;
  readonly propsRows?: readonly PropDocRow[];
  readonly children: React.ReactNode;
}

function LinkAnchorIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CopyCodeIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function ShowcaseCard({
  id,
  title,
  primitive,
  description,
  code,
  propsRows,
  children,
}: ShowcaseCardProps): React.JSX.Element {
  const ui = usePlaygroundStrings();
  const { toast } = useM3EToast();
  const [tab, setTab] = React.useState<"preview" | "code" | "api">("preview");
  const [copied, setCopied] = React.useState(false);

  const propColumns = React.useMemo<readonly M3EDataTableColumn<PropDocRow>[]>(
    () => [
      {
        id: "name",
        header: ui.propColName,
        headerLabel: ui.propColName,
        isRowHeader: true,
        sortable: true,
        sortAccessor: (row) => row.name,
        cell: (row) => <code className="docs-api-prop">{row.name}</code>,
      },
      {
        id: "type",
        header: ui.propColType,
        headerLabel: ui.propColType,
        cell: (row) => <code className="docs-api-type">{row.type}</code>,
      },
      {
        id: "defaultValue",
        header: ui.propColDefault,
        headerLabel: ui.propColDefault,
        cell: (row) => (
          <code className="docs-api-default">{row.defaultValue ?? "—"}</code>
        ),
      },
      {
        id: "description",
        header: ui.propColDesc,
        headerLabel: ui.propColDesc,
        cell: (row) => <span>{row.description}</span>,
      },
    ],
    [ui],
  );

  const resolvedProps = propsRows ?? PROPS_CATALOG[id] ?? [];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
    toast({ title: ui.cardCopiedCodeToast(title) });
  };

  const handleCopyAnchor = async () => {
    const hashUrl = `${window.location.origin}${window.location.pathname}#${id}`;
    window.history.replaceState(null, "", `#${id}`);
    try {
      await navigator.clipboard.writeText(hashUrl);
    } catch {}
    toast({ title: ui.cardCopiedLinkToast(id) });
  };

  return (
    <section id={id} tabIndex={-1} className="docs-showcase-anchor">
      <Card variant="outlined" className="docs-showcase-card">
        <div className="docs-card__head">
          <div className="docs-card__meta">
            <div className="docs-card__title-row">
              <h3 className="docs-card__title">{title}</h3>
              {primitive ? (
                <AssistChip
                  className="docs-primitive-chip"
                  onClick={handleCopyAnchor}
                >
                  {primitive}
                </AssistChip>
              ) : null}
            </div>
            {description ? (
              <p className="docs-card__desc">{description}</p>
            ) : null}
          </div>

          <Tooltip content={ui.cardCopyAnchorTooltip(id)}>
            <IconButton
              size="xs"
              variant="standard"
              aria-label={ui.cardCopyAnchorAria(title)}
              icon={<LinkAnchorIcon />}
              onClick={handleCopyAnchor}
            />
          </Tooltip>
        </div>

        <Tabs
          variant="secondary"
          value={tab}
          onValueChange={(next) => setTab(next)}
          className="docs-card__tabs-root"
        >
          <TabsList
            activateOnFocus={false}
            aria-label={ui.cardViewSwitchAria(title)}
            className="docs-card__tablist"
          >
            <Tab value="preview">{ui.cardPreviewTab}</Tab>
            <Tab value="code">{ui.cardCodeTab}</Tab>
            {resolvedProps.length > 0 ? (
              <Tab value="api" badge={resolvedProps.length}>
                API
              </Tab>
            ) : null}
          </TabsList>

          <TabsPanel value="preview" className="docs-card__preview">
            {children}
          </TabsPanel>

          <TabsPanel value="code" className="docs-code-wrap">
            <div className="docs-code-toolbar">
              <AssistChip className="docs-code-lang-chip">TSX</AssistChip>
              <Button
                size="xs"
                variant="tonal"
                leadingIcon={<CopyCodeIcon />}
                onClick={handleCopyCode}
              >
                {copied ? ui.cardCopied : ui.cardCopy}
              </Button>
            </div>
            <ScrollArea maxHeight={420} orientation="both">
              <pre className="docs-code-pre">
                <code>{code}</code>
              </pre>
            </ScrollArea>
          </TabsPanel>

          {resolvedProps.length > 0 ? (
            <TabsPanel value="api" className="docs-api-wrap">
              <DataTable
                caption={`${title} API`}
                hideCaption
                density="compact"
                columns={propColumns}
                rows={resolvedProps}
                getRowKey={(row) => row.name}
              />
            </TabsPanel>
          ) : null}
        </Tabs>
      </Card>
    </section>
  );
}

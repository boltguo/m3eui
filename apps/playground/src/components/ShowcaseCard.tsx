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

const PROP_COLUMNS: readonly M3EDataTableColumn<PropDocRow>[] = [
  {
    id: "name",
    header: "属性",
    headerLabel: "属性",
    isRowHeader: true,
    sortable: true,
    sortAccessor: (row) => row.name,
    cell: (row) => <code className="docs-api-prop">{row.name}</code>,
  },
  {
    id: "type",
    header: "类型",
    headerLabel: "类型",
    cell: (row) => <code className="docs-api-type">{row.type}</code>,
  },
  {
    id: "defaultValue",
    header: "默认值",
    headerLabel: "默认值",
    cell: (row) => (
      <code className="docs-api-default">{row.defaultValue ?? "—"}</code>
    ),
  },
  {
    id: "description",
    header: "说明",
    headerLabel: "说明",
    cell: (row) => <span>{row.description}</span>,
  },
];

export function ShowcaseCard({
  id,
  title,
  primitive,
  description,
  code,
  propsRows,
  children,
}: ShowcaseCardProps): React.JSX.Element {
  const { toast } = useM3EToast();
  const [tab, setTab] = React.useState<"preview" | "code" | "api">("preview");
  const [copied, setCopied] = React.useState(false);

  const resolvedProps = propsRows ?? PROPS_CATALOG[id] ?? [];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
    toast({ title: `已复制 ${title} 代码` });
  };

  const handleCopyAnchor = async () => {
    const hashUrl = `${window.location.origin}${window.location.pathname}#${id}`;
    window.history.replaceState(null, "", `#${id}`);
    try {
      await navigator.clipboard.writeText(hashUrl);
    } catch {}
    toast({ title: `已复制链接 #${id}` });
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

          <Tooltip content={`复制 #${id} 链接`}>
            <IconButton
              size="xs"
              variant="standard"
              aria-label={`复制 ${title} 链接`}
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
            aria-label={`${title} 视图切换`}
            className="docs-card__tablist"
          >
            <Tab value="preview">预览</Tab>
            <Tab value="code">代码</Tab>
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
                {copied ? "已复制" : "复制"}
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
                columns={PROP_COLUMNS}
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

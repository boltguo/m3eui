import * as React from "react";
import type { M3EShapeName } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EContext.js";
import { MaterialShapeView } from "./MaterialShapeView.js";

export interface M3EEmptyProps {
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly shape?: M3EShapeName;
  readonly actions?: React.ReactNode;
  readonly compact?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DefaultEmptyGlyph({ compact }: { readonly compact: boolean }) {
  const s = compact ? 22 : 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
      <path d="m3 15 3.6 4.2a2 2 0 0 0 1.52.7h7.76a2 2 0 0 0 1.52-.7L21 15" />
      <path d="M3 15h6l1.5 2h3L15 15h6" />
    </svg>
  );
}

export function Empty({
  title,
  description,
  icon,
  shape = "cookie9Sided",
  actions,
  compact = false,
  className,
  style,
}: M3EEmptyProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedTitle = title ?? t("empty.title");
  const hasDescription =
    description !== undefined &&
    description !== null &&
    description !== false &&
    description !== "";
  const emblemSize = compact ? 56 : 76;

  return (
    <div
      className={className ? `m3e-empty ${className}` : "m3e-empty"}
      data-compact={compact ? "" : undefined}
      style={style}
    >
      <span
        className="m3e-empty__emblem"
        style={{ width: emblemSize, height: emblemSize }}
        aria-hidden="true"
      >
        <MaterialShapeView
          shape={shape}
          size={emblemSize}
          fill="var(--m3e-color-secondary-container)"
        />
        <span className="m3e-empty__glyph">
          {icon ?? <DefaultEmptyGlyph compact={compact} />}
        </span>
      </span>

      <div className="m3e-empty__copy">
        <div className="m3e-empty__title">{resolvedTitle}</div>
        {hasDescription ? (
          <div className="m3e-empty__description">{description}</div>
        ) : null}
      </div>

      {actions ? <div className="m3e-empty__actions">{actions}</div> : null}
    </div>
  );
}

import type * as React from "react";

interface StrokeIconProps {
  readonly size?: number;
  readonly strokeWidth?: number | string;
  readonly className?: string;
}

function StrokeIcon({
  size = 18,
  strokeWidth = 2,
  className,
  children,
}: StrokeIconProps & { readonly children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function CheckIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <polyline points="20 6 9 17 4 12" />
    </StrokeIcon>
  );
}

export function CloseIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </StrokeIcon>
  );
}

export function ChevronDownIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <polyline points="6 9 12 15 18 9" />
    </StrokeIcon>
  );
}

export function ChevronLeftIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <polyline points="15 18 9 12 15 6" />
    </StrokeIcon>
  );
}

export function ChevronRightIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <polyline points="9 18 15 12 9 6" />
    </StrokeIcon>
  );
}

export function ClockIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </StrokeIcon>
  );
}

export function SpinnerIcon({
  size,
  className,
}: {
  readonly size: number;
  readonly className: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.6" strokeOpacity="0.26" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function MoreVertIconSvg() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

export function StatusSeverityGlyph({
  severity,
  size = 20,
}: {
  readonly severity: "info" | "success" | "warning" | "error";
  readonly size?: number;
}) {
  if (severity === "success") {
    return (
      <StrokeIcon size={size} strokeWidth={2.2}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="8.5 12.5 11 15 16 9.5" />
      </StrokeIcon>
    );
  }
  if (severity === "warning") {
    return (
      <StrokeIcon size={size} strokeWidth={2.2}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </StrokeIcon>
    );
  }
  if (severity === "error") {
    return (
      <StrokeIcon size={size} strokeWidth={2.2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </StrokeIcon>
    );
  }
  return (
    <StrokeIcon size={size} strokeWidth={2.2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </StrokeIcon>
  );
}

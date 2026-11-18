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

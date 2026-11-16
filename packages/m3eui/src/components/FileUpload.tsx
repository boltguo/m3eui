"use client";

import * as React from "react";
import {
  FILE_UPLOAD_TOKENS,
} from "../tokens/topology.js";
import { useM3EI18n } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { formatLocalizedInteger, formatLocalizedNumber } from "../i18n/index.js";
import { IconButton } from "./IconButton.js";
import { LinearProgressIndicator } from "./ProgressIndicator.js";
import { useFieldsetDisabled } from "../internal/fieldOutline.js";

export type FileUploadStatus = "idle" | "uploading" | "completed" | "error";

export interface M3EUploadFileItem {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly type?: string;
  readonly status?: FileUploadStatus;
  readonly progress?: number;
  readonly previewUrl?: string;
  readonly errorMessage?: string;
  readonly file?: File;
}

export interface M3EFileUploadDropzoneProps {
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly disabled?: boolean;
  readonly label?: React.ReactNode;
  readonly hint?: React.ReactNode;
  readonly filterOnDrop?: boolean;
  readonly onFilesAccepted: (files: File[]) => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function UploadCloudSvg() {
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}

function FileDocSvg() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function TrashCrossSvg() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function formatByteSize(locale: string, bytes: number): string {
  if (bytes < 1024) {
    return `${formatLocalizedInteger(locale, bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${formatLocalizedNumber(locale, bytes / 1024, { maximumFractionDigits: 1 })} KB`;
  }
  return `${formatLocalizedNumber(locale, bytes / (1024 * 1024), { maximumFractionDigits: 1 })} MB`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || !accept.trim()) return true;
  const rules = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const mime = (file.type || "").toLowerCase();
  const lowerName = file.name.toLowerCase();

  return rules.some((rule) => {
    if (rule.startsWith(".")) {
      return lowerName.endsWith(rule);
    }
    if (rule.endsWith("/*")) {
      const prefix = rule.slice(0, -1);
      return mime.startsWith(prefix);
    }
    return mime === rule;
  });
}

export function FileUploadDropzone({
  accept,
  multiple = true,
  disabled = false,
  label,
  hint,
  filterOnDrop = true,
  onFilesAccepted,
  className,
  style,
}: M3EFileUploadDropzoneProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const isDisabled = useFieldsetDisabled(disabled);
  const inputId = React.useId();
  const hintId = React.useId();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(isDisabled);

  const active = isDragOver || isPressed;
  const targetRadius = active
    ? FILE_UPLOAD_TOKENS.dropzoneActiveRadius
    : FILE_UPLOAD_TOKENS.dropzoneRadius;
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    "fastSpatial",
  );

  return (
    <div
      ref={ref}
      className={
        className ? `m3e-dropzone ${className}` : "m3e-dropzone"
      }
      data-drag-over={isDragOver ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      style={{
        borderRadius: borderRadiusCss,
        padding: `${FILE_UPLOAD_TOKENS.dropzonePadding}px`,
        ...style,
      }}
      onDragEnter={(e) => {
        if (isDisabled) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragOver={(e) => {
        if (isDisabled) return;
        e.preventDefault();
        if (!isDragOver) setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (isDisabled) return;
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        if (isDisabled) return;
        e.preventDefault();
        setIsDragOver(false);
        const rawDropped = Array.from(e.dataTransfer.files ?? []);
        const dropped = filterOnDrop
          ? rawDropped.filter((f) => matchesAccept(f, accept))
          : rawDropped;
        if (dropped.length > 0) {
          onFilesAccepted(multiple ? dropped : dropped.slice(0, 1));
        }
      }}
      onClick={(e) => {
        if (isDisabled) return;
        if (e.target !== inputRef.current) {
          inputRef.current?.click();
        }
      }}
      {...pressHandlers}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={isDisabled}
        aria-describedby={hintId}
        className="m3e-sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          if (picked.length > 0) {
            onFilesAccepted(picked);
          }
          e.target.value = "";
        }}
      />

      <span className="m3e-dropzone__icon" aria-hidden="true">
        <UploadCloudSvg />
      </span>

      <label htmlFor={inputId} className="m3e-dropzone__prompt" onClick={(e) => e.stopPropagation()}>
        {label ?? (
          <>
            <span>{t("fileUpload.dropPrompt")} </span>
            <span className="m3e-dropzone__browse-link">
              {t("fileUpload.browseButton")}
            </span>
          </>
        )}
      </label>

      <p id={hintId} className="m3e-dropzone__hint">
        {hint ?? t("fileUpload.dropHint")}
      </p>
    </div>
  );
}

export interface M3EFileUploadProps {
  readonly value?: readonly M3EUploadFileItem[];
  readonly defaultValue?: readonly M3EUploadFileItem[];
  readonly onValueChange?: (items: M3EUploadFileItem[]) => void;
  readonly onFilesRejected?: (errors: string[]) => void;
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly maxFiles?: number;
  readonly maxSize?: number;
  readonly disabled?: boolean;
  readonly label?: React.ReactNode;
  readonly hint?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function FileUpload({
  value: controlledItems,
  defaultValue = [],
  onValueChange,
  onFilesRejected,
  accept,
  multiple = true,
  maxFiles,
  maxSize,
  disabled = false,
  label,
  hint,
  className,
  style,
}: M3EFileUploadProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const isDisabled = useFieldsetDisabled(disabled);
  const [uncontrolledItems, setUncontrolledItems] =
    React.useState<readonly M3EUploadFileItem[]>(defaultValue);
  const [errors, setErrors] = React.useState<string[]>([]);
  const createdUrlsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => {
      for (const u of urls) {
        URL.revokeObjectURL(u);
      }
      urls.clear();
    };
  }, []);

  const items =
    controlledItems !== undefined ? controlledItems : uncontrolledItems;

  React.useEffect(() => {
    const activeUrls = new Set(
      items.map((i) => i.previewUrl).filter(Boolean) as string[],
    );
    for (const u of createdUrlsRef.current) {
      if (!activeUrls.has(u)) {
        URL.revokeObjectURL(u);
        createdUrlsRef.current.delete(u);
      }
    }
  }, [items]);

  const commitItems = (next: M3EUploadFileItem[]) => {
    if (controlledItems === undefined) {
      setUncontrolledItems(next);
    }
    onValueChange?.(next);
  };

  const isSingleMode = !multiple || maxFiles === 1;

  const handleFilesAccepted = (incoming: File[]) => {
    const nextErrors: string[] = [];
    const nextItems = isSingleMode ? [] : [...items];
    let didAcceptAny = false;

    for (const file of incoming) {
      if (isSingleMode && didAcceptAny) {
        if (maxFiles === 1) {
          nextErrors.push(
            t("fileUpload.errorMaxFiles", {
              max: formatLocalizedInteger(locale, 1),
            }),
          );
        }
        break;
      }
      if (!isSingleMode && maxFiles !== undefined && nextItems.length >= maxFiles) {
        nextErrors.push(
          t("fileUpload.errorMaxFiles", {
            max: formatLocalizedInteger(locale, maxFiles),
          }),
        );
        break;
      }
      if (!matchesAccept(file, accept)) {
        nextErrors.push(t("fileUpload.errorFileType", { name: file.name }));
        continue;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        nextErrors.push(
          t("fileUpload.errorMaxSize", {
            name: file.name,
            max: formatByteSize(locale, maxSize),
          }),
        );
        continue;
      }

      let previewUrl: string | undefined;
      if (
        typeof URL !== "undefined" &&
        typeof URL.createObjectURL === "function" &&
        file.type.startsWith("image/")
      ) {
        previewUrl = URL.createObjectURL(file);
        createdUrlsRef.current.add(previewUrl);
      }

      nextItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "idle",
        previewUrl,
        file,
      });
      didAcceptAny = true;
    }

    setErrors(nextErrors);
    if (nextErrors.length > 0) {
      onFilesRejected?.(nextErrors);
    }
    if (didAcceptAny) {
      commitItems(nextItems);
    }
  };

  const handleRemove = (id: string) => {
    commitItems(items.filter((i) => i.id !== id));
  };

  return (
    <div
      className={className ? `m3e-file-upload ${className}` : "m3e-file-upload"}
      style={style}
    >
      <FileUploadDropzone
        accept={accept}
        multiple={!isSingleMode && multiple}
        filterOnDrop={false}
        disabled={
          isDisabled ||
          (!isSingleMode && maxFiles !== undefined && items.length >= maxFiles)
        }
        label={label}
        hint={hint}
        onFilesAccepted={handleFilesAccepted}
      />

      {errors.length > 0 ? (
        <div role="alert" className="m3e-file-upload__errors">
          {errors.map((err, i) => (
            <p key={i} className="m3e-field__error">
              {err}
            </p>
          ))}
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul role="list" className="m3e-file-upload__list">
          {items.map((item) => {
            const isUploading = item.status === "uploading";
            const isError = item.status === "error";
            return (
              <li
                key={item.id}
                className="m3e-file-upload__item"
                data-status={item.status ?? "idle"}
                style={{
                  borderRadius: `${FILE_UPLOAD_TOKENS.itemRadius}px`,
                  padding: `${FILE_UPLOAD_TOKENS.itemPadding}px`,
                }}
              >
                <div className="m3e-file-upload__item-row">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="m3e-file-upload__thumb"
                    />
                  ) : (
                    <span className="m3e-file-upload__file-icon" aria-hidden="true">
                      <FileDocSvg />
                    </span>
                  )}

                  <div className="m3e-file-upload__meta">
                    <span className="m3e-file-upload__name">{item.name}</span>
                    <span className="m3e-file-upload__sub">
                      {formatByteSize(locale, item.size)}
                      {isUploading
                        ? ` · ${t("fileUpload.uploading")}`
                        : item.status === "completed"
                          ? ` · ${t("fileUpload.completed")}`
                          : null}
                      {isError && item.errorMessage
                        ? ` · ${item.errorMessage}`
                        : null}
                    </span>
                  </div>

                  {!isDisabled ? (
                    <IconButton
                      size="xs"
                      variant="standard"
                      aria-label={t("fileUpload.removeFile", {
                        name: item.name,
                      })}
                      className="m3e-file-upload__remove"
                      icon={<TrashCrossSvg />}
                      onClick={() => handleRemove(item.id)}
                    />
                  ) : null}
                </div>

                {isUploading ? (
                  <div className="m3e-file-upload__progress">
                    <LinearProgressIndicator
                      wavy
                      value={item.progress ?? null}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

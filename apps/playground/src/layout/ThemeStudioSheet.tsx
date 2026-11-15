import * as React from "react";
import type { ColorSchemeVariant } from "m3eui/tokens";
import {
  Button,
  ButtonGroup,
  Chip,
  ColorPicker,
  type M3EBuiltInLocale,
  Popover,
  Select,
  SheetClose,
  SideSheet,
  Switch,
  ToggleButton,
  useM3E,
  useM3EToast,
} from "m3eui";
import { usePlaygroundStrings } from "../i18n";
import { CheckTinyIcon, CopyIcon } from "./Icons";

const LOCALE_GROUP_ITEMS: readonly { value: M3EBuiltInLocale; label: string }[] = [
  { value: "en-US", label: "EN" },
  { value: "zh-CN", label: "中文" },
  { value: "ja-JP", label: "日本語" },
  { value: "ar-SA", label: "العربية" },
];

export const AOSP_SCHEME_OPTIONS: readonly {
  readonly value: ColorSchemeVariant;
  readonly label: string;
}[] = [
  { value: "expressive", label: "Expressive (M3E)" },
  { value: "tonalSpot", label: "Tonal Spot" },
  { value: "vibrant", label: "Vibrant" },
  { value: "neutral", label: "Neutral" },
  { value: "fidelity", label: "Fidelity" },
  { value: "content", label: "Content" },
  { value: "monochrome", label: "Monochrome" },
  { value: "rainbow", label: "Rainbow" },
  { value: "fruitSalad", label: "Fruit Salad" },
];

export function SeedSwatchDot({ hex }: { readonly hex: string }) {
  return (
    <span
      className="docs-seed-dot"
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    />
  );
}

export function ThemeStudioSheet({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const ui = usePlaygroundStrings();
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    contrastLevel,
    setContrastLevel,
    colorMode,
    setColorMode,
    locale,
    setLocale,
    direction,
    directionMode,
    setDirection,
    setDirectionMode,
    motionSchemeName,
    setMotionSchemeName,
    playbackRate,
    setPlaybackRate,
    debugGeometry,
    setDebugGeometry,
    exportConfigJson,
  } = useM3E();
  const { toast } = useM3EToast();
  const [copiedJson, setCopiedJson] = React.useState(false);

  const seedPresets = React.useMemo(
    () => [
      { hex: "#6750A4", name: ui.seedPurple },
      { hex: "#0B6B58", name: ui.seedJade },
      { hex: "#1A73E8", name: ui.seedOcean },
      { hex: "#B3261E", name: ui.seedVermilion },
      { hex: "#7D5260", name: ui.seedRose },
    ],
    [ui],
  );

  const isPresetSelected = seedPresets.some(
    (p) => p.hex.toLowerCase() === seedHex.toLowerCase(),
  );

  const contrastItems = React.useMemo(
    () => [
      { value: "0", label: ui.contrastStandard },
      { value: "0.5", label: ui.contrastMedium },
      { value: "1", label: ui.contrastHigh },
    ],
    [ui],
  );
  const colorModeItems = React.useMemo(
    () => [
      { value: "light", label: ui.modeLight },
      { value: "dark", label: ui.modeDark },
      { value: "system", label: ui.modeSystem },
    ],
    [ui],
  );

  const springId = React.useId();
  const slowMoId = React.useId();
  const rulerId = React.useId();

  return (
    <SideSheet
      open={open}
      onOpenChange={onOpenChange}
      side="end"
      title={ui.studioTitle}
      style={{ maxWidth: 408 }}
      footer={
        <div className="studio-footer-bar">
          <Button
            variant="tonal"
            size="sm"
            leadingIcon={
              copiedJson ? <CheckTinyIcon size={14} /> : <CopyIcon size={14} />
            }
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportConfigJson());
                setCopiedJson(true);
                window.setTimeout(() => setCopiedJson(false), 1600);
              } catch {
                // ignore clipboard failure
              }
              toast({ title: ui.copiedM3eJsonToast });
            }}
          >
            {ui.copyM3eJson}
          </Button>
          <SheetClose
            render={
              <Button variant="filled" size="sm">
                {ui.done}
              </Button>
            }
          />
        </div>
      }
    >
      <div className="docs-studio-sheet-content">
        {/* Section 1: Color & Contrast */}
        <section className="studio-section" aria-label={ui.colorAndContrastLegend}>
          <div className="studio-section__head">
            <h3 className="studio-section__title">{ui.colorAndContrastLegend}</h3>
            <Chip size="sm" tone="primary" variant="tonal">
              {seedHex.toUpperCase()}
            </Chip>
          </div>

          <div className="docs-studio-field">
            <span className="docs-studio-field__label">{ui.seedPresetsLabel}</span>
            <div className="studio-seed-grid">
              {seedPresets.map((preset) => {
                const selected =
                  seedHex.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <ToggleButton
                    key={preset.hex}
                    size="xs"
                    variant="outlined"
                    shape="square"
                    className="studio-seed-toggle"
                    pressed={selected}
                    onPressedChange={() => setSeedHex(preset.hex)}
                    leadingIcon={<SeedSwatchDot hex={preset.hex} />}
                  >
                    {preset.name}
                  </ToggleButton>
                );
              })}

              <Popover
                side="bottom"
                align="end"
                trigger={
                  <Button
                    size="xs"
                    variant={!isPresetSelected ? "filled" : "outlined"}
                    shape={!isPresetSelected ? "round" : "square"}
                    className="studio-seed-toggle"
                    aria-label={ui.seedCustomAria}
                    leadingIcon={
                      <span
                        className="studio-custom-swatch"
                        style={{ backgroundColor: seedHex }}
                        aria-hidden="true"
                      />
                    }
                  >
                    {!isPresetSelected ? seedHex.toUpperCase() : ui.seedCustom}
                  </Button>
                }
              >
                <ColorPicker
                  value={seedHex}
                  onValueChange={setSeedHex}
                />
              </Popover>
            </div>
          </div>

          <Select
            labelPosition="outside"
            label={ui.schemeSelectLabel}
            value={schemeVariant}
            onValueChange={(v) => {
              if (v) {
                setSchemeVariant(v as ColorSchemeVariant);
              }
            }}
            options={AOSP_SCHEME_OPTIONS}
          />

          <div className="docs-studio-field">
            <span className="docs-studio-field__label">{ui.contrastLabel}</span>
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              className="studio-segmented"
              aria-label={ui.contrastLabel}
              items={contrastItems}
              value={[String(contrastLevel)]}
              onValueChange={(vals) => {
                if (vals[0] !== undefined) setContrastLevel(Number(vals[0]));
              }}
            />
          </div>

          <div className="docs-studio-field">
            <span className="docs-studio-field__label">{ui.colorModeLabel}</span>
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              className="studio-segmented"
              aria-label={ui.colorModeLabel}
              items={colorModeItems}
              value={[colorMode]}
              onValueChange={(vals) => {
                const next = vals[0] as "light" | "dark" | "system" | undefined;
                if (next) setColorMode(next);
              }}
            />
          </div>
        </section>

        {/* Section 2: Locale & Direction */}
        <section className="studio-section" aria-label={ui.langAndDirLegend}>
          <div className="studio-section__head">
            <h3 className="studio-section__title">{ui.langAndDirLegend}</h3>
          </div>

          <div className="docs-studio-field">
            <span className="docs-studio-field__label">{ui.languageLabel}</span>
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              className="studio-segmented"
              aria-label={ui.languageLabel}
              items={LOCALE_GROUP_ITEMS}
              value={[locale]}
              onValueChange={(vals) => {
                const next = vals[0] as M3EBuiltInLocale | undefined;
                if (next) {
                  setDirectionMode("auto");
                  setLocale(next);
                }
              }}
            />
          </div>

          <div className="docs-studio-field">
            <span className="docs-studio-field__label">{ui.writingDirLabel}</span>
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              className="studio-segmented"
              aria-label={ui.writingDirLabel}
              items={[
                { value: "auto", label: ui.autoDirLabel(direction.toUpperCase()) },
                { value: "ltr", label: "LTR →" },
                { value: "rtl", label: "← RTL" },
              ]}
              value={[directionMode]}
              onValueChange={(vals) => {
                const next = vals[0] as "auto" | "ltr" | "rtl" | undefined;
                if (!next) return;
                if (next === "auto") {
                  setDirectionMode("auto");
                } else {
                  setDirection(next);
                }
              }}
            />
          </div>
        </section>

        {/* Section 3: Motion & Inspection */}
        <section className="studio-section" aria-label={ui.motionAndDebugLegend}>
          <div className="studio-section__head">
            <h3 className="studio-section__title">{ui.motionAndDebugLegend}</h3>
          </div>

          <div className="studio-toggle-list">
            <div className="studio-toggle-row">
              <label htmlFor={springId} className="studio-toggle-row__label">
                {ui.expressiveSpringLabel}
              </label>
              <Switch
                id={springId}
                checked={motionSchemeName === "expressive"}
                onCheckedChange={(checked) =>
                  setMotionSchemeName(checked ? "expressive" : "standard")
                }
              />
            </div>

            <div className="studio-toggle-row">
              <label htmlFor={slowMoId} className="studio-toggle-row__label">
                {ui.slowMotionLabel}
              </label>
              <Switch
                id={slowMoId}
                checked={playbackRate < 1}
                onCheckedChange={(checked) => setPlaybackRate(checked ? 0.25 : 1)}
              />
            </div>

            <div className="studio-toggle-row">
              <label htmlFor={rulerId} className="studio-toggle-row__label">
                {ui.geometryRulerLabel}
              </label>
              <Switch
                id={rulerId}
                checked={debugGeometry}
                onCheckedChange={setDebugGeometry}
              />
            </div>
          </div>
        </section>
      </div>
    </SideSheet>
  );
}

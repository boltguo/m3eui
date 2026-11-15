import { Chip } from "m3eui";
import { useCopyResolver } from "../i18n";
import { BlockViewer } from "../layout/BlockViewer";
import { SparkleIcon } from "../layout/Icons";
import { BLOCKS_REGISTRY } from "../registry/blocks";

export function BlocksPage() {
  const resolve = useCopyResolver();

  return (
    <div className="m3e-blocks-page">
      <header className="m3e-blocks-hero">
        <div className="demo-row" style={{ gap: 8 }}>
          <Chip tone="primary" icon={<SparkleIcon size={13} />}>
            Material 3 Expressive Blocks
          </Chip>
          <Chip tone="secondary" variant="outlined">
            {BLOCKS_REGISTRY.length} Templates · @container
          </Chip>
        </div>

        <h1 className="m3e-blocks-hero__title">
          {resolve({
            zh: "M3E 综合型应用实例",
            en: "Full-Page Application Blocks",
          })}
        </h1>
        <p className="m3e-blocks-hero__desc">
          {resolve({
            zh: "面向真实业务场景的完整页面级模板，原生适配 HCT 动态色彩、RTL 与响应式容器断点。",
            en: "Comprehensive full-page product templates built with m3eui, live HCT tokens, RTL mirroring, and responsive viewports.",
          })}
        </p>
      </header>

      <div className="m3e-blocks-stack">
        {BLOCKS_REGISTRY.map((block) => (
          <BlockViewer key={block.slug} block={block} />
        ))}
      </div>
    </div>
  );
}

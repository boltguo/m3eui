import { useM3EI18n } from "m3eui";

export interface PlaygroundStrings {
  readonly docTitle: string;
  readonly skipToMain: string;
  readonly openNavDrawer: string;
  readonly searchPlaceholder: string;
  readonly searchAriaLabel: string;
  readonly languageLabel: string;
  readonly colorModeLabel: string;
  readonly modeLight: string;
  readonly modeDark: string;
  readonly modeSystem: string;
  readonly contrastStandard: string;
  readonly contrastMedium: string;
  readonly contrastHigh: string;
  readonly themePopoverTitle: string;
  readonly themeButton: string;
  readonly studioButton: string;
  readonly studioTitle: string;
  readonly seedPresetsLabel: string;
  readonly seedCustom: string;
  readonly seedCustomAria: string;
  readonly seedPurple: string;
  readonly seedJade: string;
  readonly seedOcean: string;
  readonly seedVermilion: string;
  readonly seedRose: string;
  readonly schemeStyleLabel: string;
  readonly schemeSelectLabel: string;
  readonly specVersionLabel: string;
  readonly contrastLabel: string;
  readonly colorAndContrastLegend: string;
  readonly langAndDirLegend: string;
  readonly writingDirLabel: string;
  readonly autoDirLabel: (dir: string) => string;
  readonly motionAndDebugLegend: string;
  readonly expressiveSpringLabel: string;
  readonly standardSpringLabel: string;
  readonly slowMotionLabel: string;
  readonly normalSpeedLabel: string;
  readonly geometryRulerLabel: string;
  readonly copyM3eJson: string;
  readonly copiedM3eJsonToast: string;
  readonly done: string;
  readonly mobileNavAria: string;
  readonly mobileNavHeadline: string;
  readonly sidebarHeading: string;
  readonly heroTitle: string;
  readonly heroDesc: string;
  readonly quickStartBtn: string;
  readonly openStudioBtn: string;
  readonly compositeSuiteBtn: string;
  readonly switchPolygonTooltip: string;
  readonly quickStudioBarAria: string;
  readonly backToTop: string;
  readonly navGroups: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  readonly cardPreviewTab: string;
  readonly cardCodeTab: string;
  readonly cardCopy: string;
  readonly cardCopied: string;
  readonly cardCopiedCodeToast: (title: string) => string;
  readonly cardCopiedLinkToast: (id: string) => string;
  readonly cardCopyAnchorTooltip: (id: string) => string;
  readonly cardCopyAnchorAria: (title: string) => string;
  readonly cardViewSwitchAria: (title: string) => string;
  readonly propColName: string;
  readonly propColType: string;
  readonly propColDefault: string;
  readonly propColDesc: string;
}

const ZH_CN: PlaygroundStrings = {
  docTitle: "m3eui · Material 3 Expressive React 组件库",
  skipToMain: "跳至主内容",
  openNavDrawer: "打开组件导航抽屉",
  searchPlaceholder: "搜索组件 (如 Button, DatePicker, Tabs)…",
  searchAriaLabel: "搜索组件",
  languageLabel: "语言",
  colorModeLabel: "明暗模式",
  modeLight: "浅色",
  modeDark: "深色",
  modeSystem: "跟随系统",
  contrastStandard: "标准 0",
  contrastMedium: "中对比 +0.5",
  contrastHigh: "高对比 +1.0",
  themePopoverTitle: "主题设置",
  themeButton: "主题",
  studioButton: "工作台",
  studioTitle: "主题与动效工作台",
  seedPresetsLabel: "HCT 种子色预设",
  seedCustom: "自定义",
  seedCustomAria: "自定义种子色",
  seedPurple: "Expressive 紫",
  seedJade: "翡翠青",
  seedOcean: "海湾蓝",
  seedVermilion: "朱砂红",
  seedRose: "玫瑰棕",
  schemeStyleLabel: "调色板风格",
  schemeSelectLabel: "调色板变体 (AOSP 9 Schemes)",
  specVersionLabel: "AOSP Monet 规范版本",
  contrastLabel: "对比度",
  colorAndContrastLegend: "色彩与对比度",
  langAndDirLegend: "语言与方向",
  writingDirLabel: "书写方向",
  autoDirLabel: (dir) => `自动 (${dir})`,
  motionAndDebugLegend: "动效与调试",
  expressiveSpringLabel: "弹性弹簧",
  standardSpringLabel: "标准弹簧",
  slowMotionLabel: "0.25x 慢动作",
  normalSpeedLabel: "1x 速度",
  geometryRulerLabel: "几何标尺",
  copyM3eJson: "复制 m3e.json",
  copiedM3eJsonToast: "已复制 m3e.json",
  done: "完成",
  mobileNavAria: "移动端组件规范目录",
  mobileNavHeadline: "m3eui 组件规范目录",
  sidebarHeading: "组件目录",
  heroTitle: "Material 3 Expressive React 组件库",
  heroDesc:
    "自研 AOSP Monet SPEC_2025 动态色彩引擎、解析物理弹簧 ODE、35 种圆角多边形与全量 CLDR / BiDi 国际化。",
  quickStartBtn: "快速上手",
  openStudioBtn: "主题工作台",
  compositeSuiteBtn: "复合组件",
  switchPolygonTooltip: "切换多边形",
  quickStudioBarAria: "快捷主题与物理控制栏",
  backToTop: "返回顶部 ↑",
  navGroups: [
    "入门与配置",
    "动作与工具栏",
    "表单控件",
    "数据展示与容器",
    "导航与列表",
    "浮层与反馈",
    "复合组件",
  ],
  cardPreviewTab: "预览",
  cardCodeTab: "代码",
  cardCopy: "复制",
  cardCopied: "已复制",
  cardCopiedCodeToast: (title) => `已复制 ${title} 代码`,
  cardCopiedLinkToast: (id) => `已复制链接 #${id}`,
  cardCopyAnchorTooltip: (id) => `复制 #${id} 链接`,
  cardCopyAnchorAria: (title) => `复制 ${title} 链接`,
  cardViewSwitchAria: (title) => `${title} 视图切换`,
  propColName: "属性",
  propColType: "类型",
  propColDefault: "默认值",
  propColDesc: "说明",
};

const EN_US: PlaygroundStrings = {
  docTitle: "m3eui · Material 3 Expressive React Component Library",
  skipToMain: "Skip to main content",
  openNavDrawer: "Open component navigation drawer",
  searchPlaceholder: "Search components (Button, DatePicker, Tabs)…",
  searchAriaLabel: "Search components",
  languageLabel: "Language",
  colorModeLabel: "Color mode",
  modeLight: "Light",
  modeDark: "Dark",
  modeSystem: "System",
  contrastStandard: "Standard 0",
  contrastMedium: "Medium +0.5",
  contrastHigh: "High +1.0",
  themePopoverTitle: "Theme settings",
  themeButton: "Theme",
  studioButton: "Studio",
  studioTitle: "Theme & Motion Studio",
  seedPresetsLabel: "HCT seed presets",
  seedCustom: "Custom",
  seedCustomAria: "Custom seed color",
  seedPurple: "Expressive Iris",
  seedJade: "Jade Teal",
  seedOcean: "Bay Blue",
  seedVermilion: "Vermilion",
  seedRose: "Rosewood",
  schemeStyleLabel: "Palette style",
  schemeSelectLabel: "Scheme variant (AOSP 9 Schemes)",
  specVersionLabel: "AOSP Monet spec version",
  contrastLabel: "Contrast",
  colorAndContrastLegend: "Color & Contrast",
  langAndDirLegend: "Locale & Direction",
  writingDirLabel: "Writing direction",
  autoDirLabel: (dir) => `Auto (${dir})`,
  motionAndDebugLegend: "Motion & Inspection",
  expressiveSpringLabel: "Expressive spring",
  standardSpringLabel: "Standard spring",
  slowMotionLabel: "0.25x slow-mo",
  normalSpeedLabel: "1x speed",
  geometryRulerLabel: "Geometry HUD",
  copyM3eJson: "Copy m3e.json",
  copiedM3eJsonToast: "Copied m3e.json",
  done: "Done",
  mobileNavAria: "Mobile component catalog",
  mobileNavHeadline: "m3eui Component Catalog",
  sidebarHeading: "Components",
  heroTitle: "Material 3 Expressive for React",
  heroDesc:
    "Self-contained AOSP Monet SPEC_2025 dynamic color engine, analytical SpringSimulation ODE physics, 35 morphing polygons, and full CLDR / BiDi i18n.",
  quickStartBtn: "Quick Start",
  openStudioBtn: "Theme Studio",
  compositeSuiteBtn: "Composite Suite",
  switchPolygonTooltip: "Cycle polygon shape",
  quickStudioBarAria: "Quick theme and physics controls",
  backToTop: "Back to top ↑",
  navGroups: [
    "Getting Started",
    "Actions & Toolbars",
    "Form Controls",
    "Data & Surfaces",
    "Navigation & Lists",
    "Overlays & Feedback",
    "Composite Suite",
  ],
  cardPreviewTab: "Preview",
  cardCodeTab: "Code",
  cardCopy: "Copy",
  cardCopied: "Copied",
  cardCopiedCodeToast: (title) => `Copied ${title} code`,
  cardCopiedLinkToast: (id) => `Copied link #${id}`,
  cardCopyAnchorTooltip: (id) => `Copy #${id} link`,
  cardCopyAnchorAria: (title) => `Copy ${title} link`,
  cardViewSwitchAria: (title) => `${title} view tabs`,
  propColName: "Prop",
  propColType: "Type",
  propColDefault: "Default",
  propColDesc: "Description",
};

const JA_JP: PlaygroundStrings = {
  docTitle: "m3eui · Material 3 Expressive React コンポーネント",
  skipToMain: "メインコンテンツへ移動",
  openNavDrawer: "コンポーネント目次を開く",
  searchPlaceholder: "コンポーネントを検索 (Button, DatePicker, Tabs)…",
  searchAriaLabel: "コンポーネントを検索",
  languageLabel: "言語",
  colorModeLabel: "カラーモード",
  modeLight: "ライト",
  modeDark: "ダーク",
  modeSystem: "システム",
  contrastStandard: "標準 0",
  contrastMedium: "中 +0.5",
  contrastHigh: "高 +1.0",
  themePopoverTitle: "テーマ設定",
  themeButton: "テーマ",
  studioButton: "スタジオ",
  studioTitle: "テーマ・モーションスタジオ",
  seedPresetsLabel: "HCT シードカラー",
  seedCustom: "カスタム",
  seedCustomAria: "カスタムシードカラー",
  seedPurple: "Expressive 紫",
  seedJade: "翡翠ティール",
  seedOcean: "ベイブルー",
  seedVermilion: "朱赤",
  seedRose: "ローズブラウン",
  schemeStyleLabel: "パレットスタイル",
  schemeSelectLabel: "スキーム変種 (AOSP 9 Schemes)",
  specVersionLabel: "AOSP Monet 仕様バージョン",
  contrastLabel: "コントラスト",
  colorAndContrastLegend: "カラーとコントラスト",
  langAndDirLegend: "言語と書字方向",
  writingDirLabel: "書字方向",
  autoDirLabel: (dir) => `自動 (${dir})`,
  motionAndDebugLegend: "モーションと検証",
  expressiveSpringLabel: "Expressive スプリング",
  standardSpringLabel: "標準スプリング",
  slowMotionLabel: "0.25x スロー再生",
  normalSpeedLabel: "1x 通常速度",
  geometryRulerLabel: "ジオメトリ HUD",
  copyM3eJson: "m3e.json をコピー",
  copiedM3eJsonToast: "m3e.json をコピーしました",
  done: "完了",
  mobileNavAria: "モバイルコンポーネント目次",
  mobileNavHeadline: "m3eui コンポーネント目次",
  sidebarHeading: "コンポーネント一覧",
  heroTitle: "Material 3 Expressive React ライブラリ",
  heroDesc:
    "AOSP Monet SPEC_2025 動的カラー、解析スプリング物理 ODE、35 種類のポリゴンモーフィング、CLDR / BiDi 多言語対応を内蔵。",
  quickStartBtn: "クイックスタート",
  openStudioBtn: "テーマスタジオ",
  compositeSuiteBtn: "複合スイート",
  switchPolygonTooltip: "ポリゴンを切り替え",
  quickStudioBarAria: "クイックテーマ・物理コントロール",
  backToTop: "トップへ戻る ↑",
  navGroups: [
    "はじめに・設定",
    "アクション・ツールバー",
    "フォームコントロール",
    "データ表示・コンテナ",
    "ナビゲーション・リスト",
    "オーバーレイ・フィードバック",
    "複合コンポーネント",
  ],
  cardPreviewTab: "プレビュー",
  cardCodeTab: "コード",
  cardCopy: "コピー",
  cardCopied: "コピー済み",
  cardCopiedCodeToast: (title) => `${title} のコードをコピーしました`,
  cardCopiedLinkToast: (id) => `#${id} のリンクをコピーしました`,
  cardCopyAnchorTooltip: (id) => `#${id} のリンクをコピー`,
  cardCopyAnchorAria: (title) => `${title} のリンクをコピー`,
  cardViewSwitchAria: (title) => `${title} 表示切り替え`,
  propColName: "プロパティ",
  propColType: "型",
  propColDefault: "既定値",
  propColDesc: "説明",
};

const AR_SA: PlaygroundStrings = {
  docTitle: "m3eui · مكتبة مكونات Material 3 Expressive لـ React",
  skipToMain: "تخطي إلى المحتوى الرئيسي",
  openNavDrawer: "فتح درج فهرس المكونات",
  searchPlaceholder: "ابحث عن مكون (Button, DatePicker, Tabs)…",
  searchAriaLabel: "البحث في المكونات",
  languageLabel: "اللغة",
  colorModeLabel: "وضع المظهر",
  modeLight: "فاتح",
  modeDark: "داكن",
  modeSystem: "تلقائي",
  contrastStandard: "قياسي 0",
  contrastMedium: "متوسط +0.5",
  contrastHigh: "عالٍ +1.0",
  themePopoverTitle: "إعدادات السمة",
  themeButton: "السمة",
  studioButton: "الاستوديو",
  studioTitle: "استوديو السمة والحركة",
  seedPresetsLabel: "ألوان بذرة HCT",
  seedCustom: "مخصص",
  seedCustomAria: "لون بذرة مخصص",
  seedPurple: "أرجواني تعبيري",
  seedJade: "أخضر زمردي",
  seedOcean: "أزرق بحري",
  seedVermilion: "قرمزي",
  seedRose: "وردي داكن",
  schemeStyleLabel: "نمط اللوحة",
  schemeSelectLabel: "متغير المخطط (AOSP 9 Schemes)",
  specVersionLabel: "إصدار مواصفات AOSP Monet",
  contrastLabel: "التباين",
  colorAndContrastLegend: "الألوان والتباين",
  langAndDirLegend: "اللغة والاتجاه",
  writingDirLabel: "اتجاه الكتابة",
  autoDirLabel: (dir) => `تلقائي (${dir})`,
  motionAndDebugLegend: "الحركة والفحص",
  expressiveSpringLabel: "نابض Expressive",
  standardSpringLabel: "نابض قياسي",
  slowMotionLabel: "بطيء 0.25x",
  normalSpeedLabel: "سرعة 1x",
  geometryRulerLabel: "مؤشر الهندسة",
  copyM3eJson: "نسخ m3e.json",
  copiedM3eJsonToast: "تم نسخ m3e.json",
  done: "تم",
  mobileNavAria: "فهرس المكونات للجوال",
  mobileNavHeadline: "فهرس مكونات m3eui",
  sidebarHeading: "دليل المكونات",
  heroTitle: "مكتبة Material 3 Expressive لـ React",
  heroDesc:
    "تتضمن محرك ألوان AOSP Monet SPEC_2025 الديناميكي، وفيزياء النوابض التحليلية، و35 مضلعاً متحولاً، ودعماً كاملاً للتدويل واتجاه RTL.",
  quickStartBtn: "البدء السريع",
  openStudioBtn: "استوديو السمة",
  compositeSuiteBtn: "المكونات المركبة",
  switchPolygonTooltip: "تبديل الشكل المضلع",
  quickStudioBarAria: "شريط التحكم السريع بالسمة والفيزياء",
  backToTop: "العودة للأعلى ↑",
  navGroups: [
    "البدء والإعداد",
    "الإجراءات وأشرطة الأدوات",
    "عناصر النماذج",
    "عرض البيانات والحاويات",
    "التنقل والقوائم",
    "الطبقات والتغذية الراجعة",
    "المكونات المركبة",
  ],
  cardPreviewTab: "معاينة",
  cardCodeTab: "الكود",
  cardCopy: "نسخ",
  cardCopied: "تم النسخ",
  cardCopiedCodeToast: (title) => `تم نسخ كود ${title}`,
  cardCopiedLinkToast: (id) => `تم نسخ الرابط #${id}`,
  cardCopyAnchorTooltip: (id) => `نسخ رابط #${id}`,
  cardCopyAnchorAria: (title) => `نسخ رابط ${title}`,
  cardViewSwitchAria: (title) => `تبديل عرض ${title}`,
  propColName: "الخاصية",
  propColType: "النوع",
  propColDefault: "الافتراضي",
  propColDesc: "الوصف",
};

export function resolvePlaygroundStrings(locale: string): PlaygroundStrings {
  const lang = locale.trim().split(/[-_]/)[0]?.toLowerCase();
  if (lang === "zh") return ZH_CN;
  if (lang === "ja") return JA_JP;
  if (lang === "ar") return AR_SA;
  return EN_US;
}

export function usePlaygroundStrings(): PlaygroundStrings {
  const { locale } = useM3EI18n();
  return resolvePlaygroundStrings(locale);
}

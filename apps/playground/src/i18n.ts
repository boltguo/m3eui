import { useM3EI18n } from "m3eui";

export type LocalizedCopy =
  | string
  | {
      readonly zh: string;
      readonly en: string;
    };

export function resolveCopy(locale: string, copy: LocalizedCopy): string {
  if (typeof copy === "string") {
    return copy;
  }
  const lang = locale.trim().split(/[-_]/)[0]?.toLowerCase();
  return lang === "zh" ? copy.zh : copy.en;
}

export interface PlaygroundStrings {
  readonly docTitle: string;
  readonly skipToMain: string;
  readonly openNavDrawer: string;
  readonly primaryNavAria: string;
  readonly navHome: string;
  readonly navDocs: string;
  readonly navComponents: string;
  readonly navBlocks: string;
  readonly searchBtnLabel: string;
  readonly searchPlaceholder: string;
  readonly searchAriaLabel: string;
  readonly languageLabel: string;
  readonly colorModeLabel: string;
  readonly githubTooltip: string;
  readonly modeLight: string;
  readonly modeDark: string;
  readonly modeSystem: string;
  readonly contrastStandard: string;
  readonly contrastMedium: string;
  readonly contrastHigh: string;
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
  readonly schemeSelectLabel: string;
  readonly contrastLabel: string;
  readonly colorAndContrastLegend: string;
  readonly langAndDirLegend: string;
  readonly writingDirLabel: string;
  readonly autoDirLabel: (dir: string) => string;
  readonly motionAndDebugLegend: string;
  readonly expressiveSpringLabel: string;
  readonly slowMotionLabel: string;
  readonly geometryRulerLabel: string;
  readonly copyM3eJson: string;
  readonly copiedM3eJsonToast: string;
  readonly done: string;
  readonly mobileNavAria: string;
  readonly mobileNavHeadline: string;
  readonly heroTitle: string;
  readonly heroDesc: string;
  readonly browseComponentsBtn: string;
  readonly browseBlocksBtn: string;
  readonly readDocsBtn: string;
  readonly openStudioBtn: string;
  readonly switchPolygonTooltip: string;
  readonly backToTop: string;
  readonly cardPreviewTab: string;
  readonly cardCodeTab: string;
  readonly showCode: string;
  readonly hideCode: string;
  readonly cardCopy: string;
  readonly cardCopied: string;
  readonly cardCopiedCodeToast: (title: string) => string;
  readonly cardCopiedLinkToast: (id: string) => string;
  readonly copyImportAria: (title: string) => string;
  readonly sectionsAria: (title: string) => string;
  readonly componentPaginationAria: string;
  readonly docsPaginationAria: string;
  readonly designToc: {
    readonly provenance: string;
    readonly rationale: string;
    readonly geometry: string;
    readonly invariants: string;
    readonly porting: string;
    readonly references: string;
  };
  readonly propColName: string;
  readonly propColType: string;
  readonly propColDefault: string;
  readonly propColDesc: string;
  readonly propRequired: string;
  readonly examplesHeading: string;
  readonly apiHeading: string;
  readonly docTabUsage: string;
  readonly docTabDesign: string;
  readonly copiedDesignSpecToast: (title: string) => string;
  readonly onThisPage: string;
  readonly importHeading: string;
  readonly prevPage: string;
  readonly nextPage: string;
  readonly filterComponentsPlaceholder: string;
  readonly viewportDesktop: string;
  readonly viewportTablet: string;
  readonly viewportMobile: string;
  readonly resetDemo: string;
  readonly openFullscreen: string;
  readonly closeFullscreen: string;
  readonly browseAllBlocks: string;
  readonly copiedCliToast: (cmd: string) => string;
  readonly componentCategories: {
    readonly actions: string;
    readonly inputs: string;
    readonly selection: string;
    readonly display: string;
    readonly feedback: string;
    readonly navigation: string;
  };
  readonly blockCategories: {
    readonly featured: string;
    readonly dashboard: string;
    readonly sidebar: string;
    readonly auth: string;
    readonly settings: string;
    readonly ai: string;
  };
  readonly cmdGroups: {
    readonly pages: string;
    readonly docs: string;
    readonly components: string;
    readonly blocks: string;
  };
}

const ZH_CN: PlaygroundStrings = {
  docTitle: "m3eui · Material 3 Expressive React 组件库",
  skipToMain: "跳至主内容",
  openNavDrawer: "打开站点导航菜单",
  primaryNavAria: "站点主导航",
  navHome: "概览",
  navDocs: "指南",
  navComponents: "组件",
  navBlocks: "Blocks",
  searchBtnLabel: "搜索文档与组件…",
  searchPlaceholder: "搜索指南、组件或区块模板…",
  searchAriaLabel: "全站快速检索",
  languageLabel: "语言",
  colorModeLabel: "明暗模式",
  githubTooltip: "查看 GitHub 仓库",
  modeLight: "浅色",
  modeDark: "深色",
  modeSystem: "跟随系统",
  contrastStandard: "标准 0",
  contrastMedium: "中对比 +0.5",
  contrastHigh: "高对比 +1.0",
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
  schemeSelectLabel: "调色板变体 (AOSP 9 Schemes)",
  contrastLabel: "对比度",
  colorAndContrastLegend: "色彩与对比度",
  langAndDirLegend: "语言与方向",
  writingDirLabel: "书写方向",
  autoDirLabel: (dir) => `自动 (${dir})`,
  motionAndDebugLegend: "动效与调试",
  expressiveSpringLabel: "弹性物理弹簧 (Expressive)",
  slowMotionLabel: "0.25x 慢动作物理观测",
  geometryRulerLabel: "几何外框标尺 HUD",
  copyM3eJson: "复制 m3e.json",
  copiedM3eJsonToast: "已复制 m3e.json 配置",
  done: "完成",
  mobileNavAria: "移动端站点目录",
  mobileNavHeadline: "m3eui 导航目录",
  heroTitle: "Material 3 Expressive React 组件库",
  heroDesc:
    "源自 Android 源码的弹簧物理、形状形变与动态色彩，构建于 Base UI 之上。",
  browseComponentsBtn: "浏览组件",
  browseBlocksBtn: "探索 Blocks",
  readDocsBtn: "阅读指南",
  openStudioBtn: "主题工作台",
  switchPolygonTooltip: "切换多边形",
  backToTop: "返回顶部 ↑",
  cardPreviewTab: "预览",
  cardCodeTab: "代码",
  showCode: "查看代码",
  hideCode: "收起代码",
  cardCopy: "复制",
  cardCopied: "已复制",
  cardCopiedCodeToast: (title) => `已复制「${title}」代码`,
  cardCopiedLinkToast: (id) => `已复制锚点链接 #${id}`,
  copyImportAria: (title) => `复制 ${title} 引入语句`,
  sectionsAria: (title) => `${title} 文档分区`,
  componentPaginationAria: "组件翻页导航",
  docsPaginationAria: "文档翻页导航",
  designToc: {
    provenance: "规范溯源",
    rationale: "设计考量",
    geometry: "几何与动效契约",
    invariants: "状态与无障碍契约",
    porting: "跨语言移植蓝图",
    references: "参考规范",
  },
  propColName: "属性",
  propColType: "类型",
  propColDefault: "默认值",
  propColDesc: "说明",
  propRequired: "必填",
  examplesHeading: "代码演示",
  apiHeading: "API 参考",
  docTabUsage: "演示与 API",
  docTabDesign: "设计规范",
  copiedDesignSpecToast: (title) => `已复制 ${title} 设计规格 (Markdown)`,
  onThisPage: "本页目录",
  importHeading: "引入方式",
  prevPage: "上一篇",
  nextPage: "下一篇",
  filterComponentsPlaceholder: "筛选组件…",
  viewportDesktop: "桌面 100%",
  viewportTablet: "平板 768px",
  viewportMobile: "手机 390px",
  resetDemo: "重置演示状态",
  openFullscreen: "全屏预览",
  closeFullscreen: "退出全屏",
  browseAllBlocks: "全部区块",
  copiedCliToast: (cmd) => `已复制命令：${cmd}`,
  componentCategories: {
    actions: "动作与按钮",
    inputs: "表单与录入",
    selection: "选择与滑动",
    display: "数据展示",
    feedback: "反馈与浮层",
    navigation: "导航与菜单",
  },
  blockCategories: {
    featured: "精选",
    dashboard: "仪表盘",
    sidebar: "侧边栏布局",
    auth: "登录与注册",
    settings: "设置中心",
    ai: "AI 工作台",
  },
  cmdGroups: {
    pages: "站点页面",
    docs: "开发指南",
    components: "基础组件",
    blocks: "区块模板 (Blocks)",
  },
};

const EN_US: PlaygroundStrings = {
  docTitle: "m3eui · Material 3 Expressive React Component Library",
  skipToMain: "Skip to main content",
  openNavDrawer: "Open site navigation menu",
  primaryNavAria: "Primary navigation",
  navHome: "Overview",
  navDocs: "Docs",
  navComponents: "Components",
  navBlocks: "Blocks",
  searchBtnLabel: "Search docs & components…",
  searchPlaceholder: "Search guides, components, or blocks…",
  searchAriaLabel: "Global search",
  languageLabel: "Language",
  colorModeLabel: "Color mode",
  githubTooltip: "View on GitHub",
  modeLight: "Light",
  modeDark: "Dark",
  modeSystem: "System",
  contrastStandard: "Standard 0",
  contrastMedium: "Medium +0.5",
  contrastHigh: "High +1.0",
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
  schemeSelectLabel: "Scheme variant (AOSP 9 Schemes)",
  contrastLabel: "Contrast",
  colorAndContrastLegend: "Color & Contrast",
  langAndDirLegend: "Locale & Direction",
  writingDirLabel: "Writing direction",
  autoDirLabel: (dir) => `Auto (${dir})`,
  motionAndDebugLegend: "Motion & Inspection",
  expressiveSpringLabel: "Expressive physics spring",
  slowMotionLabel: "0.25x slow-motion inspection",
  geometryRulerLabel: "Geometry ruler HUD",
  copyM3eJson: "Copy m3e.json",
  copiedM3eJsonToast: "Copied m3e.json config",
  done: "Done",
  mobileNavAria: "Mobile site navigation",
  mobileNavHeadline: "m3eui Navigation",
  heroTitle: "Material 3 Expressive for React",
  heroDesc:
    "Spring physics, shape morphing, and dynamic color ported from the Android source, built on Base UI.",
  browseComponentsBtn: "Browse Components",
  browseBlocksBtn: "Explore Blocks",
  readDocsBtn: "Read Docs",
  openStudioBtn: "Theme Studio",
  switchPolygonTooltip: "Cycle polygon shape",
  backToTop: "Back to top ↑",
  cardPreviewTab: "Preview",
  cardCodeTab: "Code",
  showCode: "Show code",
  hideCode: "Hide code",
  cardCopy: "Copy",
  cardCopied: "Copied",
  cardCopiedCodeToast: (title) => `Copied "${title}" code`,
  cardCopiedLinkToast: (id) => `Copied anchor #${id}`,
  copyImportAria: (title) => `Copy ${title} import statement`,
  sectionsAria: (title) => `${title} documentation sections`,
  componentPaginationAria: "Component pagination",
  docsPaginationAria: "Documentation pagination",
  designToc: {
    provenance: "Provenance & Sources",
    rationale: "Inspiration & Rationale",
    geometry: "Geometry & Motion Contract",
    invariants: "State & A11y Invariants",
    porting: "Cross-Language Blueprint",
    references: "References",
  },
  propColName: "Prop",
  propColType: "Type",
  propColDefault: "Default",
  propColDesc: "Description",
  propRequired: "Required",
  examplesHeading: "Examples",
  apiHeading: "API Reference",
  docTabUsage: "Usage & API",
  docTabDesign: "Design",
  copiedDesignSpecToast: (title) => `Copied ${title} design spec (Markdown)`,
  onThisPage: "On This Page",
  importHeading: "Import",
  prevPage: "Previous",
  nextPage: "Next",
  filterComponentsPlaceholder: "Filter components…",
  viewportDesktop: "Desktop 100%",
  viewportTablet: "Tablet 768px",
  viewportMobile: "Mobile 390px",
  resetDemo: "Reset block state",
  openFullscreen: "Fullscreen preview",
  closeFullscreen: "Close fullscreen",
  browseAllBlocks: "All blocks",
  copiedCliToast: (cmd) => `Copied command: ${cmd}`,
  componentCategories: {
    actions: "Actions & Buttons",
    inputs: "Inputs & Forms",
    selection: "Selection & Sliders",
    display: "Data Display",
    feedback: "Feedback & Overlays",
    navigation: "Navigation & Menus",
  },
  blockCategories: {
    featured: "Featured",
    dashboard: "Dashboard",
    sidebar: "Sidebar",
    auth: "Login & Signup",
    settings: "Settings",
    ai: "AI Workspace",
  },
  cmdGroups: {
    pages: "Pages",
    docs: "Documentation",
    components: "Components",
    blocks: "Blocks",
  },
};

const JA_JP: PlaygroundStrings = {
  docTitle: "m3eui · Material 3 Expressive React コンポーネントライブラリ",
  skipToMain: "メインコンテンツへ移動",
  openNavDrawer: "ナビゲーションを開く",
  primaryNavAria: "メインナビゲーション",
  navHome: "概要",
  navDocs: "ガイド",
  navComponents: "コンポーネント",
  navBlocks: "Blocks",
  searchBtnLabel: "ドキュメントとコンポーネントを検索…",
  searchPlaceholder: "ガイド、コンポーネント、Blocks を検索…",
  searchAriaLabel: "サイト内検索",
  languageLabel: "言語",
  colorModeLabel: "カラーモード",
  githubTooltip: "GitHub リポジトリを表示",
  modeLight: "ライト",
  modeDark: "ダーク",
  modeSystem: "システム",
  contrastStandard: "標準 0",
  contrastMedium: "中コントラスト +0.5",
  contrastHigh: "高コントラスト +1.0",
  studioButton: "スタジオ",
  studioTitle: "テーマ・モーションスタジオ",
  seedPresetsLabel: "HCT シードカラープリセット",
  seedCustom: "カスタム",
  seedCustomAria: "カスタムシードカラー",
  seedPurple: "Expressive アイリス",
  seedJade: "ジェイドティール",
  seedOcean: "ベイブルー",
  seedVermilion: "バーミリオン",
  seedRose: "ローズウッド",
  schemeSelectLabel: "スキームバリアント (AOSP 9 Schemes)",
  contrastLabel: "コントラスト",
  colorAndContrastLegend: "カラーとコントラスト",
  langAndDirLegend: "ロケールと書字方向",
  writingDirLabel: "書字方向",
  autoDirLabel: (dir) => `自動 (${dir})`,
  motionAndDebugLegend: "モーションとデバッグ",
  expressiveSpringLabel: "Expressive 物理スプリング",
  slowMotionLabel: "0.25x スローモーション検証",
  geometryRulerLabel: "ジオメトリルーラー HUD",
  copyM3eJson: "m3e.json をコピー",
  copiedM3eJsonToast: "m3e.json 設定をコピーしました",
  done: "完了",
  mobileNavAria: "モバイルナビゲーション",
  mobileNavHeadline: "m3eui ナビゲーション",
  heroTitle: "Material 3 Expressive React ライブラリ",
  heroDesc:
    "Android ソース由来のスプリング物理、シェイプモーフィング、ダイナミックカラー。Base UI 上に構築。",
  browseComponentsBtn: "コンポーネント一覧",
  browseBlocksBtn: "Blocks を探索",
  readDocsBtn: "ガイドを読む",
  openStudioBtn: "テーマスタジオ",
  switchPolygonTooltip: "ポリゴン形状を切り替え",
  backToTop: "トップへ戻る ↑",
  cardPreviewTab: "プレビュー",
  cardCodeTab: "コード",
  showCode: "コードを表示",
  hideCode: "コードを隠す",
  cardCopy: "コピー",
  cardCopied: "コピー済み",
  cardCopiedCodeToast: (title) => `「${title}」のコードをコピーしました`,
  cardCopiedLinkToast: (id) => `アンカー #${id} をコピーしました`,
  copyImportAria: (title) => `${title} のインポート文をコピー`,
  sectionsAria: (title) => `${title} ドキュメントセクション`,
  componentPaginationAria: "コンポーネントページ送り",
  docsPaginationAria: "ドキュメントページ送り",
  designToc: {
    provenance: "仕様の出典",
    rationale: "設計意図",
    geometry: "ジオメトリとモーション",
    invariants: "状態とアクセシビリティ",
    porting: "マルチプラットフォーム指針",
    references: "リファレンス",
  },
  propColName: "プロパティ",
  propColType: "型",
  propColDefault: "既定値",
  propColDesc: "説明",
  propRequired: "必須",
  examplesHeading: "使用例",
  apiHeading: "API リファレンス",
  docTabUsage: "使用例・API",
  docTabDesign: "デザイン仕様",
  copiedDesignSpecToast: (title) => `${title} のデザイン仕様 (Markdown) をコピーしました`,
  onThisPage: "目次",
  importHeading: "インポート",
  prevPage: "前へ",
  nextPage: "次へ",
  filterComponentsPlaceholder: "コンポーネントを絞り込む…",
  viewportDesktop: "デスクトップ 100%",
  viewportTablet: "タブレット 768px",
  viewportMobile: "モバイル 390px",
  resetDemo: "ブロック状態をリセット",
  openFullscreen: "全画面プレビュー",
  closeFullscreen: "全画面を閉じる",
  browseAllBlocks: "すべてのブロック",
  copiedCliToast: (cmd) => `コマンドをコピーしました: ${cmd}`,
  componentCategories: {
    actions: "アクション・ボタン",
    inputs: "フォーム入力",
    selection: "選択・スライダー",
    display: "データ表示",
    feedback: "フィードバック・オーバーレイ",
    navigation: "ナビゲーション・メニュー",
  },
  blockCategories: {
    featured: "注目",
    dashboard: "ダッシュボード",
    sidebar: "サイドバー",
    auth: "認証・登録",
    settings: "設定",
    ai: "AI ワークスペース",
  },
  cmdGroups: {
    pages: "ページ",
    docs: "ドキュメント",
    components: "コンポーネント",
    blocks: "Blocks",
  },
};

const AR_SA: PlaygroundStrings = {
  docTitle: "m3eui · مكتبة مكونات Material 3 Expressive لـ React",
  skipToMain: "تخطي إلى المحتوى الرئيسي",
  openNavDrawer: "فتح قائمة التنقل",
  primaryNavAria: "التنقل الرئيسي",
  navHome: "نظرة عامة",
  navDocs: "الدليل",
  navComponents: "المكونات",
  navBlocks: "Blocks",
  searchBtnLabel: "ابحث في المكونات والوثائق…",
  searchPlaceholder: "ابحث في الأدلة أو المكونات أو القوالب…",
  searchAriaLabel: "بحث شامل",
  languageLabel: "اللغة",
  colorModeLabel: "وضع المظهر",
  githubTooltip: "عرض مستودع GitHub",
  modeLight: "فاتح",
  modeDark: "داكن",
  modeSystem: "النظام",
  contrastStandard: "قياسي 0",
  contrastMedium: "متوسط +0.5",
  contrastHigh: "مرتفع +1.0",
  studioButton: "الاستوديو",
  studioTitle: "استوديو السمة والحركة",
  seedPresetsLabel: "ألوان بذور HCT الجاهزة",
  seedCustom: "مخصص",
  seedCustomAria: "لون بذرة مخصص",
  seedPurple: "أرجواني تعبيري",
  seedJade: "أخضر يشمي",
  seedOcean: "أزرق محيطي",
  seedVermilion: "قرمزي",
  seedRose: "وردي داكن",
  schemeSelectLabel: "نمط اللوحة اللونية (9 أنماط AOSP)",
  contrastLabel: "التباين",
  colorAndContrastLegend: "الألوان والتباين",
  langAndDirLegend: "اللغة والاتجاه",
  writingDirLabel: "اتجاه الكتابة",
  autoDirLabel: (dir) => `تلقائي (${dir})`,
  motionAndDebugLegend: "الحركة والفحص",
  expressiveSpringLabel: "نوابض فيزيائية تعبيرية",
  slowMotionLabel: "فحص بالحركة البطيئة 0.25x",
  geometryRulerLabel: "مسطرة الحدود الهندسية",
  copyM3eJson: "نسخ m3e.json",
  copiedM3eJsonToast: "تم نسخ إعدادات m3e.json",
  done: "تم",
  mobileNavAria: "التنقل عبر الجوال",
  mobileNavHeadline: "تنقل m3eui",
  heroTitle: "مكتبة Material 3 Expressive لـ React",
  heroDesc:
    "فيزياء نابضية وتحوّل أشكال وألوان ديناميكية منقولة من مصدر Android، مبنية على Base UI.",
  browseComponentsBtn: "تصفح المكونات",
  browseBlocksBtn: "استكشاف القوالب",
  readDocsBtn: "قراءة الدليل",
  openStudioBtn: "استوديو السمة",
  switchPolygonTooltip: "تبديل شكل المضلع",
  backToTop: "العودة إلى الأعلى ↑",
  cardPreviewTab: "معاينة",
  cardCodeTab: "الكود",
  showCode: "عرض الكود",
  hideCode: "إخفاء الكود",
  cardCopy: "نسخ",
  cardCopied: "تم النسخ",
  cardCopiedCodeToast: (title) => `تم نسخ كود "${title}"`,
  cardCopiedLinkToast: (id) => `تم نسخ الرابط #${id}`,
  copyImportAria: (title) => `نسخ عبارة استيراد ${title}`,
  sectionsAria: (title) => `أقسام توثيق ${title}`,
  componentPaginationAria: "التنقل بين المكونات",
  docsPaginationAria: "التنقل بين صفحات الدليل",
  designToc: {
    provenance: "المصدر والمرجعية",
    rationale: "فلسفة التصميم",
    geometry: "الأبعاد والحركة",
    invariants: "الحالات وإمكانية الوصول",
    porting: "دليل النقل متعدد المنصات",
    references: "المراجع المعتمدة",
  },
  propColName: "الخاصية",
  propColType: "النوع",
  propColDefault: "الافتراضي",
  propColDesc: "الوصف",
  propRequired: "مطلوب",
  examplesHeading: "أمثلة الاستخدام",
  apiHeading: "مرجع API",
  docTabUsage: "الاستخدام و API",
  docTabDesign: "مواصفات التصميم",
  copiedDesignSpecToast: (title) => `تم نسخ مواصفات تصميم ${title} (Markdown)`,
  onThisPage: "في هذه الصفحة",
  importHeading: "الاستيراد",
  prevPage: "السابق",
  nextPage: "التالي",
  filterComponentsPlaceholder: "تصفية المكونات…",
  viewportDesktop: "سطح المكتب 100%",
  viewportTablet: "جهاز لوحي 768px",
  viewportMobile: "هاتف 390px",
  resetDemo: "إعادة تعيين حالة القالب",
  openFullscreen: "معاينة بملء الشاشة",
  closeFullscreen: "إغلاق ملء الشاشة",
  browseAllBlocks: "جميع القوالب",
  copiedCliToast: (cmd) => `تم نسخ الأمر: ${cmd}`,
  componentCategories: {
    actions: "الإجراءات والأزرار",
    inputs: "حقول الإدخال",
    selection: "الاختيار والمنزلقات",
    display: "عرض البيانات",
    feedback: "التنبيهات والطبقات",
    navigation: "التنقل والقوائم",
  },
  blockCategories: {
    featured: "مميز",
    dashboard: "لوحة التحكم",
    sidebar: "الشريط الجانبي",
    auth: "تسجيل الدخول",
    settings: "الإعدادات",
    ai: "مساحة الذكاء الاصطناعي",
  },
  cmdGroups: {
    pages: "الصفحات",
    docs: "الوثائق",
    components: "المكونات",
    blocks: "القوالب",
  },
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

export function useCopyResolver(): (copy: LocalizedCopy) => string {
  const { locale } = useM3EI18n();
  return (copy: LocalizedCopy) => resolveCopy(locale, copy);
}

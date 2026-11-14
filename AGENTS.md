# AGENTS.md

## Development Requirements

When developing `m3eui` and its playground, follow all of the following roles and standards:

- **Senior Product Manager**: Plan component scope, API ergonomics, playground information architecture, and onboarding (`m3e.json` + CLI). Prioritize real UI problems and avoid low-value props, redundant variants, and unnecessary complexity.
- **Google Design Expert**: Follow Material 3 Expressive (M3E / 2025 AOSP Monet) principles across HCT dynamic color, spatial and effects spring physics, corner/shape morphing (`MaterialShapes`), typography, and elevation. Build playground pages and demos with `m3eui` components and `--m3e-*` tokens, keeping experiences intuitive, concise, and consistent.
- **Senior React & Web Platform Engineer**: Build headless behavior and accessibility on `@base-ui/react`, modern CSS (`@layer m3e.tokens, m3e.base, m3e.components`, `light-dark()`, CSS logical properties), and strict ESM TypeScript boundaries. Keep runtime boundaries clean (`src/cli` for `node:*` I/O, `src/tokens` pure and RSC-safe, UI modules SSR/CSR-compatible) and extract shared hooks or token helpers only when genuinely reused.
- **Enterprise-Grade Open-Source Standards**: Code must be clear, reliable, maintainable, tree-shakeable, and testable. Avoid overengineering, ineffective abstractions, duplicate implementations, verbose comments, and unnecessary runtime dependencies (`@base-ui/react` remains the sole runtime dependency of `packages/m3eui`).
- **Implementation Principles**: Use the simplest implementation possible while preserving correctness, accessibility, security (CSP/SSR safety), and maintainability. Do not add code with no practical value merely for the sake of “completeness.”
- **Documentation and Copy**: Communicate concisely, efficiently, and precisely. Avoid explanatory prose, repetition, and unnecessary background, and keep `README.md` and `README.zh-CN.md` aligned when public APIs, subpath exports, or CLI commands change.
- **Git Commits**: Follow the Angular / Conventional Commits convention. Use explicit types such as `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `ci: ...`, and `chore: ...`. Commit messages must briefly describe the change and must not use vague or meaningless titles.

## No Overengineering

Applies to implementation, reviews, and fixes.

- Fix only problems with a concrete trigger and real impact. Do not design for hypothetical browser, bundler, or input scenarios without evidence from code, tests, logs, or platform specifications.
- Before adding a safeguard, check what existing code (`@base-ui/react` primitives, TypeScript types, CSS cascade layers, `M3EProvider`) already guarantees. Do not duplicate protection that is already in place.
- Optimize only hot paths (such as per-frame spring loops, pointer/scroll handlers, and dynamic token synthesis). Do not add caches, memoization noise, or indirection to cold paths that run only at mount, config load, or CLI execution.
- Match state and concurrency to the actual React and DOM lifecycle. Do not introduce global stores or per-instance registries where React state, refs, context, or CSS custom properties suffice.
- Reuse the codebase's existing solution for the same problem before inventing a new mechanism.
- When a fix costs more than the risk it removes, accept or document the risk instead.

## UI/UX & Copy

Applies to components, playground pages, demos, blocks, docs, and comments.

- Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.
- Invest effort in UI/UX craft (visual hierarchy, spacing, alignment, affordances, and spring motion) rather than writing instruction manuals inside the interface.
- Do not pad headers, cards, forms, or demos with redundant subtitles, eyebrow badges, helper captions, or self-explanatory blurbs. If an interface needs text to explain how it works, fix the layout and interaction instead.
- Never write explanatory prose, filler, marketing copy, or internal spec essays in UI, documentation, or code comments.

## m3eui Constraints

### For Users

- Adoption must stay simple (`npx m3eui init` + `<M3EProvider>`), allowing developers to get started and ship interfaces immediately.
- Playground pages (`apps/playground`) must be intuitive, presenting interactive live previews and core capabilities directly.
- API tables, token specs, and advanced Theme Studio controls belong in their dedicated sections or sheets and must not crowd primary showcase views.
- Configuration (`m3e.json` and component props) must stay minimal. Do not require manual setup for anything `m3eui` can compute or infer automatically (HCT tonal palettes, `light-dark()` variables, BCP 47 locale resolution, RTL direction, `prefers-reduced-motion`).
- Minimize required props, wrapper boilerplate, and unnecessary configuration steps.
- Defaults (`#6750A4`, `expressive` color and motion, `2025` spec, `system` color mode, `auto` direction) must cover most consumers. Expose advanced overrides only when genuinely needed.

### For the Library

- Keep public exports, subpath entrypoints, component props, and CLI commands small, stable, and orthogonal. Growth in internal token math, hooks, or playground helpers must not automatically result in new public exports.
- Prefer composing and extending existing `@base-ui/react` primitives, `m3eui` components, hooks, and `--m3e-*` CSS custom properties. Add a new public component or export only when existing primitives cannot cleanly express a distinct M3E pattern, accessibility contract, or bundle boundary.
- Preserve strict i18n and RTL compliance: zero hardcoded CJK characters outside `packages/m3eui/src/i18n/locales`, zero hardcoded UI string literals (`aria-label`, `aria-roledescription`, `aria-valuetext`, `placeholder`, `alt`) in `packages/m3eui/src/components`, and 100% key and `{param}` placeholder parity across all built-in locale packs.
- Keep `m3e.json`, `packages/m3eui/m3e.schema.json`, and generated theme CSS (`pnpm m3e:sync`) synchronized.
- Do not blur module boundaries (`packages/m3eui` library vs. `apps/playground` showcase, browser-safe UI/tokens vs. Node-only `src/cli`) merely for convenience.
- Verify changes with `pnpm build`, `pnpm m3e:doctor`, `pnpm typecheck`, and `pnpm test`.

import { createHighlighterCore, type HighlighterCore, type ThemedToken } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import githubDarkDefault from "shiki/themes/github-dark-default.mjs";
import githubLightDefault from "shiki/themes/github-light-default.mjs";

export type SupportedCodeLang = "tsx" | "ts" | "bash" | "sh" | "json" | "css";

let highlighterInstance: HighlighterCore | null = null;
let highlighterPromise: Promise<HighlighterCore> | null = null;

const TOKEN_CACHE = new Map<string, readonly (readonly ThemedToken[])[]>();

function normalizeLang(lang: SupportedCodeLang): "tsx" | "bash" | "json" | "css" {
  if (lang === "ts" || lang === "tsx") return "tsx";
  if (lang === "sh" || lang === "bash") return "bash";
  if (lang === "json") return "json";
  return "css";
}

export function getCachedTokens(
  code: string,
  lang: SupportedCodeLang,
): readonly (readonly ThemedToken[])[] | null {
  const normalized = normalizeLang(lang);
  const cacheKey = `${normalized}\u0000${code}`;
  const existing = TOKEN_CACHE.get(cacheKey);
  if (existing) return existing;

  if (!highlighterInstance) return null;

  const result = highlighterInstance.codeToTokens(code, {
    lang: normalized,
    themes: {
      light: "github-light-default",
      dark: "github-dark-default",
    },
    defaultColor: false,
  });
  TOKEN_CACHE.set(cacheKey, result.tokens);
  return result.tokens;
}

export async function ensureShikiHighlighter(): Promise<HighlighterCore> {
  if (highlighterInstance) return highlighterInstance;
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLightDefault, githubDarkDefault],
      langs: [tsx, bash, json, css],
      engine: createJavaScriptRegexEngine(),
    }).then((instance) => {
      highlighterInstance = instance;
      return instance;
    });
  }
  return highlighterPromise;
}

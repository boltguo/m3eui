import * as React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { M3EProvider } from "m3eui";
import { generateM3EThemeTokens } from "m3eui/tokens";
import m3eProjectConfig from "../../../m3e.json";
import { SiteLayout } from "./layout/SiteLayout";
import { HomePage } from "./pages/HomePage";

const BlocksPage = React.lazy(() =>
  import("./pages/BlocksPage").then((m) => ({ default: m.BlocksPage })),
);
const ComponentsPage = React.lazy(() =>
  import("./pages/ComponentsPage").then((m) => ({ default: m.ComponentsPage })),
);
const DocsPage = React.lazy(() =>
  import("./pages/DocsPage").then((m) => ({ default: m.DocsPage })),
);

function RedirectToBlocks() {
  const { hash } = useLocation();
  return <Navigate to={`/blocks${hash}`} replace />;
}

export function App(): React.JSX.Element {
  return (
    <M3EProvider autoContrast config={m3eProjectConfig} themeEngine={generateM3EThemeTokens}>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="docs/:slug" element={<DocsPage />} />
            <Route path="components" element={<ComponentsPage />} />
            <Route path="components/:slug" element={<ComponentsPage />} />
            <Route path="composites" element={<RedirectToBlocks />} />
            <Route path="composites/:slug" element={<RedirectToBlocks />} />
            <Route path="blocks" element={<BlocksPage />} />
            <Route path="blocks/:category" element={<RedirectToBlocks />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </M3EProvider>
  );
}

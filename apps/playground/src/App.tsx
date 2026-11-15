import * as React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { type M3EConfig, M3EProvider } from "m3eui";
import m3eProjectConfig from "../../../m3e.json";
import { SiteLayout } from "./layout/SiteLayout";
import { BlocksPage } from "./pages/BlocksPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { DocsPage } from "./pages/DocsPage";
import { HomePage } from "./pages/HomePage";

function RedirectToBlocks() {
  const { hash } = useLocation();
  return <Navigate to={`/blocks${hash}`} replace />;
}

export function App(): React.JSX.Element {
  return (
    <M3EProvider config={m3eProjectConfig as M3EConfig}>
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

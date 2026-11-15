"use client";

import * as React from "react";

export const M3EPortalContext = React.createContext<
  HTMLElement | null | undefined
>(undefined);

export interface M3EPortalProps {
  readonly container: HTMLElement | null | undefined;
  readonly children: React.ReactNode;
}

export function M3EPortal({
  container,
  children,
}: M3EPortalProps): React.JSX.Element {
  return (
    <M3EPortalContext.Provider value={container}>
      {children}
    </M3EPortalContext.Provider>
  );
}

export function useM3EPortalContainer(): HTMLElement | null | undefined {
  return React.useContext(M3EPortalContext);
}

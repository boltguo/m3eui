import * as React from "react";

export type FabElevation = "default" | "lowered" | "none";

export const FabElevationContext = React.createContext<FabElevation | undefined>(undefined);

import * as React from "react";
import type {
  CornerTuple,
} from "../tokens/topology.js";

export interface ButtonGroupItemContextValue {
  readonly cornerOverride?: CornerTuple;
  readonly onPressChange?: (pressed: boolean) => void;
}

export const ButtonGroupItemContext =
  React.createContext<ButtonGroupItemContextValue | null>(null);

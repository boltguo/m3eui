import * as React from "react";

export const INERT_TRUE: boolean = (
  parseInt(React.version, 10) >= 19 ? true : ""
) as unknown as boolean;

export function inertProp(active: boolean): boolean | undefined {
  return active ? INERT_TRUE : undefined;
}

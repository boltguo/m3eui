import * as React from "react";

export const INERT_TRUE: boolean = (
  parseInt(React.version, 10) >= 19 ? true : ""
) as unknown as boolean;

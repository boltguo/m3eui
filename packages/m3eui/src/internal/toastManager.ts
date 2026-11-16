import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";

export type M3EToastManager = ReturnType<typeof BaseToast.createToastManager>;

export const createM3EToastManager: () => M3EToastManager =
  BaseToast.createToastManager;

export const M3EToastManagerContext =
  React.createContext<M3EToastManager | null>(null);

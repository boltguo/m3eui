import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";

export function FieldRoot({
  modal,
  open,
  onOpenChange,
  children,
}: {
  readonly modal: boolean;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const Root = modal ? BaseDialog.Root : BasePopover.Root;
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Root>
  );
}

export function FieldTrigger({
  modal,
  ...props
}: React.ComponentProps<typeof BasePopover.Trigger> & {
  readonly modal: boolean;
}): React.JSX.Element {
  return modal ? (
    <BaseDialog.Trigger
      {...(props as React.ComponentProps<typeof BaseDialog.Trigger>)}
    />
  ) : (
    <BasePopover.Trigger {...props} />
  );
}

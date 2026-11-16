export function isToggleProps(props: {
  readonly pressed?: unknown;
  readonly defaultPressed?: unknown;
  readonly onPressedChange?: unknown;
  readonly value?: unknown;
}): boolean {
  return (
    props.pressed !== undefined ||
    props.defaultPressed !== undefined ||
    props.onPressedChange !== undefined ||
    props.value !== undefined
  );
}

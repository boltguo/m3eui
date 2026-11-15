export function formatM3EMessage(
  template: string,
  params?: Readonly<Record<string, string | number>>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const val = params[token];
    return val === undefined ? `{${token}}` : String(val);
  });
}

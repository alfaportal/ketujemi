/** Replace `{key}` placeholders without pulling in the full app-extra-i18n bundle. */
export function fillPlaceholders(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = vars[key];
    return val === undefined ? `{${key}}` : String(val);
  });
}

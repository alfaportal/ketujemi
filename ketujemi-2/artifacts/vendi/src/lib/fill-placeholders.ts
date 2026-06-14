/** Replace `{key}` placeholders without pulling in the full app-extra-i18n bundle. */
export function fillPlaceholders(
  template: string | null | undefined,
  vars: Record<string, string | number>,
): string {
  const safeTemplate = template ?? "";
  if (!safeTemplate) return "";
  return safeTemplate.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = vars[key];
    return val === undefined ? `{${key}}` : String(val);
  });
}

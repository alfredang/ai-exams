function normalized(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '');
}

/**
 * Case-insensitive catalogue matching with punctuation-tolerant exam codes.
 * For example, "SAA C03", "saa-c03", and "SAAC03" all match SAA-C03.
 */
export function matchesCatalogSearch(query: string, values: Array<string | null | undefined>): boolean {
  const trimmed = query.trim().toLocaleLowerCase();
  if (!trimmed) return true;
  const compactQuery = normalized(trimmed);
  const directMatch = values.some((value) => {
    if (!value) return false;
    const lower = value.toLocaleLowerCase();
    return lower.includes(trimmed) || (compactQuery.length > 0 && normalized(lower).includes(compactQuery));
  });
  if (directMatch) return true;

  // Fall back to meaningful individual keywords for vague searches such as
  // "cyber security" when the catalogue copy contains only "security".
  const keywords = trimmed.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);
  if (keywords.length < 2) return false;
  const searchableText = values.filter(Boolean).join(' ').toLocaleLowerCase();
  return keywords.some((keyword) => searchableText.includes(keyword));
}

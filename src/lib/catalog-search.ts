function normalized(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '');
}

const BUNDLE_SEARCH_ALIASES: Record<string, string[]> = {
  // Tertiary Courses WSQ course codes. These are course identifiers rather
  // than certification exam codes, so they do not live on Exam records.
  'aws-aif-c01': ['TGS-2024049338'],
  'aws-clf-c02': ['TGS-2023039183'],
  'aws-dea-c01': ['TGS-2025053209'],
  'aws-dop-c02': ['TGS-2025054815'],
  'aws-dva-c02': ['TGS-2025052675'],
  'aws-mla-c01': ['TGS-2024049340'],
  'aws-saa-c03': ['TGS-2026064535'],
  'aws-sap-c02': ['TGS-2025053926'],
  'aws-soa-c03': ['TGS-2024051413'],
  'axelos-itil4-foundation': ['TGS-2024049350'],
  'cisco-ccna': ['TGS-2023037854'],
  'cisco-ccnp-encor': ['TGS-2024044052'],
  'comptia-a-plus': ['TGS-2024048317'],
  'comptia-cloud-plus': ['TGS-2024049214'],
  'comptia-cysa-plus': ['TGS-2024049211'],
  'comptia-data-plus': ['TGS-2024049212'],
  'comptia-linux-plus': ['TGS-2024048316'],
  'comptia-network-plus': ['TGS-2023040479', 'TGS-2025054472'],
  'comptia-security-plus': ['TGS-2023039181'],
  'comptia-securityx': ['TGS-2025053927'],
  'comptia-server-plus': ['TGS-2024048318'],
  'elastic-certified-engineer': ['TGS-2025052344'],
  'github-foundations': ['TGS-2025053207'],
  'google-ace': ['TGS-2023041024'],
  'google-professional-ml-engineer': ['TGS-2023040476'],
  'isc2-cissp': ['TGS-2024043392'],
  'linuxfoundation-cka': ['TGS-2025054612'],
  'linuxfoundation-ckad': ['TGS-2025053212'],
  'linuxfoundation-kcna': ['TGS-2023039343', 'TGS-2025053174'],
  'microsoft-ai-900': ['TGS-2023021100'],
  'microsoft-az-104': ['TGS-2023039182'],
  'microsoft-dp-300': ['TGS-2024048319'],
  'microsoft-dp-900': ['TGS-2023036641'],
  'microsoft-md-102': ['TGS-2024042603'],
  'microsoft-pl-300': ['TGS-2023037468'],
  'microsoft-pl-900': ['TGS-2023039923'],
  'microsoft-sc-300': ['TGS-2024047021'],
  'tableau-desktop-specialist': ['TGS-2025053175'],
  'tableau-tcda': ['TGS-2025053206']
};

export function bundleSearchAliases(bundleSlug: string): string[] {
  return BUNDLE_SEARCH_ALIASES[bundleSlug] || [];
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

  // An identifier must match as a whole (punctuation is already ignored by
  // normalized()). Falling back to individual tokens makes unrelated course
  // codes match solely because both contain a generic prefix such as "TGS".
  if (/\d/.test(trimmed)) return false;

  // Fall back to meaningful individual keywords for vague searches such as
  // "cyber security" when the catalogue copy contains only "security".
  const keywords = trimmed.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);
  if (keywords.length < 2) return false;
  const searchableText = values.filter(Boolean).join(' ').toLocaleLowerCase();
  return keywords.some((keyword) => searchableText.includes(keyword));
}

function normalized(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '');
}

const BUNDLE_SEARCH_ALIASES: Record<string, string[]> = {
  // Verified Tertiary Courses course codes. These are course identifiers rather
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
  'anthropic-cca-foundations': ['TGS-2026061312', 'C437'],
  'anthropic-ccar-professional': ['C364'],
  'cisco-ccna': ['TGS-2023037854'],
  'cisco-ccnp-encor': ['TGS-2024044052'],
  'comptia-a-plus': ['TGS-2024048317'],
  'comptia-cloud-plus': ['TGS-2024049214'],
  'comptia-cysa-plus': ['TGS-2024049211'],
  'comptia-data-plus': ['TGS-2024049212'],
  'comptia-linux-plus': ['TGS-2024048316'],
  'comptia-network-plus': ['TGS-2023040479', 'TGS-2025054472'],
  'comptia-pentest-plus': ['TGS-2026064471', 'C1136'],
  'comptia-security-plus': ['TGS-2023039181'],
  'comptia-securityx': ['TGS-2025053927'],
  'comptia-server-plus': ['TGS-2024048318'],
  'elastic-certified-engineer': ['TGS-2025052344'],
  'github-foundations': ['TGS-2025053207'],
  'google-ace': ['TGS-2023041024'],
  'google-professional-ml-engineer': ['TGS-2023040476'],
  'isc2-cissp': ['TGS-2024043392'],
  'iassc-lean-six-sigma-green-belt': ['TGS-2025055775', 'C481'],
  'linuxfoundation-cka': ['TGS-2025054612'],
  'linuxfoundation-ckad': ['TGS-2025053212'],
  'linuxfoundation-cks': ['C1799'],
  'linuxfoundation-kcna': ['TGS-2023039343', 'TGS-2025053174'],
  'microsoft-ai-900': ['TGS-2023021100'],
  'microsoft-az-104': ['TGS-2023039182'],
  'microsoft-dp-300': ['TGS-2024048319'],
  'microsoft-dp-900': ['TGS-2023036641'],
  'microsoft-md-102': ['TGS-2024042603'],
  'microsoft-pl-300': ['TGS-2023037468'],
  'microsoft-pl-900': ['TGS-2023039923'],
  'microsoft-sc-300': ['TGS-2024047021'],
  'pmi-pmp': ['C523'],
  'scrum-org-psm-i': ['C698'],
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

  // Multi-word fallback requires every meaningful word. Accepting any one word
  // made vendor phrases such as "Amazon Web Services" match unrelated cards
  // that happened to contain "web" or "services".
  const keywords = trimmed.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);
  if (keywords.length < 2) return false;
  const searchableText = values.filter(Boolean).join(' ').toLocaleLowerCase();
  return keywords.every((keyword) => searchableText.includes(keyword));
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1)
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

export function catalogSearchSuggestions(query: string, candidates: string[], limit = 3): string[] {
  const target = normalized(query);
  if (target.length < 3) return [];

  const unique = [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];
  return unique
    .map((candidate) => {
      const compact = normalized(candidate);
      const words = candidate.split(/[^a-z0-9]+/i).filter((word) => word.length >= 3);
      const distances = [editDistance(target, compact), ...words.map((word) => editDistance(target, normalized(word)))];
      return { candidate, distance: Math.min(...distances), length: compact.length };
    })
    .filter(({ distance, length }) => distance <= Math.max(2, Math.floor(Math.min(target.length, length) * 0.3)))
    .sort((a, b) => a.distance - b.distance || a.candidate.length - b.candidate.length)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

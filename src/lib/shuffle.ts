/**
 * Deterministic Fisher-Yates shuffle, seeded from a string.
 *
 * Same seed → identical output. Different seeds can coincide by chance. Used to
 * randomise answer-option position per (attemptId, questionId) so the correct
 * answer's slot varies across users and attempts, but stays stable within one
 * attempt (so paging back/forth — and the post-submit results review — show
 * the same order the taker saw).
 *
 * Seeded RNG: FNV-1a hash of the seed → xorshift32 PRNG. Cheap, no
 * dependencies, statistically-uniform-enough for shuffling 2–6 options.
 *
 * Pure (no React/DOM), so it is safe to import from both the client exam
 * runner and the server-rendered results page. Keep the seed format
 * (`${attemptId}:${questionId}`) identical in every caller or the orders
 * will diverge.
 */
export function shuffleSeeded<T>(arr: readonly T[], seed: string): T[] {
  const out = [...arr];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rng = (): number => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 0xffffffff) / 0xffffffff;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The fixed, numbered order a sequencing (ORDERING) question's steps are
 * shown in — Step 1…N — so the answer reads like "5 → 3 → 2 → 4 → 1".
 *
 * Authors list steps out of order and that order is kept. A question
 * authored in its correct order gets a stable per-question shuffle
 * (seed = question id) so it never starts pre-solved. Server (exam page,
 * results) and client must call this with the same seed.
 */
export function sequencingSteps<T extends { id: string }>(options: readonly T[], correct: readonly string[], seed: string): T[] {
  const solved = (list: readonly T[]) => list.length === correct.length && list.every((o, i) => o.id === correct[i]);
  if (!solved(options)) return [...options];
  const out = shuffleSeeded(options, seed);
  return solved(out) ? [...out.slice(1), out[0]] : out;
}

/** Shared web/mobile/review layout. Retakes get a fresh attempt seed, while
 * resumes keep their layout. Version 0 preserves already-started attempts.
 * Sequencing keeps its canonical step labels, but starts in a fresh unsolved
 * working order. Correct answers always remain option ids, never positions.
 */
export function optionsForAttempt<T extends { id: string }>(
  options: readonly T[], type: string, correct: readonly string[],
  attemptId: string, questionId: string, version = 0
): T[] {
  if (type === 'TRUE_FALSE' && version === 0) return [...options];
  if (type === 'ORDERING') {
    const steps = sequencingSteps(options, correct, questionId);
    if (version === 0) return steps;
    const out = shuffleSeeded(steps, `${attemptId}:${questionId}`);
    const solved = out.length === correct.length && out.every((o, i) => o.id === correct[i]);
    return solved && out.length > 1 ? [...out.slice(1), out[0]] : out;
  }
  return shuffleSeeded(options, `${attemptId}:${questionId}`);
}

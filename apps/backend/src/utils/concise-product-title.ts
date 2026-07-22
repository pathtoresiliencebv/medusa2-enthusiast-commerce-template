const MAX_TITLE_LENGTH = 58;

const trailingWords = new Set([
  "de",
  "het",
  "een",
  "en",
  "of",
  "met",
  "voor",
  "van",
  "in",
  "op",
  "&",
]);

function stripQuantityPrefix(value: string) {
  let result = value.trim();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const previous = result;
    result = result
      .replace(/^\d+\s*-\s*delig(?:e)?\s+/i, "")
      .replace(
        /^\d+(?:\s*\/\s*\d+)*\s*(?:stuks?|st\.?|pcs?|pc|pieces?|delig(?:e)?|pack|set)\s*[,+/&-]*\s*/i,
        "",
      )
      .replace(/^(?:een|één)\s+stuk\s+/i, "")
      .trim();

    if (result === previous) break;
  }

  return result;
}

function trimAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  const words = value.slice(0, maxLength + 1).split(/\s+/);
  words.pop();

  while (words.length && trailingWords.has(words.at(-1)!.toLowerCase())) {
    words.pop();
  }

  const result = words.join(" ").replace(/[\s:./-]+$/g, "");
  const openParentheses = (result.match(/\(/g) || []).length;
  const closeParentheses = (result.match(/\)/g) || []).length;

  return openParentheses > closeParentheses
    ? result.slice(0, result.lastIndexOf("(")).trim()
    : result;
}

export function conciseProductTitle(title: string) {
  const normalized = title
    .replace(/\.{3,}|…/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const segments = normalized
    .split(/\s+[–—|-]\s+|[;,]/)
    .map(stripQuantityPrefix)
    .map((segment) => segment.replace(/^[\s:./-]+|[\s:./-]+$/g, "").trim())
    .filter((segment) => segment.length >= 4);
  let candidate =
    segments.shift() || stripQuantityPrefix(normalized) || normalized;

  while (
    segments.length &&
    (candidate.length < 18 ||
      candidate.split(/\s+/).length < 2 ||
      (candidate.length < 36 &&
        /e$/i.test(candidate.split(/\s+/).at(-1) || "")))
  ) {
    candidate = `${candidate} ${segments.shift()}`.trim();
  }
  const concise = trimAtWord(candidate, MAX_TITLE_LENGTH) || candidate;

  return concise.charAt(0).toLocaleUpperCase("nl-NL") + concise.slice(1);
}

export { MAX_TITLE_LENGTH };

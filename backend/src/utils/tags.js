export function normalizeTags(rawTags) {
  const source = Array.isArray(rawTags)
    ? rawTags
    : String(rawTags || '').split(',');

  const tags = [
    ...new Set(
      source
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  if (
    tags.length > 10 ||
    tags.some((tag) => tag.length > 40)
  ) {
    throw new Error(
      'Provide up to 10 tags, each no longer than 40 characters.'
    );
  }

  return tags;
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createSearchRegex(query) {
  return new RegExp(escapeRegex(query.trim()), 'i');
}

export function rankMedia(items, query) {
  const normalizedQuery = query.trim().toLowerCase();

  const now = Date.now();

  return items
    .map((item) => {
      const filename = item.filenameNormalized;

      const matchedTags = item.tags.filter((tag) =>
        tag.includes(normalizedQuery)
      );

      let score = 0;

      score +=
        filename === normalizedQuery
          ? 10
          : filename.includes(normalizedQuery)
            ? 5
            : 0;

      score += matchedTags.reduce(
        (total, tag) =>
          total + (tag === normalizedQuery ? 8 : 4),
        0
      );

      const ageDays =
        (now - new Date(item.uploadedAt).getTime()) / 86400000;

      score += Math.max(
        0,
        3 - Math.floor(ageDays / 30)
      );

      score += Math.min(
        2,
        Math.log10(item.viewCount + 1)
      );

      return {
        ...item,
        relevanceScore: Number(score.toFixed(2)),
      };
    })
    .sort(
      (a, b) =>
        b.relevanceScore - a.relevanceScore ||
        new Date(b.uploadedAt) - new Date(a.uploadedAt) ||
        b.viewCount - a.viewCount
    );
}

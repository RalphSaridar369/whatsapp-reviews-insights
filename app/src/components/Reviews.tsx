import { useMemo, useState } from "react";

type SortKey = "default" | "score_asc" | "score_desc";

const scoreColor = (score: number) => {
    if (score <= 2.5) return "text-bad";
    if (score <= 3.8) return "text-avg";
    return "text-good";
  };

export function Reviews({
  reviews,
}: {
  reviews: {
    review: string;
    score: number;
  }[];
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("default");

  const filtered = useMemo(() => {
    let list = reviews;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.review.toLowerCase().includes(q));
    }
    if (sortKey === "score_asc")
      list = [...list].sort((a, b) => a.score - b.score);
    if (sortKey === "score_desc")
      list = [...list].sort((a, b) => b.score - a.score);
    return list;
  }, [reviews, query, sortKey]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter reviews by keyword…"
          className="flex-1 bg-cd-background border rounded-sm px-4 py-2 text-sm placeholder:text-gray focus:outline-none"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-cd-background border rounded-sm px-3 py-2 text-sm font-mono text-gray"
        >
          <option value="default">Default order</option>
          <option value="score_asc">Lowest rated first</option>
          <option value="score_desc">Highest rated first</option>
        </select>
      </div>

      <p className="font-mono text-xs text-gray mb-3">
        {filtered.length} of {reviews.length} reviews
      </p>

      <div className="flex flex-col bg-cd-background">
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-gray text-sm">
            No reviews match &ldquo;{query}&rdquo;.
          </p>
        )}
        {filtered.slice(0, 200).map((r, i) => (
          <div key={i} className="px-4 py-3 flex gap-4 border">
            <span className={`font-mono text-xs ${scoreColor(r.score)} shrink-0 pt-0.5`}>
              {r.score}★
            </span>
            <p className="text-sm text-text leading-relaxed">{r.review}</p>
          </div>
        ))}
      </div>
      {filtered.length > 200 && (
        <p className="font-mono text-xs text-gray mt-3">
          Showing first 200 of {filtered.length} — narrow your filter to see
          more precisely.
        </p>
      )}
    </div>
  );
}

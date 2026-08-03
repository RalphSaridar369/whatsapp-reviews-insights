import { Link, useParams } from "react-router-dom";
import Overlay from "../components/Overlay";
import clusters from "../data/clusters.json";
import reviews from "../data/reviews.json";
import { ScoreHistogram } from "../components/ScoreHistogram";
import { Reviews } from "../components/Reviews";

const scoreColor = (score: number) => {
  if (score <= 2.5) return "text-bad";
  if (score <= 3.8) return "text-avg";
  return "text-good";
};

const scoreDistribution = (
  reviews: { review: string, score: number }[]
): { score: number; count: number }[] => {
  return [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: reviews.filter((r) => Math.round(r.score) === score).length,
  }));
}

const ClusterDetails = () => {
  const { id } = useParams<{ id: string }>();



  if (!id) {
    return <div>Invalid cluster ID</div>;
  }

  const cluster = clusters.find((c) => c.Topic === parseInt(id));
  const reviews_ = reviews?.find((item) => item.topic === Number(id))?.reviews ?? [];
  const histogram = scoreDistribution(reviews_)

  return (
    <Overlay>
      <Link
        to="/"
        className="flex flex-row gap-4 items-center text-gray hover:text-avg"
      >
        ← back to overview
      </Link>
      <header className="mt-6 mb-10">
        <span className="font-mono text-xs uppercase tracking-widest text-avg">
          Topic {cluster!.Topic}
        </span>
        <h1 className="font-display text-3xl mt-2 mb-4">
          {cluster!.Topic === -1
            ? "Unclustered / no clear theme"
            : cluster!.description}
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {cluster!.Representation.map((key) => (
            <span
              key={key}
              className="font-mono text-xs px-2 py-1 border border-border rounded-sm text-muted"
            >
              {key}
            </span>
          ))}
        </div>

        <div className="flex gap-8 font-mono text-sm">
          <div className="flex flex-row gap-2">
            <span className="text-gray">Reviews</span>
            <span className="text-text">{cluster!.Count}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="text-gray">Avg. rating</span>
            <span className={scoreColor(cluster!.avg_score)}>
              {cluster!.avg_score.toFixed(2)}★
            </span>
          </div>
        </div>
      </header>
      <section className="mb-12">
        <h2 className="font-display text-lg mb-3">Rating distribution</h2>
        <ScoreHistogram data={histogram} />
      </section>

      <section>
        <h2 className="font-display text-lg mb-3">Reviews in this topic</h2>
        <Reviews reviews={reviews_} />
      </section>
    </Overlay>
  );
};

export default ClusterDetails;

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export interface ClusterSummary {
  Topic: number;
  Count: number;
  Representation: string[];
  description: string;
  avg_score: number;
}

const scoreColor = (score: number, isBackground = false) => {
  if (score <= 2.5) return isBackground ? "bg-bad" : "text-bad";
  if (score <= 3.8) return isBackground ? "bg-avg" : "text-avg";
  return isBackground ? "bg-good" : "text-good";
};

const ClusterCard = ({
  cluster,
}: {
  cluster: ClusterSummary & { widthPct: number };
}) => {
  return (
    <Link to={`/cluster/${cluster.Topic}`}>
      <div className="bg-cd-background flex flex-1 py-2 px-3 border flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p>{cluster.description}</p>
          <div className="flex flex-row gap-4">
            <p className="text-gray">
              {cluster.Count} reviews
            </p>
            <p className={scoreColor(cluster.avg_score)}>
              {cluster.avg_score.toFixed(2)}★
            </p>
          </div>
        </div>

        <div className="h-2 w-full bg-ink rounded-sm overflow-hidden">
          <div
            className={`h-full rounded-sm transition-all ${scoreColor(
              cluster.avg_score,
              true
            )}`}
            style={{
              width: `${cluster.widthPct}%`,
            }}
          />
        </div>
      </div>
    </Link>
  );
};

const ClustersList = ({ clusters }: { clusters: ClusterSummary[] }) => {
  const [sortValue, setSortValue] = useState(0);

  const data = useMemo(() => {
    const maxCount = Math.max(...clusters.map((c) => c.Count), 1);

    const sorted = [...clusters].sort((a, b) => {
      switch (sortValue) {
        case 0:
          return b.Count - a.Count;
        case 1:
          return b.avg_score - a.avg_score;
        case 2:
          return a.avg_score - b.avg_score;
        default:
          return b.Count - a.Count;
      }
    });

    return sorted.map((c) => ({
      ...c,
      widthPct: Number(((c.Count / maxCount) * 100).toFixed(2)),
    }));
  }, [clusters, sortValue]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h2>Topic signal</h2>
        <div className="flex flex-row gap-2 items-center">
          <p>Sort by:</p>
          <button
            onClick={() => setSortValue(0)}
            className={`${
              sortValue === 0
                ? "text-avg border-avg"
                : "text-gray"
            } filter-border py-1 px-4 mx-2 hover:cursor-pointer`}
          >
            Volume
          </button>
          <button
            onClick={() => setSortValue(1)}
            className={`${
              sortValue === 1
                ? "text-avg border-avg"
                : "text-gray"
            } filter-border py-1 px-4 mx-2 hover:cursor-pointer`}
          >
            Best First
          </button>
          <button
            onClick={() => setSortValue(2)}
            className={`${
              sortValue === 2
                ? "text-avg border-avg"
                : "text-gray"
            } filter-border py-1 px-4 mx-2 hover:cursor-pointer`}
          >
            Worst First
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 my-4">
        {data.map((cluster) => (
          <ClusterCard
            key={cluster.Topic}
            cluster={cluster}
          />
        ))}
      </div>
    </div>
  );
};

export default ClustersList;
import ClustersList from "../components/ClustersList";
import HomeCard from "../components/HomeCard";
import clusters from "../data/clusters.json";

const cards = [
    {
      title: "TOTAL REVIEWS",
      subtitle: "3,927",
    },
    {
      title: "TOPICS FOUND",
      subtitle: "66",
      subtitleColor: "text-avg",
    },
    {
      title: "AVG. RATING",
      subtitle: "3.68★",
      subtitleColor: "text-good",
    },
    {
      title: "UNCLUSTERED",
      subtitle: "17.4%",
      subtitleColor: "text-bad",
    },
  ];

const Home = () => {
  return (
    <section className="flex flex-col max-w-6xl mx-auto px-6 py-16">
      <div>
        <h1>What reviewers are actually saying</h1>
        <p className="text-gray">
          3,927 reviews grouped into 66 topics. Bar length is volume, bar color
          is sentiment — the topics you want at the top are wide and red.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-4 gap-4 my-8">
        {cards.map((item, index) => (
          <HomeCard {...item} key={index} />
        ))}
      </div>
      <ClustersList clusters={clusters} />
    </section>
  );
};

export default Home;

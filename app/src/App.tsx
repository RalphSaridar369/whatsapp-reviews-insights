import ClustersList from './components/ClustersList.tsx';
import Header from './components/Header.tsx';
import HomeCard from './components/HomeCard.tsx';

const cards = [
  {
    title:"TOTAL REVIEWS",
    subtitle:"3,927",
  },
  {
    title:"TOPICS FOUND",
    subtitle:"66",
    subtitleColor:'text-avg'
  },
  {
    title:"AVG. RATING",
    subtitle:"3.68★",
    subtitleColor:"text-good"
  },
  {
    title:"UNCLUSTERED",
    subtitle:"17.4%",
    subtitleColor:"text-bad"
  },
]

function App() {
  return (
    <div className='min-h-screen bg-background text-text py-4 px-2'>
      <Header />
      <section className='flex flex-col max-w-6xl mx-auto px-6 py-16'>
        <div>
          <h2>What reviewers are actually saying</h2>
          <p className='text-gray'>3,927 reviews grouped into 66 topics. Bar length is volume, bar color is sentiment — the topics you want at the top are wide and red.</p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2  md:grid-cols-4 gap-4 my-8'>
          {cards.map((item,index)=><HomeCard {...item} key={index}/>)}
        </div>
        <ClustersList />
      </section>
    </div>
  )
}

export default App

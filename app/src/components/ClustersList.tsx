import { useState } from "react"

const ClustersList = () => {

  const [sortValue,setSortValue] = useState(0)

  return (
    <div className="flex flex-col">
        <div className="flex flex-row justify-between">
            <h2>Topic signal</h2>
            <div className="flex flex-row gap-2 items-center">
                <p>Sort by:</p>
                <div onClick={()=>setSortValue(0)} className={`${sortValue === 0 ? "text-avg":"text-gray"} border py-1 px-4 mx-2 hover:cursor-pointer`}>Volume</div>
                <div onClick={()=>setSortValue(1)} className={`${sortValue === 1 ? "text-avg":"text-gray"} border py-1 px-4 mx-2 hover:cursor-pointer`}>Best First</div>
                <div onClick={()=>setSortValue(2)} className={`${sortValue === 2 ? "text-avg":"text-gray"} border py-1 px-4 mx-2 hover:cursor-pointer`}>Worst First</div>
            </div>
        </div>        
    </div>
  )
}

export default ClustersList
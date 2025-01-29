"use client"
import SearchIcon from "@/components/icons/search-icon";
import { useState } from "react";


export default function Home() {
  const [searchKeywords, setSearchKeywords] = useState("")

  return (
    <div className="w-full h-screen flex flex-col font-[family-name:var(--font-geist-sans)] my-1 mx-3">

      <div className="w-full max-w-sm px-4 py-1 flex justify-center items-center gap-1 rounded-3xl bg-gray-100 border border-stone-300 focus:ring-2 focus:bg-green-500 shadow-lg">
        <input
          type="text"
          placeholder="search compaign..."
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 bg-opacity-0 text-base text-white focus:outline-none "
        /> 
        <div className="py-1 px-4 bg-green-300 rounded-3xl text-white"> 
         <SearchIcon />
        </div>
      </div>

       {/* <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eligendi officiis corrupti facilis incidunt vero ea mollitia perferendis quibusdam
         officia molestias totam consequuntur perspiciatis temporibus consectetur beatae expedita fuga tempore provident, facere autem rerum quam! 
         Et ipsa deserunt repellendus facilis unde eligendi perspiciatis reprehenderit sit quis, nesciunt dignissimos blanditiis aliquam cupiditate, 
         aspernatur quos facere suscipit natus.</p> */}
    </div>
  );
}

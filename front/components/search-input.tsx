import React, { useState } from 'react';
import SearchIcon from './icons/search-icon';
// import { SearchIcon } from '@heroicons/react/outline'; // Приклад іконки

export default function Search() {
  const [searchKeywords, setSearchKeywords] = useState('');

  const handleSearch = () => {
    alert(`Ви ввели: ${searchKeywords}`);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 px-5 py-[3px] bg-white rounded-full 
                      shadow-md border border-gray-300 
                      focus-within:ring-2 focus-within:ring-green-400 
                      transition-all duration-200">

        <input
          type="text"
          placeholder="Search campaign..."
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold placeholder-gray-400 text-gray-800 
                     focus:outline-none"
        />

        <button
          onClick={handleSearch}
          className="bg-green-400 text-white rounded-full p-2 
                     hover:bg-green-500 focus:outline-none 
                     focus:ring-2 focus:ring-green-500 
                     transition duration-200"
        >
          <SearchIcon />
        </button>
      </div>
    </div>
  );
}
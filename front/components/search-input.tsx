import React,  { Fragment, useState } from 'react';
import SearchIcon from './icons/search-icon';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { COMPANY_CATEGORIES, FUNDRAISING_CATEGORIES } from '@/shared/constants';

interface IProps {
  type: "company" | "fund";
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

export default function Search({ type, searchQuery, setSearchQuery, category, setCategory }: IProps) {

  const handleSearch = () => {
    alert(`Ви ввели: ${searchQuery} | Обрана категорія: ${category}`);
  };

  const categories = type === "company" ? COMPANY_CATEGORIES : FUNDRAISING_CATEGORIES;

  return (
    <div className="w-full max-w-md flex gap-1 m-1">
      <div className="flex items-center gap-2 px-5 py-[3px] bg-white rounded-full 
                      shadow-md border border-gray-300 
                      focus-within:ring-2 focus-within:ring-green-400 
                      transition-all duration-200">

        <input
          type="text"
          placeholder="Search ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      <div className="relative w-auto">
         <Listbox value={category} onChange={setCategory}>
          <ListboxButton
            className="w-full px-3 py-3 text-sm bg-white border border-gray-300 
                       rounded-full shadow-lg focus:outline-none 
                       focus:ring-2 focus-within:ring-green-400 text-left"
          >
            {category}
          </ListboxButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-x-0"
            enterTo="opacity-100 translate-x-1"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-x-1"
            leaveTo="opacity-0 translate-x-0"
          >
            <ListboxOptions
              className="absolute top-0 -right-350 flex left-auto z-10 px-3 py-2 w-auto 
                         bg-white border border-gray-300 rounded-full shadow-lg"
            >
              {["All",  ...categories].map((item) => (
                <ListboxOption
                  key={item}
                  value={item}
                  className={`${item == category && "bg-green-300"} z-30 cursor-pointer select-none rounded-full px-2 py-1 text-sm text-center whitespace-nowrap break-keep hover:bg-gray-100 focus:bg-gray-200`}
                >
                  {item}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </Listbox>
      </div>
    </div>
  );
}
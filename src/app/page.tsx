"use client";
import React, { FormEvent, useState } from "react";
import { scrapeAndStoreProduct } from "../../lib/action";

const Home = () => {
  const [searchUrl, setsearchUrl] = useState("");

  const isValidAmazonProductUrl = (url: string) => {
    // Amazon product URL regex
    const amazonProductUrlRegex =
      /^(https?:\/\/)?(www\.)?amazon\.(com|ca|co\.uk|de|fr|es|it|in|jp|com\.au|com\.br|com\.mx|nl|sg|ae|sa)\b.*\/(dp|gp\/product|exec\/obidos\/ASIN)\/[A-Za-z0-9]{10}/;

    // Test the URL against the regex
    return amazonProductUrlRegex.test(url);
  };

  const handleSubmit = async () => {
    const isValidLink = isValidAmazonProductUrl(searchUrl);

    if (!isValidLink) return alert("Please provide a valid Amazon link");

    try {
      // setIsLoading(true);

      // Scrape the product page
      const product = await scrapeAndStoreProduct(searchUrl);
    } catch (error) {
      console.log(error);
    } finally {
      // setIsLoading(false);
    }
  };
  return (
    <div>
      <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"></div>
        <input
          type="search"
          onChange={(e) => setsearchUrl(e.target.value)}
          id="default-search"
          className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search Mockups, Logos..."
        />
        <button
          onClick={handleSubmit}
          className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default Home;

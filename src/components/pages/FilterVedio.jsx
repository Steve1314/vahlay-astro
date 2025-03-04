import React, { useState } from "react";

const VideoSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Call the debounced function
  };

  return (
    <div className="flex justify-center mb-6">
      <input
        type="text"
        placeholder="Search videos..."
        value={query}
        onChange={handleChange}
        className="p-3 border border-gray-300 rounded-lg w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default VideoSearchBar;

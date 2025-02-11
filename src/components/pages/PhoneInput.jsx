import React, { useState, useEffect } from "react";
import Select from "react-select";
import countryCodes from "./Countrycode.json"; // Import JSON

const PhoneInput = ({ selectedCountry, setSelectedCountry }) => {
  // Convert country codes JSON into dropdown options
  const countryOptions = countryCodes
    .map((country) => ({
      value: country.dial_code,
      label: `${country.name} (${country.dial_code})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically

  return (
    <Select
      options={countryOptions}
      value={countryOptions.find((option) => option.value === selectedCountry)}
      onChange={(selected) => setSelectedCountry(selected.value)}
      placeholder="Select Country Code"
      isSearchable
    />
  );
};

export default PhoneInput;

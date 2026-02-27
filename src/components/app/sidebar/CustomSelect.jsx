"use client";

import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
  const rect = wrapperRef.current.getBoundingClientRect();
  const parent = wrapperRef.current.closest("form");
  const parentRect = parent.getBoundingClientRect();
  const spaceBelow = parentRect.bottom - rect.bottom;
  const dropdownHeight = 240; // примерно max-h-60

  setOpenUpward(spaceBelow < dropdownHeight);
  setOpen(!open);
}}
        className="input-style relative flex items-center pr-10 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
      >
        <span className={value ? "" : "text-gray-400"}>
          {value || placeholder}
        </span>

        <svg
  className={`absolute right-3 w-4 h-4 transition-transform ${
    open ? "rotate-180" : ""
  }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
{open && (
  <div
    className={`absolute left-0 right-0 ${
      openUpward ? "bottom-full mb-1" : "top-full mt-1"
    } bg-gray-900/95 backdrop-blur-md border border-gray-600/60 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scroll`}
  >
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => {
          onChange(option);
          setOpen(false);
        }}
        className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm transition"
      >
        {option}
      </button>
    ))}
  </div>
)}
    </div>
  );
}
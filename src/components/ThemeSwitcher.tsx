"use client";
import React, { useEffect, useState } from "react";

// 官方預設主題（可根據 tailwind.config.js daisyui.theme 設定自訂）
const defaultThemes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "luxury",
  "dracula",
  "cmyk",
];

export default function ThemeSwitcher() {
  const [themes, setThemes] = useState<string[]>(defaultThemes);
  const [current, setCurrent] = useState<string>("light");

  useEffect(() => {
    setCurrent(
      document.documentElement.getAttribute("data-theme") || "light"
    );
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const theme = e.target.value;
    document.documentElement.setAttribute("data-theme", theme);
    setCurrent(theme);
  };

  return (
    <div className="w-auto">
      <select
        className="select select-bordered select-sm w-32"
        onChange={handleChange}
        value={current}
      >
        {themes.map((theme) => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";
import React, { useEffect, useMemo, useState } from "react";

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
  const [current, setCurrent] = useState<string>(() => {
  // 讀取 DOM 中當前的 data-theme 作為元件的預設主題
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  // 確保當前 state 與 document 的 data-theme 同步
  useEffect(() => {
    if (document.documentElement.getAttribute("data-theme") !== current) {
      document.documentElement.setAttribute("data-theme", current);
    }
  }, [current]);

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
        {defaultThemes?.map((theme) => (
          <option key={theme} value={theme}>
            {theme?.charAt(0).toUpperCase() + theme?.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

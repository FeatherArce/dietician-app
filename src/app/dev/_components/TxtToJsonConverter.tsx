"use client";

import React, { useState } from "react";

export default function TxtToJsonConverter() {
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
        const json = JSON.stringify(lines, null, 2);
        setJsonOutput(json);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (jsonOutput) {
      const blob = new Blob([jsonOutput], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "word-list.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container grid gap-4 p-4">
      <h1 className="text-lg font-bold">TXT to JSON Converter</h1>
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      {jsonOutput && (
        <div>
          <h2 className="text-md font-bold">Preview:</h2>
          <pre className="bg-gray-100 p-2 max-h-64 overflow-auto">{jsonOutput}</pre>
          <button className="btn btn-primary mt-2" onClick={handleDownload}>
            Download JSON
          </button>
        </div>
      )}
    </div>
  );
}
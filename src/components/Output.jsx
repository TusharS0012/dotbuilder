"use client";
import { useState } from "react";

const Output = ({ editorRef, language_id }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/execute-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language_id, sourceCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute code");
      }

      const result = await response.json();
      const outputText =
        result.stdout || result.stderr || result.compile_output || "No output";
      setOutput(outputText.split("\n"));
      setIsError(Boolean(result.stderr || result.compile_output));
    } catch (error) {
      console.log(error);
      setIsError(true);
      setOutput(["Error while running the code"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-3 w-[30%] bg-gray-50 border border-gray-200 rounded-lg shadow-lg">
      <button
        onClick={runCode}
        className="w-full py-2 mb-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md disabled:opacity-50" // Solid blue button, darker on hover, subtle shadow
        disabled={isLoading}
      >
        {isLoading ? "Compiling..." : "Run Code"}
      </button>

      <div
        className={`p-4 rounded-md overflow-auto h-[90%] font-mono text-sm ${
          isError ? "text-red-600" : "text-gray-800"
        }`} // Text colors adapted for light theme
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
          </div>
        ) : output ? (
          output.map((line, i) => (
            <p key={i} className="whitespace-pre-wrap overflow-auto">
              {line}
            </p>
          ))
        ) : (
          <p className="text-gray-500">
            Click "Run Code" to see the output here
          </p>
        )}
      </div>
    </div>
  );
};

export default Output;

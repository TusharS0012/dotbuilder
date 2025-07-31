"use client";
import {
  Moon,
  Sun,
  Sparkles,
  Wrench,
  File,
  Expand,
  Shrink,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import axios from "axios";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, LANGUAGE_MAP } from "@/constants";
import { Box } from "@chakra-ui/react"; // Assuming Chakra UI is configured for light theme
import Output from "./Output"; // Assuming Output component adapts
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function CodeEditor({ file }) {
  const [selectedTheme, setSelectedTheme] = useState("light"); // Default to light theme
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedCode, setUpdatedCode] = useState(
    "//Select a file to start coding..!"
  );
  const [isFixing, setIsFixing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const monaco = useMonaco();
  const timeoutRef = useRef(null);
  const editorRef = useRef();
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const settingsRef = useRef(null);

  useEffect(() => {
    if (file) {
      fetchFileContent();
    }
  }, [file]);

  useEffect(() => {
    if (!file?.id || !file?.workspaceId) return;

    const filePath = `workspaces/${file.workspaceId}/files`;
    const fileRef = doc(db, filePath, file.id);

    const unsubscribe = onSnapshot(fileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.content !== updatedCode) {
          setUpdatedCode(data.content || "");
        }
      }
    });

    return () => unsubscribe();
  }, [file]);

  const fetchFileContent = async () => {
    if (!file?.id || !file?.workspaceId) return;
    try {
      const filePath = `workspaces/${file.workspaceId}/files`;
      const fileRef = doc(db, filePath, file.id);
      const fileSnap = await getDoc(fileRef);

      if (fileSnap.exists()) {
        setUpdatedCode(fileSnap.data().content || "");
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  const handleEditorChange = (value) => {
    setUpdatedCode(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => autoSaveFile(value), 0);
  };

  const autoSaveFile = async (content) => {
    if (!file?.id || !file?.workspaceId) return;
    try {
      const filePath = `workspaces/${file.workspaceId}/files`;
      const fileRef = doc(db, filePath, file.id);
      await updateDoc(fileRef, { content });
    } catch (error) {
      console.error("Error auto-saving file:", error);
    }
  };

  const onSelect = (codeLanguage) => {
    setCodeLanguage(codeLanguage);
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const generateDocs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/generate-documentation", {
        code: updatedCode,
        language: codeLanguage,
      });
      const documentation = res.data.documentation;
      const commentedDocs = `\n\n${documentation}`;
      setUpdatedCode((prevCode) => prevCode + commentedDocs);
    } catch (error) {
      console.error("Failed to generate documentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fixSyntaxErrors = async () => {
    setIsFixing(true);
    try {
      const res = await axios.post("/api/get-errors", {
        code: updatedCode,
        codeLanguage,
      });
      if (res.data.fixedCode) {
        setUpdatedCode(res.data.fixedCode);
      }
    } catch (error) {
      console.error("Failed to fix syntax:", error);
    } finally {
      setIsFixing(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Monaco editor needs to be laid out again when its container size changes
    setTimeout(() => editorRef.current?.layout(), 100);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { name: "Dark", value: "vs-dark" },
    { name: "Light", value: "light" },
    { name: "High Contrast", value: "hc-black" },
  ];

  return (
    <div
      className={`bg-white m-2 h-[94%] rounded-xl p-3 shadow-lg border border-gray-200 ${
        isExpanded ? "fixed inset-0 z-50 m-0" : "relative"
      }`}
    >
      {" "}
      {/* White background, shadow, light border */}
      <Box className="relative h-full">
        <div className="flex h-full">
          <Box
            w={isExpanded ? "100%" : "78%"}
            transition="all 0.3s ease"
            className="h-[100%]"
          >
            {" "}
            {/* Removed bg-green-30 */}
            <div className="flex justify-between items-center h-[10%] pr-12">
              {file && (
                <div className="flex items-center bg-gray-100 text-gray-800 px-4 max-h-[50px] rounded-md shadow-sm border border-gray-200 w-40">
                  {" "}
                  {/* Light background, dark text, subtle border/shadow */}
                  <File size={16} className="mr-2 text-blue-500" />{" "}
                  {/* Blue icon */}
                  <span className="text-sm text-gray-700 line-clamp-1">
                    {file.name}
                  </span>{" "}
                  {/* Darker text */}
                </div>
              )}
              <div className="flex gap-3 items-center">
                <div className="relative" ref={settingsRef}>
                  <button
                    className="flex items-center bg-gray-100 text-gray-700 p-2 rounded-full shadow-sm hover:bg-gray-200 transition ring-1 ring-gray-300" // Light button, dark text, light ring, subtle shadow
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings size={16} />
                  </button>
                  {showSettings && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl p-3 space-y-3 z-50 border border-gray-200">
                      {" "}
                      {/* White background, light border */}
                      <div>
                        <label className="text-xs text-gray-700 mb-1 block">
                          Theme
                        </label>{" "}
                        {/* Darker text */}
                        <select
                          className="w-full bg-gray-100 text-gray-800 text-xs p-1 rounded border border-gray-300 focus:border-blue-500 outline-none" // Light background, dark text, subtle border
                          value={selectedTheme}
                          onChange={(e) => setSelectedTheme(e.target.value)}
                        >
                          {themes.map((theme) => (
                            <option key={theme.value} value={theme.value}>
                              {theme.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-700 mb-1 block">
                          Font Size
                        </label>{" "}
                        {/* Darker text */}
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider-thumb-blue" // Light slider track, need custom thumb style
                        />
                        <span className="text-xs text-gray-700 block text-center">
                          {fontSize}px
                        </span>{" "}
                        {/* Darker text */}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-sm hover:bg-blue-600 transition disabled:opacity-50 text-xs" // Solid blue button
                  onClick={generateDocs}
                  disabled={isLoading}
                >
                  <Sparkles size={14} /> {isLoading ? "Generating..." : "Docs"}
                </button>
                <button
                  className="flex items-center gap-1.5 bg-teal-500 text-white px-3 py-1.5 rounded-full shadow-sm hover:bg-teal-600 transition disabled:opacity-50 text-xs" // Solid teal button
                  onClick={fixSyntaxErrors}
                  disabled={isFixing}
                >
                  <Wrench size={14} /> {isFixing ? "Fixing..." : "Fix"}
                </button>
                <button
                  className="flex items-center gap-1.5 bg-purple-500 text-white px-3 py-1.5 rounded-full shadow-sm hover:bg-purple-600 transition text-xs" // Solid purple button
                  onClick={toggleExpand}
                >
                  {isExpanded ? (
                    <Shrink size={14} className="transition-transform" />
                  ) : (
                    <Expand size={14} className="transition-transform" />
                  )}
                  {isExpanded ? "Collapse" : "Expand"}
                </button>
              </div>
              <LanguageSelector language={codeLanguage} onSelect={onSelect} />{" "}
              {/* Assuming LanguageSelector adapts */}
            </div>
            <Editor
              height={isExpanded ? "calc(100vh - 100px)" : "92%"}
              theme={selectedTheme}
              language={codeLanguage}
              defaultValue={CODE_SNIPPETS[codeLanguage]}
              value={updatedCode}
              onMount={onMount}
              onChange={handleEditorChange}
              options={{
                fontSize: fontSize,
                wordWrap: "on",
                minimap: { enabled: false },
                bracketPairColorization: true,
                suggest: { preview: true },
                inlineSuggest: {
                  enabled: true,
                  showToolbar: "onHover",
                  mode: "subword",
                  suppressSuggestions: false,
                },
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true,
                },
                suggestSelection: "recentlyUsed",
              }}
            />
          </Box>
          {/* Output is only visible when not expanded */}
          {!isExpanded && (
            <Output
              editorRef={editorRef}
              language_id={LANGUAGE_MAP[codeLanguage]}
            />
          )}
        </div>
      </Box>
    </div>
  );
}

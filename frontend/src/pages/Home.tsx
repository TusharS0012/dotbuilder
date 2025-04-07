import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { motion } from "framer-motion";

export function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/builder", { state: { prompt } });
    }
  };

  const reviews = [
    { name: "Alice", text: "This AI is amazing! It built my site in minutes." },
    { name: "Bob", text: "Super intuitive and easy to use. Highly recommended!" },
    { name: "Charlie", text: "Saved me so much time on my portfolio website!" },
    { name: "Diana", text: "The best website builder I've ever used!" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Website Builder AI</h2>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">Home</a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">Features</a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">Pricing</a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">Contact</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 mt-10">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Wand2 className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Website Builder AI
            </h1>
            <p className="text-lg text-gray-700">
              Describe your dream website, and we'll help you build it step by step.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build..."
                className="w-full h-32 p-4 bg-gray-100 text-gray-900 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none placeholder-gray-500"
              />
              <button
                type="submit"
                className="w-full mt-4 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Generate Website Plan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reviews Slider */}
      <div className="overflow-hidden mt-16 py-8 bg-gray-50 w-full relative">
        <motion.div
          className="flex space-x-6 w-full"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          style={{ display: "flex", width: "max-content" }}
        >
          {[...reviews, ...reviews].map((review, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 border border-gray-300 w-64 flex-shrink-0">
              <p className="text-gray-900 font-semibold">{review.name}</p>
              <p className="text-gray-700 text-sm mt-2">"{review.text}"</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

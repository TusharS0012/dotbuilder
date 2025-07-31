"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useInView, AnimatePresence, stagger } from "framer-motion";
import { Code, Users, Sparkles, GitBranch } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const features = [
    {
      icon: <Users />,
      title: "Real-time Collaboration",
      description:
        "Work together seamlessly with live code editing and live cursor support.",
      titleColor: "text-green-400",
      accentColor: "from-green-500 to-green-700",
    },
    {
      icon: <Sparkles />,
      title: "AI-driven Tools",
      description:
        "Get intelligent code suggestions instantly with comprehensive documentation.",
      titleColor: "text-yellow-400",
      accentColor: "from-yellow-500 to-yellow-700",
    },
    {
      icon: <Code />,
      title: "Smart Linting",
      description:
        "Identify and fix syntax errors effortlessly as you type with smart AI suggestions.",
      titleColor: "text-red-400",
      accentColor: "from-red-500 to-red-700",
    },
    {
      icon: <GitBranch />,
      title: "Real-time Chatbot Support",
      description: "Integrated AI chat bot for instant help and guidance.",
      titleColor: "text-purple-400",
      accentColor: "from-purple-500 to-purple-700",
    },
  ];

  const featuresRef = useRef(null);
  const areFeaturesInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });

  const testimonialRef = useRef(null);
  const areTestimonialsInView = useInView(testimonialRef, {
    once: true,
    margin: "-100px",
  });

  const codePreviewRef = useRef(null);
  const isCodePreviewInView = useInView(codePreviewRef, {
    once: true,
    margin: "-100px",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-200 to-gray-300 text-gray-900 relative overflow-hidden">
      {/* Floating background elements using Framer Motion */}
      <motion.div
        className="absolute w-24 h-24 bg-blue-200 rounded-full opacity-70 blur-xl -top-10 -left-10"
        animate={{
          y: [0, -40, 0], // Increased vertical movement
          x: [0, 20, 0], // Increased horizontal movement
          scale: [1, 1.1, 1], // Slightly more pronounced scale
          opacity: [0.7, 1, 0.7], // Wider opacity range
        }}
        transition={{
          duration: 9, // Adjusted duration
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "yoyo",
          delay: 0,
        }}
      ></motion.div>
      <motion.div
        className="absolute w-32 h-32 bg-purple-200 rounded-full opacity-60 blur-xl top-1/4 right-0"
        animate={{
          y: [0, 30, 0], // Increased vertical movement
          x: [0, -15, 0], // Increased horizontal movement
          scale: [1, 0.9, 1], // Slightly more pronounced scale
          opacity: [0.6, 0.9, 0.6], // Wider opacity range
        }}
        transition={{
          duration: 11, // Adjusted duration
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "yoyo",
          delay: 2,
        }}
      ></motion.div>
      <motion.div
        className="absolute w-16 h-16 bg-green-200 rounded-lg opacity-80 blur-lg bottom-20 left-1/3"
        animate={{
          y: [0, -25, 0], // Increased vertical movement
          x: [0, 10, 0], // Increased horizontal movement
          scale: [1, 1.07, 1], // Slightly more pronounced scale
          opacity: [0.8, 1, 0.8], // Wider opacity range
        }}
        transition={{
          duration: 8, // Adjusted duration
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "yoyo",
          delay: 1,
        }}
      ></motion.div>
      <motion.div
        className="absolute w-28 h-28 bg-yellow-200 rounded-full opacity-50 blur-xl top-1/2 left-10"
        animate={{
          y: [0, 35, 0], // Increased vertical movement
          x: [0, -20, 0], // Increased horizontal movement
          scale: [1, 0.93, 1], // Slightly more pronounced scale
          opacity: [0.5, 0.8, 0.5], // Wider opacity range
        }}
        transition={{
          duration: 10, // Adjusted duration
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "yoyo",
          delay: 3,
        }}
      ></motion.div>
      <motion.div
        className="absolute w-20 h-20 bg-pink-200 rounded-full opacity-75 blur-md bottom-10 right-20"
        animate={{
          y: [0, -20, 0], // Increased vertical movement
          x: [0, 15, 0], // Increased horizontal movement
          scale: [1, 1.05, 1], // Slightly more pronounced scale
          opacity: [0.7, 0.9, 0.7], // Wider opacity range
        }}
        transition={{
          duration: 7, // Adjusted duration
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "yoyo",
          delay: 4,
        }}
      ></motion.div>
      {/* End floating background elements */}

      {/* Hero Section */}
      <section className="text-center py-20 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            AI-Powered Code Editor
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            Write, collaborate, and debug with AI-assisted coding in real-time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
          >
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-10 py-7 text-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              whileHover={{ scale: 1.05, rotate: "2deg" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/register")}
            >
              Get Started - It's Free
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-10 py-16 relative z-10" ref={featuresRef}>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate={areFeaturesInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.1,
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Code Editor Preview */}
      <section
        className="flex justify-center items-center py-20 px-6 relative z-10"
        ref={codePreviewRef}
      >
        <motion.div
          className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl p-8 border border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className="flex gap-2 mb-6">
            <motion.div
              className="h-3 w-3 rounded-full bg-red-500"
              initial={{ scale: 0 }}
              animate={isCodePreviewInView ? { scale: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.3 }}
            />
            <motion.div
              className="h-3 w-3 rounded-full bg-yellow-500"
              initial={{ scale: 0 }}
              animate={isCodePreviewInView ? { scale: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.3 }}
            />
            <motion.div
              className="h-3 w-3 rounded-full bg-green-500"
              initial={{ scale: 0 }}
              animate={isCodePreviewInView ? { scale: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.3 }}
            />
          </div>
          <motion.div
            className="font-mono space-y-4 text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={isCodePreviewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.0, duration: 0.6, staggerChildren: 0.1 }}
          >
            <motion.p
              className="text-blue-400 flex items-center"
              variants={{
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
              }}
            >
              <span className="text-purple-400">function</span>
              <span className="mx-2">welcome()</span>{" "}
              <span className="ml-2 text-gray-500">{"{"}</span>
            </motion.p>
            <motion.p
              className="text-green-400 ml-4 flex items-center"
              variants={{
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
              }}
            >
              <span className="text-yellow-400">console</span>
              <span className="mx-2 text-white">.</span>
              <span className="text-blue-400">log</span>
              <span className="mx-2 text-white">(</span>
              <span className="text-green-300">
                "✨ Welcome to the Future of Coding ✨"
              </span>
              <span className="text-white">)</span>
              <span className="ml-2 animate-pulse text-gray-400">|</span>
            </motion.p>
            <motion.p
              className="text-blue-400"
              variants={{
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
              }}
            >
              {"}"}
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section
        className="px-10 py-16 text-center relative z-10"
        ref={testimonialRef}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          animate={areTestimonialsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          What Our Users Say
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          animate={areTestimonialsInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.1,
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <Testimonial
            name="Alex"
            feedback="This AI-powered editor has transformed the way I code! It's intuitive and incredibly helpful for debugging."
            animationDelay={0}
          />
          <Testimonial
            name="Taylor"
            feedback="The real-time collaboration is a game-changer for our team. We can work together seamlessly from anywhere."
            animationDelay={0.2}
          />
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="text-center py-8 text-gray-600 border-t border-gray-200 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        &copy; 2025 DotBuilder. All rights reserved.
      </motion.footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, titleColor, accentColor }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:border-transparent transition-colors group relative overflow-hidden">
        {/* Animated background on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${accentColor} rounded-2xl`}
          initial={{ opacity: 0, scale: 0.5 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <CardContent className="text-center flex flex-col items-center relative z-10">
          <motion.div
            className={`text-4xl mb-4 text-blue-600 group-hover:${titleColor} transition-colors duration-300`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {icon}
          </motion.div>
          <h3
            className={`text-xl font-semibold mb-2 ${titleColor} group-hover:text-blue-700 transition-colors`}
          >
            {title}
          </h3>
          <p className="text-gray-700 group-hover:text-gray-800 transition-colors">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Testimonial({ name, feedback, animationDelay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.6, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:border-purple-400 transition-colors">
        <CardContent className="relative">
          <div className="absolute top-4 left-4 text-6xl text-gray-300 opacity-50">
            “
          </div>
          <p className="italic text-gray-700 pt-8 px-4">{feedback}</p>
          <p className="text-blue-600 mt-4 font-medium">- {name}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

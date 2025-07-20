"use client"

import { motion } from "framer-motion"

export default function WelcomeScreen() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-light text-purple-300 mb-6">Hey there</h2>
      <h1 className="text-4xl font-bold mb-8 text-white">
        Help us match you with the <span className="text-purple-400">perfect issues</span> by sharing your skills
      </h1>
      <div className="mt-8 flex items-center justify-center">
        <div className="w-16 h-1 bg-purple-500 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  )
}

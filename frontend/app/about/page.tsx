"use client"

import { motion } from "framer-motion"
import { Code, Rocket, BarChart3, Target, Globe } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Mission
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-purple-500 mx-auto mb-10"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </div>
      </section>

      {/* What We Do Section - Centered without box */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-2xl font-bold mb-6 inline-flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Code className="mr-3 text-purple-400" />
            What We Do
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            We help developers contribute to open source by matching them with GitHub issues tailored to their
            experience and interests using AI. No more scrolling. Just contributing.
          </motion.p>
        </div>
      </section>

      {/* What Developers Get */}
      <section className="py-12 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            What Developers Get
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gray-800 p-6 rounded-xl border border-purple-800/20 shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-start">
                <div className="bg-purple-800/30 p-3 rounded-lg mr-4">
                  <Code className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-purple-200">Smart Issue Matching</h3>
                  <p className="text-gray-300">Get AI-curated GitHub issues aligned to your skills and history.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 p-6 rounded-xl border border-purple-800/20 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-start">
                <div className="bg-purple-800/30 p-3 rounded-lg mr-4">
                  <Rocket className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-purple-200">Fast Onboarding</h3>
                  <p className="text-gray-300">No setup or fluff — just connect GitHub and go.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 p-6 rounded-xl border border-purple-800/20 shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-start">
                <div className="bg-purple-800/30 p-3 rounded-lg mr-4">
                  <BarChart3 className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-purple-200">Track Your Impact</h3>
                  <p className="text-gray-300">See your matched issues, completed contributions, and growth over time.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 p-6 rounded-xl border border-purple-800/20 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="flex items-start">
                <div className="bg-purple-800/30 p-3 rounded-lg mr-4">
                  <Target className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-purple-200">Personalized Dashboard</h3>
                  <p className="text-gray-300">A clean, focused space showing your active issues, repos, and suggested matches.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Join the Movement - Without box */}
      <section className="py-16 px-4 bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 inline-flex items-center justify-center">
              <Globe className="mr-3 text-purple-400" />
              Join the Movement
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Whether you're a first-time contributor or a seasoned maintainer — this is your space.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
            {/* Team Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            Meet the Team
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Avishkar Patil", role: "Developer", image: "https://i.ibb.co/yBpJH5jb/Whats-App-Image-2025-04-19-at-20-41-54-105f9c33-Copy.jpg" },
              { name: "Tushar Lakeri", role: "Developer", image: "https://i.ibb.co/VW7g0YL5/Whats-App-Image-2025-04-19-at-20-41-36-99770418-Copy.jpg" },
              { name: "Rahul Manchare", role: "Developer", image: "https://i.ibb.co/HfS1CK1N/Whats-App-Image-2025-04-19-at-11-10-27-c635014f.jpg" },
              { name: "Pankaj Warvante", role: "Developer", image: "https://i.ibb.co/LX4HSwtD/Whats-App-Image-2025-04-19-at-20-41-08-d155b890-Copy.jpg" },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              >
                <div className="relative mb-3"> {/* Increased bottom margin from 6 to 10 */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-600 relative z-10">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%+16px)] h-[calc(100%+16px)] bg-gradient-to-b from-purple-600/0 to-purple-600 rounded-full -z-10"></div>
                  {/* Removed the third div that was causing overlap issues */}
                </div>
                <div className="bg-gray-800 px-6 py-4 rounded-xl border border-purple-800/20 shadow-lg text-center w-full mt-[-30px] pt-6"> {/* Adjusted mt from -20px to -30px */}
                  <h3 className="font-bold text-lg text-purple-200">{member.name}</h3>
                  <p className="text-purple-400/80">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
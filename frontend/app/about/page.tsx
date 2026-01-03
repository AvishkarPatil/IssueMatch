"use client"

import { motion } from "framer-motion"
import { Code, Rocket, BarChart3, Target, Sparkles, Users, Zap } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e88951]/5 to-transparent"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e88951]/10 border border-[#e88951]/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-4 h-4 text-[#e88951]" />
            <span className="text-sm font-medium text-[#e88951]">About IssueMatch</span>
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Connecting Developers with
            <span className="block text-[#e88951]">Open Source</span>
          </motion.h1>
          
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We help developers contribute to open source by matching them with GitHub issues tailored to their experience and interests using AI.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5,000+", label: "Developers" },
              { value: "30,000+", label: "Issues Matched" },
              { value: "7,500+", label: "Contributions" },
              { value: "1,000+", label: "Repositories" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <div className="text-4xl font-bold text-[#e88951] mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">What Developers Get</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Everything you need to succeed in open source</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Code,
                title: "Smart Issue Matching",
                description: "Get AI-curated GitHub issues aligned to your skills and history."
              },
              {
                icon: Rocket,
                title: "Fast Onboarding",
                description: "No setup or fluff — just connect GitHub and go."
              },
              {
                icon: BarChart3,
                title: "Track Your Impact",
                description: "See your matched issues, completed contributions, and growth over time."
              },
              {
                icon: Target,
                title: "Personalized Dashboard",
                description: "A clean, focused space showing your active issues, repos, and suggested matches."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group relative bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-[#e88951]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#e88951]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#e88951]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-[#e88951]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <h2 className="text-4xl font-bold mb-4">Meet the Team</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">The brilliant minds behind IssueMatch</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Avishkar Patil", role: "Developer", image: "https://i.ibb.co/yBpJH5jb/Whats-App-Image-2025-04-19-at-20-41-54-105f9c33-Copy.jpg" },
              { name: "Tushar Lakeri", role: "Developer", image: "https://i.ibb.co/VW7g0YL5/Whats-App-Image-2025-04-19-at-20-41-36-99770418-Copy.jpg" },
              { name: "Rahul Manchare", role: "Developer", image: "https://i.ibb.co/HfS1CK1N/Whats-App-Image-2025-04-19-at-11-10-27-c635014f.jpg" },
              { name: "Pankaj Warvante", role: "Developer", image: "https://i.ibb.co/LX4HSwtD/Whats-App-Image-2025-04-19-at-20-41-08-d155b890-Copy.jpg" },
            ].map((member, i) => (
              <motion.div
                key={i}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 + i * 0.1 }}
              >
                <div className="relative">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#e88951]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800">
                      <h3 className="font-bold text-base mb-0.5">{member.name}</h3>
                      <p className="text-sm text-[#e88951]">{member.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <Users className="w-16 h-16 text-[#e88951] mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Join the Movement</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Whether you're a first-time contributor or a seasoned maintainer — this is your space.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-[#e88951] hover:bg-[#d67840] text-white font-semibold px-8 py-4 rounded-full transition-all hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Get Started Now
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

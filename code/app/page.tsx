"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, ArrowRight, User } from "lucide-react"
import { BackgroundCircles } from "@/components/ui/shadcn-io/background-circles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { MacbookScroll } from "@/components/ui/macbook-scroll"

export default function HomePage() {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const smoothScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.querySelector(targetId)
    if (target) {
      const offset = 70
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }

  const teamMembers = [
    {
      id: 1,
      name: "Mrunal Samal",
      designation: "Backend Engineer (Java + Firebase)",
      image: "/team/mrunal-samal.jpg", // Updated to use new team member photo
    },
    {
      id: 2,
      name: "Anshul Kumar Sharmma",
      designation: "Frontend & UI/UX Designer (React + Figma)",
      image: "/team/anshul-kumar.jpg", // Fixed filename from anshul-sharma.jpg to anshul-kumar.jpg
    },
    {
      id: 3,
      name: "Debjit Mandal",
      designation: "UI/UX Designer (Figma + Report + PPT)",
      image: "/team/debjit-mandal.jpg", // Updated to use new team member photo
    },
    {
      id: 4,
      name: "Uditi Singh",
      designation: "PPT and Architecture Diagram",
      image: "/team/uditi-singh.jpg", // Updated to use new team member photo
    },
  ]

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
      {/* Header - Added sticky behavior with conditional styling */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isSticky
            ? "bg-[#242126]/95 backdrop-blur-md border-b border-[#49454f]/50 shadow-lg"
            : "bg-transparent border-b border-[#49454f]/30 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Satyanetra</span>
            </div>
            <div className="flex items-center gap-8">
              <a
                href="#home"
                onClick={(e) => smoothScrollTo(e, "#home")}
                className="text-white hover:text-[#d425e3] transition-colors cursor-pointer"
              >
                Home
              </a>
              <Link href="/analysis" className="text-[#9ca3af] hover:text-white transition-colors">
                Analysis
              </Link>
              <Link href="/dashboard" className="text-[#9ca3af] hover:text-white transition-colors">
                Dashboard
              </Link>
              <a
                href="#about"
                onClick={(e) => smoothScrollTo(e, "#about")}
                className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
              >
                About us
              </a>
              <Button asChild className="gradient-purple text-white border-0 hover:opacity-90 rounded-full px-6">
                <Link href="/login">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section - Added id for smooth scroll and mouse indicator */}
      <section
        id="home"
        className="relative container mx-auto px-6 py-20 pt-32 text-center overflow-hidden min-h-screen flex flex-col justify-center"
      >
        {/* Background animation covering entire section */}
        <div className="absolute inset-0 -mx-6">
          <BackgroundCircles variant="primary" className="h-full w-full" />
        </div>

        {/* Content on top of animation */}
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full gradient-purple flex items-center justify-center shadow-2xl shadow-[#d425e3]/50 animate-pulse">
              <Eye className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">Satyanetra — The Eye of Truth</h1>

          <TextGenerateEffect
            words="AI that detects fake reviews and manipulated product listings - And make informed decisions with confidence."
            className="text-[#9ca3af] text-lg max-w-2xl mx-auto mb-8 font-normal"
            duration={0.5}
          />

          <Button
            asChild
            className="gradient-purple text-white border-0 hover:opacity-90 rounded-full px-8 py-6 text-lg"
          >
            <Link href="/login">
              Start Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>

          <p className="text-[#9ca3af] text-sm mt-4">© Satyanetra 2023</p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[26px] h-[46px] rounded-full border-2 border-[#d425e3] flex justify-center pt-2">
            <div className="w-[2px] h-[2px] bg-[#d425e3] rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">About Us</h2>

        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <p className="text-[#9ca3af] text-lg leading-relaxed">
            In today's digital marketplace, fake reviews and manipulated product listings mislead millions of online
            shoppers every day.
          </p>

          <p className="text-[#9ca3af] text-lg leading-relaxed">
            Satyanetra is an AI-powered platform designed to detect deception and restore trust in e-commerce.
          </p>

          <p className="text-[#9ca3af] text-lg leading-relaxed">
            By combining artificial intelligence, natural language processing, and computer vision, Satyanetra analyzes
            product images, customer reviews, and seller credibility to generate a Trust Score — a simple, clear measure
            of authenticity.
          </p>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="w-full overflow-hidden bg-[#1c1c1c] dark:bg-[#1c1c1c]">
        <MacbookScroll
          title={
            <span className="text-white">
              How Satyanetra Works <br /> AI-Powered Trust Analysis
            </span>
          }
          showGradient={false}
        >
          <div className="space-y-3">
            <div className="bg-[#242126]/80 backdrop-blur-sm border border-[#49454f]/50 rounded-lg p-4 hover:border-[#d425e3]/50 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center shadow-lg shadow-[#d425e3]/30">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base mb-1.5">Fetch Product Data</h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed">
                    The system collects product details, including reviews, images, and seller details.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#242126]/80 backdrop-blur-sm border border-[#49454f]/50 rounded-lg p-4 hover:border-[#d425e3]/50 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center shadow-lg shadow-[#d425e3]/30">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base mb-1.5">Analyze Reviews</h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed">
                    Using NLP and sentiment analysis, Satyanetra searches patterns of fake or generated reviews and
                    evaluates their genuineness.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#242126]/80 backdrop-blur-sm border border-[#49454f]/50 rounded-lg p-4 hover:border-[#d425e3]/50 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center shadow-lg shadow-[#d425e3]/30">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base mb-1.5">Verify Images</h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed">
                    Our AI model checks for image manipulation, duplicates, and quality inconsistencies.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#242126]/80 backdrop-blur-sm border border-[#49454f]/50 rounded-lg p-4 hover:border-[#d425e3]/50 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center shadow-lg shadow-[#d425e3]/30">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base mb-1.5">Evaluate Seller Credibility</h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed">
                    The system assesses seller performance, customer ratings, and past reliability.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#242126]/80 backdrop-blur-sm border border-[#49454f]/50 rounded-lg p-4 hover:border-[#d425e3]/50 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center shadow-lg shadow-[#d425e3]/30">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base mb-1.5">Generate Trust Score</h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed">
                    Finally, using Bayesian probability and a custom scoring score (0-100), Satyanetra delivers a Trust
                    Score that reflects overall product decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MacbookScroll>
      </section>

      {/* Team Section */}
      <section id="team" className="container mx-auto px-6 py-16">
        <p className="text-[#9ca3af] text-center mb-12 max-w-3xl mx-auto">
          Satyanetra was developed by a passionate student team focused on the intersection of AI, data analysis, and
          web technologies.
        </p>

        <div className="flex flex-row items-center justify-center w-full">
          <AnimatedTooltip items={teamMembers} />
        </div>
      </section>
    </div>
  )
}

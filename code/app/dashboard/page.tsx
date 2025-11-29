"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, User, Loader2, AlertCircle } from "lucide-react"
import { getProductScore } from "@/lib/api"
import { mockProductScore } from "@/lib/mock"

function DashboardContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setData(mockProductScore)
        setDemoMode(true)
        setLoading(false)
        return
      }

      try {
        const response = await getProductScore(productId)
        console.log("[v0] Product score:", response)
        setData(response)
        setLoading(false)
      } catch (err: any) {
        console.error("[v0] Dashboard error:", err)

        if (err.message.includes("409")) {
          setError("Analysis not ready yet. Please wait a moment and refresh.")
        } else {
          setData(mockProductScore)
          setDemoMode(true)
        }
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#d425e3] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
      {/* Header */}
      <header className="border-b border-[#49454f] bg-[#242126]">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Satyanetra</span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/" className="text-[#9ca3af] hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/analysis" className="text-[#9ca3af] hover:text-white transition-colors">
                Analysis
              </Link>
              <Link href="/dashboard" className="text-white hover:text-[#d425e3] transition-colors">
                Dashboard
              </Link>
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

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        {demoMode && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <p className="text-blue-400">Demo Mode — Showing example results</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <p className="text-red-400">{error}</p>
              <Link href="/progress" className="text-[#d425e3] hover:underline text-sm mt-1 inline-block">
                Return to progress page
              </Link>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-2">Trust Analysis Dashboard</h1>
        {data?.productDetails && (
          <p className="text-[#9ca3af] mb-8">
            {data.productDetails.name} • Analyzed {new Date(data.productDetails.analyzedAt).toLocaleString()}
          </p>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#242126] border-[#49454f] p-8">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="#49454f" strokeWidth="12" fill="none" />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(data?.overallScore || 0) * 5.026} ${100 * 5.026}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#d425e3" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white">{data?.overallScore || 0}</div>
                      <div className="text-[#9ca3af] text-sm">Trust Score</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                  <span className="text-[#9ca3af]">0-25 Critical Trust</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
                  <span className="text-[#9ca3af]">26-75 Reliable Trust</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
                  <span className="text-[#9ca3af]">76-100 High Trust</span>
                </div>
              </div>
            </Card>

            {/* Analysis Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-[#242126] border-[#49454f] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#d425e3]"></div>
                  <h3 className="text-white font-semibold">Review Analysis</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Fake Reviews</span>
                    <span className="text-white font-semibold">{data?.reviewAnalysis?.fakeReviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Total Reviews</span>
                    <span className="text-white font-semibold">{data?.reviewAnalysis?.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Score</span>
                    <span className="text-white font-semibold">{data?.reviewAnalysis?.score || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#242126] border-[#49454f] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#22d3ee]"></div>
                  <h3 className="text-white font-semibold">Image Verification</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Total Images</span>
                    <span className="text-white font-semibold">{data?.imageVerification?.totalImages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Verified</span>
                    <span className="text-white font-semibold">{data?.imageVerification?.verifiedImages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Score</span>
                    <span className="text-white font-semibold">{data?.imageVerification?.score || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#242126] border-[#49454f] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
                  <h3 className="text-white font-semibold">Seller Credibility</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Rating</span>
                    <span className="text-white font-semibold">{data?.sellerCredibility?.rating || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Verified</span>
                    <span
                      className={`font-semibold ${data?.sellerCredibility?.verifiedSeller ? "text-[#4ade80]" : "text-red-400"}`}
                    >
                      {data?.sellerCredibility?.verifiedSeller ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Score</span>
                    <span className="text-white font-semibold">{data?.sellerCredibility?.score || 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Product Details Sidebar */}
          <Card className="bg-[#242126] border-[#49454f] p-6">
            <h3 className="text-white font-bold mb-6">Product Details</h3>
            {data?.productDetails && (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[#9ca3af] mb-1">Product Name</p>
                  <p className="text-white">{data.productDetails.name}</p>
                </div>
                <div>
                  <p className="text-[#9ca3af] mb-1">URL</p>
                  <a
                    href={data.productDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d425e3] hover:underline break-all"
                  >
                    {data.productDetails.url}
                  </a>
                </div>
                <div>
                  <p className="text-[#9ca3af] mb-1">Analyzed At</p>
                  <p className="text-white">{new Date(data.productDetails.analyzedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <p className="text-[#9ca3af] text-sm text-center mt-8">© Satyanetra 2023</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#d425e3] animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}

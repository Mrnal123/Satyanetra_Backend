"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, User, Check, Loader2, AlertCircle } from "lucide-react"
import { getJobStatus } from "@/lib/api"

function ProgressContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get("jobId")
  const productId = searchParams.get("productId")

  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"pending" | "processing" | "completed" | "failed">("pending")
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    if (!jobId || !productId) {
      setError("Missing job ID or product ID. Please start a new analysis.")
      return
    }

    const initialDelay = setTimeout(() => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await getJobStatus(jobId)
          console.log("[v0] Job status:", response)

          setRetryCount(0)
          setStatus(response.status)
          setProgress(response.progress || 0)

          if (response.logs && Array.isArray(response.logs)) {
            setLogs(response.logs)
          }

          if (response.status === "completed") {
            clearInterval(pollInterval)
            setTimeout(() => {
              router.push(`/dashboard?productId=${productId}`)
            }, 1500)
          }

          if (response.status === "failed") {
            clearInterval(pollInterval)
            setError(response.error || "Analysis failed")
          }
        } catch (err: any) {
          console.error("[v0] Poll error:", err)

          if (err.message.includes("job_not_found")) {
            if (retryCount < maxRetries) {
              console.log(`[v0] Job not found, retrying... (${retryCount + 1}/${maxRetries})`)
              setRetryCount((prev) => prev + 1)
              setError(`Job not found, retrying... (${retryCount + 1}/${maxRetries})`)
              return
            } else {
              setError(
                "Job not found. The analysis may have expired or the job ID is invalid. Please start a new analysis.",
              )
              clearInterval(pollInterval)
            }
          } else {
            setError(err.message || "Failed to fetch status")
            clearInterval(pollInterval)
          }
        }
      }, 3000)

      return () => clearInterval(pollInterval)
    }, 1000)

    return () => clearTimeout(initialDelay)
  }, [jobId, productId, router, retryCount])

  const renderError = () => {
    if (!error) return null

    const isJobNotFound = error.includes("job_not_found") || error.includes("Job not found")
    const isMissingParams = error.includes("Missing job ID")

    return (
      <Card className="bg-[#242126] border-[#49454f] p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4 text-lg font-semibold">
            {isJobNotFound ? "Analysis Not Found" : isMissingParams ? "Invalid Request" : "Error"}
          </p>
          <p className="text-[#9ca3af] mb-6 text-sm">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/analysis")} className="gradient-purple text-white border-0">
              Start New Analysis
            </Button>
            {!isMissingParams && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-[#49454f] text-white hover:bg-[#1c1c1c] bg-transparent"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
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
              <Link href="/dashboard" className="text-[#9ca3af] hover:text-white transition-colors">
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

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            {status === "completed" ? "Analysis Complete!" : "Analysis in Progress"}
          </h2>

          {!error && (
            <div className="flex justify-center mb-12">
              <div className="relative">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle cx="128" cy="128" r="100" stroke="#49454f" strokeWidth="16" fill="none" />
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke="url(#gradient2)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${progress * 6.283} ${100 * 6.283}`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d425e3" />
                      <stop offset="100%" stopColor="#f709ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-white">{Math.round(progress)}%</div>
                    <div className="text-[#9ca3af] text-sm mt-2 capitalize">{status}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error ? (
            renderError()
          ) : (
            <Card className="bg-[#242126] border-[#49454f] p-6">
              {logs.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {status === "completed" || index < logs.length - 1 ? (
                        <Check className="w-5 h-5 text-[#4ade80] flex-shrink-0" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-[#d425e3] animate-spin flex-shrink-0" />
                      )}
                      <span className="text-white">{log}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[#d425e3] animate-spin" />
                    <span className="text-white">Initializing analysis...</span>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#d425e3] animate-spin" />
        </div>
      }
    >
      <ProgressContent />
    </Suspense>
  )
}

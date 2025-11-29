"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Eye, User, Search, AlertCircle, Info, Wifi, WifiOff } from "lucide-react"
import { ingestProduct, isApiConfigured, getApiBaseUrl, testConnection } from "@/lib/api"

export default function AnalysisPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    latency?: number
  } | null>(null)
  const router = useRouter()

  const apiConfigured = isApiConfigured()

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus(null)
    const result = await testConnection()
    setConnectionStatus(result)
    setTestingConnection(false)
  }

  const handleAnalyze = async () => {
    setError("")
    setConnectionStatus(null)

    if (!url) {
      setError("Please enter a product URL")
      return
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (must start with http:// or https://)")
      return
    }

    if (!apiConfigured) {
      setError(
        "Backend API is not configured. Please set the NEXT_PUBLIC_API_BASE environment variable or use Demo Mode.",
      )
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Starting product analysis for URL:", url)
      const response = await ingestProduct(url)
      console.log("[v0] Ingest response:", response)

      if (response.jobId && response.productId) {
        router.push(`/progress?jobId=${response.jobId}&productId=${response.productId}`)
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err: any) {
      console.error("[v0] Ingest error:", err)

      let errorMessage = err.message || "Failed to start analysis. Please try again."

      // If error message contains JSON, try to extract the message field
      if (errorMessage.includes("{") && errorMessage.includes("}")) {
        try {
          // Extract JSON from error message (format: "HTTP 504: {...}")
          const jsonMatch = errorMessage.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[0])
            errorMessage = errorData.message || errorData.error || errorMessage
          }
        } catch (parseError) {
          // If parsing fails, use the original message
        }
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    router.push("/dashboard?demo=true")
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
              <Link href="/analysis" className="text-white hover:text-[#d425e3] transition-colors">
                Analysis
              </Link>
              <Link href="/dashboard" className="text-[#9ca3af] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="#about" className="text-[#9ca3af] hover:text-white transition-colors">
                About us
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

      {/* Analysis Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Analyze Product</h1>
          <p className="text-[#9ca3af] text-center mb-12">Enter any product URL to verify its authenticity</p>

          {apiConfigured && !connectionStatus && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-400 font-semibold mb-1">Processing Time Notice</p>
                  <p className="text-blue-400/80 text-sm">
                    Analysis can take 30-90 seconds as we scrape reviews and run AI analysis. The backend may also need
                    time to wake up if it has been inactive. Please be patient!
                  </p>
                </div>
              </div>
            </div>
          )}

          {!apiConfigured && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-semibold mb-1">Backend API Not Configured</p>
                  <p className="text-yellow-400/80 text-sm mb-2">
                    The backend API URL is not set. Current API base:{" "}
                    <code className="bg-black/30 px-1 rounded">{getApiBaseUrl()}</code>
                  </p>
                  <p className="text-yellow-400/80 text-sm">
                    To connect to the backend, set the{" "}
                    <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_API_BASE</code> environment variable. Or try
                    Demo Mode to see how the app works with sample data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {apiConfigured && connectionStatus && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                connectionStatus.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {connectionStatus.success ? (
                  <Wifi className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold mb-1 ${connectionStatus.success ? "text-green-400" : "text-red-400"}`}>
                    {connectionStatus.success ? "Backend Connected" : "Backend Unreachable"}
                  </p>
                  <p className={`text-sm ${connectionStatus.success ? "text-green-400/80" : "text-red-400/80"}`}>
                    {connectionStatus.message}
                    {connectionStatus.latency && ` (${connectionStatus.latency}ms)`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Card className="bg-[#242126] border-[#49454f] p-8 mb-8">
            <label className="text-white font-semibold mb-4 block">Product URL</label>
            <div className="flex gap-4">
              <Input
                type="url"
                placeholder="https://www.amazon.com/product/example"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="flex-1 bg-[#1c1c1c] border-[#49454f] text-white placeholder:text-[#6b7280]"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-400 text-sm whitespace-pre-line">{error}</div>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!url || loading}
              className="w-full mt-6 gradient-purple text-white border-0 hover:opacity-90 py-6 text-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing... This may take 30-90 seconds
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Analyze Now
                </>
              )}
            </Button>

            <div className="flex gap-4 mt-4">
              {apiConfigured && (
                <Button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  variant="outline"
                  className="flex-1 border-[#49454f] text-white hover:bg-[#1c1c1c] bg-transparent"
                >
                  {testingConnection ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleDemoMode}
                variant="outline"
                className="flex-1 border-[#49454f] text-white hover:bg-[#1c1c1c] bg-transparent"
              >
                Try Demo Mode
              </Button>
            </div>

            <div className="flex gap-4 mt-6 text-sm text-[#9ca3af]">
              <button className="hover:text-white transition-colors">Amazon</button>
              <button className="hover:text-white transition-colors">Flipkart</button>
              <button className="hover:text-white transition-colors">eBay</button>
              <button className="hover:text-white transition-colors">Myntra</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

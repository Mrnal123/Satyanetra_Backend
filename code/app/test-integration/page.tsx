"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, Play, CheckCircle, XCircle } from "lucide-react"
import { ingestProduct, getJobStatus, getProductScore } from "@/lib/api"

export default function TestIntegrationPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const runTest = async () => {
    setLogs([])
    setRunning(true)
    setSuccess(null)

    try {
      // Step 1: Ingest
      addLog("Step 1: Testing POST /api/ingest...")
      const testUrl = "https://www.amazon.com/test-product"
      const ingestResponse = await ingestProduct(testUrl)
      addLog(`✓ Ingest successful: jobId=${ingestResponse.jobId}, productId=${ingestResponse.productId}`)

      // Step 2: Poll status
      addLog("Step 2: Testing GET /api/score/status/:jobId...")
      const statusResponse = await getJobStatus(ingestResponse.jobId)
      addLog(`✓ Status check successful: status=${statusResponse.status}, progress=${statusResponse.progress}%`)

      // Step 3: Get score
      addLog("Step 3: Testing GET /api/score/:productId...")
      const scoreResponse = await getProductScore(ingestResponse.productId)
      addLog(`✓ Score fetch successful: overallScore=${scoreResponse.overallScore}`)

      addLog("✓ All tests passed!")
      setSuccess(true)
    } catch (err: any) {
      addLog(`✗ Test failed: ${err.message}`)
      setSuccess(false)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
      <header className="border-b border-[#49454f] bg-[#242126]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Satyanetra - Integration Test</span>
            </div>
            <Link href="/" className="text-[#9ca3af] hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">Backend Integration Test</h1>
          <p className="text-[#9ca3af] mb-8">
            Test the connection to Trae backend API: {process.env.NEXT_PUBLIC_API_BASE || "Not configured"}
          </p>

          <Card className="bg-[#242126] border-[#49454f] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">End-to-End Test</h2>
              <Button onClick={runTest} disabled={running} className="gradient-purple text-white border-0">
                {running ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Test
                  </>
                )}
              </Button>
            </div>

            {success !== null && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                {success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">All tests passed!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">Tests failed. Check logs below.</span>
                  </>
                )}
              </div>
            )}

            <div className="bg-[#1c1c1c] rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-[#6b7280]">Click "Run Test" to start...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-[#9ca3af] mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-[#242126] border-[#49454f] p-6">
            <h3 className="text-white font-bold mb-4">Environment Variables</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">NEXT_PUBLIC_API_BASE:</span>
                <span className="text-white font-mono">{process.env.NEXT_PUBLIC_API_BASE || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">NEXT_PUBLIC_FRONTEND_ORIGIN:</span>
                <span className="text-white font-mono">{process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "Not set"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

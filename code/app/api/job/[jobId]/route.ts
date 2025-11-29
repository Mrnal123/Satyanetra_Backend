import { type NextRequest, NextResponse } from "next/server"

let BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || process.env.BACKEND_URL || "http://localhost:10000"
BACKEND_URL = BACKEND_URL.replace(/\/$/, "")
if (!BACKEND_URL.startsWith("http://") && !BACKEND_URL.startsWith("https://")) {
  BACKEND_URL = `http://${BACKEND_URL}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    console.log("[v0] API Proxy: Fetching job status for", jobId)

    const backendUrl = `${BACKEND_URL}/api/score/status/${jobId}`
    console.log("[v0] Fetching from:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("[v0] Backend response status:", response.status)

    const text = await response.text()
    console.log("[v0] Backend response text:", text.substring(0, 200))

    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.error("[v0] Backend returned HTML instead of JSON")
      return NextResponse.json(
        {
          error: "backend_error",
          message: "Backend returned an error page. The endpoint may not exist or the backend is misconfigured.",
        },
        { status: 502 },
      )
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(text)
      console.log("[v0] Job status:", data.status, "from", backendUrl)
      return NextResponse.json(data, { status: response.status })
    } catch (parseError) {
      // Backend returned non-JSON response
      console.error("[v0] Backend returned non-JSON response:", text.substring(0, 200))

      if (!response.ok) {
        return NextResponse.json(
          {
            error: "backend_error",
            message: text.substring(0, 200) || `Backend returned ${response.status}`,
            status: response.status,
          },
          { status: response.status },
        )
      }

      return NextResponse.json(
        {
          error: "invalid_response",
          message: "Backend returned non-JSON response",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] API Proxy error:", error)
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

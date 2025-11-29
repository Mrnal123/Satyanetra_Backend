export async function OPTIONS() {
  // Allow the connection test without posting
  return new Response(null, { status: 204 })
}

export async function POST(req: Request) {
  try {
    const { url, platform } = await req.json()

    if (!url || typeof url !== "string") {
      return Response.json({ error: "missing_url" }, { status: 400 })
    }

    // Default platform to "web" if not provided
    const body = JSON.stringify({ url, platform: platform ?? "web" })

    // Prefer env-based configuration for local/dev/prod
    let apiBase = process.env.NEXT_PUBLIC_API_BASE || process.env.BACKEND_URL || "http://localhost:10000"

    // Remove trailing slash if present
    apiBase = apiBase.replace(/\/$/, "")

    // Ensure protocol is present
    if (!apiBase.startsWith("http://") && !apiBase.startsWith("https://")) {
      apiBase = `http://${apiBase}`
    }

    const backendUrl = `${apiBase}/api/ingest`
    console.log("[v0] Proxying ingest request to backend:", backendUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout

    try {
      const resp = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const text = await resp.text()
      console.log("[v0] Backend response status:", resp.status)
      console.log("[v0] Backend response text:", text.substring(0, 200))

      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        console.error("[v0] Backend returned HTML instead of JSON")
        return Response.json(
          {
            error: "backend_error",
            message:
              "The backend returned an error page instead of data. This usually means:\n\n" +
              "1. The backend URL is incorrect or the endpoint doesn't exist\n" +
              "2. The backend is experiencing issues\n" +
              "3. There's a routing problem\n\n" +
              "Please check the backend configuration or try Demo Mode.",
          },
          { status: 502 },
        )
      }

      if (text.includes("FUNCTION_INVOCATION_TIMEOUT") || text.includes("TIMEOUT")) {
        console.error("[v0] Backend timeout detected")
        return Response.json(
          {
            error: "backend_timeout",
            message:
              "The backend is taking too long to process this request. This usually happens when:\n\n" +
              "1. The product has many reviews to analyze\n" +
              "2. The backend is waking up from sleep\n" +
              "3. The AI analysis is taking longer than expected\n\n" +
              "Please try:\n" +
              "- A product with fewer reviews\n" +
              "- Waiting a minute and trying again\n" +
              "- Using Demo Mode to see how the app works",
          },
          { status: 504 },
        )
      }

      // Try to parse as JSON
      try {
        const json = JSON.parse(text)
        return Response.json(json, { status: resp.status })
      } catch (parseError) {
        // Backend returned non-JSON response (likely an error message)
        console.error("[v0] Backend returned non-JSON response:", text.substring(0, 200))

        // If backend returned an error status, wrap the text in a JSON error
        if (!resp.ok) {
          return Response.json(
            {
              error: "backend_error",
              message: text.substring(0, 200) || `Backend returned ${resp.status}`,
              status: resp.status,
            },
            { status: resp.status },
          )
        }

        // If status was OK but response wasn't JSON, that's unexpected
        return Response.json(
          {
            error: "invalid_response",
            message: "Backend returned non-JSON response",
          },
          { status: 500 },
        )
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.error("[v0] Request timed out after 90 seconds")
        return Response.json(
          {
            error: "request_timeout",
            message:
              "The request took too long (>90 seconds). The backend may be processing a large number of reviews. Please try a different product or use Demo Mode.",
          },
          { status: 504 },
        )
      }

      throw fetchError
    }
  } catch (err: any) {
    console.error("[v0] Proxy error:", err)
    return Response.json({ error: "proxy_error", message: err?.message || "Unknown error" }, { status: 500 })
  }
}

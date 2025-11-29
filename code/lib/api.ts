// API wrapper for Satyanetra backend integration
// Uses Next.js API routes as a proxy to avoid CORS issues

const API = "" // Use relative URLs to hit Next.js API routes

export function isApiConfigured(): boolean {
  // Always true since we're using Next.js API proxy routes
  return true
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:10000"
}

async function fetchJson(path: string, opts: RequestInit = {}, retry = 2): Promise<any> {
  const url = `${API}${path.startsWith("/") ? path : "/" + path}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  }

  console.log("[v0] API Request:", { url, method: opts.method || "GET" })

  try {
    const controller = new AbortController()
    const timeoutMs = retry === 2 ? 30000 : 10000
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const res = await fetch(url, {
      ...opts,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("[v0] API Response:", { status: res.status, ok: res.ok })

    if (!res.ok) {
      const text = await res.text()
      console.error("[v0] API Error Response:", text)
      throw new Error(`HTTP ${res.status}: ${text}`)
    }

    const data = await res.json()
    console.log("[v0] API Response Data:", data)
    return data
  } catch (err: any) {
    let errorMessage = err?.message || "Unknown error"
    let errorType = "Unknown Error"

    if (err?.name === "AbortError") {
      errorType = "Timeout"
      errorMessage = "Request timed out. The backend might be waking up (this can take 30-60 seconds on free hosting)."
    } else if (errorMessage === "Failed to fetch") {
      errorType = "Network Error"
      errorMessage = "Cannot connect to API. Please check your internet connection."
    }

    console.error("[v0] API Fetch Error:", {
      type: errorType,
      message: errorMessage,
      originalError: err?.message,
      url,
      retry: retry > 0 ? `Retrying (${retry} attempts left)` : "No retries left",
    })

    if (retry > 0) {
      console.log("[v0] Waiting 2 seconds before retry...")
      await new Promise((r) => setTimeout(r, 2000))
      return fetchJson(path, opts, retry - 1)
    }

    const finalError = new Error(errorMessage)
    ;(finalError as any).name = errorType
    throw finalError
  }
}

export async function testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
  const backendUrl = getApiBaseUrl()
  const startTime = Date.now()

  try {
    const response = await fetch("/api/ingest", {
      method: "OPTIONS", // Use OPTIONS to test without actually posting
      signal: AbortSignal.timeout(10000),
    })

    const latency = Date.now() - startTime

    if (response.ok || response.status === 405) {
      // 405 is OK, means route exists
      return { success: true, message: `API proxy is working (backend: ${backendUrl})`, latency }
    } else {
      return { success: false, message: `API proxy returned status ${response.status}`, latency }
    }
  } catch (err: any) {
    const latency = Date.now() - startTime
    if (err?.name === "AbortError") {
      return { success: false, message: "Connection timeout", latency }
    }
    return { success: false, message: err?.message || "Cannot reach API", latency }
  }
}

export async function ingestProduct(url: string) {
  return fetchJson("/api/ingest", {
    method: "POST",
    body: JSON.stringify({ url, platform: "web" }),
  })
}

export async function getJobStatus(jobId: string) {
  return fetchJson(`/api/job/${jobId}`)
}

export async function getProductScore(productId: string) {
  return fetchJson(`/api/product/${productId}`)
}

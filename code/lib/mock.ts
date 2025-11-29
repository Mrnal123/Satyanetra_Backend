// Mock data for demo mode when backend is unreachable
export const mockProductScore = {
  productId: "demo-product-123",
  overallScore: 78,
  productDetails: {
    name: "Demo Product - Wireless Headphones",
    url: "https://example.com/product/demo",
    analyzedAt: new Date().toISOString(),
  },
  reviewAnalysis: {
    totalReviews: 1547,
    fakeReviews: 12,
    suspiciousPatterns: 3,
    score: 82,
  },
  imageVerification: {
    totalImages: 45,
    verifiedImages: 43,
    manipulatedImages: 2,
    score: 76,
  },
  sellerCredibility: {
    rating: 4.8,
    verifiedSeller: true,
    accountAge: "3 years",
    score: 85,
  },
}

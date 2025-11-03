package com.satyanetra.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;

public class ScoreResponse {
    private String productId;
    private int overallScore;
    private JsonNode reviewAnalysis;
    private JsonNode imageVerification;
    private JsonNode sellerCredibility;
    private JsonNode productDetails;
    private String[] reasons;

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }
    public JsonNode getReviewAnalysis() { return reviewAnalysis; }
    public void setReviewAnalysis(JsonNode reviewAnalysis) { this.reviewAnalysis = reviewAnalysis; }
    public JsonNode getImageVerification() { return imageVerification; }
    public void setImageVerification(JsonNode imageVerification) { this.imageVerification = imageVerification; }
    public JsonNode getSellerCredibility() { return sellerCredibility; }
    public void setSellerCredibility(JsonNode sellerCredibility) { this.sellerCredibility = sellerCredibility; }
    public JsonNode getProductDetails() { return productDetails; }
    public void setProductDetails(JsonNode productDetails) { this.productDetails = productDetails; }
    public String[] getReasons() { return reasons; }
    public void setReasons(String[] reasons) { this.reasons = reasons; }
}
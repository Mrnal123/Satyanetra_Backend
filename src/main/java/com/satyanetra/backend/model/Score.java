package com.satyanetra.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "scores")
public class Score {
    @Id
    private String id;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "overall_score")
    private Integer overallScore;

    // Store JSON as text; can be upgraded to jsonb in Postgres
    @Column(name = "review_analysis", columnDefinition = "TEXT")
    private String reviewAnalysis;

    @Column(name = "image_verification", columnDefinition = "TEXT")
    private String imageVerification;

    @Column(name = "seller_credibility", columnDefinition = "TEXT")
    private String sellerCredibility;

    @Column(name = "product_details", columnDefinition = "TEXT")
    private String productDetails;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }
    public String getReviewAnalysis() { return reviewAnalysis; }
    public void setReviewAnalysis(String reviewAnalysis) { this.reviewAnalysis = reviewAnalysis; }
    public String getImageVerification() { return imageVerification; }
    public void setImageVerification(String imageVerification) { this.imageVerification = imageVerification; }
    public String getSellerCredibility() { return sellerCredibility; }
    public void setSellerCredibility(String sellerCredibility) { this.sellerCredibility = sellerCredibility; }
    public String getProductDetails() { return productDetails; }
    public void setProductDetails(String productDetails) { this.productDetails = productDetails; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
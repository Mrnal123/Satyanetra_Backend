package com.satyanetra.backend.dto;

public class IngestResponse {
    private String productId;
    private String jobId;

    public IngestResponse() {}
    public IngestResponse(String productId, String jobId) {
        this.productId = productId;
        this.jobId = jobId;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
}
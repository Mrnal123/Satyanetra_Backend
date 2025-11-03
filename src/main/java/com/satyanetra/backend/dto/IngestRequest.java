package com.satyanetra.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class IngestRequest {
    @NotBlank
    private String url;

    @NotBlank
    private String platform;

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
}

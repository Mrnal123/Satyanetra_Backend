package com.satyanetra.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "")
public class ApplicationProperties {
    
    private Frontend frontend;
    private int rateLimitPerMin;
    private Default timeout;
    
    public Frontend getFrontend() {
        return frontend;
    }
    
    public void setFrontend(Frontend frontend) {
        this.frontend = frontend;
    }
    
    public int getRateLimitPerMin() {
        return rateLimitPerMin;
    }
    
    public void setRateLimitPerMin(int rateLimitPerMin) {
        this.rateLimitPerMin = rateLimitPerMin;
    }
    
    public Default getTimeout() {
        return timeout;
    }
    
    public void setTimeout(Default timeout) {
        this.timeout = timeout;
    }
    
    public static class Frontend {
        private String origin;

        public String getOrigin() {
            return origin;
        }

        public void setOrigin(String origin) {
            this.origin = origin;
        }
    }
    
    public static class Default {
        private int timeout;

        public int getTimeout() {
            return timeout;
        }

        public void setTimeout(int timeout) {
            this.timeout = timeout;
        }
    }
}
package com.satyanetra.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppProperties {
    @Value("${frontend.origin:https://satyanetra.vercel.app}")
    private String frontendOrigin;

    @Value("${rate.limit.per.min:3}")
    private int rateLimitPerMin;

    @Value("${default.timeout:60}")
    private int defaultTimeoutSeconds;

    public String getFrontendOrigin() { return frontendOrigin; }
    public int getRateLimitPerMin() { return rateLimitPerMin; }
    public int getDefaultTimeoutSeconds() { return defaultTimeoutSeconds; }
}
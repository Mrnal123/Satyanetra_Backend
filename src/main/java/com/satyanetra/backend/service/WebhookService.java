package com.satyanetra.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

@Service
public class WebhookService {
    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);
    
    @Value("${webhook.ifttt.url}")
    private String iftttWebhookUrl;
    
    private final RestTemplate restTemplate;

    public WebhookService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Async("taskExecutor")
    public void sendAnalysisComplete(String productId, int overallScore, String reason) {
        try {
            Map<String, Object> payload = Map.of(
                "productId", productId,
                "overallScore", overallScore,
                "reason", reason,
                "timestamp", Instant.now().toString()
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            log.debug("Sending webhook to IFTTT for product {}", productId);
            ResponseEntity<String> response = restTemplate.postForEntity(iftttWebhookUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Webhook sent successfully for product {} with score {}", productId, overallScore);
            } else {
                log.warn("Webhook returned non-2xx status: {} for product {}", response.getStatusCode(), productId);
            }
        } catch (Exception e) {
            log.error("Failed to send webhook for product {}: {}", productId, e.getMessage());
        }
    }
}
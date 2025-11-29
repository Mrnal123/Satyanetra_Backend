package com.satyanetra.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;

@Service
public class ReviewSentimentAI {
    private static final Logger log = LoggerFactory.getLogger(ReviewSentimentAI.class);
    private final Random random = new Random();

    public Map<String, Object> analyzeReviews(String productUrl) {
        log.debug("Analyzing review sentiment for product: {}", productUrl);
        
        // Mock AI analysis with random scores as specified
        int score = random.nextInt(26) + 70; // 70-95
        String sentiment = score > 75 ? "Positive" : "Mixed";
        int authenticityRate = random.nextInt(16) + 80; // 80-95
        int totalReviews = random.nextInt(401) + 100; // 100-500
        int fakeReviews = Math.max(0, (int) Math.round(totalReviews * (100 - authenticityRate) / 100.0));
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("score", score);
        result.put("sentiment", sentiment);
        result.put("authenticityRate", authenticityRate);
        result.put("summary", "Mostly genuine reviews");
        result.put("totalReviews", totalReviews);
        result.put("fakeReviews", fakeReviews);
        
        log.debug("Review sentiment analysis completed: {}", result);
        return result;
    }

    // Extended: incorporate fetched counts into result when available
    public Map<String, Object> analyzeReviews(String productUrl, Map<String, Object> fetched) {
        Map<String, Object> base = new java.util.HashMap<>(analyzeReviews(productUrl));
        if (fetched != null) {
            Object total = fetched.get("totalReviews");
            if (total instanceof Number) {
                base.put("totalReviews", ((Number) total).intValue());
            }
            // If we have an approximate rating from fetched, adjust score slightly
            Object approx = fetched.get("scoreApprox");
            if (approx instanceof Number) {
                int approxScore = ((Number) approx).intValue();
                int current = (Integer) base.getOrDefault("score", 0);
                base.put("score", (current + approxScore) / 2);
            }
            // Recompute fakeReviews based on authenticity rate and total
            int totalReviews = (Integer) base.getOrDefault("totalReviews", 0);
            int authenticityRate = (Integer) base.getOrDefault("authenticityRate", 0);
            int fakeReviews = Math.max(0, (int) Math.round(totalReviews * (100 - authenticityRate) / 100.0));
            base.put("fakeReviews", fakeReviews);
        }
        log.debug("Review sentiment (combined) completed: {}", base);
        return base;
    }
}

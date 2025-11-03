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
        
        Map<String, Object> result = Map.of(
            "score", score,
            "sentiment", sentiment,
            "authenticityRate", authenticityRate,
            "summary", "Mostly genuine reviews"
        );
        
        log.debug("Review sentiment analysis completed: {}", result);
        return result;
    }
}
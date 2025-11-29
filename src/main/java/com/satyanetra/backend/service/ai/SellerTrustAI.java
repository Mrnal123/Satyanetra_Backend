package com.satyanetra.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class SellerTrustAI {
    private static final Logger log = LoggerFactory.getLogger(SellerTrustAI.class);

    public Map<String, Object> assessSellerCredibility(String productUrl) {
        log.debug("Assessing seller credibility for product: {}", productUrl);
        
        // Mock seller credibility analysis as specified
        Map<String, Object> historicalData = Map.of(
            "totalSales", 1250,
            "positiveReviews", 1100
        );
        
        boolean verifiedSeller = false; // keep false in mock; can toggle based on rating
        Map<String, Object> result = Map.of(
            "score", 78,
            "rating", "Good",
            "verifiedSeller", verifiedSeller,
            "historicalData", historicalData,
            "summary", "88% positive feedback"
        );
        
        log.debug("Seller credibility assessment completed: {}", result);
        return result;
    }

    // Extended: incorporate fetched seller signals
    public Map<String, Object> assessSellerCredibility(String productUrl, Map<String, Object> fetched) {
        // Use a mutable map to safely apply adjustments from fetched signals
        Map<String, Object> base = new java.util.HashMap<>(assessSellerCredibility(productUrl));
        if (fetched != null) {
            Object verified = fetched.get("verifiedSeller");
            Object ratingPercent = fetched.get("ratingPercent");
            if (verified instanceof Boolean) base.put("verifiedSeller", verified);
            if (ratingPercent instanceof Number) {
                int rp = ((Number) ratingPercent).intValue();
                // Map ratingPercent to textual rating
                String rating = rp >= 90 ? "Excellent" : rp >= 80 ? "Good" : rp >= 70 ? "Average" : "Low";
                base.put("rating", rating);
                // Nudge score towards ratingPercent
                int current = (Integer) base.getOrDefault("score", 0);
                int adjusted = (current + (int)Math.round(rp * 0.8)) / 2;
                base.put("score", adjusted);
            }
        }
        log.debug("Seller credibility (combined) completed: {}", base);
        return base;
    }
}

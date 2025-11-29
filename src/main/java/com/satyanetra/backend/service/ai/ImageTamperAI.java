package com.satyanetra.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class ImageTamperAI {
    private static final Logger log = LoggerFactory.getLogger(ImageTamperAI.class);
    private final Random random = new Random();

    public Map<String, Object> verifyImages(String productUrl) {
        log.debug("Verifying image authenticity for product: {}", productUrl);
        
        // Mock OpenCV image verification as specified
        int score = random.nextInt(11) + 85; // 85-95
        boolean manipulationDetected = false; // Always false for mock
        int confidence = random.nextInt(9) + 90; // 90-98
        int totalImages = random.nextInt(16) + 5; // 5-20
        int verifiedImages = manipulationDetected ? Math.max(0, totalImages - random.nextInt(3)) : totalImages;
        
        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("manipulationDetected", manipulationDetected);
        result.put("confidence", confidence);
        result.put("summary", "Images authentic");
        result.put("totalImages", totalImages);
        result.put("verifiedImages", verifiedImages);
        
        log.debug("Image verification completed: {}", result);
        return result;
    }

    // Extended: incorporate fetched image counts
    public Map<String, Object> verifyImages(String productUrl, Map<String, Object> fetched) {
        Map<String, Object> base = new HashMap<>(verifyImages(productUrl));
        if (fetched != null) {
            Object total = fetched.get("totalImages");
            Object verified = fetched.get("verifiedImages");
            if (total instanceof Number) base.put("totalImages", ((Number) total).intValue());
            if (verified instanceof Number) base.put("verifiedImages", ((Number) verified).intValue());
        }
        log.debug("Image verification (combined) completed: {}", base);
        return base;
    }
}

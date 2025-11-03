package com.satyanetra.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TrustReasoner {
    private static final Logger log = LoggerFactory.getLogger(TrustReasoner.class);

    public Map<String, Object> combineScores(Map<String, Object> reviewAnalysis, 
                                           Map<String, Object> imageVerification, 
                                           Map<String, Object> sellerCredibility) {
        log.debug("Combining scores for trust reasoning");
        
        // Extract scores from each analysis
        int reviewScore = (Integer) reviewAnalysis.get("score");
        int imageScore = (Integer) imageVerification.get("score");
        int sellerScore = (Integer) sellerCredibility.get("score");
        
        // Calculate overall score using weighted formula as specified
        int overallScore = (int) Math.round(0.5 * reviewScore + 0.3 * imageScore + 0.2 * sellerScore);
        
        // Generate reason based on overall score
        String reason = String.format("Overall Trust %d%% – authentic reviews & clean visuals", overallScore);
        
        Map<String, Object> result = Map.of(
            "overallScore", overallScore,
            "reason", reason
        );
        
        log.debug("Trust reasoning completed: {}", result);
        return result;
    }
}
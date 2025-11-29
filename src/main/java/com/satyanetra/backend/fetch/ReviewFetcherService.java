package com.satyanetra.backend.fetch;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReviewFetcherService {
    private static final Logger log = LoggerFactory.getLogger(ReviewFetcherService.class);
    private static final String UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

    public Map<String, Object> fetch(String url) {
        Map<String, Object> data = new HashMap<>();
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(UA)
                    .timeout(15000)
                    .get();

            // Try common selectors for total reviews on Amazon
            int totalReviews = 0;
            String[] selectors = new String[]{
                    "#acrCustomerReviewText", // e.g., "1,234 ratings"
                    "span[data-hook=total-review-count]",
                    "span:matchesOwn((?i)ratings|reviews)"
            };
            for (String sel : selectors) {
                Elements els = doc.select(sel);
                if (!els.isEmpty()) {
                    for (Element e : els) {
                        totalReviews = parseNumber(e.text());
                        if (totalReviews > 0) break;
                    }
                }
                if (totalReviews > 0) break;
            }

            // Star score approximation (extract first star rating text)
            int score = 0;
            Elements starEls = doc.select("span.a-icon-alt, i.a-icon-star, i[data-hook=average-star-rating] span");
            if (!starEls.isEmpty()) {
                String t = starEls.first().text(); // e.g., "4.3 out of 5 stars"
                score = (int) Math.round(parseDecimal(t) / 5.0 * 100);
            }

            data.put("totalReviews", totalReviews);
            data.put("scoreApprox", score);
            log.debug("Fetched reviews: {}", data);
        } catch (Exception e) {
            log.warn("Failed to fetch reviews for {}: {}", url, e.getMessage());
        }
        return data;
    }

    private int parseNumber(String s) {
        try {
            String digits = s.replaceAll("[^0-9]", "");
            if (digits.isBlank()) return 0;
            return Integer.parseInt(digits);
        } catch (Exception e) { return 0; }
    }

    private double parseDecimal(String s) {
        try {
            String dec = s.replaceAll("[^0-9\\.]", "");
            if (dec.isBlank()) return 0.0;
            return Double.parseDouble(dec);
        } catch (Exception e) { return 0.0; }
    }
}


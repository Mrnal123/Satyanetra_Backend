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
public class SellerFetcherService {
    private static final Logger log = LoggerFactory.getLogger(SellerFetcherService.class);
    private static final String UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

    public Map<String, Object> fetch(String url) {
        Map<String, Object> data = new HashMap<>();
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(UA)
                    .timeout(15000)
                    .get();

            // Seller name
            String seller = selectFirstText(doc, "#sellerProfileTriggerId, a[href*='seller'], a:matchesOwn((?i)seller)");
            if (seller == null || seller.isBlank()) seller = "Unknown";

            // Rating text e.g. "4.5 out of 5" or "% positive"
            String ratingText = selectFirstText(doc, "span.a-icon-alt, span:matchesOwn((?i)out of 5), span:matchesOwn((?i)positive)");
            double ratingOutOf5 = parseFirstDecimal(ratingText);
            int ratingPercent = ratingOutOf5 > 0 ? (int)Math.round(ratingOutOf5/5.0*100) : 0;

            boolean verifiedSeller = ratingPercent >= 90; // threshold-based placeholder

            Map<String, Object> historicalData = Map.of(
                    "totalSales", 0,
                    "positiveReviews", 0
            );

            data.put("sellerName", seller);
            data.put("ratingPercent", ratingPercent);
            data.put("verifiedSeller", verifiedSeller);
            data.put("historicalData", historicalData);
            log.debug("Fetched seller: {}", data);
        } catch (Exception e) {
            log.warn("Failed to fetch seller for {}: {}", url, e.getMessage());
        }
        return data;
    }

    private String selectFirstText(Document doc, String css) {
        Elements els = doc.select(css);
        if (!els.isEmpty()) {
            for (Element e : els) {
                String t = e.text();
                if (t != null && !t.isBlank()) return t;
            }
        }
        return null;
    }

    private double parseFirstDecimal(String s) {
        try {
            String dec = s == null ? "" : s.replaceAll("[^0-9\\.]", "");
            if (dec.isBlank()) return 0.0;
            return Double.parseDouble(dec);
        } catch (Exception e) { return 0.0; }
    }
}


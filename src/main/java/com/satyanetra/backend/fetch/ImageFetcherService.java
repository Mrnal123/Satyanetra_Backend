package com.satyanetra.backend.fetch;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ImageFetcherService {
    private static final Logger log = LoggerFactory.getLogger(ImageFetcherService.class);
    private static final String UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

    public Map<String, Object> fetch(String url) {
        Map<String, Object> data = new HashMap<>();
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(UA)
                    .timeout(15000)
                    .get();

            // Count images on page (rough proxy)
            Elements imgs = doc.select("img");
            int totalImages = imgs.size();
            int verifiedImages = totalImages; // no manipulation analysis yet

            data.put("totalImages", totalImages);
            data.put("verifiedImages", verifiedImages);
            log.debug("Fetched images: {}", data);
        } catch (Exception e) {
            log.warn("Failed to fetch images for {}: {}", url, e.getMessage());
        }
        return data;
    }
}


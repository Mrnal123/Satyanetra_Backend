package com.satyanetra.backend.rate;

import com.satyanetra.backend.config.AppProperties;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class IngestRateLimiter {
    private static class Counter {
        long windowEpochMinute;
        int count;
    }

    private final ConcurrentHashMap<String, Counter> counters = new ConcurrentHashMap<>();
    private final int limitPerMinute;

    public IngestRateLimiter(AppProperties props) {
        this.limitPerMinute = props.getRateLimitPerMin();
    }

    public boolean allow(String key) {
        long minute = Instant.now().getEpochSecond() / 60;
        Counter c = counters.computeIfAbsent(key, k -> {
            Counter nc = new Counter();
            nc.windowEpochMinute = minute;
            nc.count = 0;
            return nc;
        });
        synchronized (c) {
            if (c.windowEpochMinute != minute) {
                c.windowEpochMinute = minute;
                c.count = 0;
            }
            if (c.count >= limitPerMinute) {
                return false;
            }
            c.count++;
            return true;
        }
    }
}
//package com.satyanetra.backend.service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.satyanetra.backend.dto.ScoreResponse;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Service;
//
//import java.util.Optional;
//import java.util.concurrent.TimeUnit;
//
//@Service
//@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
//public class RedisCacheService {
//
//    @Autowired(required = false)
//    private RedisTemplate<String, String> redisTemplate;
//    
//    private final ObjectMapper objectMapper = new ObjectMapper();
//    private static final String CACHE_PREFIX = "score:";
//    private static final long TTL_SECONDS = 900; // 15 minutes
//
//    public void cacheScore(String productId, ScoreResponse scoreResponse) {
//        if (redisTemplate == null) return;
//        
//        try {
//            String key = CACHE_PREFIX + productId;
//            String jsonValue = objectMapper.writeValueAsString(scoreResponse);
//            redisTemplate.opsForValue().set(key, jsonValue, TTL_SECONDS, TimeUnit.SECONDS);
//        } catch (Exception e) {
//            // Log error but don't fail the operation
//            System.err.println("Redis cache error: " + e.getMessage());
//        }
//    }
//
//    public Optional<String> getCachedScore(String productId) {
//        if (redisTemplate == null) return Optional.empty();
//        
//        try {
//            String key = CACHE_PREFIX + productId;
//            String cachedValue = redisTemplate.opsForValue().get(key);
//            return Optional.ofNullable(cachedValue);
//        } catch (Exception e) {
//            // Log error but don't fail the operation
//            System.err.println("Redis cache error: " + e.getMessage());
//            return Optional.empty();
//        }
//    }
//
//}
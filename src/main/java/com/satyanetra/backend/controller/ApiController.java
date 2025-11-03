package com.satyanetra.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.satyanetra.backend.dto.*;
import com.satyanetra.backend.model.Job;
import com.satyanetra.backend.model.JobLog;
import com.satyanetra.backend.model.Product;
import com.satyanetra.backend.model.Score;
import com.satyanetra.backend.rate.IngestRateLimiter;
import com.satyanetra.backend.repo.*;
import com.satyanetra.backend.service.AnalyzeProductService;
//import com.satyanetra.backend.service.RedisCacheService;
import com.satyanetra.backend.util.Ids;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final ProductRepository productRepo;
    private final JobRepository jobRepo;
    private final JobLogRepository jobLogRepo;
    private final ScoreRepository scoreRepo;
    private final AnalyzeProductService analyzer;
    private final IngestRateLimiter rateLimiter;
    //private final RedisCacheService redisCacheService;
    private final ObjectMapper mapper = new ObjectMapper();

    public ApiController(ProductRepository productRepo,
                         JobRepository jobRepo,
                         JobLogRepository jobLogRepo,
                         ScoreRepository scoreRepo,
                         AnalyzeProductService analyzer,
                         IngestRateLimiter rateLimiter) {
                         //@Autowired(required = false) RedisCacheService redisCacheService) {
        this.productRepo = productRepo;
        this.jobRepo = jobRepo;
        this.jobLogRepo = jobLogRepo;
        this.scoreRepo = scoreRepo;
        this.analyzer = analyzer;
        this.rateLimiter = rateLimiter;
        //this.redisCacheService = redisCacheService;
    }

    @PostMapping("/ingest")
    @Transactional
    public ResponseEntity<?> ingest(@Valid @RequestBody IngestRequest req, HttpServletRequest http) {
        String clientKey = http.getRemoteAddr();
        if (!rateLimiter.allow(clientKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(java.util.Map.of("error", "rate_limit_exceeded"));
        }

        if (!isValidUrl(req.getUrl())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "invalid_url"));
        }

        Product p = new Product();
        p.setId(Ids.prodId());
        p.setUrl(req.getUrl());
        p.setName("Product from " + req.getPlatform());
        productRepo.save(p);

        Job j = new Job();
        j.setId(Ids.jobId());
        j.setProductId(p.getId());
        j.setStatus("pending");
        j.setProgress(0);
        jobRepo.save(j);

        JobLog log = new JobLog();
        log.setJobId(j.getId());
        log.setMessage("Queued for analysis");
        jobLogRepo.save(log);

        analyzer.analyze(j, p);

        return ResponseEntity.ok(new IngestResponse(p.getId(), j.getId()));
    }

    @GetMapping("/score/status/{jobId}")
    public ResponseEntity<?> status(@PathVariable @NonNull String jobId) {
        Optional<Job> jo = jobRepo.findById(jobId);
        if (jo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", "job_not_found"));
        }
        Job j = jo.get();
        List<JobLog> logs = jobLogRepo.findByJobIdOrderByTimestampAsc(jobId);
        List<String> messages = logs.stream()
                .map(JobLog::getMessage)
                .filter(java.util.Objects::nonNull)
                .toList();
        return ResponseEntity.ok(new StatusResponse(j.getStatus(), j.getProgress(), messages));
    }

    @GetMapping("/score/{productId}")
    public ResponseEntity<?> score(@PathVariable String productId) throws Exception {
        // Redis Cache Node (before DB lookup) - Check cache first if available
        //if (redisCacheService != null) {
        //    Optional<String> cachedScore = redisCacheService.getCachedScore(productId);
        //    if (cachedScore.isPresent()) {
        //        // Return cached JSON directly
        //        JsonNode cachedData = mapper.readTree(cachedScore.get());
        //        return ResponseEntity.ok(cachedData);
        //    }
        //}

        // Cache miss or no cache - fetch from database
        Optional<Score> so = scoreRepo.findByProductId(productId);
        if (so.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", "analysis_not_ready"));
        }
        
        Score s = so.get();
        ScoreResponse resp = new ScoreResponse();
        resp.setProductId(s.getProductId());
        resp.setOverallScore(s.getOverallScore());
        resp.setReviewAnalysis(readJson(s.getReviewAnalysis()));
        resp.setImageVerification(readJson(s.getImageVerification()));
        resp.setSellerCredibility(readJson(s.getSellerCredibility()));
        resp.setProductDetails(readJson(s.getProductDetails()));

        // Enhanced reason generation using AI analysis data
        int overall = s.getOverallScore() != null ? s.getOverallScore() : 0;
        String sentiment = "Positive";
        try {
            JsonNode reviewAnalysis = readJson(s.getReviewAnalysis());
            if (reviewAnalysis.has("sentiment")) {
                sentiment = reviewAnalysis.get("sentiment").asText();
            }
        } catch (Exception e) {
            // Use default sentiment if parsing fails
        }
        
        String reason = String.format("Overall Trust %d%% – authentic reviews & clean visuals. Sentiment: %s", overall, sentiment);
        resp.setReasons(new String[]{ reason });
        
        // Cache the response for future requests if cache is available
        //if (redisCacheService != null) {
        //    redisCacheService.cacheScore(productId, resp);
        //}
        
        return ResponseEntity.ok(resp);
    }

    private boolean isValidUrl(String url) {
        try { URI.create(url); return true; } catch (Exception e) { return false; }
    }

    private JsonNode readJson(String s) throws Exception {
        if (s == null || s.isBlank()) {
            return mapper.nullNode();
        }
        return mapper.readTree(s);
    }
}
package com.satyanetra.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.satyanetra.backend.model.Job;
import com.satyanetra.backend.model.JobLog;
import com.satyanetra.backend.model.Product;
import com.satyanetra.backend.model.Score;
import com.satyanetra.backend.repo.JobLogRepository;
import com.satyanetra.backend.repo.JobRepository;
import com.satyanetra.backend.repo.ScoreRepository;
import com.satyanetra.backend.service.ai.ReviewSentimentAI;
import com.satyanetra.backend.service.ai.ImageTamperAI;
import com.satyanetra.backend.service.ai.SellerTrustAI;
import com.satyanetra.backend.service.ai.TrustReasoner;
import com.satyanetra.backend.util.Ids;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.lang.NonNull;

import java.util.Map;

@Service
public class AnalyzeProductService {
    private static final Logger log = LoggerFactory.getLogger(AnalyzeProductService.class);

    private final JobRepository jobRepository;
    private final JobLogRepository jobLogRepository;
    private final ScoreRepository scoreRepository;
    private final ReviewSentimentAI reviewSentimentAI;
    private final ImageTamperAI imageTamperAI;
    private final SellerTrustAI sellerTrustAI;
    private final TrustReasoner trustReasoner;
    private final WebhookService webhookService;
    private final ObjectMapper mapper = new ObjectMapper();
    private final TransactionTemplate transactionTemplate;

    public AnalyzeProductService(JobRepository jobRepository,
                               JobLogRepository jobLogRepository,
                               ScoreRepository scoreRepository,
                               ReviewSentimentAI reviewSentimentAI,
                               ImageTamperAI imageTamperAI,
                               SellerTrustAI sellerTrustAI,
                               TrustReasoner trustReasoner,
                               WebhookService webhookService,
                               @NonNull PlatformTransactionManager transactionManager) {
        this.jobRepository = jobRepository;
        this.jobLogRepository = jobLogRepository;
        this.scoreRepository = scoreRepository;
        this.reviewSentimentAI = reviewSentimentAI;
        this.imageTamperAI = imageTamperAI;
        this.sellerTrustAI = sellerTrustAI;
        this.trustReasoner = trustReasoner;
        this.webhookService = webhookService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Async("taskExecutor")
    public void analyze(Job job, Product product) {
        try {
            log.debug("Starting analysis for job {} and product {}", job.getId(), product.getId());
            
            // Start → Update job(status=processing, p=0)
            transactionTemplate.execute(status -> {
                job.setStatus("processing");
                job.setProgress(0);
                jobRepository.save(job);
                addLog(job.getId(), "Starting analysis");
                return null;
            });
            
            // Logs+Waits → Fetching product data
            log.debug("Fetching product data");
            updateJobProgress(job, 20, "Fetching product data");
            sleep(1500);

            // ReviewSentimentAI Node
            log.debug("Analyzing reviews with AI");
            updateJobProgress(job, 35, "Analyzing reviews with AI");
            Map<String, Object> reviewAnalysis = reviewSentimentAI.analyzeReviews(product.getUrl());
            sleep(1000);

            // ImageTamperAI Node
            log.debug("Verifying images with AI");
            updateJobProgress(job, 55, "Verifying images with AI");
            Map<String, Object> imageVerification = imageTamperAI.verifyImages(product.getUrl());
            sleep(1000);

            // SellerTrustAI Node
            log.debug("Checking seller credibility with AI");
            updateJobProgress(job, 75, "Checking seller credibility with AI");
            Map<String, Object> sellerCredibility = sellerTrustAI.assessSellerCredibility(product.getUrl());
            sleep(1000);

            // TrustReasoner Node
            log.debug("Combining scores with trust reasoner");
            updateJobProgress(job, 90, "Combining scores with trust reasoner");
            Map<String, Object> trustReasoning = trustReasoner.combineScores(reviewAnalysis, imageVerification, sellerCredibility);
            int overallScore = (Integer) trustReasoning.get("overallScore");
            String reason = (String) trustReasoning.get("reason");
            sleep(500);

            // Product details
            // Product details
            Map<String, Object> productDetails = Map.of(
                    "name", product.getName() != null ? product.getName() : "Product",
                    "url", product.getUrl(),
                    "analyzedAt", System.currentTimeMillis()
            );

            // Insert scores (JSON) → Update job(status=completed, p=100)
            transactionTemplate.execute(status -> {
                Score score = new Score();
                score.setId(Ids.scoreId());
                score.setProductId(product.getId());
                score.setOverallScore(overallScore);
                try {
                    score.setReviewAnalysis(writeJson(reviewAnalysis));
                    score.setImageVerification(writeJson(imageVerification));
                    score.setSellerCredibility(writeJson(sellerCredibility));
                    score.setProductDetails(writeJson(productDetails));
                } catch (Exception e) {
                    log.error("Error serializing score data: {}", e.getMessage());
                    status.setRollbackOnly();
                    return null;
                }
                scoreRepository.save(score);

                job.setStatus("completed");
                job.setProgress(100);
                jobRepository.save(job);
                addLog(job.getId(), "Analysis completed");
                
                log.debug("Analysis completed for job {} with score {}", job.getId(), overallScore);
                return null;
            });

            // Webhook Node → End
            log.debug("Sending webhook notification");
            webhookService.sendAnalysisComplete(product.getId(), overallScore, reason);
            
        } catch (Exception e) {
            log.error("Error analyzing product: {}", e.getMessage(), e);
            transactionTemplate.execute(status -> {
                job.setStatus("failed");
                jobRepository.save(job);
                addLog(job.getId(), "Analysis failed: " + e.getMessage());
                return null;
            });
        }
    }

    private void updateJobProgress(Job job, int progress, String message) {
        transactionTemplate.execute(status -> {
            job.setProgress(progress);
            jobRepository.save(job);
            addLog(job.getId(), message);
            return null;
        });
    }

    private void addLog(String jobId, String message) {
        JobLog log = new JobLog();
        log.setJobId(jobId);
        log.setMessage(message);
        jobLogRepository.save(log);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String writeJson(Object obj) throws Exception {
        return mapper.writeValueAsString(obj);
    }
}
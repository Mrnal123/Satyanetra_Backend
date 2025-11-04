package com.satyanetra.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.satyanetra.backend.config.AppProperties;
import com.satyanetra.backend.dto.IngestRequest;
import com.satyanetra.backend.model.Job;
import com.satyanetra.backend.model.JobLog;
import com.satyanetra.backend.model.Product;
import com.satyanetra.backend.rate.IngestRateLimiter;
import com.satyanetra.backend.repo.JobLogRepository;
import com.satyanetra.backend.repo.JobRepository;
import com.satyanetra.backend.repo.ProductRepository;
import com.satyanetra.backend.repo.ScoreRepository;
import com.satyanetra.backend.service.AnalyzeProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApiController.class)
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductRepository productRepo;

    @MockitoBean
    private JobRepository jobRepo;

    @MockitoBean
    private JobLogRepository jobLogRepo;

    @MockitoBean
    private ScoreRepository scoreRepo;

    @MockitoBean
    private AnalyzeProductService analyzer;

    @MockitoBean
    private IngestRateLimiter rateLimiter;

    @MockitoBean
    private AppProperties appProperties;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ingest_whenNewUrl_shouldReturnOk() throws Exception {
        // Arrange
        when(appProperties.getRateLimitPerMin()).thenReturn(3);
        when(appProperties.getDefaultTimeoutSeconds()).thenReturn(60);
        when(rateLimiter.allow(anyString())).thenReturn(true);
        when(productRepo.findByUrl(anyString())).thenReturn(Optional.empty());

        // Mock the saved product (will have a generated ID)
        Product savedProduct = new Product();
        savedProduct.setId("prod_generated_id");
        savedProduct.setUrl("https://example.com");
        savedProduct.setName("Product from test");
        when(productRepo.save(any(Product.class))).thenReturn(savedProduct);

        // Mock the saved job (will have a generated ID)
        Job savedJob = new Job();
        savedJob.setId("job_generated_id");
        savedJob.setProductId(savedProduct.getId());
        savedJob.setStatus("pending");
        savedJob.setProgress(0);
        when(jobRepo.save(any(Job.class))).thenReturn(savedJob);

        // Mock job log save (called in controller)
        when(jobLogRepo.save(any(JobLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mock analyzer (called in controller)
        // Note: analyzer.analyze() is void, so we just verify it's called

        IngestRequest ingestRequest = new IngestRequest();
        ingestRequest.setUrl("https://example.com");
        ingestRequest.setPlatform("test");

        // Act & Assert
        mockMvc.perform(post("/api/ingest")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(ingestRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").exists())
                .andExpect(jsonPath("$.jobId").exists());
    }
}
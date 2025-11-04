package com.satyanetra.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.satyanetra.backend.config.AppProperties;
import com.satyanetra.backend.dto.IngestRequest;
import com.satyanetra.backend.model.Job;
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
        when(appProperties.getRateLimitPerMin()).thenReturn(3);
        when(appProperties.getDefaultTimeoutSeconds()).thenReturn(60);
        when(rateLimiter.allow(anyString())).thenReturn(true);
        when(productRepo.findByUrl(anyString())).thenReturn(Optional.empty());

        Product savedProduct = new Product();
        savedProduct.setId("prod_920c0d66-6ee7-4f46-862c-9072a62b5257");
        savedProduct.setUrl("https://example.com");
        when(productRepo.save(any(Product.class))).thenReturn(savedProduct);

        Job savedJob = new Job();
        savedJob.setId("job_7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p");
        savedJob.setProductId(savedProduct.getId());
        when(jobRepo.save(any(Job.class))).thenReturn(savedJob);

        IngestRequest ingestRequest = new IngestRequest();
        ingestRequest.setUrl("https://example.com");
        ingestRequest.setPlatform("test");

        mockMvc.perform(post("/api/ingest")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(ingestRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").exists())
                .andExpect(jsonPath("$.jobId").exists());
    }
}
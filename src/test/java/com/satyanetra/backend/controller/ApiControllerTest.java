package com.satyanetra.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApiController.class)
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductRepository productRepo;

    @MockBean
    private JobRepository jobRepo;

    @MockBean
    private JobLogRepository jobLogRepo;

    @MockBean
    private ScoreRepository scoreRepo;

    @MockBean
    private AnalyzeProductService analyzer;

    @MockBean
    private IngestRateLimiter rateLimiter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ingest_whenNewUrl_shouldReturnOk() throws Exception {
        when(rateLimiter.allow(any())).thenReturn(true);
        when(productRepo.findByUrl(any())).thenReturn(Optional.empty());

        Product savedProduct = new Product();
        savedProduct.setId("prod_123");
        savedProduct.setUrl("https://example.com");
        when(productRepo.save(any(Product.class))).thenReturn(savedProduct);

        Job savedJob = new Job();
        savedJob.setId("job_456");
        savedJob.setProductId(savedProduct.getId());
        when(jobRepo.save(any(Job.class))).thenReturn(savedJob);

        IngestRequest ingestRequest = new IngestRequest();
        ingestRequest.setUrl("https://example.com");
        ingestRequest.setPlatform("test");

        mockMvc.perform(post("/api/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ingestRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod_123"))
                .andExpect(jsonPath("$.jobId").value("job_456"));
    }
}
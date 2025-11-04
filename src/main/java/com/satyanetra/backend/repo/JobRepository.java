package com.satyanetra.backend.repo;

import com.satyanetra.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, String> {
    Optional<Job> findFirstByProductIdOrderByIdDesc(String productId);
}
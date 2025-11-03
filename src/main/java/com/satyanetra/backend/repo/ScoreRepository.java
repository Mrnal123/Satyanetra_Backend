package com.satyanetra.backend.repo;

import com.satyanetra.backend.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ScoreRepository extends JpaRepository<Score, String> {
    Optional<Score> findByProductId(String productId);
}
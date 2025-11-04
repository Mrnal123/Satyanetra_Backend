package com.satyanetra.backend.repo;

import com.satyanetra.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findByUrl(String url);
}
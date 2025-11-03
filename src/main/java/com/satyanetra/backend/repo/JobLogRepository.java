package com.satyanetra.backend.repo;

import com.satyanetra.backend.model.JobLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobLogRepository extends JpaRepository<JobLog, Long> {
    List<JobLog> findByJobIdOrderByTimestampAsc(String jobId);
}
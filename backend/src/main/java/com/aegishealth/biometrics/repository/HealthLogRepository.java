package com.aegishealth.biometrics.repository;

import com.aegishealth.biometrics.entity.HealthLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthLogRepository extends JpaRepository<HealthLog, Long> {

    List<HealthLog> findByUserIdOrderByCreatedAtDesc(String userId);

    List<HealthLog> findByUserIdAndCategoryOrderByCreatedAtDesc(String userId, String category);
}

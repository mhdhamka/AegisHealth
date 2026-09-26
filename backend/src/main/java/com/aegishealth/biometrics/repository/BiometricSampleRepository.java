package com.aegishealth.biometrics.repository;

import com.aegishealth.biometrics.entity.BiometricSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface BiometricSampleRepository extends JpaRepository<BiometricSample, Long> {

    List<BiometricSample> findByUserIdAndTimestampBetweenOrderByTimestampAsc(
            String userId, Instant start, Instant end);

    @Query("SELECT b FROM BiometricSample b WHERE b.userId = :userId ORDER BY b.timestamp DESC LIMIT 1")
    BiometricSample findLatestByUserId(String userId);

    @Query("SELECT b FROM BiometricSample b WHERE b.userId = :userId AND b.hasAnomaly = true ORDER BY b.timestamp DESC")
    List<BiometricSample> findAnomaliesByUserId(String userId);
}

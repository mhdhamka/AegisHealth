package com.aegishealth.biometrics.service;

import com.aegishealth.biometrics.dto.*;
import com.aegishealth.biometrics.entity.BiometricSample;
import com.aegishealth.biometrics.entity.HealthLog;
import com.aegishealth.biometrics.repository.BiometricSampleRepository;
import com.aegishealth.biometrics.repository.HealthLogRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core business service for biometric calculations, autonomic trends, and biomarker logs.
 */
@Service
public class BiometricsService {

    private final BiometricSampleRepository biometricRepo;
    private final HealthLogRepository healthLogRepo;

    public BiometricsService(BiometricSampleRepository biometricRepo, HealthLogRepository healthLogRepo) {
        this.biometricRepo = biometricRepo;
        this.healthLogRepo = healthLogRepo;
    }

    @Cacheable(value = "biometrics_summary", key = "#userId")
    public BiometricsSummaryResponse computeDailySummary(String userId) {
        BiometricSample latest = biometricRepo.findLatestByUserId(userId);
        
        return BiometricsSummaryResponse.builder()
                .status("success")
                .timestamp(Instant.now().toString())
                .restingHeartRate(latest != null ? latest.getRestingHeartRate() : 51)
                .hrvRmssd(latest != null ? latest.getHrvRmssd() : 78.0)
                .bloodPressure(latest != null ? latest.getSystolicBp() + "/" + latest.getDiastolicBp() + " mmHg" : "116/72 mmHg")
                .spo2Percent(latest != null ? latest.getSpo2Percent() : 98.4)
                .fastingGlucose(latest != null ? latest.getGlucoseMgDl() : 88.0)
                .recoveryScore(latest != null ? latest.getRecoveryScore() : 84)
                .strainScore(latest != null ? latest.getStrainScore() : 14.8)
                .vo2Max(54.8)
                .build();
    }

    @Cacheable(value = "biometrics_timeseries", key = "#userId + '_' + #range")
    public List<BiometricPointDto> getTimeSeriesData(String userId, String range) {
        Instant end = Instant.now();
        Instant start = switch (range) {
            case "7d" -> end.minus(7, ChronoUnit.DAYS);
            case "30d" -> end.minus(30, ChronoUnit.DAYS);
            default -> end.minus(24, ChronoUnit.HOURS);
        };

        List<BiometricSample> samples = biometricRepo.findByUserIdAndTimestampBetweenOrderByTimestampAsc(userId, start, end);
        
        return samples.stream().map(s -> BiometricPointDto.builder()
                .timestamp(s.getTimestamp().toString())
                .timeLabel(s.getTimestamp().toString().substring(11, 16))
                .dateLabel(s.getTimestamp().toString().substring(5, 10))
                .heartRate(s.getHeartRate())
                .restingHeartRate(s.getRestingHeartRate())
                .hrv(s.getHrvRmssd())
                .systolic(s.getSystolicBp())
                .diastolic(s.getDiastolicBp())
                .spo2(s.getSpo2Percent())
                .glucose(s.getGlucoseMgDl())
                .respiratoryRate(s.getRespiratoryRate())
                .steps(s.getSteps())
                .activeCalories(s.getActiveCalories())
                .strain(s.getStrainScore())
                .recoveryScore(s.getRecoveryScore())
                .hasAnomaly(s.getHasAnomaly())
                .anomalyNote(s.getAnomalyNote())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"biometrics_summary", "biometrics_timeseries"}, allEntries = true)
    public HealthLog recordBiomarkerLog(String userId, CreateHealthLogRequest request) {
        HealthLog log = HealthLog.builder()
                .userId(userId)
                .category(request.getCategory())
                .title(request.getTitle())
                .metric(request.getMetric())
                .value(request.getValue())
                .unit(request.getUnit())
                .referenceRange(request.getReferenceRange())
                .status(request.getStatus() != null ? request.getStatus() : "nominal")
                .source(request.getSource() != null ? request.getSource() : "Manual Entry")
                .notes(request.getNotes())
                .createdAt(Instant.now())
                .build();

        return healthLogRepo.save(log);
    }
}

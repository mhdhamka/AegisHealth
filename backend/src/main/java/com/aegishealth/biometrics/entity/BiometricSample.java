package com.aegishealth.biometrics.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * High-frequency time-series biometric telemetry point stored in PostgreSQL.
 */
@Entity
@Table(name = "biometric_samples", indexes = {
    @Index(name = "idx_user_timestamp", columnList = "userId, timestamp DESC"),
    @Index(name = "idx_user_metric", columnList = "userId, heartRate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BiometricSample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String userId;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private Integer heartRate;

    private Integer restingHeartRate;

    private Double hrvRmssd;

    private Integer systolicBp;

    private Integer diastolicBp;

    private Double spo2Percent;

    private Double glucoseMgDl;

    private Double respiratoryRate;

    private Integer steps;

    private Integer activeCalories;

    private Double strainScore;

    private Integer recoveryScore;

    private Boolean hasAnomaly;

    @Column(length = 255)
    private String anomalyNote;
}

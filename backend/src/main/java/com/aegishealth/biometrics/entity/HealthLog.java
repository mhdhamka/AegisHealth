package com.aegishealth.biometrics.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Structured clinical biomarker log and lab panel record stored in PostgreSQL.
 */
@Entity
@Table(name = "health_logs", indexes = {
    @Index(name = "idx_log_user_cat", columnList = "userId, category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String userId;

    @Column(nullable = false, length = 32)
    private String category; // vitals, labs, activity, symptoms, medication, nutrition

    @Column(nullable = false, length = 128)
    private String title;

    @Column(nullable = false, length = 64)
    private String metric;

    @Column(nullable = false, length = 64)
    private String value;

    @Column(length = 32)
    private String unit;

    @Column(length = 64)
    private String referenceRange;

    @Column(length = 32)
    private String status; // optimal, nominal, elevated, abnormal

    @Column(length = 128)
    private String source;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Instant createdAt;
}

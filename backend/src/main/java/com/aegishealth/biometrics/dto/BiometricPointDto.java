package com.aegishealth.biometrics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiometricPointDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String timestamp;
    private String timeLabel;
    private String dateLabel;
    private Integer heartRate;
    private Integer restingHeartRate;
    private Double hrv;
    private Integer systolic;
    private Integer diastolic;
    private Double spo2;
    private Double glucose;
    private Double respiratoryRate;
    private Integer steps;
    private Integer activeCalories;
    private Double strain;
    private Integer recoveryScore;
    private Boolean hasAnomaly;
    private String anomalyNote;
}

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
public class BiometricsSummaryResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String status;
    private String timestamp;
    private Integer restingHeartRate;
    private Double hrvRmssd;
    private String bloodPressure;
    private Double spo2Percent;
    private Double fastingGlucose;
    private Integer recoveryScore;
    private Double strainScore;
    private Double vo2Max;
}
